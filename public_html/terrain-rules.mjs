// Complete two-colour edge catalog: every combination exists, so edits cannot
// leave a hole in the landscape or require a search through the entire level.
export const RULE_TILE_COUNT = 20;
export const RULE_JOIN = { up: 1, right: 2, down: 4, left: 8 };
export const TERRAIN_VARIANTS = Object.freeze(Array.from({ length: RULE_TILE_COUNT }, (_, variant) => {
  const codes = variant < 16 ? variant : [0, 15, 5, 10][variant - 16];
  return Object.freeze({ variant, codes, edges: Object.freeze({
    up: codes & 1 ? 1 : 0, right: codes & 2 ? 1 : 0,
    down: codes & 4 ? 1 : 0, left: codes & 8 ? 1 : 0
  }) });
}));
const terrainCandidateLists = Array.from({ length: 16 }, (_, mask) => Array.from({ length: 16 }, (_, codes) =>
  Object.freeze(TERRAIN_VARIANTS.filter(v => (v.codes & mask) === (codes & mask)).map(v => v.variant))));

export function terrainConnections(tiles, x, y, id = tiles[y]?.[x]) {
  if (id !== 1 && id !== 2) return 0;
  return (tiles[y - 1]?.[x] === id ? 1 : 0) | (tiles[y]?.[x + 1] === id ? 2 : 0) |
    (tiles[y + 1]?.[x] === id ? 4 : 0) | (tiles[y]?.[x - 1] === id ? 8 : 0);
}

function terrainNoise(x, y, id, seed, salt) {
  let n = Math.imul(x + 1, 0x45d9f3b) ^ Math.imul(y + 1, 0x27d4eb2d) ^ Math.imul(id, 0x165667b1) ^ seed ^ salt;
  n = Math.imul(n ^ n >>> 16, 0x45d9f3b);
  return ((n ^ n >>> 16) >>> 0) / 4294967296;
}

export function matchingTerrainVariants(mask, codes) { return terrainCandidateLists[mask & 15][codes & 15]; }

export function terrainChoice(tiles, x, y, seed = 0, id = tiles[y]?.[x]) {
  const mask = terrainConnections(tiles, x, y, id);
  // A shared boundary has one address: both neighbours therefore ask for the
  // same code, regardless of drawing order, culling, snapshot identity or edits.
  const horizontal = (xx, yy) => terrainNoise(xx, yy, id, seed, 0x193af247) < .5;
  const vertical = (xx, yy) => terrainNoise(xx, yy, id, seed, 0x79a31ed1) < .5;
  const codes = (horizontal(x, y) ? 1 : 0) | (vertical(x + 1, y) ? 2 : 0) |
    (horizontal(x, y + 1) ? 4 : 0) | (vertical(x, y) ? 8 : 0);
  const candidates = matchingTerrainVariants(mask, codes);
  const variant = candidates[Math.floor(terrainNoise(x, y, id, seed, 0xb1da53e9) * candidates.length)];
  return { mask, variant };
}

export function terrainFits(first, second, direction) {
  const opposite = { up: 'down', right: 'left', down: 'up', left: 'right' }[direction];
  return !!opposite && TERRAIN_VARIANTS[first]?.edges[direction] === TERRAIN_VARIANTS[second]?.edges[opposite] && !!TERRAIN_VARIANTS[first] && !!TERRAIN_VARIANTS[second];
}
