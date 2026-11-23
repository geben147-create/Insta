/* 🌸 한일 비교 51~100: 기존 기획서·3개 제작 프롬프트를 보존하는 편별 추가 지시 상자.
   현재 페이지의 실제 h1·구간 제목·미확인 메모를 이용하므로 모든 편에서 동일한 지시만 복제하지 않는다. */
(function () {
  'use strict';
  const found = location.pathname.match(/\/kukppong-batch-20261122\/outline50\/outlines\/outline_(\d+)\.html$/);
  if (!found) return;
  const episode = Number(found[1]);
  if (episode < 51 || episode > 100 || document.getElementById('ht-production-addendum')) return;

  const main = document.querySelector('main');
  const h1 = main && main.querySelector('h1');
  if (!main || !h1) return;
  const title = h1.textContent.trim();
  const stages = [];
  for (let i = 1; i <= 8; i++) {
    const heading = document.querySelector('#s' + i + ' h2');
    if (heading) stages.push(heading.textContent.trim());
  }
  const memo = document.querySelector('#memo');
  const unknownH3 = memo && [...memo.querySelectorAll('h3')].find(x => x.textContent.includes('미확인'));
  const notes = unknownH3 && unknownH3.nextElementSibling && unknownH3.nextElementSibling.tagName === 'UL'
    ? [...unknownH3.nextElementSibling.querySelectorAll(':scope > li')].slice(0, 2).map(x => x.textContent.trim().slice(0, 260))
    : [];

  const special = {
    100: [
      '서울·도쿄 순위를 쓸 때 Condé Nast 미국판과 영국판은 조사와 결과가 다르므로 섞지 말 것. 미국판 원문 직접 대조가 미완료인 자료는 미확인으로 표시.',
      '성수·홍대·한남을 실제 다른 장소·경험으로 보여주고, 홍대 일부 업소의 나이 제한을 홍대 전체 규정으로 일반화하지 말 것.',
      '한남동 눈·도로 열선 이야기는 확인되지 않은 전언으로 취급하고, 실제 근거 없이 사실처럼 연출하지 말 것.'
    ],
    99: [
      '1위안 환율과 도쿄·서울 비용을 비교할 때 같은 날짜·단위·품목·출처를 붙일 것. 생활비 지수와 관광객 하루 지출은 서로 다른 지표임을 구분.',
      '446.5위안 영수증과 60위안 사과는 원본 맥락을 대조하고, 고급 상품을 모든 사과의 평균 가격처럼 일반화하지 말 것.',
      '한국에 불리한 비교 항목도 삭제하지 말고 균형 있게 제시하며 실제 영수증·가격표·근거 카드를 편집 가능한 레이어로 둘 것.'
    ]
  };
  const originalUrl = location.href.split('#')[0].split('?')[0];
  const lines = [
    '🌸 [' + episode + '편] 기존 코덱스 제작 지시문에 덧붙일 추가 지시만 전달한다.',
    '이미 보낸 원본 기획서와 제작 프롬프트 3개는 유지하라. 중복 생성·처음부터 재작성하지 마라.',
    '기획서: ' + originalUrl,
    '원본 제목: ' + title,
    '',
    '① 지금 영상 생성 중이면 현재 작업을 종료하거나 재시작하지 말고 진행 상태를 먼저 확인하라. 아래 조건을 가능한 범위에서 최종 렌더 전에 반영하고, 불가능하면 누락 사항을 후속 편집 목록으로 남겨라.',
    '② AI 생성 단계에서는 자막·강조 제목·댓글 카드·출처 카드·로고 등 추가 편집 글자를 영상에 미리 합치지 말라. 원래 촬영된 간판·화면 속 글씨와 구분하라.',
    '③ clean_master.mp4(무자막 베이스), captions.srt(자막 문구·타임), style.json(글꼴·색상·위치), titles.json(강조 제목·효과), timeline.json(컷·레이어), 각 음성 파일(AI 보이스·사람 목소리 슬롯·BGM·효과음), sources.json을 따로 보관하라. 기존 파일 이름이 다르면 매핑표를 만들어라.',
    '④ HUMAN_VOICE_SLOT을 오프닝·핵심 해설·마무리의 후보로 남겨 TTS와 겹치지 않게 하라. 사람 녹음을 아직 하지 않았다고 임의 음성을 만들어 채우지 마라.',
    '⑤ 이미 검증된 기존 폰트·연출 9종·편집 마스터를 재사용하고 필요한 장면에만 강조·VS·댓글·그래프를 배치하라. 3~4초 강제 컷·무의미한 반전·배속·고의 40px 어긋남은 하지 마라.',
    '⑥ 완성된 영상의 첫 30초 미리보기에서 번인 자막 중복, SRT 싱크, 줄바꿈, 음성·음악 분리, 사람 얼굴·원문 글씨 가림 여부를 점검하라.',
    '⑦ 이 영상만 먼저 처리하라. 다른 49편의 생성·재렌더·유료 API 호출·게시·GitHub push·기존 원본 삭제는 하지 마라.',
    '⑧ 실제로 생성한 결과 파일·위치·PASS/FAIL/미검증을 보고하라. HumanTouch가 미완성이면 파일만 보존하고 검증되지 않은 프로그램으로 자동 전송했다고 표시하지 마라.'
  ];
  if (special[episode]) {
    lines.push('', '【' + episode + '편 전용 유의사항】');
    special[episode].forEach((v, i) => lines.push((i + 1) + '. ' + v));
  }
  if (stages.length) {
    lines.push('', '【이 편의 기존 영상 기획서 실제 구간 (원문 흐름 유지)】');
    stages.forEach(x => lines.push('- ' + x));
  }
  if (notes.length) {
    lines.push('', '【기획서의 미확인 기록에서 가져온 점검 대상】');
    notes.forEach(x => lines.push('- ' + x));
  }
  lines.push('', '최종 결과: 이번 편 1개에 대해서만 단계별 산출물·다음 HumanTouch 인계 준비 상태를 표로 보고하라.');
  const prompt = lines.join('\n');

  const css = document.createElement('style');
  css.textContent = '#ht-production-addendum{background:linear-gradient(145deg,#512024,#2b161b)!important;color:#fff2f2;border:2px solid #ff6372;border-left:7px solid #ff5065;box-shadow:0 2px 16px #0006;border-radius:12px;padding:14px 16px;margin:14px 0 18px;line-height:1.6}' +
    '#ht-production-addendum h2{margin:0 0 6px;color:#fff;font-size:20px}' +
    '#ht-production-addendum .ht-sub{color:#f9cfd5;font-size:13px;margin:4px 0 10px}' +
    '#ht-production-addendum .ht-actions{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0}' +
    '#ht-production-addendum button{background:#ffdf6b;color:#20140b;font-size:15px;font-weight:900;border:0;border-radius:9px;padding:10px 13px;cursor:pointer}' +
    '#ht-production-addendum a.ht-link{display:inline-block;background:#402d35;color:#fff;text-decoration:none;border:1px solid #af7a83;border-radius:9px;padding:9px 13px}' +
    '#ht-production-addendum details{border-top:1px solid #994653;margin-top:10px;padding-top:10px}' +
    '#ht-production-addendum summary{cursor:pointer;color:#ffdbad;font-weight:800}' +
    '#ht-production-addendum textarea{display:block;width:100%;min-height:300px;background:#100f13;color:#f7f0f0;border:1px solid #a75861;border-radius:9px;padding:12px;line-height:1.65;font:13px/1.65 ui-monospace,monospace;margin-top:10px;box-sizing:border-box}' +
    '#ht-production-addendum .ht-points{margin:9px 0;padding-left:18px;font-size:13px;color:#f6cbd0}' +
    '#ht-production-addendum .ht-result{font-size:13px;color:#aef6cb;min-height:20px;font-weight:900}';
  document.head.appendChild(css);

  const card = document.createElement('section');
  card.id = 'ht-production-addendum';
  const heading = document.createElement('h2');
  heading.textContent = '🌸 ' + episode + '편 · 기존 3개 프롬프트에 추가할 지시';
  const intro = document.createElement('p');
  intro.className = 'ht-sub';
  intro.textContent = '원본 기획서와 이미 보낸 프롬프트를 다시 붙여넣지 마세요. 이 편의 추가 지시만 복사해 같은 코덱스 대화에 전달하면 됩니다.';
  const actions = document.createElement('div');
  actions.className = 'ht-actions';
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '📋 ' + episode + '편 +α 추가 지시만 전체 복사';
  const link = document.createElement('a');
  link.className = 'ht-link';
  link.href = '../../../국뽕-유튜브-리서치-허브-20261108/thumb-edit-studio-20261123/production-51-100/';
  link.textContent = '🎬 공통 제작 규칙·실제 캡처 보기';
  const status = document.createElement('div');
  status.className = 'ht-result';
  status.setAttribute('role', 'status');
  actions.append(button, link);
  const ul = document.createElement('ol');
  ul.className = 'ht-points';
  ['이미 보낸 기존 3개 지시는 그대로 유지', '이 버튼의 추가 지시만 현재 제작 중인 코덱스 작업창에 붙여넣기', '이번 편 하나의 무자막 베이스·SRT·스타일·음성·타임라인 보관 확인'].forEach(v => {
    const li = document.createElement('li');
    li.textContent = v;
    ul.appendChild(li);
  });
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = '복사되는 전체 문구 확인·직접 수정';
  const area = document.createElement('textarea');
  area.value = prompt;
  area.setAttribute('aria-label', episode + '편 전용 추가 지시문');
  details.append(summary, area);
  card.append(heading, intro, actions, status, ul, details);
  h1.insertAdjacentElement('afterend', card);
  const nav = document.getElementById('outline50SectionNav');
  if (nav) {
    const jump = document.createElement('a');
    jump.href = '#ht-production-addendum';
    jump.textContent = '🌸 이번 편 추가 프롬프트';
    jump.style.cssText = 'background:#a12a43;color:#fff;font-weight:900;border-radius:7px;padding:9px 7px;margin-bottom:6px';
    nav.insertBefore(jump, nav.firstChild);
  }
  button.addEventListener('click', async () => {
    const value = area.value;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
        ok = true;
      }
    } catch (e) { /* fallback */ }
    if (!ok) {
      area.focus(); area.select();
      try { ok = document.execCommand('copy'); } catch (e) { /* fallback */ }
    }
    status.textContent = ok
      ? '✅ ' + episode + '편 추가 지시만 복사됐습니다. 기존 코덱스 대화에 붙여넣으세요.'
      : '⚠️ 자동 복사가 안 되면 아래 문구 전체 선택 → Ctrl+C';
  });
})();
