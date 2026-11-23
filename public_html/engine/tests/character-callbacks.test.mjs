import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { blankLevel, createGame, stepGame } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame, remoteControls } from '../coop.mjs';
import { CHARACTER_CATALOG } from '../characters/catalog.mjs';
import { loadCharacterCallbacks, SPECIAL_COOLDOWN_SECONDS } from '../characters/callbacks.mjs';
import { normalizeCharacterCallbacks } from '../characters/callback-schema.mjs';
import { collectModules, bundleModules } from '../build/module-graph.mjs';
import { GamepadInput } from '../gamepad.mjs';
import { begroetSpeler, telSprongen, beloonMuntje, reageerOpSchade, activeerSchild, vierOverwinning } from '../../gameplay/characters/anton/callbacks.js';

const anton = CHARACTER_CATALOG.find(profile => profile.id === 'anton');
const examples = { begroetSpeler, telSprongen, beloonMuntje, reageerOpSchade, activeerSchild, vierOverwinning };
beforeEach(async () => { await loadCharacterCallbacks(); });
const settle = game => { for (let i=0;i<100;i++) stepGame(game, {}); return game; };
const setup = () => settle(createGame(blankLevel(72), { character:'anton' }));
function coin(game) {
  const p=game.player;
  game.tiles[Math.floor((p.y+10)/32)][Math.floor((p.x+10)/32)]=4;
  stepGame(game,{});
}
function contact(game) {
  const p=game.player;p.invincible=0;p.vy=0;
  game.hazards=[{kind:'hammer',x:p.x,y:p.y+5,w:22,h:22,vx:0,vy:0,life:1}];
  stepGame(game,{});game.hazards=[];
}

test('all six Anton functions run on actual platform events exactly once', () => {
  const game=setup(),p=game.player,s=p.callbackState;
  assert.equal(s.data.starts,1);assert.match(s.message,/klaar/);
  stepGame(game,{jump:true});assert.equal(s.data.sprongen,1);
  for(let i=0;i<8;i++)stepGame(game,{jump:true});assert.equal(s.data.sprongen,1);
  settle(game);coin(game);assert.equal(s.data.gevondenMuntjes,1);assert.equal(s.bonusPoints,1);
  contact(game);assert.equal(s.data.treffers,1);assert.equal(p.health,4);assert.match(s.message,/Au/);
  stepGame(game,{special:true});assert.equal(s.data.schilden,1);assert.equal(s.shieldTime,3);
  p.x=game.finish.x*32;p.y=game.finish.y*32-28;stepGame(game,{});
  assert.equal(game.state,'won');assert.equal(s.data.overwinningen,1);assert.equal(s.bonusPoints,6);
  stepGame(game,{});assert.equal(s.data.overwinningen,1);
});

test('each real fifth coin heals one point or awards extra bonus with full health', () => {
  for(const health of [3,5]) {
    const game=setup(),p=game.player;p.health=health;
    for(let i=0;i<5;i++)coin(game);
    assert.equal(game.coins,5);assert.equal(p.coins,5);
    assert.equal(p.health,health===3?4:5);assert.equal(p.callbackState.bonusPoints,health===3?5:7);
  }
});

test('shield absorbs one ordinary hit, expires, respects release and cooldown, and cannot stop lethal hazards', () => {
  const game=setup(),p=game.player,s=p.callbackState;
  stepGame(game,{special:true});contact(game);assert.equal(p.health,5);assert.equal(s.shieldTime,0);assert.equal(s.data.treffers,0);
  for(let i=0;i<1000;i++)stepGame(game,{special:true});assert.equal(s.data.schilden,1,'holding never retriggers');
  stepGame(game,{});stepGame(game,{special:true});assert.equal(s.data.schilden,2);
  const remaining=s.specialCooldown,shield=s.shieldTime;game.state='paused';stepGame(game,{special:true},1);
  assert.equal(s.specialCooldown,remaining);assert.equal(s.shieldTime,shield);game.state='playing';
  for(let i=0;i<361;i++)stepGame(game,{});assert.equal(s.shieldTime,0);assert.ok(s.specialCooldown>0);
  contact(game);assert.equal(p.health,4);assert.equal(s.data.treffers,1);
  for(let i=0;i<SPECIAL_COOLDOWN_SECONDS*120;i++)stepGame(game,{});
  stepGame(game,{special:true});p.y=1000;stepGame(game,{});
  assert.equal(game.state,'dead');assert.equal(p.health,0);assert.equal(s.shieldTime,0);assert.match(s.message,/Af!/);
});

test('co-op keeps independent state for identical characters, snapshots do not rerun callbacks, respawn reruns only spawn', () => {
  const game=createCoopGame(blankLevel(72),'anton');game.players[1].character='anton';
  for(let i=0;i<100;i++)stepCoopGame(game,[{},{}]);
  assert.equal(game.players[0].callbackState.data.starts,1);assert.equal(game.players[1].callbackState.data.starts,1);
  assert.notEqual(game.players[0].callbackState.data,game.players[1].callbackState.data);
  stepCoopGame(game,[{},{special:true}]);
  assert.equal(game.players[0].callbackState.data.schilden,0);assert.equal(game.players[1].callbackState.data.schilden,1);
  assert.equal(game.players[1].callbackState.specialCooldown,8);
  const packed=packCoopGame(game),restored=unpackCoopGame(packed);
  assert.deepEqual(restored.players,game.players);assert.equal(restored.players[1].callbackState.data.starts,1);
  game.players[1].y=1000;stepCoopGame(game,[{},{}]);
  for(let i=0;i<200;i++)stepCoopGame(game,[{},{}]);
  assert.equal(game.players[1].callbackState.data.starts,2);assert.equal(game.players[0].callbackState.data.starts,1);
  assert.equal(game.players[1].callbackState.data.schilden,1);assert.equal(game.players[1].callbackState.shieldTime,0);
});

test('winning callbacks respect cooperative targets, races, ties and ordinary co-op finish', () => {
  for(const [kind,target,score,expected] of [['coin-team',9,[2,1],[false,false]],['coin-team',3,[2,1],[true,true]],['coin-race',99,[2,1],[true,false]],['coin-race',99,[2,2],[true,true]]]) {
    const level=blankLevel(72);level.tiles[10][30]=4;level.challenge={kind,target,seconds:30};const game=createCoopGame(level,'anton');game.players[1].character='anton';
    stepCoopGame(game,[{},{}]);game.time=30;game.coins=score[0]+score[1];game.players.forEach((p,i)=>p.coins=score[i]);stepCoopGame(game,[{},{}]);
    assert.deepEqual(game.players.map(p=>!!p.callbackState.data.overwinningen),expected,kind);
  }
  const game=createCoopGame(blankLevel(72),'anton');game.players[1].character='anton';stepCoopGame(game,[{},{}]);
  game.player.x=game.finish.x*32;game.player.y=game.finish.y*32-28;stepCoopGame(game,[{},{}]);
  assert.deepEqual(game.players.map(p=>p.callbackState.data.overwinningen),[1,1]);
});

test('runtime errors isolate one event, discard partial rewards and data, and are visible', async () => {
  await loadCharacterCallbacks([anton],async()=>({...examples,telSprongen(context){context.addBonusPoints(7);context.data.bad=1;throw new Error('Oeps uit de les');}}));
  const game=setup();stepGame(game,{jump:true});const s=game.player.callbackState;
  assert.match(s.error,/anton.*onJump.*telSprongen.*Oeps uit de les/);assert.deepEqual(s.disabled,['onJump']);assert.equal(s.bonusPoints,0);assert.equal(s.data.bad,undefined);
  coin(game);assert.equal(s.bonusPoints,1);assert.equal(s.data.gevondenMuntjes,1);assert.equal(game.state,'playing');
});

test('invalid data and returned promises fail without applying effects; late async effects are ignored', async () => {
  for(const callback of [context=>{context.data.bad={};context.heal(1);},context=>{context.addBonusPoints(9);return Promise.resolve().then(()=>context.addBonusPoints(8));},()=>{throw null;},context=>{context.addBonusPoints(7);context.showMessage({toString(){throw new Error('Ongeldige tekst');}});}]) {
    await loadCharacterCallbacks([anton],async()=>({...examples,activeerSchild:callback}));
    const game=setup();game.player.health=3;stepGame(game,{special:true});await Promise.resolve();
    assert.equal(game.player.health,3);assert.equal(game.player.callbackState.bonusPoints,0);assert.ok(game.player.callbackState.error);
  }
});

test('callback configuration and exports are validated, while omission is compatible', async () => {
  assert.deepEqual(normalizeCharacterCallbacks(undefined),{});
  for(const value of [null,[],{onLand:'land'},{onJump:'alert(1)'},{onSpecial:'__proto__'}])assert.throws(()=>normalizeCharacterCallbacks(value));
  await assert.rejects(loadCharacterCallbacks([anton],async()=>({})),/begroetSpeler/);
  await assert.rejects(loadCharacterCallbacks([anton],async()=>({...examples,activeerSchild:async()=>{}})),/synchrone/);
  await loadCharacterCallbacks();const game=createGame(blankLevel(),{character:'boaz'});stepGame(game,{});assert.equal(game.player.callbackState,undefined);
});

test('special input reaches controller and guest tap packets once', () => {
  const buttons=Array.from({length:17},()=>({pressed:false,value:0}));buttons[5].pressed=true;
  const pad=new GamepadInput(),navigator={getGamepads:()=>[{index:0,id:'Test',connected:true,mapping:'standard',axes:[0,0],buttons}]};
  const sample=pad.poll(navigator);assert.equal(sample.controls.special,true);assert.ok(sample.pressed.includes('special'));
  assert.ok(!pad.poll(navigator).pressed.includes('special'));
  const taps={};assert.ok(remoteControls({taps:{special:1}},taps).special);assert.equal(remoteControls({taps:{special:1}},taps).special,false);
});

test('offline bundle imports all six actual Anton callbacks and plays them without network', async () => {
  const graph=await collectModules(new URL('../',import.meta.url));
  assert.ok(graph.has('../gameplay/characters/anton/callbacks.js'));
  graph.set('callback-offline-test.mjs', "import { loadCharacterCallbacks } from './characters/callbacks.mjs';\nimport { createGame, blankLevel, stepGame } from './engine.mjs';\nglobalThis.ready=loadCharacterCallbacks().then(()=>{const game=createGame(blankLevel(),{character:'anton'});stepGame(game,{});stepGame(game,{special:true});globalThis.result=game;});");
  const context={URL,braviosOffline:true,location:{href:'file:///tmp/speel.html'}};
  runInNewContext(bundleModules(graph,'callback-offline-test.mjs'),context);await context.ready;
  assert.equal(context.result.player.callbackState.data.starts,1);assert.equal(context.result.player.callbackState.shieldTime,3);
  assert.equal(context.result.player.callbackState.error,'');
});

test('cave travel preserves callback data and does not invoke spawn again',()=>{
  const level=blankLevel(72);level.tiles[13][20]=62;
  const game=settle(createGame(level,{character:'anton'})),p=game.player;
  coin(game);stepGame(game,{special:true});const state=p.callbackState;
  Object.assign(p,{x:20*32+5,y:420,vy:0,grounded:true});stepGame(game,{});
  assert.ok(game.caveState.active);assert.equal(p.callbackState,state);assert.equal(state.data.starts,1);
  Object.assign(p,{x:2*32+5,y:420,vy:0,grounded:true});stepGame(game,{});
  assert.equal(game.caveState.active,null);assert.equal(state.data.starts,1);assert.equal(state.data.gevondenMuntjes,1);assert.equal(state.bonusPoints,1);assert.ok(state.shieldTime>2.9);
});

test('new rounds start fresh and API rewards are bounded without reviving a dead player',async()=>{
  await loadCharacterCallbacks([anton],async()=>({...examples,activeerSchild(context){context.heal(99);context.giveShield(99);context.addBonusPoints(99);context.showMessage('x'.repeat(200),99);}}));
  const game=setup(),p=game.player;p.health=2;stepGame(game,{special:true});
  assert.equal(p.health,3);assert.equal(p.callbackState.shieldTime,3);assert.equal(p.callbackState.bonusPoints,10);assert.equal(p.callbackState.message.length,100);assert.equal(p.callbackState.messageTime,5);
  const fresh=setup();assert.equal(fresh.player.callbackState.bonusPoints,0);assert.equal(fresh.player.callbackState.data.starts,1);
  await loadCharacterCallbacks([anton],async()=>({...examples,reageerOpSchade(context){context.heal(1);}}));
  p.y=1000;stepGame(game,{});assert.equal(p.health,0);assert.equal(game.state,'dead');
});
