import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { modules, questionsByModule } from '../data/catalog';
import { useProgress } from './useProgress';
import { filterQuestions, readFilters } from '../lib/question-filters.mjs';

export function usePractice(moduleId: string) {
  const [params, setParams] = useSearchParams();
  const { progress } = useProgress();
  const module = modules.find((item) => item.id === moduleId);
  const all = questionsByModule.get(moduleId) ?? [];
  const { difficulty, mode, search } = readFilters(params);
  // Keep a snapshot so correcting a review question does not hide its solution.
  const [initialProgress] = useState(() => progress);
  const list = useMemo(() => filterQuestions(all, { difficulty, mode, search }, initialProgress, module?.shortTitle ?? ''), [all, difficulty, mode, initialProgress, search, module?.shortTitle]);
  const requested = params.get('questao');
  const question = list.find((q) => q.id === requested) ?? list[0];
  const index = question ? list.indexOf(question) : -1;
  const goTo = useCallback((id: string) => {
    setParams((previous) => { const next = new URLSearchParams(previous); next.set('questao', id); return next; });
  }, [setParams]);
  return { module, list, question, index, goTo };
}
