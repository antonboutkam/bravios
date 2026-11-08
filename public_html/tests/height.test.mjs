import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel, resizeLevel, validateLevel, createGame, stepGame, clone, TILE } from '../engine.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
function advance(game, seconds) { for (let i=0;i<seconds*120;i++) stepGame(game, {}); }
test('oude levels blijven geldig; nieuwe hoogtes worden opgeslagen en begrensd', () => {
  assert.deepEqual(validateLevel(blankLevel()), blankLevel());
  for (const height of [16,24,32,48,64]) {
    const level=blankLevel(40,height); assert.equal(level.tiles.length,height);
    assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))),level);
    const game=createGame(level);advance(game,.5);assert.equal(game.state,'playing');assert.equal(game.player.y+game.player.h,(height-2)*TILE);
  }
  for (const height of [15,65,32.5,'32']) {assert.throws(()=>blankLevel(40,height));assert.throws(()=>validateLevel({...blankLevel(),height}));}
});
test('verhogen voegt bovenaan ruimte toe en behoudt bestaande tegels', () => {
  const level=blankLevel(40);level.tiles[5][5]=36;const before=clone(level);const tall=resizeLevel(level,40,32);
  assert.deepEqual(tall.tiles.slice(16),level.tiles);assert.ok(tall.tiles.slice(0,16).every(row=>row.every(id=>id===0)));
  assert.deepEqual(resizeLevel(tall,40,16),level);assert.deepEqual(level,before);
  const wide=resizeLevel(tall,72);assert.equal(wide.height,32);assert.equal(wide.tiles[20][60],0);assert.equal(wide.tiles[30][60],1);assert.deepEqual(validateLevel(wide),wide);
});
test('verkleinen verwijdert bovenste rijen en bewaart het origineel', () => {
  const tall=blankLevel(40,32);tall.tiles[2][4]=9;const before=clone(tall);const lower=resizeLevel(tall,40,24);
  assert.equal(lower.tiles.length,24);assert.ok(!lower.tiles.flat().includes(9));assert.deepEqual(tall,before);
});
test('vallen en vraagblokken werken onder rij 16', () => {
  const level=blankLevel(40,32);level.tiles[29][12]=17;const game=createGame(level);advance(game,.3);assert.equal(game.enemies[0].alive,true);
  game.tiles[29][2]=36;Object.assign(game.player,{x:2*TILE+5,y:30*TILE+2,vy:-400,grounded:false});stepGame(game,{jump:true});
  assert.equal(game.player.fire,true);assert.equal(game.tiles[29][2],13);
  game.tiles.forEach(row=>row[2]=0);game.player.fire=false;advance(game,2);assert.equal(game.state,'dead');
});
test('co-op snapshots bewaren hoogte en spelers landen op de lagere grond', () => {
  const game=createCoopGame(blankLevel(40,48));for(let i=0;i<60;i++)stepCoopGame(game,[{},{}]);assert.equal(game.state,'playing');
  game.players.forEach(p=>assert.equal(p.y+p.h,46*TILE));const restored=unpackCoopGame(packCoopGame(game));assert.equal(restored.tiles.length,48);assert.deepEqual(restored.players,game.players);
});

test('onderwereld voegt een lege holte onder bestaande blokken toe zonder objecten te verplaatsen', async () => {
  const { resizeUnderground } = await import('../engine.mjs');
  const source=blankLevel(40);source.tiles[9][12]=82;source.enemyDesigns=[{x:12,y:9,tileId:82,design:{head:'original',body:'original',hat:'none',wings:'none',wingSize:'medium',wingColor:'cream',fly:false}}];
  const before=clone(source),deep=resizeUnderground(source,16);
  assert.deepEqual(source,before);assert.deepEqual(deep.tiles.slice(0,16),source.tiles);assert.deepEqual(deep.enemyDesigns,source.enemyDesigns);
  assert.ok(deep.tiles.slice(16,30).every(row=>row.every(id=>id===0)));assert.ok(deep.tiles.slice(30).every(row=>row.every(id=>id===65)));
  assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(deep))),deep);
  const taller=resizeLevel(deep,40,40);assert.equal(taller.undergroundDepth,16);assert.equal(taller.enemyDesigns[0].y,17);
  const wider=resizeLevel(deep,72);assert.equal(wider.tiles[14][60],1);assert.equal(wider.tiles[16][60],0);assert.equal(wider.tiles[30][60],65);
  assert.deepEqual(resizeUnderground(deep,0),source);
});
test('verder uitdiepen verplaatst rotsvloer, houdt eigen bouwwerken en verwijdert afgesneden ontwerpen', async () => {
  const { resizeUnderground } = await import('../engine.mjs');
  const deep=resizeUnderground(blankLevel(40),16);deep.tiles[31][10]=12;deep.tiles[20][15]=83;
  deep.enemyDesigns=[{x:15,y:20,tileId:83,design:{head:'original',body:'original',hat:'none',wings:'none',wingSize:'medium',wingColor:'cream',fly:false,length:5}}];
  const deeper=resizeUnderground(deep,32);assert.equal(deeper.tiles[30][0],0);assert.equal(deeper.tiles[31][10],12);assert.equal(deeper.tiles[46][0],65);
  const shallow=resizeUnderground(deeper,4);assert.equal(shallow.tiles.length,20);assert.equal(shallow.enemyDesigns,undefined);validateLevel(shallow);
  for(const depth of [-1,1,3,49,2.5,'16'])assert.throws(()=>resizeUnderground(blankLevel(40),depth));
  for(const depth of [-1,0,3,17,null,'16'])assert.throws(()=>validateLevel({...deep,undergroundDepth:depth}));
  assert.throws(()=>resizeLevel(deep,40,24));
});
test('door een opening vallen landt op de ondergrondse vloer, ook met twee spelers', async () => {
  const { resizeUnderground } = await import('../engine.mjs');
  const level=resizeUnderground(blankLevel(40),16);for(const y of [14,15])for(const x of [2,3,4])level.tiles[y][x]=0;
  const game=createGame(level);advance(game,10);assert.equal(game.state,'playing');assert.equal(game.player.y+game.player.h,30*TILE);
  const coop=createCoopGame(level);for(let i=0;i<1200;i++)stepCoopGame(coop,[{},{}]);
  assert.ok(coop.players.every(p=>p.y+p.h===30*TILE && !p.respawn));
  const restored=unpackCoopGame(packCoopGame(coop));assert.equal(restored.sceneLevel.undergroundDepth,16);assert.deepEqual(restored.players,coop.players);
});
