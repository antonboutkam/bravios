import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, clone, TILE } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { CHARACTER_PROFILES } from '../characters/roster.mjs';
import { wonderlandLevel, prepareWonderlandGame } from '../wonderland.mjs';
import { pinballCamera, PINBALL_MAX_TILT, PINBALL_MAX_SPEED } from '../pinball.mjs';

function steps(game, input, count = 120, dt = 1 / 120) { for (let i = 0; i < count; i++) stepGame(game, input, dt); }
function settled() {
  const game = createGame(blankLevel(100), {character:'pinball'});
  steps(game, {}, 60); game.player.x = 800;
  return game;
}
test('Pinball is selectable, silver art is registered, and its body rests on the ground without a parachute', () => {
  const profile = CHARACTER_PROFILES.pinball, game = settled();
  assert.equal(profile.name, 'Pinball'); assert.match(profile.portrait, /pinball\/images\/ball.png$/);
  assert.equal(profile.settings['2d'].parachute, false);
  assert.equal(game.player.grounded, true); assert.equal(game.player.w, 24); assert.equal(game.player.h, 24);
  assert.equal(game.player.y + game.player.h, 14 * TILE);
});
test('left and right tilt downhill, accelerate progressively, and have a bounded speed', () => {
  for (const [key, sign] of [['right',1],['left',-1]]) {
    const game = settled(); game.player.x = key === 'left' ? 2400 : 800;
    steps(game,{[key]:true},30); const early = game.player.vx * sign;
    assert.ok(early > 0 && early < 70); assert.ok(game.pinballTilt * sign > 0);
    steps(game,{[key]:true},240);
    assert.ok(game.player.vx * sign > early); assert.ok(Math.abs(game.player.vx) <= PINBALL_MAX_SPEED);
    assert.ok(Math.abs(game.pinballTilt) <= PINBALL_MAX_TILT); assert.equal(game.player.sprinting,false);
  }
});
test('release levels the board but preserves momentum; opposite input brakes before reversing', () => {
  const game = settled(); steps(game,{right:true});
  const x = game.player.x;
  steps(game,{},30); assert.ok(game.player.x > x); assert.ok(game.player.vx > 0);
  steps(game,{left:true},1); assert.ok(game.player.vx > 0, 'no instantaneous direction flip');
  steps(game,{left:true},240); assert.ok(game.player.vx < 0); assert.ok(game.pinballTilt < 0);
  steps(game,{},600); assert.equal(game.pinballTilt,0); assert.equal(game.player.vx,0);
});
test('jump preserves horizontal momentum; land, walls and pause keep rotation tied to actual travel', () => {
  const game = settled(); steps(game,{right:true},60);
  const y = game.player.y, vx = game.player.vx;
  stepGame(game,{right:true,jump:true});
  assert.ok(game.player.y < y); assert.ok(game.player.vy < 0); assert.ok(game.player.vx >= vx);
  steps(game,{},180); assert.ok(game.player.grounded); assert.equal(game.player.parachute,false);
  game.tiles[13][40] = game.tiles[12][40] = 1;
  steps(game,{right:true},600);
  assert.ok(game.player.x + game.player.w <= 40*TILE); assert.equal(game.player.vx,0);
  const angle=game.player.pinballAngle; steps(game,{right:true},20); assert.equal(game.player.pinballAngle,angle);
  game.state='paused'; const before=clone(game); steps(game,{left:true,jump:true}); assert.deepEqual(clone(game),before);
});
test('neutral and run input do not propel Pinball and other characters do not tilt the world', () => {
  const game=settled(); steps(game,{run:true,left:true,right:true}); assert.equal(game.player.vx,0); assert.equal(game.pinballTilt,0);
  const regular=createGame(blankLevel(72),{character:'boaz'}); steps(regular,{right:true},30);
  assert.equal(regular.pinballTilt,0); assert.equal(regular.player.vx,220);
});
test('co-op uses either Pinball player once per step, and snapshots retain tilt and roll', () => {
  for(const index of [0,1]) {
    const game=createCoopGame(blankLevel(100),'boaz'); game.players[index].character='pinball';
    for(let i=0;i<60;i++)stepCoopGame(game,[{},{}]);
    const inputs=[{},{}]; inputs[index]={right:true};
    stepCoopGame(game,inputs);
    assert.ok(Math.abs(game.pinballTilt-PINBALL_MAX_TILT*(1-Math.exp(-10/120)))<1e-12);
    for(let i=0;i<120;i++)stepCoopGame(game,inputs);
    const copy=unpackCoopGame(packCoopGame(game),index);
    assert.equal(copy.pinballTilt,game.pinballTilt); assert.deepEqual(copy.players,game.players);
    const restarted=createGame(blankLevel(72),{character:'pinball'});
    assert.equal(restarted.pinballTilt,0); assert.equal(restarted.player.pinballAngle,0);
  }
});
test('two Pinballs share one tilt, opposite commands cancel and respawn begins still', () => {
  const game=createCoopGame(blankLevel(100),'pinball'); game.players[1].character='pinball';
  game.players[1].spawn.y=14*TILE-24;
  for(let i=0;i<60;i++)stepCoopGame(game,[{},{}]);
  for(let i=0;i<60;i++)stepCoopGame(game,[{left:true},{right:true}]);
  assert.equal(game.pinballTilt,0); assert.equal(game.players[0].vx,0); assert.equal(game.players[1].vx,0);
  game.players[1].respawn=.001; game.players[1].pinballAngle=2;
  stepCoopGame(game,[{},{}]); assert.equal(game.players[1].pinballAngle,0);
  stepCoopGame(game,[{},{}]); assert.equal(game.players[1].w,24); assert.equal(game.players[1].h,24);
  assert.equal(game.players[1].y + game.players[1].h,14*TILE);
});
test('tilt and rolling stay consistent at 30, 60 and 120 physics steps per second', () => {
  const results=[30,60,120].map(hz=>{const game=settled();steps(game,{right:true},hz,1/hz);return game;});
  assert.ok(Math.max(...results.map(g=>g.player.x))-Math.min(...results.map(g=>g.player.x)) < 9);
  for(const g of results)assert.ok(Math.abs(g.pinballTilt-results[0].pinballTilt)<1e-12);
});
test('cave entry and return preserve the ball size and its feet above the floor', () => {
  const level=blankLevel(72); level.tiles[13][20]=62;
  const game=createGame(level,{character:'pinball'}),p=game.player;
  Object.assign(p,{x:20*TILE+5,y:14*TILE-p.h,grounded:true});
  stepGame(game,{}); assert.ok(game.caveState.active); assert.equal(p.h,24); assert.equal(p.y+p.h,14*TILE);
  Object.assign(p,{x:2*TILE+5,y:14*TILE-p.h,grounded:true,vx:0,vy:0});
  stepGame(game,{}); assert.equal(game.caveState.active,null); assert.equal(p.h,24); assert.equal(p.y+p.h,14*TILE);
  steps(game,{},60); assert.equal(game.state,'playing'); assert.equal(p.y+p.h,14*TILE);
});
test('Wonderland shrinking keeps a round ball and restores the original collision size', () => {
  const game=prepareWonderlandGame(createGame(wonderlandLevel(1),{character:'pinball'}),1);
  const shrink=game.wonderland.objects.find(o=>o.kind==='shrink');
  Object.assign(game.player,{x:shrink.x,y:shrink.y,vx:0,vy:0});
  stepGame(game,{}); assert.equal(game.player.w,24*.55); assert.equal(game.player.h,24*.55);
  game.wonderland.sizeTime=0; game.player.x=game.start.x*TILE; game.player.y=game.start.y*TILE;
  stepGame(game,{}); assert.equal(game.player.w,24); assert.equal(game.player.h,24);
});
test('camera covers rotated viewport corners in landscape and portrait; reduced motion keeps it level', () => {
  for(const [width,height] of [[1024,512],[400,800]])for(const angle of [-PINBALL_MAX_TILT,PINBALL_MAX_TILT]) {
    const viewport={left:100,right:100+width,top:0,bottom:height};
    const c=pinballCamera({pinballTilt:angle},viewport);
    for(const x of [-width/2,width/2])for(const y of [-height/2,height/2]) {
      assert.ok(Math.abs((x*Math.cos(angle)+y*Math.sin(angle))/c.scale)<=width/2+1e-6);
      assert.ok(Math.abs((-x*Math.sin(angle)+y*Math.cos(angle))/c.scale)<=height/2+1e-6);
    }
    const still=pinballCamera({pinballTilt:angle},viewport,true); assert.equal(still.angle,0); assert.equal(still.scale,1);
  }
});
test('camera keeps the ball fully visible at the start, finish and viewport edges', () => {
  for(const [width,height] of [[780,512],[1200,512],[400,800]])for(const angle of [-PINBALL_MAX_TILT,PINBALL_MAX_TILT]) {
    const viewport={left:0,right:width,top:0,bottom:height};
    for(const x of [0,68,width-92,width-24])for(const y of [0,height-88,height-24]) {
      const player={x,y,w:24,h:24};
      const c=pinballCamera({pinballTilt:angle,player},viewport);
      const dx=x+12-c.x,dy=y+12-c.y;
      const fx=c.x+c.scale*(dx*Math.cos(c.angle)-dy*Math.sin(c.angle));
      const fy=c.y+c.scale*(dx*Math.sin(c.angle)+dy*Math.cos(c.angle));
      assert.ok(fx>=12*c.scale-1e-5 && fx<=width-12*c.scale+1e-5);
      assert.ok(fy>=12*c.scale-1e-5 && fy<=height-12*c.scale+1e-5);
    }
  }
});
