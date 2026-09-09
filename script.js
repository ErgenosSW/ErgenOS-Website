const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');

if (menuButton && navigation) {
  const openLabel = menuButton.dataset.menuOpen || 'Open navigation';
  const closeLabel = menuButton.dataset.menuClose || 'Close navigation';
  const closeMenu = () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', openLabel);
  };

  menuButton.addEventListener('click', () => {
    const open = !navigation.classList.contains('is-open');
    navigation.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? closeLabel : openLabel);
  });

  navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
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
    }
  });
}
