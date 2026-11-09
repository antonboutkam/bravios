import { CHARACTER_PROFILES } from './characters/roster.mjs';
import { collectModules } from './build/module-graph.mjs';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('.', import.meta.url));
import { CHARACTER_SHEETS } from './character-maker.mjs';
import { LOOK_SHEETS } from './look.mjs';
import { TERRAIN_SHEETS } from './terrain.mjs';
const files = new Set(['tests/graphics-diagnostic.html', 'tests/depth-backgrounds.html', 'tests/swing-platforms.html', 'tests/adventure-map.html', 'tests/helmet-beetles.html', 'worlds/wonderland/world-inspiration.png', 'worlds/adventure/adventure-map.png', 'tests/sea-life.html', 'sea-life.mjs', 'sea-art.mjs', 'enemy-design.mjs', 'enemy-design-art.mjs', 'enemy-editor.mjs', 'character-maker.mjs', ...Object.values(CHARACTER_SHEETS), ...Object.values(LOOK_SHEETS), ...Object.values(TERRAIN_SHEETS), 'assets/look/logo.png', 'assets/look/logo-transparent.png', 'assets/look/crazy-backgrounds.png', 'look.mjs', 'presentation.mjs', 'terrain.mjs', 'terrain-rules.mjs', 'mechanisms.mjs', 'swing-platforms.mjs', 'firebars.mjs', 'index.html', 'speel.html', 'styles.css', 'app.mjs', 'gamepad.mjs', 'wonder-foes.mjs', 'wonder-foe-art.mjs', 'tests/wonder-foes.html', 'depth-backgrounds.mjs', 'wonder-magic.mjs', 'engine.mjs', 'levels.mjs', 'wonderland.mjs', 'wonderland-map.mjs', 'adventurers.mjs', 'adventure-map.mjs', 'worlds.mjs', 'world-editor.mjs', 'rhythm-game.mjs', 'small-games.mjs', 'monster-art.mjs', 'tests/monsters.html', 'tests/castle-fire.html', 'art.mjs', 'storage.mjs', 'coop.mjs', 'network.mjs', 'favicon.svg', ...Object.values(CHARACTER_PROFILES).map(profile => profile.portrait)]);
for(const name of (await collectModules(new URL('./',import.meta.url),['bootstrap.mjs','small-games.mjs','rhythm-game.mjs'])).keys())files.add(name);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };
const port = Number(process.env.PORT || 8080);
http.createServer(async (req, res) => {
  let name;
  try { name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname.slice(1)) || 'index.html'; }
  catch { res.writeHead(400); res.end('Ongeldig adres'); return; }
  if (name === 'room.php') { res.writeHead(503, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'Gebruik mariomaker.nuidev.nl of npm run start:network om samen te spelen.' })); return; }
  const characterFile = /^characters\/(?:characters\.json|[a-z][a-z0-9-]{0,39}\/character\.json|[a-z][a-z0-9-]{0,39}\/images\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+\.png)$/.test(name);
  const enemyFile=/^enemies\/(?:enemies\.json|(?:game|bosses)\/[a-z][a-z0-9-]{0,39}\/(?:enemy\.json|images\/[a-zA-Z0-9_-]+\.png))$/.test(name);
  if (!files.has(name) && !characterFile && !enemyFile) { res.writeHead(404); res.end('Niet gevonden'); return; }
  try {
    const data = await readFile(path.join(root, name));
    res.writeHead(200, { 'Content-Type': mime[path.extname(name)], 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch { res.writeHead(500); res.end('Bestand kon niet worden geladen.'); }
}).listen(port, '0.0.0.0', () => console.log(`Bravios draait op http://localhost:${port}`));
