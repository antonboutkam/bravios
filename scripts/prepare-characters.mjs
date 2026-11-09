import { readFile, writeFile, realpath } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { loadCharacterCatalog } from '../public_html/characters/load-catalog.mjs';

export const REQUIRED_POSES = ['idle', 'side', 'run', 'jump', 'victory', 'land', 'ride'];
export async function discoverCharacters(directory) {
  const root = await realpath(directory), profiles = [];
  const listed = await loadCharacterCatalog(async relative => {
    const text = await readFile(path.join(root, relative.replace(/^characters\//, '')), 'utf8');
    try { return JSON.parse(text); } catch { throw new Error(`${relative}: Ongeldige JSON.`); }
  });
  const entries = listed.map(profile => ({ name: profile.id }));
  for (const entry of entries) {
    const folder = path.join(root, entry.name);
    let text;
    try { text = await readFile(path.join(folder, 'character.json'), 'utf8'); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const fail = message => { throw new Error(`characters/${entry.name}/character.json: ${message}`); };
    let config;
    try { config = JSON.parse(text); } catch { fail('Ongeldige JSON.'); }
    if (!config || Array.isArray(config) || typeof config !== 'object') fail('Verwacht een object.');
    if (!/^[a-z][a-z0-9-]{0,39}$/.test(entry.name) || config.id !== entry.name || ['custom', 'shared', '__proto__', 'constructor', 'prototype'].includes(entry.name)) fail('De ID moet gelijk zijn aan de mapnaam: kleine letters, cijfers en streepjes.');
    if (typeof config.name !== 'string' || !config.name.trim() || config.name.trim().length > 32) fail('Geef een naam van 1 tot 32 tekens.');
    async function image(relative) {
      if (typeof relative !== 'string' || !/^images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.png$/.test(relative)) fail('Afbeeldingen moeten PNG-bestanden binnen images/ zijn.');
      const filename = path.join(folder, relative);
      let resolved, png;
      try { resolved = await realpath(filename); png = await readFile(resolved); } catch { fail(`Afbeelding ontbreekt: ${relative}`); }
      if (!resolved.startsWith(folder + path.sep)) fail(`Afbeelding buiten de karaktermap: ${relative}`);
      if (png.length < 33 || !png.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || !png.readUInt32BE(16) || !png.readUInt32BE(20)) fail(`Ongeldig PNG-bestand: ${relative}`);
      return `characters/${entry.name}/${relative}`;
    }
    const portrait = await image(config.portrait), poses = {};
    for (const pose of REQUIRED_POSES) poses[pose] = await image(config.poses?.[pose]);
    profiles.push({ id: config.id, name: config.name.trim(), portrait, views: { side: { poses, frame: 'side' }, front: { poses, frame: 'idle' } } });
  }
  if (!profiles.length) throw new Error('Geen karakters gevonden. Voeg een map met character.json toe.');
  return profiles;
}
export async function prepareCharacters(directory = new URL('../public_html/characters/', import.meta.url)) {
  const profiles = await discoverCharacters(directory);
  const output = new URL('catalog.mjs', directory instanceof URL ? directory : pathToFileURL(path.resolve(directory) + path.sep));
  const source = '// Generated for offline use by scripts/prepare-characters.mjs. Edit characters.json and each character.json.\nexport const CHARACTER_CATALOG = ' + JSON.stringify(profiles, null, 2) + ';\n';
  let previous;
  try { previous = await readFile(output, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (source !== previous) await writeFile(output, source);
  return profiles;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const profiles = await prepareCharacters();
  console.log(`${profiles.length} karakters gevonden en gecontroleerd.`);
}
