# Character Anton: zes callbacks

[Alle characters en callback-uitleg](../README.md) · [Configuratie](character.json) · [JavaScript-voorbeelden](callbacks.js)

Antons `character.json` koppelt alle zes gebeurtenissen aan functies in `callbacks.js`. Iedere functie bevat commentaar met uitleg over parameters, tellers en voorwaarden.

| Gebeurtenis | Functie | Uitproberen |
| --- | --- | --- |
| `onSpawn` | `begroetSpeler` | Start een 2D-veld met Anton; lees de begroeting. Kom in co-op terug na afgaan. |
| `onJump` | `telSprongen` | Spring drie keer; bekijk de melding. |
| `onCollectCoin` | `beloonMuntje` | Pak vijf muntjes met een volle en daarna met een beschadigde levensbalk. |
| `onDamage` | `reageerOpSchade` | Laat een vijand je raken; bekijk de teller en waarschuwing bij één leven. |
| `onSpecial` | `activeerSchild` | Druk E, RB / R1 of Kracht E. Het schild stopt één gewone treffer, maximaal drie seconden. |
| `onWin` | `vierOverwinning` | Bereik de finish, met en zonder eerder levenspunten te verliezen. |

De speciale kracht heeft acht seconden wachttijd. Bonuspunten verschijnen in de statusbalk; echte muntjes houden hun bestaande betekenis. De zes gebeurtenissen werken in de 2D-platformer, inclusief muntjesuitdagingen en online samenspel. De kleine games en 3D gebruiken dit gedrag nog niet.

Verander eerst één functie. Voer `npm run characters:prepare` uit vanuit de projectmap, ververs met F5 en probeer opnieuw. Maak de offlineversie opnieuw met `npm run build`. De volledige context-API, afspraken voor data en foutmeldingen staan in de [README van de characters-map](../README.md#je-karakter-programmeren-met-callbacks).
