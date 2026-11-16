import { assetURL } from './paths.mjs';
const problems = new Map(), listeners = new Set(), attempts = new Map();
function publish(){for(const listener of listeners)listener([...problems.values()]);}
export function imageLabel(path){
  const match=path.match(/^gameplay\/characters\/([^/]+)\/images\/(?:platform\/)?([^/]+)$/);
  return match ? `Personage ${match[1]} · ${match[2]}` : 'Afbeelding';
}
export function reportImageProblem(path, detail, label=imageLabel(path)){
  const error=new Error(`${label}: ${detail}\nBestand: ${path}`);
  error.name='ImageLoadError';error.path=path;error.detail=detail;error.label=label;
  if(problems.get(path)?.message!==error.message){problems.set(path,error);publish();}
  return error;
}
export function clearImageProblem(path){attempts.set(path,(attempts.get(path)||0)+1);if(problems.delete(path))publish();}
export function onImageProblems(listener){listeners.add(listener);listener([...problems.values()]);return ()=>listeners.delete(listener);}
async function failureDetail(url){
  if(url.startsWith('data:'))return 'De ingesloten afbeelding is beschadigd of heeft een onleesbaar formaat.';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4000);timer.unref?.();
  try{
    const response=await fetch(url,{method:'HEAD',cache:'no-store',signal:controller.signal});
    if(response.status===404)return 'Bestand niet gevonden (404). Controleer de map en bestandsnaam, inclusief hoofdletters.';
    if(!response.ok)return `De server weigert of kan het bestand niet leveren (HTTP ${response.status}).`;
    return 'Het bestand is ontvangen, maar de browser kan het niet als afbeelding lezen. Exporteer het opnieuw in een geldig afbeeldingsformaat.';
  }catch{return 'Het bestand kon niet worden opgehaald. Controleer de verbinding en of de spelserver bereikbaar is.';}
  finally{clearTimeout(timer);}
}
export function requestImageAsset(path, label=imageLabel(path), {timeoutMs=20000}={}){
  const image=new Image(),url=assetURL(path),token=(attempts.get(path)||0)+1;attempts.set(path,token);
  let done=false,resolve,reject;
  const ready=new Promise((yes,no)=>{resolve=yes;reject=no;});
  // Lazy canvas sprites use the image immediately; their errors are reported in
  // the shared overview even when nobody awaits the promise.
  ready.catch(()=>{});
  const finish=()=>{if(done)return false;done=true;clearTimeout(timer);image.onload=null;image.onerror=null;return true;};
  const fail=detail=>{const error=attempts.get(path)===token?reportImageProblem(path,detail,label):new Error(`${label}: ${detail}\nBestand: ${path}`);reject(error);};
  const timer=setTimeout(()=>{if(finish())fail('Het laden duurt te lang. Controleer de verbinding en probeer opnieuw.');},timeoutMs);timer.unref?.();
  image.onload=()=>{if(!finish())return;if(attempts.get(path)===token)clearImageProblem(path);resolve(image);};
  image.onerror=async()=>{if(finish())fail(await failureDetail(url));};
  image.src=url;
  return {image,ready};
}
export function loadImageAsset(path,label,options){return requestImageAsset(path,label,options).ready;}
export async function reportDOMImageFailure(path,url){
  const token=(attempts.get(path)||0)+1;attempts.set(path,token);
  const detail=await failureDetail(url);
  if(attempts.get(path)===token)return reportImageProblem(path,detail);
}
