(() => {
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const subnav = $('#subnav'), content = $('#content');
const state = {tab: 'thumb', sub: null};

/* ── 복사 ── */
async function copy(text, btn) {
  try { await navigator.clipboard.writeText(text); }
  catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
  if (btn) { const o = btn.textContent; btn.textContent = '복사됨 ✓'; setTimeout(() => btn.textContent = o, 1200); }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-copybtn]');
  if (b) { const p = b.previousElementSibling?.closest('[data-copy]') || b.parentElement.querySelector('[data-copy]'); if (p) copy(p.innerText.trim(), b); return; }
  const h = e.target.closest('[data-hex]');
  if (h) { copy(h.dataset.hex, null); toast(h.dataset.hex + ' 복사됨'); return; }
  const z = e.target.closest('img[data-zoom]');
  if (z) openLightbox(z.dataset.zoom, z.alt);
});
let toastT; function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#ffd54f;color:#111;padding:7px 14px;border-radius:9px;font-weight:800;z-index:60'; document.body.append(t); } t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 1300); }

/* ── 라이트박스 ── */
const lb = $('#lightbox');
function openLightbox(src, cap) { lb.querySelector('img').src = src; lb.querySelector('img').alt = cap || ''; lb.querySelector('figcaption').textContent = cap || ''; const a = lb.querySelector('a[download]'); a.href = src; a.download = src.split('/').pop(); lb.hidden = false; lb.querySelector('[data-close]').focus(); }
lb.addEventListener('click', e => { if (e.target === lb || e.target.closest('[data-close]')) lb.hidden = true; });
document.addEventListener('keydown', e => { if (e.key === 'Escape') lb.hidden = true; });

/* ── 메뉴 ── */
function items(tab) { return MENUS[tab].filter(m => m.id); }
function renderTabs() {
  document.body.dataset.tab = state.tab;
  document.querySelectorAll('.tab').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === state.tab)));
  subnav.replaceChildren();
  for (const m of MENUS[state.tab]) {
    if (m.grp) { const d = document.createElement('div'); d.className = 'grp'; d.textContent = m.grp; subnav.append(d); continue; }
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sn'; b.dataset.id = m.id;
    const tagTxt = {new:'NEW', fix:'수정', old:'기존', doc:'문서'}[m.tag] || '';
    b.innerHTML = (tagTxt ? `<span class="tg ${m.tag}">${tagTxt}</span>` : '') + esc(m.t) + (m.s ? `<small>${esc(m.s)}</small>` : '');
    b.onclick = () => go(state.tab, m.id);
    subnav.append(b);
  }
}
document.querySelectorAll('.tab').forEach(b => b.onclick = () => go(b.dataset.tab, null));

function go(tab, sub, record = true) {
  if (!MENUS[tab]) tab = 'thumb';
  if (SUB_ALIAS[sub]) sub = SUB_ALIAS[sub];
  const list = items(tab);
  if (!list.some(m => m.id === sub)) sub = list[0].id;
  const tabChanged = tab !== state.tab || !subnav.children.length;
  state.tab = tab; state.sub = sub;
  if (tabChanged) renderTabs();
  subnav.querySelectorAll('.sn').forEach(b => { if (b.dataset.id === sub) { b.setAttribute('aria-current', 'page'); b.scrollIntoView({block: 'nearest', inline: 'nearest'}); } else b.removeAttribute('aria-current'); });
  const url = new URL(location.href); url.searchParams.set('tab', tab); url.searchParams.set('sub', sub); url.hash = '';
  if (record) history.replaceState(null, '', url);
  try { if (window.parent !== window) window.parent.postMessage({type: 'hub-studio', tab, sub}, location.origin); } catch {}
  show(list.find(m => m.id === sub));
}

/* ── 본문 ── */
function show(m) {
  content.className = ''; content.scrollTop = 0;
  if (m.f) {
    content.className = 'frame';
    content.innerHTML = `<div class="framebar"><b>${esc(m.t)}</b><a href="${esc(m.f)}" target="_blank" rel="noopener">새 탭에서 열기 ↗</a></div>`;
    const src = m.id === 'editor' && pendingTpl ? m.f + '?t=' + pendingTpl : m.f; pendingTpl = null;
    const f = document.createElement('iframe'); f.src = src; f.title = m.t; content.append(f); return;
  }
  if (m.md) { showMd(m); return; }
  const fn = PAGES[m.id]; content.innerHTML = fn ? fn() : '<div class="page">준비 중</div>';
  if (m.id === 'live') initLive();
  if (m.id === 'parts') initFaces();
  if (m.id === 'vfx') initVfx();
  if (m.id === 'fonts') initFonts();
  content.focus({preventScroll: true});
}
async function showMd(m) {
  content.innerHTML = `<div class="page"><p class="lead">불러오는 중…</p></div>`;
  try {
    const r = await fetch(m.md); if (!r.ok) throw 0; const t = await r.text();
    if (state.sub !== m.id) return;
    content.innerHTML = `<div class="page"><p><a href="${esc(m.md)}" target="_blank" rel="noopener">원문 파일 ↗</a></p><pre class="prompt" style="font-size:13.5px;line-height:1.7">${esc(t).replace(/^(#{1,3}) (.*)$/gm, (x, h, s) => `<b style="color:#ffd54f;font-size:${20 - h.length * 2}px">${s}</b>`)}</pre></div>`;
  } catch { content.innerHTML = '<div class="page">파일을 열 수 없습니다.</div>'; }
}
const img = (id, cap, extra = '') => { const f = id.startsWith('full-') ? FULL(id.slice(5)) : (CROPS.find(c => c.id === id)?.file || ''); const c = cap || (id.startsWith('full-') ? '원본 ' + id.slice(5) : CROPS.find(x => x.id === id)?.label || id); return `<div class="${extra}"><img loading="lazy" class="thumbimg${id.startsWith('c-') ? ' circle' : ''}" src="${f}" data-zoom="${f}" alt="${esc(c)}"><div class="imgcap">${esc(c)}</div></div>`; };

const PAGES = {
 must: () => `<div class="page">
  <h1>⭐ 필수 요청 13가지 · 맨 위 정리</h1>
  <p class="lead">말씀하신 장면을 원본 번호(01-1 등)와 함께 정리했습니다. 사진을 누르면 크게 보고 받을 수 있습니다. 색은 화면 캡처에서 뽑은 <b>근사값</b>이고, 크기·위치는 썸네일 1280×720 기준 비율입니다.</p>
  <div class="jump">${MUST.map((m, i) => `<a href="#m-${m.key}">${i + 1}. ${esc(m.title.split(' · ')[0])}</a>`).join('')}</div>
  ${MUST.map((m, i) => `<section class="must" id="m-${m.key}">
    <div class="imgs">${m.imgs.map((id, j) => img(id, null, j === 0 ? 'hero' : '')).join('')}</div>
    <div><h3><span class="num">${i + 1}</span>${esc(m.title)} <small style="color:var(--muted)">· ${m.src}</small></h3>
      <p class="imgcap" style="font-size:12px">요청: “${esc(m.said)}”</p>
      <p><b>왜 튀나</b> — ${esc(m.why)}</p>
      <dl class="spec">${m.spec.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v).replace(/#[0-9A-F]{6}/g, h => `<span class="chip" data-hex="${h}" title="복사"><i style="background:${h}"></i>${h}</span>`)}</dd>`).join('')}</dl>
      <div class="prompt" data-copy>${esc(m.prompt)}</div>
      <button class="btn" data-copybtn>이미지 프롬프트 복사</button>
      ${m.live || ['lips','dog','hands','angry','sports'].includes(m.key) ? ` <button class="btn red" type="button" onclick="window.__goLive('${m.live || ({lips:'lips',dog:'dog',hands:'hands',angry:'circles',sports:'sports'})[m.key]}')">통합 편집기에서 열기 →</button>` : ''}
    </div></section>`).join('')}
  <p class="note">방송 화면 크롭은 디자인 연구용 참고 자료입니다. 실제 영상·썸네일에 쓸 때는 직접 촬영·제작한 이미지나 권리를 확인한 이미지로 같은 구도를 재현하세요. 출처: JTBC 아는 형님 등 예능 유튜브 썸네일 캡처.</p>
 </div>`,
 parts: () => `<div class="page">
  <h1>😱 잘라낸 요소 37컷</h1>
  <p class="lead">놀람은 놀람끼리, 웃음은 웃음끼리 모았습니다. 원형 인셋 5컷은 배경이 투명한 PNG라 그대로 겹쳐 쓸 수 있습니다. 카드의 <b>받기</b>로 파일을 저장하세요.</p>
  <div class="filter" role="group" aria-label="분류">${CATS.map(([k, t], i) => `<button type="button" data-cat="${k}" aria-pressed="${i === 0}">${t} <small>${k === 'all' ? CROPS.length : CROPS.filter(c => c.cats.includes(k)).length}</small></button>`).join('')}</div>
  <div class="grid" id="facegrid">${CROPS.map(c => `<div class="card" data-cats="${c.cats.join(' ')}"><img loading="lazy" class="thumbimg${c.kind === 'circle' || c.id.startsWith('c-') ? ' circle' : ''}" src="${c.file}" data-zoom="${c.file}" alt="${esc(c.label)}"><div class="meta"><span>${esc(c.label)} <small style="color:var(--muted)">${c.src}</small></span><a href="${c.file}" download>받기</a></div></div>`).join('')}</div>
  <h2>원본 14컷</h2>
  <div class="grid">${['01-1','01-2','01-4','02-1','02-4','03-1','03-4','04-4','05-1','06-1','06-3','07-2','07-3','09-4'].map(id => `<div class="card"><img loading="lazy" class="thumbimg" src="${FULL(id)}" data-zoom="${FULL(id)}" alt="원본 ${id}"><div class="meta"><span>${id}</span><a href="${FULL(id)}" download>받기</a></div></div>`).join('')}</div>
 </div>`,
 why: () => `<div class="page">
  <h1>🧠 이 썸네일들이 튀는 이유 · 사람들이 클릭하는 이유</h1>
  <p class="lead">한 줄 공식: <b>큰 감정 표정 + 대조색(노랑·빨강) + 짧은 문구 2~7자 + 사건 숫자</b>. 여기에 분할(번개)·원형 인셋·테두리 장식 중 하나를 더합니다.</p>
  <div class="statusgrid">${WHY.map(([e, t, d, ex]) => `<div class="s"><b style="font-size:16px">${e} ${esc(t)}</b>${esc(d)}<div class="imgcap">예: ${esc(ex)}</div></div>`).join('')}</div>
  <h2>체크리스트 · 만들고 나서 확인</h2>
  <ol>
   <li>휴대폰 크기(가로 360px)로 줄였을 때 표정과 글씨가 0.5초 안에 읽히나?</li>
   <li>글씨는 2~7자 핵심어 한 덩어리인가? 제목 문장을 그대로 줄이지 않았나?</li>
   <li>노랑·빨강 글씨에 검정 외곽선이 있나? 배경과 같은 색이 아닌가?</li>
   <li>얼굴(또는 동물)이 화면의 40% 이상인가? 원형 인셋은 화면 높이의 55~75%인가?</li>
   <li>숫자·기록이 있다면 가장 크게 썼나?</li>
   <li>주변 썸네일과 나란히 놓았을 때 다르게 보이나? (모두 글씨 가득이면 여백형, 모두 밝으면 불꽃·어두운 테두리)</li>
  </ol>
 </div>`,
 palette: () => `<div class="page">
  <h1>🎨 색상 HEX 모음</h1>
  <p class="lead">누르면 HEX가 복사됩니다. JTBC 14컷 값은 이번에 캡처 이미지에서 채도 높은 픽셀을 모아 뽑은 <b>근사값</b>입니다.</p>
  <h2>JTBC 14컷에서 추출</h2>
  <div class="pal">${PALETTE.map(([h, n, s]) => `<button type="button" data-hex="${h}"><i style="background:${h}"></i><span><b>${h}</b><br>${esc(n)}<br><small style="color:var(--muted)">${esc(s)}</small></span></button>`).join('')}</div>
  <h2>기존 레이어 실험실 · 영상편집 · 공통 팔레트</h2>
  <div class="pal">${PALETTE_OLD.map(([h, n]) => `<button type="button" data-hex="${h}"><i style="background:${h}"></i><span><b>${h}</b><br>${esc(n)}</span></button>`).join('')}</div>
 </div>`,
 live: () => `<div class="page">
  <h1>⚡ 효과 실시간 재현판</h1>
  <p class="lead">왼쪽(좁은 화면은 위) 미리보기는 스크롤해도 따라옵니다. 오른쪽에서 글씨·색·사진을 바꾸면 바로 반영되고, 현재 설정 그대로 이미지 생성 프롬프트를 복사할 수 있습니다.</p>
  <div class="lab">
   <div class="stagebox"><div class="stage" id="stage"></div><div class="imgcap" id="stagecap"></div></div>
   <div class="ctl" id="ctl"></div>
  </div>
 </div>`,
 tlog: () => HTML.tlog, plan: () => HTML.plan, vlog: () => HTML.vlog,
 faces: () => facesPage(), fonts: () => `<div class="page"><h1>🔤 폰트 점검표</h1><p class="lead">불러오는 중…</p></div>`,
 sfx: () => sfxPage(), bgm: () => bgmPage(), vfx: () => vfxPage()
};

/* ── 표정 모음 필터 ── */
function initFaces() {
  const btns = content.querySelectorAll('.filter button');
  btns.forEach(b => b.onclick = () => {
    btns.forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    const k = b.dataset.cat;
    content.querySelectorAll('#facegrid .card').forEach(c => c.hidden = k !== 'all' && !c.dataset.cats.split(' ').includes(k));
  });
}

/* ── 실시간 재현판 ── */
const BOLT = (fill) => `<svg class="fx-bolt" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="53,0 62.5,0 56.5,41 62,41 44,100 49,56 43.5,56" fill="${fill}" stroke="#111" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
const BURST = `<svg class="fx-burst" viewBox="0 0 100 80" aria-hidden="true"><polygon points="50,2 58,22 80,6 72,28 98,26 78,42 96,62 70,56 68,78 52,60 34,78 32,56 6,64 22,44 2,28 28,28 20,6 42,22" fill="#fff" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/><text x="50" y="52" text-anchor="middle" font-family="Black Han Sans,sans-serif" font-size="30" fill="#111">!!</text></svg>`;
const IMGS = [['e-kkk-laugh-l','웃음 왼쪽'],['e-kkk-laugh-r','웃음 오른쪽'],['e-01-1-face','우는 얼굴'],['e-laugh-1','박장대소'],['e-laugh-3','박장대소 3인'],['e-two-surprise','두 얼굴 놀람'],['e-scream-face','절규'],['e-redlips','빨간 입술'],['e-baseball-player','야구 선수'],['e-28m-face','스포츠 놀람'],['c-shock','원형 충격'],['c-02-4','원형 입가림'],['c-03-1-a','원형 빡침']].map(([id, t]) => ({id, t, f: CROPS.find(c => c.id === id).file}));
const LIVE = {
  bolt: {name: '⚡ 번개 분할', text: '막 눈을 꾹꾹', fill: '#F8D643', c2: '#E8321E', stroke: '#111111', sw: 7, size: 9, bolt: '#F3D42D', L: 'e-01-1-face', R: 'e-kkk-laugh-l', src: '01-1 · 06-3'},
  rise: {name: '🔥 솟는 금색 글씨', text: '네가 다니는 백화점엔 없어!', fill: '#FFE27A', c2: '#E38C49', c3: '#DE6B43', stroke: '#3B1203', sw: 9, size: 7.2, L: 'e-laugh-3', src: '07-3'},
  kkk: {name: '😂 ㅋㅋㅋ 아치', text: 'ㅋㅋㅋㅋㅋ', fill: '#F0F44C', stroke: '#111111', sw: 6, size: 10, bolt: '#FFFFFF', L: 'e-kkk-laugh-l', R: 'e-kkk-laugh-r', src: '06-3'},
  shock: {name: '💥 충격 원형', text: '충격', fill: '#E21317', stroke: '#111111', sw: 5, size: 9, L: 'c-shock', bg: '#B71512', src: '09-4'}
};
const cur = {key: 'bolt', v: {}, up: {}};
let pendingTpl = null;
window.__goLive = k => { pendingTpl = k; go('thumb', 'editor'); };
function fileOf(id) { return cur.up[id] || CROPS.find(c => c.id === id)?.file || id; }
function initLive() { setPreset(cur.key); }
function setPreset(k) { cur.key = k; cur.v = {...LIVE[k]}; drawCtl(); drawStage(); }
function drawCtl() {
  const v = cur.v, k = cur.key, ctl = $('#ctl');
  const opt = sel => IMGS.map(i => `<option value="${i.id}" ${i.id === sel ? 'selected' : ''}>${esc(i.t)}</option>`).join('');
  ctl.innerHTML = `<div class="presets" role="group" aria-label="효과">${Object.entries(LIVE).map(([key, p]) => `<button type="button" data-p="${key}" aria-pressed="${key === k}">${p.name}</button>`).join('')}</div>
   <label>글씨 ${k === 'kkk' ? '(아치로 휘어짐)' : ''}<textarea rows="2" data-k="text">${esc(v.text)}</textarea></label>
   <div class="row"><label>글자 크기 <input type="range" min="3" max="18" step=".2" value="${v.size}" data-k="size"></label><label>외곽선 두께 <input type="range" min="0" max="16" step="1" value="${v.sw}" data-k="sw"></label></div>
   <div class="row"><label>${k === 'shock' ? '박스 색' : '글자 색 (위)'} <input type="color" value="${v.fill}" data-k="fill"></label><label>외곽선 색 <input type="color" value="${v.stroke}" data-k="stroke"></label></div>
   ${v.c2 ? `<div class="row"><label>${k === 'rise' ? '가운데 색' : '아래쪽 색'} <input type="color" value="${v.c2}" data-k="c2"></label>${v.c3 ? `<label>맨 아래 색 <input type="color" value="${v.c3}" data-k="c3"></label>` : '<span></span>'}</div>` : ''}
   ${v.bolt ? `<label>번개 색 <input type="color" value="${v.bolt}" data-k="bolt"></label>` : ''}
   ${v.bg ? `<label>배경 조명 색 <input type="color" value="${v.bg}" data-k="bg"></label>` : ''}
   <div class="row"><label>${v.R ? '왼쪽 사진' : (k === 'shock' ? '원 안 사진' : '배경 사진')} <select data-k="L">${opt(v.L)}</select></label>${v.R ? `<label>오른쪽 사진 <select data-k="R">${opt(v.R)}</select></label>` : '<span></span>'}</div>
   <label>내 사진 올리기 (${v.R ? '왼쪽' : '배경/원'}) <input type="file" accept="image/*" data-up="L"></label>
   ${v.R ? `<label>내 사진 올리기 (오른쪽) <input type="file" accept="image/*" data-up="R"></label>` : ''}
   ${k === 'rise' ? '<button class="btn ghost" type="button" data-replay>솟아오르기 다시 보기 ▶</button>' : ''}
   <h3 style="margin-top:12px">현재 설정 프롬프트</h3><div class="prompt" data-copy id="liveprompt"></div><button class="btn" data-copybtn>프롬프트 복사</button>`;
  ctl.querySelectorAll('[data-p]').forEach(b => b.onclick = () => setPreset(b.dataset.p));
  ctl.querySelectorAll('[data-k]').forEach(el => el.oninput = () => { cur.v[el.dataset.k] = el.type === 'range' ? Number(el.value) : el.value; drawStage(); });
  ctl.querySelectorAll('[data-up]').forEach(el => el.onchange = () => { const f = el.files[0]; if (!f) return; const id = 'upload-' + el.dataset.up; cur.up[id] = URL.createObjectURL(f); cur.v[el.dataset.up] = id; drawStage(); });
  const r = ctl.querySelector('[data-replay]'); if (r) r.onclick = () => { const t = $('#stage .fx-rise'); t.classList.remove('anim'); void t.offsetWidth; t.classList.add('anim'); };
}
function drawStage() {
  const v = cur.v, k = cur.key, st = $('#stage');
  const fs = `font-size:${v.size}cqw;`;
  let h = '';
  if (k === 'bolt' || k === 'kkk') {
    h += `<div class="fx-split"><img class="half L" src="${fileOf(v.L)}" alt=""><img class="half R" src="${fileOf(v.R)}" alt=""></div>${BOLT(v.bolt)}`;
  }
  const t = esc(v.text).replace(/\n/g, '<br>');
  if (k === 'bolt') {
    h += `<div class="fx-text" style="${fs}text-align:left;right:auto;max-width:62%"><span style="display:inline-grid"><span style="grid-area:1/1;color:${v.stroke};-webkit-text-stroke:${v.sw / 10}cqw ${v.stroke}">${t}</span><span style="grid-area:1/1;color:transparent;background:linear-gradient(180deg,${v.fill} 50%,${v.c2});-webkit-background-clip:text;background-clip:text">${t}</span></span></div>`;
  }
  if (k === 'kkk') {
    const chars = [...v.text]; const n = chars.length;
    h += `<div class="fx-arc" style="${fs}left:66%;--fill:${v.fill};--stroke:${v.stroke};--sw:${v.sw / 10}cqw">${chars.map((c, i) => { const t = n > 1 ? i / (n - 1) - .5 : 0; return `<span style="transform:translateY(${Math.abs(t) * 2 * 2.2}cqw) rotate(${t * 60}deg)">${esc(c)}</span>`; }).join('')}</div>`;
  }
  if (k === 'rise') {
    h += `<img class="ph" src="${fileOf(v.L)}" alt=""><div style="position:absolute;inset:0;background:linear-gradient(0deg,#000a,transparent 55%)"></div>
      <div class="fx-text fx-rise anim" style="${fs}--c1:${v.c3};--c2:${v.c2};--c3:${v.fill};--stroke:${v.stroke};--sw:${v.sw / 10}cqw"><span class="wrapg" style="filter:drop-shadow(0 .5cqw 0 ${v.stroke})"><span class="back">${t}</span><span class="front">${t}</span></span></div>`;
  }
  if (k === 'shock') {
    h += `<div style="position:absolute;inset:0;background:radial-gradient(circle at 70% 40%,#ff6a3d55,transparent 45%),linear-gradient(135deg,${v.bg},#2a0505)"></div>
      <div style="position:absolute;right:4%;top:6%;width:44%;height:88%;background:repeating-linear-gradient(90deg,#fff1 0 2cqw,transparent 2cqw 4cqw);border-radius:1cqw"></div>
      <div class="fx-circle"><img src="${fileOf(v.L)}" alt=""></div>${BURST}
      <div class="fx-box" style="${fs}background:${v.fill};border-color:${v.stroke};border-width:${v.sw / 10}cqw">${esc(v.text)}</div>`;
  }
  st.innerHTML = h;
  $('#stagecap').textContent = `${LIVE[k].name} · 원본 참고 ${LIVE[k].src} · 1280×720 비율`;
  $('#liveprompt').textContent = promptFor(k, v);
}
function promptFor(k, v) {
  if (k === 'bolt') return `16:9 유튜브 썸네일. 화면 중앙을 ${v.bolt} 색 지그재그 번개가 위(가로 57%)에서 아래(가로 44%)로 사선으로 가르고, 번개에는 검정 외곽선. 왼쪽과 오른쪽에 감정이 같은 두 인물의 얼굴을 화면 높이의 60% 크기로 눈높이를 맞춰 배치. 왼쪽 아래에 굵은 고딕 「${v.text}」, 위쪽은 ${v.fill}, 아래로 갈수록 ${v.c2}로 변하는 그라데이션, ${v.stroke} 두꺼운 외곽선. 고대비 예능 방송 스타일.`;
  if (k === 'rise') return `16:9 유튜브 썸네일. 화면 하단에 큰 대사 글씨 「${v.text.replace(/\n/g, ' ')}」. 글자는 아래 ${v.c3} → 가운데 ${v.c2} → 위 ${v.fill} 로 밝아지는 세로 그라데이션이며, 글자 아래에서 주황 불꽃과 빛이 위로 솟구쳐 글씨가 바닥에서 튀어나오는 느낌. 글씨 덩어리는 아래쪽 기준으로 뒤로 20도 눕힌 원근감, ${v.stroke} 두꺼운 외곽선과 아래쪽 그림자. 영상에서는 0.9초 동안 아래에서 위로 늘어나며 등장.`;
  if (k === 'kkk') return `16:9 유튜브 썸네일. ${v.bolt} 색 번개가 화면을 위에서 아래로 사선으로 갈라 좌우 장면을 나눈다. 왼쪽과 오른쪽에 크게 웃는 인물(화면 세로 70% 이상). 오른쪽 인물 머리 위에 ${v.fill} 색 「${v.text}」가 부채꼴 아치 모양(글자마다 −30°~+30° 회전)으로 휘어져 있고 ${v.stroke} 두꺼운 외곽선. 밝고 유쾌한 예능 분위기.`;
  return `16:9 유튜브 썸네일. 왼쪽 위에 흰 테두리(6px) 원형 인셋, 지름은 화면 높이의 72%, 원 안에는 입을 크게 벌리고 충격받은 얼굴. 원 오른쪽 위에 흰색 폭발 말풍선과 검정 「!!」. 화면 아래 가운데에 ${v.fill} 사각 박스, 흰색 굵은 글씨 「${v.text}」, ${v.stroke} 테두리, 글자 간격 넓게. 배경은 ${v.bg} 붉은 무대 조명.`;
}

/* ── 표정 19 · 이미지 생성 프롬프트 ── */
function facesPage() {
  return `<div class="page">
  <h1>🧑‍🎤 표정 19 · 이미지 생성 프롬프트</h1>
  <p class="lead">사진마다 <b>표정 · 시선 · 고개 각도 · 구도 · 크기</b>를 적었습니다. 「경로 + 프롬프트 복사」를 누르면 이 컴퓨터의 사진 파일 경로가 맨 위에 붙어서 복사됩니다. 이미지 생성 도구에 그 사진을 같이 첨부하고 붙여 넣으세요. 파일은 <code>${esc(PIC_DIR)}</code> 에 같은 번호로 저장돼 있습니다.</p>
  <p class="note">실존 인물의 얼굴을 그대로 복제하지 않고 “같은 포즈·표정의 새 인물”로 만들도록 프롬프트에 넣어 두었습니다.</p>
  ${FACES.map(f => `<div class="facecard" id="${f.n}">
    <div><img class="thumbimg${f.circle ? ' circle' : ''}" src="${f.file}" data-zoom="${f.file}" alt="${esc(f.label)}"><div class="row" style="display:flex;gap:6px;margin-top:6px"><a class="btn ghost" href="${f.file}" download="${f.n}_${f.id}.${f.circle ? 'png' : 'jpg'}">받기</a><button class="btn ghost" type="button" onclick="window.__goLive&&window.__goLive('${({'e-kkk-text':'kkk','e-kkk-laugh-l':'kkk','e-kkk-laugh-r':'kkk','c-shock':'shock','e-scream-face':'fire','e-redlips':'lips','e-dog-center':'dog','c-02-4':'hands','c-03-1-a':'circles','c-03-1-b':'circles','e-baseball-player':'sports','e-baseball-laugh':'sports','e-01-1-face':'bolt'})[f.id] || 'aura'}')">편집기</button></div></div>
    <div><h3><span class="n">${f.n}</span>${esc(f.label)} <small style="color:var(--muted)">원본 ${f.src}</small></h3>
      <dl class="spec"><dt>인물</dt><dd>${esc(f.who)}</dd><dt>표정</dt><dd>${esc(f.expr)}</dd><dt>시선·각도</dt><dd>${esc(f.gaze)}</dd><dt>구도</dt><dd>${esc(f.frame)}</dd><dt>크기</dt><dd>${esc(f.size)}</dd><dt>파일</dt><dd><code>${esc(f.local)}</code></dd></dl>
      <div class="prompt" data-copy>참고 이미지 경로: ${esc(f.local)}\n${esc(f.prompt)}</div><button class="btn" data-copybtn>경로 + 프롬프트 복사</button>
    </div></div>`).join('')}
  </div>`;
}
/* ── 폰트 점검표 ── */
async function initFonts() {
  try {
    const list = await (await fetch('fonts-audit.json?v=1')).json();
    if (state.sub !== 'fonts') return;
    const cnt = k => list.filter(x => x.status === k).length;
    content.innerHTML = `<div class="page"><h1>🔤 폰트 점검표 (${list.length}종)</h1>
     <p class="lead">편집 페이지에서 쓰는 폰트와 대화에서 추천된 폰트를 <code>/home/yh/Pictures/폰트들</code> 과 대조했습니다. 원래 있음 <b class="ok">${cnt('local')}</b> · 이번에 자동으로 받음 <b class="ok">${cnt('downloaded')}</b> · 수동 필요 <b class="${cnt('manual') ? 'no' : 'ok'}">${cnt('manual')}</b></p>
     <p class="note">WOFF로만 받은 폰트는 웹페이지에서는 바로 쓰이지만, 프리미어·포토샵·캡컷 PC판에 설치하려면 오른쪽 「공식 받기」에서 TTF/OTF 원본을 받아야 합니다. 상세 보고서: <code>/home/yh/Pictures/폰트들/_폰트_점검_20261123.md</code></p>
     <div class="tblwrap"><table><tr><th>폰트</th><th>상태</th><th>로컬 경로</th><th>쓰이는 곳</th><th>라이선스</th><th>공식 받기</th></tr>${list.map(x => `<tr><td><b>${esc(x.name)}</b></td><td class="${x.status === 'manual' ? 'no' : 'ok'}">${({local:'원래 있음', downloaded:'이번에 받음', manual:'수동 필요'})[x.status] || esc(x.status)}</td><td><code style="font-size:11px;word-break:break-all">${esc(x.localPath || '')}</code></td><td style="font-size:12px">${esc((x.usedIn || []).join(' · '))}</td><td style="font-size:12px">${esc(x.license || '')}</td><td>${x.manualUrl ? `<a href="${esc(x.manualUrl)}" target="_blank" rel="noopener">공식 받기 ↗</a>` : x.source && /^https?:/.test(x.source) ? `<a href="${esc(x.source)}" target="_blank" rel="noopener">출처 ↗</a>` : ''}</td></tr>`).join('')}</table></div></div>`;
  } catch { content.innerHTML = '<div class="page">폰트 점검 파일을 읽지 못했습니다.</div>'; }
}
/* ── 효과음 30 ── */
function sfxPage() {
  const sits = [...new Set(SFX30.map(x => x.sit))];
  return `<div class="page">
  <h1>🎧 효과음 30개 · TOP 10 · 장면 배치</h1>
  <p class="lead">유퀴즈·라디오스타의 편집 감각을 참고하되, 방송사 원본 효과음은 쓰지 않고 무료 효과음으로 재구성했습니다 (2026-11-23 조사). 음원명을 누르면 <b>듣기·다운로드 페이지</b>가 열립니다. 컷 길이·게인은 측정값이 아니라 편집 시작값입니다.</p>
  <details class="fold" open><summary>🔐 사이트별 사용 조건 <small>Mixkit · Pixabay · YouTube Audio Library · Freesound</small></summary><div class="in">
   <div class="tblwrap"><table><tr><th>사이트</th><th>상업 이용</th><th>출처 표시</th><th>판단</th></tr>
   <tr><td><a href="https://mixkit.co/free-sound-effects/" target="_blank" rel="noopener">Mixkit</a></td><td>가능</td><td>불필요</td><td>1순위 · 원본 파일을 음원팩으로 재배포 금지</td></tr>
   <tr><td><a href="https://pixabay.com/sound-effects/" target="_blank" rel="noopener">Pixabay</a></td><td>가능</td><td>불필요</td><td>2순위 · 단독 재배포 금지 · <b>Content ID 등록 표시 음원 제외</b></td></tr>
   <tr><td>YouTube Audio Library</td><td>유튜브 수익화 가능</td><td>음원별 확인</td><td>보조 · 유튜브 밖 사용은 개별 확인</td></tr>
   <tr><td><a href="https://freesound.org/" target="_blank" rel="noopener">Freesound</a></td><td>라이선스별</td><td>라이선스별</td><td>CC0만 추천 · CC BY-NC는 수익화 영상 제외 · 다운로드 로그인 필요</td></tr></table></div></div></details>
  <details class="fold" open><summary>🏆 국뽕 영상 추천 TOP 10 <small>활용성·연출 다양성 기준 (조회수 순위 아님)</small></summary><div class="in">
   <div class="tblwrap"><table><tr><th>순위</th><th>효과음</th><th>애니메이션</th><th>진입 시점</th></tr>${SFX_TOP10.map(([r, n, name, an, when]) => `<tr><td>${r}</td><td><a href="${sfx(n).url}" target="_blank" rel="noopener">${esc(name)}</a> <small>#${n}</small></td><td>${esc(an)}</td><td>${esc(when)}</td></tr>`).join('')}</table></div>
   <p><b>기본 세트 5종:</b> 뿅(03) + 스크래치(05) + 두둥(07) + 띠리링(09) + 휙 전환(14). 통계·뉴스·댓글 구간은 별도 효과음.</p></div></details>
  <details class="fold" open><summary>🎵 30개 전체 (상황별) <small>${sits.map(x => x + ' ' + SFX30.filter(y => y.sit === x).length).join(' · ')}</small></summary><div class="in">
   ${sits.map(sit => `<h3 style="margin:12px 0 4px">${esc(sit)}</h3><div class="tblwrap"><table><tr><th>#</th><th>자막에 쓰는 말</th><th>효과음 (듣기·다운로드)</th><th>컷 / 시작 게인</th></tr>${SFX30.filter(x => x.sit === sit).map(x => `<tr><td>${x.n} ${x.em}</td><td>${esc(x.cap)}</td><td><a href="${x.url}" target="_blank" rel="noopener">${esc(x.name)}</a></td><td>${esc(x.cut)} / ${esc(x.gain)}</td></tr>`).join('')}</table></div>`).join('')}
   <p class="hint" style="color:var(--muted)">27개는 Pixabay Content License 개별 페이지, 04·15·30은 Freesound CC0. 링크는 MP3 직접 주소가 아니라 듣기·다운로드 페이지입니다. 실제 재생·다운로드 성공은 별도 검증 전입니다.</p></div></details>
  <details class="fold"><summary>📍 대본 단어 → 효과음 배치표 <small>상황별 빠른 배치</small></summary><div class="in">${HTML.sfx.replace(/^[\s\S]*?<div class="tblwrap">/, '<div class="tblwrap">').replace(/<h2>무료 효과음 소스[\s\S]*$/, '')}</div></details>
  <details class="fold"><summary>🎚️ 17분 영상 적용 규칙 · 제외 항목 · 방송 사례</summary><div class="in">
   <ul><li>순서: 화면 전환 시작 → 효과음 선진입 → 강조 글씨 등장.</li><li>내레이션 위에서는 짧게 자르고 더 낮춤. 표의 dB는 클립 게인 시작값 → 최종은 청취 + 피크 미터로.</li>
   <li>제외: Pixabay <a href="https://pixabay.com/sound-effects/news-intro-news-background-477317/" target="_blank" rel="noopener">News Intro News Background</a> — Content ID Registered 표시 → 24번으로 교체.</li>
   <li>Mixkit 휙 전환·뉴스 인트로·책장·칼 소리 카테고리는 확인했으나 개별 파일 주소가 구분되지 않아 30개 목록에서 뺌: <a href="https://mixkit.co/free-sound-effects/transition/" target="_blank" rel="noopener">전환</a> · <a href="https://mixkit.co/free-sound-effects/intro/" target="_blank" rel="noopener">인트로</a> · <a href="https://mixkit.co/free-sound-effects/page/" target="_blank" rel="noopener">책장</a> · <a href="https://mixkit.co/free-sound-effects/sword/" target="_blank" rel="noopener">칼</a></li>
   <li>방송 사례: <a href="https://tvn.cjenm.com/ko/youquizontheblock/video/" target="_blank" rel="noopener">유퀴즈 tvN 공식 클립</a> · <a href="https://program.imbc.com/Youtube/1000794100000100000?playlistId=PLtqYizcPqxZRzQR5Nznnuq-Uqb6DqWg-s" target="_blank" rel="noopener">라디오스타 MBC 클립</a> · <a href="https://www.youtube.com/watch?v=RV20ftOnd4s" target="_blank" rel="noopener">쓸모왕 해외반응</a> — 효과음 삽입 시각은 <b>미확인</b>.</li>
   <li>소리 비교용 예제 (추출·재사용 금지): <a href="https://www.youtube.com/watch?v=5986wJdFS9o&t=18s" target="_blank" rel="noopener">뿅 0:18</a> · <a href="https://www.youtube.com/watch?v=5986wJdFS9o&t=23s" target="_blank" rel="noopener">띠용 0:23</a> · <a href="https://www.youtube.com/watch?v=5986wJdFS9o&t=35s" target="_blank" rel="noopener">펀치 0:35</a> · <a href="https://www.youtube.com/watch?v=5986wJdFS9o&t=58s" target="_blank" rel="noopener">띠링 0:58</a></li></ul></div></details>
  </div>`;
}
/* ── BGM ── */
function bgmPage() {
  return `<div class="page">
  <h1>🎹 캐릭터 시그니처 음악 · 감성 BGM</h1>
  <p class="lead">15번(캐릭터 시그니처 3곡)과 16번(내레이션용 3분 BGM 5곡)을 하나의 음악 라이브러리로 정리한 기록입니다. 총 8곡 · 11개 음원 버전 · 기술 검사 33/33 PASS (2026-11-23 생성).</p>
  <p class="note">음원 파일(MP3·WAV·MIDI, 전체 ZIP 92.5MB / 경량 12.8MB)과 음악 대시보드는 ChatGPT 작업 결과물로 받았고, <b>이 컴퓨터와 GitHub에서는 아직 찾지 못했습니다.</b> 파일을 이 컴퓨터에 내려받으면 여기에 플레이어를 붙일 수 있습니다. 사람의 청취 검수와 Ubuntu 예약 자동 실행은 아직 안 했습니다.</p>
  <details class="fold" open><summary>🎧 최근 릴스 음악 트렌드 → 편곡 요소</summary><div class="in"><div class="tblwrap"><table><tr><th>트렌드</th><th>편곡 요소</th><th>추천 콘텐츠</th></tr>
   <tr><td>⚡ 배속·비트 전환</td><td>초반 짧은 훅, 박자에 맞춘 효과음</td><td>코미디·캐릭터 등장</td></tr><tr><td>💗 감성·추억</td><td>부드러운 피아노, 여유 있는 코드</td><td>연애·재회</td></tr><tr><td>🌴 밝은 여행</td><td>경쾌한 리듬, 기타·말렛 악기</td><td>여행·먹방</td></tr><tr><td>🧸 오리지널 캐릭터 음악</td><td>반복 가능한 짧은 멜로디</td><td>채널 고유 브랜딩</td></tr></table></div>
   <p>제작 원칙: 기존 인기곡의 멜로디나 음원을 가져오지 않고 새 멜로디 + 직접 합성한 악기 소리. 오리지널 제작이 저작권 등록이나 Content ID 결과를 보장하지는 않습니다.</p></div></details>
  <details class="fold" open><summary>🌸 15. 캐릭터 시그니처 음악 3곡</summary><div class="in"><div class="tblwrap"><table><tr><th>음악</th><th>BPM</th><th>등장음</th><th>반복음</th><th>활용</th></tr>${BGM_SIG.map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></div></details>
  <details class="fold" open><summary>🎧 16. 내레이션용 3분 BGM 5곡 <small>BPM이 높을수록 경쾌한 장면</small></summary><div class="in"><div class="tblwrap"><table><tr><th>음악</th><th>BPM</th><th>추천 장면</th><th>템포 막대</th></tr>${BGM_3MIN.map(([n, b, u]) => `<tr><td>${esc(n)}</td><td>${b}</td><td>${esc(u)}</td><td><div style="height:10px;width:${b / 1.4}%;background:var(--acc2);border-radius:5px"></div></td></tr>`).join('')}</table></div></div></details>
  <details class="fold"><summary>📅 11월 25~27일 자동 제작 계획</summary><div class="in"><div class="tblwrap"><table><tr><th>날짜</th><th>작업</th><th>현황</th></tr><tr><td>11/25</td><td>Ubuntu에서 음원 자동 재생성</td><td>실행 스크립트 준비</td></tr><tr><td>11/26</td><td>내레이션 혼합·청취 검수</td><td class="no">미실시</td></tr><tr><td>11/27</td><td>영상 적용·최종 출력</td><td class="no">미실시</td></tr></table></div>
   <p>상업 이용: 외부 녹음 샘플 없이 제작한 음원이라 본인 수익화 영상·광고에 활용 가능. 다만 우연한 유사성, 배타적 저작권 등록, Content ID 승인까지 보증하지 않음. MIDI가 있으니 마음에 드는 멜로디를 골라 실제 K-POP 악기로 재편곡하는 단계로 이어갈 수 있음.</p></div></details>
  </div>`;
}
/* ── 장면별 연출 프리셋 ── */
const vstate = {key: 'hook', v: null, ratio: '169', safe: true};
function vText(t, v, hl) {
  return esc(t).replace(/\*([^*]+)\*/g, (m, w) => hl ? `<span class="hl-${v.hl || 'marker'}" style="--hl:${v.acc}">${w}</span>` : `<span style="color:${v.acc}">${w}</span>`);
}
function vRender(v, mini) {
  const sw = mini ? '.6cqw' : '.6cqw';
  const base = `font-family:'${v.font}';color:${v.fill};--sw:${sw};--st:${v.stroke}`;
  let h = '';
  const bsrc = v.bgUrl || v.bg, gcls = v.bgmode === 'gray' ? ' gray' : '';
  if (bsrc) h += v.bgVideo ? `<video class="vbg${gcls}" src="${bsrc}" autoplay muted loop playsinline></video>` : `<img class="vbg${gcls}" src="${bsrc}" alt="">`;
  else h += `<div class="vbg${gcls}" style="background:radial-gradient(circle at 30% 30%,#2b3d66 0,transparent 55%),radial-gradient(circle at 75% 70%,#5a1730 0,transparent 55%),linear-gradient(135deg,#0c1424,#160a12)"></div>${mini ? '' : '<div style="position:absolute;right:2%;bottom:2%;font-size:1.6cqw;color:#ffffff55">영상 자리 · 오른쪽에서 내 영상/사진 올리기</div>'}`;
  if (v.bgmode === 'dim' || v.bgmode === 'gray') h += '<div class="dim"></div>';
  const plate = (top, inner, extra = '') => v.bgmode === 'white' || v.bgmode === 'blur' ? `<div class="vplate ${v.bgmode}" style="top:${top};${extra}">${inner}</div>` : `<div class="vplate" style="top:${top};${extra}">${inner}</div>`;
  const k = v.key, A = 'a-' + v.anim;
  if (k === 'hook') h += plate('26%', `<div class="vk ${A}" style="position:relative;${base}"><div class="stk" style="font-size:4cqw;opacity:.9">${esc(v.sub)}</div><div class="stk" style="font-size:9cqw">${vText(v.main, v)}</div></div>`);
  if (k === 'wow') h += plate('30%', `<div class="vk ${A}" style="position:relative;${base}"><div class="stk" style="font-size:3.6cqw">${esc(v.sub)}</div><div class="stk" style="font-size:11cqw;position:relative;display:inline-block">${vText(v.main, v)}${v.fire ? `<img class="fxpng" src="${FXP}flame.png" alt="" style="width:16cqw;right:-9cqw;top:-8cqw">` : ''}${v.sparkle ? `<img class="fxpng a-spark" src="${FXP}sparkle.png" alt="" style="width:10cqw;left:-7cqw;top:-4cqw">` : ''}</div></div>`);
  if (k === 'twist') h += `<div class="vk ${A}" style="top:30%;${base}"><div style="font-size:3.6cqw" class="stk">${esc(v.sub)}</div><div class="a-stamp" style="display:inline-block;background:${v.box || '#E21317'};padding:.5cqw 3cqw;border:.6cqw solid #111;box-shadow:1cqw 1cqw 0 #000a;font-size:11cqw">${vText(v.main, v)}</div></div>`;
  if (k === 'stat') { const bars = String(v.bars || '').split(',').map(x => x.trim()).filter(Boolean).map(x => { const m = x.match(/^(.*?)\s*(\d+(?:\.\d+)?)$/); return m ? [m[1], +m[2]] : [x, 0]; }); const mx = Math.max(...bars.map(b => b[1]), 1);
    h += plate('8%', `<div style="${base};display:grid;grid-template-columns:1fr 1.2fr;gap:3cqw;align-items:center"><div class="vk ${A}" style="position:relative;text-align:left"><div class="stk" style="font-size:3.2cqw">${esc(v.sub)}</div><div class="stk" style="font-size:12cqw;color:${v.acc}"><span data-count="${+v.num || 0}">${mini ? (+v.num || 0) : 0}</span><small style="font-size:5cqw">${esc(v.unit || '')}</small></div><div class="stk" style="font-size:5cqw">${vText(v.main, v)}</div></div><div>${bars.map(([n, val], i) => `<div style="display:flex;align-items:center;gap:1cqw;margin:1.2cqw 0;font-size:2.6cqw"><span style="width:9cqw" class="stk">${esc(n)}</span><div style="flex:1;background:#ffffff22;border-radius:1cqw;height:3.4cqw;overflow:hidden"><div class="a-swipeL" style="animation-delay:${.15 * i}s;height:100%;width:${val / mx * 100}%;background:${i === 0 ? v.acc : '#ffffff88'}"></div></div><b class="stk">${val}</b></div>`).join('')}</div></div><div style="font-size:1.8cqw;color:#fff9;margin-top:1cqw">출처·연도 표시 자리</div>`, 'bottom:8%');}
  if (k === 'keyword') h += `<div class="vk a-side" style="bottom:7%;${base}"><span class="stk" style="font-size:4.4cqw;background:#0008;padding:.6cqw 2cqw;border-radius:1cqw">${vText(v.main, v, true)}</span></div>`;
  if (k === 'vs') { const vc = `--vc:${v.vsColor}`; h += `<div style="position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr"><div class="a-swipeL" style="background:linear-gradient(135deg,#1b2a4a,#0b1020);display:flex;align-items:center;justify-content:center;font-size:8cqw;${base}"><span class="stk">${esc(v.left)}</span></div><div class="a-swipeR" style="background:linear-gradient(135deg,#4a0f1e,#200810);display:flex;align-items:center;justify-content:center;font-size:8cqw;${base}"><span class="stk">${esc(v.right)}</span></div></div>
    <div class="vk a-stamp" style="top:28%;font-family:'${v.font}';font-size:${v.vsSize || 18}cqw;${vc};animation-delay:.25s"><span class="vs-${v.vsStyle}" style="-webkit-text-stroke:.35cqw ${v.vsStroke}">${esc(v.main)}</span></div>
    <div class="vk a-slideup" style="bottom:6%;${base};font-size:4cqw;animation-delay:.6s"><span class="stk">${esc(v.sub)}</span></div>`; }
  if (k === 'comment') h += `<div class="a-side" style="position:absolute;left:12%;right:12%;top:20%;background:#fff;border-radius:2cqw;padding:2.4cqw 3cqw;box-shadow:0 2cqw 4cqw #0008;font-family:'${v.font}';color:${v.fill}"><div style="display:flex;align-items:center;gap:1.5cqw;font-size:2.6cqw"><span style="width:5cqw;height:5cqw;border-radius:50%;background:linear-gradient(135deg,#ffb347,#ff5e62);display:inline-block"></span><b>${esc(v.nick)}</b> ${esc(v.flag)} <span style="color:#888;font-size:2cqw">3일 전</span></div><div style="font-size:3.4cqw;margin:1.4cqw 0;font-family:system-ui;color:#333"><span class="${mini ? '' : 'typing'}">${esc(v.orig)}</span></div><div style="font-size:4.6cqw;font-weight:800">${vText(v.main, {...v, hl: 'marker'}, true)}</div><div style="font-size:2.4cqw;color:#666;margin-top:1cqw">👍 ${esc(v.likes)} · 번역</div></div>`;
  if (k === 'news') h += `<div class="a-flip" style="position:absolute;left:14%;right:14%;top:14%;bottom:14%;background:#f7f3ea;border-radius:1cqw;padding:3cqw;box-shadow:0 2cqw 4cqw #000a;font-family:'${v.font}';color:${v.fill}"><div style="font-size:2.2cqw;color:#7a6a55;border-bottom:.3cqw solid #111;padding-bottom:1cqw;font-family:system-ui;font-weight:700">${esc(v.src)}</div><div style="font-size:6cqw;font-weight:900;line-height:1.25;margin-top:3cqw">${vText(v.main, {...v, hl: 'marker'}, true)}</div><div style="font-size:2cqw;color:#7a6a55;margin-top:3cqw;font-family:system-ui">원문 그대로 · 번역이면 “번역” 표시</div></div>`;
  if (k === 'end') h += `<div class="${A}" style="position:absolute;left:18%;right:18%;bottom:12%;border:.5cqw solid ${v.acc};border-radius:1.6cqw;background:#000a;backdrop-filter:blur(8px);padding:2cqw 3cqw;${base}"><div style="font-size:3cqw;color:${v.acc}">${esc(v.sub)}</div><div class="stk" style="font-size:6.4cqw">${vText(v.main, v)}</div></div>`;
  return h;
}
const FXP = '../../research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/effects/';
/* 9:16 쇼츠: 글씨 키우기, 좌우 → 위아래, 하단 UI 피하기 */
function toVertical(h) {
  return h.replace(/font-size:(\d+(?:\.\d+)?)cqw/g, (m, n) => `font-size:${+(n * 1.55).toFixed(2)}cqw`)
    .replace('grid-template-columns:1fr 1.2fr', 'grid-template-columns:1fr')
    .replace('display:grid;grid-template-columns:1fr 1fr', 'display:grid;grid-template-rows:1fr 1fr')
    .replace('class="vk a-stamp" style="top:28%', 'class="vk a-stamp" style="top:39%')
    .replace('left:12%;right:12%;top:20%', 'left:5%;right:5%;top:26%')
    .replace('left:14%;right:14%;top:14%;bottom:14%', 'left:5%;right:5%;top:20%;bottom:30%')
    .replace('left:18%;right:18%;bottom:12%', 'left:5%;right:5%;bottom:26%')
    .replace('class="vk a-side" style="bottom:7%', 'class="vk a-side" style="bottom:26%;left:4%;right:4%')
    .replace('style="top:8%;bottom:8%"', 'style="top:14%;bottom:26%"')
    .replace('class="vk a-slideup" style="bottom:6%', 'class="vk a-slideup" style="bottom:24%');
}
const SAFE916 = `<div class="safe" aria-hidden="true"><div class="sz top">상단 · 검색/제목 가림</div><div class="sz right">좋아요<br>댓글<br>공유</div><div class="sz bottom">하단 · 채널명·설명·음악 가림 (글씨 금지)</div></div>`;
function vfxPage() {
  return `<div class="page" style="max-width:1300px">
  <h1>🎬 장면별 연출 프리셋</h1>
  <p class="lead">위에서 장면을 고르면 큰 미리보기가 바로 바뀝니다. 오른쪽에서 글씨·색·폰트·배경을 바꾸면 <b>즉시</b> 반영되고, 아래 접기 메뉴에 사용 장면·예시 문장·타이밍·추천 효과음이 있습니다.</p>
  <div class="vcards" role="group" aria-label="장면">${VFX.map(p => `<button type="button" class="vcard" data-vk="${p.key}" aria-pressed="${p.key === vstate.key}"><div class="mini">${vRender({...p}, true)}</div><b>${esc(p.name)}</b></button>`).join('')}</div>
  <div class="vwork"><div class="vleft"><div class="vstage" id="vstage"></div><div class="vbtns"><span class="ratio" role="group" aria-label="화면 비율"><button type="button" class="btn ghost" data-ratio="169">16:9 롱폼</button><button type="button" class="btn ghost" data-ratio="916">9:16 쇼츠</button></span><label class="safechk"><input type="checkbox" id="vsafe"> 쇼츠 가림 영역 표시</label><button class="btn" type="button" id="vreplay">▶ 등장 다시 보기</button><button class="btn ghost" type="button" id="vcopy">설정 복사</button></div></div><div class="ctl" id="vctl"></div></div>
  <div id="vinfo"></div></div>`;
}
function initVfx() {
  content.querySelectorAll('[data-vk]').forEach(b => b.onclick = () => { vstate.key = b.dataset.vk; vstate.v = null; content.querySelectorAll('[data-vk]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); vSetup(); });
  $('#vreplay').onclick = vDraw;
  content.querySelectorAll('[data-ratio]').forEach(b => b.onclick = () => { vstate.ratio = b.dataset.ratio; vDraw(); });
  const sf = $('#vsafe'); sf.checked = vstate.safe; sf.onchange = () => { vstate.safe = sf.checked; vDraw(); };
  $('#vcopy').onclick = e => copy(JSON.stringify({...vstate.v, ratio: vstate.ratio === '916' ? '9:16 (1080×1920)' : '16:9 (1920×1080)'}, null, 1), e.target);
  vSetup();
}
function vSetup() {
  const p = VFX.find(x => x.key === vstate.key); vstate.v = vstate.v || {...p};
  const v = vstate.v, F = ['Black Han Sans','G마켓산스','레코체','SB어그로','카페24써라운드','쿠키런블랙','Do Hyeon','Jua','Noto Serif KR','정선아리랑뿌리','잉크립퀴드','Anton','Bangers'];
  const field = (k, lab, type, extra = '') => type === 'text' ? `<label>${lab}<input type="text" data-v="${k}" value="${esc(v[k] ?? '')}"></label>` : type === 'color' ? `<label>${lab}<input type="color" data-v="${k}" value="${v[k]}"></label>` : type === 'range' ? `<label>${lab} <output>${v[k]}</output><input type="range" data-v="${k}" value="${v[k]}" ${extra}></label>` : '';
  let h = `<h3>${esc(p.name)}</h3>`;
  if ('sub' in p) h += field('sub', p.key === 'vs' ? '아래 비교 항목' : '작은 윗줄', 'text');
  h += field('main', p.key === 'vs' ? 'VS 글자' : '큰 글씨 (*강조어*)', 'text');
  if (p.key === 'vs') h += field('left', '왼쪽', 'text') + field('right', '오른쪽', 'text') + `<label>VS 스타일<select data-v="vsStyle">${[['metal','금속'],['neon','네온'],['fire','불꽃'],['plain','단색']].map(([a, b]) => `<option value="${a}" ${v.vsStyle === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label><div class="row">${field('vsColor', 'VS 색', 'color')}${field('vsStroke', 'VS 외곽', 'color')}</div>` + field('vsSize', 'VS 크기', 'range', 'min="8" max="30" step=".5"').replace('<output>undefined</output>', `<output>${v.vsSize || 18}</output>`).replace('value=""', `value="${v.vsSize || 18}"`);
  if (p.key === 'stat') h += field('num', '큰 숫자', 'text') + field('unit', '단위', 'text') + field('bars', '막대 (이름 값, …)', 'text');
  if (p.key === 'comment') h += field('nick', '닉네임', 'text') + field('flag', '국기', 'text') + field('orig', '원문', 'text') + field('likes', '좋아요', 'text');
  if (p.key === 'news') h += field('src', '매체 · 날짜', 'text');
  h += `<label>폰트<select data-v="font">${F.map(f => `<option ${f === v.font ? 'selected' : ''} style="font-family:'${f}'">${f}</option>`).join('')}</select></label>`;
  h += `<div class="row">${field('fill', '글자색', 'color')}${field('acc', '강조색', 'color')}</div><div class="row">${field('stroke', '외곽선', 'color')}${p.key === 'twist' ? field('box', '박스 색', 'color') : ''}</div>`;
  if (p.key === 'keyword') h += `<label>강조 방식<select data-v="hl">${[['marker','형광펜'],['neon','네온 밑줄'],['circle','손그림 동그라미']].map(([a, b]) => `<option value="${a}" ${v.hl === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label>`;
  if (p.key === 'wow') h += `<label class="chk" style="display:flex;gap:6px"><input type="checkbox" data-v="fire" ${v.fire ? 'checked' : ''}> 강조어 불꽃 PNG</label><label class="chk" style="display:flex;gap:6px"><input type="checkbox" data-v="sparkle" ${v.sparkle ? 'checked' : ''}> 반짝이</label>`;
  h += `<label>배경 사진·영상 (내 파일)<input type="file" id="vbgup" accept="image/*,video/*"></label>`;
  h += `<label>글씨 배경<select data-v="bgmode">${[['none','투명'],['white','흰색 15%'],['blur','반투명 + 블러'],['dim','어둡게'],['gray','흑백 정지']].map(([a, b]) => `<option value="${a}" ${v.bgmode === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label>`;
  if (!['vs','comment','news','keyword'].includes(p.key)) h += `<label>등장 방식<select data-v="anim">${[['punch','펀치 확대'],['pop','뿅 팝'],['shake','흔들림'],['stamp','스탬프'],['slideup','아래서 올라옴'],['side','옆에서'],['count','카운트업']].map(([a, b]) => `<option value="${a}" ${v.anim === a ? 'selected' : ''}>${b}</option>`).join('')}</select></label>`;
  h += `<p class="imgcap">추천 효과음: ${p.sfx.map(n => `<a href="${sfx(n).url}" target="_blank" rel="noopener">#${n} ${esc(sfx(n).name)}</a>`).join(' · ')}</p>`;
  const ctl = $('#vctl'); ctl.innerHTML = h;
  const up = ctl.querySelector('#vbgup'); if (up) up.onchange = () => { const f = up.files[0]; if (!f) return; v.bgUrl = URL.createObjectURL(f); v.bgVideo = f.type.startsWith('video'); vDraw(); };
  ctl.querySelectorAll('[data-v]').forEach(el => { const fn = () => { v[el.dataset.v] = el.type === 'checkbox' ? el.checked : el.type === 'range' ? +el.value : el.value; const o = el.parentElement.querySelector('output'); if (o) o.textContent = el.value; vDraw(); }; el.addEventListener('input', fn); el.addEventListener('change', fn); });
  $('#vinfo').innerHTML = `<details class="fold" open><summary>📌 ${esc(p.name)} · 언제 쓰나 <small>${esc(p.use)}</small></summary><div class="in">
   <h3>예시 문장 (누르면 미리보기에 적용)</h3><div class="chips">${p.ex.map(e => `<button type="button" class="chip" data-ex="${esc(e)}">${esc(e)}</button>`).join('')}</div>
   <h3 style="margin-top:10px">타이밍</h3><ol>${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
   <h3>추천 효과음</h3><ul>${p.sfx.map(n => { const x = sfx(n); return `<li><a href="${x.url}" target="_blank" rel="noopener">#${n} ${esc(x.name)}</a> — ${esc(x.cap)} · ${esc(x.cut)} · ${esc(x.gain)}</li>`; }).join('')}</ul>
   <p class="note">주의: ${esc(p.dont)}</p></div></details>
   ${VFX.filter(x => x.key !== p.key).map(x => `<details class="fold"><summary>${esc(x.name)} <small>${esc(x.use)}</small></summary><div class="in"><p>예시: ${x.ex.map(esc).join(' / ')}</p><ol>${x.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><p>효과음: ${x.sfx.map(n => `<a href="${sfx(n).url}" target="_blank" rel="noopener">#${n} ${esc(sfx(n).name)}</a>`).join(' · ')}</p><button class="btn ghost" type="button" data-open="${x.key}">이 장면 열기 ↑</button></div></details>`).join('')}`;
  $('#vinfo').querySelectorAll('[data-ex]').forEach(b => b.onclick = () => { const t = b.dataset.ex; const words = t.split(' '); v.main = p.key === 'vs' ? v.main : (words.length > 1 ? words.slice(0, -1).join(' ') + ' *' + words.at(-1) + '*' : '*' + t + '*'); vSetup(); });
  $('#vinfo').querySelectorAll('[data-open]').forEach(b => b.onclick = () => { content.querySelector(`[data-vk="${b.dataset.open}"]`).click(); content.scrollTo({top: 0, behavior: 'smooth'}); });
  vDraw();
}
function vDraw() {
  const st = $('#vstage'); if (!st) return;
  const tall = vstate.ratio === '916';
  st.classList.toggle('v916', tall); st.closest('.vwork')?.classList.toggle('r916', tall);
  content.querySelectorAll('[data-ratio]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.ratio === vstate.ratio)));
  const sl = content.querySelector('.safechk'); if (sl) sl.hidden = !tall;
  let html = vRender(vstate.v, false);
  if (tall) html = toVertical(html) + (vstate.safe ? SAFE916 : '');
  st.innerHTML = html;
  const c = st.querySelector('[data-count]'); if (c) { const to = +c.dataset.count, t0 = performance.now(); const step = t => { const k = Math.min(1, (t - t0) / 800); c.textContent = Math.round(to * k); if (k < 1 && c.isConnected) requestAnimationFrame(step); }; requestAnimationFrame(step); }
}

/* ── 시작 ── */
window.addEventListener('message', e => { if (e.origin === location.origin && e.data?.type === 'studio-go') go(e.data.tab, e.data.sub); });
const p = new URLSearchParams(location.search);
go(p.get('tab') || 'thumb', p.get('sub'), true);
})();
