(function () {
  "use strict";

  function sub(text, state) {
    return text.replace(/\{\{(\w+)\}\}/g, function (m, key) {
      return state[key] !== undefined ? state[key] : m;
    });
  }

  function readSlots(scope) {
    try {
      return JSON.parse(scope.dataset.slots || "{}");
    } catch (err) {
      console.error("slot data unreadable", err);
      return {};
    }
  }

  const scopes = Array.from(document.querySelectorAll("[data-scope]"));

  scopes.forEach(function (scope) {
    const state = readSlots(scope);
    const fill = function () {
      scope.querySelectorAll("[data-tpl]").forEach(function (el) {
        el.textContent = sub(el.dataset.tpl, state);
      });
    };
    scope.querySelectorAll("select[data-slot]").forEach(function (sel) {
      sel.addEventListener("change", function () {
        state[sel.dataset.slot] = sel.value;
        const custom = scope.querySelector('[data-slot-custom="' + sel.dataset.slot + '"]');
        if (custom) custom.value = "";
        fill();
      });
    });
    scope.querySelectorAll("input[data-slot-custom]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        const key = inp.dataset.slotCustom;
        const sel = scope.querySelector('select[data-slot="' + key + '"]');
        state[key] = inp.value.trim() || (sel ? sel.value : state[key]);
        fill();
      });
    });
    scope.markdown = function () {
      const md = scope.querySelector("textarea.md");
      return md ? sub(md.value, state) : "";
    };
    fill();
  });

  function allMarkdown() {
    const header = "# 인스타 떡상 레퍼런스 7편 — 장면·전환·사운드·편집 완전 분해\n\n";
    return header + scopes.map(function (s) { return s.markdown(); }).join("\n\n---\n\n");
  }

  function flash(btn, label) {
    const old = btn.dataset.label || btn.textContent;
    btn.dataset.label = old;
    btn.textContent = label;
    btn.classList.add("done");
    setTimeout(function () { btn.textContent = old; btn.classList.remove("done"); }, 1600);
  }

  function copyText(text, btn) {
    const done = function () { flash(btn, "복사됨 ✓ (" + text.length.toLocaleString() + "자)"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(function (err) {
        console.error("clipboard api failed", err);
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (err) { console.error("copy failed", err); }
    ta.remove();
  }

  function saveText(text, name, btn) {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    flash(btn, "저장됨 ✓");
  }

  document.addEventListener("click", function (ev) {
    const btn = ev.target.closest("button");
    if (!btn) return;
    const scope = btn.closest("[data-scope]");
    if (btn.classList.contains("copy")) {
      const pre = btn.previousElementSibling;
      copyText(pre ? pre.textContent : "", btn);
    } else if (btn.hasAttribute("data-copy-md") && scope) {
      copyText(scope.markdown(), btn);
    } else if (btn.hasAttribute("data-save-md") && scope) {
      saveText(scope.markdown(), btn.dataset.saveMd, btn);
    } else if (btn.hasAttribute("data-copy-all")) {
      copyText(allMarkdown(), btn);
    } else if (btn.hasAttribute("data-save-all")) {
      saveText(allMarkdown(), btn.dataset.saveAll, btn);
    }
  });
})();
