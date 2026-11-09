# Design and source material

[Documentation overview](../../README.md)

This directory contains material used to develop the game. The browser does not load files from here.

| Directory | Contents |
| --- | --- |
| [source-images](source-images/) | Originally supplied images and earlier logo illustrations |
| [prompts](prompts/) | Generation prompts for backgrounds, terrain, creatures and character parts |
| [wonderland](wonderland/specs.md) | Design, level descriptions and boss concepts |

Images loaded by the game belong in `public_html/assets/`, `public_html/characters/` and `public_html/worlds/`. Keep images with their character or campaign when they are specific to it. The README logo uses the existing game image at `public_html/assets/look/logo.png`.

Expected boss data for the automated test is in [public_html/tests/fixtures/wonderland/bosses.json](../../../public_html/tests/fixtures/wonderland/bosses.json). A fixture is a fixed data file against which a test compares its result.

New game images belong with runtime files. Design text, prompts and unused originals belong here. When adding runtime images, also check the file lists in `public_html/build.mjs` and `public_html/server.mjs`.
