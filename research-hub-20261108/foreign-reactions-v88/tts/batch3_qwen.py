#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Offline-first Qwen3-TTS Korean Sohee batch: FRV8.9 EP01-EP03.

Reads ONLY episode.chapters[].text from the repository data.js.
Writes narration MP3 and a verified playback manifest; does not upload itself.
No paid APIs or cloud TTS. Optional --allow-download permits Hugging Face model fetch.
"""
from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile


HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent
DATA_JS = PROJECT / "data.js"
DEFAULT_AUDIO = PROJECT / "audio"
DEFAULT_WORK = Path.home() / "ai-work" / "jobs" / "foreign-reactions-v89-tts"


def source_data():
    raw = DATA_JS.read_text(encoding="utf-8")
    match = re.fullmatch(
        r"\s*window\.FOREIGN_REACTION_LAB\s*=\s*(\{.*\})\s*;\s*",
        raw,
        re.DOTALL,
    )
    if match is None:
        raise RuntimeError(f"data.js JSON 구조를 읽지 못했습니다: {DATA_JS}")
    payload = json.loads(match.group(1))
    episodes = {e["ep"]: e for e in payload["episodes"]}
    # V10 new episodes have their own JSON-in-JS loader. Read data, never execute JS.
    v10_path = PROJECT / "episodes-v10.js"
    if v10_path.exists():
        extra = v10_path.read_text(encoding="utf-8")
        new_match = re.search(
            r"window\.FOREIGN_V10_DATA\s*=\s*(\{.*?\})\s*;\s*\n\(function",
            extra, re.DOTALL,
        )
        if new_match is None:
            raise RuntimeError(f"V10 신규 대본 데이터 파싱 실패: {v10_path}")
        new_payload = json.loads(new_match.group(1))
        for e in new_payload.get("episodes", []):
            if e["ep"] in episodes:
                raise RuntimeError(f"신규 회차가 기존 회차와 중복됩니다: {e['ep']}")
            episodes[e["ep"]] = e
    return episodes


def normalize_number(value: str) -> str:
    value = value.removeprefix("EP").strip()
    if not value.isdigit():
        raise ValueError(f"회차 번호가 아닙니다: {value}")
    return f"{int(value):02d}"


def split_text(text: str, max_chars: int) -> list[str]:
    """Keep Korean punctuation and whole words; never synthesize metadata."""
    sentences = re.split(r"(?<=[.!?。！？])\s+", " ".join(text.split()))
    pieces: list[str] = []
    buf = ""

    def flush():
        nonlocal buf
        if buf:
            pieces.append(buf)
            buf = ""

    for sentence in sentences:
        if not sentence:
            continue
        if len(sentence) <= max_chars:
            candidate = (buf + " " + sentence).strip()
            if len(candidate) <= max_chars:
                buf = candidate
            else:
                flush()
                buf = sentence
            continue
        flush()
        words = sentence.split()
        for word in words:
            if len(word) > max_chars:
                flush()
                pieces.extend(word[i:i + max_chars] for i in range(0, len(word), max_chars))
                continue
            candidate = (buf + " " + word).strip()
            if len(candidate) > max_chars:
                flush()
                buf = word
            else:
                buf = candidate
        flush()
    flush()
    return [p for p in pieces if p.strip()]


def resolve_model(model_arg: str, allow_download: bool) -> str:
    if model_arg != "auto":
        if Path(model_arg).expanduser().exists():
            return str(Path(model_arg).expanduser().resolve())
        if model_arg.startswith("Qwen/") and allow_download:
            return model_arg
        if model_arg.startswith("Qwen/"):
            return model_arg  # HF_HUB_OFFLINE=1 prevents network downloads.
        raise RuntimeError(f"지정한 모델 경로가 존재하지 않습니다: {model_arg}")

    for env in ("QWEN_TTS_MODEL", "QWEN_TTS_MODEL_DIR"):
        if os.getenv(env):
            return resolve_model(os.environ[env], allow_download)

    hf_home = Path(os.getenv("HF_HOME", str(Path.home() / ".cache" / "huggingface")))
    hf_cache = Path(os.getenv("HF_HUB_CACHE", str(hf_home / "hub")))
    # Prefer the lighter model on a busy 2-GPU workstation; either supports Sohee.
    for model_name in (
        "Qwen3-TTS-12Hz-0.6B-CustomVoice",
        "Qwen3-TTS-12Hz-1.7B-CustomVoice",
    ):
        snapshots = hf_cache / f"models--Qwen--{model_name}" / "snapshots"
        if snapshots.is_dir():
            candidates = [p for p in snapshots.iterdir() if p.is_dir() and (p / "config.json").exists()]
            if candidates:
                return str(sorted(candidates, key=lambda p: p.stat().st_mtime)[-1])
    if allow_download:
        return "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
    raise RuntimeError(
        "로컬 Qwen CustomVoice 모델을 찾지 못했습니다. "
        "QWEN_TTS_MODEL=/절대/경로 를 지정하거나, "
        "최초 1회 허용 시 --allow-download 옵션을 사용하세요."
    )


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def media_duration(path: Path) -> float:
    completed = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
    )
    return float(completed.stdout.strip())


def create_mp3(voice_model, *, ep: dict, model_id: str, args, work: Path, audio_dir: Path):
    import numpy as np
    import soundfile as sf

    number = ep["ep"]
    chapter_texts = [ch["text"].strip() for ch in ep["chapters"]]
    if len(chapter_texts) != 10 or not all(chapter_texts):
        raise RuntimeError(f"EP{number}: 챕터 10개의 본문이 모두 있어야 합니다.")
    digest = hashlib.sha256("\n".join(chapter_texts).encode("utf-8")).hexdigest()

    cache_dir = work / f"EP{number}" / "chunks"
    cache_dir.mkdir(parents=True, exist_ok=True)
    all_parts: list[np.ndarray] = []
    checkpoints = []
    sample_rate = None
    total_chunks = sum(len(split_text(ch, args.max_chars)) for ch in chapter_texts)
    processed = 0
    position_samples = 0

    for chapter_idx, text in enumerate(chapter_texts, 1):
        chapter_start_samples = position_samples
        for part in split_text(text, args.max_chars):
            processed += 1
            key = hashlib.sha256(
                (model_id + "\n" + args.speaker + "\nKorean\n" + part).encode("utf-8")
            ).hexdigest()[:18]
            cache = cache_dir / f"{processed:04d}_{key}.wav"
            if cache.is_file() and cache.stat().st_size > 1000:
                wave, sr = sf.read(str(cache), dtype="float32")
                print(f"  EP{number} {processed:03d}/{total_chunks}: cached")
            else:
                print(f"  EP{number} {processed:03d}/{total_chunks}: synthesize {len(part)} chars", flush=True)
                generated, sr = voice_model.generate_custom_voice(
                    text=part, language="Korean", speaker=args.speaker
                )
                wave = np.asarray(generated[0], dtype=np.float32).reshape(-1)
                if wave.size == 0 or not np.isfinite(wave).all():
                    raise RuntimeError(f"EP{number} 오디오 생성 실패: chunk {processed}")
                sf.write(str(cache), wave, sr, subtype="PCM_16")

            wave = np.asarray(wave, dtype=np.float32).reshape(-1)
            if sample_rate is None:
                sample_rate = int(sr)
            if int(sr) != sample_rate:
                raise RuntimeError(f"샘플레이트가 다릅니다: {sr} vs {sample_rate}")
            if len(wave) < sample_rate // 4:
                raise RuntimeError(f"EP{number} chunk {processed}가 0.25초보다 짧습니다.")

            all_parts.append(wave)
            position_samples += len(wave)
            silence = np.zeros(round(sample_rate * args.sentence_gap), dtype=np.float32)
            all_parts.append(silence)
            position_samples += len(silence)

        # Chapter gaps are longer than sentence gaps.
        extra = max(0.0, args.chapter_gap - args.sentence_gap)
        gap = np.zeros(round(sample_rate * extra), dtype=np.float32)
        all_parts.append(gap)
        position_samples += len(gap)
        checkpoints.append({
            "chapter": chapter_idx,
            "title": ep["chapters"][chapter_idx - 1]["title"],
            "start_sec": round(chapter_start_samples / sample_rate, 2),
            "end_sec": round(position_samples / sample_rate, 2),
        })
    if sample_rate is None:
        raise RuntimeError(f"EP{number}: 합성된 음성이 없습니다.")
    audio_dir.mkdir(parents=True, exist_ok=True)
    wav_path = work / f"EP{number}" / "narration_master.wav"
    wav_path.parent.mkdir(parents=True, exist_ok=True)
    sf.write(str(wav_path), np.concatenate(all_parts), sample_rate, subtype="PCM_16")

    temp_mp3 = audio_dir / f".EP{number}.mp3.tmp"
    final_mp3 = audio_dir / f"EP{number}.mp3"
    cmd = [
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
        "-i", str(wav_path),
        "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-ar", "24000", "-ac", "1", "-c:a", "libmp3lame",
        "-b:a", args.bitrate, "-f", "mp3", str(temp_mp3)
    ]
    try:
        subprocess.run(cmd, check=True)
        if not temp_mp3.exists() or temp_mp3.stat().st_size < 100_000:
            raise RuntimeError(f"EP{number}: 생성된 MP3가 비정상적으로 작습니다.")
        dur = media_duration(temp_mp3)
        if dur < 30:
            raise RuntimeError(f"EP{number}: 재생 길이가 {dur:.1f}초로 비정상입니다.")
        # Do not create an MP3 or ready manifest entry when narration is too short.
        if dur <= args.min_duration_sec:
            raise RuntimeError(
                f"EP{number}: MP3 실제 {dur:.1f}초, 최소 {args.min_duration_sec:.0f}초 초과 조건 FAIL. "
                "본문 내용을 보강한 뒤 재합성하세요. 무음으로 길이만 채우지 마세요."
            )
        temp_mp3.replace(final_mp3)
    finally:
        temp_mp3.unlink(missing_ok=True)

    result = {
        "status": "ready",
        "src": f"audio/EP{number}.mp3",
        "title": ep["title"],
        "duration_sec": round(dur, 2),
        "size_bytes": final_mp3.stat().st_size,
        "sha256": sha256_file(final_mp3),
        "script_sha256": digest,
        "model": model_id,
        "speaker": args.speaker,
        "language": "Korean",
        "sample_rate_hz": 24000,
        "audio_codec": "MP3",
        "generated_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "chapters": checkpoints,
    }
    print(f"✅ EP{number}: {dur/60:.1f}분 MP3 {final_mp3.stat().st_size/1024/1024:.1f} MiB")
    return result


def main() -> int:
    p = argparse.ArgumentParser(description="V8.9 EP01~03 Qwen3 Korean MP3 batch (offline-first)")
    p.add_argument("--episodes", nargs="+", default=["01", "02", "03"])
    p.add_argument("--model", default="auto", help="로컬 CustomVoice 디렉터리 또는 Qwen 모델 ID")
    p.add_argument("--speaker", default="Sohee")
    p.add_argument("--device", default="cuda:0", help="CUDA_VISIBLE_DEVICES 적용 이후 논리 GPU")
    p.add_argument("--max-chars", type=int, default=120)
    p.add_argument("--sentence-gap", type=float, default=0.22)
    p.add_argument("--chapter-gap", type=float, default=0.65)
    p.add_argument("--bitrate", default="112k")
    p.add_argument("--workdir", type=Path, default=DEFAULT_WORK)
    p.add_argument("--output", type=Path, default=DEFAULT_AUDIO)
    p.add_argument("--allow-download", action="store_true")
    p.add_argument("--min-duration-sec", type=float, default=0, help="실제 MP3 길이가 이 초를 초과해야 PASS (EP11~20은 541 사용)")
    p.add_argument("--dry-run", action="store_true")
    args = p.parse_args()

    if not 60 <= args.max_chars <= 240:
        p.error("--max-chars는 60~240 사이여야 합니다.")
    if args.sentence_gap < 0 or args.chapter_gap < args.sentence_gap:
        p.error("문장/챕터 간격을 확인하세요.")
    ids = [normalize_number(v) for v in args.episodes]
    if len(ids) != len(set(ids)):
        p.error("중복 회차를 지정할 수 없습니다.")
    episodes = source_data()
    for id_ in ids:
        if id_ not in episodes:
            p.error(f"EP{id_}는 data.js에 없습니다.")
        ep = episodes[id_]
        count = sum(len(split_text(x["text"], args.max_chars)) for x in ep["chapters"])
        length = sum(len(x["text"]) for x in ep["chapters"])
        print(f"EP{id_} · {ep['title']} · 원고 {length:,}자 · {count}개 음성 조각", flush=True)
    if args.dry_run:
        print("DRY RUN PASS · 모델 로딩/다운로드/파일 변경/게시하지 않았습니다.")
        return 0

    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        raise RuntimeError("ffmpeg/ffprobe가 없습니다: sudo apt install ffmpeg")
    if not args.allow_download:
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
    model_id = resolve_model(args.model, args.allow_download)
    import torch
    from qwen_tts import Qwen3TTSModel
    if args.device.startswith("cuda") and not torch.cuda.is_available():
        raise RuntimeError("Qwen TTS용 NVIDIA GPU가 없습니다. CUDA_VISIBLE_DEVICES / nvidia-smi 확인.")
    dtype = torch.bfloat16 if args.device.startswith("cuda") else torch.float32
    print(f"⚙️ Loading CustomVoice {model_id} · {args.device} · {args.speaker}", flush=True)
    model = Qwen3TTSModel.from_pretrained(
        model_id, device_map=args.device, dtype=dtype
    )
    speakers = model.get_supported_speakers()
    if speakers and args.speaker.lower() not in {str(s).lower() for s in speakers}:
        raise RuntimeError(f"화자 {args.speaker}를 이 모델에서 지원하지 않습니다: {speakers}")

    results = {}
    for id_ in ids:
        ep = episodes[id_]
        results[id_] = create_mp3(
            model, ep=ep, model_id=model_id, args=args,
            work=args.workdir.expanduser(), audio_dir=args.output.expanduser(),
        )
        # Save each completed episode so an interruption does not lose the manifest.
        manifest_path = args.output.expanduser() / "manifest.json"
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except (FileNotFoundError, json.JSONDecodeError):
            manifest = {"schema": 1, "episodes": {}}
        manifest.setdefault("episodes", {}).update({id_: results[id_]})
        manifest["schema"] = 1
        manifest["updated_utc"] = dt.datetime.now(dt.timezone.utc).isoformat()
        fd, tmp_name = tempfile.mkstemp(prefix=".manifest_", suffix=".json", dir=manifest_path.parent)
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(manifest, stream, ensure_ascii=False, indent=2)
            stream.write("\n")
        os.replace(tmp_name, manifest_path)

    print("✅ MP3 생성 완료. 대시보드 재생은 GitHub에 audio/ 파일이 게시된 후 활성화됩니다.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as err:
        print(f"❌ 배치 중단: {type(err).__name__}: {err}", file=sys.stderr)
        sys.exit(1)
