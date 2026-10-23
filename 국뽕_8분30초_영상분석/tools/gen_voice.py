"""Qwen3-TTS 보이스클론으로 102컷 음성을 만든다. 이미 있는 파일은 건너뛴다."""
import os
import sys
import time

os.environ["HF_HOME"] = r"C:\Users\llorr\.cache\huggingface"

import soundfile as sf
import torch
from qwen_tts import Qwen3TTSModel

from common import parse_rows

W = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL = r"C:\Users\llorr\qwen3tts_models\Qwen3-TTS-12Hz-1.7B-Base"
REF_AUDIO = os.path.join(W, "voice", "ref.wav")
REF_TEXT = (
    "이 화면은 투자 정보가 아닌 시뮬레이션입니다. "
    "테스트 가격은 100에서 시작해 거래량과 함께 128까지 움직입니다. "
    "여섯 번째 캔들에서 거래량이 최고치를 찍고, 흐름은 선 그래프로 이어집니다. "
    "숫자보다 중요한 건 변화가 만들어진 순간입니다."
)
OUT = os.path.join(W, "voice", "raw")
os.makedirs(OUT, exist_ok=True)

only = [int(x) for x in sys.argv[1:]]  # 번호를 주면 그 컷만 (덮어씀)

rows = parse_rows()
model = Qwen3TTSModel.from_pretrained(
    MODEL, device_map="cuda:0", dtype=torch.bfloat16, attn_implementation="sdpa"
)
prompt = model.create_voice_clone_prompt(ref_audio=REF_AUDIO, ref_text=REF_TEXT)

BATCH = int(os.environ.get("BATCH", "1"))


def out_path(no):
    return os.path.join(OUT, f"{no:03d}.wav")


todo = [
    r
    for r in rows
    if (r["no"] in only) or (not only and not os.path.exists(out_path(r["no"])))
]

t0 = time.time()
for i in range(0, len(todo), BATCH):
    chunk = todo[i : i + BATCH]
    t1 = time.time()
    wavs, sr = model.generate_voice_clone(
        text=[r["text"] for r in chunk],
        language=["Korean"] * len(chunk),
        voice_clone_prompt=prompt * len(chunk),
    )
    for r, w in zip(chunk, wavs):
        sf.write(out_path(r["no"]), w, sr)
        print(f"{r['no']:03d} {len(w) / sr:5.2f}s chars={len(r['text'])}", flush=True)
    print(f"-- batch {len(chunk)} in {time.time() - t1:4.1f}s", flush=True)
print(f"DONE total={time.time() - t0:.0f}s", flush=True)
