import { readFile } from 'node:fs/promises';
import path from 'node:path';
const namedImport=/^import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm;
const reExport=/^export\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/gm;
const dynamicImport=/\bimport\(\s*['"]([^'"]+)['"]\s*\)/g;
function resolveModule(parent,specifier){
  if(!specifier.startsWith('.'))throw new Error(`Alleen relatieve runtime-imports: ${specifier}`);
  const name=path.posix.normalize(path.posix.join(path.posix.dirname(parent),specifier.split('?')[0]));
  if(name.startsWith('../')||!name.endsWith('.mjs'))throw new Error(`Ongeldig modulepad: ${name}`);
  return name;
}
function names(list){return list.split(',').map(s=>s.trim()).filter(Boolean).map(s=>s.split(/\s+as\s+/));}
export async function collectModules(root,entries=['app.mjs']){
  const modules=new Map();
  async function visit(name){
    if(modules.has(name))return;
    const source=await readFile(new URL(name,root),'utf8');modules.set(name,source);
    for(const regex of [namedImport,reExport,dynamicImport])for(const match of source.matchAll(regex))await visit(resolveModule(name,match[2]||match[1]));
  }
  for(const entry of entries)await visit(entry);
  return modules;
}
export function compileModule(name,source){
  const exports=[];
  let code=source.replace(namedImport,(_,bindings,specifier)=>`const {${names(bindings).map(([from,to])=>to?`${from}:${to}`:from).join(',')}}=require(${JSON.stringify(resolveModule(name,specifier))});`);
  code=code.replace(reExport,(_,bindings,specifier)=>`Object.assign(exports,(()=>{const imported=require(${JSON.stringify(resolveModule(name,specifier))});return {${names(bindings).map(([from,to])=>`${to||from}:imported.${from}`).join(',')}};})());`);
  code=code.replace(/^export\s+(?=(?:async\s+)?(?:function|class|const|let)\s+(\w+))/gm,(_,identifier)=>{exports.push(identifier);return '';});
  code=code.replace(dynamicImport,(_,specifier)=>`dynamicImport(${JSON.stringify(resolveModule(name,specifier))})`);
  code=code.replace(/\bimport\.meta\.url\b/g,`new URL(${JSON.stringify(name)},globalThis.location.href).href`);
  if(/^\s*(?:import|export)\s/m.test(code))throw new Error(`Niet-ondersteunde modulesyntaxis in ${name}`);
  return `function(require,exports,dynamicImport){\n${code}\nObject.assign(exports,{${exports.join(',')}});\n}`;
}
export function bundleModules(modules,entry='app.mjs'){
  const factories=[...modules].map(([name,source])=>`${JSON.stringify(name)}:${compileModule(name,source)}`).join(',\n');
  return `(function(){\nconst factories={${factories}};\nconst cache=new Map(),loading=new Set();\nfunction require(name){if(loading.has(name))throw new Error('Circulaire module: '+name);if(cache.has(name))return cache.get(name);if(!factories[name])throw new Error('Ontbrekende module: '+name);loading.add(name);const exports={};try{factories[name](require,exports,name=>Promise.resolve().then(()=>require(name)));cache.set(name,exports);return exports;}finally{loading.delete(name);}}\nrequire(${JSON.stringify(entry)});\n})();`;
}
