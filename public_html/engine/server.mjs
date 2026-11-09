import { CHARACTER_PROFILES } from './characters/roster.mjs';
import { collectModules } from './build/module-graph.mjs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
import { CHARACTER_SHEETS } from './character-maker.mjs';
import { LOOK_SHEETS } from './look.mjs';
import { TERRAIN_SHEETS } from './terrain.mjs';
const files = new Set([
  'index.html', 'speel.html', 'engine/styles.css', 'engine/tegels.html', 'engine/tiles-demo.mjs',
  'engine/tests/creatures.mjs', 'assets/scenery/ui/favicon.svg',
  'assets/backgrounds/worlds/wonderland/world-inspiration.png', 'assets/backgrounds/worlds/adventure/adventure-map.png',
  'assets/scenery/ui/logo.png', 'assets/scenery/ui/logo-transparent.png', 'assets/backgrounds/crazy-backgrounds.png',
  ...Object.values(CHARACTER_SHEETS), ...Object.values(LOOK_SHEETS), ...Object.values(TERRAIN_SHEETS),
  ...Object.values(CHARACTER_PROFILES).map(profile => profile.portrait)
]);
for (const name of ['graphics-diagnostic', 'depth-backgrounds', 'swing-platforms', 'adventure-map', 'helmet-beetles', 'sea-life', 'wonder-foes', 'monsters', 'castle-fire', 'creatures']) files.add(`engine/tests/${name}.html`);
for (const name of (await collectModules(new URL('./', import.meta.url), ['bootstrap.mjs', 'small-games.mjs', 'rhythm-game.mjs'])).keys()) files.add('engine/' + name);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = Number(process.env.PORT || 8080);
http.createServer(async (req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname.slice(1)) || 'index.html'; }
  catch { res.writeHead(400); res.end('Ongeldig adres'); return; }
  if (name === 'engine/room.php') { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Gebruik mariomaker.nuidev.nl of npm run start:network om samen te spelen.' })); return; }
  const characterFile = /^gameplay\/characters\/(?:characters\.json|[a-z][a-z0-9-]{0,39}\/character\.json|[a-z][a-z0-9-]{0,39}\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.png)$/.test(name);
  const enemyFile=/^gameplay\/enemies\/(?:enemies\.json|(?:game|bosses)\/[a-z][a-z0-9-]{0,39}\/(?:enemy\.json|images\/[a-zA-Z0-9_-]+\.png))$/.test(name);
  const structureFile=/^gameplay\/(?:structures\.json|(?:platforms|obstacles|powerups|interactables)\/[a-z][a-z0-9-]{0,39}\/(?:structure\.json|images\/[a-zA-Z0-9_-]+\.png))$/.test(name);
  if (!files.has(name) && !characterFile && !enemyFile && !structureFile) { res.writeHead(404); res.end('Niet gevonden'); return; }
  try {
    const data = await readFile(path.join(root, name));
    res.writeHead(200, { 'Content-Type': mime[path.extname(name)], 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Bestand kon niet worden geladen.'); }
}).listen(port, '0.0.0.0', () => console.log(`Bravios draait op http://localhost:${port}`));
