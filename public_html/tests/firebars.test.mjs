import test from 'node:test';
import assert from 'node:assert/strict';
import {FIREBAR_PERIOD,createFirebars,firebarFlames,firebarHits,drawFirebar} from '../firebars.mjs';
import {blankLevel,createGame,stepGame,validateLevel,PALETTE_GROUPS,clone} from '../engine.mjs';
import {createCoopGame,stepCoopGame,packCoopGame,unpackCoopGame} from '../coop.mjs';
import {adventureLevel,ADVENTURE_FIELDS} from '../adventurers.mjs';
import {drawWorld} from '../art.mjs';

const makeLevel=()=>{const l=blankLevel(40);l.tiles[9][12]=101;return l;};
test('vuurmolen is bouwbaar en bewaart zijn anker via level-JSON en snapshots',()=>{
 const level=makeLevel();assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))),level);
 assert.ok(PALETTE_GROUPS.find(g=>g.id==='mechanisms').items.includes(101));
 const game=createCoopGame(level);game.time=2.7;
 const restored=unpackCoopGame(JSON.parse(JSON.stringify(packCoopGame(game))));
 assert.deepEqual(restored.firebars,game.firebars);
 assert.deepEqual(firebarFlames(restored.firebars[0],restored.time),firebarFlames(game.firebars[0],game.time));
});
test('vier vlammen draaien volledig in zes seconden met een ronde trefzone',()=>{
 const bar={x:100,y:100,phase:0,direction:1};
 const a=firebarFlames(bar,0),b=firebarFlames(bar,FIREBAR_PERIOD/4),c=firebarFlames(bar,FIREBAR_PERIOD);
 assert.equal(a.length,4);assert.equal(a[3].x,164);assert.ok(Math.abs(b[3].y-164)<1e-9);
 assert.ok(Math.abs(c[3].x-a[3].x)<1e-9);assert.ok(Math.abs(c[3].y-a[3].y)<1e-9);
 assert.ok(firebarHits(bar,0,{x:160,y:98,w:4,h:4}));
 assert.equal(firebarHits(bar,0,{x:172,y:108,w:1,h:1}),false,'hoek van de begrenzende vierkant is geen vuur');
 assert.equal(firebarHits(bar,0,{x:200,y:100,w:22,h:28}),false);
 assert.ok(firebarFlames({...bar,direction:-1},1.5)[3].y<100);
});
test('vuur doet schade volgens de bestaande schildregels; op afstand wachten is veilig',()=>{
 for(const shield of [false,true]){
  const g=createGame(makeLevel()),f=firebarFlames(g.firebars[0],1/120)[3];
  Object.assign(g.player,{x:f.x-10,y:f.y-12,shield});stepGame(g,{});
  assert.equal(g.state,shield?'playing':'dead');assert.equal(g.player.shield,false);
  if(shield)assert.ok(g.player.invincible>0);
 }
 const safe=createGame(makeLevel());for(let i=0;i<720;i++)stepGame(safe,{});assert.equal(safe.state,'playing');
 const paused=clone(safe);safe.state='paused';stepGame(safe,{});assert.equal(safe.time,paused.time);
});
test('samenspel draait de molen eenmaal per stap en raakt beide spelers op dezelfde plaats',()=>{
 const g=createCoopGame(makeLevel()),f=firebarFlames(g.firebars[0],1/120)[3];
 for(const p of g.players)Object.assign(p,{x:f.x-10,y:f.y-12});
 stepCoopGame(g,[{},{}]);assert.equal(g.time,1/120);assert.ok(g.players.every(p=>p.respawn>0));
});
test('grotreizen wisselen de vuurmolens van de huidige wereld en herstellen ze bij terugkomst',()=>{
 const l=makeLevel();l.tiles[13][20]=62;const g=createGame(l),bars=clone(g.firebars);
 Object.assign(g.player,{x:20*32+5,y:420,vy:0,grounded:true});stepGame(g,{});
 assert.ok(g.caveState.active);assert.deepEqual(g.firebars,[]);
 assert.deepEqual(g.caveState.outside.firebars,bars);
 Object.assign(g.player,{x:2*32+5,y:420,vy:0,grounded:true});stepGame(g,{});
 assert.equal(g.caveState.active,null);assert.deepEqual(g.firebars,bars);
});
test('kasteelvelden bevatten diepe lavabaden, oversteekplatforms, vuurmolens en een vrije eindzaal',()=>{
 for(const index of [2,5,10,11]){
  const l=adventureLevel(index),floor=l.tiles.length-2,g=createGame(l);
  assert.ok(l.tiles[floor].filter(id=>id===26).length>=30,l.name);
  assert.ok(g.firebars.length>=4,l.name);
  for(let x=0;x<l.width;x++)if(l.tiles[floor][x]===26){assert.equal(l.tiles[floor+1][x],26);assert.equal(l.tiles[floor-3][x],12);}
  for(let x=l.width-34;x<l.width-5;x++){assert.equal(l.tiles[floor][x],65);assert.equal(l.tiles[floor+1][x],65);}
  assert.ok(g.firebars.every(b=>b.x+73<(l.width-34)*32));
  const pool=l.tiles[floor].indexOf(26);Object.assign(g.player,{x:pool*32+5,y:floor*32+6,shield:true,star:10});stepGame(g,{});assert.equal(g.state,'dead','lava blijft dodelijk met een gewone ster');
 }
 for(const [i,f] of ADVENTURE_FIELDS.entries())if(f.kind!=='castle')assert.equal(createFirebars(adventureLevel(i)).firebars.length,0);
});
function recording(){const calls=[];const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get(t,key){return key in t?t[key]:(...args)=>{calls.push([key,...args]);};},set(t,key,v){t[key]=v;return true;}});return {ctx,calls};}
test('zichtbare vuurposities volgen de speltijd, ook met minder beweging',()=>{
 const l=makeLevel(),g=createGame(l);g.time=1.25;const before=clone(g),flames=firebarFlames(g.firebars[0],g.time);
 for(const reducedMotion of [false,true]){
  const {ctx,calls}=recording();drawWorld(ctx,l,{game:g,time:900,reducedMotion,grid:false});
  for(const f of flames)assert.ok(calls.some(([method,x,y,r])=>method==='arc'&&x===f.x&&y===f.y&&r===9));
  assert.deepEqual(clone(g),before);
 }
 const {ctx,calls}=recording();drawFirebar(ctx,g.firebars[0],0,{guide:true});assert.ok(calls.some(([method,,,r])=>method==='arc'&&r===73));
});
