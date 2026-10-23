# Cinder Vow for Android

An offline, portrait Android application for Android 8.0 and newer. The packaged WebView loads the bundled game through `WebViewAssetLoader`; the game requires no network permission. The manifest locks phone orientation to portrait. A following camera preserves the proportions of the original pixel artwork.

## Controls

- D-pad: move and face in eight directions; slide between directions.
- Sword: hold for the three-hit combo.
- Shield: hold to block.
- Circular arrow: dodge roll in the current movement direction.
- Hand: use the nearby chest, shrine or exit.
- Pause: pause/resume and change sound.

Movement and action buttons use separate pointer IDs. Releasing or cancelling one finger leaves the other active. Backgrounding the application pauses the game and releases held inputs.

## Build

Requires JDK 17+, Android SDK platform 35 and build tools, and Node.js 20+.

```sh
npm run build
npm run android:sync
cd android
./gradlew assembleDebug
./gradlew connectedDebugAndroidTest
```

On Windows use `gradlew.bat`. Set `ANDROID_HOME`, or create the ignored `android/local.properties` with the SDK path.

The tested release APK is committed at `releases/CinderVow-2.1.0.apk`. To build another signed release, run `node tools/create-android-key.mjs` on Windows, then `gradlew.bat -p android assembleRelease` from the repository root. The helper creates a key and signing properties under the current user's private `.android/cinder-vow/` directory. Keep that directory for updates to the same installation. Signing files and passwords are excluded from Git. Without a local signing configuration, Gradle's release output is unsigned; the CI workflow deliberately builds a debug APK.

## Verification

The instrumentation test checks real Android WebView startup with bundled content, English UI, portrait orientation, 360×480 game viewport, button bounds, D-pad movement, independent simultaneous movement and attack, pointer cancellation, pause and JavaScript errors. It saves a screenshot and JSON report in the test app's external files directory.

The launcher, D-pad arrows and action icons are authored through Aseprite MCP. Editable sources are in `art/ui-controls.aseprite`, `art/launcher.aseprite` and `art/launcher-foreground.aseprite`.
