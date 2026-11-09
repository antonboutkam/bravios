import { rhythmTempo } from './model.mjs';
export function draw(ctx,g,services={}) {
  const {hero,drawTile}=services;
  ctx.fillStyle='#354366';ctx.fillRect(0,374,800,66);
  ctx.fillStyle='#ffe2a4';ctx.fillRect(0,374,800,5);
  ctx.fillStyle='#33435d';ctx.textAlign='center';ctx.font='bold 22px sans-serif';
  ctx.fillText('STEKELSPRONG',400,50);
  ctx.font='15px sans-serif';ctx.fillText(g.time<60?'Vind het ritme · spring over elke bal':'Het tempo stijgt!',400,77);
  const until=Math.max(0,g.nextBall-g.time),interval=rhythmTempo(g.time).interval;
  ctx.fillStyle='#ddd9e8';ctx.fillRect(250,100,300,8);ctx.fillStyle='#9574d2';ctx.fillRect(250,100,300*(1-Math.min(1,until/interval)),8);
  for(const m of g.monsters) {
    ctx.save();ctx.globalAlpha=m.alive?1:.18;
    if(m.alive)drawTile?.(ctx,m.tile,m.x-22,374-m.lift-44,44,'grass',{time:g.time,icon:true});
    else{ctx.fillStyle='#6c6585';ctx.font='26px sans-serif';ctx.fillText('×',m.x,364);}
    ctx.restore();
  }
  g.players.forEach((p,i)=>{
    ctx.save();ctx.globalAlpha=p.alive?1:.25;
    hero?.(ctx,p.x-24,374-p.lift-48,48,1,false,0,p.character,{appearance:p.appearance,front:true,running:p.alive&&p.lift===0&&g.state==='playing',airborne:false,time:g.time,won:g.state==='won'&&p.alive});
    ctx.fillStyle=i?'#b7444f':'#315caa';ctx.font='bold 14px sans-serif';ctx.fillText(p.alive?`P${i+1}`:'AF',p.x,407);ctx.restore();
  });
  for(const b of g.balls) {
    ctx.save();ctx.translate(b.x,345);ctx.rotate(b.x/24);ctx.beginPath();
    for(let i=0;i<24;i++){const a=i*Math.PI/12,r=i%2?21:29;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.closePath();ctx.fillStyle='#5b6176';ctx.fill();ctx.strokeStyle='#313748';ctx.lineWidth=2;ctx.stroke();
    ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fillStyle='#969fb3';ctx.fill();ctx.restore();
  }
  if(g.paused){ctx.fillStyle='#26354cbb';ctx.fillRect(0,0,800,440);ctx.fillStyle='#fff';ctx.font='bold 30px sans-serif';ctx.fillText('Pauze · druk op Verder',400,220);}
}
