import test from 'node:test';
import assert from 'node:assert/strict';
import { ADVENTURE_FIELDS, adventureState, adventureUnlocked, completeAdventure, buyAdventureGood, adventureLevel, prepareAdventureGame } from '../adventurers.mjs';
import { TILE, createGame, stepGame, validateLevel, worldTheme } from '../engine.mjs';
import { packCoopGame, unpackCoopGame, createCoopGame } from '../coop.mjs';

test('avonturiers ontgrendelen splitsingen, sluiten weer aan en bewaren beide keuzes',()=>{
 const s=adventureState(); assert.equal(adventureUnlocked(s,0),true);
 assert.equal(completeAdventure(s,3,99),false); assert.equal(s.coins,0);
 for(const i of [0,1,2]) completeAdventure(s,i,20);
 assert.ok(adventureUnlocked(s,3));assert.ok(adventureUnlocked(s,4));assert.ok(!adventureUnlocked(s,5));
 completeAdventure(s,4,30);assert.ok(adventureUnlocked(s,5));assert.ok(!adventureUnlocked(s,6));
 for(const i of [5,7,9,10,11]) {assert.ok(adventureUnlocked(s,i));completeAdventure(s,i,10);}
 assert.deepEqual(adventureState(JSON.parse(JSON.stringify(s))),s);
 const before=s.coins;completeAdventure(s,4,100);assert.equal(s.coins,before);
 assert.deepEqual(adventureState({completed:[11,5,3],position:11}).completed,[]);
});
test('winkels rekenen eenmaal af, weigeren te weinig geld en bewaren aankopen',()=>{
 const s=adventureState();assert.equal(buyAdventureGood(s,'fire'),false);
 s.coins=40;assert.ok(buyAdventureGood(s,'fire'));assert.equal(s.coins,28);
 assert.equal(buyAdventureGood(s,'fire'),false);assert.equal(s.coins,28);
 assert.ok(buyAdventureGood(s,'life'));assert.equal(s.lives,4);assert.equal(s.coins,13);
 assert.deepEqual(adventureState(JSON.parse(JSON.stringify(s))),s);
 const g=createGame(adventureLevel(0));prepareAdventureGame(g,0,s);assert.ok(g.player.fire);
});
test('alle twaalf grote velden zijn geldig, verschillend en hebben een begaanbare hoofdroute',()=>{
 const names=new Set();
 ADVENTURE_FIELDS.forEach((f,i)=>{
  const l=adventureLevel(i);assert.deepEqual(validateLevel(l),l);assert.ok(l.width>=240);names.add(l.name);
  let finished=false;
  for(const period of f.kind==='castle'?[0]:[48,60,66,72,78,90,96,108,120,144]) {
  let held=0;
  const g=createGame(l);g.enemies=[];g.hazards=[];
  // Check the ordinary route separately from combat; retain terrain and lava.
  g.tiles=g.tiles.map(row=>row.map(id=>[9,14,15,19,30,31,45].includes(id)?0:id));
  for(let frame=0;frame<120*120&&g.state==='playing';frame++){
   const water=f.kind==='water';
   let jump=water ? g.player.y>(l.tiles.length-7)*TILE && g.player.x<(g.finish.x-3)*TILE : frame%period<period*.65;
   if(f.kind==='castle'){
    // Land on each bridge, jump to the high bypass, then walk off onto the
    // next safe floor. Keep the firebars and lava active throughout the route.
    const p=g.player,x=p.x/TILE,foot=(p.y+p.h)/TILE;
    const offset=x-(12+24*Math.floor((x-8)/24));
    jump=false;
    if(p.grounded){held=0;jump=offset>=-3&&offset<0&&foot>13 || offset>=4&&offset<8&&foot<12;}
    else if(held>0&&held<90)jump=true;
    if(jump)held++;
   }
   stepGame(g,{right:g.player.x<g.finish.x*TILE+5,jump});
  }
  if(g.state==='won'){finished=true;break;}
  }
  assert.ok(finished,l.name);
 });assert.equal(names.size,12);
});
test('kasteelfinish blijft gesloten tot de echte eindbaas verslagen is, ook in snapshots',()=>{
 const l=adventureLevel(2),g=createGame(l);prepareAdventureGame(g,2,adventureState());
 const boss=g.enemies.find(e=>e.boss);assert.equal(boss.hp,5);
 Object.assign(g.player,{x:g.finish.x*TILE+5,y:g.finish.y*TILE});stepGame(g,{});assert.equal(g.state,'playing');
 // Fireballs hit the boss using the existing combat rules, rather than removing it in UI.
 g.enemies=[boss];g.player.x=boss.x-90;g.player.y=boss.y;g.player.fire=true;
 for(let frame=0;frame<120*12&&boss.alive;frame++)stepGame(g,{fire:true});
 assert.equal(boss.alive,false);
 Object.assign(g.player,{x:g.finish.x*TILE+5,y:g.finish.y*TILE});stepGame(g,{});assert.equal(g.state,'won');
 const coop=createCoopGame(l);prepareAdventureGame(coop,2,adventureState());
 const restored=unpackCoopGame(packCoopGame(coop));assert.equal(restored.enemies.find(e=>e.boss).hp,5);
});

test('maanreis telt af, vliegt naar boven en komt pas na de lancering los',()=>{
 const g=createGame(adventureLevel(4));g.theme='grass';g.enemies=[];
 Object.assign(g.player,{rocketStage:'fuse',rocketFuse:6.6,rocketLastCount:6});g.rocketIntro=2.4;
 const y=g.player.y;let launched=false,detached=false;
 for(let frame=0;frame<120*15;frame++){
  stepGame(g,{});
  if(g.events.includes('rocketlaunch'))launched=true;
  if(g.events.includes('rocketdetach')){detached=true;break;}
 }
 assert.ok(launched);assert.ok(detached);assert.ok(g.player.y<y-100);assert.equal(g.player.rocketStage,null);
});

test('zichtbaar vlagdoek rechts van de stok voltooit het eerste avonturiersveld en opent veld 2',()=>{
 const g=createGame(adventureLevel(0)),state=adventureState();prepareAdventureGame(g,0,state);
 Object.assign(g.player,{x:g.finish.x*TILE+40,y:g.finish.y*TILE-48,vy:0,grounded:false});
 stepGame(g,{});assert.equal(g.state,'won');
 completeAdventure(state,0,g.coins);assert.ok(adventureUnlocked(state,1));
});


test('alle kastelen hebben een gesloten stenen plafond en vloer met lavabaden, ook met kattenkracht en na opslag',()=>{
 for (const i of [2,5,10,11]) {
  const level=adventureLevel(i);
  assert.equal(level.theme,'castle');
  for (const y of [0,1,2,level.tiles.length-2,level.tiles.length-1]) {
   assert.ok(level.tiles[y].every(id=>id===65 || y>=level.tiles.length-2 && id===26),`${level.name}: rij ${y}`);
  }
  const game=createGame(level);game.player.cat=true;
  assert.equal(worldTheme(game),'castle');
  const restored=unpackCoopGame(packCoopGame(createCoopGame(level)));
  assert.equal(restored.theme,'castle');assert.equal(worldTheme(restored),'castle');
 }
 assert.equal(adventureLevel(0).theme,'grass');
});

test('elk kasteelmonster blijft in de eindzaal en moet voor de vlag verslagen worden',()=>{
 for(const field of [2,5,10,11]) {
  const g=createGame(adventureLevel(field));prepareAdventureGame(g,field,adventureState());
  const bosses=g.enemies.filter(e=>e.boss);assert.equal(bosses.length,1);
  const boss=bosses[0];g.enemies=[boss];
  const hp=field===11?9:5;assert.equal(boss.hp,hp);
  for(let frame=0;frame<120*60;frame++) {
   stepGame(g,{});
   assert.ok(boss.x>=boss.arenaLeft && boss.x+boss.w<=boss.arenaRight);
  }
  assert.ok(boss.alive);assert.equal(g.state,'playing');
  Object.assign(g.player,{x:g.finish.x*TILE+5,y:g.finish.y*TILE});stepGame(g,{});
  assert.equal(g.state,'playing');
  g.player.x=boss.arenaLeft-100;
  for(let hit=1;hit<=hp;hit++) {
   g.fireballs.push({kind:'fire',x:boss.x+10,y:boss.y+10,w:8,h:8,vx:0,vy:0,life:1,alive:true});
   stepGame(g,{});assert.equal(boss.hp,hp-hit);assert.equal(boss.alive,hit<hp);
   for(let frame=0;frame<20;frame++)stepGame(g,{});
  }
  Object.assign(g.player,{x:g.finish.x*TILE+5,y:g.finish.y*TILE});stepGame(g,{});
  assert.equal(g.state,'won');
  const coop=createCoopGame(adventureLevel(field));prepareAdventureGame(coop,field,adventureState());
  const restored=unpackCoopGame(packCoopGame(coop)).enemies.find(e=>e.boss);
  assert.equal(restored.arenaLeft,boss.arenaLeft);assert.equal(restored.arenaRight,boss.arenaRight);
 }
});
