import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();

// Laat de simulatie een tijdje lopen met vaste startwaarden; telt over een paar seeds op, zodat toeval weinig uitmaakt.
function meet(inst, sec = 15) {
  let hits = 0, eff = 0;
  for (const seed of [11, 22, 33]) {
    Object.assign(app.bo, { t: 20, c: 3, div: '1', cat: 'off' }, inst);
    app.boReset(seed);
    for (let i = 0; i < sec * 100; i++) app.boStep(0.01);
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
  const laag = meet({ c: 1 }), hoog = meet({ c: 5 });
  assert.ok(hoog.hits > 2 * laag.hits, `${hoog.hits} > 2 × ${laag.hits}`);
});

test('fijnere verdeling: meer botsingen met de vaste stof', () => {
  const blok = meet({ div: '1' }), poeder = meet({ div: '36' });
  assert.ok(poeder.hits > 1.5 * blok.hits, `${poeder.hits} > 1,5 × ${blok.hits}`);
  assert.ok(poeder.eff > blok.eff, `${poeder.eff} > ${blok.eff}`);
});

test('katalysator: meer effectieve botsingen', () => {
  assert.ok(meet({ cat: 'on' }).eff > meet({ cat: 'off' }).eff);
});

test('vaste stof: altijd 36 deeltjes, en wat reageert verdwijnt', () => {
  for (const div of ['1', '4', '9', '36']) {
    Object.assign(app.bo, { div, t: 100, c: 5 });
    app.boReset(5);
    assert.equal(app.boS.solid.length, 36, div);
    for (let i = 0; i < 2000; i++) app.boStep(0.01);
    assert.equal(36 - app.boLeft(), app.boS.eff, div);
    assert.ok(!/NaN|undefined/.test(app.buildBO()), div);
  }
  Object.assign(app.bo, { div: '1', t: 20, c: 3 });
});
