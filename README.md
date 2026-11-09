# Bravios — spelen, bouwen en leren programmeren

![Bravios-logo](public_html/assets/look/logo.png)

Bravios is een Nederlandstalige 2D-platformgame met een levelbouwer. Bouw een parcours, verzamel muntjes, ontwijk vijanden en haal de finish. Je kunt ook eigen werelden en personages maken en campagnes en kleine games spelen.

Voor eerstejaars studenten mbo niveau 4 Software Development: begin bij de [studentenhandleiding](docs/student/README.md). Daar vind je installatie, starten en een eerste uitleg van de broncode.

## Lokaal starten

Op Windows kun je dubbelklikken op **`start-server.bat`**. Dit kiest automatisch PHP, Python of Node.js, afhankelijk van wat geïnstalleerd is.

Of open een terminal in de projectmap en kies één van deze commando’s:

| Omgeving | Commando |
| --- | --- |
| Python 3 | `python server/server.py` (op macOS/Linux meestal `python3`) |
| PHP 8.1+ | `php server/server.php` |
| Node.js 18+ | `node server/server.js` of `npm start` |

Eén van deze omgevingen is voldoende. Extra pakketten installeren is niet nodig. Open **http://localhost:8080** en stop met Ctrl+C. Samenspel vereist de PHP-server. Zie de [installatie-instructies](docs/student/installatie/README.md) en de [startinstructies](docs/student/starten.md) voor hulp.

## Documentatie

- [Vijanden en bazen aanpassen](public_html/enemies/README.md): eigenschappen in JSON en animaties in PNG.
- [Studentenhandleiding](docs/student/README.md): installatie, starten, broncode en werking.
- [Uitgebreide spelhandleiding](docs/student/spelhandleiding.md): bediening, bouwen en spelmogelijkheden.
- [Technische architectuur](docs/other/architecture/architectuur.md): modules, opslag en resources.
- [Technische installatie en commando’s](docs/other/installation/README.md): servers, offlinebuild en tests.
- [Werken met code-assistenten](docs/other/agents/README.md): wegwijzer voor ontwikkelwerk.
- [Documentatieoverzicht](docs/README.md): indeling van alle documentatie.
- [Archief](docs/archive/README.md): eerdere ontwikkelrapporten, metingen en opdrachten.
