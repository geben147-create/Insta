"""모든 분석을 한 페이지(HTML) + 전체 텍스트(MD)로 합치기.
- public : 원본 캡처·자막 원문 없음 (GitHub 공개용)
- private: 캡처 사진(내장) + 자막 원문 포함 (개인 ZIP용)
사용: python tools/build_onepage.py <출력폴더> public|private"""
import base64, csv, glob, io, json, math, os, re, statistics, sys
from collections import Counter
from jinja2 import Environment, FileSystemLoader, select_autoescape
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kitdata import ANIMALS, ACCESSORIES, MODELS, IMAGE_MODELS, AUDIO_MODELS, NEGATIVE, GEN_HINT, HERO_SUFFIX, WHO_COLOR, WHO_KO  # noqa: E402
from build_site import timeline_svg, emotion_svg, section, fmt_k, jload, TR_KO, FX_KO, CAP_CLS, SP_KO  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30
VKEYS = ["v1", "v2", "v3"]
RANK_DIR = {"v1": "1위", "v2": "2위", "v3": "3위"}
PUBLIC_DIR = "햄찌유튜브_영상분석"
DEFAULT = {"animal": "otter", "acc": "lanyard", "name": "김OO"}
HERO_TYPES = {"hero", "hero_costume", "group"}
DEFAULT_RHYTHM = ("해석: 컷과 박자 일치율이 우연 수준과 비슷하므로 <b>음악 박자가 아니라 대사·리액션 타이밍으로 자른 편집</b>입니다. "
                  "따라 만들 때는 '문장 하나 = 컷 2~3개, 리액션 컷은 0.4~0.7초'를 기준으로 자르세요.")


# ---------- 프롬프트 조립 (페이지 JS 와 같은 규칙) ----------
def hero_desc(a, acc):
    return ", ".join(x for x in [a["en"], acc["en"], HERO_SUFFIX] if x)


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
    cons = " The animal must match the character reference sheet exactly (same fur color, markings and accessory)." if who in HERO_TYPES else ""
    return re.sub(r"[.\s]+$", "", s) + ". " + look + "." + cons


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
    shots = []
    for i, c in enumerate(cuts["shots"]):
        n = c["idx"]; s = dict(by_n[n]); e = edl_n[n]
        img_tpl, vid_tpl = compose_img(s["img"], s["who"], an["look"]), compose_vid(s["mot"], s["who"])
        s.update({"t_in": c["t_in"], "t_out": c["t_out"], "dur": c["dur"], "frames": round(c["dur"] * FPS),
                  "color": WHO_COLOR.get(s["who"], "#888"), "who_ko": WHO_KO.get(s["who"], s["who"]), "palette": pal.get(n, []),
                  "tr_label": TR_KO.get(e["tr"], e["tr"]), "sp_ko": SP_KO.get(s.get("cap", {}).get("sp", "hero"), ""),
                  "fx_labels": [FX_KO.get(f, f) for f in e["fx"]] + ([f"화면비 {e['frame']}"] if e["frame"] != "full" else []),
                  "gen_hint": GEN_HINT.get(s["gen"], ""), "models": [MODELS[m] for m in s["m"] if m in MODELS],
                  "img_tpl": img_tpl, "vid_tpl": vid_tpl, "img_default": fill(img_tpl, c0), "vid_default": fill(vid_tpl, c0),
                  "act_default": fill(s["act"], c0), "lb_default": fill(s["cap"].get("lb") or "", c0),
                  "new_default": fill(s.get("new", ""), c0), "vo_default": fill(s.get("vo", ""), c0)})
        if mode == "private":
            s["img_a"] = b64img(os.path.join(vdir, "watch_cuts", "frames", f"cue_{i:04d}.jpg"), 560, 72)
            s["img_m"] = b64img(os.path.join(vdir, "shots", f"s{n:02d}_m.jpg"), 360, 70)
            s["img_z"] = b64img(os.path.join(vdir, "shots", f"s{n:02d}_z.jpg"), 360, 70)
        shots.append(s)
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
    if mode == "private" and os.path.exists(os.path.join(ROOT, "site", "assets", v, "capdemo_bg.jpg")):
        bg = b64img(os.path.join(ROOT, "site", "assets", v, "capdemo_bg.jpg"), 640, 72)
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
                                                  "text": e["text"], "text_default": fill(e["text"], c0)} for e in evs if e["style"] in want]})
                break
        if len(demos) >= 4:
            break
    md = open(os.path.join(kit, "PROMPTS.md"), encoding="utf-8").read().replace(f"kimhamzzi_analysis/kits/{v}", f"{PUBLIC_DIR}/편집키트/{RANK_DIR[v]}")
    test_p = os.path.join(kit, "test_result.txt")
    mcount = Counter(m for s in an["shots"] for m in s["m"])
    thumbs = []
    if mode == "private":
        thumbs = [b64img(os.path.join(vdir, "watch_cuts", "frames", f"cue_{int(len(shots) * f):04d}.jpg"), 420, 70) for f in (0.05, 0.45, 0.8)]
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
            "page": {"cast": an["cast"], "sets": an["sets"], "look": an["look"], "costume": an["adapt"].get("costume", "")}}


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
    L += [f"- 비용 절약: {st['n']}컷 중 {st['still_n']}컷은 정지 이미지·편집 효과로 충분, 나머지는 배치별 5초 생성 후 잘라 쓰기 → 약 {st['gen_est']}회 생성",
          "\n| 이 영상에 쓰는 모델 | 종류 | 사양 | 이럴 때 | 추천 컷 수 |", "|---|---|---|---|---|"]
    L += [f"| {m['name']} | {m['kind']} | {cell(m['spec'])} | {cell(m['best'])} | {m['count']} |" for m in d["model_rows"]]
    return "\n".join(L) + "\n"


def main():
    out, mode = sys.argv[1], sys.argv[2]
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
    compare = [("형식", [d["an"]["fmt"] for d in vids]), ("길이 · 컷 · 평균 컷", [f"{d['st']['dur']}초 · {d['st']['n']}컷 · {d['st']['asl']}초" for d in vids]),
               ("분당 컷 수", [d["st"]["cpm"] for d in vids]), ("대사 비율 · 원본 음량", [f"{d['st']['speech']}% · {d['st']['lufs']} LUFS" for d in vids]),
               ("핵심 구조", [" → ".join(d["an"]["formula"][:4]) + " …" for d in vids]),
               ("자막 스타일", [", ".join(s["name"] for s in d["an"]["captions"]["styles"][:4]) for d in vids]),
               ("사람 처리", [", ".join(c["role"] for k, c in d["an"]["cast"].items() if k != "hero") for d in vids])]
    dna = ["실사풍 동물 × 한국 직장인·일상 공감 소재. 동물은 진짜 동물처럼, 상황은 사람처럼",
           "30~45초 가로 16:9(4K 업로드). 쇼츠 탭이 아닌 일반 동영상 탭에서도 짧은 길이로 승부",
           "자막 3층 구조(상황 라벨 · 화자별 색 대사 · 강조)로 소리 없이 봐도 100% 이해",
           "사람은 입 아래로 얼굴을 자르거나(오피스) 이모지로 가림(브이로그) → 시선 집중 + AI 얼굴 일관성 문제 회피",
           f"업로드 시각 고정: 최근 30개 중 {cnt}개가 {slot}(퇴근 직전). 영어·일본어 자막으로 해외 시청까지 확장",
           "반전 설계: 기대 → 더 나쁜 현실(1위) / 가짜 엔딩 → 진짜 하이라이트(2위) / 복선 → 회수(3위)",
           "대화 구간은 대사·리액션 타이밍으로 자르고, 3위 위기 구간만 저음 박동에 맞춤"]
    workflow = [("캐릭터 시트", "선택한 동물의 정면·측면·뒷모습·전신을 한 장에. 모든 컷의 참조 이미지"),
                ("세트·인물 기준 이미지", "책상, 파티션, 동료(얼굴 크롭) 등 반복되는 배경·인물을 먼저 1장씩"),
                ("컷별 키프레임", "각 컷의 ① 이미지 프롬프트로 첫 장면 생성(참조: 시트 + 세트)"),
                ("영상 생성", "② 영상 프롬프트 + 1순위 모델로 5초 생성. 배치별로 묶어 생성하고 잘라 쓰기"),
                ("목소리·음악·효과음", "TTS(주인공은 피치 +7반음), Suno BGM, 효과음 큐 시트대로 준비"),
                ("편집", f"{PUBLIC_DIR}/편집키트/N위 의 FFmpeg 또는 HyperFrames 키트로 조립 → 컷 검증"),
                ("업로드", "평일 17:45, 짧은 감정형 제목, 영어·일본어 자막, AI 합성 콘텐츠 공개 체크")]
    gen_master = f"""[작업 폴더] {PUBLIC_DIR} (GitHub geben147-create/Insta 를 받아서 사용. 1위 기준 예시 — 2위·3위도 같은 방식)
[목표] index.html(한 페이지)에서 동물을 고른 뒤 '📋 전체 복사' 또는 '.md 저장'으로 받은 내용으로 1위 영상을 다른 동물로 재현할 이미지·영상을 만든다.
[도구] pollo-generate 스킬(또는 Pollo MCP)
[순서]
1) 캐릭터 시트 1장 생성 (nano-banana-pro, 16:9, 2K) → 파일 경로 보고 → 🔴 내 승인 대기
2) 세트·인물 기준 이미지 생성(책상, 파티션, 동료1, 동료2, 상사 — 사람은 얼굴이 입 위로 잘리게) → 승인 대기
3) 배치 A부터 컷별 키프레임 이미지 생성 (참조: 캐릭터 시트 + 해당 세트 이미지)
4) 🔴 영상 생성 전에 pollo_estimate_generation_cost 로 배치별 예상 크레딧 표를 보여주고, 내 승인 후에만 진행
5) 컷마다 1순위 모델로 5초·1080p 생성 → {PUBLIC_DIR}/편집키트/1위/clips/sNN.mp4 로 저장 (NN = 컷 번호)
6) 대안 모델 비교는 배치별 대표 컷 1개만 (A/B 결과 표로 보고)
7) 끝나면 {PUBLIC_DIR}/편집키트/1위 에서 python build_ffmpeg.py --check 결과 보고
[금지] 승인 없는 크레딧 사용, 원본 영상 캡처를 참조 이미지로 업로드, 원본 대사·캐릭터 이름 사용"""
    sheet_tpl = ("Character reference sheet of {HERO}: front view, three-quarter view, side view, back view and a full-body standing pose, "
                 "plain light-grey studio background, soft even lighting, photorealistic, identical design in every view, 16:9.")
    c_common = ctx_for(None, a0, acc0)
    # ---- 전체 텍스트 조각 (페이지 JS 가 동물 선택에 맞춰 토큰 치환) ----
    head = [f"# 햄찌 유튜브 영상 분석 — 전체 (기준일 {today})",
            "정서불안 김햄찌 채널 동영상 탭 최근 30개를 일평균 조회수(조회수 ÷ 올린 뒤 지난 날수)로 순위를 매기고, 상위 3개를 컷 단위로 분석해 다른 동물로 재현할 수 있게 정리한 자료입니다.",
            "원본 대사는 옮기지 않고 의도만 요약했으며, '새 대본 예시'는 새로 쓴 문장입니다.",
            f"\n## 채널 개요\n- 구독자 {ch['subs']} · 동영상 탭 {ch['total']}개 중 최근 30개 분석 · 최근 30개 조회수 중앙값 {ch['median']} · 길이 중앙값 {ch['dur']}초",
            f"- 가장 많은 업로드 시각 {ch['slot']} KST · 영어·일본어 자막 제공 {ch['subs_ratio']}",
            "\n## 기간 대비 성과 Top 10 (최근 30개 기준)", "| 순위 | 제목 | 링크 | 업로드 | 경과일 | 길이 | 조회수 | 일평균 | 중앙값 대비 | 댓글/1천뷰 | 자막 |",
            "|---|---|---|---|---|---|---|---|---|---|---|"]
    head += [f"| {r['rank']} | {cell(r['title'])} | {r['url']} | {r['upload']} | {r['age']} | {r['duration']}초 | {r['views']:,} | {r['vpd']:,} | ×{r['outlier']} | {r['cpk']} | {r['subs']} |" for r in top10]
    head += ["- 순위 읽는 법: 일평균 조회수는 최근 영상이 유리 → 1~3위는 지금 알고리즘이 밀어주는 포맷, 4~10위는 꾸준히 성과를 낸 영상. 좋아요는 비공개라 댓글로 참여도 측정",
             "\n## 채널 공식(3개 영상 공통점과 차이)", "| 항목 | " + " | ".join(f"{d['rank']}위 {cell(d['title'])}" for d in vids) + " |", "|---|---|---|---|"]
    head += [f"| {cell(k)} | " + " | ".join(cell(x) for x in vals) + " |" for k, vals in compare]
    head += [f"- {x}" for x in dna]
    head += ["\n## 제작 순서"] + [f"{i}. {a} — {b}" for i, (a, b) in enumerate(workflow, 1)]
    head += [f"\n## 0단계 캐릭터 시트 프롬프트\n{sheet_tpl}", f"\n## 공통 네거티브 프롬프트\n{NEGATIVE}",
             "\n## Claude Code 생성 총괄 프롬프트", "```", gen_master, "```"]
    chunks = [{"v": "common", "md": "\n".join(head) + "\n"}]
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
        mode=mode, today=today, ch=ch, top10=top10, compare=compare, dna=dna, workflow=workflow, gen_master=gen_master, negative=NEGATIVE,
        sheet_tpl=sheet_tpl, sheet_default=fill(sheet_tpl, c_common), videos=vids, subtitles=subtitles,
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
