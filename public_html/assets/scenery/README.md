# Gedeelde PNG-vellen en losse illustraties

[Afbeeldingen en nieuwe spelregels](../README.md) · [Loader en uitsneden](../../engine/look.mjs)

Deze bestanden horen bij gedeeld tekenwerk. Een atlas is een PNG met meerdere vakken; de code moet weten waar ieder vak ligt. De nieuwe karakter-, vijand- en structuurmappen hebben hun eigen afbeeldingsverwijzingen. Begin voor zo’n nieuw object bij die eigen map.

## Bestaande bestanden

| Bestand | Gebruik |
| --- | --- |
| [brick-variants.png](../../gameplay/platforms/images/brick-variants.png) | Ouder terreinvel; de actieve baksteenverwijzing loopt via structures. |
| [cat-sprites.png](../../gameplay/characters/mounts/cat-sprites.png) | Katvorm-atlas; de framevolgorde staat in LOOK_ATLASES. |
| [crazy-backgrounds.png](../backgrounds/crazy-backgrounds.png) | Achtergronden voor het gekke spel; het pad wordt door de wereldrenderer gebruikt. |
| [dino-sprites.png](../../gameplay/characters/mounts/dino-sprites.png) | Dino-atlas; de framevolgorde staat in LOOK_ATLASES. |
| [ground-variants.png](../../gameplay/platforms/images/ground-variants.png) | Ouder terreinvel; controleer de actieve `terrain.image` onder structures voordat je dit wijzigt. |
| [logo-transparent.png](ui/logo-transparent.png) | Transparante logoversie; wordt onder meer in de interface gebruikt. |
| [logo.png](ui/logo.png) | Gedeeld logo; controleer alle interfaceverwijzingen. |
| [objects-sheet.png](../../gameplay/interactables/images/objects-sheet.png) | Gedeelde objectuitsneden, zoals veer, vlag en stekels. |
| [rewards-sheet.png](../../gameplay/powerups/images/rewards-sheet.png) | Tekenwerk voor beloningen, waaronder muntjes. |
| [scenery-sheet.png](scenery-sheet.png) | Decor zoals bomen, struiken, bloemen en huis. |
| [terrain-sheet.png](../../gameplay/platforms/images/terrain-sheet.png) | Oorspronkelijk gedeeld terrein-/decorvel, geladen via LOOK_SHEETS. |

## Een uitsnede aanpassen

1. Open `../../look.mjs` en zoek de naam in `LOOK_SHEETS`, `LOOK_REGIONS` of `LOOK_ATLASES`.
2. Controleer de hele afbeeldingsafmeting en de gebruikte rechthoek of rastercel. Bij een atlas hoort ook de volgorde van de framenamen.
3. Teken voor een eerste proef binnen één bestaande uitsnede. Laat andere vakken op hun plaats.
4. Wijzig je de velgrootte, rasterindeling of positie, pas dan de uitsnedecode mee aan. De loader kent je nieuwe indeling niet vanzelf.
5. Controleer de transparante randen. De bestaande uitsnede-/achtergrondbewerking verschilt voor echte alfa, texturen en oudere lichte achtergronden.
6. Bekijk het onderdeel in het spel op de werkelijke schaal; controleer ook naast andere objecten en op een donkere achtergrond.

## Een nieuw bestand of nieuwe frames toevoegen

Een nieuw gedeeld vel vraagt een naam/pad, uitsneden of atlasdefinitie en rendercode die die naam gebruikt. Voeg de verwijzing toe aan `LOOK_SHEETS` waar dat het juiste systeem is en laat server en offlinebuild het bestand meenemen. Eigen spelspecifieke afbeeldingen horen in hun gamepakket; eigen vijand-/structuurafbeeldingen onder het bijbehorende profiel.

De oudere `../../gameplay/platforms/images/ground-variants.png` en `../../gameplay/platforms/images/brick-variants.png` in deze map zijn niet de automatische actieve terreinbron. Kijk naar `structures/terrain/ground/structure.json` en `structures/blocks/brick/structure.json`; pas het daar genoemde PNG-vel aan om de actuele aansluitende texturen te wijzigen.

## Een nieuw spelonderdeel

Voor een nieuw uiterlijk volg je de juiste profielhandleiding. Voor een nieuw effect, rijdier of type beloning moet je ook de code voor aanmaak, bediening, botsing, verzamelen en resultaat toevoegen. Een nieuwe uitsnede met een naam krijgt die regels niet automatisch.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

Controleer afbeeldingswijzigingen met `node public_html/engine/tests/look.test.mjs` en visueel in de browser. Bij terreinwijzigingen gebruik je ook `node public_html/engine/tests/terrain.test.mjs`. Bouw daarna de offlineversie. Houd bewerkbare tekenbronnen apart van de runtime-PNG’s en lever aangepaste uitsnedecode samen met de nieuwe PNG in.
