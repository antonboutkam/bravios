# Platformhoudingen van Boaz

[Karakterhandleiding](../../README.md) · [character.json](../../character.json) · [Overige afbeeldingen](../README.md)

Dit zijn zeven basisposes en vier losse loopframes voor één karakter. De namen onder `poses` in `character.json` bepalen wanneer een bestand wordt gebruikt. Een losse extra PNG wordt niet vanzelf een nieuwe animatie.

| Posebestand | Gebruik en huidige afmetingen |
| --- | --- |
| [idle.png](idle.png) | Vooraanzicht bij stilstaan, onder meer in kleine games. 230 × 334 px. |
| [side.png](side.png) | Stilstaand zijaanzicht in het platformspel. 240 × 335 px. |
| [run.png](run.png) | Terugval voor karakters zonder vier loopframes. 277 × 338 px. |
| [run-1.png](run-1.png), [run-2.png](run-2.png), [run-3.png](run-3.png), [run-4.png](run-4.png) | Vier opeenvolgende stapfasen; elk 288 × 384 px, elke 90 ms een volgend frame. |
| [jump.png](jump.png) | Pose tijdens springen en vallen. 283 × 322 px. |
| [victory.png](victory.png) | Juichen na een overwinning. 288 × 333 px. |
| [land.png](land.png) | Kort landen na een sprong. 293 × 292 px. |
| [ride.png](ride.png) | Zittende pose bij rijden op een rijdier. 887 × 887 px. |

## Eén houding vervangen

1. Begin met één bestand, bijvoorbeeld `side.png`. Bewaar een kopie buiten deze runtime-map.
2. Teken dezelfde held met dezelfde lichaamshoogte en voetenlijn. Zijwaartse poses kijken naar rechts; het spel spiegelt voor links.
3. Gebruik een transparante achtergrond. Let op achtergebleven onzichtbare of halftransparante pixels aan de randen: die kunnen de uitsnede beïnvloeden.
4. Behoud voor de eerste proef de bestandsnaam en globale verhoudingen.
5. Wil je een andere naam gebruiken, pas dan bijvoorbeeld `poses.side` in `../../character.json` aan naar `"images/platform/mijn-zijaanzicht.png"`.
6. Voer `npm run characters:prepare` uit in de projectmap, ververs en probeer beide richtingen en de overgang naar lopen/springen.

## Een volledige nieuwe held maken

Kopieer niet alleen deze posemap. Kopieer de complete bovenliggende karaktermap, wijzig daar `id` en `name`, vervang het portret en de poses en registreer de nieuwe map in `characters.json`. De [karakterhandleiding](../../README.md) beschrijft dat stap voor stap.

Het huidige formaat vereist alle zeven poses. Je kunt voor een eerste schets tijdelijk hetzelfde passende bestand bij meer dan één pose laten verwijzen, maar controleer daarna elke actie. De vier optionele loopframes stel je in met `poses.run-1` tot en met `poses.run-4`. Geef altijd alle vier de paden op en gebruik dezelfde canvasafmetingen, schaal en lichaamspositie. Bij minder beweging blijft frame 1 staan. Een spritevel wordt hier als één afbeelding behandeld.

## Wanneer is het goed?

Bekijk stilstaan in voor- en zijaanzicht, rennen, springen/vallen, landen, juichen en rijden. De held mag bij een posewissel niet plotseling groter worden of van zijn voetenlijn springen. Controleer daarnaast een kleine game en na `npm run build` de offlineversie. Andere sprongkracht of een nieuw perspectief is een code-/formaatwijziging en ontstaat niet door een extra houdingbestand.
