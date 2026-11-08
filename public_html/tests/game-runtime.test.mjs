import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { ResourceScope, ResourcePool } from '../runtime/resource-scope.mjs';
import { GameSessionHost } from '../runtime/game-session.mjs';
import { GameFlow } from '../runtime/game-flow.mjs';
import { projectPoint, unprojectPoint, depthOrder } from '../runtime/projection.mjs';
import { CHARACTER_PROFILES, participantRoster, characterView } from '../characters/roster.mjs';
import { DEFAULT_APPEARANCE, CHARACTER_SHEETS } from '../character-maker.mjs';
import { SMALL_GAME_TYPES, loadGamePack } from '../games/catalog.mjs';
import { collectModules, bundleModules } from '../build/module-graph.mjs';
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const flush=()=>new Promise(resolve=>setImmediate(resolve));

test('scope ruimt listeners en canvas op, ook als één cleanup faalt',()=>{
  const scope=new ResourceScope(),target=new EventTarget(),canvas={width:800,height:440};let taps=0;
  scope.listen(target,'tap',()=>taps++);scope.canvas(canvas);scope.defer(()=>{throw Error('test');});
  target.dispatchEvent(new Event('tap'));assert.equal(taps,1);assert.throws(()=>scope.dispose(),AggregateError);
  target.dispatchEvent(new Event('tap'));assert.equal(taps,1);assert.equal(canvas.width,1);assert.equal(scope.signal.aborted,true);scope.dispose();
  let late=0;scope.defer(()=>late++);assert.equal(late,1);
});

test('gedeelde bitmaps blijven tot de laatste gebruiker en late loads worden opgeruimd',async()=>{
  const pool=new ResourcePool(),a=new ResourceScope(),b=new ResourceScope(),load=deferred();let freed=0,loads=0;
  const acquire=scope=>pool.acquire('hero',()=>{loads++;return load.promise;},()=>freed++,scope);
  const first=acquire(a),second=acquire(b);a.dispose();load.resolve({bitmap:true});
  await assert.rejects(first,/gesloten/);await second;assert.equal(loads,1);assert.equal(freed,0);b.dispose();assert.equal(freed,1);assert.equal(pool.size,0);
  const c=new ResourceScope(),later=deferred();const pending=pool.acquire('new',()=>later.promise,()=>freed++,c);c.dispose();later.resolve({});await assert.rejects(pending,/gesloten/);assert.equal(freed,2);
  const failScope=new ResourceScope();await assert.rejects(pool.acquire('broken',()=>Promise.reject(Error('load')),()=>{},failScope));assert.equal(pool.size,0);failScope.dispose();
});

test('alleen het gekozen spel wordt geladen en stoppen verwijdert actieve state',async()=>{
  const loaded=[],host=new GameSessionHost(id=>{loaded.push(id);return loadGamePack(id);});
  assert.deepEqual(loaded,[]);
  const aim=await host.start('aim');assert.deepEqual(loaded,['aim']);aim.action();assert.equal(aim.state.shots,1);
  const rhythm=await host.start('rhythm',{playerCount:2});assert.equal(aim.state,null);assert.equal(rhythm.state.players.length,2);
  host.stop();assert.equal(rhythm.state,null);assert.equal(host.active,null);host.stop();
  for(const type of SMALL_GAME_TYPES){const session=await host.start(type.id);session.update({},1/60);assert.equal(session.state.kind,type.id);host.stop();}
});

test('annuleren, snelle spelwissels en mislukte async factories lekken geen sessies',async()=>{
  const pending=deferred(),host=new GameSessionHost(id=>id==='slow'?pending.promise:loadGamePack(id));let disposed=0;
  const slow=host.start('slow');const active=await host.start('catch');pending.resolve({createSession(){throw Error('mag niet starten');}});assert.equal(await slow,null);assert.equal(host.active.session,active);
  const creation=deferred(),second=new GameSessionHost(async()=>({createSession:()=>creation.promise}));
  const start=second.start('async');await flush();second.stop();creation.resolve({dispose(){disposed++;}});assert.equal(await start,null);assert.equal(disposed,1);
  const third=new GameSessionHost(async()=>({createSession({scope}){scope.defer(()=>disposed++);throw Error('create');}}));await assert.rejects(third.start('bad'),/create/);assert.equal(disposed,2);assert.equal(third.active,null);host.stop();
});

test('tussenspel bewaart ouder en identiteit en hervat exact één keer bij succes/fout',async()=>{
  const parent={x:123,coins:4,state:'playing'},roster=participantRoster(1,{character:'ravi',appearance:DEFAULT_APPEARANCE});let resumes=0;
  for(const fail of [false,true]){
    const flow=new GameFlow({suspend(){parent.state='paused';return parent;},resume(saved){assert.equal(saved,parent);saved.state='playing';resumes++;},async launch(child){assert.equal(parent.state,'paused');child.participants[0].appearance.name='child';if(fail)throw Error('load');return {outcome:'won',score:3};}});
    if(fail)await assert.rejects(flow.enter({game:'rhythm',participants:roster,origin:{type:'pipe',x:8,y:4}}),/load/);
    else assert.equal((await flow.enter({game:'rhythm',participants:roster})).outcome,'won');
    assert.equal(flow.busy,false);assert.equal(parent.x,123);assert.equal(parent.coins,4);assert.equal(parent.state,'playing');assert.equal(roster[0].appearance.name,DEFAULT_APPEARANCE.name);
  }
  assert.equal(resumes,2);
  const wait=deferred(),flow=new GameFlow({suspend:()=>parent,resume:()=>{},launch:()=>wait.promise});const child=flow.enter({game:'aim'});await assert.rejects(flow.enter({game:'catch'}),/actief/);wait.resolve({outcome:'cancelled'});await child;
});

test('karakterbestanden bestaan en voor bovenaanzicht wordt geen zijaanzicht verzonnen',async()=>{
  for(const profile of Object.values(CHARACTER_PROFILES)){
    await access(new URL('../'+profile.portrait,import.meta.url));
    for(const view of ['side','front']){const variant=characterView({character:profile.id},view);await access(new URL('../'+variant.asset,import.meta.url));assert.equal(variant.frames[variant.frame].length,4);}
    assert.throws(()=>characterView({character:profile.id},'top-down'),/ontbreekt/);
  }
  for(const file of Object.values(CHARACTER_SHEETS))await access(new URL('../'+file,import.meta.url));
  const roster=participantRoster(2,{character:'ravi',appearance:DEFAULT_APPEARANCE});assert.deepEqual(roster.map(p=>p.character),['ravi','boaz']);roster[0].appearance.accessories.push('glasses');assert.equal(DEFAULT_APPEARANCE.accessories.length,0);
  const host=new GameSessionHost(loadGamePack),session=await host.start('rhythm',{playerCount:2,participants:roster});assert.equal(session.state.players[0].character,'ravi');assert.equal(session.state.players[0].appearance.head,DEFAULT_APPEARANCE.head);host.stop();
});

test('bovenaanzicht en schuin bovenaanzicht houden wereldcoördinaten en diepte apart',()=>{
  for(const view of ['top-down','oblique'])for(const point of [{x:0,y:0,height:0},{x:13,y:-22,height:9}]){const back=unprojectPoint(projectPoint(point,view),view,point.height);assert.deepEqual(back,{x:point.x,y:point.y});}
  const actors=[{id:'front',x:1,y:20,height:100},{id:'back',x:1,y:2,height:0}];assert.deepEqual(depthOrder(actors,'oblique').map(a=>a.id),['back','front']);assert.equal(actors[0].id,'front');
});

test('offline modules zijn geïsoleerd en dynamische imports blijven uitgesteld',async()=>{
  const modules=new Map([
    ['main.mjs',"import { value as first } from './one.mjs';\nimport { alias } from './bridge.mjs';\nglobalThis.events.push(first,alias);globalThis.launch=()=>import('./lazy.mjs');"],
    ['one.mjs','export const value=1;'],['bridge.mjs',"export { value as alias } from './one.mjs';"],
    ['lazy.mjs',"const value=7;globalThis.events.push('lazy');\nexport function read(){return value;}"]
  ]);
  const context={events:[]};runInNewContext(bundleModules(modules,'main.mjs'),context);assert.deepEqual(context.events,[1,1]);
  assert.equal((await context.launch()).read(),7);assert.deepEqual(context.events,[1,1,'lazy']);await context.launch();assert.equal(context.events.length,3);
  const graph=await collectModules(new URL('../',import.meta.url));for(const kind of SMALL_GAME_TYPES)assert.ok(graph.has(`games/${kind.id}/game.mjs`));
  assert.ok(!graph.has('small-games.mjs'),'de compatibiliteitslaag mag geen spellen vooraf laden');
  const app=await readFile(new URL('../app.mjs',import.meta.url),'utf8');assert.ok(app.includes("from './games/shell.mjs'"));
});

test('platformadapter behoudt veld, positie en krachten en herstelt de oorspronkelijke pauzestand',async()=>{
  const {createPlatformEncounters}=await import('../games/platformer/encounters.mjs');
  const parent={state:'playing',player:{x:55,y:100,fire:true},coins:8};let active=parent,online=false,released=0,restored=0;
  const wait=deferred();const adapter=createPlatformEncounters({getGame:()=>active,participants:()=>participantRoster(),isOnline:()=>online,release:()=>released++,restore:()=>restored++,launch:()=>wait.promise});
  const pending=adapter.enter('rhythm',{type:'pipe',x:4,y:10});assert.equal(parent.state,'paused');assert.equal(adapter.busy,true);
  wait.resolve({outcome:'won'});await pending;assert.deepEqual(parent,{state:'playing',player:{x:55,y:100,fire:true},coins:8});assert.equal(released,1);assert.equal(restored,1);
  parent.state='paused';await adapter.enter('rhythm');assert.equal(parent.state,'paused');
  online=true;await assert.rejects(adapter.enter('aim'),/online/);assert.equal(released,2);online=false;
  const next=deferred(),replace=createPlatformEncounters({getGame:()=>active,participants:()=>participantRoster(),isOnline:()=>false,release:()=>{},restore:()=>{},launch:()=>next.promise});
  parent.state='playing';const child=replace.enter('aim');active={state:'dead'};next.resolve({outcome:'cancelled'});await child;assert.equal(active.state,'dead');assert.equal(parent.state,'paused');
});

test('echte offline spelpakketten laden en spelen zonder netwerk of platformmodule',async()=>{
  const graph=await collectModules(new URL('../',import.meta.url));
  graph.set('offline-test.mjs',"import { loadGamePack } from './games/catalog.mjs';\nimport { GameSessionHost } from './runtime/game-session.mjs';\nglobalThis.host=new GameSessionHost(loadGamePack);");
  const context={AbortController,URL,location:{href:'file:///tmp/speel.html'}};
  runInNewContext(bundleModules(graph,'offline-test.mjs'),context);
  const aim=await context.host.start('aim');aim.action();assert.equal(aim.state.shots,1);
  const rhythm=await context.host.start('rhythm',{playerCount:2});assert.equal(aim.state,null);rhythm.action(1);rhythm.update({},1/60);assert.ok(rhythm.state.players[1].lift>0);context.host.stop();assert.equal(rhythm.state,null);
});

test('alle offline runtime-modules behouden dezelfde exports als de native modules',async()=>{
  const root=new URL('../',import.meta.url),graph=await collectModules(root);
  const names=[...graph.keys()].filter(name=>name!=='app.mjs');
  graph.set('exports-test.mjs',`globalThis.ready=Promise.all([${names.map(name=>`import('./${name}')`).join(',')}]);`);
  const context={AbortController,URL,location:{href:'file:///tmp/speel.html'}};
  runInNewContext(bundleModules(graph,'exports-test.mjs'),context);
  const offline=await context.ready;
  for(let i=0;i<names.length;i++){
    const native=await import(new URL(names[i],root));
    assert.deepEqual(Object.keys(offline[i]).sort(),Object.keys(native).sort(),names[i]);
  }
});

test('ieder opgesplitst spel tekent met gebalanceerde canvastransformaties',async()=>{
  const {hero,drawTile}=await import('../art.mjs');
  for(const type of SMALL_GAME_TYPES){
    let depth=0,painted=0;
    const context=new Proxy({}, {get(target,key){if(key in target)return target[key];if(key==='createLinearGradient')return ()=>({addColorStop(){}});return (...args)=>{if(key==='save')depth++;if(key==='restore')depth--;if(key==='fillRect'||key==='fill'||key==='drawImage')painted++;};}});
    const pack=await loadGamePack(type.id),session=pack.createSession({services:{hero,drawTile}});
    session.render(context,1200,660);assert.equal(depth,0,type.id);assert.ok(painted>0,type.id);session.dispose();
  }
});
