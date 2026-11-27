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

## V3 브랜치 검증 (2026-11-27 KST)
- Task 1: 기존 해시 라우터와 왼쪽 메뉴 하나에 V3 연결. Chrome 고정 커밋에서 `#workspace-run`, 기존 작업실·MP3 링크, V3 내부 iframe 0개 확인. 별도 바둑판은 기존 원본 주소와 `q`로 열며 저장소에 쓰지 않는다.
- Task 2: `workbench-v3-nav.js`. 고정 ID, 동적 항목, 이름/설명/정렬, 저장·취소·되돌리기·기본값·백업. 합성 Chrome에서 저장 차단·다른 탭 리비전 검증. 실제 브랜치 기존 메뉴에 편집기 표시 확인. 이동은 같은 부모 내만, 중복 ID/경로의 모호한 기존 항목은 자동 이관하지 않는다. TOP2·Hermes 전용 위젯과 전용 설정은 보존.
- Task 3: `workbench-v3-core.js`, `workbench-v3-ui.js`. Chrome 단위: 8편, 6편 거부, 0/null, 실패만 재시도, 내부 1편 외부 차단. 실제 쇼츠 공개 메타데이터 30일 목록에서 196편·150채널 조회 후 8편 고정 UI 확인. 공개 원장 기존 JSON/JS에는 변경 없음. 브라우저 실행 저장은 개인 환경이며 기기 간 동기화가 아니다.
- Task 4: Chrome SRT 타임코드·TXT null·공개 권한 없는 전문 제외·부분 누락 확인. 합성 SRT ZIP을 PowerShell .NET ZIP으로 열어 UTF-8 본문 확인. 자막 확보·사람 검토·내보내기 별도. 자동 자막 수집·Sheets 쓰기 미연결.
- Task 5: Node 합성 단위 3건 및 Chrome 합성 VFR 11항목 PASS. 실제 표시 PTS, 컷 구간, 페이드, 빠른 팬 비경계, 큐 겹침, 합치기·나누기, 실패·취소 확인. 처음 30초, 근사 장면 후보이며 모든 원본 프레임을 검사하는 것이 아니다. 승인된 실사용 영상은 별도 미확보.
- Task 6: `workbench-v3-core.js`, `workbench-v3-ui.js`. 대본/아웃라인/제목·썸네일/장면 매핑, 한국어 이미지·영상 필드, 영어 실행문, 일본어 검수 및 문단 메모. 사용자 입력·검토 작업대이며 자산 생성·실제 녹음·수익 보장 기능이 아니다.
- Task 7: 합성 검토용 ZIP 구성 확인. 승인된 HumanTouch 정상 반입 샘플 또는 importer 코드 미확보: 호환 미확인·반입 시작 전·편집 저장/렌더 미실시. HumanTouch 본체·Hermes·포트·원본 폴더 무변경. 실제 음성/타임라인 없이는 제작 SRT 미포함.
- Task 8: 독립 브랜치 `content-workbench-v3-hub-9df2`, 기능 커밋 `0e0e7b8fd9251a4c799847fabf58083e86a2a4cb`. 고정 커밋 원격 파일로 Chrome 점검. `workspace-registry.json`, `workspace-data.js`, TOP5 보고서, Hermes 메뉴 코드가 기준과 바이트 단위로 일치. 두 담당자의 실제 제공 결과가 준비돼야 같은 origin의 최종 연결 및 main/Pages 반영 가능. 기존 공식 Pages 변경 없음.
