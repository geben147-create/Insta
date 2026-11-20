#!/usr/bin/env python3
"""Produce a preview or full Korean MP3 using a locally installed Qwen3-TTS.
No publishing, privilege changes or model downloads occur by default.
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path


def split_text(text: str, limit: int) -> list[str]:
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()
    parts = re.split(r"(?<=[.!?。！？])\s+|\n+", text)
    chunks: list[str] = []
    current = ""
    for part in parts:
        part = part.strip()
        if not part:
            continue
        while len(part) > limit:
            at = part.rfind(" ", 0, limit + 1)
            if at < limit // 3:
                at = limit
            head, part = part[:at].strip(), part[at:].strip()
            if current:
                chunks.append(current)
                current = ""
            if head:
                chunks.append(head)
        if not part:
            continue
        if len(current) + len(part) + 1 <= limit:
            current = (current + " " + part).strip()
        else:
            if current:
                chunks.append(current)
            current = part
    if current:
        chunks.append(current)
    return chunks


def main() -> int:
    parser = argparse.ArgumentParser(description="Qwen3-TTS Korean MP3 generator")
    parser.add_argument("--text", type=Path, default=Path("guide_narration.txt"))
    parser.add_argument("--out", type=Path, default=Path("preview.mp3"))
    parser.add_argument("--full", action="store_true", help="Generate entire text (default only first 350 characters)")
    parser.add_argument("--preview-chars", type=int, default=350)
    parser.add_argument("--chunk-chars", type=int, default=155)
    parser.add_argument("--speaker", default="Sohee")
    parser.add_argument("--model", help="Local Qwen3 model directory or installed HF model ID")
    parser.add_argument("--clone-audio", type=Path, help="Reference WAV of your own voice")
    parser.add_argument("--clone-text", help="Exact transcript of the reference WAV")
    parser.add_argument("--allow-model-download", action="store_true", help="Explicitly allow fetching missing model weights")
    parser.add_argument("--dry-run", action="store_true", help="Only inspect chunks; do not load the model")
    args = parser.parse_args()
    if not 60 <= args.chunk_chars <= 400:
        parser.error("--chunk-chars must be between 60 and 400")
    if args.clone_audio and (not args.clone_audio.is_file() or not args.clone_text):
        parser.error("--clone-audio must exist and --clone-text must exactly transcribe it")
    if args.clone_text and not args.clone_audio:
        parser.error("--clone-text requires --clone-audio")
    if not args.text.is_file():
        parser.error(f"Text file not found: {args.text}")
    content = args.text.read_text(encoding="utf-8").strip()
    if not content:
        parser.error("Input text is empty")
    if not args.full:
        content = content[:args.preview_chars]
    chunks = split_text(content, args.chunk_chars)
    print(f"Mode: {'FULL' if args.full else 'PREVIEW'}; {len(content)} chars; {len(chunks)} chunks")
    for index, chunk in enumerate(chunks[:3], 1):
        print(f"  {index:02d}: {chunk[:100]}")
    if args.dry_run:
        print("DRY RUN complete. No audio or system changes.")
        return 0
    if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
        parser.error("ffmpeg and ffprobe are required")
    if not args.allow_model_download:
        os.environ["HF_HUB_OFFLINE"] = "1"
        os.environ["TRANSFORMERS_OFFLINE"] = "1"
    try:
        import torch
        import soundfile as sf
        from qwen_tts import Qwen3TTSModel
    except ImportError as e:
        parser.error(f"Activate the existing Qwen3-TTS Python environment first: {e}")
    if not torch.cuda.is_available():
        parser.error("CUDA GPU not available: check GPU assignment before generating")
    model_name = args.model or (
        "Qwen/Qwen3-TTS-12Hz-1.7B-Base" if args.clone_audio
        else "Qwen/Qwen3-TTS-12Hz-0.6B-CustomVoice"
    )
    print(f"Loading {model_name}. CUDA_VISIBLE_DEVICES={os.environ.get('CUDA_VISIBLE_DEVICES', 'not set')}")
    model = Qwen3TTSModel.from_pretrained(
        model_name, device_map="cuda:0", dtype=torch.bfloat16, attn_implementation="sdpa"
    )
    voice_prompt = None
    if args.clone_audio:
        voice_prompt = model.create_voice_clone_prompt(
            ref_audio=str(args.clone_audio.resolve()),
            ref_text=args.clone_text,
            x_vector_only_mode=False,
        )
    target = args.out.resolve()
    target.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="qwen3-guide-") as folder:
        work = Path(folder)
        names = []
        sample_rate = None
        for index, chunk in enumerate(chunks, 1):
            if voice_prompt is not None:
                wavs, rate = model.generate_voice_clone(
                    text=chunk, language="Korean", voice_clone_prompt=voice_prompt
                )
            else:
                wavs, rate = model.generate_custom_voice(
                    text=chunk, language="Korean", speaker=args.speaker
                )
            if sample_rate is None:
                sample_rate = rate
            if rate != sample_rate:
                raise RuntimeError(f"Sample rate changed at chunk {index}")
            name = f"part_{index:05d}.wav"
            sf.write(str(work / name), wavs[0], rate, subtype="PCM_16")
            names.append(name)
            print(f"Generated chunk {index}/{len(chunks)}")
        (work / "segments.txt").write_text(
            "".join(f"file '{name}'\n" for name in names), encoding="utf-8"
        )
        subprocess.run(
            [
                "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
                "-f", "concat", "-safe", "0", "-i", "segments.txt",
                "-c:a", "libmp3lame", "-b:a", "96k", str(target),
            ],
            cwd=work, check=True,
        )
    info = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration,size",
         "-of", "default=noprint_wrappers=1", str(target)],
        check=True, capture_output=True, text=True,
    )
    print("OUTPUT:", target)
    print(info.stdout)
    print("Listen and check pronunciation before uploading to a public repository.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
