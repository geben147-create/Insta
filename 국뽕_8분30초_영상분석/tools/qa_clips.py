"""완성된 클립 컷(seg)에서 0.3/2.5/4.7초 프레임을 뽑아 큰 시트로 만든다. (시청자가 실제로 보게 될 화면)"""
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw, ImageFont

from common import parse_rows

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEG = os.path.join(W, "seg")
OUT = os.path.join(W, "review", "qa_clips")
os.makedirs(OUT, exist_ok=True)

only = {int(a) for a in sys.argv[1:]}
clips = [r for r in parse_rows() if r["kind"] == "CLIP" and (not only or r["no"] in only)]


def grab(job):
    no, k, t = job
    out = os.path.join(OUT, f"{no:03d}_{k}.jpg")
    p = subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-ss", str(t), "-i", os.path.join(SEG, f"{no:03d}.mp4"),
         "-frames:v", "1", "-vf", "scale=480:270", out],
        stdin=subprocess.DEVNULL, capture_output=True, creationflags=subprocess.CREATE_NO_WINDOW, timeout=120)
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode("utf-8", "replace")[-300:])
    return no, k, out


jobs = [(r["no"], k, t) for r in clips for k, t in enumerate((0.3, 2.5, 4.7))]
with ThreadPoolExecutor(8) as ex:
    got = {(no, k): out for no, k, out in ex.map(grab, jobs)}

font = ImageFont.load_default()
per = 6  # 시트당 6컷 (3프레임 x 2컷 x 3줄)
for s in range(0, len(clips), per):
    chunk = clips[s:s + per]
    # 한 줄에 한 컷(3프레임), 줄 높이 270+10
    sheet = Image.new("RGB", (1440, len(chunk) * 280), (0, 0, 0))
    d = ImageDraw.Draw(sheet)
    for i, r in enumerate(chunk):
        for k in range(3):
            sheet.paste(Image.open(got[(r["no"], k)]), (k * 480, i * 280 + 10))
        d.rectangle((0, i * 280, 420, i * 280 + 10), fill=(0, 0, 0))
        d.text((4, i * 280), f"#{r['no']:03d} {r['src']} | {r['text'][:34]}", fill=(255, 255, 0), font=font)
    sheet.save(os.path.join(W, "review", f"qa_clips_{s // per + 1}.png"))
print("sheets", (len(clips) + per - 1) // per)
