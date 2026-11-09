# Wereldkaart: Wonderland

[Een wereld toevoegen](../README.md) · [Velddefinities](../../../../engine/wonderland.mjs) · [Kaartweergave](../../../../engine/wonderland-map.mjs)

Deze map bevat de kaartafbeelding [world-inspiration.png](world-inspiration.png) (1672 × 941 px). De velddefinities en spelregels staan in JavaScript buiten deze map. Een PNG en een nieuwe submap leveren geen extra campagne op.

## De bestaande kaart aanpassen

1. Bewaar je bewerkbare tekening apart en maak voor een eerste oefening een kopie van het huidige PNG-bestand.
2. Teken de kaart opnieuw met dezelfde globale indeling of pas bewust de knooppuntcoördinaten mee aan. De kaartcode plaatst knoppen en routes over het plaatje.
3. Behoud voor de eerste proef de bestandsnaam. Dan blijven bestaande server-/offlineverwijzingen werken.
4. Verander je de naam of map, werk dan het pad in `wonderland-map.mjs` en alle verwijzingen in startscherm/app, `server.mjs` en `build.mjs` mee bij.
5. Ververs het spel en probeer het openen van de kaart, kiezen en reizen naar een veld, terugkomen na winst en het hervatten van bestaande voortgang.

## Een eigen wereld op dit voorbeeld baseren

Een eigen getekende wereld begint met een nieuwe map en een eigen PNG. Voor een speelbare vaste route maak je daarnaast eigen velddefinities en kaart-/interfacekoppelingen. Gebruik `WONDERLAND_FIELDS` om de bestaande gegevensstructuur te begrijpen, maar kopieer niet alleen de afbeelding.

De bestaande route heeft vijftien velden en speciale indexen voor geheimen, verplaatsende knooppunten en de finale. Voor een extra veld moet je ook die route, voortgang, `WONDER_ENCOUNTERS`, arena-aanmaak en tests nalopen. Een negende baastype is daarnaast een aparte controlleruitbreiding.

Een nieuwe structuur of baas binnen een bestaand veld wordt via zijn eigen catalogus en aanmaakcode toegevoegd. Lees daarvoor [structuren](../../../../gameplay/STRUCTURES.md) en [bazen](../../../../gameplay/enemies/bosses/README.md). Voor een wereld zonder programmeerwerk gebruik je de bestaande wereldbouwer en deel je het geëxporteerde wereldbestand.

## Controleren

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

Na een kaart-/campagnewijziging:

```sh
node public_html/engine/tests/wonderland.test.mjs
node public_html/engine/tests/worlds-campaign.test.mjs
npm run build
```

Controleer ook de kaart op een klein scherm en de offlineversie. Als je route, ontgrendeling of een baas hebt aangepast, voeg dan passende tests toe en voer `npm test` uit. Een ontbrekende kaart bij `npm start` wijst vaak op een vergeten serververmelding; een kaart die alleen offline ontbreekt op een vergeten assetvermelding of verouderde build.
