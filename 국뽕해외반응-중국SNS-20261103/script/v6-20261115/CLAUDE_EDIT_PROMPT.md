# CLAUDE용 V6 국뽕 10편 대본·영상 편집 실행지시 V1.0
대상: Ubuntu Hermes+Claude·FFmpeg·TTS 기존 설치 환경. 기존 GPU 작업/도커/HDD 원본 보존. 무료/유료 API 자동 호출 금지. 신규 설치 금지. 당일 사용 권한 확인. 최종 게시·수익화·업로드 금지.

## 입력
- GitHub 대본 기획: ./OUTLINE_TOP10.md
- 실제 초고: ./scripts/EP01.md ~ EP10.md (존재하지 않거나 17분 미달이면 PARTIAL; 절대로 완성본이라 보고하지 않는다)
- 편집 증거표: ./EVIDENCE_EDITORIAL.md
- 원본 자막: ../data/<ID>.json, <ID>.zh-ko.srt, <ID>.ko.srt
- 로컬 원본은 GitHub JSON의 path 참조로 **존재 확인을 먼저** 수행한다. '/' 경로 다르면 사용자에게 알아볼 수 있는 진단 보고를 남기고 원본 이동·변경하지 않는다.

## 실행 순서
STEP0 인덱스: 소스 ID / 로컬 MP4 절대경로 / JSON / 이중 SRT / 길이 / 실제 인물 / 권리 확인 상태 / SHA256. 누락은 NO_MEDIA.
STEP1 사실검증: 기사 기사일·사건일·원조사 기간, 숫자의 분모와 조건, 중국 기사 주장과 다른 1차자료, ASR 오탈자. EVIDENCE_EDITORIAL 순서로 완료할 것.
STEP2 10편 대본:
  - 기존 훅 5문장 바탕으로 실제 나레이션 문장을 **독창적으로** 채우고, Q→A→새 Q를 각 8구간에 적용
  - 첫 30초 한국의 강점/확인된 해외 긍정 반응 포함; 실제 중국인이 안 한 말을 따옴표로 만들지 말 것
  - 40~80대 한국 남성 취향: 역사·군사·기술·스포츠 흥미, 숫자·장비·경쟁과 인간적인 감정
  - 한글 본문은 [내레이션] 문단만 별도 추출 가능하게; [클립]은 원본 시각 인덱스와 저작권 확인 전에는 EDIT_ONLY
  - 목표 편당 17분, ±5초. TTS 실측 전 완료 아님. 해설 60% 이상
  - EP마다 최종 TXT/SRT/편집표, 근거표, 팩트 검수 기록 작성.
STEP3 편집 컷시트 CSV: output_time_in/out, source_id, source_in/out 실제 재생 확인값, audio_type, title_card, source_url, rights, certainty, transition.
STEP4 자료 디자인: 배경 영상 외에 2~3개의 자체 그래픽(비교/시간/검증/지형). 숫자와 출처를 화면 하단 4초 이상 가독성 있게 보여주기.
STEP5 TTS: 한국어 24kHz narration_master.wav. 원문 10초 이하라고 저작권 안전 추론 금지. 외부음원 전부 검수.
STEP6 16:9 1080p H.264 preview.mp4, captions ko.srt, timeline.csv, manifest.json, checksums.sha256 출력.
STEP7 QC: 실제 러닝타임·해설비율·자막밀림·화면 캡션·사용권·가짜 발언·시사 자료의 날짜 체크. PASS일 때만 '검수용 영상 파일 완성' 표기, '공개 승인' 별도.

## 편별 우선순위
EP01 2026 K2 현지 검증 / EP02 중국 아이오닉 V 차주 vs 중국 현대 공식 / EP03 OEM 주장 vs 광고성 후기 / EP04 Novarex 공장 vs 식약처 / EP05 중국 다큐와 개인 시위 사례 / EP06 두 화자의 러시아-한국 비교 / EP07 박지성 해설 vs 구단 공식 / EP08 손흥민 인터뷰 vs 팬 / EP09 한국 여자 양궁 vs 중국 보도·공식 결과 / EP10 중국 라이더 vs 서울시 도로 계획.

## 승인 기준과 출력
10편 중 미완성 내레이션은 COMPLETE로 표시 금지. 상태는 PLAN, DRAFT, TTS_QC, VIDEO_QC, RIGHTS_BLOCKED, PUBLISH_READY 각각 별도 관리. 새 유료 모델에 임의 호출하지 말 것. 결과를 MASTER 시트 V6_신규10편_대본편집_1115 및 HTML 메뉴에 링크하되, 17분 음성 길이는 측정값과 추정값을 분리한다.

---

## 🎯 2026-11-15 현재 실제 완료 파일 반영

현재 다음 파일은 GitHub에 실제로 존재한다. 다만 17분 TTS·실제 편집은 아직 완료되지 않았다.

- **한 번에 전체 읽기**: [SCRIPTS_ALL_10_DRAFT.md](SCRIPTS_ALL_10_DRAFT.md) (10편 모두 문장형 초고)
- **개별 수정**: [scripts/EP01.md](scripts/EP01.md)부터 [scripts/EP10.md](scripts/EP10.md)
- **EP별 중국뉴스·공식 통계 40개**: [references.html](references.html) (각 EP 왼쪽 메뉴)
- **근거와 영상 그래픽 연출표**: [EVIDENCE_EDITORIAL.md](EVIDENCE_EDITORIAL.md)
- **전체 Google MASTER 대본 탭**: https://docs.google.com/spreadsheets/d/1z_Ys-QfkRY3GDuD2vQ5N7CDt-RGXcrMyUESst8cQDAY/edit#gid=358130955
- **Google MASTER 컷·타임코드 142행**: https://docs.google.com/spreadsheets/d/1z_Ys-QfkRY3GDuD2vQ5N7CDt-RGXcrMyUESst8cQDAY/edit#gid=1702681009
- **원본 자막 GitHub**: https://geben147-create.github.io/Insta/국뽕해외반응-중국SNS-20261103/script/#guide

## 🧪 Claude에게 반드시 실행시킬 실측 체크

| 체크 | 정확한 실행 |
|---|---|
| [ ] 대본 누락/반복 | 10편의 [나레이션] 문단만 추출하여 분량(글자수), 시작·끝 질문, 실제 반전, 독창성 확인 |
| [ ] 17분 확보 | TTS WAV 렌더 뒤 실제 duration 계산. 1020 ± 5초가 아니면 사실 늘이기·무의미한 반복 없이 질문/증거 중심으로 보강 |
| [ ] 외국인 직접 인용 | SOURCE_ID, 원본 start/end, 원어, 한글 번역, 화자와 동의 여부를 기록. 검증 안 된 문장은 화면에 직접 인용하지 않음 |
| [ ] 화면 자료 | 중국 기사/공식 자료는 자체 재구성 이미지(출처·일자 하단 표기), 문서 화면 복제는 라이선스 범위 확인 |
| [ ] 완성본 음성 비율 | 나레이션 WAV 시간 / 전체 최종 길이 >= 60%. 원본 외국인 원음 사용은 권리 확인된 구간만 |
| [ ] 편집 원본 | FFmpeg/타임라인 CSV의 SOURCE_IN/OUT은 추측 시간을 넣지 말고 실제 영상 프레임으로 교정 |
| [ ] 자막 | 한국어 1줄 14~23자 목표(시청성 기준, 고유명사 예외), 2줄 초과 지양. 노년층을 위해 크고 대비 높게 |
| [ ] 사운드/영상 | 원본에 포함된 음악의 라이선스까지 확인. 확인되지 않으면 원음을 제거하고 별도의 합법적 음원/원창작음 사용 |
| [ ] 검수 | 정보의 실제 발생일/발표일/영상 촬영일, 문장 무리한 일반화, 원본 권리, 파일 체크섬 |
| [ ] 상태기록 | PLAN→DRAFT→TTS_CHECKED→VIDEO_CHECKED→RIGHTS_CHECKED로 별도 진행. PUBLISH_READY는 별도 승인 후 |

**미디어 구성 권장**: 17분 기준 한국어 자체 나레이션/독창적 설명 60~75%, 권리가 확인된 실제 외국인 영상·원음 15~25%, 자체 제작 통계/지도/비교 일러스트 10~20%. 이는 편집 목표이지 현재 실측값이 아니다.

## 🎬 첫 1편 실행 순서 (EP01 K2)
1. GitHub 원고 EP01과 BILI-중국 영상 둘, 폴란드군 인터뷰 자막을 가져와 화자·장면을 1:1 대응한다.
2. 편집자 원본 재생 및 상업 이용 권리를 확인하기 전에는 영상화할 장면은 자체 그래픽/내레이션으로만 대체한다.
3. 중국 澎湃新闻의 11월9일 기사와 폴란드 Defence24의 11월5일 확인 결과를 날짜순으로 비교한다. 초기 52대 중 30대 설은 확정사실이 아니다.
4. TTS를 돌리고 길이를 실제 측정한다. 부족한 부분은 폴란드 2022/2025 계약, 현지 훈련, 수리와 정기정비의 차이로 **검증 가능한 정보만** 추가한다.
5. 첫 30초와 4분30초, 7분, 12분, 마지막 1분에 질문→부분 답→다음 질문이 자연스러운지 듣기 검수한다.
6. 다른 9편도 같은 절차. EP09 양궁 코치 이름은 '권용학'(중국어 权容学)으로 공식 자료가 확인됐으며 기존 자동자막 '전영학' 교정 필요.
