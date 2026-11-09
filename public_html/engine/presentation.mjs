// Presentation state is local: it never enters a level or a multiplayer snapshot.
export class FrameRateMeter {
  constructor() { this.reset(); }
  reset() { this.previous = null; this.elapsed = 0; this.frames = 0; this.longest = 0; }
  sample(timestamp) {
    const previous = this.previous;
    this.previous = timestamp;
    if (previous === null) return null;
    const interval = timestamp - previous;
    if (interval <= 0) return null;
    this.elapsed += interval; this.frames++; this.longest = Math.max(this.longest, interval);
    if (this.elapsed < 1000) return null;
    const result = { fps: this.frames * 1000 / this.elapsed, longestMs: this.longest };
    this.elapsed = 0; this.frames = 0; this.longest = 0;
    return result;
  }
}

export class RenderQuality {
  constructor() { this.maxDensity = 2; this.reset(); }
  reset() { this.previous = null; this.intervals = []; }
  observe(timestamp, density) {
    const previous = this.previous; this.previous = timestamp;
    if (previous === null || density <= 1 || this.maxDensity <= 1) return false;
    const interval = timestamp - previous;
    // Ignore suspensions, rather than treating an inactive tab as slow drawing.
    if (interval <= 0 || interval > 250) { this.reset(); return false; }
    this.intervals.push(interval);
    if (this.intervals.length < 30) return false;
    const intervals = this.intervals.sort((a,b)=>a-b);
    this.intervals = [];
    if (intervals[15] <= 28) return false;
    // Keep at least one backing pixel per CSS pixel. Do not oscillate between
    // quality levels as soon as a lower density restores the frame rate.
    this.maxDensity = 1; return true;
  }
}

export class SceneEffects {
  constructor() { this.reset(); }
  reset(game = null) {
    this.particles = []; this.players = []; this.landings = [];
    this.tiles = game?.tiles.map(row => [...row]) || [];
    this.lastTime = game?.time || 0; this.won = false;
  }
  burst(x, y, colors, count = 10, speed = 85, gravity = 160, sparkle = false) {
    for (let i = 0; i < count; i++) {
      const angle = i / count * Math.PI * 2;
      const life = .35 + (i % 4) * .09;
      this.particles.push({ x, y, vx: Math.cos(angle) * speed * (.55 + i % 3 * .2), vy: Math.sin(angle) * speed - 40, life, total: life, gravity, color: colors[i % colors.length], size: 2 + i % 3, sparkle });
    }
    this.particles = this.particles.slice(-180);
  }
  observe(game, reducedMotion = false) {
    if (game.time < this.lastTime) this.reset(game);
    const dt = Math.max(0, Math.min(.1, game.time - this.lastTime));
    this.lastTime = game.time;
    this.particles = this.particles.filter(p => {
      p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += p.gravity * dt;
      return p.life > 0;
    });
    this.landings = this.landings.map(value => Math.max(0, value - dt));
    (game.players || [game.player]).forEach((p, i) => {
      const previous = this.players[i];
      const visible = !p.respawn;
      if (!reducedMotion && previous && visible && !previous.respawn) {
        if (p.grounded && !previous.grounded && previous.vy > 100) {
          this.landings[i] = .16;
          if (game.theme !== 'underwater') this.burst(p.x + p.w / 2, p.y + p.h, ['#e8dfbb', '#fff3d6'], 7, 44, 55);
        }
        if (p.grounded && Math.abs(p.vx) > 80 && Math.floor(game.time * 7) !== Math.floor(previous.time * 7) && game.theme !== 'underwater') {
          this.burst(p.x + p.w / 2 - p.facing * 9, p.y + p.h, ['#eee6cb'], 2, 20, 40);
        }
        if (p.shield !== previous.shield || p.cat !== previous.cat || p.fire !== previous.fire || p.ice !== previous.ice || p.star > previous.star + 1 || p.rainbow > previous.rainbow + 1) {
          this.burst(p.x + p.w / 2, p.y + p.h / 2, ['#ffe39a', '#d6fff2', '#c9b8ff'], 14, 85, -15, true);
        }
      }
      this.players[i] = { grounded: p.grounded, vy: p.vy, time: game.time, respawn: p.respawn, shield: p.shield, cat: p.cat, fire: p.fire, ice: p.ice, star: p.star, rainbow: p.rainbow };
    });
    // Diff tiles to locate actual pickups, including the other player on a guest device.
    for (let y = 0; y < game.tiles.length; y++) for (let x = 0; x < game.tiles[y].length; x++) {
      const before = this.tiles[y]?.[x], after = game.tiles[y][x];
      if (!reducedMotion && before !== after) {
        if (before === 4 || before === 3 && after === 13) this.burst(x * 32 + 16, y * 32 + 12, ['#fff9cb', '#ffd367', '#fff'], 10, 62, -25, true);
        if ((before === 2 || before === 67) && after === 0) this.burst(x * 32 + 16, y * 32 + 16, before === 67 ? ['#81878c', '#b8b9af', '#444c58'] : ['#ba765a', '#e8b38a', '#8d5948'], 12, 115, 400);
      }
      if (this.tiles[y]) this.tiles[y][x] = after;
    }
    if (game.state === 'won' && !this.won && !reducedMotion) {
      this.burst(game.player.x, game.player.y - 25, ['#ffe398', '#adf1cf', '#baa7ff', '#f4a7b7'], 60, 190, 180, true);
    }
    this.won = game.state === 'won';
    if (reducedMotion) { this.particles = []; this.landings = []; }
  }
  draw(ctx, left, right) {
    for (const p of this.particles) {
      if (p.x < left - 10 || p.x > right + 10) continue;
      ctx.save(); ctx.globalAlpha = Math.min(1, p.life / p.total * 1.8); ctx.fillStyle = p.color;
      if (p.sparkle) {
        ctx.translate(p.x, p.y); ctx.rotate(p.life * 3);
        ctx.fillRect(-p.size, -1, p.size * 2, 2); ctx.fillRect(-1, -p.size, 2, p.size * 2);
      } else ctx.fillRect(p.x, p.y, p.size, p.size);
      ctx.restore();
    }
  }
}

export function followCamera(current, player, scale, viewportWidth, worldWidth, dt, reducedMotion = false) {
  const limit = Math.max(0, worldWidth - viewportWidth);
  const lookAhead = Math.max(-80, Math.min(80, player.vx * .22)) * scale;
  const target = Math.max(0, Math.min(limit, (player.x + player.w / 2) * scale - viewportWidth * .42 + lookAhead));
  // Teleports and respawns need an immediate relocation, not a long pan across the map.
  if (reducedMotion || Math.abs(target - current) > viewportWidth * .7) return target;
  return Math.max(0, Math.min(limit, current + (target - current) * (1 - Math.exp(-18 * dt))));
}

export function keyCameraFrame(reveal, origin, target, reducedMotion = false) {
  const smooth = t => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
  const t = reveal.elapsed;
  const blend = t < .4 ? (reducedMotion ? 1 : smooth(t / .4)) : t < 1.45 ? 1 : (reducedMotion ? 0 : 1 - smooth((t - 1.45) / .35));
  return { x: origin.x + (target.x - origin.x) * blend, y: origin.y + (target.y - origin.y) * blend };
}

// Large campaigns keep world coordinates and CSS size, but bound the backing bitmap.
// In particular, a 264 × 32 moon level at 2x otherwise allocates 16896 × 2048 pixels.
export function worldRenderResolution(width, height, preferred = 2) {
  const logicalWidth = width * 32, logicalHeight = height * 32;
  const maxEdge = 8192, maxPixels = 8 * 1024 * 1024;
  return Math.min(preferred, maxEdge / logicalWidth, maxEdge / logicalHeight, Math.sqrt(maxPixels / (logicalWidth * logicalHeight)));
}

// Size the raster to the screen, independently of the level's virtual scroll area.
export function viewportRenderSize(width, height, pixelsPerUnit, deviceRatio = 1, resolutionScale = 1) {
  const cssWidth = Math.max(1, width), cssHeight = Math.max(1, height);
  const requestedScale = Number.isFinite(resolutionScale) ? Math.max(.5, Math.min(1, resolutionScale)) : 1;
  const density = Math.min(Math.max(1, Math.min(2, deviceRatio || 1)), 8192 / cssWidth, 8192 / cssHeight, Math.sqrt(8 * 1024 * 1024 / (cssWidth * cssHeight))) * requestedScale;
  return { width: Math.max(1, Math.floor(cssWidth * density)), height: Math.max(1, Math.floor(cssHeight * density)), density, scale: pixelsPerUnit * density };
}
export function viewportWorldPoint(clientX, clientY, bounds, scrollLeft, scrollTop, pixelsPerTile) {
  return { x: Math.floor((clientX - bounds.left + scrollLeft) / pixelsPerTile), y: Math.floor((clientY - bounds.top + scrollTop) / pixelsPerTile) };
}
