'use strict';
const D=window.COPY_DATA, $=s=>document.getElementById(s), per=24;
let tab='ideas',page=0;
const norm=t=>String(t??'').normalize('NFC').toLowerCase();
const el=(tag,t='',cls='')=>{const n=document.createElement(tag);n.textContent=t;if(cls)n.className=cls;return n;};
const link=(t,href,external=false)=>{const a=el('a',t);a.href=href;a.target=external?'_blank':'_top';if(external)a.rel='noopener';return a;};
$('summary').textContent=`제작 후보 ${D.ideas.length}쌍 · 기존 영상 제목 ${D.bench.length}개 · 참고 발췌 ${D.refs}개 · 공식 ${D.formulas.length}개`;
function copyBtn(label,value){
 const b=el('button',label);b.onclick=async()=>{try{await navigator.clipboard.writeText(value);b.textContent='복사됨';$('notice').textContent='클립보드에 복사했습니다.';setTimeout(()=>{b.textContent=label;},900);}catch{$('notice').textContent='자동 복사가 막혀 있습니다. 문구를 선택해서 복사해 주세요.';}};return b;
}
function card(x){
 const n=el('article','','card'), a=el('div','','actions');
 n.append(el('div',`${x.id} · ${x.field} · ${x.topic}`,'meta'));
 n.append(el('span',tab==='ideas'?'썸네일 문구':'참고 발췌','lbl'),el('strong',x.thumb||'별도 발췌 없음','thumb'),el('span','영상 제목','lbl'),el('h2',x.title));
 if(x.thumb)a.append(copyBtn('문구 복사',x.thumb)); a.append(copyBtn('제목 복사',x.title));
 if(tab==='ideas')a.append(copyBtn('둘 다 복사',`${x.thumb}\n${x.title}`),link('아웃라인 근거',`../?outline=${x.outline}`));
 else a.append(link('영상 확인',`https://www.youtube.com/watch?v=${x.id}`,true));
 n.append(a);return n;
}
function analysis(){
 const list=el('ul','','formula');
 for(const f of D.formulas){const li=el('li');li.append(el('b',f.label),el('div',f.desc),el('small',f.example));list.append(li);}
 const sample=el('div','','cards');
 for(const x of D.samples){const a=el('article','','card');a.append(el('span',x.topic,'meta'),el('strong',x.quote||x.secondary,'thumb'),el('h2',x.title),el('p',x.layout),link('원본 영상',`https://www.youtube.com/watch?v=${x.id}`,true)); sample.append(a);}
 $('analysis').replaceChildren(el('h2','클릭 공식 12개'),list,el('h2','실물 분석 표본 5편'),sample);
}
function filters(){
 const node=$('field');node.replaceChildren(el('option','모든 분야'));node.firstChild.value='';
 if(tab!=='analysis'){const fields=[...new Set(D[tab].map(x=>x.field).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'ko'));for(const f of fields){const o=el('option',f);o.value=f;node.append(o);}}
 $('excerpt').hidden=tab!=='bench';
}
function draw(){
 const off=tab==='analysis';for(const k of ['filters','cards','count','pager'])$(k).hidden=off;$('analysis').hidden=!off;
 if(off){analysis();return;}
 const words=norm($('q').value).trim().split(/\s+/).filter(Boolean), field=$('field').value;
 const rows=D[tab].filter(x=>(!field||field===x.field)&&(!(tab==='bench'&&$('hasText').checked)||x.thumb)&&words.every(w=>norm([x.title,x.thumb,x.field,x.topic,x.outline].join(' ')).includes(w)));
 const pages=Math.max(1,Math.ceil(rows.length/per)); page=Math.max(0,Math.min(page,pages-1));
 $('cards').replaceChildren(...rows.slice(page*per,(page+1)*per).map(card));
 $('count').textContent=rows.length?`${rows.length}개 · ${page*per+1}–${Math.min(rows.length,(page+1)*per)} 표시`:'일치하는 결과가 없습니다.';
 $('position').textContent=`${page+1} / ${pages}`;$('previous').disabled=!page;$('next').disabled=page>=pages-1;
}
for(const b of document.querySelectorAll('[data-tab]'))b.onclick=()=>{tab=b.dataset.tab;page=0;$('q').value='';$('hasText').checked=false;for(const t of document.querySelectorAll('[data-tab]'))t.setAttribute('aria-pressed',String(t===b));filters();draw();};
$('q').oninput=$('field').onchange=$('hasText').onchange=()=>{page=0;draw();};
$('previous').onclick=()=>{page--;draw();$('count').scrollIntoView({block:'center'});};
$('next').onclick=()=>{page++;draw();$('count').scrollIntoView({block:'center'});};
filters();draw();
