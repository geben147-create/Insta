/* 동물 선택 → 모든 프롬프트를 즉시 다시 조립하는 페이지 스크립트 (외부 전송 없음) */
(function () {
  const KIT = window.KIT;
  const PAGE = window.PAGE || { cast: {}, sets: {}, look: "", costume: "" };
  const HERO_TYPES = ["hero", "hero_costume", "group"];
  const store = {
    get(k, d) { try { const v = localStorage.getItem("hk_" + k); return v === null ? d : v; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("hk_" + k, v); } catch (e) { /* 저장 불가 환경 무시 */ } },
  };
  const state = {
    animal: store.get("animal", "otter"), acc: store.get("acc", "lanyard"),
    custom: store.get("custom", ""), customPun: store.get("customPun", "뭉"), name: store.get("name", "김OO"),
  };

  function currentAnimal() {
    if (state.animal === "custom") {
      return { en: state.custom || "a cute small animal", noun: "animal", pun: state.customPun || "뭉", ko: "직접 입력" };
    }
    return KIT.ANIMALS.find(a => a.id === state.animal) || KIT.ANIMALS[0];
  }
  function currentAcc() { return KIT.ACCESSORIES.find(a => a.id === state.acc) || KIT.ACCESSORIES[0]; }
  function ctx() {
    const a = currentAnimal(), acc = currentAcc();
    const c = { HERO: [a.en, acc.en, KIT.HERO_SUFFIX].filter(Boolean).join(", "), ANIMAL: a.noun, PUN: a.pun, COSTUME: PAGE.costume || "" };
    Object.entries(PAGE.cast || {}).forEach(([k, v]) => { if (v && v.en) c[k.toUpperCase()] = v.en; });
    Object.entries(PAGE.sets || {}).forEach(([k, v]) => { c[k.toUpperCase()] = v; });
    return c;
  }
  function fill(tpl, c) {
    return String(tpl).replace(/\{([A-Z0-9_]+)\}/g, (m, k) => (k in c ? c[k] : m)).replace(/\{이름\}/g, state.name || "OO");
  }
  function composeImg(tpl, who, c) {
    const s = fill(tpl, c).trim();
    if (s.startsWith("(")) return s;
    const cons = HERO_TYPES.includes(who) ? " The animal must match the character reference sheet exactly (same fur color, markings and accessory)." : "";
    return s.replace(/[.\s]+$/, "") + ". " + (PAGE.look || "") + "." + cons;
  }
  function composeVid(tpl, who, c) {
    const s = fill(tpl, c).trim();
    if (/^(Edit|Still|\()/.test(s)) return s;
    const a = currentAnimal();
    const cons = HERO_TYPES.includes(who)
      ? ` Keep the ${a.noun}'s appearance, fur color and accessory identical to the reference. Realistic animal motion, no morphing.`
      : " Realistic natural motion, no morphing.";
    return s + cons;
  }
  function sheetPrompt(c) {
    return `Character reference sheet of ${c.HERO}: front view, three-quarter view, side view, back view and a full-body standing pose, ` +
      `plain light-grey studio background, soft even lighting, photorealistic, identical design in every view, 16:9.`;
  }
  function render() {
    const c = ctx();
    document.querySelectorAll("[data-tpl]").forEach(el => {
      const tpl = el.getAttribute("data-tpl"), kind = el.getAttribute("data-kind"), who = el.getAttribute("data-who") || "";
      el.textContent = kind === "img" ? composeImg(tpl, who, c) : kind === "vid" ? composeVid(tpl, who, c) : fill(tpl, c);
    });
    document.querySelectorAll("[data-kind='neg']").forEach(el => { el.textContent = KIT.NEGATIVE; });
    document.querySelectorAll("[data-kind='sheet']").forEach(el => { el.textContent = sheetPrompt(c); });
    document.querySelectorAll("[data-kind='animalname']").forEach(el => { el.textContent = currentAnimal().ko; });
    const cw = document.getElementById("customWrap");
    if (cw) cw.classList.toggle("hide", state.animal !== "custom");
  }

  function copyText(text, btn) {
    const done = () => { if (!btn) return; const t = btn.textContent; btn.textContent = "복사됨"; btn.classList.add("done");
      setTimeout(() => { btn.textContent = t; btn.classList.remove("done"); }, 1200); };
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, () => fallback()); }
    else fallback();
    function fallback() {
      const ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch (e) { /* 무시 */ } ta.remove();
    }
  }

  function allPromptsText() {
    const lines = [`# ${document.title} — 전체 프롬프트 (동물: ${currentAnimal().ko}, 소품: ${currentAcc().ko})`, "",
      "## 0단계 캐릭터 시트", document.querySelector("[data-kind='sheet']") ? document.querySelector("[data-kind='sheet']").textContent : "", "",
      "## 공통 네거티브", KIT.NEGATIVE, ""];
    document.querySelectorAll(".shot").forEach(s => {
      const h = s.querySelector(".shot-h").innerText.replace(/\s+/g, " ").trim();
      const img = s.querySelector("[data-kind='img']"), vid = s.querySelector("[data-kind='vid']");
      const m = s.querySelector(".models") ? s.querySelector(".models").innerText.replace(/\n+/g, " / ") : "";
      const nl = s.querySelector(".newline") ? s.querySelector(".newline").innerText : "";
      lines.push(`## ${h}`, `[이미지] ${img ? img.textContent : ""}`, `[영상] ${vid ? vid.textContent : ""}`, `[모델] ${m}`, nl, "");
    });
    return lines.join("\n");
  }

  document.addEventListener("DOMContentLoaded", () => {
    const sel = document.getElementById("animal"), acc = document.getElementById("acc");
    const custom = document.getElementById("customAnimal"), customPun = document.getElementById("customPun"), name = document.getElementById("heroName");
    if (sel) {
      KIT.ANIMALS.forEach(a => sel.add(new Option(a.ko, a.id)));
      sel.add(new Option("직접 입력", "custom"));
      sel.value = state.animal;
      sel.addEventListener("change", () => { state.animal = sel.value; store.set("animal", sel.value); render(); });
    }
    if (acc) {
      KIT.ACCESSORIES.forEach(a => acc.add(new Option(a.ko, a.id)));
      acc.value = state.acc;
      acc.addEventListener("change", () => { state.acc = acc.value; store.set("acc", acc.value); render(); });
    }
    if (custom) { custom.value = state.custom; custom.addEventListener("input", () => { state.custom = custom.value; store.set("custom", custom.value); render(); }); }
    if (customPun) { customPun.value = state.customPun; customPun.addEventListener("input", () => { state.customPun = customPun.value; store.set("customPun", customPun.value); render(); }); }
    if (name) { name.value = state.name; name.addEventListener("input", () => { state.name = name.value; store.set("name", name.value); render(); }); }

    document.addEventListener("click", e => {
      const b = e.target.closest(".copy");
      if (b) {
        if (b.dataset.all) { copyText(allPromptsText(), b); return; }
        const t = document.getElementById(b.dataset.target);
        if (t) copyText(t.textContent, b);
      }
      const f = e.target.closest(".shotfilters button");
      if (f) {
        document.querySelectorAll(".shotfilters button").forEach(x => x.classList.toggle("on", x === f));
        const want = f.dataset.who;
        document.querySelectorAll(".shot").forEach(s => {
          const w = s.dataset.who;
          const show = want === "all" || (want === "hero" && (w === "hero" || w === "hero_costume")) ||
            (want === "human" && ["cw1", "cw2", "boss", "leader", "friend", "group"].includes(w)) ||
            (want === "other" && ["insert", "black", "card"].includes(w)) || w === want;
          s.classList.toggle("hide", !show);
        });
      }
      const dl = e.target.closest("[data-download]");
      if (dl) {
        const blob = new Blob([allPromptsText()], { type: "text/plain;charset=utf-8" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = dl.dataset.download; a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      }
    });
    document.querySelectorAll("[data-shot]").forEach(r => r.addEventListener("click", () => { location.hash = "#s" + r.dataset.shot; }));

    const tb = document.getElementById("themeBtn");
    const saved = store.get("theme", "");
    if (saved) document.documentElement.setAttribute("data-theme", saved);
    if (tb) tb.addEventListener("click", () => {
      const cur = document.documentElement.getAttribute("data-theme") ||
        (window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      const next = cur === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next); store.set("theme", next);
    });
    render();
  });
})();
