import {clamp,dist,TAU} from './core.mjs';
import {SKILLS,ITEM_BY_ID,ENEMY_BY_ID} from './content.mjs';

export const HERO_FACINGS=['e','se','s','sw','w','nw','n','ne'];
export function facing8(angle){return HERO_FACINGS[(Math.round(angle/(Math.PI/4))+8)%8];}

export const RELIC_ARTS={
 oathglass:{name:'Oathglass',text:'A perfect guard releases a shockwave. Knight parries also prime a riposte.',trigger:'Perfect guard',color:'#eed59a'},
 bloodbloom:{name:'Bloodbloom',text:'Critical strikes inflict bleed. Bleeding foes burst on death, damaging nearby enemies. Combines with Deathblossom.',trigger:'Bleeding kill',color:'#df9284'},
 graveecho:{name:'Grave Echo',text:'Gravebolt ricochets to two additional foes. Each bounce retains 80% of its damage.',trigger:'Gravebolt impact',color:'#a8d8d7'},
 embertrail:{name:'Embertrail',text:'Dodging leaves a warned ember rune that erupts after a short delay.',trigger:'Dodge',color:'#e6b57d'},
 duskfeast:{name:'Duskfeast',text:'Killing a marked foe restores 15 focus and 3% health. Combines with Marked for Silence.',trigger:'Marked kill',color:'#d3a1c8'},
 lastember:{name:'Last Ember',text:'When Iron Requiem expires, its remaining oath erupts in a wide shockwave.',trigger:'Ward expires',color:'#e0c98e'}
};
export function itemRelic(item){
 if(!item||item.quality<2)return null;
 const b=ITEM_BY_ID[item.baseId];if(!b?.slot)return null;
 if(b.kind==='sword'||b.kind==='shield')return 'oathglass';
 if(b.kind==='daggers')return 'bloodbloom';
 if(b.kind==='staff')return 'graveecho';
 if(b.kind==='boots')return 'embertrail';
 if(b.kind==='armor')return b.biome%2?'lastember':'oathglass';
 if(b.kind==='ring')return b.biome%2?'duskfeast':'bloodbloom';
 return b.biome%2?'lastember':'graveecho';
}
export function equipmentAppearance(c){
 const read=slot=>c.inventory.find(i=>i.uid===c.equipment[slot]);
 const style=item=>!item?0:Math.min(3,Math.max(item.quality,Math.floor((ITEM_BY_ID[item.baseId]?.biome??0)/3)));
 return {weapon:style(read('weapon')),armor:style(read('armor')),offhand:!!read('offhand'),boots:style(read('boots')),ring:!!read('ring'),amulet:!!read('amulet')};
}
export function skillProfile(id,rank=0){
 const s=SKILLS.find(s=>s.id===id);if(!s)return null;rank=clamp(Math.floor(rank),0,3);
 return {...s,rank,mult:s.mult*(1+rank*.18),cooldown:s.cooldown*(1-rank*.04),duration:s.duration?s.duration+rank:0,radius:(s.radius??0)+(['orbit','ward','nova','cleave'].includes(s.kind)?rank*6:0),reduction:.65+rank*.04,markMultiplier:2+rank*.15,tick:.5-rank*.025};
}
export function skillRankText(id,rank=0){
 const s=skillProfile(id,rank),next=skillProfile(id,Math.min(3,rank+1));if(!s)return '';
 const pct=x=>Math.round(x*100)+'%';let now='',gain='';
 if(s.kind==='ward'){now=`${s.duration}s ward · ${pct(s.reduction)} damage reduction`;gain=`${next.duration}s · ${pct(next.reduction)} reduction`;}
 else if(s.kind==='mark'){now=`${s.duration}s mark · ${s.markMultiplier.toFixed(2)}× damage · ${s.mult.toFixed(2)}× final burst`;gain=`${next.duration}s · ${next.markMultiplier.toFixed(2)}× damage · ${next.mult.toFixed(2)}× burst`;}
 else if(s.kind==='orbit'){now=`${s.duration}s · ${Math.round(s.radius/62*100)}% reach · ${s.mult.toFixed(2)}× per pulse`;gain=`${next.duration}s · ${Math.round(next.radius/62*100)}% reach · ${next.mult.toFixed(2)}× per pulse`;}
 else{now=`${s.mult.toFixed(2)}× power · ${Math.round(s.radius/(SKILLS.find(a=>a.id===id).radius||1)*100)}% reach`;gain=`${next.mult.toFixed(2)}× power${next.radius!==s.radius?' · '+Math.round(next.radius/(SKILLS.find(a=>a.id===id).radius||1)*100)+'% reach':''}`;}
 return now+(rank<3?' / Next: '+gain:' / Mastered');
}

const evAngle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
const evMelee=e=>!['caster','ranged','archer'].includes(ENEMY_BY_ID[e.kind].behavior);
const evEngaged=e=>!e.dead&&['windup','active'].includes(e.phase);
function evText(c,text,x,y,color='#eed59a'){c.effects.push({type:'number',text,x,y:y-53,life:.8,max:.8,color});}
function evRole(e){const d=ENEMY_BY_ID[e.kind];return d.boss?'sovereign':!evMelee(e)?'ranged':['knight','brute'].includes(d.family)?'blocker':['hound','crawler','revenant'].includes(d.family)?'flanker':'hunter';}

// Install after Campaign is declared. The original engine remains responsible for
// rewards, collisions, event progression and legacy saves.
export function installCampaignEvolution(Campaign){
 const base={};for(const key of ['recalculate','spawn','attack','roll','useSkill','hitEnemy','update','updateEnemy','chooseEnemyAttack','makeGeometry','enterRoom','context','interact','serialize','doors','loot'])base[key]=Campaign.prototype[key];
 const has=(c,id)=>c.player.relics?.includes(id);
 const proc=(c,id,seconds=1)=>{c.relicTimers??={};if((c.relicTimers[id]??0)>0)return false;c.relicTimers[id]=seconds;return true;};

 Campaign.prototype.recalculate=function(){base.recalculate.call(this);this.player.relics=[...new Set(Object.values(this.equipment).map(uid=>itemRelic(this.inventory.find(i=>i.uid===uid))).filter(Boolean))];};
 Campaign.prototype.loot=function(boss=false){return base.loot.call(this,boss||this.room?.role==='relic');};
 Campaign.prototype.spawn=function(...args){const e=base.spawn.apply(this,args);if(e){e.role=evRole(e);e.strafe=(e.id%2?1:-1);e.phaseClock=0;e.attackWait=0;if(this.room?.role==='elite'&&!e.summoned){e.elite=true;e.hp=e.maxHp=Math.round(e.hp*1.45);}}return e;};
 Campaign.prototype.attack=function(){const p=this.player;if(!base.attack.call(this))return false;p.riposteAttack=this.hero.id==='knight'&&p.riposte>0;p.riposte=0;p.chargeShot=0;if(p.riposteAttack){evText(this,'RIPOSTE',p.x,p.y);this.events.push({type:'riposte'});}return true;};
 Campaign.prototype.roll=function(mx=0,my=0){const p=this.player;if(p.action==='charge'){if(p.charge>=.65)return false;p.action='idle';p.at=0;p.charge=0;}if(!base.roll.call(this,mx,my))return false;if(has(this,'embertrail')&&proc(this,'embertrail',1.1)){this.dangers.push({x:p.x,y:p.y,radius:29,damage:p.damage*.75,color:RELIC_ARTS.embertrail.color,timer:.48,max:.48,enemy:false,active:false,sourceKind:'relic'});this.effects.push({type:'relic-rune',x:p.x,y:p.y,life:.48,max:.48,color:RELIC_ARTS.embertrail.color});}return true;};
 Campaign.prototype.damagePlayer=function(amount,source={x:180,y:150}){
  const p=this.player;if(p.invuln>0||p.hp<=0||this.state!=='playing')return false;
  const front=Math.cos(evAngle(p,source)-p.aim)>.05;
  if(p.action==='block'&&front&&p.stamina>=16){
   const perfect=p.at<=.2;p.stamina-=perfect?8:16;p.invuln=perfect?.16:.1;
   if(perfect&&this.hero.id==='knight'){p.riposte=1.8;p.focus=Math.min(p.maxFocus,p.focus+10);const attacker=this.enemies.find(e=>e===source||e.id===source.sourceId);if(attacker&&!ENEMY_BY_ID[attacker.kind].boss){attacker.phase='hurt';attacker.action='hurt';attacker.at=0;attacker.timer=.85;}evText(this,'PARRY',p.x,p.y);this.freeze=Math.max(this.freeze,.055);}
   if(perfect&&has(this,'oathglass')&&proc(this,'oathglass',2.5)){this.dangers.push({x:p.x,y:p.y,radius:76,damage:p.damage*1.25,color:RELIC_ARTS.oathglass.color,timer:.16,max:.16,active:false,enemy:false,sourceKind:'relic'});}
   this.effects.push({type:'guard-spark',x:p.x+Math.cos(p.aim)*13,y:p.y-22+Math.sin(p.aim)*13,angle:p.aim,life:.28,max:.28,color:perfect?'#fff0c5':'#adc8cb'});this.events.push({type:perfect?'parry':'block'});return false;
  }
  const reduction=p.ward>0?(p.wardReduction??.65):0,hit=Math.max(2,Math.round(amount*this.difficulty.damage*(1-p.defense/(p.defense+35))*(1-reduction)));
  p.hp=Math.max(0,p.hp-hit);p.invuln=.75;p.action=p.hp>0?'hurt':'death';p.at=0;this.shake=4;this.freeze=Math.max(this.freeze,.055);const a=evAngle(source,p);this.move(p,Math.cos(a)*7,Math.sin(a)*7);this.events.push({type:p.hp>0?'hurt':'death'});if(p.hp<=0){this.state='dying';this.deathTimer=1.2;}return true;
 };
 Campaign.prototype.hitEnemy=function(e,damage,options={}){
  if(e.dead)return;const p=this.player,d=ENEMY_BY_ID[e.kind],melee=p.action==='attack'&&this.hero.id!=='seer'&&!options.sourceKind;
  let critical=!!options.critical,stagger=!!options.stagger;const marked=e.marked>0,bleeding=e.bleed>0;
  if(melee&&p.riposteAttack){damage*=2.4;stagger=true;critical=true;}
  if(melee&&this.hero.id==='rogue'&&Math.cos(evAngle(e,p)-e.aim)<-.55){damage*=1.9;critical=true;stagger=true;if((p.backstabCue??0)<=0){evText(this,'BACKSTAB',e.x,e.y,'#a8d5bf');p.backstabCue=.35;p.focus=Math.min(p.maxFocus,p.focus+6);}this.events.push({type:'backstab'});}
  if(melee&&e.role==='blocker'&&e.phase==='chase'&&Math.cos(evAngle(e,p)-e.aim)>.5&&!stagger&&!critical){damage*=.48;this.events.push({type:'armor'});this.effects.push({type:'guard-spark',x:e.x,y:e.y-25,angle:evAngle(e,p),life:.2,max:.2,color:'#b8ced0'});}
  // The legacy engine applies a 2× mark. Scale its input to the live mark value.
  if(marked)damage*=(e.markMultiplier??2)/2;
  if(critical&&has(this,'bloodbloom')&&options.sourceKind!=='relic'){e.bleed=4;e.bleedTick=.7;e.bleedDamage=p.damage*.13;}
  base.hitEnemy.call(this,e,damage,{...options,critical,stagger});
  this.freeze=Math.max(this.freeze,stagger||critical?.065:.032);e.hitAngle=evAngle(p,e);e.hitRecoil=stagger?3:1.5;
  if(!d.boss&&!e.dead){this.move(e,Math.cos(e.hitAngle)*(stagger?11:4),Math.sin(e.hitAngle)*(stagger?11:4),e.radius);}
  this.effects.push({type:'hit-spark',x:e.x,y:e.y-(d.boss?42:29),angle:e.hitAngle,life:.19,max:.19,color:critical?'#fff0c5':'#d4ddd3'});
  if(e.dead&&(bleeding||e.bleed>0)&&has(this,'bloodbloom')&&options.sourceKind!=='relic'&&proc(this,'bloodbloom',.3)){this.dangers.push({x:e.x,y:e.y,radius:48,damage:p.damage*1.2,color:RELIC_ARTS.bloodbloom.color,timer:.18,max:.18,active:false,enemy:false,sourceKind:'relic'});this.effects.push({type:'bloodbloom',x:e.x,y:e.y,life:.5,max:.5,color:RELIC_ARTS.bloodbloom.color});}
  if(e.dead&&marked&&has(this,'duskfeast')){p.focus=Math.min(p.maxFocus,p.focus+15);p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.03);evText(this,'DUSKFEAST',p.x,p.y,'#d3a1c8');}
  if(e.dead&&d.boss){this.arena.phase2=false;this.arena.bossHazards=[];this.room.phase2=false;this.projectiles=this.projectiles.filter(b=>!b.enemy||b.sourceId!==e.id);this.dangers=this.dangers.filter(a=>!a.arenaHazard);}
  if(e.dead&&!this.enemies.length&&this.room.role==='elite'&&!this.room.eliteReward){this.room.eliteReward=true;this.loot(true);this.essence+=5;this.notify('Elite defeated / A relic and 5 essence are yours.');}
 };
 Campaign.prototype.useSkill=function(slot){const ok=base.useSkill.call(this,slot);if(ok){const p=this.player,s=skillProfile(p.castId,this.skillRanks[p.castId]);this.cooldowns[p.castId]=s.cooldown;p.face=facing8(p.aim);}return ok;};
 Campaign.prototype.releaseSkill=function(id){
  const s=skillProfile(id,this.skillRanks[id]),p=this.player;if(!s)return false;const targets=[...this.enemies].sort((a,b)=>b.maxHp-a.maxHp),strong=targets[0],color=s.color;
  if(s.kind==='cleave'||s.kind==='nova'){this.area(p.x,p.y,s.radius,p.damage*s.mult,color,.15);if(s.kind==='nova')p.hp=Math.min(p.maxHp,p.hp+p.maxHp*(.2+s.rank*.02));}
  if(s.kind==='ward'){p.ward=s.duration;p.wardReduction=s.reduction;p.wardBurst=has(this,'lastember');p.stamina=100;}
  if(s.kind==='dash'){const start={x:p.x,y:p.y};p.invuln=.45;for(let n=0;n<12;n++)this.move(p,Math.cos(p.aim)*8,Math.sin(p.aim)*8);for(const e of [...this.enemies])if(dist(start,e)<s.radius||dist(p,e)<55)this.hitEnemy(e,p.damage*s.mult,{stagger:true,sourceKind:'skill'});this.effects.push({type:'dash',x:start.x,y:start.y,toX:p.x,toY:p.y,life:.4,max:.4,color});}
  if(s.kind==='blades')for(let n=0;n<6;n++)this.bolt(p,p.aim+n*TAU/6,220,p.damage*s.mult,{pierce:true,color,radius:5,bleed:true});
  if(s.kind==='mark'&&strong){strong.marked=s.duration;strong.markMultiplier=s.markMultiplier;strong.markBurst=p.damage*s.mult;this.hitEnemy(strong,p.damage*(1+s.rank*.2),{sourceKind:'skill'});}
  if(s.kind==='bolt')for(let n=0;n<3;n++){const e=targets[n%Math.max(1,targets.length)];this.bolt(p,e?evAngle(p,e):p.aim+(n-1)*.15,245,p.damage*s.mult,{pierce:!has(this,'graveecho'),color});const b=this.projectiles.at(-1);b.sourceKind='gravebolt';b.bounces=has(this,'graveecho')?2:0;}
  if(s.kind==='orbit'){p.orbit=s.duration;p.orbitTick=0;p.orbitPower=s.mult;p.orbitRadius=s.radius;p.orbitCadence=s.tick;}
  if(s.kind==='meteor'){const e=strong??{x:p.x+Math.cos(p.aim)*80,y:p.y+Math.sin(p.aim)*80};this.area(e.x,e.y,s.radius,p.damage*s.mult,color,.85);}
  const impact=['meteor','mark'].includes(s.kind)?(strong??p):p;this.effects.push({type:'skill-art',id,x:impact.x,y:impact.y,life:s.kind==='meteor'?1.3:.9,max:s.kind==='meteor'?1.3:.9});this.events.push({type:'skill-release',id});if(this.tutorial?.step===3)this.tutorial.progress++;return true;
 };
 Campaign.prototype.releaseCharge=function(){const p=this.player;if(p.action!=='charge')return false;const amount=clamp((p.charge??0)/1.2,0,1),cost=9+amount*9;if(p.stamina<cost){p.action='idle';p.at=0;return false;}p.stamina-=cost;p.chargeShot=amount;p.attackKind=amount>.8?2:0;p.action='attack';p.at=.105;p.fired=false;p.practiceFired=false;p.hitIds.clear();this.events.push({type:amount>.8?'charged-cast':'cast'});return true;};

 Campaign.prototype.canEnemyAttack=function(e){
  if(ENEMY_BY_ID[e.kind].boss)return !this.enemies.some(o=>o!==e&&evMelee(o)&&evEngaged(o));
  const melee=this.enemies.filter(o=>o!==e&&evMelee(o)&&evEngaged(o));
  if(evMelee(e))return melee.length<2&&!melee.some(o=>ENEMY_BY_ID[o.kind].boss)&&!melee.some(o=>o.phase==='windup'&&o.at<.18);
  return !this.enemies.some(o=>o!==e&&!evMelee(o)&&o.phase==='windup'&&o.at<.24);
 };
 Campaign.prototype.chooseEnemyAttack=function(e,{force=false}={}){if(!force&&!this.canEnemyAttack(e))return false;base.chooseEnemyAttack.call(this,e);e.windupDuration=e.timer;e.recoveryDuration=e.move==='slam'?(ENEMY_BY_ID[e.kind].boss?1:.82):e.move==='charge'?.78:ENEMY_BY_ID[e.kind].boss?.72:.56;return true;};
 Campaign.prototype.awakenBossArena=function(e){
  if(this.arena.phase2||this.room.phase2||!ENEMY_BY_ID[e.kind].boss)return;const b=this.arena.bounds;this.arena.phase2=this.room.phase2=true;this.room.phaseClock=0;e.phase2=true;e.phase='recover';e.action='idle';e.at=0;e.timer=1.4;
  this.projectiles=this.projectiles.filter(p=>!p.enemy);this.dangers=this.dangers.filter(d=>!d.enemy);this.player.invuln=Math.max(this.player.invuln,1.1);
  this.notify(['The bell fractures / Consecrated lanes awaken.','The tide rises / Seek the dry stones.','The grove tightens / Roots strike in waves.','The furnace opens / Watch the iron channels.','The dead assemble / Bone circles close.','The ice splits / Frost seams awaken.','The heart quickens / Blood wells pulse.','The stars fall / Follow the unlit ground.','The gilding cracks / Royal seals descend.','The abyss answers / Stay between its eyes.'][this.biome.index],4);
  this.events.push({type:'boss-phase',biome:this.biome.id});this.effects.push({type:'boss-awaken',x:180,y:(b.top+b.bottom)/2,life:1.5,max:1.5,color:this.biome.palette[3]});
 };
 Campaign.prototype.updateBossArena=function(dt){
  const boss=this.enemies.find(e=>ENEMY_BY_ID[e.kind].boss&&!e.dead);if(!boss)return;if(boss.hp<=boss.maxHp*.5)this.awakenBossArena(boss);if(!this.arena.phase2)return;
  this.room.phaseClock=(this.room.phaseClock??0)+dt;this.bossHazardTimer=(this.bossHazardTimer??1.8)-dt;if(this.bossHazardTimer>0)return;this.bossHazardTimer=3.6;const b=this.arena.bounds,index=this.biome.index,k=Math.floor(this.room.phaseClock/3.6),color=this.biome.palette[3],cy=b.top+(b.bottom-b.top)*.48;
  let zones=[];
  if(index===0)zones=[{x:k%2?108:252,y:cy,radius:43},{x:180,y:b.top+45,radius:26}];
  if(index===1)zones=[{x:72,y:cy,radius:35},{x:288,y:cy,radius:35},{x:180,y:k%2?b.top+45:b.bottom-45,radius:32}];
  if(index===2)zones=Array.from({length:3},(_,n)=>({x:100+n*80,y:cy+Math.sin(k+n)*65,radius:29}));
  if(index===3)zones=Array.from({length:3},(_,n)=>({x:k%2?111:249,y:b.top+85+n*(b.bottom-b.top-150)/2,radius:31}));
  if(index===4)zones=Array.from({length:4},(_,n)=>({x:180+Math.cos(k+n*TAU/4)*79,y:cy+Math.sin(k+n*TAU/4)*80,radius:27}));
  if(index===5)zones=[{x:115,y:cy-60,radius:40},{x:245,y:cy+60,radius:40}];
  if(index===6)zones=[{x:110,y:cy,radius:36},{x:250,y:cy,radius:36},{x:180,y:cy+(k%2?90:-90),radius:28}];
  if(index===7)zones=Array.from({length:3},(_,n)=>({x:85+((k*51+n*73)%190),y:b.top+75+((k*37+n*83)%Math.max(80,b.bottom-b.top-140)),radius:27}));
  if(index===8)zones=Array.from({length:3},(_,n)=>({x:100+n*80,y:k%2?cy-65:cy+65,radius:31}));
  if(index===9)zones=Array.from({length:4},(_,n)=>({x:180+Math.cos(k*.45+n*TAU/4)*88,y:cy+Math.sin(k*.45+n*TAU/4)*90,radius:25}));
  this.arena.bossHazards=zones;for(const z of zones)this.dangers.push({...z,damage:12+this.floor*.22,color,timer:1.15,max:1.15,active:false,enemy:true,arenaHazard:true});
 };
 Campaign.prototype.updateEnemy=function(e,dt){
  e.role??=evRole(e);e.phaseClock=(e.phaseClock??0)+dt;
  // Flankers seek an offset before committing. Blockers hold the front while
  // ranged actors retain distance. The shared engine navigates every route.
  if(e.phase==='chase'&&!ENEMY_BY_ID[e.kind].boss){
   const p=this.player,length=dist(e,p),can=this.canEnemyAttack(e);e.timer=Math.max(e.timer,can?-.1:.16);
   if(e.role==='flanker'&&length>57&&length<190){const a=p.aim+e.strafe*Math.PI/2,target={x:clamp(p.x+Math.cos(a)*53,65,295),y:clamp(p.y+Math.sin(a)*53,this.arena.bounds.top+20,this.arena.bounds.bottom-20)};if(dist(e,target)>30){e.at+=dt;e.timer-=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.marked=Math.max(0,(e.marked??0)-dt);e.chilled=Math.max(0,(e.chilled??0)-dt);e.aim=evAngle(e,p);e.action='walk';this.pursue(e,target,ENEMY_BY_ID[e.kind].family==='hound'?66:48,dt);return;}}
   if(!can&&evMelee(e)&&length<85){const a=evAngle(p,e)+e.strafe*.025,target={x:p.x+Math.cos(a)*82,y:p.y+Math.sin(a)*82};e.at+=dt;e.timer-=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.marked=Math.max(0,(e.marked??0)-dt);e.chilled=Math.max(0,(e.chilled??0)-dt);e.action='walk';e.aim=evAngle(e,p);this.pursue(e,target,27,dt);return;}
  }
  const previous=e.phase;base.updateEnemy.call(this,e,dt);if(previous==='active'&&e.phase==='recover')e.timer=e.recoveryDuration??.56;
 };
 Campaign.prototype.makeGeometry=function(room){const doors={...room.doors};for(const gate of this.layout?.shortcuts??[])if(gate.a===room.id||gate.b===room.id)doors[gate.a===room.id?gate.da:gate.db]=gate.a===room.id?gate.b:gate.a;const a=base.makeGeometry.call(this,{...room,doors});a.phase2=!!room.phase2;a.bossHazards=[];let landmark=0;for(const prop of a.props)if(['pillar','statue','obelisk'].includes(prop.type)&&landmark<2){prop.biomeArt=(room.pattern+landmark++)%3;}if(room.switchFor!==undefined){const candidates=[{x:86,y:a.bounds.bottom-100},{x:274,y:a.bounds.top+100},{x:86,y:a.bounds.top+95},{x:180,y:a.bounds.bottom-110}];const free=p=>!a.colliders.some(c=>p.x+12>c.x&&p.x-12<c.x+c.w&&p.y+12>c.y&&p.y-12<c.y+c.h);a.switch=candidates.find(free)??a.feature??{x:180,y:(a.bounds.top+a.bounds.bottom)/2};}return a;};
 Campaign.prototype.enterRoom=function(...args){base.enterRoom.apply(this,args);this.freeze=0;this.bossHazardTimer=1.8;if(this.room.phase2)this.arena.phase2=true;this.player.charge=0;this.player.chargeShot=0;};
 Campaign.prototype.doors=function(){const doors=base.doors.call(this);if(!this.layout?.shortcuts)return doors;const b=this.arena.bounds;for(const s of this.layout.shortcuts)if(!s.open&&(s.a===this.room.id||s.b===this.room.id)){const direction=s.a===this.room.id?s.da:s.db,id=s.a===this.room.id?s.b:s.a;doors.push({id,direction,x:direction==='w'?b.left-5:direction==='e'?b.right+5:180,y:direction==='n'?b.top+8:direction==='s'?b.bottom-8:(b.top+b.bottom)/2,locked:true});}return doors;};
 Campaign.prototype.context=function(){if(!this.roomLocked()&&this.arena.switch&&!this.room.switchActivated&&dist(this.player,this.arena.switch)<42)return 'Pull the shortcut lever';const locked=this.doors().find(d=>d.locked&&dist(d,this.player)<44);if(locked&&!this.roomLocked())return 'Shortcut sealed / Find its lever';if(!this.roomLocked()){const door=this.doors().find(d=>!d.locked&&dist(d,this.player)<44),next=door&&this.layout.rooms.find(r=>r.id===door.id);if(next)return ({elite:'Elite trial · Relic + essence',relic:'Relic vault · An offering waits',rest:'Hearth · Restore your strength',trade:'Keeper · Trade supplies',event:'An encounter · Investigate'})[next.role]??base.context.call(this);}return base.context.call(this);};
 Campaign.prototype.interact=function(){if(!this.roomLocked()&&this.arena.switch&&!this.room.switchActivated&&dist(this.player,this.arena.switch)<42){const s=this.layout.shortcuts?.[this.room.switchFor];if(s){s.open=true;this.room.switchActivated=true;this.layout.rooms[s.a].doors[s.da]=s.b;this.layout.rooms[s.b].doors[s.db]=s.a;this.events.push({type:'shortcut'});this.notify('The ironwork yields / A shortcut opens.',3.5);return true;}}if(this.doors().some(d=>d.locked&&dist(d,this.player)<44)){this.notify('A lever in another chamber controls this gate.');return false;}return base.interact.call(this);};
 Campaign.prototype.update=function(dt,input={}){
  dt=clamp(dt,0,.04);if(this.freeze>0){this.freeze=Math.max(0,this.freeze-dt);this.impactInput??={};for(const key of ['attack','roll','skill1','skill2','heal','interact'])if(input[key])this.impactInput[key]=true;return;}
  const held=this.impactInput??{};input={...input};for(const key of Object.keys(held))input[key]=input[key]||held[key];this.impactInput=null;const p=this.player,playing=this.state==='playing',wasWard=p.ward>0;
  if(playing){for(const key of ['riposte','backstabCue'])p[key]=Math.max(0,(p[key]??0)-dt);for(const key of Object.keys(this.relicTimers??{}))this.relicTimers[key]=Math.max(0,this.relicTimers[key]-dt);
   for(const e of [...this.enemies])if(e.marked>0&&e.marked<=dt&&e.markBurst){const damage=e.markBurst;e.marked=0;e.markBurst=0;this.hitEnemy(e,damage,{stagger:true,sourceKind:'mark-burst'});this.effects.push({type:'bloodbloom',x:e.x,y:e.y,life:.45,max:.45,color:'#d8a1c1'});}
   if(this.hero.id==='seer'&&!this.tutorial){if(input.attack&&['idle','walk','block'].includes(p.action)&&p.stamina>=9){p.action='charge';p.at=0;p.charge=0;this.events.push({type:'charge'});}if(p.action==='charge'&&(!input.attack||p.charge>=1.2))this.releaseCharge();if(p.action==='charge'||input.attack)input.attack=false;}
  }
  base.update.call(this,dt,input);
  p.face=facing8(p.aim);if(p.action!=='attack'){p.riposteAttack=false;if(p.action!=='charge')p.chargeShot=0;}
  if(playing){this.updateBossArena(dt);if(wasWard&&p.ward<=0&&p.wardBurst){p.wardBurst=false;this.dangers.push({x:p.x,y:p.y,radius:95,damage:p.damage*1.8,color:'#eed59a',timer:.2,max:.2,enemy:false,active:false,sourceKind:'relic'});}}
 };
 Campaign.prototype.serialize=function(){const o=base.serialize.call(this);if(o){o.relicTimers=this.relicTimers??{};o.bossHazardTimer=this.bossHazardTimer??1.8;}return o;};
}
