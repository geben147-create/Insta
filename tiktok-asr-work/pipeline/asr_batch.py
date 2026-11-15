#!/usr/bin/env python3
"""Batch ASR for all todo videos in inventory.json.
 ffmpeg -> 16k mono wav (on drive wav/), language ID (faster-whisper turbo, 60s mid sample),
 zh -> FunASR (vad+paraformer+punc+fa-zh), other -> whisper turbo full transcription.
 out: out/{id}.asr.json {lang, lang_p, model, asr_s, sentences:[{s,e,zh}]}   (zh field = source-language text)
usage: CUDA_VISIBLE_DEVICES=1 venv/bin/python -I asr_batch.py [--only ID,ID] [--limit N]
"""
import sys, os, re, json, time, glob, subprocess, tempfile
import numpy as np, soundfile as sf
from funasr import AutoModel
from faster_whisper import WhisperModel

ROOT = os.path.expanduser("~/ai-work/asr_20261115")
WAVDIR = "/run/media/yh/새 볼륨/틱톡/wav"
INV = json.load(open(ROOT + "/inventory.json", encoding="utf-8"))
only = None; limit = 10**9
for i, a in enumerate(sys.argv):
    if a == "--only": only = set(sys.argv[i + 1].split(","))
    if a == "--limit": limit = int(sys.argv[i + 1])
todo = [v for v in INV if not v["done"] and v["dur_s"] > 0 and (only is None or v["id"] in only)]
todo = [v for v in todo if not os.path.exists(f"{ROOT}/out/{v['id']}.asr.json")][:limit]
print("todo", len(todo), flush=True)

def snap(n): return glob.glob(os.path.expanduser(f"~/.cache/huggingface/hub/models--funasr--{n}/snapshots/*"))[0]
kw = dict(device="cuda:0", disable_update=True, log_level="ERROR")
asr = AutoModel(model=snap("paraformer-zh"), vad_model=snap("fsmn-vad"), **kw)
punc = AutoModel(model=snap("ct-punc"), **kw)
fa = AutoModel(model=snap("fa-zh"), **kw)
wh = WhisperModel(glob.glob(os.path.expanduser("~/.cache/huggingface/hub/models--deepdml--faster-whisper-large-v3-turbo-ct2/snapshots/*"))[0],
                  device="cuda", compute_type="float16")
PUN = "，。？！、,.?!；;：:"; MAXC, MINC = 22, 6
tmp = tempfile.mkdtemp(dir=os.environ.get("TMPDIR"))

def funasr_cues(wav, audio):
    res = asr.generate(input=wav, batch_size_s=300, sentence_timestamp=True)[0]
    segs = res.get("sentence_info") or [{"start": 0, "end": int(len(audio) / 16), "text": res["text"]}]
    sents = []
    for g in segs:
        raw = re.sub(f"[{PUN}\\s]", "", g["text"])
        if not raw: continue
        a, b = int(g["start"]), int(g["end"])
        p = punc.generate(input=raw)[0]["text"]
        chars = [c for c in p if c not in PUN and not c.isspace()]
        ts = None
        try:
            wf, tf = os.path.join(tmp, "s.wav"), os.path.join(tmp, "s.txt")
            sf.write(wf, audio[a * 16:b * 16], 16000)
            open(tf, "w", encoding="utf-8").write(" ".join(chars))
            r = fa.generate(input=(wf, tf), data_type=("sound", "text"))[0]
            ts = r.get("timestamp")
            if ts and len(ts) != len(chars): ts = None
        except Exception as e:
            print("  fa fail", e, file=sys.stderr)
        if ts is None:
            n = len(chars); dur = max(b - a, 1)
            ts = [[int(i * dur / n), int((i + 1) * dur / n)] for i in range(n)]
        ts = [[a + x[0], a + x[1]] for x in ts]
        cues, buf, ci, st = [], "", 0, 0
        for ch in p:
            if ch.isspace(): continue
            buf += ch
            if ch not in PUN: ci += 1
            n = ci - st
            if (ch in "。？！?!" or (ch in "，,；;：:、" and n >= MINC) or n >= MAXC) and n > 0:
                cues.append((buf, st, ci - 1)); buf = ""; st = ci
        if buf.strip() and ci > st: cues.append((buf, st, ci - 1))
        elif buf.strip() and cues: cues[-1] = (cues[-1][0] + buf, cues[-1][1], cues[-1][2])
        for txt, i, j in cues:
            if i < len(ts): sents.append({"s": ts[i][0], "e": ts[min(j, len(ts) - 1)][1], "zh": txt.rstrip("，,、；;：:")})
    return sents

def whisper_cues(audio, lang):
    segs, info = wh.transcribe(audio, language=lang, vad_filter=True, beam_size=5, condition_on_previous_text=False)
    out = []
    for s in segs:
        t = s.text.strip()
        if t: out.append({"s": int(s.start * 1000), "e": int(s.end * 1000), "zh": t})
    return out

def lang_id(audio, dur):
    # 3 x 30s samples at 25/50/75%; take highest-confidence non-music result
    votes = {}
    for f in (0.25, 0.5, 0.75):
        a = int(len(audio) * f); seg = audio[a:a + 16000 * 30]
        if len(seg) < 16000 * 5: seg = audio[:16000 * 30]
        l, p, _ = wh.detect_language(seg)
        votes[l] = votes.get(l, 0) + p
    l = max(votes, key=votes.get)
    return l, round(votes[l] / 3, 2)

for n, v in enumerate(todo, 1):
    vid = v["id"]; t0 = time.time()
    try:
        wav = f"{WAVDIR}/{vid}.wav"
        if not os.path.exists(wav):
            subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", v["path"], "-vn", "-ac", "1", "-ar", "16000", "-c:a", "pcm_s16le", wav], check=True, timeout=1800)
        audio, sr = sf.read(wav, dtype="float32")
        lang, lp = lang_id(audio, v["dur_s"])
        if lang in ("zh", "yue"):
            sents = funasr_cues(wav, audio); model = "FunASR fsmn-vad + paraformer-zh + ct-punc + fa-zh"
        else:
            sents = whisper_cues(audio, lang); model = "faster-whisper large-v3-turbo"
        json.dump({"id": vid, "wav": wav, "lang": lang, "lang_p": lp, "model": model, "load_s": 0, "asr_s": round(time.time() - t0, 1),
                   "sentences": sents}, open(f"{ROOT}/out/{vid}.asr.json", "w", encoding="utf-8"), ensure_ascii=False)
        print(f"[{n}/{len(todo)}] {vid} {lang}({lp}) {len(sents)} cues {time.time()-t0:.0f}s dur={v['dur_s']}s", flush=True)
    except Exception as e:
        print(f"[{n}/{len(todo)}] {vid} FAIL {e}", flush=True)
print("ALL_ASR_DONE", flush=True)
