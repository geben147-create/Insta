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
 window.addEventListener('storage',e=>{if(e.key===menuNamesKey)apply();});apply();setupMenuOrder(side);
}

function setupMenuOrder(side){
 const groups=[...side.querySelectorAll(':scope > details.onepage-folder, :scope > section.menu-section')];if(!groups.length)return;
 const key='insta.menu.order.v1:'+location.pathname;
 const keyOf=g=>g.querySelector('.mi')?.dataset.k;
 const defaults=groups.map(g=>[keyOf(g),[...g.querySelectorAll('.mi')].map(x=>x.dataset.k)]);
 const read=()=>{try{return JSON.parse(localStorage.getItem(key))||{};}catch{return {};}};
 const reconcile=(desired,original)=>[...new Set([...(Array.isArray(desired)?desired.filter(k=>original.includes(k)):[]),...original])];
 const b=document.createElement('button');b.type='button';b.textContent='↕ 메뉴 순서 편집';b.style.margin='6px';side.append(b);
 const dlg=document.createElement('dialog');dlg.style.cssText='width:min(90vw,520px);max-height:84vh;background:#151922;color:#eee;padding:16px;border:1px solid #596278';document.body.append(dlg);
 function apply(saved){for(const k of reconcile(saved.groups,defaults.map(x=>x[0]))){const group=groups.find(x=>keyOfSaved(x)===k);side.insertBefore(group,side.querySelector('button:last-of-type'));const links=[...group.querySelectorAll('.mi')];const baseline=defaults.find(x=>x[0]===k)[1];for(const id of reconcile(saved.items?.[k],baseline))group.append(links.find(x=>x.dataset.k===id));}}
 const ids=new Map(groups.map(g=>[g,keyOf(g)]));const keyOfSaved=g=>ids.get(g);
 function list(host,keys,label){const ol=document.createElement('ol');host.append(ol);for(const id of keys){const li=document.createElement('li');li.dataset.id=id;li.draggable=true;li.style.cssText='cursor:grab;padding:4px;border-bottom:1px solid #333';const text=document.createElement('span');text.textContent='☰ '+label(id)+' ';li.append(text);for(const [arrow,direction] of [['↑',-1],['↓',1]]){const button=document.createElement('button');button.type='button';button.textContent=arrow;button.setAttribute('aria-label',direction<0?'위로 이동':'아래로 이동');button.onclick=()=>{const sibling=direction<0?li.previousElementSibling:li.nextElementSibling;if(sibling)ol.insertBefore(direction<0?li:sibling,direction<0?sibling:li);};li.append(button);}
 li.ondragstart=e=>{ol.dragged=li;e.dataTransfer.setData('text/plain',id);};li.ondragend=()=>{ol.dragged=null;};li.ondragover=e=>{if(ol.dragged)e.preventDefault();};li.ondrop=e=>{if(!ol.dragged||ol.dragged===li)return;e.preventDefault();const r=li.getBoundingClientRect();ol.insertBefore(ol.dragged,e.clientY>r.top+r.height/2?li.nextSibling:li);ol.dragged=null;};ol.append(li);}return ol;}
 function editor(saved){dlg.replaceChildren();const heading=document.createElement('h2');heading.textContent='메뉴 순서 편집';dlg.append(heading,'☰ 줄을 드래그하거나 ↑ ↓를 누르세요. 저장은 이 브라우저에만 적용됩니다.');const gl=list(dlg,reconcile(saved.groups,defaults.map(x=>x[0])),id=>groups.find(g=>keyOfSaved(g)===id).querySelector('.grp').textContent); const ls=[];
 for(const [k,items] of defaults){const g=groups.find(x=>keyOfSaved(x)===k);const d=document.createElement('details');const h=document.createElement('summary');h.textContent=g.querySelector('.grp').textContent+' 안의 항목';d.append(h);dlg.append(d);ls.push([k,list(d,reconcile(saved.items?.[k],items),id=>[...g.querySelectorAll('.mi')].find(x=>x.dataset.k===id).textContent)]);}
 const arr=l=>[...l.children].map(x=>x.dataset.id);for(const [text,fn] of [['저장',()=>{const value={groups:arr(gl),items:Object.fromEntries(ls.map(([k,l])=>[k,arr(l)]))};localStorage.setItem(key,JSON.stringify(value));apply(value);dlg.close();}],['기본 순서',()=>editor({})],['취소',()=>dlg.close()]]){const btn=document.createElement('button');btn.type='button';btn.textContent=text;btn.onclick=fn;dlg.append(btn,' ');}}
 b.onclick=()=>{editor(read());dlg.showModal();};apply(read());
}
