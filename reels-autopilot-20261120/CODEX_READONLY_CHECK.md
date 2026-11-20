# Codex / Hermes 실행용: Ubuntu 릴스 자동화 단계별 안전 검증

현재 Ubuntu 워크스테이션에서 아래 내용을 차례대로 수행하라.
대상 GitHub 자료: https://github.com/geben147-create/Insta/tree/main/reels-autopilot-20261120
문서 페이지: https://geben147-create.github.io/Insta/reels-autopilot-20261120/

기본 원칙
- 기존 Hermes, ComfyUI, Qwen3-TTS, GPU 할당, n8n, RustDesk, NetworkManager 환경을 보존한다.
- 먼저 읽기 전용 검증만 수행하고, 실제 값과 경로를 기록한다.
- 새 라이브러리·모델 대용량 다운로드, 패키지 업그레이드, BIOS 변경, sudoers 변경, Git push, SNS 게시, 재부팅·종료는 사용자의 개별 승인 없이는 실행하지 않는다.
- API 토큰, 내 목소리 참조 WAV, 보안 정보는 공개 GitHub 저장소에 업로드하지 않는다.
- 기존 성공/실패 시험을 반복하지 말고 현황표에 반영한다.

STEP 0: 실제 환경 조사
1. lsb_release, uname, timedatectl, hwclock --show, /proc/driver/rtc, /sys/class/rtc/rtc0/wakealarm 읽기.
2. enp9s0 WOL 현재값과 NetworkManager 설정, RustDesk 서비스, 로그인 전 접속 기록 읽기.
3. Hermes 실제 버전/도움말/config.yaml의 필요한 키 이름과 systemd user/system 단위 서비스를 읽기 전용 조사.
4. GPU 0/1의 VRAM, ComfyUI 8188 API, MiniMax-H3 모델 경로, 최근 정상 렌더링 산출물 파악.
5. Qwen3-TTS Python 가상환경, Sohee 샘플 WAV, FFmpeg/ffprobe, Base voice clone 모델의 실제 설치 유무 확인.
6. PASS/FAIL/미확인/근거 경로/마지막 검증일 표로 보고.

STEP 1: BIOS·부팅 시험 설계
- BIOS 설정이 아직 미수행임을 기준으로, 화면에서 클릭할 순서와 예상 메뉴를 설명하되 펌웨어 버전 차이는 보류.
- PCIE Devices Power On=Enabled, Deep Sleep=Disabled, RTC Alarm Power On=By OS가 지원되는지 확인한다.
- RTC 기준 UTC/KST를 검증하기 위한 명령과 예상 결과를 제시한다.
- 실제 전원 종료·RTC 알람 등록은 아직 실행하지 않는다.
- WOL과 RustDesk를 복구 경로로 남긴다.

STEP 2: 무인 실행 안전설계
- network-online.target만 믿지 말고 실제 인터넷·NTP·GPU·ComfyUI 준비 상태 확인.
- systemd oneshot + Python 결정론적 오케스트레이터 + Hermes AI 작업 구성.
- flock 작업 잠금, 고유 job ID, 영구 상태 저장, 게시 ID 중복 방지, 실패시 재시도 상한, 재부팅된 경우 재개 규칙 설계.
- 루트 소유의 좁은 RTC/종료 래퍼를 설계하되 NOPASSWD 전체 명령 허용이나 --yolo를 적용하지 않는다.
- 수동 재부팅만으로 게시가 재실행되지 않도록 시간대 및 작업 조건을 둔다.
- 자동 종료는 모든 조건이 PASS가 되기 전까지 비활성화.

STEP 3: 인스타 경로 검증
- 공식 Instagram Graph API가 최우선. Facebook Login + rupload의 로컬 바이너리 전송과 Instagram Login + 공개 URL 분기 검토.
- 본인 소유 프로페셔널 계정, 역할과 권한, 토큰 상태를 확인하되 비밀정보는 로그에 쓰지 않는다.
- 컨테이너 생성 → FINISHED → media_publish → media ID/permalink 검증 흐름 설계.
- share_to_feed=false는 비공개 테스트가 아니라는 경고를 문서에 유지.
- API 컨테이너의 유효기간을 고려해 예약 게시 시간에 PC를 켜거나 Meta Business Suite의 클라우드 예약을 사용하도록 선택.
- ADB, scrcpy, Phone Harness, ATV, FPV는 기술적으로 버튼 자동 클릭 가능하나 약관상 안전을 보증하지 않는다.
- Instagram의 실제 게시와 자동 예약 실행은 이번 읽기 전용 단계에서 금지.

STEP 4: MP3 시험
- 기존 Qwen3-TTS의 성공했던 가상환경을 발견하면 /reels-autopilot-20261120/guide_narration.txt를 로컬 복사.
- make_mp3.py --dry-run으로 텍스트 분할 상태부터 검증.
- 라이브러리와 모델이 이미 설치된 경우, 기존 GPU 할당을 존중해 350자 Sohee 미리듣기 MP3만 생성한다.
- 참조용 내 목소리 파일이 있을 때만 Qwen3 Base voice clone의 별도 시험안을 제시한다.
- 기본 미리듣기가 성공해도 전체 5만 자 실행과 GitHub 공개 업로드는 자동으로 진행하지 않는다.
- MP3 생성 결과는 길이, 크기, 음질, 발음, 누락 문장으로 검증.

마지막에 현황표를 제시한다.
열: 번호 / 단계 / 기존 성공 / 이번 실제 검사 / PASS·FAIL·미확인 / 남은 작업 / 사용자 수동 작업 / 다음 1개 실행 명령.
비용/API 과금/자동게시/시스템 전원 변경과 관련된 작업은 반드시 먼저 영향도를 보고한다.
