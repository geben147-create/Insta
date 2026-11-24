(function () {
  'use strict';
  const D = window.STATS_DATA, R = D.referenceRules, A = window.ReferenceArchive;
  const $ = id => document.getElementById(id);
  const el = (tag, cls, text) => { const n=document.createElement(tag); if(cls)n.className=cls; if(text!==undefined)n.textContent=text; return n; };
  function row(target, cells) { const tr=el('tr');cells.forEach(t=>tr.append(el('td','',t)));$(target).append(tr); }
  function refButton(id,label) { const b=el('button','button small-button',label||id+' 근거 보기'); b.type='button'; b.onclick=()=>A.open(D.references.find(r=>r.id===id));return b; }
  D.diagnosticRows.forEach(cells=>row('diagnosticRows',cells));

  R.color_role_tokens.forEach(token=>{
    const card=el('article','role-color');
    const sw=el('div','role-swatch');sw.style.background=token.hex;
    const body=el('div','role-color-body');body.append(el('span','role-code',token.hex),el('h3','',token.role));
    body.append(el('p','small',token.original_label_is_proposal?'원본 화면에 ‘제안’으로 표시 · 전체 확정색 아님':'명시 HEX · 해당 역할에서 사용'));
    const actions=el('div','ref-buttons');
    const copy=el('button','button small-button','코드 복사');copy.type='button';copy.onclick=()=>A.copy(token.hex,token.role+' '+token.hex+' 복사');
    actions.append(copy,refButton(token.references[0]));body.append(actions);card.append(sw,body);$('rolePalette').append(card);
  });
  const paletteLabels={top_white:'위 제목 흰색',top_yellow:'위 제목 노랑',no_gradient_top:'NO!! 위 주황',no_gradient_bottom:'NO!! 아래 빨강',bottom_title_top:'아래 제목 윗면',bottom_title_bottom:'아래 제목 아랫면',outline:'검정 외곽선',outer_red_border:'바깥 빨강 테두리',shadow:'그림자',reference_background:'캡처 원본 배경 칩',top_gold:'금색 윗면',light_band:'밝은 띠',bottom_gold:'금색 아랫면',dark_outline:'진갈색 외곽선',bronze_outer_border:'청동빛 바깥 테두리',depth_shadow:'입체 그림자'};
  [['noPalette','t02_no_comparison'],['goldPalette','t05_gold_comparison']].forEach(([id,key])=>{
    const p=R.template_palettes[key];
    Object.entries(p.colors).forEach(([role,hex])=>{const r=el('div','mini-palette-row');const sw=el('i');sw.style.background=hex;const b=el('button','code-button',hex);b.type='button';b.onclick=()=>A.copy(hex);r.append(sw,el('span','',paletteLabels[role]||role),b);$(id).append(r);});
    $(id).append(el('p','small',p.scope),refButton(p.reference));
  });
  $('copyColorRoles').onclick=()=>A.copy('[색상 역할별 적용]\n'+R.color_role_tokens.map(t=>t.role+': '+t.hex+(t.original_label_is_proposal?' (원본에서도 제안)':'')).join('\n')+'\n기존 자막 지정값과 언론·댓글 토큰을 전역 치환하지 않는다. 명시 HEX와 캡처 실측색을 구분한다.','14개 색과 역할을 복사했습니다.');
  ['REF-20 캡처: 레코체 Bold·G마켓 산스 Bold·평창평화체의 3종 비교. 금색 #F6CB52 / #FCEC82 / #F2CF5C, 외곽선 #2E1A05, 청동 테두리 #A8763C.',
   '현재 별도 금빛 편집기: 후보 7개. 기본 채움 #F9D56B / #FFF7B8 / #F8DD78, 외곽·그림자 #3C280B / #D1A13B / #7B5019. 캡처 당시와 다른 구현이며 이번에 바꾸지 않았습니다.',
   '기존 11번 금빛 칭찬의 지정값 #F9D56B / #FFF7B8 / #3C280B와 평창평화체도 별도 보존합니다. 사진의 배경 칩 #5A4636과 입력창·시안의 흰 배경은 캡처에서도 서로 다릅니다.',
   '🌸 사용할 템플릿 ID와 버전을 장면에 함께 적습니다. “금빛으로”라는 말만 전달해 서로 다른 3개 스타일이 섞이지 않게 합니다.'
  ].forEach(t=>$('goldVersion').append(el('p','',t)));
  const ref17=D.references.find(x=>x.id==='REF-17');$('poolSource').append(A.crop(ref17,ref17.main_crop));
  D.fontRows.forEach(c=>row('fontRows',c));
  D.editorLinks.forEach(l=>{const a=el('a','button',l.label);a.href=l.href;a.target='_blank';a.rel='noopener';$('editorLinks').append(a);});

  let currentFilter='new';
  function filter(value){currentFilter=value;let visible=0;document.querySelectorAll('#referenceCards .reference-card').forEach(c=>{const r=D.references.find(x=>x.id.toLowerCase()===c.id);const show=value==='all'||(value==='new'?r.batch===2:value==='other'?['map','frame','comment','character'].includes(r.category):r.category===value);c.hidden=!show;if(show)visible++;});document.querySelectorAll('[data-ref-filter]').forEach(b=>{b.classList.toggle('selected',b.dataset.refFilter===value);b.setAttribute('aria-pressed',String(b.dataset.refFilter===value));});$('filterCount').textContent=visible+'장 표시 · 전체 24장 원본 수록';}
  document.querySelectorAll('[data-ref-filter]').forEach(b=>b.onclick=()=>filter(b.dataset.refFilter));filter('new');
  document.querySelectorAll('[data-open-reference]').forEach(b=>b.onclick=()=>A.open(D.references.find(r=>r.id===b.dataset.openReference)));

  const expl={comment:'🌸 악마·상단 평가·해시태그를 제외한 새 배치입니다. 흰 카드 + 원문 + 핵심 형광 + 번역을 한 묶음으로 표시하고 하단 기본 자막은 중복하지 않습니다. 노랑 #FBFF15는 REF-23의 캡처 실측값이며, 연두 #BCFF34는 선택 비교안입니다. 원본의 악마에 가려진 픽셀은 복원하지 않았습니다.',paper:'🌸 REF-22 내부의 가로 장면을 비율 유지해 표시하고 상하 종이 모양은 SVG로 새로 구성했습니다. 세로에서도 두 인물이 함께 보이는 가로 창을 유지합니다. 새 종이 재질은 원본 복원이 아니며 하단 자막은 한 종류입니다.'};
  function opts(orientation){return{kind:$('referenceKind').value,orientation,palette:$('referencePalette').value,character:$('referenceCharacter').checked};}
  function updateReferencePreview(){window.ReferencePreview.render($('referenceWide'),opts('wide'));window.ReferencePreview.render($('referenceTall'),opts('tall'));$('referenceExplanation').textContent=expl[$('referenceKind').value];$('referencePalette').closest('label').hidden=$('referenceKind').value==='paper';}
  ['referenceKind','referencePalette','referenceCharacter'].forEach(id=>$(id).onchange=updateReferencePreview);
  updateReferencePreview();
  document.querySelectorAll('.open-reference-preview').forEach(b=>b.onclick=()=>{const o=b.dataset.orientation;A.dialog('🌸 '+(o==='wide'?'가로 16:9':'세로 9:16')+' · '+($('referenceKind').value==='comment'?'댓글 카드':'종이 프레임'));$('dialogCanvas').className='preview-large '+(o==='tall'?'tall':'');const host=el('div');$('dialogCanvas').append(host);window.ReferencePreview.render(host,opts(o));$('dialogNote').textContent=expl[$('referenceKind').value];});
  R.modules.forEach(m=>{const card=el('article','rule-card');card.append(el('h3','',m.id+' · '+m.name),el('p','when',m.use_when));const d=el('dl');[['참고',m.refs.join(' · ')],['보존',m.keep.join(' · ')],['가져오지 않을 요소',m.do_not_inherit.join(' · ')],['가로',m.landscape],['세로',m.portrait]].forEach(([k,v])=>d.append(el('dt','',k),el('dd','',v)));card.append(d);const details=el('details','observations');details.append(el('summary','','색·폰트·레이어·타이밍 상세'));const dl=el('dl');[['색',m.color],['폰트',m.font],['레이어',m.layers],['등장·유지',m.motion],['적용 조건',m.data_rule],['버전',m.version_note]].filter(x=>x[1]).forEach(([k,v])=>dl.append(el('dt','',k),el('dd','',v)));details.append(dl);card.append(details);$('newApplicationRules').append(card);});
  const map1=D.references[0],map21=D.references.find(r=>r.id==='REF-21');$('mapWhite').append(A.crop(map1,map1.detail_crops.find(c=>c.id==='map')));$('mapRegion').append(A.crop(map21,map21.main_crop));
  const frog=D.references.find(r=>r.id==='REF-24');$('frogSheet').append(A.crop(frog));
  document.querySelectorAll('[data-copy-stage]').forEach(b=>b.onclick=()=>A.copy(D.currentPrompts[b.dataset.copyStage],b.dataset.copyStage==='CURRENT'?'현재 수정용 B + S + R을 모두 복사했습니다.':'해당 단계 지시문을 복사했습니다.'));
  $('currentPromptText').textContent=D.currentPrompts.CURRENT;
  $('copyTop').onclick=()=>A.copy(D.currentPrompts.CURRENT,'현재 수정용 B + S + R을 모두 복사했습니다.');
})();
