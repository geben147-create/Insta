/* 긴 문서형 하위 페이지 (작업 기록 · 영상편집 마스터 계획 · 효과음) */
const PUB = 'https://geben147-create.github.io/Insta/';
const HTML = {};

HTML.status = `
<h2 id="check">✅ 요청 점검표 (2026-11-23 기준)</h2>
<div class="statusgrid">
 <div class="s"><b class="ok">완료 · 이번 작업</b>썸네일 / 영상편집·자막을 한 페이지 안에서 상단 탭 2개로 분리, 각 탭 안에 왼쪽 하위 메뉴</div>
 <div class="s"><b class="ok">완료 · 이번 작업</b>허브 왼쪽 맨 위에 빨간 배경 메뉴 「썸네일 · 영상편집」 추가, 흩어져 있던 노란 메뉴 9개를 이 안으로 이동 (기존 링크는 그대로 동작)</div>
 <div class="s"><b class="ok">완료 · 이번 작업</b>미리보기가 위로 밀려 안 보이던 문제 수정 — 글씨 8종 편집기 · 썸네일 레이어 실험실 · 영상편집 실험실 모두 미리보기를 조절 패널 옆(좁은 화면은 위)에 고정</div>
 <div class="s"><b class="ok">완료 · 이번 작업</b>말씀하신 필수 장면 13가지를 맨 위에 정리 (번개 분할 · 빨간 입술 · 강아지 · 불꽃 · 원형 · 충격 · 솟는 글씨 · ㅋㅋㅋ · 웃음 · 스포츠 · 기타)</div>
 <div class="s"><b class="ok">완료 · 이번 작업</b>표정·요소 37컷을 잘라 저장 (원형 5컷은 투명 PNG). 원본 9장을 직접 불러와야만 보이던 문제 → 필수 14컷은 이제 바로 보임</div>
 <div class="s"><b class="ok">완료 · 이번 작업</b>번개 분할 · 솟는 금색 글씨 · ㅋㅋㅋ 아치 · 충격 원형을 글씨·색 바꿔 보는 실시간 재현판 + 프롬프트 복사</div>
 <div class="s"><b class="mid">부분</b>36컷 중 필수 14컷만 사진이 바로 보임. 나머지 22컷은 「JTBC 9장 · 36컷」 페이지에서 원본 9장 불러오기 필요 (원본 파일이 이 컴퓨터에 없음)</div>
 <div class="s"><b class="no">미구현</b>인물 자동 누끼(배경 제거). 지금은 배경을 지운 투명 PNG를 올리면 외곽광만 적용됩니다</div>
 <div class="s"><b class="no">미확인</b>카카오톡에서 예전에 추출한 실제 HEX로 공통 네온 팔레트 교체 — 원본 값을 아직 못 찾음</div>
 <div class="s"><b class="no">미완료</b>효과음 30개 실제 청취·다운로드 링크·라이선스 검증 (아래 프롬프트 B로 진행)</div>
 <div class="s"><b class="no">미완료</b>Pinterest 레퍼런스 30개 비교표 (프롬프트 C로 진행)</div>
 <div class="s"><b class="no">미업로드</b>영상편집 실험실 때 첨부한 새 사진 10장 — 기존 방송 레퍼런스 8장만 재사용됨</div>
 <div class="s"><b class="mid">미확인</b>영상편집 9:16 세로 화면 지원 여부 (프롬프트 A 요구) — 실험실은 16:9 기준</div>
</div>`;

HTML.tlog = `
<div class="page">
<h1>📋 썸네일 작업 기록 · 점검표</h1>
<p class="lead">이전 대화(ChatGPT · Codex)에서 만든 결과를 빠짐없이 한곳에 모았습니다. 링크는 모두 공개 GitHub Pages 주소입니다.</p>
<div class="jump"><a href="#check">점검표</a><a href="#t1">1. 썸네일 디자인 분해</a><a href="#t2">2. 레이어 실험실 업로드</a><a href="#t3">3. 눈누 폰트</a><a href="#t4">4. 글씨 8종 수정 기록</a><a href="#t5">5. 텍스트 가이드 업로드</a><a href="#t6">6. 확인 결과 · 코덱스 수정 프롬프트</a></div>
${HTML.status}

<h2 id="t1">🎨 1. 썸네일 디자인 분해 결과</h2>
<p>사진을 <b>글씨 · 색상 · 누끼 · 화살표 · 배경 · 테두리</b>로 나눠 편집 요소로 분류했습니다. 색은 스크린샷 기준 근사값이며 원본 제작 파일의 정확한 값은 아닙니다.</p>
<div class="tblwrap"><table><tr><th>디자인 요소</th><th>색상 코드</th><th>재현 방법</th></tr>
<tr><td>🔥 NO!!</td><td><span class="chip" data-hex="#F22B15"><i style="background:#F22B15"></i>#F22B15</span></td><td>빨강 그라데이션 + 기울임 + 검정 외곽선</td></tr>
<tr><td>🟡 추격자 해외반응</td><td><span class="chip" data-hex="#FFE713"><i style="background:#FFE713"></i>#FFE713</span></td><td>노랑·금색 + 검정·짙은 빨강 이중 테두리</td></tr>
<tr><td>🔴 썸네일 뒤 빨간색</td><td><span class="chip" data-hex="#C30E0C"><i style="background:#C30E0C"></i>#C30E0C</span></td><td>인물 누끼에 외곽광과 그림자</td></tr>
<tr><td>💗 이슈 PICK</td><td><span class="chip" data-hex="#F000D0"><i style="background:#F000D0"></i>#F000D0</span></td><td>형광 분홍 사각형 배지</td></tr>
<tr><td>🩵 인물 윤곽선</td><td><span class="chip" data-hex="#53DFD4"><i style="background:#53DFD4"></i>#53DFD4</span></td><td>인물 분리 후 청록색 외곽광</td></tr>
<tr><td>🏆 억대 연봉</td><td><span class="chip" data-hex="#E7B318"><i style="background:#E7B318"></i>#E7B318</span></td><td>황금 그라데이션 + 검정 입체 그림자</td></tr>
<tr><td>🚨 경고 테두리</td><td><span class="chip" data-hex="#FFED00"><i style="background:#FFED00"></i>#FFED00</span></td><td>노랑·검정 45도 사선 반복</td></tr>
<tr><td>🟥 수능, 이대로 치르겠다고?</td><td><span class="chip" data-hex="#F01515"><i style="background:#F01515"></i>#F01515</span></td><td>선명한 빨강 + 검정 배경 및 그림자</td></tr></table></div>
<p><b>빨간 화살표</b>는 손그림 루프형 곡선 화살표입니다. 오른쪽에서 한 바퀴 말린 뒤 왼쪽을 가리키며, 직선 화살표나 말풍선과는 다릅니다.<br><b>누끼</b>는 인물과 배경을 분리하는 작업이며, 누끼 바깥에 청록색 또는 빨간색 윤곽광을 추가해야 사진처럼 구현됩니다.</p>

<h2 id="t2">✅ 2. 썸네일 레이어 실험실 GitHub 업로드</h2>
<p><a href="${PUB}research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/" target="_blank" rel="noopener">🎨 새 썸네일 실시간 편집기 열기</a> · <a href="https://github.com/geben147-create/Insta/blob/main/research-hub-20261108/broadcast-font-subtitle-master-20261121/thumbnail-layer-lab-20261123/index.html" target="_blank" rel="noopener">GitHub 실제 코드</a> · 이 스튜디오 왼쪽 메뉴 「썸네일 레이어 실험실」에서도 열립니다.</p>
<div class="tblwrap"><table><tr><th>편집 기능</th><th>구현</th></tr>
<tr><td>썸네일 템플릿</td><td>7종 클릭 전환</td></tr><tr><td>글씨·폰트 실시간 변경</td><td>10개 서체 후보</td></tr><tr><td>색상 코드</td><td>HEX 확인·클릭 적용·복사</td></tr><tr><td>글자 크기·자간·기울기</td><td>슬라이더</td></tr><tr><td>외곽선·그림자</td><td>개별 변경</td></tr><tr><td>빨간 곡선 화살표</td><td>색상·위치·크기 변경</td></tr><tr><td>인물 누끼</td><td>투명 PNG 업로드·윤곽광 조절 (자동 누끼는 미구현)</td></tr><tr><td>결과물</td><td>1280×720 PNG · 설정 JSON · 브라우저 저장</td></tr></table></div>
<p>사용 순서: 링크 열기 → 왼쪽 템플릿 선택 → 글씨 레이어 클릭 → 폰트·색상 변경 → 미리보기 확인 → PNG 저장.</p>

<h2 id="t3">🔤 3. 눈누 폰트 추천 (재현용 후보)</h2>
<div class="tblwrap"><table><tr><th>용도</th><th>폰트 후보</th></tr>
<tr><td>NO!! 영문</td><td>Bangers, Anton</td></tr>
<tr><td>추격자 해외반응</td><td><a href="https://noonnu.cc/font_page/106" target="_blank" rel="noopener">검은고딕</a> · <a href="https://noonnu.cc/font_page/394" target="_blank" rel="noopener">레코체</a></td></tr>
<tr><td>억대 연봉</td><td><a href="https://noonnu.cc/font_page/805" target="_blank" rel="noopener">강원교육튼튼체</a></td></tr>
<tr><td>손글씨 자막</td><td><a href="https://noonnu.cc/font_page/374" target="_blank" rel="noopener">정선아리랑뿌리체</a> · <a href="https://noonnu.cc/font_page/43" target="_blank" rel="noopener">나눔손글씨붓</a></td></tr></table></div>
<p class="note">원본 폰트가 정확히 무엇인지는 사진만으로 확정할 수 없습니다. 위 목록은 비슷하게 재현하기 위한 후보입니다.</p>

<h2 id="t4">🛠 4. 글씨 8종 편집기 수정 기록 (Codex)</h2>
<ul>
<li>허브로 돌아갈 때 뜨던 404 수정 — 공개 페이지에서 「기존 국뽕 디자인 연구 허브」로 돌아가기 확인.</li>
<li>문구 입력칸에서 글자를 드래그한 뒤 색상 칩을 누르면 선택한 글자만 폰트 3종에서 즉시 바뀜. <code>24625085</code> → RGB 246,250,85 → T08 <code>#F6FA55</code> (「모음」만 노랑, 「블랙박스」는 기존 색 유지).</li>
<li><b>T01·T02</b> 글자 기울기와 줄이 오른쪽으로 올라가는 각도를 따로 조절 · <code>NO!!</code>는 위아래 제목 사이.</li>
<li><b>T03·T04</b> T03 불꽃 + Noto Serif KR Black 비교 후보 · T04 세로 비율 높인 글자, 빨간 핵심 문구, 편집 가능한 「선수 박탈」 박스.</li>
<li><b>T05·T06</b> T05 금색 자막 양옆 반짝이 · T06 정선아리랑뿌리체에 편집 가능한 흰 외곽선, 「한마디로」를 작은 윗줄로 분리.</li>
<li><b>T07·T08</b> T07 작은 「예전에」, 빨간 「풀 파티」, 양옆 번개 · T08 둥근 글꼴 후보(카페24 써라운드, 주아), 「스페셜」 박스와 경고 테두리.</li>
<li>SB 어그로 TTF와 투명 효과 PNG는 이 컴퓨터의 <code>~/Pictures/폰트들</code>에 저장 (<code>SB 어그로/SBAggroB.ttf</code>, <code>방송 자막 효과/</code>). 공개 사이트에는 없는 로컬 파일입니다.</li>
<li><b>2026-11-23 이번 수정:</b> 미리보기(폰트 3종)가 사진 아래로 내려가 조절할 때 안 보이던 문제 → 사진·미리보기를 왼쪽에 고정하고 조절 칸을 오른쪽에 둠.</li>
</ul>
<p><a href="${PUB}research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html" target="_blank" rel="noopener">공개 편집기 열기</a> · <a href="${PUB}research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html#T05" target="_blank" rel="noopener">T05 병현표 특급 서비스</a> · <a href="${PUB}research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html#T01" target="_blank" rel="noopener">T01 아저씨 해외반응</a></p>

<h2 id="t5">📤 5. 텍스트형 디자인 가이드 업로드</h2>
<p>참고 사진 8장, 디자인별 무료 폰트 링크 3개씩, 색상 HEX, 글자 크기·굵기·자간·위치·그림자, 복사용 한 줄 프롬프트, 검정·노랑 사선 경고 테두리 템플릿. 기존 자료는 보존하고 새 자료를 맨 위에 넣음.</p>
<p><a href="${PUB}국뽕-유튜브-리서치-허브-20261108/?page=thumbnail-design" target="_top">① 기존 썸네일 디자인 페이지</a> · <a href="${PUB}research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122/guide.html" target="_blank" rel="noopener">② 텍스트 디자인 8종</a> · <a href="https://github.com/geben147-create/Insta/tree/main/research-hub-20261108/broadcast-font-subtitle-master-20261121/typography-refs-20261122" target="_blank" rel="noopener">③ GitHub 원본 사진·HTML·설명</a></p>

<h2 id="t6">🔍 6. 확인 결과 · 코덱스 수정 프롬프트</h2>
<div class="tblwrap"><table><tr><th>확인 항목</th><th>당시 결과</th><th>2026-11-23 현재</th></tr>
<tr><td>GitHub 커밋·푸시</td><td>PASS (80a1893)</td><td>PASS</td></tr>
<tr><td>원본 사진 8장</td><td>PASS</td><td>PASS</td></tr>
<tr><td>병현표 특급 서비스</td><td>T05에 있음</td><td>T05</td></tr>
<tr><td>아저씨 해외반응</td><td>T01에 있음</td><td>T01</td></tr>
<tr><td>클릭 시 실시간 글씨 변경</td><td>미구현</td><td class="ok">구현됨 (이후 Codex)</td></tr>
<tr><td>폰트별 비교 미리보기</td><td>미구현</td><td class="ok">구현됨 + 이번에 옆 고정</td></tr></table></div>
<p>당시 코덱스에 넣으려던 수정 프롬프트 (기록 보존):</p>
<div class="prompt" data-copy>GitHub: geben147-create/Insta

기존 ?page=thumbnail-design 화면을 수정하라.
원본 8장과 기존 페이지·메뉴·파일은 전부 보존한다.

1. T01 아저씨 해외반응, T05 병현표 특급 서비스 포함 8종을 상단 탭으로 즉시 이동.
2. 왼쪽 원본 사진 + 오른쪽 폰트 3종·실시간 미리보기.
3. 폰트 클릭 즉시 변경, 문구·크기·자간·색상·외곽선·그림자·그라데이션 편집.
4. 배경은 투명, 기존 영상 배경색 추출 금지.
5. 모바일 반응형 및 디자인별 프롬프트 한 줄 복사.
6. 기존 폰트 편집 UI 재사용, 중복 코드 최소화.
7. 실제 폰트 로딩과 모든 버튼을 Playwright로 검증.
8. PASS 후 GitHub main에 commit/push, Pages 접속까지 확인.</div>
<button class="btn" data-copybtn>프롬프트 복사</button>
</div>`;

HTML.plan = `
<div class="page">
<h1>🎬🔥🎨✨🇰🇷 국뽕 영상 편집·자막·애니메이션·효과음 마스터 계획</h1>
<p class="lead">추천 방향: 유 퀴즈 온 더 블럭의 깔끔한 강조 자막에 라디오스타의 재치 있는 효과를 일부 결합. 외국인 얼굴과 실제 영상을 살리면서 <b>큰 글씨 → 핵심 단어 강조 → 댓글·언론 → 통계·VS 비교</b>로 이어지는 구성.</p>
<div class="jump"><a href="#p1">① 큰 글씨</a><a href="#p2">② 배경·블러</a><a href="#p3">③ 국기·VS</a><a href="#p4">④ 댓글·언론·그래프</a><a href="#p5">⑤ 키워드 효과</a><a href="#p6">⑥ 네모 박스</a><a href="#p7">⑦ 폰트·크기</a><a href="#p8">⑧ 애니메이션</a><a href="#p9">⑨ 효과음</a><a href="#p10">⑩ 프롬프트 A·B·C</a><a href="#pc">공통 규칙</a><a href="#plab">실험실 요약</a></div>
<p class="note">방송 화면은 디자인 분석용 참고 사례입니다. 실제 편집에는 자체 제작 그래픽을 사용합니다.</p>

<h2 id="p1">① 🎤 외국인 반응 + 초대형 글씨</h2>
<p>유퀴즈: 큰 글씨와 단어별 불꽃 강조 · 라디오스타: 리듬감 있는 글씨와 보조 효과</p>
<div class="tblwrap"><table><tr><th>형식</th><th>적용할 장면</th><th>추천</th></tr>
<tr><td>초대형 한 줄</td><td>"한국이 대단하다!" 같은 강한 반응</td><td>1순위</td></tr>
<tr><td>두 줄 대형 글씨</td><td>감탄과 이유가 함께 나올 때</td><td>2순위</td></tr>
<tr><td>타이핑 자막</td><td>외국인이 실제 발언할 때</td><td>자주</td></tr>
<tr><td>말풍선</td><td>짧은 질문·놀람·의문</td><td>가끔</td></tr>
<tr><td>작은 일반 자막</td><td>설명·번역·인터뷰</td><td>기본</td></tr></table></div>
<p>예시: 화면을 가득 채우는 <b>한국이 대단하다!</b>를 0.4초 안에 크게 등장시키고 핵심 단어에 불꽃 PNG. 일반 인터뷰는 화면을 가리지 않도록 하단 자막. <b>외국인 실제 발언은 말풍선보다 타이핑 자막 1순위</b>, 말풍선은 발언자가 여러 명일 때 구분용.</p>

<h2 id="p2">② 🪟 투명 배경 · 블러 · 글씨 배치</h2>
<p>시안 A · 초대형 키워드: 반투명 흰색 레이어 위에 「한국이 대단하다!」 + 「🔥 놀라움의 순간 🔥」</p>
<div class="tblwrap"><table><tr><th>배경</th><th>시작 설정값</th><th>적용</th></tr>
<tr><td>투명</td><td>배경 없음</td><td>인터뷰·외국인 얼굴</td></tr>
<tr><td>흰색 반투명</td><td>흰색 불투명도 10~20%</td><td>강한 키워드</td></tr>
<tr><td>반투명 + 블러</td><td>블러 6~12px</td><td>복잡한 풍경·그래프</td></tr></table></div>
<p>영상은 계속 재생하고 글씨 배경만 부분적으로 흐리게. 수치는 시안용 초기값이며 실제 영상에서 읽기 쉬운 정도를 보며 조절.</p>

<h2 id="p3">③ 🇰🇷🇯🇵🇨🇳 국기와 VS 비교 화면</h2>
<p>좌측 🇯🇵 일본 비교 영상 · 중앙 <b>VS</b> · 우측 🇰🇷 한국 비교 영상. 비교 요소는 두 나라의 수치·자료를 같은 조건으로 맞춰야 합니다. 국기는 Wikimedia Commons의 한국·일본·중국 SVG 활용. Pinterest에서 VS 디자인 레퍼런스 검색.</p>

<h2 id="p4">④ 💬📰 반응 댓글 · 언론 · 통계 그래프</h2>
<div class="tblwrap"><table><tr><th>화면 유형</th><th>디자인</th><th>애니메이션</th></tr>
<tr><td>💬 해외 댓글</td><td>실제 댓글 카드 + 형광펜</td><td>옆에서 등장</td></tr>
<tr><td>📰 언론 기사</td><td>제목·출처·인용 강조</td><td>종이 펼침</td></tr>
<tr><td>📊 통계 수치</td><td>막대그래프·원형그래프</td><td>숫자 카운트업</td></tr>
<tr><td>📈 변화 추이</td><td>선그래프·화살표</td><td>선이 그려짐</td></tr>
<tr><td>❓ 의문 제기</td><td>커다란 물음표·따옴표</td><td>팝업·바운스</td></tr></table></div>
<p>그래프는 흰색 10% 반투명 또는 부분 블러, 실제 수치·단위·출처·연도 함께 표시. 댓글·기사는 실제 자료만 사용하고, 번역·요약했다면 원문과 구분.</p>

<h2 id="p5">⑤ 🔥✨ 키워드 강조 + 기존 PNG 효과</h2>
<p>이미 제작한 자막용 투명 PNG를 먼저 재활용 (🔥 대단해! 불꽃 강조 · ✦ 놀라운 ✦ 반짝임 강조). 단어 위에만 적용할 효과: <b>불꽃 · 네온 밑줄 · 팡 터짐 · 손그림 동그라미 · 별 반짝임 · 화살표 · 물음표</b>. 화면 전체에 깔지 않고 강조할 단어의 크기와 위치를 따라가게.</p>

<h2 id="p6">⑥ 📦 깔끔한 네모 박스 4종</h2>
<div class="tblwrap"><table><tr><th>박스</th><th>들어갈 내용</th></tr>
<tr><td>❓ 오늘의 질문</td><td>"외국인들은 왜 놀랐을까?"</td></tr>
<tr><td>📌 핵심 사실</td><td>"실제 발표 자료에 따르면…"</td></tr>
<tr><td>🔍 비교 포인트</td><td>"한국 vs 일본, 차이는?"</td></tr>
<tr><td>💡 한 줄 결론</td><td>"결정적인 차이는 기술력"</td></tr></table></div>
<p>이슈 PICK, 외신 반응, 숫자로 보기 같은 소제목도 이 박스를 재활용.</p>

<h2 id="p7">⑦ ✍️ 폰트와 자막 크기 (1920×1080)</h2>
<div class="tblwrap"><table><tr><th>용도</th><th>추천 글꼴</th><th>초기 크기</th></tr>
<tr><td>대형 감탄</td><td>여기어때 잘난체</td><td>110~150px</td></tr>
<tr><td>감성·붓글씨 강조</td><td>정선아리랑체</td><td>90~140px</td></tr>
<tr><td>기본 자막</td><td>가독성 좋은 고딕체</td><td>44~58px</td></tr>
<tr><td>댓글·기사</td><td>본문용 고딕체</td><td>40~54px</td></tr>
<tr><td>VS 글씨</td><td>굵은 디스플레이체</td><td>120~180px</td></tr></table></div>
<p>정선아리랑체 공식 다운로드(정선군청) · 여기어때 잘난체 라이선스 안내 확인 후 기존 자막 규칙과 함께 최종 선정.</p>

<h2 id="p8">⑧ 🟡✨⚡🎞️💛 애니메이션 효과</h2>
<div class="tblwrap"><table><tr><th>효과</th><th>등장 방식</th><th>추천 장면</th></tr>
<tr><td>타이핑</td><td>글자 순서대로 타닥타닥</td><td>외국인 발언</td></tr>
<tr><td>줌인</td><td>작게 → 크게</td><td>"대단해", "충격"</td></tr>
<tr><td>줌아웃</td><td>크게 → 원래 크기</td><td>장면 전환</td></tr>
<tr><td>바운스</td><td>튀어 오르듯 등장</td><td>놀람·감탄</td></tr>
<tr><td>스탬프</td><td>쾅 찍히듯 등장</td><td>결정적 숫자</td></tr>
<tr><td>스와이프</td><td>옆에서 빠르게 이동</td><td>VS 비교</td></tr>
<tr><td>종이 넘김</td><td>페이지 전환</td><td>뉴스·언론</td></tr>
<tr><td>반짝임</td><td>키워드에 짧게 발광</td><td>긍정·성과</td></tr></table></div>
<p class="note">정확한 한국어 타이핑 자막은 편집기의 텍스트 애니메이션으로 만들고, Higgsfield 같은 생성형 영상 도구는 배경 영상과 장면 전환에 우선 활용.</p>

<h2 id="p9">⑨ 🎧🔔 효과음</h2>
<p>상세 배치표는 왼쪽 메뉴 <b>「효과음 배치표」</b>에 정리했습니다. 원칙: 문장마다 넣지 말고 놀람·전환·중요한 숫자·반전에서 짧게, 외국인 원음과 내레이션을 가리지 않게 음량을 낮춤.</p>

<h2 id="p10">⑩ 📋 복사용 프롬프트 3개</h2>
<h3>🎬 프롬프트 A · 영상 편집 디자인 전체 설계</h3>
<div class="prompt" data-copy>🎬 국뽕 유튜브 17분 영상 편집 디자인 시스템 제작

🌸GitHub: https://github.com/geben147-create/Insta
🌸기존 자막 디자인 HTML 작업판
🌸기존 투명 PNG 효과 이미지
🌸기존 폰트·색상·썸네일 참고 자료

위 자료를 먼저 확인하고 중복 제작하지 마.

1. 🔥 초대형 감탄 자막: 한 줄·두 줄·타이핑 3종.
2. 🎤 외국인 발언: 원본 영상 위에 핵심 키워드 등장.
3. 🇰🇷 국가별 국기: 한국·일본·중국.
4. ⚔️ VS 비교: 화면 좌우 분할, 중앙 VS.
5. 💬 해외 댓글: 원문·번역·프로필·출처 연결.
6. 📰 언론 기사: 제목·인용문·형광펜 강조.
7. 📊 통계: 막대·원형·선그래프·숫자 카운트업.
8. 🔥 키워드: 기존 불꽃·반짝임·네온 PNG 적용.
9. 📦 네모 박스: 질문·팩트·비교·결론 4종.
10. ❓ 물음표·따옴표·종이 넘김 애니메이션.
11. ✍️ 폰트: 대형 제목·일반 자막·댓글별 규칙.
12. 🎧 효과음: 상황과 타임코드별 자동 추천.

모든 디자인은 16:9와 9:16을 지원.
원본 영상은 계속 재생.
텍스트 배경은 투명·흰색 10~20%·블러를 선택 가능하게.

결과:
디자인별 미리보기, 추천 사용 장면, 색상값,
폰트, 애니메이션 길이, 적용 예시를 표로 정리.

기존 자료를 먼저 활용하고 새로 필요한 것만 제작.</div><button class="btn" data-copybtn>A 복사</button>
<h3 style="margin-top:16px">🎧 프롬프트 B · 유퀴즈·라디오스타 효과음 30개 조사</h3>
<div class="prompt" data-copy>🎧 예능형 국뽕 영상의 무료 효과음 30개 조사

🌸유퀴즈 온 더 블럭
🌸라디오스타
🌸국뽕 쓸모왕 등 해외반응 유튜브
🌸Mixkit·Pixabay·YouTube Audio Library·Freesound

1. 실제 방송 영상의 편집·자막·효과음 사용 사례 조사.
2. 가능한 경우 영상 링크와 타임코드 기록.
3. 놀람·경악·칭찬·반전·통계·VS·뉴스·댓글별 분류.
4. 타이핑·휙·칼 소리·띠리링·뿅·책장 넘김 조사.
5. 효과음 30개 후보 수집, 추천 TOP 10 선정.
6. 각 효과음의 직접 듣기·다운로드 링크 확인.
7. 무료 여부·상업 이용·출처 표시·제약 검증.
8. 효과음의 추천 길이·음량·영상 진입 시점 작성.
9. 실제 방송 음원을 복제하거나 무단 추출하지 말 것.

결과:
상황 / 자주 나오는 단어 / 효과음 / 청취 링크 /
다운로드 링크 / 라이선스 / 추천 애니메이션 / 타임코드

실제 찾은 자료만 제시하고 접근 불가 항목은 미확인 표시.</div><button class="btn" data-copybtn>B 복사</button>
<h3 style="margin-top:16px">🎨 프롬프트 C · Pinterest 레퍼런스·디자인 자료 수집</h3>
<div class="prompt" data-copy>🎨 국뽕 영상 편집용 레퍼런스 조사

🌸Pinterest
🌸유퀴즈·라디오스타 영상 사례
🌸기존 GitHub 자막·PNG 디자인
🌸눈누·공식 폰트 배포처
🌸Wikimedia Commons 국기 SVG

1. 초대형 한 줄·두 줄 글씨 디자인 5개.
2. 한국·일본·중국 VS 비교 디자인 5개.
3. 뉴스·실제 댓글 카드 디자인 5개.
4. 물음표·따옴표·말풍선 디자인 5개.
5. 그래프·통계·숫자 강조 디자인 5개.
6. 불꽃·반짝임·키워드 장식 디자인 5개.

각 자료의 이미지·원본 링크·색상·글자 배치·
투명 배경 여부·추천 사용 장면을 정리해 줘.

기존 자료와 중복되면 새로 만들지 말고 재활용.
Pinterest는 참고 디자인으로 활용하되
실제 사용 가능한 소스의 라이선스는 별도 확인.

결과: 총 30개 레퍼런스 비교표 + 제작 우선순위.</div><button class="btn" data-copybtn>C 복사</button>

<h2 id="pc">🎨 공통 디자인 규칙 (모든 작업)</h2>
<div class="chips">
<span class="chip" data-hex="#FFE94A"><i style="background:#FFE94A"></i>노랑 #FFE94A</span><span class="chip" data-hex="#A5FF43"><i style="background:#A5FF43"></i>연두 #A5FF43</span><span class="chip" data-hex="#FF454F"><i style="background:#FF454F"></i>빨강 #FF454F</span><span class="chip" data-hex="#42B8FF"><i style="background:#42B8FF"></i>파랑 #42B8FF</span><span class="chip" data-hex="#FF93D7"><i style="background:#FF93D7"></i>핑크 #FF93D7</span></div>
<p class="note">위 코드는 제안 색상입니다. 카카오톡에서 이전에 추출한 실제 HEX 값을 찾으면 그 값으로 교체합니다 (현재 미확인).</p>
<ul>
<li>🟡 <b>애니메이션</b>: 타이핑·줌인·줌아웃·팝업·스와이프는 기본, 불꽃·충격·반짝임은 강조 장면만.</li>
<li>📐 <b>배경</b>: 투명 우선, 필요 시 반투명 흰색 또는 블러. 글자와 원본 영상의 가독성을 함께 확보.</li>
<li>🎯 <b>제작 우선순위</b>: 큰 글씨 → 일반 자막 → 댓글·기사 → VS·국기 → 그래프 → 효과음. 금색 장식 테두리는 후순위.</li>
<li>핵심은 디자인을 계속 새로 만드는 게 아니라, 기존 자산으로 <b>6~8개의 재사용 템플릿</b>을 완성해 다음 영상부터 대본 단어와 장면에 따라 효과를 빠르게 배치하는 것.</li>
</ul>

<h2 id="plab">🧪 영상편집 디자인 실험실 (이전 작업 요약)</h2>
<div class="tblwrap"><table><tr><th>우선순위</th><th>디자인</th><th>추천 적용</th></tr>
<tr><td>1순위</td><td>🔥 초대형 글씨·타이핑</td><td>영상 도입부, 외국인 감탄</td></tr>
<tr><td>2순위</td><td>🇰🇷 VS 🇯🇵 국가 비교</td><td>한일·한중 비교</td></tr>
<tr><td>3순위</td><td>💬 댓글·언론 카드</td><td>해외반응, 실제 기사 인용</td></tr>
<tr><td>4순위</td><td>📊 막대·원형 그래프</td><td>수치·통계 설명</td></tr>
<tr><td>5순위</td><td>⚡ 핵심 단어 특수효과</td><td>놀람, 경악, 반전</td></tr>
<tr><td>6순위</td><td>🎵 화면 전환 효과음</td><td>줌·등장·페이지 넘김</td></tr>
<tr><td>7순위</td><td>📝 폰트·색상 편집</td><td>모든 영상 공통</td></tr></table></div>
<p><b>디자인 기본값</b>: 1920×1080, 형광연두 <code>#BCFF34</code>, 노랑 <code>#FFE600</code>, 빨강 <code>#FF4545</code>, 파랑 <code>#39D5FF</code>, 흰색 10% 오버레이. 구현: 8개 디자인 모드, 방송 레퍼런스 8장, 애니메이션 6종, 효과음 8종, 그래프 수치 편집, 사진·동영상 배경 재생, 설정 저장·복사. 기존 썸네일 페이지는 보존.</p>
<p>효과음 기본 배치: 큰 글씨 <i>Pop</i> · 국가 VS <i>Whoosh</i> · 통계 <i>Click</i> · 기사 <i>Page Turn</i> · 반전 공개 <i>Chime</i>.</p>
<div class="prompt" data-copy>17분짜리 국뽕 해외반응 영상에 사용할 무료 상업용 효과음 8종을 찾아줘. Impact, Whoosh, Pop, Click, Page Turn, Riser, Zap, Chime을 상황별로 분류하고, 실제 다운로드 링크·길이·라이선스·추천 타임코드를 표로 정리해줘. YouTube Audio Library, Mixkit, Pixabay를 우선 조사하고 사용 조건을 검증해줘.</div><button class="btn" data-copybtn>효과음 8종 프롬프트 복사</button>
</div>`;

HTML.sfx = `
<div class="page">
<h1>🎧🔔 효과음 배치표 · 어떤 단어에 어떤 소리를?</h1>
<p class="lead">대본에 아래 단어나 상황이 나오면 해당 효과음을 짧게 넣습니다. 문장마다 넣지 말고 놀람·전환·숫자·반전에서만.</p>
<div class="tblwrap"><table><tr><th>대본에서 나오는 상황</th><th>추천 효과음</th><th>검색어</th><th>함께 쓸 애니메이션</th></tr>
<tr><td>"한국이 대단하다!"</td><td>둥! + 반짝</td><td>impact shimmer</td><td>줌인 + 불꽃 PNG</td></tr>
<tr><td>"충격", "경악", "놀라움"</td><td>둥! / 뿅!</td><td>dramatic hit, boing</td><td>스탬프 · 바운스</td></tr>
<tr><td>"한국이 좋다", "칭찬"</td><td>띠리링 ✨</td><td>magic sparkle</td><td>반짝임</td></tr>
<tr><td>"한국이 이상하다?"</td><td>뚝! + 물음표</td><td>question pop</td><td>물음표 팝업</td></tr>
<tr><td>한국 VS 일본</td><td>휙! 쾅!</td><td>sword whoosh</td><td>스와이프</td></tr>
<tr><td>통계 숫자 등장</td><td>톡톡톡, 상승음</td><td>counting ticks</td><td>숫자 카운트업</td></tr>
<tr><td>실제 댓글 등장</td><td>타닥, 팝!</td><td>typing pop</td><td>옆에서 등장</td></tr>
<tr><td>언론·기사 등장</td><td>사락, 책장 넘김</td><td>page flip</td><td>종이 펼침</td></tr>
<tr><td>반전이 밝혀질 때</td><td>슈웅 → 쿵</td><td>reverse riser</td><td>줌아웃 → 스탬프</td></tr>
<tr><td>결론·팩트 확인</td><td>딩!</td><td>success chime</td><td>박스 등장</td></tr></table></div>
<h2>무료 효과음 소스</h2>
<div class="tblwrap"><table><tr><th>사이트</th><th>장점</th><th>이용 조건</th></tr>
<tr><td><a href="https://mixkit.co/free-sound-effects/" target="_blank" rel="noopener">Mixkit</a></td><td>Whoosh·Impact·Transition</td><td>무료 상업 이용, 출처 표기 불필요</td></tr>
<tr><td><a href="https://studio.youtube.com/" target="_blank" rel="noopener">YouTube Audio Library</a></td><td>유튜브용 음악·효과음</td><td>개별 출처 표시 조건 확인</td></tr>
<tr><td><a href="https://pixabay.com/sound-effects/" target="_blank" rel="noopener">Pixabay</a></td><td>뿅·띠리링·책장 소리</td><td>무료 이용, 일부 권리 제한 확인</td></tr>
<tr><td><a href="https://freesound.org/" target="_blank" rel="noopener">Freesound</a></td><td>효과음 종류 다양</td><td>CC0·CC BY 등 개별 확인</td></tr></table></div>
<p class="note">유퀴즈·라디오스타 실제 방송 효과음을 그대로 추출하지 말고, 비슷한 기능의 별도 라이선스 효과음으로 구성하세요. 효과음 30개 실제 링크·라이선스 검증은 아직 <b>미완료</b>입니다 (마스터 계획의 프롬프트 B).</p>
</div>`;

HTML.vlog = `
<div class="page">
<h1>📋 영상편집 · 자막 작업 기록 · 점검표</h1>
<p class="lead">영상편집 실험실 업로드 기록과 남은 일입니다. 마스터 계획 본문은 「영상편집·자막·효과음 마스터 계획」에 전부 옮겼습니다.</p>
${HTML.status}
<h2>🔗 이전 링크 (모두 이 스튜디오 안에서 열림)</h2>
<ul>
<li><a href="${PUB}국뽕-유튜브-리서치-허브-20261108/?page=video-edit-lab" target="_top">허브 ?page=video-edit-lab</a> → 이제 「썸네일 · 영상편집」 → 영상편집 탭으로 연결</li>
<li><a href="${PUB}research-hub-20261108/broadcast-font-subtitle-master-20261121/video-edit-lab.html" target="_blank" rel="noopener">영상편집 디자인 실험실 단독 페이지</a></li>
<li><a href="https://github.com/geben147-create/Insta/actions" target="_blank" rel="noopener">GitHub Pages 배포 진행 상태</a></li>
</ul>
<p>이전 검증 상태: HTML 저장, 메뉴 연결, 자바스크립트 구문 검사 통과. 모바일 화면 동작은 당시 미검증 → 이번 작업에서 좁은 화면일 때 미리보기를 위에 고정하도록 수정.</p>
</div>`;
