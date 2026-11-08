# Directere reactie op de bediening

[README](../README.md) · [Spelhandleiding](spelhandleiding.md#directere-besturing) · [Gerichte tests](../public_html/tests/input-response.test.mjs) · [Browsermetingen](metingen/invoerreactie-2026-11-06.json)

De gebruiker meldde lokaal in Chrome ongeveer 0,3–0,5 seconde vertraging bij de eerste speler. Die volledige vertraging is in de lokale browserproef niet gereproduceerd. Wel bleken optrekken, afremmen, omkeren en de camera een merkbare aanlooptijd te hebben. Ook kon een heel korte richtingstoets volledig tussen twee simulatiestappen vallen.

## Wijzigingen

- Op volle loopsnelheid komen gaat op de grond van circa 100 naar 25 ms simulatietijd. Bij de vaste 120-Hz-simulatie is dat drie stappen. De topsnelheid blijft 220 spelpixels per seconde.
- Omkeren begint in de eerstvolgende stap aan de gewenste kant. De speler remt niet eerst ongeveer 100 ms in de oude richting af.
- Loslaten remt op de grond binnen 25 ms. Onder water, op glijhellingen, op rijdieren en tijdens de extra snelle fase na het loslaten van een liaan blijft de bestaande bewegingsafhandeling gelden.
- Een korte druk op links/rechts wordt bewaard tot de volgende simulatiestap. De laatste van twee tegengestelde drukranden heeft voorrang in die buffer. De bestaande toestand van ingedrukte toetsen blijft daarnaast gelden.
- De camera sluit sneller aan: in de gerichte proef is binnen 150 ms meer dan 90% van de afstand tot een vaste doelpositie afgelegd. Grenzen, teleportaties en minder beweging houden hun bestaande afhandeling.

De eventhandlers werken de invoer direct bij. De simulatie blijft een vaste tijdstap gebruiken; er worden geen extra physicsstappen uitgevoerd vanuit toetsenbord- of pointerhandlers. Dat voorkomt een verschil in spelsnelheid door het aantal invoergebeurtenissen. Netwerkpolling van een tweede speler is niet aangepast.

## Controles en grenzen

De automatische tests controleren beginnen, omkeren op de grond en in de lucht, stoppen, topsnelheid, bijzondere beweging, beide spelers, snapshots en camerareactie. De gewone campagne blijft met de echte engine doorgelopen worden. De vaste sprongcadans van twee routeproeven is aangepast aan de snellere acceleratie; de eis dat de finish werkelijk wordt gehaald blijft gelijk.

In lokale Chrome zijn pijltjestoetsen via het DevTools Protocol ingevoerd en is de positie gemeten waarmee de speler aan de tekenlaag wordt aangeboden. Dat meet de reactie na browserontvangst, niet de tijd van een fysieke toetsdruk tot zichtbaar licht op het scherm. Ook eventuele vertraging in het besturingssysteem, de GPU of het scherm is daarmee niet volledig gemeten.

Daarnaast zijn in één JavaScript-taak een druk en loslating aangeboden, zodat ze gegarandeerd vóór de volgende simulatiestap vallen. Zowel de HTTP-versie als de vernieuwde `speel.html` reageren met een kleine stap naar rechts of links. Na loslaten blijft de speler staan; een druk tijdens pauze veroorzaakt na hervatten geen onverwachte beweging. De aanraakknoppen zijn langs dezelfde eventafhandeling gecontroleerd.

Deze wijziging maakt de besturing directer. Zij bewijst niet dat op ieder apparaat de gemelde vertraging van een halve seconde is verdwenen. Voor vervolgonderzoek moeten het concrete veld en de invoer- en frametijden op dat apparaat worden vastgelegd.
