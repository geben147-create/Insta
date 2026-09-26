"""분석 JSON 검사: 컷 수·필수 키·토큰 정의·모델 이름·생성 방식·귀여운 모먼트.
사용: python tools/validate_analysis.py v1 v2 ... (문제 없으면 'OK', 있으면 목록 출력 후 종료 코드 1)"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kitdata import MODELS  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOP = ["key", "rank", "id", "fmt", "logline", "formula", "why", "look", "cast", "sets", "beats", "captions", "shots", "sound", "edit", "tech", "adapt", "batches"]
SHOT = ["n", "who", "sz", "ang", "cam", "grid", "act", "bg", "set", "cap", "tr", "sfx", "tech", "why", "img", "mot", "gen", "m", "new"]
WHO = {"hero", "hero_costume", "cw1", "cw2", "boss", "leader", "friend", "group", "insert", "black", "card"}
GEN = {"i2v", "i2v-fl", "ref", "still", "edit"}
BASE_TOKENS = {"HERO", "ANIMAL", "PUN", "COSTUME"}


def check(v):
    p = os.path.join(ROOT, "videos", v, "analysis.json")
    a = json.load(open(p, encoding="utf-8"))
    cuts = json.load(open(os.path.join(ROOT, "videos", v, "cuts.json"), encoding="utf-8"))
    errs = []
    errs += [f"최상위 키 없음: {k}" for k in TOP if k not in a]
    ns = [s.get("n") for s in a.get("shots", [])]
    if ns != [c["idx"] for c in cuts["shots"]]:
        errs.append(f"컷 번호 불일치: 분석 {len(ns)}개 vs cuts.json {len(cuts['shots'])}개")
    tokens = BASE_TOKENS | {k.upper() for k in a.get("cast", {})} | {k.upper() for k in a.get("sets", {})}
    for s in a.get("shots", []):
        n = s.get("n")
        miss = [k for k in SHOT if k not in s]
        if miss:
            errs.append(f"#{n} 키 없음: {miss}")
        if s.get("who") not in WHO:
            errs.append(f"#{n} who 값 이상: {s.get('who')}")
        if s.get("gen") not in GEN:
            errs.append(f"#{n} gen 값 이상: {s.get('gen')}")
        bad_m = [m for m in s.get("m", []) if m not in MODELS]
        if bad_m:
            errs.append(f"#{n} 모델 이름 이상: {bad_m}")
        for fld in ("img", "mot"):
            undef = sorted(set(re.findall(r"\{([A-Z0-9_]+)\}", str(s.get(fld, "")))) - tokens)
            if undef:
                errs.append(f"#{n} {fld} 에 정의 안 된 토큰: {undef}")
        if "cute" not in s:
            errs.append(f"#{n} cute 태그 없음")
    cm = a.get("cute_moments", [])
    if not cm:
        errs.append("cute_moments 없음")
    for i, m in enumerate(cm, 1):
        if not all(m.get(k) for k in ("moment", "shots", "why", "prompt", "motion")):
            errs.append(f"cute_moments {i}번 항목 비어 있음")
        if "{HERO}" not in str(m.get("prompt", "")) and "{ANIMAL}" not in str(m.get("prompt", "")):
            errs.append(f"cute_moments {i}번 prompt 에 {{HERO}} 없음")
    stats = {"shots": len(ns), "cute_shots": sum(1 for s in a.get("shots", []) if s.get("cute")), "cute_moments": len(cm),
             "gen": {g: sum(1 for s in a.get("shots", []) if s.get("gen") == g) for g in sorted(GEN)}}
    return errs, stats


if __name__ == "__main__":
    bad = 0
    for v in sys.argv[1:]:
        errs, stats = check(v)
        print(v, "OK" if not errs else f"문제 {len(errs)}개", stats)
        for e in errs[:30]:
            print("   -", e)
        bad += bool(errs)
    sys.exit(1 if bad else 0)
