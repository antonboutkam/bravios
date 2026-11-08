# Bravios — spelen, bouwen en leren programmeren

Bravios is een Nederlandstalige 2D-platformgame met een levelbouwer. Bouw een parcours, verzamel muntjes, ontwijk vijanden en haal de finish. Je kunt ook eigen werelden en personages maken, campagnes spelen en drie kleine games openen. Het project is geschikt als bestaande codebasis voor kleine opdrachten in het eerste jaar Software Development / Software Engineering.

**Begin hier:** [spelhandleiding](docs/spelhandleiding.md) · [architectuur en bestanden](docs/architectuur.md) · [spelpakketten en karakters](docs/spelpakketten.md) · [opdrachten en docentaanpak](docs/opdrachten/README.md).

## Lokaal starten

Gebruik een moderne browser, een code-editor en **Node.js 18 of nieuwer**. Voer de commando’s uit in deze projectmap, waar `package.json` staat. Er zijn geen npm-afhankelijkheden; `npm install` is niet nodig.

```sh
npm start
```

Open **http://localhost:8080**. Kies **Bouw je eigen veld**, plaats onderdelen en klik op **Speel je level**. Bewaar je wijzigingen in de editor en herlaad de browser om codewijzigingen te zien. Stop de server met Ctrl+C. Is poort 8080 bezet? Stop de andere server of gebruik in Bash `PORT=8090 npm start`.

Alleen spelen zonder ontwikkelserver? Open [public_html/speel.html](public_html/speel.html) direct in je browser. Dit is een gegenereerde kopie. **Wijzig de bronbestanden en bouw daarna opnieuw:**

```sh
npm run build
```

Voor samen spelen op twee apparaten is PHP 8.1 of nieuwer nodig:

```sh
npm run start:network
```

Open dan eveneens `http://localhost:8080`. Deze server vervangt de Node-server op dezelfde poort. Voor een tweede apparaat gebruik je het lokale IP-adres van de computer. De gewone Node-server ondersteunt solo spelen; PHP verzorgt de kamers. Meer uitleg staat bij [samen spelen](docs/spelhandleiding.md#samen-spelen-op-twee-apparaten).

## Diepte met drie achtergrondlagen

De omgevingen hebben nu drie decorlagen: **ver weg**, **middenafstand** en **dichtbij**. Tijdens het lopen bewegen ze op verschillende snelheden langs de camera. Bergen, bossen, kastelen en nabije details verschillen per omgeving; ook de vier Wonderland-gebieden hebben eigen kleuren. Alle decorlagen staan achter het speelveld.

Met **minder beweging** vervalt de extra parallax. De [kijkproef](public_html/tests/depth-backgrounds.html) laat alle omgevingen en een verschuifbare camera zien: na `npm start` op **http://localhost:8080/tests/depth-backgrounds.html**. Meer uitleg staat in de [spelhandleiding](docs/spelhandleiding.md#drie-achtergrondlagen).

## Nieuw: lianen en donutplatforms

Onder **Mechanieken** staan nu **Liaan** en **Donutplatform**. Plaats een liaan hoog boven een gat: raak het touw tijdens een sprong om vast te pakken, slinger met links/rechts en spring opnieuw om los te laten. Een donut geeft bij het landen een iets hogere sprong en valt drie seconden na de eerste landing weg. De teller blijft lopen als je eraf springt.

Bekijk de [bediening en bouwtips](docs/spelhandleiding.md#lianen-en-donutplatforms) of open na `npm start` de [speelproef](http://localhost:8080/tests/swing-platforms.html). De losse proef staat ook in [public_html/tests/swing-platforms.html](public_html/tests/swing-platforms.html).

## Kies een kleine opdracht

De tijden zijn schattingen voor de basisversie, na het lokaal starten. Alle opdrachten werken lokaal en leveren iets op dat je aan een klasgenoot kunt demonstreren. ★ vraagt basiskennis; ★★ combineert meerdere onderdelen.

| Opdracht | Wat zie of hoor je? | Je oefent | Niveau / tijd |
| --- | --- | --- | --- |
| [1. Jouw gamehuisstijl](docs/opdrachten/01-huisstijl.md) | Een herkenbaar eigen spelmenu | HTML, CSS, toegankelijkheid | ★ · 45–90 min |
| [2. Muntjesmissie](docs/opdrachten/02-muntjesmissie.md) | Een balk die volloopt bij het verzamelen | DOM, rekenen, voorwaarden | ★ · 60–120 min |
| [3. Een medaille bij de finish](docs/opdrachten/03-medailles.md) | Brons, zilver of goud voor jouw prestatie | Functies, if/else, grenswaarden | ★ · 60–120 min |
| [4. Maak je eigen soundpack](docs/opdrachten/04-soundpack.md) | Jouw melodieën bij springen en winnen | Arrays, lussen, Web Audio | ★ · 45–90 min |
| [5. Fruitvanger op jouw niveau](docs/opdrachten/05-fruitvanger.md) | Kies rustig of turbo voordat je speelt | Objecten, configuratie, spelregels | ★★ · 90–180 min |
| [6. Van munt naar ruimtejuweel](docs/opdrachten/06-ruimtejuweel.md) | Een zelfgetekende, bewegende beloning | Canvas, coördinaten, tekenen | ★★ · 60–120 min |
| [7. Verbreek je eigen record](docs/opdrachten/07-record.md) | Een persoonlijk record na herladen | localStorage, JSON, foutafhandeling | ★★ · 90–180 min |
| [8. De levelinspecteur](docs/opdrachten/08-levelinspecteur.md) | Een rapport over een echt levelbestand | Node.js, JSON, validatie, testen | ★★ · 90–180 min |

Begin met opdracht 1 of 4 als de klas net programmeert. Opdrachten 2 en 3 vormen een logische volgende stap. Laat studenten die functies, objecten en events beheersen kiezen uit 5–8. Elke opdracht bevat een basisversie, bestanden om te openen, controlepunten en een optionele uitbreiding.

Voor een eerste les: start het spel, bouw een klein testlevel met tien muntjes, download het JSON-bestand en maak daarna één wijziging in de code. Zo heeft iedere student een vaste speelproef. Zie [de docentaanpak en inleverafspraken](docs/opdrachten/README.md#voor-de-docent).

## Hoe zit het project in elkaar?

Het spel gebruikt **HTML, CSS en JavaScript-modules (`.mjs`)**, zonder gameframework. Canvas 2D tekent de spelwereld. `app.mjs` verbindt knoppen, invoer, opslag, spelregels en weergave. `engine.mjs` houdt de spelstand bij en berekent beweging, botsingen en winst. De tekenmodules zetten die gegevens om naar beeld. Geluid ontstaat in de browser met Web Audio.

Levels zijn gegevens: een raster met nummers voor de onderdelen, aangevuld met instellingen. De browser bewaart je werk lokaal; JSON-downloads maken uitwisselen mogelijk. Alleen samenspel gebruikt een PHP-endpoint en tijdelijke bestanden op de server. Er is geen database nodig.

| Je zoekt… | Begin bij… |
| --- | --- |
| Knoppen en vensters | [index.html](public_html/index.html), [styles.css](public_html/styles.css) |
| Bediening, HUD en geluid | [app.mjs](public_html/app.mjs) |
| Spelregels, levelvalidatie en tegel-ID’s | [engine.mjs](public_html/engine.mjs) |
| Tekenen en sprite-uitsneden | [art.mjs](public_html/art.mjs), [look.mjs](public_html/look.mjs), [terrain.mjs](public_html/terrain.mjs) |
| Kleine games | [games/](public_html/games/) · [sessies, karakters en tussenspellen](docs/spelpakketten.md) |
| Plaatjes die het spel gebruikt | [public_html/assets/](public_html/assets/), [Wonderland-kaart](public_html/wonderland/) |
| Bronmateriaal en ontwerpnotities | [assets/](assets/), [Wonderland-ontwerp](assets/wonderland/specs.md) |
| Voorbeelden van tests | [public_html/tests/](public_html/tests/) |
| Alle modules, gegevensstroom en opslag | [architectuur en resources](docs/architectuur.md) |

## Lava en draaiende vlammen

De vier avonturierskastelen hebben nu diepe lavabaden, stenen oversteekplatforms en draaiende vuurmolens. De vuurmolen staat ook onder **Mechanieken** in de bouwer. Bekijk de [uitleg en visuele proef](docs/kasteelvuur.md).

## Uitgewerkte monsters

Twaalf monsteruitvoeringen hebben nieuwe gezichten, contouren en animaties. Bekijk het [visuele overzicht en de werking](docs/monsters.md) of open na `npm start` het [Monsteratelier](http://localhost:8080/tests/monsters.html) met een speelproef.

## Directere besturing

Lopen, stoppen en omkeren reageren sneller. Korte pijltjestoetsdrukken blijven tot de volgende simulatiestap bewaard en de camera volgt directer. Zie [invoerreactie en controles](docs/invoerreactie.md). De offlineversie is opnieuw gebouwd.

## Herstel van snelheid en scherpte

De canvas tekent nu alleen het zichtbare venster op schermresolutie. De drie achtergrondlagen worden rechtstreeks als vectorvormen getekend; de zware rasterpanelen zijn verwijderd. Ook de herhaalde zoektocht naar geisers is vervangen door een index per simulatiestap. De [herstelmetingen en controles](docs/renderherstel.md) beschrijven het lokale Chrome-resultaat en de grenzen daarvan.

Hoge velden slaan nu ook onzichtbare tegelrijen over. Druk op **F8** om tijdens bouwen of spelen de FPS en het langste beeldinterval te zien. De recente melding van circa 10 FPS is nog niet in het betrokken veld nagemeten; zie [de vervolgcontrole](docs/renderherstel.md#vervolg-op-de-melding-van-circa-10-fps).

Bij aanhoudend lage FPS schakelt de speelcanvas nu automatisch van extra pixeldichtheid terug naar één tekenpixel per schermpixel. De benen van Boaz, Ravi en eigen karakters bewegen tijdens lopen afzonderlijk. Zie [vloeiender spelen en loopanimatie](docs/vloeiender-spelen.md) voor de werking en lokale controles.

## Onderzoek naar vloeiender spelen en GPU-gebruik

De achtergrond wordt nu standaard op **50% resolutie** getekend, onafhankelijk van speler, platforms en voorgrond. Via **F8 → Achtergrondresolutie** kies je 100%, 50%, 35% of 25%. De aparte keuzelijst **Tekenresolutie** geldt voor het hele spelcanvas en biedt 100%, 95%, 90%, 85%, 75% en 50%. De winst van deze afzonderlijke achtergrondverlaging moet nog op de getroffen computer worden gemeten.

**Nieuw systeembewijs:** op een leeg werkblad kost 4K/60 Hz met YCbCr 4:2:0 circa 77–90% GPU; dezelfde resolutie op 30 Hz schakelt naar RGB en meet 0–17%. Het scherm staat tijdelijk op 4K/30 Hz, maar de gebruiker meldt daar nog 1,4 FPS in de gewone game. De schermstand verklaart dus niet de volledige vertraging. Zie [de gecontroleerde vergelijking en herstelopdracht](docs/lokale-gpu-diagnose.md#systeembelasting-geïsoleerd-4k60-hz-tegenover-4k30-hz).

De fysieke 4K-proef haalt 13,43 FPS zonder dieptelagen en 1,98 FPS met lagen. De renderer tekent herhalende decorstukken nu eenmaal per laag, met behoud van resolutie en parallax. De v2-proef bevestigt kortere tekenaanroepen maar geen FPS-winst (2 FPS met lagen). V3 bevestigt circa 8 FPS met vooraf getekende lagen en 19,78 FPS met een halve bitmap. V4 vergelijkt ondoorzichtige weergave en een voorkeur voor softwarematig tekenen. Zie [metingen en wijziging](docs/lokale-gpu-diagnose.md#dubbele-achtergrondtekening-verwijderd).

De [automatische grafische vergelijking](http://mariomaker.nuidev.nl/tests/graphics-diagnostic.html) meet in ongeveer 45 seconden een lege pagina en het spel met verschillende achtergrondtekenmethoden. Houd het venster zichtbaar en kopieer na afloop het rapport.

Het [lokale onderzoek na de reboot](docs/lokale-gpu-diagnose.md) toont hoge GPU- en Xorg-belasting op het 4K-scherm, ook met Chrome op een verborgen werkblad. Tijdelijke 1080p-proeven verlagen de belasting; een vergelijking van de game-FPS op hetzelfde veld staat nog open.

Voor een vergelijking van de extra achtergrondlagen op dezelfde resolutie: druk **F8** en gebruik de knop **Dieptelagen: aan (F9)**, of druk direct **F9**. Ook `?renderprobe=1` opent de meetstand. Die toont FPS, bitmapafmetingen en doorlooptijden van spel/UI en tekenaanroepen en houdt de tekenresolutie vast. Zie [de meetinstructie](docs/lokale-gpu-diagnose.md#achtergrondlagen-afzonderlijk-vergelijken).

Het [GPU-onderzoek](docs/gpu-onderzoek.md) bevat lokale metingen, een concreet CPU-knelpunt in de waterstromingcontrole en een afweging tussen Canvas 2D, WebGL2, WebGPU en workers. Advies: eerst de onnodige simulatiecontroles en het tekenoppervlak aanpakken; daarna een gerichte GPU-renderproef op echte hardware. De spelruntime is voor dit onderzoek niet gewijzigd.

## Je wijziging controleren

Speel je eigen testlevel en controleer het gedrag uit je opdracht. Open de ontwikkelaarstools van je browser en kijk of de console nieuwe fouten toont. Voor automatische controles:

```sh
node public_html/tests/small-games.test.mjs
node public_html/tests/small-games-ui.test.mjs
node public_html/tests/game-runtime.test.mjs
```

Dit is een gerichte controle voor de kleine games. De volledige bestaande suite draait met `npm test` en vereist ook PHP vanwege de kamertests. Na een codewijziging vernieuw je met `npm run build` de offlineversie en controleer je die apart. Een geslaagde test bewijst alleen het gedrag dat die test controleert.

De bestaande uitgebreide uitleg over onderdelen, campagnes, controllers, bewaren en samenspel staat volledig in de [spelhandleiding](docs/spelhandleiding.md). Voor bestaande Apache-installatie-instructies is er de [configuratiehandleiding](config/apache2/README.md).

## Stekelsprong

Onder **Kleine games** staat nu **Stekelsprong**, solo of samen op één scherm. Spring op het ritme over stekelballen en houd het ongeveer drie minuten langer vol dan de monsters. [Bediening en spelregels](docs/stekelsprong.md).

Wonderlanddecor staat nu achter de platforms: [oorzaak en visuele controle](docs/renderherstel.md#wonderlanddecor-achter-de-platforms).
# bravios
