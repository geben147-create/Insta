#!/usr/bin/env python3
"""썸네일 V3.1 합성기 (2026-11-24). 사용: compose4.py spec.json 출력.jpg
compose3 + 얼굴 자동 중앙(face) · 원형 인셋 뒤 불꽃 · 불꽃/NO!!/번개 스티커 · VS 세로 분할 · 국기 외곽선.

배경 3가지
 bg:    {"photo","face":[fx,fy,fs] | "focus":[fx,fy],"zoom","full":false,"cb":.13}
        full=false → 위·아래 글자 사이 가운데 띠에만 사진, 뒤는 같은 사진 블러 확장
 split: {"left":{사진옵션},"right":{사진옵션},"divider":"bolt|fire","vs":true,"flags":["🇰🇷","🇨🇳"],"labels":["한국","중국"]}
        세로로 반반. 가운데 번개(bolt)나 불꽃 줄기(fire) + 큰 VS
사진옵션 공통
 photo, cb(아래 박힌 자막 자르기 비율), face:[fx,fy,fs] = 원본에서 얼굴 중심(0~1)과 얼굴 높이(화면 높이 대비)
 fh: 칸 안에서 얼굴이 차지할 높이(기본 .5) · fy: 칸 안 얼굴 세로 위치(기본 .45) · tx: 가로 위치(기본 .5) → 얼굴이 칸 정중앙에 온다
 face가 없으면 focus/zoom 방식(compose3과 같음)
insets: [{사진옵션,"box":[x,y,w,h],"frame":"cyan|white|red|yellow|none","circle":false,"fire":false}]
        circle+fire → 원 뒤에 황금 불꽃 아치(사람 뒤에서 불 나오는 효과)
fx:    [{"png":"fire_arch|fire_bar|fire_side|fire_frame|fire_line|no|no_ko|bolt|kk","box":[x,y,w,h],"z":"under|over","rot":0,"flip":false,"alpha":1}]
        under = 인셋 아래, over = 인셋 위·글자 아래
top/bottom/big/tsize/bsize/bubbles/ring/redring/arrow/flags/tag/tagxy/dark : compose3과 같음
qmark: [{"t":"?","xy":[x,y],"s":120}]  큰 노랑 물음표/느낌표
firebar: true → 아래 글자 뒤에 불꽃 띠
"""
import sys,json,math
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance,ImageChops
S=json.load(open(sys.argv[1])); W,H=1280,720
FONT='/home/yh/Pictures/썸네일국뽕/폰트들/ㄱ__썸네일폰트/여기어때 잘난체 2 [단독판매 금지]/Jalnan2TTF [단독판매 금지].ttf'
EMO='/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf'
A='/home/yh/Pictures/썸네일국뽕/디자인요소썸네일자막_로고/'
PNG={'fire_arch':'빛나는 황금빛 불꽃 아치.png','fire_bar':'투명 배경의 강렬한 사실적 불꽃.png','fire_side':'투명 배경의 만화 불꽃 프레임.png',
     'fire_frame':'투명 중앙의 생생한 불꽃 테두리.png','fire_frame2':'불꽃 테두리 프레임.png','fire_line':'image-gen-1.png',
     'no':'강렬한 붉은 붓터치 NO!!.png','no_ko':'불꽃 그래픽 노우.png','bolt':'검은 배경의 노란 번개 아이콘.png','kk':'노란 만화풍 키키 스티커.png'}
COL={'yellow':'#FFE51F','white':'#FFFFFF','cyan':'#3DE6FF','pink':'#FF6FB0','red':'#FF2B2B','blue':'#2F6BFF'}
_cache={}
def asset(n):
    if n not in _cache:
        im=Image.open(A+PNG[n]).convert('RGBA'); _cache[n]=im.crop(im.getbbox())
    return _cache[n]
def load(p,cb=.13):
    im=Image.open(p).convert('RGB'); return im, int(im.height*(1-cb))
def place(o,w,h,cbdef=.2):
    """사진옵션 o를 w×h 칸에 맞춰 잘라 돌려준다. face가 있으면 얼굴을 칸 가운데에."""
    im,ylim=load(o['photo'],o.get('cb',cbdef)); IW,IH=im.size
    face=o.get('face')
    if 'clip' in o:   # 원본에서 쓸 부분만(로고·오버레이 제거). face 좌표는 원본 기준 그대로 쓴다
        c0,c1,c2,c3=o['clip']; im=im.crop((int(c0*IW),int(c1*IH),int(c2*IW),min(ylim,int(c3*IH))))
        if face: face=[(face[0]-c0)/(c2-c0),(face[1]-c1)/(c3-c1),face[2]/(c3-c1)]
        IW,IH=im.size; ylim=IH
    if face:
        fx,fy,fs=face; fh=o.get('fh',.5); ty=o.get('fy',.45)
        sc=(fh*h)/(fs*IH)                       # 원본→칸 배율
        cw,ch=w/sc,h/sc
        if cw>IW or ch>ylim: k=max(cw/IW,ch/ylim); cw/=k; ch/=k
        x0=fx*IW-o.get('tx',.5)*cw; y0=fy*IH-ty*ch
        x0=min(max(x0,0),IW-cw); y0=min(max(y0,0),ylim-ch)
        out=sharp(im.crop((int(x0),int(y0),int(x0+cw),int(y0+ch))).resize((w,h),Image.LANCZOS),w/cw)
        return out.transpose(Image.FLIP_LEFT_RIGHT) if o.get('hflip') else out
    im=im.crop((0,0,IW,ylim)); out=cover(im,w,h,tuple(o.get('focus',(.5,.45))),o.get('zoom',1.0))
    return out.transpose(Image.FLIP_LEFT_RIGHT) if o.get('hflip') else out
def sharp(im,k):
    """확대 배율 k가 크면 선명하게(언샤프). 원본이 저해상도일 때 흐림 완화."""
    if k<1.25: return im
    return im.filter(ImageFilter.UnsharpMask(radius=min(3,1+k*.6),percent=int(min(160,60+k*35)),threshold=2))
def cover(im,w,h,focus=(.5,.5),zoom=1.0):
    r=max(w/im.width,h/im.height)*zoom; k_=r; im=im.resize((max(w,int(im.width*r+.5)),max(h,int(im.height*r+.5))),Image.LANCZOS)
    x=int(min(max(focus[0]*im.width-w/2,0),im.width-w)); y=int(min(max(focus[1]*im.height-h/2,0),im.height-h))
    return sharp(im.crop((x,y,x+w,y+h)),k_)
def pop(im): return ImageEnhance.Contrast(ImageEnhance.Color(im).enhance(1.3)).enhance(1.12)
def blurfill(o):
    im,ylim=load(o['photo'],o.get('cb',.13)); im=im.crop((0,0,im.width,ylim))
    return ImageEnhance.Brightness(cover(im,W,H).filter(ImageFilter.GaussianBlur(18))).enhance(.55)
def paste_fx(canvas,f):
    im=asset(f['png']).copy(); x,y,w,h=f['box']
    if f.get('flip'): im=im.transpose(Image.FLIP_LEFT_RIGHT)
    im=im.resize((w,h),Image.LANCZOS)
    if f.get('rot'): im=im.rotate(f['rot'],expand=True,resample=Image.BICUBIC); x-= (im.width-w)//2; y-=(im.height-h)//2
    if f.get('alpha',1)<1: a=im.getchannel('A').point(lambda v:int(v*f['alpha'])); im.putalpha(a)
    canvas.alpha_composite(im,(int(x),int(y)))
def outline_rgba(im,px=5,color=(0,0,0,255)):
    a=im.getchannel('A'); big=a.filter(ImageFilter.MaxFilter(px*2+1))
    base=Image.new('RGBA',im.size,color); base.putalpha(big); base.alpha_composite(im); return base

# ---------- 글자 준비 ----------
tmp=ImageDraw.Draw(Image.new('RGB',(10,10)))
def fit(t,maxw,size):
    while size>34:
        f=ImageFont.truetype(FONT,size)
        if tmp.textlength(t,font=f)<=maxw: return f
        size-=3
    return ImageFont.truetype(FONT,size)
def text_lines(lines,size,maxw=W-36):
    out=[]
    for L in lines:
        f=fit(L['t'],L.get('maxw',maxw),L.get('s',size)); bb=tmp.textbbox((0,0),L['t'],font=f); out.append((L,f,bb[3]-bb[1],bb[1]))
    return out
big=S.get('big'); top=S.get('top',[]); bot=S.get('bottom',[])
tsize=S.get('tsize',104 if len(top)<=2 else 84); bsize=S.get('bsize',150 if big else 86)
to=text_lines(top,tsize); bo=text_lines(bot,bsize)
th=sum(h+14 for *_,h,_ in to)+14 if top else 0; bh=sum(h+14 for *_,h,_ in bo)+18 if bot else 0

# ---------- 배경 ----------
canvas=None
if 'split' in S:
    sp=S['split']; canvas=Image.new('RGBA',(W,H),'black')
    y0=th-4 if top else 0; y1=H
    hw=W//2+40
    L=pop(place(sp['left'],hw,y1-y0,.13)).convert('RGBA'); R=pop(place(sp['right'],hw,y1-y0,.13)).convert('RGBA')
    canvas.paste(L,(0,y0));
    m=Image.new('L',(hw,y1-y0),0); ImageDraw.Draw(m).polygon([(70,0),(hw,0),(hw,y1-y0),(10,y1-y0)],fill=255)
    canvas.paste(R,(W-hw,y0),m)
    if top: canvas.paste(blurfill(sp['left']).crop((0,0,W,y0)),(0,0))
else:
    b=S['bg']; full=b.get('full',False)
    if full: canvas=pop(place(b,W,H,.13)).convert('RGBA')
    else:
        canvas=blurfill(b).convert('RGBA')
        y0=th-4 if top else 0; y1=H-bh+4 if bot else H
        y0,y1=S.get('band',[y0,y1])
        canvas.paste(pop(place(b,W,y1-y0,.13)),(0,y0))
for f in S.get('fx',[]):
    if f.get('z','under')=='under': paste_fx(canvas,f)

# ---------- 인셋 ----------
for it in S.get('insets',[]):
    x,y,w,h=it['box']; im=pop(place(it,w,h)); fr=it.get('frame','cyan'); bw=7
    if it.get('circle') and fr=='white': fr='red'   # 흰 동그라미 금지(사용자 지시)
    if it.get('circle'):
        if it.get('fire'):
            # 불꽃은 원 위쪽으로만 솟게: 아치 윗부분만 쓰고 아래는 부드럽게 사라지게(원 아래로 내려가는 불 금지)
            arch=asset('fire_arch'); aw=int(w*2.05); ahf=int(aw*arch.height/arch.width)
            a=arch.resize((aw,ahf),Image.LANCZOS); cut=int(ahf*.6); a=a.crop((0,0,aw,cut))
            al=a.getchannel('A'); fade=Image.new('L',(aw,cut),255); fd=ImageDraw.Draw(fade); f0=int(cut*.62)
            for yy in range(f0,cut): fd.line([(0,yy),(aw,yy)],fill=int(255*(1-(yy-f0)/(cut-f0))))
            a.putalpha(ImageChops.multiply(al,fade))
            cy_=y+h/2-h*it.get('fireup',.16); canvas.alpha_composite(a,(int(x+w/2-aw/2),int(cy_-ahf*.47)))
        sh=Image.new('RGBA',(w+40,h+40),(0,0,0,0)); ImageDraw.Draw(sh).ellipse([20,24,w+20,h+24],fill=(0,0,0,170))
        canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)),(x-20,y-20))
        m=Image.new('L',(w,h),0); ImageDraw.Draw(m).ellipse([0,0,w-1,h-1],fill=255); canvas.paste(im,(x,y),m)
        if fr!='none': ImageDraw.Draw(canvas).ellipse([x-bw,y-bw,x+w+bw,y+h+bw],outline=COL.get(fr,'#fff'),width=bw*2)
    else:
        sh=Image.new('RGBA',(w+30,h+30),(0,0,0,0)); ImageDraw.Draw(sh).rectangle([15,15,w+15,h+15],fill=(0,0,0,150))
        canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)),(x-6,y-2))
        canvas.paste(im,(x,y))
        if fr!='none': ImageDraw.Draw(canvas).rectangle([x-bw//2,y-bw//2,x+w+bw//2,y+h+bw//2],outline=COL.get(fr,'#fff'),width=bw)

# ---------- 분할선 · VS ----------
if 'split' in S:
    sp=S['split']; y0=th-4 if top else 0
    if sp.get('divider','fire')=='bolt':
        bo_=asset('bolt'); bh_=H-y0+40; bw_=int(bo_.width*bh_/bo_.height*1.15)
        canvas.alpha_composite(outline_rgba(bo_.resize((bw_,bh_),Image.LANCZOS),3,(0,0,0,255)),(W//2-bw_//2+6,y0-20))
    else:
        fl=asset('fire_line'); fh_=H-y0+60; fw_=int(fl.width*fh_/fl.height*2.2)
        canvas.alpha_composite(fl.resize((fw_,fh_),Image.LANCZOS),(W//2-fw_//2+8,y0-30))
d=ImageDraw.Draw(canvas)
if S.get('firebar'):
    # 불꽃 끝이 글자 위로 보이게: 불꽃을 글자 블록보다 높게 깔고, 어두운 띠는 글자 줄 뒤에만 얕게
    fb=asset('fire_bar'); fbh=S.get('firebar_h',bh+150); fb=fb.resize((W+40,fbh),Image.LANCZOS)
    canvas.alpha_composite(fb,(-20,H-fbh+6))
    g=Image.new('RGBA',(W,bh+20),(0,0,0,0)); gd=ImageDraw.Draw(g)
    for i in range(bh+20): gd.line([(0,i),(W,i)],fill=(0,0,0,int(min(1,i/50)*125)))
    canvas.alpha_composite(g,(0,H-bh-20))
for f in S.get('fx',[]):
    if f.get('z')=='over': paste_fx(canvas,f)
d=ImageDraw.Draw(canvas)
for x,y,r in S.get('ring',[]): d.ellipse([x-r,y-r,x+r,y+r],outline='#FFE51F',width=9)
for x,y,r in S.get('redring',[]): d.ellipse([x-r,y-r,x+r,y+r],outline='#FF2020',width=10)
for x1,y1,x2,y2 in S.get('arrow',[]):
    a=math.atan2(y2-y1,x2-x1); L_=math.hypot(x2-x1,y2-y1); hw2=26; sw=12
    def P(u,v): return (x1+u*math.cos(a)-v*math.sin(a), y1+u*math.sin(a)+v*math.cos(a))
    d.polygon([P(0,-sw),P(L_-46,-sw),P(L_-46,-hw2),P(L_,0),P(L_-46,hw2),P(L_-46,sw),P(0,sw)],fill='#FF2020',outline='white',width=4)
def flag(e,s):
    ef=ImageFont.truetype(EMO,109); im=Image.new('RGBA',(160,160)); ImageDraw.Draw(im).text((10,10),e,font=ef,embedded_color=True)
    im=im.crop(im.getbbox()); im=im.resize((int(im.width*s/im.height),s),Image.LANCZOS)
    pad=Image.new('RGBA',(im.width+16,im.height+16)); pad.paste(im,(8,8)); return outline_rgba(pad,4)
def roundflag(e,s):
    ef=ImageFont.truetype(EMO,109); im=Image.new('RGBA',(160,160)); ImageDraw.Draw(im).text((10,10),e,font=ef,embedded_color=True)
    im=im.crop(im.getbbox()); k=min(im.size); im=im.crop(((im.width-k)//2,(im.height-k)//2,(im.width+k)//2,(im.height+k)//2)).resize((s,s),Image.LANCZOS)
    out=Image.new('RGBA',(s+20,s+20)); d_=ImageDraw.Draw(out); d_.ellipse([0,0,s+19,s+19],fill='black'); d_.ellipse([4,4,s+15,s+15],fill='white')
    m=Image.new('L',(s,s),0); ImageDraw.Draw(m).ellipse([0,0,s-1,s-1],fill=255); out.paste(im,(10,10),m); return out
for fl in S.get('flags',[]):
    im=roundflag(fl['e'],fl.get('s',80)) if fl.get('round',True) else flag(fl['e'],fl.get('s',80)); x,y=fl['xy']
    sh=Image.new('RGBA',im.size,(0,0,0,0)); sh.putalpha(im.getchannel('A').point(lambda v:v*0.6)); canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(5)),(x+5,y+6))
    canvas.alpha_composite(im,(x,y))
def gradtext(xy,t,f,cols=((249,223,0),(252,135,1),(253,12,1))):
    x,y=xy; sw=max(8,f.size//7); bb=f.getbbox(t,stroke_width=sw); w_,h_=bb[2]+sw*2+12,bb[3]+sw*2+12
    st=Image.new('RGBA',(w_,h_)); ImageDraw.Draw(st).text((sw,sw),t,font=f,fill='black',stroke_width=sw,stroke_fill='black')
    sh=Image.new('RGBA',(w_,h_)); sh.putalpha(st.getchannel('A').point(lambda v:int(v*.7))); canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(4)),(x+5,y+7))
    canvas.alpha_composite(st,(x,y))
    m=Image.new('L',(w_,h_)); ImageDraw.Draw(m).text((sw,sw),t,font=f,fill=255)
    g=Image.new('RGBA',(w_,h_)); gd=ImageDraw.Draw(g); y1,y2=bb[1]+sw,bb[3]+sw
    for yy in range(h_):
        u=min(1,max(0,(yy-y1)/max(1,y2-y1)))*2; a,b=(cols[0],cols[1]) if u<1 else (cols[1],cols[2]); u=u if u<1 else u-1
        gd.line([(0,yy),(w_,yy)],fill=tuple(int(a[j]+(b[j]-a[j])*u) for j in range(3))+(255,))
    g.putalpha(m); canvas.alpha_composite(g,(x,y))
d=ImageDraw.Draw(canvas)
if 'split' in S:
    sp=S['split']; y0=th-4 if top else 0
    for i,lab in enumerate(sp.get('labels',[])):
        f=ImageFont.truetype(FONT,56); tw=d.textlength(lab,font=f)
        fl=flag(sp['flags'][i],62) if sp.get('flags') else None
        # 테두리 상자 없이: 동그란 국기 + NO!! 스티커 색(노랑→주황→빨강) 그라데이션 글자
        f=ImageFont.truetype(FONT,72); tw=d.textlength(lab,font=f); fl=roundflag(sp['flags'][i],70) if sp.get('flags') else None
        boxw=int(tw+(fl.width+12 if fl else 0)); bx=26 if i==0 else W-26-boxw; by=y0+18
        if fl: canvas.alpha_composite(fl,(bx,by+2))
        gradtext((bx+(fl.width+12 if fl else 0),by),lab,f); d=ImageDraw.Draw(canvas)
    if sp.get('vs',True):
        f=ImageFont.truetype(FONT,sp.get('vss',170)); t='VS'; tw=d.textlength(t,font=f); bb=d.textbbox((0,0),t,font=f)
        cy=sp.get('vsy',(y0+(H-bh))//2); x=(W-tw)/2; y=cy-(bb[3]+bb[1])/2
        d.text((x+8,y+10),t,font=f,fill='black',stroke_width=22,stroke_fill='black')
        d.text((x,y),t,font=f,fill='#FFE51F',stroke_width=22,stroke_fill='#E8132B')
        d.text((x,y),t,font=f,fill='#FFE51F',stroke_width=9,stroke_fill='black')
for bu in S.get('bubbles',[]):
    f=ImageFont.truetype(FONT,bu.get('s',40)); x,y=bu['xy']
    d.text((x,y),bu['t'],font=f,fill=COL.get(bu.get('c','white')),stroke_width=max(5,f.size//7),stroke_fill='black')
for q in S.get('qmark',[]):
    f=ImageFont.truetype(FONT,q.get('s',130)); x,y=q['xy']
    d.text((x+6,y+8),q['t'],font=f,fill='black',stroke_width=14,stroke_fill='black')
    d.text((x,y),q['t'],font=f,fill=COL.get(q.get('c','yellow')),stroke_width=12,stroke_fill='black')
# ---------- 글자 띠 ----------
def band(y0,y1,alpha=150,blur=6):
    reg=canvas.crop((0,y0,W,y1)).convert('RGB').filter(ImageFilter.GaussianBlur(blur))
    reg=Image.blend(reg,Image.new('RGB',reg.size,'black'),alpha/255); canvas.paste(reg,(0,y0))
full=('split' not in S) and S['bg'].get('full',False)
if top and full: band(0,th+6,S.get('dark',120))
if bot and (full or 'split' in S) and not S.get('firebar'): band(H-bh-10,H,S.get('dark',130))
d=ImageDraw.Draw(canvas)
def draw_lines(out,y):
    for L,f,h,off in out:
        w=d.textlength(L['t'],font=f); x=(W-w)/2
        sw=max(7,f.size//8)
        d.text((x+5,y-off+6),L['t'],font=f,fill='black',stroke_width=sw,stroke_fill='black')
        d.text((x,y-off),L['t'],font=f,fill=COL.get(L.get('c','yellow')),stroke_width=sw,stroke_fill='black')
        y+=h+14
draw_lines(to,10); draw_lines(bo,H-bh+4)
if S.get('tag'):
    f=ImageFont.truetype(FONT,38); w=d.textlength(S['tag'],font=f); tx,ty=S.get('tagxy',[18,th+8 if top else 18])
    d.rounded_rectangle([tx,ty,tx+w+28,ty+56],10,fill='#E8132B',outline='white',width=3); d.text((tx+14,ty+6),S['tag'],font=f,fill='white')
for f in S.get('fx',[]):
    if f.get('z')=='top': paste_fx(canvas,f)
canvas.convert('RGB').save(sys.argv[2],quality=93); print('ok',sys.argv[2])
