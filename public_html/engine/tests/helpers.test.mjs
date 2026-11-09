import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, HELPER_REWARDS, blankLevel, validateLevel, createGame, stepGame, clone, positions } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { crazyLevel } from '../levels.mjs';
function advance(game,n,input={}){for(let i=0;i<n;i++)stepGame(game,input);}
function setup(){const level=blankLevel(40);level.tiles[13][5]=45;return {level,game:createGame(level)};}
function meet(game,p=game.player){const helper=game.helpers[0];Object.assign(p,{x:helper.x-20,y:14*TILE-p.h,vy:0,grounded:true});return helper;}
test('helpers zijn bewaarbaar, worden geen vijand en laten het bronlevel intact',()=>{
 const {level,game}=setup(),before=clone(level);assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))),level);assert.deepEqual(level,before);
 assert.equal(game.enemies.length,0);assert.equal(game.helpers.length,1);assert.equal(game.tiles[13][5],0);assert.ok(HELPER_REWARDS.includes(game.helpers[0].reward));
 for(let i=0;i<10;i++)assert.equal(positions(crazyLevel(i),45).length,2);
});
test('dichtbij komen geeft vanzelf een cadeau en geen herhalingen bij blijven staan of terugkomen',()=>{
 const {game}=setup(),helper=game.helpers[0];helper.reward=14;advance(game,24);assert.equal(game.player.helperGift,null);
 advance(game,60,{right:true});assert.deepEqual(helper.givenTo,[0]);assert.ok(game.player.star>9);assert.equal(game.player.helperGift.id,14);assert.equal(game.state,'playing');
 advance(game,1500);assert.equal(game.player.star,0);assert.equal(game.player.helperGift,null);
 game.player.x=64;stepGame(game,{});meet(game);stepGame(game,{});assert.equal(game.player.star,0);assert.deepEqual(helper.givenTo,[0]);
});
test('elke cadeauvariant werkt via de bestaande beloningsregels',()=>{
 const checks={9:p=>p.shield,14:p=>p.star>0,19:p=>p.ice,42:p=>p.bubblegun,31:p=>p.cat,41:p=>p.rainbowFart>0};
 for(const reward of HELPER_REWARDS){const {game}=setup();game.helpers[0].reward=reward;meet(game);stepGame(game,{});assert.ok(checks[reward](game.player),String(reward));assert.equal(game.player.helperGift.id,reward);assert.ok(game.events.includes('helpergift'));}
});
test('ver boven of ver naast een helper krijg je nog geen cadeau; helpers zakken naar de grond',()=>{
 const {game}=setup(),helper=game.helpers[0];game.player.x=helper.x;game.player.y=7*TILE;stepGame(game,{});assert.deepEqual(helper.givenTo,[]);
 game.player.x=64;helper.y=3*TILE;advance(game,200);assert.equal(helper.y+helper.h,14*TILE);assert.equal(helper.grounded,true);assert.deepEqual(helper.givenTo,[]);
});
test('schieten en aanraken maken een helper niet tot tegenstander',()=>{
 for(const kind of ['fire','ice','bubble']){const {game}=setup(),helper=meet(game);stepGame(game,{});
 game.fireballs.push({kind,x:helper.x,y:helper.y,w:16,h:16,vx:80,vy:0,life:1,alive:true});advance(game,12);
 assert.equal(helper.alive,true);assert.equal(helper.bubbled,undefined);assert.equal(helper.frozen,undefined);assert.equal(game.enemies.length,0);assert.equal(game.state,'playing');}
});
test('in co-op ontvangt iedere speler één cadeau, ook als ze samen dezelfde helper ontmoeten',()=>{
 const {level}=setup(),game=createCoopGame(level),helper=game.helpers[0];helper.reward=42;
 meet(game,game.players[0]);meet(game,game.players[1]);stepCoopGame(game,[{},{}]);assert.deepEqual(helper.givenTo,[0,1]);assert.ok(game.players.every(p=>p.bubblegun));
 const restored=unpackCoopGame(packCoopGame(game));assert.deepEqual(restored.helpers,game.helpers);assert.deepEqual(restored.players,game.players);
 game.players[1].y=800;stepCoopGame(game,[{},{}]);for(let i=0;i<190;i++)stepCoopGame(game,[{},{}]);assert.equal(game.players[1].bubblegun,false);
 meet(game,game.players[1]);stepCoopGame(game,[{},{}]);assert.equal(game.players[1].bubblegun,false);assert.deepEqual(helper.givenTo,[0,1]);
});
test('pauze bevriest cadeau en begroeting; opnieuw beginnen geeft nieuwe cadeautjes',()=>{
 const {game,level}=setup();meet(game);stepGame(game,{});game.state='paused';const before=clone(game);advance(game,120);assert.deepEqual(clone(game),before);
 const fresh=createGame(level);assert.deepEqual(fresh.helpers[0].givenTo,[]);assert.equal(fresh.player.helperGift,null);
});
