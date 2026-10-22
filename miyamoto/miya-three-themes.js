// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
(() => {
    const trigger = document.getElementById('theme');
    if (!trigger)
        return;
    const menu = document.createElement('div');
    menu.className = 'miya-theme-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', 'Choose website theme');
    const options = [['night', 'Dark Navy', '#091522'], ['day', 'White', '#ffffff'], ['ice', 'Ice Blue', '#80E8FF'], ['mono', 'Black & White', '#252525']];
    options.forEach(([value, label, color]) => { const btn = document.createElement('button'); btn.type = 'button'; btn.setAttribute('role', 'menuitemradio'); btn.dataset.theme = value; btn.innerHTML = '<span class="miya-theme-dot" style="background:' + color + '"></span>' + label; btn.addEventListener('click', () => { apply(value); close(); }); menu.appendChild(btn); });
    document.body.appendChild(menu);
    function apply(value) { document.body.classList.toggle('night', value === 'night'); document.body.classList.toggle('ice-blue', value === 'ice'); document.body.classList.toggle('black-white', value === 'mono'); localStorage.setItem('miya-theme', value); trigger.textContent = '◐'; trigger.setAttribute('aria-label', 'Theme: ' + (options.find(x => x[0] === value) || options[1])[1]); menu.querySelectorAll('button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.theme === value))); }
    function close() { menu.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', e => { e.stopPropagation(); const open = !menu.classList.contains('open'); if (!open) {
        close();
        return;
    } const r = trigger.getBoundingClientRect(); menu.style.top = Math.min(window.innerHeight - 155, r.bottom + 9) + 'px'; menu.style.left = Math.max(8, Math.min(window.innerWidth - 205, r.right - 194)) + 'px'; menu.classList.add('open'); trigger.setAttribute('aria-expanded', 'true'); });
    document.addEventListener('click', e => { if (!menu.contains(e.target) && e.target !== trigger)
        close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape')
        close(); });
    const previous = localStorage.getItem('miya-theme');
    apply(['night', 'day', 'ice', 'mono'].includes(previous) ? previous : 'day');
})();
