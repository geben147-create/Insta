# 🎙️ TOP5 실제 자막·화면·질문답 전개 추출 작업지시서
2026-11-09 | 연구 허브의 장수 채널 22편 대본·감정 분석을 **전체 자막 및 타임코드 실측**으로 보강하는 로컬 Hermes/Codex/Claude Code용 프롬프트

## 목적
“영상 화면의 비중이 큰 성공 영상”과 “한국어 내레이션이 대부분을 이끄는 영상”을 구별한다. TOP5 전개를 모호한 인상평이 아니라 **실제 말한 문장, 응답 시간, 원본 화면의 출처, 타임라인**으로 수치화한다.

### 우선 확인할 5개 (저작권 면책 순위가 아니라 형식 연구 우선순위)
| 유형 | 영상 ID | 채널/영상 | 기존 관측 화면 | 기존 관측 음성/주의 |
|---|---|---|---|---|
| 해외 체험 원본 중심 | wkH1sC6pJe4 | why?와이튜브 · 한국 거리 체험 | 외국인 브이로그 약 75% | 외국어 원음 상당 부분. 출처·허락 확인 필요 |
| 해외 영상+번역·해설 | cmJYVS1TNJE | 단골이슈 · 프랑스 청계천 | 외국인 브이로그 약 66% | 최대 60초 원음 구간. 고위험 |
| 해외 뉴스+한국어 설명 | dx06vfp9nRE | 트래블튜브 · 우크라 재건 | 해외 뉴스 약 55% | 해설 100% 보고, 외신 출처·사실검증 필요 |
| 다수 외국인 리액션 | Ue-x6hr6FHU | 국뽕에 취하다 · 포레스텔라 | 리액터 약 89% | 자체 나레이션이 적을 가능성, 음악·공연 권리 별도 |
| 내레이션 100%+다출처 화면 | uM6OlPR-5uM | 쓸모왕 · 해외 방송 반응 | 스톡 44%, 한국 방송 20% 등 | 2020년 영상, 내레이션 중심의 구형 대조군 |

각 출처와 비율은 기존 2026-11-08 분석 보고서의 관측/추정이다. 새로운 수집을 완료했다는 뜻이 아니다. 사용 허락·채널 수익화 검증 여부와 별개다.
분석 후에는 성공 조회 사례 #4(4AWYckCz99k), #12(6tytUWF-i4M), #14(zUGo3CXgHkc), #17(1eBPSEp3mJc)를 **추가 후보**로 검사하되, 이 네 영상은 아직 화면 비중을 검증하지 않았으므로 상위 5개로 확정하지 않는다.

## 🔴 입력과 안전 경계
- 🔴 작업 위치: [예: /home/yh/ai-work/jobs/story-dna-20261109/]
- 🔴 영상 파일이 사용 허용된 경우만 파일 경로 등록: [ ]
- 🔴 공개 접근이 허용된 자막 또는 사용 권한이 있는 로컬 소스: [ ]
- 🔴 새 TOP5 영상 ID를 바꾸려면: [ ]
- GitHub 원본 저장소·Google Sheets 원본·운영 중 Docker/n8n·GPU 프로세스 변경 금지.
- 실행 전에 읽기 전용으로 경로와 설치된 yt-dlp/ASR/ffprobe/ffmpeg 버전을 검사한다.
- 기존 설치가 없다면 자막 확보 가능 범위와 누락을 보고하고 설치·모델 다운로드·외부 API 사용을 임의로 진행하지 않는다.
- DRM, CAPTCHA, 로그인 우회, 차단 회피, 허락 없는 원본 재배포 금지.
- 자막 다운로드는 해당 플랫폼 이용약관·권한에 맞는 공개 접근 범위에서만 수행한다.
- 원본 자막 전문은 개인 로컬 작업 폴더에서만 관리한다. GitHub에는 분석표와 짧은 인용·링크만 커밋한다.

## STEP 1. 영상별 자막 트랙 존재 여부 검사
작업당 URL은 https://www.youtube.com/watch?v=VIDEO_ID 형식. VIDEO_ID를 위 5개 ID로 각각 대체한다.

~~~bash
yt-dlp --list-subs "https://www.youtube.com/watch?v=VIDEO_ID"
~~~

각 영상별 공식 자막 종류, 자동 자막 언어, 자동 번역 여부, 게시자 제공 여부, 오류(403/429/자막 없음)를 그대로 기록한다. 원어를 번역 트랙과 혼동하지 않는다.

## STEP 2. 허용된 자막만 수집
~~~bash
yt-dlp --skip-download --write-subs --write-auto-subs \
  --sub-langs "ko.*,en.*,ja.*,zh.*" \
  --sub-format "vtt/srt/best" \
  -o "captions/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=VIDEO_ID"
~~~
공식 자막 실패 시 이미 설치된 youtube-transcript-api를 확인해 공개 제공 트랙을 조회한다. 막힌 경우 실패 유형을 정확히 기록하고 멈춘다. 권한 없는 파일을 다운로드하거나 쿠키 우회하지 않는다.

## STEP 3. 오디오 자막과 해설 분리
자막이 제공되지 않고 이미 적법하게 확보한 로컬 영상이 있다면, 기존 로컬 ASR을 이용해 타임코드 대본을 생성한다. 설치·모델 변경·GPU 점유 전 🔴 승인.
- 트랙 ① 한국어 내레이션 / ② 외국인 실제 원음 / ③ 음악·공연 / ④ 침묵·환경음 / ⑤ 불명으로 분류한다.
- 동일 순간 두 음성이 겹치면 겹침 표시하고 중복 초 합계를 전체 길이로 잘못 나누지 않는다.
- 영문 자동 번역만 있을 때 한국어 원음이라고 추정하지 않는다.
- 실제 외국어의 한글 번역을 생성할 때 원문, 번역, 화자, 시각을 연결한다.
- 실제 발언에 없는 “와우/충격/극찬”은 절대 추가하지 않는다.
- 제목·시각 자막·한글 번역 바는 실제 발화와 구분한다.

## STEP 4. 영상 화면 분류
가능한 범위에서 **실제 권한을 가진 영상 파일** 또는 사전에 생성된 합법적 썸네일·프레임 데이터를 분석한다. 정해진 1초 또는 전환점 샘플링을 함께 활용하되 정지 화면은 연속 프레임 사이 변화로 확인한다.
- source_kind: 외국 브이로그, 해외 뉴스, 중국/일본 원본, 리액터, 경기/공연, 스톡, 한국 방송, 자작 그래픽, AI 재연, 공식 자료, 불명.
- clip_source_url, start_s, end_s, visible_source_name, watermark, frame_change, crop, PIP, voice_kind, confidence 기록.
- 화면 “출처 점유율”과 “발화 점유율”을 별도 산출. 외국 영상 비중이 높다고 원어 음성 비중도 높다고 가정하지 않는다.
- 실제 화면 파일이 없다면 SCREEN_UNVERIFIED로 표기, 제목/자막만 보고 화면 비율을 계산하지 않는다.

## STEP 5. 전개 분해
대본·장면표를 5~20초 또는 의미 단위로 나누어 아래 라벨을 배정한다.
- hook_primary: H01~H14 중 1개.
- hook_secondary: 보조 유형 0~2개.
- story_primary: S01~S09 중 1개.
- beat: B1~B8 또는 실제 장르에 맞는 비트 수.
- rhetorical_label: HOOK/Q_MAIN/Q_SUB/A_PARTIAL/A_FINAL/EVIDENCE/SOURCE_QUOTE/METAPHOR/COMPARISON/SETUP/CONFLICT/REVERSAL/REVEAL/RELIEF/COUNTERARG/CALLBACK/CTA/FILLER
- question_id, opens_at_s, answer_at_s, answer_delay_s, answer_type(부분/완결/미회수), implicit_question(예/아니요) 기록.
- Q&A 반복 수와 주요 답변 사이 간격을 산출. 5분 영상과 15분 영상은 **분당 질문 수**도 제시한다.
- 각 비트의 “약속 → 근거 → 부분 보상 → 다음 질문” 요약 한 문장.
- 감정 6축(호기심, 자부심, 긴장, 통쾌, 감동, 거부감)의 0~5 평가값은 INFERRED로만 기록. 실제 시청자 감정이나 리텐션 측정값이 아니다.
- 컷수 / 출처 전환 수 / 독립 질문 수 / 외국인 원음 길이 / 내레이션 길이 집계.

## STEP 6. 신규성·흥행 원인 가설 비교
각 영상에 동일 국가 비교 선행 사례 수(검색 기준·기간 명시), 최근 논문·뉴스 발표 날짜, 주장에 필요한 1차 자료 URL, 같은 채널 저조회 2편, 업로드 시간/길이/시청각 특성을 비교.
제목만 보고 영상의 “혁신성”을 판정하지 않는다. 실제로 새로운 원본 반응인지 기존 인터뷰를 재편집했는지 확인한다.

## STEP 7. 산출물
1. captions_status.csv: id,sub_type,lang,download_status,error,collected_at
2. transcript_segments.csv: id,start_s,end_s,speaker,language,original_text,korean_translation,source_kind,confidence
3. visual_segments.csv: id,start_s,end_s,visual_source,source_url,rights_status,voice_kind,confidence
4. qa_loops.csv: id,question_id,opens_s,answer_s,delay_s,answer_type,text_evidence
5. story_beats.csv: id,beat_no,starts_s,ends_s,hook_code,story_code,rhetorical_label,evidence_url,emotion_estimated
6. top5_comparison.md: 5편 1페이지 비교 + 각 영상 8비트+Q&A 타임라인+화면/음성 막대+위험/검증 상태
7. extraction_log.md: 실제 실행 명령, 오류 로그, 누락 원인, 원본 보존 여부, 재시도 금지 여부
8. source-rights.md: 권리자/허락 증빙 여부/공식 이용조건/법률검토 필요/대체 자체 제작 시각 자료.
9. user-review.md: 🔴 사람이 확정해야 하는 데이터와 구조 선택.

원본 Google Sheets는 읽기 전용. 실제 편집 요청이 없다면 신규 탭 생성/값 덮어쓰기/영상 재배포 금지.
보고의 마지막에는 COMPLETED / PARTIAL / BLOCKED를 증거별로 분리한다.

## 모델 배정
- LIGHT(Qwen 9B): URL·영상 ID·파일 존재·자막 트랙·CSV 스키마·중복 기계 검사.
- HEAVY(Qwen 27B): 원어 발화 정렬, 질문-답 라벨링, 화자 분리, 비트·전개 유형 비교.
- ULTRA(Qwen 27B Ultra): 여러 자료가 충돌하는 인과 분석, 장면·권리·출처의 안전한 통합 설계. 호출은 필요할 때만.
- 클라우드 모델/API 자동 호출 금지.

## 완료 판정
5개 중 자막이 확보된 편수, 비활성 자막 편수, 실제 화면 관찰 완료 편수, 오디오 분류 완료 편수, 출처 확인 편수를 정확히 제시하고, 실패한 부분은 추정으로 채우지 말라.
