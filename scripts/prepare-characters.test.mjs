import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { loadCharacterCatalog } from '../public_html/characters/load-catalog.mjs';
import { discoverCharacters, prepareCharacters, REQUIRED_POSES } from './prepare-characters.mjs';
import { collectModules, bundleModules } from '../public_html/build/module-graph.mjs';

async function fixture(run) {
  const root = await mkdtemp(path.join(tmpdir(), 'bravios-characters-'));
  const folder = path.join(root, 'luna');
  await mkdir(path.join(folder, 'images/platform'), { recursive: true });
  await mkdir(path.join(root, 'shared'));
  const png = await readFile(new URL('../public_html/characters/boaz/images/platform/idle.png', import.meta.url));
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
  assert.equal(imported.CHARACTER_CATALOG[0].views.side.poses.run, 'characters/luna/images/platform/run.png');
  const modules = await collectModules(new URL('../public_html/', import.meta.url), ['look.mjs', 'coop.mjs']);
  modules.set('characters/catalog.mjs', catalog);
  modules.set('check.mjs', "import { CHARACTER_PROFILES, participantRoster, nextCharacter } from './characters/roster.mjs';\nimport { LOOK_SHEETS } from './look.mjs';\nglobalThis.result={profiles:CHARACTER_PROFILES, roster:participantRoster(2,{character:'luna'}), next:nextCharacter('luna'), run:LOOK_SHEETS['luna:run']};");
  const context = {};
  runInNewContext(bundleModules(modules, 'check.mjs'), context);
  assert.equal(context.result.profiles.luna.name, 'Luna');
  assert.equal(context.result.roster[1].character, 'luna');
  assert.equal(context.result.next, 'luna');
  assert.equal(context.result.run, 'characters/luna/images/platform/run.png');
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
    'characters/characters.json': ['nova', 'luna'],
    'characters/nova/character.json': { ...config, id: 'nova', name: 'Nova' },
    'characters/luna/character.json': config
  };
  const load = () => loadCharacterCatalog(async filename => structuredClone(files[filename]));
  assert.deepEqual((await load()).map(profile => profile.id), ['nova', 'luna']);
  files['characters/characters.json'] = ['luna'];
  assert.deepEqual((await load()).map(profile => profile.id), ['luna']);
  files['characters/characters.json'] = ['luna', 'luna'];
  await assert.rejects(load(), /dubbele/);
  files['characters/characters.json'] = ['../escape'];
  await assert.rejects(load(), /Ongeldige/);
}));
