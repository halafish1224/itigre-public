/* Progressive thumbnails for reading-guide articles.
   Fetch only links that scroll into view; never fetch the whole archive. */
import { categoryFor, categoryArtwork } from './category-art.js';

(() => {
  'use strict';

  const site = location.origin;
  const articleRoots = new Set(['post', 'journal', '2014tigers', 'SUDADERA', '2023tigers', '2016OB', 'acts']);
  const containers = document.querySelectorAll('.reading-guide-body .guide-links, main > details > ul');
  const tasks = [];
  const cache = new Map();
  let running = 0;
  const limit = 4;

  function articleUrl(href) {
    try {
      const url = new URL(href, location.href);
      const segment = url.pathname.split('/').filter(Boolean)[0];
      return url.origin === site && articleRoots.has(segment) ? url : null;
    } catch { return null; }
  }

  function firstImage(doc, pageUrl) {
    const preview = doc.querySelector('meta[property="og:image"]')?.getAttribute('content');
    if (preview) {
      try {
        const url = new URL(preview, pageUrl);
        if (url.protocol === 'https:' && url.hostname === 'res.cloudinary.com') return url.href;
      } catch { /* Use the article image below when metadata is malformed. */ }
    }
    const root = doc.querySelector('article .journal-body, .journal-body, .post-body, .body-text, .entry-content, article, main');
    if (!root) return '';
    for (const img of root.querySelectorAll('img')) {
      if (img.closest('nav, header, footer, aside, .itg-guide-thumb, [data-media-frame="off"]')) continue;
      if (img.matches('.icon, .emoji') || Number(img.getAttribute('width')) === 1 || Number(img.getAttribute('height')) === 1) continue;
      const raw = img.getAttribute('src') || img.getAttribute('data-src') || img.getAttribute('data-original');
      if (!raw || /^(?:data|blob|javascript):/i.test(raw)) continue;
      try {
        const absolute = new URL(raw, pageUrl);
        if (/^https?:$/.test(absolute.protocol)) return absolute.href;
      } catch { /* Skip malformed image URL. */ }
    }
    return '';
  }

  function requestImage(pageUrl) {
    const key = pageUrl.pathname;
    if (!cache.has(key)) {
      cache.set(key, fetch(pageUrl.href, { credentials: 'same-origin', cache: 'force-cache' })
        .then(response => {
          if (!response.ok || !(response.headers.get('content-type') || '').includes('html')) return '';
          return response.text().then(html => firstImage(
            new DOMParser().parseFromString(html, 'text/html'),
            response.url || pageUrl.href
          ));
        }).catch(() => ''));
    }
    return cache.get(key);
  }

  function drain() {
    while (running < limit && tasks.length) {
      const task = tasks.shift();
      running++;
      requestImage(task.url).then(source => {
        if (!source || !task.thumb.isConnected || task.thumb.querySelector('img')) return;
        const image = document.createElement('img');
        image.src = source;
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.addEventListener('load', () => {
          task.thumb.classList.remove('itg-guide-thumb--empty', 'itg-guide-inline-thumb--empty');
          task.thumb.removeAttribute('aria-hidden');
          for (const node of task.thumb.querySelectorAll('svg, span')) node.remove();
          if (task.thumb.classList.contains('itg-guide-inline-thumb')) {
            task.thumb.textContent = '';
            task.thumb.append(image);
          }
        }, { once: true });
        image.addEventListener('error', () => { image.remove(); }, { once: true });
        if (task.thumb.classList.contains('itg-guide-inline-thumb')) {
          task.thumb.append(image);
        } else {
          task.thumb.append(image);
        }
      }).finally(() => { running--; drain(); });
    }
  }

  const observer = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        const url = articleUrl(entry.target.closest('a')?.getAttribute('href'));
        if (url) tasks.push({ url, thumb: entry.target });
      }
      drain();
    }, { rootMargin: '220px' })
    : null;

  function queue(thumb, url) {
    if (thumb.querySelector('img') || !url) return;
    if (observer) observer.observe(thumb);
    else { tasks.push({ url, thumb }); drain(); }
  }

  function decorate(anchor, small = false) {
    const url = articleUrl(anchor.getAttribute('href'));
    if (!url) return;
    const section = anchor.closest('.guide-topic, details');
    const context = section?.querySelector('h3, summary')?.textContent || '';
    const artwork = categoryArtwork(categoryFor(anchor.textContent, context));

    if (small) {
      if (anchor.classList.contains('itg-guide-inline')) {
        const old = anchor.querySelector('.itg-guide-inline-thumb');
        if (old) queue(old, url);
        return;
      }
      const thumb = document.createElement('span');
      thumb.className = 'itg-guide-inline-thumb itg-guide-inline-thumb--empty';
      thumb.innerHTML = artwork;
      thumb.setAttribute('aria-hidden', 'true');
      thumb.dataset.mediaFrame = 'off';
      thumb.dataset.photoLayout = 'off';
      anchor.classList.add('itg-guide-inline');
      anchor.prepend(thumb);
      queue(thumb, url);
      return;
    }

    if (anchor.classList.contains('itg-guide-card')) {
      queue(anchor.querySelector('.itg-guide-thumb'), url);
      return;
    }
    const thumb = document.createElement('span');
    thumb.className = 'itg-guide-thumb itg-guide-thumb--empty';
    thumb.setAttribute('aria-hidden', 'true');
    thumb.dataset.mediaFrame = 'off';
    thumb.dataset.photoLayout = 'off';
    thumb.innerHTML = artwork;
    const title = document.createElement('span');
    title.className = 'itg-guide-card-title';
    while (anchor.firstChild) title.append(anchor.firstChild);
    anchor.append(thumb, title);
    anchor.classList.add('itg-guide-card');
    anchor.closest('li')?.classList.add('itg-guide-item');
    queue(thumb, url);
  }

  for (const container of containers) {
    for (const item of container.querySelectorAll(':scope > li')) {
      const first = item.querySelector(':scope > a[href]');
      if (first) decorate(first);
      for (const extra of item.querySelectorAll(':scope > p a[href]')) decorate(extra, true);
    }
  }
})();
