/* ---------- Deeltjesmodel: data ---------- */
const SHAPES=[['atom','Los atoom of ion'],['pair','Twee atomen (O₂, HCl)'],['bent','Gebogen (H₂O)'],['linear','Lineair (CO₂)'],['three','Drie eromheen (NH₃)'],['four','Vier eromheen (CH₄)']];
const CHARGES=[['','geen'],['+','+'],['−','−'],['2+','2+'],['2−','2−'],['3+','3+'],['3−','3−']];

const K=(name,shape,size,shade,charge='',oSize='S',oShade=0)=>({name,shape,size,shade,charge,oSize,oShade});
const B=(o)=>Object.assign({layout:'box',state:'gas',pattern:'alt',rows:6,cols:8,spacing:'touch',counts:[],seed:1,caption:''},o);
const EXAMPLES={
 smelten:{label:'Smelten van ijs (voor en na)',st:{mode:'two',arrow:'verwarmen',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('H_2O','bent','M',2,'','S',0)],boxes:[B({state:'solid',counts:[20]}),B({state:'liquid',counts:[20],seed:3})]}},
 gas:{label:'Lucht: stikstof en zuurstof',st:{mode:'one',arrow:'',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('N_2','pair','M',1,'','M',1),K('O_2','pair','M',3,'','M',3)],boxes:[B({state:'gas',counts:[12,4]})]}},
 reactie:{label:'Reactie: 2 H₂ + O₂ → 2 H₂O',st:{mode:'two',arrow:'reactie',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('H_2','pair','S',0,'','S',0),K('O_2','pair','M',2,'','M',2),K('H_2O','bent','M',2,'','S',0)],
   boxes:[B({state:'gas',counts:[6,3,0],seed:2}),B({state:'gas',counts:[0,0,6],seed:5})]}},
 nacl:{label:'Ionrooster: natriumchloride',st:{mode:'one',arrow:'',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('Na^+','atom','S',0,'+'),K('Cl^-','atom','L',2,'−')],boxes:[B({layout:'lattice',pattern:'alt',rows:6,cols:8,counts:[0,0]})]}},
 oplossen:{label:'Zout opgelost in water',st:{mode:'one',arrow:'',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('H_2O','bent','M',0,'','S',0),K('Na^+','atom','S',3,'+'),K('Cl^-','atom','M',1,'−')],boxes:[B({state:'liquid',counts:[30,4,4],seed:4})]}},
 messing:{label:'Legering: messing (substitutie)',st:{mode:'one',arrow:'',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('Cu','atom','M',1),K('Zn','atom','M',3)],boxes:[B({layout:'lattice',pattern:'subst',rows:6,cols:8,counts:[0,12]})]}},
 staal:{label:'Legering: staal (interstitieel)',st:{mode:'one',arrow:'',title:'',border:'single',keyMode:'both',note:'',
   kinds:[K('Fe','atom','L',1),K('C','atom','XS',4)],boxes:[B({layout:'lattice',pattern:'inter',rows:6,cols:8,counts:[0,10]})]}},
};
let st, ui={tab:0, example:'smelten'};
try{const s=localStorage.getItem('sf.deeltjes');if(s)st=JSON.parse(s)}catch(e){}
if(!st||!st.kinds)st=clone(EXAMPLES.smelten.st);
function save(){try{localStorage.setItem('sf.deeltjes',JSON.stringify(st))}catch(e){}}

/* ---------- Deeltjes tekenen ---------- */
function geom(k,scale){
  const r=SIZES[k.size]*scale, ro=SIZES[k.oSize]*scale, d=(r+ro)*.74;
  const angs={atom:[],pair:[0],bent:[38,142],linear:[0,180],three:[90,210,330],four:[45,135,225,315]}[k.shape]||[];
  let atoms=[{x:0,y:0,r,sh:k.shade,c:true}];
  angs.forEach(a=>{const t=a*Math.PI/180;atoms.push({x:d*Math.cos(t),y:d*Math.sin(t),r:ro,sh:k.oShade})});
  let x0=Infinity,x1=-Infinity,y0=Infinity,y1=-Infinity;
  atoms.forEach(a=>{x0=Math.min(x0,a.x-a.r);x1=Math.max(x1,a.x+a.r);y0=Math.min(y0,a.y-a.r);y1=Math.max(y1,a.y+a.r)});
  const cx=(x0+x1)/2,cy=(y0+y1)/2;atoms.forEach(a=>{a.x-=cx;a.y-=cy});
  const R=Math.max(...atoms.map(a=>Math.hypot(a.x,a.y)+a.r));
  return {atoms,R};
}
function drawParticle(k,x,y,rot,scale,rOverride){
  let atoms;
  if(rOverride){atoms=[{x:0,y:0,r:rOverride,sh:k.shade,c:true}]}
  else atoms=geom(k,scale).atoms;
  const t=rot*Math.PI/180,co=Math.cos(t),si=Math.sin(t);
  const pts=atoms.map(a=>({...a,X:x+a.x*co-a.y*si,Y:y+a.x*si+a.y*co}));
  const order=[...pts.filter(a=>!a.c),...pts.filter(a=>a.c)];
  let s=order.map(a=>`<circle cx="${r1(a.X)}" cy="${r1(a.Y)}" r="${r1(a.r)}" fill="${fillOf(a.sh)}" stroke="#000" stroke-width="1.1"/>`).join('');
  if(k.charge){const c=pts.find(a=>a.c);const fs=Math.max(7,c.r*(k.charge.length>1?.85:1.15));
    s+=`<text x="${r1(c.X)}" y="${r1(c.Y+fs*.35)}" font-size="${r1(fs)}" font-weight="700" text-anchor="middle" fill="${darkOf(k.shade)?'#fff':'#000'}">${esc(k.charge)}</text>`}
  return s;
}

/* ---------- Plaatsing in een bak ---------- */
function layoutBox(box,kinds){
  const r=rng(box.seed*7919+13);const items=[];let warn='';
  if(box.layout==='lattice')return layoutLattice(box,kinds,r);
  let list=[];kinds.forEach((k,i)=>{for(let n=0;n<(+box.counts[i]||0);n++)list.push(i)});
  shuffle(list,r);
  if(!list.length)return{items,warn};
  const W=BW-2*PAD,H=BH-2*PAD;
  if(box.state==='gas'){
    let scale=1;const area=list.reduce((s,i)=>s+Math.PI*geom(kinds[i],1).R**2,0);
    const frac=area/(W*H);if(frac>.22)scale=Math.sqrt(.22/frac);
    for(let attempt=0;attempt<8;attempt++){
      const placed=[];let ok=true;
      for(const i of list){const R=geom(kinds[i],scale).R;let done=false;
        for(let t=0;t<600;t++){const x=PAD+R+r()*(W-2*R),y=PAD+R+r()*(H-2*R);
          if(placed.every(p=>Math.hypot(p.x-x,p.y-y)>p.R+R+3)){placed.push({i,x,y,R,rot:r()*360});done=true;break}}
        if(!done){ok=false;break}}
      if(ok){placed.forEach(p=>items.push({k:p.i,x:p.x,y:p.y,rot:p.rot,scale}));if(scale<1)warn='Veel deeltjes: ze zijn kleiner getekend zodat ze passen.';return{items,warn}}
      scale*=.9;
    }
    return{items,warn:'Te veel deeltjes voor een gas; verlaag de aantallen.'};
  }
  const liquid=box.state==='liquid';
  const Rmax=Math.max(...[...new Set(list)].map(i=>geom(kinds[i],1).R));
  let scale=1,c,cols,rowH,rows;
  for(let it=0;it<40;it++){
    c=2*Rmax*scale*(liquid?1.07:1.04);cols=Math.max(1,Math.floor(W/c));rowH=liquid?c*.88:c;
    rows=Math.ceil(list.length/cols);if(rows*rowH+c*.15<=H)break;scale*=.94;
  }
  if(scale<1)warn='Veel deeltjes: ze zijn kleiner getekend zodat ze passen.';
  const cells=[];
  for(let row=0;row<rows;row++){
    const odd=liquid&&row%2===1;const n=odd&&(cols*c+c/2>W)?cols-1:cols;
    const gridW=(liquid?cols:Math.min(cols,list.length))*c;const left=PAD+(W-gridW)/2;
    let rowCells=[];for(let col=0;col<n;col++)rowCells.push({x:left+c/2+col*c+(odd?c/2:0),y:BH-PAD-c/2-row*rowH});
    cells.push(rowCells);
  }
  let idx=0;
  for(let row=0;row<rows&&idx<list.length;row++){
    let rc=cells[row];const left=list.length-idx;
    if(left<rc.length){rc=liquid?shuffle([...rc],r).slice(0,left).sort((a,b)=>a.x-b.x):rc.slice(0,left)}
    for(const cell of rc){if(idx>=list.length)break;
      const j=liquid?c*.07:0;
      items.push({k:list[idx++],x:cell.x+(r()*2-1)*j,y:cell.y+(r()*2-1)*j,rot:liquid?r()*360:0,scale})}
  }
  return{items,warn};
}
function layoutLattice(box,kinds,r){
  const items=[];let warn='';
  const rows=Math.max(1,Math.min(12,+box.rows||1)),cols=Math.max(1,Math.min(12,+box.cols||1));
  const W=BW-2*PAD,H=BH-2*PAD;const cell=Math.min(W/cols,H/rows);
  const touch=box.spacing==='touch';const rmax=touch?cell/2:cell*.32;
  const A=kinds[0],Bk=kinds[1];
  if(!A)return{items,warn};
  const needB=box.pattern!=='one';
  if(needB&&!Bk)warn='Voeg een tweede deeltjessoort toe voor dit patroon.';
  const sA=SIZES[A.size],sB=Bk?SIZES[Bk.size]:sA;
  let rA=rmax,rB=rmax;
  if(Bk){if(sA>=sB){rB=rmax*sB/sA}else{rA=rmax*sA/sB}}
  const x0=PAD+(W-cols*cell)/2,y0=PAD+(H-rows*cell)/2;
  const site=(i,j)=>({x:x0+cell*(j+.5),y:y0+cell*(i+.5)});
  if(box.pattern==='inter'){
    rA=rmax;rB=Bk?Math.min(rmax*sB/sA,cell*.24):0;
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){const p=site(i,j);items.push({k:0,...p,rot:0,rO:rA})}
    if(Bk){const gaps=[];for(let i=0;i<rows-1;i++)for(let j=0;j<cols-1;j++)gaps.push({x:x0+cell*(j+1),y:y0+cell*(i+1)});
      const n=Math.min(+box.counts[1]||0,gaps.length);if((+box.counts[1]||0)>gaps.length)warn=`Er zijn maar ${gaps.length} gaten in dit rooster.`;
      shuffle(gaps,r).slice(0,n).forEach(g=>items.push({k:1,...g,rot:0,rO:rB}))}
    return{items,warn};
  }
  let subs=new Set();
  if(box.pattern==='subst'&&Bk){const all=[];for(let i=0;i<rows*cols;i++)all.push(i);
    const n=Math.min(+box.counts[1]||0,all.length);shuffle(all,r).slice(0,n).forEach(v=>subs.add(v))}
  for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){
    const p=site(i,j);let isB=false;
    if(Bk&&box.pattern==='alt')isB=(i+j)%2===1;
    if(Bk&&box.pattern==='subst')isB=subs.has(i*cols+j);
    items.push({k:isB?1:0,...p,rot:0,rO:isB?rB:rA});
  }
  return{items,warn};
}

/* ---------- Figuur samenstellen ---------- */
function buildSVG(){
  const M=14,F='Arial, Helvetica, sans-serif';
  const nb=st.mode==='two'?2:1;const showBox=st.keyMode!=='key',showKey=st.keyMode!=='box';
  let body='',y=M,W=0,H=0;lastWarn=[];
  if(st.title){body+=fmt(st.title,M,y+16,17,'start','font-weight="700"');y+=30}
  const top=y;let right=M,bottom=top;
  if(showBox){
    const AG=96;let x=M;
    for(let b=0;b<nb;b++){
      const box=st.boxes[b];const {items,warn}=layoutBox(box,st.kinds);if(warn)lastWarn.push((nb>1?`Bak ${b+1}: `:'')+warn);
      body+=`<g transform="translate(${x},${top})">`;
      if(st.border==='single')body+=`<rect x="0" y="0" width="${BW}" height="${BH}" fill="#fff" stroke="#000" stroke-width="1.6"/>`;
      else if(st.border==='double')body+=`<rect x="-3" y="-3" width="${BW+6}" height="${BH+6}" fill="#fff" stroke="#000" stroke-width="1.3"/><rect x="0" y="0" width="${BW}" height="${BH}" fill="none" stroke="#000" stroke-width="1.3"/>`;
      items.forEach(it=>{const k=st.kinds[it.k];if(k)body+=drawParticle(k,it.x,it.y,it.rot,it.scale||1,it.rO)});
      body+=`</g>`;
      if(box.caption)body+=fmt(box.caption,x+BW/2,top+BH+22,15,'middle');
      x+=BW;
      if(b===0&&nb===2){const ay=top+BH/2;
        body+=`<line x1="${x+14}" y1="${ay}" x2="${x+AG-22}" y2="${ay}" stroke="#000" stroke-width="2"/><polygon points="${x+AG-12},${ay} ${x+AG-24},${ay-7} ${x+AG-24},${ay+7}" fill="#000"/>`;
        if(st.arrow)body+=fmt(st.arrow,x+AG/2,ay-12,14,'middle');
        x+=AG}
    }
    right=x;bottom=top+BH+(st.boxes.slice(0,nb).some(b=>b.caption)?30:0);
  }
  if(showKey){
    const kx=showBox?right+28:M;let ky=top+(showBox?4:0),kw=0;
    st.kinds.forEach(k=>{
      const g=geom(k,1);const s=Math.min(1,17/g.R);const R=g.R*s;const h=Math.max(2*R,22);
      body+=drawParticle(k,kx+20,ky+h/2,0,s);
      body+=fmt(k.name||'?',kx+48,ky+h/2+5,15,'start');
      kw=Math.max(kw,48+textW(k.name||'?',15));ky+=h+10;
    });
    if(st.note){const words=st.note.split(/\s+/);let line='',lines=[];
      words.forEach(w=>{const t=line?line+' '+w:w;if(textW(t,13)>230&&line){lines.push(line);line=w}else line=t});if(line)lines.push(line);
      ky+=4;lines.forEach(l=>{body+=fmt(l,kx,ky+12,13,'start','font-style="italic"');kw=Math.max(kw,textW(l,13));ky+=17})}
    right=Math.max(right,kx+kw);bottom=Math.max(bottom,ky);
  }
  W=Math.ceil(right+M);H=Math.ceil(bottom+M);
  const defs=`<defs><pattern id="pf-dots" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#fff"/><circle cx="2.5" cy="2.5" r="1.1" fill="#000"/></pattern><pattern id="pf-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#000" stroke-width="1.4"/></pattern></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${F}" fill="#000"><rect width="${W}" height="${H}" fill="#fff"/>${defs}${body}</svg>`;
}

/* ---------- Bedieningspaneel ---------- */

function panelHTML(){
  const nb=st.mode==='two'?2:1;if(ui.tab>=nb)ui.tab=0;
  const box=st.boxes[ui.tab];
  let h=`<div class="sec"><h3>Voorbeeld</h3><div class="row"><div style="display:flex;gap:8px">
    <select id="ex" aria-label="Voorbeeld">${Object.entries(EXAMPLES).map(([k,e])=>`<option value="${k}" ${ui.example===k?'selected':''}>${e.label}</option>`).join('')}</select>
    <button class="btn" data-act="load">Laden</button></div></div></div>`;
  h+=`<div class="sec"><h3>Figuur</h3>
    <div class="row"><span class="lab">Bakken</span>${seg('mode',[['one','Eén bak'],['two','Voor en na']],st.mode)}</div>
    ${st.mode==='two'?`<div class="row"><label for="arrow">Tekst bij de pijl</label><input type="text" id="arrow" data-k="arrow" value="${esc(st.arrow)}" placeholder="bijv. verwarmen"></div>`:''}
    <div class="row"><span class="lab">Tonen</span>${seg('keyMode',[['both','Bak en legenda'],['box','Alleen bak'],['key','Alleen legenda']],st.keyMode)}</div>
    <div class="row"><span class="lab">Rand</span>${seg('border',[['single','Enkel'],['double','Dubbel'],['none','Geen']],st.border)}</div>
    <div class="row"><label for="title">Titel (leeg = geen)</label><input type="text" id="title" data-k="title" value="${esc(st.title)}"></div>
    <div class="row"><label for="note">Notitie onder legenda</label><input type="text" id="note" data-k="note" value="${esc(st.note)}" placeholder="bijv. Watermoleculen zijn niet getekend."></div>
  </div>`;
  h+=`<div class="sec"><h3>Deeltjessoorten</h3><p class="hint" style="margin:0">Gebruik _ voor subscript en ^ voor superscript: H_2O, SO_4^{2-}, Na^+</p>`;
  st.kinds.forEach((k,i)=>{
    const mol=k.shape!=='atom';
    h+=`<div class="kind"><div class="kind-head"><strong>Soort ${'ABCD'[i]}</strong>${st.kinds.length>1?`<button class="btn small" data-act="del" data-i="${i}">Verwijderen</button>`:''}</div>
      <div class="two"><div class="row"><label for="kn${i}">Naam</label><input type="text" id="kn${i}" data-k="kinds.${i}.name" value="${esc(k.name)}"></div>
      <div class="row"><label for="ks${i}">Vorm</label><select id="ks${i}" data-k="kinds.${i}.shape" data-rebuild>${SHAPES.map(([v,l])=>`<option value="${v}" ${k.shape===v?'selected':''}>${l}</option>`).join('')}</select></div></div>
      <div class="row"><span class="lab">${mol?'Centraal atoom: grootte':'Grootte'}</span>${seg(`kinds.${i}.size`,Object.keys(SIZES).map(s=>[s,s]),k.size)}</div>
      <div class="row"><span class="lab">${mol?'Centraal atoom: kleur':'Kleur'}</span><div class="swatches">${SHADES.map((s,j)=>swatch(`kinds.${i}.shade`,j,k.shade)).join('')}</div></div>
      ${mol?`<div class="row"><span class="lab">Buitenste atomen: grootte</span>${seg(`kinds.${i}.oSize`,Object.keys(SIZES).map(s=>[s,s]),k.oSize)}</div>
      <div class="row"><span class="lab">Buitenste atomen: kleur</span><div class="swatches">${SHADES.map((s,j)=>swatch(`kinds.${i}.oShade`,j,k.oShade)).join('')}</div></div>`:''}
      <div class="row"><label for="kc${i}">Lading (in het deeltje)</label><select id="kc${i}" data-k="kinds.${i}.charge">${CHARGES.map(([v,l])=>`<option value="${v}" ${k.charge===v?'selected':''}>${l}</option>`).join('')}</select></div>
    </div>`;
  });
  if(st.kinds.length<4)h+=`<button class="btn" data-act="add">+ Soort toevoegen</button>`;
  h+=`</div>`;
  h+=`<div class="sec"><h3>${nb===2?'Bakken':'Bak'}</h3>`;
  if(nb===2)h+=`<div class="tabs"><button class="btn" data-act="tab" data-i="0" aria-pressed="${ui.tab===0}">Bak 1 (voor)</button><button class="btn" data-act="tab" data-i="1" aria-pressed="${ui.tab===1}">Bak 2 (na)</button></div>`;
  const bp=`boxes.${ui.tab}`;
  h+=`<div class="row"><span class="lab">Indeling</span>${seg(bp+'.layout',[['box','Los in de bak'],['lattice','Rooster']],box.layout)}</div>`;
  if(box.layout==='box'){
    h+=`<div class="row"><span class="lab">Fase</span>${seg(bp+'.state',[['gas','Gas'],['liquid','Vloeistof'],['solid','Vaste stof']],box.state)}</div>
      <div class="counts">${st.kinds.map((k,i)=>`<div class="row"><label for="c${i}">Aantal ${esc(k.name.replace(/[_^{}]/g,''))||'ABCD'[i]}</label><input type="number" id="c${i}" min="0" max="60" data-k="${bp}.counts.${i}" data-num value="${box.counts[i]||0}"></div>`).join('')}</div>`;
  }else{
    h+=`<div class="row"><label for="pat">Patroon</label><select id="pat" data-k="${bp}.pattern" data-rebuild>
      ${[['one','Eén soort (metaal)'],['alt','Afwisselend A en B (ionrooster)'],['subst','Substitutielegering (B vervangt A)'],['inter','Interstitiële legering (B in de gaten)']].map(([v,l])=>`<option value="${v}" ${box.pattern===v?'selected':''}>${l}</option>`).join('')}</select></div>
      <div class="two"><div class="row"><label for="rows">Rijen</label><input type="number" id="rows" min="1" max="12" data-k="${bp}.rows" data-num value="${box.rows}"></div>
      <div class="row"><label for="cols">Kolommen</label><input type="number" id="cols" min="1" max="12" data-k="${bp}.cols" data-num value="${box.cols}"></div></div>
      <div class="row"><span class="lab">Afstand</span>${seg(bp+'.spacing',[['touch','Tegen elkaar'],['loose','Los']],box.spacing)}</div>
      ${(box.pattern==='subst'||box.pattern==='inter')?`<div class="row"><label for="nb">Aantal deeltjes B</label><input type="number" id="nb" min="0" max="144" data-k="${bp}.counts.1" data-num value="${box.counts[1]||0}"></div>`:''}
      <p class="hint" style="margin:0">Het rooster gebruikt soort A en B. Moleculen worden hier als losse bol getekend.</p>`;
  }
  h+=`<div class="row"><label for="cap">Onderschrift (bijv. A, B, C of D)</label><input type="text" id="cap" data-k="${bp}.caption" value="${esc(box.caption)}"></div>
    <button class="btn" data-act="shuffle">Schudden</button></div>`;
  return h;
}

function renderFig(){
  document.getElementById('paper').innerHTML=buildSVG();
  document.getElementById('warns').innerHTML=lastWarn.map(w=>`<div class="warn">${esc(w)}</div>`).join('');
  save();
}
function renderPanel(){document.getElementById('panel').innerHTML=panelHTML()}
function syncBoxes(){while(st.boxes.length<2)st.boxes.push(B({counts:st.kinds.map(()=>0),seed:9}));
  st.boxes.forEach(b=>{while(b.counts.length<st.kinds.length)b.counts.push(0)})}

function mountDeeltjes(){
  syncBoxes();
  curBuild=()=>buildSVG();
  document.getElementById('main').innerHTML=appHTML();
  bindActions();
  renderPanel();renderFig();
  const panel=document.getElementById('panel');
  panel.addEventListener('input',e=>{const el=e.target;if(!el.dataset.k||el.tagName==='SELECT')return;
    let v=el.value;if('num' in el.dataset){v=Math.max(+el.min||0,Math.min(+el.max||999,parseInt(v)||0))}
    setP(el.dataset.k,v);renderFig()});
  panel.addEventListener('change',e=>{const el=e.target;if(el.tagName!=='SELECT'||!el.dataset.k)return;
    setP(el.dataset.k,el.value);if('rebuild' in el.dataset)renderPanel();renderFig()});
  panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.set){let v=b.dataset.val;if('num' in b.dataset)v=+v;setP(b.dataset.set,v);syncBoxes();renderPanel();renderFig();return}
    const a=b.dataset.act;
    if(a==='add'){st.kinds.push(K('X','atom','M',[1,3,0,2][st.kinds.length%4]));st.boxes.forEach(bx=>bx.counts.push(ui.tab===0?5:0));}
    if(a==='del'){const i=+b.dataset.i;st.kinds.splice(i,1);st.boxes.forEach(bx=>bx.counts.splice(i,1))}
    if(a==='tab')ui.tab=+b.dataset.i;
    if(a==='shuffle')st.boxes[ui.tab].seed=(st.boxes[ui.tab].seed||1)+1;
    if(a==='load'){ui.example=document.getElementById('ex').value;st=clone(EXAMPLES[ui.example].st);ui.tab=0;syncBoxes()}
    renderPanel();renderFig()});
}

GEN.deeltjes=mountDeeltjes;
