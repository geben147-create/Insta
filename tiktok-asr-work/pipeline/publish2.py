#!/usr/bin/env python3
"""Publish all reviewed masters: copy to repo script/data + drive subtitles/{country}, rebuild index.json & eval_all.json.
usage: python3 -I publish2.py
"""
import os, json, glob, shutil
ROOT = os.path.expanduser("~/ai-work/asr_20261115")
REPO = os.path.expanduser("~/Insta/국뽕해외반응-중국SNS-20261103/script/data")
SUBS = "/run/media/yh/새 볼륨/틱톡/subtitles"
os.makedirs(REPO, exist_ok=True)
INV = json.load(open(ROOT + "/inventory.json", encoding="utf-8"))
EXT = [".ko.srt", ".zh.srt", ".zh-ko.srt", ".script.tsv"]
vids, ev = [], []
for v in INV:
    vid = v["id"]; p = f"{ROOT}/out/{vid}.json"
    ctry_inv = v["country"] if v["country"] in ("한국", "일본") else "미분류"
    if os.path.exists(p) and os.path.exists(f"{ROOT}/out/{vid}.ko.srt"):
        M = json.load(open(p, encoding="utf-8")); L = M["lines"]
        for k, dv in (("platform", v["platform"]), ("host", v["host"]), ("path", v["path"]), ("title_orig", v["title"]), ("date", v.get("date", ""))):
            M.setdefault(k, dv) if not M.get(k) else None
            if not M.get(k): M[k] = dv
        if not M.get("country") or M["country"] == "미분류": M["country"] = v["country"] if v["country"] in ("한국", "일본") else "기타"
        if not M.get("cat"): M["cat"] = v.get("cat", "") or "기타"
        for k in ("praise", "crit", "compare"): M.setdefault(k, [])
        json.dump(M, open(f"{REPO}/{vid}.json", "w", encoding="utf-8"), ensure_ascii=False)
        sd = f"{SUBS}/{M['country'] if M['country'] in ('한국','일본') else '기타'}"; os.makedirs(sd, exist_ok=True)
        for e in EXT:
            s = f"{ROOT}/out/{vid}{e}"
            if os.path.exists(s):
                shutil.copy2(s, f"{REPO}/{vid}{e}"); shutil.copy2(s, f"{sd}/{vid}{e}")
            old = f"{SUBS}/{vid}{e}"
            if os.path.exists(old): os.remove(old)  # moved into country folder
        cnt = {t: sum(1 for x in L if x["t"] == t) for t in ("good", "bad", "eval", "key")}
        vids.append({"id": vid, "title": M["title"], "title_orig": M.get("title_orig", ""), "platform": M["platform"], "country": M["country"],
                     "cat": M["cat"], "done": True, "dur_ms": M["dur_ms"], "n": len(L), "good": cnt["good"], "bad": cnt["bad"],
                     "cmp": len(M["compare"]), "path": M["path"], "date": M.get("date", "")})
        for k, kk in (("praise", "praise"), ("crit", "crit"), ("compare", "cmp")):
            for o in M[k]:
                x = L[o["i"]]
                ev.append({"v": vid, "i": o["i"], "s": x["s"], "k": kk, "vs": o.get("vs", ""), "res": o.get("result", ""),
                           "note": o.get("note", ""), "ko": x["ko"], "zh": x["zh"], "c": M["country"], "title": M["title"]})
    else:
        vids.append({"id": vid, "title": "", "title_orig": v["title"], "platform": v["platform"], "country": ctry_inv, "cat": v.get("cat", "") or "기타",
                     "done": False, "dur_s": v["dur_s"], "path": v["path"], "date": v.get("date", "")})
json.dump({"by": "by Hermes · Opus", "videos": vids}, open(f"{REPO}/index.json", "w", encoding="utf-8"), ensure_ascii=False)
json.dump(ev, open(f"{REPO}/eval_all.json", "w", encoding="utf-8"), ensure_ascii=False)
print("index", sum(1 for x in vids if x["done"]), "/", len(vids), "| eval items", len(ev))
