# Vijand: Crumblecastle the Walking Fortress

[Categorie en toevoegroute](../README.md) · [Alle vijandeigenschappen](../../README.md) · [Afbeeldingen](images/README.md)

Crumblecastle the Walking Fortress

Dit profiel staat in de cataloguslijst.

## Wat zit hier?

- [enemy.json](enemy.json) beschrijft identiteit, controller, beweging, gevecht en de verwijzingen naar afbeeldingen.
- [images/](images/README.md) bevat de PNG’s voor de relevante toestanden.
- Deze README geeft je een startpunt voor een variant. De JSON-waarden blijven de bron als je later iets wijzigt.

## Huidige uitgangswaarden

| Onderdeel | Waarde |
| --- | --- |
| Map-ID | `crumblecastle` |
| ID in JSON | `"crumblecastle"` |
| Catalogusgroep | `"game"` |
| Gedrag (`kind`) | `"wonder"` |
| Tegelnummers | `[]` |
| Botsingsvak `size` | `[32, 34]` |
| Beweging | `{"type": "walk", "speed": 36, "turnAtEdges": true, "amplitude": 8, "frequency": 1.8}` |
| Levenspunten | `1` |
| Veilig bespringbaar | `true` |
| Reactie op springen | `"damage"` |
| Schieten aan | `false` |
| Wonderland-type | `5` |

Dit type wordt door Wonderland gemaakt. De campagne kiest `wonderType`; per groep is één profiel per type toegestaan. Een extra gekopieerd profiel met hetzelfde type wordt geweigerd.

## Een nieuwe variant maken

Dit is een klein Wonderland-profiel, geen algemeen tegelmonster. Pas eerst het bestaande profiel aan en speel een campagneveld dat dit type gebruikt. Voor een vervangende map houd je de controllerrol, vervang je de huidige vermelding van dit type en zorg je dat de campagne het gewenste profiel kiest. Registreer geen extra profiel met hetzelfde `wonderType`. Een nieuwe negende soort vereist validatie-, controller- en campagnewijzigingen; zie de [baashandleiding](../../bosses/README.md).

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Welke eigenschappen probeer je eerst?

Begin met een kleine, meetbare wijziging: verander de snelheid of één tijdsinstelling en vergelijk met het oorspronkelijke exemplaar. Bij gewone vijanden kun je ook `combat.health` wijzigen. Een reactie zoals `shell`, `fold` of `ignite` blijft een speciale reactie; extra levenspunten maken de speciale reactie niet automatisch tot gewone schade per treffer.

| Instelling | Waarde en betekenis |
| --- | --- |
| `settings.jumpInterval` | `1.8` — Wachttijd tussen sprongen. |
| `settings.jumpSpeed` | `210` — Beginsnelheid omhoog, in spelpixels per seconde. |

`movement.type` en ondersteunde controllerinstellingen gaan over gedrag. PNG’s gaan over uiterlijk. Tekenwerk, botsingsvak en gedrag moeten samen kloppen: een grotere kroon of vleugel in een PNG is geen automatische nieuwe trefzone. Een volledig nieuwe mogelijkheid vereist ook code die de nieuwe instelling gebruikt.

## Afbeeldingen en toestanden

| Toestand | PNG | Frames × breedte × hoogte | fps |
| --- | --- | --- | --- |
| `palette-0` | [images/palette-0.png](images/palette-0.png) | 8 × 160 × 164 | 10 |
| `palette-1` | [images/palette-1.png](images/palette-1.png) | 8 × 160 × 164 | 10 |
| `palette-2` | [images/palette-2.png](images/palette-2.png) | 8 × 160 × 164 | 10 |
| `defeated` | [images/defeated.png](images/defeated.png) | 8 × 160 × 164 | 10 |
| `idle` | [images/idle.png](images/idle.png) | 8 × 160 × 164 | 10 |

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
