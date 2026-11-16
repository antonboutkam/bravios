import { model3DConfig } from '../games/platformer3d/assets.mjs';
import { REQUIRED_POSES } from './shared/poses.mjs?v=walk-run-1';
import { normalizeSettings2D } from './shared/settings.mjs?v=health-power-1';
export async function loadCharacterCatalog(readJSON, modelAvailable = async () => true) {
  const folders = await readJSON('gameplay/characters/characters.json');
  if (!Array.isArray(folders) || !folders.length) throw new Error('gameplay/characters/characters.json moet een lijst met heldenmappen bevatten.');
  const seen = new Set();
  for (const folder of folders) {
    if (typeof folder !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(folder) || ['custom', 'shared', 'constructor', 'prototype'].includes(folder) || seen.has(folder)) throw new Error(`Ongeldige of dubbele heldenmap: ${folder}`);
    seen.add(folder);
  }
  return Promise.all(folders.map(async folder => {
    const filename = `gameplay/characters/${folder}/character.json`;
    const config = await readJSON(filename);
    const fail = message => { throw new Error(`${filename}: ${message}`); };
    if (!config || config.id !== folder) fail('De id moet gelijk zijn aan de mapnaam.');
    if (typeof config.name !== 'string' || !config.name.trim() || config.name.trim().length > 32) fail('Geef een naam van 1 tot 32 tekens.');
    const image = relative => {
      if (typeof relative !== 'string' || !/^images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.png$/.test(relative)) fail('Afbeeldingen moeten PNG-bestanden binnen images/ zijn.');
      return `gameplay/characters/${folder}/${relative}`;
    };
    const portrait = image(config.portrait);
    const poses = Object.fromEntries(REQUIRED_POSES.map(pose => [pose, image(config.poses?.[pose])]));
    if (config.poses.walk !== undefined) poses.walk = image(config.poses.walk);
    for (const action of ['idle', 'walk', 'run']) {
      const frames = Object.keys(config.poses).filter(key => key.startsWith(`${action}-`)).sort((a,b) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
      if (frames.length > 64 || frames.some((key, index) => key !== `${action}-${index + 1}`)) fail(`Nummer ${action}-frames aaneengesloten vanaf ${action}-1 (maximaal 64).`);
      for (const pose of frames) poses[pose] = image(config.poses[pose]);
    }
    const settings = { '2d': normalizeSettings2D(config.settings, fail) };
    const model = config.model3d ? model3DConfig(config.model3d, `gameplay/characters/${folder}/`) : null;
    const model3d = model && await modelAvailable(model.file) ? model : null;
    return { ...(model3d ? { model3d } : {}), id: folder, name: config.name.trim(), portrait, settings, views: { side: { poses, frame: 'side' }, front: { poses, frame: 'idle' } } };
  }));
}
