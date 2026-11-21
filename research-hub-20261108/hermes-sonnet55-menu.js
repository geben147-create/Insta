/* Sonnet 5.5 하위 메뉴 · 총8단게대본=영상기획 아래에 붙는 접이식 메뉴
   - 더블클릭: 이름 수정 / 드래그(⠿)·Alt+↑↓: 순서 이동 / ✕: 숨김 / 👁: 숨김 보기 / ↺: 초기화
   - 수정·순서·숨김은 이 브라우저(localStorage)에만 저장됩니다. 기존 허브 메뉴 스크립트는 건드리지 않습니다. */
(function () {
  'use strict';
  var KEY = 'h55-menu-v1';
  var sidebar = document.getElementById('sidebar');
  if (!sidebar || document.getElementById('h55-root')) return;
  var pin = document.getElementById('script-video-workflow-pin');
  var BASE = './hermes-sonnet55-20261121/';
  var DEFAULT = [{
    id: 'sonnet55', label: '🟣 Sonnet 5.5 · 한일 비교 아웃라인 5안', items: [
      { id: 'page', label: '📄 내 프롬프트 · 단계별 복사 · 모델 기록', href: BASE + 'index.html' },
      { id: 'outline', label: '🗂 아웃라인 5안 · 줄거리 ↔ 적용 1:1', href: BASE + 'outline_5ways.html' },
      { id: 'ans', label: '🎧 답변 음성 · 2배속 가능', href: BASE + 'index.html#audio-answer' },
      { id: 'ol', label: '🎧 아웃라인 음성 · 2배속 가능', href: BASE + 'index.html#audio-outline' },
      { id: 'md', label: '📝 아웃라인 원문(MD)', href: BASE + 'outline_5ways.md' }
    ]
  }];
  var state = { labels: {}, groupOrder: [], itemOrder: {}, hidden: {}, collapsed: false, showHidden: false };
  try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) state = Object.assign(state, s); } catch (e) {}
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  function toast(t) { var el = document.getElementById('toast'); if (!el) return; el.textContent = t; el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 1500); }

  var css = document.createElement('style');
  css.textContent = [
    '#h55-root{background:#000;border:1px solid #333;border-radius:10px;margin:0 0 10px;padding:8px;color:#eee;font-size:13px}',
    '#h55-root .bar{display:flex;gap:6px;align-items:center;margin-bottom:6px}',
    '#h55-root .bar button{background:#161616;color:#eee;border:1px solid #444;border-radius:6px;padding:3px 8px;cursor:pointer;font-size:12px}',
    '#h55-root .bar .tg{flex:1;text-align:left;font-weight:700}',
    '#h55-root details{border:1px solid #2b2b2b;border-radius:8px;margin:6px 0;background:#0a0a0a}',
    '#h55-root summary{cursor:pointer;padding:6px 8px;display:flex;gap:6px;align-items:center;font-weight:800;color:#d9c9ff}',
    '#h55-root .h{cursor:grab;color:#888;user-select:none}',
    '#h55-root ul{list-style:none;margin:0;padding:2px 6px 8px}',
    '#h55-root li{display:flex;gap:6px;align-items:center;padding:5px 6px;border-radius:6px;border:1px solid transparent}',
    '#h55-root li:hover{background:#181818;border-color:#333}',
    '#h55-root li a{color:#cfe6ff;text-decoration:none;flex:1;min-width:0;overflow-wrap:anywhere}',
    '#h55-root li.dim{opacity:.45}',
    '#h55-root .x{background:none;border:0;color:#888;cursor:pointer;font-size:13px}',
    '#h55-root .dragging{opacity:.4;outline:1px dashed #b69cff}',
    '#h55-root [contenteditable=true]{outline:2px solid #b69cff;background:#1b1530;padding:0 3px;border-radius:4px}',
    '#h55-root .note{color:#888;font-size:11px;padding:2px 4px}'
  ].join('\n');
  document.head.appendChild(css);

  var root = document.createElement('div'); root.id = 'h55-root';
  var bar = document.createElement('div'); bar.className = 'bar';
  var tg = document.createElement('button'); tg.className = 'tg'; tg.type = 'button';
  var eye = document.createElement('button'); eye.type = 'button'; eye.title = '숨긴 항목 보기/가리기';
  var rs = document.createElement('button'); rs.type = 'button'; rs.textContent = '↺'; rs.title = '이름·순서·숨김을 처음 상태로';
  bar.appendChild(tg); bar.appendChild(eye); bar.appendChild(rs);
  var body = document.createElement('div');
  var note = document.createElement('div'); note.className = 'note';
  note.textContent = '더블클릭=이름 수정 · ⠿ 끌기/Alt+↑↓=순서 · ✕=숨김';
  root.appendChild(bar); root.appendChild(body); root.appendChild(note);
  if (pin && pin.parentNode === sidebar) sidebar.insertBefore(root, pin.nextSibling); else sidebar.insertBefore(root, sidebar.firstChild);

  function label(id, def) { return state.labels[id] || def; }

  // 한 번 클릭=이동(지연), 더블클릭=이름 수정
  function editable(el, id, def, isLink) {
    var t = null;
    if (isLink) {
      el.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button || e.ctrlKey || e.metaKey || e.shiftKey || el.isContentEditable) return;
        e.preventDefault(); clearTimeout(t);
        var href = el.href; t = setTimeout(function () { location.href = href; }, 300);
      });
    }
    el.addEventListener('dblclick', function (e) {
      e.preventDefault(); e.stopPropagation(); clearTimeout(t);
      var par = el.closest('li'); if (par) par.draggable = false;
      el.contentEditable = 'true'; el.focus();
      var r = document.createRange(); r.selectNodeContents(el); var sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
    });
    function done(cancel) {
      if (el.contentEditable !== 'true') return;
      el.contentEditable = 'false'; var par = el.closest('li'); if (par) par.draggable = true;
      var v = el.textContent.replace(/\s+/g, ' ').trim();
      if (cancel || !v) { el.textContent = label(id, def); return; }
      if (v === def) delete state.labels[id]; else state.labels[id] = v;
      el.textContent = v; save(); toast('✅ 메뉴 이름 저장');
    }
    el.addEventListener('blur', function () { done(false); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
      else if (e.key === 'Escape') { e.preventDefault(); done(true); el.blur(); }
      e.stopPropagation();
    });
  }

  // 맨 위 '총8단게대본=영상기획' 이름도 수정 가능
  if (pin) {
    var pinDef = pin.textContent.trim();
    if (state.labels.pin) pin.textContent = state.labels.pin;
    editable(pin, 'pin', pinDef, true);
    pin.title = '한 번 클릭=열기 · 더블클릭=이름 수정';
  }

  function sorted(list, order) {
    if (!order || !order.length) return list.slice();
    var map = {}; list.forEach(function (x) { map[x.id] = x; });
    var out = []; order.forEach(function (id) { if (map[id]) { out.push(map[id]); delete map[id]; } });
    list.forEach(function (x) { if (map[x.id]) out.push(x); });
    return out;
  }

  function render() {
    body.innerHTML = '';
    var hiddenCount = 0;
    sorted(DEFAULT, state.groupOrder).forEach(function (g) {
      var d = document.createElement('details'); d.open = true; d.dataset.id = g.id;
      var sm = document.createElement('summary');
      var h = document.createElement('span'); h.className = 'h'; h.textContent = '⠿'; h.draggable = true; h.title = '끌어서 묶음 순서 변경';
      var lb = document.createElement('span'); lb.textContent = label('g:' + g.id, g.label); lb.style.flex = '1';
      sm.appendChild(h); sm.appendChild(lb); d.appendChild(sm);
      editable(lb, 'g:' + g.id, g.label, false);
      lb.addEventListener('click', function (e) { e.preventDefault(); });
      h.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); });
      var ul = document.createElement('ul'); ul.dataset.gid = g.id;
      sorted(g.items, state.itemOrder[g.id]).forEach(function (it) {
        var hid = !!state.hidden[g.id + ':' + it.id]; if (hid) hiddenCount++;
        if (hid && !state.showHidden) return;
        var li = document.createElement('li'); li.draggable = true; li.dataset.id = it.id; if (hid) li.className = 'dim';
        var hh = document.createElement('span'); hh.className = 'h'; hh.textContent = '⠿';
        var a = document.createElement('a'); a.href = it.href; a.textContent = label(g.id + ':' + it.id, it.label); a.tabIndex = 0;
        var x = document.createElement('button'); x.className = 'x'; x.type = 'button'; x.textContent = hid ? '↩' : '✕'; x.title = hid ? '다시 보이기' : '숨기기';
        x.addEventListener('click', function (e) { e.stopPropagation(); state.hidden[g.id + ':' + it.id] = !hid; if (!state.hidden[g.id + ':' + it.id]) delete state.hidden[g.id + ':' + it.id]; save(); render(); });
        li.appendChild(hh); li.appendChild(a); li.appendChild(x); ul.appendChild(li);
        editable(a, g.id + ':' + it.id, it.label, true);
        a.addEventListener('keydown', function (e) {
          if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') || a.isContentEditable) return;
          var sib = e.key === 'ArrowUp' ? li.previousElementSibling : li.nextElementSibling; if (!sib) return;
          e.preventDefault(); ul.insertBefore(li, e.key === 'ArrowUp' ? sib : sib.nextSibling); saveItemOrder(ul); a.focus(); toast('✅ 순서 저장');
        });
      });
      d.appendChild(ul); body.appendChild(d);
    });
    tg.textContent = (state.collapsed ? '▸ ' : '▾ ') + '하위 메뉴 ' + (state.collapsed ? '펼치기' : '숨기기');
    body.style.display = state.collapsed ? 'none' : ''; note.style.display = state.collapsed ? 'none' : '';
    eye.textContent = '👁' + (hiddenCount ? ' ' + hiddenCount : ''); eye.style.display = hiddenCount || state.showHidden ? '' : 'none';
  }

  function saveItemOrder(ul) { state.itemOrder[ul.dataset.gid] = Array.prototype.map.call(ul.children, function (li) { return li.dataset.id; }); save(); }
  function saveGroupOrder() { state.groupOrder = Array.prototype.map.call(body.children, function (d) { return d.dataset.id; }); save(); }

  var active = null, moved = false;
  body.addEventListener('dragstart', function (e) {
    var h = e.target.closest && e.target.closest('.h'); var li = e.target.closest && e.target.closest('li');
    if (h && h.parentElement.tagName === 'SUMMARY') active = { t: 'g', n: h.closest('details') };
    else if (li) active = { t: 'i', n: li }; else return;
    moved = false; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'h55');
    setTimeout(function () { if (active) active.n.classList.add('dragging'); }, 0);
  });
  body.addEventListener('dragover', function (e) {
    if (!active) return;
    var sel = active.t === 'g' ? 'details' : 'li'; var tgt = e.target.closest(sel);
    if (!tgt || tgt === active.n || tgt.parentElement !== active.n.parentElement) return;
    e.preventDefault();
    var r = tgt.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2;
    var ref = after ? tgt.nextSibling : tgt; if (ref !== active.n) { active.n.parentElement.insertBefore(active.n, ref); moved = true; }
  });
  body.addEventListener('dragend', function () {
    if (active) { active.n.classList.remove('dragging'); if (moved) { if (active.t === 'g') saveGroupOrder(); else saveItemOrder(active.n.parentElement); toast('✅ 순서 저장'); } }
    active = null; moved = false;
  });
  body.addEventListener('drop', function (e) { if (active) e.preventDefault(); });

  tg.addEventListener('click', function () { state.collapsed = !state.collapsed; save(); render(); });
  eye.addEventListener('click', function () { state.showHidden = !state.showHidden; save(); render(); });
  rs.addEventListener('click', function () {
    if (!confirm('Sonnet 5.5 하위 메뉴의 이름·순서·숨김을 처음 상태로 되돌립니다. (맨 위 메뉴 이름 포함)')) return;
    state = { labels: {}, groupOrder: [], itemOrder: {}, hidden: {}, collapsed: false, showHidden: false };
    try { localStorage.removeItem(KEY); } catch (e) {}
    if (pin) pin.textContent = pin.dataset.h55def || pin.textContent; render(); toast('↺ 초기화');
  });
  if (pin) pin.dataset.h55def = pinDef;
  render();
})();
