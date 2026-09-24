import json, glob, subprocess, os

rows = []
for f in sorted(glob.glob('v*/video.info.json')):
    d = os.path.dirname(f)
    j = json.load(open(f, encoding='utf-8'))
    pr = subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
         'stream=width,height,r_frame_rate,nb_frames', '-of', 'csv=p=0', d + '/video.mp4'],
        capture_output=True, text=True, stdin=subprocess.DEVNULL, timeout=60).stdout.strip()
    row = {
        'id': d, 'uploader': j.get('uploader') or j.get('channel'), 'duration': j.get('duration'),
        'likes': j.get('like_count'), 'comments': j.get('comment_count'), 'views': j.get('view_count'),
        'date': j.get('upload_date'), 'probe': pr, 'url': j.get('webpage_url'),
        'desc': (j.get('description') or ''), 'track': j.get('track'), 'artist': j.get('artist'),
    }
    rows.append(row)
    print(d, row['uploader'], row['duration'], 'likes', row['likes'], 'cmts', row['comments'],
          'views', row['views'], row['date'], pr)
    print('   ', row['desc'].replace('\n', ' ')[:200])
    print('   track:', row['track'], row['artist'])
json.dump(rows, open('meta.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
