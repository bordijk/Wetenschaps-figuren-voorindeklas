
/* ---------- Energiediagram ---------- */
const ED0={type:'curve',steps:1,cat:'off',E0:0,E1:-286,Ea:120,Ei:60,Ea2:70,EaCat:60,Eat:679,nums:'off',unit:'kJ/mol',yLabel:'E',xLabel:'reactieverloop',
  lStart:'beginstoffen',lEnd:'reactieproducten',lTS:'geactiveerde toestand',showTS:'on',lInt:'tussenproduct',lAtoms:'losse atomen',aMode:'symbol',showEa:'on',showDE:'on',title:'',caption:''};
let ed;try{ed=JSON.parse(localStorage.getItem('sf.energie')||'null')}catch(e){}ed=Object.assign(clone(ED0),ed||{});
const LBL={lStart:'beginstoffen',lEnd:'reactieproducten'};
const ED_PRESETS={
 exo:['Exotherm',{type:'curve',steps:1,cat:'off',E0:0,E1:-286,Ea:120,...LBL}],
 endo:['Endotherm',{type:'curve',steps:1,cat:'off',E0:0,E1:90,Ea:180,...LBL}],
 cat:['Met katalysator',{type:'curve',steps:1,cat:'on',E0:0,E1:-200,Ea:150,EaCat:70,...LBL}],
 twee:['Twee stappen',{type:'curve',steps:2,cat:'off',E0:0,Ei:60,E1:-150,Ea:110,Ea2:70,...LBL}],
 niveaus:['Niveauschema',{type:'levels',steps:1,cat:'off',E0:0,E1:-286,Ea:120,...LBL}],
 bind:['Bindingsenergie H₂ + Cl₂',{type:'atoms',E0:0,Eat:679,E1:-183,lStart:'H_2 + Cl_2',lAtoms:'2 H + 2 Cl',lEnd:'2 HCl'}],
};
function buildED(){
  lastWarn=[];const M=16,W=500,H=280;
  const t=ed.type,two=+ed.steps===2&&t!=='atoms',cat=ed.cat==='on'&&t!=='atoms',nums=ed.nums==='on';
  const E0=+ed.E0,E1=+ed.E1,T1=E0+(+ed.Ea),Ei=+ed.Ei,T2=Ei+(+ed.Ea2),Tc=E0+(+ed.EaCat),Eat=+ed.Eat;
  const vals=[E0,E1];
  if(t==='atoms'){vals.push(Eat);if(Eat<=Math.max(E0,E1))lastWarn.push('Het niveau van de losse atomen moet boven beginstoffen en reactieproducten liggen.')}
  else{vals.push(T1);
    if(two){vals.push(Ei,T2);if(T1<=Math.max(E0,Ei)||T2<=Math.max(Ei,E1))lastWarn.push('Elke geactiveerde toestand moet hoger liggen dan de stoffen ervoor en erna. Verhoog de activeringsenergie.')}
    else if(T1<=Math.max(E0,E1))lastWarn.push('De geactiveerde toestand ligt niet boven beginstoffen en reactieproducten. Verhoog de activeringsenergie.');
    if(cat){vals.push(Tc);if(Tc>=Math.max(T1,two?T2:T1))lastWarn.push('Met katalysator hoort de activeringsenergie lager te zijn.')}}
  let lo=Math.min(...vals),hi=Math.max(...vals);const span=(hi-lo)||100;lo-=span*.16;hi+=span*.13;
  let step=0;if(nums){step=niceStep(hi-lo,6);lo=Math.floor(lo/step)*step;hi=Math.ceil(hi/step)*step}
  let top=M,body='';if(ed.title){body+=fmt(ed.title,M,top+16,17,'start','font-weight="700"');top+=32}
  const ticks=[];if(nums)for(let v=lo;v<=hi+step*.01;v+=step)ticks.push(Math.round(v*1e6)/1e6);
  const tw=nums?Math.max(...ticks.map(v=>textW(nlNum(v,2),13))):0;
  const ML=M+(nums?tw+34:14),MT=top+28;
  const X=f=>ML+f*W*.86,Y=v=>MT+H-(v-lo)/(hi-lo)*H;
  body+=axesArrows(ML,MT,W,H);
  ticks.forEach(v=>{body+=`<line x1="${ML-5}" y1="${r1(Y(v))}" x2="${ML}" y2="${r1(Y(v))}" stroke="#000" stroke-width="1.2"/><text x="${ML-8}" y="${r1(Y(v)+4.5)}" font-size="13" text-anchor="end">${nlNum(v,2)}</text>`});
  if(nums){const yl=ed.yLabel+(ed.unit?` (${ed.unit})`:'');const lx=ML-tw-22,ly=MT+H/2;body+=fmt(yl,lx,ly,14,'middle',`transform="rotate(-90 ${r1(lx)} ${r1(ly)})"`)}
  else if(ed.yLabel)body+=fmt(ed.yLabel,ML+10,MT-10,16,'start','font-style="italic"');
  if(ed.xLabel)body+=fmt(ed.xLabel,ML+W+14,MT+H+24,14,'end');
  // pijllabels
  let li=0;const letter=()=>'abcdefg'[li++];
  const aLab=(sym,val,signed)=>ed.aMode==='letters'?letter():ed.aMode==='value'?`${sym} = ${signed?sgnNum(val):nlNum(val)} ${ed.unit}`:sym;
  const txt=(s,x,y,anchor,size=14)=>fmt(s,x,y,size,anchor,HALO);
  let draw='',lines='',labels='',arrows='';let startEnd,endStart;
  if(t==='curve'){
    const kn=two?[[.02,E0],[.14,E0],[.33,T1],[.5,Ei],[.67,T2],[.86,E1],[.98,E1]]:[[.02,E0],[.18,E0],[.5,T1],[.82,E1],[.98,E1]];
    startEnd=kn[1][0];endStart=kn[kn.length-2][0];
    const path=k=>{let d=`M${r1(X(k[0][0]))} ${r1(Y(k[0][1]))}`;for(let i=0;i<k.length-1;i++){const[a,ya]=k[i],[b,yb]=k[i+1];
      for(let j=1;j<=28;j++){const u=j/28,s=u*u*(3-2*u);d+=`L${r1(X(a+(b-a)*u))} ${r1(Y(ya+(yb-ya)*s))}`}}return d};
    draw+=`<path d="${path(kn)}" fill="none" stroke="#000" stroke-width="2.2" stroke-linejoin="round"/>`;
    if(cat)draw+=`<path d="${path([[startEnd,E0],[(startEnd+endStart)/2,Tc],[endStart,E1]])}" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="7 5"/>`;
    labels+=txt(ed.lStart,X(.02),Y(E0)+21,'start')+txt(ed.lEnd,X(.98),Y(E1)+21,'end');
    if(ed.showTS==='on'){(two?[[.33,T1],[.67,T2]]:[[.5,T1]]).forEach(([f,v])=>labels+=txt(ed.lTS,X(f),Y(v)-10,'middle',13))}
    if(two)labels+=txt(ed.lInt,X(.5),Y(Ei)+21,'middle',13);
  }else if(t==='levels'){
    const bars=two?[[.02,.15,E0,ed.lStart],[.23,.36,T1,ed.showTS==='on'?ed.lTS:''],[.435,.565,Ei,ed.lInt],[.64,.77,T2,ed.showTS==='on'?ed.lTS:''],[.85,.98,E1,ed.lEnd]]
      :[[.02,.22,E0,ed.lStart],[.4,.6,T1,ed.showTS==='on'?ed.lTS:''],[.78,.98,E1,ed.lEnd]];
    startEnd=bars[0][1];endStart=bars[bars.length-1][0];
    bars.forEach((b,i)=>{draw+=`<line x1="${r1(X(b[0]))}" y1="${r1(Y(b[2]))}" x2="${r1(X(b[1]))}" y2="${r1(Y(b[2]))}" stroke="#000" stroke-width="2.6"/>`;
      if(b[3])labels+=txt(b[3],X((b[0]+b[1])/2),Y(b[2])-9,'middle',13);
      if(i<bars.length-1){const n=bars[i+1];lines+=dash(X(b[1]),Y(b[2]),X(n[0]),Y(n[2]),'4 3')}});
    if(cat){const c=[.4,.6];draw+=`<line x1="${r1(X(c[0]))}" y1="${r1(Y(Tc))}" x2="${r1(X(c[1]))}" y2="${r1(Y(Tc))}" stroke="#000" stroke-width="2.6" stroke-dasharray="7 4"/>`;
      lines+=dash(X(startEnd),Y(E0),X(c[0]),Y(Tc),'2 3')+dash(X(c[1]),Y(Tc),X(endStart),Y(E1),'2 3')}
  }else{
    const bars=[[.02,.24,E0,ed.lStart],[.32,.68,Eat,ed.lAtoms],[.76,.98,E1,ed.lEnd]];startEnd=.24;endStart=.76;
    bars.forEach(b=>{draw+=`<line x1="${r1(X(b[0]))}" y1="${r1(Y(b[2]))}" x2="${r1(X(b[1]))}" y2="${r1(Y(b[2]))}" stroke="#000" stroke-width="2.6"/>`;if(b[3])labels+=txt(b[3],X((b[0]+b[1])/2),Y(b[2])-9,'middle',14)});
    lines+=dash(X(.24),Y(E0),X(.28)+4,Y(E0))+dash(X(.32),Y(Eat),X(.28)-4,Y(Eat))+dash(X(.68),Y(Eat),X(.72)+4,Y(Eat))+dash(X(.76),Y(E1),X(.72)-4,Y(E1));
    if(ed.showEa==='on'){
      arrows+=vArrow(X(.28),Y(E0),Y(Eat))+txt(ed.aMode==='symbol'?'bindingen verbreken':aLab('E',Eat-E0,true),X(.28)+8,(Y(E0)+Y(Eat))/2+5,'start',13);
      arrows+=vArrow(X(.72),Y(Eat),Y(E1))+txt(ed.aMode==='symbol'?'bindingen vormen':aLab('E',E1-Eat,true),X(.72)-8,(Y(Eat)+Y(E1))/2+5,'end',13);
    }
  }
  // activeringsenergie-pijlen
  const dEx=X(1)+18;let e0ext=0;
  if(t!=='atoms'&&ed.showEa==='on'){
    const off=cat?10:0;const p1=t==='levels'?(two?.295:.5):(two?.33:.5);
    const xa=X(p1)-off;e0ext=Math.max(e0ext,xa);
    arrows+=vArrow(xa,Y(E0),Y(T1))+txt(aLab(two?'E_{a,1}':'E_a',+ed.Ea),xa-7,(Y(E0)+Y(T1))/2+5,'end');
    if(two){const p2=t==='levels'?.705:.67;const xb=X(p2);const iEnd=t==='levels'?.565:.5;
      lines+=dash(X(iEnd),Y(Ei),xb+4,Y(Ei));arrows+=vArrow(xb,Y(Ei),Y(T2))+txt(aLab('E_{a,2}',+ed.Ea2),xb+7,(Y(Ei)+Y(T2))/2+5,'start')}
    if(cat){const xc=X(two&&t==='curve'?.5:.5)+off;e0ext=Math.max(e0ext,xc);if(t==='levels'||two)lines+=dash(X(.6),Y(Tc),xc+4,Y(Tc));
      arrows+=vArrow(xc,Y(E0),Y(Tc))+txt(aLab('E_a',+ed.EaCat)+(ed.aMode==='symbol'?' (kat.)':''),xc+7,(Y(E0)+Y(Tc))/2+5,'start',13)}
  }
  let right=ML+W+20;
  if(ed.showDE==='on'){e0ext=dEx+5;lines+=dash(X(.98),Y(E1),dEx+5,Y(E1));
    const lab=aLab('ΔE',E1-E0,true);arrows+=vArrow(dEx,Y(E0),Y(E1))+txt(lab,dEx+8,(Y(E0)+Y(E1))/2+5,'start');right=Math.max(right,dEx+12+textW(lab,14))}
  if(e0ext>X(startEnd))lines=dash(X(startEnd),Y(E0),e0ext,Y(E0))+lines;
  body+=lines+draw+arrows+labels;
  let bottom=MT+H+(ed.xLabel?32:14);
  if(cat){bottom+=10;body+=`<line x1="${ML}" y1="${bottom}" x2="${ML+34}" y2="${bottom}" stroke="#000" stroke-width="2.2"/><text x="${ML+42}" y="${bottom+5}" font-size="13">zonder katalysator</text>`+
    `<line x1="${ML+180}" y1="${bottom}" x2="${ML+214}" y2="${bottom}" stroke="#000" stroke-width="2" stroke-dasharray="7 5"/><text x="${ML+222}" y="${bottom+5}" font-size="13">met katalysator</text>`;bottom+=14}
  if(ed.caption){bottom+=22;body+=fmt(ed.caption,ML+W/2,bottom,15,'middle')}
  return svgWrap(right+M,bottom+M,body);
}
function edPanel(){
  const n=(id,k,label,min=-9999)=>`<div class="row"><label for="${id}">${label}</label><input type="number" id="${id}" min="${min}" max="9999" data-k="${k}" data-num value="${ed[k]}"></div>`;
  const tx=(id,k,label,ph='')=>`<div class="row"><label for="${id}">${label}</label><input type="text" id="${id}" data-k="${k}" value="${esc(ed[k])}" placeholder="${ph}"></div>`;
  const at=ed.type==='atoms',two=+ed.steps===2,cat=ed.cat==='on';
  return `<div class="sec"><h3>Snel instellen</h3><div style="display:flex;flex-wrap:wrap;gap:6px">${Object.entries(ED_PRESETS).map(([k,[l]])=>`<button class="btn small" data-act="preset" data-p="${k}">${l}</button>`).join('')}</div></div>
  <div class="sec"><h3>Soort diagram</h3>
    ${seg('type',[['curve','Kromme'],['levels','Niveaus'],['atoms','Via losse atomen']],ed.type)}
    ${!at?`<div class="row"><span class="lab">Aantal stappen</span>${seg('steps',[[1,'Eén stap'],[2,'Twee stappen']],+ed.steps)}</div>
    <div class="row"><span class="lab">Katalysator (gestippeld)</span>${seg('cat',[['off','Nee'],['on','Ja']],ed.cat)}</div>`:''}
  </div>
  <div class="sec"><h3>Energieën (${esc(ed.unit||'kJ/mol')})</h3>
    <div class="two">${n('e0','E0','Beginstoffen')}${n('e1','E1','Reactieproducten')}</div>
    ${at?n('eat','Eat','Losse atomen'):`<div class="two">${n('ea','Ea',two?'Activeringsenergie stap 1':'Activeringsenergie',0)}${cat?n('eac','EaCat','Activeringsenergie met katalysator',0):''}</div>
    ${two?`<div class="two">${n('ei','Ei','Tussenproduct')}${n('ea2','Ea2','Activeringsenergie stap 2',0)}</div>`:''}`}
    <p class="hint" style="margin:0">ΔE = ${sgnNum(+ed.E1-ed.E0)} ${esc(ed.unit)} (${+ed.E1<+ed.E0?'exotherm':+ed.E1>+ed.E0?'endotherm':'geen warmte-effect'})</p>
  </div>
  <div class="sec"><h3>Pijlen</h3>
    <div class="row"><span class="lab">${at?'Bindingen verbreken en vormen':'Activeringsenergie'}</span>${seg('showEa',[['on','Tonen'],['off','Verbergen']],ed.showEa)}</div>
    <div class="row"><span class="lab">ΔE (reactiewarmte)</span>${seg('showDE',[['on','Tonen'],['off','Verbergen']],ed.showDE)}</div>
    <div class="row"><span class="lab">Tekst bij de pijlen</span>${seg('aMode',[['symbol','Symbool'],['value','Met waarde'],['letters','Letters a, b, c']],ed.aMode)}</div>
  </div>
  <div class="sec"><h3>Tekst</h3>
    <p class="hint" style="margin:0">Gebruik _ en ^ voor sub- en superscript: 2 H_2 (g) + O_2 (g)</p>
    <div class="two">${tx('ls','lStart','Beginstoffen')}${tx('le','lEnd','Reactieproducten')}</div>
    ${at?tx('la','lAtoms','Losse atomen'):`<div class="row"><label for="lts">Geactiveerde toestand</label><div style="display:flex;gap:8px"><input type="text" id="lts" data-k="lTS" value="${esc(ed.lTS)}">${seg('showTS',[['on','Aan'],['off','Uit']],ed.showTS)}</div></div>
    ${two?tx('lin','lInt','Tussenproduct'):''}`}
    <div class="row"><span class="lab">Getallen op de as</span>${seg('nums',[['off','Nee (schematisch)'],['on','Ja']],ed.nums)}</div>
    <div class="two">${tx('yl','yLabel','Label y-as')}${tx('un','unit','Eenheid')}</div>
    ${tx('xl','xLabel','Label x-as','leeg = geen')}
    ${tx('et','title','Titel','leeg = geen')}${tx('ec','caption','Onderschrift')}
  </div>`;
}
const ED={key:'sf.energie',st:()=>ed,build:buildED,panel:edPanel,
  onChange:k=>{['steps','E0','E1','Ea','Ei','Ea2','EaCat','Eat'].forEach(x=>ed[x]=+ed[x])},
  act:(a,b)=>{if(a==='preset')Object.assign(ed,ED_PRESETS[b.dataset.p][1])}};

GEN.energie=()=>mountGen(ED);
