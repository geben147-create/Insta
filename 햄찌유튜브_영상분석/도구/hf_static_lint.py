"""HyperFrames 스킬 문서의 필수 규칙 일부를 정적으로 점검 (공식 `npx hyperframes check` 대체 아님)."""
import re, sys
from html.parser import HTMLParser

class P(HTMLParser):
    def __init__(self):
        super().__init__(); self.stack = []; self.issues = []; self.ids = {}; self.media = 0; self.clips = 0
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if "id" in a:
            self.ids[a["id"]] = self.ids.get(a["id"], 0) + 1
        timed_parent = any("data-start" in pa and "data-composition-id" not in pa for pt, pa in self.stack)  # 컴포지션 호스트는 예외(스킬 문서)
        if tag in ("video", "audio"):
            self.media += 1
            if "crossorigin" in a: self.issues.append(f"crossorigin 금지: {a.get('id')}")
            if not a.get("id"): self.issues.append(f"{tag} id 없음")
            if tag == "video" and "data-start" in a and timed_parent: self.issues.append(f"타이밍 중첩 video: {a.get('id')}")
            if tag == "video" and ("muted" not in a or "playsinline" not in a): self.issues.append(f"video muted/playsinline 누락: {a.get('id')}")
        if "data-start" in a:
            self.clips += 1
            if tag not in ("video", "audio") and "data-duration" not in a: self.issues.append(f"data-duration 없음: {a.get('id')}")
        if tag == "br": self.issues.append("<br> 사용")
        if tag not in ("img", "br", "meta", "link", "source", "input"):
            self.stack.append((tag, a))
    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]; break

for path in sys.argv[1:]:
    html = open(path, encoding="utf-8").read()
    p = P(); p.feed(html)
    dup = [k for k, v in p.ids.items() if v > 1]
    root = re.search(r'data-composition-id="([^"]+)"', html)
    reg = re.search(r'window\.__timelines\["([^"]+)"\]', html)
    if not root or not reg or root.group(1) != reg.group(1): p.issues.append("타임라인 키와 composition-id 불일치")
    if "gsap.timeline({ paused: true })" not in html: p.issues.append("paused 타임라인 없음")
    if "repeat: -1" in html: p.issues.append("repeat -1 금지")
    if re.search(r"Math\.random|Date\.now|new Date\(", html): p.issues.append("비결정적 코드")
    if dup: p.issues.append(f"id 중복 {dup[:5]}")
    print(f"{path}: 타이밍 요소 {p.clips}개, 미디어 {p.media}개, 문제 {len(p.issues)}개", *(p.issues[:10] or ["OK"]), sep="\n  ")
