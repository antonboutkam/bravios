import { assetURL } from '../paths.mjs';
import {structureProfile} from './runtime.mjs';
const images=new Map();
export function structureVisual(profile,{theme='grass',top=true,icon=false,doorOpen=0,state}={}){
 if(!profile)return null;
 if(state&&profile.visuals[state])return profile.visuals[state];
 if(profile.kind==='cave'&&profile.settings.locked&&doorOpen>0)return profile.visuals[`door-${Math.round(Math.max(0,Math.min(1,doorOpen))*8)}`]||profile.visuals.default;
 const suffix=icon?'editor':top?'':'inside';
 return profile.visuals[`${theme}${suffix?'-'+suffix:''}`]||profile.visuals[suffix]||profile.visuals[theme]||profile.visuals.default;
}
function sprite(path){
 if(images.has(path))return images.get(path);
 if(typeof Image==='undefined')return null;
 const image=new Image();image.src=assetURL(path);images.set(path,image);
 if(images.size>64)images.delete(images.keys().next().value);return image;
}
export function drawStructureSprite(ctx,profile,x,y,width=32,height=width,options={}){
 if(globalThis.braviosExportStructures)return false;
 const v=structureVisual(profile,options),image=v&&sprite(v.image);if(!image?.complete||!image.naturalWidth)return false;
 const frame=((Math.floor((options.time||0)*v.fps)%v.frames)+v.frames)%v.frames;
 const [left,top,w,h]=v.bounds;
 ctx.save();
 if(profile.kind==='pipe'){const angles={up:0,down:Math.PI,left:-Math.PI/2,right:Math.PI/2};ctx.translate(x+width/2,y+height/2);ctx.rotate(angles[profile.pipe.opening]-angles[profile.imageOpening||'up']);ctx.translate(-x-width/2,-y-height/2);}
 ctx.drawImage(image,frame*v.frameWidth,0,v.frameWidth,v.frameHeight,x+left*width/32,y+top*height/32,w*width/32,h*height/32);ctx.restore();return true;
}
export function drawStructureTile(ctx,id,x,y,size,options={}){
 const profile=structureProfile(id);if(!profile)return false;
 // Matching terrain edges and articulated structures use their PNG components.
 if(profile.terrain&&[1,2].includes(id)&&(profile.kind==='brick'||['grass','night'].includes(options.theme)))return false;
 if(['vine','donut','firebar','chain-ball','chainhead-anchor'].includes(profile.kind))return false;
 return drawStructureSprite(ctx,profile,x,y,size,size,options);
}
