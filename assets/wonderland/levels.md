# Bravios in Wonderland — velden

Alle vijftien velden zijn 192 blokjes lang en 20 blokjes hoog: drie keer de oorspronkelijke lengte. Platforms, munten en stuiterplekken vullen ook de extra ruimte. De puzzels, portalen, doorgangen en eindbaasarena’s liggen verder uit elkaar; spronghoogtes en objectafmetingen blijven gelijk. Het rechts-kristal werkt 24 seconden om de langere afstand tot de wand te overbruggen.

Open Wonderland vanaf het startscherm. Een gehaald veld opent de opvolgers; bij meerdere voorgangers volstaat één ervan. Geheime veld 11 is optioneel. De finale is veld 15. Alle geopende routes zijn in beide richtingen te gebruiken.

| Veld | Gebied | Naam | Mechaniek | Na veld |
| --- | --- | --- | --- | --- |
| 1 | Paddenstoelenrijk | Het paddenstoeldorp | Stuiterpaddenstoelen, zwevende bloemenplank | Start |
| 2 | Paddenstoelenrijk | Het kleine deurtje | Krimpen, lage tunnel | 1 |
| 3 | Paddenstoelenrijk | De reuzentuin | Groeien, zware steen duwen | 1 |
| 4 | Paddenstoelenrijk | Het onderstebovenkasteel | Portaalpaddenstoelen, eerste eindbaas | 2 of 3 |
| 5 | Schaakkasteel | De omgekeerde laan | Tijdelijk links/rechts omwisselen | 4 |
| 6 | Schaakkasteel | De dansende schaakstukken | Schakelaar verplaatst een pad | 5 |
| 7 | Schaakkasteel | Het plafondpad | Tijdelijke zwaartekracht omhoog | 5 |
| 8 | Schaakkasteel | Het wandelende schaakkasteel | Schakelaar, schaakkoning | 6 of 7 |
| 9 | Droomzee | De theekopjeshaven | Stuiteren, achtvormige bloemenplank | 8 |
| 10 | Droomzee | De verloren boot | Omgekeerde besturing, geheime route openen | 9 |
| 11 | Droomzee | Het geheime droomeiland | Optionele muntjesroute, droomster | 10 |
| 12 | Regenboogkristalkasteel | De regenboogaanlegplaats | Rood → geel → blauw opent de brug | 10 |
| 13 | Regenboogkristalkasteel | De kristalwand | Tijdelijke zwaartekracht naar rechts | 12 |
| 14 | Regenboogkristalkasteel | De kleurenbrug | Groene kleur maakt platforms vast | 12 |
| 15 | Regenboogkristalkasteel | Het regenboogkristalkasteel | Kristalvolgorde en kristalkoning | 13 of 14 |

Na veld 6 verschijnt een extra bloemenpad naar de haven zodra die is ontgrendeld. Na veld 8 komt een verbinding met drie zwaaibestemmingen beschikbaar: veld 6, 8 en later 10. De knop toont de bestemming van de huidige zwaai. Na veld 9 verplaatst het schaakkasteel zich naar een tweede kaartpositie. Na veld 10 opent de draaikolk van de haven naar het geheime eiland. Kastelen, eiland en alle eerdere velden blijven bereikbaar.

De hoofdroute heeft een doorlopende veilige vloer. Verdwijnende en bewegende platforms staan erboven. Het lage tunneldak heeft echte botsing en vereist de kleine maat. Groei en krimp duren twaalf spel-seconden; besturing omwisselen zes; afwijkende zwaartekracht acht. Pauze bevriest deze effecten. Kristallen en schakelaars openen een echte doorgang en maken brugblokken vast. De finish blijft gesloten zolang de puzzel of een eindbaas actief is.

Dit is een afzonderlijk lokaal avontuur voor één speler. De campagneobjecten worden per veld opnieuw opgebouwd; alleen voltooide velden, kaartpositie en de verdiende droomster worden bewaard. Herhalen levert geen extra droomsterren op.


## Vijanden en eindbazen

De acht personages uit [bosses/data/bosses.json](bosses/data/bosses.json) zijn in twee formaten geïmplementeerd. Kleine vijanden hebben één treffer nodig en patrouilleren, springen of zweven. Elk veld bevat vier kleine figuren met verschillende kleuren, maten en patronen. Elke soort ondersteunt twaalf combinaties van drie paletten, twee lichaamsvormen en twee gezichtspatronen. De grote bazen zijn ongeveer 2,4 keer zo groot als de basisvariant en behouden hun vaste kleuren en silhouetten uit het pakket.

| Personage | Eerste ontmoeting: ontsnapt | Terugkeer: wordt vriendelijk | Zwakke plek in deze campagne |
| --- | --- | --- | --- |
| Blubberus | 1 | 8 | Na de nies glinstert de kroon; spring erop. |
| Wafzilla | 2 | 9 | Stap tijdens of na de glij-aanval op de boterplaat, raak dan de wafel. |
| Sockstein | 3 | 10 | Stap binnen acht seconden op wasknop 1 en 2, raak dan de duizelige sok. |
| Tick-Tock | 4 | 11 | Wacht op twaalf; spring op de rode wekkerknop. |
| DJ Thunderfluff | 5 | 12 | Stap links, rechts, links, rechts; zonder tijdslimiet. |
| Crumblecastle | 6 | 13 | Gebruik de kussentreden om de vlag te raken wanneer het kasteel zit. |
| Princess Mirrorphantom | 7 | 14 | Kies de spiegelknop bij de rode neus; de juiste spiegel wisselt per ronde. |
| Emperor Wobbleflap | 15 | Finale | Zeven kroonrondes; activeer beide sterrenplaten na elkaar en raak de kroon. Daarna verschijnt een wit konijn. |

De gevechten passen de conceptbeschrijvingen aan de bestaande platformcampagne aan: drie treffers per gewone baas, zeven voor Wobbleflap. Een uitroepteken en een vaste gele vloermarkering kondigen de aanval minstens 1,5 seconde aan. De eerste aanval is een veilige demonstratie. Slijm en voetstappen zijn overspringbaar, boter en sokken vertragen tijdelijk, bliksem verschijnt op de gemarkeerde plek en spiegels tonen afleidende reflecties. Bij Wobbleflap wisselen de zeven kroontekens en aanvalsvormen per ronde. Er is geen vereiste om zeven losse beloningsvaardigheden uit de conceptdocumenten te verzamelen; beide platen kunnen in solo na elkaar worden geactiveerd.

De baas wordt pas actief bij de arena. Bij binnenkomst eindigen tijdelijke zwaartekracht en omgekeerde besturing, zodat je ook vanuit de kristalwand veilig kunt vechten. De vloer blijft heel. Buiten een glinsterend trefmoment helpen vuur, ijs en bellen niet tegen een grote baas. De springdoelen zijn vanaf de vloer bereikbaar; vuur is optioneel. DJ en de spiegelprinses krijgen hun treffers direct door de juiste puzzelkeuze. De finish werkt pas na zowel de veldpuzzel als het baasgevecht.

`public_html/wonder-foes.mjs` bevat een expliciete kopie van de aangeleverde JSON-identiteiten en kleuren; de pakketvergelijking in `public_html/tests/wonder-foes.test.mjs` bewaakt dat ze overeenkomen. `wonder-foe-art.mjs` tekent de figuren op transparante canvasruimte. De figuren zijn campagneobjecten, zonder nieuwe bouwdoostegel-ID's. De bestaande snapshotroute bewaart ook hun fasen, knoppen en tijdelijke effecten; Wonderland blijft een avontuur voor één speler.

De [kijk- en speelproef](../../public_html/tests/wonder-foes.html) toont alle grote bazen, twaalf kleine exemplaren per type en een keuze uit alle vijftien gevechten. Gebruik kleur/grijstinten en beweging aan/uit voor de visuele controle. De proef gebruikt dezelfde teken- en spelcode en is beschikbaar via de lokale server. De zelfstandige `speel.html` bevat beide nieuwe modules.
