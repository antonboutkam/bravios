// Every session owns a scope. Disposal also works while an async load is pending.
export class ResourceScope {
  constructor(){this.controller=new AbortController();this.cleanups=[];this.disposed=false;}
  get signal(){return this.controller.signal;}
  defer(cleanup){if(this.disposed)cleanup();else this.cleanups.push(cleanup);return cleanup;}
  listen(target,event,handler,options){target.addEventListener(event,handler,options);this.defer(()=>target.removeEventListener(event,handler,options));return handler;}
  canvas(canvas){this.defer(()=>{canvas.width=1;canvas.height=1;});return canvas;}
  dispose(){
    if(this.disposed)return;
    this.disposed=true;this.controller.abort();
    const errors=[];
    for(const cleanup of this.cleanups.splice(0).reverse())try{cleanup();}catch(error){errors.push(error);}
    if(errors.length)throw new AggregateError(errors,'Resources konden niet allemaal worden vrijgegeven.');
  }
}

// Shared decoded resources survive only while a session holds a lease.
export class ResourcePool {
  constructor(){this.entries=new Map();}
  acquire(key,load,release,scope){
    if(scope.disposed)return Promise.reject(new Error('De spelsessie is gesloten.'));
    let entry=this.entries.get(key);
    if(!entry){
      entry={users:0,value:null,ready:false,release};this.entries.set(key,entry);
      entry.promise=Promise.resolve().then(load).then(value=>{entry.value=value;entry.ready=true;if(!entry.users)entry.release(value);return value;},error=>{if(this.entries.get(key)===entry)this.entries.delete(key);throw error;});
    }
    entry.users++;
    scope.defer(()=>{if(--entry.users===0){if(this.entries.get(key)===entry)this.entries.delete(key);if(entry.ready){entry.release(entry.value);entry.value=null;}}});
    return entry.promise.then(value=>{if(scope.disposed)throw new Error('De spelsessie is gesloten.');return value;});
  }
  get size(){return this.entries.size;}
}
