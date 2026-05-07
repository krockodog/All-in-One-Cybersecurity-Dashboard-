(() => {
  'use strict';

  const ready = () => {
    const now = new Date().toISOString();
    console.info(`[osint-for-all.live] loaded at ${now}`);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
    return;
  }

  ready();
})();
