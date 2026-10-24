import {P,grid,line,rect,poly,ellipse} from './art-lib.mjs';
import {enemyDesign as previousEnemy} from './descent-actors.mjs';
import {BIOMES} from '../game/content.mjs';
const rr=s=>s.split('|');
export const CREATURE_SIGNATURES={
 'abbey-0':'stooped bell carrier with a chain mantle','abbey-1':'upright narrow pike guard with a split pennant','abbey-2':'wax-draped candle acolyte','abbey-3':'low rag-maned gutter hound','abbey-4':'broad fan collar and hymn scrolls',
 'tides-0':'waterlogged spear soldier with a ragged net','tides-1':'serpentine shade with a long eel tail','tides-2':'bloated leech brood growing from a human host','tides-3':'wide flat crab with oversized jointed pincers','tides-4':'long hanging widow legs and a lantern abdomen',
 'thorns-0':'thorn pauldrons and a bark shoulder fan','thorns-1':'lean quadruped with a hooked root tail','thorns-2':'mushroom canopy monk with dangling spores','thorns-3':'tall grave hart with a branching antler crown','thorns-4':'six-legged briar spider with a spindle abdomen',
 'forge-0':'furnace slave with a heavy slag basket','forge-1':'armored coal hound with dorsal exhaust stacks','forge-2':'box-shouldered mason carrying a great hammer','forge-3':'flame cage wraith with an iron lower body','forge-4':'chain-bound warden with hooked back links',
 'bones-0':'skeletal archer with a long arrow quiver','bones-1':'hunched scribe with a book spine and scroll bustle','bones-2':'slab-armored tomb sentinel with a rib collar','bones-3':'wide mourning moth with veined eye wings','bones-4':'massive bone colossus with layered rib shoulders',
 'frost-0':'angular frozen spear guard with ice shoulder fins','frost-1':'radial ice spider with eight needle legs','frost-2':'heavy fur warg with a white ridge mane','frost-3':'caged seer hanging between ice shards','frost-4':'slender runner with trailing frozen bells',
 'blood-0':'bent penitent with a cage on its back','blood-1':'spiked flayer with flayed leather shoulder fans','blood-2':'crimson oracle with a suspended vein halo','blood-3':'long marrow crawler with a segmented bone tail','blood-4':'limbless vein leech with pulsing side sacs',
 'astral-0':'robed gazer with a crescent instrument','astral-1':'ink shade with dripping calligraphic tendrils','astral-2':'faceted lunar construct with a floating shoulder ring','astral-3':'long feather quill with vaned ink wings','astral-4':'star scribe with a rigid scroll cylinder',
 'gilded-0':'sunfallen knight with a broken ray crest','gilded-1':'lean duelist with a long split royal sash','gilded-2':'locust with folded wings and tall jumping legs','gilded-3':'regent shade with a hollow royal canopy','gilded-4':'broken-winged seraph with uneven rays',
 'abyss-0':'hollow husk with an open rib silhouette','abyss-1':'three-faced choir on a connected sinew frame','abyss-2':'low void stalker with twin hooked tails','abyss-3':'bell bearer with an enormous suspended bell frame','abyss-4':'four-wing ember devourer with a split crown'
};
function bough(p,x,y,side,color,bright,spread=22){p.cloak.push(poly([[x,y],[x+side*4,y-11],[x+side*10,y-19],[x+side*spread,y-24]],color),poly([[x+side*7,y-16],[x+side*3,y-28],[x+side*7,y-34]],bright),poly([[x+side*13,y-20],[x+side*20,y-16],[x+side*(spread+5),y-18]],color));}
function chain(p,x,y,height){for(let j=0;j<height;j+=5)p.equipment.push(ellipse(x+(j%10?1:0),y+j,4,6,'W'),line(x+1,y+j,x+1,y+j+2,'O'));}
export function enemyDesign(e,d,state,i){
 const gait=state==='walk'&&e.family==='crawler'?[0,2,4,6,1,3,5,7][i]:state==='walk'&&e.behavior==='archer'?[0,1,1,3,4,5,5,7][i]:i,p=previousEnemy(e,d,state,gait),b=BIOMES[e.biome],color=b.palette[2],bright=b.palette[3],back=d==='n',left=d==='w',sign=left?-1:1,dead=state==='death',bob=state==='walk'?[0,1,0,-1,0,1,0,-1][i]:state==='idle'?[0,-1,0,1][i%4]:0;
 if(dead)return p;
 const cx=e.boss||e.family==='brute'?64:48,cy=e.boss||e.family==='brute'?60:49,ground=e.boss||e.family==='brute'?95:75,sway=state==='walk'?[-2,0,2,3,2,0,-2,-3][i]:0;
 const backLayer=p.cloak??(p.cloak=[]),orn=p.equipment??(p.equipment=[]);
 if(e.boss){if(e.biome===0)for(const s of [-1,1])chain(p,cx+s*22,44+bob,30);if(e.biome===2)for(const s of [-1,1])bough(p,cx+s*18,49+bob,s,'W','O',25);if(e.biome===3)for(const x of [31,87])backLayer.push(rect(x,41,12,25,'I','m'),line(x+2,43,x+2,61,'L'));if(e.biome===4)for(const s of [-1,1])backLayer.push(poly([[cx+s*12,48],[cx+s*38,39],[cx+s*46,54],[cx+s*24,59]],'s','q'));if(e.biome===5)backLayer.push(poly([[43,57],[31,43],[35,28],[46,48]],'j','J'));if(e.biome===7)backLayer.push(ellipse(24,5,80,84,'O'));if(e.biome===8)for(const x of [41,64,87])backLayer.push(poly([[x,31],[x+2,8],[x+9,28]],'O','A'));if(e.biome===9)for(const s of [-1,1])backLayer.push(poly([[cx+s*18,43],[cx+s*42,21],[cx+s*51,32],[cx+s*35,45]],color,bright));return p;}
 if(e.id==='abbey-0'){for(const s of [-1,1])chain(p,48+s*12,40+bob,20);backLayer.push(poly([[33,46],[27,42],[24,50],[29,57]],'W','o'));}
 if(e.id==='abbey-1'){backLayer.push(line(56,42,70,22,'W',2),poly([[68,22],[83,25],[75,31],[80,36],[66,30]],'c','r'));}
 if(e.id==='abbey-2'){backLayer.push(poly([[31,40],[25,48],[29,64],[38,67],[35,48]],'q','Q'),poly([[61,39],[72,47],[68,62],[59,66],[62,46]],'q','Q'));for(const x of [29,66])orn.push(rect(x,37+bob,3,11,'q','H'),poly([[x,36+bob],[x-2,32+bob],[x+1,27+bob],[x+3,33+bob]],'O','A'));}
 if(e.id==='abbey-3'){for(let j=0;j<5;j++)backLayer.push(poly([[34+j*5,46],[35+j*5,36+j%2*3],[41+j*5,48]],'w','W'));backLayer.push(poly([[28,56],[18,54],[12,62],[20,66],[27,62]],'s',color));}
 if(e.id==='abbey-4'){backLayer.push(poly([[32,46],[25,31],[37,36],[43,30],[49,37],[60,31],[69,45],[62,53]],'O',color));for(const x of [32,62])orn.push(poly([[x,51],[x+7,52],[x+5,68],[x-2,68]],'W','q'),line(x+1,54,x+4,54,'o'));}
 if(e.id==='tides-0'){backLayer.push(poly([[32,42],[23,56],[30,71],[37,59]],'s',color));for(let n=0;n<4;n++)backLayer.push(line(25+n*3,50,29+n*3,65,bright));}
 if(e.id==='tides-1'){backLayer.push(poly([[40,55],[31,60],[30+sway,68],[39+sway,74],[62+sway,74],[71,67],[65,64],[61,69],[43,68],[39,64],[45,60]],'s',color),line(38,65,44,71,bright));}
 if(e.id==='tides-2'){backLayer.push(ellipse(23,43+bob,26,25,'s',color));for(let j=0;j<4;j++)backLayer.push(ellipse(24+j*3,47+bob,10,7,color,bright));}
 if(e.id==='tides-3'){for(const s of [-1,1]){const y=state==='attack'?[51,48,45,40,42,47,51,53,53][i]:54+bob;orn.push(line(48+s*18,56,48+s*31,y,'s',6),line(48+s*18,55,48+s*31,y,color,4),poly([[48+s*29,y-2],[48+s*39,y-13],[48+s*42,y-2],[48+s*34,y+5]],'s',bright),poly([[48+s*32,y+3],[48+s*42,y+3],[48+s*38,y+10]],'s',color));}}
 if(e.id==='tides-4'){for(const s of [-1,1])for(let j=0;j<2;j++)backLayer.push(poly([[48+s*11,48],[48+s*(20+j*7),59+bob],[48+s*(13+j*9),73],[48+s*(25+j*7),75]],'s'));orn.push(ellipse(39,55,18,18,'O','W'),rect(44,58,8,11,'j','J'));}
 if(e.id==='thorns-0'){for(const s of [-1,1])bough(p,48+s*10,45,s,'W','G',16);}
 if(e.id==='thorns-1'){backLayer.push(poly([[28,54],[17,48],[12,38],[17,30],[16,42],[23,46],[31,48]],'W','g'));}
 if(e.id==='thorns-2'){backLayer.push(poly([[25,31],[29,24],[39,20],[56,20],[69,25],[73,32]],'W','g'),poly([[27,31],[49,35],[71,31]],'G'));for(const x of [29,64])orn.push(line(x,32,x-1,49,'g'),ellipse(x-3,47,6,6,'g','q'));}
 if(e.id==='thorns-3'){for(const s of [-1,1])bough(p,48+s*5,33,s,'W','O',24);}
 if(e.id==='thorns-4'){for(const s of [-1,1])for(let j=0;j<3;j++)backLayer.push(poly([[48+s*11,51],[48+s*(25+j*3),43+j*5+bob],[48+s*(31+j*3),63+j*4]],'W'),poly([[48+s*10,52],[48+s*(25+j*3),44+j*5+bob]],'G'));}
 if(e.id==='forge-0'){backLayer.push(poly([[29,42],[38,43],[38,63],[26,61]],'I','W'));for(let y=46;y<61;y+=5)backLayer.push(line(28,y,37,y,'O'));}
 if(e.id==='forge-1'){for(let j=0;j<3;j++)backLayer.push(rect(34+j*9,34-j%2*5,6,21,'I','m'),line(35+j*9,35-j%2*5,35+j*9,49,'L'),rect(35+j*9,35-j%2*5,3,4,'r'));}
 if(e.id==='forge-2'){for(const s of [-1,1])backLayer.push(rect(64+s*26-10,37,20,18,'I','m'),line(64+s*26-8,39,64+s*26+6,39,'L'));}
 if(e.id==='forge-3'){for(const x of [28,65])backLayer.push(line(x,42,x,62,'m',3),line(x,62,x+4,66,'O',2));orn.push(poly([[35,61],[60,61],[57,70],[39,70]],'s','m'),line(39,62,57,62,'O'));}
 if(e.id==='forge-4'){for(const s of [-1,1]){chain(p,48+s*18,35,31);backLayer.push(poly([[48+s*13,42],[48+s*25,32],[48+s*27,22],[48+s*21,28],[48+s*17,38]],'s','m'));}}
 if(e.id==='bones-0'){backLayer.push(poly([[54,41],[65,38],[68,61],[58,64]],'W','o'));for(let j=0;j<4;j++)backLayer.push(line(58+j*2,46,63+j*2,28,'q'),poly([[61+j*2,33],[61+j*2,27],[65+j*2,30]],'q','Q'));}
 if(e.id==='bones-1'){backLayer.push(rect(24,43,13,20,'W','o'),grid(25,46,rr('OqqqqqO|OqHHHqO|OqHHHqO|OqqqqqO')));for(const x of [27,60])orn.push(poly([[x,56],[x+7,56],[x+5,72],[x-2,70]],'o','q'));}
 if(e.id==='bones-2'){for(const s of [-1,1])for(let j=0;j<3;j++)backLayer.push(poly([[48+s*8,40+j*4],[48+s*18,37+j*4],[48+s*23,40+j*4]],'q'));}
 if(e.id==='bones-3'){for(const s of [-1,1]){backLayer.push(poly([[48+s*4,47],[48+s*25,24],[48+s*43,31],[48+s*40,50],[48+s*30,59],[48+s*12,60]],'s',color),ellipse(48+s*27-6,35,13,14,'O','q'),ellipse(48+s*27-2,39,5,6,'I','W'),line(48+s*8,48,48+s*35,35,bright),line(48+s*8,48,48+s*36,52,bright));}}
 if(e.id==='bones-4'){for(const s of [-1,1])for(let j=0;j<4;j++)backLayer.push(poly([[64+s*16,46+j*6],[64+s*31,40+j*5],[64+s*40,48+j*5]],'s','q'));}
 if(e.id==='frost-0'){for(const s of [-1,1])backLayer.push(poly([[48+s*10,42],[48+s*18,27],[48+s*22,41],[48+s*28,32],[48+s*26,49]],'j','J'));}
 if(e.id==='frost-1'){for(const s of [-1,1])for(let j=0;j<4;j++)backLayer.push(poly([[48+s*11,52],[48+s*(25+j*4),39+j*4+bob],[48+s*(33+j*3),61+j*4]],'j'),poly([[48+s*11,52],[48+s*(25+j*4),40+j*4+bob],[48+s*(31+j*3),60+j*4]],'J'));}
 if(e.id==='frost-2'){for(let j=0;j<7;j++)backLayer.push(poly([[28+j*6,46],[31+j*6,35-j%3*2],[38+j*6,48]],'s','H'));}
 if(e.id==='frost-3'){for(const s of [-1,1])backLayer.push(poly([[48+s*12,44],[48+s*24,24],[48+s*30,52],[48+s*20,68]],'j','J'),line(48+s*22,36,48+s*24,58,'k'));}
 if(e.id==='frost-4'){for(const x of [29,65]){chain(p,x,48,18);orn.push(poly([[x-3,65],[x+4,65],[x+6,71],[x-5,71]],'O','o'));}}
 if(e.id==='blood-0'){backLayer.push(rect(27,37,16,23,'s','W'));for(let x=29;x<43;x+=4)backLayer.push(line(x,40,x,57,'q'));}
 if(e.id==='blood-1'){for(const s of [-1,1])backLayer.push(poly([[48+s*9,40],[48+s*22,33],[48+s*31,42],[48+s*26,49],[48+s*18,44],[48+s*24,57],[48+s*12,50]],'c','r'));}
 if(e.id==='blood-2'){backLayer.push(ellipse(23,22,50,44,'c'),ellipse(26,25,44,38,'r'));for(const s of [-1,1])backLayer.push(poly([[48+s*7,46],[48+s*15,38],[48+s*22,39]],'r'));}
 if(e.id==='blood-3'){backLayer.push(poly([[30,55],[18,58],[11,65],[16,71],[28,72],[37,65]],'s','q'));for(let j=0;j<4;j++)backLayer.push(poly([[17+j*5,62],[20+j*5,58],[24+j*5,64],[21+j*5,69]],'s','H'));}
 if(e.id==='blood-4'){for(let j=0;j<6;j++)backLayer.push(ellipse(27+j*7,51+bob+j%2*3,11,16,'c','r'),line(31+j*7,55+bob,31+j*7,62+bob,'E'));}
 if(e.id==='astral-0'){backLayer.push(ellipse(23,22,51,43,'O'),poly([[29,21],[34,18],[31,32],[34,44],[29,40],[26,30]],'O','A'));}
 if(e.id==='astral-1'){for(let j=0;j<4;j++)backLayer.push(poly([[34+j*9,54],[30+j*10,62],[34+j*8+sway,72],[26+j*11,74]],'e'),line(35+j*9,56,32+j*9,66,'z'));}
 if(e.id==='astral-2'){backLayer.push(ellipse(23,29,83,35,'O'),line(29,35,102,57,'A'),poly([[35,37],[45,21],[50,40]],color,bright));}
 if(e.id==='astral-3'){for(const s of [-1,1]){backLayer.push(poly([[48+s*8,45],[48+s*24,23],[48+s*40,19],[48+s*34,37],[48+s*19,56]],'e',color),line(48+s*8,49,48+s*37,23,bright));for(let j=0;j<4;j++)backLayer.push(line(48+s*(13+j*4),46-j*6,48+s*(27+j*3),45-j*7,'z'));}}
 if(e.id==='astral-4'){backLayer.push(rect(26,31,11,37,'W','q'),ellipse(25,27,13,9,'O','o'),ellipse(25,64,13,8,'O','o'));}
 if(e.id==='gilded-0'){for(const s of [-1,1])backLayer.push(poly([[48+s*8,31],[48+s*16,13],[48+s*17,28],[48+s*25,19],[48+s*21,39]],'O','A'));}
 if(e.id==='gilded-1'){backLayer.push(poly([[51,42],[65,43],[73+sway,62],[67+sway,74],[61,65],[62,58]],'W','O'),line(65,47,68+sway,67,'A'));}
 if(e.id==='gilded-2'){for(const s of [-1,1])backLayer.push(poly([[48+s*14,50],[48+s*30,33],[48+s*37,38],[48+s*26,57],[48+s*35,73]],'W','O'),poly([[48+s*3,43],[48+s*19,38],[48+s*27,57],[48+s*8,63]],'O',color),line(48+s*5,41,48+s*16,20,'O'));}
 if(e.id==='gilded-3'){backLayer.push(...[poly([[26,41],[31,19],[39,27],[47,13],[56,27],[67,19],[72,41]],'O','o'),line(28,39,70,39,'A')]);}
 if(e.id==='gilded-4'){for(const s of [-1,1])for(let j=0;j<4;j++)backLayer.push(poly([[48+s*9,46],[48+s*(24+j*4),24+j*7],[48+s*(26+j*5),33+j*7],[48+s*13,54]],'W',j%2?'O':color));}
 if(e.id==='abyss-0'){for(const s of [-1,1])for(let j=0;j<3;j++)backLayer.push(poly([[48+s*7,43+j*5],[48+s*20,39+j*5],[48+s*24,44+j*5]],color));}
 if(e.id==='abyss-1'){for(const s of [-1,1]){backLayer.push(line(48,49,48+s*17,33+bob,'s',6),line(48,49,48+s*17,33+bob,color,4));orn.push(grid(48+s*17-5,28+bob,rr('..sss..|.sLLms.|sLIIIms|sLmImms|.smmssI|..ssI..')));}}
 if(e.id==='abyss-2'){for(const ss of [-1,1])backLayer.push(poly([[28,54],[18,52+ss*4],[8,40+ss*8],[12,32+ss*9],[14,43+ss*6],[25,47+ss*3]],'s',color));}
 if(e.id==='abyss-3'){backLayer.push(line(36,88,35,29,'s',7),line(35,29,88,24,'s',7),line(88,24,94,89,'s',7),line(37,29,86,24,'L'),poly([[45,38],[75,35],[82,62],[87,67],[41,72],[45,65]],'W','O'),line(47,42,44,64,'A'));}
 if(e.id==='abyss-4'){for(const s of [-1,1])for(let j=0;j<2;j++)backLayer.push(poly([[48+s*8,45+j*8],[48+s*30,22+j*22],[48+s*43,33+j*22],[48+s*26,48+j*14],[48+s*12,57]],'s',color));}
 return p;
}
