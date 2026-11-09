import test from 'node:test';
import assert from 'node:assert/strict';
import { GamepadInput, emptyGamepadControls } from '../gamepad.mjs';
import { blankLevel, createGame, stepGame } from '../engine.mjs';
import { createCoopGame, stepCoopGame, remoteControls } from '../coop.mjs';

const pad = (index = 0) => ({ index, id: 'Test controller', connected: true, mapping: 'standard', axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) });
function setup() {
  const device = pad(), devices = [device], controller = new GamepadInput();
  return { device, devices, poll: (enabled = true) => controller.poll({ getGamepads: () => devices }, enabled) };
}

test('stick dead zone, d-pad and every action use the standard layout', () => {
  const { device, poll } = setup();
  device.axes = [.2, .2]; assert.deepEqual(poll().controls, emptyGamepadControls());
  device.axes = [-.6, .8]; let sample = poll(); assert.ok(sample.controls.left && sample.controls.pipe); assert.equal(sample.controls.right, false);
  device.axes = [.7, 0]; assert.ok(poll().controls.right);
  device.axes = [0, 0];
  for (const [button, action] of [[0, 'jump'], [1, 'fire'], [2, 'fire'], [3, 'mount'], [9, 'pause'], [13, 'pipe'], [14, 'left'], [15, 'right']]) {
    device.buttons[button].pressed = true;
    sample = poll(); assert.ok(sample.pressed.includes(action));
    assert.equal(poll().pressed.includes(action), false, 'held buttons do not repeat taps');
    device.buttons[button].pressed = false; poll();
  }
});

test('inactive page consumes button edges without sending input', () => {
  const { device, poll } = setup();
  device.buttons[9].pressed = true; device.buttons[0].pressed = true; device.axes[0] = 1;
  assert.deepEqual(poll(false).controls, emptyGamepadControls());
  assert.deepEqual(poll(false).pressed, []);
  assert.deepEqual(poll().pressed, [], 'held Start must not resume after closing a dialog');
  device.buttons[9].pressed = false; poll(); device.buttons[9].pressed = true;
  assert.ok(poll().pressed.includes('pause'));
});

test('disconnect releases controls; reconnect and sparse device lists work', () => {
  const { device, devices, poll } = setup();
  device.buttons[0].pressed = true; assert.ok(poll().controls.jump);
  devices[0] = null; assert.deepEqual(poll().controls, emptyGamepadControls()); assert.equal(poll().status, 'waiting');
  devices[2] = pad(2); devices[2].buttons[0].pressed = true;
  assert.ok(poll().pressed.includes('jump'));
  devices[0] = device; assert.ok(poll().controls.jump); // keeps the selected controller
  devices[2].buttons[0].pressed = false; assert.equal(poll().controls.jump, false);
});

test('missing, denied or nonstandard Gamepad API fails safely', () => {
  const controller = new GamepadInput();
  assert.equal(controller.poll({}).status, 'unavailable');
  assert.equal(controller.poll({ getGamepads() { throw new Error('denied'); } }).status, 'unavailable');
  const device = pad(); device.mapping = ''; device.buttons[0].pressed = true;
  const sample = controller.poll({ getGamepads: () => [device] });
  assert.equal(sample.status, 'unsupported'); assert.deepEqual(sample.controls, emptyGamepadControls());
});

test('controller moves and jumps in the real solo engine and through guest packets', () => {
  const { device, poll } = setup(), level = blankLevel(40), game = createGame(level);
  for (let i = 0; i < 120; i++) stepGame(game, {});
  const x = game.player.x, y = game.player.y;
  device.axes[0] = 1; device.buttons[0].pressed = true;
  for (let i = 0; i < 20; i++) stepGame(game, poll().controls);
  assert.ok(game.player.x > x); assert.ok(game.player.y < y);
  const coop = createCoopGame(level, 'boaz');
  for (let i = 0; i < 120; i++) stepCoopGame(coop, [{}, {}]);
  const guestX = coop.players[1].x;
  for (let i = 0; i < 20; i++) stepCoopGame(coop, [{}, remoteControls(poll().controls, {})]);
  assert.ok(coop.players[1].x > guestX);
});

test('upward d-pad and stick produce a distinct menu press without jumping', () => {
  const input = new GamepadInput();
  const pad = { index: 0, connected: true, mapping: 'standard', id: 'Menu test', axes: [0,0], buttons: Array.from({length:16},()=>({pressed:false,value:0})) };
  const nav = { getGamepads: () => [pad] };
  pad.buttons[12].pressed=true;
  let sample=input.poll(nav,true);assert.ok(sample.pressed.includes('up'));assert.equal(sample.controls.jump,false);
  assert.ok(!input.poll(nav,true).pressed.includes('up'));
  pad.buttons[12].pressed=false;input.poll(nav,true);pad.axes[1]=-.8;
  sample=input.poll(nav,true);assert.ok(sample.pressed.includes('up'));assert.equal(sample.controls.jump,false);
});

test('twee minigamecontrollers krijgen afzonderlijke sprongflanken, ook bij ontkoppelen', () => {
  const first=new GamepadInput(),second=new GamepadInput(),devices=[pad(0),pad(1)];
  const nav={getGamepads:()=>devices};
  devices[0].buttons[0].pressed=true;
  assert.ok(first.poll(nav).pressed.includes('jump'));
  assert.ok(!second.poll(nav,true,first.index).pressed.includes('jump'));
  devices[1].buttons[0].pressed=true;
  assert.ok(second.poll(nav,true,first.index).pressed.includes('jump'));
  assert.deepEqual(second.poll(nav,true,first.index).pressed,[]);
  devices[0]=null;
  first.poll(nav);
  assert.equal(first.index,1);
  assert.deepEqual(second.poll(nav,true,first.index).controls,emptyGamepadControls());
});

test('continue richtingen werken in minigames en vallen weg bij focusverlies', () => {
  const {device,poll}=setup();device.axes=[.8,-.8];
  assert.deepEqual(poll().navigation,{left:false,right:true,up:true,down:false});
  assert.deepEqual(poll().navigation,{left:false,right:true,up:true,down:false});
  assert.deepEqual(poll(false).navigation,{left:false,right:false,up:false,down:false});
});
