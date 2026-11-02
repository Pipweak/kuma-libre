import { describe, expect, it } from 'vitest';

import { isQuizResultRouteState, isQuizRouteState } from './quizNavigation';

describe('quiz navigation guards', () => {
  it('accepts consistent route state and rejects stale sessions', () => {
    const question = {
      acceptedAnswers: ['yes'],
      categoryId: 'vocabulary',
      correction: {
        kana: ['はい'],
        kanji: [],
        meanings: { en: ['yes'], es: [], fr: ['oui'] },
        romaji: ['hai'],
      },
      direction: 'comprehension',
      entryId: 'lesson-01-vocabulary-001',
      lessonId: 'lesson-01',
      prompt: { kana: ['はい'], kanji: [], kind: 'japanese' },
    };

    expect(
      isQuizRouteState({
        session: { direction: 'comprehension', questions: [question], total: 1 },
      }),
    ).toBe(true);
    expect(isQuizRouteState(null)).toBe(false);
    expect(isQuizRouteState({ session: null })).toBe(false);
    expect(isQuizRouteState({ session: { direction: 'unknown', questions: [], total: 0 } })).toBe(
      false,
    );
    expect(
      isQuizRouteState({ session: { direction: 'production', questions: [], total: 1 } }),
    ).toBe(false);
  });

  it('accepts only mathematically consistent result summaries', () => {
    expect(isQuizResultRouteState({ correctCount: 2, incorrectCount: 1, total: 3 })).toBe(true);
    expect(isQuizResultRouteState({ correctCount: 2, incorrectCount: 1, total: 4 })).toBe(false);
    expect(isQuizResultRouteState({ correctCount: -1, incorrectCount: 1, total: 0 })).toBe(false);
    expect(isQuizResultRouteState(undefined)).toBe(false);
  });
});
