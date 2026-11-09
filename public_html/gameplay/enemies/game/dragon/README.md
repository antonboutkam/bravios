# Vijand: Vliegende draak

[Categorie en toevoegroute](../README.md) · [Alle vijandeigenschappen](../../README.md) · [Afbeeldingen](images/README.md)

Vliegt heen en weer en beweegt op en neer. Pas op voor zijn vleugels!

Dit profiel staat in de cataloguslijst.

## Wat zit hier?

- [enemy.json](enemy.json) beschrijft identiteit, controller, beweging, gevecht en de verwijzingen naar afbeeldingen.
- [images/](images/README.md) bevat de PNG’s voor de relevante toestanden.
- Deze README geeft je een startpunt voor een variant. De JSON-waarden blijven de bron als je later iets wijzigt.

## Huidige uitgangswaarden

| Onderdeel | Waarde |
| --- | --- |
| Map-ID | `dragon` |
| ID in JSON | `"dragon"` |
| Catalogusgroep | `"game"` |
| Gedrag (`kind`) | `"dragon"` |
| Tegelnummers | `[23]` |
| Botsingsvak `size` | `[26, 26]` |
| Beweging | `{"type": "fly", "speed": 60, "turnAtEdges": true, "amplitude": 18, "frequency": 2.4}` |
| Levenspunten | `1` |
| Veilig bespringbaar | `true` |
| Reactie op springen | `"damage"` |
| Schieten aan | `false` |

De draak vliegt. Controleer snelheid, hoogtebeweging en beide kijkrichtingen. Vlucht is spelgedrag; vleugels tekenen zonder `movement.type` verandert dat gedrag niet.

## Een nieuwe variant maken

1. Kopieer de volledige map `dragon/`, inclusief `images/`, naar een nieuwe buurmap, bijvoorbeeld `mijn-dragon/`.
2. Maak `id` exact gelijk aan die nieuwe mapnaam en kies een eigen `name` en `description`. Behoud eerst `kind: "dragon"`.
3. Vervang de gekopieerde `tileIds` door een vrij nummer vanaf 102 tot en met 255. Controleer ook de structuren; gebruik niet opnieuw 23.
4. Voeg de nieuwe mapnaam aan de bestaande `game`-lijst in `../../enemies.json` toe.
5. Verander één eigenschap, controleer de bestanden, ververs het spel en plaats je variant in een proeflevel. De oorspronkelijke vijand blijft bruikbaar zolang zijn ID en nummer behouden blijven.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Welke eigenschappen probeer je eerst?

Begin met een kleine, meetbare wijziging: verander de snelheid of één tijdsinstelling en vergelijk met het oorspronkelijke exemplaar. Bij gewone vijanden kun je ook `combat.health` wijzigen. Een reactie zoals `shell`, `fold` of `ignite` blijft een speciale reactie; extra levenspunten maken de speciale reactie niet automatisch tot gewone schade per treffer.

Dit profiel heeft geen aanvullende numerieke controllerinstellingen onder `settings`. Gebruik de algemene bewegings- en gevechtsvelden; onbekende extra velden leveren geen nieuw gedrag op.

`movement.type` en ondersteunde controllerinstellingen gaan over gedrag. PNG’s gaan over uiterlijk. Tekenwerk, botsingsvak en gedrag moeten samen kloppen: een grotere kroon of vleugel in een PNG is geen automatische nieuwe trefzone. Een volledig nieuwe mogelijkheid vereist ook code die de nieuwe instelling gebruikt.

## Afbeeldingen en toestanden

| Toestand | PNG | Frames × breedte × hoogte | fps |
| --- | --- | --- | --- |
| `idle` | [images/idle.png](images/idle.png) | 8 × 148 × 148 | 10 |
| `walk` | [images/walk.png](images/walk.png) | 8 × 148 × 148 | 10 |

De breedte van het hele PNG-vel is `frames × frameWidth`, de hoogte is `frameHeight`. Behoud `idle`. `bodyWidth`, `bodyHeight` en `bounds` beschrijven de verhouding tot het botsingsvak. De afbeeldings-README legt uit hoe je één beeld kunt vervangen zonder tegelijk alle metadata te veranderen. De spelcode kan beelden spiegelen; controleer daarom beide kijkrichtingen.

## Controleren en opleveren

Voer vanuit de projectmap uit:

```sh
npm run enemies:prepare
npm run structures:prepare
```

Plaats daarna de vijand of activeer de juiste producerende campagne/controller, nader van links en rechts en probeer de bedoelde gevechtsreacties. Controleer pauzeren, opnieuw starten en waar relevant samenspel. Als je spelcode hebt aangepast, voer je de relevante tests en `npm test` uit. Maak met `npm run build` een nieuwe offlineversie en probeer daar dezelfde wijziging.

Bij een fout over een dubbele tegel: kies een vrij nummer in beide catalogi. Bij een verkeerde ID: maak `id` gelijk aan de mapnaam. Bij een ontbrekende keuze: controleer registratie, `tileIds` en de aanmaakroute. Pas `../../../../engine/enemies/catalog.mjs` niet zelf aan. De PNG-export voor oorspronkelijk tekenwerk is geen gewone stap om jouw eigen tekening te laden.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.
