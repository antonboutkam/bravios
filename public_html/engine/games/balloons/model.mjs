export function create(){return {kind:'balloons',state:'playing',score:0,time:0,selected:0,
  balloons:Array.from({length:10},(_,i)=>({x:110+(i%5)*145,y:105+Math.floor(i/5)*135,r:28,color:['#f28f99','#ffd168','#8acb9b','#91bde8','#be9edb'][i%5],alive:true}))};}
export function popSmallBalloon(g,x,y) {
  if(g.kind!=='balloons'||g.state!=='playing')return false;
  const b=g.balloons.find(b=>b.alive&&Math.hypot(x-b.x,y-b.y)<b.r+8);
  if(!b)return false;b.alive=false;g.score++;g.selected=g.balloons.findIndex(b=>b.alive);if(g.score===10)g.state='won';return true;
}
export function step(g,input={},dt=1/60){if(g.state!=='playing')return;g.time+=Math.max(0,Math.min(dt,.05));if(input.action)action(g);}
export function action(g){if(g.selected>=0){const b=g.balloons[g.selected];return popSmallBalloon(g,b.x,b.y);}}
export function choose(g,delta){for(let i=1;i<=10;i++){const n=(g.selected+delta*i+20)%10;if(g.balloons[n].alive){g.selected=n;return;}}}
