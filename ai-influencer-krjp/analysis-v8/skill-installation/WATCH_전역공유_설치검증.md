# watch 전역 설치와 Hermes 프로필 공유 검증

검증일: 2026-11-21. Linux 사용자 계정의 Codex·Claude·Hermes 설치 파일을 비교하고, 기존 Hermes 프로필 12개에 전역 watch를 가리키는 링크를 추가했습니다. 기존 스킬 파일이나 환경 설정을 덮어쓰지 않았습니다.

## 출처와 설치 범위

- upstream: <https://github.com/bradautomates/claude-video/tree/main/skills/watch>
- SKILL metadata 버전: `0.3.2`, 라이선스 MIT.
- 부모 작업에서 사용한 설치 입력: `--repo bradautomates/claude-video --path skills/watch --ref main`.
- 확인된 upstream SKILL blob SHA: `5affb5f953f7f1eb9b81f6e2e276cc02d4d34cfa`.
- 설치된 SKILL.md 파일 SHA256: `04bfa3b0d1240d5474b03869907202a3459879e9835e688149458a74320a55cb`.
- `main`의 설치 시점 commit은 확정하지 않았습니다. blob SHA와 commit SHA는 서로 다르며, commit 고정 설치를 했다고 주장하지 않습니다.

| 대상 | 실제 설치 경로 | 파일 일치 | CLI 기본 점검 |
|---|---|---|---|
| Codex | `/home/yh/.codex/skills/watch` | PASS | `--help`, `setup.py --json` PASS |
| Claude | `/home/yh/.claude/skills/watch` | PASS | `--help`, `setup.py --json` PASS |
| Hermes 전역 | `/home/yh/.hermes/skills/media/watch` | PASS | `--help`, `setup.py --json` PASS |
| 기존 Hermes 프로필 12개 | `/home/yh/.hermes/profiles/*/skills/watch` | 전역본 링크 및 읽기 PASS | 각 프로필 SKILL과 스크립트 트리 동일성 확인 |

프로필 링크는 모두 전역 Hermes 디렉터리를 직접 가리킵니다. Codex·Claude는 이번 설치 파일이 동일한 별도 디렉터리이며, 앞으로 전역 Hermes 파일을 바꿨을 때 두 디렉터리까지 자동으로 갱신되는 것은 아닙니다. 각 앱에서의 실제 스킬 목록 새로고침과 영상 분석 실행은 이번 파일 배포 점검에 포함하지 않았습니다.

## 이번에 확인한 실행 상태

세 루트의 `watch.py --help`와 `setup.py --json`은 모두 종료 코드 0입니다. JSON의 민감하지 않은 선택 필드만 기록했습니다.

- `can_proceed: true`, `missing_binaries: []`: 기본 프레임 추출·다운로드 도구가 있습니다.
- `first_run: true`, `configured_engine: auto`, resolved `engine: local`: 첫 실행 설정 마법사는 완료되지 않았습니다.
- `backend_ready: false`, `whisperx_ready: false`: 음성인식 백엔드가 준비되었다고 할 수 없습니다.
- 이번 점검으로 유료 API 호출, ASR 모델 다운로드, 외부 음성 업로드를 하지 않았습니다. 전역 셸 환경도 바꾸지 않았습니다.

따라서 **파일 배포·기본 CLI 준비 PASS**, **음성인식 설정 완료·세 앱 실제 사용 검증은 미완료**입니다. 영상 분석 시 로컬 경로를 명시하고 `--engine local --no-whisper`를 붙이면 유료 모델이나 음성 fallback을 명시적으로 피할 수 있습니다. 이 문서가 영상 자체의 분석 완료를 뜻하지는 않습니다.

## Linux에서 재현하는 절차

아래 설치 명령은 새 설치 대상에서만 사용합니다. 이미 `watch` 디렉터리가 있으면 기존 내용을 지우거나 덮어쓰지 말고 먼저 버전을 비교합니다. 이 작업에서는 부모가 설치한 세 루트를 그대로 유지하고 프로필 링크만 추가했습니다.

```bash
python3 /home/yh/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bradautomates/claude-video --path skills/watch --ref main \
  --dest /home/yh/.codex/skills

python3 /home/yh/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bradautomates/claude-video --path skills/watch --ref main \
  --dest /home/yh/.claude/skills

python3 /home/yh/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --repo bradautomates/claude-video --path skills/watch --ref main \
  --dest /home/yh/.hermes/skills/media
```

`main`은 움직이는 참조입니다. 미래에 동일 파일을 정확히 재현하려면 그때 확인한 commit을 `--ref`에 넣고 아래 해시와 대조해야 합니다. 이번 설치의 commit을 임의로 만들거나 위 blob SHA를 commit처럼 쓰지 않습니다.

프로필 공유와 점검은 함께 제공한 Python 스크립트로 재현할 수 있습니다.

```bash
python3 '/run/media/yh/새 볼륨/_opencv(원페이지+릴스)/output/travel-analysis-v8/skill-installation/install_watch_profile_links.py'
```

이 스크립트는 기존 Hermes `*/skills` 폴더만 대상으로 합니다. `watch` 경로가 없으면 심볼릭 링크를 만들고, 이미 올바른 링크면 그대로 두며, 다른 파일이나 디렉터리가 있으면 보존하고 JSON에 기록합니다. 새로 만드는 미래 프로필에는 다시 같은 링크 단계를 실행해야 합니다. 앱의 설정·프로필·승인 정책은 수정하지 않습니다.

스크립트 없이 한 경로에서 CLI 준비 상태만 확인하려면 다음을 사용합니다. `setup.py --json`의 전체 출력을 공유하지 말고 필요한 boolean·버전·경로 필드만 선택하여 저장합니다.

```bash
python3 /home/yh/.codex/skills/watch/scripts/watch.py --help
python3 /home/yh/.codex/skills/watch/scripts/setup.py --json
```

## 검증 파일

- `install_watch_profile_links.py`: 덮어쓰기 없는 링크 추가 및 세 루트 CLI 점검 코드.
- `watch-shared-install-verification-first.json`: 최초 12개 링크 추가와 파일 비교 결과.
- `watch-shared-install-verification.json`: 최신 재검증 결과. 재실행하면 신규 링크 수는 0이 됩니다.

JSON은 설정 파일의 원문, 키 값, 토큰, stderr 전문을 저장하지 않습니다. 파일 트리 비교는 실행 시 생긴 `__pycache__`와 `.pyc`를 제외합니다.

## 미설치 스킬

`build-video-development-course`는 확인 가능한 공개 배포본을 찾지 못해 설치하지 않았습니다. 다른 스킬을 이 이름으로 바꿔 넣거나 수행했다고 주장하지 않았습니다. 사용자가 해당 스킬의 실제 파일 또는 배포 출처를 제공하면 별도로 확인해야 합니다.
