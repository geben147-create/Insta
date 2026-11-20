'use strict';
const $=id=>document.getElementById(id);
const regions={US:'🇺🇸 미국',JP:'🇯🇵 일본',HK:'🇭🇰 홍콩',UK:'🇬🇧 영국',FR:'🇫🇷 프랑스',DE:'🇩🇪 독일',KR:'🇰🇷 한국',RU:'🇷🇺 러시아'};
const KEYS={d:'게시일',l:'좋아요',m:'댓글',p:'조회수',s:'공유'};
const hash=location.hash.slice(1);
let region=Object.hasOwn(regions,hash)?hash:'US', posts=[],pool=[],asc=false,table=false,limit=24,poolLimit=40;
if(window.parent!==window)document.body.classList.add('embed');
const fmt=n=>Number.isFinite(n)?n.toLocaleString('ko-KR'):'—';
function add(parent,tag,text,cls){const node=document.createElement(tag);if(text!=null)node.textContent=text;if(cls)node.className=cls;parent.append(node);return node;}
function link(parent,url,label){if(!/^https:\/\/www\.instagram\.com\/(p|reel|reels)\/[\w-]+\/?(?:embed\/captioned\/)?$/.test(url||'')&&!/^\.\.\/#\w$/.test(url||''))return null;const a=add(parent,'a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;}
function detail(parent,label,text){const d=add(parent,'details');add(d,'summary',label);add(d,'p',text,'reading');}
function name(x){return x.title||x.ko?.split('\n')[0].slice(0,170)||x.caption?.split('\n')[0].slice(0,170)||x.topic||x.c;}
function card(x,i,key){const a=add($('grid'),'article');const alt=name(x);add(a,'span',`${x[key]!=null?i+1+' · ':''}${x.t}`,'badge');const anchor=link(a,x.u,x.i?'':'원문 열기 ↗');if(x.i&&/^covers\/[\w-]+\.webp$/.test(x.i)&&anchor){const img=add(anchor,'img');img.src=x.i;img.alt=alt;img.loading=i<12?'eager':'lazy';img.addEventListener('error',()=>{img.remove();anchor.textContent='표지 불러오기 실패 · 원문 열기 ↗';anchor.className='preview-missing';});}else if(anchor)anchor.className='preview-missing';
 const b=add(a,'div',null,'info');add(b,'strong',alt);add(b,'div',`${x.d||'게시일 미확인'}${x.a?' · @'+x.a:''}`,'muted');add(b,'div',`♥ ${fmt(x.l)} · 댓글 ${fmt(x.m)} · 조회 ${fmt(x.p)} · 공유 ${fmt(x.s)}`);if(x.ko)detail(b,x.koType||'한국어 요약 펼치기',x.ko);else if(x.cc!=='KR')add(b,'div','한국어 번역 미확보','muted');if(x.caption)detail(b,'원문 캡션 펼치기',x.caption);const p=add(b,'p',null,'source');link(p,x.u,'게시물 ↗');if(x.source){p.append(' · ');link(p,x.source,x.legacyMetric?'기존 뷰어 수집값 ↗':'공개 지표 출처 ↗');}if(x.at)add(b,'div','확인: '+x.at.replace('T',' '),'muted');}
function tabulate(xs,key){const t=add($('table'),'table'), head=add(add(t,'thead'),'tr'), body=add(t,'tbody');for(const h of ['순위','게시물','형식',...Object.values(KEYS)])add(head,'th',h).scope='col';xs.forEach((x,i)=>{const tr=add(body,'tr');add(tr,'td',x[key]!=null?i+1:'—');const td=add(tr,'td');link(td,x.u,name(x));if(x.ko)detail(td,x.koType||'한국어 요약 펼치기',x.ko);if(x.caption)detail(td,'원문 캡션 펼치기',x.caption);add(tr,'td',x.t);for(const k of Object.keys(KEYS))add(tr,'td',k==='d'?(x.d||'—'):fmt(x[k]));});}
function render(){const key=$('sort').value,q=$('query').value.trim().toLowerCase(),type=$('type').value;const all=posts.filter(x=>x.cc===region);const filtered=all.filter(x=>(!type||x.t===type)&&[x.a,name(x),x.ko,x.caption].join(' ').toLowerCase().includes(q));
 filtered.sort((a,b)=>{const A=a[key],B=b[key];if((A==null||A==='')&&(B==null||B===''))return key==='d'?(asc?1:-1)*(a.dateEstimate||'').localeCompare(b.dateEstimate||''):Number(Boolean(b.i))-Number(Boolean(a.i));if(A==null||A==='')return 1;if(B==null||B==='')return -1;return (asc?1:-1)*(A>B?1:A<B?-1:0);});
 const count=filtered.filter(x=>x[key]!=null&&x[key]!=='').length;$('status').textContent=`${regions[region]} · ${filtered.length} / ${all.length}건 · ${KEYS[key]} 확인 ${count}건 · ${count?'미확인 항목은 순위 제외':'해당 지표로 순위 산정 불가'}`;
 $('grid').replaceChildren();$('table').replaceChildren();$('grid').hidden=table;$('table').hidden=!table;const show=filtered.slice(0,limit);if(table)tabulate(show,key);else show.forEach((x,i)=>card(x,i,key));if(!show.length)$('status').append(q||type?' · 필터에 맞는 게시물이 없습니다.':' · 확인된 게시물은 아직 없습니다.');$('more').hidden=filtered.length<=24;$('more').textContent=limit<filtered.length?`더 펼치기 (${limit} / ${filtered.length}건)`:'처음 24건만 보기';
 for(const b of $('regions').children)b.setAttribute('aria-pressed',String(b.dataset.region===region));
 renderPool();}
function renderPool(){const xs=pool.filter(x=>x.cc===region);$('links').replaceChildren();$('poolTitle').textContent=`기존 검색 후보 펼치기 (${xs.length}건 · 순위 제외)`;if($('pool').open)xs.slice(0,poolLimit).forEach(x=>{const li=add($('links'),'li');link(li,x.u,`${x.t} · ${x.c}`);});$('moreLinks').hidden=xs.length<=40;$('moreLinks').textContent=poolLimit<xs.length?`후보 더 보기 (${poolLimit} / ${xs.length}건)`:'후보 목록 접기';}
for(const [cc,label] of Object.entries(regions)){const b=add($('regions'),'button',label);b.type='button';b.dataset.region=cc;b.onclick=()=>{region=cc;history.replaceState(null,'','#'+cc);limit=24;poolLimit=40;$('pool').open=false;render();};}
$('more').onclick=()=>{limit=limit<posts.filter(x=>x.cc===region).length&&$('more').textContent.startsWith('더')?limit+24:24;render();};
$('moreLinks').onclick=()=>{poolLimit=$('moreLinks').textContent.startsWith('후보 더')?poolLimit+40:40;renderPool();};$('pool').ontoggle=renderPool;
$('dir').onclick=()=>{asc=!asc;$('dir').textContent=asc?'오름 ▲':'내림 ▼';render();};$('layout').onclick=()=>{table=!table;$('layout').textContent=table?'바둑판 보기':'표로 보기';$('layout').setAttribute('aria-pressed',String(table));render();};$('crop').onchange=e=>document.body.classList.toggle('crop',e.target.checked);
for(const k of ['query','type','sort'])$(k).addEventListener(k==='query'?'input':'change',()=>{limit=24;render();});
async function load(path){const r=await fetch(path);if(!r.ok)throw new Error(path);return r.json();}
Promise.all([load('posts.json'),load('candidates.json')]).then(([a,b])=>{posts=a;pool=b;render();}).catch(()=>{$('status').textContent='데이터를 불러오지 못했습니다. 새로고침해주세요.';});
