import { drawSmallBackdrop } from './backdrop.mjs';
export function wrapGameSession(initial,implementation,context){
  let state=initial,services=context.services||{};
  return {
    viewport:{width:800,height:440,view:context.view||'front'},
    capabilities:implementation.capabilities||{},
    ui(){return state?implementation.ui(state):{};},
    pointer(phase,point,dragging){if(state?.state==='playing')implementation.pointer?.(state,phase,point,dragging);},
    direction(direction){if(state)implementation.direction?.(state,direction);},
    togglePause(){if(state?.state==='playing'&&implementation.capabilities?.pause)state.paused=!state.paused;},
    pause(){if(state?.state==='playing'&&implementation.capabilities?.pause)state.paused=true;},
    get state(){return state;},
    update(input,dt){if(state)implementation.step(state,input,dt);},
    action(player=0){if(state)implementation.action?.(state,player);},
    point(point){if(state)implementation.point?.(state,point);},
    choose(delta){if(state)implementation.choose?.(state,delta);},
    render(ctx,width=800,height=440){
      if(!state)return;
      ctx.save();ctx.scale(width/800,height/440);drawSmallBackdrop(ctx,state);
      implementation.draw(ctx,state,services);ctx.restore();
    },
    result(){return state&&state.state!=='playing'?{game:state.kind,outcome:state.state,score:state.score??0}:null;},
    dispose(){state=null;services=null;},
  };
}
