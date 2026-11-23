// Only the collection travels to the server; game progress stays on the device.
export function mergeCollections(local, remote) {
  const merge = (a, b, date) => {
    const entries = new Map(b.map(entry => [entry.id, entry]));
    for (const entry of a) if (!entries.has(entry.id) || date(entry) >= date(entries.get(entry.id))) entries.set(entry.id, entry);
    return [...entries.values()];
  };
  const levels = merge(local.levels, remote.levels, entry => entry.saved || 0);
  const worlds = merge(local.worlds, remote.worlds, entry => entry.updated || 0);
  if (levels.length > 100 || worlds.length > 20) throw new Error('De gecombineerde collectie is te groot. Download eerst een kopie.');
  return { levels, worlds };
}

export class CollectionSync {
  constructor({ endpoint, token, request = globalThis.fetch, status = () => {} }) {
    Object.assign(this, { endpoint, token, request, status });
    this.revision = 0; this.ready = false; this.running = null; this.pending = null; this.lastSent = '';
  }
  async call(method, body) {
    const response = await this.request(this.endpoint, {
      method, cache: 'no-store', headers: { 'X-Bravios-Collection': this.token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body), keepalive: false } : {}), signal: AbortSignal.timeout(12000)
    });
    let result;
    try { result = await response.json(); } catch { throw new Error('De server kan de collectie niet bewaren.'); }
    if (!response.ok) throw new Error(response.status === 409 ? 'De collectie is in een ander tabblad gewijzigd. Herlaad om beide versies samen te voegen.' : result.error || 'De server is niet bereikbaar.');
    return result;
  }
  async start(local) {
    const remote = await this.call('GET');
    if (!Number.isSafeInteger(remote.revision) || !Array.isArray(remote.levels) || !Array.isArray(remote.worlds)) throw new Error('De server stuurde een ongeldige collectie.');
    this.revision = remote.revision;
    this.lastSent = JSON.stringify({ levels: remote.levels, worlds: remote.worlds });
    const merged = mergeCollections(local, remote);
    this.ready = true;
    return merged;
  }
  save(collection) {
    this.pending = JSON.parse(JSON.stringify(collection));
    if (!this.ready) return Promise.resolve(false);
    if (!this.running) this.running = this.flush().finally(() => { this.running = null; });
    return this.running;
  }
  async flush() {
    while (this.pending) {
      const next = this.pending; this.pending = null;
      const serialized = JSON.stringify(next);
      if (serialized === this.lastSent) { this.status('saved'); continue; }
      this.status('saving');
      try {
        const result = await this.call('PUT', { ...next, revision: this.revision });
        if (!Number.isSafeInteger(result.revision)) throw new Error('Bewaren is niet bevestigd door de server.');
        this.revision = result.revision; this.lastSent = serialized; this.status('saved');
      } catch (error) {
        // Keep the latest local version for a later retry, including edits made in flight.
        this.pending ||= next; this.status('error', error.message); return false;
      }
    }
    return true;
  }
}
