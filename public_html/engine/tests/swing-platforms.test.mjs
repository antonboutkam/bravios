import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, resizeLevel, clone, PALETTE_GROUPS } from '../engine.mjs';
import { DONUT_BOUNCE, DONUT_SECONDS, vinePoint } from '../swing-platforms.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const advance = (g, frames, input = {}) => { for (let i = 0; i < frames; i++) stepGame(g, input); };
function level() { const l = blankLevel(40); l.tiles[5][10] = 99; l.tiles[11][17] = 100; return l; }
function atVine(g, p = g.player) {
  const point = vinePoint(g.vines[0], 110);
  Object.assign(p, { x: point.x - p.w / 2, y: point.y - 6, vx: 100, vy: 0, grounded: false });
}
function landOnDonut(g, p = g.player) {
  const d = g.donuts[0]; Object.assign(p, { x: d.x + 5, y: d.y - p.h - 1, vy: 150, grounded: false });
}
test('lianen en donuts zijn plaatsbaar, uitwisselbaar en blijven behouden bij hoger maken', () => {
  const l = level(); assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(l))), l);
  for (const id of [99, 100]) assert.ok(PALETTE_GROUPS.find(g => g.id === 'mechanisms').items.includes(id));
  const high = resizeLevel(l,40,32); assert.equal(high.tiles[21][10],99); assert.equal(high.tiles[27][17],100);
  assert.equal(createGame(high).vines[0].y,21*32+6);
  assert.equal(createGame(high).donuts[0].y,27*32+8);
  assert.deepEqual(l,level());
});
test('aanraken pakt de liaan, sturen slingert en springen laat los met snelheid', () => {
  const g = createGame(level()); atVine(g); stepGame(g, {});
  assert.equal(g.player.vineId, g.vines[0].id); const x = g.player.x;
  advance(g,40,{right:true}); assert.ok(g.player.x > x+35);
  const point = vinePoint(g.vines[0],g.player.vineGrip);
  assert.ok(Math.abs(g.player.x+g.player.w/2-point.x)<1e-8);
  assert.ok(Math.abs(g.player.y+6-point.y)<1e-8);
  stepGame(g,{right:true,jump:true}); assert.equal(g.player.vineId,null);
  assert.ok(g.player.vx>100); assert.ok(g.player.vy < -200); assert.ok(g.player.vineCooldown>0);
  stepGame(g,{right:true,jump:true}); assert.equal(g.player.vineId,null);
});
test('laag en hoog vastpakken; dalen laat los, op de grond pak je geen liaan', () => {
  for (const grip of [32,120]) {
    const g=createGame(level()),pt=vinePoint(g.vines[0],grip);
    Object.assign(g.player,{x:pt.x-11,y:pt.y-6,grounded:false});stepGame(g,{});
    assert.ok(g.player.vineId);assert.ok(Math.abs(g.player.vineGrip-grip)<1);
    stepGame(g,{pipe:true});assert.equal(g.player.vineId,null);
  }
  const g=createGame(level());atVine(g);g.player.grounded=true;stepGame(g,{});assert.equal(g.player.vineId,null);
});
test('slingeren gaat niet door vaste blokken en de speler kan daarna verder vallen', () => {
  const l=level();for(let y=0;y<14;y++)l.tiles[y][12]=1;
  const g=createGame(l);atVine(g);stepGame(g,{});
  let released=false;
  for(let i=0;i<240;i++) {stepGame(g,{right:true});assert.ok(g.player.x+g.player.w<=12*32+.01); if(!g.player.vineId)released=true;}
  assert.ok(released);assert.equal(g.state,'playing');
});
test('landen op een donut geeft een iets hogere sprong en start één aftelling', () => {
  const g=createGame(level()),d=g.donuts[0];landOnDonut(g);stepGame(g,{});
  assert.equal(g.player.vy,-DONUT_BOUNCE);assert.ok(DONUT_BOUNCE>660&&DONUT_BOUNCE<940);
  assert.equal(g.player.grounded,false);assert.equal(d.phase,'armed');assert.equal(d.remaining,DONUT_SECONDS);
  advance(g,120);assert.ok(Math.abs(d.remaining-2)<1e-8);
  landOnDonut(g);stepGame(g,{});assert.ok(d.remaining<2);assert.equal(g.player.vy,-DONUT_BOUNCE);
});
test('donut valt na precies drie seconden, ook na afspringen; pauze bevriest alles', () => {
  const g=createGame(level()),d=g.donuts[0],original=d.y;landOnDonut(g);stepGame(g,{});
  g.player.x=64;g.player.y=420;advance(g,359);assert.equal(d.phase,'armed');assert.equal(d.y,original);
  const before=clone(g);g.state='paused';const paused=clone(g);advance(g,120);assert.deepEqual(clone(g),paused);
  g.state='playing';assert.equal(g.donuts[0].remaining,before.donuts[0].remaining);
  stepGame(g,{});assert.equal(d.phase,'falling');assert.equal(d.remaining,0);assert.ok(d.y>original);
  landOnDonut(g);stepGame(g,{});assert.ok(g.player.vy>0,'vallende donut is geen onzichtbaar steunvlak');
  advance(g,240);assert.equal(d.phase,'gone');
  assert.equal(createGame(level()).donuts[0].phase,'idle');
});
test('donuts zijn van onderen doorgankelijk en niet door enkel aanraken te activeren', () => {
  const g=createGame(level()),d=g.donuts[0];Object.assign(g.player,{x:d.x+5,y:d.y+20,vy:-400,grounded:false});
  stepGame(g,{});assert.equal(d.phase,'idle');assert.ok(g.player.vy<0);
});
test('co-op deelt de donutklok eenmaal per frame en bewaart onafhankelijke liaangrepen', () => {
  const g=createCoopGame(level());atVine(g,g.players[1]);landOnDonut(g,g.players[0]);
  stepCoopGame(g,[{},{}]);assert.equal(g.donuts[0].remaining,3);assert.ok(g.players[1].vineId);assert.equal(g.players[0].vineId,null);
  g.players[0].x=64;g.players[0].y=420;
  for(let i=0;i<120;i++)stepCoopGame(g,[{},{right:true}]);
  assert.ok(Math.abs(g.donuts[0].remaining-2)<1e-8);
  const restored=unpackCoopGame(packCoopGame(g));assert.deepEqual(restored.vines,g.vines);assert.deepEqual(restored.donuts,g.donuts);
  assert.equal(restored.players[1].vineId,g.players[1].vineId);assert.equal(restored.players[1].vineGrip,g.players[1].vineGrip);
  stepCoopGame(g,[{},{jump:true}]);assert.equal(g.players[1].vineId,null);
});
test('echte speelroute springt vanaf een platform, slingert over een gat en landt aan de overkant', () => {
  const l=blankLevel(40);
  for(let y=12;y<16;y++)for(let x=8;x<31;x++)l.tiles[y][x]=0;
  l.tiles[6][11]=99;for(let x=15;x<19;x++)l.tiles[11][x]=12;
  const g=createGame(l);Object.assign(g.player,{x:234,y:384-g.player.h,grounded:true});
  let grabbed=false,released=false,landed=false;
  for(let i=0;i<300;i++) {
    const jump=!grabbed||grabbed&&!released&&g.vines[0].angle>.38;
    if(jump&&grabbed)released=true;
    stepGame(g,{right:true,jump});if(g.player.vineId)grabbed=true;
    if(released&&g.player.grounded){landed=true;break;}
  }
  assert.ok(grabbed&&released&&landed);assert.equal(g.state,'playing');
  assert.ok(g.player.x>=15*32&&g.player.x<19*32);assert.equal(g.player.y+g.player.h,11*32);
});

test('beide bro’s kunnen dezelfde liaan op eigen hoogte vasthouden; pauze bevriest de slinger', () => {
  const g=createCoopGame(level());
  for(const [i,p] of g.players.entries()) { const point=vinePoint(g.vines[0],60+i*50);Object.assign(p,{x:point.x-p.w/2,y:point.y-6,grounded:false}); }
  stepCoopGame(g,[{},{}]);assert.ok(g.players.every(p=>p.vineId===g.vines[0].id));assert.notEqual(g.players[0].vineGrip,g.players[1].vineGrip);
  stepCoopGame(g,[{right:true},{right:true}]);g.state='paused';const before=clone(g);stepCoopGame(g,[{left:true},{jump:true}],1/30);assert.deepEqual(clone(g),before);
});
test('grotreizen bewaren de buitenste slinger en donutklok en wissen de huidige greep', () => {
  const l=level();l.tiles[13][20]=62;const g=createGame(l);
  landOnDonut(g);stepGame(g,{});g.vines[0].angle=.5;const remaining=g.donuts[0].remaining;
  Object.assign(g.player,{x:20*32+5,y:420,vy:0,grounded:true});stepGame(g,{});
  assert.ok(g.caveState.active);assert.equal(g.vines.length,0);assert.equal(g.donuts.length,0);
  const outside=clone(g.caveState.outside);advance(g,60);assert.deepEqual(g.caveState.outside.vines,outside.vines);assert.deepEqual(g.caveState.outside.donuts,outside.donuts);
  Object.assign(g.player,{x:2*32+5,y:420,vy:0,grounded:true});stepGame(g,{});
  assert.equal(g.caveState.active,null);assert.deepEqual(g.vines,outside.vines);assert.deepEqual(g.donuts,outside.donuts);assert.ok(g.donuts[0].remaining<remaining);assert.equal(g.player.vineId,null);
});
