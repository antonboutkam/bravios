# Bravios in Wonderland — levels

All fifteen levels are 192 tiles long and 20 tiles high: three times their original length. Platforms, coins and bounce points also fill the extra space. Puzzles, portals, passages and boss arenas are farther apart; jump heights and object sizes remain unchanged. The right-gravity crystal lasts 24 seconds to cover the longer distance to the wall.

Open Wonderland from the start screen. Completing a level unlocks its successors; where there are multiple predecessors, completing one is enough. Secret level 11 is optional. Level 15 is the finale. All unlocked routes can be used in both directions.

The area and level names below retain their literal Dutch names from the game.

| Level | Area | Name in game | Mechanic | After level |
| --- | --- | --- | --- | --- |
| 1 | Paddenstoelenrijk | Het paddenstoeldorp | Bouncing mushrooms, floating flower platform | Start |
| 2 | Paddenstoelenrijk | Het kleine deurtje | Shrinking, low tunnel | 1 |
| 3 | Paddenstoelenrijk | De reuzentuin | Growing, pushing a heavy stone | 1 |
| 4 | Paddenstoelenrijk | Het onderstebovenkasteel | Portal mushrooms, first boss | 2 or 3 |
| 5 | Schaakkasteel | De omgekeerde laan | Temporarily reversed horizontal controls | 4 |
| 6 | Schaakkasteel | De dansende schaakstukken | A switch moves a path | 5 |
| 7 | Schaakkasteel | Het plafondpad | Temporary upward gravity | 5 |
| 8 | Schaakkasteel | Het wandelende schaakkasteel | Switch, chess king | 6 or 7 |
| 9 | Droomzee | De theekopjeshaven | Bouncing, figure-eight flower platform | 8 |
| 10 | Droomzee | De verloren boot | Reversed controls, unlocking a secret route | 9 |
| 11 | Droomzee | Het geheime droomeiland | Optional coin route, dream star | 10 |
| 12 | Regenboogkristalkasteel | De regenboogaanlegplaats | Red → yellow → blue opens the bridge | 10 |
| 13 | Regenboogkristalkasteel | De kristalwand | Temporary rightward gravity | 12 |
| 14 | Regenboogkristalkasteel | De kleurenbrug | Green makes platforms solid | 12 |
| 15 | Regenboogkristalkasteel | Het regenboogkristalkasteel | Crystal sequence and crystal king | 13 or 14 |

After level 6, an extra flower path to the harbor appears once the harbor is unlocked. After level 8, a connection with three swing destinations becomes available: levels 6, 8 and later 10. The button shows the current swing destination. After level 9, the chess castle moves to a second map position. After level 10, the whirlpool opens a route from the harbor to the secret island. Castles, the island and all earlier levels remain reachable.

The main route has a continuous safe floor. Disappearing and moving platforms sit above it. The low tunnel roof has actual collision and requires the small size. Growth and shrinking last twelve game seconds; reversed controls last six; altered gravity lasts eight. Pausing freezes these effects. Crystals and switches open an actual passage and make bridge blocks solid. The finish stays locked while a puzzle or boss is active.

This is a separate local single-player adventure. Campaign objects are recreated for each level; only completed levels, map position and the earned dream star are saved. Replaying does not award extra dream stars.

## Enemies and bosses

The eight characters from [boss reference data](../../../../public_html/engine/tests/fixtures/wonderland/bosses.json) are implemented at two sizes. Small enemies take one hit and patrol, jump or float. Each level has four small figures with different colors, sizes and patterns. Each species supports twelve combinations of three palettes, two body shapes and two facial patterns. Large bosses are approximately 2.4 times the base size and retain the pack's fixed colors and silhouettes.

| Character | First encounter: escapes | Return: becomes friendly | Weak point in this campaign |
| --- | --- | --- | --- |
| Blubberus | 1 | 8 | After the sneeze, the crown sparkles; jump on it. |
| Wafzilla | 2 | 9 | Step on the butter plate during or after the sliding attack, then hit the waffle. |
| Sockstein | 3 | 10 | Step on laundry buttons 1 and 2 within eight seconds, then hit the dizzy sock. |
| Tick-Tock | 4 | 11 | Wait for twelve; jump on the red alarm button. |
| DJ Thunderfluff | 5 | 12 | Step left, right, left, right; no time limit. |
| Crumblecastle | 6 | 13 | Use the cushion steps to hit the flag while the castle is sitting. |
| Princess Mirrorphantom | 7 | 14 | Choose the mirror button by the red nose; the correct mirror changes each round. |
| Emperor Wobbleflap | 15 | Finale | Seven crown rounds; activate both star plates in sequence and hit the crown. A white rabbit then appears. |

Battles adapt the concepts to the existing platform campaign: three hits for a regular boss, seven for Wobbleflap. An exclamation mark and fixed yellow floor marker telegraph attacks at least 1.5 seconds in advance. The first attack is a safe demonstration. Slime and footsteps can be jumped over, butter and socks slow the player temporarily, lightning strikes the marked spot and mirrors show distracting reflections. Wobbleflap's seven crown symbols and attack patterns change each round. Collecting seven separate reward abilities from the concept documents is not required; both plates can be activated sequentially in solo play.

The boss activates only at its arena. Entry ends temporary gravity and reversed controls, allowing safe combat even after the crystal wall. The floor stays intact. Outside a sparkling vulnerability window, fire, ice and bubbles do not damage a large boss. Jump targets are reachable from the floor; fire is optional. DJ and the mirror princess take hits directly from the correct puzzle choice. The finish works only after both the level puzzle and boss battle are complete.

`public_html/engine/wonder-foes.mjs` contains an explicit copy of the supplied JSON identities and colors; the comparison in `public_html/engine/tests/wonder-foes.test.mjs` checks that they match. `wonder-foe-art.mjs` draws the figures on transparent canvas space. These figures are campaign objects without new builder tile IDs. Existing snapshots also preserve their phases, buttons and temporary effects; Wonderland remains single-player.

The [visual and playable test page](../../../../public_html/engine/tests/wonder-foes.html) shows all large bosses, twelve small examples per type and a choice of all fifteen battles. Use color/grayscale and motion on/off for visual checks. The page uses the same rendering and game code and is available through the local server. The standalone `speel.html` includes both new modules.
