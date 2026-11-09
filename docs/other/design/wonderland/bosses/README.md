# Bravios in Wonderland — Boss Design Pack

Eight original, playful end bosses for a surreal, colorful children's game starring Boaz and Ravi.

## Contents

- `BOSS_ROSTER.md` — a quick reference for all eight bosses.
- `ENEMY_VISUAL_SPEC.md` — mandatory visual variety rules for **all enemies**, including color variants for repeated enemies.
- `bosses/` — one complete encounter design per end boss.
- [bosses.json](../../../../../public_html/engine/tests/fixtures/wonderland/bosses.json) — machine-readable reference data used by the automated test.
- `ART_PROMPTS.md` — copy-ready English concept-art prompts.
- `BOSS_LINEUP.png` — original concept-art lineup showing all eight bosses in distinct color schemes.

## Design priorities

1. Silly and surprising, never gruesome. Intended for roughly ages 5–8.
2. Every enemy must look different. Color variation is the minimum; silhouettes, facial details, textures, and movement should vary too.
3. Give every boss a readable attack warning, a puzzle-like weakness, and a fun, nonviolent defeat animation.
4. Use playful Wonderland rules: wobbling tiles, visual illusions, candy physics, music, time tricks, and friendly absurdity.
5. Let Boaz and Ravi cooperate in the final encounter; provide a solo-friendly alternative if needed.

These are **design concepts and prompts**, not production-ready animation sprites or implemented game code. The lineup image is concept art; final sprites can be produced from the individual prompts.


## Implementation in Bravios

The two sizes and fifteen encounters are described in the [level design](../levels.md#enemies-and-bosses), including how concept mechanics were adapted to the existing platform campaign. The [visual and playable test page](../../../../../public_html/engine/tests/wonder-foes.html) shows small variants and large bosses using the actual game code.
