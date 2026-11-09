import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, validateLevel, createGame, stepGame, PIPE_TYPES, pipeConnections, pipeUnderPlayer } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const ins=[32,52,55,58],outs=[33,53,56,59],both=[34,54,57,60];
function setup(a,b){const l=blankLevel(40);l.tiles[8][8]=a;l.tiles[8][20]=b;return {level:l,game:createGame(l)};}
function place(p,pipe){const x=pipe.x*32,y=pipe.y*32;Object.assign(p,{vx:0,vy:0,grounded:false});switch(PIPE_TYPES[pipe.id].opening){case 'up':Object.assign(p,{x:x+5,y:y-p.h,grounded:true});break;case 'down':Object.assign(p,{x:x+5,y:y+32});break;case 'left':Object.assign(p,{x:x-p.w,y:y+2});break;case 'right':Object.assign(p,{x:x+32,y:y+2});}}
test('alle combinaties van ingang en uitgang gebruiken de juiste opening',()=>{
 for(const a of ins)for(const b of outs){const {level,game:g}=setup(a,b);assert.deepEqual(validateLevel(level),level);const route=pipeConnections(g.tiles)[0];place(g.player,route.from);assert.ok(pipeUnderPlayer(g));g.player.shield=true;stepGame(g,{pipe:true});assert.ok(g.events.includes('pipe'),`${a} → ${b}`);assert.ok(g.player.shield);assert.ok(g.player.pipeCooldown>0);
 const p=g.player;switch(PIPE_TYPES[b].opening){case 'up':assert.ok(p.y+p.h<256);break;case 'down':assert.ok(p.y>=288);break;case 'left':assert.ok(p.x+p.w<=640);break;case 'right':assert.ok(p.x>=672);break;}
 assert.equal(p.fallDistance<2,true);}
});
test('natuurlijke richting naar iedere opening activeert de buis',()=>{
 const controls=[{pipe:true},{jump:true},{right:true},{left:true}];for(let i=0;i<4;i++){const {game:g}=setup(ins[i],59);place(g.player,pipeConnections(g.tiles)[0].from);stepGame(g,controls[i]);assert.ok(g.events.includes('pipe'));}
});
test('verkeerde kant, afstand, losse ingang en uitgangen geven geen doorgang',()=>{
 for(const a of ins){const {game:g}=setup(a,33);const from=pipeConnections(g.tiles)[0].from;place(g.player,from);g.player.x+=70;assert.equal(pipeUnderPlayer(g),null);}
 for(const a of [49,50,51,53,56,59]){const {game:g}=setup(a,33);place(g.player,{x:8,y:8,id:a});stepGame(g,{pipe:true});assert.ok(!g.events.includes('pipe'));}
 const {game:g}=setup(55,0);place(g.player,pipeConnections(g.tiles)[0].from);stepGame(g,{right:true});assert.ok(!g.events.includes('pipe'));
});
test('geblokkeerde of buiten het veld gelegen uitgangen vervoeren niemand',()=>{
 for(const b of outs){const {game:g}=setup(55,b),to=pipeConnections(g.tiles)[0].to;const d=PIPE_TYPES[b].opening;g.tiles[to.y+(d==='up'?-1:d==='down'?1:0)][to.x+(d==='left'?-1:d==='right'?1:0)]=1;place(g.player,pipeConnections(g.tiles)[0].from);stepGame(g,{pipe:true});assert.ok(!g.events.includes('pipe'));}
 const {game:g}=setup(55,0);g.tiles[8][0]=56;place(g.player,pipeConnections(g.tiles)[0].from);stepGame(g,{pipe:true});assert.ok(!g.events.includes('pipe'));
});
test('gedraaide tweerichtingsbuizen koppelen per paar en houden vasthouden tegen',()=>{
 for(const a of both)for(const b of both){const {game:g}=setup(a,b);const routes=pipeConnections(g.tiles);assert.equal(routes[0].to.id,b);assert.equal(routes[1].to.id,a);place(g.player,routes[0].from);stepGame(g,{pipe:true});assert.ok(g.events.includes('pipe'));place(g.player,routes[1].from);g.player.pipeCooldown=0;stepGame(g,{pipe:true});assert.ok(!g.events.includes('pipe'));stepGame(g,{});place(g.player,routes[1].from);stepGame(g,{pipe:true});assert.ok(g.events.includes('pipe'));}
});
test('nieuwe gewone buizen zijn solide obstakels en blijven bewaarbaar',()=>{
 for(const id of [49,50,51]){const {game:g,level}=setup(id,33);assert.equal(validateLevel(level).tiles[8][8],id);Object.assign(g.player,{x:8*32+5,y:8*32-g.player.h,grounded:true});for(let i=0;i<20;i++)stepGame(g,{});assert.equal(g.player.y+g.player.h,8*32);assert.ok(g.player.grounded);}
});
test('co-op kan door een zijbuis en bewaart alle richtingen in snapshots',()=>{
 const {level}=setup(55,53),g=createCoopGame(level);place(g.players[1],pipeConnections(g.tiles)[0].from);stepCoopGame(g,[{},{right:true}]);assert.ok(g.events.includes('pipe'));assert.ok(g.players[1].x>600);const restored=unpackCoopGame(packCoopGame(g));assert.equal(restored.tiles[8][8],55);assert.equal(restored.tiles[8][20],53);
});
