import vm from 'node:vm';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const elements={},listeners={};let nextFrame,generated=0,drawCalls=0;
const context2D=new Proxy({createRadialGradient:()=>({addColorStop(){}}),drawImage(image,...args){
 drawCalls++;
 if(args.length===8&&Number.isFinite(image.width)&&Number.isFinite(image.height)){
  const [x,y,w,h]=args;assert.ok(x>=0&&y>=0&&w>0&&h>0,'Sprite source rectangle has positive bounds');assert.ok(x+w<=image.width&&y+h<=image.height,`Source ${x},${y},${w},${h} exceeds ${image.width} × ${image.height}`);
 }
}},{get:(o,p)=>p in o?o[p]:()=>{},set:(o,p,v)=>(o[p]=v,true)});
function element(id){return elements[id]??=( {dataset:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},focus(){},addEventListener(type,fn){listeners[type]=fn;},getContext:()=>context2D,style:{},toDataURL:()=>'',getBoundingClientRect:()=>({left:0,top:0,width:640,height:400})} );}
const window={addEventListener(type,fn){listeners[type]=fn;}};
const c=vm.createContext({console,Math,Date,Set,Map,Promise,URLSearchParams,location:{search:''},performance:{now:()=>0},document:{getElementById:element,createElement:()=>element('generated-'+generated++)},window,Image:class{set src(v){const b=Buffer.from(v.split(',')[1],'base64');this.width=b.readUInt32BE(16);this.height=b.readUInt32BE(20);this.complete=true;queueMicrotask(()=>this.onload());}},requestAnimationFrame:fn=>nextFrame=fn,setTimeout});
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
vm.runInContext(html.match(/<script>([\s\S]*?)<\/script>/)[1],c);
await new Promise(resolve=>setTimeout(resolve,10));
assert.ok(nextFrame,'Client queues its animation loop');
elements.begin.onclick();
listeners.keydown({key:'w',preventDefault(){},repeat:false});
for(let i=1;i<=42;i++){const f=nextFrame;nextFrame=null;f(i*1000/60);assert.ok(nextFrame,'The animation loop must continue');}
listeners.keyup({key:'w'});
const afterMove=window.CinderVow.snapshot();assert.ok(afterMove.player.y<220,JSON.stringify(afterMove));
listeners.keydown({key:'j',preventDefault(){},repeat:false});
for(let i=43;i<=100;i++)nextFrame(i*1000/60);
listeners.keyup({key:'j'});
listeners.keydown({key:'p',preventDefault(){},repeat:false});nextFrame(101*1000/60);
assert.equal(window.CinderVow.snapshot().state,'paused');
console.log('PASS browser client initialization, asset loading, 100 rendered frames, held movement, attack input, pause');
console.log(JSON.stringify({afterMove,final:window.CinderVow.snapshot()}));
// Render every authored pose through the shipping renderer, including native-size boss flashes.
const assets=JSON.parse(html.match(/const ASSETS=(.*);\r?\nconst FONT=/)[1]);
const g=window.CinderVow.game;g.state='paused';g.enemies=[];g.corpses=[];g.bolts=[];g.player.invuln=0;
let poseCount=0,clock=2000;
for(const name of ['knight','hollow','warden','wisp']){
 const a=assets[name];
 for(const tag of a.meta.frameTags){
  const parts=tag.name.split('-'),face=name==='wisp'?'s':parts.shift(),action=name==='wisp'?tag.name:parts.join('-');let ms=0;
  for(let i=tag.from;i<=tag.to;i++){
   const seconds=(ms+1)/1000;
   if(name==='knight'){
    g.enemies=[];g.player.face=face;g.player.action=action.startsWith('attack')?'attack':action;g.player.attackKind=action==='attack-heavy'?2:action==='attack-backhand'?1:0;g.player.at=seconds;
   }else{
    g.player.action='idle';const e={type:name,face,x:400,y:240,hp:40,maxHp:80,action,at:seconds,step:seconds,phase:'chase',hitFlash:i%3===0?.1:0,dead:action==='death'};
    if(action==='attack'){
     const {windupMs:w,activeMs:s,settleMs:r}=a.meta.motion.attack;
     e.windupDuration=w/1000;e.strikeDuration=s/1000;e.recoverDuration=r/1000;
     if(ms<w){e.phase='windup';e.at=seconds;}else if(ms<w+s){e.phase='strike';e.at=(ms-w+1)/1000;}else{e.phase='recover';e.at=(ms-w-s+1)/1000;}
    }
    g.enemies=[e];
   }
   nextFrame(clock+=17);poseCount++;ms+=a.frames[i].duration;
  }
 }
}
assert.equal(poseCount,528);console.log('PASS all 528 authored poses render within source bounds, including every facing, combo, death and boss flash;',drawCalls,'draws');
