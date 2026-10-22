'use strict';
// Pengelolaan antarmuka admin dan komunikasi aman dengan preview website.
const $ = id => document.getElementById(id);
const labels = {
  id: {
    "email": "Email Administrator",
    "footer": "Footer",
    "publicWebsite": "Lihat Website",
    "deleteHint": "Pilih proyek berdasarkan nama atau foto. Tidak ada proyek yang langsung dihapus dari website publik.",
    "deleteConfirmTitle": "Hapus proyek ini?",
    "deleteConfirmInfo": "Proyek hanya ditandai untuk dihapus dalam draft. Website publik tidak berubah sebelum dipublikasikan.",
    "deleteDraft": "Hapus dari Draft",
    "home": "Beranda",
    "about": "Tentang Kami",
    "services": "Layanan",
    "projects": "Proyek",
    "contact": "Kontak",
    "history": "Riwayat Aktivitas",
    "logout": "Keluar",
    "loginTitle": "Masuk Administrator",
    "loginInfo": "Akses khusus administrator website.",
    "password": "Kata Sandi",
    "login": "Masuk",
    "editActive": "Mode Edit Aktif",
    "visitorActive": "Mode Pengunjung Aktif",
    "visitorMode": "Mode Pengunjung",
    "activateEdit": "Aktifkan Mode Edit",
    "save": "Simpan Draft",
    "publish": "Publikasikan",
    "addProject": "+ Tambah Proyek",
    "deleteProject": "Hapus Proyek",
    "restore": "Pulihkan Publikasi Terakhir",
    "changePassword": "Ubah Kata Sandi",
    "choosePhoto": "Pilih Foto",
    "dragHint": "Geser foto pada area pratinjau untuk mengatur posisi.",
    "reset": "Atur Ulang Foto",
    "cancel": "Batal",
    "apply": "Terapkan Perubahan"
  }
};
const lang='en'; // Bahasa konten publik tetap Inggris; antarmuka admin menggunakan Indonesia.
let csrf='', page='/miyamoto/index.html', drafts={}, published={}, history=[], values={}, edit=true, target=null;
let dirtyPages=new Map(), imageSource=null, imageObjectUrl=null, projectPhotoPending=false, pendingProjectFiles=[];
const photoState={x:0,y:0,zoom:100,brightness:100,contrast:100,saturation:100,temperature:0,overlay:0};
const photoSliders=['zoom','brightness','contrast','saturation','temperature','overlay'];
const t=key=>labels.id[key]||key;
function translate(){document.documentElement.lang='id';document.querySelectorAll('[data-i18n]').forEach(el=>{el.textContent=t(el.dataset.i18n);});updateModeUI();updatePageUI();}
function message(text){$('status').textContent=text;}
async function api(path,body){const r=await fetch('/api/'+path,{method:body===undefined?'GET':'POST',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:body===undefined?undefined:JSON.stringify(body)});const j=await r.json();if(!r.ok)throw Error(j.error||'Permintaan gagal');return j;}
async function load(){try{const s=await api('state');csrf=s.csrf;drafts=s.drafts;published=s.published;history=s.history;$('login').classList.add('hidden');$('workspace').classList.remove('hidden');openPage(page);}catch{$('login').classList.remove('hidden');$('workspace').classList.add('hidden');}}
function isProjectDetail(p){return /\/project-(?:\d+|[a-z0-9-]+)\.html$/.test(p) || /\/projects\/[^/]+\.html$/.test(p);}
function currentPageLabel(){let file=page.split('/').pop().replace(/\.html$/,'');let match=Object.entries({index:'home',about:'about',services:'services',projects:'projects',contact:'contact'}).find(([k])=>k===file);if(match)return t(match[1]);if(isProjectDetail(page))return file.replaceAll('-',' ').replace(/\b\w/g,s=>s.toUpperCase());return file.replaceAll('-',' ');}
function updatePageUI(){if(!$('pageName'))return;$('pageName').textContent=footerSelected?t('footer'):currentPageLabel();$('footerNav').classList.toggle('active',footerSelected);document.querySelectorAll('[data-page]').forEach(a=>{let selected=page.endsWith('/'+a.dataset.page)||(isProjectDetail(page)&&a.dataset.page==='projects.html');a.classList.toggle('active',selected&&!footerSelected);});$('projectActions').classList.toggle('hidden',!page.endsWith('/projects.html')&&!isProjectDetail(page));}
function openPage(p){footerSelected=false;if(!p.startsWith('/miyamoto/')||!p.endsWith('.html'))return;dirtyPages.set(page,{...values});page=p;values={...(dirtyPages.get(page)||drafts[page]||published[page]||{})};$('historyPanel').classList.add('hidden');$('frameWrap').classList.remove('hidden');$('website').src=page+'?edit=1';resizePreview();updatePageUI();message('');$('workspace').classList.remove('nav-open');}
function push(){const w=$('website').contentWindow;if(w){w.postMessage({type:'apply',page,values},location.origin);w.postMessage({type:'selectMode',enabled:edit},location.origin);}}
function updateModeUI(){$('editMode').textContent=edit?t('visitorMode'):t('activateEdit');$('modeStatus').innerHTML='● <span>'+ (edit?t('editActive'):t('visitorActive'))+'</span>';}
$('showPassword').onclick=()=>{const field=$('password');field.type=field.type==='password'?'text':'password';$('showPassword').textContent=field.type==='password'?'◉':'◌';};
$('loginForm').addEventListener('submit',async e=>{e.preventDefault();try{await api('login',{email:$('email').value.trim(),password:$('password').value});$('password').value='';await load();}catch(x){$('loginError').textContent=x.message;}});
$('logout').onclick=async()=>{try{await api('logout',{});location.reload();}catch(e){alert(e.message);}};
$('collapse').onclick=()=>{const collapsed=$('workspace').classList.toggle('collapsed');$('collapse').textContent=collapsed?'›':'‹';};
$('mobileNav').onclick=()=>$('workspace').classList.toggle('nav-open');
document.querySelectorAll('[data-page]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();openPage('/miyamoto/'+a.dataset.page);}));
let footerSelected=false;
$('footerNav').onclick=e=>{
  e.preventDefault();
  footerSelected=true;
  $('historyPanel').classList.add('hidden');
  $('frameWrap').classList.remove('hidden');
  updatePageUI();
  $('website').contentWindow.scrollTo({top:999999,behavior:'smooth'});
};
$('historyNav').onclick=e=>{e.preventDefault();footerSelected=false;document.querySelectorAll('.nav-item').forEach(a=>a.classList.remove('active'));$('historyNav').classList.add('active');$('frameWrap').classList.add('hidden');$('historyPanel').classList.remove('hidden');$('historyList').replaceChildren();history.slice().reverse().forEach(x=>{const div=document.createElement('div');div.className='history-entry';div.textContent=new Date(x.time).toLocaleString()+' — '+x.page.split('/').pop();$('historyList').append(div);});if(!history.length)$('historyList').textContent='Belum ada riwayat.';};
$('editMode').onclick=()=>{edit=!edit;updateModeUI();push();};
// Ukuran viewport publik tidak berubah hanya karena sidebar admin dibuka.
let phonePreview = false;
function resizePreview() {
  const wrap = $('frameWrap');
  const frame = $('website');
  if (!wrap || !frame || wrap.classList.contains('hidden')) return;
  const viewportWidth = phonePreview ? 390 : 1440;
  const viewportHeight = phonePreview ? 844 : 900;
  const availableWidth = Math.max(1, wrap.clientWidth - 2);
  const scale = Math.min(1, availableWidth / viewportWidth);
  frame.style.width = viewportWidth + 'px';
  frame.style.height = viewportHeight + 'px';
  frame.style.transform = `scale(${scale})`;
  frame.style.marginBottom = -(viewportHeight * (1 - scale)) + 'px';
  frame.style.marginRight = -(viewportWidth * (1 - scale)) + 'px';
}
function setDevice(phone) {
  phonePreview = phone;
  $('frameWrap').classList.toggle('phone', phone);
  $('mobile').classList.toggle('selected', phone);
  $('mobile').classList.toggle('ghost', !phone);
  $('desktop').classList.toggle('selected', !phone);
  $('desktop').classList.toggle('ghost', phone);
  resizePreview();
}
new ResizeObserver(resizePreview).observe($('frameWrap'));
window.addEventListener('resize', resizePreview);

$('desktop').onclick=()=>setDevice(false);$('mobile').onclick=()=>setDevice(true);
window.addEventListener('message',e=>{if(e.origin!==location.origin||e.source!==$('website').contentWindow)return;const d=e.data||{};if(d.type==='pageReady'){if(d.page!==page){dirtyPages.set(page,{...values});page=d.page;values={...(dirtyPages.get(page)||drafts[page]||published[page]||{})};updatePageUI();}push();}else if(d.type==='editTarget'&&edit){target=d;openEditor(d);}});
function openEditor(d){$('modal').classList.remove('hidden');$('modalTitle').textContent=d.kind==='text'?'Ubah Teks':'Ubah Foto';$('textAreaWrap').classList.toggle('hidden',d.kind!=='text');$('photoWrap').classList.toggle('hidden',d.kind==='text');$('value').value=values[d.key]??d.value;$('photo').value='';$('photoEditor').classList.add('hidden');imageSource=null;}
function closeEditor(){$('modal').classList.add('hidden');if(projectPhotoPending){projectPhotoPending=false;pendingProjectFiles=[];$('projectModal').classList.remove('hidden');}if(imageObjectUrl){URL.revokeObjectURL(imageObjectUrl);imageObjectUrl=null;}}
$('cancel').onclick=closeEditor;$('cancelX').onclick=closeEditor;
// Editor foto universal: satu area kerja untuk setiap unggahan foto.
const canvas=$('cropCanvas'),ctx=canvas.getContext('2d');
function renderPhoto(){if(!imageSource)return;const w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.fillStyle='#1b2737';ctx.fillRect(0,0,w,h);const base=Math.max(w/imageSource.width,h/imageSource.height);const scale=base*photoState.zoom/100;const iw=imageSource.width*scale,ih=imageSource.height*scale;const limitX=Math.max(0,(iw-w)/2),limitY=Math.max(0,(ih-h)/2);photoState.x=Math.max(-limitX,Math.min(limitX,photoState.x));photoState.y=Math.max(-limitY,Math.min(limitY,photoState.y));ctx.save();ctx.filter=`brightness(${photoState.brightness}%) contrast(${photoState.contrast}%) saturate(${photoState.saturation}%)`;ctx.drawImage(imageSource,(w-iw)/2+photoState.x,(h-ih)/2+photoState.y,iw,ih);ctx.restore();if(photoState.temperature){ctx.fillStyle=photoState.temperature>0?`rgba(255,134,40,${photoState.temperature/600})`:`rgba(50,120,255,${-photoState.temperature/600})`;ctx.fillRect(0,0,w,h);}if(photoState.overlay){ctx.fillStyle=`rgba(0,13,32,${photoState.overlay/100})`;ctx.fillRect(0,0,w,h);}ctx.strokeStyle='#ffffffbd';ctx.setLineDash([8,5]);ctx.strokeRect(1,1,w-2,h-2);}
$('photo').addEventListener('change',()=>{const f=$('photo').files[0];if(!f)return;if(!['image/jpeg','image/png','image/webp'].includes(f.type)){alert('Gunakan JPG, PNG, atau WebP.');return;}if(f.size>8*1024*1024){alert('Foto maksimal 8 MB.');return;}if(imageObjectUrl)URL.revokeObjectURL(imageObjectUrl);imageObjectUrl=URL.createObjectURL(f);const img=new Image();img.onload=()=>{imageSource=img;Object.assign(photoState,{x:0,y:0,zoom:100,brightness:100,contrast:100,saturation:100,temperature:0,overlay:0});photoSliders.forEach(k=>$(k).value=photoState[k]);$('photoEditor').classList.remove('hidden');refreshPhoto();};img.src=imageObjectUrl;});
function refreshPhoto(){photoSliders.forEach(k=>$(k+'Out').textContent=photoState[k]+(['zoom','brightness','contrast','saturation','overlay'].includes(k)?'%':''));renderPhoto();}
photoSliders.forEach(k=>$(k).addEventListener('input',e=>{photoState[k]=Number(e.target.value);refreshPhoto();}));
$('resetPhoto').onclick=()=>{Object.assign(photoState,{x:0,y:0,zoom:100,brightness:100,contrast:100,saturation:100,temperature:0,overlay:0});photoSliders.forEach(k=>$(k).value=photoState[k]);refreshPhoto();};
let drag=null;canvas.addEventListener('pointerdown',e=>{if(!imageSource)return;drag={x:e.clientX,y:e.clientY,ox:photoState.x,oy:photoState.y};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;const rect=canvas.getBoundingClientRect();photoState.x=drag.ox+(e.clientX-drag.x)*canvas.width/rect.width;photoState.y=drag.oy+(e.clientY-drag.y)*canvas.height/rect.height;renderPhoto();});canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
async function uploadPhoto(blob){const form=new FormData();form.append('photo',blob,blob.name||'photo.jpg');const r=await fetch('/api/upload',{method:'POST',headers:{'X-CSRF-Token':csrf},body:form});const j=await r.json();if(!r.ok)throw Error(j.error||'Upload gagal');return j.url;}
$('confirm').onclick=async()=>{if(!target)return;const btn=$('confirm');btn.disabled=true;try{let val=$('value').value;if(target.kind!=='text'){if(!imageSource)throw Error('Pilih foto terlebih dahulu.');const original=await uploadPhoto($('photo').files[0]);const processed=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.92));if(!processed)throw Error('Foto gagal diproses.');val=await uploadPhoto(processed);values['__original__'+target.key]=original;values['__photo_settings__'+target.key]={...photoState};}if(projectPhotoPending){projectImages.push(val);renderProjectPhotos();projectPhotoPending=false;closeEditor();$('projectModal').classList.remove('hidden');message('Foto proyek siap digunakan.');if(pendingProjectFiles.length)openNextProjectPhoto();return;}values[target.key]=val;dirtyPages.set(page,{...values});push();closeEditor();message('Perubahan belum dipublikasikan. Simpan draft untuk melanjutkan.');}catch(e){alert(e.message);}finally{btn.disabled=false;}};
async function busy(id,fn){const b=$(id);b.disabled=true;try{await fn();}catch(e){alert(e.message);}finally{b.disabled=false;}}
$('save').onclick=()=>busy('save',async()=>{await api('draft',{page,edits:values});drafts[page]={...values};message('Draft berhasil disimpan.');});
$('publish').onclick=()=>busy('publish',async()=>{await api('draft',{page,edits:values});drafts[page]={...values};await api('publish',{page});published[page]={...values};history=(await api('state')).history;message('Perubahan berhasil dipublikasikan.');});
$('restore').onclick=()=>busy('restore',async()=>{if(!confirm('Pulihkan publikasi terakhir?'))return;await api('restore',{});const s=await api('state');published=s.published;history=s.history;openPage(page);message('Publikasi sebelumnya berhasil dipulihkan.');});
$('changePassword').onclick=async()=>{const old=prompt('Kata sandi saat ini:');if(old===null)return;const fresh=prompt('Kata sandi baru (minimal 12 karakter):');if(fresh===null)return;try{await api('change-password',{old,new:fresh});alert('Kata sandi berhasil diubah.');}catch(e){alert(e.message);}};
// Pengelolaan proyek: unggah banyak foto, simpan draft, publikasikan, dan hapus dengan pemulihan.
let projectImages=[], projectId=null, projectList={};
async function loadProjects(){const data=await api('projects');projectList={...data.published,...data.drafts};return data;}
function slug(name){return name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);}
function renderProjectPhotos(){const area=$('projectPhotoList');area.replaceChildren();projectImages.forEach((url,i)=>{const box=document.createElement('div');box.className='project-photo-item';const img=document.createElement('img');img.src=url;img.alt='Foto '+(i+1);const del=document.createElement('button');del.className='button tiny ghost';del.type='button';del.textContent='Hapus foto';del.onclick=()=>{projectImages.splice(i,1);renderProjectPhotos();};box.append(img,del);area.append(box);});}
function closeProjectModal(){$('projectModal').classList.add('hidden');}
$('closeProject').onclick=closeProjectModal;$('cancelProject').onclick=closeProjectModal;
$('addProject').onclick=async()=>{try{await loadProjects();projectId=null;projectImages=[];$('projectForm').reset();renderProjectPhotos();$('projectModalTitle').textContent='Tambah Proyek';$('projectModal').classList.remove('hidden');}catch(e){alert(e.message);}};
function openNextProjectPhoto(){
  if(!pendingProjectFiles.length)return;
  const file=pendingProjectFiles.shift();
  projectPhotoPending=true;
  target={kind:'image',key:'__project_photo__',value:''};
  $('projectModal').classList.add('hidden');
  openEditor(target);
  $('modalTitle').textContent='Atur Foto Proyek';
  const transfer=new DataTransfer();transfer.items.add(file);
  $('photo').files=transfer.files;
  $('photo').dispatchEvent(new Event('change',{bubbles:true}));
}
$('projectPhotos').onchange=e=>{
  const files=[...e.target.files];
  if(files.length+projectImages.length>30){alert('Maksimal 30 foto per proyek.');return;}
  if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type)||f.size>8*1024*1024)){alert('Gunakan foto JPG, PNG, atau WebP maksimal 8 MB.');return;}
  pendingProjectFiles.push(...files);e.target.value='';openNextProjectPhoto();
};
$('projectForm').onsubmit=async e=>{e.preventDefault();await busy('saveProject',async()=>{const name=$('projectName').value.trim();const id=projectId||slug(name);if(!id)throw Error('Nama proyek tidak valid');await api('projects/draft',{id,project:{name,description:$('projectDescription').value,location:$('projectLocation').value,images:projectImages,deleted:false}});projectId=id;closeProjectModal();if(page.endsWith('/projects.html'))$('website').contentWindow.location.reload();message('Proyek tersimpan sebagai draft. Publikasikan agar tampil di website.');});};
// Penghapusan proyek melalui daftar visual dan konfirmasi, bukan input ID teknis.
let deleteSelection=null;
const builtinProjects=['Pt. Ondo Metal Indonesia', 'Pt. Balihai Brewery Indonesia', 'Pt. Kansai Paint Indonesia', 'Pt. Nishinihon Electronic Indonesia', 'Pt. Ichii Industries Indonesia', 'Pt. Inoac Polytechno Indonesia', 'Avalon Mirage Apartment', 'Pt. Nishinihon Electronic Indonesia', 'Pt. Nishinihon Electronic Indonesia', 'Pt. Ikk Indonesia', 'Pt. Mkapr Tbk'];
const builtinPhotos=['/miyamoto/assets/project-documentation/pt-ondo-metal-indonesia/01.jpg', '/miyamoto/assets/project-documentation/pt-balihai-brewery-indonesia/01.jpg', '/miyamoto/assets/project-documentation/pt-kansai-paint-indonesia/01.jpg', '/miyamoto/assets/project-documentation/pt-nishinihon-electronic-indonesia/01.jpg', '/miyamoto/assets/project-documentation/pt-ichii-industries-indonesia/01.jpg', '/miyamoto/assets/project-documentation/pt-inoac-polytechno-indonesia/01.jpg', '/miyamoto/assets/project-documentation/avalon-mirage-apartment/01.jpg', '/miyamoto/assets/project-documentation/pt-nishinihon-electronic-indonesia/01.jpg', '/miyamoto/assets/project-documentation/pt-nishinihon-electronic-indonesia/01.jpg', '', ''];
function closeDeleteModal(){
  $('deleteModal').classList.add('hidden');
  deleteSelection=null;
  $('deleteConfirmation').classList.add('hidden');
  $('confirmDelete').disabled=true;
}
function renderDeleteProjects(){
  const query=$('searchProject').value.trim().toLowerCase();
  const list=$('deleteProjectList');
  list.replaceChildren();
  const items=[...Array.from({length:11},(_,i)=>({
    id:'builtin-'+(i+1),
    ...({name:builtinProjects[i],location:'',images:builtinPhotos[i]?[builtinPhotos[i]]:[]}),
    ...(projectList['builtin-'+(i+1)]||{})
  })),...Object.entries(projectList).filter(([id])=>!/^builtin-/.test(id)).map(([id,item])=>({id,...item}))];
  for(const item of items.filter(p=>!p.deleted&&(p.name+' '+(p.location||'')).toLowerCase().includes(query))){
    const row=document.createElement('button');
    row.type='button';row.className='delete-project-row';
    const thumb=document.createElement('span');thumb.className='delete-project-thumb';
    if(item.images?.[0]){
      const img=document.createElement('img');img.src=item.images[0];img.alt='';thumb.append(img);
    }else{thumb.textContent='▧';}
    const detail=document.createElement('span');detail.className='delete-project-info';
    const name=document.createElement('strong');name.textContent=item.name;
    const location=document.createElement('small');location.textContent=item.location||'Miya Moto Indonesia';
    detail.append(name,location);row.append(thumb,detail);
    row.onclick=()=>{
      deleteSelection=item;
      list.querySelectorAll('.delete-project-row').forEach(el=>el.classList.remove('chosen'));
      row.classList.add('chosen');
      $('deleteSelectedName').textContent=item.name;
      $('deleteConfirmation').classList.remove('hidden');
      $('confirmDelete').disabled=false;
    };
    list.append(row);
  }
  if(!list.children.length){const empty=document.createElement('p');empty.className='muted';empty.textContent='Tidak ada proyek yang cocok.';list.append(empty);}
}
$('deleteProject').onclick=async()=>{
  try{
    await loadProjects();
    $('searchProject').value='';deleteSelection=null;
    $('deleteConfirmation').classList.add('hidden');
    $('confirmDelete').disabled=true;
    renderDeleteProjects();
    $('deleteModal').classList.remove('hidden');
  }catch(error){message(error.message);}
};
$('searchProject').oninput=()=>{deleteSelection=null;$('confirmDelete').disabled=true;$('deleteConfirmation').classList.add('hidden');renderDeleteProjects();};
$('closeDelete').onclick=closeDeleteModal;
$('cancelDelete').onclick=closeDeleteModal;
$('confirmDelete').onclick=async()=>{
  if(!deleteSelection)return;
  const item=deleteSelection;
  try{
    await api('projects/draft',{id:item.id,project:{
      name:item.name,description:item.description||'Dokumentasi pekerjaan konstruksi',
      location:item.location||'',images:item.images||[],deleted:true
    }});
    closeDeleteModal();
    message('Proyek "'+item.name+'" ditandai untuk dihapus dalam draft. Publikasikan untuk menerapkan.');
    if(page.endsWith('/projects.html'))$('website').contentWindow.location.reload();
  }catch(error){message(error.message);}
};
// Publikasi juga mencakup draft proyek yang belum dipublikasikan.
const oldPublish=$('publish').onclick;
$('publish').onclick=()=>busy('publish',async()=>{await api('draft',{page,edits:values});drafts[page]={...values};await api('publish',{page});published[page]={...values};const projects=await api('projects');for(const id of Object.keys(projects.drafts)){await api('projects/publish',{id});}history=(await api('state')).history;message('Konten dan proyek berhasil dipublikasikan.');$('website').contentWindow.location.reload();});
const oldRestore=$('restore').onclick;
$('restore').onclick=()=>busy('restore',async()=>{if(!confirm('Pulihkan publikasi terakhir?'))return;await api('restore',{});try{await api('projects/restore',{});}catch(e){}const state=await api('state');published=state.published;history=state.history;openPage(page);message('Riwayat publikasi dipulihkan.');});
translate();load();
