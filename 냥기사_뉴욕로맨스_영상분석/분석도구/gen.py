# -*- coding: utf-8 -*-
"""Build the 8-page reel-analysis report (one HTML page per video) + index."""
import html
import json
import shutil
import subprocess
from pathlib import Path

from data_sm import PAGE_SM1, PAGE_SM2, PAGE_SM3, SM_STYLE, SM_ANI_STYLE
from data_df import PAGE_DF2, DF_STYLE, DF_ANI_STYLE
from data_df2 import PAGE_DF4, PAGE_DF3
from data_df3 import PAGE_DF1, PAGE_GENT
from recipes import ffmpeg_recipe, hyperframes, ass_subs
from shared import CSS, JS, MODEL_GUIDE, WORKFLOW

NOWIN = getattr(subprocess, "CREATE_NO_WINDOW", 0)
OUT = Path("report")
PAGES = [PAGE_SM1, PAGE_SM2, PAGE_SM3, PAGE_DF2, PAGE_DF4, PAGE_DF3, PAGE_DF1, PAGE_GENT]
E = html.escape


def color_for(size):
    s = size.upper()
    if "인서트" in size or "INSERT" in s:
        return "#b48cff"
    if "ECU" in s or s.startswith("CU") or " CU" in s or "CU " in s:
        return "#ff7a6b"
    if "MCU" in s or "MS" in s or "OTS" in s or "2S" in s or "POV" in s:
        return "#f5b94a"
    if "WS" in s or "EWS" in s or "MWS" in s:
        return "#4fc3b0"
    return "#8a8f98"


def frame(page, idx, t):
    if not page.get("file"):
        return None
    d = OUT / "img" / page["key"]
    d.mkdir(parents=True, exist_ok=True)
    f = d / f"s{idx:02d}.jpg"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", f"{page['file']}.mp4",
                    "-frames:v", "1", "-vf", "scale=360:-2", "-q:v", "3", str(f)],
                   stdin=subprocess.DEVNULL, capture_output=True, timeout=60, creationflags=NOWIN)
    return f"img/{page['key']}/{f.name}" if f.exists() else None


def grid_svg(cells):
    on = {int(c) for c in cells.split(",") if c.strip() != ""}
    rects = []
    for i in range(9):
        x, y = (i % 3) * 30, (i // 3) * 53.3
        fill = "var(--accent)" if i in on else "transparent"
        op = "0.55" if i in on else "1"
        rects.append(f'<rect x="{x}" y="{y:.1f}" width="30" height="53.3" fill="{fill}" fill-opacity="{op}" stroke="var(--line)"/>')
    return f'<svg class="grid" viewBox="0 0 90 160" aria-label="화면 구성 3x3 그리드">{"".join(rects)}</svg>'


def timeline_svg(page, onsets):
    dur = page["shots"][-1]["t1"]
    W = 1000
    parts = []
    for i, s in enumerate(page["shots"], 1):
        x, w = s["t0"] / dur * W, max((s["t1"] - s["t0"]) / dur * W, 1)
        parts.append(f'<rect x="{x:.1f}" y="18" width="{w:.1f}" height="34" fill="{color_for(s["size"])}" stroke="var(--bg)" stroke-width="1.5">'
                     f'<title>#{i} {s["t0"]:.2f}–{s["t1"]:.2f}s {E(s["size"])}</title></rect>')
        if w > 14:
            parts.append(f'<text x="{x + w / 2:.1f}" y="40" text-anchor="middle" class="tl-n">{i}</text>')
    for o in onsets or []:
        parts.append(f'<line x1="{o / dur * W:.1f}" x2="{o / dur * W:.1f}" y1="56" y2="66" stroke="var(--muted)"/>')
    for t in range(0, int(dur) + 1, 5):
        parts.append(f'<text x="{t / dur * W:.1f}" y="12" class="tl-t">{t}s</text>')
    return f'<svg class="timeline" viewBox="-4 0 1010 70" preserveAspectRatio="none">{"".join(parts)}</svg>'


def diff_svg(diff, dur):
    if not diff:
        return ""
    pts = " ".join(f"{t / dur * 1000:.1f},{80 - min(v, 110) / 110 * 76:.1f}" for t, v in diff)
    return (f'<svg class="diff" viewBox="0 0 1000 82" preserveAspectRatio="none"><polyline points="{pts}" fill="none" '
            f'stroke="var(--accent)" stroke-width="1.5"/></svg><p class="cap">프레임 간 화면 변화량(10fps 샘플). 뾰족한 봉우리 = 하드컷, 넓은 언덕 = 카메라 흔들림·모션블러 전환</p>')


def cam_en(move):
    rules = [("트래킹", "camera dollies backward in front of the subject"), ("푸시인", "slow push-in"), ("낙하", "camera tumbling and falling with heavy motion blur"),
             ("넘어짐", "static, then the camera tips over onto its side"), ("핸드헬드", "handheld selfie micro-shake"), ("랙포커스", "slow push-in with rack focus"),
             ("와이프", "static, a door swings shut filling the frame"), ("점프컷", "handheld detail inserts"), ("0.2", "quick handheld fragments")]
    for k, v in rules:
        if k in move:
            return v
    return "locked-off static camera"


def prompt_block(label, text, cls=""):
    tid = f"p{abs(hash(text)) % 10**9}"
    return (f'<div class="pr {cls}"><div class="pr-h"><span>{label}</span><button class="copy" data-for="{tid}">복사</button></div>'
            f'<pre id="{tid}" data-tpl="{E(text)}">{E(text)}</pre></div>')


def shot_card(page, i, s, style, ani_style):
    img = frame(page, i, min((s["t0"] + s["t1"]) / 2, s["t1"] - 0.05)) if s["img"] else None
    visual = f'<img src="{img}" alt="샷 {i} 대표 프레임" loading="lazy">' if img else f'<div class="noimg">{E(page.get("noimg", "프레임 없음"))}</div>'
    d = s["t1"] - s["t0"]
    rows = [("길이", f"{s['t0']:.2f}s → {s['t1']:.2f}s ({d:.2f}초)"), ("샷 크기", s["size"]), ("앵글", s["angle"]),
            ("카메라 무빙", s["move"]), ("화면 구성", s["comp"]), ("행동/연기", s["action"]), ("대사·자막", s["line"]),
            ("전환(OUT)", s["trans"]), ("효과음", s["sfx"]), ("추천 모델", s["models"])]
    tbl = "".join(f"<tr><th>{k}</th><td>{E(v)}</td></tr>" for k, v in rows)
    prompts = ""
    if "printed" in s["img"]:
        style, ani_style = style.replace(", no text", ""), ani_style
    if s["img"]:
        prompts = (prompt_block("① 첫 프레임 이미지 프롬프트 (원본 재현)", f"{s['img']}, {style}")
                   + prompt_block("② 영상(I2V) 프롬프트", f"{s['vid']}. Single continuous shot, {d:.1f} seconds, camera: {cam_en(s['move'])}; "
                                  f"keep the character identical to the reference image. {style}")
                   + prompt_block("③ 동물 변환 버전 (이미지+영상 겸용)", f"{s['ani']}. Motion: {s['vid']}. {ani_style}", "ani"))
    return (f'<article class="shot" id="shot{i}"><div class="vis">{visual}{grid_svg(s["grid"])}</div>'
            f'<div class="body"><h3><span class="dot" style="background:{color_for(s["size"])}"></span>SHOT {i:02d} · {E(s["size"])}</h3>'
            f'<table>{tbl}</table>{prompts}</div></article>')


def page_html(n, page, total):
    fam_sm = page["key"].startswith("sm")
    style, ani_style = (SM_STYLE, SM_ANI_STYLE) if fam_sm else (DF_STYLE, DF_ANI_STYLE)
    an = {}
    if page.get("file"):
        p = Path(f"a_{page['file']}/analysis.json")
        if p.exists():
            an = json.loads(p.read_text(encoding="utf-8"))
    onsets = an.get("audio", {}).get("onsets")
    dur = page["shots"][-1]["t1"]
    shots_html = "".join(shot_card(page, i, s, style, ani_style) for i, s in enumerate(page["shots"], 1))
    grids = ""
    if page.get("file"):
        gdir = Path(f"a_{page['file']}")
        imgs = []
        for g in sorted(gdir.glob("grid*.jpg")):
            dst = OUT / "img" / page["key"] / g.name
            shutil.copy(g, dst)
            imgs.append(f'<a href="img/{page["key"]}/{g.name}" target="_blank"><img src="img/{page["key"]}/{g.name}" alt="0.5초 간격 프레임"></a>')
        grids = f'<section><h2>0.5초 간격 전체 프레임 캡처</h2><div class="grids">{"".join(imgs)}</div></section>'
    n_real = len([s for s in page["shots"] if s["img"]])
    asl = dur / max(n_real, 1)
    cast = "".join(f"<tr><td>{E(a)}</td><td class='anitxt' data-tpl='{E(b)}'>{E(b)}</td></tr>" for a, b in page["cast"])
    tech = "".join(f"<li><b>{E(a)}</b> — {E(b)}</li>" for a, b in page["techniques"])
    subs = ass_subs(page)
    cc_prompt = (f"[Claude Code 작업 지시 — {page['title']}]\n"
                 f"목표: 이 페이지의 샷 표({n_real}샷, 총 {dur:.2f}초)를 그대로 따라 {{ANIMAL}} 버전 릴스를 완성한다.\n"
                 "수정 가능 범위: 새 작업 폴더(shots/ cut/ audio/ sfx/ vo/ out/) 안에서만. 원본 파일 수정 금지. 🔴 승인 전 업로드·결제 금지.\n"
                 "1) 샷별 ③ 동물 프롬프트로 첫 프레임 이미지를 만든다 (캐릭터 시트 1장 먼저 확정 → 모든 샷에 레퍼런스로 사용).\n"
                 "2) 각 이미지를 '추천 모델'로 I2V 생성, 길이는 표의 초 + 0.5초 여유. 같은 샷을 2개 모델로 A/B 생성해 더 나은 쪽 선택.\n"
                 + ("3) '90° 회전' 표시 샷은 16:9 가로로 생성한 뒤 FFmpeg transpose=1로 돌린다.\n" if page.get("rotate") else "3) 대사 샷은 립싱크 가능한 모델(Veo/Kling 립싱크)로 생성하거나 무음 생성 후 립싱크 후처리.\n")
                 + "4) 아래 FFmpeg 레시피 1~4단계를 순서대로 실행해 final.mp4를 만든다 (창 없이 실행, 로그 파일 저장).\n"
                 "5) 원본과 나란히 비교: 컷 타이밍 ±0.1초, 샷 크기, 구도(3x3 그리드), 색감 체크리스트를 표로 보고.\n"
                 "6) 결과·명령·실패 내역을 작업기록.md에 누적 기록 후 멈춘다.")
    prev_l = f'<a href="p{n - 1}.html">← 이전</a>' if n > 1 else ""
    next_l = f'<a href="p{n + 1}.html">다음 →</a>' if n < total else ""
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(page['rank'])} 분석</title><style>{CSS}</style></head><body>
<nav class="top"><a href="index.html">☰ 전체 목록</a><span>{n} / {total}</span><span class="sp"></span>{prev_l}{next_l}
<label class="animal">변환 동물 <input id="animal" value="hamster" aria-label="변환할 동물 영어 이름"></label></nav>
<main>
<header><p class="kicker">PAGE {n} · {E(page['rank'])}</p><h1>{E(page['title'])}</h1>
<p class="meta"><a href="{E(page['url'])}" target="_blank" rel="noopener">{E(page['url'])}</a></p>
<div class="stats"><div><b>반응</b><span>{E(page['metrics'])}</span></div><div><b>규격</b><span>{E(page['spec'])}</span></div>
<div><b>평균 샷 길이</b><span>{asl:.2f}초 ({n_real}샷 / {dur:.2f}초)</span></div><div><b>제작 도구</b><span>{E(page['tool'])}</span></div></div></header>

<section><h2>1. 훅 &amp; 떡상 공식</h2><p class="hook">🎣 {E(page['hook'])}</p><ol class="formula">{''.join(f'<li>{E(x)}</li>' for x in page['formula'])}</ol>
<h3>왜 터졌나</h3><ul>{''.join(f'<li>{E(x)}</li>' for x in page['why'])}</ul></section>

<section><h2>2. 컷 타임라인 (실측)</h2>{timeline_svg(page, onsets)}
<p class="cap">색: <i style="--c:#ff7a6b">클로즈업</i> <i style="--c:#f5b94a">미디엄·OTS</i> <i style="--c:#4fc3b0">와이드</i> <i style="--c:#b48cff">인서트</i> · 아래 눈금 = 오디오 타격점(온셋){'' if onsets else ' (연령 제한 영상이라 오디오 측정 불가)'}</p>
{diff_svg(an.get('diff'), dur)}</section>

<section><h2>3. 편집 기법 (전문 용어 해설)</h2><ul class="tech">{tech}</ul></section>

<section><h2>4. 사운드 · 음악</h2><p>{E(page['music'])}</p><p class="cap">효과음은 각 샷 카드의 '효과음' 칸에 시점별로 정리. BGM은 원곡 대신 저작권 안전 음원(분위기 일치: {'시네마틱 앰비언트+효과음 중심' if fam_sm else '90년대 로맨스 인디 팝 / 라운지 재즈'})으로 교체 권장.</p></section>

<section><h2>5. 동물 변환 캐스팅</h2><table class="cast"><tr><th>원본</th><th>변환 (상단 입력칸의 동물로 자동 치환)</th></tr>{cast}</table>
<p class="cap">스타일 고정 블록 — 원본: <code>{E(style)}</code><br>동물 버전: <code class="anitxt" data-tpl="{E(ani_style)}">{E(ani_style)}</code></p></section>

<section><h2>6. 샷별 분해 ({len(page['shots'])}개) — 캡처 · 구도 · 프롬프트 · 추천 모델</h2>{shots_html}</section>
{grids}
<section><h2>7. AI 영상 모델 선택 가이드</h2>{MODEL_GUIDE}</section>

<section><h2>8. FFmpeg 편집 레시피 (실측 타이밍 자동 반영)</h2>{prompt_block('FFmpeg 명령', ffmpeg_recipe(page))}
{prompt_block('자막 파일 subs.ass (dreamfall 자막 스타일)', subs) if subs else ''}</section>

<section><h2>9. HyperFrames 컴포지션 (index.html)</h2><p class="cap">cut/ 폴더의 규격 통일 클립을 그대로 배치. 대사 구간 BGM 자동 덕킹(data-automation), 자막은 GSAP 페이드. 확인: <code>npx hyperframes check</code> → <code>npx hyperframes preview</code> → 승인 후 <code>render</code></p>
{prompt_block('HyperFrames index.html', hyperframes(page))}</section>

<section><h2>10. 다음 작업용 Claude Code 프롬프트</h2>{prompt_block('복붙용 지시문', cc_prompt, 'ani')}</section>

<section><h2>11. 재현 체크리스트</h2><ul class="check"><li>컷 개수 {n_real}개 · 각 샷 길이 ±0.1초</li><li>샷 크기 순서가 타임라인 색 순서와 같은가</li>
<li>3x3 구도 그리드에서 주인공 위치 일치</li><li>첫 1초 안에 훅 장면이 나오는가</li><li>엔딩이 원본처럼 {'하드컷 루프' if fam_sm else '반전/클리프행어'}로 끝나는가</li>
<li>색: {'흐린 초록·회색 안개, 채도 낮게' if fam_sm else '버건디·크림·샴페인, 필름 입자, 따뜻한 하이라이트'}</li><li>라우드니스 -14 LUFS, 대사 구간 BGM 덕킹</li></ul></section>
</main><script>{JS}</script></body></html>"""


def index_html():
    cards = []
    for n, p in enumerate(PAGES, 1):
        img = f"img/{p['key']}/s01.jpg" if p.get("file") else ""
        vis = f'<img src="{img}" alt="">' if img else '<div class="noimg">연령 제한 · 브라우저 분석</div>'
        n_real = len([s for s in p["shots"] if s["img"]])
        cards.append(f'<a class="card" href="p{n}.html">{vis}<div><p class="kicker">PAGE {n} · {E(p["rank"])}</p><h3>{E(p["title"])}</h3>'
                     f'<p>{E(p["metrics"])}</p><p class="cap">{n_real}샷 · {p["shots"][-1]["t1"]:.1f}초</p></div></a>')
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>릴스 역설계 리포트</title><style>{CSS}</style></head><body><main>
<header><p class="kicker">REEL REVERSE-ENGINEERING · 8 VIDEOS · 1 PAGE = 1 VIDEO</p><h1>떡상 릴스 8편 샷 단위 역설계</h1>
<p>sickmanai 조회수 TOP3 + dreamfall.art 5편. 컷 타이밍은 전부 프레임 차이 분석으로 실측. 각 페이지 = 캡처 · 구도 · 전환 · 사운드 · 프롬프트(원본/동물) · 모델 추천 · FFmpeg · HyperFrames.</p></header>
<section class="cards">{''.join(cards)}</section>
<section><h2>공통 제작 워크플로</h2>{WORKFLOW}</section>
<section><h2>AI 영상 모델 선택 가이드</h2>{MODEL_GUIDE}</section></main><script>{JS}</script></body></html>"""


def main():
    OUT.mkdir(exist_ok=True)
    for n, p in enumerate(PAGES, 1):
        (OUT / f"p{n}.html").write_text(page_html(n, p, len(PAGES)), encoding="utf-8")
        print("page", n, p["key"], len(p["shots"]), "shots")
    (OUT / "index.html").write_text(index_html(), encoding="utf-8")


if __name__ == "__main__":
    main()
