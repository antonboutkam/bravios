// Shared simulation geometry: rendering and contact use the same bodies.
export const isWaterTheme = theme => theme === 'underwater' || theme === 'underwater-night';
export const SEA_KINDS = {85:'whale',86:'jellyfish',87:'bonefish',88:'squid',91:'seaweed',92:'geyser',93:'flatfish',94:'moray',95:'seastar',96:'crab'};
export const SEA_MOUNTS = {89:'dolphin',90:'seahorse'};
export const SEA_ITEMS = [
 [85,'Walvis','Opent elke 15 seconden zijn bek. Kleine roofvisjes blijven dicht bij hem en bijten als je nadert.'],
 [86,'Kwalletje','Zwemt rustig schuin omhoog en dwarrelt even ver terug omlaag. Kiest na 1–5 slagen een nieuwe richting.'],
 [87,'Skeletvis','Volgt je langzaam met lichtgevende ogen als niemand kijkt. Kijk naar hem: hij valt uit elkaar naar de bodem.'],
 [88,'Inktvis','Spuit bij nadering een kleine inktwolk. Na 10 seconden is de inkt verdwenen.'],
 [89,'Dolfijn','Vriendelijk rijdier. R / ↓ om op of af te stappen. Snel zwemmen zonder te zinken; springen omhoog, S omlaag.'],
 [90,'Zeepaardje','Vriendelijk rijdier. R / ↓ om op of af te stappen. Springen omhoog, S omlaag; F / X blaast vijanden weg.'],
 [91,'Giftige waterplant','Slierten met blaadjes rollen op en uit. De uitgerolde delen zijn giftig.'],
 [92,'Onderwatergeiser','Spuit elke 6 seconden een stroom bellen. Blaast jou en vijanden omhoog.'],
 [93,'Platvis','Verstopt op de bodem met af en toe een open oog. Springt op als je dichtbij komt.'],
 [94,'Murene in kruik','Oogjes in een kruik. Komt elke 25 seconden of bij nadering naar buiten, maar blijft vast in de kruik.'],
 [95,'Boze zeester','Zwemt met lange sliertjes en een boos gezicht.'],
 [96,'Krab','Loopt over de bodem met gevaarlijke scharen.']
].map(([id,name,description])=>({id,name,description,category:[91,92,94].includes(id)?'build':'fun'}));
export const isSeaEnemy = e => Object.values(SEA_KINDS).includes(e.kind);
export const isSeaMount = e => !!e && Object.values(SEA_MOUNTS).includes(e.kind);
export function initSeaEnemy(e) {
 if (!isSeaEnemy(e)) return e;
 const sizes = {whale:[96,48],seaweed:[28,80],geyser:[32,24],moray:[32,32],flatfish:[32,12],crab:[32,20]};
 const [w,h] = sizes[e.kind] || [28,28];
 e.y += e.h-h; e.w=w; e.h=h; e.homeX=e.x; e.homeY=e.y; e.age=0; e.phase='idle'; e.facing=1;
 e.active=false; e.extension=0; e.fry=[]; e.inkCooldown=0; e.stroke=0; e.runLeft=0;
 return e;
}
const seaDistance = (a,b)=>Math.hypot(a.x+a.w/2-b.x-b.w/2,a.y+a.h/2-b.y-b.h/2);
const seaOverlap = (a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function seaBodies(e) {
 if (!e.alive || e.frozen || e.bubbled) return [];
 if (e.kind==='whale') return e.fry || [];
 if (e.kind==='geyser' || e.kind==='squid' || e.kind==='bonefish' && e.phase==='fallen' || e.kind==='flatfish' && !e.active) return [];
 if (e.kind==='seaweed') return e.extension>.2 ? [{x:e.x,y:e.homeY+e.h*(1-e.extension),w:e.w,h:e.h*e.extension}] : [];
 if (e.kind==='moray') return e.extension>4 ? [{x:e.x+(e.facing>0?e.w:-e.extension),y:e.y+4,w:e.extension,h:20}] : [];
 return [e];
}
export function updateSeaEnemy(game,e,dt,move) {
 const players=(game.players||[game.player]).filter(p=>!p.respawn);
 const target=players.reduce((a,p)=>!a||seaDistance(e,p)<seaDistance(e,a)?p:a,null);
 e.age+=dt;
 if (e.pushTime>0) { e.pushTime=Math.max(0,e.pushTime-dt); e.vx=e.pushVx; e.vy=-70; move(game,e,dt); return; }
 const dx=target ? target.x+target.w/2-e.x-e.w/2 : 0, dy=target ? target.y+target.h/2-e.y-e.h/2 : 0;
 const distance=target?Math.hypot(dx,dy):Infinity;
 if (e.kind==='whale') {
  const cycle=e.age%15; e.active=e.age>=15 && cycle<5; e.phase=e.active?'open':'closed';
  // Four fish leave through the mouth, never further than 88px from it.
  e.fry = e.active ? Array.from({length:4},(_,i)=>{
   const travel=Math.min(1,cycle*1.4, (5-cycle)*1.4), near=distance<190;
   const angle=near?Math.atan2(dy,dx)+ (i-1.5)*.3 : Math.sin(e.age*1.2+i)*1.1;
   const radius=(38+i*13)*travel;
   return {x:e.x+e.w-14+Math.cos(angle)*radius,y:e.y+e.h/2+Math.sin(angle)*radius-6,w:16,h:12};
  }) : [];
 } else if (e.kind==='jellyfish') {
  e.stroke+=dt;
  if (e.stroke>=4-1e-8) {e.stroke=Math.max(0,e.stroke-4);e.runLeft--;}
  if (e.runLeft<=0) { e.facing=e.choseDirection ? -e.facing : game.random()<.5?-1:1; e.choseDirection=true; e.runLeft=1+Math.floor(game.random()*5); }
  e.vx=e.facing*12; e.vy=e.stroke<2?-16:16;
  const hit=move(game,e,dt); if(hit.wall)e.facing*=-1;
 } else if (e.kind==='bonefish') {
  const watched=players.some(p=>Math.abs(p.y-e.y)<240 && Math.sign(e.x+e.w/2-p.x-p.w/2)===(game.reversed ? -p.facing : p.facing));
  e.phase=watched?'fallen':'hunting'; e.glowing=!watched;
  if(watched){e.vx=0;e.vy=Math.min(130,e.vy+230*dt);} else {const n=Math.max(1,distance);e.vx=dx/n*24;e.vy=dy/n*24;e.facing=dx<0?-1:1;}
  move(game,e,dt);
 } else if(e.kind==='squid') {
  e.inkCooldown=Math.max(0,e.inkCooldown-dt); e.vx=Math.sin(e.age*.7)*8;e.vy=Math.cos(e.age)*10;move(game,e,dt);
  if(distance<110&&e.inkCooldown===0){
   for(const p of players)if(seaDistance(e,p)<110) {p.inkTime=10; p.inkX=p.x+p.w/2;p.inkY=p.y+p.h/2;}
   e.inkCooldown=14;game.events.push('ink');
  }
 } else if(e.kind==='seaweed') {
  e.extension=.1+.9*(.5+.5*Math.sin(e.age*Math.PI/4));
 } else if(e.kind==='geyser') {
  e.active=e.age%6>=3; e.phase=e.active?'spouting':'idle';
 } else if(e.kind==='flatfish') {
  if(!e.active && distance<100){e.active=true;e.phaseTime=0;e.vy=-180;}
  if(e.active){e.phaseTime+=dt;e.vx=0;e.vy+=220*dt;move(game,e,dt);if(e.y>=e.homeY&&e.phaseTime>.5){e.y=e.homeY;e.active=false;e.vy=0;}}
 } else if(e.kind==='moray') {
  const cycle=e.age%25;
  e.active=distance<145||e.age>=25&&cycle<3;
  if(e.extension<4&&target)e.facing=dx<0?-1:1;
  e.extension=Math.max(0,Math.min(96,e.extension+(e.active?110:-85)*dt));
 } else if(e.kind==='seastar') {
  e.vx=e.facing*23;e.vy=Math.cos(e.age*1.2)*18;
  const hit=move(game,e,dt);if(hit.wall||Math.abs(e.x-e.homeX)>110)e.facing*=-1;
 } else if(e.kind==='crab') {
  e.vx=e.facing*28;e.vy=Math.min(170,e.vy+400*dt);
  const hit=move(game,e,dt);if(hit.wall)e.facing*=-1;
 }
 e.x=Math.max(0,Math.min(game.width*32-e.w,e.x));e.y=Math.max(0,Math.min(game.tiles.length*32-e.h,e.y));
}
// Derived per-world index; never serialized into levels or co-op snapshots.
const seaCurrentSources = new WeakMap();
export function seaCurrent(game,body,dt,move) {
 let sources=seaCurrentSources.get(game);
 if(!sources||sources.time!==game.time||sources.enemies!==game.enemies||sources.length!==game.enemies.length){
  sources={time:game.time,enemies:game.enemies,length:game.enemies.length,geysers:game.enemies.filter(e=>e.kind==='geyser')};
  seaCurrentSources.set(game,sources);
 }
 for(const e of sources.geysers)if(e.alive&&e.kind==='geyser'&&e.active&&!e.frozen){
  const plume={x:e.x-6,y:e.y-160,w:e.w+12,h:160};
  if(seaOverlap(body,plume)) {body.vy=-235;const vx=body.vx;body.vx=0;move(game,body,dt);body.vx=vx;}
 }
}
export function blowSeaEnemies(game,p) {
 p.blowTime=.45;p.fireCooldown=.8;
 for(const e of game.enemies)if(e.alive&&!['geyser','seaweed','moray','whale'].includes(e.kind)&&seaDistance(p,e)<145&&(e.x-p.x)*p.facing>-16){
  e.pushTime=1.2;e.pushVx=p.facing*220;e.vx=e.pushVx;e.vy=-100;e.safe=1.2;
 }
 game.events.push('bubbleshoot');
}
