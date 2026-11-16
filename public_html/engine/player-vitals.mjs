import { characterSettings2D, DEFAULT_BALANCE } from './characters/shared/settings.mjs?v=health-power-1';

export const POWER_RECHARGE_SECONDS = 6;
export function vitalLimits(character) {
  const balance = characterSettings2D(character).balance || DEFAULT_BALANCE;
  return { maxHealth: balance.health, maxPower: balance.power };
}
export function resetPlayerVitals(player) {
  Object.assign(player, vitalLimits(player.character));
  player.health = player.maxHealth; player.power = player.maxPower;
}
export function ensurePlayerVitals(player) {
  const limits = vitalLimits(player.character);
  // Old saves start full; changed character stats keep the remaining fraction.
  if (player.maxHealth !== limits.maxHealth || player.maxPower !== limits.maxPower) {
    player.health = Number.isFinite(player.health) && player.maxHealth > 0 ? Math.ceil(player.health / player.maxHealth * limits.maxHealth) : limits.maxHealth;
    player.power = Number.isFinite(player.power) && player.maxPower > 0 ? player.power / player.maxPower * limits.maxPower : limits.maxPower;
    Object.assign(player, limits);
  }
  player.health = Number.isFinite(player.health) ? Math.max(0, Math.min(player.maxHealth, Math.floor(player.health))) : player.maxHealth;
  player.power = Number.isFinite(player.power) ? Math.max(0, Math.min(player.maxPower, player.power)) : player.maxPower;
}
export function rechargePower(player, dt) {
  if (player.health > 0 && !(player.respawn > 0)) player.power = Math.min(player.maxPower, player.power + player.maxPower * dt / POWER_RECHARGE_SECONDS);
}
export function spendPower(player) {
  if (player.health <= 0 || player.power < 1 - 1e-9) return false;
  player.power = Math.max(0, player.power - 1); return true;
}
export function playerHealthScale(player) {
  if (!Number.isFinite(player.health) || !(player.maxHealth > 1)) return 1;
  return .6 + .4 * Math.max(0, Math.min(1, (player.health - 1) / (player.maxHealth - 1)));
}
