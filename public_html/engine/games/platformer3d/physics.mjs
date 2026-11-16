import { library } from './vendor/babylon.mjs';
import { assetURL } from '../../paths.mjs';
const {NullEngine,Scene,Vector3,MeshBuilder,HavokPlugin,HavokPhysics,PhysicsAggregate,PhysicsShapeType,PhysicsCharacterController,CharacterSupportedState}=library;
export const PHYSICS_ASSET_3D='engine/games/platformer3d/vendor/HavokPhysics.wasm';
let havok=null,loading=null;
export async function initializePhysics3D(wasmBinary=null){
  if(havok)return;
  if(!loading)loading=(async()=>{
    if(!wasmBinary){const response=await fetch(assetURL(PHYSICS_ASSET_3D));if(!response.ok)throw new Error('De 3D-physics kon niet worden geladen.');wasmBinary=await response.arrayBuffer();}
    havok=await HavokPhysics({wasmBinary,locateFile:()=>PHYSICS_ASSET_3D});
  })().catch(error=>{loading=null;throw error;});
  await loading;
}

// Physics has its own headless scene: fixed simulation steps never depend on
// rendering, camera movement, editor previews or the user's display refresh rate.
export function createPhysics3D(level,player,body){
  if(!havok)throw new Error('De 3D-physics is nog niet geladen.');
  const engine=new NullEngine(),scene=new Scene(engine),gravity=new Vector3(0,-body.gravity,0),down=new Vector3(0,-1,0);
  const plugin=new HavokPlugin(true,havok);scene.enablePhysics(gravity,plugin);
  const aggregates=[];
  for(const o of level.objects.filter(o=>o.type==='block')){
    const mesh=MeshBuilder.CreateBox(o.id,{width:o.w,height:o.h,depth:o.d},scene);
    mesh.position.set(o.x+o.w/2,o.y+o.h/2,o.z+o.d/2);mesh.computeWorldMatrix(true);
    aggregates.push(new PhysicsAggregate(mesh,PhysicsShapeType.BOX,{mass:0,friction:0,restitution:0},scene));
  }
  const controller=new PhysicsCharacterController(new Vector3(player.x,player.y+body.height/2,player.z),{capsuleHeight:body.height,capsuleRadius:body.radius},scene);
  controller.keepDistance=.005;controller.keepContactTolerance=.02;
  controller.maxSlopeCosine=Math.cos(Math.PI/4);
  const velocity=new Vector3(),position=new Vector3();
  let disposed=false;
  return {
    move(p,x,z,jump,dt){
      if(disposed||dt<=0)return;
      position.set(p.x,p.y+body.height/2,p.z);
      if(!controller.getPosition().equalsWithEpsilon(position,.0001))controller.setPosition(position);
      const support=controller.checkSupport(dt,down);
      const grounded=support.supportedState===CharacterSupportedState.SUPPORTED&&p.vy<=0;
      p.vy=jump&&grounded?body.jump:grounded?0:p.vy-body.gravity*dt;
      velocity.set(x*body.speed,p.vy,z*body.speed);controller.setVelocity(velocity);
      controller.integrate(dt,support,gravity);
      const next=controller.getPosition(),resolved=controller.getVelocity();
      p.x=next.x;p.y=next.y-body.height/2;p.z=next.z;
      p.vy=resolved.y;
      p.grounded=controller.checkSupport(dt,down).supportedState===CharacterSupportedState.SUPPORTED&&p.vy<=.01;
    },
    dispose(){if(disposed)return;disposed=true;controller.dispose();for(const a of aggregates)a.dispose();scene.dispose();engine.dispose();}
  };
}
