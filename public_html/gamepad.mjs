// Browser-standard layout: positions stay the same across Xbox / PlayStation labels.
export function emptyGamepadControls() {
  return { left: false, right: false, jump: false, fire: false, mount: false, pipe: false };
}

export class GamepadInput {
  constructor() { this.index = null; this.previous = {}; }

  poll(navigatorObject, enabled = true, excludedIndex = null) {
    let pads;
    try { pads = Array.from(navigatorObject.getGamepads()); }
    catch { this.index = null; this.previous = {}; return { controls: emptyGamepadControls(), pressed: [], status: 'unavailable' }; }
    const supported = pads.filter(pad => pad?.connected && pad.mapping === 'standard' && pad.index !== excludedIndex);
    const pad = supported.find(pad => pad.index === this.index) || supported[0];
    if (!pad) {
      this.index = null; this.previous = {};
      return { controls: emptyGamepadControls(), pressed: [], status: pads.some(pad => pad?.connected) ? 'unsupported' : 'waiting' };
    }
    if (pad.index !== this.index) this.previous = {};
    this.index = pad.index;
    const down = index => !!pad.buttons[index]?.pressed || pad.buttons[index]?.value > .5;
    const controls = {
      left: down(14) || pad.axes[0] < -.25,
      right: down(15) || pad.axes[0] > .25,
      jump: down(0),
      fire: down(2) || down(1),
      mount: down(3),
      pipe: down(13) || pad.axes[1] > .5,
    };
    const current = { ...controls, up: down(12) || pad.axes[1] < -.5, pause: down(9) };
    const pressed = Object.keys(current).filter(action => current[action] && !this.previous[action]);
    this.previous = current;
    return { navigation: enabled ? {left:current.left,right:current.right,up:current.up,down:current.pipe} : {left:false,right:false,up:false,down:false}, controls: enabled ? controls : emptyGamepadControls(), pressed: enabled ? pressed : [], status: 'connected', name: pad.id };
  }
}
