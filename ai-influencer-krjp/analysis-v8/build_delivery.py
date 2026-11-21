from pathlib import Path
import json, html, re, shutil, zipfile, hashlib, datetime

ROOT = Path(__file__).resolve().parent
SITE = Path('/home/yh/Insta-worktrees/travel-analysis-v8/ai-influencer-krjp')
PUB = SITE / 'analysis-v8'
PUB.mkdir(exist_ok=True)
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
evidence = json.loads((ROOT/'evidence/travel-reference-evidence.json').read_text())

def inline(s):
    s = html.escape(s)
    s = re.sub(r'`([^`]+)`', r'<code>\1</code>', s)
    s = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', s)
    return s

def markdown(s):
    lines=s.splitlines(); out=[]; i=0
    while i<len(lines):
        line=lines[i]
        if not line.strip(): i+=1; continue
        if line.startswith('|'):
            rows=[]
            while i<len(lines) and lines[i].startswith('|'):
                cells=[c.strip() for c in lines[i].strip().strip('|').split('|')]
                if not all(re.fullmatch(r'[:\- ]+',c) for c in cells):rows.append(cells)
                i+=1
            out.append('<div class="table"><table>')
            for n,row in enumerate(rows):
                tag='th' if n==0 else 'td';out.append('<tr>'+''.join('<'+tag+'>'+inline(c)+'</'+tag+'>' for c in row)+'</tr>')
            out.append('</table></div>');continue
        m=re.match(r'^(#{1,6}) (.*)',line)
        if m: out.append('<h'+str(len(m[1]))+'>'+inline(m[2])+'</h'+str(len(m[1]))+'>')
        elif line.startswith('- '): out.append('<p class="item">• '+inline(line[2:])+'</p>')
        else: out.append('<p>'+inline(line)+'</p>')
        i+=1
    return '\n'.join(out)

checklist='''# 검증 체크리스트

| 항목 | 상태 | 근거 / 남은 일 |
|---|---|---|
| 높은 조회수 여행 원본 식별 | PASS | 지정한 7개 ID와 기존 조회수 기록 |
| 현재 조회수 재검증 | 미완료 | 좋아요와 재생수를 혼용하지 않음 |
| 공개 구독자 7만 이하 YouTube 후보 | PASS 1건 | Leslie Koh 591명, 7FchbVOoGF0 1만1,377회. 호텔 직접레퍼런스 아님 |
| Instagram 557만을 YouTube 성과로 변환 | 금지 준수 | 별도 지표 유지 |
| 709만·557만 실제 영상·오디오 확보 | PASS | 공개 비로그인 자원과 해시, 사이트에는 원본 미배포 |
| OpenCV 전 프레임 / 0.1초 측정 | PASS | 1,816프레임 / 606개 시간 창 |
| 557만 하드컷 8개 경계 육안 확인 | PASS | ±1프레임 접촉 시트 2장 |
| 709만 무컷 확정 | 미확정 | 자동 후보 0개만 확인 |
| Watch 로컬 실행·선택 이미지 열람 | PASS | 9장+14장 모두 열람 |
| 대사·효과음 원본 판별 | 미완료 | 음성전사 폴백 끔, 분리트랙·원본 샘플 없음 |
| 자막 OCR | 부분 완료 | 누락을 0으로 처리하지 않음; 교체 시각 9.7초는 경계 프레임 확인 |
| 사용자 영상과 역할별 나란히 비교 | 입력 대기 | 내 영상 URL/파일이 아직 없음 |
| 새 장면표·편집 수치·카메라 A/B 설계 | PASS 제안 | 실제 촬영·생성·A/B 승자 검증 아님 |
| 9:16 / 같은 장면에서 카메라만 변경 | 설계 반영 | 1080×1920 / 30fps / 3초 A 고정 B Dolly In |
| 비키니·스타일리시한 성인 캐릭터 | 설계 반영 | 아직 수정 이미지 생성하지 않음 |
| 실제 호텔·자쿠지 위치 확인 | 부분 완료 | Aqua Garden 기능은 공식 확인, 특정 자쿠지 세부사진·객실 전용 여부 미확정 |
| 카드 아래 펼치기·모달 | PASS | 여행60개 / ESC / 포커스 / 정렬 보존 / 다른분야0개 |
| 모바일 실제 터치 | 미검증 | 390px 배치·DOM클릭 검증과 구분 |
| Watch 공용 설치 | PASS | Codex·Claude·Hermes 동일 파일, 기존 Hermes12프로필 공유 |
| 앱별 새 세션에서 스킬 실제 호출 | 미검증 | 파일과 CLI 검증을 앱 로딩 성공으로 바꾸지 않음 |
| build-video-development-course | 미설치 | 원본 배포 위치 미발견 |
| 실제 유지율·흥행 인과 | 미검증 | 조회수 높음과 원인 가설 분리 |
'''
(ROOT/'checklist.md').write_text(checklist)
watch_record={'engine':'local','transcription':'disabled; no captions available','upstream':'https://github.com/bradautomates/claude-video/tree/main/skills/watch','version':'0.3.2','paid_api_calls':0,'frames_selected_and_viewed':{'DTZ8QPYkWIm':9,'Db7QQzpRxPf':14},'notes':['All 23 selected frames were opened with view_image.','Two DTZ cut-neighbor sheets were additionally viewed.','Watch time labels are rounded; first video PTS is container +0.115s.','No speech or original SFX library identity is established.'],'directories':['watch/watch-i1re7xzf','watch/watch-d3vcseyy']}
(ROOT/'watch/watch-run-verification.json').write_text(json.dumps(watch_record,ensure_ascii=False,indent=2))

entries={}
for x in evidence['candidates']:
    ident=x['id']; done=ident in ('DTZ8QPYkWIm','Db7QQzpRxPf')
    facts=['조회수는 기존 수집본의 기록이며 현재 공개 재생수 재확인값이 아닙니다.', '원본: '+x['url']]
    if x.get('public_post_datetime'):facts.append('공개 페이지 time: '+x['public_post_datetime']+'; 자료 게시일과 충돌하면 검증기록 참조.')
    profile=x.get('profile') or {}
    if profile.get('display'):facts.append('공개 Instagram 팔로워 표시 '+profile['display'].replace('K followers','천 명').replace('M followers','백만 명')+' — YouTube 구독자와 별도 지표.')
    row={'account':x['account'],'viewsRecorded':x['stored_views'],'publishedRecorded':x.get('stored_post_date'),'sourceUrl':x['url'],'status':'실제 매체 분석 / Instagram 참고자료' if done else '부분 확인 · 보류','facts':facts,'watch':{'status':'실행·선택 프레임 열람 완료' if done else '미실행','summary':'Watch 로컬 프레임만 관찰. 발화·원본 효과음 판별은 미완료.' if done else x.get('scope','원본 미확인')},'opencv':{'status':'실측 완료' if done else '미실측','summary':'해당 ID의 0.1초 CSV와 컷·오디오 측정 기록을 확인하세요.' if done else '미확인을 0회로 집계하지 않습니다.'},'comparison':{'status':'도구 간 대조 완료 / 내 영상 대기' if done else '대조 보류','summary':'Watch 관찰과 OpenCV 수치는 분리했습니다. 내 영상 URL·파일은 아직 제공되지 않았습니다.'},'fusion':{'status':'새 장면 제안','summary':'9:16, 예쁜 성인 캐릭터의 자연스러운 옆뒷모습과 장소에 맞는 수영복. 빛·물·동작·정보 공개를 조합하되 대사·장면·캐릭터는 복제하지 않습니다.'},'verification':{'status':'지표·출처 검증과 한계 기록','summary':x.get('gate_reason','구독자 요건 미확인')+' Instagram 영상을 YouTube 최종 영상으로 승격하지 않습니다.'}}
    if ident=='DTZ8QPYkWIm':
        row['watch']['summary']='객실→사케 잔→키카드→디스펜서→따르기→족욕 입구→발→인물과 야경→타워. 9개 선택 프레임 열람. 족욕이며 자쿠지가 아닙니다.'
        row['opencv']['summary']='13.700초, 411프레임, 137개 0.1초 창. 자동 컷 후보8개를 경계 ±1프레임으로 육안 확인했습니다. 해당 기준에서 하드컷8개/9샷. -45dBFS 이하 0.2초 이상 구간0개.'
        row['fusion']['items']=['예쁜 인물만 반복하는 대신 물에 닿는 손→실제 시설→체험→밤 풍경으로 정보 공개를 설계합니다.','557만은 Instagram 기록이며 같은 제작자의 YouTube591 구독자와 섞어 성과배수를 만들지 않습니다.']
    elif ident=='Db7QQzpRxPf':
        row['watch']['summary']='밝은 석재·아치·청록 물·녹색 패턴 원피스. 여성은 가방·그네·물·침대와 상호작용합니다. 14개 균등 선택 프레임 모두 열람. 이 배치가 공간 깊이를 전달한다는 것은 가설입니다.'
        row['opencv']['summary']='46.833초, 1,405프레임, 469개 0.1초 창. 자동 컷 후보0개이며 숨은 편집까지 무컷 확정은 아닙니다. 해당 무음 기준0개.'
    elif ident=='DeytvnThNW9':row['facts'].append('관찰 프레임은 어두운 베개 공연장입니다. 호텔·비키니 영상으로 오인하지 않습니다.')
    elif ident=='Dcrk799h4eG':row['facts'].append('연령 제한·로그인 필요로 원본 미관찰. 의상·자세 때문에 흥행했다고 단정할 수 없습니다.')
    entries[ident]=row
public_base='analysis-v8/'
data={'updatedAt':now,'reportUrl':public_base+'index.html','markdownUrl':public_base+'analysis.md','checklistUrl':public_base+'checklist.md','zipUrl':public_base+'travel-analysis-v8-reports.zip','entries':entries,'finalYouTubeCandidates':[{'id':'7FchbVOoGF0','url':'https://www.youtube.com/shorts/7FchbVOoGF0','verifiedSubscribers':591,'verifiedViews':11377,'note':'일본 스탬프 정보형; 호텔 직접 레퍼런스 아님'}]}
(SITE/'travel-analysis-v8.js').write_text('window.TRAVEL_ANALYSIS_V8 = '+json.dumps(data,ensure_ascii=False,indent=2)+';\n')
(ROOT/'page-data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2))

doc=(ROOT/'analysis.md').read_text()
style='body{margin:0;background:#10171d;color:#e8edf0;font:16px/1.8 system-ui,sans-serif}main{max-width:1160px;margin:auto;padding:32px 24px 100px}h1{font-size:34px;color:#b7eadf}h2{margin-top:54px;color:#b7eadf;border-top:1px solid #384954;padding-top:24px}h3{margin-top:32px;color:#c4d7ef}p{overflow-wrap:anywhere}table{border-collapse:collapse;min-width:620px;width:100%;font-size:14px}th,td{border:1px solid #3a4b55;padding:10px;vertical-align:top;text-align:left}th{background:#22353c}.table{overflow-x:auto;margin:22px 0}code{background:#243139;border-radius:4px;padding:2px 5px}.item{padding-left:12px}a{color:#a5d6ff}.nav{position:sticky;top:0;background:#10171df5;padding:12px 0;display:flex;gap:14px;flex-wrap:wrap}iframe{width:min(100%,360px);aspect-ratio:9/16;border:0;border-radius:10px}@media(max-width:600px){main{padding:18px 14px 60px}h1{font-size:26px}table{font-size:13px}}'
preview='<h2>검증된 소형 YouTube 채널 후보 · 1건</h2><p>591명 채널의 일본 스탬프 정보 Shorts. 공개 조회수 1만1,377회 확인. 호텔 직접 레퍼런스는 아닙니다.</p><iframe loading="lazy" title="Leslie Koh 일본 스탬프 Shorts" src="https://www.youtube-nocookie.com/embed/7FchbVOoGF0" allowfullscreen></iframe><p><a href="https://www.youtube.com/shorts/7FchbVOoGF0">동일 영상 직접 링크</a></p><p>페이지 본문은 오프라인에서도 읽히며, 이 외부 미리보기 재생에는 네트워크가 필요합니다. 플랫폼별 실제 재생은 미검증입니다.</p>'
page='<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>여행 분석 v8 · Watch × OpenCV</title><style>'+style+'</style><main><nav class="nav"><a href="analysis.md">상세 MD</a><a href="checklist.md">체크리스트</a><a href="verification.json">검증 기록</a><a href="travel-analysis-v8-reports.zip">보고서 ZIP</a></nav>'+markdown(doc)+preview+'<h2>체크리스트</h2>'+markdown(checklist)+'</main></html>'
(ROOT/'index.html').write_text(page)

# Public source includes reports and measurements, not original media or frames.
selected=[ROOT/'build_delivery.py',ROOT/'analysis.md',ROOT/'checklist.md',ROOT/'index.html',ROOT/'page-data.json',ROOT/'evidence/travel-reference-evidence.json',ROOT/'evidence/instagram-profile-counts.json',ROOT/'evidence/leslie-youtube-channel.json',ROOT/'evidence/leslie-youtube-video-current.json',ROOT/'evidence/reference-verification.md',ROOT/'opencv/README.md',ROOT/'opencv/verification.json',ROOT/'opencv/analyze_av.py',ROOT/'watch/watch-run-verification.json',ROOT/'ui-validation/ui-checks.json',ROOT/'ui-validation/final-data-checks.json']
for ident in ('DTZ8QPYkWIm','Db7QQzpRxPf'):
    for name in ('summary.json','aggregate-metrics.json','timeline-0.1s.csv','timeline-0.1s.json','cut-candidates.json','low-level-audio-intervals.json','cut-visual-verification.json','overlay-ocr-summary.json','overlay-ocr-0.1s.csv','overlay-visual-review.json'):
        f=ROOT/'opencv'/ident/name
        if f.exists():selected.append(f)
if (ROOT/'opencv/ocr_overlays.py').exists():selected.append(ROOT/'opencv/ocr_overlays.py')
for f in (ROOT/'skill-installation').glob('*'):
    if f.is_file():selected.append(f)
validation={'built_at':now,'completed':['OpenCV two original media full-frame measurement','Watch local extraction and 23 selected frames viewed','557 eight cut boundaries viewed','9:16 shot and camera-only AB proposal','travel card details and dialog implementation','shared Watch installation and CLI verification'],'pending':['own video not provided','build-video-development-course upstream unresolved','complete semantic event and SFX audit','actual image/video generation and AB rendering','hotel jacuzzi detail-photo location confirmation','actual mobile touch test','actual loading in new Claude/Hermes sessions'],'publication':'isolated branch; deployment status must be checked separately','artifact_hashes':{str(f.relative_to(ROOT)):hashlib.sha256(f.read_bytes()).hexdigest() for f in selected if f.exists()}}
(ROOT/'verification.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2));selected.append(ROOT/'verification.json')
for f in selected:
    target=PUB/f.relative_to(ROOT);target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(f,target)
with zipfile.ZipFile(ROOT/'travel-analysis-v8-reports.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in selected:z.write(f,f.relative_to(ROOT))
shutil.copy2(ROOT/'travel-analysis-v8-reports.zip',PUB/'travel-analysis-v8-reports.zip')
print(json.dumps({'public_files':len(selected),'entries':len(entries),'report_zip_bytes':(ROOT/'travel-analysis-v8-reports.zip').stat().st_size,'source_media_in_public':False,'site':str(SITE)},ensure_ascii=False))
