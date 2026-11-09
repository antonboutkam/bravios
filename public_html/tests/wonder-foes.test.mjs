import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { WONDER_FOES, WONDER_ENCOUNTERS, createWonderFoe, wonderBossPads } from '../wonder-foes.mjs';
import { wonderlandLevel,prepareWonderlandGame } from '../wonderland.mjs';
import { createGame,stepGame,TILE } from '../engine.mjs';
import { createCoopGame,packCoopGame,unpackCoopGame } from '../coop.mjs';
const make=i=>prepareWonderlandGame(createGame(wonderlandLevel(i)),i);
const bossOf=g=>g.enemies.find(e=>e.boss);
function advance(g,seconds){for(let i=0;i<seconds*120;i++)stepGame(g,{});}
function waitFor(g,b,phase){for(let i=0;i<120*12&&b.phase!==phase;i++)stepGame(g,{});assert.equal(b.phase,phase);}
function pad(g,b,index){const target=wonderBossPads(b)[index];Object.assign(g.player,{x:target.x+5,y:18*TILE-g.player.h,vx:0,vy:0});stepGame(g,{});}
function expose(g,b){
 Object.assign(g.player,{x:b.arenaLeft-40,y:18*TILE-g.player.h,vx:0,vy:0,invincible:999});
 if([0,3,5].includes(b.wonderType))waitFor(g,b,'exposed');
 else{
  waitFor(g,b,'puzzle');
  if(b.wonderType===1)pad(g,b,0);
  else if(b.wonderType===2||b.wonderType===7){pad(g,b,0);pad(g,b,1);}
  else if(b.wonderType===4)for(const i of [0,1,0,1])pad(g,b,i);
  else pad(g,b,(b.maxHp-b.hp)%3);
 }
}
function shoot(g,b,kind='fire'){
 g.fireballs.push({kind,x:b.x+8,y:b.y+14,w:8,h:8,vx:0,vy:0,life:1,alive:true});stepGame(g,{});
}

test('alle acht identiteiten, kleuren en trefaantallen komen uit het aangeleverde pakket',()=>{
 const source=JSON.parse(readFileSync(new URL('./fixtures/wonderland/bosses.json',import.meta.url))).bosses;
 assert.deepEqual(WONDER_FOES,source);
 assert.equal(new Set(WONDER_FOES.map(b=>b.primary_color)).size,8);
});
test('ieder veld heeft vier kleine vijanden en precies één grote baas, ook in gewone velden',()=>{
 for(let field=0;field<15;field++){
  const g=make(field),b=bossOf(g),small=g.enemies.filter(e=>!e.boss);
  assert.equal(g.enemies.length,5);assert.equal(small.length,4);assert.equal(g.enemies.filter(e=>e.boss).length,1);
  assert.equal(b.wonderType,WONDER_ENCOUNTERS[field]);assert.equal(b.hp,field===14?7:3);
  assert.ok(b.w>small[0].w*2);assert.ok(b.h>small[0].h*2);
  for(const e of g.enemies){assert.ok(e.x>=0&&e.x+e.w<g.width*TILE);assert.ok(e.y>=TILE&&e.y+e.h<=18*TILE);}
  assert.equal(g.totalCoins,g.tiles.flat().filter(id=>id===4||id===3).length);
 }
});
test('twaalf kleine exemplaren per type hebben unieke vorm/patroon/palet-combinaties',()=>{
 for(let type=0;type<8;type++){
  const foes=Array.from({length:12},(_,i)=>createWonderFoe(type,i,100+i*45));
  assert.equal(new Set(foes.map(e=>JSON.stringify([e.palette_id,e.body_variant,e.face_pattern,e.accessory]))).size,12);
  assert.equal(new Set(foes.map(e=>e.palette_id)).size,3);assert.equal(new Set(foes.map(e=>e.body_variant)).size,2);
 }
});
test('kleine varianten lopen, botsen, springen en zijn met een echte vuurbal te verslaan',()=>{
 for(let type=0;type<8;type++){
  const g=make(0),e=createWonderFoe(type,0,8*TILE);g.enemies=[e];g.player.invincible=999;
  const x=e.x;advance(g,.7);assert.notEqual(e.x,x);
  shoot(g,e);assert.equal(e.alive,false);assert.equal(e.defeated,true);
 }
});
test('grote bazen blokkeren de finish en negeren vuur, ijs en bellen buiten hun zwakke moment',()=>{
 for(let field=0;field<15;field++){
  const g=make(field),b=bossOf(g);g.enemies=[b];g.wonderland.locked=false;
  Object.assign(g.player,{x:g.finish.x*TILE,y:g.finish.y*TILE,invincible:999});stepGame(g,{});assert.equal(g.state,'playing');
  for(const kind of ['fire','ice','bubble'])shoot(g,b,kind);
  assert.equal(b.hp,b.maxHp);assert.equal(b.frozen,0);assert.equal(b.bubbled,false);
 }
});
test('aanvallen beginnen met een vaste waarschuwing, een veilige demonstratie en werken alleen dichtbij',()=>{
 const g=make(0),b=bossOf(g);g.enemies=[b];advance(g,8);assert.equal(b.phase,'sleep');assert.equal(g.hazards.length,0);
 Object.assign(g.player,{x:b.arenaLeft-40,y:18*TILE-g.player.h,invincible:999});stepGame(g,{});assert.equal(b.phase,'warning');
 const target=b.targetX;g.player.x+=80;advance(g,1);assert.equal(b.phase,'warning');assert.equal(b.targetX,target);
 advance(g,.6);assert.equal(b.phase,'attack');assert.equal(g.hazards.length,0);
 for(let i=0;i<120*12&&!g.hazards.some(h=>h.kind==='wonder');i++)stepGame(g,{});assert.ok(g.hazards.some(h=>h.kind==='wonder'));
});
test('alle vijftien bazen zijn via hun eigen puzzel en echte projectielbotsingen te verslaan',()=>{
 for(let field=0;field<15;field++){
  const g=make(field),b=bossOf(g);g.enemies=[b];g.wonderland.locked=false;g.player.invincible=999;
  let rounds=0;
  while(b.alive&&rounds++<8){
   const hp=b.hp;expose(g,b);
   if([4,6].includes(b.wonderType))assert.equal(b.hp,hp-1);
   else{assert.equal(b.phase,'exposed');shoot(g,b);assert.equal(b.hp,hp-1);}
   if(b.alive)advance(g,.8);
  }
  assert.equal(b.alive,false,WONDER_FOES[b.wonderType].name);assert.equal(b.defeated,true);assert.ok(g.wonderland.bossOutcome);
  assert.equal(g.hazards.filter(h=>h.wonderOwner===field).length,0);
  Object.assign(g.player,{x:g.finish.x*TILE,y:g.finish.y*TILE,vx:0,vy:0});stepGame(g,{});assert.equal(g.state,'won');
 }
});
test('de kroon is ook zonder vuur te raken met een echte sprong van boven',()=>{
 const g=make(0),b=bossOf(g);g.enemies=[b];expose(g,b);
 Object.assign(g.player,{x:b.x+b.w/2-10,y:b.y-g.player.h-2,vx:0,vy:100,fire:false});
 advance(g,.08);assert.equal(b.hp,2);assert.ok(g.player.vy<0);
});
test('eerste zeven bazen ontsnappen en keren met dezelfde identiteit terug; finale wordt een konijn',()=>{
 for(let i=0;i<7;i++){
  const first=bossOf(make(i)),second=bossOf(make(i+7));
  assert.equal(first.foeId,second.foeId);assert.equal(first.escape,true);assert.equal(second.escape,false);
 }
 assert.equal(bossOf(make(14)).foeId,'emperor_wobbleflap');
});
test('was- en sterrenplaten werken na elkaar in solo, verlopen veilig en overleven een snapshot',()=>{
 const g=prepareWonderlandGame(createCoopGame(wonderlandLevel(14)),14),b=bossOf(g);g.enemies=[b];
 Object.assign(g.players[1],{x:50,y:500,invincible:999});Object.assign(g.player,{x:b.arenaLeft-40,y:18*TILE-g.player.h,invincible:999});
 waitFor(g,b,'puzzle');pad(g,b,0);assert.equal(b.puzzleProgress,1);
 const restored=unpackCoopGame(packCoopGame(g),0);assert.deepEqual(restored.wonderland,g.wonderland);assert.deepEqual(restored.enemies,g.enemies);
 pad(restored,bossOf(restored),1);assert.equal(bossOf(restored).phase,'exposed');
 g.player.x=b.arenaLeft-40;advance(g,9);assert.equal(b.puzzleProgress,0);
});
test('pauze bevriest baastimers en giftige stroken vertragen zonder directe schade',()=>{
 const g=make(1),b=bossOf(g);g.enemies=[b];Object.assign(g.player,{x:b.arenaLeft-40,y:18*TILE-g.player.h});
 stepGame(g,{});g.state='paused';const phaseTime=b.phaseTime;advance(g,3);assert.equal(b.phaseTime,phaseTime);
 g.state='playing';g.hazards.push({kind:'wonder',wonderType:1,wonderOwner:1,x:g.player.x,y:18*TILE-8,w:64,h:8,vx:0,vy:0,life:2,effect:'slow'});stepGame(g,{});
 assert.equal(g.state,'playing');assert.ok(g.player.wonderSlow>0);
});


test('iedere spring-zwakte is met een sprong vanaf de vloer bereikbaar, zonder vuurkracht',()=>{
 for(const field of [0,1,2,3,5,14]){
  const g=make(field),b=bossOf(g);g.enemies=[b];expose(g,b);const hp=b.hp;
  Object.assign(g.player,{x:b.x-80,y:18*TILE-g.player.h,vx:0,vy:0,grounded:true,fire:false});
  g.lastJump=false;
  for(let frame=0;frame<180&&b.hp===hp;frame++)stepGame(g,{right:g.player.x<b.x+b.w/2-g.player.w/2,jump:true});
  assert.equal(b.hp,hp-1,WONDER_FOES[b.wonderType].name);
 }
});
test('de arena beëindigt tijdelijke zwaartekracht voordat de kristalroute de baas bereikt',()=>{
 const g=make(12);g.player.x=156*TILE;g.player.invincible=999;g.wonderland.gravity='right';g.wonderland.gravityTime=20;g.wonderland.reverse=3;
 stepGame(g,{});assert.equal(g.wonderland.gravity,'down');assert.equal(g.wonderland.reverse,0);assert.equal(g.wonderland.arenaEntered,true);assert.equal(g.state,'playing');
});

test('boter vertraagt het lopen en behoudt de kijkrichting en vuursnelheid',()=>{
 const g=make(1);g.enemies=[];g.player.wonderSlow=2;g.player.fire=true;
 for(let i=0;i<45;i++)stepGame(g,{right:true});
 assert.equal(g.player.facing,1);assert.ok(g.player.vx>0&&g.player.vx<=110);
 stepGame(g,{right:true,fire:true});assert.equal(g.fireballs[0].vx,350);
});
