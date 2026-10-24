import {P,grid,line,rect,poly,ellipse} from './art-lib.mjs';
import {heroDesign as previousHero} from './descent-actors.mjs';
import {allLayers,recolorOps} from './campaign-art-design.mjs';
import {heroPose,armorArm,gauntlet,blade,HERO_TIMES} from './actor-design-v2.mjs';
import {SKILLS} from '../game/content.mjs';
import {magePose} from './mage-design.mjs';

const rr=s=>s.split('|');
export const DIRECTIONS=['s','se','e','ne','n','nw','w','sw'];
const helm={
 se:rr('.....xxxxxx......|...xxNNCCCNNx....|..xNCCCCCCNNXXx..|.xNCCCCCCNNNXXXx.|xNCCCCCCNNNNXXXXI|xNNNNNNNNNNNXXXXI|xNIIIIIIIIIIXXXXI|xNCCNNIIIIIIXXXXI|xNCCCNNNNNNNXXXXI|xNCCNININNNNXXXxI|xNCNNININNNXXXXxI|.xNNNININNNXXXxI.|..xNNNNNNNXXXxI..|...xNNNNNXXXxI...|....xxxxxxxxI....'),
 sw:rr('......xxxxxx.....|....xNCCCNNNxx...|..xNCCCCCCNNXXx..|.xNCCCCCCNNNXXXx.|INCCCCCCNNNNXXXXx|INCCCCCCNNNNNNNXx|INCCCCIIIIIIIIINx|INCCCCIIIIINNNNNx|INCCCCNNNNNNNNNNx|IxNCCCNNNININNNNx|IxNCCCCNNININNNNx|.IxNCCCNNININNNx.|..IxNCCCNNNNNNx..|...IxNCCCNNNNx...|....Ixxxxxxxx....'),
 ne:rr('.....xxxxxx......|...xxNNCCCNNx....|..xNCCCCCCNNXXx..|.xNCCCCCCNNNXXXx.|xNCCCCCCNNNNXXXXI|xNNNNNNNNNNNXXXXI|xNCCNNNNNNNNXXXXI|xNCCNNNNNNNNXXXXI|xNCCNNNNNNNNXXXXI|xNCCNNNXXNNNXXXxI|xNCNNNXXXNNXXXXxI|.xNNNNXXXNNXXXxI.|..xNNNNNNNXXXxI..|...xNNNNNXXXxI...|....xxxxxxxxI....'),
 nw:rr('......xxxxxx.....|....xNCCCNNNxx...|..xNCCCCCCNNXXx..|.xNCCCCCCNNNXXXx.|INCCCCCCNNNNXXXXx|INCCCCCCNNNNNNNXx|INCCCCNNNNNNNNNNx|INCCCCNNNNNNNNNNx|INCCCCNNNNNNNNNNx|IxNCCCNNXXXNNNNNx|IxNCCCCNXXXNNNNNx|.IxNCCCNXXXNNNNx.|..IxNCCCNNNNNNx..|...IxNCCCNNNNx...|....Ixxxxxxxx....')
};
const hood=rr('......nnnnn......|....nuUUUUUnn....|...nuUvVVUUUnn...|..nuUvVJJvUUUnn..|.nuUvVjnnjvUUUnn.|nuUvVjnIIjnvUUUnn|nUvVjnqIIqIjnvUUn|nUvVjnIIIIIjnvUUn|nUvVjnWWWWWjnvUUn|.nUvVjnWWWjnvUUn.|..nUvVjnWjnvUUn..|...nUvvjjvvUUn...|....nuUUUUUnn....|.....nnnnnn......');
const sage=rr('......eeeeee......|....eppzzpppee....|...epzZZzzpppee...|..epzZHHHzzpppee..|.epzZHHHHHzzpppee.|epzZHHIIHHIHzzppeI|epzZHHLHHHHHzzppeI|.epzZHLLHHHzzppeI.|..epzHLLHzzpppeI..|...epHLLzzpppeI...|....eLLzzpppeI....|.....eLzpppeI.....|......epppeI......|.......eeeI.......');
const chest=rr('.....ssssssss.....|...slLLHHLLmsss...|..slLHHHLLLmmsss..|.slLHHLLLLLmmmsss.|sLLLLLLLLLmmmmmssI|sLLLmmmLLLmmmmmssI|.sLLmmmLLmmmmmssI.|..sLmmmLmmmmmmssI.|..sLmmmmmmmmmmssI.|..sLmmmOmmmmmmssI.|..sLmmOAOmmmmmssI.|..sLmmmOmmmmmmssI.|..sLmmmmmmmmmmssI.|..sLmmmmmmmmmmssI.|.sLLmmmmmmmmmmmssI|.sLmmmmmmmmmmmmssI|sLLmmmmmmmmmmmmmssI|.sssssssIssssssssI');
// These are keyed hand/tip positions, not rotations of a finished bitmap.
const diagonalAttack={
 se:[[34,49,24,30],[31,33,23,10],[39,29,48,8],[59,50,82,67],[65,57,87,78],[62,61,66,90],[48,59,40,81],[36,54,28,31],[34,52,29,28]],
 sw:[[62,49,72,30],[65,33,73,10],[57,29,48,8],[37,50,14,67],[31,57,9,78],[34,61,30,90],[48,59,56,81],[60,54,68,31],[62,52,67,28]],
 ne:[[61,48,72,30],[65,32,75,9],[57,28,48,7],[37,34,14,13],[30,39,8,25],[34,48,17,61],[48,49,39,69],[60,50,68,28],[61,49,67,27]],
 nw:[[35,48,24,30],[31,32,21,9],[39,28,48,7],[59,34,82,13],[66,39,88,25],[62,48,79,61],[48,49,57,69],[36,50,28,28],[35,49,29,27]]
};
const diagonalFeet=[[[40,71],[57,67]],[[41,71],[55,66]],[[43,71],[52,68]],[[44,69],[55,71]],[[41,67],[58,71]],[[43,66],[57,71]],[[45,68],[55,71]],[[41,71],[54,69]]];
function diagonal(id,d,state,i){
 const back=d[0]==='n',left=d.endsWith('w'),sign=left?-1:1,bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:state==='idle'?[0,0,-1,0][i]:state.startsWith('attack')?[0,1,1,2,2,2,1,1,0][i]:0,lean=state.startsWith('attack')?[0,-1,-2,2,3,2,1,0,0][i]*sign:0;
 let feet=state==='walk'?diagonalFeet[i].map(([x,y])=>({x:left?96-x:x,y})): [{x:42,y:71},{x:56,y:71}];
 const tx=38+lean,ty=32+bob,hx=41+lean,hy=(id==='seer'?18:20)+bob,p={cloak:[],plume:[],body:[],arms:[],equipment:[],effects:[],feet:feet.map(f=>({x:f.x,y:f.y+4})),torsoX:tx,torsoY:ty,headX:hx,headY:hy};
 const cloth=id==='knight'?['c','r','R']:id==='rogue'?['u','v','V']:['e','p','z'];
 p.cloak.push(poly([[tx+3,ty+5],[tx+17,ty+6],[tx+24+sign*(i%3-1),ty+32],[tx+18,ty+38],[tx+10,ty+35],[tx-3,ty+37],[tx-5-sign*(i%3),ty+25]],cloth[0],cloth[1]),line(tx+6,ty+9,tx+2,ty+30,cloth[2]),line(tx+14,ty+12,tx+18,ty+33,cloth[0]));
 for(let n=0;n<2;n++){const f=feet[n],hip=[tx+5+n*10,ty+22],knee=[Math.round((hip[0]+f.x)/2),f.y-8];p.body.push(line(...hip,...knee,'I',7),line(...knee,f.x,f.y,'I',6),line(hip[0]-1,hip[1],knee[0]-1,knee[1],id==='knight'?'m':'W',5),line(knee[0]-1,knee[1],f.x-1,f.y,id==='knight'?'l':'o',3),grid(f.x-4,f.y,rr('..sssss..|.slLLmms.|slLLmmmms|smmmmmmmI|IIIIIIIII')));}
 p.body.push(grid(tx,ty,chest));
 if(id==='knight'){p.body.push(...recolorOps([grid(hx,hy,helm[d])],{[P.x]:'#181c2d',[P.X]:'#343b54',[P.N]:'#96acb8',[P.C]:'#e4e7d5'}));p.plume.push(grid(hx+3,hy-9,rr('...cccccc..|..cRRERRcc.|.cRRERRrrcc|cRRRrrrccrc|cRRrrcc..cc|.crrcc.....|..ccc......')),grid(tx+8,ty+20,rr('..OOO..|.OAAAO.|OAyAAAO|.OAAAO.|.OAAAO.|..OAO..|...O...')));}
 else if(id==='rogue'){p.body=recolorOps(p.body,{[P.s]:P.n,[P.m]:P.U,[P.l]:P.v,[P.L]:P.V,[P.H]:P.J});let head=hood;if(back)head=head.map(r=>r.replaceAll('I','U').replaceAll('q','v').replaceAll('W','U'));if(left)head=head.map(r=>[...r].reverse().join(''));p.body.push(grid(hx,hy,head),line(tx+3,ty+4,tx+15,ty+16,'W',3),line(tx+3,ty+3,tx+15,ty+15,'O'));}
 else{p.body=recolorOps(p.body,{[P.s]:P.e,[P.m]:P.p,[P.l]:P.z,[P.L]:P.Z,[P.H]:P.S});p.body.push(poly([[tx+2,ty+4],[tx+18,ty+4],[tx+22,69],[tx+16,72],[tx+10,70],[tx+3,72],[tx-3,69]],'e','p'),line(tx+6,ty+12,tx+3,66,'z'),line(tx+12,ty+10,tx+16,67,'e'),grid(hx-1,hy,back?sage.map(r=>r.replaceAll('H','p').replaceAll('I','e').replaceAll('L','z')):sage),line(tx+3,ty+7,tx+17,ty+9,'O'),grid(tx+8,ty+10,rr('.OO.|OyyO|.OO.')));}
 const base=diagonalAttack[d],key=state.startsWith('attack')?i:0;let [ax,ay,bx,by]=base[key];
 if(state==='attack-backhand'){const row=base[[0,5,4,3,2,1,6,7,8][i]];[ax,ay,bx,by]=row;}
 if(state==='attack-heavy'&&i>=3&&i<=5){ax=48+sign*5;ay=[42,55,59][i-3];bx=ax+sign*3;by=[69,90,91][i-3];}
 if(state==='walk'){const swing=[-1,0,1,1,1,0,-1,-1][i];ax+=sign*swing;ay+=bob;bx+=sign*swing;by+=bob;}
 const other=[left?34:62,49+bob-(state==='block'?[5,7,6,5][i]:0)];p.hand=[ax+lean,ay];p.tip=[bx+lean,by];p.offhand=other;
 const shoulder=[left?tx+16:tx+3,ty+4],elbow=[Math.round((shoulder[0]+p.hand[0])/2),Math.round((shoulder[1]+p.hand[1])/2)+3];p.arms.push(...armorArm([left?tx+4:tx+16,ty+5],[other[0]+(left?3:-3),ty+17],other),...armorArm(shoulder,elbow,p.hand));
 if(id!=='knight')p.arms=recolorOps(p.arms,id==='rogue'?{[P.m]:P.W,[P.L]:P.o,[P.H]:P.O,[P.s]:P.n}:{[P.m]:P.p,[P.L]:P.z,[P.H]:P.Z,[P.s]:P.e});
 return p;
}
export function authoredHero(id,d,state,i){
 let source=state,key=i,skill=null;if(state.startsWith('cast:')){skill=SKILLS.find(s=>s.id===state.slice(5));source=skill.kind==='ward'?'block':skill.kind==='nova'||skill.kind==='meteor'?'attack-heavy':skill.kind==='blades'||skill.kind==='dash'?'attack-backhand':'attack';key=source==='block'?[0,1,2,2,3,3,2,0][i]:[0,1,2,3,4,5,7,8][i];}
 if(state==='charge'){source='block';key=i%4;}
 let p;if(d.length===1)p=previousHero(id,d,source,key);else if(['roll','death'].includes(source))p=previousHero(id,d[0],source,key);else if(id==='seer')p=magePose(d,source,key);else p=diagonal(id,d,source,key);
 if(!p.offhand&&!['roll','death'].includes(source)){const old=heroPose(d.length===1?d:d[0],source,key),sg=old.equipment.find(o=>o.kind==='grid');p.offhand=sg?[sg.x+2,sg.y+2]:[61,50];}
 if(!p.hand){p.body.push(...p.equipment.filter(o=>id!=='knight'||o.kind!=='grid'||o.rows.length<10));if(['roll','death'].includes(source))p.offhand=null;}p.equipment=[];p.magic=state==='charge'||state.startsWith('cast:')||source.startsWith('attack');if(p.hand)p.arms.push(...handPixels(id,p.hand));if(p.offhand)p.arms.push(...handPixels(id,p.offhand));
 if(skill?.kind==='nova'&&i>=3&&i<=5&&p.hand)p.tip=[p.hand[0],74];
 if(state==='charge'&&p.offhand){const [x,y]=p.offhand;for(let n=0;n<=i;n++)p.effects.push(grid(x-8+n*5,y-9-(n%2)*3,rr('..J..|.JkJ.|JkKkJ|.JkJ.|..J..')));}
 return p;
}
export function weaponSet(id,p,style=0){
 if(!p.hand||!p.tip)return [];const h=p.hand,t=p.tip,dx=t[0]-h[0],dy=t[1]-h[1],len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,px=-uy,py=ux,at=(a,b=0)=>[h[0]+ux*a+px*b,h[1]+uy*a+py*b],o=[];
 if(id==='seer'){const tip=at(Math.min(len,34));o.push(line(...at(-5),...tip,'I',4),line(...at(-4),...tip,style>1?'O':'W',2),line(...at(-4,-1),...at(Math.min(len,34)-2,-1),'a'));const x=tip[0],y=tip[1];if(style===0)o.push(poly([[x,y-5],[x+4,y],[x,y+5],[x-4,y]],'j','J'),line(x,y-3,x,y+2,'K'));if(style===1)o.push(poly([[x-6,y+4],[x-7,y-4],[x-3,y-8],[x,y-4],[x+4,y-7],[x+7,y-1],[x+4,y+5]],'O'),ellipse(x-3,y-3,7,7,'J','k'));if(style===2)o.push(ellipse(x-8,y-8,16,16,'a'),ellipse(x-6,y-6,12,12,'O'),poly([[x,y-6],[x+4,y],[x,y+6],[x-4,y]],'p','Z'));if(style===3)o.push(poly([[x,y-10],[x+3,y-3],[x+9,y],[x+3,y+3],[x,y+10],[x-3,y+3],[x-9,y],[x-3,y-3]],'O','A'),poly([[x,y-6],[x+3,y],[x,y+6],[x-3,y]],'J','K'));}
 else if(id==='rogue'){const tip=at(Math.min(20,len));if(style===0)o.push(...blade(h,tip));else{o.push(line(...at(-3),...at(3),'I',3),line(...at(-2),...at(3),'W'),poly([at(4,-2),at(12,-3-style),at(20,-1),at(15,3),at(4,2)],'I',style===2?'q':'L'),line(...at(5,-1),...at(18,-1),style===2?'H':'B'),line(...at(3,-4),...at(3,4),'O'));if(style===3)o.push(line(...at(6,0),...at(14,0),'A'));}}
 else if(style===0)o.push(...blade(h,t));else{const l=Math.min(len,38),half=style===2?3:2;o.push(line(...at(-4),...at(4),'I',4),line(...at(-3),...at(4),'W',2),poly([at(5,-half),at(l-8,-half),at(l,0),at(l-8,half),at(5,half)],'I',style===2?'m':'l'),poly([at(5,-half+1),at(l-8,-half+1),at(l,0),at(6,0)],'L','L'),line(...at(5),...at(l-2),'H'),poly([at(4,-6),at(7,-6),at(5,-2),at(5,2),at(7,6),at(4,6),at(2,3),at(2,-3)],'I','O'),line(...at(4,-5),...at(4,5),'A'),ellipse(...at(-5,-2),4,4,'O','A'));if(style===2)for(const a of [10,15,20])o.push(line(...at(a,0),...at(a+2,1),'O'));if(style===3){o.push(poly([at(10,-3),at(14,-5),at(18,-3),at(14,-2)],'O','A'),line(...at(8,0),...at(l-7,0),'J'));}}
 return [...o,...handPixels(id,h)];
}
export function handPixels(id,h){return recolorOps([gauntlet(...h)],id==='knight'?{}:id==='rogue'?{[P.s]:P.n,[P.l]:P.W,[P.L]:P.o,[P.m]:P.w}:{[P.s]:P['~'],[P.l]:P.W,[P.L]:P.o,[P.m]:P.w});}
export function offhandSet(id,p,shield){if(!p.offhand)return [];const [x,y]=p.offhand,o=[];if(shield)o.push(poly([[x-9,y-6],[x,y-9],[x+10,y-6],[x+8,y+10],[x,y+18],[x-8,y+10]],'I','m'),poly([[x-7,y-5],[x,y-7],[x+7,y-5],[x+5,y+9],[x,y+14],[x-5,y+9]],'L','s'),line(x,y-5,x,y+10,'O',2),line(x-5,y+1,x+5,y+1,'A'));else if(id==='rogue')o.push(...blade([x,y],[x+(x<48?-11:11),y-16]));else if(id==='seer'){if(p.magic)o.push(ellipse(x-4,y-4,9,9,'e','p'),poly([[x,y-5],[x+4,y],[x,y+5],[x-4,y]],'J','k'));else o.push(grid(x-5,y-4,rr('..WWWWWWWWW..|.WOAAAAAAAOW.|WOqHHHHHHqOWI|WOqHqqqqHqOWI|WOqHHqqHHqOWI|WOqHqqqqHqOWI|WOqHHHHHHqOWI|.WOAAAAAAAOWI|..WWWWWWWWWII')),line(x+1,y-2,x+1,y+3,'W'));}return [...o,...handPixels(id,[x,y])];}
export function armorDetail(id,d,style){const o=[],back=d.startsWith('n'),left=d.endsWith('w'),x=32,y=13,edge=style===3?'A':style===2?'q':'O';if(style===0)return [];
 if(id==='knight'){o.push(line(x-9,y+3,x-5,y+18,edge),line(x+8,y+3,x+6,y+18,edge),poly([[x-8,y+1],[x,y+4],[x+8,y+1]],edge),grid(x-3,y+8,style===1?rr('..O..|.OAO.|OAyyO|.OAO.|..O..'):style===2?rr('.qqq.|qHHQq|qIIQq|.qQq.|..q..'):rr('..A..|.AyA.|AyJyA|.AyA.|..A..')));if(style>=2)for(const side of [-1,1])o.push(poly([[x+side*7,y+2],[x+side*13,y-2],[x+side*15,y+5]],edge,style===2?'Q':'O'));}
 else if(id==='rogue'){o.push(line(x-8,y+2,x+6,y+17,'W',3),line(x-8,y+1,x+6,y+16,edge),grid(x+2,y+12,rr('.OO.|OAAO|.OO.')));if(style>=2)o.push(poly([[x-11,y+2],[x-7,y-2],[x-1,y+1],[x-6,y+8]],'n',style===2?'q':'j'),line(x-10,y+3,x-5,y+4,style===2?'H':'k'));}
 else{o.push(poly([[x-9,y],[x,y+5],[x+9,y],[x+6,y+8],[x,y+11],[x-6,y+8]],'e',style===2?'p':'O'),line(x-8,y+1,x,y+7,edge),line(x+8,y+1,x,y+7,edge),grid(x-2,y+9,rr('.OO.|OkkO|.OO.')));if(style>=2)for(const s of [-1,1])o.push(line(x+s*8,y+8,x+s*11,y+27,edge));}
 if(back)return o.filter(op=>op.kind!=='grid');return o;
}
export function bootDetail(id,d,style){const c=style===3?'O':style===2?'q':id==='knight'?'m':'W',l=style===3?'A':style===2?'H':id==='knight'?'L':'o';return [grid(3,2,rr('..sssss..|.sllllcs.|sllcccccs|scccccccI|IIIIIIIII'),{...P,c:P[c],l:P[l]}),...(style>0?[line(6,3,10,3,style===3?'y':'O')]:[])];}
export const heroTimings={...HERO_TIMES,charge:[180,160,140,180]};
export function basePixels(p){return allLayers.filter(l=>l!=='equipment'&&l!=='effects').flatMap(l=>p[l]??[]);}
