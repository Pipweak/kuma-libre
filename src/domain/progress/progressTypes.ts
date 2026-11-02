import type {
  DirectionProgress,
  ProgressByEntry,
  QuizDirection,
  QuizQuestionPrompt,
} from '@/domain/quiz';

export type ReviewOutcome = 'correct' | 'incorrect' | 'skipped';

export type ReviewSubmission = {
  direction: QuizDirection;
  entryId: string;
  id: string;
  normalizedAnswer: string;
  promptSnapshot: QuizQuestionPrompt;
  responseTimeMs?: number;
  result: ReviewOutcome;
  submittedAnswer: string;
};

export type ReviewEvent = ReviewSubmission & {
  reviewedAt: string;
};

export type HistoryQuery = {
  direction?: QuizDirection;
  entryId?: string;
  limit?: number;
};

export type ProgressRepositoryErrorCode =
  'configuration' | 'history-failed' | 'invalid-response' | 'load-failed' | 'record-failed';

/** Error classification safe to expose through translated UI messages. */
export class ProgressRepositoryError extends Error {
  readonly code: ProgressRepositoryErrorCode;

  constructor(code: ProgressRepositoryErrorCode, options?: ErrorOptions) {
    super(code, options);
    this.name = 'ProgressRepositoryError';
    this.code = code;
  }
}

/** Persistence boundary for current mastery and immutable review history. */
export interface ProgressRepository {
  getHistory(options?: HistoryQuery): Promise<readonly ReviewEvent[]>;
  getProgress(): Promise<ProgressByEntry>;
  recordReview(review: ReviewSubmission): Promise<DirectionProgress>;
}
