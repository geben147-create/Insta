/* V8 EP01..03 local TTS MP3 browser player: no fake ready status. */
(function () {
  "use strict";
  const self = document.currentScript;
  const root = new URL("../", self && self.src ? self.src : location.href);
  const audioBase = new URL("audio/", root);
  const manifestURL = new URL("manifest.json", audioBase);
  const ep = document.body.getAttribute("data-episode");
  const data = [
    { id: "01", icon: "🛡️", title: "K2 흑표 · 중국·폴란드 평가" },
    { id: "02", icon: "🚘", title: "현대 전기차 · 중국 차주 8점" },
    { id: "03", icon: "🔌", title: "한국 가전 · LG·OEM 반응" }
  ];
  const one = data.some(item => item.id === ep);
  const show = one ? data.filter(item => item.id === ep) : data;
  const runCommand = "git pull --ff-only origin main && bash research-hub-20261108/foreign-reactions-v8-20261115/tts/run_batch_mp3.sh --publish";
  const css = [
    ".v8audio-panel{background:linear-gradient(130deg,#202e40,#222437 65%,#362a3e);border:2px solid #59b9aa;border-radius:15px;margin:16px 0;padding:18px;color:#eef8ff;box-shadow:0 5px 22px #0003;min-width:0}",
    ".v8audio-head{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-bottom:12px}",
    ".v8audio-head h2{color:#fff0b8;font-weight:900;font-size:clamp(18px,2vw,24px);margin:0}",
    ".v8audio-head p,.v8audio-help{font-size:12px;color:#cbd9e6;line-height:1.65;margin:4px 0 0}",
    ".v8audio-actions{display:flex;flex-wrap:wrap;gap:7px}",
    ".v8audio-btn{background:#345570;color:#fff9d9;border:1px solid #92c4ce;border-radius:9px;cursor:pointer;padding:9px 11px;font-weight:800;font-size:12px}",
    ".v8audio-btn:hover{background:#476e8e}",
    ".v8audio-cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}",
    ".v8audio-card{background:#122437;border:1px solid #405e79;border-radius:12px;padding:13px;min-width:0}",
    ".v8audio-label{display:flex;align-items:center;justify-content:space-between;gap:10px;font-weight:800;font-size:14px;color:#fcebc9}",
    ".v8audio-state{font-size:11px;white-space:nowrap;color:#f2c47c;font-weight:700}",
    ".v8audio-ready{color:#7fe9b3}",
    ".v8audio-player{display:block;width:100%;margin:9px 0 5px;min-height:44px}",
    ".v8audio-meta{font-size:11px;color:#c1d6e5;margin:7px 0}",
    ".v8audio-file{color:#8fe6ff!important;text-decoration:underline;font-size:11px}",
    ".v8audio-foot{font-size:11px;color:#bccbd9;margin:12px 0 0;line-height:1.6}",
    ".v8audio-panel a{color:#96e4ff}",
    "@media(max-width:930px){.v8audio-cards{grid-template-columns:1fr}}"
  ];
  const style = document.createElement("style");
  style.textContent = css.join("\n");
  document.head.appendChild(style);
  const panel = document.createElement("section");
  panel.id = "tts-3";
  panel.className = "v8audio-panel";
  const top = document.createElement("div");
  top.className = "v8audio-head";
  const label = document.createElement("div");
  label.innerHTML = "<h2>🎧 MP3로 대본 듣기 · EP01~03</h2><p>한국어 나레이션 · 로컬 Qwen3-TTS Sohee · MP3가 GitHub에 등록되면 즉시 재생</p>";
  const buttons = document.createElement("div");
  buttons.className = "v8audio-actions";
  const refresh = document.createElement("button");
  refresh.type = "button";
  refresh.className = "v8audio-btn";
  refresh.textContent = "↻ MP3 확인";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "v8audio-btn";
  copy.textContent = "📋 우분투 일괄 합성 명령 복사";
  const guide = document.createElement("a");
  guide.className = "v8audio-btn";
  guide.textContent = "📖 합성·배포 사용법";
  guide.href = new URL("tts/README.md", root).toString().replace(
    "https://geben147-create.github.io/Insta/",
    "https://github.com/geben147-create/Insta/blob/main/"
  );
  guide.target = "_blank";
  guide.rel = "noopener";
  buttons.append(refresh, copy, guide);
  top.append(label, buttons);
  const cards = document.createElement("div");
  cards.className = "v8audio-cards";
  const stateNodes = {};
  show.forEach(function (item) {
    const box = document.createElement("div");
    box.className = "v8audio-card";
    const head = document.createElement("div");
    head.className = "v8audio-label";
    const name = document.createElement("span");
    name.textContent = item.icon + " EP" + item.id + " · " + item.title;
    const state = document.createElement("span");
    state.className = "v8audio-state";
    state.textContent = "🔎 확인 중";
    head.append(name, state);
    const body = document.createElement("div");
    body.className = "v8audio-meta";
    body.textContent = "MP3 생성 여부 확인 중";
    box.append(head, body);
    cards.append(box);
    stateNodes[item.id] = { state: state, body: body };
  });
  const foot = document.createElement("div");
  foot.className = "v8audio-foot";
  foot.textContent = "⚠️ 브라우저는 우분투 GPU를 원격 실행하지 않습니다. 로컬에서 3편 합성 및 git push 후 MP3 확인을 누르면 재생됩니다. 외국인 원음은 이 MP3에 포함되지 않습니다.";
  panel.append(top, cards, foot);
  const target = document.querySelector("main") || document.getElementById("app");
  if (!target) return;
  const hero = target.querySelector(".hero");
  if (hero && hero.parentNode === target) {
    hero.insertAdjacentElement("afterend", panel);
  } else {
    target.insertBefore(panel, target.firstChild);
  }
  function setPending(nodes, message) {
    nodes.state.textContent = "⏳ 합성 대기";
    nodes.state.classList.remove("v8audio-ready");
    nodes.body.replaceChildren();
    const p = document.createElement("p");
    p.textContent = message || "MP3가 아직 업로드되지 않았습니다.";
    nodes.body.append(p);
  }
  function setReady(nodes, meta, url) {
    nodes.state.textContent = "✅ 재생 가능";
    nodes.state.classList.add("v8audio-ready");
    nodes.body.replaceChildren();
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.className = "v8audio-player";
    audio.src = url;
    audio.setAttribute("aria-label", "대본 한국어 나레이션 MP3");
    const caption = document.createElement("p");
    caption.className = "v8audio-meta";
    const seconds = Number(meta.duration_seconds);
    const size = Number(meta.bytes);
    const duration = Number.isFinite(seconds) ? (Math.floor(seconds / 60) + "분 " + Math.round(seconds % 60) + "초") : "길이 미확인";
    const bytes = Number.isFinite(size) ? (" · " + (size / 1048576).toFixed(1) + "MB") : "";
    caption.textContent = "실측 " + duration + bytes + " · 나레이션만 · 발음 검수 전";
    const link = document.createElement("a");
    link.href = url;
    link.textContent = "⬇ MP3 파일 열기·저장";
    link.className = "v8audio-file";
    link.download = url.split("/").pop().split("?")[0];
    nodes.body.append(audio, caption, link);
  }
  async function checkAll() {
    refresh.disabled = true;
    refresh.textContent = "🔎 MP3 확인 중";
    let manifest = {};
    try {
      const response = await fetch(manifestURL + "?v=" + Date.now(), { cache: "no-store" });
      if (response.ok) manifest = await response.json();
    } catch (error) {
      // A missing manifest must never be shown as MP3 ready.
    }
    await Promise.all(show.map(async function (item) {
      const nodes = stateNodes[item.id];
      const meta = manifest.episodes && manifest.episodes[item.id];
      if (!meta || meta.ready !== true) {
        setPending(nodes, "아직 합성·GitHub 업로드 전입니다. Ubuntu 실행 후 다시 확인하세요.");
        return;
      }
      const file = "EP" + item.id + ".mp3";
      const url = new URL(file, audioBase).toString() + "?v=" + encodeURIComponent(meta.source_sha256 || meta.generated_at || Date.now());
      try {
        const response = await fetch(url, { method: "HEAD", cache: "no-store" });
        if (!response.ok) throw Error("HTTP " + response.status);
        setReady(nodes, meta, url);
      } catch (error) {
        setPending(nodes, "manifest에는 기록되어 있지만 MP3 공개 경로를 확인하지 못했습니다. GitHub Pages 배포 상태를 확인하세요.");
      }
    }));
    refresh.disabled = false;
    refresh.textContent = "↻ MP3 다시 확인";
  }
  function fallbackCopy(value) {
    const el = document.createElement("textarea");
    el.value = value;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const success = document.execCommand("copy");
    el.remove();
    return success;
  }
  copy.addEventListener("click", async function () {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(runCommand);
      } else if (!fallbackCopy(runCommand)) {
        throw Error("clipboard unavailable");
      }
      copy.textContent = "✅ Ubuntu 명령 복사됨";
    } catch (error) {
      window.prompt("아래 명령을 복사하세요 (Insta 저장소 루트에서 실행)", runCommand);
    }
  });
  refresh.addEventListener("click", checkAll);
  checkAll();
})();
