import os

# Z: 드라이브(HF_HOME 기본값)는 여유 공간이 0이라 C:에 받는다.
# 윈도우는 심볼릭 링크 권한이 없어서 캐시 방식 대신 local_dir로 받는다.
os.environ["HF_HOME"] = r"C:\Users\llorr\.cache\huggingface"
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

from huggingface_hub import snapshot_download

DEST = r"C:\Users\llorr\qwen3tts_models\Qwen3-TTS-12Hz-1.7B-Base"
path = snapshot_download("Qwen/Qwen3-TTS-12Hz-1.7B-Base", local_dir=DEST)
print("MODEL_PATH", path)
