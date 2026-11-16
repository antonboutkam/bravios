// Shared manifest contract. Merely having a name or a portrait never enables 3D.
export function model3DConfig(value, base) {
  if (value == null) return null;
  if (!value || value.file !== '3d/model.glb') throw new Error(`${base}: model3d.file moet 3d/model.glb zijn.`);
  return { file: base + value.file };
}
export function model3DAssets(characters, enemies) {
  return [...characters, ...enemies].flatMap(profile => profile.model3d ? [profile.model3d.file] : []);
}
