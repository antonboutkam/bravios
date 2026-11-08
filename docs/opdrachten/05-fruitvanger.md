# 5. Fruitvanger op jouw niveau

[Alle opdrachten](README.md) · [Project starten](../../README.md#lokaal-starten) · [Architectuur](../architectuur.md)

★★ · 90–180 minuten · Objecten, events en spelregels

## De case

Een jongere speler vindt Fruitvanger te snel; een klasgenoot wil juist meer uitdaging. Laat de speler vóór een ronde kiezen tussen Rustig en Turbo.

**Het zichtbare resultaat:** Hetzelfde spel voelt met één keuze ontspannen of razendsnel.

## Begin hier

Open [small-games.mjs](../../public_html/small-games.mjs). Zoek `createSmallGame`, `stepSmallGame`, `begin` en `refreshSmallUI`. In de fruit-tak staat de valsnelheid `115 + g.score * 6`. Gebruik [small-games.test.mjs](../../public_html/tests/small-games.test.mjs) als testvoorbeeld.

## Maak de basisversie

1. Maak twee instellingenobjecten, bijvoorbeeld Rustig met basissnelheid 90 en Turbo met 180. Houd het doel van tien appels en maximaal vijf missers gelijk.
2. Voeg in [index.html](../../public_html/index.html) bij het minigamevenster een gelabelde keuze toe. Gebruik die keuze alleen voor Fruitvanger.
3. Geef de gekozen instelling bij het starten door aan de spelstand. Zorg dat bestaande aanroepen zonder keuze de oude snelheid houden.
4. Laat de fruit-tak de snelheid uit de spelstand lezen. Toon het gekozen niveau bij Fruitvanger.
5. Leg het niveau per ronde vast. Een gewijzigde keuze geldt pas bij de volgende start; “Opnieuw spelen” start met de dan gekozen stand.

## Controleer je resultaat

- Een appel valt bij dezelfde verstreken tijd verder in Turbo dan in Rustig.
- Tien vangsten winnen nog steeds; vijf missers beëindigen nog steeds het spel.
- Een ronde houdt zijn gekozen snelheid, ook als de keuze wordt gewijzigd.
- Mik & schiet en Ballonnenpret blijven werken zoals eerst.
- Een automatische test vergelijkt twee spelstanden met dezelfde fruitpositie en tijdstap; de bestaande minigametests slagen ook.

## Extra uitdaging

Laat de speler zelf de basissnelheid kiezen met een begrensde schuifregelaar. Houd de opgeslagen ronde-instelling gescheiden van de nieuwe menukeuze.

## Laat dit zien

Je instellingenobjecten, demo van beide snelheden en de uitvoer van de gerichte tests. Gebruik kleine tijdstappen: `stepSmallGame` begrenst `dt` tot 0,05 seconde.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
