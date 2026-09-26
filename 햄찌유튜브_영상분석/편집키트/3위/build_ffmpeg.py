"""EDL(edl.json) 규격대로 AI 클립을 조립하는 FFmpeg 빌더.

사용 예 (이 파일이 있는 키트 폴더에서):
  python build_ffmpeg.py --check                      # 누락 파일 목록만 확인
  python build_ffmpeg.py --name 김수달 --pun 달          # clips/ 가 비어 있으면 임시 화면으로 조립(타이밍 검증용)
  python build_ffmpeg.py --name 김수달 --pun 달 --bgm audio/bgm.mp3 --verify

입력 폴더 규칙:
  clips/sNN.mp4   각 컷의 AI 생성 영상(5초 권장). 없으면 번호가 적힌 임시 화면으로 대체
                  정지 컷(still)은 clips/sNN.png·jpg·webp 이미지 1장만 넣어도 됨(컷 길이만큼 늘여 쓰고 줌은 편집으로)
                  edl.json 에 "source" 가 있는 컷은 따로 생성하지 않고 원본 컷 클립을 잘라 확대해 씀
                  (zoom=배율, cx·cy=원본 화면 기준 중심 0~1, src_in=클립 안 시작 초 — 한 클립을 여러 컷이 이어 씀)
  voice/sNN.wav   (선택) 그 컷 시작 시점에 놓을 대사 음성
  sfx/<이름>.wav  (선택) sfx_cues.csv 의 file 열 이름과 같은 효과음. 없으면 짧은 '삑' 소리로 위치만 표시
  audio/bgm.mp3   (선택) 배경음악 — 대사가 나올 때 자동으로 줄어듦(사이드체인 덕킹)
출력: out/<키트이름>_final.mp4 (1920x1080, 30fps, H.264 CRF18, AAC 192k, -14 LUFS)
"""
import argparse, csv, json, os, subprocess, sys, shutil

FLAGS = getattr(subprocess, "CREATE_NO_WINDOW", 0)  # 윈도우에서 콘솔 창이 뜨지 않게
HERE = os.path.dirname(os.path.abspath(__file__))
W, H, FPS = 1920, 1080, 30


def run(cmd, timeout=900):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                       stdin=subprocess.DEVNULL, creationflags=FLAGS, timeout=timeout)
    if r.returncode != 0:
        sys.stderr.write(r.stderr[-3000:])
        raise SystemExit(f"FFmpeg 실패: {' '.join(cmd[:6])} ...")
    return r


def graph_opt():
    """FFmpeg 7 이상·개발판은 '-/filter_complex 파일', 이전 버전은 '-filter_complex_script 파일'."""
    r = subprocess.run(["ffmpeg", "-hide_banner", "-version"], capture_output=True, text=True, stdin=subprocess.DEVNULL, creationflags=FLAGS)
    head = r.stdout.splitlines()[0] if r.stdout else ""
    ver = head.split("version", 1)[-1].strip().split(" ")[0]
    if ver.startswith("N-") or ver.startswith("n") and ver[1:2].isdigit() and int(ver[1:].split(".")[0]) >= 7:
        return "-/filter_complex"
    try:
        return "-/filter_complex" if int(ver.split(".")[0]) >= 7 else "-filter_complex_script"
    except ValueError:
        return "-/filter_complex"


def esc(path):  # filtergraph 안 경로 이스케이프 (윈도우 드라이브 콜론 등)
    return path.replace("\\", "/").replace(":", "\\:").replace("'", "\\'")


def reuse_crop(shot):
    """같은 원본 재사용: 원본 화면에서 중심(cx,cy)·배율(zoom)만큼 잘라 1920x1080 으로 확대 (디지털 줌 한 단)"""
    z = max(1.0, float(shot.get("zoom", 1)))
    cw, ch = int(W / z) // 2 * 2, int(H / z) // 2 * 2
    x0 = int(min(max(shot["cx"] * W - cw / 2, 0), W - cw))
    y0 = int(min(max(shot["cy"] * H - ch / 2, 0), H - ch))
    return f"crop={cw}:{ch}:{x0}:{y0},scale={W}:{H}:flags=lanczos"


def push_origin(p):
    """측정한 컷 안 줌 → 확대 고정점(0~1). 좁은 화면의 중심이 측정 위치(cx,cy)에 오도록 계산"""
    k = p["scale"] if p["scale"] > 1 else 1 / p["scale"]
    return [min(max((0.5 - k * c) / (1 - k), 0.0), 1.0) for c in (p["cx"], p["cy"])]


def zoompan(z0, z1, ramp, ox=0.5, oy=0.5):
    """z0→z1 배율로 ramp 초 동안 확대(이후 유지), 고정점(ox,oy). 2배 업스케일 후 잘라 떨림(정수 좌표 반올림)을 줄임"""
    z = f"{z0:.4f}+({z1 - z0:.4f})*min(on/{FPS * ramp:.3f}\\,1)"
    return (f"scale={W * 2}:{H * 2},zoompan=z='{z}':x='{ox:.4f}*iw*(1-1/zoom)':y='{oy:.4f}*ih*(1-1/zoom)'"
            f":d=1:s={W}x{H}:fps={FPS}")


def frame_filter(shot, length):
    """컷 하나의 화면 규격·효과 필터."""
    fx = shot.get("fx", [])
    frame = shot.get("frame", "full")
    chain = [f"fps={FPS}"]  # 24fps 클립도 30fps 로 맞춘 뒤 줌 계산 (zoompan 은 입력 1프레임=출력 1프레임)
    if frame == "full":
        chain.append(f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}")
    else:  # 1:1, 3:4 등 필러박스(가운데 배치 + 양옆 검정)
        fw = {"1x1": 1080, "3x4": 810, "p088": 954}.get(frame, 1080)
        chain.append(f"scale={fw}:{H}:force_original_aspect_ratio=increase,crop={fw}:{H},pad={W}:{H}:(ow-iw)/2:0:black")
    if "source" in shot and not shot.get("placeholder"):  # 같은 원본 클립을 잘라 확대해 다른 컷처럼 사용
        chain.append(reuse_crop(shot))
    if "crash_zoom" in fx:  # 처음 0.12초 동안 1.0→1.25배 급확대 후 유지
        chain.append(zoompan(1.0, 1.25, 0.12))
    elif "push" in shot:  # 원본에서 측정한 컷 안 줌(배율·방향 그대로)
        p = shot["push"]
        ox, oy = push_origin(p)
        z0, z1 = (1.0, p["scale"]) if p["scale"] > 1 else (1 / p["scale"], 1.0)
        chain.append(zoompan(z0, z1, length, ox, oy))
    elif "push_in_slow" in fx:  # 컷 전체에 걸쳐 1.0→1.08배
        chain.append(zoompan(1.0, 1.08, length))
    if "shake" in fx:
        chain.append(f"crop={W-40}:{H-40}:20+14*sin(47*t):20+12*cos(39*t),scale={W}:{H}")
    if "dip_out" in fx:  # 컷 끝으로 갈수록 검게
        chain.append(f"fade=t=out:st=0:d={length:.3f}")
    if "flash_in" in fx:
        chain.append("fade=t=in:st=0:d=0.1:color=white")
    if "whip" in fx:  # 가로 모션블러 흉내
        chain.append("gblur=sigma=40:sigmaV=2")
    chain.append(f"fps={FPS},format=yuv420p,setsar=1")
    return ",".join(chain)


_DUR = {}


def src_start(src, want, length):
    """클립 안 시작 위치. 여러 컷이 한 클립을 이어 쓰다 끝을 넘으면 앞쪽으로 되감아 사용"""
    if src not in _DUR:
        r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src])
        try:
            _DUR[src] = float(r.stdout.strip())
        except ValueError:
            _DUR[src] = 0.0
    room = _DUR[src] - length - 0.05
    if room <= 0:
        return 0.0
    return want if want <= room else want % room


IMG_EXT = (".png", ".jpg", ".jpeg", ".webp")


def is_flash(shot):
    """0.2초 이하 편집용 인서트(썸네일 번쩍·전환 프레임) — 파일이 없으면 흰 섬광"""
    return shot.get("gen") == "edit" and shot.get("who") == "insert" and "source" not in shot and shot["dur"] <= 0.2


def needs_file(shot):
    """직접 넣어야 하는 파일이 있는 컷: 생성 컷 + 편집용 그래픽·녹화 화면(0.2초 초과 인서트). 재사용 컷·암전·카드는 제외"""
    if shot.get("who") in ("black", "card") or "source" in shot:
        return False
    return shot.get("gen") != "edit" or (shot.get("who") == "insert" and shot["dur"] > 0.2)


def clip_path(shot):
    """이 컷이 쓰는 클립 (재사용 컷은 원본 컷의 클립). mp4 가 없고 같은 이름의 이미지가 있으면 이미지(정지 컷)"""
    p = os.path.join(HERE, shot.get("clip") or f"clips/s{shot['n']:02d}.mp4")
    if not os.path.exists(p):
        for ext in IMG_EXT:
            if os.path.exists(p[:-4] + ext):
                return p[:-4] + ext
    return p


def make_segment(shot, length, out, args):
    n = shot["n"]
    src = clip_path(shot)
    ff = ["ffmpeg", "-y", "-v", "error"]
    if shot.get("who") == "black":
        ff += ["-f", "lavfi", "-i", f"color=black:s={W}x{H}:r={FPS}:d={length:.3f}"]
        vf = "format=yuv420p,setsar=1"
    elif shot.get("who") == "card" and not os.path.exists(src):
        ff += ["-f", "lavfi", "-i", f"color=black:s={W}x{H}:r={FPS}:d={length:.3f}"]
        vf = "format=yuv420p,setsar=1"  # 카드 글자는 자막(ASS)으로 올라감
    elif is_flash(shot) and not os.path.exists(src):
        ff += ["-f", "lavfi", "-i", f"color=white:s={W}x{H}:r={FPS}:d={length:.3f}"]  # 1~6프레임 전환 섬광(썸네일 이미지를 넣으면 그 이미지)
        vf = "format=yuv420p,setsar=1"
    elif os.path.exists(src) and src.lower().endswith(IMG_EXT):  # 정지 이미지 컷: 이미지 1장을 컷 길이만큼
        ff += ["-loop", "1", "-framerate", str(FPS), "-t", f"{length:.3f}", "-i", src]
        vf = frame_filter(shot, length)
    elif os.path.exists(src):
        ff += ["-ss", f"{src_start(src, shot.get('src_in', 0.5), length):.3f}", "-t", f"{length:.3f}", "-i", src]
        vf = frame_filter(shot, length)
    else:  # 임시 화면: 컷 번호·대상·사이즈를 크게 표시 (타이밍 검증용, 재사용 컷은 원본 번호·배율 표시)
        label = f"S{n:02d} {shot.get('who', '')} {shot.get('size', '')} {shot['dur']:.2f}s".replace(":", " ")
        if "source" in shot:
            label = f"S{n:02d} = S{shot['source']:02d} x{shot['zoom']} {shot['dur']:.2f}s"
        shot = {**shot, "placeholder": True}
        pal = ["0x2f5d8a", "0xd9a441", "0x3c8d5a", "0xb6485c", "0x6a4c93", "0xe07b39", "0x1f8a8a", "0x9c9c3a"]
        ff += ["-f", "lavfi", "-i", f"color=c={pal[n % len(pal)]}:s={W}x{H}:r={FPS}:d={length:.3f}"]
        vf = (f"drawbox=x='mod(t*600\\,{W})':y=900:w=120:h=120:color=white@0.8:t=fill,drawbox=x=0:y=380:w={W}:h=320:color=black@0.55:t=fill,"
              f"drawtext=fontfile='{esc(args.font)}':text='{label}':fontsize=96:fontcolor=white:x=(w-tw)/2:y=470,"
              + frame_filter({**shot, "frame": shot.get("frame", "full")}, length))
    ff += ["-an", "-vf", vf, "-t", f"{length:.3f}", "-c:v", "libx264", "-preset", "veryfast", "-crf", "16", out]
    run(ff)


def build_video(edl, args, tmp):
    shots = edl["shots"]
    lengths, handles = [], []
    for i, s in enumerate(shots):
        nxt = shots[i + 1] if i + 1 < len(shots) else None
        h = nxt["tr_dur"] if nxt and nxt.get("tr") in ("dissolve", "zoomblur") else 0.0
        handles.append(h)
        lengths.append(s["dur"] + h)
    segs = []
    for s, L in zip(shots, lengths):
        p = os.path.join(tmp, f"seg{s['n']:02d}.mp4")
        make_segment(s, L, p, args)
        segs.append(p)
    # 조립: 하드컷은 concat, 디졸브·줌블러는 xfade (앞 컷 끝에 핸들을 붙여 총 길이 유지)
    inputs, graph, cur, curlen = [], [], "[p0]", lengths[0]
    for i, p in enumerate(segs):
        inputs += ["-i", p]
        # 모든 입력의 시간 단위를 1/30초로 통일 (xfade 는 양쪽 timebase 가 같아야 함)
        graph.append(f"[{i}:v]fps={FPS},settb=1/{FPS},setpts=PTS-STARTPTS[p{i}]")
    for i in range(1, len(segs)):
        s = shots[i]
        out = f"[v{i}]"
        if s.get("tr") in ("dissolve", "zoomblur"):
            d = s["tr_dur"]
            kind = "fade" if s["tr"] == "dissolve" else "zoomin"
            graph.append(f"{cur}[p{i}]xfade=transition={kind}:duration={d:.3f}:offset={curlen - d:.3f},settb=1/{FPS}{out}")
            curlen += lengths[i] - d
        else:
            graph.append(f"{cur}[p{i}]concat=n=2:v=1:a=0,settb=1/{FPS}{out}")
            curlen += lengths[i]
        cur = out
    ass = os.path.join(tmp, "captions_filled.ass")
    graph.append(f"{cur}subtitles=filename='{esc(ass)}'{(':fontsdir=' + chr(39) + esc(args.fontsdir) + chr(39)) if args.fontsdir else ''}[vout]")
    script = os.path.join(tmp, "video_graph.txt")
    with open(script, "w", encoding="utf-8") as f:
        f.write(";\n".join(graph))
    outv = os.path.join(tmp, "video.mp4")
    run(["ffmpeg", "-y", "-v", "error", *inputs, graph_opt(), script, "-map", "[vout]",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), outv], timeout=1800)
    return outv, curlen


def build_audio(edl, args, tmp, total):
    parts, labels, idx = [], [], 0
    ff = ["ffmpeg", "-y", "-v", "error"]
    # 대사: voice/sNN.wav 를 해당 컷 시작에 배치
    for s in edl["shots"]:
        p = os.path.join(HERE, "voice", f"s{s['n']:02d}.wav")
        if os.path.exists(p):
            ff += ["-i", p]
            parts.append(f"[{idx}:a]adelay={int(s['t_in'] * 1000)}:all=1,aformat=sample_rates=48000:channel_layouts=stereo[vo{idx}]")
            labels.append(f"[vo{idx}]")
            idx += 1
    voice_n = len(labels)
    # 효과음: sfx_cues.csv (없으면 '삑'으로 위치 표시)
    sfx_labels = []
    with open(os.path.join(HERE, "sfx_cues.csv"), encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            t = float(row["t"])
            fp = os.path.join(HERE, "sfx", row["file"])
            if os.path.exists(fp):
                ff += ["-i", fp]
            else:
                ff += ["-f", "lavfi", "-t", "0.08", "-i", "sine=frequency=1400:sample_rate=48000"]
            parts.append(f"[{idx}:a]volume={float(row.get('vol', 0.8)):.2f},adelay={int(t * 1000)}:all=1,aformat=sample_rates=48000:channel_layouts=stereo[fx{idx}]")
            sfx_labels.append(f"[fx{idx}]")
            idx += 1
    # 무음 바탕(전체 길이 보장)
    ff += ["-f", "lavfi", "-t", f"{total:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]
    base = f"[{idx}:a]"
    idx += 1
    mix_in = [base] + labels + sfx_labels
    if args.bgm and os.path.exists(args.bgm):
        ff += ["-stream_loop", "-1", "-t", f"{total:.3f}", "-i", args.bgm]
        bg = f"[{idx}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume={args.bgm_vol:.2f}[bg]"
        parts.append(bg)
        if voice_n:
            parts.append(f"{''.join(labels)}amix=inputs={voice_n}:normalize=0,asplit=2[vsc][vmix]")
            parts.append("[bg][vsc]sidechaincompress=threshold=0.03:ratio=8:attack=5:release=300[bgd]")
            mix_in = [base, "[vmix]", "[bgd]"] + sfx_labels
        else:
            mix_in = [base, "[bg]"] + sfx_labels
        idx += 1
    parts.append(f"{''.join(mix_in)}amix=inputs={len(mix_in)}:normalize=0:duration=first,loudnorm=I=-14:TP=-1:LRA=11[aout]")
    script = os.path.join(tmp, "audio_graph.txt")
    with open(script, "w", encoding="utf-8") as f:
        f.write(";\n".join(parts))
    outa = os.path.join(tmp, "audio.m4a")
    run(ff + [graph_opt(), script, "-map", "[aout]", "-t", f"{total:.3f}", "-c:a", "aac", "-b:a", "192k", outa])
    return outa


def verify(out, edl):
    """완성 영상에서 컷을 다시 검출해 EDL과 비교 (±2프레임 허용)."""
    try:
        import cv2, numpy as np
    except ImportError:
        print("검증 생략: opencv-python 필요 (pip install opencv-python)")
        return
    cap = cv2.VideoCapture(out)
    prev, diffs = None, []
    while True:
        ok, fr = cap.read()
        if not ok:
            break
        g = cv2.resize(fr, (320, 180)).astype("float32")  # 컬러 그대로 비교 (색만 바뀌는 컷도 검출)
        diffs.append(0.0 if prev is None else float(np.mean(np.abs(g - prev))))
        prev = g
    d = np.array(diffs)
    thr = max(np.percentile(d, 90) * 2.0, 8.0)
    found = [i / FPS for i in range(1, len(d)) if d[i] >= thr and d[i] == d[max(1, i - 3): i + 4].max()]
    expect = [s["t_in"] for s in edl["shots"][1:] if s.get("tr") == "cut"]
    ok = sum(1 for t in expect if any(abs(t - f) <= 2 / FPS + 1e-6 for f in found))
    print(f"컷 검증: 하드컷 {len(expect)}개 중 {ok}개가 ±2프레임 이내에서 검출됨 (디졸브·암전 구간은 제외)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", default="OO", help="자막 속 {이름} 치환")
    ap.add_argument("--pun", default="달", help="자막 속 {PUN} 치환 (동물 말장난 글자)")
    ap.add_argument("--bgm", default=os.path.join(HERE, "audio", "bgm.mp3"))
    ap.add_argument("--bgm-vol", type=float, default=0.35)
    ap.add_argument("--font", default="C:/Windows/Fonts/malgunbd.ttf", help="임시 화면 번호용 폰트")
    ap.add_argument("--fontsdir", default=os.path.join(HERE, "fonts") if os.path.isdir(os.path.join(HERE, "fonts")) else "")
    ap.add_argument("--check", action="store_true")
    ap.add_argument("--verify", action="store_true")
    ap.add_argument("--keep", action="store_true", help="중간 파일 보존")
    args = ap.parse_args()
    if not shutil.which("ffmpeg"):
        raise SystemExit("ffmpeg 가 PATH 에 없습니다")
    edl = json.load(open(os.path.join(HERE, "edl.json"), encoding="utf-8"))
    need = [s for s in edl["shots"] if needs_file(s)]
    clips = sorted({s.get("clip") or f"clips/s{s['n']:02d}.mp4" for s in need})  # 재사용 컷은 원본 클립 하나로 해결
    missing = [c for c in clips if not os.path.exists(clip_path({"n": 0, "clip": c}))]
    reused = sum(1 for s in edl["shots"] if "source" in s)
    print(f"{edl['title']} | 컷 {len(edl['shots'])}개 | 총 {edl['duration']:.2f}초 | 필요한 원본 클립 {len(clips)}개"
          f"(재사용 컷 {reused}개는 원본을 잘라 확대) 중 누락 {len(missing)}개")
    if args.check:
        for m in missing:
            feeds = [f"s{s['n']:02d}" for s in edl["shots"] if s.get("clip") == m and "source" in s]
            own = next((s for s in need if (s.get("clip") or f"clips/s{s['n']:02d}.mp4") == m), {})
            kind = " [직접 만드는 화면: 그래픽·본인 녹화]" if own.get("gen") == "edit" else (" [정지 이미지 가능: .png]" if own.get("gen") == "still" else "")
            print("  누락:", m + kind, f"(이 클립으로 {', '.join(feeds)} 도 만듦)" if feeds else "")
        return
    tmp = os.path.join(HERE, "out", "_tmp")
    os.makedirs(tmp, exist_ok=True)
    with open(os.path.join(HERE, "captions.ass"), encoding="utf-8-sig") as f:
        ass = f.read().replace("{이름}", args.name).replace("{PUN}", args.pun)
    with open(os.path.join(tmp, "captions_filled.ass"), "w", encoding="utf-8-sig") as f:
        f.write(ass)
    video, total = build_video(edl, args, tmp)
    audio = build_audio(edl, args, tmp, total)
    out = os.path.join(HERE, "out", f"{edl['key']}_final.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "copy",
         "-movflags", "+faststart", "-shortest", out])
    print(f"완성: {out}  (길이 {total:.2f}초 / 목표 {edl['duration']:.2f}초)")
    if args.verify:
        verify(out, edl)
    if not args.keep:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
