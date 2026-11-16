import { loadStructureCatalog, validateStructureTiles } from './structures/load-catalog.mjs';
import { replaceStructureCatalog, structureAssets } from './structures/runtime.mjs';
import { loadEnemyCatalog } from './enemies/load-catalog.mjs';
import { replaceEnemyCatalog, enemyAssets } from './enemies/runtime.mjs';
import { CHARACTER_CATALOG } from './characters/catalog.mjs';
import { loadCharacterCatalog } from './characters/load-catalog.mjs?v=health-power-1';
import { publicURL } from './paths.mjs';
async function start() {
  const retry = document.querySelector('#loading-retry');
  retry.hidden = true;
  try {
    const readJSON = async path => {
      const response = await fetch(publicURL(path), { cache: 'no-store' });
      if (!response.ok) throw new Error(`${path} kon niet worden geladen (${response.status}).`);
      try { return await response.json(); }
      catch { throw new Error(`${path} bevat ongeldige JSON.`); }
    };
    const modelAvailable = async path => {
      const response = await fetch(publicURL(path), { method: 'HEAD', cache: 'no-store' });
      if (response.status === 404) return false;
      if (!response.ok) throw new Error(`${path} kon niet worden gecontroleerd (${response.status}).`);
      return true;
    };
    const [profiles, enemies, structures] = await Promise.all([loadCharacterCatalog(readJSON,modelAvailable),loadEnemyCatalog(readJSON),loadStructureCatalog(readJSON)]);
    validateStructureTiles(structures,enemies);
    replaceStructureCatalog(structures);
    replaceEnemyCatalog(enemies);
    CHARACTER_CATALOG.splice(0, CHARACTER_CATALOG.length, ...profiles);
    // Artwork is edited in place. Give every registered gameplay image a fresh
    // URL on reload, including structures that once contained legacy artwork.
    // This only registers URLs; lazy sprites are still fetched when used.
    // Offline embedded assets are unaffected: speel.html starts app.mjs directly.
    const revision = Date.now().toString(36);
    const characterAssets = profiles.flatMap(profile => [profile.portrait, ...Object.values(profile.views).flatMap(view => Object.values(view.poses || {})), ...(profile.model3d ? [profile.model3d.file] : [])]);
    globalThis.braviosAssets = Object.fromEntries([...new Set([...characterAssets, ...structureAssets(), ...enemyAssets()])].map(path => {
      const url = publicURL(path); url.searchParams.set('art', revision);
      return [path, url.href];
    }));
    await import('./app.mjs?v=docked-hud-1');
  } catch (error) {
    document.querySelector('#loading-status').textContent = error.message;
    retry.hidden = false;
    retry.onclick = () => location.reload();
  }
}
start();
