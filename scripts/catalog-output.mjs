import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Keep generated JavaScript out of the student workshop. Temporary fixtures stay self-contained.
export function catalogOutput(directory, group) {
  const root = path.resolve(directory instanceof URL ? fileURLToPath(directory) : directory);
  const workshop = fileURLToPath(new URL(group === 'structures' ? '../public_html/gameplay/' : `../public_html/gameplay/${group}/`, import.meta.url));
  return root === path.resolve(workshop)
    ? fileURLToPath(new URL(`../public_html/engine/${group}/catalog.mjs`, import.meta.url))
    : path.join(root, 'catalog.mjs');
}
