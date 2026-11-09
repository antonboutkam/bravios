# Spelpakketten

Elk spel heeft een eigen map met `game.mjs` (sessiefactory en bediening), `model.mjs` (simulatie) en `render.mjs` (beeld). Spelspecifieke afbeeldingen en geluiden horen bij hetzelfde pakket. De bestaande games gebruiken hun gedeelde canvasachtergrond uit `shared/`.

Registreer een nieuw spel in `catalog.mjs`. De schil in `shell.mjs` regelt fullscreen, de menukeuze en invoer. `platformer/encounters.mjs` onderbreekt en hervat de bestaande platformengine; die engine en de bouwer staan nog op hun oorspronkelijke paden.

Zie [het sessiecontract en de uitbreidingsstappen](../../../docs/other/architecture/spelpakketten.md).


## Studenten: een nieuwe kleine game toevoegen

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

### 1. Kies en kopieer een eenvoudig pakket

Kopieer bijvoorbeeld de hele map `catch/` naar `gem-catch/`. Lees eerst de README in `catch/`. Elk bestaand klein spel scheidt drie rollen: `model.mjs` bewaart toestand en simulatie, `render.mjs` tekent en `game.mjs` koppelt invoer, sessie en schermteksten. Regels in `render.mjs` aanpassen is geen betrouwbare manier om de score te veranderen.

### 2. Geef de nieuwe game een eigen identiteit

Zet in de gekopieerde `model.mjs` de toestand-`kind` op `gem-catch`. Pas naam, status, hints en resultaattekst in `game.mjs` aan. Controleer alle aantallen en grenzen die je verandert: een nieuw doel moet zowel in de winregel als in de status kloppen. Laat `createSession(context)` en het bestaande sessiecontract werken.

### 3. Registreer metadata én de importer

Voeg aan `SMALL_GAME_TYPES` in `catalog.mjs` een eigen item toe, bijvoorbeeld:

```js
{id:'gem-catch',name:'Edelsteenvanger',icon:'💎',view:'front',players:[1],hint:'Vang de edelstenen met je mand.'}
```

Voeg daarnaast een tak toe aan de bestaande `switch` in `loadGamePack`:

```js
case 'gem-catch': return import('./gem-catch/game.mjs');
```

Gebruik een expliciet relatief importpad. De offlinebouwer volgt deze imports. Alleen metadata toevoegen maakt nog geen laadbare game. Er is hier geen `games.json` of automatische mapscanner.

### 4. Beeld en invoer afmaken

Verander de tekening in je eigen `render.mjs`. De huidige kleine games gebruiken een logisch speelveld van 800 × 440 pixels; `shared/session.mjs` en de schil schalen het canvas en aanwijzerposities. Controleer muis, aanraking, toetsen en controller als je ze ondersteunt. Kondig alleen spelersaantallen of pauzemogelijkheden aan die jouw sessie echt uitvoert.

Eigen PNG’s en geluiden horen in de nieuwe game-map. Een nieuw bestand moet ook worden geladen en door server en offlinebuild worden meegenomen. Voor een nieuw PNG-pad buiten de JSON-catalogi voeg je het pad toe aan de bestandenlijst van `../server.mjs` en de assetlijst van `../build.mjs`. Gebruik bij laden de assetlookup voor offlinegegevens in plaats van alleen een externe URL.

### 5. Sessies en opruimen

Een sessie levert onder meer `state`, `update(input, dt)`, `render`, `ui`, `result` en `dispose`. Gebruik voor een vergelijkbare kleine game eerst `wrapGameSession` in `shared/session.mjs`. Die adapter ruimt zijn eigen toestand op; extra door jouw code gemaakte listeners, timers of beelden moet je ook opruimen, bijvoorbeeld via `context.scope` en de bestaande runtime.

Start geen tweede onafhankelijke animatielus naast de schil. Houd simulatie en tekenen gescheiden. De metadata-keuze in het menu hoort de game pas te importeren als die gekozen wordt.

### 6. Controleren

```sh
node public_html/engine/tests/small-games.test.mjs
node public_html/engine/tests/small-games-ui.test.mjs
node public_html/engine/tests/game-runtime.test.mjs
npm run build
```

Voeg voor nieuwe spelregels betekenisvolle tests toe, pas waar nodig catalogusverwachtingen aan en voer daarna `npm test` uit. Start de nieuwe game, win/verlies, ga terug naar het menu en start haar nogmaals. Controleer ook `speel.html` zonder webserver.

### Voorbeelden en gedeelde code

| Map | Handleiding |
| --- | --- |
| `aim` | [Mik & schiet](aim/README.md) |
| `balloons` | [Ballonnenpret](balloons/README.md) |
| `catch` | [Fruitvanger](catch/README.md) |
| `rhythm` | [Stekelsprong](rhythm/README.md) |
| `shared` | [Gedeelde sessie en achtergrond](shared/README.md) |
| `platformer` | [Een tussenspel aan het platformspel koppelen](platformer/README.md) |
