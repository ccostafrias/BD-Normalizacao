// Isolate current writers from older tabs that delete IDs they do not know.
// The data schema remains version 1; only the storage namespace changes.
export const STORAGE_KEY = 'forma.progress.v2';
export const LEGACY_STORAGE_KEY = 'forma.progress.v1';
export const emptyProgress = () => ({ version: 1, attempts: {}, bookmarks: [] });

/** Parse untrusted local storage without letting an older/malformed record break the app. */
export function parseProgress(raw, validIds) {
  if (!raw) return emptyProgress();
  try {
    const value = JSON.parse(raw);
    if (value.version !== 1 || !value.attempts || typeof value.attempts !== 'object') return emptyProgress();
    const attempts = {};
    for (const [id, attempt] of Object.entries(value.attempts)) {
      const a = /** @type {any} */ (attempt);
      if (validIds.has(id) && a && a.questionId === id && Array.isArray(a.selected) && a.selected.every((s) => typeof s === 'string') && typeof a.correct === 'boolean' && typeof a.hintUsed === 'boolean' && typeof a.timestamp === 'number' && Number.isFinite(a.timestamp)) attempts[id] = a;
    }
    const bookmarks = Array.isArray(value.bookmarks) ? [...new Set(value.bookmarks.filter((id) => typeof id === 'string' && validIds.has(id)))] : [];
    return { version: 1, attempts, bookmarks };
  } catch {
    return emptyProgress();
  }
}

/**
 * Persist only explicit user actions. Receiving a storage event must never
 * write a filtered snapshot back and erase another tab's answers.
 * @param {() => Pick<Storage, 'getItem' | 'setItem'>} getStorage
 * @param {Set<string>} validIds
 */
export function createProgressStore(getStorage, validIds) {
  const readInitial = () => {
    try {
      const storage = getStorage();
      return { progress: parseProgress(storage.getItem(STORAGE_KEY) ?? storage.getItem(LEGACY_STORAGE_KEY), validIds), storageAvailable: true };
    } catch {
      return { progress: emptyProgress(), storageAvailable: false };
    }
  };
  let snapshot = readInitial();
  const listeners = new Set();
  const publish = (progress, storageAvailable) => {
    snapshot = { progress, storageAvailable };
    listeners.forEach((listener) => listener());
  };
  const sync = () => {
    try {
      publish(parseProgress(getStorage().getItem(STORAGE_KEY), validIds), true);
    } catch {
      publish(snapshot.progress, false);
    }
  };
  const update = (change) => {
    let next;
    try {
      const storage = getStorage();
      const raw = storage.getItem(STORAGE_KEY);
      // Read the latest disk value before an action, even if this tab has not
      // received the other tab's storage event yet.
      const current = raw === null ? snapshot.progress : parseProgress(raw, validIds);
      next = change(current);
      storage.setItem(STORAGE_KEY, JSON.stringify(next));
      publish(next, true);
    } catch {
      publish(next ?? change(snapshot.progress), false);
    }
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    initialize() {
      try {
        const storage = getStorage();
        const raw = storage.getItem(STORAGE_KEY);
        if (raw === null) storage.setItem(STORAGE_KEY, JSON.stringify(snapshot.progress));
        else publish(parseProgress(raw, validIds), true);
      } catch {
        publish(snapshot.progress, false);
      }
    },
    sync,
    recordAttempt(attempt) {
      update((previous) => ({ ...previous, attempts: { ...previous.attempts, [attempt.questionId]: attempt } }));
    },
    toggleBookmark(id) {
      update((previous) => ({ ...previous, bookmarks: previous.bookmarks.includes(id) ? previous.bookmarks.filter((item) => item !== id) : [...previous.bookmarks, id] }));
    },
    resetProgress() { update(emptyProgress); },
  };
}
