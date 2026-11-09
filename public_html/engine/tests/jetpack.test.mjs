import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, ROCKET_FUSE_SECONDS, blankLevel, validateLevel, createGame, stepGame, rocketCountdown, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
function advance(game,frames,input={}){for(let i=0;i<frames;i++)stepGame(game,input);}
function levelAt(height=32){const level=blankLevel(40,height);level.tiles[height-3][2]=44;level.tiles[height-3][3]=10;return level;}
function setup(height=32){const game=createGame(levelAt(height));game.player.x=2*TILE+5;game.player.character='ravi';stepGame(game,{});assert.equal(game.player.rocketStage,'fuse');return game;}
function endIntro(game){advance(game,Math.ceil(2.4*120)+2);assert.equal(game.rocketIntro,0);}
function launch(game){endIntro(game);for(let i=0;i<700&&game.player.rocketStage==='fuse';i++)stepGame(game,{});assert.equal(game.player.rocketStage,'flight');}
test('Jetpack is een bewaarbare beloning en opent een circusintro voor de speler die hem oppakt',()=>{
 const level=levelAt();assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))),level);
 const game=setup();assert.equal(game.rocketIntro,2.4);assert.equal(game.rocketCharacter,'ravi');assert.equal(game.player.rocketFuse,ROCKET_FUSE_SECONDS);
 const p=clone(game.player),time=game.time;advance(game,60,{right:true,jump:true});assert.deepEqual(game.player,p);assert.equal(game.time,time);assert.ok(game.rocketIntro<2.4);
});
test('na het portret staat de held stil en zijn alle cijfers 5, 4, 3, 2, 1, 0 zichtbaar voor lancering',()=>{
 const game=setup();endIntro(game);const counts=new Set(),p=game.player,x=p.x,y=p.y;
 for(let i=0;i<700&&p.rocketStage==='fuse';i++){
  counts.add(rocketCountdown(p));assert.equal(p.x,x);assert.equal(p.y,y);
  stepGame(game,{right:true,jump:true,pipe:true,mount:true});
 }
 assert.deepEqual([...counts],[5,4,3,2,1,0]);assert.equal(p.rocketStage,'flight');assert.ok(game.events.includes('rocketlaunch'));assert.equal(p.parachute,false);
});
test('de pijl vliegt met een lichte bocht door plafonds tot bovenin en laat de held los',()=>{
 for(const height of [16,32,64]){
  const game=setup(height),p=game.player;launch(game);const startX=p.rocketStartX,startY=p.rocketStartY;
  if(height>16)game.tiles[10].fill(1);
  let lastY=p.y;for(let i=0;i<500&&p.rocketStage==='flight';i++){stepGame(game,{left:true});assert.ok(p.y<=lastY+.001);assert.equal(p.parachute,false);lastY=p.y;}
  assert.equal(p.rocketStage,null);assert.ok(p.y<16);assert.ok(p.y<startY-200);assert.ok(p.x>startX&&p.x<=startX+48.01);assert.ok(p.vy>0);
  assert.equal(game.departingRockets.length,1);assert.ok(game.events.includes('rocketdetach'));
  const rocketY=game.departingRockets[0].y;stepGame(game,{});assert.ok(game.departingRockets[0].y<rocketY);
 }
});
test('na loskoppelen valt de held terug en opent de parachute; daarna verdwijnen de losse pijl en de parachute',()=>{
 const game=setup();launch(game);for(let i=0;i<500&&game.player.rocketStage;i++)stepGame(game,{});
 for(let i=0;i<200&&!game.player.parachute;i++)stepGame(game,{});assert.equal(game.player.parachute,true);assert.equal(game.player.rocketStage,null);assert.ok(game.player.vy>0);
 advance(game,1000);assert.equal(game.departingRockets.length,0);assert.equal(game.player.grounded,true);assert.equal(game.player.parachute,false);assert.equal(game.state,'playing');
});
test('pauze bevriest portret, lont en vlucht; herstart begint zonder pijl',()=>{
 const game=setup();for(const phase of ['intro','fuse','flight']){
  if(phase==='fuse')endIntro(game);if(phase==='flight')launch(game);
  game.state='paused';const before=clone(game);advance(game,120);assert.deepEqual(clone(game),before);game.state='playing';
 }
 const fresh=createGame(levelAt());assert.equal(fresh.player.rocketStage,null);assert.equal(fresh.rocketIntro,0);assert.deepEqual(fresh.departingRockets,[]);
});
test('vlucht blijft binnen de zijranden bij lanceren naar links en rechts',()=>{
 for(const facing of [-1,1]){
  const game=setup(),p=game.player;p.x=facing===1?40*TILE-p.w-1:1;p.facing=facing;launch(game);
  for(let i=0;i<500&&p.rocketStage;i++){stepGame(game,{});assert.ok(p.x>=0&&p.x+p.w<=40*TILE);}
  assert.equal(p.rocketStage,null);
 }
});
test('de tweede speler kan zijn eigen pijl krijgen en de gedeelde intro tikt eenmaal per stap',()=>{
 const level=blankLevel(40,32);level.tiles[29][3]=44;const game=createCoopGame(level);
 stepCoopGame(game,[{},{}]);assert.equal(game.players[0].rocketStage,null);assert.equal(game.players[1].rocketStage,'fuse');assert.equal(game.rocketCharacter,'ravi');
 stepCoopGame(game,[{},{}]);assert.ok(Math.abs(game.rocketIntro-(2.4-1/120))<1e-8);
 for(let i=0;i<1000&&game.players[1].rocketStage!=='flight';i++)stepCoopGame(game,[{},{}]);assert.equal(game.players[1].rocketStage,'flight');assert.equal(game.players[0].rocketStage,null);
 const restored=unpackCoopGame(packCoopGame(game));assert.deepEqual(restored.players,game.players);assert.equal(restored.rocketCharacter,'ravi');assert.deepEqual(restored.departingRockets,game.departingRockets);
 for(let i=0;i<500&&game.players[1].rocketStage;i++)stepCoopGame(game,[{},{}]);assert.equal(game.players[1].rocketStage,null);assert.equal(game.departingRockets.length,1);
});
