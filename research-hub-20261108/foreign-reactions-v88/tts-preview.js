/* V8.9 public MP3 playback. Never pretends an MP3 exists before publication. */
(function () {
  "use strict";
  var L = window.FOREIGN_REACTION_LAB;
  var main = document.querySelector(".main");
  var hero = main && main.querySelector(".hero");
  if (!main || !hero || !L || !Array.isArray(L.episodes)) return;

  var epId = document.body.getAttribute("data-ep");
  var targetIds = epId && /^(01|02|03)$/.test(epId) ? [epId] : (!epId ? ["01", "02", "03"] : []);
  if (!targetIds.length) return;
  var selected = targetIds.map(function (id) { return L.episodes.find(function (e) { return e.ep === id; }); }).filter(Boolean);

  var panel = document.createElement("section");
  panel.className = "tts-preview-panel";
  panel.id = "tts-mp3-player";
  panel.setAttribute("aria-label", "국뽕 대본 MP3 미리 듣기");

  var title = document.createElement("h2");
  title.textContent = "🎧 MP3 미리듣기 · Qwen3 한국어 음성";
  panel.appendChild(title);

  var desc = document.createElement("p");
  desc.className = "tts-preview-explain";
  desc.textContent = "EP01~03 한국어 내레이션입니다. 우분투에서 합성한 MP3를 GitHub에 게시하면 ▶ 버튼이 활성화됩니다. 원본 영상의 외국인 발언을 녹음한 파일이 아닙니다.";
  panel.appendChild(desc);

  var toolbar = document.createElement("div");
  toolbar.className = "tts-preview-toolbar";
  var refresh = document.createElement("button");
  refresh.type = "button";
  refresh.className = "tts-refresh";
  refresh.textContent = "🔄 MP3 상태 새로고침";
  toolbar.appendChild(refresh);
  var copy = document.createElement("button");
  copy.type = "button";
  copy.className = "tts-copy-command";
  copy.textContent = "📋 우분투 일괄 합성 명령 복사";
  toolbar.appendChild(copy);
  var howto = document.createElement("a");
  howto.href = "https://github.com/geben147-create/Insta/blob/main/research-hub-20261108/foreign-reactions-v88/tts/README.md";
  howto.target = "_blank";
  howto.rel = "noopener";
  howto.textContent = "🛠 실행 설명";
  toolbar.appendChild(howto);
  panel.appendChild(toolbar);

  var cardsHolder = document.createElement("div");
  cardsHolder.className = "tts-preview-grid";
  panel.appendChild(cardsHolder);
  hero.insertAdjacentElement("afterend", panel);

  var cards = {};
  selected.forEach(function (e) {
    var card = document.createElement("article");
    card.className = "tts-preview-card";
    var link = document.createElement("a");
    link.className = "tts-preview-title";
    link.href = "script-" + e.ep + ".html";
    link.textContent = "EP" + e.ep + " · " + e.title;
    card.appendChild(link);

    var sub = document.createElement("div");
    sub.className = "tts-preview-sub";
    sub.textContent = "Qwen3-TTS · Sohee · 한국어";
    card.appendChild(sub);

    var status = document.createElement("div");
    status.className = "tts-preview-status pending";
    status.setAttribute("role", "status");
    status.textContent = "⏳ MP3 미생성 · 우분투 합성 후 재생 가능";
    card.appendChild(status);

    var play = document.createElement("button");
    play.type = "button";
    play.className = "tts-play";
    play.textContent = "▶ MP3 재생";
    play.disabled = true;
    play.setAttribute("aria-label", "EP" + e.ep + " MP3 재생");
    card.appendChild(play);

    var audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "none";
    audio.style.display = "none";
    audio.setAttribute("aria-label", "EP" + e.ep + " 내레이션");
    card.appendChild(audio);

    var download = document.createElement("a");
    download.className = "tts-download";
    download.textContent = "🔗 MP3 파일 열기";
    download.target = "_blank";
    download.rel = "noopener";
    download.hidden = true;
    card.appendChild(download);

    audio.addEventListener("play", function () {
      Object.keys(cards).forEach(function (id) {
        if (id !== e.ep) cards[id].audio.pause();
      });
      play.textContent = "⏸ 일시정지";
    });
    audio.addEventListener("pause", function () { play.textContent = "▶ MP3 재생"; });
    audio.addEventListener("ended", function () { play.textContent = "▶ 다시 재생"; });
    audio.addEventListener("error", function () {
      status.className = "tts-preview-status pending";
      status.textContent = "⚠️ 음원 불러오기 실패 · 배포 반영 상태를 확인하세요";
    });
    play.addEventListener("click", function () {
      if (audio.paused) {
        var result = audio.play();
        if (result && result.catch) result.catch(function () {
          status.className = "tts-preview-status pending";
          status.textContent = "⚠️ 재생 실패 · 파일 게시 또는 브라우저 설정 확인";
        });
      } else audio.pause();
    });

    cards[e.ep] = {status: status, play: play, audio: audio, download: download};
    cardsHolder.appendChild(card);
  });

  copy.addEventListener("click", function () {
    var cmd = "bash research-hub-20261108/foreign-reactions-v88/tts/run_batch3.sh --publish";
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      window.prompt("우분투 Insta 저장소 최상위 폴더에서 실행할 명령", cmd);
      return;
    }
    navigator.clipboard.writeText(cmd).then(function () {
      copy.textContent = "✅ 명령 복사됨";
    }).catch(function () {
      window.prompt("아래 명령어를 복사하세요", cmd);
    });
  });

  async function updateCards() {
    refresh.disabled = true;
    refresh.textContent = "🔎 MP3 확인 중...";
    try {
      var manifestResp = await fetch("./audio/manifest.json?fresh=" + Date.now(), {cache:"no-store"});
      if (!manifestResp.ok) throw new Error("MP3 재생 목록 조회 실패");
      var manifest = await manifestResp.json();
      await Promise.all(selected.map(async function (e) {
        var item = cards[e.ep];
        var record = manifest.episodes && manifest.episodes[e.ep];
        var expected = "audio/EP" + e.ep + ".mp3";
        if (!record || record.status !== "ready" || record.src !== expected) {
          item.status.className = "tts-preview-status pending";
          item.status.textContent = "⏳ MP3 미생성 · 우분투 스크립트 게시 후 재생 가능";
          item.play.disabled = true;
          item.audio.pause();
          item.audio.removeAttribute("src");
          item.audio.style.display = "none";
          item.download.hidden = true;
          return;
        }
        var src = new URL("./" + expected, window.location.href);
        var head = await fetch(src.href + "?check=" + Date.now(), {method:"HEAD",cache:"no-store"});
        if (!head.ok) {
          item.status.className = "tts-preview-status pending";
          item.status.textContent = "⏳ MP3 파일 배포 대기 중";
          item.play.disabled = true;
          item.download.hidden = true;
          return;
        }
        if (item.audio.src !== src.href) item.audio.src = src.href;
        item.audio.style.display = "block";
        item.play.disabled = false;
        item.download.href = src.href;
        item.download.hidden = false;
        var minutes = Number(record.duration_sec || 0) / 60;
        var sizeMb = Number(record.size_bytes || 0) / (1024*1024);
        item.status.className = "tts-preview-status ready";
        item.status.textContent = "✅ MP3 재생 가능 · " + (minutes ? minutes.toFixed(1) + "분" : "길이 확인 대기")
          + (sizeMb ? " · " + sizeMb.toFixed(1) + "MB" : "");
      }));
    } catch (err) {
      selected.forEach(function (e) {
        var item = cards[e.ep];
        item.status.className = "tts-preview-status pending";
        item.status.textContent = "⏳ MP3 목록 미확인 · 게시 후 새로고침";
        item.play.disabled = true;
      });
    } finally {
      refresh.disabled = false;
      refresh.textContent = "🔄 MP3 상태 새로고침";
    }
  }
  refresh.addEventListener("click", updateCards);
  updateCards();
})();
