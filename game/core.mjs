export const TAU=Math.PI*2;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const facing=a=>Math.abs(Math.cos(a))>Math.abs(Math.sin(a))?(Math.cos(a)>0?'e':'w'):(Math.sin(a)>0?'s':'n');
export const HERO_COMBAT=[
 {tag:'attack',duration:.46,activeFrom:.11,activeTo:.23,cost:13},
 {tag:'attack-backhand',duration:.46,activeFrom:.11,activeTo:.23,cost:13},
 {tag:'attack-heavy',duration:.58,activeFrom:.17,activeTo:.315,cost:18}
];
export function rng(seed){let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export const PROPS=[
 {type:'pillar',x:160,y:178,w:24,h:14}, {type:'pillar',x:480,y:178,w:24,h:14},
 {type:'pillar',x:160,y:281,w:24,h:14}, {type:'pillar',x:480,y:281,w:24,h:14},
 {type:'coffin',x:546,y:276,w:50,h:18}, {type:'books',x:553,y:174,w:44,h:16},
 {type:'urn',x:127,y:137,w:13,h:9}, {type:'urn',x:520,y:130,w:13,h:9},
 {type:'brazier',x:79,y:126,w:19,h:9}, {type:'brazier',x:560,y:126,w:19,h:9},
 {type:'brazier',x:222,y:292,w:19,h:9}, {type:'brazier',x:416,y:292,w:19,h:9},
 {type:'shrine',x:91,y:300,w:25,h:12}, {type:'chest-closed',x:546,y:220,w:31,h:13}
];
export const COLLIDERS=[...PROPS.map(p=>({x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h})),{x:58,y:164,w:50,h:99}];
export const DESKTOP_ARENA={width:640,height:360,props:PROPS,colliders:COLLIDERS,bounds:{left:49,right:590,top:115,bottom:318},start:{x:320,y:280},gate:{x:320,y:124},boss:{x:320,y:176},bossEscorts:[[235,152],[415,151]],formations:[[[230,148],[403,153],[370,276],[227,249]],[[241,259],[394,265],[250,148],[403,151]],[[231,168],[409,165],[270,279],[390,281]]],caster:{x:320,y:147}};
// A narrow, complete chamber follows the available portrait height. Actors keep
// their native pixel size; a wide desktop room is never cropped into a phone.
export function portraitArena(height=688){
 const span=height-204,y=t=>Math.round(124+span*t);
 const props=[
  {type:'pillar',x:45,y:y(.42),w:24,h:14},{type:'pillar',x:315,y:y(.42),w:24,h:14},
  {type:'books',x:35,y:154,w:34,h:16},{type:'coffin',x:325,y:167,w:38,h:18},
  {type:'brazier',x:31,y:120,w:19,h:9},{type:'brazier',x:329,y:120,w:19,h:9},
  {type:'brazier',x:77,y:height-59,w:19,h:9},{type:'brazier',x:283,y:height-59,w:19,h:9},
  {type:'shrine',x:37,y:y(.79),w:25,h:12},{type:'chest-closed',x:323,y:y(.72),w:31,h:13}
 ];
 return {portrait:true,width:360,height,props,colliders:props.map(p=>({x:p.x-p.w/2,y:p.y-p.h/2,w:p.w,h:p.h})),bounds:{left:41,right:319,top:116,bottom:height-72},start:{x:180,y:y(.7)},gate:{x:180,y:124},boss:{x:180,y:y(.26)},bossEscorts:[[112,y(.17)],[250,y(.18)]],formations:[[[112,y(.16)],[250,y(.23)],[223,y(.52)],[115,y(.48)]],[[116,y(.41)],[245,y(.39)],[128,y(.13)],[251,y(.15)]],[[119,y(.18)],[242,y(.19)],[125,y(.53)],[249,y(.54)]]],caster:{x:180,y:y(.08)}};
}
export const RELICS=[
 {id:'edge',name:'WARDEN STEEL',subtitle:'A blade that remembers war',description:'Sword strikes deal +8 damage.',icon:'attack'},
 {id:'heart',name:'EMBER HEART',subtitle:'A small flame. A lasting oath.',description:'+20 maximum health. Restore 30 health.',icon:'heart'},
 {id:'stride',name:'PILGRIM STRIDE',subtitle:'Iron feels a little lighter',description:'Move 15% faster. Shorter roll cooldown.',icon:'boot'},
 {id:'reach',name:'THE LONG VOW',subtitle:'No shadow is out of reach',description:'Sword reach increases by 12 pixels.',icon:'star'},
 {id:'guard',name:'UNBROKEN SHIELD',subtitle:'Plant your feet. Stand firm.',description:'Blocking consumes 50% less stamina.',icon:'block'},
 {id:'well',name:'SILENT SPRING',subtitle:'A moment between battles',description:'Restore 45 health. Stamina regeneration +20%.',icon:'flask'}
];
export class Game{
 constructor(seed=Date.now()&0xffff,arena=DESKTOP_ARENA){
  this.arena=arena;
  this.seed=seed;this.random=rng(seed);this.time=0;this.state='title';this.floor=1;this.enemies=[];this.particles=[];this.bolts=[];this.coins=[];this.corpses=[];this.effects=[];this.events=[];this.shake=0;this.freeze=0;this.kills=0;this.gold=0;this.runTime=0;this.combo=0;this.comboTimer=0;this.relics=[];this.chestOpen=false;this.shrineUsed=false;this.spawnTimer=0;this.floorTimer=0;this.nextId=1;this.toast='';this.toastTime=0;
  this.player={...arena.start,hp:100,maxHp:100,stamina:100,damage:25,range:44,speed:102,rollCD:.66,guardCost:1,regen:1,face:'s',aim:Math.PI/2,action:'idle',at:0,invuln:0,rollCooldown:0,attackId:0,attackKind:0,hitIds:new Set(),rollX:0,rollY:1};
 }
 start(seed=this.seed){const fresh=new Game(seed,this.arena);Object.assign(this,fresh);this.state='playing';this.spawnEncounter();this.notify('TRIAL I / III — break the hollow oath',3.8);this.events.push('start');}
 resizeArena(arena){
  const old=this.arena.bounds,next=arena.bounds;
  for(const o of [this.player,...this.enemies,...this.corpses,...this.coins,...this.bolts,...this.effects,...this.particles])o.y=next.top+(o.y-old.top)/(old.bottom-old.top)*(next.bottom-next.top);
  this.arena=arena;
  for(const o of [this.player,...this.enemies]){
   if(!this.solid(o.x,o.y,o.type==='warden'?12:7))continue;
   // Window changes can move a pillar under an actor. Find nearby clear floor.
   let found=false;for(let r=8;r<160&&!found;r+=8)for(let a=0;a<TAU;a+=Math.PI/8){const x=o.x+Math.cos(a)*r,y=o.y+Math.sin(a)*r;if(!this.solid(x,y,o.type==='warden'?12:7)){o.x=x;o.y=y;found=true;break;}}
  }
 }
 notify(text,duration=2.5){this.toast=text;this.toastTime=duration;}
 face(angle){const p=this.player;p.aim=angle;p.face=facing(angle);}
 spawn(type,x,y){
  const hp=type==='warden'?260:type==='wisp'?38:55;
  const e={id:this.nextId++,type,x,y,hp,maxHp:hp,action:'idle',at:0,phase:'chase',timer:.3+this.random()*.6,aim:0,face:'s',flip:false,hitFlash:0,step:this.random()*3,attacks:0,hitPlayer:false,dead:false};this.enemies.push(e);
  this.effects.push({type:'spawn',x,y,life:.65,max:.65});return e;
 }
 spawnEncounter(){
  this.floorTimer=0;this.clearTimer=0;
  const formations=this.arena.formations;
  const points=formations[Math.floor(this.random()*formations.length)];
  if(this.floor===1){this.spawn('hollow',...points[0]);this.spawn('hollow',...points[1]);this.spawn('wisp',...points[2]);}
  else if(this.floor===2){this.spawn('hollow',...points[0]);this.spawn('hollow',...points[1]);this.spawn('hollow',...points[2]);this.spawn('wisp',...points[3]);this.spawn('wisp',this.arena.caster.x,this.arena.caster.y);}
  else {this.spawn('warden',this.arena.boss.x,this.arena.boss.y);this.spawn('hollow',...this.arena.bossEscorts[0]);this.spawn('wisp',...this.arena.bossEscorts[1]);this.events.push('boss');this.notify('THE OATHKEEPER — watch for the heavy slam',4);}
 }
 solid(x,y,r=7){
  const b=this.arena.bounds;if(x<b.left+r||x>b.right-r||y<b.top+r||y>b.bottom-r)return true;
  // Reserve space for the ogre's wider attack silhouette at either screen edge.
  if(this.arena.portrait&&r>=12&&(x<88||x>272))return true;
  return this.arena.colliders.some(b=>x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h);
 }
 move(o,dx,dy,r=7){if(!this.solid(o.x+dx,o.y,r))o.x+=dx;if(!this.solid(o.x,o.y+dy,r))o.y+=dy;}
 clearLine(a,b){const length=dist(a,b);for(let i=6;i<length;i+=6){const t=i/length;if(this.arena.colliders.some(c=>{const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;return x>c.x&&x<c.x+c.w&&y>c.y&&y<c.y+c.h;}))return false;}return true;}
 attack(){
  const p=this.player;if(this.state!=='playing'&&this.state!=='exit')return false;
  const next=this.comboTimer>0?(this.combo+1)%3:0,attack=HERO_COMBAT[next];
  if(!['idle','walk','block'].includes(p.action)||p.stamina<attack.cost)return false;
  p.action='attack';p.at=0;p.attackId++;p.attackKind=next;p.hitIds.clear();p.stamina-=attack.cost;
  this.combo=next;this.comboTimer=1.1;this.events.push(next===2?'heavy':'swing');return true;
 }
 roll(mx=0,my=0){
  const p=this.player;if(!['playing','exit'].includes(this.state)||!['idle','walk','block'].includes(p.action)||p.rollCooldown>0||p.stamina<24)return false;
  const len=Math.hypot(mx,my);p.rollX=len?mx/len:Math.cos(p.aim);p.rollY=len?my/len:Math.sin(p.aim);
  p.action='roll';p.at=0;p.invuln=.29;p.rollCooldown=p.rollCD;p.stamina-=24;this.events.push('roll');return true;
 }
 hitEnemy(e,damage){
  if(e.dead)return;e.hp-=damage;e.hitFlash=.12;
  const p=this.player,heavy=p.attackKind===2;
  if(e.type!=='warden'||heavy){e.phase='hurt';e.timer=.30;e.action='hurt';e.at=0;}
  const d=dist(p,e)||1,push=e.type==='warden'?2:heavy?8:5;this.move(e,(e.x-p.x)/d*push,(e.y-p.y)/d*push,e.type==='warden'?12:7);
  this.freeze=e.hp<=0?.075:heavy?.065:.035;this.shake=e.hp<=0?3:heavy?2.5:1.7;this.events.push(e.hp<=0?'kill':'hit');
  this.effects.push({type:'number',x:e.x,y:e.y-61,text:String(damage),life:.55,max:.55});
  this.burst(e.x,e.y-28,e.type==='wisp'?'mint':'gold',10);
  if(e.hp<=0){e.dead=true;e.action='death';e.at=0;this.kills++;this.corpses.push(e);this.enemies=this.enemies.filter(x=>x!==e);for(let i=0;i<(e.type==='warden'?12:3);i++)this.coins.push({x:e.x+(this.random()-.5)*22,y:e.y+(this.random()-.5)*15,t:0,pickup:false});if(e.type==='warden'){this.shake=6;this.events.push('boss-death');}}
 }
 damagePlayer(damage,source){
  const p=this.player;if(p.invuln>0||p.hp<=0)return false;
  const incoming=Math.atan2(source.y-p.y,source.x-p.x),dot=Math.cos(incoming-p.aim);
  if(p.action==='block'&&dot>-.15&&p.stamina>=18*p.guardCost){p.stamina-=18*p.guardCost;p.invuln=.13;this.events.push('block');this.burst(p.x,p.y-21,'gold',8);this.shake=1;return false;}
  p.hp=Math.max(0,p.hp-damage);p.action=p.hp>0?'hurt':'death';p.at=0;p.invuln=.8;this.comboTimer=0;this.shake=4;this.events.push('hurt');this.burst(p.x,p.y-26,'red',10);
  const d=dist(p,source)||1;this.move(p,(p.x-source.x)/d*7,(p.y-source.y)/d*7);
  if(p.hp<=0){this.state='dying';this.deathTimer=1.25;this.events.push('death');}return true;
 }
 burst(x,y,color,count){for(let i=0;i<count;i++)this.particles.push({x,y,vx:(this.random()-.5)*100,vy:(this.random()-.5)*90-25,life:.2+this.random()*.35,max:.55,color,size:i<3?2:1});}
 interact(){
  if(this.state==='exit'&&dist(this.player,this.arena.gate)<38){this.state='won';this.events.push('win');return 'won';}
  if(!['playing','exit'].includes(this.state))return false;
  const chest=this.arena.props.find(p=>p.type==='chest-closed'),shrine=this.arena.props.find(p=>p.type==='shrine');
  if(!this.chestOpen&&dist(this.player,chest)<37){this.chestOpen=true;this.gold+=20;this.player.hp=clamp(this.player.hp+15,0,this.player.maxHp);this.burst(chest.x,chest.y-18,'gold',18);this.events.push('chest');this.notify('An old offering: +20 gold, +15 health');return 'chest';}
  if(!this.shrineUsed&&dist(this.player,shrine)<35){this.shrineUsed=true;this.player.hp=clamp(this.player.hp+30,0,this.player.maxHp);this.burst(shrine.x,shrine.y-23,'mint',18);this.events.push('heal');this.notify('Oath restored: +30 health');return 'shrine';}
  return false;
 }
 offerRelics(){const options=[...RELICS];this.choices=[];while(this.choices.length<3)this.choices.push(options.splice(Math.floor(this.random()*options.length),1)[0]);this.state='relic';this.events.push('relic');}
 chooseRelic(index){
  if(this.state!=='relic'||!this.choices[index])return false;const r=this.choices[index],p=this.player;this.relics.push(r);
  if(r.id==='edge')p.damage+=8;
  if(r.id==='heart'){p.maxHp+=20;p.hp=clamp(p.hp+30,0,p.maxHp);}
  if(r.id==='stride'){p.speed*=1.15;p.rollCD=Math.max(.35,p.rollCD-.12);}
  if(r.id==='reach')p.range+=12;
  if(r.id==='guard')p.guardCost*=.5;
  if(r.id==='well'){p.hp=clamp(p.hp+45,0,p.maxHp);p.regen*=1.2;}
  p.hp=clamp(p.hp+10,0,p.maxHp);p.stamina=100;p.action='idle';p.at=0;p.invuln=1.3;
  this.floor++;this.state='playing';this.spawnEncounter();this.notify(`TRIAL ${this.floor} / III — ${r.name}`,3);this.events.push('choose');return true;
 }
 update(dt,input={}){
  dt=Math.min(dt,.04);this.time+=dt;this.toastTime=Math.max(0,this.toastTime-dt);this.shake=Math.max(0,this.shake-dt*12);
  if(['relic','paused','won','dead'].includes(this.state))return;
  if(this.freeze>0){this.freeze-=dt;return;}
  this.effects=this.effects.filter(e=>(e.life-=dt)>0);
  this.particles=this.particles.filter(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=125*dt;return p.life>0;});
  this.corpses.forEach(e=>e.at+=dt);
  if(this.state==='title')return;
  const p=this.player;p.at+=dt;p.invuln=Math.max(0,p.invuln-dt);p.rollCooldown=Math.max(0,p.rollCooldown-dt);this.comboTimer=Math.max(0,this.comboTimer-dt);
  if(this.state==='dying'){this.deathTimer-=dt;if(this.deathTimer<=0)this.state='dead';return;}
  this.runTime+=dt;this.floorTimer+=dt;
  const mx=(input.right?1:0)-(input.left?1:0),my=(input.down?1:0)-(input.up?1:0),moving=mx!==0||my!==0;
  if(!['attack','roll','hurt'].includes(p.action)){
   if(input.aim&&input.aim.active)this.face(Math.atan2(input.aim.y-p.y,input.aim.x-p.x));else if(moving)this.face(Math.atan2(my,mx));
  }
  if(input.roll)this.roll(mx,my);
  if(input.attack)this.attack();
  if(input.interact)this.interact();
  if(p.action==='roll'){
   this.move(p,p.rollX*250*dt,p.rollY*250*dt);
   if(Math.floor(p.at*40)%3===0)this.effects.push({type:'dust',x:p.x,y:p.y,life:.18,max:.18});
   if(p.at>=.30){p.action='idle';p.at=0;}
  }else if(p.action==='attack'){
   const strike=HERO_COMBAT[p.attackKind];
   if(p.at>=strike.activeFrom&&p.at<=strike.activeTo){
    for(const e of [...this.enemies]){
     if(p.hitIds.has(e.id)||dist(p,e)>p.range+(e.type==='warden'?10:3))continue;
     const angle=Math.atan2(e.y-p.y,e.x-p.x);if(Math.cos(angle-p.aim)<-.08||!this.clearLine(p,e))continue;
     p.hitIds.add(e.id);this.hitEnemy(e,p.damage+(p.attackKind===2?12:0));
    }
   }if(p.at>=strike.duration){p.action='idle';p.at=0;}
  }else if(p.action==='hurt'){if(p.at>.30){p.action='idle';p.at=0;}}
  else{
   const old=p.action;p.action=input.block&&p.stamina>3?'block':moving?'walk':'idle';if(old!==p.action)p.at=0;
   if(moving){const len=Math.hypot(mx,my),speed=p.speed*(p.action==='block'?.4:1);this.move(p,mx/len*speed*dt,my/len*speed*dt);}
  }
  if(p.action!=='attack'&&p.action!=='roll'&&p.action!=='block')p.stamina=clamp(p.stamina+30*p.regen*dt,0,100);
  if(p.action==='block')p.stamina=clamp(p.stamina-5*dt,0,100);
  this.updateEnemies(dt);
  this.bolts=this.bolts.filter(b=>{
   b.t-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
   if(b.t<=0||this.solid(b.x,b.y,1)){this.burst(b.x,b.y-26,'mint',3);return false;}
   if(dist(b,p)<10){this.damagePlayer(12,b);return false;}return true;
  });
  for(const c of this.coins){c.t+=dt;if(!c.pickup&&dist(c,p)<45){const d=dist(c,p)||1;c.x+=(p.x-c.x)/d*170*dt;c.y+=(p.y-c.y)/d*170*dt;if(d<10){c.pickup=true;this.gold++;this.events.push('coin');}}}
  this.coins=this.coins.filter(c=>!c.pickup);
  if(this.state==='playing'&&this.enemies.length===0){this.clearTimer+=dt;if(this.clearTimer>1.1){if(this.floor<3)this.offerRelics();else{this.state='exit';this.notify('Oath broken. Reach the north gate and interact.',10);this.events.push('gate');this.bolts=[];}}}
 }
 updateEnemies(dt){
  const p=this.player;
  for(const e of this.enemies){
   e.at+=dt;e.step+=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.timer-=dt;const d=dist(e,p),a=Math.atan2(p.y-e.y,p.x-e.x);e.flip=p.x<e.x;if(e.phase==='chase')e.face=facing(a);
   if(e.phase==='hurt'){if(e.timer<=0){e.phase='chase';e.timer=.35;e.action='walk';e.at=0;}continue;}
   if(e.phase==='windup'){
    if(e.timer<=0){e.phase='strike';e.strikeDuration=e.type==='warden'?.32:.21;e.timer=e.strikeDuration;e.action='attack';e.at=0;e.hitPlayer=false;
      if(e.type==='wisp'){const speed=100;this.bolts.push({x:e.x,y:e.y,vx:Math.cos(e.aim)*speed,vy:Math.sin(e.aim)*speed,t:4});this.events.push('cast');}
      if(e.type==='warden'&&e.attacks%3===0){for(const offset of [-.5,0,.5])this.bolts.push({x:e.x,y:e.y,vx:Math.cos(e.aim+offset)*105,vy:Math.sin(e.aim+offset)*105,t:3});}
    }continue;
   }
   if(e.phase==='strike'){
    if(!e.hitPlayer&&e.type!=='wisp'){
     const range=e.type==='warden'?65:36;
     if(d<range&&Math.cos(a-e.aim)>(e.type==='warden'?-.05:.15)&&this.clearLine(e,p)){this.damagePlayer(e.type==='warden'?20:13,e);e.hitPlayer=true;}
    }
    if(e.timer<=0){e.phase='recover';e.recoverDuration=e.type==='warden'?.8:.65;e.timer=e.recoverDuration;e.at=0;}
    continue;
   }
   if(e.phase==='recover'){if(e.timer<=0){e.phase='chase';e.timer=.15;e.action='walk';e.at=0;}continue;}
   const targetRange=e.type==='wisp'?135:e.type==='warden'?56:28;
   if(d<targetRange&&e.timer<=0&&this.clearLine(e,p)){
    e.phase='windup';e.action='attack';e.at=0;e.aim=a;e.face=facing(a);e.attacks++;e.windupDuration=e.type==='warden'?.78:e.type==='wisp'?.85:.52;e.timer=e.windupDuration;
    continue;
   }
   const speed=e.type==='warden'?30:e.type==='wisp'?31:37;
   let vx=Math.cos(a)*speed,vy=Math.sin(a)*speed;
   if(e.type==='wisp'&&d<105){vx=-Math.cos(a)*speed*.6-Math.sin(a)*speed*.3;vy=-Math.sin(a)*speed*.6+Math.cos(a)*speed*.3;}
   if(d>targetRange*.8||e.type==='wisp'){
    // A short tangent detour prevents enemies collecting against furniture corners.
    if(this.solid(e.x+vx*dt*3,e.y+vy*dt*3,8)){
      const side=e.id%2?1:-1;const sx=-Math.sin(a)*speed*side,sy=Math.cos(a)*speed*side;
      if(!this.solid(e.x+sx*dt*4,e.y+sy*dt*4,8)){vx=sx;vy=sy;}
      else {vx=-sx;vy=-sy;}
    }
    for(const other of this.enemies){if(other===e)continue;const dd=dist(e,other);if(dd>0&&dd<20){vx+=(e.x-other.x)/dd*16;vy+=(e.y-other.y)/dd*16;}}
    this.move(e,vx*dt,vy*dt,e.type==='warden'?12:7);e.action='walk';
   }else e.action='idle';
  }
 }
}
