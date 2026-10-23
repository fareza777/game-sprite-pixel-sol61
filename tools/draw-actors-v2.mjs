import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,P} from './art-lib.mjs';
import {heroPose,hollowPose,wardenPose,wispPose,HERO_TIMES,ENEMY_TIMES} from './actor-design-v2.mjs';
import {ogrePose} from './ogre-design.mjs';
const contracts={};
export function materialPass(name,layer,ops){
 const map={};
 if(name==='knight'){
  Object.assign(map,{[P.I]:P['0'],[P.s]:P.x,[P.m]:P.X,[P.l]:P.M,[P.L]:P.N,[P.H]:P.C});
  if(['body','cloak'].includes(layer))Object.assign(map,{[P.c]:P.W,[P.r]:P.O,[P.R]:P.A,[P.E]:P.y});
 }
 if(name==='hollow')Object.assign(map,{[P.q]:P['9'],[P.Q]:P.P,[P.H]:P.i,[P.e]:P.c,[P.p]:P.r});
 return ops.map(o=>{const p=structuredClone(o);for(const key of ['color','fill'])if(map[p[key]])p[key]=map[p[key]];if(p.legend)for(const key of Object.keys(p.legend))if(map[p.legend[key]])p.legend[key]=map[p.legend[key]];return p;});
}
async function makeActor(name,w,h,pivot,poseFn,timings,{directional=true,airborne=false,onlyTag}={}){
 const layers=['cloak','plume','body','arms','equipment','effects'];
 const id=await sprite(name,w,h,layers),tags=[],durations=[],frames=[];
 const jobs=[];
 for(const d of directional?['s','n','e','w']:[''])for(const [state,times]of Object.entries(timings)){
  const tag=d?`${d}-${state}`:state;if(onlyTag&&tag!==onlyTag)continue;
  jobs.push({d,state,times,tag});
 }
 const count=jobs.reduce((n,j)=>n+j.times.length,0);
 await call('frame',{sprite:id,op:'add',count:count-1});
 let frame=1;
 for(const {d,state,times,tag}of jobs){
  const start=frame;
  for(let i=0;i<times.length;i++,frame++){
   const pose=directional?poseFn(d,state,i):poseFn(state,i);
   for(const layer of layers)if(pose[layer]?.length)await paint(id,layer,frame,materialPass(name,layer,pose[layer]),`${name}: authored ${tag} ${i+1}, anchored body and grip`);
   frames.push({frame,tag,pose:i,feet:pose.feet??[],hand:pose.hand,tip:pose.tip,secondHand:pose.secondHand,haft:pose.haft,airborne:pose.airborne??airborne});durations.push(times[i]);
  }
  tags.push([tag,start,frame-1]);console.log(name,tag,start+'-'+(frame-1));
 }
 await finish(id,name,tags,durations);
 const atlasFile=path.join(ROOT,'assets',name+'.json'),atlas=JSON.parse(fs.readFileSync(atlasFile,'utf8'));
 const motion=name==='knight'?{attack:{windupMs:110,activeMs:120,settleMs:230},'attack-backhand':{windupMs:110,activeMs:120,settleMs:230},'attack-heavy':{windupMs:170,activeMs:145,settleMs:265}}:{attack:{windupMs:420,activeMs:135,settleMs:380}};
 atlas.meta.anchor={...pivot,groundY:pivot.y-1,airborne};atlas.meta.motion=motion;atlas.meta.artRevision=2;
 fs.writeFileSync(atlasFile,JSON.stringify(atlas));
 // This export omits airborne particles and sword smears so connectivity means anatomy and held gear.
 await call('export',{sprite:id,op:'spritesheet',path:path.join(ROOT,'previews',name+'-structure.png'),sheetType:'rows',layers:layers.filter(l=>l!=='effects'),padding:0,trim:false});
 contracts[name]={width:w,height:h,pivot,frames};
 fs.writeFileSync(path.join(ROOT,'previews',name+'-contract.json'),JSON.stringify(contracts[name],null,2));
 await preview(id,name+'-detail-v2','preview',{frame:1,scale:name==='warden'?4:6});
 return id;
}
export async function drawKnight(){return makeActor('knight',96,96,{x:48,y:76},heroPose,HERO_TIMES);}
export async function drawSkeleton(){return makeActor('hollow',96,96,{x:48,y:76},hollowPose,ENEMY_TIMES);}
export async function drawBoss(){return makeActor('warden',144,112,{x:64,y:96},ogrePose,ENEMY_TIMES);}
export async function drawWisp(){return makeActor('wisp',64,64,{x:32,y:58},wispPose,{idle:[220,180,240,360],walk:[130,90,80,100,130,90,80,100],attack:[120,150,150,45,90,80,100,100,100],hurt:[60,70,80,90],death:[80,90,90,100,100,120,400]},{directional:false,airborne:true});}
export async function buildAll(){await drawKnight();await drawSkeleton();await drawBoss();await drawWisp();fs.writeFileSync(path.join(ROOT,'previews','actor-contracts.json'),JSON.stringify(contracts,null,2));}
if(process.argv[1]?.endsWith('draw-actors-v2.mjs')){
 const target=process.argv[2]??'all';
 if(target==='all')await buildAll();
 else {if(target==='knight')await drawKnight();if(target==='hollow')await drawSkeleton();if(target==='warden')await drawBoss();if(target==='wisp')await drawWisp();fs.writeFileSync(path.join(ROOT,'previews',target+'-contract.json'),JSON.stringify(contracts[target],null,2));}
}
