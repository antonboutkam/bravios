import { ENEMY_CATALOG } from './catalog.mjs';
let indexedCatalog, byKey, byTile, byKind, byWonder;
function index() {
  if(indexedCatalog===ENEMY_CATALOG && byKey && indexedCatalog.length===byKey.size)return;
  indexedCatalog=ENEMY_CATALOG;byKey=new Map();byTile=new Map();byKind=new Map();byWonder=new Map();
  for(const c of ENEMY_CATALOG){byKey.set(c.key,c);for(const id of c.tileIds)byTile.set(id,c);if(!byKind.has(c.kind))byKind.set(c.kind,c);if(c.kind==='wonder')byWonder.set(`${c.group}/${c.wonderType}`,c);}
}
export function replaceEnemyCatalog(profiles) { ENEMY_CATALOG.splice(0,ENEMY_CATALOG.length,...profiles); indexedCatalog=null; }
export function enemyProfile(enemy) {
  index();
  return byKey.get(enemy.catalogId) || (enemy.kind==='wonder'?byWonder.get(`${enemy.boss?'bosses':'game'}/${enemy.wonderType}`):byTile.get(enemy.tileId)||byKind.get(enemy.kind));
}
export function enemyProfileByKey(key) { index(); return byKey.get(key); }
export function applyEnemyProfile(enemy, profile=enemyProfile(enemy)) {
  if(!profile)return enemy;
  enemy.catalogId=profile.key;enemy.hp=profile.combat.health;enemy.maxHp=enemy.hp;
  return enemy;
}
export function enemyTileKinds() { return Object.fromEntries(ENEMY_CATALOG.flatMap(c=>c.tileIds.map(id=>[id,c.kind]))); }
export function enemySetting(enemy,key,fallback) { return enemyProfile(enemy)?.settings[key] ?? fallback; }
// Returns only the response; the engine owns collisions, damage and special animations.
export function stompResponse(enemy) {
  const c=enemyProfile(enemy)?.combat;
  return c ? c.stompable ? c.stompResponse : c.stompResponse==='ride'?'ride':'hurt' : 'damage';
}
export function enemyAssets() { return [...new Set(ENEMY_CATALOG.flatMap(c=>Object.values(c.animations).map(a=>a.image)))]; }
