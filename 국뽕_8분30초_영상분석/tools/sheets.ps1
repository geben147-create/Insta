# 소스 영상별 장면 목록(타임코드 붙은 썸네일 시트) 생성. 글꼴 상대경로 때문에 font 폴더에서 실행한다.
$W = Split-Path -Parent $PSScriptRoot
New-Item -ItemType Directory -Force (Join-Path $W 'sheets') | Out-Null
Push-Location (Join-Path $W 'font')
$plan = @(
  @('GANGNAM', 20), @('BTS_RETURN', 10), @('BTS_ARG', 30), @('BIRTH', 8)
)
foreach ($p in $plan) {
  $name = $p[0]; $step = $p[1]
  $src = Join-Path $W "dl_videos\$name.mp4"
  $vf = "fps=1/$step,scale=240:135,drawtext=fontfile=Pretendard-Bold.otf:text='%{pts\:hms}':x=6:y=6:fontsize=20:fontcolor=white:box=1:boxcolor=black@0.6,tile=8x6"
  $out = Join-Path $W "sheets\${name}_%02d.png"
  ffmpeg -v error -y -i $src -an -vf $vf -fps_mode vfr $out
  "$name exit=$LASTEXITCODE $(Get-Date -Format HH:mm:ss)"
}
Pop-Location
