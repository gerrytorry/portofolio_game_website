/* NAVBAR PUBLIK: garis aktif diam, teks tetap normal. */
(() => {
 const nav=document.querySelector('#nav');
 if(!nav)return;
 const file=location.pathname.split('/').pop()||'index.html';
 const links=[...nav.querySelectorAll('a[href]')];
 const logoHome=sessionStorage.getItem('miya-home-by-logo')==='yes';
 const target=link=>new URL(link.getAttribute('href'),location.href).pathname.split('/').pop();
 const active=links.find(link=>{
  const name=target(link);
  if(file.startsWith('project-'))return name==='projects.html';
  if(file.startsWith('service-'))return name==='services.html';
  return name===file&&!(file==='index.html'&&logoHome);
 });
 links.forEach(link=>{
  link.classList.toggle('miya-current-page',link===active);
  if(link===active)link.setAttribute('aria-current','page');
  else link.removeAttribute('aria-current');
  link.addEventListener('click',()=>sessionStorage.removeItem('miya-home-by-logo'));
 });
 document.querySelector('#header .brand')?.addEventListener('click',()=>sessionStorage.setItem('miya-home-by-logo','yes'));
})();
