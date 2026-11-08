export function create(random=Math.random){return {kind:'catch',state:'playing',score:0,misses:0,basket:400,fruit:null,spawn:0,time:0,random};}
export function step(g,input={},dt=1/60){if(g.state!=='playing')return;dt=Math.max(0,Math.min(dt,.05));g.time+=dt;
    g.basket=Math.max(50,Math.min(750,g.basket+((input.right?1:0)-(input.left?1:0))*440*dt));
    if(!g.fruit){g.spawn-=dt;if(g.spawn<=0){g.fruit={x:60+g.random()*680,y:-20};g.spawn=.35;}}
    if(g.fruit){const f=g.fruit;f.y+=(115+g.score*6)*dt;
      if(f.y>=367&&f.y<=405&&Math.abs(f.x-g.basket)<54){g.score++;g.fruit=null;}
      else if(f.y>445){g.misses++;g.fruit=null;}
    }
    if(g.score>=10||g.misses>=5)g.state=g.score>=10?'won':'over';
}
