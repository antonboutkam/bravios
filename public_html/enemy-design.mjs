import { SEA_KINDS } from './sea-life.mjs?v=4';
// Per-placement choices: original tiles remain compatible with older levels.
export const ENEMY_KINDS = { ...SEA_KINDS, 6: 'walker', 17: 'robot', 18: 'frog', 20: 'frog', 21: 'robot', 22: 'turtle', 23: 'dragon', 24: 'plant', 25: 'skeleton', 27: 'spiky', 28: 'hammer', 29: 'bomb', 61: 'crusher', 77: 'plane', 82: 'cloud', 83: 'centipede', 97: 'beetle', 98: 'spikedbeetle' };
export const EDITABLE_OBJECT_IDS = [14, 15, 19, 30, 70, 71, 72, 73, 84];
export const canEditDesign = id => Object.hasOwn(ENEMY_KINDS, id) || EDITABLE_OBJECT_IDS.includes(id);
export const ENEMY_OPTIONS = {
  head: { original: 'Eigen hoofd', mushroom: 'Paddenstoelenhoofd', turtle: 'Schildpaddenhoofd', robot: 'Robothoofd' },
  body: { original: 'Eigen lijf', turtle: 'Schildpaddenlijf', mushroom: 'Paddenstoelenlijf', robot: 'Robotlijf' },
  hat: { none: 'Geen hoed', party: 'Feesthoed', top: 'Hoge hoed', crown: 'Kroon', propeller: 'Propellerpet' },
  wings: { none: 'Geen vleugels', feather: 'Veren', bat: 'Vleermuis', butterfly: 'Vlinder' },
  wingSize: { small: 'Klein', medium: 'Middel', large: 'Groot' },
  wingColor: { cream: 'Crème', pink: 'Roze', blue: 'Blauw', green: 'Groen', purple: 'Paars', orange: 'Oranje' }
};
export const DEFAULT_ENEMY_DESIGN = { head: 'original', body: 'original', hat: 'none', wings: 'none', wingSize: 'medium', wingColor: 'cream', fly: false };
export const canGiveFlight = id => Object.hasOwn(ENEMY_KINDS, id) && id < 85 && ![23,24,61,77,82,83].includes(id);
export function validateEnemyDesign(value, tileId) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Ongeldig vijandontwerp.');
  const result = {};
  for (const [key, options] of Object.entries(ENEMY_OPTIONS)) {
    const option = value[key] ?? DEFAULT_ENEMY_DESIGN[key];
    if (typeof option !== 'string' || !Object.hasOwn(options, option)) throw new Error('Onbekend onderdeel van een vijand.');
    result[key] = option;
  }
  result.fly = value.fly ?? false;
  if (typeof result.fly !== 'boolean' || result.fly && (result.wings === 'none' || !canGiveFlight(tileId))) throw new Error('Deze vijand kan zo niet vliegen.');
  if (tileId === 83) {
    result.length = value.length ?? 4;
    if (!Number.isInteger(result.length) || result.length < 2 || result.length > 10) throw new Error('Kies een lengte van 2 tot 10 delen.');
  }
  return result;
}
export function validateEnemyDesigns(entries, tiles) {
  if (!Array.isArray(entries) || entries.length > 256) throw new Error('Maximaal 256 bewerkte vijanden per veld.');
  const seen = new Set();
  return entries.map(entry => {
    if (!entry || !Number.isInteger(entry.x) || !Number.isInteger(entry.y) || !Number.isInteger(entry.tileId) || !canEditDesign(entry.tileId) || tiles[entry.y]?.[entry.x] !== entry.tileId) throw new Error('Een vijandontwerp staat niet op de bijbehorende vijand.');
    const key = `${entry.x},${entry.y}`;
    if (seen.has(key)) throw new Error('Deze vijand heeft twee ontwerpen.');
    seen.add(key);
    return { x: entry.x, y: entry.y, tileId: entry.tileId, design: validateEnemyDesign(entry.design, entry.tileId) };
  });
}
export function pruneEnemyDesigns(level) {
  if (!level.enemyDesigns) return;
  level.enemyDesigns = level.enemyDesigns.filter(e => level.tiles[e.y]?.[e.x] === e.tileId);
  if (!level.enemyDesigns.length) delete level.enemyDesigns;
}
export function saveEnemyDesign(level, x, y, design) {
  const tileId = level.tiles[y]?.[x];
  const entries = (level.enemyDesigns || []).filter(e => e.x !== x || e.y !== y);
  const normalized = validateEnemyDesign(design, tileId);
  if (normalized.length !== undefined || Object.keys(DEFAULT_ENEMY_DESIGN).some(k => normalized[k] !== DEFAULT_ENEMY_DESIGN[k])) entries.push({ x, y, tileId, design: normalized });
  const validated = validateEnemyDesigns(entries, level.tiles);
  if (validated.length) level.enemyDesigns = validated; else delete level.enemyDesigns;
}
