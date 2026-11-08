# Spelpakketten, karakters en tussenspellen

[README](../README.md) · [Architectuur](architectuur.md) · [Stekelsprong](stekelsprong.md)

De bestaande minigames gebruiken eigen spelpakketten. De menuschil laadt alleen het gekozen pakket, maakt één sessie aan en ruimt deze bij verlaten of vervangen op. De platformgame heeft een adapter om een tussenspel te starten en daarna dezelfde spelstand te hervatten. Er zijn nog geen buizen aan een minigame gekoppeld. Botsbootjes, een danswedstrijd en hun nieuwe karakteraanzichten zijn volgende uitbreidingen.

## Mappen

```text
public_html/
  runtime/
    game-session.mjs       laden, vervangen, annuleren, opruimen
    resource-scope.mjs     levensduur van listeners, canvassen en gedeelde bitmaps
    game-flow.mjs          ouder onderbreken en na een kindspel hervatten
    projection.mjs         bovenaanzicht, schuin bovenaanzicht en tekenvolgorde
  games/
    catalog.mjs            lichte beschrijvingen en uitgestelde imports
    shell.mjs              fullscreen, menu, invoer en de actieve tekenlus
    preview.mjs            statische kaart zonder een spelsessie te starten
    shared/                bestaande canvasachtergrond en sessieadapter
    aim/                   game.mjs, model.mjs, render.mjs
    balloons/              game.mjs, model.mjs, render.mjs
    catch/                 game.mjs, model.mjs, render.mjs
    rhythm/                game.mjs, model.mjs, render.mjs
    platformer/
      encounters.mjs       koppeling met de bestaande platformgame
  characters/
    roster.mjs             speleridentiteit en het gekozen aanzicht
    boaz/
      character.mjs        naam, portret en beschikbare aanzichten
      portrait.png
      platformer/          view.mjs en sheet.png
    ravi/                  dezelfde indeling
    custom/
      maker.mjs            onderdelen, samenstellen, animatie en karaktereditor
      parts/               hoofden, kleding, schoenen, accessoires en prompts
    shared/
      hero.mjs             bestaande karakterrenderer, ook gebruikt door art.mjs
      platformer-layout.mjs gedeelde uitsneden van de bestaande spritevellen
      view-assets.mjs      afbeeldingen voor nieuwe aanzichten met gedeelde leases
```

`small-games.mjs`, `rhythm-game.mjs` en `character-maker.mjs` blijven als compatibiliteitsingangen bestaan. Nieuwe runtimecode importeert de betreffende map rechtstreeks. De applicatie importeert de minigamemodellen niet meer vooraf. De bestaande platformengine, bouwer en wereldrenderer staan voorlopig op hun bestaande paden; hun adapter staat onder `games/platformer/`.

## Contract van een spel

`catalog.mjs` bevat per spel `id`, naam, hint, ondersteunde aantallen spelers en het camera-aanzicht. `loadGamePack(id)` heeft een expliciete dynamische import. Voeg een nieuwe game op beide plaatsen toe; vrije bestandspaden uit leveldata worden nooit geïmporteerd.

Elk pakket exporteert `createSession(context)`, eventueel asynchroon. De context bevat:

- `scope`: eigen `ResourceScope` met een abortsignaal en cleanupregistratie;
- `participants`: speler-ID, karakter-ID en eventueel de eigen appearance;
- `playerCount`, `view`, `options` en optioneel `random`;
- `services`: gedeelde tekenfuncties. Stekelsprong gebruikt `hero` en `drawTile` zonder de platformengine zelf te importeren.

Een sessie in de huidige menuschil biedt:

| Onderdeel | Betekenis |
| --- | --- |
| `state` | Spelstand met `kind`, `state` (`playing`, `won`, `over`) en bij samenspel `playerCount` |
| `viewport` | Logische `width`, `height` en `view`; de schil past canvas en pointercoördinaten hierop aan |
| `capabilities` | Optioneel `jumpButtons`, `pause`, `upAction` voor de bestaande bediening |
| `update(input, dt)` | Richtingen zijn vasthoudwaarden; dit is de eigen simulatiestap |
| `action(player)` | Een drukrand voor de actie van één speler |
| `direction(direction)` | Eenmalige richtingstap, geschikt voor bijvoorbeeld danspassen |
| `pointer(phase, point, dragging)` | Aanraking/muis in logische spelcoördinaten |
| `pause()`, `togglePause()` | Pauze en hervatten, indien ondersteund |
| `render(ctx, width, height)` | Eigen camera en beeld, onafhankelijk van de platformwereld |
| `ui()` | `{ status, hint, result }` voor de schermtekst |
| `result()` | `null` tijdens spelen, daarna `{ game, outcome, score }` |
| `dispose()` | Eigen referenties en resources loslaten; moet herhaald veilig kunnen worden aangeroepen |

De bestaande games gebruiken `shared/session.mjs`. Een nieuw spel met een ander speelveld of andere werking mag een eigen sessie implementeren. De menuschil heeft geen spelregels voor afzonderlijke game-ID's. Voor de bestaande coöpvariant gebruikt zij de informatie `players: [1,2]` uit de catalogus.

Een botsbootjesspel kan zijn eigen botsingen en beweging in een tweedimensionaal vlak hebben. Een danswedstrijd kan een demonstratie- en antwoordfase bijhouden en `direction()` alleen in de antwoordfase verwerken. Geen van beide hoeft `engine.mjs` of zijn zwaartekracht/tegelbotsingen te gebruiken.

## Een buis als toegangspunt

`app.mjs` heeft `startMiniGameEncounter(gameId, origin, options)`. De latere buis- of deurafhandeling kan daar bijvoorbeeld het volgende aanroepen:

```js
const result = await startMiniGameEncounter(
  'rhythm',
  { type: 'pipe', x: pipe.x, y: pipe.y },
  { difficulty: 1 }
);
if (result.outcome === 'won') {
  // Hier later de expliciet ontworpen beloning toepassen.
}
```

Dit is een integratiepunt in de app, nog geen opgeslagen buisinstelling. `options` en `origin` worden doorgegeven, maar de bestaande spellen interpreteren bijvoorbeeld `difficulty` nog niet. Het huidige platformpad levert één speler; standalone Stekelsprong ondersteunt ook twee lokale spelers.

De adapter bewaart de bestaande spelstand bij referentie en zet die op pauze. Positie, muntjes, krachten en campagnegegevens worden niet naar een nieuw level gekopieerd. De minigame krijgt alleen een kopie van de aanvraag en karaktergegevens. Na winst, verlies, annuleren of een laadfout hervat de oorspronkelijke pauze-/speelstand. Is de ouder intussen vervangen, dan wordt deze niet teruggezet. Gelijktijdige overgangen worden geweigerd. De minigame past zelf geen platformbeloningen toe.

Bij een tussenspel betekent A na de uitslag terugkeren; de knop **Terug naar avontuur** en B kunnen ook eerder afbreken. Vanuit het losse minigamemenu blijft A na afloop opnieuw starten. Online kamers worden voor tussenspellen expliciet geweigerd: gesynchroniseerde minigames vragen later een eigen netwerkcontract.

Voor echte buisbestemmingen moeten later de levelvalidatie, opslag, bouwer en PHP-/coöpsnapshots samen worden uitgebreid. De bestaande buisverbindingen zijn in deze voorbereiding niet gewijzigd.

## Resources vrijgeven

`GameSessionHost` heeft hoogstens één actieve sessie. Wisselen of stoppen maakt een nog lopende aanvraag ongeldig. Een vertraagd resultaat krijgt geen kans een nieuw spel te vervangen en wordt alsnog opgeruimd. Een mislukte laadactie kan opnieuw worden geprobeerd.

Gebruik `scope.listen(...)` voor tijdelijke listeners, `scope.canvas(...)` voor eigen canvassen en `scope.defer(...)` voor timers, animatieframes, audio of andere resources. `dispose()` abort de scope en voert alle cleanups uit, ook als één cleanup faalt. Alle losse state-objecten in de bestaande minigames worden losgelaten. De schil stopt haar animatieframe en verkleint haar canvas bij verlaten tot 1 × 1.

`ResourcePool.acquire(key, load, release, scope)` deelt één geladen resource tussen gebruikers. De laatste gebruiker geeft hem vrij. Zelfs wanneer alle gebruikers vertrekken voordat de load klaar is, wordt het late resultaat vrijgegeven. `characters/shared/view-assets.mjs` gebruikt dit voor nieuwe view-bitmaps en roept uiteindelijk `ImageBitmap.close()` aan. De pool vereist dezelfde loader/releaser voor dezelfde sleutel.

Bij een platformtussenspel worden bovendien de platformcanvas, tijdelijke sprites en samengestelde karaktercanvassen vrijgegeven. Ze worden na terugkomst opnieuw opgebouwd. De huidige gedeelde look-/terreinsprites en karakteronderdelen blijven geladen: die gebruikt de bouwer of het andere spel nog. Het platformlevel zelf blijft behouden om exact terug te kunnen keren.

Dit is geen garantie dat de browser al zijn geheugen meteen teruggeeft. Native ES-modules blijven normaal in de modulecache. De offlineversie bewaart ook modulefactories en ingesloten afbeeldingstekst. De aanpak bespaart actieve simulatie, canvassen, sessiestanden en vrijgegeven bitmaps; er is nog geen gemeten geheugenbenchmark. Voor een toekomstige zeer zware game die ook zijn JavaScript-runtime volledig moet verliezen, past een afzonderlijke Worker of iframe met expliciete berichten beter.

## Nieuwe karakteraanzichten

Een speler-ID is onafhankelijk van het spel en de camera. Boaz en Ravi hebben nu echte `side`- en `front`-varianten uit de bestaande spritevellen. Eigen helden blijven samengesteld uit dezelfde onderdelen. Stekelsprong neemt nu het gekozen karakter en de appearance mee.

Voeg bijvoorbeeld `characters/boaz/top-down/view.mjs` en het bijbehorende spritevel toe, en registreer de variant in `boaz/character.mjs`. Doe dat ook voor Ravi en werk het eigen-karakterrenderpad uit als dat aanzicht eigen helden moet ondersteunen. Bewaar uitsneden, richtingen en animatieframes bij die variant. Gedeelde beeldonderdelen hoeven niet gedupliceerd te worden.

`characterView(identity, view)` weigert ontbrekende aanzichten. Een zijaanzicht wordt dus niet stilzwijgend een bovenaanzicht. `acquireCharacterView()` laadt een geregistreerd vel op aanvraag. De daadwerkelijke top-down-/oblique-afbeeldingen en animaties zijn nog niet gemaakt.

`projection.mjs` biedt heen- en terugprojectie voor `top-down` en `oblique`, plus tekenvolgorde op basis van grondpositie. Een sprong verandert daardoor niet plotseling de dieptevolgorde. De spellogica blijft in wereldcoördinaten; alleen de renderer projecteert naar schermcoördinaten.

## Server, offline en controles

`build/module-graph.mjs` volgt statische named imports, named re-exports en dynamische imports met een letterlijk relatief pad. De server gebruikt dezelfde verzameling om benodigde modules toe te laten. Nieuwe spelimports worden daardoor automatisch bereikbaar na herstart van de server. Afbeeldingen moeten nog wel geregistreerd worden in de relevante assetlijsten voor server en build.

De offlinebuild zet modules in afzonderlijke factories met eigen variabelen. Statische dependencies worden uitgevoerd bij eerste gebruik; dynamische game-imports pas bij selectie. Alle code en afbeeldingen blijven in het ene `speel.html` beschikbaar, zonder netwerk. De kleine bundelaar ondersteunt geen willekeurige npm-imports, circulaire modules of live exports; niet-ondersteunde import-/exportsyntaxis geeft een buildfout. Houd het huidige named-exportpatroon aan.

`npm test` bevat `game-runtime.test.mjs` voor opruimen, gedeelde resources, laad-/wisselraces, karakteridentiteiten, projecties, platformterugkeer en uitvoering van echte offlinepakketten. De exports van alle runtime-modules worden met hun native equivalent vergeleken. `small-games-ui.test.mjs` controleert de echte menuhandlers via een DOM-adapter, inclusief uitslagen en afbreken van een tussenspel. De bestaande spelregeltests blijven behouden.

De volledige lokale tests en build zijn de automatische controle. HTTP-controle dekt de nieuwe module- en assetpaden. Visuele browsercontrole en een fysieke controllertest blijven apart: de browserconnector gaf tijdens deze wijziging een fout vóór paginabediening.
