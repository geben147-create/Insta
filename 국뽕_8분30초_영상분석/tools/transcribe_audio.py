"""소스 영상 4개의 소리를 영어로 받아써서 SRT/TXT로 저장한다. (CPU, 낮은 우선순위: 음성 생성을 방해하지 않도록)"""
import glob
import os
import sys

import psutil
from faster_whisper import WhisperModel

AUDIO_DIR = sys.argv[1]
OUT_DIR = sys.argv[2]

psutil.Process().nice(psutil.BELOW_NORMAL_PRIORITY_CLASS)

snap = glob.glob(os.path.expanduser(r"~\.cache\huggingface\hub\models--Systran--faster-whisper-small\snapshots\*\model.bin"))[0]
model = WhisperModel(os.path.dirname(snap), device="cpu", compute_type="int8", cpu_threads=6)


def ts(t):
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


for name in ("BIRTH", "BTS_RETURN", "GANGNAM", "BTS_ARG"):
    files = glob.glob(os.path.join(AUDIO_DIR, name + ".*"))
    if not files:
        print(name, "오디오 없음", flush=True)
        continue
    segs, info = model.transcribe(files[0], language="en", beam_size=1, vad_filter=True)
    rows = [(s.start, s.end, s.text.strip()) for s in segs if s.text.strip()]
    with open(os.path.join(OUT_DIR, f"{name}.en.srt"), "w", encoding="utf-8") as f:
        for i, (a, b, t) in enumerate(rows, 1):
            f.write(f"{i}\n{ts(a)} --> {ts(b)}\n{t}\n\n")
    with open(os.path.join(OUT_DIR, f"{name}.en.txt"), "w", encoding="utf-8") as f:
        for a, b, t in rows:
            m, s = divmod(int(a), 60)
            f.write(f"[{m:02d}:{s:02d}] {t}\n")
    print(name, "구간", len(rows), "길이(초)", round(info.duration), flush=True)
print("ALL_DONE", flush=True)
