import { describe, expect, it } from 'vitest';

import {
  applyReviewResult,
  deriveOverallMastery,
  EMPTY_DIRECTION_PROGRESS,
  getMasteryLevel,
} from './progress';
import type { DirectionProgress, MasteryScore } from './quizTypes';

function progress(score: MasteryScore): DirectionProgress {
  return { correctCount: 4, incorrectCount: 2, score };
}

describe('getMasteryLevel', () => {
  it.each([
    [0, 'red'],
    [1, 'yellow'],
    [2, 'yellow'],
    [3, 'green'],
  ] as const)('maps score %s to %s', (score, expected) => {
    expect(getMasteryLevel(score)).toBe(expected);
  });
});

describe('applyReviewResult', () => {
  it('starts missing progress at red and increments successes up to green', () => {
    const first = applyReviewResult(undefined, true);
    const second = applyReviewResult(first.current, true);
    const third = applyReviewResult(second.current, true);
    const fourth = applyReviewResult(third.current, true);

    expect(EMPTY_DIRECTION_PROGRESS).toEqual({ correctCount: 0, incorrectCount: 0, score: 0 });
    expect(first.current.score).toBe(1);
    expect(second.current.score).toBe(2);
    expect(third.current.score).toBe(3);
    expect(fourth.current.score).toBe(3);
    expect(fourth.current.correctCount).toBe(4);
  });

  it('only demotes an incorrect green score and restores it after one success', () => {
    for (const score of [0, 1, 2] as const) {
      expect(applyReviewResult(progress(score), false).current.score).toBe(score);
    }

    const demoted = applyReviewResult(progress(3), false);
    expect(demoted).toEqual({
      current: { correctCount: 4, incorrectCount: 3, score: 2 },
      isCorrect: false,
      previous: progress(3),
    });
    expect(applyReviewResult(demoted.current, true).current.score).toBe(3);
  });
});

describe('deriveOverallMastery', () => {
  it('uses the weaker direction and treats missing progress as red', () => {
    expect(deriveOverallMastery(progress(3), progress(2))).toEqual({
      level: 'yellow',
      score: 2,
    });
    expect(deriveOverallMastery(progress(3), progress(3))).toEqual({
      level: 'green',
      score: 3,
    });
    expect(deriveOverallMastery(progress(3), undefined)).toEqual({
      level: 'red',
      score: 0,
    });
    expect(deriveOverallMastery(undefined, progress(3))).toEqual({
      level: 'red',
      score: 0,
    });
  });
});
