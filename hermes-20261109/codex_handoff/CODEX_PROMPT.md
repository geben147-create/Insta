# Codex 최종 작업 지시서 — 인스타 카드뉴스 110편 (기존 10편 리디자인 + 새 100편)

너는 이 Ubuntu PC(/home/yh)에서 일하는 제작 담당이다. 아래 순서대로 **멈추지 말고 끝까지** 진행하고, 10편마다 진행 보고 한 줄을 남겨라. 결과물은 항상 **구글 시트 탭 + GitHub 보드 링크**로 보고한다(CSV로 보고하지 말 것).

---
## 0. 작업 폴더 (전부 여기 안에서)
```
H = /home/yh/ego_lite_test/sandbox/r01_scripts/codex_handoff
├─ CODEX_PROMPT.md        ← 이 파일
├─ CHARACTER_PROMPT.md    ← 캐릭터 결합용 이미지 프롬프트 틀
├─ queue_100.csv          ← 새 100편 씨앗 (V4_001~100: AI 40 · 경제 40 · 뷰티 20)
├─ my_design/             ← 사용자가 넣는 레퍼런스 디자인 이미지 + style.md
├─ my_character/          ← 사용자가 넣는 캐릭터 시트 이미지 + character.md
├─ tools/render.sh        ← spec → 배경 PNG·시안 PNG·편집용 PPTX
├─ tools/editor.sh        ← 편집기 실행 http://127.0.0.1:18772/
├─ tools/publish.sh       ← 시트 탭 + Drive PPTX + GitHub 보드 한 번에
└─ out_v4/                ← 네 결과물: spec_NNN.json, img/NNN/*.png, out_NNN/
```
**반드시 먼저 읽을 것 (명령이 아니라 기준 자료)**
1. 규칙(최우선): `/home/yh/ego_lite_test/sandbox/r01_scripts/rules/CONTENT_RULES_v1.md` — A~H 전부
2. 완성 예시 spec (스키마 기준): `/home/yh/ego_lite_test/sandbox/r01_scripts/v3_card/spec_06.json`, `spec_09.json`, `spec_02.json`
3. 기존 10편 대본·근거: `/home/yh/ego_lite_test/sandbox/r01_scripts/v3_card/spec_01.json ~ spec_10.json`
4. 사용자 디자인: `H/my_design/` 의 이미지 전부 + `style.md`
5. 사용자 캐릭터: `H/my_character/` 의 이미지 + `character.md`
6. 상위 콘텐츠 DB: `/home/yh/ego_lite_test/sandbox/r01_scripts/tabs/*.csv`(카드뉴스_TOP30, 캐러셀_TOP30, 원페이지_TOP30, HIGH_500만+ 등), 정본 시트 `by claude_전체DB` 탭(약 7,178행)
   - 정본 시트 ID `1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE` / 결과 확인용 링크: https://docs.google.com/spreadsheets/d/1YPROG1XoSr827nq7o_LfczoO0M5IatXoRj_snSGCzYE/edit#gid=1178038471
   - 시트를 새로 읽을 땐 `/home/yh/ego_lite_test/sandbox/gsheets/` 의 기존 스크립트 방식(token.json, venv)을 그대로 쓴다.

---
## 1. 절대 규칙
- **기존 탭 수정·삭제 금지.** 시트에는 `HERMES_v4_카드뉴스` 탭만 publish.sh가 쓴다. 기존 v3 폴더·spec·규칙 파일 수정 금지(읽기만).
- 비밀값(token.json, client_secret.json, 쿠키, 비밀번호) **출력·복사·커밋 금지**.
- SNS 로그인·게시·좋아요·댓글·DM·팔로우 금지. CAPTCHA·차단 우회 금지. 게시는 사용자가 폰에서 직접.
- 남의 인스타 원본 이미지는 **공개 GitHub에 올리지 않는다**(링크·임베드만). 참고 캡처는 `/home/yh/ego_lite_test/sandbox/r01_scripts/refcaps_private/` 에만.
- `sudo`, `apt`, `rm -r`, `git pull`, 패키지 설치 금지. Python은 `-I` 로 실행. H3·ComfyUI·n8n·GPU 모델·Hermes 설정 건드리지 않기.
- 확인 안 된 숫자는 카드에 넣지 말고 `facts_to_verify`에. 의료·투자·법률은 정보 제공 표현만(권유·보장 금지). 실존 인물 얼굴·브랜드 로고 금지.
- 이미지는 **글씨 없이** 생성(규칙 A3-5). 한글은 전부 spec의 글씨 요소로 얹는다.

---
## 2. 디자인 원칙 (이번 작업의 핵심)
- **기본 = 같은 형식 상위 콘텐츠의 레이아웃**(규칙 A3-3/A3-4): 장 수, 정보 배치, 제목 크기·자간·행간·여백을 그 원본에서 실측해 쓴다.
- **스타일 = 사용자 레퍼런스(`my_design/`)를 "살짝" 입힌다**: 색 팔레트, 폰트 느낌, 모서리·테두리·그림자, 강조 방식, 질감 정도만 가져온다. 레이아웃까지 복제하지 않는다.
- 비주얼은 다른 분야(섹터)에서 잘된 카드뉴스를 벤치마크(규칙 A3-1). `visual_bench`에 URL·실측값 기록.
- 지금 v3 디자인은 사용자가 "허접하다"고 평가했다. 단색 상자 나열 금지. 장마다 **실사·3D·일러스트 배경 이미지 1장 이상**(사진 자리)을 쓰고, 그 위에 반투명 패널·라벨·말풍선을 얹는 잡지/정보 카드 수준으로.
- 캐릭터(Mr. Navy, 사용자 시트 기준)는 **오른쪽 아래 구석에 작게**, 글씨를 가리지 않게. 표지·마지막 장은 필수, 내지는 선택.

---
## 3. spec 형식 (out_v4/spec_NNN.json)
`v3_card/spec_06.json`과 같은 스키마 + 아래 필드:
- `"id": "V4_NNN"` (파일명 숫자와 동일, 3자리)
- 요소 타입: `box`(사각), `pill`(말풍선), `circle`, `text`, `tree`, `char`.  좌표는 1080×1350 px.
- **사진 넣기**: 아무 `box`/`circle`에 `"img": "img/NNN/01_bg.png"` (spec 폴더 기준 상대경로) → 칸을 이미지로 채움. 전체 배경은 `x:0,y:0,w:1080,h:1350` box에 img.
- **캐릭터**: `char` 요소에 `"img": "img/NNN/char_01.png"` (투명 PNG 권장) + `"note"`.
- 글씨 요소마다 `"src"`: 어느 원본/자막(타임코드)/기사에서 가져와 어떻게 바꿨는지.
- 편 단위 필드: `text_bench`(같은 분야 글 원본 2~3개: url, who, metric, take), `visual_bench`(다른 분야 카드뉴스 1개+: url, who, sector, 실측, take), `style_ref`(my_design에서 가져온 요소), `metrics_note`, `caption`, `first_comment`, `hashtags`, `dm`, `image_prompts`(장별 영어, 글씨 없음), `facts_to_verify`.
- `{중괄호}` 안 글자는 강조색. 한 장에 강조 4곳 이하.

---
## 4. 진행 순서
### 단계 A — 준비 (1회)
1. 규칙·예시·my_design·my_character 를 읽고 `out_v4/DESIGN_SYSTEM.md` 작성: 팔레트(HEX), 제목/본문 폰트와 크기 단계, 여백·자간·행간 값, 라벨/말풍선/패널 모양, 캐릭터 위치 규칙. 근거(어느 상위 원본·어느 레퍼런스)를 같이 적는다.
2. my_design 또는 my_character 가 비어 있으면: 진행은 하되 style_ref에 `PENDING_USER_STYLE`, 캐릭터는 `char` 자리만 두고 계속한다(나중에 이미지를 넣고 render만 다시 하면 됨).

### 단계 B — 기존 10편 리디자인 (V4_101 ~ V4_110 = v3 01~10)
- 문구·근거(`src`, text_bench, facts_to_verify, caption 등)는 `v3_card/spec_NN.json`을 **그대로 이어받고**, 레이아웃·이미지·스타일만 새 디자인 시스템으로 다시 만든다.
- 장별 배경 이미지를 생성해 `out_v4/img/1NN/` 에 저장하고 spec에 연결.

### 단계 C — 새 100편 (V4_001 ~ V4_100, queue_100.csv)
각 편마다:
1. 씨앗 주제·훅을 출발점으로, **같은 형식(카드뉴스/캐러셀) 상위 원본 2~3개**를 DB에서 고르고 실제 캡션을 확인한다. 인스타 캡션 읽기(로그인 없이, 편마다 전용 프로필):
   `timeout 40 /usr/bin/google-chrome --headless=new --disable-gpu --user-data-dir=/home/yh/ego_lite_test/sandbox/shot_tmp/profile_cx_NNN --virtual-time-budget=8000 --dump-dom "https://www.instagram.com/p/<CODE>/embed/captioned/"`
2. 실질 정보: 유튜브 상위 1~3개 자막(`/usr/bin/yt-dlp --ignore-config --no-cookies --skip-download --write-subs --write-auto-subs --sub-langs "ko,ko-orig" --sub-format vtt -o "/home/yh/ego_lite_test/sandbox/r01_scripts/yt_subs/%(id)s.%(ext)s" <URL>` → `python3 -I /home/yh/ego_lite_test/sandbox/r01_scripts/scripts/vtt2txt.py /home/yh/ego_lite_test/sandbox/r01_scripts/yt_subs`), 뉴스 본문(`python3 -I /home/yh/ego_lite_test/sandbox/r01_scripts/scripts/news_fulltext.py /home/yh/ego_lite_test/sandbox/r01_scripts/news_full_v4 "<검색어>"`). **제목만 보고 쓰지 말 것.** 숫자·팁·타임코드를 뽑아 문구에 넣는다.
3. 규칙 A1·A2: 원본이 원페이지면 원페이지, 캐러셀이면 캐러셀. 분량은 원본보다 조금 더(장 +1~2, 30개→35~40개, 3총사→4총사). 돈 훅(금액·개수) 표지에. 저장 가치(체크리스트·전후 비교·프롬프트 공개 등) 필수.
4. queue에서 같은 주제가 반복된 슬롯(AI 분야)은 **다른 각도·다른 원본**으로 만들거나 새 주제로 바꾸고 `queue_note`에 이유를 적는다. 기존 V3/V4 편과 중복 금지.
5. 뷰티 20편(V4_081~100)은 DB 뷰티 상위 캐러셀 + 오늘 트렌드로 네가 주제를 고른다(V3_08~10 주제와 중복 금지).
6. 이미지 생성 → `out_v4/img/NNN/`, spec 연결 → `bash H/tools/render.sh NNN`.
7. **검수**: preview PNG를 눈으로 확인(글씨 넘침·겹침·캐릭터가 글씨 가림·여백). 그다음 편집기 규칙 검사(아래 5)로 🔧 항목 0개 만들기.

### 단계 D — 10편마다 publish
`bash H/tools/publish.sh` → 시트 `HERMES_v4_카드뉴스` 탭(같은 탭을 다시 씀) + GitHub 보드 갱신. 보고 한 줄: `완료 N/110 · 보드 https://geben147-create.github.io/Insta/hermes-20261109/v4_card/index.html · 시트 탭 HERMES_v4_카드뉴스 · 확인 필요 사실 K건`.

---
## 5. 편집기 사용 (일부 자동 편집)
- `bash H/tools/editor.sh` → http://127.0.0.1:18772/ (spec을 추가·수정했으면 다시 실행).
- 편집기 안의 **규칙 검사 목록**과 **"규칙대로 자동 맞춤"** 버튼, **말로 고치기** 입력칸(예: `제목 크게`, `말풍선 아래로 40`, `"최대" 강조`, `"A"를 "B"로 바꿔`, `캐릭터 작게`)을 쓴다. 브라우저 자동화가 필요하면 headless Chrome + CDP로 `runCmd("...")`, `autoFix()`, `checkRules()` 를 호출한다(예시: `/home/yh/ego_lite_test/sandbox/r01_scripts/editor/selftest2.mjs`, node: `/home/yh/.hermes/tools/node-26.12.1-linux-x64/bin/node`).
- 자동 맞춤으로 바뀐 좌표·크기는 **spec에 반영**하고 render를 다시 돌린다(편집기 저장 상태는 `out_v4/editor_work/state/`).
- **최종 손편집과 "PNG + 증거 저장"은 사용자가 직접 한다.** 너는 증거 파일을 만들거나 "사람이 편집했다"고 기록하지 않는다(규칙 G3·H4).

---
## 6. 끝났을 때 보고 (짧게, 한국어 표)
| 항목 | 값 |
|---|---|
| 보드 | https://geben147-create.github.io/Insta/hermes-20261109/v4_card/index.html |
| 시트 탭 | HERMES_v4_카드뉴스 (링크) |
| 편집기 | http://127.0.0.1:18772/ |
| 완료 편수 / 장 수 | |
| 사진·캐릭터 비어 있는 편 | |
| facts_to_verify 합계 | |
| 실패·건너뛴 것 | 이유 |
