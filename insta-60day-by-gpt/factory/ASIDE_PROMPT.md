# ASIDE PROMPT | 내 컴퓨터 Instagram 게시 준비, 인간 최종 승인

업무: 당일 5개 콘텐츠를 안전하게 인스타그램 공식 웹 UI의 **게시/Share 버튼 누르기 직전**까지만 준비한다. API 업로드 금지.

1. 사전 조건: Codex가 생성한 outbox/YYYY-MM-DD/{account}/{post_id} 폴더와 이미지 8개, caption, source/qa 메모를 확인. Google Sheet https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit의 GPT_P04_Aside_승인큐에서 APPROVED_LOCAL만 고른다.
2. 먼저 현재 Instagram에 로그인된 실제 프로필 핸들을 사용자로부터 승인받은 A/B/C/D와 비교. 다른 계정이면 중단. 임의 계정 전환·가입·재인증·2FA 우회 금지.
3. 허가받은 로컬 폴더의 파일 탐색기를 열고 정확한 01~08 JPG와 캡션 파일을 준비한다. 공식 Instagram + 만들기 UI에서 정상적인 파일 선택 또는 드래그만 사용. 사용자 설정에 따라 Aside가 파일을 선택할 수 없으면 사용자가 직접 드래그하도록 준비한다.
4. 파일 업로드/미리보기 순서, 자막 오탈자·AI 생성 표시·광고표시, 계정 A/B/C/D, 프로필 제목, 해시태그와 정책 알림을 화면에서 재확인한다. 8장 중 누락 있으면 중단.
5. **게시/공유/등록/Publish/Share/예약 최종 확정 버튼은 절대로 클릭하지 않는다.** 예약 확정도 사용자가 한다. 1게시물씩 처리하고 사용자 최종 클릭/실제 URL 확인 후에만 다음 게시물을 준비한다.
6. 사용자 실제 게시 완료가 확인되지 않으면 ASIDE_PREPARED로 기록. 추측으로 HUMAN_PUBLISHED라고 기록하지 않는다.
7. 계정 제한/캡차/상태경고 시 즉시 BLOCKED_ACCOUNT_CHECK. 매크로 무한반복, 계정간 좋아요 맞교환, 자동 팔로우·대량 댓글/DM·무단 로그인·스팸 유도 금지.
8. 새 계정 최초 시작 전 프로 대시보드의 Best Practices, Account Status, 추천 자격, 프로필 소개, 링크, AI/광고 라벨의 **현재 값**을 읽기만 한다. 어떤 설정이든 변경하려면 초안을 먼저 보여주고 사용자 승인.
9. 한국어 리포트: ID, A/B/C/D 실제 핸들, 8장 경로, 캡션 확인, AI/광고 표시, 마지막 남은 버튼, blocked 이유. 게시 버튼 외 추가 클릭이 필요하면 정직하게 알릴 것.

인스타그램 웹 UI/브라우저 권한이 없는 경우 ASIDE_UI_UNAVAILABLE로 보고하고 로컬 폴더만 안전하게 연다. 최종 업로드 성공 주장 금지.
