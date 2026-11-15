# 🎧 V10 신규 EP11~20: 9분 초과 MP3 10편 일괄 합성

## 작업판 바로가기
- [🎬 신규 10편 포함 대시보드](https://geben147-create.github.io/Insta/research-hub-20261108/foreign-reactions-v88/index.html#tts-mp3-player)
- [💾 우분투 10편 일괄 합성 스크립트](./run_new10.sh)
- [🐍 공통 Qwen3-TTS 생성기](./batch3_qwen.py)
- [🔊 음원 게시 현황](../audio/manifest.json)

## 한 번만 실행

자신의 우분투에 git clone 된 **Insta 저장소 최상위** 디렉터리에서 다음을 실행합니다.

```bash
git pull --ff-only origin main
bash research-hub-20261108/foreign-reactions-v88/tts/run_new10.sh --dry-run
bash research-hub-20261108/foreign-reactions-v88/tts/run_new10.sh --publish
```

- `--dry-run`: 신규 11~20편의 JSON·챕터 및 합성 조각 개수 확인, GPU 로딩/MP3 생성/파일변경/다운로드 없이 종료
- `--publish`: 로컬 **GPU1 (CUDA_VISIBLE_DEVICES=1)** Qwen3 CustomVoice 한국어 Sohee 화자로 10개 MP3 합성; **각 MP3의 ffprobe 실제 길이 >541초**인 경우에만 GitHub `main`에 전체 게시
- 각 편이 **541초(9분 1초)를 초과하지 않으면 FAIL**, GitHub에 게시하지 않습니다. **무음을 9분 채우는 방식은 금지**합니다. 짧다면 대본 내용을 보강한 뒤 다시 합성해야 합니다.
- 기본값은 로컬 모델만 사용합니다. 모델이 캐시에 없다면 자동 다운로드하지 않습니다. 최초 모델 설치를 명시적으로 허락하는 경우에만 `--allow-download`.
- 10편 내레이션을 모두 합성하려면 시간이 걸리므로 캐시를 남기고 다음 실행에서는 성공한 조각을 재사용합니다. **이 채팅에서 음성 파일을 실제로 만들거나 사용자의 GPU에서 배치를 시작한 것은 아닙니다.**
- 기존 폴더 설치를 인식하지 못하면:
```bash
QWEN_TTS_PYTHON=/home/yh/ai-work/tts_cosy_prod/venv/bin/python \
QWEN_TTS_MODEL=/로컬/Qwen3-TTS-12Hz-0.6B-CustomVoice \
CUDA_VISIBLE_DEVICES=1 \
bash research-hub-20261108/foreign-reactions-v88/tts/run_new10.sh --publish
```

## 제작 파이프라인
1. `data.js` 기존 01~10편과 `episodes-v10.js` 신규 11~20편을 별개로 읽고, **11~20편 내레이션 본문만** 합성
2. 문장 단위 WAV 캐시 → 편당 `audio/EP11.mp3`부터 `EP20.mp3` → `ffprobe` 실측
3. 생성된 MP3에 **9분 초과** 최소 길이 검증을 강제, MP3 해시 및 대본 해시를 `audio/manifest.json`에 기록
4. 전부 통과한 경우에만 `git commit` 및 `git push` 실행
5. GitHub Pages 배포 이후 대시보드에서 10편 모두 ▶ MP3 재생/다운로드 제공

**MP3 길이만 통과해도 영상 완성은 아닙니다.** 실제 중국인 원음(권리 확보) 2~3개 2~3초를 앞에 놓고 Qwen TTS 강제정렬 후 자막/SRT, 원본 IN/OUT, 4초 이하 컷, 저작권 검수를 거쳐야 최종 MP4 편집이 가능합니다.

## 원본 영상 출처를 어떻게 확인하나
- 사용자 로컬 후보: `/run/media/yh/새 볼륨/틱톡/` 및 `/run/media/yh/새 볼륨/틱톡/샤오(한국 일본 영상들)/`.
- 각 EP의 **독립 편집 마스터 Markdown**에 MP4 기록 경로와 BILI 중국어 자막의 초 단위 시작/종료, 첫 2~3개 원음 후보, 30행 편집표, 150컷, 폰트, 오디오, 검수표를 모두 포함합니다.
- 출처 영상의 **파일 존재 여부는 현재 로컬 직접 검사 전**, 영상·음원 재사용 허락도 미확인입니다.
- 원문·번역은 ASR/번역 초벌. 실제 발언을 확인하기 전에는 가짜 중국어 음성을 만들어 실발언처럼 배치하지 않습니다.

## 검수표
| 조건 | 수치/규칙 |
|---|---|
| 회차 | EP11~EP20, 총 10편 |
| 도입 | 중국인 실제 칭찬 원음 후보 2~3개 × 2~3초(사용권·원음 확인 전) |
| 본문 | 한국어 창작 내레이션, 10개 챕터씩 |
| 목표 길이 | 600초, **최소 합격 541초 초과** |
| 원본 컷 | 최대 4초, 실제 허가 영상 우선 |
| 내레이션 | 음성 비중 ≥60% |
| 자막 | 본문 56px, 번역 64px, 강조 72px, 중국어 38px |
| 그래프 | 원본 영상 위 반투명 흰색 1~2회 |
| 보관 | WAV 작업파일은 `~/ai-work/jobs/`, 최종 MP3는 `audio/` |
| 공개 | **실측 초과 전까지 대시보드 미생성 상태** |
