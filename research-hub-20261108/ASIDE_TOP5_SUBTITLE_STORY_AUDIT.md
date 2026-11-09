# 🔴 Aside 국뽕 고조회 TOP5 자막·전개·컷 추출 프롬프트 V1
기준일 2026-11-09 | 원자료는 개인 로컬 폴더에만 저장. 공개 GitHub에는 분석·출처 링크·짧은 인용만.
## 실행 지시
당신은 Aside의 로컬 분석 에이전트다. 실제 터미널에서 가능한 범위의 명령을 실행하고 로그를 남겨라. **원문이 없는 영상에 가짜 해외반응·대사를 지어내지 마라.** 기존 n8n/Docker/H3/3090 GPU 서버/모델/원본 파일을 멈추거나 수정하지 않는다. 프로그램 설치, 유료 API, 로그인·쿠키·DRM·차단 우회 금지. 새 작업 디렉토리에만 결과 생성.
### 🔴 사용자 필수 입력
작업 결과 저장 위치: [예: /home/yh/ai-work/jobs/kukppong_captions_20261109]
추가 사용 권리 확보된 영상 파일 폴더: [없음/경로]
기존 설치 ASR 사용 허용: [아니오 / 사용 가능]
배포 예정 언어: [한국어]
### 우선 TOP5 (2026-11-08 GitHub 저장 수치, 현재 실시간 순위 아님)
1) 조회수 1위: https://www.youtube.com/watch?v=1eBPSEp3mJc 쇼미코리아, 영국인 부부 중국vs한국 고속철 비교, 2,145,279회. 비교·반전 후보.
2) 조회수 2위: https://www.youtube.com/watch?v=zUGo3CXgHkc 반응을 보다, 누리호 해외반응, 1,184,404회. 비판→역전 후보.
3) 조회수 3위: https://www.youtube.com/watch?v=6tytUWF-i4M 한국에, 반했대요, 영국 커플의 첫 서울 체험, 987,240회. 일상 체험·연속 발견 후보.
4) 조회수 4위: https://www.youtube.com/watch?v=4AWYckCz99k 한국이처음이라서, 인도 유튜버 한국 차별 여부 확인, 795,307회. 편견→현장 검증 후보.
5) 조회/구독 상대순위 1위: https://www.youtube.com/watch?v=ltLDmUM7rxs 코리아국뽕한사발, 일본 패널/대만 반응, 76,187회, 구독 대비 1,015.8배. **절대 조회수 1위와 별개**.
출처 https://github.com/geben147-create/Insta/blob/main/youtube-kukppong-rising-20261108/index.html
### STEP 1. 자막 확인: 실제 수행
1. 영상마다 'yt-dlp --list-subs "영상URL"' 실행. 설치 부재·접근 금지면 실패 사유를 보고하고 자동 설치·우회하지 않는다.
2. 정상 접근과 이용이 허용되면 아래 형태로 공식·자동 자막만 신규 폴더에 내려받는다. 영상 원본 다운로드는 수행하지 않는다.
   yt-dlp --skip-download --write-subs --write-auto-subs --sub-langs "ko.*,en.*,ja.*,zh.*" --sub-format "vtt/srt/best" -o "captions/%(id)s.%(ext)s" "영상URL"
3. 자막이 없다면 제공되지 않음/403/429/툴 오류/그 외 차이를 기록. 권리자 승인을 받은 로컬 영상과 사용 허가된 기존 ASR만 있을 경우 ASR 분석 가능, GPU 충돌 시 중지.
4. 원어 원문/한국어 번역/채널 나레이션/영상에 삽입된 제목·자막/음악은 구분. 제목 속 극찬은 실제 원음으로 절대 간주 금지.
### STEP 2. 타임코드 원문표
video_id,start_s,end_s,speaker,language,original_text,korean_translation,track_type,confidence,source_url
자동자막 중복은 제거, 부정어·인물·국가·숫자는 의미를 바꾸지 않고 보존. 전체 원문은 로컬 전용. 공개 GitHub에 전문을 올리지 않는다.
### STEP 3. 실제 전개 DNA
각 영상의 최초 5초/15초/30초에 무엇을 보여주고 어떤 말을 했는지 실제 증거로 라벨링한다.
H01~H14 훅 / S01~S09 전개 / Q&A 루프(명시·암묵 질문, 답변 시각, 새 질문 시작, 보상 지연 시간) / 실제 반전 타임코드 / 첫 보상 시점 / 감정·인물 변화 / 끝의 도입 회수 / 중간 낚시 여부.
중간 1/3, 2/3, 마지막 1/3에 새로운 증거·감탄·역전·유머·비판·정정 중 어떤 일이 일어났는지 계산한다. 8비트 고정하지 말고 실제 비트 수를 기록한다. 원문 없는 항목은 UNKNOWN.
### STEP 4. 영상·오디오 비중 분리
권한 있는 원영상 또는 사용 허가된 영상 파일에서만 실제 화면 확인. 없으면 VISUAL_UNVERIFIED.
shot_id,video_id,start_s,end_s,source_kind,source_url,foreign_audio_seconds,korean_voiceover_seconds,original_clip_seconds,rights_status,camera_movement,emotion,reason_to_keep_watching
영상 화면 비중과 외국인 원어 음성 비중을 따로 계산. **몇 초 이하 법률상 면책 같은 임의 규칙 금지.** 원음·BGM·방송 장면 별도 권리 확인.
### STEP 5. 인기와 실패 차이
각 영상과 같은 채널의 비슷한 시기 저조회 1~2편을 선정하고, 제목·영상 나이·레퍼런스 신선도·실제 인용·초반 보상·관객 충족을 비교.
조회/구독배수는 누적 VPH가 아니다. 실제 CTR·유지율을 모르면 추정과 실제를 혼동하지 않는다.
실제로 본 영상인지, 자막만 본 영상인지, 제목만 있는 영상인지 세 단계로 표시: VIDEO_VERIFIED / SUBTITLE_VERIFIED / TITLE_ONLY.
### STEP 6. 10개 산출물
01_subtitle_status.csv (영상별 성공·실패·언어)
02_transcript_segments.csv (실제 원문/번역/시각)
03_hook_qa_loops.csv (질문답 횟수·보상 시각)
04_visual_audio_timeline.csv (화면/원음/해설 초 비율)
05_top5_video_dna.md (각 영상 훅/전개/반전/감정 실제 근거)
06_high_low_comparison.md (성공·실패 한쌍)
07_rights_register.csv (원본 영상·음원·초상·허락 범위)
08_reusable_scene_candidates.csv (권리 확인된 장면만 본편 후보)
09_execution_log.md (실행된 명령·실패 이유)
10_handoff_summary.md (GPT에 전달할 근거별 짧은 요약·타임코드, 전문 공개 금지)
종료 시 실제 자막 수집 X/5, 실제 영상 확인 X/5, 실제 권리 확보 X/5, 미확인 발언 수 및 실행 미완료 항목 명시.
### STEP 7. 대본 제작 이어가기
별도 프롬프트 링크:
https://github.com/geben147-create/Insta/blob/main/research-hub-20261108/KUKPPONG_REACTION_SCRIPT_VIDEO_MASTER_V1.md
절대 클립을 나열만 한 영상, 가짜 통역, 한국 자랑 일색의 무근거 대본을 생성하지 말 것.
로컬 티어: LIGHT 9B 검사, HEAVY 27B 구조 분석/원문 정렬, ULTRA 27B 복잡한 출처·권리 충돌 검토. 클라우드 자동 호출 금지.
