"""Per-video analysis: cut detection, shot keyframes, contact sheet, audio onsets, whisper transcript."""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

NOWIN = getattr(subprocess, "CREATE_NO_WINDOW", 0)
FPS = 10
SW, SH = 36, 64


def run(cmd, timeout=600):
    return subprocess.run(cmd, stdin=subprocess.DEVNULL, capture_output=True,
                          timeout=timeout, creationflags=NOWIN)


def probe(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=width,height,codec_type",
             "-of", "json", str(path)])
    return json.loads(r.stdout)


def diff_signal(path, w, h):
    sw, sh = (SW, SH) if h >= w else (SH, SW)
    r = run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-vf", f"fps={FPS},scale={sw}:{sh}",
             "-f", "rawvideo", "-pix_fmt", "rgb24", "-"])
    arr = np.frombuffer(r.stdout, np.uint8).reshape(-1, sh, sw, 3).astype(np.int16)
    d = np.abs(np.diff(arr, axis=0)).mean(axis=(1, 2, 3))
    return [(round((i + 1) / FPS, 2), round(float(x), 1)) for i, x in enumerate(d)]


def detect_cuts(sig):
    vals = [v for _, v in sig]
    cuts = []
    for i, (t, v) in enumerate(sig):
        nb = max(vals[i - 1] if i else 0, vals[i + 1] if i + 1 < len(vals) else 0)
        base = np.median(vals[max(0, i - 6):i + 7])
        if v > 22 and v >= nb and v > 2.2 * base:
            cuts.append(t)
    return cuts


def extract_frame(path, t, out, width=540):
    run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", str(path), "-frames:v", "1",
         "-vf", f"scale={width}:-2", "-q:v", "3", str(out)])


def contact_sheet(frames, out, cols=6):
    ims = [Image.open(p) for p, _ in frames]
    w, h = 300, int(300 * ims[0].height / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * h), "black")
    font = ImageFont.truetype("arial.ttf", 22)
    draw = ImageDraw.Draw(sheet)
    for i, (im, (_, label)) in enumerate(zip(ims, frames)):
        x, y = (i % cols) * w, (i // cols) * h
        sheet.paste(im.resize((w, h)), (x, y))
        draw.rectangle([x, y, x + 150, y + 30], fill="black")
        draw.text((x + 5, y + 3), label, fill="yellow", font=font)
    sheet.save(out, quality=85)


def audio_onsets(path):
    r = run(["ffmpeg", "-nostdin", "-v", "error", "-i", str(path), "-vn", "-ac", "1", "-ar", "8000",
             "-f", "s16le", "-"])
    a = np.frombuffer(r.stdout, np.int16).astype(np.float32) / 32768
    if a.size == 0:
        return {"has_audio": False}
    hop = 400  # 50ms
    n = a.size // hop
    rms = np.sqrt((a[: n * hop].reshape(n, hop) ** 2).mean(axis=1) + 1e-9)
    db = 20 * np.log10(rms)
    flux = np.maximum(np.diff(db, prepend=db[0]), 0)
    thr = np.percentile(flux, 95)
    onsets = [round(i * 0.05, 2) for i in range(1, n - 1)
              if flux[i] > max(thr, 3) and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]]
    env = [round(float(x), 1) for x in db[::10]]  # every 0.5s
    return {"has_audio": True, "onsets": onsets, "db_every_0_5s": env}


def transcribe(path):
    from faster_whisper import WhisperModel
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    segs, info = model.transcribe(str(path), vad_filter=True)
    segs = list(segs)
    return {"lang": info.language, "segments": [
        {"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()} for s in segs]}


def main(name):
    path = Path(f"{name}.mp4")
    out = Path(f"a_{name}")
    out.mkdir(exist_ok=True)
    info = probe(path)
    vs = next(s for s in info["streams"] if s["codec_type"] == "video")
    dur = float(info["format"]["duration"])
    sig = diff_signal(path, vs["width"], vs["height"])
    cuts = detect_cuts(sig)
    bounds = [0.0] + cuts + [round(dur, 2)]
    shots, sheet_frames = [], []
    for i in range(len(bounds) - 1):
        s, e = bounds[i], bounds[i + 1]
        mid = (s + e) / 2
        f = out / f"shot{i + 1:02d}.jpg"
        extract_frame(path, min(mid, dur - 0.1), f)
        extra = []
        if e - s > 2.5:
            for k, tt in enumerate([s + 0.2, e - 0.2]):
                ef = out / f"shot{i + 1:02d}_{'ab'[k]}.jpg"
                extract_frame(path, tt, ef)
                extra.append({"t": round(tt, 2), "file": ef.name})
        shots.append({"n": i + 1, "start": s, "end": e, "dur": round(e - s, 2), "mid": round(mid, 2),
                      "file": f.name, "extra": extra})
        sheet_frames.append((f, f"#{i + 1} {mid:.1f}s"))
    contact_sheet(sheet_frames, out / "sheet.jpg")
    grid = []
    t = 0.25
    while t < dur:
        g = out / f"g{int(t * 100):05d}.jpg"
        extract_frame(path, t, g, width=300)
        if g.exists():
            grid.append((g, f"{t:.2f}s"))
        t += 0.5
    for k in range(0, len(grid), 24):
        contact_sheet(grid[k:k + 24], out / f"grid{k // 24}.jpg", cols=8)
    result = {"name": name, "duration": dur, "w": vs["width"], "h": vs["height"], "cuts": cuts,
              "shots": shots, "diff": sig, "audio": audio_onsets(path)}
    if "--no-asr" not in sys.argv:
        result["transcript"] = transcribe(path)
    (out / "analysis.json").write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
    print(name, "shots", len(shots), "cuts", cuts)


if __name__ == "__main__":
    main(sys.argv[1])
