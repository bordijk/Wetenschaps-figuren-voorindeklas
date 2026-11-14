/* ---------- Lewisstructuren ---------- */
// atoom: [symbool, x, y, vrije paren, formele lading]; binding: [i, j, orde]; afstand 1 = één bindingslengte
const MOLS={
 'Moleculen':{
  h2:['H₂','waterstof',[['H',0,0,0,0],['H',1,0,0,0]],[[0,1,1]]],
  cl2:['Cl₂','chloor',[['Cl',0,0,3,0],['Cl',1.1,0,3,0]],[[0,1,1]]],
  o2:['O₂','zuurstof',[['O',0,0,2,0],['O',1,0,2,0]],[[0,1,2]]],
  n2:['N₂','stikstof',[['N',0,0,1,0],['N',1,0,1,0]],[[0,1,3]]],
  hcl:['HCl','waterstofchloride',[['H',0,0,0,0],['Cl',1,0,3,0]],[[0,1,1]]],
  hf:['HF','waterstoffluoride',[['H',0,0,0,0],['F',1,0,3,0]],[[0,1,1]]],
  h2o:['H₂O','water',[['O',0,0,2,0],['H',-.85,.6,0,0],['H',.85,.6,0,0]],[[0,1,1],[0,2,1]]],
  h2s:['H₂S','waterstofsulfide',[['S',0,0,2,0],['H',-.85,.6,0,0],['H',.85,.6,0,0]],[[0,1,1],[0,2,1]]],
  nh3:['NH₃','ammoniak',[['N',0,0,1,0],['H',-1,0,0,0],['H',1,0,0,0],['H',0,1,0,0]],[[0,1,1],[0,2,1],[0,3,1]]],
  ch4:['CH₄','methaan',[['C',0,0,0,0],['H',-1,0,0,0],['H',1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]],
  ccl4:['CCl₄','tetrachloormethaan',[['C',0,0,0,0],['Cl',-1.1,0,3,0],['Cl',1.1,0,3,0],['Cl',0,-1.1,3,0],['Cl',0,1.1,3,0]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]],
  co2:['CO₂','koolstofdioxide',[['O',-1,0,2,0],['C',0,0,0,0],['O',1,0,2,0]],[[0,1,2],[1,2,2]]],
  co:['CO','koolstofmonoxide',[['C',0,0,1,-1],['O',1,0,1,1]],[[0,1,3]]],
  hcn:['HCN','waterstofcyanide',[['H',-1,0,0,0],['C',0,0,0,0],['N',1,0,1,0]],[[0,1,1],[1,2,3]]],
  h2o2:['H₂O₂','waterstofperoxide',[['H',-1,0,0,0],['O',0,0,2,0],['O',1,0,2,0],['H',2,0,0,0]],[[0,1,1],[1,2,1],[2,3,1]]],
  o3:['O₃','ozon',[['O',-.87,.5,2,0],['O',0,0,1,1],['O',.87,.5,3,-1]],[[0,1,2],[1,2,1]]],
  so2:['SO₂','zwaveldioxide',[['O',-.87,.5,2,0],['S',0,0,1,1],['O',.87,.5,3,-1]],[[0,1,2],[1,2,1]]],
  bf3:['BF₃','boortrifluoride',[['B',0,0,0,0],['F',0,-1,3,0],['F',-.87,.5,3,0],['F',.87,.5,3,0]],[[0,1,1],[0,2,1],[0,3,1]]],
  pcl3:['PCl₃','fosfortrichloride',[['P',0,0,1,0],['Cl',-1.1,0,3,0],['Cl',1.1,0,3,0],['Cl',0,1.1,3,0]],[[0,1,1],[0,2,1],[0,3,1]]],
 },
 'Koolstofverbindingen':{
  c2h4:['C₂H₄','etheen',[['C',0,0,0,0],['C',1,0,0,0],['H',-.7,-.7,0,0],['H',-.7,.7,0,0],['H',1.7,-.7,0,0],['H',1.7,.7,0,0]],[[0,1,2],[0,2,1],[0,3,1],[1,4,1],[1,5,1]]],
  c2h2:['C₂H₂','ethyn',[['H',-1,0,0,0],['C',0,0,0,0],['C',1,0,0,0],['H',2,0,0,0]],[[0,1,1],[1,2,3],[2,3,1]]],
  c2h6:['C₂H₆','ethaan',[['C',0,0,0,0],['C',1,0,0,0],['H',-1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0],['H',2,0,0,0],['H',1,-1,0,0],['H',1,1,0,0]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1],[1,5,1],[1,6,1],[1,7,1]]],
  ch3oh:['CH₃OH','methanol',[['C',0,0,0,0],['O',1,0,2,0],['H',2,0,0,0],['H',-1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0]],[[0,1,1],[1,2,1],[0,3,1],[0,4,1],[0,5,1]]],
  c2h5oh:['C₂H₅OH','ethanol',[['C',0,0,0,0],['C',1,0,0,0],['O',2,0,2,0],['H',3,0,0,0],['H',-1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0],['H',1,-1,0,0],['H',1,1,0,0]],[[0,1,1],[1,2,1],[2,3,1],[0,4,1],[0,5,1],[0,6,1],[1,7,1],[1,8,1]]],
  ch2o:['CH₂O','methanal',[['C',0,0,0,0],['O',1,0,2,0],['H',-.7,-.7,0,0],['H',-.7,.7,0,0]],[[0,1,2],[0,2,1],[0,3,1]]],
  hcooh:['HCOOH','methaanzuur',[['H',-1,0,0,0],['C',0,0,0,0],['O',0,-1,2,0],['O',1,0,2,0],['H',2,0,0,0]],[[0,1,1],[1,2,2],[1,3,1],[3,4,1]]],
  ch3cooh:['CH₃COOH','ethaanzuur (azijnzuur)',[['C',0,0,0,0],['C',1,0,0,0],['O',1,-1,2,0],['O',2,0,2,0],['H',3,0,0,0],['H',-1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0]],[[0,1,1],[1,2,2],[1,3,1],[3,4,1],[0,5,1],[0,6,1],[0,7,1]]],
  ch3nh2:['CH₃NH₂','methaanamine',[['C',0,0,0,0],['N',1,0,1,0],['H',1.7,-.7,0,0],['H',1.7,.7,0,0],['H',-1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0]],[[0,1,1],[1,2,1],[1,3,1],[0,4,1],[0,5,1],[0,6,1]]],
 },
 'Ionen':{
  oh:['OH⁻','hydroxide-ion',[['O',0,0,3,-1],['H',1,0,0,0]],[[0,1,1]],-1],
  h3o:['H₃O⁺','oxonium-ion',[['O',0,0,1,1],['H',-1,0,0,0],['H',1,0,0,0],['H',0,1,0,0]],[[0,1,1],[0,2,1],[0,3,1]],1],
  nh4:['NH₄⁺','ammonium-ion',[['N',0,0,0,1],['H',-1,0,0,0],['H',1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],1],
  cn:['CN⁻','cyanide-ion',[['C',0,0,1,-1],['N',1,0,1,0]],[[0,1,3]],-1],
  no3:['NO₃⁻','nitraat-ion',[['N',0,0,0,1],['O',0,-1,2,0],['O',-.87,.5,3,-1],['O',.87,.5,3,-1]],[[0,1,2],[0,2,1],[0,3,1]],-1],
  co3:['CO₃²⁻','carbonaat-ion',[['C',0,0,0,0],['O',0,-1,2,0],['O',-.87,.5,3,-1],['O',.87,.5,3,-1]],[[0,1,2],[0,2,1],[0,3,1]],-2],
  so4:['SO₄²⁻','sulfaat-ion',[['S',0,0,0,2],['O',0,-1.1,3,-1],['O',0,1.1,3,-1],['O',-1.1,0,3,-1],['O',1.1,0,3,-1]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]],-2],
  ch3coo:['CH₃COO⁻','acetaat-ion',[['C',0,0,0,0],['C',1,0,0,0],['O',1,-1,2,0],['O',2,0,3,-1],['H',-1,0,0,0],['H',0,-1,0,0],['H',0,1,0,0]],[[0,1,1],[1,2,2],[1,3,1],[0,4,1],[0,5,1],[0,6,1]],-1],
 }
};
const MOLFLAT=Object.assign({},...Object.values(MOLS));
function molFrom(id){const m=MOLFLAT[id];return{id,formula:m[0],name:m[1],charge:m[4]||0,atoms:m[2].map(a=>({el:a[0],x:a[1],y:a[2],lp:a[3],fc:a[4]})),bonds:m[3].map(b=>({a:b[0],b:b[1],o:b[2]}))}}
const LW0={kind:'mol',id:'h2o',mol:null,z:8,q:0,bondStyle:'line',lpStyle:'line',fcStyle:'circle',brackets:'on',label:'none',title:'',caption:'',mistakes:0,mseed:1,answer:'off'};
let lw;try{lw=JSON.parse(localStorage.getItem('sf.lewis')||'null')}catch(e){}lw=Object.assign(clone(LW0),lw||{});
if(!lw.mol)lw.mol=molFrom(lw.id);
function posName(m,i){const a=m.atoms[i];const n=m.atoms.filter(b=>b.el===a.el).length;if(n===1)return `${a.el}-atoom`;
  const cx=m.atoms.reduce((s,b)=>s+b.x,0)/m.atoms.length,cy=m.atoms.reduce((s,b)=>s+b.y,0)/m.atoms.length;
  const v=a.y<cy-.3?'boven':a.y>cy+.3?'onder':'';const h=a.x<cx-.3?'links':a.x>cx+.3?'rechts':'';
  return `${a.el}-atoom ${(h+v)||'in het midden'}`.replace('linksboven','linksboven').trim()}
function applyMistakes(m0){
  const m=clone(m0);const out=[];if(!lw.mistakes)return{m,out};
  const r=rng(lw.mseed*977+m.atoms.length);const cands=[];
  m.atoms.forEach((a,i)=>{const t=['a'+i];
    if(a.el!=='H'&&a.lp>0)cands.push({t,f:()=>{a.lp--;return `Bij het ${posName(m0,i)} ontbreekt een vrij elektronenpaar.`}});
    if(a.el!=='H'&&a.lp<4)cands.push({t,f:()=>{a.lp++;return `Het ${posName(m0,i)} heeft een vrij elektronenpaar te veel.`}});
    if(a.el==='H')cands.push({t,f:()=>{a.lp=1;return `Het ${posName(m0,i)} heeft een vrij elektronenpaar, maar H heeft nooit vrije paren.`}});
    if(a.fc)cands.push({t,f:()=>{const f=a.fc;a.fc=0;return `Bij het ${posName(m0,i)} ontbreekt de formele lading ${chargeStr(f)}.`}});
    if(!a.fc&&a.el!=='H')cands.push({t,f:()=>{a.fc=r()<.5?1:-1;return `Het ${posName(m0,i)} hoort geen formele lading te hebben.`}});
  });
  m.bonds.forEach(b=>{const t=['a'+b.a,'a'+b.b];const A=m.atoms[b.a],B=m.atoms[b.b];
    if(b.o>1)cands.push({t,f:()=>{const o=b.o;b.o--;return `Tussen het ${posName(m0,b.a)} en het ${posName(m0,b.b)} hoort een ${o===2?'dubbele':'drievoudige'} binding.`}});
    if(b.o===1&&A.el!=='H'&&B.el!=='H')cands.push({t,f:()=>{b.o++;return `Tussen het ${posName(m0,b.a)} en het ${posName(m0,b.b)} hoort een enkele binding.`}});
  });
  const used=new Set();
  for(const c of shuffle(cands,r)){if(out.length>=lw.mistakes)break;if(c.t.some(x=>used.has(x)))continue;c.t.forEach(x=>used.add(x));out.push(c.f())}
  return{m,out};
}
let lewisAnswer=[];
function freeDirs(occ,n,prefer){
  const res=[];const cand=[];for(let a=0;a<360;a+=45)cand.push(a);
  const dist=(a,b)=>{const d=Math.abs(((a-b)%360+540)%360-180);return d};
  for(let k=0;k<n;k++){let best=null,bs=-1;
    for(const c of cand){if(res.includes(c))continue;const all=[...occ,...res];const sc=(all.length?Math.min(...all.map(o=>dist(c,o))):180)+(c%90===0?prefer:0);
      if(sc>bs){bs=sc;best=c}}
    res.push(best)}
  return res;
}
function lpMark(x,y,ang,d,style){const t=ang*Math.PI/180;const px=x+d*Math.cos(t),py=y+d*Math.sin(t);const nx=-Math.sin(t),ny=Math.cos(t);
  if(style==='dot')return `<circle cx="${r1(px+nx*3.6)}" cy="${r1(py+ny*3.6)}" r="2.2"/><circle cx="${r1(px-nx*3.6)}" cy="${r1(py-ny*3.6)}" r="2.2"/>`;
  return `<line x1="${r1(px+nx*6.5)}" y1="${r1(py+ny*6.5)}" x2="${r1(px-nx*6.5)}" y2="${r1(py-ny*6.5)}" stroke="#000" stroke-width="1.8"/>`}
function fcMark(x,y,ang,f){const t=ang*Math.PI/180;const px=x+27*Math.cos(t),py=y+27*Math.sin(t);const s=f>0?'+':'−';const lab=Math.abs(f)>1?Math.abs(f)+s:s;
  if(lw.fcStyle==='circle')return `<circle cx="${r1(px)}" cy="${r1(py)}" r="${lab.length>1?8.5:7}" fill="#fff" stroke="#000" stroke-width="1.1"/><text x="${r1(px)}" y="${r1(py+4)}" font-size="${lab.length>1?10:12}" font-weight="700" text-anchor="middle">${lab}</text>`;
  return `<text x="${r1(px)}" y="${r1(py+5)}" font-size="14" font-weight="700" text-anchor="middle">${lab}</text>`}
function drawMol(m){
  const S=60;let s='';const P=m.atoms.map(a=>({x:a.x*S,y:a.y*S}));
  const dirs=m.atoms.map(()=>[]);
  m.bonds.forEach(b=>{const A=P[b.a],B=P[b.b];dirs[b.a].push(Math.atan2(B.y-A.y,B.x-A.x)*180/Math.PI);dirs[b.b].push(Math.atan2(A.y-B.y,A.x-B.x)*180/Math.PI)});
  const clr=(el,ang)=>13+(el.length>1?6:0)*Math.abs(Math.cos(ang));
  m.bonds.forEach(b=>{const A=P[b.a],B=P[b.b];const ang=Math.atan2(B.y-A.y,B.x-A.x);const L=Math.hypot(B.x-A.x,B.y-A.y);
    const ux=Math.cos(ang),uy=Math.sin(ang),nx=-uy,ny=ux;const ca=clr(m.atoms[b.a].el,ang),cb=clr(m.atoms[b.b].el,ang);
    for(let k=0;k<b.o;k++){const off=(k-(b.o-1)/2)*(lw.bondStyle==='dot'?9:6.5);
      if(lw.bondStyle==='dot'){const mx=(A.x+B.x)/2+nx*off,my=(A.y+B.y)/2+ny*off;s+=`<circle cx="${r1(mx-ux*3.6)}" cy="${r1(my-uy*3.6)}" r="2.2"/><circle cx="${r1(mx+ux*3.6)}" cy="${r1(my+uy*3.6)}" r="2.2"/>`}
      else s+=`<line x1="${r1(A.x+ux*ca+nx*off)}" y1="${r1(A.y+uy*ca+ny*off)}" x2="${r1(B.x-ux*cb+nx*off)}" y2="${r1(B.y-uy*cb+ny*off)}" stroke="#000" stroke-width="1.8"/>`}
    if(L<1)return});
  m.atoms.forEach((a,i)=>{const p=P[i];s+=`<text x="${r1(p.x)}" y="${r1(p.y+8)}" font-size="22" text-anchor="middle">${esc(a.el)}</text>`;
    const lpd=freeDirs(dirs[i],a.lp,25);lpd.forEach(d=>{const t=d*Math.PI/180;s+=lpMark(p.x,p.y,d,16+(a.el.length>1?10:5)*Math.abs(Math.cos(t)),lw.lpStyle)});
    if(a.fc&&lw.fcStyle!=='hide'){const occ=[...dirs[i],...lpd];const fd=freeDirs(occ,1,-10)[0];s+=fcMark(p.x,p.y,fd,a.fc)}});
  let x0=Math.min(...P.map(p=>p.x))-34,x1=Math.max(...P.map(p=>p.x))+34,y0=Math.min(...P.map(p=>p.y))-34,y1=Math.max(...P.map(p=>p.y))+34;
  return{s,x0,x1,y0,y1};
}
function drawLewisAtom(){
  const z=+lw.z,q=+lw.q;const sh=shellsFor(z,q);let v;
  if(q>0)v=shellsFor(z,0).slice(-1)[0]-q;else v=sh.slice(-1)[0];
  if(q>0&&v<=0)v=0;if(z===2)v=2;
  const sym=EL[z][0];let s=`<text x="0" y="8" font-size="22" text-anchor="middle">${sym}</text>`;
  const sides=[-90,0,90,180];const cnt=[0,0,0,0];
  if(z===2)cnt[0]=2;else for(let i=0;i<v;i++)cnt[i%4]++;
  sides.forEach((a,i)=>{const t=a*Math.PI/180;const d=16+(sym.length>1?10:5)*Math.abs(Math.cos(t));
    if(cnt[i]===2)s+=lpMark(0,0,a,d,lw.lpStyle);
    if(cnt[i]===1){s+=`<circle cx="${r1(d*Math.cos(t))}" cy="${r1(d*Math.sin(t))}" r="2.2"/>`}});
  return{s,x0:-34,x1:34,y0:-34,y1:34,charge:q,formula:sym+(q?'^{'+chargeStr(q)+'}':''),name:ionName(z,q)};
}
function buildLewis(){
  lastWarn=[];lewisAnswer=[];const M=16;let D,charge,name,formula;
  if(lw.kind==='atom'){D=drawLewisAtom();charge=D.charge;name=D.name;formula=D.formula}
  else{const {m,out}=applyMistakes(lw.mol);lewisAnswer=out;D=drawMol(m);charge=m.charge;name=m.name;formula=m.formula;
    const fsum=lw.mol.atoms.reduce((s,a)=>s+(+a.fc||0),0);if(fsum!==lw.mol.charge)lastWarn.push(`De formele ladingen tellen op tot ${fsum}, maar de lading van het deeltje is ${lw.mol.charge}.`)}
  let top=M,body='';if(lw.title){body+=fmt(lw.title,M,top+16,17,'start','font-weight="700"');top+=32}
  const br=charge&&lw.brackets==='on';const bw=br?16:0,cw=br?30:0;
  const w=D.x1-D.x0,h=D.y1-D.y0;const ox=M+bw-D.x0,oy=top+(br?14:0)-D.y0;
  body+=`<g transform="translate(${r1(ox)},${r1(oy)})">${D.s}</g>`;
  let W=M+bw+w+bw+cw+M,y=top+h+(br?28:0);
  if(br){const lx=M+6,rx=M+bw+w+bw-6,t=top+4,b=top+h+24;body+=`<path d="M${lx+8} ${t}H${lx}V${b}H${lx+8}M${rx-8} ${t}H${rx}V${b}H${rx-8}" fill="none" stroke="#000" stroke-width="1.8"/>`;
    body+=`<text x="${rx+4}" y="${t+12}" font-size="17" font-weight="700">${chargeStr(charge)}</text>`}
  if(!br&&charge&&lw.kind==='atom'){body+=`<text x="${M+w+4}" y="${top+14}" font-size="17" font-weight="700">${chargeStr(charge)}</text>`;W+=24}
  const cx=(M+bw+w/2+bw/2);
  if(lw.label!=='none'){const t=lw.label==='formula'?formula:name;y+=22;body+=fmt(t,W/2,y,16,'middle');W=Math.max(W,textW(t,16)+2*M)}
  if(lw.caption){y+=24;body+=fmt(lw.caption,W/2,y,15,'middle');W=Math.max(W,textW(lw.caption,15)+2*M)}
  return svgWrap(W,y+M,body);
}
function lewisPanel(){
  const m=lw.mol;const lab=i=>{const a=m.atoms[i];return `${a.el}${m.atoms.filter(b=>b.el===a.el).length>1?' '+(m.atoms.slice(0,i+1).filter(b=>b.el===a.el).length):''}`};
  let h=`<div class="sec"><h3>Deeltje</h3>
    <div class="row"><span class="lab">Soort</span>${seg('kind',[['mol','Molecuul of ion'],['atom','Los atoom of ion']],lw.kind)}</div>`;
  if(lw.kind==='mol')h+=`<div class="row"><label for="lid">Kies</label><select id="lid" data-k="id" data-rebuild>${Object.entries(MOLS).map(([g,list])=>`<optgroup label="${g}">${Object.entries(list).map(([id,v])=>`<option value="${id}" ${lw.id===id?'selected':''}>${v[0]} · ${v[1]}</option>`).join('')}</optgroup>`).join('')}</select></div>`;
  else h+=`<div class="row"><label for="lz">Element</label><select id="lz" data-k="z" data-num data-rebuild>${elOpts(20,+lw.z)}</select></div><div class="row"><span class="lab">Lading</span>${seg('q',Q_OPTS,+lw.q)}</div>`;
  h+=`</div><div class="sec"><h3>Stijl</h3>
    ${lw.kind==='mol'?`<div class="row"><span class="lab">Bindingen</span>${seg('bondStyle',[['line','Streepjes'],['dot','Elektronenparen']],lw.bondStyle)}</div>`:''}
    <div class="row"><span class="lab">Vrije elektronenparen</span>${seg('lpStyle',[['line','Streepjes'],['dot','Puntjes']],lw.lpStyle)}</div>
    ${lw.kind==='mol'?`<div class="row"><span class="lab">Formele lading</span>${seg('fcStyle',[['circle','Omcirkeld'],['plain','Zonder cirkel'],['hide','Verbergen']],lw.fcStyle)}</div>`:''}
    <div class="row"><span class="lab">Haken bij een ion</span>${seg('brackets',[['on','Aan'],['off','Uit']],lw.brackets)}</div>
    <div class="row"><span class="lab">Onder de structuur</span>${seg('label',[['none','Niets'],['formula','Formule'],['name','Naam']],lw.label)}</div>
    <div class="row"><label for="ltit">Titel (leeg = geen)</label><input type="text" id="ltit" data-k="title" value="${esc(lw.title)}"></div>
    <div class="row"><label for="lcap">Onderschrift (bijv. A, B, C of D)</label><input type="text" id="lcap" data-k="caption" value="${esc(lw.caption)}"></div></div>`;
  if(lw.kind==='mol'){
    h+=`<div class="sec"><h3>Fouten zoeken</h3>
      <div class="row"><span class="lab">Aantal fouten in de figuur</span>${seg('mistakes',[[0,'Geen'],[1,'1 fout'],[2,'2 fouten'],[3,'3 fouten']],lw.mistakes)}</div>
      ${lw.mistakes?`<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-act="newmistake">Andere fout</button>${seg('answer',[['off','Uitwerking verbergen'],['on','Uitwerking tonen']],lw.answer)}</div>`:''}
      <p class="hint" style="margin:0">De uitwerking staat onder de figuur, niet in de afbeelding zelf.</p></div>
    <div class="sec"><h3>Aanpassen</h3><p class="hint" style="margin:0">Verander een symbool (bijv. Cl in Br) of het aantal vrije paren, de lading of de bindingen.</p>
      ${m.atoms.map((a,i)=>`<div style="display:grid;grid-template-columns:62px 1fr 1fr;gap:8px;align-items:end">
        <div class="row"><label for="ae${i}">Atoom</label><input type="text" id="ae${i}" data-k="mol.atoms.${i}.el" value="${esc(a.el)}" maxlength="2"></div>
        <div class="row"><label for="al${i}">Vrije paren</label><input type="number" id="al${i}" min="0" max="4" data-k="mol.atoms.${i}.lp" data-num value="${a.lp}"></div>
        <div class="row"><label for="af${i}">Formele lading</label><select id="af${i}" data-k="mol.atoms.${i}.fc" data-num>${[[-2,'2−'],[-1,'−'],[0,'geen'],[1,'+'],[2,'2+']].map(([v,l])=>`<option value="${v}" ${+a.fc===v?'selected':''}>${l}</option>`).join('')}</select></div></div>`).join('')}
      ${m.bonds.map((b,i)=>`<div class="row"><span class="lab">Binding ${lab(b.a)} – ${lab(b.b)}</span>${seg(`mol.bonds.${i}.o`,[[1,'Enkel'],[2,'Dubbel'],[3,'Drievoudig']],b.o)}</div>`).join('')}
      <div class="row"><span class="lab">Lading van het deeltje</span>${seg('mol.charge',Q_OPTS,+m.charge)}</div>
      <button class="btn" data-act="reset">Terug naar origineel</button></div>`;
  }
  return h;
}
const LEWIS={key:'sf.lewis',st:()=>lw,build:buildLewis,panel:lewisPanel,
  onChange:k=>{if(k==='id'){lw.mol=molFrom(lw.id);lw.mseed++}
    lw.mol.bonds.forEach(b=>b.o=+b.o);lw.mol.charge=+lw.mol.charge;lw.mistakes=+lw.mistakes},
  act:(a)=>{if(a==='newmistake')lw.mseed++;if(a==='reset')lw.mol=molFrom(lw.id)},
  extra:()=>lw.kind==='mol'&&lw.mistakes&&lw.answer==='on'&&lewisAnswer.length?`<div class="kind"><strong style="font-size:13px">Uitwerking</strong><ol style="margin:0;padding-left:20px">${lewisAnswer.map(t=>`<li>${esc(t)}</li>`).join('')}</ol></div>`:''};

GEN.lewis=()=>mountGen(LEWIS);
