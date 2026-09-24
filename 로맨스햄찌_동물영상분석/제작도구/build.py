"""Build one detailed HTML breakdown page per reference video + an index page."""
import importlib
import subprocess
import sys
from pathlib import Path

from sections import render_index, render_page

HERE = Path(__file__).parent
WORK = HERE.parent
OUT = WORK.parent / "out"
NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
IDS = [1, 2, 3, 4, 5, 6, 7]


def ffmpeg(args: list) -> None:
    subprocess.run(["ffmpeg", "-y", "-nostdin", "-loglevel", "error", *args], check=True,
                   stdin=subprocess.DEVNULL, capture_output=True, timeout=60, creationflags=NO_WINDOW)


def grab(src: Path, t: float, dst: Path, width: int) -> None:
    if dst.exists():
        return
    ffmpeg(["-ss", f"{t:.2f}", "-i", str(src), "-frames:v", "1",
            "-vf", f"scale={width}:-2", "-q:v", "4", str(dst)])


def extract_images(v: dict) -> None:
    n = v["id"]
    src = WORK / f"v{n}" / "download" / "video.mp4"
    img = OUT / "img" / f"v{n}"
    img.mkdir(parents=True, exist_ok=True)
    for si, shot in enumerate(v["shots"], 1):
        for fi, t in enumerate(shot["frames"], 1):
            grab(src, min(t, v["duration"] - 0.05), img / f"s{si:02d}_{fi}.jpg", 360)
    step = v.get("strip_step", 1.0)
    t, k = 0.0, 0
    while t < v["duration"] - 0.05:
        grab(src, t, img / f"strip_{k:03d}.jpg", 150)
        t, k = round(t + step, 3), k + 1
    v["strip_count"] = k


def main() -> None:
    videos = []
    for n in [int(x) for x in sys.argv[1:]] or IDS:
        mod = importlib.import_module(f"v{n}")
        v = mod.VIDEO
        extract_images(v)
        videos.append(v)
    for i, v in enumerate(videos):
        prev_v = videos[i - 1] if i > 0 else None
        next_v = videos[i + 1] if i < len(videos) - 1 else None
        (OUT / v["page"]).write_text(render_page(v, prev_v, next_v), encoding="utf-8")
        print("wrote", v["page"], len(v["shots"]), "shots")
    (OUT / "index.html").write_text(render_index(videos), encoding="utf-8")
    print("wrote index.html")


if __name__ == "__main__":
    main()
