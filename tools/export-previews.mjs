import fs from 'node:fs';
import {call,data,ROOT,preview} from './art-lib.mjs';
import path from 'node:path';
const list=data(await call('sprite_manage',{op:'list'}));
const jobs={knight:['s-idle','n-idle','e-idle','w-idle','s-walk','n-walk','e-walk','w-walk','s-attack','e-attack','s-attack-backhand','e-attack-backhand','s-attack-heavy','e-attack-heavy','s-roll','s-block','s-death'],hollow:['s-idle','e-idle','s-walk','e-walk','s-attack','e-attack','s-death'],warden:['s-idle','e-idle','s-walk','e-walk','s-attack','e-attack','s-death'],wisp:['idle','walk','attack','hurt','death']};
for(const [name,tags]of Object.entries(jobs)){
 if(process.argv.length>2&&!process.argv.slice(2).includes(name))continue;
 // The server lists newer documents first. An old draft may share a saved filename.
 const id='#'+list.sprites.find(s=>s.name===`${name}.aseprite`).id;
 const atlas=JSON.parse(fs.readFileSync(path.join(ROOT,'assets',name+'.json'),'utf8'));
 for(const tag of tags)await call('export',{sprite:id,op:'gif',path:path.join(ROOT,'previews',`${name}-${tag}.gif`),scale:4,tags:[tag]});
 await call('export',{sprite:id,op:'png',path:path.join(ROOT,'previews',name+'-detail.png'),frame:1,scale:name==='warden'?4:6});
 const ranges=atlas.meta.frameTags.filter(t=>t.name.includes('attack')).map(t=>name==='knight'?[t.from+4,t.from+5]:name==='warden'?[t.from+5,t.from+6]:name==='wisp'?[t.from+1,t.from+5]:[t.from+4,t.from+5]);
 if(name==='wisp'){const t=atlas.meta.frameTags.find(t=>t.name==='death');ranges.push([t.from+1,t.to+1]);}
 const validation=await call('validate',{sprite:id,expect:{layerFrames:{effects:ranges}}});
 fs.writeFileSync(path.join(ROOT,'previews',name+'-review-validation.json'),JSON.stringify(validation.structuredContent??validation,null,2));
 await preview(id,name+'-onion','onion',{frame:(atlas.meta.frameTags.find(t=>t.name==='s-attack'||t.name==='attack').from)+5,scale:4});
 const ascii=data(await call('look',{sprite:id,op:'ascii',frame:1,region:name==='warden'?{x:52,y:25,width:25,height:20}:name==='wisp'?{x:23,y:13,width:18,height:17}:{x:40,y:20,width:19,height:22},rulers:false}));
 fs.writeFileSync(path.join(ROOT,'previews',name+'-face-ascii.json'),JSON.stringify(ascii,null,2));
 const tag=name==='wisp'?'attack':'s-attack',scratch=path.join(ROOT,'previews',name+'-attack-review.gif');
 await call('export',{sprite:id,op:'gif',path:scratch,tags:[tag]});
 await call('sprite_manage',{op:'open',path:scratch});const reviewId='#'+data(await call('sprite_info')).id;
 await preview(reviewId,name+'-attack-film','filmstrip',{scale:3});
 console.log('Reviewed',name,atlas.frames.length,'frames;',tags.length,'preview clips');
}
