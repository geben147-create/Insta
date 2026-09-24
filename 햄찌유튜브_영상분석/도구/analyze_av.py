"""오디오(받아쓰기·라우드니스·온셋·BPM) + 화면 글자(OCR 위치) + 샷별 대표색 분석.
사용: python tools/analyze_av.py v1 v2 v3"""
import sys, os, json, subprocess, wave
import numpy as np, cv2
from scipy.signal import find_peaks

FLAGS = getattr(subprocess, 'CREATE_NO_WINDOW', 0)
def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL, creationflags=FLAGS, timeout=600)

def load_wav(path):
    with wave.open(path) as w:
        sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return sr, x

def audio_features(vdir, cuts_t):
    wav = os.path.join(vdir, 'audio_22k.wav')
    run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(vdir, 'src.mp4'), '-vn', '-ac', '1', '-ar', '22050', wav])
    run(['ffmpeg', '-y', '-v', 'error', '-i', os.path.join(vdir, 'src.mp4'), '-lavfi',
         'showspectrumpic=s=1600x360:legend=0:color=intensity:scale=log:fscale=log', os.path.join(vdir, 'spectrogram.png')])
    sr, x = load_wav(wav)
    hop, win = 512, 2048
    frames = 1 + (len(x) - win) // hop
    idx = np.arange(win)[None, :] + hop * np.arange(frames)[:, None]
    seg = x[idx] * np.hanning(win)[None, :]
    mag = np.abs(np.fft.rfft(seg, axis=1))
    t = (np.arange(frames) * hop + win / 2) / sr
    rms_db = 20 * np.log10(np.sqrt((x[idx] ** 2).mean(axis=1)) + 1e-9)
    flux = np.maximum(np.diff(np.log1p(mag), axis=0), 0).sum(axis=1); flux = np.concatenate([[0], flux])
    flux_n = (flux - flux.mean()) / (flux.std() + 1e-9)
    peaks, _ = find_peaks(flux_n, height=1.5, distance=int(0.09 * sr / hop))
    onsets = t[peaks]
    # 템포: 온셋 포락선 자기상관 (60~180 BPM)
    env = flux_n - flux_n.mean(); ac = np.correlate(env, env, 'full')[len(env) - 1:]
    lag_min, lag_max = int(60 / 180 * sr / hop), int(60 / 60 * sr / hop)
    lag = lag_min + int(np.argmax(ac[lag_min:lag_max])); bpm = 60 * sr / hop / lag
    freqs = np.fft.rfftfreq(win, 1 / sr)
    centroid = (mag * freqs[None, :]).sum(axis=1) / (mag.sum(axis=1) + 1e-9)
    silence = rms_db < -45
    near = [float(np.min(np.abs(onsets - c))) if len(onsets) else 9 for c in cuts_t]
    sync = sum(1 for d in near if d <= 0.08) / max(len(cuts_t), 1)
    step = max(1, int(0.05 * sr / hop))  # 50ms 간격으로 축약 저장
    return {'bpm_est': round(bpm, 1), 'onsets': [round(float(o), 3) for o in onsets],
            'cut_onset_sync_pct': round(sync * 100, 1), 'cut_nearest_onset_s': [round(d, 3) for d in near],
            'curve_t': [round(float(v), 3) for v in t[::step]], 'rms_db': [round(float(v), 1) for v in rms_db[::step]],
            'centroid_hz': [int(v) for v in centroid[::step]], 'silence_ratio': round(float(silence.mean()), 3),
            'loud_peak_db': round(float(rms_db.max()), 1), 'loud_median_db': round(float(np.median(rms_db)), 1)}

def loudness(vdir):
    r = run(['ffmpeg', '-v', 'info', '-i', os.path.join(vdir, 'src.mp4'), '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    tail = r.stderr[r.stderr.rfind('Summary:'):]
    out = {}
    for key, tag in [('I_LUFS', 'I:'), ('LRA_LU', 'LRA:'), ('TruePeak_dBFS', 'Peak:')]:
        pos = tail.find(tag)
        if pos >= 0:
            try: out[key] = float(tail[pos + len(tag):].split()[0])
            except ValueError: pass
    return out

def transcribe(vdir, model):
    segs, info = model.transcribe(os.path.join(vdir, 'audio_22k.wav'), language='ko', word_timestamps=True, vad_filter=False, beam_size=5)
    out = []
    for s in segs:
        out.append({'start': round(s.start, 2), 'end': round(s.end, 2), 'text': s.text.strip(), 'no_speech_prob': round(s.no_speech_prob, 2),
                    'words': [{'s': round(w.start, 2), 'e': round(w.end, 2), 'w': w.word} for w in (s.words or [])]})
    return {'language_prob': round(info.language_probability, 2), 'segments': out}

def ocr_and_palette(vdir, shots, reader):
    res = []
    for s in shots:
        p = os.path.join(vdir, 'shots', f"s{s['idx']:02d}_m.jpg")
        img = cv2.imread(p); h, w = img.shape[:2]
        boxes = []
        for (bb, text, conf) in reader.readtext(p):
            if conf < 0.35 or len(text.strip()) < 1: continue
            xs, ys = [q[0] for q in bb], [q[1] for q in bb]
            boxes.append({'x': round(min(xs) / w, 3), 'y': round(min(ys) / h, 3), 'w': round((max(xs) - min(xs)) / w, 3),
                          'h': round((max(ys) - min(ys)) / h, 3), 'text': text, 'conf': round(float(conf), 2)})
        Z = cv2.resize(img, (160, 90)).reshape(-1, 3).astype(np.float32)
        _, lab, cen = cv2.kmeans(Z, 5, None, (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0), 3, cv2.KMEANS_PP_CENTERS)
        cnt = np.bincount(lab.flatten(), minlength=5); order = np.argsort(-cnt)
        pal = [{'hex': '#%02x%02x%02x' % tuple(int(c) for c in cen[i][::-1]), 'pct': round(float(cnt[i] / cnt.sum() * 100), 1)} for i in order]
        res.append({'idx': s['idx'], 'text_boxes': boxes, 'palette': pal})
    return res

if __name__ == '__main__':
    # faster-whisper(CTranslate2)와 easyocr(torch)는 cuDNN 충돌 → 모드별 별도 프로세스로 실행
    mode, vids = sys.argv[1], sys.argv[2:]
    if mode == 'audio':
        from faster_whisper import WhisperModel
        model = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=8)
    else:
        import easyocr
        reader = easyocr.Reader(['ko', 'en'], gpu=True, verbose=False)
    for v in vids:
        vdir = os.path.join('videos', v)
        cuts = json.load(open(os.path.join(vdir, 'cuts.json'), encoding='utf-8'))
        if mode == 'audio':
            feats = audio_features(vdir, [s['t_in'] for s in cuts['shots'][1:]])
            feats['ebur128'] = loudness(vdir)
            json.dump(feats, open(os.path.join(vdir, 'audio.json'), 'w', encoding='utf-8'), ensure_ascii=False)
            json.dump(transcribe(vdir, model), open(os.path.join(vdir, 'whisper.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(v, 'audio done | bpm', feats['bpm_est'], '| cut-onset sync', feats['cut_onset_sync_pct'], '% |', feats['ebur128'], flush=True)
        else:
            json.dump(ocr_and_palette(vdir, cuts['shots'], reader), open(os.path.join(vdir, 'ocr_palette.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            print(v, 'ocr done', flush=True)
