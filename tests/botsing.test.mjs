import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();

// Laat de simulatie een tijdje lopen met vaste startwaarden; telt over een paar seeds op, zodat toeval weinig uitmaakt.
function meet(inst, sec = 10) {
  let hits = 0, eff = 0;
  for (const seed of [11, 22, 33]) {
    Object.assign(app.bo, { t: 20, n: 80, div: '1', cat: 'off' }, inst);
    app.boReset(seed);
    for (let i = 0; i < sec * 50; i++) app.boStep(0.02);
    hits += app.boS.hits; eff += app.boS.eff;
  }
  return { hits, eff };
}

test('hogere temperatuur: meer botsingen en meer effectieve botsingen', () => {
  const koud = meet({ t: 0 }), warm = meet({ t: 100 });
  assert.ok(warm.hits > koud.hits, `${warm.hits} > ${koud.hits}`);
  assert.ok(warm.eff > 2 * koud.eff, `${warm.eff} > 2 × ${koud.eff}`);
  assert.ok(warm.eff / warm.hits > koud.eff / koud.hits, 'groter deel effectief');
});

test('hogere concentratie: meer botsingen', () => {
  const laag = meet({ n: 20 }), hoog = meet({ n: 200 });
  assert.ok(hoog.hits > 2 * laag.hits, `${hoog.hits} > 2 × ${laag.hits}`);
});

test('fijnere verdeling: meer botsingen met de vaste stof', () => {
  const blok = meet({ div: '1' }), poeder = meet({ div: '144' });
  assert.ok(poeder.hits > 1.5 * blok.hits, `${poeder.hits} > 1,5 × ${blok.hits}`);
  assert.ok(poeder.eff > blok.eff, `${poeder.eff} > ${blok.eff}`);
});

test('katalysator: meer effectieve botsingen', () => {
  assert.ok(meet({ cat: 'on' }).eff > meet({ cat: 'off' }).eff);
});

test('vaste stof: altijd 144 deeltjes, en wat reageert verdwijnt', () => {
  for (const div of ['1', '4', '9', '16', '36', '144']) {
    Object.assign(app.bo, { div, t: 100, n: 200 });
    app.boReset(5);
    assert.equal(app.boS.solid.length, 144, div);
    for (let i = 0; i < 2000; i++) app.boStep(0.01);
    assert.equal(144 - app.boLeft(), app.boS.eff, div);
    assert.ok(!/NaN|undefined/.test(app.buildBO()), div);
  }
  Object.assign(app.bo, { div: '1', t: 20, n: 80 });
});

test('grafiek: geschiedenis klopt met de deeltjes en wordt getekend', () => {
  Object.assign(app.bo, { t: 80, n: 80, div: '144', graph: 'on' });
  app.boReset(7);
  for (let i = 0; i < 1500; i++) app.boStep(0.01);
  const h = app.boS.hist, last = h[h.length - 1];
  assert.ok(h.length > 50);
  assert.equal(h[0].S, 144);
  assert.equal(h[0].A, 80);
  assert.equal(last.A + last.P, 80, 'opgelost + product blijft gelijk');
  assert.equal(144 - last.S, last.P, 'elk gereageerd deeltje geeft een product');
  const svg = app.buildBO();
  assert.match(svg, /<polyline/);
  assert.match(svg, /tijd \(s\)/);
  assert.ok(!/NaN|undefined/.test(svg));
  Object.assign(app.bo, { t: 20, div: '1', graph: 'off' });
});
