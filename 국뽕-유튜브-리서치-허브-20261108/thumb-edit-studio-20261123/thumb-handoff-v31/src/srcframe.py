#!/usr/bin/env python3
"""완성 영상 시각 → cut-list.csv/broll-list.csv로 원본 클립·원본 시각을 찾아 원본 해상도 프레임 추출.
사용: srcframe.py <영상폴더> <완성영상초> <출력.png>"""
import csv,sys,subprocess,os,glob
ep,t,out=sys.argv[1],float(sys.argv[2]),sys.argv[3]
def k(r,*ns): return next((r[n] for n in ns if n in r and r[n] not in ('',None)),None)
def findsrc(i):
    for g in [f'/run/media/yh/새 볼륨/틱톡/**/{i}.mp4',f'/run/media/yh/새 볼륨/틱톡/**/*{i}*.mp4']:
        h=glob.glob(g,recursive=True)
        if h: return h[0]
hits=[]
for fn in ['broll-list.csv','cut-list.csv']:
    p=os.path.join(ep,fn)
    if not os.path.exists(p): continue
    for r in csv.DictReader(open(p,encoding='utf-8-sig')):
        s=float(k(r,'영상내시작','시작')); e=k(r,'끝'); L=float(k(r,'길이') or (float(e)-s))
        if s<=t<s+L:
            sp=float(k(r,'속도') or 1)
            hits.append((k(r,'원본경로') or findsrc(k(r,'소스ID','원본ID')), float(k(r,'원본IN','원본IN초'))+(t-s)*sp, fn))
for src,st,fn in hits[:1]:
    wh=subprocess.run(['ffprobe','-v','error','-select_streams','v','-show_entries','stream=width,height','-of','csv=p=0',src],capture_output=True,text=True).stdout.strip()
    subprocess.run(['ffmpeg','-v','error','-y','-ss',f'{st:.2f}','-i',src,'-frames:v','1',out])
    print(f'[{fn}] {os.path.basename(src)} @ {st:.2f}s {wh} -> {os.path.basename(out)}')
if not hits: print('no row',t)
