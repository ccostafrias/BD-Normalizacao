import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgressStore, emptyProgress, LEGACY_STORAGE_KEY, parseProgress, STORAGE_KEY } from '../src/lib/progress.mjs';
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

const attempt = (id, correct = true, timestamp = 10) => ({ questionId: id, selected: ['1'], correct, hintUsed: false, timestamp });
function memoryStorage(entries = []) {
  const values = new Map(entries);
  const writes = [];
  return { writes, getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { writes.push(key); values.set(key, value); } };
}
const currentIds = new Set(['q1', 'intro-fn', 'intro-celula']);

test('a legacy tab can reproduce the original loss by discarding newly added question IDs', () => {
  const raw = JSON.stringify({ version: 1, attempts: { 'intro-fn': attempt('intro-fn') }, bookmarks: [] });
  const olderTab = parseProgress(raw, ids);
  assert.equal(Object.keys(olderTab.attempts).length, 0);
  assert.equal(Object.keys(parseProgress(JSON.stringify(olderTab), currentIds).attempts).length, 0);
});

test('migration preserves existing correct, incorrect and bookmarked answers without changing legacy storage', () => {
  const old = { version: 1, attempts: { q1: attempt('q1'), 'intro-celula': attempt('intro-celula', false) }, bookmarks: ['intro-celula'] };
  const raw = JSON.stringify(old);
  const storage = memoryStorage([[LEGACY_STORAGE_KEY, raw]]);
  const store = createProgressStore(() => storage, currentIds);
  store.initialize();
  assert.deepEqual(store.getSnapshot().progress, old);
  assert.deepEqual(JSON.parse(storage.getItem(STORAGE_KEY)), old);
  assert.equal(storage.getItem(LEGACY_STORAGE_KEY), raw);
  // The old application overwrites only its own key after filtering the IDs.
  storage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(parseProgress(raw, ids)));
  store.sync();
  assert.deepEqual(store.getSnapshot().progress, old);
});

test('beginner correct and review answers persist before returning from the action and survive reload', () => {
  const storage = memoryStorage();
  const store = createProgressStore(() => storage, currentIds);
  store.initialize();
  store.recordAttempt(attempt('intro-fn'));
  store.recordAttempt(attempt('intro-celula', false));
  let reloaded = createProgressStore(() => storage, currentIds);
  assert.equal(Object.keys(reloaded.getSnapshot().progress.attempts).length, 2);
  assert.equal(reloaded.getSnapshot().progress.attempts['intro-fn'].correct, true);
  assert.equal(reloaded.getSnapshot().progress.attempts['intro-celula'].correct, false);
  store.recordAttempt(attempt('intro-celula', true, 20));
  reloaded = createProgressStore(() => storage, currentIds);
  assert.equal(Object.keys(reloaded.getSnapshot().progress.attempts).length, 2);
  assert.equal(reloaded.getSnapshot().progress.attempts['intro-celula'].correct, true);
});

test('receiving progress from another tab updates subscribers without writing back filtered data', () => {
  const storage = memoryStorage();
  const current = createProgressStore(() => storage, currentIds);
  current.initialize();
  const olderCatalog = createProgressStore(() => storage, ids);
  let notifications = 0;
  const unsubscribe = olderCatalog.subscribe(() => { notifications++; });
  current.recordAttempt(attempt('intro-fn'));
  const before = storage.writes.length;
  olderCatalog.sync();
  assert.equal(notifications, 1);
  assert.equal(storage.writes.length, before);
  current.sync();
  assert.equal(current.getSnapshot().progress.attempts['intro-fn'].correct, true);
  unsubscribe();
  olderCatalog.sync();
  assert.equal(notifications, 1);
});

test('two tabs keep both answers even before a storage event has been delivered', () => {
  const storage = memoryStorage();
  const first = createProgressStore(() => storage, currentIds);
  first.initialize();
  const second = createProgressStore(() => storage, currentIds);
  second.initialize();
  first.recordAttempt(attempt('intro-fn'));
  second.recordAttempt(attempt('intro-celula', false));
  first.sync();
  assert.deepEqual(Object.keys(first.getSnapshot().progress.attempts).sort(), ['intro-celula', 'intro-fn']);
  first.toggleBookmark('intro-fn');
  second.toggleBookmark('intro-celula');
  first.sync();
  assert.deepEqual(first.getSnapshot().progress.bookmarks.sort(), ['intro-celula', 'intro-fn']);
});

test('reset synchronizes across tabs and does not restore the legacy progress on reload', () => {
  const storage = memoryStorage([[LEGACY_STORAGE_KEY, JSON.stringify({ ...emptyProgress(), attempts: { q1: attempt('q1') } })]]);
  const first = createProgressStore(() => storage, currentIds);
  first.initialize();
  const second = createProgressStore(() => storage, currentIds);
  second.resetProgress();
  first.sync();
  assert.deepEqual(first.getSnapshot().progress, emptyProgress());
  assert.deepEqual(createProgressStore(() => storage, currentIds).getSnapshot().progress, emptyProgress());
});

test('unavailable storage still counts correct and review answers in memory and reports the limitation', () => {
  const store = createProgressStore(() => { throw new Error('Storage disabled'); }, currentIds);
  store.initialize();
  store.recordAttempt(attempt('intro-fn'));
  store.recordAttempt(attempt('intro-celula', false));
  assert.equal(store.getSnapshot().storageAvailable, false);
  assert.equal(Object.keys(store.getSnapshot().progress.attempts).length, 2);
  assert.equal(store.getSnapshot().progress.attempts['intro-celula'].correct, false);
});
