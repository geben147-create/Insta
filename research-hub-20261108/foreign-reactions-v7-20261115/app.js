
(function(){
'use strict';
var D=window.KR_REACTION_V7;
var root=document.getElementById('app');
if(!D||!root){return;}
var episode=document.body.getAttribute('data-episode')||'all';
var t=D.topics.find(function(x){return x.id===episode;})||null;
var cache={};var speakerIndex=-1;var currentSpeech=null;
var timing=['00:00','00:20','00:40','01:00','01:20','01:40','02:00','02:20','02:40','03:00','03:20','03:40','04:00','04:20','04:40','05:00','05:20','05:40','06:00','06:20','06:40','07:00','07:20','07:40','08:00','08:20','08:40','09:00','09:20','09:40','10:00'];
var cues={
'01':{0:['BV1Y841137Rw',0],3:['BV1dPxE6kE7m',8],4:['BV1dPxE6kE7m',169],5:['BV1dPxE6kE7m',226],6:['BV1XFomYqEZm',65],7:['BV1XFomYqEZm',58],8:['BV1XFomYqEZm',57],14:['BV1Y841137Rw',19],16:['BV1Y841137Rw',0],17:['BV1Y841137Rw',19],18:['BV1Y841137Rw',28],19:['BV1Y841137Rw',33],22:['BV1dPxE6kE7m',289],27:['BV1dPxE6kE7m',337]},
'02':{0:['BILI-123',646],6:['BILI-123',39],7:['BILI-123',45],8:['BILI-123',52],9:['BILI-123',84],10:['BILI-123',102],11:['BILI-123',116],13:['BILI-123',156],14:['BILI-123',240],15:['BILI-123',243],16:['BILI-123',286],17:['BILI-123',328],19:['BILI-123',425],21:['BILI-123',619],22:['BILI-123',548],23:['BILI-123',567],24:['BILI-123',574],27:['BILI-123',646],28:['BILI-123',649]}
};
var shot={
'01':[
'검은 배경, K2 전차 윤곽 자체 그래픽 + 폴란드 군인 인터뷰 확인 컷','중국 비판·폴란드 평가 두 원본 분할 카드','중국·폴란드·공식자료 세 개의 화자 표기','중국 해설 ASR 발언 4초 내외 후보 + 한국어 번역','과거 시험 관련 주장: 빨간 물음표 그래픽','폴란드 수리 논쟁 자료 출처 카드','다른 중국 해설자 소개, 화자명 변경','기술이전·공동생산 자체 키워드 그래픽','계약 요소 카드: 납기 / 생산 / 지원','10월 보도 타임라인, 숫자 단정 금지','수리시설 차량과 운용 불능 차량의 개념 비교','10월 28일 폴란드 군비청 답변 자막 그래픽','독립 검증: 서로 다른 보도 시점 크로스체크','폴란드 국방부 180대 납품 수치','추가 180대 계약 문서·일정','폴란드 인터뷰의 기술지원 관련 부분 확인','폴란드 장교 실제 원어 인용 + 한글 번역','훈련·준비 작업을 설명하는 자체 모션그래픽','폴란드 현지 지형 적합성 설명 원어','승무원 편의성 평가 원어 강조','운용의 3요소: 정비·교육·부품','정부 계약 자료 아이콘 3종','중국 화자의 공급능력 칭찬 원문','폴란드 실제 구매자 입장 도식','계약 이후 유지관리의 중요성','3열 검증표 도입 중국 주장 / 최초 보도 / 후속답변','3열 검증표: 약30·10미만의 다른 집계 기준','실제 사용자 평가와 객관 성능 구분','K2 한국 기술·생산·협력의 자부심 결론','첫 도입 질문 회수, 댓글 토론 문구'
],
'02':[
'검은 배경 실루엣 + 실제 중국 차주 최종 8점 음성 후보','장점·단점 두 컬러 카드','인터뷰 20분 흐름 3막 요약','구매 10일째: 한계 배지','전기차 선택지 속 중국 소비자라는 시점','모델명·트림 표기 재검증 알림','차주의 디자인 호평 원문 후보','길에서도 알아본다는 평가 원문 후보','실내 공간·정숙성 카드','안전 장비 9개라는 차주 주장과 검증 배지','유리 반사 지적 원문, 위험 주장과 분리','차주의 안전 우려 원어 후보','전방 시야 및 글레어 자체 일러스트','급차선 변경 주행 안정감 평가','노면 잔진동 평가 원문','과속방지턱에서 튕김 지적','주행 보조에 대한 조건부 평가','A필러 사각지대 원문, 단정 금지','호평/불만 점수 그래픽 4칸','마감·실링에 대한 중국 차주 호평','초기 사용기와 장기 내구성의 차이','트렁크 공간 활용 대목','스마트폰 앱 불만 원음 후보','원격 응답 지연 불만 원음 후보','앱 기능 부족 불만 원음 후보','실제 평가 장단점 투컬럼 비교','10점 만점 질문, 결론은 아직 홀드','차주의 8점 답변 원음 후보','차주 개인 기준에 대한 해설','한국차 가치 + 중국 차주가 선택한 8점의 의미'
]};
var bgm=['호기심·저음 펄스','조심스러운 분석','긴장·반론','검증·중립','점진적 희망','현장·기대','따뜻한 추진감','분석·회수','감정 상승','잔잔한 마무리'];
var genericSound='우리 내레이션 -14 LUFS 가안 · BGM -28 dB 가안';
function esc(a){return String(a==null?'':a).replace(/[&<>"']/g,function(x){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x];});}
function fmt(ms){var n=Math.max(0,Math.floor(Number(ms||0)/1000));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
function epurl(id){return './ep'+id+'.html';}
function linkID(id){return '../../국뽕해외반응-중국SNS-20261103/script/#'+encodeURIComponent(id);}
function originalURL(id){return /^BV/.test(id)?'https://www.bilibili.com/video/'+encodeURIComponent(id):linkID(id);}
function state(level){return level==='10분 전체 대본'?'good':(level==='자료 보강'?'warn':'');}
function articleSection(id,title,desc){return '<div class="section anchor-offset" id="'+esc(id)+'"><h2>'+title+'</h2>'+(desc?'<p class="muted" style="margin-top:7px">'+desc+'</p>':'');}
function nav(){
var n='<aside class="sidebar" id="side"><div class="sideintro"><div class="sidetag">SOURCE-LINKED · V7</div><div class="sidetitle">🇰🇷 외국인이 본 한국</div><p class="small muted" style="margin-top:6px">10개 새 주제 · 2개 10분 목표 대본 · 실제 자막 1:1</p></div>';
n+='<div class="navlabel">🏠 결과 · 대본 선택</div><a class="sideitem '+(!t?'active':'')+'" href="./index.html">🏆 10개 주제 · 전체 결과</a>';
D.topics.forEach(function(v){n+='<a class="sideitem '+(t&&t.id===v.id?'active':'')+'" href="'+epurl(v.id)+'"><span class="num">'+esc(v.id)+'</span>'+esc(v.title)+'<br><span class="tag">'+esc(v.level)+'</span></a>';});
if(t){n+='<div class="navlabel">📑 이 대본 안쪽 메뉴</div><div class="sidegroup"><a href="#result">📌 결과·핵심 반전</a><a href="#evidence">🗣️ 실제 외국인 반응 원문</a><a href="#outline">🧲 5문장 훅 · 전개</a>';
if(D.scripts[t.id]){n+='<a href="#full">🎙️ 10분 TTS 전체 대본</a><a href="#timeline">🎬 30컷 편집표</a>';}
n+='<a href="#sources">🔗 원본 영상·근거</a><a href="#rights">⚖️ 발행 전 권리·검증</a></div>';}
n+='<div class="navlabel">🔍 원본 · 참고</div><div class="sidegroup"><a href="../../국뽕해외반응-중국SNS-20261103/script/#guide" target="_blank">📋 자막 작업법</a><a href="../../국뽕해외반응-중국SNS-20261103/script/#BILI-114" target="_blank">🗣️ BILI-114 자막 형식 예시</a><a href="../index.html">↩ 통합 연구 허브</a></div></aside>';
return n;}
function topbar(){
return '<div class="topstrip"></div><header class="global"><a class="brand" href="./index.html">🌍 FOREIGN REACTION / 외국인이 평가한 한국</a><div class="global-actions"><a href="../index.html">↩ 통합 연구 허브</a><a href="../../국뽕해외반응-중국SNS-20261103/script/">자막 원본</a><button class="mobile-nav" id="navBtn">☰ 왼쪽 메뉴</button></div></header>';
}
function kpis(topic){return '<div class="kpis"><div class="kpi"><div class="value">'+(topic?'1':'10')+'</div><div class="label">'+(topic?'선택 주제':'신규 아웃라인')+'</div></div><div class="kpi"><div class="value">'+(topic?topic.sources.length:'2')+'</div><div class="label">'+(topic?'참고 원본 수':'10분 목표 대본')+'</div></div><div class="kpi"><div class="value">'+(topic?topic.lines.toLocaleString('ko-KR'):'60')+'</div><div class="label">'+(topic?'원문 자막 행':'20초 컷 수')+'</div></div><div class="kpi"><div class="value">'+(topic?(D.scripts[topic.id]?'10:00':'미작성'):'ASR')+'</div><div class="label">'+(topic?'예정 편집 러닝타임':'자막 검증 상태')+'</div></div></div>';}
function topicCard(x){
return '<a class="topic" href="'+epurl(x.id)+'"><div class="inline"><span class="pill gold">'+esc(x.id)+' · '+esc(x.category)+'</span><span class="pill '+state(x.level)+'">'+esc(x.level)+'</span></div><div class="name">'+esc(x.icon)+' '+esc(x.title)+'</div><div class="desc">'+esc(x.desc)+'</div><div class="metadata"><span>🎞️ '+x.sources.length+'개 원본</span><span>📜 '+x.lines+'행</span><span>🕒 '+x.minutes+'분 자료</span></div><div class="foot"><span>원문·훅·편집 구조 보기</span><span>열기 ›</span></div></a>';}
function home(){
var s='<section class="hero" id="result"><div class="eyebrow">NOV 15, 2026 · SOURCE-BASED PRODUCTION</div><h1>🇰🇷 외국인이 한국을 평가한 순간을<br>10개의 다른 이야기로 엮었습니다</h1><p>주인공은 한국 홍보가 아니라 <strong>실제 외국인의 말·표정·반론·선택</strong>입니다. 자막 1:1 대조, 원본 분초 링크, 10분 대본 두 편과 30컷 편집표를 볼 수 있습니다.</p><div class="byline"><span class="pill good">한국어 해설 음성 60% 이상 설계</span><span class="pill warn">원음 ASR·초벌번역 검수 필요</span><span class="pill">외부 클립 권리 확인 전 발행 금지</span></div>'+kpis(null)+'</section>';
s+=articleSection('priority','🥇 먼저 볼 결과물 두 편','기존 부산·T1 PC방·편의점 등과 다른 주제. 아래를 클릭하면 한 페이지에서 전체 원고와 컷표가 열립니다.')+'<div class="grid2" style="margin-top:13px">'+topicCard(D.topics[0])+topicCard(D.topics[1])+'</div></div>';
s+=articleSection('topics','🎬 신규 주제 10개 · 분야별 목록','기존 자료와 겹치지 않게 방산, 전기·전자, 제조업, 스포츠, 러시아, 정치·사회 중심으로 편성했습니다.')+'<div class="toolbar"><input type="search" id="filter" placeholder="🔎 제목·분야·원본 ID 검색" aria-label="주제 검색"><select id="cat"><option value="all">모든 분야</option><option value="스포츠">스포츠</option><option value="제조">제조·가전</option><option value="한국">사회·외국인 생활</option></select></div><div class="topic-grid" id="topicgrid">';
D.topics.forEach(function(x){s+=topicCard(x);});s+='</div></div>';
s+=articleSection('method','🎞️ 1대본 = 1페이지 = 원문 근거 + 편집 30컷','원본을 영상에 넣는 행위는 별도의 저작권 검토 대상입니다. 현재 파일들은 <strong>출처 연결된 제작 초안</strong>입니다.');
s+='<div class="grid3" style="margin-top:13px"><div class="panel"><h3>🗣️ 실제 외국인 반응</h3><p>원어·한국어 초벌 번역·원본 분초·출처를 원문과 함께 붙입니다.</p></div><div class="panel"><h3>🎙️ 독립적인 한국어 나레이션</h3><p>외국인 발언의 이유를 설명하고 다른 외국인 관점과 교차합니다. 미확인 인용은 만들지 않습니다.</p></div><div class="panel"><h3>🎛️ 20초 × 30컷</h3><p>가안 타임라인, 화면/폰트/SFX/BGM, 실제 원음 인용 가능 지점이 담깁니다.</p></div></div></div>';
s+=articleSection('bench','📚 참고 대본과 편집 벤치마킹','사용자가 제공한 세 개의 기존 연구 링크입니다. 원문을 복제하지 않고 훅·감정선·편집 구조만 참고합니다.')+'<div class="grid3" style="margin-top:13px"><div class="panel"><h3>단골이슈·쓸모왕</h3><a target="_blank" rel="noopener" href="../../단골이슈_쓸모왕_영상편집분석/">편집 공식 원본 열기</a></div><div class="panel"><h3>국뽕 8분30초</h3><a target="_blank" rel="noopener" href="../../국뽕_8분30초_영상분석/">구간·전개 분석 열기</a></div><div class="panel"><h3>글로벌 한국반응</h3><a target="_blank" rel="noopener" href="../../글로벌한국반응_국뽕영상_분석/">해외반응 분석 열기</a></div></div><div class="note">사용자 제공 자막 형식 예시: <a href="../../국뽕해외반응-중국SNS-20261103/script/#BILI-114" target="_blank">BILI-114 (서울 3박4일 영상)</a> · 실제 제작 소재의 근거로 사용한 것이 아닌 표시 형식 참조입니다.</div></div>';
return s;
}
function heading(t){
return '<section class="hero section" id="result"><div class="eyebrow">EP '+t.id+' · '+esc(t.category)+' · FOREIGN-FIRST</div><h1>'+esc(t.icon)+' '+esc(t.title)+'</h1><p>'+esc(t.desc)+'</p><div class="byline"><span class="pill '+state(t.level)+'">'+esc(t.level)+'</span><span class="pill">실제 원본 '+t.sources.length+'개</span><span class="pill">자막 '+t.lines+'행</span><span class="pill warn">자막·영상 수동 재검수 필요</span></div>'+kpis(t)+'</section>';
}
function outline(t){
var s=articleSection('outline','🧲 첫 30초 훅 5문장 · 10분 이야기 구조','첫 5문장을 0:00~0:30에 배치하는 창작 훅입니다. 원본 인물의 직접 대사가 아니라 <strong>우리 작가가 쓴 내레이션</strong>입니다.');
s+='<ol class="hook">';t.hooks.forEach(function(x){s+='<li>'+esc(x)+'</li>';});s+='</ol><h3 style="margin-top:24px">⏱️ 질문 → 답 → 다음 질문 · 전체 전개</h3><div class="beats">';
t.beats.forEach(function(x,i){s+='<div class="beat"><div class="idx">CH '+String(i+1).padStart(2,'0')+'</div>'+esc(x)+'</div>';});s+='</div><div class="note">이 구간은 창작 편집 설계이며 원본 영상의 실제 화자 발화 시간과 구분됩니다. 자극적인 반전도 실제로 확인된 자료 범위 안에서만 사용합니다.</div></div>';
return s;
}
function chart(t){var heights=(t.id==='01'?[3,4,4,5,5,4,3,4,4,5]:[4,4,5,3,4,4,4,5,3,5]);var v='<div class="mood" role="img" aria-label="감정선 편집 목표: 추정된 10단계" title="실측 감정선이 아니라 작가의 의도한 곡선입니다">';heights.forEach(function(h){v+='<span style="height:'+(h*17)+'%"></span>';});v+='</div><div class="moodlabels"><span>00:00 · 시작</span><span>05:00 · 갈등·검증</span><span>10:00 · 회수</span></div>';return v;}
function full(t){
var a=D.scripts[t.id];if(!a){return '';}
var s=articleSection('full','🎙️ 10분 목표 · 한국어 나레이션 전체 원고','대본 전문이 한 페이지에 이어집니다. 낭독을 누르면 기기의 한국어 음성이 읽습니다. 10분은 <strong>편집 설계 목표</strong>이며 실제 녹음/TTS 소요시간은 아직 측정하지 않았습니다.');
s+='<div class="toolbar"><button class="button-main" id="listen">🔊 한국어 음성으로 들어보기</button><button class="button-stop" id="stop">■ 음성 멈추기</button><button id="copy">📋 대본 전체 복사</button><button id="txt">⬇ TTS TXT 저장</button><button id="srt">⬇ 30컷 SRT 가안</button><span class="listenstatus" id="listening" aria-live="polite"></span></div><div class="panel"><div class="inline"><strong>감정선 설계 (실측 아님)</strong><span class="pill">긴장 → 반론 → 근거 → 외국인 직접 평가 → 자긍심</span></div>'+chart(t)+'</div><div id="script-text" style="margin-top:17px">';
a.forEach(function(line,i){s+='<article class="script" id="cut-'+(i+1)+'"><div><div class="time">'+timing[i]+'<br>↓<br>'+timing[i+1]+'</div><div class="number">CUT '+String(i+1).padStart(2,'0')+'</div></div><div><p class="words">'+esc(line)+'</p><div class="intent">✦ '+esc(shot[t.id][i])+' · <a href="#timeline">편집 지시 확인</a></div></div></article>';});
s+='</div><div class="note">원음 후보가 지정된 컷도 사용 허락 전에는 인용 영상/음성을 삽입하지 않습니다. TTS TXT는 나레이션만 포함하며, 원본 중국어·폴란드어 인용문은 아래 검증 카드에서 분리됩니다.</div></div>';
return s;
}
function cueHTML(topic,i){
var cue=(cues[topic.id]||{})[i];if(!cue){return '<span class="muted">자체 그래픽 / 원본 음성 없음</span>';}
var id=cue[0],idx=cue[1],obj=cache[id],line=obj&&obj.lines&&obj.lines[idx],timer=line?fmt(line.s)+'~'+fmt(line.e):'자막 로딩 중';
return '<strong>'+esc(id)+'</strong> · line '+idx+'<br><span class="cyan">'+timer+'</span><br><a href="'+linkID(id)+'" target="_blank" rel="noopener">자막 뷰어</a> · <a href="#evidence">원문 비교</a><br><span class="danger">사용권 미확인</span>';
}
function timeline(t){
if(!D.scripts[t.id]){return '';}
var s=articleSection('timeline','🎬 편집 타임라인 · 20초 × 30컷','왼쪽 시간은 <strong>새로 만들 10분 영상</strong>, 오른쪽 원본 시간은 <strong>다른 영상 안의 실제 자막 시점</strong>입니다. 같은 값이 아닙니다.');
s+='<div class="toolbar"><button id="tsv">⬇ 30컷 TSV 편집표</button><button id="copycut">📋 컷표 전체 복사</button><button onclick="window.print()">🖨️ PDF 인쇄</button></div><div class="tablewrap" id="cuttable">'+cutRows(t)+'</div><div class="note">🎵 BGM 음량·SFX 음량·폰트 픽셀은 편집 가안입니다. 최종 믹싱은 원음·TTS에 따라 달라지며 실제 원본 사용권이 확인되어야 영상을 넣을 수 있습니다.</div></div>';
return s;
}
function sound(i){var s=bgm[Math.min(9,Math.floor(i/3))];return 'BGM '+s+' (-28 dB 가안)'+(i%5===0?'<br>전환 팝 SFX (-18 dB 가안)':'')+'<br>원어 있으면 BGM -34 dB';}
function font(i){return i<3?'Pretendard ExtraBold · 52px<br>흰색/금색 후킹':'Pretendard SemiBold · 44px<br>흰색 + 민트 키워드';}
function cutRows(t){
var lines=D.scripts[t.id],s='<table><thead><tr><th class="th-time">새 영상 시간</th><th class="th-script">한국어 대본 · 나레이션</th><th class="th-edit">화면 컷 · 글씨</th><th>효과음 / 배경음</th><th class="th-ref">원본 출처 · 실제 위치</th></tr></thead><tbody>';
lines.forEach(function(line,i){s+='<tr><td class="th-time"><strong class="gold">'+timing[i]+'</strong><br>'+timing[i+1]+'<br><small>CUT '+String(i+1).padStart(2,'0')+'</small></td><td>'+esc(line)+'</td><td><strong class="mint">'+esc(shot[t.id][i])+'</strong><br><small>'+font(i)+'</small></td><td>'+sound(i)+'</td><td>'+cueHTML(t,i)+'</td></tr>';});
return s+'</tbody></table>';
}
function evidence(t){
var s=articleSection('evidence','🗣️ 외국인 원문 · 실제 발언과 타임코드','자막 추출본의 언어·번역·라인 번호·시각을 직접 대조합니다. <strong>자동 인식된 외국어가 실제 음성 그대로인지 아직 수동으로 확정하지 않았습니다.</strong>');
s+='<div class="note">검증 표시: 🟡 ASR 자동 인식 / 🟡 한국어 초벌 번역 / 🔴 원본 영상 발화·화자·저작권 재검토 필요</div><div id="evidenceCards"><p class="muted">🔎 연결된 GitHub 원문 파일을 여는 중...</p></div></div>';
return s;
}
function sources(t){
var s=articleSection('sources','🔗 실제 원본 영상·공식 자료','중국 Bilibili 식별자(BV...)는 원본 페이지로도 연결됩니다. BILI-, XHS-, RU- 등 내부 ID는 연구용 자막 뷰어로 이동합니다.');
s+='<div class="grid2" style="margin-top:13px">';
t.sources.forEach(function(id){s+='<div class="panel"><h3>🎞️ '+esc(id)+'</h3><p class="sub">GitHub에 수집·기록된 원본의 자막 인덱스입니다.</p><div class="inline"><a class="mini-link" href="'+linkID(id)+'" target="_blank" rel="noopener">자막 전문·원본 시각</a>'+(id.indexOf('BV')===0?'<a class="mini-link" href="'+originalURL(id)+'" target="_blank" rel="noopener">원본 Bilibili 열기</a>':'')+'</div><p class="small danger">원본 영상 파일은 사용자 로컬 디스크에 보관. GitHub 자막 저장과 영상 사용 허락은 별개입니다.</p></div>';});
s+='</div>';
if(t.id==='01'){
s+='<h3 style="margin-top:20px">폴란드 공식·교차검증 자료</h3><div class="grid2" style="margin-top:12px">';
D.official.forEach(function(x){s+='<div class="panel"><h3>'+esc(x.label)+'</h3><p class="sub">'+esc(x.when)+'</p><a class="mini-link" href="'+esc(x.url)+'" target="_blank" rel="noopener">독립 확인 원문 보기</a></div>';});s+='</div>';}
s+='</div>';
return s;
}
function rights(t){
var s=articleSection('rights','⚖️ 제작·발행 전 검증 체크리스트','수익화·저작권 판정은 영상 길이 또는 내레이션 비율만으로 결정되지 않습니다.');
s+='<div class="grid2" style="margin-top:13px"><div class="panel"><h3 class="gold">🔴 현재: 출판 전 초안</h3><p>'+esc(t.caveat)+'</p><p class="small danger">원본 영상 사용 허락, 오디오·제삼자 영상·음악 권리 및 실제 발화 재검수 필요.</p></div><div class="panel"><h3>✅ 실제 제작 전 점검</h3><p>① 원어 ASR·번역을 원본 음성과 일치시키기<br>② 외국인 발언을 시각·문맥·화자와 일대일 매칭<br>③ 원본 영상·인터뷰·음악·초상 사용 허락<br>④ 폴란드 수치·전기차 사양 등 교차검증<br>⑤ TTS 실제 낭독시간 측정 후 컷 길이 재조정<br>⑥ 원본의 발언을 합성·왜곡하지 않았는지 검토</p></div></div>';
if(!D.scripts[t.id]){s+='<p class="note">이 주제는 현재 아웃라인 단계입니다. 10분 완성 나레이션·30컷 편집표는 아직 작성되지 않았습니다.</p>';}
s+='</div>';return s;
}
function epPage(t){return heading(t)+evidence(t)+outline(t)+full(t)+timeline(t)+sources(t)+rights(t);}
function footer(){return '<footer class="footer">🇰🇷 외국인의 한국 평가 · 원문 우선 제작판 | 2026-11-15 | <a href="../index.html">통합 연구 허브</a> | <a href="../../국뽕해외반응-중국SNS-20261103/script/#guide">자막 검수 가이드</a><br>원본 로컬 저장 정보, AI 번역, 주장, 공식 검증, 작가 내레이션은 각각 독립 출처와 역할을 갖습니다. 수록은 출판 허가를 의미하지 않습니다.</footer>';}
function render(){
root.innerHTML=topbar()+'<div class="layout">'+nav()+'<main class="main">'+(t?epPage(t):home())+footer()+'</main></div>';
var btn=document.getElementById('navBtn');if(btn){btn.addEventListener('click',function(){document.body.classList.toggle('navopen');});}
if(t){loadEvidence(t); if(D.scripts[t.id]){events(t);}}
else{
var f=document.getElementById('filter'),cat=document.getElementById('cat');
var apply=function(){var word=f.value.trim().toLowerCase(),ca=cat.value,found=D.topics.filter(function(x){return (ca==='all'||(ca==='스포츠'&&x.category.indexOf('스포츠')>=0)||(ca==='제조'&&/가전|제조|전기|자동차/.test(x.category))||(ca==='한국'&&/사회|러시아/.test(x.category)))&&(!word||(x.title+' '+x.desc+' '+x.sources.join(' ')+' '+x.category).toLowerCase().indexOf(word)>=0);});var box=document.getElementById('topicgrid');box.innerHTML=found.length?found.map(topicCard).join(''):'<p>검색 조건에 맞는 주제가 없습니다.</p>';};f.addEventListener('input',apply);cat.addEventListener('change',apply);}
}
function evidenceCards(t){
var out='',pending=false;
t.quotes.forEach(function(group){var id=group[0],idxs=group[1],o=cache[id];
out+='<div class="panel" style="margin-top:13px"><div class="inline"><strong class="gold">'+esc(id)+'</strong><span class="pill">'+esc(o?o.title:'원문 대기')+'</span><a class="mini-link" href="'+linkID(id)+'" target="_blank" rel="noopener">자막 전문</a>';
if(id.indexOf('BV')===0){out+='<a class="mini-link" href="'+originalURL(id)+'" target="_blank" rel="noopener">Bilibili</a>';}
out+='</div>';
if(!o){pending=true;out+='<p class="muted">해당 자막을 불러오지 못했습니다. 원본 자막 뷰어에서 확인하세요.</p>';}
else{
out+='<p class="sub">분석 메모: '+esc(o.verdict||'평가 초안')+'</p>';
idxs.forEach(function(idx){var line=o.lines&&o.lines[idx];if(!line){return;}var word=(line.t==='good'?'🟢 긍정':line.t==='bad'?'🔴 비판':line.t==='compare'?'🟣 비교':'🟡 자동 인식');
out+='<div class="quote"><div class="source">원본 '+fmt(line.s)+' ~ '+fmt(line.e)+' · 라인 '+idx+' · '+word+'</div><p class="orig">'+esc(line.zh)+'</p><p class="trans">🇰🇷 '+esc(line.ko||'번역 미확인')+'</p><p class="state">기계 음성인식·초벌 번역. 영상 원음 대조 및 사용권 확인 전까지 확정 인용 아님.</p></div>';});
}
out+='</div>';
});
return out+(pending?'<div class="note">일부 원문 요청이 실패했습니다. 화면에서 원본 자막 뷰어 링크로 접속해 검수하세요.</div>':'');
}
function loadEvidence(t){
var ids=t.sources.slice();
Promise.all(ids.map(function(id){return fetch('../../국뽕해외반응-중국SNS-20261103/script/data/'+encodeURIComponent(id)+'.json').then(function(r){if(!r.ok){throw new Error('HTTP '+r.status);}return r.json();}).then(function(data){cache[id]=data;}).catch(function(){cache[id]=null;});})).then(function(){
var el=document.getElementById('evidenceCards');if(el){el.innerHTML=evidenceCards(t);}
if(D.scripts[t.id]){var td=document.getElementById('cuttable');if(td){td.innerHTML=cutRows(t);}}
});
}
function sayStatus(s){var el=document.getElementById('listening');if(el){el.textContent=s;}}
function stopVoice(){speakerIndex=-1;if('speechSynthesis' in window){window.speechSynthesis.cancel();}sayStatus('음성 중지');}
function speakNext(t){if(speakerIndex<0){return;}var a=D.scripts[t.id];if(speakerIndex>=a.length){sayStatus('전문 읽기 완료');speakerIndex=-1;return;}
var idx=speakerIndex,v=new SpeechSynthesisUtterance(a[idx]);v.lang='ko-KR';v.rate=.95;v.pitch=1;v.onend=function(){if(speakerIndex===idx){speakerIndex++;speakNext(t);}};v.onerror=function(){sayStatus('음성 기능 오류 · 텍스트 복사는 가능');speakerIndex=-1;};currentSpeech=v;sayStatus('읽는 중: 컷 '+(idx+1)+' / '+a.length);window.speechSynthesis.speak(v);}
function download(name,text,type){var blob=new Blob([text],{type:type||'text/plain;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},2000);}
function scriptText(t){return D.scripts[t.id].join('\n\n');}
function srtTime(seconds){var ms=Math.max(0,Math.round(seconds*1000)),h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),f=ms%1000;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+','+String(f).padStart(3,'0');}
function captionChunks(text){var words=String(text).trim().split(/\s+/),out=[],one='';words.forEach(function(word){if(one && (one.length+word.length+1)>42){out.push(one);one=word;}else{one+=(one?' ':'')+word;}});if(one){out.push(one);}return out.map(function(piece){if(piece.length<=23){return piece;}var words=piece.split(/\s+/),a='',b='';words.forEach(function(word){if(!b && (a.length+word.length+1)<=22){a+=(a?' ':'')+word;}else{b+=(b?' ':'')+word;}});return b?a+'\n'+b:a;});}
function toSRT(t){var count=0,rows=[];D.scripts[t.id].forEach(function(line,i){var chunks=captionChunks(line),seconds=20/chunks.length;chunks.forEach(function(c,j){rows.push(String(++count)+'\n'+srtTime(i*20+j*seconds)+' --> '+srtTime(i*20+(j+1)*seconds)+'\n'+c+'\n');});});return rows.join('\n');}
function toTSV(t){var rows=[['편집_컷','새영상_시작','새영상_끝','우리_나레이션','영상_화면_지시','폰트','배경음_효과','원본_ID','원본_시작','원본_끝','원문_인용','초벌번역','권리검증상태'].join('\t')];D.scripts[t.id].forEach(function(line,i){var cue=(cues[t.id]||{})[i],obj=cue&&cache[cue[0]],ln=obj&&obj.lines&&obj.lines[cue[1]],fields=[i+1,timing[i],timing[i+1],line,shot[t.id][i],i<3?'Pretendard ExtraBold 52px White/Gold':'Pretendard SemiBold 44px White/Mint',bgm[Math.floor(i/3)]+' BGM -28dB(가안)',cue?cue[0]:'자체',ln?fmt(ln.s):'',ln?fmt(ln.e):'',ln?ln.zh:'',ln?ln.ko:'','미확인'];rows.push(fields.map(function(x){return String(x==null?'':x).replace(/[\t\n\r]+/g,' ');}).join('\t'));});return rows.join('\n');}
function copy(text){if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(text).catch(function(){fallbackCopy(text);});}fallbackCopy(text);return Promise.resolve();}
function fallbackCopy(text){var x=document.createElement('textarea');x.value=text;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove();}
function events(t){
document.getElementById('listen').addEventListener('click',function(){if(!('speechSynthesis' in window)){sayStatus('이 브라우저는 음성 읽기를 지원하지 않습니다.');return;}stopVoice();speakerIndex=0;speakNext(t);});
document.getElementById('stop').addEventListener('click',stopVoice);
document.getElementById('copy').addEventListener('click',function(){copy(scriptText(t)).then(function(){sayStatus('대본 전문 복사됨');});});
document.getElementById('txt').addEventListener('click',function(){download('EP'+t.id+'-narration-TTS.txt',scriptText(t));});
document.getElementById('srt').addEventListener('click',function(){download('EP'+t.id+'-draft-subtitles.srt',toSRT(t));});
document.getElementById('tsv').addEventListener('click',function(){download('EP'+t.id+'-30cuts-edit.tsv',toTSV(t),'text/tab-separated-values;charset=utf-8');});
document.getElementById('copycut').addEventListener('click',function(){copy(toTSV(t)).then(function(){sayStatus('30컷 편집표 복사됨');});});
window.addEventListener('beforeunload',stopVoice);
}
render();
})();