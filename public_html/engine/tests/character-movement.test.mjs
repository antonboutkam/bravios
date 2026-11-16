import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, WALK_SPEED, RUN_SPEED, TILE, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame, remoteControls } from '../coop.mjs';
import { CHARACTER_PROFILES } from '../characters/roster.mjs';
import { characterSettings2D, normalizeSettings2D } from '../characters/shared/settings.mjs';
import { characterPose, rollingPose, IDLE_FRAME_SECONDS } from '../characters/shared/poses.mjs';
import { GamepadInput } from '../gamepad.mjs';

function settled(character = 'anton') {
  const game = createGame(blankLevel(72)); game.player.character = character;
  for (let i = 0; i < 60; i++) stepGame(game, {});
  return game;
}
function steps(game, input, count = 12) { for (let i = 0; i < count; i++) stepGame(game, input); }

test('Anton cycles through idle and all nine added poses when standing, with movement taking priority', () => {
  const poses = CHARACTER_PROFILES.anton.views.side.poses;
  const expected = ['idle', ...Array.from({length:9},(_,i)=>`idle-${i+1}`)];
  const actual = expected.map((_,i)=>characterPose(poses,{time:i*IDLE_FRAME_SECONDS+.001}));
  assert.deepEqual(actual,expected);
  assert.ok(expected.every(pose=>poses[pose]));
  assert.equal(characterPose(poses,{time:10*IDLE_FRAME_SECONDS+.001}),'idle');
  assert.equal(characterPose(poses,{time:4.6,front:true}),'idle-9');
  assert.equal(characterPose(poses,{time:4.6,reducedMotion:true}),'idle');
  assert.equal(characterPose(poses,{time:4.6,airborne:true}),'jump');
  assert.equal(characterPose(poses,{time:4.6,landing:.1}),'land');
  assert.equal(characterPose(poses,{time:4.6,won:true}),'victory');
  assert.match(characterPose(poses,{time:4.6,walking:true}),/^walk-/);
  assert.equal(characterPose(poses,{time:4.6,running:true}),'run');
  const legacy = CHARACTER_PROFILES.boaz.views.side.poses;
  assert.equal(characterPose(legacy,{time:4.6}),'side');
  assert.equal(characterPose(legacy,{time:4.6,front:true}),'idle');
});
test('Anton has a larger drawing scale without a larger collision box or a different movement speed', () => {
  assert.equal(characterSettings2D('anton').renderScale,1.5625);
  assert.equal(characterSettings2D('boaz').renderScale ?? 1,1);
  const anton=settled('anton'),boaz=settled('boaz');
  assert.deepEqual([anton.player.w,anton.player.h],[boaz.player.w,boaz.player.h]);
  steps(anton,{right:true,run:true});steps(boaz,{right:true,run:true});
  assert.equal(anton.player.vx,boaz.player.vx);
  for(const renderScale of [0,3,'1.25',null,NaN,Infinity])assert.throws(()=>normalizeSettings2D({'2d':{renderScale}}),/renderScale/);
});

test('normal movement walks; holding run accelerates, release returns to walking in either direction', () => {
  for (const direction of ['left', 'right']) {
    const game = settled(); game.player.x = 600;
    steps(game, { [direction]: true }); assert.equal(Math.abs(game.player.vx), WALK_SPEED); assert.equal(game.player.sprinting, false);
    steps(game, { [direction]: true, run: true }); assert.equal(Math.abs(game.player.vx), RUN_SPEED); assert.equal(game.player.sprinting, true);
    steps(game, { [direction]: true }); assert.equal(Math.abs(game.player.vx), WALK_SPEED); assert.equal(game.player.sprinting, false);
    steps(game, { run: true }); assert.equal(game.player.vx, 0); assert.equal(game.player.sprinting, false);
  }
});

test('roll travel stops at walls and during pause; jump retains its own pose and collision size', () => {
  const game = settled(), p = game.player, poses = CHARACTER_PROFILES.anton.views.side.poses;
  steps(game, { right: true, run: true }); assert.ok(p.moveDistance > 0);
  const size = [p.w, p.h]; game.state = 'paused'; const snapshot = clone(game);
  steps(game, { right: true, run: true }); assert.deepEqual(clone(game), snapshot); game.state = 'playing';
  stepGame(game, { right: true, run: true, jump: true });
  assert.equal(characterPose(poses, { running: p.sprinting, airborne: !p.grounded }), 'jump'); assert.deepEqual([p.w,p.h], size);
  const wall = settled(); wall.tiles[13][8] = wall.tiles[12][8] = 1;
  steps(wall, { right: true, run: true }, 120); const distance = wall.player.moveDistance;
  steps(wall, { right: true, run: true }); assert.equal(wall.player.moveDistance, distance); assert.equal(wall.player.sprinting, false);
});

test('each character controls its own parachute, including old saves with an open parachute', () => {
  for (const character of ['anton', 'boaz', 'ravi', 'pixel']) {
    const level = blankLevel(40,32); level.tiles[29][2] = 0; level.tiles[17][2] = 10;
    const game = createGame(level); Object.assign(game.player, { character, parachute: true, vy: 200 });
    steps(game, {}, 60);
    assert.equal(game.player.parachute, character !== 'anton');
    if (character === 'anton') { assert.ok(game.player.vy > 160); assert.equal(game.player.fallDistance, 0); }
  }
});

test('walking and running accept independent variable frame counts; explicit run art replaces the automatic roll', () => {
  const poses = { ...CHARACTER_PROFILES.anton.views.side.poses };
  const settings = characterSettings2D('anton');
  assert.equal(rollingPose(poses, settings, { running: true }), true);
  for (const override of [{ airborne:true },{ won:true },{ landing:.1 },{ running:false }]) assert.equal(rollingPose(poses, settings, { running:true, ...override }), false);
  const custom = { ...poses, ...Object.fromEntries(Array.from({length:7},(_,i)=>[`run-${i+1}`,`run-${i+1}.png`])) };
  assert.equal(rollingPose(custom, settings, { running:true }), false);
  assert.deepEqual([.001,.541,.631].map(time=>characterPose(custom,{running:true,time})), ['run-1','run-7','run-1']);
  assert.equal(characterPose(custom,{walking:true,time:.181}), 'walk-3');
  assert.equal(characterPose(custom,{running:true,time:.541,reducedMotion:true}), 'run-1');
  assert.equal(characterPose({run:'legacy.png','run-1':'a.png','run-2':'b.png'},{walking:true,time:.1}), 'run-2');
});

test('B sprints without firing and remote packets preserve held run independently of action taps', () => {
  const buttons = Array.from({length:16},()=>({pressed:false})); buttons[1].pressed = true;
  const pad = new GamepadInput(), nav = {getGamepads:()=>[{index:0,connected:true,mapping:'standard',axes:[1,0],buttons}]};
  const sample = pad.poll(nav); assert.ok(sample.pressed.includes('cancel'), 'B remains a back button in menus'); const input = sample.controls; assert.equal(input.run,true); assert.equal(input.fire,false);
  const remote = remoteControls({...input,taps:{jump:1}},{}); assert.equal(remote.run,true); assert.equal(remote.jump,true);
  buttons[1].pressed = false; buttons[2].pressed = true;
  const released = pad.poll(nav).controls; assert.equal(released.run,false); assert.equal(released.fire,true);
  assert.equal(remoteControls({run:'true'}).run,false);
});

test('co-op keeps independent sprint speeds, roll phase and per-character parachutes through snapshots', () => {
  const game = createCoopGame(blankLevel(72), 'anton'); game.players[1].character = 'boaz';
  for(let i=0;i<60;i++) stepCoopGame(game,[{},{}]);
  for(let i=0;i<20;i++) stepCoopGame(game,[{right:true,run:true},{right:true}]);
  assert.equal(game.players[0].vx,RUN_SPEED); assert.equal(game.players[1].vx,WALK_SPEED);
  const copy = unpackCoopGame(packCoopGame(game)); assert.deepEqual(copy.players,game.players);
  for(const p of game.players)Object.assign(p,{y:4*TILE,vy:300,grounded:false});
  for(let i=0;i<60;i++)stepCoopGame(game,[{},{}]);
  assert.equal(game.players[0].parachute,false); assert.equal(game.players[1].parachute,true);
});

test('2D settings default safely and reject misspelled boolean values or animation modes', () => {
  assert.deepEqual(normalizeSettings2D(),{parachute:true,runAnimation:'frames',balance:{health:5,power:5}});
  assert.equal(normalizeSettings2D({'2d':{parachute:false}}).parachute,false);
  for(const settings of [null,[],{'2d':[]},{'2d':{parachute:'false'}},{'2d':{runAnimation:'rol'}}])assert.throws(()=>normalizeSettings2D(settings),/settings/);
});
