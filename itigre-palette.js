/* Daily cloth, matching reading colours, and restrained source-faithful emphasis. */
(() => {
  'use strict';
  if (window.itigreVisualSystem) return;
  const themes = ['shippo', 'seigaiha', 'ichimatsu', 'yagasuri', 'asanoha', 'tatewaku', 'shima'];
  const root = document.documentElement;
  let timer;
  function day(date = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }
  function apply(date = new Date()) {
    const stamp = day(date);
    const index = Math.floor(Date.parse(stamp + 'T00:00:00Z') / 86400000);
    const theme = themes[((index % themes.length) + themes.length) % themes.length];
    root.classList.add('itigre-skin');
    root.dataset.cloth = theme;
    root.dataset.pattern = theme;
    root.dataset.visualDay = stamp;
    if (document.readyState !== 'loading') requestAnimationFrame(readableContrast);
    // Always follow the same Taipei calendar day, even after an older manual
    // preference or with several tabs open. No switch or selector is created.
    return theme;
  }
  function schedule() {
    clearTimeout(timer);
    const now = Date.now();
    const next = Date.parse(day() + 'T00:00:00+08:00') + 86400000 + 80;
    timer = setTimeout(() => { apply(); schedule(); }, Math.max(1000, next - now));
  }
  function readableContrast() {
    if (!document.body) return;
    const rgba = value => {
      const parts = (value.match(/[\d.]+/gu) || []).map(Number);
      return parts.length >= 3 ? [parts[0], parts[1], parts[2], parts[3] ?? 1] : null;
    };
    const luminance = ([r, g, b]) => [r, g, b].reduce((sum, value, index) => {
      const channel = value / 255;
      const linear = channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
      return sum + linear * [.2126, .7152, .0722][index];
    }, 0);
    const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const composite = ([r, g, b, alpha], base) => [r, g, b].map((channel, i) => channel * alpha + base[i] * (1 - alpha));
    const elements = document.querySelectorAll('main :is(h1,h2,h3,h4,h5,h6,p,a,time,span,small,strong,b,em,i,mark,summary,button,figcaption,label,li,th,td,blockquote)');
    for (const el of document.querySelectorAll('main [data-reading-contrast]')) delete el.dataset.readingContrast;

    const styles = new WeakMap();
    const backgrounds = new WeakMap();
    const styleFor = el => {
      if (!styles.has(el)) styles.set(el, getComputedStyle(el));
      return styles.get(el);
    };
    const backgroundFor = el => {
      if (!el) return [255, 255, 255];
      if (!backgrounds.has(el)) {
        const fill = rgba(styleFor(el).backgroundColor);
        const background = fill?.[3] === 1 ? fill.slice(0, 3) : backgroundFor(el.parentElement);
        backgrounds.set(el, fill && fill[3] < 1 ? composite(fill, background) : background);
      }
      return backgrounds.get(el);
    };

    const fixes = [];
    for (const el of elements) {
      if (!el.getClientRects().length || el.closest('[aria-hidden="true"],.hero-mark,svg') ||
          ![...el.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) continue;
      const background = backgroundFor(el);
      const foreground = rgba(styleFor(el).color);
      if (!foreground) continue;
      const bg = luminance(background);
      if (ratio(bg, luminance(composite(foreground, background))) >= 4.5) continue;
      fixes.push([el, ratio(bg, 1) > ratio(bg, 0) ? 'light' : 'dark']);
    }
    for (const [el, ink] of fixes) el.dataset.readingContrast = ink;
  }
  function positionLegacyEditLink() {
    const link = document.querySelector('main .it-legacy-edit-link');
    const body = document.querySelector('main > article > :is(.article-body,.body)');
    if (!link || !body) return;
    const selector = 'p,li,blockquote,h2,h3,h4,h5,h6';
    const last = [...body.querySelectorAll(selector)].filter(el =>
      el.textContent.trim() && !el.querySelector(selector) && !el.closest('a,figure,nav,aside,footer')
    ).at(-1);
    (last || body).append(link);
  }
  function emphasize() {
    const containers = document.querySelectorAll('article > .article-body, article > .body, .journal-body, .post-body, .body-text');
    for (const container of containers) {
      if (container.dataset.emphasisReady) continue;
      container.dataset.emphasisReady = 'true';
      const titleWords = (document.querySelector('h1')?.textContent ?? '').match(/[\p{Script=Han}]{2,}|[a-zA-Z]{3,}/gu) ?? [];
      const candidates = [];
      for (const p of container.querySelectorAll('p')) {
        if (p.closest('nav,aside,footer,blockquote,.knowledge-notes,.it-knowledge-notes,code,pre,figure') || p.querySelector('mark,[data-no-highlight]')) continue;
        const strong = p.querySelector('strong,b');
        const walker = document.createTreeWalker(strong || p, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          if (node.parentElement.closest('a,code,pre,mark,script,style,button')) continue;
          const raw = node.textContent;
          const pieces = [...raw.matchAll(/[^。！？!?\n]+[。！？!?]?/gu)];
          const sentence = pieces.find(s => s[0].trim().length >= 18 && s[0].trim().length <= 100);
          if (!sentence) continue;
          const text = sentence[0];
          // Keep qualifiers in the sentence; never splice a claim out of its
          // caution, quotation or attribution to manufacture a new assertion.
          let score = strong ? 8 : 0;
          if (p.previousElementSibling?.matches('h2,h3')) score += 3;
          if (p === container.lastElementChild) score += 2;
          score += titleWords.filter(word => text.includes(word)).length;
          candidates.push({ node, start: sentence.index, length: text.length, score, p });
          break;
        }
      }
      const selected = candidates.sort((a, b) => b.score - a.score).slice(0, Math.min(3, Math.max(1, Math.floor(candidates.length / 5))));
      for (const { node, start, length } of selected) {
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + length);
        const mark = document.createElement('mark');
        mark.className = 'it-editorial-highlight';
        range.surroundContents(mark);
      }
    }
  }
  function init() {
    document.body.classList.add('it-visual-system');
    for (const control of document.querySelectorAll('.itigre-palette')) control.remove();
    positionLegacyEditLink();
    emphasize();
    for (const paragraph of document.querySelectorAll('.historical-takeaway')) {
      for (const node of [...paragraph.childNodes]) {
        if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim().length < 10) continue;
        const mark = document.createElement('mark');
        mark.className = 'it-editorial-highlight';
        node.replaceWith(mark); mark.append(node);
      }
    }
    const search = document.querySelector('#knowledge-tree-search');
    const tree = document.querySelector('.generated-tree-list');
    if (search && tree) {
      const entries = [...tree.querySelectorAll('li')];
      const initiallyOpen = new Map([...tree.querySelectorAll('details')].map(el => [el, el.open]));
      search.addEventListener('input', () => {
        const words = search.value.normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/u).filter(Boolean);
        let found = 0;
        for (const entry of entries) {
          const text = entry.textContent.normalize('NFKC').toLocaleLowerCase();
          entry.hidden = !words.every(word => text.includes(word));
          if (!entry.hidden) found++;
        }
        for (const branch of tree.querySelectorAll('.generated-branches section')) branch.hidden = ![...branch.querySelectorAll('li')].some(el => !el.hidden);
        for (const pillar of tree.querySelectorAll('details')) {
          pillar.hidden = ![...pillar.querySelectorAll('li')].some(el => !el.hidden);
          pillar.open = words.length ? !pillar.hidden : initiallyOpen.get(pillar);
        }
        document.querySelector('#knowledge-tree-search-status').textContent = words.length ? '找到 ' + found.toLocaleString('zh-Hant') + ' 篇文章' : '';
      });
    }
    readableContrast();
  }
  window.itigreVisualSystem = { apply, day, emphasize, readableContrast };
  apply();
  schedule();
  document.addEventListener('visibilitychange', () => { if (!document.hidden) { apply(); schedule(); } });
  window.addEventListener('pageshow', () => { apply(); schedule(); });
  document.addEventListener('toggle', event => { if (event.target instanceof HTMLDetailsElement && event.target.open) requestAnimationFrame(readableContrast); }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
