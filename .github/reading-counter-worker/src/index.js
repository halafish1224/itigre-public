// Independent, cookie-free per-page visit counter for itigre.com.
// This intentionally does not collect IP addresses or User-Agent values.
const ORIGINS = new Set(['https://itigre.com', 'https://www.itigre.com']);
const KEY = /^[0-9a-f]{32}$/;
const SESSION = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RETENTION_SECONDS = 7 * 86400;

function reply(body, status = 200, origin = '') {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'Vary': 'Origin',
  };
  if (ORIGINS.has(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    if (url.pathname === '/v1/health' && request.method === 'GET') {
      try {
        const schema = await env.DB.prepare(
          "SELECT COUNT(*) AS tables FROM sqlite_master WHERE type = 'table' AND name IN ('page_counts', 'page_sessions')"
        ).first();
        const ok = schema?.tables === 2;
        return reply({ ok }, ok ? 200 : 503, origin);
      } catch {
        return reply({ ok: false }, 503, origin);
      }
    }

    if (url.pathname !== '/v1/count') return reply({ error: 'not_found' }, 404, origin);

    if (request.method === 'OPTIONS') {
      if (!ORIGINS.has(origin)) return reply({ error: 'forbidden' }, 403);
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      });
    }

    if (request.method === 'GET') {
      const key = url.searchParams.get('key');
      if (!key || !KEY.test(key)) return reply({ error: 'invalid_key' }, 400, origin);
      try {
        const row = await env.DB.prepare(
          'SELECT view_count FROM page_counts WHERE page_key = ?'
        ).bind(key).first();
        return reply({ num: row?.view_count || 0 }, 200, origin);
      } catch {
        return reply({ error: 'unavailable' }, 503, origin);
      }
    }

    if (request.method !== 'POST') return reply({ error: 'method_not_allowed' }, 405, origin);
    // CORS is a browser guard, not authentication; counters remain approximate.
    if (!ORIGINS.has(origin)) return reply({ error: 'forbidden' }, 403);

    let data;
    try {
      const raw = await request.text();
      if (raw.length > 512) return reply({ error: 'invalid_body' }, 400, origin);
      data = JSON.parse(raw);
    } catch {
      return reply({ error: 'invalid_body' }, 400, origin);
    }

    const { pageKey, sessionId } = data || {};
    if (!KEY.test(pageKey || '') || !SESSION.test(sessionId || '')) {
      return reply({ error: 'invalid_body' }, 400, origin);
    }

    try {
      const now = Math.floor(Date.now() / 1000);
      // D1 executes the batch in one transaction. changes() refers to the
      // preceding session insert and is zero for an already counted session.
      const [, , , result] = await env.DB.batch([
        env.DB.prepare(
          'INSERT OR IGNORE INTO page_counts (page_key, view_count) VALUES (?, 0)'
        ).bind(pageKey),
        env.DB.prepare(
          'INSERT OR IGNORE INTO page_sessions (page_key, session_id, seen_at) VALUES (?, ?, ?)'
        ).bind(pageKey, sessionId, now),
        env.DB.prepare(
          'UPDATE page_counts SET view_count = view_count + 1, updated_at = CURRENT_TIMESTAMP WHERE page_key = ? AND changes() = 1'
        ).bind(pageKey),
        env.DB.prepare('SELECT view_count FROM page_counts WHERE page_key = ?').bind(pageKey),
      ]);
      const [row] = result.results;
      return reply({ num: row?.view_count || 0 }, 200, origin);
    } catch {
      return reply({ error: 'unavailable' }, 503, origin);
    }
  },

  async scheduled(_event, env) {
    // Remove old anonymous session tokens; lifetime counts stay in page_counts.
    await env.DB.prepare(
      'DELETE FROM page_sessions WHERE seen_at < ?'
    ).bind(Math.floor(Date.now() / 1000) - RETENTION_SECONDS).run();
  },
};
