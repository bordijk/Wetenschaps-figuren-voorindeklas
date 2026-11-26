// Laadt alle scripts van de app in een nep-browseromgeving, zodat de rekenfuncties te testen zijn.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export function laadApp() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]).filter(s => !s.endsWith('main.js'));
  const ctx2d = { font: '10px Arial', measureText(t) { return { width: t.length * 0.55 * parseFloat(this.font) }; } };
  const element = () => ({ getContext: () => ctx2d, addEventListener() {}, querySelectorAll: () => [], style: {}, set innerHTML(v) {} });
  const sandbox = {
    console,
    document: { createElement: element, getElementById: element, querySelector: element },
    localStorage: { getItem: () => null, setItem() {} },
    location: { hash: '' },
    window: { addEventListener() {} },
  };
  vm.createContext(sandbox);
  const code = scripts.map(s => fs.readFileSync(path.join(root, s), 'utf8')).join('\n;\n')
    + '\n;globalThis.__app={GEN,RXFLAT,RXLIB,rxFromLib,rxFromText,balance,buildSVG,buildMetalSVG,buildBohr,buildLewis,buildATB,buildED,buildOC,buildRX,buildST,buildBO,buildEQ,eqReset,eqStep,eqCount,eqRate,eqStatus,eqAtoms,eqResize,boReset,boStep,boLeft,stView,stFillH,stFormula,stFormulas,stLoad,stCheck,stClick,stAtXY,stTermH,'
    + 'panelHTML,metalPanelHTML,bohrPanel,lewisPanel,atbPanel,edPanel,ocPanel,rxPanel,stPanel,boPanel,eqPanel,get eq(){return eq},get eqS(){return eqS},get bo(){return bo},get boS(){return boS},get sst(){return sst},get rx(){return rx},get lastWarn(){return lastWarn}};';
  vm.runInContext(code, sandbox, { filename: 'app.js' });
  return sandbox.__app;
}
