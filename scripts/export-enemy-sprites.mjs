// Optional artwork maintenance tool: npm install --no-save playwright; Chrome must be installed.
// Re-exports the original vector artwork. It intentionally overwrites catalog PNGs.
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright';
const root=fileURLToPath(new URL('../public_html/',import.meta.url));
const server=createServer(async(req,res)=>{try{const filename=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!filename.startsWith(root)){res.writeHead(403);res.end();return;}res.setHeader('Content-Type',filename.endsWith('.mjs')?'text/javascript':filename.endsWith('.json')?'application/json':'text/html');res.end(await readFile(filename));}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
let browser;
try {
 browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/tests/monsters.html`);
 const {ENEMY_CATALOG}=await import('../public_html/enemies/catalog.mjs');
 for(const config of ENEMY_CATALOG){
  const animations=await page.evaluate(async c=>{
   globalThis.braviosExportEnemies=true;
   const {drawEnemyBody}=await import('/art.mjs');
   const result={};
   let states=['idle','walk'];
   if(c.kind==='wonder')states=c.group==='bosses'?['idle','warning','attack','puzzle','exposed','rest','defeated','clone']:['palette-0','palette-1','palette-2','defeated'];
   if(c.kind==='robot')states.push(...Array.from({length:11},(_,i)=>`charge-${i}`),'jump');
   if(c.kind==='frog')states.push('tongue','crawl');
   if(c.kind==='turtle')states.push('shell');
   if(['skeleton','bonefish'].includes(c.kind))states.push('fallen');
   if(c.kind==='beetle')states.push('folded');
   if(c.kind==='bomb')states.push('lit');
   if(c.kind==='plant')states.push('bite');
   if(c.kind==='crusher')states.push('waiting','falling','rest','rising');
   if(c.kind==='centipede')states.push('look','angry');
   const sea=['whale','jellyfish','bonefish','squid','seaweed','geyser','flatfish','moray','seastar','crab'].includes(c.kind);
   if(['whale','geyser','flatfish','moray'].includes(c.kind))states.push('active');
   if(sea)states=[...states,...states.map(s=>s+'-night')];
   if(c.kind==='wonder'&&c.group==='game')states.push('idle');
   for(const state of states){
    const night=state.endsWith('-night'),phase=state.replace('-night','');
    let [w,h]=c.size;if(phase==='shell')h=18;if(phase==='folded')h=14;if(phase==='fallen'&&c.kind==='skeleton')h=12;
    const bounds=[-24,-24,w+48,h+48],frameWidth=Math.ceil(bounds[2]*2),frameHeight=Math.ceil(bounds[3]*2),frames=8,fps=10;
    const canvas=document.createElement('canvas');canvas.width=frameWidth*frames;canvas.height=frameHeight;const ctx=canvas.getContext('2d');
    for(let frame=0;frame<frames;frame++){
     const time=frame/fps;
     const e={kind:c.kind,tileId:c.tileIds[0],catalogId:c.key,variant:c.variant,wonderType:c.wonderType,boss:c.group==='bosses',palette_id:phase.startsWith('palette-')?+phase.slice(-1):0,body_variant:0,phase,phaseTime:phase.startsWith('charge-')?Number(phase.slice(7))/10*5:phase==='bite'?1.5:time,facing:1,x:0,y:0,w,h,vx:1,vy:0,alive:true,hp:c.combat.health,maxHp:c.combat.health,hitCooldown:0,fuse:phase==='lit'?1:0,frozen:0,active:phase==='active',extension:phase==='active'?80:.8,age:time,stroke:time,glowing:true,fry:[],defeated:phase==='defeated',exitTime:1.8,escape:false};
     ctx.save();ctx.translate(frame*frameWidth,0);ctx.scale(2,2);ctx.translate(-bounds[0],-bounds[1]);drawEnemyBody(ctx,e,time,1,false,night?'underwater-night':'grass');ctx.restore();
    }
    result[state]={image:`images/${state}.png`,frameWidth,frameHeight,frames,fps,bodyWidth:w,bodyHeight:h,bounds,data:canvas.toDataURL('image/png').split(',')[1]};
   }
   return result;
  },config);
  const file=path.join(root,'enemies',config.group,config.id,'enemy.json');const json=JSON.parse(await readFile(file));json.animations={};
  for(const [state,{data,...a}]of Object.entries(animations)){await writeFile(path.join(path.dirname(file),a.image),Buffer.from(data,'base64'));json.animations[state]=a;}
  await writeFile(file,JSON.stringify(json,null,2)+'\n');
  console.log(`${config.key}: ${Object.keys(animations).length} animaties`);
 }
} finally {await browser?.close();server.close();}
