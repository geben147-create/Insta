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
    showLabels:true, title:'', value:'', layers:{glow:true,rim:true,shadow:true,texture:true}
  };
  const per = {
    map:{mainColor:'#F76D0B',deepColor:'#AD4B08',lightColor:'#FFE3C4',background:'#EEEEEE',value:'90%',title:'세계로 이어지는 가능성'},
    amber:{mainColor:'#DB8933',deepColor:'#8D3D08',lightColor:'#FFF2C9',background:'#ECECEC',value:'1,100',title:'유리 접시 · 앰버 구성비',thickness:22,blur:8},
    glow:{mainColor:'#243DFF',deepColor:'#1D2BB9',lightColor:'#B8C9FF',background:'#EEEEEE',value:'70%',title:'빛으로 드러나는 구성비',blur:19,glowRadius:40,glowY:54,thickness:16},
    funnel:{mainColor:'#1951FC',deepColor:'#1735D5',lightColor:'#E3EAFE',background:'#E9ECF4',title:'방문에서 전환까지',thickness:25,shadow:38,shadowBlur:20},
    slabs:{mainColor:'#1951FC',deepColor:'#03195B',lightColor:'#CBE9FD',background:'#000000',title:'',padding:0,rim:90,shadow:36,shadowBlur:15,blur:10},
    pipe:{mainColor:'#2583EB',deepColor:'#062C85',lightColor:'#D9F4FF',background:'#F1F5F8',title:'REPURPOSE YOUR REVIEWS',thickness:15,blur:8},
    bars:{mainColor:'#01EFD1',deepColor:'#013476',lightColor:'#E2FFC5',background:'#F4F8FC',title:'숫자를 입체적으로',thickness:24,blur:10},
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
    const capturedBody=['#021044','#051D87','#0E35C3','#2D72FD','#5BB3FD','#74B9FA'];
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
      const cyan=mix(c.lightColor,'#00AFFF',.34);
      const deep=mix(baseCo,'#000000',i<3?.04:.015);
      const top=mix(baseCo,cyan,i<3?.07:.12);
      const gradients=c.stops?c.stops.map(o=>({...o,color:mix(o.color,baseCo,.48)})):[{offset:0,color:top},{offset:17,color:baseCo},{offset:72,color:baseCo},{offset:92,color:deep},{offset:100,color:mix(baseCo,cyan,.06)}];
      const fill=s.linear('slab-body'+i,gradients,c.gradientAngle);
      const left=s.radial('slab-left'+i,[{offset:0,color:cyan,opacity:.78},{offset:22,color:cyan,opacity:.34},{offset:62,color:co,opacity:.03},{offset:100,color:co,opacity:0}],2,45,27);
      const right=s.radial('slab-right'+i,[{offset:0,color:'#FFFFFF',opacity:.83},{offset:14,color:cyan,opacity:.38},{offset:38,color:co,opacity:.015},{offset:100,color:co,opacity:0}],94,8,28);
      const topLight=s.linear('slab-top'+i,[{offset:0,color:cyan,opacity:.19},{offset:2,color:cyan,opacity:.12},{offset:7,color:cyan,opacity:.015},{offset:100,color:cyan,opacity:0}],90);
      const internal=s.radial('slab-inner'+i,[{offset:0,color:baseCo,opacity:0},{offset:61,color:baseCo,opacity:0},{offset:93,color:c.deepColor,opacity:.16},{offset:100,color:cyan,opacity:.2}],51,45,72);
      const slabRim=s.linear('slab-rim'+i,[{offset:0,color:cyan,opacity:.5},{offset:21,color:cyan,opacity:.77},{offset:45,color:co,opacity:.25},{offset:69,color:cyan,opacity:.62},{offset:100,color:c.lightColor,opacity:.3}],115);
      const cp=s.clip('slab-clip'+i,rect(x,y,w,h,'#FFF',{rx}));
      if(c.layers.shadow)b+=rect(x+8,y+depth+13,w,h, '#010714',{rx,opacity:c.shadow/100,filter:s.shadowFilter});
      b+=rect(x+3,y+depth,w,h,mix(baseCo,c.deepColor,.45),{rx,stroke:mix(baseCo,c.lightColor,.13),'stroke-width':2});
      if(c.layers.glow)b+=rect(x,y,w,h,fill,{rx,stroke:mix(baseCo,cyan,.28),'stroke-width':2,filter:s.blur('slab-bloom'+i,1.5+c.blur*.15),opacity:.5});
      b+=rect(x,y,w,h,fill,{rx});
      b+=tag('g',{'clip-path':cp},rect(x,y,w,h,internal)+rect(x,y,w,h,left)+rect(x,y,w,h,right)+rect(x,y,w,h,topLight));
      if(c.layers.rim){
        b+=rect(x+1.5,y+1.5,w-3,h-3,'none',{rx:rx-1,stroke:slabRim,'stroke-width':1.4,opacity:c.rim/115});
        b+=rect(x+7,y+8,w-14,h-17,'none',{rx:rx-8,stroke:s.darkRim,'stroke-width':.8,opacity:c.rim/260});
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
    const cx=415,cy=455,r=325,gap=14,smallCx=cx-12,smallCy=cy-11,depth=c.thickness;
    const at=(a,ccx=cx,ccy=cy)=>[ccx+r*Math.cos(a*Math.PI/180),ccy+r*Math.sin(a*Math.PI/180)];
    const wedge=(start,end,ccx=cx,ccy=cy)=>{const a=at(start,ccx,ccy),d=at(end,ccx,ccy);return `M ${ccx} ${ccy} L ${a[0]} ${a[1]} A ${r} ${r} 0 ${end-start>180?1:0} 1 ${d[0]} ${d[1]} Z`;};
    const small=wedge(180,288,smallCx,smallCy),large=wedge(288,540);
    const white=s.linear('white',[{offset:0,color:'#FAFAFA'},{offset:38,color:'#F4F4F3'},{offset:100,color:'#DADBD9'}],80);
    const surface=s.radial('ambient',[{offset:0,color:'#FFFFFF',opacity:.9},{offset:70,color:'#FFFFFF',opacity:.04},{offset:100,color:'#7A807F',opacity:.1}],35,19,90);
    const blue=s.radial('bluecore',c.stops||[{offset:0,color:c.mainColor,opacity:.98},{offset:46,color:c.mainColor,opacity:.96},{offset:68,color:mix(c.mainColor,c.deepColor,.12),opacity:.92},{offset:82,color:c.mainColor,opacity:.44},{offset:96,color:c.mainColor,opacity:.06},{offset:100,color:c.mainColor,opacity:0}],c.glowX,c.glowY,c.glowRadius);
    const shadow=s.linear('pieside',[{offset:0,color:'#AAAAA8'},{offset:50,color:'#D1D1CC'},{offset:100,color:'#DCDDD8'}],90);
    if(c.layers.shadow)b+=ellipse(cx+28,cy+112,r-30,r-26,'#838981',{opacity:c.shadow/170,filter:s.shadowFilter});
    b+=tag('g',{transform:`translate(0 ${depth})`},path(large,shadow)+path(small,shadow));
    b+=path(large,white)+path(small,white);
    const fullClip=s.clip('piepieces',path(large,'#FFF')+path(small,'#FFF'));
    b+=tag('g',{'clip-path':fullClip},ellipse(cx,cy,r,r,surface));
    if(c.layers.glow)b+=tag('g',{'clip-path':fullClip},rect(cx-r,cy-r,2*r,2*r,blue,{filter:s.softFilter}));
    // The cut itself is crisp: a blurred material field never replaces the edge.
    b+=path(`M ${cx-r+1} ${cy+depth} L ${cx} ${cy+depth} L ${at(288)[0]} ${at(288)[1]+depth} L ${at(288)[0]} ${at(288)[1]} L ${cx} ${cy} L ${cx-r+1} ${cy} Z`,c.deepColor,{opacity:.66});
    if(c.layers.rim){
      b+=path(large,'none',{stroke:'#FFFFFF','stroke-width':2.1,opacity:c.rim/125});
      b+=path(small,'none',{stroke:'#FFFFFF','stroke-width':2.1,opacity:c.rim/125});
    }
    if(c.showLabels){
      b+=text(308,383,'30%',44,c.lightColor,{'font-weight':600,'text-anchor':'middle',opacity:.94});
      b+=text(308,410,'6,798 m²',21,c.lightColor,{'text-anchor':'middle',opacity:.75});
      b+=text(475,547,c.value||'70%',45,c.lightColor,{'font-weight':600,'text-anchor':'middle',opacity:.95});
      b+=text(475,577,'15,562 m²',21,c.lightColor,{'text-anchor':'middle',opacity:.75});
      b+=line(535,155,895,155,'#B3B9B8',1,{opacity:.5});
      b+=text(905,148,'30% 구간',21,'#8D979A',{'text-anchor':'end'});
      b+=line(745,465,920,465,'#B3B9B8',1,{opacity:.5});
      b+=text(920,451,'70% 구간',21,'#8D979A',{'text-anchor':'end'});
    }
    return s.fit(b,1000,900);
  }
  function amber(s) {
    const {c}=s;let b='';const cx=485,cy=645,rx=365,ry=182,t=c.thickness;
    const gold=s.linear('amberfill',c.stops||[{offset:0,color:mix(c.mainColor,'#FFFFFF',.46)},{offset:22,color:c.mainColor},{offset:61,color:mix(c.mainColor,c.lightColor,.2)},{offset:100,color:mix(c.mainColor,c.deepColor,.2)}],c.gradientAngle);
    const glass=s.linear('glass',[{offset:0,color:'#7B878C',opacity:.7},{offset:8,color:'#FFFFFF',opacity:.95},{offset:15,color:'#344A51',opacity:.5},{offset:25,color:'#FFFFFF',opacity:.68},{offset:72,color:'#A9BCC4',opacity:.12},{offset:90,color:'#F6FBFF',opacity:.7},{offset:100,color:'#53616B',opacity:.62}],95);
    const bottom=s.linear('amberedge',[{offset:0,color:c.deepColor},{offset:40,color:mix(c.mainColor,c.deepColor,.4)},{offset:70,color:c.mainColor},{offset:100,color:c.lightColor}],90);
    const half=`M ${cx} ${cy} L ${cx} ${cy-ry+12} A ${rx-14} ${ry-12} 0 0 1 ${cx+100} ${cy+ry-10} Z`;
    if(c.layers.shadow)b+=ellipse(cx+12,cy+t+62,rx-10,ry-10,'#7C7770',{opacity:c.shadow/160,filter:s.shadowFilter});
    // Low-opacity reflection stops within the floor, not a duplicated opaque pie.
    if(c.layers.glow)b+=ellipse(cx,cy+t+105,rx-35,ry-55,c.lightColor,{opacity:.11,filter:s.softFilter});
    b+=ellipse(cx,cy+t,rx,ry,glass,{stroke:'#656B68','stroke-width':1.5,opacity:.82});
    b+=path(`M ${cx} ${cy-ry+12} A ${rx-14} ${ry-12} 0 0 1 ${cx+100} ${cy+ry-10} L ${cx+100} ${cy+ry-10+t} A ${rx-14} ${ry-12} 0 0 0 ${cx} ${cy-ry+12+t} Z`,bottom);
    b+=ellipse(cx,cy,rx,ry,'#E9EEF1',{'fill-opacity':.2,stroke:'#8F948D','stroke-width':3});
    b+=path(half,gold,{'fill-opacity':.92});
    const glow=s.radial('ambergloss',[{offset:0,color:'#FFFFFF',opacity:.75},{offset:45,color:'#FFFFFF',opacity:.13},{offset:100,color:'#FFFFFF',opacity:0}],75,22,60);
    b+=path(half,glow);
    const wall=s.linear('glasswall',[{offset:0,color:'#FFFFFF',opacity:.9},{offset:34,color:'#819091',opacity:.38},{offset:62,color:'#FFFFFF',opacity:.72},{offset:100,color:'#DDE7E7',opacity:.38}],0);
    b+=path(`M ${cx} ${cy-ry} L ${cx} ${cy+6} L ${cx+174} ${cy+ry-9} L ${cx+174} ${cy+ry-9+t} L ${cx-2} ${cy+21} L ${cx-2} ${cy-ry+t} Z`,wall,{stroke:'#F7FFFF','stroke-width':1.8});
    b+=path(`M ${cx-rx+9} ${cy-25} L ${cx} ${cy+6} L ${cx+174} ${cy+ry-9}`,'none',{stroke:'#81918F','stroke-width':6,opacity:.4});
    b+=path(`M ${cx-rx+9} ${cy-29} L ${cx} ${cy+2} L ${cx+174} ${cy+ry-13}`,'none',{stroke:'#FFFFFF','stroke-width':2.7,opacity:.85});
    if(c.layers.rim){
      b+=ellipse(cx,cy,rx,ry,'none',{stroke:glass,'stroke-width':12,opacity:c.rim/100});
      b+=ellipse(cx,cy-4,rx-7,ry-6,'none',{stroke:'#FFFFFF','stroke-width':2.3,opacity:c.rim/110});
      b+=ellipse(cx,cy+t,rx,ry,'none',{stroke:glass,'stroke-width':5,opacity:c.rim/100});
      b+=path(`M ${cx-rx+15} ${cy+40} A ${rx-15} ${ry-20} 0 0 0 ${cx+230} ${cy+ry-45}`,'none',{stroke:'#FFFFFF','stroke-width':3.3,opacity:c.rim/110});
    }
    b+=text(cx,123,c.value||'1,100',80,mix(c.mainColor,c.deepColor,.1),{'text-anchor':'middle','font-weight':600});
    if(c.showLabels){
      b+=text(cx,157,'Group R&D Employees',17,c.mainColor,{'text-anchor':'middle'});
      const labels=[{x:270,y:229,w:288,t:'172 Workshop and Administration Staff',tx:425,ty:580},{x:533,y:315,w:267,t:'350 Lab Staff and Technicians',tx:655,ty:635},{x:126,y:396,w:260,t:'346 Scientists and Engineers',tx:265,ty:715}];
      labels.forEach(l=>{b+=line(l.tx,l.y+26,l.tx,l.ty,'#3E474B',1.3,{'stroke-dasharray':'3 4',opacity:.58});b+=circle(l.tx,l.ty,4,'#FFFFFF',{stroke:'#879293','stroke-width':1.4});b+=rect(l.x,l.y,l.w,27,'#F1F3F2',{stroke:'#6E7877','stroke-width':1});b+=text(l.x+l.w/2,l.y+18,l.t,12.8,'#252D30',{'text-anchor':'middle','font-weight':600});});
    }
    return s.fit(b,1000,1000);
  }
  function funnel(s) {
    const {c}=s;let b='';const bw=1000,bh=1100,center=440;
    const titles=['Visits','Signups','Activated','Paid customers'];
    const values=['450,000','18,000 (4.0%)','8,280 (46.0%)','1,656 (20.0%)'];
    b+=text(80,65,c.title||'Signup to Paid Funnel',46,'#111B30',{'font-weight':700});
    if(c.showLabels)b+=text(82,105,'디자인 재현용 예시 · 4단계',20,'#778194');
    for(let i=0;i<4;i++){
      const top=185+i*208,w=610-i*73,h=177,d=c.thickness*.75;
      const left=center-w/2,right=center+w/2;
      const start=[mix(c.lightColor,'#FFFFFF',.65),mix(c.lightColor,'#FFFFFF',.4),mix(c.mainColor,c.lightColor,.22),c.mainColor][i];
      const end=i<2?mix(start,c.deepColor,i===0?.07:.14):mix(c.mainColor,c.deepColor,.25);
      const front=`M ${left} ${top+25} Q ${center} ${top+83} ${right} ${top+25} L ${right-30} ${top+h-25} Q ${center} ${top+h+32} ${left+30} ${top+h-25} Z`;
      const side=`M ${right} ${top+25} L ${right-30} ${top+h-25} L ${center+38} ${top+h+58} L ${center+38} ${top+69} Z`;
      const upper=`M ${left} ${top+25} L ${center+12} ${top-19} L ${right} ${top+25} L ${center+8} ${top+73} Z`;
      const fill=s.linear('funnel'+i,c.stops?c.stops.map(z=>({...z,color:mix(z.color,start,.45)})):[{offset:0,color:mix(start,'#FFFFFF',.45)},{offset:47,color:start},{offset:100,color:end}],c.gradientAngle);
      const shade=s.linear('funnel-side'+i,[{offset:0,color:start},{offset:100,color:mix(end,c.deepColor,.3)}],0);
      if(c.layers.shadow)b+=tag('g',{transform:`translate(${26+d} ${20+d})`,filter:s.shadowFilter,opacity:c.shadow/120},path(front,'#4A587C'));
      b+=path(front,fill,{stroke:mix(start,'#FFFFFF',.35),'stroke-width':1.3});
      b+=tag('g',{'clip-path':s.clip('funnel-side-clip'+i,path(front,'#FFF'))},path(side,shade,{opacity:.26}));
      b+=path(upper,s.linear('funnel-top'+i,[{offset:0,color:mix(start,'#FFFFFF',.58)},{offset:43,color:mix(start,c.deepColor,.14)},{offset:100,color:mix(start,'#FFFFFF',.25)}],90),{stroke:'#FFFFFF','stroke-width':2,'stroke-opacity':.5});
      const cp=s.clip('funnelclip'+i,path(front,'#FFF'));
      const shine=s.radial('funnelshine'+i,[{offset:0,color:'#FFFFFF',opacity:.62},{offset:40,color:'#FFFFFF',opacity:.12},{offset:100,color:'#FFFFFF',opacity:0}],24,17,70);
      b+=tag('g',{'clip-path':cp},rect(left,top,w,h+30,shine));
      if(c.layers.glow)b+=path(`M ${left+24} ${top+45} Q ${center} ${top+99} ${right-26} ${top+45}`,'none',{stroke:c.lightColor,'stroke-width':6,filter:s.softFilter,opacity:.32});
      if(c.layers.rim)b+=path(`M ${left} ${top+25} Q ${center} ${top+83} ${right} ${top+25} M ${left+30} ${top+h-25} Q ${center} ${top+h+32} ${right-30} ${top+h-25}`,'none',{stroke:'#F6FCFF','stroke-width':2.1,opacity:c.rim/125});
      if(c.showLabels){
        const color=i<2?'#131E35':'#F6FAFF';
        b+=text(left+38,top+95,titles[i],27,color,{'font-weight':600});
        b+=text(left+38,top+133,values[i],31,color,{'font-weight':600});
        b+=text(left-27,top+97,'Step '+(i+1),21,'#172035',{'text-anchor':'end','font-weight':600});
        if(i>1){const xx=782,yy=top+52;b+=line(right+12,yy+32,xx-14,yy+32,c.mainColor,2);b+=circle(right+12,yy+32,5,'#FFFFFF');b+=circle(xx-14,yy+32,5,c.mainColor);b+=rect(xx,yy,185,96,'#F8FBFF',{rx:23,stroke:'#FFFFFF','stroke-width':2});b+=text(xx+17,yy+33,i===2?'Activation':'Conversion',20,'#17243C',{'font-weight':600});b+=text(xx+17,yy+63,i===2?'46.0%':'20.0%',23,'#506394');}
      }
    }
    return s.fit(b,bw,bh);
  }
  function bars(s) {
    const {c}=s;let b='';const xs=[165,395,625,855],values=[50,25,100,75],colors=['#FE9E13','#013476',c.mainColor,'#FC395B'];
    const labels=Array.isArray(c.labels)?c.labels:['항목 A','항목 B','항목 C','항목 D'];
    const bottom=675,maxHeight=455,dx=77,dy=40+c.thickness*.28;
    const fade=s.linear('bar-reflection',[{offset:0,color:'#FFFFFF',opacity:.27},{offset:100,color:'#FFFFFF',opacity:0}],90);
    s.defs.push(tag('mask',{id:s.prefix+'reflection'},rect(0,bottom,1100,180,fade)));
    colors.forEach((co,i)=>{
      const x=xs[i],v=values[i],top=bottom-maxHeight*v/100;
      const left=`M ${x-dx} ${top-dy} L ${x} ${top} L ${x} ${bottom} L ${x-dx} ${bottom-dy} Z`;
      const right=`M ${x} ${top} L ${x+dx} ${top-dy} L ${x+dx} ${bottom-dy} L ${x} ${bottom} Z`;
      const cap=`M ${x-dx} ${top-dy} L ${x} ${top-2*dy} L ${x+dx} ${top-dy} L ${x} ${top} Z`;
      const pale=i===0?'#FFF0A3':i===1?'#3FE0FB':i===2?c.lightColor:'#FFB2BC';
      const fillL=s.linear('barleft'+i,c.stops?c.stops.map(o=>({...o,color:mix(o.color,co,.55)})):[{offset:0,color:co},{offset:52,color:mix(co,pale,.13)},{offset:100,color:mix(co,pale,.78)}],90);
      const fillR=s.linear('barright'+i,[{offset:0,color:mix(co,c.deepColor,.25)},{offset:40,color:co},{offset:100,color:mix(co,pale,.6)}],90);
      const fillT=s.linear('bartop'+i,[{offset:0,color:mix(co,pale,.6)},{offset:100,color:co}],c.gradientAngle);
      const parts=path(left,fillL)+path(right,fillR)+path(cap,fillT);
      if(c.layers.shadow)b+=path(`M ${x-dx} ${bottom-dy} L ${x+dx} ${bottom-dy} L ${x+dx+90} ${bottom+85} L ${x+60} ${bottom+126} Z`,'#6B8190',{opacity:c.shadow/180,filter:s.blur('barshadow'+i,Math.max(1,c.shadowBlur*.25))});
      if(c.layers.glow)b+=tag('g',{mask:'url(#'+s.prefix+'reflection)',filter:s.blur('barreflection'+i,2)},tag('g',{transform:`translate(0 ${bottom*1.32}) scale(1 -.32)`},parts));
      b+=parts;
      const cp=s.clip('barclip'+i,path(left,'#FFF')+path(right,'#FFF'));
      const gleam=s.radial('barshine'+i,[{offset:0,color:'#FFFFFF',opacity:.4},{offset:65,color:'#FFFFFF',opacity:.04},{offset:100,color:'#FFFFFF',opacity:0}],0,90,95);
      b+=tag('g',{'clip-path':cp},rect(x-dx,top-2*dy,dx*2,bottom-top+dy*2,gleam)+path(`M ${x-23} ${top-2*dy} L ${x+23} ${top-2*dy} L ${x-dx+14} ${bottom} L ${x-dx-18} ${bottom} Z`,'#FFFFFF',{opacity:.09}));
      if(c.layers.rim)b+=path(`M ${x-dx} ${top-dy} L ${x} ${top} L ${x+dx} ${top-dy} M ${x} ${top} L ${x} ${bottom} M ${x-dx} ${top-dy} L ${x-dx} ${bottom-dy} L ${x} ${bottom} L ${x+dx} ${bottom-dy}`,'none',{stroke:'#EFFFFF','stroke-width':1.65,opacity:c.rim/140});
      if(c.showLabels){
        b+=text(x-dx+17,top-dy+49,v+'%',25,'#FFFFFF',{transform:`rotate(22 ${x-dx+17} ${top-dy+49})`,'font-weight':300});
        b+=line(x,top-2*dy-14,x,top-2*dy-69,'#536473',1.5,{'stroke-dasharray':'4 8'});
        const iy=top-2*dy-91;
        if(i===0)b+=path(`M ${x-11} ${iy} l 8 9 l 18 -22`,'none',{stroke:co,'stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round'});
        if(i===1)b+=circle(x-3,iy-5,9,'none',{stroke:co,'stroke-width':3})+line(x+5,iy+3,x+16,iy+17,co,4);
        if(i===2)b+=circle(x,iy,13,co,{stroke:mix(co,c.deepColor,.2),'stroke-width':4})+circle(x,iy,4,'#FFFFFF');
        if(i===3)b+=rect(x-14,iy-2,6,15,co)+rect(x-3,iy-14,6,27,co)+rect(x+8,iy-7,6,20,co);
        b+=text(x,bottom+66,labels[i],22,mix(co,c.deepColor,.3),{'text-anchor':'middle','font-weight':700});
        b+=text(x,bottom+96,'독립 비율 · 예시값',15,'#7C8D99',{'text-anchor':'middle'});
      }
    });
    return s.fit(b,1050,860);
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
    // Preserve the known coastline and extrusion rather than inventing geographic data.
    b+=text(500,190,c.value||'90%',170,c.mainColor,{'text-anchor':'middle','font-weight':800,'letter-spacing':-8});
    if(c.layers.shadow)b+=ellipse(510,477,403,70,'#717B7B',{opacity:c.shadow/190,filter:s.shadowFilter});
    b+=s.imageCrop('REF-01.jpg',[300,211,685,234],55,210,890,304);
    if(c.showLabels){
      b+=text(90,600,c.title||'세계로 이어지는 가능성',33,'#242C32',{'font-weight':600});
      const values=['31','6','8','3','2'], labels=['미국','싱가포르','홍콩','호주','뉴질랜드'];
      values.forEach((v,i)=>{const x=98+i*176;b+=text(x,690,v,50,c.mainColor,{'font-weight':700});b+=text(x,728,labels[i],20,'#717D84');if(i<4)b+=line(x+143,649,x+143,741,'#C4CACA',1.5);});
      b+=text(90,785,'원본 지도 픽셀 보존 · 예시 수치',17,'#899297');
    }
    return s.fit(b,1000,c.showLabels?850:550);
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
  const common=['background','padding','scale','showLabels'];
  const controls={
    map:[...common,'mainColor','shadow','shadowBlur','title','value'],
    amber:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','blur','value'],
    glow:[...common,'mainColor','deepColor','lightColor','stops','glowX','glowY','glowRadius','blur','thickness','rim','shadow','shadowBlur','value'],
    funnel:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','blur','title'],
    slabs:[...common,'palette','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','blur','title'],
    pipe:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','title'],
    bars:[...common,'mainColor','deepColor','lightColor','stops','gradientAngle','thickness','rim','shadow','shadowBlur','labels'],
    territory:[...common,'mainColor','lightColor','shadow','shadowBlur','title','value'],
    paper:['mainColor','deepColor','lightColor','thickness','rim','shadow','shadowBlur','showLabels','value']
  };
  function render(id,input={}) {
    if(!renderers[id])id='slabs';
    const c=sanitize(id,input),s=scene(id,c),body=renderers[id](s);
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${c.width}" height="${c.height}" viewBox="0 0 ${s.W} ${s.H}" role="img" aria-label="${esc(id)} material study"><title>${esc(id)} · reference material study</title><defs>${s.defs.join('')}</defs>${rect(0,0,s.W,s.H,s.bg)}${body}</svg>`;
  }
  global.MaterialRenderer={render,defaults,supportedControls:id=>(controls[id]||common).slice(),bluePalette:BLUE.slice(),version:'20261124-material-r1',sourceModes:{map:'reference-pixels-and-editable-type',territory:'reference-pixels-and-editable-legend',paper:'reference-photo-and-editable-paper'}};
})(typeof window!=='undefined'?window:globalThis);
