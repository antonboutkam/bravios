# Maak je eigen karakter

Werk in `public_html/gameplay/characters/`. Hieronder heet je nieuwe karakter **Nova**.

1. Kopieer de hele map `boaz` en noem de kopie `nova`.
2. Open `nova/character.json`. Zet `id` op `nova` en `name` op `Nova`.
3. Vervang in jouw map `images/portrait.png` en de basisposes plus `walk-1.png` tot en met `walk-4.png` in `images/platform/` door je eigen tekeningen. Behoud de bestandsnamen. Gebruik een transparante achtergrond en teken zijaanzichten naar rechts.
4. Voeg `"nova"` toe aan `characters.json`. Laat de bestaande namen staan:

   ```json
   ["boaz", "ravi", "pixel", "nova"]
   ```

5. Ververs de draaiende game. Klik op **Speel je level** en kies **Nova**.
6. Test lopen, springen en landen. De walkbeelden wisselen tijdens het wandelen elke 90 ms. Houd Shift of controllerknop B vast om te rennen. Teken per beeld een volgende stapfase en behoud dezelfde beeldverhouding en lichaamspositie. Pas je bestanden aan en ververs opnieuw.

De technische loader en gegenereerde catalogus staan apart in `../../engine/characters/`.

Bij F5 en Ctrl+F5 worden de personageconfiguraties opnieuw opgehaald. Portretten, alle spelposes, geregistreerde 3D-modellen en afbeeldingen van bouwonderdelen en vijanden krijgen per paginalading een nieuw bestandsadres, zodat oude browserkopieën niet blijven staan. Leerlingen kunnen hun bestanden onder dezelfde naam vervangen en daarna gewoon F5 gebruiken. Voor `speel.html` moet je na wijzigingen opnieuw bouwen.

**Niet zichtbaar?** Controleer of mapnaam, `id` en de naam in `characters.json` precies gelijk zijn.

[Meer uitleg](../../../docs/student/actiefiguren.md)

## Ook in 3D spelen

Een wereld met een 3D-veld is alleen speelbaar met personages die een echt 3D-model hebben. Boaz en Ravi hebben nu `3d/model.glb` en vijf aanzichten in `3d/previews/`. Het bestand staat in `character.json` als `"model3d": { "file": "3d/model.glb" }`. Alleen een map of PNG toevoegen geeft nog geen 3D-toegang. Eigen samengestelde 2D-personages blijven beschikbaar in 2D-werelden.

Ontbreekt `3d/model.glb`, dan blijft het personage beschikbaar in 2D en verschijnt het niet bij 3D-werelden. Dit geldt ook wanneer `model3d` al in de configuratie staat. De build slaat het ontbrekende model over; de configuratie blijft intact. Een aanwezig maar ongeldig model geeft wel een foutmelding.

[Modelafspraken, bouwer en controles](../../../docs/other/architecture/platformer3d.md).

## Fout bij het laden van een afbeelding

Het spel toont het personage, de bestandsnaam en het volledige pad. Een melding maakt onderscheid tussen een ontbrekend bestand (404), een onleesbare afbeelding, een server- of verbindingsfout en een laadpoging die te lang duurt. Lege afbeeldingen en ongelijke loopframes worden ook gemeld. Controleer het genoemde bestand, sla je verbetering op en kies **Opnieuw proberen** of **Opnieuw laden**. Het spel wordt dan vernieuwd, zodat ook vervangen afbeeldingen opnieuw worden opgehaald. De meldingen zijn ook beschikbaar in de offline versie; bouw die opnieuw na het wijzigen van bronbestanden.


## Instellingen voor het 2D-spel

Iedere `character.json` heeft een eigen sectie. Voor Anton staat er:

```json
"settings": {
  "2d": {
    "parachute": false,
    "runAnimation": "roll",
    "balance": { "health": 5, "power": 5 }
  }
}
```

- `parachute`: `true` opent de parachute automatisch tijdens lange vallen; `false` schakelt hem uit, ook na een jetpackvlucht. Boaz, Ravi en Pixel hebben `true`; Anton heeft `false`.
- `renderScale`: optionele tekengrootte van `0.5` tot en met `2`, standaard `1`. Anton heeft `1.25` en wordt dus 25% groter getekend, met dezelfde grondlijn. Dit verandert de botsingsafmetingen en springkracht niet.
- `runAnimation`: `"frames"` gebruikt de renbeelden. `"roll"` draait de enkele `run`-pose doorlopend vooruit tijdens sprinten op de grond, op dezelfde tekengrootte als de gewone pose. Anton gebruikt hiervoor zijn sprongafbeelding. Zodra je genummerde `run`-frames toevoegt, gebruikt hij die getekende animatie. Bij **minder beweging** blijft de pose stil.

Deze instellingen gelden voor de 2D-platformer, ook in co-op. Ze veranderen de 3D-variant niet.

## Wandelen en rennen

### Stilstaan

Met `idle-1`, `idle-2`, enzovoort in `poses` speelt een stilstaand personage een idle-reeks af: eerst `idle`, daarna de genummerde beelden, elk een halve seconde. Anton heeft `idle-1` tot en met `idle-9`. Registreer ieder bestand in `character.json`, bijvoorbeeld `"idle-1": "images/platform/idle-1.png"`. Nummer aaneengesloten vanaf 1, met maximaal 64 extra beelden. Zonder idle-reeks blijft het bestaande stilstaande zijaanzicht gelden. Bij **minder beweging** blijft `idle` staan.

Idle-beelden mogen verschillende canvasafmetingen en beeldverhoudingen hebben. Het spel snijdt iedere idle-pose afzonderlijk uit en tekent hem op gelijke hoogte, met de voeten op dezelfde grondlijn. De bronafbeeldingen worden niet aangepast. Lopen, rennen, springen, landen en winnen hebben voorrang op idle.

### Bewegen

Zonder sprintknop wandel je met de bestaande snelheid (220 spelpixels per seconde). Met **Shift** op het toetsenbord, **B / rondje** op de controller of de aanraakknop **Ren B** ren je met 330 spelpixels per seconde. Houd de knop tegelijk met een richting vast. Loslaten schakelt terug naar wandelen. Op rijdieren, onder water en tijdens bijzondere bewegingen blijven de bestaande snelheden gelden. Vuren doe je met **F / X** op het toetsenbord of **X / vierkant** op de controller.

Registreer de afbeeldingen in `poses`, bijvoorbeeld:

```json
"walk": "images/platform/walk.png",
"walk-1": "images/platform/walk-1.png",
"walk-2": "images/platform/walk-2.png",
"run": "images/platform/run.png",
"run-1": "images/platform/run-1.png",
"run-2": "images/platform/run-2.png",
"run-3": "images/platform/run-3.png"
```

Beide reeksen hebben onafhankelijk 1 tot 64 frames, aaneengesloten genummerd vanaf 1. Voeg zowel het bestand als de verwijzing in `poses` toe. Een niet-geregistreerde extra afbeelding wordt niet geladen. Zonder genummerde frames gebruikt het spel de enkele pose. Oudere personages met alleen `run` blijven bruikbaar: hun loopbeelden worden dan ook voor wandelen gebruikt.

De bestaande loopafbeeldingen zijn gekopieerd naar `walk.png` en `walk-1.png` tot en met `walk-4.png`. Bewerk voortaan die bestanden voor wandelen. De oude runbestanden blijven bewaard. Antons `run` verwijst nu naar `jump.png`; zijn oude runreeks staat niet meer in `poses`.

Frames binnen één reeks moeten na het verkleinen naar maximaal 384 pixels dezelfde canvasafmetingen hebben. Zo mogen 600 × 800 en 900 × 1200 wel samen, maar een vierkant en een staand beeld niet. Behoud dezelfde relatieve lichaamspositie in elk beeld. Een beschadigd of ontbrekend geregistreerd bestand geeft een foutmelding. Ververs met F5 na wijzigingen; bouw `speel.html` opnieuw voor offline gebruik.


## Leven en schietkracht verdelen

Zet per personage `settings.2d.balance`. Iedereen heeft **10 punten** te verdelen. `health` en `power` zijn hele getallen van 2 tot 8 en moeten samen precies 10 zijn. Een ongeldige verdeling geeft bij laden en bouwen een foutmelding.

| Personage | Leven (`health`) | Schietkracht (`power`) |
| --- | ---: | ---: |
| Boaz | 6 | 4 |
| Ravi | 4 | 6 |
| Anton | 5 | 5 |
| Pixel | 5 | 5 |

Met `"balance": { "health": 3, "power": 7 }` kan je held drie gewone treffers verdragen en zeven schoten opsparen. Een gelijke puntensom geeft dezelfde bouwruimte; speeltests blijven nodig om te beoordelen hoe sterk iedere verdeling aanvoelt.

De levensbalk toont één vakje per levenspunt. Na iedere onbeschermde gewone treffer verdwijnt één vakje en wordt het personage visueel iets kleiner. Bij nul ga je af. De afbeelding wordt van volledige grootte naar 60% verkleind; springen en botsingsafmetingen blijven gelijk. Helm, schild en rijdier vangen nog steeds een gewone treffer op. Na schade ben je kort beschermd. Vuur-, ijs- en bellenwapens raak je pas bij afgaan kwijt. Kattenvorm raak je bij een gewone treffer wel kwijt; die treffer kost ook één levenspunt. Lava, verplettering en vallen buiten het veld blijven direct dodelijk, met de bestaande uitzonderingen voor bijvoorbeeld rainbowbescherming.

De blauwe schietbalk begint vol. Een vuur-, ijs- of bellenschot kost één punt, net als wegblazen op het zeepaardje. Bij minder dan één punt kun je tijdelijk niet schieten. De balk laadt automatisch en gelijkmatig van leeg naar vol in **zes seconden actieve speeltijd**, ook terwijl je schiet. Een grotere schietbalk geeft dus zowel meer opeenvolgende schoten als meer schoten per seconde bij langdurig vuren. De bestaande korte wachttijd tussen schoten blijft gelden. Je hebt nog steeds een wapenbeloning nodig om te schieten.

Pauze bevriest het herladen. Grotten en buizen bewaren beide balken. Een nieuw veld, herstart of co-oprespawn begint met volle balken. In co-op heeft iedere speler zijn eigen verdeling en balken; oude spelstanden zonder deze gegevens krijgen volle balken. Deze instellingen veranderen de 3D-platformer niet.

## Pinball

[Pinball](pinball/README.md) is een zilveren bal voor 2D. Links en rechts kantelen de wereld; de bal rolt door de helling. Laat los om uit te rollen en stuur tegen om te remmen. Spring met de gewone springknop.

## Je karakter programmeren met callbacks

Een **callback** is een functie die het spel voor je aanroept wanneer er iets gebeurt. Bijvoorbeeld: je pakt een muntje en het spel roept jouw muntjesfunctie aan. Je roept die functie dus niet zelf aan vanuit een herhaallus.

De zes callbacks werken in de **2D-platformer**, inclusief muntjesuitdagingen en online samenspel voor twee spelers. De losse kleine games en de 3D-platformer roepen deze callbacks nog niet aan. Je kunt wel hetzelfde character blijven gebruiken in die games.

### 1. Koppel gebeurtenissen aan functienamen

Voeg in je eigen `character.json` een veld `callbacks` toe, naast `poses` en `settings`. JSON bevat de namen van de functies; de JavaScript-code staat in een apart bestand. Dit is Antons volledige koppeling:

```json
"callbacks": {
  "onSpawn": "begroetSpeler",
  "onJump": "telSprongen",
  "onCollectCoin": "beloonMuntje",
  "onDamage": "reageerOpSchade",
  "onSpecial": "activeerSchild",
  "onWin": "vierOverwinning"
}
```

Dit fragment vervangt niet het hele bestand. Let op de komma tussen de velden van je bestaande JSON. Je hoeft niet alle gebeurtenissen te gebruiken: begin bijvoorbeeld met alleen `onSpawn`. Zonder `callbacks`, of met `"callbacks": {}`, speelt je character zoals voorheen.

### 2. Schrijf je functies in callbacks.js

Maak **`callbacks.js` in dezelfde map als `character.json`**. Gebruik precies de functienamen uit je JSON en zet `export` vóór iedere gekoppelde functie:

```js
export function begroetSpeler(context) {
  context.showMessage('Mijn karakter is klaar!', 3);
}
```

`context` is de parameter: het spel geeft daarin gegevens en handige functies mee. `showMessage` toont drie seconden tekst boven je character en in de statusbalk. De tweede parameter is het aantal seconden.

Gebruik gewone, synchrone functies met `export function`. Houd dit bestand zelfstandig: zet je hulpfuncties in hetzelfde bestand. Gebruik geen `async`, `await`, imports, `fetch`, timers of eigen animatielus. Het spel verzorgt het aanroepen en de tijd. Bovenaan het bestand definieer je alleen functies en vaste waarden; spelgedrag hoort binnen een callback.

### De zes gebeurtenissen

| Gebeurtenis | Wanneer roept het spel jouw functie aan? | Extra gegevens in `context.event` |
| --- | --- | --- |
| `onSpawn` | Eén keer bij de eerste actieve spelstap, nadat je character is gekozen. Opnieuw na terugkomen in co-op. Pauze, een grot of een buis veroorzaken geen nieuwe spawn. | Alleen `type`. |
| `onJump` | Eén keer na een uitgevoerde sprong, ook bij losspringen van een slinger. Vasthouden, een geweigerde sprong, zwemmen en een automatische veersprong tellen niet als nieuwe sprong. | Alleen `type`. |
| `onCollectCoin` | Na ieder echt opgepakt muntje, ook uit een vraagblok. Beide muntjestellers zijn dan al verhoogd. | `coins`: jouw muntjes; `teamCoins`: alle muntjes samen. |
| `onDamage` | Nadat je echt levenspunten verliest. Ook bij de laatste treffer, lava of vallen. Een helm, schild of onkwetsbaarheid die de klap opvangt veroorzaakt geen callback. | `damage`: verloren levenspunten; `lethal`: of je door deze treffer afgaat. |
| `onSpecial` | Bij een nieuwe druk op **E**, **RB / R1** (rechterschouderknop) of de aanraakknop **Kracht E**, als je kracht klaar is. | Alleen `type`. |
| `onWin` | Eén keer bij een gewonnen veld. Bij samen muntjes verzamelen alleen als het doel gehaald is; bij een muntjeswedstrijd alleen voor de winnaar(s), inclusief gelijkspel. In een gewoon co-opveld krijgen beide spelers deze callback. | `coins`: jouw muntjes; `teamCoins`: alle muntjes samen. |

`context.event.type` bevat altijd de gebeurtenisnaam, bijvoorbeeld `"onCollectCoin"`.

De speciale kracht heeft een vaste **wachttijd van acht seconden actieve speeltijd**. Je ziet de resterende tijd in de statusbalk en de aanraakknop. Vasthouden herhaalt de kracht niet: laat los en druk opnieuw. Tijdens pauze lopen de wachttijd en het schild niet door. Tijdens afgaan of een jetpackvlucht kun je geen nieuwe kracht starten. Een druk tijdens de wachttijd wordt niet bewaard voor later.

### Gegevens lezen en bewaren

`context.player` is een momentopname die je alleen kunt lezen:

| Veld | Betekenis |
| --- | --- |
| `character` | De ID van je character. |
| `health`, `maxHealth` | Huidige en maximale levenspunten. |
| `power`, `maxPower` | Huidige en maximale schietkracht. |
| `coins` | Jouw echte muntjesteller. |
| `bonusPoints` | Jouw aparte callbackbonuspunten. |

Bewaar eigen tellers in **`context.data`**. Iedere speler heeft zijn eigen data, ook wanneer beiden hetzelfde character kiezen. Gebruik bijvoorbeeld:

```js
export function telSprongen(context) {
  context.data.sprongen = (context.data.sprongen ?? 0) + 1;

  if (context.data.sprongen % 3 === 0) {
    context.showMessage(`Al ${context.data.sprongen} sprongen!`, 2);
  }
}
```

`?? 0` begint bij nul als de teller nog ontbreekt. `% 3` berekent de rest van delen door drie. Bij 3, 6 en 9 is die rest nul en verschijnt de tekst.

De data en bonuspunten blijven tijdens dit veld bewaard, ook in grotten, buizen, co-opspelstanden en na co-oprespawn. Een herstart of nieuw veld begint opnieuw. Het tijdelijke schild en de speciale wachttijd worden bij co-oprespawn gewist. Gebruik geen gedeelde veranderlijke tellers buiten je functies: die zouden bij meerdere spelers door elkaar lopen.

Je data mag maximaal 32 velden bevatten. Gebruik veldnamen die met een letter beginnen en daarna letters, cijfers of underscores bevatten (maximaal 32 tekens). Waarden zijn getallen tussen -1.000.000 en 1.000.000, tekst van maximaal 160 tekens, `true`, `false` of `null`. Gebruik geen objecten, arrays, functies of DOM-elementen als waarde.

### Het spel veranderen

| Functie | Wat gebeurt er? |
| --- | --- |
| `context.showMessage(tekst, seconden)` | Toont maximaal 100 tekens gedurende maximaal vijf seconden. Standaard twee seconden. Een volgende melding vervangt de vorige. |
| `context.addBonusPoints(aantal)` | Voegt maximaal tien hele bonuspunten per aanroep toe. De statusbalk toont jouw bonus. |
| `context.heal(aantal)` | Herstelt maximaal één levenspunt per aanroep, tot je maximale leven. Standaard één. Je kunt iemand die afgegaan is hiermee niet terugbrengen. |
| `context.giveShield(seconden)` | Geeft een apart tijdelijk schild, standaard drie seconden en maximaal drie seconden. Het stopt één gewone treffer. Lava, verplettering en vallen blijven dodelijk. Een bestaand gewoon schild blijft afzonderlijk bewaard. |

Negatieve en ongeldige getallen leveren geen beloning op; te grote waarden worden begrensd. De totale bonus is maximaal 1.000.000. Dit zijn grenzen per aanroep; schrijf zelf een voorwaarde als je een beloning maar af en toe wilt geven.

Bonuspunten staan **los van echte muntjes**. Ze veranderen de muntjesuitdaging, muntjesvoorraad en avonturenwinkel niet. Je kunt zo leren met beloningen programmeren zonder de bestaande winregels te veranderen. Het spel voert wijzigingen uit nadat de callback zonder fout klaar is. Binnen dezelfde callback blijft `context.player` de oorspronkelijke momentopname.

### Alle zes voorbeelden bij Anton

Bekijk [Antons character.json](anton/character.json) en [Antons callbacks.js](anton/callbacks.js). Iedere functie bevat uitleg en een werkend voorbeeld:

1. **`begroetSpeler`** houdt bij hoe vaak je verschijnt en kiest een eerste begroeting of terugkomsttekst.
2. **`telSprongen`** telt echte sprongen en toont bij iedere derde sprong een melding.
3. **`beloonMuntje`** geeft één bonuspunt per muntje. Ieder vijfde muntje herstelt één leven; met een volle levensbalk geeft het twee extra bonuspunten.
4. **`reageerOpSchade`** telt treffers en kiest een andere tekst bij afgaan, één overgebleven leven of gewone schade.
5. **`activeerSchild`** telt gebruikte schilden en activeert drie seconden bescherming tegen één treffer.
6. **`vierOverwinning`** geeft vijf bonuspunten bij winst, plus vijf extra als je geen levenspunten bent kwijtgeraakt.

Probeer ieder voorbeeld eerst in een gewoon eigen 2D-veld: kies Anton, start, spring drie keer, pak vijf muntjes, raak een vijand, druk E en bereik de finish. Probeer ook een vijfde muntje met een beschadigde én een volle levensbalk. Laat bij een tweede proef het schild een treffer opvangen en controleer dat de levensbalk gelijk blijft. Test de wachttijd door E vast te houden, los te laten en na acht seconden opnieuw te drukken.

### Verversen, bouwen en fouten oplossen

Voer vanuit de projectmap uit:

```sh
npm run characters:prepare
```

Deze controle meldt fouten in JSON, ontbrekende `callbacks.js`, JavaScript-syntaxfouten en ontbrekende of asynchrone exportfuncties. Start daarna het spel en ververs met **F5** na wijzigingen aan JSON of JavaScript. De website haalt de functies opnieuw op; je hoeft na een wijziging aan je callback geen server te herstarten. Voor de losse offlineversie voer je **`npm run build`** uit: die neemt de gekoppelde functies mee in `speel.html`, zodat ook E zonder netwerk werkt.

Een onbekende gebeurtenis, ontbrekend bestand of ontbrekende export verschijnt bij het laden. Een fout tijdens een callback verschijnt in de statusbalk met character, gebeurtenis en functienaam. Het spel schakelt die ene gebeurtenis voor deze speler uit tot een nieuwe ronde; de andere callbacks blijven werken. De mislukte aanroep levert geen data of beloningen op. Verbeter het bestand, ververs en start opnieuw. Het is gewone lokale JavaScript-code, geen afgeschermde omgeving: een oneindige lus kan je browser nog steeds laten vastlopen.

In online samenspel voert de hostcomputer de callbacks voor beide spelers uit. De andere speler stuurt de speciale knop door en ontvangt de resultaten, tellers en meldingen via de spelstand. Beide computers gebruiken daarom dezelfde projectbestanden met alle characters en functies. De callbacks worden niet opnieuw op de ontvangende computer uitgevoerd.
