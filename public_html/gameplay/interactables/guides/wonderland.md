# Wonderland: magische campagneobjecten

[Alle spelonderdelen](../../../README.md) · [Structuurformaat en eigenschappen](../../STRUCTURES.md)

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Een bestaand profiel als uitgangspunt

1. Lees [swing/README.md](../../platforms/swing/README.md) en open `../../platforms/swing/structure.json`.
2. Maak een werkende kopie buiten de registratielijst om je ideeën te bewaren. Verander eerst alleen een instelling van het geregistreerde voorbeeld.
3. Behoud voor de eerste oefening de bestaande ID, controller en lege tegellijst.
4. Lees hieronder welke code nodig is voordat een nieuwe soort magie kan worden geregistreerd.
5. Vervang zo nodig de PNG’s en behoud hun frameafmetingen, of werk de verwijzingen onder `visuals` mee bij. `visuals.default` blijft verplicht.
6. Registreer pas na de controller-/aanmaakwijziging de gewenste map in de groep `wonderland`.
7. Voer de controles uit, ververs het spel en probeer precies de gewijzigde interactie.


## Wat is bij deze categorie belangrijk?

Deze profielen hebben `kind: "wonder-..."` en `tileIds: []`. Ze worden vanuit de campagne aangemaakt, niet als gewone bouwtegels. Er is per bestaand objectsoort een profiel met onder andere beweging, afkoeltijd of effectduur.

Begin met aanpassen van een bestaand profiel, bijvoorbeeld `swing/settings.horizontalReach`, en speel het campagneveld dat een slingervlak gebruikt. Voor een eigen variant met dezelfde rol vervang je de relevante registratie en laat je de aanmaakcode dat profiel kiezen. Alleen een tweede profiel met dezelfde controller toevoegen biedt geen keuzeschakelaar: de huidige runtime kiest per controller zijn bestaande profiel.

Voor een nieuw soort magie voeg je eerst een controller toe aan `structures/load-catalog.mjs`. Breid vervolgens de aanmaak van objecten in `wonderland.mjs`, de interactie en toestand in `wonder-magic.mjs`, het renderen en de tests uit. Geef de nieuwe soort een eigen `wonder-...`-naam. Pas de tegellijst niet aan: deze objecten blijven campagneobjecten.

## Identiteit, afbeeldingen en registratie

De bestaande Wonderland-profielen gebruiken geen `tileIds`. Een nieuwe mapnaam wordt niet vanzelf een nieuw object in een campagneveld.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.

`visuals` bevat afbeeldingsbeschrijvingen, geen spelcode. Het PNG-pad begint in de eigen map, bijvoorbeeld `images/grass.png`. Een afbeelding met meerdere frames heeft breedte `frameWidth × frames` en hoogte `frameHeight`. De transparante marge onder `bounds` mag groter zijn dan het botsingsvak. Zie ook de README in `images/` van het gekozen voorbeeld.

## Controleren en opleveren

```sh
npm run enemies:prepare
npm run structures:prepare
```

De structuurcontrole controleert ook conflicten met vijandtegelnummers. Een niet-geregistreerde map wordt niet vanzelf gecontroleerd. Bewerk `../../../engine/structures/catalog.mjs` niet: dat bestand wordt gegenereerd.

Maak een klein proeflevel of kies het juiste campagneveld. Controleer contact van verschillende kanten, pauze/hervatten en opnieuw starten. Voer bij codewijzigingen de relevante tests uit. Gebruik vóór oplevering `npm test` wanneer je spelcode hebt gewijzigd en maak met `npm run build` een actuele offlineversie.

## Voorbeelden in deze map

| Onderdeel | Handleiding |
| --- | --- |
| lowRoof | [low-roof](../../platforms/low-roof/README.md) |
| heavy | [heavy](../../platforms/heavy/README.md) |
| swing | [swing](../../platforms/swing/README.md) |
| bossStep | [boss-step](../../platforms/boss-step/README.md) |
| fading | [fading](../../platforms/fading/README.md) |
| shrink | [shrink](../shrink/README.md) |
| grow | [grow](../grow/README.md) |
| reverse | [reverse](../reverse/README.md) |
| up | [up](../up/README.md) |
| right | [right](../right/README.md) |
| down | [down](../down/README.md) |
| portal | [portal](../portal/README.md) |
| switch | [switch](../switch/README.md) |
| color | [color](../color/README.md) |
| red | [red](../red/README.md) |
| yellow | [yellow](../yellow/README.md) |
| blue | [blue](../blue/README.md) |
