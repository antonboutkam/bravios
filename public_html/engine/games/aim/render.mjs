import { smallCircle } from '../shared/backdrop.mjs';
export function draw(ctx,g){
    // A dotted preview gives children a visible aiming guide.
    if(!g.ball&&g.state==='playing'){const a=g.angle*Math.PI/180;for(let i=1;i<=18;i++){const t=i*.09,x=90+Math.cos(a)*g.power*t,y=360-Math.sin(a)*g.power*t+260*t*t;if(y>405)break;smallCircle(ctx,x,y,3,'#75619488');}}
    ctx.strokeStyle='#8d6848';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(610,300);ctx.lineTo(620,390);ctx.lineTo(680,390);ctx.lineTo(693,300);ctx.stroke();
    for(let i=0;i<4;i++){ctx.strokeStyle='#fff9e1';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(618+i*22,305);ctx.lineTo(625+i*16,384);ctx.stroke();}
    ctx.strokeStyle='#d77c42';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(650,300,48,9,0,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='#8f69bf';ctx.fillRect(65,365,50,45);smallCircle(ctx,90,370,28,'#a48bd0');
    const b=g.ball||{x:90,y:350};smallCircle(ctx,b.x,b.y,12,'#f29d48');ctx.strokeStyle='#a65f32';ctx.lineWidth=2;ctx.beginPath();ctx.arc(b.x,b.y,12,0,Math.PI*2);ctx.moveTo(b.x-10,b.y);ctx.lineTo(b.x+10,b.y);ctx.stroke();
}
