import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

function counterAssets(endpoint, d1Endpoint) {
  const target = d1Endpoint || endpoint;
  if (!target) return '';
  const url = new URL(target);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
    throw new Error('The reading counter endpoint must be a public HTTPS URL prefix.');
  }
  if (d1Endpoint && !url.pathname.endsWith('/v1/count')) {
    throw new Error('The D1 counter endpoint must end in /v1/count.');
  }
  const mode = d1Endpoint ? ' data-reading-counter-mode="d1"' : '';
  const safeUrl = url.href.replaceAll('&', '&amp;').replaceAll('"', '&quot;');
  return '<link rel="stylesheet" id="itigre-reading-count-css" href="/styles/reading-counter.css"><script id="itigre-reading-count-js" src="/styles/reading-counter.js" data-reading-counter-endpoint="' + safeUrl + '"' + mode + ' defer></script>';
}

export function addReadingCounter(
  html,
  endpoint = process.env.ITIGRE_READING_COUNTER_ENDPOINT,
  d1Endpoint = process.env.ITIGRE_READING_COUNTER_D1_ENDPOINT
) {
  const assets = counterAssets(endpoint, d1Endpoint);
  if (!assets || /http-equiv\s*=\s*["']?refresh\b/i.test(html) || html.includes('id="itigre-reading-count-js"')) return html;
  const clean = html
    .replace(/<style\b[^>]*\bid=["']itigre-page-counter-styles["'][^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script\b[^>]*\bid=["']itigre-page-counter-init["'][^>]*>[\s\S]*?<\/script>/gi, '');
  if (/<\/head\s*>/i.test(clean)) return clean.replace(/<\/head\s*>/i, assets + '$&');
  if (/<\/body\s*>/i.test(clean)) return clean.replace(/<\/body\s*>/i, assets + '$&');
  return clean + assets;
}

async function apply(directory, relative = '') {
  let changed = 0;
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const name = entry.name;
    if (name.startsWith('.') || (!relative && (name === 'admin' || name === '404.html'))) continue;
    const file = path.join(directory, name);
    if (entry.isDirectory()) changed += await apply(file, path.join(relative, name));
    else if (entry.isFile() && /\.html?$/i.test(name)) {
      const original = await readFile(file, 'utf8');
      const updated = addReadingCounter(original);
      if (updated !== original) {
        await writeFile(file, updated, 'utf8');
        changed++;
      }
    }
  }
  return changed;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  console.log('Reading counter added to', await apply(process.argv[2] || '.'), 'HTML pages');
}
