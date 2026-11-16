import { CHARACTER_CATALOG } from '../../characters/catalog.mjs';
import { ENEMY_CATALOG } from '../../enemies/catalog.mjs';
export function characters3D() { return CHARACTER_CATALOG.filter(profile => profile.model3d?.file); }
// New movement/combat types need a 3D controller as well as a model.
export function enemies3D() { return ENEMY_CATALOG.filter(profile => profile.model3d?.file && profile.kind === 'walker' && profile.group === 'game'); }
export function requires3D(worldOrLevel) {
  return worldOrLevel?.kind === 'platformer3d' || !!worldOrLevel?.nodes?.some(node => node.level?.kind === 'platformer3d');
}
export function canEnter3D(identity) {
  return !identity?.appearance && characters3D().some(profile => profile.id === identity?.character);
}
export function assert3DCharacter(identity) {
  if (!canEnter3D(identity)) throw new Error('Deze wereld bevat een 3D-veld. Kies een personage met een 3D-model.');
  return characters3D().find(profile => profile.id === identity.character);
}
