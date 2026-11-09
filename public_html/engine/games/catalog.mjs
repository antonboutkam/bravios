// Metadata is cheap; selecting a game is the only path that imports its implementation.
export const SMALL_GAME_TYPES = [
  {id:'rhythm',name:'Stekelsprong',icon:'⚙',view:'front',players:[1,2],hint:'Spring op het ritme over stekelballen. Houd het langer vol dan de monsters! Alleen of samen.'},
  {id:'aim',name:'Mik & schiet',icon:'🏀',view:'side',players:[1],hint:'Mik het balletje in de mand. Je krijgt vijf ballen.'},
  {id:'balloons',name:'Ballonnenpret',icon:'🎈',view:'front',players:[1],hint:'Prik alle tien de ballonnen. Welke kleur kies jij?'},
  {id:'catch',name:'Fruitvanger',icon:'🍎',view:'front',players:[1],hint:'Schuif de mand en vang tien appels. Je mag er vijf missen.'}
];
export function loadGamePack(id){
  switch(id){
    case 'rhythm':return import('./rhythm/game.mjs');
    case 'aim':return import('./aim/game.mjs');
    case 'balloons':return import('./balloons/game.mjs');
    case 'catch':return import('./catch/game.mjs');
    default:return Promise.reject(new Error('Onbekend klein spel.'));
  }
}
