"""같은 원본을 확대(디지털 줌)해 여러 컷처럼 쓴 경우 찾기 + 컷 안 줌(푸시인) 측정.
- 컷 중간 프레임끼리 SIFT 특징점을 맞추고, 닮음 변환(확대·이동)이 성립하면 '같은 세팅(같은 원본 이미지)'으로 묶는다(group)
- 묶음 안에서 시간상 붙어 있는 컷(사이에 다른 컷 1개까지 허용)은 '줌 체인'(chain) = 영상 1개를 잘라 쓴 구간
- 체인마다 가장 넓은 컷을 원본(source)으로, 나머지 컷의 확대 배율·중심(원본 기준 0~1 좌표)을 계산
사용: python tools/zoom_groups.py v1 v2 ... → videos/vN/zoom_groups.json"""
import heapq, json, os, re, sys
import cv2
import numpy as np

W, H = 960, 540
CAP_Y = int(H * 0.74)  # 자막 영역 제외 (자막이 같으면 가짜 매칭이 생김)
MAX_CLIP = 8.0  # 영상 1개를 여러 컷이 이어 쓸 때 최대 길이(초) — 한 번 생성하는 영상 길이 기준(대부분 모델 5~10초)
sift = cv2.SIFT_create(nfeatures=2500)
bf = cv2.BFMatcher(cv2.NORM_L2)


def load(path):
    return cv2.resize(cv2.imread(path), (W, H))


def feats(img):
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    g[CAP_Y:, :] = 0
    return sift.detectAndCompute(g, None)


def relate(a, b):
    """a→b 닮음 변환. 반환 (배율, 3x3 행렬, 인라이어 수) 또는 None"""
    (ka, da), (kb, db) = a, b
    if da is None or db is None or len(ka) < 30 or len(kb) < 30:
        return None
    good = [m for m, n in (p for p in bf.knnMatch(da, db, k=2) if len(p) == 2) if m.distance < 0.72 * n.distance]
    if len(good) < 30:
        return None
    pa = np.float32([ka[m.queryIdx].pt for m in good]); pb = np.float32([kb[m.trainIdx].pt for m in good])
    M, inl = cv2.estimateAffinePartial2D(pa, pb, method=cv2.RANSAC, ransacReprojThreshold=4.0, maxIters=4000, confidence=0.995)
    if M is None:
        return None
    n_in = int(inl.sum())
    s = float(np.hypot(M[0, 0], M[1, 0])); rot = abs(float(np.degrees(np.arctan2(M[1, 0], M[0, 0]))))
    if n_in < 30 or n_in / len(good) < 0.45 or rot > 3 or not (0.25 < s < 4.5):
        return None
    return s, np.vstack([M, [0, 0, 1]]), n_in


SCALES = np.geomspace(1.12, 4.2, 22)
SCALES_LOOSE = np.geomspace(1.05, 6.0, 34)  # 분석에 '같은 원본'이라고 적힌 쌍만 넓게 찾음


def tm_relate(v, wide, tight, loose=False, around=None):
    """특징점이 부족한 큰 배율 크롭 보완: tight 컷 화면(자막 위쪽)을 여러 배율로 줄여 wide 컷 화면에서 찾음.
    오탐 방지: 상관 0.9 이상, 배율 4배 이상은 0.97 이상, 두 번째 후보 위치보다 확실히 높아야 함(유일성).
    loose=True(분석에 같은 원본이라고 적힌 쌍): 상관 0.8 이상, 6배까지.
    반환 (배율, wide→tight 3x3 행렬, 상관×100) 또는 None"""
    w2, h2 = W // 2, H // 2
    best = (0.0, None, None, None)
    for fw, ft in (("m", "m"), ("z", "a"), ("a", "z"), ("m", "a"), ("m", "z")):
        base = cv2.cvtColor(cv2.resize(cv2.imread(f"videos/{v}/shots/s{wide:02d}_{fw}.jpg"), (w2, h2)), cv2.COLOR_BGR2GRAY)
        tpl = cv2.cvtColor(cv2.resize(cv2.imread(f"videos/{v}/shots/s{tight:02d}_{ft}.jpg"), (w2, h2)), cv2.COLOR_BGR2GRAY)
        tpl = tpl[: int(h2 * 0.74)]  # 자막 영역 제외
        if tpl.std() < 20 or base.std() < 20:  # 단색·흐린 화면은 아무 데나 맞으므로 비교하지 않음
            continue
        scales = SCALES_LOOSE if loose else SCALES
        if around:  # 분석에 적힌 배율이 있으면 그 근처(±35%)만 찾음 — 엉뚱한 배율의 우연 일치 방지
            scales = [s for s in scales if around / 1.35 <= s <= around * 1.35] or scales
        for s in scales:
            t = cv2.resize(tpl, (max(8, int(w2 / s)), max(8, int(h2 * 0.74 / s))), interpolation=cv2.INTER_AREA)
            r = cv2.matchTemplate(base, t, cv2.TM_CCOEFF_NORMED)
            _, mx, _, loc = cv2.minMaxLoc(r)
            if mx > best[0]:
                best = (mx, s, loc, (r, t.shape))
        if best[0] >= 0.95 or (best[0] < 0.8 and not loose) or (not loose and fw == "a"):  # 확실하거나 가망 없으면 생략
            break
    corr, s, loc, extra = best
    if s is None or corr < (0.8 if loose else 0.9) or (not loose and s >= 4.0 and corr < 0.97):
        return None
    r, (th, tw) = extra
    r = r.copy()
    rad = max(6, min(tw, th) // 3)
    r[max(0, loc[1] - rad):loc[1] + rad + 1, max(0, loc[0] - rad):loc[0] + rad + 1] = -1
    if corr - r.max() < (0.02 if loose else 0.04):  # 비슷하게 맞는 다른 위치가 있으면 우연 일치로 봄
        return None
    x, y = loc[0] * 2, loc[1] * 2  # W,H 좌표로
    T = np.array([[s, 0, -s * x], [0, s, -s * y], [0, 0, 1.0]])
    return float(s), T, int(corr * 100)


IMG_HINT = re.compile(r"(?:crop(?:ped)?\s+(?:of\s+)?(?:the\s+)?|same\s+(?:source|take|frame)\s+as\s+(?:the\s+)?|reuse\s+(?:the\s+)?(?:keyframe\s+)?of\s+)shot\s+(\d+)", re.I)
PREV_HINT = re.compile(r"same\s+(?:frame|take|source)\s+as\s+the\s+previous\s+shot", re.I)
CAM_HINT = re.compile(r"#(\d+)\s*(?:원본|화면|구도|의)")
FACTOR_RE = re.compile(r"(?:about|×)\s*(\d+(?:\.\d+)?)\s*x?|(\d+(?:\.\d+)?)\s*x\b|약\s*(\d+(?:\.\d+)?)\s*배", re.I)


def analysis_hints(v):
    """분석 JSON 에 에이전트가 눈으로 확인해 적어 둔 '같은 원본 크롭' 표시 → {컷: (원본 컷, 적힌 배율 또는 None)}
    img 의 '(Crop of shot N ...)', '(... crop of shot N at about Kx)', 'Same frame as the previous shot' 또는
    cam 의 '#N 원본/화면/구도/의 약 K배' (생성 안 하는 gen=edit 컷만)"""
    p = f"videos/{v}/analysis.json"
    a = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}
    hints = {}
    for s in a.get("shots", []):
        if s.get("gen") != "edit" or s.get("who") in ("black", "card"):
            continue
        img, cam, n = str(s.get("img", "")), str(s.get("cam", "")), s["n"]
        base, after = None, ""
        m = IMG_HINT.search(img)
        if m and int(m.group(1)) != n:
            base, after = int(m.group(1)), img[m.end():].split(")")[0]
        elif PREV_HINT.search(img):
            base = n - 1
        elif "같은 원본" in cam or "크롭" in cam or "크롭" in str(s.get("sz", "")):
            m = next((x for x in CAM_HINT.finditer(cam) if int(x.group(1)) != n), None)
            if m:
                base, after = int(m.group(1)), cam[m.end():]
        if base:
            own = re.search(rf"#{n}\s*[×x]\s*(\d+(?:\.\d+)?)", cam)  # '#28 ×1.85' 처럼 자기 배율이 적힌 경우 우선
            f = FACTOR_RE.search(after)
            fac = float(own.group(1)) if own else (next((float(g) for g in f.groups() if g), None) if f else None)
            hints[n] = (base, fac)
    return hints


def hint_relate(v, F, base, n, fac):
    """표시된 (원본, 크롭 컷) 쌍의 실제 배율·위치 계산: 특징점 → 템플릿 매칭(완화 기준) → 같은 구도 → 적힌 배율(가운데)"""
    r = relate(F[base], F[n])
    if r and r[0] >= 0.95 and (not fac or 1 / 1.35 <= r[0] / fac <= 1.35):
        return r
    t = tm_relate(v, base, n, loose=True, around=fac)
    if t:
        return t
    if not fac or fac <= 1.15:  # '같은 화면'(배율 표시 없음·거의 1배)은 두 화면이 거의 같을 때만 인정
        a, b = load(f"videos/{v}/shots/s{base:02d}_m.jpg"), load(f"videos/{v}/shots/s{n:02d}_m.jpg")
        return (1.0, np.eye(3), 1) if ncc(a, b) >= 0.9 else None
    # 측정 실패 + 배율이 적혀 있음: 그 배율로 화면 가운데를 확대(추정) — 편집에서 위치만 조정
    c = np.array([W / 2, H / 2])
    T = np.array([[fac, 0, c[0] - fac * c[0]], [0, fac, c[1] - fac * c[1]], [0, 0, 1.0]])
    return fac, T, 1


def tm_best(v, a, b):
    """a↔b 양방향 템플릿 매칭 중 확실히 더 잘 맞는 쪽. 반환은 a→b 변환"""
    t1, t2 = tm_relate(v, a, b), tm_relate(v, b, a)
    c1, c2 = (t1[2] if t1 else 0), (t2[2] if t2 else 0)
    if t1 and c1 >= c2 + 2:
        return t1
    if t2 and c2 >= c1 + 2:
        return 1 / t2[0], np.linalg.inv(t2[1]), t2[2]
    return None


def crop_of(T):
    """원본→컷 변환 T 에서 (배율, 원본 기준 중심 x, y 0~1)"""
    z = float(np.hypot(T[0, 0], T[1, 0]))
    c = np.linalg.inv(T) @ np.array([W / 2, H / 2, 1.0])
    return round(z, 2), round(float(c[0] / W), 3), round(float(c[1] / H), 3)


def ncc(a, b):
    a = cv2.cvtColor(a[:CAP_Y], cv2.COLOR_BGR2GRAY).astype("float32"); b = cv2.cvtColor(b[:CAP_Y], cv2.COLOR_BGR2GRAY).astype("float32")
    a -= a.mean(); b -= b.mean()
    return float((a * b).sum() / (np.sqrt((a * a).sum() * (b * b).sum()) + 1e-6))


def same_moment(v, src, n, T):
    """원본 컷 프레임을 확대해 대상 컷과 비교 → 같은 순간을 확대한 것인지(연속 동작) 판단"""
    best = -1.0
    for fa, fb in (("m", "m"), ("z", "a")):
        base = load(f"videos/{v}/shots/s{src:02d}_{fa}.jpg")
        warped = cv2.warpAffine(base, T[:2], (W, H))
        best = max(best, ncc(warped, load(f"videos/{v}/shots/s{n:02d}_{fb}.jpg")))
    return round(best, 2)


def main(v):
    cuts = json.load(open(f"videos/{v}/cuts.json"))
    dur = {s["idx"]: s["dur"] for s in cuts["shots"]}
    shots = [s["idx"] for s in cuts["shots"]]
    F = {n: feats(load(f"videos/{v}/shots/s{n:02d}_m.jpg")) for n in shots}
    rel = {}
    for i, n in enumerate(shots):
        for m in shots[i + 1:i + 7]:  # 6컷 이내에서 같은 원본 찾기
            r = relate(F[n], F[m])
            if not r and m - n <= 3:  # 큰 배율 크롭은 특징점이 모자라 템플릿 매칭으로 보완
                r = tm_best(v, n, m)
            if r:
                rel[(n, m)] = r
    # 분석 JSON 의 '같은 원본 크롭' 표시(눈으로 확인한 쌍)를 더함 — 배율·위치는 프레임에서 다시 잼
    hints = {n: h for n, h in analysis_hints(v).items() if n in F and h[0] in F}
    ap = f"videos/{v}/analysis.json"
    gen_of = {s["n"]: s.get("gen") for s in json.load(open(ap, encoding="utf-8"))["shots"]} if os.path.exists(ap) else {}
    hinted = 0
    for n, (b, fac) in hints.items():
        key = (min(b, n), max(b, n))
        if key in rel:
            s_auto = rel[key][0] if b < n else 1 / rel[key][0]  # 자동 측정 배율(b→n)
            if not fac or 1 / 1.35 <= s_auto / fac <= 1.35:
                continue  # 자동 측정이 분석에 적힌 배율과 맞으면 그대로 사용
        r = hint_relate(v, F, b, n, fac)  # b → n
        if r:
            rel[key] = r if b < n else (1 / r[0], np.linalg.inv(r[1]), r[2])
            hinted += 1
    parent = {n: n for n in shots}
    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]; x = parent[x]
        return x
    for (a, b) in rel:
        parent[find(a)] = find(b)
    members_of = {}
    for n in shots:
        members_of.setdefault(find(n), []).append(n)
    groups, shot_map = [], {}
    for members in members_of.values():
        if len(members) < 2:
            continue
        # 첫 컷 좌표계 기준 변환 — 믿을 만한 관계(인라이어·상관이 큰 것)부터 이어 가는 최대 신뢰 트리
        T0, heap, mset = {members[0]: np.eye(3)}, [], set(members)
        def push(x):
            for (a, b), (_, _, q) in rel.items():
                if a == x and b in mset and b not in T0:
                    heapq.heappush(heap, (-q, a, b))
                elif b == x and a in mset and a not in T0:
                    heapq.heappush(heap, (-q, b, a))
        push(members[0])
        while heap:
            _, frm, to = heapq.heappop(heap)
            if to in T0:
                continue
            T = rel[(frm, to)][1] if (frm, to) in rel else np.linalg.inv(rel[(to, frm)][1])
            T0[to] = T @ T0[frm]
            push(to)
        mem = sorted(T0)
        gbase = min(mem, key=lambda n: np.hypot(T0[n][0, 0], T0[n][1, 0]))
        # 여러 관계를 이어 붙이다 생긴 비정상 배율(8배 초과)은 잘못 이어진 것으로 보고 제외
        mem = [n for n in mem if np.hypot(T0[n][0, 0], T0[n][1, 0]) / np.hypot(T0[gbase][0, 0], T0[gbase][1, 0]) <= 8]
        if len(mem) < 2:
            continue
        scale_of = lambda n: np.hypot(T0[n][0, 0], T0[n][1, 0])
        edits = [n for n in mem if gen_of.get(n) == "edit"]
        made = [n for n in mem if gen_of.get(n) not in (None, "edit")]
        if edits and made:
            # 분석이 '생성할 컷 / 잘라 쓸 컷(gen=edit)'을 정해 둔 영상: 생성 컷마다 체인 1개,
            # 크롭 컷은 표시된 원본(없으면 자기보다 넓은 생성 컷 중 시간상 가장 가까운 것)에 붙임
            by_src = {m: [m] for m in made}
            for e in edits:
                b = hints.get(e, (None, None))[0]
                if b not in by_src:
                    wider = [m for m in made if scale_of(m) <= scale_of(e) * 1.02] or made
                    b = min(wider, key=lambda m: (abs(m - e), scale_of(m)))
                by_src[b].append(e)
            chains = [(src, sorted(ch)) for src, ch in by_src.items()]
        else:
            # 줌 체인: 시간상 붙어 있는 컷끼리(사이에 다른 컷 1개까지)
            raw, cur = [], [mem[0]]
            for n in mem[1:]:
                if n - cur[-1] <= 2:
                    cur.append(n)
                else:
                    raw.append(cur); cur = [n]
            raw.append(cur)
            # 분석에 'N번 원본을 잘라 씀'이라고 적힌 컷은 떨어져 있어도 그 원본의 체인으로 옮김
            for n, (b, _) in hints.items():
                cn = next((c for c in raw if n in c), None); cb = next((c for c in raw if b in c), None)
                if cn is not None and cb is not None and cn is not cb and len(cn) == 1:
                    raw.remove(cn); cb.append(n); cb.sort()
            # 영상 1개로 이어 쓰기엔 너무 긴 체인은 MAX_CLIP 초 단위로 나눔(같은 원본 이미지로 영상을 여러 개 생성)
            chains = []
            for ch in raw:
                cur, acc = [], 0.0
                for n in ch:
                    if cur and acc + dur[n] > MAX_CLIP:
                        chains.append(cur); cur, acc = [], 0.0
                    cur.append(n); acc += dur[n]
                chains.append(cur)
            chains = [(min(ch, key=scale_of), ch) for ch in chains]
        out_chains = []
        for src, ch in chains:
            items, used = [], 0.0
            for n in ch:
                T = T0[n] @ np.linalg.inv(T0[src])  # 원본(src) → n
                z, cx, cy = crop_of(T)
                it = {"n": n, "zoom": z, "cx": cx, "cy": cy, "dur": dur[n]}
                if n != src:
                    it["same_moment"] = same_moment(v, src, n, T)
                items.append(it)
                shot_map[n] = {"group": gbase, "source": src, "zoom": z, "cx": cx, "cy": cy, "order": len(items) - 1,
                               "use_from": round(used, 3)}
                used += dur[n]
            out_chains.append({"source": src, "shots": items, "need_sec": round(used + 0.5, 2)})
        zg = {n: crop_of(T0[n] @ np.linalg.inv(T0[gbase])) for n in mem}
        groups.append({"base": gbase, "members": [{"n": n, "zoom": zg[n][0], "cx": zg[n][1], "cy": zg[n][2]} for n in mem],
                       "chains": out_chains})
    # 컷 안 줌: 시작 프레임 → 끝 프레임 배율(>1 푸시인, <1 풀아웃)과 '좁은 쪽 화면 중심'의 넓은 쪽 기준 좌표
    inshot = {}
    for n in shots:
        r = relate(feats(load(f"videos/{v}/shots/s{n:02d}_a.jpg")), feats(load(f"videos/{v}/shots/s{n:02d}_z.jpg")))
        if r and abs(r[0] - 1) >= 0.03:
            T = r[1] if r[0] > 1 else np.linalg.inv(r[1])  # 항상 넓은 화면 → 좁은 화면 방향
            _, cx, cy = crop_of(T)
            inshot[n] = {"scale": round(r[0], 3), "cx": cx, "cy": cy}
    chains_all = [c for g in groups for c in g["chains"]]
    reused = sum(len(c["shots"]) - 1 for c in chains_all)
    summary = {"shots": len(shots), "setups": len(groups), "chains": sum(1 for c in chains_all if len(c["shots"]) > 1),
               "reused_shots": reused, "zoom_steps": sum(1 for n, m in shot_map.items() if n != m["source"] and m["zoom"] >= 1.1),
               "three_step": sum(1 for c in chains_all if len({round(s["zoom"], 1) for s in c["shots"]}) >= 3),
               "video_sources": len(shots) - reused,
               "image_sources": len(shots) - sum(len(g["members"]) - 1 for g in groups),
               "inshot_zoom_shots": len(inshot), "from_analysis_hints": hinted}
    json.dump({"summary": summary, "groups": sorted(groups, key=lambda g: g["base"]), "shot_map": {str(k): v_ for k, v_ in sorted(shot_map.items())},
               "inshot": {str(k): v_ for k, v_ in inshot.items()}},
              open(f"videos/{v}/zoom_groups.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(v, summary, flush=True)


if __name__ == "__main__":
    for v in sys.argv[1:]:
        main(v)
