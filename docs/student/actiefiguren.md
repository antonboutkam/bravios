# Je eigen actiefiguur toevoegen

[Studentenhandleiding](README.md) · [Broncode en werking](broncode.md)

Elk actiefiguur heeft een eigen map onder `public_html/gameplay/characters/`. Iedere houding is een losse PNG. Je vermeldt alleen de mapnamen in `public_html/gameplay/characters/characters.json`. Het spel haalt die lijst en de bijbehorende karaktergegevens bij het openen op. Je hoeft geen JavaScript of keuzeknoppen aan te passen.

## 1. Kopieer een bestaande karaktermap

Kopieer bijvoorbeeld `public_html/gameplay/characters/boaz/` naar `public_html/gameplay/characters/luna/`. Gebruik voor de mapnaam kleine letters, cijfers en eventueel streepjes. Begin met een letter.

```text
public_html/gameplay/characters/luna/
  character.json
  images/
    portrait.png
    platform/
      idle.png
      side.png
      run.png
      run-1.png
      run-2.png
      run-3.png
      run-4.png
      jump.png
      land.png
      victory.png
      ride.png
```

## 2. Vervang de afbeeldingen

Maak losse PNG’s met een transparante achtergrond. Laat zijwaartse houdingen naar rechts kijken: het spel spiegelt ze voor links bewegen. Houd de lichaamsverhoudingen gelijk en plaats de voeten onderaan. Het spel schaalt de zichtbare afbeelding en negeert transparante buitenmarges bij het tekenen.

| Bestand | Gebruik |
| --- | --- |
| `images/portrait.png` | Portret voor de interface |
| `images/platform/idle.png` | Stilstaan in vooraanzicht, onder andere bij kleine games |
| `images/platform/side.png` | Stilstaan in zijaanzicht tijdens het platformspel |
| `images/platform/run.png` | Terugval voor karakters zonder loopframes |
| `images/platform/run-1.png` t/m `run-4.png` | Vier opeenvolgende stapfasen, elke 90 ms een volgend beeld |
| `images/platform/jump.png` | Springen en vallen |
| `images/platform/land.png` | Landen |
| `images/platform/victory.png` | Juichen na winst |
| `images/platform/ride.png` | Zitten op een dino |

Voor de loopcyclus geef je alle vier de velden `poses.run-1` tot en met `poses.run-4` op. Gebruik voor deze PNG’s dezelfde canvasafmetingen, lichaamsschaal en voetenlijn. Teken een uitgestrekte stap, een passerend been, de tegengestelde stap en het andere passerende been. Het spel bepaalt één gezamenlijke uitsnede, zodat het lichaam tijdens de cyclus niet van grootte verandert. Bij minder beweging blijft het eerste loopframe staan. Zonder deze vier velden blijft de enkele `run.png` werken; een gedeeltelijke reeks geeft een foutmelding.

## 3. Vul character.json in

Dit bestand bevat de eigenschappen voor identiteit en uiterlijk. De `id` moet precies overeenkomen met de mapnaam. De zichtbare naam mag spaties en hoofdletters bevatten en is maximaal 32 tekens lang. Afbeeldingspaden beginnen binnen de karaktermap.

```json
{
  "id": "luna",
  "name": "Luna",
  "portrait": "images/portrait.png",
  "poses": {
    "idle": "images/platform/idle.png",
    "side": "images/platform/side.png",
    "run": "images/platform/run.png",
    "run-1": "images/platform/run-1.png",
    "run-2": "images/platform/run-2.png",
    "run-3": "images/platform/run-3.png",
    "run-4": "images/platform/run-4.png",
    "jump": "images/platform/jump.png",
    "victory": "images/platform/victory.png",
    "land": "images/platform/land.png",
    "ride": "images/platform/ride.png"
  }
}
```

Alle zeven houdingen en het portret zijn verplicht. Gebruik alleen PNG-bestanden binnen `images/` van jouw karaktermap. Let op komma’s en dubbele aanhalingstekens: JSON is een vast gegevensformaat.

Snelheid, sprongkracht en andere spelregels zijn nog niet per figuur instelbaar. Onbekende extra properties worden niet toegepast.

## 4. Voeg je mapnaam toe en ververs de pagina

Open `public_html/gameplay/characters/characters.json` en voeg je mapnaam toe:

```json
[
  "boaz",
  "ravi",
  "pixel",
  "luna"
]
```

De volgorde bepaalt de volgorde in de karakterkeuze. Vermeld elke map één keer. Alleen karakters in deze lijst worden geladen.

Start de website bijvoorbeeld met `npm start` of de Live Server-extensie van je editor. PHP en XAMPP zijn niet nodig. Open de website via die webserver; dubbelklikken op `index.html` werkt niet voor het ophalen van JSON.

Ververs de pagina nadat je een karakter toevoegt of wijzigt. Je hoeft de server niet te herstarten en geen build te maken. Je figuur verschijnt in de karakterkeuze, de keuze bij het starten van een spel en de wisselknop in de werkbalk. Bij ongeldige JSON of ontbrekende gegevens verschijnt een melding op het laadscherm. Corrigeer het bestand en probeer opnieuw.

Voor samenspel start je met `npm run start:network`. Beide apparaten moeten dezelfde spelinstallatie met dezelfde karakterbestanden gebruiken. De kamer verstuurt de karakter-ID; afbeeldingen worden niet tussen spelers uitgewisseld.

## 5. Controleer je figuur en maak de offlineversie

Probeer links/rechts, rennen, springen, landen, de finish en rijden op een dino. Bekijk ook een kleine game. Controleer dat de houdingen dezelfde verhoudingen hebben.

```sh
npm run build
```

Ook de build leest `characters.json` en neemt hun afbeeldingen op in `public_html/speel.html`. Open dit bestand apart en controleer je figuur daar opnieuw.

`public_html/engine/characters/catalog.mjs` wordt automatisch gegenereerd. Pas dit bestand niet zelf aan: werk in `characters.json`, je eigen `character.json` en afbeeldingen. Je kunt de configuratie ook controleren zonder een server te starten met `npm run characters:prepare`.

De map `characters/custom/` is de bestaande karaktermaker die hoofden, kleding en accessoires combineert. De map `characters/shared/` bevat gedeelde code. Dit zijn geen afzonderlijke actiefiguren; neem ze niet op in `characters.json`.
