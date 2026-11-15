#!/usr/bin/env python3
"""Build master JSON + SRT/TSV for one video from asr.json + review.json + inventory.
usage: python3 -I apply_review2.py ID
"""
import sys, json, os, re

ROOT = os.path.expanduser("~/ai-work/asr_20261115")
vid = sys.argv[1]
INV = {v["id"]: v for v in json.load(open(ROOT + "/inventory.json", encoding="utf-8"))}
inv = INV.get(vid, {})
A = json.load(open(f"{ROOT}/out/{vid}.asr.json", encoding="utf-8"))
R = json.load(open(f"{ROOT}/out/{vid}.review.json", encoding="utf-8"))
S = A["sentences"]
ko = R.get("ko") or []
assert len(ko) == len(S), f"{vid}: ko {len(ko)} != sentences {len(S)}"
L = []
for i, (x, k) in enumerate(zip(S, ko)):
    L.append({"s": x["s"], "e": x["e"], "zh": x["zh"], "ko": (str(k).strip() or "(인식 불명)"), "t": "", "vs": ""})
for t in ("key", "eval", "bad", "good"):
    for i in R.get(t, []):
        if 0 <= int(i) < len(L): L[int(i)]["t"] = t
for i, v in (R.get("vs") or {}).items():
    if 0 <= int(i) < len(L): L[int(i)]["vs"] = v
def clean(lst, keys):
    out = []
    for o in lst or []:
        try:
            i = int(o["i"])
            if 0 <= i < len(L): out.append({**{k: o.get(k, "") for k in keys}, "i": i})
        except Exception: pass
    return out
dur_ms = S[-1]["e"] if S else int(inv.get("dur_s", 0) * 1000)
M = {"id": vid, "title": R.get("title_ko") or inv.get("title", vid), "title_orig": inv.get("title", ""),
     "platform": inv.get("platform", ""), "country": R.get("country") or (inv.get("country") if "미분류" not in inv.get("country", "") else "기타"),
     "cat": R.get("cat", ""), "cat_folder": inv.get("cat", ""), "date": inv.get("date", ""), "host": inv.get("host", ""),
     "path": inv.get("path", ""), "dur_ms": dur_ms, "lang": A.get("lang", "zh"), "asr": A["model"], "asr_s": A.get("asr_s", 0),
     "mt": "Claude 초벌 번역(자막 초안 — 사용 시 한국어 다듬기 필요)", "by": "by Hermes · Opus",
     "sum": R.get("sum", ""), "verdict": R.get("verdict", ""), "hooks": R.get("hooks", []), "chapters": R.get("chapters", []),
     "praise": clean(R.get("praise"), ["note"]), "crit": clean(R.get("crit"), ["note"]),
     "compare": clean(R.get("compare"), ["vs", "note", "result"]), "use": R.get("use", ""), "lines": L}
def tc(ms, sep=","):
    h, ms = divmod(int(ms), 3600000); m, ms = divmod(ms, 60000); s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d}{sep}{ms:03d}"
od = ROOT + "/out"
def srt(fn, f):
    with open(f"{od}/{vid}{fn}", "w", encoding="utf-8") as o:
        for n, x in enumerate(L, 1):
            o.write(f"{n}\n{tc(x['s'])} --> {tc(x['e'])}\n{f(x)}\n\n")
srt(".ko.srt", lambda x: x["ko"]); srt(".zh.srt", lambda x: x["zh"]); srt(".zh-ko.srt", lambda x: x["zh"] + "\n" + x["ko"])
TN = {"good": "좋은평가", "bad": "나쁜평가", "eval": "비교평가", "key": "핵심", "": ""}
with open(f"{od}/{vid}.script.tsv", "w", encoding="utf-8") as o:
    o.write("번호\t시작\t끝\t원문\t한국어\t태그\t비교상대\n")
    for n, x in enumerate(L, 1):
        o.write(f"{n}\t{tc(x['s'],'.')}\t{tc(x['e'],'.')}\t{x['zh']}\t{x['ko']}\t{TN[x['t']]}\t{x['vs']}\n")
json.dump(M, open(f"{od}/{vid}.json", "w", encoding="utf-8"), ensure_ascii=False)
print(f"OK {vid} lines={len(L)} {M['country']}/{M['cat']} good={sum(1 for x in L if x['t']=='good')} bad={sum(1 for x in L if x['t']=='bad')} praise={len(M['praise'])} crit={len(M['crit'])} cmp={len(M['compare'])}")
