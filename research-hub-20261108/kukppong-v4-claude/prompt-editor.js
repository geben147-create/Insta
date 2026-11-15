(function () {
  "use strict";
  var KEY = "kukppong-v43-prompt-editor-v1";
  var PATH = "https://github.com/geben147-create/Insta/edit/main/research-hub-20261108/kukppong-v4-claude/prompt.html";
  var PALETTE = [
    ["--pink", "분홍 강조", "#D92372"],
    ["--soft", "연분홍 배경", "#FEE9F2"],
    ["--lime", "연연두 배경", "#F5FFDC"],
    ["--limeh", "형광 연두", "#D9FF65"],
    ["--cyan", "형광 파랑", "#55E8FF"],
    ["--sand", "주의 박스", "#FCF1ED"]
  ];
  var state, targets, editMode = false;
  var bar, panel, statusNode;

  function blank() {
    return {edits:{}, colors:{}, fontSize:16, pageWidth:1120, hidePhotos:false, versions:[]};
  }
  function load() {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (raw && typeof raw === "object") {
        return Object.assign(blank(), raw, {
          edits: raw.edits && typeof raw.edits === "object" ? raw.edits : {},
          colors: raw.colors && typeof raw.colors === "object" ? raw.colors : {},
          versions: Array.isArray(raw.versions) ? raw.versions : []
        });
      }
    } catch (e) {}
    return blank();
  }
  function save(message) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      statusNode.textContent = (message || "자동 저장됨") + " · 이 브라우저";
    } catch (e) {
      statusNode.textContent = "브라우저 저장 불가 · JSON 백업을 사용하세요";
    }
  }
  function el(tag, className, textValue) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (textValue) node.textContent = textValue;
    return node;
  }
  function button(label, id, className) {
    var node = el("button", "ed-btn " + (className || ""), label);
    node.type = "button";
    node.id = id;
    return node;
  }
  function download(filename, data, mime) {
    var a = document.createElement("a");
    var url = URL.createObjectURL(new Blob([data], {type:mime}));
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }
  function safeColor(value) {
    return typeof value === "string" && /^#[0-9A-F]{6}$/i.test(value);
  }
  function paint() {
    document.documentElement.setAttribute("data-theme", "light");
    PALETTE.forEach(function (item) {
      var color = safeColor(state.colors[item[0]]) ? state.colors[item[0]] : item[2];
      document.documentElement.style.setProperty(item[0], color);
      var input = document.getElementById("ed-color-" + item[0].slice(2));
      if (input) {
        input.value = color;
        var output = input.parentElement.querySelector("output");
        if (output) output.textContent = color.toUpperCase();
      }
    });
    state.fontSize = Math.max(13, Math.min(22, Number(state.fontSize) || 16));
    state.pageWidth = Math.max(880, Math.min(1500, Number(state.pageWidth) || 1120));
    document.documentElement.style.setProperty("--textsize", state.fontSize + "px");
    document.documentElement.style.setProperty("--pagewidth", state.pageWidth + "px");
    var size = document.getElementById("ed-font-size");
    if (size) size.value = state.fontSize;
    var width = document.getElementById("ed-page-width");
    if (width) width.value = state.pageWidth;
    var gallery = document.querySelector("#ref + p + .gal");
    if (gallery) gallery.classList.toggle("ed-hidden", !!state.hidePhotos);
    var imageSection = document.querySelector("#ref + p + .gal + h3 + p");
    if (imageSection) imageSection.classList.toggle("ed-hidden", !!state.hidePhotos);
    var hide = document.getElementById("ed-hide-photos");
    if (hide) hide.textContent = state.hidePhotos ? "🖼 사진 표시" : "🖼 사진 숨기기";
  }
  function gather() {
    targets = Array.prototype.slice.call(document.querySelectorAll(
      ".wrap h1, .wrap h2, .wrap h3, .wrap p, .wrap li, .wrap td, .wrap figcaption, .wrap .lead, .wrap .warn, .wrap .code pre"
    )).filter(function (node) {
      return !node.querySelector("img") && !node.closest(".ed-bar");
    });
    targets.forEach(function (node, i) {
      node.dataset.edKey = "t" + i;
      if (node.matches(".code pre")) return;
      node.addEventListener("input", function () {
        if (!editMode) return;
        state.edits[node.dataset.edKey] = {kind:"html", value:node.innerHTML};
        save("글 자동 저장됨");
      });
    });
  }
  function cleanse(node) {
    // Local backups may be imported. Keep ordinary inline markup but never execute event attributes/scripts.
    var allowed = /^(B|STRONG|I|EM|U|A|CODE|BR|SPAN|SMALL|SUP|SUB|MARK|DIV|P|UL|OL|LI)$/;
    Array.prototype.slice.call(node.childNodes).forEach(function (child) {
      if (child.nodeType !== 1) return;
      if (!allowed.test(child.tagName)) {
        child.replaceWith(document.createTextNode(child.textContent || ""));
        return;
      }
      Array.prototype.slice.call(child.attributes).forEach(function (attr) {
        var validHref = child.tagName === "A" && attr.name === "href" &&
          /^(https?:\/\/|\.?\.?\/|#)/i.test(attr.value);
        if (!validHref) child.removeAttribute(attr.name);
      });
      cleanse(child);
    });
  }
  function restoreEdits() {
    targets.forEach(function (node) {
      var change = state.edits[node.dataset.edKey];
      if (!change || typeof change.value !== "string") return;
      if (node.matches(".code pre")) node.textContent = change.value;
      else {
        var temp = document.createElement("div");
        temp.innerHTML = change.value;
        cleanse(temp);
        node.innerHTML = temp.innerHTML;
      }
    });
  }
  function getVideoPre() {
    var heading = document.getElementById("STEP-7-영상-편집-형식-고정");
    return heading && heading.nextElementSibling && heading.nextElementSibling.querySelector("pre");
  }
  function syncVideoSpec() {
    var pre = getVideoPre();
    if (!pre) return;
    var c = function (k, fallback) { return safeColor(state.colors[k]) ? state.colors[k] : fallback; };
    var line = "    · 제작 색상: 연연두 " + c("--lime","#F5FFDC") +
      " / 형광연두 " + c("--limeh","#D9FF65") +
      " / 형광파랑 " + c("--cyan","#55E8FF") +
      " / 연분홍 " + c("--soft","#FEE9F2") +
      " / 주의박스 " + c("--sand","#FCF1ED") +
      " (글씨는 검정/흰색으로 대비 확보)";
    var text = pre.textContent;
    if (!/^    · 제작 색상: .*$/m.test(text)) return;
    pre.textContent = text.replace(/^    · 제작 색상: .*$/m, line);
    state.edits[pre.dataset.edKey] = {kind:"text",value:pre.textContent};
    var textarea = pre.parentElement.querySelector("textarea.ed-textarea");
    if (textarea) textarea.value = pre.textContent;
  }
  function setEdit(value) {
    editMode = value;
    document.body.classList.toggle("ed-editing", value);
    var toggle = document.getElementById("ed-edit");
    toggle.textContent = value ? "✅ 편집 끝내기" : "✏️ 글 수정";
    toggle.classList.toggle("primary", value);
    targets.forEach(function (node) {
      if (node.matches(".code pre")) {
        var existing = node.parentElement.querySelector("textarea.ed-textarea");
        if (value && !existing) {
          var textarea = el("textarea", "ed-textarea");
          textarea.setAttribute("aria-label","프롬프트 직접 편집");
          textarea.value = node.textContent;
          textarea.rows = Math.min(24, Math.max(6, textarea.value.split("\n").length + 1));
          textarea.addEventListener("input", function () {
            node.textContent = textarea.value;
            state.edits[node.dataset.edKey] = {kind:"text",value:textarea.value};
            save("프롬프트 자동 저장됨");
          });
          node.parentElement.appendChild(textarea);
        }
        if (!value && existing) existing.remove();
      } else {
        if (value) {
          node.contentEditable = "true";
          node.setAttribute("spellcheck","false");
        } else {
          node.removeAttribute("contenteditable");
          node.removeAttribute("spellcheck");
        }
      }
    });
    statusNode.textContent = value ? "글씨나 대본을 클릭해서 수정하세요 · 자동 저장" : "읽기 모드 · 브라우저에 저장된 편집은 유지";
  }
  function snapshot() {
    var item = {
      at:new Date().toLocaleString("ko-KR"),
      edits:JSON.parse(JSON.stringify(state.edits)),
      colors:Object.assign({},state.colors),
      fontSize:state.fontSize,pageWidth:state.pageWidth,hidePhotos:state.hidePhotos
    };
    state.versions.push(item);
    state.versions = state.versions.slice(-10);
    save("버전 저장됨");
    populateSnapshots();
  }
  function populateSnapshots() {
    var select = document.getElementById("ed-versions");
    if (!select) return;
    select.innerHTML = "";
    var blank = document.createElement("option");
    blank.value = ""; blank.textContent = "저장한 버전 선택"; select.appendChild(blank);
    state.versions.forEach(function (item, i) {
      var option = document.createElement("option");
      option.value = String(i);
      option.textContent = (i+1) + "판 · " + item.at;
      select.appendChild(option);
    });
  }
  function exportHTML() {
    if (editMode) setEdit(false);
    var cloned = document.documentElement.cloneNode(true);
    var editor = cloned.querySelector("#prompt-editor-bar");
    if (editor) editor.remove();
    cloned.querySelectorAll("[data-ed-key]").forEach(function (item) {
      item.removeAttribute("data-ed-key");
      item.removeAttribute("contenteditable");
      item.removeAttribute("spellcheck");
    });
    cloned.querySelector("body").classList.remove("ed-editing");
    cloned.querySelectorAll(".ed-hidden").forEach(function (item) {
      item.classList.remove("ed-hidden");
    });
    download("prompt.html", "<!doctype html>\n" + cloned.outerHTML, "text/html;charset=utf-8");
    statusNode.textContent = "HTML 다운로드 완료 · GitHub에 반영하려면 파일 교체 후 Commit";
  }
  function setupBar() {
    var wrap = document.querySelector(".wrap");
    var nav = wrap.querySelector(".topnav");
    bar = el("section", "ed-bar");
    bar.id = "prompt-editor-bar";
    bar.setAttribute("aria-label","페이지 편집 도구");
    var row = el("div","ed-row");
    row.appendChild(button("✏️ 글 수정", "ed-edit"));
    row.appendChild(button("🎨 색·디자인", "ed-design"));
    row.appendChild(button("💾 브라우저 저장", "ed-save"));
    row.appendChild(button("📄 HTML 다운로드", "ed-html"));
    var github = el("a", "ed-link", "GitHub 원본 편집");
    github.href = PATH; github.target = "_blank"; github.rel = "noopener noreferrer";
    row.appendChild(github);
    statusNode = el("span","ed-status","이 브라우저에서만 변경 사항 보관");
    statusNode.setAttribute("aria-live","polite");
    row.appendChild(statusNode);
    bar.appendChild(row);
    var note = el("p","ed-note","글 수정 → 원하는 문장 클릭 → 자동 저장. 색·디자인 변경도 즉시 미리보기에 적용됩니다. GitHub 사이트 전체에 반영하려면 HTML 다운로드 후 저장소의 prompt.html을 교체·커밋하세요.");
    bar.appendChild(note);
    panel = el("div","ed-panel ed-hidden");
    panel.id = "ed-panel";
    var controls = el("div","ed-controls");
    PALETTE.forEach(function (item) {
      var label = el("label","ed-color");
      var left = el("span","",item[1]);
      var input = el("input");
      input.type = "color";
      input.id = "ed-color-" + item[0].slice(2);
      input.value = item[2];
      input.addEventListener("input", function () {
        state.colors[item[0]] = input.value.toUpperCase();
        paint(); syncVideoSpec(); save("색상 자동 저장됨");
      });
      var output = el("output","",item[2]);
      label.appendChild(left);label.appendChild(input);label.appendChild(output);
      controls.appendChild(label);
    });
    panel.appendChild(controls);
    var samples = el("div","ed-samples");
    [["lime","연연두 실습 박스"],["pink","연분홍 안내"],["hilite","형광 연두"],["cyan","형광 파랑"],["warn","주의 박스"]].forEach(function (item) {
      samples.appendChild(el("span","ed-sample " + item[0],item[1]));
    });
    panel.appendChild(samples);
    var settings = el("div","ed-row");
    settings.style.marginTop = "10px";
    var fontLabel = el("label","ed-size","글자 크기");
    var font = el("input");
    font.id = "ed-font-size";font.type = "range";font.min = "13";font.max = "22";font.step = "1";
    font.addEventListener("input",function () {state.fontSize=Number(font.value);paint();save("글자 크기 저장됨");});
    fontLabel.appendChild(font);settings.appendChild(fontLabel);
    var widthLabel = el("label","ed-size","페이지 폭");
    var width = el("input");
    width.id = "ed-page-width";width.type = "range";width.min = "880";width.max = "1500";width.step = "20";
    width.addEventListener("input",function () {state.pageWidth=Number(width.value);paint();save("페이지 폭 저장됨");});
    widthLabel.appendChild(width);settings.appendChild(widthLabel);
    settings.appendChild(button("🖼 사진 숨기기","ed-hide-photos"));
    settings.appendChild(button("📌 현재 버전 보관","ed-snapshot"));
    var select = el("select","ed-select");
    select.id = "ed-versions";select.setAttribute("aria-label","저장한 버전 불러오기");
    settings.appendChild(select);
    settings.appendChild(button("⬇ JSON 백업","ed-json"));
    settings.appendChild(button("⬆ JSON 불러오기","ed-import"));
    settings.appendChild(button("↩ 초기 상태 복원","ed-reset"));
    var fileInput = el("input");
    fileInput.type = "file";fileInput.accept = ".json,application/json";fileInput.hidden = true;fileInput.id = "ed-file";
    settings.appendChild(fileInput);
    panel.appendChild(settings);
    panel.appendChild(el("div","ed-help","📝 브라우저 저장과 스냅샷은 이 기기 전용입니다. 여러 기기에서 똑같이 보려면 HTML을 다운로드해 GitHub 저장소에 커밋하세요. 원본 V4.0 기록과 다른 데이터는 건드리지 않습니다."));
    bar.appendChild(panel);
    nav.insertAdjacentElement("afterend",bar);
    document.getElementById("ed-edit").addEventListener("click",function () {setEdit(!editMode);});
    document.getElementById("ed-design").addEventListener("click",function () {
      panel.classList.toggle("ed-hidden");
      this.classList.toggle("on", !panel.classList.contains("ed-hidden"));
    });
    document.getElementById("ed-save").addEventListener("click",function () {save("수동 저장됨");});
    document.getElementById("ed-html").addEventListener("click",exportHTML);
    document.getElementById("ed-hide-photos").addEventListener("click",function () {state.hidePhotos=!state.hidePhotos;paint();save("사진 표시 설정 저장됨");});
    document.getElementById("ed-snapshot").addEventListener("click",snapshot);
    select.addEventListener("change",function () {
      var index = Number(select.value);
      if (select.value === "" || !state.versions[index]) return;
      if (!confirm("선택한 버전으로 글과 색상 설정을 되돌릴까요? 현재 작업은 버전 저장 후 되돌리는 것이 안전합니다.")) return;
      var oldVersions = state.versions;
      state = Object.assign(blank(),state.versions[index],{versions:oldVersions});
      save("이전 버전 복원됨");location.reload();
    });
    document.getElementById("ed-json").addEventListener("click",function () {
      download("kukppong-v43-editor-backup.json",JSON.stringify({format:KEY,created:new Date().toISOString(),state:state},null,2),"application/json;charset=utf-8");
    });
    document.getElementById("ed-import").addEventListener("click",function () {fileInput.click();});
    fileInput.addEventListener("change",function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var imported = JSON.parse(String(reader.result));
          if (imported.format !== KEY || !imported.state || !imported.state.edits) throw new Error("잘못된 백업 형식");
          state = Object.assign(blank(), imported.state);
          save("백업 불러옴"); location.reload();
        } catch (e) { alert("백업을 읽을 수 없습니다: " + e.message); }
      };
      reader.readAsText(file);
      fileInput.value = "";
    });
    document.getElementById("ed-reset").addEventListener("click",function () {
      if (!confirm("이 브라우저에서 저장한 글·색상·버전을 모두 초기화할까요? GitHub 원본은 변경되지 않습니다.")) return;
      try {localStorage.removeItem(KEY);} catch(e){}
      location.reload();
    });
  }
  function init() {
    if (!document.querySelector(".wrap .topnav") || document.getElementById("prompt-editor-bar")) return;
    state = load();
    gather();
    restoreEdits();
    setupBar();
    paint();
    populateSnapshots();
    // Paste only plain text into editable blocks. Prevent embedded HTML/scripts.
    document.addEventListener("paste",function (event) {
      var destination = event.target.closest("[contenteditable=true]");
      if (!editMode || !destination) return;
      event.preventDefault();
      var text = (event.clipboardData && event.clipboardData.getData("text/plain")) || "";
      var selection = window.getSelection();
      if (!selection || !selection.rangeCount) return;
      var range = selection.getRangeAt(0);
      range.deleteContents();
      var inserted = document.createTextNode(text);
      range.insertNode(inserted);
      range.setStartAfter(inserted);range.collapse(true);
      selection.removeAllRanges();selection.addRange(range);
      destination.dispatchEvent(new Event("input",{bubbles:true}));
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init);
  else init();
})();