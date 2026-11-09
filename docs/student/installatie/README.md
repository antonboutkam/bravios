# Installeren

[Studentenhandleiding](../README.md) · [Volgende stap: starten](../starten.md)

## Wat heb je nodig?

- Een computer met een browser, bijvoorbeeld Chrome, Edge of Firefox.
- Een code-editor, bijvoorbeeld Visual Studio Code.
- Node.js met npm. Het project vereist Node.js 18 of nieuwer; gebruik voor een nieuwe installatie een ondersteunde LTS-versie.
- De volledige projectmap van Bravios, via je docent of de repository.

PHP is alleen nodig voor online samenspel en de volledige testsuite. Voor je eerste start is Node.js voldoende. Je hebt geen database of account in het spel nodig.

## Stap 1: zet de projectmap klaar

Ontvang je een zipbestand? Pak het eerst helemaal uit. Werk niet rechtstreeks in de zip. Heb je een repositoryadres van je docent, dan kun je het project ook met Git klonen. Gebruik daarvoor het adres dat je docent heeft gegeven.

Open in je editor de map waarin `package.json`, `README.md`, `docs` en `public_html` staan. Dit is de **projectroot**: de hoofdmap van het project.

## Stap 2: controleer Node.js en npm

Open een terminal in je editor. In Visual Studio Code kan dit via **Terminal → New Terminal**. Een terminal is een venster waarin je commando’s typt. Voer deze commando’s afzonderlijk uit:

```sh
node --version
npm --version
```

Beide commando’s moeten een versienummer geven. Het eerste nummer na de `v` bij Node.js moet minimaal 18 zijn. Wordt het commando niet herkend? Installeer Node.js met npm via de softwarevoorziening van je school of de officiële Node.js-installatie. Sluit daarna je editor en open hem opnieuw. Vraag je docent om hulp als je geen installatierechten hebt.

Dit project gebruikt geen externe npm-pakketten. Je hoeft daarom geen `npm install` uit te voeren.

## Stap 3: controleer je werkmap

In de bestandslijst van je editor moet je `package.json` direct kunnen zien. Krijg je straks een fout over een ontbrekend `package.json`, dan staat de terminal waarschijnlijk in de verkeerde map. Open een terminal vanuit de projectmap, of ga erheen met `cd "pad/naar/bravios"` en vervang het voorbeeldpad door jouw eigen pad.

Ga verder met [starten en uitproberen](../starten.md).
