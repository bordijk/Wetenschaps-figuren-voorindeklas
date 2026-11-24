/* ---------- Botsende-deeltjesmodel ---------- */
// Simulatie: opgeloste deeltjes bewegen door een vat en botsen tegen een vaste stof. Een botsing is effectief als het
// deeltje genoeg energie heeft (v² boven de drempel = activeringsenergie); dan reageert het deeltje van de vaste stof
// en wordt het opgeloste deeltje een reactieproduct. build() tekent het huidige moment, dus elk moment is als figuur te kopiëren.
const BO_W=460,BO_H=280,BO_RA=6,BO_RS=8,BO_RP=5,BO_NS=36;   // vat, stralen (opgelost, vaste stof, product), deeltjes vaste stof
const BO_VA2=14300;   // drempel voor v²: bij 20 °C is ongeveer 1 op de 10 botsingen effectief
const BO0={t:20,c:3,div:'1',cat:'off',slow:'1',flash:'on',arrows:'off',count:'on',legend:'on',color:'bw',
  labA:'opgelost deeltje',labS:'deeltje van de vaste stof',labP:'reactieproduct',title:'',caption:''};
let bo;try{bo=JSON.parse(localStorage.getItem('sf.botsing')||'null')}catch(e){}bo=Object.assign(clone(BO0),bo||{});
let boS=null,boLog=[],boRAF=0,boLast=0;
let boRun=!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);

// Snelheden volgen een (2D) Maxwell-verdeling; de breedte groeit met de temperatuur (uitvergroot, zodat het effect goed te zien is)
const boSigma=()=>7.2*Math.sqrt(+bo.t+40);
const boVa2=()=>bo.cat==='on'?BO_VA2*.5:BO_VA2;
const boNA=()=>8*+bo.c;
function boKick(p,r){const v=boSigma()*Math.sqrt(-2*Math.log(1-r())),a=r()*2*Math.PI;p.vx=v*Math.cos(a);p.vy=v*Math.sin(a)}
// Vaste stof: 36 deeltjes als 1 blok van 6×6, 4 blokjes van 3×3, 9 blokjes van 2×2 of 36 losse deeltjes (poeder)
function boSolid(){const g=Math.round(Math.sqrt(+bo.div)),k=6/g,out=[];
  for(let i=0;i<g;i++)for(let j=0;j<g;j++){const cx=(i+.5)*BO_W/g,cy=(j+.5)*BO_H/g;
    for(let a=0;a<k;a++)for(let b=0;b<k;b++)out.push({x:cx+(a-(k-1)/2)*2*BO_RS,y:cy+(b-(k-1)/2)*2*BO_RS,on:true})}
  return out}
function boFree(r){for(let i=0;i<300;i++){const x=BO_RA+r()*(BO_W-2*BO_RA),y=BO_RA+r()*(BO_H-2*BO_RA);
  if(boS.solid.every(s=>!s.on||Math.hypot(s.x-x,s.y-y)>BO_RS+BO_RA+2))return{x,y}}return{x:BO_RA,y:BO_RA}}
function boAddA(){const p=Object.assign(boFree(boS.r),{k:'A'});boKick(p,boS.r);boS.m.push(p)}
function boReset(seed){
  boS={r:rng(seed||Math.floor(Math.random()*1e9)),solid:boSolid(),m:[],time:0,hits:0,eff:0,effT:[],hitT:[],flash:[],half:null,sig:boSigma()};
  for(let i=0;i<boNA();i++)boAddA()}
const boLeft=()=>boS.solid.filter(s=>s.on).length;

function boStep(dt){const S=boS,r=S.r,va2=boVa2();S.time+=dt;
  S.flash.forEach(f=>f.life-=dt);S.flash=S.flash.filter(f=>f.life>0);
  for(const p of S.m){const rad=p.k==='A'?BO_RA:BO_RP;p.x+=p.vx*dt;p.y+=p.vy*dt;
    const wall=p.x<rad||p.x>BO_W-rad||p.y<rad||p.y>BO_H-rad;
    if(wall&&r()<.3)boKick(p,r);   // botsing met de wand of met watermoleculen: nieuwe snelheid volgens de temperatuur
    if(p.x<rad){p.x=rad;p.vx=Math.abs(p.vx)}if(p.x>BO_W-rad){p.x=BO_W-rad;p.vx=-Math.abs(p.vx)}
    if(p.y<rad){p.y=rad;p.vy=Math.abs(p.vy)}if(p.y>BO_H-rad){p.y=BO_H-rad;p.vy=-Math.abs(p.vy)}
    for(const s of S.solid){if(!s.on)continue;const dx=p.x-s.x,dy=p.y-s.y,d=Math.hypot(dx,dy),R=rad+BO_RS;if(d>=R||d===0)continue;
      const nx=dx/d,ny=dy/d,vn=p.vx*nx+p.vy*ny;p.x=s.x+nx*R;p.y=s.y+ny*R;if(vn>=0)continue;
      if(p.k==='A'){S.hits++;S.hitT.push(S.time);
        if(p.vx*p.vx+p.vy*p.vy>=va2){   // effectieve botsing: genoeg energie
          S.eff++;S.effT.push(S.time);s.on=false;p.k='P';S.flash.push({x:s.x,y:s.y,eff:true,life:.7});boKick(p,r);break}
        S.flash.push({x:s.x+nx*BO_RS,y:s.y+ny*BO_RS,eff:false,life:.3})}
      p.vx-=2*vn*nx;p.vy-=2*vn*ny;break}
  }
  if(S.half==null&&boLeft()<=BO_NS/2)S.half=S.time;
  const old=S.time-5;while(S.hitT.length&&S.hitT[0]<old)S.hitT.shift();while(S.effT.length&&S.effT[0]<old)S.effT.shift();
}
const boRate=a=>boS.time>0?a.length/Math.min(5,boS.time):0;   // per seconde, over de laatste 5 s

/* ---------- Animatie ---------- */
function boFrame(ts){if(!boRun||route()!=='botsing'){boRAF=0;return}
  const st=(boLast?Math.min(.05,(ts-boLast)/1000):0)*+bo.slow;boLast=ts;
  const vmax=boS.m.reduce((m,p)=>Math.max(m,Math.hypot(p.vx,p.vy)),1),n=Math.max(1,Math.ceil(vmax*st/3));
  for(let i=0;i<n;i++)boStep(st/n);
  const el=document.getElementById('paper');if(el)el.innerHTML=buildBO();
  boRAF=requestAnimationFrame(boFrame)}
function boPlay(){if(boRun&&!boRAF&&typeof requestAnimationFrame==='function'){boLast=0;boRAF=requestAnimationFrame(boFrame)}}

/* ---------- Figuur ---------- */
function boColors(){return bo.color==='color'
  ?{A:'fill="#2f6fd6" stroke="#123a7a"',S:'fill="#d9a441" stroke="#6b4a10"',P:'fill="#5cb85c" stroke="#1f5a1f"',hit:'#e0301e'}
  :{A:'fill="#1a1a1a" stroke="#000"',S:'fill="#c4c4c4" stroke="#000"',P:'fill="#fff" stroke="#000"',hit:'#000'}}
function boArrow(x,y,vx,vy){const k=.17,x2=x+vx*k,y2=y+vy*k,L=Math.hypot(x2-x,y2-y);if(L<8)return'';const ux=(x2-x)/L,uy=(y2-y)/L;
  return `<line x1="${r1(x+ux*7)}" y1="${r1(y+uy*7)}" x2="${r1(x2-ux*4)}" y2="${r1(y2-uy*4)}" stroke="#000" stroke-width="1.2"/><polygon points="${r1(x2)},${r1(y2)} ${r1(x2-ux*6-uy*3)},${r1(y2-uy*6+ux*3)} ${r1(x2-ux*6+uy*3)},${r1(y2-uy*6-ux*3)}" fill="#000"/>`}
function buildBO(){if(!boS)boReset(1);lastWarn=[];
  const C=boColors(),M=16,W=BO_W+2*M;let top=M,body='';
  if(bo.title){body+=fmt(bo.title,M,top+16,17,'start','font-weight="700"');top+=32}
  let g=`<rect x="0" y="0" width="${BO_W}" height="${BO_H}" fill="#fff"/>`;
  boS.solid.forEach(s=>{if(s.on)g+=`<circle cx="${r1(s.x)}" cy="${r1(s.y)}" r="${BO_RS}" ${C.S} stroke-width="1.2"/>`});
  boS.m.forEach(p=>{g+=p.k==='A'?`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${BO_RA}" ${C.A} stroke-width="1"/>`:`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${BO_RP}" ${C.P} stroke-width="1.4"/>`;
    if(bo.arrows==='on')g+=boArrow(p.x,p.y,p.vx,p.vy)});
  if(bo.flash==='on')boS.flash.forEach(f=>{
    if(f.eff){let d='';for(let i=0;i<8;i++){const a=i*Math.PI/4;d+=`M${r1(f.x+4*Math.cos(a))} ${r1(f.y+4*Math.sin(a))}L${r1(f.x+13*Math.cos(a))} ${r1(f.y+13*Math.sin(a))}`}
      g+=`<path d="${d}" stroke="${C.hit}" stroke-width="2.2" stroke-linecap="round" fill="none"/>`}
    else g+=`<circle cx="${r1(f.x)}" cy="${r1(f.y)}" r="5" fill="none" stroke="#666" stroke-width="1.2" stroke-dasharray="2 2"/>`});
  body+=`<svg x="${M}" y="${top}" width="${BO_W}" height="${BO_H}" viewBox="0 0 ${BO_W} ${BO_H}" overflow="hidden">${g}</svg>`;
  body+=`<rect x="${M}" y="${top}" width="${BO_W}" height="${BO_H}" fill="none" stroke="#000" stroke-width="1.6"/>`;
  let y=top+BO_H;
  if(bo.count==='on'){
    y+=22;body+=fmt(`Temperatuur: ${bo.t} °C  ·  Tijd: ${nlNum(boS.time,1)} s  ·  Gereageerd: ${BO_NS-boLeft()} van ${BO_NS} deeltjes`,M,y,13);
    y+=19;body+=fmt(`Botsingen per seconde: ${nlNum(boRate(boS.hitT),1)}  ·  Effectieve botsingen per seconde: ${nlNum(boRate(boS.effT),1)}`,M,y,13)}
  if(bo.legend==='on'){y+=26;let x=M;
    [['A',BO_RA,bo.labA],['S',BO_RS,bo.labS],['P',BO_RP,bo.labP]].forEach(([k,rad,lab])=>{if(!lab)return;const w=2*rad+8+textW(lab,13)+22;
      if(x+w>W-M&&x>M){x=M;y+=22}
      body+=`<circle cx="${x+rad}" cy="${y-4.5}" r="${rad}" ${C[k]} stroke-width="${k==='P'?1.4:1.1}"/>`+fmt(lab,x+2*rad+6,y,13);x+=w})}
  if(bo.caption){y+=26;body+=fmt(bo.caption,W/2,y,15,'middle')}
  return svgWrap(W,y+M,body);
}

/* ---------- Paneel ---------- */
function boSetText(id,t){const el=document.getElementById(id);if(el)el.textContent=t}
function boPanel(){
  return `<div class="sec"><h3>Instellen</h3>
    <div class="row"><label for="boT">Temperatuur: <span id="boTv">${bo.t} °C</span></label><input type="range" id="boT" min="0" max="100" step="5" data-k="t" data-num value="${bo.t}"></div>
    <div class="row"><label for="boC">Concentratie: <span id="boCv">${boNA()} opgeloste deeltjes</span></label><input type="range" id="boC" min="1" max="5" step="1" data-k="c" data-num value="${bo.c}"></div>
    <div class="row"><span class="lab">Verdelingsgraad van de vaste stof</span>${seg('div',[['1','1 blok'],['4','4 stukjes'],['9','9 stukjes'],['36','Poeder']],bo.div)}</div>
    <div class="row"><span class="lab">Katalysator</span>${seg('cat',[['off','Zonder'],['on','Met']],bo.cat)}</div>
    <p class="hint" style="margin:0">Een botsing is effectief als het deeltje genoeg energie heeft (meer dan de activeringsenergie). Bij een hogere temperatuur bewegen de deeltjes sneller: er zijn meer botsingen én een groter deel ervan is effectief. Een fijnere verdeling geeft meer deeltjes aan het oppervlak. Een katalysator verlaagt de activeringsenergie. De snelheden zijn uitvergroot, zodat het verschil goed te zien is.</p></div>
  <div class="sec"><h3>Simulatie</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="play">${boRun?'Pauze':'Start'}</button><button class="btn" data-act="reset">Opnieuw</button>
      <button class="btn" data-act="note">Noteer meting</button>${boLog.length?'<button class="btn" data-act="clearlog">Wis metingen</button>':''}</div>
    <div class="row"><span class="lab">Afspeelsnelheid</span>${seg('slow',[['0.3','Vertraagd'],['1','Normaal'],['2','Versneld']],bo.slow)}</div>
    <p class="hint" style="margin:0">Pauzeer op een mooi moment en kopieer de figuur. ‘Noteer meting’ zet de huidige instellingen en uitkomsten in een tabel onder de figuur, zodat je kunt vergelijken.</p></div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Botsingen markeren</span>${seg('flash',[['on','Aan'],['off','Uit']],bo.flash)}</div>
    <div class="row"><span class="lab">Snelheidspijlen</span>${seg('arrows',[['off','Uit'],['on','Aan']],bo.arrows)}</div>
    <div class="row"><span class="lab">Tellers onder de figuur</span>${seg('count',[['on','Aan'],['off','Uit']],bo.count)}</div>
    <div class="row"><span class="lab">Legenda</span>${seg('legend',[['on','Aan'],['off','Uit']],bo.legend)}</div>
    <div class="row"><span class="lab">Kleur</span>${seg('color',[['bw','Zwart-wit'],['color','Kleur']],bo.color)}</div>
    <div class="row"><label for="boLA">Naam opgelost deeltje (bijv. H^+)</label><input type="text" id="boLA" data-k="labA" value="${esc(bo.labA)}"></div>
    <div class="row"><label for="boLS">Naam deeltje vaste stof (bijv. Zn)</label><input type="text" id="boLS" data-k="labS" value="${esc(bo.labS)}"></div>
    <div class="row"><label for="boLP">Naam reactieproduct (bijv. Zn^{2+})</label><input type="text" id="boLP" data-k="labP" value="${esc(bo.labP)}"></div>
    <div class="row"><label for="boTit">Titel (leeg = geen)</label><input type="text" id="boTit" data-k="title" value="${esc(bo.title)}"></div>
    <div class="row"><label for="boCap">Onderschrift (bijv. A, B, C of D)</label><input type="text" id="boCap" data-k="caption" value="${esc(bo.caption)}"></div></div>`;
}
const BOTS={key:'sf.botsing',st:()=>bo,build:buildBO,view:()=>{if(!boS)boReset();boPlay();return buildBO()},panel:boPanel,
  onChange:k=>{bo.t=+bo.t;bo.c=+bo.c;if(!boS)boReset();
    if(k==='t'){const f=boSigma()/boS.sig;boS.m.forEach(p=>{p.vx*=f;p.vy*=f});boS.sig=boSigma();boSetText('boTv',bo.t+' °C')}
    if(k==='c'){const A=boS.m.filter(p=>p.k==='A');for(let i=A.length;i<boNA();i++)boAddA();
      for(let i=A.length;i>boNA();i--)boS.m.splice(boS.m.indexOf(A[i-1]),1);boSetText('boCv',boNA()+' opgeloste deeltjes')}
    if(k==='div')boReset()},
  act:a=>{
    if(a==='play'){boRun=!boRun;boPlay()}
    if(a==='reset')boReset();
    if(a==='note')boLog.push({t:bo.t,n:boNA(),div:{1:'1 blok',4:'4 stukjes',9:'9 stukjes',36:'poeder'}[bo.div],cat:bo.cat==='on'?'met':'zonder',
      time:boS.time,hit:boS.time?boS.hits/boS.time:0,eff:boS.time?boS.eff/boS.time:0,half:boS.half});
    if(a==='clearlog')boLog=[]},
  extra:()=>boLog.length?`<div class="kind"><strong style="font-size:13px">Metingen</strong><div style="overflow-x:auto"><table class="bo-tab">
    <tr><th>Temperatuur</th><th>Opgeloste deeltjes</th><th>Verdelingsgraad</th><th>Katalysator</th><th>Gemeten tijd</th><th>Botsingen per s</th><th>Effectieve botsingen per s</th><th>Tijd tot de helft gereageerd</th></tr>
    ${boLog.map(m=>`<tr><td>${m.t} °C</td><td>${m.n}</td><td>${m.div}</td><td>${m.cat}</td><td>${nlNum(m.time,1)} s</td><td>${nlNum(m.hit,1)}</td><td>${nlNum(m.eff,2)}</td><td>${m.half==null?'nog niet':nlNum(m.half,1)+' s'}</td></tr>`).join('')}
    </table></div><span class="hint">De getallen gelden voor de hele meting, vanaf ‘Opnieuw’. Laat de simulatie minstens 10 s lopen voor een betrouwbare vergelijking.</span></div>`:''};

GEN.botsing=()=>mountGen(BOTS);
