import test from 'node:test';
import assert from 'node:assert/strict';
import {createSmallGame,shootSmallBall,popSmallBalloon,stepSmallGame} from '../small-games.mjs';
test('mikken schiet één bal tegelijk en sluit na vijf beurten af',()=>{
 const g=createSmallGame('aim');for(let shot=0;shot<5;shot++){
  assert.ok(shootSmallBall(g));assert.equal(shootSmallBall(g),false);
  for(let i=0;i<600&&g.ball;i++)stepSmallGame(g,{},1/120);
  assert.equal(g.ball,null);
 }
 assert.equal(g.shots,5);assert.equal(g.state,'won');assert.ok(g.score>0);assert.equal(shootSmallBall(g),false);
});
test('mikken begrenst hoek en kracht bij toetsenbord en controller',()=>{
 const g=createSmallGame('aim');for(let i=0;i<500;i++)stepSmallGame(g,{right:true,up:true});assert.equal(g.power,750);assert.equal(g.angle,80);
 for(let i=0;i<500;i++)stepSmallGame(g,{left:true,down:true});assert.equal(g.power,300);assert.equal(g.angle,20);
});
test('ballonnen tellen eenmaal, missen blijft ongestraft en tien prikken ronden af',()=>{
 const g=createSmallGame('balloons');assert.equal(popSmallBalloon(g,0,440),false);
 for(const b of g.balloons){assert.ok(popSmallBalloon(g,b.x,b.y));assert.equal(popSmallBalloon(g,b.x,b.y),false);}
 assert.equal(g.score,10);assert.equal(g.state,'won');
});
test('fruit vangen telt tien goede vangsten; vijf gemiste appels eindigen het spel',()=>{
 const g=createSmallGame('catch',()=>.5);for(let i=0;i<10;i++){g.fruit={x:g.basket,y:366};stepSmallGame(g,{},.03);}assert.equal(g.score,10);assert.equal(g.state,'won');
 const missed=createSmallGame('catch');for(let i=0;i<5;i++){missed.fruit={x:10,y:447};stepSmallGame(missed);}assert.equal(missed.misses,5);assert.equal(missed.state,'over');
});
test('fruitmand blijft binnen het veld en afgelopen rondes veranderen niet meer',()=>{
 const g=createSmallGame('catch');g.basket=50;stepSmallGame(g,{left:true});assert.equal(g.basket,50);g.basket=750;stepSmallGame(g,{right:true});assert.equal(g.basket,750);
 g.state='over';const before=JSON.stringify(g);stepSmallGame(g,{right:true,action:true});assert.equal(JSON.stringify(g),before);assert.throws(()=>createSmallGame('unknown'));
});

const {createRhythmGame,jumpRhythm,stepRhythmGame,rhythmTempo}=await import('../rhythm-game.mjs');
test('stekelsprong houdt spelers centraal en tempo één minuut vast',()=>{
 const solo=createRhythmGame(),duo=createRhythmGame(2);
 assert.equal(solo.players[0].x,400);assert.equal((duo.players[0].x+duo.players[1].x)/2,400);
 assert.deepEqual(rhythmTempo(0),rhythmTempo(60));assert.ok(rhythmTempo(120).speed>rhythmTempo(60).speed);
 assert.ok(rhythmTempo(180).interval<rhythmTempo(120).interval);
 for(let i=0;i<120;i++)stepRhythmGame(duo,{left:true,right:true},1/60);
 assert.deepEqual(duo.players.map(p=>p.x),[372,428]);assert.equal(duo.balls.length,0);
});
test('sprongen zijn onafhankelijk; vasthouden geeft geen automatische herhaalsprong',()=>{
 const g=createRhythmGame(2);stepRhythmGame(g,{jump2:true},1/60);
 assert.equal(g.players[0].lift,0);assert.ok(g.players[1].lift>0);assert.equal(jumpRhythm(g,1),false);
 for(let i=0;i<65;i++)stepRhythmGame(g,{jump2:true},1/60);
 assert.equal(g.players[1].lift,0);assert.ok(jumpRhythm(g,0));
});
test('zonder springen verlies je; pauze en afgeronde rondes staan volledig stil',()=>{
 const g=createRhythmGame();for(let i=0;i<1000&&g.state==='playing';i++)stepRhythmGame(g,{},1/60);
 assert.equal(g.state,'over');assert.ok(g.monsters.some(m=>m.alive));
 const before=JSON.stringify(g);stepRhythmGame(g,{jump:true},.25);assert.equal(JSON.stringify(g),before);
 const p=createRhythmGame();p.paused=true;const paused=JSON.stringify(p);stepRhythmGame(p,{jump:true},.25);assert.equal(JSON.stringify(p),paused);assert.equal(jumpRhythm(p),false);
});
test('een foutloze ronde overleeft alle echte ballen en verslaat de monsters rond drie minuten',()=>{
 for(const dt of [1/60,1/20])for(const players of [1,2]){
  const g=createRhythmGame(players),positions=g.players.map(p=>p.x),dead=[];let previous=8;
  for(let i=0;i<200/dt&&g.state==='playing';i++){
   for(let p=0;p<players;p++){const actor=g.players[p];if(g.balls.some(b=>b.x<actor.x&&(actor.x-b.x)/b.speed<.38))jumpRhythm(g,p);}
   stepRhythmGame(g,{},dt);
   const alive=g.monsters.filter(m=>m.alive).length;if(alive<previous){dead.push(g.time);previous=alive;}
  }
  assert.equal(g.state,'won',`${players} spelers, dt=${dt}, tijd=${g.time}`);
  assert.ok(g.time>=174&&g.time<=182);assert.equal(dead.length,8);assert.ok(dead[0]>60);
  assert.ok(g.players.every(p=>p.alive));assert.deepEqual(g.players.map(p=>p.x),positions);
 }
});
test('bij samenspelen kan de overgebleven speler de ronde afmaken',()=>{
 const g=createRhythmGame(2);g.players[0].alive=false;
 for(let i=0;i<12000&&g.state==='playing';i++){
  const p=g.players[1];if(g.balls.some(b=>b.x<p.x&&(p.x-b.x)/b.speed<.38))jumpRhythm(g,1);
  stepRhythmGame(g,{},1/60);
 }
 assert.equal(g.state,'won');assert.equal(g.players[0].alive,false);assert.equal(g.players[1].alive,true);
});
