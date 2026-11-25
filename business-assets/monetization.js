(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeUrl = (value) => {
    const s = String(value || '');
    if (/^https:\/\//i.test(s) || /^(?:\.\.\/)?[a-zA-Z0-9_-]+(?:\.html)?(?:[\/#][^\s]*)?$/.test(s) || /^(?:\.\.\/)?#[a-zA-Z0-9_-]+$/.test(s)) return s;
    return '';
  };
  const externalLink = (url, label) => safeUrl(url) ? '<a href="' + esc(safeUrl(url)) + '" target="_blank" rel="noopener noreferrer">🔗 ' + esc(label) + ' ↗</a>' : '<span>' + esc(label) + ' · 링크 미확정</span>';
  const statuses = [['unknown','미확인'],['reported','사용자 진술'],['progress','진행 중'],['verified','직접 확인 완료'],['blocked','추가 확인 필요'],['na','해당 없음']];
  const statusKeys = new Set(statuses.map(x => x[0]));
  const storageKey = 'business-hub-registration-status-v1';
  const fields = [
    ['name','이름'],['brand','브랜드·활동명'],['email','가입용 이메일'],['phone','연락처'],
    ['business','신청 유형'],['region','활동 지역'],['website','홈페이지·포트폴리오'],['sns','SNS·채널 URL'],['service','서비스·콘텐츠 소개']
  ];
  // Personal values and aliases live only in memory. Only enum status codes are persisted below.
  const profiles = {A:{alias:'계정 A'}, B:{alias:'계정 B'}};
  let activeAccount = '';
  let siteData = [];
  let financeData = {};
  let state = {A:{},B:{}};
  let toastTimer;
  const toast = (message) => {
    $('hub-toast').textContent = message; $('hub-toast').hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => {$('hub-toast').hidden = true;}, 4200);
  };
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('전체 내용을 복사했습니다.'); }
    catch (error) {
      let fallback = $('hub-copy-fallback');
      if (!fallback) {
        fallback = document.createElement('textarea'); fallback.id = 'hub-copy-fallback';
        fallback.className = 'hub-copy-fallback'; fallback.readOnly = true;
        fallback.setAttribute('aria-label','자동 복사 실패 · 직접 복사할 내용');
        $('hub-profile-form').appendChild(fallback);
      }
      fallback.value = text; fallback.focus(); fallback.select();
      toast('자동 복사가 제한됐습니다. 선택된 내용을 Ctrl+C로 복사하세요.');
    }
  }
  function saveCurrentProfile() {
    if (!activeAccount) return;
    profiles[activeAccount].alias = $('hub-alias').value.trim() || ('계정 ' + activeAccount);
    document.querySelectorAll('[data-profile]').forEach(el => {
      profiles[activeAccount][el.dataset.profile] = el.type === 'checkbox' ? el.checked : el.value;
    });
  }
  function updateAliasOptions() {
    ['hub-account','hub-status-account'].forEach(id => {
      for (const opt of $(id).options) if (opt.value === 'A' || opt.value === 'B') opt.textContent = profiles[opt.value].alias || ('계정 ' + opt.value);
    });
  }
  function chooseAccount(account) {
    saveCurrentProfile(); activeAccount = account === 'A' || account === 'B' ? account : '';
    $('hub-alias').disabled = !activeAccount;
    $('hub-alias').value = activeAccount ? profiles[activeAccount].alias : '';
    document.querySelectorAll('[data-profile]').forEach(el => {
      el.disabled = !activeAccount;
      const value = activeAccount ? profiles[activeAccount][el.dataset.profile] : '';
      if (el.type === 'checkbox') el.checked = Boolean(value); else el.value = value || '';
    });
    $('hub-copy-profile').disabled = !activeAccount || !$('hub-copy-site').value;
    if (activeAccount && !$('hub-status-account').value) $('hub-status-account').value = activeAccount;
    updateAliasOptions(); renderStatuses();
  }
  function readStates() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      for (const acc of ['A','B']) {
        for (const site of siteData) {
          const row = saved[acc] && saved[acc][site.id];
          if (!row) continue;
          state[acc][site.id] = {};
          for (const stage of ['signup','approval','payout']) if (statusKeys.has(row[stage])) state[acc][site.id][stage] = row[stage];
        }
      }
    } catch (e) { $('hub-storage-note').textContent = '저장된 상태를 읽을 수 없어 미확인 상태로 표시합니다. 개인정보는 저장하지 않습니다.'; }
  }
  function persistStates() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch (e) { $('hub-storage-note').textContent = '이 브라우저에서는 상태 저장이 제한됩니다. 현재 탭에서만 체크를 유지합니다.'; }
  }
  function sitePrompt(site) {
    return '🔴🔴 [' + site.name + ' · 기존 가입 확인 후 입력 준비]\n'
      + '공식 사이트: ' + site.url + '\n'
      + '1️⃣ [ ] 내가 선택한 계정의 기존 로그인·가입 여부부터 확인하라. 미로그인은 미가입으로 판정하지 마라.\n'
      + '2️⃣ [ ] 가입·판매/매체 승인·정산 등록을 각각 확인하고, 이미 가입했다면 중복 계정을 만들지 마라.\n'
      + '3️⃣ [ ] 별도로 제공한 공통 정보 중 이번 화면에 필요한 항목만 입력하라. 계정·사업자·정산 명의를 추정하지 마라.\n'
      + '4️⃣ [ ] 추가 준비: ' + (site.specificFields || []).join(' / ') + '\n'
      + '5️⃣ [ ] 비밀번호 설정·PASS/SMS·주민번호·신분증·캡차는 내가 직접 처리하게 하라. 약관 동의와 최종 가입·신청 버튼은 누르지 마라.\n'
      + '6️⃣ [ ] 마지막 제출 전 화면을 열어 두고, 입력 완료·누락·다음 버튼을 한국어 표로 보여줘라.\n'
      + '보고: 사이트 | 사용 계정(가림) | 가입 상태 | 승인 상태 | 정산 상태 | 내가 할 일. 민감값은 보고서·GitHub에 넣지 마라.';
  }
  function siteCard(site) {
    const label = {ready:'준비 항목 확인',review:'신청 조건 재확인',closed:'서비스 종료 · 신청 제외'}[site.available] || '조건 확인 필요';
    const badge = site.available === 'closed' ? 'off' : site.available === 'review' ? 'warn' : '';
    const sourceLinks = (site.sources || []).map(s => externalLink(s.url,s.label)).join('');
    const items = (site.specificFields || []).map(s => '<li>' + esc(s) + '</li>').join('');
    const manual = (site.manualSteps || []).map(s => '<li>' + esc(s) + '</li>').join('');
    return '<article class="hub-site-card ' + (site.available === 'closed'?'closed':'') + '">'
      + '<div class="hub-heading"><h3>' + esc(site.id) + ' · ' + esc(site.name) + '</h3><span class="hub-badge ' + badge + '">' + label + '</span></div>'
      + '<div class="hub-site-meta">' + esc(site.category) + ' · ' + esc(site.region) + '</div>'
      + '<p>' + esc(site.signupNote) + '</p>'
      + '<p class="hub-compact">계정 상태: ' + esc(site.statusNote || '실제 가입 여부 미확인') + '</p>'
      + '<div class="hub-actions">' + externalLink(site.url,site.available==='closed'?'종료 안내 확인':'공식 사이트 열기')
      + (site.available !== 'closed' ? '<button type="button" data-copy-site="' + esc(site.id) + '">실행 프롬프트 복사</button>' : '') + '</div>'
      + '<details><summary>내가 준비할 정보 · 정산 · 직접 할 일</summary><dl><dt>공통 정보</dt><dd>계정 선택 · 이름/브랜드 · 연락처 · 채널/포트폴리오. 실제 양식에서 필요한 항목만 사용.</dd><dt>이 사이트의 추가 정보</dt><dd><ul>' + items + '</ul></dd><dt>정산 단계</dt><dd>' + esc(site.settlementNote) + '</dd><dt>내가 직접 확인할 단계</dt><dd><ul>' + manual + '</ul></dd></dl>'
      + '<div class="hub-sources"><strong>공식 근거</strong>' + sourceLinks + '</div></details></article>';
  }
  function renderSites() {
    const q = $('hub-site-search').value.trim().toLowerCase();
    const category = $('hub-site-category').value;
    const filtered = siteData.filter(s => (category === 'all' || s.category === category) && [s.name,s.category,s.signupNote,(s.specificFields||[]).join(' ')].join(' ').toLowerCase().includes(q));
    $('hub-sites').innerHTML = filtered.length ? filtered.map(siteCard).join('') : '<p class="hub-empty">검색에 맞는 사이트가 없습니다.</p>';
    $('hub-sites-feedback').textContent = '전체 ' + siteData.length + '개 중 ' + filtered.length + '개 표시 · ‘준비 항목 확인’은 실제 가입 성공을 뜻하지 않습니다.';
  }
  function renderStatuses() {
    const acc = $('hub-status-account').value;
    if (acc !== 'A' && acc !== 'B') {
      $('hub-status-rows').innerHTML = '<tr><td colspan="4">계정을 먼저 선택하세요. 모든 사이트의 실제 가입 여부는 미확인 상태에서 시작합니다.</td></tr>';
      $('hub-status-summary').textContent = '계정 선택 전'; return;
    }
    const active = siteData.filter(s => s.available !== 'closed');
    $('hub-status-rows').innerHTML = active.map(site => {
      const row = state[acc][site.id] || {};
      return '<tr><th scope="row">' + esc(site.name) + '</th>' + ['signup','approval','payout'].map((stage,i) => '<td><select data-site="' + esc(site.id) + '" data-stage="' + stage + '" aria-label="' + esc(site.name) + ' ' + ['계정 가입','판매 매체 승인','정산 등록'][i] + '">' + statuses.map(([key,label]) => '<option value="' + key + '"' + ((row[stage]||'unknown')===key?' selected':'') + '>' + label + '</option>').join('') + '</select></td>').join('') + '</tr>';
    }).join('');
    const verified = active.filter(site => (state[acc][site.id]||{}).signup === 'verified').length;
    $('hub-status-summary').textContent = (profiles[acc].alias || ('계정 ' + acc)) + ' · 가입 직접 확인 기록 ' + verified + '/' + active.length;
  }
  function renderDeferred(groups) {
    $('hub-deferred').innerHTML = '<details class="hub-deferred"><summary>🌏 해외·여행·AI 제휴 목록도 보기</summary><p class="hub-sub">이번 국내 가입 준비와 분리한 후속 검토 목록입니다. 가입·심사·한국 정산 가능 여부는 각각 확인해야 합니다.</p>' + groups.map(g => '<h3>' + esc(g.name) + '</h3><p>' + (g.sites||[]).map(v => esc(typeof v === 'string'?v:v.name)).join(' · ') + '</p>').join('') + '</details>';
  }
  function renderFinance() {
    $('hub-channels').innerHTML = (financeData.channels || []).map((c,i) => '<article class="hub-channel"><span class="hub-badge ' + (c.verified?'':'warn') + '">' + (c.verified?'채널 확인':'URL 확인 필요') + '</span><h3>' + (i+1) + '. ' + esc(c.name) + '</h3><p>' + esc(c.role) + '</p><p class="hub-compact">' + esc(c.status) + '</p>' + (c.url?externalLink(c.url,'채널 열기'):'<span class="hub-compact">원본 URL 입력 대기</span>') + '</article>').join('');
    $('hub-finance-status').textContent = financeData.statusSummary || '제작 상태 미확인';
    $('hub-finance-pipeline').innerHTML = (financeData.pipeline || []).map(p => '<li><strong>' + esc(p.title) + '</strong><p>' + esc(p.details) + '</p></li>').join('');
    $('hub-finance-prompts').innerHTML = (financeData.prompts || []).map((p,i) => '<div class="hub-prompt"><div class="hub-heading"><h3>🔴🔴 ' + esc(p.title) + '</h3><button type="button" data-finance-prompt="' + i + '">프롬프트 전체 복사</button></div><pre>' + esc(p.text) + '</pre></div>').join('');
    $('hub-finance-sources').innerHTML = (financeData.references || []).map(r => externalLink(r.url,r.label)).join('');
  }
  $('hub-profile-form').addEventListener('submit', e => e.preventDefault());
  $('hub-account').addEventListener('change', e => chooseAccount(e.target.value));
  $('hub-alias').addEventListener('input', () => {saveCurrentProfile();updateAliasOptions();});
  document.querySelectorAll('[data-profile]').forEach(el => el.addEventListener('input',saveCurrentProfile));
  $('hub-clear-profile').addEventListener('click', () => {
    for(const acc of ['A','B']) profiles[acc] = {alias:'계정 ' + acc};
    activeAccount = ''; $('hub-account').value = ''; $('hub-alias').value = ''; chooseAccount('');
    const fallback = $('hub-copy-fallback'); if (fallback) fallback.remove();
    toast('이 탭에 입력한 개인정보를 지웠습니다. 사이트별 상태 체크는 유지합니다.');
  });
  $('hub-copy-fields').innerHTML = fields.map(([key,label]) => '<label class="hub-check"><input type="checkbox" data-copy-field="' + key + '">' + esc(label) + '</label>').join('');
  $('hub-copy-site').addEventListener('change', () => {$('hub-copy-profile').disabled = !activeAccount || !$('hub-copy-site').value;});
  $('hub-copy-profile').addEventListener('click', () => {
    saveCurrentProfile();
    const site = siteData.find(s => s.id === $('hub-copy-site').value);
    if (!activeAccount || !site) return toast('계정과 대상 사이트를 먼저 선택하세요.');
    const selected = Array.from(document.querySelectorAll('[data-copy-field]:checked')).map(e => e.dataset.copyField);
    if (!selected.length) return toast('복사할 정보 항목을 체크하세요.');
    const lines = ['[' + site.name + ' 입력카드 · ' + profiles[activeAccount].alias + ']','이 카드의 정보는 선택한 공식 사이트의 필요한 항목에만 입력하세요.'];
    for(const [key,label] of fields) if(selected.includes(key)) lines.push(label + ': ' + (profiles[activeAccount][key] || '[미입력]'));
    lines.push('비밀번호·주민번호·계좌번호·인증번호는 이 카드에 포함하지 않습니다. 최종 제출은 사용자가 합니다.');
    copy(lines.join('\n'));
  });
  $('hub-site-search').addEventListener('input',renderSites);
  $('hub-site-category').addEventListener('change',renderSites);
  $('hub-sites').addEventListener('click', e => {
    const btn = e.target.closest('[data-copy-site]'); if(!btn) return;
    const site = siteData.find(s => s.id===btn.dataset.copySite); if(site) copy(sitePrompt(site));
  });
  $('hub-status-account').addEventListener('change',renderStatuses);
  $('hub-status-rows').addEventListener('change', e => {
    const el=e.target; const acc=$('hub-status-account').value;
    if(!el.matches('select[data-site]') || !['A','B'].includes(acc) || !statusKeys.has(el.value)) return;
    if(!siteData.some(s => s.id===el.dataset.site)) return;
    if(!['signup','approval','payout'].includes(el.dataset.stage)) return;
    if(!state[acc][el.dataset.site]) state[acc][el.dataset.site]={};
    state[acc][el.dataset.site][el.dataset.stage]=el.value;
    persistStates();
    const active=siteData.filter(s=>s.available!=='closed');
    const verified=active.filter(s=>(state[acc][s.id]||{}).signup==='verified').length;
    $('hub-status-summary').textContent=(profiles[acc].alias||('계정 '+acc))+' · 가입 직접 확인 기록 '+verified+'/'+active.length;
  });
  $('hub-finance-prompts').addEventListener('click', e => {
    const btn=e.target.closest('[data-finance-prompt]'); if(!btn) return;
    const p=(financeData.prompts||[])[Number(btn.dataset.financePrompt)]; if(p)copy(p.text);
  });
  async function loadData() {
    const results = await Promise.allSettled([
      fetch('signup-data.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('data unavailable');return r.json();}),
      fetch('finance-data.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('data unavailable');return r.json();})
    ]);
    if(results[0].status==='fulfilled') {
      const data=results[0].value; siteData=Array.isArray(data.sites)?data.sites:[];
      $('hub-site-count').textContent=String(siteData.length);
      $('hub-site-category').innerHTML='<option value="all">전체 분류</option>'+Array.from(new Set(siteData.map(s=>s.category))).map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join('');
      $('hub-copy-site').innerHTML='<option value="">대상 사이트 선택</option>'+siteData.filter(s=>s.available!=='closed').map(s=>'<option value="'+esc(s.id)+'">'+esc(s.name)+'</option>').join('');
      readStates();renderSites();renderStatuses();renderDeferred(data.deferredGroups||[]);
    } else {
      $('hub-sites').innerHTML='<p class="hub-empty hub-error">사이트 목록을 불러오지 못했습니다. 연결을 확인하고 새로고침하세요. 가입 성공으로 표시하지 않습니다.</p>';
      $('hub-copy-site').innerHTML='<option value="">목록 연결 필요</option>';
    }
    if(results[1].status==='fulfilled') {financeData=results[1].value;renderFinance();}
    else $('hub-channels').innerHTML='<p class="hub-empty hub-error">금융 제작 목록 연결이 필요합니다. 기존 차트 자료는 아래 링크에서 볼 수 있습니다.</p>';
  }
  chooseAccount('');loadData();
})();
