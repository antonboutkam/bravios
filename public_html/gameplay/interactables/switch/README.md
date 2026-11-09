# Structuur: switch

[Categorie en toevoegroute](../guides/wonderland.md) · [Alle structuureigenschappen](../../STRUCTURES.md) · [Afbeeldingen](images/README.md)

Wonderland-structuur: switch

Fysieke categorie: `interactables/`. Kopieer de hele onderdeelmap om een eigen variant te maken.

## Wat zit hier?

[structure.json](structure.json) is het bewerkbare profiel. De PNG’s staan onder [images/](images/README.md). De verwijzing `interactables/switch` staat in de groep `wonderland` van [structures.json](../../structures.json). De runtime leest de registratie; de map wordt niet willekeurig gescand.

## Huidige uitgangswaarden

| Eigenschap | Waarde |
| --- | --- |
| Map/ID | `"switch"` |
| Logische groep | `"wonderland"` |
| Gedragscontroller | `"wonder-switch"` |
| Tegelnummers | `[]` |
| Zichtbaar in bouwer | `false` |
| Bouwgroep | `"mechanisms"` |
| collision.solid | `false` |
| collision.oneWay | `false` |
| collision.breakFromBelow | `false` |
| collision.damage | `false` |
| collision.lethal | `false` |
| collision.topOffset | `0` |
| pSwitchConvertible | `false` |

Deze waarden zijn een uitgangspunt bij het lezen; de actuele JSON blijft leidend. `id` identificeert de map, `kind` kiest de code die het gedrag uitvoert en `tileIds` koppelt het onderdeel aan de tegeldata.

## Een nieuwe variant toevoegen

Dit is een campagneobject met `tileIds: []`. Begin met wijzigen van het bestaande profiel en speel het campagneveld dat het object maakt. Wil je dezelfde rol in een andere map bewaren, kopieer de map, pas `id` aan en vervang de betreffende vermelding in `../../structures.json`; controleer dat die rol naar het gewenste profiel wordt geleid. Voeg niet zomaar een tweede profiel met dezelfde controller toe: er is geen automatische variantkeuze. Voor een nieuwe `wonder-...`-soort moet je ook de validator, objectaanmaak en interactiecode uitbreiden. Lees eerst de [categoriehandleiding](../guides/wonderland.md).

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Instellingen van dit onderdeel

Deze controller heeft hier geen aanvullende `settings`. Voor een eerste oefening pas je een ondersteunde botsingseigenschap of de PNG aan.

De controller bepaalt welke instellingen een spelregel worden. Een onbekend extra JSON-veld voert geen nieuw gedrag uit; vergelijk met de categoriehandleiding en de controllercode.

Een collision-instelling moet door de gekozen controller worden toegepast. Bij gewone blokken kun je onder meer massiviteit, eenrichtingslanding, schade en breken van onderen instellen. Bij campagneobjecten, lianen en bijzondere aanmaakroutes blijven hun speciale interacties leidend. Een nieuwe code-eigenschap toevoegen aan JSON alleen verandert het spel niet.

## Afbeeldingen begrijpen

Het standaardbeeld gebruikt deze beschrijving:

```json
{
  "image": "images/default.png",
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

- [images/default.png](images/default.png)

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
