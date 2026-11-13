# Codex / Ubuntu 로컬 MP3 제작 프롬프트
목표: 이미 작성 완료된 청취용 원고를 **실제로 로컬 TTS로 합성한 MP3**를 생성한다. 사용자가 실행할 한 번짜리 작업이며, 파일 이외의 기존 서비스와 모델은 건드리지 않는다.

## 작업 원본
- 원고: https://raw.githubusercontent.com/geben147-create/Insta/main/kukppong-narration-audit-20261113/tts-report-ko.txt
- 보고서: https://github.com/geben147-create/Insta/blob/main/kukppong-narration-audit-20261113/index.html
- 기존 보조 참고: https://geben147-create.github.io/Insta/kukppong-longrun-audit-20261108/
- 출력 베이스: /home/yh/ai-work/jobs/kukppong-report-20261113/
- 최종 파일: output/kukppong_research_20261113_ko.mp3
- 언어: 한국어, 성우: Qwen3-TTS CustomVoice 'Sohee'가 실제 설정에 존재하면 해당 목소리 사용. 없으면 기존 성공했던 한국어 로컬 보이스를 우선 사용하고 선택 근거 기록.

## 절대 제한
1. **클라우드 API·유료 TTS·자동 로그인·외부 데이터 전송 금지.** 로컬 합성만 사용.
2. 우분투 기존 Hermes 8081/8080, ComfyUI 8188, Docker, n8n, H3, GPU 프로세스 종료·재시작·설정 변경 금지.
3. GPU1(ASUS RTX3090, UUID GPU-61433919-33c4-599c-1d62-b686003564d7)을 TTS 우선 후보로 조사. GPU1에서 Qwen 9B 등 동작 중일 수 있으므로 `nvidia-smi`를 먼저 확인한다. 필요 VRAM 확보 불가 시 **기존 프로세스에 간섭하지 말고 PAUSED_RESOURCE로 보고**. GPU0로 무단 이동 금지.
4. 기존 Qwen3-TTS 설치경로·venv·모델 경로 `~/models/Qwen3-TTS-CustomVoice`·과거 Sohee 24kHz WAV 성공 기록을 읽기 전용으로 확인해 재사용한다. 라이브러리 API 시그니처와 한국어 보이스 실제 사용법을 로컬에서 확인한다. 근거 없이 코드 예시를 단정해 실행하지 말 것.
5. 쓰기는 **출력 베이스 아래** input/, chunks/, output/, logs/, manifest.json 로만. 중간 실패해도 성공 청크는 유지하고 재시작 때 건너뛸 것. 기존 파일 삭제 금지.
6. 원고는 **이미 제공한 내용 그대로** 읽어야 한다. 장문의 URL, 제목 마크다운, 명령어는 원고에 없으며, 임의로 사실을 추가하지 말 것.

## 단계 (체크리스트로 실행)
- [ ] STEP01. `nvidia-smi`, `ffmpeg -version`, `ffprobe -version`, 기존 venv, 패키지 버전, 모델 파일 경로 및 남은 공간을 읽기 전용 검사. 추천 모델: 이 점검은 Qwen 9B / LIGHT.
- [ ] STEP02. 출력 폴더만 `mkdir -p`로 만들고 `curl -fL --retry 2`로 UTF-8 원고를 input/tts-report-ko.txt 에 저장. 다운로드 실패 시 보고하고 멈춤. HTML 파싱, 사이트 로그인, 대량 clone은 하지 않음.
- [ ] STEP03. 줄바꿈·문장부호로 안정적인 청크를 만든다. 청크 길이는 TTS 성공 선례에 따라 150~400자 내외로 시험하되, 문장 중간 끊기는 것을 피한다. 원고 원본 및 분할 결과를 각각 보존. 추천 모델: Qwen 27B / HEAVY는 복잡한 실행 오류가 있을 때만.
- [ ] STEP04. GPU1 자원 여유가 있을 때만 기존 로컬 Qwen3-TTS CustomVoice로 청크를 순차 합성. 한국어 'Sohee' 존재 여부 확인. 필요 시 정상 발화 속도·음량, 설명형 차분한 낭독. 각 WAV는 원본 샘플레이트 및 채널 표기와 함께 기록하고 전부 검증.
- [ ] STEP05. 청크의 샘플레이트와 채널 수를 통일(가능하면 24,000Hz mono PCM WAV). 청크 순서대로 정확히 연결. 경계에 150~250ms 자연스러운 짧은 쉼을 넣되 앞·뒤 단어는 자르지 말 것. 낭독 내용이나 발음 오류가 눈에 띄면 해당 청크만 재합성.
- [ ] STEP06. master.wav 생성 후 `ffmpeg -hide_banner -y -i master.wav -c:a libmp3lame -b:a 192k -ar 44100 output/kukppong_research_20261113_ko.mp3`를 적용. 실제 파일 경로에 맞춰 인자를 안전하게 조정. 인코더 사용 가능 여부를 먼저 확인.
- [ ] STEP07. `ffprobe`로 파일 길이, 비트레이트, 채널, 크기, 스트림 오류를 검사. 원고 전체 반영 여부와 chunk 누락 여부를 체크. 파일별 SHA256·모델명·원고 SHA256·작업시각·성공/실패 청크를 manifest.json에 기록.
- [ ] STEP08. 최종 결과는 **완료 여부 / 로컬 MP3 절대경로 / 길이 / 크기 / 사용 GPU / 목소리 / 실패 청크 수 / 파일 검증 결과**를 표로만 보고. MP3가 진짜 만들어지지 않았으면 성공이라고 쓰지 말 것.

## 재실행과 승인
- MP3가 이미 있고 manifest, 파일 길이와 체크섬이 일치하면 결과 재사용, `status=GENERATED` 로 종료한다.
- 원본과 무관한 환경 수정, 모델 신규 다운로드, 서비스 종료, GPU 점유 프로세스 종료는 **사용자 승인 전 실행 금지**.
- 실측 음성 비율은 이 TTS 합성 작업 범위가 아니다. 경쟁사의 실제 음성 측정은 별도 과업이다.
