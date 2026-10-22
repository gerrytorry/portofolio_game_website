// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
const $ = s => document.querySelector(s), $$ = s => document.querySelectorAll(s);
const header = $('#header');
function onScroll() { const y = scrollY; header.classList.toggle('scrolled', y > 24); $('#progress').style.width = (100 * y / Math.max(1, document.documentElement.scrollHeight - innerHeight)) + '%'; }
addEventListener('scroll', onScroll, { passive: true });
onScroll();
$('#menu').addEventListener('click', () => $('#nav').classList.toggle('open'));
$$('#nav a').forEach(a => a.addEventListener('click', () => $('#nav').classList.remove('open')));
const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) {
    e.target.classList.add('visible');
    observer.unobserve(e.target);
} }), { threshold: .1 });
$$('.reveal').forEach(el => observer.observe(el));
const path = location.pathname.split('/').pop();
$$('#nav a').forEach(a => { if (a.getAttribute('href') === path)
    a.setAttribute('aria-current', 'page'); });
