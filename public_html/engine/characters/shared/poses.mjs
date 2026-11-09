export const REQUIRED_POSES = ['idle', 'side', 'run', 'jump', 'victory', 'land', 'ride'];
export const RUN_POSES = ['run-1', 'run-2', 'run-3', 'run-4'];

export function characterPose(poses, { won = false, landing = 0, airborne = false, running = false, front = false, time = 0, reducedMotion = false } = {}) {
  if (won) return 'victory';
  if (landing > .04) return 'land';
  if (airborne) return 'jump';
  if (!running) return front ? 'idle' : 'side';
  if (!RUN_POSES.every(frame => poses[frame])) return 'run';
  const index = reducedMotion ? 0 : Math.floor(Math.max(0, time) / .09) % RUN_POSES.length;
  return RUN_POSES[index];
}
