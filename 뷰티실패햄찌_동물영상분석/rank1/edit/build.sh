#!/usr/bin/env bash
# A2O May - Shijie 💜 Immigration Inspection — remake assembly script (auto-generated from measured cut list)
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
norm clips/s01.mp4 1.467 work/n01.mp4   # 0.000-1.467  MS
norm clips/s02.mp4 2.0 work/n02.mp4   # 1.467-3.467  OTS / INSERT
norm clips/s03.mp4 1.533 work/n03.mp4   # 3.467-5.000  OTS (리버스)
norm clips/s04.mp4 1.467 work/n04.mp4   # 5.000-6.467  CU
norm clips/s05.mp4 1.133 work/n05.mp4   # 6.467-7.600  CU
norm clips/s06.mp4 2.067 work/n06.mp4   # 7.600-9.667  MS (OTS 전경)
norm clips/s07.mp4 1.733 work/n07.mp4   # 9.667-11.400  INSERT
norm clips/s08.mp4 2.2 work/n08.mp4   # 11.400-13.600  CU
norm clips/s09.mp4 2.433 work/n09.mp4   # 13.600-16.033  CU
norm clips/s10.mp4 1.834 work/n10.mp4   # 16.033-17.867  MS (비교 구도)
norm clips/s11.mp4 1.866 work/n11.mp4   # 17.867-19.733  INSERT (매크로)
norm clips/s12.mp4 0.367 work/n12.mp4   # 19.733-20.100  INSERT
norm clips/s13.mp4 1.5 work/n13.mp4   # 20.100-21.600  WS 로우앵글
norm clips/s14.mp4 1.8 work/n14.mp4   # 21.600-23.400  WS 후면
norm clips/s15.mp4 2.5 work/n15.mp4   # 23.400-25.900  WS 측면
norm clips/s16.mp4 3.767 work/n16.mp4   # 25.900-29.667  CU 정면
# s17 BLACK 0.366s -> finishing 단계에서 처리

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
file 'n09.mp4'
file 'n10.mp4'
file 'n11.mp4'
file 'n12.mp4'
file 'n13.mp4'
file 'n14.mp4'
file 'n15.mp4'
file 'n16.mp4'
EOF
ffmpeg -nostdin -y -f concat -safe 0 -i work/list.txt -c copy work/joined.mp4

# 3) 마무리: 끝에 0.367초 하드 블랙(원본 29.667s) + 음량 정규화(-14 LUFS, 릴스 권장)
ffmpeg -nostdin -y -i work/joined.mp4 \
  -vf "tpad=stop_mode=add:stop_duration=0.367:color=black" \
  -af "apad=pad_dur=0.367,loudnorm=I=-14:TP=-1.0:LRA=11" \
  -c:v libx264 -crf 17 -preset slow -c:a aac -b:a 192k -shortest -movflags +faststart final_16x9.mp4
# (선택) 마지막 CU(s16)가 정지 화면으로 나왔다면 원본처럼 느린 푸시인을 디지털로 추가:
#   ffmpeg -i work/n16.mp4 -vf "zoompan=z='min(1+0.0012*on,1.12)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30" -c:a copy work/n16.mp4.tmp.mp4

# 4) (선택) 9:16 릴스 세로 버전 — 블러 배경 + 가운데 16:9 원본
ffmpeg -nostdin -y -i final_16x9.mp4 -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:4,eq=brightness=-0.06[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:v libx264 -crf 17 -preset slow -c:a copy final_9x16.mp4
