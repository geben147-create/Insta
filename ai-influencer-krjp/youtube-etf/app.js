const byId = id => document.getElementById(id);
const formats = ['전체','원페이지','자료 화면','인물 쇼츠','설명 쇼츠','롱폼','추가 식별','♥ 저장'];
const routes=['all','onepage','data','speaker','shorts','long','extra','saved'];
function selectedFormat(){return formats[routes.indexOf(location.hash.slice(1))] || '전체';}
let active = selectedFormat(), saved = new Set();
try { saved = new Set(JSON.parse(localStorage.getItem('youtube-etf-hearts') || '[]')); } catch {}
const number = n => n.toLocaleString('ko-KR');
const compact = n => n >= 10000 ? number(n / 10000) + '만' : number(n);
function node(tag, text, cls) {
  const el = document.createElement(tag);
  if (text != null) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}
function link(text, url) {
  const a = node('a', text); a.href = url; a.target = '_blank'; a.rel = 'noopener'; return a;
}
function render() {
  const mode = byId('sort').value;
  const items = records.filter(r => active === '전체' || (active === '♥ 저장' ? saved.has(r.id) : r.format === active));
  const score = r => mode === 'ratio' ? (r.subs?r.views/r.subs:-1) : (r.views??-1);
  items.sort((a,b) => (mode === 'grade' ? ['Good','Worst','미표시'].indexOf(a.grade) - ['Good','Worst','미표시'].indexOf(b.grade) : 0) || score(b)-score(a) || a.id-b.id);
  byId('order').textContent = ({grade:'캡처의 성과도 등급순입니다. 같은 등급은 조회수가 높은 순입니다.',views:'캡처에 표시된 영상 조회수가 높은 순입니다.',ratio:'캡처 조회수를 당시 표시된 채널 구독자 수로 나눈 값이 높은 순입니다.'})[mode];
  for (const b of byId('filters').children) b.setAttribute('aria-pressed',String(b.textContent === active));
  byId('videos').value = items.map(r=>r.video).join('\n');
  byId('channels').value = [...new Set(items.map(r=>r.channel))].join('\n');
  byId('msg').textContent = active + ' · ' + items.length + '편';
  const cards = byId('cards'); cards.replaceChildren();
  for (const [i,r] of items.entries()) {
    const card = node('article'), cover = link('',r.table?.source || r.image), img = node('img');
    img.src = r.image; img.alt = r.author+' · '+r.title; img.loading='lazy'; cover.title='참고 이미지 크게 보기'; cover.append(img);
    const body = node('div',null,'body'), meta=node('div',null,'meta');
    meta.append(node('strong',r.views == null ? '순위 외' : (i+1)+'위'),node('span',r.format+' · 성과도 '+r.grade+' · '+r.duration));
    const heading=node('h2'); heading.append(link(r.title,r.video));
    const author=link(r.author,r.channel); author.className='author';
    const stats=node('p',r.views == null ? '캡처에 성과 수치 미표시' : '조회 '+compact(r.views)+' · 구독 '+compact(r.subs)+' · '+(r.views/r.subs).toFixed(1)+'배','stats');
    const details=node('details'); details.append(node('summary','화면 문구 · 자막 · 제작 메모'));
    details.append(node('p','화면에서 읽은 문구\n'+r.screen),node('p','화면 구성\n'+r.note),node('p','영상 자막\n'+r.caption));
    if(r.summary) details.append(node('p','자막 요약 · '+r.summary));
    if(r.transcript) {
      const preview=node('details'), entry=node('pre');preview.append(node('summary','타임코드 자막 읽기'),entry);
      preview.ontoggle=async()=>{if(!preview.open || entry.textContent)return;try{const res=await fetch(r.transcript);if(!res.ok)throw Error();entry.textContent=await res.text();}catch{entry.textContent='아래 TXT 링크로 자막을 열 수 있습니다.';}};
      const download=link('자막 TXT 저장',r.transcript);download.download='ETF-'+r.id+'.txt';details.append(preview,download);
    }
    if(r.table) {
      const tableDetail=node('details');tableDetail.append(node('summary','원페이지 표 '+r.table.rows+'행 읽기'),node('pre',r.table.text),node('small','수치와 종목명은 원본 이미지 표기 기준입니다.'),link(' 원본 이미지 확대 ↗',r.table.source));details.append(tableDetail);
    }
    const actions=node('div',null,'actions'),heart=node('button',(saved.has(r.id)?'♥':'♡')+' 저장','heart');
    heart.setAttribute('aria-pressed',String(saved.has(r.id)));
    heart.onclick=()=>{if(saved.has(r.id))saved.delete(r.id);else saved.add(r.id);try{localStorage.setItem('youtube-etf-hearts',JSON.stringify([...saved]));}catch{} if(active==='♥ 저장')render();else{heart.textContent=(saved.has(r.id)?'♥':'♡')+' 저장';heart.setAttribute('aria-pressed',String(saved.has(r.id)));}};
    actions.append(heart,link('영상 ↗',r.video),link('채널 ↗',r.channel)); body.append(meta,heading,author,stats,node('small','게시 '+r.date+' · '+(r.transcript?'타임코드 자막':r.table?'표 '+r.table.rows+'행 판독':'자막 미확인')),details,actions);card.append(cover,body);cards.append(card);
  }
}
async function copy(id) {
  const area=byId(id); if(!area.value){byId('msg').textContent='복사할 링크가 없습니다.';return;}
  try {await navigator.clipboard.writeText(area.value); byId('msg').textContent=area.value.split('\n').length+'개 링크를 복사했습니다.';}
  catch {area.closest('details').open=true;area.focus();area.select();byId('msg').textContent='선택한 링크를 복사하세요.';}
}
for(const name of formats){const b=node('button',name);b.onclick=()=>{active=name;history.replaceState(null,'','#'+routes[formats.indexOf(name)]);render();};byId('filters').append(b);}
window.addEventListener('hashchange',()=>{active=selectedFormat();render();});
byId('videoCopy').onclick=()=>copy('videos'); byId('channelCopy').onclick=()=>copy('channels');byId('sort').onchange=render;
byId('intro').textContent=records.length+'편 · '+new Set(records.map(r=>r.channel)).size+'개 채널 · 표와 목록이 한 화면에 담긴 영상은 원페이지에서 볼 수 있습니다.';
render();
