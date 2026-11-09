# Mandatory Enemy Visual-Diversity Specification

## Objective

**Every enemy must look different from every other enemy on screen.** Changing the color scheme is the minimum requirement, but a color swap alone is not enough to make a memorable creature. Apply this rule to the eight end bosses, regular enemies, summoned minions and repeated enemy instances.

## Global requirements

1. **Distinct color schemes:** Give every enemy type its own primary/secondary/accent palette. Avoid two enemy types with the same overall color balance. All eight boss palettes are fixed in `BOSS_ROSTER.md`.
2. **Distinct silhouettes:** Vary height, width, body shape, number of limbs, head size, wings, accessories and/or overall outline. At normal game zoom, enemy types should be recognizable even as black silhouettes.
3. **Distinct faces and details:** Use different eye counts, mouths, facial expressions, materials, patterns, hats and props. Do not merely re-tint one shared character design.
4. **Distinct motion:** Give each enemy type a signature idle and attack animation (wobble, shuffle, hover, bounce, glide, spin, clatter or stretch).
5. **Variant diversity within a type:** When several ordinary enemies or minions of one type appear, assign each visible instance a different variant. Provide at least **three palettes per ordinary enemy type**, plus at least two pattern/face/accessory options and two shape or size options where feasible.
6. **No identical neighbors:** Do not place two visually identical enemies in the same encounter. Track the combination `palette + body_variant + face_pattern + accessory` so each simultaneously visible enemy has a different visual signature. If a preset repeats, select or procedurally create another combination.
7. **Readability:** Preserve strong contrast against the terrain, and do not rely on hue alone. Use shape, pattern and motion for color-blind accessibility. Enemy attacks should have a consistent, clearly visible warning even when palettes vary.
8. **Consistent identity:** Repeated appearances of a named boss should preserve its main shape and color identity. Do not randomly recolor story bosses; use harmless glow, expression or costume details for phases instead.

## Boss palette ownership

| Boss | Primary | Secondary | Accent | Material and shape cue |
|---|---|---|---|---|
| Blubberus | Electric violet `#8D42EF` | Periwinkle `#B99AFF` | Crown gold `#F7C746` | Soft translucent jelly; seven eyes |
| Wafzilla | Toast gold `#DF9F39` | Whipped white `#FFF0D9` | Berry red `#E8425A` | Crisp waffle grid; squarish body |
| Sockstein | Sock teal `#1FA9A2` | Denim blue `#4D6CB5` | Pumpkin orange `#F68D43` | Knitted patchwork; eight long arms |
| Tick-Tock | Antique brass `#B48A41` | Clock turquoise `#41C3C0` | Alarm coral `#FF6D5A` | Gears, bells and needle-thin limbs |
| DJ Thunderfluff | Candy pink `#F76FB9` | Electric cyan `#3ADCF3` | Sunglasses charcoal `#31304C` | Puffy floating storm cloud |
| Crumblecastle | Moss green `#5F9660` | Sandstone `#C2AE80` | Flag crimson `#AA3B48` | Tall masonry towers; chicken legs |
| Princess Mirrorphantom | Chrome silver `#BDC6DE` | Lavender `#A28CDF` | Mirror cobalt `#265FD1` | Faceted mirror wings; long reptile tail |
| Emperor Wobbleflap | Midnight indigo `#24235F` | Deep plum `#5E378A` | Seven rainbow gemstones | Three heads, six arms and starry belly |

## Variant generation suggestion

- Store `enemy_type`, `palette_id`, `shape_id`, `pattern_id`, `accessory_id` and `animation_id` for each spawn.
- On spawn, choose a combination not currently used by that enemy type within the visible encounter.
- Keep any faction or boss-affiliation details recognizable; do not make variants look like entirely unrelated enemies.
- For slime minions, for example, mix lime/peach/sky-blue palettes with tall/round/flat shapes and different eyes. For sock minions, mix stripes, spots, embroidery and accessories.

## Definition of done

- Side-by-side contact sheet: all eight boss silhouettes are unmistakably different.
- Side-by-side contact sheet: no two bosses share the same dominant palette.
- In a test scene with 12 regular enemies, no two simultaneously visible enemies look identical.
- Color-blind/grayscale check: enemies and their attacks remain distinguishable.
- At game zoom and against actual Wonderland backgrounds, each enemy remains identifiable.

These visual requirements are mandatory production acceptance criteria, not optional mood-board suggestions.
