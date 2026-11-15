
(()=>{
'use strict';
const D=window.FOREIGN_REACTIONS_V6,PA=document.body.dataset.page||'index',$=(id)=>document.getElementById(id),ESC=(x)=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const z=(n)=>String(n).padStart(2,'0'),mm=(n)=>z(Math.floor(n/60))+':'+z(n%60),timeMs=(n)=>{let h=Math.floor(n/3600000),m=Math.floor(n/60000)%60,s=Math.floor(n/1000)%60;return z(h)+':'+z(m)+':'+z(s)+'.'+String(n%1000).padStart(3,'0')};
let ep=D.episodes.find(e=>e.id===PA);
const typeLabel=k=>k==='F'?'🌏 외국인 실제 자막':'🎙 GPT 새 나레이션';
const sourceLink=(id)=>{let s=D.sources[id];return s?'<a target="_blank" rel="noopener" href="'+ESC(s.url)+'">'+ESC(id)+' ▶ 원본</a>':ESC(id)};
const statusHTML=(k)=>k==='F'?'<span class="status warn">원음·화자 재확인</span><span class="status fail">영상 사용권 미확인</span>':'<span class="status info">자체 제작 대사</span>';
const qkey=([id,n])=>id+'-'+n;
function gridFor(ep){
 let rows=[];for(const b of ep.beats){let ii=0,jj=0;
  [...b.order].forEach((kind,k)=>{const start=b.timeStart+4*k;
   if(kind==='F'){const [id,n]=b.q[ii++],q=D.quotes[qkey([id,n])];if(!q)throw Error(id+' #'+n+' 누락');
    rows.push({i:rows.length+1,start,end:start+4,kind:'F',beat:b.index,beatTitle:b.head,beatArc:b.arc,style:b.style,emotion:b.mood,text:q.ko,zh:q.zh,sourceId:id,cue:n,sourceStart:timeMs(q.originalFromMs),sourceEnd:timeMs(q.originalToMs),sourceLink:D.sources[id].url,srt:q.originalSrt||D.sources[id].jsonSource||'',clipMilliseconds:q.originalToMs-q.originalFromMs,rights:'UNCONFIRMED',evidence:'원문 ASR 번역 후보: 원음 대조 필요',shot:'원작자 영상 위치 후보. 이용허락 전 원영상·원음 0초. 별도 허가 B롤 + 투명 자막/출처 카드',audio:'이용권 확인 후 원음('+((q.originalToMs-q.originalFromMs)/1000).toFixed(1)+'초) / 나머지는 화면 유지',font:'원발언: 노랑·시안 / 출처 28px / 자막 58px'});}
   else{const text=b.n[jj++];rows.push({i:rows.length+1,start,end:start+4,kind:'N',beat:b.index,beatTitle:b.head,beatArc:b.arc,style:b.style,emotion:b.mood,text,zh:'',sourceId:'EDITORIAL',cue:'',sourceStart:'',sourceEnd:'',sourceLink:'',srt:'',clipMilliseconds:4000,rights:'ORIGINAL',evidence:'본편 해설·분석. 인과·일반화·수치 재검수',shot:visualFor(b,k),audio:'로컬 TTS 4초 가배치 / 질문 끝 0.3초 여백 / BGM ducking',font:'흰색 Black Han Sans / 핵심 노랑·분홍 / 큰 글자 54~72px'});}
 });}
 return rows;
}
function visualFor(b,k){const base={
  interview:'허가된 인터뷰/인물 영상 위 반투명 하단 로어써드 + 이름·출처',
  number:'자료 시각화: 숫자 1개 중심 배치, 제목 볼드·단위·출처 고정',
  quote:'실제 중국어 원문↔한국어 번역 좌우 분할, 근거 ID 표시',
  review:'3기준(맛·가격·서비스 / 문화·장비·가격) 색상 비교 카드',
  photo:'허가 받은 현장 B롤 4초, 반투명 검정 레이어(40~55%) + 설명',
  transparent:'화면 뒤 실사 유지, 전면 검정 55% 반투명 + 화이트 본문 + 형광 강조',
  split:'한국·중국·일본 또는 대상별 비교 3열, 동일 기준 아닌 자료 경고',
  chat:'말풍선 2개와 표정 반응 아이콘, 실제 화자·출처 명시',
  article:'신문형 자체 제작 카드, 원문 출처/촬영일, 형광펜 강조(뉴스 기사로 위장 금지)'
};return(base[b.style]||base.transparent)+' · '+(k===0?'방향·한 문장 선공개':k===2?'부분 답·그래픽 반전':'다음 질문을 화면에 남기기');
}
function nav(){
 const navs='<details open><summary>📖 7분 대본 · 1편 1페이지</summary>'+D.episodes.map(x=>'<a class="navlink '+(PA===x.id?'active':'')+'" href="'+x.id+'.html"><em>'+(x.id==='ep01'?'🍜':'🎮')+'</em><span>'+ESC(x.short)+'<b>7:00 · 105컷 · 1:1 검수</b></span></a>').join('')+'</details>';
 const beats=ep?'<details open><summary>⏱ 현재 대본 · 20초씩 21구간</summary>'+ep.beats.map(b=>'<a class="navlink v6-smallnav" href="#beat'+b.index+'"><em>'+z(b.index)+'</em><span>'+mm(b.timeStart)+' '+ESC(b.head)+'</span></a>').join('')+'</details>':'';
 return '<aside class="left" id="leftNav"><div class="tag">V6.0 BY GPT · PROJECT SCRIPT</div><details open><summary>⭐ 제일 위 · V6 제작실</summary><a class="navlink '+(PA==='index'?'active':'')+'" href="index.html"><em>🏠</em><span>V6 아웃라인·완성 대본 홈</span></a><a class="navlink" target="_blank" href="'+ESC(D.attributionUrl)+'"><em>✦</em><span>By GPT · 원본 대화 링크<b>프로젝트의 참고 대화</b></span></a></details>'+navs+beats+
 '<details open><summary>🎨 편집·원본 연구</summary><a class="navlink" href="../kukppong-v41/ep02.html"><em>🗂</em>V4 원본 1:1 화면</a><a class="navlink" href="../kukppong-v4-claude/fewshot.html"><em>📜</em>좋은 대본 4편 분석</a><a class="navlink" href="../foreign-reactions-v5/"><em>🏆</em>기존 아웃라인 TOP10·부산 편</a><a class="navlink" href="../../reactions-downloads/"><em>🎞</em>신규 자막·댓글 99건</a><a class="navlink" href="data.js"><em>🧾</em>V6 검수 데이터</a></details><p class="mini">↔ 경계선을 드래그해 메뉴 폭 조절<br>원문 ASR·저작권은 검수 전 상태</p></aside><div id="leftGrip" class="left-grip" role="separator" aria-label="왼쪽 메뉴 폭 조절" title="좌우로 드래그하거나 방향키로 조절, 더블 클릭은 초기화" tabindex="0" aria-orientation="vertical"></div>';
}
function header(){return '<header class="top"><a class="toplogo" href="index.html">🇰🇷 외국인이 본 한국 · V6 <small>BY GPT · '+ESC(D.project)+'</small></a><div class="toplinks"><a class="hot" href="'+ESC(D.attributionUrl)+'" target="_blank" rel="noopener">✦ By GPT · 원본 대화 ↗</a><a href="../">← 연구 허브</a><a href="../kukppong-v41/ep02.html">V4 디자인 기준 ↗</a><button class="btn mobile-nav" id="mobileNav" type="button">☰ 목차</button></div></header>';}
function metric(num,label,color){return '<div class="metric"><div class="num '+color+'">'+num+'</div><div class="hint">'+label+'</div></div>'}
function intro(){return '<div class="hero"><div class="eyebrow">외국인의 발언 → 반전 → 한국 경험 → 진짜 평가 · 2026.11.15</div><h1>한국을 칭찬하는 말을 먼저 들려줍니다.<br><span class="gold">그리고 그 칭찬이 진짜였는지 검증합니다.</span></h1><p class="lead">한국 소개보다 외국인 실제 반응이 앞섭니다. 중국인 여행자의 중국 내 일본계 편의점 평가와 한국 라면 감탄, T1 PC방의 중국·일본 비교를 별개의 화자·조건으로 구분했습니다.</p><div class="chips"><span class="status ok">기획 가배치: 7분</span><span class="status info">4초 컷 105개 / 편</span><span class="status warn">나레이션 60 / 반응 40</span><span class="status fail">원본 영상 권리 미확인</span></div></div>'+
 '<section class="metrics">'+metric('2','새 7분 국뽕 대본','gold')+metric('210','두 편 합계 컷 수','blue')+metric('84','서로 다른 자막 위치','green')+metric('10','기존 V5 아웃라인 보존','purple')+metric('0','현재 사용 허가 확인된 원본 클립','red')+'</section>'+
 '<div class="outlines">'+D.episodes.map((x,i)=>'<article class="outline"><div class="rank">🥇 '+(i+1)+' · 7분 · 1:1 검수</div><h2>'+ESC(x.title)+'</h2><p class="subtle">'+ESC(x.subtitle)+'</p><p>첫 12초: 다른 외국인의 <strong>실제 한국 긍정 발언 3개</strong>를 이어 배치합니다. 다음 20초에 반대 평가를 보여주고, 끝에서 회수합니다.</p><div class="metrics mini-metrics">'+metric('63','내레이션 컷','gold')+metric('42','외국인 반응 컷','blue')+metric('105','총 컷 수','green')+'</div><a class="btn primary" href="'+x.id+'.html">🎬 대본·1:1 타임라인 보기</a></article>').join('')+'</div>'+
 '<section class="panel"><h2>🎨 제공된 이미지 7장, 디자인 규칙으로 변환</h2><div class="v6-styles">'+[["인터뷰 하단바","인물 화면 / 출처 / 큰 자막"],["비교 도넛","통계 출처가 있을 때만 차트"],["숫자 변화","큰 숫자 / 화살표 / 연도"],["형광 기사","출처 / 핵심 문장 노랑 강조"],["지도","나라·도시 이동 이유 설명"],["말풍선","찬성·비판 반응 대비"],["반투명 오버레이","배경 영상 45~60% 음영 / 큰 글씨"]].map(([a,b],i)=>'<div class="v6-style"><b>'+String(i+1).padStart(2,'0')+' '+ESC(a)+'</b><p>'+ESC(b)+'</p></div>').join('')+'</div><div class="alert">이미지는 디자인 레퍼런스로만 사용합니다. 로고·기자 사진·원방송 캡처를 새 결과에 복제하거나 권리 없이 영상에 쓰지 않습니다.</div></section>'+
 '<section class="panel"><h2>📜 기존 10개 주제 아웃라인 보존</h2><p>이전 V5의 부산·T1·친절·교통·밥솥·콘서트·뷰티·편의점·정류장·현대차 아웃라인은 그대로 열립니다.</p><a class="btn amber" href="../foreign-reactions-v5/index.html">기존 TOP10 열기</a></section>'+
 '<section class="panel"><h2>✅ 실제 반응과 제작용 해설의 기준</h2><p>① 중국어 원문 + 한국어 자막 + 영상 ID + 원본 시각을 같이 보여줍니다. ② 일본계 로손·패밀리마트 중국 매장의 발언을 일본 국민의 의견으로 바꾸지 않습니다. ③ 한국 T1 유료 룸과 중국 무료 행사 매장을 같은 가격 서비스로 순위화하지 않습니다. ④ 댓글 칭찬은 근거를 확인한 경우에만 사용합니다. ⑤ 조회수나 성과는 약속하지 않습니다.</p></section>';}
function hero(ep){return '<div class="hero"><div class="eyebrow">BY GPT · 대본8.18 프로젝트 · ORIGINAL SCRIPT · 7:00 EDIT GRID</div><h1>'+ESC(ep.title)+'</h1><p class="lead">'+ESC(ep.subtitle)+'</p><div class="v6-actions"><button class="btn primary" id="ttsOnly">🎙 나레이션 63문장 TXT</button><button class="btn" id="fullScript">📜 나레이션+실제 반응 통합 대본</button><button class="btn amber" id="csvOut">⬇ 105컷 1:1 CSV</button><button class="btn" id="jsonOut">🧾 원본 근거 JSON</button></div><div class="v6-labelrow"><span class="status ok">7:00 기획값</span><span class="status info">컷 4초 고정</span><span class="status warn">반응 42컷 / 내레이션 63컷</span><span class="status fail">원음 직접 재검수 전</span></div><div class="alert">⚠ 실제 MP4·원음 검수 및 이용허락은 미완료입니다. 반응 컷 40%는 편집 구역 예약값이며, 허락받기 전까지는 원본 영상·원음을 넣지 않고 출처가 명시된 자막 카드로 대체합니다. 로컬 TTS로 길이를 실측한 뒤 4초 이하로 재정렬하세요.</div></div>';}
function colorMood(k){return k>3?'#8ee0b1':k===3?'#ffda72':'#ff969e';}
function clipCard(row){const foreign=row.kind==='F';return '<div class="v6-cut-card '+(foreign?'foreign':'narrator')+'" data-preview="'+(row.i-1)+'" tabindex="0" role="button" aria-label="'+ESC(mm(row.start))+' 컷 미리보기"><div class="v6-cut-head"><b>'+mm(row.start)+'–'+mm(row.end)+'</b> <span>'+typeLabel(row.kind)+'</span></div><p>'+ESC(row.text)+'</p><small>'+(foreign?'📍 '+ESC(row.sourceId)+' / '+ESC(row.sourceStart)+' ~ '+ESC(row.sourceEnd):'🎞 '+ESC(row.style)+' 그래픽')+'</small></div>';}
function beatSection(b,rows){return '<details class="beat v6-beat" id="beat'+b.index+'" '+(b.index<=2?'open':'')+'><summary><span><span class="status '+(b.mood>=4?'ok':b.mood===3?'warn':'fail')+'">'+ESC(b.arc)+'</span> <strong>'+z(b.index)+' · '+ESC(b.head)+'</strong></span><span class="timing">'+mm(b.timeStart)+'–'+mm(b.timeEnd)+' · 4초 × 5컷</span></summary><div class="beat-body"><div class="beat-qa"><b>❓ 중심 질문</b> '+ESC(b.question)+'<br><b>✅ 부분 답</b> '+ESC(b.answer)+'<br><b>➡ 다음 질문</b> '+ESC(b.next)+'</div><div class="v6-beatstrip">'+rows.map(r=>'<span style="background:'+(r.kind==='F'?'#4fc6df':'#e0b855')+'"></span>').join('')+'</div><div class="v6-five">'+rows.map(clipCard).join('')+'</div><div class="v6-btm"><b>감정 곡선 '+b.mood+'/5</b><div class="emotion" style="max-width:130px"><i style="width:'+(b.mood*20)+'%;background:'+colorMood(b.mood)+'"></i></div><span>🎨 '+ESC(b.style)+' · 이 챕터의 근거 원음은 미검수</span></div></div></details>';}
function pageScript(){
 const cuts=gridFor(ep);
 return hero(ep)+'<section class="metrics">'+metric('7:00','출력 타임라인 목표','gold')+metric('105','4초 이하 컷 설계','blue')+metric('63','나레이션 252초 · 60%','green')+metric('42','외국인 반응 168초 · 40%','purple')+metric('21','질문 → 답 → 다음 질문','red')+'</section>'+
 '<div class="episode-tabs"><a class="active" href="#fullbody"><strong>🎙 전체 대본</strong>21구간 · 4초 컷 순서</a><a href="#table"><strong>🎬 1:1 전체 검수표</strong>105컷 · 원본 ID·초·SRT</a><a href="#style"><strong>🎨 영상 스타일 미리보기</strong>반투명·숫자·형광 기사</a><a href="#check"><strong>✅ 업로드 QA</strong>허가·자막·TTS 확인</a></div>'+
 '<div class="split"><div class="maincol"><section id="fullbody"><section class="panel"><h2>🧲 첫 20초, 외국인 한국 호평 3연속</h2><p class="subtle">0~12초는 서로 다른 외국인의 녹음 자막입니다. 12~20초에 GPT 나레이션이 들어갑니다. 외국인의 말은 인용을 위한 전사이며 원음 확인 전 상태입니다.</p><div class="v6-three">'+cuts.slice(0,3).map(clipCard).join('')+'</div></section><section class="panel"><h2>🌊 21비트 감정선 · Q→A→다음 Q</h2><div class="v6-emotions">'+ep.beats.map(b=>'<a href="#beat'+b.index+'" title="'+ESC(b.arc)+'"><div style="height:'+(10+b.mood*9)+'px;background:'+colorMood(b.mood)+'"></div><small>'+z(b.index)+'</small></a>').join('')+'</div><p class="subtle">감정 곡선은 작가 설계값이며 실제 시청 지속률 데이터가 아닙니다.</p></section>'+ep.beats.map((b,i)=>beatSection(b,cuts.slice(i*5,i*5+5))).join('')+'</section><section class="panel" id="table"><h2>🎬 1:1 SEMANTIC JUDGE · 대본 문장 ↔ 영상 컷 ↔ 원본</h2><p class="subtle">총 105행, 한 행에 4초. 국내 방송·원영상에서 직접 확인되지 않은 장면을 실재 영상인 것처럼 표기하지 않습니다. 원본 시각은 SRT/ASR 기준, 출력 시각은 편집 가배치 기준입니다.</p><div class="viewnav"><button class="btn active" data-filter="all">전체 105</button><button class="btn" data-filter="F">🌏 외국인 42</button><button class="btn" data-filter="N">🎙 해설 63</button><button class="btn" data-filter="unchecked">미확인만</button><button class="btn" id="checkReset" title="이 브라우저에만 저장된 확인 표시 초기화">체크 초기화</button></div><div class="v6-table-wrap"><table class="timeline" id="auditTable"><thead><tr><th>검수</th><th>최종 초 / 기능</th><th>대본/자막 · 1문장</th><th>원문 증거 · 소스 초</th><th>영상 화면(4초) · 그래픽</th><th>폰트/효과음/BGM</th><th>SEMANTIC / 권리</th></tr></thead><tbody>'+cuts.map(rowTable).join('')+'</tbody></table></div><div class="alert">이 표에서 체크한 항목은 사용자가 표시한 작업 상태만 뜻합니다. GPT가 실제 영상과 발언을 듣고 검수 통과를 확정했다는 의미가 아닙니다.</div></section>'+
 '<section class="panel" id="style"><h2>🎨 첨부 이미지 형식에 맞춘 실전 영상 구성 7종</h2><p class="subtle">아래는 새 영상의 편집 레이아웃 시안입니다. 사용자가 올린 TBS·klab 원본 이미지를 재업로드하거나 로고를 재사용하지 않았습니다.</p><div id="screenPreview" class="v6-preview"><div class="v6-backdrop"><div class="v6-film"></div><div class="v6-overlay"><div class="v6-origin">📍 영상 / 자막 ID · 확인 전</div><div class="v6-preview-main">반응으로 시작하고, 이유로 붙잡습니다.</div><div class="v6-preview-sub">사진 같은 반투명 레이어 + 출처 + 강한 자막</div></div></div></div><div class="v6-theme-tabs">'+['interview','number','article','split','chat','transparent','review'].map((x,i)=>'<button class="btn" data-style="'+x+'">'+['인터뷰 로어써드','숫자·그래프','기사 형광강조','한중일 비교','말풍선','반투명','평가 비교'][i]+'</button>').join('')+'</div><div class="alert">숫자 그래프는 실제 근거가 있거나 제작 비중 60:40 같은 편집 설계값에만 사용합니다. 사진에 보인 반도체 점유율, 일본 임금 등은 이번 영상 사실로 가져오지 않습니다.</div></section><section class="panel" id="check">'+checklist()+'</section></div>'+
 '<aside class="right"><section class="panel"><h2>✅ V6 검수 데스크</h2><p class="subtle"><b>By GPT · '+ESC(ep.id.toUpperCase())+'</b><br>'+ESC(D.project)+'</p><div id="reviewProgress" class="v6-review"></div><div class="progressbar"><span class="n" style="width:60%"></span><span class="c" style="width:40%"></span></div><p class="legend">🎙 <b>60%</b> 나레이션 · 🌏 <b>40%</b> 외국인 반응 배치 (목표)</p><h3>핵심 검수 5개</h3><div class="v6-tasks" id="tasks"><label><input type="checkbox" data-task="source"> 원문 SRT·화자·실제 원음 재확인</label><label><input type="checkbox" data-task="timing"> 로컬 TTS 실측 7분 안에 정렬</label><label><input type="checkbox" data-task="rights"> 원본 클립 개별 이용권 확인</label><label><input type="checkbox" data-task="quote"> 사실/의견/ASR 오역 분리</label><label><input type="checkbox" data-task="publish"> 저작권·초상권·자료출처 검수</label></div><h3>중요한 판정</h3><p>'+ESC(ep.notes)+'</p><a class="btn amber" href="'+ESC(D.attributionUrl)+'" target="_blank">✦ 이 작업의 GPT 대화</a></section><section class="panel"><h3>🔗 참고 프롬프트</h3><p><a href="../kukppong-v4-claude/prompt.html">V4.3 프롬프트</a></p><p><a href="../kukppong-v4-claude/fewshot.html">훅 4개 사례 분석</a></p><p><a href="../kukppong-v41/ep02.html">기존 1:1 디자인</a></p></section></aside></div>';
}
function rowTable(r){
 const isF=r.kind==='F',source=isF?'<div class="evidence-cell"><b>'+ESC(r.sourceId)+' #'+r.cue+'</b><br><b>'+r.sourceStart+' ~ '+r.sourceEnd+'</b><br><span class="zh" lang="zh">'+ESC(r.zh)+'</span><br><a href="'+ESC(r.sourceLink)+'" target="_blank" rel="noopener">▶ 원본</a> '+(r.srt?'<a target="_blank" href="'+ESC(r.srt)+'">SRT/JSON</a>':'')+'</div>':'<div>자체 작성·근거는 같은 비트의 외국인 평가 / 화면 사실을 재검수</div>';
 return '<tr class="v6-row '+(isF?'quote':'narr')+'" data-kind="'+r.kind+'" data-row="'+(r.i-1)+'"><td><input class="v6-check" type="checkbox" data-check="'+r.i+'" title="사용자가 직접 확인한 항목만 체크"></td><td><b>'+mm(r.start)+'–'+mm(r.end)+'</b><br><span class="status '+(isF?'warn':'info')+'">'+typeLabel(r.kind)+'</span><small>#'+z(r.i)+' · 비트'+z(r.beat)+'</small></td><td><div class="v6-script-cell">'+ESC(r.text)+'</div><small>'+ESC(r.beatTitle)+'</small></td><td>'+source+'</td><td>'+ESC(r.shot)+'</td><td>'+ESC(r.font)+'<hr class="v6-line">'+ESC(r.audio)+'</td><td>'+statusHTML(r.kind)+'<br>'+ESC(r.evidence)+'</td></tr>';
}
function checklist(){return '<h2>🔴 제작·검수 체크리스트 (중요도순)</h2><div class="v6-qa-grid"><div><b>① 원본 대응</b><p>각 컷의 원본 ID, ASR 줄 번호, 중국어 원문, 한국어 번역, 영상 시각을 일치시키고 오역·화자를 확인합니다.</p></div><div><b>② 자막·발언</b><p>실제 음성이 제공된 구간만 외국인 직접인용으로 처리합니다. 다른 크리에이터 말은 같은 인물이 바뀐 반응처럼 연결하지 않습니다.</p></div><div><b>③ 4초 숏 컷</b><p>표의 슬롯은 모두 4초. 실제 영상이 4초보다 짧으면 허가 B롤·자체 자막으로 연장하며, 속도 변경은 소리 왜곡에 주의합니다.</p></div><div><b>④ 60:40 편집 비중</b><p>63컷×4초=252초 나레이션, 42컷×4초=168초 외국인 반응 카드/허가 영상. 상업 업로드 시 이용 허가 필수.</p></div><div><b>⑤ 시각화 7종</b><p>인터뷰, 숫자·화살표, 60/40 도넛, 형광기사 카드, 국가비교 지도, 말풍선, 반투명 배경. 외부 통계가 없다면 숫자는 제작구성만 표시합니다.</p></div><div><b>⑥ 편집 파일</b><p>TXT/CSV/JSON 내려받기. 클로드 코드에 주고 원본 SRT와 로컬 TTS WAV의 forced alignment를 확인하게 합니다.</p></div><div><b>⑦ 소리·폰트</b><p>큰 볼드 자막 2줄 이하, 밝은 노랑/흰색·반대의견 분홍. BGM은 내레이션보다 18~24dB 낮게 유지하고 SFX는 전환에만 씁니다.</p></div><div><b>⑧ 결과 판정</b><p>‘한국이 일본보다 무조건 낫다’는 주장 대신, 현장에서 어느 조건이 좋아 보였는지 외국인의 정확한 평가로 마무리합니다.</p></div></div>';}
function download(text,fn,type='text/plain;charset=utf-8'){const blob=new Blob([text],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fn;a.click();setTimeout(()=>URL.revokeObjectURL(url),1300)}
function csvEscape(v){return '"'+String(v??'').replace(/"/g,'""')+'"'}
function csv(rows){const head=['번호','최종 시작','최종 종료','종류','원고·자막','원본 원문','원본 ID','원본줄','원본시작','원본종료','화면 연출','폰트·레이어','소리·효과음','저작권','검수 상태','원본 URL'];let matrix=[head,...rows.map(r=>[r.i,mm(r.start),mm(r.end),r.kind,r.text,r.zh,r.sourceId,r.cue,r.sourceStart,r.sourceEnd,r.shot,r.font,r.audio,r.rights,r.evidence,r.sourceLink])];return '\uFEFF'+matrix.map(row=>row.map(csvEscape).join(',')).join('\r\n')}
function exportButtons(rows){
 const t=$('ttsOnly'),f=$('fullScript'),c=$('csvOut'),j=$('jsonOut');
 t.onclick=()=>download(rows.filter(x=>x.kind==='N').map(x=>'['+mm(x.start)+'–'+mm(x.end)+'] '+x.text).join('\n'),ep.id+'-tts-narration-v6.txt');
 f.onclick=()=>download(rows.map(r=>'['+mm(r.start)+'–'+mm(r.end)+'] '+(r.kind==='F'?'[외국인/ASR 미검수 '+r.sourceId+' '+r.sourceStart+'] ':'[GPT 나레이션] ')+r.text).join('\n'),ep.id+'-full-script-v6.txt');
 c.onclick=()=>download(csv(rows),ep.id+'-105cuts-semantic-audit-v6.csv','text/csv;charset=utf-8');
 j.onclick=()=>download(JSON.stringify({episode:ep,rows,metadata:{sourceRights:D.sourceRights,evidence:D.evidence}},null,2),ep.id+'-1to1-evidence-v6.json','application/json;charset=utf-8');
}
function setPreview(style,quote){
 const p=$('screenPreview');if(!p)return;
 p.dataset.style=style;
 const main=p.querySelector('.v6-preview-main'),sub=p.querySelector('.v6-preview-sub'),origin=p.querySelector('.v6-origin');
 if(!main||!sub)return;
 const texts={
 interview:['외국인이 한국에서 발견한 것','출처 + 번역 자막 · 인터뷰 로어써드'],
 number:['60% 내레이션 → 40% 해외반응','편집 목표 비율 · 통계 자료 아님'],
 article:['“좋다는 말만 남기면 절반입니다”','실제 자막 ID를 크게 표시하는 기사형 카드'],
 split:['한국 | 일본 | 중국','비교 조건·원본 ID·화자 각자 구분'],
 chat:['“한국 라면, 정말 맛있어요”','실제 반응 카드 + 반대 평가 나란히'],
 transparent:['배경은 보이되, 글자는 또렷하게','실사 위 검정 55% 투명 오버레이'],
 review:['칭찬 → 의외의 불만 → 재평가','긍정 노랑 / 부정 분홍 / 출처 시안']
 };
 main.textContent=quote||texts[style]?.[0]||texts.transparent[0];sub.textContent=texts[style]?.[1]||texts.transparent[1];
 origin.textContent='BY GPT · 텍스트/편집 시안 · 원본 영상 권리 미확인';
}
function wire(){
 const rows=ep?gridFor(ep):null;const left=$('leftNav'),grip=$('leftGrip');
 const saved=Number(localStorage.getItem('v6-sidebar-width'));if(saved>=190&&saved<=580)document.documentElement.style.setProperty('--v6-side',saved+'px');
 const size=(px)=>{px=Math.min(580,Math.max(190,Math.round(px)));document.documentElement.style.setProperty('--v6-side',px+'px');localStorage.setItem('v6-sidebar-width',String(px))};
 grip?.addEventListener('pointerdown',e=>{e.preventDefault();grip.setPointerCapture(e.pointerId);grip.classList.add('drag');const move=x=>size(x.clientX);const up=()=>{grip.classList.remove('drag');grip.removeEventListener('pointermove',move);grip.removeEventListener('pointerup',up)};grip.addEventListener('pointermove',move);grip.addEventListener('pointerup',up)});
 grip?.addEventListener('keydown',e=>{if(['ArrowRight','ArrowLeft','Home'].includes(e.key)){e.preventDefault();let w=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--v6-side'))||260;size(e.key==='Home'?260:w+(e.key==='ArrowRight'?16:-16))}});
 grip?.addEventListener('dblclick',()=>size(260));
 $('mobileNav')?.addEventListener('click',()=>left.classList.toggle('open'));
 left?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>left.classList.remove('open')));
 if(!ep)return;
 exportButtons(rows);
 const base='v6-cuechecks-'+ep.id;
 let checked={};try{checked=JSON.parse(localStorage.getItem(base)||'{}')}catch{}
 function updateStatus(){const total=rows.length,done=Object.keys(checked).filter(k=>checked[k]).length,p=$('reviewProgress');if(p)p.innerHTML='<strong>'+done+' / '+total+'</strong>편집 행 확인 표시 <small>(저작권·음성 검증을 대신하지 않음)</small>';}
 $('auditTable')?.querySelectorAll('[data-check]').forEach(input=>{input.checked=!!checked[input.dataset.check];input.addEventListener('change',()=>{checked[input.dataset.check]=input.checked;localStorage.setItem(base,JSON.stringify(checked));updateStatus()})});updateStatus();
 let tasks={};try{tasks=JSON.parse(localStorage.getItem('v6-tasks-'+ep.id)||'{}')}catch{}
 document.querySelectorAll('[data-task]').forEach(input=>{input.checked=!!tasks[input.dataset.task];input.addEventListener('change',()=>{tasks[input.dataset.task]=input.checked;localStorage.setItem('v6-tasks-'+ep.id,JSON.stringify(tasks))})});
 let active='all';function apply(){document.querySelectorAll('.v6-row').forEach(tr=>{const kind=tr.dataset.kind,ci=+tr.dataset.row+1;tr.style.display=active==='all'||active===kind||(active==='unchecked'&&!checked[ci])?'':'none'})}
 document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{active=btn.dataset.filter;document.querySelectorAll('[data-filter]').forEach(el=>el.classList.toggle('active',el===btn));apply()}));
 $('checkReset').onclick=()=>{if(!confirm('이 브라우저의 해당 대본 편집 확인 표시 105개를 초기화할까요?'))return;checked={};localStorage.removeItem(base);document.querySelectorAll('[data-check]').forEach(input=>input.checked=false);updateStatus();apply()};
 document.querySelectorAll('[data-style]').forEach(btn=>btn.addEventListener('click',()=>setPreview(btn.dataset.style)));
 document.querySelectorAll('[data-preview]').forEach(el=>{const open=()=>{const row=rows[+el.dataset.preview];setPreview(row.style,row.text);$('screenPreview').scrollIntoView({behavior:'smooth',block:'center'})};el.addEventListener('click',open);el.addEventListener('keydown',e=>{if(e.key==='Enter')open()})});
 setPreview('transparent');
}
$('app').innerHTML=header()+'<div class="layout v6-layout">'+nav()+'<main class="workspace v6-workspace">'+(ep?pageScript():intro())+'<footer class="foot">© Original narration: By GPT (대본8.18 프로젝트). 외국인 인용: 원저작자 소유, ASR 후보/원본 링크 제공. 게시 전 원음·저작권 별도 확인.</footer></main></div><div id="toast"></div>';
wire();
})();