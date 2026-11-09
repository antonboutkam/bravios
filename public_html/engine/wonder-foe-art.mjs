import { drawEnemySprite } from './enemies/sprites.mjs';
import { WONDER_FOES, wonderBossPads } from './wonder-foes.mjs?v=1';

const foeEllipse=(c,color,x,y,rx,ry=rx)=>{c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();};
function foePath(c,color,points,stroke=false){c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));if(stroke){c.strokeStyle=color;c.stroke();}else{c.closePath();c.fillStyle=color;c.fill();}}
function foeBox(c,color,x,y,w,h,r=3){c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();}
function foeEye(c,x,y,r=5,look=-1){foeEllipse(c,'#fff9e8',x,y,r,r*1.1);foeEllipse(c,'#242344',x+look*1.5,y+1,r*.43);}
function foeCrown(c,x,y,color='#F7C746'){foePath(c,color,[[x-17,y],[x-21,y-18],[x-9,y-10],[x,y-24],[x+9,y-10],[x+21,y-18],[x+17,y]]);foeBox(c,'#fff1a6',x-17,y-4,34,5,2);}
const FOE_MINION_PALETTES=[['#7FE0B1','#DCF9C7','#E77794'],['#F6B193','#FFEAC8','#55B9D0'],['#86C8F5','#D2E5FF','#DA93E7']];
export function drawWonderFoe(ctx,enemy,time=0,reducedMotion=false,{ghost=false}={}) {
  const info=WONDER_FOES[enemy.wonderType];if(!info)return;
  const t=reducedMotion?0:time,large=enemy.boss,exposed=enemy.phase==='exposed';
  let primary=info.primary_color,secondary=info.secondary_color,accent=info.accent_color.startsWith('#')?info.accent_color:'#F7C746';
  if(!large){const palette=FOE_MINION_PALETTES[enemy.palette_id||0];secondary=palette[0];accent=palette[2];if(enemy.palette_id)primary=palette[enemy.wonderType%2];}
  const sprite=drawEnemySprite(ctx,enemy,t,{ghost});
  if(!sprite) {
  ctx.save();ctx.translate(enemy.x,enemy.y);ctx.scale(enemy.w/100,enemy.h/100);ctx.lineWidth=3;ctx.lineCap='round';ctx.lineJoin='round';
  if(ghost)ctx.globalAlpha=.24;
  if(enemy.hitCooldown>0)ctx.globalAlpha=.65;
  if(enemy.defeated){
    if(enemy.escape){ctx.globalAlpha*=Math.min(1,enemy.exitTime);for(let i=0;i<5;i++)foeEllipse(ctx,i%2?secondary:primary,15+i*18,65-Math.sin(i)*12,18);ctx.restore();return;}
    if(enemy.wonderType===7){foeEllipse(ctx,'#fffaf3',50,75,25,20);foeEllipse(ctx,'#fffaf3',43,40,7,24);foeEllipse(ctx,'#fffaf3',61,40,7,24);foeEllipse(ctx,'#ffc2d9',43,38,3,17);foeEllipse(ctx,'#ffc2d9',61,38,3,17);foeEye(ctx,43,70,4);foeEye(ctx,60,70,4);foeEllipse(ctx,'#e998b5',52,79,3);ctx.restore();return;}
    ctx.translate(20,45);ctx.scale(.6,.55);
  }
  const wobble=Math.sin(t*(enemy.wonderType===4?5:2.6)+(enemy.palette_id||0));
  ctx.translate(50,96);ctx.scale(1+wobble*.025,1-wobble*.025);ctx.translate(-50,-96);
  // A pale contour and type-specific details remain readable against every realm.
  ctx.shadowColor='#171631';ctx.shadowBlur=large?2:1;
  switch(enemy.wonderType){
    case 0:{
      foeEllipse(ctx,primary,50,65,47,29);foeEllipse(ctx,primary,36,51,27,24);foeEllipse(ctx,secondary,34,49,16,9);
      for(let i=0;i<7;i++)foeEye(ctx,18+i*10,52+(i%2)*12,4+(i%3),enemy.facing);
      foeEllipse(ctx,'#412060',54,77,13,7);foeEllipse(ctx,'#f5a9ce',56,80,8,3);
      foeCrown(ctx,52,exposed?12:33,accent);break;
    }
    case 1:{
      foeBox(ctx,accent,13,87,29,12);foeBox(ctx,accent,61,87,29,12);
      foeBox(ctx,primary,18,19,65,69,10);ctx.strokeStyle='#9D6329';ctx.lineWidth=2.5;
      for(let i=1;i<5;i++){ctx.beginPath();ctx.moveTo(18+i*13,24);ctx.lineTo(18+i*13,84);ctx.stroke();ctx.beginPath();ctx.moveTo(23,19+i*13);ctx.lineTo(78,19+i*13);ctx.stroke();}
      foeBox(ctx,primary,0,48,23,16);foeBox(ctx,primary,79,48,21,16);foeEllipse(ctx,secondary,50,21,24,10);foeEllipse(ctx,accent,54,10,7);
      foeEye(ctx,38,43,7,enemy.facing);foeEye(ctx,64,43,7,enemy.facing);foePath(ctx,'#552832',[[42,61],[60,61],[52,70]]);foeEllipse(ctx,exposed?'#fff7a0':secondary,52,77,8);break;
    }
    case 2:{
      ctx.lineWidth=9;
      for(let i=0;i<8;i++){const side=i%2?1:-1,yy=31+Math.floor(i/2)*14,endY=yy+Math.sin(t*3+i)*10;foePath(ctx,i%3?primary:accent,[[50+side*12,yy],[50+side*30,yy-8],[50+side*43,endY]],true);foeEllipse(ctx,secondary,50+side*43,endY,7,5);}
      foeBox(ctx,primary,34,22,34,65,12);foeBox(ctx,secondary,39,49,16,18);ctx.strokeStyle='#f9e4ae';ctx.lineWidth=1.5;ctx.setLineDash([3,3]);ctx.strokeRect(39,49,16,18);ctx.setLineDash([]);
      foeBox(ctx,accent,30,84,17,14);foeBox(ctx,primary,56,84,17,14);foeEye(ctx,42,33,7,enemy.facing);foeEye(ctx,62,36,6,enemy.facing);foePath(ctx,'#263456',[[43,66],[52,71],[60,65]],true);
      if(!exposed)foeBox(ctx,secondary,34,12,34,10);break;
    }
    case 3:{
      ctx.lineWidth=2.5;for(let i=0;i<12;i++){const a=i*Math.PI/6;foePath(ctx,primary,[[50+Math.cos(a)*27,48+Math.sin(a)*29],[50+Math.cos(a)*45,48+Math.sin(a)*39]],true);}
      foePath(ctx,secondary,[[36,77],[30,85],[40,90],[28,96]],true);foePath(ctx,secondary,[[62,77],[72,85],[61,90],[75,96]],true);
      foeEllipse(ctx,primary,50,46,32,34);foeEllipse(ctx,'#fff2ce',50,46,25,27);ctx.strokeStyle=secondary;ctx.lineWidth=4;
      const angle=exposed?-Math.PI/2:t*.7;foePath(ctx,secondary,[[50,46],[50+Math.cos(angle)*18,46+Math.sin(angle)*18]],true);foePath(ctx,primary,[[50,46],[50+(exposed?0:12),27]],true);
      foeEllipse(ctx,primary,27,13,12,8);foeEllipse(ctx,primary,73,13,12,8);foeBox(ctx,exposed?'#fff49c':accent,43,0,14,9);foeEye(ctx,39,54,4);foeEye(ctx,61,54,4);foeBox(ctx,secondary,45,67,11,3);break;
    }
    case 4:{
      for(const [x,y,r] of [[25,53,22],[49,39,28],[75,52,23],[50,65,32]])foeEllipse(ctx,primary,x,y,r);
      foeBox(ctx,accent,0,60,19,26);foeBox(ctx,accent,81,60,19,26);foeEllipse(ctx,secondary,9,73,7);foeEllipse(ctx,secondary,91,73,7);
      foeBox(ctx,accent,26,46,23,13);foeBox(ctx,accent,53,46,23,13);foeBox(ctx,accent,45,49,13,4);foePath(ctx,secondary,[[31,49],[40,49],[31,56]]);foePath(ctx,secondary,[[58,49],[67,49],[58,56]]);
      foePath(ctx,secondary,[[54,3],[38,25],[52,23],[43,39],[68,16],[54,17]]);foePath(ctx,'#752957',[[40,68],[51,75],[63,67]],true);break;
    }
    case 5:{
      ctx.lineWidth=5;for(let i=0;i<4;i++){const x=18+i*22;foePath(ctx,accent,[[x,73],[x-4,86],[x+5,96],[x-5,96]],true);}
      foeBox(ctx,primary,10,39,80,39);foeBox(ctx,secondary,8,24,24,50);foeBox(ctx,primary,39,13,24,57);foeBox(ctx,secondary,70,32,24,42);
      for(let i=0;i<6;i++)foeBox(ctx,i%2?primary:secondary,9+i*15,29+(i<2?-10:0),8,10,0);
      foePath(ctx,accent,[[52,13],[52,0],[76,4],[52,9]],false);ctx.strokeStyle='#2d5039';ctx.lineWidth=2;for(let y=43;y<73;y+=11)foePath(ctx,'#708465',[[12,y],[89,y]],true);
      foeEye(ctx,32,43,6);foeEye(ctx,73,44,6);foeBox(ctx,'#463a39',38,56,29,21,8);foeBox(ctx,accent,42,68,22,9,1);break;
    }
    case 6:{
      ctx.lineWidth=7;foePath(ctx,primary,[[71,72],[94,74],[93,94],[77,94],[79,83]],true);
      for(const side of [-1,1]){const xx=50+side*18;foePath(ctx,secondary,[[xx,62],[50+side*47,17],[50+side*45,65],[xx,83]]);ctx.lineWidth=2;foePath(ctx,accent,[[xx,62],[50+side*47,17],[50+side*35,64],[xx,83]],true);}
      foeEllipse(ctx,primary,50,66,27,21);for(let i=0;i<3;i++){foeEllipse(ctx,primary,35+i*16,46-(i%2)*11,12,15);foeEye(ctx,34+i*16,44-(i%2)*11,5,enemy.facing);}
      foeEllipse(ctx,'#ed657b',50,50,5);foePath(ctx,accent,[[32,68],[51,75],[69,67]],true);foeCrown(ctx,50,19,accent);break;
    }
    case 7:{
      for(let i=0;i<6;i++){const side=i%2?1:-1,y=42+Math.floor(i/2)*15;ctx.lineWidth=9;foePath(ctx,i%3?primary:secondary,[[50+side*20,y],[50+side*40,y+Math.sin(t*2+i)*6]],true);foeEllipse(ctx,secondary,50+side*40,y,7);}
      foeEllipse(ctx,primary,50,65,30,32);foeEllipse(ctx,secondary,50,70,19,20);
      for(let i=0;i<3;i++){foeEllipse(ctx,primary,27+i*23,34-(i%2)*10,17,18);foeEye(ctx,23+i*23,32-(i%2)*10,5);foeEye(ctx,32+i*23,32-(i%2)*10,5);}
      for(let i=0;i<8;i++){const a=i*2.4;foeEllipse(ctx,'#fff0ae',50+Math.cos(a)*14,70+Math.sin(a)*15,1.8);}
      foeCrown(ctx,50,12,'#efc762');for(let i=0;i<7;i++)foeEllipse(ctx,['#ff657c','#ffad5d','#ffe777','#8deb9e','#67dbff','#8b99ff','#dc8cff'][i],33+i*6,8,2.4);
      break;
    }
  }
  ctx.shadowBlur=0;
  if(!large&&!globalThis.braviosExportEnemies){
    // Patterns, facial marks and accessories distinguish repeated palette/shape combinations.
    ctx.strokeStyle=accent;ctx.lineWidth=3;
    if(enemy.face_pattern){foePath(ctx,accent,[[25,74],[34,81],[43,74]],true);}
    else{for(let i=0;i<3;i++)foeEllipse(ctx,accent,25+i*9,81,2.5);}
    if(enemy.accessory%2)foeBox(ctx,secondary,27,6,43,7);else if(enemy.accessory)foeEllipse(ctx,accent,79,28,6);
  }
  if(exposed){ctx.strokeStyle='#fff6a5';ctx.lineWidth=3;ctx.setLineDash([4,4]);ctx.beginPath();ctx.ellipse(50,49,57,60,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  ctx.restore();
  }
  if(sprite&&!large&&!enemy.defeated){
    ctx.save();ctx.translate(enemy.x,enemy.y);ctx.scale(enemy.w/100,enemy.h/100);
  if(!large){
    // Patterns, facial marks and accessories distinguish repeated palette/shape combinations.
    ctx.strokeStyle=accent;ctx.lineWidth=3;
    if(enemy.face_pattern){foePath(ctx,accent,[[25,74],[34,81],[43,74]],true);}
    else{for(let i=0;i<3;i++)foeEllipse(ctx,accent,25+i*9,81,2.5);}
    if(enemy.accessory%2)foeBox(ctx,secondary,27,6,43,7);else if(enemy.accessory)foeEllipse(ctx,accent,79,28,6);
  }
    ctx.restore();
  }
  if(large&&!ghost&&!enemy.defeated&&!globalThis.braviosExportEnemies){
    ctx.save();ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff6df';ctx.strokeStyle='#211744';ctx.lineWidth=4;
    ctx.strokeText(info.name.split(' the ')[0],enemy.x+enemy.w/2,enemy.y-22);ctx.fillText(info.name.split(' the ')[0],enemy.x+enemy.w/2,enemy.y-22);
    ctx.fillStyle='#251d49';ctx.fillRect(enemy.x,enemy.y-14,enemy.w,5);ctx.fillStyle=exposed?'#fff0a3':info.primary_color;ctx.fillRect(enemy.x,enemy.y-14,enemy.w*enemy.hp/enemy.maxHp,5);
    if(enemy.phase==='warning'){ctx.fillStyle='#ffe881';ctx.font='bold 24px sans-serif';ctx.fillText('!',enemy.x+enemy.w/2,enemy.y-38);}
    ctx.restore();
  }
}
export function drawWonderArena(ctx,game,time=0,reducedMotion=false) {
  const boss=game.enemies.find(e=>e.kind==='wonder'&&e.boss);if(!boss)return;
  ctx.save();
  if(boss.activated&&!boss.defeated){
    for(const pad of wonderBossPads(boss)){
      ctx.fillStyle=pad.active?'#74eeef':'#667399';ctx.beginPath();ctx.roundRect(pad.x,pad.y,pad.w,pad.h,4);ctx.fill();
      ctx.font='bold 15px sans-serif';ctx.textAlign='center';ctx.fillStyle='#fff7df';
      const labels=boss.wonderType===1?['▰','▰']:boss.wonderType===2?['1','2']:boss.wonderType===4?['←','→']:boss.wonderType===6?['◇','◇','◇']:['★','★'];
      ctx.fillText(labels[pad.index],pad.x+pad.w/2,pad.y-6);
      if(boss.wonderType===6&&pad.active)foeEllipse(ctx,'#ff6579',pad.x+pad.w/2,pad.y-29,5);
    }
    // Arena props make the environmental weakness recognizable without reading a long hint.
    const propX=boss.arenaLeft+88,ground=18*32;
    if(boss.wonderType===1){foeBox(ctx,'#f9e8b5',propX-12,ground-38,54,9,4);foeBox(ctx,'#ffe375',propX,ground-56,32,18,3);}
    if(boss.wonderType===2){
      foeBox(ctx,'#b4e5e4',propX-10,ground-76,58,60,7);foeEllipse(ctx,'#40547d',propX+19,ground-43,19);foeEllipse(ctx,'#91def0',propX+19,ground-43,14);
      for(let i=0;i<3;i++){const a=(reducedMotion?0:time*3)+i*2;foeEllipse(ctx,'#f5ffff',propX+19+Math.cos(a)*9,ground-43+Math.sin(a)*9,4);}
      foeEllipse(ctx,'#ef748d',propX+2,ground-67,3);foeEllipse(ctx,'#65ab79',propX+34,ground-67,3);
    }
    if(boss.wonderType===3){ctx.fillStyle='#fff3ad';ctx.font='bold 18px sans-serif';ctx.textAlign='center';ctx.fillText('12',boss.x+boss.w/2,boss.y-45);}
    if(boss.wonderType===4){ctx.fillStyle='#fff3ad';ctx.font='bold 18px sans-serif';ctx.textAlign='left';ctx.fillText(['← → ← →','✓ → ← →','✓ ✓ ← →','✓ ✓ ✓ →'][Math.min(3,boss.puzzleProgress)],propX-60,ground-45);}
    if(boss.wonderType===6)for(const pad of wonderBossPads(boss)){
      ctx.strokeStyle='#b6c9f2';ctx.lineWidth=3;ctx.strokeRect(pad.x+6,pad.y-58,28,34);foeEye(ctx,pad.x+14,pad.y-45,3);foeEye(ctx,pad.x+26,pad.y-45,3);if(pad.active)foeEllipse(ctx,'#ff6579',pad.x+20,pad.y-36,4);
    }
    if(boss.wonderType===7){ctx.fillStyle='#fff3ad';ctx.font='bold 17px sans-serif';ctx.textAlign='left';const gem=boss.maxHp-boss.hp;ctx.fillText(`${gem+1}/7 · ${['Slijm','Wafel','Sok','Klok','Muziek','Kasteel','Spiegel'][gem]}`,propX-60,ground-48);}
    if(boss.wonderType===6){for(const offset of [-135,135])drawWonderFoe(ctx,{...boss,x:boss.x+offset,phase:'clone'},time,reducedMotion,{ghost:true});}
    if(boss.phase==='warning'){
      const x=boss.targetX??boss.x;
      ctx.strokeStyle='#fff38b';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.strokeRect(x,18*32-7,64,7);ctx.setLineDash([]);
    }
  }
  for(const enemy of game.enemies)if(enemy.kind==='wonder'&&enemy.defeated&&(enemy.exitTime>0||enemy.boss))drawWonderFoe(ctx,enemy,time,reducedMotion);
  ctx.restore();
}
export function drawWonderHazard(ctx,hazard,time=0) {
  ctx.save();ctx.fillStyle=hazard.effect==='slow'?'#e3b64c':WONDER_FOES[hazard.wonderType].secondary_color;ctx.strokeStyle='#fff2b9';ctx.lineWidth=2;
  if(hazard.wonderType===4||(hazard.wonderType===7&&hazard.h>50))foePath(ctx,ctx.fillStyle,[[hazard.x+15,hazard.y],[hazard.x,hazard.y+hazard.h*.6],[hazard.x+12,hazard.y+hazard.h*.5],[hazard.x+4,hazard.y+hazard.h],[hazard.x+hazard.w,hazard.y+hazard.h*.35],[hazard.x+16,hazard.y+hazard.h*.4]]);
  else{ctx.beginPath();ctx.roundRect(hazard.x,hazard.y,hazard.w,hazard.h,Math.min(6,hazard.h/2));ctx.fill();ctx.stroke();}
  ctx.restore();
}
