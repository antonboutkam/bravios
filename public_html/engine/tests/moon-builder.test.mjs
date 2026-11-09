import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, createGame, stepGame, validateLevel, randomLevel, chainBalls, THEMES } from '../engine.mjs';
import { createCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
const advance = (g, n, input = {}) => { for (let i = 0; i < n; i++) stepGame(g, input); };
test('new parts and moon survive file validation and coop snapshots', () => {
 const l = blankLevel(40); l.theme = 'moon'; for(let id=70;id<=77;id++) l.tiles[7][id-65]=id;
 assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(l))), l);
 const g = createCoopGame(l); g.players[0].mounted = g.dinos[0];
 const copy = unpackCoopGame(packCoopGame(g),0);
 assert.equal(copy.player.mounted.kind,'quad'); assert.equal(copy.enemies[0].kind,'plane'); assert.equal(chainBalls(copy).length,4);
});
test('moon acceleration is one sixth, held jump is much higher', () => {
 const rises=[];
 for(const theme of ['grass','moon']) { const l=blankLevel(40,48);l.theme=theme; const g=createGame(l);const p=g.player;
 p.y=600;p.vy=0; stepGame(g,{}); assert.equal(p.vy,theme==='moon'?2.5:15);
 p.y=46*32-p.h;p.vy=0;p.grounded=true; const start=p.y;let min=p.y;
 for(let i=0;i<300;i++){stepGame(g,{jump:true});min=Math.min(min,p.y);}rises.push(start-min);
 } assert.ok(rises[1] > rises[0]*5.5);
});
test('bean box opens once, vine stops at terrain and supports climbing',()=>{
 const l=blankLevel(40);l.tiles[10][8]=76;l.tiles[5][8]=12;
 const g=createGame(l),p=g.player;Object.assign(p,{x:8*32+5,y:11*32+1,vy:-300});stepGame(g,{});
 assert.equal(g.tiles[10][8],79);assert.equal(g.tiles[6][8],78);assert.equal(g.tiles[5][8],12);assert.equal(l.tiles[10][8],76);
 Object.assign(p,{x:8*32+5,y:8*32,vy:0});advance(g,20,{jump:true});assert.ok(p.y<8*32-15);
});
test('chain balls swing, hurt on touch and pause with the world',()=>{
 const l=blankLevel(40);l.tiles[6][8]=70;const g=createGame(l);const a=chainBalls(g)[0];
 advance(g,10);assert.notEqual(chainBalls(g)[0].x,a.x);g.state='paused';const t=g.time;advance(g,20);assert.equal(g.time,t);
 g.state='playing';const b=chainBalls(g)[0];Object.assign(g.player,{x:b.x,y:b.y,vy:0});stepGame(g,{});assert.equal(g.state,'dead');
});
test('quad mounts and dismounts, plane patrols and drops falling fire',()=>{
 const l=blankLevel(40);l.tiles[13][4]=74;l.tiles[4][8]=77;const g=createGame(l);advance(g,120);
 Object.assign(g.player,{x:4*32-20,y:420,vy:0,grounded:true});stepGame(g,{mount:true});assert.equal(g.player.mounted?.kind,'quad');
 stepGame(g,{});stepGame(g,{mount:true});assert.equal(g.player.mounted,null);
 advance(g,90);assert.ok(g.hazards.some(h=>h.kind==='fire')); const e=g.enemies[0];e.x=0;e.facing=-1;stepGame(g,{});assert.equal(e.facing,1);
});
test('generated fields can be completed across all sizes and themes without jumping',()=>{
 for(const width of [40,72,120]) for(const height of [16,32,64]) for(const theme of Object.keys(THEMES)) {
 let seed=width+height;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 const l=randomLevel(width,height,theme,random);validateLevel(l);const g=createGame(l);
 advance(g,width*30,{right:true});assert.equal(g.state,'won',`${width}/${height}/${theme}`);
 }
});
