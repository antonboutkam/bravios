# 8. De levelinspecteur

[Alle opdrachten](README.md) · [Project starten](../../../README.md#lokaal-starten) · [Architectuur](../../other/architecture/architectuur.md)

★★ · 90–180 minuten · Node.js, JSON en validatie

## De case

Een levelmaker wil vóór het delen een kort technisch rapport: hoe groot is het veld, hoeveel muntjes staan erin en kan het spel het bestand lezen? Bouw een klein hulpmiddel naast het spel.

**Het zichtbare resultaat:** Je eigen commandoregeltool onderzoekt een echt levelbestand en maakt er een leesbaar rapport van.

## Begin hier

Open [engine.mjs](../../../public_html/engine.mjs) bij `validateLevel` en `positions`. Download via het spel een levelbestand en bekijk de inhoud. Maak daarna in de projectroot een nieuw script `levelinspecteur.mjs`; dit draait in Node en hoeft niet in de spelserver of offlinebuild.

## Maak de basisversie

1. Lees het bestandspad uit `process.argv[2]`. Geef zonder pad een korte gebruiksuitleg.
2. Lees het bestand met `readFile` uit `node:fs/promises` en gebruik `JSON.parse`.
3. Importeer `validateLevel` en `positions` uit `./public_html/engine.mjs`. Laat de bestaande validator de gegevens beoordelen; bouw geen tweede validator na.
4. Rapporteer over het teruggegeven level: naam, thema, breedte, aantal rijen, losse muntjes (4), startplek (10) en finish (11).
5. Vang een ontbrekend bestand, ongeldige JSON en afkeuring door de validator op. Geef een begrijpelijke fout en stel `process.exitCode = 1` in.
6. Schrijf of wijzig het invoerbestand niet.

## Controleer je resultaat

- `node levelinspecteur.mjs mijn-level.json` toont de juiste afmetingen en aantallen van jouw exportbestand.
- Zonder argument verschijnt gebruiksuitleg.
- Een verkeerd pad, kapotte JSON en een level dat de validator afkeurt leveren drie begrijpelijke foutmeldingen op.
- Na de inspectie is het oorspronkelijke bestand ongewijzigd.
- Het rapport zegt dat gegevens geldig zijn volgens de validator. Het beweert niet dat de finish bereikbaar is.

## Extra uitdaging

Geef waarschuwingen voor weinig losse muntjes of een erg leeg veld. Of voeg `--json` toe voor een machineleesbaar rapport. Houd waarschuwingen gescheiden van validatiefouten.

## Laat dit zien

Het script, één geldig proefbestand, ongeldige proefinvoer en de terminaluitvoer. Leg uit waarom een geldig gegevensformaat nog geen speelbaar level bewijst.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
