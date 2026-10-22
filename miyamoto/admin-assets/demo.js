'use strict';

// Mode demonstrasi khusus GitHub Pages.
// Tidak menggunakan login, database, atau API penyimpanan.
window.addEventListener('DOMContentLoaded', () => {
  const login = document.getElementById('login');
  const workspace = document.getElementById('workspace');

  if (login) login.classList.add('hidden');
  if (workspace) workspace.classList.remove('hidden');

  const website = document.getElementById('website');
  if (website) website.src = '/miyamoto/index.html';

  const disabledActions = [
    'save', 'publish', 'restore', 'changePassword',
    'addProject', 'deleteProject', 'editMode'
  ];

  disabledActions.forEach(id => {
    const button = document.getElementById(id);
    if (!button) return;

    button.disabled = true;
    button.title = 'Fitur tidak tersedia dalam versi demo';
  });

  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();

      const target = link.dataset.page;
      if (!target || !website) return;

      website.src = '/miyamoto/' + target;
    }, true);
  });
});
