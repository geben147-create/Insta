from pathlib import Path
from collections import Counter
import csv, html, json
from urllib.parse import urlparse

root=Path(__file__).resolve().parent
library=json.loads((root/'library.json').read_text())
refs=json.loads((root/'references.json').read_text())
shots=json.loads((root/'production/new-stills.json').read_text())
episodes=json.loads((root/'production/episodes.json').read_text())
gallery='https://geben147-create.github.io/Insta/ai-influencer-krjp/trip-travel-library/'
esc=lambda f:html.escape(str(f),quote=True)
def a(url,label):
 return f'<a href="{esc(url)}">{esc(label)}</a>'
records=[]
for row in library:
 for label,product,url in row['links']:
  records.append([row['id'],row['title'],row.get('region',''),label,product,url,'일반 예약 링크',gallery+'#'+row['id']])
for k in [*episodes,*shots]:
 if not k.get('url'):continue
 records.append([k['id'],k['title'],k.get('region') or ('한국' if '/busan-hotel-detail-' in k['url'] else '중국'),'숙소 예약',k.get('hotel') or k['title'].split(' · ',1)[0],k['url'],'일반 예약 링크','production/#'+(k['id'] if k in episodes else 'new-stills')])
assert all(urlparse(r[5]).hostname.endswith('.trip.com') for r in records)
with (root/'booking-links.csv').open('w',encoding='utf-8-sig',newline='') as f:
 out=csv.writer(f,lineterminator=chr(10))
 out.writerow(['콘텐츠 ID','콘텐츠','지역','연결 유형','숙소','URL','추적 확인','카드'])
 out.writerows(records)
booking=[]
for key,title,region,label,product,url,status,card in records:
 booking.append(f'<tr><td>{a(card,title)}</td><td>{esc(region)}</td><td>{a(url,product)}</td><td>{esc(label)}</td><td>{esc(status)}</td></tr>')
refgroups=[]
for batch in sorted({r['batch'] for r in refs},reverse=True):
 group=[r for r in refs if r['batch']==batch]
 cards=[]
 for r in group:
  for p in [r['original'],r['thumb']]:assert (root/p).is_file()
  cards.append(f'<figure id="ref-{r["id"]}"><a href="{esc(r["original"])}">'
               f'<img src="{esc(r["thumb"])}" loading="lazy" alt="{esc(r["title"])}"></a>'
               f'<figcaption><span>{r["number"]:02d}</span> {esc(r["title"])} '
               f'<a class="sub" href="{esc(r["original"])}">원본</a></figcaption></figure>')
 label=f'{group[0]["group"]} · {len(group)}장'
 priority = group[0]['priority']
 attributes = ' id="focus-references" open' if priority else ''
 if group[0]['group']=='여행 장면과 수영장':
  attributes = ' id="pool-references" open'
 refgroups.append(f'<details{attributes}><summary>{esc(label)}</summary><div class="cards">{"".join(cards)}</div></details>')
labels={'family-cast-reference.jpg':'가족 배치 시안','east-asia-single-wave-preview.png':'한 번 흐르는 웨이브 참고','east-asia-single-wave-pool-preview.png':'수영장 의상 참고','family-splash-pool-preview.png':'가족 물놀이 연출 참고','coffee-hand-camera-preview.jpg':'손과 조식 디테일'}
cast_assets=[f'<figure><a href="cast/{file}"><img loading="lazy" src="cast/{file}" alt="{label}"></a><figcaption>{label}</figcaption></figure>' for file,label in labels.items()]
regions=Counter(row.get('region','') or '미분류' for row in library)
bars=[f'<div class="bar-row"><span>{esc(region)}</span><meter max="{max(regions.values())}" value="{n}">{n}</meter><b>{n}</b></div>' for region,n in regions.most_common()]
still_cards=[]
for shot in shots:
 path='production/media/'+shot['file']
 assert (root/path).is_file()
 title=esc(shot['title'])
 still_cards.append(f'<figure><a href="{esc(path)}"><img src="{esc(path)}" loading="lazy" alt="{title}"></a>'
                    f'<figcaption>{title} · {a(shot["url"], "일반 예약")}</figcaption></figure>')
page=(root/'dashboard-template.html').read_text()
for marker,value in dict(STILLCOUNT=str(len(shots)),STILLS=''.join(still_cards),REFOCUS=''.join(refgroups),CAST=''.join(cast_assets),BOOKING=''.join(booking),TOTALS=str(len(records)),REGIONS=''.join(bars)).items():
 page=page.replace('<!--'+marker+'-->',value)
(root/'index.html').write_text(page)
print(len(refs),len(library),len(records),len({r[5] for r in records}))
