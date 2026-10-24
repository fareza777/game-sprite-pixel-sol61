# Vespergrave for Android

An offline, full-screen portrait application for Android 8.0+. The APK bundles the complete game, its artwork and fifty-two English narration clips. The host uses WebViewAssetLoader and requires no internet permission. Device-local storage keeps the active run, permanent embers and settings.

The package remains `io.github.fareza777.cindervow` and uses the existing release certificate, allowing an in-place update from Cinder Vow 2.2.0. The launcher name is Vespergrave. Version 3.1.0 uses version code 4.

## Controls

Touch and drag open floor to reveal the floating eight-way D-pad. Its base follows long drags and disappears on release. Separate fingers can move, attack or cast, guard, dodge, heal, interact and use either equipped skill. Satchel and pause controls sit above the arena. Backgrounding saves and pauses the descent and releases held inputs.

Settings include music, effects and narration volumes, optional haptics, impact shake, flashes, 30/60 FPS, larger buttons and reduced menu motion. Sharing opens the native chooser. Feedback opens the fixed GitHub project page. The local rating does not imply a published store listing.

## Build

Requires JDK 17+, Android SDK platform 35/build tools, and Node.js 20.11+.

```sh
npm run build
npm test
npm run android:sync
cd android
./gradlew assembleDebug assembleDebugAndroidTest assembleRelease
```

Use `gradlew.bat` on Windows. Configure `ANDROID_HOME` or the ignored `android/local.properties`. Signing properties and keys live outside the repository under the original `.android/cinder-vow/` directory. Preserve the existing key for updates. Without that local signing configuration, the release is unsigned; CI deliberately builds a debug APK.

The signed deliverable is `releases/Vespergrave-3.1.0.apk`. No Deepgram key is needed to build or play; narration audio is already included.

## Verification

`VespergraveGameTest` exercises the actual WebView and Android lifecycle. It checks offline startup, English, portrait viewport bounds, three hero choices, onboarding, actual bundled voice playback, mage practice, floating pad origin, independent movement/attack pointers, cancellation, a mage skill cooldown, equipment, skill page, animated enemy preview, saved settings, Continue after activity recreation, and resizing without trapping an actor in furniture.

Its second test reviews all twenty room layouts, chooses and saves an oath-shrine boon, starts the three-wave bell encounter, and verifies the falling-star trial's warnings, paused timer and continuation. These preview fixtures place the player at the room or event being tested. The refinement test plays all eight prologue clips, measures battle button separation in two sizes, opens the branch map, compares relic stats, previews a skill and uses the physical descent.

The test saves screenshots and `vespergrave-report.json` beneath the app's external `verification/` directory. Reviewed outputs are included in `previews/android-vespergrave/`.

The launcher artwork and foreground are exported through MCP Aseprite from `art/vespergrave-icon.aseprite`. The adaptive foreground has an inset so the helmet remains within launcher masks. The native host blocks nonlocal WebView requests and exposes only fixed project navigation, a bounded haptic pulse and the share chooser.
