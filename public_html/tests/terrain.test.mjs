import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { terrainMask, terrainVariant, periodicPixels, matchCodedTerrainEdges, TERRAIN_COUNT, TERRAIN_SHEETS } from '../terrain.mjs';
import { TERRAIN_VARIANTS, matchingTerrainVariants, terrainFits } from '../terrain-rules.mjs';
import { blankLevel, seedTerrainLevel, terrainAppearance, validateLevel, resizeLevel, createGame, stepGame, clone } from '../engine.mjs';
import { normalizeLibrary } from '../storage.mjs';
import { createCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';

test('alle zestien aansluitvormen volgen alleen gelijke grond- of baksteenburen', () => {
  for (const id of [1, 2]) for (let mask = 0; mask < 16; mask++) {
    const tiles = [[0, mask & 1 ? id : 3, 0], [mask & 8 ? id : 12, id, mask & 2 ? id : 1 + (id === 1)], [0, mask & 4 ? id : 13, 0]];
    const before = JSON.stringify(tiles);
    assert.equal(terrainMask(tiles, 1, 1), mask);
    assert.equal(JSON.stringify(tiles), before);
    tiles[1][1] = 0; // Hovering a new tile can calculate its future edges without editing the level.
    assert.equal(terrainMask(tiles, 1, 1, id), mask);
  }
  assert.equal(terrainMask([[1]], 0, 0), 0);
  assert.equal(terrainMask([[3, 3]], 0, 0), 0);
});

test('verwijderen van een blok opent de aansluitrand van de buren', () => {
  const tiles = [[2, 2, 2], [1, 1, 1]];
  assert.equal(terrainMask(tiles, 0, 0), 2);
  assert.equal(terrainMask(tiles, 2, 0), 8);
  tiles[0][1] = 0;
  assert.equal(terrainMask(tiles, 0, 0), 0);
  assert.equal(terrainMask(tiles, 2, 0), 0);
  assert.equal(terrainMask(tiles, 1, 1), 10);
});

test('varianten zijn stabiel, gebruiken alle twintig afbeeldingen en wijzigen geen leveldata', () => {
  for (const id of [1, 2]) {
    const variants = new Set();
    for (let y = 0; y < 16; y++) for (let x = 0; x < 120; x++) {
      const value = terrainVariant(x, y, id);
      assert.equal(value, terrainVariant(x, y, id));
      assert.ok(value >= 0 && value < TERRAIN_COUNT); variants.add(value);
    }
    assert.equal(variants.size, 20);
  }
  assert.notDeepEqual(Array.from({length:20}, (_, x) => terrainVariant(x, 1, 1)), Array.from({length:20}, (_, x) => terrainVariant(x, 1, 1, 1)));
});

test('beide geproduceerde PNG-vellen hebben ruimte voor een raster van vijf bij vier', async () => {
  for (const path of Object.values(TERRAIN_SHEETS)) {
    const data = await readFile(new URL(`../${path}`, import.meta.url));
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    const width = data.readUInt32BE(16), height = data.readUInt32BE(20);
    assert.ok(width >= 5 * 96 && height >= 4 * 96);
    assert.ok(Math.abs(width / height - 5 / 4) < .01);
  }
});

test('elke combinatie van vereiste randcodes heeft minstens één passende variant', () => {
  for (let mask = 0; mask < 16; mask++) for (let codes = 0; codes < 16; codes++) {
    const candidates = matchingTerrainVariants(mask, codes);
    assert.ok(candidates.length);
    for (const variant of candidates) assert.equal(TERRAIN_VARIANTS[variant].codes & mask, codes & mask);
  }
  assert.equal(terrainFits(0, 15, 'right'), false);
  assert.equal(terrainFits(0, 0, 'right'), true);
  assert.equal(terrainFits(999, 999, 'right'), false);
});

test('de engine kiest passende buren voor grote gemengde velden, gaten en meerdere seeds', () => {
  const seen = new Set();
  for (const seed of [0, 1, 42, 2147483648, 4294967295]) {
    const level = blankLevel(120, 64); level.terrainSeed = seed;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 120; x++) level.tiles[y][x] = (x * 7 + y * 13) % 11 === 0 ? 0 : x < 60 ? 1 : 2;
    const before = clone(level);
    const choices = level.tiles.map((row, y) => row.map((id, x) => terrainAppearance(level, x, y)));
    for (let y = 0; y < 64; y++) for (let x = 0; x < 120; x++) {
      const id = level.tiles[y][x]; if (!id) continue;
      const a = choices[y][x]; seen.add(a.variant);
      assert.deepEqual(terrainAppearance(level, x, y), a);
      if (level.tiles[y][x + 1] === id) assert.ok(terrainFits(a.variant, choices[y][x + 1].variant, 'right'));
      if (level.tiles[y + 1]?.[x] === id) assert.ok(terrainFits(a.variant, choices[y + 1][x].variant, 'down'));
    }
    assert.deepEqual(level, before);
  }
  assert.equal(seen.size, 20);
});

test('nieuwe werelden verschillen; opslag, bibliotheek, resize en co-op houden dezelfde keuze', () => {
  const base = blankLevel(40), before = clone(base);
  const a = seedTerrainLevel(base, () => .125), b = seedTerrainLevel(base, () => .875);
  assert.notEqual(a.terrainSeed, b.terrainSeed); assert.deepEqual(base, before);
  const appearances = level => level.tiles[14].map((id, x) => terrainAppearance(level, x, 14));
  assert.notDeepEqual(appearances(a), appearances(b));
  const restored = validateLevel(JSON.parse(JSON.stringify(a)));
  assert.deepEqual(appearances(restored), appearances(a));
  assert.deepEqual(normalizeLibrary([{id:'test',saved:1,level:a}])[0].level, a);
  assert.equal(resizeLevel(a, 72, 32).terrainSeed, a.terrainSeed);
  const host = createCoopGame(a), guest = unpackCoopGame(packCoopGame(host));
  assert.equal(guest.terrainSeed, a.terrainSeed);
  for (let x = 0; x < 40; x++) assert.deepEqual(terrainAppearance(a, x, 14, host.tiles), terrainAppearance(restored, x, 14, guest.tiles));
  for (let x = 0; x < 40; x++) assert.deepEqual(terrainAppearance(host, x, 14), terrainAppearance(guest, x, 14));
  for (const seed of [-1, 4294967296, 1.5, '1', null]) assert.throws(() => validateLevel({...a, terrainSeed:seed}));
  assert.deepEqual(validateLevel(base), base);
});

test('plaatsen, weghalen, ongedaan maken en kapotspringen herstellen alleen lokale aansluitingen', () => {
  const level = seedTerrainLevel(blankLevel(40), () => .2);
  const initial = level.tiles.map((row, y) => row.map((id, x) => terrainAppearance(level, x, y)));
  level.tiles[13][15] = 1;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 40; x++) if (Math.abs(x - 15) + Math.abs(y - 13) > 1) assert.deepEqual(terrainAppearance(level, x, y), initial[y][x]);
  level.tiles[13][15] = 0;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 40; x++) assert.deepEqual(terrainAppearance(level, x, y), initial[y][x]);
  level.tiles[10][2] = level.tiles[10][3] = 2;
  const game = createGame(level);
  for (let i = 0; i < 24; i++) stepGame(game, {});
  for (let i = 0; i < 60; i++) stepGame(game, {jump:true});
  assert.equal(game.tiles[10][2], 0);
  assert.equal(terrainAppearance(level, 3, 10, game.tiles).mask, 0);
});

test('gecodeerde afbeeldingsranden sluiten exact aan, ook waar drie of vier blokken samenkomen', () => {
  const size = 32, band = 5;
  const pixels = salt => Uint8ClampedArray.from({length:size * size * 4}, (_, i) => (i * 19 + salt * 17) % 256);
  const profiles = [1, 2].map(salt => periodicPixels(pixels(salt), size, size, band));
  const surfaces = TERRAIN_VARIANTS.map(v => matchCodedTerrainEdges(pixels(v.variant), profiles, size, size, v.codes, band));
  for (let av = 0; av < 20; av++) for (let bv = 0; bv < 20; bv++) for (const direction of ['right', 'down']) {
    if (!terrainFits(av, bv, direction)) continue;
    for (let i = 0; i < size; i++) for (let c = 0; c < 4; c++) {
      const a = direction === 'right' ? (i * size + size - 1) * 4 + c : ((size - 1) * size + i) * 4 + c;
      const b = direction === 'right' ? i * size * 4 + c : i * 4 + c;
      assert.equal(surfaces[av][a], surfaces[bv][b]);
    }
  }
  assert.notEqual(surfaces[0][16 * size * 4], surfaces[8][16 * size * 4]);
});
