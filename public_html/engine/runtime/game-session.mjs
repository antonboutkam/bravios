import { ResourceScope } from './resource-scope.mjs';

// Game modules are stateless factories. Only the active instance owns game state/resources.
export class GameSessionHost {
  constructor(load){this.load=load;this.generation=0;this.active=null;this.pending=null;}
  async start(id,context={}){
    this.stop();const generation=this.generation,scope=new ResourceScope();this.pending=scope;
    try{
      const pack=await this.load(id);
      if(scope.disposed)return null;
      const session=await pack.createSession({...context,scope});
      scope.defer(()=>session.dispose?.());
      if(scope.disposed||generation!==this.generation)return null;
      this.pending=null;this.active={id,session,scope};return session;
    }catch(error){
      const cancelled=scope.disposed||generation!==this.generation;
      try{scope.dispose();}finally{if(this.pending===scope)this.pending=null;}
      if(cancelled)return null;
      throw error;
    }
  }
  stop(){
    this.generation++;
    const active=this.active,pending=this.pending;this.active=null;this.pending=null;
    try{pending?.dispose();}finally{active?.scope.dispose();}
  }
}
