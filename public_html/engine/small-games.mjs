export { SMALL_GAME_TYPES } from './games/catalog.mjs';
export { setupSmallGames } from './games/shell.mjs';
export { shootSmallBall } from './games/aim/model.mjs';
export { popSmallBalloon } from './games/balloons/model.mjs';
import { createSession as aimSession } from './games/aim/game.mjs';
import { createSession as balloonSession } from './games/balloons/game.mjs';
import { createSession as catchSession } from './games/catch/game.mjs';
import { createSession as rhythmSession } from './games/rhythm/game.mjs';
import { step as stepAim } from './games/aim/model.mjs';
import { step as stepBalloons } from './games/balloons/model.mjs';
import { step as stepCatch } from './games/catch/model.mjs';
import { stepRhythmGame } from './games/rhythm/model.mjs';
import { draw as drawAim } from './games/aim/render.mjs';
import { draw as drawBalloons } from './games/balloons/render.mjs';
import { draw as drawCatch } from './games/catch/render.mjs';
import { draw as drawRhythm } from './games/rhythm/render.mjs';
import { hero, drawTile } from './art.mjs';
import { wrapGameSession } from './games/shared/session.mjs';
const legacySessions={aim:aimSession,balloons:balloonSession,catch:catchSession,rhythm:rhythmSession};
const legacySteps={aim:stepAim,balloons:stepBalloons,catch:stepCatch,rhythm:stepRhythmGame};
const legacyDraws={aim:drawAim,balloons:drawBalloons,catch:drawCatch,rhythm:drawRhythm};
export function createSmallGame(kind,random=Math.random,playerCount=1){if(!legacySessions[kind])throw new Error('Onbekend klein spel.');return legacySessions[kind]({random,playerCount}).state;}
export function stepSmallGame(g,input={},dt=1/60){legacySteps[g.kind](g,input,dt);}
export function drawSmallGame(ctx,g,width=800,height=440){wrapGameSession(g,{draw:legacyDraws[g.kind]},{services:{hero,drawTile}}).render(ctx,width,height);}
