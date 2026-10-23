import fs from 'node:fs';
import path from 'node:path';
import {call,data,ROOT} from './art-lib.mjs';
import {HEROES,ENEMIES} from '../game/content.mjs';
for(const name of [...HEROES.map(h=>h.asset),...ENEMIES.map(e=>e.asset)]){
 const json=path.join(ROOT,'assets',name+'.json'),previous=JSON.parse(fs.readFileSync(json,'utf8'));
 if(previous.meta.size.w<=4096&&previous.meta.size.h<=4096)continue;
 const made=data(await call('sprite_manage',{op:'open',path:path.join(ROOT,'art',name+'.aseprite')})),id='#'+made.id;
 await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'assets',name+'.png'),sheetType:'packed',padding:0,trim:false});
 const atlas=JSON.parse(fs.readFileSync(json,'utf8'));for(const key of ['anchor','motion','artRevision'])atlas.meta[key]=previous.meta[key];fs.writeFileSync(json,JSON.stringify(atlas));await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});console.log('Packed',name,atlas.meta.size.w,atlas.meta.size.h);
}
