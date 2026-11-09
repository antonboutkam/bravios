import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel } from '../engine.mjs';
import { saveEnemyDesign } from '../enemy-design.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const tick = (g, n) => { for(let i=0;i<n;i++) stepGame(g,{}); };
const levelWith = id => { const l=blankLevel(40); l.tiles[id===83?13:7][16]=id; return l; };
test('cloud patrols, drops eggs and eggs hatch on ground into two ants',()=>{
 const g=createGame(levelWith(82));tick(g,250);assert.ok(g.hazards.some(h=>h.kind==='spikeegg'));tick(g,180);
 assert.ok(g.hazards.some(h=>h.kind==='ant'));assert.notEqual(g.enemies[0].x,515);
});
test('ants blink at three seconds and expire at five; pause freezes age',()=>{
 const g=createGame(blankLevel(40));g.hazards=[{kind:'ant',x:500,y:440,w:14,h:8,vx:0,vy:0,life:5,blinking:false}];
 tick(g,359);assert.equal(g.hazards[0].blinking,false);tick(g,1);assert.equal(g.hazards[0].blinking,true);
 g.state='paused';const life=g.hazards[0].life;tick(g,120);assert.equal(g.hazards[0].life,life);g.state='playing';
 tick(g,239);assert.equal(g.hazards.length,1);tick(g,1);assert.equal(g.hazards.length,0);
});
test('ants remain lethal while blinking, even with shield',()=>{
 const g=createGame(blankLevel(40));g.player.shield=true;g.hazards=[{kind:'ant',x:g.player.x,y:g.player.y+20,w:14,h:8,vx:0,vy:0,life:1,blinking:true}];tick(g,1);assert.equal(g.state,'dead');
});
test('centipede length saves and rejects invalid values; standing triggers look then red-head sprint',()=>{
 const l=levelWith(83);saveEnemyDesign(l,16,13,{length:7});assert.equal(validateLevel(l).enemyDesigns[0].design.length,7);
 assert.throws(()=>saveEnemyDesign(l,16,13,{length:11}));assert.throws(()=>saveEnemyDesign(l,16,13,{length:2.5}));
 const g=createGame(l),e=g.enemies[0];assert.equal(e.w,168);tick(g,5);
 Object.assign(g.player,{x:e.x+70,y:e.y-28,vy:0,grounded:true});tick(g,1);assert.equal(e.phase,'look');assert.ok(e.alive);assert.equal(g.player.grounded,true);
 tick(g,100);assert.equal(e.phase,'angry');const offset=g.player.x-e.x;tick(g,30);assert.ok(Math.abs(g.player.x-e.x-offset)<2);assert.equal(g.state,'playing');assert.ok(e.alive);
});
test('chain head follows target and never exceeds its chain, anchor remains solid',()=>{
 const g=createGame(levelWith(84));assert.equal(g.tiles[7][16],84);g.player.rainbow=100;
 const h=g.hazards[0];let min=h.x,max=h.x;
 for(let i=0;i<1000;i++){stepGame(g,{});assert.ok(Math.hypot(h.x+14-h.anchorX,h.y+14-h.anchorY)<=112.00001);min=Math.min(min,h.x);max=Math.max(max,h.x);}
 assert.ok(max-min>20);assert.equal(g.hazards.length,1);
});
test('new parts and live hazards roundtrip through coop; both riders survive and timers advance once',()=>{
 const l=levelWith(83);l.tiles[5][20]=82;l.tiles[13][25]=84;saveEnemyDesign(l,16,13,{length:8});validateLevel(l);
 const g=createCoopGame(l);const e=g.enemies.find(e=>e.kind==='centipede');
 for(const [i,p] of g.players.entries()) Object.assign(p,{x:e.x+30+i*40,y:e.y-28,vy:0,grounded:true});
 for(let i=0;i<160;i++)stepCoopGame(g,[{},{}]);
 assert.ok(g.players.every(p=>!p.respawn && p.grounded));assert.ok(e.alive);
 const copy=unpackCoopGame(packCoopGame(g),0);assert.equal(copy.enemies.find(e=>e.kind==='centipede').w,192);assert.ok(copy.hazards.some(h=>h.kind==='chainhead'));
});
