import {P,grid,line,rect,poly,ellipse} from './art-lib.mjs';
import {heroPose,hollowPose,wardenPose,offsetOps,armorArm,gauntlet} from './actor-design-v2.mjs';
import {heroDesign as draftHero,enemyDesign as draftEnemy,recolorOps,weaponOps,allLayers} from './campaign-art-design.mjs';
import {BIOMES} from '../game/content.mjs';
import {magePose} from './mage-design.mjs';
const rows=s=>s.split('|');
const empty=()=>({cloak:[],plume:[],body:[],arms:[],equipment:[],effects:[],feet:[]});
const HOOD=rows('.......nnnn.......|.....nuUUUUnn.....|....nuUvVVUUnn....|...nuUvVJJvUUnn...|..nuUvVjnnjvUUnn..|.nuUvVjnnnnjvUUnn.|nuUvVjnIIIIjnvUUnn|nUvVjnIqIIqIjnvUUn|nUvVjnIIIIIIjnvUUn|nUvVjnnWWWWnnvUUnn|.nUvVjnWWWWjnvUUn.|..nUvVjnWWjnvUUn..|...nUvVjnjnvUUn...|....nUvvjjvvUn....|.....nuUUUUnn.....|......nnnnnn......');
const SEER_HEAD=rows('........eeee........|......epppppee......|....eppzzppppee.....|...epzZZzzppppee....|..epzZHHHzzppppee...|.epzZHHHHHzzppppee..|epzZHHHHHHHzzppppee.|epzZHHIIHHIHzzppppeI|epzZHHIIHHIHzzppppeI|.epzZHHLHHHHzzppppeI|..epzZHLLHHzzppppeI.|...epzHLLHzzppppeI..|....epHLLzzppppeI...|.....eHLLzzpppeI....|......eLLzzppeI.....|.......eLppeI......|........eeeI.......');
const GREAT_HELM=rows('.....xxxxxxx.....|...xxNNCCCNNxx...|..xNCCCCCCNNXXx..|.xNCCCCCCNNNXXXx.|xNCCCCCCNNNXXXXxI|xNCCCCCCNNNXXXXxI|xNNNNNNNNNNXXXXxI|xNIIIIIIIIIIIXXxI|xNIIIIIIIIIIIXXxI|xNCCCNNNNNNNXXXxI|xNCCNIINNINNXXXxI|xNCNNIINNINXXXXxI|xNNNNIINNINXXXXxI|.xNNNIINNINXXXxI.|..xNNNNNNNXXXxI..|...xNNNNNXXXxI...|....xxxxxxxI.....');
const ROGUE_CHEST=rows('.....nnnnnnn.....|...nnuUUUUUnnn...|..nuUvVVvUUUnnn..|.nuUvVVvvUUUUnnI.|nuUvVVvvvUUUUnnI.|nUvVVvvvvUUUUnnI.|nUvVvWWWvvUUUnnI.|nUvvWOOWWvUUUnnI.|.nUvWOAOWvUUnnI..|..nUvWOOWvUUnnI..|..nUvvWWvvUUnnI..|..nUvvvvvvUUnnI..|..nUvvvvvvUUnnI..|.nUUvWWWWvUUUnnI.|.nUvWOOOOWvUUnnI.|.nUvWOyyOWvUUnnI.|.nUvWOOOOWvUUnnI.|nUUvvWWWWvvUUUnnI|nUvvvvnvvvvvUUnnI|.nUvvnnnvvvvUUnnI|..nUUnn.nvvUUnnI.|...nnn...nnnnnI..');
const SEER_ROBE=rows('........eeeeee........|......eppzzpppee......|.....epzZZzppppee.....|....epzZZzzpppppee....|...epzZZzzppppppeee...|..epzZZzzppppppppeee..|.epzZZzzppppppppppeeI.|epzZZzzpppOOOppppppeeI|epzZZzzpppOAOppppppeeI|.epzZzzpppOOOpppppeeI.|..epzzpppppppppppeeI..|..epzzpppppppppppeeI..|..epzzpppppppppppeeI..|..epzzpppppppppppeeI..|..epzzpppppppppppeeI..|..epzzpppppppppppeeI..|.epzzpppppppppppppeeI.|.epzzpppppppppppppeeI.|.epzzpppppppppppppeeI.|epzzpppppppppppppppeeI|epzzpppppppppppppppeeI|epzzppppppeppppppppeeI|epzzppppppeppppppppeeI|epzzppppppeppppppppeeI|epzzppppppeppppppppeeI|epzzppppppeppppppppeeI|epzzpppppeeppppppppeeI|epzzpppppeeppppppppeeI|epzzpppppeeppppppppeeI|.epzzppppeeeppppppeeI.|.epzzppppeeeppppppeeI.|..epzpppeeeeeppppeeI..|...eeeeeI...eeeeeI....');
function bodyReplace(p,head,chest,{robe=false}={}){
 if(p.headX===undefined)return p;
 p.body=p.body.filter(o=>!(o.kind==='grid'&&((o.x===p.headX&&o.y===p.headY)||(o.x===p.headX-2&&o.y===p.headY-1)||(o.x===p.torsoX&&o.y===p.torsoY)||(o.y>=50&&o.y<=58&&o.rows.length===13))));
 p.body.push(grid(p.torsoX+(robe?-2:2),p.torsoY,chest),grid(p.headX-2,p.headY-1,head));return p;
}
function rogueSpecial(d,state,i){
 const p=empty();
 if(state==='roll'){
  const k=[{x:37,y:43,hx:38,hy:37},{x:32,y:52,hx:32,hy:53},{x:32,y:50,hx:40,hy:50},{x:34,y:53,hx:46,hy:54},{x:37,y:48,hx:45,hy:45},{x:38,y:42,hx:39,hy:34}][i];
  p.cloak.push(poly([[k.x+8,k.y],[k.x+25,k.y+2],[k.x+31,k.y+16],[k.x+24,75],[k.x+13,71],[k.x+2,75],[k.x-4,k.y+14]],'n','u'));
  p.body.push(poly([[k.x+5,k.y+5],[k.x+22,k.y+4],[k.x+25,k.y+17],[k.x+17,72],[k.x+2,71]],'n','v'),line(k.x+7,k.y+9,k.x+20,k.y+15,'W',3),line(k.x+7,k.y+8,k.x+20,k.y+14,'O'),grid(k.hx,k.hy,i===0||i===5?HOOD:rows('....nnnnnn....|..nuUUUUUUnn..|.nuUvVVvUUUnn.|nuUvVVvvUUUnnI|nUvVjnnnnvUUnI|nUvjnIqIjnUUnI|.nUjnWWWjnUnI.|..nUvvjjvvUnI.|...nuUUUUnnI..|....nnnnnnI...')));
  p.body.push(grid(38,72,rows('.WWWWWW.|WoOOooWW|WoooooWW|IIIIIIII')),grid(57,72,rows('.WWWWWW.|WoOOooWW|WoooooWW|IIIIIIII')));
  p.equipment.push(...weaponOps('daggers',[32,68],[20,62]),...weaponOps('daggers',[65,67],[78,60]));p.feet=[{x:42,y:75},{x:61,y:75}];return p;
 }
 if(i<3){const dy=[3,9,15][i];p.cloak.push(poly([[37,42+dy],[60,42+dy],[68,71],[54,75],[36,72],[31,64]],'n','u'));p.body.push(poly([[40,42+dy],[57,42+dy],[60,Math.min(70,60+dy)],[48,72],[37,68]],'n','v'),grid(39,24+dy,HOOD),line(40,57+dy/3,56,59+Math.floor(dy/3),'W',3),grid(32,72,rows('.WWWWWW.|WoOOooWW|WoooooWW|IIIIIIII')),grid(59,72,rows('.WWWWWW.|WoOOooWW|WoooooWW|IIIIIIII')));p.equipment.push(...weaponOps('daggers',[34,67],[22,71]));}
 else{p.cloak.push(poly([[24,65],[42,58],[62,61],[76,70],[66,75],[30,74]],'n','u'));p.body.push(grid(22,61,rows('....nnnnnnn....|..nuUUUUUUnnn..|.nuUvVVvvUUUnn.|nuUvVjnnnnvUUnn|nUvVjnIqIjnUUnI|.nUvjnWWWjnUnI.|..nUvvjjvvUnI..|...nuUUUUnnI...|....nnnnnnI....')),poly([[38,66],[57,65],[67,69],[78,69],[79,74],[63,75],[51,73],[37,72]],'n','v'),line(42,66,51,71,'W',3),line(42,65,51,70,'O'));p.equipment.push(...weaponOps('daggers',[49,74],[33,74]),...weaponOps('daggers',[65,74],[81,74]));}
 p.feet=[{x:66,y:75}];return p;
}
export function heroDesign(id,d,state,i){
 if(id==='seer')return magePose(d,state,i);
 if(id==='rogue'&&['roll','death'].includes(state))return rogueSpecial(d,state,i);
 let p=draftHero(id,d,state,i);
 if(id==='knight'){
  if(p.headX!==undefined){p.body=p.body.filter(o=>!(o.kind==='grid'&&o.x===p.headX&&o.y===p.headY));const head=d==='n'?GREAT_HELM.map(r=>r.replaceAll('I','X')):GREAT_HELM;p.body.push(grid(p.headX-2,p.headY,head));
   p.equipment.push(line(p.torsoX+2,p.torsoY+6,p.torsoX+6,p.torsoY+19,'O'),line(p.torsoX+17,p.torsoY+6,p.torsoX+15,p.torsoY+18,'W'),grid(p.torsoX+7,p.torsoY+9,rows('..OO..|.OAAO.|OAyyAO|OAAAAO|.OOOO.|..OO..')));
  }
  return p;
 }
 const head=id==='rogue'?HOOD:SEER_HEAD;
 bodyReplace(p,d==='n'?head.map(r=>r.replaceAll('I',id==='rogue'?'U':'p').replaceAll('q',id==='rogue'?'v':'z')):head,id==='rogue'?ROGUE_CHEST:SEER_ROBE,{robe:id==='seer'});
 p.arms=p.arms.filter(o=>o.kind!=='grid').map(o=>({...o,...(o.thickness?{thickness:Math.max(1,o.thickness-(id==='rogue'?2:1))}:{})}));
 if(p.headX!==undefined){
  const hx=p.torsoX,hy=p.torsoY;
  if(id==='rogue'){p.body.push(line(hx+4,hy+3,hx+14,hy+13,'W',3),line(hx+4,hy+2,hx+14,hy+12,'O'));p.cloak.push(grid(hx-4,hy+5,rows('..uuuuuu..|.uvVVvuu..|uvVJJvuuu.|uvVJvuuuuI|uvVVvuuuuI|uvVvuuuuuI|.uvvuuuuuI|.uvvuuuuuI|..uvuuuuuI|..uvvuuuuI|...uvuuuuI|...uvuuuI.|...uvuuuI.|....uvuuI.|....uuuI..|.....uI...')));}
  else {p.cloak.push(grid(hx+14,hy+17,rows('.eee.....|epzpe....|epzp.e...|epzp.ee..|epzp.epe.|epzp.epe.|epzp.eppe|epzp.eppe|.epp.epeI|..ee.eeI.')));p.equipment.push(grid(p.headX+3,p.headY-6,rows('..OOO..|.OA.OO.|OA...AO|.O...O.|..O.O..|...O...')));}
 }
 if(p.hand){
  const old=heroPose(d,state,i),sg=old.equipment.find(o=>o.kind==='grid'),other=sg?[sg.x+2,sg.y+2]:[61,50];p.offhand=other;
  const handMap=id==='rogue'?{[P.s]:P.n,[P.l]:P.W,[P.L]:P.o,[P.m]:P.w}:{[P.s]:P.e,[P.l]:P.z,[P.L]:P.Z,[P.m]:P.p};
  p.equipment=p.equipment.filter(o=>o.kind==='grid'&&o.y<20);
  p.equipment.push(...weaponOps(id==='rogue'?'daggers':'staff',p.hand,p.tip),...recolorOps([gauntlet(...p.hand)],handMap));
  if(id==='rogue')p.equipment.push(...weaponOps('daggers',other,[other[0]+(d==='w'?-12:12),other[1]-18]),...recolorOps([gauntlet(...other)],handMap));
  else p.equipment.push(ellipse(other[0]-4,other[1]-4,9,9,'e','p'),poly([[other[0],other[1]-5],[other[0]+4,other[1]],[other[0],other[1]+5],[other[0]-4,other[1]]],'J','k'));
 }
 return p;
}
function ramp(e,p){const r=BIOMES[e.biome].palette,map={[P.n]:r[0],[P.d]:r[0],[P.D]:r[1],[P.s]:r[1],[P.m]:r[2],[P.l]:r[3],[P.L]:r[3],[P.H]:r[4],[P.j]:r[1],[P.J]:r[2],[P.k]:r[3],[P.K]:r[4]};for(const k of allLayers)p[k]=recolorOps(p[k]??[],map);return p;}
function legs(p,xs,i,state,{bone=false,heavy=false,top=65,ground=95}={}){
 const stride=state==='walk'?[[-5,0],[0,0],[4,-4],[6,-2],[5,0],[0,0],[-4,-4],[-6,-2]][i]:[0,0];
 for(let k=0;k<2;k++){const sign=k?1:-1,x=xs[k]+stride[0]*sign,y=ground+(k===i%2?stride[1]:0),knee=[xs[k]+sign*3,Math.round((top+ground)/2)];p.body.push(...armorArm([xs[k],top],knee,[x,y-4],{bone,large:heavy}),grid(x-4,y-4,bone?rows('.qqqqqq.|qQHHHHQq|qQQQQQQq|.qqqqqqI|IIIIIIII'):rows('.ssssss.|slLLmmss|sLmmmmss|smmmmmsI|IIIIIIII')));p.feet.push({x,y});}
}
function arms(p,sh,hand,{bone=false,heavy=false}={}){p.arms.push(...armorArm(sh,[Math.round((sh[0]+hand[0])/2),Math.round((sh[1]+hand[1])/2)+4],hand,{bone,large:heavy}));p.equipment.push(gauntlet(...hand,bone));}
function bossDesign(e,d,state,i){
 const p=empty(),dead=state==='death',fallen=dead&&i>=4,bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:state==='attack'?[0,1,2,1,2,3,2,1,0][i]:state==='idle'?[0,0,-1,0][i]:0,drop=dead?Math.min(i*5,26):0;
 const act=state==='attack',key=act?[0,-4,-9,5,8,5,2,0,0][i]:0;
 if(fallen){p.body.push(poly([[30,82],[44,71],[70,72],[96,82],[105,91],[92,96],[45,95],[27,89]],'n',e.biome===6?'c':e.biome===2?'W':'m'),grid(30,79,rows('.....ssssssssssssss.....|...slLLLLLLLLLmmmmss....|..slLLHHHHLLLLmmmmmss...|.sLLLLLLLLmmmmmmmmmssI..|sLLLLmmmmmmmmmmmmmssI...|.smmmmmmmmmmmmmmssI....|..sssssssssssssssI......')),line(38,95,96,95,'s',2));
  if([0,9].includes(e.biome))p.body.push(grid(27,80,e.biome===0?rows('..OOOOOOOO..|.OAyyyyAAOo.|OAAIIIIAAAOo|OAAIIIIAAAOo|.OAAAAAAAOo.|..OOOOOOOo..'):rows('..ssssssss..|.slHHHHmss.|sLHHIIHHmss|sLHHIIHHmss|.sLHHLLmssI|..sssssssI.')));
  if([1,7].includes(e.biome))p.cloak.push(poly([[29,83],[22,75],[43,74],[67,79],[100,88],[95,96],[68,92],[44,96]],'n','D'));
  if(e.biome===2){for(const x of [37,49,75,89])p.body.push(poly([[x,80],[x-7,67],[x-3,58],[x+1,68],[x+4,80]],'W','o'));}
  if(e.biome===3)p.body.push(rect(33,77,22,14,'s','D'),rect(36,80,16,6,'c','R'));
  if(e.biome===4)for(const x of [34,47,61,75])p.body.push(grid(x,84,rows('..qqqqqq..|.qQHHHQqq.|qQHIIHIIQq|.qQHHHHqqI|..qqqqqqI.')));
  if(e.biome===5){p.body.push(poly([[82,80],[101,71],[115,74],[114,83],[100,91]],'s','m'),grid(40,76,GREAT_HELM));}
  if(e.biome===6){p.body.push(ellipse(40,78,48,18,'b','c'),line(48,81,64,90,'R',3));}
  if(e.biome===8)p.body.push(poly([[38,84],[40,70],[49,80],[55,67],[61,81],[69,70],[74,84]],'O','o'));
  p.equipment.push(...weaponOps(e.weapon==='claw'?'sword':e.weapon,[55,94],[103,92],{boss:true}));p.feet=[{x:64,y:95}];return ramp(e,p);}
 const cy=38+bob+drop;
 if(e.biome===0){
  legs(p,[56,74],i,state,{top:74});p.cloak.push(poly([[47,47+bob],[34,76],[31,91],[48,86],[50,95],[64,87],[77,95],[92,90],[81,64],[78,47+bob]],'I','D'));
  p.body.push(grid(48,45+bob+drop,rows('......ssssssss......|....slLLLLLmmmss....|...slLHHHLLLmmmss...|..slLLLLLLLmmmmmss..|.slLLLLLmmmmmmmmmssI|sLLLLmmmmmmmmmmmmssI|.sLLmmmmOOOOmmmmssI.|..sLmmmOAAAOmmmssI..|..smmmmOAyAOmmmssI..|..smmmmOAAAOmmmssI..|..smmmmmOOOmmmmssI..|.smmmmmmmmmmmmmmssI.|.smmmmmmmmmmmmmmssI.|smmmmmmmmmmmmmmmmssI|smmmmmmmmmmmmmmmmssI|smmmmmssssssmmmmmssI|.smmmssI...ssmmmmssI|..ssssI.....ssssssI.')));
  p.body.push(grid(50,17+drop,rows('.......OOOOOO.......|.....OOAyyyyAOO.....|....OAyyyyyyyAAOo...|...OAyyyyyyyyAAAOo..|..OAyyyyyyyyAAAAAOo.|.OAyyyyyyyAAAAAAAOo.|OAAAAAOOOOOOAAAAAAOo|OAAAOIIIIIIIIOAAAAOo|OAAAOIIAAIIIIOAAAAOo|OAAAOIIAAIIIIOAAAAOo|.OAAOIIAAIIIIOAAAOo.|..OAOIIAAIIIIOAAOo..|...OOOOOOOOOOOOOo...|...OAAAAAAAAAAAOo...|..OAAAAAAAAAAAAAOo..|.OOOOOOOOOOOOOOOOOo.|.........OO.........|.........AO.........')));
  const h=[35-key,61+bob];arms(p,[49,50+bob],h,{heavy:true});arms(p,[79,50+bob],[92,65+bob]);p.equipment.push(...weaponOps('bell',h,[h[0]-2,h[1]-39],{boss:true}));
 }else if(e.biome===1||e.biome===7){
  const astral=e.biome===7;p.cloak.push(poly([[50,43+bob],[42,62],[26,90],[42,88],[41,96],[57,88],[68,95],[77,86],[91,96],[87,81],[81,43+bob]],'I',astral?'e':'U'));
  p.body.push(grid(50,43+bob+drop,rows('.....sssssssss.....|...slLLLLLmmmsss...|..slLHHHLLLmmmmss..|.slLLLLLLLLmmmmmss.|sLLLLLLLmmmmmmmmmss|.sLLLLmmmmmmmmmmssI|..sLLmmmOOOOmmmssI.|..sLmmmOAAAAOmmssI.|..smmmmOAyyAOmmssI.|..smmmmmOOOOmmmssI.|.smmmmmmmmmmmmmmssI|.smmmmmLmmmmmmmmssI|smmmmmmLmmmmmmmmmss|smmmmmLLmmmmmmmmmss|smmmmLLLmmmmmmmmmss|smmmLLLLmmmmmmmmmss|smmmLLLmmmmmmmmmmss|smmLLLmmmmmmmmmmmss|smmLLLmmmmmmmmmmmss|smmmLmmmmmmmmmmmssI|.smmmmmmmmmmmmmssI.|..ssmmmmmmmmmmssI..|....sssssssssssI...')));
  p.body.push(grid(53,17+bob+drop,astral?SEER_HEAD:rows('.......ssss.......|.....sLLLLss......|....slHHHLLss.....|...slHHHHHLLss....|..slHHHHHHHLLss...|.slHHHHHHHHHLLss..|slHHHHHHHHHHHLLss.|sHHHHIIHHIIHHHLssI|sHHHHIIHHIIHHHLssI|.sHHHHHLLHHHHLLssI|..sHHHHLLHHHLLssI.|...sHHHLLHHLLssI..|....sHHLLHLLssI...|.....sHLLLLssI....|......sLLLssI.....|.......ssssI......')));
  const hands=[[31-key,63+bob],[98+key,61+bob]];arms(p,[50,48+bob],hands[0]);arms(p,[78,48+bob],hands[1]);
  if(astral){p.cloak.unshift(ellipse(29,20,70,62,'O'),line(35,21,94,77,'O'),line(29,53,99,39,'W'));for(const [x,y]of [[30,51],[59,20],[95,66]])p.equipment.push(ellipse(x-3,y-3,7,7,'A','O'));p.equipment.push(...weaponOps('staff',hands[1],[111,25],{boss:true}));}
  else {for(const side of [-1,1])for(let k=0;k<3;k++)p.cloak.push(poly([[64+side*(13+k*3),73],[64+side*(33+k*4),80-k*3],[64+side*(41+k*3),94],[64+side*(34+k*2),95],[64+side*(31+k*3),87],[64+side*13,86]],'s','m'));p.equipment.push(grid(58,10,rows('O...O...O|OA.OAO.AO|.OAAAAAO.|..OAAAO..|...OOO...')));}
  p.feet=astral?[]:[{x:24,y:95},{x:105,y:95}];
 }else if(e.biome===2){
  legs(p,[50,79],i,state,{top:71,heavy:true});p.body.push(grid(42,38+bob+drop,rows('..........WWWWWW..........|......WWWoOOOOooWWWW......|...WWoOOAAAAOOOOoooWWWW...|..WoOOAAAAAAOOOOOooooWW...|.WoOOAAAAAOOOooooOOoooWW..|WoOOAAAAOOOOooooooOOooWW..|WoOAAAAOOOooooooooOOOOoWW.|WoOAAAOOoooOOOooooooOOoWWI|WoOAAOOoooOAAAOoooooOOoWWI|.WoOOOooooOAyAOoooooOoWWI.|..WoOOooooOAAAOooooOOoWWI.|..WoOOoooooOOOoooooOOoWWI.|..WoOOoooooooooooooOOoWWI.|.WoOOOoooooWoooooooOOOoWWI|.WoOOooooooWoooooooOOOoWWI|WoOOoooooooWoooooooOOOoWWI|WoOOooooooWWoooooooOOOoWWI|.WoOOooooWWWoooooooOOoWWI.|..WWooooWWWWWooooooWWWWI..|....WWWWWWWWWWWWWWWWI....')));
  p.body.push(grid(54,25+bob,rows('..WWWWWWWWWWWW..|.WoOOAAAOOOooWW.|WoOAAAAAOOOOooWW|WoOAAIIAOIIAooWW|.WoAOIIAOIIAoWWI|..WoOOAOOOAooWWI|...WoOOAAOooWWI.|....WoOOOOoWWI..|.....WWWWWWWI...')));
  for(const side of [-1,1]){p.cloak.push(poly([[64+side*7,31],[64+side*17,21],[64+side*12,8],[64+side*24,3],[64+side*29,8]],'W'),poly([[64+side*17,20],[64+side*30,17],[64+side*34,6]],'O'));const hand=[64+side*(37+Math.abs(key)),75+bob];arms(p,[64+side*21,49+bob],hand,{heavy:true});for(let j=0;j<3;j++)p.equipment.push(line(hand[0]+j*3-3,hand[1],hand[0]+side*8+j*3-3,hand[1]+10,'W',2));}
 }else if(e.biome===3){
  legs(p,[49,80],i,state,{top:74,heavy:true});p.body.push(grid(41,39+bob+drop,rows('.......ssssssssssss.......|....sslLLLLLLLLLmmmsss....|..slLLHHHHLLLLLLLLmmmss...|.slLHHHHHLLLLLLLLLmmmssI..|sLLHHHHLLLLLLLLLmmmmmmssI.|sLLLLLLLOOOOOOOOmmmmmssI..|sLLLLLLOAAyyyyAAOmmmmssI..|sLLLLLLOAOIIIIAOmmmmssI...|sLLLLLLOAOIIIIAOmmmmssI...|sLLLLLLOAOIIIIAOmmmmssI...|sLLLLLLOAAyyyyAAOmmmmssI..|sLLLLLLLOOOOOOOOmmmmmssI..|sLLLLLmmmmmmmmmmmmmmmssI..|sLLLLmmmmmmmmmmmmmmmmssI..|.sLLLmmmmmmmmmmmmmmmssI...|..sLLmmmmmmmmmmmmmmssI....|...sLmmmmmmmmmmmmmssI.....|....sssssssssssssssI.....')));
  p.body.push(rect(52,18+bob,25,23,'s','D'),rect(55,21+bob,19,17,'O','c'));for(let x=57;x<74;x+=4)p.body.push(rect(x,22+bob,2,16,'s','m'));p.body.push(line(52,18+bob,76,18+bob,'L'));
  p.cloak.push(rect(34,17,10,35,'s','D'),rect(85,12,11,43,'s','D'),grid(35,8,rows('...R...|..RAR..|.RAyAR.|RAyyyAR|.AAAAA.|..ooo..')),grid(86,3,rows('...R...|..RAR..|.RAyAR.|RAyyyAR|.AAAAA.|..ooo..')));
  for(const side of [-1,1]){const hand=[64+side*(38+key),72+bob];arms(p,[64+side*22,48+bob],hand,{heavy:true});p.equipment.push(...weaponOps('hammer',hand,[hand[0],hand[1]-28],{boss:true}));}
 }else if(e.biome===4){
  legs(p,[51,77],i,state,{bone:true,heavy:true,top:72});p.cloak.push(poly([[49,37],[28,68],[29,92],[47,84],[52,96],[64,86],[79,94],[96,89],[86,63],[80,37]],'I','e'));
  for(let r=0;r<5;r++){const yy=48+r*5+bob;p.body.push(line(63,yy,47+r,yy-2,'q',3),line(63,yy,81-r,yy-2,'q',3),line(63,yy-1,48+r,yy-3,'H'),line(63,yy-1,80-r,yy-3,'Q'));}p.body.push(line(63,43,63,75,'q',4),line(62,43,62,75,'H'),grid(51,19+bob,rows('.....qqqqqqqq.....|...qQHHHHHHQqq...|..qQHHHHHHHHQqq..|.qQHHHHHHHHHHQqq.|qQHHHHHHHHHHHHQqq|qQHHIIIQQIIIHHQqq|qQHHIIIQQIIIHHQqq|.qQHHHHIIHHHHQqqI|..qQHQHIIHQHQqqI.|...qQHQHQHQHqqI..|....qQHHHHQqqI...|.....qqqqqqqI....')));
  for(const a of [-10,0,10])p.equipment.push(poly([[64+a-4,20],[64+a,8-(a?0:5)],[64+a+4,20]],'O','A'));const h=[32-key,65];arms(p,[48,46],h,{bone:true,heavy:true});arms(p,[80,46],[95,66],{bone:true,heavy:true});p.equipment.push(...weaponOps('sword',h,[h[0]-2,24],{boss:true}));
 }else if(e.biome===5){
  // A mounted marshal has a different mass distribution from every standing boss.
  const lift=state==='walk'?[0,1,2,0,0,1,2,0][i]:0;
  p.body.push(grid(28,63+lift,rows('.....ssssssssssssssssssssssssssss.....|...sslLLLLLLLLLLLLLmmmmmmmmmmmmsss...|..slLLHHHHHLLLLLLLLLmmmmmmmmmmmmmss..|.slLLHHHHLLLLLLLLLmmmmmmmmmmmmmmmssI.|sLLLLLLLLLLLLmmmmmmmmmmmmmmmmmmmmssI|sLLLLLLLLLmmmmmmmmmmmmmmmmmmmmmmmssI|.sLLLLLmmmmmmmmmmmmmmmmmmmmmmmmmssI.|..sLLLmmmmmmssssssssssssmmmmmmmssI..|...smmmmmmssI.........ssmmmmmmssI...|....sssssssI...........ssssssssI....')));
  for(const x of [39,47,84,94]){const step=state==='walk'?(x%2?1:-1)*[0,3,5,1,0,-3,-5,-1][i]:0;p.body.push(line(x,75,x+step,91,'s',5),line(x-1,75,x+step-1,91,'L',2),grid(x+step-3,92,rows('.sssss.|smmmmmI|IIIIIII|IIIIIII')));p.feet.push({x:x+step,y:95});}
  p.body.push(poly([[84,67],[91,45],[102,40],[109,47],[103,64]],'s','m'),grid(94,36,rows('ss....ssssss......|sLssssLHHLLmmss...|sLLHHHHLLLLmmmss..|.sLLLLLLLmmRmmssI.|..sLLLLmmmmmmmmssI|...smmmIIIIImmmssI|....smmqIqImmmssI.|.....ssssssssssI..')));
  p.body.push(grid(46,28+bob,rows('....ssssssssss....|..slLLHHLLLmmsss..|.slLHHHHLLLLmmmss.|sLLLLLLLLLmmmmmssI|sLLLLLOAAAOmmmmssI|.sLLLLOAyAOmmmssI.|..sLLLOAAAOmmssI..|...smmmOOOmmssI...|....ssssssssssI...')),grid(49,9+bob,GREAT_HELM));p.cloak.push(poly([[45,29],[29,45],[25,69],[44,60],[48,40]],'s','l'));const h=[77,43+bob];arms(p,[67,33+bob],h);p.equipment.push(...weaponOps('spear',h,[105,7],{boss:true}),poly([[52,11],[55,0],[59,9]],'J','k'));
 }else if(e.biome===6){
  p.body.push(poly([[64,31],[45,20],[29,28],[23,46],[28,64],[40,78],[61,93],[72,88],[90,73],[104,53],[99,32],[83,21]],'b','c'),poly([[61,37],[44,25],[32,31],[30,47],[35,61],[49,76],[64,87],[78,75],[88,56],[83,39]],'r','r'),poly([[51,32],[39,32],[35,42],[38,53],[45,63],[51,52]],'R','R'),poly([[69,44],[79,35],[89,35],[94,47],[88,60],[78,73]],'R','R'));
  for(const [x,y]of [[49,22],[63,26],[77,23]])p.body.push(line(x,y,x-5,y-17,'c',8),line(x-1,y,x-6,y-18,'R',3),ellipse(x-9,y-23,9,6,'b','c'));
  for(const side of [-1,1])for(let k=0;k<3;k++){const x=64+side*(23+k*3);p.arms.push(poly([[x,53+k*7],[64+side*(42+key),62+k*7],[64+side*(47+key),81+k*4],[64+side*(37+key),95],[64+side*(33+key),90]],'b','c'),line(x,53+k*7,64+side*(42+key),62+k*7,'R'));}p.feet=[{x:27,y:95},{x:101,y:95}];p.equipment.push(ellipse(54,49+bob,21,17,'O','A'),ellipse(59,52+bob,11,11,'c','b'),line(64,52+bob,64,61+bob,'y',2));
 }else if(e.biome===8){
  const base=wardenPose(d,state,i);Object.assign(p,base);p.body.push(grid(52,35+bob,rows('......OOOOOO......|....OAyyyyAAOo....|...OAyyyyyAAAOo...|..OAyyyyyAAAAAOo..|.OAAAAOOOOAAAAAOo.|OAAAOIIIIIIIOAAAOo|OAAAOIIAAIIIOAAAOo|OAAAOIIAAIIIOAAAOo|.OAAOIIAAIIIOAAOo.|..OAOIIAAIIIOAOo..|...OOOOOOOOOOOo...')));p.cloak.unshift(poly([[63,3],[67,15],[82,6],[79,23],[99,17],[89,34],[108,36],[91,46],[102,60],[81,58],[80,75],[65,63],[50,75],[48,58],[30,61],[38,46],[21,36],[42,33],[32,17],[50,23],[47,6],[59,15]],'O','o'));for(const x of [51,63,75])p.equipment.push(poly([[x-4,34],[x,19],[x+4,34]],'O','A'));
 }else if(e.biome===9){
  legs(p,[53,75],i,state,{bone:true,top:73});p.cloak.push(poly([[51,42],[32,35],[17,19],[4,13],[8,36],[1,42],[16,53],[10,62],[30,70],[20,77],[42,80],[46,94],[62,88],[82,95],[88,78],[115,73],[105,64],[131,55],[121,44],[138,28],[121,18],[106,31],[82,43]],'I','n'));
  p.body.push(grid(47,42+bob,rows('.....sssssssssss.....|...slLLLLLLLLmmmss...|..slLHHHHLLLLmmmmss..|.slLLHHLLLLLmmmmmssI.|sLLLLLmmLLLmmmmmmmssI|sLLLmmmLLLLmmmmmmmssI|.sLmmmLLLmmmmmsssI..|..smmLLLmmmmmmssI...|..smmLLLmmmmmssI....|..smmLLLmmmmmssI....|..smmLLLmmmmmssI....|..smmLLLmmmmmssI....|.smmmLLLmmmmmmssI...|smmmmLLLmmmmmmmssI..|smmmmLLLmmmmmmmssI..|.smmmLLLmmmmmmssI...|..sssssssssssssI....')),grid(52,17+bob,rows('.....sssssssss.....|...slLHHHHmmsss...|..slLHHHHHmmmmss..|.slLHHHHHmmmsssII.|sLLHHHIIHmmssIIIII|sLHHHHIIHmmssIIIII|sLHHHHHHHmmssIAIII|sLHHHHLLHmmssIAIII|.sLHHHLLHmmssIIIII|..sLHHLLHmmssIIII.|...sLHLLHmmssIII..|....sLLLHmmssII...|.....sLLHmmssI....|......sssssssI....')));
  p.cloak.push(poly([[49,20],[49,9],[59,3],[76,6],[82,16],[78,23]],'O'),poly([[43,19],[45,6],[57,0]],'W'));arms(p,[48,48],[30-key,66],{bone:true});arms(p,[79,48],[95+key,60],{bone:true});p.equipment.push(...weaponOps('sword',[30-key,66],[14,21],{boss:true}),grid(60,54,rows('..OO..|.OAAO.|OAyyAO|.OAAO.|..OO..')));
 }
 // The finished masses bridge every neck, shoulder and pelvis. Texture grids
 // sit on these sculpted native-size volumes rather than floating between joints.
 const under=[];
 if(e.biome===0){under.push(line(64,31+drop,64,50+bob,'s',11),line(64,34+drop,64,49+bob,'m',7),line(62,35+drop,62,48+bob,'l'),poly([[51,49+bob],[77,49+bob],[81,74],[76,84],[64,78],[51,85],[47,73]],'s','m'));p.body.push(line(55,60,52,79,'l'),line(64,61,64,76,'O'),line(73,60,76,79,'D'));}
 if(e.biome===1||e.biome===7){under.push(line(64,30+bob,64,47+bob,'s',10),line(64,32+bob,64,46+bob,'m',7),line(62,33+bob,62,44+bob,'l'),poly([[53,43+bob],[77,43+bob],[78,66],[87,88],[75,94],[65,87],[52,94],[42,86],[50,65]],'n','m'));p.body.push(line(55,61,49,85,'l'),line(64,65,64,89,'s'),line(72,61,80,86,'D'));}
 if(e.biome===2){under.push(line(64,31+bob,64,46+bob,'W',9),poly([[49,37+bob],[78,37+bob],[87,49],[83,67],[79,81],[66,78],[52,81],[44,65],[41,48]],'W','o'));for(const x of [51,58,68,76])p.body.push(poly([[x,57],[x-2,65],[x+1,73],[x-1,79]],'W'));}
 if(e.biome===3){under.push(poly([[47,38+bob],[82,38+bob],[90,48],[86,75],[77,81],[51,81],[41,74],[38,49]],'s','m'));p.body.push(rect(44,70,42,7,'s','D'),line(45,71,84,71,'L'));for(const x of [47,57,69,80])p.body.push(grid(x,73,rows('.OO.|OAAO|.OO.')));}
 if(e.biome===4){under.push(line(64,29+bob,64,47+bob,'q',5),line(62,30+bob,62,46+bob,'H',2));p.body.push(line(48,46,78,46,'q',3),line(49,45,77,45,'H'));}
 if(e.biome===5){under.push(poly([[36,61],[48,58],[80,58],[95,63],[97,74],[91,83],[82,83],[77,76],[48,77],[42,83],[31,80],[27,72]],'s','m'),poly([[88,65],[90,49],[103,42],[111,47],[108,59],[100,68]],'s','m'),poly([[53,31+bob],[73,31+bob],[77,46],[77,59],[66,63],[50,60],[47,47]],'s','m'),line(63,22,63,33,'s',8));p.body.push(line(32,64,85,63,'L'),line(40,70,77,70,'l'),line(53,45,49,57,'D',3),line(73,45,79,57,'D',3));}
 if(e.biome===8)under.push(line(64,43+bob,64,58+bob,'s',9));
 if(e.biome===9){under.push(line(64,29+bob,64,47+bob,'q',6),poly([[52,43],[76,43],[78,66],[81,82],[73,88],[64,83],[55,88],[47,81],[51,63]],'n','D'));p.body.push(line(64,57,64,76,'l'),poly([[54,64],[64,68],[75,64]],'q'));}
 // Center bust and head grids; limbs use a stable x=64 spine.
 p.body=p.body.map(o=>o.kind==='grid'&&o.y<70&&o.rows.length>=9&&!(e.biome===5&&o.y>55)?{...o,x:64-Math.floor(Math.max(...o.rows.map(r=>r.length))/2)}:o);
 p.body.unshift(...under);
 if(d==='n'&&e.biome!==6){
  p.body=p.body.map(o=>o.kind==='grid'&&o.y<43&&o.rows.length>=9?grid(o.x,o.y,o.rows.map(r=>r.replaceAll('I',e.biome===4?'Q':'m').replaceAll('H',e.biome===4?'Q':'l'))):o);
  if(e.biome===3)p.body.push(rect(55,21+bob,19,17,'s','m'),line(57,26+bob,71,26+bob,'D',2),line(57,31+bob,71,31+bob,'D',2));
  if([0,1,7,9].includes(e.biome))p.body.push(poly([[49,46],[78,46],[84,82],[75,94],[64,87],[53,94],[45,82]],'s','D'),line(64,49,64,85,'m',2),line(50,49,47,78,'l'));
 }
 if((d==='e'||d==='w')&&[0,1,2,4,7,9].includes(e.biome)){
  const head=p.body.find(o=>o.kind==='grid'&&o.y<38&&o.rows.length>=9);if(head){const center=64,yy=head.y+7,sign=d==='e'?1:-1,shade=e.biome===4?'q':e.biome===2?'W':'s';p.body.push(poly([[center-sign*5,yy-3],[center+sign*7,yy-2],[center+sign*10,yy+2],[center+sign*7,yy+7],[center+sign*3,yy+10],[center-sign*4,yy+8]],shade,e.biome===4?'Q':'m'),line(center+sign*3,yy+1,center+sign*7,yy+1,'I',2),line(center-sign*3,yy-2,center-sign*4,yy+5,e.biome===4?'H':'L'));}
 }
 if(dead&&drop)p.body=offsetOps(p.body,0,Math.min(drop,4));return ramp(e,p);
}
const WOLF_FRONT=rows('ss..............ss|sLss..........sslms|sLLmss......sslmmms|.sLLLsssssssslmmss.|..sLLLHHLLLLmmmmss..|..sLLHHHLLLLmmmmssI.|..sLLLmmmLLmmRmmssI|...sLLmmRLLmmRmmssI|....sLLmmmmmmmmssI.|...sLmmmmmmmmmmmssI|..sLmmmIIIIImmmmssI|...smmqIqIqImmmssI.|....smmQQQmmmmssI..|.....ssssssssssI...');
function beast(e,d,state,i){const p=empty(),bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:0,attack=state==='attack'?[0,0,2,-3,-2,0,1,0,0][i]:0,side=d==='e'||d==='w';
 if(e.id==='blood-4'){
  const poses=[[[33,65],[40,61],[48,57],[57,58],[65,63]],[[32,64],[39,59],[49,56],[59,58],[67,64]],[[33,63],[41,58],[51,56],[61,59],[69,65]],[[35,64],[43,59],[53,58],[63,61],[70,65]]],a=poses[i%4];for(let k=0;k<a.length;k++){const [x,y]=a[k];p.body.push(ellipse(x-9,y-6,18,14,'b','c'),ellipse(x-7,y-5,11,8,'r','r'),line(x-6,y-3,x-3,y-5,'R',2));}const head=d==='w'?[27,65]:d==='n'?[49,52]:d==='e'?[73,65]:[50,68];p.body.push(ellipse(head[0]-11,head[1]-10,22,18,'c','r'),ellipse(head[0]-7,head[1]-6,14,11,'b','b'));for(const [x,y]of [[-6,-4],[-2,-6],[3,-5],[6,-1],[-5,2],[0,3],[4,2]])p.equipment.push(poly([[head[0]+x,head[1]+y],[head[0]+x+2,head[1]+y],[head[0]+x+1,head[1]+y+3]],'q','Q'));p.body.push(line(39,75,63,75,'b'));p.feet=[{x:48,y:75}];return ramp(e,p);
 }
 const stag=e.id==='thorns-3',coal=e.id==='forge-1',warg=e.id==='frost-2',voidCat=e.id==='abyss-2';
 const torso=side?rows('.......sssssssssssssss........|....sslLLLLLLLLmmmmmmmsss.....|..slLLHHHHHLLLLmmmmmmmmmss....|.slLLHHHHLLLLLmmmmmmmmmmssI...|sLLLLLLLLLLLmmmmmmmmmmmmssI..|sLLLLLLLmmmmmmmmmmmmmmmmssI..|sLLLLmmmmmmmmmmmmmmmmmmssI...|.sLLmmmmmmmmmmmmmmmmmmssI....|..smmmmmmssssssmmmmmmssI.....|...sssssssI...ssssssssI......'):rows('......ssssssss......|...sslLLLLLLmmmss...|..slLLHHHHLLmmmmss..|.slLLHHLLLLLmmmmmss.|sLLLLLLLLLmmmmmmmssI|sLLLLLLLmmmmmmmmmssI|.sLLLLmmmmmmmmmmssI.|..sLLLmmmmmmmmmssI..|...smmmmmmmmmmssI...|....sssssssssssI....');
 p.body.push(poly(side?[[29,47],[39,43],[56,44],[66,50],[64,62],[55,65],[37,64],[28,58]]:[[40,40],[55,40],[61,50],[57,64],[49,69],[39,63],[34,51]],'s','m'),grid(side?25:36,side?47:42,torso));
 for(let k=0;k<4;k++){const rear=k<2,x0=side?[32,58,38,63][k]:[37,59,41,55][k],swing=state==='walk'?(k%2?1:-1)*[0,2,4,2,0,-2,-4,-2][i]:0,ground=rear&&!side?66:75,up=state==='walk'&&i%4===k%4?3:0,xx=x0+swing;p.arms.push(line(x0,rear?54:61,xx,ground-4-up,'I',coal||warg?7:5),line(x0-1,rear?53:60,xx-1,ground-4-up,'m',coal||warg?5:3),grid(xx-3,ground-3-up,rows('.sssss.|smmmmms|smqmqms|IIIIIII')));p.feet.push({x:xx,y:ground-up});}
 const headX=side?(d==='w'?18:60):36,headY=(stag?33:43)+bob+attack;
 if(side)p.body.push(poly([[55,50],[61,39],[70,42],[69,56],[57,59]],'s','m'));
 p.body.push(grid(headX,headY,d==='n'?WOLF_FRONT.map(x=>x.replaceAll('R','m').replaceAll('I','s')):WOLF_FRONT));
 if(warg)p.body.push(grid(side?55:41,51+bob,rows('..lLLlllLLl..|.lLHHLLLHHLl.|lLHHHHLLLHHHl|.lLHHLLLLHHLl|..lLLLLLLLl..|...lLLLLLl...|....lLLLl....|.....lll.....')));
 if(stag){for(const s of [-1,1])p.equipment.push(poly([[47+s*6,40],[47+s*11,30],[47+s*8,16],[47+s*18,10],[47+s*21,13]],'W'),line(47+s*10,29,47+s*21,25,'O',2),line(47+s*17,23,47+s*18,16,'Q'));}
 if(coal)for(const x of [31,39,47,55])p.cloak.push(grid(x,41+(x%3),rows('..c..|.cRc.|cRARc|cAyAc|.AAc.')));
 if(voidCat){p.cloak.push(poly([[30,53],[18,47],[16,33],[24,25],[25,32],[21,37],[23,46]],'n','D'));p.body.push(line(headX+8,headY+8,headX+11,headY+8,'k'),line(headX+15,headY+8,headX+18,headY+8,'k'));}
 if(e.id==='thorns-1')for(const x of [33,41,49,57])p.cloak.push(poly([[x,49],[x-4,37],[x+2,42],[x+5,32],[x+6,47]],'W','o'));
 if(e.id==='abbey-3')p.equipment.push(line(headX+4,headY+10,headX+19,headY+10,'s',2),line(headX+5,headY+13,headX+18,headY+13,'s'),poly([[34,52],[29,58],[27,63],[21,64]],'O'));
 if(state==='death')p.body=offsetOps(p.body,0,Math.min(i*2,6));return ramp(e,p);}
function crawler(e,d,state,i){const p=empty(),ice=e.biome===5,crab=e.biome===1,root=e.biome===2,bone=e.biome===6,gold=e.biome===8,count=ice||bone?4:3,bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:0;
 for(const side of [-1,1])for(let k=0;k<count;k++){const sy=48+k*5,reach=(ice?37:crab?25:root?31:36)-k,step=state==='walk'?(k%2?1:-1)*[0,2,3,1,0,-2,-3,-1][i]:0,foot=75-(state==='walk'&&(i+k)%4===2?4:0);p.arms.push(line(48+side*9,sy,48+side*reach,sy-7+step,'I',crab?5:3),line(48+side*reach,sy-7+step,48+side*(reach+3),foot,'I',3),line(48+side*9,sy-1,48+side*reach,sy-8+step,root?'O':'l'),line(48+side*reach,sy-7+step,48+side*(reach+3),foot-1,root?'o':'m'));p.feet.push({x:48+side*(reach+3),y:foot});}
 if(ice)p.body.push(ellipse(34,34+bob,29,28,'s','m'),poly([[39,43],[37,24],[42,17],[47,40],[50,30],[55,20],[58,44]],'j','J'),line(42,20,43,40,'k'));
 else if(crab){p.body.push(grid(31,45+bob,rows('.....ssssssssssssss.....|...sslLLHHHHLLLLmmmss...|..slLHHHHHLLLLLmmmmmss..|.slLHHHHLLLLLmmmmmmmssI.|sLLLLLLLLLmmmmmmmmmmssI.|sLLLLLmmmmmmmmmmmmmmssI.|.sLLLmmmmmmmmmmmmmmssI..|..ssssssssssssssssssI...')));for(const s of [-1,1])p.equipment.push(poly([[48+s*13,58],[48+s*27,53],[48+s*31,42],[48+s*25,46],[48+s*20,41],[48+s*24,57],[48+s*17,64]],'s','l'));}
 else if(root){p.body.push(poly([[48,33],[33,44],[31,62],[41,70],[56,69],[67,58],[62,43]],'W','o'),poly([[48,38],[38,45],[39,61],[48,65],[59,56],[56,46],[47,46],[43,54],[49,59]],'O'),line(41,48,55,52,'Q'));}
 else if(bone){for(let k=0;k<4;k++)p.body.push(ellipse(35+k*2,39+k*6+bob,25,10,'q','Q'),ellipse(40+k*2,41+k*6+bob,16,5,'I','I'));p.body.push(grid(37,57,rows('...qqqqqqqq...|.qQHHHHHHQqq..|qQHHIIHHIIQqq.|qQHHIIHHIIQqq.|.qQHHHIIHQqqI.|..qQHQHQHqqI..|...qqqqqqqI...')));}
 else if(gold){p.cloak.push(poly([[39,47],[29,38],[34,27],[45,42]],'O','o'),poly([[57,47],[67,38],[62,27],[51,42]],'O','o'));p.body.push(ellipse(36,43+bob,24,27,'O','o'),line(47,44,47,68,'A'),grid(39,37,rows('...OOOOOO...|..OAyyyyAO..|.OAyyyyAAAO.|OAAIIAAIIAAO|OAAIIAAIIAAO|.OAAAAAAAAO.|..OOOOOOOO..')));p.equipment.push(line(41,40,35,28,'O'),line(55,40,61,28,'O'));}
 return ramp(e,p);}
function caster(e,d,state,i){
 const p=empty(),bob=[0,-1,0,1][i%4],cy=45+bob,dead=state==='death';if(dead&&i>4){p.body.push(grid(43,61,rows('..jj..|.jJJj.|jJkkJj|.jJJj.|..jj..')));return ramp(e,p);}
 if(e.biome===6){p.body.push(poly([[48,28],[60,35],[67,47],[62,59],[49,65],[35,58],[30,46],[35,34]],'c','r'),ellipse(33,38+bob,30,18,'O','A'),ellipse(39,40+bob,18,15,'I','I'),ellipse(44,41+bob,8,13,'R','c'),line(47,43+bob,47,51+bob,'y',2));for(const s of [-1,1])p.cloak.push(poly([[48+s*12,42],[48+s*27,36],[48+s*31,48],[48+s*22,56]],'c'));
 }else if(e.biome===7){p.body.push(grid(30,34+bob,rows('OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO|OqqqqqqqqqqqqqqqWWqqqqqqqqqqqqqqqqqO|OqHHHHHHHHHHHHHqWWqHHHHHHHHHHHHHHqO|OqHHqqqqqqqqqqHqWWqHqqqqqqqqqqqHHqO|OqHHqHHHHHHHHHHqWWqHHHHHHHHHHqHHHqO|OqHHqqqqqqqqqqHqWWqHqqqqqqqqqqqHHqO|OqHHHHHHHHHHHHHqWWqHHHHHHHHHHHHHHqO|OqqqqqqqqqqqqqqqWWqqqqqqqqqqqqqqqqqO|OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO')));p.cloak.push(poly([[37,45],[25,55],[27,65],[39,56],[45,61],[51,54],[60,61],[69,52],[63,44]],'e','p'));p.equipment.push(poly([[49,31],[53,15],[61,10],[60,24],[52,36]],'s','L'),line(50,34,58,14,'m'));}
 else{
  p.cloak.push(poly([[38,42+bob],[30,53],[32,67],[41,64],[40,73],[48,66],[55,72],[58,60],[65,63],[61,47]],'n','D'));
  if(e.biome===9){for(const [x,y]of [[27,36],[43,26],[58,36]])p.body.push(grid(x,y+bob,HOOD));}
  else if(e.biome===3){p.body.push(grid(35,23+bob,rows('.........c.........|........cRc........|.......cRARc.......|......cRAyARc......|.....cRAyyyARc.....|....cRAyyyyyARc....|...cRAyyyyyyyARc...|..cRAyyyyyyyyyARc..|.cRAyyyyyyyyyyyARc.|cRAyyyyyyyyyyyyyARc|.cRAyyyyyyyyyyyARc.|..cRAyyyyyyyyyARc..|...ccccccccccccc...')),rect(34,44,28,16,'O','W'));for(let x=36;x<62;x+=5)p.equipment.push(rect(x,45,2,14,'s','m'));}
  else {p.body.push(grid(38,25+bob,e.biome===1?SEER_HEAD:HOOD));if(e.biome===5){p.equipment.push(poly([[40,31],[33,19],[34,9],[40,16],[43,27]],'J','k'),poly([[53,31],[62,18],[60,7],[56,18],[50,27]],'J','k'));}if(e.biome===8)for(const x of [36,46,56])p.equipment.push(poly([[x,26],[x+3,13],[x+6,26]],'O','A'));}
  p.body.push(grid(38,44+bob,rows('....sssssss....|..slLLLLmmmss..|.slLHHLLmmmmss.|sLLLLLmmmmmmssI|.sLLLmmOmmmssI.|..sLLmOAOmmssI.|..sLmmOOOmmssI.|..smmmmmmmmssI.|.smmmmmmmmmssI.|smmmmmmmmmmmssI|.smmmsssmmmssI.|..sssI..ssssI..')));
 }
 // The hood belongs to the robe, including the three separate choir necks.
 if(![6,7].includes(e.biome))p.body.unshift(line(48,36+bob,48,51+bob,'n',9));
 if(e.biome===3)p.body.push(poly([[40,37+bob],[43,32+bob],[46,36+bob],[48,30+bob],[52,37+bob],[56,34+bob],[56,44],[40,44]],'c','R'),poly([[44,41],[48,35+bob],[52,41]],'A','y'));
 if(e.biome===9)p.body.unshift(poly([[35,46],[37,51],[48,54],[63,50],[67,43],[58,44],[48,39]],'n','D'));
 if(!dead){const hands=state==='attack'?[[25,53],[23,47],[24,40],[36,38],[60,40],[67,47],[64,53],[27,56],[27,55]][i]:[27,55+bob];arms(p,[39,46+bob],hands);arms(p,[58,46+bob],[68,54+bob]);p.equipment.push(ellipse(hands[0]-3,hands[1]-3,7,7,'J','k'));}
 if(d==='n')p.body=p.body.map(o=>o.kind==='grid'&&o.y<44?grid(o.x,o.y,o.rows.map(r=>r.replaceAll('I','D').replaceAll('q','U').replaceAll('H','v'))):o);return ramp(e,p);
}
function flyer(e,d,state,i){const p=empty(),flap=[0,-3,-8,-11,-5,1,4,2][i%8],moth=e.biome===4,quill=e.biome===7,seraph=e.biome===8,bat=e.biome===9;
 for(const side of [-1,1]){
  if(moth)p.cloak.push(poly([[48+side*3,43],[48+side*16,28+flap],[48+side*35,23+flap],[48+side*41,35+flap],[48+side*36,47+flap],[48+side*39,57+flap],[48+side*25,66+flap],[48+side*8,57]],'s','m'),ellipse(48+side*27-5,34+flap,10,12,'Q','q'),ellipse(48+side*27-2,37+flap,4,6,'I','I'));
  else if(bat)p.cloak.push(poly([[48+side*5,46],[48+side*16,30+flap],[48+side*41,16+flap],[48+side*38,35+flap],[48+side*44,42+flap],[48+side*30,43+flap],[48+side*25,59+flap],[48+side*17,50+flap],[48+side*9,62]],'n','D'),line(48+side*8,46,48+side*40,19+flap,'m',2));
  else p.cloak.push(poly([[48+side*5,44],[48+side*18,32+flap],[48+side*39,22+flap],[48+side*42,28+flap],[48+side*30,45+flap],[48+side*34,46+flap],[48+side*24,59+flap],[48+side*21,48+flap],[48+side*15,66+flap],[48+side*9,56]],'s',seraph?'O':'L'),line(48+side*8,44,48+side*38,25+flap,'H'));
 }
 if(moth)p.body.push(grid(42,35,rows('...ssssss...|..sqQHHQss..|.sqQQHHQQss.|sqQQHHHHQQss|.sqQQHHQQssI|..sqQHHQssI.|..sqQHHQssI.|..sqQHHQssI.|..sqQHHQssI.|..sqQHHQssI.|...sqQQssI..|....ssssI...')),line(44,37,38,26,'Q'),line(51,37,57,26,'Q'));
 else if(quill)p.body.push(poly([[43,62],[41,37],[47,18],[55,9],[60,13],[57,34],[49,56]],'s','L'),line(44,61,56,14,'O'),grid(38,60,rows('..OOOOOOOO..|.OeeeeeeeeO.|OeppppppppeO|OeppppppppeO|.OeeeeeeeeO.|..OOOOOOOO..')));
 else if(bat)p.body.push(grid(37,31,rows('ss........ss|sLss....sslms|sLLmssssllmms|.sLLLLLmmmss.|..sLLmmmRssI.|..sLLRmmRssI.|...sLmmmssI..|...smmmssI...|..sIIIIIIssI.|.sIqIqIqImssI|..smmmmmmssI.|...sssssssI..')),grid(37,45,rows('....ssssss....|..slLLLmmmss..|.slLLLLmmmmss.|sLLLLmmmmmmssI|sLLLmmmmmmmssI|.sLLmmmmmmssI.|..smmmmmmssI..|...sssssssI...')));
 else {p.body.push(grid(38,30,seraph?GREAT_HELM:SEER_HEAD),grid(39,47,rows('...sssssss...|.slLLLLmmmss.|sLLLLLmmmmssI|sLLmmmmmmmssI|.sLmmmOmmssI.|..smmOAOssI..|..smmOOOssI..|..smmmmmssI..|.smmmmmmmssI.|smmmmmmmmmssI|.smmsssmmssI.|..ssI..sssI..')));if(seraph)p.cloak.push(ellipse(31,18,34,23,'O'));else p.equipment.push(grid(39,58,rows('..OOOOOO..|.OAyAAAOo.|OAyAAAAAOo|OAAAAAAAOo|.OOOOOOOo.|....OO....')));}
 if(moth){p.body.push(line(48,42,48,58,'q',6),line(46,44,46,55,'H',2));for(const y of [46,50,54])p.body.push(line(46,y,50,y,'s'));p.body.push(poly([[46,57],[48,61],[50,57]],'q','Q'));}
 if(!moth&&!quill)p.body.unshift(line(bat?44:48,41,bat?44:48,52,'s',8));
 if(seraph){arms(p,[39,48],[28,57]);p.equipment.push(...weaponOps('spear',[28,57],[20,26]));}
 if(state==='death'&&i>3){p.cloak=[];p.body=offsetOps(p.body,0,Math.min(14,i*2));}return ramp(e,p);
}
function brute(e,d,state,i){
 const p=empty(),bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:0;legs(p,[53,77],i,state,{top:72,heavy:true});
 if(e.id==='forge-2'){
  // A squat mason carved from masonry, with an anvil fused into his back.
  p.body.push(poly([[40,39+bob],[54,34+bob],[78,35+bob],[91,45+bob],[88,66],[78,79],[50,80],[37,64]],'s','m'),poly([[42,42+bob],[59,38+bob],[77,39+bob],[77,49],[58,52],[42,50]],'l','l'),grid(55,29+bob,rows('...ssssssssss...|.slLHHHLLLmmss..|sLLHHHLLLLmmmssI|sLLLIIILLIIImssI|sLLLIIILLIIImssI|.sLLLmmLmmmmssI.|..sLLmLLmmmssI..|...sssssssssI...')),line(64,38,64,46,'s',7),line(46,57,75,54,'s',3),poly([[57,48],[60,59],[55,67],[63,76]],'D'),line(75,59,83,68,'L'));
  p.cloak.push(poly([[43,35],[32,31],[30,23],[96,23],[99,29],[84,35],[82,48],[46,48]],'s','D'),line(32,23,95,23,'L'),line(35,27,92,27,'m'));
 }else if(e.id==='bones-4'){
  // A broad crawling ossuary, deliberately without a king's crown or mantle.
  p.body.push(poly([[44,45+bob],[53,38+bob],[77,39+bob],[91,48+bob],[87,65],[79,78],[50,79],[38,64]],'q','Q'),line(64,43,64,78,'q',6));
  for(let r=0;r<5;r++)p.body.push(line(46+r,50+r*5,81-r,49+r*5,'I',3),line(46+r,48+r*5,80-r,48+r*5,'H',2));
  for(const [x,y]of [[38,37],[52,31],[68,32],[81,40]])p.body.push(grid(x,y+bob,rows('..qqqqqq..|.qQHHHQqq.|qQHIIHIIQq|qQHIIHIIQq|.qQHHHHqqI|..qQHQqqI.|...qqqqI..')));
  p.cloak.push(poly([[36,47],[29,28],[35,30],[40,44]],'q','Q'),poly([[84,44],[95,27],[97,34],[91,48]],'q','Q'));
 }else if(e.biome===7){p.body.push(ellipse(41,34+bob,48,40,'O','o'),ellipse(47,40+bob,36,28,'s','D'),poly([[64,42+bob],[76,54+bob],[64,67+bob],[52,54+bob]],'L','H'),line(64,43+bob,64,66+bob,'O',2),line(64,23,64,42,'s',8),poly([[50,64],[78,64],[81,77],[73,81],[54,81],[48,74]],'s','m'));p.cloak.push(ellipse(30,29,70,51,'O'),line(33,32,97,74,'O'));p.body.push(grid(56,22,rows('..OOOOOOOOOOOO..|.OAyyyyyyyyAAOo.|OAAyyyyyyAAAAAOo|OAAAIIIIIIIIAAOo|OAAAIIIIIIIIAAOo|.OAAAAAAAAAAAOo.|..OOOOOOOOOOOo..')));}
 else {p.body.push(grid(50,48+bob,rows('....sssssssss....|..slLLLLLmmmss...|.slLLHHLLLLmmmss.|sLLLLLLLmmmmmmssI|sLLLLLmmmmmmmmssI|.sLLLmmmmmmmmssI.|..sLLmmmmmmmssI..|..sLmmmmmmmmssI..|..smmmmmmmmmssI..|..smmmmmmmmmssI..|.smmmmmmmmmmmssI.|smmmmmmmmmmmmmssI|.smmmmmmmmmmmssI.|..ssssssssssssI..')));p.cloak.push(grid(56,8,rows('.........OOOOOO.........|.......OOAyyyyAOO.......|.....OOAyyyyyyyAAOO.....|....OAyyyyyyyyyAAAOo....|...OAyyyyyyyyyAAAAAOo...|..OAyyyyyyyyyAAAAAAAOo..|.OAyyyyyyyyyAAAAAAAAAOo.|OAAAAAAAOOOOOOOOAAAAAAOo|OAAAAAAOIIIIIIIIOAAAAAOo|OAAAAAAOIIAAIIIIOAAAAAOo|OAAAAAAOIIAAIIIIOAAAAAOo|OAAAAAAOIIAAIIIIOAAAAAOo|.OAAAAAOIIAAIIIIOAAAAOo.|..OAAAAOIIAAIIIIOAAAOo..|...OOOOOOOOOOOOOOOOOo...|..OAAAAAAAAAAAAAAAAAOo..|.OAAAAAAAAAAAAAAAAAAAOo.|OOOOOOOOOOOOOOOOOOOOOOOo|..........OO............|..........AO............')));p.body.push(grid(49,38,rows('..qqqqqqq..|.qQHHHHQqq.|qQHIIHIIQqq|.qQHHHHQqqI|..qQHQHqqI.|...qqqqqI..')));}
 if(e.biome===9){p.body.unshift(poly([[52,45+bob],[76,45+bob],[82,55],[80,73],[76,80],[53,80],[47,68],[47,53]],'s','m'),line(64,38,64,51,'q',6));p.body=p.body.map(o=>o.kind==='grid'&&o.rows.length===6?{...o,x:59}:o);p.cloak.push(line(57,29,51,56,'W',4),line(75,29,79,56,'W',4),line(58,30,52,55,'O'),line(74,30,78,55,'O'));}
 const key=state==='attack'?[0,-4,-8,8,10,6,2,0,0][i]:0;arms(p,[45,51],[30-key,75],{bone:e.biome===4,heavy:true});arms(p,[83,51],[102+key,72],{bone:e.biome===4,heavy:true});p.equipment.push(...weaponOps(e.weapon,[30-key,75],[30-key,35],{boss:true}));return ramp(e,p);
}
function warrior(e,d,state,i){
 const p=e.family==='hollow'?hollowPose(d,state,i):heroDesign(e.family==='revenant'?'rogue':'knight',d,state,i);p.plume=[];
 if(state==='death')return ramp(e,p);
 const skull=e.family==='hollow'?p.body.find(o=>o.kind==='grid'&&o.rows.length===12&&o.y<44):null;
 const hx=p.headX??skull?.x??41,hy=p.headY??skull?.y??30,tx=p.torsoX??39,ty=p.torsoY??42;
 // Replace the old head completely. Adding a mask above a surviving skull made
 // two separate heads, which was the source of the detached-head appearance.
 p.body=p.body.filter(o=>!(o.kind==='grid'&&o.y<hy+7&&o.rows.length>=8));
 const mask=e.biome===0?rows('....OOOOOO....|..OOAyyyyAOO..|.OAyyyyyyAAOo.|OAAAAOOOOAAAAOo|OAAOIIIIIIOAAOo|OAAOIIIIIIOAAOo|.OAOIIIIIIOAOo.|..OOOOOOOOOOo..'):e.biome===1?rows('....qqqqqq....|..qQHHQQQqq...|.qQHHHHQQqqq..|qQHHIIHQIIQqq.|qQHHIIHQIIQqq.|.qQHHHHHQHQqqI|..qQHQHQHQQqqI|...qqQQQQqqqI.|....qqqqqqqI..'):e.biome===2?rows('.....WWWWWW.....|...WWoOAAAooWW..|..WoOAAAAOOooWW.|.WoOAAIAIAOOoWWI|WoOAAIIAIIAOoWWI|.WoOAAAAAAAOoWWI|..WoOOAAOOOoWWI.|...WoOOOOooWWI..|....WWWWWWWWI...'):e.biome===3?rows('...sssssssss...|.slLLLLLmmmss..|sLLOOOOOOOmmssI|sLLOIRIRIOmmssI|sLLOIRIRIOmmssI|sLLOIRIRIOmmssI|.sLOOOOOOOmssI.|..smmmmmmmmssI.|...sssssssssI..'):e.biome===4?rows('...ssssssssss...|.slLHHHHLLmmss..|sLLHHHHLLLmmssI.|sLHHIILHIIImssI.|sLHHIILHIIImssI.|sLLHLLLHLLLmssI.|.sLLHLLHLLLssI..|..sLLLHHLLssI...|...ssssssssI....'):e.biome===5?rows('.....jJJj.....|...jJkkKJJj...|..jJkKKkkJJj..|.jJkKIIkIIJJj.|jJkKKIIkIIkJJj|jJkKKkkKkkkJJj|.jJkkkkkkkkJJj|..jJkkkkkkJJjI|...jjJJJJjjI..'):e.biome===6?rows('...cc....cc...|..cRRc..cRRc..|.cRRRccccRRRc.|cRERRRRRRRRRrc|cRRRIIrrIIRrrc|.cRRIIrrIIRrcI|..cRRrrrrRrcI.|...cRrrrrrcI..|....ccccccI...'):e.biome===7?rows('.....eeeeee.....|...epzzzzppee...|..epzZZZZzppee..|.epzZZIIIZzppee.|epzZZZIIIZzzppeI|epzZZZZZZzzpppeI|.epzzzzzzzzzppeI|..epzzzzzzzppeI.|...eeeeeeeeeeI..'):e.biome===8?rows('O....O....O|OA..OAO..AO|.OAAAAAAAO.|..OAyAAAO..|.OAAIIAAAO.|OAAAIIAAAAO|.OAAAAAAAO.|..OOOOOOO..'):rows('.....ssssss.....|...slLHHHLLss...|..slHHHHHHLLss..|.slHHIIIIHHLLss.|sLHHHIIIIHHHLssI|sLHHHIIIIHHHLssI|.sLHHHLLHHHLLssI|..sLHHLLHHLLssI.|...sLHLLHLLssI..|....ssssssssI...');
 const cx=hx+6,headTop=hy+(e.family==='hollow'?-1:1),headBottom=headTop+(e.family==='hollow'?13:17),headWidth=e.family==='hollow'?7:e.family==='revenant'?9:9;
 p.body.unshift(line(cx,headBottom-4,cx,ty+8,e.family==='hollow'?'q':'s',e.family==='hollow'?4:8));
 p.body.push(poly([[cx-headWidth+2,headTop],[cx+headWidth-3,headTop],[cx+headWidth,headTop+5],[cx+headWidth-1,headBottom-3],[cx+3,headBottom],[cx-4,headBottom],[cx-headWidth,headBottom-5],[cx-headWidth,headTop+5]],e.family==='hollow'?'q':'n',e.family==='hollow'?'Q':e.family==='revenant'?'D':'m'),line(cx-headWidth+2,headTop+3,cx-headWidth+1,headBottom-5,e.family==='hollow'?'H':'L'));
 const face=d==='n'?mask.map(r=>r.replaceAll('I',e.family==='hollow'?'Q':'m').replaceAll('R','m').replaceAll('A','m')):mask;
 p.body.push(grid(cx-Math.floor(Math.max(...face.map(r=>r.length))/2),headTop+(e.family==='hollow'?2:5),face));
 p.neck={x:cx,y:headBottom-1};
 if(e.family==='hollow'){
  p.body=p.body.filter(o=>!(o.kind==='grid'&&o.rows.length===13&&o.y>=52));
  const cloth=e.biome===3?'D':e.biome===6?'c':e.biome===9?'n':e.biome===7?'e':'u';
  p.cloak.push(poly([[cx-6,43],[cx-11,53],[cx-8,63],[cx-1,59],[cx+3,65],[cx+11,60],[cx+9,45]],'n',cloth));
  if(e.biome===4)p.cloak.push(grid(cx+6,43,rows('..WWWW..|.WoOOww.|.WoOOww.|.WoOOww.|..WWWW..')),line(cx+6,45,cx+3,27,'W'),poly([[cx+3,25],[cx+2,31],[cx+6,30]],'q','Q'));
  if(e.biome===1)p.body.push(poly([[cx-7,43],[cx-12,35],[cx-3,38],[cx+2,44]],'q','Q'),line(cx+3,45,cx+9,53,'O'));
  if(e.biome===3)p.body.push(poly([[cx-6,44],[cx-12,39],[cx-15,43],[cx-10,51]],'s','D'),line(cx-10,41,cx-12,45,'R'));
  if(e.biome===6)for(const x of [cx-7,cx+7])p.body.push(poly([[x-3,43],[x,32],[x+3,43]],'W','q'));
 }
 if(e.family==='revenant'){
  p.equipment=[];
  if(e.biome===2){p.body.push(poly([[cx-9,headTop+4],[cx-12,headTop],[cx-8,headTop-5],[cx+7,headTop-5],[cx+12,headTop],[cx+9,headTop+4]],'W','o'),grid(cx-7,headTop-3,rows('.QQ..Q...QQ.|QQQ.QQQ.QQQQ|.Q..QQQ..QQ.')));}
  if(e.biome===4){p.body.push(poly([[cx+4,headTop+3],[cx+8,headTop+7],[cx+12,headTop+11],[cx+7,headTop+12],[cx+3,headTop+9]],'q','Q'));p.cloak.push(poly([[tx-3,ty],[tx-9,ty+16],[tx-4,ty+29],[tx+5,ty+23]],'e','p'));}
  if(e.biome===0||e.biome===5)p.equipment.push(grid(tx+1,ty+13,rows('...OO...|..OAAO..|.OAAAAO.|OAAAAAAO|OOOOOOOO|...OO...')));
  if(e.biome===8)p.body.push(poly([[cx-9,headTop+5],[cx-10,headTop-1],[cx-6,headTop+1],[cx-2,headTop-7],[cx+1,headTop],[cx+8,headTop-5],[cx+7,headTop+5]],'O','o'));
 }
 if(e.family==='knight'){
  const sh=heroPose(d,state,i).equipment.find(o=>o.kind==='grid'),h=sh?[sh.x+2,sh.y+2]:[61,50];p.offhand=h;
  p.equipment=[];const shield=e.biome===0?ellipse(h[0]-10,h[1]-6,22,24,'q','Q'):e.biome===2?poly([[h[0],h[1]-11],[h[0]+12,h[1]-3],[h[0]+7,h[1]+15],[h[0],h[1]+23],[h[0]-9,h[1]+10],[h[0]-11,h[1]-2]],'W','o'):e.biome===4?rect(h[0]-10,h[1]-8,21,30,'s','m'):e.biome===5?poly([[h[0],h[1]-14],[h[0]+12,h[1]-3],[h[0]+6,h[1]+17],[h[0],h[1]+25],[h[0]-7,h[1]+13],[h[0]-11,h[1]-3]],'j','J'):e.biome===8?poly([[h[0]-13,h[1]-7],[h[0]+13,h[1]-7],[h[0]+9,h[1]+10],[h[0],h[1]+24],[h[0]-9,h[1]+10]],'O','o'):poly([[h[0]-10,h[1]-5],[h[0]+9,h[1]-5],[h[0]+12,h[1]+10],[h[0]-2,h[1]+20],[h[0]-11,h[1]+9]],'s','m');p.equipment.push(shield,line(h[0],h[1]-3,h[0],h[1]+12,e.biome===0?'I':'A',2));
 }
 if(e.biome===2){p.cloak.push(poly([[tx-3,ty+3],[tx-9,ty+12],[tx-5,ty+21],[tx-11,ty+28],[tx+3,ty+26]],'W','g'));for(const x of [tx-1,tx+15])p.body.push(poly([[x,ty+4],[x-6,ty-4],[x+3,ty-7],[x+6,ty+3]],'W','o'));}
 if(e.biome===3)for(const x of [tx-2,tx+17])p.equipment.push(poly([[x,ty+1],[x-4,ty+11],[x+1,ty+19],[x-2,ty+29]],'O'));
 if(e.biome===5)p.body.push(poly([[hx-1,hy],[hx-4,hy-15],[hx+1,hy-21],[hx+4,hy-4]],'j','J'),poly([[hx+12,hy],[hx+15,hy-13],[hx+18,hy-19],[hx+18,hy+1]],'j','k'));
 if(e.biome===7)p.cloak.push(grid(tx+15,ty-3,rows('OOOOOOOO|OqqqqqqO|OqHHHHqO|OqHqqHqO|OqHHHHqO|OqqqqqqO|OOOOOOOO')));
 if(e.biome===8)p.cloak.push(ellipse(hx-7,hy-11,31,30,'O'));
 if(p.hand&&p.tip)p.equipment.push(...weaponOps(e.weapon,p.hand,p.tip),gauntlet(...p.hand,e.family==='hollow'));
 if(!['sword','axe','sickle','club','hammer'].includes(e.weapon))p.effects=[];
 return ramp(e,p);
}
export function enemyDesign(e,d,state,i){
 if(e.boss)return bossDesign(e,d,state,i);
 if(e.family==='hound')return beast(e,d,state,i);
 if(e.family==='crawler')return crawler(e,d,state,i);
 if(e.family==='wisp')return caster(e,d,state,i);
 if(e.family==='harpy')return flyer(e,d,state,i);
 if(e.family==='brute')return brute(e,d,state,i);
 return warrior(e,d,state,i);
}
