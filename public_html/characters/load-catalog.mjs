const POSES = ['idle', 'side', 'run', 'jump', 'victory', 'land', 'ride'];
export async function loadCharacterCatalog(readJSON) {
  const folders = await readJSON('characters/characters.json');
  if (!Array.isArray(folders) || !folders.length) throw new Error('characters/characters.json moet een lijst met heldenmappen bevatten.');
  const seen = new Set();
  for (const folder of folders) {
    if (typeof folder !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(folder) || ['custom', 'shared', 'constructor', 'prototype'].includes(folder) || seen.has(folder)) throw new Error(`Ongeldige of dubbele heldenmap: ${folder}`);
    seen.add(folder);
  }
  return Promise.all(folders.map(async folder => {
    const filename = `characters/${folder}/character.json`;
    const config = await readJSON(filename);
    const fail = message => { throw new Error(`${filename}: ${message}`); };
    if (!config || config.id !== folder) fail('De id moet gelijk zijn aan de mapnaam.');
    if (typeof config.name !== 'string' || !config.name.trim() || config.name.trim().length > 32) fail('Geef een naam van 1 tot 32 tekens.');
    const image = relative => {
      if (typeof relative !== 'string' || !/^images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.png$/.test(relative)) fail('Afbeeldingen moeten PNG-bestanden binnen images/ zijn.');
      return `characters/${folder}/${relative}`;
    };
    const portrait = image(config.portrait);
    const poses = Object.fromEntries(POSES.map(pose => [pose, image(config.poses?.[pose])]));
    return { id: folder, name: config.name.trim(), portrait, views: { side: { poses, frame: 'side' }, front: { poses, frame: 'idle' } } };
  }));
}
