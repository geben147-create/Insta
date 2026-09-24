# -*- coding: utf-8 -*-
"""GitHub Pages site: one combined page (copy-all) + per-video folders with photo ZIPs."""
import itertools
import json
import shutil
import subprocess
import zipfile
from pathlib import Path

from gen import PAGES, E, color_for, grid_svg, timeline_svg, diff_svg, cam_en, NOWIN
from data_sm import SM_STYLE, SM_ANI_STYLE
from data_df import DF_STYLE, DF_ANI_STYLE
from recipes import ffmpeg_recipe, hyperframes, ass_subs
from shared import CSS, JS, MODEL_GUIDE, WORKFLOW

SITE = Path("site")
FOLDERS = {"sm1": "기사냥이_셀카드래곤", "sm2": "이별냥이_눈물", "sm3": "기사냥이_드래곤비행",
           "df2": "로맨스_2화_창문통화", "df4": "로맨스_4화_청첩장", "df3": "로맨스_3화_길건너",
           "df1": "로맨스_1화_첫만남", "gent": "로맨스_신사의코트"}
IDS = itertools.count(1)
EXTRA_CSS = """
.bar{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}.btn{display:inline-block;background:var(--accent);color:#111;border:0;border-radius:8px;
padding:10px 16px;font-weight:700;text-decoration:none;cursor:pointer;font-size:15px}.btn.sec{background:var(--panel2);color:var(--ink);border:1px solid var(--line)}
.toc{columns:2;font-size:14px}.toc a{display:block;padding:2px 0}.video{border-top:3px solid var(--accent);margin-top:36px;padding-top:8px}
.vis a{display:block;width:100%}.vis a img{cursor:zoom-in}@media (max-width:760px){.toc{columns:1}}
"""
COPY_ALL_JS = """
document.addEventListener('click',function(e){var b=e.target.closest('[data-copyall]');if(!b)return;
 var src=document.getElementById(b.getAttribute('data-copyall'));var a=(document.getElementById('animal')||{}).value||'hamster';
 var t=(src.value||src.textContent).split('{ANIMAL}').join(a.trim()||'hamster');var label=b.textContent;
 function ok(){b.textContent='✅ 복사 완료 ('+Math.round(t.length/1000)+'천 자)';setTimeout(function(){b.textContent=label;},1800);}
 function fb(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(x){}ta.remove();}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,fb);}else{fb();}});
"""


def styles(page):
    return (SM_STYLE, SM_ANI_STYLE) if page["key"].startswith("sm") else (DF_STYLE, DF_ANI_STYLE)


def extract(page, idx, t, dst, width):
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-ss", f"{t:.2f}", "-i", f"{page['file']}.mp4",
                    "-frames:v", "1", "-vf", f"scale={width}:-2", "-q:v", "3", str(dst)],
                   stdin=subprocess.DEVNULL, capture_output=True, timeout=60, creationflags=NOWIN)


def build_photos(page):
    """Thumbnails for the page + one ZIP (720px frames + 0.5s grids). Returns zip filename or None."""
    if not page.get("file"):
        return None
    folder = SITE / FOLDERS[page["key"]]
    pdir, hdir = folder / "사진", Path("tmp_hi") / page["key"]
    pdir.mkdir(parents=True, exist_ok=True)
    hdir.mkdir(parents=True, exist_ok=True)
    zname = f"{FOLDERS[page['key']]}_사진.zip"
    with zipfile.ZipFile(folder / zname, "w", zipfile.ZIP_DEFLATED) as z:
        for i, s in enumerate(page["shots"], 1):
            if not s["img"]:
                continue
            t = min((s["t0"] + s["t1"]) / 2, s["t1"] - 0.05)
            extract(page, i, t, pdir / f"s{i:02d}.jpg", 360)
            hi = hdir / f"샷{i:02d}_{s['t0']:.1f}s-{s['t1']:.1f}s.jpg"
            extract(page, i, t, hi, 720)
            if hi.exists():
                z.write(hi, hi.name)
        for g in sorted(Path(f"a_{page['file']}").glob("grid*.jpg")):
            shutil.copy(g, pdir / g.name)
            z.write(g, f"0.5초간격_{g.name}")
    return zname


def prompt_block(label, text, cls=""):
    tid = f"p{next(IDS)}"
    return (f'<div class="pr {cls}"><div class="pr-h"><span>{label}</span><button class="copy" data-for="{tid}">복사</button></div>'
            f'<pre id="{tid}" data-tpl="{E(text)}">{E(text)}</pre></div>')


def shot_prompts(s, style, ani_style):
    if not s["img"]:
        return None
    if "printed" in s["img"]:
        style = style.replace(", no text", "")
    d = s["t1"] - s["t0"]
    return (f"{s['img']}, {style}",
            f"{s['vid']}. Single continuous shot, {d:.1f} seconds, camera: {cam_en(s['move'])}; keep the character identical to the reference image. {style}",
            f"{s['ani']}. Motion: {s['vid']}. {ani_style}")


def shot_card(page, i, s, prefix, zname):
    style, ani_style = styles(page)
    key = page["key"]
    thumb = f"{prefix}사진/s{i:02d}.jpg"
    if page.get("file") and s["img"] and (SITE / FOLDERS[key] / "사진" / f"s{i:02d}.jpg").exists():
        visual = (f'<a href="{prefix}{zname}" download title="클릭하면 이 영상 사진 전체 ZIP 다운로드">'
                  f'<img src="{thumb}" alt="샷 {i} 대표 프레임" loading="lazy"></a>')
    else:
        visual = f'<div class="noimg">{E(page.get("noimg", "프레임 없음"))}</div>'
    d = s["t1"] - s["t0"]
    rows = [("길이", f"{s['t0']:.2f}s → {s['t1']:.2f}s ({d:.2f}초)"), ("샷 크기", s["size"]), ("앵글", s["angle"]),
            ("카메라 무빙", s["move"]), ("화면 구성", s["comp"]), ("행동/연기", s["action"]), ("대사·자막", s["line"]),
            ("전환(OUT)", s["trans"]), ("효과음", s["sfx"]), ("추천 모델", s["models"])]
    tbl = "".join(f"<tr><th>{k}</th><td>{E(v)}</td></tr>" for k, v in rows)
    pr = shot_prompts(s, style, ani_style)
    prompts = ""
    if pr:
        prompts = (prompt_block("① 첫 프레임 이미지 프롬프트 (원본 재현)", pr[0]) + prompt_block("② 영상(I2V) 프롬프트", pr[1])
                   + prompt_block("③ 동물 변환 버전 (이미지+영상 겸용)", pr[2], "ani"))
    return (f'<article class="shot" id="{key}-shot{i}"><div class="vis">{visual}{grid_svg(s["grid"])}</div>'
            f'<div class="body"><h3><span class="dot" style="background:{color_for(s["size"])}"></span>SHOT {i:02d} · {E(s["size"])}</h3>'
            f'<table>{tbl}</table>{prompts}</div></article>')


def cc_prompt(page):
    n_real = len([s for s in page["shots"] if s["img"]])
    dur = page["shots"][-1]["t1"]
    return (f"[Claude Code 작업 지시 — {page['title']}]\n"
            f"목표: 이 분석의 샷 표({n_real}샷, 총 {dur:.2f}초)를 그대로 따라 {{ANIMAL}} 버전 릴스를 완성한다.\n"
            "수정 가능 범위: 새 작업 폴더(shots/ cut/ audio/ sfx/ vo/ out/) 안에서만. 원본 파일 수정 금지. 🔴 승인 전 업로드·결제 금지.\n"
            "1) 샷별 ③ 동물 프롬프트로 첫 프레임 이미지를 만든다 (캐릭터 시트 1장 먼저 확정 → 모든 샷에 레퍼런스로 사용).\n"
            "2) 각 이미지를 '추천 모델'로 I2V 생성, 길이는 표의 초 + 0.5초 여유. 같은 샷을 2개 모델로 A/B 생성해 더 나은 쪽 선택.\n"
            + ("3) '90° 회전' 표시 샷은 16:9 가로로 생성한 뒤 FFmpeg transpose=1로 돌린다.\n" if page.get("rotate") else "3) 대사 샷은 립싱크 가능한 모델(Veo/Kling 립싱크)로 생성하거나 무음 생성 후 립싱크 후처리.\n")
            + "4) FFmpeg 레시피 1~4단계를 순서대로 실행해 final.mp4를 만든다 (창 없이 실행, 로그 파일 저장).\n"
            "5) 원본과 나란히 비교: 컷 타이밍 ±0.1초, 샷 크기, 구도(3x3 그리드), 색감 체크리스트를 표로 보고.\n"
            "6) 결과·명령·실패 내역을 작업기록.md에 누적 기록 후 멈춘다.")


def video_body(n, page, prefix, zname):
    style, ani_style = styles(page)
    an = {}
    p = Path(f"a_{page['file']}/analysis.json") if page.get("file") else None
    if p and p.exists():
        an = json.loads(p.read_text(encoding="utf-8"))
    onsets = an.get("audio", {}).get("onsets")
    dur = page["shots"][-1]["t1"]
    n_real = len([s for s in page["shots"] if s["img"]])
    key = page["key"]
    shots_html = "".join(shot_card(page, i, s, prefix, zname) for i, s in enumerate(page["shots"], 1))
    cast = "".join(f"<tr><td>{E(a)}</td><td data-tpl='{E(b)}'>{E(b)}</td></tr>" for a, b in page["cast"])
    tech = "".join(f"<li><b>{E(a)}</b> — {E(b)}</li>" for a, b in page["techniques"])
    subs = ass_subs(page)
    zbtn = (f'<a class="btn" href="{prefix}{zname}" download>📦 이 영상 사진 ZIP</a>' if zname
            else '<span class="btn sec">📦 사진 없음 (연령 제한 영상 — 브라우저 안에서만 분석)</span>')
    grids = ""
    if zname:
        imgs = "".join(f'<a href="{prefix}{zname}" download><img src="{prefix}사진/{g.name}" alt="0.5초 간격 프레임" loading="lazy"></a>'
                       for g in sorted((SITE / FOLDERS[key] / "사진").glob("grid*.jpg")))
        grids = f'<h2>0.5초 간격 전체 프레임</h2><div class="grids">{imgs}</div>'
    return f"""<header id="{key}"><p class="kicker">VIDEO {n} · {E(page['rank'])} · 폴더 {E(FOLDERS[key])}</p><h1>{E(page['title'])}</h1>
<p class="meta"><a href="{E(page['url'])}" target="_blank" rel="noopener">{E(page['url'])}</a></p>
<div class="stats"><div><b>반응</b><span>{E(page['metrics'])}</span></div><div><b>규격</b><span>{E(page['spec'])}</span></div>
<div><b>평균 샷 길이</b><span>{dur / max(n_real, 1):.2f}초 ({n_real}샷 / {dur:.2f}초)</span></div><div><b>제작 도구</b><span>{E(page['tool'])}</span></div></div>
<div class="bar"><button class="btn" data-copyall="txt-{key}">📋 이 영상 분석 전체 복사</button>{zbtn}</div></header>
<section><h2>1. 훅 &amp; 떡상 공식</h2><p class="hook">🎣 {E(page['hook'])}</p><ol class="formula">{''.join(f'<li>{E(x)}</li>' for x in page['formula'])}</ol>
<h3>왜 터졌나</h3><ul>{''.join(f'<li>{E(x)}</li>' for x in page['why'])}</ul></section>
<section><h2>2. 컷 타임라인 (실측)</h2>{timeline_svg(page, onsets)}
<p class="cap">색: <i style="--c:#ff7a6b">클로즈업</i> <i style="--c:#f5b94a">미디엄·OTS</i> <i style="--c:#4fc3b0">와이드</i> <i style="--c:#b48cff">인서트</i> · 아래 눈금 = 오디오 타격점{'' if onsets else ' (연령 제한 영상이라 오디오 측정 불가)'}</p>
{diff_svg(an.get('diff'), dur)}</section>
<section><h2>3. 편집 기법 (전문 용어 해설)</h2><ul class="tech">{tech}</ul></section>
<section><h2>4. 사운드 · 음악</h2><p>{E(page['music'])}</p></section>
<section><h2>5. 동물 변환 캐스팅</h2><table class="cast"><tr><th>원본</th><th>변환</th></tr>{cast}</table>
<p class="cap">스타일 고정 블록 — 원본: <code>{E(style)}</code><br>동물 버전: <code data-tpl="{E(ani_style)}">{E(ani_style)}</code></p></section>
<section><h2>6. 샷별 분해 ({len(page['shots'])}개) — 사진 클릭 = 사진 ZIP 다운로드</h2>{shots_html}{grids}</section>
<section><h2>7. FFmpeg 편집 레시피</h2>{prompt_block('FFmpeg 명령', ffmpeg_recipe(page))}{prompt_block('자막 subs.ass', subs) if subs else ''}</section>
<section><h2>8. HyperFrames 컴포지션</h2>{prompt_block('HyperFrames index.html', hyperframes(page))}</section>
<section><h2>9. 다음 작업용 Claude Code 프롬프트</h2>{prompt_block('복붙용 지시문', cc_prompt(page), 'ani')}</section>"""


def video_text(n, page):
    """Plain-text (markdown) export of everything for one video."""
    style, ani_style = styles(page)
    L = [f"# VIDEO {n}. {page['title']}", f"- 링크: {page['url']}", f"- 반응: {page['metrics']}", f"- 규격: {page['spec']}",
         f"- 제작 도구: {page['tool']}", f"- 음악/사운드: {page['music']}", "", f"## 훅\n{page['hook']}", "", "## 떡상 공식"]
    L += page["formula"] + ["", "## 왜 터졌나"] + [f"- {x}" for x in page["why"]] + ["", "## 편집 기법"]
    L += [f"- {a}: {b}" for a, b in page["techniques"]] + ["", "## 동물 변환 캐스팅"] + [f"- {a} → {b}" for a, b in page["cast"]]
    L += ["", f"## 스타일 블록\n- 원본: {style}\n- 동물: {ani_style}", "", "## 샷별 분해"]
    for i, s in enumerate(page["shots"], 1):
        L += [f"### SHOT {i:02d} · {s['size']} · {s['t0']:.2f}s→{s['t1']:.2f}s ({s['t1'] - s['t0']:.2f}초)",
              f"- 앵글: {s['angle']} / 무빙: {s['move']}", f"- 구성: {s['comp']}", f"- 행동: {s['action']}", f"- 대사·자막: {s['line']}",
              f"- 전환: {s['trans']} / 효과음: {s['sfx']}", f"- 추천 모델: {s['models']}"]
        pr = shot_prompts(s, style, ani_style)
        if pr:
            L += [f"- ① 이미지: {pr[0]}", f"- ② 영상: {pr[1]}", f"- ③ 동물: {pr[2]}"]
        L.append("")
    L += ["## FFmpeg 레시피", "```bash", ffmpeg_recipe(page), "```"]
    subs = ass_subs(page)
    if subs:
        L += ["## 자막 subs.ass", "```", subs, "```"]
    L += ["## HyperFrames index.html", "```html", hyperframes(page), "```", "## Claude Code 프롬프트", cc_prompt(page), ""]
    return "\n".join(L)


def text_script(tid, text):
    return f'<textarea id="{tid}" hidden readonly>{E(text)}</textarea>'


def doc(title, body, extra_nav=""):
    return f"""<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title><style>{CSS}{EXTRA_CSS}</style></head><body>
<nav class="top">{extra_nav}<span class="sp"></span><label class="animal">변환 동물 <input id="animal" value="hamster" aria-label="변환할 동물 영어 이름"></label></nav>
<main>{body}</main><script>{JS}{COPY_ALL_JS}</script></body></html>"""


def main():
    if SITE.exists():
        shutil.rmtree(SITE)
    SITE.mkdir()
    zips, texts, bodies, toc = {}, [], [], []
    for n, p in enumerate(PAGES, 1):
        zips[p["key"]] = build_photos(p)
        texts.append((p, video_text(n, p)))
    all_md = ("{ANIMAL} = 변환할 동물 (예: hamster). 페이지 상단 입력칸 값으로 자동 치환되어 복사됩니다.\n\n"
              + "\n\n".join(t for _, t in texts) + "\n\n# 공통\n모델 가이드와 워크플로는 웹페이지 참조.")
    (SITE / "전체내용.md").write_text(all_md, encoding="utf-8")
    with zipfile.ZipFile(SITE / "사진전체.zip", "w", zipfile.ZIP_DEFLATED) as z:
        for key, zn in zips.items():
            if zn:
                with zipfile.ZipFile(SITE / FOLDERS[key] / zn) as src:
                    for name in src.namelist():
                        z.writestr(f"{FOLDERS[key]}/{name}", src.read(name))
    for n, (p, t) in enumerate(texts, 1):
        folder = FOLDERS[p["key"]]
        body_c = video_body(n, p, f"{folder}/", zips[p["key"]])
        bodies.append(f'<div class="video">{body_c}</div>{text_script("txt-" + p["key"], t)}')
        toc.append(f'<a href="#{p["key"]}">{n}. {E(p["title"])}</a>')
        body_s = video_body(n, p, "", zips[p["key"]]) + text_script("txt-" + p["key"], t)
        (SITE / folder / "index.html").parent.mkdir(parents=True, exist_ok=True)
        (SITE / folder / "index.html").write_text(doc(p["title"], body_s, '<a href="../">☰ 전체 합본으로</a>'), encoding="utf-8")
    head = f"""<header><p class="kicker">INSTA REEL REVERSE-ENGINEERING · 8 VIDEOS · 한 페이지 합본</p><h1>떡상 릴스 8편 샷 단위 역설계 (합본)</h1>
<p>sickmanai 조회수 TOP3 + dreamfall.art 5편. 컷 타이밍은 프레임 변화량으로 실측. 아래 버튼 하나로 8편 분석 전체(프롬프트·FFmpeg·HyperFrames 포함)가 복사됩니다.</p>
<div class="bar"><button class="btn" data-copyall="txt-all">📋 8편 전체 내용 한 번에 복사</button><a class="btn" href="사진전체.zip" download>📦 사진 전체 ZIP</a>
<a class="btn sec" href="전체내용.md" download>⬇ 전체내용.md 파일</a></div><nav class="toc">{''.join(toc)}</nav></header>
<section><h2>공통 제작 워크플로</h2>{WORKFLOW}</section><section><h2>AI 영상 모델 선택 가이드</h2>{MODEL_GUIDE}</section>"""
    body = head + "".join(bodies) + text_script("txt-all", all_md)
    (SITE / "index.html").write_text(doc("떡상 릴스 8편 역설계 합본", body, '<a href="#">↑ 맨 위</a>'), encoding="utf-8")
    (SITE / ".nojekyll").write_text("", encoding="utf-8")
    print("site built:", sum(1 for _ in SITE.rglob("*")), "files")


if __name__ == "__main__":
    main()
