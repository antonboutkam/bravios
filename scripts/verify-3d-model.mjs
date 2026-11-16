import { readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
// A registered capability must refer to a real, self-contained mesh, not a flag.
export async function verifyModel3D(filename, folder) {
  const resolved=await realpath(filename),root=await realpath(folder);
  if(!resolved.startsWith(root+path.sep))throw new Error(`${filename}: model buiten de eigen map.`);
  const data=await readFile(resolved);
  if(data.length<28||data.length>10*1024*1024||data.readUInt32LE(0)!==0x46546c67||data.readUInt32LE(4)!==2||data.readUInt32LE(8)!==data.length||data.readUInt32LE(16)!==0x4e4f534a)throw new Error(`${filename}: ongeldig GLB-model.`);
  const model=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString());
  if(!model.meshes?.length||!model.nodes?.some(n=>Number.isInteger(n.mesh))||model.buffers?.some(b=>b.uri)||model.images?.some(i=>i.uri))throw new Error(`${filename}: gebruik een zelfstandig GLB-bestand met een echt mesh.`);
  return model;
}
