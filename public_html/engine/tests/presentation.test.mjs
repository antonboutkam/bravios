import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, stepGame, exampleLevel, clone } from '../engine.mjs';
import { createCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { RenderQuality, FrameRateMeter, SceneEffects, followCamera } from '../presentation.mjs';

test('aanhoudend traag tekenen verlaagt alleen extra pixeldichtheid, zonder heen en weer schakelen',()=>{
  for(const interval of [1000/60,1000/120]) {
    const quality=new RenderQuality();
    for(let i=0;i<100;i++)assert.equal(quality.observe(i*interval,2),false);
    assert.equal(quality.maxDensity,2);
  }
  const slow=new RenderQuality(); let switches=0;
  for(let i=0;i<100;i++)if(slow.observe(i*1000/15,2))switches++;
  assert.equal(switches,1); assert.equal(slow.maxDensity,1);
  for(let i=100;i<300;i++)assert.equal(slow.observe(i*1000/60,1),false);
  slow.reset(); assert.equal(slow.maxDensity,1,'een tabwissel verhoogt de belasting niet opnieuw');
  const normal=new RenderQuality();
  for(let i=0;i<100;i++)assert.equal(normal.observe(i*100,1),false);
  assert.equal(normal.maxDensity,2,'geen verdere verlaging onder schermresolutie');
});
test('enkele haperingen, tabpauzes en onvolledige meetperioden verlagen de kwaliteit niet',()=>{
  const quality=new RenderQuality(); let time=0;
  for(let i=0;i<90;i++) { time+=i%20===0?200:1000/60;assert.equal(quality.observe(time,2),false); }
  time+=10000;assert.equal(quality.observe(time,2),false);
  for(let i=0;i<20;i++) { time+=60;assert.equal(quality.observe(time,2),false); }
  quality.reset();
  for(let i=0;i<20;i++) { time+=60;assert.equal(quality.observe(time,2),false); }
  assert.equal(quality.maxDensity,2);
});

test('FPS-meter meet echte beeldintervallen inclusief haperingen en herstart na tabwissel',()=>{
  for(const fps of [10,30,60,120]) {
    const meter=new FrameRateMeter(); let result;
    for(let i=0;i<=fps+1;i++) result=meter.sample(i*1000/fps)||result;
    assert.ok(Math.abs(result.fps-fps)<.001);
  }
  const meter=new FrameRateMeter();
  meter.sample(0); meter.sample(100);
  assert.deepEqual(meter.sample(1000),{fps:2,longestMs:900});
  meter.reset(); assert.equal(meter.sample(100000),null);
  assert.equal(meter.sample(100000),null);
  assert.deepEqual(meter.sample(101000),{fps:1,longestMs:1000});
});

test('visuele effecten en camera veranderen geen spelregels, levels of randomreeks', () => {
  const level = exampleLevel(), original = clone(level);
  let randomCalls = 0;
  const game = createGame(level, { random: () => { randomCalls++; return .5; } });
  const reference = createGame(level, { random: () => .5 });
  const effects = new SceneEffects(); effects.reset(game);
  for (let frame = 0; frame < 600; frame++) {
    const input = { right: frame < 400, jump: frame % 100 < 25 };
    stepGame(game, input); stepGame(reference, input);
    const before = clone(game), callsBefore = randomCalls;
    effects.observe(game); followCamera(0, game.player, 1, 640, 2304, 1 / 120);
    assert.deepEqual(clone(game), before);
    assert.equal(randomCalls, callsBefore);
  }
  assert.deepEqual(clone(game), clone(reference));
  assert.deepEqual(level, original);
});

test('muntjes en kapotte blokken geven effecten op hun eigen positie', () => {
  const game = createGame(exampleLevel()); const effects = new SceneEffects(); effects.reset(game);
  game.tiles[12][5] = 0; game.tiles[10][8] = 0; game.time += .01;
  effects.observe(game);
  assert.ok(effects.particles.some(p => p.x === 5 * 32 + 16 && p.y === 12 * 32 + 12 && p.sparkle));
  assert.ok(effects.particles.some(p => p.x === 8 * 32 + 16 && p.y === 10 * 32 + 16 && !p.sparkle));
  const paused = clone(effects.particles); effects.observe(game);
  assert.deepEqual(effects.particles, paused, 'zonder verstreken speltijd blijven de effecten stilstaan');
  game.time += 1; effects.reset(game);
  assert.equal(effects.particles.length, 0);
});

test('effecten volgen ook vervangen gast-snapshots en komen nooit in netwerkdata', () => {
  const host = createCoopGame(exampleLevel()); const snapshot = packCoopGame(host);
  const effects = new SceneEffects(); effects.reset(unpackCoopGame(snapshot));
  host.tiles[12][5] = 0; host.time = .08;
  const guest = unpackCoopGame(packCoopGame(host)); const before = packCoopGame(guest);
  effects.observe(guest); const count = effects.particles.length;
  assert.ok(count > 0); assert.deepEqual(packCoopGame(guest), before);
  effects.observe(unpackCoopGame(packCoopGame(host)));
  assert.equal(effects.particles.length, count, 'dezelfde snapshot herhaalt een muntjeseffect niet');
  effects.observe(unpackCoopGame(snapshot));
  assert.equal(effects.particles.length, 0, 'opnieuw starten ruimt oude effecten op');
});

test('effecten blijven begrensd en respecteren minder beweging', () => {
  const game = createGame(exampleLevel()); const effects = new SceneEffects(); effects.reset(game);
  for (let i = 0; i < 50; i++) effects.burst(0, 0, ['#fff']);
  assert.equal(effects.particles.length, 180);
  effects.observe(game, true); assert.equal(effects.particles.length, 0);
  game.tiles[12][5] = 0; effects.observe(game, true);
  assert.equal(effects.particles.length, 0);
});

test('camera volgt onafhankelijk van beeldsnelheid, blijft binnen het level en springt mee bij teleportatie', () => {
  const p = { x: 520, w: 22, vx: 0 };
  const once = followCamera(100, p, 1, 640, 2304, 1 / 30);
  const twice = followCamera(followCamera(100, p, 1, 640, 2304, 1 / 60), p, 1, 640, 2304, 1 / 60);
  assert.ok(Math.abs(once - twice) < 1e-9);
  assert.equal(followCamera(100, p, 1, 640, 2304, 0), 100, 'stilstaande tijd verplaatst de camera niet');
  assert.equal(followCamera(1000, p, 1, 1200, 1000, .016), 0);
  assert.equal(followCamera(0, { ...p, x: 2250 }, 1, 640, 2304, .016), 1664);
  assert.equal(followCamera(100, p, 1, 640, 2304, .016, true), 262.2);
});

test('lange en hoge velden blijven binnen de canvaslimieten zonder spelcoördinaten te wijzigen', async () => {
  const { worldRenderResolution } = await import('../presentation.mjs');
  for (const [width,height] of [[40,16],[72,16],[120,16],[240,16],[264,32],[312,32],[360,64]]) {
    const scale=worldRenderResolution(width,height);
    const w=Math.floor(width*32*scale),h=Math.floor(height*32*scale);
    assert.ok(w<=8192&&h<=8192,`${width} × ${height}: ${w} × ${h}`);
    assert.ok(w*h<=8*1024*1024);assert.ok(scale>0&&scale<=2);
  }
  assert.equal(worldRenderResolution(72,16),2);
  assert.equal(worldRenderResolution(120,16),2);
  assert.ok(worldRenderResolution(264,32)<1);
});

test('schermbitmap houdt dezelfde scherpte voor korte, lange en hoge werelden', async()=>{
 const {viewportRenderSize,viewportWorldPoint}=await import('../presentation.mjs');
 for(const ratio of [1,1.5,2,3]){
  const raster=viewportRenderSize(1280,800,800/512,ratio);
  assert.ok(raster.width>=1280&&raster.height>=800);assert.ok(raster.width*raster.height<=8*1024*1024);
  assert.ok(raster.density>=1);assert.equal(raster.scale,800/512*raster.density);
 }
 for(const [w,h] of [[0,0],[390,844],[1920,1080],[3840,2160]]){
  const r=viewportRenderSize(w,h,1.5,2);assert.ok(r.width>0&&r.height>0&&r.width<=8192&&r.height<=8192);assert.ok(r.width*r.height<=8*1024*1024);
 }
 assert.deepEqual(viewportWorldPoint(160,240,{left:10,top:20},850,360,50),{x:20,y:11});
 assert.deepEqual(viewportWorldPoint(60,70,{left:10,top:20},0,0,50),{x:1,y:1});
});
test('halve tekenresolutie verkleint alleen de bitmap en bewaart de afgebeelde wereldcoordinaten',async()=>{
 const {viewportRenderSize}=await import('../presentation.mjs');
 for(const ratio of [1,2]){
  const full=viewportRenderSize(3840,2160,4,ratio),half=viewportRenderSize(3840,2160,4,ratio,.5);
  assert.equal(half.width,Math.floor(full.width/2));assert.equal(half.height,Math.floor(full.height/2));
  assert.equal(half.density,full.density/2);assert.equal(half.scale,full.scale/2);
  // Drawing and camera translation both change density; the CSS position stays equal.
  for(const [world,scroll] of [[0,0],[340,600],[1820,5432]]){
   assert.equal((world*half.scale-scroll*half.density)/half.density,(world*full.scale-scroll*full.density)/full.density);
  }
 }
 assert.deepEqual(viewportRenderSize(3840,2160,4,1,.5),{width:1920,height:1080,density:.5,scale:2});
});
test('kleine resolutiestappen behouden camera en wereldpositie met evenredig minder pixels',async()=>{
 const {viewportRenderSize}=await import('../presentation.mjs');
 for(const factor of [.95,.9,.85,.75]){
  const raster=viewportRenderSize(3840,2160,4,1,factor);
  assert.equal(raster.width,Math.floor(3840*factor));assert.equal(raster.height,Math.floor(2160*factor));
  assert.equal(raster.density,factor);assert.equal(raster.scale,4*factor);
  const cssX=(1820*raster.scale-5432*raster.density)/raster.density;
  assert.ok(Math.abs(cssX-(1820*4-5432))<1e-8);
 }
 assert.equal(viewportRenderSize(3840,2160,4,1,NaN).density,1);
 assert.equal(viewportRenderSize(3840,2160,4,1,2).density,1);
 assert.equal(viewportRenderSize(3840,2160,4,1,.1).density,.5);
});
