'use strict';
const onepageTopics={onepage:'전체', 'onepage-stocks':'주식', 'onepage-etf':'ETF', 'onepage-economy':'경제', 'onepage-property':'부동산', 'onepage-ai':'AI 도구', 'onepage-startup':'창업', 'onepage-grants':'지원금'};
const menuNamesKey='insta.menu.names.v1';
function setupMenuNames(side){
 const labels=[...side.querySelectorAll('.mi[data-k]')]; const folders=[...side.querySelectorAll('.grp')];
 const entries=[...folders.map((el,i)=>[el,el.dataset.key||'folder:'+location.pathname+':'+i]),...labels.map(el=>[el,'item:'+el.dataset.k])];
 for(const [el] of entries)el.dataset.defaultLabel=el.textContent;
 function get(){try{return JSON.parse(localStorage.getItem(menuNamesKey))||{};}catch{return {};}}
 function apply(){const names=get();for(const [el,k] of entries)el.textContent=typeof names[k]==='string'&&names[k]?names[k]:el.dataset.defaultLabel;}
 const b=document.createElement('button');b.type='button';b.textContent='✎ 메뉴 이름 편집';b.style.margin='6px';side.append(b);
 const pane=document.createElement('dialog');pane.style.cssText='max-width:90vw;max-height:85vh;background:#151922;color:#fff;border:1px solid #556076;border-radius:8px;padding:16px';document.body.append(pane);
 b.onclick=()=>{pane.replaceChildren();const form=document.createElement('form');form.style.cssText='display:grid;gap:8px';pane.append(form);const h=document.createElement('strong');h.textContent='왼쪽 메뉴 표시 이름 편집';form.append(h);const p=document.createElement('small');p.textContent='이 브라우저에만 저장됩니다. 이름을 바꿔도 주소와 내부 ID는 유지됩니다.';form.append(p);const names=get();const fields=[];
 for(const [el,k] of entries){const label=document.createElement('label');label.style.cssText='display:grid;grid-template-columns:minmax(100px,1fr) minmax(100px,1fr);gap:8px';const text=document.createElement('span');text.textContent=el.dataset.defaultLabel;const input=document.createElement('input');input.type='text';input.maxLength=60;input.value=names[k]||el.dataset.defaultLabel;label.append(text,input);form.append(label);fields.push([input,el,k]);}
 const row=document.createElement('div');form.append(row);for(const [text,action] of [['저장',null],['기본 이름으로',()=>{for(const [input,el] of fields)input.value=el.dataset.defaultLabel;}],['취소',()=>pane.close()]]){const btn=document.createElement('button');btn.textContent=text;btn.type=action?'button':'submit';if(action)btn.onclick=action;row.append(btn,' ');}
 form.onsubmit=e=>{e.preventDefault();const next=get();for(const [input,el,k] of fields){const v=input.value.trim();if(v&&v!==el.dataset.defaultLabel)next[k]=v;else delete next[k];}try{localStorage.setItem(menuNamesKey,JSON.stringify(next));}catch{p.textContent='이 브라우저에서 저장할 수 없습니다.';return;}apply();pane.close();};pane.showModal();};
 window.addEventListener('storage',e=>{if(e.key===menuNamesKey)apply();});apply();
}
