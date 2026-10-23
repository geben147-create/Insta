"""생성한 음성을 다시 받아써서 대본과 얼마나 같은지 점수를 낸다. (시스템 파이썬, faster-whisper medium)"""
import difflib
import os
import re
import sys

from faster_whisper import WhisperModel

from common import parse_rows

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(W, "voice", "raw")
MODEL = r"C:\Users\llorr\.cache\huggingface\hub\models--Systran--faster-whisper-medium\snapshots\08e178d48790749d25932bbc082711ddcfdfbc4f"
OUT = os.path.join(W, "voice", "check.tsv")


def norm(s):
    return re.sub(r"[^0-9A-Za-z가-힣]", "", s)


only = {int(a) for a in sys.argv[1:]}
model = WhisperModel(MODEL, device="cpu", compute_type="int8", cpu_threads=8)
rows = []
for r in parse_rows():
    if only and r["no"] not in only:
        continue
    path = os.path.join(RAW, f"{r['no']:03d}.wav")
    if not os.path.exists(path):
        continue
    segs, _ = model.transcribe(path, language="ko", beam_size=3)
    heard = " ".join(s.text.strip() for s in segs)
    score = difflib.SequenceMatcher(None, norm(r["text"]), norm(heard)).ratio()
    rows.append((r["no"], score, r["text"], heard))
    print(f"{r['no']:03d} {score:.2f}", flush=True)

with open(OUT, "a" if only else "w", encoding="utf-8") as f:
    for no, score, want, heard in rows:
        f.write(f"{no:03d}\t{score:.3f}\t{want}\t{heard}\n")
low = [(no, round(sc, 2)) for no, sc, _, _ in rows if sc < 0.85]
print("평균", round(sum(sc for _, sc, _, _ in rows) / max(len(rows), 1), 3), "낮은 컷(<0.85)", low)
