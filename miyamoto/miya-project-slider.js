// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
/* MIYA MOTO: project-detail slider, no changes to HOME */
document.querySelectorAll('[data-miya-slider]').forEach(function (root) {
    const track = root.querySelector('.miya-slider-track');
    const slides = [...root.querySelectorAll('.miya-slide')];
    const count = root.querySelector('.miya-slider-count');
    let current = 0, startX = null;
    function go(n) { current = (n + slides.length) % slides.length; track.style.transform = 'translateX(-' + current * 100 + '%)'; count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0'); }
    root.querySelector('.miya-slider-prev').addEventListener('click', () => go(current - 1));
    root.querySelector('.miya-slider-next').addEventListener('click', () => go(current + 1));
    root.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') {
        e.preventDefault();
        go(current - 1);
    } if (e.key === 'ArrowRight') {
        e.preventDefault();
        go(current + 1);
    } });
    root.addEventListener('pointerdown', e => { if (e.target.closest('button'))
        return; startX = e.clientX; });
    root.addEventListener('pointerup', e => { if (startX === null)
        return; let delta = e.clientX - startX; startX = null; if (Math.abs(delta) > 45)
        go(current + (delta < 0 ? 1 : -1)); });
    root.addEventListener('pointercancel', () => startX = null);
    go(0);
});
