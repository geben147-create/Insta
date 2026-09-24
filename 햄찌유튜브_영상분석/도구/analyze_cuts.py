"""프레임 단위 컷(장면 전환) 검출 + 샷별 캡처/콘택트시트 생성.
사용: python tools/analyze_cuts.py videos/v1"""
import sys, json, os
import cv2, numpy as np
from PIL import Image, ImageDraw, ImageFont

vdir = sys.argv[1]
src = os.path.join(vdir, 'src.mp4')
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
hist_d, mad, bright, sat, prev_h, prev_g = [], [], [], [], None, None
while True:
    ok, fr = cap.read()
    if not ok:
        break
    small = cv2.resize(fr, (320, 180), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(small, cv2.COLOR_BGR2HSV)
    h = cv2.calcHist([hsv], [0, 1, 2], None, [16, 8, 8], [0, 180, 0, 256, 0, 256])
    cv2.normalize(h, h)
    g = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY).astype(np.float32)
    hist_d.append(0.0 if prev_h is None else float(cv2.compareHist(prev_h, h, cv2.HISTCMP_BHATTACHARYYA)))
    mad.append(0.0 if prev_g is None else float(np.mean(np.abs(g - prev_g))))
    bright.append(float(g.mean()))
    sat.append(float(hsv[..., 1].mean()))
    prev_h, prev_g = h, g
cap.release()
n = len(hist_d)
H, M = np.array(hist_d), np.array(mad)
# 적응형 임계값: 전체 분포 대비 급격한 스파이크만 컷으로 인정
score = H / (H.mean() + 1e-6) * 0.5 + M / (M.mean() + 1e-6) * 0.5
thr = max(float(np.percentile(score, 90)) * 2.2, 4.0)
cuts = []
for i in range(1, n):
    win = score[max(1, i - 4): i + 5]
    if score[i] >= thr and score[i] == win.max() and H[i] > 0.18:
        if not cuts or i - cuts[-1] >= 6:  # 0.2초 이내 중복 방지
            cuts.append(i)
bounds = [0] + cuts + [n]
shots = []
for k in range(len(bounds) - 1):
    a, b = bounds[k], bounds[k + 1]
    shots.append({'idx': k + 1, 'f_in': a, 'f_out': b - 1, 't_in': round(a / fps, 3), 't_out': round(b / fps, 3),
                  'dur': round((b - a) / fps, 3), 'cut_score': round(float(score[a]), 2) if a else None,
                  'bright_mean': round(float(np.mean(bright[a:b])), 1), 'motion_mean': round(float(np.mean(M[a + 1:b])) if b - a > 1 else 0, 2)})
json.dump({'fps': fps, 'frames': n, 'duration': round(n / fps, 3), 'threshold': round(thr, 2), 'cuts_f': cuts,
           'shots': shots, 'metrics': {'hist': [round(x, 4) for x in hist_d], 'mad': [round(x, 3) for x in mad],
                                       'bright': [round(x, 1) for x in bright], 'sat': [round(x, 1) for x in sat],
                                       'score': [round(float(x), 3) for x in score]}},
          open(os.path.join(vdir, 'cuts.json'), 'w', encoding='utf-8'), indent=1)

# 샷별 캡처: 시작(+2f) / 중간 / 끝(-2f)
os.makedirs(os.path.join(vdir, 'shots'), exist_ok=True)
cap = cv2.VideoCapture(src)
def grab(fi):
    cap.set(cv2.CAP_PROP_POS_FRAMES, fi)
    ok, fr = cap.read()
    return cv2.cvtColor(fr, cv2.COLOR_BGR2RGB) if ok else None
for s in shots:
    a, b = s['f_in'], s['f_out']
    picks = {'a': min(a + 2, b), 'm': (a + b) // 2, 'z': max(b - 2, a)}
    for tag, fi in picks.items():
        im = Image.fromarray(grab(fi))
        im.resize((960, 540), Image.LANCZOS).save(os.path.join(vdir, 'shots', f"s{s['idx']:02d}_{tag}.jpg"), quality=86)
cap.release()

# 콘택트시트 (검토용): 6샷/장, 행 = 샷(시작·중간·끝)
try:
    font = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 22)
except OSError:
    font = ImageFont.load_default()
TW, TH, LH = 400, 225, 30
os.makedirs(os.path.join(vdir, 'sheets'), exist_ok=True)
for page in range(0, len(shots), 6):
    grp = shots[page:page + 6]
    sheet = Image.new('RGB', (TW * 3, len(grp) * (TH + LH)), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    for r, s in enumerate(grp):
        y = r * (TH + LH)
        d.text((8, y + 3), f"#{s['idx']:02d}  {s['t_in']:.2f}s → {s['t_out']:.2f}s  ({s['dur']:.2f}s)   [시작 | 중간 | 끝]", fill=(255, 220, 0), font=font)
        for c, tag in enumerate('amz'):
            im = Image.open(os.path.join(vdir, 'shots', f"s{s['idx']:02d}_{tag}.jpg")).resize((TW - 4, TH - 4))
            sheet.paste(im, (c * TW + 2, y + LH + 2))
    sheet.save(os.path.join(vdir, 'sheets', f"sheet_{page // 6 + 1:02d}.jpg"), quality=85)
print(f"{vdir}: fps={fps} frames={n} thr={thr:.2f} shots={len(shots)}")
for s in shots:
    print(f"  #{s['idx']:02d} {s['t_in']:6.2f}–{s['t_out']:6.2f}  {s['dur']:5.2f}s  score={s['cut_score']}  bright={s['bright_mean']} motion={s['motion_mean']}")
