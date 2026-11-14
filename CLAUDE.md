# Wetenschapsfiguren voor in de klas

Statische website (HTML/CSS/JS zonder framework of bouwstap) met generatoren voor scheikundefiguren. Gebruiker: scheikundedocent (3 havo/vwo, 4 vwo), Nederlandstalig. Figuren worden gekopieerd naar Word/PowerPoint voor toetsen en werkbladen.

## Opbouw

- `index.html` laadt gewone `<script>`-bestanden in vaste volgorde (geen modules): `js/core.js` → `js/chemie.js` → `js/generatoren/*.js` → `js/main.js`. Alles deelt de globale scope.
- `js/core.js`: menu (`GENS`), registry `GEN`, hulpjes (`fmt`, `textW`, `rng`, `shuffle`, `esc`, `r1`, `clone`, `seg`, `swatch`), `mountGen`, grafiekhulpjes (`nlNum`, `sgnNum`, `niceStep`, `vArrow`, `dash`, `axesArrows`, `HALO`) en exporteren (PNG/SVG kopiëren).
- `js/chemie.js`: elementen `EL` (H t/m Kr), `shellsFor`, `chargeStr`, `ionName`, `drawE`.
- Een generator is een object `{key, st, build, panel, onChange, act, extra?}` en registreert zich met `GEN.<id>=()=>mountGen(X)`. Voeg het id ook toe aan `GENS` in core.js en het script aan index.html.
- `build()` geeft een SVG-string terug (wit vlak, zwart, Arial) en vult `lastWarn` met meldingen. `panel()` geeft de HTML van het bedieningspaneel.
- Bedieningselementen: `data-k="pad"` op inputs (met `data-num` of `data-dec` voor getallen), `seg('pad',[[waarde,label]],huidig)` voor knoppenrijen, `data-act` voor acties, `data-rebuild` op selects die het paneel opnieuw moeten opbouwen.
- Tekst in figuren via `fmt(str,x,y,size,anchor,extra)`: `_` = subscript, `^` = superscript, `{}` groepeert (bijv. `SO_4^{2-}`).
- Instellingen worden per generator in `localStorage` bewaard (`sf.<naam>`), altijd in try/catch.

## Afspraken

- Alle tekst in het Nederlands, zoals in Nederlandse methodes (Chemie Overal) en BINAS: "reactieproducten", "geactiveerde toestand", "smelttraject", ΔE (niet ΔH), T(K) = t(°C) + 273.
- Altijd een harde spatie (` `) tussen getal en eenheid: `50 mL`, `0 °C`.
- Decimaal teken is een komma (`nlNum`), minteken is `−`.
- Figuren zijn zwart-wit printbaar; kleur alleen als optie.
- Elke generator heeft opties voor toetsgebruik (labels verbergen, letters a/b/c, leeg invullen, uitwerking).

## Testen

`npm test` (Node, geen afhankelijkheden). `tests/laad.mjs` laadt de scripts in een nep-browser. Draai de tests na elke wijziging; voeg een test toe bij nieuwe rekenlogica.
