/* Country prompt desk. Archived text is rendered separately from runnable templates. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const BASE = 'https://github.com/geben147-create/Insta/blob/main/';
  const PAGES = 'https://geben147-create.github.io/Insta/';
  const STORE_KEY = 'country-prompt-desk-20261125-v1';
  const PANELS = ['workflow', 'originals', 'session', 'references', 'sources', 'coverage'];
  const STEPS = [
    { id: '0', file: '00-source-check.md', title: '원본·자막 확인', note: '실제로 확보한 자료와 미확보 자료를 구분합니다.' },
    { id: '1', file: '01-topic-evidence.md', title: '주제·근거 선정', note: '선택 국가의 실제 사례와 독립 출처를 찾습니다.' },
    { id: '2', file: '02-hook-emotion.md', title: '훅·감정선', note: '실제 외국인 발언 → 질문 → 반전의 연결을 만듭니다.' },
    { id: '3', file: '03-outline.md', title: '아웃라인', note: '질문·답·새 사실·감정 회수를 시간표에 놓습니다.' },
    { id: '4', file: '04-script.md', title: '대본 작성', note: '사용자 원문을 별도 보존하고 국가·언어를 실행본에 적용합니다.' },
    { id: '5', file: '05-title-thumbnail.md', title: '제목·썸네일 문구', note: '대본을 완성한 뒤 제목과 썸네일 문구를 함께 작성합니다.' },
    { id: 'review', file: 'final-review.md', title: '대본·제목 패키지 대조', note: '실제 확인한 것만 완료로 표시합니다.' }
  ];
  const state = { data: {}, templates: {}, literal: '', readable: '', ready: false, originalView: 'literal' };
  let toastTimer;

  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined && text !== null) node.textContent = String(text);
    if (className) node.className = className;
    return node;
  }
  function append(parent, ...children) { children.filter(Boolean).forEach((child) => parent.append(child)); return parent; }
  function clear(id) { const node = $(id); node.replaceChildren(); return node; }
  function sourceURL(path) { return BASE + path.split('/').map(encodeURIComponent).join('/'); }
  function pageURL(path) { return PAGES + path.split('/').map(encodeURIComponent).join('/'); }
  function link(label, href, className) {
    const node = el('a', label, className);
    let url;
    try { url = new URL(href, location.href); } catch { return el('span', label); }
    if (!['https:', 'http:'].includes(url.protocol)) return el('span', label);
    node.href = url.href; node.target = '_blank'; node.rel = 'noopener';
    return node;
  }
  function button(label, action, className = 'button') {
    const node = el('button', label, className); node.type = 'button'; node.addEventListener('click', action); return node;
  }
  function badge(text, type = '') { return el('span', text, `pill ${type}`.trim()); }
  function detail(title, content) {
    const node = el('details'); node.append(el('summary', title));
    if (typeof content === 'string') node.append(el('pre', content));
    else if (content) node.append(content);
    return node;
  }
  function row(cells) {
    const tr = el('tr'); cells.forEach((cell) => { const td = el('td'); td.append(cell instanceof Node ? cell : document.createTextNode(String(cell ?? ''))); tr.append(td); }); return tr;
  }
  function stat(value, label) { return append(el('div', undefined, 'stat'), el('strong', value), el('span', label)); }
  function readableStatus(value) {
    const labels = {
      NOT_PRESENT_IN_VISIBLE_SESSION: '원문 미확보',
      EXACT_14_QUOTES_NOT_VISIBLE_PENDING_REPOSITORY_RECOVERY: '특정 14개 목록 미복구 · 참고 7편·22편은 별도 확보',
      EXACT_ORIGINAL_NOT_VISIBLE_PENDING_REPOSITORY_RECOVERY: '이번에 기존 GitHub STEP 0~4 정확 원문 복구 · ④ 참고 훅·원문에 수록',
      VISIBLE_EP11_50_ONLY_EP01_10_MISSING: 'EP11~50의 40편 보관 · EP01~10 전문 미확보',
      LABELS_AND_CITATION_IDS_PRESENT_MOST_URLS_UNRESOLVED: '출처명·과거 인용 식별자 보관 · 실제 URL과 수치 검증 미완료',
      TWO_REDDIT_QUOTES_VISIBLE_URLS_UNRESOLVED: '반대 의견 2개 보관 · 실제 URL 미복구 · 원음 아님',
      THREE_SRTS_VISIBLE_NOT_AUDIO_VERIFICATION: 'SRT 3파일 바이트 대조 · 원음 청취·번역 검수 미실행',
      REMAINS_INCOMPLETE: '미완료 · 완료로 바꾸지 않음',
      URL_UNRESOLVED_IN_VISIBLE_SESSION: 'URL 미복구',
      NOT_REVERIFIED_IN_THIS_ARCHIVE_TASK: '이번 보관 작업에서 사실 재검증하지 않음',
      SRT_BYTES_MATCH_SESSION: 'SRT 바이트 일치 · 원음·번역 미검증',
      CREATIVE_CANDIDATE_NOT_VERIFIED_FOREIGN_SPEECH: '창작 훅 후보 · 실제 외국인 발언 미검증'
    };
    return labels[value] || String(value || '확인 범위는 원본 기록 참조');
  }
  function toast(message) {
    const node = $('copy-status'); node.textContent = message; node.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 3200);
  }
  async function copy(text, label = '프롬프트') {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(text); toast(`${label} 복사 완료`); return;
    } catch { /* Some embedded pages deny the Clipboard API. */ }
    const temp = el('textarea'); temp.value = text; temp.setAttribute('readonly', '');
    temp.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.append(temp); temp.select();
    let copied = false;
    try { copied = document.execCommand('copy'); } catch { copied = false; }
    temp.remove();
    if (copied) { toast(`${label} 복사 완료`); return; }
    $('fallback-text').value = text;
    if (!$('copy-fallback').open) $('copy-fallback').showModal();
    $('fallback-text').focus(); $('fallback-text').select();
  }
  function configuration() {
    const target = $('country').value === 'custom' ? $('custom-country').value.trim() : $('country').value;
    return {
      TARGET_COUNTRY: target || '[국가를 입력하세요]',
      OUTPUT_LANGUAGE: $('language').value,
      AUDIENCE: $('audience').value.trim() || '40~80대 시청자',
      TOPIC: $('topic').value.trim() || 'STEP 1에서 실제 확보 자료로 선정',
      DURATION: $('duration').value,
      valid: Boolean(target)
    };
  }
  function tokens(config) {
    const korean = config.OUTPUT_LANGUAGE === '한국어';
    return {
      ...config,
      LANGUAGE_STYLE: korean
        ? '한 문장에 5~18어절. 종결어미(~습니다/~는데요/~거든요/~죠)를 섞고 같은 어미를 세 번 잇지 않는다.'
        : `${config.OUTPUT_LANGUAGE}의 자연스러운 문장 길이와 말투를 사용한다. 같은 문장 끝맺음을 세 번 잇지 않는다. 한국어 어절 수·종결어미를 이 언어에 그대로 적용하지 않는다.`,
      NUMBER_READING: korean
        ? "예: '755만 회' → '칠백오십오만 회'."
        : `숫자·단위·고유명사를 ${config.OUTPUT_LANGUAGE}에서 실제 읽는 발음으로 적는다. 한국어 읽기 예시는 적용하지 않는다.`
    };
  }
  function renderTemplate(template, config = configuration()) {
    const values = tokens(config);
    return template.replace(/\{\{([A-Z_]+)\}\}/g, (match, key) => Object.hasOwn(values, key) ? values[key] : match);
  }
  function commonText() { return renderTemplate(state.templates['common.md']); }
  function stepText(step, withCommon = true) {
    return `${withCommon ? commonText() + '\n\n---\n\n' : ''}${renderTemplate(state.templates[step.file])}`;
  }
  function allText() { return [commonText(), ...STEPS.map((step) => stepText(step, false))].join('\n\n---\n\n'); }
  function validConfig() {
    if (configuration().valid) return true;
    $('custom-country').focus(); toast('대상 국가를 입력해 주세요.'); return false;
  }
  function copyRunnable(text, label) {
    if (!validConfig()) return;
    if (/\{\{[A-Z_]+\}\}/.test(text)) { toast('설정이 채워지지 않았습니다. 페이지를 새로고침해 주세요.'); return; }
    void copy(text, label);
  }
  function saveSettings() {
    const values = Object.fromEntries(['country', 'custom-country', 'language', 'duration', 'audience', 'topic'].map((id) => [id, $(id).value]));
    try { localStorage.setItem(STORE_KEY, JSON.stringify(values)); } catch { /* Settings remain usable without storage. */ }
  }
  function restoreSettings() {
    let values;
    try { values = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return; }
    if (!values || typeof values !== 'object') return;
    ['country', 'custom-country', 'language', 'duration', 'audience', 'topic'].forEach((id) => {
      const node = $(id); const value = values[id];
      if (typeof value !== 'string') return;
      if (node.tagName === 'SELECT' && !Array.from(node.options).some((option) => option.value === value)) return;
      node.value = value.slice(0, node.maxLength > 0 ? node.maxLength : 240);
    });
  }
  function updateSettings() {
    $('custom-country-label').hidden = $('country').value !== 'custom';
    const config = configuration();
    $('current-country').textContent = `${config.TARGET_COUNTRY} · ${config.OUTPUT_LANGUAGE}`;
    $('configuration-preview').textContent = config.valid
      ? `${config.TARGET_COUNTRY}의 강점을 ${config.OUTPUT_LANGUAGE}로 설명하는 ${config.DURATION} 프롬프트입니다.`
      : '대상 국가를 입력하면 실행 프롬프트에 적용됩니다.';
    if (!state.ready) return;
    STEPS.forEach((step) => { $(`prompt-${step.id}`).textContent = stepText(step, false); });
    renderSubstitutions(); saveSettings();
  }
  function renderWorkflow() {
    const nav = clear('step-nav'); const cards = clear('workflow-cards');
    STEPS.forEach((step) => {
      const label = step.id === 'review' ? '최종 확인' : `STEP ${step.id}`;
      if (step.id !== 'review') {
        const navButton = button('', () => { location.hash = `step-${step.id}`; focusStep(step.id); }, '');
        append(navButton, el('strong', label), el('span', step.title)); nav.append(navButton);
      }
      const card = el('details', undefined, 'card step-card'); card.id = `step-${step.id}`; card.open = step.id === '0';
      append(card, append(el('summary'), el('span', label, 'step-number'), el('span', step.title)));
      const tools = append(el('div', undefined, 'step-copy-row'),
        button('이 단계 + 공통 설정 복사', () => copyRunnable(stepText(step), label), 'button primary'),
        el('p', step.note, 'small-note'));
      if (step.id === '4') tools.append(button('수정 없는 원문 보기', () => setPanel('originals'), 'button'));
      const pre = el('pre', '', 'prompt-body'); pre.id = `prompt-${step.id}`; pre.tabIndex = 0;
      append(card, tools, pre); cards.append(card);
    });
  }
  function renderSubstitutions() {
    const config = configuration();
    const mappings = [
      ['첫 30초 일본 호평', `첫 30초 ${config.TARGET_COUNTRY} 호평`],
      ['한국의 자긍심', `${config.TARGET_COUNTRY}의 자긍심`],
      ['한국어 자막', `${config.OUTPUT_LANGUAGE} 자막`],
      ['한글 읽기', `${config.OUTPUT_LANGUAGE} 숫자 읽기`],
      ['한국어 5~18어절·종결어미', config.OUTPUT_LANGUAGE === '한국어' ? '원래 한국어 규칙 적용' : `${config.OUTPUT_LANGUAGE} 구어체 규칙 적용 · 한국어 어절/어미 규칙 제외`],
      ['내 해설은 배경·새 사실·의미를 잇고', '보존본 그대로 유지 · 실행본의 추가 지시에서 해설의 역할 설명'],
      ['보관된 일본 EP·자막·인용', '치환하지 않음 · 해당 국가의 새 근거를 별도로 선정']
    ];
    const body = clear('substitution-rows'); mappings.forEach((cells) => body.append(row(cells)));
  }
  function showOriginal(mode) {
    state.originalView = mode;
    $('original-text').textContent = mode === 'literal' ? state.literal : state.readable;
    $('show-literal').classList.toggle('active', mode === 'literal');
    $('show-readable').classList.toggle('active', mode === 'readable');
    $('original-view-label').textContent = mode === 'literal'
      ? '현재 대화에 표시된 문자를 옮긴 보존본 · 백슬래시·공백 표기 유지 · 파일 끝 줄바꿈 포함'
      : '읽기용 파생본 · 백슬래시 등 서식 표기만 풀어 표시 · 원문 복사 버튼은 항상 보존본을 복사';
  }
  async function verifyOriginal() {
    const expected = state.data.integrity.files.find((file) => file.path === 'originals/user-step4-verbatim.txt')?.sha256;
    let actual;
    try {
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(state.literal));
      actual = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
    } catch { /* The saved digest is still available in the integrity file. */ }
    $('original-hash').textContent = `SHA-256 ${expected || '기록 없음'} · ${actual ? actual === expected ? '저장 파일과 일치' : '불일치 — 원본 파일을 다시 확인하세요' : '브라우저 대조 미실행'} · 대화 원문 전사는 별도 육안 대조`;
  }
  function renderEpisodes() {
    const query = $('episode-search').value.trim().toLocaleLowerCase('ko');
    const episodes = state.data.session.episodes.filter((episode) => `${episode.ep} ${episode.title} ${episode.hook} ${episode.emotion} ${episode.group}`.toLocaleLowerCase('ko').includes(query));
    $('episode-count').textContent = `${episodes.length} / 40개`;
    const grid = clear('episode-grid');
    episodes.forEach((episode) => {
      const card = el('article', undefined, 'episode-card');
      append(card,
        append(el('div', undefined, 'episode-head'), el('span', episode.ep, 'ep-id'), badge('창작 훅 후보 · 원음 미검증', 'amber')),
        el('h3', episode.title), el('p', episode.hook), el('p', episode.emotion, 'emotion'));
      const sources = el('div', undefined, 'source-labels');
      episode.sources.forEach((source) => sources.append(source.url ? link(source.label, source.url) : el('span', `${source.label} · URL 미복구`)));
      card.append(sources);
      card.append(button('보관 기획문 복사', () => copy(`${episode.ep} ${episode.title}\n\n${episode.hook}\n\n${episode.emotion}\n\n[보관 기록] 창작 훅 후보이며 실제 외국인 원음·사실 재검증 전입니다.\n${episode.sources.map((source) => `${source.label} | ${source.url || source.historical_reference_id + ' (URL 미복구)'}`).join('\n')}`, '보관 기획문')));
      grid.append(card);
    });
    if (!episodes.length) grid.append(el('p', '검색 결과가 없습니다.', 'notice'));
  }
  function renderEmotions() {
    const grid = clear('emotion-grid');
    state.data.session.emotion_types.forEach((type) => grid.append(append(el('div', undefined, 'emotion-item'), el('strong', `${type.id} · ${type.name}`), el('p', type.emotion), el('small', type.topics))));
    const timeline = clear('retention-timeline');
    state.data.session.retention_timeline.forEach((item) => timeline.append(append(el('div', undefined, 'timeline-row'), el('strong', item.time), el('span', item.retention))));
    const curve = state.data.session.emotion_curve;
    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', curve.viewBox); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', '추천 감정 흐름: 도발, 분노, 의심, 반전, 위기, 발견, 반전, 감동. 실제 측정값이 아닙니다.');
    svg.style.cssText = 'width:100%;max-width:650px;display:block;margin:22px auto 0;background:#f8f6ff;border-radius:12px';
    const path = document.createElementNS(svgNS, 'path'); path.setAttribute('d', curve.path); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#9471ba'); path.setAttribute('stroke-width', '3'); svg.append(path);
    curve.points.forEach((point, index) => {
      const circle = document.createElementNS(svgNS, 'circle'); circle.setAttribute('cx', String(point.x)); circle.setAttribute('cy', String(point.y)); circle.setAttribute('r', '4'); circle.setAttribute('fill', index > 5 ? '#2c9979' : '#cf9d3e'); svg.append(circle);
      const label = document.createElementNS(svgNS, 'text'); label.setAttribute('x', String(point.x)); label.setAttribute('y', String(160 + (index % 2) * 20)); label.setAttribute('text-anchor', 'middle'); label.setAttribute('font-size', '10'); label.setAttribute('fill', '#57496e'); label.textContent = point.label; svg.append(label);
    });
    timeline.append(svg, el('p', state.data.session.notes.curve_note, 'small-note'));
    const top = clear('top8-list');
    state.data.session.top8.forEach((item) => {
      const fill = el('div', undefined, 'fill'); fill.style.width = `${Math.max(0, Math.min(100, item.score))}%`;
      top.append(append(el('div', undefined, 'score-row'), el('span', `${item.rank}`), append(el('div'), el('span', item.title), append(el('div', undefined, 'track'), fill)), el('b', item.score)));
    });
  }
  function renderSRT() {
    const list = clear('srt-list');
    state.data.srt.forEach((record) => {
      const card = el('div', undefined, 'srt-card');
      append(card, el('h4', `${record.subcategory || record.category} · ${record.id}`), el('small', `${record.cue_count}개 자막 컷 · 저장된 SRT 바이트 일치 · 원음 청취·번역 검수 미실행`));
      const links = append(el('div', undefined, 'detail-tools'), link('원본 영상', record.video_url), link('SRT 전체', `./${record.file}`), link('GitHub 출처', record.github_url)); card.append(links);
      state.data.session.srt_excerpts.filter((item) => item.id === record.id).forEach((item) => card.append(append(el('div'), el('small', `${item.ep} · ${item.label} · ${item.time}`), el('blockquote', item.quote))));
      const correction = record.id === 'BV1tt421W7y7' ? state.data.session.corrections.find((item) => item.id === 'C01') : null;
      if (correction) card.append(el('p', `별도 검수 메모: ${correction.finding}\n${correction.observed_srt}`, 'session-note'));
      const all = detail(`전체 자막 ${record.cue_count}개 보기`, record.raw_srt); card.append(all); list.append(card);
    });
  }
  function renderSessionExtras() {
    const box = clear('session-extras');
    state.data.session.reddit_quotes.forEach((item) => {
      const part = el('div', undefined, 'session-note');
      append(part, el('strong', `${item.label} · ${item.date_as_reported} (당시 기록)`), el('blockquote', item.quote), el('p', `${item.description} · URL 미복구 · 실제 음성 아님`)); box.append(part);
    });
    const sourceTable = el('table'); const sourceBody = el('tbody');
    state.data.session.additional_sources.forEach((item) => sourceBody.append(row([`${item.source.label}\n${item.source.historical_reference_id}`, item.use, `EP ${item.recommended_eps} · URL 미복구 · 수치 재검증 전`])));
    sourceTable.append(sourceBody); box.append(detail('추가 자료 8건 · 당시 활용 계획', append(el('div', undefined, 'table-wrap'), sourceTable)));
    const notes = el('div'); Object.entries(state.data.session.notes).forEach(([key, text]) => notes.append(append(el('div', undefined, 'session-note'), el('small', key), el('p', text))));
    state.data.session.corrections.forEach((item) => notes.append(detail(`${item.id} · ${item.item}`, JSON.stringify(item, null, 2))));
    box.append(detail('당시 설명·검수 메모 전체', notes));
    box.append(append(el('div', undefined, 'detail-tools'), link('조사 쿼리·당시 진행 문구 원장', './originals/research-ledger.md'), link('세션 데이터 전체 JSON', './data/session-archive.json'), link('문장 대조 결과', './checks/verbatim-review.json')));
  }
  function renderReferences() {
    const originals = clear('github-originals'); const raw = state.data.originalSteps;
    const oldCommon = detail('공통 규칙 V4.3 · 과거 보관본', raw.common.text); originals.append(oldCommon);
    raw.steps.forEach((step) => {
      const item = detail(`STEP ${step.step} · 기존 정확 원문`, step.text);
      item.append(append(el('div', undefined, 'detail-tools'), button('기존 원문 복사', () => copy(step.text, '기존 원문')), link('원문 TXT', `./originals/github-step${step.step}.txt`), link('원본 페이지 코드', sourceURL(step.source_path))));
      item.append(el('p', `출처 ${step.source_path} · 당시 행 ${step.start_line} · SHA-256 ${step.text_sha256}`, 'detail-meta')); originals.append(item);
    });
    originals.append(detail('기존 STEP 5 검수 · 과거 보관본', raw.review_original.text));
    const seven = clear('reference-seven');
    state.data.seven.forEach((ref) => {
      const item = detail(ref.name, ref.text);
      item.append(el('p', `${ref.verification} · ${ref.use}`, 'small-note'));
      item.append(append(el('div', undefined, 'detail-tools'), link('참고 자막 전체', sourceURL(ref.source_path)), ref.source_url ? link('기록된 원본 영상', ref.source_url) : null));
      seven.append(item);
    });
    const twentyTwo = clear('reference-twentytwo');
    state.data.twentyTwo.forEach((ref) => {
      const body = el('div');
      ref.sentences.forEach((sentence) => append(body, el('p', sentence.timing_label, 'detail-meta'), el('pre', sentence.text)));
      const item = detail(`${ref.id} · ${ref.title}`, body);
      item.append(el('p', ref.verification, 'small-note'));
      item.append(append(el('div', undefined, 'detail-tools'), link('기존 분석 페이지', pageURL(ref.source_path)), ref.source_url ? link('기록된 원본 영상', ref.source_url) : null)); twentyTwo.append(item);
    });
  }
  function renderSources() {
    const sourceList = state.data.japan;
    const summary = state.data.recovery;
    const stats = clear('source-stats');
    append(stats, stat(sourceList.length, '연결한 일본 자료 경로'), stat(summary.japan_manifest_rows, '기존 수집표 행 · 조사 시점'), stat(summary.japan_manifest_caption_queue_nonzero, '자막 큐 수 > 0 기록 영상 · 실제 SRT 확보와 별개'), stat('3', '세션 SRT 파일 바이트 대조'));
    renderSourceRows();
    const sources = clear('historical-source-rows');
    state.data.sourceRegister.forEach((source) => {
      const status = source.url ? link('기록된 URL', source.url) : badge('URL 미복구', 'amber');
      sources.append(row([`${source.label}\n${source.locations.join(', ')}`, source.historical_reference_id || '기록 없음', status]));
    });
  }
  function renderSourceRows() {
    const query = $('source-search').value.trim().toLocaleLowerCase('ko');
    const sources = state.data.japan.filter((source) => `${source.path} ${source.kind}`.toLocaleLowerCase('ko').includes(query));
    $('source-count').textContent = `${sources.length} / ${state.data.japan.length}개`;
    const body = clear('source-rows');
    sources.forEach((source) => {
      const name = append(el('div'), el('strong', source.kind), el('span', source.path, 'source-path'));
      const status = append(el('div'), badge(source.exists_in_repository ? '원본 경로 확인' : '경로 미확인', source.exists_in_repository ? 'green' : 'amber'), el('p', source.read_in_this_audit ? '파일 내용 읽음 · 사실·원음 검증과 별개' : '이번 작업에서 내용 미확인', 'small-note'));
      if (source.row_count !== null && source.row_count !== undefined) status.append(el('p', `${source.row_count}행`, 'small-note'));
      const links = append(el('div', undefined, 'source-links'), link('GitHub', source.github_url));
      if (/\.(html?|srt|json|txt|csv|tsv|md)$/i.test(source.path)) links.append(link(/\.html?$/i.test(source.path) ? '페이지 열기' : '파일 열기', pageURL(source.path)));
      body.append(row([name, status, links]));
    });
  }
  function currentGap(gap) {
    if (gap.id === 'G03') return { resolved: true, text: '이번 복구에서 기존 GitHub STEP 0~4와 훅 단계의 정확 원문 확보. ④ 참고 훅·원문에서 확인할 수 있습니다. 과거 미확보 기록은 원본 JSON에 유지합니다.' };
    return { resolved: false, text: gap.action || '정확한 원문 또는 실제 검증 결과를 확보한 뒤 보완합니다.' };
  }
  function renderCoverage() {
    const requirements = state.data.coverage;
    const stats = clear('coverage-summary');
    append(stats, stat('40 / 50', 'EP 기획문 전문 확보'), stat('7 + 22', '참고 자막·기존 훅'), stat('0~4', '기존 단계 원문 복구'), stat(state.data.sourceRegister.filter((source) => !source.url).length, '과거 출처 URL 미복구'));
    const body = clear('requirement-rows');
    requirements.forEach((item) => {
      const labels = { complete: ['반영', 'green'], partial: ['부분 반영·검증 범위 확인', 'amber'], gap: ['미확보', 'rose'] };
      const [label, color] = labels[item.status] || ['확인 필요', 'amber'];
      body.append(row([`${item.id} · ${item.requirement}`, append(el('div'), el('span', item.evidence), item.note ? el('p', item.note, 'small-note') : null), badge(label, color)]));
    });
    const gaps = clear('gap-list');
    state.data.session.gaps.forEach((gap) => {
      const current = currentGap(gap);
      if (current.resolved) {
        gaps.append(append(el('div', undefined, 'notice cyan'), el('strong', `${gap.id} · 이번에 복구됨`), el('p', current.text))); return;
      }
      const card = append(el('div', undefined, 'gap-item'), el('strong', `${gap.id} · ${gap.item}`), el('p', current.text));
      if (gap.known_fragments) card.append(el('p', `남아 있는 단서: ${gap.known_fragments.join(' / ')}`));
      gaps.append(card);
    });
    const completion = clear('completion-rows');
    state.data.session.completion_snapshot.forEach((item) => completion.append(row([item.requirement, item.reported_status, readableStatus(item.archive_check)])));
    gaps.append(append(el('div', undefined, 'detail-tools'), link('복구 조사 기록', './reference/source-recovery.md'), link('추가 파일·연결 확인', './reference/additional-static-audit.md'), link('자료 파일 읽기 대조', './data/japan-source-read-audit.json')));
  }
  function setPanel(panel, updateHash = true) {
    if (!PANELS.includes(panel)) panel = 'workflow';
    PANELS.forEach((id) => { $(`panel-${id}`).hidden = id !== panel; });
    document.querySelectorAll('#main-tabs button').forEach((node) => {
      if (node.dataset.panel === panel) node.setAttribute('aria-current', 'page');
      else node.removeAttribute('aria-current');
    });
    if (updateHash && location.hash !== `#${panel}`) history.replaceState(null, '', `#${panel}`);
  }
  function focusStep(id) {
    setPanel('workflow', false); const card = $(`step-${id}`);
    if (card) { card.open = true; card.scrollIntoView({ block: 'start', behavior: 'auto' }); }
  }
  function route() {
    const hash = location.hash.slice(1);
    if (/^step-(?:[0-5]|review)$/.test(hash)) { focusStep(hash.slice(5)); return; }
    setPanel(PANELS.includes(hash) ? hash : 'workflow', false);
  }
  async function fetchFile(path, json = false) {
    const response = await fetch(path, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`${path}: ${response.status}`);
    return json ? response.json() : response.text();
  }
  async function initialize() {
    restoreSettings(); updateSettings();
    $('settings-form').addEventListener('submit', (event) => event.preventDefault());
    $('settings-form').addEventListener('input', updateSettings);
    $('settings-form').addEventListener('change', updateSettings);
    const jsonFiles = {
      session: 'data/session-archive.json', srt: 'data/srt-records.json', originalSteps: 'data/original-step0-4.json',
      seven: 'data/reference-hooks-7.json', twentyTwo: 'data/hook-examples-22.json', japan: 'data/japan-source-index.json',
      recovery: 'data/recovery-status.json', sourceRegister: 'data/source-reference-register.json',
      coverage: 'data/coverage.json', integrity: 'checks/integrity.json'
    };
    try {
      await Promise.all([
        ...Object.entries(jsonFiles).map(async ([key, path]) => { state.data[key] = await fetchFile(path, true); }),
        ...['common.md', ...STEPS.map((step) => step.file)].map(async (file) => { state.templates[file] = await fetchFile(`prompts/${file}`); }),
        fetchFile('originals/user-step4-verbatim.txt').then((value) => { state.literal = value; }),
        fetchFile('originals/user-step4-readable.md').then((value) => { state.readable = value; })
      ]);
      renderWorkflow(); renderEpisodes(); renderEmotions(); renderSRT(); renderSessionExtras(); renderReferences(); renderSources(); renderCoverage();
      state.ready = true; updateSettings(); showOriginal('literal'); void verifyOriginal();
      $('loading').hidden = true; route();
    } catch (error) {
      $('loading').replaceChildren(el('strong', '자료를 불러오지 못했습니다.'), el('p', '잠시 후 새로고침해 주세요. 원문 파일은 아래에서 직접 열 수 있습니다.'), link('STEP 4 보존 원문', './originals/user-step4-verbatim.txt'), el('p', String(error.message), 'small-note'));
      document.querySelectorAll('#settings-form button, #main-tabs button').forEach((node) => { node.disabled = true; });
      return;
    }
    document.querySelectorAll('#main-tabs button').forEach((node) => node.addEventListener('click', () => setPanel(node.dataset.panel)));
    $('copy-all').addEventListener('click', () => copyRunnable(allText(), '전체 실행 프롬프트'));
    $('copy-common').addEventListener('click', () => copyRunnable(commonText(), '공통 설정'));
    $('download-all').addEventListener('click', () => {
      if (!validConfig()) return;
      const url = URL.createObjectURL(new Blob([allText()], { type: 'text/plain;charset=utf-8' }));
      const a = el('a'); a.href = url; a.download = `${configuration().TARGET_COUNTRY.replace(/[\\/:*?"<>|]/g, '_')}-${configuration().OUTPUT_LANGUAGE}-제작프롬프트.txt`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    });
    $('copy-original').addEventListener('click', () => copy(state.literal, '보존 원문'));
    $('show-literal').addEventListener('click', () => showOriginal('literal'));
    $('show-readable').addEventListener('click', () => showOriginal('readable'));
    $('episode-search').addEventListener('input', renderEpisodes);
    $('source-search').addEventListener('input', renderSourceRows);
    $('close-copy-fallback').addEventListener('click', () => $('copy-fallback').close());
    window.addEventListener('hashchange', route);
    window.CountryPromptDesk = Object.freeze({
      renderTemplate,
      snapshot: () => ({ configuration: configuration(), promptCount: STEPS.length, episodeCount: state.data.session.episodes.length, sourceCount: state.data.japan.length, original: state.literal, prompts: allText() })
    });
  }
  void initialize();
})();
