import { drawDepthBackground } from './depth-backgrounds.mjs?v=9';
// Runtime-only campaign objects: regular levels and the builder keep their own rules.
const wonderOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function wonderBodies(game) { return (game.wonderland?.objects || []).filter(o=>['lowRoof','heavy','swing','bossStep'].includes(o.kind)||o.kind==='fading'&&o.active); }
function wonderResize(game,scale,clear) {
  const p=game.player,w=22*scale,h=28*scale;
  const body={...p,x:p.x+(p.w-w)/2,y:p.y+p.h-h,w,h};
  if(!clear(game,body))return false;
  Object.assign(p,body);game.wonderland.scale=scale;return true;
}
function wonderOpen(game) {
  const m=game.wonderland;m.locked=false;
  for(let y=1;y<18;y++)game.tiles[y][m.gateX]=0;
  for(const b of m.bridge)game.tiles[b.y][b.x]=12;
  game.events.push('coin');
}
export function stepWonderMagic(game,input,dt,clear) {
  const m=game.wonderland;if(!m)return input;
  const p=game.player;
  // Enter every boss arena with normal gravity and controls, including the wall-crystal route.
  if(m.bossType!=null&&!m.arenaEntered&&p.x>=156*32){
    m.arenaEntered=true;m.reverse=0;m.gravity='down';m.gravityTime=0;
    p.vx=0;p.vy=0;
    if(m.scale!==1&&wonderResize(game,1,clear))m.sizeTime=0;
  }
  m.reverse=Math.max(0,m.reverse-dt);m.sizeTime=Math.max(0,m.sizeTime-dt);
  m.gravityTime=Math.max(0,m.gravityTime-dt);
  if(!m.gravityTime)m.gravity='down';
  if(!m.sizeTime&&m.scale!==1&&!wonderResize(game,1,clear)) {
    // Expiration in a narrow passage returns the hero to the clear start, never crushes them.
    p.x=game.start.x*32+5;p.y=game.start.y*32;wonderResize(game,1,clear);p.vx=0;p.vy=0;
  }
  for(const o of m.objects){
    if(o.kind==='swing'){o.previousX=o.x;o.previousY=o.y;o.x=o.baseX+Math.sin(game.time*1.2)*72;o.y=o.baseY+Math.sin(game.time*2.4)*24;o.dx=o.x-o.previousX;o.dy=o.y-o.previousY;continue;}
    if(o.kind==='fading'){if(!wonderOverlap(p,{...o,y:o.y-2,h:o.h+4}))o.active=Math.sin(game.time*1.3)>-.4;continue;}
    if(o.kind==='lowRoof'||o.kind==='bossStep')continue;
    o.cooldown=Math.max(0,(o.cooldown||0)-dt);
    const touching=wonderOverlap(o.kind==='heavy'?{...p,x:p.x-2,w:p.w+4}:p,o);
    if(!touching){o.touching=false;continue;}
    if(o.kind==='heavy'){
      if(m.scale>1&&input.right)o.x=Math.min((game.width-6)*32,o.x+150*dt);
      continue;
    }
    if(o.touching||o.cooldown||o.used)continue;o.touching=true;
    if(o.kind==='shrink'||o.kind==='grow') {
      if(wonderResize(game,o.kind==='shrink' ? .55 : 1.65,clear)){m.sizeTime=12;o.used=true;}
    }else if(o.kind==='reverse'){m.reverse=6;o.used=true;}
    else if(['up','right','down'].includes(o.kind)){m.gravity=o.kind;m.gravityTime=o.kind==='down'?0:o.kind==='right'?8*game.width/64:8;p.vx=0;p.vy=0;o.cooldown=1;}
    else if(o.kind==='portal'){
      const dest=m.objects.find(b=>b!==o&&b.kind==='portal');
      if(dest){p.x=dest.x;p.y=dest.y;p.vx=0;p.vy=0;dest.cooldown=1;dest.touching=true;o.cooldown=1;}
    }else if(o.kind==='switch'){o.used=true;wonderOpen(game);}
    else if(o.kind==='color'){m.color=(m.color+1)%3;if(m.color===1){o.used=true;wonderOpen(game);}}
    else if(['red','yellow','blue'].includes(o.kind)){
      const expected=['red','yellow','blue'][m.sequence];
      if(o.kind===expected){m.sequence++;o.used=true;if(m.sequence===3)wonderOpen(game);}
      else {m.sequence=0;for(const b of m.objects)if(['red','yellow','blue'].includes(b.kind))b.used=false;}
    }
    game.events.push('coin');
  }
  return m.reverse>0?{...input,left:input.right,right:input.left}:input;
}
export function moveWonderGravity(game,input,dt,moveBody) {
  const m=game.wonderland;if(!m||m.gravity==='down')return false;
  const p=game.player,dir=(input.right?1:0)-(input.left?1:0),jump=input.jump&&!game.lastJump;
  game.lastJump=!!input.jump;p.parachute=false;p.fallDistance=0;
  if(m.gravity==='up') {
    p.vx=dir*220;if(dir)p.facing=dir;
    if(jump&&p.grounded)p.vy=530;
    p.vy=Math.max(-600,p.vy-1100*dt);
    const hit=moveBody(game,p,dt,true);p.grounded=hit.ceiling;
  }else {
    // Left/right remain tangent to the surface: up/down along the right-hand wall.
    p.vy=dir*220;if(dir)p.facing=dir;
    if(jump&&p.grounded)p.vx=-530;
    p.vx=Math.min(600,p.vx+1100*dt);
    const hit=moveBody(game,p,dt,true);p.grounded=hit.wall;
  }
  if(p.y<32){p.y=32;p.vy=0;}if(p.y+p.h>18*32){p.y=18*32-p.h;p.vy=0;}
  return true;
}
export function wonderlandStatus(game) {
  const m=game.wonderland;if(!m)return '';
  return [m.reverse>0?`↔ Links en rechts omgewisseld · ${Math.ceil(m.reverse)}s`:'',m.scale!==1?`${m.scale<1?'Klein':'Groot'} · ${Math.ceil(m.sizeTime)}s`:'',m.gravity!=='down'?`Zwaartekracht ${m.gravity==='up'?'↑':'→'} · ${Math.ceil(m.gravityTime)}s`:'',m.locked?`Open het toverpad${m.objects.some(o=>o.kind==='red')?' · rood → geel → blauw · '+m.sequence+'/3':''}`:''].filter(Boolean).join(' · ');
}
export function drawWonderMagic(ctx,game,reducedMotion=false) {
  const m=game?.wonderland;if(!m)return;
  const icons={shrink:'🍄',grow:'🍄',portal:'🌀',reverse:'↔',up:'↑',right:'→',down:'↓',switch:'★',red:'◆',yellow:'◆',blue:'◆',heavy:'♜',color:'◆'};
  const colors={shrink:'#5ee8ff',grow:'#ff80db',red:'#ff5c87',yellow:'#ffe666',blue:'#61ddff',color:'#77ffbd'};
  ctx.save();ctx.font='bold 25px sans-serif';ctx.textAlign='center';
  for(const o of m.objects){
    if(['lowRoof','swing','fading','bossStep'].includes(o.kind)){ctx.globalAlpha=o.kind==='fading'&&!o.active ? .2 : 1;ctx.fillStyle=o.kind==='lowRoof'?'#bd91f5':'#ffb9ec';ctx.fillRect(o.x,o.y,o.w,o.h);ctx.globalAlpha=1;continue;}
    ctx.globalAlpha=o.used ? .32 : 1;ctx.fillStyle=colors[o.kind]||'#c2a2ff';ctx.shadowColor=ctx.fillStyle;ctx.shadowBlur=reducedMotion?0:9;
    const bob=reducedMotion?0:Math.sin(game.time*2+o.x)*3;
    // Let the scenery show through around each symbol, including the heavy chess piece.
    ctx.fillText(icons[o.kind]||'✧',o.x+o.w/2,o.y+25+bob);ctx.shadowBlur=0;
  }
  ctx.globalAlpha=1;ctx.font='bold 12px sans-serif';
  if(m.locked){ctx.fillStyle='#fff3a8';ctx.fillText('Toverpad op slot',m.gateX*32,13*32);}
  ctx.restore();
}

export function drawWonderBackdrop(ctx,game,left,right,height,reducedMotion=false,viewCamera=left,depthLayers=true,depthPanelCache=null) {
  const m=game?.wonderland;if(!m)return;
  const t=reducedMotion?0:game.time;
  drawDepthBackground(ctx,height,`wonder-${m.area}`,{left,right,camera:viewCamera,reducedMotion,layers:depthLayers,panelCache:depthPanelCache});
  ctx.save();
  const camera=reducedMotion?0:viewCamera*.65;
  for(let i=Math.floor((left-camera)/220)-1;i<(right-camera)/220+1;i++){
    const x=i*220+camera,y=100+(i%3)*65+Math.sin(t*.5+i)*9;
    ctx.strokeStyle='#fff0fc55';ctx.lineWidth=3;ctx.beginPath();
    for(let j=0;j<90;j++){const a=j*.18+t*.1,r=j*.65;const xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r;j?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();
    ctx.fillStyle=['#c9a0ff','#fc8cdd','#83ffe0'][Math.abs(i)%3];ctx.beginPath();ctx.ellipse(x,y+140,65,13,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#694dac';ctx.beginPath();ctx.moveTo(x-60,y+142);ctx.lineTo(x+40,y+142);ctx.lineTo(x+5,y+210);ctx.closePath();ctx.fill();
    if(m.area==='sea'||m.area==='crystal'){
      ctx.strokeStyle='#a8ffff99';ctx.lineWidth=9;ctx.setLineDash([7,6]);ctx.lineDashOffset=-t*22;ctx.beginPath();ctx.moveTo(x+18,y+205);ctx.bezierCurveTo(x+40,y+175,x-10,y+155,x+15,y+142);ctx.stroke();ctx.setLineDash([]);
    }
    ctx.save();ctx.translate(x,y+135);if(m.area==='forest')ctx.scale(1,-1);
    for(let tower=0;tower<3;tower++){
      ctx.fillStyle=m.area==='chess'?(tower%2?'#2d204c':'#eee5ff'):['#ffb5e1','#9cceff','#b6ffe8'][tower];
      const xx=(tower-1)*26,hh=tower===1?70:48;ctx.fillRect(xx-9,-hh,18,hh);
      ctx.beginPath();ctx.moveTo(xx-15,-hh);ctx.lineTo(xx,-hh-25);ctx.lineTo(xx+15,-hh);ctx.closePath();ctx.fill();
      ctx.fillStyle='#ffef92';ctx.fillRect(xx-2,-hh+12,4,9);
    }ctx.restore();
  }ctx.restore();
  ctx.save();ctx.font='bold 12px sans-serif';ctx.textAlign='center';
  // Non-colliding scenery belongs behind every solid tile and platform.
  for(let x=7+Math.max(0,Math.ceil((left-40-224)/256))*8;x<game.width-2&&x*32<right+40;x+=8){const xx=x*32,yy=18*32;ctx.fillStyle=m.area==='crystal'?'#5df4ed':m.area==='chess'?'#eadfff':'#ff89da';
    if(m.area==='chess'){ctx.fillText('♜',xx,yy-105);}
    else if(m.area==='crystal'){ctx.beginPath();ctx.moveTo(xx,yy-170);ctx.lineTo(xx+25,yy-100);ctx.lineTo(xx,yy-65);ctx.lineTo(xx-25,yy-100);ctx.closePath();ctx.fill();}
    else{ctx.fillRect(xx-5,yy-108,10,70);ctx.beginPath();ctx.ellipse(xx,yy-110,39,18,0,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#fff2b8';ctx.fillText('✦',xx,yy-112);}
  }ctx.restore();
}
