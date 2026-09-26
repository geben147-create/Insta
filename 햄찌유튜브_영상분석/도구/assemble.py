"""공개 폴더(GitHub용)와 개인 ZIP 조립.
사용: python tools/assemble.py public <공개폴더경로>   → 한 페이지·텍스트·편집키트·분석데이터·도구·작업기록·README
      python tools/assemble.py private <작업폴더> <zip경로> → 사진 포함 한 페이지 + 사진 + 자막 + 편집키트 ZIP"""
import glob, json, os, shutil, subprocess, sys, zipfile
from urllib.parse import quote

FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = "햄찌유튜브_영상분석"
KIT_FILES = ["edl.json", "edl.csv", "captions.ass", "sfx_cues.csv", "build_ffmpeg.py", "caption_events.json", "test_result.txt"]


def ready_keys():
    return [f"v{i}" for i in range(1, 11)
            if os.path.exists(os.path.join(ROOT, "videos", f"v{i}", "analysis.json")) and os.path.exists(os.path.join(ROOT, "kits", f"v{i}", "edl.json"))]


def run_onepage(out, mode):
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build_onepage.py"), out, mode], capture_output=True, text=True,
                       encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL, creationflags=FLAGS, timeout=1800,
                       env={**os.environ, "PYTHONUTF8": "1"})
    if r.returncode:
        raise SystemExit(r.stderr[-2000:])
    print(r.stdout.strip())


def copy_kits(dst_root, keys):
    for v in keys:
        rank = v[1:] + "위"
        src, dst = os.path.join(ROOT, "kits", v), os.path.join(dst_root, "편집키트", rank)
        os.makedirs(os.path.join(dst, "hyperframes"), exist_ok=True)
        os.makedirs(os.path.join(dst, "clips"), exist_ok=True)
        for f in KIT_FILES:
            if os.path.exists(os.path.join(src, f)):
                shutil.copy(os.path.join(src, f), os.path.join(dst, f))
        shutil.copy(os.path.join(src, "hyperframes", "index.html"), os.path.join(dst, "hyperframes", "index.html"))
        open(os.path.join(dst, "clips", "넣는법.txt"), "w", encoding="utf-8").write(
            "s01.mp4 ~ sNN.mp4 형식으로 컷 번호에 맞춰 AI 생성 영상을 넣으세요. (voice/sNN.wav, sfx/효과음.wav, audio/bgm.mp3 는 선택)\n")


def public(dst):
    keys = ready_keys()
    os.makedirs(dst, exist_ok=True)
    run_onepage(dst, "public")
    copy_kits(dst, keys)
    data = os.path.join(dst, "분석데이터")
    os.makedirs(data, exist_ok=True)
    for v in keys:
        r = v[1:] + "위"
        for src, name in [("analysis.json", "분석"), ("cuts.json", "컷타이밍"), ("audio.json", "소리특징"), ("pitch.json", "목소리높이"),
                          ("zoom_groups.json", "같은원본줌")]:
            if os.path.exists(os.path.join(ROOT, "videos", v, src)):
                shutil.copy(os.path.join(ROOT, "videos", v, src), os.path.join(data, f"{r}_{name}.json"))
    shutil.copy(os.path.join(ROOT, "data", "ranking.csv"), os.path.join(data, "순위표.csv"))
    tools = os.path.join(dst, "도구")
    for sub in ("", "static", "templates", "onepage"):
        os.makedirs(os.path.join(tools, sub), exist_ok=True)
    for f in glob.glob(os.path.join(ROOT, "tools", "*.py")) + glob.glob(os.path.join(ROOT, "tools", "*.md")):
        shutil.copy(f, tools)
    for sub in ("static", "templates", "onepage"):
        for f in glob.glob(os.path.join(ROOT, "tools", sub, "*")):
            shutil.copy(f, os.path.join(tools, sub))
    for f in ("data/rank.py", "subs/make_clean.py", "subs/whisper_subs.py", "subs/retry.sh"):
        shutil.copy(os.path.join(ROOT, f), tools)
    shutil.copy(os.path.join(ROOT, "작업기록.md"), dst)
    pages = f"https://geben147-create.github.io/Insta/{quote(D)}/"
    raw = f"https://raw.githubusercontent.com/geben147-create/Insta/main/{quote(D)}/"
    ranks = [v[1:] + "위" for v in keys]
    total = sum(len(json.load(open(os.path.join(ROOT, "videos", v, "cuts.json")))["shots"]) for v in keys)
    readme = f"""# {D}

정서불안 김햄찌(유튜브) 동영상 탭 최근 30개 중 **기간 대비 성과(일평균 조회수) Top 10** — {len(keys)}개 영상 **{total}컷 완전 분해**

## 바로 열기
| 무엇 | 링크 |
|---|---|
| 한 페이지 전체 (동물 바꾸기 · 📋 전체 복사 · 영상별 복사) | [{pages}]({pages}) |
| 전체 텍스트 (웹·AI가 바로 읽는 txt) | [전체분석.txt]({pages}{quote('전체분석.txt')}) |
| 나눈 텍스트 | [개요.txt]({pages}{quote('개요.txt')}) · """ + " · ".join(f"[{r}.txt]({pages}{quote(r + '.txt')})" for r in ranks) + f""" |
| 원문 그대로(raw) | [전체분석.md]({raw}{quote('전체분석.md')}) |

## 한 페이지에 들어 있는 것
- 채널 공통: Top10 · 채널 공식 · 제작 순서 · 🧸 **귀여운 모먼트 사전**(태그별 등장 수·대표 컷·이미지/움직임 프롬프트 조각) · 🔁 **같은 원본 3단 줌**(재사용 컷 통계·배율 분포·대표 줌 체인) · 🎬 **이미지·클립을 편집에 넣는 법**(FFmpeg·HyperFrames 상세) · 🔊 **효과음 사전**(종류·컷 기준 타이밍·볼륨·무료 검색어)
- 영상별: 왜 떡상했나 · 귀여운 모먼트 · 편집 리듬 · 스토리 비트 · 자막 규격 · **생성 절약표(원본 1개로 여러 컷)** · 컷별 분석과 프롬프트 · 사운드 · 편집 키트 · 편집 기법 · 다른 동물로 바꾸기

## 폴더 구성
- `index.html` — 위 내용 전부(동물 바꾸기 · 📋 전체 복사 · 영상별 복사)
- `편집키트/N위` — edl(컷 길이·전환·**같은 원본 재사용 source/zoom/cx/cy/src_in**), captions.ass(원본 측정 자막 규격), sfx_cues.csv, build_ffmpeg.py(자동 조립·재사용 크롭·컷 안 줌·컷 검증), hyperframes/index.html, 편집프롬프트.md
- `분석데이터` — 컷별 분석 JSON, 컷 타이밍, 소리 특징, 목소리 높이, 순위표
- `도구` — 분석·생성 파이썬 스크립트, 분석 지침서
- `작업기록.md`

## 공개하지 않은 것
원본 영상 캡처 사진과 자막 원문은 김햄찌 채널 저작물이라 공개 저장소에 올리지 않았습니다(신고로 저장소 링크가 막히는 것을 방지). 같은 구성에 사진·자막이 들어간 개인용 ZIP은 따로 전달했습니다.
"""
    open(os.path.join(dst, "README.md"), "w", encoding="utf-8").write(readme)
    row = (f"| [{D}](./{quote(D)}/) | 정서불안 김햄찌(유튜브) 최근 30개 기간 대비 성과 Top10 — {len(keys)}개 영상 {total}컷 완전 분해 "
           f"(귀여운 모먼트 사전·같은 원본 3단 줌 재사용·효과음 사전·동물 바꾸기·전체/영상별 복사·이미지/영상 프롬프트·추천 모델·FFmpeg/HyperFrames 편집 키트, 원본 사진·자막은 저작권으로 비공개) | "
           f"[한 페이지 전체]({pages}) · [텍스트 전체]({pages}{quote('전체분석.txt')}) |")
    open(os.path.join(dst, "..", "_row.txt"), "w", encoding="utf-8").write(row)
    # 공개본에 이 PC의 임시 작업 경로가 남지 않게 치환
    root_bs, root_fs = ROOT, ROOT.replace("\\", "/")
    hits = 0
    for base, _, files in os.walk(dst):
        for fn in files:
            if not fn.endswith((".md", ".txt", ".py", ".sh", ".json", ".html", ".js", ".css", ".csv", ".ass")):
                continue
            p = os.path.join(base, fn)
            s = open(p, encoding="utf-8", errors="ignore").read()
            if root_bs in s or root_fs in s:
                open(p, "w", encoding="utf-8").write(s.replace(root_bs, "<작업폴더>").replace(root_fs, "<작업폴더>")); hits += 1
    print("public ready:", len(keys), "videos,", total, "shots | 경로 치환 파일", hits)


def private(work, zp):
    keys = ready_keys()
    shutil.rmtree(work, ignore_errors=True)
    os.makedirs(work)
    run_onepage(work, "private")
    copy_kits(work, keys)
    readme = f"""[{D} — 개인용 사진·자막 모음]
1) 압축을 먼저 푸세요 (ZIP 안에서 바로 열면 사진이 안 보입니다)
2) 전체분석_사진포함.html 을 크롬으로 열기 → 모든 내용이 한 페이지, 맨 위 '📋 전체 복사' 한 번에 전부 복사, 영상마다 '이 영상만 복사'
   - 사진을 누르면 크게 보입니다 (Esc 로 닫기)
3) 사진 폴더: 영상별 '전환 직후' 캡처(컷 번호순, 1024px) + 작은사진(컷 중간·끝) + 콘택트시트(컷마다 시작·중간·끝)
4) 자막 폴더: 상위 10개 영상 자막 원문(한국어·영어·일본어) + 00_자막목록.md
5) 편집키트: FFmpeg 자동 조립·HyperFrames·자막(ASS)·효과음 큐 (공개 저장소와 동일)
※ 원본 영상 캡처·자막은 김햄찌 채널 저작물입니다. 개인 분석용으로만 쓰고 외부 공유·재업로드는 하지 마세요.
공개 웹 페이지(사진 제외): https://geben147-create.github.io/Insta/{quote(D)}/
"""
    n = 0
    with zipfile.ZipFile(zp, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
        z.writestr("먼저읽기.txt", readme); n += 1
        for base, _, files in os.walk(work):
            for fn in files:
                full = os.path.join(base, fn)
                z.write(full, os.path.relpath(full, work).replace(os.sep, "/")); n += 1
        for v in keys:
            for sh in sorted(glob.glob(os.path.join(ROOT, "videos", v, "sheets", "sheet_*.jpg"))):
                z.write(sh, f"사진/{v[1:]}위/콘택트시트/{os.path.basename(sh)}"); n += 1
        for f in sorted(glob.glob(os.path.join(ROOT, "subs", "[0-9][0-9]_*.txt"))) + [os.path.join(ROOT, "subs", "00_자막목록.md")]:
            z.write(f, f"자막/{os.path.basename(f)}"); n += 1
    with zipfile.ZipFile(zp) as z:
        bad = z.testzip()
    print("zip:", zp, f"{os.path.getsize(zp) / 1e6:.1f}MB", "files:", n, "testzip:", bad or "OK")


if __name__ == "__main__":
    if sys.argv[1] == "public":
        public(sys.argv[2])
    else:
        private(sys.argv[2], sys.argv[3])
