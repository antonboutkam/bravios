# Interactieve objecten

[Alle gameplay](../README.md) · [JSON-eigenschappen en registratie](../STRUCTURES.md)

Buizen, vraagblokken, schakelaars, grotten, lianen, start/finish en magische objecten die de speler activeert.

Begin bij [pipe-up-in/structure.json](pipe-up-in/structure.json) en de [bijbehorende handleiding](pipe-up-in/README.md). Elke onderdeelmap bevat zijn eigen JSON, afbeeldingen en uitleg.

## Een eigen variant toevoegen

1. Kopieer de complete onderdeelmap en geef de kopie een eigen mapnaam.
2. Maak `id` gelijk aan die mapnaam en kies een eigen `name` en `description`.
3. Pas een bestaande eigenschap of afbeelding aan. Behoud de PNG-afmetingen voor de eerste proef.
4. Kies voor een bouwbaar object een vrij tegelnummer van 102 tot en met 255; controleer ook vijandprofielen.
5. Voeg bijvoorbeeld `"interactables/mijn-buis"` toe aan de logische groep `pipes` in [structures.json](../structures.json). Laat bestaande verwijzingen staan.
6. Voer vanuit de projectmap `npm run structures:prepare` en `npm run enemies:prepare` uit. Ververs en probeer jouw object.

De fysieke map is `interactables/pipe-up-in`. De bestaande logische profiel-ID blijft `pipes/pipe-up-in`; de mappenindeling verandert geen opgeslagen levelnummers. Nieuwe gedragscontrollers vragen code onder `../../engine/`.
