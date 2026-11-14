// Start: kies de generator uit de #hash in de adresbalk (standaard: deeltjesmodel).
function mount(){renderNav();const r=route();(GEN[r]||GEN.deeltjes)();}
window.addEventListener('hashchange',mount);
mount();
