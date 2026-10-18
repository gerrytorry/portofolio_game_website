// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
/* MIYA MOTO — public CTA behavior and project entry position. */
(() => {
    // Leave every Home CTA completely untouched. On project detail pages only:
    // horizontal arrow on hover/focus; restore on leave/blur.
    document.querySelectorAll('.inner-page .detail-navigation a.round-link').forEach(link => {
        const arrow = link.querySelector(':scope > span');
        if (!arrow || !/^[↗→]$/.test(arrow.textContent.trim()))
            return;
        const activate = () => { arrow.textContent = '→'; };
        const reset = () => { arrow.textContent = '↗'; };
        link.addEventListener('pointerenter', activate);
        link.addEventListener('pointerleave', reset);
        link.addEventListener('focus', activate);
        link.addEventListener('blur', reset);
        link.addEventListener('pointerdown', activate);
        link.addEventListener('pointercancel', reset);
        reset();
    });
    // Directly opening a project detail should never inherit the scroll offset
    // from the listing page (including browser scroll restoration).
    if (document.body.matches('.inner-page[data-page^="project-"]')) {
        if ('scrollRestoration' in history)
            history.scrollRestoration = 'manual';
        const reset = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        reset();
        window.addEventListener('pageshow', e => { if (!e.persisted)
            reset(); });
    }
})();
