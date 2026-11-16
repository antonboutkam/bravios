// Pinball keeps the level's collision coordinates. Gravity is projected onto
// the tilted board; the renderer tilts the whole scene, limited at screen edges.
export const PINBALL_MAX_TILT = Math.PI * 8 / 180;
export const PINBALL_MAX_SPEED = 330;
export function isPinball(player) { return player?.character === 'pinball' && !player.appearance; }
export function activePinball(player) {
  return isPinball(player) && !player.mounted && !player.cat && !player.respawn && !player.rocketStage && !player.vineId;
}
export function fitPinball(player, scale = 1) {
  if (!isPinball(player) || player.mounted || player.cat) return;
  const size = 24 * scale;
  player.x += (player.w - size) / 2;
  player.y += player.h - size;
  player.w = player.h = size;
}
export function stepPinballTilt(game, inputs, dt) {
  if (game.state !== 'playing' || game.keyReveal || game.reverseIntro > 0 || game.rocketIntro > 0) return;
  const players = game.players || [game.player];
  let direction = 0, count = 0;
  for (let i = 0; i < players.length; i++) {
    if (!activePinball(players[i])) continue;
    const input = inputs[i] || {};
    direction += (input.right ? 1 : 0) - (input.left ? 1 : 0); count++;
  }
  const target = count ? direction / count * PINBALL_MAX_TILT : 0;
  const current = game.pinballTilt || 0;
  const angle = current + (target - current) * (1 - Math.exp(-10 * Math.min(dt, 1 / 30)));
  game.pinballTilt = Math.abs(angle) < .00001 && target === 0 ? 0 : angle;
}
export function rollPinball(player, tilt, gravity, dt, slope = 0) {
  // Opposite input brakes through gravity rather than replacing velocity.
  const acceleration = gravity * Math.sin(tilt) + (player.grounded ? slope * 420 : 0);
  const velocity = player.vx + acceleration * dt;
  const resistance = player.grounded ? (45 + Math.abs(velocity) * .3) * dt : 0;
  player.vx = Math.sign(velocity) * Math.max(0, Math.abs(velocity) - resistance);
  player.vx = Math.max(-PINBALL_MAX_SPEED, Math.min(PINBALL_MAX_SPEED, player.vx));
  player.sprinting = false;
}
export function pinballCamera(game, viewport, reducedMotion = false) {
  let angle = reducedMotion ? 0 : game?.pinballTilt || 0;
  const width = viewport.right - viewport.left, height = viewport.bottom - viewport.top;
  // A small zoom keeps every corner covered while rotating the viewport.
  const zoom = a => a && width > 0 && height > 0
    ? Math.cos(a) + Math.abs(Math.sin(a)) * Math.max(width / height, height / width) : 1;
  const x = (viewport.left + viewport.right) / 2, y = (viewport.top + viewport.bottom) / 2;
  const p = game?.player;
  if (angle && p && !p.respawn) {
    const px = p.x + p.w / 2, py = p.y + p.h / 2, radius = Math.max(p.w, p.h) / 2;
    // At the start/end of a level the scrolling camera cannot move farther.
    // Limit the visual angle there instead of zooming the player off screen.
    const marginX = Math.min(radius + 8, px - viewport.left, viewport.right - px);
    const marginY = Math.min(radius + 8, py - viewport.top, viewport.bottom - py);
    const fits = a => {
      const s = zoom(a), dx = px - x, dy = py - y;
      const fx = x + s * (dx * Math.cos(a) - dy * Math.sin(a));
      const fy = y + s * (dx * Math.sin(a) + dy * Math.cos(a));
      const mx = marginX + radius * (s - 1), my = marginY + radius * (s - 1);
      return fx >= viewport.left + mx - 1e-6 && fx <= viewport.right - mx + 1e-6 && fy >= viewport.top + my - 1e-6 && fy <= viewport.bottom - my + 1e-6;
    };
    if (marginX >= radius && marginY >= radius && !fits(angle)) {
      let low = 0, high = 1;
      for (let i = 0; i < 16; i++) { const mid = (low + high) / 2; if (fits(angle * mid)) low = mid; else high = mid; }
      angle *= low;
    }
  }
  return { angle, scale: zoom(angle), x, y };
}
export function drawPinball(ctx, x, y, radius, angle = 0) {
  ctx.save(); ctx.translate(x, y);
  const metal = ctx.createRadialGradient(-radius * .35, -radius * .45, radius * .05, 0, 0, radius);
  for (const [stop, color] of [[0,'#ffffff'],[.25,'#eff2f5'],[.49,'#aab2bc'],[.62,'#525f70'],[.78,'#dce2e8'],[1,'#626d7b']]) metal.addColorStop(stop, color);
  ctx.fillStyle = metal; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#465362'; ctx.lineWidth = Math.max(.7, radius * .055); ctx.stroke();
  // A subtle curved reflection makes travel visible without adding a face.
  ctx.save(); ctx.rotate(angle); ctx.strokeStyle = '#ffffff70'; ctx.lineWidth = radius * .09;
  ctx.beginPath(); ctx.arc(0, 0, radius * .73, -.6, 1.1); ctx.stroke(); ctx.restore();
  ctx.fillStyle = '#ffffffd9'; ctx.beginPath(); ctx.ellipse(-radius * .32, -radius * .43, radius * .23, radius * .12, -.5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
