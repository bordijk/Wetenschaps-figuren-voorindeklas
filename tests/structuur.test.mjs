import test from 'node:test';
import assert from 'node:assert/strict';
import { laadApp } from './laad.mjs';

const app = laadApp();

test('voorbeelden krijgen de juiste molecuulformule en kloppende bindingen', () => {
  const verwacht = {
    methaan: 'CH_{4}', ethaan: 'C_{2}H_{6}', methylpropaan: 'C_{4}H_{10}', dimethylpropaan: 'C_{5}H_{12}',
    etheen: 'C_{2}H_{4}', ethyn: 'C_{2}H_{2}', ethanol: 'C_{2}H_{6}O', propaan2ol: 'C_{3}H_{8}O', glycerol: 'C_{3}H_{8}O_{3}',
    dichloormethaan: 'CH_{2}Cl_{2}', ethaanzuur: 'C_{2}H_{4}O_{2}', ethylethanoaat: 'C_{4}H_{8}O_{2}',
    methaanamine: 'CH_{5}N', propanon: 'C_{3}H_{6}O', water: 'H_{2}O', ammoniak: 'NH_{3}', co2: 'CO_{2}',
  };
  for (const [id, f] of Object.entries(verwacht)) {
    app.stLoad(id);
    assert.equal(app.stFormulas(), f, id);
    assert.equal(app.stCheck().w.length, 0, `${id}: ${app.stCheck().w}`);
    assert.ok(!/NaN|undefined/.test(app.buildST()), id);
  }
});

test('etheen: de H-atomen staan schuin, niet in een rechte hoek', () => {
  app.stLoad('etheen');
  const hs = app.sst.atoms.filter(a => a.el === 'H');
  assert.equal(hs.length, 4);
  for (const h of hs) {
    const b = app.sst.bonds.find(b => b.a === h.id || b.b === h.id);
    const c = app.sst.atoms.find(a => a.id === (b.a === h.id ? b.b : b.a));
    assert.ok(Math.abs(c.x - h.x) === 1 && Math.abs(c.y - h.y) === 1, 'H schuin naast zijn eigen C-atoom');
  }
});

test('tekenen met klikken: atoom, binding en dubbele binding', () => {
  const s = app.sst;
  s.atoms = []; s.bonds = []; s.marks = []; s.sel = null; s.tool = 'draw';
  s.el = 'C'; app.stClick(null, null, { x: 3, y: 3 });
  app.stClick(null, null, { x: 4, y: 3 });            // naast het gekozen C-atoom: binding erbij
  assert.equal(s.bonds.length, 1);
  app.stClick(null, s.bonds[0], null);                // klik op de binding: dubbel
  assert.equal(s.bonds[0].o, 2);
  assert.equal(app.stFillH(), 0);
  assert.equal(app.stFormulas(), 'C_{2}H_{4}');
  s.el = 'O'; app.stClick(null, null, { x: 9, y: 3 }); // los molecuul
  assert.equal(app.stFormulas(), 'C_{2}H_{4}, O');
  assert.ok(app.stCheck().w.some(t => t.includes('te weinig')));
});

test('te veel bindingen geeft een melding', () => {
  app.stLoad('methaan');
  app.sst.bonds[0].o = 2;
  assert.ok(app.stCheck().w.some(t => t.includes('te veel')));
});

test('weergaven: gegroepeerd, lege H-plekken en editor tekenen zonder fouten', () => {
  app.stLoad('ethanol');
  for (const [view, hMode, lp] of [['grouped', 'show', 'line'], ['full', 'blank', 'dot'], ['full', 'hide', 'none']]) {
    Object.assign(app.sst, { view, hMode, lp, label: 'formula' });
    const svg = app.buildST();
    assert.ok(!/NaN|undefined/.test(svg), view + hMode);
    if (view === 'grouped') assert.match(svg, /H<\/tspan><tspan[^>]*>3/);
  }
  assert.ok(!/NaN|undefined/.test(app.stView()));
  Object.assign(app.sst, { view: 'full', hMode: 'show', lp: 'none', label: 'none' });
});

test('H-atomen bij C=O met twee buren staan recht; naam vervalt na een wijziging', () => {
  app.stLoad('ethanal');
  const c = app.sst.atoms.find(a => a.el === 'C' && app.sst.bonds.some(b => b.o === 2 && (b.a === a.id || b.b === a.id)));
  const h = app.sst.atoms.find(a => a.el === 'H' && app.sst.bonds.some(b => (b.a === a.id && b.b === c.id) || (b.b === a.id && b.a === c.id)));
  assert.ok(h.x === c.x || h.y === c.y, 'H recht naast C');
  app.sst.label = 'name';
  assert.match(app.buildST(), /ethanal/);
  app.stFillH(); app.sst.atoms.find(a => a.el === 'O').el = 'S';
  assert.doesNotMatch(app.buildST(), /ethanal/);
  assert.ok(app.lastWarn.some(t => t.includes('veranderd')));
  app.sst.label = 'none';
});
