import { createCakeGame, stepCakeGame, throwCake, CAKE_RULES } from './model.mjs';
import { createCakeStage } from './render.mjs';
import { characters3D } from '../platformer3d/access.mjs';
export function createSession(context={}) {
  const eligible=characters3D();
  if(!eligible.length)throw new Error('Er zijn nog geen personages met een 3D-model.');
  const first=context.participants?.[0]?.character||eligible[0].id;
  const identities=Array.from({length:2},(_,index)=>{
    const given=context.participants?.[index],profile=given?eligible.find(p=>p.id===given.character):index===1?eligible.find(p=>p.id!==first)||eligible[0]:eligible[0];
    if(!profile||given?.appearance)throw new Error('Kies voor taartgooien een personage met een 3D-model.');
    return {id:given?.id||`player-${index+1}`,character:profile.id,name:index===1&&context.playerCount!==2?`${profile.name} (computer)`:profile.name};
  });
  let state=createCakeGame(context.playerCount||1,identities,context.random),view=null,disposed=false,accumulator=0;
  const keys=new Set(),touch=[{},{}];
  const capabilities={pause:true,jumpButtons:true,movementButtons:true,actionLabel:'Gooi taart'};
  function resetInput(){keys.clear();touch[0]={};touch[1]={};accumulator=0;}
  function keyboard(index){
    const two=state.playerCount===2;
    const codes=index===0?{left:['KeyA',...(!two?['ArrowLeft']:[])],right:['KeyD',...(!two?['ArrowRight']:[])],up:['KeyW',...(!two?['ArrowUp']:[])],down:['KeyS',...(!two?['ArrowDown']:[])]}:{left:['ArrowLeft'],right:['ArrowRight'],up:['ArrowUp'],down:['ArrowDown']};
    return Object.fromEntries(Object.entries(codes).map(([direction,values])=>[direction,values.some(code=>keys.has(code))||!!touch[index][direction]]));
  }
  const session={
    viewport:{width:960,height:540,view:'3d'},capabilities,
    get state(){return state;},
    async mount(canvas){
      if(disposed)return;
      const stage=(context.services?.createCakeStage||createCakeStage)(canvas);view=stage;
      context.scope?.defer(()=>stage.dispose());
      try{await stage.prepare(identities);if(!disposed)stage.draw(state,true);}
      catch(error){stage.dispose();if(!disposed)throw error;}
    },
    update(input={},dt=0){
      if(!state||state.paused||state.state!=='playing')return;
      const controls=[0,1].map(index=>{
        const own=keyboard(index),pad=input.players?.[index]||(index===0?input:{});
        return Object.fromEntries(['left','right','up','down'].map(dir=>[dir,own[dir]||!!pad[dir]]));
      });
      accumulator+=Math.max(0,Math.min(Number.isFinite(dt)?dt:0,.25));
      while(accumulator>=1/120){stepCakeGame(state,{players:controls},1/120);accumulator-=1/120;}
    },
    action(index=0){if(state)throwCake(state,index);},
    direction(){},
    control(index,direction,down){if(touch[index])touch[index][direction]=down;},
    key(event,down){
      if(!state)return false;
      const movement=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'];
      if(movement.includes(event.code)){if(down)keys.add(event.code);else keys.delete(event.code);return true;}
      if(['Space','Enter','KeyP'].includes(event.code)){
        if(down&&!event.repeat){
          if(event.code==='KeyP')session.togglePause();
          else if(state.state!=='playing')return false;
          else session.action(event.code==='Enter'&&state.playerCount===2?1:0);
        }
        return true;
      }
      return false;
    },
    pointer(phase){if(phase==='down')session.action(0);},
    pause(){if(state?.state==='playing'){state.paused=true;resetInput();}},
    togglePause(){if(state?.state==='playing'){state.paused=!state.paused;resetInput();}},
    render(){view?.draw(state);},
    ui(){
      if(!state)return {};
      const [a,b]=state.players,left=Math.max(0,Math.ceil(CAKE_RULES.duration-state.time));
      return {status:state.paused?'Gepauzeerd · P / Start om verder te gaan':`${a.name}: ${a.score} · ${b.name}: ${b.score} · ${left} s · Taarten: ${a.cakes} / ${b.cakes}`,
        hint:state.playerCount===2?'Haal taarten bij je karretje. Speler 1: WASD + spatie. Speler 2: pijltjes + Enter. Of twee controllers: stick + A. P / Start: pauze. Eerst 7 raak!':'Haal links taarten bij je karretje. WASD / pijltjes / stick: lopen en uitwijken. Spatie / Enter / A: gooi. Je richt vanzelf naar je tegenstander. Eerst 7 raak! P / Start: pauze.',
        result:state.state==='draw'?`Gelijkspel! ${a.score} – ${b.score}.`:state.state!=='playing'?`${state.players[state.winner].name} wint met ${Math.max(a.score,b.score)} – ${Math.min(a.score,b.score)}!`:''};
    },
    result(){return state&&state.state!=='playing'?{game:state.kind,outcome:state.state,score:state.players[0].score,winner:state.winner,scores:state.players.map(p=>p.score)}:null;},
    dispose(){if(disposed)return;disposed=true;resetInput();view?.dispose();view=null;state=null;}
  };
  return session;
}
