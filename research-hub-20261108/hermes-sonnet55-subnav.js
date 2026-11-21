/* Sonnet 5.5 하위 메뉴 — 허브 왼쪽 공통 메뉴(#globalHubNav) 안에 접이식으로 붙임 (하위 페이지용)
   허브 첫 화면의 메뉴(hermes-sonnet55-menu.js)와 같은 localStorage 키(h55-menu-v2)를 읽어서 이름·순서·숨김을 따릅니다.
   접기/펼치기는 <details>의 삼각형. 수정은 허브 첫 화면에서 합니다(더블클릭 이름, ⠿ 순서, ✕ 숨김). */
(function () {
  'use strict';
  var nav = document.getElementById('globalHubNav');
  if (!nav || document.getElementById('h55-subnav')) return;
  var base = new URL('./hermes-sonnet55-20261121/', document.currentScript ? document.currentScript.src : location.href);
  var ITEMS = [
    { id: 'outline', label: '🗂 아웃라인 5안 v2 · 줄거리 ↔ 적용 1:1 · 음성', href: 'outline_5ways.html' },
    { id: 'page', label: '📄 내 프롬프트 · 단계별 복사 · 모델 기록', href: 'index.html' },
    { id: 'ans', label: '🎧 답변 음성 · 2배속 가능', href: 'outline_5ways.html#tts' },
    { id: 'ol', label: '🎧 아웃라인 음성 · 2배속 가능', href: 'outline_5ways.html#tts' },
    { id: 'md', label: '📝 아웃라인 원문(MD)', href: 'outline_5ways.md' },
    { id: 'v1', label: '🗃 v1 아웃라인(폐기 · 이미 한 소재 포함)', href: 'v1_discarded/outline_5ways.html' }
  ];
  var st = { labels: {}, itemOrder: {}, hidden: {}, collapsed: false };
  try { var s = JSON.parse(localStorage.getItem('h55-menu-v2') || 'null'); if (s) st = Object.assign(st, s); } catch (e) {}
  var order = (st.itemOrder && st.itemOrder.sonnet55) || [];
  var list = ITEMS.slice().sort(function (a, b) {
    var ia = order.indexOf(a.id), ib = order.indexOf(b.id);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  var d = document.createElement('details'); d.id = 'h55-subnav'; d.open = !st.collapsed;
  var sm = document.createElement('summary'); sm.textContent = (st.labels['g:sonnet55']) || '🟣 Sonnet 5.5 · 한일 비교 아웃라인'; sm.style.cssText = 'cursor:pointer;font-weight:800;color:#d9c9ff;padding:4px 2px';
  d.appendChild(sm);
  var cur = location.pathname.split('/').pop();
  list.forEach(function (it) {
    if (st.hidden && st.hidden['sonnet55:' + it.id]) return;
    var a = document.createElement('a'); a.href = new URL(it.href, base).href;
    a.textContent = (st.labels['sonnet55:' + it.id]) || it.label;
    a.style.cssText = 'display:block;padding:5px 4px 5px 10px;color:#cfe6ff;text-decoration:none;border-bottom:1px solid #3d2a35;word-break:keep-all;overflow-wrap:anywhere';
    if (it.href.split('#')[0] === cur) a.setAttribute('aria-current', 'page');
    d.appendChild(a);
  });
  var first = nav.querySelector('details') || null;
  nav.insertBefore(d, nav.children[2] || null);
})();
