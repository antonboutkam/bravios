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
