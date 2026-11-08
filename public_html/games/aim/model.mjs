export function create(random=Math.random){return {kind:'aim',state:'playing',score:0,shots:0,angle:55,power:560,ball:null,time:0};}
export function shootSmallBall(g) {
  if(g.kind!=='aim'||g.state!=='playing'||g.ball||g.shots>=5)return false;
  const a=g.angle*Math.PI/180;g.ball={x:90,y:360,vx:Math.cos(a)*g.power,vy:-Math.sin(a)*g.power};g.shots++;return true;
}
export function step(g,input={},dt=1/60){if(g.state!=='playing')return;dt=Math.max(0,Math.min(dt,.05));g.time+=dt;
    if(!g.ball){g.angle=Math.max(20,Math.min(80,g.angle+((input.up?1:0)-(input.down?1:0))*40*dt));g.power=Math.max(300,Math.min(750,g.power+((input.right?1:0)-(input.left?1:0))*250*dt));}
    if(input.action)shootSmallBall(g);
    if(g.ball){const b=g.ball,oldY=b.y;b.vy+=520*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.vy>0&&oldY<=300&&b.y>=300&&Math.abs(b.x-650)<43){g.score++;g.ball=null;}
      else if(b.y>410||b.x>820)g.ball=null;
      if(!g.ball&&g.shots===5)g.state='won';
    }

}
