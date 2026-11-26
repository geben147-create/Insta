(() => {
  const input = document.getElementById('localComparison');
  const player = document.getElementById('localComparisonPlayer');
  const status = document.getElementById('localPlaybackStatus');
  let objectUrl;

  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    player.src = objectUrl;
    player.hidden = false;
    status.textContent = '선택한 파일 · ' + file.name;
    player.play().catch(() => {});
  });

  player.addEventListener('error', () => {
    status.textContent = '이 파일을 재생할 수 없습니다. H.264 MP4 또는 WebM 파일을 선택하세요.';
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted && objectUrl) URL.revokeObjectURL(objectUrl);
  });
})();
