import { library } from '../platformer3d/vendor/babylon.mjs';
import { renderSize3D, RenderBudget3D } from '../platformer3d/render-budget.mjs';
import { characters3D } from '../platformer3d/access.mjs';
import { assetURL } from '../../paths.mjs';
const {Engine,Scene,Vector3,Color3,Color4,ArcRotateCamera,HemisphericLight,DirectionalLight,MeshBuilder,TransformNode,StandardMaterial,LoadAssetContainerAsync}=library;
const color=n=>Color3.FromInts(n>>16,(n>>8)&255,n&255);
export function createCakeStage(canvas,{engine:providedEngine}={}) {
  let engine=providedEngine;
  try {engine ||= new Engine(canvas,false,{preserveDrawingBuffer:false,loseContextOnDispose:true,powerPreference:'high-performance',adaptToDeviceRatio:false},false);}
  catch {throw new Error('Taartgooien heeft WebGL nodig. Controleer de hardwareversnelling van je browser.');}
  const scene=new Scene(engine);scene.useRightHandedSystem=true;scene.clearColor=new Color4(.82,.93,.96,1);
  scene.skipPointerMovePicking=true;scene.skipPointerDownPicking=true;scene.skipPointerUpPicking=true;
  const camera=new ArcRotateCamera('bakkerij-camera',Math.PI/2,Math.PI/3.5,24,new Vector3(0,.5,0),scene);
  camera.fov=.72;camera.minZ=.1;camera.maxZ=100;
  const sky=new HemisphericLight('daglicht',new Vector3(0,1,0),scene);sky.intensity=.9;sky.groundColor=color(0xb99c7f);
  const sun=new DirectionalLight('zon',new Vector3(-4,-8,-5),scene);sun.intensity=.7;
  const materials=new Map(),containers=new Map(),instances=[],actors=[],cakeMeshes=new Map(),splashMeshes=new Map(),cartCakes=[];
  const scope=new AbortController();let disposed=false,renderCount=0,lastState='';
  const info=engine.getGlInfo?.(),software=/swiftshader|llvmpipe|softpipe|software/i.test(info?.renderer||'');
  const budget=new RenderBudget3D(software);
  function material(hex){if(!materials.has(hex)){const m=new StandardMaterial('bakkerij-'+hex,scene);m.diffuseColor=color(hex);m.specularColor=new Color3(.08,.08,.08);materials.set(hex,m);}return materials.get(hex);}
  function painted(mesh,hex,parent){mesh.material=material(hex);if(parent)mesh.parent=parent;mesh.isPickable=false;return mesh;}
  function box(name,x,y,z,w,h,d,hex,parent){const mesh=painted(MeshBuilder.CreateBox(name,{width:w,height:h,depth:d},scene),hex,parent);mesh.position.set(x,y,z);return mesh;}
  function sphere(name,x,y,z,r,hex,parent){const mesh=painted(MeshBuilder.CreateSphere(name,{diameter:r*2,segments:8},scene),hex,parent);mesh.position.set(x,y,z);return mesh;}
  function cylinder(name,x,y,z,r,h,hex,parent){const mesh=painted(MeshBuilder.CreateCylinder(name,{diameter:r*2,height:h,tessellation:16},scene),hex,parent);mesh.position.set(x,y,z);return mesh;}
  function cake(name,parent){
    const root=new TransformNode(name,scene);root.parent=parent||null;
    cylinder('taartbodem',0,0,0,.23,.11,0xd7a15c,root);cylinder('slagroom',0,.07,0,.22,.08,0xfff6df,root);
    for(let i=0;i<3;i++)sphere('aardbei',Math.cos(i*2.1)*.1,.14,Math.sin(i*2.1)*.1,.055,0xde5555,root);
    return root;
  }
  function cart(side){
    const root=new TransformNode(side<0?'bakkerskar-links':'bakkerskar-rechts',scene);root.position.x=side*8.5;
    box('houten-kar',0,.8,0,1.5,.75,2.1,0xc18c58,root);box('toonbank',0,1.25,0,1.7,.14,2.3,0xffe4ac,root);
    for(const x of [-.67,.67])for(const z of [-.75,.75]){const wheel=cylinder('wiel',x,.38,z,.3,.15,0x4a4e55,root);wheel.rotation.x=Math.PI/2;}
    for(const x of [-.7,.7])for(const z of [-1,1])box('luifel-paal',x,1.85,z,.07,1.35,.07,0xf7e9ce,root);
    for(let i=0;i<8;i++)box('gestreepte-luifel',0,2.6,-1.05+i*.3,2,.17,.3,i%2?0xfff4db:side<0?0xc982aa:0x78aaa0,root);
    const stock=[];
    for(let i=0;i<3;i++){const item=cake('verse-taart',root);item.position.set(0,1.4,-.65+i*.65);stock.push(item);}
    cartCakes.push(stock);
    box('handvat',side*.95,1,0,.5,.1,1.5,0x715b48,root);
  }
  box('grasveld',0,-.25,0,34,.4,24,0x97bf78);
  box('bakkerijplein',0,-.025,0,20,.1,11,0xf1d9ad);
  // Alternating paving, a central stripe, and colored halves make depth and sides readable.
  for(let x=-9;x<=9;x+=2)for(let z=-4;z<=4;z+=2)if((x+z+15)%4===0)box('tegel',x,.031,z,1.94,.012,1.94,0xf7e4bf);
  for(let z=-4.5;z<5;z+=1)box('middenlijn',0,.045,z,.09,.025,.5,0xfffbeb);
  for(const side of [-1,1]){
    cart(side);
    const mark=cylinder('haal-hier-een-taart',side*7.1,.05,0,.7,.025,side<0?0xc3a1e7:0x89c8be);mark.scaling.z=1.3;
    box('achterwand',side*12,1,-6,3,2,2,side<0?0xf4c2ad:0xb4c9d8);
    box('dak',side*12,2.2,-6,3.5,.45,2.7,0x9f7772);
    for(let i=0;i<2;i++)box('bakkerijraam',side*12-.65+i*1.3,1.25,-4.98,.75,.8,.04,0xfff4c4);
  }
  for(const x of [-9,-6,-3,3,6,9]){cylinder('bloempot',x,.22,-6,.3,.45,0xc58c72);sphere('struik',x,.65,-6,.5,0x6c9a65);sphere('bloem',x+.15,.92,-5.9,.13,0xeaaaab);}
  for(const x of [-4,4]){box('bankje',x,.45,6,2,.16,.65,0xb98b62);for(const dx of [-.7,.7])box('bankpoot',x+dx,.2,6,.13,.5,.5,0x675f56);}
  async function prepare(identities){
    for(const [index,identity] of identities.entries()){
      const profile=characters3D().find(p=>p.id===identity.character);
      if(!profile||identity.appearance)throw new Error('Kies voor taartgooien een personage met een 3D-model.');
      const path=profile.model3d.file;
      if(!containers.has(path)){
        const response=await fetch(assetURL(path),{signal:scope.signal});if(!response.ok)throw new Error(`Het 3D-model van ${profile.name} kon niet worden geladen.`);
        const bytes=new Uint8Array(await response.arrayBuffer());if(disposed)return;
        const container=await LoadAssetContainerAsync(bytes,scene,{pluginExtension:'.glb'});
        if(disposed){container.dispose();return;}
        if(!container.meshes.some(mesh=>mesh.getTotalVertices()>0)){container.dispose();throw new Error(`${profile.name} heeft geen zichtbaar 3D-model.`);}
        containers.set(path,container);
      }
      if(disposed)return;
      const entry=containers.get(path).instantiateModelsToScene(name=>`${index}-${name}`,false,{doNotInstantiate:true});instances.push(entry);
      const root=new TransformNode('taartspeler-'+index,scene);for(const node of entry.rootNodes)node.parent=root;
      for(const group of entry.animationGroups){group.stop();group.start(true);group.pause();}
      const animation=entry.animationGroups.find(group=>/run/i.test(group.name))||entry.animationGroups[0];
      const held=cake('taart-in-hand',root);held.position.set(.34,.9,.35);
      const cream=new TransformNode('slagroom-op-gezicht',scene);cream.parent=root;
      for(let i=0;i<5;i++)sphere('slagroom-vlek',(i%3-1)*.11,1.22+Math.floor(i/3)*.13,.28,.11,0xfff8e9,cream);
      const ring=cylinder('spelerkleur-'+index,0,.06,0,.43,.04,index===0?0x9772c8:0x408f82);
      actors.push({root,animation,held,cream,ring});
    }
    budget.invalidate();
  }
  function draw(game,force=false){
    if(disposed)return;
    const width=Math.max(1,canvas.clientWidth||canvas.width),height=Math.max(1,canvas.clientHeight||canvas.height);
    const size=renderSize3D(width,height,software);
    if(canvas.width!==size.width||canvas.height!==size.height){engine.setSize(size.width,size.height);budget.invalidate();}
    // Keep the carts and both actors inside the frustum in landscape and portrait.
    camera.radius=Math.max(24,13/Math.tan(camera.fov/2)/Math.min(1.8,width/height));
    const nextState=game?`${game.time}/${game.state}/${game.paused}`:'';
    if(nextState!==lastState){lastState=nextState;budget.invalidate();}
    if(!budget.take(performance.now(),game?.state==='playing'&&!game.paused,force))return;
    if(game){
      for(const [i,actor] of actors.entries()){
        const p=game.players[i];actor.root.position.set(p.x,p.moving?Math.sin(game.time*15)*.025:0,p.z);actor.root.rotation.y=p.angle;actor.root.rotation.x=-Math.sin(p.throwTime/.3*Math.PI)*.15;
        actor.ring.position.set(p.x,.06,p.z);actor.held.setEnabled(p.cakes>0);actor.cream.setEnabled(p.splat>0);
        if(actor.animation)actor.animation.goToFrame(p.moving?actor.animation.from+(game.time*30)%Math.max(1,actor.animation.to-actor.animation.from):actor.animation.from);
      }
      for(const [i,stock] of cartCakes.entries())stock.forEach((mesh,index)=>mesh.setEnabled(index<game.carts[i].stock));
      for(const [id,mesh] of cakeMeshes)if(!game.cakes.some(c=>c.id===id)){mesh.dispose();cakeMeshes.delete(id);}
      for(const c of game.cakes){let mesh=cakeMeshes.get(c.id);if(!mesh){mesh=cake('vliegende-taart');cakeMeshes.set(c.id,mesh);}mesh.position.set(c.x,c.y,c.z);mesh.rotation.z=c.age*6;}
      for(const [id,mesh] of splashMeshes)if(!game.splashes.some(s=>s.id===id)){mesh.dispose();splashMeshes.delete(id);}
      for(const s of game.splashes){let mesh=splashMeshes.get(s.id);if(!mesh){mesh=sphere('slagroomwolk',0,0,0,.35,0xfff6e4);splashMeshes.set(s.id,mesh);}mesh.position.set(s.x,s.y,s.z);const scale=1+(1-s.life/.7)*1.4;mesh.scaling.set(scale,.2,scale);mesh.visibility=Math.max(0,s.life/.7);}
    }
    scene.render(false,true);renderCount++;if(!scene.isReady())budget.invalidate();
  }
  return {prepare,draw,
    diagnostics(){return {engine:'Babylon.js',actors:actors.length,meshes:scene.meshes.length,carts:cartCakes.length,renderCount,disposed};},
    dispose(){if(disposed)return;disposed=true;scope.abort();for(const entry of instances)entry.dispose();for(const container of containers.values())container.dispose();containers.clear();actors.length=0;cakeMeshes.clear();splashMeshes.clear();scene.dispose();engine.dispose();canvas.width=1;canvas.height=1;}
  };
}
