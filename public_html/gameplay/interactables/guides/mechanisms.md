# Mechanismen: beweging, springen en aftellen

[Alle spelonderdelen](../../../README.md) · [Structuurformaat en eigenschappen](../../STRUCTURES.md)

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Een bestaand profiel als uitgangspunt

1. Lees [spring/README.md](../spring/README.md) en open `../spring/structure.json`.
2. Kopieer de hele map `spring/` naar `mijn-springveer/`, inclusief `images/`.
3. Zet `id` op `mijn-springveer` en schrijf een eigen `name` en `description`. Behoud eerst dezelfde `kind`.
4. Geef de kopie een vrij tegelnummer, zet `editor.visible` op `true` en kies de juiste `editor.group`.
5. Vervang zo nodig de PNG’s en behoud hun frameafmetingen, of werk de verwijzingen onder `visuals` mee bij. `visuals.default` blijft verplicht.
6. Voeg het pad `categorie/mapnaam` (bijvoorbeeld `interactables/mijn-buis` of `platforms/mijn-rots`) toe aan de groep `mechanisms` in `../../structures.json`. Laat de andere groepen en bestaande namen staan.
7. Voer de controles uit, ververs het spel en probeer precies de gewijzigde interactie.


## Wat is bij deze categorie belangrijk?

Verander voor een eerste oefening `settings.bounceSpeed` van je springveer en test een echte landing. Voor beweegblokken gebruik je `width`, `height`, `distance`, `direction` en `travelSeconds`. De bouwer berekent de benodigde vrije vakjes uit breedte en hoogte. Maak de afbeelding en de zichtbare botsingsvorm passend.

Een donut gebruikt `delaySeconds` en `bounceSpeed`; een vuurmolen gebruikt `flames`, `spacing`, `radius` en `periodSeconds`. Vlammen en slingerballen gebruiken dezelfde simulatiepositie voor beeld en botsingen. Behoud de losse beeldonderdelen zoals `flame` en `ball`.

De lopende band (`belt`) wordt geplaatst met twee assen en levelgegevens onder `belts`. Het kettinghoofdanker maakt een apart gevaar aan. Die twee routes zijn geen algemene nieuwe losse tegels: kopieer ze niet met een nieuw nummer zonder ook de plaatsings-/aanmaakcode te ondersteunen. Pas als beginner het bestaande band- of ankerprofiel aan.

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
| Springveer | [spring](../spring/README.md) |
| Beweegblok · eerst omhoog | [moving-wall-up](../../platforms/moving-wall-up/README.md) |
| Beweegblok · eerst omlaag | [moving-wall-down](../../platforms/moving-wall-down/README.md) |
| Lopende band | [conveyor](../../platforms/conveyor/README.md) |
| Ketting · stekelbal | [spike-pendulum](../../obstacles/spike-pendulum/README.md) |
| Ketting · stekelbal met gezicht | [spike-face-pendulum](../../obstacles/spike-face-pendulum/README.md) |
| Ketting · vuurbal | [fire-pendulum](../../obstacles/fire-pendulum/README.md) |
| Ketting · vuurbal met gezicht | [fire-face-pendulum](../../obstacles/fire-face-pendulum/README.md) |
| P-schakelaar | [p-switch](../p-switch/README.md) |
| Ingedrukte P-schakelaar | [pressed-switch](../pressed-switch/README.md) |
| Kettinghoofd | [chainhead-anchor](../../obstacles/chainhead-anchor/README.md) |
| Liaan | [vine](../vine/README.md) |
| Donutplatform | [donut](../../platforms/donut/README.md) |
| Vuurmolen | [firebar](../../obstacles/firebar/README.md) |
