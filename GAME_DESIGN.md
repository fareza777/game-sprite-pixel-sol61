# Vespergrave: The Bell Below

An original, offline portrait action roguelike. Version 3 replaces the three-trial slice with a complete descent, while preserving the release signing identity and full-screen floating touch controls. English is the default language.

## Release contract

- 100 generated floors, connected room graphs, seeded encounters, loot, hazards and furnishing. A named boss guards floors 10, 20, 30, 40, 50, 60, 70, 80, 90 and 100.
- Ten biomes, each with its own authored architecture, palette, environmental signature and six named enemy designs: five ordinary enemies and one boss. Sixty enemy entries total.
- Eight seeded floor graphs, six or seven rooms per floor and twelve room geometry templates. Each floor has different room layouts, and map loops support alternate approaches. Pits and cover alter movement and lines of fire while preserving every gate route at short and tall portrait sizes.
- Ten authored event stories with explicit choices, resource checks, one-time rewards and persistent run boons. Combat events lock exits; bell waves, a stronger mirror champion and a timed falling-star trial end only after their actual completion. Event state is part of the validated run save.
- Three playable heroes with different primary combat, three unlockable active skills each, two equipped skill slots, stamina, focus, dodge invulnerability, guard, stagger and healing flasks.
- One hundred base item designs, with seeded quality, level, affixes and numerical rolls. Six equipment slots, inventory, consumables, salvage and skill upgrades.
- Splash, original illustrated cinematic with Deepgram narration and captions, first-run onboarding, playable tutorial, New Game, Continue, Settings, About, Share, Rate, equipment, skills, journal and bestiary.
- Autosaved active run, permanent unlock currency, local settings, death/restart, and an ending after floor 100. An in-app experience rating works before a store listing exists; feedback is copied or shared only after the player's action.
- Editable MCP Aseprite art, final offline APK, source archive, tests and GitHub delivery. API credentials are build-time inputs and are excluded from the application and repository.

## Art direction

Hand-authored pixel clusters and silhouettes through Aseprite MCP. Native-size characters with a common foot plane. Four independently authored facings preserve the weapon hand. Walks use contact/down/pass/up keys; attacks separate anticipation, strike and recovery. Enemy families share anatomical construction, while species have distinct heads, weapons, adornments, proportions and attack behaviours. Bosses have their own silhouettes and phase patterns.

The mood is grave, lonely and majestic. Original lore, names, characters and imagery evoke ruined dark fantasy without copying another game's assets or characters. Light comes from above left. Gameplay remains readable through restrained environmental contrast, clear danger telegraphs and small HUD panels.

## Structure

- `game/content.mjs`: the authored content catalogue and narration script.
- `game/campaign.mjs`: deterministic generation, combat, progression, inventory and save validation.
- `game/presentation.mjs`: portrait renderer, menus, audio, cinematic, onboarding and input.
- `tools/draw-campaign-*.mjs`: reproducible MCP drawing passes and editable art exports.
- `tools/generate-vo.mjs`: Deepgram REST audio generation from the script, using an environment variable.
- `tools/test-campaign.mjs`: catalogue, generation, connectivity, combat, progression and persistence verification.

The legacy slice engine and its verified knight assets remain available as source reference; the shipped game uses the campaign engine.
