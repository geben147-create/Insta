# -*- coding: utf-8 -*-
"""FFmpeg / HyperFrames / ASS recipe text builders (derived from measured shot timings)."""
import json

GRADE_DF = ("colorbalance=rs=0.05:gs=0.01:bs=-0.05:rm=0.03:bm=-0.03,"
            "eq=contrast=1.04:saturation=0.88:gamma=0.98,"
            "curves=all='0/0.035 0.25/0.24 0.75/0.77 1/0.97',"
            "split[base][glow];[glow]curves=all='0/0 0.72/0 1/1',gblur=sigma=18,"
            "colorchannelmixer=rr=1:gg=0.35:bb=0.2[hal];[base][hal]blend=all_mode=screen:all_opacity=0.22,"
            "noise=alls=9:allf=t+u,vignette=angle=PI/5")
GRADE_SM = "eq=contrast=1.02:saturation=0.93,unsharp=5:5:0.35,noise=alls=4:allf=t"
SHAKE = "crop=iw-48:ih-48:24+10*sin(2*PI*t*1.3)+4*sin(2*PI*t*7):24+8*cos(2*PI*t*1.1)+3*sin(2*PI*t*9),scale=1080:1920"
NORM = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1"


def edit_shots(page):
    shots = [s for s in page["shots"] if s["img"]]
    if page.get("single_take"):
        first = dict(shots[0])
        first.update({"t1": shots[-1]["t1"], "size": "CU 단일 테이크", "sfx": "—"})
        return [first]
    return shots


def shot_vf(page, i, s):
    if page["key"] == "sm2":
        return ("split[bg][fg];[bg]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,gblur=sigma=40[bg2];"
                "[fg]scale=1080:-2[fg2];[bg2][fg2]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1")
    if page.get("rotate") and "90°" in s["angle"]:
        return "transpose=1," + NORM
    vf = NORM
    if "셀카" in s["size"]:
        vf += "," + SHAKE
    return vf


def ffmpeg_recipe(page):
    shots = edit_shots(page)
    dur = page["shots"][-1]["t1"]
    grade = GRADE_SM if page["key"].startswith("sm") else GRADE_DF
    L = [f"# ===== {page['title']} — FFmpeg 재현 레시피 (총 {dur:.2f}s, 샷 {len(shots)}개) =====",
         "# 폴더 구조: shots/s01.mp4 … (AI로 생성한 원본 클립), audio/bgm.mp3, vo/dialogue.wav(대사 있을 때), sfx/sNN.wav",
         "# 모든 명령은 창 없이 현재 셸에서 실행. 1080x1920 · 30fps · H.264 · yuv420p",
         "", "# ---- 1) 샷별 정확한 길이로 자르기 + 규격 통일 (실측 컷 타이밍 그대로) ----", "mkdir -p cut"]
    for i, s in enumerate(shots, 1):
        d = s["t1"] - s["t0"]
        L.append(f"ffmpeg -y -nostdin -i shots/s{i:02d}.mp4 -t {d:.2f} -vf \"{shot_vf(page, i, s)}\" "
                 f"-an -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p cut/s{i:02d}.mp4   # {s['t0']:.2f}~{s['t1']:.2f}s {s['size']}")
    L += ["", "# ---- 2) 하드컷으로 이어 붙이기 (원본 전환은 거의 전부 하드컷) ----",
          "rm -f list.txt; for f in cut/s*.mp4; do echo \"file '$f'\" >> list.txt; done",
          "ffmpeg -y -nostdin -f concat -safe 0 -i list.txt -c copy assembled.mp4", "",
          "# ---- 3) 룩(색보정·필름 입자·할레이션·비네팅) ----",
          f"ffmpeg -y -nostdin -i assembled.mp4 -filter_complex \"[0:v]{grade}[v]\" -map \"[v]\" -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p graded.mp4"]
    if page["key"] == "sm2":
        L += ["", "# ---- 3-1) 6.5초부터 느린 푸시인 (+12%) ----",
              "ffmpeg -y -nostdin -i graded.mp4 -vf \"zoompan=z='if(lte(on,195),1,min(1+(on-195)*0.0011,1.12))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1080x1920:fps=30\" -c:v libx264 -crf 16 graded_push.mp4"]
    if page.get("rotate"):
        L += ["", "# ---- 3-2) (선택) 폰 낙하 전환을 AI 대신 합성할 때: 전환 직전 1.2초를 90° 회전+모션블러 ----",
              "ffmpeg -y -nostdin -i cut/s_fall_src.mp4 -vf \"rotate='min(t/0.8,1)*PI/2':ow=hypot(iw,ih):oh=ow:c=black,tmix=frames=6:weights='1 1 1 1 1 1',"
              "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920\" -t 1.2 -an cut/s_fall.mp4"]
    L += ["", "# ---- 4) 사운드: BGM + 효과음 타이밍 + (대사) + 덕킹 + 라우드니스 -14 LUFS ----"]
    sfx = [(i, s) for i, s in enumerate(shots, 1) if s["sfx"] not in ("—", "")]
    has_vo = any(s["line"] not in ("—", "없음", "없음 (음악)") for s in shots)
    inputs = "-i graded.mp4 -i audio/bgm.mp3" + (" -i vo/dialogue.wav" if has_vo else "")
    base = 3 if has_vo else 2
    fc = [f"[1:a]atrim=0:{dur:.2f},afade=t=in:d=0.3,afade=t=out:st={dur - 0.8:.2f}:d=0.8,volume=0.8[bgm]"]
    mix = []
    if has_vo:
        fc.append("[2:a]asplit[vo][key]")
        fc.append("[bgm][key]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=300[bgmd]")
        mix += ["[bgmd]", "[vo]"]
    else:
        mix.append("[bgm]")
    for k, (i, s) in enumerate(sfx[:12]):
        inputs += f" -i sfx/s{i:02d}.wav"
        ms = int(s["t0"] * 1000)
        fc.append(f"[{base + k}:a]adelay={ms}|{ms},volume=0.9[x{i}]")
        mix.append(f"[x{i}]")
    fc.append("".join(mix) + f"amix=inputs={len(mix)}:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]")
    L.append(f"ffmpeg -y -nostdin {inputs} -filter_complex \"" + ";".join(fc) +
             "\" -map 0:v -map \"[aout]\" -c:v copy -c:a aac -b:a 192k -shortest final.mp4")
    L.append("#   효과음 목록(샷 시작 시각 기준): " + " | ".join(f"s{i:02d}@{s['t0']:.2f}s {s['sfx']}" for i, s in sfx))
    if has_vo:
        L += ["", "# ---- 5) (선택) 자막 번인 — dreamfall 스타일(흰 산세리프, 화면 높이 82% 지점, 은은한 그림자) ----",
              "ffmpeg -y -nostdin -i final.mp4 -vf \"ass=subs.ass\" -c:a copy final_sub.mp4"]
    return "\n".join(L)


def ass_subs(page):
    lines = [s for s in page["shots"] if s["line"] not in ("—", "없음", "없음 (음악)", "(대사)", "(통화 대사)", "(헉)", "(전화벨)") and s["img"]]
    if not lines:
        return ""

    def ts(t):
        h, m, sec = int(t // 3600), int(t % 3600 // 60), t % 60
        return f"{h}:{m:02d}:{sec:05.2f}"
    out = ["[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920", "",
           "[V4+ Styles]",
           "Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Alignment, MarginL, MarginR, MarginV, BorderStyle, Outline, Shadow",
           "Style: DF,Helvetica Neue,54,&H00FFFFFF,&H00000000,&H64000000,0,2,80,80,345,1,0,2", "",
           "[Events]", "Format: Layer, Start, End, Style, Text"]
    for s in lines:
        text = s["line"].replace("\"", "").replace("(여) ", "").replace("(남) ", "").replace("(금발) ", "")
        out.append(f"Dialogue: 0,{ts(s['t0'] + 0.1)},{ts(s['t1'] - 0.05)},DF,{text}")
    return "\n".join(out)


def hyperframes(page):
    shots = edit_shots(page)
    dur = page["shots"][-1]["t1"]
    cid = f"remake-{page['key']}"
    vids, auds, caps = [], [], []
    for i, s in enumerate(shots, 1):
        d = s["t1"] - s["t0"]
        vids.append(f'      <video id="s{i:02d}" class="clip" src="cut/s{i:02d}.mp4" data-start="{s["t0"]:.2f}" '
                    f'data-duration="{d:.2f}" data-media-start="0" data-track-index="0" muted playsinline></video>')
        if s["sfx"] not in ("—", ""):
            auds.append(f'      <audio id="sfx{i:02d}" src="sfx/s{i:02d}.wav" data-start="{s["t0"]:.2f}" '
                        f'data-duration="{min(d, 2.0):.2f}" data-track-index="{11 + i % 3}" data-volume="0.9"></audio>')
    duck = [{"t": 0, "v": 0}, {"t": 0.3, "v": 0.8}]
    for s in shots:
        if s["line"] not in ("—", "없음", "없음 (음악)", "(헉)", "(전화벨)"):
            duck += [{"t": round(s["t0"], 2), "v": 0.8}, {"t": round(s["t0"] + 0.2, 2), "v": 0.3},
                     {"t": round(s["t1"] - 0.2, 2), "v": 0.3}, {"t": round(s["t1"], 2), "v": 0.8}]
    duck += [{"t": round(dur - 0.8, 2), "v": 0.8}, {"t": round(dur, 2), "v": 0}]
    duck = sorted({p["t"]: p for p in duck}.values(), key=lambda p: p["t"])
    lane = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": duck}]}, ensure_ascii=False)
    for i, s in enumerate(shots, 1):
        if s["line"].startswith(("\"", "(여)", "(남)", "(금발)", "(여·")):
            txt = s["line"].replace("\"", "&quot;")
            caps.append(f'      <div id="cap{i:02d}" class="clip cap" data-start="{s["t0"] + 0.1:.2f}" '
                        f'data-duration="{s["t1"] - s["t0"] - 0.15:.2f}" data-track-index="20"><span id="cap{i:02d}-t">{txt}</span></div>')
    gs = "\n".join(f'      tl.fromTo("#cap{c.split("cap")[1][:2]}-t", {{opacity: 0, y: 12}}, {{opacity: 1, y: 0, duration: 0.25, ease: "power2.out"}}, '
                   f'{float(c.split("data-start=")[1].split(chr(34))[1]):.2f});' for c in caps)
    return f"""<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      body {{ margin: 0; background: #000; }}
      #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #000; }}
      video.clip {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
      #grain {{ mix-blend-mode: overlay; opacity: 0.35; }}
      .cap {{ position: absolute; left: 0; right: 0; top: 78%; display: flex; justify-content: center; }}
      .cap span {{ display: block; color: #fff; font: 500 50px/1.2 system-ui, sans-serif; text-shadow: 0 2px 8px rgba(0,0,0,.6); padding: 0 80px; text-align: center; }}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="{cid}" data-start="0" data-width="1080" data-height="1920" data-duration="{dur:.2f}">
      <!-- 트랙0: 샷 (FFmpeg 1단계에서 잘라 규격 통일한 cut/ 파일 · 회전 샷도 미리 회전해 둘 것) -->
{chr(10).join(vids)}
      <!-- 트랙5: 필름 그레인 오버레이 (미리 렌더한 1080x1920 그레인 루프 영상) -->
      <video id="grain" class="clip" src="fx/grain_1080x1920.mp4" data-start="0" data-duration="{dur:.2f}" data-media-start="0" data-track-index="5" muted playsinline></video>
      <!-- 트랙10: BGM (대사 구간 자동 덕킹 = data-automation 볼륨 레인) -->
      <audio id="bgm" src="audio/bgm.mp3" data-start="0" data-duration="{dur:.2f}" data-media-start="0" data-track-index="10" data-volume="1"
        data-automation='{lane}'></audio>
{chr(10).join(auds)}
      <!-- 트랙20: (선택) 자막 -->
{chr(10).join(caps) if caps else '      <!-- 대사 없음 -->'}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
{gs if gs else '      // 자막 애니메이션 없음'}
      window.__timelines["{cid}"] = tl;
    </script>
  </body>
</html>"""
