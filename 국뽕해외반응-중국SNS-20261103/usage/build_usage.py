#!/usr/bin/env python3
"""제작 영상 사용 원장 빌더 (by Claude Code · Opus)

원본(정본)
  - 영상 결과 폴더의 cut-list.csv  → 어떤 원본을 몇 초부터 몇 초까지 썼는지
  - usage/게시기록.tsv              → 게시 여부·채널·계정·게시일·URL (사람이 직접 고치는 유일한 파일)

만드는 것
  - data/제작영상_원장.tsv       영상 1편 = 1행
  - data/제작영상_클립사용.tsv   원음 클립 1개 = 1행 (원본 IN/OUT ↔ 영상 내 시각 ↔ 한국어 자막)
  - data/usage.json             페이지가 읽는 표시값(❌ 사용 / 🟡 게시 / 🔵 미게시)
  - data/한국_직접수집.tsv, data/일본_직접수집.tsv  (사용·게시·자막 열을 맨 앞으로)
  - 각 영상 결과 폴더의 _사용기록.md / _사용기록.tsv

실행: python3 -I usage/build_usage.py   (저장소의 국뽕해외반응-중국SNS-20261103 폴더 기준 상대경로 자동 처리)
"""
import csv, json, os, re, subprocess, sys, datetime
from collections import defaultdict, OrderedDict

HUB = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(HUB)
RESULT = '/run/media/yh/새 볼륨/_국뽕영상결과물'
PIPE = '/home/yh/ai-work/kukppong_v4_pipeline/episodes'
POST = os.path.join(HUB, 'usage', '게시기록.tsv')
KDIR = os.path.join(REPO, 'reactions-downloads', 'korea-direct-20261116-e.tsv')
JDIR = os.path.join(REPO, 'reactions-downloads', 'japan-direct-20261116-e.tsv')
KDIR_D = os.path.join(REPO, 'reactions-downloads', 'korea-direct-20261116-d.tsv')
JDIR_D = os.path.join(REPO, 'reactions-downloads', 'japan-direct-20261116-d.tsv')
SCRIPT_INDEX = os.path.join(HUB, 'script', 'data', 'index.json')

ID_RE = re.compile(r'(BV[0-9A-Za-z]{10}|BILI-\d+|XHS-\d+|TT-\d+|IG-\d+|YT-[\w-]+|DY-\d+|KS-\d+)')
SKIP = {'EP_KTX청룡_원고'}

# 폴더 이름만으로 주제가 안 보이는 것만 손으로 적는다
TOPIC = {
    'EP06': '러시아인이 한국의 새벽 거리에서 놀란 이유',
    'EP05_시위를본중국여행자': '시위를 본 중국 여행자의 놀람, 해외 언론이 주목한 한국 시민의 저력',
    'EP_KTX청룡': 'KTX-청룡 (초판)',
    'EP03_KTX청룡반전': 'KTX-청룡 반전 (V21)',
    'EP_뷰티파마': '세 살 아이 파마·청담동 피부관리 (뷰티 초판, 11-15)',
    'EP_K뷰티여행': 'K뷰티·여행 (초판, 11-15)',
    'EP_라면편의점': '무인 라면가게·편의점 100위안 (초판, 11-15)',
}


def ff_dur(p):
    try:
        out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p],
                             capture_output=True, text=True, timeout=30).stdout.strip()
        return float(out)
    except Exception:
        return None


def mmss(s):
    if s is None or s == '':
        return ''
    s = float(s)
    return '%d:%04.1f' % (int(s // 60), s % 60)


def fnum(x):
    try:
        return float(str(x).strip())
    except Exception:
        return None


def pick_mp4(d):
    c = []
    for root, _, files in os.walk(d):
        if root.count(os.sep) - d.count(os.sep) > 2 or '/build' in root or '/assets' in root:
            continue
        for f in files:
            if f.endswith('.mp4'):
                p = os.path.join(root, f)
                if os.path.getsize(p) > 5_000_000:  # 지도·도표용 짧은 부속 영상 제외
                    c.append(p)
    if not c:
        return None, None
    def score(p):
        n = os.path.basename(p)
        bad = ('diag' in n) + ('test' in n) + ('pin' in n)
        prev = ('미리보기' in n) or ('preview' in n) or ('480p' in n) or ('720p' in n)
        draft = 'draft' in n
        return (bad, prev, draft, -os.path.getsize(p))
    c.sort(key=score)
    full = c[0]
    prev = next((p for p in c if ('미리보기' in os.path.basename(p) or 'preview' in os.path.basename(p))), None)
    return full, prev


def find_cut(d):
    best = None
    for root, _, files in os.walk(d):
        if 'cut-list.csv' in files:
            p = os.path.join(root, 'cut-list.csv')
            # revision 폴더가 있으면 가장 최신
            if best is None or os.path.getmtime(p) > os.path.getmtime(best):
                best = p
    return best


def default_src(d):
    for name in ('rights.csv', 'script_data.py', 'manifest.json'):
        for root, _, files in os.walk(d):
            if name in files:
                m = ID_RE.search(open(os.path.join(root, name), encoding='utf-8', errors='ignore').read())
                if m:
                    return m.group(1)
    return ''


def read_cut(p, dflt):
    rows = list(csv.reader(open(p, encoding='utf-8-sig')))
    h = [x.strip() for x in rows[0]]
    def col(*names):
        for n in names:
            for i, x in enumerate(h):
                if x == n or x.startswith(n):
                    return i
        return -1
    i_at, i_src, i_in, i_out = col('영상내시작', '영상 시작'), col('소스ID', '소스'), col('원본IN', '원본 IN'), col('원본OUT', '원본 OUT')
    i_ko, i_path, i_sp = col('한국어자막', '자막'), col('원본경로'), col('속도')
    out = []
    for r in rows[1:]:
        if not r or len(r) < 3:
            continue
        g = lambda i: r[i].strip() if 0 <= i < len(r) else ''
        src = ''
        for cand in (g(i_src), g(i_path)):
            m = ID_RE.search(cand)
            if m:
                src = m.group(1); break
        if not src:
            src = dflt
        a, b = fnum(g(i_in)), fnum(g(i_out))
        if a is None or b is None:
            continue
        out.append(dict(at=fnum(g(i_at)), src=src, i=a, o=b, sp=g(i_sp) or '', ko=g(i_ko).replace('\n', ' / '), path=g(i_path)))
    return out


def merge_ranges(rs):
    rs = sorted(rs)
    m = []
    for a, b in rs:
        if m and a <= m[-1][1] + 0.05:
            m[-1][1] = max(m[-1][1], b)
        else:
            m.append([a, b])
    return m


def load_list(p):
    if not os.path.exists(p):
        return [], []
    rows = list(csv.reader(open(p, encoding='utf-8-sig'), delimiter='\t'))
    return rows[0], rows[1:]


def main():
    # 0. 게시기록 (사람이 고치는 파일)
    post = OrderedDict()
    if os.path.exists(POST):
        for r in csv.DictReader(open(POST, encoding='utf-8-sig'), delimiter='\t'):
            post[r['영상코드']] = r

    # 1. 영상 목록
    eps = []
    for name in sorted(os.listdir(RESULT)):
        d = os.path.join(RESULT, name)
        if not os.path.isdir(d) or not name.startswith('EP') or name in SKIP:
            continue
        cut = find_cut(d)
        full, prev = pick_mp4(d)
        if not cut and not full:
            continue
        eps.append(dict(code=name, dir=d, cut=cut, mp4=full, prev=prev))

    # 2. 국가 판정용 목록
    kh, kr = load_list(KDIR); jh, jr = load_list(JDIR)
    kset = {r[0] for r in kr}; jset = {r[0] for r in jr}
    sidx = {}
    if os.path.exists(SCRIPT_INDEX):
        for v in json.load(open(SCRIPT_INDEX, encoding='utf-8'))['videos']:
            sidx[v['id']] = v
    def country(sid):
        if sid in kset: return '한국'
        if sid in jset: return '일본'
        if sid in sidx: return sidx[sid].get('country', '')
        return ''

    clips_all, ep_rows = [], []
    src_use = defaultdict(lambda: dict(eps=[], ranges=[], sec=0.0))
    for e in eps:
        dflt = default_src(e['dir'])
        clips = read_cut(e['cut'], dflt) if e['cut'] else []
        dur = ff_dur(e['mp4']) if e['mp4'] else None
        csec = sum(c['o'] - c['i'] for c in clips)
        srcs = OrderedDict()
        for n, c in enumerate(clips, 1):
            srcs.setdefault(c['src'], 0.0)
            srcs[c['src']] += c['o'] - c['i']
            row = OrderedDict([('영상코드', e['code']), ('클립', n), ('영상내시각', mmss(c['at'])),
                               ('소스ID', c['src']), ('국가', country(c['src'])),
                               ('원본IN', mmss(c['i'])), ('원본OUT', mmss(c['o'])), ('길이(초)', round(c['o'] - c['i'], 2)),
                               ('원본IN(초)', c['i']), ('원본OUT(초)', c['o']), ('속도', c['sp']), ('한국어자막(대본 연결)', c['ko'])])
            clips_all.append(row)
            su = src_use[c['src']]
            if e['code'] not in su['eps']:
                su['eps'].append(e['code'])
            su['ranges'].append([e['code'], c['i'], c['o'], c['ko'][:60]])
            su['sec'] += c['o'] - c['i']
        p = post.get(e['code'], {})
        cn = sorted({country(s) for s in srcs if country(s)})
        ep_rows.append(OrderedDict([
            ('게시', '🟡 게시' if p.get('게시상태', '').startswith('게시') else '🔵 미게시'),
            ('영상코드', e['code']),
            ('주제', TOPIC.get(e['code'], re.sub(r'^EP\w*?_', '', e['code']))),
            ('국가', '·'.join(cn)),
            ('길이', mmss(dur) if dur else ''),
            ('원음클립', len(clips)),
            ('원음(초)', round(csec, 1)),
            ('내레이션비율(추정)', ('%d%%' % round(100 * (1 - csec / dur))) if dur else ''),
            ('사용 원본', ' · '.join('%s(%.0f초)' % (s, v) for s, v in srcs.items())),
            ('채널', p.get('채널', '')), ('계정', p.get('계정', '')), ('게시일', p.get('게시일', '')), ('게시URL', p.get('URL', '')),
            ('완성 MP4', os.path.relpath(e['mp4'], RESULT) if e['mp4'] else ''),
            ('미리보기', os.path.relpath(e['prev'], RESULT) if e['prev'] else ''),
            ('cut-list', os.path.relpath(e['cut'], RESULT) if e['cut'] else ''),
            ('제작일', datetime.datetime.fromtimestamp(os.path.getmtime(e['mp4'] or e['cut'])).strftime('%Y-%m-%d') if (e['mp4'] or e['cut']) else ''),
        ]))
        e['clips'], e['srcs'], e['dur'], e['row'] = clips, srcs, dur, ep_rows[-1]

    # 3. 게시기록 파일이 없으면 뼈대 생성 (기존 값은 절대 덮어쓰지 않음)
    cols = ['영상코드', '게시상태', '채널', '계정', '게시일', 'URL', '메모']
    for e in eps:
        if e['code'] not in post:
            post[e['code']] = dict(영상코드=e['code'], 게시상태='미게시', 채널='', 계정='', 게시일='', URL='', 메모='')
    with open(POST, 'w', encoding='utf-8', newline='') as f:
        w = csv.DictWriter(f, cols, delimiter='\t', extrasaction='ignore'); w.writeheader()
        for r in post.values():
            w.writerow(r)

    # 4. 원장 TSV
    data = os.path.join(HUB, 'data')
    def wtsv(path, rows):
        with open(path, 'w', encoding='utf-8', newline='') as f:
            w = csv.writer(f, delimiter='\t')
            w.writerow(list(rows[0].keys()))
            for r in rows:
                w.writerow([str(v).replace('\t', ' ').replace('\n', ' ') for v in r.values()])
    wtsv(os.path.join(data, '제작영상_원장.tsv'), ep_rows)
    wtsv(os.path.join(data, '제작영상_클립사용.tsv'), clips_all)

    # 5. usage.json (페이지 표시용)
    posted = {k for k, v in post.items() if v.get('게시상태', '').startswith('게시')}
    U = {'by': 'by Claude Code · Opus', 'built': datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),
         'eps': {e['code']: dict(topic=e['row']['주제'], posted=e['code'] in posted, channel=post[e['code']].get('채널', ''),
                                 dur=e['row']['길이'], mp4=e['row']['완성 MP4']) for e in eps},
         'src': {}}
    for s, v in src_use.items():
        U['src'][s] = dict(eps=v['eps'], sec=round(v['sec'], 1), posted=any(x in posted for x in v['eps']),
                           ranges=[[a, round(b, 2), round(c, 2), d] for a, b, c, d in v['ranges']],
                           merged=[[round(a, 2), round(b, 2)] for a, b in merge_ranges([(r[1], r[2]) for r in v['ranges']])])
    json.dump(U, open(os.path.join(data, 'usage.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump(U, open(os.path.join(HUB, 'script', 'data', 'usage.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

    # 6. 한국/일본 직접수집 목록: 사용·게시·자막을 맨 앞으로
    def asr_map(p):
        h, rr = load_list(p)
        if not h: return {}
        return {r[0]: r[-1] for r in rr if r and r[-1].startswith('ASR')}
    for src_p, d_p, out_name in ((KDIR, KDIR_D, '한국_직접수집.tsv'), (JDIR, JDIR_D, '일본_직접수집.tsv')):
        h, rr = load_list(src_p)
        if not h: continue
        asr = asr_map(d_p)
        hasq = h.index('플랫폼 자막 큐') if '플랫폼 자막 큐' in h else -1
        nh = ['사용', '게시', '자막'] + h
        with open(os.path.join(data, out_name), 'w', encoding='utf-8', newline='') as f:
            w = csv.writer(f, delimiter='\t'); w.writerow(nh)
            for r in rr:
                sid = r[0]; u = U['src'].get(sid)
                sub = asr.get(sid, '')
                if not sub and sid in sidx and sidx[sid].get('done'):
                    sub = 'ASR %s줄' % sidx[sid].get('n', '')
                if not sub and hasq >= 0 and r[hasq] not in ('', '0'):
                    sub = '플랫폼 자막 %s' % r[hasq]
                w.writerow(['❌ ' + ','.join(u['eps']) if u else '', ('🟡' if u['posted'] else '🔵') if u else '',
                            '📝 ' + sub if sub else '—'] + r)

    # 7. 폴더별 사이드카
    for e in eps:
        r = e['row']
        L = ['# 사용 기록 · %s' % e['code'], '',
             '자동 생성: `Insta/국뽕해외반응-중국SNS-20261103/usage/build_usage.py` (%s) — 직접 고치지 말고 게시 정보는 `usage/게시기록.tsv`에.' % U['built'], '',
             '| 항목 | 값 |', '|---|---|']
        for k in ('게시', '주제', '국가', '길이', '원음클립', '원음(초)', '내레이션비율(추정)', '채널', '계정', '게시일', '게시URL', '완성 MP4', '미리보기', 'cut-list', '제작일'):
            L.append('| %s | %s |' % (k, r[k]))
        L += ['', '## 사용한 원본', '', '| 소스ID | 국가 | 사용 초 | 사용 구간(원본 기준, 합침) |', '|---|---|---|---|']
        for s, sec in e['srcs'].items():
            mr = merge_ranges([(c['i'], c['o']) for c in e['clips'] if c['src'] == s])
            L.append('| %s | %s | %.1f | %s |' % (s, country(s), sec, ', '.join('%s–%s' % (mmss(a), mmss(b)) for a, b in mr)))
        L += ['', '## 클립별 (영상 내 시각 ↔ 원본 구간 ↔ 대본)', '', '| # | 영상 내 | 소스 | 원본 IN | 원본 OUT | 한국어 자막(대본) |', '|---|---|---|---|---|---|']
        for n, c in enumerate(e['clips'], 1):
            L.append('| %d | %s | %s | %s | %s | %s |' % (n, mmss(c['at']), c['src'], mmss(c['i']), mmss(c['o']), c['ko'].replace('|', '/')))
        open(os.path.join(e['dir'], '_사용기록.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')
        with open(os.path.join(e['dir'], '_사용기록.tsv'), 'w', encoding='utf-8', newline='') as f:
            w = csv.writer(f, delimiter='\t'); w.writerow(['클립', '영상내시각', '소스ID', '원본IN(초)', '원본OUT(초)', '한국어자막'])
            for n, c in enumerate(e['clips'], 1):
                w.writerow([n, mmss(c['at']), c['src'], c['i'], c['o'], c['ko']])

    # 결과 폴더 맨 위에도 전체 원장 사본
    import shutil
    shutil.copy(os.path.join(data, '제작영상_원장.tsv'), os.path.join(RESULT, '_제작영상_원장.tsv'))
    shutil.copy(os.path.join(data, '제작영상_클립사용.tsv'), os.path.join(RESULT, '_제작영상_클립사용.tsv'))
    print('영상 %d편 · 클립 %d개 · 원본 %d개 · 게시 %d편' % (len(eps), len(clips_all), len(src_use), len(posted)))
    for e in eps:
        r = e['row']
        print('  %-24s %6s clips=%-3s src=%s' % (e['code'], r['길이'], r['원음클립'], ','.join(e['srcs'])[:70]))


if __name__ == '__main__':
    main()
