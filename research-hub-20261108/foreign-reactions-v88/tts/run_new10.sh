#!/usr/bin/env bash
# EP11-20: local GPU1 Qwen3-TTS -> strict 9m01s MP3 check -> optional GitHub publish.
# bash research-hub-20261108/foreign-reactions-v88/tts/run_new10.sh --dry-run
# bash research-hub-20261108/foreign-reactions-v88/tts/run_new10.sh --publish
set -Eeuo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd -- "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(git -C "$PROJECT_DIR" rev-parse --show-toplevel 2>/dev/null || true)"
REL="research-hub-20261108/foreign-reactions-v88"
AUDIO="$PROJECT_DIR/audio"
MODE="local"
PASSTHROUGH=()
for arg in "$@"; do
  case "$arg" in
    --publish) MODE="publish" ;;
    --dry-run) MODE="dry-run" ;;
    --allow-download) PASSTHROUGH+=("--allow-download") ;;
    *) PASSTHROUGH+=("$arg") ;;
  esac
done
if [[ "$MODE" == "publish" ]]; then
  [[ -n "$REPO_ROOT" ]] || { echo "❌ git clone된 Insta 경로에서 실행하세요" >&2; exit 2; }
  [[ "$(git -C "$REPO_ROOT" branch --show-current)" == "main" ]] || { echo "❌ main 브랜치에서 실행하세요" >&2; exit 2; }
  ORIGIN="$(git -C "$REPO_ROOT" remote get-url origin)"
  [[ "$ORIGIN" == *"geben147-create/Insta"* ]] || { echo "❌ origin 저장소가 일치하지 않습니다: $ORIGIN" >&2; exit 2; }
  git -C "$REPO_ROOT" diff --cached --quiet || { echo "❌ 다른 staged 파일이 있어 혼합 커밋 방지 중단" >&2; exit 2; }
fi
PY="${QWEN_TTS_PYTHON:-}"
if [[ -z "$PY" ]]; then
  for candidate in \
    "$HOME/ai-work/tts_cosy_prod/venv/bin/python" \
    "$HOME/ai-work/tts_cosy_prod/.venv/bin/python" \
    "$HOME/ai-work/tts_cosy_prod/qwen-tts-venv/bin/python" \
    "$(command -v python3 || true)"; do
    if [[ -x "$candidate" ]]; then
      if [[ "$MODE" == "dry-run" ]] || "$candidate" -c 'import torch,soundfile,qwen_tts' >/dev/null 2>&1; then
        PY="$candidate"; break
      fi
    fi
  done
fi
[[ -n "$PY" && -x "$PY" ]] || {
  echo "❌ Qwen TTS Python을 찾지 못했습니다. QWEN_TTS_PYTHON=/home/yh/.../python 을 지정하세요." >&2
  exit 2
}
export CUDA_VISIBLE_DEVICES="${CUDA_VISIBLE_DEVICES:-${TTS_GPU:-1}}"
export PYTHONUNBUFFERED=1
echo "🎙️ EP11~20 한국어 Sohee Qwen3, GPU1 mask $CUDA_VISIBLE_DEVICES"
EPISODES=(11 12 13 14 15 16 17 18 19 20)
if [[ "$MODE" == "dry-run" ]]; then
  "$PY" "$SCRIPT_DIR/batch3_qwen.py" --episodes "${EPISODES[@]}" --min-duration-sec 541 --dry-run
  exit 0
fi

command -v ffprobe >/dev/null || { echo "❌ ffprobe 필요: sudo apt install ffmpeg" >&2; exit 2; }
"$PY" "$SCRIPT_DIR/batch3_qwen.py" --episodes "${EPISODES[@]}" --min-duration-sec 541 --output "$AUDIO" "${PASSTHROUGH[@]}"
test -s "$AUDIO/manifest.json" || { echo "❌ MP3 목록 manifest 없음" >&2; exit 1; }
for id in "${EPISODES[@]}"; do
  AUDIOFILE="$AUDIO/EP${id}.mp3"
  test -s "$AUDIOFILE" || { echo "❌ EP$id 파일 없음" >&2; exit 1; }
  SECONDS="$(ffprobe -v error -show_entries format=duration -of default=nokey=1:noprint_wrappers=1 "$AUDIOFILE")"
  if ! awk -v seconds="$SECONDS" 'BEGIN {exit !(seconds > 541)}'; then
    echo "❌ EP$id 실제 $SECONDS 초 ≤ 541초: 9분 초과 미달, 게시 중단" >&2
    exit 1
  fi
  BYTES="$(stat -c %s "$AUDIOFILE")"
  [[ "$BYTES" -lt 95000000 ]] || { echo "❌ EP$id 파일 크기 초과 $BYTES" >&2; exit 1; }
  "$PY" -c 'import json,sys; d=json.load(open(sys.argv[1],encoding="utf-8")); ep=sys.argv[2]; m=d.get("episodes",{}).get(ep); assert m and m["status"]=="ready" and m["duration_sec"]>541 and m["src"]=="audio/EP"+ep, "검수 실패"' "$AUDIO/manifest.json" "$id"
  echo "✅ EP$id MP3 $(printf '%.1f' "$SECONDS")초 실제 검수 통과"
done
echo "🎉 EP11~20 전부 9분 1초 초과 검수 PASS"
if [[ "$MODE" != "publish" ]]; then
  echo "ℹ️ MP3는 로컬에서만 생성했습니다. GitHub Pages에서 들으려면 --publish 옵션으로 재실행하세요."
  exit 0
fi
TRACKS=()
for id in "${EPISODES[@]}"; do TRACKS+=("$REL/audio/EP${id}.mp3"); done
TRACKS+=("$REL/audio/manifest.json")
git -C "$REPO_ROOT" add -- "${TRACKS[@]}"
if ! git -C "$REPO_ROOT" diff --cached --quiet; then
  git -C "$REPO_ROOT" commit -m "Publish ten verified 9min+ Korean Qwen3 MP3 EP11-20"
fi
if git -C "$REPO_ROOT" push origin main; then
  echo "✅ GitHub 업로드 완료. Pages 배포 이후 대시보드 MP3 재생 활성화."
  echo "🌐 https://geben147-create.github.io/Insta/research-hub-20261108/foreign-reactions-v88/"
else
  echo "❌ GitHub push 실패. 음원은 보존됨. git pull --rebase origin main 후 재푸시." >&2
  exit 1
fi
