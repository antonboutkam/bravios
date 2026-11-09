# Afbeeldingen van Ravi

[Karakterhandleiding](../README.md) · [character.json](../character.json) · [Houdingen](platform/README.md)

Deze map bevat het portret en de map met houdingen van één vast karakter. Een nieuwe held ontstaat door de hele karaktermap te kopiëren en in `characters.json` te registreren; een nieuwe afbeelding alleen voegt geen karakter toe.

## Het portret vervangen

1. Open [portrait.png](portrait.png). Het huidige bestand is 1254 × 1254 px.
2. Maak een PNG die ook klein herkenbaar blijft. Houd het gezicht goed zichtbaar en gebruik transparantie waar buiten het figuur geen achtergrond hoort te staan.
3. Vervang voor de eerste oefening alleen dit bestand. Behoud de naam `portrait.png`; dan blijft het bestaande pad geldig.
4. Kies je een andere naam, pas dan `portrait` in `../character.json` aan naar bijvoorbeeld `"images/mijn-portret.png"`.
5. Ververs het spel en controleer de karakterkeuze, startkeuze en plekken waar het portret wordt gebruikt.

## Houdingen toevoegen of vervangen

Ga voor stilstaan, rennen, springen en andere acties naar [platform/README.md](platform/README.md). Het karakter heeft zeven verplichte poseverwijzingen. Voor de loopcyclus zijn daarnaast vier velden `poses.run-1` tot en met `poses.run-4` beschikbaar. Vermeld alle vier de paden in het profiel; een extra PNG zonder verwijzing wordt niet vanzelf geladen.

Een PNG-bestand mag onder een submap van `images/` staan als het `character.json` daar expliciet naar verwijst. Houd de paden relatief aan de karaktermap en verwijs niet naar afbeeldingen in een andere heldenmap. Als je een nieuwe held kopieert, blijven zijn tekeningen daardoor zelfstandig.

## Controleren

Voer vanuit de projectmap `npm run characters:prepare` uit. Deze controle kijkt naar de geregistreerde map en de bestandskoppen, maar kan niet beoordelen of een portret prettig is uitgesneden. Bekijk het dus ook in de browser. Bouw met `npm run build` voor een bijgewerkte `speel.html`.

Schilder geen interfaceknoppen, tekstlabels of selectiekringen in het portret: die horen bij de interface en kunnen per scherm verschillen. Bewaar je bewerkbare tekenbestand apart van de PNG die het spel gebruikt.
