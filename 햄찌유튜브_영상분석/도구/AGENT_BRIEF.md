# 컷 분석 JSON 작성 지침 (4~10위 공통)

역할: 세계 최고 수준의 영상 편집자·감독·유튜브 쇼츠 연출가. 한 영상의 **컷별 분석 JSON 1개**를 작성한다.
작업 폴더(절대경로): <작업폴더>

## 1. 먼저 읽을 것
1. `videos/v1/analysis.json` (기준 양식 1 — 오피스 콩트, 필드 구조·깊이·문체 그대로 따를 것)
2. `videos/v3/analysis.json` (기준 양식 2 — 대괄호 내레이션·rhythm_note·새 대본 표기 예)
3. 담당 영상 폴더 `videos/vN/`:
   - `cuts.json` — 컷 번호(idx)·시작·끝·길이. **컷 번호와 시간은 이 파일 그대로** (합치거나 나누지 말 것)
   - `sheets/sheet_XX.jpg` — 콘택트시트(행 = 컷 1개: 시작|중간|끝). **Read 도구로 전부 본다**
   - 필요하면 `shots/sNN_a.jpg|_m.jpg|_z.jpg`(960px), `watch_cuts/frames/cue_XXXX.jpg`(1024px, cue 번호 = 컷번호-1)로 확대 확인
   - `whisper.json`(대사 타이밍), `pitch.json`(목소리 높이), `audio.json`(BPM·컷-온셋 일치율·무음·라우드니스), `cap_colors.json`(컷별 자막 영역 채도 높은 색 = 화자 색 후보), `spectrogram.png`
4. 이 채널 공통: 실사풍 햄스터 캐릭터(은색 헤드폰), 한국 직장·일상 콩트, 16:9, 사람은 얼굴을 입 위로 잘라 보여 주는 경우가 많음, 자막은 상황 라벨 + 화자 색 대사 + 강조 자막 구조

## 2. JSON 구조 (v1과 동일한 키)
최상위: key, rank, id, fmt, logline, formula, why, look, cast, sets, beats, captions{summary,styles,typing,decor}, shots[], sound{summary,voices,bgm{guess,rec,level},sfx[],suno,suno2,suno3,mix}, edit{timeline,rules}, tech[], adapt{premise,keep,change,costume}, batches[]
선택: `rhythm_note`(HTML <b> 허용 — 편집 리듬 해석이 "대사 타이밍 중심"과 다를 때), `speaker_colors`({"cw1":"#RRGGBB","cw2":"#RRGGBB","leader":"#RRGGBB"} — 실제 측정한 화자 대사 색. 없으면 기본 초록 #2EEF38·파랑 #1990DE·라임 #D7E534)

컷 객체 키(전부 필수): n, who, sz, ang, cam, grid, act, bg, set, cap{lb,ln,sp,fx}, tr, sfx, tech, why, img, mot, gen, m, new (+ 선택 vo = 자막 없이 목소리만 나오는 새 대사)
- who: hero | hero_costume | cw1 | cw2 | boss | leader | friend | group | insert | black | card
  (사람 역할은 cast 에 같은 키로 role·cap(색)·en(영어 외형, 얼굴 크롭 명시)·voice 를 정의)
- cap.sp: hero | cw1 | cw2 | leader | boss | narr(대괄호 내레이션) | friend
- grid: 3×3 칸 번호 리스트(1=왼쪽 위 … 5=가운데 … 9=오른쪽 아래)
- gen: i2v | i2v-fl(시작+끝 프레임) | ref(참조형) | still(정지 이미지+편집 줌) | edit(영상 생성 불필요)
- m: 모델 키(1순위부터): kling-v3, kling-v3-omni, seedance-2-0, seedance-2-5, minimax-h3, hailuo-2-3, veo-3-1, gemini-omni-1-1-flash, viduq3-pro, still, edit
  가이드: 주인공 반복 컷 → kling-v3-omni/seedance-2-0(참조 고정) · 과장 표정 → minimax-h3/hailuo-2-3 · 사람 손·상반신 → veo-3-1/kling-v3 · 0.5초 이하 인서트 → still · 긴 카메라 무빙 → seedance-2-5 · 1초짜리 초단컷 → viduq3-pro · 그래픽·암전·플래시 → edit
- img/mot: 영어. 토큰 사용 {HERO} {ANIMAL} {PUN} {COSTUME} + cast 키 대문자({CW1} 등) + sets 키 대문자({OFFICE} 등 — sets 에 정의한 것만). gen 이 still/edit 인 컷의 mot 은 "Edit: ..." 또는 "Still ..." 로 시작
- sets 값은 영어 배경 묘사. look = 이 영상의 공통 촬영 룩(영어)

## 3. 편집 키트가 읽는 표현 (정확히 이 단어를 써야 효과가 자동 인식됨)
- tr(들어올 때 전환): 디졸브면 "디졸브(약 N프레임)"로 **시작**, 줌블러/잔상 전환은 "줌 블러"나 "잔상" 포함, 휩 팬은 "휩 팬"으로 **시작**, 흰 섬광은 "플래시" 포함, 암전은 "딥 투 블랙"
- cam: 급확대 "크래시 줌", 느린 확대 "푸시인", 화면 흔들림 "흔들"(핸드헬드 제외), 점점 어두워짐 "어두워짐"
- cap.fx/tech/act 에 그래픽이 있으면: 반짝 별 "✦" 또는 "반짝 별", 로딩 "스피너", 수식 "수식", 얼굴 가림 "이모지", 깨지는 자막 "글리치"
- 0.2초 미만 초단 검출 컷은 번호를 유지한 채 "플래시/전환 프레임"으로 설명하고 who=insert(검은 화면이면 black), gen=edit

## 4. 새 대본(new) 표기 — 자막 파일이 자동 생성됨
- 접두어: (라벨) 상황 라벨 · [이름표] 인물 이름표 · (초록)/(파랑)/(라임) 화자 색 대사(cw1/cw2/leader 슬롯) · (대사) 주인공 흰 대사 · (강조) 초대형 · (초록 강조) · [괄호] 대괄호 내레이션 · (카드 작게)/(카드) 타이틀 카드
- " / " = 동시에 뜨는 자막, "→" = 한 컷 안에서 차례로, "(유지)"·"(라벨 유지)"·"(대사 유지)"·"[이름표 유지]"·"(강조 유지)" = 앞 컷 자막 연장
- "+(초록) 말" = 앞 대사에 띄어서 이어 타이핑(자막 브릿지), "++말" = 붙여서 이어 타이핑, "(자막 없음)" = 자막 없음
- 접두어 없는 "(…)" 는 괄호 속마음 자막, 접두어 없는 "[…]" 는 대괄호 내레이션으로 처리됨
- 라벨·말장난에 동물 이름 글자 자리는 {PUN}, 주인공 이름 자리는 {이름}

## 5. 저작권 (엄격)
- cap.lb / cap.ln / act 등에는 원본 자막·대사를 **옮겨 적지 말고 의도만 요약**(1~3단어 조각까지만)
- new 는 원본과 **다른 전제로 새로 쓴 각색 대사**(adapt.premise 에 각색 전제 명시). 원본 문장 재사용 금지
- 원본 캐릭터 이름·은색 헤드폰·'-햄' 말장난은 각색에서 쓰지 말 것({PUN} 사용)

## 6. 내용 품질
- formula 8~12단계, why 5~6개(구체적 숫자·컷 번호 포함), beats 는 cuts.json 시간 기준(감정 e: -1~+1)
- sound: audio.json 수치 인용(BPM 추정·컷-온셋 일치율 vs 우연 기준선 = min(1, 온셋 수×0.16/길이)×100 %·무음 비율·LUFS), voices 는 pitch.json 근거 + TTS 재현법, bgm.guess 는 "추정" 명시, sfx 는 시각 포함 15~25개, suno 3개(영어)
- tech 10개 이상(컷 번호 포함), batches 로 생성 묶음 계획, 반복되는 세트·인물 파악
- captions.styles 의 spec 에 측정값(크기 px·위치 y·색 hex·외곽선·기울임 여부) 기록. 라벨이 정자체면 "기울임 없는 정자체"라고 쓸 것

## 7. 검증 (반드시 실행)
`PYTHONUTF8=1 python -c "import json;a=json.load(open('videos/vN/analysis.json',encoding='utf-8'));assert [s['n'] for s in a['shots']]==list(range(1,COUNT+1));print('ok',len(a['shots']))"`
그다음 `PYTHONUTF8=1 python tools/build_kit.py vN` 을 실행해 오류 없이 EDL·자막이 만들어지는지 확인(출력 요약 확인). 다른 파일은 수정 금지.
