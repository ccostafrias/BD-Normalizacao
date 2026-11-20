import { useMemo } from 'react';
import { modules, questionsByModule } from '../data/catalog';
import { useProgress } from './useProgress';

export function useLearningPath() {
  const { progress } = useProgress();
  return useMemo(() => {
    const overview = modules.map((module) => {
      const list = questionsByModule.get(module.id)!;
      return { module, count: list.length, answered: list.filter((q) => progress.attempts[q.id]).length, correct: list.filter((q) => progress.attempts[q.id]?.correct).length };
    });
    const recommended = overview.find((item) => item.answered < item.count) ?? overview[0];
    const nextQuestion = questionsByModule.get(recommended.module.id)!.find((q) => !progress.attempts[q.id]);
    return { overview, completed: overview.filter((item) => item.answered === item.count).length, recommended, continuePath: `/praticar/${recommended.module.id}${nextQuestion ? `?questao=${nextQuestion.id}` : ''}` };
  }, [progress.attempts]);
}
