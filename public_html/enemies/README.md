# Vijanden en bazen

Alle 48 bestaande vijandprofielen staan naast `characters` onder `public_html/enemies`: 38 gewone vijanden en varianten in `game/`, en 10 bazen in `bosses/`. Onderwaterwezens, kettinghoofden en rode mieren zijn inbegrepen. Rijdieren en vriendelijke helpers blijven aparte spelobjecten.

```text
enemies/
  enemies.json
  game/walker/
    enemy.json
    images/idle.png
    images/walk.png
  bosses/blubberus/
    enemy.json
    images/idle.png
    images/exposed.png
```

`enemies.json` noemt de mapnamen, uitgesplitst naar `game` en `bosses`. Elke vermelde map heeft een `enemy.json`. De browser leest de bestanden opnieuw bij het verversen, ook met een gewone statische webserver. Alleen bestanden die in de catalogus en de animaties staan, worden gebruikt. Een browser kan niet zelf alle mappen op een webserver doorzoeken.

## Eigenschappen aanpassen

Bewerk bijvoorbeeld `game/walker/enemy.json`. De bestaande bestanden bevatten alle verplichte instellingen; kopieer zo'n bestand om een variant te maken.

| Veld | Betekenis |
| --- | --- |
| `id` | Gelijk aan de mapnaam; kleine letters, cijfers en streepjes. |
| `name` | Leesbare naam. |
| `kind` | Bestaande gedragscontroller, bijvoorbeeld `walker`, `frog`, `hammer` of `wonder`. |
| `tileIds` | Unieke editor-tegelnummers voor dit profiel. Bestaande nummers blijven gelijk voor opgeslagen levels. |
| `variant` | Bestaande kleurvariant: `normal`, `red` of `angry`. |
| `size` | Breedte en hoogte van het botsingsvak in spelpixels. |
| `movement.type` | `walk`, `fly`, `swim` of `stationary`. |
| `movement.speed` | Bewegingssnelheid in pixels per seconde. |
| `movement.turnAtEdges` | Gewone lopers draaien om voor een gat. |
| `movement.amplitude` / `frequency` | Hoogte en frequentie van de vliegbeweging. |
| `combat.health` | Aantal levenspunten. |
| `combat.contactDamage` | Of contact met de vijand schade doet. |
| `combat.lethalContact` | Contact gaat ook door gewone ster/schildbescherming heen. |
| `combat.stompable` | Of bovenop springen veilig is. |
| `combat.stompResponse` | `damage`, `hurt`, `shell`, `collapse`, `fold`, `ignite` of `ride`. |
| `combat.fireResponse` | `damage`, `ignore`, `collapse` of `ignite`. |
| `combat.freezeable` / `bubbleable` | Of ijs en de bubblegun werken. |
| `combat.hitCooldown` | Seconden tussen geaccepteerde projectieltreffers. |
| `shooting.enabled` | Aanvallen met projectielen aan/uit. |
| `shooting.projectile` | `fire`, `hammer`, `spikeegg` of de speciale baasaanval `wonder`. |
| `shooting.interval` | Seconden tussen schoten van gewone vijanden. |
| `shooting.speed` / `verticalSpeed` | Horizontale snelheid en beginsnelheid omhoog/omlaag. Negatief is omhoog. |
| `shooting.life` | Aantal seconden dat het projectiel bestaat. |
| `shooting.aim` | `player` voor links/rechts naar een speler, of `down`. |
| `settings` | Parameters van het speciale gedrag, zoals robot-oplaadtijd, bomlont, tongbereik, kettinglengte en inkttijd. |
| `boss` | Rust-, waarschuwings-, aanvals- en kwetsbaarheidsduur van een Wonderland-baas. |
| `metadata` | Naam, kleuren, aanvalsnamen, zwakte en beloning van Wonderland-bazen. |

Voor een vliegende, schietende wandelaar verander je `movement.type` naar `fly`, `movement.speed` naar bijvoorbeeld `60`, `shooting.enabled` naar `true` en `shooting.projectile` naar `fire`. Met `combat.stompable: false` wordt erop springen gevaarlijk. Met `combat.health: 3` zijn drie treffers nodig.

De `stompResponse` moet bij het gewenste gedrag passen: een schildpad gebruikt `shell`, een skeletschildpad `collapse`, een helmtor `fold` en de duizendpoot `ride`. Voor `ride` blijft `stompable` op `false`: de rug is een platform, geen aanval. Bevroren vijanden blijven veilig om op te stuiteren. Een geplaatst vijandontwerp uit de editor kan nog steeds vleugels en vlucht toevoegen; die bestaande vlucht gebruikt 60 pixels per seconde.

`kind` kiest de controller; JSON is geen uitvoerbare code. Nieuwe mogelijkheden of baas-puzzels vragen een nieuwe of aangepaste controller. De speciale botsingsvormen van onderwaterwezens en kettingvallen blijven bij hun controller horen. Kettinghoofden en mieren zijn gevaren: hun contactschade, beweging en timing zijn instelbaar, maar ze krijgen daarmee geen ijs-, bel- of levenspuntmechanisme. `wonder`-projectielen en `boss`-fasetijden horen alleen bij Wonderland. Een nieuw gewoon profiel met een vrij nummer in `tileIds` verschijnt automatisch in het vijandenpalet. Gebruik uitsluitend een nog vrij nummer (1–255); bestaande bouwblokken en beloningen mogen niet worden overschreven. Een profiel met een lege `tileIds`-lijst krijgt geen paletknop.

## PNG's en animaties

Elke animatie onder `animations` bevat:

```json
{
  "image": "images/walk.png",
  "frameWidth": 148,
  "frameHeight": 148,
  "frames": 8,
  "fps": 10,
  "bodyWidth": 26,
  "bodyHeight": 26,
  "bounds": [-24, -24, 74, 74]
}
```

Een PNG bevat de frames horizontaal naast elkaar, met transparante achtergrond. De totale PNG-breedte is `frameWidth × frames`. Voor één stilstaande PNG gebruik je `frames: 1`, `fps: 0` en de werkelijke pixelafmetingen. `bounds` geeft aan waar het hele plaatje ten opzichte van het botsingsvak wordt getekend: `[links, boven, breedte, hoogte]`. `bodyWidth` en `bodyHeight` beschrijven het botsingsvak waarvoor het plaatje is gemaakt. Daardoor kan dezelfde animatie ook een grotere baas tekenen.

`idle` is verplicht en vangt ontbrekende toestanden op. Andere namen volgen het gedrag: `walk`, `shell`, `folded`, `fallen`, `lit`, `tongue`, `crawl`, `charge-0` tot `charge-10`, `exposed`, `warning`, enzovoort. Onderwaterafbeeldingen kunnen een `-night`-variant hebben. De drie kleine Wonderland-paletten heten `palette-0`, `palette-1` en `palette-2`; gezichtsmarkeringen en accessoires worden daaroverheen getekend. Murene- en waterplantframes volgen hun uitsteeklengte in plaats van de klok. De walvisvisjes, kikkertongen, kettingen, levensbalken en ontwerponderdelen blijven live getekend zodat hun positie overeenkomt met de simulatie.

PNG's worden pas geladen wanneer hun toestand wordt getekend en worden gedeeld tussen exemplaren. De applicatiecache bewaart maximaal 48 spritevellen; het spel laadt niet alle afbeeldingen bij het starten. Tijdens het decoderen is het oorspronkelijke tekenwerk beschikbaar als terugval.

## Controleren en offline bouwen

- `npm run enemies:prepare` controleert JSON, mappen, PNG-koppen en frameafmetingen en genereert `catalog.mjs` voor Node en offlinegebruik. Bewerk dat gegenereerde bestand niet handmatig.
- `npm start`, `npm run start:network`, `npm test` en `npm run build` voeren de voorbereiding automatisch uit.
- `npm run build` neemt alle vermelde PNG's en de catalogus op in `speel.html`. Bouw het bestand opnieuw na wijzigingen.
- `npm run enemies:export` kan het oorspronkelijke tekenwerk opnieuw naar PNG exporteren. Dit is een onderhoudshulpmiddel, vereist Playwright en Chrome (`CHROME_BIN` voor een ander pad), en **overschrijft de bestaande PNG's en animatiebeschrijvingen**. Voer dit dus niet uit na handmatige beeldbewerking. Normaal gebruik en bouwen vereisen geen Playwright.

De bestaande levelbestanden en samenspel-snapshots blijven bruikbaar. Nieuwe snapshots bewaren ook de catalogus-ID.
