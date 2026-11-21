(() => {
  const group = document.getElementById('script-video-workflow-pin');
  if (!group) return;
  const prefix = 'script-video-workflow-review-v1:';
  function save(k,v){try{localStorage.setItem(prefix+k,v)}catch{}}
  function load(k){try{return localStorage.getItem(prefix+k)}catch{return null}}
  if (!group.querySelector('[data-workflow-label=group]')) {
  let order;
  try { order = JSON.parse(localStorage.getItem('kukppong-hub-menu-order-v1') || 'null')?.groups; } catch {}
  if (!Array.isArray(order) || !order.includes(group.id) || order[0] === group.id) group.parentElement.prepend(group);
  group.open = load('open') === 'true' || location.hash.startsWith('#gpt-sol-review');
  group.addEventListener('toggle',()=>save('open',String(group.open)));
  }
  group.querySelectorAll('[data-label-key]').forEach(label=>{
    const k=label.dataset.labelKey, parent=label.closest('a,summary');
    const stored=load(k);if(stored)label.textContent=stored;
    let timer;
    function edit(){
      clearTimeout(timer);if(label.isContentEditable)return;
      const previous=label.textContent;label.contentEditable='true';label.focus();getSelection().selectAllChildren(label);
      const draggable=parent.draggable;parent.draggable=false;
      label.onblur=()=>{label.contentEditable='false';parent.draggable=draggable;label.textContent=label.textContent.trim().slice(0,110)||previous;save(k,label.textContent)};
    }
    label.addEventListener('dblclick',e=>{e.preventDefault();e.stopPropagation();edit()});
    label.addEventListener('click',e=>{
      if(e.detail===0&&!label.isContentEditable)return;
      if(parent.tagName==='A'&&(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey))return;
      e.preventDefault();e.stopPropagation();clearTimeout(timer);
      if(e.detail===1&&!label.isContentEditable)timer=setTimeout(()=>parent.click(),300);
    });
    label.addEventListener('keydown',e=>{
      if(!label.isContentEditable)return;
      if(e.key==='Enter'||e.key==='Escape'){
        e.preventDefault();e.stopPropagation();if(e.key==='Escape')label.textContent=load(k)||label.dataset.defaultLabel;label.blur();
      }
    });
    label.dataset.defaultLabel=label.textContent;
  });
})();
