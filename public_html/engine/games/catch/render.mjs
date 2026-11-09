import { smallCircle } from '../shared/backdrop.mjs';
export function draw(ctx,g){
    ctx.fillStyle='#b8854b';ctx.fillRect(g.basket-47,382,94,27);ctx.fillStyle='#e8ba72';ctx.fillRect(g.basket-52,375,104,9);ctx.strokeStyle='#8c613b';ctx.lineWidth=3;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(g.basket-36+i*18,384);ctx.lineTo(g.basket-36+i*18,407);ctx.stroke();}
    if(g.fruit){const f=g.fruit;smallCircle(ctx,f.x-6,f.y,13,'#df6760');smallCircle(ctx,f.x+6,f.y,13,'#ed7c6c');ctx.fillStyle='#5b8f49';ctx.beginPath();ctx.ellipse(f.x+7,f.y-16,10,4,-.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#855e3b';ctx.fillRect(f.x-1,f.y-21,3,10);}
}
