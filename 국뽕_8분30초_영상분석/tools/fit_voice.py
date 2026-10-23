"""컷마다 앞뒤 무음을 다듬고, 5초보다 길면 속도를 올려 5초 슬롯에 맞춘다. (정확히 5.000초 wav)"""
import os
import subprocess
import tempfile

import numpy as np
import soundfile as sf

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(W, "voice", "raw")
FIT = os.path.join(W, "voice", "fit")
SLOT = 5.0
LEAD = 0.12
TAIL = 0.08
os.makedirs(FIT, exist_ok=True)


def atempo(y, sr, tempo):
    with tempfile.TemporaryDirectory() as td:
        a, b = os.path.join(td, "a.wav"), os.path.join(td, "b.wav")
        sf.write(a, y, sr)
        p = subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-i", a, "-af", f"atempo={tempo:.4f}", b],
            stdin=subprocess.DEVNULL, capture_output=True,
            creationflags=subprocess.CREATE_NO_WINDOW, timeout=120,
        )
        if p.returncode != 0:
            raise RuntimeError(p.stderr.decode("utf-8", "replace")[-400:])
        z, _ = sf.read(b)
        return z


report = []
for no in range(1, 103):
    x, sr = sf.read(os.path.join(RAW, f"{no:03d}.wav"))
    if x.ndim > 1:
        x = x.mean(axis=1)
    peak = float(np.abs(x).max())
    idx = np.where(np.abs(x) > 0.02 * peak)[0]
    s = max(int(idx[0]) - int(0.05 * sr), 0)
    e = min(int(idx[-1]) + int(0.12 * sr), len(x))
    y = x[s:e]
    dur = len(y) / sr
    avail = SLOT - LEAD - TAIL
    tempo = 1.0
    if dur > avail:
        tempo = dur / avail
        y = atempo(y, sr, tempo)
    out = np.zeros(int(round(SLOT * sr)), dtype=np.float32)
    start = int(LEAD * sr)
    n = min(len(y), len(out) - start)
    out[start:start + n] = y[:n]
    sf.write(os.path.join(FIT, f"{no:03d}.wav"), out, sr)
    report.append((no, dur, tempo))

durs = [d for _, d, _ in report]
tempos = [t for _, _, t in report]
print("cuts", len(report), "sr", sr)
print("speech sec min/mean/max", round(min(durs), 2), round(sum(durs) / len(durs), 2), round(max(durs), 2))
print("sped up", sum(t > 1 for t in tempos), "max tempo", round(max(tempos), 3))
print("over 1.25x:", [(n, round(t, 2)) for n, _, t in report if t > 1.25])
print("under 2.0s (너무 짧음):", [(n, round(d, 2)) for n, d, _ in report if d < 2.0])
