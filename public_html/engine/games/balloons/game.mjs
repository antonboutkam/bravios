import { create, step, action, choose, popSmallBalloon } from './model.mjs';
import { draw } from './render.mjs';
import { wrapGameSession } from '../shared/session.mjs';
export function createSession(context={}){return wrapGameSession(create(context.random),{step,draw,action,choose,point:(g,p)=>popSmallBalloon(g,p.x,p.y),
  ui:g=>({status:`🎈 ${g.score} / 10`,hint:'Tik op een ballon. Met de richtingen kies je een ballon; spatie / A prikt hem.',result:'Goed gedaan! Alles verzameld!'}),
  direction:(g,dir)=>choose(g,['left','up'].includes(dir)?-1:1),
  pointer(g,phase,p){if(phase==='down')popSmallBalloon(g,p.x,p.y);}},context);}
