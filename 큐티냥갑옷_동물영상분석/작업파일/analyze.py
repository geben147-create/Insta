"""Shot/transition + audio analysis for each downloaded reel.

Outputs per video dir:
  shots.json   - cut list, per-shot stats, transition guesses, audio envelope/onsets/tempo
  frames/      - shot first/mid/last frames (+ 0.5s grid for top videos)
"""
import json, os, subprocess, sys, wave
import numpy as np
import cv2

TOP = set(sys.argv[1].split(',')) if len(sys.argv) > 1 else set()
W = 540  # frame export width


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, stdin=subprocess.DEVNULL,
                          timeout=300, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))


def frame_stats(path):
    cap = cv2.VideoCapture(path)
    fps = cap.get(cv2.CAP_PROP_FPS)
    prev_hist, prev_small, prev_gray = None, None, None
    rows = []
    idx = 0
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        small = cv2.resize(fr, (160, int(160 * fr.shape[0] / fr.shape[1])))
        hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
        hist = cv2.calcHist([hsv], [0, 1, 2], None, [16, 8, 8], [0, 180, 0, 256, 0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
        luma = float(gray.mean())
        sat = float(hsv[..., 1].mean())
        if prev_hist is None:
            hdiff, pdiff, flow_mag, flow_dx, flow_dy = 0.0, 0.0, 0.0, 0.0, 0.0
        else:
            hdiff = float(1 - cv2.compareHist(prev_hist, hist, cv2.HISTCMP_CORREL))
            pdiff = float(np.abs(small.astype(np.int16) - prev_small.astype(np.int16)).mean())
            flow = cv2.calcOpticalFlowFarneback(prev_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            flow_dx = float(np.median(flow[..., 0]))
            flow_dy = float(np.median(flow[..., 1]))
            flow_mag = float(np.linalg.norm(flow, axis=2).mean())
        rows.append((idx, idx / fps, hdiff, pdiff, luma, sat, flow_mag, flow_dx, flow_dy))
        prev_hist, prev_small, prev_gray = hist, small, gray
        idx += 1
    cap.release()
    return fps, np.array(rows)


def detect_cuts(st, fps):
    h, p = st[:, 2], st[:, 3]
    cuts = []
    for i in range(1, len(st)):
        lo, hi = max(1, i - 6), min(len(st), i + 7)
        neigh = np.delete(p[lo:hi], i - lo)
        base = np.median(neigh) if len(neigh) else 0
        is_peak = p[i] == p[lo:hi].max()
        if is_peak and ((h[i] > 0.35 and p[i] > 18) or (p[i] > 30 and p[i] > 3 * base + 8)):
            if not cuts or i - cuts[-1] > fps * 0.25:
                cuts.append(i)
    return cuts


def guess_transition(st, i, fps):
    """Classify the boundary at frame i: hard cut vs dissolve / flash / fade / whip."""
    w = int(fps * 0.4)
    seg = st[max(0, i - w):min(len(st), i + w)]
    luma = seg[:, 4]
    diffs = seg[:, 3]
    flow = seg[:, 6]
    if luma.max() > 200 and luma.max() - np.median(st[:, 4]) > 60:
        return 'flash/white-dip'
    if luma.min() < 20 and np.median(st[:, 4]) - luma.min() > 40:
        return 'dip-to-black'
    active = (diffs > 6).sum()
    if active >= int(fps * 0.3) and st[i, 3] < 40:
        return 'dissolve/morph (multi-frame)'
    if flow.max() > 12:
        return 'whip/motion-blur cut'
    return 'hard cut'


def camera_motion(seg):
    if len(seg) < 2:
        return 'static'
    mag = np.median(seg[:, 6])
    dx, dy = np.median(seg[:, 7]), np.median(seg[:, 8])
    lum_trend = seg[-1, 4] - seg[0, 4]
    if mag < 0.35:
        desc = 'locked-off / near static'
    elif abs(dx) > 2 * abs(dy) and abs(dx) > 0.3:
        desc = 'pan/track ' + ('left->content moves right' if dx > 0 else 'right->content moves left')
    elif abs(dy) > 2 * abs(dx) and abs(dy) > 0.3:
        desc = 'tilt/pedestal ' + ('content moves down' if dy > 0 else 'content moves up')
    else:
        desc = 'handheld/push or subject motion'
    return f'{desc} (flow {mag:.2f}px/f)'


def export_frame(video, t, out):
    run(['ffmpeg', '-y', '-v', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1',
         '-vf', f'scale={W}:-2', '-q:v', '3', out])


def audio_analysis(video, d):
    wav = os.path.join(d, 'audio.wav')
    run(['ffmpeg', '-y', '-v', 'error', '-i', video, '-vn', '-ac', '1', '-ar', '16000', wav])
    if not os.path.exists(wav):
        return {'has_audio': False}
    with wave.open(wav) as wf:
        sr = wf.getframerate()
        x = np.frombuffer(wf.readframes(wf.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    hop = int(sr * 0.05)
    n = len(x) // hop
    rms = np.array([np.sqrt(np.mean(x[i * hop:(i + 1) * hop] ** 2) + 1e-12) for i in range(n)])
    db = 20 * np.log10(rms + 1e-9)
    # spectral flux onsets
    win = 1024
    hop2 = 256
    frames = [x[i:i + win] * np.hanning(win) for i in range(0, len(x) - win, hop2)]
    spec = np.abs(np.fft.rfft(np.array(frames), axis=1)) if frames else np.zeros((1, 1))
    flux = np.maximum(0, np.diff(spec, axis=0)).sum(axis=1)
    flux = flux / (flux.max() + 1e-9)
    thr = np.median(flux) + 2.5 * np.std(flux)
    onsets = []
    for i in range(1, len(flux) - 1):
        if flux[i] > thr and flux[i] >= flux[i - 1] and flux[i] >= flux[i + 1]:
            t = (i + 1) * hop2 / sr
            if not onsets or t - onsets[-1] > 0.12:
                onsets.append(round(t, 2))
    # tempo via autocorrelation of flux
    tempo = None
    if len(flux) > 200:
        fr = sr / hop2
        ac = np.correlate(flux - flux.mean(), flux - flux.mean(), 'full')[len(flux) - 1:]
        lo, hi = int(fr * 60 / 180), int(fr * 60 / 70)
        if hi < len(ac):
            lag = lo + int(np.argmax(ac[lo:hi]))
            tempo = round(60 * fr / lag, 1)
    centroid = float((spec * np.arange(spec.shape[1])).sum() / (spec.sum() + 1e-9) * sr / win)
    env = [round(float(v), 1) for v in db[::2]]  # 100 ms resolution
    silent = float((db < -45).mean())
    return {'has_audio': True, 'tempo_bpm_est': tempo, 'onsets_s': onsets[:80],
            'rms_db_100ms': env, 'mean_db': round(float(db.mean()), 1),
            'peak_db': round(float(db.max()), 1), 'silence_ratio': round(silent, 2),
            'spectral_centroid_hz': round(centroid)}


def process(d):
    video = os.path.join(d, 'video.mp4')
    fps, st = frame_stats(video)
    dur = len(st) / fps
    cuts = detect_cuts(st, fps)
    bounds = [0] + cuts + [len(st)]
    fdir = os.path.join(d, 'frames')
    os.makedirs(fdir, exist_ok=True)
    for f in os.listdir(fdir):
        os.remove(os.path.join(fdir, f))
    shots = []
    for k in range(len(bounds) - 1):
        a, b = bounds[k], bounds[k + 1]
        seg = st[a:b]
        t0, t1 = a / fps, b / fps
        pts = {'in': t0 + min(0.07, (t1 - t0) / 4), 'mid': (t0 + t1) / 2, 'out': max(t0, t1 - 0.07)}
        files = {}
        for key, t in pts.items():
            fn = f's{k + 1:02d}_{key}_{t:05.2f}.jpg'
            export_frame(video, t, os.path.join(fdir, fn))
            files[key] = 'frames/' + fn
        shots.append({
            'n': k + 1, 'start': round(t0, 2), 'end': round(t1, 2), 'dur': round(t1 - t0, 2),
            'transition_in': 'open' if k == 0 else guess_transition(st, a, fps),
            'camera': camera_motion(seg[1:] if len(seg) > 1 else seg),
            'mean_luma': round(float(seg[:, 4].mean()), 1), 'mean_sat': round(float(seg[:, 5].mean()), 1),
            'frames': files,
        })
    grid = []
    if d in TOP:
        t = 0.25
        while t < dur:
            fn = f'g_{t:05.2f}.jpg'
            export_frame(video, t, os.path.join(fdir, fn))
            grid.append('frames/' + fn)
            t += 0.5
    # soft change curve for dissolve spotting
    curve = [round(float(v), 1) for v in st[:, 3]]
    out = {'id': d, 'fps': round(fps, 3), 'duration': round(dur, 2), 'shot_count': len(shots),
           'avg_shot_len': round(dur / len(shots), 2), 'shots': shots, 'grid_frames': grid,
           'pixel_diff_per_frame': curve, 'audio': audio_analysis(video, d)}
    json.dump(out, open(os.path.join(d, 'shots.json'), 'w'), indent=1)
    print(d, f'{dur:.1f}s', 'shots', len(shots), 'cuts', [round(c / fps, 2) for c in cuts],
          'tempo', out['audio'].get('tempo_bpm_est'))


if __name__ == '__main__':
    for d in sorted(x for x in os.listdir('.') if x.startswith('v') and os.path.isdir(x)):
        process(d)
