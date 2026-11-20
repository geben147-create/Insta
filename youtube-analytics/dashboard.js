const sections = ['events', 'videos', 'samples', 'experiments', 'notes'];
const newest = (a, b) => b.date.localeCompare(a.date);
const metricValue = (row, key) => Number.isFinite(row[key]) && row[key] >= 0 ? row[key] : null;

export function selectRecords(data, {channel, date, topic} = {}) {
  const videos = new Map(data.videos.map(video => [video.id, video]));
  return Object.fromEntries(sections.map(key => [key, data[key].filter(row => {
    const video = key === 'videos' ? row : videos.get(row.video);
    if (row.video && !video) return false;
    return (!channel || channel === (video?.channel ?? row.channel)) &&
      (!date || date === row.date) && (!topic || !video || topic === video.topic);
  }).sort(newest)]));
}

export function seriesFor(rows, key) {
  const series = new Map();
  for (const row of [...rows].sort((a, b) => newest(b, a))) {
    if (!series.has(row.video)) series.set(row.video, []);
    series.get(row.video).push({date: row.date, value: metricValue(row, key)});
  }
  return [...series].filter(([, points]) => points.some(p => p.value !== null))
    .map(([video, points]) => ({video, points}));
}

export function rankByViews(rows) {
  return seriesFor(rows, 'views').map(({video, points}) => ({video, ...points.findLast(p => p.value !== null)}))
    .sort((a, b) => b.value - a.value || newest(a, b) || a.video.localeCompare(b.video));
}

const metrics = [
  {key: 'views', label: '조회수', unit: '회'},
  {key: 'impressions', label: '노출수', unit: '회'},
  {key: 'ctr', label: '노출 클릭률', unit: '%'}
];
const number = new Intl.NumberFormat('ko-KR', {maximumFractionDigits: 2});
const format = (value, unit) => `${number.format(value)}${unit}`;
const byId = id => document.getElementById(id);
function el(tag, text, cls) {
  const node = document.createElement(tag);
  if (text != null) node.textContent = text;
  if (cls) node.className = cls;
  return node;
}
function dateNode(date) {
  const node = el('time', date);
  node.dateTime = date;
  return node;
}
function link(url, text) {
  try {
    const target = new URL(url);
    if (target.protocol === 'https:') {
      const a = el('a', text);
      a.href = target.href;
      return a;
    }
  } catch { /* Optional URL missing or invalid. */ }
  return el('span', text);
}
function panel(id, rows, draw, message) {
  byId(id).replaceChildren(...(rows.length ? rows.map(draw) : [el('p', message, 'empty')]));
}
function card(title, detail, date, context) {
  const node = el('article', null, 'record');
  const meta = el('p', null, 'meta');
  meta.append(dateNode(date));
  if (context) meta.append(' · ', context);
  const heading = el('h3');
  heading.append(title);
  node.append(meta, heading);
  if (detail) node.append(el('p', detail));
  return node;
}

const NS = 'http://www.w3.org/2000/svg';
const svg = (name, props) => {
  const node = document.createElementNS(NS, name);
  for (const [key, value] of Object.entries(props)) node.setAttribute(key, value);
  return node;
};
const palette = ['#166042', '#9b482b', '#215e89', '#70528f', '#825900'];
const day = date => Date.parse(`${date}T00:00:00Z`);
function drawChart(metric, rows, titleFor) {
  const series = seriesFor(rows, metric.key);
  const chart = el('article', null, 'metric');
  chart.append(el('h3', metric.label));
  if (!series.length) {
    const help = el('details');
    help.append(el('summary', '관측값 미등록 · 이유 보기'),
      el('p', `선택 범위에 공개된 영상별 ${metric.label} 관측값이 없습니다. 미등록은 0${metric.unit}이 아닙니다. 날짜와 측정값이 등록되면 그래프가 표시됩니다.`));
    chart.append(help);
    return chart;
  }
  const points = series.flatMap(s => s.points);
  const dates = points.map(p => p.date).sort();
  const first = day(dates[0]), span = day(dates.at(-1)) - first;
  const max = points.reduce((top, p) => Math.max(top, p.value ?? 0), 0) || 1;
  const plot = svg('svg', {viewBox: '0 0 240 84', 'aria-hidden': 'true'});
  for (const y of [8, 42, 76]) plot.append(svg('line', {x1: 8, x2: 232, y1: y, y2: y, class: 'grid-line'}));
  const legend = el('ul', null, 'legend');
  const details = el('details');
  details.append(el('summary', '관측값 보기'));
  for (const [i, {video, points: readings}] of series.entries()) {
    const color = palette[i % palette.length];
    const name = titleFor(video);
    const swatch = el('span', null, 'swatch');
    swatch.style.backgroundColor = color;
    const key = el('li');
    key.append(swatch, name);
    legend.append(key);
    const data = el('ul', null, 'readings');
    let path = '', continuing = false;
    const markers = [];
    for (const p of readings) {
      data.append(el('li', `${p.date} · ${p.value === null ? '미등록' : format(p.value, metric.unit)}`));
      if (p.value === null) { continuing = false; continue; }
      const x = span ? 8 + (day(p.date) - first) / span * 224 : 120;
      const y = 76 - p.value / max * 68;
      path += `${continuing ? 'L' : 'M'}${x},${y} `;
      continuing = true;
      markers.push(svg('circle', {cx: x, cy: y, r: 2.8, fill: color}));
    }
    plot.append(svg('path', {d: path, fill: 'none', stroke: color, 'stroke-width': 2}), ...markers);
    details.append(el('p', name, 'reading-title'), data);
  }
  const range = dates[0] === dates.at(-1) ? dates[0] : `${dates[0]} – ${dates.at(-1)}`;
  chart.append(el('p', `최댓눈금 ${format(max, metric.unit)}`, 'meta'), plot,
    el('p', `${range} · KST`, 'meta'), legend, details);
  return chart;
}

function render(data) {
  const filters = Object.fromEntries(['channel', 'date', 'topic'].map(key => [key, byId(key).value]));
  const picked = selectRecords(data, filters);
  const channels = new Map(data.channels.map(row => [row.id, row]));
  const videos = new Map(data.videos.map(row => [row.id, row]));
  const titleFor = id => videos.get(id)?.title || id;
  const scoped = Object.values(filters).some(Boolean);
  byId('status').textContent = scoped ? '선택한 조건의 공개 기록입니다.' : '전체 공개 기록 · 날짜 기준 KST';
  const items = [
    ['records', '운영 기록', `${picked.events.length}건`], ['videos', '등록 영상', `${picked.videos.length}편`],
    ['charts', '성과 관측일', picked.samples.length ? `${new Set(picked.samples.map(r => r.date)).size}일` : '미등록']
  ];
  byId('metrics').replaceChildren(...items.map(([target, label, value]) => {
    const item = el('a', null, 'summary-metric');
    item.href = `#${target}`;
    item.append(el('span', label), el('strong', value));
    return item;
  }));

  panel('event-list', picked.events, row => {
    const channel = channels.get(videos.get(row.video)?.channel ?? row.channel);
    return card(row.title, row.detail, row.date, row.kind || channel?.name);
  }, '선택 범위에 공개 운영 기록이 없습니다.');
  byId('chart-list').replaceChildren(...metrics.map(metric => drawChart(metric, picked.samples, titleFor)));
  byId('chart-list').append(el('p', '공개 관측값을 등록하면 영상별 날짜 추이를 표시합니다.', 'meta chart-caption'));
  panel('video-list', picked.videos, row => card(link(row.url, row.title), row.detail, row.date, row.topic),
    '등록된 공개 영상·썸네일 기록이 없습니다.');
  panel('ab-list', picked.experiments, row => card(row.title, row.detail, row.date, titleFor(row.video)),
    '등록된 공식 A/B 실험 결과가 없습니다.');
  panel('note-list', picked.notes, row => card(row.title, row.detail, row.date, row.video ? titleFor(row.video) : undefined),
    '등록된 공개 회고가 없습니다.');
  const ranks = rankByViews(picked.samples);
  if (ranks.length) {
    const list = el('ol', null, 'rank-list');
    for (const row of ranks) {
      const entry = el('li');
      entry.append(link(videos.get(row.video)?.url, titleFor(row.video)), ' · ', format(row.value, '회'), ' · ', dateNode(row.date));
      list.append(entry);
    }
    byId('rank-list').replaceChildren(el('p', '선택 범위의 영상별 최신 조회수 관측값 기준', 'meta'), list);
  } else {
    byId('rank-list').replaceChildren(el('p', '순위를 계산할 공개 조회수 관측값이 없습니다.', 'empty'));
  }
}

function options(id, values) {
  for (const [value, text] of values) {
    const option = el('option', text);
    option.value = value;
    byId(id).append(option);
  }
}
function brandFallbacks() {
  for (const image of document.querySelectorAll('.brand-art img')) {
    const missing = () => {
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    };
    image.addEventListener('error', missing);
    if (image.complete && !image.naturalWidth) missing();
  }
}
async function start() {
  brandFallbacks();
  try {
    const response = await fetch(new URL('./public-data.json', import.meta.url));
    if (!response.ok) throw new Error('Data unavailable');
    const data = await response.json();
    if (data.schema !== 1 || !['channels', ...sections].every(key => Array.isArray(data[key]))) {
      throw new Error('Unexpected schema');
    }
    options('channel', data.channels.map(row => [row.id, row.name]));
    const dates = [...new Set(sections.flatMap(key => data[key].map(row => row.date)))].sort().reverse();
    options('date', dates.map(date => [date, date]));
    const topics = [...new Set(data.videos.map(row => row.topic).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko'));
    options('topic', topics.map(topic => [topic, topic]));
    render(data);
    byId('filters').addEventListener('change', () => render(data));
    // The native reset changes select values after the reset event returns.
    byId('filters').addEventListener('reset', () => setTimeout(() => render(data), 0));
    byId('filter-fields').disabled = false;
  } catch {
    byId('status').textContent = '공개 기록을 불러오지 못했습니다. HTTP로 열린 주소에서 새로고침해 주세요.';
  }
}
if (typeof document !== 'undefined') start();
