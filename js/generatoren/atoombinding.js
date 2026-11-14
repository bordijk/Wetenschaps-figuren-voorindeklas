/* ---------- Atoombinding (dot-and-cross) ---------- */
// atomen: eerste is het startatoom; binding: [ouder, kind, orde, richting R/L/U/D]
const ATBMOLS={
 h2:['H₂','waterstof',['H','H'],[[0,1,1,'R']]],
 f2:['F₂','fluor',['F','F'],[[0,1,1,'R']]],
 cl2:['Cl₂','chloor',['Cl','Cl'],[[0,1,1,'R']]],
 hf:['HF','waterstoffluoride',['F','H'],[[0,1,1,'L']]],
 hcl:['HCl','waterstofchloride',['Cl','H'],[[0,1,1,'L']]],
 o2:['O₂','zuurstof',['O','O'],[[0,1,2,'R']]],
 n2:['N₂','stikstof',['N','N'],[[0,1,3,'R']]],
 h2o:['H₂O','water',['O','H','H'],[[0,1,1,'L'],[0,2,1,'R']]],
 h2s:['H₂S','waterstofsulfide',['S','H','H'],[[0,1,1,'L'],[0,2,1,'R']]],
 nh3:['NH₃','ammoniak',['N','H','H','H'],[[0,1,1,'L'],[0,2,1,'R'],[0,3,1,'D']]],
 ch4:['CH₄','methaan',['C','H','H','H','H'],[[0,1,1,'L'],[0,2,1,'R'],[0,3,1,'U'],[0,4,1,'D']]],
 co2:['CO₂','koolstofdioxide',['C','O','O'],[[0,1,2,'L'],[0,2,2,'R']]],
 hcn:['HCN','waterstofcyanide',['C','H','N'],[[0,1,1,'L'],[0,2,3,'R']]],
 c2h6:['C₂H₆','ethaan',['C','C','H','H','H','H','H','H'],[[0,1,1,'R'],[0,2,1,'L'],[0,3,1,'U'],[0,4,1,'D'],[1,5,1,'R'],[1,6,1,'U'],[1,7,1,'D']]],
 c2h4:['C₂H₄','etheen',['C','C','H','H','H','H'],[[0,1,2,'R'],[0,2,1,'U'],[0,3,1,'D'],[1,4,1,'U'],[1,5,1,'D']]],
 ch3oh:['CH₃OH','methanol',['C','O','H','H','H','H'],[[0,1,1,'R'],[1,2,1,'R'],[0,3,1,'L'],[0,4,1,'U'],[0,5,1,'D']]],
};
const DIRA={R:0,D:90,L:180,U:270};
const AB0={id:'h2o',shells:'outer',styleMode:'element',swap:'off',highlight:'ring',labelText:'gedeeld elektronenpaar',legend:'on',mode:'one',label:'formula',title:'',caption:''};
let ab;try{ab=JSON.parse(localStorage.getItem('sf.atoombinding')||'null')}catch(e){}ab=Object.assign(clone(AB0),ab||{});
const zOf=sym=>EL.findIndex(e=>e&&e[0]===sym);
const shR=k=>30+18*k;
function atomInfo(sym){const sh=shellsFor(zOf(sym),0);return{sh,v:sh[sh.length-1],R:shR(sh.length-1)}}
function styleMap(els){const base=['dot','cross','open','grey'];let order=[...els];if(ab.swap==='on'&&order.length>1)[order[0],order[1]]=[order[1],order[0]];
  const m={};order.forEach((e,i)=>m[e]=ab.styleMode==='same'?'dot':base[i%4]);return{m,order}}
const angDist=(a,b)=>Math.abs(((a-b)%360+540)%360-180);
function freeCard(occ,n){const res=[];for(let k=0;k<n;k++){let best=null,bs=-1;for(const c of [0,90,180,270]){if(res.includes(c))continue;const all=[...occ,...res];const sc=all.length?Math.min(...all.map(o=>angDist(c,o))):180;if(sc>bs){bs=sc;best=c}}if(best===null)break;res.push(best)}return res}
function shellsAndNucleus(sym,x,y,R,info,st){
  let s='',e='';const n=info.sh.length;
  for(let k=0;k<n;k++){if(ab.shells==='outer'&&k<n-1)continue;s+=`<circle cx="${r1(x)}" cy="${r1(y)}" r="${shR(k)}" fill="none" stroke="#000" stroke-width="1.2"/>`}
  if(ab.shells==='all')for(let k=0;k<n-1;k++){const c=info.sh[k];for(let i=0;i<c;i++){const t=(-90+i*360/c)*Math.PI/180;e+=drawE(x+shR(k)*Math.cos(t),y+shR(k)*Math.sin(t),st)}}
  s+=`<circle cx="${r1(x)}" cy="${r1(y)}" r="11.5" fill="#fff" stroke="#000" stroke-width="1.2"/><text x="${r1(x)}" y="${r1(y+5)}" font-size="${sym.length>1?11:13}" font-weight="700" text-anchor="middle">${sym}</text>`;
  return{s,e};
}
function pairAt(x,y,R,ang,st,n){let e='';if(n===2){[-1,1].forEach(sg=>{const t=(ang+sg*10*48/R)*Math.PI/180;e+=drawE(x+R*Math.cos(t),y+R*Math.sin(t),st)})}else{const t=ang*Math.PI/180;e+=drawE(x+R*Math.cos(t),y+R*Math.sin(t),st)}return e}
function drawFreeAtom(sym,x,y,st){const info=atomInfo(sym);const sn=shellsAndNucleus(sym,x,y,info.R,info,st);let e=sn.e;
  const sites=[-90,0,90,180],cnt=[0,0,0,0];if(sym==='He')cnt[0]=2;else for(let i=0;i<info.v;i++)cnt[i%4]++;
  sites.forEach((a,i)=>{if(cnt[i])e+=pairAt(x,y,info.R,a,st,cnt[i])});return sn.s+e}
function layoutMol(id){const m=ATBMOLS[id];const atoms=m[2].map(el=>({el,...atomInfo(el),x:0,y:0,bonds:[]}));
  m[3].forEach(([p,c,o,d])=>{const A=atoms[p],B=atoms[c];const ov=.55*Math.min(A.R,B.R);const dist=A.R+B.R-ov;const t=DIRA[d]*Math.PI/180;
    B.x=A.x+dist*Math.cos(t);B.y=A.y+dist*Math.sin(t);A.bonds.push(DIRA[d]);B.bonds.push((DIRA[d]+180)%360)});
  return{m,atoms,bonds:m[3]}}
function drawMolecule(id,ox,oy,sm){
  const {atoms,bonds}=layoutMol(id);let s='',e='',hl='';const lens=[];
  atoms.forEach(a=>{const sn=shellsAndNucleus(a.el,a.x+ox,a.y+oy,a.R,a,sm[a.el]);s+=sn.s;e+=sn.e});
  atoms.forEach(a=>{const used=bonds.reduce((t,[p,c,o])=>t+((atoms[p]===a||atoms[c]===a)?o:0),0);const rem=Math.max(0,a.v-used);
    const np=Math.floor(rem/2),ns=rem%2;const dirs=freeCard(a.bonds,np+ns);dirs.forEach((d,i)=>{e+=pairAt(a.x+ox,a.y+oy,a.R,d,sm[a.el],i<np?2:1)})});
  bonds.forEach(([p,c,o,d])=>{const A=atoms[p],B=atoms[c];const ov=.55*Math.min(A.R,B.R);const t=DIRA[d]*Math.PI/180;const ux=Math.cos(t),uy=Math.sin(t),nx=-uy,ny=ux;
    const along=A.R-ov/2;const mx=A.x+ox+ux*along,my=A.y+oy+uy*along;
    if(o===1){e+=drawE(mx-nx*6,my-ny*6,sm[A.el])+drawE(mx+nx*6,my+ny*6,sm[B.el])}
    else for(let k=0;k<o;k++){const off=(k-(o-1)/2)*12;const px=mx+nx*off,py=my+ny*off;
      e+=drawE(px-ux*5.5,py-uy*5.5,sm[A.el])+drawE(px+ux*5.5,py+uy*5.5,sm[B.el])}
    lens.push({x:mx,y:my,ang:DIRA[d],o});
    if(ab.highlight!=='none')hl+=`<ellipse cx="${r1(mx)}" cy="${r1(my)}" rx="${o===1?9:13}" ry="${r1(o===1?13:10+(o-1)*6)}" transform="rotate(${DIRA[d]} ${r1(mx)} ${r1(my)})" fill="none" stroke="#000" stroke-width="1.1" stroke-dasharray="3 2.5"/>`});
  const x0=Math.min(...atoms.map(a=>a.x-a.R))+ox,x1=Math.max(...atoms.map(a=>a.x+a.R))+ox,y0=Math.min(...atoms.map(a=>a.y-a.R))+oy,y1=Math.max(...atoms.map(a=>a.y+a.R))+oy;
  return{svg:s+hl+e,x0,x1,y0,y1,lens};
}
function buildATB(){
  lastWarn=[];const M=18;const m=ATBMOLS[ab.id];const els=[...new Set(m[2])];const {m:sm,order}=styleMap(els);
  let body='',top=M;if(ab.title){body+=fmt(ab.title,M,top+16,17,'start','font-weight="700"');top+=32}
  const pre=drawMolecule(ab.id,0,0,sm);const mh=pre.y1-pre.y0;let x=M,H=mh;
  let free=[];if(ab.mode==='two'){free=m[2].map(el=>atomInfo(el));H=Math.max(H,...free.map(f=>2*f.R))}
  const cy=top+H/2+6;
  if(ab.mode==='two'){m[2].forEach((el,i)=>{const R=free[i].R;body+=drawFreeAtom(el,x+R,cy,sm[el]);x+=2*R;
      if(i<m[2].length-1){body+=`<text x="${x+16}" y="${cy+8}" font-size="24" text-anchor="middle">+</text>`;x+=32}});
    body+=`<line x1="${x+16}" y1="${cy}" x2="${x+70}" y2="${cy}" stroke="#000" stroke-width="2"/><polygon points="${x+82},${cy} ${x+69},${cy-7} ${x+69},${cy+7}" fill="#000"/>`;x+=98}
  const D=drawMolecule(ab.id,x-pre.x0,cy-(pre.y0+pre.y1)/2,sm);body+=D.svg;
  let right=D.x1,bottom=top+H+12;const mcx=(D.x0+D.x1)/2;
  if(ab.highlight==='label'&&D.lens.length){const L0=D.lens[0];const ty=bottom+22;const tx=mcx;
    body+=`<line x1="${r1(L0.x)}" y1="${r1(L0.y+12+(L0.o-1)*6)}" x2="${r1(tx)}" y2="${ty-14}" stroke="#000" stroke-width="1"/>`+fmt(ab.labelText,tx,ty,14,'middle');bottom=ty+8;
    right=Math.max(right,tx+textW(ab.labelText,14)/2)}
  if(ab.label!=='none'){const t=ab.label==='formula'?m[0]:m[1];bottom+=24;body+=`<text x="${r1(mcx)}" y="${bottom}" font-size="16" text-anchor="middle" font-weight="700">${esc(t)}</text>`}
  if(ab.caption){bottom+=24;body+=fmt(ab.caption,mcx,bottom,15,'middle')}
  if(ab.legend==='on'&&ab.styleMode==='element'&&order.length>1){bottom+=26;let lx=M;order.forEach(el=>{body+=drawE(lx+5,bottom-5,sm[el])+`<text x="${lx+16}" y="${bottom}" font-size="13">elektron van ${el}</text>`;lx+=36+textW('elektron van '+el,13)});right=Math.max(right,lx)}
  return svgWrap(right+M,bottom+M,body);
}
function atbPanel(){
  const els=[...new Set(ATBMOLS[ab.id][2])];
  return `<div class="sec"><h3>Molecuul</h3>
    <div class="row"><label for="abid">Kies</label><select id="abid" data-k="id" data-rebuild>${Object.entries(ATBMOLS).map(([k,v])=>`<option value="${k}" ${ab.id===k?'selected':''}>${v[0]} · ${v[1]}</option>`).join('')}</select></div>
    <div class="row"><span class="lab">Tonen</span>${seg('mode',[['one','Alleen molecuul'],['two','Losse atomen → molecuul']],ab.mode)}</div>
  </div>
  <div class="sec"><h3>Elektronen</h3>
    <div class="row"><span class="lab">Per atoomsoort</span>${seg('styleMode',[['element','Verschillend (● × ○)'],['same','Allemaal ●']],ab.styleMode)}</div>
    ${ab.styleMode==='element'&&els.length>1?`<div class="row"><span class="lab">Stip bij</span>${seg('swap',[['off',els[0]],['on',els[1]]],ab.swap)}</div>`:''}
    <div class="row"><span class="lab">Schillen</span>${seg('shells',[['outer','Alleen buitenste'],['all','Alle schillen']],ab.shells)}</div>
    <div class="row"><span class="lab">Gedeeld elektronenpaar</span>${seg('highlight',[['none','Niet markeren'],['ring','Omcirkelen'],['label','Omcirkelen + tekst']],ab.highlight)}</div>
    ${ab.highlight==='label'?`<div class="row"><label for="ablt">Tekst</label><input type="text" id="ablt" data-k="labelText" value="${esc(ab.labelText)}"></div>`:''}
    <div class="row"><span class="lab">Legenda</span>${seg('legend',[['on','Aan'],['off','Uit']],ab.legend)}</div>
  </div>
  <div class="sec"><h3>Tekst</h3>
    <div class="row"><span class="lab">Onder het molecuul</span>${seg('label',[['formula','Formule'],['name','Naam'],['none','Niets']],ab.label)}</div>
    <div class="row"><label for="abtit">Titel (leeg = geen)</label><input type="text" id="abtit" data-k="title" value="${esc(ab.title)}"></div>
    <div class="row"><label for="abcap">Onderschrift</label><input type="text" id="abcap" data-k="caption" value="${esc(ab.caption)}"></div>
  </div>`;
}
const ATB={key:'sf.atoombinding',st:()=>ab,build:buildATB,panel:atbPanel,onChange:k=>{if(k==='id')ab.swap='off'},act:()=>{}};

GEN.atoombinding=()=>mountGen(ATB);
