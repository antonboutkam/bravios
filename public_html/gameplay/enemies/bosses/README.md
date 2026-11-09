# Een baas toevoegen of aanpassen

[Alle spelonderdelen](../../../README.md) · [Alle vijandeigenschappen](../README.md) · [Gewone vijanden](../game/README.md)

Een baas heeft een profiel én een plek in de spelcode waar hij wordt aangemaakt. In deze map staan de twee kasteelprofielen voor De avonturiers en de acht Wonderland-bazen. **Een extra map in `enemies.json` verschijnt niet automatisch als een nieuw baasgevecht.**

Voer terminalcommando’s uit in de **projectmap met `package.json`**, niet in deze submap. Start met `npm start` en open het adres dat de terminal toont. Open `index.html` via een webserver; dubbelklikken op dat bestand haalt de catalogus-JSON niet betrouwbaar op. Na een JSON- of PNG-wijziging ververs je de browser. De losse offlineversie vernieuw je met `npm run build`.

## Route A: een bestaande baas aanpassen

1. Kies de bestaande baas die bij jouw opdracht hoort, bijvoorbeeld `castle-king/` of `blubberus/`.
2. Lees de README in die map. Noteer `kind`, `size`, `combat.health`, de animatietoestanden en eventuele baasfasetijden.
3. Verander één instelling, bijvoorbeeld `combat.health`, en laat de ID en de registratielijst gelijk.
4. Vervang de PNG’s of verwijs in `animations` naar eigen PNG’s binnen `images/`. Een andere kleur in metadata kleurt een bestaande PNG niet opnieuw in.
5. Voer `npm run enemies:prepare` en `npm run structures:prepare` uit, ververs het spel en speel de juiste arena.
6. Controleer het kwetsbare moment, de levensbalk, de overwinning en dat de finish pas daarna toegankelijk wordt. Controleer pauzeren en hervatten.
7. Bouw en controleer `speel.html` opnieuw.

## Route B: een nieuw kasteelbaasprofiel met bestaand gedrag

Dit is de overzichtelijkste route voor een nieuwe baas met de bestaande `spiky`-controller.

1. Kopieer `castle-king/` naar bijvoorbeeld `mijn-baas/`.
2. Geef `enemy.json` de `id` `mijn-baas`, een eigen naam en beschrijving. Behoud eerst `kind: "spiky"`, de complete animaties en `tileIds: []`.
3. Kies `size`, `combat.health` en eigen PNG’s. Omdat deze baas door de campagne wordt gemaakt, is een tegelnummer niet nodig.
4. Voeg `"mijn-baas"` toe aan `bosses` in `../enemies.json`. Laat de bestaande profielen staan zolang de campagne die gebruikt.
5. Open [adventurers.mjs](../../../engine/adventurers.mjs). In `prepareAdventureGame` zoekt de bestaande kasteelarena eerst een `spiky`-lichaam en kiest daarna een profiel met `enemyProfileByKey`.
6. Laat één bestaande kasteelarena jouw profiel kiezen. Voor een oefening kun je de profielkeuze vervangen door onderstaande regel; veldindex 2 is het eerste kasteel in de bestaande route. De rest van de functie die afmetingen, levenspunten en arenagrenzen toepast blijft nodig.

```js
const profile = enemyProfileByKey(
  field === 11 ? 'bosses/lava-king'
    : field === 2 ? 'bosses/mijn-baas'
    : 'bosses/castle-king'
);
```

7. Probeer eerst dit aangepaste bestaande gevecht. Wil je daarnaast een nieuwe arena of een extra campagneveld, dan moet je ook de velddefinities, kaartknoppen, voortgang en overwinning aanpassen. De mapnaam alleen doet dat niet.
8. Controleer de relevante tests, daarna `npm test` en `npm run build`. Leg in jouw eigen README uit welke arena jouw nieuwe baas gebruikt.

De zichtbare kasteelbaasnaam kan nog uit vaste tekst in `drawCastleBossStatus` in [art.mjs](../../../engine/art.mjs) komen. Wil je ook die naam aanpassen, controleer dat tekenwerk naast `name` in het profiel. Andere kleuren in metadata kleuren een bestaande PNG niet opnieuw in.

`applyEnemyProfile` maakt op zichzelf geen nieuw soort lichaam. Het bestaande kasteelpad verwacht een `spiky`-baas. Voor een andere controller moet je de aanmaak- en gevechtscode bewust uitbreiden.

## Route C: een Wonderland-baas vervangen of uitbreiden

De huidige controller kent precies acht typen: `wonderType` 0 tot en met 7. Per type bestaat één profiel in `game` en één in `bosses`. De validator weigert dubbele typen, ontbrekende typen en een negende type buiten dit bereik.

Voor een nieuw uiterlijk van een bestaand type kun je het bestaande baasprofiel wijzigen. Wil je een andere mapnaam gebruiken, vervang dan de vermelding van dat type in de `bosses`-lijst; voeg geen tweede profiel met hetzelfde `wonderType` toe. Houd de bijbehorende identiteit en de metadata-afspraken geldig. Het kleine `game`-profiel is een eigen profiel; pas dat apart aan wanneer het ook moet veranderen.

Voor een werkelijk negende Wonderland-baas heb je code nodig. Controleer en wijzig in samenhang:

- [load-catalog.mjs](../../../engine/enemies/load-catalog.mjs): toegestane typen, volledigheid en metadata.
- [wonder-foes.mjs](../../../engine/wonder-foes.mjs): `WONDER_ENCOUNTERS`, aanmaak, zwakke plekken, fases, aanwijzingen en aanvallen.
- [wonder-foe-art.mjs](../../../engine/wonder-foe-art.mjs): arena-aanduidingen, effecten en terugvaltekenwerk.
- [wonderland.mjs](../../../engine/wonderland.mjs) en [wonderland-map.mjs](../../../engine/wonderland-map.mjs): arena, route, voortgang en eventuele finale.
- De eigen baas-PNG’s, het kleine profiel wanneer nodig en de Wonderland-tests.

Schrijf eerst op hoe een speler de baas zonder speciale power-up kan verslaan. Test die route echt; alleen meer levenspunten en een andere PNG leveren nog geen nieuwe puzzel op.

## Afbeeldingen en opleveren

Behoud minimaal `idle`. Wonderland gebruikt ook toestanden zoals `warning`, `attack`, `puzzle`, `exposed`, `rest` en `defeated`. De levensbalk en arena-aanwijzingen worden live getekend: bak die niet in je PNG. Maak het begin van een aanval en de zwakke plek herkenbaar.

JSON gebruikt dubbele aanhalingstekens, `true`/`false` zonder aanhalingstekens en komma’s tussen velden. Plaats geen commentaar, geen komma na het laatste veld en geen `...` in het echte bestand. Begin met een volledige kopie van een geldig profiel en wijzig telkens één eigenschap. Een voorbeeldfragment uit een README vervangt alleen de genoemde velden; het is geen volledig configuratiebestand.

| Bestaande baas | Uitleg |
| --- | --- |
| Blubberus the Slime King | [blubberus](blubberus/README.md) |
| Wafzilla the Terrible | [wafzilla](wafzilla/README.md) |
| Sockstein | [sockstein](sockstein/README.md) |
| Tick-Tock the Time Eater | [tick-tock](tick-tock/README.md) |
| DJ Thunderfluff | [dj-thunderfluff](dj-thunderfluff/README.md) |
| Crumblecastle the Walking Fortress | [crumblecastle](crumblecastle/README.md) |
| Princess Mirrorphantom | [princess-mirrorphantom](princess-mirrorphantom/README.md) |
| Emperor Wobbleflap the Everything-Eater | [emperor-wobbleflap](emperor-wobbleflap/README.md) |
| Kasteelkoning | [castle-king](castle-king/README.md) |
| Lavakoning | [lava-king](lava-king/README.md) |
