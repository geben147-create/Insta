"""김햄찌 채널 /videos 탭 — 기간 대비 성과 랭킹 계산.
지표: 일평균 조회수(VPD) = 조회수 / 업로드 후 경과일. 보조: 채널 중앙값 대비 배수, 참여율."""
import json, glob, statistics, csv
from datetime import date, datetime
import time
NOW = time.time()  # 시스템 시계 기준 현재 시각

TODAY = date(2026, 9, 23)  # Get-Date 로 확인한 오늘 날짜
rows = []
for p in glob.glob('data/meta/*.json'):
    m = json.load(open(p, encoding='utf-8'))
    ud = m.get('upload_date')
    d = datetime.strptime(ud, '%Y%m%d').date() if ud else None
    ts = m.get('timestamp')
    age = round((NOW - ts) / 86400, 2) if ts else ((TODAY - d).days if d else None)
    v = m.get('view_count') or 0
    subs = sorted((m.get('subtitles') or {}).keys())
    autos = [k for k in (m.get('automatic_captions') or {}).keys() if k.startswith('ko')]
    rows.append({
        'id': m['id'], 'title': m.get('title'), 'upload_date': d.isoformat() if d else None,
        'age_days': age, 'duration': m.get('duration'), 'views': v,
        'likes': m.get('like_count'), 'comments': m.get('comment_count'),
        'width': m.get('width'), 'height': m.get('height'), 'fps': m.get('fps'),
        'subtitles': subs, 'auto_ko': autos[:3], 'availability': m.get('availability'),
        'live_status': m.get('live_status'), 'tags': (m.get('tags') or [])[:15],
        'description': (m.get('description') or '')[:400],
        'url': f"https://www.youtube.com/watch?v={m['id']}",
        'upload_time_kst': time.strftime('%Y-%m-%d %H:%M', time.localtime(ts)) if ts else None,
    })

# 사용자 지시(2026-09-23): 최근 업로드 30개만 순위 대상으로 사용
POOL_SIZE = 30
rows.sort(key=lambda r: r['upload_date'] or '', reverse=True)
all_rows = rows
rows = rows[:POOL_SIZE]
med = statistics.median([r['views'] for r in rows if r['views']])
for r in rows:
    a = max(r['age_days'] or 1, 0.5)
    r['vpd'] = round(r['views'] / a, 1)
    r['outlier_x'] = round(r['views'] / med, 2) if med else None
    # 좋아요 수는 비공개(None) → 조회 1천회당 댓글 수로 참여도 측정
    r['comments_per_1k'] = round((r['comments'] or 0) / r['views'] * 1000, 2) if r['views'] else None
    r['engagement_pct'] = r['comments_per_1k']
    r['is_compilation'] = (r['duration'] or 0) > 600

rows.sort(key=lambda r: r['vpd'], reverse=True)
for i, r in enumerate(rows, 1):
    r['rank_vpd'] = i
json.dump({'today': TODAY.isoformat(), 'pool': f'최근 업로드 {POOL_SIZE}개', 'pool_range': [min(r['upload_date'] for r in rows), max(r['upload_date'] for r in rows)], 'channel_total_videos_tab': len(all_rows), 'median_views': med, 'count': len(rows), 'rows': rows},
          open('data/ranking.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
with open('data/ranking.csv', 'w', encoding='utf-8-sig', newline='') as f:
    w = csv.writer(f)
    w.writerow(['rank','id','title','upload_date','age_days','duration','views','vpd','outlier_x','likes','comments','engagement_pct','WxH','subs','auto_ko'])
    for r in rows:
        w.writerow([r['rank_vpd'], r['id'], r['title'], r['upload_date'], r['age_days'], r['duration'], r['views'], r['vpd'], r['outlier_x'], r['likes'], r['comments'], r['engagement_pct'], f"{r['width']}x{r['height']}", '|'.join(r['subtitles']), '|'.join(r['auto_ko'])])
print('median views:', med, ' total:', len(rows))
print('pool:', len(rows), 'of', len(all_rows), '| upload range:', min(r['upload_date'] for r in rows), '~', max(r['upload_date'] for r in rows))
for r in rows[:12]:
    print(f"{r['rank_vpd']:>3} {r['id']} {r['upload_date']} age={r['age_days']:>4} dur={r['duration']:>5} views={r['views']:>8} vpd={r['vpd']:>9} x{r['outlier_x']:<5} eng={r['engagement_pct']}% {r['width']}x{r['height']} subs={r['subtitles']} ko_auto={r['auto_ko']} | {r['title'][:40]}")
