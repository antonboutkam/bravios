# Bravios

[Terug naar de projectREADME](../README.md) · [Architectuur](architectuur.md) · [Studentopdrachten](opdrachten/README.md)

Bestandspaden in deze handleiding zijn relatief aan de projectroot, tenzij anders vermeld.

Een Nederlandse platformgame en levelbouwer voor samen spelen, geïnspireerd op klassieke Mario-spellen. Boaz, Ravi en het logo komen uit de meegeleverde assets. De andere graphics en geluiden zijn zelfgemaakt. Geen account, bibliotheken of externe bestanden nodig.

## Meteen spelen

Open **http://mariomaker.nuidev.nl** op de ontwikkelserver, of **public_html/speel.html** in Chrome, Edge, Firefox of Safari. Het HTML-bestand bevat het hele spel inclusief de plaatjes en werkt ook zonder internet. Je kunt het bestand kopiëren naar een andere computer.

Kies Boaz of Ravi via het portretje naast de speelknop of in het menu **☰**. Je keuze wordt op dit apparaat bewaard.

1. Sleep een onderdeel uit de bouwdoos naar het veld, of kies een onderdeel en klik/veeg om te bouwen.
2. Gebruik de gum om blokjes te verwijderen. Een getekende lijn kun je in één keer ongedaan maken.
3. Zet een startplek en een finishvlag neer. Nieuwe levels hebben deze al.
4. Klik **Speel je level**. Speel om de beurt en probeer elkaars levels!
5. Klik **Bewaar level** om een kopie in **Mijn levels** te zetten. **Download level** maakt een JSON-bestand dat je elders kunt openen.

Het bouwveld vult het hele venster. De compacte werkbalk en bouwonderdelen liggen boven op het veld. Met **H** of het pijltje rechtsboven verberg of toon je de bediening. De knop **Volledig scherm** verbergt ook de browserbalken.

Met de schuifbalk linksonder of het muiswiel ga je naar de rest van je wereld. In speelmodus volgt het beeld automatisch de speler en verdwijnt de bouwdoos. Via **☰** kies je tussen de accordeons **Spelen**, **Bouwen · de spelmaker** en **Instellingen en uitleg**. Onder Spelen hebben het reguliere en gekke spel ieder tien aanklikbare veldkaarten met een afbeelding. Onder **Bouwen → Nieuw veld maken** kies je direct naam, omgeving, breedte en hoogte. Je huidige veld aanpassen, bewaren en voorbeelden openen staan in aparte onderdelen.

## Bravios in Wonderland

Kies **Bravios in Wonderland** op het startscherm of **☰ → Bravios in Wonderland → Naar Wonderland**. De meegeleverde illustratie vormt de kaart. Kies een licht rondje en daarna **Ga het veld in**. Pijltjes, WASD en controller werken ook. De vijftien velden hebben eigen voortgang, die automatisch op dit apparaat wordt bewaard. Na de finish kies je **Verder door Wonderland**. Ook vanuit pauze kun je terug naar de kaart.

De reis loopt door het **Paddenstoelenrijk**, het **Schaakkasteel**, de **Droomzee** en het **Regenboogkristalkasteel**. Na het eerste veld kies je tussen een kleine tunnel en een reuzentuin. De routes komen bij een kasteel samen. Later kies je tussen schaakstukken en plafondzwaartekracht, en tussen een kristalwand en kleurenbrug. Elk veld heeft vier kleine vijanden en een grote eindbaas uit het [bossenpakket](../assets/wonderland/bosses/README.md). Lees bij de arena de korte aanwijzing, ontwijk de aangekondigde aanval en gebruik de zwakke plek. Springen en de puzzelknoppen volstaan; de vuurbloem bij de arena is een extra hulpmiddel (**F / X** of de vuurknop). De eerste zeven bazen ontsnappen en keren in velden 8–14 terug. In veld 15 verandert Wobbleflap na zeven treffers in een wit konijn.

- Blauwe en roze paddenstoelen maken je twaalf seconden klein of groot. Alleen klein pas je onder het lage tunneldak; groot duw je de zware steen vooruit. Als je bij afloop niet veilig kunt groeien, keer je met je gewone maat terug naar de start.
- Paarse portalen teleporteren je. De spiegel wisselt links en rechts zes seconden om. De statusbalk toont het effect en de resterende tijd.
- Pijlkristallen trekken je acht seconden naar het plafond of naar rechts. Links/rechts beweegt langs het oppervlak; springen laat je loskomen. Een pijl omlaag herstelt gewone zwaartekracht. De speler draait zichtbaar mee.
- De gele schakelaar verplaatst het schaakpad. Raak rode, gele en blauwe kristallen in die volgorde aan om de regenboogbrug en doorgang te openen. Een verkeerde kleur begint de reeks opnieuw; de kristallen blijven bereikbaar. Bij de kleurenbrug maakt de groene stand de platforms vast.
- Zwevende bloemenplanken bewegen in een achtvorm en dragen de speler. Sommige paddenstoelenbruggen verschijnen en verdwijnen; de veilige vloer blijft bereikbaar.

Lichtblauwe gestippelde verbindingen zijn bootroutes. De boot vaart automatisch naar de gekozen plek. Na **De verloren boot** opent een draaikolk naar een geheim droomeiland met een droomster als eerste voltooiingsbeloning; er is altijd een terugroute. Na de haven verplaatst het schaakkasteel zich. Na de schaakschakelaar verschijnt een extra bloemenpad; na het schaakkasteel kun je met **Zwaai naar…** tussen drie geopende paden reizen. De bestemming verandert met de zwaai en staat op de knop. Bestaande routes blijven bruikbaar. De kaart en spelachtergronden bevatten spiralen, zwevende eilanden, kastelen en opwaartse watervallen. De animaties respecteren de instelling voor minder beweging.

Alle vijftien speelvelden zijn 192 blokjes lang (drie keer de oorspronkelijke lengte) en 20 blokjes hoog. De veldindeling staat in [assets/wonderland/levels.md](../assets/wonderland/levels.md), naast de oorspronkelijke [specificatie](../assets/wonderland/specs.md). `public_html/wonderland.mjs` verzorgt velden, routes en voortgang; `wonderland-map.mjs` de kaart; `wonder-magic.mjs` de campagneobjecten, effecten en achtergronden. De toverobjecten worden zonder achtergrondvlak getekend: bijvoorbeeld het zware schaakstuk in **De reuzentuin** staat vrij voor het landschap, met een lichte gloed. Wonderland is een lokaal avontuur voor één speler. De bijzondere objecten horen bij deze campagne en zijn geen nieuwe bouwdoostegels of kamervelden. De modules en kaartillustratie zijn opgenomen in de lokale server en de zelfstandige `speel.html`-build.

`wonder-foes.mjs` bevat de acht personages, kleine varianten, baasfasen, puzzelplaten en ontsnappingen; `wonder-foe-art.mjs` tekent hun verschillende silhouetten zonder achtergrondvlakken. Bekijk de [kijk- en speelproef](../public_html/tests/wonder-foes.html) voor alle acht grote figuren, twaalf kleine varianten, grijstinten en een bestuurbaar gevecht. De concrete verdeling en aangepaste spelregels staan bij de [velden](../assets/wonderland/levels.md#vijanden-en-eindbazen).

`npm test` neemt `public_html/tests/wonder-foes.test.mjs` mee voor twee formaten, variantdiversiteit, aangekondigde aanvallen, alle vijftien gevechten, bereikbare springdoelen, solo-platen, snapshots en de geblokkeerde finish. `public_html/tests/wonderland.test.mjs` controleert: ontgrendelen, heen- en terugroutes, onafhankelijke opslag, alle vijftien speelroutes met echte botsingen, tijdelijke effecten, lage tunnel, zware steen, meebewegende platforms, kristalvolgorde en het eindbaasgevecht.

## Eigen werelden maken

Open **☰ → Mijn werelden → Maak een wereld**, of kies **Bouw een wereld** op het startscherm. Geef je wereld een naam. Met **Velden tekenen** klik je op een lege plek om een rondje te plaatsen; **Veld toevoegen** werkt ook met het toetsenbord. Klik op een rondje en kies naam, omgeving, breedte (20–360 blokjes) en hoogte (16–64). Klik **Instellingen bewaren** en daarna **Veld inrichten** om het veld in de bestaande levelbouwer te bouwen. Met **Wereldkaart** keer je terug. Je losse bouwveld blijft daarbij behouden.

Met **Verbinden** klik je op twee rondjes of trek je een lijn van het ene naar het andere. Dezelfde verbinding nogmaals maken haalt de lijn weg. **Verplaatsen** laat je de rondjes verslepen. Een veld verwijderen haalt ook zijn verbindingen weg. Bijvoorbeeld: plaats een groen veld links en een kasteel rechts, stel beide in en verbind de twee rondjes. Nieuwe kasteelvelden krijgen meteen een stenen vloer en plafond.

In de dropdown **Mijn werelden** kies je welke wereld je wilt bewerken of spelen. In **Spelen** kies je een ingericht veld en klik je **Speel dit veld**. Alle ingerichte velden zijn vrij te kiezen; de lijnen tonen je routes. Na de finish kun je terug naar de kaart en krijgt het veld een vinkje. Werelden, kaarten en bouwwerken worden automatisch in deze browser opgeslagen. **Download wereld** bewaart de hele wereld inclusief alle velden als JSON; **Open wereldbestand** opent een nieuwe kopie. Er passen maximaal 20 werelden met elk 40 velden in de collectie; de beschikbare browseropslag kan eerder vol raken.

De gegevens en validatie staan in `public_html/worlds.mjs`; kaartbediening en veldinstellingen in `public_html/world-editor.mjs`. `app.mjs` koppelt de wereldvelden aan de bouwer, bewaart ze samen met de bestaande collectie en herstelt het losse bouwveld bij terugkeer. De modules staan ook in de lokale server en de zelfstandige `speel.html`-build. `npm test` neemt `public_html/tests/world-editor.test.mjs` mee voor verbindingen, opslag, onafhankelijke veldkopieën, afmetingen, verwijderen en oude of beschadigde opslag.

## Onderwaterleven en de lichtgevende diepzee

Open **Onderwaterleven ▾** in de bouwdoos voor de walvis, kwalletjes, skeletvis, inktvis, dolfijn, zeepaardje, giftige waterplant, geiser, platvis, murene, boze zeester en krab. Kies **Onder water** of **Onder water bij nacht** als omgeving. In de nacht zijn het water en de bodem donker en de dieren veel lichter. Campagneveld 4 (De blauwe baai) en veld 8 (De lichtgevende diepzee) bevatten de nieuwe soorten. Opgeslagen eigen velden worden niet automatisch veranderd.

- De walvis opent elke 15 seconden zijn bek, gedurende 5 seconden. Vier roofvisjes zwemmen maximaal ongeveer drie blokjes bij zijn bek vandaan. Ze richten zich op spelers in de buurt en bijten bij aanraking.
- Kwallen zwemmen rustig schuin omhoog en even ver omlaag; na 1–5 slagen veranderen ze van richting. Skeletvissen achtervolgen langzaam met lichtgevende ogen als niemand naar ze kijkt. Zodra een speler kijkt, vallen hun losse graten naar de bodem en zijn ze ongevaarlijk.
- Inktvissen maken bij nadering een plaatselijke inktwolk die binnen 10 seconden oplost. Platvissen verstoppen zich op de bodem en springen op bij nadering. Murenen komen elke 25 seconden kort uit hun kruik, of zodra je dichtbij komt; hun staart blijft vastzitten.
- Giftige waterplanten rollen hun slierten op en uit. Geisers blazen elke 6 seconden gedurende 3 seconden water en bellen omhoog, en nemen spelers en losse vijanden mee. Zeesterren zwemmen met sliertjes; krabben lopen over de bodem.

Stap met **R / ↓** op een dolfijn of zeepaardje, of land op zijn rug. Gebruik links/rechts om te sturen, **springen** om te stijgen en **S** (op tablet: de buisknop) om te dalen. Zonder verticale invoer blijf je op hoogte. De dolfijn is het snelst; het zeepaardje kan met **F / X** (vuurknop) nabije losse vijanden wegblazen. **R / ↓** laat je afstappen.

De dieren, timers, rijdieren en inkt werken ook in samenspel; pauzeren stopt de timers. `tests/sea-life.html` biedt een bewegende kijkproef met dag/nacht, nabijheid, kijkrichting en een tijdsprong. `npm test` controleert ook de gedragingen, opslag, kamervalidatie en gedeelde spelstanden.

## P-schakelaar

Kies **Mechanieken → P-schakelaar**. Het blok heeft een blauwe halve cirkel met een witte P. Land erop om de knop in te drukken. Gedurende 30 seconden veranderen vaste grond-, rots-, platform- en vraagblokken in muntjes; bestaande muntjes worden breekbare bakstenen. Ook hellingen en wolkenblokken doen mee. Buizen, bewegende mechanismen en de schakelaar blijven staan.

De klok toont hoeveel seconden over zijn. Daarna krijgen overgebleven onderdelen hun oorspronkelijke vorm terug; verzamelde muntjes en kapotgemaakte tijdelijke bakstenen blijven weg. Elke schakelaar werkt één keer per spel; een tweede schakelaar kan na afloop een nieuwe ronde starten. Pauzeren stopt de timer. Dit werkt ook in samenspel en de timer loopt door wanneer je een grot bezoekt.

## Bijzondere rotsen en grotten

Bij **Grotten en sleutels** staat **Grot · verborgen rots**: dezelfde steenstructuur als het rotsblok, met alleen een subtiele naad tijdens het spelen. Loop ertegenaan om de donkere grot binnen te gaan. De ontwerptool toont een kleine ingang met een vraagteken.

Bij **Grond en blokken** staan **Rotsblok · instortend** en twee **Rotshellingen**. De instortende steen begint te trillen zodra je erop landt en breekt na 0,22 seconde; hij blijft weg tot je opnieuw start. De pijl omlaag verschijnt alleen tijdens het ontwerpen. De hellingen lopen 45 graden naar links of rechts omlaag en laten je vanzelf glijden. Leg meerdere hellingen diagonaal tegen elkaar voor een langere glijbaan. Springen blijft mogelijk. Deze onderdelen werken ook in samenspel en opgeslagen levels.

## Het reguliere spel

Via **☰ → Speel de groene start ▶** kun je direct het eerste veld spelen. Dit veld is de visuele referentie voor de modernisering: de groene wereld heeft meerdere achtergrondlagen die op verschillende snelheden meebewegen, bomen, een verre waterval, bloemen en rijkere grasranden. Deze groene sfeer wordt ook gebruikt in je eigen levels met **Groene heuvels**.

Boaz en Ravi gebruiken de nieuwe illustraties uit hun posevellen: stilstaan, lopen, springen, landen en winnen hebben eigen houdingen. De loopstand heeft een subtiele beweging; voor een volledige loopcyclus zijn meer tussenframes nodig. De camera volgt geleidelijk en kijkt iets vooruit in je looprichting. Na een grote verplaatsing, zoals een buisreis of respawn, springt de camera direct mee. Muntjes schitteren bij verzamelen, kapotte blokken geven brokstukken en lopen en landen geven stof. De effecten staan los van de spelregels en worden niet opgeslagen of meegestuurd met kamers. Pauze bevriest ze; opnieuw starten ruimt ze op. De nieuwe animaties en effecten respecteren **minder beweging** in de apparaatinstellingen.

Het menu heeft een speelkaart voor het eerste veld en de statusweergave heeft meer contrast. De andere sferen, geluiden en kamerverbinding zijn in deze eerste stap behouden. Bestaande levels en de levelbouwer blijven bruikbaar.

## Het gekke spel

Kies **☰ → Speel het gekke spel ▶** voor tien extra velden met eigen voortgang. Via **Kies een van de 10 gekke velden** speel je een veld los. Na de finish ga je met **Volgend veld** verder. Je bouwveld en de voortgang van het reguliere spel blijven bewaard.

Vijf velden lopen van boven naar beneden, met verdiepingen die afwisselend links en rechts een opening hebben. Spring over de buizen en kruis de verdieping om verder af te dalen. Drie velden lopen van rechts naar links; twee lopen naar rechts. Elk veld bevat minstens vijftien buisblokken, waaronder gekoppelde reisbuizen. Ga bovenop een ingang of tweerichtingsbuis staan en druk **↓ / S**. De camera volgt ook de verticale afdaling.

Vier vreemde achtergrondafbeeldingen tonen zwevende theepotten, snoepland met vliegende vissen, een klokkenheelal en kwallen met huizen. De achtergrond vult ook bij hoge velden het zichtbare scherm. Het atlasbestand staat in `public_html/assets/look/crazy-backgrounds.png`; de exacte prompt voor de ingebouwde imagegen-tool staat in `public_html/assets/look/crazy-backgrounds-prompt.md`.

### Automatische parachute

Boaz en Ravi hebben nu standaard een parachute. Zodra ze tijdens één afdaling **meer dan drie blokjes (96 spelpixels)** zijn gevallen, gaat hij automatisch open. De valafstand wordt vanaf het hoogste punt gemeten. De parachute begrenst de valsnelheid op 160 spelpixels per seconde; je kunt gewoon links en rechts blijven sturen. Een val van hoogstens drie blokjes opent hem niet. Bij landen, opnieuw omhoog springen, een buisreis, een reddingssprong of afgaan wordt hij ingeklapt. Onder water gebruik je de bestaande zwembeweging en verschijnt geen parachute.

De parachute werkt ook met kattenvorm, schildpadhelm, achteruit lopen en op de dino. Elke speler heeft in samen spelen zijn eigen parachute en valafstand; beide worden in de gedeelde spelstand bewaard. De parachute vertraagt vallen maar geeft geen bescherming tegen vijanden, lava of stekels. Pauze bevriest de beweging en de rustige beweging van het doek respecteert **minder beweging**.

### Jetpack: de circusvuurpijl

Kies **Jetpack** onder **Beloningen ▾**, of speel **De grote krachtentest** of gek veld **1, 7 of 10**. De beloning start een circusportret van de speler: groot in een ronde, rood-crème rand met gouden lampjes en sterren. De wereld staat gedurende dit portret kort stil. Bij **minder beweging** staat het portret stil.

Daarna staat de held met een vuurpijl aan zijn rug gebonden. Het lontje brandt en naast hem verschijnt duidelijk **5, 4, 3, 2, 1, 0**. De cijfers 5 tot en met 1 blijven elk een seconde staan; 0 blijft nog even zichtbaar voordat de pijl afgaat. Tijdens het aftellen bestuurt de vuurpijl de voorbereiding en blijft de speler staan. Daarna vliegt hij in een lichte bocht naar de bovenkant van het hele veld, ook door platforms en plafonds. Tijdens deze reeks is de held beschermd. Bovenaan wordt hij losgekoppeld: de losse pijl vliegt verder omhoog, de held valt weer en zijn parachute opent na drie blokjes afdalen.

Na het loskoppelen kun je weer sturen. De andere krachten blijven behouden. De vlucht is eenmalig per beloning; een nieuwe beloning start een nieuwe reeks. Pauze bevriest portret, lont, vlucht en losse pijl. In samen spelen krijgt alleen de speler die de beloning oppakt een vuurpijl; het portret en de vlucht worden met beide apparaten gedeeld.

`tests/jetpack.html` laat alle fases zien met de echte engine, inclusief de parachute bij de terugval, zonder opgeslagen levels te veranderen.

### Achterstevoren

Vlak voor de finish van **elk gek veld** ligt de beloning **Achterstevoren**: een wervelwind met een pijl vooruit en een pijl achteruit. De beloning staat ook in **Beloningen ▾** voor je eigen levels. Zodra je hem oppakt, wisselen de startplek en de echte finishvlag tijdens het spel van plaats. Je moet terug naar de oude start om het veld te halen. In de afdalingen hangt de beloning boven de vlag, zodat je hem op weg naar beneden tegenkomt voordat de finish wordt geraakt.

Een korte animatie toont het gezicht van de gekozen speler groot in beeld met ronddraaiende sterretjes. De wereld staat gedurende deze 2,4 seconden stil. Bij **minder beweging** blijven het portret en de sterren stil staan. Daarna blijven de spelers en vijanden tot het einde van het veld zichtbaar achteruit lopen; de richtingstoetsen blijven hun gewone richting houden. De vijanden veranderen bij het oppakken ook van looprichting. De terugweg gebruikt dezelfde vijanden, muntjes en krachten die nog over zijn.

Bij hoge afdalingen verschijnt links onderaan een nieuwe tweerichtingsbuis terug naar de bovenste verdieping. Druk bovenop die buis **↓ / S** en loop naar de nieuwe vlag bij de oude start. De bestaande buisverbindingen blijven behouden. In samen spelen geldt de omkering voor beide spelers; het grote portret toont degene die de beloning oppakte en de nieuwe respawnplek ligt bij de oude finish. Een tweede wervelwind draait hetzelfde veld niet nogmaals om. Opnieuw beginnen herstelt het oorspronkelijke veld.

`tests/reverse.html` toont de beloning, de portretanimatie en het teruglopen met de echte engine, zonder opgeslagen levels te veranderen. De routetest controleert alle tien velden tot aan de verplaatste finish, inclusief de terugbuizen van de afdalingen.

### Rainbowfart

De nieuwe beloning **Rainbowfart** staat onder **Beloningen ▾** en ligt in alle tien gekke velden. Het regenboogwolkje geeft twintig seconden een grote regenboog op de achtergrond en een breed, dodelijk regenboogspoor achter de speler. Tijdens het bewegen groeit het spoor tot maximaal ongeveer een halve zichtbare schermbreedte. Het volgt ook sprongen en bochten. Het uiteinde vervaagt; na stilstaan verdwijnt het oude spoor binnen drie seconden. De resterende krachtduur staat in de statusbalk.

Alle vijandsoorten die het spoor raken worden verslagen. De kracht geeft geen bescherming tegen aanvallen van voren, lava, stekels of gaten. Een nieuwe Rainbowfart vernieuwt de twintig seconden. Pauze bevriest het effect; herstarten, afgaan en een nieuw veld ruimen de kracht op. Een buisreis onderbreekt het spoor zodat er geen dodelijke lijn tussen de twee buizen ontstaat. De beloning kan worden gebouwd, bewaard en geëxporteerd en wordt ook in gedeelde spelstanden meegenomen.

`tests/crazy.html` toont de achtergrondregenboog en het dodelijke spoor met de echte engine. Je kunt er ook de tien velden automatisch laten doorlopen. De pagina verandert je opgeslagen bouwveld niet. De automatische routetest in `tests/crazy.test.mjs` controleert alle tien routes met gewone sprongen, zonder vijanden, krachten of buisverkorting; vijandcontact en de nieuwe kracht hebben afzonderlijke tests.

### Nieuwe illustraties

De aangeleverde originelen staan in `assets/`. Kopieën voor de website staan in `public_html/assets/look/`. `look.mjs` beschrijft de uitsneden op de zes overzichtsvellen en maakt deze tijdens het laden vrijstaand in Canvas. De afbeeldingen blijven intact; achtergrondtekst en losse bewegingsstreepjes worden niet meegenomen. Witte delen binnen de omtrek van een personage blijven behouden. Drie aanvullende PNG-atlassen voor kat, dino en zittende spelers hebben eigen alpha-transparantie, die inclusief lichte vacht en snorharen behouden blijft. De verwerking gebeurt één keer bij het laden; het spel tekent daarna de voorbereide sprites. Het Bravios-laadscherm blijft zichtbaar tot de eerste volledige nieuwe spelweergave klaar is. Bij een mislukte afbeeldingsdownload verschijnt **Opnieuw proberen**.

De nieuwe graphics worden gebruikt voor het logo, de spelersportretten, Boaz en Ravi, groene grond, platforms, wolken, bomen, struiken, rotsen, bloemen, muntjes, springveren, stekels, paddenstoelen en de finishvlag. Breekbare bakstenen gebruiken twintig metselwerkvarianten; vraagblokken blijven houten kratten met een duidelijk vraagteken. De bestaande onderdelen houden hun hitboxes en spelgedrag. Ladders, sleutels, bewegende platforms en andere nieuwe mechanismen op de vellen zijn nog niet toegevoegd. Vijanden en krachten zonder passende afbeelding gebruiken voorlopig hun bestaande tekenstijl.

De kattenkracht verandert de speler in een echt oranje katje, met vier loopframes en aparte houdingen voor stilstaan, omhoog springen, vallen en landen. De nachtwereld gebruikt de nieuwe heuvels, wolken, maan, sterren en aansluitende grondtexturen. De dino heeft een zadel, twee loopframes en een springhouding. Boaz en Ravi gebruiken op zijn rug eigen zittende afbeeldingen, met gebogen knieën en hangende laarzen. Richting en plaatsing volgen de dino, ook bij gedeelde spelstanden. Spelregels, botsingen, kattenkracht en op- en afstappen blijven in de bestaande engine. De drie nieuwe vellen zijn gemaakt met de ingebouwde imagegen-tool; de prompts staan in `public_html/assets/look/creatures-prompts.json`.

De wereld wordt op de resolutie van het zichtbare scherm getekend, met ondersteuning voor schermen met hoge pixeldichtheid. Bouwcoördinaten, camera en spelregels blijven in dezelfde spelpixels werken. `tests/look.html` toont de 45 voorbereide uitsneden op een transparantieraster voor visuele controle. `tests/creatures.html` controleert kat, beide dino-rijders, omdraaien, springen en op- en afstappen met de echte engine, zonder opgeslagen levels te wijzigen. `npm run build` neemt alle nieuwe afbeeldingen ook mee in `speel.html`; door de volledige bronvellen is dat bestand groter geworden.

### Twintig aansluitende varianten per materiaal

`public_html/assets/look/ground-variants.png` en `public_html/assets/look/brick-variants.png` bevatten elk twintig illustraties in een raster van vijf bij vier. Deze twee nieuwe vellen zijn met de ingebouwde imagegen-tool gemaakt op basis van de stijl van de aangeleverde afbeeldingen; de prompts staan in `public_html/assets/look/tiles-prompts.md`. De aangeleverde originelen zijn behouden.

De engine bepaalt de blokkeuze met `terrainAppearance()`. `terrain-rules.mjs` beschrijft voor ieder van de twintig varianten een aansluitcode per zijde. Per materiaal zijn er twee soorten aansluitrand en alle zestien combinaties daarvan, plus vier extra varianten. Daardoor bestaat voor elke combinatie van buurblokken minstens één passende tegel. Twee buurblokken vragen dezelfde code voor hun gedeelde rand. De engine selecteert uitsluitend varianten die aan de vereiste codes voldoen en kiest daaruit met een reproduceerbare toevalswaarde. De keuze wordt onafhankelijk van tekenvolgorde, viewport, beeldtijd en gameplay-randomness berekend.

`terrain.mjs` bereidt per materiaal twintig oppervlakken voor op 96 × 96 pixels. Iedere zijde krijgt de afbeelding van zijn aansluitcode, vloeiend gemengd met het eigen midden. Passende randen hebben exact dezelfde buitenste pixels; onverenigbare codes worden door de engine uitgesloten. Alle families delen hoekstukjes, zodat ook drie of vier samenkomende tegels aansluiten. De AI-vellen zelf zijn bronmateriaal; de uiteindelijke aansluitingen worden in Canvas voorbereid. Groene grond krijgt het gras uit het aangeleverde grondvel. De vier buren bepalen welke van zestien buitenrandvormen wordt getekend. Alleen blokken van hetzelfde materiaal verbinden; vrije boven-, zij- en onderranden blijven herkenbaar. Na weghalen of kapotspringen verschijnen meteen de nieuwe buitenranden. De keuze van blokken verder dan één vak van een wijziging blijft gelijk.

Kies in de gewone bouwer **Grond** of **Baksteen** en plaats blokken zoals voorheen. Nieuwe bouwvelden, geopende voorbeelden en gestarte speelvelden krijgen een willekeurige `terrainSeed`. Deze toevalswaarde blijft bewaard in het level, de bibliotheek, JSON-export, undo/redo en co-op spelstanden. Herstarten houdt dezelfde blokkeuze; een nieuw avontuur kan anders ogen. Oude levels zonder seed blijven geldig en gebruiken de vaste waarde 0. De variatie wisselt niet per beeld of bij scrollen; er komen geen nieuwe tile-ID's bij. De nieuwe grond geldt voor **Groene heuvels** en **Sterrennacht**; overige grondthema's behouden hun bestaande graphics. Bakstenen gebruiken het nieuwe metselwerk in alle thema's. De renderer hergebruikt voorbereide sprites met een begrensde cache van maximaal 640 materiaal/variant/randcombinaties.

Open [tegels.html](../public_html/tegels.html) om alle veertig varianten te bekijken en combinaties te bouwen. Dit losse oefenveld gebruikt dezelfde engine-selectie als de game. Je kunt een voorkeursvariant kiezen: deze wordt alleen gebruikt als zijn aansluitcodes passen. Met **Nieuwe combinatie** kies je een andere toevalswaarde zonder de vorm te veranderen. Het oefenveld verandert je opgeslagen levels niet. De pagina controleert alle 800 toegestane horizontale en verticale aansluitingen met de daadwerkelijk geladen afbeeldingspixels, plus de aansluiting van de grasrand. De gewone game kiest varianten automatisch; een individuele variant wordt daar niet opgeslagen. De zelfstandige `speel.html` bevat eveneens beide vellen, de aansluitregels en de selectie.

Open **☰ → Speel het reguliere spel** voor tien opeenvolgende velden. Na iedere finish kies je **Volgend veld**. Je voortgang wordt op dit apparaat bewaard; via **Kies een van de 10 velden** kun je ook een veld los spelen. Je eigen bouwplaats en collectie blijven behouden.

1. De groene start
2. Bakstenen bij zonsondergang
3. Sneeuwpret
4. De blauwe baai
5. Katten in de nacht
6. Dino door de vallei
7. De bevroren bergpas
8. De verzonken ruïnes
9. De robotfabriek
10. De rainbow finale

## Winter en onder water

Bij **☰ → Kies een sfeer** kun je ook **Winterlandschap** en **Onder water** kiezen. Winter heeft sneeuw, witte grond en besneeuwde bomen. Onder water vind je luchtbellen, vissen, zeewier en een zandbodem. Je beweegt daar langzamer en houdt **springen / ↑ / W / spatie** vast om omhoog te zwemmen. Loslaten laat je langzaam zakken; lucht raakt niet op. De kattenkracht werkt ook in het water. De sfeer en wedstrijdregels worden bij bewaren en downloaden meegenomen.

## Speciale velden voor samen spelen

In **☰ → Speciale velden voor samen spelen** staan drie velden. Kies **Maak een kamer** en laat de tweede speler aansluiten met de code, of kies **Alleen oefenen**.

- **Wie pakt het meeste goud?** Twee minuten muntjes verzamelen in een veld met twee gelijke kanten.
- **Duiken naar de schat.** Twee minuten schatzoeken onder water, met muntjes op verschillende hoogtes.
- **Samen door de sneeuw.** Verzamel samen 50 muntjes binnen 2:30.

In een wedstrijd toont het scherm de muntjes van Boaz en Ravi afzonderlijk. Het resultaat noemt de winnaar of een gelijkspel. Je behoudt je verzamelde muntjes na een respawn. In de teamjacht telt jullie gezamenlijke score. De finishvlag beëindigt deze uitdagingen niet; de timer of het muntjesdoel bepaalt het einde. Pauze stopt ook de wedstrijdtimer.

## Bediening

| Actie | Toets |
| --- | --- |
| Lopen | ← → of A/D |
| Springen | Spatie, ↑ of W |
| Hoger springen | Springtoets langer vasthouden |
| Pauzeren / doorgaan | Esc |
| Werkbalk verbergen / tonen | H |
| Bouwgereedschap | B |
| Gum | E of rechtermuisknop op het veld |
| Ongedaan maken | Ctrl/Cmd+Z |
| Opnieuw toepassen | Ctrl/Cmd+Shift+Z of Ctrl+Y |
| Vuurbal gooien (na een vuurbloem) | F of X |
| Op / van een dino stappen | R of ↓ |
| Buis binnengaan (bovenop staan) | ↓ of S |

Op een tablet of telefoon kun je bouwen met aanraking en spelen met de knoppen onderaan het scherm. De pauzeknop staat in de compacte werkbalk. Solo pauzeert het spel bij het wisselen van tab of venster; in een kamer pauzeert de speler die de kamer maakte voor beiden.

### Controller

Verbind een controller via USB of Bluetooth en druk op een knop terwijl Bravios actief is. In **☰ → Spelen met een controller** zie je de verbindingsstatus. Controllers die de browser als standaardcontroller herkent worden ondersteund. Gebruik HTTPS of localhost als de browser controllerinvoer op de gewone HTTP-site blokkeert.

| Actie | Controller (Xbox / PlayStation) |
| --- | --- |
| Lopen | Linkerstick of richtingstoetsen |
| Springen / zwemmen | A / kruisje (vasthouden voor hoger springen) |
| Vuur of ijs | X / vierkant of B / rondje |
| Op / van de dino | Y / driehoek |
| Buis binnengaan | Richtingstoets omlaag of linkerstick omlaag |
| Starten / pauze / doorgaan | Start / Options |
| Volgend veld / opnieuw proberen na afloop | A / kruisje |

Toetsenbord en aanraking blijven tegelijk bruikbaar. Een dode zone voorkomt lopen door kleine stickafwijkingen. Bij loskoppelen stopt de controllerinvoer; je kunt opnieuw verbinden. Iedere speler kan in een online kamer op zijn eigen apparaat een controller gebruiken. De eerste herkende standaardcontroller bestuurt de speler op dat apparaat. De levelbouwer en menu's bedien je met muis, aanraking of toetsenbord.

## Samen spelen op twee apparaten

1. Open **http://mariomaker.nuidev.nl** op beide apparaten.
2. Kies op het eerste apparaat jullie level en het personage. Open **☰ → Maak een kamer**.
3. Open op het andere apparaat **☰ → Sluit aan met code** en vul de code van 6 tekens in.
4. De eerste speler klikt **Start samen**. De tweede speler krijgt automatisch het andere personage.

Ieder bestuurt zijn eigen speler en het beeld volgt die speler. Jullie delen het level, muntjes, vijanden, bloemen en dino’s. Eén dino heeft één berijder. Als iemand af is, verschijnt die na 1,5 seconde weer bij de start met 2 seconden bescherming tegen vijanden. De ander speelt door. Wie de vlag bereikt, wint voor het team.

De eerste speler kan voor beiden pauzeren en opnieuw beginnen. Houd dat apparaat en de spelpagina open. **Kamer verlaten** sluit de kamer voor beiden. Bij tijdelijk verbindingsverlies probeert het spel opnieuw te verbinden; oude ingedrukte toetsen stoppen na een halve seconde. Je eigen bouwveld en collectie blijven bewaard wanneer je bij iemand aansluit.

Samen spelen gebruikt de webserver en werkt niet wanneer je het losse HTML-bestand vanaf je computer opent. De eerste versie wisselt spelstanden via PHP uit; op trage verbindingen kan de tweede speler enige vertraging merken.

## Vriendelijke paddenstoelenmannetjes

Plaats een **Paddenstoelenmannetje** met zijn eigen knop in de bouwdoos. Deze blauwe paddenstoelenvriend zwaait, draagt een cadeautje en is ongevaarlijk. Hij geeft automatisch een beloning als je dichtbij hem loopt of naast hem landt. Je hoeft niets in te drukken. Het kleine plaatje boven hem laat zien welk cadeau hij heeft; na het geven verschijnt **Veel plezier!** en staat de ontvangen beloning kort in de statusbalk.

De cadeaus variëren tussen een paddenstoel als schild, een ster, een ijsbloem, de bubblegun, het kattenbelletje en Rainbowfart. De positie in het veld bepaalt het cadeau, zodat hetzelfde mannetje bij opnieuw beginnen hetzelfde cadeau heeft. Iedere speler ontvangt van elk mannetje één cadeau per poging. Teruglopen of opnieuw verschijnen na afgaan in samen spelen geeft geen tweede cadeau van diezelfde helper. Opnieuw beginnen met het veld maakt de cadeaus weer beschikbaar.

De helpers blijven op hun plaats staan en zakken naar de grond als je ze in de lucht zet. Ze horen bij de vriendelijke figuren: jouw vuur, ijs, bellen en rollende schilden doen ze geen kwaad. Alle tien gekke velden bevatten twee helpers; **De grote krachtentest** heeft er ook één. Eigen levels behouden ze bij bewaren en exporteren. In samen spelen ontvangt iedere speler zijn eigen cadeau en wordt bijgehouden wie al iets heeft gekregen.

`tests/helpers.html` laat de ontmoeting en cadeaus zien met de echte engine, zonder opgeslagen levels te veranderen.

## Spelonderdelen

- Muntjes verzamelen; vraagblokken van onderen raken voor een extra muntje.
- Bakstenen van onderen kapot springen.
- Op vijanden springen om ze te verslaan; aanraken kost je de poging.
- Een paddenstoel geeft een schild tegen één aanraking met een vijand.
- Een springveer geeft een extra hoge sprong.
- Over stekels en gaten springen; deze zijn ook met een schild gevaarlijk.
- De finishvlag aanraken om te winnen.
- Een ster maakt je 10 seconden onoverwinnelijk: contact verslaat vijanden en stekels doen tijdelijk geen pijn. Vallen in een gat kost nog steeds een poging. De resterende tijd staat in beeld.
- Een rainbow ster beschermt **2:00 minuten**, ook tegen lava, stekels, bommen en vallen. In een gat word je teruggebracht naar veilige grond. Je krijgt rainbow schoenen met een regenboogspoor; die blijven na de timer tot je opnieuw begint of af bent. Een gewone ster verkort de rainbow bescherming niet.
- Een kattenbelletje verandert je in een kat. De kat springt veel hoger en maakt een automatische reddingssprong als hij in een gat valt. Zolang er een kat meespeelt, wordt de wereld meteen nacht. Een aanraking met een vijand kost je kattenvorm en geeft kort bescherming; Een kat kan door lava en stekels afgaan; een rainbow ster beschermt tegen beide, een gewone ster alleen tegen stekels.
- Vliegt er dichtbij een draak, springende robot, hamer, vuur- of ijsbal, dan neemt het katteninstinct **0,8 seconde** de controle over: de kat springt en rent naar het doel. Daarna bestuur je weer zelf. Het instinct kan hoogstens eens per 4 seconden starten.
- Bij **Buizen ▾** kies je een gewone buis, een **ingang ↓**, een **uitgang ↑** of **twee richtingen ↕**. Ga bovenop een ingang staan en druk **↓ / S**, of op **Buis ↓** op een tablet. Ingangen en uitgangen worden elk van links naar rechts geteld: A1 gaat naar A1, A2 naar A2. Buizen met twee richtingen verbinden in paren B1, B2, enzovoort. De codes staan boven de buizen in de bouwer; een **?** betekent dat een ingang nog geen partner heeft. Houd de ruimte boven beide buizen vrij. Een geblokkeerde uitgang werkt niet. Loslaten en opnieuw drukken voorkomt onbedoeld terugreizen.
- Bij **Sterren ▾** kies je tussen de gewone ster en de rainbow ster. De gekozen variant blijft als hoofdknop beschikbaar om te plaatsen of te slepen.
- Een vuurbloem laat je vuurballen gooien met F of X. Vuurballen stuiteren en verslaan vijanden; ze stoppen bij muren. Een aanraking met een vijand kost je de vuurkracht.
- Plaats een dino in je level. Spring op zijn rug of druk dichtbij op R / ↓. Je kunt samen lopen en springen; met R / ↓ stap je af. Een aanraking met een vijand laat je afstappen, zodat je nog een kans hebt.
- Een robotje staat 5 seconden op te laden en springt daarna willekeurig naar links of rechts. Na het landen laadt hij weer op. De balk boven zijn hoofd laat de voortgang zien.
- Een kikker steekt 3 seconden zijn tong uit en kruipt daarna 3 seconden langzaam vooruit. Zijn tong raakt je ook op afstand en stopt bij muren.
- De **Bubblegun** onder **Beloningen ▾** laat je met **F / X** luchtbellen schieten. Op tablet gebruik je **Bellen ○**, op een controller de bestaande schietknop. Een getroffen tegenstander komt in een doorzichtige luchtbel terecht, wordt meteen ongevaarlijk en zweeft omhoog door terrein tot boven het zichtbare scherm. Dit werkt voor alle vijandsoorten, ook bommen en planten. Bommen ontploffen niet meer als ze gevangen zijn. Losse bellen knappen tegen terrein of na 1,6 seconde. De bubblegun vervangt vuur of ijs en andersom; een vijandaanraking kan je de bubblegun kosten. De helm en andere bescherming vangen eerst hun eigen klap op. De beloning zit ook in **De grote krachtentest** en in gekke velden **2, 6 en 9**. De kracht, schoten en gevangen tegenstanders worden meegenomen in gedeelde spelstanden. `tests/bubblegun.html` laat het effect met de echte engine zien zonder je opgeslagen levels te wijzigen.
- Een ijsbloem laat je ijsballen gooien met **F/X**, of de ijs-knop op een tablet. Vijanden bevriezen 4 seconden en zijn dan ongevaarlijk. Ook hun timers stoppen tijdelijk. Een vuurbloem vervangt ijs en andersom.
- De rode kikker heeft dezelfde tong- en kruipcyclus als de groene kikker. De boze robot heeft dezelfde oplaad- en springcyclus als de gewone robot.
- De schildpad trekt zich terug in zijn schild als je erop springt. Raak een stilstaand schild om het weg te schoppen; het raakt andere vijanden en rolt door muren en buizen heen. Bij de veldrand keert het om; het kan nog steeds in gaten vallen. Een bewegend schild is gevaarlijk. Spring erop om het te stoppen. Na één sprong op een schildpad kun je naast het stilstaande schild **R / ↓** indrukken om het als **schildpadhelm** op te zetten. Op een tablet verschijnt **Helm ↓**; met een controller gebruik je **Y / driehoek**. De helm vangt één vijandaanraking op en reist mee door buizen, ook in samen spelen. Lava, stekels en gaten blijven gevaarlijk.
- De draak vliegt heen en weer en zweeft op en neer.
- De vleesetende plant heeft twee koppen die om de beurt happen. Zijn lijf en koppen zijn gevaarlijk; erop springen helpt niet. Gebruik vuur, ijs of een ster.
- De skeletschildpad valt 5 seconden uit elkaar als je erop springt en staat daarna weer op. Vuur verslaat hem niet. IJs bevriest hem; een ster verslaat hem definitief.
- Lava is ook met een gewone ster, schild of dino gevaarlijk; rainbow bescherming maakt je tijdelijk veilig. Spring eroverheen of bouw een route erboven.
- De dikke stekelschildpad loopt langzaam, heeft een gevaarlijke rug en verdraagt 3 vuurballen. Zijn levensbalk staat erboven. IJs bevriest hem en een ster verslaat hem.
- De hamerschildpad loopt en gooit elke 2 seconden een hamer naar de dichtstbijzijnde speler. Hamers vliegen in een boog en stoppen bij terrein.
- Lopende bommen krijgen een lont van 3 seconden wanneer je dichtbij komt. Springen op de bom verkort de lont tot 0,8 seconde; vuur tot 0,5 seconde. IJs stopt de lont tijdelijk. Houd afstand van de ontploffing.

De bouwdoos heeft uitvouwbare groepen **Buizen**, **Sterren**, **Vijanden** en **Beloningen**. Kies via het pijltje een onderdeel; de hoofdknop onthoudt jullie keuze zodat je die direct kunt plaatsen of slepen. **De grote krachtentest** bevat beide sterren, het kattenbelletje, buisroutes, beide bloemen, dino’s, kikkers, robots en een vliegende draak. **Het slechterikenparcours** bevat de nieuwe schildpadden, draak, plant, lava en bom. Op een tablet verschijnen de vuur-/ijsknop en de dinoknop tijdens het spelen als ze van toepassing zijn. Pauze bevriest de timers. Bestaande levels blijven bruikbaar en de nieuwe onderdelen worden meegenomen bij bewaren en downloaden.

## Bewaren en uitwisselen

De huidige bouwplaats wordt automatisch opgeslagen in deze browser. **Bewaar level** zet daarnaast een vaste kopie in de collectie. Nieuwe wijzigingen aan het bouwveld veranderen die kopie niet. Download belangrijke levels als extra kopie: browsergegevens wissen, privémodus of een ander apparaat kunnen betekenen dat je lokale collectie niet beschikbaar is. Tijdens samen spelen worden het gekozen level, de bediening en de spelstand tijdelijk via de webserver gedeeld; de lokale collectie blijft op je apparaat.

De offline versie en een versie via een webserver hebben elk hun eigen browseropslag. Wissel levels uit met **Download level** en **Open levelbestand**. Verkleinen van een level verwijdert blokjes buiten de nieuwe breedte na een bevestiging; Ongedaan maken herstelt het vorige veld.

## Performance

Alleen het zichtbare deel van het veld plus een kleine marge wordt getekend: terrein, achtergrond, vijanden, dino’s, projectielen en andere spelers buiten beeld worden overgeslagen. Herhaalde vijanden en vaste tegels hergebruiken hun sprite. De simulatie blijft ook buiten beeld werken, zodat vijandtimers en samen spelen hetzelfde gedrag houden.

De ontwikkeltest **tests/performance.html** maakt een veld met 1.100 robots en vergelijkt tekenen van het hele veld met een zichtbaar venster. De metingen betreffen JavaScript en tekenopdrachten; dit is geen garantie voor FPS op een ander apparaat. De tests controleren ook dat minder tekenen de spelstand niet verandert.

## Ontwikkelen of spelen via je thuisnetwerk

Node.js 18 of nieuwer:

```sh
npm start
```

Open `http://localhost:8080`. Op een ander apparaat op hetzelfde thuisnetwerk gebruik je `http://<IP-van-deze-computer>:8080`. De server luistert op alle lokale netwerkinterfaces en serveert uitsluitend de spelbestanden. Zorg dat de firewall toegang op je thuisnetwerk toestaat. `PORT=8090 npm start` kiest een andere poort.

Voor samen spelen op je eigen computer met PHP 8.1 of nieuwer:

```sh
npm run start:network
```

Dit serveert `public_html/` op poort 8080, inclusief de kamerverbinding. De huidige Apache-ontwikkelserver voert `room.php` al uit. Er is geen aparte service, database of installatie nodig. `room.php` bewaart kamers buiten de documentroot in een eigen tijdelijke map, met bestandslocks, aparte toegangssleutels voor de twee spelers en automatische verlopen kamers. Kamers zijn tijdelijke sessies, geen serveropslag van jullie levelcollectie. De Node-server van `npm start` ondersteunt solo spelen.

```sh
npm test     # tests voor de spelregels en het levelbestand
npm run build # vernieuw speel.html na het wijzigen van de bronbestanden
```

Bronvellen voor de nieuwe illustraties staan onder `assets/`; alle spelcode, tests en gebruikte assets staan onder `public_html/`. Bronbestanden: `index.html`, `styles.css`, `app.mjs` (bouwer en bediening), `engine.mjs` (spelregels), `levels.mjs` (tien reguliere velden, tien gekke velden en samenspeelvelden), `look.mjs` (aangeleverde overzichtsvellen en uitsneden), `art.mjs` (tekeningen en personages), `presentation.mjs` (lokale visuele effecten en camera), `storage.mjs` (opgeslagen levels), `coop.mjs` (gedeelde spelwereld), `network.mjs` (kamerverbinding) en `room.php` (server). `speel.html` is het gegenereerde zelfstandige spelbestand. Stel de documentroot van de ontwikkelserver in op `public_html/`. De npm-commando’s voer je uit vanuit de projectmap.

De bestaande lokale collectie blijft behouden onder dezelfde opslagsleutel. Levels uit de oude Bouwclub-versie kunnen nog worden geïmporteerd. Bij een ander webadres gebruikt de browser een aparte collectie; download en importeer je levels om ze over te zetten.


### Mechanieken: beweegblokken en lopende banden

Open **Mechanieken ▾** in de bouwdoos. **Beweegblok · eerst omhoog** en **Beweegblok · eerst omlaag** plaatsen een blok van twee bij twee vakjes. Het beweegt drie vakjes in de gekozen richting in drie seconden en keert daarna om. Aan de boven- of onderrand wordt de afstand begrensd. De stippellijn in de bouwer laat het bereik zien. Je kunt erop staan en meeliften; tussen het blok en een plafond kun je bekneld raken.

Kies **Lopende band** en klik twee verschillende vakjes: dit zijn de assen. Een voorbeeld verschijnt na de eerste klik. De band mag horizontaal, verticaal of schuin lopen. Langs de lus zitten regelmatig staande platformen met een beloopbare bovenkant. De band draait drie seconden en staat daarna twee seconden stil. Groen in de as betekent draaien; rood betekent stilstaan. Spring van onderen door de platformen heen of land erop om mee te liften.

**Escape** annuleert de eerste as. Met de gum op de lijn of een as verwijder je de hele band; ongedaan maken herstelt deze in één stap. Bij een beweegblok kun je elk van zijn vier vakjes wissen. Banden worden met hun twee assen in het level opgeslagen, meegenomen in downloads en kamers en verschoven bij een andere veldhoogte. Een band die na verkleinen buiten het veld zou vallen, wordt verwijderd. Maximaal 32 banden per veld. Pauze en beloningsintro's zetten alle mechanieken stil.


### Buizen met openingen naar alle kanten

Via **Buizen ▾** kies je nu ook **opening onder**, **opening links** en **opening rechts**. Iedere richting heeft een gewone buis, een ingang, een uitgang en een tweerichtingsvariant. De opening is de kant waar de held naar binnen of buiten gaat. Bij een opening links loop je dus naar rechts naar binnen; bij een opening rechts loop je naar links. Spring bij een opening onder omhoog tegen de opening. **S** of de **buisknop** werkt bij alle richtingen.

Je mag richtingen combineren. Ingangen en uitgangen koppelen op volgorde van links naar rechts; tweerichtingsbuizen koppelen in paren. De codes boven de buizen tonen de koppeling. Laat aan de kant van de opening ruimte voor de held. Een geblokkeerde uitgang of een uitgang buiten het veld laat niemand door. Nieuwe richtingen blijven bewaard in downloads, de bibliotheek, het losse spelbestand en de gedeelde kamer.


### Boos stekelrotsblok

Kies **Vijanden ▾ → Boos stekelrotsblok** en hang het boven een doorgang. Het grijze rotsblok heeft stekels, boze wenkbrauwen en een boos mondje. Het blijft hangen totdat een speler eronder loopt in dezelfde vrije schacht. Een vloer tussen de held en het blok voorkomt dat het door die vloer heen reageert. Het valt snel naar de eerstvolgende vloer of platform, blijft daar **5 seconden** liggen en stijgt langzaam terug naar zijn startplek. Daarna kan het opnieuw vallen.

De stekels zijn dodelijk bij aanraking, ook als je erop springt of een schild, helm of gewone ster hebt. De bestaande rainbowbescherming en vuurpijlvlucht blijven beschermen. Vuur en weggeschopte schildjes breken het blok niet. IJs bevriest de cyclus; de bubblegun en Rainbowfart kunnen het blok uitschakelen. In samenspel kan iedere speler de val activeren; een geraakte speler keert via de bestaande respawn terug. Pauze en beloningsintro's houden het blok stil.


### Grotten en sleutels

Open **Grotten en sleutels ▾** en plaats een **Grot · open**, **Grot · op slot** of **Grotsleutel**. Loop een open grot in om naar een aparte, kleine donkere ruimte te gaan. Binnen liggen muntjes en een paddenstoel. De deur links brengt je terug naar dezelfde plek buiten. Iedere grot heeft een eigen ruimte; verzamelde muntjes blijven weg bij terugkomst. Het buitenveld wacht op je, met dezelfde blokken, vijanden en voortgang. In samenspel reizen beide helden samen en krijgen ze een tijdelijke respawnplek binnen.

Sleutels en afgesloten grotten koppelen van links naar rechts. De bouwer toont dezelfde **G1**, **G2**, enzovoort boven bijbehorende sleutels en sloten. Zodra je een sleutel aanraakt, pauzeert de wereld. De camera gaat in 0,4 seconde naar het slot, toont hoe de deur openschuift en keert in 0,35 seconde terug naar de held. Het hele moment duurt 1,8 seconde. Bij minder beweging wisselt het beeld zonder schuiven. Een losse sleutel zonder gekoppeld slot verdwijnt zonder cameramoment.

De binnenwereld wordt door het spel gemaakt; je hoeft daarvoor geen tweede veld te tekenen. Je eigen veld en opgeslagen ontwerpen worden tijdens het spelen niet aangepast. Herstarten begint opnieuw in het buitenveld. De grotstatus en de deuranimatie reizen mee in gedeelde spelstanden.


Via **Grond en blokken ▾ → Rotsblok** bouw je met een stevig grijs steenblok met ruwe vlakken en scheuren. Het is beloopbaar en breekt niet bij een sprong tegen de onderkant. Je kunt het in alle thema’s gebruiken en gewoon bewaren, downloaden en delen.

## Karaktermaker

Open **☰ → Maak je eigen karakter**. Combineer vijf gezichten, zeven outfits, vijf soorten schoenen en tien accessoires. Je kunt een bril, oorbellen, schmink en een regenboog combineren met één bandana, pet, hoed of helm. Het voorbeeld verandert direct. Geef je held een naam en kies **Bewaar en speel hiermee**. Onder **Jullie karakters** kun je tot 24 helden op dit apparaat bewaren en opnieuw aankleden. Via **Speel als Boaz/Ravi** keer je terug naar de oorspronkelijke figuren.

Eigen karakters werken in je bouwveld, beide campagnes en samenspel. De kamermaker en gast delen alleen de gekozen onderdelen; beide apparaten gebruiken dezelfde ingebouwde tekeningen. Kleding en schoenen veranderen de spelregels niet. Tijdens lopen wisselen beide benen af en veert het lichaam licht mee. Jurken en lange jassen behouden hun zoom; daar bewegen vooral de voeten. De bestaande kattenvorm en dino blijven hun eigen spelafbeeldingen gebruiken. Zie [loopanimatie en beeldsnelheid](vloeiender-spelen.md).

De tekeningen zijn gemaakt met de ingebouwde ChatGPT-afbeeldingsgenerator. De originele transparante PNG-atlassen staan onder `public_html/assets/characters/`; de prompts staan in `public_html/assets/characters/prompts.md`. `character-maker.mjs` snijdt de onderdelen tijdens laden uit en stelt het karakter samen. `npm run build` neemt de tekeningen en karaktermaker ook op in de offlineversie `speel.html`.

## Maan, kettingballen en verrassingsvelden

Kies **Maanlandschap** bij de omgeving voor een sterrenhemel met aarde en kraters. De zwaartekracht is een zesde: houd springen vast voor een veel hogere sprong. Kies een hoger veld als je meer ruimte wilt.

- **Mechanieken**: stekelballen en vuurballen aan slingerende kettingen, ieder met of zonder gezicht. Het ankerblok is stevig; de bal doet pijn. Houd onder en naast het blok ruimte vrij.
- **Grond en blokken**: stevige wolkenblokken.
- **Beloningen → Quad**: spring erop of druk dichtbij op **R / ↓**. Rijd met links/rechts; **R / ↓** stapt af.
- **Vraagblokken → Bonenstaakdoosje**: spring tegen de onderkant. De doos opent en de staak verschijnt omhoog tot het eerste obstakel. Houd springen vast om te klimmen, **↓** om te dalen. Beweeg opzij om los te laten.
- **Vijanden → Vliegtuigje met piloot**: patrouilleert heen en weer op de geplaatste hoogte en laat vuurballen vallen.

Bij **☰ → Bouwen · de spelmaker → Nieuw veld maken** staat **Maak een willekeurig speelbaar veld**. De knop gebruikt de gekozen omgeving, breedte en hoogte. De generator plaatst wolken/platforms, muntjes, bonenstaakdoosjes en een quad, met een vrije route over de grond naar de finish. Voeg zelf vijanden toe voor meer uitdaging. **Ongedaan maken** haalt je vorige bouwveld terug. Alle plaatsbare onderdelen werken in levelbestanden en gedeelde spelstanden.

## Vijanden bewerken

Klik in de levelmaker op een geplaatste vijand, of kies het potlood **Vijand bewerken (V)** en klik daarna op de vijand. Kies een hoofd, lijf en hoed met de grote plaatjesknoppen. Een groen vinkje toont je keuze. Combineer bijvoorbeeld een schildpaddenlijf met een paddenstoelenhoofd en een feesthoed. Voor vleugels kies je veren, vleermuis of vlinder, met drie groottes en zes kleuren. Het voorbeeld verandert meteen.

**✓ Klaar** past alleen die ene vijand aan. **Annuleren** of Escape laat hem zoals hij was. **↶ Opnieuw** zet de keuzes in het venster terug; tik daarna op Klaar om dat toe te passen. Ongedaan maken en Opnieuw werken ook voor vijandontwerpen. Met de gum verwijder je een vijand; daarna kun je op die plek een andere zetten.

Hoofd, lijf en hoed veranderen de oorspronkelijke aanvallen en kwetsbaarheden niet. Geef een gewone vijand vleugels en hij gaat automatisch heen en weer vliegen, iets boven zijn startplek. Verwijder je de vleugels, dan stopt het vliegen. Onder **Vliegen** kun je ook zelf **Op de grond** kiezen om de vleugels als versiering te gebruiken. Hamervijanden blijven gooien, bommen behouden hun lont en een schildpad kan nog in zijn schild kruipen. De draak, plant, stekelrots, het vliegtuig, het stekeleiwolkje, de duizendpoot en onderwaterdieren houden hun eigen beweging; hun extra vleugels blijven versiering. Hoeden en vleugels hebben geen eigen botsingen.

Ontwerpen worden per geplaatste vijand bewaard in het bouwveld, de collectie, downloads en samenspel. Oude levels blijven geldig. Bij het wijzigen van de veldhoogte schuiven de ontwerpen mee. Gummen, vervangen of buiten het veld verkleinen verwijdert het bijbehorende ontwerp. Er kunnen maximaal 256 bewerkte vijanden in een veld staan.

## Drie nieuwe tegenstanders

- **Vijanden → Stekeleiwolkje** zweeft heen en weer en laat elke twee seconden een stekelig ei vallen. Bij het landen komen er twee kleine rode mieren uit. Ze lopen elk een kant op en zijn dodelijk bij aanraking, ook tijdens het knipperen. Na drie seconden beginnen ze te knipperen; na vijf seconden verdwijnen ze.
- **Vijanden → Duizendpoot** heeft een rug waarop je kunt staan en meerijden. Bij het landen kijkt hij 0,8 seconde boos naar het scherm en gaat daarna hard lopen met een rood hoofd. Klik op zijn geplaatste beginvakje met **Vijand bewerken (V)** om de lengte van **2 tot 10 delen** in te stellen. Standaard heeft hij vier delen. Laat voldoende ruimte vrij naast het beginvakje.
- **Mechanieken → Kettinghoofd** is een stevig ankerblok met een gek hoofd zonder armen of benen. Het hoofd hopt naar de dichtstbijzijnde held, maar blijft binnen zijn ketting van 3,5 blokjes. Aanraken doet pijn.

Deze onderdelen worden bewaard in levelbestanden en samenspel. Pauzeren stopt hun beweging en timers.

## Bouwen onder de grond

Open **☰ → Bouwen · de spelmaker → Huidig veld aanpassen en bewaren** en kies bij **Hoe diep onder de grond?** bijvoorbeeld **16 blokjes dieper**. Onder het bestaande veld verschijnt een grote lege holte met een donkere achtergrond en een rotsvloer. De bestaande grond vormt de blokkenlaag tussen boven- en onderwereld. Gum daar een opening doorheen om naar beneden te vallen. De camera volgt je; de bestaande automatische parachute blijft werken.

**Hoe hoog boven de grond?** voegt nog steeds ruimte bovenaan toe. Hoogte en diepte zijn samen maximaal 64 blokjes. Scroll verticaal om in de holte te bouwen. Bij verder uitdiepen schuift de gewone rotsvloer naar beneden; andere geplaatste onderdelen blijven op hun plek. Een kleinere diepte verwijdert de onderste rijen na bevestiging. **Ongedaan maken** herstelt de vorige situatie. De diepte blijft bewaard in downloads, je collectie en samenspel.

## Lava en vuurmolens

De avonturierskastelen hebben lavabaden met stenen platforms. Spring over het bad en wacht buiten de draaicirkel van een vuurmolen, of neem het hogere platform. De vier vlammen draaien iedere zes seconden volledig rond. In de bouwer vind je **Mechanieken → Vuurmolen**; houd drie vakjes rond het anker vrij. Bekijk de [bouwtips en kasteelproef](kasteelvuur.md).

## De avonturiers

Open **☰ → Spelen → De avonturiers → Verken de wereld**. Klik op een geopende plek of loop met de pijltjestoetsen over de kaart. Kies daarna **Ga het veld in** of druk op Enter. De reeks heeft twaalf velden van **240–312 blokjes breed** (de bestaande reeks is 40–120), met weiden, water, hoge wolkenroutes en maanvelden van 32 blokjes hoog. Maanvelden beginnen op een raketbasis: de bestaande jetpack telt af, stijgt op en brengt je naar het maanveld.

De route is `1 → 2 → 3 → (4 of 5) → 6 → (7 → 9 of 8 → 10) → 11 → 12`. Een voltooide voorganger opent de volgende plek; bij een samenkomst volstaat één tak. Je kunt later terug voor de andere tak. De vier kastelen (velden 3, 6, 11 en 12) zijn donkere binnenruimtes met een gemetselde achterwand en een doorlopend stenen plafond en vloer over de volle breedte. Open bijvoorbeeld Kasteel Vuursteen om dit te bekijken. Het thema **Binnen in het kasteel** is ook beschikbaar in de bouwer. De kastelen bevatten monsters, lava en een groot gehoornd kasteelmonster met tanden en een eigen levensbalk als eindbaas. Het monster blijft in de eindzaal patrouilleren; de finale heeft de Lavakoning. De vlag werkt pas na het verslaan van die baas: vijf vuurtreffers, negen in de finale. Voor de arena liggen reservevuurbloemen. De balk boven de baas en de teller in beeld tonen de resterende kracht.

Na veld 2 en veld 6 openen winkels langs een zijpad. Bij de eerste voltooiing van een veld gaan de verzamelde muntjes naar je tas. Een extra leven kost 15, een schild 8, en vuur, ijs of een bubblegun 12 muntjes. Je tas heeft ruimte voor één kracht: een andere aankoop vervangt die kracht. De aankoop gaat mee naar je volgende veld en wordt bij het starten uit de tas gehaald. Extra levens laten je na een mislukte poging opnieuw proberen. Na de laatste poging ga je terug naar de kaart en ontvang je drie nieuwe extra levens. Voortgang, tas en levens worden automatisch in deze browser bewaard. De bestaande campagnes blijven apart beschikbaar.

Bronnen: `public_html/adventurers.mjs` bevat de velden en voortgangsregels; `adventure-map.mjs` verzorgt de kaart, het lopen en de winkels; `app.mjs` verbindt kaart, raket, uitslag en opslag. `engine.mjs` blokkeert de finish zolang een gemarkeerde eindbaas leeft; `art.mjs` tekent de grotere baas en zijn krachtbalk. Grote levelbestanden worden tot 360 blokjes breed gevalideerd, ook door `room.php`. De nieuwe reeks zelf wordt alleen gespeeld.

`npm test` bevat `public_html/tests/adventurers.test.mjs`: vertakkingen, gesloten routes, opslag, aankopen, alle twaalf hoofdroutes zonder vijanden, raketlancering en eindbaasgevecht met gesloten finish. `npm run build` neemt de twee nieuwe modules op in `public_html/speel.html`.

## Vlakke kistjes en gele helmtorren

Vraagkistjes en gebruikte kistjes hebben een vierkant houten **vooraanzicht**, zonder zichtbaar boven- of zijvlak. Bijvoorbeeld: plaats een vraagblok met vuurbloem, raak het van onderen en bekijk daarna het gebruikte kistje. Het vraagteken en de inhoudsbadge blijven werken. De tekening staat in `drawFrontCrate` in `public_html/art.mjs`.

Onder **Vijanden** staan **Helmtor** en **Helmtor met punt**. Beide lopen met een gele helm. Spring op de gewone helmtor: hij klapt in, blijft drie seconden op zijn plek en is zolang ongevaarlijk. Daarna springt hij weer op en loopt hij verder. Je kunt hem opnieuw inklappen. De punthelm doet pijn wanneer je erop springt; ontwijk hem of gebruik vuur of ijs. Vuur verslaat beide varianten. Pauze stopt de wachttijd, en samenspel bewaart de vorm en resterende tijd. De nieuwe torren komen ook voor in de weidevelden van De avonturiers. De tegels zijn 97 en 98; levelvalidatie en PHP-kamers herkennen beide.

`npm test` bevat `public_html/tests/helmet-beetles.test.mjs`, met checks voor inklappen, ongevaarlijk contact, exact drie seconden wachten, terugspringen, herhaald inklappen, de punthelm, vuur, pauze en samenspelsnapshots.

## Geïllustreerde avonturierskaart

De kaart gebruikt een nieuwe geschilderde achtergrond geïnspireerd op `public_html/world-inspiration.png`: groene eilanden, rotskusten, watervallen, houten bruggen, dorpen en kastelen. De nieuwe projectafbeelding staat in `public_html/assets/look/adventure-map.png`. De veldplekken sluiten aan op de kastelen, raketbases en open plekken in de illustratie. Paden en knoppen worden apart getekend: uitgespeelde velden openen de bestaande vertakkingen, en het personage loopt met kleine stapjes over de gebogen zandpaden. Met verminderde beweging vervalt die stapanimatie. De wereldkaart, tas en winkels werken ook in de opnieuw gebouwde `public_html/speel.html`.

Visuele proefpagina’s: `public_html/tests/helmet-beetles.html` toont beide kistjes en alle helmvormen naast een speelbaar testveld. `public_html/tests/adventure-map.html` geeft een aparte testkaart met velden 1–3 voltooid en 40 muntjes, om lopen, splitsingen en winkelaankopen te controleren zonder de opgeslagen spelvoortgang te wijzigen.

### Bediening op de wereldkaart en in de winkel

Gebruik de pijltjestoetsen, WASD, controllerstick of het richtingskruis om naar een geopende plek te lopen. **Enter, spatie, A / kruisje** opent een veld of winkel. In de winkel kies je een beschikbaar artikel met de richtingen en koop je het met **Enter / spatie / A / kruisje**. Een paarse rand toont het gekozen artikel. **Escape / B / rondje** gaat terug naar de kaart; B / rondje sluit vanaf de kaart het venster. Na het lopen krijgt de kaart automatisch de toetsenbordfocus terug. Tab en Enter werken ook voor de veldknoppen.

De controller blijft actief terwijl het kaartvenster open is. De aparte testkaart bevat knoppen **Controller ← / ↑ / ↓ / → / A / B** die dezelfde menuacties oproepen, zodat de afhandeling ook zonder aangesloten controller gecontroleerd kan worden. De browsertest vervangt geen controle met een fysieke controller.

## Startscherm en Kleine games

Bravios opent met **Kies jouw avontuur**: grote thumbnails voor **De avonturiers**, **Het reguliere spel**, **Het gekke spel**, **Samen spelen** en **Kleine games**. De voortgang staat direct op de avontuurkaarten. Met het huisje **⌂ Startscherm** kom je terug naar deze keuze. **Bouw je eigen veld** en de bestaande instellingen staan onder de kaarten. Toetsenbord: kies met de pijltjes en bevestig met Enter. Controller: stick of richtingskruis om te kiezen, A / kruisje om te starten. Het reguliere en gekke spel gaan verder bij je bewaarde veld; De avonturiers opent de wereldkaart. Samen spelen opent de bestaande kamerkeuze.

**Kleine games** opent schermvullend. Bij openen met muis of toetsenbord wordt ook het volledige scherm van de browser aangevraagd. Blokkeert de browser dat (bijvoorbeeld bij openen met de controller), dan vult het spel het browservenster; met **Volledig scherm** kun je alsnog omschakelen. Het hele speelveld blijft zichtbaar, ook bij een ander schermformaat.

**Kleine games** bevat vier losse spelletjes, zonder invloed op je avonturiersmunten of voortgang:

- **Stekelsprong:** spring met A / kruisje. In **samen** springt speler 2 met Y / driehoek of A / kruisje op controller 2. Start / Options pauzeert en hervat. Zie [Stekelsprong](stekelsprong.md).
- **Mik & schiet:** vijf balletjes in een mand mikken. Sleep op het speelveld om te richten en laat los om te schieten. Met toetsenbord/controller: omhoog/omlaag voor de hoek, links/rechts voor de kracht, spatie / A om te schieten. De stippen tonen de baan.
- **Ballonnenpret:** tik tien ballonnen kapot. Met de richtingen kies je een ballon; spatie / A prikt hem. Er is geen tijdslimiet.
- **Fruitvanger:** verplaats de mand met muis, vinger of links/rechts en vang tien appels. Je mag vijf appels missen.

Na een rondje kun je **Opnieuw spelen** kiezen of op A / kruisje drukken. **Kies een spel** of Escape / B / rondje brengt je terug naar de spelkeuze. In het menu sluit B / rondje de minigames. De spelpakketten en menuschil staan in `public_html/games/`; de regressietests staan in `public_html/tests/small-games.test.mjs` en draaien via `npm test`. De module zit ook in de offline build.

De finish herkent nu ook de rechterkant van het zichtbare vlagdoek. `adventurers.test.mjs` controleert dat aanraken hiervan het eerste veld voltooit en het tweede opent. Kastelen behouden hun verplichte eindbaas.

### Prestaties van grote velden

De speelwereld en het scrollgebied blijven in blokjes berekend. De canvasbitmap is zo groot als het zichtbare scherm, met ondersteuning voor apparaatpixeldichtheid tot 2× en een bovengrens van 8192 pixels per zijde en 8 × 1024 × 1024 pixels. De lengte van een level verlaagt daardoor niet meer de tekenresolutie. Bij een venster van 1280 × 800 op een 1×-scherm gebruikt zowel een klein veld als het grote maanveld nu een bitmap van 1280 × 800 pixels. `viewportRenderSize` en `viewportWorldPoint` in `presentation.mjs` bepalen de resolutie en de bouwcoördinaten na scrollen. `world-space` bevat de volledige virtuele wereld; de canvas blijft met de camera in beeld.

Het hoofdveld wordt niet iedere frame achter het startscherm en Kleine games getekend. De HUD scant maximaal vijftien keer per seconde naar nabijgelegen onderdelen, met directe updates bij spelgebeurtenissen, nieuwe velden en uitslagen. Fysica en invoer houden hun bestaande snelheid.


## Lianen en donutplatforms

Open **Mechanieken → Liaan** of **Mechanieken → Donutplatform** in de bouwdoos.

Een **liaan** plaats je bij het bovenste ankerpunt. Er hangt een groen touw van maximaal vier blokjes onder. Laat onder en naast het anker ruimte vrij, ook voor het lichaam van de speler. Plaats bijvoorbeeld een liaan boven een gat tussen twee platforms. Spring naar het touw: in de lucht pak je het automatisch vast. Dat kan op verschillende hoogtes. Met **← / →**, A / D of de controllerstick geef je de slinger vaart. Laat de springknop los en druk hem opnieuw in om los te laten; je neemt de snelheid van de slinger mee. **↓ / S** of de buisknop laat je ook los. Op een aanraakscherm gebruik je de bestaande loop- en springknoppen. De contextregel toont de slingerbediening. Beide bro’s kunnen in samenspel een liaan gebruiken. Op een rijdier of tijdens een raketlancering pak je geen liaan vast.

Een **donutplatform** is een ring met een open midden. Land erop om iets hoger te veren dan bij een gewone sprong. Je kunt er van onderen doorheen springen. Bij de eerste landing verschijnt een teller: **3 → 2 → 1**. Na drie seconden valt de ring naar beneden en kun je hem niet meer als platform gebruiken. De aftelling loopt door als je naar de volgende ring springt; opnieuw landen zet de klok niet terug. In de laatste seconde trilt de ring, behalve met minder beweging. Plaats meerdere ringen met wat ruimte ertussen voor een stuiterparcours. Opnieuw spelen zet alle ringen terug.

Pauzeren bevriest de slingers en aftellingen. Ankers en ringen blijven bewaard in je bouwveld, levelcollectie, JSON-downloads en eigen werelden. Samenspel deelt de beweging en de resterende donuttijd; bij grotreizen blijft de toestand van de buitenwereld bewaard. De offlineversie bevat beide onderdelen.

De [speelproef](../public_html/tests/swing-platforms.html) heeft aparte startknoppen bij een liaan en boven de donuts. Open na `npm start` `/tests/swing-platforms.html`. De proef verandert je opgeslagen levels niet. De [gerichte tests](../public_html/tests/swing-platforms.test.mjs) staan in `npm test`, inclusief een route die vanaf een platform over een gat slingert en aan de overkant landt. Broncode: `public_html/swing-platforms.mjs` voor toestand en slingeren, `engine.mjs` voor de botsingen, en `art.mjs` voor het tekenen.


## Drie achtergrondlagen

Tijdens het lopen schuiven decorlagen op verschillende snelheden voorbij. De verre laag bevat lucht, bergen of verre rotswanden. De middenlaag bevat bijvoorbeeld heuvels, bossen, een kasteel of een maanbasis. Dicht achter het speelveld staan bomen, struiken, rotsen, waterplanten of zuilen. Grootte en kleur geven extra afstand: ver weg is zachter en minder contrastrijk. Alle drie de lagen worden vóór de speelobjecten getekend en blokkeren de speler niet.

De acht gewone omgevingen en de vier Wonderland-gebieden hebben eigen kleuren en decors. In Wonderland blijven de zwevende kastelen en eilanden onderdeel van de achtergrond. De bijzondere beeldvullende illustraties van het gekke spel blijven hun eigen achtergrond vormen. Een grot houdt zijn donkere binnenwereld.

De instelling **minder beweging** laat de decorlagen op gewone wereldcoördinaten staan: ze scrollen dan gelijk met het veld, zonder extra parallax. De camera en besturing blijven bruikbaar. De lagen werken in de bouwer, het spel, samenspel en de zelfstandige `speel.html`. Je bestaande levels krijgen het decor van hun gekozen omgeving zonder dat je iets hoeft om te zetten.

Open na `npm start` `/tests/depth-backgrounds.html` voor de [kijkproef](../public_html/tests/depth-backgrounds.html). Kies een omgeving, schuif de camera of laat hem lopen. Vergelijk dit met **Minder beweging**. Deze proef verandert je opgeslagen levels niet.

De [decorbroncode](../public_html/depth-backgrounds.mjs) tekent herhaalbare vectorvormen rechtstreeks op schermresolutie. Alleen zichtbare decordelen worden ingediend. De eerdere grote rasterpanelen zijn verwijderd na een prestatieregressie in Chrome. De [gerichte tests](../public_html/tests/depth-backgrounds.test.mjs) controleren de laagsnelheden, aansluitingen, minder beweging, het ontbreken van grote decorbitmaps en ongewijzigde level- en spelgegevens. De herstelmetingen staan in [renderherstel](renderherstel.md).


## Directere besturing

Lopen op de grond komt binnen ongeveer 25 milliseconden simulatietijd op de bestaande topsnelheid. Omkeren reageert in de eerstvolgende simulatiestap en loslaten remt sneller af. De camera sluit sneller aan. De loopsnelheid zelf blijft gelijk. Water, rijdieren, glijhellingen en de extra vaart na een liaansprong gebruiken hun eigen bewegingsregels.

Korte tikjes op links/rechts worden tot de eerstvolgende simulatiestap vastgehouden, ook als je de toets tussendoor al hebt losgelaten. Dit werkt voor de lokale toetsenbord- en aanraakbediening; controllerdrukken volgen dezelfde lokale invoerverwerking. Pauzeren en focusverlies wissen de invoer. De netwerkvertraging van een tweede speler in een kamer is hiermee niet weggewerkt.

Zie [de uitleg en controles van de invoerreactie](invoerreactie.md). Herlaad de webversie na een update; gebruik voor offline spelen de opnieuw gebouwde `public_html/speel.html` uit dit project.
