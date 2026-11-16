import { assertPlayable3D } from './level.mjs';
import { assert3DCharacter } from './access.mjs';
import { createPhysics3D } from './physics.mjs';
export { initializePhysics3D } from './physics.mjs';
const physics=new WeakMap();
export function disposeGame3D(game){physics.get(game)?.dispose();physics.delete(game);}
export const BODY_3D = { radius:.27, height:1.55, speed:5, jump:9, gravity:22 };
const solid = level => level.objects.filter(o=>o.type==='block');
const overlap = (p,b) => p.x+BODY_3D.radius>b.x+1e-7 && p.x-BODY_3D.radius<b.x+b.w-1e-7 && p.z+BODY_3D.radius>b.z+1e-7 && p.z-BODY_3D.radius<b.z+b.d-1e-7 && p.y+BODY_3D.height>b.y+1e-7 && p.y<b.y+b.h-1e-7;
export function createGame3D(raw,identity) {
  assert3DCharacter(identity);
  const level=assertPlayable3D(raw), start=level.objects.find(o=>o.type==='start');
  const game={level,character:identity.character,state:'playing',time:0,coins:0,deaths:0,jumpHeld:false,
    player:{x:start.x+.5,y:start.y,z:start.z+.5,vy:0,grounded:false,angle:Math.PI/2,moving:false},
    collected:[], enemies:level.objects.filter(o=>o.type==='enemy').map(o=>({...o,x:o.x+.5,z:o.z+.5,originX:o.x+.5,direction:1,alive:true})),
    message:''};
  physics.set(game,createPhysics3D(level,game.player,BODY_3D));
  return game;
}
export function stepGame3D(game,input={},elapsed=1/60) {
  if(game.state!=='playing')return;
  // Bounded substeps prevent tunnelling after a slow frame; a hidden tab is paused by the shell.
  const total=Math.max(0,Math.min(.1,Number.isFinite(elapsed)?elapsed:0));
  const steps=Math.max(1,Math.ceil(total/(1/120))),dt=total/steps;
  let jump=!!input.jump&&!game.jumpHeld;game.jumpHeld=!!input.jump;
  for(let tick=0;tick<steps&&game.state==='playing';tick++){
    const p=game.player,blocks=solid(game.level);game.time+=dt;
    let dx=Number(input.x)||0,dz=Number(input.z)||0;
    const length=Math.hypot(dx,dz);if(length>1){dx/=length;dz/=length;}
    p.moving=length>.05;if(p.moving)p.angle=Math.atan2(dx,dz);
    const previousY=p.y;physics.get(game).move(p,dx,dz,jump,dt);jump=false;
    for(const o of game.level.objects){
      if(o.type==='lava'&&overlap(p,o)){game.state='dead';game.message='Dat was heet! Probeer het nog eens.';}
      if(o.type==='coin'&&!game.collected.includes(o.id)&&Math.hypot(p.x-o.x-.5,p.y+.7-o.y-.65,p.z-o.z-.5)<.85){game.collected.push(o.id);game.coins++;}
      if(o.type==='finish'&&Math.hypot(p.x-o.x-.5,p.z-o.z-.5)<.7&&Math.abs(p.y-o.y)<1){game.state='won';game.message='Veld gehaald! Je route gaat verder op de wereldkaart.';}
    }
    for(const e of game.enemies){
      if(!e.alive)continue;
      const nextX=e.x+e.direction*.85*dt;
      const supported=blocks.some(b=>nextX+e.direction*.35>=b.x&&nextX+e.direction*.35<=b.x+b.w&&e.z>=b.z&&e.z<=b.z+b.d&&Math.abs(e.y-b.y-b.h)<.05);
      const obstructed=blocks.some(b=>nextX+.3>b.x&&nextX-.3<b.x+b.w&&e.z+.3>b.z&&e.z-.3<b.z+b.d&&e.y+.8>b.y&&e.y<b.y+b.h-.01);
      if(Math.abs(nextX-e.originX)>2||!supported||obstructed)e.direction*=-1;else e.x=nextX;
      if(Math.hypot(p.x-e.x,p.z-e.z)<.6&&p.y<e.y+.85&&p.y+BODY_3D.height>e.y){
        if(p.vy<0&&previousY>=e.y+.65){e.alive=false;p.vy=7;}else{game.state='dead';game.message='Raak de vijand van boven. Nog een poging?';}
      }
    }
    if(p.y < -6){game.state='dead';game.message='Je viel van het eiland. Probeer het nog eens.';}
  }
}
