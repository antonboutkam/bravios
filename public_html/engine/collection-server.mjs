import { mkdir, readFile, rename, writeFile, rm } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import path from 'node:path';
import { validateLevel } from './engine.mjs';
import { validateWorld } from './worlds.mjs';

export const COLLECTION_LIMIT = 32 * 1024 * 1024;
const failure = (code, message) => Object.assign(new Error(message), { code });
export function validateCollection(raw) {
  if (!raw || !Number.isSafeInteger(raw.revision) || raw.revision < 0 || !Array.isArray(raw.levels) || raw.levels.length > 100 || !Array.isArray(raw.worlds) || raw.worlds.length > 20) throw failure(400, 'Ongeldige collectie.');
  const ids = new Set();
  for (const entry of raw.levels) {
    // Older browser IDs contain a decimal point from Math.random(). IDs are data,
    // never filenames; preserve them so migration keeps references intact.
    if (!entry || typeof entry.id !== 'string' || entry.id.length < 1 || entry.id.length > 160 || ids.has(entry.id) || !Number.isSafeInteger(entry.saved) || entry.saved < 0) throw failure(400, 'Ongeldig opgeslagen veld.');
    ids.add(entry.id);
    try { validateLevel(entry.level); } catch (error) { throw failure(400, error.message); }
  }
  ids.clear();
  for (const world of raw.worlds) {
    try { validateWorld(world); } catch (error) { throw failure(400, error.message); }
    if (ids.has(world.id)) throw failure(400, 'Dubbele wereld.'); ids.add(world.id);
  }
  return { revision: raw.revision, levels: raw.levels, worlds: raw.worlds };
}
export async function collectionRequest({ directory, token, method, body }) {
  if (!/^[a-f0-9]{64}$/.test(token || '')) throw failure(401, 'De collectiesleutel ontbreekt.');
  if (!['GET', 'PUT'].includes(method)) throw failure(405, 'Gebruik GET of PUT.');
  const filename = path.join(directory, createHash('sha256').update(token).digest('hex') + '.json');
  const read = async () => { try { return JSON.parse(await readFile(filename, 'utf8')); } catch (error) { if (error.code === 'ENOENT') return { revision: 0, levels: [], worlds: [] }; throw error; } };
  if (method === 'GET') return read();
  const data = validateCollection(body);
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const lock = filename + '.lock';
  try { await mkdir(lock); } catch (error) { if (error.code === 'EEXIST') throw failure(503, 'De collectie wordt al bewaard. Probeer opnieuw.'); throw error; }
  const temporary = filename + '.' + randomUUID() + '.tmp';
  try {
    const current = await read();
    if (current.revision !== data.revision) throw failure(409, 'De collectie is ondertussen gewijzigd.');
    data.revision++;
    await writeFile(temporary, JSON.stringify(data), { mode: 0o600 });
    await rename(temporary, filename);
    return { revision: data.revision };
  } finally { await rm(temporary, { force: true }); await rm(lock, { recursive: true, force: true }); }
}
export async function handleCollection(req, res, directory) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store');
  try {
    let body;
    if (req.method === 'PUT') {
      if (!/^application\/json\b/i.test(req.headers['content-type'] || '')) throw failure(415, 'Gebruik JSON.');
      const chunks = []; let size = 0;
      for await (const chunk of req) { size += chunk.length; if (size > COLLECTION_LIMIT) throw failure(413, 'De collectie is te groot.'); chunks.push(chunk); }
      try { body = JSON.parse(Buffer.concat(chunks).toString()); } catch { throw failure(400, 'Ongeldige JSON.'); }
    }
    const result = await collectionRequest({ directory, token: req.headers['x-bravios-collection'], method: req.method, body });
    res.writeHead(200); res.end(JSON.stringify(result));
  } catch (error) { res.writeHead(Number.isInteger(error.code) ? error.code : 500); res.end(JSON.stringify({ error: Number.isInteger(error.code) ? error.message : 'De server kon de collectie niet bewaren.' })); }
}
