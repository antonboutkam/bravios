# Stekelsprong

[README](../README.md) · [Spelhandleiding](spelhandleiding.md)

Open **Kleine games → Stekelsprong**, of **Stekelsprong · samen** voor twee spelers op één scherm.

- Speler 1 springt met spatie of de eigen springknop. De controller bedient speler 1 met A / kruisje.
- Speler 2 springt met ↑, Y / driehoek op dezelfde controller, A / kruisje op een tweede controller, of de eigen springknop. Je kunt ook op de linker- of rechterhelft van het speelveld tikken.
- De camera staat stil. De spelers staan in het midden van een rij van acht monsters en springen recht omhoog. Iedereen blijft binnen het speelveld.
- Stekelballen rollen van links naar rechts. De eerste minuut blijft het ritme gelijk; daarna nemen snelheid en frequentie geleidelijk toe.
- Vanaf ongeveer 75 seconden missen de monsters één voor één hun sprong. Ze verdwijnen alleen na een botsing. De laatste valt rond drie minuten af.
- Je wint zodra alle monsters af zijn en minstens één speler over is. Als alle spelers geraakt zijn, is de ronde afgelopen. Een afgevallen speler blijft af; de andere mag doorspelen.
- **Pauze**, P of Start / Options onderbreekt de ronde. Een tabwissel of verlies van vensterfocus pauzeert ook. Kies **Verder** om door te spelen.

De naar voren kijkende loopanimatie blijft in deze minigame behouden. In het platformspel gebruiken Boaz en Ravi weer hun zijaanzicht. De minigame hergebruikt de bestaande afbeeldingen en een speelveld met verhouding 800 × 440. De canvasresolutie schaalt mee met het beschikbare scherm en de pixeldichtheid (maximaal 2×).

## Code en controles

`games/rhythm/` bevat de sessie, spelregels en weergave. `games/shell.mjs` verbindt het spel met het menu, toetsenbord, aanraakknoppen en controller. De oude modulepaden blijven als compatibiliteitsingang bestaan. Zie [spelpakketten](spelpakketten.md). De module staat in de serverlijst en offlinebuild.

De standaardtests in `small-games.test.mjs` spelen volledige rondes bij 60 en 20 updates per seconde, solo en samen. Ze controleren het oplopende tempo, vaste posities, onafhankelijke sprongen, pauze, verliezen, winst en doorspelen na het afvallen van één speler. De monsters gaan in deze proeven stuk voor stuk af en een correct springende speler kan de complete ronde overleven.

Het menu, solo/samen, beide springtoetsen, pauze en opnieuw spelen zijn in lokale headless Chrome gecontroleerd op HTTP en in `speel.html`, zonder JavaScript-excepties. Dit is lokale browsercontrole, geen meting op het apparaat van de gebruiker.

De fullscreen- en controlleruitbreiding heeft aanvullende tests in `small-games-ui.test.mjs` (onderdeel van `npm test`). Een kleine DOM-adapter controleert de echte menu- en invoerhandlers, twee spelers, pauze, opnieuw spelen, fullscreenweigering en canvasafmetingen. `gamepad.test.mjs` controleert afzonderlijke controllers en ontkoppelen. De uitbreiding is nog niet visueel in de browser of met een fysieke controller gecontroleerd: de browserverbinding faalde vóór paginabediening.
