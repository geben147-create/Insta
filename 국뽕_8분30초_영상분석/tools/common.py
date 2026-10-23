import re

MD_PATH = r"대본_국뽕_8분30초.md"  # 작성 당시에는 작업 폴더의 절대 경로를 사용

SECTION_LABEL = {
    "HOOK": "오프닝",
    "현실": "현실 장면",
    "통념": "통념",
    "균열": "첫 번째 균열",
    "원리": "쉬운 원리",
    "반론": "가장 강한 반론",
    "잠정": "잠정 결론",
    "반전": "두 번째 반전",
    "결론": "결론",
    "회수": "다시, 처음으로",
}


def parse_rows(path=MD_PATH):
    rows = []
    for line in open(path, encoding="utf-8"):
        m = re.match(r"\|\s*(\d{3})\s*\|(.*)\|\s*$", line)
        if not m:
            continue
        c = [x.strip() for x in line.strip().strip("|").split("|")]
        rows.append(
            {
                "no": int(c[0]),
                "time": c[1],
                "section": c[2],
                "kind": c[3],
                "src": c[4],
                "kw": "" if c[5] == "-" else c[5],
                "ref": "" if c[6] == "-" else c[6],
                "text": c[7],
            }
        )
    return rows
