/* 2026-11-22: Three-channel copy board. Reads the existing TOP 10 text verbatim. */
(function () {
  'use strict';
  function start() {
    var specs = [
      {name:'쓸모왕', heading:'뉴스·합성 TOP 10', tone:'gold'},
      {name:'단골이슈', heading:'인물·현장 TOP 10', tone:'cyan'},
      {name:'K스토리라인', heading:'공연·해외 리액션 TOP 10', tone:'pink'}
    ];
    function make(tag, className, content) {
      var node = document.createElement(tag);
      if (className) node.className = className;
      if (content !== undefined) node.textContent = content;
      return node;
    }
    function takeLines(pre) {
      if (!pre) return [];
      return pre.textContent.trim().split(/\r?\n/).slice(1)
        .map(function (line) { return line.replace(/^\s*\d+[.)]\s*/, '').trim(); })
        .filter(Boolean);
    }
    var blocks = Array.from(document.querySelectorAll('details'));
    var channels = specs.map(function (spec) {
      var node = blocks.find(function (detail) {
        var summary = detail.firstElementChild;
        return summary && summary.tagName === 'SUMMARY' &&
          summary.textContent.trim() === spec.heading;
      });
      if (!node) return null;
      var pres = Array.from(node.children)
        .filter(function (child) {return child.classList.contains('snippet');})
        .map(function (child) {return child.querySelector('pre');})
        .filter(Boolean);
      if (pres.length < 2) return null;
      var titles = takeLines(pres[0]), thumbs = takeLines(pres[1]);
      if (titles.length !== 10 || thumbs.length !== 10) return null;
      return {name:spec.name, tone:spec.tone, title:titles, thumb:thumbs};
    }).filter(Boolean);
    if (channels.length !== specs.length) {
      console.warn('[top-channel-copy] TOP 10 source blocks are missing or incomplete.');
      return;
    }

    var style = document.createElement('style');
    style.textContent = [
      '#top-channel-copy{--tc-line:#765469;--tc-light:#f8f1f8;--tc-deep:#201523;margin:0 0 28px;padding:22px;border:2px solid #f5d95c;border-radius:16px;background:#241927;color:var(--tc-light);box-shadow:0 14px 40px #140a1780;font:15px/1.6 system-ui,sans-serif}',
      '#top-channel-copy *{box-sizing:border-box}',
      '#top-channel-copy .tc-head{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}',
      '#top-channel-copy .tc-kicker{display:inline-block;background:#dfff69;color:#29212d;font-weight:900;font-size:12px;padding:3px 9px;border-radius:20px}',
      '#top-channel-copy h2{margin:10px 0 4px;color:#fff9de;font-size:clamp(22px,3.4vw,34px);line-height:1.25}',
      '#top-channel-copy .tc-desc{margin:0 0 16px;color:#e4cfe1;font-size:13px}',
      '#top-channel-copy .tc-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center}',
      '#top-channel-copy button{border:1px solid #dfd0e0;border-radius:9px;padding:8px 13px;background:#fff8e7;color:#301c34;font:800 13px/1.35 system-ui,sans-serif;cursor:pointer;min-height:39px;white-space:normal}',
      '#top-channel-copy button:hover{background:#dfff69;color:#191520;border-color:#dfff69}',
      '#top-channel-copy button:focus-visible{outline:3px solid #83efff;outline-offset:2px}',
      '#top-channel-copy .tc-main-actions{padding:14px;border:1px solid #706379;border-radius:11px;background:#392a43;margin-bottom:12px}',
      '#top-channel-copy .tc-main-actions>strong{display:block;margin-bottom:9px;color:#ffe66c}',
      '#top-channel-copy .tc-main-actions button:first-child{background:#f4df68;border-color:#f4df68}',
      '#top-channel-copy .tc-status{min-height:25px;padding:4px 0;font-weight:800;color:#aaf4c8;font-size:13px}',
      '#top-channel-copy .tc-channel{border:1px solid var(--tc-line);border-radius:12px;margin:12px 0;background:#2d2130;overflow:hidden}',
      '#top-channel-copy .tc-channel[open]>summary{border-bottom:1px solid var(--tc-line)}',
      '#top-channel-copy .tc-channel>summary{padding:14px 17px;cursor:pointer;background:#3b2c40;list-style-position:inside;color:#fff}',
      '#top-channel-copy .tc-channel>summary strong{font-size:19px;color:#ffe66c;margin-right:9px}',
      '#top-channel-copy .tc-channel[data-tone="cyan"]>summary strong{color:#8cecf3}',
      '#top-channel-copy .tc-channel[data-tone="pink"]>summary strong{color:#ff9bd2}',
      '#top-channel-copy .tc-channel .tc-actions{padding:14px 16px 0}',
      '#top-channel-copy .tc-rows{padding:9px 13px 15px;display:grid;grid-template-columns:1fr;gap:8px}',
      '#top-channel-copy .tc-row{background:#201722;border:1px solid #5f4d64;border-radius:9px;padding:10px 12px}',
      '#top-channel-copy .tc-rowtop{display:flex;gap:8px;justify-content:space-between;align-items:center;flex-wrap:wrap;margin-bottom:7px}',
      '#top-channel-copy .tc-number{font-weight:900;font-size:14px;color:#ffe66c}',
      '#top-channel-copy .tc-field{display:grid;grid-template-columns:70px minmax(0,1fr) auto;align-items:start;gap:8px;padding:6px 0;border-top:1px solid #493749}',
      '#top-channel-copy .tc-label{font-size:12px;font-weight:900;color:#f4c6e0;line-height:1.5}',
      '#top-channel-copy .tc-field p{min-width:0;overflow-wrap:anywhere;margin:0;white-space:pre-wrap;color:#fff8f5;font-size:14px}',
      '#top-channel-copy .tc-field button{padding:5px 9px;min-height:31px;font-size:12px}',
      '#top-channel-copy .tc-preview{margin-top:14px;border:1px solid #6d596a;border-radius:10px;padding:8px 12px}',
      '#top-channel-copy .tc-preview summary{background:none;cursor:pointer;color:#f6e88b;padding:6px;font-weight:800}',
      '#top-channel-copy textarea{display:block;width:100%;height:320px;margin:8px 0;resize:vertical;background:#160f18;border:1px solid #8d7590;border-radius:8px;color:#fff;white-space:pre;overflow:auto;font:12px/1.7 monospace;padding:12px}',
      '#top-channel-copy .tc-warning{margin:10px 0 0;color:#d4bbc9;font-size:12px}',
      '@media(max-width:720px){#top-channel-copy{padding:12px;border-radius:9px}#top-channel-copy .tc-field{grid-template-columns:55px minmax(0,1fr);gap:6px}#top-channel-copy .tc-field button{grid-column:2;justify-self:start}#top-channel-copy .tc-row{padding:8px}#top-channel-copy .tc-channel>summary{padding:11px}#top-channel-copy .tc-rows{padding:9px}}'
    ].join('\n');
    document.head.appendChild(style);

    var root = make('section');
    root.id = 'top-channel-copy';
    root.setAttribute('aria-label', '세 채널 상위 10개 제목과 썸네일 문구 복사판');
    var header = make('div', 'tc-head');
    var headerText = make('div');
    headerText.appendChild(make('span', 'tc-kicker', '3개 채널 · 영상 30편 · 문구 60개'));
    headerText.appendChild(make('h2', '', '📋 TOP 썸네일 문구·제목 원클릭 복사'));
    headerText.appendChild(make('p', 'tc-desc', '사진 없이 글씨만 모았습니다. 전체·채널별·각 영상별로 필요한 부분만 복사하세요.'));
    header.appendChild(headerText);
    root.appendChild(header);
    var status = make('div', 'tc-status');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    function numbered(lines) {
      return lines.map(function (line, i) {return (i+1)+'. '+line;}).join('\n');
    }
    function sectionText(channel, kind) {
      return channel.name+' TOP 10 · '+(kind==='title'?'제목만':'썸네일 문구만')+'\n'+numbered(channel[kind]);
    }
    function channelText(channel) {
      return sectionText(channel, 'thumb')+'\n\n'+sectionText(channel, 'title');
    }
    function allKind(kind) {
      return channels.map(function (channel) {return sectionText(channel, kind);}).join('\n\n');
    }
    var allText = channels.map(channelText).join('\n\n'+'─'.repeat(25)+'\n\n');

    function tryLegacyCopy(value) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
      document.body.appendChild(field);
      field.focus();
      field.select();
      var ok = false;
      try {ok = document.execCommand('copy');} catch (_) {}
      field.remove();
      return ok;
    }
    function copyButton(label, value) {
      var button = make('button', '', label);
      button.type = 'button';
      button.addEventListener('click', async function () {
        var ok = false;
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(value);
            ok = true;
          }
        } catch (_) {}
        if (!ok) ok = tryLegacyCopy(value);
        if (ok) {
          button.textContent = '✓ 복사 완료';
          status.textContent = label+' : 클립보드에 복사했습니다.';
          window.setTimeout(function () {button.textContent = label;}, 1600);
        } else {
          status.textContent = '자동 복사가 차단되었습니다. 펼쳐진 텍스트를 선택하여 Ctrl+C로 복사하세요.';
          var fallback = make('textarea');
          fallback.value = value;
          fallback.readOnly = true;
          fallback.setAttribute('aria-label', '수동 복사용 문구');
          var old = root.querySelector('.tc-fallback');
          if (old) old.remove();
          fallback.className = 'tc-fallback';
          root.insertBefore(fallback, status.nextSibling);
          fallback.focus();
          fallback.select();
        }
      });
      return button;
    }
    var globals = make('div', 'tc-main-actions');
    globals.appendChild(make('strong', '', '📦 3개 채널 한꺼번에 복사'));
    var globalButtons = make('div', 'tc-actions');
    globalButtons.appendChild(copyButton('전체 60개 복사 (제목 + 썸네일)', allText));
    globalButtons.appendChild(copyButton('3채널 제목 30개만 복사', allKind('title')));
    globalButtons.appendChild(copyButton('3채널 썸네일 30개만 복사', allKind('thumb')));
    globals.appendChild(globalButtons);
    root.appendChild(globals);
    root.appendChild(status);

    channels.forEach(function (channel) {
      var details = make('details', 'tc-channel');
      details.open = true;
      details.dataset.tone = channel.tone;
      var summary = make('summary');
      summary.appendChild(make('strong', '', channel.name+' TOP 10'));
      summary.appendChild(make('span', '', '제목 10개 + 썸네일 10개'));
      details.appendChild(summary);
      var actions = make('div', 'tc-actions');
      actions.appendChild(copyButton(channel.name+' 전체 20개 복사', channelText(channel)));
      actions.appendChild(copyButton('제목 10개만 복사', sectionText(channel, 'title')));
      actions.appendChild(copyButton('썸네일 10개만 복사', sectionText(channel, 'thumb')));
      details.appendChild(actions);
      var rows = make('div', 'tc-rows');
      channel.title.forEach(function (title, i) {
        var thumb = channel.thumb[i];
        var item = make('article', 'tc-row');
        var rowTop = make('div', 'tc-rowtop');
        rowTop.appendChild(make('span', 'tc-number', String(i+1).padStart(2, '0')+'위'));
        rowTop.appendChild(copyButton('이 영상 제목 + 썸네일 복사',
          channel.name+' '+(i+1)+'위\n제목: '+title+'\n썸네일: '+thumb));
        item.appendChild(rowTop);
        [['썸네일', thumb, '썸네일 복사'], ['제목', title, '제목 복사']].forEach(function (field) {
          var line = make('div', 'tc-field');
          line.appendChild(make('span', 'tc-label', field[0]));
          line.appendChild(make('p', '', field[1]));
          line.appendChild(copyButton(field[2], field[1]));
          item.appendChild(line);
        });
        rows.appendChild(item);
      });
      details.appendChild(rows);
      root.appendChild(details);
    });

    var preview = make('details', 'tc-preview');
    preview.appendChild(make('summary', '', '전체 60개 원문 텍스트 직접 선택·복사하기'));
    var area = make('textarea');
    area.value = allText;
    area.readOnly = true;
    area.setAttribute('aria-label', '3개 채널 전체 텍스트');
    area.addEventListener('focus', function () {area.select();});
    preview.appendChild(area);
    root.appendChild(preview);
    root.appendChild(make('p', 'tc-warning', '※ 제목 끝의 …는 원본 자료에서도 잘린 부분입니다. K스토리라인 5위 썸네일은 판독 불가로 기록되어 있습니다. 내용의 사실관계는 별도 검증이 필요합니다.'));
    document.body.prepend(root);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once:true});
  } else start();
})();