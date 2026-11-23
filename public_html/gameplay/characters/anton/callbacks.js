/**
 * Antons zes callbacks: voorbeelden voor je eigen karakter.
 *
 * character.json koppelt gebeurtenissen aan de functienamen hieronder.
 * Het spel roept de juiste functie aan en geeft context mee.
 * context.player en context.event kun je lezen; context.data mag je aanpassen.
 * Gebruik de context-functies om iets in het spel te veranderen.
 * Alle functies zijn synchroon: gebruik hier geen async, timers of fetch.
 */

// 1. VERSCHIJNEN — één keer bij de start en opnieuw na een co-oprespawn.
export function begroetSpeler(context) {
  // ?? gebruikt 0 als de teller nog niet bestaat. Data blijft dit veld bewaard.
  context.data.starts = (context.data.starts ?? 0) + 1;
  context.data.sprongen = context.data.sprongen ?? 0;
  context.data.gevondenMuntjes = context.data.gevondenMuntjes ?? 0;
  context.data.treffers = context.data.treffers ?? 0;
  context.data.schilden = context.data.schilden ?? 0;

  if (context.data.starts === 1) {
    context.showMessage('Anton is klaar! Druk op E voor je schild.', 4);
  } else {
    context.showMessage('Terug! Je muntjesteller is bewaard.', 3);
  }
}

// 2. SPRINGEN — na een echte sprong, ook als je een slinger loslaat.
export function telSprongen(context) {
  context.data.sprongen = (context.data.sprongen ?? 0) + 1;

  // % geeft de rest van een deling. Bij 3, 6, 9, ... is de rest 0.
  if (context.data.sprongen % 3 === 0) {
    context.showMessage(`Al ${context.data.sprongen} sprongen!`, 1.5);
  } else if (context.data.sprongen === 1) {
    context.showMessage('Je eerste sprong! Houd springen vast voor meer hoogte.', 3);
  }
}

// 3. MUNTJE PAKKEN — één aanroep per echt opgepakt muntje.
export function beloonMuntje(context) {
  context.data.gevondenMuntjes = (context.data.gevondenMuntjes ?? 0) + 1;

  // Bonuspunten staan los van de muntjes die bepalen wie de muntjesjacht wint.
  context.addBonusPoints(1);

  if (context.data.gevondenMuntjes % 5 === 0) {
    if (context.player.health < context.player.maxHealth) {
      context.heal(1);
      context.showMessage('Vijf muntjes! Je krijgt één levenspunt terug.', 3);
    } else {
      context.addBonusPoints(2);
      context.showMessage('Vijf muntjes en vol leven: twee extra bonuspunten!', 3);
    }
  } else {
    const nogNodig = 5 - context.data.gevondenMuntjes % 5;
    context.showMessage(`Muntje ${context.event.coins}! Nog ${nogNodig} tot je beloning.`, 2);
  }
}

// 4. SCHADE — alleen als je echt levenspunten verliest, ook bij afgaan.
export function reageerOpSchade(context) {
  context.data.treffers = (context.data.treffers ?? 0) + 1;

  // Een schild dat de klap tegenhoudt veroorzaakt geen onDamage.
  if (context.event.lethal) {
    context.showMessage('Af! Probeer het opnieuw en gebruik je schild op tijd.', 5);
  } else if (context.player.health === 1) {
    context.showMessage('Nog één levenspunt! Verzamel vijf muntjes voor herstel.', 4);
  } else {
    context.showMessage(`Au! ${context.event.damage} leven kwijt; nog ${context.player.health} over.`, 3);
  }
}

// 5. SPECIALE KRACHT — E, RB / R1 of de aanraakknop Kracht.
export function activeerSchild(context) {
  context.data.schilden = (context.data.schilden ?? 0) + 1;

  // Dit schild stopt één gewone treffer en verdwijnt na maximaal 3 seconden.
  // Lava, verplettering en vallen blijven gevaarlijk.
  context.giveShield(3);
  context.showMessage(`Schild ${context.data.schilden}: drie seconden beschermd!`, 3);
  // Het spel regelt de wachttijd van 8 seconden. Vasthouden herhaalt de actie niet.
}

// 6. WINNEN — één keer per gewonnen veld of gewonnen muntjesuitdaging.
export function vierOverwinning(context) {
  const sprongen = context.data.sprongen ?? 0;
  const treffers = context.data.treffers ?? 0;
  context.data.overwinningen = (context.data.overwinningen ?? 0) + 1;

  context.addBonusPoints(5);
  if (treffers === 0) {
    context.addBonusPoints(5);
    context.showMessage(`Foutloos gewonnen in ${sprongen} sprongen! +10 bonuspunten.`, 5);
  } else {
    context.showMessage(`Gehaald in ${sprongen} sprongen! +5 bonuspunten.`, 5);
  }
}
