/* Report comparison: fixed baseline scores, separately verified additions, and original links. */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const SCOPE_LABELS = {
    script_planning: '대본·기획',
    verification: '검증',
    editing_reference: '영상 편집 참고'
  };
  const POLICY_LABELS = {
    confirmed: '공식 자료와 일치',
    needs_scope_label: '적용 범위 구분 필요',
    unsupported_probability: '제재 확률의 근거 없음',
    partially_correct: '일부 맞음 · 조건 보완',
    needs_correction: '내용 정정 필요',
    overbroad: '일률적 적용 금지',
    outdated_article_number: '현행 조문 번호로 정정',
    conditional: '조건별로 확인',
    insufficient_evidence: '입증 자료 부족',
    implementation_caution: '실행할 때 맥락 확인'
  };
  const state = { data: null, before: [], after: [], beforeError: false, priorityViews: [] };

  function node(tag, text, className) {
    const result = document.createElement(tag);
    if (text !== undefined && text !== null) result.textContent = String(text);
    if (className) result.className = className;
    return result;
  }
  function clear(id) {
    const target = $(id);
    target.replaceChildren();
    return target;
  }
  function list(value) { return Array.isArray(value) ? value : []; }
  function text(value) { return value === undefined || value === null ? '' : String(value); }
  function link(label, href, className) {
    if (!href) return node('span', label, className);
    let url;
    try { url = new URL(href, location.href); } catch { return node('span', label, className); }
    if (!['http:', 'https:'].includes(url.protocol)) return node('span', label, className);
    const result = node('a', label, className);
    result.href = url.href;
    result.target = '_blank';
    result.rel = 'noopener';
    return result;
  }
  function row(cells) {
    const tr = node('tr');
    cells.forEach((value) => {
      const td = node('td');
      td.append(value instanceof Node ? value : document.createTextNode(text(value)));
      tr.append(td);
    });
    return tr;
  }
  function emptyRow(target, columns, message) {
    const tr = node('tr');
    const td = node('td', message, 'report-empty-note');
    td.colSpan = columns;
    tr.append(td);
    target.append(tr);
  }
  function finite(value) { return typeof value === 'number' && Number.isFinite(value); }
  function percent(value) { return finite(value) ? `${value.toFixed(2).replace(/\.00$/, '')}%` : '대조 중'; }
  function plainNumber(value) { return finite(value) ? String(value) : '—'; }
  function getGroup(summary, scope) { return list(summary?.groups).find((group) => group.scope === scope); }
  async function getJSON(path) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function renderScores() {
    const before = state.data.beforeSummary || {};
    const after = state.data.afterSummary || null;
    const cards = [
      { title: '대본·기획', group: getGroup(before, 'script_planning'), after: getGroup(after, 'script_planning'), note: '핵심 제작 지시만 비교' },
      { title: '대본·기획 + 검증', group: before.core_and_verification, after: after?.core_and_verification, note: '출처·수치·정책 검증까지 포함' },
      { title: '전체 보고서 요소', group: before.overall, after: after?.overall, note: '실행에서 제외한 편집 참고도 포함' }
    ];
    const target = clear('report-score-cards');
    cards.forEach((card) => {
      const group = card.group || {};
      const item = node('article', null, 'report-score-card');
      item.append(node('h4', card.title));
      const value = node('div', null, 'report-score-value');
      value.append(node('strong', finite(group.percent) ? Math.round(group.percent) : '—'));
      if (finite(group.percent)) value.append(node('span', '%'));
      item.append(value, node('p', `${plainNumber(group.points)} / ${plainNumber(group.items)}점 · 정확값 ${percent(group.percent)}`));
      const meter = node('div', null, 'report-score-meter');
      meter.setAttribute('aria-hidden', 'true');
      const fill = node('span');
      fill.style.width = `${finite(group.percent) ? Math.max(0, Math.min(100, group.percent)) : 0}%`;
      meter.append(fill);
      item.append(meter, node('p', card.note));
      if (card.after && finite(card.after.percent)) {
        const verified = node('div', '보완 후 지시문 대조 ', 'report-score-after');
        verified.append(node('strong', percent(card.after.percent)), node('span', ` · ${card.after.points}/${card.after.items}점`));
        item.append(verified);
      }
      target.append(item);
    });
    $('report-after-status').textContent = after && finite(after.overall?.percent)
      ? '보완 후 수치는 동일한 항목으로 지시문을 다시 대조한 값입니다. 실제 영상 적용률이나 흥행 검증률을 의미하지 않습니다.'
      : '보완 후 대조 중 · 보완 후 집계가 확인되기 전에는 새 반영률을 표시하지 않습니다.';
  }

  function renderMethod() {
    const summary = state.data.beforeSummary || {};
    const target = clear('report-method-content');
    target.append(node('p', summary.comparison_scope), node('p', summary.score_meaning));
    target.append(node('code', '반영률 = (명시 반영 × 1 + 부분 반영 × 0.5 + 미반영 × 0) ÷ 항목 수 × 100', 'report-formula'));
    target.append(node('p', summary.denominator));
    const counts = node('div', null, 'report-method-stats');
    list(summary.groups).forEach((group) => {
      counts.append(node('span', `${SCOPE_LABELS[group.scope] || group.scope} ${group.items}개 · 명시 ${group.explicit} / 부분 ${group.partial} / 미반영 ${group.absent}`));
    });
    target.append(counts);
    const overall = summary.overall;
    if (overall) {
      target.append(node('p', `전체: (${overall.explicit} × 1 + ${overall.partial} × 0.5 + ${overall.absent} × 0) ÷ ${overall.items} × 100 = ${percent(overall.percent)}`));
    }
    target.append(node('p', '대본·기획, 검증, 편집 참고를 나누어 읽습니다. 항목을 어떻게 나누고 부분 반영을 판정했는지에 따른 문서 대조 결과이며, 다른 체크리스트의 점수와 바로 비교할 수 없습니다.'));
    if (summary.baseline_commit) target.append(node('p', `보완 전 기준 커밋: ${summary.baseline_commit}`, 'detail-meta'));
  }

  function renderHighlights() {
    const target = clear('report-highlight-rows');
    list(state.data.comparisonHighlights).forEach((item) => {
      const improvement = node('div');
      improvement.append(node('span', item.improvement));
      if (item.stage) improvement.append(node('span', item.stage, 'report-table-stage'));
      target.append(row([node('strong', item.topic), item.before, item.report, improvement]));
    });
    if (!target.children.length) emptyRow(target, 4, '요약 비교 자료를 준비하고 있습니다.');
  }

  function api() { return window.CountryPromptDesk; }
  function updatePriorityText() {
    const desk = api();
    let config;
    try { config = desk?.snapshot?.().configuration; } catch { config = null; }
    $('report-config-label').textContent = config
      ? `${config.TARGET_COUNTRY} · ${config.OUTPUT_LANGUAGE} · ${config.DURATION}`
      : '시작 설정 연결 중';
    state.priorityViews.forEach((view) => {
      const ready = typeof desk?.renderTemplate === 'function' && typeof desk?.copyText === 'function';
      view.pre.textContent = ready ? desk.renderTemplate(text(view.item.prompt)) : text(view.item.prompt);
      view.button.disabled = !ready || config?.valid === false;
      view.button.title = !ready ? '단계별 프롬프트가 준비되면 복사할 수 있습니다.' : config?.valid === false ? '위에서 대상 국가를 입력하세요.' : '';
    });
  }

  function renderPriorities() {
    const target = clear('report-priority-list');
    state.priorityViews = [];
    list(state.data.priorities).slice().sort((a, b) => Number(a.rank) - Number(b.rank)).forEach((item) => {
      const article = node('article', null, 'research-addendum report-priority-card');
      article.id = `report-priority-${item.rank}`;
      const head = node('div', null, 'report-priority-head');
      const title = node('div', null, 'report-priority-title');
      const heading = node('h4', item.title);
      heading.id = `${article.id}-title`;
      article.setAttribute('aria-labelledby', heading.id);
      title.append(heading);
      const stages = node('div', null, 'report-stage-chips');
      list(item.stages).forEach((stage) => stages.append(node('span', stage, 'report-stage-chip')));
      title.append(stages);
      const copyButton = node('button', `${item.rank}순위 코드 복사`, 'button report-priority-copy');
      copyButton.type = 'button';
      copyButton.disabled = true;
      const pre = node('pre', text(item.prompt));
      pre.setAttribute('aria-label', `${item.rank}순위 ${item.title} 복사용 프롬프트`);
      const copyStatus = node('span', '', 'report-priority-status');
      copyStatus.setAttribute('role', 'status');
      copyButton.addEventListener('click', async () => {
        const desk = api();
        if (!desk?.copyText || !desk?.renderTemplate) return;
        const prompt = desk.renderTemplate(text(item.prompt));
        try {
          await desk.copyText(prompt, `${item.rank}순위 보완 프롬프트`);
          copyStatus.textContent = '복사 요청 완료';
        } catch {
          copyStatus.textContent = '자동 복사가 되지 않았습니다. 코드 내용을 선택해 복사하세요.';
        }
      });
      head.append(node('span', item.rank, 'report-priority-rank'), title, copyButton);
      article.append(head, node('p', item.why), pre, copyStatus);
      target.append(article);
      state.priorityViews.push({ item, pre, button: copyButton });
    });
    updatePriorityText();
  }

  function scoreTag(score, prefix) {
    const labels = { 1: ['명시 반영', 'complete'], 0.5: ['부분 반영', 'partial'], 0: ['미반영', 'absent'] };
    const found = labels[score];
    return found
      ? node('span', `${prefix} ${found[0]} · ${score}점`, `report-score-tag ${found[1]}`)
      : node('span', `${prefix} 대조 중`, 'report-score-tag pending');
  }
  function evidenceDetails(title, evidence) {
    const values = list(evidence).filter((item) => item && (item.file || item.quote));
    if (!values.length) return null;
    const details = node('details');
    details.append(node('summary', title));
    values.forEach((item) => {
      if (item.file) details.append(link(item.file, `./${item.file.replace(/^\.\//, '')}`, 'source-path'));
      if (item.quote) details.append(node('blockquote', item.quote, 'report-evidence-quote'));
    });
    return details;
  }
  function renderCoverage() {
    const selected = $('report-scope-filter').value;
    const values = state.before.filter((item) => selected === 'all' || item.scope === selected);
    const afterById = new Map(state.after.map((item) => [item.id, item]));
    const target = clear('report-audit-rows');
    values.forEach((item) => {
      const after = afterById.get(item.id);
      const identity = node('div');
      identity.append(node('strong', item.id, 'report-item-id'), node('span', SCOPE_LABELS[item.scope] || item.scope, 'report-scope-label'));
      const existing = node('div');
      existing.append(node('p', item.existing));
      const oldEvidence = evidenceDetails('기존 지시의 근거 보기', item.evidence ? [item.evidence] : []);
      if (oldEvidence) existing.append(oldEvidence);
      const proposal = node('div');
      proposal.append(node('p', item.proposed), node('span', item.stage, 'report-table-stage'));
      if (after) {
        if (after.reason_after) proposal.append(node('p', after.reason_after, 'detail-meta'));
        const newEvidence = evidenceDetails('보완 후 지시의 근거 보기', list(after.evidence_after));
        if (newEvidence) proposal.append(newEvidence);
      }
      const scores = node('div');
      scores.append(scoreTag(item.score, '전'), scoreTag(after?.score_after, '후'));
      if (item.reason) scores.append(node('p', item.reason, 'detail-meta'));
      if (item.scope === 'editing_reference') scores.append(node('span', '편집 실행 제외 · 참고', 'report-scope-label'));
      else if (after?.mode === 'reference_only') scores.append(node('span', '실제 통지가 있을 때 확인 · 참고', 'report-scope-label'));
      target.append(row([identity, existing, item.report_element, proposal, scores]));
    });
    if (!values.length) emptyRow(target, 5, state.beforeError ? '상세 대조 파일을 불러오지 못했습니다. 아래 원본 JSON 연결에서 확인할 수 있습니다.' : '이 범위에 해당하는 항목이 없습니다.');
    const scoredAfter = values.filter((item) => finite(afterById.get(item.id)?.score_after)).length;
    $('report-row-count').textContent = `${selected === 'all' ? '전체' : SCOPE_LABELS[selected]} ${values.length}개 · 보완 후 개별 대조 ${scoredAfter}개`;
  }

  function renderMetricCorrections() {
    const target = clear('report-metric-rows');
    list(state.data.metricCorrections).forEach((item) => {
      const action = node('div', item.action);
      if (item.source) {
        const source = typeof item.source === 'object'
          ? link(item.source.title || item.source.url, item.source.url, 'report-metric-source')
          : /^https?:\/\/|^\.\//.test(item.source)
            ? link('계산 근거', item.source, 'report-metric-source')
            : node('small', item.source, 'report-metric-source');
        action.append(source);
      }
      target.append(row([node('strong', item.metric), item.reported, item.recalculated, action]));
    });
    if (!target.children.length) emptyRow(target, 4, '수치 대조 자료를 준비하고 있습니다.');
  }

  function renderPolicyCorrections() {
    const target = clear('report-policy-list');
    list(state.data.policyCorrections).forEach((item) => {
      const article = node('article', null, 'report-policy-card');
      article.append(node('h4', item.claim), node('span', POLICY_LABELS[item.judgment] || item.judgment, `report-judgment${item.judgment === 'confirmed' ? ' confirmed' : ''}`), node('p', item.guidance));
      const sources = node('div', null, 'report-policy-sources');
      list(item.sourceUrls).forEach((source) => sources.append(link(source.title || source.url, source.url)));
      article.append(sources);
      target.append(article);
    });
    if (!target.children.length) target.append(node('p', '공식 자료 대조 내용을 준비하고 있습니다.', 'report-empty-note'));
  }

  function renderSources() {
    const originals = clear('report-original-links');
    list(state.data.originals).forEach((source) => {
      const li = node('li');
      li.append(link(source.label || source.title || source.url, source.url));
      originals.append(li);
    });
    const sources = clear('report-source-links');
    list(state.data.sources).forEach((source) => {
      const li = node('li');
      li.append(link(source.title || source.url, source.url));
      sources.append(li);
    });
    const coverageLinks = clear('report-coverage-links');
    if (state.data.coverageBefore) coverageLinks.append(link('보완 전 36항목 JSON', state.data.coverageBefore, 'button'));
    if (state.after.length && state.data.coverageAfter) coverageLinks.append(link('보완 후 대조 JSON', state.data.coverageAfter, 'button'));
    coverageLinks.append(link('전체 비교 데이터 JSON', './data/report-comparison.json', 'button'));
    const excluded = clear('report-excluded-list');
    list(state.data.beforeSummary?.corrections_excluded_from_score).forEach((item) => {
      const article = node('div', null, 'report-exclusion-item');
      article.append(node('strong', `${item.id} · ${item.report_claim}`), node('p', item.reason));
      excluded.append(article);
    });
    const limitations = clear('report-limitations-list');
    const allLimitations = [...list(state.data.limitations), ...list(state.data.beforeSummary?.limitations)];
    Array.from(new Set(allLimitations.filter(Boolean))).forEach((item) => limitations.append(node('li', item)));
  }

  async function initialize() {
    if (!$('panel-report')) return;
    $('report-scope-filter').addEventListener('change', renderCoverage);
    window.addEventListener('country-prompt-ready', updatePriorityText);
    window.addEventListener('country-prompt-settings', updatePriorityText);
    try {
      state.data = await getJSON('./data/report-comparison.json');
      if (state.data.title) $('report-title').textContent = state.data.title;
      if (state.data.subtitle) $('report-subtitle').textContent = state.data.subtitle;
      $('report-scope-note').textContent = state.data.scopeNote || '사용자 보고서 원문은 보존하고 실행 지시의 반영 여부를 대조합니다. 실제 영상 20편을 새로 측정한 결과는 아닙니다.';
      const [before, after] = await Promise.allSettled([
        getJSON(state.data.coverageBefore || './data/report-coverage-before.json'),
        getJSON(state.data.coverageAfter || './data/report-coverage-after.json')
      ]);
      if (before.status === 'fulfilled') state.before = list(before.value);
      else state.beforeError = true;
      if (after.status === 'fulfilled') state.after = list(after.value);
      renderScores();
      renderMethod();
      renderHighlights();
      renderPriorities();
      renderCoverage();
      renderMetricCorrections();
      renderPolicyCorrections();
      renderSources();
      $('report-loading').hidden = true;
      $('report-content').hidden = false;
      window.dispatchEvent(new CustomEvent('country-prompt-report-ready', { detail: { beforeItems: state.before.length, afterItems: state.after.length } }));
    } catch {
      const loading = $('report-loading');
      loading.className = 'notice amber';
      loading.replaceChildren(node('p', '비교 자료를 불러오지 못했습니다. 연결을 확인한 뒤 페이지를 새로고침해 주세요.'), link('비교 데이터 파일 확인', './data/report-comparison.json', 'button'));
    }
  }

  void initialize();
})();
