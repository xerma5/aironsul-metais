(() => {
  const company = window.AIRONSUL_COMPANY || {};
  const header = document.querySelector('.site-header');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-nav');
  const progressBar = document.querySelector('.scroll-progress');
  const backToTop = document.querySelector('.back-to-top');
  const hero = document.querySelector('.hero');
  const heroVideos = [...document.querySelectorAll('.hero-video')];
  const imageDialog = document.querySelector('#image-dialog');
  const videoDialog = document.querySelector('#video-dialog');
  const dialogImage = imageDialog?.querySelector('img');
  const dialogVideo = videoDialog?.querySelector('video');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  document.querySelectorAll('[data-company]').forEach((element) => {
    const value = company[element.dataset.company];
    if (value) element.textContent = value;
  });

  document.querySelectorAll('[data-company-link="phone"]').forEach((element) => {
    if (company.phoneHref) element.href = company.phoneHref;
  });

  document.querySelectorAll('[data-company-link="maps"]').forEach((element) => {
    if (company.mapsUrl) element.href = company.mapsUrl;
  });

  mobileMenu?.querySelectorAll('a').forEach((link, index) => {
    link.style.setProperty('--nav-index', index);
  });

  const setMenu = (open) => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
  };

  menuButton?.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('menu-open')) {
      setMenu(false);
      menuButton?.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) setMenu(false);
  });

  const updateScrollEffects = () => {
    const scrollY = window.scrollY;
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(scrollY / scrollable, 1);

    header?.classList.toggle('is-scrolled', scrollY > 28);
    backToTop?.classList.toggle('is-visible', scrollY > window.innerHeight * .65);
    progressBar?.style.setProperty('--scroll-progress', progress.toFixed(4));

    if (!reduceMotion.matches && window.innerWidth > 960 && hero) {
      const shift = Math.min(scrollY * .12, 72);
      hero.style.setProperty('--hero-shift', `${shift}px`);
    }
  };

  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      updateScrollEffects();
      scrollTicking = false;
    });
  }, { passive: true });
  updateScrollEffects();

  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });

  const revealElements = [...document.querySelectorAll('.reveal')];
  revealElements.forEach((element) => {
    const siblings = [...(element.parentElement?.children || [])].filter((item) => item.classList.contains('reveal'));
    const position = Math.max(siblings.indexOf(element), 0);
    element.style.setProperty('--reveal-delay', `${Math.min(position, 4) * 70}ms`);
  });

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.1 });
    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const navLinks = [...document.querySelectorAll('.desktop-nav a, .mobile-nav a')];
  const sectionIds = [...new Set(navLinks.map((link) => link.getAttribute('href')).filter((href) => href?.startsWith('#')))];
  const setActiveSection = (id) => {
    navLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActiveSection(visible.target.id);
    }, { rootMargin: '-28% 0px -58% 0px', threshold: [0, .15, .4] });
    sectionIds.forEach((href) => {
      const section = document.querySelector(href);
      if (section) sectionObserver.observe(section);
    });
  }

  const keepHeroPlaying = () => {
    heroVideos.forEach((video) => {
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.play().catch(() => {});
    });
  };

  heroVideos.forEach((video) => {
    video.addEventListener('loadeddata', keepHeroPlaying, { once: true });
    video.addEventListener('pause', () => {
      if (!document.hidden) requestAnimationFrame(keepHeroPlaying);
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) keepHeroPlaying();
  });
  document.addEventListener('pointerdown', keepHeroPlaying, { once: true, passive: true });
  window.addEventListener('pageshow', keepHeroPlaying);
  keepHeroPlaying();

  const openImage = (trigger) => {
    if (!imageDialog || !dialogImage) return;
    dialogImage.src = trigger.dataset.full;
    dialogImage.alt = trigger.dataset.alt || '';
    imageDialog.showModal();
  };

  document.querySelectorAll('.image-trigger').forEach((trigger) => {
    if (!trigger.matches('button')) {
      trigger.tabIndex = 0;
      trigger.setAttribute('role', 'button');
    }
    trigger.addEventListener('click', () => openImage(trigger));
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openImage(trigger);
      }
    });
  });

  document.querySelector('[data-video-open]')?.addEventListener('click', () => {
    videoDialog?.showModal();
    dialogVideo?.play().catch(() => {});
  });

  const closeDialog = (dialog) => {
    if (!dialog?.open || dialog.classList.contains('is-closing')) return;
    if (reduceMotion.matches) {
      dialog.close();
      return;
    }
    dialog.classList.add('is-closing');
    window.setTimeout(() => {
      dialog.classList.remove('is-closing');
      if (dialog.open) dialog.close();
    }, 240);
  };

  document.querySelectorAll('.media-dialog').forEach((dialog) => {
    dialog.querySelector('.dialog-close')?.addEventListener('click', () => closeDialog(dialog));
    dialog.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeDialog(dialog);
    });
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      dialog.classList.remove('is-closing');
      if (dialog === videoDialog && dialogVideo) {
        dialogVideo.pause();
        dialogVideo.currentTime = 0;
      }
    });
  });
})();
