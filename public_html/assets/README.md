# Assets — achtergronden, decor, effecten en audio

[Gameplay aanpassen](../gameplay/README.md) · [Technische engine](../engine/README.md)

| Map | Inhoud |
| --- | --- |
| [backgrounds/](backgrounds/README.md) | Achtergrondillustraties en wereldkaarten |
| [scenery/](scenery/README.md) | Decoratlas en interfacebeelden onder `scenery/ui/` |
| [effects/](effects/README.md) | Plaatjes voor beeldeffecten; huidige effecten worden door code getekend |
| [music/](music/README.md) | Plaats voor opgenomen muziek; er zijn nog geen muziekbestanden gekoppeld |
| [sounds/](sounds/README.md) | Plaats voor geluidseffecten; het huidige geluid wordt met Web Audio opgewekt |

Afbeeldingen die bij een spelonderdeel horen, blijven bij het profiel onder `../gameplay/`. Gedeelde oudere vellen voor terrein, objecten en beloningen staan bij `gameplay/platforms/images/`, `gameplay/interactables/images/` en `gameplay/powerups/images/`.

Behoud bij een bestaande PNG de afmetingen, transparantie en celindeling. Nieuwe bestanden worden niet automatisch door de engine geladen. Werk bij een nieuw pad ook de loader en offlinebuild bij. Voor nieuwe spelregels begin je bij de [engine](../engine/README.md).

Controleer afbeeldingswijzigingen met `node public_html/engine/tests/look.test.mjs`, bekijk het resultaat in de browser en bouw de offlineversie met `npm run build`. Voer commando’s uit vanuit de projectmap.
