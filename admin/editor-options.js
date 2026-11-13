(() => {
  let scheduled = false;

  function addAdvancedOptions() {
    scheduled = false;

    // Match only the main edit pane of the two post collections. Keep Sveltia's
    // fields in their original DOM and data model so opening this control cannot
    // change a field value or interfere with the preview.
    if (!/^#\/collections\/(posts_html|posts)\/(?:entries\/|new(?:[?#]|$))/u.test(location.hash)) return;

    const title = document.querySelector('section[data-key-path="title"]');
    const fields = title?.parentElement;
    if (!fields?.querySelector(':scope > section[data-key-path="publication_mode"]')) return;
    const date = fields.querySelector(':scope > section[data-key-path="date"]');
    if (!date || fields.querySelector(':scope > .itigre-editor-options')) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'itigre-editor-options';
    button.textContent = '進階設定';
    button.setAttribute('aria-expanded', 'false');
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
    });
    fields.insertBefore(button, date);
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(addAdvancedOptions);
  }

  new MutationObserver(scheduleUpdate).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', scheduleUpdate);
  scheduleUpdate();
})();
