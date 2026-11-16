import test, { afterEach } from 'node:test';
import { movement3D } from '../games/platformer3d/input.mjs';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { characters3D, enemies3D, requires3D, canEnter3D } from '../games/platformer3d/access.mjs';
import { createLevel3D, validateLevel3D, assertPlayable3D } from '../games/platformer3d/level.mjs';
import { createGame3D as makeGame3D, stepGame3D, BODY_3D, initializePhysics3D, disposeGame3D } from '../games/platformer3d/model.mjs';
import { createWorld, addWorldNode, configureWorldNode, saveWorldNodeLevel, validateWorld } from '../worlds.mjs';
import { model3DConfig } from '../games/platformer3d/assets.mjs';
import { verifyModel3D } from '../../../scripts/verify-3d-model.mjs';
import { collectModules, bundleModules } from '../build/module-graph.mjs';
await initializePhysics3D(await readFile(new URL('../games/platformer3d/vendor/HavokPhysics.wasm',import.meta.url)));
const games=[];
const createGame3D=(...args)=>{const game=makeGame3D(...args);games.push(game);return game;};
afterEach(()=>{for(const game of games.splice(0))disposeGame3D(game);});
const identity={character:'boaz'};
const clone=value=>JSON.parse(JSON.stringify(value));
function flat(){const level=createLevel3D();level.objects=[{id:'ground',type:'block',x:0,y:0,z:0,w:24,h:1,d:24},{id:'start',type:'start',x:2,y:1,z:3},{id:'finish',type:'finish',x:21,y:1,z:3}];return level;}
const tick=(game,input={},n=1)=>{for(let i=0;i<n;i++)stepGame3D(game,input,1/60);};
test('3D capability requires registered GLB, rejects custom appearance and unknown characters',()=>{
 assert.ok(['boaz','ravi'].every(id=>characters3D().some(p=>p.id===id)));
 assert.ok(characters3D().every(p=>p.model3d.file.endsWith('/3d/model.glb')));
 assert.equal(canEnter3D(identity),true);assert.equal(canEnter3D({character:'pixel'}),false);
 assert.equal(canEnter3D({character:'boaz',appearance:{name:'Eigen held'}}),false);
 assert.equal(canEnter3D({character:'missing'}),false);
 assert.throws(()=>createGame3D(createLevel3D(),{character:'pixel'}),/3D-model/);
 assert.throws(()=>model3DConfig({file:'../other.glb'},'hero/'));
});
test('registered heroes and enemy have actual self-contained mesh files and animations',async()=>{
 for(const profile of [...characters3D(),...enemies3D()]){
   const file=new URL('../../'+profile.model3d.file,import.meta.url),folder=new URL('./',new URL('../',file));
   const gltf=await verifyModel3D(file,folder);assert.ok(gltf.meshes.length);assert.ok(gltf.animations.some(a=>a.name==='run'));
 }
});
test('mixed worlds preserve 3D data through export/import and restrict the whole world',()=>{
 const w=createWorld('Gemengd'),a=addWorldNode(w,100,100),b=addWorldNode(w,300,100);
 configureWorldNode(w,a.id,{name:'2D',theme:'grass',width:40,height:16});assert.equal(requires3D(w),false);
 configureWorldNode(w,b.id,{name:'3D',theme:'grass',width:24,height:16,depth:24,kind:'platformer3d'});
 assert.equal(requires3D(w),true);assert.deepEqual(validateWorld(clone(w)),w);
 w.completed=[a.id,b.id];const draft=clone(b.level);draft.objects[0].w=7;saveWorldNodeLevel(w,b.id,draft);assert.deepEqual(w.completed,[a.id]);
 draft.objects[0].w=1;assert.equal(b.level.objects[0].w,7);
 assert.throws(()=>configureWorldNode(w,b.id,{name:'verlies',theme:'grass',width:40,height:16}),/nieuw veld/);
});
test('import refuses enemies without 3D models, invalid geometry and duplicate starts',()=>{
 const level=createLevel3D(),enemy=level.objects.find(o=>o.type==='enemy');assert.ok(enemy);
 enemy.enemy='game/turtle';assert.throws(()=>validateLevel3D(level),/3D-model/);
 for(const change of [l=>l.objects[0].x=NaN,l=>l.objects[0].w=-1,l=>l.objects[0].w=100,l=>l.objects.push({...l.objects[0]}),l=>l.objects.push({...l.objects.find(o=>o.type==='start'),id:'second-start'})]){
   const l=createLevel3D();change(l);assert.throws(()=>validateLevel3D(l));
 }
});
test('editor can save unfinished levels; play requires free start and finish markers',()=>{
 const level=flat();level.objects=level.objects.filter(o=>o.type!=='finish');assert.doesNotThrow(()=>validateLevel3D(level));assert.throws(()=>assertPlayable3D(level));
 level.objects.push({id:'finish',type:'finish',x:10,y:1,z:3},{id:'wall',type:'block',x:2,y:1,z:3,w:1,h:3,d:1});assert.throws(()=>assertPlayable3D(level),/ruimte/);
});
test('gravity lands on platforms, jumping needs a new edge, movement has diagonal speed cap',()=>{
 const game=createGame3D(flat(),identity);tick(game,{},20);assert.ok(Math.abs(game.player.y-1)<.03);assert.equal(game.player.grounded,true);
 tick(game,{jump:true});assert.ok(game.player.y>1);tick(game,{jump:true},80);assert.ok(Math.abs(game.player.y-1)<.03);
 tick(game,{},1);tick(game,{jump:true});assert.ok(game.player.y>1);
 const straight=createGame3D(flat(),identity),diagonal=createGame3D(flat(),identity);
 tick(straight,{x:1},60);tick(diagonal,{x:1,z:1},60);
 assert.ok(Math.abs(Math.hypot(diagonal.player.x-2.5,diagonal.player.z-3.5)-(straight.player.x-2.5))<1e-6);
});
test('walls block horizontal movement and ceilings stop an upward jump',()=>{
 const l=flat();l.objects.push({id:'wall',type:'block',x:5,y:1,z:0,w:1,h:5,d:8},{id:'ceiling',type:'block',x:1,y:3,z:2,w:3,h:1,d:3});
 const g=createGame3D(l,identity);tick(g,{},3);tick(g,{jump:true},10);assert.ok(g.player.y+BODY_3D.height<=3.001);tick(g,{x:1},120);assert.ok(g.player.x<=5-BODY_3D.radius+.001);
});
test('coins collect once, finishing and falling have distinct outcomes, saved level stays unchanged',()=>{
 const l=flat();l.objects.push({id:'coin',type:'coin',x:3,y:1,z:3});const saved=clone(l),g=createGame3D(l,identity);
 tick(g,{x:1},230);assert.equal(g.state,'won');assert.equal(g.coins,1);assert.deepEqual(l,saved);
 const falling=createGame3D(createLevel3D(),identity);tick(falling,{z:-1},240);assert.equal(falling.state,'dead');
});
test('3D enemies patrol, turn at edges, hurt from the side and can be stomped',()=>{
 const l=flat();l.objects.push({id:'foe',type:'enemy',enemy:enemies3D()[0].key,x:8,y:1,z:3});
 const g=createGame3D(l,identity);tick(g,{},300);assert.ok(Math.abs(g.enemies[0].x-8.5)<=2.01);
 const e=g.enemies[0];Object.assign(g.player,{x:e.x,y:1.9,z:e.z,vy:-5});tick(g,{},8);assert.equal(e.alive,false);assert.equal(g.state,'playing');
 const hurt=createGame3D(l,identity);Object.assign(hurt.player,{x:8.5,y:1,z:3.5});tick(hurt);assert.equal(hurt.state,'dead');
});
test('sample route can be completed with ordinary movement and two jumps',()=>{
 const g=createGame3D(createLevel3D(),identity);tick(g,{},2);
 // Start at x=4.5; stop just before each ledge, then jump toward the next island.
 tick(g,{x:1},60);assert.ok(g.player.x>9.4);tick(g,{x:1,jump:true},40);tick(g,{x:1},18);
 assert.equal(g.state,'playing');assert.ok(Math.abs(g.player.y-2)<.03);
 tick(g,{x:1,jump:true},40);tick(g,{x:1},28);assert.equal(g.state,'won');
});
test('3D modules compile into the offline bundle, with deferred vendor loading',async()=>{
 const root=new URL('../',import.meta.url),modules=await collectModules(root,['games/platformer3d/model.mjs']);
 modules.set('check-3d.mjs',"import { createLevel3D } from './games/platformer3d/level.mjs';\nglobalThis.kind=createLevel3D().kind;");
 const context={URL,location:{href:'file:///test/speel.html'}};runInNewContext(bundleModules(modules,'check-3d.mjs'),context);assert.equal(context.kind,'platformer3d');
 const renderModules=await collectModules(root,['games/platformer3d/shell.mjs']);assert.ok(renderModules.has('games/platformer3d/vendor/babylon.mjs'));assert.doesNotThrow(()=>new Function(bundleModules(renderModules,'games/platformer3d/shell.mjs')));
});

test('keyboard and touch movement remain finite without a connected gamepad',()=>{
 const none=new Set();assert.deepEqual(movement3D(new Set(['ArrowRight']),none,{status:'waiting'}),{x:1,z:0});
 assert.deepEqual(movement3D(none,new Set(['up'])),{x:0,z:-1});
 assert.deepEqual(movement3D(none,none,{navigation:{left:true,down:true}}),{x:-1,z:1});
 assert.deepEqual(movement3D(none,none),{x:0,z:0});
 const game=createGame3D(flat(),identity);tick(game,movement3D(new Set(['KeyD']),none),20);assert.ok(game.player.x>3);
});

test('idle 3D views render only after a change and animated views respect the frame budget',async()=>{
 const {RenderBudget3D,renderSize3D}=await import('../games/platformer3d/render-budget.mjs');
 const idle=new RenderBudget3D();assert.equal(idle.take(0),true);for(let t=1;t<1000;t++)assert.equal(idle.take(t),false);
 idle.invalidate();assert.equal(idle.take(1000),true);assert.equal(idle.take(1001),false);
 for(const software of [false,true]){const b=new RenderBudget3D(software);let count=0;for(let t=0;t<1000;t++)if(b.take(t,true))count++;assert.ok(count<=(software?15:30));}
 assert.deepEqual(renderSize3D(3840,2160),{width:1280,height:720});assert.deepEqual(renderSize3D(3840,2160,true),{width:640,height:360});
});

test('the home example reuses its saved world and preserves edits and completion',async()=>{
 const {getOrCreateExampleWorld3D}=await import('../worlds.mjs');const worlds=[];
 const first=getOrCreateExampleWorld3D(worlds),node=first.nodes.find(n=>n.level?.kind==='platformer3d');node.level.name='Mijn aangepaste tuinen';first.completed.push(node.id);
 assert.equal(getOrCreateExampleWorld3D(worlds),first);assert.equal(worlds.length,1);assert.equal(node.level.name,'Mijn aangepaste tuinen');assert.deepEqual(validateWorld(clone(first)),first);
});

 test('disposing or restarting 3D games releases Babylon scenes and physics worlds',async()=>{
 const {library}=await import('../games/platformer3d/vendor/babylon.mjs');const before=library.Engine.Instances.length;
 for(let i=0;i<5;i++){const game=createGame3D(flat(),identity);tick(game,{},4);disposeGame3D(game);disposeGame3D(game);}
 assert.equal(library.Engine.Instances.length,before);
 });
