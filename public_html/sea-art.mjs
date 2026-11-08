import { SEA_KINDS, SEA_MOUNTS } from './sea-life.mjs?v=4';
const seaOval=(ctx,c,x,y,rx,ry)=>{ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);ctx.fill();};
function seaLine(ctx,c,width,points){ctx.strokeStyle=c;ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}
function seaEye(ctx,x,y,glow=false){if(glow){ctx.shadowColor='#baff75';ctx.shadowBlur=12;}seaOval(ctx,glow?'#d7ff87':'#fff7df',x,y,3,4);ctx.shadowBlur=0;seaOval(ctx,'#112a43',x+1,y,1.3,2);}
function littleFish(ctx,x,y,night){seaOval(ctx,night?'#fff1b0':'#f2ab61',x+8,y+6,8,5);seaLine(ctx,night?'#f9cfff':'#c46478',3,[[x+1,y+6],[x-4,y+1],[x-4,y+11],[x+1,y+6]]);seaOval(ctx,'#152a42',x+12,y+4,1.5,1.5);seaLine(ctx,'#fff',1,[[x+11,y+9],[x+13,y+7],[x+15,y+9]]);}
export function drawSeaCreature(ctx,e,time=0,night=false) {
 const {x,y,w,h,kind}=e, bright=night?'#c1f9ff':'#64b5d1', pink=night?'#ffd9f6':'#d78cbe', mint=night?'#d0ffb1':'#69b991';
 ctx.save();ctx.lineJoin='round';
 if(kind==='whale') {
  seaOval(ctx,bright,x+w*.5,y+h*.5,w*.49,h*.48);
  seaOval(ctx,night?'#edfaff':'#b9dbe2',x+w*.55,y+h*.76,w*.37,h*.17);
  seaLine(ctx,bright,9,[[x+9,y+25],[x-7,y+7],[x-9,y+25],[x+8,y+28]]);
  seaOval(ctx,night?'#9ae9f3':'#4186ac',x+40,y+40,15,6);seaEye(ctx,x+w-26,y+12);
  seaOval(ctx,'#23334b',x+w-12,y+30,13,e.active?14:2);
  if(e.active){seaLine(ctx,'#f4e4c8',2,[[x+w-21,y+20],[x+w-16,y+25],[x+w-11,y+20]]);}
  for(const fish of e.fry||[])littleFish(ctx,fish.x,fish.y,night);
  if(!e.active)for(let i=0;i<3;i++)littleFish(ctx,x+w-31+i*5,y+26,night);
 } else if(kind==='moray') {
  const length=e.extension||0, tip=x+(e.facing>0?w+length:-length), base=x+w/2;
  if(length>4){
   seaLine(ctx,night?'#e2ffc6':'#79ad76',15,[[base,y+18],[base+(tip-base)*.4,y+12+Math.sin(time*3)*5],[tip,y+15]]);
   seaOval(ctx,mint,tip,y+13,12,9);seaEye(ctx,tip+e.facing*5,y+9);seaLine(ctx,'#273f3a',2,[[tip,y+18],[tip+e.facing*11,y+18]]);
  }
  seaOval(ctx,night?'#c9b4dd':'#986b79',x+16,y+20,16,14);seaOval(ctx,'#d4af94',x+16,y+5,12,5);seaOval(ctx,'#283443',x+16,y+6,9,3);
  if(length<=4){seaOval(ctx,'#fff6b0',x+12,y+7,2,2);seaOval(ctx,'#fff6b0',x+20,y+7,2,2);}
 } else if(kind==='seaweed') {
  const extension=e.extension??.8, bottom=y+h;
  for(let i=0;i<4;i++){
   const bx=x+3+i*7, top=bottom-h*extension;
   const points=Array.from({length:9},(_,n)=>[bx+Math.sin(n*.8+time+i)*4, bottom-(bottom-top)*n/8]);
   seaLine(ctx,night?'#dcff91':'#5ea86d',3,points);
   for(let n=2;n<8;n+=2){const [px,py]=points[n];seaOval(ctx,i%2?pink:mint,px+(n%4?4:-4),py,5,2);}
   ctx.strokeStyle=pink;ctx.lineWidth=2;ctx.beginPath();ctx.arc(points[8][0],top,4,0,Math.PI*1.6);ctx.stroke();
  }
 } else if(kind==='geyser') {
  seaOval(ctx,'#527c8c',x+w/2,y+h-4,w/2,8);seaOval(ctx,'#213d53',x+w/2,y+9,9,5);
  if(e.active)for(let i=0;i<17;i++){
   const yy=y-((time*85+i*23)%155),xx=x+w/2+Math.sin(i*2+time)*15;
   ctx.strokeStyle=night?'#deffff':'#92e7f5';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(xx,yy,2+i%4,0,Math.PI*2);ctx.stroke();
  }
 } else {
  ctx.translate(x+(e.facing<0?w:0),y);ctx.scale(e.facing<0?-1:1,1);
  if(kind==='jellyfish'||kind==='squid'){
   for(let i=0;i<5;i++)seaLine(ctx,i%2?pink:bright,2,Array.from({length:6},(_,n)=>[4+i*5+Math.sin(n+time*2+i)*3,14+n*4]));
   if(kind==='squid'){ctx.fillStyle=bright;ctx.beginPath();ctx.moveTo(w/2,-6);ctx.quadraticCurveTo(w+8,16,w/2,22);ctx.quadraticCurveTo(-7,16,w/2,-6);ctx.fill();seaLine(ctx,pink,2,[[3,10],[0,17],[8,15]]);}
   else seaOval(ctx,pink,w/2,11,w*.48,10);
   seaOval(ctx,night?'#fff8ff':'#eac9e2',w*.35,7,5,3);seaEye(ctx,w*.65,12);
  } else if(kind==='bonefish') {
   const fallen=e.phase==='fallen';
   if(!fallen)seaLine(ctx,'#eee6c8',2,[[2,h/2],[w-8,h/2]]);
   for(let i=0;i<4;i++){const xx=4+i*5, yy=fallen?h-4+(i%2)*3:h/2;seaLine(ctx,night?'#fffce4':'#ddd5b8',2,[[xx-3,yy-7],[xx,yy],[xx-3,yy+7]]);}
   seaOval(ctx,night?'#ffffec':'#e9e1c7',w-5,fallen?h-5:12,7,7);seaEye(ctx,w-3,fallen?h-6:10,e.glowing);
  } else if(kind==='dolphin') {
   seaOval(ctx,bright,w*.5,h*.55,w*.48,h*.38);seaOval(ctx,'#edf5e1',w*.58,h*.72,w*.3,h*.15);
   seaLine(ctx,bright,5,[[5,14],[-4,5],[-4,20],[5,14]]);seaLine(ctx,bright,5,[[17,8],[19,0],[26,9]]);
   seaLine(ctx,bright,5,[[w-8,12],[w+6,14]]);seaEye(ctx,w-8,9);
  } else if(kind==='seahorse') {
   seaLine(ctx,night?'#ffe3ae':'#e9ad6e',9,[[15,9],[12,16],[16,25],[11,29],[7,25]]);
   seaOval(ctx,night?'#fff2bf':'#efc284',16,8,8,9);seaLine(ctx,'#e6b789',5,[[20,8],[29,10]]);seaEye(ctx,18,5);
   seaLine(ctx,pink,3,[[9,14],[1,10],[3,21],[10,19]]);
  } else if(kind==='flatfish') {
   const visible=e.active||e.icon;
   if(visible){seaOval(ctx,night?'#ffe5c3':'#bda786',w/2,h/2,w/2,h/2);seaLine(ctx,pink,2,[[2,h/2],[w/2,h],[w-2,h/2]]);}
   if(visible||time%4<.65)seaEye(ctx,w*.65,visible?3:h-2);
  } else if(kind==='seastar') {
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5-Math.PI/2;seaLine(ctx,pink,2,Array.from({length:5},(_,n)=>[w/2+Math.cos(a)*(14+n*3)+Math.sin(time+n)*2,h/2+Math.sin(a)*(14+n*3)]));}
   ctx.fillStyle=night?'#fff1ba':'#eaa170';ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,r=i%2?7:17;const xx=w/2+Math.cos(a)*r,yy=h/2+Math.sin(a)*r;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.closePath();ctx.fill();
   seaEye(ctx,11,12);seaEye(ctx,20,12);seaLine(ctx,'#71475f',2,[[8,6],[13,9],[19,9],[23,6]]);
  } else if(kind==='crab') {
   for(let i=0;i<3;i++)for(const side of [-1,1])seaLine(ctx,pink,2,[[w/2+side*9,10],[w/2+side*16,13+i*3],[w/2+side*18,18+i*2]]);
   seaOval(ctx,night?'#ffd4c2':'#d87d71',w/2,12,12,8);
   for(const side of [-1,1]){const xx=w/2+side*19;seaLine(ctx,pink,3,[[w/2+side*9,10],[xx,4],[xx+side*3,-2]]);seaLine(ctx,pink,3,[[xx,4],[xx-side*4,-1]]);}
   seaEye(ctx,11,5);seaEye(ctx,21,5);
  }
 }
 ctx.restore();
}
export function drawSeaIcon(ctx,id,x,y,size,time,night,icon=true){
 const kind=SEA_KINDS[id]||SEA_MOUNTS[id], w=kind==='whale'?96:32,h=kind==='whale'?48:kind==='seaweed'?80:32;
 ctx.save();ctx.translate(x,y);const scale=size/Math.max(w,h);ctx.scale(scale,scale);
 drawSeaCreature(ctx,{kind,x:0,y:0,w,h,facing:1,active:icon,icon,extension:kind==='moray'?18:.8,phase:'hunting',glowing:true,fry:[]},time,night);ctx.restore();
}
export function drawSeaEffects(ctx,game,time){
 for(const p of game.players||[game.player]){
  if(p.blowTime>0){for(let i=0;i<8;i++){const x=p.x+p.w/2+p.facing*(25+i*13),y=p.y+26+Math.sin(i+time*10)*12;ctx.strokeStyle='#d0fbff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,3+i%3,0,Math.PI*2);ctx.stroke();}}
  if(p.inkTime>0){ctx.save();ctx.globalAlpha=Math.min(1,p.inkTime/3);for(let i=0;i<7;i++){const a=i*Math.PI*2/7;seaOval(ctx,'#11182b',p.inkX+Math.cos(a)*22,p.inkY+Math.sin(a)*18,40,32);}ctx.restore();}
 }
}
