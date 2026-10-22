(() => {
  'use strict';
  // Script hanya disisipkan oleh router; tidak mengubah file website publik FIX(3).
  const params = new URLSearchParams(location.search);
  const inEditor = params.has('edit') && window.parent !== window;
  const page = location.pathname;
  const origin = location.origin;
  let edit = false;
  let targets = new Map();
  const language = 'en';
  let lastValues = {};
  const originalValues = new Map();

  function key(node) {
    const parts = [];
    let current = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (current && current !== document.body) {
      parts.push(Array.prototype.indexOf.call(current.parentElement?.children || [], current));
      current = current.parentElement;
    }
    parts.push('body');
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push('t' + Array.prototype.indexOf.call(node.parentNode.childNodes, node));
    }
    return parts.reverse().join('.');
  }
  function validText(node) {
    return node.nodeType === Node.TEXT_NODE && !!node.nodeValue.trim() &&
      !!node.parentElement && !node.parentElement.closest('script,style,noscript,svg,textarea,option,[data-editor-ui]');
  }
  function scan() {
    const map = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (validText(node)) map.set('text:' + key(node), {kind:'text', node});
    }
    for (const node of document.querySelectorAll('img')) {
      map.set('image:' + key(node), {kind:'image', node});
    }
    for (const node of document.querySelectorAll('*')) {
      if (!node.closest('script,style,svg') && getComputedStyle(node).backgroundImage !== 'none') {
        map.set('background:' + key(node), {kind:'background', node});
      }
    }
    return map;
  }
  function setValue(target, value) {
    if (target.kind === 'text') target.node.nodeValue = String(value);
    else if (target.kind === 'image') target.node.setAttribute('src', String(value));
    else if (target.kind === 'background') {
      const safe = String(value);
      if (/^(\/miyamoto\/uploads\/[\w.-]+|\/miyamoto\/assets\/[\w/.-]+)$/.test(safe)) {
        target.node.style.setProperty('background-image', `url("${safe}")`, 'important');
      }
    }
  }
  function apply(values) {
    // Nilai dasar bahasa Inggris tetap utuh; terjemahan disimpan terpisah.
    if (!targets.size) targets = scan();
    lastValues = values || {};
    for (const [key, target] of targets) {
      if (originalValues.has(key)) setValue(target, originalValues.get(key));
    }
    for (const [key, value] of Object.entries(lastValues)) {
      if (!key.startsWith('__') && targets.has(key)) setValue(targets.get(key), value);
    }
    // Kamus bawaan hanya mengisi teks yang belum diterjemahkan oleh administrator.
    // Nama resmi tidak ada dalam kamus dan tetap sesuai dokumen perusahaan.

  }
  function currentValue(t) {
    if (t.kind === 'text') return t.node.nodeValue;
    if (t.kind === 'image') return t.node.getAttribute('src') || '';
    return (getComputedStyle(t.node).backgroundImage.match(/url\(["']?(.*?)["']?\)/) || [])[1] || '';
  }
  function setMode(value) {
    edit = Boolean(value);
    document.documentElement.classList.toggle('miya-edit-mode', edit);
    document.documentElement.classList.toggle('miya-visitor-mode', !edit);
    if (!edit) document.querySelectorAll('[data-mi-hover]').forEach(el => el.removeAttribute('data-mi-hover'));
  }
  // Daftar proyek tambahan ditampilkan tanpa mengubah file HTML publik FIX(3).
  async function showProjects() {
    if (!page.endsWith('/projects.html')) return;
    try {
      const response = await fetch('/api/projects', {cache:'no-store'});
      const result = await response.json();
      const directory = document.querySelector('.projects-directory');
      if (!directory) return;
      document.querySelectorAll('[data-dynamic-project]').forEach(el=>el.remove());
      for(const a of directory.querySelectorAll('a[href*="project-"]')){
        const match=a.getAttribute('href')?.match(/project-(\d+)\.html/);
        if(match){const item=(inEditor?result.drafts['builtin-'+match[1]]:null)||result.published['builtin-'+match[1]];a.style.display=item?.deleted?'none':'';}
      }
      const items = {...result.published,...(inEditor ? result.drafts : {})};
      for (const [id, item] of Object.entries(items)) {
        if (item.deleted || id.startsWith('builtin-')) continue;
        const a = document.createElement('a');
        a.className = 'directory-project reveal visible';
        a.dataset.dynamicProject = id;
        a.href = '/miyamoto/projects/' + encodeURIComponent(id) + '.html';
        const img = document.createElement('img');
        img.src = item.images[0] || '/miyamoto/assets/miya-moto-logo-corporate-blue.png';
        img.alt = item.name;
        const box = document.createElement('div');
        const small = document.createElement('span');small.textContent = item.location || 'PROJECT';
        const title = document.createElement('h3');title.textContent = item.name;
        const arrow = document.createElement('b');arrow.textContent = '↗';
        box.append(small,title,arrow);a.append(img,box);directory.append(a);
      }
      if(inEditor){targets=scan();for(const [key,target] of targets)if(!originalValues.has(key))originalValues.set(key,currentValue(target));}
    } catch (e) {console.warn('Daftar proyek tidak dapat dimuat',e);}
  }
  function start() {
    showProjects();
    targets = scan();
    for(const [key, target] of targets)originalValues.set(key,currentValue(target));

    // Website publik hanya menggunakan bahasa Inggris; tidak ada pemilih bahasa.
    fetch('/api/published', {cache:'no-store'}).then(r=>r.json()).then(data=>apply(data[page]||{})).catch(()=>{}).finally(()=>{
      if (inEditor) window.parent.postMessage({type:'pageReady',page},origin);
    });
    if (!inEditor) return;
    const style = document.createElement('style');
    style.textContent = 'html.miya-edit-mode [data-mi-hover]{outline:2px dashed #40b5ff!important;outline-offset:2px!important;cursor:crosshair!important;transition:outline-color .2s ease}';
    document.head.appendChild(style);
    window.addEventListener('message', event=>{
      if (event.origin!==origin || event.source!==window.parent) return;
      if (event.data?.type==='apply' && event.data.page===page) apply(event.data.values);
      if (event.data?.type==='selectMode') setMode(event.data.enabled);
      
    });
    document.addEventListener('mouseover',event=>{
      if (!edit) return;
      document.querySelectorAll('[data-mi-hover]').forEach(el=>el.removeAttribute('data-mi-hover'));
      const el=event.target.closest('img')||event.target;
      if (el instanceof HTMLElement) el.setAttribute('data-mi-hover','');
    },true);
    document.addEventListener('click',event=>{
      if (!edit) {
        // Tautan internal harus tetap di dalam iframe editor, termasuk halaman detail proyek.
        const a=event.target.closest('a[href]');
        if (!a || a.hasAttribute('download') || a.target==='_blank') return;
        const url=new URL(a.href,location.href);
        if (url.origin!==origin || !url.pathname.startsWith('/miyamoto/') || !url.pathname.endsWith('.html')) return;
        event.preventDefault();event.stopPropagation();
        url.searchParams.set('edit','1');
        location.href=url.href;
        return;
      }
      const element=event.target;
      if (!(element instanceof Element)) return;
      const img=element.closest('img');
      let target=img?{kind:'image',node:img}:null;
      if (!target) {
        const bg=element.closest('[style*="background"]');
        if (bg && getComputedStyle(bg).backgroundImage!=='none') target={kind:'background',node:bg};
      }
      if (!target) {
        const text=Array.from(element.childNodes).find(validText) ||
          Array.from(element.querySelectorAll('*')).flatMap(n=>Array.from(n.childNodes)).find(validText);
        if (text) target={kind:'text',node:text};
      }
      if (!target) {
        let n=element;
        while(n && n!==document.body){if(getComputedStyle(n).backgroundImage!=='none'){target={kind:'background',node:n};break;}n=n.parentElement;}
      }
      if (!target) return;
      event.preventDefault();event.stopImmediatePropagation();
      window.parent.postMessage({type:'editTarget',page,key:target.kind+':'+key(target.node),kind:target.kind,value:currentValue(target)},origin);
    },true);
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();
