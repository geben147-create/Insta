/* 🌸 편별 +α 영상 생성·편집 추가 지시. 51~100편의 내용·주장·기획서 원문을 바꾸지 않음. */
(function(){
  'use strict';
  const found=location.pathname.match(/\/kukppong-batch-20261122\/outline50\/outlines\/outline_(\d+)\.html$/);
  if(!found)return;
  const num=Number(found[1]);
  if(num<51||num>100||document.getElementById('ht-production-addendum'))return;
  const main=document.querySelector('main');
  if(!main)return;
  const prompt=[
    num+'편 영상 생성·편집 추가 지시',
    '',
    '기존에 전달한 '+num+'편 기획서와 프롬프트 3개를 그대로 이어서 사용하고, 영상 생성·편집 방식만 추가 반영하세요.',
    '',
    '1. 모든 나레이션을 먼저 TTS로 완성하세요. 나중에 사람 목소리로 교체할 후보 구간도 TTS를 생성하고, 해당 문장·타임코드·TTS 음성을 따로 보관하세요.',
    '2. 자막·강조 타이틀·댓글 카드·뉴스·통계 그래픽을 영상에 미리 합치지 말고 clean_master.mp4, captions.srt, style.json, titles.json으로 분리해 나중에 수정할 수 있게 하세요.',
    '3. 컷·PIP·타이틀·음성 위치는 timeline.json에, TTS·BGM·효과음은 별도 오디오 파일로 보존하세요. 편집 가능한 프로젝트 파일도 함께 저장하세요.',
    '4. 영상 디자인에 아래 GitHub 참고 자료를 사용하세요.',
    'https://geben147-create.github.io/Insta/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html',
    'https://geben147-create.github.io/Insta/research-hub-20261108/broadcast-design-system-20261120/thumbnail/',
    '훅·한일 VS·뉴스·통계·댓글 디자인을 필요한 장면에 적용하되, 글꼴·색상·크기·위치를 이후 수정할 수 있도록 보존하세요.',
    '5. 첫 30초를 미리보기로 출력해 자막 중복·글씨 잘림·싱크·줄바꿈을 확인한 뒤 영상 제작을 이어가세요.',
    '6. 나중에 HumanTouch에서 TTS 듣기 → 따라 말하기 연습 → 내 음성 녹음 → 기존 TTS와 비교 → 내 음성 채택 시 그 구간의 TTS 음소거 또는 제거를 선택할 수 있도록 TTS 원본과 구간 연결 정보를 남겨주세요.',
    '',
    '현재 진행 중인 '+num+'편 영상에 위 내용만 추가 적용하고, 실제 생성 파일과 저장 경로를 보고하세요.'
  ].join('\n');
  const style=document.createElement('style');
  style.textContent='#ht-production-addendum{box-sizing:border-box;display:block;position:relative;z-index:2;background:#982439!important;color:white!important;border:4px solid #ff536a!important;border-radius:12px;padding:16px;margin:15px 0 23px;box-shadow:0 0 0 4px #5e1226,0 8px 20px #0008}' +
  '#ht-production-addendum h2{color:white!important;font-size:22px!important;margin:0 0 5px}' +
  '#ht-production-addendum p{color:#fff3f6;font-size:14px;margin:5px 0 12px}' +
  '#ht-production-addendum button{cursor:pointer;display:inline-flex;align-items:center;justify-content:center;background:#ffe479;color:#201200;font-size:18px;font-weight:900;border:2px solid #fff6be;border-radius:10px;padding:13px 16px;min-height:52px}' +
  '#ht-production-addendum textarea{display:block;background:#1a131a!important;color:#fff!important;border:2px solid #ff94a2;border-radius:10px;font:13px/1.65 ui-monospace,monospace;padding:12px;box-sizing:border-box;width:100%;min-height:240px;white-space:pre-wrap;resize:vertical}' +
  '#ht-production-addendum summary{font-size:15px;color:#ffe479;font-weight:900;cursor:pointer;margin:12px 0 8px}' +
  '#ht-production-addendum .ht-state{color:#d5ffe1;font-size:13px;min-height:20px;font-weight:800;margin-top:6px}' +
  '#ht-production-addendum .ht-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px}';
  document.head.appendChild(style);
  const wrap=document.createElement('section');
  wrap.id='ht-production-addendum';
  const title=document.createElement('h2');title.textContent='🌸 '+num+'편 · 영상편집 추가 프롬프트';
  const intro=document.createElement('p');intro.textContent='기존 기획서와 프롬프트 3개는 그대로 둡니다. 아래 추가 프롬프트만 같은 코덱스 대화에 붙여넣으세요.';
  const controls=document.createElement('div');controls.className='ht-row';
  const copy=document.createElement('button');copy.type='button';copy.textContent='📋 '+num+'편 +α 추가 지시만 복사';
  const guide=document.createElement('a');guide.target='_blank';guide.rel='noopener';
  guide.href='https://geben147-create.github.io/Insta/research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html';guide.textContent='참고 디자인 보기 ↗';guide.style.cssText='color:#fff!important;text-decoration:underline;font-weight:800';
  controls.append(copy,guide);
  const status=document.createElement('div');status.className='ht-state';status.setAttribute('role','status');
  const details=document.createElement('details');details.open=true;
  const summary=document.createElement('summary');summary.textContent='복사할 문구 보기 · 필요하면 직접 수정';
  const textarea=document.createElement('textarea');textarea.value=prompt;textarea.setAttribute('aria-label',num+'편 추가 영상편집 프롬프트');
  details.append(summary,textarea);
  wrap.append(title,intro,controls,status,details);
  const h1=main.querySelector('h1');
  if(h1)h1.insertAdjacentElement('afterend',wrap);else main.prepend(wrap);
  const nav=document.getElementById('outline50SectionNav');
  if(nav){const link=document.createElement('a');link.href='#ht-production-addendum';link.textContent='🌸 '+num+'편 추가 영상편집 복사';link.style.cssText='display:block;background:#d32950!important;color:white!important;font-weight:900;padding:9px;border-radius:7px;margin:4px 0';nav.insertBefore(link,nav.firstChild)}
  copy.addEventListener('click',async()=>{
    let copied=false;
    try{if(navigator.clipboard && window.isSecureContext){await navigator.clipboard.writeText(textarea.value);copied=true}}catch(_){}
    if(!copied){textarea.focus();textarea.select();try{copied=document.execCommand('copy')}catch(_){}}
    status.textContent=copied?'✅ 복사 완료. 코덱스 대화에 붙여넣으세요.':'⚠️ 복사 실패. 아래 문구를 선택한 뒤 Ctrl+C를 누르세요.';
  });
})();