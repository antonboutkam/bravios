# Starten en uitproberen

[Studentenhandleiding](README.md) · [Installeren](installatie/README.md) · [Broncode](broncode.md)

## Start de webserver

Op Windows: dubbelklik op `start-server.bat` in de projectroot. Het bestand kiest automatisch PHP, Python of Node.js. PHP heeft voorrang, omdat daarmee ook samenspel werkt.

Je kunt ook zelf een omgeving kiezen. Open een terminal in de projectroot en voer **één** commando uit:

| Geïnstalleerde omgeving | Commando |
| --- | --- |
| Python 3 | `python server/server.py` |
| Python 3 op macOS/Linux | `python3 server/server.py` |
| PHP 8.1 of nieuwer | `php server/server.php` |
| Node.js 18 of nieuwer | `node server/server.js` of `npm start` |

Er zijn geen extra pakketten nodig. Python en Node.js ondersteunen solo spelen en bouwen; samenspel vereist PHP.

Laat de terminal open. Open **http://localhost:8080** in je browser. `localhost` betekent je eigen computer. De webserver levert de bestanden aan je browser. Het startcommando blijft daarom actief totdat je het stopt met **Ctrl+C** in de terminal.

## Maak een klein level

1. Kies **Bouw je eigen veld**.
2. Plaats een paar blokken en muntjes. Zorg dat je level een startplek en finish heeft.
3. Kies **Speel je level** en probeer de finish te halen. Beweeg met de pijltjestoetsen en spring met de spatiebalk.
4. Keer terug naar de bouwer en verbeter je route.
5. Kies **Download level** om een JSON-bestand te bewaren. Met **Open levelbestand** kun je dat later weer laden.

De browser bewaart ook gegevens lokaal. Die opslag hoort bij je browserprofiel en het gebruikte adres. Op een andere computer, een andere poort of na het wissen van browsergegevens kunnen je levels ontbreken. Bewaar daarom een gedownload level als reservekopie.

## Probeer een codewijziging

Open `public_html/index.html` in je editor. Zoek een zichtbare tekst, bijvoorbeeld **Bouw je eigen veld**, en verander alleen die tekst. Bewaar het bestand en herlaad de browser. Controleer of je wijziging zichtbaar is en de knop nog werkt. Zet de tekst daarna terug of bewaar je wijziging volgens de afspraak met je docent.

HTML beschrijft de pagina, CSS bepaalt de vormgeving en JavaScript regelt het gedrag. In de [uitleg van de broncode](broncode.md) lees je hoe dit project die onderdelen gebruikt.

## Als starten niet lukt

| Probleem | Wat kun je doen? |
| --- | --- |
| Je startcommando wordt niet herkend | Volg de [installatiestappen](installatie/README.md) en open je editor opnieuw. |
| `package.json` ontbreekt | Open de terminal in de projectroot. |
| Poort 8080 is bezet (`EADDRINUSE`) | Stop een eerdere server met Ctrl+C. Start daarna opnieuw. |
| De pagina opent niet | Controleer of de terminal nog draait en gebruik `http://localhost:8080`. |
| Je wijziging verschijnt niet | Bewaar het bestand en herlaad de pagina; controleer of je de juiste projectkopie hebt geopend. |
| Samenspel geeft een fout over PHP | Gebruik de [technische startinstructies](../other/installation/README.md#network-play-with-php). |

Voor offline spelen, andere poorten en tests: zie [technische installatie en commando’s](../other/installation/README.md).
