import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,grid,line,poly,rect,ellipse,P} from './art-lib.mjs';
import {stone,brickwall,niche,banner,column} from './draw-room.mjs';
import {recolorOps} from './campaign-art-design.mjs';
import {offsetOps as shifted} from './actor-design-v2.mjs';
import {BIOMES,EVENTS} from '../game/content.mjs';

const kinds=['pit','water','lava','dais','rune','pressure','sarcophagus','bookcase','roots','machine','broken-column','debris','well','obelisk','carpet','grate'];
const styles=['cloister','crypt','broken','throne'];
const offsetOps=(ops,[x,y])=>shifted(ops,x,y);
const rr=s=>s.split('|'),skull=rr('..qqqq..|.qHHQqs.|qQHHHQqs|qIIQQIIs|.qQHQqs.|..QHQq..|..qqqq..');
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
function tint(ops,b){const p=b.palette;return recolorOps(ops,{[P.I]:p[0],[P.n]:p[0],[P.d]:p[0],[P.D]:p[1],[P.s]:p[1],[P.m]:p[2],[P.l]:p[3],[P.L]:p[3],[P.H]:p[4]});}
function candle(x,y){return [rect(x-2,y,5,4,'W'),rect(x,y-11,2,11,'q'),rect(x,y-14,2,3,'A'),rect(x,y-13,1,2,'y'),line(x+2,y-4,x+2,y,'Q')];}
function paving(x,y,w,h){const o=[];for(let j=0;j<h;j+=10)for(let i=0;i<w;i+=18)o.push(...stone(x+i,y+j,Math.min(17,w-i),Math.min(9,h-j),'D'));return o;}
function kit(kind,b){const o=[];
 if(['pit','water','lava'].includes(kind)){
  o.push(poly([[8,15],[69,15],[74,21],[74,61],[68,67],[8,67],[4,61],[4,22]],'I','I'),rect(9,21,59,40,'n'));
  for(const x of [5,69])for(let y=18;y<64;y+=11)o.push(...stone(x,y,6,10,'m'));
  for(let x=11;x<69;x+=12)o.push(...stone(x,14,11,6,'l'),...stone(x,63,11,6,'s'));
  o.push(rect(12,22,54,39,kind==='water'?'u':kind==='lava'?'b':'I'),line(12,23,65,23,'d'),line(13,25,13,58,'d'));
  if(kind==='pit')for(let n=0;n<5;n++)o.push(line(18+n*9,26,16+n*9,39+n%3*4,'D'),rect(16+n*9,38+n%3*4,2,5,'n'));
  if(kind==='water')for(let y=28;y<60;y+=7)for(let x=17+(y%3)*3;x<61;x+=18)o.push(line(x,y,x+9,y,'v'),line(x+2,y+1,x+6,y+1,'j'));
  if(kind==='lava')for(let n=0;n<9;n++){const x=16+n%3*17,y=28+Math.floor(n/3)*10;o.push(poly([[x,y],[x+5,y-2],[x+12,y+2],[x+7,y+5],[x-2,y+3]],'r','R'),line(x+1,y,x+5,y-1,'A'));}
  o.push(poly([[19,14],[22,17],[20,20]],'I'),poly([[61,64],[58,67],[60,69]],'I'));
 }
 if(kind==='dais'){
  o.push(ellipse(3,11,74,59,'I','D'),ellipse(5,10,70,55,'m','s'),ellipse(9,12,62,47,'l','D'),ellipse(13,15,54,40,'s','n'),ellipse(18,18,44,32,'O'));
  for(let n=0;n<12;n++){const a=n*Math.PI/6,x=40+Math.cos(a)*27,y=35+Math.sin(a)*19;o.push(line(x,y,x+Math.cos(a)*3,y+Math.sin(a)*3,'m'));}
  o.push(poly([[40,18],[45,29],[59,35],[45,40],[40,51],[35,40],[21,35],[35,29]],'O','D'),line(40,23,40,46,'m'),line(28,35,51,35,'m'),rect(37,32,6,6,'O'));
 }
 if(kind==='rune'){
  o.push(ellipse(6,17,68,43,'s'),ellipse(10,20,60,37,'m'),ellipse(16,24,48,29,'D'));
  for(let n=0;n<8;n++){const a=n*Math.PI/4,x=40+Math.cos(a)*29,y=39+Math.sin(a)*18;o.push(grid(Math.round(x)-2,Math.round(y)-2,rr('m.m|.l.|mmm|.m.')));}
  o.push(poly([[40,26],[47,33],[54,39],[46,44],[40,51],[34,44],[26,39],[34,33]],'m'),line(29,39,51,39,'s'),line(40,29,40,48,'s'));
 }
 if(kind==='pressure'){
  o.push(...stone(12,27,56,34,'m'),...stone(17,29,46,27,'s'),rect(23,33,34,19,'I','D'));
  for(const x of [20,57])for(const y of [31,51])o.push(rect(x,y,2,2,'L'));
  o.push(poly([[40,34],[51,43],[40,51],[29,43]],'O'),rect(38,41,4,4,'A'));
 }
 if(kind==='sarcophagus'){
  o.push(...stone(12,64,56,8,'s'),rect(16,30,48,35,'I','D'),rect(18,31,4,32,'m'),rect(58,31,4,32,'s'),line(24,62,56,62,'n'),poly([[16,31],[21,21],[59,21],[65,31],[60,42],[20,42]],'l','m'),poly([[23,30],[27,25],[53,25],[58,30],[54,37],[26,37]],'D','s'));
  o.push(grid(36,26,skull),poly([[35,36],[31,40],[40,44],[48,40],[44,35]],'s','l'),line(25,50,55,50,'O'),...candle(10,66),...candle(70,61));
 }
 if(kind==='bookcase'){
  o.push(rect(7,13,66,58,'I','W'),rect(10,15,60,54,'O','o'),rect(14,17,52,51,'n','n'));
  for(let row=0;row<3;row++){const y=20+row*16;for(let n=0;n<9;n++){const x=16+n*5,h=9+(n+row)%4;o.push(rect(x,y+12-h,4,h,['D','e','c','U','W'][(n+row)%5]),line(x+1,y+13-h,x+2,y+13-h,'O'),line(x,y+9,x+2,y+9,'O'));}o.push(rect(12,y+13,56,3,'W'),line(13,y+13,66,y+13,'A'));}
  o.push(...stone(5,69,70,4,'D'),line(9,16,9,67,'A'),line(70,16,70,67,'W'));
 }
 if(kind==='roots'){
  o.push(poly([[6,70],[18,61],[24,43],[21,24],[30,13],[27,4],[37,11],[43,27],[58,35],[66,58],[74,68],[60,72],[46,62],[34,71],[22,68]],'I','W'));
  for(const points of [[[12,69],[27,56],[33,28],[30,13]],[[33,68],[40,47],[37,23]],[[66,68],[54,49],[44,38]],[[22,67],[24,49],[18,41]]]){o.push(poly(points,'o'),poly(points.map(([x,y])=>[x+2,y]),'O'));}
  for(const [x,y]of [[18,29],[48,33],[55,58],[28,13]])o.push(poly([[x,y],[x-8,y-4],[x-13,y+1],[x-5,y+5]],'g','G'),line(x-10,y,x-2,y+1,'q'));
  for(const [x,y]of [[12,65],[63,65]])o.push(rect(x,y,3,6,'q'),ellipse(x-3,y-3,10,5,'c','r'),rect(x-1,y-2,2,1,'Z'));
 }
 if(kind==='machine'){
  o.push(...stone(8,65,64,7,'D'),rect(16,23,48,42,'n','s'),rect(19,26,42,36,'d','D'),rect(25,31,30,26,'O','W'));
  for(let x=28;x<54;x+=5)o.push(rect(x,34,2,19,'R'),line(x,40,x,49,'A'));
  o.push(rect(11,15,9,48,'I','m'),line(13,17,13,61,'L'),rect(60,13,9,51,'I','s'),rect(21,13,38,8,'I','m'),line(23,14,56,14,'L'),rect(30,4,21,10,'n','D'),...stone(26,1,29,4,'s'));
  for(const [x,y]of [[12,24],[63,23],[12,55],[63,54]])o.push(rect(x,y,3,3,'L'),rect(x+1,y+1,1,1,'I'));
 }
 if(kind==='broken-column'){
  o.push(...stone(11,64,58,8,'D'),...stone(17,59,46,6,'m'),poly([[23,58],[23,29],[29,32],[33,22],[39,30],[44,19],[53,27],[55,58]],'s','D'),rect(27,33,6,24,'m'),line(38,31,38,56,'s'),line(49,29,49,55,'n'),poly([[31,59],[29,52],[35,47]],'I'),...stone(5,56,12,9,'s'),...stone(61,49,13,11,'m'));
 }
 if(kind==='debris'){
  o.push(...stone(7,45,18,8,'D'),...stone(24,48,24,12,'m'),...stone(51,40,19,9,'s'),...stone(42,60,13,6,'D'),poly([[16,59],[10,62],[17,65],[25,62]],'s','D'),line(29,51,43,51,'l'),grid(56,56,rr('..ggg....|.gGqGg...|gGqGGgg..|.gg..ggg.')));
 }
 if(kind==='well'){
  o.push(ellipse(10,41,60,29,'I','D'),rect(12,42,56,15,'m','s'),ellipse(10,30,60,29,'m','D'),ellipse(18,34,44,19,'s','I'),ellipse(24,38,32,13,'u','u'));
  for(const x of [16,29,43,57])o.push(line(x,54,x,65,'n'));
  o.push(rect(15,12,5,34,'W','o'),rect(60,12,5,34,'W'),rect(12,10,56,5,'W','O'),line(39,15,39,35,'q'),rect(34,34,12,11,'n','W'),line(35,35,44,35,'O'));
 }
 if(kind==='obelisk'){
  o.push(...stone(15,65,50,7,'s'),...stone(21,59,38,7,'m'),poly([[27,58],[26,20],[40,3],[54,20],[53,58]],'I','s'),poly([[28,20],[40,7],[40,57],[29,57]],'m','D'),poly([[42,10],[51,22],[51,56],[42,57]],'s','n'));
  for(let n=0;n<4;n++)o.push(grid(32,25+n*7,rr('l.l|.L.|ll.|.l.')));o.push(line(40,8,40,56,'O'));
 }
 if(kind==='carpet'){
  o.push(rect(14,5,52,69,'b','b'),rect(17,7,46,65,'c'),rect(20,9,40,61,'W','c'),line(22,10,22,68,'o'),line(58,10,58,68,'o'));
  for(let y=13;y<67;y+=9)for(const x of [25,55])o.push(poly([[x,y],[x+2,y+2],[x,y+4],[x-2,y+2]],'O'));
  o.push(poly([[40,23],[48,37],[40,52],[32,37]],'O'),poly([[40,28],[44,37],[40,46],[36,37]],'o'),line(40,30,40,44,'a'));for(let x=17;x<65;x+=4)o.push(line(x,72,x,75,'o'));
 }
 if(kind==='grate'){
  o.push(...stone(5,13,70,54,'m'),rect(11,19,58,42,'I','I'));
  for(let x=15;x<68;x+=7)o.push(line(x,20,x,59,'s',3),line(x,21,x,59,'m'));
  for(const y of [27,47])o.push(line(12,y,68,y,'D',3),line(12,y,68,y,'l'));
  for(const x of [8,70])for(const y of [16,62])o.push(rect(x,y,2,2,'L'));
 }return tint(o,b);
}
function header(style,b){const o=[rect(0,0,360,120,'I'),...brickwall(8,13,344,82),rect(8,12,344,4,'m'),line(9,12,350,12,'L'),rect(8,94,344,7,'I'),rect(12,101,336,6,'s'),line(12,101,347,101,'m')];
 if(style==='cloister'){
  for(const x of [30,91,235,296])o.push(...niche(x,31));
  for(const x of [19,130,207,321])o.push(...column(x-8,61));
  for(const x of [73,271])o.push(...banner(x,26));
  for(const side of [-1,1])o.push(poly([[180+side*43,94],[180+side*43,49],[180+side*62,27],[180+side*82,18],[180+side*113,25],[180+side*133,50],[180+side*133,94]],'m'),poly([[180+side*46,94],[180+side*46,50],[180+side*65,30],[180+side*82,23]],'s'));
 }
 if(style==='crypt'){
  for(const x of [24,60,96,241,277,313]){
   o.push(rect(x,29,25,56,'I','I'),...stone(x-3,82,31,7,'m'),...stone(x-2,24,29,6,'s'));
   for(let y=34;y<79;y+=13)o.push(grid(x+8,y,skull),line(x+4,y+9,x+21,y+9,'s'));
  }
  for(const x of [17,122,229,334])o.push(...candle(x,94));
  o.push(line(15,20,132,20,'O'),line(228,20,345,20,'O'));
 }
 if(style==='broken'){
  for(const x of [25,98,237,314])o.push(poly([[x-9,95],[x-9,55],[x-3,34],[x-8,14],[x+4,21],[x+9,45],[x+8,95]],'s','D'),line(x-4,52,x-4,91,'m'));
  o.push(poly([[9,13],[43,13],[33,26],[47,37],[35,47],[44,61],[24,73],[32,92],[12,105]],'I','I'),poly([[351,13],[323,13],[336,33],[315,44],[330,59],[317,72],[338,90],[330,106],[352,108]],'I','I'));
  for(const side of [-1,1])o.push(poly([[180+side*73,17],[180+side*66,43],[180+side*85,60],[180+side*72,83],[180+side*79,108]],'W'),poly([[180+side*73,43],[180+side*98,49],[180+side*105,43],[180+side*93,40]],'g','G'));
  o.push(...stone(42,105,35,9,'m'),...stone(284,103,28,10,'s'));
 }
 if(style==='throne'){
  for(const x of [21,82,254,315])o.push(...column(x,56),...stone(x-4,20,37,8,'O'),line(x+1,17,x+23,17,'A'));
  for(const x of [58,283])o.push(...banner(x,34));
  for(const side of [-1,1])o.push(poly([[180+side*38,93],[180+side*38,42],[180+side*58,17],[180+side*84,7],[180+side*115,17],[180+side*136,42],[180+side*136,93]],'O'),poly([[180+side*42,91],[180+side*42,44],[180+side*61,22],[180+side*84,12]],'m'));
 }
 // Every architectural variant retains the same playable, aligned north threshold.
 o.push(rect(144,43,72,60,'I','I'),poly([[140,47],[146,31],[160,20],[180,12],[200,20],[214,31],[220,47]],'m','D'),poly([[149,46],[154,34],[167,25],[180,22],[193,25],[206,34],[211,46],[211,103],[149,103]],'n','n'));
 for(const x of [139,212])for(let y=45;y<105;y+=15)o.push(...stone(x,y,9,14,'s'));
 for(let x=155;x<208;x+=7)o.push(line(x,45,x,101,'m',2),line(x+1,45,x+1,101,'D'));
 o.push(rect(151,66,58,4,'s'),rect(151,87,58,4,'s'),rect(177,73,8,12,'W','O'),rect(180,76,2,5,'I'),...stone(132,105,96,6,'m'),...stone(127,112,106,5,'s'));
 for(const x of [17,334])o.push(...candle(x,111));return tint(o,b);
}
function eventProp(kind){const o=[];
 if(['altar','shrine','lectern','memory'].includes(kind))o.push(...stone(12,65,56,7,'D'),...stone(19,58,42,7,'m'));
 if(kind==='altar'){
  o.push(rect(24,33,32,26,'s','D'),...stone(15,26,50,8,'m'),poly([[20,28],[61,28],[55,37],[26,37]],'O','W'),ellipse(27,27,27,9,'b','r'),line(29,30,49,30,'R'),poly([[37,34],[36,48],[40,55],[42,68]],'r'),grid(27,42,skull),grid(47,42,skull),...candle(12,63),...candle(68,63));
 }
 if(kind==='coffer'){
  o.push(rect(12,45,56,24,'I','W'),poly([[12,45],[17,31],[23,26],[57,26],[64,32],[68,45]],'n','o'),line(23,27,56,27,'A'));
  for(const x of [20,56])o.push(rect(x,30,5,37,'s','m'),rect(x+1,32,2,32,'l'));
  for(let y=36;y<68;y+=7)o.push(line(15,y,63,y,'s'));o.push(rect(35,43,11,13,'O','o'),rect(39,47,3,6,'I'),poly([[17,49],[32,56],[48,55],[64,49]],'L'),...candle(7,69),...candle(73,69));
 }
 if(kind==='pilgrim'){
  o.push(poly([[23,47],[14,69],[33,72],[43,66],[53,70],[65,67],[54,45]],'I','D'),poly([[28,47],[24,65],[34,68],[40,62],[44,68],[57,66],[51,47]],'s','m'));
  o.push(rect(34,32,12,12,'W','o'),rect(37,33,7,8,'8','9'),grid(29,24,rr('.....WWWW.....|...WoOOOOoW...|..WoOAyyAOoW..|.WoOAyWWyAOoW.|WoOAyW88WyAOoW|WoOAyW89WyAOoW|WoOAyWwwWyAOoW|.WoOAywwyAOoW.|..WoOAAAOOoW..|...WoOOOoW....|....WWWWW.....')),rect(33,38,15,13,'W','o'),line(35,40,44,40,'A'),poly([[29,47],[22,55],[36,58],[40,54],[51,58],[57,53],[50,45]],'I','s'),rect(33,52,14,8,'W','o'),rect(37,51,7,6,'q','Q'),rect(18,62,9,7,'W','o'),line(20,63,24,63,'A'));
 }
 if(kind==='shrine'){
  o.push(rect(25,31,30,28,'s','D'),...stone(17,25,46,7,'m'),poly([[40,6],[52,17],[40,28],[28,17]],'O','W'),poly([[40,10],[47,17],[40,24],[33,17]],'A','O'),...candle(23,25),...candle(40,25),...candle(57,25),line(29,40,50,40,'O'),grid(35,44,rr('..OO..|.OAAO.|OAAyAO|.OAAO.|..OO..')));
 }
 if(kind==='lectern'){
  o.push(rect(35,36,10,22,'W','o'),line(36,38,36,55,'A'),poly([[18,28],[40,20],[63,28],[59,43],[40,36],[21,43]],'I','W'),poly([[21,28],[39,24],[39,35],[24,39]],'Q','P'),poly([[41,24],[60,28],[56,39],[41,35]],'Q','q'));
  for(let n=0;n<3;n++)o.push(line(25,29+n*3,35,27+n*3,'8'),line(44,27+n*3,55,30+n*3,'8'));o.push(line(40,25,40,37,'O'),poly([[23,35],[27,44],[38,46],[48,43],[56,34]],'L'),...candle(12,65),...candle(68,65));
 }
 if(kind==='hourglass'){
  o.push(...stone(18,65,44,7,'D'),rect(25,60,30,6,'O','o'),rect(23,17,34,5,'O','o'),rect(27,22,3,38,'O'),rect(51,22,3,38,'W'),poly([[31,22],[49,22],[47,32],[41,40],[47,47],[49,59],[31,59],[33,47],[39,40],[33,32]],'l','d'),poly([[33,25],[47,25],[43,34],[40,37],[36,32]],'q','A'),poly([[40,45],[46,55],[47,58],[33,58],[35,53]],'q','A'),line(40,38,40,48,'y'),line(32,23,34,32,'H'),...candle(14,70),...candle(66,70));
 }
 if(kind==='smith'){
  o.push(poly([[18,47],[15,68],[28,71],[35,62],[46,70],[60,68],[56,46]],'I','W'),rect(25,40,29,23,'n','o'),rect(29,41,4,20,'O'),rect(34,27,12,15,'s','D'),rect(37,29,7,9,'8','9'),grid(31,21,rr('...ssssss...|..sLmmmms...|.sLmmmmsDs..|.sLHHmmDDs..|.sL9I89IDs..|..s98889s...|..s9www9s...|...swwws....|....sss.....')),rect(28,32,23,13,'W','o'),poly([[28,41],[20,44],[20,52],[33,55],[35,50]],'s','m'),rect(47,45,14,7,'s','m'),rect(49,32,5,17,'W','O'),rect(45,29,15,7,'s','L'),poly([[15,57],[37,57],[35,62],[31,62],[31,69],[23,69],[23,62],[17,61]],'s','m'),line(15,57,36,57,'L'),rect(24,69,8,3,'W'));
 }
 if(kind==='mirror'){
  o.push(...stone(13,65,54,7,'s'),rect(28,53,24,12,'W','o'),poly([[18,53],[17,21],[23,9],[40,3],[57,9],[63,21],[62,53]],'O','W'),poly([[22,51],[21,22],[27,13],[40,8],[53,13],[59,22],[58,51]],'A','d'),poly([[25,49],[25,23],[31,17],[40,13],[50,18],[55,24],[55,49]],'s','n'),poly([[30,47],[31,32],[35,26],[43,25],[48,32],[51,47]],'m','D'),grid(34,19,rr('..sssss..|.smmmmms.|sLIIImms.|sLmmmmms.|.ssssss..')),line(27,29,45,14,'s'),line(31,48,53,26,'m'),poly([[40,14],[38,26],[44,34],[40,46]],'L'));
 }
 if(kind==='bell'){
  o.push(...stone(8,65,64,7,'D'),rect(14,11,6,54,'W','o'),rect(61,11,6,54,'W','o'),rect(10,9,60,7,'W','O'),line(13,10,66,10,'A'),line(40,16,40,24,'O',2),poly([[24,52],[27,43],[28,32],[33,25],[47,25],[52,32],[53,43],[57,52]],'W','O'),poly([[29,49],[32,33],[35,29],[43,29],[46,33],[50,49]],'a','o'),rect(22,51,37,6,'W','O'),line(25,52,55,52,'A'),ellipse(36,56,9,6,'W','a'),line(34,30,32,45,'A'),...candle(9,67),...candle(72,67));
 }
 if(kind==='memory'){
  o.push(poly([[18,60],[30,42],[27,27],[33,15],[39,4],[46,13],[50,30],[45,43],[60,61]],'g','G'),poly([[27,59],[37,42],[34,25],[39,12],[43,23],[43,39],[41,49],[50,61]],'q','g'),grid(32,22,rr('...qqqqqq...|..qQHHHHQq..|.qQHHHHHHQq.|qQHIIHHIIHQq|qQHHHHHHHHQq|.qQHHqqHHQq.|..qQHHHHQq..|...qqqqqq...')),line(37,39,36,48,'Q'),...candle(12,66),...candle(66,66));
 }return o;
}
function eventArt(e){const o=[rect(0,0,160,112,'I'),rect(4,4,152,104,'n'),...brickwall(6,6,148,55),...paving(6,61,148,45),rect(6,60,148,4,'m'),...niche(11,13),...niche(112,13)];
 if(e.id==='trap-vault')o.push(...offsetOps(kit('pit',BIOMES[0]),[-17,35]),...offsetOps(kit('pit',BIOMES[0]),[97,35]));
 if(e.id==='sealed-library')for(const x of [-8,89])o.push(...offsetOps(kit('bookcase',BIOMES[0]),[x,21]));
 if(e.id==='wandering-smith')for(const x of [-17,102])o.push(...offsetOps(kit('machine',BIOMES[3]),[x,28]));
 if(e.id==='memory-vow')for(const x of [-17,98])o.push(...offsetOps(kit('roots',BIOMES[2]),[x,30]));
 if(e.id==='shadow-duel')o.push(...offsetOps(kit('rune',BIOMES[7]),[40,35]));
 o.push(...offsetOps(eventProp(e.prop),[40,32]));
 for(const x of [8,151])o.push(...candle(x,99));o.push(rect(0,0,160,3,'I'),rect(0,109,160,3,'I'),line(5,108,154,108,'W'));return o;
}
function arenaSeal(b){const o=[ellipse(3,13,154,91,'I','D'),ellipse(5,12,150,86,'m','s'),ellipse(9,14,142,78,'l','D'),ellipse(14,17,132,70,'s','n'),ellipse(18,19,124,64,'O'),ellipse(26,23,108,55,'s'),ellipse(33,27,94,47,'D')];
 for(let n=0;n<24;n++){const a=n*Math.PI/12,pt=r=>[80+Math.cos(a)*r,51+Math.sin(a)*r*.51];o.push(line(...pt(66),...pt(72),'m'));if(n%2===0){const [x,y]=pt(58);o.push(grid(Math.round(x)-2,Math.round(y)-2,rr('l.l|.m.|lll|.l.')));}}
 for(let n=0;n<8;n++){const a=n*Math.PI/4-.4,pt=r=>[80+Math.cos(a)*r,51+Math.sin(a)*r*.51];o.push(line(...pt(25),...pt(44),'s'));}
 o.push(poly([[80,27],[90,39],[123,51],[91,61],[80,75],[69,61],[37,51],[69,40]],'O','D'),poly([[80,33],[86,43],[108,51],[86,57],[80,69],[74,57],[52,51],[74,44]],'m'),ellipse(70,44,20,13,'O','W'),line(79,45,79,54,'A'),line(74,49,84,49,'A'));
 for(const [x,y]of [[39,35],[119,35],[39,67],[119,67]])o.push(poly([[x,y],[x+4,y+1],[x+1,y+4],[x+5,y+6]],'I'));
 return tint(o,b);
}
async function saveClose(id){await call('sprite_manage',{sprite:id,op:'save'});await call('sprite_manage',{sprite:id,op:'close'});}
async function atlas(name,w,h,entries,render){if(process.argv.includes('--events')&&['layout-kit','room-headers'].includes(name))return;if(process.argv.includes('--resume')&&fs.existsSync(path.join(ROOT,'assets',name+'.json')))return;const id=await sprite(name,w,h,['authored-pixels']);if(entries.length>1)await call('frame',{sprite:id,op:'add',count:entries.length-1});let n=1;const tags=[];for(const entry of entries){await paint(id,'authored-pixels',n,render(entry),entry.label);tags.push([entry.label,n,n]);n++;}await finish(id,name,tags,entries.map(()=>100));await saveClose(id);}
await atlas('layout-kit',80,80,BIOMES.flatMap(b=>kinds.map(kind=>({b,kind,label:b.id+'-'+kind}))),e=>kit(e.kind,e.b));
await atlas('room-headers',360,120,BIOMES.flatMap(b=>styles.map(style=>({b,style,label:b.id+'-'+style}))),e=>header(e.style,e.b));
await atlas('arena-seals',160,112,BIOMES.map(b=>({b,label:b.id+'-seal'})),e=>arenaSeal(e.b));
await atlas('event-props',80,80,EVENTS.map(e=>({...e,label:e.id})),e=>eventProp(e.prop));
await atlas('event-art',160,112,EVENTS.map(e=>({...e,label:e.id})),eventArt);
const review=await sprite('level-art-review',720,600,['architecture','objects','events']);
for(let n=0;n<4;n++)await paint(review,'architecture',1,offsetOps(header(styles[n],BIOMES[n*2]),[(n%2)*360,Math.floor(n/2)*120]));
for(let n=0;n<kinds.length;n++)await paint(review,'objects',1,offsetOps(kit(kinds[n],BIOMES[n%10]),[(n%9)*80,244+Math.floor(n/9)*80]));
for(let n=0;n<4;n++)await paint(review,'events',1,offsetOps(eventArt(EVENTS[n*2]),[n*180+10,425]));
await call('sprite_manage',{sprite:review,op:'save_as',path:path.join(ROOT,'art','level-art-review.aseprite')});await call('export',{sprite:review,op:'png',path:path.join(ROOT,'previews','level-art-review.png'),frame:1});await preview(review,'level-art-review-live','preview',{scale:1});await saveClose(review);
fs.writeFileSync(path.join(ROOT,'previews','level-art-manifest.json'),JSON.stringify({kit:kinds,headers:styles,events:EVENTS.map(e=>e.id),kitFrames:160,headerFrames:40,eventProps:10,eventIllustrations:10,source:'MCP Aseprite, authored pixel primitives'},null,2));
console.log('Finished 12-layout architectural kit and ten illustrated event encounters.');
