# ① 자료조사 + 자료조합 마스터 프롬프트 V4.0
국뽕·해외반응 영상 우선 | 소스 → 전개 DNA → 새 주제 TOP10 → 대본 입력 패키지
기준: 2026-11-09 | 실행 대상: Aside / 기존 로컬 에이전트 / 자료조사 가능한 도구

## 사용자의 핵심 의도
우선순위는 **실제 외국인 반응과 현장 영상의 재미**다. 연구한 인기 국뽕 영상의 질문·반전·감정 전개를 분석하고, 이미 가지고 있거나 허락받은 영상·공식 자막·새로운 뉴스·논문·통계를 연결해 **새로운 영상 주제**를 제안하라.
경제·주식·ETF·코인은 영상 주제와 자연스럽게 맞아떨어질 때 0~30초 내외의 생활정보로만 제안한다. 금융 강의를 중심으로 기획하지 마라.

## 🔴 사람이 수정하는 칸
🔴 TARGET: [한국 / 한국어 / 40~60대]
🔴 GOAL: [8분30초 롱폼 / 16:9 / 외국인 체험 주인공]
🔴 STORY_THEME: [선택 안 함: 자동 발굴 / 한국 첫 여행 / 음식 / 관광 / 한일·한중 비교 / 한국의 낯선 일상]
🔴 LOCAL_MEDIA_ROOT: [없음 / 사용자가 권한 있는 로컬 영상 보관 폴더]
🔴 REFERENCE_URLS: [아래 5편 / 추가 직접 입력]
🔴 TIME_WINDOW: [최근 7일 뉴스 + 최근 90일 영상 + 에버그린]
🔴 RIGHTS_FOLDER: [없음 / 허락·라이선스 증빙 위치]
🔴 ASR_ALLOWED: [아니오(기본) / 허락된 로컬 소스에서 기존 설치 모델만]
🔴 RUN_MODE: [RESEARCH_ONLY / DATA_AND_TOPIC_SELECTION]
🔴 OUTPUT_ROOT: [새 작업 폴더 / 없으면 보고만]
🔴 FORBIDDEN: [원본 이동·삭제, 로그인 우회, 운영 서버 재시작, 유료 API 호출, 임의 모델 설치]

## 반드시 사용할 기존 연구 자료
- 원본 통합 허브: https://geben147-create.github.io/Insta/research-hub-20261108/#home
- 급등·저조 성과 표: https://geben147-create.github.io/Insta/research-hub-20261108/#rising
- 장수 채널의 전개·감정 분석: https://geben147-create.github.io/Insta/research-hub-20261108/#longrun-emotion
- 전개 DNA: https://geben147-create.github.io/Insta/research-hub-20261108/#storydna
- 자막 실제 확인 전용: https://github.com/geben147-create/Insta/blob/main/research-hub-20261108/ASIDE_TOP5_SUBTITLE_STORY_AUDIT.md

2026-11-08 저장 조회수 기준 연구 후보:
R17 https://www.youtube.com/watch?v=1eBPSEp3mJc : 영국 부부 한·중 고속철 비교 / 214.5만 / 비교·반전 후보
R14 https://www.youtube.com/watch?v=zUGo3CXgHkc : 누리호 해외반응 / 118.4만 / 비판→역전 후보
R12 https://www.youtube.com/watch?v=6tytUWF-i4M : 영국 커플 서울 체험 / 98.7만 / 발견·감정 후보
R04 https://www.youtube.com/watch?v=4AWYckCz99k : 인도 유튜버 차별 검증 / 79.5만 / 편견→검증 후보
R01 https://www.youtube.com/watch?v=ltLDmUM7rxs : 상대순위 1위, 조회/구독 1,015.8배 / 절대 조회수 1위가 아님
**중요:** 현재 TOP5 전체 원문 자막·클립 시간을 모두 확보한 것은 아니다. 제목만으로 당사자의 실제 반응·결말·정확한 질문 수를 지어내지 말 것. 서로 다른 주제(#14 로켓 등)를 억지로 같은 여행 이야기로 합치지 않는다.

## 단계 0. 작업 범위·상태 확인
파일과 기존 프로그램의 존재 여부만 읽기 전용 확인. 새 작업 폴더 외 수정 금지. PC에 접근할 수 없으면 WEB_ONLY로 진행하고 로컬 파일을 읽은 것처럼 기록하지 말 것.
SOURCE_STATUS = VIDEO_VERIFIED / TRANSCRIPT_VERIFIED / TITLE_ONLY / INACCESSIBLE.
자막 파일이 없는 경우 자료 조사 권한 범위에서 플랫폼 공식·자동 자막의 존재 여부를 검사. 제공자가 허용하는 범위에서만 다운로드 또는 제공 트랙을 읽는다. 막히면 우회하지 않고 원문 확보 대기 표시. 유료 API·쿠키 탈취·DRM·차단 우회·신규 프로그램 설치 금지.

## 단계 1. 소스 및 권리 인덱스 (MEDIA)
사용자가 허용한 폴더 내 영상, 메타데이터, 원출처 URL, 자막, WAV/MP3, 기존 컷시트와 저작권 허락을 인덱싱하라.
각 MEDIA 레코드:
MEDIA_ID, original_url, platform, creator, shot_date, upload_date, collected_at, local_path, sha256, duration_s, language, transcript_path, scene_tags, speaker, original_quote, visual_highlight, first5s_visual, rights_owner, license_type, commercial_ok, derivatives_ok, translation_ok, permission_proof, rights_status.
RIGHTS_STATUS = OWNED / LICENSED_VERIFIED / PERMISSION_VERIFIED / RIGHTS_UNKNOWN / FORBIDDEN.
다운로드·보관 사실 자체를 상업용 게시 권리로 처리하지 않는다. 얼굴·초상·사생활·원음·화면에 포함된 음악도 별도 점검. 권리 미확인 영상은 **연구 자료**로만 사용하며 영상 편집 소스로 승인하지 않는다.
원어 대사를 따옴표로 쓰려면 VIDEO_ID, 시작·종료 초, 실제 원문, 번역, 화자·맥락을 함께 기록한다. 자동 번역만 있으면 원어 직접 확인 필요 표시.

## 단계 2. 최근 이슈·새 논문·실제 원자료 (NEWS)
최근 24시간 / 7일 / 30일 / 에버그린으로 분리.
ISSUE_ID, source_url, primary_or_secondary, publication_date, event_date, data_period, retrieved_at, original_claim, verified_point, contradictory_point, freshness, relevance_to_media.
뉴스는 실제 사건일과 기사 게시일을 따로 표시. 공식 통계·원논문·원문 발표가 있는지 검증. 제목에 나온 외국인 인용은 원본 영상/인터뷰가 없으면 검증되지 않은 주장으로 표시.
이미 많이 다룬 주제인지 보려면 최근 3개월, 6개월 간 동일 사건·제목·각도·주인공을 조사하되, 발견 못 했다고 새롭다는 사실을 확정하지 말 것.
새로운 자료가 없다면 오래 봐도 좋은 에버그린 소재를 제시하되 속보인 것처럼 포장하지 않는다.

## 단계 3. 레퍼런스 DNA 실측 (BENCHMARK)
각 레퍼런스 영상의 제목, 영상 길이, 게시일, 저장 조회수·수집일, 구독자, 같은 채널 다른 영상 5~10개를 정리.
- 누적 VPH = 조회수 / 게시 후 경과시간(시간).
- 최근 24h 증가량은 다른 시점 스냅샷이 있어야만 계산 가능. 한 번 수집한 조회수로 최근 급등을 단정하지 않는다.
- 조회/구독 배수와 VPH 혼동하지 말 것.
- 같은 채널의 최근 비슷한 길이/주제 고조회와 저조회 1~2편을 대조하여 제목보다 실제 주제·자료·원본 영상의 차이를 비교.
H01~H14 중 주훅 1개+보조훅 최대 2개, S01~S09 중 주 전개 1개+부 전개 1개.
시작 0~5초 / 5~15초 / 15~30초 실제 대사, 첫 답변 시각, 질문→답→다음 질문 반복수, 반전 시각, 감정 회수, 외국인 원음 비율, 한국어 해설 비율, 화면 원본 출처 비율을 분리. **실제 자막/영상 없는 값은 UNKNOWN**.
참고할 주요 구조: H05 편견 검증 / H06 실제 외국인 원음 / H07 양국 비교 / H03 결과 선공개 / H11 인물 감정 / S02 질문답 사다리 / S04 체험 발견 / S05 비교 판정 / S03 갈등 역전.
무조건 8비트·질문 8개로 맞추지 않는다. 실제 질문 반복 횟수를 기록한다.

## 단계 4. 소스 조합: MATCHING
세 자원을 결합하되 모든 연결에는 '같은 사건인가? 같은 사람인가? 같은 장소·시기인가?' 검증 결과를 붙여라.
A = 실제로 볼 수 있는 외국인 행동·표정·원음
B = 새 뉴스·논문·사회 현상에 기반한 놀라운 설명 또는 질문
C = 고조회 영상 전개의 질문·답·부분보상·감정·반전 패턴
D = 제작자가 보태는 검증·반대 사례·새 해석
정규 조합 예: 주인공 외국인 체험 원본 1편 + 같은 테마 다른 외국인 반응 1편 + 독립적인 공식 설명/자료 1개 → 새로운 질문이 있는 하나의 이야기.
다른 인물이 겪은 일을 한 명의 체험처럼 붙여 표현하지 말 것. 편집자가 만든 합성 비교는 '다른 사례'임을 표시한다.
원본 영상은 재미의 주연; 뉴스·교육은 맥락 제공에만 사용한다. 경제·주식·ETF 설명은 기본 0초, 여행·교통·상권과 자연스럽게 연결될 경우만 10~30초 제안. 서사를 경제·주식 강의로 바꾸지 않는다.

## 단계 5. TOP10 후보 점수와 선정
후보마다 제목, 주인공 MEDIA_ID, 보조 MEDIA_ID, 핵심 질문, 첫 5초 화면, 0~30초 훅, 첫 보상, 중간 반전, 엔딩 회수, 뉴스 ISSUE_ID, 독창적 해석, 자료 상태, 원본 권리, 예비 영상 길이 기록.
참고용 100점: 실제 화면 볼거리 25 + 검증 가능한 반전·원음 20 + 질문→보상 전개 20 + 최신·독창적 관점 15 + 자료/출처 정확성 10 + 제작·허락 실현 가능성 10.
이 점수는 시청 유지율·추천 알고리즘 성과를 예측한 실측 모델이 아니다.
TOP10 → 상위3 비교표 → 최종1 추천. 미확인 원음·허락이 필수라면 '구조 실험 가능 / 게시 보류' 구분.

## 단계 6. 출력할 자료 패키지 (다음 대본 프롬프트 입력)
새 작업 폴더에 다음만 작성:
01_media_catalog.csv
02_transcript_timeline.csv
03_benchmark_story_dna.csv
04_news_evidence.csv
05_topic_top10.md
06_topic_top3_and_choice.md
07_rights_register.csv
08_STORY_INPUT_PACKET.md
09_execution_log.md

08_STORY_INPUT_PACKET.md의 필수 필드:
PROJECT_ID, SELECTED_TOPIC, TARGET_AUDIENCE, PRIMARY_PROTAGONIST, SOURCE_VIDEO_ID, STORY_QUESTION, VERIFIED_REACTION_QUOTES_WITH_SECONDS, FIRST5S_VIDEO_CANDIDATE, FACT_IDS_AND_URLS, HOOK_H_CODE, STORY_S_CODE, Q_A_LOOPS, FIRST_REWARD, MID_REVERSAL, END_CALLBACK, PERMITTED_MEDIA_IDS, RIGHTS_PENDING, OPTIONAL_EDUCATION, MISSING_FACTS.
영상·자막 실제 확보 여부와 날짜를 맨 위에 적고, 미확보 발언은 [원음 미검증]으로 표시. 원본 전체 자막을 공개 GitHub에 복제하지 않는다.

## 최종 승인 게이트
- 실제 작업 수행 로그가 없으면 '수집 완료'라고 말하지 않는다.
- 추출 실패라면 우회 대신 작업 중단·보고, 대신 자료가 있는 주제로 TOP10을 구성 가능.
- 외부 소스 편집용 사용 = 권리·이용약관·YouTube 정책 별도 확인 필요. 몇 초 이하 허용 같은 규칙 생성 금지.
- 로컬 Hermes/모델/3090 GPU/Docker/n8n/원본 보존. 다른 작업과 충돌하지 않도록 LIGHT 9B 목록·점검, HEAVY 27B 조사·분류, ULTRA 27B 복잡한 출처 충돌 때만.
- 새 대본 생성은 다음 문서 KUKPPONG_SCRIPT_PROMPT_ONLY.md에 08_STORY_INPUT_PACKET.md를 입력하여 수행한다.
