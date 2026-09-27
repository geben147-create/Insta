"""폰 스크린샷(유튜브 앱 화면) → 원본 영상의 컷 번호·시각·같은 원본 줌 체인 찾기.
- 스크린샷 위쪽(영상 영역)과 컷별 시작·중간·끝 프레임을 SIFT 특징점으로 맞춰 RANSAC 인라이어가 가장 많은 컷을 고름
- 유튜브 UI(버튼·미니 화면)는 원본 프레임에 없으므로 자연히 매칭에서 빠짐
사용(shotlib 폴더에서): python ../tools/match_screens.py B01 screens/B01/01.jpg=cYQeP3zFY4s screens/B01/02.jpg=cYQeP3zFY4s ...
출력: batches/B01_match.json"""
import json, os, sys
import cv2
import numpy as np

sift = cv2.SIFT_create(3000)
bf = cv2.BFMatcher(cv2.NORM_L2)


def feat(img, maxside=960):
    h, w = img.shape[:2]
    s = maxside / max(h, w)
    g = cv2.cvtColor(cv2.resize(img, (int(w * s), int(h * s)), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    return sift.detectAndCompute(g, None)


def inliers(fa, fb):
    (ka, da), (kb, db) = fa, fb
    if da is None or db is None or len(ka) < 10 or len(kb) < 10:
        return 0
    good = [m for m, n in (p for p in bf.knnMatch(da, db, k=2) if len(p) == 2) if m.distance < 0.75 * n.distance]
    if len(good) < 8:
        return 0
    pa = np.float32([ka[m.queryIdx].pt for m in good]); pb = np.float32([kb[m.trainIdx].pt for m in good])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=5.0)
    return int(inl.sum()) if M is not None else 0


def fmt(t):
    return f"{int(t // 60)}:{t % 60:05.2f}"


def main(batch, pairs):
    cache, out = {}, []
    for i, pair in enumerate(pairs, 1):
        path, vid = pair.split("=")
        if vid not in cache:  # 영상별 컷 프레임 특징점 미리 계산
            cuts = json.load(open(f"videos/{vid}/cuts.json", encoding="utf-8"))["shots"]
            zg_p = f"videos/{vid}/zoom_groups.json"
            zg = json.load(open(zg_p, encoding="utf-8")) if os.path.exists(zg_p) else {}
            fr = {(s["idx"], t): feat(cv2.imread(f"videos/{vid}/shots/s{s['idx']:02d}_{t}.jpg")) for s in cuts for t in "amz"}
            cache[vid] = (cuts, zg, fr)
        cuts, zg, fr = cache[vid]
        sc = cv2.imread(path)
        H = sc.shape[0]
        crop = sc[int(H * 0.035):int(H * 0.70)]  # 상태바 아래 ~ 영상/레이아웃 영역
        fs = feat(crop)
        best = max(((inliers(fs, f), k) for k, f in fr.items()), key=lambda x: x[0])
        (n, where), score = best[1], best[0]
        shot = next(s for s in cuts if s["idx"] == n)
        m = zg.get("shot_map", {}).get(str(n))
        chain = None
        if m:
            for g in zg.get("groups", []):
                for ch in g["chains"]:
                    if ch["source"] == m["source"] and any(x["n"] == n for x in ch["shots"]):
                        chain = [{"n": x["n"], "zoom": x["zoom"], "dur": x["dur"]} for x in ch["shots"]]
        out.append({"no": i, "file": path, "video": vid, "shot": n, "t_in": shot["t_in"], "t_out": shot["t_out"], "dur": shot["dur"],
                    "time": f"{fmt(shot['t_in'])}–{fmt(shot['t_out'])}", "matched_frame": {"a": "시작", "m": "중간", "z": "끝"}[where],
                    "inliers": score, "reuse": m, "chain": chain})
        print(f"{i:02d} {os.path.basename(path)} -> {vid} #{n:03d} {fmt(shot['t_in'])}-{fmt(shot['t_out'])} ({where}) inliers={score}"
              + (f" | chain src #{m['source']} x{m['zoom']}" if m else ""), flush=True)
    os.makedirs("batches", exist_ok=True)
    json.dump(out, open(f"batches/{batch}_match.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2:])
