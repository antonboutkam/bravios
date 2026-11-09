# Wereldafbeeldingen

Elke wereld met een eigen kaartafbeelding krijgt een map onder `public_html/worlds/`.

- `wonderland/world-inspiration.png`: kaart en startscherm van Wonderland.
- `adventure/adventure-map.png`: kaart en startscherm van De avonturiers.

Gebruik voor een nieuwe wereld een eigen map, bijvoorbeeld `worlds/mijn-wereld/`, en plaats daar de wereldafbeelding. Koppel het pad aan de kaartmodule en eventueel het startscherm. Registreer de afbeelding ook in `server.mjs` en `build.mjs`, zodat de Node-server en de offlineversie haar meenemen. Alleen een map toevoegen maakt nog geen speelbare wereld.

Het eerste spel, het gekke spel en samen spelen gebruiken getekende levelvoorbeelden in plaats van een eigen kaartafbeelding. Door spelers gemaakte werelden staan als gegevens in de browser; `worlds.mjs` beheert die gegevens.
