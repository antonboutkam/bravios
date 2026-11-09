export const RHYTHM_DURATION = 180;
export function rhythmTempo(time) {
  const progress = Math.max(0, Math.min(1, (time - 60) / 120));
  return { interval: 2.8 - progress * 1.4, speed: 200 + progress * 180 };
}
export function createRhythmGame(playerCount = 1) {
  const body = (x, extra) => ({ x, lift: 0, vy: 0, alive: true, ...extra });
  return { kind: 'rhythm', state: 'playing', paused: false, time: 0, nextBall: 3, balls: [], beat: 0,
    playerCount: playerCount === 2 ? 2 : 1,
    players: (playerCount === 2 ? [372, 428] : [400]).map((x,i) => body(x,{character:i?'ravi':'boaz'})),
    monsters: [92,158,224,290,510,576,642,708].map((x,i) => body(x,{tile:[6,17,18,19,20,21,6,17][i], failAt:75+i*14, lastBall:0})),
    previousJump: [false,false] };
}
export function jumpRhythm(g, index = 0) {
  const p = g.players[index];
  if(g.state !== 'playing' || g.paused || !p?.alive || p.lift > 0 || p.vy !== 0) return false;
  p.vy=620; return true;
}
export function stepRhythmGame(g, input = {}, dt = 1/60) {
  if(g.state !== 'playing' || g.paused) return;
  for(let i=0;i<2;i++) {
    const pressed=!!input[i?'jump2':'jump'];
    if(pressed&&!g.previousJump[i])jumpRhythm(g,i);
    g.previousJump[i]=pressed;
  }
  let remaining=Math.max(0,Math.min(.25,dt));
  while(remaining>1e-8 && g.state==='playing') {
    const step=Math.min(remaining,1/120); remaining-=step; g.time+=step;
    if(g.time>=g.nextBall && g.time<RHYTHM_DURATION) {
      const tempo=rhythmTempo(g.time);
      g.balls.push({x:-34,r:29,speed:tempo.speed,id:++g.beat});g.nextBall+=tempo.interval;
    }
    for(const m of g.monsters) if(m.alive && m.lift===0 && m.vy===0 && g.time<m.failAt) {
      const b=g.balls.find(b=>b.x<m.x && (m.x-b.x)/b.speed<.38 && b.id!==m.lastBall);
      if(b){m.vy=620;m.lastBall=b.id;}
    }
    for(const p of [...g.players,...g.monsters]) if(p.alive) {
      p.vy-=1400*step;p.lift=Math.max(0,p.lift+p.vy*step);if(p.lift===0)p.vy=0;
    }
    for(const b of g.balls) {
      b.x+=b.speed*step;
      for(const p of [...g.players,...g.monsters]) if(p.alive) {
        // Circle against a narrow character body; fixed substeps retain contact at high speed.
        const dx=b.x-Math.max(p.x-12,Math.min(p.x+12,b.x));
        const cy=374-29,top=374-p.lift-48,bottom=374-p.lift;
        const dy=cy-Math.max(top,Math.min(bottom,cy));
        if(dx*dx+dy*dy<b.r*b.r){p.alive=false;p.outAt=g.time;}
      }
    }
    g.balls=g.balls.filter(b=>b.x<840);
    if(!g.players.some(p=>p.alive))g.state='over';
    else if(g.monsters.every(m=>!m.alive))g.state='won';
  }
}
