/* ---------- Structuurformule-editor ---------- */
// Teken een molecuul op een rooster: atomen op roosterpunten, bindingen tussen buurpunten (ook schuin).
// Het paneel regelt de weergave; het molecuul zelf bewerk je door op de figuur te klikken (paperClick).
// view() tekent de editor (met rooster en selectie), build() de schone figuur om te kopiëren.
const ST_GX=15,ST_GY=9,ST_E=44,ST_M=26;            // roosterbreedte, -hoogte, afstand en marge in de editor
const ST_VAL={H:1,C:4,Si:4,N:3,P:3,O:2,S:2,F:1,Cl:1,Br:1,I:1,B:3};   // aantal bindingen
const ST_VE={N:5,P:5,O:6,S:6,F:7,Cl:7,Br:7,I:7};                     // valentie-elektronen (voor vrije paren)
const ST_ELS=['C','H','O','N','S','P','F','Cl','Br','I'];
const ST_SIZE={S:[40,17],M:[52,21],L:[64,26]};                       // [bindingslengte, lettergrootte]
const ST_NAAM={I:'jood'};
const ST_LET={a:'abcdefghijklmnopqrstuvwxyz',A:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',1:null};

// Voorbeelden: [naam, atomen 'El x y;…', bindingen 'a-b' enkel, 'a=b' dubbel, 'a#b' drievoudig]. Ontbrekende H-atomen worden aangevuld.
const ST_LIB={
 'Alkanen':{
  methaan:['methaan','C 0 0',''],ethaan:['ethaan','C 0 0;C 1 0','0-1'],propaan:['propaan','C 0 0;C 1 0;C 2 0','0-1,1-2'],
  butaan:['butaan','C 0 0;C 1 0;C 2 0;C 3 0','0-1,1-2,2-3'],methylpropaan:['methylpropaan','C 0 0;C 1 0;C 2 0;C 1 1','0-1,1-2,1-3'],
  dimethylpropaan:['2,2-dimethylpropaan','C 0 0;C 1 0;C 2 0;C 1 -1;C 1 1','0-1,1-2,1-3,1-4']},
 'Alkenen en alkynen':{
  etheen:['etheen','C 0 0;C 1 0','0=1'],propeen:['propeen','C 0 0;C 1 0;C 2 0','0=1,1-2'],
  buteen:['but-1-een','C 0 0;C 1 0;C 2 0;C 3 0','0=1,1-2,2-3'],ethyn:['ethyn','C 0 0;C 1 0','0#1']},
 'Alcoholen':{
  methanol:['methanol','C 0 0;O 1 0','0-1'],ethanol:['ethanol','C 0 0;C 1 0;O 2 0','0-1,1-2'],
  propaan1ol:['propaan-1-ol','C 0 0;C 1 0;C 2 0;O 3 0','0-1,1-2,2-3'],propaan2ol:['propaan-2-ol','C 0 0;C 1 0;C 2 0;O 1 1','0-1,1-2,1-3'],
  glycol:['ethaan-1,2-diol','O 0 0;C 1 0;C 2 0;O 3 0','0-1,1-2,2-3'],
  glycerol:['propaan-1,2,3-triol','C 0 0;C 0 1;C 0 2;O 1 0;O 1 1;O 1 2','0-1,1-2,0-3,1-4,2-5']},
 'Halogeenalkanen':{
  chloormethaan:['chloormethaan','C 0 0;Cl 1 0','0-1'],dichloormethaan:['dichloormethaan','Cl -1 0;C 0 0;Cl 1 0','0-1,1-2'],
  broomethaan:['broomethaan','C 0 0;C 1 0;Br 2 0','0-1,1-2']},
 'Carbonzuren en esters':{
  methaanzuur:['methaanzuur','C 0 0;O 0 -1;O 1 0','0=1,0-2'],ethaanzuur:['ethaanzuur','C 0 0;C 1 0;O 1 -1;O 2 0','0-1,1=2,1-3'],
  propaanzuur:['propaanzuur','C 0 0;C 1 0;C 2 0;O 2 -1;O 3 0','0-1,1-2,2=3,2-4'],
  methylethanoaat:['methylethanoaat','C 0 0;C 1 0;O 1 -1;O 2 0;C 3 0','0-1,1=2,1-3,3-4'],
  ethylethanoaat:['ethylethanoaat','C 0 0;C 1 0;O 1 -1;O 2 0;C 3 0;C 4 0','0-1,1=2,1-3,3-4,4-5']},
 'Overige':{
  methaanamine:['methaanamine','C 0 0;N 1 0','0-1'],ethanal:['ethanal','C 0 0;C 1 0;O 1 -1','0-1,1=2'],
  propanon:['propanon','C 0 0;C 1 0;C 2 0;O 1 -1','0-1,1-2,1=3'],
  water:['water','O 0 0;H -1 1;H 1 1','0-1,0-2'],ammoniak:['ammoniak','N 0 0;H -1 0;H 1 0;H 0 1','0-1,0-2,0-3'],
  co2:['koolstofdioxide','O 0 0;C 1 0;O 2 0','0=1,1=2']}
};
const ST_FLAT=Object.assign({},...Object.values(ST_LIB));

const ST0={atoms:[],bonds:[],nid:1,marks:[],sel:null,tool:'draw',el:'C',preset:'ethanol',view:'full',hMode:'show',lp:'none',size:'M',
  label:'none',markStyle:'a',name:'',nameFor:'',title:'',caption:'',answer:'off'};
let sst;try{sst=JSON.parse(localStorage.getItem('sf.structuur')||'null')}catch(e){}
const stNew=!sst;sst=Object.assign(clone(ST0),sst||{});sst.sel=null;
let stHist=[],stNote='';

/* ---------- Model ---------- */
const stAt=id=>sst.atoms.find(a=>a.id===id);
const stAtXY=(x,y)=>sst.atoms.find(a=>a.x===x&&a.y===y);
const stBond=(a,b)=>sst.bonds.find(o=>(o.a===a&&o.b===b)||(o.a===b&&o.b===a));
const stNb=id=>sst.bonds.filter(o=>o.a===id||o.b===id).map(o=>({id:o.a===id?o.b:o.a,o:o.o}));
const stOrder=id=>stNb(id).reduce((s,n)=>s+n.o,0);
const stAdj=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y))===1;
const stIn=(x,y)=>x>=0&&y>=0&&x<ST_GX&&y<ST_GY;
function stAdd(el,x,y){const a={id:sst.nid++,el,x,y};sst.atoms.push(a);return a}
function stDel(id){sst.atoms=sst.atoms.filter(a=>a.id!==id);sst.bonds=sst.bonds.filter(b=>b.a!==id&&b.b!==id);sst.marks=sst.marks.filter(m=>m!==id);if(sst.sel===id)sst.sel=null}
function stSave(){stHist.push(JSON.stringify({atoms:sst.atoms,bonds:sst.bonds,nid:sst.nid,marks:sst.marks}));if(stHist.length>60)stHist.shift()}
function stUndo(){const h=stHist.pop();if(h){Object.assign(sst,JSON.parse(h));sst.sel=null}}
// H die aan precies één ander (niet-H) atoom vastzit: valt weg bij 'H-atomen weglaten' en wordt samengevoegd in CH₃
function stTermH(a){if(a.el!=='H')return false;const nb=stNb(a.id);return nb.length===1&&stAt(nb[0].id).el!=='H'}

const ST_DIRS=[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]];   // richting k ligt op k·45° (y naar beneden)
const angSep=(a,b)=>{const d=((a-b)%360+360)%360;return Math.min(d,360-d)};
function combos(arr,k){if(!k)return[[]];const out=[];arr.forEach((v,i)=>combos(arr.slice(i+1),k-1).forEach(c=>out.push([v,...c])));return out}
// Vul elk atoom aan met H-atomen tot het juiste aantal bindingen. Geeft het aantal H-atomen terug waarvoor geen plek was.
function stFillH(){let short=0;
  for(const a of [...sst.atoms]){if(a.el==='H'||!(a.el in ST_VAL))continue;
    const need=ST_VAL[a.el]-stOrder(a.id);if(need<=0)continue;
    const occ=stNb(a.id).map(n=>{const b=stAt(n.id);return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI});
    const free=[];ST_DIRS.forEach(([dx,dy],k)=>{if(stIn(a.x+dx,a.y+dy)&&!stAtXY(a.x+dx,a.y+dy))free.push(k)});
    // heeft het atoom al twee of meer bindingen, dan komen de H-atomen recht (zoals in het boek), als daar plek is
    const orth=free.filter(k=>k%2===0);const cand=occ.length>=2&&orth.length>=need?orth:free;
    const n=Math.min(need,cand.length);short+=need-n;if(!n)continue;
    // kies de richtingen die zo ver mogelijk van elkaar en van de bestaande bindingen af liggen (laagste 'afstoting')
    let best=null,be=Infinity;
    for(const c of combos(cand,n)){const ang=c.map(k=>k*45),all=[...occ,...ang];let e=0;
      for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++)e+=1/Math.max(angSep(all[i],all[j]),1);
      // bij gelijkspel: zo ver mogelijk van de bestaande bindingen (=CH₂ symmetrisch), dan recht, dan horizontaal
      e-=ang.reduce((t,x)=>t+occ.reduce((u,y)=>u+angSep(x,y),0),0)*1e-6+ang.filter(t=>t%90===0).length*1e-5+ang.filter(t=>t%180===0).length*1e-6;
      if(e<be-1e-9){be=e;best=c}}
    best.forEach(k=>{const h=stAdd('H',a.x+ST_DIRS[k][0],a.y+ST_DIRS[k][1]);sst.bonds.push({a:a.id,b:h.id,o:1})});
  }
  return short;
}
function stLoad(id){const m=ST_FLAT[id];if(!m)return;
  const at=m[1].split(';').map(t=>{const[e,x,y]=t.trim().split(/\s+/);return{el:e,x:+x,y:+y}});
  const xs=at.map(a=>a.x),ys=at.map(a=>a.y);
  const ox=Math.floor((ST_GX-1-(Math.max(...xs)-Math.min(...xs)))/2)-Math.min(...xs),oy=Math.floor((ST_GY-1-(Math.max(...ys)-Math.min(...ys)))/2)-Math.min(...ys);
  sst.atoms=[];sst.bonds=[];sst.marks=[];sst.sel=null;sst.nid=1;
  const ids=at.map(a=>stAdd(a.el,a.x+ox,a.y+oy).id);
  (m[2]?m[2].split(','):[]).forEach(t=>{const r=t.trim().match(/^(\d+)([-=#])(\d+)$/);if(r)sst.bonds.push({a:ids[+r[1]],b:ids[+r[3]],o:{'-':1,'=':2,'#':3}[r[2]]})});
  stFillH();sst.name=m[0];sst.nameFor=stFormulas();
}

// Losse moleculen (samenhangende delen), van links naar rechts
function stFrags(){const seen=new Set(),out=[];
  for(const a of sst.atoms){if(seen.has(a.id))continue;const f=[],q=[a.id];seen.add(a.id);
    while(q.length){const id=q.pop();f.push(id);stNb(id).forEach(n=>{if(!seen.has(n.id)){seen.add(n.id);q.push(n.id)}})}
    out.push(f)}
  return out.sort((p,q)=>Math.min(...p.map(i=>stAt(i).x))-Math.min(...q.map(i=>stAt(i).x)));
}
// Molecuulformule: C, H, dan alfabetisch, bijv. 'C_{2}H_{6}O'
function stFormula(ids){const c={};ids.forEach(id=>{const e=stAt(id).el;c[e]=(c[e]||0)+1});const ks=Object.keys(c).sort();
  // zonder C: zoals in de les, dus H vooraan (H₂O, HCl) behalve bij N en P (NH₃, PH₃)
  const first=c.C?['C','H']:(c.N||c.P)?['N','P','H']:['H'];
  const ord=[...first.filter(k=>c[k]),...ks.filter(k=>!first.includes(k))];
  return ord.map(k=>k+(c[k]>1?'_{'+c[k]+'}':'')).join('')}
const stFormulas=()=>stFrags().map(stFormula).join(', ');
// De naam van een voorbeeld geldt niet meer als het molecuul daarna is veranderd; een zelf getypte naam altijd wel
const stName=()=>!sst.nameFor||sst.nameFor===stFormulas()?sst.name.trim():'';
if(stNew)stLoad(sst.preset);   // eerste bezoek: begin met ethanol

function stCheck(){const w=[],bad=new Set();
  if(!sst.atoms.length){w.push('Er is nog niets getekend. Kies een voorbeeld of klik op het rooster.');return{w,bad}}
  const over={},under={};
  sst.atoms.forEach(a=>{const v=ST_VAL[a.el];if(v==null)return;const n=stOrder(a.id);
    if(n>v){bad.add(a.id);over[a.el]=(over[a.el]||0)+1}else if(n<v){bad.add(a.id);under[a.el]=(under[a.el]||0)+1}});
  const naam=e=>(EL.find(x=>x&&x[0]===e)||[0,ST_NAAM[e]||e])[1];
  const zin=(e,c,wat)=>`${c===1?'Eén':c} ${e}-atoom${c>1?'en hebben':' heeft'} ${wat} bindingen (${naam(e)} vormt er ${ST_VAL[e]}).`;
  for(const[e,c]of Object.entries(over))w.push(zin(e,c,'te veel'));
  for(const[e,c]of Object.entries(under))w.push(zin(e,c,'te weinig')+(e==='H'?'':' Klik op ‘Vul H-atomen aan’ of maak een dubbele binding.'));
  return{w,bad};
}

/* ---------- Tekenen ---------- */
// Posities in roostereenheden; een schuine binding naar een eind-H wordt korter getekend (oogt als 120°).
function stPos(){const P=new Map();sst.atoms.forEach(a=>P.set(a.id,{x:a.x,y:a.y}));
  sst.atoms.forEach(a=>{if(!stTermH(a))return;const p=stAt(stNb(a.id)[0].id);
    if(a.x!==p.x&&a.y!==p.y)P.set(a.id,{x:p.x+(a.x-p.x)*.75,y:p.y+(a.y-p.y)*.75})});
  return P;
}
// o: {S, F, grouped, hMode, lp, marks, ed}  → {s: svg, B: omhullende}
function stDraw(o){
  const S=o.S,F=o.F;let s='';const B={x0:Infinity,y0:Infinity,x1:-Infinity,y1:-Infinity};
  const ext=(x0,y0,x1,y1)=>{B.x0=Math.min(B.x0,x0);B.y0=Math.min(B.y0,y0);B.x1=Math.max(B.x1,x1);B.y1=Math.max(B.y1,y1)};
  const SX=o.grouped?S*1.6:S;   // gegroepeerd: meer ruimte voor CH₃ en CH₂
  const P=new Map([...stPos()].map(([id,p])=>[id,{x:p.x*SX,y:p.y*S}]));
  // Labels: welk atoom krijgt welke tekst, en hoe ver steekt die links en rechts uit
  const L=new Map();
  sst.atoms.forEach(a=>{const we=textW(a.el,F)/2;
    if(o.grouped){if(stTermH(a))return;
      const nb=stNb(a.id).map(n=>stAt(n.id));const nH=nb.filter(stTermH).length,heavy=nb.filter(b=>!stTermH(b));
      const hs=nH?'H'+(nH>1?'_'+nH:''):'',wh=textW(hs,F);
      const rev=nH&&heavy.length&&heavy.every(b=>b.x>a.x);   // H₃C– en HO– als de rest rechts zit
      L.set(a.id,rev?{txt:hs+a.el,anchor:'end',dx:we,left:we+wh,right:we}:{txt:a.el+hs,anchor:'start',dx:-we,left:we,right:we+wh});
    }else{const t=stTermH(a);if(t&&o.hMode==='hide')return;
      L.set(a.id,{txt:a.el,anchor:'middle',dx:0,left:we,right:we,blank:t&&o.hMode==='blank'})}});
  const H2=F*.42;
  const clip=(id,ux,uy)=>{const l=L.get(id);const ex=ux>0?l.right:l.left;
    return Math.min(Math.abs(ux)>1e-6?ex/Math.abs(ux):Infinity,Math.abs(uy)>1e-6?H2/Math.abs(uy):Infinity)+F*.2};
  // Editor: selectie, fout aantal bindingen en mogelijke plekken naast het geselecteerde atoom
  if(o.ed){const sel=o.ed.sel&&stAt(o.ed.sel);
    if(sel){const p=P.get(sel.id);s+=`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${r1(F*.95)}" fill="#e1ebfb" stroke="#1f5fbf" stroke-width="1.5"/>`;
      if(o.ed.tool==='draw')ST_DIRS.forEach(([dx,dy])=>{const x=sel.x+dx,y=sel.y+dy;if(stIn(x,y)&&!stAtXY(x,y))s+=`<circle cx="${x*S}" cy="${y*S}" r="4.5" fill="#1f5fbf" opacity=".45"/>`})}
    o.ed.bad.forEach(id=>{const p=P.get(id);if(p)s+=`<circle cx="${r1(p.x)}" cy="${r1(p.y)}" r="${r1(F*.85)}" fill="none" stroke="#d9480f" stroke-width="1.5" stroke-dasharray="3 2.5"/>`})}
  // Bindingen
  const sw=r1(S*.034);
  sst.bonds.forEach(b=>{if(!L.has(b.a)||!L.has(b.b))return;const pa=P.get(b.a),pb=P.get(b.b);
    const len=Math.hypot(pb.x-pa.x,pb.y-pa.y),ux=(pb.x-pa.x)/len,uy=(pb.y-pa.y)/len,nx=-uy,ny=ux;
    const ca=clip(b.a,ux,uy),cb=clip(b.b,-ux,-uy),gap=S*(b.o===3?.1:.075);
    for(let k=0;k<b.o;k++){const off=(k-(b.o-1)/2)*gap;const x1=pa.x+ux*ca+nx*off,y1=pa.y+uy*ca+ny*off,x2=pb.x-ux*cb+nx*off,y2=pb.y-uy*cb+ny*off;
      s+=`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="#000" stroke-width="${sw}"/>`;ext(Math.min(x1,x2),Math.min(y1,y2),Math.max(x1,x2),Math.max(y1,y2))}});
  // Atoomsymbolen, vrije elektronenparen en letters
  const away=(l,t,extra)=>Math.abs(Math.cos(t))*(Math.cos(t)>0?l.right:l.left)+Math.abs(Math.sin(t))*H2+extra;
  const letters=ST_LET[o.markStyle||'a'];
  L.forEach((l,id)=>{const a=stAt(id),p=P.get(id);ext(p.x-l.left,p.y-F*.6,p.x+l.right,p.y+F*.6);
    if(!l.blank)s+=fmt(l.txt,p.x+l.dx,p.y+F*.36,F,l.anchor);
    const occ=stNb(id).map(n=>{const q=P.get(n.id);return Math.atan2(q.y-p.y,q.x-p.x)*180/Math.PI});
    if(l.right>l.left+2)occ.push(0);if(l.left>l.right+2)occ.push(180);
    let lpd=[];const ve=ST_VE[a.el];
    if(o.lp!=='none'&&!o.grouped&&ve){const n=Math.floor((ve-stOrder(id))/2);if(n>0&&n<=4)lpd=freeDirs(occ,n,25)}
    lpd.forEach(d=>{const t=d*Math.PI/180,r=away(l,t,F*.32),cx=p.x+r*Math.cos(t),cy=p.y+r*Math.sin(t),nx=-Math.sin(t),ny=Math.cos(t);
      if(o.lp==='dot'){const q=F*.17;s+=`<circle cx="${r1(cx+nx*q)}" cy="${r1(cy+ny*q)}" r="${r1(F*.1)}"/><circle cx="${r1(cx-nx*q)}" cy="${r1(cy-ny*q)}" r="${r1(F*.1)}"/>`}
      else{const q=F*.31;s+=`<line x1="${r1(cx+nx*q)}" y1="${r1(cy+ny*q)}" x2="${r1(cx-nx*q)}" y2="${r1(cy-ny*q)}" stroke="#000" stroke-width="${sw}"/>`}
      ext(cx-F*.35,cy-F*.35,cx+F*.35,cy+F*.35)});
    const mi=o.marks?sst.marks.indexOf(id):-1;
    if(mi>=0){const d=freeDirs([...occ,...lpd],1,-10)[0],t=d*Math.PI/180,r=away(l,t,F*.62),cx=p.x+r*Math.cos(t),cy=p.y+r*Math.sin(t);
      const tx=letters?letters[mi%26]:String(mi+1),fs=F*.78;
      s+=`<text x="${r1(cx)}" y="${r1(cy+fs*.35)}" font-size="${r1(fs)}" font-style="italic" text-anchor="middle" ${HALO}>${tx}</text>`;ext(cx-fs*.5,cy-fs*.6,cx+fs*.5,cy+fs*.6)}
  });
  return{s,B};
}

/* ---------- Figuur om te kopiëren ---------- */
function stSVG(opt){
  if(!sst.atoms.length)return svgWrap(220,60,'');
  const[S,F]=ST_SIZE[sst.size]||ST_SIZE.M;const D=stDraw(Object.assign({S,F},opt));const M=16;
  const lab=opt.label==='formula'?stFormulas():opt.label==='name'?stName():opt.label==='both'?stFormulas()+(stName()?'  ('+stName()+')':''):'';
  const w=D.B.x1-D.B.x0,h=D.B.y1-D.B.y0;
  const W=Math.max(w+2*M,opt.title?textW(opt.title,17)+2*M:0,lab?textW(lab,16)+2*M:0,opt.caption?textW(opt.caption,15)+2*M:0);
  let top=M,body='';if(opt.title){body+=fmt(opt.title,M,top+16,17,'start','font-weight="700"');top+=32}
  body+=`<g transform="translate(${r1((W-w)/2-D.B.x0)},${r1(top-D.B.y0)})">${D.s}</g>`;let y=top+h;
  if(lab){y+=26;body+=fmt(lab,W/2,y,16,'middle')}
  if(opt.caption){y+=24;body+=fmt(opt.caption,W/2,y,15,'middle')}
  return svgWrap(W,y+M,body);
}
const stOpt=()=>({grouped:sst.view==='grouped',hMode:sst.hMode,lp:sst.lp,marks:true,markStyle:sst.markStyle,label:sst.label,title:sst.title,caption:sst.caption});
function stWarn(){const{w,bad}=stCheck();lastWarn=w;
  if(sst.label==='name'&&sst.atoms.length&&!stName())lastWarn.push(sst.name.trim()?`Het molecuul is veranderd, dus ‘${sst.name.trim()}’ klopt misschien niet meer. Typ de naam opnieuw in.`:'Vul een naam in, of kies iets anders onder de figuur.');
  if(stNote){lastWarn.unshift(stNote);stNote=''}return bad}
function buildST(){stWarn();return stSVG(stOpt())}

/* ---------- Editor ---------- */
function stView(){const bad=stWarn();const E=ST_E,W=ST_M*2+(ST_GX-1)*E,H=ST_M*2+(ST_GY-1)*E;let g='';
  for(let y=0;y<ST_GY;y++)for(let x=0;x<ST_GX;x++)g+=`<circle cx="${x*E}" cy="${y*E}" r="1.7" fill="#c3cad5"/>`;
  const D=stDraw({S:E,F:17,grouped:false,hMode:'show',lp:sst.lp,marks:true,markStyle:sst.markStyle,ed:{sel:sst.sel,bad,tool:sst.tool}});
  return svgWrap(W,H,`<g transform="translate(${ST_M},${ST_M})">${g}${D.s}</g>`).replace('<svg ','<svg style="cursor:crosshair;touch-action:manipulation" role="img" aria-label="Tekenvlak" ');
}
function segDist(px,py,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(px-a.x-t*dx,py-a.y-t*dy)}
function stPaperClick(e){const svg=e.currentTarget.querySelector('svg');if(!svg||!svg.getScreenCTM)return false;
  const pt=svg.createSVGPoint();pt.x=e.clientX;pt.y=e.clientY;const q=pt.matrixTransform(svg.getScreenCTM().inverse());
  const x=(q.x-ST_M)/ST_E,y=(q.y-ST_M)/ST_E,P=stPos();
  let hitA=null,d0=.4;sst.atoms.forEach(a=>{const p=P.get(a.id),d=Math.hypot(p.x-x,p.y-y);if(d<d0){d0=d;hitA=a}});
  let hitB=null;if(!hitA){let b0=.2;sst.bonds.forEach(b=>{const d=segDist(x,y,P.get(b.a),P.get(b.b));if(d<b0){b0=d;hitB=b}})}
  const gx=Math.round(x),gy=Math.round(y);
  const pt2=!hitA&&!hitB&&Math.hypot(gx-x,gy-y)<.45&&stIn(gx,gy)&&!stAtXY(gx,gy)?{x:gx,y:gy}:null;
  return stClick(hitA,hitB,pt2);
}
function stClick(a,b,pt){
  if(sst.tool==='erase'){if(a){stSave();stDel(a.id)}else if(b){stSave();sst.bonds=sst.bonds.filter(x=>x!==b)}else return false;return}
  if(sst.tool==='mark'){if(!a)return false;stSave();const i=sst.marks.indexOf(a.id);if(i<0)sst.marks.push(a.id);else sst.marks.splice(i,1);return}
  if(b){stSave();b.o=b.o%3+1;return}                                   // enkel → dubbel → drievoudig → enkel
  if(pt){stSave();const s=sst.sel&&stAt(sst.sel);const n=stAdd(sst.el,pt.x,pt.y);
    if(s&&stAdj(s,n))sst.bonds.push({a:s.id,b:n.id,o:1});
    sst.sel=n.el==='H'&&s?s.id:n.id;return}                             // na een H blijft het vorige atoom gekozen
  if(a){if(sst.sel===a.id){sst.sel=null;return}const s=sst.sel&&stAt(sst.sel);
    if(s&&stAdj(s,a)&&!stBond(s.id,a.id)){stSave();sst.bonds.push({a:s.id,b:a.id,o:1})}
    sst.sel=a.id;return}
  sst.sel=null;
}
function stSetEl(el){sst.el=el;const a=sst.sel&&stAt(sst.sel);if(a&&a.el!==el){stSave();a.el=el}}

/* ---------- Paneel ---------- */
function stPanel(){const t=sst.tool,sel=sst.sel&&stAt(sst.sel);
  const hint={draw:'Klik op een leeg punt om een atoom te zetten. Is er al een atoom gekozen (blauw), dan komt er meteen een binding bij als het nieuwe punt ernaast ligt. Klik twee buuratomen na elkaar aan om ze te verbinden. Klik op een binding om te wisselen tussen enkel, dubbel en drievoudig.',
    erase:'Klik op een atoom of een binding om die weg te halen.',
    mark:'Klik op een atoom om er een letter bij te zetten, bijvoorbeeld voor een vraag als “Welk C-atoom …”. Nog een keer klikken haalt de letter weg.'}[t];
  let h=`<div class="sec"><h3>Molecuul</h3>
    <div class="row"><label for="stp">Begin met een voorbeeld</label><select id="stp" data-k="preset" data-rebuild><option value="">Kies een molecuul …</option>${Object.entries(ST_LIB).map(([g,l])=>`<optgroup label="${g}">${Object.entries(l).map(([id,v])=>`<option value="${id}" ${sst.preset===id?'selected':''}>${esc(v[0])}</option>`).join('')}</optgroup>`).join('')}</select></div>
    <div class="row"><span class="lab">Gereedschap</span>${seg('tool',[['draw','Tekenen'],['erase','Gum'],['mark','Letters']],t)}</div>
    ${t==='draw'?`<div class="row"><span class="lab">Atoom${sel?' (verandert ook het gekozen atoom)':''}</span><div class="seg" role="group">${ST_ELS.map(e=>`<button type="button" data-act="el" data-val="${e}" aria-pressed="${sst.el===e}">${e}</button>`).join('')}</div></div>`:''}
    <p class="hint" style="margin:0">${hint}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" data-act="fillH">Vul H-atomen aan</button><button class="btn" data-act="delH">Haal H-atomen weg</button>
      <button class="btn" data-act="undo" ${stHist.length?'':'disabled'}>Ongedaan maken</button><button class="btn" data-act="clear">Alles wissen</button></div>
    <p class="hint" style="margin:0">Toetsenbord: Delete wist het gekozen atoom, Ctrl+Z maakt ongedaan, C, H, O, N, S, P, F of I kiest een atoom.</p></div>
  <div class="sec"><h3>Weergave</h3>
    <div class="row"><span class="lab">Soort structuurformule</span>${seg('view',[['full','Volledig'],['grouped','Gegroepeerd (CH₃–CH₂–OH)']],sst.view)}</div>
    ${sst.view==='full'?`<div class="row"><span class="lab">Vrije elektronenparen</span>${seg('lp',[['none','Niet tonen'],['line','Streepjes'],['dot','Puntjes']],sst.lp)}</div>`:''}
    <div class="row"><span class="lab">Grootte</span>${seg('size',[['S','Klein'],['M','Middel'],['L','Groot']],sst.size)}</div>
    <div class="row"><span class="lab">Onder de figuur</span>${seg('label',[['none','Niets'],['formula','Molecuulformule'],['name','Naam']],sst.label)}</div>
    <div class="row"><label for="stn">Naam</label><input type="text" id="stn" data-k="name" value="${esc(sst.name)}"></div>
    <div class="row"><label for="stt">Titel (leeg = geen)</label><input type="text" id="stt" data-k="title" value="${esc(sst.title)}"></div>
    <div class="row"><label for="stc">Onderschrift (bijv. A, B, C of D)</label><input type="text" id="stc" data-k="caption" value="${esc(sst.caption)}"></div></div>
  <div class="sec"><h3>Voor een toets</h3>
    ${sst.view==='full'?`<div class="row"><span class="lab">H-atomen</span>${seg('hMode',[['show','Tonen'],['blank','Lege plekken'],['hide','Weglaten']],sst.hMode)}</div>
    <p class="hint" style="margin:0">Lege plekken: de streepjes naar H blijven staan, de leerling vult de H-atomen in. Weglaten: alleen het koolstofskelet en de andere atomen.</p>`:''}
    <div class="row"><span class="lab">Letters bij atomen</span>${seg('markStyle',[['a','a, b, c'],['A','A, B, C'],['1','1, 2, 3']],sst.markStyle)}</div>
    <p class="hint" style="margin:0">Zet letters met het gereedschap ‘Letters’ hierboven.</p>
    <div class="row"><span class="lab">Uitwerking</span>${seg('answer',[['off','Verbergen'],['on','Tonen']],sst.answer)}</div>
    <p class="hint" style="margin:0">De uitwerking (volledige structuurformule met molecuulformule) staat onder de figuur, niet in de afbeelding zelf.</p></div>`;
  return h;
}
const STRUCT={key:'sf.structuur',st:()=>sst,build:buildST,view:stView,panel:stPanel,paperClick:stPaperClick,
  onChange:k=>{if(k==='preset'&&sst.preset){stSave();stLoad(sst.preset)}if(k==='tool')sst.sel=null;if(k==='name')sst.nameFor=''},
  act:(a,b)=>{
    if(a==='el')stSetEl(b.dataset.val);
    if(a==='fillH'){stSave();const n=stFillH();if(n)stNote=`Er was geen plek voor ${n} H-atoom${n>1?'en':''}. Zet ${n>1?'die':'dat'} zelf neer.`}
    if(a==='delH'){stSave();sst.atoms.filter(x=>x.el==='H').forEach(x=>stDel(x.id))}
    if(a==='undo')stUndo();
    if(a==='clear'){stSave();sst.atoms=[];sst.bonds=[];sst.marks=[];sst.sel=null;sst.preset='';sst.name='';sst.nameFor=''}},
  extra:()=>{if(!sst.atoms.length)return'';
    const box=(t,svg)=>`<div class="kind"><strong style="font-size:13px">${t}</strong><div class="st-prev">${svg}</div></div>`;
    let h=box('Zo wordt de afbeelding gekopieerd',stSVG(stOpt()));
    if(sst.answer==='on')h+=box('Uitwerking',stSVG({grouped:false,hMode:'show',lp:sst.lp,marks:true,markStyle:sst.markStyle,label:'both'}));
    return h}};

// Sneltoetsen, alleen op de pagina van deze generator en niet tijdens typen in een invoerveld
if(typeof document.addEventListener==='function')document.addEventListener('keydown',e=>{
  if(route()!=='structuur'||/^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName||''))return;
  let done=true;
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z')stUndo();
  else if((e.key==='Delete'||e.key==='Backspace')&&sst.sel){stSave();stDel(sst.sel)}
  else if(e.key==='Escape')sst.sel=null;
  else if(!e.ctrlKey&&!e.metaKey&&!e.altKey&&ST_ELS.includes(e.key.toUpperCase()))stSetEl(e.key.toUpperCase());
  else done=false;
  if(done){e.preventDefault();STRUCT.refresh&&STRUCT.refresh()}});

GEN.structuur=()=>mountGen(STRUCT);
