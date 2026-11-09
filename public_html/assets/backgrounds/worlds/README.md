# Wereldafbeeldingen

Elke wereld met een eigen kaartafbeelding krijgt een map onder `public_html/assets/backgrounds/worlds/`.

- `wonderland/world-inspiration.png`: kaart en startscherm van Wonderland.
- `adventure/adventure-map.png`: kaart en startscherm van De avonturiers.

Gebruik voor een nieuwe wereld een eigen map, bijvoorbeeld `worlds/mijn-wereld/`, en plaats daar de wereldafbeelding. Koppel het pad aan de kaartmodule en eventueel het startscherm. Registreer de afbeelding ook in `server.mjs` en `build.mjs`, zodat de Node-server en de offlineversie haar meenemen. Alleen een map toevoegen maakt nog geen speelbare wereld.

Het eerste spel, het gekke spel en samen spelen gebruiken getekende levelvoorbeelden in plaats van een eigen kaartafbeelding. Door spelers gemaakte werelden staan als gegevens in de browser; `worlds.mjs` beheert die gegevens.


## Studenten: een wereld toevoegen

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

### Route A: zelf een wereld bouwen zonder code

Open in het spel de wereldbouwer. Maak een wereld, zet knooppunten op de kaart, verbind ze en configureer/bouw de bijbehorende levels. Probeer start, finish, routes en heropenen van de wereld. Deze gegevens worden door `worlds.mjs` beheerd en staan niet als automatisch ingelezen map onder `worlds/`.

Gebruik de export-/importfunctie van de wereldbouwer om jouw wereldbestand te delen. Maak niet op eigen initiatief een `world.json` in deze map in de verwachting dat de app die scant; daarvoor bestaat nu geen algemene loader.

### Route B: een kaartafbeelding voor een ingebouwde wereld

1. Maak een eigen map, bijvoorbeeld `worlds/mijn-wereld/`, en plaats daar de PNG.
2. Lees [adventure/README.md](adventure/README.md) en [wonderland/README.md](wonderland/README.md) om te zien welke modules die voorbeelden gebruiken.
3. Koppel het nieuwe pad aan de juiste kaartmodule en waar nodig de startschermillustratie in `index.html` of `app.mjs`.
4. Neem het pad op in de toegestane bestanden van `server.mjs` en in de assetlijst van `build.mjs`. Bestaande voorbeelden hebben die vermelding al; een nieuw pad wordt hier niet automatisch ontdekt.
5. Houd knooppuntposities, paden en de leesbaarheid van de kaart in lijn met de tekening. Een afbeelding bevat geen speelbare levels.
6. Controleer zowel `npm start` als de met `npm run build` gemaakte `speel.html`.

### Route C: een nieuwe ingebouwde campagne

Een campagne vraagt velddefinities, levelaanmaak, kaartcode, ontgrendelregels, opslag en een ingang vanuit de interface. De voorbeelden zijn geen algemeen configureerbare wereldpakketten. Controleer vaste veldtellingen, winkeloffsets, finale-indexen en bijbehorende tests voordat je een rij aan een bestaande campagne toevoegt.

Begin voor onderwijsdoeleinden met een kleine eigen route in de wereldbouwer. Maak pas een nieuwe vaste campagne als je begrijpt welke code haar aanmaakt en voortgang bewaart. Voor nieuwe objecten binnen zo’n wereld gebruik je de [vijand-](../../../gameplay/enemies/README.md), [baas-](../../../gameplay/enemies/bosses/README.md) en [structuurhandleidingen](../../../gameplay/STRUCTURES.md).
