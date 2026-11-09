# Structuur: Lopende band

[Categorie en toevoegroute](../../interactables/guides/mechanisms.md) · [Alle structuureigenschappen](../../STRUCTURES.md) · [Afbeeldingen](images/README.md)

Klik twee verschillende vakjes voor de assen. Staande platformen draaien 3 seconden en stoppen 2 seconden. Escape annuleert de eerste as.

Fysieke categorie: `platforms/`. Kopieer de hele onderdeelmap om een eigen variant te maken.

## Wat zit hier?

[structure.json](structure.json) is het bewerkbare profiel. De PNG’s staan onder [images/](images/README.md). De verwijzing `platforms/conveyor` staat in de groep `mechanisms` van [structures.json](../../structures.json). De runtime leest de registratie; de map wordt niet willekeurig gescand.

## Huidige uitgangswaarden

| Eigenschap | Waarde |
| --- | --- |
| Map/ID | `"conveyor"` |
| Logische groep | `"mechanisms"` |
| Gedragscontroller | `"belt"` |
| Tegelnummers | `[48]` |
| Zichtbaar in bouwer | `true` |
| Bouwgroep | `"mechanisms"` |
| collision.solid | `true` |
| collision.oneWay | `true` |
| collision.breakFromBelow | `false` |
| collision.damage | `false` |
| collision.lethal | `false` |
| collision.topOffset | `0` |
| pSwitchConvertible | `false` |

Deze waarden zijn een uitgangspunt bij het lezen; de actuele JSON blijft leidend. `id` identificeert de map, `kind` kiest de code die het gedrag uitvoert en `tileIds` koppelt het onderdeel aan de tegeldata.

## Een nieuwe variant toevoegen

Deze controller gebruikt een speciale plaatsings- of aanmaakroute. De lopende band heeft twee assen en levelgegevens; het kettinghoofdanker maakt een gevaar aan. Begin met het aanpassen van dit bestaande profiel. Een extra map met een ander tegelnummer is geen complete nieuwe variant zolang de plaatsings-/aanmaakcode die variant niet ondersteunt. Gebruik de [categoriehandleiding](../../interactables/guides/mechanisms.md) voor de noodzakelijke code-route.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Instellingen van dit onderdeel

| Instelling | Waarde en uitleg |
| --- | --- |
| `settings.runSeconds` | `3` — Duur van het bewegende deel van de bandcyclus. |
| `settings.restSeconds` | `2` — Rustduur voor de volgende actie. |
| `settings.speed` | `60` — Bewegingssnelheid. |
| `settings.spacing` | `96` — Afstand tussen onderdelen of vlammen. |
| `settings.radius` | `12` — Straal van de vlam of bandbocht. |
| `settings.platformWidth` | `24` — Breedte van een bandplatform. |
| `settings.platformHeight` | `32` — Hoogte van een bandplatform. |

De controller bepaalt welke instellingen een spelregel worden. Een onbekend extra JSON-veld voert geen nieuw gedrag uit; vergelijk met de categoriehandleiding en de controllercode.

Een collision-instelling moet door de gekozen controller worden toegepast. Bij gewone blokken kun je onder meer massiviteit, eenrichtingslanding, schade en breken van onderen instellen. Bij campagneobjecten, lianen en bijzondere aanmaakroutes blijven hun speciale interacties leidend. Een nieuwe code-eigenschap toevoegen aan JSON alleen verandert het spel niet.

## Afbeeldingen begrijpen

Het standaardbeeld gebruikt deze beschrijving:

```json
{
  "image": "images/grass.png",
  "frameWidth": 120,
  "frameHeight": 144,
  "frames": 1,
  "fps": 0,
  "bounds": [
    -4,
    -12,
    40,
    48
  ]
}
```

Dit is één beschrijving binnen `visuals`, geen volledig vervangend `structure.json`. Het hele vel is `frames × frameWidth` pixels breed en `frameHeight` hoog. `bounds` beschrijft de tekenruimte ten opzichte van een speltegel van 32 × 32 pixels. Laat `visuals.default` bestaan. Andere toestanden mogen hetzelfde bestand gebruiken.

De huidige unieke beeldbestanden zijn:

- [images/axle-rest.png](images/axle-rest.png)
- [images/axle-running.png](images/axle-running.png)
- [images/grass.png](images/grass.png)
- [images/platform.png](images/platform.png)

Vervang eerst één PNG met behoud van afmetingen. Werk alle verwijzingen mee bij wanneer een gedeeld bestand van formaat verandert.

## Controleren en uitproberen

Voer vanuit de projectmap uit:

```sh
npm run enemies:prepare
npm run structures:prepare
```

Maak daarna een proeflevel of open het bijbehorende campagneveld. Test de oorspronkelijke interactie en jouw gewijzigde instelling, contact van boven/onder/opzij, pauze/hervatten en opnieuw starten. Bij een interne toestand activeer je eerst het onderdeel dat die toestand produceert. Controleer samenspel als de wijziging gedeelde beweging of toestand beïnvloedt.

Een niet-bestaand PNG-pad, verkeerd frameformaat, gereserveerd nummer of dubbele ID moet eerst worden opgelost. Als het profiel niet verschijnt terwijl de controle slaagt, controleer je de registratie, `editor.visible`, `tileIds` en de speciale aanmaakroute. Bewerk `../../../../engine/structures/catalog.mjs` niet; dat wordt gegenereerd.

Bij codewijzigingen voer je de relevante tests en zo nodig `npm test` uit. Bouw vóór oplevering met `npm run build` en controleer dezelfde interactie in `speel.html`. Gebruik een onderhoudsexport van het oorspronkelijke tekenwerk niet om je handgetekende afbeeldingen te laden.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.
