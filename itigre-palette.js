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
    const rgb = value => (value.match(/[\d.]+/gu) || []).slice(0, 3).map(Number);
    const luminance = values => values.map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum,v,i) => sum + v * [.2126,.7152,.0722][i], 0);
    const ratio = (a,b) => (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
    const fixes = [];
    for (const el of document.querySelectorAll('main :is(h1,h2,h3,h4,p,a,time,span,small,summary,button,figcaption,label,li)')) {
      if (!el.getClientRects().length || el.closest('[aria-hidden="true"],.hero-mark,svg') || ![...el.childNodes].some(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim())) continue;
      let at = el, background;
      while (at) {
        const value = getComputedStyle(at).backgroundColor;
        if (value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') { background = rgb(value); break; }
        at = at.parentElement;
      }
      if (!background) continue;
      const bg = luminance(background), fg = luminance(rgb(getComputedStyle(el).color));
      if (ratio(bg,fg) >= 4.5) continue;
      fixes.push([el,ratio(bg,luminance([255,253,247])) > ratio(bg,luminance([35,46,50])) ? 'light' : 'dark']);
    }
    for (const [el,ink] of fixes) el.dataset.readingContrast = ink;
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
