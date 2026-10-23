import {P,grid,rect,line,poly,ellipse} from './art-lib.mjs';
import {heroPose,hollowPose,wardenPose,wispPose,offsetOps,blade,gauntlet,HERO_TIMES,ENEMY_TIMES} from './actor-design-v2.mjs';
import {ogrePose} from './ogre-design.mjs';
import {materialPass} from './draw-actors-v2.mjs';
import {BIOMES} from '../game/content.mjs';
export {HERO_TIMES,ENEMY_TIMES};
for(const b of BIOMES)b.palette.forEach((c,i)=>P[`biome${b.index}-${i}`]=c);
export const allLayers=['cloak','plume','body','arms','equipment','effects'];
export function recolorOps(ops,map){return ops.map(op=>{const o=structuredClone(op);for(const k of ['color','fill'])if(map[o[k]])o[k]=map[o[k]];if(o.legend)for(const k of Object.keys(o.legend))if(map[o.legend[k]])o.legend[k]=map[o.legend[k]];return o;});}
const frontHood=['.......nnnn.......','.....ndDDDDdn.....','....ndDssssDdn....','...ndDslLLmsDdn...','..ndDslLHHmsDDdn..','.ndDslLLLLmssDDdn.','ndDslLnnnnnmssDDdn','nDsLnnnnnnnnmsDDdn','nDsnIIRnnRIInmsDDn','nDsnIIIIIIIInmsDDn','nDsnIImmmIIInmsDDn','.nDsnImLmIInmsDDn.','..nDsnImIInmssDdn.','...nDssnnmssDDdn..','....nDDssssDDdn...','.....nnDDDDnn.....'];
const backHood=['.......nnnn.......','.....ndDDDDdn.....','....ndDssssDdn....','...ndDslLLmsDdn...','..ndDslLHHmsDDdn..','.ndDslLLLLmssDDdn.','ndDslLLLmmmmmDDdn.','nDsLLLLmmmmmmDDdn.','nDsLLLmmmmmmmDDdn.','nDsLLmmmmmmmmDDdn.','nDsLmmmmmmmmmDDdn.','.nDssmmmmmmmmDDn..','..nDssmmmmmmDDdn..','...nDsssssssDDdn..','....nDDssssDDdn...','.....nnDDDDnn.....'];
function hood(d,seer=false){let rows=(d==='n'?backHood:frontHood).map(x=>x.replaceAll('R',seer?'J':'A'));if(d==='e')rows=rows.map((r,y)=>y===8?r.replace('IIRnnRII','IIIIInRI'):r);if(d==='w')rows=rows.map((r,y)=>y===8?r.replace('IIRnnRII','IRnIIIII'):r);return rows;}
const TUNIC=['.....nnnnnnnnn.....','...ndDDssssssDdn...','..ndDslLLmmmssDDn..','.ndDslLLLmmmssDDdn.','ndDslLLmmmmmmmDDdn.','nDslLLmmmmmmmmDDdn.','nDsLLmmWOOOWmmDDdn.','nDsLmmmWOAOWmmDDdn.','.nDmmmmWOOOWmmDDn..','..nDmmmmmmmmmmDDn..','..nDmmmmmmmmmmDDn..','...nDmmmmmmmmDDn...','...nDmmmmmmmmDDn...','...nDmmmmmmmmDDn...','..nDDmWOOOOOWmDDn..','..nDDmWOyyOWmDDdn..','.nDDmmWWOOWWmmDDdn.','nDDmmmmmmDmmmmmDDdn','nDDmmmmmmDmmmmmDDdn','.nDDmmmmDDmmmmmDDn.','..nDDmmDDDDmmmDDn..','...nnDDn..nDDnn....'];
function robe(d){const r=['......eeeeee......','....eppppppeee....','...epzzppppeeee...','..epzzppppppeeee..','.epzzppppppppeeeI.','epzzppppppppppeeI.','epzzppppppppppeeI.','.epzpppOOOppppeeI.','..eppppOAOpppeeI..','..eppppOOOpppeeI..','..eppppppppppeeI..','..eppppppppppeeI..','..eppppppppppeeI..','.eppppppppppppeeI.','.eppppppppppppeeI.','eppppppppppppppeeI','epppppepppeppppeeI','eppppeppppeppppeeI','eppppeppppeppppeeI','.epppeepppeepppeeI','.epppeepppeepppeeI','..eeee.eeee.eeeeI.'];return d==='n'?r.map(x=>x.replaceAll('O','p').replaceAll('A','p')):r;}
export function weaponOps(kind,hand,tip,{boss=false,accent='A'}={}){
 const [hx,hy]=hand,dx=tip[0]-hx,dy=tip[1]-hy,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,px=-uy,py=ux;
 const maxX=boss?142:94,maxY=boss?110:94,margin=kind==='axe'||kind==='sickle'?12:kind==='trident'?9:5;
 const reach=Math.min(ux>0?(maxX-margin-hx)/ux:ux<0?(1+margin-hx)/ux:Infinity,uy>0?(maxY-margin-hy)/uy:uy<0?(1+margin-hy)/uy:Infinity);
 const extra=['spear','trident'].includes(kind)?8:['staff','orb'].includes(kind)?6:['axe','sickle'].includes(kind)?9:kind==='bell'?7:4;
 const length=Math.max(9,Math.min(kind==='daggers'?17:kind==='spear'?Math.min(36,len+3):len,reach-extra));
 const pt=(a,b=0)=>[Math.round(hx+ux*a+px*b),Math.round(hy+uy*a+py*b)];
 if(kind==='sword'||kind==='daggers')return blade(hand,pt(length));
 const shaft=[line(...pt(-5),...pt(length),'I',4),line(...pt(-4),...pt(length),'W',2),line(...pt(-3,-1),...pt(length-1,-1),'O')];
 if(kind==='staff'||kind==='orb')return [...shaft,poly([pt(length+5),pt(length,5),pt(length-6),pt(length,-5)],'j','J'),poly([pt(length+3),pt(length,2),pt(length-3),pt(length,-2)],'K','k'),line(...pt(length-6,-5),...pt(length-7,5),'O')];
 if(kind==='spear'||kind==='trident'){
  const ops=[...shaft,poly([pt(length+8),pt(length-3,4),pt(length-5),pt(length-3,-4)],'s','L'),line(...pt(length+6),...pt(length-4),'H')];
  if(kind==='trident')for(const s of [-1,1])ops.push(line(...pt(length-6,s*5),...pt(length+2,s*7),'O',2),poly([pt(length+5,s*7),pt(length,s*9),pt(length-1,s*5)],'s','L'));return ops;
 }
 if(kind==='bow')return [poly([pt(-12,5),pt(-6,10),pt(0,12),pt(8,10),pt(14,5)],'O'),line(...pt(-12,5),...pt(14,5),'Q'),line(...pt(-3),...pt(21),'s'),poly([pt(25),pt(19,3),pt(20,-3)],'s','L')];
 if(kind==='axe'||kind==='sickle')return [...shaft,poly([pt(length-8,-2),pt(length-5,-10),pt(length+4,-12),pt(length+9,-6),pt(length+3,-6),pt(length-1,-2)],'s','m'),poly([pt(length-4,-9),pt(length+4,-10),pt(length+7,-6),pt(length+3,-7)],'L'),line(...pt(length-8,-2),...pt(length+3,1),'O',2)];
 if(kind==='bell')return [...shaft,poly([pt(length+6,-6),pt(length+6,6),pt(length+1,5),pt(length-8,4),pt(length-8,-4),pt(length+1,-5)],'O','o'),line(...pt(length+6,-6),...pt(length+6,6),'A',2),ellipse(...pt(length+7,-1),3,3,'W','A'),line(...pt(length-5,-2),...pt(length+3,-3),'A')];
 const head=kind==='hammer'?poly([pt(length-7,-8),pt(length+3,-8),pt(length+3,8),pt(length-7,8)],'s','m'):poly([pt(length+4),pt(length+1,5),pt(length-10,5),pt(length-13,1),pt(length-10,-5),pt(length+1,-5)],'I','o');
 return [...shaft,head,line(...pt(length-5,-6),...pt(length+1,-6),'L',2),line(...pt(length-2,-5),...pt(length-2,4),'O')];
}
export function heroDesign(id,d,state,i){
 let p=heroPose(d,state,i);if(id==='knight'){
  p.body=materialPass('knight','body',p.body);p.arms=materialPass('knight','arms',p.arms);p.equipment=materialPass('knight','equipment',p.equipment);
  if(p.torsoX!==undefined&&d!=='n')p.equipment.push(line(p.torsoX+7,p.torsoY+8,p.torsoX+13,p.torsoY+11,'O'),grid(p.torsoX+9,p.torsoY+11,['.OO.','OAAO','.OO.']));return p;
 }
 const map=id==='rogue'?{[P.s]:P.n,[P.m]:P.D,[P.l]:P.m,[P.L]:P.l,[P.H]:P.L,[P.c]:P.u,[P.r]:P.j,[P.R]:P.J,[P.E]:P.k}:{[P.s]:P.e,[P.m]:P.p,[P.l]:P.z,[P.L]:P.Z,[P.H]:P.S,[P.c]:P.e,[P.r]:P.p,[P.R]:P.z,[P.E]:P.Z};
 for(const layer of allLayers)p[layer]=recolorOps(p[layer]??[],map);p.plume=[];
 if(p.headX!==undefined){
  p.body=p.body.filter(o=>!(o.kind==='grid'&&((o.x===p.headX&&o.y===p.headY)||(o.x===p.torsoX&&o.y===p.torsoY)||(o.rows.length===13&&o.rect===undefined&&o.y>=50&&o.y<=57))));
  p.body.push(grid(p.torsoX,p.torsoY,id==='rogue'?TUNIC:robe(d)),grid(p.headX-2,p.headY-1,hood(d,id==='seer')));
  if(id==='seer'&&d!=='n')p.body.push(grid(p.headX+2,p.headY+8,['sssss','sHHLs','.sLs.','..s..']));
 }
 if(p.hand){const old=heroPose(d,state,i),shield=old.equipment.find(o=>o.kind==='grid'),other=shield?[shield.x+2,shield.y+2]:[58,50];p.equipment=[...weaponOps(id==='rogue'?'daggers':'staff',p.hand,p.tip),gauntlet(...p.hand)];
  if(id==='rogue')p.equipment.push(...weaponOps('daggers',other,[other[0]+(d==='w'?-13:13),other[1]-15]),gauntlet(...other));
  else p.equipment.push(grid(other[0]-4,other[1]-3,['..OOOO..','.OAyyAO.','OAyyAAAO','OAAAAAAO','.OAAAAO.','..OOOO..']),gauntlet(...other));
 }
 return p;
}
function ornament(kind,x,y,i=0,large=false){
 const ops=[],s=large?2:1;
 if(/antler|thorn|root|horn|thorns/.test(kind))for(const a of [-1,1]){ops.push(poly([[x+a*5,y+4],[x+a*10,y-3],[x+a*9,y-12],[x+a*14,y-17]],'W'),line(x+a*9,y-6,x+a*17,y-8,'O',s),line(x+a*10,y-11,x+a*7,y-17,'Q'));
 }else if(/crown|sun|gold|moon|stars/.test(kind)){ops.push(line(x-10,y+2,x+10,y+2,'O',3));for(const a of [-8,0,8])ops.push(poly([[x+a-3,y+1],[x+a,y-(a?6:10)],[x+a+3,y+1]],'O','A'));if(kind==='sun')ops.push(ellipse(x-18,y-19,36,36,'O'));
 }else if(/bell|lantern/.test(kind)){ops.push(grid(x-7,y-9,['.....OO.....','....OAOO....','...OAyyAO...','..OAyAAAOo..','..OAAAAAOo..','..OAAAAAOo..','..OAAAAAOo..','.OAAAAAAAOo.','OAAAAAAAAAOo','OOOOOOOOOOOo','.....OO.....','.....AO.....']));
 }else if(/mushroom|shell|coral/.test(kind)){ops.push(poly([[x-12,y+4],[x-11,y-4],[x-5,y-10],[x+3,y-12],[x+10,y-6],[x+13,y+4]],'s','m'),line(x-10,y+3,x+11,y+3,'L'),grid(x-5,y-6,['.LL...LL.','LLL..LLL.','.L....L..']));
 }else if(/eye|parasite|void|ember|flame/.test(kind)){ops.push(poly([[x,y-12],[x+7,y-4],[x+5,y+4],[x,y+9],[x-6,y+3],[x-8,y-4]],'c','r'),ellipse(x-5,y-4,10,7,'O','A'),line(x,y-3,x,y+2,'I',2));
 }else if(/quill|fur|moth/.test(kind)){for(const a of [-1,1])ops.push(poly([[x+a*4,y+6],[x+a*12,y-4],[x+a*15,y-14],[x+a*8,y-10],[x+a*2,y+1]],'s','L'),line(x+a*3,y+3,x+a*12,y-9,'m'));
 }else if(/ice|crystal/.test(kind)){for(const [a,b]of [[-9,-3],[0,-8],[8,0]])ops.push(poly([[x+a-3,y+3],[x+a-2,y-9+b],[x+a+3,y-13+b],[x+a+4,y+1]],'j','J'),line(x+a,y-9+b,x+a+1,y+1,'k'));
 }else if(kind==='book'){ops.push(grid(x-9,y-6,['OOOOOOOOOOOOOOOOOO','OqqqqqqqWWqqqqqqqO','OqHHHHHqWWqHHHHHqO','OqHqqqqqWWqqqqqHqO','OqHHHHHqWWqHHHHHqO','OqqqqqqqWWqqqqqqqO','OOOOOOOOOOOOOOOOOO']));
 }else{ops.push(line(x-9,y+1,x+9,y+1,'O',2),grid(x-6,y-7,['...ssssss...','..sLHHHmss..','.sLLLLmmmss.','sLLLLLmmmssI','sLLLLIIIIssI','.smmmmmmssI.','..sssssssI..']));}
 return ops;
}
function mirror(ops,width){return ops.map(o=>{o=structuredClone(o);if(o.kind==='grid'){o.x=width-o.x-o.rows[0].length;o.rows=o.rows.map(r=>[...r].reverse().join(''));}if(o.rect)o.rect.x=width-o.rect.x-o.rect.width;if(o.from){o.from.x=width-1-o.from.x;o.to.x=width-1-o.to.x;}if(o.points)for(const p of o.points)p.x=width-1-p.x;return o;});}
function beastPose(e,d,state,i){
 const p={cloak:[],plume:[],body:[],arms:[],equipment:[],effects:[],feet:[]};
 const dead=state==='death',drop=dead?Math.min(i*3,14):0,bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:state==='attack'?[0,1,2,-2,-1,0,0,1,0][i]:0;
 const legs=state==='walk'?[[0,2,4,2,0,-2,-4,-2],[0,-2,-4,-2,0,2,4,2]]:Array(2).fill(Array(8).fill(0));
 if(e.family==='crawler'){
  const shell=['.........ssssssss.........','......sslLLLLLLLmmss......','....slLLHHHHHLLLLmmmss....','...slLHHLLLLLLLLLmmmmss...','..slLLLLLmmmLLmmmmmmmssI..','.slLLLLmmmmmmLmmmmmmmmssI.','slLLLmmmmmmmmLmmmmmmmmmssI','sLLLmmmmmmmmmLmmmmmmmmmsI','sLLmmmmmmmmmmLmmmmmmmmmsI','.sLmmmmmmmmmmLmmmmmmmssI.','..smmmmmmmmmmLmmmmmmssI..','...ssmmmmmmmmLmmmmsssI...','.....ssssssssssssssI.....'];
  for(const side of [-1,1])for(let k=0;k<3;k++){const yy=54+k*5+drop,foot=dead?72:75-(state==='walk'&&((i+k)%4===2)?4:0),sway=state==='walk'?legs[k%2][i]:0;p.arms.push(line(48+side*10,yy,48+side*(21+k*4)+sway,yy-6,'I',4),line(48+side*(21+k*4)+sway,yy-6,48+side*(27+k*5),foot,'I',3),line(48+side*10,yy-1,48+side*(21+k*4)+sway,yy-7,'m',2),line(48+side*(21+k*4)+sway,yy-6,48+side*(27+k*5),foot-1,'l'));p.feet.push({x:48+side*(27+k*5),y:foot});}
  p.body.push(grid(35,42+bob+drop,shell),grid(39,57+drop,['..sssss...sssss..','.sLmmmss.sLmmmss.','sLmmRmmssmmRmmssI','.smmmmmssmmmmmssI','..sssssssssssssI.']));
  for(const side of [-1,1])p.equipment.push(poly([[48+side*9,60+drop],[48+side*22,62+drop],[48+side*27,55+drop],[48+side*26,68+drop],[48+side*18,70+drop]],'s','m'));
  p.equipment.push(...ornament(e.ornament,48,44+drop,i));
 }else{
  const side=d==='e'||d==='w',dy=drop?Math.max(0,drop-7):0;
  const torso=side?['.....ssssssssssssssss........','...sslLLLLLLLmmmmmmmssss.....','..slLLHHHHLLLLmmmmmmmmmmss...','.slLLHHLLLLLLmmmmmmmmmmmmss..','slLLLLLLLLmmmmmmmmmmmmmmmssI.','sLLLLmmmmmmmmmmmmmmmmmmmmmsI.','sLLLmmmmmmmmmssssmmmmmmmmsI..','.sLLmmmmmmsssssssssmmmmssI...','..smmmmmmssI.....smmmmssI....','...sssssssI.......sssssI....']:['.....sssssssss.....','...sslLLLmmmmsss...','..slLLHHLLmmmmsss..','.slLLHHLLLmmmmmssI.','slLLHHLLLLmmmmmssI.','sLLLLLLLLmmmmmmssI.','sLLLLLLmmmmmmmmssI.','.sLLLLmmmmmmmmssI..','..sLLLmmmmmmmssI...','...smmmmmmmmssI....','....sssssssssI.....'];
  const x=side?25:38,y=side?48:43;p.body.push(grid(x,y+bob+dy,torso));
  const legXs=side?[31,38,53,61]:[39,47,50,58];
  for(let k=0;k<4;k++){const shift=state==='walk'?legs[k%2][i]:0,up=state==='walk'&&((i+k)%8===2)?5:0,footY=dead?75:75-up,xx=legXs[k]+shift;p.arms.push(line(legXs[k],side?56:51,xx-2,65,'I',5),line(xx-2,65,xx,footY-3,'I',4),line(legXs[k]-1,side?55:50,xx-3,64,k%2?'s':'m',3),line(xx-3,65,xx-1,footY-3,'l',2),grid(xx-3,footY-3,['.sssss.','slLLmss','smmmmms','IIIIIII']));p.feet.push({x:xx,y:footY});}
  const hx=(side?59:38)+(state==='attack'&&i>=3&&i<=5?(side?5:0):0),hy=(side?35:30)+bob+dy;
  p.body.push(grid(hx,hy,d==='n'?['...ssssssss.....','..slLLLmmmss....','.slLLLLmmmssI...','sLLLLLmmmmmsI...','sLLLLmmmmmmssI..','.sLLmmmmmmmssI..','..smmmmmmmssI...','...ssssssssI....']:['.ss....sssssss....','sLms..slLLLmmss...','sLLmsslLHHLLmmss..','.sLLLHHLLLLmmssI..','..sLLLLLLmmmRmsI..','...sLLLmmmmmmssI..','....smmmmmmmmmssI.','....smmmIIIImmmssI','.....smmqIqImssI..','......sssssssssI..']));
  p.cloak.push(poly([[side?26:40,side?52:49],[side?18:31,side?43:43],[side?17:29,side?34:34],[side?24:35,side?42:42]],'s','m'));
  p.equipment.push(...ornament(e.ornament,hx+9,hy+4,i));
  if(d==='w')for(const k of ['body','arms','equipment','cloak'])p[k]=mirror(p[k],96);
 }
 if(dead&&i>=5)p.effects=[];return p;
}
function wings(cx,cy,i,large=false){
 const k=[0,-3,-6,-9,-4,1,4,2][i%8],span=large?48:36,ops=[];
 for(const side of [-1,1]){
  const pts=[[cx+side*5,cy+7],[cx+side*15,cy-4],[cx+side*(span-6),cy-15+k],[cx+side*span,cy-10+k],[cx+side*(span-4),cy+2+k],[cx+side*(span-9),cy+13+k],[cx+side*(span-11),cy+3+k],[cx+side*(span-17),cy+19+k],[cx+side*(span-17),cy+7+k],[cx+side*(span-24),cy+20+k],[cx+side*9,cy+14]];
  ops.push(poly(pts,'n',side<0?'m':'D'),poly([[cx+side*6,cy+7],[cx+side*16,cy-3],[cx+side*(span-6),cy-14+k]],'l'),line(cx+side*15,cy-2,cx+side*(span-9),cy+10+k,'s'));
 }
 return ops;
}
export function enemyDesign(e,d,state,i){
 let p;const normalState=state==='attack-heavy'?'attack':state;
 if(e.boss){
  p=['knight','revenant'].includes(e.family)?wardenPose(d,normalState,i):ogrePose(d,normalState,i);
  const bob=normalState==='walk'?[0,1,0,-1,0,1,0,-1][i]:normalState==='attack'?[0,0,0,2,3,4,2,1,0][i]:0;
  const fallen=normalState==='death'&&i>=3;
  if(!fallen){
   const headX=64+(normalState==='attack'?[0,-1,-1,2,4,4,2,1,0][i]:0),headY=(['knight','revenant'].includes(e.family)?35:27)+bob;
   p.body.push(...ornament(e.ornament,headX,headY-1,i,true));
   if(e.biome===0)p.equipment.push(grid(headX-10,headY+2,['....OOOOOOOO....','...OAyyyyAAOo...','..OAyyyyAAAAOo..','.OAyyyyAAAAAAOo.','OAAAAOOOOAAAAAOo','OAAOIIIIIIIOAAOo','OAAOIIIIIIIOAAOo','OAAOIIAAIIIOAAOo','.OAOIIAAIIIOAOo.','..OOOOOOOOOOOo..']));
   if([1,2,6].includes(e.biome))for(const s of [-1,1])for(let k=0;k<2;k++)p.cloak.push(poly([[64+s*16,64],[64+s*(33+k*9),71],[64+s*(39+k*8),87],[64+s*(28+k*7),95],[64+s*(23+k*7),91]],'s',e.biome===6?'c':'m'));
   if(e.biome===2)p.body.push(poly([[49,48],[42,37],[48,28],[39,20],[45,13]],'W'),poly([[79,48],[86,37],[80,28],[89,20],[83,13]],'W'));
   if(e.biome===3){p.cloak.push(rect(39,25,8,31,'s','D'),rect(81,21,9,36,'s','D'),grid(41,20,['.R.','RAR','AyA','AAA','ooo']),grid(83,16,['.R.','RAR','AyA','AAA','ooo']));p.body.push(grid(57,49,['.OOO...OOO.','OAAAO.OAAAO','OAyyAOAyyAO','.OAAAAAAAO.','..OAAAAAO..','...OOOOO...']));}
   if(e.biome===4)p.body.push(grid(52,48,['..qqq..qqq..qqq..','qQHHQqQHHQqQHHQq.','qQIIQqQIIQqQIIQq.','.qQQq..qQQq..qQQq.']));
   if(e.biome===6){p.body.push(grid(48,40,['....cccc....cccc....','..ccRRRcc.ccRRRRcc..','.cRERRRRRcRRRRRRrrc.','cRERRRRRRRRRRRRRrrrc','cRRRRRRRRRRRRRRRrrrc','.cRRRRRRRRRRRRRrrrc.','..cRRRRRRRRRRRrrrc..','...cRRRRRRRRRrrrc...','....cRRRRRRRrrrc....','.....cRRRRRrrrc.....','......cRRRrrrc......','.......crrrc........','........cc..........']));}
   if([7,8,9].includes(e.biome))p.cloak.unshift(...wings(64,50,i,true));
   if(e.biome===7)p.equipment.push(ellipse(36,20+bob,58,45,'O'),poly([[64,13],[72,22],[64,30],[56,22]],'O','A'),line(42,23+bob,86,59+bob,'l'));
   if(e.biome===9)p.body.push(grid(58,46,['..OOO..','..OAO..','.OAyyO.','OAyyyyO','.OAyAO.','..OOO..']));
  }
  if(p.hand&&p.tip){const shaft=p.haft;p.equipment=p.equipment.filter(o=>o.kind==='grid'||(o.kind==='ellipse'&&e.biome===7));p.equipment.push(...weaponOps(e.weapon,p.hand,p.tip,{boss:true}));if(shaft)p.equipment.push(line(...p.hand,...p.secondHand,'W',3),gauntlet(...p.hand),gauntlet(...p.secondHand));}
 }else if(['hound','crawler'].includes(e.family))p=beastPose(e,d,normalState,i);
 else if(['wisp','harpy'].includes(e.family)){
  p=wispPose(normalState,i);for(const k of allLayers)p[k]=offsetOps(p[k]??[],16,18);p.feet=[];
  if(normalState!=='death'||i<3){p.body.push(grid(37,29+[0,-1,0,1][i%4],hood(d,true)));p.equipment.push(...ornament(e.ornament,48,31+[0,-1,0,1][i%4],i));if(e.family==='harpy')p.cloak.push(...wings(48,47,i));}
 }else if(e.family==='brute'){
  p=ogrePose(d,normalState,i);if(normalState!=='death'||i<3)p.equipment.push(...ornament(e.ornament,64,29,i));
  if(p.hand)p.equipment.push(...weaponOps(e.weapon,p.hand,[p.hand[0]-5,p.hand[1]-29]));
 }else{
  p=e.family==='hollow'?hollowPose(d,normalState,i):e.family==='revenant'?heroDesign('rogue',d,normalState,i):heroDesign('knight',d,normalState,i);
  if(normalState!=='death'||i<3){const head=p.headX!==undefined?{x:p.headX+6,y:p.headY}:p.body.find(o=>o.kind==='grid'&&o.rows.length===12&&o.y>=27&&o.y<=45);const x=head?.x??48,y=head?.y??28;p.equipment.push(...ornament(e.ornament,e.family==='hollow'?x+7:x,y,i));}
  if(p.hand&&p.tip){p.equipment=p.equipment.filter(o=>o.kind==='grid'&&o.rows.length>8);p.equipment.push(...weaponOps(e.weapon,p.hand,p.tip),gauntlet(...p.hand,e.family==='hollow'));}
  p.plume=[];
 }
 const b=BIOMES[e.biome],r=b.palette;
 const map={[P.n]:r[0],[P.d]:r[0],[P.D]:r[1],[P.s]:r[1],[P.m]:r[2],[P.l]:r[3],[P.L]:r[3],[P.H]:r[4],[P.O]:r[3],[P.A]:r[4],[P.j]:r[1],[P.J]:r[2],[P.k]:r[3],[P.K]:r[4]};
 if([2,3,5,6,7,9].includes(e.biome))Object.assign(map,{[P['2']]:r[0],[P['3']]:r[1],[P['4']]:r[2],[P['5']]:r[3],[P['6']]:r[4]});
 for(const k of allLayers)p[k]=recolorOps(p[k]??[],map);
 return p;
}
