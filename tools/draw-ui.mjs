import path from 'node:path';
import {sprite,paint,finish,call,preview,ROOT,grid,rect,line,poly} from './art-lib.mjs';
import {heroPose,blade,offsetOps} from './actor-design-v2.mjs';
import {materialPass} from './draw-actors-v2.mjs';
const arrow={
 up:['......AA......','.....AyAA.....','....AyyyAA....','...AyyyyyAA...','..AyyyAyyyAA..','.AAAAAyAAAAAA.','....AAyAA.....','....AAyAA.....','....AAyAA.....','....AAAAA.....'],
 down:['....AAAAA.....','....AAyAA.....','....AAyAA.....','....AAyAA.....','.AAAAAyAAAAAA.','..AyyyAyyyAA..','...AyyyyyAA...','....AyyyAA....','.....AyAA.....','......AA......'],
 left:['.....A.......','....AyA......','...AyyA......','..AyyyAAAAAA.','.AyyyyyyyyyAA','..AyyyAAAAAA.','...AyyA......','....AyA......','.....A.......'],
 right:['.......A.....','......AyA....','......AyyA...','.AAAAAAyyyA..','AAyyyyyyyyyA.','.AAAAAAyyyA..','......AyyA...','......AyA....','.......A.....']
};
const heart=['....cc....cc....','..ccRRcc crRRcc.','.crRERRRcrRERRrc','crRERRRRRRRRRrrc','crRRRRRRRRRRrrrc','crRRRRRRRRRrrrrc','.crRRRRRRRrrrrc.','..crRRRRRrrrrc..','...crRRRrrrrc...','....crRrrrrc....','.....crrrrc.....','......crrc......','.......cc.......'].map(x=>x.replaceAll(' ','.'));
const boot=['....ssssss....','...slLLLmss...','...sLLLmmss...','...smmmmmss...','...oOOOOoWW...','...oOOoooWW...','...oOOooWWWW..','..oOOOoooWWWW.','.oOOOOooooWWWW','oOOOOOooooWWWI','WWWWWWWWWWWWWI','IIIIIIIIIIIIII'];
const flask=['.....OOOOO.....','....OAyyyAO....','....OOOOOOO....','.....jkkj......','.....jkkj......','....jJkkJj.....','...jJkkkkJj....','..jJkkKKkkJj...','.jJkkKKKkkJJj..','jJkkKKKkkkkJJj.','jJkkkkkkkkkJJjI','jJkkkkkkkkkJJjI','.jJkkkkkkkJJjI.','..jjJJJJJJjjI..','....jjjjjjI....'];
const icons={
 attack:materialPass('knight','equipment',blade([8,25],[25,6])),
 block:(()=>{const p=heroPose('s','idle',0),g=p.equipment.find(o=>o.kind==='grid'&&o.rows.length===22);return materialPass('knight','equipment',[{...g,x:8,y:4}]);})(),
 roll:[poly([[9,23],[5,17],[6,9],[12,4],[22,5],[27,12],[26,20],[20,26]],'j'),line(9,23,5,17,'J',3),line(5,17,6,9,'J',3),line(6,9,12,4,'k',3),line(12,4,22,5,'k',3),line(22,5,27,12,'J',3),line(27,12,26,20,'J',3),line(26,20,20,26,'J',3),poly([[15,23],[21,30],[24,20]],'j','k'),grid(12,11,['..sssss..','.slLLmss.','slLmmmssI','sLmmmssI.','.ssssssI.'])],
 interact:[grid(6,5,['.......sss........','......slLms.......','......slLms.......','..sss.slLms.sss...','.slLmslLLmsslLms..','.slLmslLLmsslLms..','.slLLLlLLmLslLms..','.sLLLlllLmLslLms..','.sLLLLLLLmLslLms..','..sLLLLLmmmLmmms..','..slLLLLmmmmmmms..','...slLLLmmmmmms...','...slLLLmmmmmss...','....slLLmmmmssI...','.....smmmmmssI....','......ssssssI.....','......OAAAAO......','......OAAAOI......'])],
 pause:[rect(8,7,6,19,'O'),rect(9,8,3,16,'y'),rect(19,7,6,19,'O'),rect(20,8,3,16,'y')],
 heart:[grid(8,9,heart)],boot:[grid(9,9,boot)],flask:[grid(9,7,flask)],
 star:[poly([[16,3],[20,12],[29,16],[20,20],[16,29],[12,20],[3,16],[12,12]],'O','A'),poly([[16,7],[18,14],[24,16],[18,18],[16,25],[14,18],[8,16],[14,14]],'y','y')],
 sound:[poly([[5,12],[10,12],[17,6],[17,26],[10,20],[5,20]],'O','A'),line(22,10,25,13,'y',2),line(25,13,25,19,'y',2),line(25,19,22,22,'y',2)],
 ...Object.fromEntries(Object.entries(arrow).map(([n,r])=>[n,[grid(9,n==='up'||n==='down'?10:11,r)]]))
};
const names=Object.keys(icons),id=await sprite('ui-controls',32,32,['icons']);await call('frame',{sprite:id,op:'add',count:names.length-1});
for(let i=0;i<names.length;i++)await paint(id,'icons',i+1,icons[names[i]],`Hand-drawn ${names[i]} control icon`);
await finish(id,'ui-controls',names.map((n,i)=>[n,i+1,i+1]),names.map(()=>100));
for(let i=0;i<names.length;i++)await call('export',{sprite:id,op:'png',path:path.join(ROOT,'assets','ui-'+names[i]+'.png'),frame:i+1});
await preview(id,'ui-controls','filmstrip',{scale:4});
const p=heroPose('s','idle',0),head=p.body.find(o=>o.kind==='grid'&&o.x===43&&o.y===20),plume=p.plume[0];
function enlarged(g,x,y){return {...g,x,y,rows:g.rows.flatMap(r=>{const rr=[...r].map(c=>c+c).join('');return[rr,rr];})};}
const launcher=await sprite('launcher',64,64,['base','plume','portrait']);
await paint(launcher,'base',1,[rect(0,0,64,64,'I'),poly([[1,10],[10,1],[53,1],[62,10],[62,53],[53,62],[10,62],[1,53]],'O','n'),poly([[4,12],[12,4],[51,4],[59,12],[59,51],[51,59],[12,59],[4,51]],'A'),line(11,58,51,58,'W'),poly([[12,53],[22,43],[45,43],[54,53]],'D','D')]);
await paint(launcher,'plume',1,[enlarged(plume,16,3),grid(23,19,['.cc.','cRRc','cRrc','cccc'])]);
await paint(launcher,'portrait',1,materialPass('knight','body',[enlarged(head,18,23),grid(23,53,['ssssssssssss','slLHHHLLmmss','slLLLLLmmmss','.ssssssssssI'])]));
await finish(launcher,'launcher',[],[],{sheet:false});
await call('export',{sprite:launcher,op:'png',path:path.join(ROOT,'assets','app-icon.png'),frame:1});
await call('export',{sprite:launcher,op:'png',path:path.join(ROOT,'assets','app-icon-192.png'),frame:1,scale:3});
await preview(launcher,'launcher','preview',{scale:8});
const fg=await sprite('launcher-foreground',108,108,['plume','portrait']);
await paint(fg,'plume',1,[enlarged(plume,38,25),grid(45,41,['.cc.','cRRc','cRrc','cccc'])]);
await paint(fg,'portrait',1,materialPass('knight','body',[enlarged(head,40,45),grid(45,75,['ssssssssssss','slLHHHLLmmss','slLLLLLmmmss','.ssssssssssI']),poly([[53,82],[57,87],[53,92],[49,87]],'O','A')]));
await finish(fg,'launcher-foreground',[],[],{sheet:false});
await call('export',{sprite:fg,op:'png',path:path.join(ROOT,'assets','app-icon-foreground.png'),frame:1,scale:4});
console.log('Created',names.length,'control icons and launcher artwork through Aseprite MCP.');
