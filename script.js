const polish = document.documentElement.lang === 'pl';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

if (menuButton && navigation) {
  const openLabel = menuButton.dataset.menuOpen || (polish ? 'Otwórz nawigację' : 'Open navigation');
  const closeLabel = menuButton.dataset.menuClose || (polish ? 'Zamknij nawigację' : 'Close navigation');
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', openLabel);
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? closeLabel : openLabel);
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-shell')) closeMenu();
  });
  window.matchMedia('(min-width: 1051px)').addEventListener('change', closeMenu);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navigation.querySelectorAll('a').forEach(link => {
          const active = link.hash === `#${entry.target.id}`;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));
  }
}

// Progressive enhancement: all application content stays available without JS.
const tabList = document.querySelector('.app-tabs');
if (tabList) {
  const tabs = [...tabList.querySelectorAll('[data-app-tab]')];
  const panels = [...document.querySelectorAll('[data-app-panel]')];
  const selectTab = index => {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
  };
  tabList.setAttribute('role', 'tablist');
  tabs.forEach((tab, i) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[i].id);
    panels[i].setAttribute('role', 'tabpanel');
    panels[i].setAttribute('aria-labelledby', tab.id);
    panels[i].tabIndex = 0;
    tab.addEventListener('click', () => selectTab(i));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (i + tabs.length - 1) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        selectTab(next);
        tabs[next].focus();
      }
    });
  });
  selectTab(0);
  tabList.hidden = false;
}

const copyButton = document.querySelector('[data-copy-checksum]');
const checksum = document.querySelector('#iso-checksum');

if (copyButton && checksum) {
  const copiedLabel = copyButton.dataset.copySuccess || 'Copied';
  const copyLabel = copyButton.dataset.copyReset || 'Copy';
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(checksum.textContent.trim());
      copyButton.textContent = copiedLabel;
      window.setTimeout(() => { copyButton.textContent = copyLabel; }, 1800);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(checksum);
      selection.removeAllRanges();
      selection.addRange(range);
      copyButton.textContent = polish ? 'Zaznaczono — Ctrl/Cmd+C' : 'Selected — Ctrl/Cmd+C';
      window.setTimeout(() => { copyButton.textContent = copyLabel; }, 3000);
    }
  });
}

// Native dialog keeps focus inside the gallery and returns it to its opener.
const galleryLinks = [...document.querySelectorAll('.desktop-shot, .screenshot-card')];
if (galleryLinks.length && typeof HTMLDialogElement !== 'undefined') {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', polish ? 'Galeria ErgenOS' : 'ErgenOS gallery');
  dialog.innerHTML = `<div class="lightbox-head"><p id="gallery-caption"></p><button type="button" data-close aria-label="${polish ? 'Zamknij galerię' : 'Close gallery'}">✕</button></div><img alt=""><div class="lightbox-controls"><button type="button" data-prev aria-label="${polish ? 'Poprzedni obraz' : 'Previous image'}">←</button><span aria-live="polite"></span><button type="button" data-next aria-label="${polish ? 'Następny obraz' : 'Next image'}">→</button></div>`;
  document.body.append(dialog);
  const galleryImage = dialog.querySelector('img');
  const caption = dialog.querySelector('p');
  const count = dialog.querySelector('[aria-live]');
  let current = 0;
  function showImage(index) {
    current = (index + galleryLinks.length) % galleryLinks.length;
    const link = galleryLinks[current];
    galleryImage.src = link.href;
    galleryImage.alt = link.querySelector('img').alt;
    caption.textContent = galleryImage.alt;
    count.textContent = `${String(current + 1).padStart(2, '0')} / ${String(galleryLinks.length).padStart(2, '0')}`;
  }
  galleryLinks.forEach((link, index) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showImage(index);
    dialog.showModal();
    document.body.classList.add('dialog-open');
  }));
  dialog.querySelector('[data-close]').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-prev]').addEventListener('click', () => showImage(current - 1));
  dialog.querySelector('[data-next]').addEventListener('click', () => showImage(current + 1));
  dialog.addEventListener('click', event => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showImage(current + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
}

if (copyButton) copyButton.setAttribute('aria-live', 'polite');
