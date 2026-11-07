# 실제 Google Trends 수집과 VPH의 차이

https://trends.google.com/trending?geo=KR
https://support.google.com/trends/answer/3076011?hl=ko
https://trends.google.com/trending/rss?geo=KR

Google Trends 한국 급등 페이지의 평균 갱신주기는 약 10분이고 4시간/24시간/48시간/7일 검색기간, 활성 여부, 화면 정렬, CSV/RSS 내보내기 기능이 있다. 2026-11-07 Google 화면의 관측 25건을 사용자가 소유한 Google Sheet https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=2026110805에 기록했고 그중 노무라 증권/김영익/퇴직/지포스 4건을 관련 후보로 표시했다.

중요: 화면 표시순서는 정렬된 화면의 위치이며 세계 전체 절대순위가 아니다. 2K+는 대략 검색량 구간/하한, +1000%는 Google 검색 관심 증가 표시이지 Instagram 조회수나 정확한 검색 수가 아니다. 공식 사이트의 실제 키워드 차트와 하한값으로 그린 간이 차트는 동일하지 않다. 20일 미래의 키워드/상승률은 미리 알 수 없어 매일 발행일에 재조회한다.

사진·캐러셀의 조회수 비공개는 미측정으로 유지한다. 동일 릴스를 두 시각 T1, T2에 읽고 두 조회수 V1,V2가 있을 때만 VPH=(V2-V1)*60/경과분을 계산한다. 좋아요+댓글×5 참여지수는 VPH/조회수가 아니다.

동봉 Python 스크립트는 Google 공식 공개 RSS를 1회 가져와 로컬 CSV로 저장할 뿐이다. RSS는 화면 전체 트렌드를 모두 포함하지 않을 수 있으며, 로그인·시트 편집·인스타그램 업로드는 수행하지 않는다. 429/403/CAPTCHA 시 우회 반복 호출 금지.