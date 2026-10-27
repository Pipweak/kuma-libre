import { applyReviewResult, type EntryProgress, type ProgressByEntry } from '@/domain/quiz';
import {
  ProgressRepositoryError,
  type HistoryQuery,
  type ProgressRepository,
  type ReviewEvent,
  type ReviewSubmission,
} from '@/domain/progress';

type RecordedReview = {
  event: ReviewEvent;
  progress: ReturnType<typeof applyReviewResult>['current'];
  signature: string;
};

function cloneProgress(progress: ProgressByEntry): ProgressByEntry {
  return Object.fromEntries(
    Object.entries(progress).map(([entryId, entryProgress]) => [
      entryId,
      Object.fromEntries(
        Object.entries(entryProgress).map(([direction, directionProgress]) => [
          direction,
          { ...directionProgress },
        ]),
      ) as EntryProgress,
    ]),
  );
}

/** Session-only repository used by tests and the explicit local preview. */
export class InMemoryProgressRepository implements ProgressRepository {
  private progress: ProgressByEntry;
  private readonly reviews = new Map<string, RecordedReview>();

  constructor(initialProgress: ProgressByEntry = {}) {
    this.progress = cloneProgress(initialProgress);
  }

  getHistory(options: HistoryQuery = {}): Promise<readonly ReviewEvent[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    const events = [...this.reviews.values()]
      .map(({ event }) => event)
      .filter(
        (event) =>
          (!options.entryId || event.entryId === options.entryId) &&
          (!options.direction || event.direction === options.direction),
      )
      .sort((left, right) => right.reviewedAt.localeCompare(left.reviewedAt))
      .slice(0, limit);

    return Promise.resolve(events);
  }

  getProgress(): Promise<ProgressByEntry> {
    return Promise.resolve(cloneProgress(this.progress));
  }

  recordReview(review: ReviewSubmission): Promise<ReturnType<typeof applyReviewResult>['current']> {
    const signature = JSON.stringify(review);
    const existing = this.reviews.get(review.id);

    if (existing) {
      if (existing.signature !== signature) {
        return Promise.reject(new ProgressRepositoryError('record-failed'));
      }

      return Promise.resolve({ ...existing.progress });
    }

    const previous = this.progress[review.entryId]?.[review.direction];
    const transition = applyReviewResult(previous, review.result === 'correct');
    this.progress = {
      ...this.progress,
      [review.entryId]: {
        ...this.progress[review.entryId],
        [review.direction]: transition.current,
      },
    };
    const event: ReviewEvent = {
      ...review,
      reviewedAt: new Date().toISOString(),
    };
    this.reviews.set(review.id, { event, progress: transition.current, signature });

    return Promise.resolve({ ...transition.current });
  }
}
