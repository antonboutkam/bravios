import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, PARACHUTE_DROP, PARACHUTE_SPEED, blankLevel, createGame, stepGame, clone } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { drawParachute } from '../art.mjs';
function advance(game,frames,input={}){for(let i=0;i<frames;i++)stepGame(game,input);}
function dropLevel(blocks=12){const level=blankLevel(40,32);level.tiles[29][2]=0;level.tiles[29-blocks][2]=10;return level;}
function opened(){const game=createGame(dropLevel());for(let i=0;i<600&&!game.player.parachute&&game.state==='playing';i++)stepGame(game,{});assert.equal(game.player.parachute,true);return game;}
test('de parachute opent pas na meer dan drie blokken dalen en begrenst de valsnelheid',()=>{
 const game=createGame(dropLevel()),p=game.player;let distance=0;
 for(let i=0;i<600&&!p.parachute;i++){distance=p.fallDistance;stepGame(game,{});assert.equal(game.state,'playing');if(p.fallDistance<=PARACHUTE_DROP)assert.equal(p.parachute,false);}
 assert.ok(distance<=3*TILE);assert.ok(p.fallDistance>3*TILE);assert.equal(p.vy,PARACHUTE_SPEED);assert.ok(game.events.includes('parachute'));
 const y=p.y;advance(game,120);assert.ok(Math.abs(p.y-y-PARACHUTE_SPEED)<.01);assert.equal(p.parachute,true);
});
test('vallen van maximaal drie blokken opent niets; landen klapt de parachute in en wist de valafstand',()=>{
 for(const blocks of [1,2,3]){const game=createGame(dropLevel(blocks));let opened=false;for(let i=0;i<300;i++){stepGame(game,{});opened||=game.player.parachute;}assert.equal(opened,false);assert.equal(game.player.grounded,true);}
 const game=opened();advance(game,800);assert.equal(game.player.grounded,true);assert.equal(game.player.parachute,false);assert.equal(game.player.fallDistance,0);
});
test('omhoog springen en korte sprongen houden de parachute dicht; links en rechts blijven sturen',()=>{
 const game=createGame(blankLevel(40));advance(game,24);stepGame(game,{jump:true});
 for(let i=0;i<30;i++){stepGame(game,{});assert.equal(game.player.parachute,false);}advance(game,120);assert.equal(game.player.grounded,true);
 const floating=opened(),x=floating.player.x;advance(floating,60,{right:true});assert.ok(floating.player.x>x+80);assert.ok(floating.player.vy<=PARACHUTE_SPEED);assert.equal(floating.player.parachute,true);
});
test('buisreizen en een reddingssprong beginnen met een dichte parachute',()=>{
 const game=opened(),p=game.player;game.tiles[29][5]=32;game.tiles[29][20]=33;
 Object.assign(p,{x:5*TILE+5,y:29*TILE-p.h,grounded:true});stepGame(game,{pipe:true});assert.ok(game.events.includes('pipe'));assert.equal(p.parachute,false);assert.equal(p.fallDistance,0);
 const rescue=opened();rescue.player.cat=true;rescue.player.y=32*TILE;stepGame(rescue,{});assert.ok(rescue.player.vy<0);assert.equal(rescue.player.parachute,false);assert.equal(rescue.player.fallDistance,0);
});
test('onder water is er geen parachute; op de dino en met een helm blijft hij bruikbaar',()=>{
 const level=dropLevel();level.theme='underwater';const water=createGame(level);advance(water,600);assert.equal(water.player.parachute,false);
 const game=opened(),p=game.player;p.shellHelmet=true;p.mounted={x:p.x,y:p.y+p.h-24,w:28,h:24,vx:0,vy:0,facing:1,grounded:false,alive:true};game.dinos=[p.mounted];advance(game,12);assert.equal(p.parachute,true);assert.equal(p.shellHelmet,true);assert.equal(p.mounted.y+p.mounted.h,p.y+p.h);
});
test('pauze bevriest de val en herstarten ruimt de parachute op',()=>{
 const game=opened();game.state='paused';const before=clone(game);advance(game,120);assert.deepEqual(clone(game),before);
 const fresh=createGame(dropLevel());assert.equal(fresh.player.parachute,false);assert.equal(fresh.player.fallDistance,0);
});
test('co-op laat beide spelers afzonderlijk dalen en bewaart hun parachute in snapshots',()=>{
 const level=dropLevel();level.tiles[29][10]=12;const game=createCoopGame(level);
 Object.assign(game.players[1],{x:10*TILE+5,y:29*TILE-game.players[1].h,vy:0,grounded:true});
 for(let i=0;i<100;i++)stepCoopGame(game,[{},{}]);assert.equal(game.players[0].parachute,true);assert.equal(game.players[1].parachute,false);
 const y=game.players[0].y;stepCoopGame(game,[{},{}]);assert.ok(Math.abs(game.players[0].y-y-PARACHUTE_SPEED/120)<.01);
 const restored=unpackCoopGame(packCoopGame(game));assert.deepEqual(restored.players,game.players);
 game.players[0].y=1200;stepCoopGame(game,[{},{}]);assert.ok(game.players[0].respawn>0);assert.equal(game.players[0].parachute,false);
});
test('de parachute tekent boven de speler zonder zijn toestand of botsingsvorm te wijzigen',()=>{
 for(const character of ['boaz','ravi'])for(const reducedMotion of [false,true]){
 const calls=[],ctx=new Proxy({},{get:(_,key)=>(...args)=>calls.push([key,...args]),set:()=>true});
 const p={x:100,y:300,w:22,h:28,parachute:true},before=clone(p);drawParachute(ctx,p,character,.5,reducedMotion);
 assert.ok(calls.some(([method,x,y])=>method==='translate'&&x===111&&y<300));assert.ok(calls.some(([method])=>method==='bezierCurveTo'));assert.deepEqual(p,before);
 }
});
