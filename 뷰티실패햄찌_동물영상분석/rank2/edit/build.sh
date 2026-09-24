#!/usr/bin/env bash
# A2O May - Shijie · Going Out — remake assembly script (auto-generated from measured cut list)
# Put generated clips in ./clips as s01.mp4, s02.mp4 ... (one file per shot, any length >= target).
# Stills (cover frame / no-video shots) go in ./clips as sNN.png.
set -euo pipefail
W=1920; H=1080; FPS=30
mkdir -p work
norm() {  # $1=input  $2=exact duration  $3=output   -> exact-length H.264 + 48k stereo AAC
  local in="$1" dur="$2" out="$3" vf="scale=$W:$H:force_original_aspect_ratio=increase,crop=$W:$H,fps=$FPS,setsar=1,format=yuv420p"
  if [[ "$in" == *.png ]]; then
    ffmpeg -nostdin -y -loop 1 -i "$in" -f lavfi -i anullsrc=r=48000:cl=stereo -t "$dur" -vf "$vf" \
      -map 0:v -map 1:a -c:v libx264 -crf 16 -preset slow -c:a aac -b:a 192k "$out"
  elif ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$in" | grep -q .; then
    ffmpeg -nostdin -y -i "$in" -t "$dur" -vf "$vf" -af "aresample=48000,apad" \
      -map 0:v:0 -map 0:a:0 -c:v libx264 -crf 16 -preset slow -c:a aac -b:a 192k -ac 2 "$out"
  else  # model returned silent video -> add silent track so concat never breaks
    ffmpeg -nostdin -y -i "$in" -f lavfi -i anullsrc=r=48000:cl=stereo -t "$dur" -vf "$vf" \
      -map 0:v:0 -map 1:a -c:v libx264 -crf 16 -preset slow -c:a aac -b:a 192k "$out"
  fi
}

# 1) 컷 길이를 원본과 프레임 단위로 동일하게 맞춤 (측정값)
norm clips/s01.mp4 2.623 work/n01.mp4   # 0.000-2.623  POV (거울) CU
norm clips/s02.mp4 4.288 work/n02.mp4   # 2.623-6.911  ECU 매크로
norm clips/s03.mp4 1.374 work/n03.mp4   # 6.911-8.285  ECU 매크로
norm clips/s04.mp4 1.332 work/n04.mp4   # 8.285-9.617  ECU 매크로
norm clips/s05.mp4 3.383 work/n05.mp4   # 9.617-13.000  MCU 정면
norm clips/s06.mp4 5.818 work/n06.mp4   # 13.000-18.818  MCU 정면
norm clips/s07.mp4 4.163 work/n07.mp4   # 18.818-22.981  POV (거울) CU
norm clips/s08.mp4 7.036 work/n08.mp4   # 22.981-30.017  MS 3/4

# 2) 하드 컷 이어붙이기 (재인코딩 없음)
cat > work/list.txt <<'EOF'
file 'n01.mp4'
file 'n02.mp4'
file 'n03.mp4'
file 'n04.mp4'
file 'n05.mp4'
file 'n06.mp4'
file 'n07.mp4'
file 'n08.mp4'
EOF
ffmpeg -nostdin -y -f concat -safe 0 -i work/list.txt -c copy work/joined.mp4

# 3) 헤어 휘핑 전환 보정: s05→s06을 따로 만들었다면 13.0s 지점에 0.2초 smoothleft + 모션블러 + '슈욱'
#    (한 클립 안에서 머리를 휙 돌리게 뽑았다면 이 단계 생략 = 원본 방식)
#    xfade가 0.2초를 겹치므로 결과물은 29.82초가 됨 (원본보다 0.2초 짧음)
ffmpeg -nostdin -y -i work/joined.mp4 -i sfx/whoosh.wav -filter_complex \
  "[0:v]split[v0][v1];[v0]trim=0:13.0,setpts=PTS-STARTPTS[a];[v1]trim=start=13.0,setpts=PTS-STARTPTS[b];\
   [a][b]xfade=transition=smoothleft:duration=0.2:offset=12.8[v];\
   [0:a]asplit[x0][x1];[x0]atrim=0:13.0,asetpts=PTS-STARTPTS[xa];[x1]atrim=start=13.0,asetpts=PTS-STARTPTS[xb];\
   [xa][xb]acrossfade=d=0.2[ac];[1:a]adelay=12800|12800,volume=0.8[w];[ac][w]amix=inputs=2:duration=first:normalize=0[au]" \
  -map "[v]" -map "[au]" -c:v libx264 -crf 17 -preset slow -c:a aac -b:a 192k -shortest work/whip.mp4
# 마무리: 음량 정규화 (원본은 매우 조용한 ASMR형 → -16 LUFS로 살짝 낮게)
ffmpeg -nostdin -y -i work/whip.mp4 -af "loudnorm=I=-16:TP=-1.5:LRA=11" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart final_16x9.mp4

# 4) (선택) 9:16 릴스 세로 버전 — 블러 배경 + 가운데 16:9 원본
ffmpeg -nostdin -y -i final_16x9.mp4 -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:4,eq=brightness=-0.06[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:v libx264 -crf 17 -preset slow -c:a copy final_9x16.mp4
