# Herstel van rendervertraging en onscherpte

[README](../../README.md) · [Architectuur](../other/architecture/architectuur.md) · [Meetgegevens](metingen/renderherstel-2026-11-06.json)

Op 6 november 2026 meldde de gebruiker dat het spel lokaal in Chrome onspeelbaar traag en onscherp was. De nieuwe achtergrondlagen waren eerder met grote transparante rasterpanelen geïmplementeerd. Een gewone browsercontrole en functionele tests hadden de prestatieregressie niet ondervangen.

## Wijzigingen

- De decorlagen worden nu rechtstreeks als vectorvormen getekend. De grote rasterpanelen en de bijbehorende cache zijn verwijderd. De drie parallaxlagen blijven beschikbaar.
- De speelcanvas heeft de omvang van het zichtbare venster. Een afzonderlijk `world-space` bewaart de virtuele scrollafmetingen van de volledige wereld. De bitmap hoeft een groot level dus niet meer in zijn geheel met verlaagde resolutie te vertegenwoordigen.
- Tekenen gebruikt apparaatpixeldichtheid tot 2×, met bestaande geheugen- en afbeeldingsgrenzen. Een lange wereld op zichzelf vermindert de scherpte niet meer.
- Bouwcoördinaten, schuifbalken, camerabeweging, hoogte, diepte en grotweergave gebruiken de virtuele wereldafmetingen. De canvasbitmap wordt onafhankelijk daarvan vertaald naar de camera.
- De eerder onderzochte waterstromingcontrole heeft nu een geiserindex per gedeelde simulatiestap. Zonder geisers wordt niet langer per vijand de volledige vijandenlijst doorzocht. Actieve en bevroren toestanden blijven actueel; de index wordt niet opgeslagen of gedeeld.

## Lokale vergelijking

Dezelfde twee lege proefvelden zijn vóór en na het herstel in headless Chrome bekeken, bij 1280 × 800 schermpixels en apparaatpixeldichtheid 1. Per veld zijn na vijf opwarmbeelden zestig beelden gemeten. Deze browser gebruikte softwarematige grafische verwerking. De cijfers zijn lokale waarnemingen, geen FPS-garantie voor andere apparatuur of voor het door de gebruiker gespeelde veld.

| Proefveld | Bitmap vóór | Bitmap na | Mediaan frame-interval vóór | Na |
| --- | --- | --- | --- | --- |
| 40 × 16, groene omgeving | 2560 × 1024 | 1280 × 800 | 66,7 ms, circa 15 FPS | 16,7 ms, circa 60 FPS |
| 264 × 32, maanomgeving | 8192 × 992 | 1280 × 800 | 33,4 ms, circa 30 FPS | 16,7 ms, circa 60 FPS |

De mediane JavaScript-callbackduur vóór het herstel was respectievelijk 2,1 en 3,8 ms. Dat kleine getal voorspelde de werkelijke frame-intervallen dus niet: werk buiten de callback, zoals rasterisatie en compositing, telt ook mee. Na het herstel waren de callbackduren circa 2,5 en 2,8 ms. Alleen JavaScript-tekenaanroepen meten was hier onvoldoende.

De meting verandert zowel het canvasformaat als de decorweergave. Zij ondersteunt de gezamenlijke reparatie; zij is geen geïsoleerde snelheidsmeting van één van beide onderdelen. De lege velden bevatten geen vijanden, dus de gemeten renderwinst wordt niet aan de geiseroptimalisatie toegeschreven. De eerdere GPU-onderzoeksmetingen blijven een gedateerde momentopname van de oude runtime.

## Vervolg op de melding van circa 10 FPS

De gebruiker meldde opnieuw een geschatte beeldsnelheid van maximaal 10 FPS. Het betrokken veld en de gebruikte spelversie zijn nog niet vastgesteld. Deze melding is daarom nog niet verklaard of als opgelost gemeten.

- Hoge velden tekenen nu ook verticaal alleen de tegelrijen rond het zichtbare venster. Een marge van 96 spelpixels bewaart afbeeldingen die buiten hun tegel uitsteken. De simulatie en de canvasresolutie veranderen niet. Aanroepen zonder verticale venstergrenzen blijven alle rijen tekenen.
- Druk tijdens bouwen of spelen op **F8** om de FPS-teller te tonen of te verbergen. Via `?fps=1` in het webadres staat hij meteen aan. Dit werkt ook in de opnieuw gebouwde `speel.html`.
- De teller gebruikt de werkelijke `requestAnimationFrame`-intervallen over minstens één seconde en toont daarnaast het langste interval. Hij meet geen losse JavaScript-tekenaanroepen en bewijst niet dat ieder beeld daadwerkelijk door het scherm is weergegeven. Een tabwissel begint een nieuwe meetperiode.

Controleer bij een nieuwe melding het webadres of de bestandsnaam, de veldnaam, de FPS tijdens spelen en bouwen, en het langste beeldinterval. De browserverbinding kon bij deze vervolgcontrole geen pagina openen. Er is dus geen nieuwe browsermeting of visuele controle uitgevoerd en geen snelheidswinst geclaimd. De gerichte tests controleren onder meer de rijselectie na verticaal scrollen, de marge, ongewijzigde spelstand en de FPS-berekening bij haperingen.

## Eerdere browsercontroles

De gerichte tests controleren schermresolutie, geheugenbegrenzing, pointercoördinaten na scrollen, vectorlagen zonder grote rasterallocaties en de geiserindex. De geisertest controleert ook activiteit die tijdens dezelfde stap verandert en vervanging van de vijandenlijst. De volledige suite draait met `npm test`.

In lokale Chrome zijn op zowel de HTTP-versie als de opnieuw gebouwde `speel.html` gecontroleerd: bouwen na horizontaal én verticaal scrollen, correcte tegelplaatsing, verkleinen naar 390 × 844 bij pixeldichtheid 2 en lopen met camerabeweging. De browserproeven leverden geen JavaScript-excepties op. Voor de offlineversie is `npm run build` uitgevoerd; PHP-syntax wordt met `php -l public_html/engine/room.php` gecontroleerd.

## Wonderlanddecor achter de platforms

De paddenstoelen, kristallen en schaakdecoratie werden in `drawWonderMagic()` na het tegelraster getekend. De speler kwam daar weer voor. Hierdoor bedekte een niet-solide decorstuk een echt platform waar de speler wel op stond.

Dit decor staat nu in `drawWonderBackdrop()`, vóór het tegelraster en de platforms. De interactieve toverobjecten blijven in hun bestaande tekenlaag. Ook worden alleen decorstukken binnen het zichtbare horizontale venster plus 40 pixels marge getekend.

De regressietest in `depth-backgrounds.test.mjs` faalde vóór de wijziging en slaagt erna. Hij controleert vier Wonderlandomgevingen, de volgorde ten opzichte van een overlappend blok en dat de interactieve laag het decor niet nogmaals over de blokken tekent. Een lokale Chrome-proef met dezelfde speler en hetzelfde platform toont het verschil: [vóór](metingen/wonderland-lagen-before.png) en [na](metingen/wonderland-lagen-after.png). De spelstand en botsingsregels zijn gelijk gebleven.
