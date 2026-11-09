import { create, step, shootSmallBall } from './model.mjs';
import { draw } from './render.mjs';
import { wrapGameSession } from '../shared/session.mjs';
export function createSession(context={}){return wrapGameSession(create(context.random),{step,draw,action:shootSmallBall,
  ui:g=>({status:`● ${g.score} raak · Bal ${g.shots} / 5`,hint:'Sleep om te mikken en laat los om te schieten. ↑↓: hoek · ←→: kracht · spatie / A: schiet.',result:`${g.score} van de 5 raak! Nog een rondje?`}),
  pointer(g,phase,p,dragging){
    if(phase==='up'&&dragging){shootSmallBall(g);return;}
    if(g.ball||!(phase==='down'||phase==='move'&&dragging))return;
    g.angle=Math.max(20,Math.min(80,Math.atan2(360-p.y,p.x-90)*180/Math.PI));
    g.power=Math.max(300,Math.min(750,Math.hypot(p.x-90,360-p.y)*1.8));
  }
},context);}
