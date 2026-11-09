const photoLayoutStyle = '<link id="itigre-photo-layout-css" rel="stylesheet" href="/styles/photo-layout.css">';
const photoLayoutScript = '<script id="itigre-photo-layout-js" defer src="/scripts/photo-layout.js"></script>';
const stylesheet = '<link id="itigre-media-frame-css" rel="stylesheet" href="/styles/media-frame.css">';

export function addMediaFrames(html) {
  if (/http-equiv\s*=\s*["']?refresh\b/i.test(html)) return html;
  const clean = html.replace(
    /<style\b[^>]*\bid=["']itigre-handdrawn-media-styles["'][^>]*>[\s\S]*?<\/style>/gi,
    ''
  );
  const markup = (clean.includes('id="itigre-media-frame-css"') ? '' : stylesheet)
    + (clean.includes('id="itigre-photo-layout-css"') ? '' : photoLayoutStyle)
    + (clean.includes('id="itigre-photo-layout-js"') ? '' : photoLayoutScript);
  if (!markup) return clean;
  if (/<\/head\s*>/i.test(clean)) return clean.replace(/<\/head\s*>/i, markup + '$&');
  if (/<body\b/i.test(clean)) return clean.replace(/<body\b/i, markup + '$&');
  return clean;
}
