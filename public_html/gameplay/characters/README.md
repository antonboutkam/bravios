# Maak je eigen karakter

Werk in `public_html/gameplay/characters/`. Hieronder heet je nieuwe karakter **Nova**.

1. Kopieer de hele map `boaz` en noem de kopie `nova`.
2. Open `nova/character.json`. Zet `id` op `nova` en `name` op `Nova`.
3. Vervang in jouw map `images/portrait.png` en de basisposes plus `run-1.png` tot en met `run-4.png` in `images/platform/` door je eigen tekeningen. Behoud de bestandsnamen. Gebruik een transparante achtergrond en teken zijaanzichten naar rechts.
4. Voeg `"nova"` toe aan `characters.json`. Laat de bestaande namen staan:

   ```json
   ["boaz", "ravi", "pixel", "nova"]
   ```

5. Ververs de draaiende game. Klik op **Speel je level** en kies **Nova**.
6. Test lopen, springen en landen. De vier runbeelden wisselen tijdens het lopen elke 90 ms; teken per beeld een volgende stapfase en behoud dezelfde canvasafmetingen en lichaamspositie. Pas je bestanden aan en ververs opnieuw.

De technische loader en gegenereerde catalogus staan apart in `../../engine/characters/`.

**Niet zichtbaar?** Controleer of mapnaam, `id` en de naam in `characters.json` precies gelijk zijn.

[Meer uitleg](../../../docs/student/actiefiguren.md)
