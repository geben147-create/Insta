"""두 에이전트가 나눠 쓴 분석(앞부분 analysis.json + 뒷부분 analysis_part2.json)을 하나로 합치기.
- 앞부분 파일을 analysis_partA.json 으로 보관한 뒤 analysis.json 을 합친 결과로 교체
- cast·sets 는 앞부분 키 우선, 뒷부분에만 있는 키 추가 / cute_moments 는 이어 붙임
사용: python tools/merge_parts.py v4"""
import json, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main(v):
    d = os.path.join(ROOT, "videos", v)
    a_path, b_path = os.path.join(d, "analysis.json"), os.path.join(d, "analysis_part2.json")
    keep = os.path.join(d, "analysis_partA.json")
    if not os.path.exists(keep):
        shutil.copy(a_path, keep)
    a = json.load(open(keep, encoding="utf-8"))
    b = json.load(open(b_path, encoding="utf-8"))
    b_shots = b["shots"] if isinstance(b, dict) else b
    defs = {}
    for name in ("defs_partA.json", "defs_partB.json"):
        p = os.path.join(d, name)
        if os.path.exists(p):
            defs[name] = json.load(open(p, encoding="utf-8"))
    merged = dict(a)
    merged["shots"] = sorted(a["shots"] + b_shots, key=lambda s: s["n"])
    for key in ("cast", "sets"):
        extra = {}
        for dd in defs.values():
            extra.update(dd.get(key) or {})
        merged[key] = {**extra, **a.get(key, {})}
    cm = list(a.get("cute_moments", []))
    for dd in defs.values():
        cm += [m for m in dd.get("cute_moments", []) if m not in cm]
    merged["cute_moments"] = cm
    fam = [f for dd in defs.values() for f in dd.get("digital_zoom_families", [])]
    if fam:
        merged["zoom_families"] = fam
    cuts = json.load(open(os.path.join(d, "cuts.json"), encoding="utf-8"))
    want = [c["idx"] for c in cuts["shots"]]
    got = [s["n"] for s in merged["shots"]]
    if got != want:
        raise SystemExit(f"컷 번호 불일치: 합친 결과 {len(got)}개, cuts.json {len(want)}개, 빠진 컷 {sorted(set(want) - set(got))}")
    json.dump(merged, open(a_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(v, "합침:", len(merged["shots"]), "컷 · cast", sorted(merged["cast"]), "· sets", sorted(merged["sets"]), "· cute_moments", len(cm))


if __name__ == "__main__":
    for v in sys.argv[1:]:
        main(v)
