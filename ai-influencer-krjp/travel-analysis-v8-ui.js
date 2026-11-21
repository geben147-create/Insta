/* Travel card analysis: data is text-only; never inject report-provided HTML. */
(function () {
  'use strict';
  var grid = document.getElementById('g');
  if (!grid) return;
  var openCards = new Set();
  var lastTrigger = null;
  var lastReel = null;
  var sections = [
    ['watch', 'Watch 관찰'],
    ['opencv', 'OpenCV 측정'],
    ['comparison', '분석 대조'],
    ['fusion', '융합 · 새 장면 제안'],
    ['verification', '검증 기록']
  ];
  var styles = document.createElement('style');
  styles.textContent = '.ta-v8{border-top:1px solid #3b465d;border-bottom:1px solid #3b465d;background:#121b25;font-size:12px;line-height:1.6}.ta-v8>summary{cursor:pointer;padding:9px 7px;color:#a9e7db;font-weight:700;list-style-position:inside}.ta-v8[open]>summary{border-bottom:1px solid #3b465d}.ta-v8-body{padding:8px;overflow-wrap:anywhere}.ta-v8-body p{margin:5px 0}.ta-v8-body h3{font-size:13px;color:#a9e7db;margin:14px 0 4px}.ta-v8-body h4{font-size:12px;margin:8px 0 3px}.ta-v8-body ul{padding-left:19px;margin:5px 0}.ta-v8-body .ta-v8-meta{font-size:11px;color:#b6bdce}.ta-v8-status{display:inline-block;border:1px solid #66758c;border-radius:5px;padding:1px 5px;color:#e4d399}.ta-v8-links{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.ta-v8-links a{border:1px solid #44516b;border-radius:5px;padding:3px 6px}.ta-v8 button{white-space:normal;line-height:1.5;width:100%;padding:6px}.ta-v8-compact{max-height:440px;overflow:auto;overscroll-behavior:contain}.ta-v8-dialog{width:min(1100px,94vw);max-width:94vw;max-height:90vh;overflow:auto;background:#111924;color:#eef2f8;border:1px solid #566781;border-radius:12px;padding:0;box-shadow:0 14px 70px #000b}.ta-v8-dialog::backdrop{background:#000b}.ta-v8-dialog-head{position:sticky;top:0;z-index:1;background:#111924;display:flex;gap:16px;align-items:center;justify-content:space-between;padding:14px 20px;border-bottom:1px solid #3b465d}.ta-v8-dialog-head h2{font-size:20px;margin:0;overflow-wrap:anywhere}.ta-v8-dialog-head button{padding:6px 12px;flex-shrink:0}.ta-v8-dialog .ta-v8-body{padding:8px 22px 24px;font-size:15px;line-height:1.8}.ta-v8-dialog .ta-v8-body h3{font-size:18px}.ta-v8-dialog .ta-v8-body h4{font-size:15px}.ta-v8-dialog .ta-v8-meta{font-size:13px}.ta-v8-hint{color:#b6bdce}.ta-v8-dialog a{color:#a7d5ff}@media(max-width:600px){.ta-v8-dialog-head{padding:12px}.ta-v8-dialog-head h2{font-size:17px}.ta-v8-dialog .ta-v8-body{padding:8px 14px 20px}}';
  document.head.appendChild(styles);

  var dialog = document.createElement('dialog');
  dialog.className = 'ta-v8-dialog';
  dialog.setAttribute('aria-labelledby', 'ta-v8-dialog-title');
  dialog.innerHTML = '<div class="ta-v8-dialog-head"><h2 id="ta-v8-dialog-title">여행 상세 분석</h2><button type="button" data-ta-v8-close aria-label="상세 분석 닫기">닫기 ×</button></div><div data-ta-v8-dialog-body></div>';
  document.body.appendChild(dialog);

  function escapeText(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function safeHref(value) {
    var text = String(value || '');
    if (!text || /[\u0000-\u0020]/.test(text)) return '';
    try {
      var resolved = new URL(text, document.baseURI);
      return /^(https?:|file:)$/.test(resolved.protocol) ? text : '';
    } catch (_) { return ''; }
  }
  function linksHtml(links) {
    return (Array.isArray(links) ? links : []).map(function (link) {
      var href = safeHref(link.href);
      return href ? '<a href="' + escapeText(href) + '" target="_blank" rel="noopener">' + escapeText(link.label || '자료 열기') + ' ↗</a>' : '';
    }).join('');
  }
  function listHtml(items) {
    if (!Array.isArray(items) || !items.length) return '';
    return '<ul>' + items.map(function (item) { return '<li>' + escapeText(item) + '</li>'; }).join('') + '</ul>';
  }
  function getData() { return window.TRAVEL_ANALYSIS_V8 || {}; }
  function getEntry(id) { return (getData().entries || {})[id] || {}; }
  function reportLinks(data) {
    var result = (data.reportLinks || []).slice();
    [['reportUrl', '독립 HTML 보고서'], ['markdownUrl', '상세 MD'], ['checklistUrl', '체크리스트'], ['zipUrl', '전체 ZIP']].forEach(function (pair) {
      if (data[pair[0]]) result.push({ label: pair[1], href: data[pair[0]] });
    });
    return result;
  }
  function statusLabel(section) {
    return section && section.status ? section.status : '미확인';
  }
  function bodyHtml(id, compact) {
    var data = getData();
    var entry = getEntry(id);
    var html = '<div class="ta-v8-body' + (compact ? ' ta-v8-compact' : '') + '">';
    html += '<p><span class="ta-v8-status">' + escapeText(entry.status || '분석 자료 확인 중') + '</span></p>';
    html += '<p class="ta-v8-meta">원본 ID: ' + escapeText(id) + (data.updatedAt ? ' · 기록: ' + escapeText(data.updatedAt) : '') + '</p>';
    if (entry.account) html += '<p>계정: @' + escapeText(entry.account) + '</p>';
    if (entry.viewsRecorded != null) html += '<p>저장된 조회수: ' + escapeText(Number(entry.viewsRecorded).toLocaleString('ko-KR')) + '회</p>';
    if (entry.publishedRecorded) html += '<p>저장된 게시일: ' + escapeText(entry.publishedRecorded) + '</p>';
    if (entry.sourceUrl) html += '<div class="ta-v8-links">' + linksHtml([{label:'원본 출처',href:entry.sourceUrl}]) + '</div>';
    if (entry.facts && entry.facts.length) html += '<h3>확인한 사실</h3>' + listHtml(entry.facts);
    sections.forEach(function (pair) {
      var section = entry[pair[0]];
      if (typeof section === 'string') section = { summary: section };
      html += '<section><h3>' + pair[1] + '</h3><p class="ta-v8-meta">상태: ' + escapeText(statusLabel(section)) + '</p>';
      if (section && section.summary) html += '<p>' + escapeText(section.summary) + '</p>';
      else html += '<p class="ta-v8-hint">이 영상의 확인된 기록이 아직 없습니다.</p>';
      if (section) {
        html += listHtml(section.items);
        if (section.links) html += '<div class="ta-v8-links">' + linksHtml(section.links) + '</div>';
      }
      html += '</section>';
    });
    html += '<p class="ta-v8-meta">조회수의 높고 낮음은 기록 사실, 원인 해석은 검증할 가설입니다. 미확인 항목을 0회나 확정 사실로 처리하지 않습니다.</p>';
    html += '<div class="ta-v8-links">' + linksHtml(entry.links) + linksHtml(reportLinks(data)) + '</div>';
    if (compact) html += '<button type="button" data-ta-v8-expand="' + escapeText(id) + '">상세 분석 크게 보기</button>';
    html += '</div>';
    return html;
  }
  function addAnalysis() {
    var isTravel = location.hash === '#f_travel';
    grid.querySelectorAll('.c').forEach(function (card) {
      var existing = card.querySelector('.ta-v8');
      if (!isTravel) { if (existing) existing.remove(); return; }
      if (existing) return;
      var thumb = card.querySelector('a.th');
      var match = thumb && thumb.href.match(/instagram\.com\/reel\/([A-Za-z0-9_-]+)/);
      if (!match) return;
      var id = match[1];
      var details = document.createElement('details');
      details.className = 'ta-v8';
      details.dataset.taV8Id = id;
      details.open = openCards.has(id);
      details.innerHTML = '<summary>분석 펼치기 · 숨기기</summary>' + bodyHtml(id, true);
      details.addEventListener('toggle', function () {
        if (details.open) openCards.add(id); else openCards.delete(id);
      });
      thumb.insertAdjacentElement('afterend', details);
    });
  }
  function closeDialog() { if (dialog.open) dialog.close(); }
  dialog.querySelector('[data-ta-v8-close]').addEventListener('click', closeDialog);
  dialog.addEventListener('click', function (event) {
    if (event.target !== dialog) return;
    var box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog();
  });
  dialog.addEventListener('close', function () {
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus();
    else if (lastReel) {
      var details = Array.from(grid.querySelectorAll('.ta-v8')).find(function (node) { return node.dataset.taV8Id === lastReel; });
      if (details) details.querySelector('summary').focus();
    }
    lastTrigger = null;
  });
  grid.addEventListener('click', function (event) {
    var button = event.target.closest('[data-ta-v8-expand]');
    if (!button) return;
    event.preventDefault();
    lastTrigger = button;
    lastReel = button.dataset.taV8Expand;
    dialog.querySelector('#ta-v8-dialog-title').textContent = '여행 상세 분석 · ' + lastReel;
    dialog.querySelector('[data-ta-v8-dialog-body]').innerHTML = bodyHtml(lastReel, false);
    dialog.showModal();
    dialog.querySelector('[data-ta-v8-close]').focus();
  });
  new MutationObserver(addAnalysis).observe(grid, { childList: true });
  window.addEventListener('hashchange', addAnalysis);
  window.addEventListener('travel-analysis-v8-updated', function () {
    grid.querySelectorAll('.ta-v8').forEach(function (node) { node.remove(); });
    addAnalysis();
  });
  addAnalysis();
})();
