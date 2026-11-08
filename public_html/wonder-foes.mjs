// Character identities and palettes from assets/wonderland/bosses/data/bosses.json.
export const WONDER_FOES = [
  {
    "id": "blubberus",
    "number": 1,
    "name": "Blubberus the Slime King",
    "realm": "The Slime Kingdom",
    "primary_color": "#8D42EF",
    "secondary_color": "#B99AFF",
    "accent_color": "#F7C746",
    "silhouette": "wide seven-eyed jelly blob with golden crown",
    "materials": [
      "translucent jelly",
      "polished crown metal"
    ],
    "signature_animation": "wobble and bounce",
    "arena_feature": "wobbling jelly tiles",
    "attacks": [
      "Royal Belly Flop",
      "Mini-Me Mayhem",
      "Super Sneeze"
    ],
    "weakness": "Hit the crown when it flies off during a sneeze.",
    "hit_windows": 3,
    "reward_ability": "Slime Bounce",
    "defeat_form": "a giggling jelly mound",
    "boss_file": "bosses/01-blubberus-the-slime-king.md"
  },
  {
    "id": "wafzilla",
    "number": 2,
    "name": "Wafzilla the Terrible",
    "realm": "The Candy Castle",
    "primary_color": "#DF9F39",
    "secondary_color": "#FFF0D9",
    "accent_color": "#E8425A",
    "silhouette": "tall rectangular waffle with syrup cannons and butter feet",
    "materials": [
      "crisp waffle",
      "whipped cream",
      "sticky syrup"
    ],
    "signature_animation": "slip and skate",
    "arena_feature": "swinging spoon bridges and pancake platforms",
    "attacks": [
      "Syrup Splash",
      "Flying Pancake",
      "Breakfast Rush"
    ],
    "weakness": "Knock butter beneath his feet to make him slip, then hit the waffle emblem.",
    "hit_windows": 3,
    "reward_ability": "Syrup Swing",
    "defeat_form": "a stack of smiling tiny waffles",
    "boss_file": "bosses/02-wafzilla-the-terrible.md"
  },
  {
    "id": "sockstein",
    "number": 3,
    "name": "Sockstein",
    "realm": "Lost Sock Island",
    "primary_color": "#1FA9A2",
    "secondary_color": "#4D6CB5",
    "accent_color": "#F68D43",
    "silhouette": "gangly patchwork figure with eight knitted arms",
    "materials": [
      "knitted sock fabric",
      "stitched seams"
    ],
    "signature_animation": "flail and spiral",
    "arena_feature": "rotating clothesline bridges and giant washing machine",
    "attacks": [
      "Stinky Sock Toss",
      "Vacuum Vortex",
      "Eight-Arm Whirl"
    ],
    "weakness": "Activate the washing machine to make him dizzy and remove his sock helmet.",
    "hit_windows": 3,
    "reward_ability": "Sock Cyclone",
    "defeat_form": "a friendly conga line of paired socks",
    "boss_file": "bosses/03-sockstein.md"
  },
  {
    "id": "tick_tock",
    "number": 4,
    "name": "Tick-Tock the Time Eater",
    "realm": "The Backwards Clockwork",
    "primary_color": "#B48A41",
    "secondary_color": "#41C3C0",
    "accent_color": "#FF6D5A",
    "silhouette": "tall alarm clock with twelve clock-hand arms and spring legs",
    "materials": [
      "antique brass",
      "glass",
      "painted gears"
    ],
    "signature_animation": "tick, stretch and spring",
    "arena_feature": "swinging pendulum tiles on a giant clock face",
    "attacks": [
      "Minute-Hand Sweep",
      "Tick-Tock Freeze",
      "Backwards Hour"
    ],
    "weakness": "Press the red alarm button when both clock hands point to twelve.",
    "hit_windows": 3,
    "reward_ability": "Time Pause",
    "defeat_form": "a polite little pocket watch",
    "boss_file": "bosses/04-tick-tock-the-time-eater.md"
  },
  {
    "id": "dj_thunderfluff",
    "number": 5,
    "name": "DJ Thunderfluff",
    "realm": "Thunder Disco",
    "primary_color": "#F76FB9",
    "secondary_color": "#3ADCF3",
    "accent_color": "#31304C",
    "silhouette": "round floating pink thundercloud with sunglasses and speaker mittens",
    "materials": [
      "soft cloud fluff",
      "glossy sunglasses",
      "electric lightning"
    ],
    "signature_animation": "pulse and bob to a beat",
    "arena_feature": "swaying dance-floor tiles",
    "attacks": [
      "Lightning Beat",
      "Bass Blast",
      "Dance-Off"
    ],
    "weakness": "Repeat a visible four-step dance sequence to trigger confetti.",
    "hit_windows": 3,
    "reward_ability": "Beat Dash",
    "defeat_form": "a friendly DJ cloud",
    "boss_file": "bosses/05-dj-thunderfluff.md"
  },
  {
    "id": "crumblecastle",
    "number": 6,
    "name": "Crumblecastle the Walking Fortress",
    "realm": "The Wandering Castle",
    "primary_color": "#5F9660",
    "secondary_color": "#C2AE80",
    "accent_color": "#AA3B48",
    "silhouette": "asymmetric castle with towers, drawbridge mouth and four chicken legs",
    "materials": [
      "moss-covered masonry",
      "wooden drawbridge",
      "fabric flag"
    ],
    "signature_animation": "cluck and stomp",
    "arena_feature": "wobbling flagstones and changing bridges",
    "attacks": [
      "Furniture Cannon",
      "Chicken-Leg Stomp",
      "Drawbridge Chomp"
    ],
    "weakness": "Climb his lowered leg and pull the red flag from the tallest tower.",
    "hit_windows": 3,
    "reward_ability": "Castle Stomp",
    "defeat_form": "a cozy small playhouse",
    "boss_file": "bosses/06-crumblecastle-the-walking-fortress.md"
  },
  {
    "id": "princess_mirrorphantom",
    "number": 7,
    "name": "Princess Mirrorphantom",
    "realm": "The Mirror Palace",
    "primary_color": "#BDC6DE",
    "secondary_color": "#A28CDF",
    "accent_color": "#265FD1",
    "silhouette": "long chameleon with three faces, faceted mirror wings and coiled tail",
    "materials": [
      "shimmering scales",
      "faceted mirrors"
    ],
    "signature_animation": "glide and shimmer",
    "arena_feature": "swinging mirror tiles and rotating reflection panels",
    "attacks": [
      "Mirror Multiplication",
      "Invisible Spin",
      "Reflection Shuffle"
    ],
    "weakness": "Find the one reflection with a red nose, then activate the mirror button.",
    "hit_windows": 3,
    "reward_ability": "Mirror Twin",
    "defeat_form": "a friendly princess with silly mirror faces",
    "boss_file": "bosses/07-princess-mirrorphantom.md"
  },
  {
    "id": "emperor_wobbleflap",
    "number": 8,
    "name": "Emperor Wobbleflap the Everything-Eater",
    "realm": "The Edge of Wonderland",
    "primary_color": "#24235F",
    "secondary_color": "#5E378A",
    "accent_color": "seven distinct rainbow gemstones",
    "silhouette": "huge three-headed six-armed figure with a starry belly and floating crown",
    "materials": [
      "soft indigo hide",
      "star-field belly",
      "glowing gemstones"
    ],
    "signature_animation": "transform and wobble",
    "arena_feature": "patchwork platform with seven previous-realm mechanics",
    "attacks": [
      "Slime and Syrup Remix",
      "Clock and Thunder Remix",
      "Castle and Mirror Remix"
    ],
    "weakness": "Use the seven unlocked abilities to remove the seven crown gems, then cooperate on two switches.",
    "hit_windows": 7,
    "reward_ability": "Wonderland Restored",
    "defeat_form": "a tiny white bunny",
    "boss_file": "bosses/08-emperor-wobbleflap.md"
  }
];

export const WONDER_ENCOUNTERS = [0,1,2,3,4,5,6,0,1,2,3,4,5,6,7];
const foeOverlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export const WONDER_FOE_HINTS = [
  'Wacht op de nies. Spring op de glinsterende kroon!',
  'Stap tijdens de glij-aanval op de boterknop. Raak daarna de wafel!',
  'Stap op beide wasknoppen. Spring daarna op de duizelige sok!',
  'Wacht tot de wijzers op twaalf staan. Spring op de rode wekkerknop!',
  'Volg de voetstappen: links, rechts, links, rechts. Je hoeft niet snel te zijn.',
  'Klim via de kussens omhoog. Pak de rode vlag als het kasteel zit!',
  'Zoek de spiegel met de rode neus. Stap op de blauwe knop eronder!',
  'Volg de zeven tekens. Stap op beide sterrenplaten en raak de kroon!'
];
export function wonderVariant(index) {
  return { palette_id:index%3, body_variant:Math.floor(index/3)%2, face_pattern:Math.floor(index/6)%2, accessory:Math.floor(index/12), animation_id:index%2 };
}
export function createWonderFoe(type,index,x,{boss=false,field=0}={}) {
  const info=WONDER_FOES[type],v=wonderVariant(index);
  const shape=[[36,25],[24,34],[28,34],[23,34],[36,25],[32,34],[38,26],[36,34]][type];
  const scale=boss?2.4:1+(v.body_variant? .12:0),w=Math.round(shape[0]*scale),h=Math.round(shape[1]*scale);
  return {kind:'wonder',wonderType:type,foeId:info.id,...v,x,y:18*32-h,w,h,baseY:18*32-h,vx:0,vy:0,facing:-1,grounded:true,
    alive:true,boss,hp:boss?info.hit_windows:1,maxHp:boss?info.hit_windows:1,hitCooldown:0,safe:0,frozen:0,bubbled:false,
    phase:boss?'sleep':'patrol',phaseTime:0,cycle:0,firstDemo:true,activated:false,puzzleProgress:0,puzzleTime:0,padTouch:-1,
    arenaLeft:boss?158*32:x-64,arenaRight:boss?185*32:x+96,field,escape:boss&&field<7,exitTime:0,defeated:false};
}
export function populateWonderFoes(game,index) {
  const type=WONDER_ENCOUNTERS[index];
  // Keep the final arena free of incidental platforms and leave a clear jumping lane.
  for(let y=1;y<18;y++)for(let x=157;x<187;x++)game.tiles[y][x]=0;
  game.enemies=[];
  const slots=[38,76,113,143];
  for(let i=0;i<slots.length;i++){
    // Avoid the low tunnel and puzzle wall; each ordinary spawn has a unique signature.
    const localType=i<2?type:(type+i)%WONDER_FOES.length;
    game.enemies.push(createWonderFoe(localType,index*4+i,slots[i]*32,{field:index}));
  }
  const boss=createWonderFoe(type,0,175*32,{boss:true,field:index});
  game.enemies.push(boss);
  // Fire is an optional aid. Every encounter can also be solved without a power-up.
  game.tiles[17][155]=15;
  game.totalCoins=game.tiles.flat().filter(id=>id===4||id===3).length;
  game.wonderland.bossType=type;
  game.wonderland.bossOutcome='';
  if(type===5)for(const [x,y] of [[167,17],[169,16],[171,15]])game.wonderland.objects.push({kind:'bossStep',x:x*32,y:y*32,w:48,h:12,oneWay:true});
  return boss;
}
export function wonderBossPads(enemy) {
  if(!enemy.boss||enemy.defeated)return [];
  const type=enemy.wonderType,left=enemy.arenaLeft+32,y=18*32-12;
  if(![1,2,4,6,7].includes(type))return [];
  const count=type===6?3:2;
  return Array.from({length:count},(_,i)=>({x:left+i*72,y,w:40,h:12,index:i,
    active:type===6?i===(enemy.maxHp-enemy.hp)%3:type===4?i===[0,1,0,1][enemy.puzzleProgress]:type===7?i===enemy.puzzleProgress:i===enemy.puzzleProgress}));
}
function finishWonderFoe(game,enemy) {
  enemy.alive=false;enemy.defeated=true;enemy.exitTime=1.8;enemy.vx=0;enemy.vy=0;
  if(enemy.boss){
    const info=WONDER_FOES[enemy.wonderType];
    game.wonderland.bossOutcome=enemy.escape?`${info.name} ontsnapt in een toverwolk. Die komt later terug!`:enemy.wonderType===7?'Wobbleflap verandert in een klein wit konijn. Wonderland is gered!':`${info.name} wordt vriendelijk en maakt de weg vrij!`;
    game.wonderland.reward=info.reward_ability;
    game.hazards=game.hazards.filter(h=>h.wonderOwner!==enemy.field);
  }
  game.events.push('stomp');
}
export function hitWonderFoe(game,enemy,kind='fire') {
  if(!enemy.alive||enemy.hitCooldown>0)return false;
  if(enemy.boss&&enemy.phase!=='exposed')return false;
  if(enemy.boss&&['ice','bubble'].includes(kind))return false;
  enemy.hp--;enemy.hitCooldown=enemy.boss?.7:.15;
  if(enemy.hp<=0)finishWonderFoe(game,enemy);
  else if(enemy.boss){enemy.phase='rest';enemy.phaseTime=0;enemy.puzzleProgress=0;enemy.puzzleTime=0;game.events.push('coin');}
  return true;
}
function openWonderFoe(enemy) {enemy.phase='exposed';enemy.phaseTime=0;enemy.vx=0;}
function wonderAttack(game,enemy) {
  const type=enemy.wonderType,player=game.player;
  if(enemy.firstDemo){enemy.firstDemo=false;return;}
  const target=enemy.targetX??Math.max(enemy.arenaLeft,Math.min(enemy.arenaRight-44,player.x));
  const add=(x,y,w,h,vx=0,vy=0,life=2.5,effect='hurt')=>game.hazards.push({kind:'wonder',wonderType:type,wonderOwner:enemy.field,x,y,w,h,vx,vy,life,effect});
  if(type===0||type===5)add(target,18*32-10,64,10,-35,0,1.2);
  else if(type===1||type===2)add(target,18*32-8,64,8,0,0,3,'slow');
  else if(type===4)add(target,18*32-76,26,76,0,0,.45);
  else if(type===3)add(enemy.x-90,18*32-12,70,12,-65,0,2);
  else if(type===6)add(enemy.x-48,enemy.y+enemy.h-18,18,18,-80,0,2);
  else {
    const remix=(enemy.maxHp-enemy.hp)%7;
    add(target,18*32-(remix===4?76:10),remix===4?26:64,remix===4?76:10,0,0,1.2,remix===1||remix===2?'slow':'hurt');
  }
}
export function stepWonderFoe(game,enemy,dt,moveBody) {
  enemy.hitCooldown=Math.max(0,enemy.hitCooldown-dt);enemy.safe=Math.max(0,enemy.safe-dt);
  if(enemy.frozen>0){enemy.frozen=Math.max(0,enemy.frozen-dt);return;}
  if(enemy.bubbled){enemy.y-=65*dt;if(enemy.y+enemy.h<0){enemy.alive=false;enemy.defeated=true;}return;}
  const nearby=(game.players||[game.player]).some(p=>!p.respawn&&Math.abs(p.x-enemy.x)<(enemy.boss?650:850));
  if(!nearby&& !enemy.activated)return;
  enemy.activated=true;
  if(!enemy.boss){
    enemy.phaseTime+=dt;const type=enemy.wonderType;
    enemy.vx=enemy.facing*(type===1?45:type===3?28:36);
    if((type===0||type===2)&&enemy.grounded&&enemy.phaseTime>1.8){enemy.vy=-210;enemy.phaseTime=0;}
    enemy.vy=Math.min(650,enemy.vy+1200*dt);
    if(type===4||type===6)enemy.vy=(enemy.baseY-10+Math.sin(game.time*(type===4?3:1.8)+enemy.palette_id)*8-enemy.y)/dt;
    const hit=moveBody(game,enemy,dt);
    if(hit.wall||enemy.x<enemy.arenaLeft||enemy.x+enemy.w>enemy.arenaRight)enemy.facing*=-1;
    enemy.x=Math.max(enemy.arenaLeft,Math.min(enemy.arenaRight-enemy.w,enemy.x));
    return;
  }
  enemy.phaseTime+=dt;
  if(enemy.puzzleTime>0){enemy.puzzleTime=Math.max(0,enemy.puzzleTime-dt);if(!enemy.puzzleTime)enemy.puzzleProgress=0;}
  if(enemy.phase==='sleep'){enemy.phase='warning';enemy.phaseTime=0;enemy.targetX=Math.max(enemy.arenaLeft,Math.min(enemy.arenaRight-64,game.player.x));}
  else if(enemy.phase==='rest'&&enemy.phaseTime>=1.4){enemy.phase='warning';enemy.phaseTime=0;enemy.targetX=Math.max(enemy.arenaLeft,Math.min(enemy.arenaRight-64,game.player.x));}
  else if(enemy.phase==='warning'&&enemy.phaseTime>=1.5){enemy.phase='attack';enemy.phaseTime=0;enemy.cycle++;wonderAttack(game,enemy);}
  else if(enemy.phase==='attack'&&enemy.phaseTime>=1.2){
    if([0,3,5].includes(enemy.wonderType))openWonderFoe(enemy);
    else{enemy.phase='puzzle';enemy.phaseTime=0;}
  }else if(enemy.phase==='exposed'&&enemy.phaseTime>=5){enemy.phase='rest';enemy.phaseTime=0;enemy.puzzleProgress=0;}
  // The waffle slides; other bosses have their own visible idle/attack motion in the renderer.
  enemy.vx=enemy.wonderType===1&&enemy.phase==='attack'?enemy.facing*75:0;
  if(enemy.vx){const hit=moveBody(game,enemy,dt);if(hit.wall||enemy.x<enemy.arenaLeft+220||enemy.x+enemy.w>enemy.arenaRight)enemy.facing*=-1;enemy.x=Math.max(enemy.arenaLeft+220,Math.min(enemy.arenaRight-enemy.w,enemy.x));}
}
export function meetWonderFoe(game,enemy) {
  const p=game.player;
  if(!enemy.boss||!enemy.activated||enemy.defeated)return;
  const pads=wonderBossPads(enemy),pad=pads.find(b=>foeOverlap(p,{...b,y:b.y-6,h:b.h+6}));
  if(!pad){enemy.padTouch=-1;return;}
  if(enemy.phase==='exposed'||enemy.phase==='rest'||enemy.phase==='warning')return;
  if(enemy.padTouch===pad.index)return;
  enemy.padTouch=pad.index;
  const type=enemy.wonderType;
  if(type===1){if(enemy.phase==='attack'||enemy.phase==='puzzle')openWonderFoe(enemy);}
  else if(type===2||type===7){
    if(pad.index===enemy.puzzleProgress){enemy.puzzleProgress++;enemy.puzzleTime=8;if(enemy.puzzleProgress===2)openWonderFoe(enemy);}
    else{enemy.puzzleProgress=pad.index===0?1:0;enemy.puzzleTime=8;}
  }else if(type===4){
    if(pad.index===[0,1,0,1][enemy.puzzleProgress])enemy.puzzleProgress++;
    else enemy.puzzleProgress=pad.index===0?1:0;
    if(enemy.puzzleProgress===4){openWonderFoe(enemy);hitWonderFoe(game,enemy,'dance');}
  }else if(type===6&&pad.active){openWonderFoe(enemy);hitWonderFoe(game,enemy,'mirror');}
}
export function wonderFoeContact(game,enemy,previousBottom,hurtPlayer) {
  const p=game.player;
  if(enemy.bubbled||enemy.defeated||!foeOverlap(p,enemy))return;
  const stomp=p.vy>0&&previousBottom<=enemy.y+12;
  if(stomp){
    if(hitWonderFoe(game,enemy,'stomp')){p.vy=-430;p.jumpCut=false;p.invincible=Math.max(p.invincible,.4);}
    else{p.y=enemy.y-p.h;p.vy=-330;p.jumpCut=false;}
  }else if(!enemy.boss&&(p.star>0||p.rainbow>0))hitWonderFoe(game,enemy,'star');
  else if(!enemy.safe&&!enemy.hitCooldown)hurtPlayer(game);
}
export function stepWonderExits(game,dt) {
  for(const enemy of game.enemies)if(enemy.defeated&&enemy.exitTime>0)enemy.exitTime=Math.max(0,enemy.exitTime-dt);
}
export function wonderEncounterHint(game) {
  const boss=game?.enemies?.find(e=>e.kind==='wonder'&&e.boss);
  if(!boss)return '';
  if(boss.defeated)return game.wonderland.bossOutcome;
  if(!boss.activated)return '';
  return `${WONDER_FOES[boss.wonderType].name} · ${boss.hp}/${boss.maxHp} · ${boss.phase==='exposed'?'Nu! De zwakke plek glinstert.':WONDER_FOE_HINTS[boss.wonderType]}`;
}
