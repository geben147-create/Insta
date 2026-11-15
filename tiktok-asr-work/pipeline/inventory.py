#!/usr/bin/env python3
"""Inventory all videos on 870 PC drive -> inventory.json (dedup by ID).
Fields: id, platform, country(한국/일본/미분류), cat, title, path, host, dur_s, srt_zh(existing), srt_ko(existing), done
"""
import os, re, json, subprocess, glob, csv
ROOT = "/run/media/yh/새 볼륨/틱톡"
SHAO = ROOT + "/샤오(한국 일본 영상들)"
HOST = "870컴퓨터(yh-X870-Taichi-Creator)"
OUT = os.path.expanduser("~/ai-work/asr_20261115/inventory.json")
DONE = set("BILI-111 BILI-112 BILI-113 BILI-114 BILI-117 BILI-118 BILI-119 BILI-120 BILI-121 BILI-122".split())

def dur(p):
    try:
        return float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], timeout=60).decode().strip())
    except Exception:
        return 0.0

items = {}
# 1) root files (한국 중국SNS 수집분)
for p in sorted(glob.glob(ROOT + "/*.mp4") + glob.glob(ROOT + "/*.ts")):
    b = os.path.basename(p)
    m = re.search(r"((?:BILI|IG|TT|XHS|RU|DZEN|NICO)-\d+)_?(.*)\.(mp4|ts)$", b)
    if not m: continue
    vid = m.group(1); title = re.sub(r" \(1\)$", "", m.group(2)).replace("_", " ")
    if re.search(r"\(1\)\.", b): continue
    pri = 0 if not b.startswith(("x유투브", "중국영상다운")) else (1 if b.startswith("중국영상다운") else 2)
    if vid in items and items[vid]["_pri"] <= pri: continue
    items[vid] = {"id": vid, "platform": vid.split("-")[0], "country": "한국", "cat": "", "title": title, "path": p,
                  "_pri": pri, "src_group": "틱톡 루트"}
# 2) 샤오 folder
for p in sorted(glob.glob(SHAO + "/**/*.mp4", recursive=True)):
    rel = os.path.relpath(p, SHAO); parts = rel.split(os.sep)
    country = parts[0] if parts[0] in ("한국", "일본") else "미분류(빌리빌리)"
    bv = re.search(r"(BV[0-9A-Za-z]{10})", rel)
    vid = bv.group(1) if bv else os.path.basename(p)[:-4]
    folder = os.path.dirname(p)
    cat = "/".join(x for x in parts[1:-2] if x) if country != "미분류(빌리빌리)" else ""
    tm = re.search(r"\[([^\]]+)\](.*)$", parts[-2]) if len(parts) > 2 else None
    title = tm.group(2).strip() if tm else vid
    date = re.match(r"(\d{4}-\d{2}-\d{2})", parts[-2]) if len(parts) > 2 else None
    items[vid] = {"id": vid, "platform": "BILI", "country": country, "cat": cat or (tm.group(1) if tm else ""), "title": title,
                  "path": p, "_pri": 0, "src_group": "샤오", "date": date.group(1) if date else "",
                  "srt_zh": next(iter(glob.glob(os.path.join(folder, "*.ai-zh.srt")) + glob.glob(os.path.join(folder, vid + ".ai-zh.srt"))), ""),
                  "srt_ko": next(iter(glob.glob(os.path.join(folder, "*.ko.srt"))), "")}
res = []
for k, v in items.items():
    v.pop("_pri", None); v["host"] = HOST
    v["dur_s"] = round(dur(v["path"])); v["size_mb"] = round(os.path.getsize(v["path"]) / 1e6, 1)
    v["done"] = k in DONE
    res.append(v)
json.dump(res, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
tot = sum(v["dur_s"] for v in res if not v["done"])
print("videos", len(res), "todo", sum(1 for v in res if not v["done"]), "hours", round(tot / 3600, 1))
from collections import Counter
print(Counter((v["country"], v["src_group"]) for v in res))
print(Counter(v["platform"] for v in res))
print("existing zh srt", sum(1 for v in res if v.get("srt_zh")), "ko srt", sum(1 for v in res if v.get("srt_ko")))
