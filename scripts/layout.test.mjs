import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { bundleModules } from '../public_html/engine/build/module-graph.mjs';
import { publicURL } from '../public_html/engine/paths.mjs';
import { catalogOutput } from './catalog-output.mjs';
import { fileURLToPath } from 'node:url';

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(new URL(entry.name + '/', directory))
    : new URL(entry.name, directory)))).flat();
}

test('gameplay and assets contain editable files in the requested categories and no engine code', async () => {
  const workshop = new URL('../public_html/gameplay/', import.meta.url);
  const assets = new URL('../public_html/assets/', import.meta.url);
  const entries = [...await files(workshop), ...await files(assets)];
  for (const [directory, expected] of [[workshop, ['characters','enemies','platforms','obstacles','powerups','interactables']], [assets, ['backgrounds','scenery','effects','music','sounds']]]) {
    const folders = (await readdir(directory, {withFileTypes:true})).filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    assert.deepEqual(folders, [...expected].sort());
  }
  assert.ok(entries.some(file => file.pathname.endsWith('/character.json')));
  assert.ok(entries.some(file => file.pathname.endsWith('/enemy.json')));
  assert.ok(entries.some(file => file.pathname.endsWith('/structure.json')));
  assert.ok(entries.some(file => file.pathname.endsWith('/run-4.png')));
  assert.deepEqual(entries.filter(file => /\.(?:mjs|js|css|php|py)$/.test(file.pathname)), []);
  for (const group of ['characters', 'enemies', 'structures']) {
    const output = catalogOutput(group === 'structures' ? workshop : new URL(group + '/', workshop), group);
    assert.equal(output, fileURLToPath(new URL(`../public_html/engine/${group}/catalog.mjs`, import.meta.url)));
  }
});

test('native and offline asset URLs retain the document root, also when hosted in a subdirectory', async () => {
  const asset = 'gameplay/characters/pixel/images/platform/run-1.png';
  assert.equal(publicURL(asset).href, new URL('../public_html/' + asset, import.meta.url).href);
  const modules = new Map([
    ['paths.mjs', await readFile(new URL('../public_html/engine/paths.mjs', import.meta.url), 'utf8')],
    ['check.mjs', "import { publicURL, assetURL } from './paths.mjs';\nglobalThis.result={url:publicURL('gameplay/example.png').href,asset:assetURL('gameplay/embedded.png')};"]
  ]);
  const context = { URL, location: { href: 'https://example.test/student/bravios/speel.html' }, braviosAssets: { 'gameplay/embedded.png': 'data:image/png;base64,embedded' } };
  runInNewContext(bundleModules(modules, 'check.mjs'), context);
  assert.equal(context.result.url, 'https://example.test/student/bravios/gameplay/example.png');
  assert.equal(context.result.asset, 'data:image/png;base64,embedded');
});
