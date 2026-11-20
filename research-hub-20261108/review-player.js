(()=>{'use strict';let halt;window.reviewPlaylist=(host, tracks, speed=1)=>{
 if(!tracks.length)return;const make=(tag,text)=>{const el=document.createElement(tag);if(text)el.textContent=text;return el};
 const box=make('section');box.className='review-player';box.setAttribute('aria-label','상단 음성 재생');const row=make('div');row.className='review-actions';const status=make('output');status.setAttribute('aria-live','polite');const pick=make('select');pick.setAttribute('aria-label','재생할 음성');const audio=make('audio');audio.controls=true;audio.preload='metadata';let seq=false,i=0;
 const select=(n,play=false)=>{i=n;pick.value=String(i);audio.src=tracks[i].url;audio.defaultPlaybackRate=speed;audio.playbackRate=speed;status.textContent=(seq?'연속 재생 · ':'')+(i+1)+' / '+tracks.length+' · '+tracks[i].title;if(play)audio.play().catch(()=>{status.textContent='재생하지 못했습니다. 연결을 확인하고 다시 눌러 주세요.'})};
 const btn=(text,fn)=>{const b=make('button',text);b.type='button';b.onclick=fn;row.append(b);return b};
 tracks.forEach((t,j)=>{const o=make('option',t.title);o.value=j;pick.append(o)});pick.onchange=()=>{seq=false;select(+pick.value,true)};
 btn('▶ 전체 이어듣기',()=>{seq=true;select(0,true)});btn('정지',()=>{seq=false;audio.pause();if(Number.isFinite(audio.duration))audio.currentTime=0;status.textContent='정지 · '+tracks[i].title});row.append(pick);
 const rates=[1,1.2,1.5,2].map(x=>btn(x+'×',()=>{speed=x;audio.defaultPlaybackRate=x;audio.playbackRate=x;mark()}));const mark=()=>rates.forEach((b,j)=>b.setAttribute('aria-pressed',String([1,1.2,1.5,2][j]===speed)));mark();
 audio.addEventListener('play',()=>{const previous=halt;halt=()=>audio.pause();if(previous&&previous!==audio._halt)previous();audio._halt=halt;document.querySelectorAll('audio').forEach(a=>{if(a!==audio)a.pause()})});
 audio.addEventListener('ended',()=>{if(seq&&i+1<tracks.length)select(i+1,true);else{seq=false;status.textContent='재생 완료 · '+tracks[i].title}});audio.addEventListener('error',()=>{if(audio.isConnected)status.textContent='음성 파일을 불러오지 못했습니다 · '+tracks[i].title});
 box.append(row,audio,status);host.prepend(box);select(0);return {audio,choose(index){seq=false;audio.pause();select(index)},seek(index,seconds){seq=false;if(i!==index)select(index);audio.currentTime=seconds;audio.play().catch(()=>{status.textContent='재생 버튼을 다시 눌러 주세요.'})}};
};})();
