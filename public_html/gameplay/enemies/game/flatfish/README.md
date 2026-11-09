# Vijand: Platvis

[Categorie en toevoegroute](../README.md) · [Alle vijandeigenschappen](../../README.md) · [Afbeeldingen](images/README.md)

Verstopt op de bodem met af en toe een open oog. Springt op als je dichtbij komt.

Dit profiel staat in de cataloguslijst.

## Wat zit hier?

- [enemy.json](enemy.json) beschrijft identiteit, controller, beweging, gevecht en de verwijzingen naar afbeeldingen.
- [images/](images/README.md) bevat de PNG’s voor de relevante toestanden.
- Deze README geeft je een startpunt voor een variant. De JSON-waarden blijven de bron als je later iets wijzigt.

## Huidige uitgangswaarden

| Onderdeel | Waarde |
| --- | --- |
| Map-ID | `flatfish` |
| ID in JSON | `"flatfish"` |
| Catalogusgroep | `"game"` |
| Gedrag (`kind`) | `"flatfish"` |
| Tegelnummers | `[93]` |
| Botsingsvak `size` | `[32, 12]` |
| Beweging | `{"type": "swim", "speed": 0, "turnAtEdges": true, "amplitude": 18, "frequency": 2.4}` |
| Levenspunten | `1` |
| Veilig bespringbaar | `false` |
| Reactie op springen | `"damage"` |
| Schieten aan | `false` |

De platvis is meestal verborgen en springt bij nadering op. Test de rustige en actieve toestand, niet alleen het paletbeeld.

## Een nieuwe variant maken

1. Kopieer de volledige map `flatfish/`, inclusief `images/`, naar een nieuwe buurmap, bijvoorbeeld `mijn-flatfish/`.
2. Maak `id` exact gelijk aan die nieuwe mapnaam en kies een eigen `name` en `description`. Behoud eerst `kind: "flatfish"`.
3. Vervang de gekopieerde `tileIds` door een vrij nummer vanaf 102 tot en met 255. Controleer ook de structuren; gebruik niet opnieuw 93.
4. Voeg de nieuwe mapnaam aan de bestaande `game`-lijst in `../../enemies.json` toe.
5. Verander één eigenschap, controleer de bestanden, ververs het spel en plaats je variant in een proeflevel. De oorspronkelijke vijand blijft bruikbaar zolang zijn ID en nummer behouden blijven.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Welke eigenschappen probeer je eerst?

Begin met een kleine, meetbare wijziging: verander de snelheid of één tijdsinstelling en vergelijk met het oorspronkelijke exemplaar. Bij gewone vijanden kun je ook `combat.health` wijzigen. Een reactie zoals `shell`, `fold` of `ignite` blijft een speciale reactie; extra levenspunten maken de speciale reactie niet automatisch tot gewone schade per treffer.

| Instelling | Waarde en betekenis |
| --- | --- |
| `settings.triggerRange` | `100` — Afstand waarop de controller reageert. |

`movement.type` en ondersteunde controllerinstellingen gaan over gedrag. PNG’s gaan over uiterlijk. Tekenwerk, botsingsvak en gedrag moeten samen kloppen: een grotere kroon of vleugel in een PNG is geen automatische nieuwe trefzone. Een volledig nieuwe mogelijkheid vereist ook code die de nieuwe instelling gebruikt.

## Afbeeldingen en toestanden

| Toestand | PNG | Frames × breedte × hoogte | fps |
| --- | --- | --- | --- |
| `idle` | [images/idle.png](images/idle.png) | 8 × 160 × 120 | 10 |
| `walk` | [images/walk.png](images/walk.png) | 8 × 160 × 120 | 10 |
| `active` | [images/active.png](images/active.png) | 8 × 160 × 120 | 10 |
| `idle-night` | [images/idle-night.png](images/idle-night.png) | 8 × 160 × 120 | 10 |
| `walk-night` | [images/walk-night.png](images/walk-night.png) | 8 × 160 × 120 | 10 |
| `active-night` | [images/active-night.png](images/active-night.png) | 8 × 160 × 120 | 10 |

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
