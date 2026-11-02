import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  DirectionProgress,
  MasteryScore,
  ProgressByEntry,
  QuizDirection,
  QuizQuestionPrompt,
} from '@/domain/quiz';
import {
  ProgressRepositoryError,
  type HistoryQuery,
  type ProgressRepository,
  type ReviewEvent,
  type ReviewOutcome,
  type ReviewSubmission,
} from '@/domain/progress';

type DatabaseDirection = 'japanese_to_meaning' | 'meaning_to_japanese';

type ProgressRow = {
  correct_total: number;
  direction: DatabaseDirection;
  incorrect_total: number;
  mastery_score: MasteryScore;
  word_id: string;
};

type ReviewEventRow = {
  direction: DatabaseDirection;
  id: string;
  normalized_answer: string;
  prompt_snapshot: QuizQuestionPrompt;
  response_time_ms: number | null;
  result: ReviewOutcome;
  reviewed_at: string;
  submitted_answer: string;
  word_id: string;
};

const PROGRESS_COLUMNS = 'word_id,direction,mastery_score,correct_total,incorrect_total' as const;
const HISTORY_COLUMNS =
  'id,word_id,direction,prompt_snapshot,submitted_answer,normalized_answer,result,response_time_ms,reviewed_at' as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isDirection(value: unknown): value is DatabaseDirection {
  return value === 'japanese_to_meaning' || value === 'meaning_to_japanese';
}

function isMasteryScore(value: unknown): value is MasteryScore {
  return Number.isInteger(value) && typeof value === 'number' && value >= 0 && value <= 3;
}

function isReviewOutcome(value: unknown): value is ReviewOutcome {
  return value === 'correct' || value === 'incorrect' || value === 'skipped';
}

function parseProgressRow(value: unknown): ProgressRow {
  if (
    !isRecord(value) ||
    typeof value.word_id !== 'string' ||
    !isDirection(value.direction) ||
    !isMasteryScore(value.mastery_score) ||
    typeof value.correct_total !== 'number' ||
    typeof value.incorrect_total !== 'number'
  ) {
    throw new ProgressRepositoryError('invalid-response');
  }

  return {
    correct_total: value.correct_total,
    direction: value.direction,
    incorrect_total: value.incorrect_total,
    mastery_score: value.mastery_score,
    word_id: value.word_id,
  };
}

function parseReviewEventRow(value: unknown): ReviewEventRow {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.word_id !== 'string' ||
    !isDirection(value.direction) ||
    !isRecord(value.prompt_snapshot) ||
    typeof value.submitted_answer !== 'string' ||
    typeof value.normalized_answer !== 'string' ||
    !isReviewOutcome(value.result) ||
    (value.response_time_ms !== null && typeof value.response_time_ms !== 'number') ||
    typeof value.reviewed_at !== 'string'
  ) {
    throw new ProgressRepositoryError('invalid-response');
  }

  return {
    direction: value.direction,
    id: value.id,
    normalized_answer: value.normalized_answer,
    prompt_snapshot: value.prompt_snapshot as QuizQuestionPrompt,
    response_time_ms: value.response_time_ms,
    result: value.result,
    reviewed_at: value.reviewed_at,
    submitted_answer: value.submitted_answer,
    word_id: value.word_id,
  };
}

function toDatabaseDirection(direction: QuizDirection): DatabaseDirection {
  return direction === 'comprehension' ? 'japanese_to_meaning' : 'meaning_to_japanese';
}

function toQuizDirection(direction: DatabaseDirection): QuizDirection {
  return direction === 'japanese_to_meaning' ? 'comprehension' : 'production';
}

function toDirectionProgress(row: ProgressRow): DirectionProgress {
  return {
    correctCount: row.correct_total,
    incorrectCount: row.incorrect_total,
    score: row.mastery_score,
  };
}

/** Supabase adapter for RLS-protected progress reads and the atomic record_review RPC. */
export class SupabaseProgressRepository implements ProgressRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getHistory(options: HistoryQuery = {}): Promise<readonly ReviewEvent[]> {
    const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
    let query = this.client
      .from('review_events')
      .select(HISTORY_COLUMNS)
      .order('reviewed_at', { ascending: false })
      .limit(limit);

    if (options.entryId) {
      query = query.eq('word_id', options.entryId);
    }

    if (options.direction) {
      query = query.eq('direction', toDatabaseDirection(options.direction));
    }

    const { data, error } = await query;

    if (error) {
      throw new ProgressRepositoryError('history-failed', { cause: error });
    }

    if (!Array.isArray(data)) {
      throw new ProgressRepositoryError('invalid-response');
    }

    return data.map((value) => {
      const row = parseReviewEventRow(value);
      const event: ReviewEvent = {
        direction: toQuizDirection(row.direction),
        entryId: row.word_id,
        id: row.id,
        normalizedAnswer: row.normalized_answer,
        promptSnapshot: row.prompt_snapshot,
        result: row.result,
        reviewedAt: row.reviewed_at,
        submittedAnswer: row.submitted_answer,
      };

      if (row.response_time_ms !== null) {
        event.responseTimeMs = row.response_time_ms;
      }

      return event;
    });
  }

  async getProgress(): Promise<ProgressByEntry> {
    const { data, error } = await this.client.from('word_progress').select(PROGRESS_COLUMNS);

    if (error) {
      throw new ProgressRepositoryError('load-failed', { cause: error });
    }

    if (!Array.isArray(data)) {
      throw new ProgressRepositoryError('invalid-response');
    }

    return data.reduce<ProgressByEntry>((progress, value) => {
      const row = parseProgressRow(value);
      const direction = toQuizDirection(row.direction);

      return {
        ...progress,
        [row.word_id]: {
          ...progress[row.word_id],
          [direction]: toDirectionProgress(row),
        },
      };
    }, {});
  }

  async recordReview(review: ReviewSubmission): Promise<DirectionProgress> {
    const args = {
      p_direction: toDatabaseDirection(review.direction),
      p_normalized_answer: review.normalizedAnswer,
      p_prompt_snapshot: review.promptSnapshot,
      p_response_time_ms: review.responseTimeMs ?? null,
      p_result: review.result,
      p_review_id: review.id,
      p_submitted_answer: review.submittedAnswer,
      p_word_id: review.entryId,
    };
    const response = await this.client.rpc('record_review', args);

    if (response.error) {
      throw new ProgressRepositoryError('record-failed', { cause: response.error });
    }

    const data: unknown = response.data;
    const value: unknown = Array.isArray(data) ? data[0] : data;

    if (value === undefined || value === null) {
      throw new ProgressRepositoryError('invalid-response');
    }

    return toDirectionProgress(parseProgressRow(value));
  }
}
