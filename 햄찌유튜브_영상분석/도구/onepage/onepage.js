/* 한 페이지판: 동물·소품·이름 선택 → 모든 프롬프트/대본 즉시 갱신, 전체 복사, 사진 크게 보기 (외부 전송 없음) */
(function () {
  const KIT = window.KIT, PAGES = window.PAGES || {}, CHUNKS = window.CHUNKS || [];
  const store = {
    get(k, d) { try { const v = localStorage.getItem("hk1_" + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("hk1_" + k, v); } catch (e) { /* 저장 불가 환경은 무시 */ } },
  };
  const state = {
    animal: store.get("animal", KIT.DEFAULT.animal), acc: store.get("acc", KIT.DEFAULT.acc),
    custom: store.get("custom", ""), customPun: store.get("customPun", "뭉"), name: store.get("name", KIT.DEFAULT.name),
  };
  function animal() {
    if (state.animal === "custom") return { en: state.custom || "a cute small animal", noun: "animal", pun: state.customPun || "뭉", ko: "직접 입력" };
    return KIT.ANIMALS.find(a => a.id === state.animal) || KIT.ANIMALS[0];
  }
  function acc() { return KIT.ACCESSORIES.find(a => a.id === state.acc) || KIT.ACCESSORIES[0]; }
  function ctx(v) {
    const a = animal(), c = { HERO: [a.en, acc().en, KIT.HERO_SUFFIX].filter(Boolean).join(", "), ANIMAL: a.noun, PUN: a.pun };
    const p = PAGES[v];
    if (p) {
      c.COSTUME = p.costume || "";
      Object.entries(p.cast || {}).forEach(([k, x]) => { if (x && x.en) c[k.toUpperCase()] = x.en; });
      Object.entries(p.sets || {}).forEach(([k, x]) => { c[k.toUpperCase()] = x; });
    }
    return c;
  }
  const fill = (tpl, c) => String(tpl).replace(/\{([A-Z0-9_]+)\}/g, (m, k) => (k in c ? c[k] : m)).replace(/\{이름\}/g, state.name || "OO");
  function render() {
    const cache = {};
    document.querySelectorAll("[data-tpl]").forEach(el => {
      const v = el.getAttribute("data-v") || "common";
      el.textContent = fill(el.getAttribute("data-tpl"), cache[v] || (cache[v] = ctx(v)));
    });
    document.querySelectorAll("[data-kind='animalname']").forEach(el => { el.textContent = animal().ko; });
    const cw = document.getElementById("customWrap");
    if (cw) cw.classList.toggle("hide", state.animal !== "custom");
  }
  function fullText() {
    const head = `(선택한 동물: ${animal().ko} / 소품: ${acc().ko} / 이름: ${state.name})\n\n`;
    return head + CHUNKS.map(ch => fill(ch.md, ctx(ch.v))).join("\n");
  }
  function copyText(text, btn) {
    const done = () => { if (!btn) return; const t = btn.textContent; btn.textContent = "복사됨 ✓"; btn.classList.add("done");
      setTimeout(() => { btn.textContent = t; btn.classList.remove("done"); }, 1500); };
    const fallback = () => {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { /* 무시 */ } ta.remove();
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  }
  function download(name, text) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  document.addEventListener("DOMContentLoaded", () => {
    const sel = document.getElementById("animal"), ac = document.getElementById("acc");
    const custom = document.getElementById("customAnimal"), cpun = document.getElementById("customPun"), nm = document.getElementById("heroName");
    KIT.ANIMALS.forEach(a => sel.add(new Option(a.ko, a.id))); sel.add(new Option("직접 입력", "custom"));
    KIT.ACCESSORIES.forEach(a => ac.add(new Option(a.ko, a.id)));
    sel.value = state.animal; ac.value = state.acc; custom.value = state.custom; cpun.value = state.customPun; nm.value = state.name;
    sel.addEventListener("change", () => { state.animal = sel.value; store.set("animal", sel.value); render(); });
    ac.addEventListener("change", () => { state.acc = ac.value; store.set("acc", ac.value); render(); });
    custom.addEventListener("input", () => { state.custom = custom.value; store.set("custom", custom.value); render(); });
    cpun.addEventListener("input", () => { state.customPun = cpun.value; store.set("customPun", cpun.value); render(); });
    nm.addEventListener("input", () => { state.name = nm.value; store.set("name", nm.value); render(); });
    document.addEventListener("click", e => {
      const all = e.target.closest("[data-copyall]");
      if (all) { copyText(fullText(), all); return; }
      const dl = e.target.closest("[data-downloadall]");
      if (dl) { download(dl.getAttribute("data-downloadall"), fullText()); return; }
      const b = e.target.closest(".copy[data-target]");
      if (b) { const t = document.getElementById(b.dataset.target); if (t) copyText(t.textContent, b); return; }
      const f = e.target.closest(".shotfilters button[data-who]");
      if (f) {
        const box = f.closest("section");
        box.querySelectorAll(".shotfilters button[data-who]").forEach(x => x.classList.toggle("on", x === f));
        const want = f.dataset.who;
        box.querySelectorAll(".shot").forEach(s => {
          const w = s.dataset.who;
          const show = want === "all" || (want === "hero" && (w === "hero" || w === "hero_costume")) ||
            (want === "human" && ["cw1", "cw2", "boss", "leader", "friend", "group"].includes(w)) || (want === "other" && ["insert", "black", "card"].includes(w));
          s.classList.toggle("hide", !show);
        });
        return;
      }
      const img = e.target.closest("img[data-zoom]");
      if (img) {
        const lb = document.getElementById("lightbox"); lb.querySelector("img").src = img.src;
        lb.querySelector("figcaption").textContent = img.alt || ""; lb.classList.remove("hide"); return;
      }
      if (e.target.closest("#lightbox")) document.getElementById("lightbox").classList.add("hide");
      const r = e.target.closest("[data-jump]");
      if (r) location.hash = r.getAttribute("data-jump");
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") { const lb = document.getElementById("lightbox"); if (lb) lb.classList.add("hide"); } });
    const tb = document.getElementById("themeBtn"), saved = store.get("theme", "");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    tb.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark"; document.documentElement.setAttribute("data-theme", next); store.set("theme", next);
    });
    render();
  });
})();
