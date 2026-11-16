import { CHARACTER_CATALOG } from '../catalog.mjs';

export const BALANCE_BUDGET = 10;
export const DEFAULT_BALANCE = Object.freeze({ health: 5, power: 5 });
export const DEFAULT_SETTINGS_2D = Object.freeze({ parachute: true, runAnimation: 'frames', balance: DEFAULT_BALANCE });

export function normalizeSettings2D(settings, fail = message => { throw new Error(message); }) {
  if (settings !== undefined && (!settings || typeof settings !== 'object' || Array.isArray(settings))) fail('settings moet een object zijn.');
  const value = settings?.['2d'];
  if (value !== undefined && (!value || typeof value !== 'object' || Array.isArray(value))) fail('settings.2d moet een object zijn.');
  if (value?.parachute !== undefined && typeof value.parachute !== 'boolean') fail('settings.2d.parachute moet true of false zijn.');
  if (value?.runAnimation !== undefined && !['frames', 'roll'].includes(value.runAnimation)) fail('settings.2d.runAnimation moet frames of roll zijn.');
  if (value?.renderScale !== undefined && (!Number.isFinite(value.renderScale) || value.renderScale < .5 || value.renderScale > 2)) fail('settings.2d.renderScale moet een getal van 0.5 tot en met 2 zijn.');
  const balance = value?.balance === undefined ? DEFAULT_BALANCE : value.balance;
  if (!balance || typeof balance !== 'object' || Array.isArray(balance) || !Number.isInteger(balance.health) || !Number.isInteger(balance.power) || balance.health < 2 || balance.power < 2 || balance.health + balance.power !== BALANCE_BUDGET) fail('settings.2d.balance: health en power moeten hele getallen van 2 tot 8 zijn, samen precies 10.');
  return { parachute: value?.parachute ?? true, runAnimation: value?.runAnimation ?? 'frames', ...(value?.renderScale !== undefined ? { renderScale: value.renderScale } : {}), balance: { health: balance.health, power: balance.power } };
}

export function characterSettings2D(character) {
  return CHARACTER_CATALOG.find(profile => profile.id === character)?.settings?.['2d'] || DEFAULT_SETTINGS_2D;
}
