/*
 * REF-22 / REF-23 static layout studies. Source PNG bytes are never modified.
 * New SVG shapes are proposals, not restoration of unseen source pixels.
 * API: ReferencePreview.render(host, {kind, orientation, character, palette})
 */
(function (global) {
  'use strict';
  var serial = 0;
  var NS = 'http://www.w3.org/2000/svg';
  var REFERENCES_BASE = 'references/';
  var PAPER_SOURCE = Object.freeze({file:'REF-22.png', width:944, height:522, crop:Object.freeze([0,75,900,374])});

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function text(x,y,value,size,fill,weight,anchor,extra) {
    return '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="'+(fill||'#1D252D')+'" font-weight="'+(weight||500)+'" text-anchor="'+(anchor||'start')+'" '+(extra||'')+'>'+esc(value)+'</text>';
  }
  function rect(x,y,w,h,r,fill,extra) {
    return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'" fill="'+fill+'" '+(extra||'')+'/>';
  }
  function line(x1,y1,x2,y2,fill,width,extra) {
    return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+fill+'" stroke-width="'+width+'" '+(extra||'')+'/>';
  }
  function circle(x,y,r,fill,extra) {
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+fill+'" '+(extra||'')+'/>';
  }
  function path(d,fill,extra) { return '<path d="'+d+'" fill="'+fill+'" '+(extra||'')+'/>'; }
  function url(c,key) { return 'url(#'+c.id+'-'+key+')'; }
  function region(name,box,body) {
    return '<g data-region="'+name+'" data-box="'+[box.x,box.y,box.w,box.h].join(' ')+'">'+body+'</g>';
  }
  function defs(c) {
    return '<defs>'+
      '<linearGradient id="'+c.id+'-ambient" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#DDE6EB" stop-opacity="0.68"/><stop offset="1" stop-color="#D6DEE7" stop-opacity="0.28"/></linearGradient>'+
      '<linearGradient id="'+c.id+'-paperShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#FFFFFF" stop-opacity="0.28"/><stop offset="1" stop-color="#A8A69D" stop-opacity="0.13"/></linearGradient>'+
      '<filter id="'+c.id+'-cardShadow" x="-15%" y="-25%" width="130%" height="160%"><feDropShadow dx="0" dy="15" stdDeviation="18" flood-color="#283544" flood-opacity="0.16"/></filter>'+
      '<pattern id="'+c.id+'-paper" patternUnits="userSpaceOnUse" width="20" height="20">'+
        rect(0,0,20,20,0,'#E7E6E0')+
        path('M0 3 L6 2 M10 13 L19 12 M4 19 L9 18','none','stroke="#FFFFFF" stroke-width="1.2" opacity="0.44"')+
        path('M1 8 L8 9 M12 3 L18 4 M12 18 L17 17','none','stroke="#A5A398" stroke-width="0.7" opacity="0.28"')+
        circle(6,6,0.7,'#B7B5AB','opacity="0.40"')+circle(15,9,0.6,'#FFFFFF','opacity="0.70"')+
      '</pattern></defs>';
  }
  function character(c,box) {
    var s = rect(box.x,box.y,box.w,box.h,22,'#F5F7F8','stroke="#95A2AE" stroke-width="2.5" stroke-dasharray="10 9" opacity="0.97"');
    var cx=box.x+box.w/2, cy=box.y+box.h/2;
    s += text(cx,cy-34,'선택 캐릭터 자리',c.tall?37:31,'#5C6D7D',700,'middle');
    s += text(cx,cy+17,'개구리 시트 수신',c.tall?30:27,'#7A8896',500,'middle');
    s += text(cx,cy+59,'제작용 개별 자산 대기',c.tall?28:25,'#7A8896',500,'middle');
    return region('character',box,s);
  }
  function source(c,lines) {
    var b=c.source, s='';
    lines.forEach(function (value,i) { s+=text(b.x,b.y+(c.tall?29:30)+i*38,value,c.tall?30:27,'#566678',550); });
    return region('source',b,s);
  }
  function emptyCaption(c) {
    var b=c.caption;
    var s=rect(b.x,b.y,b.w,b.h,16,'none','stroke="#9CAAB8" stroke-width="2" stroke-dasharray="10 9" opacity="0.50"');
    s+=text(b.x+22,b.y+b.h-21,'주자막 영역 · 이 예시에서는 비움',c.tall?28:25,'#7D8B98',500);
    return region('caption',b,s);
  }
  function highlightLine(c,x,y,size) {
    // The highlight rectangle is measured from the actual SVG tspan after insertion.
    // A conservative fallback is kept for hosts that are not attached to the DOM yet.
    return rect(x+size*5.10,y-size*0.86,size*7.20,size*1.10,1,c.highlight,'id="'+c.id+'-highlight"')+
      '<text x="'+x+'" y="'+y+'" font-size="'+size+'" fill="#20252B" font-weight="500">You notice <tspan id="'+c.id+'-highlight-words">the small things</tspan>,</text>';
  }
  function comment(c) {
    var b=c.tall?
      {x:72,y:c.character?200:270,w:864,h:c.character?980:1120}:
      {x:c.character?96:240,y:168,w:c.character?1320:1440,h:660};
    var pad=c.tall?56:64, tx=b.x+pad, fs=c.tall?48:58;
    var s=rect(0,0,c.w,c.h,0,url(c,'ambient'));
    var card=rect(b.x,b.y,b.w,b.h,12,'#FFFFFF','stroke="#DCE2E8" stroke-width="1.5" filter="'+url(c,'cardShadow')+'"');
    var avatarX=b.x+pad+36, avatarY=b.y+82;
    card+=circle(avatarX,avatarY,38,'#E7ECF0');
    card+=text(avatarX,avatarY+15,'E',41,'#6C7D8C',750,'middle');
    card+=text(b.x+pad+98,b.y+72,'예시 작성자',c.tall?40:42,'#161B20',800);
    card+=text(b.x+pad+98,b.y+120,'@example · 날짜 확인 전',c.tall?29:32,'#818B95',450);
    var bodyY=c.tall?(b.y+(c.character?270:320)):b.y+218;
    var leading=c.tall?(c.character?80:88):78;
    card+=text(tx,bodyY,'Some details stay with you.',fs,'#20252B',500);
    card+=highlightLine(c,tx,bodyY+leading,fs);
    card+=text(tx,bodyY+leading*2,'then see the whole scene.',fs,'#20252B',500);
    var trY=c.tall?b.y+(c.character?545:615):b.y+424;
    var trH=c.tall?(c.character?330:360):184;
    var trX=b.x+(c.tall?40:44), trW=b.w-(c.tall?80:88);
    card+=rect(trX,trY,trW,trH,16,'#F1F4F6');
    card+=text(trX+26,trY+(c.tall?58:39),'한국어 번역',c.tall?31:27,'#8A95A0',650);
    card+=text(trX+26,trY+(c.tall?142:94),'작은 장면을 보고 나면,',c.tall?48:46,'#26323C',650);
    card+=text(trX+26,trY+(c.tall?222:153),'전체가 조금 다르게 보여요.',c.tall?48:46,'#26323C',650);
    s+=region('comment-card',b,card);
    if(c.character) s+=character(c,c.tall?{x:72,y:1238,w:864,h:210}:{x:1488,y:252,w:336,h:492});
    if(c.tall) s+=source(c,['예시 레이아웃 · 실제 댓글 아님','🌸 REF-23 카드 구조 참고 · '+(c.palette==='lime'?'연두 비교안':'노랑 실측색 적용')]);
    else s+=source(c,['🌸 REF-23 카드 구조 참고 · 예시 레이아웃 · 실제 댓글 아님'+(c.palette==='lime'?' · 연두 비교안':'')]);
    s+=emptyCaption(c);
    return s;
  }
  function tornStrip(c,x,y,w,h,side) {
    // New deterministic SVG edge: a proposal, never a reconstruction claim.
    var offsets=[0,3,-2,2,5,-1,2,-4,1,4,-2,0,3,-3,2,1,-2,4,0,-3,2,-1,3,1,-2,4,-1,2,-3,1,0];
    var edge=[],i;
    for(i=0;i<=80;i++) {
      var xx=x+w*i/80;
      var yy=side==='top'?y+h-6+offsets[i%offsets.length]:y+6+offsets[(i+9)%offsets.length];
      edge.push([xx,yy]);
    }
    var d;
    if(side==='top') d='M'+x+' '+y+' H'+(x+w)+' V'+edge[edge.length-1][1]+' '+edge.slice().reverse().map(function(p){return 'L'+p[0]+' '+p[1];}).join(' ')+' Z';
    else d='M'+x+' '+(y+h)+' H'+(x+w)+' V'+edge[edge.length-1][1]+' '+edge.slice().reverse().map(function(p){return 'L'+p[0]+' '+p[1];}).join(' ')+' Z';
    var rim='M'+edge[0][0]+' '+edge[0][1]+' '+edge.slice(1).map(function(p){return 'L'+p[0]+' '+p[1];}).join(' ');
    return path(d,url(c,'paper'))+path(d,url(c,'paperShade'))+
      path(rim,'none','stroke="#F7F6EF" stroke-width="5" stroke-linejoin="round"')+
      path(rim,'none','stroke="#AEAFA9" stroke-width="1" opacity="0.40"');
  }
  function originalWindow(c,b) {
    // Nested SVG controls the display crop. The PNG itself stays byte-for-byte original.
    var crop=PAPER_SOURCE.crop;
    return '<svg x="'+b.x+'" y="'+b.y+'" width="'+b.w+'" height="'+b.h+'" viewBox="'+crop.join(' ')+'" preserveAspectRatio="xMidYMid meet" overflow="hidden" data-region="source-image-window" data-crop="'+crop.join(' ')+'">'+
      '<image href="'+REFERENCES_BASE+PAPER_SOURCE.file+'" x="0" y="0" width="'+PAPER_SOURCE.width+'" height="'+PAPER_SOURCE.height+'" preserveAspectRatio="none"/>'+
      '</svg>';
  }
  function paper(c) {
    var s=rect(0,0,c.w,c.h,0,'#F2F1ED');
    // Paper is rebuilt at each canvas size. The source image retains its aspect ratio.
    var imageW=c.tall?864:(c.character?1388:1728);
    var imageH=imageW*PAPER_SOURCE.crop[3]/PAPER_SOURCE.crop[2];
    var imageX=c.tall?72:96;
    var imageY=c.tall?(c.character?554:670):(c.character?229:142);
    var b={x:imageX,y:imageY,w:imageW,h:imageH};
    var stripH=c.tall?86:74;
    // Thin top/bottom paper bands, no fake vertical stretching or duplicated faces.
    s+=rect(imageX,imageY-12,imageW,imageH+24,2,'#3D454A','filter="'+url(c,'cardShadow')+'"');
    s+=originalWindow(c,b);
    s+=tornStrip(c,imageX,imageY-stripH+12,imageW,stripH,'top');
    s+=tornStrip(c,imageX,imageY+imageH-12,imageW,stripH,'bottom');
    if(c.character) s+=character(c,c.tall?{x:72,y:1238,w:864,h:210}:{x:1524,y:269,w:300,h:470});
    var cr=c.caption;
    var capW=c.tall?864:1392, capX=c.tall?72:(1920-capW)/2;
    var capH=c.tall?126:100, capY=cr.y+(cr.h-capH)/2;
    var cap=rect(capX,capY,capW,capH,21,'#39454A');
    cap+=text(capX+capW/2,capY+(c.tall?77:65),'장면의 자막은 여기 한 줄로',c.tall?48:48,'#FFFFFF',550,'middle');
    s+=region('caption',cr,cap);
    if(c.tall) s+=source(c,['🌸 종이 모양 재구성 · 정지 배치 예시','REF-22 내부 영상 표시 · 원본 복원 아님']);
    else s+=source(c,['🌸 종이 모양 재구성 · 정지 배치 예시   |   REF-22 내부 영상 표시 · 원본 복원 아님']);
    return s;
  }
  function alignHighlight(svg,c) {
    if(c.kind!=='comment') return;
    var target=svg.querySelector('#'+c.id+'-highlight-words');
    var marker=svg.querySelector('#'+c.id+'-highlight');
    if(!target||!marker||typeof target.getBBox!=='function') return;
    try {
      var box=target.getBBox();
      if(box.width>0&&box.height>0) {
        marker.setAttribute('x',box.x-5);
        marker.setAttribute('y',box.y-2);
        marker.setAttribute('width',box.width+10);
        marker.setAttribute('height',box.height+4);
      }
    } catch (ignore) { /* Detached hosts keep the conservative fallback until the next frame. */ }
  }
  function render(host,options) {
    if(!host||typeof host.replaceChildren!=='function') throw new TypeError('ReferencePreview.render requires a DOM host.');
    options=options||{};
    var c={id:'rp-'+(++serial),kind:options.kind==='paper'?'paper':'comment',tall:options.orientation==='tall',character:options.character===true,palette:options.palette==='lime'?'lime':'reference'};
    c.w=c.tall?1080:1920; c.h=c.tall?1920:1080;
    c.highlight=c.palette==='lime'?'#BCFF34':'#FBFF15';
    c.source=c.tall?{x:72,y:1496,w:864,h:76}:{x:96,y:876,w:1728,h:42};
    c.caption=c.tall?{x:72,y:1596,w:864,h:164}:{x:96,y:940,w:1728,h:100};
    var svg=document.createElementNS(NS,'svg');
    svg.setAttribute('xmlns',NS);
    svg.setAttribute('viewBox','0 0 '+c.w+' '+c.h);
    svg.setAttribute('width','100%'); svg.setAttribute('height','100%');
    svg.setAttribute('preserveAspectRatio','xMidYMid meet');
    svg.setAttribute('role','img');
    svg.setAttribute('aria-labelledby',c.id+'-title '+c.id+'-desc');
    svg.setAttribute('font-family','Noto Sans KR, Apple SD Gothic Neo, Malgun Gothic, system-ui, sans-serif');
    var title=c.kind==='comment'?'악마 없는 흰 댓글 카드: 예시 레이아웃':'찢어진 종이 프레임: 새 SVG 모식도';
    svg.innerHTML='<title id="'+c.id+'-title">'+esc(title)+'</title><desc id="'+c.id+'-desc">'+(c.kind==='comment'?'실제 댓글이 아닌 예시 문구이며, 새 카드 도형을 그린 정지 모식도입니다. 실제 작성자나 인용을 생성한 것이 아닙니다.':'REF-22의 원본 파일을 수정 없이 표시영역으로 잘라 보고, 별도로 새 종이 도형을 얹은 정지 배치 예시입니다. 영상 동작을 검수한 결과가 아닙니다.')+'</desc>'+defs(c)+(c.kind==='comment'?comment(c):paper(c));
    host.classList.add('reference-preview-frame');
    host.dataset.orientation=c.tall?'tall':'wide'; host.dataset.kind=c.kind; host.dataset.palette=c.palette;
    host.replaceChildren(svg);
    alignHighlight(svg,c);
    if(typeof global.requestAnimationFrame==='function') global.requestAnimationFrame(function(){if(host.contains(svg)) alignHighlight(svg,c);});
    return svg;
  }
  global.ReferencePreview=Object.freeze({render:render,kinds:Object.freeze(['comment','paper']),paperSource:PAPER_SOURCE,version:'1.0.0'});
})(typeof window==='undefined'?globalThis:window);
