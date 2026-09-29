param([switch]$Test)
# FFmpeg 조립: clips\cut_NNN.mp4 가 있으면 그 컷 길이만큼 잘라 쓰고, 없으면 역할 색 자리표시 화면을 만든다.
# 창을 띄우지 않도록 현재 셸에서 ffmpeg 를 직접 실행한다.
$ErrorActionPreference = 'Continue'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$W = 1920; $H = 1080; $FPS = 30; $out = 'final.mp4'
if ($Test) { $W = 480; $H = 270; $FPS = 15; $out = 'test_assembly.mp4' }
New-Item -ItemType Directory -Force '_build' | Out-Null
$lines = @()
foreach ($c in (Import-Csv 'edl.csv')) {
  $n = '{0:D3}' -f [int]$c.idx
  # 프레임 단위로 누적 시각을 맞춰 전체 길이가 원본과 같게(컷마다 반올림 오차가 쌓이지 않게)
  $frames = [math]::Round([double]$c.t_out * $FPS) - [math]::Round([double]$c.t_in * $FPS)
  if ($frames -lt 1) { continue }
  $dur = [string]::Format([Globalization.CultureInfo]::InvariantCulture, '{0:0.####}', ($frames / $FPS + 1))
  $part = "_build\p_$n.mp4"
  $clip = "clips\cut_$n.mp4"
  if (Test-Path $clip) {
    ffmpeg -y -v error -i $clip -vf "scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,fps=$FPS" -frames:v $frames -an -c:v libx264 -preset veryfast -crf 20 $part
  } else {
    ffmpeg -y -v error -f lavfi -i "color=c=$($c.placeholder):s=${W}x${H}:r=${FPS}:d=$dur" -frames:v $frames -c:v libx264 -preset ultrafast $part
  }
  if ($LASTEXITCODE -ne 0) { Write-Output "FAIL cut $n"; exit 1 }
  $lines += "file 'p_$n.mp4'"
}
$lines | Set-Content -Encoding ascii '_build\list.txt'
ffmpeg -y -v error -f concat -safe 0 -i '_build\list.txt' -c copy '_build\video_only.mp4'
if ($LASTEXITCODE -ne 0) { Write-Output 'FAIL concat'; exit 1 }
ffmpeg -y -v error -i '_build\video_only.mp4' -vf 'subtitles=subs_new.ass' -c:v libx264 -preset veryfast -crf 20 $out
if ($LASTEXITCODE -ne 0) { Write-Output 'FAIL subtitles'; exit 1 }
Write-Output "OK $out"
