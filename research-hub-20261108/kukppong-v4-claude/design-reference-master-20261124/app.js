(function () {
  'use strict';
  const D = window.STATS_DATA;
  const $ = id => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const e = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  };
  const svgEl = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  };
  let toastTimer;
  function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800);
  }
  async function copy(text, message) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const a = e('textarea'); a.value = text;
        a.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.appendChild(a); a.select();
        if (!document.execCommand('copy')) throw new Error('copy unavailable');
        a.remove();
      }
      toast(message || '복사했습니다.');
    } catch (_) {
      toast('복사 권한을 사용할 수 없습니다. 전체 지시문을 펼치거나 TXT를 저장해 주세요.');
    }
  }
  function button(label, onClick, cls) {
    const b = e('button', cls || 'button small-button', label);
    b.type = 'button'; b.addEventListener('click', onClick); return b;
  }
  function cropSvg(ref, crop, marks) {
    const box = crop ? crop.box : [0, 0, ...ref.dimensions];
    const svg = svgEl('svg', {
      viewBox: box.join(' '), role: 'img', 'aria-label': ref.title + (crop ? ' · ' + crop.label : ' · 원본 전체'),
      preserveAspectRatio: 'xMidYMid meet'
    });
    const title = svgEl('title'); title.textContent = ref.title; svg.append(title);
    svg.append(svgEl('image', { href: ref.asset_url, width: ref.dimensions[0], height: ref.dimensions[1] }));
    if (marks) ref.measured_colors.forEach((m, i) => {
      svg.append(svgEl('rect', {x:m.roi[0], y:m.roi[1], width:m.roi[2], height:m.roi[3], class:'measurement-mark'}));
      const n = svgEl('text', {x:m.roi[0], y:Math.max(28,m.roi[1]-6), fill:'#B5210E', 'font-size':22,'font-weight':800, stroke:'#FFFFFF','stroke-width':3,'paint-order':'stroke'});
      n.textContent = String(i + 1); svg.append(n);
    });
    return svg;
  }
  function showDialog(title) {
    $('dialogTitle').textContent = title;
    $('dialogActions').replaceChildren();
    $('dialogCanvas').replaceChildren();
    $('dialogCanvas').className = '';
    $('dialogNote').replaceChildren();
    if (!$('imageDialog').open) $('imageDialog').showModal();
  }
  function showReference(ref, firstMode) {
    showDialog(ref.id + ' · ' + ref.title);
    const choices = [{id:'main',label:'디자인 영역',crop:ref.main_crop},{id:'original',label:'원본 전체'},...ref.detail_crops.map(x=>({id:x.id,label:x.label,crop:x})),{id:'measure',label:'색 측정 위치'}];
    function select(mode) {
      const choice = choices.find(x => x.id === mode) || choices[0];
      $('dialogCanvas').replaceChildren(cropSvg(ref, choice.crop, mode === 'measure'));
      [...$('dialogActions').querySelectorAll('button')].forEach(b=>b.classList.toggle('selected',b.dataset.mode===choice.id));
      $('dialogNote').replaceChildren(e('p', '', ref.filename + ' · ' + ref.dimensions.join(' × ') + ' px · 원본 파일 보존'));
      if (choice.crop) $('dialogNote').append(e('p','', '표시 영역 [x, y, 너비, 높이] = [' + choice.crop.box.join(', ') + '] px. ' + (choice.crop.note || '원본의 해당 영역을 확대해 표시합니다.')));
      if (mode === 'measure') {
        const list = e('ol','measurement-list');
        ref.measured_colors.forEach(m => {
          const li=e('li','',m.role+' · '+m.hex+' · 표본 '+m.sampled_pixels.toLocaleString()+' px');
          const dot=e('i','measure-dot');dot.style.background=m.hex;li.prepend(dot);list.append(li);
        });
        $('dialogNote').append(list,e('p','','측정: 지정 사각 영역에서 색 조건을 적용한 RGB 채널별 중앙값. 합성·압축된 캡처 대표색이며 원본 제작 토큰과 구분합니다.'));
      }
      if (ref.limits && ref.limits.length) $('dialogNote').append(e('p','',ref.limits.join(' ')));
    }
    choices.forEach(c=>{ const b=button(c.label,()=>select(c.id));b.dataset.mode=c.id;$('dialogActions').append(b);});
    const link=e('a','button small-button','원본 파일 저장');link.href=ref.asset_url;link.download=ref.filename;$('dialogActions').append(link);
    select(firstMode || 'main');
  }
  $('closeDialog').onclick=()=>$('imageDialog').close();
  $('imageDialog').addEventListener('click', event=>{if(event.target===$('imageDialog')){
    const r=$('imageDialog').getBoundingClientRect();
    if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('imageDialog').close();
  }});

  const observationLabels={material:'재질',lighting:'빛',shadow:'그림자',composition:'구도·위계',font_shape:'글자 형태'};
  D.references.forEach(ref=>{
    const article=e('article','reference-card');article.id=ref.id.toLowerCase();article.dataset.category=ref.category;if(Math.max(...ref.dimensions)<500)article.classList.add('low-resolution');
    const head=e('div','card-head');head.append(e('span','ref-number',ref.id),e('h3','',ref.title));
    const preview=e('div','ref-preview');preview.append(cropSvg(ref,ref.main_crop));
    const body=e('div','card-body');body.append(e('p','ref-intent',ref.semantic_uses.join(' · ')));
    const chips=e('div','colors-mini');
    const explicit=ref.transcribed_hex||[];
    (explicit.length?explicit.slice(0,6).map(c=>({hex:c.literal,role:c.role||'사진 명시 코드',explicit:true})):ref.measured_colors.slice(0,4)).forEach(m=>{
      const b=button(m.hex,()=>copy(m.hex,m.role+' '+m.hex+' 복사'), 'color-chip');
      const sw=e('i');sw.style.background=m.hex;b.prepend(sw);b.title=m.role+(m.explicit?' · 사진 명시 HEX':' · 캡처 실측');chips.append(b);
    });
    body.append(chips,e('p','small',explicit.length?'색 칩: 사진 명시 HEX · 별도 측정값은 확대 창에서 확인':'색 칩: 캡처 실측 대표값 · 제작 토큰과 구분'));
    const actions=e('div','ref-buttons');actions.append(button('디자인 영역 확대',()=>showReference(ref)),button('원본 전체',()=>showReference(ref,'original')),button('부분 '+ref.detail_crops.length+'개 · 측정',()=>showReference(ref,'measure')));body.append(actions);
    const details=e('details','observations');details.append(e('summary','','재질·빛·구도 자세히'));
    const dl=e('dl');Object.entries(ref.observations).forEach(([key,value])=>{dl.append(e('dt','',observationLabels[key]||key),e('dd','',value));});
    if(ref.limits.length)dl.append(e('dt','','캡처의 한계'),e('dd','',ref.limits.join(' ')));
    details.append(dl);body.append(details);article.append(head,preview,body);$('referenceCards').append(article);
  });
  const heroRef=D.references[7];
  $('heroImage').append(cropSvg(heroRef,heroRef.main_crop));
  $('heroOpen').onclick=()=>showReference(heroRef);
  $('expandDetails').onclick=()=>{
    const all=[...document.querySelectorAll('.observations')];const next=!all.every(x=>x.open);all.forEach(x=>x.open=next);
    $('expandDetails').textContent=next?'세부 관찰 모두 접기':'세부 관찰 모두 펼치기';
  };

  D.bluePalette.forEach(row=>{
    const card=e('article','blue-chip');const top=e('div','blue-chip-top');
    [[row.literal,'사진 명시 코드'],[row.measured,'색 점 실측']].forEach(([col,label])=>{const sw=e('div','',label);sw.style.background=col;top.append(sw);});
    const body=e('div','blue-chip-body');body.append(e('h3','',row.row+'번째 · '+row.literal.toUpperCase()));
    body.append(e('p','','색 점 '+row.measured+' / 유리면 '+row.surface));
    if(row.row===5)body.append(e('p','proposal','원문 코드 중복 · 오타 여부 미확인'));
    const actions=e('div','ref-buttons');actions.append(button('명시 코드 복사',()=>copy(row.literal.toUpperCase())),button('실측 점색 복사',()=>copy(row.measured)));
    body.append(actions);card.append(top,body);$('bluePalette').append(card);
  });

  function currentOptions(orientation){return {kind:$('kindSelect').value,palette:$('paletteSelect').value,character:$('characterPreview').checked,orientation};}
  const explanations={
    map:'REF-01 · 가로는 지도와 수치를 좌우로, 세로는 수치→지도→보조 항목으로 재배치합니다. 지도 영역은 실제 지도 자산을 넣을 자리이며 현재 핀은 가상 위치입니다.',
    growth:'REF-01 · 큰 15% 뒤의 장식 블록과 실제 시계열을 구분합니다. 이 예시는 40→55→80→92의 지수이며 마지막 80→92가 +15%입니다.',
    pie_glass:'REF-02 · 유리 림·선택 조각·그림자를 분리합니다. 예시는 정확한 30:70이며, 참고 이미지의 1,100 인원을 그대로 가져온 데이터가 아닙니다.',
    pie_glow:'REF-03 · 30:70의 분할은 유지하고 빛은 글자 뒤에 둡니다. 가로는 옆 범례, 세로는 도형 아래의 짧은 범례를 사용합니다.',
    funnel:'REF-04 · 450,000→18,000→8,280→1,656은 배치 예시입니다. 단계별 전환율은 4%·46%·20%. 그릇 너비는 단계 구분용이며 인원 비례 면적을 뜻하지 않습니다.',
    bars:'REF-07 · 50·25·100·75는 같은 0선에서 높이로 비교합니다. 각 범주의 색·폭·입체 깊이를 유지하며 가로와 세로에서 범례를 다시 놓습니다.',
    review:'REF-06 · 가로는 왼쪽→오른쪽, 세로는 위→아래로 연결합니다. 이 아이콘 흐름은 REF-23 흰 댓글 박스와는 다른 참고입니다. 실제 댓글 카드는 위 R 모듈에서 별도로 비교합니다.'
  };
  function updatePreview(){
    window.StatsPreview.render($('widePreview'),currentOptions('wide'));
    window.StatsPreview.render($('tallPreview'),currentOptions('tall'));
    $('previewExplain').textContent='🌸 '+explanations[$('kindSelect').value]+' 공통: 밝은 바탕은 재질 비교용입니다. 실제 영상에는 투명 오버레이가 기본이며 흰 패널은 선택안입니다.';
  }
  ['kindSelect','paletteSelect','characterPreview'].forEach(id=>$(id).addEventListener('change',updatePreview));
  $('replay').onclick=()=>{
    updatePreview();
    ['widePreview','tallPreview'].forEach(id=>{
      const svg=$(id).querySelector('svg');
      if(svg&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)svg.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0px)'}],{duration:350,easing:'ease-out'});
    });
    toast('🌸 0.35초 등장 모식도 · 최종 영상의 모션 검수와 별개');
  };
  document.querySelectorAll('.open-preview').forEach(b=>b.onclick=()=>{
    const o=b.dataset.orientation;showDialog('🌸 '+(o==='wide'?'16:9 가로':'9:16 세로')+' · 구조 미리보기');
    $('dialogCanvas').className='preview-large '+(o==='tall'?'tall':'');const host=e('div');$('dialogCanvas').append(host);
    window.StatsPreview.render(host,currentOptions(o));$('dialogNote').textContent=$('previewExplain').textContent;
  });
  updatePreview();

  D.rules.modules.forEach(m=>{
    const card=e('article','rule-card');card.append(e('h3','',m.id+' · '+m.name),e('p','when',m.use_when));
    const dl=e('dl');[['참고',m.reference_ids.join(' · ')],['가로',m.landscape],['세로',m.portrait],['등장·정착',m.motion]].forEach(([k,v])=>dl.append(e('dt','',k),e('dd','',v)));
    card.append(dl);const detail=e('details','observations');detail.append(e('summary','','재질·레이어·움직임 상세'));const extra=e('dl');
    [['재질·빛',m.material_and_light],['레이어',m.layer_detail],['움직임',m.motion_detail],['자료 연결 조건',m.data_rules.join(' ')]].forEach(([k,v])=>extra.append(e('dt','',k),e('dd','',v)));detail.append(extra);card.append(detail);$('moduleRules').append(card);
  });
  function row(target,values){const tr=e('tr');values.forEach(v=>tr.append(e('td','',String(v))));$(target).append(tr);}
  D.layoutRows.forEach(x=>row('layoutRows',x));
  D.rules.compatibility_changes.forEach(x=>row('compatibilityRows',[x.item,x.before,x.after,x.authority+' · '+x.scope]));
  const exact=e('div');D.rules.user_exact_quotes.forEach(q=>exact.append(e('blockquote','',q)));$('userQuotes').append(exact);
  $('promptText').textContent=D.prompt;
  ['copyTop','copyPrompt'].forEach(id=>$(id).onclick=()=>copy(D.prompt,'통계 추가 모듈 S 전체를 복사했습니다.'));
  D.pendingRows.forEach(x=>row('pendingRows',x));

  function profileKey(){return 'yeonha-video-channel-v1:'+($('channelName').value.trim()||'국뽕');}
  function loadProfile(){
    try{const p=JSON.parse(localStorage.getItem(profileKey())||'null');
      if(p){$('characterMode').value=p.character;$('channelPalette').value=p.palette==='pending'?'selected':p.palette;$('channelStatus').textContent='저장된 '+($('channelName').value.trim()||'국뽕')+' 채널 초안을 불러왔습니다. 실제 편집기 적용은 별도입니다.';}
      else{$('characterMode').value='off';$('channelPalette').value='reference';$('channelStatus').textContent='이 채널의 저장된 초안이 없습니다. 캐릭터 기본 OFF로 시작합니다.';}
    }catch(_){$('channelStatus').textContent='브라우저 저장소를 사용할 수 없습니다. 채널 지시문을 복사해 보관해 주세요.';}
  }
  $('channelName').addEventListener('change',loadProfile);
  $('saveChannel').onclick=()=>{
    try{localStorage.setItem(profileKey(),JSON.stringify({character:$('characterMode').value,palette:$('channelPalette').value}));$('channelStatus').textContent=($('channelName').value.trim()||'국뽕')+' 채널 초안을 이 브라우저에 저장했습니다. 실제 편집기에는 채널 지시문을 전달하세요.';toast('채널별 초안 저장 완료');}
    catch(_){toast('저장소를 사용할 수 없습니다. 채널 지시문 복사를 이용하세요.');}
  };
  $('copyChannel').onclick=()=>{
    const name=$('channelName').value.trim()||'국뽕';
    const mode=$('characterMode').value==='off'?'캐릭터 OFF. 이후 사용자가 장면을 지정해 요청한 경우 그 명시값을 우선한다.':'캐릭터는 사용자가 지정한 영상·구간에만 ON. 그 외 장면은 OFF.';
    const palette={reference:'이번 참고 이미지의 해당 통계 계열',blue:'REF-05 파랑 계열(4·5행 원문 중복 기록 유지)',selected:'이번 14개 역할 토큰 중 해당 장면에 선택한 값만 사용'}[$('channelPalette').value];
    copy('[채널별 디자인 설정]\n채널: '+name+'\n캐릭터: '+mode+'\n우선순위: 영상/구간 명시값 > 채널 저장값 > 기본 OFF.\n통계 팔레트: '+palette+'\n기존 자막·언론 강조·댓글·VS 지정색, 대본과 TTS는 그대로 유지한다.\n개구리 참고 시트는 수신했으며 제작용 개별 자산은 별도다. 제작용 파일 미연결 시 임의 대역을 생성하지 않는다. 요청된 캐릭터를 넣을 공간은 통계·자막을 가리지 않도록 재배치한다.\n통계 상세는 추가 모듈 S를 적용한다.','채널 지시문을 복사했습니다.');
  };
  loadProfile();
  window.ReferenceArchive={open:showReference,crop:cropSvg,copy,dialog:showDialog};
})();
