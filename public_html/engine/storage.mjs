import { validateLevel } from './engine.mjs?v=44';

export function normalizeLibrary(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.flatMap(entry => {
    try {
      if (!entry || typeof entry !== 'object') return [];
      // Accept older collections that stored the level directly.
      const level = validateLevel(entry.level ?? entry);
      const timestamp = Number(entry.saved);
      const date = new Date(timestamp);
      return [{ id: String(entry.id ?? `${Date.now()}-${Math.random()}`), saved: Number.isFinite(timestamp) && !Number.isNaN(date.getTime()) ? timestamp : Date.now(), level }];
    } catch { return []; }
  });
}

export function savedLevelDetail(entry) {
  const date = new Date(entry.saved);
  const when = Number.isNaN(date.getTime()) ? 'Datum onbekend' : new Intl.DateTimeFormat('nl-NL').format(date);
  return `${entry.level.width} blokjes · ${when}`;
}
