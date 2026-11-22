'use strict';
const {groups,formulas,measure}=window.OUTLINE_FOUR;
const $=id=>document.getElementById(id), params=new URLSearchParams(location.search);
const compact=params.get('panel')==='1' && window!==window.top;
if(compact)document.body.classList.add('compact');
const select=$('topic'), options=$('options');
const el=(tag,text='',cls='')=>{const e=document.createElement(tag);e.textContent=text;if(cls)e.className=cls;return e;};
function button(label,action){const b=el('button',label);b.type='button';b.addEventListener('click',action);return b;}
async function copy(value){try{await navigator.clipboard.writeText(value);$('copy-status').textContent='복사 완료';return true;}catch{$('copy-status').classList.remove('sr');$('copy-status').textContent='자동 복사가 막혀 있습니다. 원하는 문구를 선택해 복사해 주세요.';return false;}}
function copyButton(label,value){const b=button(label,async()=>{if(await copy(value)){b.textContent='복사됨';setTimeout(()=>{b.textContent=label;},1100);}});return b;}
function fit(ctx,line,ceiling){let size=ceiling;while(size>28){ctx.font=`900 ${size}px "Noto Sans KR","Malgun Gothic",sans-serif`;if(ctx.measureText(line).width<1125)break;size-=2;}}
async function png(g,r){
 await document.fonts.ready;
 const c=document.createElement('canvas');c.width=1280;c.height=720;const ctx=c.getContext('2d');
 ctx.fillStyle='#fff447';ctx.fillRect(0,0,1280,720);ctx.fillStyle='#fce3ef';ctx.fillRect(0,0,1280,104);ctx.fillRect(0,580,1280,140);
 ctx.fillStyle='#991124';ctx.textBaseline='middle';ctx.font='750 32px "Noto Sans KR","Malgun Gothic",sans-serif';ctx.fillText(`${g.id}번 · ${g.topic} · ${r.slot}안`,76,53);
 fit(ctx,r.lines[0],90);ctx.fillText(r.lines[0],76,260);fit(ctx,r.lines[1],79);ctx.fillText(r.lines[1],76,420);
 fit(ctx,r.lines[2],46);ctx.fillText(r.lines[2],76,650);
 const blob=await new Promise(resolve=>c.toBlob(resolve,'image/png'));if(!blob)return;
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`outline-${g.id}-thumbnail-${r.slot}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
}
function card(g,r){
 const a=el('article','','option');a.dataset.slot=r.slot;
 const h=el('h2');h.append(el('b',r.slot),document.createTextNode(r.formula));
 const thumb=el('div','','thumb');thumb.append(el('span',r.lines[0]),el('span',r.lines[1]),el('small',r.lines[2]));
 const len=r.lines.reduce((sum,l)=>sum+[...l].length,0);
 const actions=el('div','','actions');actions.append(copyButton('제목 복사',r.title),copyButton('썸네일 문구 복사',r.lines.join('\n')),button('시안 PNG',()=>png(g,r)));
 a.append(h,thumb,el('p',r.title,'title'),el('div',`제목 ${[...r.title].length}자 · 썸네일 ${len}자`,'details'),actions);return a;
}
function display(i,remember){
 const g=groups[i];select.selectedIndex=i;options.replaceChildren(...g.items.map(r=>card(g,r)));
 $('total').textContent=compact?`${g.id}번 · ${g.topic}`:`${g.id}번 ${g.topic} · 전체 ${groups.length}개 주제, ${groups.reduce((s,g)=>s+g.items.length,0)}쌍`;
 $('outline').href=compact?`../?page=four&topic=${g.id}`:`../?outline=${g.id}`;
 $('outline').textContent=compact?'큰 화면에서 비교':'선택한 아웃라인';
 $('earlier').disabled=i===0;$('later').disabled=i===groups.length-1;
 if(remember){const url=new URL(location.href);url.searchParams.set('topic',g.id);history.replaceState(null,'',url);
  if(window!==window.top&&!compact)window.parent.postMessage({type:'hub-four-topic',topic:g.id},location.origin);
 }
}
for(const g of groups){const o=el('option',`${g.id}번 · ${g.topic}`);o.value=g.id;select.append(o);}
select.onchange=()=>display(select.selectedIndex,true);$('earlier').onclick=()=>display(select.selectedIndex-1,true);$('later').onclick=()=>display(select.selectedIndex+1,true);
for(const [label,body] of formulas){const li=el('li');li.append(el('strong',label),document.createTextNode(` · ${body}`));$('guide').append(li);}
$('lengths').textContent=`첨부의 판독 가능한 썸네일 ${measure.referenceThumbN}개 중앙값 ${measure.referenceThumbMedian}자, 한글 제목 ${measure.referenceTitleN}개 중앙값 ${measure.referenceTitleMedian}자입니다. 이번 후보는 제목 ${measure.titleMin}~${measure.titleMax}자, 썸네일 ${measure.thumbMin}~${measure.thumbMax}자입니다. 썸네일은 공백 포함, 줄 구분자 제외입니다. 영문·말줄임표로 잘린 제목은 길이 기준에서 뺐습니다.`;
display(Math.max(0,groups.findIndex(g=>g.id===params.get('topic'))),false);
