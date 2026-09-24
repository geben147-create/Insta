#!/usr/bin/env bash
# 완벽한 윙 아이라인 → 뒤돌면 대참사 — 재조립 스크립트 (Git Bash에서 실행)
# 폴더 구조: clips/shot01.mp4 … (AI로 생성한 원본), audio/bgm.mp3, sfx/sfx01.wav …, subs.srt, fonts/Pretendard-Bold.ttf
set -euo pipefail
mkdir -p norm

# ① 규격 통일: 1080x1920 · 30fps · SAR1 · 소리 제거 + 필요한 길이만큼만 트림
ffmpeg -y -i clips/shot01.mp4 -t 8.01 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s01.mp4   # 화면 8.01s + 전환여유 0.0s

# ② 컷/디졸브 조립 + 색보정  (완성 길이 ≈ 8.01s)
ffmpeg -y -i norm/s01.mp4 -filter_complex "[0:v]setpts=PTS-STARTPTS[v1];[v1]eq=contrast=1.05:saturation=1.1,colorbalance=rm=0.04:bm=-0.02,vignette=PI/6,unsharp=5:5:0.5[vout]" -map "[vout]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p video_only.mp4

# ③ 사운드: BGM(-dB 베이스) + 효과음을 타임코드에 정확히 배치 → -14 LUFS (쇼츠/릴스 표준)
ffmpeg -y -i audio/bgm.mp3 -i sfx/sfx01.wav -i sfx/sfx02.wav -i sfx/sfx03.wav -i sfx/sfx04.wav -filter_complex "[0:a]atrim=0:8.01,volume=-4dB,afade=t=out:st=7.21:d=0.8[bgm];[1:a]adelay=400|400,volume=0dB[s1];[2:a]adelay=1900|1900,volume=0dB[s2];[3:a]adelay=3900|3900,volume=0dB[s3];[4:a]adelay=4050|4050,volume=0dB[s4];[bgm][s1][s2][s3][s4]amix=inputs=5:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]" -map "[aout]" -ar 48000 mix.wav

# ④ 합치기 (인스타/쇼츠 업로드용: H.264 High, AAC 320k, faststart)
ffmpeg -y -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart final.mp4
