# Kleine games koppelen aan het platformspel

[Spelpakketten](../README.md) · [Runtime-/encountercontract](../../../../docs/other/architecture/spelpakketten.md)

Deze map bevat een adapter rondom het bestaande platformspel. De platformengine zelf staat nog in `../../engine.mjs` en de applicatie/bouwer in `../../app.mjs`. [encounters.mjs](encounters.mjs) kan een ouder spel pauzeren, een kleine game laten spelen en daarna dezelfde oudertoestand hervatten.

## Wat bestaat al?

`createPlatformEncounters` gebruikt `GameFlow`. De aanroeper levert functies om het actieve spel en deelnemers op te halen, tijdelijk resources los te laten, ze terug te zetten en een kleine game te starten. `app.mjs` bevat daarvoor `startMiniGameEncounter`. Online kamers worden door de bestaande adapter nog geweigerd.

Er zijn nog geen algemene buis-JSON-velden die automatisch een minigame openen. Een nieuw buisprofiel of een bestand in deze map is dus niet genoeg om een ontmoeting te starten.

## Een nieuw tussenspel uitwerken

1. Maak of kies eerst een zelfstandig werkende kleine game in een eigen `games/`-pakket en registreer haar in `catalog.mjs`.
2. Ontwerp een concrete trigger: welke deur, tegel of knop start haar, wanneer mag dat en wat gebeurt er na terugkomst?
3. Koppel de trigger in de applicatielaag aan `startMiniGameEncounter(gameId, origin, options)`. Roep die applicatiefunctie aan vanuit een plek waar zij beschikbaar is; importeer niet de hele applicatie vanuit de engine.
4. Bewaar een oorsprong met betekenis, bijvoorbeeld soort trigger en tegelpositie, zodat dezelfde aanraking niet direct opnieuw een tussenspel start.
5. Laat de bestaande flow de oudertoestand pauzeren en na afloop hervatten. Maak niet zonder reden een nieuw platformlevel aan.
6. Ontwerp expliciet wat een resultaat doet. Een gewonnen minigame geeft nu niet automatisch een sleutel, munt of power-up.
7. Ruim tijdelijke resources ook op bij annuleren, een fout of teruggaan naar het menu.

## Testplan

Probeer starten tijdens spelen, een normale terugkeer, verliezen/annuleren, twee snelle startpogingen en het sluiten van een sessie die nog aan het laden is. Controleer dat platformtimers stilstaan en daarna op dezelfde positie verdergaan. Controleer ook de bestaande afwijzing in een online kamer; kondig online ondersteuning niet aan zonder haar werkelijk te implementeren.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

Voer `node public_html/engine/tests/game-runtime.test.mjs` uit voor de flow en sessies en voeg voor jouw nieuwe trigger een gerichte test toe. Controleer daarna de game in de browser, de relevante platformtests en de offlinebuild. Deze adapter is een programmeeruitbreiding, geen apart registreerbaar JSON-onderdeel.
