# 추가 좁은 확인 · 메뉴 라우팅·실행 명령·일본 자료

## 1. 사용자 제공 nav-21 링크의 실제 대상

- 한국어 허브 최초 `const ITEMS` 배열은 45개다.
- 원래 0부터 센 인덱스 21은 **🔗 국뽕해외반응 · 중국 SNS (처음 준 링크)**다.
- 대상은 `국뽕해외반응-중국SNS-20261103/index.html`이며 Git tree에 존재한다.
- 제목/썸네일 메뉴가 아니다. 원본 자료·수집판 진입 링크로 표시해야 한다.
- 기존 코드는 `ITEMS.forEach((item,index)=>{if(!item.id)item.id=\`nav-${index}\`;});`로 기존 번호를 고정한 뒤 새 최상단 메뉴를 삽입한다. 이 순서를 유지해야 nav-21 즐겨찾기가 깨지지 않는다.

## 2. 썸네일 handoffv31 링크

- `?page=studio-thumb&sub=handoffv31`는 **정적 라우팅상 유효**하다.
- 허브 `showRoute()`는 `thumb-edit-studio-20261123/?tab=thumb&sub=handoffv31`를 연다.
- 스튜디오 `index.html`은 `data.js`, `content.js`, `studio.js`를 로드한다.
- `data.js` 15행 `MENUS.thumb`에 `id:'handoffv31'` 항목이 있다. 제목은 **📦 썸네일 V3.1 이전 패키지 (Codex용)**이고 `f:'thumb-handoff-v31/'`이다.
- `studio.js`의 `go()`는 이 ID를 선택하고 `show()`가 `m.f`를 iframe으로 연다.
- 최종 `thumb-handoff-v31/index.html` 파일은 Git tree에 존재한다.
- 이번 작업에서는 연결 경로만 점검했다. 썸네일 규칙 내용은 통합하지 않았다. 브라우저 실행 검증은 root가 별도로 수행해야 한다.

## 3. 사용자 제공 명령의 실행 파일 존재 여부

| 경로 | tree 정확 일치 | 하위 경로 접미 일치 | 판정 |
|---|---|---|---|
| `bin/lint_script.py` | 없음 | 없음 | 제작 PC 도구를 가리키는 원문 명령으로 보관; 현재 공개 repo에서 실행 가능하다고 표시 금지 |
| `bin/catalog.py` | 없음 | 없음 | 동일 |
| `episodes/ramen-20261115/script_data.py` | 없음 | 없음 | 동일 |

검사 기준은 저장소 전체 21,968개 파일의 경로다. 실제 제작 PC에 파일이 없다는 뜻은 아니다.

## 4. 일본 자료 51개 경로

| 항목 | 수 |
|---|---:|
| Git tree에서 존재 확인 | 51 |
| GitHub 링크 생성 가능 | 51 |
| 로컬 체크아웃 존재 | 19 |
| 고정 커밋 raw URL HTTP 응답 확인 | 32 |
| 전체 본문 실제 읽기·UTF-8 디코딩·SHA256 확인 | 51 |
| 아직 읽지 못한 자료 | 0 |

- 확인 기준 커밋: `61ba5df41cba88cb315fcd184c4c203b47b7dbcd`.
- **최종 UI에는 `../data/japan-source-index.json`을 사용**하면 된다.
- 상세 읽기 증거는 `../data/japan-source-read-audit.json`이다. 각 TSV 행 수, JSON 최상위 자료형/개수, 모든 파일의 바이트·해시가 있다.
- 이전 `japan-source-index.json`의 `read_in_this_audit`는 로컬 파일 존재를 기준으로 기록했던 필드다. 이를 실제 본문 읽기로 오해하지 않도록 최종판에서 교정했다.
- 본문을 읽었다는 뜻은 수집표의 모든 인용·조회수·화자·권리·원음을 검증했다는 뜻이 아니다. 원본 영상 사실/원음 검증 상태는 그대로 유지한다.
