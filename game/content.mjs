export const GAME_TITLE='VESPERGRAVE';
export const GAME_SUBTITLE='The Bell Below';
export const GAME_VERSION='3.2.0';
export const PROJECT_URL='https://github.com/fareza777/game-sprite-pixel-sol61';
export const DOWNLOAD_URL=PROJECT_URL+'/raw/refs/heads/main/releases/Vespergrave-3.2.0.apk';
export const HEROES=[
 {id:'knight',name:'Aldric',title:'The Bellworn Knight',role:'STEEL / GUARD',asset:'hero-knight',hp:120,damage:24,speed:100,defense:5,focus:80,range:45,color:'#d9b674',weapon:'sword',skillIds:['vowbreaker','iron-requiem','last-light'],passive:'Time your guard to parry and restore focus. Strike within 1.8 seconds for a devastating riposte.',story:'He guarded a throne that had forgotten the living. Now he descends to break the oath that buried his kingdom.',line:'An oath can outlive its king. Mine ends below.'},
 {id:'rogue',name:'Sera',title:'The Veilblade',role:'DAGGERS / CRITICAL',asset:'hero-rogue',hp:90,damage:19,speed:120,defense:2,focus:100,range:40,color:'#8ec7b7',weapon:'daggers',skillIds:['veilstep','deathblossom','marked-for-silence'],passive:'Strike an enemy from behind for a powerful backstab. Dodging also primes your critical chance.',story:'The last hunter of an order erased from the chronicles. She follows the names whispered by the bell.',line:'Keep your crown. I have come for the names you stole.'},
 {id:'seer',name:'Elian',title:'The Ashen Seer',role:'SORCERY / FOCUS',asset:'hero-seer',hp:85,damage:20,speed:103,defense:1,focus:140,range:145,color:'#afa3df',weapon:'staff',skillIds:['gravebolt','orbit-of-ashes','starfall'],passive:'Hold Attack to charge a spell; release to cast. Dodge early to cancel, or commit for greater power. Kills restore focus.',story:'He heard tomorrow in the dying stars. A single note remains, sounding from the bottom of the world.',line:'Even the stars grow quiet here. I will listen once more.'}
];
export const SKILLS=[
 {id:'vowbreaker',hero:'knight',name:'Vowbreaker',level:1,cost:24,cooldown:7,kind:'cleave',radius:82,mult:2.1,color:'#e6ba6d',description:'A sweeping oath of steel. Stagger nearby foes and break their guard.'},
 {id:'iron-requiem',hero:'knight',name:'Iron Requiem',level:4,cost:32,cooldown:13,kind:'ward',duration:5,mult:1,color:'#b7cbd0',description:'Raise a spectral bulwark. Take 65% less damage and restore stamina.'},
 {id:'last-light',hero:'knight',name:'Last Light',level:8,cost:48,cooldown:20,kind:'nova',radius:122,mult:3.5,color:'#f6dda0',description:'Plant your blade. Release a radiant shockwave and recover health.'},
 {id:'veilstep',hero:'rogue',name:'Veilstep',level:1,cost:22,cooldown:6,kind:'dash',radius:90,mult:2.2,color:'#8ec7b7',description:'Pass through danger in a cloud of dusk. Cut every enemy in your path.'},
 {id:'deathblossom',hero:'rogue',name:'Deathblossom',level:4,cost:34,cooldown:12,kind:'blades',radius:110,mult:2.6,color:'#d59abb',description:'Cast a circle of six daggers. Each blade pierces and inflicts bleeding.'},
 {id:'marked-for-silence',hero:'rogue',name:'Marked for Silence',level:8,cost:44,cooldown:18,kind:'mark',duration:7,mult:3,color:'#e0b4c9',description:'Mark the strongest foe. Your strikes deal double damage to the mark.'},
 {id:'gravebolt',hero:'seer',name:'Gravebolt',level:1,cost:20,cooldown:5,kind:'bolt',radius:170,mult:2.5,color:'#8cced8',description:'Conjure three piercing embers of cold starlight toward nearby enemies.'},
 {id:'orbit-of-ashes',hero:'seer',name:'Orbit of Ashes',level:4,cost:32,cooldown:13,kind:'orbit',duration:7,radius:62,mult:.7,color:'#afa3df',description:'Three astral cinders circle you, scouring enemies that approach.'},
 {id:'starfall',hero:'seer',name:'Starfall',level:8,cost:50,cooldown:19,kind:'meteor',radius:100,mult:4,color:'#e3d7ff',description:'Call a fallen star onto the strongest enemy. The impact chills survivors.'}
];
for(const s of SKILLS){s.castDuration=['nova','meteor'].includes(s.kind)?.96:s.kind==='ward'?.72:.76;s.releaseTime=s.castDuration*.34;s.vfx='vfx-'+s.hero;}
// Five ordinary designs and a dedicated boss belong to every ten-floor chapter.
const biomeRows=[
 ['abbey','Mourning Abbey','The first bell tolls for the faithful.','The Bellworn Prior','bell', ['#101723','#23343f','#3b5057','#81918b','#d4b780'],['Bell Thrall|hollow|club|bell','Ossuary Guard|knight|spear|cage','Veil Acolyte|wisp|staff|veil','Gutter Hound|hound|fang|chain','Iron Cantor|revenant|sword|bell']],
 ['tides','Drowned Reliquary','Here, the sea learned to remember.','The Widow of Tides','tide', ['#0c1920','#153b43','#286068','#79a69b','#c9c79b'],['Drowned Spearman|hollow|spear|shell','Tide Shade|wisp|staff|coral','Leech Host|revenant|sickle|parasite','Brine Crab|crawler|claw|shell','Lantern Widow|harpy|orb|lantern']],
 ['thorns','Thornwake Grove','Every root has tasted a name.','The Rootbound Regent','root', ['#111c1b','#2a3f31','#49604a','#8e9c71','#ccb880'],['Briar Knight|knight|axe|thorn','Root Stalker|hound|fang|root','Spore Monk|revenant|staff|mushroom','Grave Hart|hound|horn|antler','Thorn Weaver|crawler|claw|thorn']],
 ['forge','Cinderforge','The furnaces still pray for fuel.','The Furnace Saint','forge', ['#191621','#383640','#5a4a44','#b47a55','#f3bc74'],['Slag Thrall|hollow|hammer|slag','Coal Hound|hound|fang|ember','Iron Mason|brute|hammer|anvil','Furnace Wraith|wisp|orb|flame','Chain Warden|knight|axe|chain']],
 ['bones','Ivory Necropolis','Death is only another kind of court.','The King of Ashen Bones','bone', ['#171927','#3c3b48','#66616a','#b6ae99','#e6d5a0'],['Bone Archer|hollow|bow|horn','Carrion Scribe|revenant|staff|quill','Crypt Sentinel|knight|sword|tomb','Mourning Moth|harpy|orb|moth','Ossuary Colossus|brute|club|bone']],
 ['frost','Frostveil Bastion','The last watch has never ended.','The Pale Marshal','frost', ['#111c2d','#2b4258','#54738b','#adc8d1','#dce3ce'],['Rime Guard|knight|spear|ice','Ice Widow|crawler|claw|crystal','White Warg|hound|fang|fur','Hoarfrost Seer|wisp|staff|antler','Bell Runner|revenant|sickle|bell']],
 ['blood','Scarlet Catacombs','The heart beneath the stone still beats.','The Heart Beneath','heart', ['#221420','#48252e','#733f46','#b98078','#e5c397'],['Blood Penitent|hollow|sickle|thorns','Flayer Knight|knight|axe|skin','Crimson Oracle|wisp|orb|eye','Marrow Crawler|crawler|claw|bone','Vein Leech|hound|fang|parasite']],
 ['astral','Astral Archive','Read slowly. The stars are watching.','The Blind Astronomer','astral', ['#17182d','#333250','#575079','#a0a0c9','#ddd0ac'],['Star Gazer|revenant|staff|stars','Ink Shade|wisp|orb|quill','Lunar Construct|brute|hammer|moon','Unbound Quill|harpy|orb|quill','Void Scribe|hollow|spear|book']],
 ['gilded','Gilded Ruin','Gold cannot warm an empty throne.','The Last Sun-King','sun', ['#201b23','#46413b','#75684e','#bca676','#eddaa2'],['Sunfallen Knight|knight|sword|sun','Crownless Duelist|revenant|sword|crown','Gold Locust|crawler|claw|gold','Regent Shade|wisp|staff|crown','Oathbroken Seraph|harpy|spear|sun']],
 ['abyss','The Bell Below','One hundred steps. One final name.','The Hollow Sovereign','void', ['#0c1320','#202f3c','#3b4f5b','#7e9d9d','#e4c38d'],['Nameless Husk|hollow|sword|mask','Grave Choir|wisp|orb|bell','Void Stalker|hound|fang|void','Bell Bearer|brute|hammer|bell','Ember Devourer|harpy|claw|ember']]
];
export const BIOMES=biomeRows.map(([id,name,line,boss,theme,palette,enemies],index)=>({id,index,name,line,boss,theme,palette,from:index*10+1,to:index*10+10,enemies:enemies.map((s,i)=>{const [name,family,weapon,ornament]=s.split('|');return {id:`${id}-${i}`,name,family,weapon,ornament,biome:index,index:i,boss:false};})}));
const bossFamilies=['knight','harpy','brute','brute','brute','knight','heart','revenant','knight','seraph'];
export const ENEMIES=BIOMES.flatMap(b=>[...b.enemies,{id:`${b.id}-boss`,name:b.boss,family:bossFamilies[b.index],weapon:['bell','trident','axe','hammer','sword','spear','claw','staff','sword','sword'][b.index],ornament:b.theme,biome:b.index,index:5,boss:true}]);
for(const e of ENEMIES){
 e.asset=`enemy-${e.id}`;
 e.behavior=e.boss?'boss':e.family==='wisp'?'caster':e.family==='hound'?'charge':e.family==='crawler'?'ambush':e.family==='harpy'?'ranged':e.family==='brute'?'slam':e.weapon==='bow'?'archer':e.weapon==='spear'?'lancer':e.family==='revenant'?'duelist':'melee';
 e.airborne=e.boss?e.biome===7:['wisp','harpy','seraph'].includes(e.family);
 e.color=BIOMES[e.biome].palette[4];e.lore=e.boss?`${e.name} keeps the ${BIOMES[e.biome].name.toLowerCase()}. The bell has bound this soul to its final duty.`:`A ${e.name.toLowerCase()} of ${BIOMES[e.biome].name}. What remains of its oath has become its weapon.`;
}
export const ENEMY_BY_ID=Object.fromEntries(ENEMIES.map(e=>[e.id,e]));
export const ITEM_KINDS=['sword','daggers','staff','shield','armor','boots','ring','amulet','flask','elixir'];
export const EQUIP_SLOTS=['weapon','offhand','armor','boots','ring','amulet'];
const itemNames=[
 ['Vigil Longsword','Vesper Knives','Cantor Staff','Bellguard Shield','Pilgrim Cuirass','Abbey Greaves','Oathkeeper Ring','Mourning Medal','Hearthwater','Silent Incense'],
 ['Tideglass Blade','Brinefang Pair','Pearl Lantern','Barnacle Aegis','Drowned Mail','Tidemarch Boots','Widow Signet','Reliquary Pearl','Saltwater Draught','Mariner Tonic'],
 ['Briarbrand','Thorn Twins','Rootseer Crook','Wicker Ward','Barkbound Plate','Mosswalker Boots','Grove Covenant','Regent Acorn','Verdant Sap','Spore Balm'],
 ['Furnace Edge','Cinder Fangs','Coalheart Rod','Blackiron Bulwark','Foundry Harness','Slagstrider Boots','Smith Ring','Saint Coal','Ember Draught','Quicksilver'],
 ['Ivory Reaver','Ossuary Shivs','Mortuary Sceptre','Skullwall','Sepulchral Mail','Gravewarden Steps','Marrow Band','Funeral Cameo','Pale Nectar','Bone Dust'],
 ['Rimecrest','Frostbite Pair','Winter Spire','Glacier Ward','Marshal Plate','Whitewatch Boots','Hoarfrost Loop','Frozen Tear','Thawing Elixir','Northwind Oil'],
 ['Sanguine Vow','Vein Razors','Heartglass Rod','Bloodseal Shield','Penitent Plate','Scarlet Treads','Pulse Ring','Crimson Reliquary','Red Communion','Martyr Oil'],
 ['Moonletter','Astral Needles','Orrery Staff','Starward Mirror','Scribe Vestment','Comet Steps','Orbit Band','Blind Eye','Starlit Dew','Aether Ink'],
 ['Solstice Blade','Regicide Twins','Sunkeeper Staff','Gilded Aegis','Sovereign Plate','Courtward Boots','Fallen Crown Ring','Last Sun Medal','Auric Draught','Royal Myrrh'],
 ['Last Vow','Nameless Fangs','Gravebell Staff','Hollow Bulwark','Final Watch Plate','Vespergrave Steps','Unbroken Circle','Bell Below','Dawnwater','Sovereign Ash']
];
export const ITEMS=BIOMES.flatMap(b=>ITEM_KINDS.map((kind,k)=>({id:`item-${b.id}-${kind}`,name:itemNames[b.index][k],kind,biome:b.index,icon:b.index*10+k,slot:k<3?'weapon':k===3?'offhand':k<8?kind:null,hero:k<3?HEROES[k].id:null,lore:`${itemNames[b.index][k]} was carried through ${b.name.toLowerCase()}. Its worn engravings hold a promise the bell could not erase.`})));
export const ITEM_BY_ID=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
export const RARITIES=[{id:'worn',name:'Worn',color:'#9ba9a4',mult:1},{id:'tempered',name:'Tempered',color:'#8ac1ac',mult:1.18},{id:'relic',name:'Relic',color:'#a8a1db',mult:1.43},{id:'legendary',name:'Legendary',color:'#e6ba6d',mult:1.8}];
export const AFFIXES=[
 {id:'keen',name:'Keen',stat:'crit',value:4},{id:'stalwart',name:'Stalwart',stat:'defense',value:2},{id:'vital',name:'Vital',stat:'maxHp',value:9},{id:'swift',name:'Swift',stat:'speed',value:3},{id:'lucent',name:'Lucent',stat:'maxFocus',value:9},{id:'hungry',name:'Hungry',stat:'lifesteal',value:1},{id:'wrathful',name:'Wrathful',stat:'damage',value:3},{id:'unbroken',name:'Unbroken',stat:'staminaRegen',value:3}
];
export const DIFFICULTIES=[{id:'pilgrim',name:'Pilgrim',description:'A gentler descent. More healing, lighter enemy blows.',damage:.7,health:.85,flasks:5},{id:'oathbound',name:'Oathbound',description:'The intended trial. Patient combat and earned victories.',damage:1,health:1,flasks:3},{id:'forsaken',name:'Forsaken',description:'Merciless foes. For those who have heard the bell before.',damage:1.3,health:1.25,flasks:2}];
export const ONBOARDING=[
 {id:'onboard-1',heading:'No road leads only downward',text:'The dungeon branches in every direction. Follow unexplored passages, seek a guardian, and find its stair, lift or well. A descent can wait on any side of a chamber.',asset:'room-abbey'},
 {id:'onboard-2',heading:'Let your hands remember',text:'Touch the open floor and drag. The movement pad follows your thumb. Keep your other hand free for attack, guard, dodge and skills. An interaction appears only when something is within reach.',asset:'hero-knight'},
 {id:'onboard-3',heading:'Every promise leaves a mark',text:'Carry equipment, strengthen your skills, and choose what you give to the strangers below. Your choices and descent are saved. Death ends the journey; the embers you earn strengthen the next.',asset:'hero-seer'}
];
export const INTRO=[
 {id:'prologue-1',scene:0,heading:'THE LAST MORNING',text:'On the last morning of Vespergrave, the bells rang for a king who was afraid to die. No one knew they were hearing the dawn for the final time.'},
 {id:'prologue-2',scene:1,heading:'A CROWN AGAINST THE DARK',text:'He called his priests beneath the throne. Give me a kingdom that will never end, he said. They brought him a bell without a name.'},
 {id:'prologue-3',scene:2,heading:'THE PRICE OF FOREVER',text:'The king struck it once. The dead opened their eyes. He struck it twice. Their names vanished from the mouths of everyone who had loved them.'},
 {id:'prologue-4',scene:3,heading:'ONE HUNDRED FLOORS',text:'They buried the bell beneath a hundred floors of stone. Abbey and garden, furnace and frozen court. Ten realms became its prison. Ten keepers became its chains.'},
 {id:'prologue-5',scene:4,heading:'WHAT THE LIVING CARRY',text:'Above them, the fires grew small. Mothers forgot their children. Knights forgot their kings. Only an ember remained, and the promise of a morning no one could remember.'},
 {id:'prologue-6',scene:5,heading:'THREE UNFINISHED OATHS',text:'A knight who will break his final oath. A hunter who will return the stolen names. A seer who still hears a star beyond the dark. One of them must carry the ember below.'},
 {id:'prologue-7',scene:6,heading:'THE ROADS BENEATH',text:'There is no straight road to the last bell. The halls divide. Strangers bargain for blood, memory and mercy. Choose your path, wanderer. The stone will remember what you become.'},
 {id:'prologue-8',scene:7,heading:'ANSWER WITH THE DAWN',text:'And when the hollow sovereign speaks your name, do not answer with fear. Carry the last ember. Break the final chain. Let Vespergrave see the dawn.'}
];
export const ENDINGS=[
 {id:'ending-silence',scene:8,heading:'AT LAST, THE BELLS ARE SILENT',text:'You broke the hollow crown, and gave the stolen names to morning. The dead lie still. Above the ruined kingdom, the first bird begins to sing.'},
 {id:'ending-keeper',scene:8,heading:'THE LAST KEEPER',text:'You took the bell into your hands, and held the darkness where it stood. The world will never know your name. But it will see another dawn.'}
];
export const TUTORIAL_STEPS=[
 {id:'move',title:'Find your footing',text:'Touch any open part of the arena and drag. The floating D-pad follows your thumb. Move toward the pale rune.',key:'MOVE'},
 {id:'attack',title:'Steel has a rhythm',text:'Face the practice effigy and hold ATTACK. Your third strike is a heavy finisher. Let stamina recover between combinations.',key:'ATTACK'},
 {id:'roll',title:'Pass through danger',text:'Drag to choose a direction, then tap ROLL as the red warning blooms. A dodge briefly protects you.',key:'ROLL'},
 {id:'skill',title:'Remember your oath',text:'Tap your first skill to unleash its power. Skills spend focus and need time to recover.',key:'SKILL'},
 {id:'flask',title:'Keep the ember alive',text:'Tap the flask to restore health. Charges return at a hearth, and after each floor guardian.',key:'HEAL'},
 {id:'gate',title:'The descent begins',text:'Approach the north gate and tap USE. The bell is waiting. Equipment and skills are always available from the satchel.',key:'USE'}
];
export const ROOM_LAYOUTS=[
 {id:'nave',name:'Processional Hall',header:'cloister'},
 {id:'cloister',name:'Pillared Cloister',header:'cloister'},
 {id:'bridge',name:'Shattered Span',header:'broken'},
 {id:'crypt',name:'The Sleeping Vault',header:'crypt'},
 {id:'cistern',name:'The Sunken Court',header:'broken'},
 {id:'gallery',name:'Gallery of Watchers',header:'crypt'},
 {id:'arena',name:'The Ring of Oaths',header:'throne'},
 {id:'crossing',name:'The Fourfold Crossing',header:'throne'},
 {id:'archive',name:'The Sealed Stacks',header:'cloister'},
 {id:'grove',name:'Rootbound Sanctuary',header:'broken'},
 {id:'foundry',name:'The Iron Assembly',header:'crypt'},
 {id:'ritual',name:'The Candle Court',header:'throne'},
 {id:'barracks',name:'The Forsaken Barracks',header:'cloister'},
 {id:'reliquary',name:'The Quiet Reliquary',header:'throne'},
 {id:'aqueduct',name:'The Blackwater Aqueduct',header:'broken'},
 {id:'prison',name:'The Warden’s Cells',header:'crypt'},
 {id:'ossuary',name:'The Bone Procession',header:'crypt'},
 {id:'observatory',name:'The Fallen Observatory',header:'throne'},
 {id:'rotunda',name:'The Crownless Rotunda',header:'broken'},
 {id:'sanctum',name:'The Divided Sanctum',header:'cloister'}
];
export const EVENTS=[
 {id:'blood-altar',name:'The Altar That Drinks',layout:'ritual',art:0,prop:'altar',description:'Warmth rises from the stone. A voice beneath it offers a relic for a measure of the blood you still possess.',choices:[{id:'offer',label:'Offer your blood',detail:'Lose 22% maximum health. Receive a relic or better.'},{id:'leave',label:'Keep your blood',detail:'Leave the altar undisturbed.'}]},
 {id:'cursed-cache',name:'A Coffer Without a Key',layout:'crypt',art:1,prop:'coffer',description:'Something inside the iron coffer is breathing. Its seal bears the same mark as the souls waiting beyond the walls.',choices:[{id:'open',label:'Break the seal',detail:'Survive an ambush. Claim a relic and gold.'},{id:'leave',label:'Let it sleep',detail:'Leave the coffer sealed.'}]},
 {id:'lost-pilgrim',name:'The Last Pilgrim',layout:'cloister',art:2,prop:'pilgrim',description:'A wounded traveller holds an empty flask. “I remember the way,” she whispers, “but I have forgotten why I came.”',choices:[{id:'flask',label:'Share your hearthwater',detail:'Spend one flask charge. Receive an offering and 6 essence.'},{id:'gold',label:'Leave a small offering',detail:'Spend 25 gold. Receive 6 essence and a little healing.'},{id:'leave',label:'Offer only a prayer',detail:'Let the pilgrim rest.'}]},
 {id:'oath-shrine',name:'Three Unbroken Promises',layout:'ritual',art:3,prop:'shrine',description:'Three candles survive on a windless altar. Each flame remembers a different promise. Only one will answer you.',choices:[{id:'steel',label:'Swear to the blade',detail:'Gain 5 damage for this descent.'},{id:'vigor',label:'Swear to the living',detail:'Gain 20 maximum health and restore 20 health.'},{id:'stars',label:'Swear to the silent stars',detail:'Gain 25 maximum focus and restore your focus.'}]},
 {id:'sealed-library',name:'The Book of Borrowed Names',layout:'archive',art:4,prop:'lectern',description:'A chained manuscript turns its own pages. It can teach you what the dead have learned—or call them to defend its knowledge.',choices:[{id:'read',label:'Read a borrowed name',detail:'Gain experience and 5 essence.'},{id:'unbind',label:'Unbind the manuscript',detail:'Defeat its guardians. Claim a relic and 9 essence.'},{id:'leave',label:'Close the book',detail:'Leave the names in peace.'}]},
 {id:'trap-vault',name:'The Vault of Falling Stars',layout:'bridge',art:5,prop:'hourglass',description:'A sealed offering waits beyond a circle of pressure stones. A sandglass gives you twelve seconds to prove that you still belong among the living.',choices:[{id:'trial',label:'Enter the trial',detail:'Survive twelve seconds of marked impacts. Receive a relic and gold.'},{id:'leave',label:'Leave the sand untouched',detail:'The vault remains silent.'}]},
 {id:'wandering-smith',name:'The Smith Without a Fire',layout:'foundry',art:6,prop:'smith',description:'The smith strikes cold iron, and sparks fall upward. “Your weapon has another oath in it. Shall I wake it?”',choices:[{id:'temper',label:'Temper your weapon',detail:'Spend gold to increase your equipped weapon’s damage by 20%.'},{id:'leave',label:'Keep the old edge',detail:'Leave your weapon unchanged.'}]},
 {id:'shadow-duel',name:'Your Shadow Arrived First',layout:'arena',art:7,prop:'mirror',description:'The mirror shows a chamber you have not entered. A champion on the other side raises a weapon and waits for your answer.',choices:[{id:'duel',label:'Answer the challenge',detail:'Defeat one empowered champion. Receive a relic weapon.'},{id:'leave',label:'Turn away',detail:'The reflection lowers its blade.'}]},
 {id:'restless-bell',name:'The Bell That Calls Twice',layout:'crossing',art:8,prop:'bell',description:'A bell hangs above a bed of ashes. Its inscription promises a sovereign’s offering to the soul that can endure three answers.',choices:[{id:'ring',label:'Ring the bell',detail:'Survive three waves of enemies. Claim a legendary offering.'},{id:'leave',label:'Pass in silence',detail:'Wake nothing beneath the ash.'}]},
 {id:'memory-vow',name:'The Weight of a Name',layout:'grove',art:9,prop:'memory',description:'A pale root offers to carry some part of you. What you surrender will return as strength, but the memory will remain below.',choices:[{id:'fury',label:'Surrender your safety',detail:'Lose 15 maximum health. Gain 9 damage for this descent.'},{id:'mercy',label:'Surrender your wrath',detail:'Lose 3 damage. Gain 30 maximum health and restore 30 health.'},{id:'leave',label:'Keep your own name',detail:'Leave without a vow.'}]}
];
export const EVENT_BY_ID=Object.fromEntries(EVENTS.map(e=>[e.id,e]));

export const VO_SCRIPT=[...INTRO.map(x=>({...x,voice:'aura-2-draco-en'})),...ENDINGS.map(x=>({...x,voice:'aura-2-draco-en'})),...BIOMES.map(b=>({id:'biome-'+b.id,text:b.name+'. '+b.line,voice:'aura-2-draco-en'})),...ENEMIES.filter(e=>e.boss).map(e=>({id:'boss-'+e.biome,text:e.name+'. The bell demands another soul.',voice:'aura-2-draco-en'})),...HEROES.map(h=>({id:'hero-'+h.id,text:h.line,voice:h.id==='rogue'?'aura-2-pandora-en':h.id==='seer'?'aura-2-orpheus-en':'aura-2-draco-en'})),...ONBOARDING.map(x=>({id:x.id,text:x.heading+'. '+x.text,voice:'aura-2-draco-en'})),...TUTORIAL_STEPS.map(x=>({id:'practice-'+x.id,text:x.title+'. '+x.text,voice:'aura-2-draco-en'})),...EVENTS.map(e=>({id:'event-'+e.id,text:e.description+' '+e.choices.map(c=>c.label+'. '+c.detail).join(' '),voice:e.id==='lost-pilgrim'?'aura-2-pandora-en':e.id==='wandering-smith'?'aura-2-draco-en':'aura-2-orpheus-en'}))];
export const SHOT_STAGING=[{focus:'50% 36%',motion:'rise',tone:'dawn'},{focus:'52% 42%',motion:'approach',tone:'crown'},{focus:'50% 48%',motion:'reveal',tone:'bell'},{focus:'50% 60%',motion:'descend',tone:'abyss'},{focus:'44% 55%',motion:'drift',tone:'embers'},{focus:'50% 48%',motion:'approach',tone:'oaths'},{focus:'50% 58%',motion:'descend',tone:'roads'},{focus:'50% 40%',motion:'approach',tone:'sovereign'},{focus:'50% 40%',motion:'rise',tone:'dawn'}];
