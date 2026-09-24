"""키트 재생성 → FFmpeg 전체 조립(임시 화면) → 길이·컷 검증 결과를 kits/vN/test_result.txt 에 기록."""
import json, os, re, subprocess, sys
FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for v in sys.argv[1:]:
    subprocess.run([sys.executable, os.path.join(ROOT, "tools", "build_kit.py"), v], check=True, stdin=subprocess.DEVNULL, creationflags=FLAGS, capture_output=True)
    kit = os.path.join(ROOT, "kits", v)
    r = subprocess.run([sys.executable, "build_ffmpeg.py", "--name", "김수달", "--pun", "달", "--verify"], cwd=kit, capture_output=True, text=True,
                       encoding="utf-8", errors="replace", stdin=subprocess.DEVNULL, creationflags=FLAGS, timeout=1800)
    out = r.stdout + r.stderr
    dur = re.search(r"길이 ([\d.]+)초 / 목표 ([\d.]+)초", out)
    ver = re.search(r"하드컷 (\d+)개 중 (\d+)개", out)
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height,r_frame_rate", "-of", "csv=p=0",
                            os.path.join(kit, "out", f"{v}_final.mp4")], capture_output=True, text=True, stdin=subprocess.DEVNULL, creationflags=FLAGS)
    edl = json.load(open(os.path.join(kit, "edl.json"), encoding="utf-8"))["shots"]
    blind = sum(1 for a, b in zip(edl, edl[1:]) if a["who"] == "black" and b["who"] == "black" and b["tr"] == "cut")
    if r.returncode == 0 and dur and ver:
        msg = (f"임시 화면으로 전체 조립 성공 — 길이 {dur.group(1)}초(목표 {dur.group(2)}초), 하드컷 {ver.group(1)}개 중 {ver.group(2)}개가 ±2프레임 이내 검출"
               + (f"(검은 화면→검은 화면 컷 {blind}개는 화면 변화가 없어 원래 검출 불가)" if blind else "")
               + f", 출력 {probe.stdout.strip().replace(chr(10), ' / ')}")
    else:
        msg = "조립 실패: " + out[-400:]
    open(os.path.join(kit, "test_result.txt"), "w", encoding="utf-8").write(msg + "\n")
    print(v, "|", msg)
