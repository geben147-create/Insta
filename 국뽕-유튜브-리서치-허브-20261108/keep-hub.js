(() => {
  const root = new URL('../', document.currentScript.src);
  const hub = new URL('국뽕-유튜브-리서치-허브-20261108/', root);
  const path = location.pathname.slice(root.pathname.length);
  const query = hub.searchParams;
  const detail = /^kukppong-batch-20261122\/outlines\/outline_(\d{2})\.html$/.exec(path);
  if (detail) {
    query.set('outline', detail[1]);
    if (/^#(?:sum|hook|cl|s[1-8])$/.test(location.hash)) query.set('section',location.hash);
  } else if (/^kukppong-batch-20261122\/listening\/(?:index\.html)?$/.test(path)) query.set('page','tts');
  else if (/^kukppong-batch-20261122\/(?:index\.html)?$/.test(path)) query.set('page', ({'#sc':'scripts','#ev':'evidence'})[location.hash] || 'outlines');
  else if (/^kukppong-hanil-20261121\/(?:index\.html)?$/.test(path)) query.set('page','hanil');
  else if (path.endsWith('/prompts_123.html')) query.set('page',/^#p[123]$/.test(location.hash)?location.hash.slice(1):'p1');
  const moreRoutes = {
    '국뽕-유튜브-리서치-허브-20261108/thumbnail-copy/':'thumbnail',
    'kukppong-thumbnail-formulas-20261113/':'thumbnail-formulas',
    'research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-analysis.html':'thumbnail-design',
    'research-hub-20261108/hermes-sonnet55-20261121/':'outline5',
    'research-hub-20261108/hermes-sonnet55-20261121/outline_5ways.html':'outline5-detail',
    'research-hub-20261108/script-video-workflow-8steps/gpt-6-2-sol-20261121/':'sol',
    'research-hub-20261108/script-video-workflow-8steps/':'workflow'
  };
  const key=decodeURI(path).replace(/index\.html$/,'');
  if(moreRoutes[key])query.set('page',moreRoutes[key]);
  if (window === window.top && query.size) { location.replace(hub.href); return; }
  // A link back to the full hub should replace the shell, never nest another shell.
  document.addEventListener('click', e => {
    const a = e.target.closest?.('a[href]'); if (!a) return;
    const url = new URL(a.href);
    if (url.origin === hub.origin && [hub.pathname,hub.pathname+'index.html'].includes(url.pathname)) a.target='_top';
  });
})();
