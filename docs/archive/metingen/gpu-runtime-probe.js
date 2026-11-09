// Open /tests/performance.html via the PHP server and run this as a DevTools Snippet.
// This creates temporary canvases and an in-memory engine variant, without changing saved levels.
// Timings are CPU submission times. Inspect chrome://gpu separately on the actual target device.
(async () => {
  const report = { date: new Date().toISOString() };
  report.apis = await (async()=>{
const engine=await import('/engine.mjs?v=41'),art=await import('/art.mjs?v=swing-44'),look=await import('/look.mjs?v=7'),terrain=await import('/terrain.mjs?v=3'),presentation=await import('/presentation.mjs?v=5'),levels=await import('/levels.mjs?v=15'),adventure=await import('/adventurers.mjs?v=4'),wonder=await import('/wonderland.mjs?v=3');
await look.loadLook();await terrain.loadTerrain(look.lookSprite('grass'));
const stress=engine.blankLevel(120);for(let x=6;x<116;x++)for(let y=4;y<14;y++)stress.tiles[y][x]=17;
const fixtures=[{name:'Regulier veld 1',level:levels.campaignLevel(0)}, {name:'Maanveld avonturiers',level:adventure.adventureLevel(3)}, {name:'Wonderland veld 1',level:wonder.wonderlandLevel(0)}, {name:'Stress 1100 robots',level:stress}];
const percentile=(values,p)=>[...values].sort((a,b)=>a-b)[Math.min(values.length-1,Math.floor(values.length*p))];
window.gpuResearch={engine,art,presentation,fixtures,percentile};
return {secureContext:isSecureContext,offscreen:typeof OffscreenCanvas!=='undefined',webgpu:!!navigator.gpu,webgpuAdapter:!!(navigator.gpu&&await navigator.gpu.requestAdapter()),webgl2:!!document.createElement('canvas').getContext('webgl2')};})();
  report.measurements = [];
  const measure = async (index, mode) => (async()=>{
 const {engine,art,presentation,fixtures,percentile}=gpuResearch,f=fixtures[index],l=f.level,g=engine.createGame(l);g.player.rainbow=10000;
 const canvas=document.createElement('canvas'),worldW=l.width*32,worldH=l.tiles.length*32,scale=presentation.worldRenderResolution(l.width,l.tiles.length,2);
 const viewport={left:0,right:640,top:0,bottom:512};
 canvas.width=Math.floor((mode==='world'?worldW:640)*scale);canvas.height=Math.floor((mode==='world'?worldH:512)*scale);
 canvas.style.width='640px';document.body.append(canvas);const ctx=canvas.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);
 for(let i=0;i<15;i++)art.drawWorld(ctx,l,{game:g,viewport,time:i/60,grid:false});
 const draws=[],steps=[],effects=[],fx=new presentation.SceneEffects();fx.reset(g);
 for(let i=0;i<60;i++) {
   const t=performance.now();engine.stepGame(g,{},1/120);engine.stepGame(g,{},1/120);steps.push(performance.now()-t);
   const u=performance.now();fx.observe(g);effects.push(performance.now()-u);
   const v=performance.now();art.drawWorld(ctx,l,{game:g,viewport,time:g.time,grid:false,effects:fx});draws.push(performance.now()-v);
   if(i%10===0)await new Promise(r=>requestAnimationFrame(r));
 }
 canvas.remove();return {name:f.name,mode:mode,width:l.width,height:l.tiles.length,enemies:g.enemies.length,bitmap:[canvas.width,canvas.height],scale,
 simulation2StepsMedianMs:percentile(steps,.5),simulation2StepsP95Ms:percentile(steps,.95),effectsMedianMs:percentile(effects,.5),drawSubmitMedianMs:percentile(draws,.5),drawSubmitP95Ms:percentile(draws,.95),frames:draws.length,finalState:g.state};})();
  for (let index=0;index<4;index++) for (const mode of ['world','viewport']) {
    const row = await measure(index,mode); report.measurements.push(row); console.log(row);
  }
  report.initializedWonderland = await (async()=>{
 const {engine,art,percentile,presentation,fixtures}=gpuResearch,wonder=await import('/wonderland.mjs?v=3');const l=fixtures[2].level,g=engine.createGame(l);wonder.prepareWonderlandGame(g,0);g.player.rainbow=10000;
 const c=document.createElement('canvas'),scale=presentation.worldRenderResolution(l.width,l.tiles.length,2);c.width=Math.floor(l.width*32*scale);c.height=Math.floor(l.tiles.length*32*scale);const ctx=c.getContext('2d');ctx.setTransform(scale,0,0,scale,0,0);
 const viewport={left:0,right:640,top:0,bottom:512},steps=[],draws=[];
 for(let i=0;i<15;i++)art.drawWorld(ctx,l,{game:g,viewport,grid:false});
 for(let i=0;i<60;i++){let t=performance.now();engine.stepGame(g,{});engine.stepGame(g,{});steps.push(performance.now()-t);t=performance.now();art.drawWorld(ctx,l,{game:g,viewport,grid:false,time:g.time});draws.push(performance.now()-t);if(i%10===0)await new Promise(r=>requestAnimationFrame(r));}
 return {name:'Wonderland veld 1 met campagne-initialisatie',enemies:g.enemies.length,simulation2StepsMedianMs:percentile(steps,.5),simulation2StepsP95Ms:percentile(steps,.95),drawSubmitMedianMs:percentile(draws,.5),drawSubmitP95Ms:percentile(draws,.95),frames:60,finalState:g.state};})();
  report.cpuExperiment = await (async()=>{
const {engine,fixtures,percentile}=gpuResearch;
// Temporary in-memory module. No source file, server or offline build is changed.
let source=await(await fetch('/engine.mjs')).text();
source=source.replace('seaCurrent, blowSeaEnemies','seaCurrent as originalSeaCurrent, blowSeaEnemies');
source=source.replace(/from '(\.\/[^']+)'/g,(_,path)=>"from '"+new URL(path,location.origin+'/engine.mjs').href+"'");
source+=`\nfunction seaCurrent(game,body,dt,move){
 if(game._probeGeyserTime!==game.time){game._probeGeyserTime=game.time;game._probeHasGeyser=game.enemies.some(e=>e.kind==='geyser');}
 if(game._probeHasGeyser)originalSeaCurrent(game,body,dt,move);
}\n`;
const url=URL.createObjectURL(new Blob([source],{type:'text/javascript'})),candidate=await import(url);URL.revokeObjectURL(url);
function gameWith(mod,n){const g=mod.createGame(fixtures[3].level);g.enemies=g.enemies.slice(0,n);g.player.rainbow=10000;return g;}
const samples=[];
for(const n of [100,300,600,1100]){
 const times={original:[],candidate:[]};
 for(const mod of [engine,candidate]){const warm=gameWith(mod,n);for(let i=0;i<80;i++)mod.stepGame(warm,{});}
 for(let batch=0;batch<5;batch++)for(const name of batch%2?['candidate','original']:['original','candidate']){
  const mod=name==='original'?engine:candidate,g=gameWith(mod,n);for(let i=0;i<10;i++)mod.stepGame(g,{});
  const t=performance.now();for(let i=0;i<30;i++)mod.stepGame(g,{});times[name].push((performance.now()-t)/30);
 }
 samples.push({enemies:n,originalMsPerStep:percentile(times.original,.5),candidateMsPerStep:percentile(times.candidate,.5),batches:5,measuredStepsPerBatch:30});
}
const a=gameWith(engine,1100),b=gameWith(candidate,1100);
for(let i=0;i<120;i++){engine.stepGame(a,{});candidate.stepGame(b,{});}
const normalize=x=>JSON.stringify(x,(key,v)=>key.startsWith('_probe')?undefined:v);
const counts={calls:0,visits:0},g=gameWith(engine,1100),enemies=g.enemies;
g.enemies=new Proxy(enemies,{get(target,key,receiver){if(key!==Symbol.iterator)return Reflect.get(target,key,receiver);return function(){const sea=new Error().stack.includes('seaCurrent');if(sea)counts.calls++;const iterator=target[Symbol.iterator]();return{next(){const r=iterator.next();if(sea&&!r.done)counts.visits++;return r;}};};}});
engine.stepGame(g,{});

return {counts,samples,equalDryStressStateAfter120Steps:normalize(a)===normalize(b),limitation:'Alleen droog robotveld zonder geisers; geen algemene regressie- of gameplayvalidatie.'};})();
  globalThis.braviosGpuReport = report;
  console.log('Resultaat: globalThis.braviosGpuReport', report);
  return report;
})();
