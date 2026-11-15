#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""V8 EP01~03: preserve narration, synthesize Qwen3-TTS locally and publish MP3."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import wave
from datetime import datetime, timezone
from pathlib import Path

THIS = Path(__file__).resolve()
V8_ROOT = THIS.parents[1]
REPO = V8_ROOT.parents[1]
AUDIO = V8_ROOT / "audio"
OUTPUT = THIS.parent / "output"
DEFAULT_MODEL = "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
TITLES = {
    "01": "K2 흑표 전차 · 중국·폴란드 반응",
    "02": "현대 전기차 · 중국 차주 8점",
    "03": "한국 가전 · 중국 OEM 논쟁과 LG",
}


def sha(data: str) -> str:
    return hashlib.sha256(data.encode("utf-8")).hexdigest()


def get_source(episode: str) -> tuple[list[str], str]:
    if episode == "01":
        path = V8_ROOT / "handoff" / "EP01_EDIT_MASTER.md"
        content = path.read_text(encoding="utf-8")
        match = re.search(
            r"(?ms)^## 7\. 한국어 전체 10분 목표 대본[^\n]*\n(.*?)(?=^## 8\.)",
            content,
        )
        if not match:
            raise ValueError("EP01 원고 섹션(7~8)을 찾지 못했습니다.")
        sections = re.split(r"(?m)^### CUT \d{2}[^\n]*\n", match.group(1))
        paragraphs = [s.strip() for s in sections if s.strip()]
        if len(paragraphs) != 30:
            raise ValueError(f"EP01 원문 문단 수 불일치: {len(paragraphs)} (기대 30)")
        return paragraphs, str(path.relative_to(REPO))
    path = V8_ROOT / ("ep" + episode + ".js")
    source = path.read_text(encoding="utf-8").strip()
    prefix = "window.FRV8_EP" + episode + "="
    if not source.startswith(prefix):
        raise ValueError(f"EP{episode} 대본 JS 형식이 예상과 다릅니다.")
    data = json.loads(source[len(prefix):].rstrip("; \r\n"))
    hooks = data.get("hook5", [])
    acts = data.get("acts", [])
    if len(hooks) != 5 or len(acts) != 8:
        raise ValueError(f"EP{episode} 훅5·8단 서사 불일치")
    paragraphs = [str(s).strip() for s in hooks]
    for act in acts:
        lines = act.get("paras", [])
        if len(lines) != 4:
            raise ValueError(f"EP{episode} ACT에 문단 4개가 없습니다.")
        paragraphs.extend(str(s).strip() for s in lines)
    if len(paragraphs) != 37 or any(not x for x in paragraphs):
        raise ValueError(f"EP{episode} 원고 문단 누락 ({len(paragraphs)})")
    return paragraphs, str(path.relative_to(REPO))


def make_chunks(paragraphs: list[str], limit: int) -> list[str]:
    """Split on sentence ends or spaces without discarding any narration."""
    chunks: list[str] = []
    for paragraph in paragraphs:
        sentences = re.split(r"(?<=[.!?。！？])\s+", paragraph.strip())
        buf = ""
        for sentence in sentences:
            sentence = sentence.strip()
            if not sentence:
                continue
            if len(sentence) <= limit:
                if buf and len(buf) + 1 + len(sentence) > limit:
                    chunks.append(buf)
                    buf = ""
                buf = (buf + " " + sentence).strip()
                continue
            if buf:
                chunks.append(buf)
                buf = ""
            # An unusually long sentence is divided on word boundaries.
            words = sentence.split()
            acc = ""
            for word in words:
                if len(word) > limit:
                    raise ValueError(f"한 단어가 {limit}자를 초과합니다: {word[:30]}")
                if acc and len(acc) + 1 + len(word) > limit:
                    chunks.append(acc)
                    acc = ""
                acc = (acc + " " + word).strip()
            if acc:
                chunks.append(acc)
        if buf:
            chunks.append(buf)
    return chunks


def duration_wav(path: Path) -> float:
    with wave.open(str(path), "rb") as w:
        return w.getnframes() / w.getframerate()


def merge_wavs(paths: list[Path], output: Path, pause_ms: int) -> float:
    if not paths:
        raise ValueError("합칠 WAV 파일이 없습니다.")
    output.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(paths[0]), "rb") as first:
        conf = first.getparams()
    with wave.open(str(output), "wb") as dest:
        dest.setnchannels(conf.nchannels)
        dest.setsampwidth(conf.sampwidth)
        dest.setframerate(conf.framerate)
        frames = 0
        for index, file in enumerate(paths):
            with wave.open(str(file), "rb") as src:
                p = src.getparams()
                if (p.nchannels, p.sampwidth, p.framerate) != (
                    conf.nchannels, conf.sampwidth, conf.framerate
                ):
                    raise ValueError(f"서로 다른 WAV 포맷: {file}")
                while True:
                    block = src.readframes(131072)
                    if not block:
                        break
                    dest.writeframes(block)
                frames += p.nframes
            if index < len(paths) - 1 and pause_ms:
                silence_frames = round(conf.framerate * pause_ms / 1000)
                dest.writeframes(b"\x00" * silence_frames * conf.nchannels * conf.sampwidth)
                frames += silence_frames
    return frames / conf.framerate


def model_load(model_name: str, allow_download: bool, device: str):
    if not allow_download:
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
    try:
        import torch
        from qwen_tts import Qwen3TTSModel
    except ImportError as e:
        raise RuntimeError(
            "qwen_tts 또는 torch를 찾지 못했습니다. 기존 Qwen3-TTS 가상환경 "
            "Python으로 실행하세요. 예: PYTHON_BIN=/path/to/venv/bin/python bash ..."
        ) from e
    use_gpu = torch.cuda.is_available() and device != "cpu"
    device_map = "cuda:0" if use_gpu else "cpu"
    print(f"[모델] {model_name} / {device_map} / GPU_VISIBLE={os.environ.get('CUDA_VISIBLE_DEVICES', 'unset')}", flush=True)
    if device == "cuda" and not use_gpu:
        raise RuntimeError("CUDA GPU가 보이지 않습니다. CUDA_VISIBLE_DEVICES와 드라이버를 확인하세요.")
    try:
        tts = Qwen3TTSModel.from_pretrained(
            model_name,
            device_map=device_map,
            dtype=torch.bfloat16 if use_gpu else torch.float32,
            attn_implementation="sdpa",
        )
    except Exception as e:
        raise RuntimeError(
            f"모델 로딩 실패: {e}\n현재 설정은 다운로드를 막습니다. "
            "모델이 캐시에 없다면 --allow-download 또는 --model /로컬/모델경로 사용."
        ) from e
    speakers = tts.get_supported_speakers()
    if speakers and not any(s.lower() == "sohee" for s in speakers):
        raise RuntimeError(f"모델이 Sohee를 지원하지 않습니다: {speakers}")
    return tts


def synthesize(tts, chunk: str, dest: Path) -> None:
    try:
        import soundfile as sf
        audio, sr = tts.generate_custom_voice(
            text=chunk,
            language="Korean",
            speaker="Sohee",
            non_streaming_mode=True,
            max_new_tokens=2048,
        )
        if not audio or len(audio[0]) < int(sr * 0.15):
            raise RuntimeError("TTS 생성된 오디오가 비어 있습니다.")
        temp = dest.with_name(dest.stem + ".tmp.wav")
        sf.write(str(temp), audio[0], sr, subtype="PCM_16")
        if duration_wav(temp) < 0.15:
            raise RuntimeError("비정상적으로 짧은 오디오")
        temp.replace(dest)
    except Exception:
        dest.with_name(dest.stem + ".tmp.wav").unlink(missing_ok=True)
        raise


def encode_mp3(wav: Path, out: Path, bitrate: str) -> None:
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg가 없습니다. sudo apt install ffmpeg")
    temp = out.with_suffix(".tmp.mp3")
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(wav), "-vn", "-ac", "1", "-ar", "24000",
        "-codec:a", "libmp3lame", "-b:a", bitrate, str(temp),
    ]
    try:
        subprocess.run(cmd, check=True)
        if temp.stat().st_size < 10000:
            raise RuntimeError("생성된 MP3 크기가 비정상적으로 작습니다.")
        temp.replace(out)
    finally:
        temp.unlink(missing_ok=True)


def publish(episodes: list[str]) -> None:
    if not shutil.which("git"):
        raise RuntimeError("git 명령이 없습니다.")
    def run(*args: str, capture: bool = False):
        return subprocess.run(
            ["git", "-C", str(REPO), *args], check=True,
            text=True, capture_output=capture,
        )
    branch = run("branch", "--show-current", capture=True).stdout.strip()
    if branch != "main":
        raise RuntimeError(f"현재 브랜치 {branch!r}: main에서만 발행하도록 제한했습니다.")
    if run("diff", "--cached", "--name-only", capture=True).stdout.strip():
        raise RuntimeError("기존에 스테이징된 변경이 있습니다. 다른 변경사항 보호를 위해 자동 발행을 중단합니다.")
    files = [str((AUDIO / ("EP" + ep + ".mp3")).relative_to(REPO)) for ep in episodes]
    files.append(str((AUDIO / "manifest.json").relative_to(REPO)))
    run("add", "--", *files)
    if not run("diff", "--cached", "--name-only", capture=True).stdout.strip():
        print("[발행] 이미 최신 MP3가 커밋되어 있습니다.")
        return
    run("commit", "-m", "Publish locally generated Korean TTS MP3 for EP" + "-".join(episodes))
    run("push", "origin", "main")
    print("[배포] git push 성공. GitHub Pages 배포 후 대시보드 새로고침하세요.")


def main() -> None:
    p = argparse.ArgumentParser(description="Ubuntu GPU1: 3 V8 episode narration MP3 batch")
    p.add_argument("--episodes", nargs="+", choices=sorted(TITLES), default=["01", "02", "03"])
    p.add_argument("--dry-run", action="store_true", help="원고 추출만 확인, 음성 합성 없음")
    p.add_argument("--publish", action="store_true", help="완성 MP3+manifest만 git commit/push")
    p.add_argument("--force", action="store_true", help="기존 완성 MP3도 다시 합성")
    p.add_argument("--allow-download", action="store_true", help="모델이 없다면 Hugging Face에서 다운로드 허용")
    p.add_argument("--model", default=DEFAULT_MODEL, help="HF model ID 또는 로컬 CustomVoice 경로")
    p.add_argument("--device", choices=["auto", "cuda", "cpu"], default="cuda")
    p.add_argument("--limit", type=int, default=125, help="TTS 한 청크 최대 글자 수")
    p.add_argument("--pause-ms", type=int, default=180, help="청크 사이의 묵음 밀리초")
    p.add_argument("--bitrate", choices=["96k", "128k", "192k"], default="128k")
    args = p.parse_args()
    if args.dry_run and args.publish:
        p.error("--dry-run과 --publish는 동시에 사용할 수 없습니다.")
    if args.limit < 35 or args.pause_ms < 0 or args.pause_ms > 1500:
        p.error("청크 길이 또는 묵음 값이 비정상적입니다.")
    sources = {}
    for ep in args.episodes:
        paragraphs, source = get_source(ep)
        chunks = make_chunks(paragraphs, args.limit)
        text = "\n".join(paragraphs)
        if len(chunks) < 25:
            raise RuntimeError(f"EP{ep} 문단 일부만 추출된 것 같습니다 ({len(chunks)}청크).")
        sources[ep] = {
            "title": TITLES[ep], "paragraphs": len(paragraphs),
            "chunks": chunks, "text": text, "sha256": sha(text), "source": source,
        }
        print(f"EP{ep} {TITLES[ep]}: {len(paragraphs)}문단, {len(chunks)}청크, {len(text):,}자")
    if args.dry_run:
        print("DRY RUN PASS: TTS·파일 수정·git push 없음.")
        return
    if not shutil.which("ffmpeg"):
        raise RuntimeError("ffmpeg 설치가 필요합니다. sudo apt install ffmpeg")
    AUDIO.mkdir(parents=True, exist_ok=True)
    manifest_path = AUDIO / "manifest.json"
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (FileNotFoundError, ValueError):
        manifest = {}
    manifest.setdefault("schema", 1)
    manifest.setdefault("episodes", {})
    model = None
    for ep in args.episodes:
        src = sources[ep]
        mp3 = AUDIO / f"EP{ep}.mp3"
        current = manifest["episodes"].get(ep, {})
        if (
            not args.force and mp3.is_file() and mp3.stat().st_size > 10000
            and current.get("ready") is True and current.get("source_sha256") == src["sha256"]
            and current.get("model") == args.model
            and current.get("bitrate") == args.bitrate
        ):
            print(f"EP{ep}: 기존 MP3와 원고 SHA 일치, 합성 생략.")
            continue
        if model is None:
            model = model_load(args.model, args.allow_download, args.device)
        path = OUTPUT / f"EP{ep}" / "chunks"
        path.mkdir(parents=True, exist_ok=True)
        wavs = []
        for idx, chunk in enumerate(src["chunks"], 1):
            wav = path / f"{idx:04d}-{sha(args.model + '|Sohee|' + chunk)[:12]}.wav"
            if args.force or not wav.is_file() or wav.stat().st_size < 10000:
                print(f"EP{ep}: TTS {idx}/{len(src['chunks'])}", flush=True)
                synthesize(model, chunk, wav)
            if duration_wav(wav) < 0.15:
                raise RuntimeError(f"EP{ep} chunk {idx} 비정상 오디오")
            wavs.append(wav)
        master = OUTPUT / f"EP{ep}" / "narration_master.wav"
        sec = merge_wavs(wavs, master, args.pause_ms)
        encode_mp3(master, mp3, args.bitrate)
        info = {
            "ready": True, "title": src["title"], "path": f"EP{ep}.mp3",
            "duration_seconds": round(sec, 2), "bytes": mp3.stat().st_size,
            "source": src["source"], "source_sha256": src["sha256"],
            "model": args.model, "speaker": "Sohee", "language": "Korean",
            "bitrate": args.bitrate, "chunks": len(wavs),
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "review_status": "TTS generated; human pronunciation and factual QC pending",
        }
        manifest["episodes"][ep] = info
        print(f"EP{ep}: {sec/60:.2f}분 / {info['bytes']/1048576:.1f} MiB / {mp3}")
        with tempfile.NamedTemporaryFile(
            "w", encoding="utf-8", dir=AUDIO, suffix=".tmp", delete=False
        ) as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)
            f.write("\n")
            tmp = Path(f.name)
        tmp.replace(manifest_path)
    if args.publish:
        publish(args.episodes)
    else:
        print("로컬 MP3 합성 완료. 대시보드 공개를 원하면 같은 명령에 --publish를 추가하세요.")
    print("각 EP 파일은 사용자 원고의 '나레이션만' 합성했으며 외국인 실제 원음은 합성하지 않았습니다.")


if __name__ == "__main__":
    try:
        main()
    except (OSError, ValueError, RuntimeError, subprocess.CalledProcessError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        sys.exit(1)
