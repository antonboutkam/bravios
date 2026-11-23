import { CHARACTER_CATALOG } from './catalog.mjs';
import { CHARACTER_CALLBACK_IMPORTS } from './callback-imports.mjs';
import { validateCallbackModule } from './callback-schema.mjs';
import { publicURL } from '../paths.mjs';

export const SPECIAL_COOLDOWN_SECONDS = 8;
export const CALLBACK_SHIELD_SECONDS = 3;
const modules = new Map();

export async function loadCharacterCallbacks(profiles = CHARACTER_CATALOG, importer = null) {
  const revision = Date.now().toString(36);
  const loaded = await Promise.all(profiles.filter(profile => profile.callbacks).map(async profile => {
    try {
      let module;
      if (importer) module = await importer(profile);
      else if (globalThis.braviosOffline || typeof location === 'undefined') module = await CHARACTER_CALLBACK_IMPORTS[profile.id]?.();
      else {
        const url = publicURL(`gameplay/characters/${profile.id}/callbacks.js`);
        url.searchParams.set('callbacks', revision);
        module = await import(url.href);
      }
      validateCallbackModule(profile, module || {});
      return [profile.id, module];
    } catch (error) { throw new Error(`gameplay/characters/${profile.id}/callbacks.js: ${error.message}`); }
  }));
  modules.clear();
  for (const [id, module] of loaded) modules.set(id, module);
}

function profileFor(player) {
  return CHARACTER_CATALOG.find(profile => profile.id === (player.character || CHARACTER_CATALOG[0].id));
}
function stateFor(player) {
  if (!player.callbackState || player.callbackState.character !== player.character) {
    player.callbackState = { character: player.character, spawned: false, won: false, data: {}, bonusPoints: 0, specialCooldown: 0, lastSpecial: false, shieldTime: 0, message: '', messageTime: 0, error: '', disabled: [] };
  }
  return player.callbackState;
}
function validData(data) {
  return data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length <= 32 && Object.entries(data).every(([key, value]) => /^[a-zA-Z][a-zA-Z0-9_]{0,31}$/.test(key) && !['constructor', 'prototype'].includes(key) && (value === null || typeof value === 'boolean' || typeof value === 'string' && value.length <= 160 || typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= 1000000));
}
function number(value, max) { return Number.isFinite(value) ? Math.max(0, Math.min(max, value)) : 0; }
function shortText(value, max) { return Array.from(String(value)).slice(0, max).join(''); }

export function runCharacterCallback(game, player, event, details = {}) {
  const profile = profileFor(player), name = profile?.callbacks?.[event], module = modules.get(profile?.id);
  if (!name || !module) return false;
  const state = stateFor(player);
  if (state.disabled.includes(event)) return false;
  // Apply commands only after the callback and its data have passed validation.
  const commands = [], data = { ...state.data };
  let active = true;
  const queue = command => { if (active) commands.push(command); };
  const context = Object.freeze({
    event: Object.freeze({ ...details, type: event }), data,
    player: Object.freeze({ character: profile.id, health: player.health, maxHealth: player.maxHealth, power: player.power, maxPower: player.maxPower, coins: player.coins || 0, bonusPoints: state.bonusPoints }),
    showMessage: (text, seconds = 2) => {
      const message = shortText(text, 100), duration = number(seconds, 5);
      queue(() => { state.message = message; state.messageTime = duration; });
    },
    addBonusPoints: amount => queue(() => { state.bonusPoints = Math.min(1000000, state.bonusPoints + Math.floor(number(amount, 10))); }),
    heal: (amount = 1) => queue(() => { if (player.health > 0 && !(player.respawn > 0)) player.health = Math.min(player.maxHealth, player.health + Math.floor(number(amount, 1))); }),
    giveShield: (seconds = CALLBACK_SHIELD_SECONDS) => queue(() => { if (player.health > 0) state.shieldTime = Math.max(state.shieldTime, number(seconds, CALLBACK_SHIELD_SECONDS)); })
  });
  try {
    const result = module[name](context);
    active = false;
    if (result && typeof result.then === 'function') { Promise.resolve(result).catch(() => {}); throw new Error('Gebruik een synchrone functie, zonder async of Promise.'); }
    if (!validData(data)) throw new Error('context.data: maximaal 32 korte velden met een getal, tekst, boolean of null.');
    state.data = { ...data };
    for (const command of commands) command();
    return true;
  } catch (error) {
    active = false;
    state.disabled.push(event);
    state.error = shortText(`${profile.id} · ${event} (${name}): ${error?.message || String(error)}`, 240);
    return false;
  }
}

export function stepCharacterCallbacks(game, player, input, dt) {
  const profile = profileFor(player);
  if (!profile?.callbacks || !modules.has(profile.id)) return;
  const state = stateFor(player);
  state.specialCooldown = Math.max(0, state.specialCooldown - dt);
  state.shieldTime = Math.max(0, state.shieldTime - dt);
  state.messageTime = Math.max(0, state.messageTime - dt);
  const pressed = !!input.special && !state.lastSpecial;
  state.lastSpecial = !!input.special;
  if (player.respawn > 0) return;
  if (!state.spawned) { state.spawned = true; runCharacterCallback(game, player, 'onSpawn'); }
  if (pressed && state.specialCooldown <= 1e-8 && !player.rocketStage && profile.callbacks.onSpecial && !state.disabled.includes('onSpecial')) {
    state.specialCooldown = SPECIAL_COOLDOWN_SECONDS;
    runCharacterCallback(game, player, 'onSpecial');
  }
}

export function respawnCharacterCallbacks(player) {
  if (!player.callbackState) return;
  Object.assign(player.callbackState, { spawned: false, shieldTime: 0, specialCooldown: 0, lastSpecial: false, messageTime: 0 });
}

export function finishCharacterCallbacks(game) {
  if (game.state !== 'won') return;
  const players = game.players || [game.player];
  const best = Math.max(...players.map(player => player.coins || 0));
  for (const player of players) {
    if (!profileFor(player)?.callbacks || !modules.has(profileFor(player).id)) continue;
    if (game.challenge?.kind === 'coin-team' && game.coins < game.challenge.target || game.challenge?.kind === 'coin-race' && (player.coins || 0) !== best) continue;
    const state = stateFor(player);
    if (!state.won) { state.won = true; runCharacterCallback(game, player, 'onWin', { coins: player.coins || 0, teamCoins: game.coins }); }
  }
}
