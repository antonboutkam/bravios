import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { normalizeSettings2D } from '../characters/shared/settings.mjs';
import { resetPlayerVitals, playerHealthScale, POWER_RECHARGE_SECONDS } from '../player-vitals.mjs';

function setup(character='anton') {
  const game=createGame(blankLevel(72),{character});
  for(let i=0;i<60;i++)stepGame(game,{});
  return game;
}
function contact(game, resetImmunity=true) {
  const p=game.player;
  if(resetImmunity)p.invincible=0;
  p.vy=0; game.hazards=[{kind:'hammer',x:p.x,y:p.y+5,w:22,h:22,vx:0,vy:0,life:1}];
  stepGame(game,{}); game.hazards=[];
}

test('five ordinary hits reduce Anton through five visible sizes to death, without changing collision geometry',()=>{
  const game=setup(),p=game.player,sizes=[playerHealthScale(p)],body=[p.w,p.h];
  assert.equal(p.health,5);
  for(let health=4;health>=0;health--){
    contact(game);assert.equal(p.health,health);assert.equal(game.state,health?'playing':'dead');
    assert.deepEqual([p.w,p.h],body);
    if(health)sizes.push(playerHealthScale(p));
  }
  assert.equal(new Set(sizes).size,5);assert.equal(sizes[0],1);assert.equal(sizes.at(-1),.6);assert.equal(p.power,0);
});

test('immunity prevents stacked contact damage, armor absorbs one hit and shooting abilities survive health loss',()=>{
  const game=setup(),p=game.player;p.fire=true;
  contact(game);assert.equal(p.health,4);assert.ok(p.fire);assert.ok(p.invincible>1);
  contact(game,false);assert.equal(p.health,4);
  p.shellHelmet=true;contact(game);assert.equal(p.health,4);assert.equal(p.shellHelmet,false);
  p.shield=true;contact(game);assert.equal(p.health,4);assert.equal(p.shield,false);
  p.star=10;contact(game);assert.equal(p.health,4);p.star=0;
  p.ice=true;p.fire=false;contact(game);assert.equal(p.health,3);assert.ok(p.ice);
  p.bubblegun=true;p.ice=false;contact(game);assert.equal(p.health,2);assert.ok(p.bubblegun);
});

test('lethal lava still empties health immediately; rainbow protection still works',()=>{
  for(const rainbow of [0,10]){
    const game=setup();game.tiles[13][2]=26;Object.assign(game.player,{shield:true,star:10,rainbow});stepGame(game,{});
    assert.equal(game.state,rainbow?'playing':'dead');assert.equal(game.player.health,rainbow?5:0);
  }
});

test('shared budget gives Boaz 6/4, Ravi 4/6 and Anton and Pixel 5/5',()=>{
  for(const [character,health,power] of [['boaz',6,4],['ravi',4,6],['anton',5,5],['pixel',5,5]]){
    const p=createGame(blankLevel(),{character}).player;
    assert.deepEqual([p.health,p.maxHealth,p.power,p.maxPower],[health,health,power,power]);
  }
  for(const balance of [{health:6,power:5},{health:0,power:10},{health:5.5,power:4.5},{health:'5',power:5},[],null])assert.throws(()=>normalizeSettings2D({'2d':{balance}}),/samen precies 10/);
});

test('fire, ice and bubbles consume one charge per real shot and stop while empty',()=>{
  for(const weapon of ['fire','ice','bubblegun']){
    const game=setup(),p=game.player;p[weapon]=true;p.power=1;
    stepGame(game,{fire:true});assert.ok(game.events.includes(weapon==='bubblegun'?'bubbleshoot':'shoot'));assert.ok(p.power<.01);
    p.fireCooldown=0;game.fireballs=[];stepGame(game,{fire:true});assert.equal(game.fireballs.length,0);assert.ok(p.power>0&&p.power<1);
    p.power=2;p.fireCooldown=1;stepGame(game,{fire:true});assert.ok(p.power>=2,'cooldown must not spend a charge');
    p.fireCooldown=0;game.fireballs=Array.from({length:5},()=>({alive:true,kind:'fire',x:400,y:200,w:8,h:8,vx:0,vy:0,life:3}));stepGame(game,{fire:true});assert.ok(p.power>=2,'projectile cap must not spend a charge');
  }
});

test('full recharge takes six active seconds for every build; pause freezes both bars',()=>{
  for(const character of ['boaz','ravi','anton']){
    const game=setup(character),p=game.player;p.power=0;
    for(let i=0;i<POWER_RECHARGE_SECONDS*60;i++)stepGame(game,{});
    assert.ok(Math.abs(p.power-p.maxPower/2)<1e-7);
    game.state='paused';const before=clone(game);for(let i=0;i<120;i++)stepGame(game,{});assert.deepEqual(clone(game),before);
    game.state='playing';for(let i=0;i<POWER_RECHARGE_SECONDS*60+1;i++)stepGame(game,{});assert.equal(p.power,p.maxPower);
  }
});

test('co-op has independent bars and one recharge per player per step, snapshots and respawn restore the right build',()=>{
  const game=createCoopGame(blankLevel(72),'ravi');
  game.players[1].character='boaz';resetPlayerVitals(game.players[1]);
  for(let i=0;i<60;i++)stepCoopGame(game,[{},{}]);
  for(const p of game.players)p.power=0;
  for(let i=0;i<120;i++)stepCoopGame(game,[{},{}]);
  assert.ok(Math.abs(game.players[0].power-1)<1e-8);assert.ok(Math.abs(game.players[1].power-4/6)<1e-8);
  game.players[0].health=2;const restored=unpackCoopGame(packCoopGame(game));assert.deepEqual(restored.players,game.players);
  game.players[1].y=1000;stepCoopGame(game,[{},{}]);assert.equal(game.players[1].health,0);assert.ok(game.players[1].respawn>0);
  for(let i=0;i<200;i++)stepCoopGame(game,[{},{}]);
  assert.equal(game.players[1].character,'boaz');assert.equal(game.players[1].health,6);assert.equal(game.players[1].power,4);assert.equal(game.players[0].health,2);
});

test('older shared saves receive complete character-specific bars without reviving a new dead snapshot',()=>{
  const game=createCoopGame(blankLevel(72),'ravi'),snapshot=packCoopGame(game);
  for(const p of snapshot.players)for(const key of ['health','maxHealth','power','maxPower'])delete p[key];
  const restored=unpackCoopGame(snapshot);assert.equal(restored.players[0].health,4);assert.equal(restored.players[0].power,6);
  restored.players[0].health=0;assert.equal(unpackCoopGame(packCoopGame(restored)).players[0].health,0);
});

test('cave transitions preserve damage and partially charged power instead of resetting the player',()=>{
  const level=blankLevel(72);level.tiles[13][20]=62;
  const game=createGame(level,{character:'anton'}),p=game.player;
  Object.assign(p,{x:20*32+5,y:420,vy:0,grounded:true,health:3,power:1});stepGame(game,{});
  assert.ok(game.caveState.active);assert.equal(p.health,3);assert.ok(p.power>=1&&p.power<1.02);
  Object.assign(p,{x:2*32+5,y:420,vy:0,grounded:true});stepGame(game,{});
  assert.equal(game.caveState.active,null);assert.equal(p.health,3);assert.ok(p.power<1.03);
});

test('the seahorse shares the shot budget and cannot bypass an empty bar',()=>{
  const level=blankLevel(40);level.theme='underwater';level.tiles[8][8]=90;
  const game=createGame(level,{character:'anton'}),p=game.player,dino=game.dinos[0];
  Object.assign(p,{x:dino.x,y:dino.y-24});stepGame(game,{mount:true});assert.equal(p.mounted,dino);
  p.power=1;stepGame(game,{fire:true});assert.ok(game.events.includes('bubbleshoot'));assert.ok(p.power<.01);
  p.fireCooldown=0;p.fire=true;stepGame(game,{fire:true});assert.ok(!game.events.includes('bubbleshoot'));assert.equal(game.fireballs.length,0);
});
