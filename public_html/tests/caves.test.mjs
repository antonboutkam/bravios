import test from 'node:test';import assert from 'node:assert/strict';
import {blankLevel,createGame,stepGame,validateLevel,caveLinks,clone}from'../engine.mjs';
import{createCoopGame,stepCoopGame,packCoopGame,unpackCoopGame}from'../coop.mjs';
import{keyCameraFrame}from'../presentation.mjs';
function setup(locked=false,height=16){const level=blankLevel(72,height),y=height-3;level.tiles[y][20]=locked?63:62;level.tiles[y][7]=64;return{level,game:createGame(level),y};}
function at(g,x,y,p=g.player){Object.assign(p,{x:x*32+5,y:(y+1)*32-p.h,vy:0,vx:0,grounded:true});}
function advance(g,n){for(let i=0;i<n;i++)stepGame(g,{});}
test('grotten en sleutels blijven bewaarbaar; de sleutel opent pas tijdens de camerascene',()=>{
 const{level,game:g,y}=setup(true);assert.deepEqual(validateLevel(level),level);at(g,20,y);stepGame(g,{});assert.equal(g.caveState.active,null);assert.equal(g.tiles[y][20],63);
 at(g,7,y);stepGame(g,{});assert.equal(g.tiles[y][7],0);assert.ok(g.keyReveal);const x=g.player.x,t=g.time;advance(g,60);assert.equal(g.player.x,x);assert.equal(g.time,t);assert.equal(g.tiles[y][20],63);advance(g,72);assert.equal(g.tiles[y][20],62);assert.ok(g.keyReveal?.opened);advance(g,84);assert.equal(g.keyReveal,null);at(g,20,y);stepGame(g,{});assert.equal(g.width,28);assert.ok(g.caveState.active);
});
test('sleutels en sloten koppelen in vaste volgorde en openen alleen de bijbehorende deur',()=>{
 const{level,y}=setup(true);level.tiles[y][40]=63;level.tiles[y][10]=64;assert.deepEqual(caveLinks(level.tiles).map(l=>[l.door.x,l.key.x,l.label]),[[20,7,'G1'],[40,10,'G2']]);const g=createGame(level);at(g,10,y);stepGame(g,{});advance(g,216);assert.equal(g.tiles[y][20],63);assert.equal(g.tiles[y][40],62);
});
test('aparte donkere wereld keert terug naar hetzelfde buitenveld zonder herhaald binnenkomen',()=>{
 const{game:g,y}=setup(false,48);g.tiles[y][30]=0;g.player.shield=true;const before=clone(g.tiles);at(g,20,y);stepGame(g,{});assert.equal(g.width,28);assert.equal(g.tiles.length,16);assert.equal(g.theme,'night');assert.equal(g.sceneLevel.name,'De donkere grot');assert.equal(g.player.shield,true);assert.ok(g.tiles[13][2]===62);assert.notEqual(g.tiles,before);assert.equal(g.finish.x,-100);
 at(g,2,13);stepGame(g,{});assert.equal(g.width,72);assert.equal(g.tiles.length,48);assert.deepEqual(g.tiles,before);assert.equal(g.caveState.active,null);advance(g,120);assert.equal(g.caveState.active,null);assert.equal(g.state,'playing');
});
test('iedere grot heeft een eigen bewaarde binnenwereld zonder opnieuw te verzamelen',()=>{
 const{level,y}=setup();level.tiles[y][40]=62;const g=createGame(level);at(g,20,y);stepGame(g,{});at(g,7,13);stepGame(g,{});assert.equal(g.coins,1);at(g,2,13);stepGame(g,{});at(g,40,y);stepGame(g,{});assert.equal(g.tiles[13][7],4);at(g,2,13);stepGame(g,{});at(g,20,y);stepGame(g,{});assert.equal(g.tiles[13][7],0);assert.equal(g.coins,1);
});
test('pauze bevriest het openen en een losse sleutel is ongevaarlijk',()=>{
 const{game:g,y}=setup(true);at(g,7,y);stepGame(g,{});g.state='paused';advance(g,240);assert.equal(g.keyReveal.elapsed,0);assert.equal(g.tiles[y][20],63);
 const l=blankLevel(40);l.tiles[13][7]=64;const loose=createGame(l);at(loose,7,13);stepGame(loose,{});assert.equal(loose.tiles[13][7],0);assert.equal(loose.keyReveal,null);assert.equal(loose.state,'playing');
});
test('camera gaat naar het slot, houdt daar stil en keert snel terug, ook bij minder beweging',()=>{
 const origin={x:100,y:500},target={x:1900,y:50};assert.deepEqual(keyCameraFrame({elapsed:0},origin,target),origin);assert.deepEqual(keyCameraFrame({elapsed:.4},origin,target),target);assert.deepEqual(keyCameraFrame({elapsed:1.3},origin,target),target);assert.deepEqual(keyCameraFrame({elapsed:1.8},origin,target),origin);assert.ok(keyCameraFrame({elapsed:.2},origin,target).x>100);assert.deepEqual(keyCameraFrame({elapsed:.1},origin,target,true),target);assert.deepEqual(keyCameraFrame({elapsed:1.7},origin,target,true),origin);
});
test('co-op reist samen, houdt krachten en herstelt de juiste respawnplek in beide werelden',()=>{
 const{level,y}=setup(false,32),g=createCoopGame(level);g.players[1].ice=true;at(g,20,y,g.players[1]);stepCoopGame(g,[{},{}]);assert.equal(g.width,28);assert.ok(g.players.every(p=>p.x<200));assert.ok(g.players[1].ice);assert.ok(g.players.every(p=>p.spawn.y===420));
 const restored=unpackCoopGame(packCoopGame(g));assert.equal(restored.caveState.outside.tiles.length,32);assert.equal(restored.sceneLevel.width,28);at(restored,2,13,restored.players[1]);stepCoopGame(restored,[{},{}]);assert.equal(restored.width,72);assert.equal(restored.tiles.length,32);assert.ok(restored.players.every(p=>p.spawn.y>800));assert.ok(restored.players[1].ice);
});
