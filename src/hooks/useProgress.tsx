import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { createProgressStore, STORAGE_KEY } from '../lib/progress.mjs';
import { questionById, questions } from '../data/catalog';
import type { Progress } from '../types';

const validIds = new Set(questionById.keys());
function useProgressState() {
  const [store] = useState(() => createProgressStore(() => localStorage, validIds));
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const progress = snapshot.progress as Progress;
  const { storageAvailable } = snapshot;
  const { recordAttempt, toggleBookmark, resetProgress } = store;
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null)
        store.sync();
    };
    window.addEventListener('storage', sync);
    store.initialize();
    return () => window.removeEventListener('storage', sync);
  }, [store]);
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
