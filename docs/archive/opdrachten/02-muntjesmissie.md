# 2. Muntjesmissie

[Alle opdrachten](README.md) · [Project starten](../../../README.md#lokaal-starten) · [Architectuur](../../other/architecture/architectuur.md)

★ · 60–120 minuten · JavaScript, DOM en rekenen

## De case

Een speler wil tijdens het spelen zien hoeveel muntjes er nog te verzamelen zijn. Voeg een voortgangsbalk met een leesbare teller toe.

**Het zichtbare resultaat:** Bij elk muntje loopt jouw missiebalk verder vol. Na het laatste muntje verschijnt een korte felicitatie.

## Begin hier

Open [app.mjs](../../../public_html/engine/app.mjs) bij `updateGameHud`. Bekijk `game.coins`, `game.totalCoins` en `coin-count`. Voeg je eigen element toe naast de bestaande teller in [index.html](../../../public_html/index.html). De HUD is de informatiebalk boven het spel.

## Maak de basisversie

1. Bouw een level met tien losse muntjes. Gebruik geen vraagblokken of speciale spelonderdelen.
2. Voeg een gelabeld `<progress>`-element en een eigen tekstvak toe. Laat de bestaande teller staan.
3. Maak een functie die verzameld en totaal omzet naar voortgang. Begrens de uitkomst; behandel totaal nul apart.
4. Werk je elementen bij vanuit `updateGameHud`. Gebruik voor deze basisversie de gegevens van het gewone eigen speelveld.
5. Toon bijvoorbeeld “3 van 10 muntjes” en bij voltooiing “Alles gevonden!”. Toon bij nul totaal “Geen muntjes in dit veld”.

## Controleer je resultaat

- Met 0, 5 en 10 verzamelde muntjes zie je respectievelijk een lege, halve en volle balk.
- Een leeg muntjesveld geeft geen `NaN`, oneindigheid of foutmelding.
- Opnieuw spelen zet de balk terug naar de nieuwe spelstand.
- Naast de balk staat tekst; de informatie hangt niet alleen van kleur af.
- De finish werkt nog zoals eerst: dit is een extra weergave, geen nieuwe winvoorwaarde.

## Extra uitdaging

Voeg een korte CSS-overgang toe en schakel die uit bij `prefers-reduced-motion`. Onderzoek daarna apart hoe je voortgang wilt definiëren bij vraagblokken en tijdelijke P-muntjes.

## Laat dit zien

Je testlevel en een tabel met de berekening voor 0/10, 5/10, 10/10 en 0/0.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
