# 6. Van munt naar ruimtejuweel

[Alle opdrachten](README.md) · [Project starten](../../../README.md#lokaal-starten) · [Architectuur](../../other/architecture/architectuur.md)

★★ · 60–120 minuten · Canvas en coördinaten

## De case

Een ontwerper wil muntjes vervangen door lichtgevende ruimtejuwelen. De beloning moet anders ogen en hetzelfde blijven werken.

**Het zichtbare resultaat:** Overal waar eerst een muntje stond, draait of zweeft nu jouw eigen juweel.

## Begin hier

Open [art.mjs](../../../public_html/art.mjs) bij `drawTile`. Zoek `id === 4` en `drawLook(ctx, 'coin'`. Let op: er is tekenwerk voor geladen sprites en ook een terugvalweergave. `ctx.save`, `translate`, `scale` en `restore` bepalen de lokale tekenruimte.

## Maak de basisversie

1. Schets een juweel binnen een vak van 32 × 32 pixels. Markeer de hoekpunten.
2. Maak in hetzelfde bestand een tekenfunctie met `beginPath`, `moveTo`, `lineTo` en `fill`. Gebruik minstens twee vlakken voor een lichte en donkere kant.
3. Roep die functie aan op de plekken waar tegel 4 wordt getekend. Houd rekening met de bestaande schaal en vertaling; gebruik per tak de juiste lokale coördinaten.
4. Voeg een kleine beweging op basis van `time` toe. Houd het bouwdoosicoon stil met de bestaande `icon`-optie.
5. Verander uitsluitend de weergave; tegel-ID 4 en het verzamelen blijven gelijk.

## Controleer je resultaat

- Je juweel is herkenbaar in de bouwdoos én in het speelveld.
- Een juweel verzamelen telt nog precies één muntje op.
- Klein en groot getekende voorbeelden passen binnen hun vak.
- Naastgelegen tegels hebben na jouw tekenfunctie nog de juiste kleur en schaal: herstel de canvasstatus.
- De opnieuw gebouwde `speel.html` toont hetzelfde juweel.

## Extra uitdaging

Geef het juweel een paar glinsteringen. Gebruik de bestaande instelling voor minder beweging om animatie stil te zetten; bekijk eerst hoe andere tekenfuncties deze instelling ontvangen.

## Laat dit zien

Je schets, testlevel en demo van bouwen, spelen en verzamelen.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
