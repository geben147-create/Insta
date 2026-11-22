(() => {
  const root = document.querySelector("#ty22");
  const assetBase = new URL("effects/", document.currentScript.src);
  const tabs = [...root.querySelectorAll(".ty22-jump a")];
  const cards = [...root.querySelectorAll(".ty22-item")];
  function activate(id) {
    const selected = cards.find(card => card.id === id) || cards[0];
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

  const presets = {
    T01: {skew:-12, tilt:-5, edge:"#130e0c", shadow:"#bf1213", accent:"#ffea18", end:"#ff741c", accentLine:1, scales:[.87,1.1,.94]},
    T02: {skew:-12, tilt:-5, edge:"#130909", shadow:"#c30e0c", accent:"#ff6820", end:"#c30e0c", accentLine:1, scales:[.46,1.5,.61], secondary:"#ffe713", word:"18년 된 한국영화 보고 충격받은 외국인들 / NO!! / 추격자 해외반응 리액션"},
    T03: {skew:-8, tilt:0, accent:"#e54a4f", edge:"#271b20", words:["누나 같아 보여요","자존심 상하는 얘긴 줄 알아?!"], effect:"flame", scales:[.83,.83]},
    T04: {skew:-10, tilt:-4, stretch:120, accent:"#ef5356", edge:"#191414", words:["재능이 없는 선수"], badge:"선수 박탈", effect:"burst", word:"정말 연애에 재능이 없는 선수예요"},
    T05: {skew:-16, tilt:0, edge:"#2d1f10", shadow:"#a56a0d", accent:"#fff6c8", end:"#a56a0d", middle:"#f5be22", effect:"sparkle"},
    T06: {skew:0, tilt:0, edge:"#fffefb", shadow:"#d8d7d6", accent:"#141010", scales:[.45,1], word:"한마디로 / 재수 없는 스타일"},
    T07: {skew:-3, tilt:0, accent:"#e63236", edge:"#1c1717", words:["풀 파티"], scales:[.48,1], effect:"lightning"},
    T08: {skew:0, tilt:0, accent:"#f6fa55", edge:"#080808", accentLine:1, scales:[.56,1], badge:"스페셜", word:"초대받지 않은 손님의 깜짝 등장!! / ‘웃음 유발’ 블랙박스 모음"}
  };
  for (const card of cards) {
    const preset = presets[card.id];
    const links = [...card.querySelectorAll(".ty22-fonts a")];
    const names = links.map(a => a.textContent.replace(/^\d+\. /, ""));
    const families = links.map(a => `"ref-${a.pathname.split("/").pop()}", "ref-106", sans-serif`);
    const palette = [...card.querySelectorAll(".ty22-color")];
    const editor = document.createElement("div");
    editor.className = "reference-editor";
    editor.innerHTML = '<div class="choices" aria-label="폰트 비교"></div><p class="selection-help">문구 입력칸에서 글자를 드래그한 뒤 색상 칩을 누르세요. 선택 없이 누르면 기본 배색에 적용됩니다.</p><div class="palette-controls"></div><div class="controls"></div>';
    card.querySelector(".ty22-text").after(editor);
    const controls = editor.querySelector(".controls");
    const fields = {};
    function control(key, title, type, value, min, max) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      label.className = key;
      input.type = type;
      if (min !== undefined) { input.min = min; input.max = max; }
      if (type === "checkbox") input.checked = value;
      else input.value = value;
      label.append(title, input);
      controls.append(label);
      fields[key] = input;
    }
    const base = palette[0].querySelector("b").textContent;
    const caption = card.querySelector(".ty22-text b").nextSibling.textContent.trim();
    control("word","문구 (/로 줄 분리)","text",preset.word || caption);
    control("size","크기 (px)","range",card.id === "T01" || card.id === "T05" ? 47 : 38,14,96);
    control("spacing","자간 (px)","range",-1,-8,12);
    control("base","기본 글자색","color",["T02","T08"].includes(card.id) ? "#fffdfc" : base);
    control("color","강조색","color",preset.accent);
    control("stroke","외곽선 (px)","range",card.id === "T06" ? 5 : 4,0,12);
    control("edge","외곽선 색","color",preset.edge);
    control("shadow","그림자 거리 (px)","range",3,0,12);
    control("shade","그림자 색","color",preset.shadow || "#24191b");
    control("gradient","그라데이션","checkbox",Boolean(preset.end));
    control("end","그라데이션 끝색","color",preset.end || "#ffffff");
    control("slant","글자 기울기 (°)","range",preset.skew,-30,30);
    control("tilt","줄 각도 (°)","range",preset.tilt,-15,15);
    control("stretch","글자 세로 비율 (%)","range",preset.stretch || 100,80,150);
    if (preset.secondary) control("secondary","아래 제목 색","color",preset.secondary);
    if (preset.scales) control("minorScale","작은 줄 크기 (%)","range",Math.round(preset.scales[0]*100),25,110);
    if (preset.middle) {
      control("middle","중간 금색","color",preset.middle);
      control("nameScale","‘병현’ 크기 (%)","range",115,85,150);
      control("accentScale","‘특’ 크기 (%)","range",125,85,150);
    }
    if (preset.badge) control("badge","박스 문구","text",preset.badge);
    if (preset.effect) control("effect","장식 표시","checkbox",true);
    if (card.id === "T08") control("frame","경고 테두리 색","color","#f6fa55");

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
    const defaultTargets = {
      T01:["base","color","end","edge","shade"], T02:["color","end","base","secondary","edge"],
      T03:["base","color","edge","color"], T04:["base","color","edge","base"],
      T05:["color","color","middle","end","edge"], T06:["base","edge","shade","base"],
      T07:["base","color","edge","color"], T08:["frame","edge","base","color"]
    };
    function applyColor(value, key) {
      const [start, end] = range;
      if (start !== end) {
        for (let i = start; i < end; i++) overrides[i] = value;
      } else {
        fields[key].value = value;
        if (key === "end" || key === "middle") fields.gradient.checked = true;
      }
      redraw();
    }
    function addChip(label, value, key, previous) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ty22-color";
      const paint = document.createElement("i");
      paint.style.backgroundColor = value;
      button.append(paint, label+" "+value.toUpperCase());
      button.onclick = () => applyColor(value,key);
      if (previous) previous.replaceWith(button);
      else swatches.append(button);
    }
    palette.forEach((entry,index) => addChip(entry.textContent.trim().replace(/#[0-9a-f]{6}/i,"").trim(),entry.querySelector("b").textContent,defaultTargets[card.id][index],entry));
    if (card.id === "T08") addChip("사용자 노랑", "#f6fa55","color");
    const pickerLabel = document.createElement("label");
    const picker = document.createElement("input");
    picker.type = "color";
    picker.value = preset.accent;
    picker.addEventListener("input", () => applyColor(picker.value,"color"));
    pickerLabel.append("사용자 색 ",picker);
    const clear = document.createElement("button");
    clear.type = "button";
    clear.textContent = "선택 색 지우기";
    clear.onclick = () => { overrides = []; range = [0,0]; word.setSelectionRange(0,0); redraw(); };
    const paletteControls = editor.querySelector(".palette-controls");
    paletteControls.append(swatches,pickerLabel,clear);
    const buttons = renderFontChoices(editor.querySelector(".choices"),names,selected,i => { selected = i; redraw(); });
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
      sample.replaceChildren();
      sample.style.setProperty("--size", v.size+"px");
      sample.style.setProperty("--tracking", v.spacing+"px");
      sample.style.setProperty("--transform", `rotate(${v.tilt}deg) skewX(${v.slant}deg) scaleY(${v.stretch/100})`);
      sample.style.setProperty("--edge", v.stroke+"px "+v.edge);
      sample.style.setProperty("--shadow", `drop-shadow(0 ${v.shadow}px 0 ${v.shade})`);
      sample.style.setProperty("--frame", v.frame || "transparent");
      const fill = v.middle
        ? `linear-gradient(${v.middle}, ${v.color} 24%, ${v.color} 49%, ${v.middle} 68%, ${v.end})`
        : `linear-gradient(${v.color} 8%, ${v.end} 86%)`;
      if (v.badge) {
        const badge = document.createElement("span");
        badge.className = "reference-badge";
        badge.textContent = v.badge;
        sample.append(badge);
      }
      if (fields.effect?.checked) {
        for (const side of ["left","right"]) {
          const effect = document.createElement("img");
          effect.className = "reference-effect " + side;
          effect.src = new URL(preset.effect + ".png", assetBase);
          effect.alt = "";
          sample.append(effect);
        }
      }
      for (const [lineIndex, match] of [...v.word.matchAll(/[^/]+/g)].entries()) {
        const text = match[0].trim();
        const offset = match.index + match[0].indexOf(text);
        const line = document.createElement("span");
        line.className = "reference-line";
        const scale = lineIndex === 0 && v.minorScale ? v.minorScale/100 : preset.scales?.[lineIndex] || 1;
        line.style.fontSize = scale+"em";
        if (card.id === "T02" && lineIndex !== 1) line.style.fontFamily = '"ref-106", sans-serif';
        let position = 0;
        const attributes = Array.from(text, character => {
          const emphasized = preset.accentLine === lineIndex || preset.middle || preset.words?.some(term => {
            const start = text.indexOf(term);
            return start >= 0 && position >= start && position < start + term.length;
          });
          const scale = !preset.middle ? "" : position < 2 && text.startsWith("병현") ? v.nameScale : character === "특" ? v.accentScale : "";
          const override = overrides[offset+position];
          position += character.length;
          return {character, color:override || (emphasized ? v.color : v.secondary && lineIndex === 2 ? v.secondary : v.base), gradient:!override && emphasized && v.gradient, scale};
        });
        const segments = [];
        for (const item of attributes) {
          const last = segments.at(-1);
          if (last && last.color === item.color && last.gradient === item.gradient && last.scale === item.scale) last.character += item.character;
          else segments.push(item);
        }
        for (const segment of segments) {
          const glyphs = document.createElement("span");
          glyphs.className = "reference-ink";
          glyphs.style.setProperty("--ink",segment.color);
          glyphs.textContent = segment.character;
          if (segment.scale) glyphs.style.fontSize = segment.scale+"%";
          if (segment.gradient) {
            glyphs.classList.add("gradient-ink");
            glyphs.style.setProperty("--fill",fill);
            const foreground = document.createElement("span");
            const outline = document.createElement("span");
            foreground.setAttribute("aria-hidden","true");
            foreground.textContent = outline.textContent = segment.character;
            glyphs.replaceChildren(outline,foreground);
          }
          line.append(glyphs);
        }
        sample.append(line);
      }
    }
    const prompt = card.querySelector(".ty22-prompt");
    const original = prompt.textContent;
    function redraw() {
      const v = Object.fromEntries(Object.entries(fields).map(([key,input]) => [key,input.type === "checkbox" ? input.checked : input.value]));
      for (const sample of samples) renderSample(sample,v);
      const overridesUsed = overrides.flatMap((color,index) => color ? [`${index+1}:${color}`] : []).join(" ");
      prompt.textContent = `${original} 적용 설정 — “${v.word}” / ${names[selected]} / ${v.size}px · 자간 ${v.spacing}px · 글자 기울기 ${v.slant}° · 줄 각도 ${v.tilt}° · 세로 ${v.stretch}% / 기본 ${v.base} · 강조 ${v.color} · 외곽 ${v.edge} ${v.stroke}px · 그림자 ${v.shade} Y${v.shadow}px` +
        (v.gradient ? ` · 그라데이션 ${[v.color,v.middle,v.end].filter(Boolean).join("→")}` : "") +
        (v.secondary ? ` · 아래 제목 ${v.secondary}` : "") +
        (v.minorScale ? ` · 작은 줄 ${v.minorScale}%` : "") +
        (v.nameScale ? ` · 병현 ${v.nameScale}% · 특 ${v.accentScale}%` : "") +
        (v.badge ? ` · 박스 “${v.badge}”` : "") +
        (v.effect ? ` · 양옆 ${preset.effect} PNG` : "") +
        (v.frame ? ` · 경고 테두리 ${v.frame}` : "") +
        (overridesUsed ? ` · 개별색(문구 위치) ${overridesUsed}` : "") + " · 배경 투명.";
    }
    controls.addEventListener("input",redraw);
    redraw();
  }
  activate(location.hash.slice(1));
})();
