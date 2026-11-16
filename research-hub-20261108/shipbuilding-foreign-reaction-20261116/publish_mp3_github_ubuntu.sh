#!/usr/bin/env bash
# Publish locally generated EP01~EP03 MP3 files to the GitHub Pages workboard.
# Requires a GitHub-authenticated git credential helper for write access.
set -Eeuo pipefail

SRC="${SHIPBUILDING_TTS_DIR:-$HOME/ai-work/shipbuilding-tts-20261116}"
REPO="https://github.com/geben147-create/Insta.git"
SUBDIR="research-hub-20261108/shipbuilding-foreign-reaction-20261116"
for tool in git mktemp; do
  command -v "$tool" >/dev/null || { echo "필수 도구 없음: $tool" >&2; exit 1; }
done
for ep in EP01 EP02 EP03; do
  file="$SRC/$ep.mp3"
  [[ -s "$file" ]] || { echo "MP3 파일이 없습니다: $file" >&2; exit 1; }
done

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
echo "🔗 GitHub Pages 작업판에 EP01~EP03 MP3를 등록합니다."
git clone --depth 1 --filter=blob:none --sparse "$REPO" "$work/Insta"
git -C "$work/Insta" sparse-checkout set "$SUBDIR"
dest="$work/Insta/$SUBDIR/audio"
mkdir -p "$dest"
for ep in EP01 EP02 EP03; do
  cp "$SRC/$ep.mp3" "$dest/$ep.mp3"
done

git -C "$work/Insta" add "$SUBDIR/audio/EP01.mp3" "$SUBDIR/audio/EP02.mp3" "$SUBDIR/audio/EP03.mp3"
if git -C "$work/Insta" diff --cached --quiet; then
  echo "✅ 이미 같은 MP3 3개가 GitHub에 있습니다."
  exit 0
fi
git -C "$work/Insta" -c user.name="${GIT_AUTHOR_NAME:-Ubuntu MP3 Publisher}" -c user.email="${GIT_AUTHOR_EMAIL:-ubuntu-mp3-publisher@users.noreply.github.com}" commit -m "Publish shipbuilding EP01-03 narration MP3"
git -C "$work/Insta" push origin HEAD:main
echo "✅ GitHub 업로드 완료. Pages 배포 후 다음 작업판에서 바로 재생할 수 있습니다:"
echo "https://geben147-create.github.io/Insta/$SUBDIR/"
