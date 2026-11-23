# Taartgooien · 3D

[Kleine games](../README.md) · [Sessiecontract](../../../../docs/other/architecture/spelpakketten.md)

Open Bravios via de webserver en kies **Kleine games → Taartgooien · 3D**. Je kunt tegen de computer spelen of **samen** op één scherm. Kies een personage met een 3D-model en druk op Start.

## Spelen

- De spelers staan tegenover elkaar op het bakkerijplein. Ieder heeft een eigen helft en een bakkerskar.
- Loop naar de gekleurde plek bij je kar. Je pakt vanzelf een taart, tot maximaal twee taarten. De kar vult elke 2,2 seconden een taart aan, tot maximaal drie.
- Gooi naar de overkant. Je richt op de plek waar je tegenstander op dat moment staat. Loop opzij om een vliegende taart te ontwijken.
- Elke rake taart is één punt. Eerst zeven raak wint. Na 90 seconden wint de hoogste score; dezelfde score is gelijkspel.

| Bediening | Speler 1 | Speler 2 |
| --- | --- | --- |
| Lopen | WASD; solo ook pijltjes | Pijltjes |
| Gooien | Spatie; solo ook Enter | Enter |
| Controller | Stick/richtingskruis + A/kruisje | Eigen controller: stick/richtingskruis + A/kruisje |
| Aanraking | Eigen pijlen en Gooi taart | Eigen pijlen en Gooi taart |

**P / Start** pauzeert. **B / rondje**, Escape of **Kies een spel** gaat terug. Na focusverlies pauzeert de ronde. De twee spelers spelen lokaal; er is geen online kamer voor dit spel.

## Bestanden

- `model.mjs`: beweging, voorraad, oppakken, worpen, raakregels, computer en uitslag.
- `render.mjs`: Babylon.js, beide bestaande GLB-personages, bakkerskarretjes, taarten en slagroom.
- `game.mjs`: vaste simulatiestappen, bediening, pauze en de koppeling met het minigamemenu.

De WebGL-scène krijgt een eigen canvas. De sessie heeft geen eigen animatielus: de bestaande schil stuurt updates en tekenen. Bij teruggaan worden scène, modellen en engine vrijgegeven. GLB-bestanden komen uit `gameplay/characters/<id>/3d/model.glb`. De bestaande offlinebuild neemt de benodigde modules en modellen mee.

## Controleren

Voer vanuit de projectroot uit:

```sh
node --test public_html/engine/tests/cake-throw.test.mjs
node public_html/engine/tests/small-games-ui.test.mjs
node public_html/engine/tests/game-runtime.test.mjs
npm test
npm run build
```

De scènecontrole gebruikt Babylon NullEngine en laadt de echte modellen. De UI-tests controleren de daadwerkelijke menu- en invoerhandlers met een DOM-adapter. Daarmee zijn schermbeeld, prestaties en fysieke controllers nog niet visueel of op hardware gecontroleerd.
