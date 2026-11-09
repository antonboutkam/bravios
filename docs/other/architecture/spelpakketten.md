# Game packs, characters and encounters

[README](../../../README.md) · [Architecture](architectuur.md) · [Stekelsprong guide in Dutch](../../student/stekelsprong.md)

The existing minigames use separate game packs. The menu shell loads only the selected pack, creates one session and disposes of it when leaving or replacing it. The platform game has an adapter for starting an encounter and resuming the same game state afterward. No pipes are connected to minigames yet. Bumper boats, a dance contest and their new character views are future extensions.

## Directories

```text
public_html/
  runtime/
    game-session.mjs       loading, replacing, cancelling and cleanup
    resource-scope.mjs     lifetime of listeners, canvases and shared bitmaps
    game-flow.mjs          suspend a parent and resume it after a child game
    projection.mjs         top-down and oblique views, drawing order
  games/
    catalog.mjs            lightweight descriptions and deferred imports
    shell.mjs              fullscreen, menus, input and active rendering loop
    preview.mjs            static card without starting a game session
    shared/                existing canvas background and session adapter
    aim/                   game.mjs, model.mjs, render.mjs
    balloons/              game.mjs, model.mjs, render.mjs
    catch/                 game.mjs, model.mjs, render.mjs
    rhythm/                game.mjs, model.mjs, render.mjs
    platformer/
      encounters.mjs       integration with the existing platform game
  characters/
    roster.mjs             player identity and selected view
    boaz/
      character.json       ID, name, portrait and pose paths
      images/
        portrait.png
        platform/          individual pose PNGs
    ravi/                  same structure
    custom/
      maker.mjs            parts, composition, animation and character editor
      parts/               heads, outfits, shoes and accessories
    shared/
      hero.mjs             existing character renderer, also used by art.mjs
      view-assets.mjs      images for new views with shared leases
```

`small-games.mjs`, `rhythm-game.mjs` and `character-maker.mjs` remain compatibility entry points. New runtime code imports the relevant directory directly. The application no longer imports minigame models up front. The existing platform engine, builder and world renderer remain at their original paths for now; their adapter is under `games/platformer/`.

## Game contract

`catalog.mjs` contains each game's `id`, name, hint, supported player counts and camera view. `loadGamePack(id)` uses an explicit dynamic import. Add a new game in both places; arbitrary file paths from level data are never imported.

Each pack exports `createSession(context)`, which may be asynchronous. The context contains:

- `scope`: its own `ResourceScope` with an abort signal and cleanup registration;
- `participants`: player ID, character ID and optional custom appearance;
- `playerCount`, `view`, `options` and optional `random`;
- `services`: shared rendering functions. Stekelsprong uses `hero` and `drawTile` without importing the platform engine itself.

A session in the current menu shell provides:

| Member | Meaning |
| --- | --- |
| `state` | Game state with `kind`, `state` (`playing`, `won`, `over`) and `playerCount` for multiplayer |
| `viewport` | Logical `width`, `height` and `view`; the shell adjusts the canvas and pointer coordinates accordingly |
| `capabilities` | Optional `jumpButtons`, `pause`, `upAction` for existing controls |
| `update(input, dt)` | Directions are held values; this runs the session's simulation step |
| `action(player)` | A press edge for one player's action |
| `direction(direction)` | A single direction step, suitable for dance steps, for example |
| `pointer(phase, point, dragging)` | Touch/mouse input in logical game coordinates |
| `pause()`, `togglePause()` | Pause and resume, if supported |
| `render(ctx, width, height)` | Own camera and rendering, independent of the platform world |
| `ui()` | `{ status, hint, result }` for on-screen text |
| `result()` | `null` during play, then `{ game, outcome, score }` |
| `dispose()` | Release references and resources; repeated calls must be safe |

Existing games use `shared/session.mjs`. A new game with a different playfield or behavior may implement its own session. The menu shell contains no rules for individual game IDs. For the existing co-op variant, it uses `players: [1,2]` from the catalog.

A bumper boat game can have its own collisions and movement in a two-dimensional plane. A dance contest can track demonstration and response phases, processing `direction()` only during the response phase. Neither needs to use `engine.mjs`, its gravity or tile collisions.

## A pipe as an entry point

`app.mjs` provides `startMiniGameEncounter(gameId, origin, options)`. Future pipe or door handling could call it as follows:

```js
const result = await startMiniGameEncounter(
  'rhythm',
  { type: 'pipe', x: pipe.x, y: pipe.y },
  { difficulty: 1 }
);
if (result.outcome === 'won') {
  // Apply an explicitly designed reward here in a future extension.
}
```

This is an application integration point, not a saved pipe setting yet. `options` and `origin` are passed through, but existing games do not yet interpret `difficulty`, for example. The current platform path supplies one player; standalone Stekelsprong also supports two local players.

The adapter retains the existing game state by reference and pauses it. Position, coins, powers and campaign data are not copied into a new level. The minigame receives only a copy of the request and character data. After a win, loss, cancellation or loading error, the original paused/playing state resumes. If the parent has been replaced meanwhile, it is not restored. Concurrent transitions are rejected. The minigame itself does not apply platform rewards.

During an encounter, A returns after the result; **Terug naar avontuur** (Return to adventure) and B can also cancel earlier. From the standalone minigame menu, A still restarts after the result. Online rooms are explicitly rejected for encounters: synchronized minigames will need a separate network contract.

Actual pipe destinations will require coordinated changes to level validation, storage, the builder and PHP/co-op snapshots. Existing pipe connections were not changed in this preparation.

## Releasing resources

`GameSessionHost` has at most one active session. Switching or stopping invalidates any pending request. A late result cannot replace a new game and is disposed of. Failed loads can be retried.

Use `scope.listen(...)` for temporary listeners, `scope.canvas(...)` for owned canvases and `scope.defer(...)` for timers, animation frames, audio or other resources. `dispose()` aborts the scope and runs all cleanups even if one fails. Standalone state objects in existing minigames are released. The shell stops its animation frame and shrinks its canvas to 1 × 1 on exit.

`ResourcePool.acquire(key, load, release, scope)` shares a loaded resource between consumers. The last consumer releases it. Even if all consumers leave before loading finishes, the late result is released. `characters/shared/view-assets.mjs` uses this for new view bitmaps and ultimately calls `ImageBitmap.close()`. A pool key requires the same loader/releaser pair.

A platform encounter also releases the platform canvas, temporary sprites and composed character canvases. These are recreated on return. Current shared look/terrain sprites and character parts stay loaded because the builder or other game still uses them. The platform level itself is retained to allow an exact return.

This does not guarantee that the browser immediately returns all memory. Native ES modules normally stay in the module cache. The offline version also retains module factories and embedded image text. The approach saves active simulation, canvases, session states and released bitmaps; there is no measured memory benchmark yet. A future very large game that must also release its entire JavaScript runtime would be better hosted in a separate Worker or iframe with explicit messaging.

## New character views

A player ID is independent of the game and camera. Boaz and Ravi have `side` and `front` views backed by individual transparent pose images. Each `character.json` maps pose names to complete PNG files; no character-sheet crop coordinates are needed. Custom heroes remain composed from the same parts. Stekelsprong carries the selected character and appearance into its session.

`characters/characters.json` lists character folder names in selection order. On page load, `bootstrap.mjs` fetches that list and each folder's `character.json`, validates them through `characters/load-catalog.mjs`, and replaces the catalog before importing `app.mjs`. Derived profiles, selection buttons and image lists therefore use the current files. Refreshing loads newly listed characters without a build or server restart; any static HTTP server suffices. The Node server permits character JSON and PNG paths independently of its startup asset list. Invalid manifests/configuration appear on the loading screen with a retry button.

Before npm start, network start, build and test commands, `scripts/prepare-characters.mjs` validates the same list, configurations and PNG files and generates `characters/catalog.mjs` for Node consumers and the offline build. Each ID must match its folder name. The standalone `speel.html` embeds the generated catalog and images and does not fetch the manifest; rebuild it to include changes.

The current JSON format creates front and side views. Supporting top-down or oblique views requires extending both the configuration format and its validator, creating matching images, and supporting custom heroes if needed. Shared image components do not need duplication.

`characterView(identity, view)` rejects missing views, so a side view is not silently used as a top-down view. `acquireCharacterView()` loads a registered sheet on demand. Actual top-down/oblique images and animations have not been created yet.

`projection.mjs` provides forward and inverse projection for `top-down` and `oblique`, plus drawing order based on ground position. Jumping therefore does not unexpectedly change depth order. Game logic stays in world coordinates; only the renderer projects to screen coordinates.

## Server, offline build and checks

`build/module-graph.mjs` follows static named imports, named re-exports and dynamic imports with literal relative paths. The server uses the same collection to allow required modules. New game imports become reachable after a server restart. Character JSON and PNG paths are served without registration; offline portraits and poses come from the generated catalog. Other images still need registration in the relevant server and build asset lists.

The offline build places modules in separate factories with their own variables. Static dependencies run on first use; dynamic game imports run only when selected. All code and images remain available in one `speel.html` without a network connection. The small bundler does not support arbitrary npm imports, circular modules or live exports; unsupported import/export syntax causes a build error. Follow the current named-export pattern.

`npm test` includes `game-runtime.test.mjs` for cleanup, shared resources, loading/switching races, character identities, projections, platform return and execution of actual offline packs. Exports from all runtime modules are compared against their native equivalents. `small-games-ui.test.mjs` checks actual menu handlers through a DOM adapter, including results and encounter cancellation. Existing game-rule tests remain in place.

The full local test suite and build provide automated checks. HTTP checks cover new module and asset paths. Visual browser checks and physical controller tests are separate: during the original implementation, the browser connector failed before page interaction.
