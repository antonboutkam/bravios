import { CHARACTER_CATALOG } from './catalog.mjs';
import { normalizeAppearance } from './custom/maker.mjs';
export const CHARACTER_PROFILES = Object.fromEntries(CHARACTER_CATALOG.map(profile => [profile.id, profile]));
export const DEFAULT_CHARACTER = CHARACTER_CATALOG[0].id;
export function nextCharacter(current) {
  const ids = Object.keys(CHARACTER_PROFILES);
  return ids[(ids.indexOf(current) + 1) % ids.length];
}
export const CHARACTER_VIEWS = ['side','front','top-down','oblique'];
export function participantRoster(count=1,primary={character:DEFAULT_CHARACTER}){
  if(![1,2].includes(count))throw new Error('Kies één of twee spelers.');
  const character=CHARACTER_PROFILES[primary.character]?primary.character:DEFAULT_CHARACTER;
  return Array.from({length:count},(_,i)=>({id:`player-${i+1}`,character:i?nextCharacter(character):character,appearance:i?null:normalizeAppearance(primary.appearance)}));
}
export function characterView(identity,view){
  const profile=CHARACTER_PROFILES[identity.character];
  if(!CHARACTER_VIEWS.includes(view)||!profile)throw new Error('Onbekend karakter of aanzicht.');
  if(identity.appearance){
    if(view==='front'||view==='side')return {renderer:'custom',appearance:normalizeAppearance(identity.appearance),view};
    throw new Error(`Voor eigen karakters ontbreekt het aanzicht ${view}.`);
  }
  const variant=profile.views[view];
  if(!variant)throw new Error(`Voor ${profile.name} ontbreekt het aanzicht ${view}.`);
  return {...variant,asset:variant.poses?.[variant.frame] || variant.asset,view,character:profile.id};
}
