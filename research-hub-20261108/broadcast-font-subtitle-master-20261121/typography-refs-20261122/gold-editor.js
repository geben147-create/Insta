/* T05: editable gold typography. State and PNG use the same Canvas renderer. */
(() => {
  "use strict";
  const STORAGE = "ty22-gold-editor-v1";
  const MAX_TEXT = 120;
  const FONTS = [
    {id:"ref-106",name:"검은고딕",note:"단단하고 넓은 획",url:"https://fonts.google.com/specimen/Black+Han+Sans"},
    {id:"ref-738",name:"SB 어그로 B",note:"힘 있는 제목",url:"https://www.sandbox.co.kr/company-ci"},
    {id:"ref-jalnan-gothic",name:"여기어때 잘난체 고딕",note:"각진 굵은 획",url:"https://gccompany.co.kr/font"},
    {id:"ref-366",name:"G마켓 산스 Bold",note:"반듯한 형태",url:"https://corp.gmarket.com/fonts/"},
    {id:"ref-669",name:"카페24 써라운드",note:"둥글고 두툼한 획",url:"https://fonts.cafe24.com/"},
    {id:"ref-950",name:"평창평화체",note:"글자 속 별 무늬 장식",url:"https://noonnu.cc/font_page/950"},
    {id:"ref-jalnan",name:"여기어때 잘난체",note:"부드러운 예능 제목",url:"https://gccompany.co.kr/font"}
  ];
  const NUMBER_FIELDS = {
    size:[30,220,1],tracking:[-18,30,.5],lineHeight:[.8,2.4,.05],slant:[-25,25,.5],tilt:[-15,15,.5],
    stretchX:[60,150,1],stretchY:[60,150,1],positionX:[-400,400,2],positionY:[-150,150,2],
    outlineWidth:[0,12,.2],outerWidth:[0,12,.2],depth:[0,20,.5],shadowAngle:[0,360,1],blur:[0,20,.2],
    gradientAngle:[0,360,1],highlightStop:[15,75,1],glowOpacity:[0,1,.01],glowSpread:[0,180,1],
    starCount:[0,100,1],starSize:[1,40,.5],starOpacity:[0,1,.01],twinkleSpeed:[0,4,.1],
    dustCount:[0,600,10],dustSize:[.2,8,.1],dustOpacity:[0,1,.01],scatter:[20,200,1],seed:[1,999999,1]
  };
  const GLYPH_FIELDS = {scale:[40,200,1],rotate:[-30,30,.5],slant:[-25,25,.5],offsetX:[-100,100,1],offsetY:[-100,100,1]};
  const COLORS = ["top","highlight","bottom","outline","outer","shadow","bg"];
  const BOOLS = ["gradient","effect"];
  const clone = object => JSON.parse(JSON.stringify(object));
  const hex = value => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
  const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
  const family = id => `"${id}", sans-serif`;
  const fontFor = state => FONTS.find(font => state.fontFamily.includes(font.id)) || FONTS[0];

  window.mountGoldEditor = function mountGoldEditor(card) {
    if (card.dataset.goldMounted || !window.GoldCaptionRenderer) return;
    card.dataset.goldMounted = "true";
    const renderer = window.GoldCaptionRenderer;
    const sourceImage = card.querySelector(".ty22-photo img")?.getAttribute("src") || "./R05_gold_special.jpg";
    const originalTitle = card.querySelector("h3")?.textContent || "금색 광택 · ‘특급 서비스’ 입체 자막";
    const defaults = clone(renderer.defaults);
    defaults.fontFamily = family(FONTS[0].id);
    defaults.fontWeight = 400;
    defaults.bg = "#ffffff";
    function validate(input) {
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("설정 형식을 확인해 주세요.");
      const result = clone(defaults);
      if (typeof input.text === "string") result.text = input.text.slice(0,MAX_TEXT);
      for (const [key,[min,max]] of Object.entries(NUMBER_FIELDS)) {
        if (input[key] !== undefined && Number.isFinite(Number(input[key]))) result[key] = clamp(Number(input[key]),min,max);
      }
      for (const key of COLORS) if (hex(input[key])) result[key] = input[key];
      for (const key of BOOLS) if (typeof input[key] === "boolean") result[key] = input[key];
      if (typeof input.fontFamily === "string") {
        const font = FONTS.find(item => input.fontFamily.includes(item.id));
        if (font) result.fontFamily = family(font.id);
      }
      result.fontWeight = 400;
      if (input.glyphs && typeof input.glyphs === "object" && !Array.isArray(input.glyphs)) {
        result.glyphs = {};
        for (const [index,entry] of Object.entries(input.glyphs)) {
          if (!/^\d+$/.test(index) || Number(index) >= result.text.length || !entry || typeof entry !== "object") continue;
          const clean = {};
          for (const [key,[min,max]] of Object.entries(GLYPH_FIELDS)) {
            if (Number.isFinite(Number(entry[key])) && entry[key] !== undefined) clean[key] = clamp(Number(entry[key]),min,max);
          }
          if (hex(entry.color)) clean.color = entry.color;
          if (Object.keys(clean).length) result.glyphs[index] = clean;
        }
      }
      return result;
    }
    let restored = false;
    let state = clone(defaults);
    try {
      const saved = localStorage.getItem(STORAGE);
      if (saved) { state = validate(JSON.parse(saved)); restored = true; }
    } catch (_) { /* Storage is optional; editing remains available. */ }
    let selection = new Set([0,1]);
    let anchor = 0;
    let geometry = null;
    let playback = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let sceneTime = 0;
    let animationId = 0;
    let lastTick = 0;
    let lastDraw = 0;
    let saveTimer = 0;
    let miniTimer = 0;
    let transactionTimer = 0;
    let transaction = false;
    const history = [];
    const future = [];
    const loaded = new Map();
    const globalInputs = new Map();
    const glyphInputs = new Map();
    const fontCards = new Map();
    card.classList.add("gold-editor");
    card.replaceChildren();

    function node(tag,className,text) {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    }
    function button(text,callback,className="") {
      const element = node("button",className,text);
      element.type = "button";
      element.addEventListener("click",callback);
      return element;
    }
    function announce(text) { status.textContent = text; }
    function chosenIndices() {
      return [...selection].filter(index => index < state.text.length && !/[\s/]/u.test(state.text[index])).sort((a,b) => a-b);
    }
    function glyphValue(key) {
      const first = chosenIndices()[0];
      return first === undefined ? (key === "scale" ? 100 : 0) : (state.glyphs[first]?.[key] ?? (key === "scale" ? 100 : 0));
    }
    function beginEdit() {
      if (!transaction) {
        history.push(JSON.stringify(state));
        if (history.length > 40) history.shift();
        future.length = 0;
        transaction = true;
      }
      clearTimeout(transactionTimer);
      transactionTimer = setTimeout(() => { transaction = false; },550);
    }
    function finishEdit() { transaction = false; clearTimeout(transactionTimer); }
    function update(mutator,{message,sync=false}={}) {
      beginEdit();
      mutator(state);
      if (sync) syncControls();
      refresh();
      if (message) announce(message);
    }
    function setGlyph(key,value) {
      const indices = chosenIndices();
      if (!indices.length) { announce("먼저 아래 글자 버튼이나 미리보기에서 수정할 글자를 선택해 주세요."); return; }
      update(current => {
        for (const index of indices) current.glyphs[index] = {...current.glyphs[index],[key]:value};
      });
    }
    const heading = node("header","gold-heading");
    const headline = node("div");
    headline.append(node("span","gold-eyebrow","T05 · 2026.11.24 개선"),node("h3","",originalTitle));
    headline.append(node("p","gold-intro","흰 배경 · 글자별 크기와 기울기 · 작은 별과 금빛 입자"));
    heading.append(headline);
    const layout = node("div","gold-layout");
    const previewColumn = node("div","gold-preview-column");
    const controlColumn = node("div","gold-control-column");
    const status = node("p","gold-status",restored ? "저장된 설정을 불러왔습니다." : "‘병현’과 ‘특’은 크게, ‘표’와 ‘급’은 작게 설정했습니다.");
    status.setAttribute("role","status");
    status.setAttribute("aria-live","polite");
    card.append(heading,layout,status);
    layout.append(previewColumn,controlColumn);

    const reference = node("figure","gold-reference");
    const referenceHead = node("div","gold-row gold-reference-head");
    referenceHead.append(node("strong","","원본 캡처"));
    const zoomLabel = node("label","gold-check");
    const zoom = node("input");
    zoom.type = "checkbox";
    zoom.checked = true;
    zoomLabel.append(zoom,"자막 확대");
    referenceHead.append(zoomLabel);
    const crop = node("div","gold-reference-image is-zoom");
    const referenceImg = node("img");
    referenceImg.src = sourceImage;
    referenceImg.alt = "원본 방송의 병현표 특급 서비스 금빛 자막";
    crop.append(referenceImg);
    zoom.addEventListener("change",() => crop.classList.toggle("is-zoom",zoom.checked));
    reference.append(referenceHead,crop,node("figcaption","","원본과 비교하며 조절하세요. 글꼴은 유사 후보입니다."));
    previewColumn.append(reference);

    const live = node("section","gold-live");
    live.setAttribute("aria-label","금빛 자막 실시간 미리보기");
    const liveHead = node("div","gold-row");
    const fontName = node("strong","gold-current-font",fontFor(state).name);
    const play = button(playback ? "⏸ 반짝임 멈춤" : "▶ 반짝임 재생",() => {
      playback = !playback;
      play.textContent = playback ? "⏸ 반짝임 멈춤" : "▶ 반짝임 재생";
      play.setAttribute("aria-pressed",String(playback));
      startAnimation();
      drawMain();
    },"gold-soft");
    play.setAttribute("aria-pressed",String(playback));
    liveHead.append(fontName,play);
    const canvasWrap = node("div","gold-canvas-wrap");
    const canvas = node("canvas","gold-main-canvas");
    canvas.width = 1600;
    canvas.height = 520;
    canvas.setAttribute("aria-label","금빛 자막 미리보기. 아래 글자 버튼으로도 선택할 수 있습니다.");
    canvasWrap.append(canvas);
    const fitNote = node("p","gold-note");
    const fontStatus = node("span","gold-font-status","글꼴 준비 중");
    live.append(liveHead,canvasWrap,fontStatus,fitNote);
    previewColumn.append(live);
    canvas.addEventListener("click",event => {
      if (!geometry?.glyphs?.length) return;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX-rect.left)/rect.width*1600;
      const y = (event.clientY-rect.top)/rect.height*520;
      const contains = (point,polygon) => {
        let inside = false;
        for (let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
          const a=polygon[i], b=polygon[j];
          if ((a.y>point.y)!==(b.y>point.y) && point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x) inside=!inside;
        }
        return inside;
      };
      const hit = [...geometry.glyphs].reverse().find(glyph => glyph.corners && contains({x,y},glyph.corners));
      if (hit) choose(hit.index,event);
    });

    const exportBar = node("div","gold-export-bar");
    const whitePng = button("⬜ 흰 배경 PNG",() => exportPng(false),"gold-primary");
    const transparentPng = button("▦ 투명 PNG",() => exportPng(true),"gold-soft");
    exportBar.append(whitePng,transparentPng);
    previewColumn.append(exportBar);

    const fontsSection = node("details","gold-section gold-fonts-section");
    fontsSection.open = !window.matchMedia("(max-width: 1050px)").matches;
    fontsSection.append(node("summary","","🔤 글꼴 7종 · 같은 문구로 비교"));
    const fontGrid = node("div","gold-font-grid");
    fontsSection.append(fontGrid);
    previewColumn.append(fontsSection);
    for (const font of FONTS) {
      const cell = node("div","gold-font-card");
      const pick = button(font.name,() => {
        finishEdit();
        update(current => { current.fontFamily=family(font.id); },{sync:true});
        finishEdit();
        loadFont(font);
      },"gold-font-pick");
      pick.setAttribute("aria-label",font.name+" 적용");
      const sample = node("canvas");
      sample.width=640; sample.height=208;
      sample.setAttribute("aria-hidden","true");
      pick.append(sample);
      const footer = node("div","gold-font-footer");
      const hint = node("span","",font.note);
      const link = node("a","","배포처 ↗");
      link.href=font.url;link.target="_blank";link.rel="noopener";
      footer.append(hint,link);
      cell.append(pick,footer);
      fontGrid.append(cell);
      fontCards.set(font.id,{cell,pick,sample,hint});
    }

    const actions = node("div","gold-history");
    const undo = button("↶ 되돌리기",() => historyStep(history,future));
    const redo = button("↷ 다시 하기",() => historyStep(future,history));
    const reset = button("✨ 추천값으로",() => {
      finishEdit();
      update(() => { state=clone(defaults);selection=new Set([0,1]);sceneTime=0; },{sync:true,message:"추천 금빛·글자 비율·반짝임으로 되돌렸습니다."});
      rebuildCharacters();
      finishEdit();
      loadFont(fontFor(state));
    });
    actions.append(undo,redo,reset);
    controlColumn.append(actions);

    function section(title,open=false) {
      const details=node("details","gold-section");details.open=open;
      details.append(node("summary","",title));
      const content=node("div","gold-section-body");details.append(content);
      controlColumn.append(details);return content;
    }
    const textSection=section("① 문구 바꾸기",true);
    const textLabel=node("label","gold-text-label","문구 입력 · / 또는 Enter로 줄바꿈");
    const textInput=node("textarea","gold-text-input");textInput.rows=2;textInput.maxLength=MAX_TEXT;textInput.value=state.text;
    textInput.setAttribute("aria-label","금빛 자막 문구");textLabel.append(textInput);
    const textCount=node("p","gold-note");
    textSection.append(textLabel,textCount);
    textInput.addEventListener("input",() => {
      const previous=state.text,current=textInput.value;
      let start=0,suffix=0;
      while(start<previous.length&&start<current.length&&previous[start]===current[start])start++;
      while(suffix<previous.length-start&&suffix<current.length-start&&previous.at(-suffix-1)===current.at(-suffix-1))suffix++;
      update(s => {
        const mapped={};
        for(const [key,value] of Object.entries(s.glyphs||{})) {
          const index=Number(key);
          if(index<start)mapped[index]=value;
          else if(index>=previous.length-suffix)mapped[index+current.length-previous.length]=value;
        }
        s.text=current;s.glyphs=mapped;selection.clear();
      });
      rebuildCharacters();syncGlyphControls();
    });
    function selectTextRange() {
      const start=textInput.selectionStart,end=textInput.selectionEnd;
      if(start===end)return;
      selection=new Set(characterList().filter(item=>item.index>=start&&item.index<end&&!/[\s/]/u.test(item.char)).map(item=>item.index));
      updateSelection();
    }
    for(const event of ["select","keyup","pointerup"])textInput.addEventListener(event,selectTextRange);

    const glyphSection=section("② 글자·단어만 크게 / 기울이기",true);
    glyphSection.append(node("p","gold-note","글자 버튼을 누르세요. Ctrl/⌘로 여러 글자, Shift로 범위를 선택합니다."));
    const selectionBar=node("div","gold-row gold-selection-bar");
    const selectionName=node("strong","gold-selection-name");
    selectionBar.append(selectionName,button("전체 선택",()=>{selection=new Set(characterList().filter(item=>!/[\s/]/u.test(item.char)).map(item=>item.index));updateSelection();},"gold-soft"));
    const characters=node("div","gold-characters");characters.setAttribute("role","group");characters.setAttribute("aria-label","수정할 글자 선택");
    const words=node("div","gold-words");
    const findRow=node("div","gold-find-row");
    const findInput=node("input");findInput.type="text";findInput.placeholder="강조할 단어 입력";findInput.setAttribute("aria-label","강조할 단어 입력");
    const findButton=button("단어 선택",()=>findWord(findInput.value),"gold-soft");
    findInput.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();findWord(findInput.value);}});
    findRow.append(findInput,findButton);
    glyphSection.append(selectionBar,characters,words,findRow);
    const glyphGrid=node("div","gold-control-grid");glyphSection.append(glyphGrid);
    addNumber(glyphGrid,"scale","선택 글자 크기","%",GLYPH_FIELDS.scale,true);
    addNumber(glyphGrid,"rotate","선택 글자 회전","°",GLYPH_FIELDS.rotate,true);
    addNumber(glyphGrid,"slant","선택 글자 기울기","°",GLYPH_FIELDS.slant,true);
    addNumber(glyphGrid,"offsetX","선택 글자 좌우","px",GLYPH_FIELDS.offsetX,true);
    addNumber(glyphGrid,"offsetY","선택 글자 위아래","px",GLYPH_FIELDS.offsetY,true);
    const glyphColor=addColor(glyphGrid,"color","선택 글자 단색",true);
    glyphSection.append(button("선택 글자 금빛 되돌리기",()=>{
      const indices=chosenIndices();if(!indices.length)return;
      update(s=>{for(const index of indices)if(s.glyphs[index])delete s.glyphs[index].color;},{sync:true});
    },"gold-soft"));
    glyphSection.append(button("선택 글자 크기·각도 초기화",()=>{
      const indices=chosenIndices();if(!indices.length)return;
      update(s=>{for(const index of indices)delete s.glyphs[index];},{sync:true});
    },"gold-soft"));

    const global=section("③ 전체 크기 · 기울기 · 위치");
    const globalGrid=node("div","gold-control-grid");global.append(globalGrid);
    for(const [key,label,unit] of [["size","전체 크기","px"],["tracking","글자 사이","px"],["slant","전체 글자 기울기","°"],["tilt","전체 줄 회전","°"],["stretchX","가로 비율","%"],["stretchY","세로 비율","%"],["lineHeight","줄 간격","배"],["positionX","전체 좌우","px"],["positionY","전체 위아래","px"]])addNumber(globalGrid,key,label,unit,NUMBER_FIELDS[key]);

    const colorSection=section("④ 금빛 색상 · 외곽선 · 입체 그림자");
    const colorGrid=node("div","gold-control-grid");colorSection.append(colorGrid);
    for(const [key,label] of [["top","금빛 윗면"],["highlight","밝은 금빛 띠"],["bottom","금빛 아랫면"],["outline","안쪽 외곽선"],["outer","바깥 금빛 선"],["shadow","입체 그림자 색"],["bg","미리보기 배경"]])addColor(colorGrid,key,label);
    addCheck(colorGrid,"gradient","금빛 그라데이션");
    for(const [key,label,unit] of [["gradientAngle","그라데이션 방향","°"],["highlightStop","밝은 띠 위치","%"],["outlineWidth","안쪽 선 두께","px"],["outerWidth","바깥 선 두께","px"],["depth","입체 깊이","px"],["shadowAngle","그림자 방향","°"],["blur","그림자 부드러움","px"]])addNumber(colorGrid,key,label,unit,NUMBER_FIELDS[key]);
    colorSection.append(button("⬜ 배경을 흰색으로",()=>update(s=>{s.bg="#ffffff";},{sync:true}),"gold-soft"));

    const sparkleSection=section("⑤ 작은 별 · 금빛 가루 · 빛 번짐");
    const sparkleGrid=node("div","gold-control-grid");sparkleSection.append(sparkleGrid);
    addCheck(sparkleGrid,"effect","반짝임과 금빛 가루 표시");
    for(const [key,label,unit] of [["starCount","작은 별 개수","개"],["starSize","별 크기","px"],["starOpacity","별 선명도",""],["twinkleSpeed","반짝임 속도","배"],["dustCount","금빛 가루 개수","개"],["dustSize","가루 크기","px"],["dustOpacity","가루 선명도",""],["scatter","입자 퍼짐","%"],["glowOpacity","뒤쪽 금빛 밝기",""],["glowSpread","빛 번짐 범위","px"]])addNumber(sparkleGrid,key,label,unit,NUMBER_FIELDS[key]);
    sparkleSection.append(button("✦ 별·가루 위치 바꾸기",()=>update(s=>{s.seed=(s.seed+7919)%999999+1;}),"gold-soft"));

    const settingsSection=section("⑥ 설정 저장 · 복사");
    const settingsBar=node("div","gold-settings-bar");
    const saveButton=button("💾 설정 저장",()=>saveState(true));
    const jsonButton=button("설정 파일 받기",()=>downloadBlob(new Blob([JSON.stringify({format:"ty22-gold-caption",version:1,state},null,2)],{type:"application/json"}),"T05-gold-settings.json"));
    const importButton=button("설정 파일 열기",()=>importInput.click());
    const importInput=node("input");importInput.type="file";importInput.accept=".json,application/json";importInput.hidden=true;
    importInput.addEventListener("change",async()=>{
      const file=importInput.files?.[0];if(!file)return;
      try {
        if(file.size>262144)throw new Error("256KB 이하의 설정 파일을 선택해 주세요.");
        const parsed=JSON.parse(await file.text());
        if(parsed.format!=="ty22-gold-caption"||parsed.version!==1||!parsed.state)throw new Error("이 편집기에서 저장한 설정 파일을 선택해 주세요.");
        const next=validate(parsed.state);finishEdit();
        update(()=>{state=next;selection.clear();sceneTime=0;},{sync:true,message:"설정 파일을 적용했습니다."});
        rebuildCharacters();finishEdit();loadFont(fontFor(state));
      } catch(error) {announce(error instanceof SyntaxError ? "설정 JSON을 읽을 수 없습니다." : error.message);}
      importInput.value="";
    });
    settingsBar.append(saveButton,jsonButton,importButton,importInput);
    const copy=button("📋 현재 설정 프롬프트 복사",async()=>{
      try {await navigator.clipboard.writeText(promptBox.value);announce("현재 설정을 복사했습니다.");}
      catch(_){promptBox.focus();promptBox.select();announce("아래 설정이 선택되었습니다. Ctrl+C 또는 ⌘C로 복사하세요.");}
    },"gold-primary");
    const promptBox=node("textarea","gold-prompt");promptBox.readOnly=true;promptBox.rows=5;promptBox.setAttribute("aria-label","현재 금빛 자막 설정 프롬프트");
    settingsSection.append(settingsBar,node("p","gold-note","변경한 설정은 이 브라우저에 자동 저장됩니다. 다른 기기로 옮길 때는 설정 파일을 사용하세요."),copy,promptBox);

    function addNumber(container,key,label,unit,limits,isGlyph=false) {
      const [min,max,step]=limits;
      const wrap=node("div","gold-control");
      const labelNode=node("label","",label);
      const id=`gold-${isGlyph?"glyph-":""}${key}`;
      labelNode.htmlFor=id;
      const row=node("div","gold-number-row");
      const slider=node("input");slider.type="range";slider.min=min;slider.max=max;slider.step=step;
      slider.id=id;slider.setAttribute("aria-label",label);
      const numeric=node("input");numeric.type="number";numeric.min=min;numeric.max=max;numeric.step=step;
      numeric.setAttribute("aria-label",label+" 수치");
      const unitNode=node("span","gold-unit",unit);
      const onInput=source=>{
        if(source.value===""||!Number.isFinite(Number(source.value)))return;
        const value=clamp(Number(source.value),min,max);
        slider.value=value;numeric.value=value;
        if(isGlyph)setGlyph(key,value);else update(s=>{s[key]=value;});
      };
      slider.addEventListener("input",()=>onInput(slider));numeric.addEventListener("input",()=>onInput(numeric));
      for(const element of [slider,numeric]){
        element.addEventListener("change",finishEdit);
        element.addEventListener("blur",()=>{finishEdit();if(!numeric.value){numeric.value=isGlyph?glyphValue(key):state[key];slider.value=numeric.value;}});
      }
      row.append(slider,numeric,unitNode);wrap.append(labelNode,row);container.append(wrap);
      (isGlyph?glyphInputs:globalInputs).set(key,{type:"number",slider,numeric});
    }
    function addColor(container,key,label,isGlyph=false) {
      const wrap=node("div","gold-control gold-color-control");
      const id=`gold-${isGlyph?"glyph-":""}${key}`;
      const caption=node("label","",label);caption.htmlFor=id;
      const row=node("div","gold-color-row");
      const picker=node("input");picker.type="color";picker.id=id;picker.setAttribute("aria-label",label);
      const code=node("input");code.type="text";code.maxLength=7;code.spellcheck=false;code.setAttribute("aria-label",label+" HEX");
      const apply=value=>{if(!hex(value))return;picker.value=value;code.value=value.toUpperCase();if(isGlyph)setGlyph(key,value);else update(s=>{s[key]=value;});};
      picker.addEventListener("input",()=>apply(picker.value));code.addEventListener("input",()=>apply(code.value));
      for(const input of [picker,code])input.addEventListener("change",finishEdit);
      code.addEventListener("blur",()=>{if(!hex(code.value))code.value=picker.value.toUpperCase();});
      row.append(picker,code);wrap.append(caption,row);container.append(wrap);
      const record={type:"color",picker,code};(isGlyph?glyphInputs:globalInputs).set(key,record);return record;
    }
    function addCheck(container,key,label) {
      const wrap=node("label","gold-check gold-control");const input=node("input");input.type="checkbox";
      input.addEventListener("change",()=>{finishEdit();update(s=>{s[key]=input.checked;});finishEdit();});
      wrap.append(input,label);container.append(wrap);globalInputs.set(key,{type:"checkbox",input});
    }
    function characterList() {
      const output=[];let index=0;
      for(const char of state.text){output.push({index,char});index+=char.length;}
      return output;
    }
    function choose(index,event={}) {
      const all=characterList().filter(item=>!/[\s/]/u.test(item.char)).map(item=>item.index);
      if(event.shiftKey){selection=new Set(all.filter(i=>i>=Math.min(anchor,index)&&i<=Math.max(anchor,index)));}
      else if(event.ctrlKey||event.metaKey){if(selection.has(index))selection.delete(index);else selection.add(index);anchor=index;}
      else {selection=new Set([index]);anchor=index;}
      updateSelection();
    }
    function findWord(term) {
      if(!term.trim()){announce("선택할 단어를 입력해 주세요.");return;}
      const indices=new Set();
      for(let start=state.text.indexOf(term);start>=0;start=state.text.indexOf(term,start+term.length)) {
        for(const item of characterList())if(item.index>=start&&item.index<start+term.length&&!/[\s/]/u.test(item.char))indices.add(item.index);
      }
      if(!indices.size){announce("입력한 단어가 문구에 없습니다.");return;}
      selection=indices;updateSelection();
    }
    function rebuildCharacters() {
      characters.replaceChildren();words.replaceChildren();
      for(const item of characterList()) {
        if(/[\s/]/u.test(item.char)){characters.append(node("span","gold-space",item.char==="/"||item.char==="\n"?"↵":"·"));continue;}
        const chip=button(item.char,event=>choose(item.index,event),"gold-char");
        chip.dataset.index=item.index;chip.setAttribute("aria-label",`글자 ${item.index+1} ${item.char} 선택`);characters.append(chip);
      }
      const terms=[...new Set(state.text.split(/[\s/]+/u).filter(Boolean))].slice(0,12);
      for(const term of terms)words.append(button(term,()=>findWord(term),"gold-word"));
      updateSelection();
    }
    function updateSelection() {
      const indices=chosenIndices();
      selectionName.textContent=indices.length?`선택: ${indices.map(index=>String.fromCodePoint(state.text.codePointAt(index))).join("")} · ${indices.length}글자`:"선택한 글자 없음";
      for(const chip of characters.querySelectorAll("button[data-index]"))chip.setAttribute("aria-pressed",String(selection.has(Number(chip.dataset.index))));
      syncGlyphControls();
    }
    function syncGlyphControls() {
      const indices=chosenIndices();
      for(const [key,record] of glyphInputs) {
        if(record.type==="number") {
          record.slider.value=record.numeric.value=glyphValue(key);
          record.slider.disabled=record.numeric.disabled=!indices.length;
        } else {
          const value=state.glyphs[indices[0]]?.color||state.top;
          record.picker.value=value;record.code.value=value.toUpperCase();record.picker.disabled=record.code.disabled=!indices.length;
        }
      }
    }
    function syncControls() {
      textInput.value=state.text;
      for(const [key,record] of globalInputs) {
        if(record.type==="number")record.slider.value=record.numeric.value=state[key];
        else if(record.type==="checkbox")record.input.checked=!!state[key];
        else {record.picker.value=state[key];record.code.value=state[key].toUpperCase();}
      }
      syncGlyphControls();
    }
    function historyStep(from,to) {
      if(!from.length)return;
      finishEdit();to.push(JSON.stringify(state));state=validate(JSON.parse(from.pop()));
      selection.clear();syncControls();rebuildCharacters();refresh();loadFont(fontFor(state));
      announce("설정을 변경했습니다.");
    }
    function promptText() {
      const individual=Object.entries(state.glyphs||{}).map(([index,value])=>{
        const character=String.fromCodePoint(state.text.codePointAt(Number(index))||32);
        const details=[];
        for(const [key,title,unit] of [["scale","크기","%"],["rotate","회전","°"],["slant","추가 기울기","°"],["offsetX","가로 이동","px"],["offsetY","세로 이동","px"]])if(value[key]!==undefined)details.push(`${title} ${value[key]}${unit}`);
        if(value.color)details.push(`단색 ${value.color}`);
        return `${Number(index)+1}번째 ‘${character}’: ${details.join(", ")}`;
      }).filter(item=>!item.endsWith(": ")).join("; ");
      return `문구 “${state.text}” · ${fontFor(state).name}. 전체 ${state.size}px, 자간 ${state.tracking}px, 글자 기울기 ${state.slant}°, 줄 회전 ${state.tilt}°, 가로 ${state.stretchX}%·세로 ${state.stretchY}%, 줄 간격 ${state.lineHeight}, 위치 (${state.positionX}, ${state.positionY})px. ${state.gradient?`금빛 그라데이션 ${state.top} → ${state.highlight} → ${state.bottom}, 방향 ${state.gradientAngle}°, 밝은 띠 ${state.highlightStop}%`:`단색 ${state.top}`}. 외곽선 ${state.outline} ${state.outlineWidth}px, 바깥 선 ${state.outer} ${state.outerWidth}px, 입체 ${state.depth}px·그림자 ${state.shadow} ${state.shadowAngle}°·번짐 ${state.blur}px. ${individual?`글자별 설정 — ${individual}. `:""}${state.effect?`작은 사방 별 ${state.starCount}개·${state.starSize}px·선명도 ${state.starOpacity}, 금빛 가루 ${state.dustCount}개·${state.dustSize}px·선명도 ${state.dustOpacity}, 퍼짐 ${state.scatter}%, 뒤쪽 빛 ${state.glowOpacity}·${state.glowSpread}px, 반짝임 ${state.twinkleSpeed}배, 배치번호 ${state.seed}. `:"반짝임·가루 끔. "}미리보기 배경 ${state.bg}. PNG는 흰 배경 또는 투명으로 선택 저장.`;
    }
    function saveState(manual=false) {
      try {localStorage.setItem(STORAGE,JSON.stringify(state));if(manual)announce("이 브라우저에 설정을 저장했습니다.");}
      catch(_){if(manual)announce("브라우저 저장이 제한되어 있습니다. ‘설정 파일 받기’로 보관하세요.");}
    }
    function refresh() {
      undo.disabled=!history.length;redo.disabled=!future.length;
      fontName.textContent=fontFor(state).name;
      textCount.textContent=`${state.text.length}/${MAX_TEXT}자 · 긴 문구는 화면 안에 맞춰 자동 축소됩니다.`;
      promptBox.value=promptText();
      for(const [id,entry] of fontCards)entry.pick.setAttribute("aria-pressed",String(id===fontFor(state).id));
      drawMain();
      clearTimeout(miniTimer);miniTimer=setTimeout(drawMinis,150);
      clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveState(),350);
      startAnimation();
    }
    function drawMain() {
      geometry=renderer.draw(canvas,state,{time:sceneTime,transparent:false});
      if(geometry?.fitScale<.99)fitNote.textContent=`화면에 맞춤 ${Math.round(geometry.fitScale*100)}% · 글자를 누르거나 아래 버튼에서 선택`;
      else fitNote.textContent="글자를 누르거나 아래 버튼에서 선택 · PNG에는 선택 표시가 들어가지 않습니다.";
      const font=fontFor(state), info=loaded.get(font.id);
      fontStatus.textContent=info===true?"✓ 글꼴 로딩 완료":info===false?"글꼴을 불러오지 못해 기본 글꼴로 표시 중":"글꼴을 불러오는 중…";
      fontStatus.classList.toggle("is-error",info===false);
    }
    function drawMinis() {
      if(card.hidden)return;
      for(const font of FONTS){const entry=fontCards.get(font.id);renderer.draw(entry.sample,{...state,fontFamily:family(font.id),bg:"#ffffff"},{time:sceneTime,transparent:false});}
    }
    function isVisible() {return !card.hidden&&!document.hidden&&card.isConnected;}
    function tick(timestamp) {
      animationId=0;
      if(!isVisible()||!playback||!state.effect||!state.twinkleSpeed){lastTick=0;return;}
      if(lastTick)sceneTime+=Math.min((timestamp-lastTick)/1000,.1);
      lastTick=timestamp;
      if(timestamp-lastDraw>50){drawMain();lastDraw=timestamp;}
      animationId=requestAnimationFrame(tick);
    }
    function startAnimation() {
      if(animationId&&(!isVisible()||!playback||!state.effect||!state.twinkleSpeed)){cancelAnimationFrame(animationId);animationId=0;lastTick=0;}
      if(!animationId&&isVisible()&&playback&&state.effect&&state.twinkleSpeed)animationId=requestAnimationFrame(tick);
    }
    async function loadFont(font) {
      if(loaded.has(font.id))return;
      loaded.set(font.id,"loading");
      try {
        const faces=await document.fonts.load(`400 48px "${font.id}"`,"병현표 특급 서비스");
        loaded.set(font.id,faces.length>0);
      }catch(_){loaded.set(font.id,false);}
      const entry=fontCards.get(font.id);if(entry)entry.hint.textContent=loaded.get(font.id)===true?font.note:"글꼴 로딩 실패";
      if(isVisible()){drawMain();drawMinis();}
    }
    function onVisibility() {
      if(isVisible()){for(const font of FONTS)loadFont(font);drawMain();drawMinis();}
      startAnimation();
    }
    const observer=new MutationObserver(onVisibility);
    observer.observe(card,{attributes:true,attributeFilter:["hidden"]});
    document.addEventListener("visibilitychange",onVisibility);
    function downloadBlob(blob,filename) {
      const url=URL.createObjectURL(blob),link=node("a");link.href=url;link.download=filename;
      document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    }
    async function exportPng(transparent) {
      const font=fontFor(state);
      if(loaded.get(font.id)!==true){announce("선택한 글꼴을 불러온 뒤 PNG를 저장할 수 있습니다. 로딩 실패라면 다른 글꼴을 선택해 주세요.");return;}
      const exportState=clone(state),exportTime=sceneTime;
      const output=document.createElement("canvas");output.width=1600;output.height=520;
      if(!transparent)exportState.bg="#ffffff";
      renderer.draw(output,exportState,{time:exportTime,transparent});
      output.toBlob(blob=>{
        if(!blob){announce("PNG를 만들지 못했습니다. 다시 시도해 주세요.");return;}
        downloadBlob(blob,`T05-gold-caption-${transparent?"transparent":"white"}.png`);
        announce(`${transparent?"투명":"흰 배경"} PNG를 1600×520 크기로 저장했습니다.`);
      },"image/png");
    }
    syncControls();rebuildCharacters();refresh();
    // activate() in the parent editor runs just after mount; wait for its hidden state.
    queueMicrotask(onVisibility);
  };
})();
