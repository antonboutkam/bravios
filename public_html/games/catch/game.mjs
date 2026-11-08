import { create, step } from './model.mjs';
import { draw } from './render.mjs';
import { wrapGameSession } from '../shared/session.mjs';
export function createSession(context={}){return wrapGameSession(create(context.random),{step,draw,
  ui:g=>({status:`🍎 ${g.score} / 10 · Gemist ${g.misses} / 5`,hint:'Schuif de mand met je vinger, muis of ←→ / stick. Vang de appels!',result:g.state==='won'?'Goed gedaan! Alles verzameld!':'Goed geprobeerd! Nog een rondje?'}),
  pointer(g,phase,p){if(phase==='down'||phase==='move')g.basket=Math.max(50,Math.min(750,p.x));}
},context);}
