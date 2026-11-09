export { RHYTHM_DURATION, rhythmTempo, createRhythmGame, jumpRhythm, stepRhythmGame } from './games/rhythm/model.mjs';
import { draw } from './games/rhythm/render.mjs';
import { hero, drawTile } from './art.mjs';
export function drawRhythmGame(ctx,g){draw(ctx,g,{hero,drawTile});}
