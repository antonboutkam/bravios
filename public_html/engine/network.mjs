export async function roomRequest(body) {
  if (!['http:', 'https:'].includes(location.protocol)) throw new Error('Open Bravios via de website om samen te spelen.');
  const response = await fetch(new URL('engine/room.php', location.href), {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(3500), cache: 'no-store'
  });
  const result = await response.json().catch(() => { throw new Error('Samen spelen is hier niet beschikbaar. Gebruik de ontwikkelserver.'); });
  if (!response.ok) { const error = new Error(result.error || 'Verbinding met de kamer lukt niet.'); error.fatal = response.status >= 400 && response.status < 500; throw error; }
  return result;
}
export class RoomConnection {
  constructor(credentials, payload, update, failure) {
    Object.assign(this, credentials); this.payload = payload; this.update = update; this.failure = failure;
    this.closed = false; this.lastSuccess = Date.now();
  }
  async poll() {
    if (this.closed) return;
    try {
      const result = await roomRequest({ action: 'sync', code: this.code, token: this.token, ...this.payload() });
      if (this.closed) return;
      this.lastSuccess = Date.now(); this.update(result);
    } catch (error) {
      if (this.closed) return;
      if (error.fatal || Date.now() - this.lastSuccess > 6000) { this.closed = true; this.failure(error); return; }
      this.update({ reconnecting: true });
    }
    if (!this.closed) this.timer = setTimeout(() => this.poll(), 80);
  }
  close() {
    if (this.closed) return;
    this.closed = true; clearTimeout(this.timer);
    fetch(new URL('engine/room.php', location.href), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'leave', code: this.code, token: this.token }), keepalive: true }).catch(() => {});
  }
}
