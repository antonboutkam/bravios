import { smallCircle } from '../shared/backdrop.mjs';
export function draw(ctx,g){
    g.balloons.forEach((b,i)=>{if(!b.alive)return;const sway=Math.sin(g.time*1.5+i)*3;ctx.strokeStyle='#9585a0';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(b.x,b.y+30);ctx.quadraticCurveTo(b.x-15,b.y+55,b.x+5,b.y+82);ctx.stroke();ctx.fillStyle=b.color;ctx.beginPath();ctx.ellipse(b.x+sway,b.y,b.r,b.r*1.15,0,0,Math.PI*2);ctx.fill();smallCircle(ctx,b.x-9+sway,b.y-12,6,'#ffffff80');if(g.selected===i){ctx.strokeStyle='#6c50b0';ctx.lineWidth=3;ctx.setLineDash([5,5]);ctx.beginPath();ctx.arc(b.x,b.y,b.r+10,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}});
}
