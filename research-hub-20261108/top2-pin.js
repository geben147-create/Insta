/* 기존 모델 메뉴와 51–100 제작판 진입점을 왼쪽 상단에 고정. */
(function () {
  'use strict';
  if (document.getElementById('top2pin')) return;
  var base = new URL('.', document.currentScript ? document.currentScript.src : location.href);
  var items = [
    ['📋 총8단계 대본=영상기획', '기존 8단계 공정 · 참고 자막', 'script-video-workflow-8steps/'],
    ['🟣 Sonnet 5.5 · 한일 비교', '아웃라인 5안 v2 · 줄거리 ↔ 적용 1:1', 'hermes-sonnet55-20261121/outline_5ways.html'],
    ['한일 비교 51–100 · 대본·낭독', '대본 50편 · 합성된 음성은 바로 듣기', './#outline50-player'],
    ['51–100 · 아웃라인·영상 기획서', '아웃라인 50편 · 영상 기획서 50편', './#outline50-plans']
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
  var section = document.getElementById('outline50SectionNav');
  if (section && window.top !== window.self) return;
  var sb = document.getElementById('sidebar') || section, gn = document.getElementById('globalHubNav');
  if (sb) sb.insertBefore(box, sb.firstChild);
  else if (gn) { var t = gn.querySelector('strong'); gn.insertBefore(box, t ? t.nextSibling : gn.firstChild); gn.style.setProperty('background', '#261520'); }
})();


/* 🌸 51~100 개별 기획서에서만 추가 지시 UI를 불러온다. 다른 허브 페이지는 변경하지 않는다. */
(function () {
  'use strict';
  if (!/\/kukppong-batch-20261122\/outline50\/outlines\/outline_(?:5[1-9]|[6-9]\d|100)\.html$/.test(location.pathname)) return;
  if (document.getElementById('ht-production-addendum-loader')) return;
  var current = document.currentScript;
  if (!current || !current.src) return;
  var el = document.createElement('script');
  el.id = 'ht-production-addendum-loader';
  el.src = new URL('../kukppong-batch-20261122/outline50/episode-production-addendum.js?v=20261123a', current.src).href;
  document.head.appendChild(el);
})();
