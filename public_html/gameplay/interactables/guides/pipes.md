# Buizen: richting, ingang, uitgang en koppeling

[Alle spelonderdelen](../../../README.md) · [Structuurformaat en eigenschappen](../../STRUCTURES.md)

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Een bestaand profiel als uitgangspunt

1. Lees [pipe-up-in/README.md](../pipe-up-in/README.md) en open `../pipe-up-in/structure.json`.
2. Kopieer de hele map `pipe-up-in/` naar `mijn-buis/`, inclusief `images/`.
3. Zet `id` op `mijn-buis` en schrijf een eigen `name` en `description`. Behoud eerst dezelfde `kind`.
4. Geef de kopie een vrij tegelnummer, zet `editor.visible` op `true` en kies de juiste `editor.group`.
5. Vervang zo nodig de PNG’s en behoud hun frameafmetingen, of werk de verwijzingen onder `visuals` mee bij. `visuals.default` blijft verplicht.
6. Voeg het pad `categorie/mapnaam` (bijvoorbeeld `interactables/mijn-buis` of `platforms/mijn-rots`) toe aan de groep `pipes` in `../../structures.json`. Laat de andere groepen en bestaande namen staan.
7. Voer de controles uit, ververs het spel en probeer precies de gewijzigde interactie.


## Wat is bij deze categorie belangrijk?

Kies `pipe.opening`: `up`, `down`, `left` of `right`. Kies `pipe.mode`: `decoration` voor een buis zonder reis, `in` voor een ingang, `out` voor een uitgang of `both` voor twee richtingen. `imageOpening` beschrijft welke richting al in de PNG zit; verander die alleen als het plaatje zelf een andere basisrichting krijgt.

Maak een testlevel met minstens één passende ingang en uitgang. De bestaande code koppelt de posities op volgorde; het is geen vrij tekstveld waarin je een doelwereld of minigame invult. Houd de ruimte bij de uitgang vrij. Test beide speelrichtingen, een geblokkeerde uitgang en de afkoeltijd na reizen. Een buis die een minigame opent is nog geen bestaande JSON-functie: daarvoor moet de buisafhandeling de encountercode aanroepen.

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
| Buis | [pipe-up](../pipe-up/README.md) |
| Buis naar binnen ↓ | [pipe-up-in](../pipe-up-in/README.md) |
| Buis naar buiten ↑ | [pipe-up-out](../pipe-up-out/README.md) |
| Buis twee richtingen ↕ | [pipe-up-both](../pipe-up-both/README.md) |
| Buis opening onder | [pipe-down-decoration](../pipe-down-decoration/README.md) |
| Buis opening links | [pipe-left-decoration](../pipe-left-decoration/README.md) |
| Buis opening rechts | [pipe-right-decoration](../pipe-right-decoration/README.md) |
| Buis opening onder · ingang | [pipe-down-in](../pipe-down-in/README.md) |
| Buis opening onder · uitgang | [pipe-down-out](../pipe-down-out/README.md) |
| Buis opening onder · twee richtingen | [pipe-down-both](../pipe-down-both/README.md) |
| Buis opening links · ingang | [pipe-left-in](../pipe-left-in/README.md) |
| Buis opening links · uitgang | [pipe-left-out](../pipe-left-out/README.md) |
| Buis opening links · twee richtingen | [pipe-left-both](../pipe-left-both/README.md) |
| Buis opening rechts · ingang | [pipe-right-in](../pipe-right-in/README.md) |
| Buis opening rechts · uitgang | [pipe-right-out](../pipe-right-out/README.md) |
| Buis opening rechts · twee richtingen | [pipe-right-both](../pipe-right-both/README.md) |
