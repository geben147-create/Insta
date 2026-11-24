const $=id=>document.getElementById(id);
const add=(where,tag,text,cls)=>{const e=document.createElement(tag);if(text!=null)e.textContent=text;if(cls)e.className=cls;where.append(e);return e;};
const url=(where,text,href,external=false)=>{const a=add(where,'a',text);a.href=href;if(external){a.target='_blank';a.rel='noopener noreferrer';}return a;};
const fmt=n=>Number.isFinite(n)?n.toLocaleString('ko-KR'):'—';
const original=id=>`https://www.instagram.com/reel/${id}/`;
const state=x=>x.shots?.length?'컷·동작 상세':x.cv?'🔴 세부 컷 검수 전':x.legacy?'기존 Watch·OpenCV':'🔴 Watch/OpenCV 미확보';
const format=t=>t.toFixed(2)+'초';
const label=(e,k,v)=>{const p=add(e,'p');add(p,'b',k+' ');p.append(v);};
const img=(p,x,alt,cls='')=>{const a=url(p,null,x,true),i=add(a,'img',null,cls);i.src=x;i.alt=alt;i.loading='lazy';return i;};
const fold=(p,name)=>{const d=add(p,'details');add(d,'summary',name);return d;};
let rows=[];
function render(){
 const min=Number($('threshold').value), sort=$('sort').value, only=$('reviewed').checked;
 const r=rows.filter(x=>(!min||x.likes>=min)&&(!only||x.shots?.length)).sort((a,b)=>sort==='date'?(b.date||'').localeCompare(a.date||'')||(b.likes??-1)-(a.likes??-1):(b[sort]??-1)-(a[sort]??-1));
 $('status').textContent=`${r.length}편 / ${rows.length}편 · 컷·동작 상세 ${r.filter(x=>x.shots?.length).length}편 · 50만+ ${r.filter(x=>x.likes>=500000).length}편`;
 $('ranking').replaceChildren();$('cards').replaceChildren();
 if(!r.length){const td=add(add($('ranking'),'tr'),'td','조건에 맞는 영상이 없습니다.');td.colSpan=6;return;}
 r.forEach((x,j)=>{
  const tr=add($('ranking'),'tr');add(tr,'td',j+1);const title=add(tr,'td');url(title,x.title,'#'+x.id);add(title,'small',` · ${x.date||'게시일 미확인'}`);[x.likes,x.views,x.comments].forEach(v=>add(tr,'td',fmt(v)));add(tr,'td',state(x));
  const a=add($('cards'),'article');a.id=x.id;const t=add(a,'div',null,'top');if(x.cover)img(t,x.cover,x.title+' 표지','cover');const header=add(t,'div');add(header,'h2',x.title);add(header,'span',state(x),'chip');add(header,'p',`@${x.account||'미확인'} · ${x.date||'게시일 미확인'} · 좋아요 ${fmt(x.likes)} · 임베드 조회 ${fmt(x.views)} · 댓글 ${fmt(x.comments)}`);
  if(x.altPlays)add(header,'p',`별도 원본 캡처의 재생 ${fmt(x.altPlays)}회 · 임베드 조회와 별개`,'muted');
  if(x.cv)add(header,'p',`${format(x.cv.duration)} · ${x.cv.resolution.join('×')} · ${x.cv.fps}fps · OpenCV 컷 후보 ${x.cv.cuts}개 (확정 컷 수 아님)`,'muted');
  const links=add(header,'p',null,'links');url(links,'인스타 원본 ↗',original(x.id),true);if(x.source)url(links,x.sourceLabel||'공개 지표 출처 ↗',x.source,true);if(x.legacy){url(links,'기존 Watch ↗',x.legacy.watch,true);url(links,'기존 OpenCV ↗',x.legacy.cv,true);}
  if(x.cv){url(links,'OpenCV JSON ↗',`assets/${x.id}/summary.json`,true);url(links,'0.1초 CSV ↗',`assets/${x.id}/timeline-0.1s.csv`,true);url(links,'컷 후보 JSON ↗',`assets/${x.id}/cut-candidates.json`,true);}
  if(x.note)add(a,'p',x.note);
  if(x.ko)add(fold(a,'한국어 캡션 / 요약 펼치기'),'p',x.ko);
  if(x.caption)add(fold(a,'게시물 캡션 원문 펼치기'),'pre',x.caption);
  if(x.sheet){const d=fold(a,'Watch 전체 샘플 펼치기');img(d,x.sheet,'Watch 시간순 실측 프레임');add(d,'p','Watch 로컬 엔진. 아래 샷 설명과 별도로 확인할 수 있는 시간순 프레임입니다. 영상 내 대사·음악 분석은 포함하지 않습니다.','muted');}
  if(!x.shots?.length)return;
  const d=fold(a,`${x.kind} ${x.shots.length}개 · 프레임·자세·카메라·AI 프롬프트`);d.className='shotfold';if(x.id==='DgCigCoM34X')d.open=true;
  const all=x.shots.map((s,i)=>`S${i+1} ${format(s.start)}–${format(s.end)} | ${s.title}\n${s.prompt}\n`).join('\n');const button=add(d,'button','AI 제작 프롬프트 전부 복사');button.type='button';button.onclick=async()=>{try{await navigator.clipboard.writeText(all);button.textContent='복사됨';}catch{button.textContent='복사 실패 · 각 프롬프트를 선택해 복사하세요';}};
  for(const [i,s] of x.shots.entries()){const box=add(d,'div',null,'shot');img(box,s.image,`S${i+1} 시작·중간·끝 실프레임`);const body=add(box,'div');add(body,'h3',`S${i+1} · ${s.title}`);add(body,'small',`${format(s.start)} → ${format(s.end)} · 길이 ${format(s.end-s.start)}`);label(body,'동작·포즈',s.action);label(body,'카메라·구도',s.camera);if(s.flow!=null)label(body,'화면 전체 움직임',`${s.flow} (구간 중앙값, 인물 관절 이동량 아님)`);add(fold(body,'AI 영상 프롬프트'),'pre',s.prompt);}
 });
}
function jump(){const k=location.hash.slice(1);if(!/^[\w-]+$/.test(k))return;let a=$(k);if(!a&&rows.some(x=>x.id===k)){$('threshold').value='0';$('reviewed').checked=false;render();a=$(k);}if(a){const d=a.querySelector('.shotfold');if(d)d.open=true;a.scrollIntoView({block:'start'});}}
for(const id of ['threshold','sort','reviewed'])$(id).addEventListener('change',render);
addEventListener('hashchange',jump);
fetch('data.json?v=motion1').then(r=>{if(!r.ok)throw Error(r.status);return r.json();}).then(data=>{rows=data;render();jump();}).catch(()=>{$('status').textContent='분석 데이터를 불러올 수 없습니다. 새로고침해 주세요.';});