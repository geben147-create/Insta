# YouTube 운영 기록

Insta 연구 허브의 정적 공개 대시보드입니다. 초기 공개본에는 `세계에서 보는 한국` 채널 정보와 개설일 `2026-11-20`만 기록합니다. ‘세계선 한국’ 브랜딩은 적용 전 시안입니다. 실시간 API 연동이나 서버 저장은 하지 않습니다.

## 로컬에서 보기

저장소 루트에서 실행합니다.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

`http://127.0.0.1:8000/youtube-analytics/`를 엽니다. JSON을 가져오는 정적 페이지이므로 HTML을 파일로 직접 열지 말고 HTTP로 확인하세요.

브랜딩 시안은 `assets/brand/a-logo.png`, `b-logo.png`, `c-logo.png`를 사용합니다. 파일이 없으면 해당 칸에 ‘이미지 준비 중’이 표시됩니다.

## 공개 데이터 갱신

`public-data.json`의 `schema`는 `1`입니다. 아래 배열에는 공개가 승인된 정보만 추가합니다. 날짜는 `YYYY-MM-DD`로, KST 기준입니다. 목록의 필터는 각 행 자체의 날짜를 사용합니다. 주제 필터는 영상에 연결된 행에만 적용합니다.

| 배열 | 필드 및 의미 |
| --- | --- |
| `channels` | `id`, `name`, `handle`, `url` |
| `events` | `id`, `channel`, `date`, `kind`, `title`; 선택 `detail`, `video` (영상 ID) |
| `videos` | `id`, `channel`, `date` (발행일), `topic`, `title`; 선택 `url` (공개 HTTPS), `detail` (썸네일 관련 공개 설명 포함 가능) |
| `samples` | `video`, `date` (관측일); `views`·`impressions` (관측 시점의 누적 회수), `ctr` (퍼센트 값). 영상·날짜당 한 행 |
| `experiments` | `video`, `date`, `title`; 선택 `detail` (공식 실험의 공개 승인 결과만) |
| `notes` | `channel`, `date`, `title`; 선택 `video`, `detail` |

미관측 지표는 필드를 생략하거나 `null`로 기록하고, 실제 0만 `0`으로 입력합니다. 그래프에는 관측값이 있는 영상만 표시하고 명시적인 미관측 행에서는 선을 끊습니다. 순위는 선택 범위에서 영상별 마지막 조회수 관측값(날짜 표시)을 내림차순으로 정렬하며, 관측 시점이 영상마다 다를 수 있습니다. 개인 정보, 내부 경로, 비공개 영상·실험 원본은 추가하지 않습니다.
