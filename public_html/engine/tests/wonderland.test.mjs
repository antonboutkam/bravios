import test from 'node:test';
import assert from 'node:assert/strict';
import { WONDERLAND_FIELDS, wonderlandState, wonderlandUnlocked, completeWonderland, wonderlandNodes, wonderlandEdges, wonderlandRoute, wonderlandLevel, prepareWonderlandGame } from '../wonderland.mjs';
import { createGame, stepGame, validateLevel, TILE } from '../engine.mjs';
import { createCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const make=i=>prepareWonderlandGame(createGame(wonderlandLevel(i)),i);
const advance=(g,n,input={})=>{for(let i=0;i<120*n;i++)stepGame(g,input);};
function touch(g,kind){const o=g.wonderland.objects.find(o=>o.kind===kind);Object.assign(g.player,{x:o.x,y:o.y,vx:0,vy:0});stepGame(g,{});return o;}

test('Wonderland bewaart onafhankelijke vertakkingen en weigert losgeraakte voortgang',()=>{
 const s=wonderlandState();assert.equal(completeWonderland(s,14),false);
 completeWonderland(s,0);assert.ok(wonderlandUnlocked(s,1));assert.ok(wonderlandUnlocked(s,2));
 for(const i of [1,3,4,6,7,8,9,11,13,14]){assert.ok(wonderlandRoute(s,0,i));completeWonderland(s,i);}
 assert.ok(wonderlandUnlocked(s,10));completeWonderland(s,10);completeWonderland(s,10);assert.equal(s.stars,1);
 assert.deepEqual(wonderlandState(JSON.parse(JSON.stringify(s))),s);
 assert.deepEqual(wonderlandState({completed:[14,11,7],position:14}),wonderlandState());
 assert.deepEqual(wonderlandState(null),wonderlandState());
});
test('bewegend kasteel en nieuwe verbindingen houden alle geopende plekken bereikbaar, ook terug van geheim eiland',()=>{
 const s=wonderlandState(),start=wonderlandNodes(s)[7];
 for(let i=0;i<WONDERLAND_FIELDS.length;i++){
  completeWonderland(s,i);
  for(let j=0;j<WONDERLAND_FIELDS.length;j++)if(wonderlandUnlocked(s,j)){assert.ok(wonderlandRoute(s,s.position,j));assert.ok(wonderlandRoute(s,j,0));}
 }
 assert.notEqual(wonderlandNodes(s)[7].x,start.x);
 assert.ok(wonderlandEdges(s).some(e=>e.kind==='whirlpool'));assert.ok(wonderlandEdges(s).some(e=>e.kind==='swing'));
});
test('alle Wonderlandvelden zijn geldige, verschillende levels met een veilige vloer',()=>{
 assert.equal(WONDERLAND_FIELDS.length,15);assert.equal(WONDERLAND_FIELDS.filter(f=>f.castle).length,3);
 const shapes=new Set();for(let i=0;i<15;i++){const l=wonderlandLevel(i);assert.equal(l.width,192);assert.equal(l.height,20);assert.deepEqual(validateLevel(l),l);shapes.add(JSON.stringify(l.tiles));const g=make(i);assert.ok(g.finish);assert.ok(g.tiles[18].every(Boolean));if(WONDERLAND_FIELDS[i].castle)assert.ok(g.enemies.some(e=>e.boss));}
 assert.ok(shapes.size>=8);assert.throws(()=>wonderlandLevel(15));
});
test('omgekeerde besturing duurt zes spel-seconden en pauzeren bevriest het effect',()=>{
 const g=make(4);g.enemies=[];touch(g,'reverse');const x=g.player.x;advance(g,.2,{right:true});assert.ok(g.player.x<x);
 g.state='paused';const remaining=g.wonderland.reverse;advance(g,2);assert.equal(g.wonderland.reverse,remaining);
 g.state='playing';advance(g,6);assert.equal(g.wonderland.reverse,0);const p=g.player.x;advance(g,.3,{right:true});assert.ok(g.player.x>p);
});
test('krimpen en groeien veranderen de botsingsmaat; aflopen onder een laag plafond sluit niemand op',()=>{
 const g=make(1);touch(g,'shrink');assert.equal(g.player.h,28*.55);
 Object.assign(g.player,{x:54*TILE,y:18*TILE-g.player.h,vx:0,vy:0});g.wonderland.sizeTime=.01;advance(g,.1);assert.equal(g.wonderland.scale,1);assert.equal(g.player.w,22);assert.ok(g.player.x<10*TILE);
 const large=make(2);touch(large,'grow');assert.equal(large.player.w,22*1.65);advance(large,13);assert.equal(large.player.h,28);
});
test('portalen nemen de speler mee en springen niet direct heen en weer',()=>{
 const g=make(3);g.enemies=[];const o=touch(g,'portal');assert.ok(g.player.x>30*TILE);advance(g,.5);assert.ok(g.player.x>30*TILE);assert.ok(o.cooldown>0);
});
test('kristallen laten de speler langs plafond en wand lopen en terugkeren naar gewone zwaartekracht',()=>{
 const up=make(6);up.enemies=[];touch(up,'up');advance(up,2);assert.ok(up.player.y<100);assert.equal(up.player.grounded,true);
 const x=up.player.x;advance(up,.2,{right:true});assert.ok(up.player.x>x);advance(up,.1,{jump:true});assert.ok(up.player.vy>0);
 advance(up,9);assert.equal(up.wonderland.gravity,'down');assert.ok(up.player.y>100);
 const side=make(12);side.enemies=[];side.wonderland.bossType=null;side.wonderland.locked=true;touch(side,'right');advance(side,12);assert.equal(side.player.grounded,true);const y=side.player.y;advance(side,.2,{left:true});assert.ok(side.player.y<y);advance(side,.1,{jump:true});assert.ok(side.player.vx<0);
});
test('kristalvolgorde, kleur en schakelaar veranderen echte doorgangen en blokkeren de finish tot oplossen',()=>{
 const g=make(11);g.enemies=[];touch(g,'blue');assert.equal(g.wonderland.sequence,0);assert.ok(g.wonderland.locked);
 Object.assign(g.player,{x:g.finish.x*TILE,y:g.finish.y*TILE});stepGame(g,{});assert.equal(g.state,'playing');
 for(const kind of ['red','yellow','blue'])touch(g,kind);
 assert.equal(g.wonderland.locked,false);assert.equal(g.tiles[17][g.wonderland.gateX],0);assert.equal(g.tiles[14][105],12);
 Object.assign(g.player,{x:g.finish.x*TILE,y:g.finish.y*TILE});stepGame(g,{});assert.equal(g.state,'won');
 for(const [i,kind] of [[5,'switch'],[13,'color']]){const other=make(i);touch(other,kind);assert.equal(other.wonderland.locked,false);assert.equal(other.tiles[17][other.wonderland.gateX],0);}
});
test('de eindbaas bewaakt het kristalkasteel; tijdelijke toestand overleeft een gedeelde snapshot',()=>{
 const g=make(14);for(const kind of ['red','yellow','blue'])touch(g,kind);
 Object.assign(g.player,{x:g.finish.x*TILE,y:g.finish.y*TILE});stepGame(g,{});assert.equal(g.state,'playing');
 const boss=g.enemies.find(e=>e.boss);assert.equal(boss.hp,7);assert.equal(boss.foeId,'emperor_wobbleflap');
 const coop=prepareWonderlandGame(createCoopGame(wonderlandLevel(4)),4);touch(coop,'reverse');const restored=unpackCoopGame(packCoopGame(coop));assert.deepEqual(restored.wonderland,coop.wonderland);assert.equal(restored.player.w,22);
});


test('alle vijftien routes zijn speelbaar met de echte toverobjecten en botsingen',()=>{
 for(let i=0;i<WONDERLAND_FIELDS.length;i++){
  const g=make(i);g.enemies=[]; // Combat is tested separately; retain all puzzle objects and geometry.
  for(let frame=0;frame<120*120&&g.state==='playing';frame++){
   const reverse=g.wonderland.reverse>0,forward=g.player.x<g.finish.x*TILE+8;
   stepGame(g,{right:forward!==reverse,left:forward===reverse,jump:([0,8,10].includes(i)||i===2&&g.player.x>63*TILE)&&frame%90<50});
  }
  assert.equal(g.state,'won',WONDERLAND_FIELDS[i].name);
 }
});

test('alleen klein past door de tunnel, groot kan de steen verplaatsen en zwevende platforms dragen de speler',()=>{
 const g=make(1);g.wonderland.objects.find(o=>o.kind==='shrink').used=true;
 Object.assign(g.player,{x:50*TILE,y:18*TILE-g.player.h});advance(g,1,{right:true});assert.ok(g.player.x+g.player.w<=51*TILE);
 g.wonderland.objects.find(o=>o.kind==='shrink').used=false;touch(g,'shrink');
 Object.assign(g.player,{x:50*TILE,y:18*TILE-g.player.h});advance(g,1,{right:true});assert.ok(g.player.x>51*TILE);
 const big=make(2),stone=big.wonderland.objects.find(o=>o.kind==='heavy'),x=stone.x;
 Object.assign(big.player,{x:stone.x-big.player.w,y:18*TILE-big.player.h});advance(big,.2,{right:true});assert.equal(stone.x,x);
 touch(big,'grow');Object.assign(big.player,{x:stone.x-big.player.w,y:18*TILE-big.player.h});advance(big,.2,{right:true});assert.ok(stone.x>x);
 const ride=make(0),platform=ride.wonderland.objects.find(o=>o.kind==='swing');Object.assign(ride.player,{x:platform.x+20,y:platform.y-ride.player.h,grounded:true});
 const before=ride.player.x;advance(ride,.1);assert.ok(ride.player.x>before);assert.ok(Math.abs(ride.player.y+ride.player.h-platform.y)<1);
});
