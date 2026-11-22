const dialog = document.getElementById('videoPlayer');
const slot = document.getElementById('playerSlot');
const original = document.getElementById('videoOriginal');
document.querySelectorAll('.play').forEach(button => button.addEventListener('click', () => {
  const id = button.dataset.video;
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return;
  original.href = 'https://www.youtube.com/watch?v=' + id;
  const frame = document.createElement('iframe');
  frame.className = 'player';
  frame.title = button.getAttribute('aria-label');
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  frame.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&playsinline=1';
  slot.replaceChildren(frame);
  dialog.showModal();
}));
document.getElementById('closePlayer').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => slot.replaceChildren());
