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
    const f = document.createElement('iframe'); f.src = m.f; f.title = m.t; content.append(f); return;
  }
  if (m.md) { showMd(m); return; }
  const fn = PAGES[m.id]; content.innerHTML = fn ? fn() : '<div class="page">준비 중</div>';
  if (m.id === 'live') initLive();
  if (m.id === 'faces') initFaces();
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
      ${m.live && LIVE[m.live] ? ` <button class="btn red" type="button" onclick="window.__goLive('${m.live}')">실시간 재현판에서 열기 →</button>` : ''}
    </div></section>`).join('')}
  <p class="note">방송 화면 크롭은 디자인 연구용 참고 자료입니다. 실제 영상·썸네일에 쓸 때는 직접 촬영·제작한 이미지나 권리를 확인한 이미지로 같은 구도를 재현하세요. 출처: JTBC 아는 형님 등 예능 유튜브 썸네일 캡처.</p>
 </div>`,
 faces: () => `<div class="page">
  <h1>😱 표정 · 요소 모음 (잘라낸 37컷)</h1>
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
 tlog: () => HTML.tlog, plan: () => HTML.plan, sfx: () => HTML.sfx, vlog: () => HTML.vlog
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
window.__goLive = k => { cur.key = k; go('thumb', 'live'); };
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

/* ── 시작 ── */
window.addEventListener('message', e => { if (e.origin === location.origin && e.data?.type === 'studio-go') go(e.data.tab, e.data.sub); });
const p = new URLSearchParams(location.search);
go(p.get('tab') || 'thumb', p.get('sub'), true);
})();
