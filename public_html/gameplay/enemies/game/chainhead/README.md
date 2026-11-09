# Vijand: Kettinghoofd

[Categorie en toevoegroute](../README.md) · [Alle vijandeigenschappen](../../README.md) · [Afbeeldingen](images/README.md)

Een gek hoofd hopt naar de held, tot de ketting strak staat.

Dit profiel staat in de cataloguslijst.

## Wat zit hier?

- [enemy.json](enemy.json) beschrijft identiteit, controller, beweging, gevecht en de verwijzingen naar afbeeldingen.
- [images/](images/README.md) bevat de PNG’s voor de relevante toestanden.
- Deze README geeft je een startpunt voor een variant. De JSON-waarden blijven de bron als je later iets wijzigt.

## Huidige uitgangswaarden

| Onderdeel | Waarde |
| --- | --- |
| Map-ID | `chainhead` |
| ID in JSON | `"chainhead"` |
| Catalogusgroep | `"game"` |
| Gedrag (`kind`) | `"chainhead"` |
| Tegelnummers | `[]` |
| Botsingsvak `size` | `[28, 28]` |
| Beweging | `{"type": "walk", "speed": 160, "turnAtEdges": true, "amplitude": 18, "frequency": 2.4}` |
| Levenspunten | `1` |
| Veilig bespringbaar | `false` |
| Reactie op springen | `"damage"` |
| Schieten aan | `false` |

Het kettinghoofd wordt als gevaar bij het anker aangemaakt. Een extra map of levenspuntenwaarde maakt er niet vanzelf een gewone bouwbare vijand van.

## Een nieuwe variant maken

Dit profiel wordt door een ander spelobject aangemaakt. Maak voor een variant eerst een kopie van de volledige map en verander de identiteit, maar registreer haar pas als de producerende controller dat nieuwe profiel ook kiest. Bekijk in `engine.mjs` de aanmaak van dit gevaar. Een leeg `tileIds`-veld betekent dat er geen gewone vijandenknop is. Voor een zelfstandig bouwbaar object moet je ook aanmaak, botsingen en eventuele gevechtsreacties programmeren.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Welke eigenschappen probeer je eerst?

Begin met een kleine, meetbare wijziging: verander de snelheid of één tijdsinstelling en vergelijk met het oorspronkelijke exemplaar. Bij gewone vijanden kun je ook `combat.health` wijzigen. Een reactie zoals `shell`, `fold` of `ignite` blijft een speciale reactie; extra levenspunten maken de speciale reactie niet automatisch tot gewone schade per treffer.

| Instelling | Waarde en betekenis |
| --- | --- |
| `settings.chainLength` | `112` — Maximale afstand tot het kettinganker. |
| `settings.jumpSpeed` | `300` — Beginsnelheid omhoog, in spelpixels per seconde. |
| `settings.jumpInterval` | `0.8` — Wachttijd tussen sprongen. |

`movement.type` en ondersteunde controllerinstellingen gaan over gedrag. PNG’s gaan over uiterlijk. Tekenwerk, botsingsvak en gedrag moeten samen kloppen: een grotere kroon of vleugel in een PNG is geen automatische nieuwe trefzone. Een volledig nieuwe mogelijkheid vereist ook code die de nieuwe instelling gebruikt.

## Afbeeldingen en toestanden

| Toestand | PNG | Frames × breedte × hoogte | fps |
| --- | --- | --- | --- |
| `idle` | [images/idle.png](images/idle.png) | 8 × 152 × 152 | 10 |
| `walk` | [images/walk.png](images/walk.png) | 8 × 152 × 152 | 10 |

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
