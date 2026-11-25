/* 🌸 2026-11-25: additional studies from the user's uploaded references.
 * The source screenshots are preserved separately. This file draws new editable
 * SVG geometry, using sampled display colors and explicitly proposed lighting.
 */
(function (global) {
  'use strict';
  const MR=global.MaterialRenderer;
  if(!MR || !MR.registerRenderer) throw new Error('MaterialRenderer registration API is required.');
  const {tag,rect,path,ellipse,circle,line,text,mix,hex,clamp}=MR.helpers;
  const common=['background','padding','scale','showLabels','stops','gradientAngle','rim','shadow','shadowBlur'];
  const st=(offset,color,opacity=1)=>({offset,color,opacity});
  const pt=a=>a.map(p=>p.join(' ')).join(' L ');
  const polygon=(a,fill,extra={})=>path('M '+pt(a)+' Z',fill,extra);
  const adapted=(color,base,chosen)=>{
    if(!chosen || String(chosen).toLowerCase()===base.toLowerCase())return color;
    const cv=[1,3,5].map(k=>parseInt(hex(color).slice(k,k+2),16));
    const bv=[1,3,5].map(k=>parseInt(hex(base).slice(k,k+2),16));
    const nv=[1,3,5].map(k=>parseInt(hex(chosen).slice(k,k+2),16));
    return '#'+cv.map((v,i)=>Math.round(clamp(v+nv[i]-bv[i],0,255)).toString(16).padStart(2,'0')).join('');
  };
  const fitOriginal=(s,b,crop)=>{
    const cp=s.clip('source-composition-window',rect(crop[0],crop[1],crop[2],crop[3],'#FFF'));
    return s.fit(tag('g',{transform:`translate(${-crop[0]} ${-crop[1]})`},tag('g',{'clip-path':cp},b)),crop[2],crop[3]);
  };
  const condensed=(x,y,t,size,fill,width,extra={})=>text(x,y,t,size,fill,{'font-family':'Arial, Helvetica, sans-serif',textLength:width,lengthAdjust:'spacingAndGlyphs',...extra});
  function orangeSteps(s){
    const {c}=s,crop=[348,982,585,283],changed=x=>adapted(x,'#FD6B01',c.mainColor);
    let b=rect(348,982,585,283,c.background,{rx:17});
    const number=s.linear('steps-number',c.stops||[st(0,changed('#FF7B06')),st(32,changed('#FD6B01')),st(70,changed('#FD7504')),st(100,changed('#E57215'))],c.gradientAngle);
    const floor=s.linear('steps-floor',[st(0,'#FBDCA1',.14),st(45,'#FBC778',.5),st(100,'#FBCB91',.1)],0);
    // The large number is behind several foreground blocks, as in the reference.
    if(c.layers.shadow)b+=ellipse(636,1255,267,7,'#B2783E',{opacity:c.shadow/180,filter:s.blur('steps-contact',Math.max(.5,c.shadowBlur*.13))});
    b+=rect(348,1251,585,12,floor,{rx:4});
    if(c.showLabels){
      b+=condensed(377,1030,'The total No.of registered accounts represents',20,'#292C2D',420,{'font-weight':500});
      b+=condensed(377,1051,"15% of Singapore’s population aged 20+",20,'#292C2D',408,{'font-weight':500});
      b+=condensed(377,1074,'新加坡註冊用戶總數占本地20歲以上人口的',18,'#3C4142',440);
    }
    const value=String(c.value||'15%').replace('%','');
    const textShadow=s.blur('steps-type-shadow',Math.max(.2,c.blur*.16));
    if(c.layers.shadow)b+=condensed(371,1254,value,190,'#A85F28',176,{'font-weight':700,opacity:c.shadow/180,filter:textShadow});
    b+=condensed(371,1251,value,190,number,176,{'font-weight':700});
    b+=condensed(550,1191,'%',104,number,77,{'font-weight':700});
    if(c.layers.glow){
      const reflectionClip=s.clip('steps-reflection',rect(350,1246,284,18,'#FFF'));
      const faded=s.linear('steps-reflection-fade',[st(0,'#FC8E36',.4),st(100,'#FC8E36',0)],90);
      b+=tag('g',{'clip-path':reflectionClip,opacity:.22,filter:s.blur('steps-reflection-soft',2)},condensed(373,1263,value,190,faded,176,{'font-weight':700,transform:'translate(0 2516) scale(1 -1)'}));
    }
    const blocks=[
      {x:813,y:1035,w:117,h:226,base:'#F9AF64',a:'#F9BC7D',mid:'#F5B776',bottom:'#FBC99F'},
      {x:748,y:1146,w:101,h:115,base:'#F9A359',a:'#FDB56A',mid:'#FAA24F',bottom:'#F8AF72'},
      {x:687,y:1177,w:77,h:84,base:'#F7BC77',a:'#F6C891',mid:'#F7BC77',bottom:'#FCCC97'},
      {x:461,y:1217,w:132,h:44,base:'#F8C174',a:'#FCCA87',mid:'#FAC786',bottom:'#F9C981'},
      {x:584,y:1222,w:44,h:39,base:'#FADFA4',a:'#FBE0A3',mid:'#FADE9C',bottom:'#F8D99A'}
    ];
    blocks.forEach((o,i)=>{
      const co=changed(o.base),fill=s.linear('steps-block'+i,[st(0,changed(o.a),.96),st(37,changed(o.mid),.94),st(76,co,.9),st(100,changed(o.bottom),.8)],90);
      const face=s.linear('steps-side'+i,[st(0,changed('#F9D19A'),.4),st(18,changed('#F9D19A'),.12),st(100,changed('#EA932D'),.18)],0);
      b+=rect(o.x,o.y,o.w,o.h,fill,{rx:3});
      b+=rect(o.x,o.y,o.w,o.h,face,{rx:3});
      if(c.layers.rim)b+=line(o.x+1,o.y+2,o.x+1,o.y+o.h-2,'#FFF1CC',1.1,{opacity:c.rim/150});
    });
    const skyline=s.linear('steps-skyline',[st(0,changed('#F9D19F'),.95),st(60,changed('#F9DDAA'),.85),st(100,changed('#FADEA0'),.9)],90);
    b+=path('M 638 1261 L 638 1144 Q 639 1128 650 1124 L 650 1119 L 658 1119 L 660 1090 L 663 1119 L 670 1119 L 670 1124 Q 686 1130 686 1146 L 686 1261 Z',skyline);
    b+=path('M 586 1261 L 586 1206 L 595 1191 L 595 1180 L 600 1174 L 600 1168 L 605 1168 L 605 1180 L 616 1191 L 621 1207 L 621 1261 Z',skyline);
    if(c.layers.rim){
      b+=path('M 836 1115 C 839 1089 849 1064 874 1057 C 895 1050 910 1067 906 1090 C 901 1114 885 1129 864 1128 C 848 1127 838 1115 841 1103 C 843 1092 856 1089 864 1097 C 867 1105 875 1110 882 1101 C 890 1090 878 1081 876 1090 C 871 1100 865 1114 852 1115','none',{stroke:'#FFE3AD','stroke-width':2.1,opacity:c.rim/125});
    }
    return fitOriginal(s,b,crop);
  }
  const pillarBase=['#B96D12','#BA438A','#6055B2','#008B92','#80A31A'];
  const pillarData=[
    {v:50,left:['#D28D64','#C96526','#BD4A0D','#C35212'],right:['#C89C07','#B96D12','#BE6715','#CA5C2D'],top:['#FFF0B0','#F6AB47','#ED8225'],type:'#CE9E56'},
    {v:35,left:['#CC5AA5','#AD3084','#800C55','#87135C'],right:['#C64A95','#BA438A','#AF3581','#A83280'],top:['#F37FC5','#DA4AA5','#A7208E'],type:'#9F2F73'},
    {v:65,left:['#8871B8','#5D468B','#2E1267','#32146B'],right:['#7466BF','#6055B2','#5847A3','#53459C'],top:['#B3A5E0','#9B8EDB','#5E50B4'],type:'#695A85'},
    {v:45,left:['#62ADB1','#428688','#126660','#0A7162'],right:['#08A4AE','#008B92','#008C88','#009D83'],top:['#64D6D2','#37BCC7','#02A899'],type:'#5DA49D'},
    {v:100,left:['#BED939','#8EB14A','#508C15','#4E8D10'],right:['#B5BE09','#9DB51C','#80A31A','#73A21A'],top:['#DFEF2F','#C0DA1B','#8CBA62'],type:'#ABC57D'}
  ];
  function pillarIcon(x,y,i,color){
    const style={stroke:color,'stroke-width':3,fill:'none','stroke-linejoin':'round','stroke-linecap':'round',opacity:.55};
    if(i===0)return path(`M ${x-14} ${y+13} Q ${x-31} ${y-7} ${x-8} ${y-27} Q ${x+12} ${y-40} ${x+15} ${y-17} Q ${x+17} ${y} ${x-1} ${y+6} L ${x-6} ${y+17} L ${x-9} ${y+7} L ${x-18} ${y+16} Z`,'none',style)+circle(x-3,y-15,6,'none',style);
    if(i===1)return path(`M ${x-13} ${y-5} Q ${x-31} ${y-23} ${x-13} ${y-35} Q ${x+7} ${y-47} ${x+10} ${y-27} Q ${x+12} ${y-16} ${x-3} ${y-6} L ${x-3} ${y+9} L ${x-13} ${y+12} Z M ${x-14} ${y+16} L ${x-2} ${y+13} M ${x-11} ${y+3} L ${x-10} ${y-23} L ${x-4} ${y-15}`,'none',style);
    if(i===2)return path(`M ${x-27} ${y-20} L ${x+5} ${y-30} L ${x+5} ${y-2} L ${x-27} ${y+8} Z M ${x-29} ${y+13} L ${x+12} ${y+1} L ${x+17} ${y+8} L ${x-37} ${y+25} Z`,'none',style)+line(x-18,y-12,x-1,y-17,color,2,{opacity:.5});
    if(i===3)return path(`M ${x-20} ${y-30} L ${x+8} ${y-39} L ${x+8} ${y+13} L ${x-20} ${y+22} Z M ${x-16} ${y-24} L ${x+4} ${y-31} M ${x-16} ${y+11} L ${x+4} ${y+4}`,'none',style)+circle(x-7,y+12,2,color,{opacity:.65});
    return path(`M ${x-25} ${y+18} L ${x-25} ${y+5} L ${x-20} ${y+3} L ${x-20} ${y+17} M ${x-14} ${y+15} L ${x-14} ${y-7} L ${x-9} ${y-9} L ${x-9} ${y+13} M ${x-3} ${y+11} L ${x-3} ${y-20} L ${x+2} ${y-22} L ${x+2} ${y+9} M ${x-26} ${y-9} L ${x-7} ${y-33} L ${x+9} ${y-46} M ${x-1} ${y-41} L ${x+9} ${y-46} L ${x+4} ${y-34}`,'none',style);
  }
  function filledPillars(s){
    const {c}=s,crop=[125,300,1015,990],pal=Array.isArray(c.palette)&&c.palette.length===5?c.palette:pillarBase;
    let b=rect(125,300,1015,990,c.background);
    const wash=s.radial('pillar-bg',[st(0,'#D6E0E3',.4),st(65,'#CBD7DC',.1),st(100,'#91A0AC',.1)],54,42,73);
    b+=rect(125,300,1015,990,wash);
    const whiteLeft=s.linear('pillar-whiteleft',[st(0,'#E8ECEE'),st(8,'#DDE3E7'),st(52,'#CDD3D8'),st(100,'#CFD4D9')],0);
    const whiteRight=s.linear('pillar-whiteright',[st(0,'#C3CAD1'),st(55,'#C4CBD2'),st(100,'#BAC3CB')],0);
    const whiteTop=s.linear('pillar-whitetop',[st(0,'#EFF3F5'),st(46,'#DEE5E7'),st(100,'#D3DCDF')],32);
    const baseLeft=s.linear('pillar-base-left',[st(0,'#F0F0F4'),st(60,'#E0DDE2'),st(100,'#D5D4DA')],8);
    const baseRight=s.linear('pillar-base-right',[st(0,'#FFFFFF'),st(65,'#F6FDFA'),st(100,'#EAF3F2')],19);
    for(let i=0;i<5;i++){
      const x=162+i*200,mid=x+76,r=x+152,co=hex(pal[i],pillarBase[i]),d=pillarData[i];
      const val=Array.isArray(c.values)&&c.values.length===5?clamp(c.values[i],0,100):d.v;
      const colorY=800-4.4*val,backY=colorY-26,frontY=colorY+26,base=800;
      const change=cc=>adapted(cc,pillarBase[i],co);
      if(c.layers.shadow){
        b+=ellipse(mid-20,1007,91,27,'#4C5E69',{opacity:c.shadow/125,filter:s.blur('pillar-ground'+i,Math.max(.5,c.shadowBlur*.5))});
        b+=ellipse(mid,1020,57,10,'#54626B',{opacity:c.shadow/185,filter:s.blur('pillar-contact'+i,4)});
      }
      // Ghost column above the colored level retains separate translucent faces.
      b+=polygon([[x,360],[mid,386],[mid,825],[x,799]],whiteLeft,{opacity:.86});
      b+=polygon([[mid,386],[r,360],[r,799],[mid,825]],whiteRight,{opacity:.82});
      b+=polygon([[x,360],[mid,334],[r,360],[mid,386]],whiteTop);
      const left=s.linear('pillar-left'+i,d.left.map((v,k)=>st([0,18,72,100][k],change(v))),0);
      const right=s.linear('pillar-right'+i,c.stops?c.stops.map(z=>({...z,color:mix(z.color,co,.6)})):d.right.map((v,k)=>st([0,24,73,100][k],change(v))),c.gradientAngle);
      const top=s.linear('pillar-top'+i,d.top.map((v,k)=>st([0,48,100][k],change(v))),0);
      const leftPoints=[[x,colorY],[mid,frontY],[mid,825],[x,799]],rightPoints=[[mid,frontY],[r,colorY],[r,799],[mid,825]];
      b+=polygon(leftPoints,left)+polygon(rightPoints,right);
      b+=polygon([[x,colorY],[mid,backY],[r,colorY],[mid,frontY]],top);
      // A broad soft reflection and a thin bright edge sit above the volume color.
      if(c.layers.glow){
        const cp=s.clip('pillar-left-clip'+i,polygon(leftPoints,'#FFF'));
        const sheen=s.linear('pillar-sheen'+i,[st(0,'#FFFFFF',.32),st(12,'#FFFFFF',.12),st(33,'#FFFFFF',.02),st(100,'#FFFFFF',0)],0);
        b+=tag('g',{'clip-path':cp},rect(x+3,colorY,72,base-colorY+30,sheen));
        b+=polygon([[x,799],[mid,774],[r,799],[mid,825]],change('#E4DBA7'),{opacity:.1});
      }
      if(c.layers.rim)b+=line(x+1,360,x+1,799,'#F9FFFF',2.2,{opacity:c.rim/300})+line(mid,386,mid,frontY,'#EFF6F6',1.4,{opacity:c.rim/400});
      b+=polygon([[x,799],[mid,825],[mid,1021],[x,996]],baseLeft);
      b+=polygon([[mid,825],[r,799],[r,996],[mid,1021]],baseRight);
      if(c.layers.glow){
        const reflection=s.linear('pillar-reflection'+i,[st(0,'#E4EEEE',.18),st(100,'#E4EEEE',0)],90);
        b+=polygon([[x,999],[mid,1024],[r,999],[r,1077],[mid,1098],[x,1077]],reflection);
      }
      const tc=change(d.type);
      if(c.showLabels){
        b+=pillarIcon(mid+43,774,i,'#F7F9EA');
        b+=condensed(mid+12,883,String(Math.round(val)),65,tc,57,{'font-weight':400,transform:`skewY(-6) translate(0 ${.105*(mid+12)})`});
        b+=condensed(mid+25,915,'%',39,tc,28,{'font-weight':400});
        b+=condensed(x+32,955,'Infographics',23,'#7E7E86',92,{transform:`rotate(-80 ${x+32} 955)`});
        b+=condensed(x+51,956,'Business elements',10,'#9697A0',82,{transform:`rotate(-80 ${x+51} 956)`});
        b+=rect(x,1085,152,203,'#65747B',{rx:5,opacity:.57});
        b+=condensed(x+15,1122,'LOREM IPSUM',27,mix(tc,'#E7E9E0',.42),122,{'font-weight':400});
        const lines=['Lorem ipsum dolor sit','amet, consectetur','adipiscing elit. Sed','eiusmod tempor ut','enim ad minim veniam.'];
        lines.forEach((str,j)=>b+=condensed(x+15,1159+j*15,str,12,'#BAC3C9',121));
        b+=tag('g',{transform:`translate(${x+70} 1261) scale(1.1)`},pillarIcon(0,0,i,'#30434E'));
      }
    }
    return fitOriginal(s,b,crop);
  }
  const foldedBase=['#F4B303','#FA8C02','#64619B','#498CE7','#28B588'];
  function foldedBars(s){
    const {c}=s,crop=[10,190,1258,1080],pal=Array.isArray(c.palette)&&c.palette.length===5?c.palette:foldedBase;
    let b=rect(10,190,1258,1080,c.background);
    const ambient=s.radial('folded-ambient',[st(0,'#E9F6FF',.7),st(62,'#D3E3F2',.1),st(100,'#C0D5E7',.25)],80,5,115);
    b+=rect(10,190,1258,1080,ambient);
    if(c.showLabels)b+=condensed(360,246,c.title||'FLAT INFOGRAPHICS',54,'#8795A1',555,{'font-weight':700});
    const horizonY=1195;
    const horizon=s.linear('folded-wall-shadow',[st(0,'#687D91',0),st(84,'#687D91',.08),st(100,'#687D91',.17)],90);
    b+=rect(10,1128,1258,68,horizon);
    b+=rect(10,horizonY,1258,75,s.linear('folded-floor',[st(0,'#D8E7F4'),st(100,'#E2ECF4')],90));
    const lefts=[194,384,573,762,950],tops=[738,959,668,816,548],values=[21,12,32,19,68],calltops=[572,798,507,648,382];
    const floorEnd=[[17,221],[297,477],[551,734],[808,989],[1063,1268]];
    const actualValues=Array.isArray(c.values)&&c.values.length===5?c.values.map(v=>clamp(v,0,100)):values;
    const customData=actualValues.some((v,i)=>v!==values[i]);
    for(let i=0;i<5;i++){
      const x=lefts[i],w=140,cx=x+w/2,top=customData?horizonY-actualValues[i]*6.46:tops[i],ct=customData?top-166:calltops[i],co=hex(pal[i],foldedBase[i]);
      const change=cc=>adapted(cc,foldedBase[i],co),v=actualValues[i];
      const typeColor=change(['#E2B22E','#E3922A','#64608B','#5588C4','#38A988'][i]);
      const vertical=s.linear('folded-body'+i,c.stops?c.stops.map(z=>({...z,color:mix(z.color,co,.66)})):[st(0,mix(co,'#FFFFFF',.025)),st(48,co),st(84,mix(co,'#000000',.025)),st(96,mix(co,'#000000',.06)),st(100,mix(co,'#000000',.1))],90);
      const floor=s.linear('folded-floor-color'+i,[st(0,mix(co,'#000000',.09)),st(16,mix(co,'#000000',.02)),st(55,mix(co,'#FFFFFF',.01)),st(100,co)],90);
      const floorPoints=[[x,horizonY],[x+w,horizonY],[floorEnd[i][1],1363],[floorEnd[i][0],1363]];
      if(c.layers.shadow){
        b+=rect(x+4,top+4,w,horizonY-top,'#3C5262',{opacity:c.shadow/200,filter:s.blur('folded-panel-shadow'+i,Math.max(.5,c.shadowBlur*.3))});
        b+=line(x,horizonY+3,x+w,horizonY+3,'#4B5862',6,{opacity:c.shadow/130,filter:s.blur('folded-hinge-shadow'+i,4)});
      }
      b+=rect(x,top,w,horizonY-top,vertical)+polygon(floorPoints,floor);
      if(c.layers.rim)b+=line(x+.6,top+1,x+w-.6,top+1,'#F1FFFF',1.5,{opacity:c.rim/250});
      // Value callout: lifted white card, lower pointer and a coherent cast shadow.
      const cardX=cx-82,cardW=164,cardH=124,card=`M ${cardX} ${ct} L ${cardX+cardW} ${ct} L ${cardX+cardW} ${ct+cardH} L ${cx+18} ${ct+cardH} L ${cx} ${ct+cardH+18} L ${cx-18} ${ct+cardH} L ${cardX} ${ct+cardH} Z`;
      if(c.layers.shadow)b+=tag('g',{transform:'translate(3 8)',filter:s.blur('folded-cardshadow'+i,7),opacity:c.shadow/110},path(card,'#596A78'));
      b+=path(card,s.linear('folded-card'+i,[st(0,'#FFFFFF'),st(72,'#FFFFFF'),st(100,'#FAFCFC')],100),{stroke:'#E9F0F1','stroke-width':1.2});
      const iconY=ct-77;
      b+=circle(cx,iconY,38,co,{stroke:mix(co,'#FFFFFF',.4),'stroke-width':1.3});
      const iw={stroke:'#FFFFFF','stroke-width':7,'stroke-linejoin':'round','stroke-linecap':'round'};
      if(i===0)b+=rect(cx-17,iconY+1,8,13,'#FFF')+rect(cx-4,iconY-6,8,20,'#FFF')+rect(cx+9,iconY-14,8,28,'#FFF');
      if(i===1){b+=circle(cx,iconY,12,'none',{stroke:'#FFF','stroke-width':6});for(let j=0;j<8;j++){const a=j*Math.PI/4;b+=line(cx+14*Math.cos(a),iconY+14*Math.sin(a),cx+23*Math.cos(a),iconY+23*Math.sin(a),'#FFF',7);}}
      if(i===2)b+=circle(cx-5,iconY-5,13,'none',{stroke:'#FFF','stroke-width':7})+line(cx+6,iconY+6,cx+21,iconY+21,'#FFF',7);
      if(i===3)b+=path(`M ${cx-17} ${iconY} L ${cx-6} ${iconY+13} L ${cx+20} ${iconY-14}`,'none',iw);
      if(i===4)b+=path(`M ${cx-19} ${iconY-15} L ${cx+19} ${iconY-15} L ${cx+19} ${iconY+9} L ${cx+1} ${iconY+9} L ${cx-8} ${iconY+20} L ${cx-8} ${iconY+9} L ${cx-19} ${iconY+9} Z`,'none',{...iw,'stroke-width':5});
      if(c.showLabels){
        if(c.layers.shadow)b+=condensed(cardX+21,ct+82,`${v}%`,85,mix(co,'#000000',.18),120,{'font-weight':700,opacity:.12,transform:'translate(0 1.7)',filter:s.blur('folded-type-shadow'+i,.8)});
        b+=condensed(cardX+21,ct+81,`${v}%`,85,typeColor,120,{'font-weight':700});
        b+=condensed(cardX+19,ct+111,'LOREM IPSUM DOLOR',12,mix(co,'#18232A',.2),128,{'font-weight':700});
        if(horizonY-top>78)['DOLOR SIT AMET,','CONSECTETUR','ADIPISCING ELIT'].forEach((str,j)=>b+=condensed(x+20,top+34+j*14,str,12,'#FFFFFF',100,{'font-weight':700}));
        const lines=['Lorem ipsum dolor sit amet,','consectetur adipiscing elit,','sed do eiusmod tempor','incididunt ut labore et','dolore magna aliqua.'];
        if(horizonY-top>151)lines.forEach((str,j)=>b+=condensed(x+20,top+91+j*11,str,9,'#E7F1E9',100));
      }
    }
    return fitOriginal(s,b,crop);
  }
  MR.registerRenderer('orangeSteps',orangeSteps,{mainColor:'#FD6B01',deepColor:'#C36D23',lightColor:'#FFE4AD',background:'#E7E9ED',title:'',value:'15%',padding:0,scale:100,shadow:32,shadowBlur:12,blur:6,rim:70,gradientAngle:90},[...common,'mainColor','value','blur']);
  MR.registerRenderer('filledPillars',filledPillars,{mainColor:'#6055B2',deepColor:'#2E1267',lightColor:'#EFF6F6',background:'#A8B0B7',palette:pillarBase.slice(),values:[50,35,65,45,100],padding:0,scale:100,shadow:37,shadowBlur:19,rim:70,blur:6,gradientAngle:90},[...common,'palette','values']);
  MR.registerRenderer('foldedBars',foldedBars,{mainColor:'#64619B',deepColor:'#3F436F',lightColor:'#FFFFFF',background:'#D3E3F2',palette:foldedBase.slice(),values:[21,12,32,19,68],title:'FLAT INFOGRAPHICS',padding:0,scale:100,shadow:35,shadowBlur:18,rim:50,blur:6,gradientAngle:90},[...common,'palette','title','values']);
})(typeof window!=='undefined'?window:globalThis);
