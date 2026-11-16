import { renderSize3D, RenderBudget3D } from './render-budget.mjs';
import { library } from './vendor/babylon.mjs';
import { assetURL } from '../../paths.mjs';
import { characters3D, enemies3D } from './access.mjs';
const {Engine,Scene,Vector3,Matrix,Color3,Color4,Plane,ArcRotateCamera,HemisphericLight,DirectionalLight,MeshBuilder,TransformNode,StandardMaterial,LoadAssetContainerAsync}=library;
const themes={grass:{sky:0xccecf2,grass:0x83b953,earth:0xaa7950},winter:{sky:0xd8e9f6,grass:0xe9f5fa,earth:0x839cac},castle:{sky:0xc1bcd5,grass:0x9290a6,earth:0x625970},sunset:{sky:0xffdbb4,grass:0xbac765,earth:0xad7153}};
const color=n=>Color3.FromInts(n>>16,(n>>8)&255,n&255);
export function createStage3D(canvas){
  let engine;
  try{engine=new Engine(canvas,false,{preserveDrawingBuffer:false,loseContextOnDispose:true,stencil:true,powerPreference:'high-performance',adaptToDeviceRatio:false},false);}
  catch{throw new Error('3D starten lukt niet. Controleer WebGL en hardwareversnelling in je browser.');}
  const info=engine.getGlInfo(),software=/swiftshader|llvmpipe|softpipe|software/i.test(info.renderer);
  const budget=new RenderBudget3D(software),scene=new Scene(engine);scene.useRightHandedSystem=true;
  scene.imageProcessingConfiguration.toneMappingEnabled=true;scene.imageProcessingConfiguration.toneMappingType=1;
  scene.autoClear=true;scene.skipPointerMovePicking=true;scene.skipPointerDownPicking=true;scene.skipPointerUpPicking=true;
  const camera=new ArcRotateCamera('camera',Math.PI/2,Math.PI/4,20,new Vector3(),scene);
  camera.fov=42*Math.PI/180;camera.minZ=.1;camera.maxZ=180;
  camera.lowerRadiusLimit=4;camera.upperRadiusLimit=90;camera.lowerBetaLimit=.15;camera.upperBetaLimit=Math.PI*.47;
  camera.inertia=.75;camera.panningInertia=.75;camera.wheelDeltaPercentage=.01;
  camera.attachControl(canvas,true,false,1);
  camera.inputs.removeByType('ArcRotateCameraKeyboardMoveInput');
  camera.inputs.attached.pointers.buttons=[1,2];
  const ambient=new HemisphericLight('sky',new Vector3(0,1,0),scene);ambient.diffuse=color(0xe6f8ff);ambient.groundColor=color(0x8d7655);ambient.intensity=.75;
  const sun=new DirectionalLight('sun',new Vector3(-8,-24,-12),scene);sun.diffuse=color(0xfff5dd);sun.intensity=1.1;
  const models=new Map(),materials=new Map(),instances=[],coins=new Map(),foes=new Map();
  let world=null,grid=null,hero=null,run=null,animationTime=0,disposed=false,renderCount=0,cameraState='';
  const invalidate=()=>budget.invalidate();
  const scope=new AbortController();
  canvas.addEventListener('contextmenu',e=>e.preventDefault(),{signal:scope.signal});
  for(const type of ['pointerdown','pointermove','pointerup','wheel'])canvas.addEventListener(type,invalidate,{signal:scope.signal,passive:true});
  scene.onDataLoadedObservable.add(invalidate);
  function material(hex){if(!materials.has(hex)){const m=new StandardMaterial('color-'+hex,scene);m.diffuseColor=color(hex);m.specularColor=new Color3(.08,.08,.08);materials.set(hex,m);}return materials.get(hex);}
  function paint(mesh,hex,parent){mesh.material=material(hex);mesh.parent=parent;return mesh;}
  function box(x,y,z,w,h,d,hex,parent){const mesh=paint(MeshBuilder.CreateBox('block',{width:w,height:h,depth:d},scene),hex,parent);mesh.position.set(x+w/2,y+h/2,z+d/2);return mesh;}
  function ball(x,y,z,r,hex,parent){const mesh=paint(MeshBuilder.CreateSphere('detail',{diameter:r*2,segments:8},scene),hex,parent);mesh.position.set(x,y,z);return mesh;}
  function cylinder(name,options,hex,parent){return paint(MeshBuilder.CreateCylinder(name,options,scene),hex,parent);}
  function clear(){
    for(const entry of instances.splice(0))entry.dispose();
    world?.dispose();grid?.dispose();world=new TransformNode('level',scene);grid=null;coins.clear();foes.clear();hero=null;run=null;animationTime=0;
  }
  async function load(profile){
    const path=profile.model3d.file;if(models.has(path))return models.get(path);
    let container;
    try{const response=await fetch(assetURL(path));if(!response.ok)throw new Error('HTTP '+response.status);const bytes=new Uint8Array(await response.arrayBuffer());if(disposed)return;
      container=await LoadAssetContainerAsync(bytes,scene,{pluginExtension:'.glb'});
    }catch(error){if(disposed)return;throw new Error(`Het 3D-model van ${profile.name} kon niet worden geladen: ${error.message}`);}
    if(disposed){container.dispose();return;}
    if(!container.meshes.some(m=>m.getTotalVertices()>0)){container.dispose();throw new Error(`${profile.name} heeft geen zichtbaar 3D-model.`);}
    models.set(path,container);invalidate();return container;
  }
  function instance(profile,parent){
    const container=models.get(profile.model3d.file);if(!container)throw new Error(`Model ontbreekt: ${profile.name}`);
    const entry=container.instantiateModelsToScene(name=>profile.id+'-'+name,false,{doNotInstantiate:true});instances.push(entry);
    const root=new TransformNode(profile.id,scene);root.parent=parent;
    for(const node of entry.rootNodes)node.parent=root;
    for(const group of entry.animationGroups)group.stop();
    return {root,animation:entry.animationGroups.find(g=>/run/i.test(g.name))||entry.animationGroups[0]};
  }
  async function prepare(level,character){
    for(const profile of [...enemies3D().filter(p=>level.objects.some(o=>o.enemy===p.key)),...characters3D().filter(p=>p.id===character)]){await load(profile);if(disposed)return;}
  }
  function setLevel(level,{editing=false,character=null}={}){
    if(disposed)return;clear();invalidate();
    const colors=themes[level.theme],sky=color(colors.sky);scene.clearColor=new Color4(sky.r,sky.g,sky.b,1);scene.fogMode=Scene.FOGMODE_LINEAR;scene.fogColor=sky;scene.fogStart=45;scene.fogEnd=110;
    for(const o of level.objects){
      const group=new TransformNode(o.id,scene);group.parent=world;group.metadata={objectId:o.id};
      if(o.type==='block'){
        box(o.x,o.y,o.z,o.w,o.h-.15,o.d,colors.earth,group);box(o.x,o.y+o.h-.15,o.z,o.w,.15,o.d,colors.grass,group);
        if(o.w>=4&&o.d>=4)for(let i=0;i<3;i++)ball(o.x+.45+i*.3,o.y+o.h+.08,o.z+.4,.09,0xf9dc76,group).scaling.y=.7;
      }else if(o.type==='lava'){
        box(o.x,o.y,o.z,o.w,o.h-.08,o.d,0xef6233,group);box(o.x,o.y+o.h-.08,o.z,o.w,.08,o.d,0xffb83d,group);
      }else if(o.type==='coin'){
        const mesh=cylinder('coin',{diameter:.52,height:.09,tessellation:18},0xffce42,group);mesh.rotation.x=Math.PI/2;mesh.position.set(o.x+.5,o.y+.65,o.z+.5);coins.set(o.id,mesh);
      }else if(o.type==='finish'){
        box(o.x+.46,o.y,o.z+.46,.08,2.8,.08,0xfff7de,group);box(o.x+.54,o.y+1.9,o.z+.47,1,.65,.055,0xf27169,group);ball(o.x+.5,o.y+2.88,o.z+.5,.13,0xffd15b,group);box(o.x+.05,o.y,o.z+.05,.9,.12,.9,0xf4d17b,group);
      }else if(o.type==='start'){
        const disc=cylinder('start',{diameter:1,height:.05,tessellation:24},0x71d4cc,group);disc.position.set(o.x+.5,o.y+.03,o.z+.5);
        if(editing){const arrow=cylinder('arrow',{diameterTop:0,diameterBottom:.36,height:.4,tessellation:8},0x238e87,group);arrow.position.set(o.x+.5,o.y+.7,o.z+.5);}
      }else if(o.type==='enemy'){
        const foe=instance(enemies3D().find(p=>p.key===o.enemy),group).root;foe.position.set(o.x+.5,o.y,o.z+.5);foes.set(o.id,foe);
      }
    }
    if(editing){const lines=[];for(let x=0;x<=level.width;x++)lines.push([new Vector3(x,0,0),new Vector3(x,0,level.depth)]);for(let z=0;z<=level.depth;z++)lines.push([new Vector3(0,0,z),new Vector3(level.width,0,z)]);grid=MeshBuilder.CreateLineSystem('grid',{lines},scene);grid.color=color(0x8da6a1);grid.position.y=.01;grid.isPickable=false;}
    if(character){const actor=instance(characters3D().find(p=>p.id===character),world);hero=actor.root;run=actor.animation;if(run){run.start(true);run.pause();}}
  }
  function frameLevel(level){
    const parts=level.objects,minX=parts.length?Math.min(...parts.map(o=>o.x)):0,maxX=parts.length?Math.max(...parts.map(o=>o.x+(o.w||1))):level.width;
    const minZ=parts.length?Math.min(...parts.map(o=>o.z)):0,maxZ=parts.length?Math.max(...parts.map(o=>o.z+(o.d||1))):level.depth,maxY=parts.length?Math.max(...parts.map(o=>o.y+(o.h||2))):2;
    camera.lowerRadiusLimit=4;camera.upperRadiusLimit=120;camera.setTarget(new Vector3((minX+maxX)/2,maxY/2,(minZ+maxZ)/2));
    const aspect=Math.max(.5,canvas.clientWidth/Math.max(1,canvas.clientHeight));
    camera.radius=Math.max(8,Math.hypot(maxX-minX,maxZ-minZ)/2/Math.tan(camera.fov/2)/Math.min(1,aspect));camera.alpha=Math.atan2(1,.6);camera.beta=Math.atan2(Math.hypot(.6,1),.85);invalidate();
  }
  function follow(player,initial=false){
    camera.setTarget(new Vector3(player.x,Math.max(.5,player.y+.8),player.z));camera.lowerRadiusLimit=5;camera.upperRadiusLimit=25;
    if(initial){camera.alpha=Math.PI/2;camera.beta=Math.atan2(12,8);camera.radius=Math.hypot(8,12);}invalidate();
  }
  function draw(game,dt=0,force=false){
    if(disposed)return false;
    const size=renderSize3D(Math.max(1,canvas.clientWidth),Math.max(1,canvas.clientHeight),software);
    if(canvas.width!==size.width||canvas.height!==size.height){engine.setSize(size.width,size.height);invalidate();}
    camera.update();const state=[camera.alpha,camera.beta,camera.radius,...camera.target.asArray()].join(',');if(state!==cameraState){cameraState=state;invalidate();}
    animationTime+=dt;
    if(!budget.take(performance.now(),!!game&&dt>0,force))return false;
    if(game&&hero){const p=game.player;hero.position.set(p.x,p.y,p.z);hero.rotation.y=p.angle;
      if(run&&p.moving&&p.grounded){const fps=run.targetedAnimations[0]?.animation.framePerSecond||30;run.goToFrame(run.from+(animationTime*fps)%Math.max(1,run.to-run.from));}
      for(const [id,mesh] of coins){mesh.setEnabled(!game.collected.includes(id));mesh.rotation.z=game.time*2;}
      for(const e of game.enemies){const foe=foes.get(e.id);if(foe){foe.setEnabled(e.alive);foe.position.set(e.x,e.y,e.z);foe.rotation.y=e.direction*Math.PI/2;}}
    }
    scene.render(false,true);renderCount++;if(!scene.isReady())invalidate();return true;
  }
  function ray(event){const r=canvas.getBoundingClientRect();return scene.createPickingRay((event.clientX-r.left)*engine.getRenderWidth()/r.width,(event.clientY-r.top)*engine.getRenderHeight()/r.height,Matrix.Identity(),camera);}
  function pick(event){let node=scene.pickWithRay(ray(event),mesh=>mesh.isDescendantOf(world))?.pickedMesh;while(node&&!node.metadata?.objectId)node=node.parent;return node?.metadata?.objectId||null;}
  function point(event,y){const r=ray(event),distance=r.intersectsPlane(new Plane(0,1,0,-y));if(distance===null||distance<0)return null;const p=r.origin.add(r.direction.scale(distance));return {x:Math.floor(p.x),y,z:Math.floor(p.z)};}
  function inputDirection(x,z){const forward=camera.getForwardRay().direction;forward.y=0;forward.normalize();return {x:-forward.z*x-forward.x*z,z:forward.x*x-forward.z*z};}
  function orbit(amount){camera.alpha-=amount;invalidate();}
  function preview(profile,direction){
    clear();instance(profile,world);scene.clearColor=new Color4(245/255,239/255,223/255,1);scene.fogMode=Scene.FOGMODE_NONE;
    const angle=({front:0,back:Math.PI,left:-Math.PI/2,right:Math.PI/2,perspective:Math.PI/4})[direction]||0,height=profile.id==='walker'?.45:.85;
    camera.setTarget(new Vector3(0,height,0));camera.alpha=Math.PI/2-angle;camera.beta=Math.atan2(3.5,.45);camera.radius=Math.hypot(3.5,.45);camera.lowerRadiusLimit=1;camera.upperRadiusLimit=8;invalidate();draw(null,0,true);
  }
  return {prepare,setLevel,frameLevel,follow,draw,pick,point,inputDirection,orbit,load,preview,
    setLayer(y){if(grid){grid.position.y=y+.01;invalidate();}},
    capture(){draw(null,0,true);return canvas.toDataURL('image/png');},
    diagnostics(){return {ready:scene.isReady(),activeMeshes:scene.getActiveMeshes().length,engine:'Babylon.js',version:Engine.Version,software,renderCount,width:canvas.width,height:canvas.height,maxFPS:1000/budget.interval};},
    dispose(){if(disposed)return;disposed=true;scope.abort();camera.detachControl();for(const entry of instances.splice(0))entry.dispose();for(const container of models.values())container.dispose();models.clear();scene.dispose();engine.dispose();canvas.width=1;canvas.height=1;}
  };
}
