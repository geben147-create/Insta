# Codex 마스터 지시서: 4계정 × 20일 × 하루 10개

## 데이터
대시보드 https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110800
A AI창업: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110801
B AI주식·경제: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110802
C AI마케팅: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110803
D 지원금·돈정보: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110804
이미지 레퍼런스 128개: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110806
2026-11-07 구글 트렌드 실측: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110805
연속 관측 로그: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110807
외부 HTML 갤러리: https://geben147-create.github.io/Insta/insta-benchmark-strategy/

한국어로 작업하고 실측과 추정치를 구분하라. 800개는 BRIEF_ONLY 상태인 기획안이고 실제 이미지 생성/게시 건수는 0이다. 전체를 한 번에 생성하지 말 것. 우선 4계정의 대표 1개씩 4개 표지 시안만 만들고 사용자가 승인해야 확대한다.

## 정확한 이미지 레퍼런스 사용
각 Google Sheet 행의 원본 사진링크①, 원본 이미지링크②, 원본 계정, 첫 훅, 좋아요, 댓글, 조회수(사진 비공개 가능), 참여지수, 새 훅 A/B, 이미지 생성 프롬프트, 캡션과 첫댓글을 차례대로 읽는다. Instagram 릴스 500만 이상 참조 열은 별도 형식의 훅 연구용이며 사진 게시물의 조회수로 계산하지 않는다.

정확한 Instagram 원본 페이지를 읽고 내부 참고용 표지/본문 이미지 파일을 실제로 확보한다. 이 파일을 이미지 생성 도구의 image reference 입력에 첨부하기 전에는 참조 사용 성공이라고 쓰지 않는다. 원본 파일을 확보하지 못하면 REFERENCE_IMAGE_MISSING, 생성 모델 접근이 안 되면 IMAGE_BACKEND_MISSING. 원본 저작물/캐릭터/로고/워터마크/글귀/실존 인물은 복제하지 않는다. 참고 원본은 공개 GitHub, 게시물, 전달 ZIP에 넣지 않는다.

## 이미지와 한국어 조판
1080×1350(4:5) PNG. A 딥그린·민트, B 네이비·파랑·골드, C 로열퍼플·라벤더, D 커피·크림·골드.
원본 이미지 장르를 확인하고 사진형은 새로운 사진형, 인스타툰은 새로운 원화로 8컷, 원페이지는 읽기 쉬운 표 한 장, 캐러셀은 행의 장수대로 디자인. 모든 결과를 동일한 파스텔 캐릭터로 획일화하지 않는다.
상단 제목은 최대 2줄(80~105px 시작), 본문 36~48px을 기본 검토, 출처 20~24px 이상, 세이프존·대비·모바일 가독성 검수. 한국어 AI 생성 오탈자는 별도 텍스트 조판으로 수정한다.

## 트렌드 검수
https://trends.google.com/trending?geo=KR 의 실제 관측시각·검색어·검색량 하한·증가율·활성여부·화면 표시순서·공식 URL을 기록한다. RSS: https://trends.google.com/trending/rss?geo=KR . 한 번 조회 후 오류·차단·429면 실패를 보고하며 우회하지 않는다. 과거 11월 7일 기준 노무라 증권, 김영익, 퇴직, 지포스 등은 Google 검색 증가일 뿐 새로운 뉴스의 사실을 입증하지 않는다. 미래일은 FUTURE_NOT_OBSERVED. Instagram VPH는 동일 URL 2시점의 공개 조회수로만 계산하고 단일 스냅샷은 NOT_MEASURED. 관심도 1000% 표시는 IG 조회수가 아니다.

## 사실·저작권
금융은 DART, KRX, 한국은행, SEC 등 원문과 날짜 검증. 정부지원은 K-Startup·기업마당·관할기관 원문 공고로 자격/기간/상환/지원액 확인. AI 도구는 실제 가격과 상업이용 정책 확인. Meta 계정상태, 원본권리, AI 생성표시, 협찬 표시, 인위적 참여 유도 금지 검수. 검증하지 않은 숫자는 넣지 않는다.

## 출력 형식
새 폴더 outbox/YYYY-MM-DD/ACCOUNT/POST_ID/에 cover.png, slides/01.png..., caption.txt, first_comment.txt, actual_input_reference_manifest.private.json, source_checks.md, prompt.txt, qa.md, status.json을 기록. 기존 Hermes/n8n/ComfyUI/GPU 추론/모델/파일/설정 삭제·중지·재설치 금지. 신규 유료 API·모델 설치는 승인 필요.
AI 이미지 파일이 실제 저장됐을 때만 생성 성공으로, 사람의 게시 URL 확인이 있을 때만 HUMAN_PUBLISHED로 기록한다.
Instagram API·자동 업로드·자동 댓글·자동 DM·최종 게시 금지. Aside로 전달 시 사용자가 최종 등록 버튼을 누르는 흐름만 허용.
최종 보고에 생성 이미지 미리보기·픽셀·바이트·모델·원본 링크·문구·검수 결과·실패 원인을 한국어로 적어라.