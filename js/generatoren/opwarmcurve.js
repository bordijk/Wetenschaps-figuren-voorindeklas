/* ---------- Opwarm- en afkoelcurve ---------- */
const SUBS={
 water:['Water',{mpA:0,mpB:0,bpA:100,bpB:100,cs:2.1,cl:4.18,cg:2.0,Lf:334,Lv:2260,T0:-20,T1:120,purity:'pure'}],
 ethanol:['Ethanol',{mpA:-114,mpB:-114,bpA:78,bpB:78,cs:1.1,cl:2.44,cg:1.4,Lf:108,Lv:841,T0:-130,T1:100,purity:'pure'}],
 naftaleen:['Naftaleen',{mpA:80,mpB:80,bpA:218,bpB:218,cs:1.3,cl:1.7,cg:1.3,Lf:147,Lv:337,T0:20,T1:240,purity:'pure'}],
 stearine:['Stearinezuur',{mpA:69,mpB:69,bpA:361,bpB:361,cs:1.6,cl:2.3,cg:2,Lf:199,Lv:500,T0:30,T1:90,purity:'pure'}],
 tin:['Tin',{mpA:232,mpB:232,bpA:2602,bpB:2602,cs:.23,cl:.25,cg:.2,Lf:59,Lv:2500,T0:150,T1:300,purity:'pure'}],
 paraffine:['Paraffine (mengsel)',{mpA:52,mpB:60,bpA:370,bpB:420,cs:2.1,cl:2.9,cg:2,Lf:200,Lv:300,T0:25,T1:85,purity:'mix'}],
 eigen:['Eigen stof',{}],
};
const OC0={sub:'water',...SUBS.water[1],unit:'C',mode:'heat',scale:'schematic',tMax:20,yNums:'on',grid:'lines',labels:'phase',markers:'name',super:'off',curve:'on',title:'',caption:''};
let oc;try{oc=JSON.parse(localStorage.getItem('sf.opwarmcurve')||'null')}catch(e){}oc=Object.assign(clone(OC0),oc||{});
const UN=()=>oc.unit==='K'?'K':'°C';
const OC_T=['mpA','mpB','bpA','bpB','T0','T1'];
function ocSegs(lo,hi){
  const pure=oc.purity==='pure';const mA=+oc.mpA,mB=pure?mA:Math.max(mA,+oc.mpB),bA=+oc.bpA,bB=pure?bA:Math.max(bA,+oc.bpB);
  const cs=+oc.cs||1,cl=+oc.cl||1,cg=+oc.cg||1,Lf=+oc.Lf||0,Lv=+oc.Lv||0;
  const segs=[];let T=lo;
  const sens=(to,c,ph)=>{to=Math.min(to,hi);if(to>T+1e-9){segs.push({k:'sens',a:T,b:to,q:c*(to-T),ph});T=to}};
  const trans=(A,B,L,c1,c2,k)=>{if(!(A>=lo&&A<hi&&Math.abs(T-A)<1e-9))return;
    if(B<=A){segs.push({k,a:A,b:A,q:L});return}
    const to=Math.min(B,hi);segs.push({k,a:A,b:to,q:L*(to-A)/(B-A)+(c1+c2)/2*(to-A)});T=to};
  if(T<mA)sens(mA,cs,'vast');
  trans(mA,mB,Lf,cs,cl,'melt');
  if(T<bA)sens(bA,cl,'vloeibaar');
  trans(bA,bB,Lv,cl,cg,'boil');
  if(T<hi)sens(hi,T>=bA?cg:T>=mA?cl:cs,T>=bA?'gas':T>=mA?'vloeibaar':'vast');
  return{segs,pure,mA,mB,bA,bB};
}
function buildOC(){
  lastWarn=[];const M=16,W=520,H=300;
  let lo=Math.min(+oc.T0,+oc.T1),hi=Math.max(+oc.T0,+oc.T1);if(hi-lo<1){hi=lo+1;lastWarn.push('Kies een hoogste temperatuur boven de laagste.')}
  const {segs,pure,mA,mB,bA,bB}=ocSegs(lo,hi);const cool=oc.mode==='cool';const real=oc.scale==='real';
  if(!pure&&(+oc.mpB<+oc.mpA))lastWarn.push('Het einde van het smelttraject ligt lager dan het begin.');
  const tTot0=real?Math.max(1,+oc.tMax||20):10;
  // tijd per stuk
  if(real){const Q=segs.reduce((s,g)=>s+g.q,0)||1;segs.forEach(g=>g.dt=g.q/Q*tTot0)}
  else{const pw={melt:.2,boil:.3};const plat=segs.filter(g=>g.k!=='sens');const wp=plat.reduce((s,g)=>s+pw[g.k],0);
    const dT=segs.filter(g=>g.k==='sens').reduce((s,g)=>s+(g.b-g.a),0)||1;segs.forEach(g=>g.dt=g.k==='sens'?(1-wp)*(g.b-g.a)/dT*tTot0:pw[g.k]*tTot0)}
  const order=cool?[...segs].reverse():segs;
  let t=0,T=cool?hi:lo;const pts=[[0,T]],bnd=[[0,T]],info=[];
  for(const g of order){
    if(cool&&oc.super==='on'&&g.k==='melt'&&pure){const dd=.06*(hi-lo),d1=.05*tTot0,d2=.012*tTot0;pts.push([t+d1,T-dd],[t+d1+d2,T]);t+=d1+d2}
    const Te=cool?g.a:g.b;info.push({t0:t,T0:T,t1:t+g.dt,T1:Te,g});t+=g.dt;T=Te;pts.push([t,T]);bnd.push([t,T])}
  const tTot=t;
  const ys=niceStep(hi-lo,6);let yMin=Math.floor(lo/ys)*ys;if(lo-yMin<ys*.3)yMin-=ys;let yMax=Math.ceil(hi/ys)*ys;if(yMax-hi<ys*.3)yMax+=ys;
  if(oc.super==='on'&&cool)yMin=Math.min(yMin,Math.floor((mA-.06*(hi-lo))/ys)*ys);
  const xs=real?niceStep(tTot,8):0;const xMax=real?Math.ceil(tTot*1.02/xs)*xs:tTot*1.05;
  const yNums=oc.yNums==='on';const dec=ys<1?2:0;
  const yt=[];for(let v=yMin;v<=yMax+ys*.01;v+=ys)yt.push(Math.round(v*1e6)/1e6);
  const tw=yNums?Math.max(...yt.map(v=>textW(nlNum(v,dec),13))):0;
  let top=M,body='';if(oc.title){body+=fmt(oc.title,M,top+16,17,'start','font-weight="700"');top+=32}
  const mkNames=[];if(oc.curve==='on'&&oc.markers!=='off'&&!yNums)segs.forEach(g=>{if(g.k==='sens')return;const melt=g.k==='melt';const A=melt?mA:bA,B=melt?mB:bB;
    const one=pure||Math.abs(B-A)<1e-9;const nm=melt?(one?(cool?'stolpunt':'smeltpunt'):(cool?'stoltraject':'smelttraject')):(one?(cool?'condensatiepunt':'kookpunt'):(cool?'condensatietraject':'kooktraject'));
    mkNames.push(nm+(oc.markers==='value'?(one?` (${nlNum(A,1)}\u00a0${UN()})`:` (${nlNum(A,1)}–${nlNum(B,1)}\u00a0${UN()})`):''))});
  const mw=mkNames.length?Math.max(...mkNames.map(t=>textW(t,12)))+18:0;
  const ML=M+(yNums?tw+36:26+mw),MT=top+26;
  const X=v=>ML+v/xMax*W,Y=v=>MT+H-(v-yMin)/(yMax-yMin)*H;
  // raster
  if(oc.grid!=='off'){const paper=oc.grid==='paper';let g='';
    const ln=(x1,y1,x2,y2,c,w)=>`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="${c}" stroke-width="${w}"/>`;
    if(yNums){if(paper)for(let v=yMin;v<=yMax+1e-9;v+=ys/5)g+=ln(ML,Y(v),ML+W,Y(v),'#dcdcdc',.6);yt.forEach(v=>g+=ln(ML,Y(v),ML+W,Y(v),'#a9a9a9',.8))}
    if(real){if(paper)for(let v=0;v<=xMax+1e-9;v+=xs/5)g+=ln(X(v),MT,X(v),MT+H,'#dcdcdc',.6);for(let v=xs;v<=xMax+1e-9;v+=xs)g+=ln(X(v),MT,X(v),MT+H,'#a9a9a9',.8)}
    body+=g}
  body+=axesArrows(ML,MT,W,H);
  if(yNums)yt.forEach(v=>{body+=`<line x1="${ML-5}" y1="${r1(Y(v))}" x2="${ML}" y2="${r1(Y(v))}" stroke="#000" stroke-width="1.2"/><text x="${ML-8}" y="${r1(Y(v)+4.5)}" font-size="13" text-anchor="end">${nlNum(v,dec)}</text>`});
  if(real)for(let v=0;v<=xMax+1e-9;v+=xs){body+=`<line x1="${r1(X(v))}" y1="${MT+H}" x2="${r1(X(v))}" y2="${MT+H+5}" stroke="#000" stroke-width="1.2"/><text x="${r1(X(v))}" y="${MT+H+20}" font-size="13" text-anchor="middle">${nlNum(v,2)}</text>`}
  {const lx=ML-(yNums?tw+22:12+mw),ly=MT+H/2;body+=fmt(yNums?'temperatuur ('+UN()+')':'temperatuur',lx,ly,14,'middle',`transform="rotate(-90 ${r1(lx)} ${r1(ly)})"`)}
  body+=fmt(real?'tijd (min)':'tijd',ML+W/2,MT+H+(real?42:22),14,'middle');
  if(oc.curve==='on'){
    const val=v=>oc.markers==='value'?` (${nlNum(v,1)} ${UN()})`:'';
    let mk='',lab='';
    if(oc.markers!=='off')info.forEach(({t0,t1,g})=>{if(g.k==='sens')return;const melt=g.k==='melt';
      const A=melt?mA:bA,B=melt?mB:bB;
      if(pure||Math.abs(B-A)<1e-9){const tx=t0;mk+=dash(ML,Y(A),X(tx),Y(A));
        const nm=melt?(cool?'stolpunt':'smeltpunt'):(cool?'condensatiepunt':'kookpunt');lab+=yNums?fmt(nm+val(A),ML+6,Y(A)-6,12,'start',HALO):fmt(nm+val(A),ML-8,Y(A)+4,12,'end')}
      else{const tA=cool?t1:t0,tB=cool?t0:t1;mk+=dash(ML,Y(A),X(tA),Y(A))+dash(ML,Y(Math.min(B,hi)),X(tB),Y(Math.min(B,hi)));
        const yA=Y(A),yB=Y(Math.min(B,hi));mk+=`<path d="M${ML+10} ${r1(yB)}H${ML+5}V${r1(yA)}H${ML+10}" fill="none" stroke="#000" stroke-width="1.2"/>`;
        const nm=melt?(cool?'stoltraject':'smelttraject'):(cool?'condensatietraject':'kooktraject');
        const txt2=nm+(oc.markers==='value'?` (${nlNum(A,1)}–${nlNum(B,1)} ${UN()})`:'');
        if(!yNums){mk+=`<path d="M${ML-4} ${r1(yB)}H${ML-9}V${r1(yA)}H${ML-4}" fill="none" stroke="#000" stroke-width="1.2"/>`;lab+=fmt(txt2,ML-13,(yA+yB)/2+4,12,'end')}
        else lab+=yA-yB>16?fmt(txt2,ML+14,(yA+yB)/2+4,12,'start',HALO):fmt(txt2,ML+14,yB-6,12,'start',HALO)}});
    body+=mk+`<polyline points="${pts.map(([a,b])=>r1(X(a))+','+r1(Y(b))).join(' ')}" fill="none" stroke="#000" stroke-width="2.4" stroke-linejoin="round"/>`;
    if(oc.labels==='letters')bnd.forEach(([a,b],i)=>{lab+=`<circle cx="${r1(X(a))}" cy="${r1(Y(b))}" r="2.8"/>`+fmt('ABCDEFGHIJ'[i],X(a)-6,Y(b)-8,14,'end','font-weight="700" '+HALO)});
    else if(oc.labels!=='none')info.forEach(({t0,T0,t1,T1,g})=>{
      let s;if(oc.labels==='process'){if(g.k==='sens')return;s=g.k==='melt'?(cool?'stollen':'smelten'):(cool?'condenseren':'koken')}
      else s=g.k==='sens'?g.ph:g.k==='melt'?'vast + vloeibaar':'vloeibaar + gas';
      const xm=X((t0+t1)/2),ym=Y((T0+T1)/2),w=textW(s,13);
      if(g.k!=='sens'){const xc=Math.max(ML+4+w/2,Math.min(ML+W-w/2,xm));lab+=fmt(s,xc,ym+19,13,'middle',HALO)}
      else if(Math.abs(Y(T0)-Y(T1))<6)lab+=fmt(s,xm,ym-9,13,'middle',HALO);
      else{let left=!cool;if(left&&xm-9-w<ML+4)left=false;if(!left&&xm+9+w>ML+W)left=true;
        lab+=left?fmt(s,xm-9,ym+(cool?14:-3),13,'end',HALO):fmt(s,xm+9,ym+(cool?-3:14),13,'start',HALO)}});
    body+=lab;
  }
  let bottom=MT+H+(real?54:34);
  if(oc.caption){bottom+=20;body+=fmt(oc.caption,ML+W/2,bottom,15,'middle')}
  return svgWrap(ML+W+30,bottom+M,body);
}
function ocPanel(){
  const n=(id,k,label,dec=false,min=-500,max=5000)=>`<div class="row"><label for="${id}">${label}</label><input type="number" id="${id}" min="${min}" max="${max}" step="any" data-k="${k}" ${dec?'data-dec':'data-num'} value="${oc[k]}"></div>`;
  const pure=oc.purity==='pure';const cool=oc.mode==='cool';
  return `<div class="sec"><h3>Stof</h3>
    <div class="row"><label for="osub">Kies een stof</label><select id="osub" data-k="sub" data-rebuild>${Object.entries(SUBS).map(([k,[l]])=>`<option value="${k}" ${oc.sub===k?'selected':''}>${l}</option>`).join('')}</select></div>
    <div class="row"><span class="lab">Soort</span>${seg('purity',[['pure','Zuivere stof (smeltpunt)'],['mix','Mengsel (smelttraject)']],oc.purity)}</div>
    ${pure?`<div class="two">${n('omp','mpA','Smeltpunt ('+UN()+')')}${n('obp','bpA','Kookpunt ('+UN()+')')}</div>`
      :`<div class="two">${n('ompa','mpA','Smelttraject van ('+UN()+')')}${n('ompb','mpB','tot ('+UN()+')')}</div><div class="two">${n('obpa','bpA','Kooktraject van ('+UN()+')')}${n('obpb','bpB','tot ('+UN()+')')}</div>`}
    <details><summary class="hint" style="cursor:pointer">Warmtegegevens (bepalen de lengtes bij "op schaal")</summary>
      <div class="two" style="margin-top:8px">${n('ocs','cs','c vast (J/g·K)',true,0,100)}${n('ocl','cl','c vloeibaar (J/g·K)',true,0,100)}${n('ocg','cg','c gas (J/g·K)',true,0,100)}${n('olf','Lf','Smeltwarmte (J/g)',true,0,99999)}${n('olv','Lv','Verdampingswarmte (J/g)',true,0,99999)}</div></details>
  </div>
  <div class="sec"><h3>Curve</h3>
    <div class="row"><span class="lab">Temperatuur in</span>${seg('unit',[['C','°C'],['K','kelvin (K)']],oc.unit)}<span class="hint">T (K) = t (°C) + 273. Alle temperaturen hieronder en op de as rekenen mee.</span></div>
    <div class="row"><span class="lab">Richting</span>${seg('mode',[['heat','Opwarmen'],['cool','Afkoelen']],oc.mode)}</div>
    <div class="two">${n('ot0','T0','Laagste temperatuur ('+UN()+')')}${n('ot1','T1','Hoogste temperatuur ('+UN()+')')}</div>
    <div class="row"><span class="lab">Tijdas</span>${seg('scale',[['real','Op schaal'],['schematic','Schematisch']],oc.scale)}</div>
    ${oc.scale==='real'?n('otm','tMax','Totale tijd (min)',false,1,999):''}
    ${cool&&pure?`<div class="row"><span class="lab">Onderkoeling</span>${seg('super',[['off','Nee'],['on','Ja']],oc.super)}</div>`:''}
  </div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Labels bij de lijn</span>${seg('labels',[['phase','Fasen'],['process','Smelten/koken'],['letters','Letters A, B…'],['none','Geen']],oc.labels)}</div>
    <div class="row"><span class="lab">${pure?'Smelt- en kookpunt':'Smelt- en kooktraject'} aangeven</span>${seg('markers',[['name','Naam'],['value','Naam + waarde'],['off','Nee']],oc.markers)}</div>
    <div class="row"><span class="lab">Getallen op de temperatuuras</span>${seg('yNums',[['on','Ja'],['off','Nee']],oc.yNums)}</div>
    <div class="row"><span class="lab">Raster</span>${seg('grid',[['off','Geen'],['lines','Lijnen'],['paper','Ruitjespapier']],oc.grid)}</div>
    <div class="row"><span class="lab">Curve</span>${seg('curve',[['on','Tonen'],['off','Alleen assen']],oc.curve)}<span class="hint">"Alleen assen" laat leerlingen de curve zelf tekenen.</span></div>
    <div class="row"><label for="otit">Titel (leeg = geen)</label><input type="text" id="otit" data-k="title" value="${esc(oc.title)}"></div>
    <div class="row"><label for="ocap">Onderschrift</label><input type="text" id="ocap" data-k="caption" value="${esc(oc.caption)}"></div>
  </div>`;
}
const OC={key:'sf.opwarmcurve',st:()=>oc,build:buildOC,panel:ocPanel,
  onChange:k=>{if(k==='sub'){Object.assign(oc,clone(SUBS[oc.sub][1]));if(oc.unit==='K'&&SUBS[oc.sub][1].T0!==undefined)OC_T.forEach(f=>oc[f]=+oc[f]+273)}
    if(k==='unit'){const d=oc.unit==='K'?273:-273;OC_T.forEach(f=>oc[f]=+oc[f]+d)}
    if(k==='purity'&&oc.purity==='mix'){if(+oc.mpB<=+oc.mpA)oc.mpB=+oc.mpA+6;if(+oc.bpB<=+oc.bpA)oc.bpB=+oc.bpA+10}},
  act:(a)=>{if(a==='noop')return false}};

GEN.opwarmcurve=()=>mountGen(OC);
