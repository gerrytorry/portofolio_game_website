// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const images = { construction: '/miyamoto/assets/project-documentation/pt-ondo-metal-indonesia/01.jpg', architecture: '/miyamoto/assets/project-documentation/pt-ichii-industries-indonesia/01.jpg', housing: '/miyamoto/assets/project-documentation/avalon-mirage-apartment/01.jpg', consulting: '/miyamoto/assets/project-documentation/pt-nishinihon-electronic-indonesia/01.jpg', design: '/miyamoto/assets/project-documentation/pt-kansai-paint-indonesia/01.jpg', build: '/miyamoto/assets/project-documentation/pt-balihai-brewery-indonesia/01.jpg', maintenance: '/miyamoto/assets/project-documentation/pt-inoac-polytechno-indonesia/01.jpg' };
const approaches = [['Planning', 'Defining project requirements, scope and execution strategy.'], ['Design', 'Developing architectural and engineering solutions.'], ['Coordination', 'Aligning project teams, resources and schedules.'], ['Construction', 'Executing work according to project specifications.'], ['Supervision', 'Monitoring quality, safety and on-site progress.'], ['Handover', 'Completing and delivering work to project requirements.']];
$('#approachList').innerHTML = approaches.map((a, i) => `<div class="approach-item"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><h3>${a[0]}</h3><p>${a[1]}</p></div></div>`).join('');
const services = [['GENERAL CONTRACTOR', 'Planned and coordinated construction, from site preparation to execution.', 'construction'], ['DESIGN & BUILD', 'Integrated solutions from initial concepts and engineering to construction.', 'architecture'], ['CIVIL WORKS', 'Concrete pavement, flooring, asphalt paving and building renovation works.', 'housing'], ['MECHANICAL & ELECTRICAL', 'Electrical panel and machinery relocation, with civil and electrical renovation.', 'consulting'], ['ARCHITECTURE & INTERIOR DESIGN', 'Architecture and interior design within the company’s stated business field.', 'design'], ['BUILDING RENOVATION', 'Building repainting, repair, demolition and renovation works.', 'build'], ['FLOORING & SURFACES', 'Concrete flooring, epoxy finishes, parking pavement and asphalt works.', 'maintenance']];
$('#serviceList').innerHTML = services.map((s, i) => `<div class="service-item ${i === 0 ? 'active' : ''}" tabindex="0" role="button" data-service="${i}"><span class="num">${String(i + 1).padStart(2, '0')}</span><div><h3>${s[0]}</h3><p>${s[1]}</p></div></div>`).join('');
let activeService = 0;
function setService(i) { if (i === activeService)
    return; activeService = i; $$('.service-item').forEach((el, n) => el.classList.toggle('active', n === i)); let img = $('#serviceImage'); img.classList.add('changing'); setTimeout(() => { img.src = images[services[i][2]]; img.alt = services[i][0] + ' visual'; $('#serviceCaption').textContent = services[i][0].toUpperCase() + ' — ' + services[i][1].split(' — ')[0].toUpperCase(); img.classList.remove('changing'); }, 160); }
$$('.service-item').forEach(el => { el.addEventListener('mouseenter', () => setService(+el.dataset.service)); el.addEventListener('focus', () => setService(+el.dataset.service)); el.addEventListener('click', () => setService(+el.dataset.service)); el.addEventListener('keydown', e => { if (e.key === 'Enter')
    setService(+el.dataset.service); }); });
const projects = [['PT. ONDO METAL INDONESIA', 'Building Repainting and Cleaning Works', 'Kabupaten Bekasi', '/miyamoto/assets/project-documentation/pt-ondo-metal-indonesia/01.jpg'], ['PT. BALIHAI BREWERY INDONESIA', 'Truck Parking Area Concrete Pavement Works', 'Tambun Selatan', '/miyamoto/assets/project-documentation/pt-balihai-brewery-indonesia/01.jpg'], ['PT. KANSAI PAINT INDONESIA', 'Road Asphalt Paving Works', 'MM2100, Bekasi', '/miyamoto/assets/project-documentation/pt-kansai-paint-indonesia/01.jpg'], ['PT. NISHINIHON ELECTRONIC INDONESIA', 'Electrical Panel Installation & Machinery Relocation', 'Jababeka, Bekasi', '/miyamoto/assets/project-documentation/pt-nishinihon-electronic-indonesia/01.jpg'], ['PT. ICHII INDUSTRIES INDONESIA', 'Concrete Floor & Epoxy', 'Karawang', '/miyamoto/assets/project-documentation/pt-ichii-industries-indonesia/01.jpg'], ['PT. INOAC POLYTECHNO INDONESIA', 'Concrete Floor & Epoxy', 'Karawang', '/miyamoto/assets/project-documentation/pt-inoac-polytechno-indonesia/01.jpg']];
$('#projectsGrid').innerHTML = projects.map((p, i) => `<a class="project-card reveal" href="/miyamoto/project-${i + 1}.html"><div class="project-img"><img loading="lazy" src="${p[3]}" alt="${p[0]} — dokumentasi asli proyek"></div><div class="project-meta"><div><h3>${p[0]}</h3><small>${p[1].toUpperCase()} — ${p[2].toUpperCase()}</small></div><span>↗</span></div></a>`).join('');
const process = [['Discover', 'Understanding needs, context and goals.'], ['Plan', 'Strategy, budgeting and coordination.'], ['Design', 'Detailed solutions developed with care.'], ['Build', 'Disciplined on-site execution.'], ['Deliver', 'Completion, review and handover.']];
$('#processRow').innerHTML = process.map((p, i) => `<div class="process-card reveal"><span>${String(i + 1).padStart(2, '0')}</span><h3>${p[0]}</h3><p>${p[1]}</p></div>`).join('');
const observer = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) {
    e.target.classList.add('visible');
    observer.unobserve(e.target);
} }); }, { threshold: .12 });
$$('.reveal').forEach(el => observer.observe(el));
const counterObs = new IntersectionObserver(entries => entries.forEach(e => { if (!e.isIntersecting)
    return; const el = e.target, target = +el.dataset.count; const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches; if (reduced) {
    el.textContent = target;
    counterObs.unobserve(el);
    return;
} let start = null; function frame(t) { if (start === null)
    start = t; let p = Math.min((t - start) / 1650, 1); el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1)
    requestAnimationFrame(frame); } requestAnimationFrame(frame); counterObs.unobserve(el); }), { threshold: .6 });
$$('[data-count]').forEach(el => counterObs.observe(el));
let scrolled = false;
function onScroll() { const y = scrollY; const next = scrolled ? y > 16 : y > 70; if (next !== scrolled) {
    scrolled = next;
    $('#header').classList.toggle('scrolled', next);
} $('#progress').style.width = (100 * y / Math.max(1, document.documentElement.scrollHeight - innerHeight)) + '%'; }
addEventListener('scroll', onScroll, { passive: true });
onScroll();
$('#scrollNext').addEventListener('click', () => $('#about').scrollIntoView({ behavior: 'smooth' }));
$('#menu').addEventListener('click', () => $('#nav').classList.toggle('open'));
$$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));
$('#lang').addEventListener('click', () => { alert('Language translations are not implemented in this preview.'); });
