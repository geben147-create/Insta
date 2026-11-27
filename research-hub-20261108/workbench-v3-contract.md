# 콘텐츠 작업실 V3 연결 계약 / 진행 기록

- 기존 경로: `research-hub-20261108/#workspace`; 새 내부 탭 `#workspace-run`은 기존 `workspace-panel`에 렌더링. 외부 사이트는 원본 새 탭으로 열며 `q`는 그대로 전달. 기존 해시·원장·자료·TTS 보존.
- 선택 `schema: content-workbench.selection.v1`, `schema_version: 1`, `format: shorts|longform`, `mode: reference_batch`, `timezone: Asia/Seoul`, `project_id`, `run_id`, `created_at`, `published_within_days: 30|60`, `filters_snapshot`(`filters` 별칭 지원), `selected` 배열. 진단은 명시 내부 테스트에서만 가능.
- 항목: `video_id`, 일치하는 `source_url`, `title_original`, `channel`, `published_at` (ISO offset 포함 또는 null), `published_date` (YYYY-MM-DD 또는 null), `views` (0 포함 정수 또는 null), `observed_at`, `retrieved_at`, `duration_seconds`, `language`, `format`, `model_id`, `model_version` (모두 미확인은 null), `selection_reason`, `rights`. 날짜만 있는 자료는 KST 하루 범위가 창 전체에 들어갈 때만 채택하고 경계가 겹치면 확인 필요. 모델 가정을 조회 관측 또는 정산으로 대체하지 않는다.
- 전달: JSON 가져오기 또는 같은 GitHub Pages origin에서 `content-workbench:selection:v1:<format>:<run_id>`를 명시 발행한 뒤 `?format=shorts|longform&run_id=<id>#workspace`. 전문 자막·개인 경로·비공개 자료를 공용 키에 싣지 않는다. 허브는 수신된 선택을 검증한 뒤 사용자가 실행을 저장할 때만 원장에 추가한다. 키를 자동 검색하지 않는다.
- 메뉴 기본 키 `insta-hub:nav:v1`, 고정 URL/기존 ID 기반. 기존 `kukppong-hub-menu-order-v1` 및 workflow 라벨은 지우지 않는다. 실행·단계 메타 키 `insta-hub:run:v1:<project_id>:<run_id>`. 전문 자막, 프레임, 대본은 기본적으로 이 탭 메모리 및 권한 있는 사용자 다운로드에만 둔다. 원격 `workspace-registry.json`과 `workspace-data.js`에 비공개 전문/자료를 넣지 않는다.
- 기존 `workspace-registry.json`의 공개 원장, `workspace-data.js`의 폴백 및 TOP5 유지. 신규 비공개 실행은 같은 작업실 내에 표시하며 정적 공개 원장에 병합하지 않는다. Sheets나 HumanTouch API를 가정하지 않는다.
- HumanTouch 상태: 패키지 준비, 호환성, 반입, 편집 저장, 렌더는 별도. 검증된 importer/수신 증거 없이는 호환 미확인 / 반입 미시작. 실제 음성과 검증된 타임라인이 없으면 새 제작 SRT 미포함.

## 진행 이력
- Task 1 연결 규격: 기준 `dfc932d104057249ccd36ea02b6aa0a319ee534d`; 기존 `workspace-handoff.md` 읽음. 관련 경로의 AGENTS/HANDOFF는 해당 SHA에서 없음. 쇼츠·롱폼 저장소는 변경 금지. 롱폼 담당자와 공용 JSON/키/URI 계약 공유. 런타임 검증은 별도 기록.
