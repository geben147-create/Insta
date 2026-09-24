#!/bin/bash
# 429(요청 과다) 회피: 요청 사이 대기 후 누락분만 재시도
export PYTHONUTF8=1 PYTHONIOENCODING=utf-8
get() { # $1=id $2=lang $3=auto(1/0)
  local flag="--write-subs"; [ "$3" = "1" ] && flag="--write-auto-subs"
  for try in 1 2 3; do
    yt-dlp --skip-download $flag --sub-langs "$2" --sub-format vtt --sleep-requests 2 --no-warnings \
      -o "subs/raw/%(id)s.%(ext)s" "https://www.youtube.com/watch?v=$1" >/dev/null 2>>subs/retry.err && [ -f "subs/raw/$1.$2.vtt" ] && { echo "OK $1 $2"; return; }
    sleep $((try*25))
  done; echo "GIVEUP $1 $2"
}
sleep 30
get njC9X57Hjqw ko 1
get uZ3mV8oCObc ko 1
get iUrnhZDyqBU ko 1
get iUrnhZDyqBU en 0
get iUrnhZDyqBU ja 0
get WeOxwdkKGDQ en 0
get WeOxwdkKGDQ ja 0
echo RETRY_DONE
