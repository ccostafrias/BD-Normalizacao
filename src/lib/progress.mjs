export const STORAGE_KEY = 'forma.progress.v1';
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
