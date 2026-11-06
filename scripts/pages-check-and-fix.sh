#!/usr/bin/env bash
set -euo pipefail
# GitHub Pages diagnostics and guarded repair for geben147-create/Insta.
# Usage: bash scripts/pages-check-and-fix.sh
#        bash scripts/pages-check-and-fix.sh --apply
# Default mode never changes repository settings, files or deployments.
REPO="geben147-create/Insta"
MODE="${1:---check}"
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) 설치가 필요합니다: https://cli.github.com/"
  exit 2
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub 계정 로그인 필요: gh auth login"
  exit 2
fi
echo "=== Repository and Pages status ==="
gh repo view "$REPO" --json nameWithOwner,defaultBranchRef,url --jq '{repo:.nameWithOwner,branch:.defaultBranchRef.name,url:.url}'
PAGES="$(gh api "repos/$REPO/pages" --jq '{build_type,source,status,html_url}' 2>/dev/null || true)"
if [[ -n "$PAGES" ]]; then
  echo "$PAGES"
else
  echo "Pages site not accessible or not configured. Check account permissions."
fi
echo "=== Recent Pages runs ==="
gh api "repos/$REPO/actions/runs?per_page=8" --jq '[.workflow_runs[]|{name,run_number,status,conclusion,html_url}]'
if [[ "$MODE" != "--apply" ]]; then
  echo "Read-only completed. For a guarded repair: bash scripts/pages-check-and-fix.sh --apply"
  exit 0
fi
TYPE="$(gh api "repos/$REPO/pages" --jq '.build_type' 2>/dev/null || true)"
SOURCE="$(gh api "repos/$REPO/pages" --jq '(.source.branch // "") + ":" + (.source.path // "")' 2>/dev/null || true)"
if [[ "$TYPE" == "workflow" ]]; then
  echo "Pages source is custom Actions; not switching it automatically. Check Settings > Pages."
  exit 3
fi
if [[ -z "$TYPE" ]]; then
  echo "Creating Pages using main /(root) publishing source..."
  printf '{"build_type":"legacy","source":{"branch":"main","path":"/"}}' | gh api -X POST "repos/$REPO/pages" --input - >/dev/null
elif [[ "$SOURCE" != "main:/" || "$TYPE" != "legacy" ]]; then
  echo "Updating Pages publishing source to main /(root)..."
  printf '{"build_type":"legacy","source":{"branch":"main","path":"/"}}' | gh api -X PUT "repos/$REPO/pages" --input - >/dev/null
else
  echo "Pages is already configured for main /(root)."
fi
ACTIVE="$(gh api "repos/$REPO/actions/runs?per_page=12" --jq '[.workflow_runs[]|select(.name=="pages build and deployment" and (.status=="queued" or .status=="in_progress"))]|length' 2>/dev/null || echo 0)"
if [[ "$ACTIVE" -gt 0 ]]; then
  echo "Pages build is already pending/running. Not starting duplicate builds."
else
  echo "No active Pages build. Requesting one deployment..."
  gh api -X POST "repos/$REPO/pages/builds" >/dev/null || echo "Build request not accepted; inspect repo Actions and Pages."
fi
echo "=== Done. Follow Actions / Pages for success or failure ==="
gh api "repos/$REPO/actions/runs?per_page=4" --jq '[.workflow_runs[]|{name,run_number,status,conclusion,html_url}]'
