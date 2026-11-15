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
