# Power-ups en beloningen

[Alle gameplay](../README.md) · [Structuureigenschappen](../STRUCTURES.md)

Hier staat het gedeelde beloningsvel [images/rewards-sheet.png](images/rewards-sheet.png). De uitsneden staan in `../../engine/look.mjs`. Afbeeldingen van een specifiek vraagblok staan bij dat blok onder `../interactables/`.

Je kunt bestaande beloningen kiezen via `settings.reward` in het `structure.json` van een vraagblok. De spelregels van sterren, bloemen, kattenkracht en andere power-ups staan in `../../engine/engine.mjs` en de bijbehorende modules. Alleen een nieuwe PNG toevoegen maakt geen nieuwe kracht; er is geen automatische power-upcatalogus.

Behoud bij het bewerken van het beloningsvel de afmetingen en indeling. Controleer het resultaat in het spel en bouw opnieuw met `npm run build` voor offlinegebruik.
