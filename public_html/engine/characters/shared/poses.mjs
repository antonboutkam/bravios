export const REQUIRED_POSES = ['idle', 'side', 'run', 'jump', 'victory', 'land', 'ride'];
export const RUN_POSES = ['run-1', 'run-2', 'run-3', 'run-4'];
export const WALK_POSES = ['walk-1', 'walk-2', 'walk-3', 'walk-4'];
export const IDLE_FRAME_SECONDS = .5;
const cycles = new WeakMap();
export function animationFrames(poses, action) {
  let result = cycles.get(poses);
  if (!result) { result = {}; cycles.set(poses, result); }
  return result[action] ||= Object.keys(poses).filter(key => new RegExp(`^${action}-[1-9][0-9]*$`).test(key)).sort((a,b) => Number(a.split('-')[1]) - Number(b.split('-')[1]));
}

// Both browser preparation and build validation use the dimensions actually drawn.
export function poseCanvasSize(width, height) {
  const scale = Math.min(1, 384 / Math.max(width, height));
  return [Math.round(width * scale), Math.round(height * scale)];
}

export function rollingPose(poses, settings, pose) {
  return settings.runAnimation === 'roll' && !animationFrames(poses, 'run').length && !!pose.running && !pose.airborne && !pose.won && !(pose.landing > .04);
}

export function characterPose(poses, { won = false, landing = 0, airborne = false, walking = false, running = false, front = false, time = 0, reducedMotion = false } = {}) {
  if (won) return 'victory';
  if (landing > .04) return 'land';
  if (airborne) return 'jump';
  if (!walking && !running) {
    const idle = animationFrames(poses, 'idle');
    if (idle.length) {
      const frames = ['idle', ...idle];
      return frames[reducedMotion ? 0 : Math.floor(Math.max(0, time) / IDLE_FRAME_SECONDS) % frames.length];
    }
    return front ? 'idle' : 'side';
  }
  const action = running ? 'run' : 'walk';
  let frames = animationFrames(poses, action);
  // Old characters with only run poses remain usable without migration.
  if (!frames.length && !poses[action]) frames = animationFrames(poses, running ? 'walk' : 'run');
  if (!frames.length) return poses[action] ? action : poses.walk ? 'walk' : 'run';
  const index = reducedMotion ? 0 : Math.floor(Math.max(0, time) / .09) % frames.length;
  return frames[index];
}
