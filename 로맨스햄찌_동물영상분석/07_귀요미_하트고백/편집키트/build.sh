#!/usr/bin/env bash
# 벽 뒤에서 기다리다 하트를 내미는 모찌 캐릭터 — 재조립 스크립트 (Git Bash에서 실행)
# 폴더 구조: clips/shot01.mp4 … (AI로 생성한 원본), audio/bgm.mp3, sfx/sfx01.wav …, subs.srt, fonts/Pretendard-Bold.ttf
set -euo pipefail
mkdir -p norm

# ① 규격 통일: 1080x1920 · 30fps · SAR1 · 소리 제거 + 필요한 길이만큼만 트림
ffmpeg -y -i clips/shot01.mp4 -t 9.59 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s01.mp4   # 화면 9.59s + 전환여유 0.0s

# ② 컷/디졸브 조립 + 색보정  (완성 길이 ≈ 9.59s)
ffmpeg -y -i norm/s01.mp4 -filter_complex "[0:v]setpts=PTS-STARTPTS[v1];[v1]eq=contrast=1.02:saturation=1.1:gamma=1.03,colorbalance=rh=0.04:gh=0.02:bs=0.03,vignette=PI/7[vout]" -map "[vout]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p video_only.mp4

# ③ 사운드: BGM(-dB 베이스) + 효과음을 타임코드에 정확히 배치 → -14 LUFS (쇼츠/릴스 표준)
ffmpeg -y -i audio/bgm.mp3 -i sfx/sfx01.wav -i sfx/sfx02.wav -i sfx/sfx03.wav -filter_complex "[0:a]atrim=0:9.59,volume=-2dB,afade=t=out:st=8.79:d=0.8[bgm];[1:a]adelay=900|900,volume=0dB[s1];[2:a]adelay=3400|3400,volume=0dB[s2];[3:a]adelay=7000|7000,volume=0dB[s3];[bgm][s1][s2][s3]amix=inputs=4:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]" -map "[aout]" -ar 48000 mix.wav

# ④ 합치기 (인스타/쇼츠 업로드용: H.264 High, AAC 320k, faststart)
ffmpeg -y -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart final.mp4
