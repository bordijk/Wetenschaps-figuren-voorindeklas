import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();
const BASIS = { type: 'add', fE: 3, bE: 7, t: 20, n: 60, V: 1, start: 'l', cat: 'off' };

// Gemiddelde aantallen en reactiesnelheden in de tweede helft van de meting, over een paar seeds
function meet(inst, sec = 60, seeds = [1, 2, 3]) {
  const som = { f: 0, b: 0 }; let n = 0;
  for (const seed of seeds) {
    Object.assign(app.eq, BASIS, inst);
    app.eqReset(seed);
    for (let i = 0; i < sec * 50; i++) {
      app.eqStep(0.02);
      if (app.eqS.time > sec / 2 && i % 25 === 0) {
        for (const k of ['A', 'B', 'C']) som[k] = (som[k] || 0) + app.eqCount(k);
        som.f += app.eqRate(app.eqS.fT); som.b += app.eqRate(app.eqS.bT); n++;
      }
    }
  }
  for (const k in som) som[k] /= n;
  return som;
}

test('alle reactiesoorten: atomen blijven behouden en de figuur tekent', () => {
  for (const type of ['iso', 'add', 'dim', 'exch']) {
    for (const start of ['l', 'r']) {
      Object.assign(app.eq, BASIS, { type, start, n: 40, fE: 3, bE: 4, color: 'color' });
      app.eqReset(5);
      const begin = app.eqAtoms();
      for (let i = 0; i < 1500; i++) app.eqStep(0.02);
      const eind = app.eqAtoms();
      if (type === 'iso') assert.equal(eind.a + eind.b, begin.a + begin.b, `${type} ${start}: aantal deeltjes`);   // A wordt B
      else {
        assert.equal(eind.a, begin.a, `${type} ${start}: atomen a`);
        assert.equal(eind.b, begin.b, `${type} ${start}: atomen b`);
      }
      assert.ok(app.eqS.fT.length > 0 && app.eqS.bT.length > 0, `${type} ${start}: beide reacties lopen`);
      const svg = app.buildEQ();
      assert.ok(!/NaN|undefined/.test(svg), `${type} ${start}`);
      assert.ok(app.eqPanel().length > 500);
    }
  }
  app.eq.color = 'bw';
});

test('dynamisch evenwicht: heen en terug even snel, maar niet nul', () => {
  const m = meet({});
  assert.ok(m.f > 2 && m.b > 2, `heen ${m.f}, terug ${m.b}`);
  assert.ok(Math.abs(m.f - m.b) < 0.15 * m.f, `heen ${m.f} ≈ terug ${m.b}`);
});

test('zelfde evenwicht vanaf beide kanten', () => {
  const links = meet({ start: 'l' }), rechts = meet({ start: 'r' });
  assert.ok(Math.abs(links.C - rechts.C) < 4, `${links.C} ≈ ${rechts.C}`);
});

test('lagere activeringsenergie heen: evenwicht meer rechts', () => {
  const hoog = meet({ fE: 4 }), laag = meet({ fE: 2 });
  assert.ok(laag.C > hoog.C + 5, `${laag.C} > ${hoog.C} + 5`);
});

test('temperatuur: exotherm heen schuift bij verwarmen naar links, endotherm heen naar rechts', () => {
  const exoK = meet({ fE: 3, bE: 7, t: 0 }), exoW = meet({ fE: 3, bE: 7, t: 100 });
  assert.ok(exoK.C > exoW.C + 8, `exotherm: ${exoK.C} > ${exoW.C}`);
  const endoK = meet({ type: 'iso', fE: 7, bE: 3, t: 0 }), endoW = meet({ type: 'iso', fE: 7, bE: 3, t: 100 });
  assert.ok(endoW.B > endoK.B + 8, `endotherm: ${endoW.B} > ${endoK.B}`);
});

test('volume: kleiner volume schuift A + B ⇌ AB naar rechts (minder deeltjes)', () => {
  const groot = meet({ V: 2 }), klein = meet({ V: 0.5 });
  assert.ok(klein.C > groot.C + 5, `${klein.C} > ${groot.C} + 5`);
});

test('katalysator: sneller, maar zelfde evenwicht', () => {
  const zonder = meet({}), met = meet({ cat: 'on' });
  assert.ok(met.f > 1.6 * zonder.f, `${met.f} > 1,6 × ${zonder.f}`);
  assert.ok(Math.abs(met.C - zonder.C) < 3.5, `${met.C} ≈ ${zonder.C}`);
});

test('volume veranderen tijdens de simulatie: deeltjes blijven in het vat', () => {
  Object.assign(app.eq, BASIS);
  app.eqReset(2);
  for (let i = 0; i < 100; i++) app.eqStep(0.02);
  app.eq.V = 0.5; app.eqResize();
  assert.ok(app.eqS.m.every(p => p.x <= app.eqS.W && p.y <= app.eqS.H));
});

test('gevolgd deeltje blijft reageren; figuur met energiediagram en grafieken', () => {
  Object.assign(app.eq, BASIS, { g1: 'on', g2: 'on', ed: 'on', track: 'on', smooth: '3' });
  app.eqReset(4);
  for (let i = 0; i < 3000; i++) app.eqStep(0.02);
  assert.ok(app.eqS.trN >= 3, `gevolgd deeltje reageerde ${app.eqS.trN} keer`);
  assert.equal(app.eqStatus(), true);
  const svg = app.buildEQ();
  assert.equal((svg.match(/<polyline/g) || []).length, 5);
  assert.match(svg, /reactieverloop/);
  assert.match(svg, /Heengaande reactie: exotherm/);
});
