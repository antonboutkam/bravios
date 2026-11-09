# Karakters

Elke vaste held heeft een eigen map met `character.json`, `images/portrait.png` en losse pose-afbeeldingen onder `images/platform/`. Het JSON-bestand bevat de ID, naam en afbeeldingspaden. De ID is gelijk aan de mapnaam.

Vermeld de heldenmappen in `characters.json`, bijvoorbeeld `["boaz", "ravi"]`. De browser leest deze lijst en elk bijbehorend `character.json` bij het openen via `bootstrap.mjs`. Voeg een mapnaam toe en ververs de pagina: een build of serverherstart is niet nodig. Dit werkt met de Node-server en met een gewone statische webserver; PHP en XAMPP zijn niet nodig.

`npm start`, `npm run start:network`, `npm run build` en `npm test` controleren vooraf dezelfde lijst en de PNG-bestanden. `scripts/prepare-characters.mjs` genereert daarvoor `catalog.mjs` voor Node en de offlinebuild. Pas dat bestand niet handmatig aan. Gebruik `npm run characters:prepare` om het afzonderlijk te vernieuwen. Bouw `speel.html` opnieuw om gewijzigde karakters in het losse offlinebestand op te nemen.

`custom/` bevat de karaktermaker en samenstelbare onderdelen. `shared/` bevat gedeelde rendercode en bitmapbeheer. Alleen mappen uit `characters.json` worden geladen. De stabiele karakter-ID en appearance reizen met de speler mee. Het huidige JSON-formaat ondersteunt voor- en zijaanzicht; `top-down` en `oblique` vereisen nog uitbreiding van het configuratieformaat en nieuw beeldmateriaal.

Zie de [studentenuitleg over actiefiguren](../../docs/student/actiefiguren.md) voor een volledig voorbeeld, en [spelpakketten en het karaktercontract](../../docs/other/architecture/spelpakketten.md) voor technische naslag. Oorspronkelijke spritevellen staan in `docs/other/design/source-images/characters/`.

