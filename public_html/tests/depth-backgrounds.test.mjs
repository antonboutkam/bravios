import test from 'node:test';
import assert from 'node:assert/strict';
import { DEPTH_LAYERS, BackgroundRaster, DepthPanelCache, depthLayerOrigin, depthLayerCopies, drawDepthBackground } from '../depth-backgrounds.mjs';
import { drawWorld } from '../art.mjs';
import { blankLevel, createGame, clone, THEMES } from '../engine.mjs';
import { createCoopGame, packCoopGame } from '../coop.mjs';
import { wonderlandLevel, prepareWonderlandGame } from '../wonderland.mjs';
import { drawWonderMagic } from '../wonder-magic.mjs';
function context() {
  let depth=0;const calls=[];
  const target={createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})};
  const ctx=new Proxy(target,{get(t,key){if(key in t)return t[key];return(...args)=>{
    if(key==='save')depth++;if(key==='restore')depth--;
    assert.ok(args.filter(x=>typeof x==='number').every(Number.isFinite),String(key));calls.push([key,...args]);
  };},set(t,key,value){t[key]=value;return true;}});
  return {ctx,calls,get depth(){return depth;}};
}
function cacheFixture(scale=1) {
  const canvases=[];
  const cache=new DepthPanelCache(scale,()=>{
    const recording=context(),canvas={width:0,height:0,getContext:()=>recording.ctx,recording};
    recording.ctx.isContextLost=()=>false;
    canvases.push(canvas);return canvas;
  });
  return {cache,canvases};
}
function backgroundFixture() {
  const canvases=[];
  const raster=new BackgroundRaster(()=>{
    const recording=context(),canvas={width:0,height:0,getContext:()=>recording.ctx,recording};
    recording.ctx.isContextLost=()=>false;canvases.push(canvas);return canvas;
  });
  return {raster,canvases};
}
test('halve achtergrondresolutie bewaart het volledige voorgrondcanvas en beide camera-assen',()=>{
  const {raster,canvases}=backgroundFixture(),main=context();
  main.ctx.canvas={width:3832,height:1977};
  main.ctx.getTransform=()=>({a:4,b:0,c:0,d:4,e:-3200,f:-1600});
  let draws=0;
  assert.equal(raster.draw(main.ctx,bg=>{draws++;bg.fillRect(800,400,32,32);}),true);
  assert.equal(draws,1);assert.deepEqual([canvases[0].width,canvases[0].height],[1916,988]);
  assert.deepEqual(main.ctx.canvas,{width:3832,height:1977});
  assert.ok(canvases[0].recording.calls.some(c=>c[0]==='setTransform'&&c[1]===2&&c[4]===4*988/1977&&c[5]===-1600&&c[6]===-1600*988/1977));
  assert.deepEqual(main.calls.map(c=>c[0]),['save','setTransform','drawImage','restore']);
  assert.deepEqual(main.calls[2].slice(2),[0,0,3832,1977]);
  raster.draw(main.ctx,()=>{});assert.equal(canvases.length,1);
  assert.equal(main.depth,0);assert.equal(canvases[0].recording.depth,0);
  raster.dispose();assert.equal(canvases[0].width,0);assert.equal(canvases[0].height,0);
});
test('achtergrondbitmap blijft begrensd en een allocatiefout laat de voorgrond intact',()=>{
  const main=context(),{raster,canvases}=backgroundFixture();
  main.ctx.canvas={width:16000,height:16000};main.ctx.getTransform=()=>({a:4,b:0,c:0,d:4,e:0,f:0});
  raster.draw(main.ctx,()=>{});assert.ok(canvases[0].width*canvases[0].height<=2*1024*1024);
  raster.dispose();
  let attempts=0,painted=false;
  const broken=new BackgroundRaster(()=>{attempts++;throw new Error('geen bitmap');});
  assert.equal(broken.draw(main.ctx,()=>{painted=true;}),false);
  assert.equal(broken.draw(main.ctx,()=>{painted=true;}),false);
  assert.equal(attempts,1);assert.equal(painted,false);assert.equal(main.depth,0);
  main.ctx.canvas.width=1000;broken.draw(main.ctx,()=>{});assert.equal(attempts,2);
});
test('35 en 25 procent verlagen alleen de achtergrond en behouden het voorgrondformaat',()=>{
  const {raster,canvases}=backgroundFixture(),main=context();
  main.ctx.canvas={width:3840,height:2160};main.ctx.getTransform=()=>({a:4,b:0,c:0,d:4,e:-800,f:-400});
  for(const scale of [.5,.35,.25]){
    raster.resolutionScale=scale;assert.equal(raster.draw(main.ctx,()=>{}),true);
    assert.deepEqual([canvases[0].width,canvases[0].height],[Math.floor(3840*scale),Math.floor(2160*scale)]);
    assert.deepEqual(main.ctx.canvas,{width:3840,height:2160});
    assert.equal(canvases.length,1);
  }
  assert.equal(main.depth,0);raster.dispose();
});
test('alleen decor gaat naar het halve tekenvlak; tegels blijven op de voorgrond en spelstand gelijk',()=>{
  for(const mode of ['grass','wonder','cave']) {
    const level=mode==='wonder'?wonderlandLevel(0):blankLevel(40);
    const game=mode==='wonder'?prepareWonderlandGame(createGame(level),0):createGame(level);
    if(mode==='cave')game.caveState={...game.caveState,active:0};
    const before=clone(game),original=clone(level),main=context(),baseline=context(),{raster,canvases}=backgroundFixture();
    main.ctx.canvas={width:2560,height:2048};main.ctx.getTransform=()=>({a:4,b:0,c:0,d:4,e:0,f:0});
    const options={game,grid:false,viewport:{left:0,right:640,top:0,bottom:512}};
    drawWorld(baseline.ctx,level,options);drawWorld(main.ctx,level,{...options,backgroundRaster:raster});
    const tileCalls=c=>c.calls.filter(([op,x,y])=>op==='translate'&&x%32===0&&y>0&&y%32===0);
    assert.deepEqual(tileCalls(main),tileCalls(baseline),mode);
    const blit=main.calls.findIndex(c=>c[0]==='drawImage'&&c[1]===canvases[0]);
    const tile=main.calls.findIndex(([op,x,y])=>op==='translate'&&x%32===0&&y>0&&y%32===0);
    assert.ok(blit>=0&&tile>blit,mode);
    assert.equal(tileCalls(canvases[0].recording).length,0,mode);
    assert.equal(main.depth,0);assert.equal(canvases[0].recording.depth,0);
    assert.deepEqual(clone(game),before);assert.deepEqual(level,original);raster.dispose();
  }
});
test('de optionele achtergrondcache hergebruikt drie lagen bij camerabeweging en behoudt parallax',()=>{
  const {cache,canvases}=cacheFixture(1977/512),first=context(),second=context();
  drawDepthBackground(first.ctx,512,'grass',{left:0,right:1024,camera:0,panelCache:cache});
  assert.equal(canvases.length,3);
  assert.ok(canvases.every(c=>c.width===Math.ceil(768*1977/512)&&c.height===1977));
  const commands=canvases.map(c=>c.recording.calls.length);
  drawDepthBackground(second.ctx,512,'grass',{left:100,right:1124,camera:100,panelCache:cache});
  assert.equal(canvases.length,3);
  assert.deepEqual(canvases.map(c=>c.recording.calls.length),commands);
  for(let i=0;i<3;i++) {
    const copies=second.calls.filter(c=>c[0]==='drawImage'&&c[1]===canvases[i]);
    assert.deepEqual(copies.map(c=>c[2]),depthLayerCopies(100,1124,100,DEPTH_LAYERS[i]));
    assert.ok(copies.every(c=>c[3]===0&&c[4]===768&&c[5]===512));
  }
  assert.ok(cache.pixels<=24*1024*1024);
  cache.dispose();assert.equal(cache.pixels,0);assert.ok(canvases.every(c=>c.width===0&&c.height===0));
});
test('de achtergrondcache bewaart slechts een thema/formaat en weigert te grote bitmaps',()=>{
  const {cache,canvases}=cacheFixture();
  cache.get('grass',0,512);cache.get('moon',0,512);
  assert.equal(canvases[0].width,0);assert.equal(canvases[0].height,0);
  cache.get('moon',0,1024);assert.equal(canvases[1].width,0);
  cache.scale=2;cache.get('moon',0,1024);assert.equal(canvases[2].width,0);
  const count=canvases.length;
  cache.scale=10;assert.throws(()=>cache.get('moon',0,2048),/bitmaplimiet/);
  assert.equal(canvases.length,count);
  assert.throws(()=>cache.get('moon',9,512),/Ongeldig/);
  cache.dispose();
});
test('de game valt bij een onbruikbare cache terug op vectoren zonder elke frame opnieuw te alloceren',()=>{
  let attempts=0;
  const cache=new DepthPanelCache(1,()=>{attempts++;throw new Error('geen canvas beschikbaar');});
  const fallback={get:(...args)=>cache.getOrNull(...args)};
  const actual=context(),expected=context();
  drawDepthBackground(actual.ctx,512,'grass',{left:0,right:640,panelCache:fallback});
  drawDepthBackground(expected.ctx,512,'grass',{left:0,right:640});
  assert.deepEqual(actual.calls,expected.calls);assert.equal(attempts,1);assert.equal(cache.pixels,0);
  drawDepthBackground(context().ctx,512,'grass',{left:100,right:740,camera:100,panelCache:fallback});
  assert.equal(attempts,1);
  cache.dispose();cache.getOrNull('grass',0,512);assert.equal(attempts,2);
});
test('een geweigerde gamecache kan na een kleinere tekenresolutie weer worden opgebouwd',()=>{
  const {cache,canvases}=cacheFixture(10);
  assert.equal(cache.getOrNull('moon',0,2048),null);assert.equal(canvases.length,0);
  cache.scale=1;
  assert.ok(cache.getOrNull('moon',0,2048));assert.equal(cache.failedRequest,null);
  cache.dispose();
});
test('de cacheproef bereikt gewone velden en Wonderland zonder spelstand te wijzigen',()=>{
  for(const wonder of [false,true]) {
    const level=wonder?wonderlandLevel(0):blankLevel(40);
    const game=wonder?prepareWonderlandGame(createGame(level),0):createGame(level);
    const before=clone(game),original=clone(level),{cache,canvases}=cacheFixture(),c=context();
    drawWorld(c.ctx,level,{game,grid:false,depthPanelCache:cache,viewport:{left:0,right:640,top:0,bottom:512}});
    assert.equal(canvases.length,3);assert.ok(c.calls.some(call=>call[0]==='drawImage'&&canvases.includes(call[1])));
    assert.deepEqual(clone(game),before);assert.deepEqual(level,original);assert.equal(c.depth,0);
    cache.dispose();
  }
});
test('Wonderlanddecor ligt achter overlappende blokken en blijft uit de interactieve tekenlaag',()=>{
  for(const area of ['forest','sea','crystal','chess']) {
    const level=wonderlandLevel(0),game=prepareWonderlandGame(createGame(level),0);
    game.wonderland.area=area;game.tiles[14][7]=13;
    const isDecor=area==='chess'?c=>c[0]==='fillText'&&c[1]==='♜'&&c[2]===224&&c[3]===471:
      area==='crystal'?c=>c[0]==='moveTo'&&c[1]===224&&c[2]===406:
      c=>c[0]==='ellipse'&&c[1]===224&&c[2]===466&&c[3]===39;
    const c=context(),before=clone(game);
    drawWorld(c.ctx,level,{game,viewport:{left:160,right:800},grid:false});
    const scenery=c.calls.findIndex(isDecor),block=c.calls.findIndex(c=>c[0]==='translate'&&c[1]===224&&c[2]===448);
    assert.ok(scenery>=0,`${area}: decor is aanwezig`);assert.ok(block>=0);
    assert.ok(scenery<block,`${area}: eerst decor, daarna het blok`);
    const foreground=context();drawWonderMagic(foreground.ctx,game);
    assert.equal(foreground.calls.some(isDecor),false,`${area}: decor wordt niet opnieuw over de blokken getekend`);
    assert.deepEqual(clone(game),before);assert.equal(c.depth,0);
  }
});
test('hoge velden tekenen alleen zichtbare tegelrijen met ruimte voor uitstekende afbeeldingen',()=>{
  const level=blankLevel(40,64);
  level.tiles.forEach(row=>{row.fill(0);row[9]=13;});
  level.tiles[60][2]=10; level.tiles[60][38]=11;
  const game=createGame(level),before=clone(game);
  const rows = viewport => {
    const c=context(); drawWorld(c.ctx,level,{game,viewport,grid:false});
    assert.equal(c.depth,0);
    return c.calls.filter(([name,x,y])=>name==='translate'&&x===9*32&&y%32===0).map(([,x,y])=>y/32);
  };
  assert.deepEqual(rows({left:0,right:640}),Array.from({length:64},(_,i)=>i));
  assert.deepEqual(rows({left:0,right:640,top:800,bottom:1120}),Array.from({length:17},(_,i)=>22+i));
  assert.deepEqual(rows({left:0,right:640,top:0,bottom:320}),Array.from({length:14},(_,i)=>i));
  assert.deepEqual(rows({left:0,right:640,top:1728,bottom:2048}),Array.from({length:13},(_,i)=>51+i));
  assert.deepEqual(clone(game),before);
});
test('drie decorlagen bewegen op verschillende schermsnelheden en minder beweging maakt ze wereldvast',()=>{
  assert.deepEqual(DEPTH_LAYERS.map(l=>l.id),['far','middle','near']);
  const movement=DEPTH_LAYERS.map(l=>depthLayerOrigin(100,l)-100);
  assert.ok(Math.abs(movement[0])<Math.abs(movement[1]));assert.ok(Math.abs(movement[1])<Math.abs(movement[2]));
  for(const layer of DEPTH_LAYERS){assert.equal(depthLayerOrigin(100,layer,true),0);assert.equal(depthLayerOrigin(200,layer,true),0);}
});
test('de laagproef behoudt de lucht en hemellichamen en schakelt alleen de drie panelagen uit',()=>{
  for(const theme of [...Object.keys(THEMES),'wonder-forest','wonder-chess','wonder-sea','wonder-crystal']) {
    const normal=context(),without=context(),options={left:100,right:740,camera:123};
    drawDepthBackground(normal.ctx,512,theme,options);
    drawDepthBackground(without.ctx,512,theme,{...options,layers:false});
    const firstPanel=normal.calls.findIndex(call=>call[0]==='rect');
    assert.ok(firstPanel>0);
    // A panel starts with save/beginPath/rect; everything before it is the same sky.
    assert.deepEqual(without.calls.slice(0,-1),normal.calls.slice(0,firstPanel-2));
    assert.equal(without.calls.at(-1)[0],'restore');
    assert.equal(without.depth,0);assert.equal(normal.depth,0);
  }
});
test('de laagproef bereikt gewone velden en Wonderland zonder tegels of spelstand te veranderen',()=>{
  for(const wonder of [false,true]) {
    const level=wonder?wonderlandLevel(0):blankLevel(40);
    const game=wonder?prepareWonderlandGame(createGame(level),0):createGame(level);
    const before=clone(game),original=clone(level),normal=context(),without=context();
    const options={game,grid:false,viewport:{left:0,right:640,top:0,bottom:512}};
    drawWorld(normal.ctx,level,options);drawWorld(without.ctx,level,{...options,depthLayers:false});
    assert.ok(normal.calls.filter(c=>c[0]==='clip').length>without.calls.filter(c=>c[0]==='clip').length);
    const tiles=c=>c.calls.filter(([op,x,y])=>op==='translate'&&x%32===0&&y>0&&y%32===0);
    assert.deepEqual(tiles(normal),tiles(without));
    assert.deepEqual(clone(game),before);assert.deepEqual(level,original);assert.equal(without.depth,0);
  }
});
test('zichtbare decorpanelen sluiten aan zonder gaten, ook bij teruglopen en aan paneelgrenzen',()=>{
  for(const camera of [0,1,767,768,769,5000])for(const layer of DEPTH_LAYERS)for(const reduced of [false,true]){
    const left=Math.max(0,camera-96),right=camera+640+96,copies=depthLayerCopies(left,right,camera,layer,reduced);
    assert.ok(copies[0]<=left);assert.ok(copies.at(-1)+768>=right);assert.ok(copies.length<=3);
    for(let i=1;i<copies.length;i++)assert.ok(Math.abs(copies[i]-copies[i-1]-768)<1e-8);
  }
});
test('decor tekent overhangende buren eenmaal met een gedeelde viewportclip',()=>{
  const c=context();
  drawDepthBackground(c.ctx,512,'grass',{left:0,right:1024,camera:0});
  // The left neighbour contains mountain/tree overhangs inside the viewport.
  const origins=c.calls.filter(call=>call[0]==='translate').map(call=>call[1]);
  assert.deepEqual(origins,[-768,0,768,-768,0,768,-768,0,768]);
  assert.equal(c.calls.filter(call=>call[0]==='clip').length,1);
  assert.ok(c.calls.some(call=>call[0]==='rect'&&call[1]===0&&call[3]===1024&&call[4]===512));
  // Previously 512 paint operations: each panel repainted both neighbours.
  const paints=c.calls.filter(call=>['fill','fillRect','stroke'].includes(call[0])).length;
  assert.ok(paints<300,`onnodig herhaald tekenwerk: ${paints}`);
  assert.equal(c.depth,0);
});
test('alle omgevingen en Wonderland hebben eindige tekenwaarden en herstellen de canvasstatus',()=>{
  for(const theme of [...Object.keys(THEMES),'wonder-forest','wonder-chess','wonder-sea','wonder-crystal'])for(const height of [280,512,1024,2048]){
    const c=context();drawDepthBackground(c.ctx,height,theme,{left:4000,right:4640,camera:4096});assert.equal(c.depth,0);assert.ok(c.calls.length>20);
  }
});
test('tekenen verandert geen level, spelstand of samenspelgegevens',()=>{
  const level=blankLevel(72);level.tiles[6][10]=99;level.tiles[11][15]=100;
  for(const game of [createGame(level),createCoopGame(level)]){
    const before=clone(game),original=clone(level),c=context();
    for(const left of [0,700,1400,700,0])drawWorld(c.ctx,level,{game,viewport:{left,right:left+640},reducedMotion:false});
    assert.deepEqual(clone(game),before);assert.deepEqual(level,original);assert.equal(c.depth,0);
    if(game.players)assert.deepEqual(packCoopGame(game),packCoopGame(before));
  }
  const l=wonderlandLevel(0),game=prepareWonderlandGame(createGame(l),0),before=clone(game),c=context();
  drawWorld(c.ctx,l,{game,viewport:{left:1000,right:1640},reducedMotion:true});assert.deepEqual(clone(game),before);assert.equal(c.depth,0);
});
test('decor maakt geen grote rasterpanelen en blijft beperkt tot het zichtbare cameravenster',()=>{
 const previous=globalThis.OffscreenCanvas;
 globalThis.OffscreenCanvas=class{constructor(){throw new Error('geen achtergrondbitmaps aanmaken');}};
 try{
  for(const height of [512,1024,2048]){
   const near=context(),far=context();
   drawDepthBackground(near.ctx,height,'moon',{left:0,right:640,camera:0});
   drawDepthBackground(far.ctx,height,'moon',{left:200000,right:200640,camera:200000});
   assert.ok(far.calls.length<near.calls.length*2);assert.equal(far.depth,0);
   assert.equal(far.calls.filter(c=>c[0]==='drawImage').length,0);
  }
 }finally{if(previous===undefined)delete globalThis.OffscreenCanvas;else globalThis.OffscreenCanvas=previous;}
});
