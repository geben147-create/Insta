/* 통합 썸네일 편집기 (2026-11-23)
   템플릿 · 표정 · 요소 · 원본 14컷 · 효과 · 내 사진(자동 누끼 + 아우라) · PNG 저장 */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const FX = '../../research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/effects/';
const FONTS = ['Black Han Sans','레코체','SB어그로','G마켓산스','카페24써라운드','카페24아네모네','쿠키런블랙','티머니둥근바람','평창평화','양진체','Do Hyeon','Jua','정선아리랑뿌리','잉크립퀴드','Nanum Brush Script','Noto Serif KR','Bangers','Anton'];
const SW = ['#FFFFFF','#111111','#F3D42D','#F8D643','#F0F44C','#FFE27A','#E21317','#D61148','#E8321E','#DE6B43','#E08E41','#B54763','#FF2FB0','#78EDF5','#349FAC','#8BE04E','#B71512','#3B1203'];
const C = id => 'crops/' + id + (id.startsWith('c-') ? '.png' : '.jpg');
const F = id => 'crops/full-' + id + '.jpg';

/* ── 기본 레이어 ── */
const T = (o) => Object.assign({type:'text', text:'글씨', x:50, y:50, font:'Black Han Sans', size:7, fill:'#FFFFFF', grad:false, fill2:'#E8321E', gstop:50, acc:'#FFE27A', stroke:'#111111', sw:12, shadow:false, sc:'#000000', sx:0.3, sy:0.4, ls:0, skew:0, r:0, box:false, boxc:'#E21317', boxb:'#111111', arc:false, a0:-60, a1:60, rad:15, rise:false, rdeg:22, op:100}, o);
const I = (o) => Object.assign({type:'img', src:'', x:50, y:50, w:40, r:0, flip:false, circ:false, bw:0.8, bc:'#FFFFFF', aura:false, ac:'#FFFFFF', as:1.6, an:3, out:false, oc:'#FFFFFF', ow:0.35, op:100, cut:null}, o);
const P = (o) => Object.assign({type:'panel', src:'', side:'all', zoom:100, px:50, py:40, op:100}, o);
const BOLT = (o) => Object.assign({type:'bolt', top:57, bottom:44, w:9, color:'#F3D42D', stroke:'#111111'}, o);
const BANG = (o) => Object.assign({type:'bang', x:40, y:14, w:15, text:'!!', r:0}, o);
const FXL = (o) => Object.assign({type:'fx', kind:'sparkle', x:50, y:50, w:14, r:0, flip:false, op:100}, o);
const FIRE = (o) => Object.assign({type:'fireE', side:'both', w:15, op:100}, o);
const FRAME = (o) => Object.assign({type:'frame', color:'#78EDF5', w:1.4}, o);
const BG = (o) => Object.assign({c1:'#2a2a2e', c2:'#0b0b0d', angle:160, glow:'', glowx:60, glowy:40}, o);

/* ── 템플릿 (원본 번호 기준) ── */
const TPL = [
 {key:'bolt', name:'⚡ 번개 분할 · 01-1', ref:'01-1', bg:BG({c1:'#cfc6b4', c2:'#8d8473'}), L:[
   P({src:C('e-01-1-face-l'), side:'left', px:45, py:40}), P({src:C('e-01-1-face'), side:'right', px:55, py:40}),
   BOLT({}),
   T({text:'MC는 절대 울면 안 된다', x:50, y:7, size:3.6, fill:'#222222', stroke:'#222222', sw:0, box:true, boxc:'#F4EAD2', boxb:'#222222'}),
   T({text:'갑자기', x:9, y:67, size:3.2, fill:'#F8D643', sw:12}),
   T({text:'막 눈을 꾹꾹', x:25, y:80, size:8.4, fill:'#F8D643', grad:true, fill2:'#E8321E', gstop:52, sw:15}),
   T({text:'대성통곡', x:79, y:84, size:6.4, fill:'#F1C933', sw:13})]},
 {key:'shock', name:'💥 충격 원형 · 09-4', ref:'09-4', bg:BG({c1:'#B71512', c2:'#2a0505', angle:135, glow:'#ff6a3d', glowx:70, glowy:40}), L:[
   I({src:C('c-shock'), x:22, y:44, w:39, circ:true, bw:1, bc:'#FFFFFF'}),
   BANG({x:39, y:12, w:15}),
   T({text:'충 격', x:52, y:86, size:7.6, fill:'#FFFFFF', sw:0, box:true, boxc:'#E21317', boxb:'#111111', ls:12})]},
 {key:'kkk', name:'😂 ㅋㅋㅋ 아치 · 06-3', ref:'06-3', bg:BG({}), L:[
   P({src:C('e-kkk-laugh-l'), side:'left', px:40, py:40}), P({src:C('e-kkk-laugh-r'), side:'right', px:50, py:40}),
   BOLT({top:44, bottom:30, w:6, color:'#FFFFFF'}),
   T({text:'ㅋㅋㅋㅋㅋ', x:79, y:42, size:6.2, fill:'#F0F44C', sw:18, arc:true, a0:-62, a1:78, rad:17}),
   T({text:'(긁적)', x:30, y:8, size:3.8, fill:'#F0F44C', sw:14}),
   T({text:'돈가스 마사지 선물', x:64, y:88, size:4.8, fill:'#FFFFFF', sw:13})]},
 {key:'rise', name:'🔥 솟는 금색 글씨 · 07-3', ref:'07-3', bg:BG({}), L:[
   P({src:C('e-laugh-3'), side:'all', px:50, py:30}),
   T({text:'왕밤빵이\n실제로 있어?', x:50, y:15, size:4.6, fill:'#EECB56', stroke:'#FFFFFF', sw:12}),
   T({text:'모르겠지', x:13, y:66, size:2.8, fill:'#F8D643', sw:12}),
   T({text:'네가 다니는 백화점엔 없어!', x:50, y:82, size:6.6, fill:'#FFE27A', grad:true, fill2:'#DE6B43', gstop:25, stroke:'#3B1203', sw:18, rise:true, rdeg:22})]},
 {key:'fire', name:'🔥 양옆 불꽃 + 절규 · 02-1', ref:'02-1', bg:BG({c1:'#6b3216', c2:'#1b0b05', glow:'#ff8a2a', glowx:50, glowy:30}), L:[
   I({src:C('e-scream-face'), x:52, y:40, w:52}),
   FIRE({}),
   T({text:'분노 화신', x:79, y:64, size:3.6, fill:'#FFE46A', sw:12}),
   T({text:'왜애!!', x:70, y:81, size:9, fill:'#FFD15A', grad:true, fill2:'#E0501E', gstop:35, stroke:'#7A1A05', sw:16}),
   FXL({kind:'burst', x:90, y:70, w:13})]},
 {key:'lips', name:'💋 빨간 입술 · 글씨 없이 · 01-4', ref:'01-4', bg:BG({}), L:[
   P({src:C('e-redlips'), side:'all', px:50, py:35}),
   T({text:'춥고… 배고프고…', x:30, y:88, size:3.6, fill:'#FFFFFF', sw:10})]},
 {key:'dog', name:'🐶 강아지 정중앙 · 01-2', ref:'01-2', bg:BG({c1:'#f3efe8', c2:'#d8d2c8'}), L:[
   I({src:C('e-dog-center'), x:46, y:36, w:34}), I({src:C('e-dog-right'), x:83, y:35, w:26}),
   FRAME({}),
   T({text:'건전지 넣은 *인형인가요?*', x:50, y:72, size:6.2, fill:'#FFFFFF', acc:'#FF9DB5', stroke:'#1D6F7A', sw:16}),
   T({text:'태연 누나밖에 모르는 *제로*', x:50, y:88, size:6.2, fill:'#FFFFFF', acc:'#FFE27A', stroke:'#1D6F7A', sw:16})]},
 {key:'circles', name:'⭕ 원형 2개 · 03-1', ref:'03-1', bg:BG({c1:'#2f4a3a', c2:'#1d2f25'}), L:[
   I({src:C('c-03-1-a'), x:72, y:27, w:30, circ:true}), I({src:C('c-03-1-b'), x:80, y:73, w:28, circ:true}),
   T({text:'우리 노래엔\n*JYP 이게 없어*', x:33, y:52, size:5.4, fill:'#FFE27A', acc:'#E8321E', sw:14, r:-8}),
   T({text:'…없었나?', x:86, y:12, size:4.6, fill:'#FFE27A', sw:14}),
   T({text:'삐짐', x:93, y:56, size:6.5, fill:'#E8321E', stroke:'#FFFFFF', sw:12, r:8})]},
 {key:'hands', name:'😱 원형 입가림 · 02-4', ref:'02-4', bg:BG({c1:'#e9d7bf', c2:'#c9b49a'}), L:[
   I({src:C('c-02-4'), x:76, y:38, w:40, circ:true, bw:1}),
   T({text:'순식간에 퍼진 *토미* 동정여론', x:46, y:86, size:5.4, fill:'#FFFFFF', acc:'#8BE04E', stroke:'#1D3B10', sw:14})]},
 {key:'sports', name:'⚾ 스포츠 · 06-1', ref:'06-1', bg:BG({c1:'#2a4a7a', c2:'#0e1a33'}), L:[
   I({src:C('e-baseball-laugh'), x:20, y:42, w:38}), I({src:C('e-baseball-player'), x:74, y:40, w:52}),
   BANG({x:88, y:13, w:10}),
   T({text:'*4연타석 홈런,* 이대호', x:50, y:88, size:7.8, fill:'#FFFFFF', acc:'#D61148', sw:14})]},
 {key:'aura', name:'✨ 아우라 인물 (리트 만점자형)', ref:null, bg:BG({c1:'#0b1030', c2:'#000000', glow:'#3b5bff', glowx:30, glowy:50}), L:[
   I({src:C('c-shock'), x:28, y:55, w:44, aura:true, ac:'#FFFFFF', as:1.4, an:3}),
   T({text:'만점자에 쏠린 시선,', x:68, y:70, size:5.4, fill:'#FFFFFF', sw:10}),
   T({text:'*답, 인접 문항* 답과 일치', x:68, y:85, size:5.4, fill:'#FFFFFF', acc:'#FF2FB0', sw:10})]}
];

let st = {bg:BG({}), L:[], ref:null, name:''}, sel = -1, tab = 'tpl';
const stage = $('#stage');

/* ── 렌더 ── */
function boltPts(b){const m=b.top+(b.bottom-b.top)*.45,w=b.w;return [[b.top-w*.5,0],[b.top+w*.5,0],[m+w*.15,41],[m+w*.7,41],[b.bottom,100],[m-w*.1,56],[m-w*.65,56]];}
function bolt(){return st.L.find(l=>l.type==='bolt');}
function clipFor(side){const b=bolt()||{top:57,bottom:44};const m=b.top+(b.bottom-b.top)*.48;
  return side==='left'?`polygon(0 0,${b.top}% 0,${m}% 48%,${b.bottom}% 100%,0 100%)`:side==='right'?`polygon(${b.top}% 0,100% 0,100% 100%,${b.bottom}% 100%,${m}% 48%)`:'none';}
function richLine(line, L, front){
  // *강조* → 강조색
  return esc(line).replace(/\*([^*]+)\*/g,(m,w)=>front?`<span style="-webkit-text-fill-color:${L.acc};color:${L.acc}">${w}</span>`:w);
}
function glyphStack(content, L, frontContent){
  const sw=L.sw/100;
  const fillStyle=L.grad?`background:linear-gradient(180deg,${L.fill} ${L.gstop}%,${L.fill2});-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent`:`color:${L.fill}`;
  const back=sw>0?`<span style="color:${L.stroke};-webkit-text-stroke:${sw}em ${L.stroke}">${content}</span>`:'';
  return `<span class="stack">${back}<span style="${fillStyle}">${frontContent??content}</span></span>`;
}
function textHTML(L){
  const lines=String(L.text).split('\n');
  let inner;
  if(L.arc){
    const chars=[...String(L.text).replace(/\n/g,'')];const n=chars.length;
    inner=`<div class="arc" style="width:${L.rad*2}cqw;height:${L.rad*2}cqw">`+chars.map((c,i)=>{const t=n>1?L.a0+(L.a1-L.a0)*i/(n-1):0;return `<span class="ch" style="left:50%;top:50%;transform:translate(-50%,-50%) rotate(${t}deg) translateY(-${L.rad}cqw)">${glyphStack(esc(c),L)}</span>`;}).join('')+'</div>';
  }else{
    inner=lines.map(line=>{const g=glyphStack(richLine(line,L,false),L,richLine(line,L,true));
      return L.box?`<div style="display:inline-block;background:${L.boxc};border:.08em solid ${L.boxb};padding:.06em .45em .1em;box-shadow:.12em .12em 0 #000a;margin:.04em 0">${g}</div>`:`<div>${g}</div>`;}).join('');
  }
  const shadow=L.shadow?`filter:drop-shadow(${L.sx}cqw ${L.sy}cqw 0 ${L.sc});`:'';
  const rise=L.rise?`<div style="transform:perspective(40cqw) rotateX(${L.rdeg}deg);transform-origin:50% 100%;position:relative">${'<div class="riseglow"></div>'}${inner}</div>`:inner;
  return `<div class="txt" style="font-family:'${L.font}';font-size:${L.size}cqw;letter-spacing:${L.ls/100}em;${shadow}transform:skewX(${L.skew}deg)">${rise}</div>`;
}
function render(){
  const b=st.bg;
  stage.style.background=(b.glow?`radial-gradient(circle at ${b.glowx}% ${b.glowy}%,${b.glow}88,transparent 45%),`:'')+`linear-gradient(${b.angle}deg,${b.c1},${b.c2})`;
  stage.replaceChildren();
  st.L.forEach((L,i)=>{
    const d=document.createElement('div');d.className='L';d.dataset.i=i;
    if(L.type==='panel'){d.classList.add('panel');d.style.clipPath=clipFor(L.side);d.style.opacity=L.op/100;
      const b=bolt()||{top:57,bottom:44};const box=L.side==='left'?`left:0;width:${Math.max(b.top,b.bottom)+3}%`:L.side==='right'?`left:${Math.min(b.top,b.bottom)-3}%;right:0`:'left:0;right:0';
      d.innerHTML=`<div style="position:absolute;top:0;bottom:0;${box};overflow:hidden"><img alt="" draggable="false" src="${L.cut||L.src}" style="object-position:${L.px}% ${L.py}%;transform:scale(${L.zoom/100});transform-origin:${L.px}% ${L.py}%"></div>`;}
    else if(L.type==='img'){d.classList.add('img');if(L.circ)d.classList.add('circ');
      Object.assign(d.style,{left:L.x+'%',top:L.y+'%',width:L.w+'%',opacity:L.op/100,transform:`translate(-50%,-50%) rotate(${L.r}deg) scaleX(${L.flip?-1:1})`});
      const f=[];if(L.out)for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[.7,.7],[-.7,.7],[.7,-.7],[-.7,-.7]])f.push(`drop-shadow(${dx*L.ow}cqw ${dy*L.ow}cqw 0 ${L.oc})`);
      if(L.aura)for(let k=0;k<L.an;k++)f.push(`drop-shadow(0 0 ${L.as*(k+1)}cqw ${L.ac})`);
      if(L.circ){d.style.border=`${L.bw}cqw solid ${L.bc}`;d.style.boxShadow=(L.aura?`0 0 ${L.as*3}cqw ${L.ac},`:'')+'0 0 0 .25cqw #000,0 1cqw 2cqw #0009';}
      else d.style.filter=f.join(' ');
      d.innerHTML=`<img alt="" draggable="false" src="${L.cut||L.src}">`;}
    else if(L.type==='text'){Object.assign(d.style,{left:L.x+'%',top:L.y+'%',opacity:L.op/100,transform:`translate(-50%,-50%) rotate(${L.r}deg)`});d.innerHTML=textHTML(L);}
    else if(L.type==='bolt'){d.style.inset='0';d.style.pointerEvents='none';
      d.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block;filter:drop-shadow(0 0 .6cqw #000a)"><polygon points="${boltPts(L).map(p=>p.join(',')).join(' ')}" fill="${L.color}" stroke="${L.stroke}" stroke-width="3" vector-effect="non-scaling-stroke" stroke-linejoin="round" style="pointer-events:all"/></svg>`;}
    else if(L.type==='bang'){Object.assign(d.style,{left:L.x+'%',top:L.y+'%',width:L.w+'%',transform:`translate(-50%,-50%) rotate(${L.r}deg)`});
      d.innerHTML=`<svg viewBox="0 0 100 80" style="display:block;width:100%"><polygon points="50,2 58,22 80,6 72,28 98,26 78,42 96,62 70,56 68,78 52,60 34,78 32,56 6,64 22,44 2,28 28,28 20,6 42,22" fill="#fff" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/><text x="50" y="52" text-anchor="middle" font-family="Black Han Sans,sans-serif" font-size="30" fill="#111">${esc(L.text)}</text></svg>`;}
    else if(L.type==='fx'){d.classList.add('img');Object.assign(d.style,{left:L.x+'%',top:L.y+'%',width:L.w+'%',opacity:L.op/100,transform:`translate(-50%,-50%) rotate(${L.r}deg) scaleX(${L.flip?-1:1})`});d.innerHTML=`<img alt="" draggable="false" src="${FX}${L.kind}.png">`;}
    else if(L.type==='fireE'){d.style.inset='0';d.style.pointerEvents='none';d.style.opacity=L.op/100;
      const e=s=>`<div class="fireE" style="${s}:0;width:${L.w}%;${s==='right'?'transform:scaleX(-1);':''}background:linear-gradient(90deg,#ff3d00cc,#ff8a1a88 35%,transparent 100%)"><div style="position:absolute;inset:-6% 0;background-image:url('${FX}flame.png');background-size:170% auto;background-repeat:repeat-y;background-position:-35% 0;filter:saturate(1.4) blur(.25cqw) drop-shadow(0 0 1.2cqw #ff6a00);mix-blend-mode:screen;opacity:.95"></div><div style="position:absolute;inset:0;background-image:url('${FX}flame.png');background-size:120% auto;background-repeat:repeat-y;background-position:-10% 40%;filter:saturate(1.3);mix-blend-mode:screen;opacity:.8"></div></div>`;
      d.innerHTML=(L.side!=='right'?e('left'):'')+(L.side!=='left'?e('right'):'');}
    else if(L.type==='frame'){d.style.inset='0';d.style.pointerEvents='none';d.innerHTML=`<div class="frameL" style="border:${L.w}cqw solid ${L.color}"></div>`;}
    if(i===sel)d.classList.add('sel');
    stage.append(d);
  });
  // 선택 표시는 별도 상자로 (필터·외곽선 효과에 섞이지 않게)
  const se=stage.querySelector('.L.sel');
  if(se&&!['bolt','fireE','frame','panel'].includes(st.L[sel]?.type)){const r=se.getBoundingClientRect(),q=stage.getBoundingClientRect();const b=document.createElement('div');b.className='selbox';Object.assign(b.style,{left:(r.left-q.left)/q.width*100+'%',top:(r.top-q.top)/q.height*100+'%',width:r.width/q.width*100+'%',height:r.height/q.height*100+'%'});stage.append(b);}
  const ov=+$('#overlay').value;
  if(ov>0&&st.ref){const o=document.createElement('img');o.className='ovl';o.src=F(st.ref);o.style.opacity=ov/100;o.alt='';stage.append(o);}
  drawLayers();
}
function layerName(L){return ({panel:'🖼 사진 패널 ('+({all:'전체',left:'번개 왼쪽',right:'번개 오른쪽'})[L.side]+')',img:L.circ?'⭕ 원형 사진':'🖼 사진',text:'🔤 '+String(L.text).replace(/\n/g,' ').slice(0,14),bolt:'⚡ 번개',bang:'💬 !! 말풍선',fx:'✨ 효과 '+L.kind,fireE:'🔥 불꽃 양옆',frame:'▭ 테두리'})[L.type];}
function drawLayers(){
  const ol=$('#layerlist');ol.replaceChildren();
  [...st.L.keys()].reverse().forEach(i=>{const li=document.createElement('li');li.textContent=layerName(st.L[i]);if(i===sel)li.className='on';li.onclick=()=>select(i);ol.append(li);});
}
function select(i){sel=i;render();inspector();}

/* ── 드래그 ── */
let drag=null;
stage.addEventListener('pointerdown',e=>{
  const el=e.target.closest('.L');if(!el){select(-1);return;}
  const i=+el.dataset.i;if(i!==sel)select(i);
  const L=st.L[i];const r=stage.getBoundingClientRect();
  drag={i,sx:e.clientX,sy:e.clientY,w:r.width,h:r.height,o:{x:L.x,y:L.y,px:L.px,py:L.py,top:L.top,bottom:L.bottom}};
  stage.setPointerCapture(e.pointerId);e.preventDefault();
});
stage.addEventListener('pointermove',e=>{
  if(!drag)return;const L=st.L[drag.i];const dx=(e.clientX-drag.sx)/drag.w*100,dy=(e.clientY-drag.sy)/drag.h*100;
  if(L.type==='panel'){L.px=clamp(drag.o.px-dx,0,100);L.py=clamp(drag.o.py-dy,0,100);}
  else if(L.type==='bolt'){L.top=clamp(drag.o.top+dx,5,95);L.bottom=clamp(drag.o.bottom+dx,5,95);}
  else if('x' in L){L.x=clamp(drag.o.x+dx,-20,120);L.y=clamp(drag.o.y+dy,-20,120);}
  render();
});
stage.addEventListener('pointerup',()=>{if(drag){drag=null;inspector();}});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,+(+v).toFixed(1)));

/* ── 속성 패널 ── */
const SCHEMA={
 text:[['g','글씨'],['text','문구 (*강조* · 줄바꿈 가능)','area'],['font','폰트','font'],['size','크기',1.5,20,.1],['fill','글자색','color'],['acc','*강조* 색','color'],['grad','세로 그라데이션','chk'],['fill2','아래쪽 색','color'],['gstop','위 색 비율',0,95,1],['stroke','외곽선 색','color'],['sw','외곽선 두께',0,40,1],['ls','자간',-10,40,1],['skew','기울임',-25,25,1],['r','회전',-45,45,1],
   ['g','그림자 · 박스'],['shadow','그림자','chk'],['sc','그림자 색','color'],['sx','그림자 X',-2,2,.05],['sy','그림자 Y',-2,2,.05],['box','박스 배경','chk'],['boxc','박스 색','color'],['boxb','박스 테두리','color'],
   ['g','아치 (ㅋㅋㅋ)'],['arc','아치로 휘기','chk'],['a0','시작 각도',-120,0,1],['a1','끝 각도',0,120,1],['rad','반지름',4,40,.5],
   ['g','솟는 글씨'],['rise','아래서 솟기 (원근+불빛)','chk'],['rdeg','눕힘 각도',0,50,1],['op','불투명도',10,100,1]],
 img:[['g','사진'],['w','크기',5,120,.5],['r','회전',-45,45,1],['flip','좌우 반전','chk'],['op','불투명도',10,100,1],['cut','','cut'],
   ['g','원형 인셋'],['circ','원형으로','chk'],['bw','테두리 두께',0,3,.1],['bc','테두리 색','color'],
   ['g','아우라 · 외곽선 (누끼 후)'],['aura','아우라','chk'],['ac','아우라 색','color'],['as','번짐 크기',.2,5,.1],['an','겹침(세기)',1,6,1],['out','외곽선','chk'],['oc','외곽선 색','color'],['ow','외곽선 두께',.1,1.5,.05]],
 panel:[['g','사진 패널'],['side','위치','side'],['zoom','확대',100,300,1],['px','좌우 위치',0,100,1],['py','상하 위치',0,100,1],['op','불투명도',10,100,1],['cut','','cut']],
 bolt:[['g','번개'],['top','위쪽 끝 X',5,95,.5],['bottom','아래쪽 끝 X',5,95,.5],['w','굵기',2,20,.5],['color','번개 색','color'],['stroke','외곽선 색','color']],
 bang:[['g','!! 말풍선'],['text','글자','text'],['w','크기',5,40,.5],['r','회전',-45,45,1]],
 fx:[['g','효과'],['kind','종류','fxkind'],['w','크기',3,60,.5],['r','회전',-180,180,1],['flip','좌우 반전','chk'],['op','불투명도',10,100,1]],
 fireE:[['g','불꽃 양옆'],['side','위치','fside'],['w','폭',5,35,.5],['op','불투명도',10,100,1]],
 frame:[['g','테두리'],['color','색','color'],['w','두께',.2,4,.1]]
};
function inspector(){
  const box=$('#inspbody');
  if(sel<0||!st.L[sel]){box.innerHTML=`<h3>배경</h3>${bgControls()}<p class="hint">화면의 글씨·사진을 누르면 여기서 바로 바꿀 수 있습니다. 끌면 위치가 움직입니다. 사진 패널은 끌면 사진 안쪽이 움직입니다.</p>`;wireBg();return;}
  const L=st.L[sel];let h=`<h3>${esc(layerName(L))}</h3><div class="row"><button class="b s" data-act="up">앞으로</button><button class="b s" data-act="down">뒤로</button><button class="b s" data-act="dup">복제</button><button class="b s" data-act="del">삭제</button></div>`;
  for(const s of SCHEMA[L.type]){
    const [k,lab,a,b,c]=s;
    if(k==='g'){h+=`<div class="grp">${lab}</div>`;continue;}
    if(a==='area')h+=`<label style="grid-template-columns:1fr">${lab}<textarea rows="2" data-k="${k}">${esc(L[k])}</textarea></label>`;
    else if(a==='text')h+=`<label>${lab}<input type="text" data-k="${k}" value="${esc(L[k])}"><span></span></label>`;
    else if(a==='font')h+=`<label>${lab}<select data-k="${k}">${FONTS.map(f=>`<option ${f===L[k]?'selected':''} style="font-family:'${f}'">${f}</option>`).join('')}</select><span></span></label>`;
    else if(a==='side')h+=`<label>${lab}<select data-k="${k}">${[['all','전체'],['left','번개 왼쪽'],['right','번개 오른쪽']].map(([v,t])=>`<option value="${v}" ${v===L[k]?'selected':''}>${t}</option>`).join('')}</select><span></span></label>`;
    else if(a==='fside')h+=`<label>${lab}<select data-k="${k}">${[['both','양쪽'],['left','왼쪽'],['right','오른쪽']].map(([v,t])=>`<option value="${v}" ${v===L[k]?'selected':''}>${t}</option>`).join('')}</select><span></span></label>`;
    else if(a==='fxkind')h+=`<label>${lab}<select data-k="${k}">${['sparkle','flame','burst','lightning','brush-halo'].map(v=>`<option ${v===L[k]?'selected':''}>${v}</option>`).join('')}</select><span></span></label>`;
    else if(a==='chk')h+=`<label class="chk"><input type="checkbox" data-k="${k}" ${L[k]?'checked':''}>${lab}</label>`;
    else if(a==='color')h+=`<label>${lab}<input type="color" data-k="${k}" value="${L[k]}"><output>${L[k]}</output></label><div class="swatches" data-for="${k}">${SW.map(c=>`<button type="button" style="background:${c}" title="${c}" data-c="${c}"></button>`).join('')}</div>`;
    else if(a==='cut')h+=`<div class="grp">자동 누끼</div><button type="button" class="b full hot" data-act="cut">✂ 배경 지우기 (자동 누끼)</button>${L.cut?'<button type="button" class="b full s" data-act="uncut">원본으로 되돌리기</button>':''}<div class="prog" id="prog"></div><p class="hint">처음 한 번은 인공지능 모델(약 40MB)을 내려받아 30초~1분 걸립니다. 사진은 이 컴퓨터 브라우저 안에서만 처리됩니다.</p>`;
    else h+=`<label>${lab}<input type="range" data-k="${k}" min="${a}" max="${b}" step="${c}" value="${L[k]}"><output>${L[k]}</output></label>`;
  }
  box.innerHTML=h;
  box.querySelectorAll('[data-k]').forEach(el=>{
    const k=el.dataset.k;
    const apply=()=>{L[k]=el.type==='checkbox'?el.checked:el.type==='range'?+el.value:el.value;const o=el.parentElement.querySelector('output');if(o)o.textContent=el.value;render();};
    el.addEventListener('input',apply);el.addEventListener('change',apply);
  });
  box.querySelectorAll('.swatches').forEach(sw=>sw.onclick=e=>{const c=e.target.dataset.c;if(!c)return;L[sw.dataset.for]=c;render();inspector();});
  box.querySelectorAll('[data-act]').forEach(b=>b.onclick=()=>act(b.dataset.act));
}
function bgControls(){const b=st.bg;return `<label>위 색<input type="color" data-b="c1" value="${b.c1}"><span></span></label><label>아래 색<input type="color" data-b="c2" value="${b.c2}"><span></span></label><label>각도<input type="range" data-b="angle" min="0" max="360" value="${b.angle}"><output>${b.angle}</output></label><label class="chk"><input type="checkbox" data-b="glowon" ${b.glow?'checked':''}>조명 번짐</label><label>조명 색<input type="color" data-b="glow" value="${b.glow||'#ff6a3d'}"><span></span></label><label>조명 X<input type="range" data-b="glowx" min="0" max="100" value="${b.glowx}"><output>${b.glowx}</output></label><label>조명 Y<input type="range" data-b="glowy" min="0" max="100" value="${b.glowy}"><output>${b.glowy}</output></label>`;}
function wireBg(){$('#inspbody').querySelectorAll('[data-b]').forEach(el=>el.addEventListener('input',()=>{const k=el.dataset.b;if(k==='glowon'){st.bg.glow=el.checked?($('[data-b=glow]').value):'';}else if(k==='glow'){if(st.bg.glow!=='')st.bg.glow=el.value;}else st.bg[k]=el.type==='range'?+el.value:el.value;const o=el.parentElement.querySelector('output');if(o)o.textContent=el.value;render();}));}
function act(a){
  const L=st.L[sel];
  if(a==='del'){st.L.splice(sel,1);sel=-1;}
  else if(a==='dup'){const c=JSON.parse(JSON.stringify(L));if('x' in c){c.x+=3;c.y+=3;}st.L.splice(sel+1,0,c);sel++;}
  else if(a==='up'&&sel<st.L.length-1){[st.L[sel],st.L[sel+1]]=[st.L[sel+1],st.L[sel]];sel++;}
  else if(a==='down'&&sel>0){[st.L[sel],st.L[sel-1]]=[st.L[sel-1],st.L[sel]];sel--;}
  else if(a==='cut'){autoCut(L);return;}
  else if(a==='uncut'){L.cut=null;}
  render();inspector();
}

/* ── 자동 누끼 (@imgly/background-removal, 브라우저 안에서 처리) ── */
let bgLib=null;
async function autoCut(L){
  const prog=$('#prog');const say=t=>{if(prog)prog.textContent=t;};
  try{
    say('누끼 준비 중… (처음엔 모델 다운로드)');
    bgLib=bgLib||await import('https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.5.5/+esm');
    const input=await (await fetch(new URL(L.src,location.href))).blob();
    const blob=await bgLib.removeBackground(input,{publicPath:'https://staticimgly.com/@imgly/background-removal-data/1.5.5/dist/',progress:(k,c,t)=>{if(t)say(`모델 내려받는 중 ${Math.round(c/t*100)}%`);}});
    L.cut=await cleanAlpha(blob);
    if(L.type==='img'&&!L.circ&&!L.aura){L.out=true;}
    say('완료 ✓ 아우라·외곽선을 켜 보세요');render();inspector();toast('누끼 완료');
  }catch(err){console.error(err);say('누끼 실패: '+(err?.message||err)+' — 네트워크 또는 브라우저 메모리를 확인하세요.');}
}

// 배경에 남은 아주 옅은 반투명 픽셀을 0으로 정리 (외곽선·아우라가 네모로 번지는 것 방지)
async function cleanAlpha(blob){
  const im=await createImageBitmap(blob);const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
  const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height);const p=d.data;
  for(let i=3;i<p.length;i+=4){const a=p[i];p[i]=a<60?0:Math.min(255,Math.round((a-60)*1.3));}
  x.putImageData(d,0,0);const out=await new Promise(r=>c.toBlob(r,'image/png'));return URL.createObjectURL(out);
}
/* ── 라이브러리 ── */
const TABS=[['tpl','템플릿'],['face','표정 19'],['el','요소'],['orig','원본 14'],['fx','효과'],['mine','내 사진']];
function drawTabs(){$('.libtabs').innerHTML=TABS.map(([k,t])=>`<button type="button" role="tab" data-t="${k}" aria-selected="${k===tab}">${t}</button>`).join('');
  $('.libtabs').querySelectorAll('button').forEach(b=>b.onclick=()=>{tab=b.dataset.t;drawTabs();drawLib();});}
function drawLib(){
  const lb=$('#libbody');let h='';
  if(tab==='tpl')h=TPL.map(t=>`<button type="button" class="item" data-tpl="${t.key}" aria-pressed="${st.key===t.key}">${t.ref?`<img src="${F(t.ref)}" alt="">`:`<img src="${C('c-shock')}" class="round" alt="">`}<span>${esc(t.name)}</span></button>`).join('')+`<p class="hint wide">템플릿을 누르면 원본 구도로 바로 채워집니다. 아래 「참고 원본」과 위 「겹쳐보기」로 원본과 비교하세요.</p>`;
  if(tab==='face')h=FACES.map(f=>`<button type="button" class="item" data-add-img="${f.file}" data-circ="${f.circle?1:''}" title="${esc(f.expr)}"><img src="${f.file}" class="${f.circle?'round':''}" alt=""><span><b>${f.n}</b> ${esc(f.label)}</span></button>`).join('');
  if(tab==='el')h=CROPS.filter(c=>c.cats.includes('text')||c.cats.includes('etc')||c.cats.includes('sports')).map(c=>`<button type="button" class="item" data-add-img="${c.file}" data-circ="${c.id.startsWith('c-')?1:''}"><img src="${c.file}" alt=""><span>${esc(c.label)}</span></button>`).join('');
  if(tab==='orig')h=['01-1','01-2','01-4','02-1','02-4','03-1','03-4','04-4','05-1','06-1','06-3','07-2','07-3','09-4'].map(id=>`<button type="button" class="item" data-ref="${id}"><img src="${F(id)}" alt=""><span>JTBC ${id}</span></button>`).join('')+`<p class="hint wide">누르면 참고 원본으로 지정됩니다. 「배경으로」는 원본을 통째로 깔아 그 위에 따라 그릴 때 쓰세요. 나머지 22컷은 원본 9장이 있어야 해서 「JTBC 9장 · 36컷」 페이지에서 불러오세요.</p>`;
  if(tab==='fx')h=['sparkle','flame','burst','lightning','brush-halo'].map(k=>`<button type="button" class="item" data-fx="${k}"><img src="${FX}${k}.png" class="round" alt=""><span>${k}</span></button>`).join('')+['text','bolt','bang','fireL','frame'].map(k=>`<button type="button" class="item" data-add="${k}"><span style="font-size:13px;padding:10px 4px">${({text:'＋ 글씨',bolt:'＋ 번개',bang:'＋ !! 말풍선',fireL:'＋ 불꽃 양옆',frame:'＋ 테두리'})[k]}</span></button>`).join('');
  if(tab==='mine')h=`<div class="wide"><label class="b full hot" style="display:block;text-align:center">📸 내 사진 올리기<input type="file" id="up" accept="image/*" multiple hidden></label>
    <label class="hint" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="autocut" checked> 올리면 바로 자동 누끼</label>
    <label class="hint" style="display:flex;gap:6px;align-items:center"><input type="checkbox" id="autoaura"> 누끼 후 아우라 켜기 (리트 만점자형)</label>
    <button type="button" class="b full" id="upref">🖼 참고 사진으로 올리기 (겹쳐보기용)<input type="file" id="upr" accept="image/*" hidden></button>
    <p class="hint">사진은 서버로 올라가지 않고 이 브라우저 안에서만 쓰입니다.</p></div>`;
  lb.innerHTML=h;
  lb.querySelectorAll('[data-tpl]').forEach(b=>b.onclick=()=>loadTpl(b.dataset.tpl));
  lb.querySelectorAll('[data-add-img]').forEach(b=>b.onclick=()=>{st.L.push(I({src:b.dataset.addImg,circ:!!b.dataset.circ,w:b.dataset.circ?34:40,x:50,y:45}));select(st.L.length-1);});
  lb.querySelectorAll('[data-ref]').forEach(b=>b.onclick=()=>{setRef(b.dataset.ref);toast('참고 원본 지정: '+b.dataset.ref);});
  lb.querySelectorAll('[data-fx]').forEach(b=>b.onclick=()=>{st.L.push(FXL({kind:b.dataset.fx}));select(st.L.length-1);});
  lb.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(b.dataset.add));
  const up=$('#up');if(up)up.onchange=async()=>{for(const f of up.files){const L=I({src:URL.createObjectURL(f),w:46,x:35,y:55});st.L.push(L);select(st.L.length-1);if($('#autocut').checked){await autoCut(L);if($('#autoaura').checked){L.aura=true;L.out=false;render();inspector();}}}};
  const ur=$('#upr');if(ur){$('#upref').onclick=e=>{if(e.target!==ur)ur.click();};ur.onchange=()=>{const f=ur.files[0];if(!f)return;st.refUrl=URL.createObjectURL(f);st.ref=null;showRef();};}
}
function add(k){const m={text:()=>T({}),bolt:()=>BOLT({}),bang:()=>BANG({}),fireL:()=>FIRE({}),frame:()=>FRAME({})};st.L.push(m[k]());select(st.L.length-1);}
document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>add(b.dataset.add));
function setRef(id){st.ref=id;st.refUrl=null;showRef();render();}
function showRef(){const img=$('#refimg');const cap=$('#refcap');
  const m=st.ref?MUST.find(x=>x.src===st.ref):null;
  if(st.ref){img.src=F(st.ref);cap.innerHTML=`참고 원본 <b>${st.ref}</b>${m?' · '+esc(m.title):''} <button type="button" class="b s" id="asbg">배경으로 깔기</button>`;}
  else if(st.refUrl){img.src=st.refUrl;cap.textContent='내 참고 사진';}
  else{img.removeAttribute('src');cap.textContent='참고 원본 없음 · 「원본 14」나 「내 사진」에서 지정';}
  const bb=$('#asbg');if(bb)bb.onclick=()=>{st.L.unshift(P({src:F(st.ref),side:'all',py:50,op:100}));sel=0;render();inspector();};
}
function loadTpl(key){const t=TPL.find(x=>x.key===key);if(!t)return;st=JSON.parse(JSON.stringify({bg:t.bg,L:t.L,ref:t.ref,name:t.name,key:t.key}));sel=-1;$('#tplname').textContent=t.name;showRef();render();inspector();drawLib();
  try{const u=new URL(location.href);u.searchParams.set('t',key);history.replaceState(null,'',u);}catch{}}
$('#overlay').oninput=render;

/* ── 프롬프트 · PNG ── */
function promptNow(){
  const m=st.key?MUST.find(x=>x.live===st.key||x.key===st.key):null;
  const texts=st.L.filter(l=>l.type==='text').map(l=>`「${String(l.text).replace(/\*/g,'').replace(/\n/g,' ')}」(${l.font}, 글자 ${l.fill}${l.grad?'→'+l.fill2+' 그라데이션':''}${/\*/.test(l.text)?', 강조어 '+l.acc:''}, 외곽선 ${l.sw>0?l.stroke:'없음'}${l.box?', '+l.boxc+' 박스':''}${l.arc?', 부채꼴 아치':''}${l.rise?', 아래서 솟는 원근':''}, 위치 가로 ${Math.round(l.x)}%·세로 ${Math.round(l.y)}%)`);
  const parts=[];if(st.L.some(l=>l.type==='bolt')){const b=bolt();parts.push(`${b.color} 지그재그 번개가 위(가로 ${b.top}%)에서 아래(가로 ${b.bottom}%)로 화면을 가름`);}
  if(st.L.some(l=>l.type==='img'&&l.circ))parts.push('흰 테두리 원형 인셋 얼굴');
  if(st.L.some(l=>l.type==='img'&&l.aura))parts.push('누끼 인물 뒤에 '+st.L.find(l=>l.aura).ac+' 아우라 빛');
  if(st.L.some(l=>l.type==='fireE'))parts.push('화면 양옆 가장자리에 주황 불꽃');
  if(st.L.some(l=>l.type==='bang'))parts.push('흰 폭발 말풍선 「!!」');
  return (m?m.prompt+'\n\n':'16:9 유튜브 썸네일 (1280×720).\n')+'[현재 편집 설정]\n· 배경: '+st.bg.c1+' → '+st.bg.c2+(st.bg.glow?', '+st.bg.glow+' 조명 번짐':'')+'\n'+(parts.length?'· 구성: '+parts.join(' / ')+'\n':'')+texts.map(t=>'· 글씨 '+t).join('\n');
}
$('#copyPrompt').onclick=async()=>{const t=promptNow();try{await navigator.clipboard.writeText(t);}catch{const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove();}toast('프롬프트 복사됨');};
let h2i=null;
$('#savePng').onclick=async()=>{
  const keep=sel;sel=-1;const ov=$('#overlay').value;$('#overlay').value=0;render();
  try{
    if(!h2i){await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.js';s.onload=ok;s.onerror=no;document.head.append(s);});h2i=window.htmlToImage;}
    await document.fonts.ready;
    const url=await h2i.toPng(stage,{pixelRatio:1280/stage.clientWidth,cacheBust:true});
    const a=document.createElement('a');a.href=url;a.download=(st.key||'thumbnail')+'-1280x720.png';a.click();toast('PNG 저장');
  }catch(e){console.error(e);toast('PNG 저장 실패 — 화면 캡처를 이용하세요');}
  $('#overlay').value=ov;sel=keep;render();
};
let tt;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,1500);}
document.addEventListener('keydown',e=>{if(sel<0||/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;const L=st.L[sel];
  if(e.key==='Delete'||e.key==='Backspace'){act('del');e.preventDefault();return;}
  const d=e.shiftKey?2:.5;const mv={ArrowLeft:[-d,0],ArrowRight:[d,0],ArrowUp:[0,-d],ArrowDown:[0,d]}[e.key];if(mv&&'x' in L){L.x+=mv[0];L.y+=mv[1];render();e.preventDefault();}});

/* ── 시작 ── */
drawTabs();drawLib();
const q=new URLSearchParams(location.search).get('t');
loadTpl(TPL.some(t=>t.key===q)?q:'bolt');
})();
