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
  for (const card of cards) {
    const links = [...card.querySelectorAll(".ty22-fonts a")];
    const names = links.map(a => a.textContent.replace(/^\d+\. /, ""));
    const families = links.map(a => "ref-" + a.pathname.split("/").pop());
    const palette = [...card.querySelectorAll(".ty22-color b")].map(b => b.textContent);
    const editor = document.createElement("div");
    editor.innerHTML = '<div class="choices" aria-label="폰트 비교"></div><div class="live"></div><div class="controls"></div>';
    card.querySelector(".ty22-text").after(editor);
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
    control("word","문구","text",card.id === "T02" ? "NO!!" : card.querySelector(".ty22-text b").nextSibling.textContent.trim().replaceAll(" / "," "));
    control("size","크기 (px)","range",42,14,96);
    control("spacing","자간 (px)","range",-1,-8,12);
    control("color","글자색","color",palette[0]);
    control("stroke","외곽선 (px)","range",2,0,12);
    control("edge","외곽선 색","color","#17131a");
    control("shadow","그림자 거리 (px)","range",2,0,12);
    control("shade","그림자 색","color","#382732");
    control("gradient","그라데이션","checkbox",card.id === "T05");
    control("end","그라데이션 끝색","color",palette[1] || "#ffffff");
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
      live.textContent = v.word;
      Object.assign(live.style, {
        fontFamily: '"' + families[selected] + '"', fontSize:v.size+"px", letterSpacing:v.spacing+"px",
        color:gradient ? "transparent" : v.color, webkitTextStroke:v.stroke+"px "+v.edge,
        backgroundImage:gradient ? 'linear-gradient('+v.color+', '+v.end+')' : 'none',
        backgroundClip:"text", filter:'drop-shadow(0 '+v.shadow+'px 0 '+(Number(v.shadow) ? v.shade : "transparent")+')'
      });
      for (const button of buttons) button.lastChild.textContent = v.word;
      prompt.textContent = original + ' 편집값 적용 — 문구 “'+v.word+'”, '+names[selected]+', '+v.size+'px, 자간 '+v.spacing+'px, 글자색 '+v.color+', 외곽선 '+v.stroke+'px '+v.edge+', 그림자 Y '+v.shadow+'px '+v.shade+', 그라데이션 '+(gradient ? v.color+'→'+v.end : '끔')+', 배경 투명.';
    }
    editor.addEventListener("input",redraw);
    redraw();
  }
  activate(location.hash.slice(1));
})();
