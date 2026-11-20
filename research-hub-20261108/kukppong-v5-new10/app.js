/* 국뽕 해외반응 V5 · 17분 대본 검수판 renderer. data: window.SITE (all), window.EP (episode page) */
(function () {
  const S = window.SITE, E = window.EP, page = document.body.dataset.page;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tsec = x => String(x || '0').split(':').reduce((a, v) => a * 60 + parseFloat(v || 0), 0);
  const mmss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  const toast = m => { const t = document.getElementById('toast'); t.textContent = m; t.style.display = 'block'; setTimeout(() => t.style.display = 'none', 1800); };
  const ROLE = { 훅: 'q', 질문: 'q', 배경: 'b', 위기: 'r', 검증: 'b', 반전: 'r', 감동: 'g', 회수: 'g' };

  function menu() {
    const eps = S.eps.map(e => `<a class="m ${E && E.ep === e.ep ? 'on' : ''}" href="./ep${e.ep}.html">EP${e.ep} · ${esc(e.short)}</a>`).join('');
    const dl = S.eps.map(e => `<a class="m" href="./files/ep${e.ep}-tts.txt">EP${e.ep} 낭독 TXT</a><a class="m" href="./files/ep${e.ep}-cuts.csv">EP${e.ep} 컷 CSV</a><a class="m" href="./audio/ep${e.ep}.mp3">EP${e.ep} MP3 미리듣기</a><a class="m" href="./audio/ep${e.ep}.srt">EP${e.ep} SRT</a><a class="m" href="./files/ep${e.ep}-QC.md">EP${e.ep} TTS QC</a>`).join('');
    return `<aside><h1>🍷 국뽕 해외반응 V5<br>17분 대본 10편</h1>
    <details open><summary>📂 시작</summary><a class="m" href="./index.html">10편 목록·완료 기록</a><a class="m" href="./rules.html">집필 규칙·참고 자막 7편</a><a class="m" href="../../kukppong-new-topics10-20261116/">주제 10선 대시보드</a><a class="m" href="../index.html">◀ 연구 허브</a></details>
    <details open><summary>🎙 최종 대본 · 1편 1페이지</summary>${eps}</details>
    <details><summary>⬇️ TTS · 컷 시트 파일</summary>${dl}</details>
    <details><summary>⛔ 이미 한 주제</summary><div class="m">폴란드 방산(K2 전차·천무) — 제작 완료, 다시 만들지 않음</div><div class="m">제작 33편 · 중국 SNS 시리즈 15편 (목록 페이지 참조)</div></details></aside>`;
  }

  function hl(text, arr) {
    let h = esc(text);
    (arr || []).forEach(x => { if (!x || !x.t) return; const t = esc(x.t); const i = h.indexOf(t); if (i >= 0) h = h.slice(0, i) + `<mark class="${x.c}">${t}</mark>` + h.slice(i + t.length); });
    return h;
  }

  function clipHTML(c, cold) {
    const d = (tsec(c.out) - tsec(c.in)).toFixed(1);
    const re = /기존/.test(c.reuse || '') ? 're' : 'new';
    return `<div class="blk clip">🎞 ${cold ? '<b>[콜드오픈]</b> ' : ''}<span class="tc">${esc(c.src)} · ${esc(c.in)} → ${esc(c.out)} (${d}초)</span>
      <span class="tag ${re}">${esc(c.reuse || '신규')}</span><span class="tag chk">${esc(c.check || '자막 타임코드 확인')}</span><br>
      <span class="k">“${esc(c.ko)}”</span> <span class="o">${esc(c.orig)}</span> <span class="tag">${esc(c.speaker || '')}</span></div>`;
  }

  function secHTML(s, off) {
    const blocks = s.blocks.map(b => {
      if (b.type === 'nar') return `<div class="blk nar"><span class="role">${esc(b.role)}</span>${b.dramatized ? '<span class="dram">AI 재현·각색</span> ' : ''}${hl(b.text, b.hl)}</div>`;
      if (b.type === 'clip') return clipHTML(b);
      return `<div class="blk card">🖼 <b>[${esc(b.kind)}]</b> ${esc(b.title)} <span class="tag">${esc(b.source || '')}</span> ${b.url ? `<a href="${esc(b.url)}" target="_blank">원문</a>` : ''}<br><span class="o">${esc(b.note || '')}</span></div>`;
    }).join('');
    const play = off != null ? `<button onclick="window.__seek(${off})">▶ 이 구간 듣기 (${mmss(off)})</button>` : '';
    return `<details class="sec" open><summary>${s.no} · ${esc(s.role)} · ${esc(s.name)} <span class="tag">${esc(s.t_start)}~${esc(s.t_end)}</span><span class="tag">${esc(s.arc_tag || '')}</span><span class="tag">감정 ${esc(s.emotion)} ${esc(s.emotion_label || '')}</span></summary>
      <div class="qa"><div><b>질문</b>${esc(s.question)}</div><div><b>부분 답</b>${esc(s.partial_answer)}</div><div><b>다음 궁금증</b>${esc(s.next_q)}</div></div>
      <div class="meta">${play}</div>${blocks}</details>`;
  }

  function curve(secs) {
    const W = 900, H = 200, P = 30, n = secs.length;
    const pts = secs.map((s, i) => [P + i * (W - 2 * P) / (n - 1), H - P - (s.emotion || 0) / 100 * (H - 2 * P)]);
    const pl = pts.map(p => p.join(',')).join(' ');
    const dots = pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="#f6d27a"/><text x="${p[0]}" y="${p[1] - 10}" fill="#f8eaee" font-size="11" text-anchor="middle">${esc(secs[i].emotion_label || '')} ${secs[i].emotion}</text><text x="${p[0]}" y="${H - 8}" fill="#d8b3c0" font-size="11" text-anchor="middle">${secs[i].no}·${esc(secs[i].role)}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" style="width:100%;background:#250610;border-radius:10px"><polyline points="${pl}" fill="none" stroke="#ffb3c7" stroke-width="3"/>${dots}</svg>`;
  }

  function bundle() {
    const L = [];
    L.push(`# EP${E.ep} ${E.title}`, `흐름: ${E.subtitle}`, '', '## 0. 콜드오픈 원음');
    (E.cold_open || []).forEach(c => L.push(`[원음 ${c.src} ${c.in}-${c.out}] “${c.ko}” (${c.orig})`));
    L.push('', '## 1. 대본 (낭독 + 원음/화면 큐)');
    E.sections.forEach(s => {
      L.push('', `### ${s.no}. ${s.role} · ${s.name} (${s.t_start}~${s.t_end}) · 감정 ${s.emotion} ${s.emotion_label || ''}`);
      s.blocks.forEach(b => {
        if (b.type === 'nar') L.push((b.dramatized ? '[AI 재현] ' : '') + b.text);
        else if (b.type === 'clip') L.push(`[원음 ${b.src} ${b.in}-${b.out}] “${b.ko}”`);
        else L.push(`[화면 ${b.kind}] ${b.title}${b.source ? ' / ' + b.source : ''}`);
      });
    });
    L.push('', '## 2. 편집 타임라인 (15~30초 장면표)', '시각 | 화면 | 소스 | 효과 | 내레이션 | 감정 | 권리');
    (E.scene_table || []).forEach(r => L.push([r.t, r.screen, r.source, r.effect, r.nar, r.emotion, r.rights].join(' | ')));
    L.push('', '## 3. 컷 리스트 (IN/OUT)');
    allClips().forEach((c, i) => L.push(`${i + 1}. ${c.src} ${c.in}-${c.out} | ${c.ko} | ${c.reuse || '신규'} | ${c.check || ''}`));
    L.push('', '## 4. 프롬프트 (Claude Code / Codex에 그대로)', E.prompt_pack ? E.prompt_pack.fewshot : '',
      '', '작업 지시: 위 대본의 낭독 문장만 edge-tts(ko-KR-InJoonNeural)로 합성하고, 컷 리스트의 원음을 IN/OUT대로 잘라 장면표 순서로 배치한다. 원음 구간은 내레이션 없이 재생, AI 재현 장면에는 "AI 재현" 표기, 해외 기사·그래프 카드는 장면표대로 넣는다. 무음 제거 후 1.2배속으로 약 17분을 맞춘다. 원본 영상 권리는 UNCONFIRMED이므로 게시 전 확인한다.');
    return L.join('\n');
  }
  function allClips() { return (E.cold_open || []).concat(...E.sections.map(s => s.blocks.filter(b => b.type === 'clip'))); }

  function epPage() {
    const q = E.qc_tts || {}, off = (E.offsets || {});
    const clips = allClips();
    const reuse = clips.filter(c => /기존/.test(c.reuse || '')).length;
    const refs = E.sections.flatMap(s => s.blocks.filter(b => b.type === 'nar' && b.ref && b.ref.orig).map(b => [s, b]));
    const kpi = (v, l) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`;
    const ev = (E.foreign_evals || []).map(x => `<tr><td>${esc(x.who)}<br><span class="tag">${esc(x.type)}</span></td><td>${esc(x.title)}<br><span class="o">${esc(x.quote_orig)}</span><br>${esc(x.quote_ko)}</td><td class="mono">${esc(x.date)}</td><td>${x.url ? `<a href="${esc(x.url)}" target="_blank">링크</a>` : '—'}<br><span class="tag ${/원문/.test(x.verified) ? 'new' : 're'}">${esc(x.verified)}</span></td></tr>`).join('');
    const fc = (E.foreign_cases || []).map(x => `<tr><td class="mono">${esc(x.src)}</td><td>${esc(x.who)}</td><td><span class="o">${esc(x.orig)}</span><br>${esc(x.ko)}</td><td class="mono">${esc(x.tc)}</td><td>${esc(x.views)}<br>${esc(x.date)}</td><td>${x.url ? `<a href="${esc(x.url)}" target="_blank">영상</a>` : ''}</td></tr>`).join('');
    const facts = (E.facts || []).map(x => `<tr><td>${esc(x.fact)}</td><td>${esc(x.source)}</td><td class="mono">${esc(x.date)}</td><td>${x.url ? `<a href="${esc(x.url)}" target="_blank">링크</a>` : ''}</td></tr>`).join('');
    const scene = (E.scene_table || []).map(r => `<tr><td class="mono">${esc(r.t)}</td><td>${esc(r.screen)}</td><td>${esc(r.source)}</td><td>${esc(r.effect)}</td><td>${esc(r.nar)}</td><td>${esc(r.emotion)}</td><td>${esc(r.rights)}</td></tr>`).join('');
    const cuts = clips.map((c, i) => `<tr><td>${i + 1}</td><td class="mono">${esc(c.src)}</td><td class="mono">${esc(c.in)}→${esc(c.out)}</td><td>${(tsec(c.out) - tsec(c.in)).toFixed(1)}</td><td>${esc(c.ko)}</td><td><span class="tag ${/기존/.test(c.reuse || '') ? 're' : 'new'}">${esc(c.reuse || '신규')}</span></td><td>${esc(c.check || '')}</td></tr>`).join('');
    const one = refs.map(([s, b]) => `<tr><td class="l"><span class="tag">${esc(b.ref.rid)} ¶${esc(b.ref.p)}</span> ${esc(b.ref.orig)}</td><td><span class="tag">${esc(b.role)}</span> ${hl(b.text, b.hl)}</td><td>${esc(b.ref.why)}</td><td>${s.no}</td></tr>`).join('');
    const qc = (E.qc || []).map(x => `<tr><td>${x.pass ? '<span class="ok">✔</span>' : '<span class="no">✘</span>'}</td><td>${esc(x.item)}</td><td>${esc(x.note)}</td></tr>`).join('');
    const pp = E.prompt_pack || {};
    const th = E.thumb || {};
    const jumps = E.sections.map(s => off[s.no] != null ? `<button onclick="window.__seek(${off[s.no]})">${s.no}·${esc(s.role)} ${mmss(off[s.no])}</button>` : '').join('');
    return `<div class="memo">적요 · by gpt 쓸모 소스 — 말투·수사는 참고 자막 7편(R01~R07, 쓸모왕 계열 자동자막)에서, 줄거리·근거는 새로 구성. 집필·검수 Hermes(Claude) · 2026-11-16</div>
    <div class="sub">SEMANTIC JUDGE · SCRIPT & CUT V5 · EP${E.ep}</div>
    <h2 class="t">${esc(E.title)}</h2><div class="sub">${esc(E.subtitle)}</div>
    <div class="kpis">${kpi(q.narration_min != null ? q.narration_min.toFixed(1) + '분' : '미합성', '내레이션 실측(edge-tts)')}${kpi(clips.length + '개', '원음 컷 (재사용 ' + reuse + ')')}${kpi((q.clip_sec || clips.reduce((a, c) => a + tsec(c.out) - tsec(c.in), 0)).toFixed(0) + '초', '원음 합계')}${kpi(q.est_total_1_2x_min != null ? q.est_total_1_2x_min.toFixed(1) + '분' : '—', '1.2배속 예상 길이')}${kpi(q.narration_ratio != null ? q.narration_ratio + '%' : '—', '내레이션 음성 비율')}${kpi((q.nar_chars || 0).toLocaleString() + '자', '낭독 글자(공백 포함)')}${kpi(refs.length + '쌍', '1:1 매칭')}${kpi((E.foreign_evals || []).length + '건', '해외 평가 근거')}</div>
    <div class="bar"><button class="redbtn" id="copyall">🟥 Claude·Codex 복붙용 한 번에 복사 (대본+편집 타임라인+프롬프트)</button>
    <a class="btn" href="./files/ep${E.ep}-tts.txt" download>⬇ 낭독 TXT</a><a class="btn" href="./files/ep${E.ep}-cuts.csv" download>⬇ 컷 CSV</a><a class="btn" href="./audio/ep${E.ep}.mp3" download>⬇ MP3 미리듣기(64k)</a><a class="btn" href="./audio/ep${E.ep}.srt" download>⬇ SRT</a>
    <button onclick="document.querySelectorAll('details').forEach(d=>d.open=true)">전체 펼치기</button><button onclick="document.querySelectorAll('main details').forEach(d=>d.open=false)">전체 접기</button></div>
    <details class="box" open><summary>🎧 8구간 낭독 미리듣기 (edge-tts · ko-KR-InJoonNeural)</summary><div class="in">
      <audio id="aud" controls preload="metadata" src="./audio/ep${E.ep}.mp3"></audio><div class="bar jump">${jumps}</div>
      <div class="sub">재생하면 바로 들립니다. 원음 클립 구간은 빠진 내레이션 전용 음성이라 실제 영상보다 짧습니다. QC: 청크 ${q.chunks || '—'}개, 자막 일치율 ${q.srt_text_coverage_pct || '—'}%, 분당 ${q.chars_per_min || '—'}자.</div></div></details>
    <details class="box"><summary>🖼 썸네일 (문구·이미지 특징 숨김/표시)</summary><div class="in">${(th.texts || []).map((t, i) => `<div class="hook">안 ${i + 1} · ${esc(t)}</div>`).join('')}<p class="sub">${esc(th.image)}</p></div></details>
    <details class="box" open><summary>🧲 첫 30초 · 콜드오픈 원음 + 훅 3안</summary><div class="in">${(E.cold_open || []).map(c => clipHTML(c, true)).join('')}${(E.hooks || []).map(h => `<div class="hook"><b>${esc(h.label)}</b><br>${esc(h.text)}</div>`).join('')}
      <p class="sub">훅 유형: ${esc((E.structure || {}).hook_types)} · 주전개 ${esc((E.structure || {}).main_arc)} · 보조 ${esc((E.structure || {}).sub_arcs)}<br>이유: ${esc((E.structure || {}).reason)}<br>1차 반전: ${esc((E.structure || {}).reversal_1)}<br>2차 반전: ${esc((E.structure || {}).reversal_2)}<br>시점 연결: ${esc(E.date_context)}</p></div></details>
    <details class="box" open><summary>🎙 대본 8구간 (낭독 본문 · 원음 · 화면)</summary><div class="in"><div class="legend"><span><mark class="q">노랑 질문</mark></span><span><mark class="r">빨강 갈등·반전</mark></span><span><mark class="b">파랑 근거</mark></span><span><mark class="g">연두 호평·감동</mark></span></div>${E.sections.map(s => secHTML(s, off[s.no])).join('')}</div></details>
    <details class="box"><summary>📈 구간별 감정 곡선</summary><div class="in">${curve(E.sections)}</div></details>
    <details class="box"><summary>🧪 1:1 훅·전개·감정선 검수표 (참고 원문 ↔ 새 문장)</summary><div class="in"><table><tr><th>참고 성공 자막 원문(문장 그대로)</th><th>이번 대본에 적용한 새 문장</th><th>적용 원리</th><th>구간</th></tr>${one}</table></div></details>
    <details class="box"><summary>🌍 해외 평가 근거 (해외 언론·전문가만)</summary><div class="in"><table><tr><th>누가</th><th>제목·원문·번역</th><th>날짜</th><th>링크·확인</th></tr>${ev}</table></div></details>
    <details class="box"><summary>🗣 외국인 실제 반응 사례 7</summary><div class="in"><table><tr><th>ID</th><th>누구</th><th>원문·번역</th><th>타임코드</th><th>조회·게시일</th><th>URL</th></tr>${fc}</table></div></details>
    <details class="box"><summary>📌 사실 확인 자료</summary><div class="in"><table><tr><th>사실</th><th>출처</th><th>날짜</th><th>링크</th></tr>${facts}</table></div></details>
    <details class="box"><summary>🎞 원음 IN-OUT 확정 여부 · 컷 편집 계획 · 재사용 현황</summary><div class="in"><p class="sub">신규 ${clips.length - reuse}개 · 기존 사용 클립 재사용 ${reuse}개. 타임코드는 자막(ASR) 기준이며 영상 재청취로 확정한다. 권리 상태 전부 UNCONFIRMED.</p><table><tr><th>#</th><th>소스</th><th>IN→OUT</th><th>초</th><th>한국어 자막</th><th>사용</th><th>확인</th></tr>${cuts}</table></div></details>
    <details class="box"><summary>🎬 15~30초 장면표 (편집 타임라인)</summary><div class="in"><table><tr><th>시각</th><th>화면</th><th>소스</th><th>효과</th><th>내레이션</th><th>감정</th><th>권리</th></tr>${scene}</table></div></details>
    <details class="box"><summary>🧠 Prompt Pack / Few-shot</summary><div class="in"><p><b>훅 성공 이유</b> ${esc(pp.hook_success)}</p><p><b>시청자 궁금증</b> ${esc(pp.curiosity)}</p><p><b>전개 원리</b> ${esc(pp.arc_principle)}</p><p><b>감정 변화</b> ${esc(pp.emotion_shift)}</p><p><b>후기 효과</b> ${esc(pp.aftereffect)}</p><div class="hook">${esc(pp.fewshot)}</div></div></details>
    <details class="box"><summary>✅ SEMANTIC JUDGE 수정 내역 · ⑩ 최종 품질검수</summary><div class="in"><ul>${(E.judge_fixes || []).map(x => `<li>${esc(x)}</li>`).join('')}</ul><table><tr><th></th><th>항목</th><th>메모</th></tr>${qc}</table></div></details>`;
  }

  function indexPage() {
    const cards = S.eps.map(e => `<a class="ep" href="./ep${e.ep}.html"><div class="n">EP${e.ep} · ${esc(e.field)}</div><h3>${esc(e.title)}</h3><div class="sub">${esc(e.subtitle)}</div>
      <div class="bar"><span class="tag">내레이션 ${e.nar_min}분</span><span class="tag">원음 ${e.clips}컷</span><span class="tag">1.2배속 ${e.est12}분</span><span class="tag">해외근거 ${e.evals}건</span><span class="tag">lint ${esc(e.lint)}</span></div></a>`).join('');
    return `<div class="memo">적요 · by gpt 쓸모 소스 — 참고 자막 7편(R01~R07)의 말투·수사를 적용해 새 주제 10편을 17분 분량으로 집필. 2026-11-16 · Hermes(Claude)</div>
    <h2 class="t">국뽕 해외반응 17분 대본 10편</h2><div class="sub">주제 10선(핵잠·튀르키예·폴더블·조선·아이오닉·GV90·사우디·아시안게임·이강인·커제) · 편마다 대본+편집 타임라인+1:1 검수표+edge-tts 미리듣기</div>
    <div class="done"><b>⛔ 이미 한 주제 — 다시 만들지 않음</b><br>• <b>폴란드 방산(K2 전차·천무)</b>: 제작 완료(EP01_K2폴란드). 이후 주제·핵심 사례로 쓰지 않는다.<br>• 제작 33편: ${esc(S.done33)}<br>• 중국 SNS 시리즈: ${esc(S.doneSNS)}</div>
    <div class="grid" style="margin-top:14px">${cards}</div>`;
  }

  function rulesPage() {
    return `<div class="memo">적요 · by gpt 쓸모 소스</div><h2 class="t">집필 규칙 · 참고 자막 7편</h2>
    <details class="box" open><summary>📏 집필 규칙 V5</summary><div class="in"><div class="hook">${esc(S.rules)}</div></div></details>
    ${S.refs.map(r => `<details class="box"><summary>📜 ${esc(r.id)} · ${esc(r.title)}</summary><div class="in"><div class="hook">${esc(r.text)}</div></div></details>`).join('')}`;
  }

  document.getElementById('app').innerHTML = `<div class="layout">${menu()}<main>${page === 'ep' ? epPage() : page === 'rules' ? rulesPage() : indexPage()}</main></div>`;
  if(page==='index' && window.reviewPlaylist)reviewPlaylist(document.querySelector('#app main'),S.eps.map(e=>({title:`EP${e.ep} · ${e.short}`,url:`./audio/ep${e.ep}.mp3`})));
  window.__seek = t => { const a = document.getElementById('aud'); if (!a) return; a.currentTime = t; a.play(); };
  const cb = document.getElementById('copyall');
  if (cb) cb.onclick = () => { const txt = bundle(); (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => toast('복사됨 · ' + txt.length.toLocaleString() + '자')).catch(() => { const ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); toast('복사됨'); }); };
})();
