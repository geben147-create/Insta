# Ubuntu 자동 부팅 · Hermes · Instagram 릴스 · MP3 가이드 (2026-11-20)

이 폴더는 기존 Insta 사이트와 별개로 만든 안내 자료입니다. 실제 게시·전원 조작·비밀번호 변경을 수행하지 않습니다.

- 화면: [index.html](./index.html) (GitHub Pages에서 바로 보기)
- 한국어 낭독 대본: [guide_narration.txt](./guide_narration.txt)
- 진짜 MP3 제작용 Qwen3-TTS: [make_mp3.py](./make_mp3.py)
- 실제 `guide.mp3`는 **아직 생성/게시되지 않았습니다**. 페이지 상단 한국어 읽기 버튼은 별도의 브라우저 음성 엔진으로 미리듣기만 제공합니다.

## Ubuntu에서 MP3를 만드는 순서

1. 평소 성공했던 **Qwen3-TTS용 가상환경**을 활성화하고 torch/qwen_tts/soundfile/ffmpeg를 점검합니다. 설치 변경은 하지 않습니다.
2. **미리듣기**는 기본 `Sohee` 350자 제한으로:

```bash
CUDA_VISIBLE_DEVICES=1 python make_mp3.py --text guide_narration.txt --out preview.mp3
```

3. 재생하여 발음이 정상이라면 **전체 문서 생성**:

```bash
CUDA_VISIBLE_DEVICES=1 python make_mp3.py --text guide_narration.txt --out guide.mp3 --full
```

4. 본인 목소리로 시험하려면 **본인이 녹음한 WAV와 정확히 일치하는 텍스트**가 필요하며, Qwen3-TTS Base 모델을 별도로 준비해야 합니다. 입력 원본은 공개 GitHub에 올리지 마세요.

```bash
CUDA_VISIBLE_DEVICES=1 python make_mp3.py --text guide_narration.txt --out myvoice_preview.mp3 --clone-audio /absolute/path/myvoice.wav --clone-text "녹음 내용 그대로"
```

5. `ffprobe guide.mp3`와 직접 청취로 파일 확인 후, **원한다면** 이 폴더의 `guide.mp3`로 GitHub에 업로드합니다. 공개 페이지와 저장소에는 누구나 파일을 내려받을 수 있습니다.

## 운영상 추가 주의

- Github Pages는 TTS가 아닙니다. 무료 HTTPS 정적 호스팅일 뿐입니다.
- Google Cloud TTS 문자 단가와 무료 사용량은 <https://cloud.google.com/text-to-speech/pricing>에서 확인합니다.
- GitHub Pages는 사이트 용량 1GB, 월 대역폭 100GB 소프트 한도 등의 제약이 있으므로 5만 자짜리 MP3를 다량 누적할 목적이라면 오디오 저장소를 분리하는 편이 좋습니다.
- Instagram 공식 API 게시 완료는 container FINISHED뿐 아니라 `media_publish`의 Media ID 및 permalink 확인까지 필요합니다.
- `share_to_feed=false`는 **비공개 게시 모드가 아닙니다**. 테스트라도 공개 릴스 게시가 될 수 있습니다.
- 자동 종료는 최초 RTC 기상/원격 접속/복구 경로와 예외 처리 테스트를 통과한 뒤 활성화하세요.

## 큰 MP3 및 예약 게시에 관한 중요한 누락

- 5만 자 음성은 낭독 속도에 따라 2~4시간 이상도 가능하고, 96kbps MP3라면 **약 86~173MB(2~4시간 가정)**가 됩니다. GitHub 일반 파일은 50MiB 초과 시 경고, 100MiB 초과 시 차단됩니다. **Git LFS는 GitHub Pages에서 지원되지 않습니다.** 큰 파일은 여러 편으로 분리하거나 별도 오브젝트 스토리지에 두세요.
- Instagram Graph API 자체에는 일반적인 ‘몇 주 후 자동 발행’ 예약 파라미터가 없습니다. 컨테이너는 약 24시간 안에 발행하지 않으면 만료될 수 있습니다. **PC가 꺼져 있어도 예약 시간에 게시하려면 Meta Business Suite 예약 또는 별도 클라우드 스케줄러**를 이용해야 합니다. 자체 Ubuntu 작업 큐만 사용할 경우 실제 게시 시점에 PC가 켜져 있어야 합니다.
