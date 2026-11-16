#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Make REAL Korean Edge-TTS MP3 files from script sections.
Video IDs, clip editing notes, and source descriptions are never synthesized.
Run: python3 edge_tts_generate.py
Requires: pip install edge-tts ; ffmpeg and ffprobe available on PATH.
"""
import argparse
import asyncio
import json
import subprocess
from pathlib import Path
import edge_tts

ROOT = Path(__file__).resolve().parent
AUDIO = ROOT / "audio"
AUDIO.mkdir(parents=True, exist_ok=True)
VOICE = "ko-KR-InJoonNeural"
RATE = "+0%"
SCRIPT_IDS = ("ep03", "ep04")

def ffprobe_duration(filename):
    proc = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(filename)],
        text=True, capture_output=True, check=True,
    )
    return round(float(proc.stdout.strip()), 2)

async def synthesize_episode(ep):
    payload = json.loads((ROOT / "data" / (ep + ".json")).read_text(encoding="utf-8"))
    lines = payload["sections"]
    if len(lines) != 8 or not all(isinstance(x,str) and x.strip() for x in lines):
        raise ValueError(f"{ep}: 8 nonempty narration sections expected")
    part_files=[]
    for index, line in enumerate(lines, 1):
        mp3 = AUDIO / f"{ep}_section_{index:02d}.mp3"
        part_files.append(mp3)
        if mp3.exists() and mp3.stat().st_size > 2000:
            print("already recorded", mp3.name, flush=True)
            continue
        print("Edge-TTS generating", mp3.name, "Korean narration chars", len(line), flush=True)
        for retry in range(3):
            try:
                await edge_tts.Communicate(text=line, voice=VOICE, rate=RATE).save(str(mp3))
                if mp3.stat().st_size < 2000:
                    raise IOError("output too small")
                break
            except Exception as exc:
                if mp3.exists():
                    mp3.unlink()
                if retry == 2:
                    raise
                print("retry", retry+1, repr(exc), flush=True)
                await asyncio.sleep(3 + retry*3)
    concat_file=AUDIO / (ep + "_concat.txt")
    concat_file.write_text("\n".join("file '"+str(f.resolve()).replace("'", "'\\''")+"'" for f in part_files)+"\n",encoding="utf-8")
    original=AUDIO / (ep + "_original.mp3")
    fast=AUDIO / (ep + "_1.2.mp3")
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat",
         "-safe", "0", "-i", str(concat_file), "-c", "copy", str(original)],
        check=True,
    )
    subprocess.run(
        ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(original),
         "-filter:a", "atempo=1.2", "-codec:a", "libmp3lame", "-b:a",
         "192k", str(fast)],
        check=True,
    )
    result={
        "id":ep.upper(), "title":payload["title"], "voice":VOICE, "rate":"1.2x",
        "original_seconds":ffprobe_duration(original),
        "fast_seconds":ffprobe_duration(fast),
        "all_8_sections_seconds":[ffprobe_duration(f) for f in part_files],
        "file":fast.name,
        "narration_chars":sum(len(x) for x in lines),
        "note":"Narration only; unconfirmed foreign reactions and footage are excluded.",
    }
    print("EPISODE_DONE",json.dumps(result,ensure_ascii=False),flush=True)
    concat_file.unlink(missing_ok=True)
    original.unlink(missing_ok=True)
    return result

async def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--only", nargs="*", default=list(SCRIPT_IDS), choices=SCRIPT_IDS)
    args=parser.parse_args()
    metadata=[]
    for ep in args.only:
        metadata.append(await synthesize_episode(ep))
    (AUDIO / "manifest.json").write_text(
        json.dumps({"episodes":metadata,"generator":"edge-tts","verification":"actual ffprobe durations"},ensure_ascii=False,indent=2),
        encoding="utf-8")
    for m in metadata:
        if not (850 <= m["fast_seconds"] <= 1200):
            print("LENGTH_REVIEW",m["id"],m["fast_seconds"],"seconds. Re-edit before final 17m claim.",flush=True)

if __name__=="__main__":
    asyncio.run(main())
