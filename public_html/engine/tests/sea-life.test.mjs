import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, clone, worldTheme, THEMES } from '../engine.mjs';
import { SEA_ITEMS, isWaterTheme, initSeaEnemy, updateSeaEnemy, seaBodies, blowSeaEnemies } from '../sea-life.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { campaignLevel } from '../levels.mjs';
import { drawWorld, drawTile } from '../art.mjs';
const fixture=(id,theme='underwater')=>{const l=blankLevel(40);l.theme=theme;l.tiles[8][15]=id;return l;};
const simulate=(g,seconds,input={})=>{for(let n=0;n<seconds*120;n++)stepGame(g,input);};
const freeMove=(_g,e,dt)=>{e.x+=e.vx*dt;e.y+=e.vy*dt;return {};};
test('all twelve sea parts import and spawn; night is a real swimming theme',()=>{
 assert.equal(SEA_ITEMS.length,12);
 for(const theme of ['underwater','underwater-night'])for(const {id} of SEA_ITEMS){
  const l=fixture(id,theme);assert.deepEqual(validateLevel(clone(l)),l);const g=createGame(l);
  assert.equal(g.tiles[8][15],0);assert.equal(g.enemies.length+g.dinos.length,1);
 }
 assert.ok(THEMES['underwater-night']);assert.ok(isWaterTheme('underwater-night'));
 const g=createGame(fixture(86,'underwater-night'));const y=g.player.y;simulate(g,.3,{jump:true});assert.ok(g.player.y<y);
 g.player.cat=true;assert.equal(worldTheme(g),'underwater-night');
});
test('whale opens at 15 seconds, fish stay tethered, return and repeat',()=>{
 const g=createGame(fixture(85)),e=g.enemies[0];
 updateSeaEnemy(g,e,14.9,freeMove);assert.equal(e.active,false);assert.equal(seaBodies(e).length,0);
 updateSeaEnemy(g,e,1,freeMove);assert.equal(e.active,true);assert.equal(e.fry.length,4);
 for(const f of e.fry)assert.ok(Math.hypot(f.x-(e.x+e.w-14),f.y+6-(e.y+e.h/2))<=88);
 updateSeaEnemy(g,e,4.2,freeMove);assert.equal(e.fry.length,0);
 updateSeaEnemy(g,e,10.5,freeMove);assert.equal(e.fry.length,4);
});
test('jellyfish rises and falls equal distances and chooses runs of one to five strokes',()=>{
 const g=createGame(fixture(86)),e=g.enemies[0];g.random=()=>.99;
 const y=e.y;for(let i=0;i<239;i++)updateSeaEnemy(g,e,1/120,freeMove);assert.ok(e.y<y-30);assert.equal(e.runLeft,5);
 for(let i=0;i<241;i++)updateSeaEnemy(g,e,1/120,freeMove);assert.ok(Math.abs(e.y-y)<.3);
 e.runLeft=0;g.random=()=>0;updateSeaEnemy(g,e,1/120,freeMove);assert.equal(e.runLeft,1);assert.equal(e.facing,-1);
});
test('bonefish hunts only when neither player looks, otherwise falls harmlessly',()=>{
 const g=createCoopGame(fixture(87)),e=g.enemies[0];
 for(const p of g.players)Object.assign(p,{x:e.x-120,y:e.y,facing:-1});
 updateSeaEnemy(g,e,.1,freeMove);assert.equal(e.phase,'hunting');assert.ok(e.vx<0);assert.ok(e.glowing);
 g.players[1].facing=1;updateSeaEnemy(g,e,.1,freeMove);assert.equal(e.phase,'fallen');assert.equal(e.glowing,false);assert.ok(e.vy>0);assert.deepEqual(seaBodies(e),[]);
});
test('squid inks only nearby players and ink clears after ten seconds',()=>{
 const g=createCoopGame(fixture(88)),e=g.enemies[0];
 Object.assign(g.players[1],{x:e.x+40,y:e.y});updateSeaEnemy(g,e,.01,freeMove);
 assert.equal(g.players[1].inkTime,10);assert.equal(g.players[0].inkTime,0);assert.equal(e.inkCooldown,14);
 g.players[1].x=100;g.players[1].y=100;
 for(let i=0;i<1201;i++)stepCoopGame(g,[{},{}]);
 assert.equal(g.players[1].inkTime,0);
});
test('both mounts float, dolphin is faster and dismount preserves normal swimming',()=>{
 const speeds=[];
 for(const id of [89,90]){
  const g=createGame(fixture(id)),d=g.dinos[0];Object.assign(g.player,{x:d.x,y:d.y-24});
  stepGame(g,{mount:true});assert.equal(g.player.mounted,d);const y=g.player.y;
  simulate(g,.5,{right:true});assert.equal(g.player.y,y);speeds.push(g.player.vx);
  simulate(g,.2,{pipe:true});assert.ok(g.player.y>y);
  stepGame(g,{mount:true});assert.equal(g.player.mounted,null);
 }
 assert.ok(speeds[0]>speeds[1]);assert.ok(speeds[1]>165);
});
test('seahorse fire button blows enemies away without a fire flower',()=>{
 const l=fixture(90);l.tiles[8][18]=86;const g=createGame(l),d=g.dinos[0],e=g.enemies[0];
 Object.assign(g.player,{x:d.x,y:d.y-24});stepGame(g,{mount:true});stepGame(g,{fire:true});
 assert.ok(e.pushTime>0);assert.ok(e.pushVx>0);assert.ok(g.player.blowTime>0);assert.equal(g.fireballs.length,0);
});
test('seaweed collision follows the rolled and unrolled fronds',()=>{
 const g=createGame(fixture(91)),e=g.enemies[0];updateSeaEnemy(g,e,2,freeMove);assert.equal(e.extension,1);assert.equal(seaBodies(e)[0].h,e.h);
 updateSeaEnemy(g,e,4,freeMove);assert.ok(e.extension<.2);assert.equal(seaBodies(e).length,0);
});
test('geyser lifts players and enemies while spouting',()=>{
 const l=fixture(92);l.tiles[6][15]=86;const g=createGame(l),jet=g.enemies.find(e=>e.kind==='geyser'),fish=g.enemies.find(e=>e.kind==='jellyfish');
 jet.age=3.2;jet.active=true;Object.assign(g.player,{x:jet.x,y:jet.y-80});Object.assign(fish,{x:jet.x,y:jet.y-45});
 const py=g.player.y,fy=fish.y;stepGame(g,{});assert.ok(g.player.y<py);assert.ok(fish.y<fy);assert.ok(g.player.vy<0);
});
test('flatfish hides until approached; moray emerges at 25 seconds or on proximity but stays anchored',()=>{
 const g=createGame(fixture(93)),f=g.enemies[0];updateSeaEnemy(g,f,.1,freeMove);assert.equal(f.active,false);assert.deepEqual(seaBodies(f),[]);
 Object.assign(g.player,{x:f.x-30,y:f.y});updateSeaEnemy(g,f,.1,freeMove);assert.ok(f.active);assert.ok(f.vy<0);assert.equal(seaBodies(f).length,1);
 const m=createGame(fixture(94)),e=m.enemies[0],home=e.x;
 updateSeaEnemy(m,e,24.9,freeMove);assert.equal(e.extension,0);updateSeaEnemy(m,e,.2,freeMove);assert.ok(e.extension>0);
 e.age=0;e.extension=0;Object.assign(m.player,{x:e.x-60,y:e.y});updateSeaEnemy(m,e,2,freeMove);assert.equal(e.extension,96);assert.equal(e.x,home);assert.equal(e.facing,-1);
});
test('sea contact hurts; hidden flatfish and fallen bones are harmless',()=>{
 for(const id of [86,95,96]){const g=createGame(fixture(id)),e=g.enemies[0];Object.assign(g.player,{x:e.x,y:e.y,vy:0});stepGame(g,{});assert.equal(g.state,'dead');}
 const g=createGame(fixture(87)),e=g.enemies[0];Object.assign(g.player,{x:e.x-2,y:e.y,facing:1});stepGame(g,{});assert.equal(g.state,'playing');
});
test('pause freezes state, coop advances sea timers once and snapshots preserve mounts and ink',()=>{
 const l=fixture(85);l.tiles[8][8]=89;const g=createCoopGame(l);g.players[1].inkTime=8;g.players[1].mounted=g.dinos[0];
 stepCoopGame(g,[{},{}]);assert.ok(Math.abs(g.enemies[0].age-1/120)<1e-8);
 const copy=unpackCoopGame(packCoopGame(g));assert.equal(copy.players[1].mounted,copy.dinos[0]);assert.ok(copy.players[1].inkTime>7);
 g.state='paused';const before=packCoopGame(g);stepCoopGame(g,[{right:true},{}]);assert.deepEqual(packCoopGame(g),before);
});
test('campaign sea fields showcase the new species and night without land enemies',()=>{
 const ids=new Set();for(const index of [3,7]){const l=campaignLevel(index);validateLevel(l);for(const row of l.tiles)for(const id of row){assert.ok(![6,17,18,20,21,22,23,24,25,27,28,29].includes(id));if(id>=85)ids.add(id);}}
 assert.equal(ids.size,12);assert.equal(campaignLevel(7).theme,'underwater-night');
});
test('all sea organisms render by day and night, in palette and running world without mutating gameplay',()=>{
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>k in t?t[k]:(...args)=>{assert.ok(args.filter(a=>typeof a==='number').every(Number.isFinite),String(k));},set:(t,k,v)=>{t[k]=v;return true;}});
 for(const theme of ['underwater','underwater-night'])for(const {id} of SEA_ITEMS){
  const l=fixture(id,theme),g=createGame(l);const before=clone(g);
  drawTile(ctx,id,0,0,48,theme,{icon:true,time:1});drawWorld(ctx,l,{game:g,time:1});assert.deepEqual(clone(g),before);
 }
});

test('stroming indexeert alleen geisers eenmaal per tick, ook bij wereldwissels en gewijzigde activiteit',async()=>{
 const {seaCurrent}=await import('../sea-life.mjs');let visits=0,moved=0;
 const enemies=Array.from({length:1100},()=>({get kind(){visits++;return 'robot';}}));
 const game={time:0,enemies};const body={x:0,y:100,w:22,h:28,vx:20,vy:0};
 for(let i=0;i<1101;i++)seaCurrent(game,body,1/120,()=>moved++);
 assert.equal(visits,1100);assert.equal(moved,0);
 game.time=1/120;seaCurrent(game,body,1/120,()=>moved++);assert.equal(visits,2200);
 const geyser={kind:'geyser',x:0,y:200,w:32,h:32,alive:true,active:false,frozen:0};game.enemies=[geyser];
 seaCurrent(game,body,1/120,()=>moved++);assert.equal(moved,0);
 geyser.active=true;seaCurrent(game,body,1/120,()=>moved++);assert.equal(moved,1);assert.equal(body.vy,-235);assert.equal(body.vx,20);
 geyser.frozen=1;seaCurrent(game,body,1/120,()=>moved++);assert.equal(moved,1);
 game.enemies=[];seaCurrent(game,body,1/120,()=>moved++);assert.equal(moved,1);
 game.enemies.push({...geyser,frozen:0});seaCurrent(game,body,1/120,()=>moved++);assert.equal(moved,2);
 assert.deepEqual(Object.keys(game).sort(),['enemies','time'],'de index komt niet in de spelstand');
});
