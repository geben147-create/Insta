#!/usr/bin/env python3
# by GPT 쓸모 소스 · Edge TTS · 최종 승인 한국어 원고만 사용
# Requires: pip install edge-tts ; sudo apt install ffmpeg
# 온라인 Edge 서비스의 상업적 사용 조건·라이선스는 별도로 확인할 것.
import argparse, asyncio, hashlib, json, re, shutil, subprocess, time
from pathlib import Path

def cmd(*args):
    r=subprocess.run(list(args),capture_output=True,text=True)
    if r.returncode: raise RuntimeError(r.stderr[-2000:])
    return r.stdout.strip()
def seconds(path):
    return float(cmd("ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)))
def cut(txt,limit=290):
    # 분할할 때 문장 원문을 보존하며 제작 메모가 아닌 순수 TXT를 입력받음
    items=re.split(r"(?<=[.!?。？！])\s+|\n+",txt.strip())
    result=[];buffer=""
    for item in items:
        item=item.strip()
        if not item:continue
        if buffer and len(buffer)+len(item)+1>limit:
            result.append(buffer);buffer=""
        if len(item)>limit:
            if buffer:result.append(buffer);buffer=""
            result += [item[i:i+limit] for i in range(0,len(item),limit)]
        else:buffer=(buffer+" "+item).strip()
    if buffer:result.append(buffer)
    return result
def fmt(t):
    v=int(max(0,t)*1000);h,v=divmod(v,3600000);m,v=divmod(v,60000);s,ms=divmod(v,1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
async def generate(parts,voice,rate,folder):
    import edge_tts
    res=[]
    for i,text in enumerate(parts,1):
        digest=hashlib.sha256(f"{voice}|{rate}|{text}".encode()).hexdigest()[:12]
        p=folder/f"{i:03d}-{digest}.mp3";mp=folder/f"{i:03d}-{digest}.json"
        if p.is_file() and p.stat().st_size>200 and mp.is_file():
            marks=json.loads(mp.read_text(encoding="utf-8"))
        else:
            for attempt in range(1,4):
                try:
                    data=bytearray();marks=[]
                    c=edge_tts.Communicate(text,voice,rate=rate,boundary="SentenceBoundary")
                    async for x in c.stream():
                        if x["type"]=="audio":data.extend(x["data"])
                        elif x["type"]=="SentenceBoundary":marks.append({"text":x["text"],"offset":x["offset"],"duration":x["duration"]})
                    if len(data)<200:raise ValueError("empty audio")
                    p.write_bytes(data);mp.write_text(json.dumps(marks,ensure_ascii=False),encoding="utf-8")
                    break
                except Exception:
                    if attempt==3:raise
                    await asyncio.sleep(attempt*3)
        res.append((p,marks,text))
        print(f"{i}/{len(parts)} PASS {p.name}",flush=True)
    return res
def main():
    a=argparse.ArgumentParser()
    a.add_argument("text",help="HTML에서 다운로드한 승인 낭독용 TXT")
    a.add_argument("--voice",default="ko-KR-SunHiNeural")
    a.add_argument("--rate",type=float,default=1.2)
    a.add_argument("--output")
    args=a.parse_args()
    for x in ["ffmpeg","ffprobe"]:
        if not shutil.which(x):raise SystemExit(x+" 미설치")
    path=Path(args.text).resolve();txt=path.read_text(encoding="utf-8-sig")
    parts=cut(txt)
    if not parts:raise SystemExit("읽을 문장이 없습니다")
    dest=Path(args.output or str(path.with_suffix(""))+"_audio")
    dest.mkdir(parents=True,exist_ok=True);tmp=dest/"chunks";tmp.mkdir(exist_ok=True)
    rate=f"{round((args.rate-1)*100):+d}%"
    res=asyncio.run(generate(parts,args.voice,rate,tmp))
    files=dest/"concat.txt";files.write_text("\n".join("file '"+str(x[0].resolve())+"'" for x in res)+"\n",encoding="utf-8")
    wav=dest/"narration_master.wav";mp3=dest/"narration_final.mp3"
    cmd("ffmpeg","-y","-v","error","-f","concat","-safe","0","-i",str(files),"-ar","24000","-ac","1","-c:a","pcm_s16le",str(wav))
    cmd("ffmpeg","-y","-v","error","-i",str(wav),"-c:a","libmp3lame","-b:a","192k","-ar","24000","-ac","1",str(mp3))
    srt=[];pos=0
    for f,marks,txt in res:
        dur=seconds(f)
        if not marks:srt.append((pos,pos+dur,txt))
        for m in marks:
            st=max(pos,min(pos+dur,pos+m["offset"]/1e7))
            ed=min(pos+dur,max(st+.1,st+m["duration"]/1e7))
            srt.append((st,ed,m.get("text") or txt))
        pos+=dur
    out=dest/"narration_final.srt"
    out.write_text("\n\n".join(f"{i}\n{fmt(st)} --> {fmt(ed)}\n{tx}" for i,(st,ed,tx) in enumerate(srt,1)),encoding="utf-8")
    length=round(seconds(mp3),2)
    qc={"status":"DRAFT_SYNTHESIZED_QC_PENDING","source_sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
        "voice":args.voice,"rate":rate,"chunks":len(parts),"narration_seconds":length,
        "target_seconds":1020,"narration_at_least_60pct_of_17min":length>=612,
        "mp3_bitrate_target":"192kbps","wav_sample_rate":24000,
        "audio_vs_foreign_clip_ratio":"미측정 (외국인 원음 합성 전)",
        "srt":"문장 경계 기반; 편집 뒤 수동 동기화 필요",
        "commercial_permission":"Edge TTS 이용 약관·상업적 사용은 별도 확인 필요"}
    (dest/"QC_report.json").write_text(json.dumps(qc,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"wav":str(wav),"mp3":str(mp3),"srt":str(out),"duration":length},ensure_ascii=False))
if __name__=="__main__":main()
