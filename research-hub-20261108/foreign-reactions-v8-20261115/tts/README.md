# 🎧 V8 EP01~03 · Ubuntu Qwen3-TTS MP3 일괄 합성

**목표:** 기존 V8 대본 세 편의 한국어 내레이션만 Sohee 음성으로 합성하여 GitHub Pages에서 바로 재생 가능한 MP3 세 파일을 생성합니다. 기존 10편 원고는 수정하지 않습니다.

## ① 먼저 확인

Ubuntu에서 이미 사용하고 있는 GitHub \`geben147-create/Insta\` **작업 폴더**로 이동하세요. Qwen3-TTS를 설치한 Python/가상환경을 사용해야 하며 GPU1은 기본 \`CUDA_VISIBLE_DEVICES=1\`로 지정됩니다.

기존 설치: \`qwen_tts\`, \`torch\`, \`soundfile\`, \`ffmpeg\`가 필요합니다. \`ffmpeg\`가 없을 때만 \`sudo apt install ffmpeg\`로 설치합니다. 유료 API 호출은 없습니다. 기본 모델은 **Qwen3-TTS-12Hz-0.6B-CustomVoice / Korean / Sohee**입니다. 로컬 모델이 없으면 다운로드 없이 중단하며, 필요할 때 \`--allow-download\`를 명시하세요.

## ② 한 번에 3편 확인·합성·게시

저장소 루트에서:

~~~bash
# 이미 생성된 GitHub 코드 업데이트 (현재 변경사항이 있으면 먼저 확인)
git pull --ff-only origin main

# 처음에는 대본 누락 여부만 확인: GPU 사용·파일 수정 없음
bash research-hub-20261108/foreign-reactions-v8-20261115/tts/run_batch_mp3.sh --dry-run

# 세 편 실제 합성 + MP3 세 개와 manifest만 git commit / push
bash research-hub-20261108/foreign-reactions-v8-20261115/tts/run_batch_mp3.sh --publish
~~~

Qwen3-TTS가 특정 venv에 설치되어 있다면:

~~~bash
PYTHON_BIN=/home/yh/ai-work/tts_cosy_prod/.venv/bin/python bash research-hub-20261108/foreign-reactions-v8-20261115/tts/run_batch_mp3.sh --publish
~~~

위 venv 경로는 **예시**입니다. 실제로 사용 중인 Python 경로로 변경하세요. 첫 실행 모델 캐시가 없다면 \`--model /path/to/CustomVoice\`(로컬 모델) 또는 \`--allow-download\`(네트워크 다운로드 명시 허용)를 사용합니다.

## ③ 결과물과 대시보드 재생

| 생성 경로 | 역할 |
|---|---|
| \`audio/EP01.mp3\` | 기존 K2 원고 전체 내레이션 |
| \`audio/EP02.mp3\` | 중국 차주의 현대 전기차 8점 내레이션 |
| \`audio/EP03.mp3\` | 중국 가전 OEM·LG 내레이션 |
| \`audio/manifest.json\` | 실제 MP3 생성 완료 여부·실측 길이·원고 SHA·모델 정보 |
| \`tts/output/EPxx/narration_master.wav\` | 로컬 편집용 원본 WAV (GitHub 미업로드) |
| \`tts/output/EPxx/chunks/*.wav\` | 오류 후 개별 재사용하는 TTS 청크 (GitHub 미업로드) |

재생 페이지: <https://geben147-create.github.io/Insta/research-hub-20261108/foreign-reactions-v8-20261115/index.html#tts-3>

**MP3 업로드 전:** 화면에는 '합성 대기'가 나옵니다. 브라우저는 Ubuntu GPU에 접근할 수 없으므로 웹 버튼만으로 TTS를 실행할 수 없습니다. \`--publish\` 성공 → Pages 배포 완료 → 화면 \`MP3 확인/새로고침\` 클릭 순서로 재생합니다.

## ④ 실제 사용 시 주의

- 긴 세 편의 모델 추론이 끝난 뒤 MP3와 manifest만 GitHub에 업로드됩니다. 128kbps/모노 기본값이며 \`--bitrate 192k\`로 변경 가능합니다.
- 모델이 중간에 멈춰도 이전에 만든 WAV 청크는 다시 사용됩니다. 전체 재합성은 \`--force\`; 회차를 좁히려면 \`--episodes 02\`를 사용합니다.
- 다른 파일이 이미 git stage 상태면 \`--publish\`는 안전하게 중단합니다. \`main\` 브랜치에서만 게시됩니다. 업로드된 음성 파일은 누구나 들을 수 있으니 대본 최종 승인 후 공개하세요.
- MP3는 나레이션만 포함합니다. 외국인의 실제 원어 발언을 임의로 합성하지 않습니다. 발음·고유명사·원문 사실은 발행 전 사람이 듣고 검수하세요.
- 원고가 수정되면 source SHA가 달라져 새로 합성합니다. 검수/실측 전에는 '10분 완성 MP3'라고 표시하지 않습니다.

## 참고

- [Qwen3-TTS 공식 CustomVoice 문서](https://github.com/QwenLM/Qwen3-TTS#custom-voice-generate)
- [기존 V8 대본 작업판](../index.html)
- [공통 STEP 6~8 영상 제작 규칙](../../video-production-rules-steps6-8.html)
