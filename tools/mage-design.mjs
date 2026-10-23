import {P,grid,line,poly,ellipse} from './art-lib.mjs';
import {heroPose,offsetOps} from './actor-design-v2.mjs';
// Cloth, pewter and aged skin have separate ramps. These are pixel clusters,
// keyed at their native resolution; the sorcerer never borrows a knight cel.
Object.assign(P,{'~':'#111726','!':'#242b40','@':'#3b4560','%':'#59657b','&':'#8d9aab','*':'#c5cec7','?':'#c3a78b',':':'#816b63',';':'#a88d76'});
const rows=s=>s.split('|');
const HOODS={
 s:rows('........~~~.........|......~~!!!~~.......|.....~!@@@@!!~......|....~!@%%%@@!!~.....|...~!@%&&%%@@!!~....|..~!@%&&%%@@@!!!~...|.~!@%&&%@@@!!!!!!!~.|~!@%&&%@@~~~~~~~~!~.|~!@%&%@@~:;;?;;:~!~.|~!@%%@@~:;??*?;:~!!~|~!@%@@~:;?I;I?;:~!!~|.~!@@@~:;??:??;:~!!~|..~!@@~:;?:;?;:~!!!~|...~!@~:*&&&*;:~!!!~|....~!~:*&**&*~!!!~.|....~!~:*&&&*~!!!~..|.....~!~:*&*~!!!~...|......~!~:*~!!~.....|.......~!!!!~.......|........~~~~........'),
 n:rows('........~~~.........|......~~!!!~~.......|.....~!@@@@!!~......|....~!@%%%@@!!~.....|...~!@%&&%%@@!!~....|..~!@%&&%%@@@!!!~...|.~!@%&&%@@@@!!!!!~..|~!@%&&%@@@@@@!!!!~..|~!@%&%@@@@@@@!!!!!~.|~!@%%@@@@@@@@!!!!!~.|~!@%@@@@@@@@@!!!!!~.|.~!@@@@@@@%@@!!!!!~.|..~!@@@@@@%@@!!!!~..|...~!@@@@@%@@!!!!~..|....~!@@@@%@@!!!~...|....~!@@@@%@@!!!~...|.....~!@@@%@@!!~....|......~!@@@@!!~.....|.......~!!!!~.......|........~~~~........'),
 e:rows('.......~~~~.........|.....~~!!!!~~.......|....~!@@@@!!!~......|...~!@%%%@@!!!~.....|..~!@%&&%%@@!!!~....|.~!@%&&%%@@@!!!!~...|~!@%&&%@@@@!!!!!~...|~!@%&%@@@~~~~!!!~...|~!@%%@@@~;;?;:~!!~..|~!@%@@@~;??*?;:~!~..|.~!@@@@~;?I??;:~!~..|..~!@@@~;???:;?;~...|...~!@@~;??;:~~.....|....~!@~:*&&;:~.....|....~!@~:*&&&*~.....|.....~!~:*&**~......|......~!~:*&~.......|.......~!!!~........|........~~~.........'),
 w:rows('.........~~~~.......|.......~~!!!!~~.....|......~!@@@@!!!~....|.....~!@%%%@@!!!~...|....~!@%&&%%@@!!!~..|...~!@%&&%%@@@!!!!~.|...~!@%&&%@@@@!!!!!~|...~!!!~~~~@@@%&%@!~|..~!!~:;?;;~@@@%%@!~|..~!~:;?*??;~@@@%@!~|..~!~:;??I?;~@@@@@!~|...~;?;:???;~@@@!~..|.....~~:;??;~@@!~...|.....~:;&*;:~@!~....|.....~*&&&*:~@!~....|......~**&*:~!~.....|.......~&*:~!~......|........~!!!~.......|.........~~~........')
};
function blank(){return {cloak:[],plume:[],body:[],arms:[],equipment:[],effects:[],feet:[]};}
function boot(x,y,d){return [line(x,58,x+(d==='w'?-1:1),y-4,'~',7),line(x-1,59,x-1,y-4,'!',5),grid(x-4,y-4,rows('..WWWW...|.WooWWW..|WoOOooWWW|WoooooWWI|IIIIIIIII')),line(x-2,y-4,x+2,y-4,'O')];}
function sleeve(p,shoulder,elbow,hand,far=false){
 const [sx,sy]=shoulder.map(Math.round),[ex,ey]=elbow.map(Math.round),[hx,hy]=hand.map(Math.round);
 p.arms.push(poly([[sx-4,sy-3],[sx+5,sy-3],[ex+4,ey-3],[hx+5,hy-4],[hx+5,hy+2],[hx-4,hy+4],[ex-5,ey+3],[sx-5,sy+4]],'~',far?'!':'@'),line(sx-2,sy-2,ex-2,ey-1,far?'@':'%',2),line(ex-2,ey-1,hx-2,hy-1,far?'%':'&'),line(hx-4,hy-3,hx+4,hy-3,'O',2),line(hx-3,hy-4,hx+3,hy-4,'A'));
 p.equipment.push(grid(hx-2,hy-1,rows('.WWW.|WoOOw|WoOow|.WwwI|..II.')));
}
function staff(p,h,t){
 const dx=t[0]-h[0],dy=t[1]-h[1],len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len,b=[Math.round(h[0]-ux*19),Math.min(74,Math.round(h[1]-uy*19))];
 p.equipment.unshift(line(...b,...t,'~',5),line(...b,...t,'W',3),line(b[0]-1,b[1],t[0]-1,t[1],'O'),poly([[t[0],t[1]+4],[t[0]-7,t[1]-2],[t[0]-6,t[1]-9],[t[0]-1,t[1]-13],[t[0]+5,t[1]-10],[t[0]+7,t[1]-5],[t[0]+3,t[1]+1]],'W','O'),poly([[t[0]-5,t[1]-3],[t[0]-4,t[1]-8],[t[0],t[1]-11],[t[0]+4,t[1]-8],[t[0]+5,t[1]-4]],'A'),poly([[t[0],t[1]-10],[t[0]+3,t[1]-5],[t[0],t[1]],[t[0]-3,t[1]-5]],'j','J'),line(t[0],t[1]-8,t[0]-1,t[1]-4,'K'),line(b[0]-2,b[1]-3,b[0]+2,b[1]-3,'O',2));
}
function grimoire(p,h,d){const x=h[0]-5,y=h[1]-4;
 p.equipment.push(grid(x,y,rows('..WWWWWWWWW..|.WOAAAAAAAOW.|WOqHHHHHHqOWI|WOqHqqqqHqOWI|WOqHHqqHHqOWI|WOqHqqqqHqOWI|WOqHHHHHHqOWI|.WOAAAAAAAOWI|..WWWWWWWWWII')),line(x+6,y+2,x+6,y+6,'W'),poly([[x+9,y+6],[x+12,y+9],[x+10,y+13]],'O'));
}
function rollPose(d,i){
 const p=blank(),keys=[{x:39,y:44,h:27,head:[39,38]},{x:34,y:52,h:21,head:[33,53]},{x:34,y:50,h:23,head:[44,50]},{x:33,y:52,h:21,head:[49,54]},{x:36,y:47,h:25,head:[46,45]},{x:39,y:43,h:28,head:[40,34]}],k=keys[i];
 p.body.push(poly([[k.x+5,k.y],[k.x+20,k.y],[k.x+27,k.y+9],[k.x+28,k.y+k.h-4],[k.x+17,k.y+k.h],[k.x+3,k.y+k.h-1],[k.x-4,k.y+12]],'~','@'),poly([[k.x+4,k.y+3],[k.x+11,k.y+1],[k.x+21,k.y+11],[k.x+20,k.y+k.h-2],[k.x+8,k.y+k.h-3]],'%','%'),line(k.x+5,k.y+k.h-4,k.x+23,k.y+k.h-5,'O'));
 if(i===0||i===5){p.body.push(grid(...k.head,HOODS[d]));p.body.push(...boot(40,75,d),...boot(60,75,d));}
 else p.body.push(grid(k.head[0],k.head[1],rows('....~~~~~~~....|..~~!@@@@!!~~..|.~!@%%%@@@!!!~.|~!@%&&%@@@@!!!~|~!@%&%@@~~~~!!~|~!@%%@@~;?;~!~|.~!@@@~:*&*~!~|..~!@@~:*&*~!~|...~!@~:*&~!~.|....~!!!!!~...|.....~~~~~....')));
 p.equipment.push(line(28,69,69,72,'W',3),line(29,68,68,71,'O'),poly([[29,67],[25,62],[20,66],[23,71]],'j','J'));p.feet=[{x:49,y:75}];return p;
}
function fallen(d,i){
 const p=blank(),yy=[54,59,64,67,69,70,70][i];
 if(i<3){const q=magePose(d,'block',0),drop=[4,9,13][i];q.body=q.body.filter(o=>!(o.kind==='grid'&&o.y>=67));q.body=q.body.map(o=>{if(o.kind==='grid')return{...o,y:Math.min(o.y+drop,75-o.rows.length)};if(o.points)return{...o,points:o.points.map(v=>({x:v.x,y:Math.min(73,v.y+drop)}))};if(o.from)return{...o,from:{...o.from,y:Math.min(72,o.from.y+drop)},to:{...o.to,y:Math.min(73,o.to.y+drop)}};return o;});q.body.unshift(...boot(39,75,d),...boot(60,75,d));q.arms=offsetOps(q.arms,-3,Math.min(7,drop));q.equipment=[];q.effects=[];q.cloak=q.cloak.map(o=>o.points?{...o,points:o.points.map(v=>({x:v.x,y:Math.min(74,v.y+drop)}))}:o);q.feet=[{x:39,y:75},{x:60,y:75}];return q;}
 p.cloak.push(poly([[23,yy-8],[46,yy-12],[67,yy-5],[77,yy],[69,75],[40,74],[21,70]],'~','!'));
 p.body.push(grid(22,yy-10,rows('....~~~~~~.....|..~~!@@@@!~~...|.~!@%&&%@@!!~..|~!@%&%~~!!@@!~.|~!@%%~;?;~@@!~.|.~!@@~:*&*~@!~.|..~!@~:*&*~!!~..|...~!!!!!~~~....')),poly([[39,yy-6],[57,yy-5],[67,yy],[75,yy-1],[77,73],[61,75],[47,73],[37,71]],'~','@'),line(42,yy-4,59,yy-3,'%',2),line(39,yy,66,yy+1,'O'));
 staff(p,[49,74],[20,72]);p.equipment.push(grid(64,68,rows('WWWWWWWW|WOqqqqOW|WOqHHqOW|WOqqqqOW|WWWWWWWW')));p.feet=[{x:70,y:75}];return p;
}
export function magePose(d,state,i){
 if(state==='roll')return rollPose(d,i);
 if(state==='death')return fallen(d,i);
 const ref=heroPose(d,state,i),p=blank(),dx=(ref.torsoX??38)-38,bob=(ref.torsoY??32)-32,attack=state.startsWith('attack'),cx=48+dx;
 p.feet=ref.feet;for(const foot of p.feet)p.body.push(...boot(foot.x,foot.y,d));
 const swing=state==='walk'?[0,1,2,1,0,-1,-2,-1][i]:0;
 p.cloak.push(poly([[cx-10,37+bob],[cx+12,37+bob],[cx+18+swing,64],[cx+17+swing,71],[cx+7,68],[cx+1,73],[cx-6,68],[cx-17+swing,71],[cx-15,58]],'~','!'),line(cx-11,45+bob,cx-14+swing,67,'@',2));
 p.body.push(poly([[cx-9,37+bob],[cx+10,37+bob],[cx+12,48+bob],[cx+10,57],[cx+15+swing,69],[cx+6,72],[cx+1,67],[cx-6,71],[cx-13+swing,68],[cx-9,55]],'~','@'),poly([[cx-6,42+bob],[cx+4,42+bob],[cx+5,54],[cx+7,69],[cx+1,67],[cx-4,70],[cx-5,54]],'b','c'),line(cx-8,45+bob,cx-10+swing,65,'%',2),line(cx+9,48+bob,cx+12+swing,66,'!'),line(cx-11+swing,68,cx-6,69,'O'),line(cx+6,70,cx+13+swing,68,'O'),line(cx-8,51+bob,cx+9,51+bob,'W',4),line(cx-8,50+bob,cx+9,50+bob,'O'),grid(cx-2,50+bob,rows('OOOOO|OAyyO|OAyAO|OOOOO')),line(cx+9,52,cx+12,62,'O'),grid(cx+9,61,rows('.OO.|OAAO|OAOo|.Oo.|..O.')));
 // A continuous neck is under the cowl and the clasped shoulder mantle.
 p.body.push(line(cx,31+bob,cx,42+bob,'!',9),poly([[cx-9,35+bob],[cx-17,39+bob],[cx-13,45+bob],[cx-4,43+bob],[cx,39+bob],[cx+6,43+bob],[cx+15,44+bob],[cx+16,39+bob],[cx+8,35+bob]],'~','%'),line(cx-14,39+bob,cx-5,41+bob,'&'),line(cx+6,40+bob,cx+13,41+bob,'&'),grid(cx-3,39+bob,rows('.OOO.|OAyyO|.OAO.|..O..')));
 const hands={s:[[29,52],[65,51]],n:[[65,50],[32,51]],e:[[64,51],[43,49]],w:[[31,51],[55,50]]}[d].map(a=>[a[0]+dx,a[1]+bob]);
 const tips={s:[25,25],n:[69,23],e:[69,25],w:[26,25]};let h=hands[0],t=[tips[d][0]+dx,tips[d][1]+bob],oh=hands[1];
 if(attack){const k=[0,-2,-5,2,5,4,2,1,0][i],rise=[0,-2,-4,-1,0,0,1,1,0][i],sg=d==='w'?-1:1;h=[h[0]+k*sg,h[1]+rise];t=[t[0]+k*sg,t[1]+rise];oh=[oh[0]+(d==='w'?-1:1)*[0,0,1,7,10,8,4,1,0][i],oh[1]+[0,-2,-5,-7,-5,-4,-2,0,0][i]];}
 const sh1=d==='w'?[38+dx,39+bob]:d==='n'?[58+dx,39+bob]:[d==='e'?55+dx:37+dx,39+bob],sh2=[d==='n'?37+dx:d==='e'?43+dx:58+dx,40+bob];
 sleeve(p,sh2,[(sh2[0]+oh[0])/2,46+bob],oh,true);sleeve(p,sh1,[(sh1[0]+h[0])/2-2,46+bob],h);
 p.body.push(grid(cx-10,17+bob,HOODS[d]));staff(p,h,t);
 if(attack&&i>=2&&i<=6){p.equipment.push(ellipse(oh[0]-5,oh[1]-7,11,11,'j','J'),poly([[oh[0],oh[1]-8],[oh[0]+3,oh[1]-3],[oh[0],oh[1]+1],[oh[0]-3,oh[1]-3]],'k','K'));if(i===3||i===4)p.effects.push(ellipse(oh[0]-9,oh[1]-11,19,19,'J'),line(oh[0]-11,oh[1]-3,oh[0]+11,oh[1]-3,'k'));}
 else grimoire(p,oh,d);
 p.hand=h;p.tip=t;p.headX=cx-10;p.headY=17+bob;p.torsoX=cx-10;p.torsoY=37+bob;p.offhand=oh;p.neck={x:cx,y:35+bob};return p;
}
