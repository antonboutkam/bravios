# Kleine opdrachten met zichtbaar resultaat

[Terug naar README](../../../README.md) · [Architectuur](../../other/architecture/architectuur.md) · [Spelhandleiding](../../student/spelhandleiding.md)

## Kies je opdracht

| Opdracht | Voorkennis | Basisversie |
| --- | --- | --- |
| [1. Jouw gamehuisstijl](01-huisstijl.md) | HTML en CSS | 45–90 minuten |
| [2. Muntjesmissie](02-muntjesmissie.md) | Variabelen, rekenen en DOM | 60–120 minuten |
| [3. Medailles](03-medailles.md) | Functies en if/else | 60–120 minuten |
| [4. Soundpack](04-soundpack.md) | Arrays en lussen lezen | 45–90 minuten |
| [5. Fruitvanger](05-fruitvanger.md) | Objecten, functies en events | 90–180 minuten |
| [6. Ruimtejuweel](06-ruimtejuweel.md) | Functies en coördinaten | 60–120 minuten |
| [7. Persoonlijk record](07-record.md) | Objecten, JSON en DOM | 90–180 minuten |
| [8. Levelinspecteur](08-levelinspecteur.md) | Arrays, lussen en Node.js | 90–180 minuten |

De tijden zijn richtlijnen na installatie. Kies één basisversie en maak die af. Kies daarna pas een uitbreiding. De opdrachten zijn wijzigingsvoorstellen: deze functies zijn nog niet door deze documentatie aan het spel toegevoegd.

## Zo werk je

1. Start het spel met de instructies in de README.
2. Download een klein eigen testlevel voordat je code wijzigt. Gebruik voor muntjesopdrachten tien losse muntjes, één startplek en één finish, zonder vijanden of vraagblokken.
3. Noteer wat je gaat veranderen en welke twee of drie controles je gaat uitvoeren.
4. Zoek de genoemde functie of het HTML-ID in je editor. Bekijk ook waar die code wordt aangeroepen.
5. Maak de kleinste werkende versie. Herlaad en speel na elke kleine stap.
6. Laat een klasgenoot je controles uitvoeren. Verbeter wat onduidelijk of stuk is.
7. Bouw bij wijzigingen aan de spelcode de offlineversie met `npm run build` en controleer die in de browser.

Werk in je eigen projectkopie of, als de docent Git beschikbaar heeft gemaakt, in een eigen branch. Deel één wijziging per keer; vooral `app.mjs` en `art.mjs` worden door meerdere opdrachten geraakt.

## Dit lever je in

- De gewijzigde bronbestanden of een commit/diff volgens de afspraak van je docent. Vermeld welke bestanden je aanpaste.
- Je gedownloade testlevel, als je opdracht een level gebruikt.
- Een korte demo van maximaal één minuut met het resultaat en één randgeval.
- Een testverslag: situatie, verwacht resultaat, werkelijk resultaat. Neem ook een mislukte of ongeldige invoer mee als die bij je opdracht hoort.
- Vijf tot tien regels uitleg: waar staat je wijziging, hoe werkt die en wat heb je na feedback verbeterd?

Noteer welke hulp of AI je gebruikte en leg zelf je code uit. Alleen een andere kleur of constante invullen is voor de codeopdrachten niet voldoende: laat ook de functie, berekening of instelling zien die je hebt gemaakt.

## Voor de docent

Begin met een korte gezamenlijke verkenning: `index.html` is de interface, `app.mjs` verbindt de onderdelen, `engine.mjs` bevat spelregels en `art.mjs` tekent. Laat één muntje verzamelen en zoek samen `coin-count`. Studenten hoeven de volledige engine niet te begrijpen.

Een mogelijke reeks is drie lessen van 90 minuten. Les 1: lokaal starten, proeflevel bouwen en opdracht 1 of 4. Les 2: opdracht 2 of 3 met een functie en randgevallen. Les 3: keuze uit 5–8, afhankelijk van voorkennis, met demo en feedback. Opdracht 5 en 7 kunnen een extra les vragen. Geef bij beginnende studenten vooraf een gemarkeerde functie of een klein startskelet.

Gebruik onderstaande criteria als formatieve checklist. Spreek vóór de les af wat voor jouw klas voldoende is.

| Criterium | Zichtbaar bewijs |
| --- | --- |
| Resultaat | De basisversie voldoet aan de controlepunten van de opdracht |
| Begrip | De student volgt invoer → verwerking → resultaat in de eigen code |
| Code | Namen zijn duidelijk, de wijziging is klein en herhaling is beperkt |
| Controle | De student toont normale situaties en relevante randgevallen |
| Samenwerken | Een klasgenoot heeft getest en feedback is verwerkt |

Laat studenten eerst lokaal solo werken. Samenspel vraagt extra serverkennis en staat buiten de basisopdrachten. Een nieuwe vijand of nieuw tegeltype is ook groter werk: daarvoor moeten onder meer engine, tekenwerk, editor, opslag, PHP-validatie en offlinebuild samen kloppen. De kleine opdrachten gebruiken daarom bestaande onderdelen.

Voor uitbreidingen: laat de student zelf een acceptatiecriterium formuleren. Beoordeel de werkende basis voordat je extra’s meetelt.
