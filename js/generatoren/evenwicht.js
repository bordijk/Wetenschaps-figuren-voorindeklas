/* ---------- Dynamisch evenwicht ---------- */
// Simulatie van A + B ⇌ AB.
// Heen: een A- en een B-deeltje botsen; is de botsing heftig genoeg (relatieve snelheid² boven de drempel), dan ontstaat AB.
// Terug: een AB-deeltje valt uit elkaar; de kans per seconde hangt van de temperatuur af.
// De heengaande reactie is exotherm: bij een hogere temperatuur verschuift het evenwicht naar links.
// Een katalysator verlaagt beide activeringsenergieën evenveel: het evenwicht wordt sneller bereikt, maar ligt op dezelfde plek.
const EQ_W=500,EQ_H=300,EQ_R=5,EQ_RC=8;     // vat; straal van A en B; botsstraal van AB
const EQ_SIG=60;                             // snelheidsschaal (px/s) bij 20 °C
const EQ_AF=1.5,EQ_AB=3.5,EQ_CAT=.9,EQ_CATB=.76;   // activeringsenergie heen en terug (eenheden van de warmtebeweging bij 20 °C) en de verlaging door een katalysator;
                                                // EQ_CATB is zo gekozen dat het evenwicht met en zonder katalysator op dezelfde plek ligt (gemeten)
const EQ_KB0=8;                              // terugreactie: kans per seconde = EQ_KB0 · e^(−Ea/θ)
const EQ0={t:20,n:60,start:'ab',cat:'off',slow:'1',eqn:'on',g1:'on',g2:'on',track:'on',flash:'on',count:'on',legend:'on',color:'bw',
  labA:'A',labB:'B',labC:'AB',title:'',caption:'',recLen:'10'};
let eq;try{eq=JSON.parse(localStorage.getItem('sf.evenwicht')||'null')}catch(e){}eq=Object.assign(clone(EQ0),eq||{});
let eqS=null,eqRAF=0,eqLast=0,eqRec=null;
let eqRun=!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);

const eqTheta=()=>(+eq.t+40)/60;   // 'temperatuur' van het model: 1 bij 20 °C
function eqKick(p,r){const s=EQ_SIG*Math.sqrt(eqTheta()/(p.k==='C'?2:1)),v=s*Math.sqrt(-2*Math.log(1-r())),a=r()*2*Math.PI;p.vx=v*Math.cos(a);p.vy=v*Math.sin(a)}
function eqAdd(k,tr){const r=eqS.r,R=k==='C'?EQ_RC:EQ_R,p={k,x:R+r()*(EQ_W-2*R),y:R+r()*(EQ_H-2*R),tr:!!tr};eqKick(p,r);eqS.m.push(p);return p}
function eqReset(seed){
  eqS={r:rng(seed||Math.floor(Math.random()*1e9)),m:[],time:0,fT:[],bT:[],hist:[],next:0,dtH:.25,flash:[],trN:0,nf:0,nb:0};
  const n=+eq.n;
  if(eq.start==='c')for(let i=0;i<n;i++)eqAdd('C',i===0);
  else for(let i=0;i<n;i++){eqAdd('A',i===0);eqAdd('B')}
  eqSample()}
const eqCount=k=>eqS.m.filter(p=>p.k===k).length;
const eqRate=a=>eqS.time>0?a.length/Math.min(3,eqS.time):0;   // reacties per seconde, over de laatste 3 s
function eqSample(){const S=eqS;S.hist.push({t:S.time,A:eqCount('A'),B:eqCount('B'),C:eqCount('C'),f:eqRate(S.fT),b:eqRate(S.bT)});S.next=S.time+S.dtH;
  if(S.hist.length>800){S.hist=S.hist.filter((h,i)=>i%2===0||i===S.hist.length-1);S.dtH*=2}}

function eqStep(dt){const S=eqS,r=S.r,th=eqTheta(),cat=eq.cat==='on'?EQ_CAT:0;
  const Xf=4*EQ_SIG*EQ_SIG*(EQ_AF-cat),kb=EQ_KB0*Math.exp(-(EQ_AB-(cat?EQ_CATB:0))/th);
  S.time+=dt;S.flash.forEach(f=>f.life-=dt);S.flash=S.flash.filter(f=>f.life>0);
  const born=[];
  for(const p of S.m){
    if(r()<dt*1.5)eqKick(p,r);   // botsingen met het oplosmiddel houden de temperatuur constant
    p.x+=p.vx*dt;p.y+=p.vy*dt;const R=p.k==='C'?EQ_RC:EQ_R;
    if(p.x<R){p.x=R;p.vx=Math.abs(p.vx)}if(p.x>EQ_W-R){p.x=EQ_W-R;p.vx=-Math.abs(p.vx)}
    if(p.y<R){p.y=R;p.vy=Math.abs(p.vy)}if(p.y>EQ_H-R){p.y=EQ_H-R;p.vy=-Math.abs(p.vy)}
    if(p.k==='C'&&r()<kb*dt){   // teruggaande reactie: AB → A + B
      const a=r()*2*Math.PI,ux=Math.cos(a),uy=Math.sin(a),b={k:'B',x:p.x-ux*EQ_R,y:p.y-uy*EQ_R,tr:false};
      p.k='A';p.x+=ux*EQ_R;p.y+=uy*EQ_R;eqKick(p,r);eqKick(b,r);
      const s=EQ_SIG*Math.sqrt(th)*.7;p.vx+=ux*s;p.vy+=uy*s;b.vx-=ux*s;b.vy-=uy*s;born.push(b);
      S.nb++;S.bT.push(S.time);S.flash.push({x:p.x-ux*EQ_R,y:p.y-uy*EQ_R,f:false,life:.6});if(p.tr)S.trN++}
  }
  S.m.push(...born);
  // botsingen tussen deeltjes: via een rooster alleen buren controleren
  const CS=20,grid=new Map();S.m.forEach((p,i)=>{const k=Math.floor(p.x/CS)*1000+Math.floor(p.y/CS);let c=grid.get(k);if(!c)grid.set(k,c=[]);c.push(i)});
  const dead=new Set(),made=[];
  S.m.forEach((p,i)=>{const gi=Math.floor(p.x/CS),gj=Math.floor(p.y/CS);
    for(let a=gi-1;a<=gi+1;a++)for(let b=gj-1;b<=gj+1;b++){const cell=grid.get(a*1000+b);if(!cell)continue;
      for(const j of cell){if(j<=i||dead.has(i)||dead.has(j))continue;const q=S.m[j];
        const Rp=p.k==='C'?EQ_RC:EQ_R,Rq=q.k==='C'?EQ_RC:EQ_R,dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d>=Rp+Rq||d===0)continue;
        const nx=dx/d,ny=dy/d,dvx=q.vx-p.vx,dvy=q.vy-p.vy,vn=dvx*nx+dvy*ny;
        const ov=(Rp+Rq-d)/2;p.x-=nx*ov;p.y-=ny*ov;q.x+=nx*ov;q.y+=ny*ov;
        if(vn>=0)continue;
        if(((p.k==='A'&&q.k==='B')||(p.k==='B'&&q.k==='A'))&&dvx*dvx+dvy*dvy>=Xf){   // heengaande reactie: A + B → AB
          const tr=(p.k==='A'?p:q).tr;made.push({k:'C',x:(p.x+q.x)/2,y:(p.y+q.y)/2,vx:(p.vx+q.vx)/2,vy:(p.vy+q.vy)/2,tr});dead.add(i);dead.add(j);
          S.nf++;S.fT.push(S.time);S.flash.push({x:(p.x+q.x)/2,y:(p.y+q.y)/2,f:true,life:.6});if(tr)S.trN++;continue}
        const mp=p.k==='C'?2:1,mq=q.k==='C'?2:1,k=2*vn/(1/mp+1/mq);   // elastische botsing
        p.vx+=k/mp*nx;p.vy+=k/mp*ny;q.vx-=k/mq*nx;q.vy-=k/mq*ny}}});
  if(dead.size)S.m=S.m.filter((p,i)=>!dead.has(i));S.m.push(...made);
  const old=S.time-3;while(S.fT.length&&S.fT[0]<old)S.fT.shift();while(S.bT.length&&S.bT[0]<old)S.bT.shift();
  if(S.time>=S.next)eqSample();
}
// Evenwicht: heen en terug ongeveer even snel en het aantal AB verandert de laatste 5 s nauwelijks
function eqStatus(){const S=eqS,h=S.hist;if(S.time<6||h.length<3)return null;
  const f=eqRate(S.fT),b=eqRate(S.bT),C=eqCount('C'),past=h.find(x=>x.t>=S.time-5)||h[0];
  return Math.abs(f-b)<=.25*(f+b)/2+.7&&Math.abs(C-past.C)<=.08*(+eq.n)+2}

/* ---------- Animatie ---------- */
function eqFrame(ts){if(!eqRun||route()!=='evenwicht'){eqRAF=0;if(eqRec)eqRecStop();return}
  const st=(eqLast?Math.min(.05,(ts-eqLast)/1000):0)*+eq.slow;eqLast=ts;
  const vmax=eqS.m.reduce((m,p)=>Math.max(m,Math.hypot(p.vx,p.vy)),1),n=Math.max(1,Math.ceil(vmax*st/3));
  for(let i=0;i<n;i++)eqStep(st/n);
  const svg=buildEQ(),el=document.getElementById('paper');if(el)el.innerHTML=svg;
  if(eqRec&&!recFrame(eqRec,svg)){eqRec=null;EVEN.refresh&&EVEN.refresh()}
  eqRAF=requestAnimationFrame(eqFrame)}
function eqPlay(){if(eqRun&&!eqRAF&&typeof requestAnimationFrame==='function'){eqLast=0;eqRAF=requestAnimationFrame(eqFrame)}}
function eqRecStop(){if(!eqRec)return;recStop(eqRec);eqRec=null;EVEN.refresh&&EVEN.refresh()}

/* ---------- Figuur ---------- */
function eqStyle(){const col=eq.color==='color';return{
  A:col?'fill="#2f6fd6" stroke="#123a7a"':'fill="#1a1a1a" stroke="#000"',B:col?'fill="#f08a4b" stroke="#8a3a0c"':'fill="#fff" stroke="#000"',
  tr:col?'#d4a000':'#000',fwd:col?'#2e8b3a':'#000',bwd:col?'#c0392b':'#000',
  line:{A:[col?'#2f6fd6':'#000',''],B:[col?'#e0662b':'#000','8 4'],C:[col?'#7b3fa0':'#000','1.5 3.5'],f:[col?'#2e8b3a':'#000',''],b:[col?'#c0392b':'#000','8 4']}}}
const eqDot=(x,y,k,C)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${EQ_R}" ${C[k]} stroke-width="1.2"/>`;
const eqStar=(x,y,c)=>{let d='';for(let i=0;i<6;i++){const a=i*Math.PI/3+.3;d+=`M${r1(x+3*Math.cos(a))} ${r1(y+3*Math.sin(a))}L${r1(x+10*Math.cos(a))} ${r1(y+10*Math.sin(a))}`}
  return `<path d="${d}" stroke="${c}" stroke-width="2" stroke-linecap="round" fill="none"/>`};
const eqRing=(x,y,c)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="10" fill="none" stroke="${c}" stroke-width="1.8" stroke-dasharray="3 2.5"/>`;
const eqTrRing=(x,y,c)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="9" fill="none" stroke="${c}" stroke-width="2.2"/>`;
function eqPlot(y0,ylab,keys,floor){const ML=46,MR=30,MT=34,H=120,w=EQ_W-ML-MR,hist=eqS.hist,C=eqStyle();
  const tmax=Math.max(20,Math.ceil(eqS.time/10)*10),xs=niceStep(tmax,5);
  const top=Math.max(floor,...keys.flatMap(k=>hist.map(h=>h[k]))),ys=niceStep(top,4),ymax=Math.ceil(top/ys)*ys;
  const X=t=>ML+t/tmax*w,Y=v=>MT+H-v/ymax*H;let s=axesArrows(ML,MT,w,H);
  for(let t=xs;t<=tmax+1e-9;t+=xs)s+=`<line x1="${r1(X(t))}" y1="${MT+H}" x2="${r1(X(t))}" y2="${MT+H+5}" stroke="#000" stroke-width="1.2"/>`+fmt(nlNum(t),X(t),MT+H+19,12,'middle');
  for(let v=0;v<=ymax+1e-9;v+=ys)s+=`<line x1="${ML-5}" y1="${r1(Y(v))}" x2="${ML}" y2="${r1(Y(v))}" stroke="#000" stroke-width="1.2"/>`+fmt(nlNum(v,1),ML-8,Y(v)+4,12,'end');
  s+=fmt(ylab,ML+12,MT-14,12)+fmt('tijd (s)',ML+w+22,MT+H+33,12,'end');
  keys.forEach(k=>{const[c,da]=C.line[k];
    s+=`<polyline points="${hist.map(h=>r1(X(h.t))+','+r1(Y(h[k]))).join(' ')}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${da?` stroke-dasharray="${da}"`:''}/>`});
  return{s:`<g transform="translate(16,${y0})">${s}</g>`,h:MT+H+38}}
// Legenda-regel: items [{icon, tekst}] naast elkaar, met terugloop naar een nieuwe regel
function eqLegend(items,y,W){let x=16,body='';y+=22;
  items.forEach(([icon,iw,lab])=>{const w=iw+6+textW(lab,13)+22;if(x+w>W-16&&x>16){x=16;y+=22}body+=icon(x,y-4.5)+fmt(lab,x+iw+6,y,13);x+=w});
  return{body,y}}
const eqLineIcon=k=>(x,y)=>{const[c,da]=eqStyle().line[k];return `<line x1="${x}" y1="${y}" x2="${x+24}" y2="${y}" stroke="${c}" stroke-width="2" stroke-linecap="round"${da?` stroke-dasharray="${da}"`:''}/>`};
function buildEQ(){if(!eqS)eqReset(1);lastWarn=[];
  const C=eqStyle(),M=16,W=EQ_W+2*M;let top=M,body='';
  if(eq.title){body+=fmt(eq.title,M,top+16,17,'start','font-weight="700"');top+=30}
  if(eq.eqn==='on'){body+=fmt(`${eq.labA} + ${eq.labB} ⇌ ${eq.labC}`,W/2,top+18,18,'middle');top+=32}
  let g='';
  eqS.m.forEach(p=>{if(p.k!=='C'){g+=eqDot(p.x,p.y,p.k,C);if(p.tr&&eq.track==='on')g+=eqTrRing(p.x,p.y,C.tr);return}
    const v=Math.hypot(p.vx,p.vy),ux=v>1?p.vx/v:1,uy=v>1?p.vy/v:0,ax=p.x+ux*EQ_R*.72,ay=p.y+uy*EQ_R*.72;
    g+=eqDot(ax,ay,'A',C)+eqDot(p.x-ux*EQ_R*.72,p.y-uy*EQ_R*.72,'B',C);if(p.tr&&eq.track==='on')g+=eqTrRing(ax,ay,C.tr)});
  if(eq.flash==='on')eqS.flash.forEach(f=>{g+=f.f?eqStar(f.x,f.y,C.fwd):eqRing(f.x,f.y,C.bwd)});
  body+=`<svg x="${M}" y="${top}" width="${EQ_W}" height="${EQ_H}" viewBox="0 0 ${EQ_W} ${EQ_H}" overflow="hidden"><rect width="${EQ_W}" height="${EQ_H}" fill="#fff"/>${g}</svg>`;
  body+=`<rect x="${M}" y="${top}" width="${EQ_W}" height="${EQ_H}" fill="none" stroke="#000" stroke-width="1.6"/>`;
  let y=top+EQ_H;
  if(eq.count==='on'){const st=eqStatus();
    y+=22;body+=fmt(`Temperatuur: ${eq.t} °C  ·  Tijd: ${nlNum(eqS.time,1)} s  ·  ${eq.labA}: ${eqCount('A')}  ·  ${eq.labB}: ${eqCount('B')}  ·  ${eq.labC}: ${eqCount('C')}`,M,y,13);
    y+=19;body+=fmt(`Reacties per seconde: heen ${nlNum(eqRate(eqS.fT),1)}  ·  terug ${nlNum(eqRate(eqS.bT),1)}`,M,y,13);
    if(eq.track==='on'){y+=19;body+=fmt(`Het omcirkelde ${eq.labA}-deeltje heeft al ${eqS.trN} keer gereageerd (heen of terug).`,M,y,13)}
    y+=21;body+=fmt(st==null?'Even wachten …':st?'Evenwicht: heen en terug verlopen even snel. Beide reacties gaan gewoon door.':'Nog geen evenwicht: de reacties heen en terug verlopen nog niet even snel.',M,y,13,'start','font-weight="700"')}
  if(eq.legend==='on'){const R=eqLegend([
      [(x,y)=>eqDot(x+EQ_R,y,'A',C),2*EQ_R,eq.labA],[(x,y)=>eqDot(x+EQ_R,y,'B',C),2*EQ_R,eq.labB],
      [(x,y)=>eqDot(x+EQ_R,y,'A',C)+eqDot(x+2.44*EQ_R,y,'B',C),3.5*EQ_R,eq.labC],
      ...(eq.track==='on'?[[(x,y)=>eqDot(x+9,y,'A',C)+eqTrRing(x+9,y,C.tr),18,'gevolgd deeltje']]:[]),
      ...(eq.flash==='on'?[[(x,y)=>eqStar(x+10,y,C.fwd),20,'reactie heen'],[(x,y)=>eqRing(x+10,y,C.bwd),20,'reactie terug']]:[])],y+4,W);
    body+=R.body;y=R.y}
  if(eq.g1==='on'){const G=eqPlot(y+10,'aantal deeltjes',['A','B','C'],+eq.n);body+=G.s;y+=10+G.h;
    const R=eqLegend([[eqLineIcon('A'),24,eq.labA],[eqLineIcon('B'),24,eq.labB],[eqLineIcon('C'),24,eq.labC]],y-6,W);body+=R.body;y=R.y}
  if(eq.g2==='on'){const G=eqPlot(y+14,'reactiesnelheid (reacties per s)',['f','b'],2);body+=G.s;y+=14+G.h;
    const R=eqLegend([[eqLineIcon('f'),24,'heengaande reactie'],[eqLineIcon('b'),24,'teruggaande reactie']],y-6,W);body+=R.body;y=R.y}
  if(eq.caption){y+=26;body+=fmt(eq.caption,W/2,y,15,'middle')}
  return svgWrap(W,y+M,body);
}

/* ---------- Paneel ---------- */
function eqSetText(id,t){const el=document.getElementById(id);if(el)el.textContent=t}
const eqNText=()=>eq.start==='c'?`${eq.n} ${eq.labC}`:`${eq.n} ${eq.labA} en ${eq.n} ${eq.labB}`;
function eqPanel(){const lA=esc(eq.labA),lB=esc(eq.labB),lC=esc(eq.labC);
  return `<div class="sec"><h3>Instellen</h3>
    <div class="row"><span class="lab">Beginnen met</span>${seg('start',[['ab',`Alleen ${lA} en ${lB}`],['c',`Alleen ${lC}`]],eq.start)}</div>
    <div class="row"><label for="eqN">Aantal deeltjes bij het begin: <span id="eqNv">${esc(eqNText())}</span></label><input type="range" id="eqN" min="20" max="120" step="10" data-k="n" data-num value="${eq.n}"></div>
    <div class="row"><label for="eqT">Temperatuur: <span id="eqTv">${eq.t} °C</span></label><input type="range" id="eqT" min="0" max="100" step="5" data-k="t" data-num value="${eq.t}"></div>
    <div class="row"><span class="lab">Katalysator</span>${seg('cat',[['off','Zonder'],['on','Met']],eq.cat)}</div>
    <p class="hint" style="margin:0">Heen: ${lA} en ${lB} botsen met genoeg energie en vormen ${lC}. Terug: ${lC} valt uit elkaar. Bij evenwicht gaan beide reacties door, even snel; daarom blijven de aantallen (gemiddeld) gelijk. De heengaande reactie is exotherm: bij een hogere temperatuur ligt het evenwicht meer links. Een katalysator versnelt beide reacties evenveel: het evenwicht stelt zich sneller in, maar ligt op dezelfde plek.</p></div>
  <div class="sec"><h3>Evenwicht verstoren</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" data-act="add" data-val="A">+20 ${lA}</button><button class="btn" data-act="add" data-val="B">+20 ${lB}</button>
      <button class="btn" data-act="add" data-val="C">+20 ${lC}</button><button class="btn" data-act="del" data-val="C">−20 ${lC}</button></div>
    <p class="hint" style="margin:0">Voeg tijdens de simulatie deeltjes toe of haal ${lC} weg, of verander de temperatuur, en kijk hoe zich een nieuw evenwicht instelt.</p></div>
  <div class="sec"><h3>Simulatie</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="play">${eqRun?'Pauze':'Start'}</button><button class="btn" data-act="reset">Opnieuw</button></div>
    <div class="row"><span class="lab">Afspeelsnelheid</span>${seg('slow',[['0.3','Vertraagd'],['1','Normaal'],['2','Versneld']],eq.slow)}</div>
    <div class="row"><span class="lab">Animatie downloaden (lengte)</span>${seg('recLen',[['5','5 s'],['10','10 s'],['20','20 s']],eq.recLen)}</div>
    <div><button class="btn" data-act="rec" ${eqRec?'disabled':''}>${eqRec?'Opname loopt …':'Neem op en download filmpje'}</button></div>
    <p class="hint" style="margin:0">Het filmpje wordt een MP4 (in sommige browsers WebM); een MP4 kun je zo in PowerPoint zetten. Pauzeer op een mooi moment om de figuur te kopiëren.</p></div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Grafiek: aantal deeltjes</span>${seg('g1',[['on','Aan'],['off','Uit']],eq.g1)}</div>
    <div class="row"><span class="lab">Grafiek: reactiesnelheid heen en terug</span>${seg('g2',[['on','Aan'],['off','Uit']],eq.g2)}</div>
    <div class="row"><span class="lab">Eén ${lA}-deeltje volgen</span>${seg('track',[['on','Aan'],['off','Uit']],eq.track)}</div>
    <div class="row"><span class="lab">Reacties markeren</span>${seg('flash',[['on','Aan'],['off','Uit']],eq.flash)}</div>
    <div class="row"><span class="lab">Reactievergelijking boven de figuur</span>${seg('eqn',[['on','Aan'],['off','Uit']],eq.eqn)}</div>
    <div class="row"><span class="lab">Tellers onder het vat</span>${seg('count',[['on','Aan'],['off','Uit']],eq.count)}</div>
    <div class="row"><span class="lab">Legenda</span>${seg('legend',[['on','Aan'],['off','Uit']],eq.legend)}</div>
    <div class="row"><span class="lab">Kleur</span>${seg('color',[['bw','Zwart-wit'],['color','Kleur']],eq.color)}</div>
    <div class="two"><div class="row"><label for="eqLA">Naam A</label><input type="text" id="eqLA" data-k="labA" value="${lA}"></div>
      <div class="row"><label for="eqLB">Naam B</label><input type="text" id="eqLB" data-k="labB" value="${lB}"></div></div>
    <div class="row"><label for="eqLC">Naam AB (bijv. N_2O_4 of HI)</label><input type="text" id="eqLC" data-k="labC" value="${lC}"></div>
    <div class="row"><label for="eqTit">Titel (leeg = geen)</label><input type="text" id="eqTit" data-k="title" value="${esc(eq.title)}"></div>
    <div class="row"><label for="eqCap">Onderschrift (bijv. A, B, C of D)</label><input type="text" id="eqCap" data-k="caption" value="${esc(eq.caption)}"></div></div>`;
}
const EVEN={key:'sf.evenwicht',st:()=>eq,build:buildEQ,view:()=>{if(!eqS)eqReset();eqPlay();return buildEQ()},panel:eqPanel,
  onChange:k=>{eq.t=+eq.t;eq.n=+eq.n;if(!eqS)eqReset();
    if(k==='t')eqSetText('eqTv',eq.t+' °C');
    if(k==='n'){eqSetText('eqNv',eqNText());eqReset()}
    if(k==='start')eqReset()},
  act:(a,b)=>{
    if(a==='play'){eqRun=!eqRun;if(!eqRun&&eqRec)eqRecStop();eqPlay()}
    if(a==='reset')eqReset();
    if(a==='add')for(let i=0;i<20;i++)eqAdd(b.dataset.val);
    if(a==='del'){const C=eqS.m.filter(p=>p.k==='C'&&!p.tr).slice(0,20);eqS.m=eqS.m.filter(p=>!C.includes(p))}
    if(a==='rec'&&!eqRec){eqRec=recStart(buildEQ(),+eq.recLen,'dynamisch-evenwicht');if(eqRec){eqRun=true;eqPlay()}}}};

GEN.evenwicht=()=>mountGen(EVEN);
