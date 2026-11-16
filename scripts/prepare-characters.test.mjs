import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { loadCharacterCatalog } from '../public_html/engine/characters/load-catalog.mjs';
import { discoverCharacters, prepareCharacters, REQUIRED_POSES } from './prepare-characters.mjs';
import { collectModules, bundleModules } from '../public_html/engine/build/module-graph.mjs';
import { RUN_POSES } from '../public_html/engine/characters/shared/poses.mjs';

async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'bravios-characters-'));
  const folder = path.join(root, 'luna');
  await mkdir(path.join(folder, 'images/platform'), { recursive: true });
  await mkdir(path.join(root, 'shared'));
  const png = await readFile(new URL('../public_html/gameplay/characters/boaz/images/platform/idle.png', import.meta.url));
  const config = { id: 'luna', name: 'Luna', portrait: 'images/portrait.png', poses: Object.fromEntries(REQUIRED_POSES.map(pose => [pose, `images/platform/${pose}.png`])) };
  for (const filename of [config.portrait, ...Object.values(config.poses)]) await writeFile(path.join(folder, filename), png);
  const save = () => writeFile(path.join(folder, 'character.json'), JSON.stringify(config));
  await save();
  await writeFile(path.join(root, 'characters.json'), JSON.stringify(['luna']));
  try { await run({ root, folder, config, save }); } finally { await rm(root, { recursive: true, force: true }); }
}

test('a new directory becomes a usable character in native and offline module consumers', async () => fixture(async ({ root }) => {
  const profiles = await prepareCharacters(root);
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].id, 'luna');
  const catalog = await readFile(path.join(root, 'catalog.mjs'), 'utf8');
  const imported = await import(pathToFileURL(path.join(root, 'catalog.mjs')).href);
  assert.equal(imported.CHARACTER_CATALOG[0].views.side.poses.run, 'gameplay/characters/luna/images/platform/run.png');
  const modules = await collectModules(new URL('../public_html/engine/', import.meta.url), ['look.mjs', 'coop.mjs']);
  modules.set('characters/catalog.mjs', catalog);
  modules.set('check.mjs', "import { CHARACTER_PROFILES, participantRoster, nextCharacter } from './characters/roster.mjs';\nimport { LOOK_SHEETS } from './look.mjs';\nglobalThis.result={profiles:CHARACTER_PROFILES, roster:participantRoster(2,{character:'luna'}), next:nextCharacter('luna'), run:LOOK_SHEETS['luna:run']};");
  const context = {};
  runInNewContext(bundleModules(modules, 'check.mjs'), context);
  assert.equal(context.result.profiles.luna.name, 'Luna');
  assert.equal(context.result.roster[1].character, 'luna');
  assert.equal(context.result.next, 'luna');
  assert.equal(context.result.run, 'gameplay/characters/luna/images/platform/run.png');
}));

test('missing poses, mismatched IDs and paths outside images fail with the config filename', async () => fixture(async ({ root, config, save }) => {
  config.id = 'other'; await save(); await assert.rejects(discoverCharacters(root), /luna\/character.json/);
  config.id = 'luna'; config.poses.jump = '../escape.png'; await save(); await assert.rejects(discoverCharacters(root), /images/);
  config.poses.jump = 'images/platform/missing.png'; await save(); await assert.rejects(discoverCharacters(root), /ontbreekt/);
}));

test('malformed JSON and an empty character collection cannot silently produce a broken catalog', async () => fixture(async ({ root, folder }) => {
  await writeFile(path.join(folder, 'character.json'), '{');
  await assert.rejects(discoverCharacters(root), /Ongeldige JSON/);
  await writeFile(path.join(root, 'characters.json'), '[]');
  await assert.rejects(discoverCharacters(root), /lijst met heldenmappen/);
}));

test('runtime manifest controls order and reads newly listed folders without a generated catalog', async () => fixture(async ({ root, config }) => {
  const files = {
    'gameplay/characters/characters.json': ['nova', 'luna'],
    'gameplay/characters/nova/character.json': { ...config, id: 'nova', name: 'Nova' },
    'gameplay/characters/luna/character.json': config
  };
  const load = () => loadCharacterCatalog(async filename => structuredClone(files[filename]));
  assert.deepEqual((await load()).map(profile => profile.id), ['nova', 'luna']);
  files['gameplay/characters/characters.json'] = ['luna'];
  assert.deepEqual((await load()).map(profile => profile.id), ['luna']);
  files['gameplay/characters/characters.json'] = ['luna', 'luna'];
  await assert.rejects(load(), /dubbele/);
  files['gameplay/characters/characters.json'] = ['../escape'];
  await assert.rejects(load(), /Ongeldige/);
}));

async function addRunFrames(folder, config, save) {
  const png = await readFile(path.join(folder, config.poses.run));
  for (const pose of RUN_POSES) {
    config.poses[pose] = `images/platform/${pose}.png`;
    await writeFile(path.join(folder, config.poses[pose]), png);
  }
  await save();
}

test('four run frames survive native loading, catalog generation and offline bundling', async () => fixture(async ({ root, folder, config, save }) => {
  await addRunFrames(folder, config, save);
  const native = await loadCharacterCatalog(async filename => JSON.parse(await readFile(path.join(root, filename.replace(/^gameplay\/characters\//, '')), 'utf8')));
  const profiles = await prepareCharacters(root);
  assert.deepEqual(native, profiles);
  const modules = await collectModules(new URL('../public_html/engine/', import.meta.url), ['look.mjs']);
  modules.set('characters/catalog.mjs', await readFile(path.join(root, 'catalog.mjs'), 'utf8'));
  modules.set('check.mjs', "import { LOOK_SHEETS } from './look.mjs';\nglobalThis.result=LOOK_SHEETS;");
  const context = {};
  runInNewContext(bundleModules(modules, 'check.mjs'), context);
  for (const pose of RUN_POSES) assert.equal(context.result[`luna:${pose}`], `gameplay/characters/luna/images/platform/${pose}.png`);
}));

test('gaps, invalid paths and missing run images fail before producing a catalog', async () => fixture(async ({ root, folder, config, save }) => {
  config.poses['run-2'] = 'images/platform/run-2.png';
  await save();
  await assert.rejects(discoverCharacters(root), /aaneengesloten/);
  await addRunFrames(folder, config, save);
  config.poses['run-4'] = '../escape.png'; await save();
  await assert.rejects(discoverCharacters(root), /images/);
  config.poses['run-4'] = 'images/platform/missing.png'; await save();
  await assert.rejects(discoverCharacters(root), /Afbeelding ontbreekt/);
}));

test('run frames require equal canvas dimensions to avoid resizing within a step', async () => fixture(async ({ root, folder, config, save }) => {
  await addRunFrames(folder, config, save);
  const differentSize = await readFile(path.join(folder, config.poses['run-3']));
  differentSize.writeUInt32BE(800, 16); differentSize.writeUInt32BE(400, 20);
  await writeFile(path.join(folder, config.poses['run-3']), differentSize);
  await assert.rejects(discoverCharacters(root), /dezelfde canvasafmetingen/);
}));

test('a missing registered 3D model preserves the 2D character and can be added later', async () => fixture(async ({ root, folder, config, save }) => {
  config.model3d = { file: '3d/model.glb' }; await save();
  const original = await readFile(path.join(folder, 'character.json'), 'utf8');
  const profiles = await prepareCharacters(root);
  assert.equal(profiles[0].id, 'luna');
  assert.ok(profiles[0].views.side.poses.run);
  assert.equal(profiles[0].model3d, undefined);
  assert.ok(!(await readFile(path.join(root, 'catalog.mjs'), 'utf8')).includes('model3d'));
  assert.equal(await readFile(path.join(folder, 'character.json'), 'utf8'), original);
  await mkdir(path.join(folder, '3d'));
  await writeFile(path.join(folder, '3d/model.glb'), await readFile(new URL('../public_html/gameplay/characters/boaz/3d/model.glb', import.meta.url)));
  assert.equal((await prepareCharacters(root))[0].model3d.file, 'gameplay/characters/luna/3d/model.glb');
  await writeFile(path.join(folder, '3d/model.glb'), 'broken model');
  await assert.rejects(prepareCharacters(root), /ongeldig GLB-model/);
}));

test('runtime omits missing 3D capabilities without hiding 2D characters or suppressing check failures', async () => fixture(async ({ config }) => {
  config.model3d = { file: '3d/model.glb' };
  const readJSON = async filename => filename.endsWith('characters.json') ? ['luna'] : config;
  const missing = await loadCharacterCatalog(readJSON, async filename => {
    assert.equal(filename, 'gameplay/characters/luna/3d/model.glb'); return false;
  });
  assert.equal(missing[0].id, 'luna'); assert.equal(missing[0].model3d, undefined);
  assert.ok((await loadCharacterCatalog(readJSON, async () => true))[0].model3d);
  await assert.rejects(loadCharacterCatalog(readJSON, async () => { throw new Error('network unavailable'); }), /network unavailable/);
  delete config.model3d;
  assert.equal((await loadCharacterCatalog(readJSON, async () => { throw new Error('must not check unregistered model'); }))[0].model3d, undefined);
}));

test('2D settings and independent idle/walk/run cycles survive native and offline catalogs', async () => fixture(async ({ root, folder, config, save }) => {
  config.settings = { '2d': { parachute: false, runAnimation: 'roll', renderScale: 1.25, balance: {health:4,power:6} } };
  const png = await readFile(path.join(folder, config.poses.run));
  for (const [action, count] of [['idle', 9], ['walk', 3], ['run', 7]]) for (let i=1;i<=count;i++) {
    const pose = `${action}-${i}`; config.poses[pose] = `images/platform/${pose}.png`;
    await writeFile(path.join(folder, config.poses[pose]), png);
  }
  await save();
  const native = await loadCharacterCatalog(async filename => JSON.parse(await readFile(path.join(root, filename.replace(/^gameplay\/characters\//, '')), 'utf8')));
  const offline = await prepareCharacters(root);
  assert.deepEqual(native, offline); assert.deepEqual(offline[0].settings, config.settings);
  assert.ok(offline[0].views.side.poses['run-7']); assert.ok(offline[0].views.side.poses['walk-3']);
  assert.ok(offline[0].views.side.poses['idle-9']);
  config.settings['2d'].parachute = 'false'; await save();
  await assert.rejects(discoverCharacters(root), /luna\/character.json: settings.2d.parachute/);
}));

test('idle frames allow different canvas proportions while missing files and gaps are rejected', async () => fixture(async ({ root, folder, config, save }) => {
  for(let i=1;i<=2;i++) {
    const png=Buffer.from(await readFile(path.join(folder,config.poses.idle)));
    png.writeUInt32BE(i===1?1086:1254,16); png.writeUInt32BE(i===1?1448:1254,20);
    config.poses[`idle-${i}`]=`images/platform/idle-${i}.png`;
    await writeFile(path.join(folder,config.poses[`idle-${i}`]),png);
  }
  await save(); assert.ok((await prepareCharacters(root))[0].views.side.poses['idle-2']);
  config.poses['idle-3']='images/platform/missing.png'; await save();
  await assert.rejects(discoverCharacters(root),/Afbeelding ontbreekt/);
  delete config.poses['idle-3']; delete config.poses['idle-1']; await save();
  await assert.rejects(discoverCharacters(root),/idle-frames aaneengesloten/);
}));

test('proportionally sized frames use the same prepared canvas without changing source images', async () => fixture(async ({ root, folder, config, save }) => {
  await addRunFrames(folder, config, save);
  for (let i=0;i<RUN_POSES.length;i++) {
    const filename = path.join(folder, config.poses[RUN_POSES[i]]), png = await readFile(filename);
    png.writeUInt32BE(300*(i+1),16); png.writeUInt32BE(400*(i+1),20); await writeFile(filename,png);
  }
  assert.ok((await discoverCharacters(root))[0].views.side.poses['run-4']);
  const original = await readFile(path.join(folder, config.poses['run-4'])); assert.equal(original.readUInt32BE(16),1200);
}));
