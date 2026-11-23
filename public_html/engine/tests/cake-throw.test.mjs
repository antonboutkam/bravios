import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createCakeGame, stepCakeGame, throwCake, CAKE_RULES } from '../games/cake-throw/model.mjs';
import { createSession } from '../games/cake-throw/game.mjs';
import { createCakeStage } from '../games/cake-throw/render.mjs';
import { library } from '../games/platformer3d/vendor/babylon.mjs';
import { ResourceScope } from '../runtime/resource-scope.mjs';
const advance=(game,seconds,input={})=>{for(let i=0;i<Math.ceil(seconds*120);i++)stepCakeGame(game,input,1/120);};

test('twee bakkerskarren vullen aan; oppakken vereist dichtbij staan en houdt de draaglimiet vast',()=>{
 const game=createCakeGame(2);advance(game,1);assert.deepEqual(game.players.map(p=>p.cakes),[0,0]);
 game.players[0].x=-7.2;game.players[1].x=7.2;advance(game,1);
 assert.deepEqual(game.players.map(p=>p.cakes),[2,2]);assert.deepEqual(game.carts.map(c=>c.stock),[1,1]);
 advance(game,10);assert.deepEqual(game.carts.map(c=>c.stock),[3,3]);assert.deepEqual(game.players.map(p=>p.cakes),[2,2]);
 game.paused=true;const before=JSON.stringify(game);advance(game,5);assert.equal(JSON.stringify(game),before);
});
test('een worp raakt eenmaal, verbruikt een taart en richt op de plek bij het gooien',()=>{
 const game=createCakeGame(2);assert.equal(throwCake(game),false);game.players[0].cakes=2;
 assert.equal(throwCake(game),true);assert.equal(throwCake(game),false);advance(game,1);
 assert.equal(game.players[0].score,1);assert.equal(game.players[0].cakes,1);assert.equal(game.cakes.length,0);
 advance(game,2);assert.equal(game.players[0].score,1);
 const dodge=createCakeGame(2);dodge.players[0].cakes=1;throwCake(dodge);advance(dodge,2,{players:[{},{down:true}]});
 assert.equal(dodge.players[0].score,0);assert.equal(dodge.players[1].score,0);assert.equal(dodge.cakes.length,0);
});
test('beide spelers kunnen uitwijken en blijven op hun eigen helft; diagonaal lopen versnelt niet',()=>{
 const game=createCakeGame(2);advance(game,10,{players:[{right:true,up:true},{left:true,down:true}]});
 assert.equal(game.players[0].x,-1.7);assert.equal(game.players[1].x,1.7);assert.equal(game.players[0].z,-4.4);assert.equal(game.players[1].z,4.4);
 const straight=createCakeGame(2),diagonal=createCakeGame(2);advance(straight,.1,{right:true});advance(diagonal,.1,{right:true,down:true});
 assert.ok(Math.abs(Math.hypot(diagonal.players[0].x+5,diagonal.players[0].z)-(straight.players[0].x+5))<1e-6);
});
test('computer haalt zelf taarten en gooit; solo verlies en scoregrens stoppen de simulatie',()=>{
 const game=createCakeGame(1,[],()=>.5);advance(game,30);assert.equal(game.state,'over');assert.equal(game.winner,1);assert.equal(game.players[1].score,CAKE_RULES.target);
 const before=JSON.stringify(game);advance(game,5);assert.equal(JSON.stringify(game),before);assert.equal(throwCake(game,1),false);
 const won=createCakeGame(2);won.players[0].score=6;won.players[0].cakes=1;throwCake(won);advance(won,1);assert.equal(won.state,'won');assert.equal(won.winner,0);
});
test('de tijdslimiet bepaalt winst of gelijkspel en voorkomt een eindeloze ronde',()=>{
 for(const [scores,expected,winner] of [[[0,0],'draw',null],[[2,1],'won',0],[[1,2],'won',1]]){
  const game=createCakeGame(2);game.players.forEach((p,i)=>p.score=scores[i]);game.time=89.99;advance(game,.1);assert.equal(game.state,expected);assert.equal(game.winner,winner);
 }
});
test('sessie ondersteunt twee eigen toetsenbordinvoeren, controllers, aanraking, pauze en veilige afsluiting',()=>{
 const session=createSession({playerCount:2}),event=code=>({code,repeat:false});
 session.key(event('KeyW'),true);session.key(event('ArrowDown'),true);session.update({},.2);
 assert.ok(session.state.players[0].z<0);assert.ok(session.state.players[1].z>0);
 session.pause();const time=session.state.time;session.update({players:[{right:true},{left:true}]},1);assert.equal(session.state.time,time);
 session.togglePause();const z=session.state.players.map(p=>p.z);session.update({},.1);assert.deepEqual(session.state.players.map(p=>p.z),z,'pauze wist oude toetsen');
 session.control(1,'right',true);session.update({},.1);session.control(1,'right',false);assert.ok(session.state.players[1].x>5);assert.equal(session.state.players[0].x,-5);
 session.state.players.forEach(p=>p.cakes=1);session.key(event('Space'),true);session.key(event('Enter'),true);assert.deepEqual(session.state.cakes.map(c=>c.owner),[0,1]);
 session.dispose();assert.equal(session.state,null);session.dispose();
 assert.throws(()=>createSession({participants:[{character:'pixel'}]}),/3D-model/);
});
test('een geannuleerde modelload ruimt het eigen 3D-beeld direct op en kan niets heropenen',async()=>{
 let finish,disposed=0,painted=0;const scope=new ResourceScope();
 const session=createSession({scope,services:{createCakeStage:()=>({prepare:()=>new Promise(resolve=>{finish=resolve;}),draw(){painted++;},dispose(){disposed++;}})}});
 const pending=session.mount({});session.dispose();scope.dispose();finish();await pending;
 assert.equal(session.state,null);assert.equal(painted,0);assert.ok(disposed>=1);
});
test('echte Babylon-scène laadt beide GLB-personages, karretjes en taarten en ruimt alle scènes op',async t=>{
 const original=globalThis.fetch;t.mock.method(globalThis,'fetch',async(url,...args)=>String(url).startsWith('file:')?new Response(await readFile(new URL(url))):original(url,...args));
 const engine=new library.NullEngine({renderWidth:960,renderHeight:540}),canvas={width:960,height:540,clientWidth:960,clientHeight:540};
 const stage=createCakeStage(canvas,{engine});
 try {
  await stage.prepare([{character:'boaz'},{character:'ravi'}]);const game=createCakeGame(2);stage.draw(game,true);
  const initial=stage.diagnostics();assert.equal(initial.actors,2);assert.equal(initial.carts,2);assert.ok(initial.meshes>30);assert.equal(initial.renderCount,1);
  game.players[0].cakes=1;throwCake(game);stage.draw(game,true);assert.ok(stage.diagnostics().meshes>initial.meshes);
  advance(game,3);stage.draw(game,true);assert.equal(stage.diagnostics().meshes,initial.meshes,'vliegende taarten en slagroom verdwijnen ook uit de scène');
 } finally {stage.dispose();}
 assert.equal(engine.scenes.length,0);assert.equal(stage.diagnostics().disposed,true);assert.equal(canvas.width,1);stage.dispose();
});
