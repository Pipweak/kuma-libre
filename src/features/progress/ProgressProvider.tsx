import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactElement,
} from 'react';

import { EMPTY_DIRECTION_PROGRESS, type ProgressByEntry } from '@/domain/quiz';
import {
  ProgressRepositoryError,
  type ProgressRepository,
  type ProgressRepositoryErrorCode,
} from '@/domain/progress';
import { useAuth } from '@/features/auth/useAuth';
import {
  ProgressContext,
  type ProgressContextValue,
  type ProgressStatus,
} from '@/features/progress/ProgressContext';

export type ProgressProviderProps = PropsWithChildren<{
  repository: ProgressRepository;
}>;

function classifyError(
  error: unknown,
  fallback: ProgressRepositoryErrorCode,
): ProgressRepositoryErrorCode {
  return error instanceof ProgressRepositoryError ? error.code : fallback;
}

/** Loads the authenticated user's mastery once and synchronizes successful reviews in memory. */
export function ProgressProvider({ children, repository }: ProgressProviderProps): ReactElement {
  const { status: authStatus } = useAuth();
  const [progress, setProgress] = useState<ProgressByEntry>({});
  const [status, setStatus] = useState<ProgressStatus>('idle');
  const [errorCode, setErrorCode] = useState<ProgressRepositoryErrorCode | null>(null);
  const progressRef = useRef<ProgressByEntry>({});
  const loadVersionRef = useRef(0);

  const updateProgress = useCallback((nextProgress: ProgressByEntry): void => {
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  }, []);

  const reload = useCallback(async (): Promise<void> => {
    if (authStatus !== 'authenticated') {
      return;
    }

    const loadVersion = ++loadVersionRef.current;
    setStatus('loading');
    setErrorCode(null);

    try {
      const nextProgress = await repository.getProgress();

      if (loadVersion !== loadVersionRef.current) {
        return;
      }

      updateProgress(nextProgress);
      setStatus('ready');
    } catch (error) {
      if (loadVersion !== loadVersionRef.current) {
        return;
      }

      setErrorCode(classifyError(error, 'load-failed'));
      setStatus('error');
    }
  }, [authStatus, repository, updateProgress]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (authStatus === 'authenticated') {
        void reload();
        return;
      }

      loadVersionRef.current += 1;
      updateProgress({});
      setErrorCode(null);
      setStatus('idle');
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [authStatus, reload, updateProgress]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      errorCode,
      progress,
      recordReview: async (review) => {
        const previous =
          progressRef.current[review.entryId]?.[review.direction] ?? EMPTY_DIRECTION_PROGRESS;
        const current = await repository.recordReview(review);
        const nextProgress: ProgressByEntry = {
          ...progressRef.current,
          [review.entryId]: {
            ...progressRef.current[review.entryId],
            [review.direction]: current,
          },
        };
        updateProgress(nextProgress);

        return {
          current,
          isCorrect: review.result === 'correct',
          previous: { ...previous },
        };
      },
      reload,
      status,
    }),
    [errorCode, progress, reload, repository, status, updateProgress],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
