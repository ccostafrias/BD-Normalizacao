import { useCallback, useMemo, useState } from 'react';
import { useProgress } from './useProgress';
import { evaluateAnswer } from '../lib/relational.mjs';
import type { Question } from '../types';

/** One question lifecycle. The view mounts a new instance with key={question.id}. */
export function useQuiz(question: Question) {
  const { progress, recordAttempt } = useProgress();
  const saved = progress.attempts[question.id];
  const [selected, setSelected] = useState<string[]>(() => saved?.selected ?? []);
  const [submitted, setSubmitted] = useState(() => Boolean(saved));
  const [hintVisible, setHintVisible] = useState(false);
  const [hintUsed, setHintUsed] = useState(() => saved?.hintUsed ?? false);
  const correct = useMemo(() => evaluateAnswer(selected, question.answer), [selected, question.answer]);
  const choose = useCallback((id: string) => {
    if (submitted)
      return;
    setSelected((previous) => question.type === 'choice' ? [id] : previous.includes(id) ? previous.filter((value) => value !== id) : [...previous, id]);
  }, [submitted, question.type]);
  const submit = useCallback(() => {
    if (!selected.length || submitted)
      return;
    setSubmitted(true);
    recordAttempt({ questionId: question.id, selected, correct, hintUsed, timestamp: Date.now() });
  }, [selected, submitted, recordAttempt, question.id, correct, hintUsed]);
  const revealHint = useCallback(() => { setHintVisible((visible) => !visible); setHintUsed(true); }, []);
  const retry = useCallback(() => { setSelected([]); setSubmitted(false); setHintVisible(false); setHintUsed(false); }, []);
  return { selected, submitted, correct, hintVisible, hintUsed, choose, submit, revealHint, retry };
}
