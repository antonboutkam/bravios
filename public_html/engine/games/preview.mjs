import { drawSmallBackdrop } from './shared/backdrop.mjs';
import { draw } from './aim/render.mjs';
// A static card reuses the artwork without creating or loading a game session.
export function drawMiniPreview(ctx,width,height){const state={kind:'aim',state:'playing',angle:55,power:560,ball:null};ctx.save();ctx.scale(width/800,height/440);drawSmallBackdrop(ctx,state);draw(ctx,state);ctx.restore();}
