"""대사 구간별 목소리 기본주파수(F0) 추정 — TTS 피치 설정용 (YIN 간이 구현)."""
import json, wave, sys
import numpy as np

def load(path):
    with wave.open(path) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return sr, x

def yin_f0(frame, sr, fmin=80, fmax=900, thr=0.15):
    n = len(frame); maxlag = int(sr / fmin); minlag = int(sr / fmax)
    d = np.array([np.sum((frame[:n - maxlag] - frame[l:n - maxlag + l]) ** 2) for l in range(maxlag)])
    cmnd = np.ones_like(d); cs = np.cumsum(d[1:]); cmnd[1:] = d[1:] * np.arange(1, maxlag) / (cs + 1e-12)
    for l in range(minlag, maxlag):
        if cmnd[l] < thr:
            while l + 1 < maxlag and cmnd[l + 1] < cmnd[l]: l += 1
            return sr / l
    return None

for v in sys.argv[1:]:
    sr, x = load(f'videos/{v}/audio_22k.wav')
    segs = json.load(open(f'videos/{v}/whisper.json', encoding='utf-8'))['segments']
    out = []
    for i, s in enumerate(segs):
        a, b = int(s['start'] * sr), int(s['end'] * sr)
        f0s = []
        for p in range(a, max(a, b - 1024), 512):
            fr = x[p:p + 1024]
            if np.sqrt(np.mean(fr ** 2)) < 0.01: continue
            f = yin_f0(fr, sr)
            if f: f0s.append(f)
        med = float(np.median(f0s)) if len(f0s) >= 3 else None
        out.append({'i': i, 'start': s['start'], 'end': s['end'], 'f0_median': round(med) if med else None, 'n': len(f0s),
                    'semitones_vs_210hz': round(12 * np.log2(med / 210), 1) if med else None})
        print(v, f"[{s['start']:5.2f}-{s['end']:5.2f}] F0={round(med) if med else '-':>4}Hz  {s['text'][:24]}")
    json.dump(out, open(f'videos/{v}/pitch.json', 'w', encoding='utf-8'), ensure_ascii=False)
