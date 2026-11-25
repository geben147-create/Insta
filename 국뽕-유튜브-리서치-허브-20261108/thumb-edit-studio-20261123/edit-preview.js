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
const query = new URLSearchParams(location.search);
const legacySounds = (window.EDIT_SFX10 || []).map(x=>({...x,n:String(x.n).padStart(2,'0'),collection:'legacy'}));
const softSounds = (window.EDIT_SFX_SOFT || []).map(x=>({...x,n:String(x.n).padStart(2,'0'),collection:'shorts'}));
const allSounds = [...softSounds,...legacySounds];
const sfx = new Map(allSounds.map(x=>[x.n,x]));
let soundCollection = ['shorts','legacy'].includes(query.get('collection')) ? query.get('collection') : 'all';
const collectionCount = kind=>kind==='all'?allSounds.length:allSounds.filter(x=>x.collection===kind).length;
$('#sfx-total').textContent=allSounds.length;
$('#sfx-summary-count').textContent=`새 ${softSounds.length}종 · 기존 ${legacySounds.length}종`;
document.querySelectorAll('[data-count]').forEach(x=>x.textContent=collectionCount(x.dataset.count));
$('#hub-return').hidden=window.top!==window.self;
if(query.get('collection')==='shorts'){$('.app-header h1').textContent='맑은 알림·가벼운 타격 효과음';document.title='맑은 알림·가벼운 타격 효과음 · 허브';}
const voices = [ ['narration','차분한 내레이션','그렇다면, 두 나라의 결과는 어떻게 달랐을까요?'],['news','담담한 기사 낭독','공개된 자료를 기준으로, 결과를 비교해 보겠습니다.'],['comment','자연스러운 댓글 · 공감','직접 보니까, 생각했던 것과 조금 다르네요.'],['comment2','절제된 댓글 · 의견 변화','저는 처음에는 반대였는데, 설명을 듣고 이해됐어요.'] ];
const sceneConfig = {
 hook:['*왜* 결과가 달랐을까요?','dim','cut','outline','stamp',[['02',0],['06',650]]],
 wow:['한국이 *대단하다!*','push','fade','marker','zoom-in',[['07',0],['08',450]]],
 twist:['그런데, *반전*이 있었습니다','gray','wipe','box','zoom-out',[['02',0],['05',650]]],
 stat:['공식 자료를 기준으로 *숫자*를 비교합니다','blur','fade','outline','side',[['06',0],['08',650]]],
 keyword:['이 장면에서 볼 말은 *세계 최초*입니다','dim','cut','marker','typing',[['10',0],['08',1900]]],
 vs:['🇰🇷 한국  *VS*  일본 🇯🇵','push','slide','outline','stamp',[['02',0],['06',650]]],
 comment:['직접 보니까 *생각과 조금 다르네요.*','dim','slide','paper','typing',[['03',0],['10',750]],'comment'],
 news:['*공개된 자료*를 기준으로 보겠습니다','dim','page','paper','side',[['03',0],['09',750]],'news'],
 end:['결국 핵심은 *같은 기준*입니다','pull','fade','neon','bounce',[['08',200]]],
 fact:['확인된 *팩트*만 남깁니다','dim','cut','outline','zoom-in',[['06',0],['08',400]],'narration']
};
const scenes = [...VFX,{key:'fact',name:'🔎 팩트 확인 · 결과 공개',use:'검증한 내용만 짧게 보여줄 때.',font:'G마켓산스',dont:'수치에는 출처·날짜·단위를 표기합니다.'}].map(s=>({...s,config:sceneConfig[s.key]}));
const words = [
 ['한국 · 대단해 · 최초 · 극찬','짧은 팝 또는 맑은 포인트',['07','08']],
 ['한국 VS 일본 · 비교 · 추월','칼 휙 또는 짧은 클릭',['02','06']],
 ['충격 · 경악 · 믿기 어렵다','짧은 칼 휙 · 한 번만',['02','05']],
 ['놀람 · 어? · 깜짝','가벼운 팝',['07','06']],
 ['싫어 · 반대 · 의문','짧은 클릭 · 과장 없이',['06','05']],
 ['한국이 좋다 · 칭찬 · 감동','맑은 딩 · 한 번만',['08','07']],
 ['숫자 · 1위 · 몇 배 · 몇 % · 10년','클릭 · 핵심 수치 도착에 딩',['06','08']],
 ['팩트 · 검증 · 자료 확인','확인 포인트',['06','08']],
 ['결과 · 결론 · 결정적 차이','짧은 딩 또는 팝',['08','07']],
 ['반전 · 밝혀지다 · 그런데 · 뜻밖에','칼 휙 · 종이 찢김',['02','05']],
 ['외신 · 언론 · 기사 · 속보','책장 넘김 · 사진이면 찰칵',['03','04','09']],
 ['댓글 · 공감 · 다른 의견 · 뒤늦은 반응','책장 · 팝 · 타이핑',['03','07','10']],
 ['다음 댓글 · 다음 장면','책장 또는 짧은 휙',['03','04','01']]
];
const state = {scene:null,video:null,transition:null,style:null,motion:null,voice:null,sfx:new Set(),library:new Set()};
const local = new Map(), category = {scene:'장면',video:'영상',transition:'전환',style:'자막 꾸미기',motion:'자막 애니메이션',voice:'목소리',sfx:'효과음',library:'내 음원'};
let run = 0, timers = [], animations = [], audios = [], active, footageURL, activeHasVoice = false;
const row = (kind,id,label,info='',extra='')=>`<div class="row"><button class="play" data-play="${kind}:${escapeHTML(id)}" aria-pressed="false" aria-label="${escapeHTML(label)} 미리보기">▶</button><div><strong>${escapeHTML(label)}</strong><small>${escapeHTML(info)} ${extra}</small></div><label><input type="checkbox" data-pick="${kind}:${escapeHTML(id)}" aria-label="${escapeHTML(label)} 조합에 담기"><span>담기</span></label></div>`;
const soundRow = (n, inWord=false) => {const x=sfx.get(n); if(!x)return ''; return row('sfx',n,`${x.em||'🔊'} ${x.name}`,`${Number(x.duration).toFixed(2)}초 · ${inWord?'효과음만 미리듣기':x.cap}`,inWord?'':`<span class="sound-source"><a href="${escapeHTML(x.url)}" target="_blank" rel="noopener">${escapeHTML(x.author)} · 출처 ↗</a><a class="license-pill" href="${escapeHTML(x.licenseUrl)}" target="_blank" rel="noopener">CC0</a><a href="${escapeHTML(x.asset)}" download>MP3 ↓</a></span>${x.previewNote?`<span class="sound-note">${escapeHTML(x.previewNote)}</span>`:''}`);};
$('#scenes').innerHTML = scenes.map(s=>row('scene',s.key,s.name,s.use)).join('');
for(const [kind,items] of Object.entries(fx)) $('#'+kind).innerHTML=items.map(([id,label,info])=>row(kind,id,label,info)).join('');
$('#voice').innerHTML = voices.map(([id,label,line])=>row('voice',id,label,line)).join('');
for (const tag of new Set(allSounds.map(s=>s.sit).filter(Boolean))) $('#sfx-filter').append(new Option(tag,tag));
function renderSfx(){
 const tag=$('#sfx-filter').value, term=$('#sfx-search').value.trim().toLocaleLowerCase('ko');
 const collection=allSounds.filter(x=>soundCollection==='all'||x.collection===soundCollection);
 const filtered=collection.filter(x=>(!tag||tag===x.sit)&&(!term||[x.name,x.cap,x.sit,...(Array.isArray(x.keywords)?x.keywords:[])].join(' ').toLocaleLowerCase('ko').includes(term)));
 $('#sfx').innerHTML=filtered.length?filtered.map(x=>soundRow(x.n)).join(''):'<div class="sound-empty">일치하는 소리가 없습니다. 검색어 또는 상황 필터를 바꿔 보세요.</div>';
 $('#sfx-result').textContent=`${filtered.length} / ${collection.length}종 표시 · ▶ ${$('#sfx-with-visual').checked?'소리와 움직임 비교':'효과음만 재생'}`;
 document.querySelectorAll('[data-collection]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.collection===soundCollection)));
 sync();
}
const research=window.EDIT_SFX_RESEARCH;
$('#source-research').innerHTML=research?`<ul>${research.sources.map(x=>`<li><a href="${escapeHTML(x.url)}" target="_blank" rel="noopener">${escapeHTML(x.title)} ↗</a><br>${escapeHTML(x.summary)}</li>`).join('')}</ul><p>${escapeHTML(research.distribution_note)}</p>`:'';
$('#words').innerHTML=words.map(([term,desc,ids])=>`<div class="word-line"><button type="button" class="play" data-play="sfx:${ids[0]}" aria-label="${escapeHTML(term)} 대표 효과음 재생" aria-pressed="false">▶</button><details class="word"><summary>${escapeHTML(term)}</summary><small>${escapeHTML(desc)} · 비교할 다른 효과음</small>${ids.map(n=>soundRow(n,true)).join('')}</details></div>`).join('');
const presets = id=>scenes.find(s=>s.key===id);
const def = (kind,id)=>fx[kind]?.find(v=>v[0]===id);
function describe(kind,id){return kind==='scene'?presets(id)?.name:kind==='voice'?voices.find(v=>v[0]===id)?.[1]:kind==='sfx'?`#${id} ${sfx.get(id)?.name||'음원 없음'}`:kind==='library'?local.get(id)?.name:def(kind,id)?.[1];}
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
 const raw=set.sfx?.size?[...set.sfx].map(id=>[id,0]):p?.[5]||[];
 let end=0;
 const sounds=raw.filter(([id])=>sfx.has(id)).map(([id,at])=>{const start=Math.max(at,end);end=start+Math.ceil(sfx.get(id).duration*1000)+100;return [id,start];});
 return {scene:s?.key||null,video:set.video||p?.[1]||null,transition:set.transition||p?.[2]||null,style:set.style||p?.[3]||null,motion:set.motion||p?.[4]||null,voice:set.voice||p?.[6]||null,sounds,library:[...(set.library||[])]};
}
function sync(){
 document.querySelectorAll('[data-pick]').forEach(x=>{const [k,id]=x.dataset.pick.split(':');x.checked=state[k] instanceof Set?state[k].has(id):state[k]===id;});
 document.querySelectorAll('[data-play]').forEach(x=>x.setAttribute('aria-pressed',String(x===active)));
 const picked=Object.entries(state).flatMap(([k,v])=>(v instanceof Set?[...v]:v?[v]:[]).map(id=>`${category[k]}: ${describe(k,id)}`));
 $('#picked').textContent=picked.join(' · ')||'아직 담은 효과가 없습니다.';
 for(const id of ['copy','clear','save-json','save-prompt']) $('#'+id).disabled=!picked.length;
 if(!$('#handoff').hidden) $('#handoff').value=picked.length?handoff():'';
}
function stop(message){
 ++run;timers.forEach(clearTimeout);timers=[];animations.forEach(a=>a.cancel());animations=[];
 audios.forEach(a=>{a.pause();a.removeAttribute('src');a.load();});audios=[];footage.pause();active=null;sync();
 if(message) $('#status').textContent=message;
}
function later(fn,ms){const token=run;timers.push(setTimeout(()=>{if(run===token)fn();},ms));}
function soundVolume(){return Number($('#sfx-volume').value)/100*(activeHasVoice ? 0.5 : 1);}
function playAudio(src, volume, key, name){
 // One current SFX preview; narration remains a separate, quieter-mix comparison track.
 for(const old of audios.filter(a=>a.previewChannel===key)){old.pause();old.currentTime=0;}
 audios=audios.filter(a=>a.previewChannel!==key);
 const audio=new Audio(src);audio.previewChannel=key;audios.push(audio);audio.volume=volume;audio.muted=$('#mute-audio').checked;
 const token=run;audio.play().catch(()=>{if(token===run)$('#status').textContent=`${name} 재생 실패 · 파일이나 브라우저 오디오 설정을 확인하세요.`;});
 if(key==='voice') later(()=>audio.pause(),9000);
 return audio;
}
function playSound(n){const d=sfx.get(n);if(d)playAudio(d.asset,soundVolume(),'sfx',describe('sfx',n));}
function animate(el, options, delay=0){ if(!options)return; const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches; const frames=reduced?options[4].slice(-1):options[4]; animations.push(el.animate(frames,{duration:reduced?1:options[3],delay,fill:'forwards',easing:options[5]||'ease-out'})); }
function play(set, label, button=null){
 stop();active=button;sync();const s=config(set);activeHasVoice=!!s.voice;paint(s);
 const visual=!!(s.scene||s.video||s.transition||s.style||s.motion);
 $('#status').textContent=`재생 중: ${label}${s.voice?' · 목소리 우선 / 효과음 ½ 음량':''}${!visual&&!s.voice?' · 배경음악 없음':''}`;
 if(!visual&&!s.voice){$('#demo-label').textContent='효과음만 미리듣기 · 배경음악 없음';cap.textContent=label;}
 if(visual&&!footage.hidden){footage.currentTime=0;footage.play().catch(()=>{});}
 else if(visual&&!matchMedia('(prefers-reduced-motion: reduce)').matches) animate($('#demo-motion'),[,,,2400,[{transform:'scale(1.13) translateX(-3%)'},{transform:'scale(1.13) translateX(3%)'}]]);
 if(s.video) animate($(s.video==='flash'?'#flash-layer':'#shot-a'),def('video',s.video));
 if(s.transition) animate($('#shot-b'),def('transition',s.transition),s.scene?350:0);
 if(s.motion) animate(cap,def('motion',s.motion));
 if(s.scene==='stat') $('#bars').querySelectorAll('i').forEach((bar,i)=>animate(bar,[,,,680,[{transform:'scaleX(.05)'},{transform:'scaleX(1)'}]],i*120));
 const soundAt = (n,ms)=>ms?later(()=>playSound(n),ms):playSound(n);
 s.sounds.forEach(([n,ms])=>soundAt(n,ms));
 if(s.voice) playAudio(`edit-preview-audio/voice-${s.voice}.mp3`,.9,'voice',describe('voice',s.voice));
 s.library.forEach((id,i)=>{const d=local.get(id); if(d) {const start=()=>{playAudio(d.url,soundVolume(),'sfx',d.name);const a=audios.at(-1);later(()=>a.pause(),10000);};if(i)later(start,i*10000);else start();}});
 const total=Math.max(visual?2500:0,s.sounds.length?Math.max(...s.sounds.map(([id,ms])=>ms+sfx.get(id).duration*1000))+100:0,s.voice?9000:0,s.library.length*10000);
 later(()=>{if(!footage.hidden)footage.pause();active=null;sync();if(!$('#status').textContent.includes('실패')) $('#status').textContent=`미리보기 종료: ${label}`;},total||2500);
}
function handoff(){
 const s=config(state), p=presets(s.scene); const t=typography(p);
 const effect = (k,id)=>{const d=def(k,id);return d?{id,label:d[1],description:d[2],...(d[4]?{durationMs:d[3],keyframes:d[4],easing:d[5]||'ease-out'}:{})}:null;};
 return `아래 조합 그대로 영상 편집에 적용해 주세요. 선택하지 않은 항목은 변경하지 말고, 여기의 예시 문구·수치·댓글은 실제 영상에 복제하지 마세요. 실제 대본과 근거 자료를 사용하세요.\n\n`+JSON.stringify({schema:'kukppong-edit-preview/2',revision:'20261125-sfx-r3',availableSfxCount:allSounds.length,scene:p?{id:p.key,label:p.name,use:p.use,warning:p.dont}:null,ratio:$('#ratio').value,previewTextOnly:$('#sample').value||p?.config[0]||null,typography:t,videoEffect:effect('video',s.video),transition:s.transition?{...effect('transition',s.transition),startMs:s.scene?350:0}:null,captionStyle:effect('style',s.style),captionAnimation:effect('motion',s.motion),voice:s.voice?{id:s.voice,tone:describe('voice',s.voice),example:'미리보기용; 실제 문장은 대본 사용',previewAsset:absolute(`edit-preview-audio/voice-${s.voice}.mp3`)}:null,sfx:s.sounds.map(([n,timeMs])=>{const d=sfx.get(n);return {id:n,referenceName:d.name,sound:d.previewNote||'CC0 배포 음원 편집본 · 공식 HQ MP3 미리듣기 기반',collection:d.collection,matchStatus:d.matchStatus||(d.collection==='shorts'?'요청한 소리 유형의 비교 후보 · 쇼츠 원본과 동일 여부 미확인':null),asset:absolute(d.asset),sourceUrl:d.url,author:d.author,license:d.license,licenseUrl:d.licenseUrl,durationSeconds:d.duration,timeMs,normalizationAlreadyApplied:d.gain,previewVolume:Number($('#sfx-volume').value)/100*(s.voice ? 0.5 : 1),editDescription:d.cut,originalWav:false};}),userAudio:s.library.map(id=>({fileName:local.get(id).name,access:'같은 파일을 편집 프로젝트에 제공해야 함'})),notes:['타이밍은 장면 시작 기준. 대사에 맞게 배치하되 선택한 효과와 순서는 유지.','목소리를 우선하고 효과음은 대사를 덮지 않게 믹싱. 미리보기는 목소리 0.9, 효과음 기본 0.5(목소리 선택 시 0.25). 정규화 gain은 제공 파일에 이미 적용되어 있으므로 다시 적용하지 않기.','기사·댓글·통계에는 실제 자료와 출처를 사용.']},null,2);
}
function absolute(file){return location.hostname==='127.0.0.1'||location.hostname==='localhost'||location.protocol==='file:'?new URL(file,'https://geben147-create.github.io/Insta/'+encodeURIComponent('국뽕-유튜브-리서치-허브-20261108')+'/thumb-edit-studio-20261123/').href:new URL(file,location.href).href;}
$('#sfx-filter').addEventListener('change',renderSfx);
$('#sfx-search').addEventListener('input',renderSfx);
document.querySelectorAll('[data-collection]').forEach(button=>button.addEventListener('click',()=>{soundCollection=button.dataset.collection;$('#sfx-filter').value='';renderSfx();}));
$('#sfx-with-visual').addEventListener('change',()=>{$('#sfx-result').textContent=`${$('#sfx-with-visual').checked?'▶ 소리와 추천 움직임을 함께 비교합니다.':'▶ 효과음만 재생합니다. 배경음악은 없습니다.'}`;});

document.addEventListener('change',e=>{
 if(!e.target.dataset.pick)return;
 const [kind,id]=e.target.dataset.pick.split(':');
 if(state[kind] instanceof Set){e.target.checked?state[kind].add(id):state[kind].delete(id);}else state[kind]=e.target.checked?id:null;
 sync();play(state,'선택 조합 변경 · '+describe(kind,id));
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-play]');if(!b)return;const [k,id]=b.dataset.play.split(':');if(active===b){stop('재생을 멈췄습니다.');return;}
 if(k==='sfx'){const withVisual=$('#sfx-with-visual').checked,visual=withVisual?soundVisual(id):{};play({sfx:new Set([id]),...visual},describe(k,id)+(withVisual?' · 추천 움직임 예시':''),b);return;}
 if(k==='library'){play({library:new Set([id])},describe(k,id),b);return;}
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
function soundVisual(id){
 const map={'01':{transition:'slide'},'02':{transition:'wipe'},'03':{transition:'page'},'04':{transition:'page'},'05':{transition:'wipe'},'06':{motion:'stamp'},'07':{motion:'bounce'},'08':{style:'neon',motion:'zoom-in'},'09':{video:'flash'},'10':{motion:'typing'}};
 if(map[id])return map[id];
 const sound=sfx.get(id),tone=[sound?.sit,sound?.name].join(' ');
 if(/맑|알림|반짝|딩|띠리|띠롱/.test(tone))return {motion:'zoom-in'};
 if(/팝|팡|뿅|통통|띠로/.test(tone))return {motion:'bounce'};
 if(/타격|쿵|충격/.test(tone))return {motion:'stamp'};
 return {motion:'side'};
}
const panel=$('#options'),work=$('.work');
function setPanel(open){panel.hidden=!open;work.classList.toggle('panel-collapsed',!open);$('#show-options').hidden=open;$('#show-options').setAttribute('aria-expanded',String(open));$('#hide-options').setAttribute('aria-expanded',String(open));if(!open)$('#show-options').focus();}
$('#hide-options').onclick=()=>setPanel(false);$('#show-options').onclick=()=>setPanel(true);
document.querySelectorAll('[data-pane]').forEach(button=>button.addEventListener('click',()=>{setPanel(true);const pane=document.querySelector(`.pane[data-kind="${button.dataset.pane}"]`);pane.open=true;const scroller=$('.options-scroll');scroller.scrollTo({top:scroller.scrollTop+pane.getBoundingClientRect().top-scroller.getBoundingClientRect().top,behavior:'auto'});document.querySelectorAll('[data-pane]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
$('#sfx-volume').addEventListener('input',()=>{$('#sfx-volume-output').value=$('#sfx-volume').value+'%';audios.filter(a=>a.previewChannel!=='voice').forEach(a=>a.volume=soundVolume());sync();});
$('#mute-audio').addEventListener('change',()=>audios.forEach(a=>a.muted=$('#mute-audio').checked));
function saveText(name,text,type){const blob=new Blob([text],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('#status').textContent=name+' 저장 완료';}
$('#save-json').onclick=()=>{if($('#save-json').disabled)return;const text=handoff();saveText('video-edit-settings-20261125.json',text.slice(text.indexOf('{')),'application/json');};
$('#save-prompt').onclick=()=>{if(!$('#save-prompt').disabled)saveText('video-edit-prompt-20261125.txt',handoff(),'text/plain;charset=utf-8');};
$('#copy-ui-rule').onclick=async()=>{const text='🌸🌸🌸🌸🌸 미리보기는 화면에 고정하고 설정·전환·효과음은 오른쪽 접이식 패널 안에서만 스크롤되게 해주세요. 어떤 효과를 눌러도 같은 화면에서 즉시 재생 결과가 보여야 하며, 태블릿·모바일에서도 미리보기가 가려지지 않는지 확인해주세요.';try{await navigator.clipboard.writeText(text);$('#status').textContent='미리보기 고정 지시를 복사했습니다.';}catch{$('#handoff').value=text;$('#handoff').hidden=false;$('.basket').open=true;$('#status').textContent='선택 조합 영역의 지시문을 직접 복사하세요.';}};
window.addEventListener('pagehide',()=>stop());
document.querySelectorAll('[data-keyword]').forEach(button=>button.addEventListener('click',async()=>{
 const keyword=button.dataset.keyword;
 try{await navigator.clipboard.writeText(keyword);button.classList.add('copied');$('#status').textContent=`검색어 복사: ${keyword} · YouTube Studio의 음향 효과 검색창에 붙여 넣으세요.`;setTimeout(()=>button.classList.remove('copied'),1500);}
 catch{$('#handoff').value=keyword;$('#handoff').hidden=false;$('.basket').open=true;$('#handoff').focus();$('#handoff').select();$('#status').textContent=`검색어: ${keyword} · 선택 조합 영역에서 직접 복사하세요.`;}
}));
renderSfx();updateType();
if(query.get('panel')){const initialPanel=[...document.querySelectorAll('[data-pane]')].find(x=>x.dataset.pane===query.get('panel'));if(initialPanel)requestAnimationFrame(()=>initialPanel.click());}
if(!allSounds.length)$('#status').textContent='효과음 목록을 불러오지 못했습니다. 페이지를 새로 고침해 주세요.';
else if(query.get('collection')==='shorts'&&!softSounds.length)$('#status').textContent='새 효과음 목록을 불러오지 못했습니다. 전체 모음에서 기존 소리를 듣거나 페이지를 새로 고침해 주세요.';
document.body.dataset.ready='true';
})();
