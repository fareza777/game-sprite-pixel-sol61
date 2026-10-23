import fs from 'node:fs';
import path from 'node:path';
import {call,data,paint,ROOT} from './art-lib.mjs';
import {heroPose,hollowPose,wispPose} from './actor-design-v2.mjs';
import {ogrePose} from './ogre-design.mjs';
import {materialPass} from './draw-actors-v2.mjs';
const list=data(await call('sprite_manage',{op:'list'}));
for(const [name,fn]of [['knight',heroPose],['hollow',hollowPose],['warden',ogrePose],['wisp',wispPose]]){
 const id='#'+list.sprites.find(s=>s.name===`${name}.aseprite`).id;
 const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'previews',name+'-contract.json')));
 for(const f of contract.frames){
  const parts=f.tag.split('-'),d=name==='wisp'?'':parts.shift(),state=name==='wisp'?f.tag:parts.join('-');
  const p=d?fn(d,state,f.pose):fn(state,f.pose);
  if(!p.effects?.length)continue;
  await call('cel',{sprite:id,op:'clear',layer:'effects',frame:f.frame});
  await paint(id,'effects',f.frame,materialPass(name,'effects',p.effects),`${name}: continuous pixel streak, no isolated dots`);
 }
 await call('sprite_manage',{sprite:id,op:'save'});
 await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'assets',name+'.png'),sheetType:'rows',includeJson:false,padding:0,trim:false});
 const validation=await call('validate',{sprite:id,checks:['strays','palette','animation','export_readiness']});
 fs.writeFileSync(path.join(ROOT,'previews',name+'-fx-validation.json'),JSON.stringify(validation.structuredContent??validation,null,2));
 console.log('Refined effects:',name);
}
