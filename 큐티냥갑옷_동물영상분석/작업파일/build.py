"""Render analysis.json + shots.json into one HTML page per video (ranked by likes) + index."""
import html, json, os, re, shutil, zipfile

OUT = os.environ.get('OUT', '../reel_analysis')
WEB = os.environ.get('WEB') == '1'  # public build: no source mp4, zips + copy-all
E = html.escape

CSS = """
:root{--bg:#f6f5f2;--card:#fff;--ink:#1d1d1f;--mute:#6b6b70;--line:#e3e1dc;--acc:#d9481c;--acc2:#2f6fdb;
--ok:#1f8a4c;--chip:#f0eee9;--code:#15171c;--codeink:#e8e6e1;--shot:#2f6fdb}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111214;--card:#1a1b1f;--ink:#ececef;
--mute:#9a9aa3;--line:#2b2c31;--acc:#ff7a4d;--acc2:#6aa0ff;--ok:#4cc27f;--chip:#24252a;--code:#0b0c0e;--codeink:#e8e6e1}}
:root[data-theme="dark"]{--bg:#111214;--card:#1a1b1f;--ink:#ececef;--mute:#9a9aa3;--line:#2b2c31;--acc:#ff7a4d;
--acc2:#6aa0ff;--ok:#4cc27f;--chip:#24252a;--code:#0b0c0e;--codeink:#e8e6e1}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 "Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif}
.wrap{max-width:1180px;margin:0 auto;padding:24px 16px 80px}
a{color:var(--acc2)}h1{font-size:28px;line-height:1.25;margin:6px 0 4px}h2{font-size:20px;margin:40px 0 12px;padding-top:8px;border-top:2px solid var(--ink)}
h3{font-size:16px;margin:0 0 8px}.mute{color:var(--mute)}.nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;font-size:13px}
.nav a{padding:4px 10px;border:1px solid var(--line);border-radius:999px;text-decoration:none;color:var(--ink);background:var(--card)}
.nav a.on{background:var(--ink);color:var(--bg)}
.rank{display:inline-block;background:var(--acc);color:#fff;font-weight:800;border-radius:6px;padding:2px 10px;font-size:13px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin:14px 0}
.stat{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.stat b{display:block;font-size:20px}
.stat span{font-size:12px;color:var(--mute)}
.hero{display:grid;grid-template-columns:300px 1fr;gap:20px;align-items:start}
.hero video{width:100%;border-radius:12px;background:#000}
@media (max-width:760px){.hero{grid-template-columns:1fr}.hero video{max-width:320px}}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin:12px 0}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}@media (max-width:760px){.grid2{grid-template-columns:1fr}}
ul{margin:4px 0;padding-left:20px}li{margin:2px 0}
table{width:100%;border-collapse:collapse;font-size:14px}td,th{border-bottom:1px solid var(--line);padding:6px 8px;text-align:left;vertical-align:top}
th{width:150px;color:var(--mute);font-weight:600}
.tl{position:relative;height:46px;border-radius:8px;overflow:hidden;display:flex;border:1px solid var(--line)}
.tl div{height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;
border-right:2px solid var(--bg);min-width:2px;overflow:hidden;white-space:nowrap}
.tlw{position:relative}.axis{display:flex;justify-content:space-between;font-size:11px;color:var(--mute)}
svg.env{width:100%;height:70px;display:block}
.shot{border-left:5px solid var(--shot)}.shothead{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}
.shothead .n{font-size:22px;font-weight:900;color:var(--shot)}.pill{display:inline-block;background:var(--chip);border-radius:999px;padding:2px 10px;font-size:12px;margin:2px 4px 2px 0}
.pill.m{background:var(--acc2);color:#fff}.pill.m1{background:var(--acc);color:#fff}
.strip{display:flex;gap:8px;overflow-x:auto;padding:6px 0 10px}.fr{position:relative;flex:0 0 auto}
.fr img{height:260px;border-radius:8px;display:block}.fr .t{position:absolute;left:6px;top:6px;background:rgba(0,0,0,.65);color:#fff;font-size:11px;padding:1px 6px;border-radius:4px}
.fr .g{position:absolute;inset:0;pointer-events:none;display:none;border-radius:8px;
background:linear-gradient(to right,transparent 33.1%,rgba(255,255,0,.8) 33.3%,transparent 33.5%,transparent 66.4%,rgba(255,255,0,.8) 66.6%,transparent 66.8%),
linear-gradient(to bottom,transparent 33.1%,rgba(255,255,0,.8) 33.3%,transparent 33.5%,transparent 66.4%,rgba(255,255,0,.8) 66.6%,transparent 66.8%)}
body.grid .fr .g{display:block}
.pr{position:relative;margin:8px 0}.pr .lab{font-size:12px;font-weight:700;color:var(--mute);margin-bottom:2px}
pre{background:var(--code);color:var(--codeink);padding:12px 14px;border-radius:8px;white-space:pre-wrap;word-break:break-word;font:12.5px/1.55 ui-monospace,Consolas,monospace;margin:0;max-height:520px;overflow:auto}
.cp{position:absolute;right:8px;top:22px;font-size:11px;border:0;border-radius:6px;padding:3px 8px;background:var(--acc);color:#fff;cursor:pointer}
.swap{background:var(--chip);border-radius:10px;padding:10px 12px;margin-top:10px}
.tbtn{position:fixed;right:16px;bottom:16px;background:var(--ink);color:var(--bg);border:0;border-radius:999px;padding:10px 14px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.contact{width:100%;border-radius:10px}.big{display:inline-block;border:0;border-radius:10px;padding:10px 16px;margin:4px 6px 4px 0;font-weight:800;font-size:15px;cursor:pointer;text-decoration:none;background:var(--acc);color:#fff}.big.b2{background:var(--acc2)}.big.b3{background:var(--ink);color:var(--bg)}textarea.hid{position:absolute;left:-9999px;width:1px;height:1px}.vsec{border-top:6px solid var(--acc);margin-top:60px;padding-top:10px}
.idx td{vertical-align:middle}.idx th{width:auto}.idx img{height:90px;border-radius:6px}
@media (max-width:760px){th{width:32%}.idx th,.idx td{width:auto}.idx td:nth-child(n+4),.idx th:nth-child(n+4){display:none}.idx img{height:64px}.idx td{padding:6px 4px}pre{font-size:12px}}
"""

JS = """
function cp(b){const t=b.parentElement.querySelector('pre').innerText;navigator.clipboard.writeText(t).then(()=>{b.textContent='복사됨';setTimeout(()=>b.textContent='복사',1200)})}
function tg(){document.body.classList.toggle('grid')}
function cpAll(id,b){const t=document.getElementById(id).value;navigator.clipboard.writeText(t).then(()=>{const o=b.textContent;b.textContent='✅ 전체 복사됨 ('+t.length.toLocaleString()+'자)';setTimeout(()=>b.textContent=o,2000)})}
"""

COMMON = """
<h2>10편 공통 공식 — 그동안 똑같이 안 나왔던 이유</h2>
<div class="grid2">
<div class="card"><h3>① 90도 회전 트릭 (가장 중요)</h3><ul>
<li>기사냥이 시리즈의 용 장면은 <b>16:9 가로로 생성 → 편집에서 시계방향 90도 회전</b>(ffmpeg <code>transpose=1</code>)해서 9:16을 꽉 채웁니다. 그래서 풀밭이 화면 왼쪽, 하늘이 오른쪽에 있습니다.</li>
<li>회전 비중: pt.1 62% · pt.2 82% · pt.3 82% · pt.6 74% · pt.5 64%.</li>
<li>처음부터 "옆으로 누운 세로 화면"을 생성하면 모델이 수평을 바로잡아 버립니다. <b>반드시 정상 가로 영상으로 생성하고, 돌리는 건 편집에서만</b>.</li>
<li>워터마크는 회전 후에 똑바로 얹었습니다 (편집에서 돌렸다는 증거).</li></ul></div>
<div class="card"><h3>② 생성·프레임 흔적</h3><ul>
<li>대부분 <b>24fps로 생성 → 30fps로 내보냄</b> (5프레임마다 같은 프레임 반복). 컷 안에서 이 패턴이 끊기지 않아서 컷 1개 = 생성 1번으로 판단했습니다.</li>
<li>2위 Cucurella, 5위 heartbreak, 8위 햄스터는 <b>컷 없는 한 번 생성</b>(8~10초)입니다. 편집보다 연기(표정 흐름)와 생성 영상 안의 카메라 움직임(줌·빠지기)이 핵심입니다.</li>
<li>pt.6은 15.04초 구간 하나에 컷 5개가 들어 있어 Seedance 15초 1회 생성을 잘라 쓴 것으로 추정합니다.</li></ul></div>
<div class="card"><h3>③ 길이 vs 좋아요</h3><ul>
<li>15초 33.5만 · 26초 37.1만 · 36.6초 28.9만 · 53.8초 5.6만(최하위). <b>30초 안쪽이 최적</b>입니다.</li>
<li>최하위 pt.5는 핵심 장면(화살 잡기)이 13.5초에야 나오고, 주인공 얼굴이 화면에 잡히는 시간이 17%뿐입니다.</li></ul></div>
<div class="card"><h3>④ 후킹·댓글 공식</h3><ul>
<li>0~2초에 새끼고양이가 렌즈를 정면으로 보거나 화면 밖을 흘끗 봄 → "저기 뭐 있지?" 궁금증.</li>
<li>화면 자막 거의 없음. 대신 캡션에 <b>Comment "guide"/"prompt"</b> 문구 → 댓글 수 최상위(pt.1 3,438개).</li>
<li>결말 없이 끊기는 클리프행어 + "pt.N" 시리즈 넘버링 → 다음 편 대기와 다시보기 유도.</li></ul></div>
</div>
<div class="card"><h3>제작 파이프라인 (페이지마다 컷별로 적용)</h3><ol>
<li>캐릭터 시트 1장 고정 (nano-banana-pro / seedream-5-0-pro) → 모든 컷의 기준 이미지</li>
<li>컷별 시작 프레임 이미지 생성 (페이지의 ① 이미지 프롬프트). 회전 컷은 <b>16:9</b>로 생성</li>
<li>Image→Video (② 영상 프롬프트 · 추천 모델 1순위부터). 필요하면 ③ 끝 프레임까지 지정해서 First-Last 모드로</li>
<li>FFmpeg 스크립트로 조립: 회전(transpose=1) → 컷 타이밍 → 전환 → 색보정 → BGM·효과음</li>
<li>또는 HyperFrames 프롬프트를 Claude Code에 붙여넣어 타임라인 편집</li></ol>
<p class="mute">⚠️ 음성·가사 전사는 Whisper 키 오류로 못 했습니다. 소리는 음량 곡선과 타격 지점 분석으로 추정한 것이고, 페이지에 "추정"으로 표시돼 있습니다.</p></div>
"""

SHOT_COLORS = ['#2f6fdb', '#d9481c', '#1f8a4c', '#8a3fd1', '#c7901a', '#0f8a8a', '#c2366b', '#5b6b7f']


def g(d, *keys, default=''):
    for k in keys:
        if not isinstance(d, dict):
            return default
        d = d.get(k)
        if d is None:
            return default
    return d


def fmt_k(n):
    if not n:
        return '-'
    return f'{n / 10000:.1f}만' if n >= 10000 else str(n)


def prompt_block(label, text):
    if not text:
        return ''
    return (f'<div class="pr"><div class="lab">{E(label)}</div><button class="cp" onclick="cp(this)">복사</button>'
            f'<pre>{E(str(text))}</pre></div>')


def lst(items):
    if not items:
        return '<p class="mute">-</p>'
    if isinstance(items, str):
        return f'<p>{E(items)}</p>'
    return '<ul>' + ''.join(f'<li>{E(str(i))}</li>' for i in items) + '</ul>'


def anyval(v):
    """Render arbitrary JSON (agent-added extra fields) readably."""
    if isinstance(v, dict):
        return '<table>' + ''.join(f'<tr><th>{E(str(k))}</th><td>{anyval(x)}</td></tr>' for k, x in v.items()) + '</table>'
    if isinstance(v, list):
        return '<ul>' + ''.join(f'<li>{anyval(x)}</li>' for x in v) + '</ul>'
    return E(str(v))


def extras(d, known, title='추가 분석'):
    if not isinstance(d, dict):
        return ''
    rest = {k: v for k, v in d.items() if k not in known and v not in ('', None, [], {})}
    if not rest:
        return ''
    return f'<div class="card"><h3>{E(title)}</h3>{anyval(rest)}</div>'


def row(k, v):
    return f'<tr><th>{E(k)}</th><td>{E(str(v))}</td></tr>' if v not in ('', None, []) else ''


def envelope_svg(audio, dur):
    env = audio.get('rms_db_100ms') or []
    if not env:
        return ''
    w, h = 1000, 70
    lo, hi = -60, max(env)
    pts = []
    for i, v in enumerate(env):
        x = i * 0.1 / dur * w
        y = h - (max(v, lo) - lo) / (hi - lo + 1e-6) * (h - 6)
        pts.append(f'{x:.1f},{y:.1f}')
    ons = ''.join(f'<line x1="{t / dur * w:.1f}" x2="{t / dur * w:.1f}" y1="0" y2="{h}" stroke="var(--acc)" stroke-width="1.5" opacity=".7"/>'
                  for t in audio.get('onsets_s', []))
    return (f'<svg class="env" viewBox="0 0 {w} {h}" preserveAspectRatio="none">{ons}'
            f'<polyline fill="none" stroke="var(--acc2)" stroke-width="2" points="{" ".join(pts)}"/></svg>')


def timeline(shots, dur):
    parts = []
    for i, s in enumerate(shots):
        wpct = max(0.3, (float(s.get('end', 0)) - float(s.get('start', 0))) / dur * 100)
        c = SHOT_COLORS[(int(s.get('gen_clip') or i + 1) - 1) % len(SHOT_COLORS)]
        tip = f"#{s.get('n')} {s.get('start')}–{s.get('end')}s · {g(s, 'transition_out', 'type')}"
        parts.append(f'<div style="width:{wpct:.2f}%;background:{c}" title="{E(tip)}">{s.get("n")}</div>')
    return f'<div class="tl">{"".join(parts)}</div>'


def shot_card(s, vid):
    frames = ''.join(
        f'<div class="fr"><a href="assets/{vid}/{E(os.path.basename(f))}" target="_blank"><img loading="lazy" src="assets/{vid}/{E(os.path.basename(f))}"></a><span class="t">{E(os.path.basename(f)[:-4])}</span><span class="g"></span></div>'
        for f in s.get('frames', []))
    models = ''.join(
        f'<span class="pill {"m1" if i == 0 else "m"}">{E(m.get("model", ""))}</span> <span class="mute" style="font-size:13px">{E(m.get("role", ""))} — {E(m.get("why_ko", ""))}</span><br>'
        for i, m in enumerate(s.get('recommended_models', [])))
    tr = s.get('transition_out') or {}
    sfx = ''.join(f'<li><b>{E(str(x.get("t", "")))}s</b> {E(x.get("ko", ""))} <span class="mute">({E(x.get("sfx_en", ""))})</span></li>'
                  for x in g(s, 'sound', 'sfx', default=[]) or [])
    sw = s.get('animal_swap') or {}
    shot_known = {'n','start','end','dur','gen_clip','frames','shot_size','angle','lens_mm','camera_move_ko','composition_ko',
                  'subject_action_ko','background_ko','on_screen_text_ko','transition_out','sound','image_prompt_en','video_prompt_en',
                  'end_frame_prompt_en','negative_prompt_en','recommended_models','gen_settings_ko','animal_swap'}
    terms = extras(s, shot_known, '이 컷의 세부 비트 / 추가 메모')
    return f'''
<div class="card shot" id="shot{s.get("n")}">
 <div class="shothead"><span class="n">SHOT {s.get("n")}</span>
  <b>{E(str(s.get("start")))}s → {E(str(s.get("end")))}s</b><span class="pill">{E(str(s.get("dur")))}초</span>
  <span class="pill">생성클립 #{E(str(s.get("gen_clip", "")))}</span><span class="pill">{E(s.get("shot_size", ""))}</span>
  <span class="pill">{E(s.get("angle", ""))}</span><span class="pill">{E(s.get("lens_mm", ""))}</span></div>
 <div class="strip">{frames}</div>
 <table>{row("카메라 움직임", s.get("camera_move_ko"))}{row("화면 구성(구도)", s.get("composition_ko"))}
 {row("동물 행동/연기", s.get("subject_action_ko"))}{row("배경", s.get("background_ko"))}{row("화면 문구/자막", s.get("on_screen_text_ko"))}
 {row("다음 컷 전환", (tr.get("type", "") + " — " + tr.get("ko", "")).strip(" —"))}
 {row("BGM 상태", g(s, "sound", "bgm_ko"))}</table>
 {f"<h3 style='margin-top:10px'>효과음 큐</h3><ul>{sfx}</ul>" if sfx else ""}
 <div class="grid2">
  <div>{prompt_block("① 이미지 프롬프트 (시작 프레임)", s.get("image_prompt_en"))}
       {prompt_block("③ 끝 프레임 프롬프트 (First-Last 모드용)", s.get("end_frame_prompt_en"))}</div>
  <div>{prompt_block("② 영상 프롬프트 (Image→Video)", s.get("video_prompt_en"))}
       {prompt_block("네거티브 프롬프트", s.get("negative_prompt_en"))}</div>
 </div>
 <div style="margin-top:8px"><h3>추천 모델</h3>{models or '<span class="mute">-</span>'}
 <p class="mute" style="font-size:13px">{E(s.get("gen_settings_ko", ""))}</p></div>
 <div class="grid2">{prompt_block("전환 · FFmpeg", tr.get("ffmpeg"))}{prompt_block("전환 · HyperFrames", tr.get("hyperframes"))}</div>
 <div class="swap"><h3>🔁 동물 교체 버전 — {E(sw.get("animal_en", ""))}</h3>
  <div class="grid2">{prompt_block("이미지 프롬프트", sw.get("image_prompt_en"))}{prompt_block("영상 프롬프트", sw.get("video_prompt_en"))}</div>
  <p class="mute" style="font-size:13px">{E(sw.get("notes_ko", ""))}</p></div>{terms}
</div>'''


def nav(pages, cur):
    links = ['<a href="index.html">목차</a>'] + [
        f'<a class="{"on" if p["id"] == cur else ""}" href="{p["file"]}">{p["rank"]}위</a>' for p in pages]
    return '<div class="nav">' + ''.join(links) + '</div>'


def page(p, pages, meta, shots, a):
    return doc(f'{p["rank"]}위 · {a.get("title_ko", vid_of(p))}', page_body(p, pages, meta, shots, a, with_copy=True))


def vid_of(p):
    return p['id']


def hero_media(vid, meta, a):
    if not WEB:
        return f'<video src="assets/{vid}/video.mp4" controls playsinline loop></video>'
    first = ((a.get('shots') or [{}])[0].get('frames') or [''])[0]
    return (f'<a href="{E(meta.get("url") or "")}" target="_blank"><img style="width:100%;border-radius:12px" '
            f'src="assets/{vid}/{E(os.path.basename(first))}" alt="첫 장면"></a>'
            f'<p class="mute" style="font-size:12px">원본 영상은 저작권 때문에 올리지 않았어요. 사진을 누르면 원본 인스타로 가서 재생됩니다.</p>')


def page_body(p, pages, meta, shots, a, with_copy):
    vid = p['id']
    dur = float(g(a, 'format', 'duration') or shots.get('duration') or 1)
    fm = a.get('format', {})
    va = a.get('viral_analysis', {})
    sb = a.get('style_bible', {})
    au = a.get('audio_design', {})
    asp = a.get('animal_swap_plan', {})
    arc = ''.join(f'<tr><th>{E(b.get("beat", ""))}<br><span class="mute">{E(str(b.get("range", "")))}s</span></th><td>{E(b.get("desc_ko", ""))}</td></tr>'
                  for b in va.get('story_arc', []))
    terms = ''.join(f'<tr><th>{E(t.get("term", ""))}</th><td>{E(t.get("ko", ""))} <span class="mute">@ {E(str(t.get("where", "")))}</span></td></tr>'
                    for t in va.get('editing_terms', []))
    sfx = ''.join(f'<tr><th>{E(str(x.get("t", "")))}s</th><td><b>{E(x.get("sfx_en", ""))}</b> · {E(str(x.get("gain_db", "")))} dB<br>'
                  f'<span class="mute">검색어: {E(x.get("search_kw_en", ""))}</span><br><span class="mute">생성: {E(x.get("gen_prompt_en", ""))}</span></td></tr>'
                  for x in au.get('sfx_list', []))
    style = '\n\n'.join(f'[{k}]\n{v}' for k, v in sb.items() if v)
    cards = ''.join(shot_card(s, vid) for s in a.get('shots', []))
    extra = extras(a, {'id','title_ko','one_line_ko','format','viral_analysis','style_bible','shots','audio_design',
                       'animal_swap_plan','ffmpeg','hyperframes','replication_checklist_ko','confidence_notes_ko'}, '기타 분석')
    body = f'''
{nav(pages, vid)}
<span class="rank">좋아요 {p["rank"]}위 / 10</span> <span class="mute">· 붙여준 순서 {p["order"]}번째 · {E(meta.get("uploader") or "")}</span>
<h1>{E(a.get("title_ko", vid))}</h1><p class="mute">{E(a.get("one_line_ko", ""))}</p>
{copybar(p, a, meta, with_copy)}
<div class="hero"><div>{hero_media(vid, meta, a)}
<p style="font-size:13px"><a href="{E(meta.get("url") or "")}" target="_blank">원본 인스타그램 열기 ↗</a></p></div>
<div><div class="stats">
<div class="stat"><b>{fmt_k(meta.get("likes"))}</b><span>좋아요</span></div><div class="stat"><b>{meta.get("comments") or "-"}</b><span>댓글</span></div>
<div class="stat"><b>{dur:.1f}초</b><span>길이</span></div><div class="stat"><b>{fm.get("shot_count", "-")}</b><span>컷 수</span></div>
<div class="stat"><b>{fm.get("gen_clip_count", "-")}</b><span>AI 생성 클립 수</span></div><div class="stat"><b>{fm.get("avg_shot_len", "-")}초</b><span>평균 컷 길이</span></div></div>
<table>{row("화면 비율/해상도", f'{fm.get("aspect", "")} · {fm.get("resolution", "")} · {fm.get("fps", "")}fps')}
{row("화면 방향 트릭", fm.get("orientation_trick_ko"))}{row("워터마크", fm.get("watermark_ko"))}{row("화면 문구/자막", fm.get("on_screen_text_ko"))}
{row("원본 캡션", meta.get("desc"))}</table>
{extras(fm, {"aspect","resolution","fps","duration","shot_count","gen_clip_count","avg_shot_len","orientation_trick_ko","watermark_ko","on_screen_text_ko"}, "포맷 추가 분석")}</div></div>

<h2>1. 타임라인 한눈에 보기</h2>
<div class="card"><div class="lab mute" style="font-size:12px">컷 막대(색 = AI 생성 클립 단위, 마우스 올리면 전환 정보)</div>{timeline(a.get("shots", []), dur)}
<div class="axis"><span>0s</span><span>{dur / 2:.1f}s</span><span>{dur:.1f}s</span></div>
<div class="lab mute" style="font-size:12px;margin-top:10px">오디오 음량(파랑) · 타격음/효과음 추정 지점(주황 세로선) · 추정 BPM {E(str(au.get("bpm_est") or g(shots, "audio", "tempo_bpm_est")))}</div>
{envelope_svg(shots.get("audio", {}), dur)}</div>

<h2>2. 왜 떡상했나 — 바이럴 편집 분석</h2>
<div class="grid2"><div class="card"><h3>0~3초 후킹</h3><p>{E(va.get("hook_0_3s_ko", ""))}</p>
<h3>패턴 인터럽트</h3>{lst(va.get("pattern_interrupts_ko"))}</div>
<div class="card"><h3>떡상 이유</h3>{lst(va.get("why_viral_ko"))}<h3>시청 유지 장치</h3>{lst(va.get("retention_devices_ko"))}</div></div>
<div class="grid2"><div class="card"><h3>스토리 구조</h3><table>{arc}</table></div>
<div class="card"><h3>댓글 유도 / 루프</h3><p>{E(va.get("comment_bait_ko", ""))}</p><p>{E(va.get("loop_design_ko", ""))}</p>
<h3>사용된 편집 기법 (전문 용어)</h3><table>{terms}</table></div></div>
{extras(va, {"hook_0_3s_ko","pattern_interrupts_ko","story_arc","retention_devices_ko","why_viral_ko","comment_bait_ko","loop_design_ko","editing_terms"}, "바이럴 추가 분석")}

<h2>3. 스타일 바이블 (모든 컷에 공통으로 넣는 설정)</h2>
<div class="card">{prompt_block("캐릭터·의상·배경·조명·색보정·렌즈 — 통째로 복사해서 모든 프롬프트 앞에 붙이기", style)}</div>

<h2>4. 컷별 완전 분해 ({len(a.get("shots", []))}컷)</h2>
<p class="mute">프레임 위 노란 3분할 선은 오른쪽 아래 버튼으로 켜고 끌 수 있어요. 각 프롬프트는 [복사] 버튼으로 바로 복사.</p>
{cards}

<h2>5. 사운드 — 배경음악 · 효과음</h2>
<div class="card"><p>{E(au.get("bgm_ko", ""))}</p>{lst(au.get("bgm_timeline_ko"))}
{prompt_block("음악 생성 프롬프트 (Suno / Udio / Pollo text2music)", au.get("music_prompt_en"))}
<h3 style="margin-top:12px">효과음 큐시트</h3><table>{sfx}</table><p class="mute">{E(au.get("mix_ko", ""))}</p></div>
{extras(au, {"bgm_ko","bpm_est","bgm_timeline_ko","music_prompt_en","sfx_list","mix_ko"}, "사운드 추가 분석")}

<h2>6. 다른 동물로 바꾸기 — 캐릭터 고정 전략</h2>
<div class="card"><p><b>기본 교체 동물:</b> {E(asp.get("default_animal_en", ""))} · <span class="mute">대안: {E(", ".join(asp.get("alternatives_en", [])))}</span></p>
{prompt_block("캐릭터 레퍼런스 시트 프롬프트 (먼저 이걸로 기준 이미지 1장 만들기)", asp.get("character_sheet_prompt_en"))}
<h3>일관성 유지 팁</h3>{lst(asp.get("consistency_tips_ko"))}</div>
{extras(asp, {"default_animal_en","alternatives_en","character_sheet_prompt_en","consistency_tips_ko"}, "추가 아이디어")}{extra}

<h2>7. FFmpeg 편집 스크립트</h2>
<div class="card">{lst(g(a, "ffmpeg", "steps_ko"))}{prompt_block("전체 조립 스크립트 (s01.mp4… + bgm + sfx → 최종본)", g(a, "ffmpeg", "script"))}</div>

<h2>8. HyperFrames 편집 프롬프트</h2>
<div class="card">{prompt_block("Claude Code + HyperFrames 스킬에 그대로 붙여넣기", g(a, "hyperframes", "prompt_en"))}{lst(g(a, "hyperframes", "notes_ko"))}</div>

<h2>9. 똑같이 만들기 체크리스트</h2>
<div class="grid2"><div class="card"><h3>체크리스트</h3>{lst(a.get("replication_checklist_ko"))}</div>
<div class="card"><h3>확실한 것 vs 추정한 것</h3>{lst(a.get("confidence_notes_ko"))}</div></div>

<h2>10. 전체 컨택트 시트</h2><img class="contact" src="assets/{vid}/contact.jpg" alt="contact sheet">
{nav(pages, vid)}
'''
    return body


def copybar(p, a, meta, with_copy):
    vid = p['id']
    z = f'<a class="big b2" href="zips/{vid}_사진.zip" download>📦 이 영상 사진 전체 ZIP</a>' if WEB else ''
    if not with_copy:
        return f'<div>{z}</div>'
    return (f'<div><button class="big" onclick="cpAll(&quot;md_{vid}&quot;,this)">📋 이 영상 분석 전체 복사</button>{z}'
            f'<a class="big b3" href="all.html">📚 10편 한 페이지로 보기</a></div>'
            f'<textarea class="hid" id="md_{vid}" readonly>{E(to_md(p, a, meta))}</textarea>')


NL = '\n'


def md_val(v, ind=''):
    if isinstance(v, dict):
        return NL.join(f'{ind}- {k}: ' + (NL + md_val(x, ind + '  ') if isinstance(x, (dict, list)) else md_val(x, ind + '  '))
                       for k, x in v.items())
    if isinstance(v, list):
        return NL.join(f'{ind}- ' + (NL + md_val(x, ind + '  ') if isinstance(x, (dict, list)) else md_val(x, ind + '  '))
                       for x in v)
    s = str(v)
    if NL in s:
        return NL + '```' + NL + s + NL + '```'
    return s


def to_md(p, a, meta):
    order = ['format', 'viral_analysis', 'style_bible', 'audio_design', 'animal_swap_plan', 'ffmpeg', 'hyperframes',
             'replication_checklist_ko', 'confidence_notes_ko']
    names = {'format': '포맷', 'viral_analysis': '왜 떡상했나 (바이럴 분석)', 'style_bible': '스타일 바이블',
             'audio_design': '사운드 (BGM·효과음)', 'animal_swap_plan': '다른 동물로 바꾸기', 'ffmpeg': 'FFmpeg 편집',
             'hyperframes': 'HyperFrames 편집 프롬프트', 'replication_checklist_ko': '똑같이 만들기 체크리스트',
             'confidence_notes_ko': '확실한 것 vs 추정한 것'}
    out = [f'# [{p["rank"]}위] {a.get("title_ko", "")}', a.get('one_line_ko', ''),
           f'- 원본: {meta.get("url")}', f'- 좋아요 {meta.get("likes")} · 댓글 {meta.get("comments")} · 계정 {meta.get("uploader")}',
           f'- 캡션: {(meta.get("desc") or "").strip()}', '']
    for k in order[:3]:
        out += [f'## {names[k]}', md_val(a.get(k, {})), '']
    out.append(f'## 컷별 완전 분해 ({len(a.get("shots", []))}컷)')
    for sh in a.get('shots', []):
        sh2 = {k: v for k, v in sh.items() if k != 'frames'}
        out += [f'### SHOT {sh.get("n")} ({sh.get("start")}s → {sh.get("end")}s, {sh.get("dur")}초)', md_val(sh2), '']
    for k in order[3:]:
        out += [f'## {names[k]}', md_val(a.get(k, {})), '']
    rest = {k: v for k, v in a.items() if k not in set(order) | {'id', 'title_ko', 'one_line_ko', 'shots'}}
    if rest:
        out += ['## 기타 분석', md_val(rest), '']
    return NL.join(out)


def doc(title, body):
    return (f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{E(title)}</title><style>{CSS}</style></head><body><div class="wrap">{body}</div>'
            f'<button class="tbtn" onclick="tg()">3분할 가이드</button><script>{JS}</script></body></html>')


def main():
    meta = {m['id']: m for m in json.load(open('meta.json', encoding='utf-8'))}
    order = sorted(meta)  # v01..v10 = order the user pasted
    ranked = sorted(meta, key=lambda k: -(meta[k]['likes'] or 0))
    pages = [{'id': v, 'rank': i + 1, 'order': order.index(v) + 1, 'file': f'P{i + 1:02d}_{v}.html'}
             for i, v in enumerate(ranked)]
    os.makedirs(OUT, exist_ok=True)
    rows, bodies, mds = [], [], []
    for p in pages:
        vid = p['id']
        ap = os.path.join(vid, 'analysis.json')
        if not os.path.exists(ap):
            print('missing', ap)
            continue
        a = json.load(open(ap, encoding='utf-8'))
        shots = json.load(open(os.path.join(vid, 'shots.json'), encoding='utf-8'))
        adir = os.path.join(OUT, 'assets', vid)
        os.makedirs(adir, exist_ok=True)
        for f in os.listdir(os.path.join(vid, 'frames')):
            shutil.copy2(os.path.join(vid, 'frames', f), adir)
        for f in (('contact.jpg',) if WEB else ('video.mp4', 'contact.jpg')):
            shutil.copy2(os.path.join(vid, f), adir)
        if WEB:
            os.makedirs(os.path.join(OUT, 'zips'), exist_ok=True)
            with zipfile.ZipFile(os.path.join(OUT, 'zips', f'{vid}_사진.zip'), 'w', zipfile.ZIP_STORED) as z:
                for f in sorted(os.listdir(adir)):
                    z.write(os.path.join(adir, f), f'{p["rank"]:02d}위_{vid}/{f}')
        open(os.path.join(OUT, p['file']), 'w', encoding='utf-8').write(page(p, pages, meta[vid], shots, a))
        bodies.append(f'<section class="vsec" id="{vid}">{page_body(p, pages, meta[vid], shots, a, with_copy=False)}</section>')
        mds.append(to_md(p, a, meta[vid]))
        first = (a.get('shots') or [{}])[0].get('frames', [''])
        thumb = os.path.basename(first[0]) if first else ''
        m = meta[vid]
        rows.append(f'<tr><td><span class="rank">{p["rank"]}위</span></td><td><img src="assets/{vid}/{E(thumb)}"></td>'
                    f'<td><a href="{p["file"]}"><b>{E(a.get("title_ko", vid))}</b></a><br><span class="mute">{E(a.get("one_line_ko", ""))}</span></td>'
                    f'<td>{fmt_k(m["likes"])}</td><td>{g(a, "format", "duration")}초 · {g(a, "format", "shot_count")}컷</td><td>{p["order"]}번째</td></tr>')
        print('built', p['file'])
    common_md = html.unescape(re.sub(r'<[^>]+>', '', COMMON.replace('</li>', '\n').replace('</h3>', '\n').replace('</h2>', '\n')))
    all_md = '# 큐티냥 갑옷 · 인스타 AI 동물 릴스 10편 완전 분해\n\n' + common_md + '\n\n' + '\n\n---\n\n'.join(mds)
    buttons = ''
    if WEB:
        open(os.path.join(OUT, '전체분석.md'), 'w', encoding='utf-8').write(all_md)
        with zipfile.ZipFile(os.path.join(OUT, 'zips', '전체_사진.zip'), 'w', zipfile.ZIP_STORED) as z:
            for p in pages:
                adir = os.path.join(OUT, 'assets', p['id'])
                for f in sorted(os.listdir(adir)):
                    z.write(os.path.join(adir, f), f'{p["rank"]:02d}위_{p["id"]}/{f}')
        buttons = ('<div><button class="big" onclick="cpAll(&quot;md_all&quot;,this)">📋 10편 분석 전체 복사 (한 번에)</button>'
                   '<a class="big b3" href="all.html">📚 10편 한 페이지로 보기</a>'
                   '<a class="big b2" href="zips/전체_사진.zip" download>📦 전체 사진 ZIP</a>'
                   '<a class="big b2" href="전체분석.md" download>⬇ 전체분석.md</a></div>'
                   f'<textarea class="hid" id="md_all" readonly>{E(all_md)}</textarea>')
    head = ('<h1>인스타 AI 동물 릴스 10편 — 완전 분해 리포트</h1>'
            '<p class="mute">좋아요 순위로 정렬 · 컷별 캡처 / 구도 / 전환 / 이미지·영상 프롬프트 / 추천 모델 / 효과음 / FFmpeg / HyperFrames</p>')
    idx = (head + buttons +
           f'<div class="card"><table class="idx"><tr><th>순위</th><th>썸네일</th><th>영상</th><th>좋아요</th><th>길이</th><th>붙여준 순서</th></tr>{"".join(rows)}</table></div>'
           + COMMON)
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(doc('릴스 완전 분해 리포트', idx))
    if WEB:
        allp = (head.replace('10편 —', '10편 한 페이지 —') + buttons.replace('<a class="big b3" href="all.html">📚 10편 한 페이지로 보기</a>', '<a class="big b3" href="index.html">목차로</a>')
                + '<div class="card"><b>바로가기:</b> ' + ' · '.join(f'<a href="#{p["id"]}">{p["rank"]}위</a>' for p in pages) + '</div>'
                + COMMON + ''.join(bodies))
        open(os.path.join(OUT, 'all.html'), 'w', encoding='utf-8').write(doc('릴스 10편 한 페이지', allp))
    print('index ok', len(all_md), 'chars md')


if __name__ == '__main__':
    main()
