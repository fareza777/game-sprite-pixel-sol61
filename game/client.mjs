const query=new URLSearchParams(location.search);
const isPortrait=query.get('mobile')==='1'||(window.matchMedia?.('(pointer: coarse) and (max-width: 900px) and (orientation: portrait)').matches??false);
document.body?.classList.toggle('mobile',isPortrait);
const canvas=document.getElementById('game'),worldCanvas=document.createElement('canvas');worldCanvas.width=640;worldCanvas.height=400;
canvas.width=isPortrait?360:640;canvas.height=isPortrait?480:400;
const ctx=worldCanvas.getContext('2d',{alpha:false}),screenCtx=canvas.getContext('2d',{alpha:false});screenCtx.imageSmoothingEnabled=false;
for(const el of document.querySelectorAll?.('[data-icon]')??[])el.src=UI_ICONS[el.dataset.icon];
window.addEventListener('error',e=>{canvas.dataset.error=e.message;});
window.addEventListener('unhandledrejection',e=>{canvas.dataset.error=String(e.reason);});
ctx.imageSmoothingEnabled=false;
const images={};
await Promise.all(Object.entries(ASSETS).map(([name,a])=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[name]=img;resolve();};img.onerror=reject;img.src=a.image;})));
document.getElementById('loading').hidden=true;
let game=new Game(),last=performance.now(),lastScreen='',soundOn=true,audio=null;
const keys=new Set(),pressed=new Set();const pointer={active:false,x:320,y:200};let mouseAttack=false,mouseBlock=false;
const $=id=>document.getElementById(id);
const touchInput=new TouchInput(),clearTouch=isPortrait?bindTouchControls(touchInput,document,pause):()=>touchInput.clear();
function initSound(){
 if(audio)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
 audio=new AC();const master=audio.createGain();master.gain.value=.18;master.connect(audio.destination);audio.master=master;
 // A quiet two-note drone, softened by a low-pass filter.
 const low=audio.createBiquadFilter();low.type='lowpass';low.frequency.value=175;low.connect(master);
 for(const hz of [65.4,98]){const o=audio.createOscillator(),g=audio.createGain();o.type='triangle';o.frequency.value=hz;g.gain.value=.07;o.connect(g);g.connect(low);o.start();}
}
function tone(freq,duration=.1,type='sine',gain=.25,end=freq){
 if(!audio||!soundOn)return;const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(Math.max(20,end),t+duration);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(gain,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(audio.master);o.start(t);o.stop(t+duration+.01);
}
function noise(duration=.1,gain=.1,cutoff=2000){
 if(!audio||!soundOn)return;const buffer=audio.createBuffer(1,Math.ceil(audio.sampleRate*duration),audio.sampleRate),d=buffer.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);
 const source=audio.createBufferSource(),filter=audio.createBiquadFilter(),g=audio.createGain();source.buffer=buffer;filter.type='lowpass';filter.frequency.value=cutoff;g.gain.value=gain;source.connect(filter);filter.connect(g);g.connect(audio.master);source.start();
}
function sound(event){
 if(event==='swing'){noise(.12,.19,2500);tone(260,.09,'triangle',.2,90);}
 if(event==='heavy'){noise(.2,.3,1600);tone(170,.16,'triangle',.3,55);}
 if(event==='hit'||event==='kill'){noise(.1,.3,1500);tone(event==='kill'?340:520,.1,'square',.16,90);}
 if(event==='hurt'){noise(.2,.23,600);tone(110,.2,'sawtooth',.1,40);}
 if(event==='roll')noise(.18,.13,800);
 if(event==='block'){tone(1100,.12,'triangle',.4,500);tone(1450,.08,'sine',.2,1100);}
 if(event==='coin')tone(1000,.07,'sine',.12,1600);
 if(event==='cast')tone(330,.2,'sine',.12,650);
 if(['choose','chest','heal','relic','gate'].includes(event)){[523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.3,'triangle',.14),i*90));}
 if(event==='boss'||event==='boss-death'){tone(65,.7,'sawtooth',.25,32);noise(.5,.2,300);}
 if(event==='win'){[392,523,659,784].forEach((f,i)=>setTimeout(()=>tone(f,.7,'triangle',.15),i*150));}
}
function begin(){initSound();audio?.resume();game.start(Date.now()&0xffff);canvas.focus();syncUI();}
$('begin').onclick=begin;$('retry').onclick=begin;$('resume').onclick=()=>{audio?.resume();game.state=game.beforePause??'playing';canvas.focus();syncUI();};
$('capture').onclick=()=>{const a=$('capture');a.href=canvas.toDataURL('image/png');a.download='cinder-vow.png';};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.querySelector('.frame').requestFullscreen();}catch{}canvas.focus();};
function toggleSound(){initSound();soundOn=!soundOn;if(audio)audio.master.gain.value=soundOn?.18:0;for(const id of ['sound','mobile-sound'])$(id).textContent=`SOUND: ${soundOn?'ON':'OFF'}`;$('sound').setAttribute('aria-pressed',String(soundOn));canvas.focus();}
$('sound').onclick=toggleSound;$('mobile-sound').onclick=toggleSound;
function pause(){clearTouch();if(game.state==='playing'||game.state==='exit'){game.beforePause=game.state;game.state='paused';}else if(game.state==='paused')game.state=game.beforePause??'playing';syncUI();}
window.addEventListener('keydown',e=>{
 const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k))e.preventDefault();
 if(!keys.has(k))pressed.add(k);keys.add(k);
 if(e.repeat)return;
 if(k==='enter'&&['title','dead','won'].includes(game.state))begin();
 if(k==='p'||k==='escape')pause();
 if(game.state==='relic'&&['1','2','3'].includes(k)){game.chooseRelic(Number(k)-1);canvas.focus();syncUI();}
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
function pauseForBackground(){clearTouch();keys.clear();pressed.clear();mouseAttack=false;mouseBlock=false;if(game.state==='playing'||game.state==='exit')pause();}
window.addEventListener('blur',pauseForBackground);
document.addEventListener?.('visibilitychange',()=>{if(document.hidden)pauseForBackground();});
canvas.addEventListener('pointermove',e=>{if(isPortrait)return;const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width*640;pointer.y=(e.clientY-r.top)/r.height*400-32;pointer.active=true;});
canvas.addEventListener('pointerleave',()=>pointer.active=false);
canvas.addEventListener('pointerdown',e=>{if(isPortrait)return;initSound();canvas.focus();if(e.button===0)mouseAttack=true;if(e.button===2)mouseBlock=true;});
window.addEventListener('pointerup',e=>{if(e.button===0)mouseAttack=false;if(e.button===2)mouseBlock=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());
function text(s,x,y,color='#d9e4d5',scale=1,align='left',target=ctx){
 s=String(s).toUpperCase();let width=0;for(const ch of s)width+=((FONT.glyphs[ch]?.[0]?.length??(ch===' '?3:5))+1)*scale;
 if(align==='center')x-=Math.floor(width/2);if(align==='right')x-=width;
 target.fillStyle=color;for(const ch of s){const rows=FONT.glyphs[ch]??FONT.glyphs['?'];if(rows)for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++)if(rows[j][i]!=='.'&&rows[j][i]!==' ')target.fillRect(Math.round(x+i*scale),Math.round(y+j*scale),scale,scale);x+=((rows?.[0]?.length??3)+1)*scale;}
}
function spriteFrame(name,tag,time=0,loop=true){
 const a=ASSETS[name],t=a.meta?.frameTags?.find(t=>t.name===tag),frames=a.frames;
 const from=t?.from??0,to=t?.to??from;let duration=0;for(let i=from;i<=to;i++)duration+=frames[i].duration;
 let ms=loop?(time*1000)%duration:Math.min(time*1000,duration-1);let index=from;
 for(;index<to;index++){if(ms<frames[index].duration)break;ms-=frames[index].duration;}
 return frames[index].frame;
}
const flashCanvas=document.createElement('canvas');flashCanvas.width=180;flashCanvas.height=128;const fc=flashCanvas.getContext('2d');fc.imageSmoothingEnabled=false;
function drawSprite(name,tag,x,y,time=0,options={}){
 const anchor=ASSETS[name].meta?.anchor??{x:32,y:50};
 const {pivotX=anchor.x,pivotY=anchor.y,scale=1,flip=false,loop=true,flash=false,alpha=1}=options;
 const r=spriteFrame(name,tag,time,loop);const xx=Math.round(x-pivotX*scale),yy=Math.round(y-pivotY*scale)+32;
 ctx.save();ctx.globalAlpha=alpha;
 if(flip){ctx.translate(Math.round(x),0);ctx.scale(-1,1);ctx.translate(-Math.round(x),0);}
 if(flash){fc.clearRect(0,0,flashCanvas.width,flashCanvas.height);fc.drawImage(images[name],r.x,r.y,r.w,r.h,0,0,r.w,r.h);fc.globalCompositeOperation='source-atop';fc.fillStyle='#f6dda0';fc.fillRect(0,0,r.w,r.h);fc.globalCompositeOperation='source-over';ctx.drawImage(flashCanvas,0,0,r.w,r.h,xx,yy,r.w*scale,r.h*scale);}
 else ctx.drawImage(images[name],r.x,r.y,r.w,r.h,xx,yy,r.w*scale,r.h*scale);
 ctx.restore();
}
function shadow(x,y,w=22,air=false){
 const xx=Math.round(x),yy=Math.round(y)+32;ctx.fillStyle=air?'#0b101b55':'#0b101b80';ctx.fillRect(xx-Math.floor(w/2)+2,yy-2,w-4,5);ctx.fillRect(xx-Math.floor(w/2),yy-1,w,3);
 if(!air){ctx.fillStyle='#0b101bba';ctx.fillRect(xx-Math.floor(w/2)+4,yy-1,w-8,2);}
}
function actor(e,player=false){
 if(player){
  const p=e,tag=p.action==='attack'?HERO_COMBAT[p.attackKind].tag:p.action;shadow(p.x,p.y,30);drawSprite('knight',`${p.face}-${tag}`,p.x,p.y,p.at,{loop:['idle','walk','block'].includes(p.action),flash:p.invuln>0&&Math.floor(game.time*16)%2===0&&p.action==='hurt',alpha:p.invuln>0&&p.action!=='roll'&&Math.floor(game.time*12)%2===0?.65:1});
  if(p.action==='block'){ctx.strokeStyle='#e6ba6d';ctx.lineWidth=1;ctx.beginPath();ctx.arc(Math.round(p.x),Math.round(p.y)+17,18,p.aim-.8,p.aim+.8);ctx.stroke();}
 }else{
  const boss=e.type==='warden',ghost=e.type==='wisp';shadow(e.x,e.y,boss?42:ghost?20:28,ghost);
  let animationTime=e.action==='walk'||e.action==='idle'?e.step:e.at;
  if(e.action==='attack'){
   const motion=ASSETS[e.type].meta.motion.attack,w=motion.windupMs/1000,a=motion.activeMs/1000,r=motion.settleMs/1000;
   animationTime=e.phase==='windup'?Math.min(w-.001,e.at/(e.windupDuration??1)*w):e.phase==='strike'?w+Math.min(a-.001,e.at/(e.strikeDuration??1)*a):w+a+Math.min(r-.001,e.at/(e.recoverDuration??1)*r);
  }
  drawSprite(e.type,ghost?e.action:`${e.face??'s'}-${e.action}`,e.x,e.y,animationTime,{loop:['walk','idle'].includes(e.action),flash:e.hitFlash>.04,alpha:e.dead?Math.max(.25,1-(e.at-1)*.06):1});
  if(!e.dead&&e.hp<e.maxHp&&!boss){const top=Math.round(e.y)+32-(ghost?43:47)-7;ctx.fillStyle='#0b101b';ctx.fillRect(Math.round(e.x)-13,top,26,3);ctx.fillStyle=ghost?'#58a79b':'#ca6559';ctx.fillRect(Math.round(e.x)-12,top+1,Math.ceil(24*e.hp/e.maxHp),1);}
 }
}
function telegraph(e){
 if(!['windup','strike'].includes(e.phase))return;
 const y=e.y+32;
 if(e.type==='wisp'){
  ctx.strokeStyle='#e6ba6d80';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(e.x,y);ctx.lineTo(e.x+Math.cos(e.aim)*145,y+Math.sin(e.aim)*145);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='#e6ba6d';ctx.strokeRect(e.x-8,y-4,16,8);return;
 }
 const range=e.type==='warden'?65:36,spread=e.type==='warden'?1.65:1.0;
 ctx.fillStyle=e.phase==='strike'?'#e6ba6d55':'#ca655933';ctx.strokeStyle=e.phase==='strike'?'#f6dda0':'#ca6559';
 ctx.beginPath();ctx.moveTo(e.x,y);ctx.arc(e.x,y,range,e.aim-spread,e.aim+spread);ctx.closePath();ctx.fill();ctx.stroke();
}
function drawProp(p){
 const type=p.type==='chest-closed'&&game.chestOpen?'chest-open':p.type;
 drawSprite('reliquary-props',type,p.x,p.y,0,{pivotX:32,pivotY:70});
 if(type==='brazier')drawSprite('fire','burn',p.x,p.y-23,game.time+p.x*.017,{pivotX:12,pivotY:28});
 if(type==='shrine'&&!game.shrineUsed){ctx.fillStyle='#9bd5b0';const a=Math.floor(game.time*4)%4;ctx.fillRect(p.x-9+a*6,p.y-30-(a%2)*4+32,1,1);}
}
const lightCanvas=document.createElement('canvas');lightCanvas.width=160;lightCanvas.height=90;const lc=lightCanvas.getContext('2d');
function lighting(){
 lc.clearRect(0,0,160,90);lc.fillStyle=game.floor===3?'#0e101b48':'#0a142838';lc.fillRect(0,0,160,90);
 lc.globalCompositeOperation='destination-out';
 const lights=PROPS.filter(p=>p.type==='brazier').map(p=>({...p,r:57}));lights.push({x:320,y:205,r:80});
 for(const l of lights){const x=l.x/4,y=(l.y-12)/4,r=l.r/4;const g=lc.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'#000b');g.addColorStop(1,'#0000');lc.fillStyle=g;lc.fillRect(x-r,y-r,r*2,r*2);}
 lc.globalCompositeOperation='source-over';ctx.drawImage(lightCanvas,0,32,640,360);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(const p of PROPS.filter(p=>p.type==='brazier')){
  const x=p.x,y=p.y+10,r=48+Math.sin(game.time*5+p.x)*2;const g=ctx.createRadialGradient(x,y,2,x,y,r);g.addColorStop(0,'#a77c4b29');g.addColorStop(.45,'#77573d14');g.addColorStop(1,'#77573d00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
 }
 ctx.restore();
 // Quiet motes use fixed paths; they never mask silhouettes or telegraphs.
 for(let i=0;i<29;i++){const x=(i*83+Math.sin(game.time*.2+i)*13)%554+43,y=(i*47-game.time*(2+i%3)+3600)%235+108;ctx.fillStyle=i%4===0?'#e6ba6d50':'#9bb9bc25';ctx.fillRect(Math.round(x),Math.round(y)+32,1,1);}
}
function hud(){
 const p=game.player;ctx.fillStyle='#0b101b';ctx.fillRect(0,0,640,31);ctx.fillStyle='#314958';ctx.fillRect(0,30,640,1);
 // Hand-set bitmap icon, red shield, health and stamina bars.
 const heart=['.rr.rr.','rRRrRRr','rRRRRRr','.rRRRr.','..rRr..','...r...'];for(let y=0;y<heart.length;y++)for(let x=0;x<7;x++)if(heart[y][x]!=='.'){ctx.fillStyle=heart[y][x]==='R'?'#ca6559':'#9d4249';ctx.fillRect(13+x,10+y,1,1);}
 text('HEALTH',26,5,'#8ca4ae');text(`${Math.ceil(p.hp)}/${p.maxHp}`,137,5,'#d9e4d5',1,'right');ctx.fillStyle='#263a43';ctx.fillRect(26,15,111,5);ctx.fillStyle='#9d4249';ctx.fillRect(26,15,Math.ceil(111*p.hp/p.maxHp),5);ctx.fillStyle='#ca6559';ctx.fillRect(26,15,Math.ceil(111*p.hp/p.maxHp),1);
 text('STAMINA',153,5,'#8ca4ae');ctx.fillStyle='#263a43';ctx.fillRect(153,15,79,5);ctx.fillStyle='#a77c4b';ctx.fillRect(153,15,Math.ceil(79*p.stamina/100),5);ctx.fillStyle='#e6ba6d';ctx.fillRect(153,15,Math.ceil(79*p.stamina/100),1);
 text('THE SUNKEN CHAPTERHOUSE',326,7,'#b2ba8b',1,'center');text(`TRIAL ${['I','II','III'][game.floor-1]} / III`,326,19,'#6a8992',1,'center');
 text(`${String(game.gold).padStart(3,'0')} G`,481,8,'#e6ba6d');text(`RUN ${game.seed.toString(16).toUpperCase().padStart(4,'0')}`,627,8,'#6a8992',1,'right');
 for(let i=0;i<3;i++){const x=547+i*20;ctx.fillStyle=i<game.floor-1?'#e6ba6d':i===game.floor-1?'#9bb9bc':'#314958';ctx.fillRect(x,21,4,4);if(i<2){ctx.fillStyle='#314958';ctx.fillRect(x+6,22,12,1);}}
 ctx.fillStyle='#0b101b';ctx.fillRect(0,382,640,18);ctx.fillStyle='#314958';ctx.fillRect(0,382,640,1);
 text('WASD  MOVE     J / CLICK  ATTACK     SHIFT  ROLL     L  BLOCK     E  INTERACT',320,389,'#82979c',1,'center');
 if(!isPortrait&&game.toastTime>0&&game.state!=='title'){
  const msg=game.toast.replaceAll('—','-'),w=Math.min(600,msg.length*6+24);ctx.fillStyle='#0b101bd9';ctx.fillRect(Math.round(320-w/2),353,w,17);ctx.fillStyle='#486271';ctx.fillRect(Math.round(320-w/2),353,w,1);text(msg,320,359,'#d9e4d5',1,'center');
 }
 const boss=game.enemies.find(e=>e.type==='warden');
 if(boss&&!isPortrait){text('THE OATHKEEPER',320,322,'#e6ba6d',1,'center');ctx.fillStyle='#0b101b';ctx.fillRect(222,333,196,6);ctx.fillStyle='#652e3b';ctx.fillRect(224,335,192,2);ctx.fillStyle='#ca6559';ctx.fillRect(224,335,Math.ceil(192*boss.hp/boss.maxHp),2);}
 if(!isPortrait&&['playing','exit'].includes(game.state)){
  let hint='';const c=dist(p,{x:546,y:220}),s=dist(p,{x:91,y:300});if(c<37&&!game.chestOpen)hint='[E] OPEN CHEST';if(s<35&&!game.shrineUsed)hint='[E] RESTORE OATH';if(game.state==='exit'&&dist(p,{x:320,y:124})<38)hint='[E] LEAVE THE DUNGEON';
  if(hint){text(hint,Math.round(p.x),Math.round(p.y)+45,'#f6dda0',1,'center');}
 }
}
function render(){
 ctx.fillStyle='#0b101b';ctx.fillRect(0,0,640,400);ctx.save();
 if(game.shake>0)ctx.translate(Math.round((Math.random()-.5)*game.shake),Math.round((Math.random()-.5)*game.shake));
 ctx.drawImage(images['chapter-house'],0,32);
 if(['exit','won'].includes(game.state)){
  ctx.fillStyle='#0b101b';ctx.fillRect(291,75,58,54);ctx.fillStyle='#1c4148';ctx.fillRect(296,76,48,52);ctx.fillStyle='#101a26';ctx.fillRect(301,76,38,52);text('EXIT',320,101,'#9bd5b0',1,'center');
  ctx.fillStyle='#9bd5b040';ctx.fillRect(303,128,34,2);
 }
 for(const e of game.enemies)telegraph(e);
 for(const e of game.effects){if(e.type==='spawn'){ctx.strokeStyle='#58a79b';ctx.beginPath();ctx.ellipse(e.x,e.y+32,15*(1-e.life/e.max)+2,6,0,0,TAU);ctx.stroke();}}
 for(const c of game.coins){ctx.fillStyle='#77573d';ctx.fillRect(Math.round(c.x)-1,Math.round(c.y)+31,4,2);ctx.fillStyle='#e6ba6d';ctx.fillRect(Math.round(c.x),Math.round(c.y)+29-Math.round(Math.sin(c.t*5)*1),2,3);}
 const drawables=[...PROPS.map(p=>({y:p.y,draw:()=>drawProp(p)})),...game.corpses.map(e=>({y:e.y-1,draw:()=>actor(e)})),...game.enemies.map(e=>({y:e.y,draw:()=>actor(e)})),{y:game.player.y,draw:()=>actor(game.player,true)}];
 drawables.sort((a,b)=>a.y-b.y);for(const d of drawables)d.draw();
 for(const b of game.bolts){ctx.fillStyle='#26565a';ctx.fillRect(Math.round(b.x)-3,Math.round(b.y)+5,7,5);ctx.fillStyle='#58a79b';ctx.fillRect(Math.round(b.x)-2,Math.round(b.y)+4,5,5);ctx.fillStyle='#d2e9c0';ctx.fillRect(Math.round(b.x),Math.round(b.y)+5,2,2);}
 for(const p of game.particles){ctx.fillStyle=p.color==='gold'?'#f6dda0':p.color==='mint'?'#9bd5b0':'#ca6559';ctx.globalAlpha=clamp(p.life/p.max,0,1);ctx.fillRect(Math.round(p.x),Math.round(p.y)+32,p.size,p.size);}ctx.globalAlpha=1;
 for(const e of game.effects){if(e.type==='number')text(e.text,e.x,e.y+30-(1-e.life/e.max)*14,'#fff0c5',1,'center');if(e.type==='dust'){ctx.fillStyle='#9bb9bc30';ctx.fillRect(Math.round(e.x)-3,Math.round(e.y)+31,6,2);}}
 lighting();ctx.restore();hud();present();
}
function present(){
 if(!isPortrait){screenCtx.drawImage(worldCanvas,0,0);return;}
 const s=screenCtx,p=game.player,cameraX=Math.round(clamp(p.x-180,0,280));
 s.fillStyle='#0b101b';s.fillRect(0,0,360,480);s.drawImage(worldCanvas,cameraX,32,360,350,0,48,360,350);
 const label=(str,x,y,color='#8ca4ae',align='left')=>text(str,x,y,color,1,align,s);
 label('HEALTH',12,8);label(`${Math.ceil(p.hp)}/${p.maxHp}`,151,8,'#d9e4d5','right');s.fillStyle='#263a43';s.fillRect(12,20,139,6);s.fillStyle='#9d4249';s.fillRect(12,20,139*p.hp/p.maxHp,6);s.fillStyle='#e59472';s.fillRect(12,20,139*p.hp/p.maxHp,1);
 label('STAMINA',172,8);label(`${String(game.gold).padStart(3,'0')} G`,348,8,'#e6ba6d','right');s.fillStyle='#263a43';s.fillRect(172,20,176,6);s.fillStyle='#a77c4b';s.fillRect(172,20,176*p.stamina/100,6);s.fillStyle='#e6ba6d';s.fillRect(172,20,176*p.stamina/100,1);
 label(`TRIAL ${['I','II','III'][game.floor-1]} / III`,12,34,'#b2ba8b');label('THE SUNKEN CHAPTERHOUSE',348,34,'#6a8992','right');s.fillStyle='#314958';s.fillRect(0,46,360,1);
 const boss=game.enemies.find(e=>e.type==='warden');
 if(boss){label('THE OATHKEEPER',180,408,'#e6ba6d','center');s.fillStyle='#652e3b';s.fillRect(36,420,288,4);s.fillStyle='#ca6559';s.fillRect(36,420,288*boss.hp/boss.maxHp,4);}
 else label(game.state==='exit'?'THE NORTH GATE IS OPEN':'CINDER VOW',180,412,'#a77c4b','center');
 if(game.toastTime>0&&game.state!=='title'){
  const words=game.toast.replaceAll('—','-').split(' '),lines=[''];for(const word of words){let i=lines.length-1;if((lines[i]+' '+word).trim().length>51)lines.push(word);else lines[i]+=(lines[i]?' ':'')+word;}lines.slice(0,2).forEach((line,i)=>label(line,180,438+i*10,'#d9e4d5','center'));
 }
 let hint='FACE YOUR ENEMY. WATCH THE WINDUP.';if(dist(p,{x:546,y:220})<37&&!game.chestOpen)hint='TAP THE HAND TO OPEN THE CHEST';if(dist(p,{x:91,y:300})<35&&!game.shrineUsed)hint='TAP THE HAND TO RESTORE HEALTH';if(game.state==='exit'&&dist(p,{x:320,y:124})<38)hint='TAP THE HAND TO LEAVE';label(hint,180,467,'#6a8992','center');
}
function syncUI(){
 if(game.state===lastScreen)return;lastScreen=game.state;clearTouch();
 $('title').classList.toggle('show',game.state==='title');$('relic').classList.toggle('show',game.state==='relic');$('pause').classList.toggle('show',game.state==='paused');$('result').classList.toggle('show',['dead','won'].includes(game.state));
 if(game.state==='relic'){
  $('choices').replaceChildren();
  game.choices.forEach((r,i)=>{const b=document.createElement('button');b.className='relic';b.innerHTML=`<span class="symbol" aria-hidden="true"><img src="${UI_ICONS[r.icon]}" alt=""></span><strong>${r.name}</strong><em>${r.subtitle}</em><span class="description">${r.description}</span><span class="key">[ ${i+1} ] CHOOSE RELIC</span>`;b.onclick=()=>{game.chooseRelic(i);canvas.focus();syncUI();};$('choices').append(b);});
 }
 if(['dead','won'].includes(game.state)){
  const won=game.state==='won';$('result-tag').textContent=won?'THE OATH IS BROKEN':'THE EMBER FADES';$('result-title').textContent=won?'Dawn still awaits.':'Even iron can fall.';$('result-copy').textContent=won?'The keeper has fallen. You carry the last ember out of the sunken hall.':'The dungeon remembers your name. Rise again with a new enemy formation and new relic choices.';
  $('stats').innerHTML=`<div><b>${game.kills}</b><span>ENEMIES SLAIN</span></div><div><b>${game.gold}</b><span>GOLD</span></div><div><b>${Math.floor(game.runTime/60)}:${String(Math.floor(game.runTime%60)).padStart(2,'0')}</b><span>TIME</span></div>`;
 }
}
function frame(now){
 const dt=Math.min((now-last)/1000,.04);last=now;
 const t=touchInput.consume();
 const input={up:keys.has('w')||keys.has('arrowup')||t.up,down:keys.has('s')||keys.has('arrowdown')||t.down,left:keys.has('a')||keys.has('arrowleft')||t.left,right:keys.has('d')||keys.has('arrowright')||t.right,attack:keys.has('j')||keys.has(' ')||mouseAttack||t.attack,roll:pressed.has('shift')||pressed.has('k')||t.roll,block:keys.has('l')||mouseBlock||t.block,interact:pressed.has('e')||t.interact,aim:isPortrait?null:pointer};
 game.update(dt,input);pressed.clear();while(game.events.length)sound(game.events.shift());syncUI();render();
 canvas.dataset.state=game.state;canvas.dataset.floor=game.floor;canvas.dataset.hp=game.player.hp;canvas.dataset.x=Math.round(game.player.x);canvas.dataset.y=Math.round(game.player.y);canvas.dataset.action=game.player.action;canvas.dataset.kills=game.kills;canvas.dataset.time=game.time.toFixed(2);
 requestAnimationFrame(frame);
}
// A stable read-only snapshot makes visual/playthrough checks inspectable.
window.CinderVow={get game(){return game;},pauseForBackground,back:()=>{if(['title','dead','won','paused'].includes(game.state))return'exit';game.beforePause=game.state;game.state='paused';clearTouch();syncUI();return'paused';},snapshot:()=>({state:game.state,portrait:isPortrait,controls:touchInput.snapshot(),floor:game.floor,hp:game.player.hp,stamina:game.player.stamina,kills:game.kills,gold:game.gold,enemies:game.enemies.map(e=>({type:e.type,hp:e.hp,phase:e.phase,x:e.x,y:e.y})),player:{x:game.player.x,y:game.player.y,action:game.player.action,face:game.player.face}})};
if(query.has('play'))game.start(Number(query.get('seed')??16361));
requestAnimationFrame(frame);
