#!/usr/bin/env python3
"""Build Google Sheet paste payloads from published data (index.json + masters).
Writes sheet2/sum.json and sheet2/lines_NN.json (each {tsv,html,rows,start_row}) + sheet2/manifest.json
usage: python3 -I sheet_rows2.py [--chunk 700]
"""
import os, json, html, urllib.parse
REPO = os.path.expanduser("~/Insta/국뽕해외반응-중국SNS-20261103/script/data")
OUT = os.path.expanduser("~/ai-work/asr_20261115/sheet2"); os.makedirs(OUT, exist_ok=True)
BASE = "https://geben147-create.github.io/Insta/" + urllib.parse.quote("국뽕해외반응-중국SNS-20261103") + "/script/"
CH = 700
import sys
if "--chunk" in sys.argv: CH = int(sys.argv[sys.argv.index("--chunk") + 1])
IDX = json.load(open(REPO + "/index.json", encoding="utf-8"))["videos"]
TN = {"good": "👍좋은평가", "bad": "👎나쁜평가", "eval": "⚖비교평가", "key": "★핵심", "": ""}
def tc(ms):
    s = int(ms) // 1000
    return f"{s//3600:02d}:{s%3600//60:02d}:{s%60:02d}"
def cell(v):
    v = str(v).replace("\t", " ").replace("\n", " ").replace("\r", " ")
    return "‘" + v[1:] if v.startswith("'") else v
HDRSTY = "font-weight:bold;background-color:#3a1420;color:#ffd27e"
STY = {"key": "color:#d00000;font-weight:bold", "good": "background-color:#fff35c", "bad": "background-color:#fff35c", "eval": "background-color:#fff8a8"}
def td(v, sty="", force_text=False):
    c = html.escape(cell(v))
    if force_text and isinstance(v, str) and v[:1].isdigit() and ":" in v:
        dv = html.escape(json.dumps({"1": 2, "2": v}), quote=True)
        return f'<td style="{sty}" data-sheets-value="{dv}">{c}</td>'
    return f'<td style="{sty}">{c}</td>'
def table(rows, styles, widths):
    h = ['<google-sheets-html-origin><table xmlns="http://www.w3.org/1999/xhtml" cellspacing="0" cellpadding="0" dir="ltr" border="1" data-sheets-root="1">' + "".join(f'<col width="{w}">' for w in widths)]
    for r, st in zip(rows, styles):
        sty = HDRSTY if st == "h" else STY.get(st, "")
        h.append("<tr>" + "".join(td(v, sty, True) for v in r) + "</tr>")
    h.append("</table></google-sheets-html-origin>")
    return "".join(h)
def payload(rows, styles, widths):
    return {"tsv": "\n".join("\t".join(cell(v) for v in r) for r in rows), "html": table(rows, styles, widths), "rows": len(rows)}

# summary
rows = [["영상ID", "플랫폼", "국가", "분야", "제목(한국어)", "원제", "길이", "자막줄수", "👍좋음", "👎나쁨", "⚖비교", "한국 평가(요약)", "요약", "🎬국뽕 활용", "훅 후보", "대본 페이지", "한국어 SRT", "870컴퓨터 경로", "상태", "번역 비고", "작성"]]
styles = ["h"]
for v in IDX:
    vid = v["id"]; p = f"{REPO}/{vid}.json"
    if v["done"] and os.path.exists(p):
        M = json.load(open(p, encoding="utf-8"))
        rows.append([vid, M["platform"], M["country"], M["cat"], M["title"], M.get("title_orig", ""), tc(M["dur_ms"]), len(M["lines"]), v["good"], v["bad"], v["cmp"],
                     M.get("verdict", ""), M.get("sum", "").replace("\n", " / "), M.get("use", ""), " / ".join(M.get("hooks", [])),
                     BASE + "#" + vid, BASE + "data/" + vid + ".ko.srt", "870컴퓨터: " + M.get("path", ""), "완료", "Claude 초벌 번역(자막 초안·다듬기 필요)", "by Hermes · Opus"])
    else:
        rows.append([vid, v["platform"], v["country"], v.get("cat", ""), "", v.get("title_orig", ""), tc((v.get("dur_s") or 0) * 1000), "", "", "", "", "", "", "", "",
                     BASE + "#" + vid, "", "870컴퓨터: " + v.get("path", ""), "대기/미처리", "", "by Hermes · Opus"])
    styles.append("")
json.dump(payload(rows, styles, [80, 55, 60, 70, 220, 220, 60, 60, 45, 45, 45, 260, 320, 260, 260, 150, 150, 300, 70, 160, 110]), open(OUT + "/sum.json", "w", encoding="utf-8"), ensure_ascii=False)

# lines
hdr = ["영상ID", "국가", "줄", "시작", "끝", "원문", "한국어(초벌)", "태그", "비교상대", "바로가기", "작성"]
W = [75, 55, 40, 65, 65, 260, 320, 80, 60, 150, 100]
all_rows, all_sty = [], []
for v in IDX:
    if not v["done"]: continue
    M = json.load(open(f"{REPO}/{v['id']}.json", encoding="utf-8"))
    for i, x in enumerate(M["lines"]):
        all_rows.append([v["id"], M["country"], i + 1, tc(x["s"]), tc(x["e"]), x["zh"], x["ko"], TN[x["t"]], x.get("vs", ""), BASE + "#" + v["id"] + "@" + str(i), "by Hermes · Opus"])
        all_sty.append(x["t"])
man = {"total_rows": len(all_rows) + 1, "chunks": []}
n = 0; start = 1
# first chunk includes header
for a in range(0, len(all_rows), CH):
    rs = all_rows[a:a + CH]; st = all_sty[a:a + CH]
    if a == 0: rs = [hdr] + rs; st = ["h"] + st
    pl = payload(rs, st, W); pl["start_row"] = start
    json.dump(pl, open(f"{OUT}/lines_{n:03d}.json", "w", encoding="utf-8"), ensure_ascii=False)
    man["chunks"].append({"file": f"lines_{n:03d}.json", "start_row": start, "rows": len(rs)})
    start += len(rs); n += 1
json.dump(man, open(OUT + "/manifest.json", "w"), ensure_ascii=False)
print("summary rows", len(rows), "| line rows", len(all_rows), "| chunks", n, "| size MB", round(sum(os.path.getsize(f"{OUT}/lines_{i:03d}.json") for i in range(n)) / 1e6, 1))
