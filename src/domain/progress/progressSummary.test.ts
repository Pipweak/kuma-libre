import { describe, expect, it } from 'vitest';

import type { ProgressByEntry } from '@/domain/quiz';

import { summarizeProgress } from './progressSummary';

describe('summarizeProgress', () => {
  it('counts green directions independently and requires both for overall mastery', () => {
    const progress: ProgressByEntry = {
      first: {
        comprehension: { correctCount: 3, incorrectCount: 0, score: 3 },
        production: { correctCount: 3, incorrectCount: 0, score: 3 },
      },
      second: {
        comprehension: { correctCount: 3, incorrectCount: 0, score: 3 },
        production: { correctCount: 2, incorrectCount: 0, score: 2 },
      },
      third: {
        production: { correctCount: 3, incorrectCount: 0, score: 3 },
      },
    };

    expect(summarizeProgress(['first', 'second', 'third', 'unseen'], progress)).toEqual({
      comprehension: { masteredCount: 2, percentage: 50, totalCount: 4 },
      overall: { masteredCount: 1, percentage: 25, totalCount: 4 },
      production: { masteredCount: 2, percentage: 50, totalCount: 4 },
    });
  });

  it('returns zeroed metrics for an empty scope', () => {
    expect(summarizeProgress([], {})).toEqual({
      comprehension: { masteredCount: 0, percentage: 0, totalCount: 0 },
      overall: { masteredCount: 0, percentage: 0, totalCount: 0 },
      production: { masteredCount: 0, percentage: 0, totalCount: 0 },
    });
  });

  it('rounds percentages to the nearest whole number', () => {
    const progress: ProgressByEntry = {
      mastered: {
        comprehension: { correctCount: 3, incorrectCount: 0, score: 3 },
      },
    };

    expect(
      summarizeProgress(['mastered', 'second', 'third'], progress).comprehension.percentage,
    ).toBe(33);
  });
});
