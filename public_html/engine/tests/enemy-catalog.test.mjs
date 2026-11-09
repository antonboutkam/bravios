import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_CATALOG } from '../enemies/catalog.mjs';
import { enemyProfileByKey,enemyAssets } from '../enemies/runtime.mjs';
import { enemyAnimation } from '../enemies/sprites.mjs';
import { blankLevel,createGame,stepGame } from '../engine.mjs';
import { createWonderFoe,stepWonderFoe } from '../wonder-foes.mjs';
import { packCoopGame,unpackCoopGame,createCoopGame } from '../coop.mjs';
const make=id=>{const level=blankLevel(60);level.tiles[13][20]=id;const g=createGame(level);g.player.invincible=100;return g;};
const advance=(g,n)=>{for(let i=0;i<n;i++)stepGame(g,{});};
function withConfig(key,change,run){const profile=enemyProfileByKey(key),original=structuredClone(profile);try{change(profile);run(profile);}finally{for(const key of Object.keys(profile))delete profile[key];Object.assign(profile,original);}}
const shot=(g,e,kind='fire')=>{g.fireballs.push({kind,x:e.x+4,y:e.y+4,w:8,h:8,vx:0,vy:0,life:2,alive:true});stepGame(g,{});};
test('JSON-health bepaalt hoeveel echte vuurballen nodig zijn',()=>withConfig('game/walker',c=>c.combat.health=2,()=>{const g=make(6),e=g.enemies[0];shot(g,e);assert.equal(e.hp,1);assert.equal(e.alive,true);shot(g,e);assert.equal(e.alive,false);}));
test('JSON kan springen op een gewone vijand gevaarlijk maken',()=>withConfig('game/walker',c=>c.combat.stompable=false,()=>{const g=make(6),e=g.enemies[0];Object.assign(g.player,{x:e.x,y:e.y-28.5,vy:120,shield:true,invincible:0});stepGame(g,{});assert.equal(g.player.shield,false);assert.equal(e.alive,true);}));
test('vliegen, snelheid en schieten werken ook op een gewone wandelaar',()=>withConfig('game/walker',c=>{c.movement.type='fly';c.movement.speed=90;c.shooting.enabled=true;c.shooting.interval=.1;},()=>{const g=make(6),e=g.enemies[0],x=e.x,y=e.y;advance(g,24);assert.ok(e.y<y);assert.ok(Math.abs(e.x-x)>10);assert.ok(g.hazards.some(h=>h.kind==='fire'));}));
test('schieten kan worden uitgezet op een hamerschildpad',()=>withConfig('game/hammer',c=>c.shooting.enabled=false,()=>{const g=make(28);advance(g,360);assert.equal(g.hazards.length,0);}));
test('immuniteit tegen ijs en bellen komt uit JSON',()=>withConfig('game/walker',c=>{c.combat.freezeable=false;c.combat.bubbleable=false;},()=>{const g=make(6),e=g.enemies[0];shot(g,e,'ice');assert.equal(e.frozen,0);shot(g,e,'bubble');assert.ok(!e.bubbled);assert.equal(e.alive,true);}));
test('een vliegende draak kan via JSON een grondvijand worden',()=>withConfig('game/dragon',c=>c.movement.type='walk',()=>{const g=make(23),e=g.enemies[0];e.y-=100;advance(g,120);assert.equal(e.grounded,true);}));
test('Wonderland-health en fase-intervallen komen uit het baasbestand',()=>withConfig('bosses/blubberus',c=>{c.combat.health=6;c.boss.warningSeconds=.1;},()=>{const e=createWonderFoe(0,0,300,{boss:true}),g=make(6);g.player.x=300;g.enemies=[e];assert.equal(e.hp,6);stepWonderFoe(g,e,.01,()=>({}));stepWonderFoe(g,e,.11,()=>({}));assert.equal(e.phase,'attack');}));
test('samenspel bewaart de catalogus-ID en aangepaste levenspunten',()=>{const level=blankLevel(60);level.tiles[13][20]=27;const g=createCoopGame(level),copy=unpackCoopGame(packCoopGame(g));assert.equal(copy.enemies[0].catalogId,'game/spiky');assert.equal(copy.enemies[0].hp,3);});
test('PNG-staten volgen schild, robotlading, nacht en zwak moment',()=>{
 for(const [enemy,suffix]of [[{kind:'turtle',tileId:22,phase:'shell'},'shell.png'],[{kind:'robot',tileId:17,phase:'charge',phaseTime:2.5},'charge-5.png'],[{kind:'wonder',wonderType:0,boss:true,phase:'exposed'},'exposed.png']])assert.ok(enemyAnimation(enemy).image.endsWith(suffix));
 assert.ok(enemyAnimation({kind:'crab'},true).image.endsWith('idle-night.png'));assert.ok(enemyAssets().length>100);assert.equal(ENEMY_CATALOG.length,48);
});
