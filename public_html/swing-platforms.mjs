// World coordinates are pixels. Attachments use IDs, so snapshots have no object references.
export const DONUT_SECONDS = 3;
export const DONUT_BOUNCE = 720;
export function createSwingPlatforms(level) {
  const vines = [], donuts = [];
  level.tiles.forEach((row, y) => row.forEach((id, x) => {
    if (id === 99) vines.push({ id: `vine-${x}-${y}`, x: x * 32 + 16, y: y * 32 + 6, length: Math.min(128, (level.tiles.length - y) * 32 - 24), angle: 0, omega: .45 });
    if (id === 100) donuts.push({ id: `donut-${x}-${y}`, kind: 'donut', x: x * 32, y: y * 32 + 8, w: 32, h: 16, oneWay: true, phase: 'idle', remaining: DONUT_SECONDS, vy: 0 });
  }));
  return { vines, donuts };
}
export function vinePoint(vine, distance = vine.length) {
  return { x: vine.x + Math.sin(vine.angle) * distance, y: vine.y + Math.cos(vine.angle) * distance };
}
export function stepSwingPlatforms(game, dt) {
  for (const vine of game.vines || []) {
    vine.omega += (-1400 / Math.max(24, vine.length) * Math.sin(vine.angle) - vine.omega * .12) * dt;
    vine.angle += vine.omega * dt;
    if (Math.abs(vine.angle) > 1.2) { vine.angle = Math.sign(vine.angle) * 1.2; vine.omega *= -.25; }
  }
  for (const donut of game.donuts || []) {
    if (donut.phase === 'armed') {
      donut.remaining = Math.max(0, donut.remaining - dt);
      if (donut.remaining < 1e-8) { donut.remaining = 0; donut.phase = 'falling'; game.events.push('break'); }
    }
    if (donut.phase === 'falling') {
      donut.vy = Math.min(900, donut.vy + 1800 * dt); donut.y += donut.vy * dt;
      if (donut.y > game.tiles.length * 32 + 64) donut.phase = 'gone';
    }
  }
}
export function bounceDonut(game, donut, player) {
  if (donut.phase === 'idle') { donut.phase = 'armed'; donut.remaining = DONUT_SECONDS; }
  player.vy = -DONUT_BOUNCE; player.grounded = false; player.jumpCut = false;
  player.coyote = 0; player.buffer = 0; player.parachute = false; player.fallDistance = 0;
  game.events.push('spring');
}
export function clearVine(player) { player.vineId = null; player.vineGrip = 0; player.vineCooldown = .35; }
export function moveOnVine(game, input, dt, canOccupy) {
  const p = game.player;
  p.vineCooldown = Math.max(0, (p.vineCooldown || 0) - dt);
  const jumpPressed = input.jump && !game.lastJump;
  let vine = (game.vines || []).find(v => v.id === p.vineId);
  if (p.mounted || p.respawn > 0 || p.rocketStage || game.wonderland?.gravity) {
    if (p.vineId) clearVine(p);
    return false;
  }
  if (!vine && p.vineId) clearVine(p);
  if (!vine && !p.grounded && !p.vineCooldown && !jumpPressed) {
    const hand = { x: p.x + p.w / 2, y: p.y + 6 };
    for (const candidate of game.vines || []) {
      const dx = Math.sin(candidate.angle), dy = Math.cos(candidate.angle);
      const grip = Math.max(24, Math.min(candidate.length, (hand.x - candidate.x) * dx + (hand.y - candidate.y) * dy));
      const point = vinePoint(candidate, grip);
      if (Math.hypot(hand.x - point.x, hand.y - point.y) > 19) continue;
      if (!canOccupy(game, { ...p, x: point.x - p.w / 2, y: point.y - 6 })) continue;
      vine = candidate; p.vineId = vine.id; p.vineGrip = grip;
      // Preserve some of the incoming horizontal motion in the swing.
      vine.omega = Math.max(-3.3, Math.min(3.3, vine.omega + p.vx * Math.cos(vine.angle) / Math.max(24, grip) * .45));
      game.events.push('mount'); break;
    }
  }
  if (!vine) return false;
  if (jumpPressed || input.pipe) {
    p.vx = Math.max(-600, Math.min(600, Math.cos(vine.angle) * p.vineGrip * vine.omega));
    p.vy = Math.min(-300, -Math.sin(vine.angle) * p.vineGrip * vine.omega - 220);
    clearVine(p); p.grounded = false; p.coyote = 0; p.buffer = 0; p.jumpCut = false;
    game.lastJump = !!input.jump; game.events.push('jump');
    return false;
  }
  const direction = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  vine.omega = Math.max(-3.3, Math.min(3.3, vine.omega + direction * 5 * dt));
  const point = vinePoint(vine, p.vineGrip), x = point.x - p.w / 2, y = point.y - 6;
  const oldX = p.x, oldY = p.y, steps = Math.max(1, Math.ceil(Math.hypot(x - oldX, y - oldY) / 4));
  for (let i = 1; i <= steps; i++) {
    const next = { ...p, x: oldX + (x - oldX) * i / steps, y: oldY + (y - oldY) * i / steps };
    if (!canOccupy(game, next)) { clearVine(p); p.vx = p.vy = 0; break; }
    p.x = next.x; p.y = next.y;
  }
  p.vx = p.vy = 0; p.grounded = false; p.coyote = p.buffer = 0;
  p.parachute = false; p.fallDistance = 0; p.jumpCut = false;
  if (direction) p.facing = direction;
  game.lastJump = !!input.jump;
  return true;
}
