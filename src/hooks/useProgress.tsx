import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { emptyProgress, parseProgress, STORAGE_KEY } from '../lib/progress.mjs';
import { questionById, questions } from '../data/catalog';
import type { Attempt, Progress } from '../types';

const validIds = new Set(questionById.keys());
function readProgress(): Progress {
  try {
    return parseProgress(localStorage.getItem(STORAGE_KEY), validIds) as Progress;
  }
  catch {
    return emptyProgress() as Progress;
  }
}
function useProgressState() {
  const [progress, setProgress] = useState<Progress>(readProgress);
  const [storageAvailable, setStorageAvailable] = useState(true);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      setStorageAvailable(true);
    }
    catch {
      setStorageAvailable(false);
    }
  }, [progress]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        setProgress(readProgress());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const recordAttempt = useCallback((attempt: Attempt) => {
    setProgress((previous) => ({ ...previous, attempts: { ...previous.attempts, [attempt.questionId]: attempt } }));
  }, []);
  const toggleBookmark = useCallback((id: string) => {
    setProgress((previous) => ({ ...previous, bookmarks: previous.bookmarks.includes(id) ? previous.bookmarks.filter((item) => item !== id) : [...previous.bookmarks, id] }));
  }, []);
  const resetProgress = useCallback(() => setProgress(emptyProgress() as Progress), []);
  const stats = useMemo(() => {
    const attempts = Object.values(progress.attempts);
    const correct = attempts.filter((a) => a.correct).length;
    return { answered: attempts.length, correct, accuracy: attempts.length ? Math.round(correct / attempts.length * 100) : 0, completion: Math.round(attempts.length / questions.length * 100), toReview: attempts.filter((a) => !a.correct).map((a) => a.questionId) };
  }, [progress.attempts]);
  return useMemo(() => ({ progress, stats, storageAvailable, recordAttempt, toggleBookmark, resetProgress }), [progress, stats, storageAvailable, recordAttempt, toggleBookmark, resetProgress]);
}
const ProgressContext = createContext<ReturnType<typeof useProgressState> | null>(null);
export function ProgressProvider({ children }: {
  children: ReactNode;
}) {
  return <ProgressContext.Provider value={useProgressState()}>
    {children}
  </ProgressContext.Provider>;
}
export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context)
    throw new Error('useProgress deve ser usado dentro de ProgressProvider.');
  return context;
}
