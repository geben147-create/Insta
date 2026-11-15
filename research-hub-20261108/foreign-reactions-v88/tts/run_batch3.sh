#!/usr/bin/env bash
# V8.9 three-episode Korean MP3 producer. No paid API; Qwen3 runs on Ubuntu GPU1.
# Usage: bash tts/run_batch3.sh --dry-run
#        bash tts/run_batch3.sh --publish
#        QWEN_TTS_MODEL=/home/yh/.../CustomVoice bash tts/run_batch3.sh --publish
set -Eeuo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null || true)"
PROJECT_REL="research-hub-20261108/foreign-reactions-v88"
AUDIO_DIR="$PROJECT_DIR/audio"
PUBLISH=0
DRY_RUN=0
ARGS=()

for arg in "$@"; do
  case "$arg" in
    --publish) PUBLISH=1 ;;
    --allow-download) ARGS+=("$arg") ;;
    --dry-run) DRY_RUN=1; ARGS+=("$arg") ;;
    *) ARGS+=("$arg") ;;
  esac
done

if [[ "$PUBLISH" -eq 1 && "$DRY_RUN" -eq 1 ]]; then
  echo "❌ --publish 와 --dry-run 을 동시에 사용할 수 없습니다." >&2
  exit 2
fi

if [[ "$PUBLISH" -eq 1 ]]; then
  [[ -n "$REPO_ROOT" ]] || { echo "❌ git clone된 Insta 폴더 안에서 실행해야 GitHub에 게시됩니다." >&2; exit 2; }
  [[ "$(git -C "$REPO_ROOT" branch --show-current)" == "main" ]] || {
    echo "❌ 안전한 게시를 위해 main 브랜치에서 실행하세요." >&2; exit 2;
  }
  REMOTE="$(git -C "$REPO_ROOT" remote get-url origin)"
  [[ "$REMOTE" == *"geben147-create/Insta"* ]] || {
    echo "❌ 저장소 origin이 geben147-create/Insta가 아닙니다: $REMOTE" >&2; exit 2;
  }
  git -C "$REPO_ROOT" diff --cached --quiet || {
    echo "❌ 다른 staged 변경이 있습니다. 기존 staged 파일을 커밋에 섞지 않도록 중단합니다." >&2; exit 2;
  }
fi

if [[ -n "${QWEN_TTS_PYTHON:-}" ]]; then
  PY="$QWEN_TTS_PYTHON"
else
  PY=""
  for candidate in \
    "$HOME/ai-work/tts_cosy_prod/venv/bin/python" \
    "$HOME/ai-work/tts_cosy_prod/.venv/bin/python" \
    "$HOME/ai-work/tts_cosy_prod/qwen-tts-venv/bin/python" \
    "$(command -v python3 || true)"; do
    if [[ -x "$candidate" ]]; then
      if [[ "$DRY_RUN" -eq 1 ]] || "$candidate" -c "import torch,numpy,soundfile,qwen_tts" >/dev/null 2>&1; then
        PY="$candidate"; break
      fi
    fi
  done
fi
[[ -n "$PY" && -x "$PY" ]] || {
  echo "❌ qwen_tts가 있는 Python을 찾을 수 없습니다. 기존 설치된 가상환경을 지정하세요:" >&2
  echo "   QWEN_TTS_PYTHON=/경로/venv/bin/python bash tts/run_batch3.sh --publish" >&2
  exit 2
}

# Physical GPU 1 becomes logical cuda:0 inside the masked TTS process.
# Respects an existing CUDA_VISIBLE_DEVICES (including a stable GPU UUID).
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-${TTS_GPU:-1}}"
export PYTHONUNBUFFERED=1
echo "🎙️ 실행 Python: $PY"
echo "🎛️ GPU mask: CUDA_VISIBLE_DEVICES=$CUDA_VISIBLE_DEVICES"
echo "📄 원본 대본: $PROJECT_DIR/data.js"

"$PY" "$SCRIPT_DIR/batch3_qwen.py" --output "$AUDIO_DIR" "${ARGS[@]}"
echo "✅ 음성 3편 일괄 합성 단계 종료"

if [[ "$PUBLISH" -ne 1 ]]; then
  echo "ℹ️ MP3는 로컬에 저장됐습니다. 대시보드 공개 재생은 --publish로 GitHub에 게시한 뒤 가능합니다."
  echo "📂 $AUDIO_DIR"
  exit 0
fi

for id in 01 02 03; do
  test -s "$AUDIO_DIR/EP${id}.mp3" || {
    echo "❌ EP${id}.mp3가 없습니다. 게시를 취소합니다." >&2; exit 1;
  }
  SIZE="$(stat -c %s "$AUDIO_DIR/EP${id}.mp3")"
  if [[ "$SIZE" -gt 95000000 ]]; then
    echo "❌ EP${id}.mp3가 GitHub 파일 권장 상한에 가까워 게시하지 않습니다." >&2; exit 1;
  fi
done
test -s "$AUDIO_DIR/manifest.json" || { echo "❌ manifest.json이 없습니다." >&2; exit 1; }

git -C "$REPO_ROOT" add -- \
  "$PROJECT_REL/audio/EP01.mp3" \
  "$PROJECT_REL/audio/EP02.mp3" \
  "$PROJECT_REL/audio/EP03.mp3" \
  "$PROJECT_REL/audio/manifest.json"
if ! git -C "$REPO_ROOT" diff --cached --quiet; then
  git -C "$REPO_ROOT" commit -m "Publish V8.9 Korean Qwen3 TTS MP3 previews EP01-03"
fi
if git -C "$REPO_ROOT" push origin main; then
  echo "✅ GitHub 게시 완료. GitHub Pages 배포 후 대시보드 MP3 플레이어가 활성화됩니다."
  echo "🌐 https://geben147-create.github.io/Insta/research-hub-20261108/foreign-reactions-v88/"
else
  echo "❌ GitHub push에 실패했습니다. 로컬 MP3는 보존했습니다." >&2
  echo "   인증: gh auth login (또는 Git 자격증명 설정)" >&2
  echo "   원격 변경 시: git pull --rebase origin main, 이후 git push origin main" >&2
  exit 1
fi
