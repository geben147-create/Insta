#!/usr/bin/env python3
"""Capture a few key-scene frames per video (praise/crit/compare/key lines) -> repo script/frames, update out/{id}.json 'frames'.
usage: python3 -I extract_frames.py [ID ...]   (no ID = all masters lacking frames)
"""
import sys, os, json, subprocess, glob
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.expanduser("~/ai-work/asr_20261115")
FR = os.path.expanduser("~/Insta/국뽕해외반응-중국SNS-20261103/script/frames")
os.makedirs(FR, exist_ok=True)
INV = {v["id"]: v for v in json.load(open(ROOT + "/inventory.json", encoding="utf-8"))}
MAXF = 6

def pick(M):
    L = M["lines"]; order = []
    for o in (M.get("praise") or [])[:4]: order.append(o["i"])
    for o in (M.get("crit") or [])[:2]: order.append(o["i"])
    for o in (M.get("compare") or [])[:2]: order.append(o["i"])
    for t in ("good", "bad", "eval", "key"):
        order += [i for i, x in enumerate(L) if x["t"] == t][:3]
    chosen = []
    for i in order:
        if i in [c for c in chosen]: continue
        s = L[i]["s"]
        if all(abs(s - L[c]["s"]) > 20000 for c in chosen): chosen.append(i)
        if len(chosen) >= MAXF: break
    if not chosen and L:  # no tagged lines: 3 evenly spaced
        chosen = [int(len(L) * f) for f in (0.15, 0.5, 0.85)]
    return sorted(set(chosen))

def grab(args):
    vid, i, t, src = args
    out = f"{FR}/{vid}_{i}.jpg"
    if os.path.exists(out) and os.path.getsize(out) > 500: return True
    r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", src, "-frames:v", "1", "-vf", "scale=420:-2", "-q:v", "8", out],
                       capture_output=True, timeout=120)
    return os.path.exists(out) and os.path.getsize(out) > 500

ids = sys.argv[1:] or [os.path.basename(p)[:-5] for p in sorted(glob.glob(ROOT + "/out/*.json")) if not p.endswith((".asr.json", ".review.json")) and ".ko.part" not in p]
jobs = []; masters = {}
for vid in ids:
    p = f"{ROOT}/out/{vid}.json"
    if not os.path.exists(p) or vid not in INV: continue
    M = json.load(open(p, encoding="utf-8"))
    if M.get("frames") and not sys.argv[1:]: continue
    sel = pick(M); masters[vid] = (M, sel)
    for i in sel:
        x = M["lines"][i]; jobs.append((vid, i, (x["s"] + x["e"]) / 2000, INV[vid]["path"]))
with ThreadPoolExecutor(4) as ex: res = list(ex.map(grab, jobs))
ok = {(j[0], j[1]) for j, r in zip(jobs, res) if r}
for vid, (M, sel) in masters.items():
    M["frames"] = [{"i": i, "f": f"{vid}_{i}.jpg"} for i in sel if (vid, i) in ok]
    json.dump(M, open(f"{ROOT}/out/{vid}.json", "w", encoding="utf-8"), ensure_ascii=False)
print("frames", len(ok), "/", len(jobs), "videos", len(masters))
