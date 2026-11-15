# ⚓ 한국 조선업 해외반응 10+3 / 2026-11-16

[🎙️ 브라우저에서 3편 대본 듣기·복사 및 아웃라인 10개 보기](https://geben147-create.github.io/Insta/research-hub-20261108/shipbuilding-foreign-reaction-20261116/)

## 완료 내용
- EP01: 미국 CBS 취재, 한국 조선소 생산력 사례 (약 10분 편집용 원고)
- EP02: 미국 해군 USNS Wally Schirra 대형 정기정비 완료 (약 10분 편집용 원고)
- EP03: SCMP의 2026년 10월 LNG 운반선 수주와 1~10월 한국 44척 (약 10분 편집용 원고)
- 그 밖의 7편은 아웃라인만 정리했습니다. 아직 완성 원고가 아닙니다.
- 실제 외국인 발언/외신 기록과 작가가 각색한 설명을 구분합니다. 기존 보유 한국 제조업 영상은 조선소 실사로 쓰지 마십시오.

## 브라우저에서 즉시 듣기
페이지에서 EP01~03 회차를 누르고 상단 **🔊 한국어 듣기** 선택. Chrome/Edge 운영체제에 있는 음성합성 엔진을 사용합니다. 이 기능은 MP3 파일을 만들지 않습니다.

## 진짜 MP3 3개 생성 (사용자 우분투에서 실행)
준비: 인터넷 1회(모델 다운로드), Python3, ffmpeg. 설치는 사용자 계정의 격리된 venv에만 수행합니다. 기존 Hermes/Qwen 환경을 변경하지 않습니다.

```bash
curl -fsSL https://raw.githubusercontent.com/geben147-create/Insta/main/research-hub-20261108/shipbuilding-foreign-reaction-20261116/make_mp3_ubuntu.sh -o /tmp/make_shipbuilding_mp3.sh
bash /tmp/make_shipbuilding_mp3.sh
```

- 출력: `~/ai-work/shipbuilding-tts-20261116/EP01.mp3` 등 총 3개.
- 사용 엔진: Supertonic 3 한국어(로컬 추론). 모델 가중치 OpenRAIL-M 조건을 사용 전에 확인하세요: https://huggingface.co/Supertone/supertonic-3
- **이 저장소에 MP3 음성 파일은 아직 업로드되지 않았습니다.** 위 명령은 각자의 우분투 PC에서 실행해야 실제 MP3를 생성합니다. 
- 기존 Qwen3-TTS로 만들려면 이 폴더의 `EP0X_narration.txt`를 Qwen TTS 입력으로 사용하고 WAV를 MP3로 인코딩하세요.

## 편집 인수인계
각 EP 페이지 상단 **📋 대본+편집 전체 복사**를 누르면 원고와 컷 편집, 외신 링크, B-roll 판정이 함께 복사됩니다. 단일 회차 링크도 복사 가능합니다.
