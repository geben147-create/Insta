"""음성 102컷을 이어 붙여 소리를 고르게 맞추고, 컷 영상 102개와 합쳐 최종 MP4를 만든다."""
import os
import subprocess
import sys

import numpy as np
import soundfile as sf

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FIT = os.path.join(W, "voice", "fit")
SEG = os.path.join(W, "seg")
OUT = sys.argv[1]


def run(cmd, timeout=1800):
    p = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True,
                       creationflags=subprocess.CREATE_NO_WINDOW, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode("utf-8", "replace")[-800:])


parts = []
for no in range(1, 103):
    x, sr = sf.read(os.path.join(FIT, f"{no:03d}.wav"), dtype="float32")
    parts.append(x)
voice = np.concatenate(parts)
raw_wav = os.path.join(W, "voice", "voice_all.wav")
sf.write(raw_wav, voice, sr)
print("voice sec", round(len(voice) / sr, 3))

norm_wav = os.path.join(W, "voice", "voice_norm.wav")
run(["ffmpeg", "-v", "error", "-y", "-i", raw_wav, "-af",
     "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "48000", "-ac", "1", norm_wav])

lst = os.path.join(W, "seg", "list.txt")
with open(lst, "w", encoding="utf-8") as f:
    for no in range(1, 103):
        f.write("file '" + os.path.join(SEG, f"{no:03d}.mp4").replace("\\", "/") + "'\n")

run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-i", norm_wav,
     "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
     "-movflags", "+faststart", OUT])
print("saved", OUT)
