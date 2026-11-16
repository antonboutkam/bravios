// A start location is a place in the level, independent of the chosen hero.
export function drawStartMarker(ctx, x = 0, y = 0, size = 32, { icon = false } = {}) {
  ctx.save(); ctx.translate(x,y); ctx.scale(size/32,size/32);
  if (!icon) {
    ctx.fillStyle='#fff4c94d'; ctx.beginPath(); ctx.ellipse(16,17,19,19,0,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle='#244c4438'; ctx.beginPath(); ctx.ellipse(16,31,12,3,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#9d714a'; ctx.fillRect(7,3,3,28);
  ctx.fillStyle='#e4b471'; ctx.fillRect(7,3,1,27);
  ctx.fillStyle='#259c9d'; ctx.strokeStyle='#27636b'; ctx.lineWidth=1.3;
  ctx.beginPath(); ctx.moveTo(10,4); ctx.lineTo(30,4); ctx.lineTo(26,11); ctx.lineTo(30,18); ctx.lineTo(10,18); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#fff4cc'; ctx.beginPath(); ctx.moveTo(16,7); ctx.lineTo(23,11); ctx.lineTo(16,15); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffc65e'; ctx.beginPath(); ctx.arc(8.5,2.5,2.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#c9a176'; ctx.fillRect(3,30,12,2);
  ctx.restore();
}
