import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,P,grid,line,rect,poly,ellipse} from './art-lib.mjs';
import {stone,brickwall,niche,banner,column} from './draw-room.mjs';
import {recolorOps} from './campaign-art-design.mjs';
import {offsetOps} from './actor-design-v2.mjs';
import {BIOMES} from '../game/content.mjs';

const rr=s=>s.split('|'),skull=rr('..qqqq..|.qHHQqs.|qQHHHQqs|qIIQQIIs|.qQHQqs.|..QHQq..|..qqqq..'),TAU=Math.PI*2;
const mix=(a,b,t)=>'#'+[1,3,5].map(n=>Math.round(parseInt(a.slice(n,n+2),16)*(1-t)+parseInt(b.slice(n,n+2),16)*t).toString(16).padStart(2,'0')).join('');
for(const b of BIOMES)for(let n=0;n<5;n++)P['pave-'+b.index+'-'+n]=mix(b.palette[0],b.palette[1],.24+n*.15);
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
const ink=(ops,b)=>recolorOps(ops,{[P.n]:b.palette[0],[P.d]:b.palette[0],[P.D]:b.palette[1],[P.s]:b.palette[1],[P.m]:b.palette[2],[P.l]:b.palette[3],[P.L]:b.palette[3],[P.H]:b.palette[4]});
const flame=(x,y)=>[poly([[x,y],[x-3,y-5],[x-1,y-11],[x+1,y-14],[x+2,y-7],[x+4,y-4]],'o','A'),line(x,y-3,x+1,y-8,'y')];
const candle=(x,y)=>[rect(x-2,y,5,3,'W'),rect(x,y-10,2,10,'q'),...flame(x,y-11)];
function sigil(b,x,y,size=10){const o=[],k=b.index;
 if(k===0)o.push(poly([[x-size,y+6],[x-size+3,y-5],[x-4,y-size],[x+4,y-size],[x+size-3,y-5],[x+size,y+6]],'O','W'),line(x-size-2,y+7,x+size+2,y+7,'A'),ellipse(x-3,y+8,7,5,'O','o'));
 if(k===1)for(const v of [-1,0,1])o.push(poly([[x-size,y+v*5],[x-3,y+v*5-3],[x+3,y+v*5+3],[x+size,y+v*5]],'j'));
 if(k===2)for(const s of [-1,1])o.push(poly([[x,y+size],[x+s*2,y],[x+s*size,y-size],[x+s*5,y+1]],'W','g'),line(x,y+size,x+s*size,y-size,'G'));
 if(k===3)o.push(poly([[x-size,y-size],[x+size,y-size],[x+size+3,y-3],[x+3,y+1],[x+3,y+7],[x+8,y+10],[x-8,y+10],[x-3,y+7],[x-3,y+1],[x-size-3,y-3]],'s','m'),line(x-size,y-size,x+size,y-size,'L'));
 if(k===4)o.push(grid(x-4,y-4,skull),line(x-8,y+10,x+8,y+10,'q'),line(x-8,y+8,x+8,y+12,'s'));
 if(k===5)for(let n=0;n<6;n++){const a=n*TAU/6;o.push(line(x,y,x+Math.cos(a)*size,y+Math.sin(a)*size,'j'),line(x+Math.cos(a)*size*.6,y+Math.sin(a)*size*.6,x+Math.cos(a+.5)*size*.8,y+Math.sin(a+.5)*size*.8,'J'));}
 if(k===6)o.push(poly([[x,y+size],[x-size,y],[x-size,y-6],[x-4,y-size],[x,y-size+4],[x+4,y-size],[x+size,y-6],[x+size,y]],'c','r'),line(x-5,y-5,x-5,y,'E'));
 if(k===7)o.push(ellipse(x-size,y-size,size*2,size*2,'O'),poly([[x,y-size-3],[x+3,y-3],[x+size+3,y],[x+3,y+3],[x,y+size+3],[x-3,y+3],[x-size-3,y],[x-3,y-3]],'l','L'));
 if(k===8){o.push(ellipse(x-size+3,y-size+3,size*2-6,size*2-6,'O','o'));for(let n=0;n<12;n++){const a=n*TAU/12;o.push(line(x+Math.cos(a)*size,y+Math.sin(a)*size,x+Math.cos(a)*(size+4),y+Math.sin(a)*(size+4),'O'));}}
 if(k===9)o.push(poly([[x-size,y-size],[x-4,y-5],[x,y-size-3],[x+4,y-5],[x+size,y-size],[x+size-2,y+size],[x-size+2,y+size]],'m','D'),line(x-6,y,x-2,y,'L'),line(x+2,y,x+6,y,'L'));
 return o;
}
function paving(b,variant){const c=Array.from({length:5},(_,n)=>P['pave-'+b.index+'-'+n]),o=[rect(0,0,64,64,c[0])],w=variant===1?16:variant===3?32:32,h=variant===1?16:variant===3?8:16;
 for(let y=0,row=0;y<64;y+=h,row++)for(let x=-(row%2?8:0);x<64;x+=w){const xx=Math.max(0,x),ww=Math.min(64,x+w-1)-xx;if(ww<2)continue;const n=(row*7+x*3+variant*11)>>>0;o.push(rect(xx,y,ww,h-1,c[1]),rect(xx+1,y+1,Math.max(1,ww-2),Math.max(1,h-3),c[2+n%2]),line(xx+2,y+1,xx+ww-2,y+1,c[4]),line(xx+2,y+h-2,xx+ww-1,y+h-2,c[1]));if(variant===2&&ww>15){o.push(poly([[xx+ww/2,y+3],[xx+ww/2+4,y+7],[xx+ww/2,y+h-4],[xx+ww/2-4,y+7]],c[1]),rect(xx+ww/2,y+6,1,1,mix(b.palette[2],b.palette[4],.15)));}if(n%5===0&&ww>18)o.push(poly([[xx+9,y+2],[xx+12,y+4],[xx+10,y+7],[xx+14,y+h-3]],c[0]));}
 return o;
}
function terrain(b,type){const o=[rect(0,0,80,80,'I')];if(type==='grass'){o.splice(0,1);for(let n=0;n<36;n++){const x=2+n*23%73,y=2+n*37%73;o.push(poly([[x,y+4],[x-2,y],[x+1,y+2],[x+3,y-3],[x+4,y+3]],n%3?'g':'G'));}return o;}
 if(type==='rubble'){o.push(rect(3,3,74,74,'n'));for(let y=5;y<78;y+=15)for(let x=4+(y%2)*5;x<78;x+=21)o.push(...stone(x,y,19,13,(x+y)%3?'D':'s'));o.push(poly([[25,9],[30,20],[26,28],[35,39],[29,54],[38,70]],'I'));return ink(o,b);}
 for(const x of [0,70])for(let y=0;y<80;y+=16)o.push(...stone(x,y,10,15,'m'));
 for(const y of [0,70])for(let x=10;x<70;x+=15)o.push(...stone(x,y,14,10,'s'));
 o.push(rect(10,10,60,60,'I'),rect(13,16,54,52,type==='water'?'u':type==='lava'?'b':'I'),rect(12,10,56,6,'n'),line(12,15,67,15,'D'),line(10,12,10,67,'D'));
 if(type==='void')for(let n=0;n<8;n++)o.push(line(16+n*7,18,16+n*7,28+n%3*8,'d'));
 if(type==='water')for(let y=22;y<69;y+=8)for(let x=15+y%3*2;x<64;x+=17)o.push(line(x,y,x+11,y,'v'),line(x+3,y+1,x+6,y+1,'j'));
 if(type==='lava')for(let n=0;n<18;n++){const x=16+n*17%46,y=23+n*13%39;o.push(poly([[x,y],[x+6,y-2],[x+11,y+2],[x+5,y+5],[x-2,y+2]],'c','R'),line(x+1,y,x+4,y-1,'A'));}
 return ink(o,b);
}
function decal(b,n){const o=[];if(n===0)for(const [x,y]of [[8,15],[33,32],[45,6]])o.push(poly([[x,y],[x+4,y+4],[x+2,y+7],[x+8,y+12],[x+6,y+19]],'n'),line(x+4,y+4,x+8,y+3,'d'));
 if(n===1)for(let j=0;j<7;j++){const x=4+j*17%47,y=8+j*11%40;o.push(grid(x,y,rr('..gGg...|.gGqGg..|ggGGggg.|.gg..gg.')));}
 if(n===2)for(let j=0;j<9;j++){const x=8+j*19%43,y=9+j*13%44;o.push(line(x,y,x+3,y+1,b.index===6?'c':'D'),rect(x+3,y+1,2,2,b.index===7?'e':'s'));}
 if(n===3){o.push(ellipse(15,21,30,13,'d'),poly([[17,28],[22,20],[35,24],[43,29],[34,33],[23,32]],b.index===6?'c':'D',b.index===6?'b':'n'));for(const [x,y]of [[8,16],[42,36]])o.push(...stone(x,y,9,5,'D'));}
 return ink(o,b);
}
function prop(b,type){const o=[],base=()=>o.push(...stone(17,90,78,7,'s'),...stone(22,85,68,6,'m'));
 if(type==='reading-table'){o.push(rect(27,63,5,31,'W','o'),rect(80,63,5,31,'W','o'),poly([[16,54],[88,54],[97,66],[23,66]],'W','o'),line(20,55,86,55,'A'),grid(40,53,rr('qQQQQq.qQQQQq|qQHHHq.qHHHQq|qQqHHq.qHHqQq|qQQQQq.qQQQQq')),line(34,61,77,61,'W'),...candle(28,61),...candle(85,61));}
 if(type==='bunk'){o.push(rect(23,39,6,56,'W','o'),rect(84,46,6,49,'W','o'),poly([[26,49],[76,49],[90,73],[38,73]],'W','o'),poly([[29,51],[74,51],[86,71],[40,71]],'n','D'),poly([[32,53],[45,53],[51,61],[36,61]],'s','m'),poly([[46,58],[77,58],[83,70],[53,70]],'c','b'),line(55,59,72,59,'r'),line(38,74,87,74,'O'),rect(35,74,5,21,'W','o'),rect(83,74,5,21,'W','o'));}
 if(type==='weapons-rack'){o.push(rect(25,28,7,68,'W','o'),rect(82,28,7,68,'W','o'),rect(20,36,74,7,'W','O'),rect(23,79,69,7,'W','o'));for(const x of [38,52,68,79]){o.push(line(x,22,x,83,'W',3),poly([[x,12],[x-4,25],[x,29],[x+4,25]],'s','L'),line(x,15,x,25,'H'),line(x-5,59,x+5,59,'O',2));}o.push(...stone(18,93,76,4,'D'));}
 if(type==='cage'){base();o.push(rect(23,29,66,57,'n','I'),poly([[22,30],[28,18],[56,9],[83,18],[90,30]],'s','D'),line(26,30,85,30,'L',2));for(let x=28;x<88;x+=8)o.push(line(x,30,x,84,'s',3),line(x,31,x,82,'m'));for(const y of [46,71,84])o.push(line(25,y,87,y,'m',3));o.push(rect(52,53,9,12,'O','W'),rect(55,56,3,5,'I'),grid(38,72,skull),line(44,82,67,82,'q'));}
 if(type==='bone-pile'){o.push(ellipse(17,91,80,5,'I','I'));for(let n=0;n<15;n++){const x=21+n*19%67,y=78+n*7%17;o.push(line(x,y,x+11,y-4,'q',3),rect(x-1,y-1,3,3,'Q'),rect(x+10,y-5,3,3,'q'));}for(const [x,y]of [[30,70],[48,63],[68,72],[43,81]])o.push(grid(x,y,skull));}
 if(type==='altar-font'){base();o.push(rect(43,56,26,29,'s','D'),ellipse(20,35,72,30,'s','m'),ellipse(27,37,58,22,'l','n'),ellipse(32,40,48,15,'u','v'),line(35,44,65,44,'j'),...sigil(b,56,72,8),...candle(18,90),...candle(94,90));}
 if(type==='anvil'){o.push(rect(36,65,40,31,'W','o'),line(40,67,40,94,'O'),poly([[20,52],[79,52],[95,56],[83,66],[69,67],[69,76],[77,82],[34,82],[43,76],[43,66],[26,62]],'s','m'),line(23,53,81,53,'L',2),line(45,66,65,66,'D'),rect(75,37,5,22,'W','o'),rect(67,34,21,8,'s','L'),grid(35,55,rr('..O..|.OAO.|OAyAO|.OAO.|..O..')));}
 if(type==='orrery'){base();o.push(rect(49,67,14,18,'O','W'),ellipse(20,18,72,55,'O'),ellipse(31,10,49,70,'O'),ellipse(17,33,79,24,'a'),line(28,20,86,69,'O'),line(18,54,93,31,'m'),ellipse(45,35,22,24,'O','o'),ellipse(50,39,10,10,'A','O'));for(const [x,y]of [[28,29],[81,29],[72,66],[37,59]])o.push(ellipse(x-4,y-4,9,9,'l','L'),rect(x-1,y-2,2,2,'H'));}
 if(type==='fallen-bell'){o.push(ellipse(21,91,75,5,'I','I'),poly([[23,79],[30,54],[46,39],[64,43],[85,66],[89,89],[76,96],[42,94]],'W','o'),poly([[29,78],[35,56],[47,45],[59,48],[76,66],[78,91],[44,89]],'O','a'),poly([[49,43],[60,45],[79,68],[81,89],[73,93],[68,65]],'W','O'),ellipse(76,65,22,31,'W','W'),ellipse(80,68,14,25,'O','w'),line(83,79,99,87,'W',4),ellipse(93,83,7,7,'W','O'),line(28,81,75,93,'A',2),line(35,60,44,49,'A'),poly([[52,47],[47,60],[56,70],[50,82],[57,91]],'W'));for(const [x,y]of [[38,68],[43,78],[60,81]])o.push(grid(x,y,rr('.O.|OWO|.O.')));}
 if(type==='balustrade'){o.push(...stone(8,88,96,8,'D'),...stone(8,45,96,8,'m'));for(const x of [18,40,62,84])o.push(...stone(x,54,11,32,'s'),line(x+2,55,x+2,83,'l'));o.push(line(10,45,101,45,'L'),...stone(5,39,102,6,'s'));}
 if(type==='statue-king'){base();o.push(poly([[33,84],[37,48],[44,40],[67,40],[77,51],[83,84]],'s','D'),rect(44,35,22,21,'s','m'),grid(44,22,rr('....ssssss....|..slLLLLmss...|.sLHHHHLLmss..|sLHHIIHHLLmssI|.sLHHLLHLLmssI|..sLLHHLLmssI.|...sssssssI...')),poly([[43,25],[43,13],[49,20],[55,9],[61,20],[68,13],[69,26]],'m','D'),line(34,58,23,79,'m',7),line(76,57,86,76,'s',7),line(58,55,58,90,'s',4),line(57,57,57,88,'L'),line(49,61,67,61,'O',2),...sigil(b,57,72,7));}
 return ink(o,b);
}
function doorway(b,d,closed){const o=[];if(d==='n'){
  o.push(poly([[16,95],[16,36],[23,18],[39,7],[56,2],[73,7],[89,18],[96,36],[96,95]],'I','D'),poly([[27,94],[27,36],[32,24],[44,15],[56,11],[68,15],[80,24],[85,36],[85,94]],'m','I'));
  for(const x of [17,87])for(let y=35;y<93;y+=14)o.push(...stone(x,y,9,13,'s'));for(let n=0;n<7;n++){const a=Math.PI+(n/6)*Math.PI,x=56+Math.cos(a)*35,y=37+Math.sin(a)*31;o.push(poly([[x-4,y-3],[x+4,y-2],[x+5,y+5],[x-3,y+5]],'m','s'));}
  for(let y=83;y<101;y+=6)o.push(...stone(24-(y-83)/3,y,64+(y-83)*2/3,5,'D'));
  if(closed){for(let x=32;x<85;x+=7)o.push(line(x,35,x,91,'s',3),line(x,37,x,88,'m'));for(const y of [53,78])o.push(line(29,y,83,y,'s',3));o.push(rect(52,59,9,13,'W','O'));}
  else o.push(rect(31,33,50,49,'I'),line(33,83,79,83,'m'),line(34,88,78,88,'s'),line(34,93,78,93,'m'));
 }else if(d==='s'){
  o.push(poly([[15,88],[26,69],[87,69],[98,88],[98,104],[15,104]],'s','D'),poly([[25,88],[31,77],[81,77],[89,88],[89,104],[25,104]],'n','I'));
  for(let y=87;y<105;y+=6)o.push(line(28,y,86,y,closed?'s':'m',closed?2:1));if(closed)for(let x=32;x<85;x+=8)o.push(line(x,79,x,102,'s',2));
 }else{const west=d==='w',X=x=>west?112-x:x;
  o.push(poly([[X(40),95],[X(39),37],[X(48),21],[X(65),15],[X(79),28],[X(82),95]],'s','D'),poly([[X(49),93],[X(49),39],[X(55),30],[X(65),26],[X(72),36],[X(72),93]],'n','I'));
  for(const x of [40,75])for(let y=39;y<94;y+=13)o.push(...stone(X(x)-3,y,7,12,'m'));for(let y=81;y<99;y+=6)o.push(line(X(46),y,X(77),y,'s'));
  if(closed)for(let y=40;y<90;y+=8)o.push(line(X(51),y,X(71),y,'s',2));else o.push(line(X(53),39,X(53),81,'D'));
 }return ink(o,b);
}
function exit(b,kind,locked){const o=[];
 if(kind==='stairs'){o.push(poly([[17,69],[35,48],[80,48],[96,69],[96,96],[17,96]],'s','D'),poly([[24,70],[39,55],[76,55],[88,70],[88,89],[24,89]],'n','I'));for(let n=0;n<6;n++){const x=30+n*3,y=86-n*5;o.push(rect(x,y,51-n*6,4,'D'),line(x+1,y,79-n*3,y,'m'));}o.push(line(19,69,19,93,'l'),line(94,69,94,93,'s'),...sigil(b,57,43,8));}
 if(kind==='spiral'){o.push(ellipse(14,50,84,48,'s','D'),ellipse(21,55,70,35,'m','I'));for(let n=0;n<9;n++){const a=n*.57,rad=29-n*2,x=56+Math.cos(a)*rad,y=73+Math.sin(a)*rad*.42;o.push(line(x,y,x+10,y+1,'s',3),line(x,y-1,x+9,y,'m'));}o.push(...sigil(b,56,41,8));}
 if(kind==='lift'){o.push(ellipse(17,71,78,26,'I','D'),poly([[23,74],[78,65],[92,81],[40,91]],'s','m'));for(let x=31;x<84;x+=10)o.push(line(x,74,x+8,85,'D'));for(const x of [24,87]){o.push(line(x,25,x,77,'O',2));for(let y=29;y<73;y+=7)o.push(ellipse(x-2,y,5,7,'W'));}o.push(...sigil(b,56,76,8));}
 if(kind==='well'){o.push(ellipse(12,61,88,36,'s','D'),ellipse(19,60,74,28,'m','I'),ellipse(28,65,56,17,'n','I'));for(const x of [20,35,53,71,85])o.push(line(x,83,x,93,'n'));o.push(line(55,55,55,79,'O'),line(65,58,65,81,'O'));for(let y=60;y<81;y+=5)o.push(line(55,y,65,y,'m'));o.push(...sigil(b,56,41,8));}
 if(locked){o.push(poly([[27,69],[42,78],[58,70],[76,78],[88,68]],'s'),poly([[27,83],[43,74],[59,82],[75,73],[88,84]],'s'),rect(51,71,12,14,'W','O'),rect(55,75,4,7,'I'));}else{for(const [x,y]of [[20,91],[91,91]])o.push(...candle(x,y));o.push(line(41,99,72,99,'a'));}
 return ink(o,b);
}
function header(b,style){const o=[rect(0,0,360,120,'I'),...brickwall(8,12,344,83),rect(8,10,344,5,'m'),line(10,10,350,10,'l'),rect(8,94,344,8,'I'),...stone(10,102,340,7,'s')];
 if(style==='cloister'){for(const x of [29,91,234,297])o.push(...niche(x,30));for(const x of [14,127,213,327])o.push(...column(x-7,61));for(const x of [75,275])o.push(...banner(x,25));}
 if(style==='crypt'){for(const x of [24,61,98,237,274,311]){o.push(rect(x,29,25,56,'n','I'),...stone(x-3,83,31,6,'s'));for(let y=34;y<81;y+=13)o.push(grid(x+8,y,skull),line(x+3,y+10,x+22,y+10,'s'));}}
 if(style==='broken'){for(const x of [25,96,245,319])o.push(poly([[x-7,96],[x-8,54],[x-2,34],[x-8,12],[x+5,24],[x+10,49],[x+8,96]],'s','D'),line(x-3,53,x-3,89,'m'));for(const s of [-1,1])o.push(poly([[180+s*77,13],[180+s*69,40],[180+s*89,58],[180+s*76,81],[180+s*82,108]],'W'),poly([[180+s*71,41],[180+s*96,48],[180+s*104,42],[180+s*92,38]],'g','G'));}
 if(style==='throne'){for(const x of [23,88,250,315])o.push(...column(x,56),...stone(x-3,21,34,7,'O'));for(const x of [59,283])o.push(...banner(x,33));}
 o.push(rect(144,25,72,65,'n','D'),poly([[145,27],[156,17],[180,11],[204,17],[215,27],[215,88],[145,88]],'m'),rect(152,30,56,49,'s','n'),...sigil(b,180,53,17),...stone(139,88,82,7,'m'));
 for(const x of [19,335])o.push(...candle(x,111));return ink(o,b);
}
async function atlas(name,w,h,entries,render){if(process.argv.includes('--resume')&&!(process.argv.includes('--polish-props')&&name==='descent-props')&&fs.existsSync(path.join(ROOT,'assets',name+'.json')))return;const id=await sprite(name,w,h,['authored-pixels']);if(entries.length>1)await call('frame',{sprite:id,op:'add',count:entries.length-1});const tags=[];let frame=1;for(const e of entries){await paint(id,'authored-pixels',frame,render(e),e.label);tags.push([e.label,frame,frame]);frame++;}await finish(id,name,tags,entries.map(()=>100));await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});}
const propKinds=['reading-table','bunk','weapons-rack','cage','bone-pile','altar-font','anvil','orrery','fallen-bell','balustrade','statue-king'];
await atlas('descent-paving',64,64,BIOMES.flatMap(b=>[0,1,2,3].map(n=>({b,n,label:b.id+'-'+n}))),e=>paving(e.b,e.n));
await atlas('descent-terrain',80,80,BIOMES.flatMap(b=>['void','water','lava','grass','rubble'].map(kind=>({b,kind,label:b.id+'-'+kind}))),e=>terrain(e.b,e.kind));
await atlas('descent-decals',64,64,BIOMES.flatMap(b=>[0,1,2,3].map(n=>({b,n,label:b.id+'-'+n}))),e=>decal(e.b,e.n));
await atlas('descent-props',112,112,BIOMES.flatMap(b=>propKinds.map(kind=>({b,kind,label:b.id+'-'+kind}))),e=>prop(e.b,e.kind));
await atlas('descent-doors',112,112,BIOMES.flatMap(b=>['n','e','s','w'].flatMap(d=>[false,true].map(closed=>({b,d,closed,label:b.id+'-'+d+'-'+(closed?'sealed':'open')})))),e=>doorway(e.b,e.d,e.closed));
await atlas('descent-exits',112,112,BIOMES.flatMap(b=>['stairs','spiral','lift','well'].flatMap(kind=>[false,true].map(locked=>({b,kind,locked,label:b.id+'-'+kind+'-'+(locked?'sealed':'open')})))),e=>exit(e.b,e.kind,e.locked));
await atlas('descent-headers',360,120,BIOMES.flatMap(b=>['cloister','crypt','broken','throne'].map(style=>({b,style,label:b.id+'-'+style}))),e=>header(e.b,e.style));
const id=await sprite('descent-world-review',960,620,['architecture','objects']);for(let n=0;n<4;n++)await paint(id,'architecture',1,offsetOps(header(BIOMES[n*2],['cloister','crypt','broken','throne'][n]),n%2*480,Math.floor(n/2)*125));for(let n=0;n<propKinds.length;n++)await paint(id,'objects',1,offsetOps(prop(BIOMES[n%10],propKinds[n]),n%8*120,260+Math.floor(n/8)*115));for(let n=0;n<4;n++)await paint(id,'objects',1,offsetOps(exit(BIOMES[0],['stairs','spiral','lift','well'][n],false),480+n*112,400));await finish(id,'descent-world-review',[],[],{sheet:false});await preview(id,'descent-world-review','preview',{scale:1});await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});
console.log('Descent architecture: four floor finishes, real doors, four descent mechanisms and eleven large set pieces in all ten biomes.');
