const stylesheet = '<link id="itigre-media-frame-css" rel="stylesheet" href="/styles/media-frame.css">';

export function addMediaFrames(html) {
  if (/http-equiv\s*=\s*["']?refresh\b/i.test(html)) return html;
  const clean = html.replace(
    /<style\b[^>]*\bid=["']itigre-handdrawn-media-styles["'][^>]*>[\s\S]*?<\/style>/gi,
    ''
  );
  if (clean.includes('id="itigre-media-frame-css"')) return clean;
  if (/<\/head\s*>/i.test(clean)) return clean.replace(/<\/head\s*>/i, stylesheet + '$&');
  if (/<body\b/i.test(clean)) return clean.replace(/<body\b/i, stylesheet + '$&');
  return clean;
}
