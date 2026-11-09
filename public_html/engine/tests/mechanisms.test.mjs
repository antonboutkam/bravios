import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, resizeLevel, clone } from '../engine.mjs';
import { createMechanisms, stepMechanisms, beltPoint, beltGeometry } from '../mechanisms.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const advance=(game,frames,input={})=>{for(let i=0;i<frames;i++)stepGame(game,input);};
function wallLevel(id=46){const l=blankLevel(40);l.tiles[10][8]=id;return l;}
function beltLevel(){const l=blankLevel(40);l.belts=[{a:{x:8,y:10},b:{x:18,y:10}}];return l;}
function ride(game,body){Object.assign(game.player,{x:body.x+1,y:body.y-game.player.h,vy:0,grounded:true});}
test('mechanieken bewaren, valideren, verschuiven en afsnijden bij kleiner veld',()=>{
 const level=wallLevel();level.belts=beltLevel().belts;assert.deepEqual(validateLevel(clone(level)),level);
 const high=resizeLevel(level,40,32);assert.equal(high.tiles[26][8],46);assert.equal(high.belts[0].a.y,26);
 assert.deepEqual(resizeLevel(high,20,16).belts,level.belts);
 assert.equal(resizeLevel(level,20).belts.length,1);level.belts[0].b.x=30;assert.equal(resizeLevel(level,20).belts.length,0);
 for(const b of [null,{},[{a:{x:0,y:0},b:{x:0,y:0}}],[{a:{x:-1,y:0},b:{x:1,y:1}}],Array(33).fill(beltLevel().belts[0])])assert.throws(()=>validateLevel({...level,belts:b}));
 for(const [x,y,id] of [[39,10,46],[8,15,47],[0,0,48]]){const bad=blankLevel(40);bad.tiles[y][x]=id;assert.throws(()=>validateLevel(bad));}
});
test('beweegblok is twee vakjes breed en hoog, keert elke drie seconden om',()=>{
 for(const id of [46,47]){const level=wallLevel(id),before=clone(level),s=createMechanisms(level),wall=s.movingWalls[0];
 assert.equal(wall.w,64);assert.equal(wall.h,64);stepMechanisms(s,3);assert.equal(wall.y,320+(id===46?-96:96));stepMechanisms(s,3);assert.equal(wall.y,320);assert.deepEqual(level,before);}
 const l=wallLevel();l.tiles[10][8]=0;l.tiles[0][8]=46;const s=createMechanisms(l);stepMechanisms(s,3);assert.equal(s.movingWalls[0].y,96);
});
test('band volgt een gesloten lus met regelmatige platformen, draait drie seconden en stopt twee',()=>{
 for(const b of [beltLevel().belts[0],{a:{x:5,y:3},b:{x:5,y:10}},{a:{x:3,y:3},b:{x:12,y:10}}]){
 const g=beltGeometry(b);assert.deepEqual(beltPoint(g,0),beltPoint(g,g.length));
 for(const boundary of [g.distance,g.distance+Math.PI*12,2*g.distance+Math.PI*12,g.length]){const a=beltPoint(g,boundary-.0001),c=beltPoint(g,boundary+.0001);assert.ok(Math.hypot(a.x-c.x,a.y-c.y)<.001);}}
 const s=createMechanisms(beltLevel());stepMechanisms(s,3);const stopped=clone(s.belts[0].platforms);assert.equal(s.belts[0].running,false);
 stepMechanisms(s,1.9);s.belts[0].platforms.forEach((p,i)=>{assert.equal(p.x,stopped[i].x);assert.equal(p.y,stopped[i].y);});
 stepMechanisms(s,.2);assert.equal(s.belts[0].running,true);assert.notEqual(s.belts[0].platforms[0].x,stopped[0].x);
});
test('held landt op beweegblok en rijdt omhoog en omlaag; springen maakt hem los',()=>{
 for(const id of [46,47]){const g=createGame(wallLevel(id)),w=g.movingWalls[0];ride(g,w);advance(g,120);assert.equal(g.state,'playing');assert.ok(g.player.grounded);assert.ok(Math.abs(g.player.y+g.player.h-w.y)<.001);
 stepGame(g,{jump:true});assert.ok(g.player.vy<0);assert.equal(g.player.grounded,false);}
 const g=createGame(wallLevel());g.player.x=270;g.player.y=200;advance(g,45);assert.equal(g.player.grounded,true);assert.ok(Math.abs(g.player.y+g.player.h-g.movingWalls[0].y)<.001);
});
test('band draagt de held tijdens draaien en houdt hem op zijn plek tijdens de stop',()=>{
 const g=createGame(beltLevel()),p=g.belts[0].platforms[0];ride(g,p);const x=g.player.x;advance(g,240);assert.equal(g.state,'playing');assert.ok(g.player.grounded);assert.ok(g.player.x>x+110);
 advance(g,132);const stopped=g.player.x;advance(g,120);assert.ok(Math.abs(g.player.x-stopped)<.001);assert.ok(g.player.grounded);
 stepGame(g,{jump:true});assert.equal(g.player.grounded,false);assert.ok(g.player.vy<0);
});
test('bewegende muren stoppen lopen, maar weggeschopte schildjes gaan erdoorheen',()=>{
 const g=createGame(wallLevel());Object.assign(g.player,{x:220,y:330,vy:0});stepGame(g,{right:true},1/30);advance(g,8,{right:true});assert.ok(g.player.x+g.player.w<=g.movingWalls[0].x+.01);
 const shell={kind:'turtle',phase:'shell',x:230,y:330,w:26,h:26,vx:320,vy:0,alive:true,frozen:0,safe:0,phaseTime:0,facing:1};g.enemies=[shell];g.player.x=64;advance(g,36);assert.ok(shell.x>320);assert.equal(shell.vx,320);
});
test('beknelling onder plafond doodt de held en pauze bevriest de mechanieken',()=>{
 const l=wallLevel();l.tiles[7][8]=12;l.tiles[7][9]=12;const g=createGame(l);ride(g,g.movingWalls[0]);advance(g,360);assert.equal(g.state,'dead');
 const paused=createGame(beltLevel());paused.state='paused';const before=clone(paused);advance(paused,120);assert.deepEqual(clone(paused),before);
});
test('co-op deelt één klok en behoudt platformposities in snapshots',()=>{
 const g=createCoopGame(beltLevel());g.players.forEach(p=>{p.x=64;});for(let i=0;i<120;i++)stepCoopGame(g,[{},{}]);assert.ok(Math.abs(g.mechanismTime-1)<1e-8);
 const restored=unpackCoopGame(packCoopGame(g));assert.deepEqual(restored.belts,clone(g.belts));assert.deepEqual(restored.movingWalls,g.movingWalls);
});

test('beide co-op spelers liften mee en beloningsintro houdt alles stil',()=>{
 const g=createCoopGame(wallLevel());for(const p of g.players)Object.assign(p,{x:260,y:320-p.h,vy:0,grounded:true});
 for(let i=0;i<120;i++)stepCoopGame(g,[{},{}]);for(const p of g.players)assert.ok(Math.abs(p.y+p.h-g.movingWalls[0].y)<.001);
 for(const intro of ['rocketIntro','reverseIntro']){g[intro]=1;const y=g.movingWalls[0].y,t=g.mechanismTime;stepCoopGame(g,[{},{}]);assert.equal(g.movingWalls[0].y,y);assert.equal(g.mechanismTime,t);g[intro]=0;}
});
