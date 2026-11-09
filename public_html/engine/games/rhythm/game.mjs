import { createRhythmGame, jumpRhythm, stepRhythmGame } from './model.mjs';
import { draw } from './render.mjs';
import { wrapGameSession } from '../shared/session.mjs';
export function createSession(context={}){
  const state=createRhythmGame(context.playerCount);
  state.players.forEach((player,index)=>{const identity=context.participants?.[index];if(identity){player.character=identity.character;player.appearance=identity.appearance;}});
  return wrapGameSession(state,{step:stepRhythmGame,draw,action:(g,index=0)=>jumpRhythm(g,index),capabilities:{jumpButtons:true,pause:true,upAction:true},
    ui:g=>({status:`${Math.floor(g.time/60)}:${String(Math.floor(g.time%60)).padStart(2,'0')} · ${g.monsters.filter(m=>m.alive).length} monsters over`,hint:'Spring over de ballen! Speler 1: spatie / A (kruisje). Speler 2: ↑ / Y (driehoek), of A op controller 2. Start: pauze / verder. Na één minuut gaat het sneller.',result:g.state==='won'?(g.playerCount===2?'Gewonnen! Jullie hebben de monsters verslagen!':'Gewonnen! Je hebt alle monsters verslagen!'):'Af! Probeer het ritme nog eens.'}),
    pointer(g,phase,p){if(phase==='down')jumpRhythm(g,g.playerCount===2&&p.x>=400?1:0);}},context);
}
