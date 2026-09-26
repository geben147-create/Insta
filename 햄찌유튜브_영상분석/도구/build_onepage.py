"""모든 분석을 한 페이지(HTML) + 전체 텍스트(MD)로 합치기.
- public : 원본 캡처·자막 원문 없음 (GitHub 공개용)
- private: 캡처 사진(내장) + 자막 원문 포함 (개인 ZIP용)
사용: python tools/build_onepage.py <출력폴더> public|private"""
import base64, csv, glob, io, json, math, os, re, statistics, sys
from collections import Counter
from jinja2 import Environment, FileSystemLoader, select_autoescape
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kitdata import ANIMALS, ACCESSORIES, MODELS, IMAGE_MODELS, AUDIO_MODELS, NEGATIVE, GEN_HINT, HERO_SUFFIX, WHO_COLOR, WHO_KO, CUTE_LIBRARY, SFX_LIBRARY  # noqa: E402
from build_site import timeline_svg, emotion_svg, section, fmt_k, jload, TR_KO, FX_KO, CAP_CLS, SP_KO  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
ALL_KEYS = [f"v{i}" for i in range(1, 11)]
RANK_DIR = {f"v{i}": f"{i}위" for i in range(1, 11)}
# 분석(analysis.json)과 편집 키트(edl.json)가 모두 준비된 영상만 포함
VKEYS = [v for v in ALL_KEYS if os.path.exists(os.path.join(ROOT, "videos", v, "analysis.json")) and os.path.exists(os.path.join(ROOT, "kits", v, "edl.json"))]
OUT = "."
SPEAKER_STYLE = {"LineCW1": "cw1", "EmphCW1": "cw1", "LineCW2": "cw2", "LineLeader": "leader"}
PUBLIC_DIR = "햄찌유튜브_영상분석"
DEFAULT = {"animal": "otter", "acc": "lanyard", "name": "김OO"}
HERO_TYPES = {"hero", "hero_costume", "group"}
DEFAULT_RHYTHM = ("해석: 컷과 박자 일치율이 우연 수준과 비슷하므로 <b>음악 박자가 아니라 대사·리액션 타이밍으로 자른 편집</b>입니다. "
                  "따라 만들 때는 '문장 하나 = 컷 2~3개, 리액션 컷은 0.4~0.7초'를 기준으로 자르세요.")


# ---------- 프롬프트 조립 (페이지 JS 와 같은 규칙) ----------
def hero_desc(a, acc):
    """{HERO} = 동물 외형 + 소품 (귀여움 기본값은 프롬프트 끝 'Character details' 로 따로 붙임 — 문장이 자연스럽게 이어지도록)"""
    return ", ".join(x for x in [a["en"], acc["en"]] if x)


def with_cute(tpl):
    """주인공 이미지 프롬프트 끝에 채널 귀여움 기본값을 붙임"""
    return re.sub(r"[.\s]+$", "", str(tpl)) + ". Character details: " + HERO_SUFFIX + "."


def ctx_for(an, a, acc):
    c = {"HERO": hero_desc(a, acc), "ANIMAL": a["noun"], "PUN": a["pun"]}
    if an:
        c["COSTUME"] = an["adapt"].get("costume", "")
        for k, x in an["cast"].items():
            if x.get("en"):
                c[k.upper()] = x["en"]
        for k, x in an["sets"].items():
            c[k.upper()] = x
    return c


def fill(tpl, c, name=DEFAULT["name"]):
    return re.sub(r"\{([A-Z0-9_]+)\}", lambda m: c.get(m.group(1), m.group(0)), str(tpl)).replace("{이름}", name)


def compose_img(tpl, who, look):
    s = str(tpl).strip()
    if s.startswith("("):
        return s
    if who in HERO_TYPES:
        return (re.sub(r"[.\s]+$", "", s) + ". " + look + ". Character details: " + HERO_SUFFIX +
                ". The animal must match the character reference sheet exactly (same fur color, markings and accessory).")
    return re.sub(r"[.\s]+$", "", s) + ". " + look + "."


def compose_vid(tpl, who):
    s = str(tpl).strip()
    if re.match(r"^(Edit|Still|\()", s):
        return s
    if who in HERO_TYPES:
        return s + " Keep the {ANIMAL}'s appearance, fur color and accessory identical to the reference. Realistic animal motion, no morphing."
    return s + " Realistic natural motion, no morphing."


def strip_tags(s):
    return re.sub(r"<[^>]+>", "", s or "")


def cell(s):
    return str(s if s is not None else "").replace("|", "\\|").replace("\n", " ")


def save_img(src, dst, width, quality):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src).convert("RGB")
    im.thumbnail((width, width))
    im.save(dst, "JPEG", quality=quality)


def b64img(path, width, quality):
    im = Image.open(path).convert("RGB")
    im.thumbnail((width, width))
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=quality)
    return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()


# ---------- 영상별 데이터 ----------
def video_data(v, rank_rows, mode, a0, acc0):
    vdir = os.path.join(ROOT, "videos", v)
    an, cuts = jload(os.path.join(vdir, "analysis.json")), jload(os.path.join(vdir, "cuts.json"))
    audio, whisper = jload(os.path.join(vdir, "audio.json")), jload(os.path.join(vdir, "whisper.json"))
    pal = {x["idx"]: x.get("palette", [])[:4] for x in jload(os.path.join(vdir, "ocr_palette.json"))}
    kit = os.path.join(ROOT, "kits", v)
    edl, events = jload(os.path.join(kit, "edl.json")), jload(os.path.join(kit, "caption_events.json"))
    row = next(r for r in rank_rows if r["id"] == an["id"])
    c0 = ctx_for(an, a0, acc0)
    total = cuts["shots"][-1]["t_out"]
    by_n, edl_n = {s["n"]: s for s in an["shots"]}, {s["n"]: s for s in edl["shots"]}
    feeds = {}
    for e in edl["shots"]:
        if "source" in e:
            feeds.setdefault(e["source"], []).append(e["n"])
    spc = {k: c for k, c in (an.get("speaker_colors") or {}).items() if re.fullmatch(r"#[0-9A-Fa-f]{6}", str(c))}
    base_col = {"hero": "흰색", "cw1": "초록", "cw2": "파랑", "leader": "라임"}

    def sp_label(sp):  # 화자 표시: 이 영상 배역 이름 + 실제 자막 색
        role = str((an["cast"].get(sp) or {}).get("role") or "").split("·")[0].strip()
        col = spc.get(sp) or base_col.get(sp)
        return f"{role}({col})" if role and col else (role or SP_KO.get(sp, ""))
    shots = []
    for i, c in enumerate(cuts["shots"]):
        n = c["idx"]; s = dict(by_n[n]); e = edl_n[n]
        img_tpl, vid_tpl = compose_img(s["img"], s["who"], an["look"]), compose_vid(s["mot"], s["who"])
        s.update({"reuse": {k: e[k] for k in ("source", "zoom", "cx", "cy", "src_in")} if "source" in e else None,
                  "feeds": feeds.get(n, []), "push": e.get("push"), "cute": s.get("cute") or [], "src_in": e.get("src_in", 0.5)})
        s.update({"t_in": c["t_in"], "t_out": c["t_out"], "dur": c["dur"], "frames": round(c["dur"] * FPS),
                  "color": WHO_COLOR.get(s["who"], "#888"), "who_ko": WHO_KO.get(s["who"], s["who"]), "palette": pal.get(n, []),
                  "tr_label": TR_KO.get(e["tr"], e["tr"]), "sp_ko": sp_label(s.get("cap", {}).get("sp", "hero")),
                  "fx_labels": [FX_KO.get(f, f) for f in e["fx"]] + ([f"화면비 {e['frame']}"] if e["frame"] != "full" else []),
                  "gen_hint": GEN_HINT.get(s["gen"], ""), "models": [MODELS[m] for m in s["m"] if m in MODELS],
                  "img_tpl": img_tpl, "vid_tpl": vid_tpl, "img_default": fill(img_tpl, c0), "vid_default": fill(vid_tpl, c0),
                  "act_default": fill(s["act"], c0), "lb_default": fill(s["cap"].get("lb") or "", c0),
                  "new_default": fill(s.get("new", ""), c0), "vo_default": fill(s.get("vo", ""), c0)})
        if mode == "private":  # 사진은 HTML 에 넣지 않고 같은 폴더 '사진/' 에서 불러옴 (ZIP 압축을 풀고 열기)
            rel = f"사진/{RANK_DIR[v]}"
            s["img_a"], s["img_m"], s["img_z"] = f"{rel}/컷{n:02d}_전환.jpg", f"{rel}/작은사진/컷{n:02d}_중간.jpg", f"{rel}/작은사진/컷{n:02d}_끝.jpg"
            save_img(os.path.join(vdir, "watch_cuts", "frames", f"cue_{i:04d}.jpg"), os.path.join(OUT, s["img_a"]), 1024, 80)
            save_img(os.path.join(vdir, "shots", f"s{n:02d}_m.jpg"), os.path.join(OUT, s["img_m"]), 480, 72)
            save_img(os.path.join(vdir, "shots", f"s{n:02d}_z.jpg"), os.path.join(OUT, s["img_z"]), 480, 72)
        shots.append(s)
    sby = {s["n"]: s for s in shots}
    # 생성 절약 계획: 같은 원본을 잘라 쓰는 컷(재사용)은 생성하지 않음
    own = [s for s in shots if not s["reuse"]]
    plan = {"n": len(shots), "reused": len(shots) - len(own),
            "video": sum(1 for s in own if s["gen"] in ("i2v", "i2v-fl", "ref")),
            "still": sum(1 for s in own if s["gen"] == "still"), "edit": sum(1 for s in own if s["gen"] == "edit"),
            "images": len({edl_n[s["n"]].get("setup", s["n"]) for s in own if s["gen"] != "edit"})}
    zpath = os.path.join(vdir, "zoom_groups.json")
    zg = jload(zpath) if os.path.exists(zpath) else {}
    chains = []
    for g in zg.get("groups", []):
        for ch in g["chains"]:
            items = [x for x in ch["shots"] if x["n"] in sby and (x["n"] == ch["source"] or (sby[x["n"]]["reuse"] or {}).get("source") == ch["source"])]
            if len(items) > 1:
                chains.append({"source": ch["source"], "setup": g["base"], "need": ch["need_sec"],
                               "steps": len({round(x["zoom"], 1) for x in items}), "total": round(sum(x["dur"] for x in items), 2),
                               "items": [dict(x, img=sby[x["n"]].get("img_m"), who=sby[x["n"]]["who_ko"]) for x in items]})
    chains.sort(key=lambda c: c["items"][0]["n"])
    plan["chains"] = len(chains)
    plan["three"] = sum(1 for c in chains if c["steps"] >= 3)
    plan["max_zoom"] = max([x["zoom"] for c in chains for x in c["items"]] or [1.0])
    pushes = [{"n": s["n"], "scale": s["push"]["scale"], "dur": s["dur"]} for s in shots if s["push"]]
    cute_moments = [dict(m, prompt=with_cute(m.get("prompt", "")), prompt_default=fill(with_cute(m.get("prompt", "")), c0), motion_default=fill(m.get("motion", ""), c0),
                         thumbs=[sby[k]["img_a"] for k in m.get("shots", [])[:3] if k in sby] if mode == "private" else [])
                    for m in an.get("cute_moments", [])]
    durs = [s["dur"] for s in shots]
    speech = sum(min(g["end"], total) - g["start"] for g in whisper["segments"]) / total * 100
    base = min(1, len(audio["onsets"]) * 0.16 / total) * 100
    gen_n = sum(1 for s in shots if s["gen"] not in ("still", "edit"))
    st = {"n": len(shots), "dur": f"{total:.1f}", "asl": f"{statistics.mean(durs):.2f}", "asl_f": round(statistics.mean(durs) * FPS),
          "med": f"{statistics.median(durs):.2f}", "min": f"{min(durs):.2f}", "max": f"{max(durs):.2f}", "cpm": f"{len(shots) / total * 60:.0f}",
          "speech": f"{speech:.0f}", "bpm": audio["bpm_est"], "sync": audio["cut_onset_sync_pct"], "base": f"{base:.0f}",
          "silence": f"{audio['silence_ratio'] * 100:.0f}", "lufs": audio["ebur128"].get("I_LUFS"), "lra": audio["ebur128"].get("LRA_LU"),
          "tp": audio["ebur128"].get("TruePeak_dBFS"), "still_n": len(shots) - gen_n, "gen_est": math.ceil(gen_n / 2.5)}
    sfx_csv = list(csv.DictReader(open(os.path.join(kit, "sfx_cues.csv"), encoding="utf-8-sig")))
    sfx_table = [{"t": float(c["t"]), "s": c["s"], "why": c["why"],
                  "file": next((r["file"] for r in sfx_csv if abs(float(r["t"]) - float(c["t"])) < 0.01 and r["desc"] == c["s"]), "-")}
                 for c in an["sound"]["sfx"]]
    # 자막 데모 (공개판은 중립 배경, 개인판은 원본 자막 영역을 흐린 원본 프레임)
    upright = not any("기울임" in x.get("spec", "") and "기울임 없는" not in x.get("spec", "") for x in an["captions"]["styles"] if x.get("css") == "label-hero")
    bg = None
    if mode == "private":  # 원본 자막 영역(하단 26%)을 흐리게 가린 주인공 장면
        from PIL import ImageFilter
        pick = next((s for s in shots if s["who"] in ("hero", "hero_costume") and "MS" in s["sz"]), shots[0])
        im = Image.open(os.path.join(vdir, "shots", f"s{pick['n']:02d}_m.jpg")).convert("RGB")
        w_, h_ = im.size
        band = im.crop((0, int(h_ * 0.74), w_, h_)).filter(ImageFilter.GaussianBlur(28))
        im.paste(Image.eval(band, lambda px: int(px * 0.55)), (0, int(h_ * 0.74)))
        bg = f"사진/{RANK_DIR[v]}/자막데모배경.jpg"
        os.makedirs(os.path.dirname(os.path.join(OUT, bg)), exist_ok=True)
        im.save(os.path.join(OUT, bg), quality=78)
    colors = {k: c for k, c in (an.get("speaker_colors") or {}).items() if re.fullmatch(r"#[0-9A-Fa-f]{6}", str(c))}
    groups = {}
    for ev in events:
        groups.setdefault((ev["start"], ev["shot"]), []).append(ev)
    wants = [("LabelHero", "LineHero"), ("LabelName", "LineCW1"), ("LabelName", "LineCW2"), ("LabelHero", "LineLeader"),
             ("Emph",), ("EmphCW1",), ("Bracket",), ("Paren",), ("Pointer",)]
    demos = []
    for want in wants:
        for key in sorted(groups):
            evs = groups[key]
            if set(want) <= {e["style"] for e in evs}:
                demos.append({"bg": bg, "caps": [{"cls": CAP_CLS[e["style"]] + (" upright" if upright and e["style"] == "LabelHero" else ""),
                                                  "style": f"color:{colors[SPEAKER_STYLE[e['style']]]}" if SPEAKER_STYLE.get(e["style"]) in colors else "",
                                                  "text": e["text"], "text_default": fill(e["text"], c0)} for e in evs if e["style"] in want]})
                break
        if len(demos) >= 4:
            break
    md = open(os.path.join(kit, "PROMPTS.md"), encoding="utf-8").read().replace(f"kimhamzzi_analysis/kits/{v}", f"{PUBLIC_DIR}/편집키트/{RANK_DIR[v]}")
    test_p = os.path.join(kit, "test_result.txt")
    mcount = Counter(m for s in an["shots"] for m in s["m"])
    thumbs = [shots[int(len(shots) * f)]["img_a"] for f in (0.05, 0.45, 0.8)] if mode == "private" else []
    return {"key": v, "rank": an["rank"], "title": row["title"], "row": row, "an": an, "st": st, "shots": shots, "thumbs": thumbs,
            "timeline_svg": timeline_svg(an, shots, audio, whisper, an["sound"]["sfx"], total).replace('data-shot="', f'data-jump="#{v}-s'),
            "emotion_svg": emotion_svg(an, total), "legend": [(WHO_KO[k], WHO_COLOR[k]) for k in dict.fromkeys(s["who"] for s in shots) if k in WHO_KO],
            "rhythm_note": an.get("rhythm_note") or DEFAULT_RHYTHM, "cap_demos": demos, "sfx_table": sfx_table,
            "kit_rel": f"편집키트/{RANK_DIR[v]}", "kit_files": [("edl.csv", "컷 목록"), ("edl.json", "컷 규격"), ("captions.ass", "자막"), ("sfx_cues.csv", "효과음"),
                                                              ("build_ffmpeg.py", "자동 조립"), ("hyperframes/index.html", "HyperFrames"), ("편집프롬프트.md", "프롬프트")],
            "kit_test": open(test_p, encoding="utf-8").read().strip() if os.path.exists(test_p) else "조립 테스트 전",
            "prompt_ff": section(md, "## A."), "prompt_hf": section(md, "## B."), "prompts_md": md,
            "edl_special": [e for e in edl["shots"] if e["tr"] != "cut" or e["fx"] or e["frame"] != "full"],
            "model_rows": [dict(MODELS[k], count=n) for k, n in mcount.most_common() if k in MODELS],
            "plan": plan, "chains": chains, "pushes": pushes, "cute_moments": cute_moments,
            "page": {"cast": an["cast"], "sets": an["sets"], "look": an["look"], "costume": an["adapt"].get("costume", "")}}


# ---------- 이미지·클립을 편집에 넣는 법 (페이지·텍스트 공통) ----------
GUIDE = [
    ("비유로 먼저", ["편집 키트는 '레시피 카드', 생성한 이미지·영상은 '재료'입니다. 재료를 정해진 이름(sNN.mp4)으로 정해진 칸(clips 폴더)에 넣으면 레시피(edl.json)대로 자동 조리됩니다.",
                 "같은 재료를 썰어서 여러 접시에 담듯, 원본 클립 하나를 확대 배율만 바꿔 여러 컷으로 씁니다(같은 원본 줌)."]),
    ("1. 폴더와 파일 이름", ["편집키트/N위/clips/sNN.mp4 — 컷 NN의 영상(두 자리 번호). 정지 컷은 sNN.png·jpg·webp 이미지 1장만 넣어도 됨",
                        "voice/sNN.wav — 그 컷 시작에 놓을 대사 · sfx/<파일명>.wav — sfx_cues.csv 의 file 이름 그대로 · audio/bgm.mp3 — 배경음악",
                        "HyperFrames 는 hyperframes/assets/ 아래에 같은 구조(clips·voice·sfx·audio·fonts)로 복사",
                        "먼저 python build_ffmpeg.py --check → '필요한 원본 클립 N개'만 만들면 됨(재사용 컷은 목록에 안 나옴)"]),
    ("2. 컷 종류별로 무엇을 넣나", ["영상 컷(i2v·ref·i2v-fl): 5초 생성 → clips/sNN.mp4. 편집은 클립 0.5초 지점(src_in)부터 컷 길이만큼 — AI 영상 첫 0.5초는 굳어 있어서 버림",
                             "정지 컷(still): 이미지 1장 → clips/sNN.png. 키트가 컷 길이만큼 늘이고 푸시인(1.0→1.08배)",
                             "재사용 컷(edl.json 에 source 있음): 넣을 것 없음. source 컷 클립을 zoom 배율·cx/cy 중심으로 잘라 확대. src_in 은 그 클립 안에서 이어지는 위치(체인이 한 클립을 시간순으로 나눠 씀)",
                             "편집 컷(edit — 암전·플래시·타이틀 카드·프레임 1~3장짜리 섬광): 넣을 것 없음. 키트가 검은 화면·흰 섬광·자막 카드로 생성"]),
    ("3. FFmpeg 안에서 컷 하나가 거치는 순서", ["fps=30 → scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080 (화면 꽉 채우기)",
                                         "[재사용] crop=1920/z:1080/z:x:y,scale=1920:1080:flags=lanczos — x = cx×1920 − 너비/2, y = cy×1080 − 높이/2 (화면 밖으로 안 나가게 0~끝으로 제한)",
                                         "[컷 안 줌] scale=3840:2160,zoompan=z='1+(s−1)·min(on/(30·L),1)':x='ox·iw·(1−1/zoom)':y='oy·ih·(1−1/zoom)':d=1:s=1920x1080 — 2배로 키운 뒤 잘라 떨림 방지, ox·oy 는 확대 고정점",
                                         "[크래시 줌] 0.12초 동안 1→1.25배 후 유지 · [흔들림] crop 좌표를 sin 으로 흔듦 · [딥 투 블랙] fade out · [플래시] 흰색 fade in · [휩 팬] 가로 블러",
                                         "잇기: 하드컷은 concat, 디졸브·줌블러는 xfade(앞 컷에 전환 길이만큼 여유를 붙여 총 길이 유지, 시간 단위 1/30초로 통일)",
                                         "자막: subtitles 필터로 captions.ass(13가지 스타일, 원본 측정 위치·크기·색) 입히기",
                                         "소리: 대사 adelay → 효과음 adelay+볼륨 → BGM 은 대사가 나오면 사이드체인으로 자동 줄임 → loudnorm -14 LUFS"]),
    ("4. HyperFrames 안에서 컷 하나", ["<div class=\"shotwrap\" id=\"w-sNN\"><video id=\"sNN\" src=\"assets/clips/sSS.mp4\" data-start=\"컷 시작\" data-duration=\"길이\" data-media-start=\"src_in\" data-track-index=\"0\" muted playsinline></video></div>",
                                   "재사용 컷: video 에 transform-origin:0 0; transform: translate(−z·x0px, −z·y0px) scale(z) → FFmpeg 크롭과 똑같은 영역",
                                   "컷 안 줌: 감싼 div 에 transform-origin: ox% oy% + tl.fromTo(\"#w-sNN\", {scale:1}, {scale:s, duration:L, ease:\"none\"}, 시작)",
                                   "크래시 줌 {scale:1}→{scale:1.25} 0.12초 power2.out · 줌블러 전환 {opacity:0, scale:1.35, blur 12px}→{1, 1, 0} · 디졸브 opacity 0→1(앞 컷과 겹침) · 휩 팬 xPercent −35 + blur 28px",
                                   "오버레이: 반짝 별 ✦ 3개(0.06초 간격 back.out) · 로딩 스피너(720° 회전) · 수식(위로 떠오름) · 얼굴 가림 이모지 · 흰 섬광",
                                   "타자 자막: clip-path inset 을 글자 수만큼 steps() 로 풀기(초당 약 7글자) · 글리치 자막: 가로 흔들림 + 위아래 잘림",
                                   "규칙: GSAP 타임라인 1개(paused)를 window.__timelines[\"main\"] 에 등록, 모든 시간은 edl.json 과 같게, audio 는 id 필수"]),
    ("5. 이미지를 만들 때 편집을 미리 생각하기", ["키프레임은 16:9, 2K 이상. 2배 넘게 확대될 원본(표의 '최대 배율' 참고)은 4K로 만들거나 업스케일",
                                           "재사용 체인의 원본은 '가장 넓은 구도'로 — 확대는 되지만 넓히기는 안 됨. 눈을 화면 위쪽 1/3 선 근처에 두면 어떤 배율로 잘라도 얼굴이 남음",
                                           "영상 길이 = 그 원본을 쓰는 컷들의 길이 합 + 0.5초 이상(생성 절약표의 '생성 길이')",
                                           "대안 모델 결과는 sNN_b.mp4 로 두고 비교 후 이름만 바꿔 교체 → 다시 build_ffmpeg.py"]),
]


def md_guide():
    L = ["\n## 이미지·클립을 편집에 넣는 법 (FFmpeg · HyperFrames 상세)"]
    for title, items in GUIDE:
        L.append(f"\n### {title}")
        L += [f"- {x}" for x in items]
    return "\n".join(L) + "\n"


# ---------- 채널 공통 사전 (10개 영상 합산) ----------
def cute_catalog(vids, mode, c_common):
    """귀여운 모먼트 태그를 모든 영상에서 세고, 사전(프롬프트 조각)과 대표 컷을 붙임"""
    lib = {x["tag"] for x in CUTE_LIBRARY}
    counts, examples = Counter(), {}
    for d in vids:
        for s in d["shots"]:
            for t in s["cute"]:
                counts[t] += 1
                examples.setdefault(t, []).append((d, s))
    rows = []
    for x in CUTE_LIBRARY:
        pick, seen = [], set()
        for d, s in examples.get(x["tag"], []):  # 영상마다 1컷씩 골고루
            if d["key"] not in seen:
                pick.append((d, s)); seen.add(d["key"])
            if len(pick) >= 4:
                break
        rows.append(dict(x, count=counts.get(x["tag"], 0), img_default=fill(x["img"], c_common), mot_default=fill(x["mot"], c_common),
                         ex=[{"key": d["key"], "rank": d["rank"], "n": s["n"], "img": s.get("img_a") if mode == "private" else None} for d, s in pick]))
    rows.sort(key=lambda r: -r["count"])
    other = [(t, c) for t, c in counts.most_common() if t not in lib]
    tagged = sum(1 for d in vids for s in d["shots"] if s["cute"])
    moments = sum(len(d["cute_moments"]) for d in vids)
    return {"rows": rows, "other": other, "tagged": tagged, "total": sum(len(d["shots"]) for d in vids), "moments": moments}


def zoom_stats(vids):
    """같은 원본 줌 재사용 통계"""
    rows = [dict(d["plan"], rank=d["rank"], key=d["key"], title=d["title"]) for d in vids]
    zs = [x["zoom"] for d in vids for c in d["chains"] for x in c["items"] if x["n"] != c["source"]]
    buckets = [("1.0~1.3배(살짝 당김)", 1.0, 1.3), ("1.3~1.8배(한 단계)", 1.3, 1.8), ("1.8~2.5배(두 단계)", 1.8, 2.5),
               ("2.5~3.5배(초근접)", 2.5, 3.5), ("3.5배 이상(눈·코만)", 3.5, 99)]
    dist = [{"label": lab, "n": sum(1 for z in zs if lo <= z < hi)} for lab, lo, hi in buckets]
    mx = max([b["n"] for b in dist] or [1]) or 1
    for b in dist:
        b["bar"] = b["n"] / mx * 100
    reused_durs = [x["dur"] for d in vids for c in d["chains"] for x in c["items"] if x["n"] != c["source"]]
    top = sorted(((d, c) for d in vids for c in d["chains"]), key=lambda dc: (-dc[1]["steps"], -len(dc[1]["items"])))[:8]
    tot = {k: sum(r[k] for r in rows) for k in ("n", "reused", "video", "still", "edit", "images", "chains", "three")}
    return {"rows": rows, "dist": dist, "tot": tot, "med_zoom": f"{statistics.median(zs):.2f}" if zs else "-",
            "med_dur": f"{statistics.median(reused_durs):.2f}" if reused_durs else "-", "max_zoom": max(zs or [1.0]),
            "top": [{"rank": d["rank"], "key": d["key"], "source": c["source"], "total": c["total"],
                     "seq": " → ".join(f"#{x['n']} ×{x['zoom']}" for x in c["items"]), "items": c["items"]} for d, c in top]}


def sfx_catalog(vids):
    """효과음 사전: 키트 큐 시트(sfx_cues.csv)를 모든 영상에서 모아 종류별 횟수와 '가장 가까운 컷 기준' 타이밍을 잼"""
    counts, offs, total_an = Counter(), {}, 0
    for d in vids:
        cuts_t = [s["t_in"] for s in d["shots"]]
        total_an += len(d["an"]["sound"]["sfx"])
        for r in csv.DictReader(open(os.path.join(ROOT, "kits", d["key"], "sfx_cues.csv"), encoding="utf-8-sig")):
            t, f = float(r["t"]), r["file"]
            counts[f] += 1
            offs.setdefault(f, []).append(t - min(cuts_t, key=lambda c: abs(c - t)))
    rows = []
    for f, (ko, when, timing, vol, length, kw) in SFX_LIBRARY.items():
        o = offs.get(f, [])
        rows.append({"file": f, "ko": ko, "when": when, "timing": timing, "vol": vol, "len": length, "kw": kw, "count": counts.get(f, 0),
                     "med": f"{statistics.median(o):+.2f}초" if o else "-",
                     "within": f"{sum(1 for x in o if abs(x) <= 0.1) / len(o) * 100:.0f}%" if o else "-"})
    rows.sort(key=lambda r: -r["count"])
    allo = [x for o in offs.values() for x in o]
    return {"rows": rows, "n": len(allo), "total_an": total_an,
            "within01": f"{sum(1 for x in allo if abs(x) <= 0.1) / len(allo) * 100:.0f}" if allo else "0",
            "within03": f"{sum(1 for x in allo if abs(x) <= 0.3) / len(allo) * 100:.0f}" if allo else "0"}


def md_catalogs(cute, zoom, sfx):
    """세 공통 사전의 텍스트(MD)판"""
    L = [f"\n## 귀여운 모먼트 사전 — {len(zoom['rows'])}개 영상 {cute['total']}컷 중 {cute['tagged']}컷에서 찾은 귀여움 (영상별 대표 모먼트 {cute['moments']}개)",
         "- 모든 주인공 프롬프트에 붙는 귀여움 기본값: " + HERO_SUFFIX,
         "| 귀여운 모먼트 | 등장 컷 수 | 대표 컷 | 이미지 문구 | 움직임 문구 | 편집 팁 | 효과음 |", "|---|---|---|---|---|---|---|"]
    L += [f"| {r['tag']} | {r['count']} | {', '.join(str(e['rank']) + '위 #' + str(e['n']) for e in r['ex']) or '-'} | {cell(r['img'])} | {cell(r['mot'])} | {cell(r['edit'])} | {cell(r['sfx'])} |"
          for r in cute["rows"]]
    if cute["other"]:
        L.append("- 그 밖의 태그: " + ", ".join(f"{t}({c})" for t, c in cute["other"]))
    t = zoom["tot"]
    L += [f"\n## 같은 원본 3단 줌 — 적게 만들고 많아 보이게 (10개 영상 측정)",
          f"- 전체 {t['n']}컷 중 **{t['reused']}컷은 다른 컷의 원본을 확대해 재사용** → 실제로 만들 것: 영상 {t['video']}개 + 정지 이미지 {t['still']}장 + 편집 효과 {t['edit']}컷 (키프레임 이미지 {t['images']}장)",
          f"- 줌 체인 {t['chains']}개, 그중 3단 이상 {t['three']}개 · 재사용 컷 배율 중앙값 {zoom['med_zoom']}배(최대 {zoom['max_zoom']}배) · 재사용 컷 길이 중앙값 {zoom['med_dur']}초",
          "| 순위 | 컷 | 재사용 | 영상 생성 | 정지 이미지 | 편집만 | 키프레임 이미지 | 줌 체인(3단+) | 최대 배율 |", "|---|---|---|---|---|---|---|---|---|"]
    L += [f"| {r['rank']} | {r['n']} | {r['reused']} | {r['video']} | {r['still']} | {r['edit']} | {r['images']} | {r['chains']}({r['three']}) | {r['max_zoom']} |" for r in zoom["rows"]]
    L += ["- 배율 분포: " + " · ".join(f"{b['label']} {b['n']}컷" for b in zoom["dist"]), "- 대표 줌 체인(단계가 많은 순):"]
    L += [f"  - {x['rank']}위 원본 #{x['source']}: {x['seq']} (합계 {x['total']:.2f}초)" for x in zoom["top"]]
    L += ["- 만드는 법: ① 체인의 원본(가장 넓은 컷)만 이미지 생성 → ② 그 이미지로 영상 1개를 체인 합계 길이+0.5초 이상(보통 5~10초) 생성 → "
          "③ 편집에서 edl.json 의 source·zoom·cx·cy·src_in 대로 잘라 확대(키트가 자동 처리). 2배 넘게 확대할 원본은 4K 생성 또는 업스케일",
          "- 연출 규칙: 넓게(1배) → 가깝게(1.5~2배) → 넓게 → 더 가깝게(2.5~4배, 눈·표정만) 처럼 오가며 대사 한 문장이나 리액션 하나마다 한 단씩. 한 단 0.4~1.2초",
          f"\n## 효과음 사전 — {len(zoom['rows'])}개 영상 키트 큐 {sfx['n']}개(분석 전체 {sfx['total_an']}개, BGM 변화·정적 포함)",
          f"- 타이밍 측정: 효과음의 {sfx['within01']}%가 가장 가까운 컷 시작 ±0.1초 안, {sfx['within03']}%가 ±0.3초 안 → **효과음은 컷에 붙인다**",
          "- 볼륨 기준(키트 vol 0~1): 대사 1.0 · 효과음 0.6~0.8 · 앰비언스 0.3~0.5 · BGM 0.35(대사 나올 때 자동 덕킹) · 최종 -14 LUFS",
          "- 무료 소스: Pixabay 효과음(상업 이용 무료·출처 표기 불필요) · Freesound(CC0 필터) · YouTube 오디오 보관함 — 아래 영문 검색어 그대로 검색",
          "| 효과음 | 키트 파일 | 10개 영상 사용 | 쓰는 때 | 컷 기준 타이밍(권장) | 측정 중앙값(컷 대비) | ±0.1초 안 | 볼륨 | 길이 | 검색어 |", "|---|---|---|---|---|---|---|---|---|---|"]
    L += [f"| {r['ko']} | {r['file']} | {r['count']} | {cell(r['when'])} | {cell(r['timing'])} | {r['med']} | {r['within']} | {r['vol']} | {r['len']} | {r['kw']} |" for r in sfx["rows"]]
    return "\n".join(L) + "\n"


# ---------- 전체 텍스트(MD) ----------
def md_video(d):
    an, st, row = d["an"], d["st"], d["row"]
    L = [f"\n---\n\n# {an['rank']}위 「{d['title']}」 — {an['fmt']}\n",
         f"- 원본: {row['url']} · 업로드 {row['upload_time_kst']} KST",
         f"- 조회수 {row['views']:,} · 일평균 {int(row['vpd']):,} · 길이 {st['dur']}초 · {st['n']}컷 · 평균 컷 {st['asl']}초({st['asl_f']}프레임) · 분당 {st['cpm']}컷",
         f"- 대사 비율 {st['speech']}% · 원본 음량 {st['lufs']} LUFS(권장 -14) · 가장 짧은 컷 {st['min']}초 · 가장 긴 컷 {st['max']}초 · 중앙값 {st['med']}초",
         f"\n## 한 줄 요약\n{an['logline']}", "\n## 떡상 공식\n" + " → ".join(an["formula"]), "\n## 왜 떡상했나"]
    L += [f"{i}. {w}" for i, w in enumerate(an["why"], 1)]
    L += [f"\n## 편집 리듬\n- 배경 리듬 추정 {st['bpm']} BPM(참고용) · 컷-박자 일치 {st['sync']}% (우연 기준 {st['base']}%) · 무음 {st['silence']}%",
          f"- {strip_tags(d['rhythm_note'])}", "\n## 스토리 비트", "| 비트 | 구간(초) | 감정 | 내용 |", "|---|---|---|---|"]
    L += [f"| {cell(b['k'])} | {b['t'][0]:.2f}–{b['t'][1]:.2f} | {b['e']:+.1f} | {cell(b['ko'])} |" for b in an["beats"]]
    cap = an["captions"]
    L += [f"\n## 자막 시스템 (원본 측정값)\n{cap['summary']}"] + [f"- **{x['name']}**: {x['spec']} — {x['use']}" for x in cap["styles"]]
    L += [f"- **타자 효과**: {cap['typing']}", f"- **장식**: {cap['decor']}", f"\n## 컷별 분석 ({st['n']}컷)",
          "위치(3×3) 칸 번호: 1=왼쪽 위 … 5=가운데 … 9=오른쪽 아래"]
    for s in d["shots"]:
        fx = (" · 효과: " + ", ".join(s["fx_labels"])) if s["fx_labels"] else ""
        L += [f"\n### #{s['n']:02d} {s['t_in']:.2f}–{s['t_out']:.2f}s ({s['dur']:.2f}초, {s['frames']}프레임) · {s['who_ko']} · {s['sz']} · {s['ang']} · 전환: {s['tr_label']}{fx}",
              f"- 카메라: {s['cam']}", f"- 위치(3×3): {', '.join(map(str, s['grid'])) or '-'} · 대표 색: {', '.join(p['hex'] for p in s['palette'])}",
              f"- 동작·표정: {s['act']}", f"- 배경: {s['bg']}",
              f"- 자막: " + ((f"라벨 [{s['cap']['lb']}] " if s['cap'].get('lb') else "") + (f"대사 [{s['cap']['ln']}] ({s['sp_ko']} · {s['cap']['fx']})" if s['cap'].get('ln') else "") or "없음"),
              f"- 전환: {s['tr']} · 효과음: {s['sfx']}", f"- 편집 기법: {s['tech']} — {s['why']}",
              f"- 새 대본 예시: {s.get('new', '')}" + (f" / 목소리만: {s['vo']}" if s.get("vo") else ""),
              f"- 이미지 프롬프트: {s['img_tpl']}", f"- 영상 프롬프트: {s['vid_tpl']}",
              f"- 생성 설정: {s['gen_hint']} · 편집 사용 길이 {s['dur']:.2f}초",
              "- 추천 모델: " + " / ".join(f"{'1순위' if i == 0 else '대안'} {m['name']}({m['spec']})" for i, m in enumerate(s["models"]))]
        if s["cute"]:
            L.append("- 귀여운 포인트: " + ", ".join(s["cute"]))
        if s["reuse"]:
            r = s["reuse"]
            L.append(f"- 🔁 재사용(생성 불필요): #{r['source']:02d} 클립을 {r['zoom']}배 확대 · 중심 가로 {r['cx'] * 100:.0f}% 세로 {r['cy'] * 100:.0f}% · 클립 {r['src_in']:.2f}초부터")
        if s["feeds"]:
            L.append(f"- 🎥 이 클립 하나로 " + ", ".join(f"#{k:02d}" for k in s["feeds"]) + " 도 잘라 만듦(같은 원본 줌) → 생성할 때 길게(5~10초) 뽑기")
        if s["push"]:
            L.append(f"- 컷 안 줌(원본 측정): 시작→끝 {s['push']['scale']}배 {'푸시인' if s['push']['scale'] > 1 else '풀아웃'}")
    so = an["sound"]
    L += [f"\n## 사운드\n{so['summary']}", "| 역할 | 원본 측정 | 재현 방법 |", "|---|---|---|"]
    L += [f"| {cell(x['who'])} | {cell(x['spec'])} | {cell(x['tts'])} |" for x in so["voices"]]
    L += [f"- BGM 원본 추정: {so['bgm']['guess']}", f"- BGM 권장 구성: {so['bgm']['rec']}", f"- BGM 볼륨: {so['bgm']['level']}",
          f"- Suno 메인: `{so['suno']}`", f"- Suno 구간2: `{so['suno2']}`", f"- Suno 구간3: `{so['suno3']}`",
          "\n| 시각 | 효과음 | 이유 | 키트 파일 |", "|---|---|---|---|"]
    L += [f"| {c['t']:.2f}s | {cell(c['s'])} | {cell(c['why'])} | {c['file']} |" for c in d["sfx_table"]]
    L += [f"- 믹스: {so['mix']} (원본 {st['lufs']} LUFS, LRA {st['lra']}, 트루피크 {st['tp']})",
          f"\n## 편집 (FFmpeg · HyperFrames)\n{an['edit']['timeline']}"] + [f"- {r}" for r in an["edit"]["rules"]]
    L += [f"- 키트 폴더: {PUBLIC_DIR}/{d['kit_rel']} (edl.csv/edl.json/captions.ass/sfx_cues.csv/build_ffmpeg.py/hyperframes/편집프롬프트.md)",
          f"- 검증: {d['kit_test']}", "\n### Claude Code 프롬프트 A — FFmpeg", "```", d["prompt_ff"], "```",
          "\n### Claude Code 프롬프트 B — HyperFrames", "```", d["prompt_hf"], "```", "\n| 컷 | 시작 | 길이 | 전환 | 효과 | 화면비 |", "|---|---|---|---|---|---|"]
    L += [f"| #{e['n']:02d} | {e['t_in']:.2f} | {e['dur']:.2f} | {e['tr']}{f' ({e['tr_dur']}초)' if e['tr_dur'] else ''} | {', '.join(e['fx'])} | {e['frame']} |" for e in d["edl_special"]]
    L += ["\n## 떡상 편집 기법 해설", "| 기법 | 위치 | 설명 |", "|---|---|---|"] + [f"| {cell(t['t'])} | {cell(t['w'])} | {cell(t['d'])} |" for t in an["tech"]]
    ad = an["adapt"]
    L += [f"\n## 다른 동물로 바꾸기 · 생성 계획\n- 예시 각색: {ad['premise']}", "- 그대로 지킬 것: " + " / ".join(ad["keep"]),
          "- 바꿀 것: " + " / ".join(ad["change"]), f"- 의상 교체용 묘사: {ad.get('costume', '')}", "| 배치 | 컷 | 방법 |", "|---|---|---|"]
    L += [f"| {cell(b['name'])} | {', '.join('#' + str(n) for n in b['shots'])} | {cell(b['how'])} |" for b in an["batches"]]
    p = d["plan"]
    L += [f"\n## 생성 절약표 — 같은 원본 줌 재사용 (자동 측정 + 분석 확인)",
          f"- {p['n']}컷 = 영상 생성 {p['video']}개 + 정지 이미지 {p['still']}장 + 편집 효과만 {p['edit']}컷 + **재사용(확대) {p['reused']}컷** · 키프레임 이미지는 세팅 기준 {p['images']}장",
          f"- 줌 체인 {p['chains']}개(그중 3단 이상 {p['three']}개) · 최대 배율 {p['max_zoom']}배 → 2배 넘게 확대하는 원본은 4K로 생성하거나 업스케일 후 사용",
          "| 원본 클립 | 이 클립으로 만드는 컷 (배율 · 중심 가로/세로 % · 길이) | 합계 | 생성 길이 |", "|---|---|---|---|"]
    L += [f"| #{c['source']:02d} | " + " → ".join(f"#{x['n']:02d} ×{x['zoom']} ({x['cx'] * 100:.0f}/{x['cy'] * 100:.0f}) {x['dur']:.2f}초" for x in c["items"])
          + f" | {c['total']:.2f}초 | {max(5, math.ceil(c['need']))}초 |" for c in d["chains"]]
    if d["pushes"]:
        L.append("- 컷 안 줌(시작→끝 배율, 원본 측정): " + ", ".join(f"#{x['n']:02d} ×{x['scale']}" for x in d["pushes"]))
    if d["cute_moments"]:
        L += ["\n## 귀여운 모먼트 (이 영상)", "| 모먼트 | 컷 | 왜 귀여운가 | 이미지 프롬프트 조각 | 움직임 프롬프트 조각 |", "|---|---|---|---|---|"]
        L += [f"| {cell(m.get('moment'))} | {', '.join('#' + str(k) for k in m.get('shots', []))} | {cell(m.get('why'))} | {cell(m.get('prompt'))} | {cell(m.get('motion'))} |"
              for m in d["cute_moments"]]
    L += ["\n| 이 영상에 쓰는 모델 | 종류 | 사양 | 이럴 때 | 추천 컷 수 |", "|---|---|---|---|---|"]
    L += [f"| {m['name']} | {m['kind']} | {cell(m['spec'])} | {cell(m['best'])} | {m['count']} |" for m in d["model_rows"]]
    return "\n".join(L) + "\n"


def main():
    global OUT
    out, mode = sys.argv[1], sys.argv[2]
    OUT = out
    os.makedirs(out, exist_ok=True)
    rank = jload(os.path.join(ROOT, "data", "ranking.json"))
    today = rank["today"]
    a0 = next(a for a in ANIMALS if a["id"] == DEFAULT["animal"])
    acc0 = next(a for a in ACCESSORIES if a["id"] == DEFAULT["acc"])
    vids = [video_data(v, rank["rows"], mode, a0, acc0) for v in VKEYS]
    pool, flat = rank["rows"], jload(os.path.join(ROOT, "data", "videos_flat.json"))
    slots = Counter(r["upload_time_kst"][11:] for r in pool if r.get("upload_time_kst"))
    slot, cnt = slots.most_common(1)[0]
    ch = {"subs": fmt_k(flat.get("channel_follower_count") or 0), "total": rank["channel_total_videos_tab"], "median": fmt_k(int(rank["median_views"])),
          "dur": f"{statistics.median(r['duration'] for r in pool):.0f}", "slot": f"{slot} ({cnt}/{len(pool)})",
          "subs_ratio": f"{sum(1 for r in pool if r['subtitles'])}/{len(pool)}"}
    anchor = {d["an"]["id"]: d["key"] for d in vids}
    sub_files = sorted(glob.glob(os.path.join(ROOT, "subs", "[0-9][0-9]_*.txt")))
    top10 = []
    for i, r in enumerate(pool[:10], 1):
        langs = sorted({os.path.basename(f).rsplit(".", 2)[-2] for f in sub_files if r["id"] in os.path.basename(f)}, key=lambda x: ["ko", "en", "ja"].index(x) if x in ("ko", "en", "ja") else 9)
        top10.append({"rank": i, "title": r["title"], "url": r["url"], "upload": r["upload_date"], "age": f"{r['age_days']:.1f}", "duration": r["duration"],
                      "views": r["views"], "vpd": int(r["vpd"]), "bar": max(r["vpd"] / pool[0]["vpd"] * 100, 0.8), "outlier": r["outlier_x"],
                      "cpk": r["comments_per_1k"], "anchor": anchor.get(r["id"]),
                      "subs": "·".join({"ko": "한국어", "en": "영어", "ja": "일본어"}.get(x, x) for x in langs) + ("" if mode == "private" else " (원문 비공개)")})
    compare_rows = [{"rank": d["rank"], "key": d["key"], "title": d["title"], "fmt": d["an"]["fmt"],
                     "size": f"{d['st']['dur']}초 · {d['st']['n']}컷 · {d['st']['asl']}초", "cpm": d["st"]["cpm"],
                     "speech": f"{d['st']['speech']}% · {d['st']['lufs']} LUFS", "formula": " → ".join(d["an"]["formula"][:4]) + " …",
                     "people": ", ".join(c["role"] for k, c in d["an"]["cast"].items() if k != "hero") or "-"} for d in vids]
    dna = ["실사풍 동물 × 한국 직장인·일상 공감 소재. 동물은 진짜 동물처럼, 상황은 사람처럼",
           "30~45초 가로 16:9(4K 업로드). 쇼츠 탭이 아닌 일반 동영상 탭에서도 짧은 길이로 승부",
           "자막 3층 구조(상황 라벨 · 화자별 색 대사 · 강조)로 소리 없이 봐도 100% 이해",
           "사람은 입 아래로 얼굴을 자르거나(오피스) 이모지로 가림(브이로그) → 시선 집중 + AI 얼굴 일관성 문제 회피",
           f"업로드 시각 고정: 최근 30개 중 {cnt}개가 {slot}(퇴근 직전). 영어·일본어 자막으로 해외 시청까지 확장",
           "반전 설계: 기대 → 더 나쁜 현실(1위) / 가짜 엔딩 → 진짜 하이라이트(2위) / 복선 → 회수(3위)",
           "대화 구간은 대사·리액션 타이밍으로 자르고, 3위 위기 구간만 저음 박동에 맞춤"]
    workflow = [("캐릭터 시트", "선택한 동물의 정면·측면·뒷모습·전신을 한 장에. 모든 컷의 참조 이미지 — 귀여움 기본값(동글한 몸·짧은 팔·큰 눈·몸에 맞춘 미니 소품) 포함"),
                ("세트·인물 기준 이미지", "책상, 파티션, 동료(얼굴 크롭) 등 반복되는 배경·인물을 먼저 1장씩"),
                ("컷별 키프레임", "각 컷의 ① 이미지 프롬프트로 첫 장면 생성(참조: 시트 + 세트). 🔁 재사용 컷은 건너뜀 — 생성 절약표의 원본 컷만"),
                ("영상 생성", "② 영상 프롬프트 + 1순위 모델. 줌 체인 원본은 표의 '생성 길이'(5~10초)로 길게 뽑아 여러 컷에 나눠 씀"),
                ("목소리·음악·효과음", "TTS(주인공은 피치 +7반음), Suno BGM, 효과음 큐 시트대로 준비"),
                ("편집", f"{PUBLIC_DIR}/편집키트/N위 의 FFmpeg 또는 HyperFrames 키트로 조립 → 컷 검증"),
                ("업로드", "평일 17:45, 짧은 감정형 제목, 영어·일본어 자막, AI 합성 콘텐츠 공개 체크")]
    gen_master = f"""[작업 폴더] {PUBLIC_DIR} (GitHub geben147-create/Insta 를 받아서 사용. 1위 기준 예시 — 2위·3위도 같은 방식)
[목표] index.html(한 페이지)에서 동물을 고른 뒤 '📋 전체 복사' 또는 '.md 저장'으로 받은 내용으로 1위 영상을 다른 동물로 재현할 이미지·영상을 만든다.
[도구] pollo-generate 스킬(또는 Pollo MCP)
[순서]
1) 캐릭터 시트 1장 생성 (nano-banana-pro, 16:9, 2K) → 파일 경로 보고 → 🔴 내 승인 대기
2) 세트·인물 기준 이미지 생성(책상, 파티션, 동료1, 동료2, 상사 — 사람은 얼굴이 입 위로 잘리게) → 승인 대기
3) {PUBLIC_DIR}/편집키트/1위 에서 python build_ffmpeg.py --check → '필요한 원본 클립' 목록만 생성 대상 (🔁 재사용 컷은 원본을 잘라 쓰므로 생성 금지)
4) 대상 컷의 키프레임 이미지 생성 (참조: 캐릭터 시트 + 해당 세트 이미지, 2배 넘게 확대될 원본은 4K)
5) 🔴 영상 생성 전에 pollo_estimate_generation_cost 로 배치별 예상 크레딧 표를 보여주고, 내 승인 후에만 진행
6) 1순위 모델로 생성(줌 체인 원본은 생성 절약표의 '생성 길이', 나머지 5초·1080p) → clips/sNN.mp4 로 저장 (NN = 컷 번호), 정지 컷은 clips/sNN.png
7) 대안 모델 비교는 배치별 대표 컷 1개만 (A/B 결과 표로 보고)
8) 끝나면 python build_ffmpeg.py --check 결과(누락 0개) 보고 → 승인 후 python build_ffmpeg.py --name "<이름>" --pun "<글자>" --verify
[금지] 승인 없는 크레딧 사용, 원본 영상 캡처를 참조 이미지로 업로드, 원본 대사·캐릭터 이름 사용"""
    sheet_tpl = ("Character reference sheet of {HERO}: front view, three-quarter view, side view, back view and a full-body standing pose, "
                 "plain light-grey studio background, soft even lighting, photorealistic, identical design in every view, 16:9. "
                 "Character details: " + HERO_SUFFIX + ".")
    c_common = ctx_for(None, a0, acc0)
    cute, zoom, sfx = cute_catalog(vids, mode, c_common), zoom_stats(vids), sfx_catalog(vids)
    t = zoom["tot"]
    dna += [f"같은 원본 줌 재사용: {t['n']}컷 중 {t['reused']}컷({t['reused'] / max(t['n'], 1) * 100:.0f}%)이 다른 컷 원본을 확대한 것 — "
            f"넓게→가깝게→넓게→더 가깝게(배율 중앙값 {zoom['med_zoom']}배)로 오가며 적은 생성으로 컷 수를 늘림",
            f"귀여움 밀도: {cute['total']}컷 중 {cute['tagged']}컷에 귀여운 모먼트(짧은 팔 제스처·동그란 눈 초근접·몸에 맞춘 미니 소품·먹방 볼 빵빵 등)",
            f"효과음은 컷에 붙인다: 키트 효과음 {sfx['n']}개 중 {sfx['within01']}%가 컷 시작 ±0.1초 안"]
    # ---- 전체 텍스트 조각 (페이지 JS 가 동물 선택에 맞춰 토큰 치환) ----
    head = [f"# 햄찌 유튜브 영상 분석 — 전체 (기준일 {today})",
            "정서불안 김햄찌 채널 동영상 탭 최근 30개를 일평균 조회수(조회수 ÷ 올린 뒤 지난 날수)로 순위를 매기고, 상위 영상을 컷 단위로 분석해 다른 동물로 재현할 수 있게 정리한 자료입니다.",
            "원본 대사는 옮기지 않고 의도만 요약했으며, '새 대본 예시'는 새로 쓴 문장입니다.",
            f"\n## 채널 개요\n- 구독자 {ch['subs']} · 동영상 탭 {ch['total']}개 중 최근 30개 분석 · 최근 30개 조회수 중앙값 {ch['median']} · 길이 중앙값 {ch['dur']}초",
            f"- 가장 많은 업로드 시각 {ch['slot']} KST · 영어·일본어 자막 제공 {ch['subs_ratio']}",
            "\n## 기간 대비 성과 Top 10 (최근 30개 기준)", "| 순위 | 제목 | 링크 | 업로드 | 경과일 | 길이 | 조회수 | 일평균 | 중앙값 대비 | 댓글/1천뷰 | 자막 |",
            "|---|---|---|---|---|---|---|---|---|---|---|"]
    head += [f"| {r['rank']} | {cell(r['title'])} | {r['url']} | {r['upload']} | {r['age']} | {r['duration']}초 | {r['views']:,} | {r['vpd']:,} | ×{r['outlier']} | {r['cpk']} | {r['subs']} |" for r in top10]
    head += ["- 순위 읽는 법: 일평균 조회수는 최근 영상이 유리 → 1~3위는 지금 알고리즘이 밀어주는 포맷, 4~10위는 꾸준히 성과를 낸 영상. 좋아요는 비공개라 댓글로 참여도 측정",
             f"\n## 채널 공식({len(vids)}개 영상 공통점과 차이)", "| 순위 | 제목 | 형식 | 길이·컷·평균 컷 | 분당 컷 | 대사·음량 | 핵심 구조 | 사람 처리 |", "|---|---|---|---|---|---|---|---|"]
    head += [f"| {r['rank']} | {cell(r['title'])} | {cell(r['fmt'])} | {r['size']} | {r['cpm']} | {r['speech']} | {cell(r['formula'])} | {cell(r['people'])} |" for r in compare_rows]
    head += [f"- {x}" for x in dna]
    head += ["\n## 제작 순서"] + [f"{i}. {a} — {b}" for i, (a, b) in enumerate(workflow, 1)]
    head += [f"\n## 0단계 캐릭터 시트 프롬프트\n{sheet_tpl}", f"\n## 공통 네거티브 프롬프트\n{NEGATIVE}",
             "\n## Claude Code 생성 총괄 프롬프트", "```", gen_master, "```"]
    chunks = [{"v": "common", "md": "\n".join(head) + "\n" + md_catalogs(cute, zoom, sfx) + md_guide()}]
    chunks += [{"v": d["key"], "md": md_video(d)} for d in vids]
    tail = ["\n---\n\n## 모델 가이드 (Pollo에서 조회한 사양, " + today + ")", "| 영상 모델 | 종류 | 사양 | 이럴 때 |", "|---|---|---|---|"]
    tail += [f"| {m['name']} | {m['kind']} | {cell(m['spec'])} | {cell(m['best'])} |" for k, m in MODELS.items() if k not in ("still", "edit")]
    tail += ["- 이미지 모델: " + " / ".join(f"{n}({k}) — {w}" for k, n, w in IMAGE_MODELS), "- 목소리·음악·입모양: " + " / ".join(f"{n}({k}) — {w}" for k, n, w in AUDIO_MODELS),
             "\n## 동물 선택지 (영어 외형 묘사 — 프롬프트의 주인공 묘사를 이것으로 바꾸면 됨)"]
    tail += [f"- {a['ko']}: {a['en']} (말장난 글자: {a['pun']})" for a in ANIMALS]
    tail += ["- 소품: " + " / ".join(f"{a['ko']} = {a['en'] or '없음'}" for a in ACCESSORIES),
             "\n## 저작권·정책", "- 편집 문법(구조·리듬·구도·자막 규격)만 가져오고, 원본 장면·소리·대사·캐릭터 이름·은색 헤드폰·'-햄' 말장난은 쓰지 않기",
             "- 게임 화면·음악·효과음은 본인 소유 또는 허가된 것만. AI 합성 실사 영상은 업로드 때 합성 콘텐츠 공개 체크"]
    subtitles = []
    if mode == "private":
        for f in sub_files:
            subtitles.append({"name": os.path.basename(f), "text": open(f, encoding="utf-8-sig").read()})
        tail += ["\n## 상위 10개 자막 원문 (개인용)"] + [f"\n### {s['name']}\n```\n{s['text']}\n```" for s in subtitles]
    chunks.append({"v": "common", "md": "\n".join(tail) + "\n"})
    full_md = "\n".join(fill(ch["md"], c_common if ch["v"] == "common" else ctx_for(next(d["an"] for d in vids if d["key"] == ch["v"]), a0, acc0)) for ch in chunks)
    note = f"> 기본 동물: {a0['ko']} · 소품: {acc0['ko']} · 이름: {DEFAULT['name']} (한 페이지판 index.html 에서 다른 동물로 바꿔 '📋 전체 복사' 하면 전부 바뀐 상태로 복사됩니다)\n\n"
    kit = {"ANIMALS": ANIMALS, "ACCESSORIES": ACCESSORIES, "HERO_SUFFIX": HERO_SUFFIX, "DEFAULT": DEFAULT}
    env = Environment(loader=FileSystemLoader(os.path.join(ROOT, "tools", "onepage")), autoescape=select_autoescape(["html"]))
    css = open(os.path.join(ROOT, "tools", "static", "style.css"), encoding="utf-8").read()
    js = open(os.path.join(ROOT, "tools", "onepage", "onepage.js"), encoding="utf-8").read()
    dump = lambda o: json.dumps(o, ensure_ascii=False).replace("</", "<\\/")
    html = env.get_template("template.html").render(
        mode=mode, today=today, ch=ch, top10=top10, compare_rows=compare_rows, dna=dna, workflow=workflow, gen_master=gen_master, negative=NEGATIVE,
        sheet_tpl=sheet_tpl, sheet_default=fill(sheet_tpl, c_common), videos=vids, subtitles=subtitles,
        cute=cute, zoom=zoom, sfx=sfx, guide=GUIDE, hero_suffix=HERO_SUFFIX,
        suno_list=[("suno", "메인 BGM"), ("suno2", "구간 2"), ("suno3", "구간 3")],
        video_models=[m for k, m in MODELS.items() if k not in ("still", "edit")], image_models=IMAGE_MODELS, audio_models=AUDIO_MODELS,
        css=css, js=js, kit_json=dump(kit), pages_json=dump({d["key"]: d["page"] for d in vids}), chunks_json=dump(chunks))
    name = "index.html" if mode == "public" else "전체분석_사진포함.html"
    open(os.path.join(out, name), "w", encoding="utf-8").write(html)
    open(os.path.join(out, "전체분석.md" if mode == "public" else "전체분석_자막포함.md"), "w", encoding="utf-8").write(note + full_md)
    if mode == "public":  # 웹 AI 가 읽기 쉬운 텍스트본 (전체 + 나눈 파일)
        open(os.path.join(out, "전체분석.txt"), "w", encoding="utf-8").write(note + full_md)
        filled = lambda ch: fill(ch["md"], c_common if ch["v"] == "common" else ctx_for(next(d["an"] for d in vids if d["key"] == ch["v"]), a0, acc0))
        open(os.path.join(out, "개요.txt"), "w", encoding="utf-8").write(note + filled(chunks[0]) + filled(chunks[-1]))
        for ch in chunks[1:-1]:
            d = next(x for x in vids if x["key"] == ch["v"])
            open(os.path.join(out, f"{RANK_DIR[ch['v']]}.txt"), "w", encoding="utf-8").write(
                note + f"(햄찌 유튜브 영상 분석 — {RANK_DIR[ch['v']]} 「{d['title']}」 상세. 공통 개요·모델 가이드는 개요.txt)\n" + filled(ch))
    for d in vids:  # 편집 프롬프트(경로 치환본)
        kd = os.path.join(out, "편집키트", RANK_DIR[d["key"]])
        os.makedirs(kd, exist_ok=True)
        open(os.path.join(kd, "편집프롬프트.md"), "w", encoding="utf-8").write(d["prompts_md"])
    print(mode, name, f"{len(html) / 1e6:.1f}MB", "| md", f"{len(full_md) / 1e3:.0f}KB", "| shots", sum(d["st"]["n"] for d in vids))


if __name__ == "__main__":
    main()
