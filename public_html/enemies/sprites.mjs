import { enemyProfile } from './runtime.mjs';
const images = new Map();
export function enemyAnimation(enemy, night=false) {
  const c=enemyProfile(enemy);if(!c)return null;
  let state=enemy.defeated?'defeated':enemy.bubbled?'idle':enemy.phase;
  if(enemy.kind==='robot' && enemy.phase==='charge')state=`charge-${Math.round(Math.min(1,enemy.phaseTime/5)*10)}`;
  if(enemy.kind==='bomb' && enemy.fuse>0)state='lit';
  if(enemy.kind==='plant')state=enemy.biteHead?'bite':'idle';
  if(enemy.kind==='wonder'&&!enemy.boss)state=`palette-${enemy.palette_id||0}`;
  if(['whale','flatfish','moray','geyser'].includes(enemy.kind))state=enemy.active?'active':'idle';
  if(enemy.kind==='bonefish')state=enemy.phase==='fallen'?'fallen':'idle';
  return (night?c.animations[`${state||'idle'}-night`]:null) || c.animations[state] || (night?c.animations['idle-night']:null) || c.animations.idle;
}
function imageFor(path) {
  if(images.has(path))return images.get(path);
  if(typeof Image==='undefined')return null;
  const img=new Image();img.src=globalThis.braviosAssets?.[path]||new URL('../'+path,import.meta.url).href;
  images.set(path,img);
  if(images.size>48)images.delete(images.keys().next().value);
  return img;
}
export function drawEnemySprite(ctx,enemy,time=0,{facing=enemy.facing||1,night=false,ghost=false}={}) {
  if(globalThis.braviosExportEnemies)return false;
  const a=enemyAnimation(enemy,night),img=a&&imageFor(a.image);
  if(!img?.complete||!img.naturalWidth)return false;
  let frame=((Math.floor(time*a.fps)%a.frames)+a.frames)%a.frames;
  if(enemy.kind==='seaweed')frame=Math.round(Math.max(0,Math.min(1,((enemy.extension ?? .8)-.1)/.9))*(a.frames-1));
  if(enemy.kind==='moray')frame=Math.round(Math.max(0,Math.min(1,(enemy.extension||0)/96))*(a.frames-1));
  const [x,y,w,h]=a.bounds,sx=enemy.w/a.bodyWidth,sy=enemy.h/a.bodyHeight;
  ctx.save();ctx.translate(enemy.x+enemy.w/2,enemy.y);ctx.scale(facing<0&&!['whale','seaweed','geyser','wonder'].includes(enemy.kind)?-1:1,1);ctx.translate(-enemy.w/2,0);
  if(ghost)ctx.globalAlpha*=.24;
  if(enemy.hitCooldown>0&&enemy.kind==='wonder')ctx.globalAlpha*=.65;
  ctx.drawImage(img,frame*a.frameWidth,0,a.frameWidth,a.frameHeight,x*sx,y*sy,w*sx,h*sy);ctx.restore();
  return true;
}
