# Structuur: Ketting · vuurbal met gezicht

[Categorie en toevoegroute](../../interactables/guides/mechanisms.md) · [Alle structuureigenschappen](../../STRUCTURES.md) · [Afbeeldingen](images/README.md)

Een vurige kettingbal met een boos gezicht.

Fysieke categorie: `obstacles/`. Kopieer de hele onderdeelmap om een eigen variant te maken.

## Wat zit hier?

[structure.json](structure.json) is het bewerkbare profiel. De PNG’s staan onder [images/](images/README.md). De verwijzing `obstacles/fire-face-pendulum` staat in de groep `mechanisms` van [structures.json](../../structures.json). De runtime leest de registratie; de map wordt niet willekeurig gescand.

## Huidige uitgangswaarden

| Eigenschap | Waarde |
| --- | --- |
| Map/ID | `"fire-face-pendulum"` |
| Logische groep | `"mechanisms"` |
| Gedragscontroller | `"chain-ball"` |
| Tegelnummers | `[73]` |
| Zichtbaar in bouwer | `true` |
| Bouwgroep | `"mechanisms"` |
| collision.solid | `true` |
| collision.oneWay | `false` |
| collision.breakFromBelow | `false` |
| collision.damage | `true` |
| collision.lethal | `false` |
| collision.topOffset | `0` |
| pSwitchConvertible | `false` |

Deze waarden zijn een uitgangspunt bij het lezen; de actuele JSON blijft leidend. `id` identificeert de map, `kind` kiest de code die het gedrag uitvoert en `tileIds` koppelt het onderdeel aan de tegeldata.

## Een nieuwe variant toevoegen

1. Kopieer deze volledige map naar een nieuwe buurmap, bijvoorbeeld `mijn-fire-face-pendulum/`. Neem `images/` mee.
2. Zet `id` gelijk aan die nieuwe mapnaam, schrijf een eigen `name` en `description` en behoud eerst `kind: "chain-ball"`.
3. Geef `tileIds` een vrij nummer vanaf 102 tot en met 255. Controleer de vijanden én structuren.
4. Behoud `editor.visible: true` en kies een ondersteunde groep. De bestaande groepsnamen staan in de hoofdhandleiding.
5. Voeg de nieuwe mapnaam toe aan de groep `mechanisms` in `../../structures.json`.
6. Verander één ondersteunde eigenschap of PNG, voer de controles uit en plaats de nieuwe variant in een klein proeflevel.

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Instellingen van dit onderdeel

| Instelling | Waarde en uitleg |
| --- | --- |
| `settings.length` | `76` — Lengte van de liaan of slingerarm. |
| `settings.frequency` | `1.8` — Frequentie van de slinger of verdwijncyclus. |
| `settings.amplitude` | `0.9` — Maximale slingerhoek. |
| `settings.diameter` | `30` — Doorsnede van de bal en zijn botsingsvak. |
| `settings.fire` | `1` — Oorspronkelijke keuze voor vuur-tekenwerk; een bestaande PNG verandert niet vanzelf mee. |
| `settings.face` | `1` — Oorspronkelijke keuze voor gezicht-tekenwerk; pas een bestaande PNG zelf aan. |

De ketting wordt tussen anker en bal getekend. De body-PNG staat op de echte balpositie. Meer lengte of diameter moet ook op een klein scherm en bij muren leesbaar blijven.

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

- [images/ball.png](images/ball.png)
- [images/grass.png](images/grass.png)

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
