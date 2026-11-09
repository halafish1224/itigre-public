/* Progressive reading layout: retain photo order, captions and existing ink frames. */
(() => {
  'use strict';
  const excluded = 'nav,header,footer,aside,.cover,.itigre-tigers-cover,.tigers-illustration,.sport-visual,.ith-photo-window,.discovery-card,.home-story,[data-media-frame="off"],[data-photo-layout="off"],.itigre-photo-dialog';
  function photo(figure) {
    if (figure.tagName !== 'FIGURE' || figure.closest(excluded) || figure.querySelector('figure,video,iframe')) return null;
    const images = figure.querySelectorAll('img');
    if (images.length !== 1) return null;
    const image = images[0];
    const width = Number(image.getAttribute('width')) || image.naturalWidth;
    const height = Number(image.getAttribute('height')) || image.naturalHeight;
    if (width && height && width < 100 && height < 100) return null;
    if (image.matches('.icon,.emoji,[width="0"],[width="1"],[height="0"],[height="1"]')) return null;
    return image;
  }
  function ratio(image) {
    const width = Number(image.getAttribute('width')) || image.naturalWidth;
    const height = Number(image.getAttribute('height')) || image.naturalHeight;
    return width > 0 && height > 0 ? width / height : 1;
  }
  function orient(figure) {
    const image = photo(figure);
    if (!image) return;
    const value = ratio(image);
    figure.dataset.photoShape = value > 1.12 ? 'landscape' : value < .88 ? 'portrait' : 'square';
    const gallery = figure.parentElement;
    if (gallery?.classList.contains('itigre-photo-gallery')) {
      const figures = [...gallery.children].filter(child => child.classList.contains('itigre-reading-photo'));
      if (figures.length === 2) {
        const weights = figures.map(item => Math.max(.65, Math.min(1.8, ratio(photo(item)))));
        gallery.style.setProperty('--photo-columns', weights.map(value => 'minmax(0, ' + value.toFixed(3) + 'fr)').join(' '));
      }
      gallery.classList.toggle('itigre-photo-gallery--lead', figures.length % 2 === 1 && figures[0]?.dataset.photoShape === 'landscape');
    }
  }
  function init() {
    if (!document.querySelector('main') || document.body.classList.contains('itigre-home')) return;
    for (const image of document.querySelectorAll('main img')) {
      if (image.closest('figure') || image.closest(excluded) || image.matches('.icon,.emoji,[width="0"],[width="1"],[height="0"],[height="1"]')) continue;
      const size = () => {
        const width = Number(image.getAttribute('width')) || image.naturalWidth;
        const height = Number(image.getAttribute('height')) || image.naturalHeight;
        if (width && height && width < 100 && height < 100) return;
        if (ratio(image) <= 1.12) return;
        image.classList.add('itigre-wide-photo');
        image.closest('.itigre-photo-frame')?.classList.add('itigre-wide-photo-frame');
      };
      size();
      if (!image.complete) image.addEventListener('load', size, { once: true });
    }
    const figures = [...document.querySelectorAll('main figure')].filter(figure => photo(figure));
    for (const figure of figures) {
      figure.classList.add('itigre-reading-photo');
      orient(figure);
      const image = photo(figure);
      if (!image.complete) image.addEventListener('load', () => orient(figure), { once: true });
    }
    for (const first of figures) {
      if (first.closest('.itigre-photo-gallery')) continue;
      const run = [first];
      let cursor = first.nextSibling;
      while (cursor) {
        if (cursor.nodeType === 8 || (cursor.nodeType === 3 && !cursor.textContent.trim())) { cursor = cursor.nextSibling; continue; }
        if (cursor.nodeType === 1 && cursor.classList.contains('itigre-reading-photo')) { run.push(cursor); cursor = cursor.nextSibling; continue; }
        break;
      }
      if (run.length < 2) continue;
      const group = document.createElement('div');
      group.className = 'itigre-photo-gallery';
      group.dataset.photoCount = String(run.length);
      first.before(group);
      const end = run[run.length - 1].nextSibling;
      let node = first;
      while (node && node !== end) { const next = node.nextSibling; group.append(node); node = next; }
      for (const figure of run) orient(figure);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
