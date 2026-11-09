const enemyWingColors = { cream: '#fff3d2', pink: '#f79fc5', blue: '#8ed9ff', green: '#a6e78d', purple: '#c9a0ff', orange: '#ffc076' };
function designEllipse(ctx, color, x, y, rx, ry) {
  ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
}
function designBox(ctx, color, x, y, w, h) { ctx.fillStyle = color; ctx.fillRect(x,y,w,h); }
export function drawEnemyWings(ctx, design, x, y, w = 32, h = 32, time = 0) {
  if (!design || design.wings === 'none') return;
  ctx.save(); ctx.translate(x + w / 2, y + h * .55); ctx.scale(w / 32, h / 32);
  const size = { small: .7, medium: 1, large: 1.35 }[design.wingSize] || 1;
  ctx.scale(size, size); const flap = Math.sin(time * 8) * .18;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.scale(side, 1); ctx.rotate(-.18 + flap);
    ctx.fillStyle = enemyWingColors[design.wingColor] || enemyWingColors.cream;
    ctx.strokeStyle = '#424568'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(7, 4);
    if (design.wings === 'bat') { ctx.lineTo(31,-21); ctx.quadraticCurveTo(30,-2,26,8); ctx.quadraticCurveTo(20,-1,17,10); ctx.quadraticCurveTo(12,2,7,4); }
    else if (design.wings === 'butterfly') { ctx.bezierCurveTo(38,-35,41,1,20,5); ctx.bezierCurveTo(37,22,14,25,7,4); }
    else { ctx.bezierCurveTo(20,-3,20,-23,31,-22); ctx.quadraticCurveTo(37,-4,24,7); ctx.quadraticCurveTo(14,13,7,4); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = .55; ctx.beginPath(); ctx.moveTo(10,3); ctx.lineTo(28,-15); ctx.stroke();
    if (design.wings === 'butterfly') { designEllipse(ctx,'#fff8ef',26,-10,4,6); designEllipse(ctx,'#fff8ef',21,13,3,3); }
    if (design.wings === 'feather') for (let i=0;i<3;i++) {ctx.beginPath();ctx.moveTo(14+i*4,5-i);ctx.lineTo(27+i,-9-i*4);ctx.stroke();}
    ctx.restore();
  }
  ctx.restore();
}
export function drawEnemyFront(ctx, design, x, y, w = 32, h = 32, time = 0, tucked = false) {
  if (!design || tucked) return;
  ctx.save(); ctx.translate(x,y);ctx.scale(w/32,h/32);
  if (design.body !== 'original') {
    designEllipse(ctx,'#4b4354',8,29,6,3);designEllipse(ctx,'#4b4354',25,29,6,3);
    if (design.body === 'turtle') {
      designEllipse(ctx,'#f0d89b',16,23,16,9);designEllipse(ctx,'#40895b',16,20,14,9);
      ctx.strokeStyle='#b1df7b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(8,17);ctx.lineTo(15,13);ctx.lineTo(23,18);ctx.lineTo(22,24);ctx.lineTo(13,27);ctx.lineTo(8,17);ctx.moveTo(15,13);ctx.lineTo(14,22);ctx.lineTo(22,24);ctx.stroke();
    } else if(design.body === 'mushroom') {
      designEllipse(ctx,'#f4dfb7',16,21,12,11);designBox(ctx,'#d5b782',10,28,13,3);
      designEllipse(ctx,'#e97866',11,18,3,3);designEllipse(ctx,'#e97866',22,23,3,3);
    } else {
      designBox(ctx,'#465974',2,13,28,16);designBox(ctx,'#9cb9cf',5,14,22,13);designBox(ctx,'#f5c861',10,17,12,7);
      designEllipse(ctx,'#e46d74',15,20,2,2);designBox(ctx,'#657994',6,29,6,3);designBox(ctx,'#657994',22,29,6,3);
    }
  }
  if (design.head !== 'original') {
    if (design.head === 'mushroom') {
      designEllipse(ctx,'#f9e1b7',16,11,11,9);designEllipse(ctx,'#df665e',16,3,17,9);
      designEllipse(ctx,'#fff3d8',8,1,4,3);designEllipse(ctx,'#fff3d8',23,1,4,4);designEllipse(ctx,'#fff3d8',16,6,3,2);
    } else if(design.head === 'turtle') {
      designEllipse(ctx,'#9bd06c',16,8,14,10);designEllipse(ctx,'#cce78a',21,12,11,6);
    } else {
      designBox(ctx,'#4b5b76',2,-1,28,19);designBox(ctx,'#bccbd6',4,1,24,15);designBox(ctx,'#617c91',0,4,3,9);designBox(ctx,'#617c91',29,4,3,9);
      designBox(ctx,'#617c91',15,-5,2,5);designEllipse(ctx,'#ffbe63',16,-6,3,3);
    }
    designBox(ctx,'#fff',9,7,5,6);designBox(ctx,'#fff',21,7,5,6);designBox(ctx,'#283249',11,9,3,4);designBox(ctx,'#283249',21,9,3,4);
    designBox(ctx,'#6c4653',14,15,6,2);
  }
  if (design.hat === 'party') {
    ctx.fillStyle='#9b72e3';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(16,-22);ctx.lineTo(29,0);ctx.fill();designEllipse(ctx,'#ffd772',16,-22,3,3);designEllipse(ctx,'#f9dca0',16,-10,3,2);designBox(ctx,'#f8b5d3',3,-1,26,3);
  } else if(design.hat === 'top') {
    designBox(ctx,'#2b314a',6,-19,20,18);designBox(ctx,'#e989b2',6,-6,20,5);designBox(ctx,'#2b314a',1,-1,30,4);designBox(ctx,'#68718d',9,-17,3,9);
  } else if(design.hat === 'crown') {
    ctx.fillStyle='#ffd66d';ctx.strokeStyle='#b68139';ctx.beginPath();ctx.moveTo(3,0);ctx.lineTo(2,-16);ctx.lineTo(10,-8);ctx.lineTo(16,-20);ctx.lineTo(23,-8);ctx.lineTo(30,-16);ctx.lineTo(29,0);ctx.closePath();ctx.fill();ctx.stroke();designEllipse(ctx,'#ed7897',16,-5,3,3);
  } else if(design.hat === 'propeller') {
    designEllipse(ctx,'#6dbbe5',16,-1,14,7);designBox(ctx,'#e66d69',16,-7,11,7);designBox(ctx,'#eccd76',3,-1,29,3);designBox(ctx,'#616a80',15,-13,2,6);
    ctx.save();ctx.translate(16,-13);ctx.scale(.6 + Math.abs(Math.cos(time*9))*.4,1);designEllipse(ctx,'#f3d06a',0,0,16,3);ctx.restore();
  }
  ctx.restore();
}
