
(function(){
'use strict';
const root=document.getElementById('app');
const epID=document.body.dataset.episode || '02';
const D=window['FRV8_EP'+epID];
const BASE='../foreign-reactions-v7-20261115/ep01.html';
const HUB='../index.html';
const V7='../foreign-reactions-v7-20261115/index.html';
const ALL=[
['01','🛡️ K2 전차','기존 V7 유지'],
['02','🚘 현대 전기차 8점','새 원고'],
['03','🔌 한국 가전 OEM','새 원고'],
['04','🏭 제조업 공장 체험','새 원고'],
['05','🗳️ 한국 사회·외신','새 원고'],
['06','🇷🇺 러시아인의 한국','새 원고'],
['07','⚽ 박지성 중국 해설','새 원고'],
['08','🏟️ 손흥민 중국 평론','새 원고'],
['09','🏹 한국 양궁 10연패','새 원고'],
['10','🚴 중국 라이더 서울','새 원고']
];
if(!root||!D){if(root)root.textContent='원고 데이터를 불러오지 못했습니다. 새로고침해주세요.';return;}
const CUTS=D.acts.flatMap((act,i)=>act.paras.map((line,j)=>({line,i,j,act,idx:i*4+j})));
const FULL=D.hook5.concat(CUTS.map(c=>c.line));
const ACT_TONE=["P","C","E","G","C","E","G","P"];
const COLORS={P:{label:"자긍심",css:"g",short:"자긍"},C:{label:"갈등·억울함",css:"c",short:"갈등"},E:{label:"근거·반전",css:"e",short:"근거"},G:{label:"외국인 호평",css:"g",short:"호평"},Q:{label:"질문·궁금증",css:"q",short:"질문"}};
const mood={"02":[4,3,5,4,5,4,5,5],"03":[3,4,4,5,3,5,5,5],"04":[4,3,4,3,5,5,4,5],"05":[3,4,4,5,4,5,5,5],"06":[5,4,5,3,5,5,4,5],"07":[4,3,5,3,5,5,5,5],"08":[5,3,4,3,5,4,5,5],"09":[5,4,5,5,5,5,5,5],"10":[4,3,4,5,3,5,4,5]}[epID]||[4,3,4,3,5,4,5,5];
const evidenceCache={};
const editableKey='frv8-edits-'+epID, checkKey='frv8-check-'+epID, settingsKey='frv8-settings-'+epID;
function storeRead(k){try{return JSON.parse(localStorage.getItem(k)||'{}');}catch(_){return {};}}
let edits=storeRead(editableKey),checked=storeRead(checkKey),settings=Object.assign({clipN:14,clipSeconds:4,cpm:260,view:{q:true,c:true,e:true,g:true}},storeRead(settingsKey));
const q=n=>String(n==null?'':n);
function esc(a){return q(a).replace(/[&<>"']/g,s=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[s]));}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}}
function fmt(seconds,ms=false){seconds=Math.max(0,Number(seconds)||0);const h=Math.floor(seconds/3600),m=Math.floor(seconds%3600/60),s=Math.floor(seconds%60);const frac=Math.round((seconds%1)*1000);return (h?String(h).padStart(2,'0')+':':'')+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0')+(ms?','+String(frac).padStart(3,'0'):'');}
function fullSRTTime(seconds){let ms=Math.round(seconds*1000);let h=Math.floor(ms/3600000),m=Math.floor(ms%3600000/60000),s=Math.floor(ms%60000/1000),f=ms%1000;return [h,m,s].map(x=>String(x).padStart(2,'0')).join(':')+','+String(f).padStart(3,'0');}
function tStart(i){return 30+i*570/32;}function tEnd(i){return 30+(i+1)*570/32;}
function epUrl(id){return id==='01'?BASE:'./ep'+id+'.html';}
function origViewer(id){return '../../국뽕해외반응-중국SNS-20261103/script/#'+encodeURIComponent(id);}
function origSource(id){return /^BV/.test(id)?'https://www.bilibili.com/video/'+encodeURIComponent(id):origViewer(id);}
function audioText(){return D.hook5.concat(CUTS.map(c=>edits[c.idx]??c.line)).join('\n\n');}
function cleanNarrative(text){return q(text).replace(/\s+/g,' ');}
function statusChip(status){let t={ok:'적용',warn:'보완',fail:'미적용',man:'직접 확인'};return '<span class="status '+status+'">'+t[status]+'</span>';}
function nav(){
let s='<aside class="sidenav" id="sidenav"><div class="sidehero"><small style="color:#ffe1aa;font-weight:900">V8 · 외국인 진짜 반응 중심</small><strong>🇰🇷 대본 · 영상 · 검수판</strong><div class="mut tiny" style="margin-top:5px">기존 1편은 유지 · 2~10편 새 원고</div></div>';
s+='<div class="sidehead">🏠 전체 작업판</div><a class="navitem" href="./index.html">🏆 전체 10편 · 수정 결과</a><a class="navitem" href="'+HUB+'">↩ 기존 통합 연구 허브</a><div class="sidehead">📜 한 페이지당 한 대본</div>';
ALL.forEach(x=>s+='<a class="navitem '+(x[0]===epID?'active':'')+'" href="'+epUrl(x[0])+'"><b>'+x[0]+'</b>'+esc(x[1])+'<br><small class="mut">'+esc(x[2])+'</small></a>');
s+='<div class="sidehead">📌 이 페이지 하위 메뉴</div><div class="subnav"><a href="#hooks">🎯 훅 5문장</a><a href="#manuscript">🖍️ 형광펜 대본 1:1</a><a href="#checker">✅ V4 검수표</a><a href="#editing">🎬 원본 IN/OUT 편집표</a><a href="#visuals">🪟 투명 그래프·댓글 미리보기</a><a href="#evidence">🗣️ 실제 외국인 원문</a><a href="#official">🌍 해외언론·공식 출처</a></div></aside>';
return s;
}
function statCard(value,label){return '<div class="metric"><div class="v">'+value+'</div><div class="t">'+label+'</div></div>';}
function metrics(){
return '<div class="metrics" id="stats">'+statCard(D.acts.length,'8단 전개')+statCard(CUTS.length,'1:1 문단·편집컷')+statCard(D.sourceIds.length,'외국인 원본 수')+statCard(D.acts.reduce((n,a)=>n+a.paras.join('').length,0).toLocaleString('ko-KR'),'본문 글자 수')+statCard('10:00','목표 편집 길이')+'</div>';
}
function gradC(color){return color==='C'?'#eb887f':color==='E'?'#81bde0':color==='G'?'#93d18c':'#f4cc90';}
function emotionGraph(){
const bar=D.acts.map((a,i)=>'<div style="background:'+gradC(a.color)+'" title="'+esc(a.title)+'"><span>'+String(i+1).padStart(2,'0')+'</span></div>').join('');
const values=mood.map((x,i)=>'<div class="bar" style="height:'+(18+x*15)+'%" title="'+esc(D.acts[i].title)+'">'+x+'</div>').join('');
return '<div class="box"><h3>📊 8단계 감정선 · 작가 설계값 (실측 아님)</h3><div class="timeline-bar">'+bar+'</div><div class="tone"><span>결과 선공개</span><span>억울함 · 재반전</span><span>해외 근거</span><span>자긍심 회수</span></div><div class="emotion">'+values+'</div><div class="emotionlabels">'+D.acts.map((a,i)=>'<span title="'+esc(a.title)+'">'+String(i+1).padStart(2,'0')+'</span>').join('')+'</div><p class="mini">GPT S03 결과→배경→장애→갈등→실험→반전→증명→회수 / DNA S03 갈등 역전 · GPT S08 두 개의 파동을 회차별로 혼합했습니다.</p></div>';
}
function hookList(){return '<section class="box section" id="hooks"><div class="progress"><h2>🧲 도입 30초 · 훅 5문장</h2><span class="chip y">5문장 분리</span></div><p class="mini">실제 외국인 원음은 사용권 확인 시 첫 4초에 우선 배치. 아래 문장은 작가의 창작 내레이션입니다.</p><ol class="hooklist">'+D.hook5.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ol><p class="mini">실제 TTS 낭독 길이와 도입 원음 길이에 맞춰 0~30초 타이밍을 다시 조정합니다.</p></section>';}
function highlight(text,color){
let s=esc(text);const marks=COLORS[color]?.css||'e';
const pieces=q(text).split(/(?<=[.!?。])\s+/);let fragment=pieces.length?pieces[0]:text;if(fragment.length>64)fragment=fragment.slice(0,64).replace(/\s+\S*$/,'');
if(fragment&&s.includes(esc(fragment))){s=s.replace(esc(fragment),'<mark class="'+marks+'">'+esc(fragment)+'</mark>');}
return s;
}
function proofSource(c){return c.act.source;}
function evidenceBadge(c){const id=c.act.source,idx=c.act.line,obj=evidenceCache[id],line=obj?.lines?.[idx];let s='<a class="sourcechip" href="'+origViewer(id)+'" target="_blank" rel="noopener">'+esc(id)+' · 원문 후보 #'+idx+'</a>';
if(line){s+='<span class="sourcechip">'+fmt((line.s||0)/1000)+' ~ '+fmt((line.e||0)/1000)+' (원본시간)</span>';}
else{s+='<span class="sourcechip warn">자막 로딩 중 또는 조회 실패</span>';}
return s;}
function sourceLine(c){let o=evidenceCache[c.act.source],line=o?.lines?.[c.act.line];return line?'<div class="proofline"><span class="key">원문 인용 후보</span> '+esc((line.ko||'').slice(0,100))+' <span class="mut">(ASR 번역, 직접 검수 필요)</span></div>':'<div class="proofline">원문 자막 위치를 확인 중입니다. 영상 음성·장면까지의 수동 검수 전 단계입니다.</div>';}
function paragraph(c){
let color=c.act.color,type=COLORS[color]||COLORS.E,cls=type.css,n=c.idx+1,text=edits[c.idx]??c.line;
return '<article class="para" id="p'+n+'" data-color="'+cls+'"><div class="parahead"><span class="l"><span class="pidx">'+String(n).padStart(2,'0')+'</span><span class="ptime">'+fmt(tStart(c.idx))+' ~ '+fmt(tEnd(c.idx))+'</span><span class="tag '+cls+'">'+esc(type.label)+'</span><span class="tag e">'+esc(c.act.arc)+'</span></span><button class="editbtn" data-index="'+c.idx+'" title="이 문단 수정">✎ 수정</button></div><div class="text" id="txt'+n+'">'+highlight(text,color)+'</div><div>'+evidenceBadge(c)+'</div>'+sourceLine(c)+'</article>';
}
function desk(){
return '<section class="section" id="manuscript"><h2>🖍️ 실제 1:1 대본 · 오른쪽 V4 검수판</h2><div class="doc-toolbar"><label class="q"><input type="checkbox" data-filter="q" checked> 🟡 질문</label><label class="c"><input type="checkbox" data-filter="c" checked> 🔴 갈등</label><label class="e"><input type="checkbox" data-filter="e" checked> 🔵 근거</label><label class="g"><input type="checkbox" data-filter="g" checked> 🟢 호평</label><button id="expand">☑ 전체 보이기</button><button id="onlykey">⭐ 갈등·증거만</button><button id="copyall">📋 전체 대본 복사</button><button id="tts">⬇ TTS TXT</button><button id="srt">⬇ SRT 가안</button></div><div class="editor"><div class="doc" id="doc">'+D.acts.map((a,i)=>'<div class="segment"><div class="title"><span>ACT '+(i+1)+' · '+esc(a.title)+'</span><span class="chip">'+esc(a.arc)+'</span></div><div class="body">'+esc(['결과 선공개','배경','첫 발견','갈등·장애','작은 반전','큰 반전·해외 근거','증명','자긍심 회수'][i])+' · 감정 '+mood[i]+'/5 · 목표 약 1분11초</div></div>'+CUTS.filter(c=>c.i===i).map(paragraph).join('')).join('')+'</div><aside class="audit" id="checker"><div class="audithead"><div><strong>✅ V4.0 체크리스트 대조</strong><small>왼쪽 문단 ↔ 오른쪽 검수 항목</small></div><span class="chip">1:1</span></div><div id="checkstat" class="qa-pills"></div><div id="auditList"></div></aside></div></section>';
}
function appHeader(){
return '<header class="header"><a class="brand" href="./index.html">SEMANTIC JUDGE · V8 · 🌍 해외반응 1:1 검수판</a><nav class="headerlinks"><a href="./index.html">10편 대시보드</a><a href="'+BASE+'">01편 V7 유지</a><a href="'+HUB+'">연구 허브</a><button class="mobile-menu" id="mobilemenu">☰ 메뉴</button></nav></header>';
}
function audioPanel(){return '<div class="box section" id="calc"><h2>🎧 4초 외국인 클립 · 내레이션 비율 계산</h2><p class="mini">실제 TTS 길이는 아직 측정하지 않았습니다. 분당 글자 수와 원어 클립 개수를 바꾸면 기획상 예상치만 계산합니다. 60% 비율은 목표이며 저작권 안전 기준은 아닙니다.</p><div class="btnbar"><label>원어 클립 개수 <input id="clipN" type="number" min="0" max="200" value="'+settings.clipN+'"></label><label>1개 길이(초) <input id="clipSeconds" type="number" min="1" max="60" value="'+settings.clipSeconds+'"></label><label>분당 글자 <input id="cpm" type="number" min="100" max="650" value="'+settings.cpm+'"></label><button class="primary" id="speak">🔊 브라우저로 대본 듣기</button><button class="rose" id="stop">■ 중지</button></div><div id="audioResult" class="chips"></div></div>';}
function escapeAttr(s){return esc(s);}
function clipShot(c){const first=c.j===0;let type=c.act.color;
if(c.idx===0)return '외국인 실제 반응 원본 후보 콜드오픈 + 반투명 흰색 숫자 그래프①';
if(c.i===5&&c.j===0)return '움직이는 원본 배경 + 반투명 흰색 비교 그래프②';
if(c.i===3&&c.j===0||c.i===6&&c.j===1)return '어두운 실제 영상 배경 + 재구성 댓글 말풍선 (연출표시)';
if(first)return '실제 외국어 원문 4초 후보 + 원어/한국어 자막 분리';
if(c.j===1)return '자료 출처·날짜 2줄 · 자체 손글씨 밑줄 애니메이션';
if(c.j===2)return '외국어 영상/허가받은 B-roll 연속 재생 · 키워드 한 줄';
return '카메라 105% 느린 줌 · 다음 감정 장면으로 오디오 J컷';}
function soundtrack(c){if(c.i===0)return '기대감 저음 펄스 -28dB, 원음 시작 시 -34dB';if(c.act.color==='C')return '갈등 낮은 베이스 -30dB, 핵심 문장에 0.3초 정적';if(c.i===5)return '반전 상승 패드 -28dB + 리버스 스웰 짧게';if(c.i===7)return '따뜻한 피아노/현악 -29dB, 엔딩 페이드';return '차분한 다큐 배경음 -29dB, 대사 우선';}
function captions(c){return c.idx<2?'Black Han Sans 48px, 흰색/핑크 숫자':'Pretendard SemiBold 42px, 흰색+노랑/민트 강조';}
function smallSource(c){const v=evidenceCache[c.act.source]?.lines?.[c.act.line];return '<a href="'+origViewer(c.act.source)+'" target="_blank">'+esc(c.act.source)+'</a> #'+c.act.line+(v?'<br>원본 '+fmt(v.s/1000)+' ~ '+fmt(v.e/1000):'<br>분초 로딩 중');}
function editTable(){
return '<div class="tablewrap" id="editwrap"><table><thead><tr><th>새 영상 시간</th><th>우리 나레이션</th><th>영상 화면·폰트</th><th>실제 원본·분초</th><th>BGM·효과음</th><th>검증</th></tr></thead><tbody>'+CUTS.map(c=>'<tr><td class="nowrap"><strong class="key">CUT '+String(c.idx+1).padStart(2,'0')+'</strong><br>'+fmt(tStart(c.idx))+'–'+fmt(tEnd(c.idx))+'</td><td>'+esc(edits[c.idx]??c.line)+'</td><td><span class="mint">'+esc(clipShot(c))+'</span><br><small>'+captions(c)+'</small></td><td>'+smallSource(c)+'</td><td>'+soundtrack(c)+'</td><td><span class="status man">실제 원음·권리 대조</span></td></tr>').join('')+'</tbody></table></div>';
}
function editing(){
return '<section class="box section" id="editing"><h2>🎬 10분 편집표 · 새 영상 IN/OUT + 원본 IN/OUT</h2><p class="mini">본편 0:00~0:30은 다섯 문장 훅. 본문 32컷은 0:30~10:00 배치 가안입니다. 실제 원음·TTS 속도에 따라 수정하세요.</p><div class="btnbar"><button id="csv">⬇ 1:1 검수·편집 TSV</button><button id="json">⬇ 컷 타임라인 JSON</button><button id="print">🖨️ 프린트/PDF</button></div>'+editTable()+'<p class="mini">외부 영상 3~4초 삽입은 자동 저작권 면책이 아닙니다. 사용권을 확인한 원본으로 편집하세요.</p></section>';
}
function chartBox(c){
let chart='';
if(c.type==='score'){chart='<div class="score">'+esc(c.label)+'</div><div class="scribble"></div>';}
else if(c.type==='bars'){chart=c.labels.map((l,i)=>'<div class="minibar"><span>'+esc(l)+'</span><i style="width:'+Math.min(100,Math.max(0,Number(c.values?.[i]||0)*9))+'%"></i></div>').join('')+'<div class="scribble"></div>';}
else {chart='<div class="steps">'+(c.label||'').split('→').map(x=>'<em>'+esc(x.trim())+'</em>').join('<em>→</em>')+'</div><div class="scribble"></div>';}
return '<div class="visualpaper"><h3>'+esc(c.title)+'</h3>'+chart+'<div class="note">'+esc(c.note)+'</div></div>';
}
function visuals(){
return '<section class="box section" id="visuals"><h2>🪟 첨부 이미지 스타일 · 영상 위 반투명 그래프와 댓글</h2><p class="mini">원본은 계속 움직이고, 그 위에 흰색 반투명 데이터 카드 2회만 배치합니다. 배경 MP4를 선택하면 이 브라우저에서만 미리보기에 사용되며 서버로 업로드하지 않습니다.</p><div class="btnbar"><label>🎞️ 배경 MP4 선택 <input type="file" accept="video/*" id="backgroundVideo"></label><button id="unloadVideo">선택 취소</button></div><div class="previewgrid"><div class="videostage" id="chartPreview"><video id="back1" muted autoplay loop playsinline></video><div class="vlogo">GRAPHIC 01</div>'+chartBox(D.chart1)+'<div class="disclosure">원본 반응 영상 위 정보 그래픽 · 수치 출처 표기</div></div><div class="videostage" id="chartPreview2"><video id="back2" muted autoplay loop playsinline></video><div class="vlogo">GRAPHIC 02</div>'+chartBox(D.chart2)+'<div class="disclosure">자료별 측정값/편집 강조값 반드시 구분</div></div><div class="videostage"><video id="back3" muted autoplay loop playsinline></video><div class="vlogo">COMMENTS · 연출</div><div class="comment-overlay">'+D.comments.map((x,i)=>'<div class="commentbubble"><span class="emoji">'+(i?'😐':'🤔')+'</span>'+esc(x.replace('(재구성 질문) ',''))+'</div>').join('')+'</div><div class="disclosure">✍️ 재구성 댓글 · 실제 게시 댓글 아님</div></div><div class="box"><h3>🎛️ 전 편 공통 편집 규칙</h3><div class="guideline" style="margin-top:10px"><div><h4>그래프 ① 처음 0~30초</h4><p>반투명 흰색 카드 한 번. 차주 8점, 양궁 10연패, 개인 발언의 숫자 등 실제 자료만 크게 강조</p></div><div><h4>그래프 ② 후반 반전</h4><p>5~7분 부근 한 번. 비교·검증 숫자를 움직이는 원본 위에 얹기. 출처·시각 하단 기재</p></div><div><h4>댓글 말풍선</h4><p>사진처럼 좌상단과 우하단 교차 배치. 실제 발언에는 원문 인용 라벨, 각색엔 재구성 라벨</p></div><div><h4>폰트·효과음</h4><p>오프닝 검은한산스 48px, 본문 Pretendard 42px. SFX -18dB 가안, 음악은 음성 아래</p></div><div><h4>영상 배경</h4><p>클립 저작권 확인 뒤 실제 원본 사용. 차분한 105% 팬/줌, 표정·시선·제품 중심</p></div><div><h4>원어 한중 자막</h4><p>원어 최대 1줄과 한국어 번역 1줄. 화자 바뀌면 반드시 색상·출처 라벨 분리</p></div></div></div></div></section>';
}
function evidence(){
return '<section class="box section" id="evidence"><h2>🗣️ 외국인의 실제 발언 원문 후보</h2><p class="mini">GitHub에 저장된 ASR 원문 및 한국어 초벌 번역입니다. 원본 동영상 소리, 화자 및 표정과 최종 일치 여부는 별도 수동 검증이 필요합니다.</p><div id="evidenceResults">원본 자막 데이터를 조회하는 중입니다.</div></section>';
}
function official(){
return '<section class="box section" id="official"><h2>🌍 해외 언론·공식 기록 · 편집 영상 클립 출처</h2><p class="mini">자료별 날짜·발언자·원래 맥락을 확인한 뒤 사용할 수 있습니다. 언론 스크린샷이나 방송 영상을 내려받아 편집하려면 별도 권리 확인이 필요합니다.</p>'+D.official.map(o=>'<div class="sourcecard"><div class="srcname">'+esc(o.label)+'</div><p>'+esc(o.note)+'</p><a href="'+esc(o.url)+'" target="_blank" rel="noopener">공식 원문/기사 열기</a></div>').join('')+'<div class="sourcecard"><div class="srcname">🗂️ GitHub 원본 자막·영상 목록</div>'+D.sourceIds.map(id=>'<a class="sourcechip" href="'+origViewer(id)+'" target="_blank">'+esc(id)+' 자막 전문</a> <a class="sourcechip" href="'+origSource(id)+'" target="_blank">영상 출처</a>').join('')+'</div></section>';
}
function render(){
root.innerHTML=appHeader()+'<div class="layout">'+nav()+'<main class="main"><section class="hero" id="intro"><div class="eyebrow">FOREIGN FIRST / EP '+epID+' / NEW 8-ARC STORY</div><h1>🇰🇷 '+esc(D.title)+'</h1><p>'+esc(D.kicker)+'</p><div class="chips"><span class="chip g">외국인 실제 반응 우선</span><span class="chip y">질문보다 감정선</span><span class="chip b">해외 자료 1:1 근거</span><span class="chip r">각색 댓글 별도 표시</span><span class="chip">원본 1편 V7 유지</span></div></section>'+metrics()+emotionGraph()+hookList()+desk()+audioPanel()+editing()+visuals()+evidence()+official()+'<footer class="site-footer">V8 · 외국인 실제 한국 평가 중심 | 2026-11-15 | 저작권·원음·외국 언론 자료 검수 후 게시 | <a href="'+HUB+'">통합 연구 허브</a></footer></main></div>';
 document.getElementById('mobilemenu')?.addEventListener('click',()=>document.body.classList.toggle('showmenu'));
 document.getElementById('copyall')?.addEventListener('click',()=>copy(audioText(), '대본 복사 완료'));
 document.getElementById('tts')?.addEventListener('click',()=>download('EP'+epID+'-V8-narration.txt',audioText()));
 document.getElementById('srt')?.addEventListener('click',()=>download('EP'+epID+'-V8-subtitles-DRAFT.srt',makeSrt()));
 document.getElementById('csv')?.addEventListener('click',()=>download('EP'+epID+'-V8-1to1-edit.tsv',makeTSV(),'text/tab-separated-values;charset=utf-8'));
 document.getElementById('json')?.addEventListener('click',()=>download('EP'+epID+'-V8-cuts.json',JSON.stringify(cutJSON(),null,2),'application/json;charset=utf-8'));
 document.getElementById('print')?.addEventListener('click',()=>window.print());
 document.getElementById('expand')?.addEventListener('click',()=>filterAll(true));
 document.getElementById('onlykey')?.addEventListener('click',()=>filterSet(['c','e']));
 document.querySelectorAll('[data-filter]').forEach(el=>el.addEventListener('change',()=>filterCheck()));
 document.querySelectorAll('.editbtn').forEach(el=>el.addEventListener('click',()=>editPara(Number(el.dataset.index))));
 document.querySelectorAll('#clipN,#clipSeconds,#cpm').forEach(el=>el.addEventListener('input',calc));
 document.getElementById('backgroundVideo')?.addEventListener('change',previewVideo);
 document.getElementById('unloadVideo')?.addEventListener('click',clearVideo);
 document.getElementById('speak')?.addEventListener('click',playTTS);
 document.getElementById('stop')?.addEventListener('click',stopTTS);
 calc();renderAudit();
 loadSources();
}
function filterAll(value){document.querySelectorAll('[data-filter]').forEach(el=>el.checked=value);filterCheck();}
function filterSet(types){document.querySelectorAll('[data-filter]').forEach(el=>el.checked=types.includes(el.dataset.filter));filterCheck();}
function filterCheck(){const active=new Set([...document.querySelectorAll('[data-filter]:checked')].map(el=>el.dataset.filter));document.querySelectorAll('.para').forEach(el=>{el.style.display=active.has(el.dataset.color)?'':'none';});}
function editPara(i){const p=document.getElementById('p'+(i+1));const txt=edits[i]??CUTS[i].line;const input=prompt('CUT '+(i+1)+' 수정 (로컬 브라우저에만 저장)',txt);if(input===null)return;edits[i]=input;save(editableKey,edits);refreshText();renderAudit();if(p){p.classList.add('focus');p.scrollIntoView({behavior:'smooth',block:'center'});}}
function refreshText(){CUTS.forEach(c=>{const el=document.getElementById('txt'+(c.idx+1));if(el){el.innerHTML=highlight(edits[c.idx]??c.line,c.act.color);}});const wrap=document.getElementById('editwrap');if(wrap)wrap.innerHTML=editTable().match(/<div class="tablewrap"[^>]*>([\s\S]*)<\/div>/)?.[1]||'';calc();}
function calc(){
const clipN=Number(document.getElementById('clipN')?.value??settings.clipN),clipSeconds=Number(document.getElementById('clipSeconds')?.value??settings.clipSeconds),cpm=Number(document.getElementById('cpm')?.value??settings.cpm);
const valid=clipN>=0&&clipSeconds>0&&cpm>=100;if(!valid)return;
settings.clipN=clipN;settings.clipSeconds=clipSeconds;settings.cpm=cpm;save(settingsKey,settings);
const chars=audioText().replace(/\s+/g,'').length,narr=chars/cpm*60,foreign=clipN*clipSeconds,total=narr+foreign,rate=total>0?100*narr/total:0;
document.getElementById('audioResult').innerHTML='<span class="chip b">나레이션 '+fmt(narr)+'</span><span class="chip">외국인 원음 '+fmt(foreign)+'</span><span class="chip '+(rate>=60?'g':'r')+'">내레이션 비율 '+rate.toFixed(1)+'% (가안)</span><span class="chip y">예상 합계 '+fmt(total)+' / 목표 10:00</span>';
}
function evidenceRef(c){const id=c.act.source,idx=c.act.line,line=evidenceCache[id]?.lines?.[idx];return {id,index:idx,start_ms:line?.s??null,end_ms:line?.e??null,original:line?.zh??null,translation:line?.ko??null,sourceUrl:origSource(id),captionUrl:origViewer(id),voiceChecked:false,rightsChecked:false};}
function cutJSON(){return CUTS.map(c=>({id:epID+'-'+String(c.idx+1).padStart(2,'0'),start_s:Number(tStart(c.idx).toFixed(2)),end_s:Number(tEnd(c.idx).toFixed(2)),narration:edits[c.idx]??c.line,color:c.act.color,storyArc:c.act.arc,visual:clipShot(c),font:captions(c),sound:soundtrack(c),evidence:evidenceRef(c),usageRights:"unverified"}));}
function makeTSV(){
const header=['cut','new_start','new_end','narration','highlight','arc','visual','font','bgm_sfx','source_id','original_start','original_end','original_quote_asr','translation_draft','evidence_type','voice_checked','rights_checked'];
return [header.join('\t')].concat(cutJSON().map(x=>[x.id,fmt(x.start_s),fmt(x.end_s),x.narration,COLORS[x.color].label,x.storyArc,x.visual,x.font,x.sound,x.evidence.id,x.evidence.start_ms===null?'':fmt(x.evidence.start_ms/1000),x.evidence.end_ms===null?'':fmt(x.evidence.end_ms/1000),x.evidence.original||'',x.evidence.translation||'','연관 원문 후보/자체 나레이션','직접 확인 필요','미확인'].map(y=>q(y).replace(/[\t\r\n]/g,' ')).join('\t'))).join('\n');
}
function srtChunk(text){const words=q(text).trim().split(/\s+/),parts=[],max=34;let current='';words.forEach(w=>{if(current&&current.length+w.length+1>max){parts.push(current);current=w;}else{current+=(current?' ':'')+w;}});if(current)parts.push(current);return parts;}
function makeSrt(){const cuts=D.hook5.map((text,i)=>({text,start:i*6,end:(i+1)*6})).concat(CUTS.map(c=>({text:edits[c.idx]??c.line,start:tStart(c.idx),end:tEnd(c.idx)})));const lines=[];let n=0;cuts.forEach(c=>{const parts=srtChunk(c.text),span=(c.end-c.start)/parts.length;parts.forEach((str,i)=>lines.push(String(++n)+'\n'+fullSRTTime(c.start+i*span)+' --> '+fullSRTTime(c.start+(i+1)*span)+'\n'+str+'\n'));});return lines.join('\n');}
function download(name,content,type){const blob=new Blob([content],{type:type||'text/plain;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1500);}
async function copy(s,success){try{await navigator.clipboard.writeText(s);alert(success||'복사했습니다.');}catch(_){const ta=document.createElement('textarea');ta.value=s;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert(success||'복사했습니다.');}}
let playerURL=null;
function previewVideo(event){const file=event.target.files?.[0];if(!file)return;clearVideo(false);playerURL=URL.createObjectURL(file);document.querySelectorAll('.videostage video').forEach(el=>{el.src=playerURL;el.play().catch(()=>{});});}
function clearVideo(reset=true){document.querySelectorAll('.videostage video').forEach(el=>{el.pause();el.removeAttribute('src');el.load();});if(playerURL)URL.revokeObjectURL(playerURL);playerURL=null;if(reset)document.getElementById('backgroundVideo').value='';}
let speaking=false;
function playTTS(){if(!('speechSynthesis' in window)){alert('이 브라우저의 한국어 음성 읽기를 사용할 수 없습니다.');return;}stopTTS();speaking=true;const paras=D.hook5.concat(CUTS.map(c=>edits[c.idx]??c.line));let i=0;
function step(){if(!speaking||i>=paras.length){speaking=false;return;}const n=i++,s=new SpeechSynthesisUtterance(paras[n]);s.lang='ko-KR';s.rate=.96;s.onend=step;s.onerror=()=>{speaking=false;};window.speechSynthesis.speak(s);}step();}
function stopTTS(){speaking=false;if('speechSynthesis' in window)window.speechSynthesis.cancel();}
function groupAudit(){
const plain=audioText(),negative=['아닙니다','아니었습니다','단정할 수','보장할 수','그렇지 않습니다','아니라고','무조건','것은 아닙니다'];const fails=negative.filter(s=>plain.includes(s));
const loaded=D.sourceIds.every(id=>evidenceCache[id]?.lines?.length);
const groups=[
['① 오프닝·외국인 초반',[['첫 30초 훅 5문장',D.hook5.length===5?'ok':'fail','도입 훅 '+D.hook5.length+'문장','hooks'],['도입부터 한국에 대한 실제 외국인 평가',D.hook5.join(' ').includes('한국')?'ok':'warn','원본 첫 반응 후보 '+D.acts[0].source,'hooks'],['0~4초 외국인 실제 원음 삽입', 'man','원음 영상/사용권 확보 후 직접 확인','p1']]],
['② 해외 근거·출처 1:1',[['32문단 원본 ID·자막행 연결',CUTS.every(c=>c.act.source&&Number.isInteger(c.act.line))?'ok':'fail','모든 문단에 source_id + line_index','p1'],['원본 JSON에서 자막 위치 조회',loaded?'ok':'warn',loaded?'지정 원본 '+D.sourceIds.length+'개 JSON 로드':'원본 로드 또는 타임코드 보완','evidence'],['다른 외국인 또는 해외 공식 자료 연결',D.official.length?'ok':'warn','해외 공식 자료 '+D.official.length+'건, 실제 인용과 구분','official'],['영상 원음·화자 의미 수동 1:1 확인','man','ASR만 확인; 원영상 발화 확인 필요','evidence']]],
['③ 서사·감정선',[['8단 전개 상승곡선',D.acts.length===8?'ok':'fail','결과→배경→장애→반전→증명→회수','manuscript'],['중반 갈등·억울함',D.acts.some(a=>a.color==='C')?'ok':'fail','갈등 태그 '+D.acts.filter(a=>a.color==='C').length+'개','p13'],['후반 자긍심 회수',D.acts[7]?.color==='P'?'ok':'warn','마지막 8단계 확인','p29'],['반복적인 방어 문구 제거',fails.length?'warn':'ok',fails.length?'발견: '+fails.join(', '):'금지 문구 0개','manuscript'],['문단별 질문 폭주 방지',plain.split('?').length-1<16?'ok':'warn','질문 ? 개수 '+(plain.split('?').length-1),'manuscript']]],
['④ 화면·편집',[['숫자 시각화 1~2회',D.chart1&&D.chart2?'ok':'warn','반투명 흰색 그래픽 2종','visuals'],['움직이는 배경 영상과 댓글 그래픽',D.comments.length===2?'ok':'warn','가상 댓글 말풍선 2개, 실제 촬영분과 분리','visuals'],['연출 댓글의 출처 표시',D.comments.every(x=>x.includes('재구성'))?'ok':'fail','재구성 댓글 라벨 유지','visuals'],['폰트·BGM·SFX/초별 컷 표기','ok','32컷 x 17.8125초 + 첫 30초 훅','editing']]],
['⑤ 음성·권리',[['내레이션 비율 60% 이상 기획값',getAudioRate()>=60?'ok':'warn',getAudioRate().toFixed(1)+'% (속도·원음 개수 가정)','calc'],['저작권·음원·초상권 확인','man','허락 입증 전 원본 영상 재사용하지 않기','editing'],['공식 기사 인용·이미지 권리 확인','man','기사 원문 링크와 방송 활용 권리 별도','official']]]
];
return groups;
}
function getAudioRate(){const chars=audioText().replace(/\s+/g,'').length,narr=chars/Math.max(100,Number(settings.cpm))*60,other=Number(settings.clipN)*Number(settings.clipSeconds);return narr+other?100*narr/(narr+other):0;}
function focusTarget(id){const el=document.getElementById(id);if(!el)return;document.querySelectorAll('.para.focus,.focusproof').forEach(x=>x.classList.remove('focus','focusproof'));if(el.classList.contains('para'))el.classList.add('focus');else el.classList.add('focusproof');el.scrollIntoView({behavior:'smooth',block:'center'});}
function renderAudit(){
const groups=groupAudit(),rows=groups.flatMap((x,i)=>x[1].map((k,j)=>({key:i+'-'+j,row:k}))),counts={ok:0,warn:0,fail:0,man:0};
rows.forEach(x=>{const chosen=checked[x.key]||x.row[1];counts[chosen]=(counts[chosen]||0)+1;});
document.getElementById('checkstat').innerHTML='<span class="status ok">적용 '+counts.ok+'</span><span class="status warn">보완 '+counts.warn+'</span><span class="status fail">미적용 '+counts.fail+'</span><span class="status man">직접확인 '+counts.man+'</span>';
let s='';
groups.forEach((g,i)=>{s+='<div class="chkgroup"><h4>'+g[0]+'</h4>';g[1].forEach((r,j)=>{const key=i+'-'+j,st=checked[key]||r[1];s+='<button type="button" class="chk" data-check="'+key+'" data-target="'+r[3]+'">'+statusChip(st)+esc(r[0])+'<small class="why">'+esc(r[2])+'</small></button>';});s+='</div>';});
s+='<div class="chkgroup"><h4>🛠️ 검수자 수동 수정</h4><p class="mini">항목을 클릭하면 연결된 문단을 강조합니다. 적용 상태를 직접 바꾸려면 Shift+클릭하세요. 설정은 이 기기의 브라우저에 보관합니다.</p></div>';
document.getElementById('auditList').innerHTML=s;
document.querySelectorAll('[data-check]').forEach(b=>b.addEventListener('click',e=>{if(e.shiftKey){let key=b.dataset.check,seq=['ok','warn','fail','man'],now=checked[key]||groups[Number(key.split('-')[0])][1][Number(key.split('-')[1])][1];checked[key]=seq[(seq.indexOf(now)+1)%4];save(checkKey,checked);renderAudit();}else focusTarget(b.dataset.target);}));
}
function renderEvidence(){
document.getElementById('evidenceResults').innerHTML=D.acts.map((a,i)=>{const obj=evidenceCache[a.source],line=obj?.lines?.[a.line];return '<div class="sourcecard" id="srcact'+i+'"><div class="srcname">ACT '+(i+1)+' · '+esc(a.source)+' · 실제 자막 '+a.line+'행</div>'+(line?'<div class="quote">'+esc(line.zh)+'</div><div class="translated">🇰🇷 초벌 번역: '+esc(line.ko)+'</div><div class="tiny mut">원본 영상 '+fmt(line.s/1000)+' ~ '+fmt(line.e/1000)+'</div>':'<p class="mini">해당 원본의 ASR 위치를 불러오지 못했습니다.</p>')+'<a class="sourcechip" href="'+origViewer(a.source)+'" target="_blank">전체 자막 열기</a><a class="sourcechip" href="'+origSource(a.source)+'" target="_blank">원본 영상 링크</a><p class="disclaimer">원본 ASR·초벌번역 자료. 화자 원음, 화면 대응, 사용권 수동 검토 필요.</p></div>';}).join('');
document.querySelectorAll('.para').forEach((el,i)=>{const a=CUTS[i],badge=el.querySelector('.sourcechip.warn');if(badge)badge.outerHTML=evidenceBadge(a).replace(/<a[^>]*>[\s\S]*?<\/a>/,'');const proof=el.querySelector('.proofline');if(proof)proof.outerHTML=sourceLine(a);});const wrap=document.getElementById('editwrap');if(wrap)wrap.outerHTML=editTable();renderAudit();
}
async function loadSources(){
await Promise.all(D.sourceIds.map(async id=>{try{const r=await fetch('../../국뽕해외반응-중국SNS-20261103/script/data/'+encodeURIComponent(id)+'.json');if(!r.ok)throw Error('HTTP '+r.status);evidenceCache[id]=await r.json();}catch(e){evidenceCache[id]={lines:[],error:String(e)};}}));
renderEvidence();
}
render();
})();