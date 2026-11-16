export function movement3D(keys, touch, sample = {}) {
  const nav=sample.navigation || {};
  return {
    x:Number(!!(keys.has('ArrowRight')||keys.has('KeyD')||touch.has('right')||nav.right))-Number(!!(keys.has('ArrowLeft')||keys.has('KeyA')||touch.has('left')||nav.left)),
    z:Number(!!(keys.has('ArrowDown')||keys.has('KeyS')||touch.has('down')||nav.down))-Number(!!(keys.has('ArrowUp')||keys.has('KeyW')||touch.has('up')||nav.up))
  };
}
