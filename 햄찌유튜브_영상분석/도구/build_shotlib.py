"""햄찌 샷 도감: 사용자가 고른 스크린샷(배치 20장씩) + 원본 영상 컷 분석 → 한 페이지(사진 포함, 개인용) + 텍스트(MD).
- 샷 종류별(주 분류)로 묶고, 에피소드는 필터·태그(보조)
- 카드마다: 원본 프레임 · 내가 고른 화면 · 같은 원본 줌 체인 · 구도 · 귀여움 · 자막 · 편집 · 판매 소품 · 새 캐릭터 프롬프트
사용(작업 폴더에서): python tools/build_shotlib.py  → shotlib/샷도감.html, shotlib/샷도감.md"""
import glob, json, os, re, subprocess, sys
from collections import Counter, OrderedDict
from jinja2 import Environment, FileSystemLoader, select_autoescape

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kitdata import ANIMALS, ACCESSORIES, MODELS, NEGATIVE, HERO_SUFFIX, HAIR_TOPKNOT, CUTE_LOOK  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "shotlib")
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)
LOOK = ("photorealistic live-action look as if a real tiny animal was filmed on location, cinematic shallow depth of field, "
        "natural light, crisp fur detail")
DEFAULT = {"animal": "otter", "acc": "lanyard", "name": "김OO"}


def jload(p):
    return json.load(open(p, encoding="utf-8"))


def fmt(t):
    return f"{int(t // 60)}:{t % 60:05.2f}"


def frame(vid, t, out):
    """원본 영상의 해당 시각 프레임(비율 유지, 긴 변 960px) 저장"""
    if not os.path.exists(out):
        os.makedirs(os.path.dirname(out), exist_ok=True)
        subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{t:.3f}", "-i", os.path.join(LIB, "videos", vid, "src.mp4"), "-frames:v", "1",
                        "-vf", "scale='if(gt(iw,ih),960,-2)':'if(gt(iw,ih),-2,960)'", "-q:v", "3", out],
                       stdin=subprocess.DEVNULL, capture_output=True, creationflags=FLAGS, timeout=60)
    return os.path.relpath(out, LIB).replace(os.sep, "/")


def compose(prompt, vertical):
    return (re.sub(r"[.\s]+$", "", prompt) + ". " + LOOK + ", " + CUTE_LOOK + (", 9:16 vertical" if vertical else ", 16:9") +
            ". Character details: " + HERO_SUFFIX + ". The animal must match the character reference sheet exactly.")


def chain_of(zg, cut):
    """같은 원본 줌 체인: [(컷, 배율, 길이)] — 없으면 None"""
    m = zg.get("shot_map", {}).get(str(cut))
    if not m:
        return None, None
    for g in zg.get("groups", []):
        for ch in g["chains"]:
            if ch["source"] == m["source"] and any(x["n"] == cut for x in ch["shots"]):
                return m, [{"n": x["n"], "zoom": x["zoom"], "dur": x["dur"]} for x in ch["shots"]]
    return m, None


def yt(vid, t):
    """원본 유튜브의 해당 장면 링크(초 단위, 컷 시작 1초 전부터)"""
    return f"https://www.youtube.com/watch?v={vid}&t={max(0, int(t) - 1)}s"


def main(mode="private", out=LIB):
    public = mode == "public"  # 공개판: 원본 화면(사진) 없이 유튜브 해당 장면 링크로 대체
    tax = jload(os.path.join(LIB, "taxonomy.json"))
    eps = jload(os.path.join(LIB, "episodes.json"))
    tkey = {t["key"]: t for t in tax}
    entries, batches = [], []
    for bp in sorted(glob.glob(os.path.join(LIB, "batches", "B[0-9][0-9].json"))):
        b = jload(bp)
        batches.append({"batch": b["batch"], "date": b["date"], "source": b["source"], "n": len(b["entries"])})
        for e in b["entries"]:
            vid = e["video"]
            vdir = os.path.join(LIB, "videos", vid)
            cuts = {s["idx"]: s for s in jload(os.path.join(vdir, "cuts.json"))["shots"]}
            cut = cuts[e["cut"]]
            zg = jload(os.path.join(vdir, "zoom_groups.json")) if os.path.exists(os.path.join(vdir, "zoom_groups.json")) else {}
            reuse, chain = (None, None) if e.get("no_chain") else chain_of(zg, e["cut"])  # no_chain: 자동 줌 탐지가 틀린 컷
            t = e.get("t", (cut["t_in"] + cut["t_out"]) / 2)
            vertical = eps.get(vid, {}).get("format", "").startswith("세로")
            chain_items = [dict(x, yt=yt(vid, cuts[x["n"]]["t_in"]), at=fmt(cuts[x["n"]]["t_in"]),
                                img=None if public else frame(vid, cuts[x["n"]]["t_in"] + 0.05, os.path.join(LIB, "frames", vid, f"c{x['n']:03d}.jpg")))
                           for x in (chain or [])]
            entries.append(dict(e, id=f"{b['batch']}-{e['no']:02d}", batch=b["batch"], ep=eps.get(vid, {}).get("title", vid),
                                shot_img=None if public else f"screens/{b['batch']}/{e['no']:02d}.jpg",
                                frame_img=None if public else frame(vid, t, os.path.join(LIB, "frames", vid, f"c{e['cut']:03d}_m.jpg")),
                                yt=yt(vid, cut["t_in"]), at=fmt(cut["t_in"]),
                                time=f"{fmt(cut['t_in'])}–{fmt(cut['t_out'])}", dur=cut["dur"], reuse=reuse, chain=chain_items,
                                prompt_full=e["prompt"] if e.get("graphic") else compose(e["prompt"], vertical), model_names=[MODELS[m]["name"] for m in e["models"] if m in MODELS]))
    # 샷 종류별 장: 주 분류 = types[0], 다른 장에는 '함께 해당' 링크만
    chapters = []
    for t in tax:
        prim = [e for e in entries if e["types"][0] == t["key"]]
        sec = [e for e in entries if t["key"] in e["types"][1:]]
        chapters.append(dict(t, primary=prim, secondary=sec, count=len(prim) + len(sec)))
    type_count = Counter(k for e in entries for k in e["types"])
    ep_count = Counter(e["ep"] for e in entries)
    # 판매 소품 목록(판매 후보만)
    sell = OrderedDict()
    for e in entries:
        for item, note in e.get("props", []):
            if "판매 후보" in note:
                sell.setdefault(item, {"item": item, "note": note, "ids": []})["ids"].append(e["id"])
    ep_list = [dict(v, id=k, shots=[e for e in entries if e["video"] == k]) for k, v in eps.items() if any(e["video"] == k for e in entries)]
    for ep in ep_list:  # 에피소드 전체 컷 띠(가운데 프레임) — 공개판은 사진 없음
        cuts = jload(os.path.join(LIB, "videos", ep["id"], "cuts.json"))["shots"]
        ep["strip"] = [] if public else [{"n": s["idx"], "dur": s["dur"], "img": f"videos/{ep['id']}/shots/s{s['idx']:02d}_m.jpg",
                                          "picked": any(e["cut"] == s["idx"] and e["video"] == ep["id"] for e in entries)} for s in cuts]
    md = render_md(batches, entries, chapters, ep_list, sell)
    kit = {"ANIMALS": ANIMALS, "ACCESSORIES": ACCESSORIES, "HERO_SUFFIX": HERO_SUFFIX, "DEFAULT": DEFAULT}
    env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "tools", "onepage")), autoescape=select_autoescape(["html"]))
    dump = lambda o: json.dumps(o, ensure_ascii=False).replace("</", "<\\/")
    html = env.get_template("shotlib.html").render(
        public=public, batches=batches, entries=entries, chapters=chapters, eps=ep_list, sell=list(sell.values()), type_count=type_count,
        ep_count=ep_count, tkey=tkey, hero_suffix=HERO_SUFFIX, hair=HAIR_TOPKNOT, negative=NEGATIVE,
        css=open(os.path.join(ROOT, "tools", "static", "style.css"), encoding="utf-8").read(),
        js=open(os.path.join(ROOT, "tools", "onepage", "onepage.js"), encoding="utf-8").read(),
        kit_json=dump(kit), chunks_json=dump([{"v": "common", "md": md}]))
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "샷도감.html"), "w", encoding="utf-8").write(html)
    open(os.path.join(out, "샷도감.md"), "w", encoding="utf-8").write(md)
    if public:  # 웹·AI가 바로 읽는 텍스트본
        open(os.path.join(out, "샷도감.txt"), "w", encoding="utf-8").write(md)
    print(f"샷도감({'공개' if public else '개인'}): 배치 {len(batches)}개 · 스크린샷 {len(entries)}장 · 에피소드 {len(ep_list)}개 · "
          f"샷 종류 {sum(1 for c in chapters if c['count'])}개 · 판매 후보 {len(sell)}개 → {out}")


def render_md(batches, entries, chapters, ep_list, sell):
    L = ["# 햄찌 샷 도감 — 새 에피소드 만들 때 참고하는 샷·귀여움·판매 소품 사전",
         f"배치 {', '.join(b['batch'] + '(' + str(b['n']) + '장)' for b in batches)} · 스크린샷 {len(entries)}장 · 원본 영상 컷과 1:1 대조",
         "\n## 캐릭터 기본값 (모든 주인공 프롬프트 끝에 자동으로 붙음)", HERO_SUFFIX]
    for c in chapters:
        if not c["count"]:
            continue
        L += [f"\n## {c['name']} — {c['short']}", f"- 만드는 법: {c['recipe']}", f"- 프롬프트 요령: {c['prompt_hint']}"]
        if c["secondary"]:
            L.append("- 이 요소가 함께 들어간 컷: " + ", ".join(e["id"] for e in c["secondary"]))
        for e in c["primary"]:
            L += [f"\n### {e['id']} 「{e['ep']}」 컷 #{e['cut']} {e['time']} ({e['dur']:.2f}초) · {e['size']} · {e['angle']}",
                  f"- 원본 이 장면: {e['yt']}",
                  *([f"- ⭐ 내 메모: {e['memo']}"] if e.get("memo") else []),
                  f"- 화면: {e['what']}", f"- 귀여운 포인트: {', '.join(e['cute'])}", f"- 자막: {e['caption']}", f"- 편집: {e['edit']}"]
            if e["chain"]:
                L.append("- 같은 원본 줌 체인: " + " → ".join(f"#{x['n']} ×{x['zoom']}({x['dur']:.2f}초, {x['at']})" for x in e["chain"]))
            if e.get("props"):
                L.append("- 소품: " + " / ".join(f"{a} — {b}" for a, b in e["props"]))
            L += [f"- 이미지 프롬프트: {e['prompt_full']}", f"- 영상 프롬프트: {e['motion']}", f"- 추천 모델: {' > '.join(e['model_names'])}"]
    for ep in ep_list:
        L += [f"\n## 에피소드 「{ep['title']}」 {ep['url']}", f"- {ep['format']} · {ep['series']}", f"- {ep['stats']}", f"- {ep['cuts']}", f"- {ep['tools']}"]
        L += [f"  - {b}" for b in ep["beats"]] + [f"- {n}" for n in ep["notes"]]
    L += ["\n## 판매 소품 후보 (이번 배치에서 나온 것)", "| 소품 | 메모 | 나온 컷 |", "|---|---|---|"]
    L += [f"| {s['item']} | {s['note']} | {', '.join(s['ids'])} |" for s in sell.values()]
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    # python tools/build_shotlib.py                  → 개인판(사진 포함) shotlib/샷도감.html
    # python tools/build_shotlib.py public <출력폴더>  → 공개판(사진 대신 유튜브 해당 장면 링크)
    if len(sys.argv) > 2 and sys.argv[1] == "public":
        main("public", sys.argv[2])
    else:
        main()
