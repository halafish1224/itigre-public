import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import worker from '../src/index.js';
import { addReadingCounter } from '../../scripts/inject-reading-counter.mjs';

const migration = readFileSync(new URL('../migrations/0001_initial.sql', import.meta.url), 'utf8');

class MemoryD1 {
  constructor() {
    this.sqlite = new DatabaseSync(':memory:');
    this.sqlite.exec(migration);
  }

  prepare(sql) {
    const statement = this.sqlite.prepare(sql);
    const bind = (...params) => ({
      first: () => statement.get(...params),
      run: () => statement.run(...params),
      all: () => statement.all(...params),
      reads: statement.columns().length > 0,
    });
    return { first: () => bind().first(), bind };
  }

  async batch(statements) {
    this.sqlite.exec('BEGIN');
    try {
      const results = statements.map(statement => {
        if (statement.reads) return { results: statement.all() };
        statement.run();
        return { results: [] };
      });
      this.sqlite.exec('COMMIT');
      return results;
    } catch (error) {
      this.sqlite.exec('ROLLBACK');
      throw error;
    }
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
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS n FROM page_counts').get().n, 0);
});

test('health checks schema and expired tokens can be cleaned', async () => {
  const env = { DB: new MemoryD1() };
  assert.equal((await worker.fetch(new Request('https://counter.example/v1/health'), env)).status, 200);
  await worker.fetch(makePost(sessionA), env);
  env.DB.sqlite.exec('UPDATE page_sessions SET seen_at = 1');
  await worker.scheduled({}, env);
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS n FROM page_sessions').get().n, 0);
  assert.equal(env.DB.sqlite.prepare('SELECT view_count FROM page_counts').get().view_count, 1);
  env.DB.sqlite.exec('DROP TABLE page_sessions');
  assert.equal((await worker.fetch(new Request('https://counter.example/v1/health'), env)).status, 503);
});

test('a failed increment rolls back the session and a concurrent retry counts once', async () => {
  const env = { DB: new MemoryD1() };
  env.DB.sqlite.exec(`
    CREATE TRIGGER reject_increment BEFORE UPDATE ON page_counts
    BEGIN SELECT RAISE(ABORT, 'temporary write failure'); END;
  `);
  assert.equal((await worker.fetch(makePost(sessionA), env)).status, 503);
  assert.equal(env.DB.sqlite.prepare('SELECT COUNT(*) AS n FROM page_sessions').get().n, 0);
  env.DB.sqlite.exec('DROP TRIGGER reject_increment');

  const retries = await Promise.all([
    worker.fetch(makePost(sessionA), env),
    worker.fetch(makePost(sessionA), env),
  ]);
  assert.deepEqual(await Promise.all(retries.map(count)), [1, 1]);
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
