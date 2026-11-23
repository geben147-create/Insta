(() => {
  const root = document.querySelector("#ty22");
  const assetBase = new URL("effects/", document.currentScript.src);
  const tabs = [...root.querySelectorAll(".ty22-jump a")];
  const cards = [...root.querySelectorAll(".ty22-item")];
  function activate(id) {
    const selected = cards.find(card => card.id === id) ||
      (typeof window.mountGoldEditor === "function" && cards.find(card => card.id === "T05")) || cards[0];
    for (const card of cards) card.hidden = card !== selected;
    for (const tab of tabs) {
      if (tab.hash === "#" + selected.id) tab.setAttribute("aria-current", "true");
      else tab.removeAttribute("aria-current");
    }
  }
  for (const tab of tabs) tab.onclick = event => {
    event.preventDefault();
    history.replaceState(null, "", tab.hash);
    activate(tab.hash.slice(1));
  };
  window.addEventListener("hashchange", () => activate(location.hash.slice(1)));

  // 2026-11-23 원본 사진(R01~R08) 글자 픽셀을 직접 잘라 중앙값으로 잰 색(HEX)이다.
  // colors: 색상 칸·색상 칩 / lines: 줄별 기본 채움색·크기·정렬 / words: 줄 안에서 색이 바뀌는 낱말
  // fills: 그라데이션 정지점([색 키, %])과 낱말별 외곽선 색 / stroke·outer·shadow·blur: '크기' 기준 px(미리보기 크기에 비례 환산)
  const KO = '"ref-jalnan", "ref-394", sans-serif'; // T02 한글 줄: 원본처럼 굵고 둥근 잘난체
  const presets = {
    T01: {size:47, spacing:-1.5, slant:-11, tilt:-2, align:"left", lineHeight:.96, stroke:4, outer:9, shadow:3, blur:0,
      colors:[["base","흰 글씨 윗부분","#FAFAF9"],["baseEnd","흰 글씨 아랫부분(은회색)","#CDCCCE"],["color","가운데 줄 노랑(위)","#F8F42A"],["end","가운데 줄 주황(아래)","#EE5414"],
        ["edge","안쪽 검정 외곽선","#190C0D"],["outerColor","바깥 빨강 테두리","#8E1E16"],["shade","아래 그림자","#5A0E0C"],["bg","원본 배경(어두운 남색)","#1F2229"]],
      fills:{base:{grad:[["base",48],["baseEnd",64]]}, color:{grad:[["color",46],["end",92]]}},
      lines:[{fill:"base"},{fill:"color"},{fill:"base", scale:.96, indent:1.9}]},
    T02: {size:38, spacing:-1, slant:0, tilt:0, fit:5.6, align:"center", stroke:4, outer:3, shadow:0, blur:0, minor:true,
      word:"18년 된 한국영화 보고 충격받은 외국인들 / NO!! / 추격자 해외반응 리액션",
      colors:[["base","윗줄 흰색","#F6F5F4"],["yellow","윗줄 노랑 낱말","#F1EE33"],["color","NO!! 위 주황빨강","#E8451A"],["end","NO!! 아래 빨강","#E2170E"],
        ["gold","아래 제목 노랑(위)","#F8F45E"],["goldEnd","아래 제목 귤색(아래)","#F0BE26"],["edge","검정 외곽선","#1C0A00"],["outerColor","바깥 빨강 테두리","#8A1E1D"],["shade","그림자","#3A0A0A"],["bg","원본 배경","#2A2427"]],
      fills:{color:{grad:[["color",22],["end",58]]}, gold:{grad:[["gold",30],["goldEnd",88]]}},
      lines:[{fill:"base", scale:.8, font:KO, words:[["충격받은 외국인들","yellow"]]},
        {fill:"color", scale:2, transform:"rotate(-5deg) skewX(-12deg) scaleY(1.45)", lineHeight:1.5},
        {fill:"gold", font:KO}]},
    T03: {size:38, spacing:-1, slant:0, tilt:0, stretch:112, fit:4.9, align:"center", stroke:3, outer:0, shadow:2, blur:3, effect:"flame", effectInline:"ends",
      colors:[["base","흰 본문","#FCFCFC"],["color","다홍 강조(위)","#DF5052"],["end","다홍 강조(아래)","#F26668"],["edge","얇은 검정 외곽선","#16131B"],["shade","부드러운 그림자","#16131B"],["bg","원본 배경(남색 셔츠)","#222A3E"]],
      fills:{color:{grad:[["color",30],["end",78]]}},
      lines:[{fill:"base", words:[["'누나 같아 보여요'","color"]]},{fill:"base", words:[["자존심 상하는 얘긴 줄 알아?!","color"]]}]},
    T04: {size:38, spacing:-1.5, slant:0, tilt:-1.5, stretch:116, fit:5.6, align:"center", stroke:5, outer:0, shadow:2, blur:0, effect:"burst",
      word:"정말 연애에 재능이 없는 선수예요", badge:{text:"선수 박탈", stroke:false, left:"36%"},
      colors:[["base","흰 본문","#FDFDFD"],["color","빨강 강조(위)","#E25254"],["end","빨강 강조(아래)","#F26163"],["edge","검정 외곽선","#111114"],["shade","검정 그림자","#111114"],
        ["badgeBg","‘선수 박탈’ 박스","#040506"],["badgeInk","박스 글씨","#EFEFEF"],["bg","원본 배경","#2B2A2E"]],
      fills:{color:{grad:[["color",28],["end",62]]}},
      lines:[{fill:"base", words:[["재능이 없는 선수","color"]]}]},
    T05: {size:47, spacing:-1, slant:0, tilt:0, align:"center", stroke:4, outer:2.5, shadow:3, blur:0, effect:"sparkle",
      glyphScale:[["병현","nameScale","‘병현’ 크기 (%)"],["특","accentScale","‘특’ 크기 (%)"]],
      colors:[["base","금색 윗면","#F6CB52"],["middle","금색 밝은 띠","#FCEC82"],["end","금색 아랫면","#F2CF5C"],["edge","진갈색 외곽선","#2E1A05"],["outerColor","청동빛 바깥 테두리","#A8763C"],["shade","입체 그림자","#2E1A05"],["bg","원본 배경","#5A4636"]],
      fills:{base:{grad:[["base",22],["middle",58],["end",86]]}},
      lines:[{fill:"base"}]},
    T06: {size:56, spacing:0, slant:0, tilt:0, fit:10, align:"left", stroke:6, outer:0, shadow:4.5, shadowAngle:45, blur:0, minor:true,
      word:"한마디로 / 재수 없는 스타일",
      colors:[["base","먹색 글씨","#040404"],["edge","먹 글씨 흰 외곽선","#FBFAF8"],["color","‘스타일’ 흰 글씨","#FCFCFC"],["edge2","‘스타일’ 검정 외곽선","#080404"],["shade","오른쪽 아래 검정 그림자","#000000"],["bg","원본 배경(주황 니트)","#854737"]],
      fills:{color:{edge:"edge2"}},
      lines:[{fill:"base", scale:.45, indent:.3},{fill:"base", words:[["스타일","color"]]}]},
    T07: {size:38, spacing:-1, slant:0, tilt:0, fit:6.8, align:"left", stroke:0, outer:0, shadow:0, blur:0, effect:"lightning", effectInline:"last", minor:true,
      colors:[["base","흰 글씨(외곽선 없음)","#FDFDFC"],["color","빨강 강조","#E03C3E"],["edge","외곽선(원본 없음·켤 때만)","#1C1717"],["shade","그림자(원본 없음)","#000000"],["bolt","번개 빨강(PNG)","#D94B50"],["bg","원본 배경","#1C222E"]],
      lines:[{fill:"base", scale:.55, indent:1.9},{fill:"base", words:[["풀 파티","color"]]}]},
    T08: {size:38, spacing:-1, slant:0, tilt:0, fit:6.6, align:"left", stroke:4, outer:0, shadow:2, blur:0, minor:true,
      word:"초대받지 않는 손님의 깜짝 등장..! / ‘웃음 유발’ 블랙박스 모음",
      badge:{text:"스페셜", stroke:true},
      colors:[["base","윗줄 흰 글씨","#F9F9F9"],["color","아랫줄 레몬 노랑","#F9FB57"],["edge","검정 외곽선","#0D0D06"],["shade","검정 그림자","#0D0D06"],
        ["badgeBg","‘스페셜’ 흰 박스","#FDFDFA"],["badgeInk","‘스페셜’ 노랑 글씨","#EEF176"],["frame","테두리 노랑","#FBFD4C"],["frame2","테두리 검정","#0F0F0F"],["bg","원본 배경","#5C5450"]],
      lines:[{fill:"base", scale:.68},{fill:"color"}]}
  };

  for (const card of cards) {
    if (card.id === "T05" && typeof window.mountGoldEditor === "function") {
      window.mountGoldEditor(card);
      continue;
    }
    const preset = presets[card.id];
    const links = [...card.querySelectorAll(".ty22-fonts a")];
    const names = links.map(a => a.textContent.replace(/^\d+\. /, ""));
    const families = links.map(a => `"${a.dataset.font || "ref-" + a.pathname.split("/").pop()}", "ref-106", sans-serif`);
    const editor = document.createElement("div");
    editor.className = "reference-editor";
    editor.innerHTML = '<div class="choices" aria-label="폰트 비교"></div><p class="selection-help">문구 입력칸에서 글자를 드래그한 뒤 색상 칩을 누르세요. 선택 없이 누르면 그 부분(칩 이름) 색이 바뀝니다. 칩의 HEX는 원본 사진 글자 픽셀 실측값입니다.</p><div class="palette-controls"></div><div class="controls"></div>';
    card.querySelector(".ty22-text").after(editor);
    const controls = editor.querySelector(".controls");
    const fields = {};
    function control(key, title, type, value, min, max, step) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      label.className = key;
      input.type = type;
      if (min !== undefined) { input.min = min; input.max = max; }
      if (step) input.step = step;
      if (type === "checkbox") input.checked = value;
      else input.value = value;
      label.append(title, input);
      controls.append(label);
      fields[key] = input;
    }
    const caption = card.querySelector(".ty22-text b").nextSibling.textContent.trim();
    const colorLabel = Object.fromEntries(preset.colors.map(([key,label]) => [key,label]));
    const hasGradient = Object.values(preset.fills || {}).some(fill => fill.grad);
    control("word","문구 (/로 줄 분리)","text",preset.word || caption);
    control("size","크기 (px)","range",preset.size,14,96);
    control("spacing","자간 (px)","range",preset.spacing,-8,12,.5);
    for (const [key,label,value] of preset.colors) control(key,label,"color",value);
    control("stroke","외곽선 (px)","range",preset.stroke,0,14,.5);
    control("outer","바깥 테두리 (px)","range",preset.outer,0,14,.5);
    control("shadow","그림자 거리 (px)","range",preset.shadow,0,12,.5);
    control("blur","그림자 번짐 (px)","range",preset.blur,0,12,.5);
    if (hasGradient) control("gradient","그라데이션","checkbox",true);
    control("slant","글자 기울기 (°)","range",preset.slant,-30,30,.5);
    control("tilt","줄 각도 (°)","range",preset.tilt,-15,15,.5);
    control("stretch","글자 세로 비율 (%)","range",preset.stretch || 100,80,150);
    if (preset.minor) control("minorScale","첫 줄 크기 (%)","range",Math.round(preset.lines[0].scale*100),25,110);
    for (const [,key,label] of preset.glyphScale || []) control(key,label,"range",100,70,150);
    if (preset.badge) control("badge","박스 문구","text",preset.badge.text);
    if (preset.effect) control("effect","장식 표시","checkbox",true);

    const word = fields.word;
    let selected = 0;
    let range = [0,0];
    let overrides = [];
    function rememberRange() { range = [word.selectionStart, word.selectionEnd]; }
    for (const event of ["select","keyup","pointerup","focus"]) word.addEventListener(event, rememberRange);
    let previousWord = word.value;
    word.addEventListener("input", () => {
      const current = word.value;
      let start = 0;
      let suffix = 0;
      while (start < current.length && start < previousWord.length && current[start] === previousWord[start]) start++;
      while (suffix < current.length-start && suffix < previousWord.length-start &&
        current.at(-suffix-1) === previousWord.at(-suffix-1)) suffix++;
      const preserved = Array.from({length: current.length}, (_,index) => {
        if (index < start) return overrides[index];
        if (index >= current.length-suffix) return overrides[index + previousWord.length-current.length];
      });
      overrides = preserved;
      previousWord = current;
      rememberRange();
    });
    const swatches = card.querySelector(".ty22-colors");
    function applyColor(value, key) {
      const [start, end] = range;
      if (start !== end) {
        for (let i = start; i < end; i++) overrides[i] = value;
      } else if (fields[key]) {
        fields[key].value = value;
      }
      redraw();
    }
    function addChip(label, value, key) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ty22-color";
      button.title = "원본 실측 " + value.toUpperCase();
      const paint = document.createElement("i");
      paint.style.backgroundColor = value;
      const code = document.createElement("b");
      code.textContent = value.toUpperCase();
      button.append(paint, label + " ", code);
      button.onclick = () => applyColor(value,key);
      swatches.append(button);
    }
    swatches.replaceChildren();
    for (const [key,label,value] of preset.colors) addChip(label,value,key);
    const pickerLabel = document.createElement("label");
    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = (preset.colors.find(([key]) => key === "color") || preset.colors[0])[2];
    picker.addEventListener("input", () => applyColor(picker.value,"color"));
    pickerLabel.append("사용자 색 ",picker);
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "선택 색 지우기";
    clear.onclick = () => { overrides = []; range = [0,0]; word.setSelectionRange(0,0); redraw(); };
    const reset = document.createElement("button");
    reset.type = "button";
    reset.textContent = "원본값으로 되돌리기";
    reset.onclick = () => {
      for (const [key,,value] of preset.colors) fields[key].value = value;
      for (const key of ["size","spacing","stroke","outer","shadow","blur","slant","tilt"]) fields[key].value = preset[key];
      fields.stretch.value = preset.stretch || 100;
      if (fields.gradient) fields.gradient.checked = true;
      if (fields.minorScale) fields.minorScale.value = Math.round(preset.lines[0].scale*100);
      for (const [,key] of preset.glyphScale || []) fields[key].value = 100;
      overrides = [];
      redraw();
    };
    const paletteControls = editor.querySelector(".palette-controls");
    paletteControls.append(swatches,pickerLabel,clear,reset);
    const buttons = renderFontChoices(editor.querySelector(".choices"),names,selected,i => { selected = i; redraw(); });
    // 2026-11-23: 원본 사진 + 폰트 3종 미리보기를 왼쪽에 고정하고, 조절 칸은 오른쪽에 둔다.
    const photo = card.querySelector(".ty22-photo");
    if (photo) {
      const stage = document.createElement("div");
      stage.className = "ty22-stage reference-editor";
      photo.before(stage);
      stage.append(photo, editor.querySelector(".choices"));
    }
    const samples = buttons.map((button,i) => {
      const sample = document.createElement("span");
      sample.className = "reference-sample";
      sample.style.fontFamily = families[i];
      button.append(sample);
      return sample;
    });
    if (preset.effect || card.id === "T06") {
      const name = preset.effect || "brush-halo";
      const download = document.createElement("a");
      download.href = new URL(name + ".png",assetBase);
      download.download = name + ".png";
      download.textContent = "효과 PNG 받기";
      card.querySelector(".ty22-actions").append(download);
    }

    function renderSample(sample, v) {
      const em = px => (Number(px) / Number(v.size)).toFixed(4) + "em";
      sample.replaceChildren();
      sample.style.setProperty("--size", v.size+"px");
      sample.style.setProperty("--tracking", em(v.spacing));
      sample.style.setProperty("--bg", v.bg);
      sample.style.setProperty("--fit", (preset.fit || 8.2) + "cqw");
      sample.style.setProperty("--frame", v.frame || "transparent");
      sample.style.setProperty("--frame2", v.frame2 || "transparent");
      sample.style.textAlign = preset.align;
      const filters = [];
      if (Number(v.outer) > 0) {
        const d = em(v.outer/2);
        for (let round = 0; round < 2; round++)
          filters.push(`drop-shadow(${d} 0 0 ${v.outerColor})`,`drop-shadow(-${d} 0 0 ${v.outerColor})`,`drop-shadow(0 ${d} 0 ${v.outerColor})`,`drop-shadow(0 -${d} 0 ${v.outerColor})`);
      }
      if (Number(v.shadow) > 0 || Number(v.blur) > 0) {
        const angle = (preset.shadowAngle ?? 90) * Math.PI / 180;
        filters.push(`drop-shadow(${em(Math.cos(angle)*v.shadow)} ${em(Math.sin(angle)*v.shadow)} ${em(v.blur)} ${v.shade})`);
      }
      const filter = filters.join(" ") || "none";
      if (v.badge && preset.badge) {
        const badge = document.createElement("span");
        badge.className = "reference-badge" + (preset.badge.stroke ? " stroked" : "");
        badge.style.setProperty("--badge-bg", v.badgeBg);
        badge.style.setProperty("--badge-ink", v.badgeInk);
        badge.style.setProperty("--badge-edge", v.edge);
        if (preset.badge.left) badge.style.marginLeft = preset.badge.left;
        badge.textContent = v.badge;
        sample.append(badge);
      }
      if (fields.effect?.checked && !preset.effectInline) {
        for (const side of ["left","right"]) {
          const effect = document.createElement("img");
          effect.className = "reference-effect " + side;
          effect.src = new URL(preset.effect + ".png", assetBase);
          effect.alt = "";
          sample.append(effect);
        }
      }
      // 바깥 테두리·그림자는 줄 묶음 전체에 한 번만 걸어 윗줄·아랫줄 테두리가 글자를 덮지 않게 한다.
      const block = document.createElement("span");
      block.className = "reference-text";
      block.style.filter = filter;
      sample.append(block);
      for (const [lineIndex, match] of [...v.word.matchAll(/[^/]+/g)].entries()) {
        const text = match[0].trim();
        const offset = match.index + match[0].indexOf(text);
        const spec = preset.lines[Math.min(lineIndex, preset.lines.length-1)];
        const line = document.createElement("span");
        line.className = "reference-line";
        const scale = lineIndex === 0 && v.minorScale ? v.minorScale/100 : spec.scale || 1;
        line.style.fontSize = scale+"em";
        line.style.transform = `rotate(${v.tilt}deg) skewX(${v.slant}deg) scaleY(${v.stretch/100}) ${spec.transform || ""}`;
        if (spec.indent) line.style.paddingLeft = spec.indent+"em";
        if (spec.lineHeight || preset.lineHeight) line.style.lineHeight = spec.lineHeight || preset.lineHeight;
        if (spec.font) line.style.fontFamily = spec.font;
        // 문구 위치(UTF-16 단위)별 채움색 키와 글자 크기 키
        const fills = Array.from({length:text.length}, () => spec.fill);
        const glyphKeys = [];
        function mark(term, apply) {
          for (let start = text.indexOf(term); start >= 0 && term; start = text.indexOf(term, start + term.length))
            for (let i = start; i < start + term.length; i++) apply(i);
        }
        for (const [term, fill] of spec.words || []) mark(term, i => { fills[i] = fill; });
        for (const [term, key] of preset.glyphScale || []) mark(term, i => { glyphKeys[i] = key; });
        let position = 0;
        const attributes = Array.from(text, character => {
          const index = position;
          const fill = fills[index];
          const override = overrides[offset+index];
          position += character.length;
          return {character, color:override || v[fill], gradient:!override && v.gradient && preset.fills?.[fill]?.grad ? fill : "",
            edge:v[preset.fills?.[fill]?.edge] || v.edge, scale:glyphKeys[index] ? v[glyphKeys[index]] : ""};
        });
        const segments = [];
        for (const item of attributes) {
          const last = segments.at(-1);
          if (last && last.color === item.color && last.gradient === item.gradient && last.edge === item.edge && last.scale === item.scale) last.character += item.character;
          else segments.push({...item});
        }
        for (const segment of segments) {
          const glyphs = document.createElement("span");
          glyphs.className = "reference-ink";
          glyphs.style.setProperty("--ink",segment.color);
          glyphs.style.setProperty("--edge",`${em(v.stroke)} ${segment.edge}`);
          glyphs.textContent = segment.character;
          if (segment.scale && Number(segment.scale) !== 100) glyphs.style.fontSize = segment.scale+"%";
          if (segment.gradient) {
            const stops = preset.fills[segment.gradient].grad.map(([key,at]) => `${v[key]} ${at}%`).join(", ");
            glyphs.classList.add("gradient-ink");
            glyphs.style.setProperty("--fill",`linear-gradient(${stops})`);
            const foreground = document.createElement("span");
            const outline = document.createElement("span");
            foreground.setAttribute("aria-hidden","true");
            foreground.textContent = outline.textContent = segment.character;
            glyphs.replaceChildren(outline,foreground);
          }
          line.append(glyphs);
        }
        block.append(line);
      }
      // 불꽃(T03)·번개(T07)는 원본처럼 글줄 양끝에 붙인다: ends=첫 줄 앞+마지막 줄 뒤, last=마지막 줄 앞뒤
      if (fields.effect?.checked && preset.effectInline) {
        const lines = [...block.children];
        const icon = side => {
          const effect = document.createElement("img");
          effect.className = "reference-inline-effect " + side;
          effect.src = new URL(preset.effect + ".png", assetBase);
          effect.alt = "";
          return effect;
        };
        const last = lines.at(-1);
        (preset.effectInline === "ends" ? lines[0] : last)?.prepend(icon("left"));
        last?.append(icon("right"));
      }
    }
    const prompt = card.querySelector(".ty22-prompt");
    const original = prompt.textContent;
    function redraw() {
      const v = Object.fromEntries(Object.entries(fields).map(([key,input]) => [key,input.type === "checkbox" ? input.checked : input.value]));
      for (const sample of samples) renderSample(sample,v);
      const overridesUsed = overrides.flatMap((color,index) => color ? [`${index+1}:${color}`] : []).join(" ");
      const colorList = preset.colors.filter(([key]) => key !== "bg").map(([key]) => `${colorLabel[key]} ${v[key].toUpperCase()}`).join(" · ");
      prompt.textContent = `${original} 적용 설정 — “${v.word}” / ${names[selected]} / ${v.size}px · 자간 ${v.spacing}px · 글자 기울기 ${v.slant}° · 줄 각도 ${v.tilt}° · 세로 ${v.stretch}% / ${colorList}` +
        ` / 외곽선 ${v.stroke}px · 바깥 테두리 ${v.outer}px · 그림자 ${v.shadow}px 번짐 ${v.blur}px` +
        (v.gradient ? " · 그라데이션 켬" : "") +
        (v.minorScale ? ` · 첫 줄 ${v.minorScale}%` : "") +
        (v.nameScale ? ` · 병현 ${v.nameScale}% · 특 ${v.accentScale}%` : "") +
        (v.badge ? ` · 박스 “${v.badge}”` : "") +
        (v.effect ? ` · 양옆 ${preset.effect} PNG` : "") +
        (overridesUsed ? ` · 개별색(문구 위치) ${overridesUsed}` : "") + " · 배경 투명.";
    }
    controls.addEventListener("input",redraw);
    redraw();
  }
  activate(location.hash.slice(1));
})();
