# Afbeeldingen van Boze robot

[Onderdeelhandleiding](../README.md) · [enemy.json](../enemy.json)

Deze map bevat het tekenwerk van één onderdeel. Je voegt een nieuw speelobject toe door de **hele bovenliggende onderdeelmap** te kopiëren en die nieuwe map te registreren. Een losse PNG of een nieuwe map ín `images/` wordt niet vanzelf een extra vijand, baas of structuur.

## Bestanden en gebruik

De afmetingen hieronder zijn de PNG-afmetingen op het moment van schrijven. Het JSON-bestand bepaalt welke beelden worden gebruikt en blijft leidend nadat je iets verandert.

| PNG | Afmetingen en verwijzingen |
| --- | --- |
| [charge-0.png](charge-0.png) | 1184 × 148 px; `charge-0` |
| [charge-1.png](charge-1.png) | 1184 × 148 px; `charge-1` |
| [charge-10.png](charge-10.png) | 1184 × 148 px; `charge-10` |
| [charge-2.png](charge-2.png) | 1184 × 148 px; `charge-2` |
| [charge-3.png](charge-3.png) | 1184 × 148 px; `charge-3` |
| [charge-4.png](charge-4.png) | 1184 × 148 px; `charge-4` |
| [charge-5.png](charge-5.png) | 1184 × 148 px; `charge-5` |
| [charge-6.png](charge-6.png) | 1184 × 148 px; `charge-6` |
| [charge-7.png](charge-7.png) | 1184 × 148 px; `charge-7` |
| [charge-8.png](charge-8.png) | 1184 × 148 px; `charge-8` |
| [charge-9.png](charge-9.png) | 1184 × 148 px; `charge-9` |
| [idle.png](idle.png) | 1184 × 148 px; `idle` |
| [jump.png](jump.png) | 1184 × 148 px; `jump` |
| [walk.png](walk.png) | 1184 × 148 px; `walk` |

## Een afbeelding vervangen

1. Bewaar je originele tekening ook buiten deze runtime-map. Gebruik voor het spel een PNG met transparantie waar buiten het lichaam ruimte hoort te zijn.
2. Vervang voor de eerste oefening één bestaand bestand en houd de bestandsnaam en totale afmetingen gelijk. Dan hoef je de metadata niet tegelijk te wijzigen.
3. Houd anker, voeten, bodyverhouding en kijkrichting gelijk tussen opeenvolgende frames. Transparante marges zijn tekenruimte, geen extra botsingsgebied.
4. Gebruik een horizontale rij voor animatieframes. Elk frame is `frameWidth` breed en `frameHeight` hoog; de totale PNG is `frames × frameWidth` breed.
5. Wijzigen de afmetingen of frames, werk dan **alle verwijzingen naar deze PNG** onder `animations` in `../enemy.json` bij. Verschillende toestandnamen kunnen hetzelfde bestand delen.
6. Controleer `bounds`: dat is `[links, boven, breedte, hoogte]` van het getekende beeld. Vergelijk dit met het lichaams-/tegelvak. Een grotere transparante marge mag de speler niet onbedoeld een grotere botsing laten verwachten.
7. Voer de voorbereidingscontrole uit vanuit de projectmap, ververs de browser en probeer de echte interactie. Open zo nodig het PNG-bestand in je editor om de framegrenzen te bekijken.

## Een nieuw afbeeldingsbestand gebruiken

Plaats bijvoorbeeld `mijn-beeld.png` in deze map en verwijs in het bovenliggende JSON-bestand naar `"images/mijn-beeld.png"`. Gebruik letters, cijfers, streepjes of underscores in de bestandsnaam. Voor vijanden en structuren horen deze PNG’s rechtstreeks in `images/`; de validator accepteert hier geen willekeurige extra submappen of paden naar een buuronderdeel.

De robot wisselt tussen opladen en springen. De beelden `charge-0` tot `charge-10` volgen de oplaadstand. Een andere `chargeSeconds` moet zichtbaar en speelbaar blijven.

## Controleren

```sh
npm run enemies:prepare
npm run build
```

Voer de eerste controle tijdens het werken uit. Bouw pas een nieuwe `speel.html` wanneer je de offlineversie wilt vernieuwen. Een ongeregistreerde onderdeelmap wordt niet door de cataloguscontrole gelezen; controleer daarom ook de lijst in de hoofdmap. Test zowel een stilstaande als een bewegende/actieve toestand en bekijk hoe het beeld op een lichte en donkere achtergrond leest.

Een fout over PNG-afmetingen betekent meestal dat het hele vel niet overeenkomt met `frames × frameWidth` en `frameHeight`. Verklein niet zomaar het botsingsvak om een verkeerd uitgesneden afbeelding passend te maken. De onderhoudsexport van oorspronkelijk tekenwerk kan jouw tekening overschrijven; dat exportcommando is geen gewone laad- of bouwstap.
