# Cinder Vow 2.2.0

[Download the signed release APK](CinderVow-2.2.0.apk?raw=true)

- Android 8.0 and newer; universal APK, portrait orientation.
- Full-screen arena with a complete compact portrait chamber and height-adaptive layout.
- Floating eight-direction D-pad appears at the touch point, follows a long drag, and hides on release.
- English UI, offline dungeon and independent action buttons overlaid in the corner.
- Pixel launcher and controls drawn through MCP Aseprite.
- Release signature verified with Android's `apksigner`.
- SHA-256 checksum in `SHA256SUMS`.

The Android 15 emulator instrumentation test checks offline startup, English UI, full viewport coverage, complete room, responsive resizing, floating D-pad origin/following/hiding, control bounds, simultaneous movement and attack, cancellation and pause. See `previews/android-verification.json`, `previews/android-portrait.png` and `previews/android-floating.png` in the repository.

Signed with the same certificate as [2.1.0](CinderVow-2.1.0.apk?raw=true); the new APK can update the previous installation.
