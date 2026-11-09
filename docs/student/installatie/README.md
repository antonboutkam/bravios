# Installeren

[Studentenhandleiding](../README.md) · [Volgende stap: starten](../starten.md)

## Wat heb je nodig?

- Een computer met een browser, bijvoorbeeld Chrome, Edge of Firefox.
- Een code-editor, bijvoorbeeld Visual Studio Code.
- Eén serveromgeving: Python 3, PHP 8.1 of nieuwer, of Node.js 18 of nieuwer.
- De volledige projectmap van Bravios, via je docent of de repository.

PHP is nodig voor online samenspel. Voor solo spelen is één van de drie omgevingen voldoende. Ontwikkelcommando’s zoals de offlinebuild vereisen Node.js; de volledige testsuite vereist ook PHP. Je hebt geen database of account in het spel nodig.

## Stap 1: zet de projectmap klaar

Ontvang je een zipbestand? Pak het eerst helemaal uit. Werk niet rechtstreeks in de zip. Heb je een repositoryadres van je docent, dan kun je het project ook met Git klonen. Gebruik daarvoor het adres dat je docent heeft gegeven.

Open in je editor de map waarin `package.json`, `README.md`, `docs` en `public_html` staan. Dit is de **projectroot**: de hoofdmap van het project.

## Stap 2: controleer je serveromgeving

Heb je al Python, PHP of Node.js? Dan hoef je geen tweede omgeving te installeren. Op Windows kiest `start-server.bat` automatisch een beschikbare omgeving.

Open een terminal in je editor, bijvoorbeeld via **Terminal → New Terminal** in Visual Studio Code. Controleer de omgeving die je wilt gebruiken met `python --version` (macOS/Linux: `python3 --version`), `php --version` of `node --version`.

Wordt geen commando herkend? Installeer één van deze omgevingen via de softwarevoorziening van je school. Sluit daarna je editor en open hem opnieuw. Vraag je docent om hulp als je geen installatierechten hebt.

Er zijn geen externe pakketten nodig. Je hoeft geen `npm install` of `pip install` uit te voeren.

## Stap 3: controleer je werkmap

In de bestandslijst van je editor moet je `package.json` direct kunnen zien. Krijg je straks een fout over een ontbrekend `package.json`, dan staat de terminal waarschijnlijk in de verkeerde map. Open een terminal vanuit de projectmap, of ga erheen met `cd "pad/naar/bravios"` en vervang het voorbeeldpad door jouw eigen pad.

Ga verder met [starten en uitproberen](../starten.md).
