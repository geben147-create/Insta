import csv, hashlib, io, json, re, urllib.request, datetime
from pathlib import Path
from collections import defaultdict, Counter
ROOT=Path('/run/media/yh/새 볼륨/틱톡/샤오(한국 일본 영상들)')
BASE='https://raw.githubusercontent.com/geben147-create/Insta/main/reactions-downloads/'
OUT=ROOT/'동기화점검'/datetime.datetime.now().strftime('%Y%m%d_%H%M%S_%f')
OUT.mkdir(parents=True,exist_ok=False)
print('기존 파일을 변경하지 않는 전체 점검 시작',flush=True)
def remote(name):
    text=urllib.request.urlopen(BASE+name,timeout=60).read().decode('utf-8-sig')
    (OUT/name).write_text(text,encoding='utf-8')
    return list(csv.DictReader(io.StringIO(text),delimiter='\t'))
records={}
for name in ['korea','japan']:
    for r in remote(name+'-direct-latest.tsv'):
        records[r['ID']]=r
exceptions=remote('sync-exceptions-20261117.tsv')
for e in exceptions:
    if e['ID'] not in records:
        records[e['ID']]={'ID':e['ID'],'870 상대경로':e['870 상대경로'],'제목 원문':'UNKNOWN','예외 상태':e['상태']}
def getid(p):
    m=re.search(r'BV[0-9A-Za-z]{10}',p.name)
    if m:return m.group(0)
    m=re.search(r'XHS([0-9a-fA-F]{24})',p.name)
    if m:return 'XHS'+m.group(1)
    if p.stem=='8JiyJejo-e0':return p.stem
    return None
files=defaultdict(list)
for p in ROOT.rglob('*'):
    if p.is_file() and p.suffix.lower() in ['.mp4','.mkv','.webm']:
        id=getid(p)
        if id:files[id].append(p)
for id in files:
    records.setdefault(id,{'ID':id,'제목 원문':'UNKNOWN','예외 상태':'UNINDEXED_FILE'})
def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1<<20),b''):h.update(b)
    return h.hexdigest()
def subread(p):
    try:
        text=p.read_text(encoding='utf-8-sig',errors='replace')
        cues=re.findall(r'(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}\s*-->\s*(?:\d{1,2}:)?\d{2}:\d{2}[,.]\d{3}',text)
        bodies=[]
        for line in text.splitlines():
            line=line.strip()
            if not line or line.isdigit() or '-->' in line or line.startswith(('WEBVTT','NOTE','Kind:','Language:')):continue
            if re.sub(r'<[^>]+>','',line).strip():bodies.append(line)
        valid=bool(cues and bodies)
        hangul=bool(re.search('[가-힣]', '\n'.join(bodies)))
        empty=0
        for block in re.split(r'\n\s*\n',text):
            lines=block.strip().splitlines()
            if any('-->' in x for x in lines):
                idx=next(i for i,x in enumerate(lines) if '-->' in x)
                if not any(re.sub(r'<[^>]+>','',x).strip() for x in lines[idx+1:]):empty+=1
        return {'path':str(p),'sha256':digest(p),'cues':len(cues),'nonempty':valid,'hangul':hangul,'empty_cues':empty}
    except Exception as e:return {'path':str(p),'nonempty':False,'error':str(e)}
rows=[]; subtitle_rows=[]; copies=[]
for n,(id,r) in enumerate(sorted(records.items()),1):
    rel=r.get('870 상대경로','')
    expected=ROOT/rel if rel else None
    candidates=files.get(id,[])
    p=expected if expected and expected.is_file() else next((x for x in candidates if 'video' not in x.relative_to(ROOT).parts),next(iter(candidates),None))
    row={'ID':id,'제목':r.get('제목 원문','UNKNOWN'),'원본 URL':r.get('원본 URL',('https://www.bilibili.com/video/'+id if id.startswith('BV') else 'UNKNOWN')),'기존 상대경로':rel,'기존 상태':r.get('예외 상태','INDEXED'),'실제 전체경로':str(p) if p else '', '파일 상태':'MISSING','해시 비교':'UNKNOWN','원어 자막':'UNKNOWN','한국어 자막':'UNKNOWN'}
    if p:
        try:
            before=p.stat(); size=before.st_size; h=digest(p); after=p.stat()
            row.update({'실제 바이트':size,'실제 SHA256':h,'실제 상대경로':str(p.relative_to(ROOT)),'파일 상태':'PRESENT' if size else 'EMPTY'})
            oldhash=r.get('870 계산 SHA256','')
            row['해시 비교']='MATCH' if oldhash and oldhash==h else ('MISMATCH' if oldhash else 'NEW_LOCAL_HASH')
            oldsize=r.get('파일 바이트','')
            row['크기 비교']='MATCH' if oldsize and int(oldsize)==size else ('MISMATCH' if oldsize else 'UNKNOWN')
            if (before.st_size,before.st_mtime_ns)!=(after.st_size,after.st_mtime_ns):row['파일 상태']='CHANGED_DURING_SCAN'
            prefix=p.stem
            subs=[]
            for s in p.parent.iterdir():
                if s.is_file() and s.name.startswith(prefix+'.') and s.suffix.lower() in ['.srt','.vtt']:
                    v=subread(s); ko=bool(re.search(r'(?:^|[.\-_])ko(?:[.\-_]|$)',s.name[len(prefix):],re.I))
                    v.update({'ID':id,'role':'ko' if ko else 'original_or_other'})
                    subtitle_rows.append(v);subs.append(v)
            orig=[s for s in subs if s['role']!='ko' and s.get('nonempty')]
            ko=[s for s in subs if s['role']=='ko' and s.get('nonempty') and s.get('hangul')]
            row['원어 자막']='NONEMPTY_REVIEW_REQUIRED' if orig else 'MISSING_OR_EMPTY'
            row['한국어 자막']='NONEMPTY_REVIEW_REQUIRED' if ko and any(s.get('empty_cues',0)==0 for s in ko) else ('PARTIAL' if ko else 'MISSING_OR_EMPTY')
            row['자막 파일 수']=len(subs)
            row['경로 비교']='MATCH' if expected==p else 'FOUND_ELSEWHERE'
            if row['제목']=='UNKNOWN':
                for meta in [p.with_suffix('.info.json'),p.parent/'metadata.json']:
                    if meta.exists():
                        try:row['제목']=json.loads(meta.read_text(encoding='utf-8')).get('title','UNKNOWN')
                        except Exception:pass
                if row['제목']=='UNKNOWN':row['제목']='UNKNOWN ('+p.parent.name+')'
            for c in candidates:copies.append({'ID':id,'path':str(c),'bytes':c.stat().st_size,'selected':c==p})
        except Exception as e:row['파일 상태']='READ_ERROR';row['오류']=str(e)
    rows.append(row)
    if n%25==0:print('점검',n,'/',len(records),flush=True)
def tsv(name,items):
    if not items:return
    fields=list(dict.fromkeys(k for r in items for k in r))
    with (OUT/name).open('x',encoding='utf-8-sig',newline='') as f:
        w=csv.DictWriter(f,fieldnames=fields,delimiter='\t');w.writeheader();w.writerows(items)
tsv('전체_영상_경로_해시_자막.tsv',rows)
tsv('자막_파일별_해시_큐.tsv',subtitle_rows)
tsv('중복경로_전체.tsv',copies)
issues=[r for r in rows if r['파일 상태']!='PRESENT' or r['해시 비교'] in ['MISMATCH','NEW_LOCAL_HASH'] or r.get('경로 비교')!='MATCH' or r['원어 자막']=='MISSING_OR_EMPTY' or r['한국어 자막'] in ['MISSING_OR_EMPTY','PARTIAL']]
tsv('보완할_항목.tsv',issues)
summary={'영상상태':dict(Counter(r['파일 상태'] for r in rows)),'해시상태':dict(Counter(r['해시 비교'] for r in rows)),'원어자막':dict(Counter(r['원어 자막'] for r in rows)),'한국어자막':dict(Counter(r['한국어 자막'] for r in rows)),'주의':'자막 내용과 원음의 정확성은 별도 검수 필요. 영상 내용 검수 및 다운로드는 하지 않음. 기존 파일 삭제·수정 없음.'}
(OUT/'요약.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(summary,ensure_ascii=False,indent=2))
print('점검 폴더:',OUT)
print('다른 세션은 이 폴더의 TSV를 읽어 실제 경로와 해시를 인식하세요. GitHub 자동 업로드는 하지 않았습니다.')
