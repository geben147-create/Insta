#!/usr/bin/env bash
# 마사지 받던 돼지고기가 돈까스 정식이 되기까지 — 재조립 스크립트 (Git Bash에서 실행)
# 폴더 구조: clips/shot01.mp4 … (AI로 생성한 원본), audio/bgm.mp3, sfx/sfx01.wav …, subs.srt, fonts/Pretendard-Bold.ttf
set -euo pipefail
mkdir -p norm

# ① 규격 통일: 1080x1920 · 30fps · SAR1 · 소리 제거 + 필요한 길이만큼만 트림
ffmpeg -y -i clips/shot01.mp4 -t 7.6 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s01.mp4   # 화면 7.6s + 전환여유 0.0s
ffmpeg -y -i clips/shot02.mp4 -t 1.47 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s02.mp4   # 화면 1.47s + 전환여유 0.0s
ffmpeg -y -i clips/shot03.mp4 -t 3.1 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s03.mp4   # 화면 3.1s + 전환여유 0.0s
ffmpeg -y -i clips/shot04.mp4 -t 1.6 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s04.mp4   # 화면 1.6s + 전환여유 0.0s
ffmpeg -y -i clips/shot05.mp4 -t 1.16 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s05.mp4   # 화면 1.16s + 전환여유 0.0s
ffmpeg -y -i clips/shot06.mp4 -t 5.34 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s06.mp4   # 화면 5.34s + 전환여유 0.0s

# ② 컷/디졸브 조립 + 색보정  (완성 길이 ≈ 20.27s)
ffmpeg -y -i norm/s01.mp4 -i norm/s02.mp4 -i norm/s03.mp4 -i norm/s04.mp4 -i norm/s05.mp4 -i norm/s06.mp4 -filter_complex "[0:v]setpts=PTS-STARTPTS[v1];[1:v]setpts=PTS-STARTPTS[v2];[2:v]setpts=PTS-STARTPTS[v3];[3:v]setpts=PTS-STARTPTS[v4];[4:v]setpts=PTS-STARTPTS[v5];[5:v]setpts=PTS-STARTPTS[v6];[v1][v2]concat=n=2:v=1:a=0[j1];[j1][v3]concat=n=2:v=1:a=0[j2];[j2][v4]concat=n=2:v=1:a=0[j3];[j3][v5]concat=n=2:v=1:a=0[j4];[j4][v6]concat=n=2:v=1:a=0[j5];[j5]eq=contrast=1.04:saturation=1.1,colorbalance=rh=0.05:gh=0.02:bh=-0.03,vignette=PI/8[vout]" -map "[vout]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p video_only.mp4

# ③ 사운드: BGM(-dB 베이스) + 효과음을 타임코드에 정확히 배치 → -14 LUFS (쇼츠/릴스 표준)
ffmpeg -y -i audio/bgm.mp3 -i sfx/sfx01.wav -i sfx/sfx02.wav -i sfx/sfx03.wav -i sfx/sfx04.wav -i sfx/sfx05.wav -i sfx/sfx06.wav -i sfx/sfx07.wav -i sfx/sfx08.wav -i sfx/sfx09.wav -i sfx/sfx10.wav -i sfx/sfx11.wav -filter_complex "[0:a]atrim=0:20.27,volume=-14dB,afade=t=out:st=19.47:d=0.8[bgm];[1:a]adelay=300|300,volume=0dB[s1];[2:a]adelay=4000|4000,volume=0dB[s2];[3:a]adelay=5500|5500,volume=0dB[s3];[4:a]adelay=6500|6500,volume=0dB[s4];[5:a]adelay=9300|9300,volume=0dB[s5];[6:a]adelay=11500|11500,volume=0dB[s6];[7:a]adelay=12200|12200,volume=0dB[s7];[8:a]adelay=13800|13800,volume=0dB[s8];[9:a]adelay=16500|16500,volume=0dB[s9];[10:a]adelay=18200|18200,volume=0dB[s10];[11:a]adelay=19600|19600,volume=0dB[s11];[bgm][s1][s2][s3][s4][s5][s6][s7][s8][s9][s10][s11]amix=inputs=12:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]" -map "[aout]" -ar 48000 mix.wav

# ④ 합치기 (인스타/쇼츠 업로드용: H.264 High, AAC 320k, faststart)
ffmpeg -y -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart final.mp4
