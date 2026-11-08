import { TILE, createGame, stepGame, clone } from './engine.mjs?v=44';

export function createCoopGame(level, hostCharacter = 'boaz') {
  const game = createGame(level);
  game.spawnPlayer = { ...game.player };
  game.players = [game.player, { ...game.player }];
  const candidate = { ...game.player, x: game.player.x + 26 };
  let clear = candidate.x + candidate.w <= game.width * TILE;
  for (let y = Math.floor(candidate.y / TILE); y <= Math.floor((candidate.y + candidate.h - .01) / TILE); y++) {
    for (let x = Math.floor(candidate.x / TILE); x <= Math.floor((candidate.x + candidate.w - .01) / TILE); x++) {
      if (![0, 4, 9, 10, 14, 15, 16, 19, 30, 31, 41, 42, 43, 44, 45].includes(level.tiles[y]?.[x])) clear = false;
    }
  }
  if (clear) game.players[1].x = candidate.x;
  game.players.forEach((player, index) => {
    player.character = index ? (hostCharacter === 'boaz' ? 'ravi' : 'boaz') : hostCharacter;
    player.respawn = 0; player.lastJump = false; player.lastMount = false;
    player.spawn = { x: player.x, y: player.y };
    player.safeSpot = { ...player.spawn }; player.trail = []; player.fartTrail = [];
  });
  game.player = game.players[0];
  return game;
}
export function stepCoopGame(game, inputs, dt = 1 / 120) {
  if (game.state !== 'playing') return;
  const events = [];
  for (let index = 0; index < game.players.length && game.state === 'playing'; index++) {
    const p = game.players[index], wasRespawning = p.respawn > 0;
    game.player = p; game.lastJump = p.lastJump; game.lastMount = p.lastMount;
    stepGame(game, inputs[index] || {}, dt, index === 0);
    p.lastJump = game.lastJump; p.lastMount = game.lastMount;
    events.push(...game.events);
    if (game.state === 'dead') {
      p.vineId = null; p.vineGrip = 0; p.vineCooldown = .35; p.mounted = null; p.respawn = 1.5; p.vx = 0; p.vy = 0;
      game.state = 'playing';
    } else if (wasRespawning && p.respawn === 0) {
      Object.assign(p, game.spawnPlayer, p.spawn, { coins: p.coins, safeSpot: { ...p.spawn }, trail: [], fartTrail: [], invincible: 2, respawn: 0, lastJump: false, lastMount: false });
      events.push('respawn');
    }
  }
  game.player = game.players[0]; game.events = events;
}
export function packCoopGame(game) {
  const { player, random, players, ...world } = game;
  return clone({ ...world, players: players.map(p => ({ ...p, mounted: p.mounted ? game.dinos.indexOf(p.mounted) : -1 })) });
}
export function unpackCoopGame(snapshot, index = 1) {
  const game = clone(snapshot);
  game.random = Math.random;
  game.players.forEach(p => { p.mounted = game.dinos[p.mounted] || null; });
  game.player = game.players[index];
  return game;
}

export function remoteControls(packet = {}, previousTaps = {}) {
  const controls = {};
  for (const key of ['left', 'right', 'jump', 'fire', 'mount', 'pipe']) controls[key] = packet[key] === true;
  for (const action of ['jump', 'fire', 'mount', 'pipe']) {
    const count = packet.taps?.[action] || 0;
    if (count !== (previousTaps[action] || 0)) controls[action] = true;
    previousTaps[action] = count;
  }
  return controls;
}
