# Onderdelen tekenen voor de karaktermaker

[Karaktermaker uitbreiden](../README.md) · [Definities en uitsneden](../../../../engine/characters/custom/maker.mjs)

Deze map bevat PNG-vellen. Ieder vel is in cellen verdeeld; de index in `CHARACTER_PARTS` kiest een cel. De maker leest geen losse `character.json` uit deze map en ontdekt geen nieuwe PNG’s vanzelf.

| Bestand | Bestaand raster |
| --- | --- |
| [heads.png](heads.png) | 3 kolommen × 2 rijen; lijst `head`. |
| [outfits.png](outfits.png) | 4 kolommen × 2 rijen; lijst `outfit`. |
| [shoes.png](shoes.png) | 3 kolommen × 2 rijen; lijst `shoes`, met specifieke uitzonderingsuitsneden. |
| [accessories.png](accessories.png) | 4 kolommen × 3 rijen; lijst `accessories`. |

## Een bestaande cel opnieuw tekenen

1. Zoek in `CHARACTER_PARTS` de ID en de index van het onderdeel. De eerste index is 0, dan loopt de volgorde per rij van links naar rechts.
2. Open het bijbehorende vel in je tekenprogramma en markeer het raster. Verplaats geen andere cellen.
3. Behoud de plaats van het lichaamsdeel in de cel en de transparante achtergrond. Een hoofd of schoen moet op dezelfde lichaamsaansluiting blijven passen.
4. Exporteer naar hetzelfde PNG-pad en ververs het spel. Kijk naar de losse keuze, het complete figuur en minstens één bewegende pose.
5. Controleer ook een al opgeslagen figuur: dezelfde ID moet hetzelfde soort onderdeel blijven aanduiden.

## Een extra cel en keuze toevoegen

Voeg eerst een nieuwe unieke onderdeel-ID en naam toe in `../maker.mjs`, maak de cel op de overeenkomstige index en controleer of het raster nog voldoende ruimte heeft. Bij een vol raster moet je ook kolommen/rijen, uitsneden en mogelijk celposities in de loader aanpassen. De huidige schoenen hebben uitzonderingen voor `skis` en `clown`; die verdwijnen niet vanzelf als je het vel opnieuw indeelt.

Voor een hoed gebruik je de bestaande `hat`-eigenschap van accessoires. De normalisatie zorgt dat niet twee hoeden tegelijk geselecteerd blijven. Voor een compleet nieuw type accessoire zijn extra opslag-/renderregels nodig; een nieuwe bestandsnaam is niet genoeg.

## Een nieuw los afbeeldingsbestand

Als je een nieuw vel toevoegt, registreer het in `CHARACTER_SHEETS`, koppel het aan de juiste onderdelenlijst en zorg dat de loader het uitsnijdt. Controleer dat server en offlinebuild het pad meenemen. De bestaande paden komen via `CHARACTER_SHEETS` binnen; een bestand dat nergens wordt verwezen wordt niet geladen.

## Controleren

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

Voer na codewijzigingen `node public_html/engine/tests/character-maker.test.mjs` uit. Bekijk de maker ook echt: een test beoordeelt geen mooi aangesloten mouw of voetenlijn. Maak met `npm run build` een actuele offlineversie en probeer daarin een nieuw én een bestaand opgeslagen figuur.
