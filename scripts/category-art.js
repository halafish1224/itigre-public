// Shared by Astro, the static-page build and progressive reading-guide cards.
// These are decorative category marks, never substitutes for article photographs.
export function categoryFor(title = '', context = '') {
  const classify = value => {
    if (/三商|虎衣|藍絲帶|tigers|mercuries/iu.test(value)) return 'tigers';
    if (/旅行|旅程|筆記.*旅|東京|首爾|釜山|日本|韓國|travel|tokyo|seoul/iu.test(value)) return 'travel';
    if (/音樂|演唱會|現場|愛繆|aimyon|m2m|music|concert|live/iu.test(value)) return 'music';
    return '';
  };
  return classify(context) || classify(title) || 'archive';
}

const categories = {
  tigers: { paper: '#e3eaf2', ink: '#2455a4', accent: '#bc4b2d', icon: '<path d="m80 28 32 32-32 32-32-32Z"/><path d="M64 43q16 17 0 34m32-34q-16 17 0 34"/>' },
  travel: { paper: '#f1e6d5', ink: '#8b4823', accent: '#2455a4', icon: '<circle cx="80" cy="60" r="30"/><path d="m92 43-6 23-18 11 6-23Z"/><path d="M80 24v8m0 56v8M44 60h8m56 0h8"/>' },
  music: { paper: '#f1e0d9', ink: '#a73f2b', accent: '#2455a4', icon: '<circle cx="80" cy="60" r="31"/><circle cx="80" cy="60" r="19"/><circle cx="80" cy="60" r="5"/><path d="M56 39l7 6m34 30 7 6"/>' },
  archive: { paper: '#e6e7de', ink: '#4f594b', accent: '#bc4b2d', icon: '<path d="M54 40h52v48H54Z"/><path d="M61 40v-8h38v8M64 53h32M64 63h32M64 73h20"/>' },
};

export function categoryArtwork(category = 'archive') {
  const { paper, ink, accent, icon } = categories[category] || categories.archive;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" focusable="false" style="display:block;width:100%;height:100%" data-category="${categories[category] ? category : 'archive'}"><path fill="${paper}" d="M0 0h160v120H0Z"/><g fill="none" stroke="${ink}" stroke-width="1.5"><path opacity=".18" d="M12 12h136v96H12ZM20 100h120"/>${icon}</g><path fill="${accent}" d="M12 12h18v3H12ZM130 105h18v3h-18Z"/></svg>`;
}
