import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProgress } from '../src/lib/progress.mjs';
const ids = new Set(['q1']);
test('corrupt and unsupported progress recover with an empty record', () => {
  for (const raw of [null, '{', 'null', '{"version":2}', '{"version":1,"attempts":null}']) {
    assert.deepEqual(parseProgress(raw, ids), { version: 1, attempts: {}, bookmarks: [] });
  }
});
test('progress rejects stale question IDs and malformed attempts', () => {
  const attempt = { questionId: 'q1', selected: ['a'], correct: false, hintUsed: true, timestamp: 10 };
  const parsed = parseProgress(JSON.stringify({ version: 1, attempts: { q1: attempt, stale: { ...attempt, questionId: 'stale' } }, bookmarks: ['q1', 'q1', 'stale', null] }), ids);
  assert.deepEqual(parsed.attempts, { q1: attempt });
  assert.deepEqual(parsed.bookmarks, ['q1']);
});
