# 3D-velden in Bravios

[Architectuur](README.md) · [Wereldmaker](../../../public_html/engine/world-editor.mjs)

## Spelen en bouwen

Kies op het startscherm **Speel 3D-voorbeeld** om direct te spelen. Deze knop bewaart één voorbeeldwereld en hergebruikt die bij volgende bezoeken, inclusief je wijzigingen en voortgang. Via **Bouw een wereld → Voorbeeldwereld met 3D** kun je daarnaast een nieuwe kopie maken. De wereld bevat een gewoon 2D-veld en **De zwevende tuinen · 3D**. Kies **Spelen**, een veld en **Speel dit veld**. Een gehaald 3D-veld krijgt hetzelfde vinkje op de wereldkaart als een 2D-veld.

Bij een nieuw veld kies je **2D-platformer** of **3D-platformer**. Het type van een bestaand veld staat vast om te voorkomen dat omzetten een bouwwerk wist. Kies voor een ander type een nieuw veld. In de 3D-bouwer:

- Kies een onderdeel en klik op het raster. **Hoogte Y** bepaalt de bouwlaag.
- Vul X, Y en Z in en klik **Plaats op deze plek** voor een exacte positie.
- Kies **Selecteren / verplaatsen** of een onderdeel uit de lijst. Wijzig de positie of afmetingen en klik **Verplaats / pas aan**.
- **Draai blok 90°** verwisselt breedte en diepte. Bevestig met plaatsen of aanpassen.
- **Ongedaan** en **Opnieuw uitvoeren** bewaren maximaal zestig bouwstappen.
- Sleep met de rechtermuisknop om de camera te draaien, met de middelste knop om te verschuiven en scroll om te zoomen.
- Met **Proefspelen** test je het opgeslagen ontwerp. **Verder bouwen** herstelt hetzelfde ontwerp: verzamelde munten en verslagen vijanden veranderen het levelbestand niet.

Tijdens het spelen: WASD/pijltjes lopen ten opzichte van de camera, spatie springt, Q/E draaien de camera, P pauzeert. Een standaardcontroller gebruikt de linker stick/D-pad, A/kruisje en Start. B/cirkel gaat terug. Aanraakknoppen bieden dezelfde loop- en springacties. De knoppen onderaan draaien de camera ook op een touchscreen. Bij focusverlies pauzeert het spel.

## Geschikte personages en vijanden

**Een wereld met minstens één 3D-veld is in zijn geheel voorbehouden aan personages met een geregistreerd 3D-model.** Ook bij het starten van een 2D-veld binnen die wereld wordt deze regel gecontroleerd. Eigen samengestelde 2D-personages krijgen geen stilzwijgende vervanging door Boaz of Ravi. Als het geselecteerde personage ongeschikt is, verschijnt de keuze met uitsluitend geschikte personages.

De eerste modellen zijn vereenvoudigde, originele 3D-uitwerkingen van Boaz, Ravi en de wandelvijand. Pixel heeft geen model en verschijnt daarom niet in de keuze voor een gemengde wereld. De 2D-personages en afbeeldingen blijven bestaan.

Een `character.json` of `enemy.json` registreert een model zo:

```json
"model3d": { "file": "3d/model.glb" }
```

Het model staat in de eigen map, bijvoorbeeld `public_html/gameplay/characters/boaz/3d/model.glb`. Het is een zelfstandig glTF 2.0 binary bestand met meshes, materialen en een `run`-animatie. Schaal: één eenheid is één blok; voeten op Y=0, Y omhoog, gezicht naar +Z. De huidige spelerbotsing is 0,54 blok breed en 1,55 blok hoog. De loopanimatie gebruikt hiërarchische onderdelen; geïmporteerde modellen moeten dezelfde visuele maat aanhouden. Babylon AssetContainer maakt per personage een eigen modelinstantie met eigen animatiegroepen en, waar aanwezig, gekloonde skeletons. De meegeleverde modellen gebruiken losse, geanimeerde onderdelen.

`3d/previews/` bevat voorkant, achterkant, linkerzijde, rechterzijde en perspectief als PNG. De modelgalerij (**Personages in 3D** in de bouwer) toont het werkelijke GLB-model vanuit dezelfde richtingen en laat vrij draaien toe. Met **Download dit aanzicht** kun je een nieuwe PNG uit het model opslaan. De PNG's zijn naslagmateriaal; ze verlenen geen 3D-toegang.

Bij personages slaan de voorbereidingsscripts een ontbrekend GLB-bestand over: het personage blijft beschikbaar in 2D, zonder 3D-toegang. De browser controleert dezelfde beschikbaarheid bij het laden van de catalogus. De configuratie blijft intact, zodat een later toegevoegd model na vernieuwen automatisch beschikbaar wordt. Aanwezige modellen worden bij het voorbereiden gecontroleerd op bestandstype, meshes en externe buffers of afbeeldingen; ongeldige modellen blijven fouten geven. Tijdens spelen/bouwen wordt het echte GLB geladen. Een laadfout wordt zichtbaar gemeld en levert geen vervangend 2D-personage op.

De 3D-vijandenlijst vereist daarnaast een ondersteunde 3D-controller. Nu is dat `kind: "walker"` uit de groep `game`: patrouilleren, omkeren bij randen en muren, schade bij zijwaarts contact, verslaan door bovenop te springen. Andere 2D-vijanden blijven in 2D bruikbaar, maar worden niet automatisch 3D-vijanden door alleen een bestand toe te voegen. Nieuwe vijandtypen vereisen uitbreiding van `access.mjs`, `model.mjs` en bijbehorende tests. Import van een 3D-veld met een ongeschikte vijand wordt geweigerd.

## Code en gegevens

De modules staan onder `public_html/engine/games/platformer3d/`:

| Bestand | Verantwoordelijkheid |
| --- | --- |
| `assets.mjs` | Modelpad in de manifesten en assetlijst |
| `access.mjs` | Beschikbare personages/vijanden en toelatingsregels |
| `level.mjs` | Opslagformaat, validatie en voorbeeldveld |
| `model.mjs` | Spelregels, munten, finish en vijandgedrag |
| `physics.mjs` | Babylon/Havok-capsulecontroller en statische platformbotsingen |
| `input.mjs` | Richtingen uit toetsenbord, aanraking en controller |
| `render.mjs` | Babylon.js, GLB laden, licht, camera, modellen en opruimen |
| `render-budget.mjs` | Tekenen na veranderingen, beeldfrequentie en resolutie begrenzen |
| `shell.mjs` | Bouwer, spelen, bediening en modelgalerij |
| `vendor/babylon.mjs` | Lokaal gebundelde Babylon.js, GLB-loader en Havok-interface |
| `vendor/HavokPhysics.wasm` | Lokaal Havok physicsprogramma |

Een 3D-level heeft `kind: "platformer3d"`, `version: 1`, `name`, `theme`, `width`, `height`, `depth` en `objects`. X/Z zijn het grondvlak, Y is de hoogte. Objectcoördinaten zijn gehele blokposities. Een blok heeft `w`, `h`, `d`; een vijand een geregistreerde catalogussleutel `enemy`. Toegestane onderdelen: `block`, `coin`, `start`, `finish`, `enemy`, `lava`. Breedte/diepte 20–80, hoogte 16–32, maximaal 600 onderdelen. Het onvoltooide ontwerp mag zonder start of finish worden bewaard; spelen vereist beide en vrije ruimte erboven. Verkleinen weigert onderdelen buiten de nieuwe afmetingen en verwijdert ze niet stilzwijgend.

`worlds.mjs` valideert beide leveltypen in het bestaande wereldformaat. Opslaan, wereld downloaden en importeren bewaren het type en de onderdelen. Veranderen van een level wist het voltooiingsvinkje van dat veld. Bestaande 2D-werelden veranderen niet van formaat.

Havok wordt eenmaal asynchroon geladen. Elk spel krijgt een eigen Babylon NullEngine-scène met statische blokken en een PhysicsCharacterController. De simulatie loopt met vaste stappen, onafhankelijk van de tekensnelheid. Babylon handelt de capsulebotsingen en het glijden langs oppervlakken af; onze spelregels kiezen snelheid, zwaartekracht en sprongimpuls. Stoppen, opnieuw beginnen en teruggaan naar de bouwer ruimen de physics-scène op. De editor en modelgalerij hebben geen actieve physicswereld.

Het pakket wordt pas actief geladen bij het openen van een 3D-veld. De camera van de bouwer kadert de geplaatste onderdelen in plaats van de volledige lege bouwruimte. Stilstaande bouwers en modelvoorbeelden renderen alleen na een wijziging. Tijdens spelen geldt een maximum van 30 beelden per seconde en 1280 × 720 renderpixels; bij herkende software-rendering 15 beelden per seconde en maximaal 640 × 400 pixels. Het canvas blijft het beschikbare scherm vullen. Er is geen supersampling, anti-aliasing of schaduwpass. De PNG-export rendert één keer expliciet, zonder een permanente bewaarde framebuffer. De hoofdanimatielus slaat de 2D-weergave over zolang het 3D-venster open is. Sluiten stopt de eigen lus, listeners en controller, verwijdert geometrieën/materialen en sluit de WebGL-context. Offline zijn de bibliotheek, Havok-WASM en GLB-bestanden in `speel.html` opgenomen; er is geen CDN of netwerk nodig.

Dit is de eerste solo-uitvoering met toegang via de wereldkaart. Een portaal midden in een 2D-level en online samenspel zijn nog geen ondersteunde route. De bestaande PHP-kamers ontvangen uitsluitend het bestaande 2D-formaat. WebGL en WebAssembly zijn nodig voor 3D; zonder ondersteuning verschijnt een melding en blijft de terugknop beschikbaar.

## Modellen en bibliotheek opnieuw bouwen

`python3 scripts/generate-3d-models.py` maakt de drie meegeleverde modellen opnieuw zonder Python-pakketten. Bewerk dit script alleen voor die modellen; bestaande handgemaakte GLB-modellen van andere personages worden niet aangeraakt. De generator herschrijft geen PNG-aanzichten.

De engine is Babylon.js **9.36.0**, met Havok **1.3.14**, gebundeld met esbuild **0.28.2**. Licenties staan in `vendor/BABYLON-LICENSE.txt` en `vendor/HAVOK-LICENSE.txt`. Zie [vendor/README.md](../../../public_html/engine/games/platformer3d/vendor/README.md) voor reproduceerbare bouwinstructies. Spelen, `npm start` en de normale offlinebuild hebben geen geïnstalleerde npm-afhankelijkheden nodig.

## Controles

```sh
node public_html/engine/tests/platformer3d.test.mjs
npm test
php -l public_html/engine/room.php
npm run build
```

De gerichte tests controleren toegang, echte modellen, wereldimport/export, ongeldige vijanden, botsingen, springen, muntjes, vijanden, een haalbare voorbeeldroute en offline-modulecompilatie. Browsercontroles moeten ook bouwer → proefspelen → bouwer, terug naar de wereldkaart, vernieuwen en `speel.html` omvatten. Fysieke controllerbediening blijft een afzonderlijke controle.
