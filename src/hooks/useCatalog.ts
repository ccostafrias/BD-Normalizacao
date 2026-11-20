import { useCallback, useDeferredValue, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { modules, questionsByModule } from '../data/catalog';
import { filterQuestions, readFilters } from '../lib/question-filters.mjs';
import { useProgress } from './useProgress';

export function useCatalog() {
  const { progress } = useProgress();
  const [params, setParams] = useSearchParams();
  const { search, difficulty, mode } = readFilters(params);
  const deferredSearch = useDeferredValue(search);
  const setFilter = useCallback((key: string, value: string) => {
    setParams((previous) => {
      const next = new URLSearchParams(previous);
      if (value)
        next.set(key, value);
      else
        next.delete(key);
      return next;
    }, { replace: true });
  }, [setParams]);
  const clearFilters = useCallback(() => setParams({}), [setParams]);
  const groups = useMemo(() => modules.map((module, index) => {
    const list = filterQuestions(questionsByModule.get(module.id)!, { difficulty, mode, search: deferredSearch }, progress, module.shortTitle);
    return {
      module,
      index,
      count: list.length,
      answered: list.filter((q) => progress.attempts[q.id]).length,
      correct: list.filter((q) => progress.attempts[q.id]?.correct).length,
    };
  }).filter((group) => group.count > 0), [difficulty, deferredSearch, mode, progress]);
  return { search, difficulty, mode, groups, queryString: params.toString(), setFilter, clearFilters };
}
