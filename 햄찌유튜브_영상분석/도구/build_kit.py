"""분석 데이터(analysis.json + cuts.json) → 편집 키트(EDL, ASS 자막, 효과음 큐, HyperFrames 컴포지션, 편집 프롬프트).
사용: python tools/build_kit.py v1 v2 v3"""
import csv, json, os, re, shutil, sys
import cv2
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30

# ---------- 전환·효과 판별 ----------
def classify_tr(shot):
    tr, cam = shot.get("tr", ""), shot.get("cam", "")
    if tr.startswith("디졸브") or tr.startswith("디졸브로") or cam.startswith("디졸브로"):
        m = re.search(r"(\d+)\s*프레임", tr)  # '디졸브(약 4프레임)' 처럼 길이가 적혀 있으면 그대로 사용
        return "dissolve", round(int(m.group(1)) / FPS, 3) if m else 0.30
    if "줌 블러" in tr or "잔상" in tr or "줌블러" in tr:
        return "zoomblur", 0.12
    return "cut", 0.0

def classify_fx(shot):
    tr, cam, fx = shot.get("tr", ""), shot.get("cam", ""), shot.get("cap", {}).get("fx", "") or ""
    out = []
    if "크래시 줌" in cam or "크래시 줌" in tr:
        out.append("crash_zoom")
    if (shot.get("gen") == "still" and "사진" not in shot.get("sz", "")) or "푸시인" in cam:
        out.append("push_in_slow")
    if "딥 투 블랙" in tr or "어두워짐" in cam or "암전" in tr and shot.get("who") != "black":
        if "딥 투 블랙" in tr or "어두워짐" in cam:
            out.append("dip_out")
    if tr.startswith("휩 팬"):
        out.append("whip")
    if "플래시" in tr or "섬광" in tr or "플래시" in cam:
        out.append("flash_in")
    if "흔들" in cam and "핸드헬드" not in cam:
        out.append("shake")
    # 그래픽 오버레이 (HyperFrames 전용 표시)
    text = " ".join([fx, shot.get("tech", ""), shot.get("act", ""), cam])
    if "✦" in text or "반짝 별" in text or "트윙클" in text or "반짝이 별" in text:
        out.append("sparkle")
    if "스피너" in text or "로딩" in text:
        out.append("spinner")
    if "수식" in text:
        out.append("math")
    if "이모지" in text:
        out.append("emoji")
    if "글리치" in text:
        out.append("glitch")
    if "crash_zoom" in out and "push_in_slow" in out:
        out.remove("push_in_slow")
    return out

def measure_frame(vdir, shot):
    """원본 화면에서 실제 영상 영역 비율 측정 → 필러박스 종류."""
    cap = cv2.VideoCapture(os.path.join(vdir, "src.mp4"))
    cap.set(cv2.CAP_PROP_POS_MSEC, (shot["t_in"] + shot["t_out"]) / 2 * 1000)
    ok, fr = cap.read()
    cap.release()
    if not ok:
        return "full"
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    cols = np.where(g.max(axis=0) > 25)[0]
    if len(cols) == 0:
        return "full"
    w = cols[-1] - cols[0] + 1
    if w > 1800:
        return "full"
    if abs(w - 1080) < 40:
        return "1x1"
    if abs(w - 810) < 40:
        return "3x4"
    if abs(w - 954) < 40:
        return "p088"
    return "full"

# ---------- 새 대본 → 자막 이벤트 ----------
PREFIX = [("(초록 강조)", "EmphCW1"), ("(강조)", "Emph"), ("(초록)", "LineCW1"), ("(파랑)", "LineCW2"), ("(라임)", "LineLeader"),
          ("(대사)", "LineHero"), ("(카드 작게)", "CardSmall"), ("(카드)", "CardBig"), ("(라벨)", "LabelHero"), ("[이름표]", "LabelName"),
          ("[괄호]", "Bracket"), ("(괄호)", "Bracket")]
EXTEND = {"(유지)": "all", "(라벨·대사 유지)": "all", "(강조 유지)": "Emph", "(대사 유지)": "line", "(라벨 유지)": "label",
          "[이름표 유지]": "label", "(이름표 유지)": "label"}
NONE = {"(자막 없음)", "(암전)", "(휩 팬)", "(없음)", ""}
SP_STYLE = {"hero": "LineHero", "cw1": "LineCW1", "cw2": "LineCW2", "leader": "LineLeader", "boss": "LineHero", "narr": "Bracket"}
LINE_STYLES = {"LineHero", "LineCW1", "LineCW2", "LineLeader", "Paren", "Bracket"}
LABEL_STYLES = {"LabelHero", "LabelName", "Pointer"}
TYPING_STYLES = {"LineHero", "LineCW1", "LineCW2", "LineLeader", "Emph", "EmphCW1"}

def classify_part(part, shot, vkey):
    append = ""
    if part.startswith("++"):
        append, part = "nospace", part[2:].strip()
    elif part.startswith("+"):
        append, part = "space", part[1:].strip()
    for pre, style in PREFIX:
        if part.startswith(pre):
            text = part[len(pre):].strip()
            if vkey == "v2" and style == "LabelHero":
                style = "Pointer"
            return style, text, append
    if part.startswith("(") or part.startswith("["):  # 괄호 자체가 자막 내용
        return ("Paren" if part.startswith("(") else "Bracket"), part, append
    return SP_STYLE.get(shot.get("cap", {}).get("sp", "hero"), "LineHero"), part, append

def units(text):  # {이름}·{PUN} 토큰은 쪼개지 않는 타자 단위
    return re.findall(r"\{[^}]+\}|.", text)

def build_events(an, shots_t, vkey):
    events = []  # dict(style, text, start, end, type_from)
    for s in an["shots"]:
        t0, t1 = shots_t[s["n"]]
        raw = (s.get("new") or "").strip()
        if raw in NONE:
            continue
        m = re.fullmatch(r"\((.*유지)\)", raw)
        if raw in EXTEND or m:
            kind = EXTEND.get(raw, "all")
            for e in events:
                if abs(e["end"] - t0) < 0.02 and (kind == "all" or (kind == "line" and e["style"] in LINE_STYLES) or
                                                   (kind == "label" and e["style"] in LABEL_STYLES) or kind == e["style"]):
                    e["end"] = t1
            continue
        steps = [x.strip() for x in raw.split("→")]
        dur = (t1 - t0) / len(steps)
        for k, st in enumerate(steps):
            a, b = t0 + k * dur, t0 + (k + 1) * dur
            for part in [p.strip() for p in st.split(" / ")]:
                if part in EXTEND:
                    kind = EXTEND[part]
                    for e in events:
                        if abs(e["end"] - a) < 0.02 and ((kind == "label" and e["style"] in LABEL_STYLES) or
                                                          (kind == "line" and e["style"] in LINE_STYLES) or kind == "all"):
                            e["end"] = b
                    continue
                style, text, append = classify_part(part, s, vkey)
                if not text:
                    continue
                type_from = 0
                if append:
                    prev = [e for e in events if e["style"] == style and abs(e["end"] - a) < 0.02]
                    if prev:
                        p = prev[-1]
                        sep = " " if append == "space" else ""
                        type_from = len(units(p["text"] + sep))
                        text = p["text"] + sep + text
                events.append({"style": style, "text": text, "start": round(a, 3), "end": round(b, 3), "type_from": type_from,
                               "shot": s["n"]})
    return events

# ---------- ASS ----------
ASS_HEAD = """[Script Info]
; 김햄찌 분석 키트 — 원본 자막 규격(위치·크기·색) 재현용 템플릿. 텍스트는 새로 쓴 예시 대본
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: LabelHero,{font},40,&H00463F3F,&H00463F3F,&H38FFFFFF,&H38FFFFFF,0,-1,0,0,100,100,0,0,3,7,0,2,20,20,158,1
Style: LabelName,{font},40,&H00FFFFFF,&H00FFFFFF,&H1E000000,&H1E000000,0,0,0,0,100,100,0,0,3,7,0,2,20,20,158,1
Style: LineHero,{font},64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,4,0,2,20,20,58,1
Style: LineCW1,{font},64,&H0038EF2E,&H0038EF2E,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,2,20,20,58,1
Style: LineCW2,{font},64,&H00DE9019,&H00DE9019,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,2,20,20,58,1
Style: LineLeader,{font},64,&H0034E5D7,&H0034E5D7,&H00000000,&H00000000,-1,0,0,0,100,100,0,0,1,5,0,2,20,20,58,1
Style: Emph,{font},140,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,-1,-1,0,0,100,100,0,0,1,8,0,2,20,20,70,1
Style: EmphCW1,{font},120,&H0038EF2E,&H0038EF2E,&H00000000,&H00000000,-1,-1,0,0,100,100,0,0,1,8,0,2,20,20,70,1
Style: Bracket,{font},56,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,4,0,2,20,20,62,1
Style: Paren,{font},56,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,4,0,2,20,20,70,1
Style: Pointer,{font},32,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2,2,7,20,20,20,1
Style: CardSmall,{font},36,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,20,20,0,1
Style: CardBig,{font},64,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,20,20,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

def ts(t):
    t = max(0.0, t)
    h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

def ass_events(events, cps=7.0):
    lines = []
    for e in events:
        u = units(e["text"])
        a, b, style = e["start"], e["end"], e["style"]
        pos = ""
        if style == "Pointer":
            pos = r"{\pos(760,120)}"
        elif style == "CardSmall":
            pos = r"{\pos(960,470)}"
        elif style == "CardBig":
            pos = r"{\pos(960,545)}"
        if style in TYPING_STYLES and len(u) - e["type_from"] > 1:
            k0 = e["type_from"]
            n = len(u)
            rate = max(cps, (n - k0) / max((b - a) * 0.75, 0.05))
            times = [a + (i - k0) / rate for i in range(k0, n)]
            for i, t in enumerate(times):
                t_end = times[i + 1] if i + 1 < len(times) else b
                txt = "".join(u[: k0 + i + 1])
                lines.append(f"Dialogue: 1,{ts(t)},{ts(t_end)},{style},,0,0,0,,{pos}{txt}")
        else:
            lines.append(f"Dialogue: 0,{ts(a)},{ts(b)},{style},,0,0,0,,{pos}{e['text']}")
    return lines

# ---------- 효과음 큐 ----------
SFX_MAP = [("뾰롱", "pop.wav"), ("팝", "pop.wav"), ("띠용", "boing.wav"), ("띵", "question_ding.wav"), ("물음", "question_ding.wav"),
           ("글리산도", "harp_gliss.wav"), ("하프", "harp_gliss.wav"), ("반짝", "sparkle.wav"), ("차임", "sparkle.wav"), ("스크래치", "record_scratch.wav"),
           ("임팩트", "impact.wav"), ("쿵", "impact.wav"), ("휙", "whoosh.wav"), ("스윙", "whoosh.wav"), ("줌", "whoosh.wav"),
           ("트랙패드", "click.wav"), ("클릭", "click.wav"), ("키보드", "keyboard.wav"), ("톡톡", "click.wav"), ("빨대", "slurp.wav"),
           ("쪽쪽", "slurp.wav"), ("셔터", "shutter.wav"), ("찰칵", "shutter.wav"), ("타자", "typing.wav"), ("팡파레", "fanfare.wav"),
           ("심장", "heartbeat.wav"), ("드론", "drone_low.wav"), ("둥", "boom_low.wav"), ("저음", "boom_low.wav"), ("새소리", "amb_birds.wav"),
           ("바람", "amb_wind.wav"), ("물가", "amb_water.wav"), ("레스토랑", "amb_restaurant.wav"), ("카페", "amb_cafe.wav"), ("앰비언스", "amb_room.wav"),
           ("웃음", "laugh_vo.wav"), ("흐느", "sob_vo.wav"), ("훌쩍", "sob_vo.wav"), ("숨소리", "breath_vo.wav"), ("먹는", "munch.wav"),
           ("쩝쩝", "munch.wav"), ("노트북", "laptop_open.wav"), ("로그인", "login_chime.wav"), ("띠링", "login_chime.wav"), ("글리치", "glitch.wav"),
           ("달그락", "clatter.wav"), ("삐걱", "creak.wav"), ("펄럭", "paper_flap.wav"), ("쪼르륵", "pour.wav"), ("지글", "sizzle.wav"),
           ("치이익", "sizzle.wav"), ("챙", "clink.wav"), ("박수", "applause.wav"), ("환호", "cheer.wav"), ("발소리", "footsteps.wav")]
SKIP_SFX = ("BGM", "정적")

def sfx_rows(an):
    rows = []
    for c in an.get("sound", {}).get("sfx", []):
        s = c.get("s", "")
        if any(k in s for k in SKIP_SFX) and not any(k in s for k, _ in SFX_MAP[:10]):
            continue
        f = next((fn for k, fn in SFX_MAP if k in s), None)
        if not f:
            continue
        vol = 0.5 if f.startswith("amb_") or f.startswith("drone") else 0.8
        rows.append({"t": f"{float(c['t']):.2f}", "file": f, "vol": vol, "desc": s, "why": c.get("why", "")})
    return rows

# ---------- HyperFrames ----------
CAP_CSS = """
      #root { position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }
      .shotwrap { position: absolute; inset: 0; transform-origin: 50% 50%; overflow: hidden; }
      .shotwrap video { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; object-fit: cover; }
      .shotwrap.f-1x1 video { left: 420px; width: 1080px; }
      .shotwrap.f-3x4 video { left: 555px; width: 810px; }
      .shotwrap.f-p088 video { left: 483px; width: 954px; }
      .cap { position: absolute; left: 0; width: 1920px; display: flex; justify-content: center; pointer-events: none; font-family: "Pretendard", sans-serif; }
      .cap span { display: block; white-space: nowrap; }
      .LabelHero { top: 878px; } .LabelHero span { font-size: 40px; padding: 6px 18px; border-radius: 8px; background: rgba(255,255,255,.78); color: #3f3f46; font-style: italic; }
      .LabelName { top: 878px; } .LabelName span { font-size: 40px; padding: 6px 18px; border-radius: 8px; background: rgba(0,0,0,.88); color: #fff; }
      .LineHero, .LineCW1, .LineCW2, .LineLeader { top: 952px; }
      .LineHero span { font-size: 64px; font-weight: 600; color: #fff; -webkit-text-stroke: 8px #000; paint-order: stroke fill; }
      .LineCW1 span { font-size: 64px; font-weight: 800; color: #2EEF38; -webkit-text-stroke: 10px #000; paint-order: stroke fill; }
      .LineCW2 span { font-size: 64px; font-weight: 800; color: #1990DE; -webkit-text-stroke: 10px #000; paint-order: stroke fill; }
      .LineLeader span { font-size: 64px; font-weight: 800; color: #D7E534; -webkit-text-stroke: 10px #000; paint-order: stroke fill; }
      .Emph, .EmphCW1 { top: 850px; } .Emph span, .EmphCW1 span { font-size: 140px; font-weight: 800; font-style: italic; color: #fff; -webkit-text-stroke: 16px #000; paint-order: stroke fill; }
      .EmphCW1 span { font-size: 120px; color: #2EEF38; }
      .Bracket { top: 956px; } .Bracket span { font-size: 56px; color: #fff; -webkit-text-stroke: 8px #000; paint-order: stroke fill; }
      .Paren { top: 950px; } .Paren span { font-size: 56px; color: #fff; -webkit-text-stroke: 8px #000; paint-order: stroke fill; }
      .Pointer { top: 100px; justify-content: flex-start; padding-left: 760px; } .Pointer span { font-size: 32px; color: #fff; text-shadow: 0 0 6px #000; }
      .CardSmall { top: 440px; } .CardSmall span { font-size: 36px; color: #fff; }
      .CardBig { top: 505px; } .CardBig span { font-size: 64px; color: #fff; }
      .fxo { position: absolute; pointer-events: none; }
      .sparkle span { position: absolute; color: #fff; font-size: 64px; text-shadow: 0 0 12px rgba(255,255,255,.9); }
      .spinner i { position: absolute; width: 70px; height: 70px; border-radius: 50%; border: 8px solid rgba(255,255,255,.25); border-top-color: #fff; }
      .math span { position: absolute; color: rgba(255,255,255,.85); font: 40px/1 serif; }
      .emoji i { position: absolute; width: 150px; height: 150px; border-radius: 50%; background: #ffd21f; box-shadow: inset -8px -10px 0 rgba(0,0,0,.08); }
      .emoji i::before, .emoji i::after { content: ""; position: absolute; top: 38px; width: 40px; height: 40px; border-radius: 50%; background: #fff; border: 12px solid #111; box-sizing: border-box; }
      .emoji i::before { left: 28px; } .emoji i::after { right: 28px; }
      .blackout { position: absolute; inset: 0; background: #000; }
      .flash { position: absolute; inset: 0; background: #fff; }
"""

def hf_crop_style(s, W=1920, H=1080):
    """재사용 컷: 원본 영상의 (중심 cx,cy · 배율 zoom) 영역이 화면을 채우도록 video 에 이동+확대 (FFmpeg crop 과 같은 영역)"""
    z = max(1.0, float(s["zoom"]))
    cw, ch = W / z, H / z
    x0 = min(max(s["cx"] * W - cw / 2, 0), W - cw)
    y0 = min(max(s["cy"] * H - ch / 2, 0), H - ch)
    return f' style="transform-origin: 0 0; transform: translate({-z * x0:.1f}px, {-z * y0:.1f}px) scale({z:.3f});"'

def push_origin(p):
    """측정한 컷 안 줌 → 확대 고정점(0~1). 좁은 화면의 중심이 측정 위치(cx,cy)에 오도록 계산 (build_ffmpeg 와 동일)"""
    k = p["scale"] if p["scale"] > 1 else 1 / p["scale"]
    return [min(max((0.5 - k * c) / (1 - k), 0.0), 1.0) for c in (p["cx"], p["cy"])]

def hf_html(an, edl, events, rows):
    total = edl["duration"]
    vid, caps, fxo, auds, tw = [], [], [], [], []
    shots = edl["shots"]
    for i, s in enumerate(shots):
        n = s["n"]
        if s["who"] in ("black", "card") and s.get("gen") == "edit":
            continue
        if s["who"] == "insert" and s.get("gen") == "edit" and "source" not in s and s["dur"] <= 0.2:  # 1~6프레임 전환 섬광
            fxo.append(f'      <div id="fi-s{n:02d}" class="clip fxo flash" data-start="{s["t_in"]:.3f}" data-duration="{s["dur"]:.3f}" data-track-index="5"><div class="flash"></div></div>')
            continue
        start, dur = s["t_in"], s["dur"]
        nxt = shots[i + 1] if i + 1 < len(shots) else None
        if nxt and nxt["tr"] in ("dissolve", "zoomblur"):
            dur += nxt["tr_dur"] / 2
        if s["tr"] in ("dissolve", "zoomblur"):
            start -= s["tr_dur"] / 2
            dur += s["tr_dur"] / 2
        fcls = "" if s.get("frame", "full") == "full" else f" f-{s['frame']}"
        clip = s.get("clip") or f"clips/s{n:02d}.mp4"
        vstyle = hf_crop_style(s) if "source" in s else ""  # 같은 원본 클립을 잘라 확대(디지털 줌 한 단)
        wstyle = ""
        if "push" in s:  # 원본에서 측정한 컷 안 줌: 배율·방향 그대로
            ox, oy = push_origin(s["push"])
            sc = s["push"]["scale"]
            z0, z1 = (1.0, sc) if sc > 1 else (1 / sc, 1.0)
            wstyle = f' style="transform-origin: {ox * 100:.1f}% {oy * 100:.1f}%;"'
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ scale: {z0:.4f} }}, {{ scale: {z1:.4f}, duration: {s["dur"]:.3f}, ease: "none" }}, {s["t_in"]:.3f});')
        vid.append(f'      <div class="shotwrap{fcls}" id="w-s{n:02d}"{wstyle}><video id="s{n:02d}" src="assets/{clip}" '
                   f'data-start="{start:.3f}" data-duration="{dur:.3f}" data-media-start="{s.get("src_in", 0.5):.3f}" data-track-index="0" muted playsinline{vstyle}></video></div>')
        fx = s.get("fx", [])
        if "crash_zoom" in fx:
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ scale: 1 }}, {{ scale: 1.25, duration: 0.12, ease: "power2.out" }}, {s["t_in"]:.3f});')
        if "push_in_slow" in fx:
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ scale: 1 }}, {{ scale: 1.08, duration: {s["dur"]:.3f}, ease: "none" }}, {s["t_in"]:.3f});')
        if "dip_out" in fx:
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ opacity: 1 }}, {{ opacity: 0, duration: {s["dur"]:.3f}, ease: "power1.in" }}, {s["t_in"]:.3f});')
        if "whip" in fx:
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ xPercent: 0, filter: "blur(0px)" }}, {{ xPercent: -35, filter: "blur(28px)", duration: {s["dur"]:.3f}, ease: "power2.in" }}, {s["t_in"]:.3f});')
        if s["tr"] == "dissolve":
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ opacity: 0 }}, {{ opacity: 1, duration: {s["tr_dur"]:.3f}, ease: "none" }}, {start:.3f});')
        if s["tr"] == "zoomblur":
            tw.append(f'tl.fromTo("#w-s{n:02d}", {{ opacity: 0, scale: 1.35, filter: "blur(12px)" }}, {{ opacity: 1, scale: 1, filter: "blur(0px)", duration: {s["tr_dur"]:.3f}, ease: "power2.out" }}, {start:.3f});')
        if "flash_in" in fx:
            fxo.append(f'      <div id="fl-s{n:02d}" class="clip fxo flash" data-start="{s["t_in"]:.3f}" data-duration="0.15" data-track-index="6"><div class="flash" id="fli-s{n:02d}"></div></div>')
            tw.append(f'tl.fromTo("#fli-s{n:02d}", {{ opacity: 0.9 }}, {{ opacity: 0, duration: 0.15 }}, {s["t_in"]:.3f});')
        if "sparkle" in fx:  # 위치는 얼굴 옆 기본값 — 실제 클립 보고 조정
            fxo.append(f'      <div id="sp-s{n:02d}" class="clip fxo sparkle" data-start="{s["t_in"]:.3f}" data-duration="{s["dur"]:.3f}" data-track-index="6">'
                       f'<span id="sp-s{n:02d}-a" style="left:1180px;top:330px">✦</span><span id="sp-s{n:02d}-b" style="left:1240px;top:420px;font-size:44px">✦</span><span id="sp-s{n:02d}-c" style="left:690px;top:300px;font-size:52px">✦</span></div>')
            tw.append(f'tl.fromTo("#sp-s{n:02d} span", {{ scale: 0.4, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.18, stagger: 0.06, ease: "back.out(3)" }}, {s["t_in"]:.3f});')
        if "spinner" in fx:
            fxo.append(f'      <div id="spn-s{n:02d}" class="clip fxo spinner" data-start="{s["t_in"]:.3f}" data-duration="{s["dur"]:.3f}" data-track-index="6"><i id="spni-s{n:02d}" style="left:1180px;top:430px"></i></div>')
            tw.append(f'tl.fromTo("#spni-s{n:02d}", {{ rotation: 0 }}, {{ rotation: 720, duration: {s["dur"]:.3f}, ease: "none" }}, {s["t_in"]:.3f});')
        if "math" in fx:
            fxo.append(f'      <div id="mt-s{n:02d}" class="clip fxo math" data-start="{s["t_in"]:.3f}" data-duration="{s["dur"]:.3f}" data-track-index="6">'
                       f'<span style="left:1300px;top:260px">∫ x² dx</span><span style="left:1420px;top:470px">Δy/Δx</span><span style="left:260px;top:360px">√(a²+b²)</span><span style="left:1560px;top:700px">π r²</span></div>')
            tw.append(f'tl.fromTo("#mt-s{n:02d} span", {{ y: 20, opacity: 0 }}, {{ y: -20, opacity: 1, duration: {s["dur"]:.3f}, stagger: 0.05, ease: "none" }}, {s["t_in"]:.3f});')
        if "emoji" in fx:
            fxo.append(f'      <div id="em-s{n:02d}" class="clip fxo emoji" data-start="{s["t_in"]:.3f}" data-duration="{s["dur"]:.3f}" data-track-index="6"><i style="left:885px;top:170px"></i></div>')
    for k, e in enumerate(events):
        cid = f"c{k + 1:03d}"
        d = max(0.04, e["end"] - e["start"])
        caps.append(f'      <div id="{cid}" class="clip cap {e["style"]}" data-start="{e["start"]:.3f}" data-duration="{d:.3f}" data-track-index="7">'
                    f'<span id="{cid}t">{e["text"]}</span></div>')
        n = len(units(e["text"]))
        if e["style"] in TYPING_STYLES and n - e["type_from"] > 1:
            frac0 = 100 - round(e["type_from"] / n * 100)
            steps = n - e["type_from"]
            tdur = min(d * 0.75, steps / 7)
            tw.append(f'tl.fromTo("#{cid}t", {{ clipPath: "inset(0 {frac0}% 0 0)" }}, {{ clipPath: "inset(0 0% 0 0)", duration: {tdur:.3f}, ease: "steps({steps})" }}, {e["start"]:.3f});')
        if "Emph" in e["style"] and any("glitch" in s.get("fx", []) for s in shots if s["n"] == e["shot"]):
            # 원본: 흑백 가로 조각이 어긋나는 글리치(색 분리 없음) → 가로 흔들림 + 위아래 잘림으로 근사
            tw.append(f'tl.fromTo("#{cid}t", {{ x: -14, skewX: -8, clipPath: "inset(0 0 48% 0)" }}, {{ x: 0, skewX: 0, clipPath: "inset(0 0 0% 0)", duration: 0.35, ease: "steps(6)" }}, {e["start"] + 0.3:.3f});')
    auds.append(f'      <audio id="bgm" src="assets/audio/bgm.mp3" data-start="0" data-duration="{total:.3f}" data-track-index="10" data-volume="0.35"></audio>')
    for s in shots:
        auds.append(f'      <audio id="vo-s{s["n"]:02d}" src="assets/voice/s{s["n"]:02d}.wav" data-start="{s["t_in"]:.3f}" data-track-index="11" data-volume="1"></audio>')
    for j, r in enumerate(rows):
        auds.append(f'      <audio id="sfx-{j + 1:02d}" src="assets/sfx/{r["file"]}" data-start="{float(r["t"]):.3f}" data-track-index="{20 + j}" data-volume="{r["vol"]}"></audio>')
    return f"""<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <title>{an['key']} rebuild — {edl['title']}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      /* Pretendard(OFL) 파일을 assets/fonts/ 에 넣으세요: https://github.com/orioncactus/pretendard/releases */
      @font-face {{ font-family: "Pretendard"; src: url("assets/fonts/Pretendard-SemiBold.woff2") format("woff2"); font-weight: 600; }}
      @font-face {{ font-family: "Pretendard"; src: url("assets/fonts/Pretendard-ExtraBold.woff2") format("woff2"); font-weight: 800; }}
      @font-face {{ font-family: "Pretendard"; src: url("assets/fonts/Pretendard-Regular.woff2") format("woff2"); font-weight: 400; }}
      body {{ margin: 0; background: #000; }}
{CAP_CSS}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-width="1920" data-height="1080" data-duration="{total:.3f}">
      <!-- 1) 영상 트랙: 컷 {len(shots)}개 (길이·위치는 edl.json 과 동일) -->
{chr(10).join(vid)}
      <!-- 2) 그래픽 오버레이 (스티커·스피너·수식·이모지·플래시) — 좌표는 실제 클립을 보고 조정 -->
{chr(10).join(fxo)}
      <!-- 3) 자막 트랙 (새 예시 대본, 원본 규격 위치·크기·색) -->
{chr(10).join(caps)}
      <!-- 4) 오디오: BGM(덕킹은 data-automation 볼륨 레인으로 조정) · 컷별 대사 · 효과음 -->
{chr(10).join(auds)}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      {chr(10) + '      '.join([''] + tw)}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
"""

# ---------- 편집 프롬프트 ----------
def prompts_md(an, edl, rows, kitrel):
    n = len(edl["shots"])
    need = [s for s in edl["shots"] if s.get("gen") != "edit" and s["who"] not in ("black", "card")]
    return f"""# {an['key'].upper()} 편집 키트 — Claude Code 붙여넣기용 프롬프트

원본: {edl['title']} (https://www.youtube.com/watch?v={an['id']}) · {n}컷 · {edl['duration']:.2f}초 · 30fps · 1920×1080

## A. FFmpeg 경로 (가장 빠름, 설치 불필요)
```
[작업 폴더] {kitrel}  (이 폴더 밖의 파일은 수정 금지)
[목표] clips/ 의 AI 생성 영상을 edl.json 규격 그대로 조립해 out/{an['key']}_final.mp4 를 만든다.
       (edl.json 에 source 가 있는 컷은 원본 클립을 잘라 확대해 쓰므로 파일이 없어도 됨 — 아래 D 표)
[정답 규격] 컷 길이·전환·효과 = edl.json / 자막 = captions.ass(스타일 13종, 위치·크기·색은 원본 측정값) / 효과음 = sfx_cues.csv
[순서]
1) python build_ffmpeg.py --check  → 누락 클립 목록 보고
2) 누락이 있으면 목록만 보고하고 멈춘다 (임의 생성·대체 금지)
3) python build_ffmpeg.py --name "<주인공 이름>" --pun "<말장난 글자>" --bgm audio/bgm.mp3 --verify
4) ffprobe 로 길이 {edl['duration']:.2f}초(±0.05), 1920x1080, 30fps, 오디오 존재 확인
5) --verify 결과(하드컷 검출 수)를 표로 보고. 누락 컷이 있으면 해당 컷 번호와 원인 추정
[수정 가능 범위] captions.ass 의 텍스트, sfx_cues.csv 의 파일명·볼륨, build 옵션
[승인 전 수정 금지] edl.json 의 컷 길이·순서·전환 (바꿔야 하면 이유와 함께 먼저 보고)
```

## B. HyperFrames 경로 (스티커·타이핑·줌 등 그래픽까지 재현)
```
/hyperframes 스킬을 먼저 읽고 진행해.
[작업 폴더] {kitrel}/hyperframes
[목표] index.html 컴포지션(영상 {len(need)}개 슬롯·자막·효과음 트랙이 원본 타이밍으로 이미 배치됨)에 실제 소스를 연결해 렌더.
[순서]
1) assets/clips/(키트 clips 폴더와 같은 원본 클립 — 재사용 컷의 <video> 는 원본 파일을 잘라 확대하도록 이미 설정됨), assets/audio/bgm.mp3, assets/voice/sNN.wav, assets/sfx/*.wav, assets/fonts/Pretendard-*.woff2 존재 확인 → 없는 파일은 목록 보고 후, 해당 <audio>/<video> 는 data-hidden 처리
2) npx hyperframes lint → 오류 0
3) npx hyperframes check → 0 findings
4) npx hyperframes snapshot --at {', '.join(f'{b["t"][0] + 0.3:.1f}' for b in an['beats'][:6])} 로 프레임 확인 (라벨 y≈878px, 대사 y≈952px)
5) npx hyperframes preview --background → URL 보고 후 내 승인 대기
6) 승인 후 npx hyperframes render --quality delivery --output out/{an['key']}_hf.mp4
[규칙] data-start/data-duration 은 edl.json 과 일치해야 함. 자막 텍스트·스티커 좌표만 수정 가능.
```

## C. 효과음 준비 목록 (sfx/ 폴더에 같은 이름으로 저장)
| 시각(초) | 파일 | 설명 | 이유 |
|---|---|---|---|
""" + "\n".join(f"| {r['t']} | {r['file']} | {r['desc']} | {r['why']} |" for r in rows) + "\n" + reuse_md(edl)


def reuse_md(edl):
    """D. 같은 원본 줌 재사용표 — 어떤 클립 하나로 어떤 컷들을 잘라 만드는지"""
    by_src = {}
    for s in edl["shots"]:
        if "source" in s:
            by_src.setdefault(s["source"], []).append(s)
    if not by_src:
        return ""
    sn = {s["n"]: s for s in edl["shots"]}
    L = ["", "## D. 같은 원본 줌 재사용 (이 컷들은 생성하지 않음)",
         "원본 클립 하나를 확대 배율(zoom)·중심(cx, cy: 화면 가로·세로 0~1)만 바꿔 여러 컷으로 씁니다. build_ffmpeg.py·hyperframes/index.html 이 edl.json 대로 자동 처리합니다.",
         "| 원본 클립 | 원본 컷 | 이 클립으로 만드는 컷 (배율 · 중심 · 클립 안 시작초) |", "|---|---|---|"]
    for src, items in sorted(by_src.items()):
        L.append(f"| clips/s{src:02d}.mp4 | #{src:02d} (클립 {sn[src].get('src_in', 0.5):.2f}초부터) | "
                 + " · ".join(f"#{s['n']:02d} ×{s['zoom']} ({s['cx']:.2f}, {s['cy']:.2f}) {s['src_in']:.2f}초~" for s in items) + " |")
    return "\n".join(L) + "\n"

def reuse_fields(n, zg, fx, frame="full", shot=None):
    """같은 원본 재사용(디지털 줌 체인)·컷 안 줌 측정값(zoom_groups.json) → EDL 필드.
    체인 = 영상 1개를 여러 컷이 시간순으로 이어 씀(src_in 이 이어짐), 원본이 아닌 컷은 배율·중심으로 잘라 확대.
    필러박스(1:1·3:4 등) 컷은 화면 비율이 달라 재사용·줌을 적용하지 않음."""
    out = {}
    m = zg.get("shot_map", {}).get(str(n))
    if frame != "full":  # 필러박스 컷은 확대 없이(1배) 같은 클립을 이어 쓸 때만 허용
        if not (m and m["zoom"] <= 1.1):
            return out
        m = dict(m, zoom=1.0, cx=0.5, cy=0.5)
    if m:
        out["src_in"] = round(0.5 + m["use_from"], 3)
        out["setup"] = m["group"]
        if m["source"] != n:
            out.update({"source": m["source"], "zoom": m["zoom"], "cx": m["cx"], "cy": m["cy"], "clip": f"clips/s{m['source']:02d}.mp4"})
        elif shot and shot.get("gen") == "edit" and shot.get("who") not in ("black", "card", "insert") and m["group"] != n:
            # 분석상 '생성 안 함(크롭)'인데 체인 원본이 된 컷 → 같은 세팅의 기준 컷 클립에서 잘라 씀
            g = next((g for g in zg.get("groups", []) if g["base"] == m["group"]), None)
            me = next((x for x in (g or {}).get("members", []) if x["n"] == n), None)
            if me:
                out.update({"source": m["group"], "zoom": me["zoom"], "cx": me["cx"], "cy": me["cy"], "clip": f"clips/s{m['group']:02d}.mp4"})
    p = zg.get("inshot", {}).get(str(n))
    if p and frame == "full" and not {"crash_zoom", "whip", "dip_out"} & set(fx):
        out["push"] = p
    return out

# ---------- 메인 ----------
def build(vkey):
    vdir = os.path.join(ROOT, "videos", vkey)
    an = json.load(open(os.path.join(vdir, "analysis.json"), encoding="utf-8"))
    cuts = json.load(open(os.path.join(vdir, "cuts.json"), encoding="utf-8"))
    meta = json.load(open(os.path.join(ROOT, "data", "meta", f"{an['id']}.json"), encoding="utf-8"))
    kit = os.path.join(ROOT, "kits", vkey)
    os.makedirs(os.path.join(kit, "hyperframes", "assets"), exist_ok=True)
    for sub in ("clips", "voice", "sfx", "audio"):
        os.makedirs(os.path.join(kit, sub), exist_ok=True)
    shots_t = {s["idx"]: (s["t_in"], s["t_out"]) for s in cuts["shots"]}
    by_n = {s["n"]: s for s in an["shots"]}
    zpath = os.path.join(vdir, "zoom_groups.json")
    zg = json.load(open(zpath, encoding="utf-8")) if os.path.exists(zpath) else {}
    eshots = []
    for c in cuts["shots"]:
        s = by_n[c["idx"]]
        tr, trd = classify_tr(s)
        frame = measure_frame(vdir, c) if vkey == "v2" else "full"
        fx = classify_fx(s)
        e = {"n": c["idx"], "t_in": c["t_in"], "t_out": c["t_out"], "dur": c["dur"], "frames": round(c["dur"] * FPS),
             "who": s["who"], "size": s["sz"], "gen": s["gen"], "models": s["m"], "tr": tr, "tr_dur": trd,
             "fx": fx, "frame": frame, "src_in": 0.5, "clip": f"clips/s{c['idx']:02d}.mp4"}
        e.update(reuse_fields(c["idx"], zg, fx, frame, s))
        if "push" in e and "push_in_slow" in e["fx"]:
            e["fx"] = [f for f in e["fx"] if f != "push_in_slow"]  # 측정한 실제 배율로 대체
        eshots.append(e)
    for i, e in enumerate(eshots[:-1]):  # 휩 팬 인서트(편집 컷)는 다음 컷 클립의 앞부분을 가로로 번지게 해서 만듦
        nxt = eshots[i + 1]
        if e["who"] == "insert" and e["gen"] == "edit" and "whip" in e["fx"] and "source" not in e and nxt["who"] not in ("black", "card"):
            e.update({"source": nxt.get("source", nxt["n"]), "zoom": 1.0, "cx": 0.5, "cy": 0.5, "clip": nxt["clip"],
                      "src_in": round(max(0.0, nxt["src_in"] - e["dur"]), 3)})
    edl = {"key": vkey, "id": an["id"], "title": meta.get("title"), "duration": cuts["shots"][-1]["t_out"], "fps": FPS, "shots": eshots,
           "reuse": zg.get("summary", {})}
    json.dump(edl, open(os.path.join(kit, "edl.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    with open(os.path.join(kit, "edl.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.writer(f)
        w.writerow(["컷", "시작(초)", "끝(초)", "길이(초)", "프레임", "대상", "사이즈", "전환(들어올 때)", "효과", "화면비", "생성 방식", "추천 모델",
                    "쓰는 클립", "클립 시작(초)", "디지털 줌(배율@중심)", "컷 안 줌(시작→끝 배율)"])
        for s in eshots:
            dz = f"x{s['zoom']}@{s['cx']:.2f},{s['cy']:.2f}" if "source" in s else ""
            ps = f"x{s['push']['scale']}" if "push" in s else ""
            w.writerow([s["n"], s["t_in"], s["t_out"], s["dur"], s["frames"], s["who"], s["size"], s["tr"], "|".join(s["fx"]), s["frame"],
                        "재사용" if "source" in s else s["gen"], "생성 불필요" if "source" in s else " > ".join(s["models"]),
                        s["clip"], s["src_in"], dz, ps])
    events = build_events(an, shots_t, vkey)
    # 상황 라벨이 기울임체인지는 영상별 분석값을 따름 (3위는 정자체)
    italic = any("기울임" in st.get("spec", "") and "기울임 없는" not in st.get("spec", "")
                 for st in an["captions"]["styles"] if st.get("css") == "label-hero")
    head = ASS_HEAD.replace("{font}", "Malgun Gothic")
    if not italic:
        head = head.replace("&H38FFFFFF,&H38FFFFFF,0,-1,0,0,100,100,0,0,3,7,0,2,20,20,158,1",
                            "&H38FFFFFF,&H38FFFFFF,0,0,0,0,100,100,0,0,3,7,0,2,20,20,158,1", 1)
    # 상황 라벨이 '검정 박스 + 흰 글씨'로 측정된 영상(8위 등)은 라벨 색을 뒤집음
    dark_label = any(re.search(r"검정|검은", st.get("spec", "")) and re.search(r"흰\s?(글씨|글자)", st.get("spec", ""))
                     for st in an["captions"]["styles"] if st.get("css") == "label-hero")
    if dark_label:
        head = head.replace("&H00463F3F,&H00463F3F,&H38FFFFFF,&H38FFFFFF", "&H00FFFFFF,&H00FFFFFF,&H10000000,&H10000000", 1)
    # 영상마다 실제 화자 대사 색이 다르면 분석값(speaker_colors)으로 교체
    colors = {k: v for k, v in (an.get("speaker_colors") or {}).items() if re.fullmatch(r"#[0-9A-Fa-f]{6}", str(v))}
    ass_col = lambda h: "&H00" + (h[5:7] + h[3:5] + h[1:3]).upper()
    base_ass = {"cw1": "&H0038EF2E", "cw2": "&H00DE9019", "leader": "&H0034E5D7"}
    base_css = {"cw1": "#2EEF38", "cw2": "#1990DE", "leader": "#D7E534"}
    for k, c in colors.items():
        if k in base_ass:
            head = head.replace(f"{base_ass[k]},{base_ass[k]},", f"{ass_col(c)},{ass_col(c)},")
    with open(os.path.join(kit, "captions.ass"), "w", encoding="utf-8-sig") as f:
        f.write(head + "\n".join(ass_events(events)) + "\n")
    rows = sfx_rows(an)
    with open(os.path.join(kit, "sfx_cues.csv"), "w", encoding="utf-8-sig", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["t", "file", "vol", "desc", "why"])
        w.writeheader(); w.writerows(rows)
    hf = hf_html(an, edl, events, rows)
    if not italic:
        hf = hf.replace("color: #3f3f46; font-style: italic; }", "color: #3f3f46; font-style: normal; }")
    if dark_label:
        hf = hf.replace("background: rgba(255,255,255,.78); color: #3f3f46;", "background: rgba(0,0,0,.92); color: #ffffff;", 1)
    for k, c in colors.items():
        if k in base_css:
            hf = hf.replace(f"color: {base_css[k]};", f"color: {c};")
    with open(os.path.join(kit, "hyperframes", "index.html"), "w", encoding="utf-8") as f:
        f.write(hf)
    kitrel = f"kimhamzzi_analysis/kits/{vkey}"
    with open(os.path.join(kit, "PROMPTS.md"), "w", encoding="utf-8") as f:
        f.write(prompts_md(an, edl, rows, kitrel))
    shutil.copy(os.path.join(ROOT, "tools", "static", "build_ffmpeg.py"), os.path.join(kit, "build_ffmpeg.py"))
    json.dump(events, open(os.path.join(kit, "caption_events.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"{vkey}: EDL {len(eshots)}컷, 자막 이벤트 {len(events)}개, 효과음 {len(rows)}개, 전환 "
          f"{sum(1 for s in eshots if s['tr'] != 'cut')}개, 효과 {sum(len(s['fx']) for s in eshots)}개, 화면비 {sorted(set(s['frame'] for s in eshots))}")

if __name__ == "__main__":
    for v in sys.argv[1:]:
        build(v)
