import {structureProfile,structureSetting,structureIs,structureCollision} from './structures/runtime.mjs';
import {drawStructureSprite} from './structures/sprites.mjs';
// A fixed anchor and simulation time define the entire obstacle, including in co-op.
export const FIREBAR_TILE = 101;
export const FIREBAR_PERIOD=structureSetting('firebar','periodSeconds',6);
export const FIREBAR_REACH=structureSetting('firebar','flames',4)*structureSetting('firebar','spacing',16)+structureSetting('firebar','radius',9);
export function createFirebars(level) {
  const firebars=[];
  level.tiles.forEach((row,y)=>row.forEach((id,x)=>{
    if(structureIs(id,'firebar'))firebars.push({tileId:id,x:x*32+16,y:y*32+16,direction:(x+y)%2?1:-1,phase:(x%4)*Math.PI/2});
  }));
  return {firebars};
}
export function firebarFlames(bar,time=0) {
  const angle=bar.phase+bar.direction*time*Math.PI*2/structureSetting(bar.tileId||'firebar','periodSeconds',FIREBAR_PERIOD);
  return Array.from({length:structureSetting(bar.tileId||'firebar','flames',4)},(_,i)=>({x:bar.x+Math.cos(angle)*(i+1)*structureSetting(bar.tileId||'firebar','spacing',16),y:bar.y+Math.sin(angle)*(i+1)*structureSetting(bar.tileId||'firebar','spacing',16),r:structureSetting(bar.tileId||'firebar','radius',9)}));
}
export function firebarReach(bar){const id=bar.tileId||'firebar';return structureSetting(id,'flames',4)*structureSetting(id,'spacing',16)+structureSetting(id,'radius',9);}
export function firebarHits(bar,time,body) {
  if(!structureCollision(bar.tileId||'firebar')?.damage)return false;
  const reach=firebarReach(bar);
  if(body.x>bar.x+reach||body.x+body.w<bar.x-reach||body.y>bar.y+reach||body.y+body.h<bar.y-reach)return false;
  return firebarFlames(bar,time).some(f=>{
    const x=Math.max(body.x,Math.min(f.x,body.x+body.w)),y=Math.max(body.y,Math.min(f.y,body.y+body.h));
    return (f.x-x)**2+(f.y-y)**2<f.r*f.r;
  });
}
export function drawFirebar(ctx,bar,time=0,{guide=false,reducedMotion=false}={}) {
  ctx.save();
  if(guide){ctx.strokeStyle='#ffcf7755';ctx.lineWidth=1;ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(bar.x,bar.y,firebarReach(bar),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  const profile=structureProfile(bar.tileId||'firebar');
  const anchor=drawStructureSprite(ctx,profile,bar.x-16,bar.y-16,32,32,{state:'anchor'});
  if(!anchor){
  ctx.fillStyle='#3a3442';ctx.strokeStyle='#b9a18c';ctx.lineWidth=2;
  ctx.beginPath();ctx.roundRect(bar.x-11,bar.y-11,22,22,4);ctx.fill();ctx.stroke();
  for(const dx of [-7,7])for(const dy of [-7,7]){ctx.fillStyle='#dac6a0';ctx.beginPath();ctx.arc(bar.x+dx,bar.y+dy,1.3,0,Math.PI*2);ctx.fill();}
  }
  const flames=firebarFlames(bar,time);
  ctx.strokeStyle='#a95e3d';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(bar.x,bar.y);ctx.lineTo(flames.at(-1).x,flames.at(-1).y);ctx.stroke();
  for(const [i,f] of flames.entries()){
    // The solid orange disc is exactly the collision radius; only the halo flickers.
    const size=32*f.r/9;
    if(drawStructureSprite(ctx,profile,f.x-size/2,f.y-size/2,size,size,{state:'flame',time}))continue;
    const glow=reducedMotion?12:12+Math.sin(time*12+i)*1.5;
    ctx.fillStyle='#ff9c3228';ctx.beginPath();ctx.arc(f.x,f.y,glow,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e85328';ctx.strokeStyle='#ffad43';ctx.lineWidth=1;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.fillStyle='#ffd565';ctx.beginPath();ctx.ellipse(f.x-1,f.y-1,5,6,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#fff3c3';ctx.beginPath();ctx.ellipse(f.x-2,f.y-2,2.5,3.5,0,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#ffcf78';ctx.beginPath();ctx.arc(bar.x,bar.y,4,0,Math.PI*2);ctx.fill();ctx.restore();
}
