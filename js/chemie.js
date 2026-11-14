// Gedeelde scheikundedata: elementen, schilverdeling, ionnamen en elektronsymbolen.
// Gebruikt door Bohr-model, Lewisstructuren en Atoombinding.

/* ---------- Elementen ---------- */
const EL=[null,['H','waterstof',1],['He','helium',4],['Li','lithium',7],['Be','beryllium',9],['B','boor',11],['C','koolstof',12],['N','stikstof',14],['O','zuurstof',16],['F','fluor',19],['Ne','neon',20],
 ['Na','natrium',23],['Mg','magnesium',24],['Al','aluminium',27],['Si','silicium',28],['P','fosfor',31],['S','zwavel',32],['Cl','chloor',35],['Ar','argon',40],['K','kalium',39],['Ca','calcium',40],
 ['Sc','scandium',45],['Ti','titaan',48],['V','vanadium',51],['Cr','chroom',52],['Mn','mangaan',55],['Fe','ijzer',56],['Co','kobalt',59],['Ni','nikkel',58],['Cu','koper',63],['Zn','zink',64],
 ['Ga','gallium',69],['Ge','germanium',74],['As','arseen',75],['Se','seleen',80],['Br','broom',79],['Kr','krypton',84]];
function shellsFor(z,q){
  const order=[[1,2],[2,2],[2,6],[3,2],[3,6],[4,2],[3,10],[4,6],[5,2]];
  const auf=e=>{const sh=[0,0,0,0,0,0];let left=e;for(const[n,c]of order){const t=Math.min(c,left);sh[n]+=t;left-=t;if(!left)break}return sh};
  let sh;
  if(q>0){sh=auf(z);if(z===24)sh=[0,2,8,13,1,0];if(z===29)sh=[0,2,8,18,1,0];let r=q;for(let n=5;n>=1&&r>0;n--){const t=Math.min(sh[n],r);sh[n]-=t;r-=t}}
  else{sh=auf(z-q);if(q===0&&z===24)sh=[0,2,8,13,1,0];if(q===0&&z===29)sh=[0,2,8,18,1,0]}
  sh=sh.slice(1);while(sh.length&&!sh[sh.length-1])sh.pop();return sh;
}
const ANI={H:'hydride',N:'nitride',O:'oxide',F:'fluoride',P:'fosfide',S:'sulfide',Cl:'chloride',Se:'selenide',Br:'bromide'};
const ionName=(z,q)=>q>0?EL[z][1]+'ion':q<0?(ANI[EL[z][0]]||EL[z][1])+'-ion':EL[z][1];
const chargeStr=q=>q===0?'':(Math.abs(q)>1?Math.abs(q):'')+(q>0?'+':'−');
const elOpts=(max,cur)=>EL.slice(1,max+1).map((e,i)=>`<option value="${i+1}" ${cur===i+1?'selected':''}>${i+1} · ${e[0]} · ${e[1]}</option>`).join('');
const Q_OPTS=[[-3,'3−'],[-2,'2−'],[-1,'−'],[0,'0'],[1,'+'],[2,'2+'],[3,'3+']];

function drawE(x,y,style){
  if(style==='grey')return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.8" fill="#9a9a9a" stroke="#000" stroke-width="1.2"/>`;
  if(style==='color')return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.8" fill="#d6402b" stroke="#000" stroke-width="1"/>`;
  if(style==='big')return `<circle cx="${r1(x)}" cy="${r1(y)}" r="6" fill="#000"/>`;
  if(style==='open')return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.3" fill="#fff" stroke="#000" stroke-width="1.4"/>`;
  if(style==='cross')return `<path d="M${r1(x-4)} ${r1(y-4)}L${r1(x+4)} ${r1(y+4)}M${r1(x+4)} ${r1(y-4)}L${r1(x-4)} ${r1(y+4)}" stroke="#000" stroke-width="1.8" fill="none"/>`;
  if(style==='e')return `<circle cx="${r1(x)}" cy="${r1(y)}" r="7" fill="#fff"/>`+fmt('e^-',x,y+4.5,12,'middle','font-style="italic"');
  return `<circle cx="${r1(x)}" cy="${r1(y)}" r="4.3" fill="#000"/>`;
}
