"""컷별 5초 영상(150프레임, 1920x1080, 30fps)을 만든다.
   python build_segments.py            -> 카드 + 클립 전부
   python build_segments.py review     -> 클립 구간 확인용 시트만
   python build_segments.py 12 45      -> 지정한 번호만 다시
창이 뜨지 않게 CREATE_NO_WINDOW, stdin 차단, 출력 보존, 타임아웃을 지킨다.
"""
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

from PIL import Image, ImageDraw, ImageFont

from common import parse_rows

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEG = os.path.join(W, "seg")
REVIEW = os.path.join(W, "review")
FPS = 30
FRAMES = 150

# 클립 컷 -> (소스, 시작 초). 장면 목록 시트를 보고 고른 구간이며, review 시트로 다시 확인한다.
PICKS = {
    1: ("GANGNAM", 1356), 4: ("GANGNAM", 1338), 8: ("GANGNAM", 960), 9: ("GANGNAM", 1398),
    19: ("GANGNAM", 1498), 60: ("GANGNAM", 18), 92: ("GANGNAM", 1364), 93: ("GANGNAM", 1538),
    10: ("BTS_RETURN", 58), 11: ("BTS_RETURN", 454), 16: ("BTS_RETURN", 194),
    84: ("BTS_RETURN", 158), 85: ("BTS_RETURN", 118),
    13: ("BTS_ARG", 448), 14: ("BTS_RETURN", 169), 95: ("BTS_RETURN", 175), 96: ("BTS_RETURN", 164),
    47: ("BIRTH", 484), 48: ("BIRTH", 491), 49: ("BIRTH", 496),
    51: ("BIRTH", 405), 53: ("BIRTH", 470), 56: ("BIRTH", 500),
}


def run(cmd, timeout=900):
    p = subprocess.run(
        cmd,
        stdin=subprocess.DEVNULL,
        capture_output=True,
        creationflags=subprocess.CREATE_NO_WINDOW,
        timeout=timeout,
    )
    if p.returncode != 0:
        raise RuntimeError(p.stderr.decode("utf-8", "replace")[-600:])


def seg_path(no):
    return os.path.join(SEG, f"{no:03d}.mp4")


def enc_args():
    return ["-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
            "-pix_fmt", "yuv420p", "-r", str(FPS), "-g", str(FPS), "-frames:v", str(FRAMES)]


def make_card(r):
    png = os.path.join(W, "cards", f"{r['no']:03d}.png")
    vf = ("scale=3840:2160,zoompan=z='1+0.04*on/%d':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
          ":d=1:s=1920x1080:fps=%d,format=yuv420p" % (FRAMES, FPS))
    run(["ffmpeg", "-v", "error", "-y", "-loop", "1", "-framerate", str(FPS), "-i", png,
         "-vf", vf] + enc_args() + [seg_path(r["no"])])


def make_clip(r):
    src_name, start = PICKS[r["no"]]
    src = os.path.join(W, "dl_videos", f"{src_name}.mp4")
    ov = os.path.join(W, "overlays", f"{r['no']:03d}.png")
    fc = ("[0:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,"
          f"fps={FPS},setsar=1[v];[v][1:v]overlay=0:0:format=auto,format=yuv420p")
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(start), "-i", src, "-i", ov,
         "-filter_complex", fc] + enc_args() + [seg_path(r["no"])])


def make(r):
    (make_card if r["kind"] == "CARD" else make_clip)(r)
    return r["no"]


def review_sheets():
    os.makedirs(REVIEW, exist_ok=True)
    font = ImageFont.load_default()
    items = sorted(PICKS.items())
    frames = {}

    def grab(job):
        no, k, t = job
        src_name, start = PICKS[no]
        out = os.path.join(REVIEW, f"{no:03d}_{k}.jpg")
        run(["ffmpeg", "-v", "error", "-y", "-ss", str(start + t), "-i",
             os.path.join(W, "dl_videos", f"{src_name}.mp4"),
             "-frames:v", "1", "-vf", "scale=320:180", out], timeout=120)
        return no, k, out

    jobs = [(no, k, t) for no, _ in items for k, t in enumerate((0.3, 2.5, 4.7))]
    with ThreadPoolExecutor(6) as ex:
        for no, k, out in ex.map(grab, jobs):
            frames[(no, k)] = out
    per_sheet = 12
    for s in range(0, len(items), per_sheet):
        chunk = items[s:s + per_sheet]
        sheet = Image.new("RGB", (1920, 6 * 190), (0, 0, 0))
        d = ImageDraw.Draw(sheet)
        for i, (no, (src_name, start)) in enumerate(chunk):
            col0 = (i % 2) * 3
            row = i // 2
            for k in range(3):
                im = Image.open(frames[(no, k)])
                sheet.paste(im, ((col0 + k) * 320, row * 190 + 10))
            d.rectangle((col0 * 320, row * 190, col0 * 320 + 330, row * 190 + 10), fill=(0, 0, 0))
            d.text((col0 * 320 + 4, row * 190), f"#{no:03d} {src_name} {start}s", fill=(255, 255, 0), font=font)
        sheet.save(os.path.join(REVIEW, f"clips_{s // per_sheet + 1}.png"))
    print("review sheets saved")


def main():
    os.makedirs(SEG, exist_ok=True)
    args = sys.argv[1:]
    if args == ["review"]:
        review_sheets()
        return
    kind = {"cards": "CARD", "clips": "CLIP"}.get(args[0]) if args else None
    only = {int(a) for a in args if a.isdigit()}
    rows = [
        r for r in parse_rows()
        if (not only or r["no"] in only) and (kind is None or r["kind"] == kind)
    ]
    done = 0
    with ThreadPoolExecutor(6) as ex:
        for no in ex.map(make, rows):
            done += 1
            if done % 10 == 0:
                print("segments", done, "/", len(rows), flush=True)
    print("DONE", done, flush=True)


if __name__ == "__main__":
    main()
