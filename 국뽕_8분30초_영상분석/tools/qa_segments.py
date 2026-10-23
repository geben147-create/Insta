"""컷 영상 102개의 길이·프레임 수를 확인하고 가운데 프레임 모음 시트를 만든다."""
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw, ImageFont

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEG = os.path.join(W, "seg")
QA = os.path.join(W, "review", "qa")
os.makedirs(QA, exist_ok=True)


def run(cmd, timeout=120):
    p = subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True,
                       creationflags=subprocess.CREATE_NO_WINDOW, timeout=timeout)
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode("utf-8", "replace")[-300:])
    return p.stdout


def probe(no):
    path = os.path.join(SEG, f"{no:03d}.mp4")
    out = run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
               "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames,duration,codec_name,pix_fmt",
               "-of", "json", path])
    s = json.loads(out)["streams"][0]
    frame = os.path.join(QA, f"{no:03d}.jpg")
    run(["ffmpeg", "-v", "error", "-y", "-ss", "2.5", "-i", path, "-frames:v", "1",
         "-vf", "scale=160:90", frame])
    return no, s


missing = [n for n in range(1, 103) if not os.path.exists(os.path.join(SEG, f"{n:03d}.mp4"))]
print("missing", missing)
with ThreadPoolExecutor(8) as ex:
    results = list(ex.map(probe, [n for n in range(1, 103) if n not in missing]))

bad = []
kinds = set()
for no, s in results:
    kinds.add((s["codec_name"], s["width"], s["height"], s["r_frame_rate"], s["pix_fmt"]))
    if int(s["nb_read_frames"]) != 150:
        bad.append((no, s["nb_read_frames"]))
print("규격 종류", kinds)
print("프레임 수 150 아님", bad)

font = ImageFont.load_default()
cols, rows_n = 12, 9
sheet = Image.new("RGB", (cols * 160, rows_n * 90), (0, 0, 0))
d = ImageDraw.Draw(sheet)
for no, _ in results:
    i = no - 1
    x, y = (i % cols) * 160, (i // cols) * 90
    sheet.paste(Image.open(os.path.join(QA, f"{no:03d}.jpg")), (x, y))
    d.rectangle((x, y, x + 24, y + 11), fill=(0, 0, 0))
    d.text((x + 2, y), f"{no:03d}", fill=(255, 255, 0), font=font)
sheet.save(os.path.join(W, "review", "qa_sheet.png"))
print("saved qa_sheet.png")
