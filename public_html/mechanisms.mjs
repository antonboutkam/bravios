// Moving machinery uses the same 32-pixel world coordinates as the game.
const MECH_TILE = 32;
export function validateBelts(value, width, height) {
  if (!Array.isArray(value) || value.length > 32) throw new Error('Maximaal 32 lopende banden per veld.');
  return value.map(belt => {
    const point = p => p && Number.isInteger(p.x) && Number.isInteger(p.y) && p.x >= 0 && p.x < width && p.y >= 0 && p.y < height;
    if (!belt || !point(belt.a) || !point(belt.b) || belt.a.x === belt.b.x && belt.a.y === belt.b.y) throw new Error('Een lopende band heeft twee verschillende assen binnen het veld nodig.');
    return { a: { x: belt.a.x, y: belt.a.y }, b: { x: belt.b.x, y: belt.b.y } };
  });
}
export function beltNearCell(belt, x, y) {
  const dx = belt.b.x - belt.a.x, dy = belt.b.y - belt.a.y;
  const t = Math.max(0, Math.min(1, ((x - belt.a.x) * dx + (y - belt.a.y) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - belt.a.x - dx * t, y - belt.a.y - dy * t) <= .9;
}
export function beltGeometry(belt) {
  const ax = (belt.a.x + .5) * MECH_TILE, ay = (belt.a.y + .5) * MECH_TILE;
  const bx = (belt.b.x + .5) * MECH_TILE, by = (belt.b.y + .5) * MECH_TILE;
  const distance = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / distance, uy = (by - ay) / distance;
  return { ax, ay, bx, by, distance, ux, uy, nx: -uy, ny: ux, radius: 12, length: 2 * distance + 24 * Math.PI };
}
export function beltPoint(g, offset) {
  let s = ((offset % g.length) + g.length) % g.length;
  if (s < g.distance) return { x: g.ax + g.nx * g.radius + g.ux * s, y: g.ay + g.ny * g.radius + g.uy * s };
  s -= g.distance;
  if (s < Math.PI * g.radius) {
    const angle = s / g.radius;
    return { x: g.bx + g.radius * (g.nx * Math.cos(angle) + g.ux * Math.sin(angle)), y: g.by + g.radius * (g.ny * Math.cos(angle) + g.uy * Math.sin(angle)) };
  }
  s -= Math.PI * g.radius;
  if (s < g.distance) return { x: g.bx - g.nx * g.radius - g.ux * s, y: g.by - g.ny * g.radius - g.uy * s };
  const angle = (s - g.distance) / g.radius;
  return { x: g.ax - g.radius * (g.nx * Math.cos(angle) + g.ux * Math.sin(angle)), y: g.ay - g.radius * (g.ny * Math.cos(angle) + g.uy * Math.sin(angle)) };
}
export function createMechanisms(level) {
  const movingWalls = [];
  level.tiles.forEach((row, y) => row.forEach((id, x) => {
    if (![46, 47].includes(id)) return;
    const startY = y * MECH_TILE, limit = (level.tiles.length - 2) * MECH_TILE;
    let endY = Math.max(0, Math.min(limit, startY + (id === 46 ? -96 : 96)));
    if (endY === startY) endY = Math.max(0, Math.min(limit, startY + (id === 46 ? 96 : -96)));
    movingWalls.push({ id: `wall-${x}-${y}`, x: x * MECH_TILE, y: startY, w: 64, h: 64, startY, endY, previousX: x * MECH_TILE, previousY: startY, dx: 0, dy: 0, oneWay: false });
  }));
  const belts = (level.belts || []).map((definition, index) => {
    const geometry = beltGeometry(definition), count = Math.max(2, Math.min(64, Math.floor(geometry.length / 96)));
    return { ...definition, geometry, running: true, platforms: Array.from({ length: count }, (_, i) => ({ id: `belt-${index}-${i}`, x: 0, y: 0, w: 24, h: 32, previousX: 0, previousY: 0, dx: 0, dy: 0, oneWay: true })) };
  });
  const state = { movingWalls, belts, mechanismTime: 0 };
  stepMechanisms(state, 0);
  for (const body of mechanismBodies(state)) { body.previousX = body.x; body.previousY = body.y; body.dx = body.dy = 0; }
  return state;
}
export function mechanismBodies(game) {
  if (!game.movingWalls?.length && !game.belts?.length && !game.donuts?.length) return [];
  return [...(game.movingWalls || []), ...(game.belts || []).flatMap(belt => belt.platforms), ...(game.donuts || []).filter(d => d.phase === 'idle' || d.phase === 'armed')];
}
export function stepMechanisms(game, dt) {
  game.mechanismTime = (game.mechanismTime || 0) + dt;
  const time = game.mechanismTime, leg = Math.floor((time + 1e-8) / 3), progress = Math.max(0, Math.min(1, (time - leg * 3) / 3));
  const eased = progress * progress * (3 - 2 * progress), fraction = leg % 2 ? 1 - eased : eased;
  const cycle = Math.floor((time + 1e-8) / 5), phase = Math.max(0, time - cycle * 5);
  const movingSeconds = cycle * 3 + Math.min(3, phase);
  for (const wall of game.movingWalls || []) {
    wall.previousX = wall.x; wall.previousY = wall.y;
    wall.y = wall.startY + (wall.endY - wall.startY) * fraction; wall.dx = 0; wall.dy = wall.y - wall.previousY;
  }
  for (const belt of game.belts || []) {
    belt.running = phase < 3 - 1e-8;
    belt.platforms.forEach((body, i) => {
      body.previousX = body.x; body.previousY = body.y;
      const point = beltPoint(belt.geometry, movingSeconds * 60 + i * belt.geometry.length / belt.platforms.length);
      body.x = point.x - body.w / 2; body.y = point.y - body.h;
      body.dx = body.x - body.previousX; body.dy = body.y - body.previousY;
    });
  }
}
