import { loadImageAsset, reportImageProblem } from '../../image-loader.mjs';
import { characterView } from '../roster.mjs';
import { ResourcePool } from '../../runtime/resource-scope.mjs';
export const characterViewPool=new ResourcePool();
// New view renderers acquire only their selected pose image. The final lease closes the bitmap.
export async function acquireCharacterView(identity,view,scope,pool=characterViewPool){
  const variant=characterView(identity,view);
  if(!variant.asset)return variant;
  const image=await pool.acquire(variant.asset,async()=>{
    const source=await loadImageAsset(variant.asset);
    try{return await createImageBitmap(source);}catch{throw reportImageProblem(variant.asset,'De afbeelding kan niet voor dit spel worden voorbereid.');}
  },bitmap=>bitmap.close(),scope);
  return {...variant,image};
}
