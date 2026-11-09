// Start vanuit elke werkmap met: node pad/naar/server/server.js
import { prepareCharacters } from '../scripts/prepare-characters.mjs';
import { prepareEnemies } from '../scripts/prepare-enemies.mjs';

await prepareCharacters();
await prepareEnemies();
await import('../public_html/server.mjs');
