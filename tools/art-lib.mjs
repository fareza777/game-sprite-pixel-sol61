import fs from 'node:fs';
import path from 'node:path';
import {call, data, saveImages} from './mcp.mjs';
export {call, data};
export const ROOT=path.resolve(import.meta.dirname,'..');
export const P={
  '.':null, I:'#0b101b', n:'#101a26', d:'#172737', D:'#203746', s:'#314958',
  m:'#486271', l:'#6a8992', L:'#9bb9bc', H:'#d9e4d5',
  f:'#1c2b35', F:'#263a43', t:'#2e434b', T:'#3c5156',
  u:'#152d35', U:'#1c4148', v:'#26565a', V:'#38716c',
  g:'#3d554c', G:'#5c7960', q:'#839775', Q:'#b2ba8b',
  b:'#392432', c:'#652e3b', r:'#9d4249', R:'#ca6559', E:'#e59472',
  w:'#342c31', W:'#57423a', o:'#77573d', O:'#a77c4b',
  a:'#c69654', A:'#e6ba6d', y:'#f6dda0', Y:'#fff0c5',
  e:'#4b334c', p:'#73516b', z:'#a47b8c', Z:'#dfb5b2',
  j:'#2e6566', J:'#58a79b', k:'#9bd5b0', K:'#d2e9c0',
  h:'#8ca4ae', S:'#b7cbd0', B:'#e3e9df',
  x:'#353741', X:'#555862', M:'#7e838b', N:'#b1b5b7', C:'#e7e6d8',
  '0':'#171923','1':'#242d1b','2':'#3c4726','3':'#596735','4':'#798742','5':'#9eac53','6':'#c3cb72','7':'#eee29d','8':'#70654f','9':'#a29476',P:'#d0c4a2',i:'#eee4cd'
};
export function rect(x,y,width,height,c,fill=c){return {kind:'rect',rect:{x:Math.round(x),y:Math.round(y),width:Math.round(width),height:Math.round(height)},color:P[c]??c,...(fill?{fill:P[fill]??fill}:{})};}
export function line(x,y,x2,y2,c,thickness=1){return {kind:'line',from:{x:Math.round(x),y:Math.round(y)},to:{x:Math.round(x2),y:Math.round(y2)},color:P[c]??c,thickness:Math.max(1,Math.round(thickness))};}
export function ellipse(x,y,width,height,c,fill){return {kind:'ellipse',rect:{x:Math.round(x),y:Math.round(y),width:Math.round(width),height:Math.round(height)},color:P[c]??c,...(fill?{fill:P[fill]??fill}:{})};}
export function poly(points,c,fill){return {kind:'polyline',points:points.map(([x,y])=>({x:Math.round(x),y:Math.round(y)})),closed:!!fill,color:P[c]??c,...(fill?{fill:P[fill]??fill}:{})};}
export function grid(x,y,rows,legend=P){
  const rr=typeof rows==='string'?rows.split('\n'):rows;
  const width=Math.max(...rr.map(r=>r.length));
  const used=new Set(rr.join(''));const colors=Object.fromEntries(Object.entries(legend).filter(([key])=>used.has(key)));
  return {kind:'grid',x,y,rows:rr.map(r=>r.padEnd(width,'.')),legend:colors,transparent:'skip'};
}
export async function sprite(name,w,h,layers){
  const made=data(await call('sprite_manage',{op:'new',width:w,height:h,colorMode:'rgb'}));
  // Read the actual generated layer name before renaming it.
  const current=data(await call('sprite_info',made.id!==undefined?{sprite:'#'+made.id}:{}));
  const id='#'+current.id;
  await call('palette',{sprite:id,op:'set',colors:['#00000000',...Object.values(P).filter(Boolean)],replace:true});
  await call('layer',{sprite:id,op:'rename',name:current.layers[0].name,newName:layers[0]});
  for(const name of layers.slice(1)) await call('layer',{sprite:id,op:'create',name});
  return id;
}
export async function paint(id,layer,frame,ops,label){
  for(let i=0;i<ops.length;i+=480) await call('draw',{sprite:id,layer,frame,ops:ops.slice(i,i+480),label:label??`${layer} frame ${frame}`});
}
export async function finish(id,name,tags,durations,{sheet=true}={}){
  if(durations?.length) await call('frame',{sprite:id,op:'set_duration',durations});
  for(const [name,from,to] of tags) await call('tag',{sprite:id,op:'create',name,from,to,direction:'forward'});
  await call('sprite_manage',{sprite:id,op:'save_as',path:path.join(ROOT,'art',name+'.aseprite')});
  if(sheet) await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'assets',name+'.png'),sheetType:'packed',padding:0,trim:false});
  else await call('export',{sprite:id,op:'png',path:path.join(ROOT,'assets',name+'.png'),frame:1});
  const check=await call('validate',{sprite:id,checks:['palette','layers','animation','export_readiness']});
  fs.writeFileSync(path.join(ROOT,'previews',name+'-validation.json'),JSON.stringify(check.structuredContent??check,null,2));
  console.log('Saved',name);
}
export async function preview(id,name,op='preview',extra={}){
  const r=await call('look',{sprite:id,op,...extra});
  saveImages(r,path.join(ROOT,'previews',name+'.png'));
}
