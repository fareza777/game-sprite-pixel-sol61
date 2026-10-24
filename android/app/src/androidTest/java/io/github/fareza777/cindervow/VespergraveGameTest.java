package io.github.fareza777.cindervow;

import static org.junit.Assert.*;
import android.content.res.Configuration;
import android.graphics.Bitmap;
import android.os.SystemClock;
import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import java.io.File;
import java.io.FileOutputStream;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public class VespergraveGameTest {
    private MainActivity activity;
    private Object js(String expression) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> activity.gameView().evaluateJavascript(expression, value -> { result.set(value); done.countDown(); }));
        assertTrue("JavaScript callback timed out", done.await(10, TimeUnit.SECONDS));
        return new JSONTokener(result.get()).nextValue();
    }
    private JSONObject snapshot() throws Exception { return new JSONObject((String) js("JSON.stringify(window.Vespergrave.snapshot())")); }
    private boolean await(String expression, long timeout) throws Exception {
        long deadline = SystemClock.uptimeMillis() + timeout;
        while (SystemClock.uptimeMillis() < deadline) { if (Boolean.TRUE.equals(js(expression))) return true; SystemClock.sleep(70); }
        return false;
    }
    private void ready() throws Exception {
        assertTrue("Offline campaign did not initialize", await("!!window.Vespergrave && document.getElementById('loading').hidden",25000));
    }
    private void click(String selector) throws Exception {
        assertTrue("Missing enabled control: " + selector, Boolean.TRUE.equals(js("(()=>{const b=document.querySelector(\""+selector+"\");if(!b||b.disabled)return false;b.click();return true;})()")));
    }
    private void pointer(String target, String event, int id, double x, double y) throws Exception {
        js("(()=>{const e=document.querySelector('"+target+"'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('"+event+"',{pointerId:"+id+",pointerType:'touch',bubbles:true,cancelable:true,clientX:r.left+r.width*"+x+",clientY:r.top+r.height*"+y+"}));return true;})()");
    }
    private void screenshot(File folder, String name) throws Exception {
        CountDownLatch drawn = new CountDownLatch(1);
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> activity.gameView().postVisualStateCallback(SystemClock.uptimeMillis(),new android.webkit.WebView.VisualStateCallback(){@Override public void onComplete(long requestId){drawn.countDown();}}));
        assertTrue("WebView did not commit its visual state",drawn.await(5,TimeUnit.SECONDS));
        SystemClock.sleep(500);
        Bitmap bitmap = InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
        try (FileOutputStream out = new FileOutputStream(new File(folder,name))) { assertTrue(bitmap.compress(Bitmap.CompressFormat.PNG,100,out)); }
    }
    private void eventFixture(String id) throws Exception {
        assertTrue("No seeded event fixture found",Boolean.TRUE.equals(js("(()=>{const g=window.Vespergrave.game;for(let seed=1;seed<1000;seed++){const c=new g.constructor({seed,hero:'seer',difficulty:'pilgrim',height:g.arena.height}),r=c.layout.rooms.find(r=>r.event?.id==='"+id+"');if(r){c.enterRoom(r.id);Object.assign(g,c);g.player.x=g.eventPosition().x;g.player.y=g.eventPosition().y+35;g.player.invuln=100;g.events=[];g.notify('An encounter waits beneath the bell.',.5);return true;}}return false;})()")));
        SystemClock.sleep(250);
    }
    private void controlsDoNotOverlap() throws Exception {
        assertTrue("Battle buttons overlap, are too small, or leave the screen",Boolean.TRUE.equals(js("(()=>{const a=[...document.querySelectorAll('.touch-action,.icon-button,.map-button')].filter(e=>!e.hidden&&e.getClientRects().length&&!e.closest('[hidden]')).map(e=>e.getBoundingClientRect());return a.every(r=>r.width>=44&&r.height>=35&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight)&&a.every((r,i)=>a.slice(i+1).every(s=>r.right+5<=s.left||s.right+5<=r.left||r.bottom+5<=s.top||s.bottom+5<=r.top));})()")));
    }
    @Test public void cinematicBranchingAndRefinedSatchel() throws Exception {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            scenario.onActivity(value->activity=value);ready();
            File folder=new File(activity.getExternalFilesDir(null),"verification");folder.mkdirs();
            js("localStorage.setItem('vespergrave.v3.profile',JSON.stringify({version:3,onboarded:true,introSeen:true,tutorialDone:true}));location.reload();true");SystemClock.sleep(400);ready();
            click("[data-command='more']");click("[data-command='replay-intro']");
            for(int n=1;n<=8;n++){
                assertTrue("Prologue clip "+n+" never played offline",await("document.getElementById('app').dataset.narration==='prologue-"+n+"'&&document.getElementById('app').dataset.narrationState==='playing'",10000));
                assertTrue(Boolean.TRUE.equals(js("document.getElementById('spoken-caption').textContent.length>15&&[...document.querySelectorAll('.story-art img')].every(i=>i.complete&&i.naturalWidth>0)")));
                if(n==6)screenshot(folder,"vespergrave-oaths-cinematic.png");
                if(n==1){assertTrue("Narration ending must advance the shot automatically",await("document.getElementById('app').dataset.narration==='prologue-2'&&document.getElementById('app').dataset.narrationState==='playing'",20000));continue;}
                click("[data-command='cinematic-next']");
            }
            assertTrue(await("window.Vespergrave.snapshot().panel==='title'",3000));
            click("[data-command='new-game']");click("[data-hero='knight']");click("#begin");
            if(Boolean.TRUE.equals(js("!!document.querySelector('[data-command=confirm-new]')")))click("[data-command='confirm-new']");
            assertTrue(await("window.Vespergrave.snapshot().hero==='knight'&&window.Vespergrave.snapshot().state==='playing'",10000));
            assertTrue(Boolean.TRUE.equals(js("Object.keys(window.Vespergrave.game.room.doors).length>=3")));
            assertTrue(Boolean.TRUE.equals(js("document.getElementById('skill-icon-2').parentElement.hidden")));
            controlsDoNotOverlap();screenshot(folder,"vespergrave-clean-battle.png");
            click("#open-map");assertTrue(await("document.getElementById('floor-map')!==null",2000));screenshot(folder,"vespergrave-branch-map.png");click("[data-command='resume']");
            js("(()=>{const g=window.Vespergrave.game;g.level=10;g.essence=40;g.recalculate();g.player.focus=g.player.maxFocus;g.equipSkill('iron-requiem',1);for(let n=0;n<18;n++)g.loot();const base=g.inventory.find(i=>i.uid===g.equipment.weapon);g.inventory.push({...base,uid:'proof-relic',name:'Merciful Vigil Longsword',quality:2,level:8,stats:{damage:3,crit:17},value:144});return true;})()");
            SystemClock.sleep(250);click("#open-bag");assertTrue(await("document.querySelectorAll('.doll-slot').length===6&&document.querySelectorAll('.relic-tile').length>15",3000));screenshot(folder,"vespergrave-satchel-redesign.png");
            click("[data-item='proof-relic']");assertTrue(await("document.querySelector('.relic-detail .loss')!==null&&document.querySelector('.relic-detail .gain')!==null",3000));screenshot(folder,"vespergrave-relic-comparison.png");click("[data-command='item-close']");
            click("[data-filter='consumables']");assertTrue(Boolean.TRUE.equals(js("[...document.querySelectorAll('.relic-tile')].every(e=>!e.querySelector('b'))")));click("[data-filter='all']");
            click("[data-bag-tab='skills']");click("[data-command='preview-skill'][data-id='last-light']");assertTrue(await("document.getElementById('skill-preview')!==null",3000));screenshot(folder,"vespergrave-skill-art.png");click("[data-command='bag']");click("[data-command='close']");
            controlsDoNotOverlap();click("#touch-pause");click("[data-command='settings']");js("(()=>{const e=document.getElementById('setting-large');e.checked=true;e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()");click("[data-command='close']");click("[data-command='resume']");controlsDoNotOverlap();
            js("(()=>{const g=window.Vespergrave.game,goal=g.layout.rooms.find(r=>r.type==='guardian');g.enterRoom(goal.id);for(const e of [...g.enemies])g.hitEnemy(e,100000);const exit=g.exitPosition();g.player.x=exit.x;g.player.y=exit.y+28;g.player.face='n';g.player.aim=-Math.PI/2;g.toastTime=0;g.effects=[];g.corpses=[];return true;})()");
            assertTrue(await("!document.getElementById('context').hidden&&document.getElementById('context').textContent.includes('Descend')",3000));controlsDoNotOverlap();screenshot(folder,"vespergrave-physical-descent.png");pointer("#context","pointerdown",91,.5,.5);pointer("#context","pointerup",91,.5,.5);assertTrue(await("window.Vespergrave.game.floor===2",3000));
            JSONObject report=new JSONObject().put("passed",true).put("eightOfflinePrologueClipsPlayed",true).put("voiceEndingAdvancesCinematic",true).put("branchingEntrance",true).put("nonOverlappingBattleButtons",true).put("largeControls",true).put("map",true).put("relicComparison",true).put("castingPreview",true).put("physicalDescent",true);
            try(FileOutputStream out=new FileOutputStream(new File(folder,"vespergrave-refinement-report.json"))){out.write(report.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));}
        }
    }
    @Test public void proceduralArchitectureAndInteractiveEvents() throws Exception {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            scenario.onActivity(value->activity=value);ready();
            js("localStorage.setItem('vespergrave.v3.profile',JSON.stringify({version:3,onboarded:true,introSeen:true,tutorialDone:true}));location.reload();true");
            SystemClock.sleep(400);ready();click("[data-command='new-game']");click("[data-hero='seer']");click("#begin");
            if(Boolean.TRUE.equals(js("!!document.querySelector('[data-command=confirm-new]')")))click("[data-command='confirm-new']");
            assertTrue(await("window.Vespergrave.snapshot().hero==='seer'&&window.Vespergrave.snapshot().state==='playing'",10000));
            File folder=new File(activity.getExternalFilesDir(null),"verification");folder.mkdirs();
            String[] layouts={"nave","cloister","bridge","crypt","cistern","gallery","arena","crossing","archive","grove","foundry","ritual","barracks","reliquary","aqueduct","prison","ossuary","observatory","rotunda","sanctum"};
            int roomPreview=0;
            for(String layout:layouts){
                int variant=roomPreview++;
                js("(()=>{const g=window.Vespergrave.game;g.layout.roomId=g.layout.rooms["+variant+"%g.layout.rooms.length].id;g.floor=1+("+variant+"%10)*10;g.room.type='combat';g.room.event=null;g.room.layout='"+layout+"';g.enemies=[];g.room.cleared=true;g.resize(g.arena.height);g.player.x=180;g.player.y=(g.arena.bounds.top+g.arena.bounds.bottom)/2+70;g.safePosition(g.player);g.player.face='s';g.player.aim=Math.PI/2;g.toastTime=0;return true;})()");
                assertTrue(await("document.getElementById('game').dataset.roomLayout==='"+layout+"'",2500));
                assertTrue(Boolean.TRUE.equals(js("(()=>{const g=window.Vespergrave.game;return !g.solid(g.player.x,g.player.y);})()")));
                screenshot(folder,"vespergrave-room-"+layout+".png");
            }
            eventFixture("oath-shrine");pointer(".touch-action[data-action=interact]","pointerdown",81,.5,.5);pointer(".touch-action[data-action=interact]","pointerup",81,.5,.5);
            assertTrue("Event interaction did not open its choices",await("document.getElementById('app').dataset.screen==='event'&&document.querySelectorAll('[data-event-choice]').length===3",4000));
            assertTrue(await("document.getElementById('event-art').complete&&document.getElementById('event-art').naturalWidth>0",4000));
            screenshot(folder,"vespergrave-event-choice.png");
            click("[data-event-choice='stars']");
            assertTrue(await("window.Vespergrave.game.room.event.status==='resolved'&&window.Vespergrave.game.blessings.maxFocus===25&&JSON.parse(localStorage.getItem('vespergrave.v3.run')).blessings.maxFocus===25",3000));
            eventFixture("restless-bell");pointer(".touch-action[data-action=interact]","pointerdown",82,.5,.5);pointer(".touch-action[data-action=interact]","pointerup",82,.5,.5);
            assertTrue(await("document.querySelector('[data-event-choice=ring]')!==null",3000));click("[data-event-choice='ring']");
            assertTrue(await("!document.getElementById('event-hud').hidden&&document.getElementById('event-progress').textContent.includes('WAVE 1 / 3')",4000));
            screenshot(folder,"vespergrave-event-wave.png");
            js("(()=>{const g=window.Vespergrave.game;for(const e of [...g.enemies])g.hitEnemy(e,100000);return true;})()");
            assertTrue(await("window.Vespergrave.game.room.event.wave===2&&window.Vespergrave.game.enemies.length===2",4000));
            assertTrue(Boolean.TRUE.equals(js("window.Vespergrave.game.roomLocked()")));
            eventFixture("trap-vault");pointer(".touch-action[data-action=interact]","pointerdown",83,.5,.5);pointer(".touch-action[data-action=interact]","pointerup",83,.5,.5);
            assertTrue(await("document.querySelector('[data-event-choice=trial]')!==null",3000));click("[data-event-choice='trial']");
            assertTrue(await("window.Vespergrave.game.dangers.some(a=>a.enemy&&a.timer>0)&&!document.getElementById('event-hud').hidden",4000));
            screenshot(folder,"vespergrave-event-trial.png");
            click("#touch-pause");double remaining=((Number)js("window.Vespergrave.game.room.event.remaining")).doubleValue();
            SystemClock.sleep(400);assertEquals(remaining,((Number)js("window.Vespergrave.game.room.event.remaining")).doubleValue(),.001);
            click("[data-command='save-title']");click("[data-command='continue']");
            assertTrue(await("window.Vespergrave.game?.room.event?.status==='active'&&window.Vespergrave.game.roomLocked()",10000));
            assertTrue(((Number)js("window.Vespergrave.game.room.event.remaining")).doubleValue()<=remaining);
            JSONObject report=new JSONObject().put("passed",true).put("roomLayouts",20).put("interactiveEventChoices",true).put("boonSaved",true).put("threeWaveEncounter",true).put("timedTrialWarnings",true).put("pauseFreezesTrial",true).put("resumeKeepsTrial",true);
            try(FileOutputStream out=new FileOutputStream(new File(folder,"vespergrave-event-report.json"))){out.write(report.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));}
        }
    }
    private void preparedHero(String hero) throws Exception {
        click("[data-command='new-game']");click("[data-hero='"+hero+"']");click("#begin");
        if(Boolean.TRUE.equals(js("!!document.querySelector('[data-command=confirm-new]')")))click("[data-command='confirm-new']");
        assertTrue(await("window.Vespergrave.snapshot().hero==='"+hero+"'&&window.Vespergrave.snapshot().state==='playing'",12000));
    }
    private void combatFixture() throws Exception {
        js("(()=>{const g=window.Vespergrave.game;g.tutorial=null;g.enemies=[];g.projectiles=[];g.dangers=[];g.effects=[];g.room.type='combat';g.room.role='combat';g.room.event=null;g.room.layout='arena';g.room.cleared=false;g.room.phase2=false;g.arena=g.makeGeometry(g.room);g.arena.colliders=[];g.player.x=180;g.player.y=350;g.player.action='idle';g.player.at=0;g.player.aim=-Math.PI/2;g.player.invuln=0;g.player.stamina=100;g.level=10;g.essence=60;g.recalculate();g.player.hp=g.player.maxHp;g.player.focus=g.player.maxFocus;const e=g.spawn('abbey-0',180,315);e.hp=e.maxHp=50000;e.phase='hurt';e.timer=100;e.aim=-Math.PI/2;g.toastTime=0;g.freeze=0;return true;})()");
    }
    private void returnToTitle() throws Exception {
        js("window.Vespergrave.pauseForBackground();location.reload();true");SystemClock.sleep(400);ready();
    }
    @Test public void evolvedCombatEquipmentAndAwakenedBosses() throws Exception {
        try(ActivityScenario<MainActivity> scenario=ActivityScenario.launch(MainActivity.class)){
            scenario.onActivity(value->activity=value);ready();
            js("localStorage.setItem('vespergrave.v3.profile',JSON.stringify({version:3,onboarded:true,introSeen:true,tutorialDone:true}));location.reload();true");SystemClock.sleep(400);ready();
            File folder=new File(activity.getExternalFilesDir(null),"verification");folder.mkdirs();
            preparedHero("knight");combatFixture();
            js("(()=>{const g=window.Vespergrave.game,base=g.inventory[0];for(const kind of ['sword','armor','boots','shield','ring','amulet'])g.inventory.push({...base,uid:'evolved-'+kind,baseId:'item-gilded-'+kind,name:'The Sun-King’s '+kind,quality:3,level:80,stats:kind==='sword'?{damage:12,crit:7}:kind==='armor'?{defense:8,maxHp:24}:kind==='boots'?{speed:4,staminaRegen:4}:{maxFocus:5},value:190});return true;})()");
            click("#open-bag");
            for(String kind:new String[]{"sword","armor","boots","shield","ring","amulet"}){
                click("[data-item='evolved-"+kind+"']");
                assertTrue("Relic inspection must explain its working art",await("document.querySelector('.item-relic-art')!==null",2500));
                click("[data-command='item-equip']");
                assertTrue(await("document.querySelector('.relic-synergies')!==null",2500));
            }
            assertTrue(await("(()=>{const a=JSON.parse(document.getElementById('game').dataset.equipment);return a.weapon===3&&a.armor===3&&a.boots===3&&a.offhand&&a.ring&&a.amulet;})()",2500));
            screenshot(folder,"vespergrave-v32-visible-equipment.png");
            click("[data-bag-tab='skills']");
            for(int n=0;n<3;n++)click("[data-command='skill-upgrade'][data-id='iron-requiem']");
            assertTrue(await("[...document.querySelectorAll('.rank-benefit')].some(e=>e.textContent.includes('8s ward'))",3000));
            click("[data-command='skill-equip'][data-id='iron-requiem'][data-slot='1']");
            screenshot(folder,"vespergrave-v32-skill-ranks.png");click("[data-command='close']");controlsDoNotOverlap();
            pointer(".touch-action.guard","pointerdown",121,.5,.5);
            assertTrue(await("window.Vespergrave.game.player.action==='block'",1000));
            assertTrue(Boolean.TRUE.equals(js("(()=>{const g=window.Vespergrave.game;g.player.at=.08;const hp=g.player.hp;g.damagePlayer(30,g.enemies[0]);return g.player.hp===hp&&g.player.riposte>1.7;})()")));
            // Freeze a demonstrated native key pose long enough for visual QA.
            js("window.Vespergrave.game.freeze=1.2;true");screenshot(folder,"vespergrave-v32-parry.png");
            pointer(".touch-action.guard","pointerup",121,.5,.5);js("window.Vespergrave.game.freeze=0;true");
            pointer(".touch-action.attack","pointerdown",122,.5,.5);
            assertTrue("Touch attack did not consume the parry opening",await("window.Vespergrave.game.player.riposteAttack===true",1000));
            SystemClock.sleep(180);pointer(".touch-action.attack","pointerup",122,.5,.5);
            assertTrue(await("window.Vespergrave.game.enemies[0].hp<50000",1500));
            returnToTitle();preparedHero("rogue");combatFixture();
            pointer(".touch-action.attack","pointerdown",123,.5,.5);
            assertTrue("A real rear attack must trigger a backstab",await("window.Vespergrave.game.player.backstabCue>0",1500));
            js("window.Vespergrave.game.freeze=1.2;true");screenshot(folder,"vespergrave-v32-backstab.png");pointer(".touch-action.attack","pointerup",123,.5,.5);js("window.Vespergrave.game.freeze=0;true");
            returnToTitle();preparedHero("seer");combatFixture();
            pointer(".touch-action.attack","pointerdown",124,.5,.5);
            assertTrue("Touch hold must build spell power",await("window.Vespergrave.game.player.action==='charge'&&window.Vespergrave.game.player.charge>.85",2500));
            assertTrue(Boolean.TRUE.equals(js("document.querySelector('.touch-action.attack').classList.contains('charging')")));
            js("window.Vespergrave.game.freeze=1.2;true");screenshot(folder,"vespergrave-v32-charged-mage.png");js("window.Vespergrave.game.freeze=0;true");pointer(".touch-action.attack","pointerup",124,.5,.5);
            assertTrue("Release must launch a real damaging charged spell",await("window.Vespergrave.game.enemies[0].hp<50000",2200));
            String[] realms={"abbey","tides","thorns","forge","bones","frost","blood","astral","gilded","abyss"};
            for(int biome=0;biome<10;biome++){
                final int floor=(biome+1)*10;
                js("(()=>{const g=window.Vespergrave.game;g.floor="+floor+";g.enemies=[];g.projectiles=[];g.dangers=[];g.effects=[];g.corpses=[];g.room.type='boss';g.room.role='boss';g.room.layout='arena';g.room.event=null;g.room.phase2=false;g.room.phaseClock=0;g.room.cleared=false;g.arena=g.makeGeometry(g.room);g.bossHazardTimer=1;g.player.x=180;g.player.y=g.arena.bounds.bottom-65;g.safePosition(g.player);g.player.hp=g.player.maxHp;g.player.invuln=100;g.player.action='idle';g.player.at=0;g.freeze=0;const e=g.spawn('"+realms[biome]+"-boss',180,g.arena.bounds.top+95);e.hp=e.maxHp*.45;g.events.push({type:'floor',floor:g.floor,biome:g.biome.id});return true;})()");
                assertTrue("Boss arena "+realms[biome]+" did not awaken",await("window.Vespergrave.game.arena.phase2&&window.Vespergrave.game.dangers.some(d=>d.arenaHazard)",4000));
                assertTrue(Boolean.TRUE.equals(js("document.getElementById('boss-name').textContent.includes('AWAKENED')")));
                js("window.Vespergrave.game.freeze=1.2;true");screenshot(folder,"vespergrave-v32-boss-"+realms[biome]+".png");
            }
            assertTrue(Boolean.TRUE.equals(js("(()=>{const g=window.Vespergrave.game;for(let seed=1;seed<100;seed++){const c=new g.constructor({seed,hero:'seer',height:g.arena.height});if(!c.layout.shortcuts.length)continue;const gate=c.layout.shortcuts[0];c.enterRoom(gate.switchRoom);for(const e of [...c.enemies])c.hitEnemy(e,100000);c.room.cleared=true;c.player.x=c.arena.switch.x;c.player.y=c.arena.switch.y;c.player.invuln=100;c.freeze=0;c.toastTime=0;Object.assign(g,c);return true;}return false;})()")));
            assertTrue(await("!document.getElementById('context').hidden&&document.getElementById('context').textContent.includes('lever')",3000));
            screenshot(folder,"vespergrave-v32-shortcut-lever.png");pointer("#context","pointerdown",125,.5,.5);pointer("#context","pointerup",125,.5,.5);
            assertTrue(await("window.Vespergrave.game.layout.shortcuts[0].open",2500));
            js("window.Vespergrave.pauseForBackground();true");
            assertTrue(Boolean.TRUE.equals(js("JSON.parse(localStorage.getItem('vespergrave.v3.run')).layout.shortcuts[0].open")));
            returnToTitle();click("[data-command='continue']");
            assertTrue("Opened shortcut must survive a real reload and Continue",await("window.Vespergrave.game?.layout.shortcuts?.[0]?.open&&window.Vespergrave.game.room.switchActivated",10000));
            JSONObject report=new JSONObject().put("passed",true).put("touchParryAndRiposte",true).put("touchBackstab",true).put("holdReleaseChargedSpell",true).put("visibleSixSlotEquipment",true).put("honestRankBenefits",true).put("tenAwakenedBossArenas",10).put("leverSurvivesReload",true).put("keyPoseScreenshotsUseTemporaryFixtureFreeze",true);
            try(FileOutputStream out=new FileOutputStream(new File(folder,"vespergrave-evolution-report.json"))){out.write(report.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));}
        }
    }
    @Test public void fullOfflineCampaignFlowsAndPortraitControls() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            scenario.onActivity(value -> activity = value); ready();
            js("localStorage.removeItem('vespergrave.v3.run');localStorage.removeItem('vespergrave.v3.profile');localStorage.removeItem('vespergrave.v3.settings');location.reload();true");
            SystemClock.sleep(400); ready();
            assertEquals(Configuration.ORIENTATION_PORTRAIT,activity.getResources().getConfiguration().orientation);
            assertEquals("en",js("document.documentElement.lang"));
            assertEquals("Vespergrave",activity.getString(io.github.fareza777.cindervow.R.string.app_name));
            assertTrue(Boolean.TRUE.equals(js("window.Vespergrave.snapshot().panel==='title'")));
            assertTrue("Arena must fill the Android viewport",Boolean.TRUE.equals(js("(()=>{const r=document.getElementById('game').getBoundingClientRect();return r.left===0&&r.top===0&&Math.abs(r.width-innerWidth)<1&&Math.abs(r.height-innerHeight)<1&&document.documentElement.scrollHeight<=innerHeight;})()")));
            assertTrue(Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            File folder = new File(activity.getExternalFilesDir(null),"verification"); folder.mkdirs();
            screenshot(folder,"vespergrave-title.png");
            click("[data-command='new-game']");
            assertTrue(await("document.querySelectorAll('[data-hero]').length===3",3000));
            click("[data-hero='seer']");
            assertTrue(await("document.querySelector('[data-hero-art=seer]').complete",5000));
            screenshot(folder,"vespergrave-heroes.png");
            click("#begin");assertTrue(await("document.querySelector('[data-command=onboarding-next]')!==null",3000));
            click("[data-command='onboarding-next']");click("[data-command='onboarding-next']");click("[data-command='onboarding-next']");
            assertTrue("Opening cinematic must play bundled narration",await("document.getElementById('app').dataset.narration==='prologue-1'&&document.getElementById('app').dataset.narrationState==='playing'",10000));
            screenshot(folder,"vespergrave-cinematic.png");
            click("[data-command='cinematic-skip']");
            assertTrue("Mage practice did not begin",await("window.Vespergrave.snapshot().hero==='seer'&&window.Vespergrave.snapshot().tutorial===0",10000));
            assertEquals(360,((Number)js("document.getElementById('game').width")).intValue());
            assertTrue(Boolean.TRUE.equals(js("window.Vespergrave.snapshot().layout.height+32===document.getElementById('game').height")));
            assertTrue("Touch actions must be at least 44 px and remain on screen",Boolean.TRUE.equals(js("[...document.querySelectorAll('.touch-action')].filter(e=>!e.hidden&&e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight;})")));
            double initialY=snapshot().getJSONObject("player").getDouble("y");
            pointer("#game","pointerdown",71,.25,.78);
            assertFalse(Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            assertTrue(Boolean.TRUE.equals(js("Math.abs(window.Vespergrave.snapshot().pad.y-innerHeight*.78)<1")));
            pointer("#game","pointermove",71,.25,.62);
            assertTrue("Drag did not move the mage",await("window.Vespergrave.snapshot().player.y<"+(initialY-15),5000));
            pointer(".touch-action[data-action=attack]","pointerdown",72,.5,.5);
            assertTrue(await("window.Vespergrave.snapshot().controls.up&&window.Vespergrave.snapshot().controls.attack",1000));
            screenshot(folder,"vespergrave-floating-pad.png");
            pointer("#game","pointerup",71,.25,.62);
            assertTrue(Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            assertTrue(snapshot().getJSONObject("controls").getBoolean("attack"));
            pointer(".touch-action[data-action=attack]","pointercancel",72,.5,.5);
            assertFalse(snapshot().getJSONObject("controls").getBoolean("attack"));
            pointer("#game","pointerdown",73,.4,.72);pointer("#game","pointercancel",73,.4,.72);
            assertTrue(Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            click("[data-command='skip-tutorial']");
            assertTrue(await("window.Vespergrave.snapshot().tutorial===null&&window.Vespergrave.snapshot().room===0",3000));
            SystemClock.sleep(600);
            pointer(".touch-action[data-action=skill1]","pointerdown",75,.5,.5);
            pointer(".touch-action[data-action=skill1]","pointerup",75,.5,.5);
            assertTrue("Mage skill did not spend focus or enter cooldown",await("document.getElementById('skill-cd-1').textContent!==''",3000));
            screenshot(folder,"vespergrave-mage.png");
            click("#open-bag");assertTrue(await("document.querySelectorAll('.doll-slot').length===6",3000));
            assertEquals("bag",snapshot().getString("panel"));
            click(".relic-grid [data-item]");assertTrue(await("document.querySelector('.item-detail')!==null",2000));
            screenshot(folder,"vespergrave-equipment.png");
            click("[data-command='item-close']");click("[data-bag-tab='skills']");assertTrue(await("document.querySelectorAll('.skill-card').length===3",2000));
            click("[data-bag-tab='codex']");assertTrue(await("document.querySelectorAll('.codex-card').length===6",3000));
            click("[data-enemy='abbey-boss']");
            assertTrue(await("document.getElementById('enemy-detail-art')&&document.getElementById('enemy-detail-art').src.startsWith('data:image/png')",6000));
            click("[data-command='enemy-pose'][data-pose='attack']");click("[data-command='enemy-facing'][data-facing='e']");
            screenshot(folder,"vespergrave-enemy-review.png");
            click("[data-command='enemy-back']");click("[data-command='close']");
            if ("bag".equals(snapshot().optString("panel")))click("[data-command='close']");
            click("#touch-pause");assertEquals("paused",snapshot().getString("state"));
            click("[data-command='settings']");
            js("(()=>{const e=document.getElementById('setting-voice');e.value=45;e.dispatchEvent(new Event('input',{bubbles:true}));return true;})()");
            click("[data-command='close']");click("[data-command='save-title']");
            assertTrue(await("document.querySelector('[data-command=continue]')!==null",3000));
            assertTrue(Boolean.TRUE.equals(js("JSON.parse(localStorage.getItem('vespergrave.v3.settings')).voice===.45")));
            scenario.recreate();scenario.onActivity(value -> activity=value);ready();
            assertTrue("Continue must survive native activity recreation",await("document.querySelector('[data-command=continue]')!==null",3000));
            click("[data-command='continue']");assertTrue(await("window.Vespergrave.snapshot().hero==='seer'&&window.Vespergrave.snapshot().state==='playing'",10000));
            int oldHeight=activity.gameView().getLayoutParams().height,viewport=((Number)js("innerHeight")).intValue();
            InstrumentationRegistry.getInstrumentation().runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=activity.gameView().getLayoutParams();p.height=(int)(activity.getResources().getDisplayMetrics().heightPixels*.82);activity.gameView().setLayoutParams(p);});
            assertTrue("Room did not adapt to the shorter viewport",await("innerHeight<"+(viewport-20)+"&&window.Vespergrave.snapshot().layout.height+32===document.getElementById('game').height",5000));
            assertTrue(Boolean.TRUE.equals(js("(()=>{const g=window.Vespergrave.game;return [g.player,...g.enemies].every(e=>!g.solid(e.x,e.y,e.radius||7));})()")));
            InstrumentationRegistry.getInstrumentation().runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=activity.gameView().getLayoutParams();p.height=oldHeight;activity.gameView().setLayoutParams(p);});
            assertTrue(await("innerHeight==="+viewport,5000));
            screenshot(folder,"vespergrave-portrait.png");
            JSONObject report=new JSONObject().put("passed",true).put("english",true).put("offlineNarrationPlayed",true).put("fullPortraitViewport",true).put("floatingPad",true).put("independentPointers",true).put("mageSkill",true).put("equipment",true).put("bestiaryAnimation",true).put("persistentContinue",true).put("responsiveResize",true).put("snapshot",snapshot());
            try(FileOutputStream out=new FileOutputStream(new File(folder,"vespergrave-report.json"))){out.write(report.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8));}
        }
    }
}
