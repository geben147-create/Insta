#!/usr/bin/env python3
"""Plan translation batches from ASR-done, not-yet-assigned videos.
usage: python3 -I plan_batches.py [--max-batches N] [--lines 900]
Writes plan/batch_XX.json and prints task contexts; marks ids in assigned.json.
Also auto-finishes no-speech videos (<3 cues) without a subagent.
"""
import os, sys, json, glob, subprocess
ROOT = os.path.expanduser("~/ai-work/asr_20261115")
INV = json.load(open(ROOT + "/inventory.json", encoding="utf-8"))
asg_p = ROOT + "/assigned.json"
assigned = set(json.load(open(asg_p))) if os.path.exists(asg_p) else set()
maxb = 10; target = 900
for i, a in enumerate(sys.argv):
    if a == "--max-batches": maxb = int(sys.argv[i + 1])
    if a == "--lines": target = int(sys.argv[i + 1])
pri = {"한국": 0, "미분류(빌리빌리)": 1, "일본": 2}
cands = []
for v in INV:
    p = f"{ROOT}/out/{v['id']}.asr.json"
    if v["done"] or v["id"] in assigned or not os.path.exists(p): continue
    if os.path.exists(f"{ROOT}/out/{v['id']}.json"): continue
    A = json.load(open(p, encoding="utf-8")); S = A["sentences"]
    txt = "".join(x["zh"] for x in S)
    if len(S) < 3 or len(txt) < 12 or (len(S) <= 3 and txt.strip().lower() in ("you", "thank you.", "thanks for watching!")):
        # no speech -> trivial review
        rv = {"ko": ["(음성 없음/음악)" for _ in S], "good": [], "bad": [], "eval": [], "key": [], "vs": {},
              "country": v["country"] if v["country"] in ("한국", "일본") else "기타", "cat": (v.get("cat") or "기타").split("/")[0],
              "title_ko": v["title"], "sum": "음성(대사)이 거의 없는 영상(음악·영상 위주). 자막 없음.", "verdict": "평가 없음(대사 없음)",
              "hooks": [], "chapters": [], "praise": [], "crit": [], "compare": [], "use": "대사 없음 — 영상 소스로만 활용 가능"}
        json.dump(rv, open(f"{ROOT}/out/{v['id']}.review.json", "w", encoding="utf-8"), ensure_ascii=False)
        subprocess.run(["python3", "-I", ROOT + "/apply_review2.py", v["id"]], capture_output=True)
        assigned.add(v["id"]); continue
    cands.append((pri.get(v["country"], 3), v, A.get("lang", "zh"), len(S)))
cands.sort(key=lambda x: (x[0], x[1]["id"]))
batches, cur, n = [], [], 0
for _, v, lang, ls in cands:
    if cur and n + ls > target * 1.25:
        batches.append(cur); cur, n = [], 0
        if len(batches) >= maxb: break
    cur.append({"id": v["id"], "title_orig": v["title"], "country_hint": v["country"], "cat_hint": v.get("cat", ""), "lang": lang, "lines": ls}); n += ls
    if n >= target:
        batches.append(cur); cur, n = [], 0
        if len(batches) >= maxb: break
if cur and len(batches) < maxb: batches.append(cur)
os.makedirs(ROOT + "/plan", exist_ok=True)
for k, b in enumerate(batches):
    for x in b: assigned.add(x["id"])
    json.dump(b, open(f"{ROOT}/plan/batch_{int(len(glob.glob(ROOT+'/plan/batch_*.json')))+1:03d}.json", "w", encoding="utf-8"), ensure_ascii=False)
json.dump(sorted(assigned), open(asg_p, "w"))
for b in batches:
    print("BATCH", sum(x["lines"] for x in b), "lines,", len(b), "videos")
    print("; ".join(f"{x['id']}({x['lines']}줄,{x['lang']},힌트:{x['country_hint']}/{x['cat_hint']},제목:{x['title_orig'][:40]})" for x in b))
