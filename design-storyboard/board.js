(() => {
  'use strict';
  const shelf = document.querySelector('.shelf');
  const groups = [...shelf.querySelectorAll('.group')];
  const rail = document.querySelector('.rail');
  const viewer = document.querySelector('.viewer');
  const viewport = viewer.querySelector('.viewer-scroll');
  const shot = viewport.querySelector('img');
  const title = viewer.querySelector('h2');
  const actual = viewer.querySelector('[data-actual-size]');
  const previous = viewer.querySelector('[data-prev]');
  const next = viewer.querySelector('[data-next]');
  const storageKey = 'insta-storyboard-v1';
  let current = [], position = 0, lastFocus = null;
  let saved;
  try { saved = JSON.parse(localStorage.getItem(storageKey)) || {}; } catch { saved = {}; }
  const sizes = ['one', 'two', 'three'];
  const narrow = matchMedia('(max-width: 390px)');
  const compact = matchMedia('(max-width: 720px)');
  let preferredSize = sizes.includes(saved?.size) ? saved.size : 'three';
  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify({ size: preferredSize, open: groups.filter(group => group.open).map(group => group.id) })); } catch { /* storage is optional */ }
  };
  function resizeBoard(size, persist = true) {
    if (!sizes.includes(size)) return;
    preferredSize = size;
    const max = narrow.matches ? 0 : compact.matches ? 1 : 2;
    const visibleSize = sizes[Math.min(sizes.indexOf(size), max)];
    shelf.dataset.size = visibleSize;
    rail.querySelectorAll('[data-size-set]').forEach(button => {
      button.disabled = sizes.indexOf(button.dataset.sizeSet) > max;
      button.setAttribute('aria-pressed', String(button.dataset.sizeSet === visibleSize));
    });
    if (persist) save();
  }
  const localLink = (id) => document.getElementById(id);
  function update(group) {
    const key = rail.querySelector(`[aria-controls="${group.id}"]`);
    key.textContent = group.open ? '−' : '+';
    key.setAttribute('aria-expanded', String(group.open));
    key.setAttribute('aria-label', `${group.querySelector('h2').textContent} ${group.open ? '접기' : '펼치기'}`);
  }
  for (const group of groups) {
    if (Array.isArray(saved.open)) group.open = saved.open.includes(group.id);
    update(group);
    group.addEventListener('toggle', () => { update(group); save(); });
  }
  resizeBoard(preferredSize, false);
  const syncSize = () => resizeBoard(preferredSize, false);
  for (const query of [narrow, compact]) query.addEventListener('change', syncSize);
  window.addEventListener('resize', syncSize);
  rail.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (button?.dataset.all) groups.forEach(group => { group.open = button.dataset.all === 'open'; update(group); });
    if (button?.dataset.sizeSet) resizeBoard(button.dataset.sizeSet);
    if (button?.hasAttribute('data-toggle')) {
      const group = localLink(button.getAttribute('aria-controls'));
      group.open = !group.open;
      update(group);
    }
    const link = event.target.closest('a[data-jump]');
    if (link) { const group = localLink(link.dataset.jump); group.open = true; update(group); }
  });
  const jump = () => {
    const target = localLink(location.hash.slice(1));
    if (!target) return;
    const group = target.closest('.group');
    if (group) {
      group.open = true;
      requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }));
    }
  };
  jump();
  window.addEventListener('hashchange', jump);
  function showImage() {
    const anchor = current[position];
    shot.src = anchor.href;
    shot.alt = anchor.querySelector('img').alt;
    title.textContent = `${anchor.dataset.title} · ${position + 1}/${current.length}`;
    previous.disabled = position === 0;
    next.disabled = position === current.length - 1;
    viewport.scrollTo({ top: 0, left: 0 });
  }
  shelf.addEventListener('click', (event) => {
    const anchor = event.target.closest('a[data-shot]');
    if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !viewer.showModal) return;
    event.preventDefault();
    lastFocus = anchor;
    current = [...anchor.closest('.group').querySelectorAll('a[data-shot]')];
    position = current.indexOf(anchor);
    viewer.dataset.actual = 'false';
    actual.setAttribute('aria-pressed', 'false');
    viewer.showModal();
    showImage();
  });
  previous.addEventListener('click', () => { if (position > 0) { position--; showImage(); } });
  next.addEventListener('click', () => { if (position < current.length - 1) { position++; showImage(); } });
  actual.addEventListener('click', () => {
    viewer.dataset.actual = String(viewer.dataset.actual !== 'true');
    actual.setAttribute('aria-pressed', viewer.dataset.actual);
  });
  viewer.querySelector('[data-close]').addEventListener('click', () => viewer.close());
  viewer.addEventListener('close', () => { shot.removeAttribute('src'); lastFocus?.focus({ preventScroll: true }); });
})();
