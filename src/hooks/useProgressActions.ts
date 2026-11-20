import { useCallback } from 'react';
import { useProgress } from './useProgress';

export function useProgressActions() {
  const { progress } = useProgress();
  const exportProgress = useCallback(() => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(progress, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'forma-progresso.json';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [progress]);
  return { exportProgress };
}
