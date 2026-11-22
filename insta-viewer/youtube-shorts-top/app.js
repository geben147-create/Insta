const $=id=>document.getElementById(id), names={all:'전체 주제',ai:'AI 도구',startup:'창업',grants:'지원금',stock:'주식',etf:'ETF',property:'부동산',crypto:'코인','character-tools':'AI 창업·도구 · 캐릭터형',scenic:'여행 풍경·철도','character-drama':'AI 캐릭터 드라마','human-drama':'AI 사람 드라마',comedy:'캐릭터 만화 개그','character-travel':'캐릭터 여행',manga:'만화·망가',dance:'춤·댄스'};
const ticks=[[300000000,'3억'],[200000000,'2억'],[100000000,'1억'],[90000000,'9천만'],[80000000,'8천만'],[70000000,'7천만'],[60000000,'6천만'],[10000000,'1천만'],[5000000,'500만'],[4000000,'400만'],[3000000,'300만'],[2000000,'200만'],[1000000,'100만'],[500000,'50만'],[100000,'10만'],[0,'전체']];let data, scenicReviews = null;
const el=(p,tag,t)=>{let n=document.createElement(tag);if(t!=null)n.textContent=t;p.append(n);return n}, fmt=x=>x==null?'미확인':x.toLocaleString('ko-KR');
const travel=['scenic','character-travel'], character=['character-tools','character-drama','human-drama','comedy','manga','dance'];
function nav(k){const n=$('groupNav');n.replaceChildren();const group=travel.includes(k)?travel:character.includes(k)?character:[];for(const key of group){const b=el(n,'button',names[key]);b.type='button';b.setAttribute('aria-current',String(key===k));b.onclick=()=>{$('topic').value=key;render()};}}
function render(){const k=$('topic').value, a=k==='all'?data.all:data.topics[k], reg=$('region').value, min=+$('min').value,sort=$('sort').value;$('railLabel').hidden=k!=='scenic';const subset=a.filter(x=>x.date>=data.cutoff&&(!reg||reg===x.market)&&(k!=='scenic'||!$('rail').checked||x.rail||/train|railway|shinkansen|鉄道|列車|철도|기차/i.test(x.title))), b=subset.filter(x=>x.views>=min).sort((x,y)=>sort==='date'?y.date.localeCompare(x.date):(y[sort]??-1)-(x[sort]??-1));nav(k);$('heading').textContent=names[k]+' · 유튜브 쇼츠';$('status').textContent=`${data.cutoff} 이후 · ${b.length} / ${subset.length}편 · 1억+ ${subset.filter(x=>x.views>=1e8).length}편 · 100만+ ${subset.filter(x=>x.views>=1e6).length}편 · 최고 ${fmt(subset.length?Math.max(...subset.map(x=>x.views)):null)}회`; const g=$('grid');g.style.setProperty('--cols',Math.max(2,Math.min(10,+$('cols').value||4)));g.replaceChildren();if(!b.length)el(g,'p','이 조건에 맞는 검수 표본 없음');for(const x of b){if(!/^[\w-]{11}$/.test(x.id))continue; const ar=el(g,'article'), anchor=el(ar,'a');anchor.href='https://www.youtube.com/shorts/'+x.id;anchor.target='_blank';anchor.rel='noopener noreferrer';anchor.setAttribute('aria-label',x.title+' 유튜브 원본');const img=el(anchor,'img');img.src='https://i.ytimg.com/vi/'+x.id+'/mqdefault.jpg';img.loading='lazy';img.alt='';const body=el(ar,'div');el(body,'strong',x.title);el(body,'p',x.channel);el(body,'small',`조회 ${fmt(x.views)} · 좋아요 ${fmt(x.likes)} · ${x.date}`);if(x.frames.length){const dt=el(body,'details');el(dt,'summary',k==='scenic'?`기존 대표 장면 ${x.frames.length}장`:`실제 영상 ${x.frames.length}컷`);const frames=el(dt,'section');for(const f of x.frames){if(!/^[\w-]+\.webp$/.test(f))continue;const a=el(frames,'a');a.href='frames/'+f;a.target='_blank';a.rel='noopener';const i=el(a,'img');i.src=a.href;i.loading='lazy';i.alt='영상 장면';}}else{el(body,'p','장면 캡처 미확보');}if(scenicReviews) renderScenicAnalysis(body,x.id);}}
fetch('data.json?v=views50a').then(r=>{if(!r.ok)throw Error();return r.json()}).then(d=>{data=d;data.all=[...new Map(Object.values(d.topics).flat().map(x=>[x.id,x])).values()];for(const [k,v] of Object.entries(names)){const o=el($('topic'),'option',`${v} (${(k==='all'?d.all:d.topics[k]).length})`);o.value=k}for(const [n,v] of ticks){const o=el($('min'),'option',n?v+' 이상':v);o.value=n}const params=new URLSearchParams(location.search);const lower=params.get('min');$('min').value=ticks.some(([v])=>String(v)===lower)?lower:(params.get('topic')==='all'?'500000':'0');const k=params.get('topic');if(Object.hasOwn(names,k))$('topic').value=k;for(const k of ['topic','region','min','sort','cols','rail'])$(k).addEventListener('change',render);render(); loadScenicAnalysis();}).catch(()=>$('status').textContent='데이터를 불러오지 못했습니다.');
const scenicReportRoot = '../../ai-influencer-krjp/scenic-benchmark/';

function reportLink(parent, filename, label) {
  const anchor = el(parent, 'a', label);
  anchor.href = scenicReportRoot + filename;
  return anchor;
}

function renderScenicAnalysis(body, id) {
  const record = scenicReviews[id];
  if (!record) return;

  const watch = el(body, 'details');
  el(watch, 'summary', 'Watch');
  if (record.watch_sheets) {
    el(watch, 'p', record.note || `실제 원본 표본 ${record.watch_count}장 추출 · 육안 검토 미확정`);
    for (const filename of record.watch_sheets) {
      const anchor = reportLink(watch, filename, '');
      const thumbnail = el(anchor, 'img');
      thumbnail.loading = 'lazy';
      thumbnail.alt = '실제 원본 Watch 표본';
      thumbnail.src = anchor.href;
    }
  } else {
    el(watch, 'p', record.reason || '실제 원본 확인 중');
  }
  if (!record.metricLabel) reportLink(watch, `index.html#${id}`, '원본 분석 보고서');

  const opencv = el(body, 'details');
  el(opencv, 'summary', 'OpenCV');
  if (record.timeline_csv) {
    const seen = record.hard_cuts === null ? '미확정' : record.hard_cuts + '개 확인';
    el(opencv, 'p', `0.1초 ${record.sampled_bins}구간 · 자동 후보 ${record.auto_cuts}개 · 하드컷 ${seen}`);
    reportLink(el(opencv, 'p'), record.timeline_csv, record.metricLabel || '움직임·밝기·색·파형 CSV');
    for (const [index, filename] of record.boundary_sheets.entries()) {
      reportLink(el(opencv, 'p'), filename, `컷 경계 앞뒤 ${index + 1}`);
    }
  } else {
    el(opencv, 'p', record.reason || '실제 원본 확인 중');
  }
  if (!record.metricLabel) reportLink(opencv, 'captures.html', '원본 캡처 바둑판');
}

async function loadScenicAnalysis() {
  try {
    const response = await fetch(scenicReportRoot + 'youtube-cards.json?v=cv23');
    if (!response.ok) return;
    scenicReviews = await response.json();
    render();
  } catch {
    // The original list stays usable when the evidence cannot be loaded.
  }
}
