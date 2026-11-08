# 7. Verbreek je eigen record

[Alle opdrachten](README.md) · [Project starten](../../README.md#lokaal-starten) · [Architectuur](../architectuur.md)

★★ · 90–180 minuten · localStorage en JSON

## De case

Een speler wil onthouden wat zijn snelste voltooide ronde is. Voeg voor één vast eigen testlevel een persoonlijk tijdrecord toe.

**Het zichtbare resultaat:** “Nieuw record!” verschijnt na een snelle ronde. Na herladen staat de beste tijd er nog.

## Begin hier

Open [app.mjs](../../public_html/app.mjs) bij `showResult` en de bestaande opslagcode. Bekijk `game.time`, `game.state` en `room`. Gebruik voor de opdracht een aparte sleutel, bijvoorbeeld `bravios-student-record-v1`; wijzig de bestaande spelopslag niet.

## Maak de basisversie

1. Kies één vast testlevel, zonder het tussendoor te bewerken. Gebruik één recordvak voor dat level. Geen records per level en geen online ranglijst in deze basisversie.
2. Maak kleine functies voor lezen, vergelijken en bewaren. Bewaar een object met de beste tijd in seconden als JSON.
3. Werk het record uitsluitend bij een gewonnen soloronde van je vaste eigen proeflevel bij. Sla campagnes en andere spelmodi over; bekijk daarvoor de modusvariabelen rond `showResult`. Een lagere tijd wint; gelijkspel behoudt het bestaande record.
4. Toon na de finish de huidige tijd en beste tijd, plus “Nieuw record!” als die is verbeterd.
5. Vang ontbrekende, ongeldige of onleesbare opslag op. Accepteer alleen een eindige, positieve numerieke tijd. Bij een schrijffout moet de uitslag nog bruikbaar zijn.
6. Voeg een knop toe die uitsluitend jouw recordsleutel wist. Vertel in de interface dat het record bij het vaste proeflevel hoort.

## Controleer je resultaat

- De eerste overwinning maakt een record; een tragere ronde overschrijft het niet.
- Een snellere ronde vervangt het record; een gelijke tijd geeft geen nieuw record.
- Pauzeren, verliezen en samenspel schrijven geen record.
- Herladen bewaart het record op hetzelfde webadres.
- Ongeldige JSON en een ongeldige tijd geven geen crash.
- De resetknop verwijdert geen levels, personages of campagnevoortgang.

## Extra uitdaging

Onderzoek hoe je een stabiele levelidentiteit kunt bepalen en voeg daarna records per level toe. Alleen de levelnaam gebruiken is onvoldoende: twee verschillende levels kunnen dezelfde naam hebben.

## Laat dit zien

Een testverslag met eerste/snellere/tragere ronde, herladen en beschadigde opslag. Noteer dat offline en localhost aparte opslag kunnen hebben.

Volg daarnaast de [gezamenlijke inleverafspraken](README.md#dit-lever-je-in). De extra uitdaging is optioneel.
