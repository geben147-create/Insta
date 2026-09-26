"""샷별 자막 영역(하단 22%·상단 20%)의 채도 높은 글자색 후보 — 화자 색 확인용."""
import json, sys, cv2, numpy as np
for v in sys.argv[1:]:
    cuts = json.load(open(f'videos/{v}/cuts.json'))
    cap = cv2.VideoCapture(f'videos/{v}/src.mp4'); out = []
    for s in cuts['shots']:
        cap.set(cv2.CAP_PROP_POS_MSEC, (s['t_in'] + s['t_out']) / 2 * 1000); ok, fr = cap.read()
        if not ok: out.append({'idx': s['idx'], 'bottom': [], 'top': []}); continue
        h = fr.shape[0]; res = {'idx': s['idx']}
        for name, (a, b) in {'bottom': (0.76, 0.99), 'top': (0.0, 0.2)}.items():
            crop = fr[int(h * a):int(h * b), :]; hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
            m = (hsv[..., 1] > 130) & (hsv[..., 2] > 130); px = crop[m]
            cols = []
            if len(px) > 400:
                q = (px // 32) * 32 + 16; keys, cnt = np.unique(q.reshape(-1, 3), axis=0, return_counts=True)
                for i in np.argsort(-cnt)[:3]:
                    b_, g_, r_ = keys[i]; cols.append({'hex': '#%02x%02x%02x' % (r_, g_, b_), 'px': int(cnt[i])})
            res[name] = cols
        out.append(res)
    json.dump(out, open(f'videos/{v}/cap_colors.json', 'w'), indent=0)
    print(v, 'cap colors done')
