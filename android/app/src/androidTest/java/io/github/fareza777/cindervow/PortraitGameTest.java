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
public class PortraitGameTest {
    private MainActivity activity;
    private Object js(String expression) throws Exception {
        CountDownLatch done = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        InstrumentationRegistry.getInstrumentation().runOnMainSync(() -> activity.gameView().evaluateJavascript(expression, value -> { result.set(value); done.countDown(); }));
        assertTrue("JavaScript callback timed out", done.await(8, TimeUnit.SECONDS));
        return new JSONTokener(result.get()).nextValue();
    }
    private JSONObject snapshot() throws Exception { return new JSONObject((String) js("JSON.stringify(window.CinderVow.snapshot())")); }
    private boolean awaitCondition(String expression, long timeout) throws Exception {
        long deadline = SystemClock.uptimeMillis()+timeout;
        while (SystemClock.uptimeMillis()<deadline) { if (Boolean.TRUE.equals(js(expression))) return true; SystemClock.sleep(60); }
        return false;
    }
    private void pointer(String target, String event, int id, double x, double y) throws Exception {
        js("(()=>{const e=document.querySelector('"+target+"'),r=e.getBoundingClientRect();e.dispatchEvent(new PointerEvent('"+event+"',{pointerId:"+id+",pointerType:'touch',bubbles:true,cancelable:true,clientX:r.left+r.width*"+x+",clientY:r.top+r.height*"+y+"}));return true})()");
    }
    private void screenshot(File folder, String name) throws Exception {
        Bitmap bitmap = InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
        try (FileOutputStream out = new FileOutputStream(new File(folder,name))) { assertTrue(bitmap.compress(Bitmap.CompressFormat.PNG,100,out)); }
    }
    @Test public void offlinePortraitAndIndependentTouchControls() throws Exception {
        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            scenario.onActivity(value -> activity = value);
            boolean ready = false;
            for (int i=0;i<160;i++) {
                if (Boolean.TRUE.equals(js("!!window.CinderVow && document.getElementById('loading').hidden"))) { ready = true; break; }
                SystemClock.sleep(125);
            }
            assertTrue("Offline game did not initialize", ready);
            assertEquals(Configuration.ORIENTATION_PORTRAIT, activity.getResources().getConfiguration().orientation);
            assertEquals("en", js("document.documentElement.lang"));
            assertEquals(360, ((Number)js("document.getElementById('game').width")).intValue());
            assertTrue(Boolean.TRUE.equals(js("document.getElementById('game').height===Math.round(360*innerHeight/innerWidth)")));
            assertTrue(Boolean.TRUE.equals(js("document.body.classList.contains('mobile')")));
            assertTrue("Arena must fill the whole Android viewport",Boolean.TRUE.equals(js("(()=>{const r=document.getElementById('game').getBoundingClientRect();return r.left===0&&r.top===0&&Math.abs(r.width-innerWidth)<1&&Math.abs(r.height-innerHeight)<1&&document.documentElement.scrollHeight<=innerHeight})()")));
            assertTrue("D-pad must be hidden before any touch",Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            assertEquals("ATTACK", js("document.querySelector('.touch-action[data-action=attack] span').textContent"));
            js("window.__pointerLog=[];document.addEventListener('pointercancel',e=>window.__pointerLog.push({type:e.type,id:e.pointerId}),true);document.getElementById('begin').click();true");
            assertTrue("Run did not start", awaitCondition("document.getElementById('game').dataset.state==='playing'",5000));
            assertTrue(Boolean.TRUE.equals(js("[...document.querySelectorAll('.touch-action')].every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.left>=0&&r.top>=0&&r.right<=innerWidth&&r.bottom<=innerHeight})")));
            assertTrue("Full room must fit the viewport without a following crop",Boolean.TRUE.equals(js("window.CinderVow.snapshot().arena.width===360&&window.CinderVow.snapshot().arena.height+32===document.getElementById('game').height")));
            File folder = new File(activity.getExternalFilesDir(null), "verification");folder.mkdirs();
            double initialY = snapshot().getJSONObject("player").getDouble("y");
            pointer("#game", "pointerdown", 71, .25, .78);
            assertFalse("Touch did not show the floating D-pad",Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            assertTrue("D-pad must appear at the finger",Boolean.TRUE.equals(js("Math.abs(window.CinderVow.snapshot().pad.x-innerWidth*.25)<1&&Math.abs(window.CinderVow.snapshot().pad.y-innerHeight*.78)<1")));
            pointer("#game", "pointermove", 71, .25, .65);
            assertTrue("D-pad did not move the hero: "+snapshot(), awaitCondition("window.CinderVow.snapshot().player.y<"+(initialY-10),5000));
            assertTrue("D-pad base must follow a long drag",Boolean.TRUE.equals(js("window.CinderVow.snapshot().pad.y<innerHeight*.78-10")));
            pointer(".touch-action[data-action=attack]", "pointerdown", 72, .5, .5);
            SystemClock.sleep(100);
            JSONObject held = snapshot().getJSONObject("controls");
            assertTrue("Second finger released the D-pad", held.getBoolean("up"));
            assertTrue("Attack finger was not held", held.getBoolean("attack"));
            screenshot(folder,"portrait-floating.png");
            pointer("#game", "pointerup", 71, .25, .65);
            held = snapshot().getJSONObject("controls");
            assertFalse(held.getBoolean("up"));assertTrue(held.getBoolean("attack"));
            assertTrue("Releasing movement must hide the D-pad",Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            pointer("#game", "pointerdown", 73, .4, .72);
            assertTrue("Next touch must choose a fresh origin",Boolean.TRUE.equals(js("Math.abs(window.CinderVow.snapshot().pad.x-innerWidth*.4)<1")));
            pointer("#game", "pointercancel", 73, .4, .72);
            assertTrue(Boolean.TRUE.equals(js("document.getElementById('dpad').hidden")));
            pointer(".touch-action[data-action=attack]", "pointercancel", 72, .5, .5);
            assertFalse("Cancel did not release attack: "+snapshot()+" events="+js("JSON.stringify(window.__pointerLog)"),snapshot().getJSONObject("controls").getBoolean("attack"));
            final int oldHeight = activity.gameView().getLayoutParams().height;
            int initialViewportHeight = ((Number)js("innerHeight")).intValue();
            InstrumentationRegistry.getInstrumentation().runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=activity.gameView().getLayoutParams();p.height=(int)(activity.getResources().getDisplayMetrics().heightPixels*.82);activity.gameView().setLayoutParams(p);});
            assertTrue("Game did not adapt to a shorter viewport",awaitCondition("innerHeight<"+(initialViewportHeight-20)+"&&document.getElementById('game').height===Math.round(360*innerHeight/innerWidth)&&window.CinderVow.snapshot().arena.height+32===document.getElementById('game').height",5000));
            assertTrue("Resize trapped an actor in furniture",Boolean.TRUE.equals(js("(()=>{const g=window.CinderVow.game;return [g.player,...g.enemies].every(e=>!g.solid(e.x,e.y,e.type==='warden'?12:7))})()")));
            InstrumentationRegistry.getInstrumentation().runOnMainSync(()->{android.view.ViewGroup.LayoutParams p=activity.gameView().getLayoutParams();p.height=oldHeight;activity.gameView().setLayoutParams(p);});
            assertTrue("Full viewport was not restored",awaitCondition("innerHeight==="+initialViewportHeight+"&&document.getElementById('game').height===Math.round(360*innerHeight/innerWidth)",5000));
            screenshot(folder,"portrait.png");
            js("document.getElementById('touch-pause').click();true");
            assertEquals("paused", snapshot().getString("state"));
            assertEquals("undefined", js("typeof document.getElementById('game').dataset.error"));
            JSONObject report = new JSONObject().put("passed",true).put("portrait",true).put("english",true).put("offline",true).put("fullViewport",true).put("completeCompactRoom",true).put("floatingPad",true).put("flexibleOrigin",true).put("padHiddenOnRelease",true).put("responsiveResize",true).put("independentTouchPointers",true).put("cancelReleasesInput",true).put("snapshot",snapshot());
            try (FileOutputStream out = new FileOutputStream(new File(folder,"report.json"))) { out.write(report.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        }
    }
}
