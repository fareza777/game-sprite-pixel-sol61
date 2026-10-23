import fs from 'node:fs';
import path from 'node:path';
import {call,data,paint,preview,ROOT} from './art-lib.mjs';
import {heroPose,hollowPose} from './actor-design-v2.mjs';
import {materialPass} from './draw-actors-v2.mjs';
const list=data(await call('sprite_manage',{op:'list'}));
const name=process.argv[2]??'knight',fn=name==='knight'?heroPose:hollowPose;
const id='#'+list.sprites.find(s=>s.name===`${name}.aseprite`).id;
const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'previews',name+'-contract.json')));
for(const f of contract.frames){
 const parts=f.tag.split('-'),d=parts.shift(),p=fn(d,parts.join('-'),f.pose);
 if(!p.equipment?.length)continue;
 await call('cel',{sprite:id,op:'clear',layer:'equipment',frame:f.frame});
 await paint(id,'equipment',f.frame,materialPass(name,'equipment',p.equipment),name==='knight'?'Longsword: pointed tip, bevelled steel and brass quillons':'Rusty club: keep the same weapon after falling');
}
await call('sprite_manage',{sprite:id,op:'save'});
await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'assets',name+'.png'),sheetType:'rows',includeJson:false,padding:0,trim:false});
await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'previews',name+'-structure.png'),sheetType:'rows',layers:['cloak','plume','body','arms','equipment'],padding:0,trim:false});
await preview(id,name+'-detail-v2','preview',{frame:1,scale:6});
if(name==='knight')await preview(id,'knight-sword-detail','preview',{frame:1,region:{x:26,y:19,width:43,height:58},scale:8});
console.log('Refined equipment:',name);
