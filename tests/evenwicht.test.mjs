import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();

// Gemiddeld aantal AB en reactiesnelheden in de tweede helft van de meting, over een paar seeds
function meet(inst, sec = 60) {
  let C = 0, f = 0, b = 0, n = 0;
  for (const seed of [1, 2, 3]) {
    Object.assign(app.eq, { t: 20, n: 60, start: 'ab', cat: 'off' }, inst);
    app.eqReset(seed);
    for (let i = 0; i < sec * 50; i++) {
      app.eqStep(0.02);
      if (app.eqS.time > sec / 2 && i % 25 === 0) { C += app.eqCount('C'); f += app.eqRate(app.eqS.fT); b += app.eqRate(app.eqS.bT); n++; }
    }
  }
  return { C: C / n, f: f / n, b: b / n };
}

test('deeltjes blijven behouden: A + AB en B + AB veranderen niet', () => {
  Object.assign(app.eq, { t: 40, n: 50, start: 'ab', cat: 'off' });
  app.eqReset(9);
  for (let i = 0; i < 1500; i++) {
    app.eqStep(0.02);
    assert.equal(app.eqCount('A') + app.eqCount('C'), 50);
    assert.equal(app.eqCount('B') + app.eqCount('C'), 50);
  }
});

test('dynamisch evenwicht: heen en terug even snel, maar niet nul', () => {
  const m = meet({});
  assert.ok(m.f > 2 && m.b > 2, `heen ${m.f}, terug ${m.b}`);
  assert.ok(Math.abs(m.f - m.b) < 0.15 * m.f, `heen ${m.f} ≈ terug ${m.b}`);
  assert.ok(m.C > 15 && m.C < 45, `AB ${m.C}`);
});

test('zelfde evenwicht vanaf beide kanten', () => {
  const links = meet({ start: 'ab' }), rechts = meet({ start: 'c' });
  assert.ok(Math.abs(links.C - rechts.C) < 4, `${links.C} ≈ ${rechts.C}`);
});

test('heengaande reactie exotherm: bij hogere temperatuur minder AB', () => {
  const koud = meet({ t: 0 }), warm = meet({ t: 100 });
  assert.ok(koud.C > warm.C + 10, `${koud.C} > ${warm.C} + 10`);
});

test('katalysator: sneller, maar zelfde evenwicht', () => {
  const zonder = meet({}), met = meet({ cat: 'on' });
  assert.ok(met.f > 1.6 * zonder.f, `${met.f} > 1,6 × ${zonder.f}`);
  assert.ok(Math.abs(met.C - zonder.C) < 3, `${met.C} ≈ ${zonder.C}`);
});

test('gevolgd deeltje blijft reageren en figuur tekent zonder fouten', () => {
  Object.assign(app.eq, { t: 20, n: 60, start: 'ab', cat: 'off', g1: 'on', g2: 'on', track: 'on', color: 'color' });
  app.eqReset(4);
  for (let i = 0; i < 3000; i++) app.eqStep(0.02);
  assert.ok(app.eqS.trN >= 3, `gevolgd deeltje reageerde ${app.eqS.trN} keer`);
  assert.equal(app.eqStatus(), true);
  const svg = app.buildEQ();
  assert.ok(!/NaN|undefined/.test(svg));
  assert.equal((svg.match(/<polyline/g) || []).length, 5);
  assert.match(svg, /Evenwicht:/);
  app.eq.color = 'bw';
});
