# Spelpakketten

Elk spel heeft een eigen map met `game.mjs` (sessiefactory en bediening), `model.mjs` (simulatie) en `render.mjs` (beeld). Spelspecifieke afbeeldingen en geluiden horen bij hetzelfde pakket. De bestaande games gebruiken hun gedeelde canvasachtergrond uit `shared/`.

Registreer een nieuw spel in `catalog.mjs`. De schil in `shell.mjs` regelt fullscreen, de menukeuze en invoer. `platformer/encounters.mjs` onderbreekt en hervat de bestaande platformengine; die engine en de bouwer staan nog op hun oorspronkelijke paden.

Zie [het sessiecontract en de uitbreidingsstappen](../../docs/spelpakketten.md).
