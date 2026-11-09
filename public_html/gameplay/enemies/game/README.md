# Een gewone vijand toevoegen

[Alle spelonderdelen](../../../README.md) · [Eigenschappen en afbeeldingsformaat](../README.md) · [Een baas toevoegen](../bosses/README.md)

Deze map bevat gewone monsters, hun kleurvarianten en bijzondere wezens zoals onderwaterdieren. Elk profiel heeft een eigen map met `enemy.json` en `images/`. Begin met een eenvoudige `walker` of `robot`; `wonder`, kettinghoofden en mieren hebben een speciale aanmaakroute.

## Voorbereiden

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

Gebruik voor een nieuw bouwobject een **vrij geheel tegelnummer van 102 tot en met 255**. Controleer de `tileIds` in zowel `enemies` als `structures`: die delen één nummerreeks. Het voorbeeldnummer 110 in een uitleg is geen gereserveerd nummer. Verander de nummers van bestaande objecten niet; opgeslagen levels verwijzen naar die nummers.

## Stappen: maak mijn-monster

1. Kopieer de volledige map `walker/` naar `mijn-monster/`.
2. Open `mijn-monster/enemy.json`. Zet `id` op `mijn-monster`, geef `name` en `description` een eigen Nederlandse tekst en behoud eerst `kind: "walker"`.
3. Vervang de gekopieerde `tileIds: [6]` door een eigen vrij nummer, bijvoorbeeld `[110]` **als 110 in jouw project nog vrij is**. Anders zou je de bestaande wandelaar overschrijven of een validatiefout krijgen.
4. Zet voor een eerste proef bijvoorbeeld `movement.speed` op `30` en `combat.health` op `2`. Laat alle andere verplichte velden en animaties staan.
5. Vervang de PNG’s onder `images/`. Pas de `animations`-metadata aan wanneer de afmetingen of het aantal frames veranderen. Het uiterlijk en het botsingsvak `size` zijn afzonderlijke instellingen.
6. Voeg alleen de mapnaam `"mijn-monster"` toe aan de bestaande `game`-lijst in `../enemies.json`; laat `bosses` en de bestaande namen intact.
7. Voer `npm run enemies:prepare` en `npm run structures:prepare` uit. Start of ververs de website. Je vijand verschijnt in het vijandenpalet.
8. Bouw een klein level, plaats jouw monster en controleer de snelheid, twee treffers, links/rechts tekenen en eventuele spring- of schietreacties.
9. Bouw met `npm run build` en probeer het level ook in de offlineversie.

## Wat kun je met JSON veranderen?

Je kunt ondersteunde beweging, snelheid, levenspunten, contactschade, reactie op erop springen, ijs/bellen en projectielinstellingen configureren. De controller onder `kind` moet dat gedrag uitvoeren. Een naam zoals `teleportSpeed` erbij verzinnen levert geen teleportatie op. Gebruik een bestaande reactie die bij het lichaam past: `shell` bij schildpadden, `fold` bij helmtorren en `collapse` bij skeletschildpadden.

De gewone editor-tegel maakt de vijand aan. Dat is anders bij de kleine Wonderland-wezens: `kind: "wonder"` wordt vanuit `wonder-foes.mjs` aangemaakt, gebruikt `wonderType` en heeft geen gewone tegelknop. Per groep mag ieder `wonderType` maar één keer voorkomen; de huidige code kent typen 0 tot en met 7. Maak daarvan geen extra kopie in de lijst zonder de controller en campagne uit te breiden.

`chainhead` en `ant` zijn gevaren die door andere spelobjecten worden gemaakt. Hun bestanden kunnen instellingen leveren, maar alleen een nieuw tegelnummer toevoegen geeft ze nog geen volledige levenspunten-, ijs- en bellenlogica. Voor die uitbreidingen lees je de eigen README en de controllercode.

## Afbeeldingen en foutzoeken

`animations.idle` is verplicht. Een bestand van 8 frames van 148 pixels breed moet als geheel 1184 pixels breed zijn. De hoogte is `frameHeight`. PNG’s blijven binnen `images/`; een pad zoals `../ander-monster/idle.png` wordt geweigerd. Meerdere toestanden mogen hetzelfde bestand gebruiken.

Een niet-geregistreerde map wordt niet geladen en ook niet gecontroleerd door `enemies:prepare`. Als de controle slaagt maar de vijand ontbreekt, controleer dan eerst de lijst en `tileIds`. Een lege lijst betekent: geen editor-tegel. Pas het gegenereerde `../../../engine/enemies/catalog.mjs` niet zelf aan.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.

## Bestaande mappen als voorbeeld

| Map | Gebruik |
| --- | --- |
| [walker](walker/README.md) | Vijand |
| [robot](robot/README.md) | Robot |
| [frog](frog/README.md) | Kikker |
| [red-frog](red-frog/README.md) | Rode kikker |
| [angry-robot](angry-robot/README.md) | Boze robot |
| [turtle](turtle/README.md) | Schildpad |
| [dragon](dragon/README.md) | Vliegende draak |
| [plant](plant/README.md) | Tweekoppige plant |
| [skeleton](skeleton/README.md) | Skeletschildpad |
| [spiky](spiky/README.md) | Dikke stekelschildpad |
| [hammer](hammer/README.md) | Hamerschildpad |
| [bomb](bomb/README.md) | Lopende bom |
| [crusher](crusher/README.md) | Boos stekelrotsblok |
| [plane](plane/README.md) | Vliegtuigje met piloot |
| [cloud](cloud/README.md) | Stekeleiwolkje |
| [centipede](centipede/README.md) | Duizendpoot |
| [whale](whale/README.md) | Walvis |
| [jellyfish](jellyfish/README.md) | Kwalletje |
| [bonefish](bonefish/README.md) | Skeletvis |
| [squid](squid/README.md) | Inktvis |
| [seaweed](seaweed/README.md) | Giftige waterplant |
| [geyser](geyser/README.md) | Onderwatergeiser |
| [flatfish](flatfish/README.md) | Platvis |
| [moray](moray/README.md) | Murene in kruik |
| [seastar](seastar/README.md) | Boze zeester |
| [crab](crab/README.md) | Krab |
| [beetle](beetle/README.md) | Helmtor |
| [spikedbeetle](spikedbeetle/README.md) | Helmtor met punt |
| [blubberus](blubberus/README.md) | Blubberus the Slime King |
| [wafzilla](wafzilla/README.md) | Wafzilla the Terrible |
| [sockstein](sockstein/README.md) | Sockstein |
| [tick-tock](tick-tock/README.md) | Tick-Tock the Time Eater |
| [dj-thunderfluff](dj-thunderfluff/README.md) | DJ Thunderfluff |
| [crumblecastle](crumblecastle/README.md) | Crumblecastle the Walking Fortress |
| [princess-mirrorphantom](princess-mirrorphantom/README.md) | Princess Mirrorphantom |
| [emperor-wobbleflap](emperor-wobbleflap/README.md) | Emperor Wobbleflap the Everything-Eater |
| [chainhead](chainhead/README.md) | Kettinghoofd |
| [ant](ant/README.md) | Rode mier |

Lees de README in een concrete map vóórdat je haar kopieert. Daar staat ook of die variant uitsluitend door een campagne of een ander object wordt aangemaakt.
