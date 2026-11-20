# 사용자 발굴 · 유튜브 외 현지원본 / 한일 비교

- [노란 대시보드](https://geben147-create.github.io/Insta/reactions-downloads/user-discovery-20261120/)
- [채널 원장](https://geben147-create.github.io/Insta/reactions-downloads/user-discovery-20261120/#channels)
- [일본 분리 자료](https://geben147-create.github.io/Insta/reactions-downloads/user-discovery-20261120/#japan)
- [러시아 분리 자료](https://geben147-create.github.io/Insta/reactions-downloads/user-discovery-20261120/#russia)
- [타임라인·자막 해시](https://geben147-create.github.io/Insta/reactions-downloads/user-discovery-20261120/#timeline)
- [기존 누적 대시보드](https://geben147-create.github.io/Insta/reactions-downloads/audit-20261120/)

## 원문과 판정
사용자가 2026-11-20 제공한 두 문서를 sources/에 그대로 보존했습니다. 첫 원문은 채널 이름42행이며 韩国姑娘金爱吃가9·31번에 중복되어 고유명은41개입니다. 원문이 주장한 프로필/엑셀 링크는 실제 첨부에서 유실돼 실제 UID를 별도로 복원합니다. 둘째 원문에 남은 고유 Bilibili 영상 ID는5개, 주소가 빠진 개별 방송/커뮤니티/영상 요청은27개, 플랫폼 로드맵은14행입니다. 이미지 검색 썸네일은 해당 영상의 진짜 썸네일로 채택하지 않았습니다.

A/B/C 등급은 제출 원문의 주장으로 보존하고 독립 확인과 분리합니다. 현지 플랫폼에 게시됐다는 사실이 YouTube 부재·독점·저작권 허락을 입증하지 않습니다. 신규 다운로드는 YouTube를 제외합니다. 원문 영상/방송/커뮤니티 원본, 사진·GIF·글·동영상 및 실제 한일 비교 발언의 확인 수준을 구분합니다.

## 저장·자막
새 폴더: `/run/media/yh/새 볼륨/틱톡/샤오(한국 일본 영상들)/사용자발굴_한일비교_현지원본_20261120_164550/`

국가/채널/영상ID 하위 폴더에 직접 저장합니다. 일본·러시아는 별도 국가 폴더입니다. 국가 폴더는 자료 분류이며 화자 국적의 확정이 아닙니다. 지정870루트 전체의 기존보유를 먼저 확인하고, 이미 있는 영상은 원본 경로와 해시를 재사용합니다. 기존 영상·자막 삭제/덮어쓰기는 하지 않습니다. 현재 PC 원본은 접근하지 못했으므로 PC 현행 파일/양쪽 해시 대조는 UNKNOWN이며, 양쪽 모두에 없다고 주장하지 않습니다.

영상의 실제 경로·바이트·SHA256·비디오/오디오 스트림을 확인합니다. 플랫폼 발화 자막 우선 조회 후 없을 때만 이미 캐시된 로컬 Whisper large-v3-turbo CPU int8로 보완합니다. 다른 GPU 작업이나 기존 Whisper와 중복 실행하지 않습니다. 원문이 정상이고 한국어만 없을 때는 번역만 합니다. 원문/한국어의 큐수·시간코드·본문·빈 번역·영상길이를 대조하고 개별 자막 및 타임라인 SHA256을 연결합니다. 자동 언어 감지와 기계번역은 인간 의미검수와 구별합니다.

원본 MP4 및 권리 미확정 발화/가사 전문은 공개 GitHub에 게시하지 않습니다. 870 보관 경로·해시와 출처 링크를 제공하고, 공개 타임라인은 큐·시작/종료시간·본문 해시로 연결합니다. 원문/한국어 전문이 포함된 개인 검수용 시간축은 `.timeline.private.tsv`, 공개 가능한 수치/해시 시간축은 `.timeline.metadata.tsv`로 분리합니다.

## 진행 스냅샷
정확한 현재 게시 수치는 data.json의 summary.updated_at을 기준으로 읽으세요. 후보·영상 저장·자막 준비·의미 검수·시트 쓰기는 별개 상태입니다. 연구/다운로드/자막 작업이 진행 중이면 완료로 표시하지 않습니다. 러시아 등 아직 자료가 없는 탭의0행은 완료나 부재 확정이 아닙니다.

Google 시트는 로컬 OAuth 토큰이 없고 기존 한국반응 시트를 ego에서 열면 Google 로그인으로 이동했습니다. 쓰기를 시도하지 않았으며 BLOCKED_LOGIN_REQUIRED 상태입니다. 시트 가져오기용 TSV는 files/에 준비하되 실제 쓰기와 동일 대상 readback 전에는 시트 동기화 완료로 표시하지 않습니다.

기존 870 영상의 재해시 및 이전 비유튜브 후보의 현재 보유/누락 대조도 별도로 기록합니다. 원래 경제·주식·ETF·미국주식 원페이지와 루트 통합 인덱스는 수정하지 않습니다.
