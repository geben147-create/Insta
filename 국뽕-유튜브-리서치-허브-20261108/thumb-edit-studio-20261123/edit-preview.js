(() => {
'use strict';
const $ = s => document.querySelector(s);
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const stage = $('#stage'), cap = $('#caption'), title = $('#title-zone'), footage = $('#footage');
const fx = {
 video:[['push','느린 카메라 줌인','배경 100% → 116%',850,[{transform:'scale(1)'},{transform:'scale(1.16)'}]],['pull','느린 카메라 줌아웃','배경 118% → 100%',850,[{transform:'scale(1.18)'},{transform:'scale(1)'}]],['gray','흑백 · 톤 다운','채도 0%, 밝기 70%',500,[{filter:'none'},{filter:'grayscale(1) brightness(.7)'}]],['dim','배경 어둡게','밝기 52%, 글씨는 그대로',400,[{filter:'none'},{filter:'brightness(.52)'}]],['blur','배경 블러','블러 5px, 밝기 72%',500,[{filter:'none'},{filter:'blur(5px) brightness(.72)'}]],['flash','짧은 플래시','광량 한 번만',240,[{opacity:0},{opacity:.55,offset:.25},{opacity:0}]]],
 transition:[['cut','하드 컷','A → B 즉시 교체',0,[{opacity:1},{opacity:1}]],['fade','크로스 디졸브','A 위로 B가 천천히 나타남',480,[{opacity:0},{opacity:1}]],['slide','슬라이드','오른쪽에서 B가 밀고 들어옴',480,[{transform:'translateX(100%)',opacity:1},{transform:'translateX(0)',opacity:1}]],['wipe','와이프','왼쪽부터 B가 열림',520,[{clipPath:'inset(0 100% 0 0)',opacity:1},{clipPath:'inset(0 0 0 0)',opacity:1}]],['page','종이 펼침','B 카드가 접혔다 펼쳐짐',590,[{transform:'perspective(700px) rotateY(-90deg)',opacity:.25},{transform:'perspective(700px) rotateY(0)',opacity:1}]],['dip','검정 경유','짧게 어두워진 뒤 B 등장',600,[{opacity:1,filter:'brightness(0)'},{opacity:1,filter:'brightness(1)'}]]],
 style:[['marker','형광펜 강조','별표로 감싼 단어만 노랑'],['neon','네온 밑줄','별표 단어만 하늘색 + 발광'],['outline','굵은 검정 외곽선','복잡한 배경에서 자막 가독성'],['box','빨간 자막 박스','반전·핵심어용'],['paper','연노랑 인용 강조','기사·댓글에서 한 구절만']],
 motion:[['zoom-in','자막 줌인','78% → 110% → 100%',420,[{transform:'scale(.78)',opacity:0},{transform:'scale(1.10)',opacity:1,offset:.65},{transform:'scale(1)',opacity:1}]],['zoom-out','자막 줌아웃','145% → 100%',440,[{transform:'scale(1.45)',opacity:.3},{transform:'scale(1)',opacity:1}]],['bounce','가벼운 바운스','아래 → 위로 한 번 튐',450,[{transform:'translateY(26%)',opacity:0},{transform:'translateY(-11%)',opacity:1,offset:.65},{transform:'translateY(0)',opacity:1}]],['typing','타이핑 느낌','왼쪽부터 짧은 구간으로 드러남',850,[{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],'steps(12,end)'],['stamp','스탬프','165%에서 짧고 굵게 안착',250,[{transform:'scale(1.65)',opacity:0},{transform:'scale(.95)',opacity:1,offset:.6},{transform:'scale(1)',opacity:1}]],['side','옆에서 등장','오른쪽 26% → 중앙',420,[{transform:'translateX(26%)',opacity:0},{transform:'translateX(0)',opacity:1}]]]
};
const sfx = new Map(SFX30.map(x=>[x.n,x]));
const sourceSamples = new Set(['04','15','30']);
const voices = [ ['narration','차분한 내레이션','그렇다면, 두 나라의 결과는 어떻게 달랐을까요?'],['news','담담한 기사 낭독','공개된 자료를 기준으로, 결과를 비교해 보겠습니다.'],['comment','자연스러운 댓글 · 공감','직접 보니까, 생각했던 것과 조금 다르네요.'],['comment2','절제된 댓글 · 의견 변화','저는 처음에는 반대였는데, 설명을 듣고 이해됐어요.'] ];
const sceneConfig = {
 hook:['*왜* 결과가 달랐을까요?','dim','cut','outline','stamp',[['05',110],['06',810]]],wow:['한국이 *대단하다!*','push','fade','marker','zoom-in',[['03',0],['09',470],['11',920]]],twist:['그런데, *반전*이 있었습니다','gray','wipe','box','zoom-out',[['05',0],['14',780],['13',1450]]],stat:['공식 자료를 기준으로 *숫자*를 비교합니다','blur','fade','outline','side',[['18',0],['17',940],['19',1380]]],keyword:['이 장면에서 볼 말은 *세계 최초*입니다','dim','cut','marker','typing',[['19',0],['11',680]]],vs:['🇰🇷 한국  *VS*  일본 🇯🇵','push','slide','outline','stamp',[['21',0],['23',320],['22',920]]],comment:['직접 보니까 *생각과 조금 다르네요.*','dim','slide','paper','typing',[['29',0],['27',490],['30',1520]],'comment'],news:['*공개된 자료*를 기준으로 보겠습니다','dim','page','paper','side',[['24',0],['25',620],['26',1190]],'news'],end:['결국 핵심은 *같은 기준*입니다','pull','fade','neon','bounce',[['09',260],['12',950]]],fact:['확인된 *팩트*만 남깁니다','dim','cut','outline','zoom-in',[['19',120],['17',630]],'narration']
};
const scenes = [...VFX,{key:'fact',name:'🔎 팩트 확인 · 결과 공개',use:'검증한 내용만 짧게 보여줄 때.',font:'G마켓산스',dont:'수치에는 출처·날짜·단위를 표기합니다.'}].map(s=>({...s,config:sceneConfig[s.key]}));
const words = [ ['한국 · 대단해 · 최초 · 극찬','줌인 + 형광펜',['03','09','11']],['한국 VS 일본 · 비교 · 추월','좌우 스와이프 · 수치는 같은 기준',['21','23','22']],['충격 · 경악 · 믿기 어렵다','스탬프 또는 급정지',['06','07','05']],['놀람 · 어? · 깜짝','가벼운 바운스',['01','02','04']],['싫어 · 반대 · 의문','과장 없이 짧게 끊기',['04','08','19']],['한국이 좋다 · 칭찬 · 감동','은은한 반짝임',['11','09','12']],['숫자 · 1위 · 몇 배 · 몇 % · 10년','카운트업 · 출처/단위/날짜 표시',['18','17','20']],['팩트 · 검증 · 자료 확인','확인음 한 번',['19','17']],['결과 · 결론 · 결정적 차이','결론 박스의 핵심어만 강조',['09','12']],['반전 · 밝혀지다 · 그런데 · 뜻밖에','줌아웃 → 전환',['05','13','14']],['외신 · 언론 · 기사 · 속보','종이 펼침 / 셔터는 한 번만',['28','25','24','16']],['댓글 · 공감 · 다른 의견 · 뒤늦은 반응','댓글 등장 후 짧은 여백',['27','30','29','26']],['다음 댓글 · 다음 장면','책장 또는 짧은 휙',['28','15','14']] ];
const state = {scene:null,video:null,transition:null,style:null,motion:null,voice:null,sfx:new Set(),library:new Set()};
const local = new Map(), category = {scene:'장면',video:'영상',transition:'전환',style:'자막 꾸미기',motion:'자막 애니메이션',voice:'목소리',sfx:'효과음',library:'내 음원'};
let run = 0, timers = [], animations = [], audios = [], active, footageURL;
const row = (kind,id,label,info='',extra='')=>`<div class="row"><button class="play" data-play="${kind}:${escapeHTML(id)}" aria-pressed="false" aria-label="${escapeHTML(label)} 미리보기">▶</button><div><strong>${escapeHTML(label)}</strong><small>${escapeHTML(info)} ${extra}</small></div><label><input type="checkbox" data-pick="${kind}:${escapeHTML(id)}" aria-label="${escapeHTML(label)} 조합에 담기"><span>담기</span></label></div>`;
const soundRow = (n, inWord=false) => {const x=sfx.get(n); return row('sfx',n,`#${n} ${x.name}`,inWord?'합성 샘플':`${x.em} ${x.cap} · 합성 샘플`,inWord?'':`· <a href="${escapeHTML(x.url)}" target="_blank" rel="noopener">원본 출처 ↗</a>`);};
$('#scenes').innerHTML = scenes.map(s=>row('scene',s.key,s.name,s.use)).join('');
for(const [kind,items] of Object.entries(fx)) $('#'+kind).innerHTML=items.map(([id,label,info])=>row(kind,id,label,info)).join('');
$('#voice').innerHTML = voices.map(([id,label,line])=>row('voice',id,label,line)).join('');
for (const tag of new Set(SFX30.map(s=>s.sit))) $('#sfx-filter').append(new Option(tag,tag));
function renderSfx(){const tag=$('#sfx-filter').value;$('#sfx').innerHTML=SFX30.filter(s=>!tag||tag===s.sit).map(s=>soundRow(s.n)+(sourceSamples.has(s.n)?row('sfx',`source-${s.n}`,`#${s.n} Freesound 출처 미리듣기`,'Sadiquecat · CC0 1.0 · 합성 소리와 별개'):'' )).join('');sync();}
$('#words').innerHTML=words.map(([term,desc,ids])=>`<div class="word-line"><button type="button" class="play" data-play="sfx:${ids[0]}" aria-label="${escapeHTML(term)} 대표 효과음 재생" aria-pressed="false">▶</button><details class="word"><summary>${escapeHTML(term)}</summary><small>${escapeHTML(desc)} · 비교할 다른 효과음</small>${ids.map(n=>soundRow(n,true)).join('')}</details></div>`).join('');
const presets = id=>scenes.find(s=>s.key===id);
const def = (kind,id)=>fx[kind]?.find(v=>v[0]===id);
function describe(kind,id){return kind==='scene'?presets(id)?.name:kind==='voice'?voices.find(v=>v[0]===id)?.[1]:kind==='sfx'?(id.startsWith('source-')?`#${id.slice(7)} Freesound 원본 프리뷰`: `#${id} ${sfx.get(id)?.name}`):kind==='library'?local.get(id)?.name:def(kind,id)?.[1];}
function typography(scene){return {font:$('#font').value==='장면 기본'?(scene?.font||'시스템 고딕'):$('#font').value,sizePx:+$('#size').value,trackingPx:+$('#spacing').value,lineHeight:+$('#leading').value,referenceWidth:$('#ratio').value==='9:16'?1080:1920};}
function paint(settings={}){
 const scene=presets(settings.scene), t=typography(scene);
 stage.dataset.ratio=$('#ratio').value; title.dataset.layout=scene?.key||'';
 $('#demo-label').textContent = scene ? `${scene.name} · 예시`:'영상·자막 효과 비교 · 예시';
 const text=$('#sample').value.trim() || scene?.config[0] || '숫자 뒤에 숨은 *결과*를 확인합니다';
 cap.innerHTML=escapeHTML(text).replace(/\*([^*]+)\*/g,'<mark>$1</mark>'); cap.dataset.style=settings.style||'';
 cap.style.setProperty('--cap-font',t.font==='시스템 고딕'?'system-ui,sans-serif':`"${t.font}",system-ui,sans-serif`);
 cap.style.setProperty('--cap-size',`${100*t.sizePx/t.referenceWidth}cqw`);cap.style.setProperty('--cap-space',`${100*t.trackingPx/t.referenceWidth}cqw`);cap.style.setProperty('--cap-leading',t.lineHeight);
}
function config(set){
 const s=presets(set.scene), p=s?.config;
 return {scene:s?.key||null,video:set.video||p?.[1]||null,transition:set.transition||p?.[2]||null,style:set.style||p?.[3]||null,motion:set.motion||p?.[4]||null,voice:set.voice||p?.[6]||null,sounds:set.sfx?.size?[...set.sfx].map((id,i)=>[id,150+i*650]):p?.[5]||[],library:[...(set.library||[])]};
}
function sync(){
 document.querySelectorAll('[data-pick]').forEach(x=>{const [k,id]=x.dataset.pick.split(':');x.checked=state[k] instanceof Set?state[k].has(id):state[k]===id;});
 document.querySelectorAll('[data-play]').forEach(x=>x.setAttribute('aria-pressed',String(x===active)));
 const picked=Object.entries(state).flatMap(([k,v])=>(v instanceof Set?[...v]:v?[v]:[]).map(id=>`${category[k]}: ${describe(k,id)}`));
 $('#picked').textContent=picked.join(' · ')||'아직 담은 효과가 없습니다.';
 for(const id of ['copy','clear']) $('#'+id).disabled=!picked.length;
 if(!$('#handoff').hidden) $('#handoff').value=picked.length?handoff():'';
}
function stop(message){
 ++run;timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];
 audios.forEach(a=>{a.pause();a.removeAttribute('src');a.load();});audios=[];footage.pause();active=null;sync();
 if(message) $('#status').textContent=message;
}
function later(fn,ms){const token=run;timers.push(setTimeout(()=>{if(run===token)fn();},ms));}
function playAudio(src, volume, key, name){
 const audio=new Audio(src);audios.push(audio);audio.volume=volume;
 const token=run;audio.play().catch(()=>{if(token===run)$('#status').textContent=`${name} 재생 실패 · 파일이나 브라우저 오디오 설정을 확인하세요.`;});
 if(key==='voice') later(()=>audio.pause(),9000);
}
function playSound(n){ playAudio(`edit-preview-audio/${n}.mp3`,.58,'sfx',describe('sfx',n)); }
function animate(el, options, delay=0){ if(!options)return; const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches; const frames=reduced?options[4].slice(-1):options[4]; animations.push(el.animate(frames,{duration:reduced?1:options[3],delay,fill:'forwards',easing:options[5]||'ease-out'})); }
function play(set, label, button=null){
 stop();active=button;sync();const s=config(set);paint(s);$('#status').textContent=`재생: ${label}`;
 if(!footage.hidden){footage.currentTime=0;footage.play().catch(()=>{});}
 else if(!matchMedia('(prefers-reduced-motion: reduce)').matches) animate($('#demo-motion'),[,,,2400,[{transform:'scale(1.13) translateX(-3%)'},{transform:'scale(1.13) translateX(3%)'}]]);
 if(s.video) animate($(s.video==='flash'?'#flash-layer':'#shot-a'),def('video',s.video));
 if(s.transition) animate($('#shot-b'),def('transition',s.transition),set.scene&&set.scene!=='twist'?1500:850);
 if(s.motion) animate(cap,def('motion',s.motion));
 if(s.scene==='stat') $('#bars').querySelectorAll('i').forEach((bar,i)=>animate(bar,[,,,680,[{transform:'scaleX(.05)'},{transform:'scaleX(1)'}]],i*120));
 const soundAt = (n,ms)=>ms?later(()=>playSound(n),ms):playSound(n);
 s.sounds.forEach(([n,ms])=>soundAt(n,ms));
 if(s.voice) playAudio(`edit-preview-audio/voice-${s.voice}.mp3`,.74,'voice',describe('voice',s.voice));
 s.library.forEach((id,i)=>{const d=local.get(id); if(d) {const start=()=>{playAudio(d.url,.57,'library',d.name);const a=audios.at(-1);later(()=>a.pause(),10000);};if(i)later(start,i*10000);else start();}});
 const visual=!!(s.scene||s.video||s.transition||s.style||s.motion);
 const total=Math.max(visual?2500:0,s.sounds.length?Math.max(...s.sounds.map(x=>x[1]))+3200:0,s.voice?7600:0,s.library.length*10000);
 later(()=>{if(!footage.hidden)footage.pause();active=null;sync();if(!$('#status').textContent.includes('실패')) $('#status').textContent=`미리보기 종료: ${label}`;},total||2500);
}
function handoff(){
 const s=config(state), p=presets(s.scene); const t=typography(p);
 const effect = (k,id)=>{const d=def(k,id);return d?{id,label:d[1],description:d[2],...(d[4]?{durationMs:d[3],keyframes:d[4],easing:d[5]||'ease-out'}:{})}:null;};
 return `아래 조합 그대로 영상 편집에 적용해 주세요. 선택하지 않은 항목은 변경하지 말고, 여기의 예시 문구·수치·댓글은 실제 영상에 복제하지 마세요. 실제 대본과 근거 자료를 사용하세요.\n\n`+JSON.stringify({schema:'kukppong-edit-preview/1',scene:p?{id:p.key,label:p.name,use:p.use,warning:p.dont}:null,ratio:$('#ratio').value,previewTextOnly:$('#sample').value||p?.config[0]||null,typography:t,videoEffect:effect('video',s.video),transition:s.transition?{...effect('transition',s.transition),startMs:s.scene&&s.scene!=='twist'?1500:850}:null,captionStyle:effect('style',s.style),captionAnimation:effect('motion',s.motion),voice:s.voice?{id:s.voice,tone:describe('voice',s.voice),example:'미리보기용; 실제 문장은 대본 사용',previewAsset:absolute(`edit-preview-audio/voice-${s.voice}.mp3`)}:null,sfx:s.sounds.map(([n,timeMs])=>{const external=n.startsWith('source-');const d=sfx.get(external?n.slice(7):n);return {id:n,referenceName:d.name,sound:external?'Freesound CC0 프리뷰 · Sadiquecat':'자체 합성 샘플 (출처 원본 아님)',asset:absolute(`edit-preview-audio/${n}.mp3`),referenceSource:d.url,timeMs,startingGain:d.gain,referenceCut:d.cut};}),userAudio:s.library.map(id=>({fileName:local.get(id).name,access:'같은 파일을 편집 프로젝트에 제공해야 함'})),notes:['타이밍은 장면 시작 기준. 대사에 맞게 배치하되 선택한 효과와 순서는 유지.','목소리를 우선하고 효과음은 대사를 덮지 않게 믹싱.','기사·댓글·통계에는 실제 자료와 출처를 사용.']},null,2);
}
function absolute(file){return location.hostname==='127.0.0.1'||location.hostname==='localhost'||location.protocol==='file:'?new URL(file,'https://geben147-create.github.io/Insta/'+encodeURIComponent('국뽕-유튜브-리서치-허브-20261108')+'/thumb-edit-studio-20261123/').href:new URL(file,location.href).href;}
$('#sfx-filter').addEventListener('change',renderSfx);
document.addEventListener('change',e=>{
 if(!e.target.dataset.pick)return;
 const [kind,id]=e.target.dataset.pick.split(':');
 if(state[kind] instanceof Set){e.target.checked?state[kind].add(id):state[kind].delete(id);}else state[kind]=e.target.checked?id:null;
 sync();
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(!b)return;const [k,id]=b.dataset.play.split(':');if(active===b){stop('재생을 멈췄습니다.');return;}
 if(k==='sfx'||k==='library'){play({[k]:new Set([id])},describe(k,id),b);return;}
 play({[k]:id},describe(k,id),b);
});
$('#play-combo').onclick=()=>play(state,Object.values(state).some(v=>v instanceof Set?v.size:v)?'선택한 조합':'기본 화면');
$('#stop').onclick=()=>stop('재생을 멈췄습니다.');
$('#clear').onclick=()=>{Object.keys(state).forEach(k=>{if(state[k] instanceof Set)state[k].clear();else state[k]=null;});stop('선택을 비웠습니다.');$('#handoff').hidden=true;paint();};
$('#copy').onclick=async()=>{if($('#copy').disabled)return;const el=$('#handoff');el.value=handoff();el.hidden=false;try{await navigator.clipboard.writeText(el.value);}catch{el.focus();el.select();try{if(!document.execCommand('copy'))throw Error();}catch{ $('#status').textContent='자동 복사를 하지 못했습니다. 아래 선택된 글을 직접 복사하세요.';return; }}$('#status').textContent='Claude 편집 지시문을 복사했습니다.';};
for(const id of ['ratio','font','size','spacing','leading','sample']) $('#'+id).addEventListener('input',updateType);
function updateType(){for(const [k,u] of [['size','px'],['spacing','px'],['leading','배']]) $('#'+k).parentElement.querySelector('output').value=$('#'+k).value+u;paint(config(state));sync();}
$('#footage-input').onchange=e=>{const f=e.target.files[0];if(!f)return;if(footageURL)URL.revokeObjectURL(footageURL);footageURL=URL.createObjectURL(f);footage.src=footageURL;footage.hidden=false;$('#shot-a .shot-label').textContent='A · 내 영상';footage.onerror=()=>{$('#status').textContent='이 영상 형식은 브라우저에서 재생할 수 없습니다.';footage.hidden=true;$('#shot-a .shot-label').textContent='A · 예시 화면';};};
$('#library-input').onchange=e=>{stop();local.forEach(x=>URL.revokeObjectURL(x.url));local.clear();state.library.clear();Array.from(e.target.files).forEach((f,i)=>local.set(String(i),{name:f.name,url:URL.createObjectURL(f)}));$('#library').innerHTML=[...local].map(([id,entry])=>row('library',id,entry.name,'내 파일 · 첫 10초 비교')).join('');sync();};
renderSfx();updateType();
})();
