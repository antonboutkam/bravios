# Grotten: toegang, slot en bestaand binnenlevel

[Alle spelonderdelen](../../../README.md) · [Structuurformaat en eigenschappen](../../STRUCTURES.md)

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Een bestaand profiel als uitgangspunt

1. Lees [cave-open/README.md](../cave-open/README.md) en open `../cave-open/structure.json`.
2. Kopieer de hele map `cave-open/` naar `mijn-grot/`, inclusief `images/`.
3. Zet `id` op `mijn-grot` en schrijf een eigen `name` en `description`. Behoud eerst dezelfde `kind`.
4. Geef de kopie een vrij tegelnummer, zet `editor.visible` op `true` en kies de juiste `editor.group`.
5. Vervang zo nodig de PNG’s en behoud hun frameafmetingen, of werk de verwijzingen onder `visuals` mee bij. `visuals.default` blijft verplicht.
6. Voeg het pad `categorie/mapnaam` (bijvoorbeeld `interactables/mijn-buis` of `platforms/mijn-rots`) toe aan de groep `caves` in `../../structures.json`. Laat de andere groepen en bestaande namen staan.
7. Voer de controles uit, ververs het spel en probeer precies de gewijzigde interactie.


## Wat is bij deze categorie belangrijk?

Een nieuw grotprofiel geeft toegang tot de bestaande grotlogica. Het kiest niet automatisch een eigen binnenlevel op basis van een nieuwe PNG. Voor een eigen grotindeling moet je ook `caveRoomLevel` en de aanmaak-/bewaarlogica in `engine.mjs` uitbreiden.

Gebruik voor een gewone ingang `settings.locked: 0`. Een gesloten ingang heeft `locked: 1`, werkt met de bestaande sleuteltegel 64 en wordt op positievolgorde aan een sleutel gekoppeld. `openSeconds` mag niet groter zijn dan `revealSeconds`. Het uiterlijk van een verborgen grot zit mede in de PNG; een willekeurig nieuw JSON-veld maakt haar niet onzichtbaar.

Controleer naar binnen gaan, terugkeren, de sleutel gebruiken, opnieuw betreden en dat je niet meteen terug de grot in schiet. Controleer ook met twee spelers: gedeelde grotreizen moeten dezelfde toestand bewaren.

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
| Grot · open | [cave-open](../cave-open/README.md) |
| Grot · op slot | [cave-locked](../cave-locked/README.md) |
| Grot · verborgen rots | [cave-hidden](../cave-hidden/README.md) |
