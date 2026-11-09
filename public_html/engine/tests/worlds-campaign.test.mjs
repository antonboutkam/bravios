import { isWaterTheme } from '../sea-life.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { TILE, THEMES, PALETTE_GROUPS, blankLevel, validateLevel, createGame, stepGame, challengeResult, clone } from '../engine.mjs';
import { CAMPAIGN_FIELDS, TOGETHER_FIELDS, campaignLevel, togetherLevel } from '../levels.mjs';
import { createCoopGame, stepCoopGame, packCoopGame, unpackCoopGame } from '../coop.mjs';
import { drawWorld, drawRobot, drawTile } from '../art.mjs';

function advance(game, seconds, inputs = [{}, {}]) {
  for (let i = 0; i < Math.round(seconds * 120); i++) game.players ? stepCoopGame(game, inputs) : stepGame(game, inputs[0]);
}
test('winter en onder water kunnen worden bewaard en geïmporteerd', () => {
  for (const theme of ['winter', 'underwater']) {
    assert.ok(THEMES[theme]); const level = blankLevel(); level.theme = theme;
    assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
  }
});
test('tien verschillende reguliere velden zijn geldig en elk heeft een bereikbare finish zonder extra krachten', () => {
  assert.equal(CAMPAIGN_FIELDS.length, 10);
  assert.equal(new Set(CAMPAIGN_FIELDS.map(f => f.name)).size, 10);
  // These route cadences account for the parachute and the faster on-foot acceleration.
  const jumpPeriods = [72, 72, 78, 72, 46, 66, 87, 72, 48, 48];
  CAMPAIGN_FIELDS.forEach((_, index) => {
    const level = campaignLevel(index), original = clone(level), game = createGame(validateLevel(level));
    // Verify route geometry using ordinary movement, independently of enemy combat.
    game.enemies = []; game.dinos = [];
    game.tiles = game.tiles.map(row => row.map(id => [9, 14, 15, 19, 30, 31].includes(id) ? 0 : id));
    for (let frame = 0; frame < 120 * 35 && game.state === 'playing'; frame++) {
      const p = game.player, period = jumpPeriods[index];
      const jump = isWaterTheme(game.theme) ? p.y > 5 * TILE && p.x < (game.finish.x - 3) * TILE : frame % period < period * .65;
      stepGame(game, { right: p.x < game.finish.x * TILE + 5, jump });
    }
    assert.equal(game.state, 'won', level.name); assert.deepEqual(level, original);
  });
  assert.throws(() => campaignLevel(10));
});
test('zwemmen werkt midden in het water, vasthouden blijft zwemmen en de bovenkant houdt de speler tegen', () => {
  const level = blankLevel(40); level.theme = 'underwater'; const game = createGame(level);
  Object.assign(game.player, { y: 10 * TILE, grounded: false });
  const y = game.player.y; advance(game, .5, [{ jump: true }]); assert.ok(game.player.y < y - 60);
  advance(game, 3, [{ jump: true }]); assert.ok(game.player.y >= 0 && game.player.y < 4);
  advance(game, 1, [{}]); assert.ok(game.player.y > 40); assert.ok(game.player.vy <= 150);
});
test('groepen bevatten alle vijanden en beloningen precies één keer; buizen en sterren blijven apart', () => {
  const ids = PALETTE_GROUPS.flatMap(g => g.items); assert.equal(new Set(ids).size, ids.length);
  assert.equal(PALETTE_GROUPS.find(g => g.id === 'enemies').items.length, 18);
  assert.ok(PALETTE_GROUPS.find(g => g.id === 'rewards').items.includes(31));
  assert.deepEqual(PALETTE_GROUPS.find(g => g.id === 'stars').items, [14, 30]);
});
test('drie samenspeelvelden bewaren hun spelregels, score en thema in levels en snapshots', () => {
  assert.equal(TOGETHER_FIELDS.length, 3);
  for (const field of TOGETHER_FIELDS) {
    const level = togetherLevel(field.id); assert.deepEqual(validateLevel(JSON.parse(JSON.stringify(level))), level);
    const game = createCoopGame(level); const restored = unpackCoopGame(packCoopGame(game));
    assert.deepEqual(restored.challenge, level.challenge); assert.equal(restored.theme, field.theme);
    assert.ok(game.totalCoins >= level.challenge.target);
  }
  const invalid = togetherLevel(); invalid.challenge.seconds = 5; assert.throws(() => validateLevel(invalid));
});
test('munten en vraagblokken worden aan de juiste speler toegekend en respawn bewaart de score', () => {
  const game = createCoopGame(blankLevel(40)); advance(game, .2);
  game.tiles[13][2] = 4; game.tiles[13][3] = 4;
  stepCoopGame(game, [{}, {}]); assert.deepEqual(game.players.map(p => p.coins), [1, 1]); assert.equal(game.coins, 2);
  const p = game.players[1]; game.tiles[10][3] = 3;
  Object.assign(p, { x: 3 * TILE + 5, y: 11 * TILE + 2, vy: -400, grounded: false });
  stepCoopGame(game, [{}, { jump: true }]); assert.equal(p.coins, 2); assert.equal(game.coins, 3);
  p.y = 700; stepCoopGame(game, [{}, {}]); assert.ok(p.respawn > 0);
  advance(game, 1.6); assert.equal(p.coins, 2); assert.equal(p.respawn, 0);
});
test('muntjeswedstrijd stopt op tijd, negeert de vlag en toont een winnaar of gelijkspel', () => {
  const game = createCoopGame(togetherLevel());
  Object.assign(game.players[0], { x: game.finish.x * TILE + 5, y: 13 * TILE });
  stepCoopGame(game, [{}, {}]); assert.equal(game.state, 'playing');
  game.players[0].coins = 8; game.players[1].coins = 11;
  game.time = game.challenge.seconds - 1 / 120;
  stepCoopGame(game, [{}, {}]); assert.equal(game.state, 'won'); assert.deepEqual(challengeResult(game).winners, [1]);
  game.players[0].coins = 11; assert.deepEqual(challengeResult(game).winners, [0, 1]);
});
test('teamjacht slaagt alleen met het doel en pauze stopt de wedstrijdtimer', () => {
  const game = createCoopGame(togetherLevel('snow-team'));
  game.state = 'paused'; const before = packCoopGame(game); advance(game, 4); assert.deepEqual(packCoopGame(game), before);
  game.state = 'playing'; game.coins = game.challenge.target; stepCoopGame(game, [{}, {}]);
  assert.equal(game.state, 'won'); assert.equal(challengeResult(game).success, true);
  const timeout = createCoopGame(togetherLevel('snow-team')); timeout.time = timeout.challenge.seconds;
  timeout.players.forEach(p => { p.respawn = 1; }); stepCoopGame(timeout, [{}, {}]);
  assert.equal(timeout.state, 'won'); assert.equal(challengeResult(timeout).success, false);
});

function recordingContext() {
  const calls = [];
  const ctx = new Proxy({ createLinearGradient: () => ({ addColorStop() {} }), createRadialGradient: () => ({ addColorStop() {} }) }, {
    get: (target, key) => key in target ? target[key] : (...args) => { calls.push({ key, args }); },
    set: (target, key, value) => { target[key] = value; return true; }
  });
  return { ctx, calls };
}
test('renderer tekent minder buiten beeld, inclusief een tweede speler, zonder spelstand te veranderen', () => {
  const level = blankLevel(120); for (let x = 6; x < 116; x++) for (let y = 4; y < 14; y++) level.tiles[y][x] = 17;
  const game = createCoopGame(level); game.players[1].x = 100 * TILE;
  const before = packCoopGame(game), full = recordingContext(), small = recordingContext();
  drawWorld(full.ctx, level, { game }); drawWorld(small.ctx, level, { game, viewport: { left: 0, right: 640 } });
  assert.ok(small.calls.length < full.calls.length / 3);
  assert.deepEqual(packCoopGame(game), before);
  const far = recordingContext(); drawWorld(far.ctx, level, { game, viewport: { left: 3100, right: 3700 } });
  assert.ok(far.calls.some(c => c.key === 'translate' && Math.abs(c.args[0] - 3197) < 1));
});
test('gelijke robots hergebruiken hun sprite in plaats van elk pixel opnieuw te tekenen', () => {
  const previous = globalThis.OffscreenCanvas; let surfaces = 0;
  globalThis.OffscreenCanvas = class { constructor() { surfaces++; } getContext() { return recordingContext().ctx; } };
  try {
    const { ctx, calls } = recordingContext();
    for (let i = 0; i < 100; i++) drawRobot(ctx, i * TILE, 0, .1234, -1, .01234, true);
    assert.equal(surfaces, 1); assert.equal(calls.filter(c => c.key === 'drawImage').length, 100);
    assert.equal(calls.filter(c => c.key === 'fillRect').length, 0);
    for (let i = 0; i < 100; i++) drawTile(ctx, 6, i * TILE, 0);
    assert.equal(surfaces, 2); assert.equal(calls.filter(c => c.key === 'drawImage').length, 200);
  } finally { if (previous === undefined) delete globalThis.OffscreenCanvas; else globalThis.OffscreenCanvas = previous; }
});
