import { createContext } from 'react';

import type { ProgressByEntry, ReviewTransition } from '@/domain/quiz';
import type { ProgressRepositoryErrorCode, ReviewSubmission } from '@/domain/progress';

export type ProgressStatus = 'error' | 'idle' | 'loading' | 'ready';

export type ProgressContextValue = {
  errorCode: ProgressRepositoryErrorCode | null;
  progress: ProgressByEntry;
  recordReview: (review: ReviewSubmission) => Promise<ReviewTransition>;
  reload: () => Promise<void>;
  status: ProgressStatus;
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);
