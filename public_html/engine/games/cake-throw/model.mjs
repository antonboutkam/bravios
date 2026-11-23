export const CAKE_RULES = { duration:90, target:7, speed:5, throwSpeed:15, gravity:5, cartInterval:2.2, cartCapacity:3, carryCapacity:2 };
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function createCakeGame(playerCount=1,identities=[],random=Math.random) {
  if(![1,2].includes(playerCount))throw new Error('Kies één of twee spelers.');
  return {kind:'cake-throw',state:'playing',paused:false,playerCount,time:0,winner:null,random,nextId:1,aiDecision:0,aiTarget:0,aiThrow:2.4,
    players:[-1,1].map((side,i)=>({id:identities[i]?.id||`player-${i+1}`,character:identities[i]?.character,name:identities[i]?.name|| (i===1&&playerCount===1?'De bakker':`Speler ${i+1}`),side,x:side*5,z:0,cakes:0,score:0,cooldown:0,pickup:0,stunned:0,splat:0,throwTime:0,moving:false,angle:-side*Math.PI/2})),
    carts:[-1,1].map(side=>({side,x:side*8.2,z:0,stock:3,timer:0})),cakes:[],splashes:[]};
}
export function throwCake(game,index=0) {
  const p=game.players[index],target=game.players[1-index];
  if(game.state!=='playing'||game.paused||!p||p.cakes<=0||p.cooldown>0||p.stunned>0)return false;
  const dx=target.x-p.x,dz=target.z-p.z,length=Math.hypot(dx,dz)||1;
  p.cakes--;p.cooldown=.55;p.throwTime=.3;
  game.cakes.push({id:game.nextId++,owner:index,x:p.x+dx/length*.55,y:1.2,z:p.z+dz/length*.55,vx:dx/length*CAKE_RULES.throwSpeed,vy:2.1,vz:dz/length*CAKE_RULES.throwSpeed,age:0});
  return true;
}
function settle(game) {
  const [a,b]=game.players;
  if(Math.max(a.score,b.score)<CAKE_RULES.target && game.time<CAKE_RULES.duration)return;
  game.winner=a.score===b.score?null:a.score>b.score?0:1;
  game.state=game.winner===null?'draw':game.playerCount===1&&game.winner===1?'over':'won';
}
function computerInput(game,dt) {
  const p=game.players[1],target=game.players[0],cart=game.carts[1];
  game.aiDecision-=dt;game.aiThrow-=dt;
  if(game.aiDecision<=0){game.aiDecision=.35+game.random()*.25;game.aiTarget=clamp(target.z+(game.random()-.5)*1.2,-4.2,4.2);}
  const reload=p.cakes===0;
  let x=reload?cart.x:5,z=reload?0:game.aiTarget;
  const incoming=game.cakes.find(c=>c.owner===0&&Math.abs(c.x-p.x)<3&&Math.abs(c.z-p.z)<.8);
  if(incoming&&!reload)z=clamp(p.z+(p.z>0?-1:1)*1.8,-4.4,4.4);
  if(!reload&&game.aiThrow<=0){throwCake(game,1);game.aiThrow=1.1+game.random()*.75;}
  return {left:p.x>x+.15,right:p.x<x-.15,up:p.z>z+.15,down:p.z<z-.15};
}
function hitOnSegment(c,previous,p) {
  const dx=c.x-previous.x,dz=c.z-previous.z,length=dx*dx+dz*dz;
  const t=length?clamp(((p.x-previous.x)*dx+(p.z-previous.z)*dz)/length,0,1):0;
  const height=previous.y+(c.y-previous.y)*t;
  return height>.15&&height<1.8&&Math.hypot(previous.x+dx*t-p.x,previous.z+dz*t-p.z)<.57;
}
export function stepCakeGame(game,input={},dt=1/120) {
  if(game.state!=='playing'||game.paused||!Number.isFinite(dt)||dt<=0)return;
  // Session updates use fixed small steps; direct callers cannot tunnel through an actor.
  if(dt>1/60){let remaining=Math.min(dt,.25);while(remaining>0){const step=Math.min(remaining,1/120);stepCakeGame(game,input,step);remaining-=step;}return;}
  game.time=Math.min(CAKE_RULES.duration,game.time+dt);
  const controls=input.players||[input,{}];
  const bot=game.playerCount===1?computerInput(game,dt):null;
  for(const cart of game.carts){cart.timer+=dt;while(cart.timer>=CAKE_RULES.cartInterval){cart.timer-=CAKE_RULES.cartInterval;cart.stock=Math.min(CAKE_RULES.cartCapacity,cart.stock+1);}}
  for(const [i,p] of game.players.entries()){
    for(const key of ['cooldown','pickup','stunned','splat','throwTime'])p[key]=Math.max(0,p[key]-dt);
    const control=i===1&&bot?bot:controls[i]||{};
    let x=Number(!!control.right)-Number(!!control.left),z=Number(!!control.down)-Number(!!control.up);
    const length=Math.hypot(x,z)||1;x/=length;z/=length;
    p.moving=p.stunned===0&&!!(x||z);
    if(p.moving){p.x=clamp(p.x+x*CAKE_RULES.speed*dt,p.side<0?-7.2:1.7,p.side<0?-1.7:7.2);p.z=clamp(p.z+z*CAKE_RULES.speed*dt,-4.4,4.4);}
    const target=game.players[1-i];p.angle=Math.atan2(target.x-p.x,target.z-p.z);
    const cart=game.carts[i];
    if(p.stunned===0&&p.pickup===0&&p.cakes<CAKE_RULES.carryCapacity&&cart.stock>0&&Math.hypot(cart.x-p.x,cart.z-p.z)<1.55){cart.stock--;p.cakes++;p.pickup=.65;}
  }
  const flying=[];
  for(const cake of game.cakes){
    const previous={x:cake.x,y:cake.y,z:cake.z};cake.age+=dt;cake.vy-=CAKE_RULES.gravity*dt;cake.x+=cake.vx*dt;cake.y+=cake.vy*dt;cake.z+=cake.vz*dt;
    const target=game.players[1-cake.owner];
    if(target.splat<.65&&hitOnSegment(cake,previous,target)){
      game.players[cake.owner].score++;target.stunned=.3;target.splat=1.3;
      game.splashes.push({id:cake.id,x:target.x,z:target.z,y:1.2,life:.7});
    }else if(cake.y<=.12||Math.abs(cake.x)>10||Math.abs(cake.z)>6||cake.age>2.5){
      game.splashes.push({id:cake.id,x:cake.x,z:cake.z,y:.04,life:.65});
    }else flying.push(cake);
  }
  game.cakes=flying;
  for(const splash of game.splashes)splash.life-=dt;
  game.splashes=game.splashes.filter(s=>s.life>0);
  settle(game);
}
