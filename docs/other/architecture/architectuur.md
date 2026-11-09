# Architecture and resources

[Back to README](../../../README.md) · [Game packs, characters and encounters](spelpakketten.md)

## Repository layout

`public_html/` remains the web document root. Student-editable JSON, PNGs and their Dutch instructions live under `public_html/gameplay/`, grouped as `characters`, `enemies`, `platforms`, `obstacles`, `powerups` and `interactables`. Shared backgrounds, scenery, effects, music and sounds live under `public_html/assets/`. Browser modules, renderers, CSS, PHP rooms, tests and the offline builder live under `public_html/engine/`.

The runtime loaders read the workshop manifests on refresh. Preparation scripts validate those same files and write generated catalogs into `engine/characters/`, `engine/enemies/` and `engine/structures/`. They never generate JavaScript in the workshop. The structure manifest `gameplay/structures.json` retains logical groups, but entries contain physical paths such as `platforms/rock` or `interactables/pipe-up`. These preserve existing keys and tile IDs. Asset keys begin with `gameplay/` or `assets/`; `engine/paths.mjs` resolves them against the document root, including when deployed under a URL subdirectory. The offline bundle embeds those keys and retains each module's `engine/` location for URL resolution.

The HTML entry loads `engine/bootstrap.mjs` and `engine/styles.css`. Network play calls `engine/room.php`. The generated `speel.html` stays in `public_html/`.

## Platform

Bravios runs in the browser using standard HTML, CSS and JavaScript. It does not use React, Phaser, Unity or another game library. The `.mjs` files are JavaScript modules with `import` and `export`, loaded from the local web server. HTML defines buttons, dialogs and canvas elements. CSS styles the controls; Canvas 2D draws the game world.

Node.js runs the development server, build and JavaScript tests. PHP is needed only for rooms and their tests. No database or npm packages are required. Version requirements and commands are in [package.json](../../../package.json): Node ≥18; the installation guide specifies PHP ≥8.1 for network play.

## From input to screen

```text
Keyboard / mouse / touch / controller
                  |
                  v
              app.mjs <----> HTML controls and HUD
                  |
                  v
        engine.mjs + specialized game modules
                  |
                  v
         game state: position, coins, time, enemies
                  |
                  v
     art.mjs + other renderers ---> Canvas 2D

app.mjs <----> localStorage / JSON files
app.mjs <----> network.mjs <----> room.php <----> temporary room files
```

`app.mjs` runs a `requestAnimationFrame` loop that updates input, simulation, sound, rendering and screen information. `createGame` creates game state; `stepGame` updates it using input and elapsed time. Actions such as collecting a coin or jumping add entries to `game.events`; the app uses these events for sound, among other things. `drawWorld` renders the state. The engine can be tested without a browser.

These are responsibilities within one application, rather than strictly enforced layers. Some files combine responsibilities. In particular, `app.mjs`, `engine.mjs` and `art.mjs` are large. Search for a function name or HTML ID first, then read the call site and surrounding code.

## Code map

Paths below are relative to the project root. Where only a filename is listed, it is in `public_html/` unless stated otherwise.

| Area | Files | Responsibility |
| --- | --- | --- |
| Main page | `public_html/index.html`, `styles.css` | Toolbar, start screen, dialogs and styling |
| Application | `public_html/engine/app.mjs` | Builder, input, HUD, sound and module integration |
| Engine | `public_html/engine/engine.mjs` | Level model, tile catalog, movement, collisions and game state |
| Mechanics | `mechanisms.mjs`, `swing-platforms.mjs`, `firebars.mjs`, `sea-life.mjs`, `wonder-magic.mjs`, `wonder-foes.mjs` | Mechanisms, vines, donut platforms, creatures and Wonderland rules |
| Rendering | `art.mjs`, `monster-art.mjs`, `sea-art.mjs`, `wonder-foe-art.mjs`, `enemy-design-art.mjs` | Characters, objects and world rendering |
| Graphics | `look.mjs`, `terrain.mjs`, `terrain-rules.mjs` | Character pose images, sprite regions, terrain variants and edge matching |
| Presentation | `presentation.mjs`, `depth-backgrounds.mjs` | Visual effects, camera, rendering resolution and three vector parallax layers |
| Characters and enemies | `character-maker.mjs`, `enemy-design.mjs`, `enemy-editor.mjs` | Combining parts, settings and enemy editor |
| Campaigns | `levels.mjs`, `adventurers.mjs`, `wonderland.mjs` | Levels and campaign rules; the latter two also track progress |
| Maps | `adventure-map.mjs`, `wonderland-map.mjs` | Campaign maps, navigation and shops where applicable |
| Custom worlds | `worlds.mjs`, `world-editor.mjs` | Custom map data, validation and editor |
| Small games | `public_html/engine/games/`, `public_html/engine/runtime/` | Four separate game packs, sessions, deferred loading and return to the main game |
| Storage | `storage.mjs`, storage code in `app.mjs` | Normalizing level collections and saving browser data |
| Multiplayer | `coop.mjs`, `network.mjs`, `room.php` | Shared simulation, HTTP room traffic and server validation |
| Controller | `gamepad.mjs` | Converting controller input into actions |
| Tools | `server.mjs`, `build.mjs` | Serving local files and building the offline file |
| Tests | `public_html/engine/tests/` | Automated tests and visual test pages |

## Levels and storage

A level contains fields including `name`, `theme`, `width` and `tiles`. `tiles` is an array of rows: `tiles[y][x]` holds the ID of one element. A tile measures 32 world pixels (`TILE`). X increases to the right; Y increases downward. For example, 4 is a coin, 10 a start position and 11 the finish. The complete catalog and `validateLevel` are in [engine.mjs](../../../public_html/engine/engine.mjs).

Use an exported level for experiments. The validator determines valid data and may normalize it. Runtime game state is a separate object containing the player, elapsed time, collected coins and moving enemies. Collecting a coin during a run should not change the saved builder level.

`app.mjs` uses `localStorage` with the key `super-bouwclub-v1` for the builder level, collection and progress, among other data. `storage.mjs` helps read existing collections. Storage belongs to a browser profile and origin (protocol, host and port). `localhost:8080`, another address and the offline version may therefore show different data. Use JSON export/import to transfer levels and make backups.

For rooms, `network.mjs` sends requests to `room.php`. PHP stores temporary sessions outside the document root, uses file locks and per-player access keys, and expires old rooms. This is not a permanent server collection. The Node server does not execute PHP.

## Resource locations

| Location | Contents and use |
| --- | --- |
| [public_html/assets/](../../../public_html/assets) | Runtime world images and logo; heroes are under `characters/` |
| [public_html/assets/scenery/](../../../public_html/assets/scenery) | Scenery and creature sprite sheets, terrain variants, backgrounds and world map |
| [public_html/gameplay/characters/](../../../public_html/gameplay/characters) | Boaz, Ravi and custom heroes; code and images per character/view |
| [public_html/assets/backgrounds/worlds/](../../../public_html/assets/backgrounds/worlds) | World map illustrations, grouped by world |
| [docs/other/design/](../design/README.md) | Source material and design files outside the document root |
| [Wonderland design](../design/wonderland) | Specification, level descriptions and boss design pack |
| [public_html/engine/tegels.html](../../../public_html/engine/tegels.html) | Visual tile reference; locally at `/tegels.html` |
| [public_html/engine/tests/](../../../public_html/engine/tests) | Animated previews and playable test pages alongside `.test.mjs` files |

Boaz and Ravi use individual pose PNGs in their character directories, including the riding pose. `character.json` maps pose names to paths under `images/platform/`. The startup/build preparation script generates `characters/catalog.mjs`; runtime selection and asset lists use that catalog. The loader preserves their alpha transparency and reads each complete image. Scenery and creatures still use sprite sheets. A sprite sheet combines multiple images in one file. The code selects a region. Before replacing a whole sheet to add one object, check `look.mjs`, `terrain.mjs` or `character-maker.mjs`. Many other figures are drawn directly with Canvas. Sounds are generated with oscillators in `playSound` in `app.mjs`; no audio-file directory is required.

## Source, web server and offline build

Edit `index.html`, `styles.css` and the modules. [build.mjs](../../../public_html/engine/build.mjs) processes modules and registered images, combines CSS and scripts, and embeds images as data URLs. The result is `public_html/speel.html`, which supports solo play without a server. Network play requires a running PHP server.

The bundler follows the module graph from `app.mjs`, including dynamic imports with literal paths. Each module has its own factory and runs on first use. The server uses the same graph to allow module paths; restart it after adding imports. Character images are derived from the generated catalog; other images remain explicitly registered in asset lists. See [game packs](spelpakketten.md) for the supported module subset, cleanup and unloading limits.

The Node server serves a limited set of paths, so an existing file can still return 404. Arbitrary test pages in `tests/` are not necessarily reachable through `npm start`. The PHP server serves the document root and can open those pages. The eight archived assignments need no new runtime modules for their basic versions; the level inspector runs as a separate Node script.

## Choosing checks

Use existing tests as examples: [small-games.test.mjs](../../../public_html/engine/tests/small-games.test.mjs) is small and illustrates `node:test` with `assert`. Run a focused test with `node public_html/engine/tests/<name>.test.mjs`. The complete suite is listed explicitly in `package.json`; add new test files there to include them in `npm test`. That command also uses PHP for `rooms.test.php`.

Check visual changes in the browser. Check game-rule changes with a focused automated test as well. Rebuild the offline version after code changes and open it separately. Tests, builds and local play do not verify deployment to an external server.

## Viewport-sized canvas

`#world-space` inside the scroll container has the dimensions of the complete world. `#world` is a sticky canvas the size of the visible viewport. `app.mjs` calculates world dimensions independently of the bitmap, translates world coordinates using the camera position and uses device pixel density for rendering. Pointer coordinates are converted back into level coordinates using scroll position and tile size. A long level can therefore remain sharp without a world-sized bitmap. Background layers use vector shapes; the large scenery bitmap cache has been removed. See the archived [rendering recovery report and measurements](../../archive/renderherstel.md).

Flow checks in `sea-life.mjs` maintain a derived geyser index in a `WeakMap`. It is refreshed when simulation time, the enemy list or its length changes; active and frozen states are checked on each use. The index is not included in level files or multiplayer snapshots.

## Local input response

Keyboard and touch controls update input in `app.mjs` directly. Action and left/right press edges remain in `pendingActions` until the next fixed simulation step; event handlers do not advance engine time. If two short opposite direction taps occur before one step, the last press edge wins. `resetInput` also clears buffered press edges.

`engine.mjs` lets ordinary players on land accelerate and turn faster while retaining the same top speed. Special movement, including water, slopes, mounts and fast vine launches, is handled separately. The camera in `presentation.mjs` follows with a shorter settling time. The archived [input response report](../../archive/invoerreactie.md) describes checks and measurement limits.
