# De karaktermaker uitbreiden

[Vaste karakters](../README.md) · [Onderdelenvellen](parts/README.md) · [Maker-code](../../../engine/characters/custom/maker.mjs)

Deze map bevat de maker waarmee spelers hoofden, kleding, schoenen en accessoires combineren. Een zo gemaakte held is een opgeslagen samenstelling van stabiele onderdeel-ID’s. Hij is iets anders dan een vaste held met een eigen `character.json`. Neem `custom` niet op in `characters.json`.

## Eerst proberen zonder code

Open de karaktermaker in het spel, kies onderdelen, geef je held een naam en sla hem op. Controleer hoe de maker bestaande ID’s bewaart en hoe die held in het platformspel en een kleine game verschijnt. Lees daarna `CHARACTER_PARTS`, `CHARACTER_SHEETS` en `normalizeAppearance` in [maker.mjs](../../../engine/characters/custom/maker.mjs).

## Een onderdeel van een bestaand type toevoegen

1. Kies één categorie: `head`, `outfit`, `shoes` of `accessories`.
2. Bekijk het bijbehorende PNG-vel en de rasteruitleg in [parts/README.md](parts/README.md). De index in `CHARACTER_PARTS` bepaalt de gebruikte cel.
3. Teken de nieuwe cel op de juiste plaats zonder de bestaande celvolgorde te verplaatsen. Bewaar bestaande IDs: opgeslagen figuren verwijzen daarnaar.
4. Voeg in de juiste lijst van `CHARACTER_PARTS` een object met een unieke `id` en een Nederlandse `name` toe. Een hoed krijgt waar van toepassing `hat: true`, zodat de bestaande regel voor één hoed blijft werken.
5. Zijn alle cellen van het huidige vel bezet, breid dan óók de rasterberekening en uitsneden uit. Alleen een extra lijstitem laat de loader niet automatisch een groter raster begrijpen.
6. Controleer of uitzonderingsuitsneden, bijvoorbeeld de ski’s en clownschoenen, nog naar de juiste pixels wijzen.
7. Start of ververs het spel, kies het nieuwe onderdeel en controleer het voorbeeld en de echte bewegende held.
8. Sla een figuur met het nieuwe onderdeel op, herlaad en controleer dezelfde figuur opnieuw. Controleer ook het laden van een oude figuur.

## Een heel nieuw soort onderdeel

Een categorie zoals `cape` bestaat nog niet als algemene JSON-optie. Hiervoor moet je de onderdeeldefinitie, normalisatie, bewaarstructuur, keuzeschermen en samenstel-/tekenvolgorde uitbreiden. Controleer ook samenspelgegevens en terugval voor bestaande opgeslagen figuren. Gebruik hiervoor de bestaande normalisatie als contract; verander niet alleen het scherm.

## Bestanden en controles

- `maker.mjs`: onderdeeldefinities, uitsneden, samenstellen en bewerken.
- `parts/*.png`: runtime-vellen. De maker verwijst via `CHARACTER_SHEETS` naar deze paden.
- `../shared/`: gedeeld tekenen en bitmapbeheer; daar maak je geen nieuw onderdeelprofiel.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

Na een codewijziging:

```sh
node public_html/engine/tests/character-maker.test.mjs
node public_html/engine/tests/game-runtime.test.mjs
npm run build
```

Controleer daarna de maker in de browser en de offlineversie. Voer bij een wijziging aan het gedeelde contract ook `npm test` uit. Een nieuwe kleur of PNG alleen mag geen opgeslagen IDs ongeldig maken.
