# Wetenschapsfiguren voor in de klas

Generatoren voor scheikundefiguren voor toetsen en werkbladen. Je stelt een figuur in, klikt op **Kopieer als afbeelding** en plakt hem in Word of PowerPoint.

**Website:** https://bordijk.github.io/Wetenschaps-figuren-voorindeklas/


## Generatoren

| Generator | Link | Bestand |
|---|---|---|
| Deeltjesmodel | `#deeltjes` | `js/generatoren/deeltjes.js` |
| Metaalrooster (elektronenzee) | `#metaal` | `js/generatoren/metaal.js` |
| Bohr-model | `#bohr` | `js/generatoren/bohr.js` |
| Lewisstructuren | `#lewis` | `js/generatoren/lewis.js` |
| Atoombinding (dot-and-cross) | `#atoombinding` | `js/generatoren/atoombinding.js` |
| Energiediagram | `#energie` | `js/generatoren/energie.js` |
| Opwarm-/afkoelcurve | `#opwarmcurve` | `js/generatoren/opwarmcurve.js` |
| Reactievergelijkingen | `#reactie` | `js/generatoren/reactie.js` |

Elke generator heeft een eigen link: zet `#bohr` (enz.) achter het adres van de website.

## Lokaal draaien

Er is geen bouwstap nodig. Open `index.html` in je browser, of start een kleine server:

```
npm start
```

## Testen

```
npm test
```

De tests controleren of elke generator een figuur tekent en of alle reactievergelijkingen kloppend te maken zijn. Ze draaien ook automatisch op GitHub bij elke wijziging.
