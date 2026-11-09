export function smallCircle(ctx,x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
export function drawSmallBackdrop(ctx,g){
  const sky=ctx.createLinearGradient(0,0,0,440);sky.addColorStop(0,g.kind==='balloons'?'#e6ddf6':'#bce9ed');sky.addColorStop(1,'#fff5d7');ctx.fillStyle=sky;ctx.fillRect(0,0,800,440);
  for(const [x,y] of [[75,65],[400,45],[690,85]]){smallCircle(ctx,x,y,23,'#ffffffb0');smallCircle(ctx,x+28,y+5,30,'#ffffffb0');smallCircle(ctx,x+55,y+8,20,'#ffffffb0');}
  ctx.fillStyle='#9bcb83';ctx.beginPath();ctx.ellipse(180,445,320,75,0,0,Math.PI*2);ctx.ellipse(650,440,310,65,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#7fae69';ctx.fillRect(0,410,800,30);
}
