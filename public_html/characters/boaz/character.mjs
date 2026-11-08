import { boazPlatformer } from './platformer/view.mjs';
export const boazCharacter = {
  id:'boaz',name:'Boaz',portrait:'characters/boaz/portrait.png',
  views:{side:{...boazPlatformer,frame:'side'},front:{...boazPlatformer,frame:'idle'}}
};
