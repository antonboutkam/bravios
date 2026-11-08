// Original Bravios artwork, drawn once per pose at double resolution.
// Coordinates stay in the existing 32 px artwork box; gameplay owns collision.
const monsterFrames = new Map();
const monsterInk = '#343149';
function monsterOval(c, color, x, y, rx, ry, outline = true) {
  c.beginPath(); c.ellipse(x,y,rx,ry,0,0,Math.PI*2); c.fillStyle=color; c.fill();
  if(outline){c.strokeStyle=monsterInk;c.lineWidth=1.1;c.stroke();}
}
function monsterBox(c,color,x,y,w,h,r=2) {
  c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=color;c.fill();c.strokeStyle=monsterInk;c.lineWidth=1.1;c.stroke();
}
function monsterPath(c,color,points,line=false,width=1.1) {
  c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
  c.lineWidth=width;c.strokeStyle=line?color:monsterInk;
  if(!line){c.closePath();c.fillStyle=color;c.fill();}c.stroke();
}
function monsterEye(c,x,y,rx=3,ry=4,look=1) {
  monsterOval(c,'#fff6dd',x,y,rx,ry);
  monsterOval(c,monsterInk,x+look*.85,y+.5,rx*.44,ry*.64,false);
  monsterOval(c,'#ffffff',x+look*.85-.35,y-.65,.55,.7,false);
}
function monsterFeet(c,step,color='#995d42') {
  monsterOval(c,color,8-step*1.6,29-Math.max(0,step),5,2.5);
  monsterOval(c,color,24+step*1.6,29-Math.max(0,-step),5,2.5);
  monsterPath(c,'#ffdfad',[[5-step*1.6,28],[8-step*1.6,28]],true,.7);
}

// Finite poses also keep the cache independent of draw order and elapsed runtime.
export function monsterPose(kind, {time=0,phase='',charge=0,fuse=0,variant='',moving=true}={}) {
  const frame=moving?((Math.floor(time*10)%8)+8)%8:0;
  return {kind,frame,phase:phase==='shell'||phase==='fallen'?phase:'',
    charge:kind==='robot'?Math.round(Math.max(0,Math.min(1,charge))*10):0,
    lit:kind==='bomb'&&fuse>0,
    flash:kind==='bomb'&&fuse>0?Math.floor(time*(fuse<1?12:5))%2:0,
    mouth:kind==='plant'?Math.floor(time/1.5)%2:0,variant};
}
export function drawMonsterArt(ctx,kind,x,y,options={}) {
  const pose=monsterPose(kind,options), key=JSON.stringify(pose);
  let surface=monsterFrames.get(key);
  if(!surface&&(typeof OffscreenCanvas!=='undefined'||typeof document!=='undefined')) {
    surface=typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(96,96):document.createElement('canvas');
    surface.width=96;surface.height=96;
    const c=surface.getContext('2d');c.scale(2,2);c.translate(8,8);paintMonsterArt(c,pose);
    // At most 18 MiB of RGBA pixels, including every charge/animation combination.
    if(monsterFrames.size>=512)monsterFrames.clear();
    monsterFrames.set(key,surface);
  }
  ctx.save();ctx.translate(x+16,y);ctx.scale(options.facing<0?-1:1,1);ctx.translate(-16,0);
  ctx.imageSmoothingEnabled=true;
  if(surface)ctx.drawImage(surface,-8,-8,48,48);else paintMonsterArt(ctx,pose);
  ctx.restore();
}
function paintMonsterArt(c,p) {
  c.save();c.lineJoin='round';c.lineCap='round';
  const step=Math.sin(p.frame*Math.PI/4), bob=Math.abs(step)*.65;
  if(p.kind==='walker') {
    monsterFeet(c,step,'#75434b');
    c.translate(0,-bob);
    monsterOval(c,'#d9955f',16,20,11,9);
    monsterOval(c,'#ffe1a2',16,23,7,5,false);
    c.beginPath();c.moveTo(2,17);c.bezierCurveTo(3,4,11,1,17,3);c.bezierCurveTo(25,2,30,9,31,17);c.quadraticCurveTo(16,23,2,17);c.fillStyle='#b75058';c.fill();c.strokeStyle=monsterInk;c.lineWidth=1.2;c.stroke();
    monsterOval(c,'#f6c387',9,10,3.5,2.6,false);monsterOval(c,'#f6c387',23,9,3.8,3,false);monsterOval(c,'#fce2a9',16,5,2,1.4,false);
    monsterEye(c,11,20,3.2,4);monsterEye(c,22,20,3.2,4);
    monsterPath(c,monsterInk,[[7,15],[13,17]],true,1.5);monsterPath(c,monsterInk,[[19,17],[25,15]],true,1.5);
    monsterPath(c,'#854650',[[13,26],[17,27],[21,25]],true);
  } else if(p.kind==='robot') {
    const red=p.variant==='angry', metal=red?'#db796b':'#87b6c4', light=red?'#ffc49a':'#d9edf0';
    monsterFeet(c,step,'#47536b');c.translate(0,-bob);
    monsterPath(c,'#627388',[[16,6],[16,1]],true,2);
    monsterOval(c,p.charge>=9?'#ffca65':'#80e1bd',16,1,2.7,2);
    monsterBox(c,metal,4,17,24,11,3);monsterBox(c,metal,3,5,27,15,4);
    monsterPath(c,light,[[7,8],[25,8]],true,1.5);
    monsterBox(c,'#283c50',7,10,20,7,2);
    for(const xx of [12,22])monsterOval(c,p.charge>=9?'#ffe58a':'#a3f8d5',xx,13.5,2,2,false);
    if(red){monsterPath(c,'#bc535b',[[8,10],[14,12]],true,2);monsterPath(c,'#bc535b',[[19,12],[25,10]],true,2);}
    monsterBox(c,'#3f526b',10,21,13,4,1);monsterBox(c,'#ffcc70',11,22,Math.max(1,p.charge),2,.5);
    for(const side of [-1,1]){const xx=16+side*15;monsterOval(c,light,xx,22+step*side,2.5,3.5);monsterOval(c,'#42516a',xx,22+step*side,1,1,false);}
    for(const xx of [6,27])monsterOval(c,light,xx,8,.7,.7,false);
  } else if(p.kind==='frog') {
    const red=p.variant==='red', green=red?'#d9736c':'#76b75d', dark=red?'#a84758':'#3d7855';
    monsterFeet(c,step,dark);monsterOval(c,dark,8,23,6,5);monsterOval(c,green,18,20-bob,13,9);
    monsterOval(c,red?'#ffd39d':'#d6e797',21,23-bob,9,4.5,false);
    for(const xx of [14,25]){monsterOval(c,green,xx,10-bob,5.5,6);monsterEye(c,xx+1,10-bob,3.5,4);}
    monsterPath(c,dark,[[18,21-bob],[25,22-bob],[30,19-bob]],true,1.2);
    monsterOval(c,red?'#fca88a':'#b2db79',9,18,2,1.3,false);monsterOval(c,dark,27,18-bob,.7,.6,false);
    monsterPath(c,dark,[[18,24],[17+step,29],[22+step,29]],true,2);
  } else if(['turtle','skeleton','spiky','hammer'].includes(p.kind)) {
    const bone=p.kind==='skeleton',spiky=p.kind==='spiky',shell=bone?'#c8c6b7':spiky?'#ad6284':'#55a080', skin=bone?'#f4e9cd':spiky?'#edaa72':'#e4c27a';
    if(p.phase==='fallen'){
      for(const [xx,yy] of [[7,27],[16,29],[23,25]]){monsterPath(c,'#f4e9cd',[[xx-3,yy],[xx+3,yy]],true,3);monsterOval(c,'#f4e9cd',xx-3,yy,1.6,2);}
      monsterOval(c,skin,28,26,5,4);monsterOval(c,monsterInk,29,25,1.8,1.8,false);
    }else{
      const tucked=p.phase==='shell',sy=tucked?23:20;
      if(!tucked)monsterFeet(c,step,bone?'#d0ccb6':'#a77950');
      monsterOval(c,'#f2d79a',14,sy+6,13,3);
      monsterOval(c,shell,14,sy-1,12,10);
      monsterPath(c,bone?'#8f9996':spiky?'#763f68':'#276c61',[[6,sy-5],[13,sy-8],[21,sy-4],[21,sy+2],[14,sy+6],[7,sy+2],[6,sy-5],[14,sy-1],[21,sy-4]],true,1.2);
      monsterPath(c,bone?'#fff8db':'#bee4a0',[[6,sy-4],[9,sy-7],[13,sy-8]],true,1.2);
      if(spiky)for(const xx of [5,13,21])monsterPath(c,'#fff0c4',[[xx-3,sy-7],[xx,sy-16],[xx+4,sy-7]]);
      if(tucked){monsterOval(c,'#345a50',24,26,3,2);}
      else{
        monsterOval(c,skin,26,15-bob,6,8);monsterOval(c,skin,28,19-bob,5,3);
        if(bone){monsterOval(c,monsterInk,28,12-bob,2.6,3,false);monsterPath(c,'#87958b',[[23,20],[26,21],[29,20]],true);}
        else{monsterEye(c,28,12-bob,2.8,3.5);monsterPath(c,'#996444',[[29,20-bob],[32,19-bob]],true);}
        if(spiky)monsterPath(c,'#75405c',[[24,8-bob],[30,10-bob]],true,2);
      }
      if(p.kind==='hammer'&&!tucked){monsterPath(c,'#a86c44',[[16,17],[19,5]],true,3);monsterBox(c,'#788ca7',12,1,14,7,1.5);monsterPath(c,'#dce6ee',[[14,3],[23,3]],true,1);}
    }
  } else if(p.kind==='dragon') {
    monsterPath(c,'#8264b4',[[12,23],[2,26],[0,20],[5,23],[9,17]]);
    monsterFeet(c,step,'#695186');
    monsterOval(c,'#9871c9',17,22,11,7);monsterOval(c,'#e9c6cb',20,24,6,4,false);
    const tip=5+step*4;
    monsterPath(c,'#af84dc',[[13,21],[3,tip],[2,19],[6,17],[8,23]]);
    monsterPath(c,'#f3b7d7',[[12,20],[4,tip+4],[6,17]],false,.7);
    monsterOval(c,'#a783d5',25,13,6,8);monsterOval(c,'#e8c398',28,18,5,3.5);
    monsterPath(c,'#ffe2a6',[[22,7],[23,1],[26,7]]);monsterEye(c,28,11,2.6,3.5);
    monsterOval(c,monsterInk,31,17,.6,.6,false);monsterPath(c,'#76507e',[[26,20],[31,21]],true);
    for(const xx of [9,14,19])monsterPath(c,'#f4ad82',[[xx,17],[xx+2,13],[xx+4,17]]);
  } else if(p.kind==='plant') {
    monsterPath(c,'#3c7958',[[16,31],[16,20],[8,14]],true,4);monsterPath(c,'#3c7958',[[16,23],[25,14]],true,3);
    monsterPath(c,'#8cc776',[[15,28],[5,22],[5,28],[15,31]]);monsterPath(c,'#8cc776',[[17,27],[28,22],[27,29],[17,31]]);
    for(const [i,xx] of [8,25].entries()){
      const open=p.mouth===i;
      monsterOval(c,i?'#ce5977':'#e17a68',xx,10,7.5,8);
      monsterOval(c,'#ffcf9d',xx-2,5,2,1.3,false);
      monsterOval(c,'#56314d',xx+1,14,5,open?4:1.5);
      for(const dx of [-2,2])monsterPath(c,'#fff1ce',[[xx+dx-1,12],[xx+dx,open?15:13],[xx+dx+1,12]],false,.5);
      monsterEye(c,xx+2,8,2.6,3);
    }
  } else if(p.kind==='bomb') {
    monsterFeet(c,step,'#d89b53');
    monsterPath(c,'#a98560',[[16,10],[16,5],[20,2]],true,2);
    monsterOval(c,p.flash?'#d96465':'#4f6985',16,20-bob,12,10.5);
    monsterOval(c,p.flash?'#ffb392':'#a2bed2',10,15-bob,3,2,false);
    monsterBox(c,'#b9a67d',12,8-bob,8,3,1);
    monsterEye(c,19,19-bob,2.5,3.5);monsterEye(c,26,19-bob,2,3);
    monsterPath(c,monsterInk,[[20,25-bob],[25,25-bob]],true);
    if(p.lit){monsterPath(c,'#ffd06e',[[20,-2],[21,1],[25,0],[22,3],[23,6],[20,4],[17,5],[18,2],[16,0],[19,1]]);monsterOval(c,'#fff5c9',20,2,1.5,1.5,false);}
  }
  c.restore();
}
