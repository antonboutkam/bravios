// Asset keys are relative to public_html, regardless of the importing module's folder.
export function publicURL(path) {
  return new URL(path, new URL('../', import.meta.url));
}
export const assetURL = path => globalThis.braviosAssets?.[path] || publicURL(path).href;
