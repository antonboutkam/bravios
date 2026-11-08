# 4. Maak je eigen soundpack

[Alle opdrachten](README.md) · [Project starten](../../README.md#lokaal-starten) · [Architectuur](../architectuur.md)

★ · 45–90 minuten · Arrays en lussen

## De case

Een sounddesigner wil dat het spel klinkt als een ruimteschip, een circus of een retro-arcade. Maak één herkenbare klankstijl voor drie acties.

**Het zichtbare resultaat:** Een sprong, muntje en overwinning klinken meteen als jouw eigen spel.

## Begin hier

Open [app.mjs](../../public_html/app.mjs) bij `unlockAudio` en `playSound`. In `melodies` staan arrays met frequenties. De lus maakt voor elke toon een oscillator. Het geluid wordt in de browser gemaakt; je hebt geen mp3-bestanden nodig.

## Maak de basisversie

1. Kies een thema en beschrijf hoe de drie acties moeten klinken.
2. Maak voor `jump`, `coin` en `win` een eigen korte melodie van twee tot zes tonen. De getallen zijn frequenties in hertz.
3. Test elke melodie in het echte spel. Verander één eigenschap tegelijk.
4. Geef je soundpack een naam in een korte codecomment en noteer waarom de melodieën bij elkaar passen.
5. Laat een klasgenoot zonder uitleg raden welke klank bij springen, verzamelen en winnen hoort.

## Controleer je resultaat

- De drie acties hebben hoorbaar verschillende, korte geluiden.
- De bestaande knop “Geluid uit” maakt ook jouw soundpack stil.
- Na opnieuw inschakelen werkt het geluid weer.
- Zonder ingeschakeld geluid blijft het spel speelbaar en verschijnt geen nieuwe consolefout.
- Je kunt uitleggen hoe de array en de lus samen een melodie vormen.

## Extra uitdaging

Voeg een keuze tussen het bestaande en jouw soundpack toe. Gebruik één object per pack zodat je dezelfde afspeelfunctie kunt houden. Laat de bestaande volumeregeling in de gain-code intact.

## Laat dit zien

Een korte demonstratie en de drie frequentiearrays met je ontwerpkeuzes. Gebruik een bescheiden luistervolume.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
