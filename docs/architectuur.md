# Architectuur en resources

[Terug naar README](../README.md) · [Spelpakketten, karakters en tussenspellen](spelpakketten.md)

## Het platform

Bravios draait in de browser met standaard HTML, CSS en JavaScript. Er is geen React, Phaser, Unity of andere gamebibliotheek. De `.mjs`-bestanden zijn JavaScript-modules met `import` en `export`. De browser laadt ze vanaf de lokale webserver. HTML bevat onder meer knoppen, dialogen en canvas-elementen. CSS bepaalt de vormgeving van de bediening; Canvas 2D tekent de spelwereld.

Node.js wordt gebruikt voor de ontwikkelserver, de build en JavaScript-tests. PHP is alleen nodig voor kamers en de bijbehorende tests. Je hebt geen database en geen npm-pakketten nodig. De versie-eisen en commando’s staan in [package.json](../package.json): Node ≥18; de bestaande handleiding noemt PHP ≥8.1 voor samenspel.

## Van toets naar beeld

```text
Toetsenbord / muis / aanraking / controller
                  |
                  v
              app.mjs <----> HTML-knoppen en HUD
                  |
                  v
        engine.mjs + specialistische spelmodules
                  |
                  v
         spelstand: positie, muntjes, tijd, vijanden
                  |
                  v
     art.mjs + andere tekenmodules ---> Canvas 2D

app.mjs <----> localStorage / JSON-bestanden
app.mjs <----> network.mjs <----> room.php <----> tijdelijke kamerbestanden
```

`app.mjs` draait een animatielus met `requestAnimationFrame`. Daarin worden invoer, simulatie, geluid, tekenen en scherminformatie bijgewerkt. `createGame` maakt een spelstand; `stepGame` werkt die met invoer en verstreken tijd bij. Bij bijvoorbeeld een muntje of sprong voegt de engine een gebeurtenis toe aan `game.events`; de app gebruikt gebeurtenissen onder meer om geluid af te spelen. `drawWorld` tekent de stand. De engine kan ook zonder browser worden getest.

Dit zijn verantwoordelijkheden binnen één applicatie, geen strikt afgedwongen lagen. Sommige bestanden bevatten meerdere verantwoordelijkheden. Vooral `app.mjs`, `engine.mjs` en `art.mjs` zijn groot. Zoek eerst op een functienaam of een HTML-ID; lees daarna de aanroep en de omliggende code.

## Wegwijzer door de code

Alle onderstaande paden zijn relatief aan de projectroot.

| Gebied | Bestanden | Verantwoordelijkheid |
| --- | --- | --- |
| Hoofdpagina | `public_html/index.html`, `styles.css` | Werkbalk, startscherm, dialogen en vormgeving |
| Applicatie | `public_html/app.mjs` | Bouwer, invoer, HUD, geluid en koppeling van de modules |
| Engine | `public_html/engine.mjs` | Levelmodel, tegelcatalogus, beweging, botsingen en speltoestand |
| Mechanieken | `mechanisms.mjs`, `swing-platforms.mjs`, `firebars.mjs`, `sea-life.mjs`, `wonder-magic.mjs`, `wonder-foes.mjs` in `public_html/` | Specifieke mechanismen, lianen, donutplatforms, dieren en Wonderland-regels |
| Tekenen | `art.mjs`, `monster-art.mjs`, `sea-art.mjs`, `wonder-foe-art.mjs`, `enemy-design-art.mjs` in `public_html/` | Figuren, objecten en spelwereld tekenen |
| Beeldmateriaal | `public_html/look.mjs`, `terrain.mjs`, `terrain-rules.mjs` | Sprite-uitsneden, terreinvarianten en aansluitingen |
| Presentatie | `public_html/presentation.mjs`, `depth-backgrounds.mjs` | Visuele effecten, camera, tekenresolutie en drie vector-parallaxlagen |
| Karakters en vijanden | `public_html/character-maker.mjs`, `enemy-design.mjs`, `enemy-editor.mjs` | Onderdelen combineren, instellingen en vijandeditor |
| Campagnes | `public_html/levels.mjs`, `adventurers.mjs`, `wonderland.mjs` | Velden en campagneregels; de laatste twee ook voortgang |
| Kaarten | `public_html/adventure-map.mjs`, `wonderland-map.mjs` | Campagnekaarten, navigatie en winkels waar van toepassing |
| Eigen werelden | `public_html/worlds.mjs`, `world-editor.mjs` | Gegevens, validatie en editor van eigen kaarten |
| Kleine games | `public_html/games/`, `runtime/` | Vier afzonderlijke spelpakketten, sessies, uitgesteld laden en terugkeer naar het hoofdspel |
| Opslag | `public_html/storage.mjs`, opslagcode in `app.mjs` | Levelcollecties normaliseren en browsergegevens bewaren |
| Samenspel | `public_html/coop.mjs`, `network.mjs`, `room.php` | Gedeelde simulatie, HTTP-kamerverkeer en servervalidatie |
| Controller | `public_html/gamepad.mjs` | Controllerinvoer omzetten naar acties |
| Gereedschap | `public_html/server.mjs`, `build.mjs` | Lokale bestanden serveren en offlinebestand bouwen |
| Tests | `public_html/tests/` | Automatische tests en visuele proefpagina’s |

## Levels en opslag

Een level bevat onder meer `name`, `theme`, `width` en `tiles`. `tiles` is een array van rijen: `tiles[y][x]` bevat het nummer van één onderdeel. Een tegel is in de spelwereld 32 pixels (`TILE`). X loopt naar rechts; Y loopt naar beneden. Bijvoorbeeld: 4 is een muntje, 10 een startplek en 11 de finish. Zoek de volledige catalogus en `validateLevel` in [engine.mjs](../public_html/engine.mjs).

Gebruik voor experimenten een echt gedownload level. De validator bepaalt welke gegevens geldig zijn en kan gegevens normaliseren. De actuele spelstand is een ander object: daarin staan ook de speler, verstreken tijd, opgepakte muntjes en bewegende vijanden. Het verzamelen van een muntje tijdens een poging hoort je opgeslagen bouwlevel niet te veranderen.

`app.mjs` gebruikt `localStorage` met de sleutel `super-bouwclub-v1` voor onder meer het bouwveld, de collectie en voortgang. `storage.mjs` helpt bestaande collecties te lezen. Opslag hoort bij een browserprofiel en oorsprong (protocol, host en poort). `localhost:8080`, een ander adres en de offlineversie kunnen dus andere gegevens tonen. Gebruik JSON-export/import om levels over te zetten en als reservekopie.

Voor kamers stuurt `network.mjs` verzoeken naar `room.php`. De PHP-code bewaart tijdelijke sessies buiten de documentroot, gebruikt bestandslocks en toegangssleutels per speler en laat oude kamers verlopen. Het is geen permanente servercollectie. De Node-server voert geen PHP uit.

## Waar staan de resources?

| Locatie | Inhoud en gebruik |
| --- | --- |
| [public_html/assets/](../public_html/assets/) | Runtime-afbeeldingen voor de wereld en het logo; helden staan onder `characters/` |
| [public_html/assets/look/](../public_html/assets/look/) | Spritevellen, grondvarianten, achtergronden, wereldkaart en ontwerpprompts |
| [public_html/characters/](../public_html/characters/) | Boaz, Ravi en eigen helden; per karakter/variant de code, afbeeldingen en prompts |
| [public_html/wonderland/](../public_html/wonderland/) | Illustratie voor de Wonderland-kaart |
| [assets/](../assets/) | Bronmateriaal en ontwerpbestanden; deze map is niet de documentroot |
| [assets/wonderland/](../assets/wonderland/) | Specificatie, veldbeschrijvingen en bazenpakket |
| [public_html/tegels.html](../public_html/tegels.html) | Visueel overzicht van tegels; lokaal via `/tegels.html` |
| [public_html/tests/](../public_html/tests/) | Bewegende kijkproeven en speelbare testpagina’s naast de `.test.mjs`-bestanden |

Een spritevel bevat meerdere afbeeldingen in één plaatje. De code selecteert een uitsnede. Vervang daarom niet zomaar een compleet vel voor één nieuw object: controleer eerst `look.mjs`, `terrain.mjs` of `character-maker.mjs`. Veel andere figuren worden rechtstreeks met Canvas getekend. Geluiden worden met oscillatoren in `playSound` in `app.mjs` gemaakt; hiervoor is geen map met audiobestanden nodig.

## Broncode, webserver en offlinebuild

Werk in `index.html`, `styles.css` en de modules. [build.mjs](../public_html/build.mjs) leest een expliciete lijst modules en afbeeldingen, voegt CSS en scripts samen en sluit afbeeldingen in als data-URL. Het resultaat is `public_html/speel.html`, dat solo zonder server werkt. Samenspel heeft een werkende PHP-server nodig.

De bundelaar volgt de modulegraph vanaf `app.mjs`, inclusief letterlijk geschreven dynamische imports. Modules hebben een eigen factory en worden pas bij gebruik uitgevoerd. De server gebruikt dezelfde graph voor toegestane modulepaden; na nieuwe imports moet de server worden herstart. Afbeeldingen blijven expliciet geregistreerd in de assetlijsten. Zie [spelpakketten](spelpakketten.md) voor het ondersteunde modulesubset, cleanup en de grenzen van unloading.

De Node-server serveert een beperkte lijst paden. Een bestaand bestand kan daardoor toch een 404 geven. Een willekeurige proefpagina in `tests/` is niet per definitie via `npm start` bereikbaar. De PHP-server serveert de documentroot en kan die pagina’s wel openen. De acht opdrachten hebben voor hun basisversie geen nieuwe runtime-module nodig; de levelinspecteur draait als apart Node-script.

## Controles kiezen

Gebruik bestaande tests als voorbeeld: [small-games.test.mjs](../public_html/tests/small-games.test.mjs) is klein en laat het patroon `node:test` + `assert` zien. Een gerichte test start je met `node public_html/tests/<naam>.test.mjs`. De volledige suite staat expliciet in `package.json`; nieuwe testbestanden moet je daar toevoegen om ze in `npm test` mee te nemen. `npm test` gebruikt ook PHP voor `rooms.test.php`.

Controleer visuele veranderingen in de browser. Controleer spelregelwijzigingen ook met een gerichte automatische test. Bouw de offlineversie na codewijzigingen opnieuw en open die apart. Testen, bouwen en lokaal spelen zeggen niets over publicatie op een externe server.


## Canvas op schermgrootte

`#world-space` in de scrollcontainer heeft de afmetingen van de volledige wereld. `#world` is een sticky canvas ter grootte van het zichtbare venster. `app.mjs` berekent de wereldafmetingen los van de bitmap, vertaalt wereldcoördinaten met de camerastand en gebruikt de apparaatpixeldichtheid voor het tekenen. Pointercoördinaten worden met scrollpositie en tegelgrootte terugvertaald naar het level. Daardoor kan een lang level scherp blijven zonder een wereldbrede bitmap. De achtergrondlagen worden als vectorvormen getekend; er is geen grote decorbitmapcache meer. Zie [het renderherstel en de metingen](renderherstel.md).

De stromingcontrole in `sea-life.mjs` houdt een afgeleide geiserindex in een `WeakMap` bij. Deze wordt per simulatietijdstip, vijandenlijst of lijstlengte vernieuwd; actieve en bevroren toestanden worden bij iedere toepassing opnieuw bekeken. De index komt niet in levelbestanden of samenspelsnapshots.


## Lokale invoerreactie

Toetsenbord en aanraakbediening werken direct de invoer in `app.mjs` bij. Drukranden voor acties en links/rechts blijven in `pendingActions` beschikbaar tot de volgende vaste simulatiestap; er wordt geen extra tijd in de engine verwerkt vanuit eventhandlers. Voor twee korte tegengestelde richtingstikjes vóór één stap blijft de laatste drukrand over. `resetInput` wist ook de gebufferde drukranden.

`engine.mjs` laat gewone spelers op het land sneller optrekken en omkeren, met dezelfde topsnelheid. Speciale beweging zoals water, glijhellingen, rijdieren en een snelle liaanlancering blijft apart. De camera in `presentation.mjs` volgt met een kortere afregeltijd. [invoerreactie.md](invoerreactie.md) beschrijft de controles en meetgrenzen.
