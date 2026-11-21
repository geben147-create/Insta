/* 왼쪽 메뉴 맨 위에 흰 박스 2개 고정: 총8단계 대본=영상기획 / Sonnet 5.5 한일 비교 아웃라인 5안 */
(function () {
  'use strict';
  if (document.getElementById('top2pin')) return;
  var base = new URL('.', document.currentScript ? document.currentScript.src : location.href);
  var items = [
    ['📋 총8단계 대본=영상기획', '기존 8단계 공정 · 참고 자막', 'script-video-workflow-8steps/'],
    ['🟣 Sonnet 5.5 · 한일 비교', '아웃라인 5안 v2 · 줄거리 ↔ 적용 1:1', 'hermes-sonnet55-20261121/outline_5ways.html']
  ];
  var css = document.createElement('style');
  css.textContent = '#top2pin{position:sticky;top:0;z-index:50;padding:6px 0 8px;margin:0 0 8px;background:inherit}' +
    '#top2pin a{display:block;background:#fff!important;color:#111!important;border:2px solid #111;border-radius:10px;margin:0 0 7px;padding:11px 12px;text-decoration:none;font-size:17px;line-height:1.3;font-weight:900;box-shadow:0 2px 8px rgba(0,0,0,.35)}' +
    '#top2pin a small{display:block;font-size:13px;font-weight:700;color:#444;margin-top:3px}' +
    '#top2pin a:hover{background:#fff6c2!important}';
  document.head.appendChild(css);
  var box = document.createElement('div'); box.id = 'top2pin';
  items.forEach(function (it) {
    var a = document.createElement('a'); a.href = new URL(it[2], base).href;
    a.innerHTML = it[0].replace(/</g, '&lt;') + '<small>' + it[1].replace(/</g, '&lt;') + '</small>';
    box.appendChild(a);
  });
  var sb = document.getElementById('sidebar'), gn = document.getElementById('globalHubNav');
  if (sb) sb.insertBefore(box, sb.firstChild);
  else if (gn) { var t = gn.querySelector('strong'); gn.insertBefore(box, t ? t.nextSibling : gn.firstChild); gn.style.setProperty('background', '#261520'); }
})();
