/* Progressive reading layout: retain photo order, captions and existing ink frames. */
(() => {
  'use strict';
  // Shared assets also serve older public HTML whose scoped Astro CSS predates
  // the current thumbnail markup. Keep the fallback underneath the real photo.
  function initPreviews() {
    for (const image of document.querySelectorAll('.latest span.entry-thumb > img.entry-photo')) {
      const wrapper = image.parentElement;
      const update = () => {
        const ready = image.complete && image.naturalWidth > 0;
        image.hidden = image.complete && !ready;
        wrapper.toggleAttribute('data-preview-ready', ready);
      };
      update();
      image.addEventListener('load', update);
      image.addEventListener('error', update);
    }
  }
  function initCmsReading() {
    const content = document.querySelector('article > .article-body');
    if (!content || document.querySelector('.cms-reading-nav')) return;
    const article = content.parentElement;
    document.body.classList.add('cms-reading');
    const anchor = (element, stem) => {
      if (element.id) return element.id;
      let id = stem, suffix = 2;
      while (document.getElementById(id)) id = stem + '-' + suffix++;
      element.id = id;
      return id;
    };
    const href = element => '#' + encodeURIComponent(element.id);
    const link = (text, url, className = '') => {
      const a = document.createElement('a');
      a.textContent = text;
      a.href = url;
      a.className = className;
      return a;
    };
    anchor(content, 'reading-start');
    const nav = document.createElement('nav');
    nav.className = 'cms-reading-nav';
    nav.setAttribute('aria-label', '本篇閱讀導覽');
    const label = document.createElement('p');
    label.className = 'cms-reading-label';
    label.textContent = '本篇導覽';
    nav.append(label);
    const actions = document.createElement('div');
    actions.className = 'cms-reading-actions';
    actions.append(link('開始閱讀 ↓', href(content), 'cms-reading-primary'));
    const gallery = article.querySelector('.it-gallery');
    if (gallery) {
      anchor(gallery, 'reading-gallery');
      const count = gallery.querySelectorAll('figure').length;
      actions.append(link('照片集' + (count ? ' · ' + count + ' 張' : '') + ' ↓', href(gallery)));
    }
    const related = article.querySelector('.related');
    if (related) {
      anchor(related, 'reading-related');
      actions.append(link('延伸閱讀 ↓', href(related)));
    }
    nav.append(actions);
    const headings = [...content.querySelectorAll('h2')].filter(h => h.textContent.trim());
    if (headings.length > 1) {
      const details = document.createElement('details');
      details.open = true;
      const summary = document.createElement('summary');
      summary.textContent = '段落目錄';
      const list = document.createElement('ol');
      headings.forEach((heading, index) => {
        anchor(heading, 'reading-section-' + (index + 1));
        const item = document.createElement('li');
        item.append(link(heading.textContent.trim(), href(heading)));
        list.append(item);
      });
      details.append(summary, list);
      nav.append(details);
    }
    content.before(nav);
    const end = document.createElement('nav');
    end.className = 'cms-reading-end';
    end.setAttribute('aria-label', '讀完之後');
    const endLabel = document.createElement('p');
    endLabel.textContent = '故事讀完了，記憶還可以繼續。';
    end.append(endLabel, link('回到最新文章 ↗', '/#latest'), link('探索文章典藏 ↗', '/archive/'));
    article.append(end);
    // Existing inline links keep their destination and wording. The final
    // paragraph is promoted only when it is explicitly an extended-read link.
    const last = content.lastElementChild;
    if (last?.tagName === 'P' && /^延伸閱讀[：:]/u.test(last.textContent.trim())) {
      last.classList.add('cms-reading-reference');
    }
    if (gallery) {
      const intro = document.createElement('p');
      intro.className = 'cms-gallery-intro';
      intro.textContent = '把文字裡的片刻，留在照片中。';
      gallery.querySelector('h2')?.after(intro);
    }
  }
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
    initPreviews();
    initCmsReading();
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

