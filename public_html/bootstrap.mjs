import { loadEnemyCatalog } from './enemies/load-catalog.mjs';
import { replaceEnemyCatalog } from './enemies/runtime.mjs';
import { CHARACTER_CATALOG } from './characters/catalog.mjs';
import { loadCharacterCatalog } from './characters/load-catalog.mjs';
async function start() {
  const retry = document.querySelector('#loading-retry');
  retry.hidden = true;
  try {
    const readJSON = async path => {
      const response = await fetch(new URL(path, import.meta.url), { cache: 'no-store' });
      if (!response.ok) throw new Error(`${path} kon niet worden geladen (${response.status}).`);
      try { return await response.json(); }
      catch { throw new Error(`${path} bevat ongeldige JSON.`); }
    };
    const [profiles, enemies] = await Promise.all([loadCharacterCatalog(readJSON),loadEnemyCatalog(readJSON)]);
    replaceEnemyCatalog(enemies);
    CHARACTER_CATALOG.splice(0, CHARACTER_CATALOG.length, ...profiles);
    await import('./app.mjs');
  } catch (error) {
    document.querySelector('#loading-status').textContent = error.message;
    retry.hidden = false;
    retry.onclick = () => { retry.onclick = null; start(); };
  }
}
start();
