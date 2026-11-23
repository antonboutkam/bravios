export const CHARACTER_EVENTS = ['onSpawn', 'onJump', 'onCollectCoin', 'onDamage', 'onSpecial', 'onWin'];

export function normalizeCharacterCallbacks(value, fail = message => { throw new Error(message); }) {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('callbacks moet een object zijn.');
  for (const [event, name] of Object.entries(value)) {
    if (!CHARACTER_EVENTS.includes(event)) fail(`Onbekende callback: ${event}.`);
    if (typeof name !== 'string' || !/^[a-zA-Z_$][a-zA-Z0-9_$]{0,63}$/.test(name) || ['constructor', 'prototype', '__proto__'].includes(name)) fail(`callbacks.${event}: gebruik de naam van een geëxporteerde functie.`);
  }
  return { ...value };
}

export function validateCallbackModule(profile, module) {
  for (const [event, name] of Object.entries(profile.callbacks || {})) {
    if (!Object.hasOwn(module, name) || typeof module[name] !== 'function' || module[name].constructor.name !== 'Function') {
      throw new Error(`gameplay/characters/${profile.id}/callbacks.js: ${event} verwijst naar ${name}; exporteer een gewone, synchrone functie met die naam.`);
    }
  }
}
