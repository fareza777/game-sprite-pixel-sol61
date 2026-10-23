import {clamp,dist,facing,TAU,HERO_COMBAT,portraitArena} from './core.mjs';
import {HEROES,SKILLS,BIOMES,ENEMIES,ENEMY_BY_ID,ITEMS,ITEM_BY_ID,EQUIP_SLOTS,RARITIES,AFFIXES,DIFFICULTIES,TUTORIAL_STEPS,ROOM_LAYOUTS,EVENTS,EVENT_BY_ID} from './content.mjs';

export class CampaignRandom{
 constructor(seed){this.value=seed>>>0;}
 next(){this.value=(Math.imul(this.value,1664525)+1013904223)>>>0;return this.value/4294967296;}
 int(n){return Math.floor(this.next()*n);}
 pick(a){return a[this.int(a.length)];}
}
const chapter=floor=>Math.min(9,Math.floor((floor-1)/10));
const targetAngle=(a,b)=>Math.atan2(b.y-a.y,b.x-a.x);
export function generateFloor(seed,floor){
 if(!Number.isInteger(floor)||floor<1||floor>100)throw Error('Invalid floor');
 const r=new CampaignRandom((seed^Math.imul(floor,2654435761))>>>0),boss=floor%10===0,biome=chapter(floor);
 const forms=[
  [[0,2],[0,1],[0,0],[-1,1],[-1,2],[1,1]],
  [[0,2],[1,2],[1,1],[0,1],[0,0],[-1,0]],
  [[0,2],[0,1],[0,0],[1,0],[1,1],[1,2]],
  [[0,2],[-1,2],[-1,1],[-1,0],[0,0],[1,0],[1,1]],
  [[0,3],[0,2],[-1,2],[1,2],[1,1],[1,0],[-1,1]],
  [[0,2],[0,1],[-1,1],[-1,0],[1,1],[1,0],[0,0]],
  [[0,3],[0,2],[1,2],[1,1],[0,1],[-1,1],[-1,0]],
  [[0,2],[1,2],[1,1],[2,1],[2,0],[1,0]]
 ];
 const form=r.int(forms.length),mirror=r.next()<.5?-1:1,rooms=forms[form].map(([x,y],id)=>({id,x:x*mirror,y,type:id===0?'entrance':'combat',doors:{}}));
 for(const room of rooms)for(const [d,dx,dy]of [['n',0,-1],['s',0,1],['w',-1,0],['e',1,0]]){const n=rooms.find(n=>n.x===room.x+dx&&n.y===room.y+dy);if(n)room.doors[d]=n.id;}
 const distance=new Map([[0,0]]),queue=[rooms[0]];while(queue.length){const room=queue.shift();for(const id of Object.values(room.doors))if(!distance.has(id)){distance.set(id,distance.get(room.id)+1);queue.push(rooms[id]);}}
 const north=Math.min(...rooms.map(n=>n.y)),goal=rooms.filter(n=>n.y===north).sort((a,b)=>distance.get(b.id)-distance.get(a.id)||b.id-a.id)[0];goal.type=boss?'boss':'guardian';
 const branches=rooms.filter(n=>n.id!==0&&n!==goal).sort((a,b)=>distance.get(b.id)-distance.get(a.id));
 const eventRoom=branches[r.int(Math.min(branches.length,3))],event=EVENTS[(r.int(EVENTS.length)+floor)%EVENTS.length];eventRoom.type='event';eventRoom.event={id:event.id,status:'pending',choice:null,claimed:false,wave:0,remaining:0,cadence:0};
 const support=branches.filter(n=>n!==eventRoom);support[r.int(support.length)].type=boss?'hearth':r.pick(['treasure','hearth','merchant']);
 if(rooms.length===7){const extra=support.find(n=>n.type==='combat');if(extra&&r.next()<.5)extra.type='treasure';}
 const layouts=[...ROOM_LAYOUTS];for(let n=layouts.length-1;n>0;n--){const j=r.int(n+1);[layouts[n],layouts[j]]=[layouts[j],layouts[n]];}
 const used=new Set([event.layout]);rooms[0].layout=r.pick(['nave','cloister','gallery'].filter(id=>!used.has(id)));used.add(rooms[0].layout);goal.layout=r.pick(['arena','crossing','ritual','nave'].filter(id=>!used.has(id)));used.add(goal.layout);
 for(const room of rooms){
  if(!room.layout){room.layout=room.type==='event'?event.layout:layouts.find(l=>!used.has(l.id)).id;used.add(room.layout);}
  room.seed=r.int(0xffffffff);room.pattern=r.int(6);room.visited=false;room.cleared=!['combat','guardian','boss'].includes(room.type);room.opened=false;room.rested=false;room.encounter=[];
  if(room.type==='boss')room.encounter=[`${BIOMES[biome].id}-boss`];
  else if(!room.cleared){const count=(room.type==='guardian'?3:2)+(floor>30?1:0);for(let n=0;n<count;n++)room.encounter.push(`${BIOMES[biome].id}-${r.int(5)}`);}
  if(room.type==='merchant')room.stock=Array.from({length:3},()=>({baseId:ITEMS[biome*10+r.int(8)].id,seed:r.int(0xffffffff),sold:false}));
 }
 return {revision:2,form,floor,biome,boss,rooms,roomId:0};
}
export function createItem(baseId,level,seed,minimum=0,maximum=3){
 const base=ITEM_BY_ID[baseId];if(!base)throw Error('Unknown item');const r=new CampaignRandom(seed),roll=r.next(),quality=Math.min(maximum,Math.max(minimum,roll>.975?3:roll>.82?2:roll>.48?1:0)),rarity=RARITIES[Math.min(quality,3)],power=Math.max(1,Math.round((1+level*.075)*rarity.mult*10)/10),stats={};
 if(base.kind==='sword')stats.damage=Math.round(5*power);
 if(base.kind==='daggers'){stats.damage=Math.round(4*power);stats.crit=5;}
 if(base.kind==='staff'){stats.damage=Math.round(4.5*power);stats.maxFocus=Math.round(9*power);}
 if(base.kind==='shield')stats.defense=Math.round(1.5*power);
 if(base.kind==='armor'){stats.defense=Math.round(2*power);stats.maxHp=Math.round(6*power);}
 if(base.kind==='boots'){stats.speed=3+Math.round(power);stats.staminaRegen=3+Math.round(power);}
 if(base.kind==='ring'){stats.crit=3+Math.round(power);stats.damage=Math.round(power);}
 if(base.kind==='amulet'){stats.maxHp=Math.round(5*power);stats.maxFocus=Math.round(5*power);}
 const affixes=[];for(let n=0;n<quality;n++){const choices=AFFIXES.filter(a=>!affixes.includes(a.id)),a=r.pick(choices);affixes.push(a.id);stats[a.stat]=(stats[a.stat]??0)+Math.round(a.value*(1+level*.025));}
 return {uid:`${seed>>>0}-${baseId}`,baseId,level,quality,stats,affixes,value:Math.round(12+level*3+quality*18),name:(affixes.length?AFFIXES.find(a=>a.id===affixes[0]).name+' ':'')+base.name};
}
export function makeProfile(){return {version:3,embers:0,ranks:{knight:0,rogue:0,seer:0},bestFloor:0,runs:0,victories:0,discovered:[],achievements:[],onboarded:false,tutorialDone:false,introSeen:false,rating:0};}
export function readProfile(raw){
 const fresh=makeProfile();try{const o=typeof raw==='string'?JSON.parse(raw):raw;if(!o||o.version!==3)return fresh;
  for(const k of ['embers','bestFloor','runs','victories','rating'])fresh[k]=clamp(Math.floor(Number(o[k])||0),0,k==='rating'?5:k==='bestFloor'?100:1000000);
  for(const h of HEROES)fresh.ranks[h.id]=clamp(Math.floor(Number(o.ranks?.[h.id])||0),0,10);
  fresh.discovered=[...new Set((o.discovered??[]).filter(id=>ENEMY_BY_ID[id]))];fresh.achievements=(o.achievements??[]).filter(x=>typeof x==='string').slice(0,30);fresh.onboarded=!!o.onboarded||!!o.tutorialDone;fresh.tutorialDone=!!o.tutorialDone;fresh.introSeen=!!o.introSeen;return fresh;
 }catch{return fresh;}
}
export class Campaign{
 constructor({seed=Date.now()>>>0,hero='knight',difficulty='oathbound',height=688,rank=0,tutorial=false}={}){
  this.seed=seed>>>0;this.random=new CampaignRandom(this.seed);this.hero=HEROES.find(h=>h.id===hero)??HEROES[0];this.difficulty=DIFFICULTIES.find(d=>d.id===difficulty)??DIFFICULTIES[1];this.rank=clamp(rank,0,10);this.arena=portraitArena(height);this.floor=1;this.level=1;this.xp=0;this.gold=0;this.essence=0;this.kills=0;this.runTime=0;this.time=0;this.state='playing';this.nextId=1;this.combo=-1;this.comboTimer=0;this.events=[];this.effects=[];this.projectiles=[];this.corpses=[];this.dangers=[];this.drops=[];this.enemies=[];this.seen=new Set();this.inventory=[];this.equipment=Object.fromEntries(EQUIP_SLOTS.map(s=>[s,null]));this.skillRanks={};this.skills=[this.hero.skillIds[0],null];this.cooldowns={};this.flasks=this.difficulty.flasks;this.rewardClaimed=false;this.toast='';this.toastTime=0;this.shake=0;this.freeze=0;this.tutorial=tutorial?{step:0,progress:0,finished:false}:null;
  this.blessings={damage:0,maxHp:0,maxFocus:0};this.eventsResolved=0;
  this.player={...this.arena.start,hp:1,maxHp:1,stamina:100,focus:1,maxFocus:1,damage:1,speed:1,defense:0,crit:5,lifesteal:0,staminaRegen:28,range:this.hero.range,action:'idle',at:0,face:'n',aim:-Math.PI/2,invuln:1,rollCooldown:0,attackKind:0,hitIds:new Set(),ward:0,orbit:0,dodgeCrit:0};
  for(const kind of [this.hero.weapon,'armor','boots']){const item=createItem(`item-abbey-${kind}`,1,this.random.int(0xffffffff),0,0);this.inventory.push(item);this.equipment[ITEM_BY_ID[item.baseId].slot]=item.uid;}
  this.recalculate();this.player.hp=this.player.maxHp;this.player.focus=this.player.maxFocus;this.layout=generateFloor(this.seed,1);this.enterRoom(0);if(this.tutorial){this.enemies=[];this.room.type='practice';this.player.y=this.arena.bounds.bottom-60;this.player.hp=Math.max(20,this.player.maxHp-35);}
 }
 get room(){return this.layout.rooms.find(r=>r.id===this.layout.roomId);}
 get biome(){return BIOMES[chapter(this.floor)];}
 get activeEnemies(){return this.enemies.filter(e=>!e.dead);}
 next(){return this.random.next();}
 notify(text,seconds=3){this.toast=text;this.toastTime=seconds;this.events.push({type:'toast',text});}
 recalculate(){const p=this.player,h=this.hero,boost=1+(this.level-1)*.035+this.rank*.025,stats={maxHp:Math.round(h.hp*boost),maxFocus:Math.round(h.focus*(1+(this.level-1)*.02)),damage:Math.round(h.damage*boost),defense:h.defense,speed:h.speed,crit:h.id==='rogue'?10:5,lifesteal:0,staminaRegen:28,range:h.range};
  for(const uid of Object.values(this.equipment)){const item=this.inventory.find(x=>x.uid===uid);if(item)for(const [k,v]of Object.entries(item.stats))stats[k]=(stats[k]??0)+v;}
  for(const [k,v]of Object.entries(this.blessings))stats[k]=(stats[k]??0)+v;stats.maxHp=Math.max(30,stats.maxHp);stats.damage=Math.max(3,stats.damage);
  Object.assign(p,stats);p.speed=Math.min(p.speed,155);p.defense=Math.min(p.defense,50);p.crit=Math.min(p.crit,65);p.hp=clamp(p.hp,0,p.maxHp);p.focus=clamp(p.focus,0,p.maxFocus);
 }
 equip(uid){const item=this.inventory.find(i=>i.uid===uid),base=item&&ITEM_BY_ID[item.baseId];if(!base?.slot||base.hero&&base.hero!==this.hero.id)return false;this.equipment[base.slot]=this.equipment[base.slot]===uid?null:uid;this.recalculate();this.events.push({type:'equip'});return true;}
 salvage(uid){const i=this.inventory.findIndex(x=>x.uid===uid);if(i<0||Object.values(this.equipment).includes(uid))return false;const [item]=this.inventory.splice(i,1);this.gold+=Math.round(item.value/2);this.essence+=1+item.quality;this.events.push({type:'salvage'});return true;}
 consume(uid){const i=this.inventory.findIndex(x=>x.uid===uid);if(i<0)return false;const b=ITEM_BY_ID[this.inventory[i].baseId],p=this.player;if(b.kind==='flask')p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.4);else if(b.kind==='elixir'){p.focus=p.maxFocus;p.stamina=100;}else return false;this.inventory.splice(i,1);this.events.push({type:'heal'});return true;}
 equipSkill(id,slot){const s=SKILLS.find(s=>s.id===id&&s.hero===this.hero.id);if(!s||this.level<s.level||slot<0||slot>1)return false;this.skills=this.skills.map(x=>x===id?null:x);this.skills[slot]=id;return true;}
 upgradeSkill(id){const s=SKILLS.find(s=>s.id===id&&s.hero===this.hero.id),rank=this.skillRanks[id]??0,cost=(rank+1)*6;if(!s||this.level<s.level||rank>=3||this.essence<cost)return false;this.essence-=cost;this.skillRanks[id]=rank+1;this.notify(`${s.name} strengthened to rank ${rank+1}.`);return true;}
 addItem(item){if(this.inventory.length>=60){this.gold+=Math.round(item.value/2);this.notify('Satchel full. The offering was salvaged for gold.');return false;}this.inventory.push(item);this.events.push({type:'loot',item:item.baseId});return true;}
 loot(boss=false){const available=ITEMS.filter(i=>i.biome===chapter(this.floor)&&(!i.hero||i.hero===this.hero.id)),base=this.random.pick(available);const item=createItem(base.id,this.floor,this.random.int(0xffffffff),boss?2:0);this.addItem(item);return item;}
 buy(index){const stock=this.room.stock?.[index];if(!stock||stock.sold)return false;const item=createItem(stock.baseId,this.floor,stock.seed,1),cost=item.value*2;if(this.gold<cost||this.inventory.length>=60)return false;this.gold-=cost;this.addItem(item);stock.sold=true;return true;}
 makeGeometry(room){const a=portraitArena(this.arena.height),b=a.bounds,H=b.bottom-b.top,Y=t=>Math.round(b.top+H*t),kind=room.layout??'nave';
  a.props=[];a.floorTiles=[];a.colliders=[];a.header=ROOM_LAYOUTS.find(l=>l.id===kind)?.header??'cloister';
  const prop=(type,x,t,w=30,h=12,kit=false)=>{const p={type,x,y:Y(t),w,h,kit};a.props.push(p);if(w&&h)a.colliders.push({x:x-w/2,y:p.y-h+3,w,h});};
  const tile=(type,x,t,solid=false,height=80)=>{const y=Y(t);a.floorTiles.push({type,x,y,height});if(solid)a.colliders.push({x:x-28,y:y-height/2+22,w:54,h:height-41});};
  a.props.push({type:'brazier',x:30,y:121,w:0,h:0},{type:'brazier',x:330,y:121,w:0,h:0});
  if(!this.tutorial){
   if(kind==='nave'){for(const t of [.24,.51,.78])tile('carpet',180,t);for(const x of [83,277])for(const t of [.3,.75])prop('statue',x,t,32,12);}
   if(kind==='cloister'){for(const x of [105,255])for(const t of [.28,.73])prop('pillar',x,t,36,12);tile('rune',180,.5);}
   if(kind==='bridge'){for(const x of [90,270])for(const t of [.23,.77])tile(this.biome.index===3?'lava':'pit',x,t,true,Math.max(80,Math.round(H*.36)));tile('pressure',180,.3);tile('pressure',180,.7);}
   if(kind==='crypt'){for(const x of [102,258])for(const t of [.29,.73])prop('sarcophagus',x,t,54,14,true);tile('rune',180,.5);}
   if(kind==='cistern'){for(const x of [100,260])for(const t of [.24,.77])tile('water',x,t,true,Math.max(80,Math.round(H*.32)));prop('well',78,.52,50,14,true);tile('grate',180,.5);}
   if(kind==='gallery'){for(let n=0;n<4;n++)prop(n%2?'statue':'pillar',n%2?266:94,.19+n*.2,32,12);tile('carpet',180,.49);}
   if(kind==='arena'){tile('arena-seal',180,.5);for(const x of [77,283])for(const t of [.22,.83])prop('broken-column',x,t,42,10,true);}
   if(kind==='crossing'){for(const x of [91,269])for(const t of [.23,.78])tile('grate',x,t);for(const t of [.26,.75])tile('carpet',180,t);tile('arena-seal',180,.5);}
   if(kind==='archive'){for(const x of [98,262])for(const t of [.28,.74])prop('bookcase',x,t,65,14,true);tile('rune',180,.5);}
   if(kind==='grove'){for(const x of [88,272])for(const t of [.31,.78])prop('roots',x,t,52,13,true);tile('rune',180,.5);}
   if(kind==='foundry'){for(const x of [102,258])for(const t of [.3,.76])prop('machine',x,t,52,14,true);for(const t of [.25,.75])tile('grate',180,t);}
   if(kind==='ritual'){for(const x of [103,257])for(const t of [.29,.77])prop('obelisk',x,t,40,12,true);tile('rune',180,.5);}
   for(let n=0;n<2+room.pattern%3;n++)prop(n%2?'urn':'debris',n%2?312:48,.16+n*.22,n%2?14:0,n%2?10:0,! (n%2));
  }
  if(room.type==='treasure')prop(room.opened?'chest-open':'chest-closed',180,.5,32,13);
  if(['hearth','entrance'].includes(room.type)&&!this.tutorial){const y=b.bottom-65;a.props.push({type:'shrine',x:80,y,w:24,h:11});a.colliders.push({x:68,y:y-8,w:24,h:11});}
  if(room.type==='merchant')prop('merchant',180,.3,26,13);
  if(room.event){const p={x:180,y:Y(.5)};a.props.push({type:room.event.id,event:true,x:p.x,y:p.y,w:42,h:12});a.colliders.push({x:p.x-21,y:p.y-9,w:42,h:12});}
  return a;
 }
 eventPosition(){const b=this.arena.bounds;return {x:180,y:Math.round((b.top+b.bottom)/2)};}
 roomLocked(){return this.enemies.length>0||this.room.event?.status==='active';}
 eventInfo(){const state=this.room.event,def=state&&EVENT_BY_ID[state.id];if(!def)return null;const cost=Math.round(40+this.floor*3),blood=Math.ceil(this.player.maxHp*.22),weapon=this.inventory.find(i=>i.uid===this.equipment.weapon);
  return {...def,status:state.status,choices:def.choices.map(c=>{let available=state.status==='pending',detail=c.detail;if(c.id==='offer')available=available&&this.player.hp>blood;if(c.id==='flask')available=available&&this.flasks>0;if(c.id==='gold')available=available&&this.gold>=25;if(c.id==='temper'){available=available&&this.gold>=cost&&!!weapon?.stats.damage;detail=`Spend ${cost} gold. Increase your equipped weapon's damage by 20% (at least 2).`;}if(c.id==='fury')available=available&&this.player.maxHp>45;return {...c,detail,available};})};
 }
 completeEvent(message){const e=this.room.event;if(!e||e.claimed)return false;e.status='resolved';e.claimed=true;e.remaining=0;e.wavePending=false;this.room.cleared=true;this.eventsResolved++;this.events.push({type:'event-resolved',id:e.id});this.notify(message,5);return true;}
 eventOffering(minimum=2,weapon=false){const pool=ITEMS.filter(i=>i.biome===chapter(this.floor)&&(!i.hero||i.hero===this.hero.id)&&(!weapon||i.kind===this.hero.weapon));const item=createItem(this.random.pick(pool).id,this.floor,this.random.int(0xffffffff),minimum);this.addItem(item);return item;}
 startEventWave(){const s=this.room.event;if(!s||s.status!=='active')return;s.wave++;s.wavePending=false;const duel=s.id==='shadow-duel',count=duel?1:s.id==='restless-bell'?2:3,b=this.arena.bounds;
  for(let n=0;n<count;n++){const id=`${this.biome.id}-${s.id==='sealed-library'?[1,2,4][n]:duel?4:this.random.int(5)}`,e=this.spawn(id,n%2?252:108,b.top+(b.bottom-b.top)*(.23+Math.floor(n/2)*.45));if(duel){e.elite=true;e.hp=Math.round(e.hp*1.8);e.maxHp=e.hp;}if(dist(e,this.player)<70){e.x=360-this.player.x;e.y=b.top+(b.bottom-b.top)*.25;this.safePosition(e,e.radius);}e.timer=1.1;}
  this.events.push({type:'event-progress'});this.notify(duel?'The reflection steps through.':s.id==='restless-bell'?`The bell answers / Wave ${s.wave} of 3`:'The seal breaks. Defend yourself.',3);
 }
 finishEventCombat(){const s=this.room.event;if(!s||s.status!=='active'||s.id==='trap-vault')return false;if(s.id==='restless-bell'&&s.wave<3){s.wavePending=true;s.cadence=1.15;this.notify('Another answer gathers beneath the ash.',2);this.events.push({type:'event-progress'});return true;}
  const item=this.eventOffering(s.id==='restless-bell'?3:2,s.id==='shadow-duel');this.gold+=s.id==='cursed-cache'?35+this.floor*2:s.id==='restless-bell'?65+this.floor*2:20+this.floor;if(s.id==='sealed-library')this.essence+=9;this.completeEvent(`The trial is answered. Received ${item.name}.`);return true;
 }
 resolveEvent(choice){const s=this.room.event,info=this.eventInfo(),option=info?.choices.find(c=>c.id===choice);if(this.state!=='playing'||!s||s.status!=='pending'||!option?.available||this.enemies.length)return false;s.choice=choice;
  const p=this.player;if(choice==='leave')return this.completeEvent('You leave the promise undisturbed.');
  if(['cursed-cache','sealed-library','shadow-duel','restless-bell'].includes(s.id)&&['open','unbind','duel','ring'].includes(choice)){s.status='active';this.room.cleared=false;s.wave=0;this.startEventWave();return true;}
  if(s.id==='trap-vault'){s.status='active';s.remaining=12;s.cadence=.2;this.room.cleared=false;p.invuln=Math.max(p.invuln,.5);this.notify('Falling stars / Survive 12 seconds. Keep moving.',4);this.events.push({type:'event-progress'});return true;}
  let message='The promise becomes part of you.';
  if(s.id==='blood-altar'){p.hp-=Math.ceil(p.maxHp*.22);const item=this.eventOffering();message='Blood given. Received '+item.name+'.';}
  if(s.id==='lost-pilgrim'){if(choice==='flask'){this.flasks--;this.eventOffering(1);this.essence+=6;}else{this.gold-=25;this.essence+=6;p.hp=Math.min(p.maxHp,p.hp+20);}message='The pilgrim remembers kindness. +6 essence.';}
  if(s.id==='oath-shrine'){if(choice==='steel')this.blessings.damage+=5;if(choice==='vigor')this.blessings.maxHp+=20;if(choice==='stars')this.blessings.maxFocus+=25;this.recalculate();if(choice==='vigor')p.hp=Math.min(p.maxHp,p.hp+20);if(choice==='stars')p.focus=p.maxFocus;}
  if(s.id==='sealed-library'){this.awardXP(35+this.floor*3);this.essence+=5;message='A borrowed name is remembered. Experience and +5 essence.';}
  if(s.id==='wandering-smith'){const item=this.inventory.find(i=>i.uid===this.equipment.weapon),gain=Math.max(2,Math.ceil(item.stats.damage*.2));this.gold-=40+this.floor*3;item.stats.damage+=gain;item.tempered=true;this.recalculate();message=`The smith wakes your weapon. +${gain} weapon damage.`;this.events.push({type:'equip'});}
  if(s.id==='memory-vow'){if(choice==='fury'){this.blessings.maxHp-=15;this.blessings.damage+=9;}else{this.blessings.damage-=3;this.blessings.maxHp+=30;}this.recalculate();if(choice==='mercy')p.hp=Math.min(p.maxHp,p.hp+30);}
  this.completeEvent(message);return true;
 }
 updateEvent(dt){const s=this.room.event;if(!s||s.status!=='active'||this.state!=='playing')return;if(s.id==='trap-vault'){s.remaining=Math.max(0,s.remaining-dt);s.cadence-=dt;if(s.remaining===0){this.dangers=[];const item=this.eventOffering();this.gold+=40+this.floor*2;this.completeEvent('The falling stars fade. Received '+item.name+'.');return;}if(s.cadence<=0){s.cadence+=1.15;const p=this.player,b=this.arena.bounds;this.area(clamp(p.x,70,290),clamp(p.y,b.top+35,b.bottom-35),27,11+this.floor*.25,'#d8a073',.85,true);if(s.remaining<7)this.area(clamp(360-p.x,75,285),clamp(p.y+(s.remaining%2<1?55:-55),b.top+35,b.bottom-35),23,11+this.floor*.25,'#d8a073',1.05,true);}}
  else if(s.wavePending){s.cadence-=dt;if(s.cadence<=0)this.startEventWave();}
 }
 solid(x,y,r=7){const b=this.arena.bounds;if(x<b.left+r||x>b.right-r||y<b.top+r||y>b.bottom-r)return true;if(r>=12&&(x<87||x>273))return true;return this.arena.colliders.some(c=>x+r>c.x&&x-r<c.x+c.w&&y+r>c.y&&y-r<c.y+c.h);}
 move(o,dx,dy,r=7){if(!this.solid(o.x+dx,o.y,r))o.x+=dx;if(!this.solid(o.x,o.y+dy,r))o.y+=dy;}
 clearLine(a,b){const length=dist(a,b);for(let n=6;n<length;n+=6){const t=n/length;if(this.arena.colliders.some(c=>{const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;return x>c.x&&x<c.x+c.w&&y>c.y&&y<c.y+c.h;}))return false;}return true;}
 safePosition(o,r=7){if(!this.solid(o.x,o.y,r))return;for(let n=8;n<320;n+=8)for(let a=0;a<TAU;a+=Math.PI/8){const x=o.x+Math.cos(a)*n,y=o.y+Math.sin(a)*n;if(!this.solid(x,y,r)){o.x=x;o.y=y;return;}}o.x=180;o.y=(this.arena.bounds.top+this.arena.bounds.bottom)/2;}
 resize(height){const old=this.arena.bounds,oldHeight=this.arena.height;this.arena.height=height;this.arena=this.makeGeometry(this.room);const b=this.arena.bounds;for(const o of [this.player,...this.enemies,...this.corpses,...this.drops,...this.projectiles,...this.effects,...this.dangers]){o.y=b.top+(o.y-old.top)/(old.bottom-old.top)*(b.bottom-b.top);if(o===this.player||this.enemies.includes(o))this.safePosition(o,o.radius??7);}if(this.tutorial&&oldHeight!==height)this.tutorial.progress=0;}
 spawn(id,x,y,summoned=false){const def=ENEMY_BY_ID[id];if(!def)return null;const boss=def.boss,large=boss||def.family==='brute',scale=this.difficulty.health,hp=Math.round((boss?210+this.floor*20:40+this.floor*2.6+(large?45:0))*scale),e={id:this.nextId++,kind:id,x,y,hp,maxHp:hp,action:'idle',at:0,phase:'chase',timer:.4+this.next(),aim:0,face:'s',radius:large?12:7,hitFlash:0,dead:false,attacks:0,phase2:false,summoned,bleed:0,chilled:0};this.safePosition(e,e.radius);this.enemies.push(e);this.seen.add(id);this.effects.push({type:'spawn',x:e.x,y:e.y,life:.6,max:.6,color:def.color});return e;}
 enterRoom(id,from=null){
  const old=this.room;if(old){old.savedEnemies=this.enemies.filter(e=>!e.dead).map(e=>({...e}));old.savedDrops=this.drops.map(d=>({...d}));}
  this.layout.roomId=id;const room=this.room;if(!room)throw Error('Room is missing');const first=!room.visited;room.visited=true;this.arena=this.makeGeometry(room);const b=this.arena.bounds;
  this.enemies=[];this.corpses=[];this.effects=[];this.dangers=[];this.drops=room.savedDrops??[];this.projectiles=[];
  this.player.x=from==='w'?b.right-28:from==='e'?b.left+28:180;this.player.y=from==='s'?b.top+38:from==='n'?b.bottom-36:b.bottom-70;this.player.action='idle';this.player.at=0;this.player.invuln=1;
  if(!first&&room.savedEnemies)this.enemies=room.savedEnemies;
  else if(!room.cleared)room.encounter.forEach((kind,k)=>this.spawn(kind,k%2?235:125,b.top+80+Math.floor(k/2)*90));
  if(room.type==='boss'&&first){const boss=this.enemies[0];boss.x=180;boss.y=b.top+115;this.events.push({type:'boss',id:boss.kind});this.notify(ENEMY_BY_ID[boss.kind].name,4);}
  this.safePosition(this.player);this.events.push({type:'room',first,room:room.type});if(first&&!this.tutorial)this.notify(room.event?EVENT_BY_ID[room.event.id].name:ROOM_LAYOUTS.find(l=>l.id===room.layout)?.name??'A forgotten chamber',2.5);
 }
 doors(){const b=this.arena.bounds,mid=(b.top+b.bottom)/2;return Object.entries(this.room.doors).map(([direction,id])=>({direction,id,x:direction==='w'?b.left+5:direction==='e'?b.right-5:180,y:direction==='n'?b.top+8:direction==='s'?b.bottom-8:mid}));}
 context(){if(this.tutorial)return this.tutorial.step===5&&this.player.y<this.arena.bounds.top+48&&Math.abs(this.player.x-180)<48?'Begin the descent':null;if(this.roomLocked())return null;const p=this.player,b=this.arena.bounds;
  if(this.room.event?.status==='pending'&&dist(p,this.eventPosition())<58)return 'Examine '+EVENT_BY_ID[this.room.event.id].name;
  if(this.room.type==='treasure'&&!this.room.opened&&dist(p,{x:180,y:(b.top+b.bottom)/2})<45)return 'Open offering';
  if(['hearth','entrance'].includes(this.room.type)&&!this.room.rested&&dist(p,{x:80,y:b.bottom-65})<42)return 'Rest at hearth';
  if(this.room.type==='merchant'&&dist(p,{x:180,y:b.top+(b.bottom-b.top)*.3})<48)return 'Speak to the keeper';
  if(['guardian','boss'].includes(this.room.type)&&p.y<b.top+48&&Math.abs(p.x-180)<55)return this.floor===100?'Claim the final bell':'Descend to floor '+(this.floor+1);
  const door=this.doors().find(d=>dist(p,d)<44);return door?'Enter '+this.layout.rooms.find(r=>r.id===door.id).type+' chamber':null;
 }
 interact(){if(this.state!=='playing')return false;
  if(this.tutorial){if(this.tutorial.step===5&&this.player.y<this.arena.bounds.top+48&&Math.abs(this.player.x-180)<48){this.tutorial.finished=true;this.tutorial=null;this.layout=generateFloor(this.seed,1);this.enemies=[];this.enterRoom(0);this.events.push({type:'tutorial-complete'});return true;}return false;}
  if(this.roomLocked()){this.notify('The doors are sealed until the trial is complete.');return false;}const p=this.player,b=this.arena.bounds;
  if(this.room.event?.status==='pending'&&dist(p,this.eventPosition())<58){this.events.push({type:'event',id:this.room.event.id});return true;}
  if(this.room.type==='treasure'&&!this.room.opened&&dist(p,{x:180,y:(b.top+b.bottom)/2})<45){this.room.opened=true;const item=this.loot();this.gold+=15+this.floor;this.notify('Offering received: '+item.name);this.arena=this.makeGeometry(this.room);this.events.push({type:'chest'});return true;}
  if(['hearth','entrance'].includes(this.room.type)&&!this.room.rested&&dist(p,{x:80,y:b.bottom-65})<42){this.room.rested=true;p.hp=p.maxHp;p.focus=p.maxFocus;p.stamina=100;this.flasks=this.difficulty.flasks;this.events.push({type:'heal'});this.notify('The ember remembers you. All strength restored.');return true;}
  if(this.room.type==='merchant'&&dist(p,{x:180,y:b.top+(b.bottom-b.top)*.3})<48){this.events.push({type:'merchant'});return true;}
  if(['guardian','boss'].includes(this.room.type)&&p.y<b.top+48&&Math.abs(p.x-180)<55){return this.descend();}
  const door=this.doors().find(d=>dist(p,d)<44);if(door){this.enterRoom(door.id,door.direction);return true;}return false;
 }
 descend(){if(this.state!=='playing'||!this.room.cleared||!['guardian','boss'].includes(this.room.type))return false;if(this.floor===100){this.state='ending';this.events.push({type:'ending'});return true;}
  this.floor++;this.flasks=Math.min(this.difficulty.flasks,this.flasks+1);this.player.hp=Math.min(this.player.maxHp,this.player.hp+Math.round(this.player.maxHp*.15));this.player.focus=Math.min(this.player.maxFocus,this.player.focus+25);this.layout=generateFloor(this.seed,this.floor);this.enemies=[];this.enterRoom(0);this.events.push({type:'floor',floor:this.floor,biome:this.biome.id});this.notify(`${this.biome.name} / Floor ${this.floor}`);return true;
 }
 awardXP(amount){this.xp+=amount;while(this.xp>=this.level*45){this.xp-=this.level*45;this.level++;this.essence+=3;this.recalculate();this.player.hp=Math.min(this.player.maxHp,this.player.hp+25);this.player.focus=this.player.maxFocus;const unlocked=SKILLS.filter(s=>s.hero===this.hero.id&&s.level===this.level);for(const s of unlocked)if(!this.skills[1])this.skills[1]=s.id;this.notify(`Level ${this.level}${unlocked.length?' / '+unlocked[0].name+' unlocked':''}`,4);this.events.push({type:'level'});}}
 hitEnemy(e,damage,{stagger=false,critical=false}={}){if(e.dead)return;const def=ENEMY_BY_ID[e.kind],p=this.player;damage=Math.max(1,Math.round(damage*(e.marked>0?2:1)));e.hp-=damage;e.hitFlash=.14;this.effects.push({type:'number',x:e.x,y:e.y-(def.boss?82:56),text:String(damage)+(critical?'!':''),life:.65,max:.65,color:critical?'#f6dda0':'#d9e4d5'});if(p.lifesteal)p.hp=Math.min(p.maxHp,p.hp+Math.max(1,Math.round(damage*p.lifesteal/100)));
  if(!def.boss||stagger){e.phase='hurt';e.timer=stagger?.5:.22;e.action='hurt';e.at=0;}this.shake=stagger?3:1.5;this.events.push({type:e.hp<=0?'kill':'hit'});
  if(e.hp<=0){e.dead=true;e.action='death';e.at=0;this.corpses.push(e);this.enemies=this.enemies.filter(x=>x!==e);this.kills++;this.gold+=(def.boss?100:4)+Math.round(this.floor*.8);this.essence+=def.boss?8:1;this.awardXP(def.boss?120+this.floor*3:10+Math.round(this.floor*.65));p.focus=Math.min(p.maxFocus,p.focus+(this.hero.id==='seer'?12:5));if(def.boss||this.next()<.23)this.drops.push({x:e.x,y:e.y,item:createItem(this.random.pick(ITEMS.filter(i=>i.biome===chapter(this.floor)&&(!i.hero||i.hero===this.hero.id))).id,this.floor,this.random.int(0xffffffff),def.boss?2:0),age:0});if(def.boss){this.events.push({type:'boss-death'});this.flasks=this.difficulty.flasks;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.3);}
   if(!this.enemies.length&&!this.tutorial&&!this.finishEventCombat()){this.room.cleared=true;this.events.push({type:'clear'});this.notify(def.boss?'An oath is broken. The stair is open.':'Chamber cleared. The doors unseal.');}
  }
 }
 damagePlayer(amount,source={x:180,y:150}){const p=this.player;if(p.invuln>0||p.hp<=0||this.state!=='playing')return false;
  if(p.action==='block'&&Math.cos(targetAngle(p,source)-p.aim)>-.2&&p.stamina>=16){p.stamina-=16;p.invuln=.12;if(this.hero.id==='knight'&&p.at<.25)p.focus=Math.min(p.maxFocus,p.focus+10);this.events.push({type:'block'});return false;}
  const hit=Math.max(2,Math.round(amount*this.difficulty.damage*(1-p.defense/(p.defense+35))*(p.ward>0?.35:1)));p.hp=Math.max(0,p.hp-hit);p.invuln=.75;p.action=p.hp>0?'hurt':'death';p.at=0;this.shake=4;this.events.push({type:p.hp>0?'hurt':'death'});if(p.hp<=0){this.state='dying';this.deathTimer=1.2;}
  return true;
 }
 attack(){const p=this.player,next=this.comboTimer>0?(this.combo+1)%3:0,c=HERO_COMBAT[next],cost=this.hero.id==='seer'?9:c.cost;if(this.state!=='playing'||!['idle','walk','block'].includes(p.action)||p.stamina<cost)return false;p.stamina-=cost;p.action='attack';p.at=0;p.hitIds.clear();p.attackKind=next;p.fired=false;p.practiceFired=false;this.combo=next;this.comboTimer=1;this.events.push({type:this.hero.id==='seer'?'cast':next===2?'heavy':'swing'});return true;}
 roll(mx=0,my=0){const p=this.player;if(this.state!=='playing'||!['idle','walk','block'].includes(p.action)||p.rollCooldown>0||p.stamina<22)return false;const length=Math.hypot(mx,my);p.rollX=length?mx/length:Math.cos(p.aim);p.rollY=length?my/length:Math.sin(p.aim);p.stamina-=22;p.rollCooldown=.67;p.invuln=.29;p.action='roll';p.at=0;p.dodgeCrit=1.5;this.events.push({type:'roll'});if(this.tutorial?.step===2)this.tutorial.progress++;return true;}
 heal(){const p=this.player;if(this.flasks<=0||p.hp>=p.maxHp||!['idle','walk','block'].includes(p.action))return false;this.flasks--;p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.48);p.focus=Math.min(p.maxFocus,p.focus+15);this.events.push({type:'heal'});this.notify('Hearthwater / '+this.flasks+' charges remain.');if(this.tutorial?.step===4)this.tutorial.progress++;return true;}
 bolt(source,angle,speed,damage,{enemy=false,pierce=false,color='#8cced8',radius=4,life=2.2}={}){this.projectiles.push({x:source.x,y:source.y-5,angle,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage,enemy,pierce,color,radius,life,hitIds:[],sourceId:source.id??0});}
 area(x,y,radius,damage,color='#e6ba6d',delay=0,enemy=false){this.dangers.push({x,y,radius,damage,color,timer:delay,max:Math.max(delay,.25),active:false,enemy});}
 useSkill(slot){const id=this.skills[slot],s=SKILLS.find(x=>x.id===id),p=this.player;if(this.state!=='playing'||!s||this.level<s.level||this.cooldowns[id]>0||p.focus<s.cost||['hurt','death','roll'].includes(p.action))return false;p.focus-=s.cost;this.cooldowns[id]=s.cooldown;const mult=s.mult*(1+(this.skillRanks[id]??0)*.18),targets=[...this.enemies].sort((a,b)=>b.maxHp-a.maxHp),strong=targets[0],color=s.color;
  if(s.kind==='cleave'||s.kind==='nova'){this.area(p.x,p.y,s.radius,p.damage*mult,color,.15);if(s.kind==='nova')p.hp=Math.min(p.maxHp,p.hp+p.maxHp*.2);}
  if(s.kind==='ward'){p.ward=s.duration;p.stamina=100;}
  if(s.kind==='dash'){const start={x:p.x,y:p.y};p.invuln=.45;for(let n=0;n<12;n++)this.move(p,Math.cos(p.aim)*8,Math.sin(p.aim)*8);for(const e of [...this.enemies])if(dist(start,e)<s.radius||dist(p,e)<55)this.hitEnemy(e,p.damage*mult,{stagger:true});this.effects.push({type:'dash',x:start.x,y:start.y,toX:p.x,toY:p.y,life:.4,max:.4,color});}
  if(s.kind==='blades')for(let n=0;n<6;n++)this.bolt(p,p.aim+n*TAU/6,220,p.damage*mult,{pierce:true,color,radius:5});
  if(s.kind==='mark'&&strong){strong.marked=s.duration;this.hitEnemy(strong,p.damage);}
  if(s.kind==='bolt')for(let n=0;n<3;n++){const e=targets[n%Math.max(1,targets.length)];this.bolt(p,e?targetAngle(p,e):p.aim+(n-1)*.15,245,p.damage*mult,{pierce:true,color});}
  if(s.kind==='orbit'){p.orbit=s.duration;p.orbitTick=0;}
  if(s.kind==='meteor'){const e=strong??{x:p.x+Math.cos(p.aim)*80,y:p.y+Math.sin(p.aim)*80};this.area(e.x,e.y,s.radius,p.damage*mult,color,.85);}
  this.events.push({type:'skill',id});if(this.tutorial?.step===3)this.tutorial.progress++;return true;
 }
 chooseEnemyAttack(e){const def=ENEMY_BY_ID[e.kind],p=this.player;e.attacks++;e.aim=targetAngle(e,p);e.face=facing(e.aim);e.hitPlayer=false;e.action='attack';e.at=0;e.phase='windup';
  const patterns=[['sweep','ring','slam'],['volley','summon','ring'],['roots','slam','charge'],['slam','volley','ring'],['sweep','summon','ring'],['charge','volley','ring'],['ring','roots','summon'],['meteor','volley','ring'],['sweep','charge','meteor'],['ring','summon','meteor','charge']];
  e.move=def.boss?patterns[def.biome][(e.attacks-1)%patterns[def.biome].length]:['caster','ranged','archer'].includes(def.behavior)?'shot':['charge','ambush'].includes(def.behavior)?'charge':def.behavior==='slam'?'slam':'sweep';
  e.phase2=def.boss&&e.hp/e.maxHp<.5;e.timer=(def.boss?.85:.42)*(e.phase2?.76:1);e.lockX=p.x;e.lockY=p.y;
  if(e.move==='meteor')this.area(p.x,p.y,48,15+this.floor*.35,def.color,e.timer+.45,true);
  if(e.move==='roots')for(let n=0;n<4;n++)this.area(clamp(p.x+(n-1.5)*38,75,285),p.y+Math.sin(n)*28,22,12+this.floor*.3,def.color,e.timer+.15*n,true);
 }
 releaseEnemyAttack(e){const def=ENEMY_BY_ID[e.kind],p=this.player,damage=((def.boss?12:7)+this.floor*.32)*(e.elite?1.35:1),color=def.color;e.phase='active';e.timer=e.move==='charge'?.42:.17;
  if(e.move==='shot'||e.move==='volley'){const shots=e.move==='volley'?e.phase2?7:5:def.behavior==='archer'?1:3;for(let n=0;n<shots;n++)this.bolt(e,e.aim+(n-(shots-1)/2)*.18,def.boss?125:110,damage,{enemy:true,color,life:3});}
  if(e.move==='ring'){for(let n=0;n<(e.phase2?12:9);n++)this.bolt(e,n*TAU/(e.phase2?12:9)+e.attacks*.23,93,damage,{enemy:true,color,life:3.8});}
  if(e.move==='summon'&&this.enemies.length<6){for(let n=0;n<2;n++)this.spawn(`${this.biome.id}-${(e.attacks+n)%5}`,e.x+(n?55:-55),e.y+45,true);}
  if(e.move==='slam')this.area(e.x,e.y,def.boss?72:53,damage*1.3,color,.02,true);
  this.events.push({type:'enemy-attack',kind:e.move});
 }
 updateEnemy(e,dt){const def=ENEMY_BY_ID[e.kind],p=this.player;e.at+=dt;e.timer-=dt;e.hitFlash=Math.max(0,e.hitFlash-dt);e.marked=Math.max(0,(e.marked??0)-dt);e.chilled=Math.max(0,e.chilled-dt);
  if(e.phase==='hurt'){if(e.timer<=0){e.phase='chase';e.timer=.35;}return;}
  if(e.phase==='windup'){if(e.timer<=0)this.releaseEnemyAttack(e);return;}
  if(e.phase==='active'){
   if(e.move==='charge'){this.move(e,Math.cos(e.aim)*210*dt,Math.sin(e.aim)*210*dt,e.radius);if(!e.hitPlayer&&dist(e,p)<e.radius+15){this.damagePlayer(((def.boss?15:9)+this.floor*.3)*(e.elite?1.35:1),e);e.hitPlayer=true;}}
   if(e.move==='sweep'&&!e.hitPlayer&&dist(e,p)<(def.boss?70:def.behavior==='lancer'?64:43)&&Math.cos(targetAngle(e,p)-e.aim)>-.1&&this.clearLine(e,p)){this.damagePlayer(((def.boss?14:8)+this.floor*.3)*(e.elite?1.35:1),e);e.hitPlayer=true;}
   if(e.timer<=0){e.phase='recover';e.timer=def.boss?.65:.5;}return;
  }
  if(e.phase==='recover'){if(e.timer<=0){e.phase='chase';e.timer=.15;e.action='idle';e.at=0;}return;}
  const length=dist(e,p),ranged=['caster','ranged','archer'].includes(def.behavior),reach=def.boss?115:ranged?165:['charge','ambush'].includes(def.behavior)?135:def.behavior==='lancer'?61:44;e.aim=targetAngle(e,p);e.face=facing(e.aim);
  if(length<reach&&e.timer<=0&&this.clearLine(e,p)){this.chooseEnemyAttack(e);return;}
  let speed=def.boss?37:def.family==='hound'?62:def.family==='crawler'?44:def.family==='brute'?28:39;speed*=e.chilled>0?.5:1;
  const backwards=ranged&&length<90,move=length>(ranged?115:reach-8)||backwards;e.action=move?'walk':'idle';if(move){const sign=backwards?-1:1,dx=Math.cos(e.aim)*speed*dt*sign,dy=Math.sin(e.aim)*speed*dt*sign;const before={x:e.x,y:e.y};this.move(e,dx,dy,e.radius);if(dist(before,e)<.05)this.move(e,-dy,dx,e.radius);}
 }
 updateTutorial(input,dt,moving){const t=this.tutorial;if(!t)return;t.age=(t.age??0)+dt;if(t.step===0&&moving)t.progress+=dt;const rune={x:180,y:this.arena.bounds.top+190};if((t.step===0&&t.progress>.7&&dist(this.player,rune)<20)||(t.step===1&&t.progress>=3)||(t.step>=2&&t.step<=4&&t.progress>=1)){t.step++;t.progress=0;t.age=0;this.events.push({type:'tutorial-step',step:t.step});if(t.step===4)this.player.hp=Math.max(1,this.player.maxHp-45);}if(t.step===3)this.player.focus=this.player.maxFocus;
  if(t.step===1&&this.player.action==='attack'&&!this.player.practiceFired){const p=this.player,c=HERO_COMBAT[p.attackKind],dummy={x:180,y:this.arena.bounds.top+155};if(p.at>=c.activeFrom&&p.at<=c.activeTo&&dist(p,dummy)<p.range+10&&Math.cos(targetAngle(p,dummy)-p.aim)>-.1){p.practiceFired=true;t.progress++;this.effects.push({type:'number',x:dummy.x,y:dummy.y-45,text:'HIT',life:.5,max:.5,color:'#e6ba6d'});this.events.push({type:'hit'});}}
 }
 update(dt,input={}){
  dt=clamp(dt,0,.04);this.time+=dt;this.toastTime=Math.max(0,this.toastTime-dt);this.shake=Math.max(0,this.shake-dt*12);if(!['playing','dying'].includes(this.state))return;const p=this.player;p.at+=dt;for(const key of ['invuln','rollCooldown','ward','orbit','dodgeCrit'])p[key]=Math.max(0,(p[key]??0)-dt);for(const key of Object.keys(this.cooldowns))this.cooldowns[key]=Math.max(0,this.cooldowns[key]-dt);this.comboTimer=Math.max(0,this.comboTimer-dt);
  this.effects=this.effects.filter(e=>(e.life-=dt)>0);this.corpses.forEach(e=>e.at+=dt);if(this.state==='dying'){this.deathTimer-=dt;if(this.deathTimer<=0)this.state='dead';return;}this.runTime+=dt;
  const mx=(input.right?1:0)-(input.left?1:0),my=(input.down?1:0)-(input.up?1:0),moving=!!(mx||my);if(!['attack','roll','hurt'].includes(p.action)){if(input.aim?.active)p.aim=Math.atan2(input.aim.y-p.y,input.aim.x-p.x);else if(moving)p.aim=Math.atan2(my,mx);p.face=facing(p.aim);}
  if(input.roll)this.roll(mx,my);if(input.attack)this.attack();if(input.skill1)this.useSkill(0);if(input.skill2)this.useSkill(1);if(input.heal)this.heal();if(input.interact)this.interact();
  if(p.action==='roll'){this.move(p,p.rollX*235*dt,p.rollY*235*dt);if(p.at>=.30){p.action='idle';p.at=0;}}
  else if(p.action==='attack'){const c=HERO_COMBAT[p.attackKind];if(p.at>=c.activeFrom&&p.at<=c.activeTo){if(this.hero.id==='seer'){if(!p.fired){this.bolt(p,p.aim,225,p.damage*(p.attackKind===2?1.55:1),{pierce:p.attackKind===2});p.fired=true;}}else for(const e of [...this.enemies])if(!p.hitIds.has(e.id)&&dist(p,e)<p.range+e.radius&&Math.cos(targetAngle(p,e)-p.aim)>-.12&&this.clearLine(p,e)){p.hitIds.add(e.id);const critical=this.next()<(p.crit+(this.hero.id==='rogue'&&p.dodgeCrit>0?30:0))/100;this.hitEnemy(e,p.damage*(p.attackKind===2?1.5:1)*(critical?1.7:1),{stagger:p.attackKind===2,critical});}}if(p.at>=c.duration){p.action='idle';p.at=0;}}
  else if(p.action==='hurt'){if(p.at>=.30){p.action='idle';p.at=0;}}
  else{const last=p.action;p.action=input.block&&p.stamina>4?'block':moving?'walk':'idle';if(last!==p.action)p.at=0;if(moving){const length=Math.hypot(mx,my),speed=p.speed*(p.action==='block'?.4:1);this.move(p,mx/length*speed*dt,my/length*speed*dt);}}
  if(!['attack','roll','block'].includes(p.action))p.stamina=clamp(p.stamina+p.staminaRegen*dt,0,100);p.focus=clamp(p.focus+2.8*dt,0,p.maxFocus);
  if(p.orbit>0){p.orbitTick=(p.orbitTick??0)-dt;if(p.orbitTick<=0){p.orbitTick=.5;for(const e of [...this.enemies])if(dist(p,e)<65)this.hitEnemy(e,p.damage*.7);}}
  if(!this.tutorial)for(const e of [...this.enemies])this.updateEnemy(e,dt);else this.updateTutorial(input,dt,moving);
  this.projectiles=this.projectiles.filter(b=>{b.life-=dt;b.x+=b.vx*dt;b.y+=b.vy*dt;if(b.life<=0||this.solid(b.x,b.y,2))return false;if(b.enemy){if(dist(b,p)<b.radius+8){this.damagePlayer(b.damage,b);return false;}}else for(const e of [...this.enemies])if(!b.hitIds.includes(e.id)&&dist(b,e)<b.radius+e.radius+3){b.hitIds.push(e.id);this.hitEnemy(e,b.damage);if(!b.pierce)return false;}return true;});
  this.dangers=this.dangers.filter(a=>{a.timer-=dt;if(a.timer>0)return true;if(!a.active){a.active=true;this.effects.push({type:'nova',x:a.x,y:a.y,radius:a.radius,life:.45,max:.45,color:a.color});if(a.enemy){if(dist(p,a)<a.radius)this.damagePlayer(a.damage,a);}else for(const e of [...this.enemies])if(dist(e,a)<a.radius+e.radius){this.hitEnemy(e,a.damage,{stagger:true});e.chilled=2;}}return false;});
  this.drops=this.drops.filter(d=>{d.age+=dt;if(d.age>.3&&dist(p,d)<25){this.addItem(d.item);this.notify('Found '+d.item.name);return false;}return true;});this.updateEvent(dt);
 }
 snapshot(){return {state:this.state,hero:this.hero.id,floor:this.floor,biome:this.biome.id,room:this.room.id,roomLayout:this.room.layout,mapForm:this.layout.form,event:this.room.event?{...this.room.event}:null,eventsResolved:this.eventsResolved,rooms:this.layout.rooms.length,enemies:this.enemies.length,player:{x:this.player.x,y:this.player.y,hp:this.player.hp,maxHp:this.player.maxHp,action:this.player.action,focus:this.player.focus,stamina:this.player.stamina},layout:{width:360,height:this.arena.height,bounds:{...this.arena.bounds}},tutorial:this.tutorial?.step??null,inventory:this.inventory.length,level:this.level,kills:this.kills};}
 serialize(){if(this.state==='dying'||this.state==='dead'||this.state==='ending')return null;const p={...this.player,hitIds:[...this.player.hitIds]};const room=this.room;room.savedEnemies=this.enemies.map(e=>({...e}));room.savedDrops=this.drops.map(d=>({...d}));return {version:3,seed:this.seed,random:this.random.value,hero:this.hero.id,difficulty:this.difficulty.id,rank:this.rank,height:this.arena.height,floor:this.floor,level:this.level,xp:this.xp,gold:this.gold,essence:this.essence,kills:this.kills,runTime:this.runTime,nextId:this.nextId,inventory:this.inventory,equipment:this.equipment,skillRanks:this.skillRanks,skills:this.skills,cooldowns:this.cooldowns,flasks:this.flasks,blessings:this.blessings,eventsResolved:this.eventsResolved,seen:[...this.seen],layout:this.layout,player:p,tutorial:this.tutorial};}
 static restore(raw,height){
  try{const o=typeof raw==='string'?JSON.parse(raw):raw;if(!o||o.version!==3||!HEROES.some(h=>h.id===o.hero)||!DIFFICULTIES.some(d=>d.id===o.difficulty)||!Number.isInteger(o.floor)||o.floor<1||o.floor>100||!Number.isFinite(o.player?.hp)||o.player.hp<=0||!Array.isArray(o.inventory)||o.inventory.length>60||!Array.isArray(o.layout?.rooms)||o.layout.rooms.length<5||o.layout.rooms.length>7||o.layout.revision!==2)return null;
   const c=new Campaign({seed:o.seed,hero:o.hero,difficulty:o.difficulty,height:o.height,rank:o.rank}),allowedStats=new Set(['damage','defense','maxHp','maxFocus','speed','crit','lifesteal','staminaRegen']);
   c.inventory=o.inventory.filter(i=>ITEM_BY_ID[i.baseId]&&typeof i.uid==='string'&&Number.isInteger(i.level)&&i.level>0&&i.level<=100&&i.stats&&Object.entries(i.stats).every(([k,v])=>allowedStats.has(k)&&Number.isFinite(v)&&v>=0&&v<=1000));c.equipment=Object.fromEntries(EQUIP_SLOTS.map(slot=>{const uid=o.equipment?.[slot],i=c.inventory.find(i=>i.uid===uid),b=i&&ITEM_BY_ID[i.baseId];return[slot,b?.slot===slot&&(!b.hero||b.hero===o.hero)?uid:null];}));
   c.floor=o.floor;c.layout=generateFloor(c.seed,c.floor);if(!c.layout.rooms.some(r=>r.id===o.layout.roomId))return null;c.layout.roomId=o.layout.roomId;
   for(const room of c.layout.rooms){const saved=o.layout.rooms.find(r=>r.id===room.id);if(!saved)return null;for(const k of ['visited','cleared','opened','rested'])room[k]=!!saved[k];if(room.stock&&saved.stock)room.stock=room.stock.map((s,n)=>({...s,sold:!!saved.stock[n]?.sold}));if(room.event){const e=saved.event;if(!e||e.id!==room.event.id||!['pending','active','resolved'].includes(e.status))return null;room.event={id:e.id,status:e.status,choice:EVENT_BY_ID[e.id].choices.some(c=>c.id===e.choice)?e.choice:null,claimed:e.status==='resolved',wave:clamp(Math.floor(e.wave)||0,0,3),remaining:clamp(Number(e.remaining)||0,0,12),cadence:clamp(Number(e.cadence)||0,0,1.3),wavePending:!!e.wavePending};room.cleared=e.status!=='active';}room.savedEnemies=(saved.savedEnemies??[]).filter(e=>ENEMY_BY_ID[e.kind]&&ENEMY_BY_ID[e.kind].biome===chapter(c.floor)&&Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.hp)&&e.hp>0&&e.hp<=100000).slice(0,6).map(e=>({...e,phase:['windup','active','recover','hurt','chase'].includes(e.phase)?e.phase:'chase'}));room.savedDrops=(saved.savedDrops??[]).filter(d=>Number.isFinite(d.x)&&Number.isFinite(d.y)&&ITEM_BY_ID[d.item?.baseId]).slice(0,12);}
   c.blessings=Object.fromEntries(['damage','maxHp','maxFocus'].map(k=>[k,clamp(Number(o.blessings?.[k])||0,-1000,1000)]));c.eventsResolved=clamp(Math.floor(o.eventsResolved)||0,0,100);
   for(const k of ['level','xp','gold','essence','kills','nextId'])c[k]=clamp(Math.floor(Number(o[k])||0),k==='level'?1:0,k==='level'?100:10000000);c.runTime=clamp(Number(o.runTime)||0,0,10000000);c.random.value=o.random>>>0;c.flasks=clamp(Math.floor(o.flasks)||0,0,c.difficulty.flasks);c.seen=new Set((o.seen??[]).filter(id=>ENEMY_BY_ID[id]));
   c.skills=[0,1].map(n=>{const s=SKILLS.find(s=>s.id===o.skills?.[n]&&s.hero===c.hero.id&&s.level<=c.level);return s?.id??null;});c.skillRanks=Object.fromEntries(c.hero.skillIds.map(id=>[id,clamp(Math.floor(o.skillRanks?.[id])||0,0,3)]));c.cooldowns=Object.fromEntries(c.hero.skillIds.map(id=>[id,clamp(Number(o.cooldowns?.[id])||0,0,30)]));c.tutorial=o.tutorial&&Number.isInteger(o.tutorial.step)&&o.tutorial.step>=0&&o.tutorial.step<6?{step:o.tutorial.step,progress:0,age:0}:null;
   c.arena=c.makeGeometry(c.room);c.enemies=c.room.savedEnemies??[];c.drops=c.room.savedDrops??[];for(const k of ['x','y','hp','focus','stamina','aim'])if(Number.isFinite(o.player[k]))c.player[k]=o.player[k];c.player.action='idle';c.player.at=0;c.player.hitIds=new Set();c.player.face=facing(c.player.aim);c.player.invuln=1;c.recalculate();for(const e of c.enemies)c.safePosition(e,e.radius??7);c.safePosition(c.player);if(height&&height!==c.arena.height)c.resize(height);c.events=[];return c;
  }catch{return null;}
 }
}
