// Kern: menu, gedeelde hulpjes, generator-koppeling en exporteren.
// Elke generator in js/generatoren/ registreert zich met GEN.<id> = mountfunctie.

/* ---------- Generator-menu ---------- */
const GENS=[
 ['Aflezen',[['volume','Volume aflezen'],['onderdompeling','Onderdompelmethode'],['gasspuit','Gasspuit'],['lengte','Lengte'],['massa','Massa'],['temperatuur','Temperatuur'],['ph','pH']]],
 ['Grafieken',[['titratie','Titratiecurve'],['opwarmcurve','Opwarm-/afkoelcurve'],['energie','Energiediagram'],['halveringstijd','Halveringstijd'],['lijnspectrum','Lijnspectrum'],['massaspectrum','Massaspectrum'],['pes','Foto-elektronspectrum']]],
 ['Atoombouw en binding',[['deeltjes','Deeltjesmodel'],['metaal','Metaalrooster'],['bohr','Bohr-model'],['nuclide','Nuclidenotatie'],['lewis','Lewisstructuur'],['atoombinding','Atoombinding'],['orbitaal','Orbitaaldiagram']]],
 ['Reacties',[['reactie','Reactievergelijkingen'],['botsing','Botsende-deeltjesmodel']]],
 ['Structuurformules',[['structuur','Structuurformule-editor']]]
];

/* Generatoren registreren zich hier (id uit GENS → functie die de generator opbouwt) */
const GEN={};
let curBuild=()=>'';
function route(){return (location.hash||'#deeltjes').slice(1)}
function renderNav(){
  const cur=route();
  document.getElementById('nav').innerHTML=GENS.map(([g,items])=>`<div class="navgroup"><h2>${g}</h2><div class="chips">${
    items.map(([id,n])=>(id in GEN)
      ?`<a class="chip" href="#${id}" ${cur===id?'aria-current="page"':''} style="text-decoration:none">${n}</a>`
      :`<span class="chip soon" title="Komt nog">${n}</span>`).join('')}</div></div>`).join('');
}

/* ---------- Gedeelde constanten ---------- */
const SIZES={XS:6,S:9,M:12,L:16,XL:20};
const SHADES=[{n:'Wit',c:'#ffffff'},{n:'Lichtgrijs',c:'#d6d6d6'},{n:'Grijs',c:'#a0a0a0'},{n:'Donkergrijs',c:'#5a5a5a'},{n:'Zwart',c:'#1a1a1a'},{n:'Gestippeld',p:'dots'},{n:'Gearceerd',p:'hatch'}];
const BW=300,BH=220,PAD=8;
const clone=o=>JSON.parse(JSON.stringify(o));

/* ---------- Hulpjes ---------- */
function rng(seed){let a=seed>>>0||1;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function shuffle(arr,r){for(let i=arr.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const r1=n=>Math.round(n*10)/10;
function parseFmt(str){
  const segs=[];let i=0,buf='';
  const push=(t,m)=>{if(t)segs.push({t,m})};
  while(i<str.length){const ch=str[i];
    if((ch==='_'||ch==='^')&&i+1<str.length){push(buf,'');buf='';const m=ch==='_'?'sub':'sup';let t;
      if(str[i+1]==='{'){const e=str.indexOf('}',i+2);t=e<0?str.slice(i+2):str.slice(i+2,e);i=e<0?str.length:e+1}else{t=str[i+1];i+=2}
      if(m==='sup')t=t.replace(/-/g,'−');push(t,m)}
    else{buf+=ch;i++}}
  push(buf,'');return segs;
}
function fmt(str,x,y,size,anchor='start',extra=''){
  let cur=0;const ts=parseFmt(str).map(s=>{const tgt=s.m==='sub'?size*.28:s.m==='sup'?-size*.42:0;const dy=r1(tgt-cur);cur=tgt;
    const fs=s.m?size*.68:size;const lead=(s.t.match(/^ +/)||[''])[0].length;const t2=s.t.slice(lead).replace(/ +$/,'');const trail=s.t.length-lead-t2.length;
    if(!t2)return trail+lead?`<tspan dy="${dy}" dx="${r1((lead+trail)*fs*.28)}"></tspan>`:'';
    return `<tspan dy="${dy}"${lead?` dx="${r1(lead*fs*.28)}"`:''} font-size="${r1(fs)}">${esc(t2)}</tspan>${trail?`<tspan dx="${r1(trail*fs*.28)}"></tspan>`:''}`}).join('');
  return `<text x="${r1(x)}" y="${r1(y)}" font-size="${size}" text-anchor="${anchor}" ${extra}>${ts}</text>`;
}
const mctx=document.createElement('canvas').getContext('2d');
function textW(str,size){let w=0;for(const s of parseFmt(str)){mctx.font=`${s.m?size*.68:size}px Arial`;w+=mctx.measureText(s.t).width}return w}
const fillOf=i=>{const s=SHADES[i]||SHADES[0];return s.p?`url(#pf-${s.p})`:s.c};
const darkOf=i=>i===3||i===4;


let lastWarn=[];

/* ---------- Bedieningselementen ---------- */
const seg=(path,opts,cur)=>`<div class="seg" role="group">${opts.map(([v,l])=>`<button type="button" data-set="${path}" data-val="${v}" aria-pressed="${String(cur)===String(v)}">${l}</button>`).join('')}</div>`;
// setP: alleen voor deeltjesmodel (st) en metaalrooster (mt.…)
function setP(p,v){let root=st;if(p.startsWith('mt.')){root=mt;p=p.slice(3)}const ks=p.split('.');const last=ks.pop();const o=ks.reduce((o,k)=>o[k],root);o[last]=v}
const swatch=(path,j,cur)=>{const s=SHADES[j];const bg=s.p==='dots'?'radial-gradient(#000 1.2px,#fff 1.4px) 0 0/5px 5px':s.p==='hatch'?'repeating-linear-gradient(45deg,#000 0 1.3px,#fff 1.3px 4px)':s.c;
  return `<button type="button" class="sw" style="background:${bg}" data-set="${path}" data-val="${j}" data-num aria-pressed="${cur===j}" aria-label="${s.n}" title="${s.n}"></button>`};

function appHTML(){return `<div class="app">
    <div class="panel" id="panel"></div>
    <div class="stage">
      <div class="paper" id="paper"></div>
      <div id="warns" style="display:flex;flex-direction:column;gap:6px"></div>
      <div class="actions">
        <button class="btn primary" data-act="copyimg">Kopieer als afbeelding</button>
        <button class="btn" data-act="showpng">Toon als PNG</button>
        <button class="btn" data-act="copysvg">Kopieer SVG-code</button>
        <span class="toast" id="toast" role="status"></span>
      </div>
      <div class="png-out" id="pngout" hidden></div>
    </div></div>`}
function bindActions(){document.querySelector('.actions').addEventListener('click',e=>{const a=e.target.closest('button')?.dataset.act;if(!a)return;
    if(a==='copysvg')copySVG();if(a==='copyimg')copyImg();if(a==='showpng')showPNG()})}

/* ---------- Algemene generator-koppeling ---------- */
function setPath(obj,p,v){const ks=p.split('.');const last=ks.pop();const o=ks.reduce((o,k)=>o[k],obj);o[last]=v}
const svgWrap=(W,H,body)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(W)}" height="${Math.ceil(H)}" viewBox="0 0 ${Math.ceil(W)} ${Math.ceil(H)}" font-family="Arial, Helvetica, sans-serif" fill="#000"><rect width="${Math.ceil(W)}" height="${Math.ceil(H)}" fill="#fff"/>${body}</svg>`;
function mountGen(g){
  curBuild=()=>g.build();
  document.getElementById('main').innerHTML=appHTML();bindActions();
  const panel=document.getElementById('panel');
  const rp=()=>{panel.innerHTML=g.panel()};
  const rf=()=>{document.getElementById('paper').innerHTML=g.view?g.view():g.build();
    document.getElementById('warns').innerHTML=lastWarn.map(w=>`<div class="warn">${esc(w)}</div>`).join('')+(g.extra?g.extra():'');
    try{localStorage.setItem(g.key,JSON.stringify(g.st()))}catch(e){}};
  rp();rf();g.refresh=()=>{rp();rf()};
  // view(): eigen weergave in het papier (bijv. een editor); paperClick(e): klikken op de figuur bewerkt hem
  if(g.paperClick)document.getElementById('paper').addEventListener('click',e=>{if(g.paperClick(e)===false)return;rp();rf()});
  panel.addEventListener('input',e=>{const el=e.target;if(!el.dataset.k||el.tagName==='SELECT')return;let v=el.value;
    if('num' in el.dataset||'dec' in el.dataset){const n='dec' in el.dataset?parseFloat(String(v).replace(',','.')):parseInt(v);if(isNaN(n))return;v=Math.max(+el.min||0,Math.min(el.max===''?999:+el.max,n))}setPath(g.st(),el.dataset.k,v);if(g.onChange)g.onChange(el.dataset.k);rf()});
  panel.addEventListener('change',e=>{const el=e.target;if(el.tagName!=='SELECT'||!el.dataset.k)return;let v=el.value;if('num' in el.dataset)v=+v;
    setPath(g.st(),el.dataset.k,v);if(g.onChange)g.onChange(el.dataset.k);if('rebuild' in el.dataset)rp();rf()});
  panel.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.set){let v=b.dataset.val;if('num' in b.dataset)v=+v;setPath(g.st(),b.dataset.set,v);if(g.onChange)g.onChange(b.dataset.set)}
    else if(b.dataset.act){if(g.act(b.dataset.act,b)===false)return}else return;
    rp();rf()});
}

/* ---------- Gedeelde grafiekhulpjes ---------- */
const nlNum=(v,d=0)=>{const s=Math.abs(v).toLocaleString('nl-NL',{maximumFractionDigits:d});return (v<0&&s!=='0'?'−':'')+s};
const sgnNum=(v,d=0)=>(v>0?'+':'')+nlNum(v,d);
function niceStep(span,target){const raw=Math.max(span,1e-9)/target;const mag=Math.pow(10,Math.floor(Math.log10(raw)));const n=raw/mag;return (n<1.5?1:n<3?2:n<7?5:10)*mag}
const HALO='stroke="#fff" stroke-width="4" stroke-linejoin="round" paint-order="stroke"';
function vArrow(x,y1,y2,w=1.6){const d=y2>y1?1:-1;return `<line x1="${r1(x)}" y1="${r1(y1)}" x2="${r1(x)}" y2="${r1(y2-d*9)}" stroke="#000" stroke-width="${w}"/><polygon points="${r1(x)},${r1(y2)} ${r1(x-4.5)},${r1(y2-d*11)} ${r1(x+4.5)},${r1(y2-d*11)}" fill="#000"/>`}
const dash=(x1,y1,x2,y2,da='5 4',w=1)=>`<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke="#000" stroke-width="${w}" stroke-dasharray="${da}"/>`;
function axesArrows(ML,MT,W,H){return `<line x1="${ML}" y1="${MT+H}" x2="${ML}" y2="${MT-12}" stroke="#000" stroke-width="1.6"/><polygon points="${ML},${MT-20} ${ML-5},${MT-8} ${ML+5},${MT-8}" fill="#000"/>`+
  `<line x1="${ML}" y1="${MT+H}" x2="${ML+W+10}" y2="${MT+H}" stroke="#000" stroke-width="1.6"/><polygon points="${ML+W+18},${MT+H} ${ML+W+6},${MT+H-5} ${ML+W+6},${MT+H+5}" fill="#000"/>`}

/* ---------- Exporteren ---------- */
function toast(t){const el=document.getElementById('toast');el.textContent=t;clearTimeout(toast.t);toast.t=setTimeout(()=>el.textContent='',4000)}
function pngBlob(){return new Promise((res,rej)=>{const svg=curBuild();const img=new Image();
  img.onload=()=>{const s=3,c=document.createElement('canvas');c.width=img.width*s;c.height=img.height*s;const x=c.getContext('2d');
    x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);c.toBlob(b=>b?res(b):rej(),'image/png')};
  img.onerror=rej;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}
function copyImg(){
  try{const item=new ClipboardItem({'image/png':pngBlob()});
    navigator.clipboard.write([item]).then(()=>toast('Gekopieerd. Plak met Ctrl+V of Cmd+V in Word of PowerPoint.'),()=>{showPNG();toast('Kopiëren mag hier niet; klik met rechts op de afbeelding hieronder.')})}
  catch(e){showPNG();toast('Kopiëren mag hier niet; klik met rechts op de afbeelding hieronder.')}
}
function showPNG(){pngBlob().then(b=>{const u=URL.createObjectURL(b);const o=document.getElementById('pngout');
  o.innerHTML=`<span class="hint">Klik met rechts (of houd ingedrukt) op de afbeelding om te kopiëren of op te slaan.</span><img src="${u}" alt="Deeltjesmodel als PNG">`;o.hidden=false})}
function copySVG(){const s=curBuild();
  navigator.clipboard.writeText(s).then(()=>toast('SVG-code gekopieerd.'),()=>{const o=document.getElementById('pngout');
    o.innerHTML=`<textarea readonly style="width:100%;height:140px;font:12px var(--f-mono)">${esc(s)}</textarea>`;o.hidden=false;o.querySelector('textarea').select();toast('Selecteer de code hieronder en kopieer.')})}

