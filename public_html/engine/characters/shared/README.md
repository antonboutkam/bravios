# Gedeelde code voor karakters

[Vaste held toevoegen](../../../gameplay/characters/README.md) · [Karaktermaker](../../../gameplay/characters/custom/README.md)

Hier staat code die verschillende karakters gebruiken. Dit is geen karaktermap en hoort niet in `characters.json`. Voor een nieuwe held met bestaande poses volg je de categoriehandleiding en hoef je deze bestanden normaal niet te wijzigen.

## Bestanden

| Bestand | Rol |
| --- | --- |
| [poses.mjs](poses.mjs) | Verplichte poses, de vier loopframenamen en de selectie van een stapfase elke 90 ms. |
| [hero.mjs](hero.mjs) | Vaste karakterbeelden laden, transparante uitsneden bepalen en de held in verschillende poses tekenen. |
| [view-assets.mjs](view-assets.mjs) | Een karakteraanzicht via een gedeelde `ResourcePool` laden, gekoppeld aan de levensduur van een gamesessie. |

De profielen zelf komen uit `../roster.mjs` en de catalogus. Houd de karakter-ID gelijk bij het doorgeven van een deelnemer aan een andere game; stuur geen complete PNG door de kamerverbinding.

## Wanneer wijzig je dit wel?

Wijzig dit als je een nieuw aanzicht of een werkelijk nieuw posecontract wilt ondersteunen. Het bestaande karakter-JSON ondersteunt voor- en zijaanzicht. `top-down` en `oblique` staan als mogelijke weergaven in de runtime, maar eigen beelden daarvoor worden niet automatisch uit een extra JSON-veld gelezen.

1. Beschrijf welk nieuw aanzicht of welke pose een renderer nodig heeft.
2. Breid het karakterformaat en `../load-catalog.mjs` bewust uit, met een terugval voor bestaande helden.
3. Werk de beeldvoorbereiding en `../roster.mjs` mee bij.
4. Laat de afnemende game het juiste aanzicht aanvragen. Maak een resource niet per animatieframe opnieuw aan.
5. Koppel nieuwe geladen beelden aan de sessiescope en sluit bitmaps pas wanneer de laatste gebruiker klaar is.
6. Controleer alle vaste helden en de karaktermaker, niet alleen je nieuwe voorbeeld.

## Controleren

```sh
node public_html/engine/tests/game-runtime.test.mjs
node public_html/engine/tests/look.test.mjs
node public_html/engine/tests/character-maker.test.mjs
```

Voer dit uit in de projectmap. Controleer daarna karakterkeuze, platformspel, een kleine game en het sluiten/heropenen van die game. Voer bij contractwijzigingen `npm test` uit en bouw de offlineversie opnieuw. Gewone extra helden registreer je nog steeds via `characters.json`; kopieer `shared/` niet als nieuw karakter.
