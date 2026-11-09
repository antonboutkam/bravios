// The parent retains its authoritative state. A child gets a copy of identities, not the level.
export class GameFlow {
  constructor({suspend,resume,launch}){this.suspend=suspend;this.resume=resume;this.launch=launch;this.busy=false;}
  async enter(request){
    if(this.busy)throw new Error('Er is al een tussenspel actief.');
    if(!request||typeof request.game!=='string')throw new Error('Kies een geldig tussenspel.');
    const child=structuredClone(request);
    this.busy=true;let parent,suspended=false;
    try{parent=this.suspend();suspended=true;return await this.launch(child);}
    finally{try{if(suspended)this.resume(parent);}finally{this.busy=false;}}
  }
}
