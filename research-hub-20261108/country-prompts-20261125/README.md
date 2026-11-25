# 국가별 제작 프롬프트 · 2026-11-25

대상 국가를 먼저 정하고 **원본 조사 → 주제·근거 → 훅·감정선 → 아웃라인 → 대본 → 제목·썸네일 문구 → 최종 검수** 순서로 사용하는 제작 프롬프트와 이번 세션의 자료 모음이다.

[국가별 프롬프트 페이지](https://geben147-create.github.io/Insta/research-hub-20261108/country-prompts-20261125/) · [기존 리서치 허브](https://geben147-create.github.io/Insta/research-hub-20261108/) · [한국어 통합 허브](https://geben147-create.github.io/Insta/국뽕-유튜브-리서치-허브-20261108/)

## 🟨 먼저 정하는 값

- **대상 국가:** 칭찬·자긍심 회수의 대상. 한국, 일본, 러시아, 프랑스 등 사용자가 정한 국가.
- **작성 언어:** 대본·번역·화면 문구를 쓰는 언어. 대상 국가와 별개다. 일본을 대상으로 한국어 대본을 쓸 수 있다.
- **주제·시청자·길이:** 회차별 입력. 국가만 바꾸었다고 기존 영상·숫자·역사·인용의 국적까지 바꾸지 않는다.

국가 치환은 실행 프롬프트의 변수에 적용한다. 실제 인물의 발언, 출처 제목, 원문, 역사적 사실, 영상 ID, URL은 바꾸지 않는다. 실제 발언을 확보하지 못한 부분은 창작 문장과 구분한다.

## 🟪 원문 보존과 실행용 파생본

| 구분 | 위치 | 처리 |
|---|---|---|
| 이번에 사용자가 제공한 STEP 4 | [originals/user-step4-verbatim.txt](originals/user-step4-verbatim.txt) | 붙여넣은 원문을 보존한다. 오탈자·이스케이프·국가 혼재를 임의 교정하지 않는다 |
| STEP 4 읽기용 표시 | [originals/user-step4-readable.md](originals/user-step4-readable.md) | 읽기 편한 파생본이며 원문 자체를 대체하지 않는다 |
| 기존 GitHub STEP 0~4 | [data/original-step0-4.json](data/original-step0-4.json), `originals/github-step0.txt`~`github-step4.txt` | 기존 프롬프트의 원문·출처·해시를 별도 보존한다 |
| 이번 세션 기록 | [originals/session-archive.md](originals/session-archive.md), [data/session-archive.json](data/session-archive.json) | 확보된 대화의 기획·자료·검증 한계를 보존한다 |
| 국가별 실행 프롬프트 | [prompts](prompts/) | 국가·언어·주제에 맞춰 쓰는 파생본. 원문에 새 지시를 덮어쓰지 않는다 |

사용자 STEP 4의 해설 문장은 ‘잇고’에서 끝나며 검수문에는 ‘일본 호평’과 ‘한국의 자긍심’이 함께 있다. 기존 GitHub STEP 4와 동일하지 않다. 원문은 그대로 두고, 실행본에서 선택 국가를 일관되게 적용한다.

## 🟦 수록 자료와 확인 범위

| 자료 | 수량 | 위치 | 확인한 범위 |
|---|---:|---|---|
| 이번 세션의 일본 회차 | EP11~50, **40편** | [data/episodes-11-50.json](data/episodes-11-50.json) | 보이는 대화에서 확보한 훅·감정선·출처 표기. 사실·원음의 일괄 재검증 완료를 뜻하지 않는다 |
| 참고 자막 도입 원문 | **7편** | [data/reference-hooks-7.json](data/reference-hooks-7.json) | R01~R07의 첫 문단을 정확히 추출. 자동자막 오탈자 보존 |
| 기존 실전 훅 카드 | **22편** | [data/hook-examples-22.json](data/hook-examples-22.json) | 저장된 원문·화면 설명·출처 URL·시간 라벨. ‘훅 없음’도 보존 |
| 분산 일본 자료 목록 | **51개 경로** | [data/japan-source-index.json](data/japan-source-index.json) | Git tree 존재, 전체 본문 읽기, UTF-8 디코딩, SHA256 확인 |
| 직접수집 원장 | **589행 / 고유 ID 589개** | [원장 원본](../../reactions-downloads/japan-direct-latest.tsv) | 조사 기준 커밋의 저장값. 자막 큐·조회수·권리는 현재 실시간 검증값이 아니다 |
| 대화에서 사용한 한국어 SRT | **3개 / 총 126큐** | [reference/srt](reference/srt/) | 병원 39큐, 드럭스토어 69큐, 연어알덮밥 18큐. 번역 파일만 확인 |
| 메뉴·명령 경로 확인 | 1식 | [reference/additional-static-audit.md](reference/additional-static-audit.md) | 사용자 링크의 정적 라우팅 및 공개 저장소 내 명령 파일 유무 |

51개 경로는 서로 겹치는 영상·기사를 포함할 수 있다. 경로 수나 각 표의 행 수를 합산해 고유 영상 수로 표시하지 않는다. 전체 본문을 읽었다는 것은 그 안의 모든 인용·화자·조회수·권리·최신성·원음을 검증했다는 뜻이 아니다.

### 원문·SRT 세부 증거

- [일본 자료 전체 읽기·해시 감사](data/japan-source-read-audit.json): 51개 중 로컬 체크아웃 19개, 커밋 고정 raw URL HTTP 응답 확인 32개, 전체 읽기 51개, 미독 0개.
- [SRT 출처 대조](data/session-srt-source-audit.json): 영상 ID, 원장 정보, 파일 해시, 큐 수.
- [SRT 원문별 레코드](data/srt-records.json), [SRT 목록](data/srt_manifest.json).
- [기존 프롬프트·참고 훅 복구 기록](reference/source-recovery.md), [복구 상태](data/recovery-status.json).
- [출처 표시 복구 목록](data/source-reference-register.json): 대화에 남아 있는 출처 표기와 확인 상태. 해석되지 않는 옛 검색 토큰을 유효한 링크로 꾸미지 않는다.

## 🟥 아직 복원·검증하지 못한 항목

1. **EP01~10 전체 원문:** 이번에 확보한 대화와 관련 저장소 텍스트에서는 완전한 원문을 찾지 못했다. 제목이나 일부 언급만으로 본문을 만들어 ‘복구 완료’라고 표시하지 않는다.
2. **이전 답변이 말한 ‘실제 훅 14개’의 특정 목록:** 동일한 14개를 식별하지 못했다. 확보한 7편 참고 자막과 22편 카드가 바로 그 14개라고 주장하지 않는다.
3. **50편의 첫 1~2문장 실제 외국인 원음:** 전편 확보·검증 완료가 아니다. 창작 훅 후보, 저장된 번역 자막, 실제 청취로 확인한 발언을 구분해야 한다.
4. **각 편 신규 출처 5개 이상·해외 언론사 3곳 이상:** 전편에 대해 검증된 완료 상태가 아니다.
5. **기존 한일 비교 51~100:** 별도의 회차 집합이다. 이번 일본 EP01~50의 누락분을 대신 채우는 자료로 쓰지 않는다.

세부 상태는 [data/gap-register.json](data/gap-register.json)에 남긴다. 후속 보충에서도 미확인을 자동으로 완료로 바꾸지 않는다.

## 🟩 제목·썸네일 단계와 링크

제목·썸네일 문구는 대본 뒤에 배치한다. 제목과 썸네일 문구의 약속을 대본의 실제 근거·반전과 대조한다. **이번에는 썸네일 제작 규칙을 통합하거나 다시 쓰지 않고 사용자가 준 링크만 연결한다.**

- [썸네일 V3.1 이전 패키지](https://geben147-create.github.io/Insta/국뽕-유튜브-리서치-허브-20261108/?page=studio-thumb&sub=handoffv31): 정적 라우팅상 `thumb-edit-studio-20261123/thumb-handoff-v31/index.html`로 연결된다.
- [사용자 제공 nav-21 원본 자료 링크](https://geben147-create.github.io/Insta/국뽕-유튜브-리서치-허브-20261108/?page=nav-21): ‘국뽕해외반응 · 중국 SNS (처음 준 링크)’ 메뉴다. 썸네일 메뉴로 잘못 표기하지 않는다.

## 범위와 명령 상태

**영상 편집 단계는 이번 제작 프롬프트 묶음에 추가하지 않는다.** 사용자 원문에 이미 들어 있는 클립 경계·프레임 확인 문장은 원문 보존 대상으로 남긴다. 별도의 편집·렌더링·효과음·합성·업로드 공정을 덧붙이지 않는다.

원문에 등장하는 아래 경로는 공개 저장소 전체 파일 목록에서 찾지 못했다. 명령 문자열을 보존하되, 이 페이지나 현재 환경에서 실행·통과했다고 보고하지 않는다. 제작 PC의 로컬 도구 존재 여부는 별도 확인이 필요하다.

- `bin/lint_script.py`
- `bin/catalog.py`
- `episodes/ramen-20261115/script_data.py`

상세 정적 확인: [data/route-and-command-audit.json](data/route-and-command-audit.json).

## 조사 기준과 갱신

원본 조사 기준은 [61ba5df41cba88cb315fcd184c4c203b47b7dbcd](https://github.com/geben147-create/Insta/commit/61ba5df41cba88cb315fcd184c4c203b47b7dbcd)이다. 기존 자료를 이동·삭제하지 않고 경로를 모았다. 이후 자료가 추가되면 원문, 실행본, 검증 상태를 각각 갱신하고 변경 근거를 남긴다.

작성: by ChatGPT · source recovery
