# Technische spelcode

Voor JSON en afbeeldingen begin je bij [gameplay](../gameplay/README.md). Deze map bevat de JavaScript-modules, PHP-kamerverbinding, CSS, offlinebouwer, Node-server en tests. Je hebt deze code meestal niet nodig om een figuur te tekenen of bestaande eigenschappen te wijzigen.

| Bestand of map | Rol |
| --- | --- |
| `bootstrap.mjs` | Leest de JSON-catalogi uit gameplay/-mappen en start het spel |
| `app.mjs` | Bediening, menu’s en levelbouwer |
| `engine.mjs` | Spelregels, beweging en botsingen |
| `art.mjs`, `look.mjs`, `terrain.mjs` | Spelwereld en afbeeldingen tekenen |
| `paths.mjs` | Afbeeldingen en gegevens vanuit de documentroot vinden |
| `characters/`, `enemies/`, `structures/` | Loaders, renderers, gedrag en gegenereerde catalogi |
| `games/`, `runtime/` | Kleine games, sessies en gedeelde resources |
| `room.php`, `network.mjs` | Online samenspel |
| `styles.css` | Opmaak van de website |
| `build.mjs`, `build/` | De zelfstandige offlineversie maken |
| `server.mjs` | Lokale Node-webserver |
| `tests/` | Automatische tests en browserproeven |

Voer commando’s uit vanuit de projectmap met `package.json`:

```sh
npm start
npm test
npm run build
```

`npm run characters:prepare`, `npm run enemies:prepare` en `npm run structures:prepare` controleren de gameplay-mappen en vernieuwen hier de betreffende `catalog.mjs`. Bewerk die gegenereerde bestanden niet handmatig. De browser leest de JSON bij elke paginaverversing; voor de offlineversie is opnieuw bouwen nodig.

De documentroot blijft de bovenliggende `public_html/`, zodat `index.html`, `engine/` en `gameplay/` samen beschikbaar zijn. Browserproeven staan bijvoorbeeld op `/engine/tests/adventure-map.html`; de tegelvoorbeelden op `/engine/tegels.html`.

Lees [Broncode en werking](../../docs/student/broncode.md) of de [technische architectuur](../../docs/other/architecture/architectuur.md).
