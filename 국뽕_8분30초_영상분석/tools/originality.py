"""독창성 비중 계산. 사용법: python originality.py <내 분류 102자> <독립 분류 102자>
O 의견·평론, C 사회·역사 배경, B 비하인드, F 외부 사실 전달, Q 구성(질문·전환)."""
import sys
from collections import Counter

from common import parse_rows

SECTIONS = ["HOOK", "현실", "통념", "균열", "원리", "반론", "잠정", "반전", "결론", "회수"]
NAMES = {"O": "의견·평론", "C": "사회·역사 배경", "B": "비하인드·일화", "F": "외부 사실 전달", "Q": "구성(질문·전환)"}

mine, other = sys.argv[1].strip(), sys.argv[2].strip()
assert len(mine) == 102 and len(other) == 102, (len(mine), len(other))
rows = parse_rows()
chars = [len(r["text"]) for r in rows]


def report(tag, s):
    cnt = Counter(s)
    print(f"[{tag}]")
    for k in "OCBFQ":
        pct_c = 100 * cnt[k] / 102
        pct_ch = 100 * sum(chars[i] for i in range(102) if s[i] == k) / sum(chars)
        print(f"  {k} {NAMES[k]:<10} {cnt[k]:3d}컷  컷비중 {pct_c:5.1f}%  글자비중 {pct_ch:5.1f}%")
    own = cnt["O"] + cnt["C"] + cnt["B"]
    print(f"  독창(O+C+B) {own}컷 = {100 * own / 102:.1f}%   의견만(O) {100 * cnt['O'] / 102:.1f}%   구성 포함(O+C+B+Q) {100 * (own + cnt['Q']) / 102:.1f}%")


report("내 분류", mine)
report("독립 분류", other)
same = [i + 1 for i in range(102) if mine[i] == other[i]]
print(f"두 분류가 같은 컷 {len(same)}/102 = {100 * len(same) / 102:.1f}%")
diff = [(i + 1, mine[i], other[i]) for i in range(102) if mine[i] != other[i]]
print("다른 컷:", " ".join(f"{n}{a}>{b}" for n, a, b in diff))

clip_cuts = [r["no"] for r in rows if r["kind"] == "CLIP"]
print(f"제3자 영상 클립 {len(clip_cuts)}컷 = {5 * len(clip_cuts)}초 / 510초 = {100 * len(clip_cuts) / 102:.1f}% (원본 소리는 모두 제거, 내 음성만 사용)")
print("구간별 독창(O+C+B) 비중(내 분류 / 독립 분류):")
i = 0
for name in SECTIONS:
    n = sum(1 for r in rows if r["section"] == name)
    a = sum(1 for c in mine[i:i + n] if c in "OCB")
    b = sum(1 for c in other[i:i + n] if c in "OCB")
    print(f"  {name:<5} {n:2d}컷  {100 * a / n:5.1f}% / {100 * b / n:5.1f}%")
    i += n
