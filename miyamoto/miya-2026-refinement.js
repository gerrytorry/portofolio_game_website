// Kode JavaScript diformat agar lebih mudah dibaca di VS Code.
(() => {
    'use strict';
    const form = document.getElementById('quotation-form');
    if (form) {
        form.addEventListener('submit', event => {
            event.preventDefault();
            const status = document.getElementById('quotation-status');
            for (const field of form.querySelectorAll('[required]')) {
                field.removeAttribute('aria-invalid');
            }
            const invalid = [...form.querySelectorAll('[required]')].find(el => !el.checkValidity() || !el.value.trim());
            if (invalid) {
                invalid.setAttribute('aria-invalid', 'true');
                invalid.focus();
                status.textContent = 'Please complete all required fields with valid information.';
                return;
            }
            const data = new FormData(form);
            const keys = [['Name', 'name'], ['Company', 'company'], ['Email', 'email'], ['Phone / WhatsApp', 'phone'], ['Type of Work', 'type'], ['Project Location', 'location'], ['Project Description', 'description']];
            const body = 'Hello PT Miya Moto Indonesia,\n\nI would like to request a quotation for the following project:\n\n' + keys.map(([label, key]) => label + ': ' + String(data.get(key) || '').trim()).join('\n') + '\n\nThank you.';
            const url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent('marketing@miyamoto.co.id') + '&su=' + encodeURIComponent('Request for Quotation - ' + String(data.get('company')).trim()) + '&body=' + encodeURIComponent(body);
            const win = window.open(url, '_blank', 'noopener,noreferrer');
            status.textContent = win ? 'Gmail Compose opened. Please review your message and click Send in Gmail.' : 'If Gmail did not open, allow pop-ups for this site and try again.';
        });
    }
})();
