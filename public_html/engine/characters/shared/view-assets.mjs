import { assetURL } from '../../paths.mjs';
import { characterView } from '../roster.mjs';
import { ResourcePool } from '../../runtime/resource-scope.mjs';
export const characterViewPool=new ResourcePool();
// New view renderers acquire only their selected pose image. The final lease closes the bitmap.
export async function acquireCharacterView(identity,view,scope,pool=characterViewPool){
  const variant=characterView(identity,view);
  if(!variant.asset)return variant;
  const image=await pool.acquire(variant.asset,async()=>{
    const url=assetURL(variant.asset);
    const response=await fetch(url);if(!response.ok)throw new Error('Karakterafbeelding kon niet worden geladen.');
    return createImageBitmap(await response.blob());
  },bitmap=>bitmap.close(),scope);
  return {...variant,image};
}
