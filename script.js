(() => {
  const company = window.AIRONSUL_COMPANY;
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');
  const imageDialog = document.querySelector('#image-dialog');
  const videoDialog = document.querySelector('#video-dialog');
  const dialogImage = imageDialog?.querySelector('img');
  const dialogVideo = videoDialog?.querySelector('video');

  document.querySelectorAll('[data-company]').forEach((element) => {
    const key = element.dataset.company;
    if (company?.[key]) element.textContent = company[key];
  });
  document.querySelectorAll('[data-company-link="phone"]').forEach((element) => {
    element.href = company.phoneHref;
  });
  document.querySelectorAll('[data-company-link="maps"]').forEach((element) => {
    element.href = company.mapsUrl;
  });

  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const setMenu = (open) => {
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.hidden = !open;
    document.body.classList.toggle('menu-open', open);
  };
  menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 960) setMenu(false); });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('.image-trigger').forEach((trigger) => {
    trigger.tabIndex = trigger.tabIndex >= 0 ? trigger.tabIndex : 0;
    if (!trigger.matches('button')) trigger.setAttribute('role', 'button');
    const openImage = () => {
      dialogImage.src = trigger.dataset.full;
      dialogImage.alt = trigger.dataset.alt || '';
      imageDialog.showModal();
    };
    trigger.addEventListener('click', openImage);
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openImage(); }
    });
  });

  document.querySelector('[data-video-open]')?.addEventListener('click', () => {
    videoDialog.showModal();
    dialogVideo.play().catch(() => {});
  });

  document.querySelectorAll('.media-dialog').forEach((dialog) => {
    dialog.querySelector('.dialog-close')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => {
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => {
      if (dialog === videoDialog) { dialogVideo.pause(); dialogVideo.currentTime = 0; }
    });
  });
})();
