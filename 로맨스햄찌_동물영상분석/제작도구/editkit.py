"""Generate FFmpeg scripts, SRT subtitles and HyperFrames compositions from shot data."""

W, H, FPS = 1080, 1920, 30


def trans_of(shot: dict) -> tuple:
    """Return (xfade_name, seconds) for the transition OUT of a shot; ('cut', 0) for hard cuts."""
    t = shot.get("trans", "cut")
    if isinstance(t, dict):
        return t.get("type", "fade"), float(t.get("d", 0.5))
    return t, 0.0


def clip_plan(v: dict) -> list:
    """One generated clip per shot group (beats joined by 'none' are one continuous take).

    Generation length = on-screen time + overlap it must donate to the next xfade.
    """
    groups, cur = [], []
    for s in v["shots"]:
        cur.append(s)
        if trans_of(s)[0] != "none":
            groups.append(cur)
            cur = []
    if cur:
        groups.append(cur)
    plan = []
    for i, g in enumerate(groups, 1):
        name, d = trans_of(g[-1])
        name = "cut" if name in ("end", "none") else name
        seen = round(g[-1]["t1"] - g[0]["t0"], 2)
        need = round(seen + (d if name != "cut" else 0), 2)
        black = all(x.get("black") for x in g)
        plan.append({"i": i, "seen": seen, "need": need, "trans": name, "d": d, "black": black})
    return plan


def fmt_srt_time(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def srt(v: dict) -> str:
    lines = []
    for k, (t0, t1, text) in enumerate(v.get("subs", []), 1):
        lines += [str(k), f"{fmt_srt_time(t0)} --> {fmt_srt_time(t1)}", text, ""]
    return "\n".join(lines)


def video_chain(plan: list) -> tuple:
    """Build the filter_complex video chain: concat for cuts, xfade for dissolves."""
    parts, cur, length = [], "[v1]", plan[0]["need"]
    for k in range(1, len(plan)):
        prev, nxt = plan[k - 1], f"[v{k + 1}]"
        out = f"[j{k}]"
        if prev["trans"] == "cut":
            parts.append(f"{cur}{nxt}concat=n=2:v=1:a=0{out}")
            length += plan[k]["need"]
        else:
            off = round(length - prev["d"], 3)
            parts.append(f"{cur}{nxt}xfade=transition={prev['trans']}:duration={prev['d']}:offset={off}{out}")
            length += plan[k]["need"] - prev["d"]
        cur = out
    return parts, cur, round(length, 2)


def ffmpeg_script(v: dict) -> str:
    plan = clip_plan(v)
    n = len(plan)
    norm = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
            f"fps={FPS},setsar=1,format=yuv420p")
    lines = [
        "#!/usr/bin/env bash",
        f"# {v['title']} — 재조립 스크립트 (Git Bash에서 실행)",
        "# 폴더 구조: clips/shot01.mp4 … (AI로 생성한 원본), audio/bgm.mp3, sfx/sfx01.wav …, subs.srt, fonts/Pretendard-Bold.ttf",
        "set -euo pipefail",
        "mkdir -p norm",
        "",
        "# ① 규격 통일: 1080x1920 · 30fps · SAR1 · 소리 제거 + 필요한 길이만큼만 트림",
    ]
    for p in plan:
        src = (f"-f lavfi -i color=c=black:s={W}x{H}:r={FPS}" if p["black"]
               else f'-i clips/shot{p["i"]:02d}.mp4')
        lines.append(
            f'ffmpeg -y {src} -t {p["need"]} -vf "{norm}" '
            f'-an -c:v libx264 -crf 16 -preset slow norm/s{p["i"]:02d}.mp4   '
            f'# 화면 {p["seen"]}s + 전환여유 {round(p["need"] - p["seen"], 2)}s')
    chain, last, total = video_chain(plan)
    inputs = " ".join(f"-i norm/s{p['i']:02d}.mp4" for p in plan)
    labels = ";".join(f"[{k}:v]setpts=PTS-STARTPTS[v{k + 1}]" for k in range(n))
    grade = v.get("grade", "null")
    sub = ""
    if v.get("subs"):
        sub = (",subtitles=subs.srt:fontsdir=fonts:force_style='FontName=Pretendard,FontSize=13,"
               "PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=1,Outline=2,"
               "Shadow=0,Alignment=2,MarginV=80'")
    fc = ";".join([labels, *chain, f"{last}{grade}{sub}[vout]"])
    lines += [
        "",
        f"# ② 컷/디졸브 조립 + 색보정{' + 자막' if sub else ''}  (완성 길이 ≈ {total}s)",
        f'ffmpeg -y {inputs} -filter_complex "{fc}" -map "[vout]" '
        "-c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p video_only.mp4",
    ]
    lines += audio_lines(v, total)
    lines += [
        "",
        "# ④ 합치기 (인스타/쇼츠 업로드용: H.264 High, AAC 320k, faststart)",
        "ffmpeg -y -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k "
        "-shortest -movflags +faststart final.mp4",
    ]
    return "\n".join(lines)


def audio_lines(v: dict, total: float) -> list:
    sfx = v["audio"].get("sfx", [])
    ins = ["-i audio/bgm.mp3"] + [f"-i sfx/sfx{k:02d}.wav" for k in range(1, len(sfx) + 1)]
    duck = v["audio"].get("bgm_db", -6)
    fc = [f"[0:a]atrim=0:{total},volume={duck}dB,afade=t=out:st={max(total - 0.8, 0):.2f}:d=0.8[bgm]"]
    mix = ["[bgm]"]
    for k, (t, _desc, _prompt) in enumerate(sfx, 1):
        ms = int(round(t * 1000))
        fc.append(f"[{k}:a]adelay={ms}|{ms},volume=0dB[s{k}]")
        mix.append(f"[s{k}]")
    fc.append(f"{''.join(mix)}amix=inputs={len(mix)}:normalize=0,"
              f"loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
    return [
        "",
        "# ③ 사운드: BGM(-dB 베이스) + 효과음을 타임코드에 정확히 배치 → -14 LUFS (쇼츠/릴스 표준)",
        f'ffmpeg -y {" ".join(ins)} -filter_complex "{";".join(fc)}" -map "[aout]" -ar 48000 mix.wav',
    ]


def hyperframes_html(v: dict) -> str:
    plan = clip_plan(v)
    cid = f"ref{v['id']}"
    total, t, rows, tweens = 0.0, 0.0, [], []
    for k, p in enumerate(plan):
        start = round(t, 3)
        track = k % 2
        if p["black"]:
            t, total = start + p["need"], start + p["need"]
            continue
        rows.append(
            f'      <div id="w{p["i"]:02d}" class="inner">\n'
            f'        <video id="s{p["i"]:02d}" src="clips/shot{p["i"]:02d}.mp4" data-start="{start}" '
            f'data-duration="{p["need"]}" data-track-index="{track}" muted playsinline></video>\n'
            f'      </div>')
        if k > 0 and plan[k - 1]["trans"] != "cut":
            d = plan[k - 1]["d"]
            tweens.append(f'      tl.fromTo("#w{p["i"]:02d}", {{ opacity: 0 }}, '
                          f'{{ opacity: 1, duration: {d}, ease: "none" }}, {start});')
        t = start + p["need"] - (p["d"] if p["trans"] != "cut" else 0)
        total = start + p["need"]
    total = round(total, 2)
    auds = [f'      <audio id="bgm" src="audio/bgm.mp3" data-start="0" data-duration="{total}" '
            f'data-track-index="10" data-volume="0.5"></audio>']
    for k, (st, desc, _p) in enumerate(v["audio"].get("sfx", []), 1):
        auds.append(f'      <audio id="sfx{k:02d}" src="sfx/sfx{k:02d}.wav" data-start="{st}" '
                    f'data-duration="2" data-track-index="{10 + k}"></audio>  <!-- {desc} -->')
    body = "\n".join(rows + auds)
    tw = "\n".join(tweens) or "      // 전부 하드컷 — 트윈 불필요"
    return f"""<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width={W}, height={H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {{ margin: 0; background: #000; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; }}
      .inner {{ position: absolute; inset: 0; }}
      .inner video {{ width: 100%; height: 100%; object-fit: cover; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="{cid}" data-start="0" data-width="{W}" data-height="{H}" data-duration="{total}">
{body}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
{tw}
      window.__timelines["{cid}"] = tl;
    </script>
  </body>
</html>"""
