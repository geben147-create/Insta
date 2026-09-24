"""유튜브 한국어 자동자막을 못 받은 영상 → 로컬 faster-whisper(medium, CPU)로 받아쓰기 → subs/ TXT 저장."""
import json, os, re, sys
from faster_whisper import WhisperModel

rank = json.load(open('data/ranking.json', encoding='utf-8'))
rows = {r['id']: (i, r) for i, r in enumerate(rank['rows'][:10], 1)}
def safe(s): return re.sub(r'[\/:*?"<>|]', '', s).strip()[:40]
model = WhisperModel('medium', device='cpu', compute_type='int8', cpu_threads=8)
jobs = [('njC9X57Hjqw', 'videos/v3/audio_22k.wav'), ('uZ3mV8oCObc', 'subs/audio/uZ3mV8oCObc.m4a'),
        ('iUrnhZDyqBU', 'subs/audio/iUrnhZDyqBU.m4a'), ('WeOxwdkKGDQ', 'subs/audio/WeOxwdkKGDQ.m4a')]
for vid, path in jobs:
    i, r = rows[vid]
    segs, _ = model.transcribe(path, language='ko', vad_filter=False, beam_size=5)
    name = f"subs/{i:02d}_{safe(r['title'])}_{vid}.ko.txt"
    with open(name, 'w', encoding='utf-8-sig') as f:
        f.write(f"제목: {r['title']}\n링크: {r['url']}\n언어: 한국어(로컬 Whisper 받아쓰기 — 유튜브 자동자막 요청 제한으로 대체)\n업로드: {r['upload_time_kst']}  조회수: {r['views']:,}\n" + '-' * 40 + '\n')
        n = 0
        for s in segs:
            f.write(f"[{int(s.start // 60):02d}:{s.start % 60:05.2f}] {s.text.strip()}\n"); n += 1
    print(vid, n, 'lines ->', name)
