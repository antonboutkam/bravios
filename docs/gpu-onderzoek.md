# Onderzoek: kan Bravios meer werk op de GPU uitvoeren?

[ProjectREADME](../README.md) · [Architectuur](architectuur.md) · [Meetgegevens](metingen/gpu-runtime-2026-11-05.json) · [Herhaalbare browserproef](metingen/gpu-runtime-probe.js)

Onderzocht op 5 november 2026. De spelruntime is voor dit onderzoek niet gewijzigd.

## Advies

**Ja: vooral tegel-, sprite- en effectweergave kan naar een expliciete GPU-renderer. Begin voor vloeiender spelen met de gevonden CPU-verspilling en een kleiner tekenoppervlak.** Een GPU-renderer neemt de huidige spelberekeningen niet over. De lokale stresstest toont een concreet knelpunt in die berekeningen.

Een passende vervolgstap is eerst de waterstromingcontrole optimaliseren, daarna de camera en het tekenoppervlak scheiden. Bouw vervolgens alleen bij een resterend tekenknelpunt een beperkte WebGL2-proef voor terrein en sprites, met Canvas 2D als terugval. Een volledige WebGPU-engine is voor de huidige codebasis een grote stap zonder nu aangetoonde noodzaak.

## Wat gebeurt er nu?

De hoofdcanvas wordt in [app.mjs](../public_html/app.mjs) met `getContext('2d')` geopend. De browser kan Canvas 2D al via hardware versnellen; er is geen instelling die ook JavaScript-spelregels automatisch naar de GPU verplaatst. De `willReadFrequently: true`-optie is bedoeld voor pixelteruglezing en kan software-rendering kiezen. In dit project staat die optie op tijdelijke afbeeldingen voor het voorbereiden van sprites en terrein, niet op de hoofdcanvas. Die opties blind verwijderen is dus geen onderbouwde runtime-optimalisatie. Zie [de Canvas-contextopties](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext) en [Chrome over Canvas 2D en pixelteruglezing](https://developer.chrome.com/blog/canvas2d/).

`animate` in `app.mjs` voert fysica uit op 120 stappen per seconde en tekent via `requestAnimationFrame`. Bij 60 beelden per seconde zijn dat normaal twee simulatiestappen per beeld. Invoer, HUD, geluid, effecten en tekenen delen de hoofdthread. [engine.mjs](../public_html/engine.mjs) verwerkt onder meer botsingen en vijanden; [art.mjs](../public_html/art.mjs) tekent de wereld.

Er bestaan al optimalisaties: tekenen van zichtbare kolommen en entiteiten, spritecaches, begrensde HUD-updates en een bitmaplimiet. [worldRenderResolution](../public_html/presentation.mjs) begrenst het tekenoppervlak tot 8192 pixels per zijde en 8 × 1024 × 1024 pixels totaal. Toch is de bitmap nog gebaseerd op de hele wereld. Het maanveld van 264 × 32 blokjes gebruikt bijvoorbeeld 8192 × 992 pixels. Horizontale zichtbaarheid wordt doorgegeven; verticale zichtbaarheid wordt in `drawWorld` nog niet als algemene rijbegrenzing benut.

## Wat is gemeten en wat niet?

De meting draait lokaal in headless Chrome 157.0.8103.38. Chrome rapporteert **SwiftShader**, `2d_canvas: unavailable_software` en `gpu_compositing: disabled_software`. Dit is geen fysieke GPU-meting en zegt niet dat hardwareversnelling bij de gebruiker uit staat. Een beschikbare WebGL- of WebGPU-API bewijst evenmin dat die hardware gebruikt.

Er zijn geen GPU-shaders of nieuwe renderer gebouwd. Er is dus geen bewezen GPU-versnellingsfactor. Wel zijn broncode, CPU-tijd, Canvas-aanroepen, bitmapafmetingen en een tijdelijke CPU-optimalisatie onderzocht. De onbewerkte resultaten staan in het [JSON-bestand](metingen/gpu-runtime-2026-11-05.json).

Per scène zijn na 15 tekenrondes 60 rondes gemeten, met twee simulatiestappen per ronde. De afgebeelde breedte is 640 spelpixels, met de bestaande marge voor objecten buiten beeld. Assets zijn vooraf geladen. De tekenkolom meet JavaScript plus het indienen van Canvas-opdrachten: geen voltooide rasterisatie, compositing, invoervertraging of gemeten scherm-FPS. De cijfers zijn medians van deze lokale proef en variëren met opwarming en belasting.

| Scène | Simulatie per 2 stappen | Tekenen indienen |
| --- | --- | --- |
| Regulier veld 1, 1 vijand | 0,30 ms | 2,40 ms |
| Avonturiers-maanveld, 10 vijanden | 1,20 ms | 1,50 ms |
| Wonderland veld 1, 5 vijanden, met campagne-initialisatie | 0,60 ms | 4,50 ms |
| Kunstmatig stressveld, 1.100 robots | 48,10 ms | 7,20 ms |

Wonderland is afzonderlijk gemeten met `prepareWonderlandGame`, zodat magie en tegenstanders aanwezig zijn. De oorspronkelijke twee basislevel-rijen in het JSON-bestand missen die initialisatie en dienen niet als campagnebewijs. De andere scènes gebruiken de wereldbitmap. Voor kleine meetwaarden is de klokresolutie relevant; een gemeten 0 ms betekent niet dat de functie gratis is.

De bestaande [performanceproef](../public_html/tests/performance.html) is ook uitgevoerd: ongeveer 5.280 Canvas-methodeaanroepen voor het hele robotveld tegenover 1.224 voor het zichtbare deel. Dat zijn Canvas-aanroepen, geen getelde GPU-drawcalls. Ze tonen vooral waarom de bestaande beperking tot zichtbare objecten nuttig is.

## Concreet CPU-knelpunt: waterstroming

In de vijandenlus in `stepGame` wordt voor vrijwel elke vijand `seaCurrent` aangeroepen. [seaCurrent in sea-life.mjs](../public_html/sea-life.mjs) doorloopt vervolgens de volledige vijandenlijst om actieve geisers te vinden. Dat gebeurt ook op droge velden zonder geisers.

Met 1.100 robots zijn er **1.101 aanroepen en 1.211.100 lijstbezoeken per simulatiestap**: één aanroep voor de speler plus één per robot. Dit deel groeit kwadratisch met het aantal vijanden. Een CPU-profiel bevestigt dat in de stresssituatie vooral `stepGame`, vijandupdates en botsingen tijd kosten; inlining kan de onderliggende stromingcontrole aan `stepGame` toeschrijven.

Een tijdelijke module in het browsergeheugen controleert eenmaal per simulatiestap of er überhaupt geisers zijn. Zonder geisers slaat die variant de herhaalde controles over. De productiebronbestanden blijven gelijk. Voor een eerlijke vergelijking is een verse pagina gebruikt: beide modules zijn vooraf opgewarmd, vijf batches van elk 30 stappen zijn afwisselend uitgevoerd. De iteratorinstrumentatie voor het tellen is pas daarna toegepast, zodat zij de timingvergelijking niet beïnvloedt.

| Robots | Origineel per stap | Tijdelijke variant per stap |
| --- | --- | --- |
| 100 | 1.61 ms | 1.51 ms |
| 300 | 2.56 ms | 2.38 ms |
| 600 | 5.82 ms | 4.71 ms |
| 1100 | 20.28 ms | 6.63 ms |

Bij 1.100 robots is dat ongeveer **3,1 keer sneller simuleren in deze proef**, zonder GPU. Na 120 stappen is de genormaliseerde spelstand van beide varianten gelijk. Dit is alleen bewijs voor dit droge robotveld. Geisers, waterdieren, grotreizen, samenspel en andere situaties zijn niet met deze variant als volledige regressie gecontroleerd; zij is niet ingebouwd of vrijgegeven als oplossing.

Deze afzonderlijke batchmeting gebruikt een ander meetprotocol dan de tabel met twee stappen per beeld; vergelijk de varianten binnen dezelfde rij. Bij 60 FPS is er ongeveer 16,7 ms voor een heel beeld beschikbaar. Alleen sneller tekenen kan een simulatie die daar al overheen gaat niet oplossen.

## Welke onderdelen kunnen naar de GPU?

| Onderdeel | Haalbaarheid en oordeel |
| --- | --- |
| Terrein en herhaalde sprites | Beste eerste GPU-proef: afbeeldingen één keer als textures uploaden en veel rechthoeken in groepen tekenen |
| Licht, water, gloed en kleureffecten | Geschikt voor shaders wanneer die effecten een gemeten knelpunt vormen |
| Deeltjes | Technisch geschikt; de huidige presentatie begrenst deeltjes op 180, dus een aparte compute-engine is nu geen duidelijke prioriteit |
| Botsingen, platformregels, vijandgedrag en lianen | Technisch deels te paralleliseren, maar sterk verweven met gedeelde toestand, volgorde en spelgebeurtenissen; voor dit project een ongunstige eerste migratie |
| DOM, HUD, opslag en kamercommunicatie | Blijven CPU-/browserwerk |
| Worker met OffscreenCanvas | Kan werk van de hoofdthread halen; een worker is CPU-werk en op zichzelf geen GPU-versnelling |

Een WebGL2-renderer kan de bestaande spritevellen gebruiken, aangevuld met vooraf getekende plaatjes voor Canvas-figuren. Bundel sprites per texture en laag, met behoud van transparantie en tekenvolgorde. Gebruik cameracoördinaten als shader-invoer. Het doel is minder JavaScript-tekenaanroepen en efficiënte rasterisatie; niet per frame het hele Canvas-resultaat opnieuw als texture uploaden. [MDN beschrijft batching en texture-atlassen](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices).

De huidige tekenfuncties gebruiken veel Canvas-vormen, gradients, tekst, clipping en samengestelde personages. Die werken niet rechtstreeks als WebGL-code. Een rendererkeuze moet bovendien plaatsvinden vóór `getContext('2d')`, of aparte canvassen gebruiken: één canvas kan niet achteraf tegelijk een 2D- en WebGL-context krijgen. Dat maakt dit een architectuurwijziging, geen losse GPU-schakelaar.

WebGPU ondersteunt ook compute-shaders, maar vereist een secure context en heeft nog geen universele browserbeschikbaarheid. De HTTP-hostnaam uit de bestaande spelhandleiding voldoet op zichzelf niet aan de secure-contextvoorwaarde; localhost is een bijzondere lokale uitzondering. HTTPS, browserondersteuning en een daadwerkelijk beschikbare adapter moeten worden gecontroleerd. De zelfstandige `speel.html` moet apart worden getest. Zie [WebGPU](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) en [secure contexts](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Secure_Contexts).

Een workerroute vraagt ook aanpassing: `app.mjs` benadert veel DOM-elementen en het tekenwerk maakt op verschillende plaatsen document-canvassen aan. Verplaats gerichte verantwoordelijkheden en stuur compacte invoer en weergavegegevens, niet voortdurend de volledige wereld. [OffscreenCanvas kan aan een worker worden overgedragen](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas).

## Aanbevolen volgorde en bewijs voor een vervolgstap

1. **CPU-verspilling aanpakken.** Cache of indexeer de geisers per gedeelde simulatiestap. Behoud correcte actualisatie bij grot- en wereldwissels en de enkele wereldklok in samenspel. Controleer ook herhaalde scans in `meetCaves`, `pipeConnections` en tegelvergelijking in `SceneEffects.observe`. Het profiel bewijst niet dat al deze scans even belangrijk zijn.
2. **Tekenoppervlak op de camera afstemmen.** Houd wereldgrootte, bouwer-scrollgebied en canvasbitmap apart. Voeg verticale uitsluiting en waar zinvol gecachte terrein-/achtergrondstukken toe. De formaatproef geeft voor het maanveld circa 8,1 miljoen tegenover 0,31 miljoen bitmappixels bij dezelfde bestaande schaal. Dat is een geheugensignaal, geen bewezen FPS-winst; de proef is geen volledige camera-implementatie of visuele equivalentietest.
3. **Meten op het doelapparaat.** Controleer `chrome://gpu`, neem meerdere Performance-opnames van dezelfde speelroute en vergelijk kleine velden, grote maanvelden, water, Wonderland, lianen/donuts en samenspel. Meet frameverdeling, langzame frames, inputvertraging, simulatie, rasterisatie/compositing en geheugengebruik. Houd venster, zoom en tekenresolutie gelijk; meet laden apart.
4. **Alleen bij een resterend tekenknelpunt: beperkte WebGL2-proef.** Begin met terrein en herhaalde sprites. Behoud Canvas 2D als terugval. Vergelijk beeldkwaliteit, geheugen en frametijden op een echte GPU. Test contextverlies, venstergrootte, camera, raakbediening, samenspel en `speel.html`. Laat de bestaande engine en levelbestanden de spelregels blijven bepalen.

Voor 60 FPS is 16,7 ms per beeld het totale budget, niet alleen het tekenbudget. Een proef is pas een verbetering als zij op dezelfde hardware en bij dezelfde beeldkwaliteit een betere frameverdeling geeft zonder spel- of bedieningsregressie. Een eenvoudige CPU-correctie is veel kleiner werk dan de complete tekenlaag opnieuw bouwen.

## De meting herhalen

Start vanuit de projectroot `npm run start:network` en open `http://localhost:8080/tests/performance.html`. De PHP-server is hier nodig omdat de bestaande Node-server deze oude proefpagina niet in zijn expliciete bestandenlijst heeft staan. Open DevTools → Sources → Snippets, plak de inhoud van [gpu-runtime-probe.js](metingen/gpu-runtime-probe.js) en voer die uit nadat de pagina klaar is.

Het resultaat staat in `globalThis.braviosGpuReport`. In de Chrome-console kun je het met `copy(JSON.stringify(braviosGpuReport, null, 2))` kopiëren. Dit is een ontwikkelproef die tijdelijk zware berekeningen uitvoert. De tijdelijke engine is alleen een Blob-module in het geheugen; herladen verwijdert die. Opgeslagen levels en runtimebestanden worden niet aangepast. De CPU-profielgegevens in het JSON-bestand zijn aanvullend met het Chrome DevTools Protocol verzameld; die profiler maakt geen onderdeel uit van het snippet.
