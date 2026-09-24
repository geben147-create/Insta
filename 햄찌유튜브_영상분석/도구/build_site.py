"""분석 데이터 → HTML 페이지(index + 영상별 1페이지).
사용: python tools/build_site.py v1 v2 v3"""
import csv, glob, json, math, os, re, shutil, statistics, sys
from collections import Counter
from jinja2 import Environment, FileSystemLoader, select_autoescape
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kitdata import ANIMALS, ACCESSORIES, MODELS, IMAGE_MODELS, AUDIO_MODELS, NEGATIVE, GEN_HINT, HERO_SUFFIX, WHO_COLOR, WHO_KO  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, "site")
FPS = 30
TR_KO = {"cut": "하드컷", "dissolve": "디졸브", "zoomblur": "줌 블러"}
FX_KO = {"crash_zoom": "크래시 줌", "push_in_slow": "느린 줌인(편집)", "dip_out": "암전(딥 투 블랙)", "whip": "휩 팬", "flash_in": "플래시",
         "shake": "흔들림", "sparkle": "반짝 스티커", "spinner": "로딩 스피너", "math": "수식 오버레이", "emoji": "이모지 얼굴 가림", "glitch": "글리치 자막"}
CAP_CLS = {"LabelHero": "cap-label-hero", "LabelName": "cap-label-name", "LineHero": "cap-line", "LineCW1": "cap-line cw1",
           "LineCW2": "cap-line cw2", "LineLeader": "cap-line leader", "Emph": "cap-emph", "EmphCW1": "cap-emph",
           "Bracket": "cap-bracket", "Paren": "cap-paren", "Pointer": "cap-pointer"}
SP_KO = {"hero": "주인공(흰색)", "cw1": "동료1(초록)", "cw2": "동료2(파랑)", "leader": "팀장(라임)", "boss": "상사", "narr": "내레이션", "friend": "친구"}


def jload(p):
    return json.load(open(p, encoding="utf-8"))


def resize(src, dst, w=480):
    if not os.path.exists(src):
        return False
    im = Image.open(src).convert("RGB")
    im.thumbnail((w, w))
    im.save(dst, quality=80)
    return True


def fmt_k(n):
    return f"{n / 10000:.1f}만" if n >= 10000 else f"{n:,}"


# ---------------- SVG ----------------
def timeline_svg(an, shots, audio, whisper, sfx, total):
    W, X0 = 1000, 40
    sx = lambda t: X0 + t / total * (W - X0 - 10)
    out = [f'<svg viewBox="0 0 {W} 232" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="편집 리듬 타임라인" font-family="sans-serif">']
    lab = lambda y, t: out.append(f'<text x="2" y="{y}" font-size="9" fill="currentColor" opacity=".6">{t}</text>')
    lab(16, "비트"); lab(58, "컷"); lab(96, "효과음"); lab(113, "대사"); lab(160, "소리")
    for i, b in enumerate(an["beats"]):
        x1, x2 = sx(b["t"][0]), sx(b["t"][1])
        fill = "#f59e0b" if b["e"] >= 0.5 else "#fcd34d" if b["e"] >= 0 else "#94a3b8" if b["e"] > -0.6 else "#475569"
        out.append(f'<rect x="{x1:.1f}" y="4" width="{max(x2 - x1 - 1, 1):.1f}" height="18" rx="3" fill="{fill}" opacity=".85"><title>{b["k"]} {b["t"][0]:.1f}–{b["t"][1]:.1f}s</title></rect>')
        if x2 - x1 > 46:
            out.append(f'<text x="{x1 + 3:.1f}" y="16.5" font-size="8.5" fill="#111">{b["k"][:9]}</text>')
    for s in shots:
        x1, x2 = sx(s["t_in"]), sx(s["t_out"])
        out.append(f'<rect data-shot="{s["n"]}" style="cursor:pointer" x="{x1:.1f}" y="30" width="{max(x2 - x1 - 0.8, 0.8):.1f}" height="44" rx="2" fill="{s["color"]}">'
                   f'<title>#{s["n"]} {s["who_ko"]} {s["t_in"]:.2f}–{s["t_out"]:.2f}s ({s["dur"]:.2f}s) {s["sz"]}</title></rect>')
        if x2 - x1 > 13:
            out.append(f'<text x="{(x1 + x2) / 2:.1f}" y="56" font-size="8" text-anchor="middle" fill="#fff" pointer-events="none">{s["n"]}</text>')
    for c in sfx:
        x = sx(float(c["t"]))
        out.append(f'<path d="M{x - 3.5:.1f},86 L{x + 3.5:.1f},86 L{x:.1f},94 Z" fill="#ef4444"><title>{float(c["t"]):.2f}s {c["s"]}</title></path>')
    for seg in whisper.get("segments", []):
        x1, x2 = sx(seg["start"]), sx(min(seg["end"], total))
        out.append(f'<rect x="{x1:.1f}" y="104" width="{max(x2 - x1, 1):.1f}" height="11" rx="2" fill="#64748b" opacity=".7"><title>대사 {seg["start"]:.2f}–{seg["end"]:.2f}s</title></rect>')
    pts = []
    for t, db in zip(audio["curve_t"], audio["rms_db"]):
        if t > total:
            break
        y = 200 - (max(min(db, 0), -60) + 60) / 60 * 72
        pts.append(f"{sx(t):.1f},{y:.1f}")
    out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="#0ea5e9" stroke-width="1.2"/>')
    out.append(f'<line x1="{X0}" y1="200" x2="{W - 10}" y2="200" stroke="currentColor" opacity=".25"/>')
    step = 5 if total > 20 else 2
    t = 0
    while t <= total + 0.01:
        x = sx(t)
        out.append(f'<line x1="{x:.1f}" y1="200" x2="{x:.1f}" y2="205" stroke="currentColor" opacity=".5"/><text x="{x:.1f}" y="216" font-size="9" text-anchor="middle" fill="currentColor" opacity=".7">{t:.0f}s</text>')
        t += step
    out.append("</svg>")
    return "".join(out)


def emotion_svg(an, total):
    W, H, X0 = 1000, 170, 40
    sx = lambda t: X0 + t / total * (W - X0 - 10)
    sy = lambda e: 85 - e * 62
    out = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="감정 곡선" font-family="sans-serif">',
           f'<line x1="{X0}" y1="85" x2="{W - 10}" y2="85" stroke="currentColor" opacity=".25" stroke-dasharray="4 4"/>',
           '<text x="2" y="27" font-size="9" fill="currentColor" opacity=".6">기쁨 +</text><text x="2" y="150" font-size="9" fill="currentColor" opacity=".6">절망 −</text>']
    pts = [(sx((b["t"][0] + b["t"][1]) / 2), sy(b["e"]), b) for b in an["beats"]]
    d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y, _ in pts)
    out.append(f'<path d="{d}" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linejoin="round"/>')
    for i, (x, y, b) in enumerate(pts):
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="4.5" fill="#f59e0b"><title>{b["k"]} ({b["e"]:+.1f})</title></circle>')
        ty = y - 10 if i % 2 == 0 else y + 18
        out.append(f'<text x="{x:.1f}" y="{ty:.1f}" font-size="9" text-anchor="middle" fill="currentColor">{b["k"][:10]}</text>')
    out.append("</svg>")
    return "".join(out)


# ---------------- 데이터 준비 ----------------
def section(md, head):
    m = re.search(re.escape(head) + r".*?```\n(.*?)```", md, re.S)
    return m.group(1).strip() if m else ""


def build_video_page(vkey, env, rank_rows, pages):
    vdir = os.path.join(ROOT, "videos", vkey)
    an, cuts = jload(os.path.join(vdir, "analysis.json")), jload(os.path.join(vdir, "cuts.json"))
    audio, whisper = jload(os.path.join(vdir, "audio.json")), jload(os.path.join(vdir, "whisper.json"))
    ocr = {x["idx"]: x for x in jload(os.path.join(vdir, "ocr_palette.json"))}
    kit = os.path.join(ROOT, "kits", vkey)
    edl = jload(os.path.join(kit, "edl.json"))
    events = jload(os.path.join(kit, "caption_events.json"))
    row = next(r for r in rank_rows if r["id"] == an["id"])
    adir = os.path.join(SITE, "assets", vkey)
    os.makedirs(adir, exist_ok=True)
    total = cuts["shots"][-1]["t_out"]
    by_n = {s["n"]: s for s in an["shots"]}
    edl_n = {s["n"]: s for s in edl["shots"]}
    shots = []
    for i, c in enumerate(cuts["shots"]):
        n = c["idx"]; s = dict(by_n[n])
        resize(os.path.join(vdir, "watch_cuts", "frames", f"cue_{i:04d}.jpg"), os.path.join(adir, f"s{n:02d}_a.jpg"), 640)
        resize(os.path.join(vdir, "shots", f"s{n:02d}_m.jpg"), os.path.join(adir, f"s{n:02d}_m.jpg"))
        resize(os.path.join(vdir, "shots", f"s{n:02d}_z.jpg"), os.path.join(adir, f"s{n:02d}_z.jpg"))
        e = edl_n[n]
        s.update({"t_in": c["t_in"], "t_out": c["t_out"], "dur": c["dur"], "frames": round(c["dur"] * FPS),
                  "color": WHO_COLOR.get(s["who"], "#888"), "who_ko": WHO_KO.get(s["who"], s["who"]),
                  "img_a": f"assets/{vkey}/s{n:02d}_a.jpg", "img_m": f"assets/{vkey}/s{n:02d}_m.jpg", "img_z": f"assets/{vkey}/s{n:02d}_z.jpg",
                  "palette": ocr.get(n, {}).get("palette", [])[:4], "tr_label": TR_KO.get(e["tr"], e["tr"]),
                  "fx_labels": [FX_KO.get(f, f) for f in e["fx"]] + ([f"화면비 {e['frame']}"] if e["frame"] != "full" else []),
                  "sp_ko": SP_KO.get(s.get("cap", {}).get("sp", "hero"), ""), "gen_hint": GEN_HINT.get(s["gen"], ""),
                  "models": [dict(MODELS[m], key=m) for m in s["m"] if m in MODELS]})
        shots.append(s)
    durs = [s["dur"] for s in shots]
    speech = sum(min(g["end"], total) - g["start"] for g in whisper["segments"]) / total * 100
    base = min(1, len(audio["onsets"]) * 0.16 / total) * 100
    gen_shots = [s for s in shots if s["gen"] not in ("still", "edit")]
    st = {"n": len(shots), "dur": f"{total:.1f}", "asl": f"{statistics.mean(durs):.2f}", "asl_f": round(statistics.mean(durs) * FPS),
          "med": f"{statistics.median(durs):.2f}", "min": f"{min(durs):.2f}", "max": f"{max(durs):.2f}",
          "cpm": f"{len(shots) / total * 60:.0f}", "speech": f"{speech:.0f}", "bpm": audio["bpm_est"], "sync": audio["cut_onset_sync_pct"],
          "base": f"{base:.0f}", "silence": f"{audio['silence_ratio'] * 100:.0f}", "lufs": audio["ebur128"].get("I_LUFS"),
          "lra": audio["ebur128"].get("LRA_LU"), "tp": audio["ebur128"].get("TruePeak_dBFS"),
          "still_n": len(shots) - len(gen_shots), "gen_est": math.ceil(len(gen_shots) / 2.5)}
    sfx_csv = list(csv.DictReader(open(os.path.join(kit, "sfx_cues.csv"), encoding="utf-8-sig")))
    sfx_table = []
    for c in an["sound"]["sfx"]:
        f = next((r["file"] for r in sfx_csv if abs(float(r["t"]) - float(c["t"])) < 0.01 and r["desc"] == c["s"]), "-")
        sfx_table.append({"t": float(c["t"]), "s": c["s"], "why": c["why"], "file": f})
    # 자막 데모: 원본 자막 영역(하단 26%)을 흐리게 가린 배경 위에 새 예시 문구를 측정 위치로 올림
    from PIL import ImageFilter
    bg_shot = next((s for s in shots if s["who"] in ("hero", "hero_costume") and "MS" in s["sz"]), shots[0])
    src_bg = Image.open(os.path.join(vdir, "shots", f"s{bg_shot['n']:02d}_m.jpg")).convert("RGB")
    w, h = src_bg.size
    band = src_bg.crop((0, int(h * 0.74), w, h)).filter(ImageFilter.GaussianBlur(28))
    src_bg.paste(Image.eval(band, lambda px: int(px * 0.55)), (0, int(h * 0.74)))
    src_bg.save(os.path.join(adir, "capdemo_bg.jpg"), quality=82)
    groups = {}
    for ev in events:
        groups.setdefault((ev["start"], ev["shot"]), []).append(ev)
    wants = [("LabelHero", "LineHero"), ("LabelName", "LineCW1"), ("LabelName", "LineCW2"), ("LabelName", "LineLeader"), ("LabelHero", "LineLeader"),
             ("Emph",), ("EmphCW1",), ("Bracket",), ("Paren",), ("Pointer",), ("LabelHero", "Bracket")]
    demos = []
    for want in wants:
        for key in sorted(groups):
            evs = groups[key]
            styles = {e["style"] for e in evs}
            if set(want) <= styles:
                upright = not any("기울임" in st.get("spec", "") and "기울임 없는" not in st.get("spec", "")
                                  for st in an["captions"]["styles"] if st.get("css") == "label-hero")
                demos.append({"bg": f"assets/{vkey}/capdemo_bg.jpg",
                              "caps": [{"cls": CAP_CLS[e["style"]] + (" upright" if upright and e["style"] == "LabelHero" else ""), "text": e["text"]}
                                       for e in evs if e["style"] in want]})
                break
        if len(demos) >= 4:
            break
    md = open(os.path.join(kit, "PROMPTS.md"), encoding="utf-8").read()
    hf_lines = open(os.path.join(kit, "hyperframes", "index.html"), encoding="utf-8").read().splitlines()
    test_p = os.path.join(kit, "test_result.txt")
    kit_test = open(test_p, encoding="utf-8").read().strip() if os.path.exists(test_p) else "아직 조립 테스트 전"
    mcount = Counter(m for s in an["shots"] for m in s["m"])
    model_rows = [dict(MODELS[k], count=v) for k, v in mcount.most_common() if k in MODELS]
    human_cast = [(k, c) for k, c in an["cast"].items() if k != "hero" and c.get("en")]
    legend = [(WHO_KO[k], WHO_COLOR[k]) for k in dict.fromkeys(s["who"] for s in shots) if k in WHO_KO]
    page_js = json.dumps({"cast": an["cast"], "sets": an["sets"], "look": an["look"], "costume": an["adapt"].get("costume", "")}, ensure_ascii=False)
    thumbs = [shots[int(len(shots) * f)]["img_a"] for f in (0.05, 0.45, 0.8)]
    ctx = dict(page_title=f"{an['rank']}위 {row['title']} — 컷 분석", active=vkey, pages=pages, today=TODAY, an=an, v=row, st=st, shots=shots,
               thumbs=thumbs, timeline_svg=timeline_svg(an, shots, audio, whisper, an["sound"]["sfx"], total),
               emotion_svg=emotion_svg(an, total), legend=legend, cap_demos=demos, human_cast=human_cast, sfx_table=sfx_table,
               suno_list=[("suno", "메인 BGM"), ("suno2", "구간 2"), ("suno3", "구간 3")], kit_rel=f"../kits/{vkey}",
               prompt_ff=section(md, "## A."), prompt_hf=section(md, "## B."), hf_excerpt="\n".join(hf_lines[:60]) + "\n  …",
               edl_special=[e for e in edl["shots"] if e["tr"] != "cut" or e["fx"] or e["frame"] != "full"], kit_test=kit_test,
               model_rows=model_rows, page_js=page_js)
    html = env.get_template("video.html").render(**ctx)
    open(os.path.join(SITE, f"{vkey}.html"), "w", encoding="utf-8").write(html)
    return {"shots": shots, "st": st, "an": an}


def build_index(env, rank, pages, built):
    rows = rank["rows"][:10]
    maxv = rows[0]["vpd"]
    sub_files = sorted(glob.glob(os.path.join(ROOT, "subs", "[0-9][0-9]_*.txt")))
    top10 = []
    page_by_id = {p["id"]: p for p in pages}
    for i, r in enumerate(rows, 1):
        fs = [f for f in sub_files if r["id"] in os.path.basename(f)]
        subs = [{"href": "../subs/" + os.path.basename(f), "lang": os.path.basename(f).rsplit(".", 2)[-2]} for f in fs]
        top10.append({"rank": i, "title": r["title"], "url": r["url"], "upload": r["upload_date"], "age": f"{r['age_days']:.1f}",
                      "duration": r["duration"], "views": r["views"], "vpd": int(r["vpd"]), "bar": max(r["vpd"] / maxv * 100, 0.8),
                      "outlier": r["outlier_x"], "cpk": r["comments_per_1k"], "subs": subs,
                      "page": f"{page_by_id[r['id']]['key']}.html" if r["id"] in page_by_id else None})
    flat = jload(os.path.join(ROOT, "data", "videos_flat.json"))
    pool = rank["rows"]
    slots = Counter(r["upload_time_kst"][11:] for r in pool if r.get("upload_time_kst"))
    slot, cnt = slots.most_common(1)[0]
    ch = {"subs": fmt_k(flat.get("channel_follower_count") or 0), "total": rank["channel_total_videos_tab"], "median": fmt_k(int(rank["median_views"])),
          "dur": f"{statistics.median(r['duration'] for r in pool):.0f}", "slot": f"{slot} ({cnt}/{len(pool)})",
          "subs_ratio": f"{sum(1 for r in pool if r['subtitles'])}/{len(pool)}"}
    compare = [
        ("형식", [b["an"]["fmt"] for b in built]),
        ("길이 · 컷 · 평균 컷", [f"{b['st']['dur']}초 · {b['st']['n']}컷 · {b['st']['asl']}초" for b in built]),
        ("분당 컷 수", [b["st"]["cpm"] for b in built]),
        ("대사 비율 · 원본 음량", [f"{b['st']['speech']}% · {b['st']['lufs']} LUFS" for b in built]),
        ("핵심 구조", [" → ".join(b["an"]["formula"][:4]) + " …" for b in built]),
        ("자막 스타일", [", ".join(s["name"] for s in b["an"]["captions"]["styles"][:4]) for b in built]),
        ("사람 처리", [", ".join(c["role"] for k, c in b["an"]["cast"].items() if k != "hero") for b in built]),
    ]
    dna = ["실사풍 동물 × 한국 직장인·일상 공감 소재. 동물은 진짜 동물처럼, 상황은 사람처럼",
           "30~45초 가로 16:9(4K 업로드). 쇼츠 탭이 아닌 일반 동영상 탭에서도 짧은 길이로 승부",
           "자막 3층 구조(상황 라벨 · 화자별 색 대사 · 강조)로 소리 없이 봐도 100% 이해",
           "사람은 입 아래로 얼굴을 자르거나(오피스) 이모지로 가림(브이로그) → 시선 집중 + AI 얼굴 일관성 문제 회피",
           f"업로드 시각 고정: 최근 30개 중 {cnt}개가 {slot}(퇴근 직전). 영어·일본어 자막으로 해외 시청까지 확장",
           "반전 설계: 기대 → 더 나쁜 현실(1위) / 가짜 엔딩 → 진짜 하이라이트(2위) / 복선 → 회수(3위)",
           "편집은 음악 박자가 아니라 대사·리액션 타이밍으로 자름(컷-박자 일치율이 우연 수준)"]
    workflow = [("캐릭터 시트", "선택한 동물의 정면·측면·뒷모습·전신을 한 장에. 모든 컷의 참조 이미지"),
                ("세트·인물 기준 이미지", "책상, 파티션, 동료(얼굴 크롭) 등 반복되는 배경·인물을 먼저 1장씩"),
                ("컷별 키프레임", "각 페이지의 ① 이미지 프롬프트로 컷 첫 장면 생성(참조: 시트 + 세트)"),
                ("영상 생성", "② 영상 프롬프트 + 1순위 모델로 5초 생성. 배치별로 묶어 생성하고 잘라 쓰기"),
                ("목소리·음악·효과음", "TTS(주인공은 피치 +7반음), Suno BGM, 효과음 큐 시트대로 준비"),
                ("편집", "kits/vN 의 FFmpeg 또는 HyperFrames 키트로 조립 → 컷 검증"),
                ("업로드", "평일 17:45, 짧은 감정형 제목, 영어·일본어 자막, AI 합성 콘텐츠 공개 체크")]
    gen_master = """[작업 폴더] kimhamzzi_analysis (kits/v1 기준 예시 — v2·v3 도 같은 방식)
[목표] site/v1.html 에서 동물을 고른 뒤 '전체 프롬프트 .txt 저장'으로 받은 파일(v1_prompts.txt)로 1위 영상을 다른 동물로 재현할 이미지·영상을 만든다.
[도구] pollo-generate 스킬(또는 Pollo MCP)
[순서]
1) 캐릭터 시트 1장 생성 (nano-banana-pro, 16:9, 2K) → 파일 경로 보고 → 🔴 내 승인 대기
2) 세트·인물 기준 이미지 생성(책상, 파티션, 동료1, 동료2, 상사 — 사람은 얼굴이 입 위로 잘리게) → 승인 대기
3) 배치 A부터 컷별 키프레임 이미지 생성 (참조: 캐릭터 시트 + 해당 세트 이미지)
4) 🔴 영상 생성 전에 pollo_estimate_generation_cost 로 배치별 예상 크레딧 표를 보여주고, 내 승인 후에만 진행
5) 컷마다 1순위 모델로 5초·1080p 생성 → kits/v1/clips/sNN.mp4 로 저장 (NN = 페이지 컷 번호)
6) 대안 모델 비교는 배치별 대표 컷 1개만 (A/B 결과 표로 보고)
7) 끝나면 kits/v1 에서 python build_ffmpeg.py --check 결과 보고
[금지] 승인 없는 크레딧 사용, 원본 영상 캡처를 참조 이미지로 업로드, 원본 대사·캐릭터 이름 사용"""
    ctx = dict(page_title="김햄찌 떡상 분석 — Top10 & 상위 3개", active="index", pages=pages, today=TODAY, ch=ch, top10=top10,
               compare=compare, dna=dna, workflow=workflow, gen_master=gen_master,
               video_models=[MODELS[k] for k in MODELS if k not in ("still", "edit")], image_models=IMAGE_MODELS, audio_models=AUDIO_MODELS)
    open(os.path.join(SITE, "index.html"), "w", encoding="utf-8").write(env.get_template("index.html").render(**ctx))


TODAY = "2026-09-23"

if __name__ == "__main__":
    vkeys = sys.argv[1:] or ["v1", "v2", "v3"]
    os.makedirs(os.path.join(SITE, "assets"), exist_ok=True)
    for f in ("style.css", "app.js"):
        shutil.copy(os.path.join(ROOT, "tools", "static", f), os.path.join(SITE, "assets", f))
    with open(os.path.join(SITE, "assets", "data.js"), "w", encoding="utf-8") as f:
        f.write("window.KIT = " + json.dumps({"ANIMALS": ANIMALS, "ACCESSORIES": ACCESSORIES, "MODELS": MODELS, "NEGATIVE": NEGATIVE,
                                               "HERO_SUFFIX": HERO_SUFFIX}, ensure_ascii=False) + ";\n")
    env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "tools", "templates")), autoescape=select_autoescape(["html"]))
    rank = jload(os.path.join(ROOT, "data", "ranking.json"))
    TODAY = rank["today"]
    pages = []
    for v in vkeys:
        an = jload(os.path.join(ROOT, "videos", v, "analysis.json"))
        r = next(x for x in rank["rows"] if x["id"] == an["id"])
        cuts = jload(os.path.join(ROOT, "videos", v, "cuts.json"))
        pages.append({"key": v, "rank": an["rank"], "id": an["id"], "title": r["title"], "fmt": an["fmt"], "n": len(cuts["shots"]),
                      "dur": f"{cuts['shots'][-1]['t_out']:.1f}", "asl": f"{statistics.mean(s['dur'] for s in cuts['shots']):.2f}",
                      "thumb": f"assets/{v}/s{max(1, len(cuts['shots']) // 3):02d}_a.jpg"})
    built = [build_video_page(v, env, rank["rows"], pages) for v in vkeys]
    build_index(env, rank, pages, built)
    print("built:", ["index.html"] + [f"{v}.html" for v in vkeys])
