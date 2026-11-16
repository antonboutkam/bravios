# HUD en tekenoppervlak

[Architectuuroverzicht](README.md)

De 2D-platformer reserveert onderaan 20dvh voor een ondoorzichtige DOM-HUD. Op lage schermen geldt minimaal 112px; op smalle schermen minimaal 156px voor leesbare tellers. De CSS verkleint `#world-scroll` daadwerkelijk. De bestaande `ResizeObserver` in `app.mjs` past daarop de backing bitmap van `#world` aan. Het spel tekent dus geen wereld achter de HUD. Verbergen met H en teruggaan naar de bouwer herstellen het volledige canvas.

De wereldschaal blijft gebaseerd op de volledige werkruimte. Personages en blokken worden niet kleiner door het reserveren van HUD-ruimte; de camera volgt de speler in het lagere zichtvenster. Aanraakknoppen, meldingen en FPS-diagnostiek staan boven de HUD.

`vitals-hud.mjs` bewaart de bestaande DOM-nodes. Stabiele waarden veroorzaken geen tekst-, attribuut- of stijlschrijfacties. Schietkracht wordt visueel afgerond op 0,05 punt; alleen segmenten waarvan de vulling verandert krijgen een nieuwe transform. De bestaande statusfrequentie blijft maximaal 15 updates per spel-seconde zonder gebeurtenissen; de kloktekst wijzigt alleen bij een nieuwe seconde. De browser bepaalt welke pixels hij vervolgens opnieuw schildert en samenstelt.

Muntjes, wedstrijdtellers, tijd, avonturierstas, eindbaas en extra levens gebruiken bestaande speldata. Andere spelmodi tonen onbeperkte herstarts als ∞. De expliciet gemarkeerde demoscore is statisch. De arsenaalvakken zijn alleen gereserveerde ruimte; er is geen nieuwe inventaris, opslag of gebruiksactie toegevoegd.

Controle: `npm test` bevat `engine/tests/vitals-hud.test.mjs` voor stabiele updates, gerichte segmentwijzigingen, co-op en tellers. Controleer in een browser ook de verhouding tussen canvas en venster, H, mobiele schermen en `speel.html`. Bij een venster van 1440×900 en 100% tekenresolutie wordt de bitmap 1440×720: 20% minder canvaspixels. Dat bewijst geen vaste reductie van 20% in totale GPU-belasting of een overeenkomstige FPS-stijging. Meet daarvoor hetzelfde veld, dezelfde resolutie en dezelfde browser op de getroffen computer.
