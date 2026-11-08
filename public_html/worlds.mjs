import { THEMES, blankLevel, clone, resizeLevel, seedTerrainLevel, validateLevel, positions } from './engine.mjs?v=44';

export const WORLD_MAP = { width: 1000, height: 600, maxNodes: 40, maxWorlds: 20 };
export function worldId() { return globalThis.crypto?.randomUUID?.() || `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; }
const validId = id => typeof id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
export function createWorld(name = 'Mijn wereld') {
  return { version: 1, id: worldId(), name: name.trim().slice(0, 48) || 'Mijn wereld', nodes: [], links: [], completed: [] };
}
export function validateWorld(raw) {
  if (!raw || raw.version !== 1 || !validId(raw.id) || typeof raw.name !== 'string' || !raw.name.trim() || raw.name.length > 48 || !Array.isArray(raw.nodes) || raw.nodes.length > WORLD_MAP.maxNodes || !Array.isArray(raw.links) || raw.links.length > 780) throw new Error('Dit is geen geldige Bravios-wereld.');
  const ids = new Set();
  const nodes = raw.nodes.map(node => {
    if (!node || !validId(node.id) || ids.has(node.id) || !Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 32 || node.x > 968 || node.y < 32 || node.y > 540) throw new Error('Deze wereld heeft een ongeldig veld.');
    ids.add(node.id);
    return { id: node.id, x: node.x, y: node.y, level: node.level == null ? null : validateLevel(node.level) };
  });
  const links = [];
  for (const pair of raw.links) {
    if (!Array.isArray(pair) || pair.length !== 2 || pair[0] === pair[1] || !pair.every(id => ids.has(id))) throw new Error('Deze wereld heeft een ongeldige verbinding.');
    if (!links.some(([a,b]) => a === pair[0] && b === pair[1] || a === pair[1] && b === pair[0])) links.push([...pair]);
  }
  const configured = new Set(nodes.filter(n => n.level).map(n => n.id));
  return { version: 1, id: raw.id, name: raw.name.trim(), nodes, links, completed: [...new Set((Array.isArray(raw.completed) ? raw.completed : []).filter(id => configured.has(id)))] };
}
export function normalizeWorlds(raw) {
  if (!Array.isArray(raw)) return [];
  const worlds = [];
  for (const value of raw) {
    try { const world = validateWorld(value); if (!worlds.some(w => w.id === world.id) && worlds.length < WORLD_MAP.maxWorlds) worlds.push(world); } catch { /* Keep valid worlds when an old entry is damaged. */ }
  }
  return worlds;
}
export function addWorldNode(world, x, y) {
  if (world.nodes.length >= WORLD_MAP.maxNodes) throw new Error('Er passen maximaal 40 velden in een wereld.');
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new Error('Kies een plek op de kaart.');
  const node = { id: worldId(), x: Math.max(32, Math.min(968, x)), y: Math.max(32, Math.min(540, y)), level: null };
  if (world.nodes.some(n => Math.hypot(n.x - node.x, n.y - node.y) < 65)) throw new Error('Zet de rondjes iets verder uit elkaar.');
  world.nodes.push(node); return node;
}
export function toggleWorldLink(world, from, to) {
  if (from === to || ![from,to].every(id => world.nodes.some(n => n.id === id))) return false;
  const index = world.links.findIndex(([a,b]) => a === from && b === to || a === to && b === from);
  if (index < 0) world.links.push([from,to]); else world.links.splice(index,1);
  return true;
}
export function removeWorldNode(world, id) {
  world.nodes = world.nodes.filter(n => n.id !== id);
  world.links = world.links.filter(pair => !pair.includes(id));
  world.completed = world.completed.filter(done => done !== id);
}
export function saveWorldNodeLevel(world, id, data) {
  const node = world.nodes.find(n => n.id === id);
  if (!node) throw new Error('Dit veld bestaat niet meer.');
  const level = validateLevel(data);
  if (JSON.stringify(node.level) !== JSON.stringify(level)) world.completed = world.completed.filter(done => done !== id);
  node.level = level; return node;
}
export function configureWorldNode(world, id, { name, theme, width, height }) {
  const node = world.nodes.find(n => n.id === id);
  if (!node || typeof name !== 'string' || !name.trim() || name.length > 48 || !Object.hasOwn(THEMES, theme) || !Number.isInteger(width) || width < 20 || width > 360 || !Number.isInteger(height) || height < 16 || height > 64) throw new Error('Kies een naam, omgeving, breedte (20–360) en hoogte (16–64).');
  const previous = node.level;
  const next = previous ? resizeLevel(previous, width, height) : seedTerrainLevel(blankLevel(width, height));
  // Keep the start and finish when a smaller field crops their original cells.
  if (previous) for (const tile of [10,11]) if (positions(previous,tile).length && !positions(next,tile).length) {
    const x = tile === 10 ? 2 : width - 4, y = height - (next.undergroundDepth || 0) - 3;
    for (let yy = Math.max(0,y-2); yy <= y; yy++) next.tiles[yy][x] = 0;
    next.tiles[y][x] = tile;
  }
  if (!previous && theme === 'castle') for (const y of [0,1,2,height-2,height-1]) next.tiles[y].fill(65);
  next.name = name.trim(); next.theme = theme;
  return saveWorldNodeLevel(world,id,next);
}
