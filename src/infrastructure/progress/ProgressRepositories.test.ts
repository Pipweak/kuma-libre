import { describe, expect, it } from 'vitest';

import { ProgressRepositoryError, type ReviewSubmission } from '@/domain/progress';

import { InMemoryProgressRepository } from './InMemoryProgressRepository';
import { UnavailableProgressRepository } from './UnavailableProgressRepository';

const REVIEW: ReviewSubmission = {
  direction: 'comprehension',
  entryId: 'lesson-01-vocabulary-001',
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  normalizedAnswer: 'je',
  promptSnapshot: { kana: ['わたし'], kanji: ['私'], kind: 'japanese' },
  responseTimeMs: 800,
  result: 'correct',
  submittedAnswer: 'Je',
};

describe('InMemoryProgressRepository', () => {
  it('records direction-specific progress and immutable history', async () => {
    const repository = new InMemoryProgressRepository();

    await expect(repository.recordReview(REVIEW)).resolves.toMatchObject({ score: 1 });
    await expect(
      repository.recordReview({
        ...REVIEW,
        direction: 'production',
        id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      }),
    ).resolves.toMatchObject({ score: 1 });

    await expect(repository.getProgress()).resolves.toEqual({
      'lesson-01-vocabulary-001': {
        comprehension: { correctCount: 1, incorrectCount: 0, score: 1 },
        production: { correctCount: 1, incorrectCount: 0, score: 1 },
      },
    });
    await expect(repository.getHistory({ direction: 'comprehension', limit: 1 })).resolves.toEqual([
      expect.objectContaining({ id: REVIEW.id }),
    ]);
  });

  it('treats a retry as idempotent and rejects conflicting content', async () => {
    const repository = new InMemoryProgressRepository();

    await repository.recordReview(REVIEW);
    await expect(repository.recordReview(REVIEW)).resolves.toMatchObject({ score: 1 });
    await expect(
      repository.recordReview({ ...REVIEW, submittedAnswer: 'different' }),
    ).rejects.toMatchObject({ code: 'record-failed' });
    await expect(repository.getHistory()).resolves.toHaveLength(1);
  });
});

describe('UnavailableProgressRepository', () => {
  it('fails every persistence operation with a classified configuration error', async () => {
    const repository = new UnavailableProgressRepository();

    await expect(repository.getProgress()).rejects.toBeInstanceOf(ProgressRepositoryError);
    await expect(repository.getHistory()).rejects.toMatchObject({ code: 'configuration' });
    await expect(repository.recordReview(REVIEW)).rejects.toMatchObject({ code: 'configuration' });
  });
});
