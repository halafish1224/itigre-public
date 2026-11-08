import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { addReadingCounter } from '../../scripts/inject-reading-counter.mjs';

class MemoryD1 {
  constructor() { this.counts = new Map(); this.sessions = new Map(); }
  prepare(sql) {
    const db = this;
    function first(params) {
      if (sql.includes('sqlite_master')) return Promise.resolve({ name: 'page_counts' });
      if (sql.includes('SELECT view_count')) {
        const n = db.counts.get(params[0]);
        return Promise.resolve(n === undefined ? null : { view_count: n });
      }
      throw new Error('Unexpected first: ' + sql);
    }
    function run(params) {
      if (sql.startsWith('INSERT OR IGNORE INTO page_counts')) {
        const had = db.counts.has(params[0]);
        if (!had) db.counts.set(params[0], 0);
        return Promise.resolve({ meta: { changes: had ? 0 : 1 } });
      }
      if (sql.startsWith('INSERT OR IGNORE INTO page_sessions')) {
        const [key, id, at] = params;
        const composite = key + ':' + id;
        const had = db.sessions.has(composite);
        if (!had) db.sessions.set(composite, at);
        return Promise.resolve({ meta: { changes: had ? 0 : 1 } });
      }
      if (sql.startsWith('UPDATE page_counts')) {
        const key = params[0];
        db.counts.set(key, db.counts.get(key) + 1);
        return Promise.resolve({ meta: { changes: 1 } });
      }
      if (sql.startsWith('DELETE FROM page_sessions')) {
        let removed = 0;
        for (const [key, at] of db.sessions) {
          if (at < params[0]) { db.sessions.delete(key); removed++; }
        }
        return Promise.resolve({ meta: { changes: removed } });
      }
      throw new Error('Unexpected run: ' + sql);
    }
    return {
      first: () => first([]),
      bind: (...params) => ({ first: () => first(params), run: () => run(params) }),
    };
  }
}

const pageKey = '0123456789abcdef0123456789abcdef';
const sessionA = '00000000-0000-4000-8000-000000000001';
const sessionB = '00000000-0000-4000-8000-000000000002';
function makePost(sessionId, origin = 'https://itigre.com', key = pageKey) {
  return new Request('https://counter.example/v1/count', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'text/plain' },
    body: JSON.stringify({ pageKey: key, sessionId }),
  });
}
async function count(response) {
  assert.equal(response.status, 200);
  return (await response.json()).num;
}

test('one visit per session, independent sessions increment', async () => {
  const env = { DB: new MemoryD1() };
  assert.equal(await count(await worker.fetch(makePost(sessionA), env)), 1);
  assert.equal(await count(await worker.fetch(makePost(sessionA), env)), 1);
  assert.equal(await count(await worker.fetch(makePost(sessionB), env)), 2);
  const response = await worker.fetch(new Request('https://counter.example/v1/count?key=' + pageKey), env);
  assert.equal(await count(response), 2);
});

test('separate pages use independent counters', async () => {
  const env = { DB: new MemoryD1() };
  const keyB = 'ffffffffffffffffffffffffffffffff';
  assert.equal(await count(await worker.fetch(makePost(sessionA), env)), 1);
  assert.equal(await count(await worker.fetch(makePost(sessionA, 'https://itigre.com', keyB), env)), 1);
});

test('invalid or foreign-origin POST is rejected', async () => {
  const env = { DB: new MemoryD1() };
  assert.equal((await worker.fetch(makePost(sessionA, 'https://untrusted.invalid'), env)).status, 403);
  assert.equal((await worker.fetch(makePost(sessionA, 'https://itigre.com', 'unsafe'), env)).status, 400);
  assert.equal((await worker.fetch(makePost('bad-session'), env)).status, 400);
  assert.equal(env.DB.counts.size, 0);
});

test('health checks schema and expired tokens can be cleaned', async () => {
  const env = { DB: new MemoryD1() };
  assert.equal((await worker.fetch(new Request('https://counter.example/v1/health'), env)).status, 200);
  await worker.fetch(makePost(sessionA), env);
  env.DB.sessions.set(pageKey + ':' + sessionA, 1);
  await worker.scheduled({}, env);
  assert.equal(env.DB.sessions.size, 0);
  assert.equal(env.DB.counts.get(pageKey), 1);
});

test('injector defaults to legacy but supports explicit opt-in', () => {
  const html = '<html><head></head><body>Story</body></html>';
  const fallback = addReadingCounter(html, 'https://count.getloli.com/record/@itigre-', '');
  assert.match(fallback, /data-reading-counter-endpoint="https:\/\/count.getloli.com\/record\/@itigre-"/);
  assert.doesNotMatch(fallback, /data-reading-counter-mode="d1"/);
  const upgraded = addReadingCounter(html, 'https://count.getloli.com/record/@itigre-', 'https://counter.example/v1/count');
  assert.match(upgraded, /data-reading-counter-mode="d1"/);
  assert.match(upgraded, /data-reading-counter-endpoint="https:\/\/counter.example\/v1\/count"/);
  assert.equal(addReadingCounter(upgraded, '', ''), upgraded);
});
