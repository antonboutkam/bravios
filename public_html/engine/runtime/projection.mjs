// World coordinates remain independent from rendering. Height is measured upwards.
export function projectPoint({x,y,height=0},view='top-down'){
  if(view==='top-down')return {x,y:y-height};
  if(view==='oblique')return {x:x-y,y:(x+y)*.5-height};
  throw new Error(`Onbekend camera-aanzicht: ${view}`);
}
export function unprojectPoint({x,y},view='top-down',height=0){
  if(view==='top-down')return {x,y:y+height};
  if(view==='oblique')return {x:(y+height)+x*.5,y:(y+height)-x*.5};
  throw new Error(`Onbekend camera-aanzicht: ${view}`);
}
export function depthOrder(actors,view='top-down'){
  return [...actors].sort((a,b)=>projectPoint({...a,height:0},view).y-projectPoint({...b,height:0},view).y);
}
