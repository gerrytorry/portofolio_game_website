// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
/* Scoped interaction feedback for inner pages; no HOME modifications. */
(() => {
    if (!document.body.classList.contains('inner-page'))
        return;
    document.querySelectorAll('.detail-navigation .round-link, .directory-project, .service-directory-item').forEach((item) => {
        item.addEventListener('pointerdown', () => item.classList.add('miya-pressed'));
        ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(evt => item.addEventListener(evt, () => item.classList.remove('miya-pressed')));
    });
})();
