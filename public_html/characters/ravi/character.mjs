import { raviPlatformer } from './platformer/view.mjs';
export const raviCharacter = {
  id:'ravi',name:'Ravi',portrait:'characters/ravi/portrait.png',
  views:{side:{...raviPlatformer,frame:'side'},front:{...raviPlatformer,frame:'idle'}}
};
