import fs from 'node:fs';
import path from 'node:path';
import {call,data,ROOT} from './art-lib.mjs';
import {ENEMIES} from '../game/content.mjs';
import {enemyWalkTimes} from './enemy-motion.mjs';
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
for(const e of ENEMIES){const file=path.join(ROOT,'assets',e.asset+'.json'),atlas=JSON.parse(fs.readFileSync(file,'utf8')),frames=Object.values(atlas.frames),durations=frames.map(f=>f.duration),walk=enemyWalkTimes(e);
 for(const t of atlas.meta.frameTags)if(t.name.endsWith('-walk'))for(let n=0;n<8;n++)durations[t.from+n]=walk[n];
 const made=data(await call('sprite_manage',{op:'open',path:path.join(ROOT,'art',e.asset+'.aseprite')})),id='#'+made.id;await call('frame',{sprite:id,op:'set_duration',durations});await call('sprite_manage',{sprite:id,op:'save'});await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'assets',e.asset+'.png'),sheetType:'packed',padding:0,trim:false});const updated=JSON.parse(fs.readFileSync(file,'utf8'));Object.assign(updated.meta,atlas.meta,{gait:{walkMs:walk,description:e.family==='hound'?'Quick contact and suspended passing':e.family==='crawler'?'Alternating radial leg pairs':e.boss||e.family==='brute'?'Heavy contact, compressed passing':'Articulated contact / down / pass / rise'}});fs.writeFileSync(file,JSON.stringify(updated));await call('sprite_manage',{sprite:id,op:'close'});console.log('Retimed',e.id);}
