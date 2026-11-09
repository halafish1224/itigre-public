(() => {
  'use strict';
  const marker = 'itigre-reading-count';
  const endpoint = document.currentScript?.dataset.readingCounterEndpoint;
  const d1Mode = document.currentScript?.dataset.readingCounterMode === 'd1';
  if (!endpoint || !globalThis.crypto?.subtle || document.querySelector('.' + marker)) return;

  function edge(element) {
    const style = getComputedStyle(element);
    return ['Top', 'Bottom']
      .map(side => ({
        element, side,
        width: parseFloat(style['border' + side + 'Width']) || 0,
        color: style['border' + side + 'Color'],
        visible: !['none', 'hidden'].includes(style['border' + side + 'Style'])
      }))
      .filter(line => line.visible && line.width > 0)
      .sort((a, b) => b.width - a.width)[0];
  }

  function selectLine(heading) {
    const selectors = [
      '.tigers-featured', '.tigers-feature > header', '.roster-hero', '.itigre-masthead',
      '.site-intro', '.ith-header', 'main > header', 'article > header', 'main', 'article',
      'main > section', 'main > nav'
    ];
    for (const selector of selectors) {
      for (const element of document.querySelectorAll(selector)) {
        const bounds = element.getBoundingClientRect();
        if (bounds.width < 120 || bounds.height === 0) continue;
        const line = edge(element);
        if (line && line.width >= 2) return line;
      }
    }
    const parent = heading?.parentElement || document.querySelector('main') || document.body;
    if (!parent) return null;
    const line = document.createElement('div');
    line.className = 'itigre-reading-rule';
    if (heading) parent.insertBefore(line, heading);
    else parent.prepend(line);
    return { element: line, side: 'Top', fallback: true };
  }

  function accent(heading) {
    const style = getComputedStyle(heading || document.documentElement);
    for (const token of ['--cloth-deep', '--tigers-blue', '--accent', '--blue']) {
      const color = style.getPropertyValue(token).trim();
      if (color && CSS.supports('color', color)) return color;
    }
    const link = document.querySelector('main a[href], article a[href], a[href]');
    return link ? getComputedStyle(link).color : style.color;
  }

  function paper(element) {
    for (let node = element; node; node = node.parentElement) {
      const color = getComputedStyle(node).backgroundColor;
      if (color && color !== 'transparent' && !/^rgba\([^)]*,\s*0(?:\.0+)?\)$/u.test(color)) return color;
    }
    return '#fffdf7';
  }

  function pageKey() {
    let path = location.pathname.replace(/\/index\.html$/i, '/');
    try { path = decodeURIComponent(path); } catch {}
    const parts = path.split('/').filter(Boolean);
    return ('/' + parts.join('/')).normalize('NFC');
  }

  const heading = document.querySelector('main h1, article h1, h1');
  const line = selectLine(heading);
  if (!line) return;
  const { element, side } = line;
  element.classList.add('itigre-reading-count-anchor');
  if (getComputedStyle(element).position === 'static') element.classList.add('itigre-reading-count-relative');
  const count = document.createElement('span');
  count.className = marker + ' ' + marker + '--' + side.toLowerCase();
  count.hidden = true;
  element.append(count);

  function syncPalette() {
    const color = line.fallback ? accent(heading) : getComputedStyle(element)['border' + side + 'Color'];
    if (line.fallback) element.style.setProperty('--reading-rule-color', color);
    count.style.setProperty('--reading-count-color', color);
    count.style.setProperty('--reading-count-paper', paper(side === 'Bottom' ? element : element.parentElement));
  }
  syncPalette();
  const observer = new MutationObserver(syncPalette);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'style', 'data-cloth', 'data-pattern', 'data-theme']
  });
  window.addEventListener('resize', syncPalette, { passive: true });

  crypto.subtle.digest('SHA-256', new TextEncoder().encode('itigre.com' + pageKey()))
    .then(digest => {
      const key = Array.from(new Uint8Array(digest).slice(0, 16), byte => byte.toString(16).padStart(2, '0')).join('');
      if (!d1Mode) {
        return fetch(endpoint + key, {
          credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store'
        });
      }

      // One anonymous, page-specific visit ID per browser tab. No cookies or IP storage.
      const storageKey = 'itigre-reading-session:' + key;
      let sessionId;
      try {
        sessionId = sessionStorage.getItem(storageKey);
        if (!sessionId) {
          sessionId = crypto.randomUUID();
          sessionStorage.setItem(storageKey, sessionId);
        }
      } catch {
        sessionId = crypto.randomUUID();
      }
      return fetch(endpoint, {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
        cache: 'no-store',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ pageKey: key, sessionId })
      });
    })
    .then(response => {
      if (!response.ok) throw new Error('Counter unavailable');
      return response.json();
    })
    .then(({ num: value }) => {
      if (!Number.isSafeInteger(value) || value < 0) return;
      count.textContent = new Intl.NumberFormat('zh-TW').format(value);
      count.setAttribute('aria-label', '本頁累計瀏覽 ' + count.textContent + ' 次');
      count.hidden = false;
    })
    .catch(() => {
      // The article remains readable when the counter service is unavailable.
    });
})();
