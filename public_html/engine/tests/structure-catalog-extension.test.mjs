import test from 'node:test';
import assert from 'node:assert/strict';
import {STRUCTURE_CATALOG} from '../structures/catalog.mjs';
test('een nieuw JSON-profiel krijgt automatisch een bouwknop, botsing en breekgedrag',async()=>{
 const c=structuredClone(STRUCTURE_CATALOG.find(c=>c.key==='terrain/rock'));
 Object.assign(c,{id:'blue-rock',key:'terrain/blue-rock',name:'Blauwe rots',tileIds:[110]});c.collision.breakFromBelow=true;STRUCTURE_CATALOG.push(c);
 try{
  const {ITEMS,PALETTE_GROUPS,blankLevel,validateLevel,createGame,stepGame}=await import('../engine.mjs');
  assert.equal(ITEMS.find(i=>i.id===110).name,'Blauwe rots');assert.ok(PALETTE_GROUPS.find(g=>g.id==='terrain').items.includes(110));
  const level=blankLevel(50);level.tiles[10][12]=110;validateLevel(level);const g=createGame(level);Object.assign(g.player,{x:12*32+5,y:352.5,vy:-300});stepGame(g,{});assert.equal(g.tiles[10][12],0);
 }finally{STRUCTURE_CATALOG.pop();}
});
