// Purely visual scenery. No level, simulation or multiplayer state lives here.
export const DEPTH_LAYERS = Object.freeze([
  Object.freeze({ id: 'far', speed: .12 }),
  Object.freeze({ id: 'middle', speed: .38 }),
  Object.freeze({ id: 'near', speed: .76 })
]);
const DEPTH_PERIOD = 768;
const DEPTH_PALETTES = {
  grass: ['#77c4dc','#e7f1ce','#a5cbbd','#78aa96','#4f8c72','#a1c88a'],
  sunset: ['#c88fa9','#ffe0ac','#c5a9b4','#b27e95','#876179','#d6ac8d'],
  night: ['#121e3d','#687a8b','#4e627c','#344b67','#273e56','#718d91'],
  winter: ['#94c7e5','#f0f7f4','#a0bed3','#759db7','#416e85','#d8ecf1'],
  moon: ['#080d26','#38455d','#55647e','#76839b','#a0aabe','#d5dde3'],
  castle: ['#111420','#303142','#25283a','#3b3d52','#515166','#ac9474'],
  underwater: ['#67d3df','#164d7b','#397a99','#2b8e99','#39a99b','#b6d7b6'],
  'underwater-night': ['#040c23','#173a52','#173c57','#215b70','#3c9b9d','#9adbc9'],
  'wonder-forest': ['#472b88','#d7b0db','#a291c4','#7561a0','#584878','#cbd9af'],
  'wonder-chess': ['#18152f','#8b86b8','#696689','#504e76','#3b3c60','#d9cbe1'],
  'wonder-sea': ['#171c54','#60b8c0','#4c6caa','#536ba0','#396e8a','#a4e7dc'],
  'wonder-crystal': ['#44246f','#d2a8d9','#a48abd','#78669d','#60518c','#c7e9db']
};
export function depthLayerOrigin(camera, layer, reducedMotion = false) {
  return reducedMotion ? 0 : camera * (1 - layer.speed);
}
export function depthLayerCopies(left, right, camera, layer, reducedMotion = false) {
  const origin = depthLayerOrigin(camera, layer, reducedMotion);
  const first = Math.floor((left - origin) / DEPTH_PERIOD);
  const last = Math.ceil((right - origin) / DEPTH_PERIOD);
  return Array.from({length: Math.max(0,last-first)}, (_,i) => origin + (first+i)*DEPTH_PERIOD);
}
function depthOval(ctx, color, x, y, rx, ry) {
  ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();
}
function depthPolygon(ctx, color, points) {
  ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
}
function depthRidge(ctx, color, x, floor, w, h) {
  ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x-w/2,floor);
  ctx.bezierCurveTo(x-w*.4,floor-h*.55,x-w*.1,floor-h,x,floor-h);
  ctx.bezierCurveTo(x+w*.3,floor-h,x+w*.35,floor-h*.25,x+w/2,floor);ctx.closePath();ctx.fill();
}
function depthTree(ctx,x,floor,h,color,light,snow=false) {
  ctx.fillStyle=color;ctx.fillRect(x-5,floor-h*.6,10,h*.6);
  if(snow){
    for(let i=0;i<3;i++){
      const y=floor-h+i*h*.2,w=h*(.22+i*.045);
      depthPolygon(ctx,color,[[x,y],[x-w,y+h*.43],[x+w,y+h*.43]]);
      depthPolygon(ctx,light,[[x,y],[x-w*.57,y+h*.24],[x+w*.57,y+h*.24],[x+w*.2,y+h*.19]]);
    }
  }else{
    depthOval(ctx,color,x,floor-h*.61,h*.3,h*.39);depthOval(ctx,color,x-h*.2,floor-h*.55,h*.24,h*.26);
    depthOval(ctx,light,x-h*.08,floor-h*.78,h*.24,h*.24);depthOval(ctx,light,x+h*.17,floor-h*.57,h*.22,h*.23);
  }
}
function depthCastle(ctx,x,floor,color,light,w=115) {
  ctx.fillStyle=color;ctx.fillRect(x-w*.35,floor-58,w*.7,58);
  for(const [dx,h] of [[-.4,85],[0,110],[.4,85]]){
    ctx.fillStyle=color;ctx.fillRect(x+dx*w-11,floor-h,22,h);
    depthPolygon(ctx,light,[[x+dx*w-17,floor-h],[x+dx*w,floor-h-23],[x+dx*w+17,floor-h]]);
    ctx.fillStyle=light;ctx.fillRect(x+dx*w-3,floor-h+15,6,12);
  }
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x,floor-133);ctx.lineTo(x,floor-147);ctx.stroke();
  depthPolygon(ctx,light,[[x+1,floor-147],[x+23,floor-142],[x+1,floor-138]]);
}
function depthArch(ctx,x,top,bottom,w,color,light) {
  ctx.fillStyle=color;ctx.fillRect(x-w/2-13,top,13,bottom-top);ctx.fillRect(x+w/2,top,13,bottom-top);
  ctx.strokeStyle=color;ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(x-w/2,top+40);ctx.quadraticCurveTo(x,top-28,x+w/2,top+40);ctx.stroke();
  ctx.strokeStyle=light;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-w/2-4,bottom);ctx.lineTo(x-w/2-4,top+42);ctx.quadraticCurveTo(x,top-15,x+w/2+4,top+42);ctx.stroke();
}
function paintDepthPanel(ctx, theme, index, height) {
  const p=DEPTH_PALETTES[theme]||DEPTH_PALETTES.grass;
  const floor=height-64,water=theme.startsWith('underwater')||theme==='wonder-sea',winter=theme==='winter',moon=theme==='moon',indoor=theme==='castle';
  // Paint one repeat; its neighbours are drawn once by the viewport loop.
  const base=0;
  if(indoor){
    if(index===0){
      for(let j=0;j<3;j++){
        const x=base+85+j*260;ctx.fillStyle='#14192b';ctx.fillRect(x-40,75,80,Math.max(100,floor-75));
        depthArch(ctx,x,85,floor,80,p[2],'#3d425b');
        ctx.fillStyle='#b9ccdd33';ctx.fillRect(x-24,115,48,Math.max(40,height*.25));
      }
    }else if(index===1){
      for(const x of [base+160,base+590])depthArch(ctx,x,48,floor+24,220,p[3],'#5b5b70');
      ctx.fillStyle=p[3];ctx.fillRect(base,floor-28,768,13);
    }else{
      for(const x of [base+12,base+700]){
        ctx.fillStyle=p[4];ctx.fillRect(x-18,0,36,height);ctx.fillStyle='#737084';ctx.fillRect(x-16,0,5,height);
        ctx.fillStyle='#2a2c3c';ctx.fillRect(x-28,floor-25,56,25);
        ctx.fillStyle='#8a7252';ctx.fillRect(x+15,floor-155,7,31);
        depthOval(ctx,'#c4a36a55',x+18,floor-163,15,22);depthOval(ctx,'#f0c987aa',x+18,floor-163,6,12);
      }
    }
    return;
  }
  if(index===0){
    for(const [x,w,h] of [[150,470,235],[570,440,295]]){
      const peak=Math.min(height*.48,h);
      if(water){
        depthRidge(ctx,p[2],base+x,floor+40,w,peak*.7);
        for(let j=0;j<4;j++)depthPolygon(ctx,p[2],[[base+x-45+j*24,floor-40],[base+x-65+j*24,floor-peak],[base+x-80+j*24,floor+30]]);
      }else if(moon){
        depthRidge(ctx,p[2],base+x,floor+30,w,peak*.75);
        depthOval(ctx,'#8995af55',base+x-40,floor-peak*.5,50,9);
      }else{
        depthPolygon(ctx,p[2],[[base+x-w/2,floor+25],[base+x-w*.11,floor-peak*.8],[base+x+w*.08,floor-peak],[base+x+w/2,floor+25]]);
        depthPolygon(ctx,p[3]+'55',[[base+x+w*.08,floor-peak],[base+x+w*.14,floor-peak*.55],[base+x+w/2,floor+25]]);
        if(winter)depthPolygon(ctx,'#edf5f6',[[base+x+w*.08,floor-peak],[base+x-w*.025,floor-peak*.88],[base+x-w*.09,floor-peak*.66],[base+x+w*.04,floor-peak*.73],[base+x+w*.12,floor-peak*.62],[base+x+w*.19,floor-peak*.72]]);
      }
    }
    if(!water&&!moon)for(const [x,y] of [[90,65],[470,105]]){
      depthOval(ctx,'#edf4e988',base+x,y,53,11);depthOval(ctx,'#edf4e988',base+x-16,y-9,25,17);depthOval(ctx,'#edf4e988',base+x+14,y-6,30,14);
    }
  }else if(index===1){
    depthRidge(ctx,p[3],base+200,floor+25,500,Math.min(height*.29,180));
    depthRidge(ctx,p[3],base+600,floor+30,420,Math.min(height*.23,145));
    if(water){
      for(let j=0;j<12;j++)depthTree(ctx,base+j*66,floor-22,55+(j%3)*20,p[3],p[3]);
      depthPolygon(ctx,'#b6f6ed12',[[base+420,0],[base+455,0],[base+650,floor],[base+490,floor]]);
    }else if(moon){
      ctx.fillStyle=p[3];ctx.fillRect(base+410,floor-75,180,44);
      depthOval(ctx,p[3],base+500,floor-75,90,35);ctx.fillStyle='#b3c8d155';ctx.fillRect(base+435,floor-83,130,10);
      ctx.strokeStyle=p[3];ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(base+612,floor-38);ctx.lineTo(base+612,floor-139);ctx.lineTo(base+642,floor-119);ctx.stroke();
    }else{
      for(let j=0;j<9;j++)depthTree(ctx,base+j*96,floor-20,60+(j%3)*16,p[3],p[3],winter);
      if(theme==='wonder-crystal'){
        for(let j=0;j<4;j++)depthPolygon(ctx,p[5]+'66',[[base+510+j*27,floor-90],[base+525+j*27,floor-150-j*9],[base+540+j*27,floor-90]]);
      }else depthCastle(ctx,base+545,floor-53,p[3],p[2],96);
      // A distant waterfall anchors the middle plane without touching the playfield.
      depthPolygon(ctx,p[5]+'66',[[base+214,floor-136],[base+228,floor-136],[base+252,floor-10],[base+218,floor-10]]);
      ctx.fillStyle=p[5]+'55';ctx.fillRect(base+219,floor-132,3,104);
    }
  }else{
    if(water){
      for(const [x,h] of [[75,145],[330,100],[650,170]]){
        const xx=base+x;ctx.strokeStyle=p[4];ctx.lineWidth=7;ctx.lineCap='round';
        for(let j=-1;j<=1;j++){
          ctx.beginPath();ctx.moveTo(xx,floor+12);ctx.bezierCurveTo(xx+j*26,floor-h*.3,xx-j*18,floor-h*.68,xx+j*19,floor-h);ctx.stroke();
          depthOval(ctx,p[5]+'88',xx+j*19,floor-h,5,9);
        }
        depthOval(ctx,p[4],xx+31,floor,31,12);
      }
    }else if(moon){
      for(const [x,h] of [[90,70],[350,43],[650,85]]){
        depthPolygon(ctx,p[4],[[base+x-65,floor+16],[base+x-41,floor-h*.6],[base+x+8,floor-h],[base+x+54,floor-h*.3],[base+x+70,floor+16]]);
        depthPolygon(ctx,p[5],[[base+x+8,floor-h],[base+x+19,floor-h*.2],[base+x+54,floor-h*.3]]);
        depthOval(ctx,p[3],base+x-10,floor-h*.25,21,7);
      }
    }else{
      depthTree(ctx,base+95,floor+16,150,p[4],p[5],winter);
      depthTree(ctx,base+665,floor+17,180,p[4],p[5],winter);
      depthRidge(ctx,p[4],base+325,floor+14,130,40);
      depthOval(ctx,p[5],base+304,floor-13,30,13);
      depthPolygon(ctx,p[4],[[base+450,floor+12],[base+461,floor-23],[base+490,floor-33],[base+522,floor+12]]);
      depthPolygon(ctx,p[5],[[base+461,floor-23],[base+490,floor-33],[base+481,floor+5]]);
    }
  }
}
// One viewport-sized lower-resolution background, independent of the final canvas.
// Foreground drawing keeps the original transform, clip and pixel resolution.
export class BackgroundRaster {
  constructor(makeCanvas = () => globalThis.document?.createElement('canvas') ?? new OffscreenCanvas(1,1)) {
    this.makeCanvas=makeCanvas;this.surface=null;this.failedSize=null;this.resolutionScale=.5;
  }
  dispose() {
    if(this.surface){this.surface.width=0;this.surface.height=0;}
    this.surface=null;this.failedSize=null;
  }
  draw(ctx,paint) {
    const width=ctx.canvas?.width,height=ctx.canvas?.height,t=ctx.getTransform?.();
    if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0||!t||t.b!==0||t.c!==0||t.a<=0||t.d<=0)return false;
    const selectedScale=Number.isFinite(this.resolutionScale)?Math.max(.25,Math.min(.5,this.resolutionScale)):.5;
    const key=`${width}:${height}:${selectedScale}`;
    if(this.failedSize===key)return false;
    const ratio=Math.min(selectedScale,4096/width,4096/height,Math.sqrt(2*1024*1024/(width*height)));
    const w=Math.max(1,Math.floor(width*ratio)),h=Math.max(1,Math.floor(height*ratio));
    let background;
    try {
      this.surface ||= this.makeCanvas();
      if(this.surface.width!==w)this.surface.width=w;
      if(this.surface.height!==h)this.surface.height=h;
      background=this.surface.getContext('2d');
      if(!background||background.isContextLost?.())throw new Error('Achtergrondcanvas niet beschikbaar');
    } catch(error){this.dispose();this.failedSize=key;return false;}
    background.setTransform(1,0,0,1,0,0);background.clearRect(0,0,w,h);
    background.save();
    try {
      background.setTransform(t.a*w/width,0,0,t.d*h/height,t.e*w/width,t.f*h/height);
      paint(background);
    } finally {background.restore();}
    ctx.save();
    try {
      ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=true;
      ctx.drawImage(this.surface,0,0,width,height);
    } finally {ctx.restore();}
    return true;
  }
}
// Keep one theme/height/scale, never a cache of whole levels.
export class DepthPanelCache {
  constructor(scale, makeCanvas = () => globalThis.document?.createElement('canvas') ?? new OffscreenCanvas(1,1)) {
    this.scale=scale;this.makeCanvas=makeCanvas;this.panels=new Map();this.pixels=0;this.key=null;
  }
  dispose() {
    for(const canvas of this.panels.values()){canvas.width=0;canvas.height=0;}
    this.panels.clear();this.pixels=0;this.key=null;this.failedRequest=null;
  }
  getOrNull(theme,index,height) {
    const request=`${theme}:${height}:${this.scale}`;
    if(this.failedRequest===request)return null;
    try{return this.get(theme,index,height);}
    catch(error){this.dispose();this.failedRequest=request;return null;}
  }
  get(theme,index,height) {
    if(!Number.isFinite(this.scale)||this.scale<=0||!Number.isFinite(height)||height<=0||!Number.isInteger(index)||index<0||index>=DEPTH_LAYERS.length)throw new Error('Ongeldig formaat voor achtergrondproef');
    const width=Math.ceil(DEPTH_PERIOD*this.scale),rows=Math.ceil(height*this.scale);
    if(width>8192||rows>8192||width*rows>8*1024*1024)throw new Error('Achtergrondproef overschrijdt de bitmaplimiet');
    const key=`${theme}:${height}:${width}:${rows}`;
    if(this.key!==key){this.dispose();this.key=key;}
    let canvas=this.panels.get(index);
    if(canvas){
      if(canvas.getContext('2d').isContextLost?.())throw new Error('Achtergrondbitmap heeft zijn canvascontext verloren');
      return canvas;
    }
    canvas=this.makeCanvas();canvas.width=width;canvas.height=rows;
    try {
      const panel=canvas.getContext('2d');
      if(!panel)throw new Error('Achtergrondbitmap kan niet worden gemaakt');
      panel.setTransform(width/DEPTH_PERIOD,0,0,rows/height,0,0);
      // Neighbour overhangs are baked once into this repeating transparent tile.
      for(const x of [-DEPTH_PERIOD,0,DEPTH_PERIOD]){
        panel.save();panel.translate(x,0);paintDepthPanel(panel,theme,index,height);panel.restore();
      }
      this.panels.set(index,canvas);this.pixels+=width*rows;
      return canvas;
    } catch(error){canvas.width=0;canvas.height=0;throw error;}
  }
}
export function drawDepthBackground(ctx,height,theme,{left=0,right=768,camera=0,reducedMotion=false,layers=true,panelCache=null}={}) {
  const p=DEPTH_PALETTES[theme]||DEPTH_PALETTES.grass;
  ctx.save();
  const sky=ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,p[0]);sky.addColorStop(1,p[1]);ctx.fillStyle=sky;ctx.fillRect(left,0,right-left,height);
  if(theme!=='castle'){
    const night=theme==='night'||theme==='moon'||theme==='underwater-night'||theme.startsWith('wonder-');
    if(night){
      const layer={speed:.035},origin=depthLayerOrigin(camera,layer,reducedMotion);
      for(let i=Math.floor((left-origin)/100);i*100+origin<right;i++){
        const x=i*100+origin+22,y=25+Math.abs(i*47%Math.max(40,height*.45));
        depthOval(ctx,'#eef8ee99',x,y,1.3,1.3);
      }
    }
    if(!theme.startsWith('underwater')&&theme!=='wonder-sea'){
      const x=(reducedMotion?camera:camera*.97)+150;
      depthOval(ctx,theme==='moon'?'#7bb9d5':'#fff1bd',x,85,theme==='moon'?30:23,theme==='moon'?30:23);
      if(theme==='moon')depthOval(ctx,'#78ad9a',x-7,81,13,20);
      if(theme==='night')depthOval(ctx,p[0],x+9,77,21,21);
    }
  }
  if (layers) {
    // Motifs extend at most 85 logical pixels outside their 768px repeat.
    // One shared clip retains those overhangs without repainting three repeats
    // inside every panel clip. Ascending repeats preserve overlap order.
    ctx.save();ctx.beginPath();ctx.rect(left,0,right-left,height);ctx.clip();
    DEPTH_LAYERS.forEach((layer,index)=>{
      if(panelCache){
        const panel=panelCache.get(theme,index,height);
        if(panel){
          for(const x of depthLayerCopies(left,right,camera,layer,reducedMotion))ctx.drawImage(panel,x,0,DEPTH_PERIOD,height);
          return;
        }
      }
      for(const x of depthLayerCopies(left-96,right+96,camera,layer,reducedMotion)){
        ctx.save();ctx.translate(x,0);paintDepthPanel(ctx,theme,index,height);ctx.restore();
      }
    });
    ctx.restore();
  }
  ctx.restore();
}
