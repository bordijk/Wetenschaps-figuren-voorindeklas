/* ---------- Dynamisch evenwicht ---------- */
// Simulatie van een evenwichtsreactie, te kiezen uit A ⇌ B, A + B ⇌ AB, 2 A ⇌ B en A₂ + B₂ ⇌ 2 AB.
// Reactie met twee deeltjes links (of rechts): die deeltjes botsen; is de botsing heftig genoeg (relatieve snelheid² boven de drempel),
//   dan reageren ze. Reactie met één deeltje: dat deeltje reageert vanzelf, met een kans per seconde die van de temperatuur afhangt.
// De activeringsenergieën heen en terug stel je zelf in; hun verschil is ΔE, dus daaruit volgt ook welke kant exotherm is.
// Een katalysator verlaagt beide activeringsenergieën evenveel: het evenwicht stelt zich sneller in, maar ligt op dezelfde plek.
const EQ_SIG=60;        // snelheidsschaal (px/s) bij 20 °C voor een deeltje van 1 atoom
const EQ_KU=8;          // reactie van één deeltje: kans per seconde = EQ_KU · e^(−Ea/θ)
const EQ_EU=.5;         // 1 eenheid activeringsenergie op het schuifje = 0,5 in modeleenheden (θ = 1 bij 20 °C)
const EQ_CAT=1.8;       // verlaging van beide activeringsenergieën door een katalysator (in eenheden van het schuifje)
const EQ_R1=5,EQ_R2=8;  // botsstraal van een deeltje met 1 of 2 atomen
const EQ_BW=440,EQ_BH=264;   // vat bij volume 100 %

// Reactiesoorten. sp: deeltjes en hun atomen ('a' donker, 'b' licht). f en b: heen en terug, als [links, rechts].
const EQ_TYPES={
  iso:{knop:'A ⇌ B',sp:{A:'a',B:'b'},f:[['A'],['B']],b:[['B'],['A']],lab:{A:'A',B:'B'}},
  add:{knop:'A + B ⇌ AB',sp:{A:'a',B:'b',C:'ab'},f:[['A','B'],['C']],b:[['C'],['A','B']],lab:{A:'A',B:'B',C:'AB'}},
  dim:{knop:'2 A ⇌ B',sp:{A:'a',B:'aa'},f:[['A','A'],['B']],b:[['B'],['A','A']],lab:{A:'A',B:'B'}},
  exch:{knop:'A₂ + B₂ ⇌ 2 AB',sp:{A:'aa',B:'bb',C:'ab'},f:[['A','B'],['C','C']],b:[['C','C'],['A','B']],lab:{A:'A_2',B:'B_2',C:'AB'}}
};
const EQ0={type:'add',fE:3,bE:7,t:20,n:60,V:1,start:'l',cat:'off',slow:'1',smooth:'3',eqn:'on',ed:'on',g1:'on',g2:'on',track:'on',flash:'on',
  count:'on',legend:'on',color:'bw',lab:{},title:'',caption:'',recLen:'10'};
let eq;try{eq=JSON.parse(localStorage.getItem('sf.evenwicht')||'null')}catch(e){}eq=Object.assign(clone(EQ0),eq||{});
if(!EQ_TYPES[eq.type])eq.type='add';if(eq.start!=='r')eq.start='l';
for(const[k,T]of Object.entries(EQ_TYPES))eq.lab[k]=Object.assign(clone(T.lab),eq.lab[k]||{});
let eqS=null,eqRAF=0,eqLast=0,eqRec=null;
let eqRun=!(typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches);

/* ---------- Hulpjes ---------- */
const eqT=()=>EQ_TYPES[eq.type];
const eqSp=()=>Object.keys(eqT().sp);
const eqLab=k=>eq.lab[eq.type][k]||k;
const eqMass=k=>eqT().sp[k].length;
const eqRad=k=>eqMass(k)>1?EQ_R2:EQ_R1;
const eqTheta=()=>(+eq.t+40)/60;              // 'temperatuur' van het model: 1 bij 20 °C
const eqW=()=>Math.round(EQ_BW*Math.sqrt(+eq.V)),eqH=()=>Math.round(EQ_BH*Math.sqrt(+eq.V));
function eqSide(list,txt){const c={};list.forEach(k=>c[k]=(c[k]||0)+1);return Object.entries(c).map(([k,n])=>(n>1?n+' ':'')+(txt?eqTxt(eqLab(k)):eqLab(k))).join(' + ')}
const eqEquation=txt=>eqSide(eqT().f[0],txt)+' ⇌ '+eqSide(eqT().f[1],txt);
// Voor gewone HTML-tekst: A_2 → A₂, ^{2+} → ²⁺
const EQ_SUB='₀₁₂₃₄₅₆₇₈₉',EQ_SUP={0:'⁰',1:'¹',2:'²',3:'³',4:'⁴',5:'⁵',6:'⁶',7:'⁷',8:'⁸',9:'⁹','+':'⁺','-':'⁻'};
const eqTxt=s=>String(s).replace(/_\{?(\d+)\}?/g,(m,d)=>[...d].map(c=>EQ_SUB[c]).join('')).replace(/\^\{?([\d+-]+)\}?/g,(m,d)=>[...d].map(c=>EQ_SUP[c]||c).join(''));
const eqDE=()=>+eq.fE-+eq.bE;                // ΔE van de heengaande reactie (eenheden van het schuifje)
const eqKind=dE=>dE<0?'exotherm':dE>0?'endotherm':'zonder energie-effect';

function eqKick(p,r){const s=EQ_SIG*Math.sqrt(eqTheta()/eqMass(p.k)),v=s*Math.sqrt(-2*Math.log(1-r())),a=r()*2*Math.PI;p.vx=v*Math.cos(a);p.vy=v*Math.sin(a)}
function eqAdd(k,tr){const S=eqS,r=S.r,R=eqRad(k),p={k,x:R+r()*(S.W-2*R),y:R+r()*(S.H-2*R),tr:!!tr};eqKick(p,r);S.m.push(p);return p}
function eqReset(seed){
  eqS={r:rng(seed||Math.floor(Math.random()*1e9)),m:[],time:0,fT:[],bT:[],hist:[],next:0,dtH:.5,flash:[],trN:0,W:eqW(),H:eqH()};
  const side=eqT().f[eq.start==='r'?1:0];let first=true;
  for(let i=0;i<+eq.n;i++)side.forEach(k=>{eqAdd(k,first);first=false});
  eqSample()}
const eqCount=k=>eqS.m.filter(p=>p.k===k).length;
function eqAtoms(){const c={a:0,b:0};eqS.m.forEach(p=>{for(const t of eqT().sp[p.k])c[t]++});return c}
const eqRate=a=>eqS.time>0?a.length/Math.min(3,eqS.time):0;   // reacties per seconde, over de laatste 3 s
function eqSample(){const S=eqS,h={t:S.time,f:eqRate(S.fT),b:eqRate(S.bT)};eqSp().forEach(k=>h[k]=eqCount(k));S.hist.push(h);S.next=S.time+S.dtH;
  if(S.hist.length>800){S.hist=S.hist.filter((h,i)=>i%2===0||i===S.hist.length-1);S.dtH*=2}}

/* ---------- Model ---------- */
// Eén reactie laten plaatsvinden. i = 0 heen, 1 terug.
function eqEvent(i,x,y,tr){const S=eqS;(i?S.bT:S.fT).push(S.time);S.flash.push({x,y,f:!i,life:.6});if(tr)S.trN++}
function eqStep(dt){const S=eqS,r=S.r,T=eqT(),th=eqTheta(),cat=eq.cat==='on'?EQ_CAT:0;
  const Ea=[Math.max(0,+eq.fE-cat)*EQ_EU,Math.max(0,+eq.bE-cat)*EQ_EU],dirs=[T.f,T.b];
  S.time+=dt;S.flash.forEach(f=>f.life-=dt);S.flash=S.flash.filter(f=>f.life>0);
  // reacties van één deeltje (uiteenvallen of omzetten)
  const uni=[];dirs.forEach((d,i)=>{if(d[0].length===1)uni.push({i,k:d[0][0],out:d[1],p:EQ_KU*Math.exp(-Ea[i]/th)*dt})});
  const born=[];
  for(const p of S.m){
    if(r()<dt*1.5)eqKick(p,r);   // botsingen met het oplosmiddel houden de temperatuur constant
    p.x+=p.vx*dt;p.y+=p.vy*dt;const R=eqRad(p.k);
    if(p.x<R){p.x=R;p.vx=Math.abs(p.vx)}if(p.x>S.W-R){p.x=S.W-R;p.vx=-Math.abs(p.vx)}
    if(p.y<R){p.y=R;p.vy=Math.abs(p.vy)}if(p.y>S.H-R){p.y=S.H-R;p.vy=-Math.abs(p.vy)}
    for(const u of uni){if(p.k!==u.k||r()>=u.p)continue;
      if(u.out.length===1){p.k=u.out[0];eqEvent(u.i,p.x,p.y,p.tr)}
      else{const a=r()*2*Math.PI,ux=Math.cos(a),uy=Math.sin(a),q={k:u.out[1],x:p.x-ux*EQ_R1,y:p.y-uy*EQ_R1,tr:false};
        p.k=u.out[0];p.x+=ux*EQ_R1;p.y+=uy*EQ_R1;eqKick(p,r);eqKick(q,r);
        const s=EQ_SIG*Math.sqrt(th)*.7;p.vx+=ux*s;p.vy+=uy*s;q.vx-=ux*s;q.vy-=uy*s;born.push(q);eqEvent(u.i,p.x-ux*EQ_R1,p.y-uy*EQ_R1,p.tr)}
      break}
  }
  S.m.push(...born);
  // reacties tussen twee deeltjes, en gewone (elastische) botsingen; via een rooster alleen buren controleren
  const bi={};dirs.forEach((d,i)=>{if(d[0].length===2)bi[[...d[0]].sort().join('|')]={i,out:d[1]}});
  const CS=20,grid=new Map();S.m.forEach((p,i)=>{const k=Math.floor(p.x/CS)*1000+Math.floor(p.y/CS);let c=grid.get(k);if(!c)grid.set(k,c=[]);c.push(i)});
  const dead=new Set(),made=[];
  S.m.forEach((p,i)=>{const gi=Math.floor(p.x/CS),gj=Math.floor(p.y/CS);
    for(let a=gi-1;a<=gi+1;a++)for(let b=gj-1;b<=gj+1;b++){const cell=grid.get(a*1000+b);if(!cell)continue;
      for(const j of cell){if(j<=i||dead.has(i)||dead.has(j))continue;const q=S.m[j];
        const Rp=eqRad(p.k),Rq=eqRad(q.k),dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy);if(d>=Rp+Rq||d===0)continue;
        const nx=dx/d,ny=dy/d,dvx=q.vx-p.vx,dvy=q.vy-p.vy,vn=dvx*nx+dvy*ny,mp=eqMass(p.k),mq=eqMass(q.k);
        const ov=(Rp+Rq-d)/2;p.x-=nx*ov;p.y-=ny*ov;q.x+=nx*ov;q.y+=ny*ov;
        if(vn>=0)continue;
        const rx=bi[[p.k,q.k].sort().join('|')];
        // drempel zo gekozen dat de kans op een heftig genoege botsing e^(−Ea/θ) is
        if(rx&&dvx*dvx+dvy*dvy>=2*EQ_SIG*EQ_SIG*(1/mp+1/mq)*Ea[rx.i]){const tr=p.tr||q.tr,mx=(p.x+q.x)/2,my=(p.y+q.y)/2;
          if(rx.out.length===1){made.push({k:rx.out[0],x:mx,y:my,vx:(mp*p.vx+mq*q.vx)/(mp+mq),vy:(mp*p.vy+mq*q.vy)/(mp+mq),tr});dead.add(i);dead.add(j);eqEvent(rx.i,mx,my,tr);continue}
          p.k=rx.out[0];q.k=rx.out[1];eqEvent(rx.i,mx,my,tr)}   // twee nieuwe deeltjes: ze stuiteren daarna gewoon uit elkaar
        const k=2*vn/(1/mp+1/mq);p.vx+=k/mp*nx;p.vy+=k/mp*ny;q.vx-=k/mq*nx;q.vy-=k/mq*ny}}});
  if(dead.size)S.m=S.m.filter((p,i)=>!dead.has(i));S.m.push(...made);
  const old=S.time-3;while(S.fT.length&&S.fT[0]<old)S.fT.shift();while(S.bT.length&&S.bT[0]<old)S.bT.shift();
  if(S.time>=S.next)eqSample();
}
// Evenwicht: heen en terug ongeveer even snel (gemiddeld over 6 s) en de aantallen veranderen de laatste 5 s nauwelijks.
// Met een marge: eenmaal in evenwicht blijft de melding staan tot de afwijking duidelijk groter is (of tot je het evenwicht verstoort),
// zodat toevallige schommelingen de melding niet steeds laten wisselen.
function eqStatus(){const S=eqS,h=S.hist;if(S.time<8||h.length<3)return null;
  const rec=h.filter(x=>x.t>=S.time-6),f=rec.reduce((s,x)=>s+x.f,0)/rec.length,b=rec.reduce((s,x)=>s+x.b,0)/rec.length;
  const past=h.find(x=>x.t>=S.time-5)||h[0],tot=S.m.length,ruim=S.eqOn?3.5:1;
  S.eqOn=Math.abs(f-b)<=ruim*(.12*(f+b)/2+.4)&&eqSp().every(k=>Math.abs(eqCount(k)-past[k])<=ruim*(.04*tot+2));
  return S.eqOn}
const eqDisturb=()=>{if(eqS)eqS.eqOn=false};
// Volume veranderen: het vat groeit of krimpt, de deeltjes schuiven mee
function eqResize(){const S=eqS,W=eqW(),H=eqH();S.m.forEach(p=>{p.x*=W/S.W;p.y*=H/S.H});S.W=W;S.H=H}

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
function eqStyle(){const col=eq.color==='color',sp=eqSp(),pal=col?['#2f6fd6','#e0662b','#7b3fa0']:['#000','#000','#000'],da=['','8 4','1.5 3.5'];
  const line={f:[col?'#2e8b3a':'#000',''],b:[col?'#c0392b':'#000','8 4']};sp.forEach((k,i)=>line[k]=[pal[i],da[i]]);
  return{a:col?'fill="#2f6fd6" stroke="#123a7a"':'fill="#1a1a1a" stroke="#000"',b:col?'fill="#f08a4b" stroke="#8a3a0c"':'fill="#fff" stroke="#000"',
    tr:col?'#d4a000':'#000',fwd:col?'#2e8b3a':'#000',bwd:col?'#c0392b':'#000',line}}
const eqDot=(x,y,t,C)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="${EQ_R1}" ${C[t]} stroke-width="1.2"/>`;
// Een deeltje tekenen: 1 atoom, of 2 atomen die een stukje overlappen (in de bewegingsrichting)
function eqParticle(x,y,k,ux,uy,C){const at=eqT().sp[k];if(at.length===1)return{s:eqDot(x,y,at,C),ax:x,ay:y};
  const o=EQ_R1*.72;return{s:eqDot(x+ux*o,y+uy*o,at[0],C)+eqDot(x-ux*o,y-uy*o,at[1],C),ax:x+ux*o,ay:y+uy*o}}
const eqStar=(x,y,c)=>{let d='';for(let i=0;i<6;i++){const a=i*Math.PI/3+.3;d+=`M${r1(x+3*Math.cos(a))} ${r1(y+3*Math.sin(a))}L${r1(x+10*Math.cos(a))} ${r1(y+10*Math.sin(a))}`}
  return `<path d="${d}" stroke="${c}" stroke-width="2" stroke-linecap="round" fill="none"/>`};
const eqRing=(x,y,c)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="10" fill="none" stroke="${c}" stroke-width="1.8" stroke-dasharray="3 2.5"/>`;
const eqTrRing=(x,y,c)=>`<circle cx="${r1(x)}" cy="${r1(y)}" r="9" fill="none" stroke="${c}" stroke-width="2.2"/>`;
// Grafiek tegen de tijd; elk punt is het gemiddelde van de laatste 'smooth' metingen
function eqPlot(y0,ylab,keys,floor,W){const ML=46,MR=30,MT=34,H=120,w=W-32-ML-MR,C=eqStyle(),k0=Math.max(1,+eq.smooth);
  const raw=eqS.hist,hist=raw.map((h,i)=>{const o={t:h.t},from=Math.max(0,i-k0+1);keys.forEach(k=>{let s=0;for(let j=from;j<=i;j++)s+=raw[j][k];o[k]=s/(i-from+1)});return o});
  const tmax=Math.max(20,Math.ceil(eqS.time/10)*10),xs=niceStep(tmax,5);
  const top=Math.max(floor,...keys.flatMap(k=>hist.map(h=>h[k]))),ys=niceStep(top,4),ymax=Math.ceil(top/ys)*ys;
  const X=t=>ML+t/tmax*w,Y=v=>MT+H-v/ymax*H;let s=axesArrows(ML,MT,w,H);
  for(let t=xs;t<=tmax+1e-9;t+=xs)s+=`<line x1="${r1(X(t))}" y1="${MT+H}" x2="${r1(X(t))}" y2="${MT+H+5}" stroke="#000" stroke-width="1.2"/>`+fmt(nlNum(t),X(t),MT+H+19,12,'middle');
  for(let v=0;v<=ymax+1e-9;v+=ys)s+=`<line x1="${ML-5}" y1="${r1(Y(v))}" x2="${ML}" y2="${r1(Y(v))}" stroke="#000" stroke-width="1.2"/>`+fmt(nlNum(v,1),ML-8,Y(v)+4,12,'end');
  s+=fmt(ylab,ML+12,MT-14,12)+fmt('tijd (s)',ML+w+22,MT+H+33,12,'end');
  keys.forEach(k=>{const[c,da]=C.line[k];
    s+=`<polyline points="${hist.map(h=>r1(X(h.t))+','+r1(Y(h[k]))).join(' ')}" fill="none" stroke="${c}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"${da?` stroke-dasharray="${da}"`:''}/>`});
  return{s:`<g transform="translate(16,${y0})">${s}</g>`,h:MT+H+38}}
// Energiediagram van de heengaande reactie: beginstoffen, geactiveerde toestand, reactieproducten
function eqEnergy(y0,W){const fE=+eq.fE,dE=eqDE(),cat=eq.cat==='on'?Math.min(EQ_CAT,fE-Math.max(0,dE)-.3):0,T=eqT();
  const ML=40,MT=30,H=130,AX=22,x0=16+ML,lo=Math.min(0,dE),hi=fE,Y=v=>y0+MT+16+(hi-v)/(hi-lo||1)*(H-16);
  const xL1=x0+20,xL2=x0+110,xP=x0+200,xR1=x0+290,xR2=x0+380,yR=Y(0),yP=Y(dE),yT=Y(fE);
  const hump=top=>`M${xL1} ${r1(yR)}H${xL2}C${xL2+45} ${r1(yR)} ${xP-45} ${r1(top)} ${xP} ${r1(top)}C${xP+45} ${r1(top)} ${xR1-45} ${r1(yP)} ${xR1} ${r1(yP)}H${xR2}`;
  let s=`<line x1="${x0}" y1="${y0+MT+H+AX}" x2="${x0}" y2="${y0+MT-6}" stroke="#000" stroke-width="1.6"/><polygon points="${x0},${y0+MT-14} ${x0-5},${y0+MT-2} ${x0+5},${y0+MT-2}" fill="#000"/>`;
  s+=fmt('energie',x0+10,y0+MT-6,12)+fmt('reactieverloop',xR2+40,y0+MT+H+AX+16,12,'end');
  s+=`<line x1="${x0}" y1="${y0+MT+H+AX}" x2="${xR2+50}" y2="${y0+MT+H+AX}" stroke="#000" stroke-width="1.6"/>`;
  s+=`<path d="${hump(yT)}" fill="none" stroke="#000" stroke-width="2"/>`;
  if(cat>0)s+=`<path d="${hump(Y(fE-cat))}" fill="none" stroke="#000" stroke-width="1.4" stroke-dasharray="5 4"/>`+fmt('met katalysator',xP,Y(fE-cat)+16,11,'middle','font-style="italic"');
  s+=fmt(eqSide(T.f[0]),(xL1+xL2)/2,yR+16,13,'middle')+fmt(eqSide(T.f[1]),(xR1+xR2)/2,yP+16,13,'middle');   // namen onder de niveaus
  s+=dash(xL2-30,yT,xR1+30,yT,'4 3',1);
  const ar=(x,a,b,lab,side)=>Math.abs(b-a)<4?'':vArrow(x,a,b,1.4)+vArrow(x,b,a,1.4)+fmt(lab,x+(side<0?-6:6),(a+b)/2+4,12,side<0?'end':'start',HALO);
  s+=ar(xL2-20,yR,yT,'E_a heen',-1)+ar(xR1+20,yP,yT,'E_a terug',1);
  if(dE!==0)s+=dash(xL2,yR,xR2+30,yR,'4 3',1)+ar(xR2+22,yR,yP,'ΔE',1);
  return{s,h:MT+H+AX+22}}
// Legenda-regel: items [tekenfunctie, breedte, tekst] naast elkaar, met terugloop naar een nieuwe regel
function eqLegend(items,y,W){let x=16,body='';y+=22;
  items.forEach(([icon,iw,lab])=>{const w=iw+6+textW(lab,13)+22;if(x+w>W-16&&x>16){x=16;y+=22}body+=icon(x,y-4.5)+fmt(lab,x+iw+6,y,13);x+=w});
  return{body,y}}
const eqLineIcon=k=>(x,y)=>{const[c,da]=eqStyle().line[k];return `<line x1="${x}" y1="${y}" x2="${x+24}" y2="${y}" stroke="${c}" stroke-width="2" stroke-linecap="round"${da?` stroke-dasharray="${da}"`:''}/>`};
function buildEQ(){if(!eqS)eqReset(1);lastWarn=[];
  const C=eqStyle(),M=16,BW=eqS.W,BH=eqS.H,W=Math.max(BW,500)+2*M,bx=(W-BW)/2,sp=eqSp(),dE=eqDE();let top=M,body='';
  if(eq.title){body+=fmt(eq.title,M,top+16,17,'start','font-weight="700"');top+=30}
  if(eq.eqn==='on'){body+=fmt(eqEquation(),W/2,top+18,18,'middle');top+=32}
  let g='';
  eqS.m.forEach(p=>{const v=Math.hypot(p.vx,p.vy),P=eqParticle(p.x,p.y,p.k,v>1?p.vx/v:1,v>1?p.vy/v:0,C);g+=P.s;
    if(p.tr&&eq.track==='on')g+=eqTrRing(P.ax,P.ay,C.tr)});
  if(eq.flash==='on')eqS.flash.forEach(f=>{g+=f.f?eqStar(f.x,f.y,C.fwd):eqRing(f.x,f.y,C.bwd)});
  body+=`<svg x="${r1(bx)}" y="${top}" width="${BW}" height="${BH}" viewBox="0 0 ${BW} ${BH}" overflow="hidden"><rect width="${BW}" height="${BH}" fill="#fff"/>${g}</svg>`;
  body+=`<rect x="${r1(bx)}" y="${top}" width="${BW}" height="${BH}" fill="none" stroke="#000" stroke-width="1.6"/>`;
  let y=top+BH;
  if(eq.count==='on'){const st=eqStatus(),f=eqRate(eqS.fT),b=eqRate(eqS.bT);
    y+=22;body+=fmt(`Temperatuur: ${eq.t} °C  ·  Volume: ${Math.round(eq.V*100)} %  ·  Tijd: ${nlNum(eqS.time,1)} s`,M,y,13);
    y+=19;body+=fmt(sp.map(k=>`${eqLab(k)}: ${eqCount(k)}`).join('  ·  ')+`  ·  Reacties per seconde: heen ${nlNum(f,1)}, terug ${nlNum(b,1)}`,M,y,13);
    y+=19;body+=fmt(`Heengaande reactie: ${eqKind(dE)}  ·  teruggaande reactie: ${eqKind(-dE)}`,M,y,13);
    if(eq.track==='on'){y+=19;body+=fmt(`Het omcirkelde deeltje heeft al ${eqS.trN} keer gereageerd (heen of terug).`,M,y,13)}
    y+=21;body+=fmt(st==null?'Even wachten …':st?'Evenwicht: heen en terug verlopen even snel. Beide reacties gaan gewoon door.'
      :`Nog geen evenwicht: de ${eqS.hist.slice(-12).reduce((s,x)=>s+x.f-x.b,0)>0?'heengaande':'teruggaande'} reactie verloopt nu sneller.`,M,y,13,'start','font-weight="700"')}
  if(eq.legend==='on'){const R=eqLegend([
      ...sp.map(k=>{const w=eqMass(k)>1?3.5*EQ_R1:2*EQ_R1;return[(x,y)=>eqParticle(x+w/2,y,k,1,0,C).s,w,eqLab(k)]}),
      ...(eq.track==='on'?[[(x,y)=>eqDot(x+9,y,'a',C)+eqTrRing(x+9,y,C.tr),18,'gevolgd deeltje']]:[]),
      ...(eq.flash==='on'?[[(x,y)=>eqStar(x+10,y,C.fwd),20,'reactie heen'],[(x,y)=>eqRing(x+10,y,C.bwd),20,'reactie terug']]:[])],y+4,W);
    body+=R.body;y=R.y}
  if(eq.ed==='on'){const E=eqEnergy(y+8,W);body+=E.s;y+=8+E.h}
  if(eq.g1==='on'){const G=eqPlot(y+10,'aantal deeltjes',sp,+eq.n,W);body+=G.s;y+=10+G.h;
    const R=eqLegend(sp.map(k=>[eqLineIcon(k),24,eqLab(k)]),y-6,W);body+=R.body;y=R.y}
  if(eq.g2==='on'){const G=eqPlot(y+14,'reactiesnelheid (reacties per s)',['f','b'],2,W);body+=G.s;y+=14+G.h;
    const R=eqLegend([[eqLineIcon('f'),24,'heengaande reactie'],[eqLineIcon('b'),24,'teruggaande reactie']],y-6,W);body+=R.body;y=R.y}
  if(eq.caption){y+=26;body+=fmt(eq.caption,W/2,y,15,'middle')}
  return svgWrap(W,y+M,body);
}

/* ---------- Paneel ---------- */
function eqSetText(id,t){const el=document.getElementById(id);if(el)el.textContent=t}
const eqNText=()=>{const c={};eqT().f[eq.start==='r'?1:0].forEach(k=>c[k]=(c[k]||0)+ +eq.n);return Object.entries(c).map(([k,n])=>`${n} ${eqTxt(eqLab(k))}`).join(' en ')};
const eqEaText=()=>{const dE=eqDE();return `ΔE = ${sgnNum(dE,1)}: heen ${eqKind(dE)}, terug ${eqKind(-dE)}`};
function eqLive(){eqSetText('eqEqn',eqEquation(true));eqSetText('eqFv',nlNum(+eq.fE,1));eqSetText('eqBv',nlNum(+eq.bE,1));eqSetText('eqDv',eqEaText());
  eqSetText('eqTv',eq.t+' °C');eqSetText('eqVv',Math.round(eq.V*100)+' %');eqSetText('eqNv',eqNText())}
function eqPanel(){const sp=eqSp(),L=k=>esc(eqTxt(eqLab(k)));
  return `<div class="sec"><h3>Reactie</h3>
    <div class="row"><span class="lab">Soort reactie</span>${seg('type',Object.entries(EQ_TYPES).map(([k,T])=>[k,T.knop]),eq.type)}</div>
    <p style="margin:0;font-size:18px;text-align:center" id="eqEqn">${esc(eqEquation(true))}</p>
    <div style="display:grid;grid-template-columns:repeat(${sp.length},1fr);gap:10px">${sp.map(k=>`<div class="row"><label for="eqL${k}">Naam ${esc(eqTxt(EQ_TYPES[eq.type].lab[k]))}</label><input type="text" id="eqL${k}" data-k="lab.${eq.type}.${k}" value="${esc(eqLab(k))}"></div>`).join('')}</div>
    <div class="row"><label for="eqF">Activeringsenergie heen: <span id="eqFv">${nlNum(+eq.fE,1)}</span></label><input type="range" id="eqF" min="1" max="10" step="0.5" data-k="fE" data-dec value="${eq.fE}"></div>
    <div class="row"><label for="eqB">Activeringsenergie terug: <span id="eqBv">${nlNum(+eq.bE,1)}</span></label><input type="range" id="eqB" min="1" max="10" step="0.5" data-k="bE" data-dec value="${eq.bE}"></div>
    <p style="margin:0;font-weight:600;font-size:14px" id="eqDv">${esc(eqEaText())}</p>
    <p class="hint" style="margin:0">Hoe lager de activeringsenergie, hoe sneller die reactie verloopt. Het verschil is ΔE: is de activeringsenergie heen lager dan terug, dan is de heengaande reactie exotherm. Het energiediagram in de figuur laat dit zien.</p></div>
  <div class="sec"><h3>Instellen</h3>
    <div class="row"><span class="lab">Beginnen met</span>${seg('start',[['l','Alleen links (beginstoffen)'],['r','Alleen rechts (reactieproducten)']],eq.start)}</div>
    <div class="row"><label for="eqN">Aantal bij het begin: <span id="eqNv">${esc(eqNText())}</span></label><input type="range" id="eqN" min="20" max="120" step="10" data-k="n" data-num value="${eq.n}"></div>
    <div class="row"><label for="eqV">Volume: <span id="eqVv">${Math.round(eq.V*100)} %</span></label><input type="range" id="eqV" min="0.5" max="2" step="0.1" data-k="V" data-dec value="${eq.V}"></div>
    <div class="row"><label for="eqT">Temperatuur: <span id="eqTv">${eq.t} °C</span></label><input type="range" id="eqT" min="0" max="100" step="5" data-k="t" data-num value="${eq.t}"></div>
    <div class="row"><span class="lab">Katalysator</span>${seg('cat',[['off','Zonder'],['on','Met']],eq.cat)}</div>
    <p class="hint" style="margin:0">Volume en temperatuur kun je ook veranderen terwijl de simulatie loopt. Een kleiner volume met dezelfde deeltjes geeft een hogere concentratie. Bij evenwicht gaan beide reacties door, even snel; daarom blijven de aantallen (gemiddeld) gelijk.</p></div>
  <div class="sec"><h3>Evenwicht verstoren</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap">${sp.map(k=>`<button class="btn" data-act="add" data-val="${k}">+20 ${L(k)}</button><button class="btn" data-act="del" data-val="${k}">−20 ${L(k)}</button>`).join('')}</div>
    <p class="hint" style="margin:0">Voeg tijdens de simulatie deeltjes toe of haal ze weg, of verander volume of temperatuur, en kijk hoe zich een nieuw evenwicht instelt.</p></div>
  <div class="sec"><h3>Simulatie</h3>
    <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn primary" data-act="play">${eqRun?'Pauze':'Start'}</button><button class="btn" data-act="reset">Opnieuw</button></div>
    <div class="row"><span class="lab">Afspeelsnelheid</span>${seg('slow',[['0.3','Vertraagd'],['1','Normaal'],['2','Versneld']],eq.slow)}</div>
    <div class="row"><span class="lab">Animatie downloaden (lengte)</span>${seg('recLen',[['5','5 s'],['10','10 s'],['20','20 s']],eq.recLen)}</div>
    <div><button class="btn" data-act="rec" ${eqRec?'disabled':''}>${eqRec?'Opname loopt …':'Neem op en download filmpje'}</button></div>
    <p class="hint" style="margin:0">Het filmpje wordt een MP4 (in sommige browsers WebM); een MP4 kun je zo in PowerPoint zetten. Pauzeer op een mooi moment om de figuur te kopiëren.</p></div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Energiediagram</span>${seg('ed',[['on','Aan'],['off','Uit']],eq.ed)}</div>
    <div class="row"><span class="lab">Grafiek: aantal deeltjes</span>${seg('g1',[['on','Aan'],['off','Uit']],eq.g1)}</div>
    <div class="row"><span class="lab">Grafiek: reactiesnelheid heen en terug</span>${seg('g2',[['on','Aan'],['off','Uit']],eq.g2)}</div>
    <div class="row"><span class="lab">Grafieken afvlakken</span>${seg('smooth',[['1','Elke meting'],['3','Gemiddelde van 3'],['6','Gemiddelde van 6']],eq.smooth)}</div>
    <div class="row"><span class="lab">Eén deeltje volgen</span>${seg('track',[['on','Aan'],['off','Uit']],eq.track)}</div>
    <div class="row"><span class="lab">Reacties markeren</span>${seg('flash',[['on','Aan'],['off','Uit']],eq.flash)}</div>
    <div class="row"><span class="lab">Reactievergelijking boven het vat</span>${seg('eqn',[['on','Aan'],['off','Uit']],eq.eqn)}</div>
    <div class="row"><span class="lab">Tellers onder het vat</span>${seg('count',[['on','Aan'],['off','Uit']],eq.count)}</div>
    <div class="row"><span class="lab">Legenda</span>${seg('legend',[['on','Aan'],['off','Uit']],eq.legend)}</div>
    <div class="row"><span class="lab">Kleur</span>${seg('color',[['bw','Zwart-wit'],['color','Kleur']],eq.color)}</div>
    <div class="row"><label for="eqTit">Titel (leeg = geen)</label><input type="text" id="eqTit" data-k="title" value="${esc(eq.title)}"></div>
    <div class="row"><label for="eqCap">Onderschrift (bijv. A, B, C of D)</label><input type="text" id="eqCap" data-k="caption" value="${esc(eq.caption)}"></div></div>`;
}
const EVEN={key:'sf.evenwicht',st:()=>eq,build:buildEQ,view:()=>{if(!eqS)eqReset();eqPlay();return buildEQ()},panel:eqPanel,
  onChange:k=>{eq.t=+eq.t;eq.n=+eq.n;eq.V=+eq.V;eq.fE=+eq.fE;eq.bE=+eq.bE;if(!eqS)eqReset();
    if(k==='V'||k==='t'||k==='cat'||k==='fE'||k==='bE')eqDisturb();
    if(k==='V')eqResize();
    if(k==='n'||k==='start'||k==='type')eqReset();
    eqLive()},
  act:(a,b)=>{
    if(a==='play'){eqRun=!eqRun;if(!eqRun&&eqRec)eqRecStop();eqPlay()}
    if(a==='reset')eqReset();
    if(a==='add'){for(let i=0;i<20;i++)eqAdd(b.dataset.val);eqDisturb()}
    if(a==='del'){const D=eqS.m.filter(p=>p.k===b.dataset.val&&!p.tr).slice(0,20);eqS.m=eqS.m.filter(p=>!D.includes(p));eqDisturb()}
    if(a==='rec'&&!eqRec){eqRec=recStart(buildEQ(),+eq.recLen,'dynamisch-evenwicht');if(eqRec){eqRun=true;eqPlay()}}}};

GEN.evenwicht=()=>mountGen(EVEN);
