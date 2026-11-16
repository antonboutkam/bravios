import { onImageProblems, reportDOMImageFailure, clearImageProblem } from './image-loader.mjs';
let installed=false;
export function setupImageErrors(){
  if(installed)return;installed=true;
  const panel=document.createElement('details');panel.id='image-errors';panel.className='image-errors';panel.hidden=true;panel.open=true;
  panel.innerHTML='<summary role="alert"></summary><p>Controleer de bestanden hieronder. Sla verbeteringen op en laad het spel opnieuw.</p><ul></ul><button type="button" class="button">Opnieuw laden</button>';
  panel.querySelector('button').onclick=()=>location.reload();document.body.append(panel);
  function place(){
    const loading=document.querySelector('#loading-screen'),card=loading?.querySelector('.loading-card');
    const atStartup=!!card&&!loading.hidden;
    const parent=atStartup?card:[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;
    panel.classList.toggle('image-errors-loading',atStartup);card?.classList.toggle('with-image-errors',atStartup);
    const button=panel.querySelector('button');if(button.hidden!==atStartup)button.hidden=atStartup;
    if(panel.parentElement!==parent){
      if(atStartup)parent.insertBefore(panel,document.querySelector('#loading-retry'));else parent.append(panel);
      if(parent.tagName==='DIALOG')parent.addEventListener('close',()=>{if(panel.parentElement===parent)document.body.append(panel);},{once:true});
    }
  }
  new MutationObserver(()=>{if(!panel.hidden)place();}).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','hidden']});
  onImageProblems(errors=>{
    panel.hidden=!errors.length;panel.querySelector('summary').textContent=`${errors.length} afbeelding${errors.length===1?'':'en'} niet geladen`;
    const list=panel.querySelector('ul');list.replaceChildren();
    for(const error of errors){const item=document.createElement('li'),title=document.createElement('strong'),path=document.createElement('code'),detail=document.createElement('span');title.textContent=error.label;path.textContent=error.path;detail.textContent=error.detail;item.append(title,path,detail);list.append(item);}
    if(errors.length)place();else document.querySelector('.loading-card')?.classList.remove('with-image-errors');
  });
  function pathFor(image){
    if(image.dataset.asset)return image.dataset.asset;
    const src=image.currentSrc||image.src;if(!src||src.startsWith('data:')||src.startsWith('blob:'))return null;
    const path=new URL(src,location.href).pathname;const match=path.match(/(?:^|\/)((?:gameplay|assets)\/.*)$/);return match?decodeURIComponent(match[1]):decodeURIComponent(path);
  }
  document.addEventListener('error',event=>{if(event.target?.tagName==='IMG'){const path=pathFor(event.target);if(path)void reportDOMImageFailure(path,event.target.currentSrc||event.target.src);}},true);
  document.addEventListener('load',event=>{if(event.target?.tagName==='IMG'){const path=pathFor(event.target);if(path)clearImageProblem(path);}},true);
  for(const image of document.querySelectorAll('img[src]'))if(image.complete&&!image.naturalWidth){const path=pathFor(image);if(path)void reportDOMImageFailure(path,image.currentSrc||image.src);}
}
