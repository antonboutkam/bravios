# Pinball

Een zilveren bal voor de 2D-platformer. Kies **Pinball** bij de personages.

- Houd rechts of links vast om de wereld maximaal 8 graden die kant op te laten hellen. De bal versnelt door de helling.
- Aan de schermrand beperkt de camera de zichtbare kanteling, zodat de bal volledig in beeld blijft.
- Laat los om de wereld weer recht te zetten. De bal rolt uit. Stuur tegen om af te remmen en terug te rollen.
- Spring met de gewone springknop. Pinball heeft geen parachute; de renknop verandert zijn rolsnelheid niet.
- In co-op delen beide spelers dezelfde kanteling. Alleen Pinball bestuurt de helling. Met twee Pinballs wordt hun invoer gemiddeld; tegengestelde richtingen heffen elkaar op.
- Tijdens rijden, kattenvorm, raketvlucht en slingeren gelden de bestaande bewegingen. Bij **minder beweging** blijft het beeld recht, met dezelfde rolbesturing.

De natuurkunde en de ronde Canvas-tekening staan in `../../../engine/pinball.mjs`. De botsingsvorm is een vierkant van 24 × 24 spelpixels. Alle spelobjecten draaien visueel mee; de levensbalken en knoppen blijven recht. Het personage is beschikbaar in 2D, zonder 3D-model.

`ball.svg` is de bewerkbare bron van het portret. Genereer de PNG opnieuw met ImageMagick vanuit de projectmap:

```sh
convert -background none public_html/gameplay/characters/pinball/ball.svg PNG32:public_html/gameplay/characters/pinball/images/ball.png
npm run build
```
