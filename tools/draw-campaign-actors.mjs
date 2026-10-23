import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,grid,P} from './art-lib.mjs';
import {allLayers,HERO_TIMES,ENEMY_TIMES} from './campaign-art-design.mjs';
import {heroDesign,enemyDesign} from './campaign-distinct-design.mjs';
import {HEROES,ENEMIES,BIOMES} from '../game/content.mjs';
import {offsetOps} from './actor-design-v2.mjs';
const ready=data(await call('preflight'));if(!ready.ready)throw new Error(ready.directive);
const font=JSON.parse(fs.readFileSync(path.join(ROOT,'assets','font.json'),'utf8'));
function label(str,x,y){const ops=[];for(const c of str.toUpperCase()){const r=font.glyphs[c];if(r)ops.push(grid(x,y,r,{...P,...Object.fromEntries([...new Set(r.join(''))].filter(c=>c!=='.'&&c!==' ').map(c=>[c,P.L]))}));x+=(r?.[0]?.length??3)+1;}return ops;}
async function review(){
 const id=await sprite('vespergrave-cast',1600,830,['characters','labels']);
 for(const e of ENEMIES){const x=e.biome*160,y=e.index*130+40,p=enemyDesign(e,'s','idle',0),w=e.boss||e.family==='brute'?144:96;await paint(id,'characters',1,offsetOps(allLayers.flatMap(k=>p[k]??[]),x+(160-w)/2,y),'review '+e.name);await paint(id,'labels',1,label(e.name.slice(0,25),x+4,y+113),'name the cast');}
 for(const b of BIOMES)await paint(id,'labels',1,label(b.name.slice(0,25),b.index*160+4,8),'biome heading');
 await finish(id,'vespergrave-cast',[],[],{sheet:false});await preview(id,'vespergrave-cast','preview',{scale:1});
 const heroes=await sprite('vespergrave-heroes',384,112,['characters']);for(let h=0;h<3;h++){const p=heroDesign(HEROES[h].id,'s','idle',0);await paint(heroes,'characters',1,offsetOps(allLayers.flatMap(k=>p[k]??[]),h*128+16,0),HEROES[h].name);}await finish(heroes,'vespergrave-heroes',[],[],{sheet:false});await preview(heroes,'vespergrave-heroes','preview',{scale:3});
}
async function actor(name,w,h,anchor,pose,timings,airborne=false){
 const target=path.join(ROOT,'assets',name+'.json');if(process.argv.includes('--resume')&&fs.existsSync(target)){console.log('Kept',name);return;}
 const id=await sprite(name,w,h,['ink','effects']),jobs=[];for(const d of ['s','n','e','w'])for(const [state,times]of Object.entries(timings))jobs.push({d,state,times});
 const count=jobs.reduce((sum,x)=>sum+x.times.length,0);await call('frame',{sprite:id,op:'add',count:count-1});const tags=[],durations=[];let frame=1;
 for(const j of jobs){const start=frame;for(let i=0;i<j.times.length;i++,frame++){const p=pose(j.d,j.state,i);await paint(id,'ink',frame,allLayers.filter(k=>k!=='effects').flatMap(k=>p[k]??[]),`${name}: ${j.d}-${j.state} key ${i+1}`);if(p.effects?.length)await paint(id,'effects',frame,p.effects,'authored motion accents');durations.push(j.times[i]);}tags.push([`${j.d}-${j.state}`,start,frame-1]);}
 await finish(id,name,tags,durations);const atlas=JSON.parse(fs.readFileSync(target,'utf8'));atlas.meta.anchor={...anchor,groundY:anchor.y-1,airborne};atlas.meta.motion={attack:name.startsWith('hero-')?{windupMs:110,activeMs:120,settleMs:230}:{windupMs:420,activeMs:135,settleMs:380}};atlas.meta.artRevision=4;fs.writeFileSync(target,JSON.stringify(atlas));
 if(name.startsWith('hero-')||name.endsWith('-boss')){await preview(id,name+'-motion','filmstrip',{scale:1});await preview(id,name+'-onion','onion',{frame:name.startsWith('hero-')?16:16,framesBefore:1,framesAfter:1,scale:3});}
 await call('sprite_manage',{sprite:id,op:'close'});console.log('Completed',name,count,'authored poses');
}
if(process.argv.includes('--review'))await review();else{
 for(const hero of HEROES)await actor(hero.asset,96,96,{x:48,y:76},(d,s,i)=>heroDesign(hero.id,d,s,i),HERO_TIMES);
 for(const e of ENEMIES){const large=e.boss||e.family==='brute';await actor(e.asset,large?144:96,large?112:96,large?{x:64,y:96}:{x:48,y:76},(d,s,i)=>enemyDesign(e,d,s,i),ENEMY_TIMES,e.airborne);}
 fs.writeFileSync(path.join(ROOT,'assets','campaign-art.json'),JSON.stringify({heroes:HEROES.map(h=>h.asset),enemies:ENEMIES.map(e=>e.asset),characterFrames:3*240+60*128,method:'Authored keyed pixel primitives through MCP Aseprite',facings:['s','n','e','w']},null,2));
}
