import fs from 'node:fs';
import path from 'node:path';
import {readPNG,components} from './inspect-pixels.mjs';
const root=path.resolve(import.meta.dirname,'..'),targets=process.argv.slice(2).length?process.argv.slice(2):['knight','hollow','warden','wisp'];const report=[];let failed=0;
for(const name of targets){
 const png=readPNG(path.join(root,'previews',name+'-structure.png')),atlas=JSON.parse(fs.readFileSync(path.join(root,'previews',name+'-structure.json'),'utf8')),contract=JSON.parse(fs.readFileSync(path.join(root,'previews',name+'-contract.json'),'utf8'));
 let grounded=0,connected=0;const issues=[];
 for(let i=0;i<atlas.frames.length;i++){
  const f=atlas.frames[i].frame,c=contract.frames[i],cs=components(png,f);
  const death=c.tag.endsWith('death'),air=c.airborne;
  if(!death&&!air){
   const loose=cs.slice(1).filter(c=>c.area>=2);
   if(loose.length)issues.push({frame:i+1,tag:c.tag,pose:c.pose,problem:'detached anatomy / held gear',parts:loose.map(({pixels,...s})=>s)});else connected++;
  }
  if(!air){
   const touch=c.feet.some(p=>{for(let dx=-5;dx<=5;dx++)for(let dy=-1;dy<=1;dy++)if(png.alpha(f.x+p.x+dx,f.y+p.y+dy))return true;return false;});
   if(!touch)issues.push({frame:i+1,tag:c.tag,pose:c.pose,problem:'no ink at authored floor contact',feet:c.feet});else grounded++;
   if(!death&&Math.max(...c.feet.map(f=>f.y))!==contract.pivot.y-1)issues.push({frame:i+1,tag:c.tag,pose:c.pose,problem:'sole is above / below shared floor',feet:c.feet});
  }
  if(c.hand){const near=cs[0]?.pixels.some(([x,y])=>Math.abs(x-c.hand[0])<=2&&Math.abs(y-c.hand[1])<=2);if(!near)issues.push({frame:i+1,tag:c.tag,problem:'fist is disconnected from main body'});}
  if(name==='knight'&&c.tag.endsWith('-idle')&&c.pose===0){
   const [tx,ty]=c.tip,[hx,hy]=c.hand,len=Math.hypot(tx-hx,ty-hy),px=-(ty-hy)/len,py=(tx-hx)/len;
   const ink=(x,y)=>png.alpha(f.x+Math.round(x),f.y+Math.round(y));
   if(!ink(tx,ty)||ink(tx+px*2,ty+py*2)||ink(tx-px*2,ty-py*2))issues.push({frame:i+1,tag:c.tag,problem:'longsword point must taper to one pixel'});
  }
 }
 failed+=issues.length;report.push({name,frames:atlas.frames.length,grounded,connected,issues});console.log(name,atlas.frames.length+' frames',grounded+' floor contacts',connected+' connected live poses',issues.length+' issues');if(issues.length)console.log(JSON.stringify(issues.slice(0,20),null,2));
}
fs.writeFileSync(path.join(root,'previews','anchor-report.json'),JSON.stringify(report,null,2));
process.exitCode=failed?1:0;
