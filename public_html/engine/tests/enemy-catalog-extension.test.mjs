import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_CATALOG } from '../enemies/catalog.mjs';
test('nieuw catalogusprofiel verschijnt met vrij tegelnummer in editor en levelvalidatie',async()=>{
 const profile=structuredClone(ENEMY_CATALOG.find(c=>c.key==='game/walker'));
 Object.assign(profile,{key:'game/blue-walker',id:'blue-walker',name:'Blauwe wandelaar',tileIds:[102]});
 ENEMY_CATALOG.push(profile);
 try {
  const {ITEMS,PALETTE_GROUPS,blankLevel,validateLevel,createGame}=await import('../engine.mjs');
  assert.equal(ITEMS.find(i=>i.id===102).name,'Blauwe wandelaar');
  assert.ok(PALETTE_GROUPS.find(g=>g.id==='enemies').items.includes(102));
  const level=blankLevel(40);level.tiles[13][12]=102;validateLevel(level);
  assert.equal(createGame(level).enemies[0].catalogId,'game/blue-walker');
 }finally{ENEMY_CATALOG.pop();}
});
