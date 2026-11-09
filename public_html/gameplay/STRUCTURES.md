# Structuren: platforms, obstakels en interactieve objecten

[Spelonderdelen](README.md) · [Platforms](platforms/README.md) · [Obstakels](obstacles/README.md) · [Interactieve objecten](interactables/README.md)

De 73 bestaande structuurprofielen staan verdeeld over `platforms/`, `obstacles/` en `interactables/`. Elke onderdeelmap bevat `structure.json`, `images/` en een eigen handleiding. Vijanden en vaste spelers hebben hun eigen catalogi in `enemies/` en `characters/`.

```text
gameplay/
  structures.json
  platforms/rock/
    structure.json
    images/grass.png
  obstacles/spikes/
    structure.json
    images/grass.png
  interactables/pipe-up-in/
    structure.json
    images/grass.png
```

`structures.json` groepeert de verwijzingen op hun bestaande logische groep (`terrain`, `blocks`, `pipes`, `mechanisms`, `caves`, `markers` of `wonderland`). Een verwijzing is nu het pad `categorie/mapnaam`, bijvoorbeeld `platforms/rock` of `interactables/pipe-up-in`. De ID in het profiel blijft alleen de mapnaam, bijvoorbeeld `rock`. De interne profiel-ID `terrain/rock` en alle tegelnummers blijven daardoor bruikbaar in bestaande levels en samenspel.

De browser leest deze registratie en profielen bij elke paginaverversing. Dit werkt ook met een statische webserver. Voor de offlineversie bouw je opnieuw.

## Eigenschappen

| Veld | Betekenis |
| --- | --- |
| `id` | Gelijk aan de mapnaam: kleine letters, cijfers en streepjes. |
| `name`, `description` | Naam en uitleg in de levelbouwer. |
| `kind` | Bestaande gedragscontroller, bijvoorbeeld `rock`, `question`, `pipe`, `moving-wall` of `donut`. |
| `tileIds` | Unieke tegelnummers in opgeslagen levels. Bestaande nummers blijven gelijk. Wonderland-objecten gebruiken een lege lijst. |
| `editor.visible` | Of het object als bouwobject beschikbaar is. Interne toestanden, zoals een leeg vraagblok, blijven verborgen. |
| `editor.group` | `terrain`, `questions`, `pipes`, `caves`, `mechanisms` of `none` voor een losse knop. |
| `collision.solid` | Houdt spelers tegen. Bij bewegende structuren geldt dit voor het bewegende lichaam. |
| `collision.oneWay` | Alleen van bovenaf landen; springen vanaf de onderkant blijft mogelijk. |
| `collision.breakFromBelow` | Een botsing met het hoofd breekt het blok. |
| `collision.damage` | Contact doet schade. |
| `collision.lethal` | Schade gaat ook door gewone schild/sterbescherming heen; rainbow blijft beschermen. |
| `collision.topOffset` | Hoe ver het bovenoppervlak onder de tegelrand ligt, zoals bij de ingedrukte P-schakelaar. |
| `pSwitchConvertible` | Of de P-schakelaar deze tegel tijdelijk in een muntje verandert. |
| `settings` | Instellingen van de gekozen controller. |
| `visuals` | PNG's per thema, toestand en onderdeel. |
| `terrain` | De twintig aansluitende textuurvarianten voor grond of baksteen. |

Bijvoorbeeld: open `terrain/rock/structure.json` en zet `collision.breakFromBelow` op `true` om een rots van onderen kapot te kunnen springen. Met `collision.solid: false` kan de speler erdoorheen. Met `collision.damage: true` wordt contact gevaarlijk. Stekels behouden hun bestaande uitzondering: een gewone ster beschermt tegen stekels. Bij lianen, portalen en schakelaars blijven de speciale interacties van hun controller leidend.

### Instellingen per controller

Alle snelheden zijn pixels per seconde; tijden zijn seconden, hoeken zijn radialen.

| Structuur | Instellingen onder `settings` |
| --- | --- |
| Springveer | `bounceSpeed`: sprongsnelheid omhoog. |
| Instortende rots | `delaySeconds`: wachttijd na het betreden. |
| Helling | `direction` (-1 of 1), `slideSpeed`, `waterSlideSpeed`, `steerSpeed`. De botsingsvorm blijft driehoekig. |
| Vraagblok | `reward`: bestaand beloningstegelnummer; `spentTile`: tegel na gebruik. |
| Bonenstaakdoosje | `spentTile` en `vineTile`. |
| Bonenstaak | `climbSpeed`. |
| P-schakelaar | `durationSeconds` en `pressedTile`. |
| Beweegblok | `width`, `height`, `distance`, `direction` (-1 of 1), `travelSeconds` per enkele reis. |
| Lopende band | `runSeconds`, `restSeconds`, `speed`, `spacing`, `radius`, `platformWidth`, `platformHeight`. De bandverbindingen staan per level in `belts`. |
| Slingerbal | `length`, `frequency`, `amplitude`, `diameter`, `fire`, `face`. De bal en botsingsvorm gebruiken dezelfde positie en diameter. |
| Liaan | `length`, `gravity`, `damping`, `maxAngle`, `pump`. |
| Donutplatform | `delaySeconds`, `bounceSpeed`, `gravity`, `maxFallSpeed`. |
| Vuurmolen | `periodSeconds`, `flames` (1–16), `spacing`, `radius`. |
| Grot | `locked`, `hidden`, `revealSeconds`, `openSeconds`. De zichtbare afbeelding wordt apart gekozen in `visuals`. |
| Wonderland-slinger | `horizontalSpeed`, `verticalSpeed`, `horizontalReach`, `verticalReach`. |
| Wonderland-verdwijnplatform | `frequency`, `threshold`. |
| Wonderland-schaakstuk | `pushSpeed`. |
| Wonderland klein/groot | `scale`, `durationSeconds`. |
| Wonderland richting/omkering/portaal | `durationSeconds` en/of `cooldownSeconds`, waar van toepassing. |

Buizen hebben bovendien `pipe.opening` (`up`, `down`, `left`, `right`) en `pipe.mode` (`decoration`, `in`, `out`, `both`). `imageOpening` geeft aan welke richting al in de PNG is getekend. Het spel draait de afbeelding mee als de ingestelde opening verandert. Verbindingslabels worden live getekend.

`kind` kiest een bestaande controller. JSON kan de ondersteunde eigenschappen instellen; een volledig nieuw type puzzel of mechanisme vraagt ook nieuwe spelcode. De kleur en vorm van een PNG veranderen niet automatisch als je de werking wijzigt: vervang ook de afbeelding wanneer dat nodig is. Grotten reizen nog steeds naar de bestaande grotindeling en Wonderland-objecten blijven onderdeel van de campagne.

## Afbeeldingen

Een beeldtoestand bevat bijvoorbeeld:

```json
{
  "image": "images/grass.png",
  "frameWidth": 120,
  "frameHeight": 144,
  "frames": 1,
  "fps": 0,
  "bounds": [-4, -12, 40, 48]
}
```

De PNG bevat de frames horizontaal naast elkaar. De totale breedte is `frameWidth × frames`; de hoogte is `frameHeight`. Voor een stilstaand beeld gebruik je `frames: 1` en `fps: 0`. `bounds` is `[links, boven, breedte, hoogte]` in spelpixels ten opzichte van een tegel van 32 × 32 pixels. Transparante marges mogen buiten het botsingsvak vallen.

`visuals.default` is verplicht. Het spel kiest waar beschikbaar het thema, bijvoorbeeld `castle`, `winter` of `underwater-night`, met `-inside` voor een binnenliggende tegel en `-editor` voor het bouwvoorbeeld. Ontbrekende toestanden vallen terug op `default`. Verschillende toestanden mogen naar dezelfde PNG verwijzen.

Beweeglijke structuren gebruiken losse onderdelen: `ball`, `rope`, `anchor`, `tip`, `flame`, `platform`, `axle-running`, `axle-rest` of `armed`. Die PNG's bewegen op de actuele simulatiepositie. Donutaftellers, vraagblokbeloningen, kettingschakels en labels worden live getekend. Gesloten grotten gebruiken `door-0` tot `door-8` voor het opengaan.

Voor grond en bakstenen verwijst `terrain.image` naar het PNG-vel in dezelfde structuurmap. Dit bevat twintig varianten in een raster van vijf kolommen en vier rijen. Het bestaande systeem dat aangrenzende randen op elkaar laat aansluiten blijft actief. Bewerk dit vel om de terreintextuur te veranderen.

Afbeeldingen worden geladen wanneer ze nodig zijn en hergebruikt tussen exemplaren. De directe structuurafbeeldingscache bevat maximaal 64 PNG's; terreintexturen worden bij het starten voorbereid. Tijdens het laden blijven de oorspronkelijke tekenfuncties beschikbaar.

## Een structuur toevoegen

1. Kopieer een map van een vergelijkbare structuur en geef die een nieuwe naam.
2. Pas `id`, `name`, `description` en de gewenste eigenschappen aan.
3. Kies een vrij tegelnummer vanaf 102 tot en met 255. Het nummer mag ook niet door een vijand worden gebruikt.
4. Zet `editor.visible` op `true` en kies een groep.
5. Vermeld het volledige pad, bijvoorbeeld `platforms/mijn-rots`, onder de juiste logische groep in `structures.json`.
6. Voer `npm run structures:prepare` uit en ververs het spel.

Een nieuw profiel met bestaand gedrag verschijnt automatisch in de levelbouwer. Gebruik de extra controllers `belt`, `chainhead-anchor` en `wonder-*` voor hun bestaande speciale plaatsings-/campagneroutes; die zijn geen algemene losse tegelvarianten.

## Controleren en offline bouwen

- `npm run structures:prepare` controleert JSON, unieke tegelnummers, paden en PNG-afmetingen en genereert `../engine/structures/catalog.mjs` voor Node en offlinegebruik. Bewerk dat gegenereerde bestand niet handmatig.
- `npm start`, `npm run start:network`, `npm test` en `npm run build` bereiden karakters, vijanden en structuren automatisch voor.
- `npm run build` neemt alle gebruikte PNG's en de catalogus op in `speel.html`. Bouw dit bestand opnieuw na wijzigingen.
- `npm run structures:export` exporteert het oorspronkelijke tekenwerk opnieuw. Dit onderhoudshulpmiddel vereist Playwright en Chrome (`CHROME_BIN` voor een ander pad) en **overschrijft de afbeeldingen en beeldbeschrijvingen van de oorspronkelijke structuren**. Voer het niet uit na handmatige beeldbewerking. Gewoon spelen, testen en bouwen vereist geen Playwright.

Bestaande levelbestanden blijven bruikbaar. Bewegende structuren bewaren hun tegelnummer/catalogus-ID ook in samenspel-snapshots.


## Studenten: handleidingen per categorie

Begin met een categorie die past bij jouw opdracht:

- [Terrein](platforms/guides/terrain.md): een rots, helling of oppervlak toevoegen.
- [Blokken](interactables/guides/blocks.md): een vraagblok of interne bloktoestand begrijpen.
- [Buizen](interactables/guides/pipes.md): richting, koppeling en een nieuwe buis instellen.
- [Mechanismen](interactables/guides/mechanisms.md): beweging, veerkracht en timers aanpassen.
- [Grotten](interactables/guides/caves.md): een toegang, sleutelrelatie en de bestaande grot begrijpen.
- [Markeringen](interactables/guides/markers.md): start en finish herkenbaar maken.
- [Wonderland](interactables/guides/wonderland.md): bestaande magische objecten instellen en hun campagnemaken bekijken.

Iedere concrete map bevat een eigen README met de actuele controller, instellingen, afbeeldingen en een oefening. Ook afbeeldingsmappen leggen uit welke PNG-paden en frameafmetingen je moet behouden.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.

Bij het toevoegen met een vrij tegelnummer voer je zowel `npm run enemies:prepare` als `npm run structures:prepare` uit. Probeer eerst een eenvoudige rotsvariant voordat je een complex mechanisme uitbreidt.
