# Markeringen: start en finish

[Alle spelonderdelen](../../../README.md) · [Structuurformaat en eigenschappen](../../STRUCTURES.md)

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Een bestaand profiel als uitgangspunt

1. Lees [start/README.md](../start/README.md) en open `../start/structure.json`.
2. Kopieer de hele map `start/` naar `mijn-start/`, inclusief `images/`.
3. Zet `id` op `mijn-start` en schrijf een eigen `name` en `description`. Behoud eerst dezelfde `kind`.
4. Geef de kopie een vrij tegelnummer, zet `editor.visible` op `true` en kies de juiste `editor.group`.
5. Vervang zo nodig de PNG’s en behoud hun frameafmetingen, of werk de verwijzingen onder `visuals` mee bij. `visuals.default` blijft verplicht.
6. Voeg het pad `categorie/mapnaam` (bijvoorbeeld `interactables/mijn-buis` of `platforms/mijn-rots`) toe aan de groep `markers` in `../../structures.json`. Laat de andere groepen en bestaande namen staan.
7. Voer de controles uit, ververs het spel en probeer precies de gewijzigde interactie.


## Wat is bij deze categorie belangrijk?

Behoud voor een startvariant `kind: "start"` en voor een finishvariant `kind: "finish"`. Een speelbaar level heeft een start en een finish nodig. Plaats niet meerdere start-/finishvarianten naast elkaar: de validator telt de varianten van dezelfde rol samen.

Een nieuw plaatje kan beter eerst in een kopie van de bestaande map worden uitgeprobeerd. Controleer de spelerpositie bij het starten en de overwinning bij aanraken van de finish. In een bazenveld kan de finish nog door een levende baas of een gesloten Wonderland-pad worden geblokkeerd. Dat los je niet op door een andere vlag-PNG toe te voegen.

## Identiteit, afbeeldingen en registratie

Gebruik voor een nieuw bouwobject een **vrij geheel tegelnummer van 102 tot en met 255**. Controleer de `tileIds` in zowel `enemies` als `structures`: die delen één nummerreeks. Het voorbeeldnummer 110 in een uitleg is geen gereserveerd nummer. Verander de nummers van bestaande objecten niet; opgeslagen levels verwijzen naar die nummers.

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
| Startplek | [start](../start/README.md) |
| Finishvlag | [finish](../finish/README.md) |
