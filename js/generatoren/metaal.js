/* ---------- Metaalrooster (elektronenzee) ---------- */
const MT0={ionName:'metaalion',eName:'vrij elektron (valentie-elektron)',charge:'2+',shade:1,rows:5,cols:7,spacing:'loose',
  eMode:'auto',eCount:30,eStyle:'minus',sea:'off',shift:'0',forceLabel:'kracht',title:'',border:'single',keyMode:'both',note:'',caption:'',seed:1};
let mt;try{mt=JSON.parse(localStorage.getItem('sf.metaal')||'null')}catch(e){}
mt=Object.assign(clone(MT0),mt||{});
const MT_PRESETS={na:['Natrium (1+)',{charge:'+',eMode:'auto',shift:'0',ionName:'Na^+'}],mg:['Magnesium (2+)',{charge:'2+',eMode:'auto',shift:'0',ionName:'Mg^{2+}'}],
  al:['Aluminium (3+)',{charge:'3+',eMode:'auto',shift:'0',ionName:'Al^{3+}'}],vervorm:['Vervormen (laag verschoven)',{shift:'1',sea:'on',forceLabel:'kracht'}]};
function drawElectron(x,y,re,style){
  if(style==='dot')return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(re)}" fill="#000"/>`;
  if(style==='e')return fmt('e^-',x,y+re*.75,r1(re*2.1),'middle','font-style="italic"');
  return `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(re)}" fill="#fff" stroke="#000" stroke-width="1"/><line x1="${r1(x-re*.55)}" y1="${r1(y)}" x2="${r1(x+re*.55)}" y2="${r1(y)}" stroke="#000" stroke-width="${r1(Math.max(1,re*.28))}"/>`;
}
function drawIon(x,y,r,shade,charge){
  let s=`<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fillOf(shade)}" stroke="#000" stroke-width="1.2"/>`;
  if(charge){const fs=Math.max(7,r*(charge.length>1?.8:1.1));s+=`<text x="${r1(x)}" y="${r1(y+fs*.35)}" font-size="${r1(fs)}" font-weight="700" text-anchor="middle" fill="${darkOf(shade)?'#fff':'#000'}">${esc(charge)}</text>`}
  return s;
}
const eRad=(style,cell)=>style==='dot'?Math.min(3.5,Math.max(2,cell*.06)):style==='e'?Math.min(8,Math.max(4,cell*.12)):Math.min(7,Math.max(3.5,cell*.11));
function buildMetalSVG(){
  const M=14,F='Arial, Helvetica, sans-serif';const showBox=mt.keyMode!=='key',showKey=mt.keyMode!=='box';
  let body='',top=M,right=M,bottom=M;lastWarn=[];
  if(mt.title){body+=fmt(mt.title,M,top+16,17,'start','font-weight="700"');top+=30}
  const shift=+mt.shift||0;if(showBox&&shift>0)top+=30;
  const rows=Math.max(1,Math.min(12,+mt.rows||1)),cols=Math.max(1,Math.min(12,+mt.cols||1));
  const W=BW-2*PAD,H=BH-2*PAD;const cell=Math.min(W/(cols+shift),H/rows);
  const rI=mt.spacing==='touch'?cell/2:cell*.33;const re=eRad(mt.eStyle,cell);
  if(showBox){
    const x0=PAD+(W-(cols+shift)*cell)/2,y0=PAD+(H-rows*cell)/2;const ions=[];
    const topRows=Math.floor(rows/2);
    for(let i=0;i<rows;i++)for(let j=0;j<cols;j++)ions.push({x:x0+cell*(j+.5)+(i<topRows?shift*cell:0),y:y0+cell*(i+.5)});
    const q=parseInt(mt.charge)||1;let n=mt.eMode==='auto'?ions.length*q:Math.max(0,Math.min(300,+mt.eCount||0));n=Math.min(n,300);
    const r=rng(mt.seed*104729+7);const els=[];
    for(let k=0;k<n;k++){for(let t=0;t<400;t++){const x=re+3+r()*(BW-2*re-6),y=re+3+r()*(BH-2*re-6);
      if(ions.every(p=>Math.hypot(p.x-x,p.y-y)>rI+re+1.5)&&els.every(p=>Math.hypot(p.x-x,p.y-y)>2*re+1.5)){els.push({x,y});break}}}
    if(els.length<n)lastWarn.push(`Er passen maar ${els.length} van de ${n} elektronen. Kies "Los", minder ionen of een kleinere lading.`);
    let x=M;body+=`<g transform="translate(${x},${top})">`;
    body+=`<rect x="0" y="0" width="${BW}" height="${BH}" fill="${mt.sea==='on'?'#e4e4e4':'#fff'}" ${mt.border==='none'?'':'stroke="#000" stroke-width="1.6"'}/>`;
    if(mt.border==='double')body+=`<rect x="-3" y="-3" width="${BW+6}" height="${BH+6}" fill="none" stroke="#000" stroke-width="1.3"/>`;
    ions.forEach(p=>body+=drawIon(p.x,p.y,rI,mt.shade,mt.charge));
    els.forEach(p=>body+=drawElectron(p.x,p.y,re,mt.eStyle));
    if(shift>0){const ay=-16;body+=`<line x1="${BW/2-50}" y1="${ay}" x2="${BW/2+38}" y2="${ay}" stroke="#000" stroke-width="2"/><polygon points="${BW/2+50},${ay} ${BW/2+37},${ay-7} ${BW/2+37},${ay+7}" fill="#000"/>`;
      if(mt.forceLabel)body+=fmt(mt.forceLabel,BW/2+58,ay+5,14,'start')}
    body+=`</g>`;
    if(mt.caption)body+=fmt(mt.caption,x+BW/2,top+BH+22,15,'middle');
    right=x+BW;bottom=top+BH+(mt.caption?30:0);
  }
  if(showKey){
    const kx=showBox?right+28:M;let ky=top+(showBox?4:0),kw=0;
    body+=drawIon(kx+20,ky+16,16,mt.shade,mt.charge);body+=fmt(mt.ionName||'metaalion',kx+48,ky+21,15);kw=48+textW(mt.ionName||'metaalion',15);ky+=42;
    const reK=mt.eStyle==='dot'?3.5:mt.eStyle==='e'?7:6.5;
    body+=drawElectron(kx+20,ky+10,reK,mt.eStyle);body+=fmt(mt.eName||'elektron',kx+48,ky+15,15);kw=Math.max(kw,48+textW(mt.eName||'elektron',15));ky+=30;
    if(mt.note){const words=mt.note.split(/\s+/);let line='',lines=[];
      words.forEach(w=>{const t=line?line+' '+w:w;if(textW(t,13)>230&&line){lines.push(line);line=w}else line=t});if(line)lines.push(line);
      ky+=4;lines.forEach(l=>{body+=fmt(l,kx,ky+12,13,'start','font-style="italic"');kw=Math.max(kw,textW(l,13));ky+=17})}
    right=Math.max(right,kx+kw);bottom=Math.max(bottom,ky);
  }
  const Wt=Math.ceil(right+M),Ht=Math.ceil(bottom+M);
  const defs=`<defs><pattern id="pf-dots" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="5" fill="#fff"/><circle cx="2.5" cy="2.5" r="1.1" fill="#000"/></pattern><pattern id="pf-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="#000" stroke-width="1.4"/></pattern></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Wt}" height="${Ht}" viewBox="0 0 ${Wt} ${Ht}" font-family="${F}" fill="#000"><rect width="${Wt}" height="${Ht}" fill="#fff"/>${defs}${body}</svg>`;
}
function metalPanelHTML(){
  const q=parseInt(mt.charge)||1,nIons=(+mt.rows||1)*(+mt.cols||1);
  return `<div class="sec"><h3>Snel instellen</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${Object.entries(MT_PRESETS).map(([k,[l]])=>`<button class="btn small" data-act="preset" data-p="${k}">${l}</button>`).join('')}</div></div>
  <div class="sec"><h3>Figuur</h3>
    <div class="row"><span class="lab">Tonen</span>${seg('mt.keyMode',[['both','Bak en legenda'],['box','Alleen bak'],['key','Alleen legenda']],mt.keyMode)}</div>
    <div class="row"><span class="lab">Rand</span>${seg('mt.border',[['single','Enkel'],['double','Dubbel'],['none','Geen']],mt.border)}</div>
    <div class="row"><label for="mtitle">Titel (leeg = geen)</label><input type="text" id="mtitle" data-k="mt.title" value="${esc(mt.title)}"></div>
    <div class="row"><label for="mnote">Notitie onder legenda</label><input type="text" id="mnote" data-k="mt.note" value="${esc(mt.note)}"></div>
  </div>
  <div class="sec"><h3>Metaalionen</h3>
    <div class="row"><span class="lab">Lading</span>${seg('mt.charge',[['+','+'],['2+','2+'],['3+','3+'],['','geen']],mt.charge)}</div>
    <div class="row"><span class="lab">Kleur</span><div class="swatches">${SHADES.map((s,j)=>swatch('mt.shade',j,mt.shade)).join('')}</div></div>
    <div class="two"><div class="row"><label for="mrows">Rijen</label><input type="number" id="mrows" min="1" max="12" data-k="mt.rows" data-num value="${mt.rows}"></div>
    <div class="row"><label for="mcols">Kolommen</label><input type="number" id="mcols" min="1" max="12" data-k="mt.cols" data-num value="${mt.cols}"></div></div>
    <div class="row"><span class="lab">Afstand</span>${seg('mt.spacing',[['loose','Los (ruimte voor elektronen)'],['touch','Tegen elkaar']],mt.spacing)}</div>
    <div class="row"><span class="lab">Bovenste lagen verschuiven</span>${seg('mt.shift',[['0','Nee'],['0.5','Halve plek'],['1','Hele plek']],mt.shift)}<span class="hint">Voor vervormbaarheid: de lagen schuiven langs elkaar en de elektronen blijven ertussen.</span></div>
    ${+mt.shift>0?`<div class="row"><label for="mforce">Tekst bij de pijl</label><input type="text" id="mforce" data-k="mt.forceLabel" value="${esc(mt.forceLabel)}"></div>`:''}
    <div class="row"><label for="mion">Naam in legenda</label><input type="text" id="mion" data-k="mt.ionName" value="${esc(mt.ionName)}" placeholder="bijv. Mg^{2+}"></div>
  </div>
  <div class="sec"><h3>Valentie-elektronen</h3>
    <div class="row"><span class="lab">Aantal</span>${seg('mt.eMode',[['auto',`Automatisch (${nIons} × ${q} = ${nIons*q})`],['manual','Zelf kiezen']],mt.eMode)}</div>
    ${mt.eMode==='manual'?`<div class="row"><label for="mecount">Aantal elektronen</label><input type="number" id="mecount" min="0" max="300" data-k="mt.eCount" data-num value="${mt.eCount}"></div>`:''}
    <div class="row"><span class="lab">Weergave</span>${seg('mt.eStyle',[['minus','⊖ cirkel'],['dot','• stip'],['e','e⁻']],mt.eStyle)}</div>
    <div class="row"><span class="lab">Elektronenzee als grijze achtergrond</span>${seg('mt.sea',[['off','Uit'],['on','Aan']],mt.sea)}</div>
    <div class="row"><label for="mename">Naam in legenda</label><input type="text" id="mename" data-k="mt.eName" value="${esc(mt.eName)}"></div>
    <div class="row"><label for="mcap">Onderschrift</label><input type="text" id="mcap" data-k="mt.caption" value="${esc(mt.caption)}"></div>
    <button class="btn" data-act="mshuffle">Elektronen schudden</button>
  </div>`;
}
function renderMetal(){document.getElementById('paper').innerHTML=buildMetalSVG();
  document.getElementById('warns').innerHTML=lastWarn.map(w=>`<div class="warn">${esc(w)}</div>`).join('');
  try{localStorage.setItem('sf.metaal',JSON.stringify(mt))}catch(e){}}
function mountMetaal(){
  curBuild=()=>buildMetalSVG();
  document.getElementById('main').innerHTML=appHTML();bindActions();
  const panel=document.getElementById('panel');const rp=()=>{panel.innerHTML=metalPanelHTML()};rp();renderMetal();
  panel.addEventListener('input',e=>{const el=e.target;if(!el.dataset.k)return;let v=el.value;
    if('num' in el.dataset)v=Math.max(+el.min||0,Math.min(+el.max||999,parseInt(v)||0));setP(el.dataset.k,v);renderMetal();
    if(el.id==='mrows'||el.id==='mcols'){const s=panel.querySelector('[data-set="mt.eMode"][data-val="auto"]');const q=parseInt(mt.charge)||1,n=(+mt.rows||1)*(+mt.cols||1);if(s)s.textContent=`Automatisch (${n} × ${q} = ${n*q})`}});
  panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.set){let v=b.dataset.val;if('num' in b.dataset)v=+v;setP(b.dataset.set,v)}
    else if(b.dataset.act==='mshuffle')mt.seed++;
    else if(b.dataset.act==='preset')Object.assign(mt,MT_PRESETS[b.dataset.p][1]);
    else return;
    rp();renderMetal()});
}

GEN.metaal=mountMetaal;
