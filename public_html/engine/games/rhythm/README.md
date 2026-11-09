# Kleine game: Stekelsprong

[Nieuwe game stap voor stap](../README.md) · [Gedeeld sessiecontract](../shared/README.md)

Spring op het ritme over de bewegende stekelballen. Dit pakket is geregistreerd met ID `rhythm` in [catalog.mjs](../catalog.mjs). De menu-interface laadt de implementatie via de bijbehorende expliciete import.

## Bestanden en verantwoordelijkheden

| Bestand | Wat je hier verandert |
| --- | --- |
| [model.mjs](model.mjs) | `createRhythmGame`, `jumpRhythm`, `stepRhythmGame` en `rhythmTempo`: tempo, sprongen, botsingen en monster/spelerstatus. |
| [render.mjs](render.mjs) | `draw`: het ritmespel en de deelnemers tekenen via gedeelde services. |
| [game.mjs](game.mjs) | `createSession`: één/twee spelers, pauze, actietoetsen en deelnemersidentiteit. |

Het model bevat spelregels en toestand. De renderer mag die toestand tekenen, maar moet haar niet als neveneffect veranderen. `game.mjs` maakt de koppeling naar de gedeelde schil en het sessiecontract.

## Eerste oefening in deze game

Maak de tempo-opbouw na de eerste minuut rustiger in `rhythmTempo`. Controleer zowel het balinterval als de snelheid en test het begin én een latere fase. De speeltijdparameter is niet de enige winregel: de simulatie kijkt ook of spelers of monsters nog leven.

Werk in kleine stappen. Noteer eerst wat een speler na jouw wijziging moet merken. Verander het model en de teksten samen als je een regel of aantal aanpast.

## Een nieuwe game maken op basis van deze map

1. Kopieer de **hele map** naar een nieuwe buurmap met een unieke kleine-letter-ID.
2. Zet de `kind` van de nieuw aangemaakte gametoestand op dezelfde ID. Behoud de bestaande relatieve imports of pas ze bewust aan wanneer je bestanden verplaatst.
3. Verander eigen spelregels in `model.mjs`, beeld in `render.mjs` en bediening/hints in `game.mjs`.
4. Voeg een metadata-item én een expliciete `loadGamePack`-import toe in `../catalog.mjs`. De [hoofduitleg](../README.md) geeft een volledig registratievoorbeeld.
5. Kondig alleen spelersaantallen, aanzichten en pauzemogelijkheden aan die je code ondersteunt.
6. Houd nieuwe spelspecifieke afbeeldingen in jouw map en neem hun paden op in server en offlinebuild wanneer die paden niet door een bestaande catalogus worden verzameld.
7. Laat elke sessie eigen toestand maken. Controleer stoppen, opnieuw openen en opruimen van extra resources.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Uitproberen en controleren

Probeer één en twee spelers, toetsen en controller, pauzeren midden in een sprong, na pauze verdergaan en het einde nadat spelers of monsters uitvallen.

```sh
node public_html/engine/tests/small-games.test.mjs
node public_html/engine/tests/small-games-ui.test.mjs
node public_html/engine/tests/game-runtime.test.mjs
```

Voeg bij nieuwe regels tests toe voor winst/verlies en belangrijke grenzen; pas bestaande verwachtingen alleen aan als jouw wijziging dat inhoudelijk nodig maakt. Voer daarna `npm test` uit wanneer het gedeelde contract wijzigt. Maak met `npm run build` een nieuwe `speel.html` en start de game daarin opnieuw.

## Veelvoorkomende fouten

Een nieuwe map zonder catalogusitem en import verschijnt niet als laadbare game. Een verkeerde toestand-`kind` kan de resultaatmelding of achtergrond verkeerd laten werken. Een wijziging aan een getekend aantal verandert het model niet. Een nieuwe game hoeft de platformengine niet zelf te importeren: gebruik de bestaande services en de sessieadapter waar die passen.
