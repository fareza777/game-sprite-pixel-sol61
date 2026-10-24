import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,P,grid,line,poly,ellipse,rect} from './art-lib.mjs';
import {heroDesign} from './descent-actors.mjs';
import {allLayers,weaponOps} from './campaign-art-design.mjs';
import {offsetOps} from './actor-design-v2.mjs';
import {HEROES,SKILLS} from '../game/content.mjs';
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
const TAU=Math.PI*2,weights=[.10,.10,.14,.08,.18,.12,.13,.15],keys=[0,1,2,3,4,5,7,8];
const resume=name=>process.argv.includes('--resume')&&fs.existsSync(path.join(ROOT,'assets',name+'.json'));
async function close(id){await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});}
function jewel(x,y,color='k'){return [grid(Math.round(x)-3,Math.round(y)-4,['...j...','..jJj..','.jJkJj.','jJkkkJj','.jJkJj.','..jJj..','...j...'],{...P,k:P[color]??color})];}
function rune(x,y,n,c){const t=n%4;return t===0?[line(x-3,y+3,x,y-4,c),line(x,y-4,x+3,y+3,c),line(x-2,y,x+2,y,c)]:t===1?[line(x-3,y-3,x+3,y+3,c),line(x-3,y+3,x+3,y-3,c),line(x,y-5,x,y+5,c)]:t===2?[poly([[x,y-5],[x+3,y],[x,y+5],[x-3,y],[x,y-5]],c)]:[line(x-2,y-4,x-2,y+4,c),line(x-2,y-4,x+3,y-1,c),line(x+3,y-1,x-2,y+2,c)];}
function casting(hero,skill,d,k){
 const state=skill.kind==='ward'?'block':skill.kind==='dash'&&k>=3&&k<=5?'attack-backhand':skill.kind==='nova'||skill.kind==='meteor'?'attack-heavy':skill.kind==='blades'?'attack-backhand':'attack';
 const key=state==='block'?[0,1,2,2,3,3,2,0][k]:keys[k],p=heroDesign(hero.id,d,state,key),color=skill.color;
 if(skill.kind==='nova'&&k>=3&&k<=5&&p.hand){p.equipment=p.equipment.filter(o=>o.kind==='grid');const h=p.hand,tip=[h[0],74];p.equipment.push(...weaponOps('sword',h,tip));p.effects=[];}
 if(k<4){const hand=p.offhand??p.hand??[61,47];for(let n=0;n<k+1;n++)p.effects.push(...rune(hand[0]+Math.cos(n*TAU/4)*10,hand[1]+Math.sin(n*TAU/4)*8,n,color));}
 if(skill.kind==='mark'&&p.offhand)p.effects.push(...jewel(p.offhand[0],p.offhand[1]-7,'Z'));
 return {ink:offsetOps(allLayers.filter(l=>l!=='effects').flatMap(l=>p[l]??[]),16,24),effects:offsetOps(p.effects??[],16,24)};
}
async function casts(hero){const name='hero-casts-'+hero.id;if(resume(name))return;const id=await sprite(name,128,128,['ink','effects']);await call('frame',{sprite:id,op:'add',count:95});let frame=1;const tags=[],dur=[];
 for(const skill of SKILLS.filter(s=>s.hero===hero.id))for(const d of ['s','n','e','w']){const start=frame;for(let k=0;k<8;k++,frame++){const p=casting(hero,skill,d,k);await paint(id,'ink',frame,p.ink,skill.name+' articulated casting key '+k);await paint(id,'effects',frame,p.effects,'Gather and release');dur.push(Math.round(skill.castDuration*1000*weights[k]));}tags.push([d+'-'+skill.id,start,frame-1]);}
 await finish(id,name,tags,dur);const f=path.join(ROOT,'assets',name+'.json'),atlas=JSON.parse(fs.readFileSync(f,'utf8'));atlas.meta.anchor={x:64,y:100,groundY:99};atlas.meta.releaseKey=3;fs.writeFileSync(f,JSON.stringify(atlas));await preview(id,name+'-motion','filmstrip',{tag:'s-'+hero.skillIds[0],scale:1});await preview(id,name+'-onion','onion',{frame:4,framesBefore:1,framesAfter:1,scale:2});await close(id);
}
function effect(s,k){const o=[],t=k/11,c=s.color,fade=k>8,mid=s.hero==='knight'?'O':s.hero==='rogue'?'J':'z',bright=s.hero==='knight'?'y':s.hero==='rogue'?'k':'K',x=128,y=128;
 const ring=(r,wide=1,squash=.53)=>{for(let n=0;n<48;n++){if((n+k)%7===0)continue;const a=n*TAU/48,b=(n+.8)*TAU/48;o.push(line(x+Math.cos(a)*r,y+Math.sin(a)*r*squash,x+Math.cos(b)*r,y+Math.sin(b)*r*squash,c,wide));}};
 const motes=(r,count=12)=>{for(let n=0;n<count;n++){const a=n*TAU/count+k*.13,rr=r*(.75+(n%3)*.12),xx=x+Math.cos(a)*rr,yy=y+Math.sin(a)*rr*.6;o.push(rect(xx,yy,2,2,mid));if(!fade&&n%3===0)o.push(line(xx-2,yy,xx+2,yy,bright),line(xx,yy-2,xx,yy+2,bright));}};
 if(s.kind==='cleave'){const r=24+t*72;for(let n=0;n<26;n++){const a=-2.8+n*.15+t*.3,outer=r+(n/26)*9,inner=outer-3-8*Math.sin(n/26*Math.PI);o.push(poly([[x+Math.cos(a)*inner,y+Math.sin(a)*inner*.65-14],[x+Math.cos(a)*outer,y+Math.sin(a)*outer*.65-14],[x+Math.cos(a+.12)*outer,y+Math.sin(a+.12)*outer*.65-14]],mid,mid),line(x+Math.cos(a)*outer,y+Math.sin(a)*outer*.65-14,x+Math.cos(a+.12)*outer,y+Math.sin(a+.12)*outer*.65-14,bright));}motes(r,8);}
 if(s.kind==='ward'){const sy=y-34,spread=19+Math.min(1,t*4)*12;o.push(poly([[x-spread,sy-28],[x,sy-39],[x+spread,sy-28],[x+spread-3,sy+10],[x,sy+38],[x-spread+3,sy+10],[x-spread,sy-28]],'l'),poly([[x-spread+4,sy-25],[x,sy-34],[x+spread-4,sy-25],[x+spread-7,sy+9],[x,sy+31],[x-spread+7,sy+9]],c),line(x,sy-24,x,sy+18,bright),line(x-12,sy-7,x+12,sy-7,bright));ring(35);for(let n=0;n<5;n++)o.push(...rune(x-31+n*15,y+16,n,c));}
 if(s.kind==='nova'){const r=9+t*114;ring(r,k<6?2:1);ring(Math.max(3,r-11));for(let n=0;n<12;n++){const a=n*TAU/12,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.53;o.push(line(xx,yy,xx+Math.cos(a)*9,yy+Math.sin(a)*7,bright));if(n%2===0)o.push(...rune(xx,yy,n,c));}motes(r,18);if(k<5)o.push(poly([[x-5,y-9],[x,y-72+t*70],[x+5,y-9],[x,y+10]],'y','A'));}
 if(s.kind==='dash'){for(let n=0;n<6;n++){const xx=38+n*28+t*18,yy=y+Math.sin(n*1.3+k)*9;o.push(line(xx-23,yy+6,xx,yy-7,c,2),line(xx-18,yy+8,xx+2,yy-6,mid));if(n%2===0)o.push(...jewel(xx,yy,'k'));}motes(34+t*60,10);}
 if(s.kind==='blades'){const r=16+t*100;for(let n=0;n<6;n++){const a=n*TAU/6+t*.4,xx=x+Math.cos(a)*r,yy=y+Math.sin(a)*r*.65;o.push(...weaponOps('daggers',[xx,yy],[xx+Math.cos(a)*19,yy+Math.sin(a)*19]));for(let j=0;j<3;j++)o.push(line(xx-Math.cos(a)*(j*6+6),yy-Math.sin(a)*(j*6+6)*.65,xx-Math.cos(a)*(j*6+10),yy-Math.sin(a)*(j*6+10)*.65,mid));}ring(r*.72);}
 if(s.kind==='mark'){const r=20+Math.sin(t*Math.PI)*8;ring(r);o.push(poly([[x,y-79],[x+7,y-67],[x,y-55],[x-7,y-67],[x,y-79]],c),line(x-16,y-69,x+16,y-69,bright),line(x,y-87,x,y-48,bright));for(let n=0;n<4;n++)o.push(...rune(x+Math.cos(n*TAU/4+t)*r,y+Math.sin(n*TAU/4+t)*r*.5,n,c));}
 if(s.kind==='bolt'){ring(17+t*24);for(let n=0;n<3;n++){const a=n*TAU/3+t*2,rr=12+t*35;o.push(...jewel(x+Math.cos(a)*rr,y-30+Math.sin(a)*rr*.5,'K'));}motes(18+t*48,14);}
 if(s.kind==='orbit'){ring(46);for(let n=0;n<3;n++){const a=n*TAU/3+k*TAU/12,xx=x+Math.cos(a)*47,yy=y-15+Math.sin(a)*31;o.push(...jewel(xx,yy,'Z'));for(let h=1;h<4;h++){const aa=a-h*.13;o.push(rect(x+Math.cos(aa)*47,y-15+Math.sin(aa)*31,3-h*.4,3-h*.4,mid));}}}
 if(s.kind==='meteor'){if(k<8){const yy=y-132+k*16;o.push(poly([[x-10,yy],[x-16,yy-30],[x-4,yy-21],[x+3,yy-58],[x+8,yy-23],[x+15,yy-38],[x+11,yy+3]],'z','p'),...jewel(x,yy,'K'));ring(26+k*3);for(let n=0;n<6;n++)o.push(...rune(x+Math.cos(n*TAU/6)*45,y+Math.sin(n*TAU/6)*25,n,c));}else{const r=24+(k-8)*29;ring(r,2);ring(r-7);motes(r,22);for(let n=0;n<9;n++){const a=n*TAU/9;o.push(poly([[x+Math.cos(a)*r*.4,y+Math.sin(a)*r*.2],[x+Math.cos(a)*r,y+Math.sin(a)*r*.6-15],[x+Math.cos(a+.07)*r,y+Math.sin(a+.07)*r*.6]],mid,mid));}}}
 return o;
}
async function effects(hero){const name='vfx-'+hero.id;if(resume(name))return;const id=await sprite(name,256,256,['spellcraft']);await call('frame',{sprite:id,op:'add',count:35});const tags=[],times=[];let frame=1;for(const s of SKILLS.filter(s=>s.hero===hero.id)){const start=frame;for(let k=0;k<12;k++,frame++){await paint(id,'spellcraft',frame,effect(s,k),s.name+' effect key '+k);times.push(Math.round((s.kind==='meteor'?1300:900)/12));}tags.push([s.id,start,frame-1]);}await finish(id,name,tags,times);const f=path.join(ROOT,'assets',name+'.json'),atlas=JSON.parse(fs.readFileSync(f,'utf8'));atlas.meta.anchor={x:128,y:128};fs.writeFileSync(f,JSON.stringify(atlas));await preview(id,name+'-motion','filmstrip',{tag:hero.skillIds[2],scale:1});await close(id);}
for(const h of HEROES){await casts(h);await effects(h);}
console.log('288 articulated four-direction casting poses and 108 hand-authored spell-effect keys exported through MCP Aseprite.');
