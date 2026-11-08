import { characterView } from '../roster.mjs';
import { ResourcePool } from '../../runtime/resource-scope.mjs';
export const characterViewPool=new ResourcePool();
// New view renderers acquire only their own sheets. The final lease closes the bitmap.
export async function acquireCharacterView(identity,view,scope,pool=characterViewPool){
  const variant=characterView(identity,view);
  if(!variant.asset)return variant;
  const image=await pool.acquire(variant.asset,async()=>{
    const url=globalThis.braviosAssets?.[variant.asset]||new URL(variant.asset,new URL('../../',import.meta.url)).href;
    const response=await fetch(url);if(!response.ok)throw new Error('Karakterafbeelding kon niet worden geladen.');
    return createImageBitmap(await response.blob());
  },bitmap=>bitmap.close(),scope);
  return {...variant,image};
}
