/* HUB V3: one editor over the live sidebar; no router, cloned links, or legacy writes. */
(() => {
  'use strict';
  if (window.HubV3Nav?.mount) return;
  const KEY = 'insta-hub:nav:v1';
  const SCHEMA = 'insta-hub.nav.v1';
  const MAX_FILE = 524288, MAX_IDS = 4000, MAX_ID = 1200, MAX_NAME = 120, MAX_DESC = 320;
  const EMPTY = () => ({ orders: Object.create(null), entries: Object.create(null) });
  const object = v => !!v && typeof v === 'object' && !Array.isArray(v);
  const own = (v, k) => Object.prototype.hasOwnProperty.call(v, k);
  const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const token = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
  const elem = (tag, text, className) => {
    const e = document.createElement(tag);
    if (text != null) e.textContent = text;
    if (className) e.className = className;
    return e;
  };
  const btn = (label, onClick) => {
    const e = elem('button', label); e.type = 'button'; e.addEventListener('click', onClick); return e;
  };
  const idOK = k => typeof k === 'string' && k.length > 0 && k.length <= MAX_ID && /^(menu|sidebar)(\/|$)/.test(k);
  function parsePrefs(v) {
    if (!object(v) || !object(v.orders) || !object(v.entries)) throw Error('메뉴 설정 형식이 올바르지 않습니다.');
    const out = EMPTY(), lanes = Object.keys(v.orders), rows = Object.keys(v.entries);
    let count = rows.length + lanes.length;
    if (count > MAX_IDS) throw Error('설정 항목이 너무 많습니다.');
    for (const k of lanes) {
      const ids = v.orders[k];
      if (!idOK(k) || !Array.isArray(ids) || (count += ids.length) > MAX_IDS ||
          ids.some(id => !idOK(id) || id.slice(0, id.lastIndexOf('/')) !== k) || new Set(ids).size !== ids.length) {
        throw Error('순서의 식별자가 올바르지 않습니다.');
      }
      if (ids.length) out.orders[k] = ids.slice();
    }
    for (const k of rows) {
      const value = v.entries[k];
      if (!idOK(k) || !object(value) || (own(value, 'name') && (typeof value.name !== 'string' || value.name.length > MAX_NAME)) ||
          (own(value, 'description') && (typeof value.description !== 'string' || value.description.length > MAX_DESC))) {
        throw Error('이름 또는 설명의 형식이 올바르지 않습니다.');
      }
      const name = value.name?.trim(), description = value.description?.trim(), item = {};
      if (name) item.name = name;
      if (description) item.description = description;
      if (name || description) out.entries[k] = item;
    }
    return out;
  }
  const blank = () => ({ revision: 0, prefs: EMPTY(), previous: null });
  function parseDoc(raw) {
    if (raw === null) return blank();
    if (typeof raw !== 'string' || raw.length > MAX_FILE) throw Error('메뉴 설정 크기 제한을 넘었습니다.');
    const d = JSON.parse(raw);
    if (d?.schema !== SCHEMA || d.schema_version !== 1) throw Error('지원하지 않는 메뉴 설정 파일입니다.');
    return { revision: Number.isSafeInteger(d.revision) && d.revision >= 0 ? d.revision : 0,
      prefs: parsePrefs(d.prefs), previous: d.previous == null ? null : parsePrefs(d.previous) };
  }
  // Keep hash-only links portable across query strings, preview origins and GitHub Pages paths.
  function hrefKey(el) {
    const raw = el.getAttribute('href')?.trim();
    if (!raw || raw === '#') return '';
    if (raw.startsWith('#')) { try { return 'hash:' + decodeURIComponent(raw.slice(1)); } catch { return 'hash:' + raw.slice(1); } }
    try {
      const url = new URL(raw, document.baseURI);
      if (!['http:', 'https:', 'file:', 'mailto:', 'tel:'].includes(url.protocol)) return '';
      const base = new URL(document.baseURI);
      if (!/^[a-z][a-z\d+.-]*:|^\/\//i.test(raw) && url.origin === base.origin) {
        const baseDir = new URL('.', base).pathname.split('/').slice(1, -1);
        const target = url.pathname.split('/').slice(1);
        while (baseDir.length && target.length && baseDir[0] === target[0]) { baseDir.shift(); target.shift(); }
        return 'href:' + '../'.repeat(baseDir.length) + target.join('/') + url.search + url.hash;
      }
      return 'href:' + url.href;
    } catch { return ''; }
  }
  function explicit(el) {
    const id = el.getAttribute('data-hub-nav-id')?.trim() || el.id.trim();
    return id ? 'id:' + id : '';
  }
  function destination(el) {
    const route = el.getAttribute('data-to')?.trim() || el.getAttribute('data-route')?.trim();
    return route ? 'route:' + route : hrefKey(el);
  }
  // Unlabelled-id sections in the pinned index and workspace are anchored to known destinations.
  // Generic added groups can use data-hub-nav-id to keep their key stable even if their routes change.
  const pinnedAnchors = [
    'route:home', 'route:keywords', 'route:rising', 'route:copyright-old', 'route:master-prompt', 'route:gpt-main',
    'href:../reactions-downloads/index.html', 'href:foreign-reactions-v5/index.html',
    'href:kukppong-v43/workflow.html', 'href:by-gpt-ssulmo-source-20261116/index.html',
    'href:kukppong-v41/index.html', 'href:foreign-reactions-v7-20261115/ep01.html',
    'href:foreign-reactions-v88/script-01.html', 'href:foreign-reactions-v88/index.html#topic-03',
    'href:foreign-reactions-v6/ep01.html', 'href:foreign-reactions-v5/script-01.html',
    'href:foreign-reactions-v5/index.html#topic-01', 'href:kukppong-v43/ep01.html',
    'href:by-gpt-ssulmo-source-20261116/ep01.html', 'href:kukppong-v41/ep01.html',
    'hash:workspace', 'hash:workspace-design'
  ];
  const excluded = '.i,.subdot,small,.menu-drag-handle,.workflow-sol-edit,.workflow-sol-hint,.hub-v3-nav-name-only,script,style,svg,[hidden],[aria-hidden="true"]';
  function textNodes(el) {
    const root = el.matches('[data-workflow-label],[data-label-key],[data-hub-nav-label]') ? el :
      el.querySelector('[data-workflow-label],[data-label-key],[data-hub-nav-label]') || el;
    const out = [];
    function walk(parent) {
      for (const n of parent.childNodes) {
        if (n.nodeType === 3 && n.data.trim()) out.push(n);
        else if (n.nodeType === 1 && !n.matches(excluded + ',button,input,select,a,textarea')) walk(n);
      }
    }
    walk(root);
    return out;
  }
  function init(sidebar, menu) {
    const groupAnchors = new WeakMap(), partStates = new WeakMap(), paintedLabels = new WeakMap();
    const laneState = new WeakMap();
    const statusRoot = elem('span', '', 'hub-v3-nav-sr'); statusRoot.setAttribute('role', 'status');
    const toggle = btn('메뉴 편집', openEditor); toggle.className = 'hub-v3-nav-open';
    toggle.setAttribute('aria-haspopup', 'dialog'); toggle.setAttribute('aria-controls', 'hub-v3-nav-editor');
    const d = elem('dialog', null, 'hub-v3-nav-dialog'); d.id = 'hub-v3-nav-editor';
    const heading = elem('h2', '메뉴 편집'); heading.id = 'hub-v3-nav-title'; d.setAttribute('aria-labelledby', heading.id);
    const scope = elem('select'); scope.id = 'hub-v3-nav-scope';
    const list = elem('ol', null, 'hub-v3-nav-list'); list.setAttribute('aria-label', '메뉴 표시 순서');
    const name = elem('input'); name.id = 'hub-v3-nav-name'; name.maxLength = MAX_NAME;
    const desc = elem('textarea'); desc.id = 'hub-v3-nav-desc'; desc.rows = 2; desc.maxLength = MAX_DESC;
    const context = elem('p', '', 'hub-v3-nav-hint');
    const status = elem('p', '', 'hub-v3-nav-status'); status.setAttribute('role', 'status');
    const file = elem('input'); file.type = 'file'; file.accept = '.json,application/json'; file.hidden = true;
    const actions = elem('div', null, 'hub-v3-nav-actions');
    const save = btn('저장', commit);
    const cancel = btn('취소', () => { if (!busy) d.close(); });
    const undo = btn('되돌리기', undoDraft);
    const defaults = btn('기본값 복원', () => change(EMPTY(), '기존 메뉴 상태로 돌아갑니다. 저장해야 적용됩니다.'));
    const loadFile = btn('JSON 가져오기', () => file.click());
    const exportFile = btn('JSON 내보내기', download);
    const bind = (label, control) => { const wrap = elem('label', label); wrap.htmlFor = control.id; wrap.append(control); return wrap; };
    actions.append(save, cancel, undo, defaults, loadFile, exportFile);
    d.append(heading, elem('p', '같은 묶음 안에서만 이동합니다. 이동 손잡이를 드래그하거나 ↑·↓ 키를 누르세요.'),
      bind('편집할 묶음', scope), list, bind(`표시 이름 (최대 ${MAX_NAME}자)`, name),
      bind(`추가 설명 (최대 ${MAX_DESC}자)`, desc), context, actions, status, file);
    const css = elem('style', `
      .hub-v3-nav-open,.hub-v3-nav-dialog button{border:1px solid #597391;background:#233751;color:#f2f7ff;border-radius:6px;cursor:pointer;padding:.35rem .6rem;font:inherit}
      .hub-v3-nav-open{margin:.15rem 0 .45rem;font-size:.78rem;font-weight:700}
      .hub-v3-nav-dialog{box-sizing:border-box;width:min(38rem,calc(100vw - 1rem));max-height:calc(100dvh - 1rem);overflow:auto;background:#142238;color:#f2f7ff;padding:1rem;border:1px solid #768ca6;border-radius:12px;font:14px/1.4 system-ui,sans-serif}
      .hub-v3-nav-dialog::backdrop{background:#0009}.hub-v3-nav-dialog h2,.hub-v3-nav-dialog p{margin:0 0 .55rem}.hub-v3-nav-dialog label{display:block;margin:.45rem 0 .2rem;font-weight:700}
      .hub-v3-nav-dialog select,.hub-v3-nav-dialog input:not([type=file]),.hub-v3-nav-dialog textarea{display:block;box-sizing:border-box;width:100%;padding:.38rem;background:#0c1829;color:#f2f7ff;border:1px solid #768ca6;border-radius:5px;font:inherit}.hub-v3-nav-dialog [hidden]{display:none!important}
      .hub-v3-nav-list{padding:0;list-style:none;overflow:auto;max-height:30vh;margin:.5rem 0;scrollbar-color:#597391 #142238}.hub-v3-nav-list>li{display:flex;gap:.2rem;align-items:center;margin:3px 0}.hub-v3-nav-list .hub-v3-nav-pick{flex:1;min-width:0;text-align:left;overflow-wrap:anywhere}.hub-v3-nav-list .hub-v3-nav-pick[aria-pressed=true]{background:#39587d;outline:1px solid #adcae8}.hub-v3-nav-list .hub-v3-nav-handle{cursor:grab;touch-action:manipulation}.hub-v3-nav-list button:disabled,.hub-v3-nav-dialog button:disabled{opacity:.53;cursor:default}.hub-v3-nav-list [data-hub-v3-drop]{outline:2px dashed #f4ca79;outline-offset:-1px}
      .hub-v3-nav-actions{display:flex;gap:.35rem;flex-wrap:wrap;margin:.45rem 0}.hub-v3-nav-hint,.hub-v3-nav-status{font-size:.86em;color:#d0e0f1;min-height:1.2em}.hub-v3-nav-description{display:block;font-size:.8em;opacity:.86;white-space:pre-wrap;overflow-wrap:anywhere;flex:0 1 auto;margin-inline-start:.35em}.hub-v3-nav-sr{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
    `);
    sidebar.insertBefore(toggle, menu !== sidebar && menu.parentElement === sidebar ? menu : sidebar.firstChild);
    sidebar.append(statusRoot, d, css);
    let data = blank(), raw = null, storageError = '', observer;
    let tree = { lanes: new Map(), entries: new Map(), skipped: 0 }, draft, openedRaw, openedRevision;
    let selected, activeScope, stack = [], drag, busy = false, conflict = false, queued = false, session = 0;
    const message = text => { status.textContent = text; };
    function read() {
      try { const value = localStorage.getItem(KEY); return { raw: value, data: parseDoc(value), error: '' }; }
      catch { return { raw: null, data: blank(), error: '저장된 설정을 읽을 수 없습니다. 기존 메뉴는 그대로 사용할 수 있습니다.' }; }
    }
    function sync(fresh = read()) {
      ({ data, raw, error: storageError } = fresh);
      if (d.open && (storageError || openedRaw !== raw)) { conflict = true; message(storageError || '다른 탭에서 메뉴를 저장했습니다. 초안을 내보내거나 취소 후 다시 열어 주세요.'); }
    }
    function groupKey(node) {
      const fixed = explicit(node) || destination(node);
      if (fixed) return fixed;
      if (groupAnchors.has(node)) return groupAnchors.get(node);
      const anchors = Array.from(node.querySelectorAll('.navbtn,[data-hub-nav-item]'), destination).filter(Boolean);
      const direct = Array.from(node.children).filter(el => el.matches('.navbtn,[data-hub-nav-item]')).map(destination).filter(Boolean);
      const candidates = direct.length ? direct : anchors;
      const seed = pinnedAnchors.find(key => candidates.includes(key)) || candidates.sort()[0];
      if (seed) groupAnchors.set(node, 'anchor:' + seed);
      return seed ? 'anchor:' + seed : '';
    }
    function scan() {
      const result = { lanes: new Map(), entries: new Map(), skipped: 0 };
      function visit(parent, key, owner, root = false) {
        const lane = { parent, key, owner, entries: [] }; result.lanes.set(key, lane);
        const candidates = Array.from(parent.children).flatMap(node => {
          if (node === menu) return [];
          const isGroup = node.matches('.navgroup,[data-hub-nav-group]') || (!root && node.matches('details') && !!node.querySelector('.navbtn,[data-hub-nav-item]'));
          const label = isGroup ? Array.from(node.children).find(ch => ch.matches('summary,.grouptitle,[data-hub-nav-label]')) : node;
          if (!isGroup && !node.matches('.navbtn,[data-hub-nav-item]')) return [];
          return [{ node, label, isGroup, key: isGroup ? groupKey(node) : explicit(node) || destination(node) }];
        });
        const counts = new Map();
        for (const row of candidates) counts.set(row.key, (counts.get(row.key) || 0) + 1);
        for (const row of candidates) {
          // Identical identities stay in place and are not editable; adding a stable explicit ID disambiguates them.
          if (!row.key || counts.get(row.key) !== 1 || !row.label) { result.skipped++; continue; }
          let suffix;
          try { suffix = encodeURIComponent(row.key); } catch { result.skipped++; continue; }
          row.id = `${key}/${suffix}`; row.lane = lane;
          if (!idOK(row.id)) { result.skipped++; continue; }
          lane.entries.push(row); result.entries.set(row.id, row);
          if (row.isGroup) visit(row.node, row.id, row);
        }
      }
      visit(menu, 'menu', null, true);
      if (menu !== sidebar) visit(sidebar, 'sidebar', null, true);
      return result;
    }
    function detailsOf(row) {
      const parts = new Set(textNodes(row.label));
      // Retain text nodes we temporarily blanked in mixed-markup labels.
      for (const n of paintedLabels.get(row.label)?.parts || []) if (row.label.contains(n) && n.data === partStates.get(n)?.applied) parts.add(n);
      const sorted = Array.from(parts).sort((a, b) => (a.compareDocumentPosition(b) & 4) ? -1 : 1);
      const labels = sorted.map(n => {
        let st = partStates.get(n);
        if (!st || n.data !== st.applied) { st = { base: n.data, applied: n.data }; partStates.set(n, st); }
        return st;
      });
      return { parts: sorted, labels, base: labels.map(s => s.base).join('').trim() || row.label.getAttribute('aria-label') || row.key };
    }
    function paintLabel(row, prefs) {
      const old = paintedLabels.get(row.label);
      const { parts, labels } = detailsOf(row);
      const customName = prefs?.name;
      for (let i = 0; i < parts.length; i++) {
        const st = labels[i];
        const value = !customName ? st.base : i === 0 ? st.base.match(/^\s*/)[0] + customName + st.base.match(/\s*$/)[0] : '';
        if (parts[i].data !== value) parts[i].data = value;
        st.applied = value;
      }
      let addedName = old?.addedName;
      if (customName && !parts.length) {
        if (!addedName) addedName = elem('span', null, 'hub-v3-nav-name-only');
        if (addedName.textContent !== customName) addedName.textContent = customName;
        if (addedName.parentElement !== row.label) row.label.append(addedName);
      } else if (addedName) { addedName.remove(); addedName = null; }
      let note = old?.note;
      if (prefs?.description) {
        if (!note) note = elem('small', null, 'hub-v3-nav-description');
        if (note.textContent !== prefs.description) note.textContent = prefs.description;
        if (note.parentElement !== row.label) row.label.append(note);
      } else if (note) { note.remove(); note = null; }
      paintedLabels.set(row.label, { parts, addedName, note });
    }
    // Reorder only saved, uniquely identified entries in their existing sibling slots. Ancillary
    // nodes and unknown/new entries are not moved, duplicated, reparented or lost on import.
    function ordered(ids, want) {
      if (!want?.length) return ids;
      const live = new Set(ids), known = want.filter(id => live.has(id)), active = new Set(known);
      let i = 0;
      return ids.map(id => active.has(id) ? known[i++] : id);
    }
    function mergeBase(base, live, added) {
      const liveSet = new Set(live), out = base.filter(id => liveSet.has(id));
      for (let i = 0; i < live.length; i++) {
        const id = live[i]; if (!added.has(id)) continue;
        const before = live.slice(0, i).reverse().find(x => out.includes(x));
        const after = live.slice(i + 1).find(x => out.includes(x));
        out.splice(before ? out.indexOf(before) + 1 : after ? out.indexOf(after) : out.length, 0, id);
      }
      return out;
    }
    function applyOrder(lane, ids, sorted) {
      if (eq(ids, sorted)) return;
      const byId = new Map(lane.entries.map(e => [e.id, e.node]));
      const active = document.activeElement;
      const slots = ids.flatMap((id, i) => id === sorted[i] ? [] : [[id, sorted[i]]]);
      const marks = slots.map(([id, next]) => {
        const mark = document.createComment('hub-v3-nav-slot'); byId.get(id).before(mark); return [mark, next];
      });
      for (const [mark, id] of marks) mark.after(byId.get(id));
      for (const [mark] of marks) mark.remove();
      if (active && active !== document.activeElement && sidebar.contains(active)) active.focus({ preventScroll: true });
    }
    function reconcile(force = false) {
      const next = scan();
      for (const [id, row] of tree.entries) if (!next.entries.has(id) && sidebar.contains(row.label)) paintLabel(row, null);
      for (const lane of next.lanes.values()) {
        const ids = lane.entries.map(x => x.id), wanted = data.prefs.orders[lane.key];
        let st = laneState.get(lane.parent);
        if (!st) { st = { base: ids, last: ids, order: null }; laneState.set(lane.parent, st); }
        const lastSet = new Set(st.last), currentSet = new Set(ids), added = new Set(ids.filter(id => !lastSet.has(id)));
        const externalReorder = !eq(st.last.filter(id => currentSet.has(id)), ids.filter(id => lastSet.has(id)));
        if (externalReorder) st.base = ids;
        else if (added.size || ids.length !== st.last.length) st.base = mergeBase(st.base, ids, added);
        if (externalReorder && d.open && draft && !same(draft.orders[lane.key], data.prefs.orders[lane.key])) {
          conflict = true; message('기존 메뉴의 순서가 바뀌었습니다. 취소 후 다시 열어 주세요.');
        }
        const changed = !same(st.order, wanted || null);
        const sorted = wanted ? (changed || added.size ? ordered(ids, wanted) : ids) :
          st.order ? ordered(ids, st.base) : ids;
        applyOrder(lane, ids, sorted); st.last = sorted; st.order = wanted || null;
        if (!eq(ids, sorted)) lane.entries = sorted.map(id => next.entries.get(id));
      }
      for (const row of next.entries.values()) paintLabel(row, data.prefs.entries[row.id]);
      const changedTree = tree.skipped !== next.skipped || !eq(Array.from(tree.entries.keys()), Array.from(next.entries.keys())) ||
        Array.from(next.lanes).some(([key, lane]) => !eq((tree.lanes.get(key)?.entries || []).map(row => row.id), lane.entries.map(row => row.id)));
      tree = next;
      observer?.takeRecords();
      if (d.open && (changedTree || force)) render();
    }
    function syncAndPaint() { sync(); reconcile(true); }
    function baseName(row) { return detailsOf(row).base; }
    function draftName(row) { return draft.entries[row.id]?.name || baseName(row); }
    function shownOrder(lane) {
      if (!lane) return [];
      const ids = lane.entries.map(row => row.id);
      const current = data.prefs.orders[lane.key];
      const wanted = draft.orders[lane.key];
      if (same(wanted, current)) return ids;
      return wanted ? ordered(ids, wanted) : current ? ordered(ids, laneState.get(lane.parent)?.base) : ids;
    }
    function renderEdit() {
      const row = tree.entries.get(selected);
      name.disabled = desc.disabled = !row || busy;
      name.placeholder = row ? baseName(row) : '';
      name.value = row ? draft.entries[row.id]?.name || '' : '';
      desc.value = row ? draft.entries[row.id]?.description || '' : '';
    }
    function render() {
      if (!draft) return;
      const lanes = Array.from(tree.lanes.values()).filter(lane => lane.entries.length);
      if (!lanes.some(l => l.key === activeScope)) activeScope = lanes[0]?.key;
      scope.replaceChildren(...lanes.map(lane => {
        const option = elem('option', lane.owner ? draftName(lane.owner) : lane.key === 'menu' ? '메인 메뉴' : '사이드바 고정 영역');
        option.value = lane.key; return option;
      }));
      scope.value = activeScope || '';
      const order = shownOrder(tree.lanes.get(activeScope));
      if (!order.includes(selected)) selected = order[0];
      list.replaceChildren(...order.map((id, i) => {
        const row = tree.entries.get(id), label = draftName(row), li = elem('li'); li.dataset.hubV3Id = id;
        const select = btn(label, () => {
          selected = id;
          for (const picker of list.querySelectorAll('.hub-v3-nav-pick')) picker.setAttribute('aria-pressed', String(picker === select));
          renderEdit();
        });
        select.className = 'hub-v3-nav-pick'; select.setAttribute('aria-pressed', String(id === selected));
        const move = btn('⠿', () => select.click()); move.className = 'hub-v3-nav-handle'; move.draggable = !busy;
        move.setAttribute('aria-label', `${label} 이동 (위·아래 방향키)`);
        move.addEventListener('keydown', e => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); nudge(id, e.key === 'ArrowUp' ? -1 : 1, 'handle'); }
        });
        move.addEventListener('dragstart', e => {
          if (busy || !e.dataTransfer) return;
          drag = { id, scope: activeScope }; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'hub-v3-nav');
        });
        const up = btn('↑', () => nudge(id, -1, 'up')), down = btn('↓', () => nudge(id, 1, 'down'));
        up.className = 'hub-v3-nav-up'; down.className = 'hub-v3-nav-down';
        up.setAttribute('aria-label', `${label} 위로`); down.setAttribute('aria-label', `${label} 아래로`);
        up.disabled = busy || i === 0; down.disabled = busy || i === order.length - 1;
        li.append(move, select, up, down); return li;
      }));
      context.textContent = `${tree.skipped ? `식별자가 없거나 겹치는 항목 ${tree.skipped}개는 원래 위치에 유지됩니다. ` : ''}이름을 비우면 기존 이름을 사용합니다.`;
      renderEdit(); setButtons();
    }
    function setButtons() {
      save.disabled = busy || conflict || !!storageError || same(draft, data.prefs);
      cancel.disabled = defaults.disabled = loadFile.disabled = busy;
      undo.disabled = busy || (!stack.length && !data.previous);
    }
    function change(next, text, reset = true) {
      if (busy || !draft || same(draft, next)) return false;
      stack.push(draft); if (stack.length > 50) stack.shift(); draft = next;
      if (text && !conflict) message(text);
      if (reset) render(); else setButtons();
      return true;
    }
    function undoDraft() {
      if (busy) return;
      const prior = stack.length ? stack.pop() : data.previous;
      if (!prior) return;
      draft = prior; if (!conflict) message('이전 설정을 초안에 복원했습니다. 저장해야 적용됩니다.'); render();
    }
    function moveTo(id, target, after, focus) {
      if (busy || id === target || !tree.lanes.has(activeScope)) return;
      const ids = shownOrder(tree.lanes.get(activeScope));
      if (!ids.includes(id) || !ids.includes(target)) return;
      const next = ids.filter(x => x !== id);
      next.splice(next.indexOf(target) + Number(after), 0, id);
      if (eq(ids, next)) return;
      const updated = parsePrefs(draft); updated.orders[activeScope] = next;
      change(updated, `순서 변경: ${draftName(tree.entries.get(id))}`);
      const li = Array.from(list.children).find(el => el.dataset.hubV3Id === id);
      const button = li?.querySelector('.hub-v3-nav-' + focus);
      (button?.disabled ? li?.querySelector('.hub-v3-nav-handle') : button)?.focus();
    }
    function nudge(id, delta, focus) {
      const ids = shownOrder(tree.lanes.get(activeScope)), at = ids.indexOf(id);
      if (at >= 0 && ids[at + delta]) moveTo(id, ids[at + delta], delta > 0, focus);
    }
    function clearDrag() { drag = null; list.querySelector('[data-hub-v3-drop]')?.removeAttribute('data-hub-v3-drop'); }
    list.addEventListener('dragover', e => {
      const row = e.target.closest('li[data-hub-v3-id]');
      if (!drag || drag.scope !== activeScope || !row || row.dataset.hubV3Id === drag.id) return;
      e.preventDefault(); e.dataTransfer.dropEffect = 'move';
      list.querySelector('[data-hub-v3-drop]')?.removeAttribute('data-hub-v3-drop'); row.setAttribute('data-hub-v3-drop', '');
    });
    list.addEventListener('drop', e => {
      const row = e.target.closest('li[data-hub-v3-id]');
      if (!drag || drag.scope !== activeScope || !row) return;
      e.preventDefault(); const rect = row.getBoundingClientRect();
      moveTo(drag.id, row.dataset.hubV3Id, e.clientY > rect.top + rect.height / 2, 'handle'); clearDrag();
    });
    list.addEventListener('dragend', clearDrag);
    scope.addEventListener('change', () => { activeScope = scope.value; selected = ''; render(); });
    function edit(event) {
      if (event?.isComposing || !selected || busy) return;
      const next = parsePrefs(draft), item = {};
      const value = name.value.trim(), description = desc.value.trim();
      if (value) item.name = value;
      if (description) item.description = description;
      if (value || description) next.entries[selected] = item; else delete next.entries[selected];
      if (change(next, '', false)) {
        const li = Array.from(list.children).find(el => el.dataset.hubV3Id === selected);
        const label = draftName(tree.entries.get(selected));
        if (li) {
          li.querySelector('.hub-v3-nav-pick').textContent = label;
          li.querySelector('.hub-v3-nav-handle').setAttribute('aria-label', `${label} 이동 (위·아래 방향키)`);
          li.querySelector('.hub-v3-nav-up').setAttribute('aria-label', `${label} 위로`);
          li.querySelector('.hub-v3-nav-down').setAttribute('aria-label', `${label} 아래로`);
        }
      }
    }
    for (const input of [name, desc]) {
      input.addEventListener('input', edit); input.addEventListener('compositionend', edit);
    }
    function openEditor() {
      if (d.open) return;
      syncAndPaint(); session++; draft = parsePrefs(data.prefs); openedRaw = raw; openedRevision = data.revision;
      stack = []; conflict = false; message(storageError); render(); d.showModal(); scope.focus();
    }
    d.addEventListener('cancel', e => { if (busy) e.preventDefault(); });
    d.addEventListener('close', () => { if (!d.open) { session++; draft = undefined; clearDrag(); } });
    async function commit() {
      if (busy || conflict || !draft || save.disabled) return;
      busy = true; setButtons();
      const task = () => {
        // Web Locks serializes cooperating tabs; exact snapshot comparison detects stale revisions.
        const current = read();
        if (conflict || current.error || current.raw !== openedRaw || current.data.revision !== openedRevision) {
          sync(current); reconcile(true); conflict = true; throw Error(current.error || '저장 충돌: 초안을 내보내거나 취소 후 다시 열어 주세요.');
        }
        const record = { schema: SCHEMA, schema_version: 1, revision: current.data.revision + 1,
          writer: token(), prefs: parsePrefs(draft), previous: current.data.prefs };
        const serialized = JSON.stringify(record);
        if (serialized.length > MAX_FILE || current.data.revision >= Number.MAX_SAFE_INTEGER) throw Error('설정 저장 한도를 넘었습니다.');
        localStorage.setItem(KEY, serialized);
        if (localStorage.getItem(KEY) !== serialized) { conflict = true; throw Error('동시에 저장되었습니다. 다시 열어 확인해 주세요.'); }
        data = record; raw = serialized;
      };
      try {
        if (navigator.locks?.request) await navigator.locks.request(KEY, task); else task();
        busy = false; d.close(); reconcile(true); statusRoot.textContent = '메뉴 설정을 저장했습니다.';
      } catch (e) { message(e?.name === 'QuotaExceededError' || e?.name === 'SecurityError' ? '브라우저에 저장하지 못했습니다. JSON으로 내보낼 수 있습니다.' : e?.message || '메뉴를 저장하지 못했습니다.'); }
      finally { busy = false; if (d.open) setButtons(); }
    }
    file.addEventListener('change', async () => {
      const incoming = file.files?.[0], active = session; file.value = '';
      if (!incoming || !draft) return;
      try {
        if (incoming.size > MAX_FILE) throw Error('JSON 파일은 512 KiB 이하여야 합니다.');
        const parsed = parseDoc(await incoming.text());
        if (active !== session || !d.open) return;
        if (!change(parsed.prefs, '가져온 설정을 표시했습니다. 저장 전에는 적용되지 않습니다.') && !conflict) message('이미 같은 설정입니다.');
      } catch (e) { if (active === session && d.open && !conflict) message(e instanceof SyntaxError ? '올바른 JSON 파일이 아닙니다.' : e.message); }
    });
    function download() {
      if (!draft) return;
      const blob = new Blob([JSON.stringify({ schema: SCHEMA, schema_version: 1, prefs: draft }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob), link = elem('a'); link.href = url; link.download = 'hub-menu-preferences-v1.json';
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
    observer = new MutationObserver(records => {
      if (queued || !records.some(m => !d.contains(m.target) && m.target !== statusRoot && m.target !== toggle)) return;
      queued = true; queueMicrotask(() => { queued = false; reconcile(); });
    });
    observer.observe(sidebar, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['id', 'href', 'data-to', 'data-route', 'data-hub-nav-id'] });
    window.addEventListener('storage', e => { if (e.key === KEY || e.key === null) syncAndPaint(); });
    syncAndPaint();
  }
  let mounted = false, waiting;
  function mount() {
    if (mounted) return true;
    const sidebar = document.querySelector('#sidebar');
    const menu = sidebar?.querySelector('#menuGroups');
    if (document.readyState === 'loading' || !sidebar || (!menu && !sidebar.querySelector('.navgroup,.navbtn'))) return false;
    mounted = true; waiting?.disconnect(); init(sidebar, menu || sidebar); return true;
  }
  window.HubV3Nav = Object.freeze({ mount });
  function auto() {
    if (!mount() && !waiting) {
      waiting = new MutationObserver(mount); waiting.observe(document.documentElement, { childList: true, subtree: true });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', auto, { once: true }); else auto();
})();
