import test from 'node:test';
import assert from 'node:assert/strict';
import { drawWalkingSprite, CHARACTER_PARTS, DEFAULT_APPEARANCE, normalizeAppearance, normalizeCharacters, toggleAccessory } from '../character-maker.mjs';
import { blankLevel } from '../engine.mjs';
import { createCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

test('loopcyclus wisselt beide benen af, spiegelt met de looprichting en maakt geen nieuwe afbeeldingen',()=>{
  const surface={},bounds={x:12,y:20,width:200,height:300};
  const draw=(time,facing=1,extra={})=>{
    const calls=[];let depth=0;
    const ctx=new Proxy({}, {get:(_,key)=>(...args)=>{calls.push([key,...args]);if(key==='save')depth++;if(key==='restore')depth--;}});
    const result=drawWalkingSprite(ctx,surface,bounds,40,80,32,48,facing,{running:true,time,...extra});
    assert.equal(depth,0);return {calls,result};
  };
  const a=draw(Math.PI/36),b=draw(Math.PI/12);
  const rotations=sample=>sample.calls.filter(([name])=>name==='rotate').map(([,angle])=>angle);
  const ar=rotations(a),br=rotations(b);
  assert.equal(ar[1],-ar[2]); assert.ok(ar[1]*br[1]<0,'het voorste been wisselt na een halve pas');
  assert.deepEqual(draw(.1,-1).calls.find(([name])=>name==='scale'),['scale',-1,1]);
  const images=a.calls.filter(([name])=>name==='drawImage');
  assert.equal(images.length,3);assert.ok(images.every(([,image])=>image===surface));
  for(const pose of [{running:false},{airborne:true},{won:true},{landing:.12},{reducedMotion:true}]) {
    const sample=draw(.1,1,pose);assert.equal(sample.result,false);assert.equal(sample.calls.length,0);
  }
});

test('alle gevraagde onderdelen kunnen met elkaar worden gecombineerd', () => {
  for (const head of CHARACTER_PARTS.head) for (const outfit of CHARACTER_PARTS.outfit) for (const shoes of CHARACTER_PARTS.shoes) {
    const config = { name: 'Mijn held', head: head.id, outfit: outfit.id, shoes: shoes.id, accessories: ['glasses', 'earrings', 'paint', 'rainbow', 'mushroom'] };
    assert.deepEqual(normalizeAppearance(config), config);
  }
  assert.deepEqual(Object.values(CHARACTER_PARTS).map(parts => parts.length), [5, 7, 5, 10]);
});
test('een nieuwe hoed vervangt de oude en laat de overige accessoires staan', () => {
  let appearance = { ...DEFAULT_APPEARANCE, accessories: ['glasses', 'earrings', 'red-cap'] };
  appearance = toggleAccessory(appearance, 'motor');
  assert.deepEqual(appearance.accessories, ['glasses', 'earrings', 'motor']);
  assert.deepEqual(toggleAccessory(appearance, 'motor').accessories, ['glasses', 'earrings']);
  assert.deepEqual(toggleAccessory(appearance, 'glasses').accessories, ['earrings', 'motor']);
});
test('ongeldige opslag en kamerdata leveren geen onbekende plaatjes of dubbele hoeden op', () => {
  for (const value of [null, [], 'held', {}, { ...DEFAULT_APPEARANCE, head: '../file' }, { ...DEFAULT_APPEARANCE, shoes: null }]) assert.equal(normalizeAppearance(value), null);
  const config = normalizeAppearance({ ...DEFAULT_APPEARANCE, name: 'x'.repeat(80), accessories: ['red-cap', 'red-cap', 'motor', 'unknown', 'glasses'] });
  assert.equal(config.name.length, 32);
  assert.deepEqual(config.accessories, ['glasses', 'red-cap']);
  assert.deepEqual(normalizeAppearance({ ...DEFAULT_APPEARANCE, accessories: {} }).accessories, []);
});
test('meerdere opgeslagen helden blijven onafhankelijk en beschadigde entries worden overgeslagen', () => {
  const entries = normalizeCharacters([null, {}, { id: 'one', appearance: DEFAULT_APPEARANCE }, { id: 'one', appearance: DEFAULT_APPEARANCE }, { id: 'two', appearance: { ...DEFAULT_APPEARANCE, head: 'dino' } }]);
  assert.equal(entries.length, 2); entries[0].appearance.accessories.push('glasses');
  assert.deepEqual(entries[1].appearance.accessories, []); assert.equal(entries[1].appearance.head, 'dino');
  assert.deepEqual(normalizeCharacters({}), []);
});
test('beide eigen karakters komen mee in een samenspel snapshot', () => {
  const game = createCoopGame(blankLevel());
  game.players[0].appearance = { ...DEFAULT_APPEARANCE, name: 'Dino', head: 'dino' };
  game.players[1].appearance = { ...DEFAULT_APPEARANCE, name: 'Prinses', outfit: 'princess' };
  const copy = unpackCoopGame(packCoopGame(game));
  assert.equal(copy.players[0].appearance.head, 'dino'); assert.equal(copy.player.appearance.outfit, 'princess');
  copy.player.appearance.name = 'Nieuw'; assert.equal(game.players[1].appearance.name, 'Prinses');
});
