# Vijand: Boze robot

[Categorie en toevoegroute](../README.md) · [Alle vijandeigenschappen](../../README.md) · [Afbeeldingen](images/README.md)

Een boze robot: 5 seconden opladen, daarna willekeurig links of rechts springen.

**Werkmap buiten de catalogus:** deze map staat momenteel niet in `enemies.json` en wordt daarom niet geladen of door `enemies:prepare` gecontroleerd. **De gekopieerde ID is nog `angry-robot` en komt niet overeen met de mapnaam `happy-robot`.** Maak die gelijk voordat je de map registreert en kies, voor een gewone bouwbare variant, ook eigen vrije `tileIds`.

## Wat zit hier?

- [enemy.json](enemy.json) beschrijft identiteit, controller, beweging, gevecht en de verwijzingen naar afbeeldingen.
- [images/](images/README.md) bevat de PNG’s voor de relevante toestanden.
- Deze README geeft je een startpunt voor een variant. De JSON-waarden blijven de bron als je later iets wijzigt.

## Huidige uitgangswaarden

| Onderdeel | Waarde |
| --- | --- |
| Map-ID | `happy-robot` |
| ID in JSON | `"angry-robot"` |
| Catalogusgroep | `"game"` |
| Gedrag (`kind`) | `"robot"` |
| Tegelnummers | `[21]` |
| Botsingsvak `size` | `[26, 26]` |
| Beweging | `{"type": "walk", "speed": 150, "turnAtEdges": true, "amplitude": 18, "frequency": 2.4}` |
| Levenspunten | `1` |
| Veilig bespringbaar | `true` |
| Reactie op springen | `"damage"` |
| Schieten aan | `false` |

De robot wisselt tussen opladen en springen. De beelden `charge-0` tot `charge-10` volgen de oplaadstand. Een andere `chargeSeconds` moet zichtbaar en speelbaar blijven.

## Een nieuwe variant maken

1. Kopieer de volledige map `happy-robot/`, inclusief `images/`, naar een nieuwe buurmap, bijvoorbeeld `mijn-happy-robot/`.
2. Maak `id` exact gelijk aan die nieuwe mapnaam en kies een eigen `name` en `description`. Behoud eerst `kind: "robot"`.
3. Vervang de gekopieerde `tileIds` door een vrij nummer vanaf 102 tot en met 255. Controleer ook de structuren; gebruik niet opnieuw 21.
4. Voeg de nieuwe mapnaam aan de bestaande `game`-lijst in `../../enemies.json` toe.
5. Verander één eigenschap, controleer de bestanden, ververs het spel en plaats je variant in een proeflevel. De oorspronkelijke vijand blijft bruikbaar zolang zijn ID en nummer behouden blijven.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Welke eigenschappen probeer je eerst?

Begin met een kleine, meetbare wijziging: verander de snelheid of één tijdsinstelling en vergelijk met het oorspronkelijke exemplaar. Bij gewone vijanden kun je ook `combat.health` wijzigen. Een reactie zoals `shell`, `fold` of `ignite` blijft een speciale reactie; extra levenspunten maken de speciale reactie niet automatisch tot gewone schade per treffer.

| Instelling | Waarde en betekenis |
| --- | --- |
| `settings.chargeSeconds` | `5` — Seconden opladen voor de robotsprong. |
| `settings.jumpSpeed` | `550` — Beginsnelheid omhoog, in spelpixels per seconde. |

`movement.type` en ondersteunde controllerinstellingen gaan over gedrag. PNG’s gaan over uiterlijk. Tekenwerk, botsingsvak en gedrag moeten samen kloppen: een grotere kroon of vleugel in een PNG is geen automatische nieuwe trefzone. Een volledig nieuwe mogelijkheid vereist ook code die de nieuwe instelling gebruikt.

## Afbeeldingen en toestanden

| Toestand | PNG | Frames × breedte × hoogte | fps |
| --- | --- | --- | --- |
| `idle` | [images/idle.png](images/idle.png) | 8 × 148 × 148 | 10 |
| `walk` | [images/walk.png](images/walk.png) | 8 × 148 × 148 | 10 |
| `charge-0` | [images/charge-0.png](images/charge-0.png) | 8 × 148 × 148 | 10 |
| `charge-1` | [images/charge-1.png](images/charge-1.png) | 8 × 148 × 148 | 10 |
| `charge-2` | [images/charge-2.png](images/charge-2.png) | 8 × 148 × 148 | 10 |
| `charge-3` | [images/charge-3.png](images/charge-3.png) | 8 × 148 × 148 | 10 |
| `charge-4` | [images/charge-4.png](images/charge-4.png) | 8 × 148 × 148 | 10 |
| `charge-5` | [images/charge-5.png](images/charge-5.png) | 8 × 148 × 148 | 10 |
| `charge-6` | [images/charge-6.png](images/charge-6.png) | 8 × 148 × 148 | 10 |
| `charge-7` | [images/charge-7.png](images/charge-7.png) | 8 × 148 × 148 | 10 |
| `charge-8` | [images/charge-8.png](images/charge-8.png) | 8 × 148 × 148 | 10 |
| `charge-9` | [images/charge-9.png](images/charge-9.png) | 8 × 148 × 148 | 10 |
| `charge-10` | [images/charge-10.png](images/charge-10.png) | 8 × 148 × 148 | 10 |
| `jump` | [images/jump.png](images/jump.png) | 8 × 148 × 148 | 10 |

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
