import { useContext } from 'react';

import { ProgressContext, type ProgressContextValue } from '@/features/progress/ProgressContext';

export function useProgress(): ProgressContextValue {
  const context = useContext(ProgressContext);

  if (!context) {
    throw new Error('useProgress must be used inside ProgressProvider.');
  }

  return context;
}
