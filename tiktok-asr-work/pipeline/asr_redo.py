#!/usr/bin/env python3
"""Re-run ASR with forced Chinese (FunASR) for ids with doubtful language ID. Backs up old asr.json -> out/{id}.asr.prev.json
usage: CUDA_VISIBLE_DEVICES=1 venv/bin/python -I asr_redo.py ID,ID,...
"""
import sys, os, json, glob, re, time, shutil
sys.argv_ids = sys.argv[1].split(",")
ROOT = os.path.expanduser("~/ai-work/asr_20261115")
import soundfile as sf
from funasr import AutoModel
def snap(n): return glob.glob(os.path.expanduser(f"~/.cache/huggingface/hub/models--funasr--{n}/snapshots/*"))[0]
kw = dict(device="cuda:0", disable_update=True, log_level="ERROR")
asr = AutoModel(model=snap("paraformer-zh"), vad_model=snap("fsmn-vad"), **kw)
punc = AutoModel(model=snap("ct-punc"), **kw); fa = AutoModel(model=snap("fa-zh"), **kw)
src = open(ROOT + "/asr_batch.py", encoding="utf-8").read()
# reuse funasr_cues from asr_batch.py without loading its models/main loop
import tempfile
ns = {"tempfile": tempfile, "time": time, "json": json, "re": re, "os": os, "sf": sf, "sys": sys, "asr": asr, "punc": punc, "fa": fa, "tmp": __import__("tempfile").mkdtemp(dir=os.environ.get("TMPDIR"))}
body = src[src.index('PUN = "'):src.index("def whisper_cues")]
exec(body, ns)
for vid in sys.argv_ids:
    t0 = time.time(); p = f"{ROOT}/out/{vid}.asr.json"
    A = json.load(open(p, encoding="utf-8")); wav = A["wav"]
    if "재인식" in A.get("model", ""): continue
    audio, sr = sf.read(wav, dtype="float32")
    try: sents = ns["funasr_cues"](wav, audio)
    except Exception as e: print("noresult", vid, e, flush=True); sents = []
    shutil.copy2(p, f"{ROOT}/out/{vid}.asr.prev.json")
    A.update({"lang": "zh", "lang_p": A.get("lang_p", 0), "model": "FunASR fsmn-vad + paraformer-zh + ct-punc + fa-zh (중국어 재인식)", "sentences": sents, "asr_s": round(time.time() - t0, 1)})
    json.dump(A, open(p, "w", encoding="utf-8"), ensure_ascii=False)
    print(vid, len(sents), "cues", sents[0]["zh"][:40] if sents else "", flush=True)
