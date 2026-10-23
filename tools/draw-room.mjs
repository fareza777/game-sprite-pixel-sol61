import {sprite,paint,finish,preview,call,grid,line,poly,rect,ellipse,P} from './art-lib.mjs';

const moss=[
 '....gGg.......','..ggGqGg..gg..','.gGqGgGgggGg..','ggGqGggGqGqGg.','gGgGgggGgGggg.','.gggg..gggg...','..g......g....'
];
const crack=(x,y)=>[poly([[x,y],[x+3,y+2],[x+1,y+5],[x+5,y+7],[x+5,y+10]],'n'),line(x+3,y+3,x+7,y+3,'n'),line(x+4,y+8,x+7,y+9,'T')];
const skull=['..qqqq..','.qHHQqs.','qQHHHQqs','qIIQQIIs','.qQHQqs.','..QHQq..','..qqqq..'];
const rune=[['.T.','TTT','.T.','T.T'],['T.T','TT.','T.T','.T.'],['TTT','T..','TT.','..T'],['.T.','T.T','TTT','T.T'],['T.T','.T.','.T.','T.T']];
function stone(x,y,w,h,face='D'){
 return [rect(x,y,w,h,'n'),rect(x+1,y+1,w-2,h-2,face),line(x+2,y+1,x+w-3,y+1,'s'),line(x+1,y+2,x+1,y+h-3,'s'),line(x+2,y+h-2,x+w-2,y+h-2,'d')];
}
function brickwall(x,y,w,h){
 const ops=[rect(x,y,w,h,'n')];
 for(let row=0;row<h;row+=9)for(let col=-(row%18?12:0);col<w;col+=24){
   const xx=Math.max(x,x+col),ww=Math.min(23,w-col)-Math.max(0,-col);
   if(ww>2)ops.push(...stone(xx,y+row,ww,8,['d','D','D','s'][(row/9+Math.floor((col+24)/24))%4]));
 }
 return ops;
}
function niche(x,y){
 const ops=[rect(x,y+8,36,43,'I'),poly([[x,y+10],[x+3,y+4],[x+10,y],[x+26,y],[x+33,y+4],[x+36,y+10]],'s'),line(x-2,y+10,x-2,y+48,'s',3),line(x+38,y+10,x+38,y+48,'D',3),rect(x-4,y+48,45,4,'l'),rect(x-3,y+52,43,4,'n')];
 // Deep, leaded lancet: jade panes and carved stone mullions.
 ops.push(poly([[x+7,y+12],[x+12,y+5],[x+24,y+5],[x+29,y+12],[x+29,y+43],[x+7,y+43]],'U','u'));
 for(let yy=14;yy<43;yy+=8)ops.push(line(x+8,y+yy,x+28,y+yy,'j'));
 ops.push(line(x+18,y+6,x+18,y+43,'D',2),line(x+8,y+22,x+28,y+22,'D'),line(x+9,y+12,x+15,y+7,'V'),line(x+21,y+8,x+26,y+13,'V'),line(x+8,y+15,x+8,y+21,'J'));
 return ops;
}
function banner(x,y,flip=false){
 return [line(x-3,y,x+19,y,'O',2),rect(x,y+2,16,30,'c'),rect(x+1,y+3,4,27,'r'),line(x+13,y+3,x+13,y+30,'b'),poly([[x,y+29],[x+3,y+36],[x+8,y+32],[x+13,y+36],[x+16,y+29]],'b','c'),grid(x+4,y+9,['...AA...','..AyAA..','.AAAAAA.','AA.AA.AA','...AA...','...AA...','..AAAA..']),line(x+1,y+3,x+13,y+3,'R')];
}
function column(x,y){
 const ops=[ellipse(x-2,y+39,31,10,'n','n'),rect(x-2,y+33,29,6,'n'),rect(x,y+32,26,5,'s'),line(x+1,y+32,x+24,y+32,'l'),rect(x+3,y+5,19,28,'d'),rect(x+4,y+6,5,26,'s'),rect(x+10,y+6,2,26,'D'),rect(x+14,y+6,2,26,'s'),rect(x+19,y+6,2,26,'n'),rect(x-1,y+1,27,5,'s'),rect(x-3,y-2,31,4,'l'),rect(x-2,y-1,29,2,'m'),line(x+3,y+10,x+8,y+10,'l'),line(x+3,y+20,x+7,y+20,'m')];
 return ops;
}
export async function drawRoom(){
 const id=await sprite('chapter-house',640,360,['foundation','flagstones','mosaic','walls','carvings','story-details']);
 await paint(id,'foundation',1,[rect(0,0,640,360,'I'),rect(26,20,588,316,'n'),rect(40,92,560,235,'f')]);
 const floor=[];
 for(let row=0,yy=96;yy<328;yy+=16,row++)for(let col=0,raw=40-(row%2)*16;raw<600;raw+=32,col++){
  const xx=Math.max(40,raw),ww=Math.min(600,raw+31)-xx;
  if(ww<3)continue;
  const variant=((row*17+col*11+row*col*3)>>>0)%19,edge=xx<115||xx>536||yy<124||yy>299;
  const face=edge?['f','F','f','F'][variant%4]:['F','t','F','F','t','F','t'][variant%7];
  floor.push(rect(xx,yy,ww,15,'f'),rect(xx+1,yy+1,ww-2,13,face),line(xx+2,yy+1,xx+ww-3,yy+1,edge?'t':'T'),line(xx+1,yy+2,xx+1,yy+12,'t'),line(xx+3,yy+13,xx+ww-2,yy+13,'d'));
  if(variant===3&&ww>25)floor.push(...crack(xx+9,yy+3));
  if(variant===5&&ww>17)floor.push(line(xx+5,yy+5,xx+9,yy+5,'T'),line(xx+7,yy+6,xx+11,yy+6,'t'));
  if(variant===8&&ww>25)floor.push(grid(xx+17,yy+2,['TTTT...','ttTTT..','.ttTT..','..tt...'],{T:P.T,t:P.t}));
  if(variant===11&&ww>14)floor.push(grid(xx+1,yy+1,['nnttt','nttt.','tt...'],{n:P.n,t:P.t}));
 }
 // Stone borders, water gutters, and an interrupted processional path.
 for(let xx=41;xx<597;xx+=16)floor.push(...stone(xx,101,15,7,'s'),...stone(xx,318,15,8,'D'));
 for(let yy=108;yy<319;yy+=16)floor.push(...stone(40,yy,8,15,'D'),...stone(591,yy,8,15,'d'));
 for(let yy=119;yy<314;yy+=16)floor.push(...stone(293,yy,26,14,'T'),...stone(321,yy,26,14,'t'));
 floor.push(rect(61,166,44,95,'n'),rect(65,170,36,87,'u'),rect(68,173,29,80,'U'));
 for(let yy=172;yy<257;yy+=9)floor.push(line(66,yy,100,yy,'v'),line(70+(yy%3)*3,yy+3,83+(yy%4),yy+3,'j'));
 for(let yy=163;yy<261;yy+=16)floor.push(...stone(57,yy,7,15,'s'),...stone(102,yy,7,15,'D'));
 floor.push(...stone(57,160,52,8,'s'),...stone(57,259,52,8,'D'));
 await paint(id,'flagstones',1,floor,'lay carved and weathered flagstones');
 const mosaic=[ellipse(241,158,158,106,'n','n'),ellipse(243,159,154,102,'s'),ellipse(247,162,146,96,'T'),ellipse(253,166,134,88,'O'),ellipse(255,167,130,86,'f','f'),ellipse(266,174,108,72,'T'),ellipse(269,176,102,68,'D','D')];
 const star=[[320,179],[331,195],[353,194],[343,209],[355,223],[333,223],[320,240],[309,224],[286,226],[297,209],[285,195],[308,196]];
 mosaic.push(poly(star,'s','t'),poly([[320,190],[325,204],[341,209],[326,214],[320,230],[314,214],[300,209],[314,203]],'O','W'),poly([[320,199],[326,209],[320,219],[314,209]],'A','O'),line(320,200,320,217,'a'),line(315,209,325,209,'a'));
 const runePositions=[[276,174],[300,168],[325,167],[350,171],[370,180],[383,194],[383,211],[372,229],[352,241],[326,248],[301,246],[277,236],[261,224],[253,206],[257,190]];
 runePositions.forEach(([x,y],i)=>mosaic.push(grid(x,y,rune[i%5],{T:P.O})));
 mosaic.push(...crack(248,182),...crack(379,219),line(253,187,265,195,'n'),line(378,231,386,238,'n'));
 await paint(id,'mosaic',1,mosaic,'inlay the oath seal and broken runes');
 const walls=[...brickwall(32,22,576,72),...brickwall(24,84,17,244),...brickwall(600,84,16,244)];
 walls.push(rect(27,15,586,8,'d'),rect(24,13,592,3,'s'),line(28,23,610,23,'m'),rect(34,87,574,5,'I'),rect(34,92,574,4,'s'),line(35,92,604,92,'l'),rect(25,327,590,6,'s'),rect(23,333,594,9,'D'),line(25,333,615,333,'m'),rect(27,342,586,9,'n'));
 for(let x=31;x<612;x+=24)walls.push(rect(x,17,20,3,'s'),line(x+2,17,x+17,17,'m'));
 // The north doorway is tall enough to accommodate a forty-pixel knight.
 walls.push(rect(284,41,72,57,'I'),poly([[284,43],[286,32],[293,24],[305,19],[335,19],[347,24],[354,32],[356,43]],'m'),poly([[291,43],[294,34],[302,28],[309,25],[331,25],[339,28],[346,34],[349,43]],'n'),rect(291,43,58,54,'n'));
 for(const [x,y,w,h] of [[280,43,8,16],[280,61,8,16],[280,79,8,17],[352,43,8,16],[352,61,8,16],[352,79,8,17]])walls.push(...stone(x,y,w,h,'s'));
 for(let x=294;x<349;x+=7)walls.push(rect(x,43,3,54,'D'),line(x,44,x,94,'m'));
 walls.push(rect(290,62,60,4,'s'),rect(290,82,60,3,'d'),rect(314,66,12,13,'W'),rect(317,69,6,7,'O'),rect(319,72,2,5,'I'));
 walls.push(...stone(278,97,84,5,'D'),...stone(272,103,96,5,'s'),...stone(266,110,108,6,'T'));
 await paint(id,'walls',1,walls,'build heavy masonry and the sealed north gate');
 const carvings=[];
 for(const x of [94,193,411,510])carvings.push(...niche(x,34));
 for(const x of [49,151,467,570])carvings.push(...column(x,58));
 carvings.push(...banner(161,28),...banner(463,28));
 // Carved lintel, chipped cornice, and relief panels with oathkeeper effigies.
 for(const x of [245,371]){
  carvings.push(rect(x,41,23,39,'n'),rect(x+2,43,19,35,'d'),grid(x+6,47,['...sss...','..slLms..','.slLLmsI.','..smmms..','...sss...','..smmms..','.slmmlms.','slLmmmmsI','sLmmmmmsI','.smmmmsI.','..smmms..','..smmms..','.smmmsms.','.smmmsms.','..ssssss.']),rect(x-1,79,26,4,'s'));
 }
 carvings.push(rect(304,14,32,10,'D'),grid(311,15,['...AA...AA...','..AyAAAAAyA..','.AAAAAAAAAAA.','..AAAAAAAAA..','....AAAAA....','.....AAA.....','......A......']));
 // Short hanging chain links, all drawn as closed pixel loops.
 for(const x of [77,560]) for(let y=27;y<63;y+=5)carvings.push(grid(x,y,['ss','s.','ss'],{s:P.m}));
 await paint(id,'carvings',1,carvings,'carve lancet windows, effigies and oath banners');
 const story=[];
 for(const [x,y] of [[46,107],[52,270],[109,254],[567,108],[578,284],[186,92],[412,92],[259,315],[369,315]])story.push(grid(x,y,moss));
 // Ivy follows masonry joints and then falls into hand-drawn leaf clusters.
 const vines=[[[48,24],[50,39],[46,50],[52,65],[49,83],[54,98]],[[590,21],[586,40],[591,55],[584,76],[588,98]],[[211,22],[215,37],[209,49],[212,64]],[[443,24],[440,36],[444,52],[438,64]]];
 for(const points of vines){story.push(poly(points,'g'));points.forEach(([x,y],i)=>story.push(grid(x-3,y,['..gGg.','.gGqGg','gGggg.','.gg...'],{g:P.g,G:P.G,q:P.q})));}
 // Piles of bones and individual flakes make the corners inhabited, with quiet central combat space.
 for(const [x,y] of [[117,299],[549,302],[70,130],[559,118]])story.push(grid(x,y,skull),line(x+9,y+6,x+19,y+9,'q'),line(x+10,y+5,x+10,y+7,'Q'),line(x+18,y+8,x+18,y+10,'Q'));
 for(const [x,y] of [[190,303],[425,126],[227,142],[515,288],[132,203],[423,298],[128,155],[174,259],[499,260]])story.push(...stone(x,y,7,4,'s'),rect(x+10,y+4,4,2,'D'));
 // Broken paving and iron drainage grilles are composed from drawn clusters, rather than noise.
 for(const [x,y] of [[207,279],[398,139]])story.push(grid(x,y,['....nnnnn.............','..nnnDDDDnnn..........','.nDDTTTTTDDnn.........','nDTTTTTTTTTDDn...ss...','nDTTTTTTTTTDDn..smmI..','.nDDTTTTTTDDn...smmI..','..nnDDTTDDnn.....II...','....nnnnnn............']));
 for(const [x,y] of [[73,137],[552,307]]){
  story.push(rect(x,y,24,9,'n'),rect(x+1,y+1,22,7,'I'));
  for(let j=0;j<7;j++)story.push(line(x+3+j*3,y+1,x+3+j*3,y+7,'s'));
  story.push(line(x+1,y+1,x+21,y+1,'m'));
 }
 // Overgrown south edge and missing masonry: retain a strong, dark foreground frame.
 for(let i=0;i<13;i++){
  const x=30+i*47;story.push(rect(x,341+(i%3)*2,19+(i%4)*3,10,'I'),grid(x+2,333,moss));
 }
 story.push(poly([[28,349],[57,346],[81,351],[134,347],[171,352],[218,348],[240,354],[305,350],[361,352],[392,348],[451,353],[489,349],[530,354],[573,349],[612,352]],'I', 'I'));
 await paint(id,'story-details',1,story,'place ivy, bones, water, chipped corners and loose masonry');
 await finish(id,'chapter-house',[],[],{sheet:false}); await preview(id,'chapter-house','preview',{scale:2});
}

export async function drawProps(){
 const id=await sprite('reliquary-props',64,80,['base','detail']);const tags=[],dur=[];
 const states=['pillar','coffin','books','urn','brazier','chest-closed','chest-open','shrine'];
 await call('frame',{sprite:id,op:'add',count:states.length-1});
 for(let i=0;i<states.length;i++){
  const state=states[i],f=i+1;const ops=[];
  if(state==='pillar'){
    ops.push(ellipse(11,63,44,12,'n','n'),...stone(14,62,36,8,'D'),...stone(17,58,30,6,'s'),rect(21,22,22,37,'n'),rect(22,23,20,35,'D'),rect(23,24,5,33,'m'),rect(29,24,3,33,'s'),rect(34,24,2,33,'m'),rect(39,24,2,33,'d'),...stone(17,18,30,6,'s'),...stone(13,13,38,6,'s'),...stone(15,11,34,4,'m'),line(23,27,27,27,'l'),line(23,40,27,40,'l'),line(23,52,27,52,'s'),...crack(34,44),grid(14,64,moss));
  }else if(state==='coffin'){
    ops.push(ellipse(5,61,56,13,'n','n'),...stone(5,44,54,24,'d'),...stone(4,39,56,15,'s'),...stone(7,35,50,15,'m'),rect(11,38,42,9,'D'),grid(14,38,['....sssss.....................','...slLmmss....sssss...........','..sLmmmmmmssssslLLLmmmsssss...','...smmmmss...smmmmmmmmmmmmms..','....ssss......sssssssssssss...']),line(9,36,52,36,'l'),grid(40,50,moss),...crack(16,53));
  }else if(state==='books'){
    ops.push(ellipse(6,64,52,10,'n','n'),rect(9,21,47,48,'n'),rect(11,23,43,44,'W'),rect(13,25,39,17,'I'),rect(13,46,39,17,'I'));
    for(let row=0;row<2;row++)for(let j=0;j<9;j++){
      const x=14+j*4,y=27+row*21+(j%3),h=13-j%3,c=['c','U','O','e','D','r','W','U','O'][j];
      ops.push(rect(x,y,3,h,c),line(x,y+2,x+2,y+2,'a'),line(x,y+h-3,x+2,y+h-3,'o'));
    }
    ops.push(rect(8,20,49,3,'o'),line(10,20,55,20,'O'),rect(8,43,49,3,'o'),rect(8,66,49,4,'o'),rect(10,23,3,43,'o'),rect(52,23,3,43,'W'));
  }else if(state==='urn'){
    ops.push(ellipse(16,64,34,9,'n','n'),grid(23,56,['...OOOOOO...','..OAAAAAOo..','...OAAAOo...','...OOOOOo...','..OAyyyyAo..','.OAyyAAAAOo.','OAyyyAAAAAOo','OAyAAAOOAAOo','OAAAAOOOOAOo','OAOOOOAAAAOo','.OAAAAAAAOo.','..OAAAAAOo..','...OOOOOo...','....oooo....']),grid(12,64,moss));
  }else if(state==='brazier'){
    ops.push(ellipse(17,63,32,10,'n','n'),...stone(19,63,26,6,'D'),rect(26,49,12,15,'n'),rect(27,49,4,14,'m'),rect(33,49,4,14,'s'),poly([[19,41],[45,41],[42,49],[22,49]],'s','D'),line(20,41,44,41,'l'),line(23,45,41,45,'m'));
  }else if(state==='chest-closed'||state==='chest-open'){
    ops.push(ellipse(13,63,39,10,'n','n'),rect(15,52,35,16,'I'),rect(16,53,33,13,'W'),rect(17,54,31,2,'o'));
    for(let x=19;x<49;x+=7)ops.push(line(x,55,x,64,'o'));
    ops.push(rect(18,52,3,15,'O'),rect(44,52,3,15,'O'),rect(18,53,2,2,'A'),rect(44,53,2,2,'A'),rect(29,55,8,7,'O'),rect(32,57,2,3,'I'));
    if(state==='chest-closed')ops.push(poly([[15,52],[17,45],[21,42],[43,42],[48,45],[50,52]],'I','o'),line(21,43,43,43,'O'),rect(19,44,3,9,'O'),rect(43,44,3,9,'O'),line(16,52,49,52,'A'));
    else ops.push(rect(16,39,33,14,'I'),rect(18,41,29,10,'o'),rect(21,43,23,7,'W'),rect(18,39,3,13,'O'),rect(44,39,3,13,'O'),line(18,40,46,40,'A'),rect(18,52,29,3,'A'),grid(23,49,['.AA..AA..AA.','AyAAAAyAAAAA','.AAAAAAAyAA.']));
  }else if(state==='shrine'){
    ops.push(ellipse(12,62,42,12,'n','n'),...stone(14,63,36,6,'s'),...stone(18,57,28,7,'m'),rect(25,44,14,14,'D'),rect(26,45,5,11,'l'),...stone(20,39,24,6,'s'),poly([[32,13],[42,26],[32,40],[22,26]],'j','J'),poly([[32,16],[37,26],[32,36],[27,26]],'k','J'),line(32,16,32,35,'K'),line(26,25,31,17,'k'),grid(16,62,moss));
  }
  await paint(id,'base',f,ops,`draw ${state} as individual pixel architecture`);tags.push([state,f,f]);dur.push(100);
 }
 await finish(id,'reliquary-props',tags,dur);await preview(id,'props-contact','filmstrip',{scale:2});
}

export async function drawFlames(){
 const id=await sprite('fire',24,32,['flame']);await call('frame',{sprite:id,op:'add',count:5});
 const keys=[
 ['..........A....','.........AyA...','.........AyA...','....A...AyyA...','...AyA..AyA....','...AyAAAyyAA...','..AyyyyyyyAA...','..AyyYyyyyyA...','.AyyYYYyyyyAA..','.AyyYYYYYyyyA..','AyyYYYYYYyyyAA.','AyyYYYYYYYyyAA.','.AyyYYYYYyyAA..','..AAyyyyyAAA...','....AAAAAA.....'],
 ['.....A.........','....AyA........','....AyAA.......','....AyyA..A....','...AyyyA.AyA...','..AyyyyAAyyA...','..AyyyyyyyyAA..','.AyyyyyyyyyyA..','.AyyYYYYYyyyAA.','AyyYYYYYYYyyAA.','AyyYYYYYYYyyAA.','.AyyYYYYYyyAA..','..AAyyyyyyAA...','....AAAAAAA....'],
 ['........A......','.......AyA.....','......AyyA.....','......AyyA.....','...A..AyyA.....','..AyAAyyyAA....','..AyyyyyyyAA...','.AyyyyyyyyyAA..','.AyyYYYYyyyyA..','AyyYYYYYYyyyAA.','AyyYYYYYYYyyAA.','.AyyYYYYYyyAA..','..AAyyyyyyAA...','....AAAAAAA....'],
 ['..........A....','.........AyA...','.........AyA...','........AyyA...','....A..AyyyA...','...AyAAyyyyAA..','..AyyyyyyyyyA..','..AyyYYYYyyyAA.','.AyyYYYYYYyyAA.','AyyYYYYYYYyyAA.','AyyYYYYYYYyyAA.','.AyyYYYYYyyAA..','..AAyyyyyyAA...','....AAAAAAA....'],
 ['.......A.......','......AyA......','.....AyyA......','.....AyyA......','....AyyyA......','...AyyyyAA.....','..AyyyyyyyAA...','.AyyyyyyyyyAA..','.AyyYYYYyyyyA..','AyyYYYYYYyyyAA.','AyyYYYYYYYyyAA.','.AyyYYYYYyyAA..','..AAyyyyyyAA...','....AAAAAAA....'],
 ['.....A.........','....AyA........','....AyAA.......','....AyyA.......','...AyyyA..A....','..AyyyyAAAyA...','..AyyyyyyyyAA..','.AyyyyyyyyyyA..','.AyyYYYYYyyyAA.','AyyYYYYYYYyyAA.','AyyYYYYYYYyyAA.','.AyyYYYYYyyAA..','..AAyyyyyyAA...','....AAAAAAA....']
 ];
 for(let i=0;i<6;i++)await paint(id,'flame',i+1,[grid(4,11,keys[i])],`hand-drawn flame tongue ${i+1}`);
 await finish(id,'fire',[['burn',1,6]],[100,90,110,80,100,120]);await preview(id,'fire-keys','filmstrip',{scale:4});
}
if(process.argv[1]?.endsWith('draw-room.mjs')){
 await drawRoom();await drawProps();await drawFlames();
}
