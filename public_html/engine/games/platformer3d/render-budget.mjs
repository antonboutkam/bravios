// Keep the visible canvas full-size while bounding its actual rendering work.
export function renderSize3D(width,height,software=false) {
  const scale=Math.min(1,(software?640:1280)/Math.max(1,width),(software?400:720)/Math.max(1,height));
  return {width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale))};
}
export class RenderBudget3D {
  constructor(software=false){this.interval=1000/(software?15:30);this.last=-Infinity;this.dirty=true;}
  invalidate(){this.dirty=true;}
  take(now,animated=false,force=false){
    if(!force&&(!this.dirty&&!animated||now-this.last<this.interval))return false;
    this.last=now;this.dirty=false;return true;
  }
}
