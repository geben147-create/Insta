"""Plain Markdown export of one video's full breakdown (used by the copy-all buttons and .md files).

Animal placeholders ({{A}}, {{B}}, {{C}}) are kept; the page script fills them with the viewer's choice.
"""
from editkit import clip_plan, ffmpeg_script, hyperframes_html, srt, trans_of

TRANS_KO = {"cut": "하드컷", "fade": "크로스 디졸브", "none": "연속 테이크(컷 없음)", "end": "엔딩"}


def fence(text: str, lang: str = "") -> str:
    return f"```{lang}\n{text}\n```"


def table(head: list, rows: list) -> str:
    def cell(x):
        return str(x).replace("|", "\\|").replace("\n", " ")
    lines = ["| " + " | ".join(head) + " |", "|" + "---|" * len(head)]
    lines += ["| " + " | ".join(cell(c) for c in r) + " |" for r in rows]
    return "\n".join(lines)


def shot_md(i: int, s: dict) -> str:
    name, d = trans_of(s)
    tlabel = TRANS_KO.get(name, name) + (f" {d}s" if name not in ("cut", "none", "end") else "")
    meta = [("시간", f"{s['t0']:.2f} → {s['t1']:.2f}s ({s['t1'] - s['t0']:.2f}s)"), ("캡처 시점", ", ".join(f"{t}s" for t in s["frames"])),
            ("샷 사이즈", s["size"]), ("앵글", s["angle"]), ("카메라 무브", s["move"]), ("화면 구성(위치)", s["comp"]),
            ("동작/연기", s["action"]), ("대사·자막", s.get("line", "없음")), ("소리", s.get("audio", "-")),
            ("다음 전환", f"{tlabel} — {s.get('trans_note', '')}")]
    models = "\n".join(f"{k}. {m} — {why}" for k, (m, why) in enumerate(s["models"], 1)) or "-"
    return "\n\n".join([
        f"### 구간 #{i} · {s['name']}",
        table(["항목", "내용"], meta),
        "**첫 프레임 이미지 프롬프트**", fence(s["img"]),
        "**영상 프롬프트 (image-to-video)**", fence(s["vid"]),
        "**추천 모델 (잘하는 순)**", models,
    ])


def to_markdown(v: dict) -> str:
    a = v["audio"]
    plan = clip_plan(v)
    slots = "\n".join(f"- {{{{{k}}}}} = {s['label']} (현재 선택값이 프롬프트에 들어감)" for k, s in v["slots"].items())
    cut_rows = [(f"#{i}", f"{s['t0']:.2f}", f"{s['t1']:.2f}", f"{s['t1'] - s['t0']:.2f}s", s["size"],
                 TRANS_KO.get(trans_of(s)[0], trans_of(s)[0]), s.get("trans_note", ""))
                for i, s in enumerate(v["shots"], 1)]
    parts = [
        f"# {v['short']} — {v['title']}",
        f"- 원본: {v['url']}\n- 제작자: {v['creator']}\n- 좋아요 {v['likes']:,} · 댓글 {v['comments']:,} · 게시일 {v['date']}\n"
        f"- 길이 {v['duration']}초 · {v['res']} · {v['fps']}fps · 구간 {len(v['shots'])}개\n"
        f"- 추정 제작 도구: {v['model_guess']}\n- 캡션 요지: {v['caption']}",
        "## ① 왜 떡상했나", f"**훅(첫 1초)** {v['hook']}", f"**구조 공식** {v['formula']}",
        "\n".join(f"- {x}" for x in v["viral"]),
        "## ③ 컷 타임라인", table(["구간", "IN", "OUT", "길이", "샷 사이즈", "전환", "메모"], cut_rows),
        "## ④ 룩 바이블", table(["항목", "내용"], v["look"]),
        "### 캐릭터 시트 (모든 샷 공통 문장)",
        "\n\n".join(f"**{n}**\n{fence(d)}" for n, d in v["characters"]),
        "**공통 네거티브 프롬프트**", fence(v["negative"]),
        "## ⑤ 동물 바꾸기", slots, table(["바꿀 때", "변경 포인트"], v["swaps"]),
        "## ⑥ 구간별 정밀 분석 + 프롬프트",
        "\n\n".join(shot_md(i, s) for i, s in enumerate(v["shots"], 1)),
        "## ⑦ 사운드 디자인",
        f"- 원본 오디오: {a['bgm']}\n- 템포: {a['bpm']}\n- 믹스: {a['mix']}",
        "**음악 생성 프롬프트**", fence(a["music_prompt"]),
        table(["시점", "효과음", "생성 프롬프트"], [(f"{t:.2f}s", d, p) for t, d, p in a["sfx"]]),
        "## ⑧ 편집", table(["기법", "이 영상에서"], v["edit_terms"]),
        table(["파일", "화면에 보이는 시간", "생성/트림 길이"], [(f"shot{p['i']:02d}.mp4", f"{p['seen']}s", f"{p['need']}s") for p in plan]),
        f"**색보정** {v['grade_note']}", fence(v["grade"]),
        "**FFmpeg 전체 스크립트 (build.sh)**", fence(ffmpeg_script(v), "bash"),
    ]
    if v.get("subs"):
        parts += ["**자막 subs.srt**", fence(srt(v), "srt")]
    parts += [
        "**HyperFrames 컴포지션 (index.html)**", fence(hyperframes_html(v), "html"),
        "## ⑨ 체크리스트", "\n".join(f"- [ ] {c}" for c in v["checklist"]),
        "**Claude Code 제작 프롬프트**", fence(v["cc_prompt"]),
    ]
    return "\n\n".join(parts) + "\n"
