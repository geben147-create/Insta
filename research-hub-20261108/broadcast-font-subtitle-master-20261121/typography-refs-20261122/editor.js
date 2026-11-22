(() => {
  const root = document.querySelector("#ty22");
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
  tabs.forEach(tab => tab.onclick = event => {
    event.preventDefault();
    history.replaceState(null, "", tab.hash);
    activate(tab.hash.slice(1));
  });
  window.addEventListener("hashchange", () => activate(location.hash.slice(1)));
  const referenceStyles = {
    T01: {angle: -12, edge: "#130e0c", shade: "#bf1213", end: "#ff741c"},
    T05: {angle: -16, edge: "#2d1f10", shade: "#a56a0d", end: "#a56a0d", middle: "#f5be22"}
  };
  for (const card of cards) {
    const style = referenceStyles[card.id];
    const links = [...card.querySelectorAll(".ty22-fonts a")];
    const names = links.map(a => a.textContent.replace(/^\d+\. /, ""));
    const families = links.map(a => "ref-" + a.pathname.split("/").pop());
    const palette = [...card.querySelectorAll(".ty22-color b")].map(b => b.textContent);
    const editor = document.createElement("div");
    editor.innerHTML = '<div class="choices" aria-label="폰트 비교"></div><div class="live"></div><div class="controls"></div>';
    card.querySelector(".ty22-text").after(editor);
    if (style) editor.classList.add("reference-editor");
    const choices = editor.querySelector(".choices");
    const live = editor.querySelector(".live");
    const prompt = card.querySelector(".ty22-prompt");
    const original = prompt.textContent;
    const fields = {};
    function control(key, title, type, value, min, max) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = type;
      if (min !== undefined) { input.min = min; input.max = max; }
      if (type === "checkbox") input.checked = value;
      else input.value = value;
      label.className = key;
      label.append(title, input);
      editor.querySelector(".controls").append(label);
      fields[key] = input;
    }
    control("word","문구","text",card.id === "T02" ? "NO!!" : card.querySelector(".ty22-text b").nextSibling.textContent.trim().replaceAll(" / ",style ? " / " : " "));
    control("size","크기 (px)","range",style ? 47 : 42,14,96);
    control("spacing","자간 (px)","range",-1,-8,12);
    control("color",card.id === "T01" ? "강조 글자색" : "글자색","color",card.id === "T01" ? palette[1] : palette[0]);
    control("stroke","외곽선 (px)","range",style ? 4 : 2,0,12);
    control("edge","외곽선 색","color",style?.edge || "#17131a");
    control("shadow","그림자 거리 (px)","range",2,0,12);
    control("shade","그림자 색","color",style?.shade || "#382732");
    control("gradient","그라데이션","checkbox",Boolean(style));
    control("end","그라데이션 끝색","color",style?.end || palette[1] || "#ffffff");
    if (card.id === "T01") control("base","기본 글자색","color",palette[0]);
    if (style) control("slant","기울기 (°)","range",style.angle,-30,30);
    if (style?.middle) {
      control("middle","중간 금색","color",style.middle);
      control("nameScale","‘병현’ 크기 (%)","range",115,85,150);
      control("accentScale","‘특’ 크기 (%)","range",125,85,150);
    }
    if (style) {
      const swatches = card.querySelector(".ty22-colors");
      swatches.setAttribute("aria-label", "클릭해서 색 적용");
      for (const [index, swatch] of [...swatches.children].entries()) {
        const key = (style.middle ? ["color","color","middle","end","edge"] : ["base","color","end","edge","shade"])[index];
        const button = document.createElement("button");
        button.type = "button";
        button.className = swatch.className;
        button.append(...swatch.childNodes);
        button.title = fields[key].parentElement.textContent + "에 적용";
        button.onclick = () => {
          fields[key].value = palette[index];
          if (key === "middle" || key === "end") fields.gradient.checked = true;
          redraw();
        };
        swatch.replaceWith(button);
      }
      editor.querySelector(".controls").before(swatches);
    }
    let selected = 0;
    const buttons = renderFontChoices(choices,names,selected,i => { selected = i; redraw(); });
    buttons.forEach((button,i) => {
      const sample = document.createElement("span");
      sample.style.fontFamily = '"' + families[i] + '"';
      button.append(sample);
    });
    function redraw() {
      const v = Object.fromEntries(Object.entries(fields).map(([k,input]) => [k,input.value]));
      const gradient = fields.gradient.checked;
      if (style) {
        for (const button of buttons) renderReference(button.lastChild, v, gradient);
        live.hidden = true;
      } else {
        live.textContent = v.word;
        Object.assign(live.style, {
          fontFamily: '"' + families[selected] + '"', fontSize:v.size+"px", letterSpacing:v.spacing+"px",
          color:gradient ? "transparent" : v.color, webkitTextStroke:v.stroke+"px "+v.edge,
          backgroundImage:gradient ? 'linear-gradient('+v.color+', '+v.end+')' : 'none',
          backgroundClip:"text", filter:'drop-shadow(0 '+v.shadow+'px 0 '+(Number(v.shadow) ? v.shade : "transparent")+')'
        });
        for (const button of buttons) button.lastChild.textContent = v.word;
      }
      prompt.textContent = original + ' 편집값 적용 — 문구 “'+v.word+'”, '+names[selected]+', '+v.size+'px, 자간 '+v.spacing+'px, 글자색 '+v.color+', 외곽선 '+v.stroke+'px '+v.edge+', 그림자 Y '+v.shadow+'px '+v.shade+', 그라데이션 '+(gradient ? [v.color,v.middle,v.end].filter(Boolean).join('→') : '끔')+(v.base ? ', 기본 글자색 '+v.base : '')+(style ? ', 기울기 '+v.slant+'°' : '')+(style?.middle ? ', 병현 '+v.nameScale+'%, 특 '+v.accentScale+'%' : '')+', 배경 투명.';
    }
    function renderReference(sample, v, gradient) {
      const lines = v.word.split("/").map(line => line.trim());
      sample.replaceChildren();
      sample.className = "reference-sample";
      sample.style.setProperty("--size", v.size + "px");
      sample.style.setProperty("--tracking", v.spacing + "px");
      sample.style.setProperty("--slant", v.slant + "deg");
      sample.style.setProperty("--edge", v.stroke + "px " + v.edge);
      sample.style.setProperty("--shadow", "drop-shadow(0 " + v.shadow + "px 0 " + (Number(v.shadow) ? v.shade : "transparent") + ")");
      for (const [index, text] of lines.entries()) {
        const line = document.createElement("span");
        line.className = "reference-line";
        const highlight = !style.middle && lines.length > 1 && index === 1;
        const fill = style.middle
          ? `linear-gradient(${v.middle} 0%, ${v.color} 24%, ${v.color} 49%, ${v.middle} 68%, ${v.end} 100%)`
          : `linear-gradient(${v.color} 8%, ${v.end} 86%)`;
        line.style.setProperty("--ink", style.middle || highlight || lines.length === 1 ? v.color : v.base);
        if (gradient && (style.middle || highlight || lines.length === 1)) {
          line.classList.add("gradient-line");
          line.style.setProperty("--fill", fill);
        }
        const segments = style.middle ? text.split(/(병현|특)/) : [text];
        for (const segment of segments) {
          if (!segment) continue;
          const glyphs = document.createElement("span");
          glyphs.textContent = segment;
          if (line.classList.contains("gradient-line")) {
            const strokeText = document.createElement("span");
            strokeText.textContent = segment;
            glyphs.replaceChildren(strokeText);
            const fillText = document.createElement("span");
            fillText.textContent = segment;
            fillText.setAttribute("aria-hidden", "true");
            glyphs.append(fillText);
          }
          glyphs.className = "reference-ink";
          if (segment === "병현") glyphs.style.fontSize = v.nameScale + "%";
          if (segment === "특") glyphs.style.fontSize = v.accentScale + "%";
          line.append(glyphs);
        }
        sample.append(line);
      }
    }
    editor.addEventListener("input",redraw);
    redraw();
  }
  activate(location.hash.slice(1));
})();
