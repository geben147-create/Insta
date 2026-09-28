"""스크린샷 받은편지함 → 통번호·배치·번호 모아보기.
shotlib/inbox 의 폰 스크린샷을 찍은 시각 순으로 정렬 → 기존 번호 다음부터 통번호(B01 이 1~16 이면 17번부터)
→ 20장씩 배치(B02~) → shotlib/screens/B0N/NN.jpg 로 복사(inbox 원본은 그대로 둠)
→ shotlib/sheets/B0N.jpg (5×4 번호 모아보기, 폰으로 보내기용) + shotlib/모아보기.html (PC 미리보기용, 작은 사진 shotlib/thumbs/)
- 다시 실행해도 이미 넣은 사진은 건너뜀(내용 해시, 또는 같은 찍은 시각 + 거의 같은 화면 = B01 을 폰 원본으로 다시 넣은 경우)
- 삼성 파일 이름의 앱 이름(Screenshot_날짜_시각_YouTube.jpg)이 YouTube 가 아니면 건너뜀(은행·메신저 캡처 보호). --all-apps 로 해제
- 기록: shotlib/inbox_manifest.json
사용(작업 폴더에서): python tools/inbox_sheets.py [--inbox 폴더] [--lib 폴더] [--per 20] [--all-apps]"""
import argparse, glob, hashlib, html, json, os, re, shutil
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
EXTS = (".jpg", ".jpeg", ".png", ".webp")
NAME_RE = re.compile(r"(20\d{6})[_-]?(\d{6})(?:[_-]([^.]+))?")
FONT_NUM = "C:/Windows/Fonts/arialbd.ttf"
FONT_KO = "C:/Windows/Fonts/malgunbd.ttf"
COLS, ROWS, CELL_W = 5, 4, 340
CELL_H = round(CELL_W * 2176 / 1812)  # 폴드 메인 화면 비율(1812×2176) 기준 칸


def jload(p, default):
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else default


def sha1(path):
    return hashlib.sha1(open(path, "rb").read()).hexdigest()


def dhash(im):
    """64비트 차이 해시 — 같은 화면을 다시 인코딩한 사진 찾기용"""
    g = ImageOps.grayscale(im).resize((9, 8), Image.LANCZOS)
    px = g.tobytes()  # 흑백 1바이트/화소
    return sum(1 << i for i in range(64) if px[(i // 8) * 9 + i % 8] > px[(i // 8) * 9 + i % 8 + 1])


def taken(path, im):
    """찍은 시각: 삼성 파일 이름 → EXIF 촬영 시각 → 파일 수정 시각"""
    m = NAME_RE.search(os.path.basename(path))
    if m:
        return datetime.strptime(m.group(1) + m.group(2), "%Y%m%d%H%M%S"), (m.group(3) or "")
    ex = im.getexif()
    raw = ex.get_ifd(0x8769).get(36867) or ex.get(306)
    if raw:
        return datetime.strptime(raw.strip()[:19], "%Y:%m:%d %H:%M:%S"), ""
    return datetime.fromtimestamp(os.path.getmtime(path)), ""


def info(path):
    with Image.open(path) as im:
        when, app = taken(path, im)
        return {"sha1": sha1(path), "dhash": dhash(im), "taken": when.strftime("%Y-%m-%d %H:%M:%S"), "app": app, "size": list(im.size)}


def bootstrap(lib):
    """manifest 가 없을 때: 이미 있는 screens/B0N/NN.jpg(세션 4 의 B01 등)를 기록으로 흡수"""
    items = []
    for p in sorted(glob.glob(os.path.join(lib, "screens", "B[0-9][0-9]", "*.jpg"))):
        batch, stem = os.path.basename(os.path.dirname(p)), os.path.splitext(os.path.basename(p))[0]
        if stem.isdigit():
            items.append(dict(info(p), no=int(stem), batch=batch, src="(기존)", file=os.path.relpath(p, lib).replace(os.sep, "/")))
    return {"per": None, "items": items}


def is_dup(new, items):
    for it in items:
        if it["sha1"] == new["sha1"]:
            return it
        if it["taken"] == new["taken"] and bin(it["dhash"] ^ new["dhash"]).count("1") <= 6:
            return it
    return None


def next_slot(items, per, lib):
    """새 사진이 들어갈 (배치, 번호): 아직 분석 전(batches/B0N.json 없음)이고 덜 찬 마지막 배치면 이어서 채움"""
    no = max((it["no"] for it in items), default=0) + 1
    if not items:
        return "B01", no
    last = max(items, key=lambda it: it["no"])["batch"]
    filled = sum(1 for it in items if it["batch"] == last)
    if filled < per and not os.path.exists(os.path.join(lib, "batches", f"{last}.json")) and last != "B01":
        return last, no
    return f"B{int(last[1:]) + 1:02d}", no


def ingest(inbox, lib, per, all_apps):
    man_path = os.path.join(lib, "inbox_manifest.json")
    man = jload(man_path, None) or bootstrap(lib)
    items = man["items"]
    files = [p for p in glob.glob(os.path.join(inbox, "**", "*"), recursive=True) if p.lower().endswith(EXTS)]
    new, skipped = [], {"dup": [], "app": []}
    for p in files:
        meta = info(p)
        if meta["app"] and meta["app"].lower() != "youtube" and not all_apps:
            skipped["app"].append(os.path.basename(p))
            continue
        hit = is_dup(meta, items + new)
        if hit:
            skipped["dup"].append((os.path.basename(p), hit["no"]))
            continue
        new.append(dict(meta, path=p))
    added = []
    for m in sorted(new, key=lambda m: (m["taken"], os.path.basename(m["path"]))):
        batch, no = next_slot(items, per, lib)
        dst = os.path.join(lib, "screens", batch, f"{no:02d}.jpg")
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if m["path"].lower().endswith((".jpg", ".jpeg")):
            shutil.copy2(m["path"], dst)  # EXIF(찍은 시각) 보존
        else:
            with Image.open(m["path"]) as im:
                im.convert("RGB").save(dst, quality=95)
        rec = {k: v for k, v in m.items() if k != "path"}
        rec.update(no=no, batch=batch, src=os.path.basename(m["path"]), file=os.path.relpath(dst, lib).replace(os.sep, "/"))
        items.append(rec)
        added.append(rec)
    man = {"per": per, "items": sorted(items, key=lambda it: it["no"])}
    json.dump(man, open(man_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    return man, added, skipped


def sheet(lib, batch, recs):
    """5×4 번호 모아보기 한 장(JPG) — 번호는 노란 상자, 위에 배치·번호 범위·찍은 시각"""
    head, pad = 70, 8
    W, H = COLS * (CELL_W + pad) + pad, head + ROWS * (CELL_H + pad) + pad
    canvas = Image.new("RGB", (W, H), (17, 17, 17))
    d = ImageDraw.Draw(canvas)
    f_num, f_ko = ImageFont.truetype(FONT_NUM, 46), ImageFont.truetype(FONT_KO, 30)
    d.text((pad + 4, 16), f"{batch}  ·  {recs[0]['no']}~{recs[-1]['no']}번  ·  {recs[0]['taken'][5:16]} ~ {recs[-1]['taken'][5:16]}",
           font=f_ko, fill=(255, 255, 255))
    for i, r in enumerate(recs[:COLS * ROWS]):
        x, y = pad + (i % COLS) * (CELL_W + pad), head + pad + (i // COLS) * (CELL_H + pad)
        with Image.open(os.path.join(lib, r["file"])) as im:
            th = ImageOps.contain(im.convert("RGB"), (CELL_W, CELL_H))
        canvas.paste(th, (x + (CELL_W - th.width) // 2, y + (CELL_H - th.height) // 2))
        label = str(r["no"])
        box = d.textbbox((0, 0), label, font=f_num)
        bw, bh = box[2] - box[0] + 20, box[3] - box[1] + 16
        d.rounded_rectangle((x + 6, y + 6, x + 6 + bw, y + 6 + bh), radius=10, fill=(255, 214, 0), outline=(0, 0, 0), width=3)
        d.text((x + 16 - box[0], y + 14 - box[1]), label, font=f_num, fill=(0, 0, 0))
    out = os.path.join(lib, "sheets", f"{batch}.jpg")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    canvas.save(out, quality=88)
    return os.path.relpath(out, lib).replace(os.sep, "/")


def thumb(lib, r):
    """페이지용 작은 사진(원본 약 1MB → 수십 KB) — 200장이어도 가볍게"""
    out = os.path.join(lib, "thumbs", r["batch"], f"{r['no']:02d}.jpg")
    if not os.path.exists(out):
        os.makedirs(os.path.dirname(out), exist_ok=True)
        with Image.open(os.path.join(lib, r["file"])) as im:
            ImageOps.contain(im.convert("RGB"), (360, 432)).save(out, quality=80)
    return os.path.relpath(out, lib).replace(os.sep, "/")


def page(lib, man, sheets):
    """모아보기.html — 배치별 번호 카드(누르면 원본 크기), 분석 여부 표시"""
    groups = {}
    for it in man["items"]:
        groups.setdefault(it["batch"], []).append(it)
    esc = html.escape
    parts = []
    for batch, recs in groups.items():
        done = os.path.exists(os.path.join(lib, "batches", f"{batch}.json"))
        state = "분석 완료 — 샷도감에 들어감" if done else "설명 기다리는 중 — 번호로 말해 주세요"
        cards = "".join(
            f'<a class="c" href="{esc(r["file"])}" target="_blank"><b>{r["no"]}</b><img loading="lazy" src="{esc(thumb(lib, r))}">'
            f'<span>{esc(r["taken"][5:16])}</span></a>' for r in recs)
        sheet_link = f' · <a href="{esc(sheets[batch])}" target="_blank">모아보기 한 장(JPG)</a>' if batch in sheets else ""
        parts.append(f'<section><h2>{batch} <small>{recs[0]["no"]}~{recs[-1]["no"]}번 · {len(recs)}장 · '
                     f'<em class="{"ok" if done else "wait"}">{state}</em>{sheet_link}</small></h2><div class="g">{cards}</div></section>')
    total = len(man["items"])
    doc = f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>스크린샷 번호 모아보기</title><style>
:root{{--bg:#111;--fg:#eee;--mut:#9a9a9a;--card:#1d1d1d;--num:#ffd600;--ok:#5fd38d;--wait:#ffb24a}}
body{{margin:0;background:var(--bg);color:var(--fg);font:15px/1.5 "Malgun Gothic",system-ui,sans-serif;padding:16px}}
h1{{font-size:20px;margin:0 0 4px}} p.sub{{color:var(--mut);margin:0 0 18px}} h2{{font-size:18px;margin:24px 0 10px}}
small{{font-weight:400;color:var(--mut);font-size:14px}} em{{font-style:normal}} .ok{{color:var(--ok)}} .wait{{color:var(--wait)}}
a{{color:#8cc8ff}} .g{{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px}}
.c{{position:relative;display:block;background:var(--card);border-radius:10px;overflow:hidden;text-decoration:none;color:var(--mut)}}
.c img{{width:100%;aspect-ratio:1812/2176;object-fit:contain;display:block;background:#000}}
.c b{{position:absolute;top:6px;left:6px;background:var(--num);color:#000;font:700 22px/1 Arial,sans-serif;padding:5px 9px;border-radius:8px;border:2px solid #000}}
.c span{{display:block;font-size:12px;padding:4px 8px}}
</style></head><body><h1>스크린샷 번호 모아보기</h1>
<p class="sub">전체 {total}장 · 찍은 시각 순 통번호 · 카드를 누르면 원본 크기 · 설명은 "37번 가방 안는 거"처럼 번호로</p>
{"".join(parts)}</body></html>"""
    out = os.path.join(lib, "모아보기.html")
    open(out, "w", encoding="utf-8").write(doc)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--lib", default=os.path.join(ROOT, "shotlib"))
    ap.add_argument("--inbox", default=None)
    ap.add_argument("--per", type=int, default=20)
    ap.add_argument("--all-apps", action="store_true")
    a = ap.parse_args()
    inbox = a.inbox or os.path.join(a.lib, "inbox")
    man, added, skipped = ingest(inbox, a.lib, a.per, a.all_apps)
    touched = sorted({r["batch"] for r in man["items"] if r["batch"] != "B01"})
    sheets = {b: sheet(a.lib, b, [r for r in man["items"] if r["batch"] == b]) for b in touched}
    out = page(a.lib, man, sheets)
    print(f"새로 넣음 {len(added)}장" + (f" ({added[0]['no']}{'' if len(added) == 1 else '~' + str(added[-1]['no'])}번, {', '.join(sorted({r['batch'] for r in added}))})" if added else "")
          + f" · 이미 있음 {len(skipped['dup'])}장 · 다른 앱이라 건너뜀 {len(skipped['app'])}장 · 전체 {len(man['items'])}장")
    for name, no in skipped["dup"][:10]:
        print(f"  이미 있음: {name} = {no}번")
    for name in skipped["app"][:10]:
        print(f"  다른 앱: {name}")
    print(f"모아보기: {os.path.normpath(out)}")
    for b, s in sheets.items():
        print(f"  {b}: {os.path.normpath(os.path.join(a.lib, s))}")


if __name__ == "__main__":
    main()
