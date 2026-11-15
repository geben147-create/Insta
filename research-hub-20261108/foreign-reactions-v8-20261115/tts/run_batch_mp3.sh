#!/usr/bin/env bash
# EP01~03 Qwen3-TTS local batch. Example: bash tts/run_batch_mp3.sh --publish
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "$0")" && pwd)"
PYTHON_BIN="$(printenv PYTHON_BIN || true)"
if [ -z "$PYTHON_BIN" ]; then PYTHON_BIN=python3; fi
if [ -z "$(printenv CUDA_VISIBLE_DEVICES || true)" ]; then export CUDA_VISIBLE_DEVICES=1; fi
echo "[Qwen3-TTS] Python: $PYTHON_BIN  GPU: $CUDA_VISIBLE_DEVICES"
exec "$PYTHON_BIN" "$SCRIPT_DIR/batch_tts_3.py" "$@"
