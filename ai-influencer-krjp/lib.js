(function(){
var SET=window.SET||'gal';var D=(SET==='fields'?FLD:GAL).slice();
var $=function(s){return document.querySelector(s)};
var fmt=function(n){return n==null?'—':n>=1e8?(n/1e8).toFixed(1)+'억':n>=1e4?(n/1e4).toFixed(n>=1e5?0:1)+'만':n.toLocaleString()};
var med=function(a){a=a.filter(function(x){return x!=null&&!isNaN(x)}).sort(function(x,y){return x-y});if(!a.length)return null;var h=a.length>>1;return a.length%2?a[h]:(a[h-1]+a[h])/2};
var esc=function(s){return String(s).replace(/[<>&"]/g,function(c){return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]})};
D.forEach(function(d){d.cr=d.m!=null&&d.v?d.m/d.v:null;d.lr=d.l!=null&&d.v?d.l/d.v:null});
var FIELDS=Array.from(new Set(D.map(function(d){return d.f})));
var TITLE=SET==='fields'?'분야별 릴스 TOP60 (10개 분야)':'AI 인플루언서·AI 활용 릴스 갤러리 (한국·일본)';
var SUB=SET==='fields'?'분야마다 조회수 상위 60개 · 사람·실사·AI 모두 포함 · 계정당 최대 5개 · 출처: 시트 RAW_MASTER(11/4) + 인스타 해시태그 수집(11/6)':'한국·일본 '+D.length+'개 · 조회수 1천 이상 · 캡션·계정명에 AI 관련 단어 · 선정적·스팸 제외 · 인스타 해시태그 약 160개에서 수집(11/6)';
document.title=TITLE;
document.body.innerHTML='<header><h1>'+TITLE+'</h1><div class="note">'+SUB+'<br><b>주의:</b> 국가·분야·유형·댓글 유도 방식은 캡션 키워드로 <b>추정</b>한 값이고 영상은 직접 보지 않았습니다. 조회수·좋아요·댓글은 수집 시점 값입니다. 썸네일은 인스타 oEmbed 표지(2026-11-13)이며 삭제·비공개된 일부는 빈 칸입니다. 카드의 사진을 누르면 영상이 재생됩니다.</div></header>'+
'<div class="bar"><span>국가</span><select id="fc"><option value="">전체</option><option>KR</option><option>JP</option>'+(SET==='fields'?'<option>GL</option>':'')+'</select>'+
'<span>유형</span><select id="fk"><option value="">전체</option></select>'+
(SET==='fields'?'':'<span>분야</span><select id="ff"><option value="">전체</option></select>')+
'<span>댓글유도</span><select id="fta"><option value="">전체</option></select>'+
'<span>정렬</span><span id="sb"><button data-s="v" class="on">조회수</button><button data-s="l">좋아요</button><button data-s="m">댓글</button><button data-s="cr">댓글률</button><button data-s="t">최신</button></span>'+
'<span>가로 개수</span><select id="cols"><option value="0">자동</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option><option>10</option></select>'+
'<label><input type="checkbox" id="cap3"> 계정당 3개</label><input id="q" placeholder="계정·캡션 검색" style="width:140px"><span class="note" id="cnt"></span></div>'+
(SET==='fields'?'<div class="tabs" id="tabs"></div>':'')+
'<div class="wrap"><div class="grid" id="g"></div><div style="text-align:center;margin:18px"><button id="more">더 보기</button></div>'+
'<details open class="sum"><summary>한눈에 보기 (현재 필터 기준)</summary><div class="charts"><div class="chart"><b>분야별 조회수 중앙값</b><div id="c1"></div></div><div class="chart"><b>유형별 비교</b><div id="c2"></div></div><div class="chart"><b>댓글 유도 방식별 댓글률 중앙값</b><div id="c3"></div></div><div class="chart"><b>국가×분야 건수</b><div id="c4"></div></div></div>'+(SET==='fields'?'':'<h3>AI 캐릭터만 하는 게 맞을까?</h3><div class="insight" id="ins"></div>')+'</details></div>'+
'<div id="modal"><div class="mb"><button id="mx">✕ 닫기</button><iframe id="mf" allow="autoplay; encrypted-media" allowfullscreen></iframe><a id="mo" target="_blank">인스타에서 열기 ↗</a></div></div>';
var sortKey='v',shown=120,curField='';
Array.from(new Set(D.map(function(d){return d.k}))).forEach(function(k){$('#fk').insertAdjacentHTML('beforeend','<option>'+k+'</option>')});
if($('#ff'))FIELDS.slice().sort().forEach(function(f){$('#ff').insertAdjacentHTML('beforeend','<option>'+f+'</option>')});
Array.from(new Set(D.reduce(function(a,d){return a.concat(d.cta)},[]))).concat(['없음']).forEach(function(k){$('#fta').insertAdjacentHTML('beforeend','<option>'+k+'</option>')});
if(SET==='fields'){var th='<button data-f="" class="on">전체 '+D.length+'</button>';FIELDS.forEach(function(f){th+='<button data-f="'+f+'">'+f+' '+D.filter(function(d){return d.f===f}).length+'</button>'});$('#tabs').innerHTML=th}
var savedCols=localStorage.getItem('krjp_cols');if(savedCols)$('#cols').value=savedCols;
function filt(){var c=$('#fc').value,k=$('#fk').value,f=SET==='fields'?curField:$('#ff').value,ta=$('#fta').value,q=$('#q').value.trim().toLowerCase();
 var a=D.filter(function(d){return(!c||d.n===c)&&(!k||d.k===k)&&(!f||d.f===f)&&(!ta||(ta==='없음'?!d.cta.length:d.cta.indexOf(ta)>=0))&&(!q||(d.u+' '+d.cap).toLowerCase().indexOf(q)>=0)});
 a.sort(function(x,y){var X=x[sortKey],Y=y[sortKey];return(Y==null?-1:Y)-(X==null?-1:X)});
 if($('#cap3').checked){var cn={};a=a.filter(function(d){cn[d.u]=(cn[d.u]||0)+1;return cn[d.u]<=3})}return a}
function thumb(c){var p=SPM[c];if(!p)return'<div class="nt"><span>🎬</span><small>표지 없음</small></div>';var s=p[0],i=p[1],col=i%SPR.cols,row=Math.floor(i/SPR.cols);
 return'<div class="tt" style="background-image:url(s'+(s<10?'0':'')+s+'.jpg);background-size:'+SPR.cols*100+'% '+SPR.rows*100+'%;background-position:'+(col*100/(SPR.cols-1))+'% '+(row*100/(SPR.rows-1))+'%"></div>'}
function card(d,i){return'<div class="card"><div class="th" data-c="'+d.c+'">'+thumb(d.c)+'<span class="rk">#'+(i+1)+'</span><span class="fl '+d.n+'">'+d.n+'</span><span class="pl">▶</span></div>'+
 '<div class="b"><div class="v" title="'+d.v.toLocaleString()+'회">조회 '+fmt(d.v)+'</div><div class="st">♥ '+fmt(d.l)+' · 💬 '+fmt(d.m)+' · '+(d.t?new Date(d.t*1000).toISOString().slice(0,10):'')+'</div>'+
 '<div class="u"><a href="https://www.instagram.com/'+esc(d.u)+'/" target="_blank">@'+esc(d.u)+'</a> · <a href="https://www.instagram.com/reel/'+d.c+'/" target="_blank" class="o">원본</a></div>'+
 '<div class="tg"><span class="tag">'+d.f+'</span><span class="tag k'+d.k.length+'">'+d.k+'</span>'+d.cta.map(function(x){return'<span class="tag cta">'+x+'</span>'}).join('')+'</div><div class="cap">'+esc(d.cap)+'</div></div></div>'}
function bars(el,rows,f){var mx=Math.max.apply(null,rows.map(function(r){return r[1]||0}))||1;el.innerHTML=rows.map(function(r){return'<div class="row"><span>'+r[0]+'</span><div class="track"><div class="fill" style="width:'+(100*(r[1]||0)/mx)+'%"></div></div><span>'+f(r[1])+' <small>n='+r[2]+'</small></span></div>'}).join('')}
function group(a,key){var g={};a.forEach(function(d){(Array.isArray(d[key])?(d[key].length?d[key]:['없음']):[d[key]]).forEach(function(x){(g[x]=g[x]||[]).push(d)})});return g}
function charts(a){var g1=group(a,'f');bars($('#c1'),Object.keys(g1).map(function(k){return[k,med(g1[k].map(function(d){return d.v})),g1[k].length]}).sort(function(x,y){return y[1]-x[1]}),fmt);
 var g2=group(a,'k');$('#c2').innerHTML='<table><tr><th>유형</th><th>건수</th><th>조회 중앙</th><th>최고</th><th>좋아요률</th><th>댓글률</th></tr>'+Object.keys(g2).map(function(k){var v=g2[k];return'<tr><td>'+k+'</td><td>'+v.length+'</td><td>'+fmt(med(v.map(function(d){return d.v})))+'</td><td>'+fmt(Math.max.apply(null,v.map(function(d){return d.v})))+'</td><td>'+((med(v.map(function(d){return d.lr}))||0)*100).toFixed(2)+'%</td><td>'+((med(v.map(function(d){return d.cr}))||0)*100).toFixed(3)+'%</td></tr>'}).join('')+'</table>';
 var g3=group(a,'cta');bars($('#c3'),Object.keys(g3).map(function(k){return[k,med(g3[k].map(function(d){return d.cr})),g3[k].length]}).sort(function(x,y){return y[1]-x[1]}),function(x){return x==null?'—':(x*100).toFixed(3)+'%'});
 var fs=Array.from(new Set(a.map(function(d){return d.f})));$('#c4').innerHTML='<table><tr><th>분야</th><th>KR</th><th>JP</th><th>GL</th></tr>'+fs.map(function(f){return'<tr><td>'+f+'</td><td>'+a.filter(function(d){return d.f===f&&d.n==='KR'}).length+'</td><td>'+a.filter(function(d){return d.f===f&&d.n==='JP'}).length+'</td><td>'+a.filter(function(d){return d.f===f&&d.n==='GL'}).length+'</td></tr>'}).join('')+'</table>'}
function insight(){if(!$('#ins'))return;var s=function(k){var v=D.filter(function(d){return d.k===k});return{n:v.length,mv:med(v.map(function(d){return d.v})),cr:med(v.map(function(d){return d.cr})),top:v.filter(function(d){return d.v>=1e6}).length}};
 var a=s('AI 인물·캐릭터'),b=s('AI 툴 강의·홍보'),c=s('AI 활용 일반');var dm=D.filter(function(d){return d.cta.indexOf('댓글키워드→DM(자료·링크 제공)')>=0}),nod=D.filter(function(d){return!d.cta.length});
 $('#ins').innerHTML='<b>숫자(이 수집분 기준, 캡션 키워드 추정)</b><br>· AI 인물·캐릭터: '+a.n+'건, 조회 중앙값 '+fmt(a.mv)+', 100만+ '+a.top+'건, 댓글률 중앙 '+((a.cr||0)*100).toFixed(3)+'%<br>· AI 툴 강의·홍보: '+b.n+'건, 조회 중앙값 '+fmt(b.mv)+', 100만+ '+b.top+'건, 댓글률 중앙 '+((b.cr||0)*100).toFixed(3)+'%<br>· AI 활용 일반: '+c.n+'건, 조회 중앙값 '+fmt(c.mv)+', 100만+ '+c.top+'건, 댓글률 중앙 '+((c.cr||0)*100).toFixed(3)+'%<br>· "댓글 남기면 DM" 유형 댓글률 중앙 '+((med(dm.map(function(d){return d.cr}))||0)*100).toFixed(3)+'% vs 유도 없음 '+((med(nod.map(function(d){return d.cr}))||0)*100).toFixed(3)+'%<br><br><b>해석(제 의견, 검증 안 됨)</b><br>· 조회수 대박은 캐릭터 자체보다 포맷(ASMR·먹방, 동물 콩트, AI 아나운서)에서 나옵니다. 사람·햄스터·AI 드라마 모두 통합니다.<br>· 툴 강의·홍보형은 조회수·댓글률이 낮지만, 어떤 유형이든 "댓글 키워드 → DM 자료"가 붙으면 댓글률이 크게 뜁니다. 조회는 캐릭터·동물·숏드라마, 돈은 DM 자료·정보형 CTA로 버는 혼합 구성이 데이터와 맞습니다.'}
function apply(){var cs=$('#cols').value;var g=$('#g');g.style.gridTemplateColumns=cs==='0'?'repeat(auto-fill,minmax(150px,1fr))':'repeat('+cs+',minmax(0,1fr))'}
function render(){var a=filt();$('#cnt').textContent=a.length+'건 중 '+Math.min(shown,a.length)+'개 표시';apply();$('#g').innerHTML=a.slice(0,shown).map(card).join('');$('#more').style.display=a.length>shown?'':'none';charts(a)}
document.querySelectorAll('.bar select,#cap3').forEach(function(e){e.onchange=function(){if(e.id==='cols')localStorage.setItem('krjp_cols',e.value);shown=120;render()}});$('#q').oninput=function(){shown=120;render()};
document.querySelectorAll('#sb button').forEach(function(b){b.onclick=function(){document.querySelectorAll('#sb button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');sortKey=b.dataset.s;shown=120;render()}});
if(SET==='fields')document.querySelectorAll('#tabs button').forEach(function(b){b.onclick=function(){document.querySelectorAll('#tabs button').forEach(function(x){x.classList.remove('on')});b.classList.add('on');curField=b.dataset.f;shown=120;render()}});
$('#more').onclick=function(){shown+=120;render()};
$('#g').onclick=function(e){var t=e.target.closest('.th');if(!t)return;var c=t.dataset.c;$('#mf').src='https://www.instagram.com/reel/'+c+'/embed/';$('#mo').href='https://www.instagram.com/reel/'+c+'/';$('#modal').style.display='flex'};
function closeM(){$('#modal').style.display='none';$('#mf').src='about:blank'}$('#mx').onclick=closeM;$('#modal').onclick=function(e){if(e.target.id==='modal')closeM()};document.addEventListener('keydown',function(e){if(e.key==='Escape')closeM()});
insight();render();})();