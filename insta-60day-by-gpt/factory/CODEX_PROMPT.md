# CODEX PROMPT | 4계정 Instagram AI 제작 시작

아래 작업을 현재 내 PC의 Codex에서 수행한다. 별도 ZIP의 docs/CODEX_MASTER_PROMPT.md가 상세 지침이며 이 요약보다 우선한다.

## 목적
기존 Google Sheet https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit 에서 다음 탭을 읽는다.
- GPT_P01_14일_70콘텐츠: 실제 큐
- GPT_P03_검증후크_500만: 2026-11-04의 500만뷰 이상 원본 14개
- GPT_P02_실시간급등_탐지: Google 검색 관심도, 유효 기간에 측정한 Instagram VPH 분리
- GPT_P04_Aside_승인큐: 승인상태·로컬 폴더 경로

첫 실행에서는 별도 ZIP의 day1/first_5_posts.json 다섯 개 ID를 읽어 딱 그 게시물만 생성한다. A 경제/주식 2개, B 투자대가 1개, C AI창업 1개, D 글로벌 한국 1개. 하루 5개 실제 게시 계획, 추가 5개는 미게시 QA 큐로만.

## 생성 지시
1. 사용 가능한 이미지 생성 백엔드/모델·폴더·Python·FFmpeg·GPU 상태를 읽기 전용으로 확인. 기존 ComfyUI/Hermes/n8n 실행 중 작업이나 다운로드 중단·재설치·삭제 금지. 모델이 없으면 IMAGE_BACKEND_MISSING 상태로 정확하게 보고하며 가짜 결과물 생성 금지.
2. 사용자가 제공한 private_refs/*.jpg는 출처·레이아웃 밀도·훅 구조만 내부 참고. 얼굴·브랜드·사진·문구·구도를 그대로 복제하거나 공개 Git에 업로드하지 않는다. 완전히 새로운 화면, 그래픽, 독자적 캐릭터, 비교표, 문구 제작.
3. 각 콘텐츠마다 8장 캐러셀 JPG(1080x1350, 01~08), 독립적인 한장 8컷 PNG(2160x2700), 릴스 커버(1080x1920)와 필요 시 독립 영상, caption_ko.txt, 번역 검수 후 caption_en/ja.txt, source_check.json, qa.json, post.json 생성.
4. 생성 AI 이미지 안에는 긴 글자를 넣지 말고, 폰트 라이선스 확인한 한국어 텍스트 오버레이로 최종 글자 생성. 안전영역·대비·읽기 순서·오탈자 검증. 8컷 한장에 글자가 너무 많으면 캐러셀에 상세 내용을 배분.
5. 내용은 기존 데이터와 공식 현재 출처를 구분. 주가·환율·뉴스 사실, 투자 거짓 확언·수익보장·가짜 외국인 반응 금지. 2026-11-04 과거 조회수는 실시간 VPH 아님. Google Trends 0~100은 상대지수임. 오늘 2개 출처로 확인되지 않은 트렌드는 PENDING_VERIFICATION, 에버그린 주제로 대체.
6. ID별 outbox/YYYY-MM-DD/{A,B,C,D}/{post_id}/ 새 폴더에만 출력. 중복 ID는 덮어쓰지 않고 별도 v2 승인 대기. 출력물이 완성되면 승인상태 IMAGE_GENERATED 또는 QA_PENDING; 이미지 없는 파일은 IDEA 유지.
7. 절대 Instagram 로그인·업로드·게시·DM·좋아요/팔로우 자동화하지 않는다. 유료 API/새 모델 설치/삭제·권한변경은 사용자 승인.
8. 첫 5개 결과는 파일 크기·픽셀·장수·사용 모델·생성시간·에러·원본 출처·비용·미확인 이슈를 한국어 표로 보고한다. 결과가 있으면 사람에게 검수 요청, 이후 Aside 프롬프트로 단계 이동.
