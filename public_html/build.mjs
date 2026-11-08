import { readFile, writeFile } from 'node:fs/promises';
import { Script } from 'node:vm';
import { collectModules, bundleModules } from './build/module-graph.mjs';
import { CHARACTER_SHEETS } from './character-maker.mjs';
import { LOOK_SHEETS } from './look.mjs';
import { TERRAIN_SHEETS } from './terrain.mjs';
import { CRAZY_BACKGROUND_ASSET } from './art.mjs';

const root = new URL('.', import.meta.url);
const read = name => readFile(new URL(name, root), 'utf8');
const [html, css, favicon] = await Promise.all(['index.html','styles.css','favicon.svg'].map(read));
const modules=await collectModules(root);
const assetPaths = ['wonderland/world-inspiration.png', 'assets/look/adventure-map.png', ...Object.values(CHARACTER_SHEETS), CRAZY_BACKGROUND_ASSET, 'characters/boaz/portrait.png', 'characters/ravi/portrait.png', 'assets/look/logo.png', ...Object.values(LOOK_SHEETS), ...Object.values(TERRAIN_SHEETS)];
const assets = Object.fromEntries(await Promise.all(assetPaths.map(async name => [name, `data:image/png;base64,${(await readFile(new URL(name, root))).toString('base64')}`])));
const script = `globalThis.braviosAssets = ${JSON.stringify(assets)};\n` + bundleModules(modules);
new Script(script, { filename: 'speel.html' });
const offline = html
  .replace(/<link rel="icon" href="favicon.svg"><link rel="stylesheet" href="styles.css(?:\?[^\"]*)?">/, () => `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(favicon)}"><style>${css}</style>`)
  .replace(/<script type="module" src="app.mjs(?:\?[^\"]*)?"><\/script>/, '')
  .replace(/(<img\b[^>]*?)\s+src="(?:assets|wonderland|characters)\/[^\"]+"/g, '$1')
  .replace('href="./"', 'href="speel.html"')
  .replace('</body>', () => `<script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>\n</body>`);
await writeFile(new URL('speel.html', root), offline);
console.log('speel.html is klaar. Open dit bestand direct in je browser.');
