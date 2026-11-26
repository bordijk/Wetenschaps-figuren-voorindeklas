import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();
const figuren = {
  deeltjes: ['buildSVG', 'panelHTML'], metaal: ['buildMetalSVG', 'metalPanelHTML'], bohr: ['buildBohr', 'bohrPanel'],
  lewis: ['buildLewis', 'lewisPanel'], atoombinding: ['buildATB', 'atbPanel'], energie: ['buildED', 'edPanel'],
  opwarmcurve: ['buildOC', 'ocPanel'], reactie: ['buildRX', 'rxPanel'], structuur: ['buildST', 'stPanel'], botsing: ['buildBO', 'boPanel'], evenwicht: ['buildEQ', 'eqPanel'],
};

for (const [id, [build, panel]] of Object.entries(figuren)) {
  test(`${id}: geregistreerd en tekent een SVG`, () => {
    assert.equal(typeof app.GEN[id], 'function');
    const svg = app[build]();
    assert.match(svg, /^<svg[^>]*viewBox="0 0 \d+ \d+"/);
    assert.ok(!/NaN|undefined/.test(svg), 'geen NaN of undefined in de figuur');
    assert.ok(app[panel]().length > 100);
  });
}
