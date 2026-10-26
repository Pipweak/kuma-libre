import type { DirectionProgress, ProgressByEntry } from '@/domain/quiz';
import {
  ProgressRepositoryError,
  type HistoryQuery,
  type ProgressRepository,
  type ReviewEvent,
  type ReviewSubmission,
} from '@/domain/progress';

/** Safe failure adapter used when a production build lacks Supabase configuration. */
export class UnavailableProgressRepository implements ProgressRepository {
  getHistory(options?: HistoryQuery): Promise<readonly ReviewEvent[]> {
    void options;
    return Promise.reject(new ProgressRepositoryError('configuration'));
  }

  getProgress(): Promise<ProgressByEntry> {
    return Promise.reject(new ProgressRepositoryError('configuration'));
  }

  recordReview(review: ReviewSubmission): Promise<DirectionProgress> {
    void review;
    return Promise.reject(new ProgressRepositoryError('configuration'));
  }
}
