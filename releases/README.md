# Vespergrave 3.2.0

[Download the signed Android APK](Vespergrave-3.2.0.apk?raw=true)

- Offline portrait roguelike with 100 floors, ten biomes, three heroes, sixty enemy designs and ten bosses.
- Eight-direction hero animation with 2,112 authored poses. Equipped weapons, offhands, armor details, boots and jewelry change the animated character. All sixty enemy atlases have revised silhouettes, connected anatomy and individual movement timing.
- Knight parry and riposte, rogue backstabs, and mage hold/release charging. Brief impact pauses, buffered input, directional recoil, guard sparks and clearer recovery add combat weight.
- All nine skills have useful rank upgrades. Six relic arts add guard shockwaves, critical bleed, ricochets, dodge runes, marked-kill restoration and ward bursts. Equipment pages explain their actual effects.
- Enemies coordinate attacks and use blocker, flanker and ranged roles. Each boss changes its arena below half health, with visible warnings and safe ground.
- Branching procedural floors include optional elite trials, guaranteed relic rewards and lever shortcuts that survive Continue. Twenty room layouts use distinct realm architecture, floor finishes, landmarks and torch lighting.
- The watchfire menu, eight-shot opening, onboarding, events, endings and 52 English voice clips remain bundled offline.

Size: 9.15 MiB (9,594,056 bytes). SHA-256: `cf60c7654bec2bbae0e6a1e8a29d514758e4616ef6376dccd14bbbf7a79c9c4c`.

The APK uses the existing release certificate and package, with version code 5. An actual signed 3.1.0 run was saved, updated in place to 3.2.0 and restored with Continue on the Android test emulator. The old room graph remains intact until the next floor. Android 8.0 or newer is required.

Validation passed: 26 baseline engine checks, 20 evolution checks, touch checks, shipping renderer and asset checks, 540 enemy anatomy cases, 390 measured prop contacts and 288 planted hero cases. Four Android instrumentation flows passed in 117.128 seconds, covering actual opening audio, portrait input, all twenty layouts, inventory, events, persistence, descent and the new combat, equipment and ten boss arenas. Key-pose screenshots temporarily freeze test fixtures for inspection; production impact pauses are 32–65 milliseconds.

[Verification report](Vespergrave-3.2.0-verification.json) · [Checksums](SHA256SUMS) · [Build instructions](../android/README.md) · [Room review gallery](../previews/level-gallery.html) · [Native screenshots](../previews/android-vespergrave)

Earlier releases: [Vespergrave 3.1.0](Vespergrave-3.1.0.apk?raw=true), [3.0.0](Vespergrave-3.0.0.apk?raw=true), [Cinder Vow 2.2.0](CinderVow-2.2.0.apk?raw=true), [2.1.0](CinderVow-2.1.0.apk?raw=true).
