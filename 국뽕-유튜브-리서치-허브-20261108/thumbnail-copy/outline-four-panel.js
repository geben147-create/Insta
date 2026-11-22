(() => {
 const script=document.currentScript, root=new URL('.',script.src);
 const id=/outline_(\d{2})\.html$/.exec(location.pathname)?.[1];
 if(!id)return;
 function mount(){
  const main=document.querySelector('main'), toc=document.querySelector('aside'); if(!main||!toc)return;
  const style=document.createElement('style');style.textContent=`
   .outline-four-grid{min-width:0}.outline-four-flow{min-width:0}.outline-four{margin:10px 0;border:1px solid #d7aabd;border-radius:7px;background:#fff3f7;color:#361525;min-width:0;overflow:hidden}.outline-four summary{padding:10px 12px;background:#fff447;color:#981024;font-size:14px;font-weight:850;cursor:pointer}.outline-four iframe{display:block;border:0;width:100%;height:clamp(28rem,72vh,42rem);background:#fff3f7}.outline-four-link{background:#fff0f5;color:#90102c!important;font-weight:800;margin:5px 0}.outline-four-link:hover{background:#ffe48c!important}@media(min-width:940px){main.outline-four-main{max-width:none}.outline-four-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(260px,32%);gap:14px;align-items:start}.outline-four{grid-column:2;grid-row:1;position:sticky;top:8px}.outline-four-flow{grid-column:1;grid-row:1}}@media(max-width:540px){.outline-four summary{padding:8px;font-size:13px}main.outline-four-main{max-width:none;padding-inline:10px}}`;
  document.head.append(style);
  const title=main.querySelector('h1');const flow=document.createElement('div');flow.className='outline-four-flow';
  for(const n of Array.from(main.children))if(n!==title)flow.append(n);
  const grid=document.createElement('div');grid.className='outline-four-grid';
  const panel=document.createElement('details');panel.id='title-thumbnail-four';panel.className='outline-four';panel.open=matchMedia('(min-width:940px)').matches&&!/^#(?:s[1-8]|cl|hook)$/.test(location.hash);
  const label=document.createElement('summary');label.textContent='제목 4안 · 썸네일 4안';panel.append(label);
  const openFrame=()=>{if(!panel.open||panel.querySelector('iframe'))return;const f=document.createElement('iframe');f.title=`아웃라인 ${id}번 제목과 썸네일 시안`;f.src=new URL(`four.html?topic=${id}&panel=1`,root);panel.append(f);};
  panel.addEventListener('toggle',openFrame);grid.append(panel,flow);main.classList.add('outline-four-main');main.append(grid);
  const link=document.createElement('a');link.className='outline-four-link';link.href='#title-thumbnail-four';link.textContent='제목·썸네일 4안 보기';link.addEventListener('click',()=>{panel.open=true;openFrame();});toc.insertBefore(link,toc.children[1]);
  if(location.hash==='#title-thumbnail-four')panel.open=true;
  openFrame();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
