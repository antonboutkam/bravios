import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, blankLevel, validateLevel, createGame, stepGame, PALETTE_GROUPS } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const make = (id=97) => { const l=blankLevel(40);l.tiles[13][12]=id;return l; };
function stomp(g,e) { Object.assign(g.player,{x:e.x+2,y:e.y-28.5,vy:120,grounded:false,parachute:false});stepGame(g,{}); }
function advance(g,n) { for(let i=0;i<n;i++)stepGame(g,{}); }
test('beide gele helmtorren worden opgeslagen en staan in de vijandengroep',()=>{
 for(const id of [97,98]) { const l=make(id);assert.deepEqual(validateLevel(l),l);assert.equal(createGame(l).enemies[0].tileId,id);assert.ok(PALETTE_GROUPS.find(g=>g.id==='enemies').items.includes(id)); }
});
test('gewone helmtor klapt in, is ongevaarlijk, blijft drie seconden stil en springt dan op',()=>{
 const g=createGame(make()),e=g.enemies[0];stomp(g,e);
 assert.equal(e.phase,'folded');assert.equal(e.h,14);assert.equal(e.vx,0);assert.ok(g.player.vy<0);assert.ok(e.alive);
 Object.assign(g.player,{x:e.x,y:e.y,vy:0});stepGame(g,{});assert.equal(g.state,'playing');
 g.player.x=2*TILE;advance(g,358);assert.equal(e.phase,'folded');const x=e.x;
 advance(g,1);assert.equal(e.phase,'walk');assert.ok(e.vy<0);assert.equal(e.h,26);assert.ok(Math.abs(e.x-x)<2);
 // It can be folded a second time after recovering.
 e.vy=0;stomp(g,e);assert.equal(e.phase,'folded');assert.equal(e.phaseTime,0);
});
test('punthelm verwondt een springende speler en klapt niet in',()=>{
 const g=createGame(make(98)),e=g.enemies[0];g.player.shield=true;stomp(g,e);
 assert.equal(g.player.shield,false);assert.notEqual(e.phase,'folded');assert.ok(e.alive);
});
test('pauze en samenspel bewaren de drie seconden en gevouwen vorm',()=>{
 const g=createCoopGame(make()),e=g.enemies[0];stomp(g,e);g.players.forEach(p=>p.x=2*TILE);
 for(let i=0;i<120;i++)stepCoopGame(g,[{},{}]);assert.ok(Math.abs(e.phaseTime-1)<.02);
 const restored=unpackCoopGame(packCoopGame(g)),r=restored.enemies[0];assert.equal(r.phase,'folded');assert.equal(r.h,14);assert.equal(r.vx,0);
 restored.state='paused';const before=r.phaseTime;for(let i=0;i<120;i++)stepCoopGame(restored,[{},{}]);assert.equal(r.phaseTime,before);
 restored.state='playing';for(let i=0;i<241;i++)stepCoopGame(restored,[{},{}]);assert.equal(r.phase,'walk');
});
test('vuur kan beide helmtorren verslaan',()=>{
 for(const id of [97,98]){const g=createGame(make(id)),e=g.enemies[0];g.fireballs.push({kind:'fire',x:e.x+5,y:e.y+8,w:8,h:8,vx:0,vy:0,life:2,alive:true});stepGame(g,{});assert.equal(e.alive,false);}
});
