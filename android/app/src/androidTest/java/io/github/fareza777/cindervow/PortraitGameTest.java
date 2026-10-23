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
            assertEquals(480, ((Number)js("document.getElementById('game').height")).intValue());
            assertTrue(Boolean.TRUE.equals(js("document.body.classList.contains('mobile')")));
            assertTrue(Boolean.TRUE.equals(js("[...document.querySelectorAll('.touch-action')].every(e=>{const r=e.getBoundingClientRect();return r.width>=48&&r.height>=48&&r.right<=innerWidth&&r.bottom<=innerHeight})")));
            assertEquals("ATTACK", js("document.querySelector('[data-action=attack] span').textContent"));
            js("window.__pointerLog=[];document.addEventListener('pointercancel',e=>window.__pointerLog.push({type:e.type,id:e.pointerId}),true);document.getElementById('begin').click();true");
            assertTrue("Run did not start", awaitCondition("document.getElementById('game').dataset.state==='playing'",5000));
            double initialY = snapshot().getJSONObject("player").getDouble("y");
            pointer("#dpad", "pointerdown", 71, .5, .15);
            assertTrue("D-pad did not move the hero: "+snapshot(), awaitCondition("window.CinderVow.snapshot().player.y<"+(initialY-10),5000));
            pointer(".touch-action[data-action=attack]", "pointerdown", 72, .5, .5);
            SystemClock.sleep(100);
            JSONObject held = snapshot().getJSONObject("controls");
            assertTrue("Second finger released the D-pad", held.getBoolean("up"));
            assertTrue("Attack finger was not held", held.getBoolean("attack"));
            pointer("#dpad", "pointerup", 71, .5, .15);
            held = snapshot().getJSONObject("controls");
            assertFalse(held.getBoolean("up"));assertTrue(held.getBoolean("attack"));
            pointer(".touch-action[data-action=attack]", "pointercancel", 72, .5, .5);
            assertFalse("Cancel did not release attack: "+snapshot()+" events="+js("JSON.stringify(window.__pointerLog)"),snapshot().getJSONObject("controls").getBoolean("attack"));
            js("document.getElementById('touch-pause').click();true");
            assertEquals("paused", snapshot().getString("state"));
            assertEquals("undefined", js("typeof document.getElementById('game').dataset.error"));
            File folder = new File(activity.getExternalFilesDir(null), "verification");folder.mkdirs();
            Bitmap bitmap = InstrumentationRegistry.getInstrumentation().getUiAutomation().takeScreenshot();
            try (FileOutputStream out = new FileOutputStream(new File(folder,"portrait.png"))) { assertTrue(bitmap.compress(Bitmap.CompressFormat.PNG,100,out)); }
            JSONObject report = new JSONObject().put("passed",true).put("portrait",true).put("english",true).put("offline",true).put("independentTouchPointers",true).put("cancelReleasesInput",true).put("snapshot",snapshot());
            try (FileOutputStream out = new FileOutputStream(new File(folder,"report.json"))) { out.write(report.toString(2).getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
        }
    }
}
