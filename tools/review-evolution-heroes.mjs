import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,line} from './art-lib.mjs';
import {authoredHero,basePixels,weaponSet,offhandSet,heroTimings,DIRECTIONS} from './evolution-hero-design.mjs';
import {HEROES} from '../game/content.mjs';
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
const report={method:'Native Aseprite body cel contact checks and a separately drawn equipped motion study',cases:[],failures:[]};
for(const h of HEROES){const name='hero-eight-'+h.id,atlas=JSON.parse(fs.readFileSync(path.join(ROOT,'assets',name+'.json'),'utf8')),made=data(await call('sprite_manage',{op:'open',path:path.join(ROOT,'art',name+'.aseprite')})),id='#'+made.id;
 for(const d of DIRECTIONS)for(const state of ['idle','walk']){const tag=atlas.meta.frameTags.find(t=>t.name===d+'-'+state);for(let f=tag.from;f<=tag.to;f++){const socket=atlas.meta.sockets[f],planted=socket.feet.filter(p=>p.y===75),pixels=data(await call('read_pixels',{sprite:id,frame:f+1,region:{x:0,y:74,width:96,height:3},composite:true}));const contact=planted.some(p=>{for(let x=Math.round(p.x)-4;x<=Math.round(p.x)+4;x++)if(pixels.grid[96+x])return true;return false;});const c={hero:h.id,direction:d,state,frame:f+1,plantedFeet:planted.length,contact};report.cases.push(c);if(!contact)report.failures.push(c);}}
 await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});
 const study=await sprite('equipped-motion-'+h.id,96,96,['body','gear','motion']);await call('frame',{sprite:study,op:'add',count:16});let frame=1,tags=[],dur=[];
 for(const state of ['walk','attack']){const start=frame;for(let k=0;k<heroTimings[state].length;k++,frame++){const p=authoredHero(h.id,'se',state,k);await paint(study,'body',frame,basePixels(p),'Native keyed '+state);await paint(study,'gear',frame,[...offhandSet(h.id,p,h.id==='knight'),...weaponSet(h.id,p,3)],'Equipped pointed weapon and offhand');if(p.effects?.length)await paint(study,'motion',frame,p.effects,'Motion accents');dur.push(heroTimings[state][k]);}tags.push([state,start,frame-1]);}
 await finish(study,'equipped-motion-'+h.id,tags,dur);for(const state of ['walk','attack'])await call('export',{sprite:study,op:'spritesheet',path:path.join(ROOT,'previews','equipped-'+h.id+'-'+state+'.png'),sheetType:'horizontal',tags:[state],scale:2});await preview(study,'equipped-'+h.id+'-motion','filmstrip',{scale:2});await preview(study,'equipped-'+h.id+'-onion','onion',{frame:12,framesBefore:1,framesAfter:1,scale:4});await call('sprite_manage',{sprite:study,op:'save'});await call('sprite_manage',{sprite:study,op:'close'});
}
fs.writeFileSync(path.join(ROOT,'previews','eight-direction-contact-report.json'),JSON.stringify(report,null,2));if(report.failures.length)throw Error('Unplanted hero feet: '+report.failures.length);console.log('Verified',report.cases.length,'grounded native hero keys.');
