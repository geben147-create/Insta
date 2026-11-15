# 🎧 국뽕 V8.9 · 우분투 Qwen3-TTS 3편 MP3 일괄 합성

**대상:** 신규 EP01 한국 HBM / EP02 한국 옥탑방 / EP03 제주 우도와 해녀. 세 편을 한꺼번에 합성하고 `audio/`에 MP3를 저장합니다. Qwen3 CustomVoice의 한국어 `Sohee` 음성을 쓰며 GPU1에 고정합니다. 유료 TTS API는 사용하지 않습니다.

## ✅ 바로가기

- [🎧 대시보드 MP3 미리듣기](https://geben147-create.github.io/Insta/research-hub-20261108/foreign-reactions-v88/index.html#tts-mp3-player)
- [🐚 우분투 실행 스크립트](./run_batch3.sh)
- [🐍 3편 일괄 합성 본체](./batch3_qwen.py)
- [📊 MP3 생성·게시 확인용 manifest](../audio/manifest.json)

## 1. 우분투에서 이미 Insta 저장소가 있다면

저장소 최상위 경로에서 아래처럼 실행합니다.

```bash
cd /경로/내/Insta
bash research-hub-20261108/foreign-reactions-v88/tts/run_batch3.sh --dry-run
bash research-hub-20261108/foreign-reactions-v88/tts/run_batch3.sh --publish
```

`--dry-run`은 **모델 로딩·영상 다운로드·파일 변경 없이** 원고 3편을 읽고 글자 수와 예상 음성 조각 수를 확인합니다. `--publish`는 실제 음성 합성을 실행해 MP3 3개와 `manifest.json`을 GitHub에 `git push`합니다. 실행 전 기존 Ubuntu Qwen TTS 설치와 GitHub 인증이 필요합니다.

## 2. Insta 저장소가 로컬에 없는 경우 (스파스 클론)

```bash
mkdir -p ~/ai-work/github
git clone --depth 1 --filter=blob:none --sparse https://github.com/geben147-create/Insta.git ~/ai-work/github/Insta
git -C ~/ai-work/github/Insta sparse-checkout set research-hub-20261108/foreign-reactions-v88
cd ~/ai-work/github/Insta
bash research-hub-20261108/foreign-reactions-v88/tts/run_batch3.sh --publish
```

먼저 GitHub 인증을 설정해 주세요. 예: `gh auth login` 또는 Git 자격증명. 스크립트는 `main` 브랜치인지, `origin`이 `geben147-create/Insta`인지 확인한 다음에만 게시합니다. 다른 파일이 이미 스테이징돼 있으면 중단합니다. 강제 푸시는 하지 않습니다.

## 3. Qwen 모델 또는 Python 경로가 다른 경우

```bash
QWEN_TTS_PYTHON=/home/yh/ai-work/tts_cosy_prod/venv/bin/python \
QWEN_TTS_MODEL=/내/로컬/Qwen3-TTS-12Hz-0.6B-CustomVoice \
CUDA_VISIBLE_DEVICES=1 \
bash research-hub-20261108/foreign-reactions-v88/tts/run_batch3.sh --publish
```

- 기존 설치된 `qwen_tts`, `torch`, `numpy`, `soundfile`이 들어 있는 Python을 찾습니다. 기본 후보 경로 이외라면 `QWEN_TTS_PYTHON`에 정확한 Python 경로를 지정합니다.
- 기본 모델은 로컬 Hugging Face 캐시에서 `0.6B` 또는 `1.7B CustomVoice`를 탐색합니다. 원본 **Base** 모델은 Sohee 화자를 지원하지 않으므로 CustomVoice를 사용합니다.
- **외부 다운로드 금지 기본값:** 설치되지 않은 모델을 자동으로 받지 않습니다. 최초 모델 다운로드를 명시적으로 허가하려면 `--allow-download`를 추가하세요. 모델은 공개 Hugging Face에서 받을 수 있으며 유료 API 요청은 하지 않습니다.
- GPU1을 `CUDA_VISIBLE_DEVICES=1`로 지정하므로 TTS Python 내부에서는 `cuda:0`으로 보입니다. 별도 CUDA UUID 고정 설정이 있으면 우선합니다.
- `ffmpeg`, `ffprobe`가 필요합니다. 설치되어 있지 않으면 `sudo apt install ffmpeg`.

## 4. 합성·게시 결과

| 파일 | 목적 |
|---|---|
| `audio/EP01.mp3` | 한국 HBM 내레이션 |
| `audio/EP02.mp3` | 옥탑방 내레이션 |
| `audio/EP03.mp3` | 제주 우도·해녀 내레이션 |
| `audio/manifest.json` | 실제 파일 여부·재생 길이·MP3 SHA256·원고 SHA256 검증 |
| `~/ai-work/jobs/foreign-reactions-v89-tts/EP##/` | 로컬 중간 WAV·세그먼트 캐시(게시하지 않음) |

페이지가 로드되면 `manifest.json`의 상태를 확인하고, MP3에 대한 HTTP HEAD 요청이 성공한 경우에만 **▶ MP3 재생** 버튼이 활성화됩니다. GitHub Pages 배포가 아직 반영되지 않았다면 **🔄 MP3 상태 새로고침**을 누르세요.

## 5. 재생 시간·품질·원본 보존

- 10분은 제작 목표일 뿐이고 생성 음성의 정확한 재생 시간은 합성 후 MP3에서 **실측**합니다. 원고 약 3,000자 수준이라 목표보다 짧을 수 있습니다. 실제 길이에 맞춰 후속 영상 타임라인을 조정하세요.
- 챕터 제목·메타 ID·편집 지시·검수표는 발음하지 않습니다. `data.js`의 `episodes[EP].chapters[].text`만 음성으로 변환합니다.
- 원본 한국어 대본, 로컬 영상, 기존 TTS 설정과 원본 파일은 수정하지 않습니다. 신규 음성 파일만 해당 GitHub `audio/`에 게시합니다.
- 중간 조각은 이름에 텍스트·모델 해시를 넣어 저장하므로 실패 후 재실행하면 이미 성공한 조각부터 이어갑니다.
- 실제 외국인의 음성이나 인물을 흉내 내지 않습니다. 한국어 내레이션의 Sohee 합성음만 만듭니다.

## 현재 게시 상태

**스크립트와 대시보드 재생 UI 등록 완료 / 실제 MP3 3편은 사용자의 우분투에서 합성 후 게시해야 함.** 이 채팅에서는 사용자의 우분투 GPU나 `/run/media/yh/...` 파일 시스템에 직접 접근할 수 없습니다.
