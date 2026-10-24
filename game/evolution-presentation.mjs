async function loadHeroEvolution(id){
 for(const h of HEROES)if(h.id!==id)for(const prefix of ['hero-eight-','hero-gear-','hero-armor-'])images.delete(prefix+h.id);
 await Promise.all(['hero-eight-'+id,'hero-gear-'+id,'hero-armor-'+id,'hero-boots','evolution-effects','biome-vaults','biome-floors','biome-landmarks','biome-awakenings'].map(loadImage));
}
const evolutionSetPanel=setPanel;setPanel=function(name,html=''){if(name&&game)game.impactInput=null;evolutionSetPanel(name,html);};
const evolutionLoadCraft=loadHeroCraft;loadHeroCraft=async function(id){await Promise.all([evolutionLoadCraft(id),loadHeroEvolution(id)]);};

function drawEquippedHero(c,e,{preview=false}={}){
 const name='hero-eight-'+game.hero.id,appearance=equipmentAppearance(game),direction=e.face??'s';
 let state=e.action==='attack'?HERO_COMBAT[e.attackKind??0].tag:e.action==='cast'?'cast:'+e.castId:e.action;
 if(!tag(name,direction+'-'+state))state='idle';const index=frameAt(name,direction+'-'+state,e.action==='charge'?Math.min(.65,e.charge??0):e.at??0,['walk','idle','charge'].includes(state)),socket=ASSETS[name]?.meta?.sockets?.[index];
 if(!preview)shadow(c,e.x,e.y);c.save();if(e.action==='hurt'&&Math.floor(game.time*14)%2===0)c.globalAlpha=.6;drawFrame(c,name,index,e.x,e.y+32);
 if(socket){
  if(appearance.armor&&socket.torso&&!['roll','death'].includes(state))drawFrame(c,'hero-armor-'+game.hero.id,tag('hero-armor-'+game.hero.id,direction+'-'+appearance.armor)?.from??0,e.x+socket.torso[0]-48,e.y+32+socket.torso[1]-76);
  if(appearance.boots&&!['roll','death'].includes(state))for(const foot of socket.feet)drawFrame(c,'hero-boots',tag('hero-boots',game.hero.id+'-'+direction+'-'+appearance.boots)?.from??0,e.x+foot.x-48,e.y+32+foot.y-76);
  const gear='hero-gear-'+game.hero.id;drawFrame(c,gear,socket.offhand[appearance.offhand?1:0],e.x,e.y+32);drawFrame(c,gear,socket.weapons[appearance.weapon],e.x,e.y+32);
  if(appearance.amulet&&socket.torso)scenery(c,'evolution-effects','amulet',e.x+socket.torso[0]-48,e.y+32+socket.torso[1]-65,32,32);
  if(appearance.ring&&socket.hand)scenery(c,'evolution-effects','ring',e.x+socket.hand[0]-48,e.y+32+socket.hand[1]-76,32,32);
 }
 c.restore();
}
const evolutionDrawActor=drawActor;drawActor=function(c,e,hero=false){if(hero){drawEquippedHero(c,e);return;}c.save();if(e.hitFlash>0&&settings.flashes)c.filter='brightness(1.55)';const recoil=(e.hitFlash??0)/.14*(e.hitRecoil??0);evolutionDrawActor(c,recoil?{...e,x:e.x+Math.cos(e.hitAngle??0)*recoil,y:e.y+Math.sin(e.hitAngle??0)*recoil}:e,false);c.restore();};
paintPaperdoll=function(stamp){const el=$('paperdoll');if(!el||!game)return;const c=el.getContext('2d');c.clearRect(0,0,192,224);c.imageSmoothingEnabled=false;c.save();c.translate(0,-40);c.scale(2,2);drawEquippedHero(c,{x:48,y:76,face:['s','se','e','ne','n','nw','w','sw'][Math.floor(stamp/1800)%8],action:'idle',at:stamp/1000},{preview:true});c.restore();};

const evolutionRenderBag=renderBag;renderBag=async function(){await evolutionRenderBag();if(!game)return;
 if(bagTab==='skills')for(const card of overlay.querySelectorAll('.skill-card')){const id=card.querySelector('[data-command="skill-upgrade"]')?.dataset.id;if(id){const stats=skillProfile(id,game.skillRanks[id]??0),label=card.querySelector('.craft-card > div:first-child div small');if(label)label.textContent=stats.cost+' focus · '+stats.cooldown.toFixed(1)+'s recovery';}if(id)card.querySelector('.skill-rank')?.insertAdjacentHTML('beforebegin',`<p class="rank-benefit">${skillRankText(id,game.skillRanks[id]??0)}</p>`);}
 if(bagTab==='equipment'){const relics=game.player.relics??[];overlay.querySelector('.inventory-heading')?.insertAdjacentHTML('beforebegin',`<section class="relic-synergies"><span class="eyebrow">AWAKENED RELIC ARTS</span>${relics.length?relics.map(id=>`<p><b style="color:${RELIC_ARTS[id].color}">${RELIC_ARTS[id].name}</b> · ${RELIC_ARTS[id].text}</p>`).join(''):'<p>Relic and legendary equipment can awaken combat arts. Equip complementary pieces to shape your oath.</p>'}</section>`);}
};
const evolutionSelectItem=selectItem;selectItem=function(uid){evolutionSelectItem(uid);const item=game?.inventory.find(i=>i.uid===uid),id=itemRelic(item);if(id)$('item-detail').querySelector('.relic-detail > p')?.insertAdjacentHTML('afterend',`<section class="item-relic-art"><span class="eyebrow">${RELIC_ARTS[id].trigger.toUpperCase()}</span><h3>${RELIC_ARTS[id].name}</h3><p>${RELIC_ARTS[id].text}</p></section>`);};

const evolutionSyncSkills=syncSkillIcons;syncSkillIcons=async function(){await evolutionSyncSkills();if(!game)return;const label=document.querySelector('.touch-action.attack small'),button=document.querySelector('.touch-action.attack');if(label)label.textContent=game.hero.id==='seer'?'CHARGE':'ATTACK';button?.setAttribute('aria-label',game.hero.id==='seer'?'Hold to charge a spell, release to cast':'Hold to attack');};
const evolutionHUD=updateHUD;updateHUD=function(){evolutionHUD();if(!game)return;const p=game.player,attack=document.querySelector('.touch-action.attack');attack?.classList.toggle('charging',p.action==='charge');attack?.style.setProperty('--charge',String(Math.min(1,(p.charge??0)/1.2)));attack?.classList.toggle('riposte-ready',p.riposte>0);$('boss-name').textContent=game.enemies.some(e=>ENEMY_BY_ID[e.kind].boss)?ENEMY_BY_ID[game.enemies.find(e=>ENEMY_BY_ID[e.kind].boss).kind].name+(game.arena.phase2?' · AWAKENED':''):$('boss-name').textContent;canvas.dataset.facing=p.face;canvas.dataset.charge=(p.charge??0).toFixed(2);canvas.dataset.riposte=(p.riposte??0).toFixed(2);canvas.dataset.equipment=JSON.stringify(equipmentAppearance(game));canvas.dataset.phase2=String(!!game.arena.phase2);};

const evolutionMap=paintMap;paintMap=function(c,w,h,detailed=false){evolutionMap(c,w,h,detailed);if(!detailed)return;const rooms=game.layout.rooms,xs=rooms.map(r=>r.x),ys=rooms.map(r=>r.y),xmin=Math.min(...xs),xmax=Math.max(...xs),ymin=Math.min(...ys),ymax=Math.max(...ys),step=Math.min(66,(w-24)/Math.max(1,xmax-xmin),(h-70)/Math.max(1,ymax-ymin)),X=r=>w/2+(r.x-(xmin+xmax)/2)*step,Y=r=>h/2+(r.y-(ymin+ymax)/2)*step;
 for(const gate of game.layout.shortcuts??[]){const a=rooms[gate.a],b=rooms[gate.b];if(!a.visited&&!b.visited)continue;c.save();c.setLineDash([3,3]);c.strokeStyle=gate.open?'#92c5b0':'#ab9666';c.beginPath();c.moveTo(X(a),Y(a));c.lineTo(X(b),Y(b));c.stroke();c.restore();}
 for(const r of rooms)if(r.visited&&r.role==='elite')pixelText(c,'ELITE',X(r),Y(r)+19,'#d4a2b5',1,true);
};
const evolutionOpenMap=openFloorMap;openFloorMap=function(){evolutionOpenMap();overlay.querySelector('.map-legend')?.insertAdjacentHTML('beforeend','<span>ELITE · Relic + essence</span><span>┄ Lever shortcut</span>');overlay.querySelector('.muted').textContent='Choose your risk: elite chambers guarantee a relic and essence; hearths restore your strength. Lever gates open shorter return routes.';};$('open-map').onclick=openFloorMap;

const evolutionDrawProp=drawProp;drawProp=function(c,p){if(p.biomeArt!==undefined){scenery(c,'biome-landmarks',game.biome.id+'-'+p.biomeArt,p.x,p.y+32,56,ASSETS['biome-landmarks'].meta.groundAnchors?.[game.biome.id+'-'+p.biomeArt]?.y??113);return;}evolutionDrawProp(c,p);};
const evolutionDoors=drawDoors;drawDoors=function(c){evolutionDoors(c);for(const gate of game.doors())if(gate.locked)scenery(c,'descent-doors',game.biome.id+'-'+gate.direction+'-sealed',gate.x,gate.y+32,56,96);if(game.arena.switch){const s=game.arena.switch,open=game.room.switchActivated;scenery(c,'evolution-effects',open?'lever-open':'lever-closed',s.x,s.y+32,32,55);if(!open&&!game.roomLocked())scenery(c,'evolution-effects','lever-glint',s.x,s.y+8,32,32);}};

const evolutionTelegraphs=drawTelegraphs;drawTelegraphs=function(c){if(game.arena.phase2)for(const z of game.arena.bossHazards??[])drawFrame(c,'biome-awakenings',frameAt('biome-awakenings',game.biome.id,game.time),z.x,z.y+32);evolutionTelegraphs(c);for(const e of game.enemies){if(e.phase==='windup'){const a=e.aim,x=e.x+Math.cos(a)*18,y=e.y+32+Math.sin(a)*18,age=(e.windupDuration??.42)-e.timer;c.save();c.translate(x,y);c.rotate(a);scenery(c,'evolution-effects','warning-'+Math.min(3,Math.floor(age/(e.windupDuration??.42)*4)),0,0,32,32);c.restore();}if(e.phase==='recover'&&e.timer>.1){c.strokeStyle='#e8ce83';c.lineWidth=1;c.beginPath();c.ellipse(e.x,e.y+32,17,6,0,0,TAU*Math.min(1,e.timer/(e.recoveryDuration??.65)));c.stroke();}}
 for(const d of game.dangers)if(d.arenaHazard){c.strokeStyle='#ffd1a0';c.lineWidth=2;c.beginPath();c.arc(d.x,d.y+32,d.radius,-Math.PI/2,-Math.PI/2+TAU*clamp(1-d.timer/d.max,0,1));c.stroke();}
};
let lightSurface=null,lastLightStamp=-1;
function drawTorchLighting(){
 if(!game)return;if(!lightSurface){lightSurface=document.createElement('canvas');lightSurface.width=360;}if(lightSurface.height!==canvas.height){lightSurface.height=canvas.height;lastLightStamp=-1;}
 const stamp=Math.floor(game.time*(settings.reduced?4:12));if(stamp!==lastLightStamp){const c=lightSurface.getContext('2d');c.clearRect(0,0,360,canvas.height);c.globalCompositeOperation='source-over';c.fillStyle='#02071163';c.fillRect(0,0,360,canvas.height);c.globalCompositeOperation='destination-out';
  const points=[...game.arena.props.filter(p=>p.type==='brazier').map(p=>({x:p.x,y:p.y+10,r:122,p:.9})),{x:game.player.x,y:game.player.y+9,r:95,p:.62}];
  for(const l of points){const radius=l.r+(settings.reduced?0:Math.sin(game.time*5+l.x)*2),g=c.createRadialGradient(l.x,l.y,8,l.x,l.y,radius);g.addColorStop(0,'rgba(0,0,0,'+l.p+')');g.addColorStop(.55,'rgba(0,0,0,'+(l.p*.55)+')');g.addColorStop(1,'#00000000');c.fillStyle=g;c.fillRect(l.x-radius,l.y-radius,radius*2,radius*2);}
  c.globalCompositeOperation='source-over';lastLightStamp=stamp;
 }ctx.drawImage(lightSurface,0,0);
 for(const p of game.arena.props.filter(p=>p.type==='brazier')){const g=ctx.createRadialGradient(p.x,p.y+10,1,p.x,p.y+10,55);g.addColorStop(0,'#efb46d20');g.addColorStop(1,'#efb46d00');ctx.fillStyle=g;ctx.fillRect(p.x-55,p.y-45,110,110);}
}
const evolutionRenderWorld=renderWorld;renderWorld=function(){evolutionRenderWorld();if(!game)return;drawTorchLighting();const p=game.player;

 for(const fx of game.effects){const age=fx.max-fx.life;if(['guard-spark','hit-spark','bloodbloom','relic-rune','boss-awaken'].includes(fx.type)){ctx.globalAlpha=Math.min(1,fx.life*7);drawFrame(ctx,'evolution-effects',frameAt('evolution-effects',fx.type,age,false),fx.x,fx.y+32);ctx.globalAlpha=1;}if(fx.type==='echo-link'){ctx.strokeStyle=fx.color;ctx.globalAlpha=fx.life/fx.max;ctx.beginPath();ctx.moveTo(fx.x,fx.y+32);ctx.lineTo(fx.toX,fx.toY+32);ctx.stroke();ctx.globalAlpha=1;}}
 if(p.riposte>0)scenery(ctx,'evolution-effects','riposte',p.x,p.y-38,32,32);
};
const evolutionSound=audio.sfx.bind(audio);audio.sfx=function(type){
 if(['armor','parry','riposte'].includes(type)){if(!this.started||settings.sfx<=0)return;for(const [frequency,gain,delay]of type==='parry'?[[1180,.12,0],[1770,.075,.012],[2310,.035,.023]]:[[760,.08,0],[1360,.04,.008]])this.tone(frequency,.16,'sine',gain,delay);this.tone(110,.045,'triangle',.075);return;}
 if(type==='charged-cast'){this.tone(160,.25,'triangle',.13);this.tone(710,.36,'sine',.08);return;}
 if(type==='boss-phase'){this.tone(48,1.1,'triangle',.2);this.tone(73,.8,'sine',.12,.1);return;}
 evolutionSound(type);
};
