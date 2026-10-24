import {P,grid,line,poly} from './art-lib.mjs';
import {heroDesign as originalHero,enemyDesign as originalEnemy} from './campaign-distinct-design.mjs';
import {recolorOps,allLayers} from './campaign-art-design.mjs';
import {BIOMES} from '../game/content.mjs';

Object.assign(P,{'<':'#e4e7d5','>':'#96acb8','[':'#596b80',']':'#343b54','{':'#181c2d','}':'#bc9c69','^':'#f1d797'});
const rr=s=>s.split('|');
function trimGrid(op,{gold=false,organic=false,color=P.A,mid=P.m}={}){
 if(op.kind!=='grid'||op.rows.length<10||Math.max(...op.rows.map(r=>r.length))<15)return op;
 const rows=[...op.rows],w=Math.max(...rows.map(r=>r.length)),legend={...op.legend,'+':color,'=':mid};
 if(gold){for(const y of [5,13])if(rows[y]){const row=rows[y].split('');for(const x of [Math.round(w*.28),Math.round(w*.72)])if(/[mLlsD]/.test(row[x]??''))row[x]='+';rows[y]=row.join('');}}
 if(organic){for(const y of [4,9,14,19])if(rows[y]){const row=rows[y].split(''),x=Math.round(w*(y%2?.3:.37));if(/[mLlHqQ]/.test(row[x]??'')&&/[mLlHqQ]/.test(row[x+1]??'')){row[x]='+';row[x+1]='=';}rows[y]=row.join('');}}
 return {...op,rows,legend};
}
export function heroDesign(id,d,state,i){const p=originalHero(id,d,state,i);
 if(id==='knight'){
  for(const k of allLayers)p[k]=recolorOps(p[k]??[],{[P.x]:P['{'],[P.X]:P[']'],[P.M]:P['['],[P.N]:P['>'],[P.C]:P['<']});
  if(!['roll','death'].includes(state)){
   p.body=p.body.map(op=>{if(op.kind==='grid'&&op.rows.length===5&&op.y>=60&&op.rows[0].length<=10)return grid(op.x,op.y,rr('..{{{{{..|.{[>>>[{.|{[>[[[[[{|{[[[]]][{|IIIIIIIII'));return op.y>33?trimGrid(op,{gold:true,color:P.O,mid:P.m}):op;});
   if(p.torsoX!==undefined){const x=p.torsoX,y=p.torsoY;p.equipment.push(line(x+6,y+6,x+10,y+8,'<'),line(x+6,y+7,x+9,y+9,'>'),grid(x+7,y+17,rr('O.O.O.O|}O}O}O}|.}.}.}.')));}
  }
 }else if(id==='rogue'){
  for(const k of allLayers)p[k]=recolorOps(p[k]??[],{[P.U]:'#193e3b',[P.V]:'#4d8675',[P.J]:'#75aa91',[P.q]:'#cfb68a'});
  if(p.torsoX!==undefined&&!['roll','death'].includes(state)){const x=p.torsoX,y=p.torsoY;p.equipment.push(grid(x+5,y+5,rr('W...W|oW.Wo|.oWo.|..O..')),line(x+6,y+16,x+14,y+16,'O'));}
 }else if(p.torsoX!==undefined&&!['roll','death'].includes(state)){
  const x=p.torsoX,y=p.torsoY;p.equipment.push(grid(x+1,y+7,rr('..}..|.}^}.|}.}.}|..}..')),grid(x+12,y+7,rr('..}..|.}^}.|}.}.}|..}..')),line(x+4,y+28,x+8,y+29,'}'),line(x+13,y+29,x+17,y+28,'}'));
 }
 if(state.startsWith('attack')&&i>=3&&i<=5&&p.tip&&id!=='seer'){
  const old=originalHero(id,d,state,Math.max(0,i-1)),t=p.tip,h=p.hand;
  if(old.tip&&h)p.effects.push(poly([[old.tip[0],old.tip[1]],[t[0],t[1]],[h[0]+(t[0]-h[0])*.72,h[1]+(t[1]-h[1])*.72]],id==='knight'?'>':'J'),line(t[0]-1,t[1],t[0]+1,t[1],id==='knight'?'<':'k'));
 }
 return p;
}
export function enemyDesign(e,d,state,i){const p=originalEnemy(e,d,state,i),b=BIOMES[e.biome],organic=['hound','crawler','harpy','wisp','heart'].includes(e.family)||e.boss&&[1,2,6,9].includes(e.biome);
 for(const k of allLayers)p[k]=(p[k]??[]).map(op=>op.kind==='grid'&&op.y>=35?trimGrid(op,{gold:!organic&&(e.family==='knight'||e.family==='brute'||e.boss),organic,color:organic?b.palette[3]:b.palette[4],mid:b.palette[2]}):op);
 if(p.neck&&!['death','hurt'].includes(state)&&!organic){const x=p.neck.x,y=(p.torsoY??42)+10;if(e.ornament==='chain')p.equipment.push(grid(x-5,y,rr('OO.OO.OO|O.OO.O.O|.O..O.O.')));else if(e.weapon==='spear')p.equipment.push(line(x-5,y+1,x+4,y+3,b.palette[3]),grid(x-1,y+4,rr('.O.|OAO|.O.')));}
 return p;
}
