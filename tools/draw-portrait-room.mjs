import {sprite,paint,finish,preview,call,data,grid,line,poly,rect,ellipse,P} from './art-lib.mjs';
import {stone,brickwall,niche,banner,column} from './draw-room.mjs';

const ready=data(await call('preflight'));if(!ready.ready)throw new Error(ready.directive);
const id=await sprite('portrait-chapterhouse',360,640,['foundation','flagstones','north-wall','carvings','south-wall','story']);
await paint(id,'foundation',1,[rect(0,0,360,640,'I'),rect(8,14,344,615,'n'),rect(16,94,328,514,'f')],'block a complete narrow chapel with clear floor');
await preview(id,'portrait-room-blockout','preview',{scale:1});
const floor=[];
for(let row=0,y=96;y<608;y+=16,row++)for(let raw=16-(row%2)*16,col=0;raw<344;raw+=32,col++){
 const x=Math.max(16,raw),w=Math.min(344,raw+31)-x;if(w<3)continue;
 const v=(row*17+col*11+row*col*3)%23,edge=x<60||x>292;
 const tone=edge?(v%3?'F':'f'):(v%4?'t':'F');
 floor.push(rect(x,y,w,15,'f'),rect(x+1,y+1,w-2,13,tone),line(x+2,y+1,x+w-3,y+1,edge?'t':'T'),line(x+2,y+13,x+w-2,y+13,'d'));
 if(v===3&&w>22)floor.push(poly([[x+11,y+3],[x+14,y+5],[x+12,y+8],[x+17,y+10]],'n'),line(x+14,y+6,x+19,y+6,'n'));
 if(v===9)floor.push(line(x+4,y+4,x+9,y+4,'T'),line(x+5,y+5,x+7,y+5,'t'));
}
for(let y=112;y<608;y+=16){floor.push(...stone(9,y,8,15,'D'),...stone(343,y,8,15,'d'));}
// A quiet processional aisle leads into the tall gate.
for(let y=112;y<608;y+=16){floor.push(...stone(164,y,15,15,'T'),...stone(181,y,15,15,'t'));}
await paint(id,'flagstones',1,floor,'weather the individual stones and processional aisle');
const north=[...brickwall(8,18,344,75),rect(8,13,344,5,'s'),line(11,13,348,13,'l'),rect(10,88,340,7,'I'),rect(12,94,336,4,'s'),line(14,94,345,94,'m')];
north.push(poly([[145,43],[148,32],[157,23],[169,18],[191,18],[203,23],[212,32],[215,43]],'m','D'),poly([[153,43],[156,34],[164,28],[173,25],[187,25],[196,28],[204,35],[207,43]],'n','n'),rect(153,43,54,54,'n'));
for(const x of [141,211])for(let y=44;y<97;y+=18)north.push(...stone(x,y,9,16,'s'));
for(let x=156;x<206;x+=7)north.push(rect(x,43,3,53,'D'),line(x,44,x,94,'m'));
north.push(rect(152,62,56,4,'s'),rect(152,82,56,3,'d'),rect(175,66,10,13,'W'),rect(177,69,6,7,'O'),rect(179,72,2,5,'I'),...stone(139,98,82,5,'D'),...stone(134,104,92,5,'s'),...stone(129,111,102,5,'T'));
await paint(id,'north-wall',1,north,'build the vaulted north gate with weight and depth');
const carvings=[...niche(53,32),...niche(271,32),...banner(110,30),...banner(235,28),...column(15,58),...column(320,58)];
carvings.push(line(86,36,86,37,'s'),line(304,36,304,37,'s'));
carvings.push(rect(167,11,26,10,'D'),grid(174,12,['..AA..AA..','.AAAAAAAA.','..AAAAAA..','...AAAA...','....AA....']));
for(const x of [42,316])for(let y=27;y<59;y+=5)carvings.push(grid(x,y,['ss','s.','ss'],{s:P.m}));
await paint(id,'carvings',1,carvings,'carve jade lancets and hang worn crimson oath banners');
const south=[rect(8,609,344,8,'s'),line(9,609,349,609,'m'),rect(6,617,348,13,'D'),rect(0,630,360,10,'I')];
for(let x=9;x<350;x+=24)south.push(...stone(x,612,22,10,'D'),rect(x+2,625,18,6,'n'));
await paint(id,'south-wall',1,south,'anchor the foreground with chipped masonry');
const moss=['...gGg......','..gGqGgg....','.gGggGqGgg..','ggGgGggGgGg.','.ggg..ggg...'];
const story=[];
for(const [x,y]of [[13,100],[332,105],[10,195],[337,275],[14,377],[330,467],[15,600],[331,599],[74,615],[279,614]])story.push(grid(x,y,moss));
for(const side of [0,1]){
 const x=side?340:18;story.push(poly([[x,18],[x-3,33],[x+1,48],[x-4,65],[x-1,87]],'g'));
 for(let i=0;i<4;i++)story.push(grid(x-3+(i%2)*2,28+i*16,['..gGg.','.gGqGg','gGggg.','.gg...']));
}
for(const [x,y]of [[26,181],[318,191],[25,526],[314,552]]){
 story.push(grid(x,y,['..qqqq..','.qHHQqs.','qQHHHQqs','qIIQQIIs','.qQHQqs.','..QHQq..','..qqqq..']),line(x+10,y+7,x+20,y+10,'q'),line(x+10,y+6,x+10,y+8,'Q'));
}
for(const [x,y]of [[63,122],[279,130],[62,502],[279,512]]){story.push(rect(x,y,20,8,'n'));for(let j=0;j<6;j++)story.push(line(x+2+j*3,y+1,x+2+j*3,y+6,'s'));}
await paint(id,'story',1,story,'place ivy, bones and drainage along the room edges');
await preview(id,'portrait-chapterhouse','preview',{scale:1});
const check=data(await call('validate',{sprite:id,checks:['palette','layers','export_readiness','antialiasing']}));
if(check.findings.some(x=>x.severity==='error'))throw new Error(JSON.stringify(check));
await finish(id,'portrait-chapterhouse',[],[],{sheet:false});
console.log('Portrait architecture ready: 360 × 640, height-adaptive floor bands.');
