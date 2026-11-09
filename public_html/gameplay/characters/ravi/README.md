# Vast karakter: Ravi

[Alle karakters toevoegen](../README.md) · [Portret en afbeeldingen](images/README.md) · [Platformhoudingen](images/platform/README.md)

Deze map is één vast speelbaar karakter. [character.json](character.json) bevat de ID `ravi`, de zichtbare naam en de PNG-paden. Het spel laadt de map omdat `"ravi"` in [characters.json](../characters.json) staat. Het profiel bevat uiterlijk; snelheid en springkracht worden niet per karakter uit dit bestand gelezen.

## Van dit karakter een nieuwe held maken

1. Kopieer de **hele map** `ravi/` naar bijvoorbeeld `luna/`. Laat de oorspronkelijke map staan.
2. Open de gekopieerde `character.json`. Maak `id` gelijk aan `luna` en kies een eigen naam van maximaal 32 tekens.
3. Behoud voor de eerste proef de bestaande paden. Vervang `images/portrait.png` en daarna de pose-PNG’s en vier loopframes onder `images/platform/`.
4. Voeg `"luna"` toe aan de bestaande lijst in `../characters.json`. Zet niet het hele JSON-object in die lijst en neem `custom` of `shared` niet als held op.
5. Voer vanuit de projectmap `npm run characters:prepare` uit. Ververs de website en kies je nieuwe held.
6. Probeer stilstaan, links/rechts, rennen, springen, landen, juichen en rijden. Controleer ook een kleine game met vooraanzicht.
7. Bouw met `npm run build` en controleer hetzelfde karakter in `speel.html`.

## Het voorbeeldprofiel

```json
{
  "id": "ravi",
  "name": "Ravi",
  "portrait": "images/portrait.png",
  "poses": {
    "idle": "images/platform/idle.png",
    "side": "images/platform/side.png",
    "run": "images/platform/run.png",
    "run-1": "images/platform/run-1.png",
    "run-2": "images/platform/run-2.png",
    "run-3": "images/platform/run-3.png",
    "run-4": "images/platform/run-4.png",
    "jump": "images/platform/jump.png",
    "victory": "images/platform/victory.png",
    "land": "images/platform/land.png",
    "ride": "images/platform/ride.png"
  }
}
```

Na het kopiëren moet vooral de ID veranderen; de relatieve paden blijven binnen jouw eigen nieuwe map wijzen. Een pad begint met `images/`, niet met de naam van de oude held. Alle zeven poses en het portret zijn verplicht.

## Afbeeldingen tekenen

Teken de zijwaartse poses naar rechts: de renderer spiegelt ze voor links. Gebruik voor `idle` een vooraanzicht en voor `side` een stilstaand zijaanzicht. Houd verhoudingen en voetenpositie consistent. De loader kan transparante buitenmarges uitsnijden; gebruik die marge niet als een andere lichaamshoogte.

Rennen wisselt `run-1.png`, `run-2.png`, `run-3.png` en `run-4.png` in deze volgorde, elke 90 milliseconden. Teken achtereenvolgens een uitgestrekte stap, een passerend been, de tegengestelde stap en het andere passerende been. Geef de vier beelden dezelfde canvasafmetingen en lijn lichaam en voeten consistent uit. Het spel gebruikt voor de hele reeks één gezamenlijke uitsnede. Bij minder beweging blijft het eerste loopframe staan.

De vier velden `poses.run-1` tot en met `poses.run-4` zijn samen optioneel. Een karakter zonder deze vier velden blijft de verplichte `run.png` gebruiken. Een gedeeltelijke reeks wordt afgewezen. Een spritevel wordt niet automatisch in frames verdeeld.

## Controleren en foutzoeken

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

```sh
npm run characters:prepare
```

Bij een ID-fout vergelijk je mapnaam, `id` en de vermelding in `characters.json`. Bij een afbeeldingsfout controleer je naam, hoofdletters, PNG-formaat en het pad. Ontbreekt je held maar slaagt de controle, controleer dan of jouw nieuwe map wel in de lijst staat. De controle leest uitsluitend geregistreerde mappen.

Bewerk `../../../engine/characters/catalog.mjs` niet handmatig. Voor een compleet nieuw soort aanzicht of andere karakterafhankelijke spelregels moet je ook `load-catalog.mjs`, `roster.mjs` en/of de gedeelde renderer uitbreiden. De [categoriehandleiding](../README.md) verwijst naar die code.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.
