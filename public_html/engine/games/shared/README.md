# Gedeelde code voor kleine games

[Nieuwe game toevoegen](../README.md) · [Sessiecontract](../../../../docs/other/architecture/spelpakketten.md)

Deze map bevat hulpmiddelen die meerdere games delen. Je registreert `shared` niet als game in de catalogus. Voor een nieuw spel maak je een eigen pakketmap, bijvoorbeeld naast `catch/`.

## Bestanden

| Bestand | Rol |
| --- | --- |
| [session.mjs](session.mjs) | `wrapGameSession` vertaalt model/render/invoer naar het sessiecontract. |
| [backdrop.mjs](backdrop.mjs) | Gedeelde achtergrond en kleine tekenhulpmiddelen. |

## Een bestaande adapter gebruiken

Bekijk `../catch/game.mjs` als klein voorbeeld. Maak eerst eigen begintoestand in de modelmodule en geef die aan `wrapGameSession`, samen met `step`, `draw`, `ui` en de bedieningsfuncties die jouw game nodig heeft. De huidige adapter gebruikt een logisch canvas van 800 × 440; de schil schaalt daarvoor aanwijzerposities en het werkelijke canvas.

Verzamel spelspecifieke regels niet in deze map. Een andere mand, ballon of winstgrens hoort in de eigen game. Verander de gedeelde adapter pas wanneer meerdere pakketten hetzelfde nieuwe sessiegedrag nodig hebben.

## Het contract uitbreiden

1. Beschrijf welk nieuw vermogen een sessie krijgt, bijvoorbeeld een echte pauzestand.
2. Werk adapter, schil en afnemende games samen bij; een capability-vlag zonder implementatie is geen werkende functie.
3. Maak een terugval voor bestaande games die de nieuwe functie niet aanbieden.
4. Gebruik de bestaande sessiescope voor extra listeners, timers en beelden. De adapter zet bij `dispose` zijn eigen toestand en services los; door jou gemaakte resources moet je ook afmelden.
5. Controleer alle vier de bestaande games, wisselen tussen games, opnieuw starten en laat binnenkomende async resultaten geen al gesloten sessie heropenen.

## Controleren

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

```sh
node public_html/engine/tests/game-runtime.test.mjs
node public_html/engine/tests/small-games.test.mjs
node public_html/engine/tests/small-games-ui.test.mjs
```

Voer bij contractwijzigingen ook `npm test` uit. Controleer toetsen, muis/touch en controller waar ondersteund, vervolgens de offlinebuild. Een nieuwe game met een ander speelveld mag een eigen sessieadapter implementeren, maar moet hetzelfde contract naar de schil blijven leveren.
