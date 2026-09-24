# -*- coding: utf-8 -*-
"""Shared CSS / JS / static sections for the report."""

CSS = """
:root{--bg:#0f1115;--panel:#171a21;--panel2:#1e222b;--ink:#e9e6df;--muted:#9aa0aa;--line:#2c313b;--accent:#e2b35d;--link:#8fc3ff}
@media (prefers-color-scheme: light){:root:not([data-theme="dark"]){--bg:#f6f3ee;--panel:#fff;--panel2:#f0ece4;--ink:#1d1f23;--muted:#666b73;--line:#ddd6ca;--accent:#b0781c;--link:#1d5fb8}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 "Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif}
a{color:var(--link)}main{max-width:1180px;margin:0 auto;padding:16px}
nav.top{position:sticky;top:0;z-index:5;display:flex;gap:14px;align-items:center;padding:10px 16px;background:var(--panel);border-bottom:1px solid var(--line);flex-wrap:wrap}
nav.top .sp{flex:1}nav.top a{text-decoration:none}
.animal{font-size:13px;color:var(--muted)}.animal input{width:120px;margin-left:6px;padding:4px 8px;border-radius:6px;border:1px solid var(--line);background:var(--panel2);color:var(--ink)}
header{padding:18px 0 8px}h1{font-size:28px;line-height:1.3;margin:4px 0 8px}h2{font-size:20px;margin:0 0 12px;padding-bottom:6px;border-bottom:1px solid var(--line)}
h3{font-size:16px;margin:12px 0 8px}.kicker{color:var(--accent);font-size:12px;letter-spacing:.08em;margin:0}.meta{margin:0;word-break:break-all}
section{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:18px;margin:16px 0}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;margin-top:12px}
.stats div{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:10px 12px}.stats b{display:block;font-size:12px;color:var(--muted)}
.hook{font-size:16px;background:var(--panel2);padding:10px 14px;border-radius:8px;border-left:3px solid var(--accent)}
.formula{list-style:none;padding-left:4px}.formula li,.tech li,.check li,.steps li{margin:4px 0}.cap{color:var(--muted);font-size:13px}.cap i{font-style:normal;padding-left:14px;margin-right:10px;position:relative}
.cap i::before{content:"";position:absolute;left:0;top:4px;width:10px;height:10px;border-radius:2px;background:var(--c)}
svg.timeline{width:100%;height:84px;display:block}.tl-n{font-size:11px;fill:#111;font-weight:700}.tl-t{font-size:10px;fill:var(--muted)}
svg.diff{width:100%;height:90px;display:block;background:var(--panel2);border-radius:8px;margin-top:10px}
.shot{display:grid;grid-template-columns:260px 1fr;gap:16px;padding:16px 0;border-top:1px solid var(--line)}
.shot:first-of-type{border-top:0}.vis{display:flex;flex-direction:column;gap:8px;align-items:flex-start}
.vis img{width:100%;border-radius:8px;border:1px solid var(--line)}.noimg{width:100%;aspect-ratio:9/16;display:grid;place-items:center;text-align:center;padding:14px;
 background:var(--panel2);border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:12px}
svg.grid{width:72px;height:128px}.dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:8px}
.shot table,.cast{width:100%;border-collapse:collapse;font-size:14px}.shot th,.cast th{text-align:left;color:var(--muted);font-weight:500;width:96px;vertical-align:top;padding:4px 8px 4px 0}
.shot td,.cast td{padding:4px 0;border-bottom:1px solid var(--line)}.cast th,.cast td{padding:6px 8px;border-bottom:1px solid var(--line)}
.pr{margin-top:10px;border:1px solid var(--line);border-radius:8px;overflow:hidden}.pr.ani{border-color:var(--accent)}
.pr-h{display:flex;justify-content:space-between;align-items:center;background:var(--panel2);padding:6px 10px;font-size:13px}
.pr pre{margin:0;padding:10px;white-space:pre-wrap;word-break:break-word;font:12.5px/1.55 ui-monospace,Consolas,monospace;max-height:420px;overflow:auto}
button.copy{background:var(--accent);color:#111;border:0;border-radius:6px;padding:3px 10px;font-weight:600;cursor:pointer}
code{font:12.5px ui-monospace,Consolas,monospace;background:var(--panel2);padding:1px 5px;border-radius:4px;word-break:break-word}
.grids{display:grid;gap:10px}.grids img{width:100%;border-radius:8px}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px;background:none;border:0;padding:0}
.card{display:grid;grid-template-columns:96px 1fr;gap:12px;background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:12px;text-decoration:none;color:var(--ink)}
.card img,.card .noimg{width:96px;aspect-ratio:9/16;object-fit:cover;border-radius:8px}.card h3{margin:4px 0;font-size:15px}.card p{margin:2px 0;font-size:13px}
table.guide{width:100%;border-collapse:collapse;font-size:14px}table.guide th,table.guide td{border-bottom:1px solid var(--line);padding:8px;text-align:left;vertical-align:top}
@media (max-width:760px){.shot{grid-template-columns:1fr}.vis{flex-direction:row}.vis img,.vis .noimg{width:60%}h1{font-size:22px}}
"""

JS = """
(function(){
 function apply(v){v=(v||'hamster').trim()||'hamster';
  document.querySelectorAll('[data-tpl]').forEach(function(el){el.textContent=el.getAttribute('data-tpl').split('{ANIMAL}').join(v);});}
 var inp=document.getElementById('animal'),saved=null;
 try{saved=localStorage.getItem('reelAnimal');}catch(e){}
 if(inp){if(saved)inp.value=saved;inp.addEventListener('input',function(){try{localStorage.setItem('reelAnimal',inp.value);}catch(e){}apply(inp.value);});}
 apply(inp?inp.value:(saved||'hamster'));
 document.addEventListener('click',function(e){var b=e.target.closest('button.copy');if(!b)return;
  var t=document.getElementById(b.getAttribute('data-for')).textContent;
  function ok(){b.textContent='복사됨';setTimeout(function(){b.textContent='복사';},1200);}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(ok,fallback);}else{fallback();}
  function fallback(){var ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok();}catch(x){}ta.remove();}});
})();
"""

MODEL_GUIDE = """
<table class="guide"><tr><th>샷 유형</th><th>1순위</th><th>2순위</th><th>이유</th></tr>
<tr><td>대사·립싱크 클로즈업</td><td>Google Veo 계열</td><td>Kling (립싱크 기능) · Seedance</td><td>음성과 입 모양을 함께 생성하거나 후처리 립싱크가 안정적</td></tr>
<tr><td>미세 표정·눈물·감정 연기 CU</td><td>Hailuo (MiniMax)</td><td>Veo · Kling</td><td>얼굴 근육·눈빛 변화 표현이 자연스러운 편 (sickmanai 2위 유형)</td></tr>
<tr><td>물리 액션 (물 튀김·충돌·투척·드래곤 돌진·카메라 낙하)</td><td>Kling</td><td>Seedance</td><td>관성·무게감·모션블러 표현</td></tr>
<tr><td>다인물 와이드·행인·트래킹 워크·연속 샷</td><td>Seedance</td><td>Veo</td><td>멀티샷·카메라 무빙·인물 일관성 (dreamfall 'The Gentleman'이 Seedance 포함 플랫폼 Syntx로 제작)</td></tr>
<tr><td>인서트 (손·카드·컵)</td><td>Kling · Seedance</td><td>이미지 + 약한 모션</td><td>1초 안팎 단순 동작이라 어떤 모델이든 무난, 텍스트(청첩장)는 이미지 단계에서 확정</td></tr>
<tr><td>풍경·안개·유리 반사·실루엣</td><td>Veo</td><td>Seedance</td><td>대기 원근, 빛·반사 표현</td></tr>
<tr><td>첫 프레임 이미지 / 캐릭터 시트</td><td>Higgsfield Soul · Nano Banana(Gemini 이미지) · Seedream · Midjourney</td><td>—</td><td>캐릭터 시트 1장 확정 → 모든 샷에 레퍼런스 = 얼굴·털색 일관성</td></tr></table>
<p class="cap">⚠️ 순위는 2026년 9월 기준 일반적 경향(검증된 벤치마크 아님)이며 버전 업데이트로 바뀝니다. 같은 샷을 2개 모델로 A/B 생성해 고르는 것이 가장 확실합니다.
말씀하신 'MiniMax H3', 'Google 옴니'는 정확한 제품명을 확인하지 못해 각각 Hailuo(MiniMax), Google Veo 계열로 적었습니다. 원본 제작 도구: dreamfall = Higgsfield(ACROSS THE STREET), Syntx(The Gentleman) / sickmanai = Higgsfield 크리에이티브 파트너.</p>
"""

WORKFLOW = """
<ol class="steps">
<li><b>캐릭터 시트 확정</b> — 동물 1종당 정면·측면·전신 1장. 모든 샷 이미지 생성에 레퍼런스로 넣기 (옷·액세서리·털색 고정)</li>
<li><b>샷별 첫 프레임 이미지</b> — 각 페이지 ③ 동물 프롬프트. 3x3 구도 그리드와 위치가 맞는지 확인</li>
<li><b>I2V 영상 생성</b> — 표의 길이 + 0.5초 여유로 생성. 같은 앵글이 이어지는 구간(sickmanai 누운 폰 시점)은 앞 클립의 마지막 프레임을 다음 클립의 첫 프레임으로 사용</li>
<li><b>FFmpeg 1단계</b> — 실측 길이로 자르고 1080×1920·30fps 통일 (90° 샷은 transpose=1)</li>
<li><b>이어 붙이기 + 룩</b> — 하드컷 concat → 색보정·필름 입자·할레이션</li>
<li><b>사운드</b> — BGM(저작권 안전 음원) + 샷별 효과음 adelay + 대사 덕킹 + -14 LUFS</li>
<li><b>HyperFrames로 미세 조정</b> — 자막·타이밍을 Studio 타임라인에서 손보고 check → preview → 승인 후 render</li>
</ol>
<p class="cap">🔴 원곡(Mitski, Piero Piccioni 등)은 저작권 음원이라 그대로 쓰면 수익화·유통 제한 위험. 분위기가 비슷한 라이선스 음원으로 교체하세요. 연령 제한 판정을 받은 원본(수건·노출 암시 장면)은 동물 버전에서 '타월 부리토' 같은 귀여운 연출로 바꿔 안전하게.</p>
"""
