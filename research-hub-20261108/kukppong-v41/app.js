
(() => {
"use strict";
const ROOT="./", HERE="https://geben147-create.github.io/Insta/research-hub-20261108/kukppong-v41/";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const mm=v=>{v=Math.max(0,Math.round(v));return String(Math.floor(v/60)).padStart(2,"0")+":"+String(v%60).padStart(2,"0")};
const sec=v=>{let z=String(v||"0").replace(",",".").split(":");return (+z[0]||0)*3600+(+z[1]||0)*60+(+z[2]||0)};
const lab=(name,style="info")=>'<span class="status '+style+'">'+esc(name)+'</span>';
const comma=v=>Number(v||0).toLocaleString("ko-KR");
const pathFrom=(d,id)=>d.sources[id]?.local||"원본 로컬경로 미기록";
const srcLabel=(d,id)=>{let s=d.sources[id];return s?esc(s.title.replace(/^\\[[^\\]]+\\]\\s*/,"").slice(0,90)):esc(id)};
const rawLink=id=>"https://github.com/geben147-create/Insta/blob/main/reactions-downloads/subs/"+encodeURIComponent(id)+".ai-zh.srt";
const krLink=id=>"https://github.com/geben147-create/Insta/blob/main/reactions-downloads/subs/"+encodeURIComponent(id)+".ko.srt";
let data,ep,speed=330,clipDuration=4,target=10,cutState=[],shown="script",selectedHook=0,manualChecks=[];
function nav(d,page){
  return '<aside class="left"><div class="tag">V4.2 WORKSPACE</div>'+
    '<details open><summary>📂 시작·아웃라인</summary><a class="navlink '+(page==="index"?"active":"")+'" href="./index.html"><em>🏠</em><span>5개 주제 설계판</span></a>'+
    d.outlines.map(o=>'<a class="navlink" href="./index.html#'+o.id.toLowerCase()+'"><em>'+o.rank+'</em><span>'+esc(o.name)+'</span></a>').join("")+
    '</details><details open><summary>📄 최종 대본 · 1편당 1페이지</summary>'+
    d.episodes.map(e=>'<a class="navlink '+(page===e.id?"active":"")+'" href="./'+e.id+'.html"><em>🎙</em><span>'+esc(e.short)+'<b>'+esc(e.id.toUpperCase())+' · 원본 자막 매칭</b></span></a>').join("")+
    '</details><details open><summary>🛠 제작·검수</summary><a class="navlink" href="../kukppong-script-onepage-20261114.html"><em>📚</em><span>기존 훅·전개 연구</span></a>'+
    '<a class="navlink" href="../../reactions-downloads/index.html"><em>🎬</em><span>자막·다운로드 원본</span></a>'+
    '<a class="navlink" href="./dataset.json"><em>🧾</em><span>대본·근거 통합 데이터</span></a></details>'+
    '<p class="mini">최신 자막 수집분의 일부만 대본화<br>원본 허락·음성 검수는 별도</p></aside>'
}
function header(d){
  return '<header class="top"><div class="toplogo"><small>SEMANTIC JUDGE · SCRIPT & CUT V4.2 · 2026-11-15</small>국뽕 해외반응 대본 검수판</div>'+
  '<div class="toplinks"><a class="hot" href="../index.html">◀ 연구 허브</a><a href="./index.html">5개 아웃라인</a><a href="../../reactions-downloads/index.html">자막·원본</a><a href="../kukppong-script-onepage-20261114.html">훅·전개 공식</a></div></header>'
}
function tabs(page){
 return '<nav class="episode-tabs"><a class="'+(page==="index"?"active":"")+'" href="./index.html"><strong>OUTLINES · 5개</strong><span>주제·훅·감정선·소스</span></a>'+
 data.episodes.map(e=>'<a class="'+(page===e.id?"active":"")+'" href="./'+e.id+'.html"><strong>'+esc(e.id.toUpperCase())+' · '+esc(e.short)+'</strong><span>10분 이상 · 대본+1:1 영상편집</span></a>').join("")+'</nav>'
}
function frame(page,body){
 $("#app").innerHTML=header(data)+'<div class="layout">'+nav(data,page)+'<main class="workspace">'+tabs(page)+body+
 '<footer class="foot">© 원본 출처 각 영상의 제작자 · 이 사이트는 원본 영상 자체를 재게시하지 않습니다. AI 자막에는 오역 가능성이 있으며 이용허락은 별도 확인해야 합니다. · '+esc(data.date)+'</footer></main></div>';
}
function renderIndex(){
 let inv=data.inventory, html='<section class="hero"><div class="eyebrow">OUTLINE × SOURCE ONLY × 1:1 EDIT</div><h1>5개 아웃라인 · 2개 제작 대본</h1>'+
 '<p class="lead">실제 중국어 자막과 한국어 번역이 있는 자료만 뽑았습니다. 외국인 호평은 초반에 실제 발언으로 시작하고, 반대 반응도 지우지 않습니다. 등산객 73만 명 영상은 전개 예시이며 본편의 자료로 사용하지 않습니다.</p></section>'+
 '<div class="metrics">'+metric(inv.videos+"편","수집표 전체 영상","gold")+metric(inv.pairs+"쌍","zh/ko 자막 세트","green")+
 metric(inv.korean+"편","한국 관련 세트","blue")+metric("5개","선택 아웃라인","purple")+metric("2편","10분+ 제작 원고","green")+'</div>'+
 '<div class="panel"><div class="subhead"><h2>🥇 주제 우선순위 · 클릭해서 자료 열기</h2>'+lab("평가: 편집자 판단","warn")+'</div><p class="subtle">순위는 자막 밀도·출연자 발언·장면 연결 가능성과 이야기 완성도를 고려한 제작 우선순위입니다. 조회수 예측 점수가 아닙니다.</p></div>'+
 '<div class="outlines">'+data.outlines.map(o=>
 '<article class="outline" id="'+esc(o.id.toLowerCase())+'"><span class="rank">NO.'+o.rank+' · '+esc(o.topic)+'</span> '+lab(o.status,o.status==="제작"?"ok":"warn")+
 '<h2>'+esc(o.name)+'</h2><div class="scorebar"><span style="width:'+o.priority+'%"></span></div><p class="subtle">제작 적합도 내부 우선순위 '+o.priority+'/100 · 성과 예측치 아님</p>'+
 '<dl><dt>전개 공식</dt><dd>'+esc(o.structure)+'</dd><dt>0~30초 훅</dt><dd>'+esc(o.hook)+'</dd><dt>계속 보게 되는 흐름</dt><dd>'+esc(o.progress)+'</dd>'+
 '<dt>감정선</dt><dd>'+esc(o.emotion)+'</dd><dt>추천 이유</dt><dd>'+esc(o.why)+'</dd><dt>검수 주의</dt><dd>'+esc(o.risk)+'</dd></dl>'+
 '<div style="margin:12px 0">'+o.sourceIds.map(id=>'<div style="margin:5px 0"><a href="'+esc(data.sources[id]?.url||"#")+'" target="_blank" rel="noopener">🎞 '+esc(id)+'</a> '+lab(comma(data.sources[id]?.views)+" 저장 조회","info")+' '+lab((data.sources[id]?.cues||0)+" 자막 컷","warn")+' <a href="'+rawLink(id)+'" target="_blank">원문 SRT</a></div>').join("")+'</div>'+
 (o.ep?'<a class="btn primary" style="display:inline-block" href="./'+o.ep+'">대본 · 1:1 컷 편집 열기</a>':'<span class="subtle">대본 미작성 · 주제 아웃라인만 보존</span>')+'</article>').join("")+'</div>'+
 '<section class="panel" style="margin-top:15px"><h2>📚 제공된 등산 영상: 도입·전개 참고 예시</h2>'+
 '<div class="refbox"><b>「외국인 등산객 73만 명 몰린 한국 산」</b> '+lab("대본에 사실 차용 금지","warn")+
 '<p>참고한 장치는 <strong>호평 선공개 → 한국인의 평범한 일상 → 외국인 시점의 발견 → 작은 감탄 → 다른 사례 → 사람·공간의 의미 → 질문 회수</strong>입니다. 등산객 발언·숫자·국립공원 장면은 라면이나 편의점 이야기의 실제 근거로 쓰지 않았습니다.</p>'+
 '<details style="margin:12px 0"><summary style="cursor:pointer;color:#f9d28e;font-weight:850">🗣 제공된 등산 자막 예시 8개 펼치기 · 구간별 분석</summary><div class="cuegrid">'+data.benchmarkSamples.map(s=>'<div class="cue"><div class="sourcehead">'+lab(s.time,"info")+' '+lab(s.method,"warn")+'</div><div class="orig">'+esc(s.line)+'</div></div>').join("")+'</div><small>'+esc(data.benchmarkTranscriptStatus)+'</small></details>'+
 '<a href="'+esc(data.benchmark.url)+'" target="_blank" rel="noopener">참고 영상 열기</a></div></section>'+
 '<section class="panel"><h2>🔴 실제 영상 사용 전 필수 확인</h2><p class="subtle">저장 조회수는 현재 조회수가 아닙니다. 외국인의 중국어 원음과 자막 자동인식 오류를 대조한 뒤 컷을 확정하세요. 원본 영상의 사용권한은 <strong>UNCONFIRMED</strong>로 수집표에 기록되어 있습니다. 3~6초 컷, 뒤집기, 크롭, 속도 변경만으로 저작권 문제가 해결되는 것은 아닙니다.</p>'+
 '<p><a href="../../reactions-downloads/index.html">영상 다운로드 목차 열기</a> · <a href="./dataset.json">전체 대본·타임코드 JSON 열기</a></p></section>';
 frame("index",html);if(location.hash){setTimeout(()=>$(location.hash)?.scrollIntoView({behavior:"smooth",block:"start"}),100)}
}
function metric(n,txt,cl){return '<div class="metric"><div class="num '+cl+'">'+esc(n)+'</div><div class="hint">'+esc(txt)+'</div></div>'}
function splitSentences(text){
 // Split only at sentence-ending punctuation, preserving all original text in order.
 return (String(text||"").trim().match(/[^.!?。！？]+[.!?。！？]+(?:["”’)]*)|[^.!?。！？]+$/g)||[]).map(s=>s.trim()).filter(Boolean)
}
function eventsFor(e){
 let cur=0,all=[];e.beats.forEach((b,bi)=>{
 let lines=splitSentences(b.text),n=lines.length;
 // All clips, even when there are more than three, get an ordered place in the beat.
 let idx=b.clips.map((_,j)=>Math.min(n-1,Math.max(0,Math.floor((j+1)*n/(b.clips.length+1)))));
 let insertMap=new Map();b.clips.forEach((c,j)=>{let k=idx[j];insertMap.set(k,[...(insertMap.get(k)||[]),c])});
 lines.forEach((line,i)=>{
  let duration=Math.max(1.2,line.length*60/speed);
  const w=b.broll||null, useOriginal=!!w && i%3!==2;
  const source=data.sources[w?.id]||{};
  const windowStart=useOriginal?sec(w.start):0;
  const windowEnd=useOriginal?sec(w.end):0;
  const sampleLength=Math.min(6,duration,Math.max(1,windowEnd-windowStart));
  const room=Math.max(0,windowEnd-windowStart-sampleLength);
  const sampleStart=windowStart+(room?(i*6.5)%room:0);
  const sampleEnd=sampleStart+sampleLength;
  const remainder=Math.max(0,duration-sampleLength);
  all.push({from:cur,to:cur+duration,kind:"narration",beat:bi+1,beatName:b.label,text:line,shot:b.scene,
    asset:useOriginal?"원본 영상 B-roll 후보, 외국어 원음 OFF "+Math.round(sampleLength*10)/10+"초"+(remainder>0.5?" + 자체 그래픽/보충 화면 "+Math.round(remainder*10)/10+"초":""):"자체 그래픽·지도·직접 제작 화면",
    evidence:useOriginal?"SRT 시간범위에서 추린 화면 후보. 원본 MP4 프레임·음원/영상 사용권 미검증":"내레이션 주제에 맞춰 자체 그래픽 제작",
    sourceId:useOriginal?w.id:"",sourceFrom:useOriginal?mm(sampleStart):"",sourceTo:useOriginal?mm(sampleEnd):"",url:useOriginal?(source.url||""):"",path:useOriginal?pathFrom(data,w.id):""});
  cur+=duration;
  for(let c of insertMap.get(i)||[]){
    const from=sec(c.from),cutTo=from+clipDuration;
    all.push({from:cur,to:cur+clipDuration,kind:"quote",beat:bi+1,beatName:b.label,text:c.ko,shot:"원본 발언 장면(확인 전 후보)",asset:c.id,sourceId:c.id,sourceFrom:c.from,sourceTo:mm(cutTo),srtTo:c.to,url:c.link,path:pathFrom(data,c.id),evidence:"중국어 AI 자막 #"+c.n+" · 실제 음성/영상 검수 필요"});
    cur+=clipDuration;
  }
 })
 });
 return all
}
function stat(e){let ev=eventsFor(e),narr=ev.filter(x=>x.kind==="narration").reduce((s,x)=>s+x.to-x.from,0);return {ev,total:ev.length?ev[ev.length-1].to:0,narr,foreign:ev.filter(x=>x.kind==="quote").reduce((s,x)=>s+x.to-x.from,0),ratio:ev.length?narr/ev[ev.length-1].to:0}}
function loadSettings(e){
 try{let saved=JSON.parse(localStorage.getItem("kuk-v41-"+e.id)||"{}");if(saved.speed)speed=+saved.speed;if(saved.clipDuration)clipDuration=+saved.clipDuration;if(saved.target)target=+saved.target;if(Array.isArray(saved.edits)){e.beats.forEach((b,i)=>{if(saved.edits[i])b.text=saved.edits[i]})};if(Number.isInteger(saved.hook))selectedHook=saved.hook;if(Array.isArray(saved.checklist))manualChecks=saved.checklist}catch(_){}
}
function stored(e){return {speed,clipDuration,target,edits:e.beats.map(b=>b.text),hook:selectedHook,checklist:manualChecks,updated:new Date().toISOString()}}
function persist(e){localStorage.setItem("kuk-v41-"+e.id,JSON.stringify(stored(e)))}
function renderEpisode(){
 const e=ep,st=stat(e),duration=st.total,slip=(target*60-duration);
 let html='<section class="hero"><div class="eyebrow">SCRIPT MASTER · '+esc(e.id.toUpperCase())+' · 기준 2026-11-15</div><h1>'+esc(e.title)+'</h1><p class="lead">'+esc(e.subtitle)+'</p>'+
 '<div style="margin-top:10px">'+lab("본문 10개 구간","ok")+' '+lab("중국어 원문+한국어 자막","info")+' '+lab("원본 컷은 검수 후보","warn")+'</div></section>'+
 '<div class="metrics" id="metrics">'+metric(mm(duration),"TTS+원음 예상 길이","gold")+metric(Math.round(st.ratio*100)+"%","내 한국어 내레이션 음성 비율","blue")+
 metric(e.beats.reduce((s,b)=>s+b.clips.length,0)+"개","원본 발언 컷 후보(기본 4초)","purple")+metric(e.beats.reduce((s,b)=>s+b.text.length,0).toLocaleString(),"내레이션 글자(공백 포함)","green")+
 metric(slip>0?"−"+mm(slip):"+"+mm(-slip),slip>0?"목표보다 부족":"목표 대비 초과","red")+'</div>'+
 '<div class="controls"><label>원음 컷 길이 <input id="clipSecs" type="number" min="2" max="10" step="1" value="'+clipDuration+'"> 초</label>'+
 '<label>내레이션 속도 <input id="rate" type="number" min="220" max="650" step="10" value="'+speed+'"> 자/분</label>'+
 '<label>최소 길이 <input id="target" type="number" min="10" max="30" step="1" value="'+target+'"> 분</label>'+
 '<button class="btn" id="recalc">♻ 다시 계산</button><button class="btn primary" id="exportCsv">⬇ 1:1 컷 CSV</button>'+
 '<button class="btn" id="exportText">⬇ TTS 대본 TXT</button><button class="btn amber" id="saveEdits">💾 수정본 브라우저 저장</button>'+
 '<button class="btn ghost" id="openAll">전체 펼치기</button><button class="btn ghost" id="closeAll">전체 접기</button></div>'+
 '<div class="split"><div class="maincol">'+
 '<div class="viewnav"><button class="btn active" data-view="script">🎙 대본·근거</button><button class="btn" data-view="timeline">🎞 1:1 영상편집 타임라인</button><button class="btn" data-view="sources">🔎 원문·로컬 경로</button></div>'+
 '<div class="viewpane" id="pane-script">'+renderScript(e,st)+'</div>'+
 '<div class="viewpane" id="pane-timeline" style="display:none">'+renderTimeline(e,st)+'</div>'+
 '<div class="viewpane" id="pane-sources" style="display:none">'+renderSources(e)+'</div></div>'+
 '<aside class="right">'+renderChecklist(e,st)+'</aside></div>';
 frame(e.id,html); bindEpisode(e)
}
function colorFor(t){return /질문/.test(t)?"#e2b526":/위기|갈등|반전/.test(t)?"#e96568":/자긍심|회수|보상/.test(t)?"#84c978":"#42a6e3"}
function scriptLines(text,type){
 let col=colorFor(type);return splitSentences(text).map((s,i)=>'<span style="border-bottom:2px solid '+(i%4===0?col:"transparent")+';background:'+(i%4===0?col+"27":"transparent")+';padding:1px 2px">'+esc(s)+'</span> ').join("")
}
function renderScript(e,s){
 let html='<section class="panel"><div class="subhead"><h2>🧲 첫 30초 훅 · 3안 비교</h2>'+lab("본문 첫머리는 별도 작성됨","info")+'</div>'+
 '<p class="subtle">세 후보는 비교 메모입니다. 선택만으로 본문에 자동 삽입되지는 않습니다. 적용하려면 해당 구간의 원고를 직접 수정하세요.</p>'+
 '<div class="hookoptions">'+e.hooks.map((h,i)=>'<button class="hookopt '+(selectedHook===i?"active":"")+'" data-hook="'+i+'"><b>HOOK '+(i+1)+(i===0?" · 추천":" · 대안")+'</b><p>'+esc(h)+'</p></button>').join("")+'</div></section>'+
 '<section class="panel"><h2>🌊 전개 흐름 · 10구간</h2><div class="flownotes">'+e.beats.map((b,i)=>'<div><b style="color:'+colorFor(b.type)+'">'+String(i+1).padStart(2,"0")+' · '+esc(b.type)+'</b><br>'+esc(b.label)+'</div>').join("")+'</div><div class="alert">외국인에게 실제로 없는 찬사를 말하게 하지 않습니다. 한국이 절대적으로 최고라는 보편 결론을 만들지 않고, 영상에 나온 기쁨·불편·실랑이를 모두 구분해 사용합니다.</div></section>';
 let cursor=0;let groups=Object.groupBy?Object.groupBy(s.ev,x=>x.beat):null;
 e.beats.forEach((b,i)=>{
 let ev=groups?groups[i+1]:s.ev.filter(x=>x.beat===i+1),t0=cursor,dt=ev.reduce((a,x)=>a+x.to-x.from,0);cursor+=dt;
 html+='<details class="beat" open id="beat'+(i+1)+'"><summary><span><span class="status '+(/위기|반전|갈등/.test(b.type)?"fail":/자긍심|회수|보상/.test(b.type)?"ok":"warn")+'">'+esc(b.type)+'</span> <strong>'+String(i+1).padStart(2,"0")+' · '+esc(b.label)+'</strong></span><span class="timing">'+mm(t0)+' ~ '+mm(cursor)+' · '+b.clips.length+'컷</span></summary>'+
 '<div class="beat-body"><div class="beat-qa"><b>질문</b> '+esc(b.q)+'<br><b>부분 답</b> '+esc(b.a)+'<br><b>다음 궁금증</b> '+esc(b.next)+'</div>'+
 '<div class="beatstrip"></div><div class="script" data-display="'+i+'">'+scriptLines(b.text,b.type)+'</div>'+
 '<textarea class="script-editor" data-beat-editor="'+i+'" style="display:none">'+esc(b.text)+'</textarea>'+
 '<div style="margin:9px 0"><button class="btn" data-edit-beat="'+i+'">✎ 이 구간 수정</button> '+lab("개인 문장 · 편집 용","info")+'</div>'+
 '<div class="cuegrid">'+b.clips.map(c=>renderCue(c)).join("")+'</div>'+
 '<div class="beat-meta">🎞 화면 계획: '+esc(b.scene)+' · 원본 음성 컷 위치는 위 타임코드 참조 · 권리 검토 전 게시 금지</div></div></details>'
 })
 return html
}
function renderCue(c){
 let src=data.sources[c.id]||{},start=sec(c.from);return '<div class="cue"><div class="sourcehead">'+lab("원본 중국어 SRT","info")+' '+lab("AI 음성 재확인","warn")+
 ' <b>'+esc(c.id)+' #'+c.n+'</b> · 원본 '+esc(c.from)+' ~ '+esc(c.to)+' · 추천 컷 '+mm(start)+' ~ '+mm(start+clipDuration)+'</div>'+
 '<div class="orig">“'+esc(c.ko)+'” '+(c.wasCorrected?lab("중국어 대비 번역 교정","ok"):"")+'</div>'+
 '<div class="zh">중국어 인식 원문: '+esc(c.zh)+'</div><div class="actions">'+
 '<a href="'+esc(c.link)+'" target="_blank" rel="noopener">▶ 원본 영상</a><a href="'+esc(c.srt)+'" target="_blank" rel="noopener">zh SRT</a><a href="'+esc(c.koSrt)+'" target="_blank" rel="noopener">ko SRT</a>'+
 lab(src.rights||"UNCONFIRMED","fail")+'</div></div>'
}
function renderTimeline(e,s){
 let html='<section class="panel"><h2>🎬 대본 문장 ↔ 영상 샷 1:1 편집표</h2><p class="subtle">모든 내레이션 문장에 출력 타임코드와 화면 지시를 한 행씩 배정했습니다. 원본 발언은 별도 행으로 넣고 중국어 SRT 원본 시각을 연결했습니다. <strong>출력 시각은 글자 수 기준 추정, 원본 시각은 SRT 기록</strong>입니다. MP4 프레임·TTS 실측을 확인하면 시간이 바뀔 수 있습니다.</p>'+
 '<div class="alert">⚠️ 화면에 적힌 ‘원본 컷’은 음성·화면을 아직 직접 검수하지 않은 후보입니다. 자료에 기록된 권리 상태는 UNCONFIRMED입니다. 원본 사용은 허락/라이선스 확인 뒤 확정하세요.</div></section>'+
 '<div class="tablewrap"><table class="timeline"><colgroup><col width="120"><col width="53"><col width="78"><col width="38%"><col width="32%"><col width="160"></colgroup><thead><tr><th>완성영상 시간</th><th>구간</th><th>화면종류</th><th>🎙 내레이션 또는 원음</th><th>🎞 1:1 화면·편집 지시</th><th>원본 자막 시간 / ID</th></tr></thead><tbody>';
 s.ev.forEach((v,i)=>{html+='<tr class="'+(v.kind==="quote"?"quote":"")+'"><td>'+mm(v.from)+'~'+mm(v.to)+'<small style="display:block">#'+(i+1)+'</small></td>'+
 '<td>'+v.beat+'</td><td>'+lab(v.kind==="quote"?"원음":"내레이션",v.kind==="quote"?"ok":"info")+'</td>'+
 '<td>'+esc(v.text)+'</td><td>'+esc(v.kind==="quote"?"원본 발언 장면, 실제 영상 확인 후 확정":v.shot)+
 '<small style="display:block">'+esc(v.kind==="quote"?"앞뒤 맥락 유지·자체 자막 중첩":v.asset)+'</small></td>'+
 '<td>'+(v.sourceId?'<a href="'+esc(v.url)+'" target="_blank" rel="noopener">'+esc(v.sourceId)+'</a><br>'+esc(v.sourceFrom)+' ~ '+esc(v.sourceTo):'자체 제작 화면')+'</td></tr>'});
 return html+'</tbody></table></div><p class="subtle">총 '+s.ev.length+'행 · 내레이션 '+s.ev.filter(x=>x.kind==="narration").length+'행 · 원본 발언 '+s.ev.filter(x=>x.kind==="quote").length+'행</p>'
}
function renderSources(e){
 return '<section class="panel"><h2>🔎 원본 영상·자막·로컬 경로</h2><p class="subtle">GitHub에는 자막·인덱스가 있고, 로컬 MP4 경로는 수집표에 기록된 Linux 870번 저장소 경로입니다. 현재 접속 중인 컴퓨터에 원본 파일이 복사됐는지는 확인하지 않았습니다.</p>'+
 e.sources.map(s=>'<div class="source"><b>'+esc(s.id)+' · '+srcLabel(data,s.id)+'</b><p class="subtle">저장 조회 '+comma(s.views)+' · 자막 '+s.cues+'컷 · 저장 수집일 '+esc(s.date)+' · 권리 '+esc(s.rights)+'</p>'+
 '<p>원본: <a href="'+esc(s.url)+'" target="_blank">'+esc(s.url)+'</a><br>중국어: <a href="'+rawLink(s.id)+'" target="_blank">AI zh SRT</a> · 한국어: <a href="'+krLink(s.id)+'" target="_blank">ko SRT</a></p>'+
 '<div class="refbox"><b>870 PC 기록 경로</b><p style="word-break:break-all">'+esc(s.local||"미기록")+'</p><button class="btn" data-copy="'+esc(s.local||"")+'">경로 복사</button></div></div>').join("")+
 '</section><section class="panel"><h2>자료 수준</h2><p>🟢 GitHub 자막 존재: 확인함<br>🟡 원음과 중국어 AI 자막 대조: 부분 교정, 전체 확인 필요<br>🔴 원본 MP4 프레임 확인·사용허락: 미확인<br>🟡 한국어 TTS·완성 영상: 미제작<br>🟢 영상 편집 계획·CSV 내보내기: 제공</p></section>'
}
function renderChecklist(e,s){
 const flags=[
 ["첫 한국 호감·특별함 등장","첫 단락에 한국 체험 소재와 실재하는 반응 배치","ok"],
 ["첫 30초 궁금증","원인·해결을 뒤로 미루되 사실 밖 반전 금지","ok"],
 ["도입 5문장 비교","후보 3안 별도 제공·본문 직접 선택 가능","warn"],
 ["원본 문장 연결","원본 ID, SRT 번호·시각 자동 연결","ok"],
 ["중국어 원문 정확도","AI 자동인식, 실제 원음 검수 필요","fail"],
 ["번역 의미 점검","눈에 띄는 오역 일부 교정, 방송 전 재청취","warn"],
 ["질문 → 작은 답 → 새 질문","모든 구간에 세 항목 명시","ok"],
 ["중간 반전·감정 전환","반대 평가와 불편함도 남김","ok"],
 ["대본 10분 이상",s.total>=target*60?"현재 설정에서 "+mm(s.total):"현재 "+mm(s.total)+" · "+target+"분 미달",s.total>=target*60?"ok":"fail"],
 ["내레이션 음성 60% 이상",Math.round(s.ratio*100)+"% · 영상 화면 비율과 별도 계산",s.ratio>=.60?"ok":"fail"],
 ["내레이션 문장별 화면","한 문장 한 컷 + 외국인 원음행 별도","ok"],
 ["원본 3~6초 음성 컷",clipDuration+"초로 가편집 설정 · 저작권 면책 아님",clipDuration>=3&&clipDuration<=6?"ok":"warn"],
 ["단정적 자화자찬 금지","해당 영상을 넘어 한국 전체로 일반화하지 않기","ok"],
 ["TTS 실측·오디오 싱크","글자 수 기반 추정, 실제 음성 미제작","fail"],
 ["원본 이용 허가","다운로드·자막 보유와 사용허락은 별개","fail"]
 ];
 let ok=flags.filter(x=>x[2]==="ok").length,w=flags.filter(x=>x[2]==="warn").length,f=flags.filter(x=>x[2]==="fail").length;
 return '<section class="panel"><div class="subhead"><h2>✅ V4.1 체크리스트</h2><small>적용 '+ok+' · 보완 '+w+' · 미확인 '+f+'</small></div>'+
 '<p class="subtle">각 항목의 적용/보완/미확인은 시스템 점검 상태입니다. 오른쪽 체크는 내가 직접 확인한 항목만 표시하고 이 브라우저에 저장됩니다. 적용 표시는 영상 사용허락을 의미하지 않습니다.</p><div class="checklist">'+flags.map((z,i)=>'<div class="checkrow">'+lab(z[2]==="ok"?"적용":z[2]==="warn"?"보완":"미확인",z[2])+
 '<label>'+esc(z[0])+'<small>'+esc(z[1])+'</small></label><input type="checkbox" data-qc-id="'+i+'" title="직접 확인 후 체크" '+(manualChecks[i]?'checked':'')+' style="width:17px;height:17px;margin:3px auto;cursor:pointer;accent-color:#62be84" aria-label="'+esc(z[0])+' 직접 검수 완료"></div>').join("")+'</div></section>'+
 '<section class="panel"><h2>⌛ 추정 러닝타임</h2><div class="progressbar"><span class="n" style="width:'+(s.ratio*100)+'%"></span><span class="c" style="width:'+((1-s.ratio)*100)+'%"></span></div>'+
 '<p class="legend"><b>■</b> 나레이션 '+mm(s.narr)+' ('+Math.round(s.ratio*100)+'%) · 원본 음성 '+mm(s.foreign)+' ('+Math.round((1-s.ratio)*100)+'%)</p>'+
 '<p class="subtle">공백 포함 분당 '+speed+'자, 원음 컷 '+clipDuration+'초 적용 · 실측 전 추정치</p></section>'+
 '<section class="panel"><h2>❓ 중심 질문</h2><p>'+esc(e.mainQuestion)+'</p><details open><summary>▶ 원본 영상 '+e.sources.length+'개</summary>'+
 e.sources.map(s=>'<div class="source"><b>'+esc(s.id)+'</b><a href="'+esc(s.url)+'" target="_blank" rel="noopener">원본 보기</a> · <span class="views">'+comma(s.views)+' 저장 조회</span> · '+s.cues+'컷 <small style="display:block">'+esc(s.rights)+'</small></div>').join("")+'</details></section>'+
 '<section class="panel"><h2>🔴 편집 전 확인</h2><p class="subtle">라이선스·외국인 원음·화면·TTS 타이밍을 직접 확인하세요. 자동 자막에 잘못된 번역이 일부 포함되어 있습니다. CSV의 시간은 처음 자를 위치를 찾기 위한 후보이며 원본 허락을 대체하지 않습니다.</p></section>'
}
function bindEpisode(e){
 $$("button[data-view]").forEach(b=>b.addEventListener("click",()=>{
  shown=b.dataset.view;$$("button[data-view]").forEach(x=>x.classList.toggle("active",x.dataset.view===shown));
  $$(".viewpane").forEach(x=>x.style.display=(x.id==="pane-"+shown)?"":"none")
 }));
 $$("button[data-hook]").forEach(b=>b.addEventListener("click",()=>{selectedHook=+b.dataset.hook;persist(e);$$("button[data-hook]").forEach(x=>x.classList.toggle("active",x===b))}));
 $$("button[data-edit-beat]").forEach(b=>b.addEventListener("click",()=>{let n=+b.dataset.editBeat,t=$('[data-beat-editor="'+n+'"]'),v=$('[data-display="'+n+'"]');let show=t.style.display==="none";t.style.display=show?"block":"none";v.style.display=show?"none":"block";b.textContent=show?"원고 확인 완료":"✎ 이 구간 수정"}));
 $("#recalc")?.addEventListener("click",()=>{
  saveCurrentEditors(e);
  speed=Math.max(220,Math.min(650,+$("#rate").value||330));
  clipDuration=Math.max(2,Math.min(10,+$("#clipSecs").value||4));
  target=Math.max(10,Math.min(30,+$("#target").value||10));
  persist(e);renderEpisode();setView(shown);toast("TTS·컷 길이를 다시 계산했습니다")
 });
 $("#saveEdits")?.addEventListener("click",()=>{saveCurrentEditors(e);persist(e);renderEpisode();setView(shown);toast("수정본을 이 브라우저에 저장했습니다. GitHub에는 자동 반영되지 않습니다.")});
 $("#openAll")?.addEventListener("click",()=>$$(".beat").forEach(x=>x.open=true));
 $("#closeAll")?.addEventListener("click",()=>$$(".beat").forEach(x=>x.open=false));
 $("#exportCsv")?.addEventListener("click",()=>downloadCSV(e,stat(e).ev));
 $("#exportText")?.addEventListener("click",()=>downloadText(e));
 $$("input[data-qc-id]").forEach(b=>b.addEventListener("change",()=>{manualChecks[+b.dataset.qcId]=b.checked;persist(e);toast("검수 체크가 이 브라우저에 저장됐습니다") }));
 $$("button[data-copy]").forEach(b=>b.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(b.dataset.copy);toast("경로를 복사했습니다")}catch(_){toast("복사가 제한된 환경입니다")}}))
}
function setView(v){const b=$('button[data-view="'+v+'"]');b?.click()}
function saveCurrentEditors(e){$$("[data-beat-editor]").forEach(t=>{let i=+t.dataset.beatEditor;if(t.style.display!=="none"||t.value!==e.beats[i].text)e.beats[i].text=t.value.trim()||e.beats[i].text})}
function downloadFile(filename,content,type){
 const a=document.createElement("a"),blob=new Blob([content],{type:type||"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob);a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2500)
}
function downloadCSV(e,ev){
 const columns=["output_start","output_end","section","kind","narration_or_quote","shot_plan","source_id","source_start","source_end_candidate","srt_record_end","original_url","local_directory","rights_status","evidence"];
 const csvCell=x=>'"'+String(x??"").replace(/"/g,'""').replace(/\r?\n/g," ")+'"';
 const rows=ev.map(x=>[mm(x.from),mm(x.to),x.beat+" "+x.beatName,x.kind,x.text,x.shot,x.sourceId,x.sourceFrom,x.sourceTo,x.srtTo||"",x.url,x.path,x.sourceId?(data.sources[x.sourceId]?.rights||"UNCONFIRMED"):"SELF_CRAFT",x.evidence]);
 const contents="\uFEFF"+[columns,...rows].map(a=>a.map(csvCell).join(",")).join("\r\n");
 downloadFile(e.id+"-one-to-one-cutlist-v41.csv",contents,"text/csv;charset=utf-8");toast("1:1 타임라인 CSV를 내려받습니다")
}
function downloadText(e){
 let lines=["[국뽕 해외반응 TTS 낭독 대본 V4.1]","제목: "+e.title,"주의: 외국인 원음 후보는 내레이션 TTS에 넣지 않음",""];
 e.beats.forEach((b,i)=>{lines.push("[구간 "+String(i+1).padStart(2,"0")+" · "+b.label+"]",b.text,"");if(b.clips.length){lines.push("[별도 삽입 원음: "+b.clips.map(c=>c.id+" #"+c.n+" "+c.from).join(" | ")+"]","")}});
 downloadFile(e.id+"-narration-v41.txt",lines.join("\n"),"text/plain;charset=utf-8");toast("한국어 내레이션 전용 TXT를 내려받습니다")
}
function toast(x){let t=$("#toast");t.textContent=x;t.style.display="block";setTimeout(()=>{t.style.display="none"},3100)}
async function start(){
 const page=document.body.dataset.page||"index";
 try{const r=await fetch(ROOT+"dataset.json",{cache:"no-cache"});if(!r.ok)throw Error("HTTP "+r.status);data=await r.json();
 if(page==="index"){renderIndex();return}
 ep=data.episodes.find(e=>e.id===page);if(!ep)throw Error("잘못된 대본 페이지");loadSettings(ep);renderEpisode();
 }catch(e){$("#app").innerHTML='<div style="padding:36px"><h1>데이터를 열 수 없습니다</h1><p>'+esc(e.message)+'</p><a href="./dataset.json">원본 JSON 직접 열기</a> · <a href="../index.html">연구 허브</a></div>'}
}
start()
})();
