# Broncode en werking

[Studentenhandleiding](README.md) · [Starten](starten.md)

De **broncode** bestaat uit de bestanden die ontwikkelaars aanpassen om het spel te veranderen. Een gedownload levelbestand bevat gegevens voor het spel, zoals blokken en de startplek. Dat is iets anders dan de code die bepaalt hoe een speler springt.

## De belangrijkste mappen

Alle paden hieronder beginnen in de projectroot.

| Map of bestand | Wat staat erin? |
| --- | --- |
| `public_html/` | De website en de code die het spel gebruikt |
| `public_html/index.html` | Knoppen, menu’s en de plek waar het spel wordt getekend |
| `public_html/styles.css` | Kleuren, afmetingen en opmaak van de bediening |
| `public_html/app.mjs` | Verbindt bediening, bouwer, spelregels, geluid en beeld |
| `public_html/engine.mjs` | Spelregels, beweging, botsingen en gegevens van een level |
| `public_html/art.mjs` | Tekent de spelwereld; gebruikt ook andere tekenmodules |
| `public_html/games/` | Code van de kleine games |
| `public_html/assets/` en `public_html/characters/` | Afbeeldingen en karakterbestanden die het spel gebruikt |
| `public_html/tests/` | Automatische controles en pagina’s om gedrag te bekijken |
| `docs/other/design/` | Bronmateriaal, ontwerpdocumenten en generatieprompts |
| `docs/` | Handleidingen en technische documentatie |
| `package.json` | Projectinformatie en de commando’s voor starten, bouwen en testen |

Een bestand met `.mjs` is een JavaScript-module. Een module kan functies delen met `export`. Een ander bestand gebruikt die functies met `import`. Daardoor kan de code over meerdere bestanden worden verdeeld. Grote bestanden hoef je niet van boven naar beneden te lezen: zoek eerst de functie of tekst die bij jouw wijziging hoort.

## Van toets naar bewegend beeld

Stel dat je tijdens het spelen naar rechts drukt:

1. De browser ontvangt de toetsaanslag. `app.mjs` houdt bij welke invoer actief is.
2. De app geeft de invoer en een tijdstap door aan de spelregels. De engine berekent een nieuwe positie en controleert botsingen.
3. De spelstand wordt bijgewerkt. Daarin staan bijvoorbeeld de positie van de speler, muntjes en vijanden.
4. De tekenfuncties tekenen de nieuwe stand op een **canvas**: een tekenvlak in de webpagina.
5. Dit herhaalt zich terwijl je speelt. De camera bepaalt welk deel van het level zichtbaar is.

De functies `createGame` en `stepGame` in `engine.mjs` maken en veranderen de spelstand. `drawWorld` in `art.mjs` tekent die stand. Zoek deze namen in je editor en bekijk ook waar ze in `app.mjs` worden aangeroepen.

## Hoe is een level opgebouwd?

Een level bevat onder andere een naam, thema, breedte en `tiles`. `tiles` is een array met rijen. Met `tiles[y][x]` lees je één vakje: `y` is de rij en `x` is de kolom. X loopt naar rechts en Y naar beneden. Het getal in een vakje verwijst naar een onderdeel, bijvoorbeeld grond of een muntje.

De engine controleert levelgegevens met `validateLevel`. Gebruik bij het onderzoeken een gedownload level als voorbeeld en bewaar eerst een kopie. Tijdens een speelpoging gebruikt het spel een eigen spelstand, zodat een opgepakt muntje niet uit je opgeslagen bouwlevel hoeft te verdwijnen.

## Waar worden gegevens bewaard?

Het spel gebruikt onder meer `localStorage`: opslag in je browser. JSON-export maakt een bestand dat je zelf kunt bewaren en verplaatsen. Online samenspel gebruikt daarnaast `network.mjs` en `room.php`; de PHP-server bewaart tijdelijke kamers. De gewone Node-server kan geen PHP uitvoeren.

## Werk in kleine stappen

Kies één zichtbare verandering. Zoek de bijbehorende tekst, HTML-ID of functienaam. Lees de code eromheen, pas één ding aan, sla op en controleer het resultaat in de browser. Bij gewijzigde spelregels kun je samen met je docent een passende bestaande test uitvoeren. Zie [commando’s en tests](../other/installation/README.md).

Wil je meer details? Lees dan de [architectuur](../other/architecture/architectuur.md) en de [uitleg over spelpakketten](../other/architecture/spelpakketten.md).
