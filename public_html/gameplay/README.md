# Gameplay — begin hier als student

[Projectoverzicht](../../README.md) · [Afbeeldingen, geluid en muziek](../assets/README.md) · [Technische engine](../engine/README.md)

Hier pas je de JSON-bestanden en afbeeldingen van spelonderdelen aan. Iedere concrete onderdeelmap bevat een README, een profiel en de bijbehorende plaatjes. Begin met een bestaand voorbeeld en wijzig één eigenschap tegelijk.

| Map | Wat staat erin? | Begin bijvoorbeeld bij |
| --- | --- | --- |
| [characters/](characters/README.md) | Speelbare figuren, houdingen en karaktermakeronderdelen | `characters/boaz/character.json` |
| [enemies/](enemies/README.md) | Vijanden en bazen | `enemies/game/walker/enemy.json` |
| [platforms/](platforms/README.md) | Grond, rotsen en gewone of bewegende platforms | `platforms/rock/structure.json` |
| [obstacles/](obstacles/README.md) | Stekels, lava, slingers en vuur | `obstacles/spikes/structure.json` |
| [powerups/](powerups/README.md) | Gedeeld tekenwerk voor beloningen en uitleg over krachten | `powerups/images/rewards-sheet.png` |
| [interactables/](interactables/README.md) | Buizen, vraagblokken, schakelaars, grotten en magische objecten | `interactables/pipe-up-in/structure.json` |

## Registratie

Karakters worden geregistreerd in [characters/characters.json](characters/characters.json) en vijanden in [enemies/enemies.json](enemies/enemies.json). Platforms, obstakels en interactieve bouwobjecten worden geregistreerd in [structures.json](structures.json). Daar gebruik je een pad zoals `platforms/rock` in de bestaande logische groep, bijvoorbeeld `terrain`. Lees voor alle structuurinstellingen [STRUCTURES.md](STRUCTURES.md).

Kopieer voor een eigen variant de hele onderdeelmap. Gebruik kleine letters, cijfers en streepjes in de mapnaam, beginnend met een letter. Houd `id` gelijk aan de mapnaam. PNG-paden in een profiel blijven relatief aan dat profiel en beginnen met `images/`.

Gebruik voor een nieuw bouwobject een vrij tegelnummer van 102 tot en met 255. Controleer zowel de vijand- als structuurregistratie. Bestaande nummers en profiel-IDs blijven gelijk zodat opgeslagen levels bruikbaar blijven.

## Starten en controleren

Voer commando’s uit vanuit de projectmap met `package.json`:

```sh
npm start
npm run characters:prepare
npm run enemies:prepare
npm run structures:prepare
```

Een van de bestaande Python-, PHP- of Node-starters is voldoende. Ververs de browser na een JSON- of PNG-wijziging. De controlecommando’s vernieuwen gegenereerde catalogi onder `../engine/`; bewerk die niet met de hand.

Probeer lopen, botsingen, de veranderde eigenschap, pauze en opnieuw starten. Gebruik voor de offlineversie `npm run build` en open daarna `speel.html`. Nieuwe spelregels vragen ook code in `../engine/`. De categorieën zijn een mappenindeling; alleen een extra bestand aanmaken levert geen nieuw gedrag op.
