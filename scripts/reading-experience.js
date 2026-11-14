(() => {
  'use strict';
  const filters = document.querySelector('[data-archive-filters]');
  const input = document.querySelector('#archive-search');
  const order = document.querySelector('#archive-order');
  if (filters && input && order) {
    const values = filters.querySelector('.itg-filter-values');
    const clear = filters.querySelector('button');
    function update() {
      const query = input.value.trim();
      const labels = [query ? '關鍵字：' + query : '全部年份'];
      if (order.value === 'oldest') labels.push('由舊到新');
      values.replaceChildren(...labels.map(label => {
        const chip = document.createElement('span');
        chip.className = 'itg-filter-chip';
        chip.textContent = label;
        return chip;
      }));
      clear.disabled = !query && order.value === 'newest';
    }
    filters.hidden = false;
    input.addEventListener('input', update);
    order.addEventListener('change', update);
    clear.addEventListener('click', () => {
      input.value = '';
      order.value = 'newest';
      // Preserve the archive's existing filtering, sorting and open-year logic.
      input.dispatchEvent(new Event('input', { bubbles: true }));
      order.dispatchEvent(new Event('change', { bubbles: true }));
      input.focus();
    });
    update();
    // Restore chip state when the browser restores form values on back/forward.
    window.addEventListener('pageshow', update);
  }

  const button = document.querySelector('.itg-back-to-top');
  if (!button) return;
  function updateVisibility() {
    const visible = window.scrollY > 400;
    button.toggleAttribute('data-visible', visible);
    button.setAttribute('aria-hidden', String(!visible));
    button.tabIndex = visible ? 0 : -1;
  }
  window.addEventListener('scroll', updateVisibility, { passive: true });
  window.addEventListener('pageshow', updateVisibility);
  button.addEventListener('click', () => {
    const main = document.querySelector('main');
    if (main) {
      const hadTabindex = main.hasAttribute('tabindex');
      if (!hadTabindex) main.tabIndex = -1;
      main.focus({ preventScroll: true });
      if (!hadTabindex) main.removeAttribute('tabindex');
    }
    window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  });
  updateVisibility();
})();
