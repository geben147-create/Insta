(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const root = '../design-reference-master-20261124/';
  const publicRoot = 'https://geben147-create.github.io/Insta/research-hub-20261108/kukppong-v4-claude/statistics-material-lab-20261124/';
  const storageKey = 'yeonha-material-studio-r2';
  const choices = [
    ['map','REF-01','흰 입체 지도','양각 · 접촉 그림자'],
    ['amber','REF-02','앰버 유리 파이','유리 벽 · 원근'],
    ['glow','REF-03','푸른 원형 글로','방사 확산 · 분리면'],
    ['funnel','REF-04','유리 퍼널','기울기 · 투명층'],
    ['slabs','REF-05','파란 유리 6단','얇은 림 · 흡광'],
    ['pipe','REF-06','유리 파이프','굴절 · 작은 반사선'],
    ['bars','REF-07','컬러 입체 막대','앞·옆·윗면'],
    ['territory','REF-21','영역 강조 지도','경계 · 표찰'],
    ['paper','REF-22','찢어진 종이','미세 섬유 · 여백']
  ];
  const rangeDefs = {
    gradientAngle:['색 흐름 각도',0,360,1,'°'], glowX:['푸른 빛 중심 X',0,100,1,'%'],
    glowY:['푸른 빛 중심 Y',0,100,1,'%'], glowRadius:['빛이 퍼지는 반경',5,100,1,'%'],
    blur:['빛 번짐',0,60,1,'px'], thickness:['두께 / 종이 찢김',0,40,1,'px'],
    rim:['얇은 반사선 강도',0,100,1,'%'], shadow:['그림자 불투명도',0,100,1,'%'],
    shadowBlur:['그림자 퍼짐',0,60,1,'px'], padding:['바깥 여백',0,20,.5,'%'],
    scale:['오브젝트 크기',60,120,1,'%'], fontScale:['큰 숫자 크기',60,180,1,'%'], labelScale:['설명 글자 크기',60,180,1,'%']
  };
  const notes = {
    map:'원본 지형을 보존하는 배치 시안입니다. 지도 픽셀은 원본 그대로이며 큰 숫자·제목·바깥 여백을 조절합니다. 아래의 생성 지도는 재질 참고용으로 따로 제공합니다.',
    territory:'258×145px 원본의 영역과 지형을 보존합니다. 선명한 새 지도는 실제 지리 데이터로 제작해야 하며, 이 화면의 색 조절은 새 표찰·범례에 적용됩니다.',
    paper:'중앙 실사 장면은 원본을 유지하고, 상하 종이·미세한 찢김·섬유색을 새로 조절합니다. 9:16에서는 인물을 잘라 확대하지 않고 영상 비율을 보존합니다.',
    slabs:'6개 층은 각각 다른 색을 고를 수 있습니다. “공통 그라데이션 직접 지정”을 켜면 각 층 색과 공통 명암이 섞입니다. 밝은 가장자리와 깊은 내부색은 별도 레이어입니다.',
    glow:'흰 원판은 선명하게 유지하고 파란 빛에만 번짐을 줍니다. 중심 위치·반경·색 지점·알파를 조절해 원형으로 퍼지는 느낌을 맞춥니다.',
    amber:'원근 때문에 타원으로 보이는 유리 접시입니다. 유리 벽·윗면·바닥 그림자를 나누어 조절합니다. 숫자는 참고용으로, 실제 통계는 자료에 맞춰 교체합니다.',
    funnel:'각 단계의 위·앞·옆면을 분리한 유리 퍼널입니다. 화살표나 면적만으로 실제 전환 비율을 추정하지 않고 숫자와 분모를 따로 확인합니다.',
    pipe:'흰 배경 위 투명 관·파란 말풍선·유리 아이콘의 재질 시안입니다. 굵은 파란 단색 선 대신 여러 얇은 반사선과 내부 어두운 선을 겹칩니다.',
    bars:'50·25·100·75%는 원본의 예시 값입니다. 공통 바닥·너비를 유지하고 앞면·옆면·윗면을 다르게 채웁니다. 실제 수치는 제작 자료로 바꿉니다.'
  };
  const revisionNotes={
    map:'🌸 90%와 지도의 원본 비례를 맞추고, 숫자 그라데이션·아래쪽 반사·접촉 그림자를 보강했습니다.',
    amber:'🌸 유리 접시의 윗면·두꺼운 벽·바닥을 나누고, 1,100과 설명 글자의 원본 대비 크기를 다시 맞췄습니다.',
    glow:'🌸 벌어진 파이의 절단면을 파란 두께 면으로 연결하고, 윗면의 확산광과 아래 그림자를 분리했습니다.',
    funnel:'🌸 상단 구멍·유리 벽·굴절 테두리·오른쪽 투영 그림자·콜아웃의 크기를 원본 비례로 조정했습니다.',
    slabs:'🌸 왼쪽 곡면의 넓은 흰 반사광, 위쪽 하이라이트, 짙은 코너와 겹침 그림자를 층별로 보강했습니다.',
    bars:'🌸 앞·옆·윗면의 다방향 그라데이션, 아래쪽 밝은 투과광, 접지 그림자와 바닥 반사를 보강했습니다.',
    orangeSteps:'🌸 새로 구현: 15% 오렌지 숫자, 반투명 계단 블록, 밝은 아래 면과 접지 그림자.',
    filledPillars:'🌸 새로 구현: 50·35·65·45·100% 흰 기둥 채움, 면별 색, 흰 받침과 숫자·바닥 반사.',
    foldedBars:'🌸 새로 구현: 벽에서 바닥으로 접힌 5색 막대, 접힌 선의 그림자와 떠 있는 숫자 콜아웃. 원본 첫 수치는 21%입니다.',
    pipe:'기존 유리 파이프 재질과 편집값을 유지했습니다. 🌸 미리보기 고정·설정 패널을 적용했습니다.',
    territory:'원본 지형을 유지했습니다. 🌸 미리보기와 원본 확대를 같은 화면에서 비교합니다.',
    paper:'기존 실사 장면과 종이 가장자리를 유지했습니다. 🌸 전환·소리는 별도 작업 탭에서 즉시 확인합니다.'
  };
  let revision='new',workMode='materials';
  const assetURL=ref=>ref.local_asset?ref.asset_url:root+ref.asset_url;
  const referencePublicURL=ref=>new URL(assetURL(ref),publicRoot).href;
  let manifest, spec, current='slabs', aspect='original', view='split', crop, config, sourceImage, sourcePixels, sourceRect;
  let drafts={}, selectedSample=null, guidances=false, loadTicket=0, toastTimer, frame;
  const meta = () => choices.find(x => x[0]===current);
  const reference = () => manifest.references.find(x => x.id===meta()[1]);
  const specification = () => spec.references.find(x => x.id===meta()[1]);
  const supported = () => window.MaterialRenderer.supportedControls(current);
  const hexOK = v => /^#[0-9a-f]{6}$/i.test(v);
  function toast(message) { $('toast').textContent=message; $('toast').classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2600); }
  function human(v) { if(v===null||v===undefined)return ''; if(Array.isArray(v))return v.map(human).join(' · '); if(typeof v==='object')return Object.entries(v).map(([k,x])=>`${k}: ${human(x)}`).join(' / '); return String(v); }
  function cleanConfig(id,input={}) {
    const c=MaterialRenderer.defaults(id);
    for(const key of ['mainColor','deepColor','lightColor','background'])if(hexOK(input[key]))c[key]=input[key];
    for(const [key,def] of Object.entries(rangeDefs)){const v=Number(input[key]);if(Number.isFinite(v))c[key]=Math.min(def[2],Math.max(def[1],v));}
    for(const key of ['title','value','fontFamily','calloutTitle1','calloutBody1','calloutTitle2','calloutBody2'])if(typeof input[key]==='string')c[key]=input[key].slice(0,60);
    if(typeof input.showLabels==='boolean')c.showLabels=input.showLabels;
    c.layers={...c.layers};for(const key of Object.keys(c.layers))if(typeof input.layers?.[key]==='boolean')c.layers[key]=input.layers[key];
    if(Array.isArray(input.palette)&&input.palette.length>=2&&input.palette.length<=10&&input.palette.every(hexOK))c.palette=input.palette.slice();
    if(Array.isArray(input.values)&&input.values.length<=10&&input.values.every(x=>Number.isFinite(+x)))c.values=input.values.map(Number);
    if(Array.isArray(input.stops)&&input.stops.length>=2&&input.stops.length<=10&&input.stops.every(s=>s&&hexOK(s.color)&&Number.isFinite(+s.offset)&&Number.isFinite(+s.opacity)))c.stops=input.stops.map(s=>({color:s.color,offset:Math.min(100,Math.max(0,+s.offset)),opacity:Math.min(1,Math.max(0,+s.opacity))}));
    return c;
  }
  function save() {
    drafts[current]=JSON.parse(JSON.stringify(config));
    try { localStorage.setItem(storageKey,JSON.stringify({version:1,current,aspect,drafts})); }
    catch (_) { $('saveStatus').textContent='브라우저 자동 저장을 사용할 수 없습니다. 설정 JSON을 저장하면 선택값을 보관할 수 있습니다.'; }
  }
  function size() {
    if(aspect==='wide')return [1920,1080]; if(aspect==='tall')return [1080,1920];
    const box=crop||specification().crop.box; const r=box[2]/box[3];
    return r>=1?[1600,Math.round(1600/r)]:[Math.round(1400*r),1400];
  }
  function cropSVG(ref, box) {
    const d=ref.dimensions;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box.join(' ')}" preserveAspectRatio="xMidYMid meet"><image href="${esc(assetURL(ref))}" width="${d[0]}" height="${d[1]}" /></svg>`;
  }
  function buildReferenceStrip() {
    $('quickReference').innerHTML=choices.map(([id,,title])=>'<option value="'+id+'"'+(id===current?' selected':'')+'>'+esc(title)+'</option>').join('');
    $('referenceStrip').innerHTML=choices.map(([id,refId,title,detail])=>{
      const ref=manifest.references.find(x=>x.id===refId), ss=spec.references.find(x=>x.id===refId);
      return `<button class="reference-card${id===current?' active':''}" data-preset="${id}" aria-pressed="${id===current}"><span class="thumb">${cropSVG(ref,ss.crop.box)}</span><strong>${esc(title)}</strong><small>${refId} · ${esc(detail)}</small></button>`;
    }).join('');
  }
  async function selectPreset(id, preserve=false) {
    if(!choices.some(x=>x[0]===id))return;
    if(config&&!preserve)save(); current=id;
    config=cleanConfig(id,drafts[id]||{});
    config.layers={glow:true,rim:true,shadow:true,texture:true,...config.layers};
    crop=specification().crop.box.slice(); selectedSample=null;sourceImage=null;sourcePixels=null;sourceRect=null;
    $('selectedTitle').textContent=meta()[2]; $('selectedMeta').textContent=meta()[1]+' · '+meta()[3];
    $('contextNote').textContent=notes[id];$('revisionSummary').textContent=revisionNotes[id]||'';$('changeDetail').textContent=revisionNotes[id]||'';
    const beforeButton=document.querySelector('[data-revision=before]');beforeButton.disabled=['orangeSteps','filledPillars','foldedBars'].includes(id);if(beforeButton.disabled)revision='new';syncRevision(); $('applySample').disabled=true;
    $('sampleReadout').querySelector('span:nth-child(2)').textContent='원본 그림을 클릭하면 좌표와 5×5px 중앙값이 표시됩니다.';
    buildReferenceStrip(); buildControls(); buildCrops(); buildAnalysis(); render();$('materialInspector').scrollTop=0;
    const ticket=++loadTicket; const img=new Image(); img.src=assetURL(reference());
    try { await img.decode(); if(ticket!==loadTicket)return; sourceImage=img; sourcePixels=document.createElement('canvas');sourcePixels.width=img.naturalWidth;sourcePixels.height=img.naturalHeight;sourcePixels.getContext('2d',{willReadFrequently:true}).drawImage(img,0,0);drawSource(); }
    catch (_) { if(ticket===loadTicket)toast('원본 이미지를 불러오지 못했습니다. 원본 링크를 확인해 주세요.'); }
    save();
  }
  function drawSource() {
    if(!sourceImage)return; const canvas=$('sourceCanvas'), [w,h]=size(); canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d'),b=crop; ctx.fillStyle=current==='slabs'?'#000000':'#EEEEEE';ctx.fillRect(0,0,w,h);
    const k=Math.min(w/b[2],h/b[3]),dw=b[2]*k,dh=b[3]*k,x=(w-dw)/2,y=(h-dh)/2;
    ctx.drawImage(sourceImage,b[0],b[1],b[2],b[3],x,y,dw,dh);sourceRect={x,y,w:dw,h:dh,k};
  }
  function render() {
    const [w,h]=size();config.width=w;config.height=h;
    const renderConfig={...config};if(aspect==='original'&&revision==='new')renderConfig.sourceCrop={base:specification().crop.box.slice(),selected:crop.slice()};
    const renderer=revision==='before'&&window.MaterialRendererBefore?MaterialRendererBefore:MaterialRenderer;
    $('renderStage').innerHTML=renderer.render(current,renderConfig);
    document.querySelectorAll('.artboard').forEach(x=>{x.style.setProperty('--ratio',w+'/'+h);x.style.setProperty('--safe',config.padding+'%');});
    $('renderStage').classList.toggle('guides',guidances);
    $('outputDimensions').textContent=w+' × '+h;
    $('renderLabel').innerHTML='<i class="dot rebuilt"></i>'+(revision==='before'?'수정 전 시안':'🌸 개선 시안');
    ['exportPNG','exportSVG'].forEach(id=>{$(id).disabled=revision==='before';$(id).title=revision==='before'?'개선 시안을 선택하면 저장할 수 있습니다.':'';});
    drawSource(); updateGradientBar(); save();
  }
  function scheduleRender() { cancelAnimationFrame(frame); frame=requestAnimationFrame(render); }
  function buildCrops() {
    const base=specification().crop.box;
    const all=[{label:'전체 구성',box:base},...reference().detail_crops].map(r=>{
      if(current==='map'&&r.label.includes('15%'))return {...r,navigate:'orangeSteps'};
      const b=r.box,x=Math.max(base[0],b[0]),y=Math.max(base[1],b[1]),w=Math.max(0,Math.min(base[0]+base[2],b[0]+b[2])-x),h=Math.max(0,Math.min(base[1]+base[3],b[1]+b[3])-y);
      return w*h>=b[2]*b[3]*.6?{...r,box:[x,y,w,h]}:{...r,sourceOnly:true};
    });
    $('cropChips').innerHTML=all.map((r,i)=>`<button data-crop="${i}" class="${i===0?'active':''}">${esc(r.label)}${r.navigate?' · 🌸 편집':r.sourceOnly?' · 원본 ↗':''}</button>`).join('');
    $('cropChips').querySelectorAll('button').forEach(button=>button.addEventListener('click',()=>{
      const selected=all[Number(button.dataset.crop)];
      if(selected.navigate){selectPreset(selected.navigate);return;}
      if(selected.sourceOnly){$('openOriginal').click();toast('이 영역은 전체 원본에서 확인합니다. 오른쪽 시안의 구성 범위는 유지됩니다.');return;}
      crop=selected.box.slice();
      $('cropChips').querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===button));render();
    }));
  }
  function rangeHTML(key) {
    if(!supported().includes(key))return ''; const [label,min,max,step,unit]=rangeDefs[key];
    return `<label class="range-field"><span class="range-label"><span>${esc(label)}</span><output>${Number(config[key]).toFixed(step<1?1:0)}${unit}</output></span><input type="range" aria-label="${esc(label)}" data-control="${key}" min="${min}" max="${max}" step="${step}" value="${config[key]}"></label>`;
  }
  function buildControls() {
    const sup=supported(),targets=[['mainColor',current==='territory'?'새 범례 주요 색':current==='map'?'큰 숫자 색':'주요 면의 색'],['deepColor','안쪽 깊은 색'],['lightColor','밝은 반사색'],['background','배경색']].filter(([key])=>sup.includes(key));
    if(current==='slabs'&&!config.palette)config.palette=MaterialRenderer.bluePalette.slice();
    if(sup.includes('palette')&&Array.isArray(config.palette))targets.unshift(...config.palette.map((_,i)=>['palette:'+i,(i+1)+(current==='slabs'?'번째 유리 층':'번째 막대 색')]));
    $('colorTarget').innerHTML=targets.map(([key,label])=>`<option value="${key}">${esc(label)}</option>`).join('');
    if(current==='slabs')$('colorTarget').value='palette:2';syncColor();
    $('bluePalette').innerHTML=MaterialRenderer.bluePalette.map((v,i)=>swatch(v,(i+1)+'단 · 원문 HEX')).join('');
    const measured=specification().palette?.measured||[];
    $('measuredPalette').innerHTML=measured.map(x=>swatch(x.hex,x.role)).join('');
    $('declaredBlueGroup').hidden=current!=='slabs';
    $('materialModes').innerHTML=current==='slabs'?'<button data-palette-mode="declared">원문 코드 6색</button><button data-palette-mode="measured">🌸 실측 색으로 대체</button>':'';
    $('gradientGroup').hidden=!sup.includes('stops');
    $('gradientControls').innerHTML=['gradientAngle','glowX','glowY','glowRadius'].map(rangeHTML).join('');
    $('materialControls').innerHTML=['blur','thickness','rim','shadow','shadowBlur'].map(rangeHTML).join('')+'<p class="field-note">🌸 재현용 조절값입니다. px는 1000 단위의 디자인 좌표 기준이며 출력 크기에 비례합니다.</p>';
    $('typographyControls').innerHTML=['fontScale','labelScale'].map(rangeHTML).join('')+(sup.includes('fontFamily')?'<label class="text-field"><span>글꼴 (원본 폰트 파일은 미확인)</span><select id="typeface" aria-label="글꼴">'+['Arial','Arial Narrow','Roboto','Noto Sans KR','Georgia'].map(f=>'<option'+(config.fontFamily===f?' selected':'')+'>'+f+'</option>').join('')+'</select></label>':'')+[['calloutTitle1','위 설명 카드 제목'],['calloutBody1','위 설명 카드 내용'],['calloutTitle2','아래 설명 카드 제목'],['calloutBody2','아래 설명 카드 내용']].filter(([key])=>sup.includes(key)).map(([key,label])=>textField(key,label)).join('')+(Array.isArray(config.values)?'<div class="value-fields">'+config.values.map((v,i)=>'<label>'+(i+1)+'번째 값<input type="number" data-value-index="'+i+'" aria-label="'+(i+1)+'번째 값" value="'+v+'" min="0" max="100"></label>').join('')+'</div>':'');
    $('layoutControls').innerHTML=['padding','scale'].map(rangeHTML).join('')+(sup.includes('title')?textField('title','제목'): '')+(sup.includes('value')?textField('value','큰 숫자 / 문구'): '')+`<label class="toggle-field"><span>라벨·글자 표시</span><input type="checkbox" data-check="showLabels" ${config.showLabels?'checked':''}></label><label class="toggle-field"><span>🌸 여백 가이드</span><input type="checkbox" id="showGuides" ${guidances?'checked':''}></label>`;
    const layerKeys=[['glow','빛 번짐'],['rim','얇은 반사선'],['shadow','그림자'],['texture','종이 잔입자']].filter(([key])=>key==='shadow'||(key==='texture'?current==='paper':key==='glow'?['glow','slabs','funnel','amber','pipe','bars','orangeSteps','filledPillars'].includes(current):!['map','territory'].includes(current)));
    $('layerControls').innerHTML=layerKeys.map(([key,label])=>`<label class="toggle-field"><span>${label}</span><input type="checkbox" data-layer="${key}" ${config.layers[key]?'checked':''}></label>`).join('');
    buildStops();
  }
  function textField(key,label){return `<label class="text-field"><span>${label}</span><input data-text="${key}" aria-label="${label}" value="${esc(config[key]||'')}" maxlength="60"></label>`;}
  function swatch(color,label){return `<button class="swatch" data-color="${color}" title="${esc(label)} · ${color}" style="--swatch:${color}"><i></i><span>${color}</span><small>${esc(label)}</small></button>`;}
  function activeColor() {const key=$('colorTarget').value;return key.startsWith('palette:')?config.palette[Number(key.split(':')[1])]:key.startsWith('stop:')?config.stops?.[Number(key.split(':')[1])]?.color:config[key];}
  function syncColor(){const color=activeColor()||'#1951FC';$('colorPicker').value=color;$('colorHex').value=color.toUpperCase();}
  function setColor(color) {
    if(!hexOK(color)){toast('HEX를 #1951FC처럼 6자리로 입력해 주세요.');return;}
    const key=$('colorTarget').value;color=color.toUpperCase();
    if(key.startsWith('palette:'))config.palette[Number(key.split(':')[1])]=color;else if(key.startsWith('stop:'))config.stops[Number(key.split(':')[1])].color=color;else {const previous=config[key];config[key]=color;if(config.stops&&key!=='background')config.stops.forEach(s=>{if(s.color.toUpperCase()===String(previous).toUpperCase())s.color=color;});}
    buildStops();syncColor();scheduleRender();
  }
  function defaultStops(){return current==='glow'?[{offset:0,color:config.mainColor,opacity:1},{offset:48,color:config.mainColor,opacity:.98},{offset:72,color:config.mainColor,opacity:.87},{offset:88,color:config.mainColor,opacity:.25},{offset:100,color:config.mainColor,opacity:0}]:[{offset:0,color:config.lightColor,opacity:1},{offset:42,color:config.mainColor,opacity:1},{offset:100,color:config.deepColor,opacity:1}];}
  function buildStops(){
    const selected=$('colorTarget').value;$('colorTarget').querySelectorAll('option[data-stop-target]').forEach(el=>el.remove());if(config.stops)config.stops.forEach((s,i)=>{const option=document.createElement('option');option.value='stop:'+i;option.dataset.stopTarget='true';option.textContent='그라데이션 '+(i+1)+'번 ('+s.offset+'%)';$('colorTarget').appendChild(option);});if(Array.from($('colorTarget').options).some(x=>x.value===selected))$('colorTarget').value=selected;
    const stops=config.stops||defaultStops();
    $('gradientStops').innerHTML=`<label class="toggle-field"><span>🌸 공통 그라데이션 직접 지정</span><input type="checkbox" id="customStops" ${config.stops?'checked':''}></label><div class="stop-head"><span>색</span><span>HEX</span><span>위치 %</span><span>농도 %</span><span></span></div>`+stops.map((s,i)=>`<div class="stop-row" data-stop="${i}"><input type="color" data-stop-field="color" aria-label="지점 ${i+1} 색" value="${s.color}"><input type="text" data-stop-field="hex" aria-label="지점 ${i+1} HEX" value="${s.color}" maxlength="7"><input type="number" data-stop-field="offset" aria-label="지점 ${i+1} 위치" value="${s.offset}" min="0" max="100"><input type="number" data-stop-field="opacity" aria-label="지점 ${i+1} 농도" value="${Math.round(s.opacity*100)}" min="0" max="100"><button data-remove-stop="${i}" aria-label="지점 ${i+1} 삭제" ${stops.length<=2?'disabled':''}>×</button></div>`).join('');
    updateGradientBar();
  }
  function updateGradientBar(){const stops=config.stops||defaultStops();$('gradientBar').style.background='linear-gradient(90deg,'+stops.map(s=>`${s.color} ${s.offset}%`).join(',')+')';}
  function buildAnalysis(){
    const s=specification(),ref=reference();
    const overview=[['원본에서 보이는 것',(s.observed||[]).slice(0,2).join(' ')],['달라지기 쉬운 부분',(s.observed||[]).slice(2).join(' ')||human(ref.observations.material)],['가로·세로 적용','🌸 가로: '+(s.layout.landscape?.guidance||'')+' 세로: '+(s.layout.portrait?.guidance||'')]];
    $('analysisOverview').innerHTML=overview.map(([title,body])=>`<article class="analysis-card"><h3>${esc(title)}</h3><p>${esc(body)}</p></article>`).join('');
    $('layerAnalysis').innerHTML=(s.layers||[]).map((layer,i)=>`<article class="layer-card"><span class="n">${String(i+1).padStart(2,'0')}</span><div><strong>${esc(layer.name||layer.label)}</strong><p>${esc(layer.role||layer.observation||layer.reason||'')}</p><p>${esc(human(layer.settings||layer.parameters||{}))}</p></div></article>`).join('');
    $('recipeAnalysis').innerHTML=(s.recipes||[]).map((r,i)=>{
      const stops=r.stops||[],css=stops.length?`linear-gradient(90deg,${stops.map(x=>`${x.color} ${x.offset_pct}%`).join(',')})`:'#eee';
      return `<article class="recipe"><b>🌸 ${esc(r.label)}</b><div class="gradient-sample" style="background:${css}"></div><code>${esc(stops.map(x=>`${x.offset_pct}% ${x.color} / 농도 ${Math.round(x.opacity*100)}%`).join(' → '))}</code><p>${esc(r.type)} · ${esc(human(r.parameters))}</p>${supported().includes('stops')&&stops.length>1?`<button class="mini" data-recipe="${i}">이 색 지점을 공통 면에 적용</button>`:''}</article>`;
    }).join('');
    $('spacingAnalysis').innerHTML='<dl>'+s.spacing.map(x=>`<div class="metric-row"><dt>${esc(x.label)}</dt><dd>${esc(x.value_px_approx!==undefined?human(x.value_px_approx)+'px (캡처 기준, 약값)':x.observation||human(x))}</dd></div>`).join('')+'</dl><p class="small-muted">좌표는 원본 스크린샷 기준입니다. 페이지에 보이는 크기와 출력 영상의 픽셀 수는 다릅니다.</p>';
    $('specRaw').textContent=JSON.stringify(s,null,2);
  }
  async function selfContainedSVG(){
    const [width,height]=size();const exportConfig={...config,width,height};if(aspect==='original')exportConfig.sourceCrop={base:specification().crop.box.slice(),selected:crop.slice()};let svg=MaterialRenderer.render(current,exportConfig);
    const doc=new DOMParser().parseFromString(svg,'image/svg+xml');
    for(const el of doc.querySelectorAll('image')){
      const href=el.getAttribute('href');if(!href||href.startsWith('data:'))continue;
      const response=await fetch(new URL(href,location.href));if(!response.ok)throw new Error('원본 이미지 저장 오류');
      const blob=await response.blob(),data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});el.setAttribute('href',data);
    }
    return new XMLSerializer().serializeToString(doc);
  }
  function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
  function packageConfig(){return {schema:'yeonha-material-studio/v1',revision:'20261125-r2',module:current,reference:meta()[1],aspect,source_crop:crop.slice(),config:JSON.parse(JSON.stringify(config)),reference_url:referencePublicURL(reference()),reference_sha256:reference().source_sha256,note:'사용자 원문 HEX / 실측 색 / 🌸 재현 제안을 구분. 기존 대본·TTS·자막 고유색 보존.'};}
  function prompt(){const p=packageConfig();return `🌸🌸🌸🌸🌸 미리보기는 고정하고, 오른쪽 접이식 설정 패널만 독립 스크롤한다. 어떤 효과를 선택해도 결과가 같은 화면에 즉시 보이며, 태블릿·모바일에서 미리보기와 패널의 겹침을 실제로 확인한다.\n\n[통계·지도·종이 재질 적용 지시 — ${meta()[1]} ${meta()[2]}]\n\n사용자가 선택한 아래 설정을 우선 적용한다. 대본·TTS·이미 승인된 자막의 글자색은 변경하지 않는다.\n레퍼런스 원본: ${referencePublicURL(reference())}\n상세 분석: ${publicRoot}${reference().local_asset?'supplement-references.json':'reference-spec.json'}\n기존 전체 지시: ${new URL('../design-reference-master-20261124/apply-current-edit.txt',publicRoot).href}\n\n🌸 원본을 큰 화면으로 비교하면서 면색, 안쪽 흡광, 곡면 반사광, 얇은 림, 접촉 그림자와 여백을 각각 맞춘다. 하나의 단색이나 평면 그라데이션만으로 대체하지 않는다.\n🌸 블러는 빛/그림자 레이어에만 적용하고 글자·경계는 선명하게 유지한다. 원본 비율·가로16:9·세로9:16은 아래 선택을 따른다. 세로로 바꿀 때 도형을 잡아늘리지 않는다.\n${notes[current]}\n${revisionNotes[current]||''}\n🌸 원본과 시안은 같은 크롭과 같은 표시 비율로 비교한다. 깊은 색/중간색/밝은 반사색은 역할별로 선택하며, 물체의 투영 그림자와 접촉 그림자를 따로 유지한다.\n\n[선택한 정확한 설정]\n${JSON.stringify(p,null,2)}\n\n[원본 관찰]\n${specification().observed.map(x=>'- '+x).join('\n')}\n\n🌸 HTML/SVG 미리보기 결과와 실제 영상 렌더 결과를 구분한다. 실제 편집 프로젝트에 적용하고 30초 샘플과 해당 그래픽 프레임을 원본과 나란히 검수한 후 반영 내역을 기록한다.\n`;}
  async function copy(text){try{await navigator.clipboard.writeText(text);toast('현재 설정과 레퍼런스 주소를 복사했습니다.');}catch(_){download(new Blob([text],{type:'text/plain;charset=utf-8'}),'material-current-prompt.txt');toast('복사 권한이 없어 프롬프트 TXT를 저장했습니다.');}}
  function registerEvents(){
    $('referenceStrip').addEventListener('click',e=>{const b=e.target.closest('[data-preset]');if(b){setWorkMode('materials',false);selectPreset(b.dataset.preset);if(!document.body.classList.contains('focus-workspace'))$('focusWorkspace').click();}});
    document.querySelectorAll('[data-aspect]').forEach(button=>button.addEventListener('click',()=>{aspect=button.dataset.aspect;document.querySelectorAll('[data-aspect]').forEach(x=>{x.classList.toggle('active',x===button);x.setAttribute('aria-pressed',x===button);});render();}));
    document.querySelectorAll('button[data-view]').forEach(button=>button.addEventListener('click',()=>{view=button.dataset.view;$('compare').dataset.view=view;$('overlaySetting').hidden=view!=='overlay';document.querySelectorAll('button[data-view]').forEach(x=>{if(x.tagName==='BUTTON'){x.classList.toggle('active',x===button);x.setAttribute('aria-pressed',x===button);}});}));
    $('overlayOpacity').addEventListener('input',e=>{$('compare').style.setProperty('--overlay',e.target.value/100);e.target.nextElementSibling.textContent=e.target.value+'%';});
    $('resetPreset').addEventListener('click',()=>{drafts[current]=MaterialRenderer.defaults(current);selectPreset(current,true);toast('이 유형의 재현 초기값으로 되돌렸습니다.');});
    $('colorTarget').addEventListener('change',syncColor);$('colorPicker').addEventListener('input',e=>setColor(e.target.value));$('applyHex').addEventListener('click',()=>setColor($('colorHex').value));$('colorHex').addEventListener('keydown',e=>{if(e.key==='Enter')setColor(e.target.value);});
    document.querySelector('.inspector').addEventListener('input',e=>{
      const el=e.target;
      if(el.dataset.control){const key=el.dataset.control;config[key]=Number(el.value);el.parentElement.querySelector('output').textContent=el.value+rangeDefs[key][4];scheduleRender();}
      else if(el.dataset.text){config[el.dataset.text]=el.value;scheduleRender();}
      else if(el.dataset.valueIndex!==undefined){config.values[Number(el.dataset.valueIndex)]=Math.max(0,Math.min(100,Number(el.value)));scheduleRender();}
      else if(el.dataset.stopField){const stops=config.stops||defaultStops(),idx=Number(el.closest('[data-stop]').dataset.stop),key=el.dataset.stopField;if(key==='color'||key==='hex'){if(!hexOK(el.value))return;stops[idx].color=el.value;el.closest('.stop-row').querySelectorAll('input[type=color],input[type=text]').forEach(x=>x.value=el.value);}else stops[idx][key]=Math.max(0,Math.min(100,Number(el.value)))/(key==='opacity'?100:1);config.stops=stops;$('customStops').checked=true;scheduleRender();}
    });
    document.querySelector('.inspector').addEventListener('change',e=>{
      const el=e.target;if(el.id==='typeface'){config.fontFamily=el.value;render();return;}if(el.dataset.layer)config.layers[el.dataset.layer]=el.checked;else if(el.dataset.check)config[el.dataset.check]=el.checked;else if(el.id==='showGuides')guidances=el.checked;else if(el.id==='customStops'){config.stops=el.checked?defaultStops():null;buildStops();}else return;render();
    });
    document.querySelector('.inspector').addEventListener('click',e=>{
      const chip=e.target.closest('[data-color]');if(chip){setColor(chip.dataset.color);toast($('colorTarget').selectedOptions[0].textContent+'에 '+chip.dataset.color+' 적용');return;}
      const mode=e.target.closest('[data-palette-mode]');if(mode){config.palette=mode.dataset.paletteMode==='declared'?MaterialRenderer.bluePalette.slice():['#021044','#051D87','#0E35C3','#2D72FD','#5BB3FD','#74B9FA'];syncColor();render();return;}
      const remove=e.target.closest('[data-remove-stop]');if(remove){const arr=config.stops||defaultStops();if(arr.length>2){arr.splice(Number(remove.dataset.removeStop),1);config.stops=arr;buildStops();render();}}
    });
    $('addStop').addEventListener('click',()=>{const arr=config.stops||defaultStops();if(arr.length>=10){toast('색 지점은 최대 10개입니다.');return;}arr.push({offset:50,color:activeColor(),opacity:1});config.stops=arr.sort((a,b)=>a.offset-b.offset);buildStops();render();});
    $('recipeAnalysis').addEventListener('click',e=>{const button=e.target.closest('[data-recipe]');if(!button)return;config.stops=specification().recipes[Number(button.dataset.recipe)].stops.map(x=>({offset:x.offset_pct,color:x.color,opacity:x.opacity}));buildStops();render();toast('🌸 해당 레시피의 색 지점을 공통 면에 적용했습니다.');});
    $('sourceCanvas').addEventListener('click',e=>{
      if(!sourcePixels||!sourceRect)return;const bounds=e.currentTarget.getBoundingClientRect(),canvas=e.currentTarget;const fit=Math.min(bounds.width/canvas.width,bounds.height/canvas.height),dx=(bounds.width-canvas.width*fit)/2,dy=(bounds.height-canvas.height*fit)/2;
      const xx=(e.clientX-bounds.left-dx)/fit,yy=(e.clientY-bounds.top-dy)/fit,r=sourceRect;if(xx<r.x||xx>r.x+r.w||yy<r.y||yy>r.y+r.h)return;
      const x=Math.max(2,Math.min(sourcePixels.width-3,Math.round(crop[0]+(xx-r.x)/r.k))),y=Math.max(2,Math.min(sourcePixels.height-3,Math.round(crop[1]+(yy-r.y)/r.k)));
      const data=sourcePixels.getContext('2d').getImageData(x-2,y-2,5,5).data,channels=[[],[],[]];for(let i=0;i<data.length;i+=4)for(let c=0;c<3;c++)channels[c].push(data[i+c]);const rgb=channels.map(x=>x.sort((a,b)=>a-b)[12]),color='#'+rgb.map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();selectedSample={x,y,rgb,hex:color};
      $('sampleReadout').querySelector('.sample-dot').style.background=color;$('sampleReadout').querySelector('span:nth-child(2)').textContent=`원본 (${x}, ${y}) · 5×5 중앙값 ${color} · RGB ${rgb.join(', ')}`;$('applySample').disabled=false;
    });
    $('applySample').addEventListener('click',()=>{if(selectedSample){setColor(selectedSample.hex);toast('원본 실측 색을 선택한 역할에 적용했습니다.');}});
    $('openOriginal').addEventListener('click',()=>{$('originalImage').src=assetURL(reference());$('dialogTitle').textContent=reference().id+' · '+reference().title;$('downloadOriginal').href=assetURL(reference());$('originalDialog').showModal();});$('closeOriginal').addEventListener('click',()=>$('originalDialog').close());
    $('exportJSON').addEventListener('click',()=>download(new Blob([JSON.stringify(packageConfig(),null,2)],{type:'application/json'}),'material-'+current+'-'+aspect+'.json'));
    $('copyPrompt').addEventListener('click',()=>copy(prompt()));
    $('exportSVG').addEventListener('click',async()=>{try{download(new Blob([await selfContainedSVG()],{type:'image/svg+xml'}),'material-'+current+'-'+aspect+'.svg');toast('이미지를 포함한 SVG를 저장했습니다.');}catch(err){toast('SVG 저장 실패: '+err.message);}});
    $('exportPNG').addEventListener('click',async()=>{
      const button=$('exportPNG');button.disabled=true;button.textContent='이미지 준비 중…';let url;
      try {const svg=await selfContainedSVG();url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));const img=new Image();img.src=url;await img.decode();const canvas=document.createElement('canvas'),[w,h]=size();canvas.width=w;canvas.height=h;canvas.getContext('2d').drawImage(img,0,0);const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('PNG 생성 오류');download(blob,'material-'+current+'-'+aspect+'.png');toast(w+' × '+h+' PNG를 저장했습니다.');}
      catch(err){toast('PNG 저장 실패: '+err.message);}finally{if(url)URL.revokeObjectURL(url);button.disabled=false;button.textContent='PNG 이미지 저장 ↓';}
    });
    $('importJSON').addEventListener('change',async e=>{try{const file=e.target.files[0];if(!file)return;if(file.size>150000)throw new Error('설정 파일 크기를 확인해 주세요.');const d=JSON.parse(await file.text());if(d.schema!=='yeonha-material-studio/v1'||!choices.some(x=>x[0]===d.module)||!d.config||typeof d.config!=='object')throw new Error('이 스튜디오에서 저장한 JSON을 선택해 주세요.');drafts[d.module]=d.config;aspect=['original','wide','tall'].includes(d.aspect)?d.aspect:'original';await selectPreset(d.module,true);const importedCrop=d.source_crop,baseCrop=specification().crop.box;if(Array.isArray(importedCrop)&&importedCrop.length===4&&importedCrop.every(Number.isFinite)&&importedCrop[2]>0&&importedCrop[3]>0&&importedCrop[0]>=baseCrop[0]&&importedCrop[1]>=baseCrop[1]&&importedCrop[0]+importedCrop[2]<=baseCrop[0]+baseCrop[2]&&importedCrop[1]+importedCrop[3]<=baseCrop[1]+baseCrop[3]){crop=importedCrop.slice();$('cropChips').querySelectorAll('button').forEach(b=>b.classList.remove('active'));render();}document.querySelectorAll('[data-aspect]').forEach(b=>{b.classList.toggle('active',b.dataset.aspect===aspect);b.setAttribute('aria-pressed',b.dataset.aspect===aspect);});toast('설정을 불러왔습니다.');}catch(err){toast(err.message);}finally{e.target.value='';}});
  }
  function syncRevision(){document.querySelectorAll('[data-revision]').forEach(b=>{b.classList.toggle('active',b.dataset.revision===revision);b.setAttribute('aria-pressed',String(b.dataset.revision===revision));});}
  function setWorkMode(mode,scroll=true){workMode=mode;const effects=mode==='effects';$('materialWorkspace').hidden=effects;$('editing-preview').hidden=!effects;$('referenceStrip').hidden=effects;$('quickReferenceWrap').hidden=effects;document.querySelectorAll('[data-work-mode]').forEach(b=>{const active=b.dataset.workMode===mode;b.classList.toggle('active',active);if(b.getAttribute('role')==='tab')b.setAttribute('aria-selected',String(active));});if(scroll&&!document.body.classList.contains('focus-workspace'))(effects?$('editing-preview'):$('materialWorkspace')).scrollIntoView({block:'start',behavior:'smooth'});}
  function registerWorkspace(){
    $('quickReference').addEventListener('change',e=>selectPreset(e.target.value));
    document.querySelectorAll('[data-work-mode]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();setWorkMode(b.dataset.workMode);}));
    $('toggleInspector').addEventListener('click',()=>{const closed=$('materialWorkspace').classList.toggle('inspector-collapsed');$('toggleInspector').textContent=closed?'‹ 설정 펼치기':'설정 접기 ›';$('toggleInspector').setAttribute('aria-expanded',String(!closed));});
    $('focusWorkspace').addEventListener('click',()=>{const focused=document.body.classList.toggle('focus-workspace');$('focusWorkspace').textContent=focused?'⛶ 전체 자료로 돌아가기':'⛶ 작업 화면 크게';$('focusWorkspace').setAttribute('aria-pressed',String(focused));});
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.body.classList.contains('focus-workspace')){$('focusWorkspace').click();}});
    document.querySelectorAll('[data-revision]').forEach(b=>b.addEventListener('click',()=>{revision=b.dataset.revision;syncRevision();render();}));
    $('copyUIPrompt').addEventListener('click',()=>copy($('uiPrompt').textContent));
    $('revisionChecklist').innerHTML=Object.entries(revisionNotes).filter(([id])=>!['pipe','territory','paper'].includes(id)).map(([id,note])=>'<article class="revision-item"><strong>'+esc(choices.find(x=>x[0]===id)?.[2]||id)+'</strong><p>'+esc(note)+'</p></article>').join('');
    if(location.hash==='#editing-preview')setWorkMode('effects',false);
  }
  async function init(){
    try{
      if(!window.MaterialRenderer)throw new Error('재질 렌더러를 불러오지 못했습니다.');
      const loaded=await Promise.all([fetch(root+'reference-manifest.json').then(r=>{if(!r.ok)throw new Error('원본 목록 오류');return r.json();}),fetch('reference-spec.json').then(r=>{if(!r.ok)throw new Error('분석 자료 오류');return r.json();}),fetch('supplement-references.json').then(r=>{if(!r.ok)throw new Error('추가 원본 목록 오류');return r.json();})]);
      [manifest,spec]=loaded;const supplement=loaded[2];choices.splice(1,0,supplement.choices.find(x=>x[0]==='orangeSteps'));choices.splice(8,0,...supplement.choices.filter(x=>x[0]!=='orangeSteps'));Object.assign(notes,supplement.notes);manifest.references.push(...supplement.references);spec.references.push(...supplement.specifications);
      try{const saved=JSON.parse(localStorage.getItem(storageKey));if(saved?.version===1){drafts=saved.drafts||{};current=choices.some(x=>x[0]===saved.current)?saved.current:'slabs';aspect=['original','wide','tall'].includes(saved.aspect)?saved.aspect:'original';}}catch(_){}
      const requested=new URLSearchParams(location.search).get('type');if(choices.some(x=>x[0]===requested))current=requested;
      registerEvents();registerWorkspace();if(new URLSearchParams(location.search).get('focus')==='1')$('focusWorkspace').click();await selectPreset(current,true);document.body.dataset.ready='true';document.querySelectorAll('[data-aspect]').forEach(b=>{b.classList.toggle('active',b.dataset.aspect===aspect);b.setAttribute('aria-pressed',b.dataset.aspect===aspect);});
    }catch(err){$('renderStage').innerHTML='<div class="error-state">'+esc(err.message)+'<br>페이지를 새로고침하거나 원본 자료 링크를 확인해 주세요.</div>';toast(err.message);}
  }
  init();
})();
