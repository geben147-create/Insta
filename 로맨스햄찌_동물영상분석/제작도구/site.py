"""Assemble the GitHub Pages site: one Korean-named folder per video + all-in-one page + ZIPs.

Usage: python site.py <repo_dir>
"""
import importlib
import re
import shutil
import subprocess
import sys
import zipfile
from pathlib import Path

from build import extract_images
from editkit import ffmpeg_script, hyperframes_html, srt
from export import to_markdown
from sections import render_all, render_index, render_page

HERE = Path(__file__).parent
WORK = HERE.parent
OUT = WORK.parent / "out"
NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
FOLDERS = {1: "01_로맨스_결혼식반전", 2: "02_햄찌1위_청소댄스", 3: "03_햄찌2위_아이라인", 4: "04_밀가루1_호떡",
           5: "05_밀가루2_돈까스", 6: "06_고양이가족_꿈반전", 7: "07_귀요미_하트고백"}
FULL_W = 1080
ZIP_NAME = "사진모음.zip"
MD_NAME = "내용.md"


def safe(name: str) -> str:
    return re.sub(r'[\\/:*?"<>|\'·—→,.()\[\]]+', "", name).replace(" ", "_")[:24].strip("_")


def full_grab(src: Path, t: float, dst: Path, duration: float) -> None:
    if dst.exists():
        return
    subprocess.run(["ffmpeg", "-y", "-nostdin", "-loglevel", "error", "-ss", f"{min(t, duration - 0.05):.2f}",
                    "-i", str(src), "-frames:v", "1", "-vf", f"scale='min({FULL_W},iw)':-2", "-q:v", "3", str(dst)],
                   check=True, stdin=subprocess.DEVNULL, capture_output=True, timeout=60, creationflags=NO_WINDOW)


def video_folder(v: dict, repo: Path, prev_v, next_v) -> Path:
    folder = repo / FOLDERS[v["id"]]
    for sub in ("img", "full", "편집키트", "분석데이터"):
        (folder / sub).mkdir(parents=True, exist_ok=True)
    src = WORK / f"v{v['id']}" / "download" / "video.mp4"
    thumbs = OUT / "img" / f"v{v['id']}"
    zip_items = []
    for si, s in enumerate(v["shots"], 1):
        for fi, t in enumerate(s["frames"], 1):
            name = f"s{si:02d}_{fi}.jpg"
            full_grab(src, t, folder / "full" / name, v["duration"])
            zip_items.append((folder / "full" / name, f"컷별/구간{si:02d}_{safe(s['name'])}_{t}초.jpg"))
    step = v.get("strip_step", 1.0)
    for k in range(v["strip_count"]):
        name = f"strip_{k:03d}.jpg"
        full_grab(src, k * step, folder / "full" / name, v["duration"])
        zip_items.append((folder / "full" / name, f"시간순/{k:03d}_{k * step:.2f}초.jpg"))
    for f in thumbs.glob("*.jpg"):
        shutil.copy2(f, folder / "img" / f.name)
    md = to_markdown(v)
    (folder / MD_NAME).write_text(md, encoding="utf-8")
    (folder / "편집키트" / "build.sh").write_text(ffmpeg_script(v) + "\n", encoding="utf-8", newline="\n")
    (folder / "편집키트" / "hyperframes_index.html").write_text(hyperframes_html(v) + "\n", encoding="utf-8")
    if v.get("subs"):
        (folder / "편집키트" / "subs.srt").write_text(srt(v), encoding="utf-8")
    audio_json = WORK / f"v{v['id']}" / "audio.json"
    if audio_json.exists():
        shutil.copy2(audio_json, folder / "분석데이터" / "audio_bpm_transcript.json")
    with zipfile.ZipFile(folder / ZIP_NAME, "w", zipfile.ZIP_STORED) as z:
        for path, arc in zip_items:
            z.write(path, arc)
        z.writestr(MD_NAME, md)
    ctx = {"css": "../assets/style.css", "js": "../assets/app.js", "img": "img", "full": "full", "home": "../",
           "href": lambda x: f"../{FOLDERS[x['id']]}/",
           "extras": [("🗂 사진 전체 ZIP", ZIP_NAME), ("📄 내용 .md", MD_NAME)]}
    (folder / "index.html").write_text(render_page(v, prev_v, next_v, ctx), encoding="utf-8")
    return folder


def copy_tools(repo: Path) -> None:
    tools = repo / "제작도구"
    tools.mkdir(exist_ok=True)
    for f in HERE.glob("*.py"):
        shutil.copy2(f, tools / f.name)
    shutil.copy2(WORK / "audio_analyze.py", tools / "audio_analyze.py")
    log = WORK.parent / "작업기록.md"
    if log.exists():
        shutil.copy2(log, tools / "작업기록.md")


def main() -> None:
    repo = Path(sys.argv[1])
    videos = []
    for n in sorted(FOLDERS):
        v = importlib.import_module(f"v{n}").VIDEO
        extract_images(v)
        videos.append(v)
    shutil.copytree(OUT / "assets", repo / "assets", dirs_exist_ok=True)
    folders = [video_folder(v, repo, videos[i - 1] if i else None, videos[i + 1] if i < len(videos) - 1 else None)
               for i, v in enumerate(videos)]
    all_md = "# 인스타 떡상 레퍼런스 7편 — 장면·전환·사운드·편집 완전 분해\n\n" + "\n\n---\n\n".join(
        to_markdown(v) for v in videos)
    (repo / "전체내용.md").write_text(all_md, encoding="utf-8")
    with zipfile.ZipFile(repo / "전체사진모음.zip", "w", zipfile.ZIP_STORED) as z:
        for folder in folders:
            with zipfile.ZipFile(folder / ZIP_NAME) as inner:
                for item in inner.infolist():
                    z.writestr(f"{folder.name}/{item.filename}", inner.read(item.filename))

    def ctx_of(v):
        f = FOLDERS[v["id"]]
        return {"img": f"{f}/img", "full": f"{f}/full", "extras": [("🗂 이 영상 사진 ZIP", f"{f}/{ZIP_NAME}")]}

    (repo / "전체_한페이지.html").write_text(
        render_all(videos, ctx_of, "assets/style.css", "assets/app.js",
                   [("🗂 7편 사진 전체 ZIP", "전체사진모음.zip"), ("📄 전체내용 .md", "전체내용.md")]), encoding="utf-8")
    (repo / "index.html").write_text(render_index(
        videos, href=lambda x: f"{FOLDERS[x['id']]}/", thumb=lambda x: f"{FOLDERS[x['id']]}/img/s01_1.jpg",
        css="assets/style.css",
        extras=[("📚 전체 내용 한 페이지 (한 번에 복사)", "전체_한페이지.html"), ("🗂 7편 사진 전체 ZIP", "전체사진모음.zip"),
                ("📄 전체내용 .md", "전체내용.md")]), encoding="utf-8")
    (repo / ".nojekyll").write_text("", encoding="utf-8")
    copy_tools(repo)
    print("site built:", repo)


if __name__ == "__main__":
    main()
