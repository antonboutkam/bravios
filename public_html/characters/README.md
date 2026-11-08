# Karakters

Elke vaste held heeft een eigen map met `character.mjs`, een portret en mappen per spelvariant/aanzicht. `platformer/` bevat de bestaande spritevellen en hun configuratie. `custom/` bevat de karaktermaker en alle samenstelbare onderdelen. `shared/` bevat gedeelde rendercode en het beheer van view-bitmaps.

De stabiele karakter-ID en appearance reizen met de speler mee; beelden horen bij een expliciet aanzicht. `top-down` en `oblique` zijn voorbereid als aanzicht, maar hebben nog geen beeldmateriaal. Voeg geen zijaanzicht toe onder een andere naam als vervanging.

Zie [spelpakketten en het karaktercontract](../../docs/spelpakketten.md).
