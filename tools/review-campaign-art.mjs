import fs from 'node:fs';
import path from 'node:path';
import {sprite,paint,finish,preview,call,data,ROOT,grid,P} from './art-lib.mjs';
import {allLayers} from './campaign-art-design.mjs';
import {heroDesign} from './descent-actors.mjs';
import {enemyDesign} from './evolution-enemy-design.mjs';
import {offsetOps} from './actor-design-v2.mjs';
import {HEROES,ENEMIES,BIOMES} from '../game/content.mjs';
const font=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/font.json'),'utf8'));
function label(str,x,y){const ops=[];for(const c of str.toUpperCase()){const r=font.glyphs[c];if(r)ops.push(grid(x,y,r,{...P,...Object.fromEntries([...new Set(r.join(''))].filter(c=>c!=='.'&&c!==' ').map(c=>[c,P.L]))}));x+=(r?.[0]?.length??3)+1;}return ops;}
const keys=[['s','idle',0],['n','idle',0],['e','idle',0],['w','idle',0],['s','walk',0],['s','walk',4],['s','attack',1],['s','attack',4],['e','attack',4],['s','death',3]];
function landmarks(e,p,d,s,i){
 if(e.hero)return [{head:[(p.headX??38)+10,(p.headY??20)+10],body:[48,46]}];
 if(e.boss){const heads=[[64,26],[64,26],[64,30],[64,29],[64,25],[64,18],[64,55],[64,26],[64,41],[64,26]],a=[{head:heads[e.biome],body:e.biome===6?[64,70]:[64,54]}];if(e.biome===5)a.push({head:[102,43],body:[64,70]});return a;}
 if(e.family==='brute')return [{head:[64,e.biome===9?40:e.biome===7?26:37],body:[64,59]}];
 if(p.neck)return [{head:[p.neck.x,p.neck.y-5],body:[p.neck.x,(p.torsoY??42)+5]}];
 if(e.family==='hound'){if(e.id==='blood-4')return[{head:[d==='w'?27:d==='e'?73:49,d==='n'?52:65],body:[50,61]}];const side=d==='e'||d==='w',stag=e.id==='thorns-3';return [{head:[(side?(d==='w'?18:60):36)+10,(stag?33:43)+8],body:[48,51]}];}
 if(e.family==='crawler')return [{head:[48,e.biome===5?48:e.biome===8?42:56],body:[48,54]}];
 if(e.id==='abyss-1')return [{head:[48,34],body:[48,49]},{head:[29,31],body:[48,49]},{head:[63,31],body:[48,49]}];
 if(e.family==='wisp'){if(e.biome===6)return [{head:[48,44],body:[48,58]}];if(e.biome===7)return [{head:[48,37],body:[48,47]}];if(e.biome===3)return [{head:[45,34],body:[48,51]}];return [{head:[48,e.biome===9?34:34],body:[48,49]}];}
 return [{head:[e.biome===9?44:48,e.biome===7?28:39],body:[48,52]}];
}
// Pixels come back from Aseprite itself. This checks an actual opaque path
// between the head and torso; a text coordinate assertion would miss a gap.
function connection(px,pairs){const {grid:g,width:w,height:h}=px,labels=new Int32Array(g.length);let component=0;for(let n=0;n<g.length;n++){if(!g[n]||labels[n])continue;labels[n]=++component;const q=[n];for(let at=0;at<q.length;at++){const a=q[at],x=a%w,y=Math.floor(a/w);for(const b of [x?a-1:-1,x<w-1?a+1:-1,y?a-w:-1,y<h-1?a+w:-1])if(b>=0&&g[b]&&!labels[b]){labels[b]=component;q.push(b);}}}
 function near([x,y]){let best=null,dd=Infinity;for(let b=Math.max(0,y-4);b<=Math.min(h-1,y+4);b++)for(let a=Math.max(0,x-4);a<=Math.min(w-1,x+4);a++){const n=b*w+a,d=(a-x)**2+(b-y)**2;if(labels[n]&&d<dd){dd=d;best={component:labels[n],pixel:[a,b]};}}return best;}
 return pairs.map(pair=>{const head=near(pair.head),body=near(pair.body);return {...pair,headPixel:head?.pixel,bodyPixel:body?.pixel,connected:!!head&&head.component===body?.component};});}
const report={method:'MCP Aseprite opaque-pixel connectivity, plus named visual review sheets',generatedAt:new Date().toISOString(),cases:[]};
const ready=data(await call('preflight'));if(!ready.ready)throw Error(ready.directive);
for(const biome of BIOMES){
 const id=await sprite('review-'+biome.id,1440,840,['characters','labels']);
 for(const e of ENEMIES.filter(e=>e.biome===biome.index)){
  for(let c=0;c<keys.length;c++){const [d,state,i]=keys[c],p=enemyDesign(e,d,state,i),large=e.boss||e.family==='brute',w=large?144:96,h=large?112:96,x=c*144+(144-w)/2,y=e.index*140+12;
   await paint(id,'characters',1,offsetOps(allLayers.flatMap(k=>p[k]??[]),x,y),e.name+' '+[d,state,i].join(' '));
   await paint(id,'labels',1,label((c===0?e.name.slice(0,24):[d,state,i].join(' ')),c*144+3,y+116),'review label');
   if(state!=='death'){
    const px=data(await call('read_pixels',{sprite:id,region:{x,y,width:w,height:h},composite:true}));const checks=connection(px,landmarks(e,p,d,state,i));report.cases.push({id:e.id,name:e.name,direction:d,state,key:i,checks});
   }
  }
 }
 await finish(id,'review-'+biome.id,[],[],{sheet:false});await preview(id,'review-'+biome.id,'preview',{scale:1});await call('sprite_manage',{sprite:id,op:'close'});console.log('Checked individually:',biome.name);
}
const id=await sprite('review-mage',960,480,['characters','labels']);let row=0;
for(const d of ['s','n','e','w']){let col=0;for(const [state,i]of [['idle',0],['walk',0],['walk',4],['attack',1],['attack',4],['attack-heavy',4],['roll',0],['roll',2],['death',1],['death',4]]){const p=heroDesign('seer',d,state,i);await paint(id,'characters',1,offsetOps(allLayers.flatMap(k=>p[k]??[]),col*96,row*120),`${d} ${state} ${i}`);await paint(id,'labels',1,label(`${d} ${state} ${i}`,col*96+1,row*120+103),'mage key');col++;}row++;}
await finish(id,'review-mage',[],[],{sheet:false});await preview(id,'review-mage','preview',{scale:1});await call('sprite_manage',{sprite:id,op:'close'});
report.failures=report.cases.filter(c=>c.checks.some(x=>!x.connected));fs.writeFileSync(path.join(ROOT,'previews','cast-anatomy-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({cases:report.cases.length,failures:report.failures},null,2));
