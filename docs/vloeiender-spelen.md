# Vloeiender spelen en bewegende benen

[README](../README.md) · [Eerder renderherstel](renderherstel.md)

## Extra pixeldichtheid begrenzen

Een scherm met apparaatpixeldichtheid 2 laat een venster van 1280 × 800 CSS-pixels als een canvas van 2560 × 1600 pixels tekenen. Dat zijn viermaal zoveel pixels. De lokale proef op 7 november 2026 reproduceerde bij dit formaat circa 15 FPS, terwijl de JavaScript-callback maar enkele milliseconden duurde. Dit wijst in die omgeving op kosten van rasterisatie of compositing buiten de JavaScript-callback.

`RenderQuality` in `presentation.mjs` kijkt naar dertig opeenvolgende beeldintervallen. Ligt de mediaan boven 28 ms en tekent het spel op meer dan één pixel per CSS-pixel, dan begrenst het de pixeldichtheid tot 1. `resizeWorldRaster()` in `app.mjs` past alleen de canvasbitmap aan. Wereldafmetingen, scrollruimte en bouwcoördinaten blijven gelijk.

De begrenzing blijft tijdens deze paginasessie actief om voortdurend heen en weer schakelen te voorkomen. Herladen begint opnieuw met de schermpixeldichtheid, tot maximaal 2. Menuschermen en verborgen tabbladen leveren geen kwaliteitsmetingen op; een tabwissel wist de lopende meetperiode. Losse haperingen en pauzes langer dan 250 ms veroorzaken geen omschakeling. Er is geen verlaging onder één tekenpixel per CSS-pixel, behalve de reeds bestaande geheugenlimiet bij uitzonderlijk grote schermen.

Op een scherm met hoge pixeldichtheid kost dit wat extra scherpte wanneer terugschakelen nodig is. Het is geen oplossing voor iedere mogelijke oorzaak van vertraging, zoals zeer veel actieve vijanden. Druk op **F8** om FPS en het langste beeldinterval te bekijken.

## Loopanimatie

De oude renpose van Boaz en Ravi was één stilstaande afbeelding die alleen wat kantelde. Ook een eigen karakter bewoog als één samengesteld plaatje.

`drawWalkingSprite()` in `character-maker.mjs` tekent nu twee afzonderlijke beenuitsneden en het bovenlichaam. De benen bewegen tegengesteld rond de heupen; de heupen overlappen iets om naden te bedekken. Het lichaam veert licht mee en het tempo volgt de loopsnelheid. Dezelfde voorbereide tekeningen worden hergebruikt: drie afbeeldingsaanroepen per lopend karakter, zonder nieuwe canvasallocaties of pixeluitlezing per beeld.

In Stekelsprong gebruiken Boaz en Ravi hiervoor hun neutrale afbeelding; in het platformspel hun zijaanzicht. Eigen karakters houden hun kleding en accessoires; bij een jurk of lange jas begint de bewegende uitsnede onder de zoom. Springen, landen, winnen, rijden en de voorkeur voor minder beweging behouden hun eigen weergave. Er komt geen extra animatiestatus in levels, opslag of samenspelpakketten.

## Controle

De standaardtests in `character-maker.test.mjs` controleren afwisselende benen, spiegelen, constante afbeeldingsbronnen en stilhouden bij andere poses. `presentation.test.mjs` controleert de kwaliteitskeuze bij 15, 60 en 120 FPS, korte haperingen, pauzes, tabwissels en een canvas dat al op schermresolutie tekent. Deze tests draaien mee met `npm test`.

De lokale browserproef gebruikt een afzonderlijk headless Chrome-profiel, een venster van 1280 × 800 en apparaatpixeldichtheid 1 of 2. De browser is niet het apparaat of de geopende speelsessie van de gebruiker. Metingen van werkelijke beeldintervallen zijn geen garantie dat ieder beeld ook door een fysiek scherm is weergegeven. Zie de [meetgegevens](metingen/vloeiender-spelen-2026-11-07.json).

Bij de directe vergelijking tekende dezelfde actuele applicatie eenmaal met de automatische begrenzing uitgeschakeld en daarna met deze begrenzing actief. Elke situatie is na vier seconden opwarmen drie seconden gemeten, zonder gelijktijdige testsuite.

| Situatie | Mediaan beeldinterval vast 2× | Automatisch begrensd op 1× | P95 vast → automatisch |
| --- | --- | --- | --- |
| Bouwen | 66,7 ms | 16,7 ms | 100,0 → 33,4 ms |
| Spelen, stilstaan | 66,7 ms | 16,7 ms | 100,0 → 33,4 ms |
| Spelen, bewegen | 66,7 ms | 16,7 ms | 83,4 → 33,4 ms |

Het canvas veranderde van 2560 × 1600 naar 1280 × 800. De mediane JavaScript-callback tijdens bewegen veranderde van 4,0 naar 3,2 ms. De inverse van het mediane interval is geen gemiddelde FPS; de proef bevat nog steeds langere beelden. Een eerdere verkennende nameting liep tegelijk met de testsuite en was trager. Meet daarom op hetzelfde apparaat en zonder concurrerende tests voordat je conclusies voor een andere situatie trekt.

De HTTP- en offlineversie zijn met pixeldichtheid 2 gecontroleerd op laden, automatisch terugschakelen, een hoog veld, beide scrollassen en muntplaatsing. Na scrollen naar 620/300 stond het muntje correct op kolom 22, rij 14. Op beide routes kon een eigen karakter worden gekozen en lopen zonder JavaScript-excepties. De [posevergelijking](metingen/loopanimatie-2026-11-07.png) laat beide benen, spiegelen en verschillende kleding zien. Twee tegenovergestelde loopfasen geven verschillende pixels; de voorkeur voor minder beweging houdt het eigen karakter stil. De volledige suite slaagde met 354 JavaScript-tests en 114 kamertests; PHP-syntax en de offlinebuild slaagden eveneens.
