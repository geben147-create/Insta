#!/usr/bin/env bash
# 🖌️ It's so hard to wait for my nail polish to dry ㅜㅜ — remake assembly script (auto-generated from measured cut list)
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
norm clips/s01.png 0.167 work/n01.mp4   # 0.000-0.167  WS (커버)
norm clips/s02.mp4 3.533 work/n02.mp4   # 0.167-3.700  ECU (얼굴+손)
norm clips/s03.mp4 6.167 work/n03.mp4   # 3.700-9.867  WS → MS (연속 이동)
norm clips/s04.mp4 1.866 work/n04.mp4   # 9.867-11.733  ECU 인서트 (포커스 전경)
norm clips/s05.mp4 1.3 work/n05.mp4   # 11.733-13.033  MCU 로우
norm clips/s06.mp4 2.3 work/n06.mp4   # 13.033-15.333  ECU 인서트
norm clips/s07.mp4 0.9 work/n07.mp4   # 15.333-16.233  WS 정면
norm clips/s08.mp4 3.234 work/n08.mp4   # 16.233-19.467  MCU 정면
norm clips/s09.mp4 1.433 work/n09.mp4   # 19.467-20.900  WS 정면
norm clips/s10.mp4 1.433 work/n10.mp4   # 20.900-22.333  MS
norm clips/s11.mp4 4.334 work/n11.mp4   # 22.333-26.667  INSERT 매크로 (점프컷 3개)
norm clips/s12.mp4 3.333 work/n12.mp4   # 26.667-30.000  CU 정면
# s13 BLACK 0.367s -> finishing 단계에서 처리
# s14 END CARD 2.8s -> finishing 단계에서 처리

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
EOF
ffmpeg -nostdin -y -f concat -safe 0 -i work/list.txt -c copy work/joined.mp4

# 3) 자막(영/한 2줄, 27.9–29.9s, 하단 중앙) + 29.3s 페이드아웃 + 엔드카드 이어붙이기
#    엔드카드는 HyperFrames로 만든 endcard.mp4 (2.8s) 사용 — 아래 HyperFrames 섹션 참고
ffmpeg -nostdin -y -i work/joined.mp4 -vf "\
drawtext=fontfile='C\:/Windows/Fonts/arial.ttf':text='As expected, professionals are the best!':fontsize=34:fontcolor=white:\
borderw=2:bordercolor=black@0.55:x=(w-text_w)/2:y=h*0.815:enable='between(t,27.9,29.9)',\
drawtext=fontfile='C\:/Windows/Fonts/malgunbd.ttf':text='역시 프로가 최고야!':fontsize=34:fontcolor=white:\
borderw=2:bordercolor=black@0.55:x=(w-text_w)/2:y=h*0.815+46:enable='between(t,27.9,29.9)',\
fade=t=out:st=29.3:d=0.7,tpad=stop_mode=add:stop_duration=0.37:color=black" \
  -af "afade=t=out:st=29.3:d=0.7,apad=pad_dur=0.37" -c:v libx264 -crf 17 -preset slow -c:a aac -b:a 192k -shortest work/main.mp4
printf "file 'main.mp4'\nfile 'endcard.mp4'\n" > work/list2.txt
ffmpeg -nostdin -y -f concat -safe 0 -i work/list2.txt -af "loudnorm=I=-14:TP=-1.0:LRA=11" \
  -c:v libx264 -crf 17 -preset slow -c:a aac -b:a 192k -shortest -movflags +faststart final_16x9.mp4

# 4) (선택) 9:16 릴스 세로 버전 — 블러 배경 + 가운데 16:9 원본
ffmpeg -nostdin -y -i final_16x9.mp4 -filter_complex "[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=40:4,eq=brightness=-0.06[bg];[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2" -c:v libx264 -crf 17 -preset slow -c:a copy final_9x16.mp4
