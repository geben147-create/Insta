"""HTML rendering for the per-video breakdown pages, the all-in-one page and the index.

Every render function takes a `ctx` dict describing where things live, so the same markup can be
emitted for the local preview layout (flat files) and the GitHub Pages layout (one folder per video).
"""
import json
from html import escape

from editkit import clip_plan, ffmpeg_script, hyperframes_html, srt, trans_of
from export import to_markdown

TRANS_KO = {"cut": "하드컷", "fade": "크로스 디졸브", "fadeblack": "딥투블랙", "fadewhite": "화이트 플래시",
            "dissolve": "노이즈 디졸브", "zoomin": "줌 트랜지션", "smoothleft": "스와이프",
            "none": "연속 테이크(컷 없음)", "end": "엔딩"}


def e(x) -> str:
    return escape(str(x))


def local_ctx(v: dict) -> dict:
    """Flat preview layout: out/pN.html, out/img/vN/, out/assets/."""
    return {"css": "assets/style.css", "js": "assets/app.js", "img": f"img/v{v['id']}",
            "full": f"img/v{v['id']}", "home": "index.html", "href": lambda x: x["page"],
            "extras": []}


def head(title: str, css: str) -> str:
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><link rel="icon" href="data:,">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{e(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{css}"></head><body>"""


def nav(prev_v, next_v, ctx) -> str:
    p = f'<a href="{ctx["href"](prev_v)}">← {e(prev_v["short"])}</a>' if prev_v else "<span></span>"
    n = f'<a href="{ctx["href"](next_v)}">{e(next_v["short"])} →</a>' if next_v else "<span></span>"
    return f'<nav class="top"><a href="{ctx["home"]}">☰ 전체 목록</a>{p}{n}</nav>'


def pic(ctx, name: str, alt: str, cap: str) -> str:
    return (f'<figure><a href="{ctx["full"]}/{name}" target="_blank" rel="noopener" title="원본 크기로 열기">'
            f'<img loading="lazy" src="{ctx["img"]}/{name}" alt="{e(alt)}"></a><figcaption>{e(cap)}</figcaption></figure>')


def toolbar(v, ctx) -> str:
    links = "".join(f'<a class="btn ghost" href="{href}" download>{e(label)}</a>' for label, href in ctx["extras"])
    return (f'<div class="toolbar"><button class="btn" data-copy-md>📋 이 영상 전체 내용 복사</button>'
            f'<button class="btn ghost" data-save-md="{e(v["short"])}.md">📥 .md 파일로 저장</button>{links}</div>')


def hero(v, ctx) -> str:
    shots = v["shots"]
    cuts = sum(1 for s in shots[:-1] if trans_of(s)[0] != "none")
    asl = round(v["duration"] / max(len(shots), 1), 2)
    chips = [("좋아요", f'{v["likes"]:,}'), ("댓글", f'{v["comments"]:,}'), ("게시일", v["date"]),
             ("길이", f'{v["duration"]}초'), ("원본 규격", f'{v["res"]} · {v["fps"]}fps'),
             ("구간 수", f'{len(shots)}개 (편집점 {cuts})'), ("평균 구간 길이", f"{asl}초")]
    chip_html = "".join(f'<div class="chip"><b>{e(k)}</b><span>{e(val)}</span></div>' for k, val in chips)
    return f"""<header class="hero"><div class="rank">{e(v['rank_label'])}</div>
<h1>{e(v['title'])}</h1><p class="sub">{e(v['creator'])} · <a href="{e(v['url'])}" target="_blank" rel="noopener">원본 게시물 열기 ↗</a></p>
<div class="chips">{chip_html}</div>{toolbar(v, ctx)}
<div class="note"><b>추정 제작 도구</b> {e(v['model_guess'])}</div>
<div class="note"><b>캡션 요지</b> {e(v['caption'])}</div></header>"""


def summary(v) -> str:
    viral = "".join(f"<li>{e(x)}</li>" for x in v["viral"])
    return f"""<section><h2>① 30초 요약 — 왜 떡상했나</h2>
<div class="grid2"><div class="card"><h3>훅(첫 1초)</h3><p>{e(v['hook'])}</p>
<h3>구조 공식</h3><p class="formula">{e(v['formula'])}</p></div>
<div class="card"><h3>바이럴 장치</h3><ul>{viral}</ul></div></div></section>"""


def strip(v, ctx) -> str:
    step = v.get("strip_step", 1.0)
    cells = "".join(pic(ctx, f"strip_{k:03d}.jpg", f"{k * step:.1f}초 프레임", f"{k * step:.1f}s")
                    for k in range(v["strip_count"]))
    return f"""<section><h2>② 필름스트립 — {step}초 간격 캡처 (좌우 스크롤 · 클릭하면 원본 크기)</h2>
<div class="strip">{cells}</div></section>"""


def timeline(v, idp) -> str:
    total = v["duration"]
    segs, rows = [], []
    for i, s in enumerate(v["shots"], 1):
        dur = s["t1"] - s["t0"]
        name, d = trans_of(s)
        cls = "cut" if name == "cut" else ("cont" if name in ("none", "end") else "xf")
        segs.append(f'<a href="#{idp}shot{i}" class="seg {cls}" style="flex:{dur:.3f}" '
                    f'title="#{i} {s["t0"]}–{s["t1"]}s">{i}</a>')
        tlabel = TRANS_KO.get(name, name) + (f" {d}s" if name not in ("cut", "none", "end") else "")
        rows.append(f"<tr><td>#{i}</td><td>{s['t0']:.2f}</td><td>{s['t1']:.2f}</td><td>{dur:.2f}s</td>"
                    f"<td>{e(s['size'])}</td><td>{e(tlabel)}</td><td>{e(s.get('trans_note', ''))}</td></tr>")
    ticks = "".join(f'<span style="left:{t / total * 100:.2f}%">{t}s</span>'
                    for t in range(0, int(total) + 1, max(1, int(total // 10) or 1)))
    return f"""<section><h2>③ 컷 타임라인 — 몇 초마다 화면이 바뀌나</h2>
<div class="tl">{''.join(segs)}</div><div class="ticks">{ticks}</div>
<p class="legend"><i class="cut"></i>하드컷 <i class="xf"></i>디졸브/특수전환 <i class="cont"></i>한 테이크 안의 동작 구간(카메라 무브로 연결)</p>
<div class="tablewrap"><table><thead><tr><th>구간</th><th>IN</th><th>OUT</th><th>길이</th><th>샷 사이즈</th><th>다음으로 넘어가는 방식</th><th>전환 메모</th></tr></thead>
<tbody>{''.join(rows)}</tbody></table></div></section>"""


def copy_pre(text: str, cls: str = "prompt", tpl: bool = True) -> str:
    body = f'<pre class="{cls}" data-tpl="{e(text)}"></pre>' if tpl else f'<pre class="{cls}">{e(text)}</pre>'
    return body + '<button class="copy">복사</button>'


def look(v) -> str:
    rows = "".join(f"<tr><th>{e(k)}</th><td>{e(val)}</td></tr>" for k, val in v["look"])
    chars = "".join(f'<div class="card"><h3>{e(n)}</h3>{copy_pre(d)}</div>' for n, d in v["characters"])
    return f"""<section><h2>④ 룩 바이블 — 배경·조명·렌즈·색</h2>
<div class="tablewrap"><table class="kv">{rows}</table></div>
<h3>캐릭터 시트 (모든 샷에 공통으로 붙이는 고정 묘사 — 일관성의 핵심)</h3><div class="grid2">{chars}</div>
<div class="card"><h3>공통 네거티브 프롬프트</h3>{copy_pre(v['negative'])}</div></section>"""


def swap(v) -> str:
    ctrls = []
    for key, slot in v["slots"].items():
        opts = "".join(f'<option value="{e(val)}"{" selected" if val == slot["default"] else ""}>{e(lab)}</option>'
                       for lab, val in slot["options"])
        ctrls.append(f'<label>{e(slot["label"])} <code>{{{{{key}}}}}</code>'
                     f'<select data-slot="{key}">{opts}</select>'
                     f'<input data-slot-custom="{key}" placeholder="직접 입력 (영어)"></label>')
    rows = "".join(f"<tr><th>{e(a)}</th><td>{e(n)}</td></tr>" for a, n in v["swaps"])
    return f"""<section><h2>⑤ 다른 동물로 바꾸기 — 선택하면 아래 모든 프롬프트와 '전체 복사' 내용이 바뀜</h2>
<div class="swapbar">{''.join(ctrls)}</div>
<div class="tablewrap"><table class="kv">{rows}</table></div></section>"""


def shot_card(v, i, s, ctx, idp) -> str:
    imgs = "".join(pic(ctx, f"s{i:02d}_{k}.jpg", f"구간{i} {t}초", f"{t}s") for k, t in enumerate(s["frames"], 1))
    name, d = trans_of(s)
    tlabel = TRANS_KO.get(name, name) + (f" ({d}s)" if name not in ("cut", "none", "end") else "")
    meta = [("시간", f"{s['t0']:.2f} → {s['t1']:.2f}s ({s['t1'] - s['t0']:.2f}s)"), ("샷 사이즈", s["size"]),
            ("앵글", s["angle"]), ("카메라 무브", s["move"]), ("화면 구성(위치)", s["comp"]),
            ("동작/연기", s["action"]), ("대사·자막", s.get("line", "없음")), ("소리", s.get("audio", "-")),
            ("다음 전환", f"{tlabel} — {s.get('trans_note', '')}")]
    grid = "".join(f"<dt>{e(k)}</dt><dd>{e(val)}</dd>" for k, val in meta)
    models = "".join(f'<li><b>{k}. {e(m)}</b> — {e(why)}</li>' for k, (m, why) in enumerate(s["models"], 1))
    return f"""<article class="shot" id="{idp}shot{i}"><h3>구간 #{i} · {e(s['name'])}</h3>
<div class="frames">{imgs}</div><dl>{grid}</dl>
<div class="grid2"><div><h4>🖼 첫 프레임 이미지 프롬프트</h4>{copy_pre(s['img'])}</div>
<div><h4>🎬 영상 프롬프트 (image-to-video)</h4>{copy_pre(s['vid'])}</div></div>
<h4>추천 모델 (잘하는 순)</h4><ul class="models">{models}</ul></article>"""


def sound(v) -> str:
    a = v["audio"]
    rows = "".join(f'<tr><td>{t:.2f}s</td><td>{e(d)}</td><td><code>{e(p)}</code></td></tr>' for t, d, p in a["sfx"])
    return f"""<section><h2>⑦ 사운드 디자인 — 배경음악 · 효과음</h2>
<div class="grid2"><div class="card"><h3>원본 오디오 분석</h3><p>{e(a['bgm'])}</p>
<p><b>템포 추정</b> {e(a['bpm'])}</p><p><b>믹스</b> {e(a['mix'])}</p></div>
<div class="card"><h3>음악 생성 프롬프트 (Suno · ElevenLabs Music · Pollo text2music)</h3>{copy_pre(a['music_prompt'])}</div></div>
<h3>효과음 큐시트 (타임코드 = FFmpeg adelay 값)</h3>
<div class="tablewrap"><table><thead><tr><th>시점</th><th>효과음</th><th>생성 프롬프트 (ElevenLabs SFX 등)</th></tr></thead><tbody>{rows}</tbody></table></div></section>"""


def editing(v) -> str:
    terms = "".join(f"<tr><th>{e(k)}</th><td>{e(val)}</td></tr>" for k, val in v["edit_terms"])
    need = "".join(f"<tr><td>shot{p['i']:02d}.mp4</td><td>{p['seen']}s</td><td>{p['need']}s</td></tr>"
                   for p in clip_plan(v))
    subs = ""
    if v.get("subs"):
        subs = f'<div class="card"><h3>자막 파일 subs.srt</h3>{copy_pre(srt(v), "code", False)}</div>'
    return f"""<section><h2>⑧ 편집 — 전문 용어 · FFmpeg · HyperFrames</h2>
<h3>이 영상에 쓰인 편집 기법</h3><div class="tablewrap"><table class="kv">{terms}</table></div>
<h3>생성해야 할 클립 길이 (전환 여유 포함)</h3><div class="tablewrap"><table><thead><tr><th>파일</th><th>화면에 보이는 시간</th><th>생성/트림 길이</th></tr></thead><tbody>{need}</tbody></table></div>
<div class="card"><h3>색보정 의도</h3><p>{e(v['grade_note'])}</p><code>{e(v['grade'])}</code></div>
<div class="card"><h3>FFmpeg 전체 스크립트 (build.sh)</h3>{copy_pre(ffmpeg_script(v), "code", False)}</div>
{subs}
<div class="card"><h3>HyperFrames 컴포지션 (index.html) — 컷 타이밍 그대로</h3>{copy_pre(hyperframes_html(v), "code", False)}</div>
</section>"""


def closing(v) -> str:
    checks = "".join(f"<li><label><input type='checkbox'> {e(c)}</label></li>" for c in v["checklist"])
    return f"""<section><h2>⑨ 똑같이 만들기 체크리스트</h2><ul class="checks">{checks}</ul>
<div class="card"><h3>Claude Code에 그대로 붙여넣는 제작 프롬프트</h3>{copy_pre(v['cc_prompt'])}</div></section>"""


def video_body(v, ctx, idp) -> str:
    """All sections of one video wrapped in a scope that owns its own animal-slot state."""
    slots = {k: s["default"] for k, s in v["slots"].items()}
    shots = "".join(shot_card(v, i, s, ctx, idp) for i, s in enumerate(v["shots"], 1))
    return (f"<div class=\"scope\" id=\"{idp}top\" data-scope=\"v{v['id']}\" "
            f"data-slots='{e(json.dumps(slots, ensure_ascii=False))}'>"
            f'<textarea class="md" hidden>{e(to_markdown(v))}</textarea>'
            + hero(v, ctx) + summary(v) + strip(v, ctx) + timeline(v, idp) + look(v) + swap(v)
            + f'<section><h2>⑥ 구간별 정밀 분석 + 프롬프트</h2>{shots}</section>'
            + sound(v) + editing(v) + closing(v) + "</div>")


def render_page(v, prev_v, next_v, ctx=None) -> str:
    ctx = ctx or local_ctx(v)
    return (head(f"{v['short']} 분석", ctx["css"]) + nav(prev_v, next_v, ctx) + "<main>"
            + video_body(v, ctx, f"v{v['id']}-") + f'</main><script src="{ctx["js"]}"></script></body></html>')


def render_all(videos, ctx_of, css, js, extras) -> str:
    toc = "".join(f'<li><a href="#v{v["id"]}-top">{e(v["short"])}</a> — {e(v["title"])}</li>' for v in videos)
    links = "".join(f'<a class="btn ghost" href="{href}" download>{e(label)}</a>' for label, href in extras)
    bodies = "".join(video_body(v, ctx_of(v), f"v{v['id']}-") + '<hr class="vsep">' for v in videos)
    return (head("레퍼런스 7편 전체 한 페이지", css)
            + '<nav class="top"><a href="./">☰ 목차</a><span>전체 한 페이지</span><a href="#top">맨 위 ↑</a></nav>'
            + '<main id="top"><header class="hero"><div class="rank">인스타 떡상 레퍼런스 7편 · 전체 한 페이지</div>'
            + '<h1>모든 분석 내용이 이 한 페이지에</h1>'
            + '<p class="sub">아래 버튼 한 번이면 7편 전체 내용(프롬프트·타임라인·효과음·FFmpeg·HyperFrames 포함)이 복사됩니다. '
              '각 영상의 ⑤번 칸에서 동물을 바꾸면 복사 내용에도 반영됩니다.</p>'
            + f'<div class="toolbar big"><button class="btn" data-copy-all>📋 7편 전체 내용 한 번에 복사</button>'
              f'<button class="btn ghost" data-save-all="레퍼런스7편_전체내용.md">📥 전체 .md 저장</button>{links}</div>'
            + f'<ol class="toc">{toc}</ol></header>{bodies}</main><script src="{js}"></script></body></html>')


def render_index(videos, href=None, thumb=None, css="assets/style.css", extras=None) -> str:
    href = href or (lambda x: x["page"])
    thumb = thumb or (lambda x: f"img/v{x['id']}/s01_1.jpg")
    ranked = sorted(videos, key=lambda x: -x["likes"])
    rank_of = {x["id"]: k for k, x in enumerate(ranked, 1)}
    cards = "".join(
        f'<a class="vcard" href="{href(v)}"><img src="{thumb(v)}" alt="">'
        f'<div><div class="rank">{e(v["rank_label"])}</div><h3>{e(v["short"])} — {e(v["title"])}</h3>'
        f'<p>{v["likes"]:,} 좋아요 · {v["duration"]}초 · {len(v["shots"])}구간 · 좋아요 순위 {rank_of[v["id"]]}/7</p>'
        f'<p class="formula">{e(v["formula"])}</p></div></a>' for v in videos)
    links = "".join(f'<a class="btn{" ghost" if k else ""}" href="{h}"{" download" if h.endswith(".zip") or h.endswith(".md") else ""}>{e(lab)}</a>'
                    for k, (lab, h) in enumerate(extras or []))
    return (head("레퍼런스 7편 분석", css)
            + '<main><header class="hero"><div class="rank">인스타 떡상 레퍼런스 7편</div>'
            '<h1>장면·전환·사운드·편집 완전 분해</h1><p class="sub">영상 1편 = 1페이지. 각 페이지에서 동물을 바꾸면 모든 프롬프트가 같이 바뀜.</p>'
            f'<div class="toolbar big">{links}</div></header>'
            f'<section><div class="vlist">{cards}</div></section></main></body></html>')
