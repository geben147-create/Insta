/* Material studies reconstructed from the supplied reference captures.
 * SVG is deliberately editable. These are measured-layout studies, not recovered
 * original 3D scenes. Map pixels and the live-action window remain reference images.
 */
(function (global) {
  'use strict';
  const REF = '../design-reference-master-20261124/references/';
  const BLUE = ['#03195B','#0B2CB1','#1951FC','#3781FC','#3781FC','#CBE9FD'];
  const base = {
    width:1280, height:720, mainColor:'#1951FC', deepColor:'#03195B',
    lightColor:'#CBE9FD', background:'#EEEEEE', gradientAngle:135,
    glowX:52, glowY:52, glowRadius:44, blur:17, thickness:16,
    rim:75, shadow:28, shadowBlur:22, padding:6, scale:100,
    fontScale:100, labelScale:100, fontFamily:'Arial', showLabels:true, title:'', value:'', layers:{glow:true,rim:true,shadow:true,texture:true}
  };
  const per = {
    map:{mainColor:'#F76D0B',deepColor:'#AD4B08',lightColor:'#FFE3C4',background:'#EEEEEE',value:'90%',title:'세계로 이어지는 가능성',padding:0,fontScale:100,labelScale:100},
    amber:{mainColor:'#DB8933',deepColor:'#8D3D08',lightColor:'#FFF2C9',background:'#ECECEC',value:'1,100',title:'유리 접시 · 앰버 구성비',thickness:31,blur:8,padding:0,shadow:42},
    glow:{mainColor:'#243DFF',deepColor:'#1D2BB9',lightColor:'#B8C9FF',background:'#EEEEEE',value:'70%',title:'빛으로 드러나는 구성비',blur:19,glowRadius:40,glowY:54,thickness:32,padding:0,shadow:38},
    funnel:{mainColor:'#1951FC',deepColor:'#1735D5',lightColor:'#E3EAFE',background:'#E9ECF4',title:'Signup to Paid Funnel',calloutTitle1:'Biggest drop:',calloutBody1:'activation',calloutTitle2:'Winning change:',calloutBody2:'onboarding checklist v3',thickness:30,shadow:58,shadowBlur:17,padding:0},
    slabs:{mainColor:'#1951FC',deepColor:'#03195B',lightColor:'#CBE9FD',background:'#000000',title:'',padding:0,rim:90,shadow:36,shadowBlur:15,blur:10},
    pipe:{mainColor:'#2583EB',deepColor:'#062C85',lightColor:'#D9F4FF',background:'#F1F5F8',title:'REPURPOSE YOUR REVIEWS',thickness:15,blur:8},
    bars:{mainColor:'#01EFD1',deepColor:'#013476',lightColor:'#DFFEEB',background:'#F4F8FC',title:'숫자를 입체적으로',palette:['#FE9E13','#013476','#01EFD1','#FC395B'],values:[50,25,100,75],labels:['LOREM IPSUM','LOREM IPSUM','LOREM IPSUM','LOREM IPSUM'],thickness:24,blur:10,padding:0,shadow:42},
    territory:{mainColor:'#FB2B56',deepColor:'#863143',lightColor:'#FFE148',background:'#ECECEC',title:'강조 지역 · 경계 · 위치',value:'선택 지역'},
    paper:{mainColor:'#B0AFAB',deepColor:'#74746E',lightColor:'#EAE9E0',background:'#B0AFAB',title:'',value:'다른 도시에서는 터부시하는 것들',thickness:9,padding:0,blur:1,rim:80,shadow:25}
  };
  let serial=0;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const clamp=(n,a,b)=>Math.min(b,Math.max(a,Number.isFinite(+n)?+n:a));
  const hex=(v,f='#1951FC')=>/^#[0-9a-f]{6}$/i.test(String(v))?v:f;
  const mix=(a,b,p)=>{a=hex(a);b=hex(b);p=clamp(p,0,1);return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-p)+parseInt(b.slice(i,i+2),16)*p).toString(16).padStart(2,'0')).join('');};
  const attrs=(o)=>Object.entries(o).filter(([,v])=>v!==null&&v!==undefined).map(([k,v])=>`${k}="${esc(v)}"`).join(' ');
  const tag=(n,o={},content='')=>`<${n} ${attrs(o)}>${content}</${n}>`;
  const text=(x,y,v,size=22,fill='#17243C',extra={})=>tag('text',{x,y,'font-size':size,fill,'font-family':'Arial, "Noto Sans KR", sans-serif',...extra},esc(v));
  const path=(d,fill,extra={})=>tag('path',{d,fill,...extra});
  const rect=(x,y,w,h,fill,extra={})=>tag('rect',{x,y,width:w,height:h,fill,...extra});
  const ellipse=(cx,cy,rx,ry,fill,extra={})=>tag('ellipse',{cx,cy,rx,ry,fill,...extra});
  const circle=(cx,cy,r,fill,extra={})=>tag('circle',{cx,cy,r,fill,...extra});
  const line=(x1,y1,x2,y2,stroke,sw=1,extra={})=>tag('line',{x1,y1,x2,y2,stroke,'stroke-width':sw,...extra});
  function defaults(id){return JSON.parse(JSON.stringify({...base,...per[id]}));}
  function sanitize(id, input={}) {
    const c={...defaults(id),...input}; c.layers={...base.layers,...input.layers};
    ['mainColor','deepColor','lightColor','background'].forEach(k=>c[k]=hex(c[k],defaults(id)[k]));
    c.width=clamp(c.width,320,3840);c.height=clamp(c.height,320,3840);
    c.gradientAngle=clamp(c.gradientAngle,0,360);c.glowX=clamp(c.glowX,0,100);c.glowY=clamp(c.glowY,0,100);
    c.glowRadius=clamp(c.glowRadius,5,100);c.blur=clamp(c.blur,0,60);c.thickness=clamp(c.thickness,0,40);
    c.rim=clamp(c.rim,0,100);c.shadow=clamp(c.shadow,0,100);c.shadowBlur=clamp(c.shadowBlur,0,60);
    c.padding=clamp(c.padding,0,20);c.scale=clamp(c.scale,60,120);
    c.fontScale=clamp(c.fontScale,60,180);c.labelScale=clamp(c.labelScale,60,180);c.fontFamily=['Arial','Arial Narrow','Roboto','Noto Sans KR','Georgia'].includes(c.fontFamily)?c.fontFamily:'Arial';
    ['calloutTitle1','calloutBody1','calloutTitle2','calloutBody2'].forEach(k=>{if(c[k]!==undefined)c[k]=String(c[k]).slice(0,100);});
    c.stops=Array.isArray(c.stops)&&c.stops.length>1?c.stops.map(s=>({offset:clamp(s.offset,0,100),color:hex(s.color),opacity:s.opacity===undefined?1:clamp(s.opacity,0,1)})).sort((a,b)=>a.offset-b.offset):null;
    return c;
  }
  function scene(id,c) {
    const prefix='ml'+(++serial)+'-'; const defs=[];
    const add=(name,markup)=>{defs.push(markup.replaceAll('__ID__',prefix+name));return 'url(#'+prefix+name+')';};
    const linear=(name,stops,angle=c.gradientAngle)=>{
      const r=angle*Math.PI/180,dx=Math.cos(r)*50,dy=Math.sin(r)*50;
      return add(name,tag('linearGradient',{id:'__ID__',x1:(50-dx)+'%',y1:(50-dy)+'%',x2:(50+dx)+'%',y2:(50+dy)+'%'},stops.map(s=>tag('stop',{offset:s.offset+'%','stop-color':s.color,'stop-opacity':s.opacity??1})).join('')));
    };
    const radial=(name,stops,cx=50,cy=50,r=50)=>add(name,tag('radialGradient',{id:'__ID__',cx:cx+'%',cy:cy+'%',r:r+'%'},stops.map(s=>tag('stop',{offset:s.offset+'%','stop-color':s.color,'stop-opacity':s.opacity??1})).join('')));
    const blur=(name,std)=>add(name,tag('filter',{id:'__ID__',x:'-60%',y:'-60%',width:'220%',height:'220%','color-interpolation-filters':'sRGB'},tag('feGaussianBlur',{stdDeviation:std})));
    const clip=(name,shape)=>{add(name,tag('clipPath',{id:'__ID__'},shape));return 'url(#'+prefix+name+')';};
    const bg=id==='slabs'?c.background:linear('background',[{offset:0,color:mix(c.background,'#FFFFFF',0.08)},{offset:65,color:c.background},{offset:100,color:mix(c.background,'#000000',0.04)}],90);
    const shadowFilter=blur('shadow',Math.max(0.2,c.shadowBlur));
    const softFilter=blur('soft',Math.max(0.1,c.blur));
    const body=linear('body',c.stops||[{offset:0,color:c.lightColor},{offset:42,color:c.mainColor},{offset:100,color:c.deepColor}]);
    const rim=linear('rim',[{offset:0,color:'#FFFFFF',opacity:.96},{offset:22,color:c.lightColor,opacity:.7},{offset:42,color:c.deepColor,opacity:.22},{offset:62,color:'#FFFFFF',opacity:.86},{offset:100,color:c.lightColor,opacity:.3}],115);
    const darkRim=linear('darkrim',[{offset:0,color:c.deepColor,opacity:.8},{offset:26,color:'#FFFFFF',opacity:.3},{offset:65,color:c.deepColor,opacity:.7},{offset:100,color:'#FFFFFF',opacity:.8}],115);
    const W=1000,H=c.height/c.width*W,tall=H>W,pad=c.padding/100*Math.min(W,H);
    const fit=(content,bw,bh,area={x:pad,y:pad,w:W-2*pad,h:H-2*pad})=>{
      const s=Math.min(area.w/bw,area.h/bh)*c.scale/100;
      return tag('g',{transform:`translate(${area.x+(area.w-bw*s)/2} ${area.y+(area.h-bh*s)/2}) scale(${s})`},content);
    };
    const imageCrop=(file,box,x,y,w,h,full=[1279,1536])=>tag('svg',{x,y,width:w,height:h,viewBox:box.join(' '),preserveAspectRatio:'xMidYMid meet',overflow:'hidden'},tag('image',{href:REF+file,x:0,y:0,width:full[0],height:full[1],preserveAspectRatio:'none'}));
    return {id,c,prefix,defs,linear,radial,blur,clip,bg,body,rim,darkRim,shadowFilter,softFilter,W,H,tall,pad,fit,imageCrop};
  }
  function slabs(s) {
    const {c}=s; let b='';
    const cols=Array.isArray(c.palette)&&c.palette.length===6?c.palette.map((x,i)=>hex(x,BLUE[i])):[c.deepColor,BLUE[1],c.mainColor,BLUE[3],BLUE[4],c.lightColor];
    // Coordinates are relative to REF-05 crop [180,315,960,925].
    const bw=960,bh=925,x=22,w=691,h=261,rx=125;
    const rowTops=[17,144,268,393,517,640];
    // No broad ground halo: the reference has a black field and a tiny edge bloom.
    // Calibrated display-light transfer, not recovered physical optical properties.
    // Hue/saturation/value changes remain relative to each edited token, preserving its chosen hue.
    const capturedBody=['#021044','#051D87','#0E35C3','#2D72FD','#54AEF8','#68ABEF'];
    const toHSV=color=>{
      const [r,g,b]=[1,3,5].map(at=>parseInt(color.slice(at,at+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
      const h=!d?0:max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;
      return [h*60,max?d/max:0,max];
    };
    const fromHSV=([h,ss,v])=>{
      const h6=((h%360)+360)%360/60,c=v*ss,x=c*(1-Math.abs(h6%2-1)),m=v-c;
      const rgb=h6<1?[c,x,0]:h6<2?[x,c,0]:h6<3?[0,c,x]:h6<4?[0,x,c]:h6<5?[x,0,c]:[c,0,x];
      return '#'+rgb.map(q=>Math.round((q+m)*255).toString(16).padStart(2,'0')).join('');
    };
    const shade=(color,i)=>{
      const reference=toHSV(BLUE[i]),surface=toHSV(capturedBody[i]),chosen=toHSV(color);
      return fromHSV([chosen[0]+surface[0]-reference[0],clamp(chosen[1]*surface[1]/reference[1],0,1),clamp(chosen[2]*surface[2]/reference[2],0,1)]);
    };
    if(c.title)b+=text(368,45,c.title,26,'#D3D9E2',{'text-anchor':'middle','font-weight':300});
    cols.forEach((co,i)=>{
      const y=rowTops[i],depth=c.thickness*.75;
      const baseCo=shade(co,i);
      const cyan=mix(c.lightColor,'#DFFAFF',.32);
      const deep=mix(baseCo,'#000000',i<3?.04:.015);
      const top=mix(baseCo,cyan,i<3?.16:.36);
      const gradients=c.stops?c.stops.map(o=>({...o,color:mix(o.color,baseCo,.48)})):[{offset:0,color:top},{offset:12,color:mix(top,baseCo,.55)},{offset:35,color:mix(baseCo,cyan,.035)},{offset:67,color:baseCo},{offset:88,color:mix(baseCo,deep,.5)},{offset:100,color:mix(baseCo,cyan,.16)}];
      const fill=s.linear('slab-body'+i,gradients,c.gradientAngle);
      const left=s.radial('slab-left'+i,[{offset:0,color:'#F0FFFF',opacity:.88},{offset:14,color:cyan,opacity:.65},{offset:38,color:cyan,opacity:.21},{offset:72,color:co,opacity:.02},{offset:100,color:co,opacity:0}],0,53,43);
      const right=s.radial('slab-right'+i,[{offset:0,color:'#FFFFFF',opacity:.99},{offset:9,color:'#F0FFFF',opacity:.89},{offset:23,color:cyan,opacity:.48},{offset:48,color:co,opacity:.04},{offset:100,color:co,opacity:0}],92,9,31);
      const topLight=s.linear('slab-top'+i,[{offset:0,color:'#F1FFFF',opacity:i>3?.88:.195},{offset:7,color:cyan,opacity:i>3?.66:.1575},{offset:19,color:cyan,opacity:i>3?.32:.09},{offset:39,color:cyan,opacity:i>3?.08:.01125},{offset:100,color:cyan,opacity:0}],90);
      const leftWrap=s.linear('slab-left-wrap'+i,[{offset:0,color:'#EBFFFF',opacity:i>2?.66:.25},{offset:3,color:cyan,opacity:i>2?.36:.16},{offset:10,color:cyan,opacity:.12},{offset:24,color:cyan,opacity:0},{offset:100,color:cyan,opacity:0}],0);
      const internal=s.radial('slab-inner'+i,[{offset:0,color:baseCo,opacity:0},{offset:61,color:baseCo,opacity:0},{offset:93,color:c.deepColor,opacity:.16},{offset:100,color:cyan,opacity:.2}],51,45,72);
      const slabRim=s.linear('slab-rim'+i,[{offset:0,color:cyan,opacity:.5},{offset:21,color:cyan,opacity:.77},{offset:45,color:co,opacity:.25},{offset:69,color:cyan,opacity:.62},{offset:100,color:c.lightColor,opacity:.3}],115);
      const cp=s.clip('slab-clip'+i,rect(x,y,w,h,'#FFF',{rx}));
      if(c.layers.shadow)b+=rect(x+8,y+depth+13,w,h, '#010714',{rx,opacity:c.shadow/100,filter:s.shadowFilter});
      b+=rect(x+3,y+depth,w,h,mix(baseCo,c.deepColor,.45),{rx,stroke:mix(baseCo,c.lightColor,.13),'stroke-width':2});
      if(c.layers.glow)b+=rect(x,y,w,h,fill,{rx,stroke:mix(baseCo,cyan,.28),'stroke-width':2,filter:s.blur('slab-bloom'+i,1.5+c.blur*.15),opacity:.5});
      b+=rect(x,y,w,h,fill,{rx});
      b+=tag('g',{'clip-path':cp},rect(x,y,w,h,internal)+rect(x,y,w,h,left)+rect(x,y,w,h,right)+rect(x,y,w,h,topLight)+rect(x,y,w,h,leftWrap));
      if(c.layers.rim){
        b+=rect(x+1.5,y+1.5,w-3,h-3,'none',{rx:rx-1,stroke:slabRim,'stroke-width':2.7,opacity:c.rim/100});
        b+=rect(x+7,y+8,w-14,h-17,'none',{rx:rx-8,stroke:s.darkRim,'stroke-width':1.1,opacity:c.rim/650});
        b+=path(`M ${x+18} ${y+131} C ${x+17} ${y+72}, ${x+55} ${y+14}, ${x+115} ${y+12} L ${x+w-126} ${y+12} C ${x+w-71} ${y+12}, ${x+w-32} ${y+37}, ${x+w-20} ${y+66}`,'none',{stroke:slabRim,'stroke-width':2.1,'stroke-linecap':'round',opacity:c.rim/190});
        b+=path(`M ${x+w-96} ${y+13} Q ${x+w-35} ${y+16} ${x+w-12} ${y+73}`,'none',{stroke:'#DDF8FF','stroke-width':1.5,opacity:c.rim/130});
        b+=path(`M ${x+8} ${y+h-96} Q ${x+14} ${y+h-20} ${x+91} ${y+h-10}`,'none',{stroke:cyan,'stroke-width':1.4,opacity:c.rim/150});
      }
      if(c.showLabels){
        const ly=92+i*140;
        b+=line(726,ly,780,ly,'#AAB4C2',2,{opacity:.65});
        b+=circle(794,ly,11,co,{stroke:mix(co,'#FFFFFF',.12),'stroke-width':1});
        b+=text(833,ly+7,co,22,'#D1D8E2');
      }
    });
    return s.fit(b,bw,bh);
  }
  function glow(s) {
    const {c}=s;let b='';
    // REF-03 crop [160,245,1065,825]. Top face and cut walls have different lighting.
    const cx=415,cy=415,r=350,smallCx=385,smallCy=380,depth=c.thickness;
    const at=(a,x=cx,y=cy)=>[x+r*Math.cos(a*Math.PI/180),y+r*Math.sin(a*Math.PI/180)];
    const wedge=(start,end,x=cx,y=cy)=>{const a=at(start,x,y),d=at(end,x,y);return `M ${x} ${y} L ${a[0]} ${a[1]} A ${r} ${r} 0 ${end-start>180?1:0} 1 ${d[0]} ${d[1]} Z`;};
    const small=wedge(180,288,smallCx,smallCy),large=wedge(288,540);
    const white=s.linear('pie-face',[{offset:0,color:'#FAFAFA'},{offset:27,color:'#F4F4F3'},{offset:64,color:'#ECECEB'},{offset:100,color:'#DEDFDD'}],80);
    const side=s.linear('pie-side',[{offset:0,color:'#CACCC8'},{offset:21,color:'#B7BAB4'},{offset:48,color:'#E2E3DF'},{offset:82,color:'#D0D3CD'},{offset:100,color:'#E3E5DF'}],90);
    const blue=s.radial('bluecore',c.stops||[{offset:0,color:c.mainColor,opacity:.99},{offset:48,color:c.mainColor,opacity:.99},{offset:69,color:mix(c.mainColor,c.deepColor,.12),opacity:.96},{offset:81,color:c.mainColor,opacity:.56},{offset:92,color:c.mainColor,opacity:.12},{offset:100,color:c.mainColor,opacity:0}],c.glowX,c.glowY,c.glowRadius);
    if(c.layers.shadow){b+=ellipse(435,625,340,126,'#767B75',{opacity:c.shadow/170,filter:s.shadowFilter});b+=ellipse(432,662,263,60,'#7E837D',{opacity:c.shadow/240,filter:s.blur('pie-contact',14)});}
    b+=tag('g',{transform:`translate(0 ${depth})`},path(large,side));
    b+=path(large,white);
    const lclip=s.clip('pie-large-clip',path(large,'#FFF'));
    if(c.layers.glow)b+=tag('g',{'clip-path':lclip},rect(65,65,700,700,blue,{filter:s.softFilter}));
    // The small piece is raised and separated. Its front cut face carries the same blue field.
    const edge=at(288,smallCx,smallCy),wallX=depth*30/32;
    // Extrude down AND right: pure vertical extrusion makes the diagonal wall a thin bevel.
    const cut=`M ${smallCx-r} ${smallCy} L ${smallCx} ${smallCy} L ${edge[0]} ${edge[1]} L ${edge[0]+wallX} ${edge[1]+depth} L ${smallCx+wallX} ${smallCy+depth} L ${smallCx-r+wallX} ${smallCy+depth} Z`;
    const cutclip=s.clip('pie-cut-clip',path(cut,'#FFF'));
    b+=path(cut,side);
    const cutBlue=s.radial('pie-cut-blue',[{offset:0,color:c.deepColor,opacity:.99},{offset:76,color:mix(c.deepColor,c.mainColor,.18),opacity:.99},{offset:96,color:mix(c.deepColor,c.mainColor,.28),opacity:.98},{offset:100,color:c.mainColor,opacity:0}],c.glowX,c.glowY,Math.max(5,c.glowRadius-5));
    if(c.layers.glow)b+=tag('g',{'clip-path':cutclip},rect(65,65,700,700,cutBlue));
    b+=path(small,white);
    const sclip=s.clip('pie-small-clip',path(small,'#FFF'));
    if(c.layers.glow)b+=tag('g',{'clip-path':sclip},rect(65,65,700,700,blue,{filter:s.softFilter}));
    if(c.layers.rim){b+=path(`M ${smallCx-r} ${smallCy} L ${smallCx} ${smallCy} L ${edge[0]} ${edge[1]}`,'none',{stroke:'#FFFFFF','stroke-width':1.6,opacity:c.rim/260});b+=path(large,'none',{stroke:'#FFFFFF','stroke-width':1.2,opacity:c.rim/350});b+=path(small,'none',{stroke:'#FFFFFF','stroke-width':1.2,opacity:c.rim/350});}
    if(c.showLabels){
      b+=text(328,316,'30%',46,c.lightColor,{'font-weight':600,'text-anchor':'middle',opacity:.82});
      b+=text(328,342,'6798 m²',22,c.lightColor,{'text-anchor':'middle',opacity:.64});
      b+=text(446,492,c.value||'70%',46,c.lightColor,{'font-weight':600,'text-anchor':'middle',opacity:.82});
      b+=text(446,520,'15562 m²',22,c.lightColor,{'text-anchor':'middle',opacity:.64});
      b+=line(496,58,1030,58,'#C5C6C3',1,{opacity:.65});b+=text(1030,49,'전시 면적',24,'#B5B7B2',{'text-anchor':'end'});
      b+=line(755,416,1030,416,'#C4C6C2',1,{opacity:.65});b+=text(1030,375,'추가 면적',24,'#B5B7B2',{'text-anchor':'end'});
    }
    return s.fit(b,1065,825);
  }
  function amber(s) {
    const {c}=s;let b='';
    // Source crop 485×560. A petri dish has a tall transparent cylindrical rim,
    // a lower base and dark optical seams; those are independent of the pie fill.
    const cx=247,cy=363,rx=185,ry=88,t=c.thickness;
    const gold=s.linear('amberfill',c.stops||[{offset:0,color:mix(c.mainColor,c.deepColor,.18)},{offset:19,color:mix(c.mainColor,'#FBA434',.32)},{offset:44,color:c.mainColor},{offset:72,color:mix(c.mainColor,c.lightColor,.26)},{offset:91,color:mix(c.mainColor,'#EDAA49',.30)},{offset:100,color:mix(c.mainColor,c.deepColor,.20)}],c.gradientAngle-30);
    const rim=s.linear('dish-rim',[{offset:0,color:'#3F3027',opacity:.8},{offset:9,color:'#FFFDF2',opacity:.96},{offset:19,color:'#8B8B81',opacity:.40},{offset:33,color:'#FFFFFF',opacity:.82},{offset:51,color:'#6F5C41',opacity:.46},{offset:70,color:'#FFFFFF',opacity:.9},{offset:88,color:'#483C31',opacity:.65},{offset:100,color:'#FEFEF7',opacity:.91}],105);
    const wall=s.linear('dish-wall',[{offset:0,color:'#FFFFFF',opacity:.50},{offset:18,color:'#F3F6F7',opacity:.15},{offset:42,color:'#CCD2D4',opacity:.08},{offset:68,color:'#616766',opacity:.26},{offset:82,color:'#FFFFFF',opacity:.82},{offset:91,color:'#4A4641',opacity:.58},{offset:100,color:'#F7FAF6',opacity:.64}],90);
    const edge=s.linear('amber-side',[{offset:0,color:'#D69C40'},{offset:23,color:'#C16B16'},{offset:42,color:'#9B3E09'},{offset:68,color:'#77300A'},{offset:83,color:'#CC7C24'},{offset:100,color:'#FFE4A2'}],90);
    const arc=(y)=>`M ${cx-rx} ${y} A ${rx} ${ry} 0 0 0 ${cx+rx} ${y}`;
    const irx=rx-7,iry=ry-7,ex=cx+irx*.5,ey=cy+iry*Math.sqrt(3)/2;
    const half=`M ${cx} ${cy} L ${cx} ${cy-iry} A ${irx} ${iry} 0 0 1 ${ex} ${ey} Z`;
    const side=`M ${cx+irx} ${cy} A ${irx} ${iry} 0 0 1 ${ex} ${ey} L ${ex} ${ey+t} A ${irx} ${iry} 0 0 0 ${cx+irx} ${cy+t} Z`;
    if(c.layers.shadow){b+=ellipse(cx+3,cy+t+51,rx-8,54,'#88867E',{opacity:c.shadow/175,filter:s.shadowFilter});b+=ellipse(cx,cy+t+37,rx-16,25,'#77766D',{opacity:c.shadow/190,filter:s.blur('dish-contact',8)});}
    // Base reflection and front wall are separate, avoiding a flat orange wedge.
    if(c.layers.glow)b+=ellipse(cx+3,cy+t+58,rx-12,45,'#FFFFFF',{opacity:.25,filter:s.softFilter});
    b+=ellipse(cx,cy+t,rx,ry,wall,{stroke:'#8F918B','stroke-width':1.5,'stroke-opacity':.55});
    b+=path(side,edge);
    b+=ellipse(cx,cy+5,rx-7,ry-7,'#F4F5F3',{'fill-opacity':.18});
    b+=path(half,gold,{'fill-opacity':.97});
    const absorption=s.radial('dish-amber-absorption',[{offset:0,color:'#FFFFFF',opacity:0},{offset:62,color:'#FFFFFF',opacity:0},{offset:86,color:c.deepColor,opacity:.12},{offset:100,color:c.deepColor,opacity:.45}],50,42,72);
    b+=path(half,absorption);
    // Three partition walls, raised above the fill plane, have reflected double edges.
    const endpoints=[[cx,cy-ry],[cx-rx+6,cy-10],[ex,ey]];
    endpoints.forEach(([ex,ey],i)=>{
      b+=path(`M ${cx} ${cy-t*.28} L ${ex} ${ey-t*.28} L ${ex} ${ey+t*.62} L ${cx} ${cy+t*.62} Z`,wall,{stroke:i===0?'#B9B4A6':'#E6EEED','stroke-width':1.3});
      b+=line(cx,cy-t*.28,ex,ey-t*.28,'#FFFFFF',1.4,{opacity:.85});
      b+=line(cx+1,cy+t*.58,ex+1,ey+t*.58,i===2?'#936113':'#555A58',1.1,{opacity:.56});
    });
    // Tall transparent outer wall; front arc covers the pie floor and partitions.
    b+=path(`${arc(cy)} L ${cx+rx} ${cy+t} A ${rx} ${ry} 0 0 1 ${cx-rx} ${cy+t} Z`,wall);
    if(c.layers.rim){
      b+=ellipse(cx,cy,rx,ry,'none',{stroke:rim,'stroke-width':5.3,opacity:c.rim/100});
      b+=ellipse(cx,cy-1.5,rx-3,ry-2,'none',{stroke:'#FFFFFF','stroke-width':1.1,opacity:c.rim/100});
      b+=ellipse(cx,cy+t,rx,ry,'none',{stroke:rim,'stroke-width':4.8,opacity:c.rim/100});
      b+=path(`${arc(cy+t-3)}`,'none',{stroke:'#FFFFFF','stroke-width':2.2,opacity:c.rim/120});
      b+=path(`M ${cx-rx+9} ${cy-6} A ${rx-9} ${ry-8} 0 0 0 ${cx+98} ${cy+ry-14}`,'none',{stroke:'#FFFFFF','stroke-width':2.2,opacity:.66});
      b+=path(`M ${cx+13} ${cy-ry+16} Q ${cx+144} ${cy-ry+19} ${cx+178} ${cy-8}`,'none',{stroke:'#F2BE6D','stroke-width':4.6,opacity:.8});
    }
    b+=text(304,77,c.value||'1,100',61,c.mainColor,{'text-anchor':'middle','font-weight':600,'letter-spacing':-2});
    if(c.showLabels){
      b+=text(304,99,'Group R&D Employees',9,c.mainColor,{'text-anchor':'middle','font-weight':600});
      const labels=[{x:120,y:123,w:194,t:'172 Workshop and Administration Staff',tx:216,ty:316},{x:260,y:177,w:151,t:'350 Lab Staff and Technicians',tx:335,ty:349},{x:55,y:211,w:146,t:'346 Scientists and Engineers',tx:128,ty:395}];
      labels.forEach(l=>{b+=line(l.tx,l.y+16,l.tx,l.ty,'#666C6A',.8,{'stroke-dasharray':'1.6 2.1',opacity:.8});b+=circle(l.tx,l.ty,2.1,'#F7F8F5',{stroke:'#858A87','stroke-width':.7});b+=rect(l.x,l.y,l.w,16,'#ECEEEB',{stroke:'#7D817D','stroke-width':.75});b+=text(l.x+4,l.y+11.5,l.t,8.9,'#313532',{'font-weight':600});});
    }
    return s.fit(b,485,560);
  }
  function funnel(s) {
    const {c}=s;let b='';const bw=1162,bh=1096,center=480;
    const titles=['Visits','Signups','Activated','Paid customers'];
    const values=['450,000','18,000 (4.0%)','8,280 (46.0%)','1,656 (20.0%)'];
    // The grey upper-right light falloff belongs to the composition, not the text.
    const ambience=s.radial('funnel-ambient',[{offset:0,color:'#737C90',opacity:.68},{offset:46,color:'#8991A2',opacity:.24},{offset:100,color:'#8991A2',opacity:0}],100,0,85);
    b+=rect(0,0,bw,bh,ambience);
    b+=text(8,76,c.title||'Signup to Paid Funnel',65,'#101218',{'font-weight':700,'letter-spacing':-2});
    if(c.showLabels)b+=text(10,137,'March 2025, demo dataset',32,'#7F8588',{'font-weight':600});
    for(let i=0;i<4;i++){
      const top=240+i*218,w=722-i*107,h=181,d=c.thickness;
      const left=center-w/2,right=center+w/2;
      const start=[mix(c.lightColor,'#FFFFFF',.61),mix(c.lightColor,c.mainColor,.12),mix(c.mainColor,c.lightColor,.30),mix(c.mainColor,c.deepColor,.10)][i];
      const end=i<2?mix(start,'#7B8DB9',i===0?.13:.35):mix(c.mainColor,c.deepColor,.21);
      const front=`M ${left} ${top+40} Q ${center} ${top+83} ${right} ${top+40} L ${right-39} ${top+h} Q ${center} ${top+h+52} ${left+39} ${top+h} Z`;
      const rear=`M ${left} ${top+40} L ${center-12} ${top-5} L ${right} ${top+40} L ${right-39} ${top+h} L ${center} ${top+h+38} L ${left+39} ${top+h} Z`;
      const aperture=`M ${left+10} ${top+40} L ${center-12} ${top+2} L ${right-10} ${top+40} Q ${center} ${top+82} ${left+10} ${top+40} Z`;
      const shadowPath=`M ${right-5} ${top+46} L ${right+117} ${top+133} L ${right+52} ${top+h+145} L ${center+70} ${top+h+145} L ${left+38} ${top+h+28} L ${right-42} ${top+h+7} Z`;
      if(c.layers.shadow){b+=path(shadowPath,'#65728E',{filter:s.shadowFilter,opacity:c.shadow/100});b+=path(front,'#586887',{transform:`translate(${24+d*.4} ${30+d*.4})`,filter:s.blur('funnel-contact'+i,8),opacity:c.shadow/200});}
      // Back wall and inner cavity are visible through the open top.
      const inner=s.linear('funnel-inner'+i,[{offset:0,color:mix(start,'#687494',.33)},{offset:29,color:mix(start,'#7081AF',.3)},{offset:67,color:mix(start,'#FFFFFF',.38)},{offset:100,color:'#F5F8FF'}],12);
      b+=path(rear,mix(start,c.deepColor,i<2?.12:.2),{'fill-opacity':.63});
      b+=path(aperture,inner,{'fill-opacity':.94,stroke:'#FFFFFF','stroke-width':2.2,'stroke-opacity':.70});
      b+=path(`M ${left+10} ${top+40} L ${center-12} ${top+2} L ${center+7} ${top+71} Z`,s.linear('funnel-inner-left'+i,[{offset:0,color:mix(start,'#586C9B',.31)},{offset:100,color:mix(start,'#FFFFFF',.28)}],0),{'fill-opacity':.70});
      const fill=s.linear('funnel-front'+i,c.stops?c.stops.map(z=>({...z,color:mix(z.color,start,.40)})):[{offset:0,color:mix(start,'#FFFFFF',.34)},{offset:12,color:mix(start,'#FFFFFF',.17)},{offset:38,color:start},{offset:66,color:mix(start,end,.25)},{offset:87,color:mix(start,'#FFFFFF',.18)},{offset:100,color:end}],c.gradientAngle);
      b+=path(front,fill,{'fill-opacity':.91,stroke:mix(start,'#FFFFFF',.5),'stroke-width':1.5});
      const cp=s.clip('funnelclip'+i,path(front,'#FFF'));
      const edgeDark=s.linear('funnel-corner'+i,[{offset:0,color:c.deepColor,opacity:.12},{offset:9,color:'#FFFFFF',opacity:.13},{offset:44,color:'#FFFFFF',opacity:.09},{offset:52,color:'#FFFFFF',opacity:.31},{offset:64,color:c.deepColor,opacity:.04},{offset:92,color:'#FFFFFF',opacity:.16},{offset:100,color:'#FFFFFF',opacity:.58}],0);
      const shine=s.radial('funnelshine'+i,[{offset:0,color:'#FFFFFF',opacity:.65},{offset:23,color:'#FFFFFF',opacity:.39},{offset:56,color:'#FFFFFF',opacity:.09},{offset:100,color:'#FFFFFF',opacity:0}],9,1,95);
      b+=tag('g',{'clip-path':cp},rect(left,top+35,w,h+50,edgeDark)+rect(left,top,w,h+50,shine));
      if(c.layers.glow)b+=path(`M ${left+17} ${top+48} Q ${center} ${top+90} ${right-20} ${top+48}`,'none',{stroke:'#F6FCFF','stroke-width':7,filter:s.blur('funnel-bloom'+i,3.5),opacity:.38});
      if(c.layers.rim){b+=path(`M ${left+1} ${top+41} Q ${center} ${top+84} ${right-1} ${top+41} M ${left+39} ${top+h} Q ${center} ${top+h+52} ${right-39} ${top+h}`,'none',{stroke:'#FAFDFF','stroke-width':2.9,opacity:c.rim/105});b+=path(`M ${right-2} ${top+42} L ${right-39} ${top+h}`,'none',{stroke:'#FFFFFF','stroke-width':4.6,opacity:c.rim/150});}
      if(c.showLabels){
        const color=i<2?'#151A20':'#F4F6FC';
        const x=left+56,y=top+111;
        if(i>1)b+=text(x+1,y+2,titles[i],34,'#12205D',{'font-weight':600,'letter-spacing':-.6,opacity:.2})+text(x+1,y+47,values[i],39,'#12205D',{'font-weight':700,'letter-spacing':-1,opacity:.2});
        b+=text(x,y,titles[i],34,color,{'font-weight':600,'letter-spacing':-.6});
        b+=text(x,y+45,values[i],39,color,{'font-weight':700,'letter-spacing':-1});
        b+=text(left-21,top+124,'Step'+(i+1),31,'#1C2225',{'text-anchor':'end','font-weight':700});
        if(i>1){const xx=832,yy=top+26,cw=278,ch=i===2?153:174;
          if(c.layers.shadow){b+=rect(xx+32,yy+41,cw,ch,'#5D6778',{rx:31,opacity:c.shadow/140,filter:s.blur('callout-shadow'+i,9)});b+=rect(xx+10,yy+12,cw,ch,'#7D899B',{rx:30,opacity:c.shadow/280,filter:s.blur('callout-contact'+i,5)});}
          b+=line(right+14,yy+69,xx-22,yy+69,c.mainColor,3,{opacity:.8});b+=circle(right+14,yy+69,8,'#F4F7FF');b+=circle(xx-22,yy+69,7,c.mainColor);
          b+=rect(xx,yy,cw,ch,s.linear('callout-surface'+i,[{offset:0,color:'#F7F9FB'},{offset:60,color:'#E8EDF3'},{offset:100,color:'#DFE5EE'}],90),{rx:28,stroke:'#FFFFFF','stroke-width':2.1,'stroke-opacity':.6});
          const heading=i===2?c.calloutTitle1:c.calloutTitle2,body=i===2?c.calloutBody1:c.calloutBody2;
          const lines=[];String(body).split(/\s+/).forEach(word=>{const j=lines.length-1;if(j<0||lines[j].length+word.length>17)lines.push(word);else lines[j]+=' '+word;});
          b+=text(xx+25,yy+57,heading,28,'#1C242B',{'font-weight':700});
          lines.slice(0,2).forEach((label,j)=>b+=text(xx+25,yy+95+j*38,label,29,i===2?'#8591A3':'#1C242B',{'font-weight':i===2?400:700}));
        }
      }
    }
    return s.fit(b,bw,bh);
  }
  function bars(s) {
    const {c}=s;let b='';const xs=[87,248,408,568],values=Array.isArray(c.values)&&c.values.length===4?c.values.map(v=>clamp(v,0,100)):[50,25,100,75];
    const colors=Array.isArray(c.palette)&&c.palette.length===4?c.palette.map(v=>hex(v)):['#FE9E13','#013476',c.mainColor,'#FC395B'];
    const labels=Array.isArray(c.labels)&&c.labels.length===4?c.labels:['LOREM IPSUM','LOREM IPSUM','LOREM IPSUM','LOREM IPSUM'];
    const bottom=460,maxHeight=310,dx=58,dy=29+(c.thickness-24)*.18;
    const reflection=s.linear('bar-reflection-mask',[{offset:0,color:'#FFFFFF',opacity:.23},{offset:28,color:'#FFFFFF',opacity:.10},{offset:70,color:'#FFFFFF',opacity:.03},{offset:100,color:'#FFFFFF',opacity:0}],90);
    s.defs.push(tag('mask',{id:s.prefix+'reflection'},rect(0,bottom-30,653,119,reflection)));
    colors.forEach((co,i)=>{
      const x=xs[i],v=values[i],top=bottom-maxHeight*v/100;
      const left=`M ${x-dx} ${top-dy} L ${x} ${top} L ${x} ${bottom} L ${x-dx} ${bottom-dy} Z`;
      const right=`M ${x} ${top} L ${x+dx} ${top-dy} L ${x+dx} ${bottom-dy} L ${x} ${bottom} Z`;
      const cap=`M ${x-dx} ${top-dy} L ${x} ${top-2*dy} L ${x+dx} ${top-dy} L ${x} ${top} Z`;
      const pale=i===0?'#FFD49B':i===1?'#14C1E4':i===2?c.lightColor:'#FF7D8B';
      const darkBase=i===0?'#F18507':i===1?'#03276B':i===2?'#007C97':'#C41569';
      const dark=c.deepColor.toUpperCase()===per.bars.deepColor.toUpperCase()?darkBase:mix(darkBase,c.deepColor,.65);
      const fillL=s.linear('barleft'+i,c.stops?c.stops.map(o=>({...o,color:mix(o.color,co,.55)})):[{offset:0,color:mix(co,dark,.20)},{offset:17,color:co},{offset:41,color:mix(co,pale,.1)},{offset:68,color:mix(co,pale,.34)},{offset:87,color:mix(co,pale,.7)},{offset:100,color:pale}],90);
      const fillR=s.linear('barright'+i,[{offset:0,color:dark},{offset:24,color:mix(co,dark,.27)},{offset:45,color:co},{offset:72,color:mix(co,pale,.2)},{offset:100,color:mix(co,pale,.65)}],90);
      const fillT=s.linear('bartop'+i,[{offset:0,color:mix(co,pale,.72)},{offset:25,color:mix(co,pale,.45)},{offset:60,color:co},{offset:100,color:mix(co,dark,.16)}],c.gradientAngle-120);
      const parts=path(left,fillL)+path(right,fillR)+path(cap,fillT);
      if(c.layers.shadow){
        b+=path(`M ${x-dx} ${bottom-dy} L ${x+dx} ${bottom-dy} L ${x+dx+49} ${bottom+51} L ${x+49} ${bottom+77} Z`,'#708E9D',{opacity:c.shadow/160,filter:s.blur('barshadow'+i,Math.max(2,c.shadowBlur*.22))});
        b+=ellipse(x+3,bottom-2,51,12,'#526F7A',{opacity:c.shadow/240,filter:s.blur('barcontact'+i,4)});
      }
      if(c.layers.glow)b+=tag('g',{mask:'url(#'+s.prefix+'reflection)'},tag('g',{transform:`translate(0 ${bottom*1.32}) scale(1 -.32)`},parts));
      b+=parts;
      const cp=s.clip('barclip'+i,path(left,'#FFF')+path(right,'#FFF'));
      const corner=s.linear('barcorner'+i,[{offset:0,color:'#FFFFFF',opacity:.12},{offset:5,color:'#FFFFFF',opacity:.38},{offset:14,color:'#FFFFFF',opacity:.02},{offset:44,color:'#FFFFFF',opacity:0},{offset:50,color:dark,opacity:.20},{offset:55,color:'#FFFFFF',opacity:.15},{offset:91,color:'#FFFFFF',opacity:0},{offset:100,color:dark,opacity:.17}],0);
      const gleam=s.radial('barshine'+i,[{offset:0,color:'#FFFFFF',opacity:.42},{offset:34,color:'#FFFFFF',opacity:.12},{offset:75,color:'#FFFFFF',opacity:.02},{offset:100,color:'#FFFFFF',opacity:0}],0,93,90);
      b+=tag('g',{'clip-path':cp},rect(x-dx,top-dy,dx*2,bottom-top+dy,corner)+rect(x-dx,top-2*dy,dx*2,bottom-top+dy*2,gleam)+path(`M ${x+dx-10} ${top-2*dy} L ${x+dx+14} ${top-2*dy} L ${x-dx+19} ${bottom} L ${x-dx-8} ${bottom} Z`,'#FFFFFF',{opacity:.085}));
      if(c.layers.rim){b+=path(`M ${x-dx} ${top-dy} L ${x} ${top} L ${x+dx} ${top-dy} M ${x} ${top} L ${x} ${bottom} M ${x-dx} ${top-dy} L ${x-dx} ${bottom-dy} L ${x} ${bottom} L ${x+dx} ${bottom-dy}`,'none',{stroke:'#EFFFFF','stroke-width':1.1,opacity:c.rim/135});b+=line(x-dx+2,top-dy+5,x-dx+2,bottom-dy-5,'#FFFFFF',1.3,{opacity:.27});}
      if(c.showLabels){
        const tx=x-dx+13,ty=top-dy+34;
        b+=text(tx+1,ty+1,v+'%',18,dark,{transform:`rotate(24 ${tx} ${ty})`,opacity:.24});
        b+=text(tx,ty,v+'%',18,'#F1FDFA',{transform:`rotate(24 ${tx} ${ty})`,'font-weight':300,opacity:.90});
        b+=line(x,top-2*dy-10,x,top-2*dy-42,'#526775',1.2,{'stroke-dasharray':'2.5 5'});
        const iy=top-2*dy-60;
        if(i===0)b+=path(`M ${x-8} ${iy} l 6 6 l 12 -15`,'none',{stroke:co,'stroke-width':5,'stroke-linecap':'round','stroke-linejoin':'round'});
        if(i===1)b+=circle(x-2,iy-3,6,'none',{stroke:co,'stroke-width':2.1})+line(x+3,iy+2,x+11,iy+11,co,2.6);
        if(i===2){b+=circle(x,iy,9,co,{stroke:mix(co,dark,.3),'stroke-width':3});for(let a=0;a<8;a++){const ang=a*Math.PI/4;b+=circle(x+Math.cos(ang)*8.5,iy+Math.sin(ang)*8.5,3,co);}b+=circle(x,iy,2.6,'#CCFFF1');}
        if(i===3)b+=rect(x-10,iy-2,4,11,co)+rect(x-2,iy-11,4,20,co)+rect(x+6,iy-6,4,15,co);
        const tc=i===0?'#CC8B27':i===1?'#12738B':i===2?'#2DAA9A':'#A63261';
        b+=text(x,bottom+45,labels[i],13.5,tc,{'text-anchor':'middle','font-weight':700});
        ['Lorem ipsum dolor sit amet,','consectetur adipiscing elit, sed do','eiusmod tempor incididunt ut'].forEach((t,j)=>b+=text(x,bottom+64+j*11,t,8,'#839493',{'text-anchor':'middle'}));
      }
    });
    return s.fit(b,653,573);
  }
  function pipe(s) {
    const {c}=s;let b='';
    const glass=s.linear('pipeglass',[{offset:0,color:'#567C96',opacity:.7},{offset:6,color:'#FFFFFF',opacity:.95},{offset:17,color:c.lightColor,opacity:.3},{offset:37,color:'#FFFFFF',opacity:.07},{offset:64,color:'#EAF9FF',opacity:.18},{offset:76,color:c.mainColor,opacity:.2},{offset:85,color:'#FFFFFF',opacity:.9},{offset:94,color:c.deepColor,opacity:.55},{offset:100,color:'#FFFFFF',opacity:.7}],90);
    const iconGlass=s.linear('iconglass',[{offset:0,color:'#FFFFFF',opacity:.94},{offset:20,color:c.lightColor,opacity:.28},{offset:43,color:'#FFFFFF',opacity:.08},{offset:70,color:c.lightColor,opacity:.15},{offset:100,color:c.mainColor,opacity:.42}],c.gradientAngle);
    const pipeShape=rect(60,610,935,56,glass,{rx:28,stroke:'#BDD0DC','stroke-width':2});
    if(c.layers.shadow)b+=tag('g',{transform:'rotate(-15 520 610) translate(6 45)',opacity:c.shadow/150,filter:s.shadowFilter},rect(60,610,935,48,'#7792AD',{rx:24}));
    let pg=pipeShape;
    pg+=line(82,618,969,618,'#FFFFFF',2.5,{opacity:c.rim/100});
    pg+=line(82,651,969,651,c.deepColor,1.5,{opacity:.3});
    [115,340,570,800].forEach(x=>{
      pg+=ellipse(x,638,11,27,'none',{stroke:glass,'stroke-width':7});
      pg+=ellipse(x+4,638,11,27,'none',{stroke:'#F5FDFF','stroke-width':1.5,opacity:c.rim/100});
    });
    b+=tag('g',{transform:'rotate(-15 520 610)'},pg);
    const starPoints=(x,y,r,ir)=>Array.from({length:10},(_,i)=>{let a=(-90+i*36)*Math.PI/180,rr=i%2?ir:r;return `${x+Math.cos(a)*rr},${y+Math.sin(a)*rr}`;}).join(' ');
    // Star medallion: separate thick back, transparent front and refractive edge.
    const mx=263,my=484;
    if(c.layers.shadow)b+=ellipse(mx+18,720,80,20,'#839CAE',{opacity:c.shadow/170,filter:s.shadowFilter});
    b+=ellipse(mx+8,my+5,91,107,s.darkRim,{'fill-opacity':.38,transform:`rotate(22 ${mx} ${my})`});
    b+=ellipse(mx,my,91,107,iconGlass,{stroke:s.rim,'stroke-width':5,transform:`rotate(22 ${mx} ${my})`});
    b+=tag('polygon',{points:starPoints(mx,my,61,27),fill:iconGlass,stroke:c.deepColor,'stroke-width':3,'stroke-opacity':.42});
    b+=tag('polygon',{points:starPoints(mx-2,my-3,61,27),fill:'none',stroke:'#FFFFFF','stroke-width':2,'stroke-opacity':c.rim/110});
    // Blue speech bubble: the narrow dark side wall remains visible at the left.
    const bubble='M 455 328 Q 455 303 481 299 L 609 278 Q 637 274 637 304 L 637 411 Q 637 438 612 443 L 524 459 L 485 499 L 492 466 L 481 469 Q 455 473 455 446 Z';
    b+=tag('g',{transform:`translate(${-c.thickness*.45} ${-c.thickness*.24})`},path(bubble,c.deepColor));
    b+=path(bubble,s.body,{stroke:s.rim,'stroke-width':2.3});
    const cp=s.clip('bubbleclip',path(bubble,'#FFF'));
    const gloss=s.radial('bubblegloss',[{offset:0,color:'#FFFFFF',opacity:.72},{offset:30,color:c.lightColor,opacity:.35},{offset:100,color:c.mainColor,opacity:0}],70,80,90);
    if(c.layers.glow)b+=tag('g',{'clip-path':cp},rect(440,275,210,230,gloss));
    [504,543,582].forEach((x,i)=>{b+=ellipse(x,374-i*6,12,14,'#E7F7FF');b+=ellipse(x-3,371-i*6,8,10,'#FFFFFF',{opacity:.7});});
    // Document: transparent plane plus folded corner; every line shares perspective.
    const document='M 770 188 L 866 176 L 909 218 L 909 399 L 770 421 Z';
    b+=tag('g',{transform:`translate(${c.thickness*.4} ${c.thickness*.3})`},path(document,s.darkRim,{opacity:.44}));
    b+=path(document,iconGlass,{stroke:s.rim,'stroke-width':4});
    b+=path('M 866 176 L 866 226 L 909 218','none',{stroke:c.deepColor,'stroke-width':3,opacity:.45});
    for(let i=0;i<5;i++)b+=line(794,263+i*26,882,251+i*26,c.deepColor,5,{opacity:.3,'stroke-linecap':'round'});
    if(c.layers.rim)b+=path('M 776 414 L 776 195 L 861 183','none',{stroke:'#FFFFFF','stroke-width':3,opacity:c.rim/100});
    if(c.showLabels){
      const title=c.title||'REPURPOSE YOUR REVIEWS';
      const words=title==='REPURPOSE YOUR REVIEWS'?['REPURPOSE','YOUR REVIEWS']:[title];
      words.forEach((z,i)=>b+=text(78,84+i*55,z,49,'#101B32',{'font-weight':700}));
      [['REVIEW',130,800],['QUOTE',382,731],['STORY',618,664],['CASE STUDY',842,604]].forEach(([v,x,y])=>b+=text(x,y,v,28,'#1B263A',{transform:`rotate(14 ${x} ${y})`,'font-style':'italic'}));
      [[mx,590,630],[551,490,555],[842,425,485]].forEach(([x,y,y2])=>b+=line(x,y,x,y2,'#BACBD5',1.4));
    }
    return s.fit(b,1050,910);
  }
  function map(s) {
    const {c}=s;let b='';
    // REF-01 [300,48,685,397]: number and geography now share the source crop scale.
    const value=String(c.value||'90%'),match=value.match(/^(.*?)(%)$/),number=match?match[1]:value;
    const ink=s.linear('number-orange',c.stops||[{offset:0,color:mix(c.mainColor,'#FFAA3B',.22)},{offset:30,color:c.mainColor},{offset:67,color:mix(c.mainColor,'#F26600',.15)},{offset:88,color:mix(c.mainColor,c.lightColor,.12)},{offset:100,color:mix(c.mainColor,c.lightColor,.45)}],c.gradientAngle-45);
    const glyphs=text(410,134,number,162,ink,{'text-anchor':'end','font-weight':800,'letter-spacing':-7})+(match?text(413,137,'%',64,ink,{'font-weight':800}):'');
    if(c.showLabels&&c.layers.shadow)b+=ellipse(347,145,122,12,c.deepColor,{opacity:c.shadow/240,filter:s.blur('number-contact',5)});
    // A fading reflected glyph, blurred independently of the sharp lettering.
    const reflection=s.linear('number-reflect-mask',[{offset:0,color:'#FFFFFF',opacity:.5},{offset:35,color:'#FFFFFF',opacity:.25},{offset:100,color:'#FFFFFF',opacity:0}],90);
    s.defs.push(tag('mask',{id:s.prefix+'number-reflect'},rect(190,137,315,54,reflection)));
    if(c.showLabels&&c.layers.glow)b+=tag('g',{mask:'url(#'+s.prefix+'number-reflect)',filter:s.blur('number-reflect-blur',2.2+c.blur*.05)},tag('g',{transform:'translate(0 177) scale(1 -.30)'},glyphs));
    if(c.showLabels)b+=glyphs;
    // Geographic relief remains the known original image; no synthetic coastlines.
    b+=s.imageCrop('REF-01.jpg',[300,211,685,234],0,163,685,234);
    // White horizon and orange bounced light reconnect the cropped relief to the type.
    const horizon=s.radial('map-horizon',[{offset:0,color:'#ECEDEB',opacity:.9},{offset:66,color:'#ECEDEB',opacity:.55},{offset:100,color:'#ECEDEB',opacity:0}],50,50,50);
    b+=ellipse(345,162,218,32,horizon);
    const bounce=s.radial('map-orange-bounce',[{offset:0,color:c.mainColor,opacity:.30},{offset:42,color:c.mainColor,opacity:.15},{offset:100,color:c.mainColor,opacity:0}],50,0,70);
    if(c.layers.glow)b+=ellipse(345,149,114,22,bounce,{filter:s.blur('mapbounce',2)});
    return s.fit(b,685,397);
  }
  function territory(s) {
    const {c}=s;let b='';
    if(c.layers.shadow)b+=rect(56,174,892,453,'#414A50',{rx:12,filter:s.shadowFilter,opacity:c.shadow/140});
    b+=s.imageCrop('REF-21.png',[0,0,218,111],50,150,900,458,[258,145]);
    if(c.showLabels){
      b+=text(50,85,c.title||'강조 지역 · 경계 · 위치',36,'#142A40',{'font-weight':700});
      b+=rect(52,645,19,19,c.mainColor,{rx:3});
      b+=text(82,663,c.value||'선택 지역',22,'#293E53');
      b+=line(270,655,310,655,c.lightColor,4);b+=text(324,663,'경계선',22,'#293E53');
      b+=text(50,724,'저해상도 원본의 표현 참고 · 실제 지리는 제작 자료에 연결',18,'#7D8992');
    }
    return s.fit(b,1000,790);
  }
  function paper(s) {
    const {c,W,H}=s;let b='';
    const photoHeight=s.tall?Math.min(W*374/900,H*.68):H*.735;
    const topH=s.tall?(H-photoHeight)/2:H*.125,bottomH=s.tall?(H-photoHeight)/2:H*.14;
    const paperFill=s.linear('paperbase',[{offset:0,color:mix(c.mainColor,c.lightColor,.13)},{offset:48,color:c.mainColor},{offset:100,color:mix(c.mainColor,c.deepColor,.14)}],90);
    const noise=s.prefix+'papertexture';
    s.defs.push(tag('filter',{id:noise,x:'0%',y:'0%',width:'100%',height:'100%','color-interpolation-filters':'sRGB'},tag('feTurbulence',{type:'fractalNoise',baseFrequency:'.56 .65',numOctaves:3,seed:19,result:'noise'})+tag('feColorMatrix',{in:'noise',type:'saturate',values:0,result:'graynoise'})+tag('feComponentTransfer',{in:'graynoise',result:'grain'},tag('feFuncA',{type:'linear',slope:.15}))+tag('feBlend',{in:'grain',in2:'SourceGraphic',mode:'multiply'})));
    b+=rect(0,0,W,H,c.background);
    // Contain the original 900×374 picture window; no actor is cut off in 9:16.
    const vh=H-topH-bottomH;
    b+=rect(0,topH,W,vh,'#0D1215');
    b+=s.imageCrop('REF-22.png',[0,75,900,374],0,topH,W,vh,[944,522]);
    const tear=(y,reverse=false)=>{
      const pts=[];for(let x=0;x<=W+6;x+=6){const d=(Math.sin(x*.143)*1.6+Math.sin(x*.731)*1.1+Math.sin(x*.049)*2.1)*(.5+c.thickness/12);pts.push(`${x},${y+d}`);}
      return reverse?`M 0 ${H} L ${W} ${H} L ${pts.reverse().join(' L ')} Z`:`M 0 0 L ${W} 0 L ${pts.reverse().join(' L ')} Z`;
    };
    const top=tear(topH),bottom=tear(H-bottomH,true);
    if(c.layers.shadow)b+=tag('g',{transform:'translate(0 3)',opacity:c.shadow/100,filter:s.blur('papershadow',Math.max(.2,c.shadowBlur*.16))},path(top,'#000000')+path(bottom,'#000000'));
    b+=path(top,paperFill,c.layers.texture?{filter:'url(#'+noise+')'}:{});
    b+=path(bottom,paperFill,c.layers.texture?{filter:'url(#'+noise+')'}:{});
    if(c.layers.rim){
      const edge=(y)=>{let d='';for(let x=0;x<=W+6;x+=6){const yy=y+(Math.sin(x*.143)*1.6+Math.sin(x*.731)*1.1+Math.sin(x*.049)*2.1)*(.5+c.thickness/12);d+=(x?' L ':'M ')+x+' '+yy;}return d;};
      b+=path(edge(topH-1),'none',{stroke:c.lightColor,'stroke-width':4.5,opacity:c.rim/110});
      b+=path(edge(H-bottomH+1),'none',{stroke:c.lightColor,'stroke-width':4.5,opacity:c.rim/110});
    }
    if(c.showLabels&&c.value){
      const units=[...String(c.value)].reduce((n,ch)=>n+(/[가-힣一-龥]/.test(ch)?1:/[A-Z0-9]/.test(ch)?.66:.48),0);
      const font=Math.min(s.tall?25:27,(W-100)/(units||1)),textWidth=Math.min(W-64,units*font+38),y=s.tall?H-bottomH+58:H-bottomH*.55;
      b+=rect((W-textWidth)/2,y-font*.9,textWidth,font*1.45,'#39454A',{rx:7});
      b+=text(W/2,y+font*.18,c.value,font,'#F7F8F9',{'text-anchor':'middle'});
    }
    return b;
  }
  const renderers={map,amber,glow,funnel,slabs,pipe,bars,territory,paper};
  const common=['background','padding','scale','showLabels','fontScale','labelScale','fontFamily'];
  const controls={
    map:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','shadow','shadowBlur','blur','value'],
    amber:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','blur','value'],
    glow:[...common,'mainColor','deepColor','lightColor','stops','glowX','glowY','glowRadius','blur','thickness','rim','shadow','shadowBlur','value'],
    funnel:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','blur','title','calloutTitle1','calloutBody1','calloutTitle2','calloutBody2'],
    slabs:[...common,'palette','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','blur','title'],
    pipe:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','title'],
    bars:[...common,'palette','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','labels','values'],
    territory:[...common,'mainColor','lightColor','shadow','shadowBlur','title','value'],
    paper:['mainColor','deepColor','lightColor','thickness','rim','shadow','shadowBlur','showLabels','value']
  };
  function registerRenderer(id,fn,settings={},supported=[]) {
    if(!/^[A-Za-z][A-Za-z0-9_-]*$/.test(id)||typeof fn!=='function')throw new Error('Invalid material renderer');
    renderers[id]=fn;per[id]={...settings};controls[id]=[...new Set([...common,...supported])];
  }
  function render(id,input={}) {
    if(!renderers[id])id='slabs';
    const c=sanitize(id,input),outerWidth=c.width,outerHeight=c.height;
    const source=input.sourceCrop;
    const cropOK=source&&Array.isArray(source.base)&&Array.isArray(source.selected)&&source.base.length===4&&source.selected.length===4&&[...source.base,...source.selected].every(Number.isFinite)&&source.base[2]>0&&source.base[3]>0&&source.selected[2]>0&&source.selected[3]>0;
    if(cropOK){c.width=1000;c.height=1000*source.base[3]/source.base[2];}
    const s=scene(id,c);let body=renderers[id](s);
    body=body.replace(/font-size="([0-9.]+)"/g,(_,n)=>'font-size="'+(+n*(+n>32?c.fontScale:c.labelScale)/100).toFixed(3)+'"').replace(/font-family="[^"]*"/g,'font-family="'+esc(c.fontFamily)+', Noto Sans KR, sans-serif"');
    const vb=cropOK?[(source.selected[0]-source.base[0])*1000/source.base[2],(source.selected[1]-source.base[1])*1000/source.base[2],source.selected[2]*1000/source.base[2],source.selected[3]*1000/source.base[2]].join(' '):`0 0 ${s.W} ${s.H}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${outerWidth}" height="${outerHeight}" viewBox="${vb}" role="img" aria-label="${esc(id)} material study"><title>${esc(id)} · reference material study</title><defs>${s.defs.join('')}</defs>${rect(0,0,s.W,s.H,s.bg)}${body}</svg>`;
  }
  global.MaterialRenderer={render,defaults,registerRenderer,helpers:{tag,rect,path,ellipse,circle,line,text,hex,mix,clamp,esc},supportedControls:id=>(controls[id]||common).slice(),bluePalette:BLUE.slice(),version:'20261125-depth-r2',sourceModes:{map:'reference-pixels-and-editable-type',territory:'reference-pixels-and-editable-legend',paper:'reference-photo-and-editable-paper'}};
})(typeof window!=='undefined'?window:globalThis);
