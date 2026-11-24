(() => {
  'use strict';
  const guide = document.getElementById('automation-guide');
  if (!guide) return;
  function showChapter() {
    const chapter = [...guide.querySelectorAll('details')]
      .find(item => `#${item.id}` === location.hash);
    if (chapter) {
      guide.open = true;
      chapter.open = true;
      chapter.scrollIntoView({block: 'start'});
    }
  }
  guide.querySelectorAll('.ag-menu a').forEach(link => {
    link.addEventListener('click', () => {
      const chapter = document.getElementById(link.hash.slice(1));
      chapter.open = true;
      chapter.querySelector('summary').focus({preventScroll: true});
    });
  });
  addEventListener('hashchange', showChapter);
  showChapter();
  guide.querySelectorAll('.ag-copy').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const prompt = button.closest('.ag-prompt').querySelector('code');
      const status = button.nextElementSibling;
      status.textContent = '';
      try {
        await navigator.clipboard.writeText(prompt.textContent);
        status.textContent = '복사했어요.';
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(prompt);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = '복사 권한이 없어요. 선택된 텍스트를 직접 복사하세요.';
      }
    });
  });
})();
