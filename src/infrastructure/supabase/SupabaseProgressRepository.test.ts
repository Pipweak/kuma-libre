import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { ReviewSubmission } from '@/domain/progress';

import { SupabaseProgressRepository } from './SupabaseProgressRepository';

const REVIEW: ReviewSubmission = {
  direction: 'comprehension',
  entryId: 'lesson-01-vocabulary-001',
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  normalizedAnswer: 'je',
  promptSnapshot: { kana: ['わたし'], kanji: ['私'], kind: 'japanese' },
  responseTimeMs: 900,
  result: 'correct',
  submittedAnswer: 'Je',
};

type QueryResult = { data: unknown; error: unknown };

function createThenableQuery(result: QueryResult): Record<string, unknown> {
  const query: Record<string, unknown> = {};
  query['eq'] = vi.fn(() => query);
  query['limit'] = vi.fn(() => query);
  query['order'] = vi.fn(() => query);
  query['then'] = (
    onFulfilled: (value: QueryResult) => unknown,
    onRejected?: (reason: unknown) => unknown,
  ) => Promise.resolve(result).then(onFulfilled, onRejected);
  return query;
}

function asClient(value: unknown): SupabaseClient {
  return value as SupabaseClient;
}

describe('SupabaseProgressRepository', () => {
  it('maps progress rows by entry and direction', async () => {
    const select = vi.fn().mockResolvedValue({
      data: [
        {
          correct_total: 3,
          direction: 'japanese_to_meaning',
          incorrect_total: 1,
          mastery_score: 2,
          word_id: REVIEW.entryId,
        },
        {
          correct_total: 1,
          direction: 'meaning_to_japanese',
          incorrect_total: 0,
          mastery_score: 1,
          word_id: REVIEW.entryId,
        },
      ],
      error: null,
    });
    const repository = new SupabaseProgressRepository(
      asClient({ from: vi.fn(() => ({ select })) }),
    );

    await expect(repository.getProgress()).resolves.toEqual({
      [REVIEW.entryId]: {
        comprehension: { correctCount: 3, incorrectCount: 1, score: 2 },
        production: { correctCount: 1, incorrectCount: 0, score: 1 },
      },
    });
  });

  it('records a review through the atomic RPC', async () => {
    const rpc = vi.fn().mockResolvedValue({
      data: [
        {
          correct_total: 1,
          direction: 'japanese_to_meaning',
          incorrect_total: 0,
          mastery_score: 1,
          word_id: REVIEW.entryId,
        },
      ],
      error: null,
    });
    const repository = new SupabaseProgressRepository(asClient({ rpc }));

    await expect(repository.recordReview(REVIEW)).resolves.toEqual({
      correctCount: 1,
      incorrectCount: 0,
      score: 1,
    });
    expect(rpc).toHaveBeenCalledWith(
      'record_review',
      expect.objectContaining({
        p_direction: 'japanese_to_meaning',
        p_result: 'correct',
        p_review_id: REVIEW.id,
        p_word_id: REVIEW.entryId,
      }),
    );
  });

  it('maps filtered history and optional response time', async () => {
    const query = createThenableQuery({
      data: [
        {
          direction: 'japanese_to_meaning',
          id: REVIEW.id,
          normalized_answer: 'je',
          prompt_snapshot: REVIEW.promptSnapshot,
          response_time_ms: null,
          result: 'correct',
          reviewed_at: '2026-10-26T12:00:00.000Z',
          submitted_answer: 'Je',
          word_id: REVIEW.entryId,
        },
      ],
      error: null,
    });
    const repository = new SupabaseProgressRepository(
      asClient({ from: vi.fn(() => ({ select: vi.fn(() => query) })) }),
    );

    await expect(
      repository.getHistory({ direction: 'comprehension', entryId: REVIEW.entryId, limit: 500 }),
    ).resolves.toEqual([
      {
        direction: 'comprehension',
        entryId: REVIEW.entryId,
        id: REVIEW.id,
        normalizedAnswer: 'je',
        promptSnapshot: REVIEW.promptSnapshot,
        result: 'correct',
        reviewedAt: '2026-10-26T12:00:00.000Z',
        submittedAnswer: 'Je',
      },
    ]);
    expect(query['limit']).toHaveBeenCalledWith(100);
    expect(query['eq']).toHaveBeenCalledTimes(2);
  });

  it('classifies provider failures and malformed responses', async () => {
    const loadFailure = new SupabaseProgressRepository(
      asClient({
        from: vi.fn(() => ({
          select: vi.fn().mockResolvedValue({ data: null, error: new Error('private') }),
        })),
      }),
    );
    const invalidRpc = new SupabaseProgressRepository(
      asClient({ rpc: vi.fn().mockResolvedValue({ data: [], error: null }) }),
    );
    const rpcFailure = new SupabaseProgressRepository(
      asClient({ rpc: vi.fn().mockResolvedValue({ data: null, error: new Error('private') }) }),
    );

    await expect(loadFailure.getProgress()).rejects.toMatchObject({ code: 'load-failed' });
    await expect(invalidRpc.recordReview(REVIEW)).rejects.toMatchObject({
      code: 'invalid-response',
    });
    await expect(rpcFailure.recordReview(REVIEW)).rejects.toMatchObject({
      code: 'record-failed',
    });
  });
});
