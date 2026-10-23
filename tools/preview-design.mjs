import path from 'node:path';
import fs from 'node:fs';
import {sprite,paint,preview,call,ROOT,rect,line,ellipse,grid} from './art-lib.mjs';
import {heroPose,hollowPose,wispPose,offsetOps} from './actor-design-v2.mjs';
import {ogrePose} from './ogre-design.mjs';
import {materialPass} from './draw-actors-v2.mjs';
const layers=['stage','cloak','plume','body','arms','equipment','effects'];
const id=await sprite('Cast design study',488,144,layers);
const font=JSON.parse(fs.readFileSync(path.join(ROOT,'assets','font.json')));
const textOps=(s,x,y)=>{const out=[];for(const c of s){const g=font.glyphs[c];if(g)out.push(grid(x,y,g,{'#':'#e6ba6d',X:'#e6ba6d',1:'#e6ba6d'}));x+=(g?.[0].length??3)+1;}return out;};
const stage=[rect(0,0,488,144,'n'),line(16,119,472,119,'D'),line(16,120,472,120,'d')];
// Use the same bitmap lettering as the game; all image pixels are drawn by MCP.
for(const [s,x]of [['KNIGHT',38],['SKELETON',144],['WRAITH',254],['OGRE',376]])stage.push(...textOps(s,x,18));
for(const x of [56,168,270,388])stage.push(ellipse(x-17,116,34,5,'d','d'));
await paint(id,'stage',1,stage);
for(const [name,fn,dx,dy]of [['knight',heroPose,8,43],['hollow',hollowPose,120,43],['wisp',wispPose,238,61],['warden',ogrePose,324,23]]){
 const pose=name==='wisp'?fn('idle',0):fn('s','idle',0);
 for(const l of layers.slice(1))if(pose[l]?.length)await paint(id,l,1,materialPass(name,l,offsetOps(pose[l],dx,dy)),`${name}: revised silhouette and materials`);
}
await call('sprite_manage',{sprite:id,op:'save_as',path:path.join(ROOT,'previews','cast-design-study.aseprite')});
await preview(id,'cast-design','preview',{scale:3});
console.log('MCP design study saved.');
