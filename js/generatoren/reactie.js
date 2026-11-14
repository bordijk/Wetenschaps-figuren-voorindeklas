/* ---------- Reactievergelijkingen ---------- */
// [formule, toestand, naam]
const RXLIB={
 'Verbranding':{
  h2:['H2 g waterstof','O2 g zuurstof','>','H2O l water'],
  c:['C s koolstof','O2 g zuurstof','>','CO2 g koolstofdioxide'],
  s:['S s zwavel','O2 g zuurstof','>','SO2 g zwaveldioxide'],
  mg:['Mg s magnesium','O2 g zuurstof','>','MgO s magnesiumoxide'],
  fe:['Fe s ijzer','O2 g zuurstof','>','Fe2O3 s ijzer(III)oxide'],
  al:['Al s aluminium','O2 g zuurstof','>','Al2O3 s aluminiumoxide'],
  cu:['Cu s koper','O2 g zuurstof','>','CuO s koper(II)oxide'],
  p4:['P4 s fosfor','O2 g zuurstof','>','P4O10 s difosforpentaoxide'],
  ch4:['CH4 g methaan','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  ch4o:['CH4 g methaan','O2 g zuurstof','>','CO g koolstofmonoxide','H2O l water'],
  c2h6:['C2H6 g ethaan','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  c3h8:['C3H8 g propaan','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  c4h10:['C4H10 g butaan','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  c8h18:['C8H18 l octaan','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  etoh:['C2H6O l ethanol','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  gluc:['C6H12O6 s glucose','O2 g zuurstof','>','CO2 g koolstofdioxide','H2O l water'],
  h2s:['H2S g waterstofsulfide','O2 g zuurstof','>','SO2 g zwaveldioxide','H2O l water'],
  nh3v:['NH3 g ammoniak','O2 g zuurstof','>','N2 g stikstof','H2O l water'],
 },
 'Ontleding':{
  h2o:['H2O l water','>','H2 g waterstof','O2 g zuurstof'],
  h2o2:['H2O2 l waterstofperoxide','>','H2O l water','O2 g zuurstof'],
  kclo3:['KClO3 s kaliumchloraat','>','KCl s kaliumchloride','O2 g zuurstof'],
  caco3:['CaCO3 s calciumcarbonaat','>','CaO s calciumoxide','CO2 g koolstofdioxide'],
  cuco3:['CuCO3 s kopercarbonaat','>','CuO s koper(II)oxide','CO2 g koolstofdioxide'],
  ag2o:['Ag2O s zilveroxide','>','Ag s zilver','O2 g zuurstof'],
  hgo:['HgO s kwik(II)oxide','>','Hg l kwik','O2 g zuurstof'],
  nahco3:['NaHCO3 s natriumwaterstofcarbonaat','>','Na2CO3 s natriumcarbonaat','H2O l water','CO2 g koolstofdioxide'],
  suiker:['C12H22O11 s suiker','>','C s koolstof','H2O l water'],
  nh3o:['NH3 g ammoniak','>','N2 g stikstof','H2 g waterstof'],
  nacl:['NaCl l natriumchloride','>','Na l natrium','Cl2 g chloor'],
 },
 'Vorming en overig':{
  nh3:['N2 g stikstof','H2 g waterstof','>','NH3 g ammoniak'],
  nacl2:['Na s natrium','Cl2 g chloor','>','NaCl s natriumchloride'],
  hcl:['H2 g waterstof','Cl2 g chloor','>','HCl g waterstofchloride'],
  fes:['Fe s ijzer','S s zwavel','>','FeS s ijzer(II)sulfide'],
  no2:['NO g stikstofmonoxide','O2 g zuurstof','>','NO2 g stikstofdioxide'],
  so3:['SO2 g zwaveldioxide','O2 g zuurstof','>','SO3 g zwaveltrioxide'],
  foto:['CO2 g koolstofdioxide','H2O l water','>','C6H12O6 s glucose','O2 g zuurstof'],
  gist:['C6H12O6 aq glucose','>','C2H6O aq ethanol','CO2 g koolstofdioxide'],
  thermiet:['Al s aluminium','Fe2O3 s ijzer(III)oxide','>','Al2O3 s aluminiumoxide','Fe l ijzer'],
  hoogoven:['Fe2O3 s ijzer(III)oxide','CO g koolstofmonoxide','>','Fe l ijzer','CO2 g koolstofdioxide'],
  nah2o:['Na s natrium','H2O l water','>','NaOH aq natriumhydroxide','H2 g waterstof'],
  cah2o:['Ca s calcium','H2O l water','>','Ca(OH)2 aq calciumhydroxide','H2 g waterstof'],
  cuo:['CuO s koper(II)oxide','H2 g waterstof','>','Cu s koper','H2O l water'],
 },
 'Ionen (oplossen, neerslag, zuur-base)':{
  opnacl:['NaCl s natriumchloride','>','Na^+ aq natriumion','Cl^- aq chloride-ion'],
  opcacl2:['CaCl2 s calciumchloride','>','Ca^{2+} aq calciumion','Cl^- aq chloride-ion'],
  opal:['Al2(SO4)3 s aluminiumsulfaat','>','Al^{3+} aq aluminiumion','SO4^{2-} aq sulfaation'],
  opfe:['Fe(NO3)3 s ijzer(III)nitraat','>','Fe^{3+} aq ijzer(III)ion','NO3^- aq nitraation'],
  agcl:['Ag^+ aq zilverion','Cl^- aq chloride-ion','>','AgCl s zilverchloride'],
  pbi2:['Pb^{2+} aq lood(II)ion','I^- aq jodide-ion','>','PbI2 s lood(II)jodide'],
  baso4:['Ba^{2+} aq bariumion','SO4^{2-} aq sulfaation','>','BaSO4 s bariumsulfaat'],
  feoh3:['Fe^{3+} aq ijzer(III)ion','OH^- aq hydroxide-ion','>','Fe(OH)3 s ijzer(III)hydroxide'],
  ca3po4:['Ca^{2+} aq calciumion','PO4^{3-} aq fosfaation','>','Ca3(PO4)2 s calciumfosfaat'],
  neutr:['H3O^+ aq oxoniumion','OH^- aq hydroxide-ion','>','H2O l water'],
  kalk:['CaCO3 s calciumcarbonaat','H3O^+ aq oxoniumion','>','Ca^{2+} aq calciumion','CO2 g koolstofdioxide','H2O l water'],
  cuag:['Cu s koper','Ag^+ aq zilverion','>','Cu^{2+} aq koper(II)ion','Ag s zilver'],
  znhcl:['Zn s zink','H3O^+ aq oxoniumion','>','Zn^{2+} aq zinkion','H2 g waterstof','H2O l water'],
 }
};
const RXFLAT={};Object.values(RXLIB).forEach(g=>Object.assign(RXFLAT,g));
const STATES=['s','l','g','aq'];
function parseSpecies(str){const p=str.trim().split(/\s+/);let f=p[0],st='',name='';if(p[1]&&STATES.includes(p[1])){st=p[1];name=p.slice(2).join(' ')}else name=p.slice(1).join(' ');return{f,st,name}}
function rxFromLib(id){const a=RXFLAT[id];const i=a.indexOf('>');return{L:a.slice(0,i).map(parseSpecies),R:a.slice(i+1).map(parseSpecies)}}
function rxFromText(txt){
  const m=txt.split(/\s*(?:→|->|=>|=)\s*/);if(m.length!==2)throw new Error('Gebruik één pijl: -> of →');
  const side=s=>s.split(/\s+\+\s+/).map(t=>{t=t.trim();let st='';const sm=t.match(/\s*\((s|l|g|aq)\)\s*$/);if(sm){st=sm[1];t=t.slice(0,sm.index).trim()}
    t=t.replace(/^\d+\s*/,'');if(!t)throw new Error('Lege formule');return{f:t.replace(/\s+/g,''),st,name:''}});
  return{L:side(m[0]),R:side(m[1])};
}
function parseFormula(f){
  let charge=0,body=f;const cm=f.match(/\^(\{([^}]*)\}|[+-])$/);
  if(cm){body=f.slice(0,cm.index);const c=cm[2]!==undefined?cm[2]:cm[1];const n=parseInt(c)||1;charge=c.includes('-')?-n:n}
  const stack=[{}];let i=0;
  const add=(o,e,n)=>o[e]=(o[e]||0)+n;
  while(i<body.length){const ch=body[i];
    if(ch==='('||ch==='['){stack.push({});i++}
    else if(ch===')'||ch===']'){i++;let d='';while(/\d/.test(body[i]||''))d+=body[i++];const top=stack.pop();if(!stack.length)throw new Error('Haakjes kloppen niet in '+f);Object.entries(top).forEach(([e,n])=>add(stack[stack.length-1],e,n*(+d||1)))}
    else if(/[A-Z]/.test(ch)){let e=ch;i++;if(/[a-z]/.test(body[i]||''))e+=body[i++];let d='';while(/\d/.test(body[i]||''))d+=body[i++];add(stack[stack.length-1],e,+d||1)}
    else throw new Error(`Onbekend teken "${ch}" in ${f}`)}
  if(stack.length!==1)throw new Error('Haakjes kloppen niet in '+f);
  return{atoms:stack[0],charge};
}
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b)[a,b]=[b,a%b];return a};
function balance(rx){
  const sp=[...rx.L,...rx.R].map(s=>parseFormula(s.f));const n=sp.length,nl=rx.L.length;
  const els=[];sp.forEach(p=>Object.keys(p.atoms).forEach(e=>{if(!els.includes(e))els.push(e)}));
  const rows=els.map(e=>sp.map((p,j)=>(p.atoms[e]||0)*(j<nl?1:-1)));
  if(sp.some(p=>p.charge))rows.push(sp.map((p,j)=>p.charge*(j<nl?1:-1)));
  // breuken als [teller, noemer]
  const fr=(a,b=1)=>{if(b<0){a=-a;b=-b}const g=gcd(a,b)||1;return[a/g,b/g]};
  const mul=(x,y)=>fr(x[0]*y[0],x[1]*y[1]),sub=(x,y)=>fr(x[0]*y[1]-y[0]*x[1],x[1]*y[1]),div=(x,y)=>fr(x[0]*y[1],x[1]*y[0]);
  const M=rows.map(r=>r.map(v=>fr(v)));let piv=[],r=0;
  for(let c=0;c<n&&r<M.length;c++){let p=M.findIndex((row,i)=>i>=r&&row[c][0]!==0);if(p<0)continue;[M[r],M[p]]=[M[p],M[r]];
    const pv=M[r][c];M[r]=M[r].map(v=>div(v,pv));
    for(let i=0;i<M.length;i++)if(i!==r&&M[i][c][0]!==0){const f=M[i][c];M[i]=M[i].map((v,j)=>sub(v,mul(f,M[r][j])))}
    piv.push(c);r++}
  const free=[...Array(n).keys()].filter(c=>!piv.includes(c));
  if(free.length===0)return{err:'Deze reactie kan niet kloppend gemaakt worden. Controleer de formules.',els};
  if(free.length>1)return{err:'Deze vergelijking heeft meer dan één oplossing. Controleer de formules.',els};
  const x=Array(n).fill(null);x[free[0]]=fr(1);piv.forEach((c,i)=>{x[c]=fr(-M[i][free[0]][0],M[i][free[0]][1])});
  let L=x.reduce((l,v)=>l*v[1]/gcd(l,v[1]),1);let ints=x.map(v=>v[0]*L/v[1]);
  if(ints.every(v=>v<=0))ints=ints.map(v=>-v);
  if(ints.some(v=>v<=0))return{err:'Deze reactie kan niet kloppend gemaakt worden. Controleer de formules.',els};
  const g=ints.reduce((a,b)=>gcd(a,b));ints=ints.map(v=>v/g);
  return{c:ints,els,sp};
}
const toFmt=f=>{const cm=f.match(/\^(\{[^}]*\}|[+-])$/);const body=cm?f.slice(0,cm.index):f;return body.replace(/([A-Za-z\)\]])(\d+)/g,'$1_{$2}')+(cm?cm[0]:'')};

const RX0={items:['ch4','fe','kclo3','nh3','c3h8'],mode:'unbalanced',states:'on',one:'hide',blank:'box',num:'letters',table:'off',answer:'off',seed:1,title:'',caption:'',size:18};
let rx;try{rx=JSON.parse(localStorage.getItem('sf.reactie')||'null')}catch(e){}rx=Object.assign(clone(RX0),rx||{});
const RX_MODES=[['balanced','Kloppend'],['unbalanced','Kloppend maken'],['partial','Deels ingevuld'],['check','Klopt deze?'],['words','Woordvergelijking'],['wordsblank','Woorden → formules']];
let rxAnswers=[];
function rxGet(it){return typeof it==='string'?rxFromLib(it):rxFromText(it.custom)}
function buildRX(){
  lastWarn=[];rxAnswers=[];const M=16,size=+rx.size||18,ans=rx.answer==='on';const lh=size*2.3;
  let top=M,body='',maxW=0;if(ans){body+=`<text x="${M}" y="${M+10}" font-size="12" font-style="italic">uitwerking</text>`;top+=18}
  if(rx.title){body+=fmt(rx.title,M,top+16,17,'start','font-weight="700"');top+=34}
  let y=top+size;
  if(!rx.items.length){body+=fmt('Voeg links een reactie toe.',M,y,15,'start','fill="#888"');return svgWrap(320,y+M,body)}
  rx.items.forEach((it,idx)=>{
    let R;try{R=rxGet(it)}catch(e){lastWarn.push(`Reactie ${idx+1}: ${e.message}`);return}
    let B;try{B=balance(R)}catch(e){lastWarn.push(`Reactie ${idx+1}: ${e.message}`);return}
    if(B.err){lastWarn.push(`Reactie ${idx+1}: ${B.err}`);B.c=[...R.L,...R.R].map(()=>1)}
    const r=rng(rx.seed*1009+idx*31+7);const nT=B.c.length;
    // wat staat er per term
    let shown=B.c.map(c=>({k:'c',v:c}));let wrong=false;
    if(rx.mode==='unbalanced'&&!ans)shown=B.c.map(()=>({k:'blank'}));
    if(rx.mode==='partial'&&!ans){let mask=B.c.map(()=>r()<.5);if(mask.every(Boolean))mask[Math.floor(r()*nT)]=false;if(!mask.some(Boolean)&&nT>1)mask[Math.floor(r()*nT)]=true;
      shown=B.c.map((c,i)=>mask[i]?{k:'c',v:c,force:true}:{k:'blank'})}
    if(rx.mode==='check'){wrong=r()<.5&&!B.err;if(wrong&&!ans){const i=Math.floor(r()*nT);const v=B.c.slice();v[i]=v[i]>1&&r()<.5?v[i]-1:v[i]+1;shown=v.map(c=>({k:'c',v:c}))}}
    const label=rx.num==='letters'?'abcdefghijklmnopqrstuvwxyz'[idx]+')':rx.num==='numbers'?(idx+1)+'.':'';
    const lx=M,x0=M+(label?size*1.7:0);
    if(label)body+=fmt(label,lx,y,size,'start');
    const parts=[];const gap=w=>parts.push({k:'gap',w});
    const termParts=(sp,sh,useName)=>{
      if(useName){parts.push({k:'t',v:sp.name||sp.f});return}
      if(sh.k==='blank')parts.push(rx.blank==='box'?{k:'box'}:{k:'dots',w:size*1.7});
      else if(sh.v!==1||rx.one==='show'||sh.force)parts.push({k:'t',v:String(sh.v)});
      if(sh.k==='blank'||sh.v!==1||rx.one==='show'||sh.force)gap(size*.35);
      parts.push({k:'t',v:toFmt(sp.f)+(rx.states==='on'&&sp.st?` (${sp.st})`:'')})};
    const words=rx.mode==='words'||(rx.mode==='wordsblank');
    const all=[...R.L,...R.R];
    all.forEach((sp,i)=>{
      if(i===R.L.length){gap(size*.6);parts.push({k:'t',v:'→'});gap(size*.6)}
      else if(i>0){gap(size*.4);parts.push({k:'t',v:'+'});gap(size*.4)}
      termParts(sp,shown[i],words)});
    if(words&&all.some(s=>!s.name))lastWarn.push(`Reactie ${idx+1}: eigen reacties hebben geen namen, dus de formules staan er.`);
    // tekenen
    let x=x0;
    const draw=(pp,yy)=>{let xx=x0;pp.forEach(p=>{if(p.k==='gap')xx+=p.w;
      else if(p.k==='box'){const s=size*1.25;body+=`<rect x="${r1(xx)}" y="${r1(yy-s*.82)}" width="${r1(s)}" height="${r1(s)}" fill="none" stroke="#000" stroke-width="1.2"/>`;xx+=s}
      else if(p.k==='dots'){body+=`<line x1="${r1(xx)}" y1="${r1(yy+2)}" x2="${r1(xx+p.w)}" y2="${r1(yy+2)}" stroke="#000" stroke-width="1.4" stroke-dasharray="1.5 3"/>`;xx+=p.w}
      else{body+=fmt(p.v,xx,yy,size,'start');xx+=textW(p.v,size)}});return xx};
    x=draw(parts,y);
    if(rx.mode==='check'){const s=size*.8;let cx=x+size*1.5;
      [['klopt',!wrong],['klopt niet',wrong]].forEach(([t,ok])=>{body+=`<rect x="${r1(cx)}" y="${r1(y-s*.85)}" width="${r1(s)}" height="${r1(s)}" fill="none" stroke="#000" stroke-width="1.1"/>`;
        if(ans&&ok)body+=`<path d="M${r1(cx+s*.2)} ${r1(y-s*.4)}L${r1(cx+s*.42)} ${r1(y-s*.15)}L${r1(cx+s*.85)} ${r1(y-s*.8)}" fill="none" stroke="#000" stroke-width="2"/>`;
        cx+=s+6;body+=fmt(t,cx,y,size*.85,'start');cx+=textW(t,size*.85)+size});x=cx}
    maxW=Math.max(maxW,x);
    if(rx.mode==='wordsblank'){y+=lh;
      if(ans){const fp=[];all.forEach((sp,i)=>{if(i===R.L.length){fp.push({k:'gap',w:size*.6},{k:'t',v:'→'},{k:'gap',w:size*.6})}else if(i>0)fp.push({k:'gap',w:size*.4},{k:'t',v:'+'},{k:'gap',w:size*.4});
          const c=B.c[i];if(c!==1||rx.one==='show')fp.push({k:'t',v:String(c)},{k:'gap',w:size*.35});fp.push({k:'t',v:toFmt(sp.f)+(rx.states==='on'&&sp.st?` (${sp.st})`:'')})});
        maxW=Math.max(maxW,draw(fp,y))}
      else{const w=Math.max(x-x0,size*22);body+=`<line x1="${r1(x0)}" y1="${r1(y+2)}" x2="${r1(x0+w)}" y2="${r1(y+2)}" stroke="#000" stroke-width="1.2" stroke-dasharray="1.5 3"/>`;maxW=Math.max(maxW,x0+w)}}
    // atomentabel
    if(rx.table!=='off'&&!B.err){const els=B.els.slice();const hasQ=B.sp.some(p=>p.charge);if(hasQ)els.push('lading');
      const rh=22,tx=x0,ty=y+size*.75;const c0=Math.max(textW('atoomsoort',13),...els.map(e=>textW(e,13)))+16,c1=textW('voor de pijl',13)+20;
      const cnt=(side)=>els.map(e=>{let s=0;B.sp.forEach((p,j)=>{if((j<R.L.length)===(side==='L'))s+=B.c[j]*(e==='lading'?p.charge:(p.atoms[e]||0))});return s});
      const fill=rx.table==='filled'||ans;const Lc=cnt('L'),Rc=cnt('R');const show=(e,v)=>fill?(e==='lading'?sgnNum(v):v):'';
      const rowsT=[['atoomsoort','voor de pijl','na de pijl'],...els.map((e,i)=>[e,show(e,Lc[i]),show(e,Rc[i])])];
      rowsT.forEach((row,ri)=>row.forEach((v,ci)=>{const cx=ci===0?tx:tx+c0+(ci-1)*c1,w=ci===0?c0:c1,cy=ty+ri*rh;
        body+=`<rect x="${r1(cx)}" y="${r1(cy)}" width="${r1(w)}" height="${rh}" fill="${ri===0||ci===0?'#efefef':'#fff'}" stroke="#000" stroke-width=".9"/>`;
        if(v!=='')body+=`<text x="${r1(ci===0?cx+6:cx+w/2)}" y="${r1(cy+15.5)}" font-size="13" text-anchor="${ci===0?'start':'middle'}" ${ri===0||(ci===0&&v!=='lading')?'font-weight="700"':''}>${esc(String(v))}</text>`}));
      maxW=Math.max(maxW,tx+c0+2*c1);y+=size*.75+rowsT.length*rh+size*.4}
    rxAnswers.push({label,c:B.c,wrong});
    y+=lh;
  });
  let bottom=y-lh+size*.6;
  if(rx.caption){bottom+=26;body+=fmt(rx.caption,M,bottom,15,'start')}
  return svgWrap(Math.max(maxW+M,200),bottom+M,body);
}
function rxPanel(){
  const items=rx.items.map((it,i)=>{let t;try{const R=rxGet(it);t=R.L.map(s=>s.f).join(' + ')+' → '+R.R.map(s=>s.f).join(' + ')}catch(e){t=typeof it==='string'?it:it.custom}
    return `<div style="display:flex;gap:6px;align-items:center;font-size:13px"><span style="flex:1;min-width:0;overflow-wrap:anywhere"><strong>${'abcdefghijklmnopqrstuvwxyz'[i]||i+1})</strong> ${esc(t)}</span>
      <button class="btn small" data-act="up" data-i="${i}" aria-label="Omhoog" ${i?'':'disabled'}>↑</button><button class="btn small" data-act="rm" data-i="${i}" aria-label="Verwijderen">✕</button></div>`}).join('');
  const nm=id=>{const R=rxFromLib(id);return R.L.map(s=>s.name).join(' + ')+' → '+R.R.map(s=>s.name).join(' + ')};
  return `<div class="sec"><h3>Reacties op het blad</h3>
    ${items||'<p class="hint" style="margin:0">Nog geen reacties.</p>'}
    <div class="row"><label for="rxadd">Reactie toevoegen</label><div style="display:flex;gap:8px"><select id="rxadd">${Object.entries(RXLIB).map(([g,list])=>`<optgroup label="${g}">${Object.keys(list).map(id=>`<option value="${id}">${esc(nm(id))}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn" data-act="add">+</button></div></div>
    <div class="row"><label for="rxrcat">Willekeurig toevoegen</label><div style="display:flex;gap:8px"><select id="rxrcat">${Object.keys(RXLIB).map(g=>`<option>${g}</option>`).join('')}<option value="*">Alles door elkaar</option></select>
      <select id="rxrn" style="width:70px" aria-label="Aantal">${[1,2,3,4,5,6,8,10].map(n=>`<option ${n===4?'selected':''}>${n}</option>`).join('')}</select><button class="btn" data-act="rand">+</button></div></div>
    <div class="row"><label for="rxcustom">Eigen reactie</label><div style="display:flex;gap:8px"><input type="text" id="rxcustom" placeholder="C3H8 (g) + O2 (g) -> CO2 (g) + H2O (l)"><button class="btn" data-act="custom">+</button></div>
      <span class="hint">Zet spaties rond + en gebruik -> als pijl. Ionen schrijf je als Fe^{3+} of Cl^-. De getallen voor de formules rekent hij zelf uit.</span></div>
    <button class="btn small" data-act="clear" style="align-self:flex-start">Alles wissen</button>
  </div>
  <div class="sec"><h3>Opdracht</h3>
    <div class="row"><span class="lab">Soort opdracht</span>${seg('mode',RX_MODES.slice(0,3),rx.mode)}${seg('mode',RX_MODES.slice(3),rx.mode)}</div>
    <p class="hint" style="margin:0">${{balanced:'Alle coëfficiënten staan erin.',unbalanced:'Leerlingen vullen alle coëfficiënten in.',partial:'Een deel van de coëfficiënten staat er al; de rest vullen leerlingen in.',check:'De helft van de vergelijkingen klopt niet. Leerlingen kruisen aan en verbeteren.',words:'Alleen de namen van de stoffen.',wordsblank:'Namen van de stoffen met een lege regel eronder voor de kloppende vergelijking.'}[rx.mode]}</p>
    ${['partial','check'].includes(rx.mode)?`<button class="btn small" data-act="reseed" style="align-self:flex-start">Andere variant</button>`:''}
    <div class="row"><span class="lab">Uitwerking</span>${seg('answer',[['off','Opgave'],['on','Uitwerking']],rx.answer)}<span class="hint">Kopieer de opgave, zet dan op Uitwerking en kopieer de antwoorden.</span></div>
  </div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Toestandsaanduidingen</span>${seg('states',[['on','(s) (l) (g) (aq)'],['off','Weglaten']],rx.states)}</div>
    <div class="row"><span class="lab">Coëfficiënt 1</span>${seg('one',[['hide','Weglaten'],['show','Tonen']],rx.one)}</div>
    <div class="row"><span class="lab">Invulplek</span>${seg('blank',[['box','Vakje'],['dots','Stippellijn']],rx.blank)}</div>
    <div class="row"><span class="lab">Atomentabel (tellen)</span>${seg('table',[['off','Geen'],['empty','Leeg'],['filled','Ingevuld']],rx.table)}</div>
    <div class="row"><span class="lab">Nummering</span>${seg('num',[['letters','a) b) c)'],['numbers','1. 2. 3.'],['none','Geen']],rx.num)}</div>
    <div class="row"><span class="lab">Lettergrootte</span>${seg('size',[[15,'Klein'],[18,'Normaal'],[22,'Groot']],+rx.size)}</div>
    <div class="row"><label for="rxtit">Titel (leeg = geen)</label><input type="text" id="rxtit" data-k="title" value="${esc(rx.title)}" placeholder="bijv. Maak de reactievergelijkingen kloppend."></div>
    <div class="row"><label for="rxcap">Onderschrift</label><input type="text" id="rxcap" data-k="caption" value="${esc(rx.caption)}"></div>
  </div>`;
}
const RX={key:'sf.reactie',st:()=>rx,build:buildRX,panel:rxPanel,
  onChange:k=>{if(k==='size')rx.size=+rx.size},
  act:(a,b)=>{const $=id=>document.getElementById(id);
    if(a==='add')rx.items.push($('rxadd').value);
    if(a==='rm')rx.items.splice(+b.dataset.i,1);
    if(a==='up'){const i=+b.dataset.i;if(i>0)[rx.items[i-1],rx.items[i]]=[rx.items[i],rx.items[i-1]]}
    if(a==='clear')rx.items=[];
    if(a==='reseed')rx.seed++;
    if(a==='rand'){const g=$('rxrcat').value,n=+$('rxrn').value;const pool=(g==='*'?Object.keys(RXFLAT):Object.keys(RXLIB[g])).filter(id=>!rx.items.includes(id));
      const r=rng(Date.now()%100000);shuffle(pool,r).slice(0,n).forEach(id=>rx.items.push(id))}
    if(a==='custom'){const v=$('rxcustom').value.trim();if(!v)return false;try{const R=rxFromText(v);R.L.concat(R.R).forEach(s=>parseFormula(s.f));rx.items.push({custom:v})}catch(e){lastWarn=[e.message];document.getElementById('warns').innerHTML=`<div class="warn">${esc(e.message)}</div>`;return false}}
  }};

GEN.reactie=()=>mountGen(RX);
