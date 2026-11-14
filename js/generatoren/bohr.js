/* ---------- Bohr-model ---------- */
const BH0={z:11,a:23,q:0,mode:'one',q2:1,arrow:'',nucleus:'pn',eStyle:'dot',layout:'even',valence:'off',vShell:'normal',vLegend:'off',shellLabels:'off',config:'on',label:'symbol',title:'',caption:'',caption2:'',border:'none'};
let bh;try{bh=JSON.parse(localStorage.getItem('sf.bohr')||'null')}catch(e){}bh=Object.assign(clone(BH0),bh||{});if(bh.valence==='on')bh.valence='open';
const BH_PRESETS={na:['Na → Na⁺',{z:11,a:23,q:0,mode:'two',q2:1,arrow:'e⁻ afstaan'}],val:['Valentie-elektronen',{valence:'grey',vShell:'thick',vLegend:'on'}],cl:['Cl → Cl⁻',{z:17,a:35,q:0,mode:'two',q2:-1,arrow:'e⁻ opnemen'}],
  c:['Koolstof',{z:6,a:12,q:0,mode:'one'}],mg:['Mg²⁺-ion',{z:12,a:24,q:2,mode:'one'}],o:['Zuurstof met kerndeeltjes',{z:8,a:16,q:0,mode:'one',nucleus:'particles'}]};
function vStyle(){return bh.valence===bh.eStyle?(bh.eStyle==='dot'?'open':'dot'):bh.valence}
function bohrAtom(q,cx,cy){
  const z=+bh.z,A=Math.max(z,+bh.a||z);const sh=shellsFor(z,q);const nE=sh.length;
  let rN=bh.nucleus==='particles'?4.6*Math.sqrt(A)*1.08+3:bh.nucleus==='pn'?31:24;
  const gap=nE>3?24:28;const R=k=>rN+24+k*gap;let s='';
  sh.forEach((_,k)=>{const o=k===nE-1&&bh.valence!=='off';const sw=o&&bh.vShell==='thick'?2.8:1.2;const da=o&&bh.vShell==='dashed'?' stroke-dasharray="6 4"':'';s+=`<circle cx="${cx}" cy="${cy}" r="${r1(R(k))}" fill="none" stroke="#000" stroke-width="${sw}"${da}/>`});
  s+=`<circle cx="${cx}" cy="${cy}" r="${r1(rN)}" fill="#fff" stroke="#000" stroke-width="1.5"/>`;
  const sym=EL[z][0];
  if(bh.nucleus==='symbol')s+=`<text x="${cx}" y="${cy+7}" font-size="20" font-weight="700" text-anchor="middle">${sym}</text>`;
  if(bh.nucleus==='pn'){s+=fmt(`${z} p^+`,cx,cy-3,13,'middle');s+=fmt(`${A-z} n^0`,cx,cy+14,13,'middle')}
  if(bh.nucleus==='particles'){const r=rng(z*31+A);const kinds=shuffle([...Array(z).fill(1),...Array(A-z).fill(0)],r);
    kinds.forEach((p,i)=>{const rr=4.6*Math.sqrt(i+.5)*1.08,t=i*2.39996;const x=cx+rr*Math.cos(t),y=cy+rr*Math.sin(t);
      s+=`<circle cx="${r1(x)}" cy="${r1(y)}" r="4.3" fill="${p?'#7a7a7a':'#fff'}" stroke="#000" stroke-width=".9"/>`})}
  const labels=['K','L','M','N','O'];
  sh.forEach((n,k)=>{const rad=R(k);const outer=k===nE-1;
    const st=bh.valence!=='off'&&outer?vStyle():bh.eStyle;
    let angs=[];
    if(bh.layout==='pairs'&&n<=8&&n>2){const sites=[-90,0,90,180];const cnt=[0,0,0,0];for(let i=0;i<n;i++)cnt[i%4]++;
      sites.forEach((a,i)=>{if(cnt[i]===1)angs.push(a);if(cnt[i]===2)angs.push(a-9,a+9)})}
    else for(let i=0;i<n;i++)angs.push(-90+i*360/n);
    angs.forEach(a=>{const t=a*Math.PI/180;s+=drawE(cx+rad*Math.cos(t),cy+rad*Math.sin(t),st)});
    if(bh.shellLabels==='on'){const t=-50*Math.PI/180;const lx=cx+rad*Math.cos(t)+7,ly=cy+rad*Math.sin(t)-5;
      s+=`<text x="${r1(lx)}" y="${r1(ly)}" font-size="12" font-weight="700" stroke="#fff" stroke-width="3" paint-order="stroke">${labels[k]}</text>`}
  });
  const Rmax=nE?R(nE-1)+8:rN+6;
  if(q!==0){const h=Rmax+8;s+=`<path d="M${cx-h+8} ${cy-h}H${cx-h}V${cy+h}H${cx-h+8}M${cx+h-8} ${cy-h}H${cx+h}V${cy+h}H${cx+h-8}" fill="none" stroke="#000" stroke-width="1.8"/>`;
    s+=`<text x="${cx+h+4}" y="${cy-h+10}" font-size="17" font-weight="700">${chargeStr(q)}</text>`}
  return {s,R:Rmax+(q!==0?26:0),sh,A};
}
function buildBohr(){
  lastWarn=[];const M=16;const qs=bh.mode==='two'?[+bh.q,+bh.q2]:[+bh.q];
  const z=+bh.z;if(+bh.q>=z||(bh.mode==='two'&&+bh.q2>=z))lastWarn.push('Deze lading kan niet: het deeltje heeft dan geen elektronen meer.');
  const pre=qs.map(q=>bohrAtom(q,0,0));const H=Math.max(...pre.map(p=>p.R));
  let top=M;let body='';if(bh.title){body+=fmt(bh.title,M,top+16,17,'start','font-weight="700"');top+=32}
  const cy=top+H;let x=M;const AG=110;const caps=[bh.caption,bh.caption2];let below=0;
  qs.forEach((q,i)=>{const p=pre[i];const cx=x+p.R;body+=bohrAtom(q,cx,cy).s;
    let ly=cy+H+22;const sym=EL[z][0]+(q?'^{'+chargeStr(q)+'}':'');
    if(bh.label==='symbol'){body+=fmt(sym,cx,ly,16,'middle','font-weight="700"');ly+=22}
    if(bh.label==='name'){const nm=ionName(z,q);body+=fmt(q?nm+' ('+sym+')':nm,cx,ly,15,'middle');ly+=22}
    if(bh.config==='on'){body+=`<text x="${cx}" y="${ly}" font-size="15" text-anchor="middle">${p.sh.join(', ')}</text>`;ly+=22}
    if(caps[i]){body+=fmt(caps[i],cx,ly+2,15,'middle');ly+=24}
    below=Math.max(below,ly-(cy+H));
    x+=2*p.R;
    if(i===0&&qs.length===2){body+=`<line x1="${x+16}" y1="${cy}" x2="${x+AG-26}" y2="${cy}" stroke="#000" stroke-width="2"/><polygon points="${x+AG-14},${cy} ${x+AG-27},${cy-7} ${x+AG-27},${cy+7}" fill="#000"/>`;
      if(bh.arrow)body+=fmt(bh.arrow,x+AG/2,cy-12,14,'middle');x+=AG}
  });
  if(bh.valence!=='off'&&bh.vLegend==='on'){const ly=cy+H+below+14;body+=drawE(M+6,ly,bh.eStyle)+`<text x="${M+18}" y="${ly+5}" font-size="13">elektron</text>`+drawE(M+92,ly,vStyle())+`<text x="${M+104}" y="${ly+5}" font-size="13">valentie-elektron</text>`;below+=24}
  if(bh.nucleus==='particles'){const ly=cy+H+below+14;body+=`<circle cx="${M+6}" cy="${ly}" r="5" fill="#7a7a7a" stroke="#000"/><text x="${M+16}" y="${ly+5}" font-size="13">proton</text><circle cx="${M+80}" cy="${ly}" r="5" fill="#fff" stroke="#000"/><text x="${M+90}" y="${ly+5}" font-size="13">neutron</text>`;below+=24}
  let W=x+M,Ht=cy+H+below+M;
  if(bh.border!=='none'){body=`<rect x="4" y="4" width="${W-8}" height="${Ht-8}" fill="none" stroke="#000" stroke-width="1.5"/>`+(bh.border==='double'?`<rect x="8" y="8" width="${W-16}" height="${Ht-16}" fill="none" stroke="#000" stroke-width="1.2"/>`:'')+body}
  return svgWrap(Math.max(W,120),Ht,body);
}
function bohrPanel(){
  const qseg=(p,cur)=>seg(p,Q_OPTS,cur);
  return `<div class="sec"><h3>Snel instellen</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${Object.entries(BH_PRESETS).map(([k,[l]])=>`<button class="btn small" data-act="preset" data-p="${k}">${l}</button>`).join('')}</div></div>
  <div class="sec"><h3>Deeltje</h3>
    <div class="row"><label for="bz">Element</label><select id="bz" data-k="z" data-num data-rebuild>${elOpts(36,+bh.z)}</select></div>
    <div class="row"><label for="ba">Massagetal</label><input type="number" id="ba" min="1" max="300" data-k="a" data-num value="${bh.a}"><span class="hint">${EL[bh.z][0]}-${bh.a}: ${bh.z} protonen, ${Math.max(0,bh.a-bh.z)} neutronen</span></div>
    <div class="row"><span class="lab">Lading</span>${qseg('q',+bh.q)}</div>
    <div class="row"><span class="lab">Aantal</span>${seg('mode',[['one','Eén deeltje'],['two','Atoom → ion']],bh.mode)}</div>
    ${bh.mode==='two'?`<div class="row"><span class="lab">Lading rechts</span>${qseg('q2',+bh.q2)}</div><div class="row"><label for="barr">Tekst bij de pijl</label><input type="text" id="barr" data-k="arrow" value="${esc(bh.arrow)}" placeholder="bijv. e^- afstaan"></div>`:''}
  </div>
  <div class="sec"><h3>Valentie-elektronen</h3>
    <div class="row"><span class="lab">Anders tekenen</span>${seg('valence',[['off','Nee'],['open','○'],['grey','Grijs'],['color','Rood'],['cross','×'],['big','Groot ●']],bh.valence)}</div>
    ${bh.valence!=='off'?`<div class="row"><span class="lab">Buitenste schil</span>${seg('vShell',[['normal','Normaal'],['thick','Dikker'],['dashed','Gestippeld']],bh.vShell)}</div>
    <div class="row"><span class="lab">Legenda eronder</span>${seg('vLegend',[['off','Uit'],['on','Aan']],bh.vLegend)}</div>`:''}
    <p class="hint" style="margin:0">De elektronen op de buitenste schil krijgen een andere stijl. Kies je dezelfde stijl als de gewone elektronen, dan wisselt hij vanzelf tussen stip en rondje.</p>
  </div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Kern</span>${seg('nucleus',[['pn','p⁺ en n⁰'],['symbol','Symbool'],['particles','Kerndeeltjes'],['empty','Leeg']],bh.nucleus)}</div>
    <div class="row"><span class="lab">Elektronen</span>${seg('eStyle',[['dot','● stip'],['open','○ open'],['cross','× kruis'],['e','e⁻']],bh.eStyle)}</div>
    <div class="row"><span class="lab">Verdeling op de schil</span>${seg('layout',[['even','Gelijkmatig'],['pairs','In paren (4 plekken)']],bh.layout)}</div>
    <div class="row"><span class="lab">Schillen K, L, M, N</span>${seg('shellLabels',[['off','Uit'],['on','Aan']],bh.shellLabels)}</div>
    <div class="row"><span class="lab">Onder het deeltje</span>${seg('label',[['symbol','Symbool'],['name','Naam'],['none','Niets']],bh.label)}</div>
    <div class="row"><span class="lab">Elektronenverdeling (2, 8, 1)</span>${seg('config',[['on','Tonen'],['off','Verbergen']],bh.config)}</div>
    <div class="row"><span class="lab">Rand</span>${seg('border',[['none','Geen'],['single','Enkel'],['double','Dubbel']],bh.border)}</div>
    <div class="row"><label for="btit">Titel (leeg = geen)</label><input type="text" id="btit" data-k="title" value="${esc(bh.title)}"></div>
    <div class="two"><div class="row"><label for="bc1">Onderschrift${bh.mode==='two'?' links':''}</label><input type="text" id="bc1" data-k="caption" value="${esc(bh.caption)}"></div>
    ${bh.mode==='two'?`<div class="row"><label for="bc2">Onderschrift rechts</label><input type="text" id="bc2" data-k="caption2" value="${esc(bh.caption2)}"></div>`:''}</div>
    <p class="hint" style="margin:0">Tip voor een toets: kern "Leeg", onder het deeltje "Niets" en de elektronenverdeling verbergen. Dan moeten leerlingen zelf het element bepalen.</p>
  </div>`;
}
const BOHR={key:'sf.bohr',st:()=>bh,build:buildBohr,panel:bohrPanel,
  onChange:k=>{if(k==='z')bh.a=EL[bh.z][2]},
  act:(a,b)=>{if(a==='preset')Object.assign(bh,BH_PRESETS[b.dataset.p][1])}};

GEN.bohr=()=>mountGen(BOHR);
