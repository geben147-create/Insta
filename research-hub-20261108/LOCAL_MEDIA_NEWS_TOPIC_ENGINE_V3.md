# 🧠 로컬 영상 × 최신 뉴스 × 전개 DNA 주제 선정 엔진 V3
날짜: 2026-11-09 | 기존 연구 허브 내 부속 실행 프롬프트 | 사용: Ubuntu Hermes / Claude Code / Codex

## 목표
샤오홍슈·틱톡·유튜브 등 로컬에 합법적으로 보관된 영상에서 관찰한 장면, 신뢰할 수 있는 실시간 이슈, 과거 성공·실패 영상의 구조를 결합해 10개 후보를 선정하고 그중 1편을 독창적인 대본으로 쓴다.

## 핵심 원칙
- **다운로드/보관과 재배포·수익화 허락은 다르다.** 권리 미확인 영상은 연구·주제 발굴용일 뿐 본편에 자동 삽입하지 않는다.
- 사건일·발행일·촬영일·영상 업로드일·수집일을 따로 기록한다.
- 국적과 관련된 반응을 꾸며내거나 실제 외국인이 하지 않은 말을 인용하지 않는다.
- 현장 영상의 촬영 장소·시점과 보도 사실을 불일치한 채 붙이지 않는다.
- 전개 유형을 참고하되, 경쟁 영상의 표현·화면·대본을 통째로 복제하지 않는다.
- 사용자가 허락하지 않은 외부 API·클라우드 모델·로그인·쿠키·GPU 재시작을 자동 실행하지 않는다.

## 🔴 사람이 최초 입력
- 🔴 LOCAL_MEDIA_ROOT: [로컬 영상 보관 폴더]
- 🔴 언어·시장·목표 시청자: [한국어/한국/30~60대 등]
- 🔴 뉴스 기준: [오늘의 최근 24시간, 최근 7일, 최근 30일]
- 🔴 성과 레퍼런스: [기존 148개 급등 영상/장수 22편/추가 유튜브 URL]
- 🔴 장르: [해외반응, 여행, 기술, 경제, 역사, 드라마]
- 🔴 완성 영상 길이: [8분30초, 12분, 15분]
- 🔴 사용 허락 증빙: [자체촬영, 계약서, CC 상업 이용 검증, 보유 라이선스, 없음]
- 🔴 경제·ETF 교육 연결 허용: [없음, 자연스러운 경우만, 주제 핵심]
- 🔴 실행 범위: [주제 후보만 / 대본까지 / 컷시트까지]
- 🔴 자동 작업 금지 목록: [ ]

## STEP 0. 읽기 전용 탐색
1. ROOT 아래 영상·이미지·오디오 파일 목록과 SHA256·용량·상태를 읽는다. 원본 이동/삭제/교체/재인코딩 금지.
2. 사용자 운영 중인 Qwen 모델/H3/Docker/n8n을 종료·재시작하지 않는다. 추론 수행 전 충돌 가능성이 있으면 검토해 보고한다.
3. DRM/로그인/차단/개인정보 우회하지 않는다. 비공개 자료를 외부 저장소에 올리지 않는다.
4. GENERATED 상태 산출물은 자동으로 다시 생성하지 않는다.
5. 새로운 결과만 별도 작업 경로에 적는다.

## STEP 1. 로컬 자료 인덱스
media_assets.csv 필드:
asset_id,platform,creator,original_url,published_at,shot_at,local_path,sha256,duration_s,language,transcript_path,scene_keyword,scene_start_s,scene_end_s,visual_wow_reason,speaker_verified,license_type,permission_document,permission_scope,permission_expiry,allowed_to_use,rights_status,missing_metadata.
- 영상 실제 장면을 관찰할 수 없으면 VISUAL_UNVERIFIED를 표시한다.
- 인물 표정, 손동작, 공간, 색감, 초반 5초, 전후 변화, 현장 원음, 화자·번역을 개별 라벨링한다.
- 권리 증빙이 없으면 RIGHTS_UNCONFIRMED. 조회수 높은 출처라도 그대로 삽입하지 않는다.
- 소재로만 참고하는 영상과 실제 사용 가능한 영상은 다른 목록으로 관리한다.

## STEP 2. 최신 기사·논문·공시
issue_sources.csv: topic,source_url,source_type,published_at,event_at,data_period,observed_at,claim,verified_primary,evidence_for,evidence_against,license_status,allowed_usage.
- 최근 24시간/7일/30일 자료를 구분하고, 정부 공식 발표·공시·원논문을 1차 근거로 우선 조사한다.
- 서로 모순되는 발표가 있으면 조용히 하나만 택하지 말고 그 이유를 정리한다.
- 최근 뉴스가 없으면 에버그린으로 전환하고 마치 실시간 속보처럼 포장하지 않는다.
- 뉴스 사진과 동영상의 저작권은 기사 속 사실과 별도이다.

## STEP 3. 기존 허브에서 구조 읽기
- https://geben147-create.github.io/Insta/research-hub-20261108/#rising
- https://geben147-create.github.io/Insta/research-hub-20261108/#longrun-emotion
- https://geben147-create.github.io/Insta/research-hub-20261108/#storydna
- https://geben147-create.github.io/Insta/research-hub-20261108/#case-study
영상별 H01~H14, S01~S09, 질문답 반복, 첫 보상 위치, 반전 위치, 소스 화면/음성 분리. **전체 자막 미확보 시 실제 대사 수/원음 비중 등을 추정으로 채우지 말 것.**
조회수 ÷ 구독자 배수, 누적 평균 VPH, 최근 구간 VPH는 별도 지표로. 같은 채널의 비슷한 시기·주제 성공/실패 한 쌍을 반드시 비교한다.

## STEP 4. 세 자료를 JOIN해 주제 후보 10개
A: 로컬 장면의 시각적 힘(첫 5초에도 무엇이 보이는가)
B: 최신 사건/논문의 검증 가능한 새 정보
C: 입증된 성공·실패 형식에서 새 주제에 맞는 훅·전개·보상
D: 개인적 공감/감동 또는 자연스러운 소비자·경제·주식·ETF 교육
E: 권리, 진실성, 반대 근거, 제작비·소요 자원

### 100점 점수 (알고리즘 흥행 예측이 아니라 기획 평가)
새로움·확인 가능한 반전 25
영상 화면 자체의 볼거리 20
훅→부분 답→반전의 설계력 15
원자료 정확성·신뢰성 15
같은 채널 성공/실패 대비 차별점 10
시청자 실용성·경제교육 연결 10
제작비·구현 용이성 5
= 100점. 각각 1~3문장의 근거와 UNKNOWN 상태를 함께 작성.
저작권이 주제 구현의 핵심 문제라면 RELEASE_BLOCKED. 직접 촬영·허가 B-roll·자체 그래픽으로 안전하게 대체 가능하면 REWORKABLE.

## STEP 5. 최상위 3개 → 1개 선정
3개 후보를 같은 표에서 비교한다:
제목, 후킹 0~5초, 5~15초, 15~30초, 새 증거, 8비트, 질문 답변 수, 결말 회수, 자연스러운 감정선, 영상 장면, 뉴스 출처, 허락 상태, 제목의 약속과 사실 일치 여부.
인간이 선택하지 않았으면 1위 자동 제안은 가능하지만 실재 제3자 원본을 본편에 자동 사용하지 않는다.

## STEP 6. 1:1 출처 매칭 대본 작성
출력:
- TTS 풀 대본 (목표 길이, 장면 타임코드)
- scene_id/start_s/end_s/narration/onscreen_word/visual/voice/BGM/SFX/rights_status
- 각 비트별 H 코드, S 코드, 근거 뉴스 URL, 레퍼런스 영상 URL, **실제로 영향을 준 형식**, 직접 표현을 복사했는지 여부
- 문장마다 FACT, NARRATOR_OPINION, EDUCATION, RHETORIC 표시
- 새 비평·교육·해석의 문장·글자 비율 정확히 계산, 계산기준 명시
- 원본 반응 인용은 화자/언어/원어/번역/날짜/권리 증빙이 있어야만 삽입
- 영상 소스 권리자가 허락하지 않으면 자체 그래픽/라이선스 촬영본으로 전환
- 편집 후 최종 클립 실제 사용 시간은 원본별 seconds, timeline%, critical-part-reused 표시

## STEP 7. 주식·ETF·경제 내용 적용 방식
CORE: 철도·투자·기업 실적이면 교육이 핵심, 대본의 10~25%까지 자연스럽게 가능.
BRIDGE: 해외반응·음식·여행이면 소비자 수요·지역경제·산업의 5~12%에서 끝날 수 있음.
NONE: 감동·사연·순수 여행에서는 0%도 허용. 브랜드 홍보 때문에 이야기를 끊지 않는다.
교육 내용 예:
- 고속철: 이용객 증가 vs 객단가·매출·영업이익·이자·설비투자
- 음식/관광: 외국인의 반응 vs 실제 소비자 매출·수출·브랜드 수익
- 역사/부동산: 교통 발달 vs 상권의 실질적 수익·임대료
- AI 기술: 신제품 뉴스 vs 실질 계약과 현금흐름
- ETF: 편입 종목·지수·보수·변동성·환율
- 코인: 네트워크 사용량과 토큰 가치의 차이, 유동성·규제 위험
특정 매수/매도·목표 수익률 보장·맞춤형 금융자문은 진행하지 않는다. 추후 유료 구독 및 시그널 판매 계획이 있으면 관련 국내 투자자문·유사투자자문업 규정과 광고 규제 확인을 별도 승인 단계로 둔다.
규제 참고: https://www.fsc.go.kr/no010101/82887

## STEP 8. 최종 사후 검수(법률 판단 대신 위험 게이트)
script_line_id → hook/story code → benchmark URL → fact URL → video asset ID → edit_seconds → rights/license → own commentary/education → critical risk → approval.
다음 6개 독립 심사:
1. 타인의 원고·문장·대사의 실질적 유사성
2. 실제 재사용한 영상·외국어 원음·음악·사진·스크린샷의 각각 권리
3. 한국 저작권법 제35조의5 등 적법한 이용 판단(원본의 중요한 부분 사용 여부, 영리성, 시장 영향 포함)
4. 플랫폼 재사용 콘텐츠·비진정성 콘텐츠 수익화 판단
5. 개인정보·초상권·명예·오역·기만적 편집
6. 특정 금융상품과 유료 추천 서비스 규제·광고
"3초/5초 미만은 무조건 안전" 또는 "의견 30%이면 안전" 같은 기준을 사용하지 않는다.
허락 확인 못 한 소재가 실제 결과물에 들어간 경우, 출처 표시·교육용·TTS 해설이 많아도 BLOCKED_FOR_RIGHTS_CHECK.

## 산출물
01_media_assets.csv
02_news_sources.csv
03_topic_top10.md
04_topic_top3.md
05_selected_8beat_script.md
06_scene_edit_timeline.csv
07_reference_to_script_map.csv
08_rights_revenue_policy_audit.md
09_human_approval.md
10_manifest.json
원본 미디어·기존 n8n·운영 디렉토리를 수정하지 않는다.

## 로컬 모델 배정
LIGHT Qwen 9B: 파일/자막/시간 메타데이터 점검.
HEAVY Qwen 27B: 구조 분류, 뉴스+영상 연결, 대본 작성.
ULTRA Qwen 27B: 복잡한 출처 충돌/권리/안전 아키텍처.
클라우드 호출 금지. GPU 추론·대형 비디오 처리에 들어가기 전 현재 실행 중인 작업 점검, 충돌 시 중지·보고.
