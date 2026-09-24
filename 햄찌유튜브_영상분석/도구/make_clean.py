"""상위 10개 영상 자막(VTT)을 읽기 쉬운 TXT로 정리 + 목록 파일 생성."""
import json, re, os, glob, html

rank = json.load(open('data/ranking.json', encoding='utf-8'))
TAG = re.compile(r'<[^>]+>')
TS = re.compile(r'(\d{2}):(\d{2}):(\d{2})\.(\d{3})\s+-->')
LANG_NAME = {'ko-orig': '한국어(유튜브 자동생성)', 'ko': '한국어(유튜브 자동생성)', 'en': '영어(채널 제공 수동자막)', 'ja': '일본어(채널 제공 수동자막)'}

def safe(s):
    return re.sub(r'[\/:*?"<>|]', '', s).strip()[:40]

def vtt_to_lines(path):
    out, last, cur_t = [], None, None
    for raw in open(path, encoding='utf-8'):
        line = raw.rstrip('\n')
        m = TS.match(line)
        if m:
            h, mi, se, ms = map(int, m.groups())
            cur_t = h * 3600 + mi * 60 + se + ms / 1000
            continue
        if not line.strip() or line.startswith(('WEBVTT', 'Kind:', 'Language:', 'NOTE')) or cur_t is None:
            continue
        text = html.unescape(TAG.sub('', line)).replace('>>', '').strip()
        if text and text != last and (not out or text != out[-1][1]):
            out.append((cur_t, text)); last = text
    # 자동자막의 '이전 줄 반복' 제거
    dedup = []
    for t, x in out:
        if dedup and x == dedup[-1][1]:
            continue
        dedup.append((t, x))
    return dedup

rows = rank['rows'][:10]
index = ['# 김햄찌 채널 — 기간 대비 성과 상위 10개 영상 자막 목록', '',
         f"- 기준: {rank['pool']} ({rank['pool_range'][0]} ~ {rank['pool_range'][1]}) 중 일평균 조회수 순", 
         f"- 기준일: {rank['today']}", '- 자막 원본(VTT)은 raw 폴더, 읽기 쉬운 정리본은 이 폴더의 TXT', '- 유튜브 한국어 자동자막을 요청 제한(429)으로 못 받은 영상은 로컬 Whisper(medium)로 받아쓴 TXT로 대체', '',
         '| 순위 | 제목 | 영상 링크 | 조회수 | 일평균 | 자막 파일 |', '|---|---|---|---|---|---|']
for i, r in enumerate(rows, 1):
    files, langs_done = [], set()
    for lang in ['ko-orig', 'ko', 'en', 'ja']:
        src = f"subs/raw/{r['id']}.{lang}.vtt"
        base_lang = 'ko' if lang.startswith('ko') else lang
        if not os.path.exists(src) or base_lang in langs_done:
            continue
        lines = vtt_to_lines(src)
        name = f"{i:02d}_{safe(r['title'])}_{r['id']}.{base_lang}.txt"
        with open(f'subs/{name}', 'w', encoding='utf-8-sig') as f:
            f.write(f"제목: {r['title']}\n링크: {r['url']}\n언어: {LANG_NAME[lang]}\n업로드: {r['upload_time_kst']}  조회수: {r['views']:,}\n" + '-' * 40 + '\n')
            for t, x in lines:
                f.write(f"[{int(t//60):02d}:{t%60:05.2f}] {x}\n")
        files.append(f"{base_lang}({len(lines)}줄)")
        langs_done.add(base_lang)
    if 'ko' not in langs_done:
        wf = glob.glob(f"subs/{i:02d}_*_{r['id']}.ko.txt")
        if wf:
            n_lines = sum(1 for ln in open(wf[0], encoding='utf-8-sig') if ln.startswith('['))
            files.insert(0, f"ko(로컬 Whisper {n_lines}줄)")
    status = ', '.join(files) if files else '받기 실패(429)'
    index.append(f"| {i} | {r['title']} | {r['url']} | {r['views']:,} | {int(r['vpd']):,}/일 | {status} |")
open('subs/00_자막목록.md', 'w', encoding='utf-8-sig').write('\n'.join(index) + '\n')
print('\n'.join(index))
