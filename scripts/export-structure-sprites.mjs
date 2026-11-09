// Optional maintenance tool. Replaces structure PNGs with the original game's artwork.
import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
import {prepareStructures} from './prepare-structures.mjs';
const root=fileURLToPath(new URL('../public_html/',import.meta.url));
const server=createServer(async(req,res)=>{
 try{if(req.url==='/__export'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Structures</title>');return;}
 const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!filename.startsWith(root)){res.writeHead(403);res.end();return;}
 res.setHeader('Content-Type',filename.endsWith('.mjs')?'text/javascript':filename.endsWith('.png')?'image/png':'application/json');res.end(await readFile(filename));
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let browser;
try{
 browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/__export`);
 await page.evaluate(async()=>{globalThis.braviosExportStructures=true;await (await import('/engine/look.mjs')).loadLook();});
 const {STRUCTURE_CATALOG}=await import('../public_html/engine/structures/catalog.mjs');
 for(const c of STRUCTURE_CATALOG){
  if(c.tileIds.length&&c.tileIds.every(id=>id>101))continue;
  const visuals=await page.evaluate(async c=>{
   const {drawTile,drawVine,drawDonut,drawChainBall}=await import('/engine/art.mjs');
   const {drawFirebar}=await import('/engine/firebars.mjs');
   const {drawWonderMagic}=await import('/engine/wonder-magic.mjs');
   const result={},themes=['grass','sunset','night','castle','winter','moon','underwater','underwater-night'];
   const states=c.kind.startsWith('wonder-')?['default']:themes.flatMap(t=>[t,t+'-inside',t+'-editor']);
   if(c.kind==='cave'&&c.settings.locked)states.push(...Array.from({length:9},(_,i)=>'door-'+i));
   if(c.kind==='chain-ball')states.push('ball');
   if(c.kind==='firebar')states.push('anchor','flame');
   if(c.kind==='vine')states.push('rope','anchor','tip');
   if(c.kind==='donut')states.push('armed');
   if(c.kind==='belt')states.push('platform','axle-running','axle-rest');
   for(const state of states){
    const theme=themes.find(t=>state===t||state===t+'-inside'||state===t+'-editor')||'grass',inside=state.endsWith('-inside'),icon=state.endsWith('-editor');
    const bounds=c.kind==='vine'&&state.startsWith('grass')?[-8,-8,48,48]:[-4,-12,40,48],frameWidth=bounds[2]*3,frameHeight=bounds[3]*3;
    const frames=c.kind==='lava'?8:1,fps=frames>1?6:0,canvas=document.createElement('canvas');canvas.width=frameWidth*frames;canvas.height=frameHeight;const ctx=canvas.getContext('2d');
    for(let frame=0;frame<frames;frame++){
     const time=frames>1?frame/fps:0;
     ctx.save();ctx.translate(frame*frameWidth,0);ctx.scale(3,3);ctx.translate(-bounds[0],-bounds[1]);
     if(c.kind.startsWith('wonder-')){
      const kind=c.kind.slice(7);const o={kind,x:0,y:0,w:32,h:32,active:true,used:false};drawWonderMagic(ctx,{time:0,wonderland:{objects:[o],locked:false}},true);
     }else if(state==='ball')drawChainBall(ctx,{id:c.tileIds[0],x:1,y:1,w:30,h:30});
     else if(c.kind==='firebar'&&['anchor','flame'].includes(state)){
      if(state==='anchor'){ctx.fillStyle='#3a3442';ctx.strokeStyle='#b9a18c';ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(5,5,22,22,4);ctx.fill();ctx.stroke();for(const x of [9,23])for(const y of [9,23]){ctx.fillStyle='#dac6a0';ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#ffcf78';ctx.beginPath();ctx.arc(16,16,4,0,Math.PI*2);ctx.fill();}
      else{for(const [color,x,y,rx,ry]of [['#ff9c3228',16,16,12,12],['#e85328',16,16,9,9],['#ffd565',15,15,5,6],['#fff3c3',14,14,2.5,3.5]]){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}}
     }else if(c.kind==='vine'&&['rope','anchor','tip'].includes(state)){
      if(state==='anchor'){ctx.fillStyle='#a57442';ctx.fillRect(6,-5,20,7);}
      else if(state==='tip'){ctx.fillStyle='#d6bb7e';ctx.beginPath();ctx.arc(16,16,4,0,Math.PI*2);ctx.fill();}
      else{ctx.lineCap='round';ctx.strokeStyle='#354d30';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(16,32);ctx.stroke();ctx.strokeStyle='#99be55';ctx.lineWidth=2;ctx.stroke();for(const [x,y,color]of [[21,12,'#b1cc63'],[11,30,'#77ad47']]){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,8,3.5,x>16?-.6:.6,0,Math.PI*2);ctx.fill();}}
     }
     else if(state==='armed')drawDonut(ctx,0,0,32,2,0,{bodyOnly:true});
     else if(state==='platform'){ctx.fillStyle='#d88830';ctx.fillRect(4,0,24,32);ctx.fillStyle='#fff0bb';ctx.fillRect(0,0,32,5);ctx.strokeStyle='#704b2f';ctx.lineWidth=2;ctx.strokeRect(4,5,24,27);}
     else if(state.startsWith('axle-')){ctx.fillStyle='#e6ab42';ctx.beginPath();ctx.arc(16,16,10,0,Math.PI*2);ctx.fill();ctx.fillStyle=state==='axle-running'?'#397a63':'#a24f45';ctx.beginPath();ctx.arc(16,16,4,0,Math.PI*2);ctx.fill();}
     else drawTile(ctx,c.tileIds[0],0,0,32,theme,{top:!inside,icon:(icon||['chain-ball','firebar','vine'].includes(c.kind))&&c.kind!=='question',time,revealContents:icon&&c.kind!=='question',doorOpen:state.startsWith('door-')?Number(state.slice(5))/8:0});
     ctx.restore();
    }
    result[state]={image:`images/${state}.png`,frameWidth,frameHeight,frames,fps,bounds,data:canvas.toDataURL('image/png').split(',')[1]};
   }
   result.default=result[c.kind.startsWith('wonder-')?'default':'grass'];return result;
  },c);
  const filename=path.join(root,'gameplay',c.category,c.id,'structure.json'),json=JSON.parse(await readFile(filename));json.visuals={};if(c.kind==='pipe')json.imageOpening=c.pipe.opening;const unique=new Map();
  for(const [state,{data,...v}]of Object.entries(visuals)){
   if(unique.has(data))v.image=unique.get(data);else{unique.set(data,v.image);await writeFile(path.join(path.dirname(filename),v.image),Buffer.from(data,'base64'));}
   json.visuals[state]=v;
  }
  await writeFile(filename,JSON.stringify(json,null,2)+'\n');console.log(`${c.key}: ${unique.size} PNG's`);
 }
 await prepareStructures();
}finally{await browser?.close();server.close();}
