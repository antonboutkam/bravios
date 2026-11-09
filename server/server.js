// Start vanuit elke werkmap met: node pad/naar/server/server.js
import { prepareCharacters } from '../scripts/prepare-characters.mjs';
import { prepareEnemies } from '../scripts/prepare-enemies.mjs';

import { prepareStructures } from '../scripts/prepare-structures.mjs';

await prepareCharacters();
await prepareEnemies();
await prepareStructures();
await import('../public_html/engine/server.mjs');
