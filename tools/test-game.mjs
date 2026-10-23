import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {Game,dist,RELICS,HERO_COMBAT,portraitArena} from '../game/core.mjs';
const findings=[];
function test(name,fn){fn();findings.push({name,passed:true});console.log('PASS',name);}
function tick(g,n,input={}){for(let i=0;i<n;i++)g.update(1/60,input);}
function arena(){const g=new Game(61);g.start();g.enemies=[];g.player.x=320;g.player.y=211;return g;}
test('All exported actor tags resolve to saved, nonempty frames',()=>{
 for(const n of ['knight','hollow','wisp','warden']){
  const a=JSON.parse(fs.readFileSync(new URL(`../assets/${n}.json`,import.meta.url)));
  assert.ok(a.frames.length>=20);for(const t of a.meta.frameTags){assert.ok(t.from<=t.to);assert.ok(t.to<a.frames.length);}
  if(n==='knight')for(const d of ['s','n','e','w'])for(const action of ['idle','walk','attack','attack-backhand','attack-heavy','roll','block','hurt','death'])assert.ok(a.meta.frameTags.find(t=>t.name===`${d}-${action}`));
  if(n==='hollow'||n==='warden')for(const d of ['s','n','e','w'])for(const action of ['idle','walk','attack','hurt','death'])assert.ok(a.meta.frameTags.find(t=>t.name===`${d}-${action}`));
  assert.ok(a.meta.anchor&&a.meta.anchor.groundY===a.meta.anchor.y-1);
 }
});
test('All three combo clips match the runtime strike and recovery timing',()=>{
 const a=JSON.parse(fs.readFileSync(new URL('../assets/knight.json',import.meta.url)));
 for(const d of ['s','n','e','w'])for(const move of HERO_COMBAT){
  const tag=a.meta.frameTags.find(t=>t.name===`${d}-${move.tag}`),frames=a.frames.slice(tag.from,tag.to+1),sum=xs=>xs.reduce((s,f)=>s+f.duration,0);
  assert.equal(sum(frames),Math.round(move.duration*1000));assert.equal(sum(frames.slice(0,3)),Math.round(move.activeFrom*1000));assert.equal(sum(frames.slice(0,5)),Math.round(move.activeTo*1000));
 }
});
test('Combo cycles through crosscut, backhand, heavy; heavy interrupts the ogre',()=>{
 const g=arena(),e=g.spawn('warden',355,211);e.timer=100;g.face(0);
 for(const kind of [0,1,2]){const stamina=g.player.stamina;assert.equal(g.attack(),true);assert.equal(g.player.attackKind,kind);assert.equal(g.player.stamina,stamina-HERO_COMBAT[kind].cost);tick(g,kind===2?23:17);assert.equal(e.phase,kind===2?'hurt':'chase');tick(g,22);}
 assert.equal(e.hp,260-25-25-37);
});
test('Movement respects walls and the water trench',()=>{
 const g=arena();g.player.x=120;g.player.y=210;tick(g,120,{left:true});assert.ok(g.player.x>=115);g.player.x=320;g.player.y=123;tick(g,60,{up:true});assert.ok(g.player.y>=122);
});
test('A sword strike hits each target once and excludes targets behind the knight',()=>{
 const g=arena(),front=g.spawn('hollow',355,211),back=g.spawn('hollow',286,211);front.timer=100;back.timer=100;g.face(0);g.attack();tick(g,17);assert.equal(front.hp,30);assert.equal(back.hp,55);assert.equal(g.player.stamina,87);
});
test('Stone columns block melee through their collision footprint',()=>{
 const g=arena();g.player.x=137;g.player.y=178;const e=g.spawn('hollow',182,178);e.timer=100;g.player.range=70;g.face(0);g.attack();tick(g,16);assert.equal(e.hp,55);
});
test('Roll spends stamina, moves the player and grants temporary invulnerability',()=>{
 const g=arena();assert.equal(g.roll(1,0),true);assert.equal(g.player.stamina,76);assert.equal(g.damagePlayer(20,{x:350,y:211}),false);tick(g,20);assert.ok(g.player.x>360);assert.equal(g.damagePlayer(20,{x:400,y:211}),true);assert.equal(g.player.hp,80);
});
test('A facing shield blocks damage; an attack from behind still hurts',()=>{
 const g=arena();g.face(0);g.player.action='block';assert.equal(g.damagePlayer(20,{x:350,y:211}),false);assert.equal(g.player.hp,100);assert.equal(g.player.stamina,82);g.player.invuln=0;assert.equal(g.damagePlayer(20,{x:290,y:211}),true);assert.equal(g.player.hp,80);
});
test('Chest and healing shrine can each be used only once per run',()=>{
 const g=arena();g.player.hp=30;g.player.x=520;g.player.y=220;assert.equal(g.interact(),'chest');assert.equal(g.interact(),false);assert.equal(g.gold,20);assert.equal(g.player.hp,45);g.player.x=115;g.player.y=300;assert.equal(g.interact(),'shrine');assert.equal(g.interact(),false);assert.equal(g.player.hp,75);
});
test('Encounter clear leads to relic choice and applies the selected upgrade',()=>{
 const g=arena();tick(g,90);assert.equal(g.state,'relic');g.choices=[RELICS.find(x=>x.id==='edge')];assert.equal(g.chooseRelic(0),true);assert.equal(g.player.damage,33);assert.equal(g.floor,2);assert.equal(g.enemies.length,5);assert.equal(g.state,'playing');
});
test('Enemies telegraph before dealing damage',()=>{
 const g=arena();g.spawn('hollow',347,211);tick(g,45);const e=g.enemies[0];assert.ok(['windup','strike','recover'].includes(e.phase));assert.ok(g.player.hp<=100);tick(g,100);assert.ok(g.player.hp<100);
});
test('Final encounter clear opens the exit; interacting at the gate wins',()=>{
 const g=arena();g.floor=3;tick(g,85);assert.equal(g.state,'exit');g.player.x=320;g.player.y=130;assert.equal(g.interact(),'won');assert.equal(g.state,'won');
});
test('Death completes its animation and a fresh run resets inventory and actors',()=>{
 const g=arena();g.damagePlayer(150,{x:350,y:211});assert.equal(g.state,'dying');tick(g,80);assert.equal(g.state,'dead');g.start(99);assert.equal(g.player.hp,100);assert.equal(g.enemies.length,3);assert.equal(g.gold,0);assert.equal(g.floor,1);
});

// A real-time rules simulation, without changing health, damage, or enemy AI.
function play(seed,layout){
 const g=new Game(seed,layout);g.start();let frames=0;
 for(;frames<60*240&&!['won','dead'].includes(g.state);frames++){
  if(g.state==='relic'){const priority=['edge','heart','well','reach','stride','guard'];g.chooseRelic(g.choices.map((r,i)=>({i,v:priority.indexOf(r.id)})).sort((a,b)=>a.v-b.v)[0].i);continue;}
  const p=g.player;
  if(g.state==='exit'){
    const dx=g.arena.gate.x-p.x,dy=g.arena.gate.y+1-p.y;g.update(1/60,{left:dx<-3,right:dx>3,up:dy<-3,down:dy>3,interact:Math.hypot(dx,dy)<35});continue;
  }
  const e=[...g.enemies].sort((a,b)=>dist(p,a)-dist(p,b))[0];if(!e){g.update(1/60);continue;}
  const dx=e.x-p.x,dy=e.y-p.y,d=Math.hypot(dx,dy),danger=g.enemies.some(x=>x.phase==='windup'&&dist(p,x)<(x.type==='warden'?76:45));
  let mx=0,my=0;
  if(d>p.range-6){mx=dx/d;my=dy/d;}
  if(danger){mx=-dx/d;my=-dy/d;}
  // Discrete navigation considers actual collision footprints, exactly as player movement does.
  const angles=[Math.atan2(my,mx),Math.atan2(my,mx)+.7,Math.atan2(my,mx)-.7,Math.atan2(my,mx)+1.4,Math.atan2(my,mx)-1.4];
  if(mx||my){for(const a of angles)if(!g.solid(p.x+Math.cos(a)*13,p.y+Math.sin(a)*13)){mx=Math.cos(a);my=Math.sin(a);break;}}
  g.update(1/60,{left:mx<-.3,right:mx>.3,up:my<-.3,down:my>.3,attack:d<p.range+1&&!danger,roll:danger&&p.rollCooldown<=0&&p.stamina>=40,aim:{active:true,x:e.x,y:e.y}});
 }
 return {seed,state:g.state,floor:g.floor,kills:g.kills,hp:g.player.hp,time:Math.round(frames/60),remaining:g.enemies.length};
}
test('Compact portrait arenas keep all spawns on clear floor at different screen heights',()=>{
 for(const height of [468,568,688,800])for(const seed of [61,16361,2026]){
  const g=new Game(seed,portraitArena(height));g.start();assert.equal(g.arena.width,360);assert.equal(g.solid(g.player.x,g.player.y),false);
  assert.ok(g.arena.bounds.left+7>=48&&g.arena.bounds.right-7+48<=360,'Full knight attack cells stay inside the screen at either movement boundary');
  for(const floor of [1,2,3]){g.enemies=[];g.floor=floor;g.spawnEncounter();for(const e of g.enemies)assert.equal(g.solid(e.x,e.y,e.type==='warden'?12:7),false,`${height}: ${e.type} spawn`);}
  g.resizeArena(portraitArena(608));assert.equal(g.solid(g.player.x,g.player.y),false);for(const e of g.enemies)assert.equal(g.solid(e.x,e.y,e.type==='warden'?12:7),false);
  g.start();assert.equal(g.arena.height,608,'Restart keeps the responsive arena');g.enemies=[];g.floor=3;tick(g,85);Object.assign(g.player,g.arena.gate);assert.equal(g.interact(),'won');
 }
});
const runs=[61,16361,2026].map(seed=>play(seed));
const portraitRuns=[468,608,688,800].flatMap(height=>[61,16361,2026].map(seed=>({height,...play(seed,portraitArena(height))})));
console.log('Playthroughs',JSON.stringify(runs));
console.log('Portrait playthroughs',JSON.stringify(portraitRuns));
fs.writeFileSync(new URL('../previews/verification.json',import.meta.url),JSON.stringify({checks:findings,runs,portraitRuns},null,2));
assert.ok(runs.some(r=>r.state==='won'),'At least one ordinary-rule playthrough must complete all three encounters');
for(const height of [468,608,688,800])assert.ok(portraitRuns.some(r=>r.height===height&&r.state==='won'),`Portrait height ${height} must support a complete ordinary-rule run`);
console.log(`${findings.length} checks passed; a full roguelike run completed.`);
