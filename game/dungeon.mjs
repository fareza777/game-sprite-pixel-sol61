import {portraitArena,clamp} from './core.mjs';
import {BIOMES,ROOM_LAYOUTS,EVENTS,ITEMS} from './content.mjs';

class DungeonRandom{constructor(seed){this.v=seed>>>0;}next(){this.v=(Math.imul(this.v,1664525)+1013904223)>>>0;return this.v/4294967296;}int(n){return Math.floor(this.next()*n);}pick(a){return a[this.int(a.length)];}shuffle(a){a=[...a];for(let n=a.length-1;n>0;n--){const j=this.int(n+1);[a[n],a[j]]=[a[j],a[n]];}return a;}}
const DIRECTION_VECTORS={n:[0,-1],e:[1,0],s:[0,1],w:[-1,0]},OPPOSITE={n:'s',s:'n',e:'w',w:'e'};
export function createDungeonFloor(seed,floor){
 if(!Number.isInteger(floor)||floor<1||floor>100)throw Error('Invalid floor');
 const rng=new DungeonRandom(seed^Math.imul(floor,2654435761)),biome=Math.floor((floor-1)/10),boss=floor%10===0,count=(boss?7:8)+rng.int(boss?3:4),rooms=[{id:0,x:0,y:0,type:'entrance',doors:{}}];
 function add(parent,d){const [dx,dy]=DIRECTION_VECTORS[d],room={id:rooms.length,x:parent.x+dx,y:parent.y+dy,type:'combat',doors:{[OPPOSITE[d]]:parent.id}};parent.doors[d]=room.id;rooms.push(room);return room;}
 for(const d of rng.shuffle(Object.keys(DIRECTION_VECTORS)).slice(0,3))add(rooms[0],d);
 while(rooms.length<count){const candidates=rooms.flatMap(parent=>Object.entries(DIRECTION_VECTORS).filter(([d,[dx,dy]])=>!parent.doors.hasOwnProperty(d)&&Math.abs(parent.x+dx)<=3&&Math.abs(parent.y+dy)<=3&&!rooms.some(r=>r.x===parent.x+dx&&r.y===parent.y+dy)).map(([d])=>({parent,d})));const pick=rng.pick(candidates);if(!pick)throw Error('No dungeon frontier');add(pick.parent,pick.d);}
 for(const room of rooms)for(const [d,[dx,dy]]of Object.entries(DIRECTION_VECTORS)){const n=rooms.find(n=>n.x===room.x+dx&&n.y===room.y+dy);if(n&&room.id<n.id&&room.doors[d]===undefined&&rng.next()<.46){room.doors[d]=n.id;n.doors[OPPOSITE[d]]=room.id;}}
 const distance=new Map([[0,0]]),q=[rooms[0]];while(q.length){const room=q.shift();for(const id of Object.values(room.doors))if(!distance.has(id)){distance.set(id,distance.get(room.id)+1);q.push(rooms[id]);}}
 const farthest=Math.max(...distance.values()),goal=rng.pick(rooms.filter(r=>distance.get(r.id)===farthest));goal.type=boss?'boss':'guardian';goal.exit={side:rng.pick(['n','e','s','w']),kind:rng.pick(['stairs','spiral','lift','well']),offset:rng.pick([.3,.5,.7])};
 const branches=rng.shuffle(rooms.filter(r=>r!==goal&&r.id!==0)),eventDefs=rng.shuffle(EVENTS),eventCount=count>=10&&floor%3===0?2:1;
 for(let n=0;n<eventCount;n++){const room=branches.shift(),e=eventDefs[n];room.type='event';room.event={id:e.id,status:'pending',choice:null,claimed:false,wave:0,remaining:0,cadence:0};room.layout=e.layout;}
 for(const type of rng.shuffle(['treasure','hearth','merchant'])){const room=branches.shift();if(room)room.type=type;}
 const used=new Set();for(const room of rooms.filter(r=>r.event)){if(used.has(room.layout))room.layout=rng.pick(['ritual','reliquary','rotunda'].filter(id=>!used.has(id)));used.add(room.layout);}
 rooms[0].layout=rng.pick(['nave','gallery','crossing','barracks'].filter(id=>!used.has(id)));used.add(rooms[0].layout);goal.layout=rng.pick(['arena','ritual','observatory','reliquary','rotunda'].filter(id=>!used.has(id)));used.add(goal.layout);
 const layouts=rng.shuffle(ROOM_LAYOUTS).filter(l=>!used.has(l.id));
 for(const room of rooms){
  if(!room.layout)room.layout=layouts.shift().id;
  room.seed=rng.int(0xffffffff);room.pattern=rng.int(12);room.floorStyle=rng.int(4);room.lighting=rng.int(3);room.visited=false;room.cleared=!['combat','guardian','boss'].includes(room.type);room.opened=false;room.rested=false;room.encounter=[];
  if(room.type==='boss')room.encounter=[`${BIOMES[biome].id}-boss`];else if(!room.cleared){const amount=(room.type==='guardian'?3:2)+(floor>40?1:0);for(let n=0;n<amount;n++)room.encounter.push(`${BIOMES[biome].id}-${rng.int(5)}`);}
  if(room.type==='merchant')room.stock=Array.from({length:3},()=>({baseId:ITEMS[biome*10+rng.int(8)].id,seed:rng.int(0xffffffff),sold:false}));
 }
 return {revision:3,floor,biome,boss,goalId:goal.id,form:rng.int(0x1000000),rooms,roomId:0};
}

export function createEvolvingFloor(seed,floor){
 const layout=createDungeonFloor(seed,floor),rng=new DungeonRandom(seed^Math.imul(floor,134775813)^0x563247),rooms=layout.rooms;
 layout.revision=4;layout.shortcuts=[];
 for(const room of rooms)room.role=room.type==='treasure'?'relic':room.type==='hearth'||room.type==='entrance'?'rest':room.type==='merchant'?'trade':room.type;
 // A blocked adjacency creates a genuine shorter route without making its
 // lever necessary to complete the floor. Existing connected paths remain.
 const candidates=[];
 for(const a of rooms)for(const [da,[dx,dy]]of Object.entries(DIRECTION_VECTORS)){const b=rooms.find(r=>r.x===a.x+dx&&r.y===a.y+dy);if(b&&a.id<b.id&&a.doors[da]===undefined)candidates.push({a:a.id,b:b.id,da,db:OPPOSITE[da]});}
 if(!candidates.length){for(const a of rooms)for(const [da,id]of Object.entries(a.doors)){if(a.id>=id||a.id===0||id===0)continue;const b=rooms[id],visited=new Set([a.id]),q=[a];while(q.length){const r=q.shift();for(const next of Object.values(r.doors))if(!((r.id===a.id&&next===b.id)||(r.id===b.id&&next===a.id))&&!visited.has(next)){visited.add(next);q.push(rooms[next]);}}if(visited.size===rooms.length)candidates.push({a:a.id,b:b.id,da,db:OPPOSITE[da],remove:true});}}
 if(candidates.length){const s=rng.pick(candidates),lever=rng.pick(rooms.filter(r=>r.id!==0&&r.id!==s.a&&r.id!==s.b&&r.type!=='boss'&&r.type!=='guardian'));if(lever){if(s.remove){delete rooms[s.a].doors[s.da];delete rooms[s.b].doors[s.db];}layout.shortcuts.push({...s,open:false,switchRoom:lever.id});lever.switchFor=0;lever.switchActivated=false;}}
 const optional=room=>{const seen=new Set([0]),q=[0];while(q.length){const id=q.shift();for(const next of Object.values(rooms[id].doors))if(next!==room.id&&!seen.has(next)){seen.add(next);q.push(next);}}return seen.has(layout.goalId);};
 let eliteChoices=rooms.filter(r=>r.type==='combat'&&optional(r));if(!eliteChoices.length)eliteChoices=rooms.filter(r=>['merchant','hearth'].includes(r.type)&&optional(r));
 const elite=rng.pick(eliteChoices);if(elite){if(elite.type!=='combat'){elite.type='combat';elite.cleared=false;delete elite.stock;elite.encounter=[`${BIOMES[layout.biome].id}-${floor%5}`,`${BIOMES[layout.biome].id}-${(floor+2)%5}`];}elite.role='elite';elite.encounter=elite.encounter.slice(0,3);}
 return layout;
}

export function furnishDungeon(room,height,biome,{practice=false}={}){
 const a=portraitArena(height),b=a.bounds,H=b.bottom-b.top,Y=t=>Math.round(b.top+H*t),rng=new DungeonRandom(room.seed),layout=room.layout??'nave';a.props=[];a.floorTiles=[];a.regions=[];a.colliders=[];a.decals=[];a.header=ROOM_LAYOUTS.find(l=>l.id===layout)?.header??'cloister';a.floorStyle=room.floorStyle??room.pattern%4;a.lighting=room.lighting??0;
 const prop=(type,x,t,w=30,h=12,kit=false,scenic=false)=>{const p={type,x:Math.round(x),y:Y(t),w,h,kit,scenic};a.props.push(p);if(w&&h)a.colliders.push({x:p.x-w/2,y:p.y-h+3,w,h,blocksSight:true});return p;};
 const tile=(type,x,t)=>a.floorTiles.push({type,x,y:Y(t),height:80});
 const region=(type,x,t,w,ratio)=>{const h=Math.max(48,Math.round(H*ratio)),y=Y(t)-Math.round(h/2);a.regions.push({type,x:Math.round(x),y,w,h});if(type!=='grass')a.colliders.push({x:x+8,y:y+8,w:w-16,h:h-16,blocksSight:type==='rubble'});};
 a.props.push({type:'brazier',x:30,y:121,w:0,h:0},{type:'brazier',x:330,y:121,w:0,h:0});
 if(!practice){
  if(layout==='nave'){for(const t of [.22,.48,.76])tile('carpet',180,t);for(const x of [84,276])for(const t of [.26,.76])prop('statue',x,t,32,12);}
  if(layout==='cloister'){region('water',125,.5,110,.26);for(const x of [83,277])for(const t of [.23,.78])prop('pillar',x,t,36,12);}
  if(layout==='bridge'){for(const x of [43,231])for(const t of [.23,.77])region(biome.index===3?'lava':'void',x,t,86,.34);for(const t of [.29,.71])tile('pressure',180,t);}
  if(layout==='crypt'){for(const [x,t]of [[99,.23],[249,.41],[105,.66],[251,.84]])prop('sarcophagus',x,t,54,14,true);}
  if(layout==='cistern'){for(const x of [46,232])for(const t of [.24,.77])region('water',x,t,82,.29);prop('well',88,.52,50,14,true);tile('grate',180,.5);}
  if(layout==='gallery'){for(let n=0;n<4;n++)prop(n%2?'statue':'pillar',n%2?253:108,.18+n*.21,32,12);tile('carpet',180,.48);}
  if(layout==='arena'||layout==='rotunda'){tile('arena-seal',180,.5);for(const x of [73,287])for(const t of [.18,.85])prop(layout==='rotunda'?'statue-king':'broken-column',x,t,38,11,layout==='arena',layout==='rotunda');}
  if(layout==='crossing'){for(const x of [43,237])for(const t of [.19,.81])region('void',x,t,80,.26);tile('arena-seal',180,.5);}
  if(layout==='archive'){for(const [x,t]of [[99,.25],[261,.25],[100,.77],[260,.77]])prop('bookcase',x,t,65,14,true);prop('reading-table',180,.52,62,15,false,true);}
  if(layout==='grove'){for(const x of [87,274])for(const t of [.29,.8])prop('roots',x,t,52,13,true);region('grass',124,.51,110,.18);}
  if(layout==='foundry'){prop('machine',104,.31,52,14,true);prop('machine',256,.75,52,14,true);region('lava',233,.25,77,.19);region('lava',48,.78,77,.19);prop('anvil',180,.5,42,13,false,true);}
  if(layout==='ritual'){tile('arena-seal',180,.5);for(const [x,t]of [[96,.25],[264,.25],[96,.8],[264,.8]])prop('obelisk',x,t,40,12,true);}
  if(layout==='barracks'){for(const [x,t]of [[92,.26],[265,.26],[92,.73],[265,.73]])prop('bunk',x,t,50,13,false,true);prop('weapons-rack',180,.35,49,12,false,true);}
  if(layout==='reliquary'){prop('altar-font',180,.45,55,16,false,true);for(const x of [83,277])for(const t of [.22,.81])prop('urn',x,t,15,10);tile('rune',180,.74);}
  if(layout==='aqueduct'){for(const x of [43,226])for(const t of [.25,.75])region('water',x,t,91,.33);tile('grate',180,.5);for(const t of [.2,.78])tile('grate',180,t);}
  if(layout==='prison'){for(const [x,t]of [[89,.27],[271,.27],[89,.78],[271,.78]])prop('cage',x,t,54,14,false,true);tile('grate',180,.5);}
  if(layout==='ossuary'){for(const [x,t]of [[101,.22],[252,.39],[107,.65],[253,.83]])prop('bone-pile',x,t,54,13,false,true);prop('fallen-bell',185,.47,38,12,false,true);}
  if(layout==='observatory'){tile('arena-seal',180,.54);prop('orrery',180,.28,47,12,false,true);for(const x of [78,282])prop('bookcase',x,.77,57,12,true);}
  if(layout==='sanctum'){for(const [x,t]of [[103,.43],[257,.61]])prop('balustrade',x,t,72,12,false,true);for(const x of [82,278])prop('pillar',x,.2,33,12);tile('rune',180,.74);}
  for(let n=0;n<2+room.pattern%3;n++){const left=n%2===0;prop(left?'debris':'urn',left?49:311,.14+n*.22,left?0:14,left?0:10,left);}
  for(let n=0;n<6;n++)a.decals.push({variant:rng.int(4),x:54+rng.int(250),y:Y(.1+rng.next()*.8),flip:rng.next()<.5});
 }
 const free=(x,y,w=48,h=24)=>x-w/2>=b.left&&x+w/2<=b.right&&y-h>=b.top+12&&y+10<=b.bottom&&!a.colliders.some(c=>x+w/2>c.x&&x-w/2<c.x+c.w&&y+8>c.y&&y-h<c.y+c.h);
 const doorPoints=Object.keys(room.doors).map(d=>({x:d==='w'?b.left+5:d==='e'?b.right-5:180,y:d==='n'?b.top+8:d==='s'?b.bottom-8:(b.top+b.bottom)/2}));
 const pickPoint=(preferred,avoidDoors=false)=>{const options=[preferred,...[.5,.74,.26,.87,.14].flatMap(t=>[180,116,244].map(x=>({x,y:Y(t)})))];return options.find(p=>free(p.x,p.y)&&(!avoidDoors||doorPoints.every(d=>Math.hypot(d.x-p.x,d.y-p.y)>=105)))??{x:180,y:Y(.5)};};
 if(room.event||['entrance','hearth','treasure','merchant'].includes(room.type)&&!practice){const preferred=room.type==='entrance'||room.type==='hearth'?{x:80,y:b.bottom-57}:{x:180,y:Y(room.type==='merchant'?.3:.5)},p=pickPoint(preferred);a.feature=p;const type=room.event?room.event.id:room.type==='merchant'?'merchant':room.type==='treasure'?room.opened?'chest-open':'chest-closed':'shrine';a.props.push({type,event:!!room.event,x:p.x,y:p.y,w:room.event?42:28,h:12});a.colliders.push({x:p.x-(room.event?21:14),y:p.y-9,w:room.event?42:28,h:12,blocksSight:true});}
 if(['guardian','boss'].includes(room.type)){const e=room.exit??{side:['n','e','s','w'][room.seed%4],kind:['stairs','spiral','lift','well'][room.pattern%4],offset:.5},p=pickPoint(e.side==='n'?{x:180,y:Y(.18)}:e.side==='s'?{x:180,y:Y(.82)}:{x:e.side==='e'?263:97,y:Y(e.offset??.5)},true);a.exit={...p,kind:e.kind,side:e.side};a.colliders.push({x:p.x-17,y:p.y-9,w:34,h:12,blocksSight:false});}
 return a;
}

export function dungeonPath(arena,from,to,radius=7){
 const b=arena.bounds,step=16,cols=Math.floor((b.right-b.left-16)/step)+1,rows=Math.floor((b.bottom-b.top-16)/step)+1,point=(x,y)=>({x:b.left+8+x*step,y:b.top+8+y*step}),blocked=p=>p.x<b.left+radius||p.x>b.right-radius||p.y<b.top+radius||p.y>b.bottom-radius||radius>=12&&(p.x<87||p.x>273)||arena.colliders.some(c=>p.x+radius>c.x&&p.x-radius<c.x+c.w&&p.y+radius>c.y&&p.y-radius<c.y+c.h);
 const nearest=target=>{let node=null,best=Infinity;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const p=point(x,y),d=(p.x-target.x)**2+(p.y-target.y)**2;if(d<best&&!blocked(p)){node={x,y};best=d;}}return node;},start=nearest(from),goal=nearest(to);if(!start||!goal)return [];
 const index=p=>p.y*cols+p.x,parent=new Int32Array(cols*rows).fill(-2),q=[start];parent[index(start)]=-1;let end=null;
 for(let n=0;n<q.length;n++){const at=q[n];if(at.x===goal.x&&at.y===goal.y){end=at;break;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const next={x:at.x+dx,y:at.y+dy};if(next.x<0||next.x>=cols||next.y<0||next.y>=rows||parent[index(next)]!==-2||blocked(point(next.x,next.y)))continue;parent[index(next)]=index(at);q.push(next);}}
 if(!end)return [];const path=[];for(let at=index(end);at>=0;at=parent[at])path.push(point(at%cols,Math.floor(at/cols)));return path.reverse();
}
