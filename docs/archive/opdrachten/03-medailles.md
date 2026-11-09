# 3. Een medaille bij de finish

[Alle opdrachten](README.md) · [Project starten](../../../README.md#lokaal-starten) · [Architectuur](../../other/architecture/architectuur.md)

★ · 60–120 minuten · Functies en voorwaarden

## De case

Een organisator van een gamewedstrijd wil spelers na de finish een medaille geven. De speler hoeft niet opnieuw te leren spelen: jouw beloning komt bij de bestaande uitslag.

**Het zichtbare resultaat:** Bij de finish verschijnt een grote bronzen, zilveren of gouden medaille.

## Begin hier

Open [app.mjs](../../../public_html/engine/app.mjs) bij `showResult`. Daar staan `game.state`, `game.coins` en `game.totalCoins`. De uitslagelementen staan in [index.html](../../../public_html/index.html) bij `result-title` en `result-copy`.

## Maak de basisversie

1. Spreek de regels af: minder dan 50% is brons; vanaf 50% is zilver; vanaf 100% is goud. Zonder muntjes verschijnt “Parcours voltooid”, zonder medaille.
2. Maak een losse functie die verzameld en totaal ontvangt en een naam teruggeeft. Laat die functie geen HTML aanpassen.
3. Voeg een eigen uitslagelement toe en vul het bij `state === 'won'`.
4. Verberg of leeg dit element bij pauzeren en verliezen, zodat een oude medaille niet blijft staan.
5. Geef de beloning tekst én een eigen visuele stijl. Je hoeft geen afbeelding te downloaden.

## Controleer je resultaat

- Bij een testlevel met tien muntjes geven 0 en 4 brons, 5 en 9 zilver, en 10 goud.
- Een level zonder muntjes toont de afgesproken tekst.
- Pauzeren of verliezen geeft geen medaille; opnieuw spelen laat geen oude uitslag zien.
- De bestaande uitslag en knoppen blijven bruikbaar.
- Je kunt uitleggen waarom de volgorde van je voorwaarden uitmaakt.

## Extra uitdaging

Voeg een korte podiumanimatie toe met respect voor minder beweging. Of maak gerichte automatische tests voor je berekenfunctie, inclusief exact 50% en 100%.

## Laat dit zien

Je medailleregels, het testlevel en het testverslag met de grenswaarden.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
