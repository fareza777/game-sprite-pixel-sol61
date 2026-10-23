export {drawKnight,drawSkeleton,drawBoss,drawWisp} from './draw-actors-v2.mjs';
import {drawKnight,drawSkeleton,drawBoss,drawWisp,buildAll} from './draw-actors-v2.mjs';
if(process.argv[1]?.endsWith('draw-actors.mjs')){
 const target=process.argv[2]??'all';
 if(target==='all')await buildAll();
 else if(target==='knight')await drawKnight();
 else if(target==='hollow')await drawSkeleton();
 else if(target==='warden')await drawBoss();
 else if(target==='wisp')await drawWisp();
 else throw new Error('Unknown actor: '+target);
}
