import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, blankLevel, validateLevel, createGame, stepGame, clone, nearbyShell } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
function advance(game, frames, input = {}) { for (let i=0;i<frames;i++) stepGame(game,input); }
function setup(id = 6) {
  const level=blankLevel(40);level.tiles[13][2]=42;level.tiles[13][3]=10;
  if(id)level.tiles[13][8]=id;
  const game=createGame(level);Object.assign(game.player,{x:2*TILE+5});advance(game,24);return game;
}
function capture(game,enemy=game.enemies[0]) {
  game.fireballs.push({kind:'bubble',x:enemy.x+4,y:enemy.y+4,w:16,h:16,vx:0,vy:0,life:1,alive:true});stepGame(game,{});assert.equal(enemy.bubbled,true);return enemy;
}
test('Bubblegun is een bewaarbare beloning en wisselt met vuur- en ijskracht',()=>{
  const level=blankLevel(40);level.tiles[13][4]=42;assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))),level);
  const game=setup(0),p=game.player;assert.equal(p.bubblegun,true);assert.equal(p.fire,false);assert.equal(p.ice,false);
  for(const id of [15,42,19,42]) {game.tiles[13][2]=id;stepGame(game,{});assert.equal(p.bubblegun,id===42);assert.equal(p.fire,id===15);assert.equal(p.ice,id===19);}
  assert.equal(createGame(level).player.bubblegun,false);
});
test('echte bellen schieten beide kanten op, vangen een vijand en verdwijnen na botsing of levensduur',()=>{
  const game=setup();stepGame(game,{fire:true});assert.equal(game.fireballs[0].kind,'bubble');assert.ok(game.fireballs[0].vx>0);
  advance(game,90);assert.equal(game.enemies[0].bubbled,true);
  game.player.facing=-1;game.player.fireCooldown=0;stepGame(game,{fire:true});assert.ok(game.fireballs.some(b=>b.vx<0));
  advance(game,220);assert.equal(game.fireballs.length,0);
  const blocked=setup(0);blocked.tiles[13][4]=1;stepGame(blocked,{fire:true});advance(blocked,50);assert.equal(blocked.fireballs.length,0);assert.equal(blocked.tiles[13][4],1);
  const empty=createGame(blankLevel(40));stepGame(empty,{fire:true});assert.equal(empty.fireballs.length,0);
});
test('alle vijandsoorten worden ongevaarlijk gevangen, zweven omhoog door terrein en verdwijnen boven het beeld',()=>{
  for(const id of [6,17,18,20,21,22,23,24,25,27,28,29]){
    const game=setup(id);game.bubbleViewTop=100;const enemy=capture(game),startY=enemy.y;
    for(let x=0;x<40;x++)game.tiles[10][x]=1;
    Object.assign(game.player,{x:enemy.x,y:enemy.y});stepGame(game,{});assert.equal(game.state,'playing',`contact met ${id}`);
    game.player.x=64;const phase=enemy.phaseTime;advance(game,120);assert.ok(enemy.y<startY-100,id);assert.equal(enemy.phaseTime,phase);assert.equal(enemy.fuse,0);assert.equal(enemy.tongueLength,0);
    advance(game,500);assert.equal(enemy.alive,false,id);
  }
});
test('vangst in een hoog veld eindigt boven de camera in plaats van pas boven het hele level',()=>{
  const level=blankLevel(40,64);level.tiles[61][3]=10;level.tiles[61][2]=42;level.tiles[61][8]=29;
  const game=createGame(level);advance(game,24);game.bubbleViewTop=1600;const enemy=capture(game);
  advance(game,480);assert.equal(enemy.alive,false);assert.ok(enemy.y>1000);
});
test('gevangen schildpadden zijn geen helm en andere projectielen veranderen een gevangen vijand niet',()=>{
  const game=setup(22),enemy=game.enemies[0];Object.assign(enemy,{phase:'shell',vx:0});capture(game);
  Object.assign(game.player,{x:enemy.x-30,y:enemy.y});assert.equal(nearbyShell(game),null);
  game.fireballs.push({kind:'ice',x:enemy.x,y:enemy.y,w:8,h:8,vx:0,vy:0,life:1,alive:true});stepGame(game,{});assert.equal(enemy.frozen,0);assert.equal(enemy.bubbled,true);
});
test('pauze bevriest bellen en vangst; herstart en een vijandaanraking verwijderen de bubblegun',()=>{
  const game=setup();capture(game);stepGame(game,{fire:true});game.state='paused';const before=clone(game);advance(game,120);assert.deepEqual(clone(game),before);
  game.state='playing';game.hazards.push({kind:'hammer',x:game.player.x,y:game.player.y,w:10,h:10,vx:0,vy:0,life:1});stepGame(game,{});assert.equal(game.player.bubblegun,false);assert.equal(game.state,'playing');
  assert.equal(createGame(blankLevel()).player.bubblegun,false);
});
test('de tweede speler kan schieten en snapshots bewaren vangst en projectielen; zweven wordt eenmaal per stap bijgewerkt',()=>{
  const level=blankLevel(40);level.tiles[13][3]=42;level.tiles[13][8]=6;const game=createCoopGame(level);
  for(let i=0;i<24;i++)stepCoopGame(game,[{},{}]);assert.equal(game.players[0].bubblegun,false);assert.equal(game.players[1].bubblegun,true);
  stepCoopGame(game,[{},{fire:true}]);assert.equal(game.fireballs[0].kind,'bubble');
  const shotSnapshot=unpackCoopGame(packCoopGame(game));assert.equal(shotSnapshot.players[1].bubblegun,true);assert.equal(shotSnapshot.fireballs[0].kind,'bubble');assert.deepEqual(shotSnapshot.fireballs,game.fireballs);
  for(let i=0;i<60;i++)stepCoopGame(game,[{},{}]);assert.equal(game.enemies[0].bubbled,true);
  const enemy=game.enemies[0],y=enemy.y,vy=enemy.vy;stepCoopGame(game,[{},{}]);assert.ok(Math.abs(enemy.y-y-(vy-35/120)/120)<.001);
  const restored=unpackCoopGame(packCoopGame(game));assert.deepEqual(restored.enemies,game.enemies);assert.deepEqual(restored.players,game.players);assert.deepEqual(restored.fireballs,game.fireballs);
});
