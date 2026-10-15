/* Shared MIYA MOTO interactions for every page. */
(()=>{const topButton=document.querySelector('.miya-back-top');if(!topButton)return;
const update=()=>topButton.classList.toggle('is-visible',window.scrollY>420);
window.addEventListener('scroll',update,{passive:true});update();
topButton.addEventListener('click',()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));
})();
