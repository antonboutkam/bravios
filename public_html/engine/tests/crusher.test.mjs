import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, validateLevel, createGame, stepGame, clone, PALETTE_GROUPS } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
function setup(){const level=blankLevel(40);level.tiles[5][10]=61;return {level,game:createGame(level)};}
function advance(g,n,input={}){for(let i=0;i<n;i++)stepGame(g,input);}
function below(g,p=g.player){Object.assign(p,{x:10*32+5,y:14*32-p.h,vy:0,grounded:true});}
function triggerAndDodge(g){below(g);stepGame(g,{});g.player.x=64;}
test('stekelrotsblok zit bij vijanden, bewaart zonder bronlevel te veranderen en hangt stil',()=>{
 const {level,game:g}=setup(),before=clone(level);assert.ok(PALETTE_GROUPS.find(p=>p.id==='enemies').items.includes(61));assert.deepEqual(validateLevel(level),level);assert.deepEqual(level,before);assert.equal(g.tiles[5][10],0);assert.equal(g.enemies[0].kind,'crusher');advance(g,240);assert.equal(g.enemies[0].y,160);assert.equal(g.enemies[0].phase,'waiting');
});
test('alleen een speler eronder in dezelfde vrije schacht activeert de val',()=>{
 for(const position of [{x:280,y:420},{x:325,y:100}]){const {game:g}=setup();Object.assign(g.player,position);stepGame(g,{});assert.equal(g.enemies[0].phase,'waiting');}
 const {game:g}=setup();g.tiles[9][10]=12;below(g);stepGame(g,{});assert.equal(g.enemies[0].phase,'waiting');
 g.tiles[9][10]=0;stepGame(g,{});assert.equal(g.enemies[0].phase,'falling');assert.ok(g.enemies[0].y>160);
});
test('valt op de vloer, blijft exact vijf seconden en gaat terug naar de start',()=>{
 const {game:g}=setup(),rock=g.enemies[0];triggerAndDodge(g);for(let i=0;i<240&&rock.phase!=='rest';i++)stepGame(g,{});assert.equal(rock.phase,'rest');assert.equal(rock.y+rock.h,448);const y=rock.y;
 advance(g,599);assert.equal(rock.phase,'rest');assert.equal(rock.y,y);stepGame(g,{});assert.equal(rock.phase,'rising');advance(g,400);assert.equal(rock.y,160);assert.equal(rock.phase,'waiting');below(g);stepGame(g,{});assert.equal(rock.phase,'falling');
});
test('vloer op hoogte en onderrand van een veld zonder vloer stoppen de val',()=>{
 for(const platform of [true,false]){const {game:g}=setup(),rock=g.enemies[0];if(platform)g.tiles[10][10]=12;else{g.tiles[14][10]=0;g.tiles[15][10]=0;}Object.assign(g.player,{x:325,y:250,vy:0});stepGame(g,{});g.player.x=64;g.player.y=420;advance(g,180);assert.equal(rock.phase,'rest');assert.equal(rock.y+rock.h,platform?320:512);assert.equal(rock.alive,true);}
});
test('geraakt worden kost direct een leven, ook met gewone bescherming of springen op de stekels',()=>{
 for(const protection of [{},{shield:true},{shellHelmet:true},{star:10},{fire:true},{ice:true},{bubblegun:true},{invincible:1}]){const {game:g}=setup();Object.assign(g.player,protection);below(g);advance(g,160);assert.equal(g.state,'dead',JSON.stringify(protection));assert.ok(g.enemies[0].alive);}
 const {game:g}=setup(),r=g.enemies[0];Object.assign(g.player,{x:r.x+4,y:r.y-20,vy:300});stepGame(g,{});assert.equal(g.state,'dead');assert.equal(r.alive,true);
});
test('pauze en beloningsintro stoppen de cyclus; ijs stopt zonder een oud valgebied te raken',()=>{
 const {game:g}=setup(),r=g.enemies[0];triggerAndDodge(g);g.state='paused';const y=r.y;advance(g,120);assert.equal(r.y,y);g.state='playing';g.rocketIntro=1;advance(g,60);assert.equal(r.y,y);g.rocketIntro=0;r.frozen=1;r.previousY=0;g.player.x=r.x+4;g.player.y=80;stepGame(g,{});assert.equal(r.y,y);assert.equal(g.state,'playing');
});
test('vuur en schildjes breken steen niet, bubblegun en rainbowfart werken als beloning',()=>{
 for(const kind of ['fire','bubble']){const {game:g}=setup(),r=g.enemies[0];g.fireballs.push({kind,x:r.x+8,y:r.y+8,w:8,h:8,vx:0,vy:0,life:2,alive:true});stepGame(g,{});assert.ok(r.alive);assert.equal(!!r.bubbled,kind==='bubble');}
 const {game:g}=setup(),r=g.enemies[0];Object.assign(g.player,{x:64,y:r.y,rainbowFart:10,fartTrail:[{x:r.x+16,y:r.y+16,life:3}]});stepGame(g,{});assert.equal(r.alive,false);
});
test('co-op reageert op speler twee, deelt één cyclus en herstelt de rotsstand in snapshots',()=>{
 const {level}=setup(),g=createCoopGame(level),r=g.enemies[0];below(g,g.players[1]);stepCoopGame(g,[{},{}]);assert.equal(r.phase,'falling');g.players[1].x=64;for(let i=0;i<240&&r.phase!=='rest';i++)stepCoopGame(g,[{},{}]);for(let i=0;i<120;i++)stepCoopGame(g,[{},{}]);assert.ok(Math.abs(r.phaseTime-1)<1e-8);assert.equal(unpackCoopGame(packCoopGame(g)).enemies[0].phase,'rest');
 below(g,g.players[1]);stepCoopGame(g,[{},{}]);assert.ok(g.players[1].respawn>0);assert.equal(g.players[0].respawn,0);
});
