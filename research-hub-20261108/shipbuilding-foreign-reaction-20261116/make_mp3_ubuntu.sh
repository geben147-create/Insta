#!/usr/bin/env bash
# Korean shipbuilding narration 3x MP3, generated LOCALLY on the user's Ubuntu.
# Isolated venv; downloads publicly licensed model assets on first use.
set -Eeuo pipefail
export PYTHONIOENCODING=utf-8
HERE="${HOME}/ai-work/shipbuilding-tts-20261116"
mkdir -p "${HERE}"
cd "${HERE}"
if ! command -v ffmpeg >/dev/null; then
  echo "ffmpeg 설치가 필요합니다: sudo apt install ffmpeg" >&2
  exit 1
fi
if ! command -v python3 >/dev/null; then
  echo "python3 명령을 찾지 못했습니다." >&2; exit 1
fi
if [ ! -d ".venv" ]; then python3 -m venv .venv; fi
./.venv/bin/python -m pip install -q --upgrade pip
./.venv/bin/python -m pip install -q --upgrade supertonic
cat > run_all.py <<'PY'
import re, subprocess, urllib.request, pathlib, sys
from supertonic import TTS
root=pathlib.Path.cwd()
base="https://raw.githubusercontent.com/geben147-create/Insta/main/research-hub-20261108/shipbuilding-foreign-reaction-20261116/"
tts=TTS(auto_download=True)
voice=tts.get_voice_style(voice_name="M1")
def split_lines(text, limit=130):
    pieces=[]
    for sentence in re.split(r'(?<=[.!?。！？])\s+',text.strip()):
        if not sentence.strip(): continue
        if len(sentence)<=limit:
            pieces.append(sentence.strip()); continue
        buffer=''
        for word in sentence.split():
            if len(buffer)+len(word)+1>limit and buffer:
                pieces.append(buffer.strip()); buffer=''
            buffer+=' '+word
        if buffer.strip(): pieces.append(buffer.strip())
    merged=[]; buffer=''
    for part in pieces:
        if len(buffer)+len(part)+1>limit and buffer:
            merged.append(buffer.strip());buffer=''
        buffer+=' '+part
    if buffer.strip(): merged.append(buffer.strip())
    return merged
for ident in ["EP01","EP02","EP03"]:
    txt=root/f"{ident}_narration.txt"
    if not txt.exists():
        print("다운로드:",txt.name,flush=True)
        urllib.request.urlretrieve(base+txt.name,str(txt))
    text=txt.read_text(encoding="utf-8")
    chunks=split_lines(text)
    wavdir=root/(ident+"_wav_chunks")
    wavdir.mkdir(parents=True,exist_ok=True)
    paths=[]
    for i,chunk in enumerate(chunks):
        wavfile=wavdir/f"{i:04d}.wav"
        if not wavfile.exists() or wavfile.stat().st_size<200:
            wav, duration=tts.synthesize(chunk,voice_style=voice,lang="ko")
            tts.save_audio(wav,str(wavfile))
        paths.append(wavfile)
        print(f"{ident} {i+1}/{len(chunks)} 오디오 생성",flush=True)
    listfile=wavdir/"concat.txt"
    listfile.write_text("\n".join("file '"+str(p.resolve()).replace("'","'\\''")+"'" for p in paths)+"\n",encoding="utf-8")
    target=root/(ident+".mp3")
    subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-f","concat","-safe","0","-i",str(listfile),"-ac","1","-ar","24000","-b:a","160k",str(target)],check=True)
    print("MP3 생성:",target,flush=True)
print("\n완료: 3개 MP3가",root,"폴더에 저장되었습니다.")
PY
./.venv/bin/python run_all.py
echo "🎧 출력 폴더: ${HERE}/EP01.mp3, EP02.mp3, EP03.mp3"
