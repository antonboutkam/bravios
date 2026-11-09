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
  images.set(path,img);return img;
}
export async function preloadEnemySprites(profiles) {
  await Promise.all([...new Set(profiles.flatMap(c=>Object.values(c.animations).map(a=>a.image)))].map(async path=>{
    const img=imageFor(path);if(!img)return;
    try { await img.decode(); } catch { images.delete(path);throw new Error(`Vijandafbeelding kon niet worden geladen: ${path}`); }
  }));
}
export function drawEnemySprite(ctx,enemy,time=0,{facing=enemy.facing||1,night=false,ghost=false}={}) {
  if(globalThis.braviosExportEnemies)return false;
  const a=enemyAnimation(enemy,night),img=a&&imageFor(a.image);
  if(!img?.complete||!img.naturalWidth)return false;
  const frame=((Math.floor(time*a.fps)%a.frames)+a.frames)%a.frames;
  const [x,y,w,h]=a.bounds,sx=enemy.w/a.bodyWidth,sy=enemy.h/a.bodyHeight;
  ctx.save();ctx.translate(enemy.x+enemy.w/2,enemy.y);ctx.scale(facing<0?-1:1,1);ctx.translate(-enemy.w/2,0);
  if(ghost)ctx.globalAlpha*=.24;
  if(enemy.hitCooldown>0&&enemy.kind==='wonder')ctx.globalAlpha*=.65;
  ctx.drawImage(img,frame*a.frameWidth,0,a.frameWidth,a.frameHeight,x*sx,y*sy,w*sx,h*sy);ctx.restore();
  return true;
}
