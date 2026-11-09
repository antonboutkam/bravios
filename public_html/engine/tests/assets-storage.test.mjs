import test from 'node:test';
import assert from 'node:assert/strict';
import { blankLevel } from '../engine.mjs';
import { normalizeLibrary, savedLevelDetail } from '../storage.mjs';
import { spriteCutout } from '../art.mjs';

test('onvolledige opgeslagen entries veroorzaken geen fout in Mijn levels', () => {
  const level = blankLevel();
  const normalized = normalizeLibrary([null, {}, { level: null }, { id: 'good', level, saved: Date.now() }, { version: 1 }, { id: 'bad-date', level, saved: 1e100 }]);
  assert.equal(normalized.length, 2);
  for (const entry of normalized) assert.doesNotThrow(() => savedLevelDetail(entry));
  assert.deepEqual(normalizeLibrary(null), []);
});

test('oude losse levels in een collectie worden behouden', () => {
  const level = blankLevel();
  const [entry] = normalizeLibrary([level]);
  assert.deepEqual(entry.level, level);
  assert.ok(entry.id);
  assert.doesNotThrow(() => savedLevelDetail(entry));
});

test('blauwe achtergrond verdwijnt, blauwe kleding binnen de omtrek blijft zichtbaar', () => {
  const size = 7, pixels = new Uint8ClampedArray(size * size * 4);
  const set = (x, y, color) => pixels.set(color, (y * size + x) * 4);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) set(x, y, [45, 160, 245, 255]);
  for (let y = 1; y < 6; y++) for (let x = 1; x < 6; x++) set(x, y, [20, 20, 20, 255]);
  set(3, 3, [40, 100, 190, 255]);
  const bounds = spriteCutout(pixels, size, size);
  assert.deepEqual(bounds, { x: 1, y: 1, width: 5, height: 5 });
  assert.equal(pixels[3], 0);
  assert.equal(pixels[(3 * size + 3) * 4 + 3], 255);
});

test('al transparante achtergrond en een leeg plaatje worden correct verwerkt', () => {
  const pixels = new Uint8ClampedArray(3 * 3 * 4);
  pixels.set([250, 230, 100, 255], (1 * 3 + 1) * 4);
  assert.deepEqual(spriteCutout(pixels, 3, 3), { x: 1, y: 1, width: 1, height: 1 });
  assert.equal(spriteCutout(new Uint8ClampedArray(3 * 3 * 4), 3, 3), null);
});
