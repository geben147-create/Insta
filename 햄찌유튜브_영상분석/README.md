# 햄찌유튜브_영상분석

정서불안 김햄찌(유튜브) 동영상 탭 최근 30개 중 **기간 대비 성과(일평균 조회수) Top 10** + 상위 3개 영상 **117컷 완전 분해**
(1위 직장인의 감정 기복 · 2위 여름이여따 · 3위 휴가에서 누가 돌아왓햄)

## 바로 열기
| 무엇 | 링크 |
|---|---|
| 한 페이지 전체 (동물 바꾸기 · 📋 전체 복사 버튼) | [https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/](https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/) |
| 전체 텍스트 (웹·AI가 바로 읽는 txt) | [전체분석.txt](https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/%EC%A0%84%EC%B2%B4%EB%B6%84%EC%84%9D.txt) |
| 나눈 텍스트 | [개요.txt](https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/%EA%B0%9C%EC%9A%94.txt) · [1위.txt](https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/1%EC%9C%84.txt) · [2위.txt](https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/2%EC%9C%84.txt) · [3위.txt](https://geben147-create.github.io/Insta/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/3%EC%9C%84.txt) |
| 원문 그대로(raw) | [전체분석.md](https://raw.githubusercontent.com/geben147-create/Insta/main/%ED%96%84%EC%B0%8C%EC%9C%A0%ED%8A%9C%EB%B8%8C_%EC%98%81%EC%83%81%EB%B6%84%EC%84%9D/%EC%A0%84%EC%B2%B4%EB%B6%84%EC%84%9D.md) |

## 폴더 구성
- `index.html` — 한 페이지 전체: Top10 · 채널 공식 · 제작 순서 · 1~3위 컷별 분석(구도·동작·자막·전환·효과음·편집 기법) · 이미지/영상 프롬프트 · 추천 모델 · 사운드 · 편집
- `편집키트/1위·2위·3위` — edl(컷 길이·전환), captions.ass(원본 측정 자막 규격), sfx_cues.csv(효과음 위치), build_ffmpeg.py(자동 조립·컷 검증), hyperframes/index.html(타임라인), 편집프롬프트.md
- `분석데이터` — 컷별 분석 JSON, 컷 타이밍, 소리 특징, 목소리 높이, 순위표
- `도구` — 분석·생성 파이썬 스크립트 (yt-dlp · OpenCV · faster-whisper · FFmpeg)
- `작업기록.md`

## 공개하지 않은 것
원본 영상 캡처 사진과 자막 원문은 김햄찌 채널 저작물이라 공개 저장소에 올리지 않았습니다(신고로 저장소 링크가 막히는 것을 방지). 같은 구성에 사진·자막이 들어간 개인용 ZIP은 따로 전달했습니다.
