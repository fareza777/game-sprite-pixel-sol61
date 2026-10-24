import fs from 'node:fs';
import path from 'node:path';
import {call,data,ROOT} from './art-lib.mjs';
const report={method:'Lowest opaque row read from the native Aseprite cel through MCP',anchors:[],failures:[]};
for(const name of ['campaign-props','layout-kit','descent-props','event-props','biome-landmarks']){
 const file=path.join(ROOT,'assets',name+'.json'),atlas=JSON.parse(fs.readFileSync(file,'utf8')),made=data(await call('sprite_manage',{op:'open',path:path.join(ROOT,'art',name+'.aseprite')})),id='#'+made.id,all=Object.values(atlas.frames),anchors={};
 for(const t of atlas.meta.frameTags){const f=all[t.from].frame,y=Math.max(0,f.h-32),pixels=data(await call('read_pixels',{sprite:id,frame:t.from+1,region:{x:0,y,width:f.w,height:f.h-y},composite:true}));let lowest=-1;
  for(let row=0;row<pixels.height;row++)for(let x=0;x<pixels.width;x++)if(pixels.grid[row*pixels.width+x])lowest=row+y;
  if(lowest<0){report.failures.push({name,tag:t.name});continue;}anchors[t.name]={x:f.w/2,y:lowest+1,groundY:lowest};report.anchors.push({name,tag:t.name,...anchors[t.name]});
 }
 atlas.meta.groundAnchors=anchors;fs.writeFileSync(file,JSON.stringify(atlas));await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});console.log('Measured ground contact:',name,Object.keys(anchors).length);
}
fs.writeFileSync(path.join(ROOT,'previews','ground-contact-report.json'),JSON.stringify(report,null,2));if(report.failures.length)throw Error('Missing ground contacts');console.log('Ground contact verified for',report.anchors.length,'native prop frames.');
