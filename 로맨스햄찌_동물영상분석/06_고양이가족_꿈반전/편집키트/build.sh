#!/usr/bin/env bash
# 아빠가 헬기에서 엄마를 던졌다… 알고 보니 꿈(현실은 침대에서 발로 참) — 재조립 스크립트 (Git Bash에서 실행)
# 폴더 구조: clips/shot01.mp4 … (AI로 생성한 원본), audio/bgm.mp3, sfx/sfx01.wav …, subs.srt, fonts/Pretendard-Bold.ttf
set -euo pipefail
mkdir -p norm

# ① 규격 통일: 1080x1920 · 30fps · SAR1 · 소리 제거 + 필요한 길이만큼만 트림
ffmpeg -y -i clips/shot01.mp4 -t 16.45 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s01.mp4   # 화면 15.15s + 전환여유 1.3s
ffmpeg -y -i clips/shot02.mp4 -t 13.87 -vf "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1,format=yuv420p" -an -c:v libx264 -crf 16 -preset slow norm/s02.mp4   # 화면 13.87s + 전환여유 0.0s

# ② 컷/디졸브 조립 + 색보정  (완성 길이 ≈ 29.02s)
ffmpeg -y -i norm/s01.mp4 -i norm/s02.mp4 -filter_complex "[0:v]setpts=PTS-STARTPTS[v1];[1:v]setpts=PTS-STARTPTS[v2];[v1][v2]xfade=transition=fade:duration=1.3:offset=15.15[j1];[j1]eq=contrast=1.03:saturation=1.05[vout]" -map "[vout]" -c:v libx264 -crf 17 -preset slow -pix_fmt yuv420p video_only.mp4

# ③ 사운드: BGM(-dB 베이스) + 효과음을 타임코드에 정확히 배치 → -14 LUFS (쇼츠/릴스 표준)
ffmpeg -y -i audio/bgm.mp3 -i sfx/sfx01.wav -i sfx/sfx02.wav -i sfx/sfx03.wav -i sfx/sfx04.wav -i sfx/sfx05.wav -i sfx/sfx06.wav -i sfx/sfx07.wav -i sfx/sfx08.wav -i sfx/sfx09.wav -filter_complex "[0:a]atrim=0:29.02,volume=-6dB,afade=t=out:st=28.22:d=0.8[bgm];[1:a]adelay=0|0,volume=0dB[s1];[2:a]adelay=2600|2600,volume=0dB[s2];[3:a]adelay=11800|11800,volume=0dB[s3];[4:a]adelay=13600|13600,volume=0dB[s4];[5:a]adelay=14500|14500,volume=0dB[s5];[6:a]adelay=15600|15600,volume=0dB[s6];[7:a]adelay=20400|20400,volume=0dB[s7];[8:a]adelay=24400|24400,volume=0dB[s8];[9:a]adelay=27400|27400,volume=0dB[s9];[bgm][s1][s2][s3][s4][s5][s6][s7][s8][s9]amix=inputs=10:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[aout]" -map "[aout]" -ar 48000 mix.wav

# ④ 합치기 (인스타/쇼츠 업로드용: H.264 High, AAC 320k, faststart)
ffmpeg -y -i video_only.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -shortest -movflags +faststart final.mp4
