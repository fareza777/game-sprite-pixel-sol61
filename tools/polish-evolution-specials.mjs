import fs from 'node:fs';
import path from 'node:path';
import {call,data,ROOT,paint,sprite,finish,preview} from './art-lib.mjs';
import {authoredHero,basePixels,weaponSet,offhandSet} from './evolution-hero-design.mjs';
import {offsetOps} from './actor-design-v2.mjs';
import {HEROES} from '../game/content.mjs';
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
for(const h of HEROES){const name='hero-eight-'+h.id,file=path.join(ROOT,'assets',name+'.json'),atlas=JSON.parse(fs.readFileSync(file,'utf8')),made=data(await call('sprite_manage',{op:'open',path:path.join(ROOT,'art',name+'.aseprite')})),id='#'+made.id;
 for(const t of atlas.meta.frameTags)if(t.name.endsWith('-roll')||t.name.endsWith('-death')){const direction=t.name.split('-')[0],state=t.name.endsWith('-roll')?'roll':'death';for(let f=t.from;f<=t.to;f++){const p=authoredHero(h.id,direction,state,f-t.from);await call('cel',{sprite:id,op:'clear',layer:'body',frame:f+1});await paint(id,'body',f+1,basePixels(p),'Tucked equipment follows the rolling or fallen body');const empty=atlas.meta.sockets[f].weapons[0];atlas.meta.sockets[f].offhand=[empty,empty];}}
 await call('sprite_manage',{sprite:id,op:'save'});await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'assets',name+'.png'),sheetType:'packed',padding:0,trim:false});const a=JSON.parse(fs.readFileSync(file,'utf8'));Object.assign(a.meta,atlas.meta);fs.writeFileSync(file,JSON.stringify(a));await call('sprite_manage',{sprite:id,op:'close'});console.log('Polished tucked equipment:',h.id);
}
const study=await sprite('special-motion-review',1344,360,['actors']);for(let h=0;h<3;h++)for(let n=0;n<13;n++){const state=n<6?'roll':'death',p=authoredHero(HEROES[h].id,'se',state,n<6?n:n-6);await paint(study,'actors',1,offsetOps([...basePixels(p),...weaponSet(HEROES[h].id,p,3),...offhandSet(HEROES[h].id,p,h===0)],n*100,h*120+12),'Review every rolling and falling key');}await finish(study,'special-motion-review',[],[],{sheet:false});await preview(study,'special-motion-review','preview',{scale:1});await call('sprite_manage',{sprite:study,op:'save'});await call('sprite_manage',{sprite:study,op:'close'});
