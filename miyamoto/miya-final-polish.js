// Penanda navbar aktif, dengan pengecualian saat pengguna mengklik logo.
(() => {
  'use strict';
  const nav=document.getElementById('nav');
  if(!nav)return;
  const path=location.pathname.split('/').pop()||'index.html';
  const current=path.startsWith('project-')?'projects.html':path.startsWith('service-')?'services.html':path;
  const links=[...nav.querySelectorAll('a[href]')];
  for(const link of links){
    const href=new URL(link.getAttribute('href'),location.href);
    const selected=href.pathname.split('/').pop()===current&&!href.hash&&current!=='index.html';
    link.classList.toggle('miya-current-page',selected);
    if(selected)link.setAttribute('aria-current','page');
  }
})();
