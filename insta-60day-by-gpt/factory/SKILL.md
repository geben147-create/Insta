---
name: instagram-four-account-factory
description: Google Sheets 4계정 14일 큐를 원본 참고/뉴스 검증/8컷 캐러셀 새 이미지 생성/Aside 게시 준비로 연결
version: 1.0
---

# Instagram Four-Account Factory

Trigger: 사용자가 A(경제·주식), B(투자대가), C(AI창업), D(글로벌 한국반응) 4계정 당일 콘텐츠 제작을 요구.

Inputs: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit, GPT_P01_14일_70콘텐츠, GPT_P03_검증후크_500만, GPT_P02_실시간급등_탐지, GPT_P04_Aside_승인큐, 로컬 ZIP day1 JSON / private_refs 썸네일.

Process:
1. Read-only 원본·이미지 백엔드 확인.
2. 원본 조회수·캡션·출처 및 허가 검증, 500만뷰 이상은 과거 수치로 표시.
3. Google Trends 현재 이슈를 2개 사실출처로 확인, t1/t2 없으면 IG 구간VPH NULL.
4. 독창적 8슬라이드×4계정, 1장8컷, 9:16 커버, 캡션·해시태그 생성.
5. AI 라벨·허위사실·금융/광고 규정·IP·폰트·화질 검수.
6. outbox 신규 파일만 저장, Google Sheet 상태 IMAGE_GENERATED/QA_PENDING.
7. 사용자 APPROVED_LOCAL 후 Aside 공식 웹 업로드 화면 준비. 마지막 등록 버튼은 사람만 클릭.
8. 결과 한국어로 보고. 모델 없으면 IMAGE_BACKEND_MISSING.

Never: 원본 이미지 공개 업로드/복제, 무단 결제/설치, Instagram API 자동게시, 계정정지 우회, 가짜 참여·대량 DM, 키/세션 노출.
