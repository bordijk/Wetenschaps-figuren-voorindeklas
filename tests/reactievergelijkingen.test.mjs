import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();

test('alle reacties uit de bibliotheek zijn kloppend te maken', () => {
  for (const id of Object.keys(app.RXFLAT)) {
    const B = app.balance(app.rxFromLib(id));
    assert.equal(B.err, undefined, `${id}: ${B.err}`);
    assert.ok(B.c.every(c => Number.isInteger(c) && c > 0), `${id}: ${B.c}`);
  }
});

test('bekende coëfficiënten', () => {
  const verwacht = { ch4: [1, 2, 1, 2], fe: [4, 3, 2], c3h8: [1, 5, 3, 4], gluc: [1, 6, 6, 6], kalk: [1, 2, 1, 1, 3], opal: [1, 2, 3], thermiet: [2, 1, 1, 2] };
  for (const [id, c] of Object.entries(verwacht)) assert.deepEqual([...app.balance(app.rxFromLib(id)).c], c, id);
});

test('eigen reacties, ook met ionen', () => {
  assert.deepEqual([...app.balance(app.rxFromText('C3H8 (g) + O2 (g) -> CO2 (g) + H2O (l)')).c], [1, 5, 3, 4]);
  assert.deepEqual([...app.balance(app.rxFromText('Fe^{3+} + OH^- -> Fe(OH)3')).c], [1, 3, 1]);
  assert.deepEqual([...app.balance(app.rxFromText('Al2(SO4)3 → Al^{3+} + SO4^{2-}')).c], [1, 2, 3]);
});

test('onmogelijke reactie geeft een melding', () => {
  assert.ok(app.balance(app.rxFromText('H2O -> CO2')).err);
});
