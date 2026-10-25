import { describe, expect, it } from 'vitest';

import type { VocabularyCategoryId, VocabularyEntry } from '../vocabulary';
import { buildQuickReviewSession, buildQuizSession } from './buildQuizSession';
import type { MasteryScore, ProgressByEntry, QuizDirection } from './quizTypes';

function entry(
  index: number,
  lessonId = 'lesson-01',
  categoryId: VocabularyCategoryId = 'vocabulary',
): VocabularyEntry {
  return {
    categoryId,
    id: `${lessonId}-${categoryId}-${String(index).padStart(3, '0')}`,
    kana: [`かな${index}`],
    kanji: [`漢字${index}`],
    lessonId,
    meanings: {
      en: [`meaning ${index}`],
      es: [`significado ${index}`],
      fr: [`sens ${index}`],
    },
    romaji: [`kana ${index}`],
    source: { file: `${lessonId}/${categoryId}.md` },
  };
}

function directionProgress(
  entries: readonly VocabularyEntry[],
  direction: QuizDirection,
  scores: readonly MasteryScore[],
): ProgressByEntry {
  return Object.fromEntries(
    entries.map((item, index) => [
      item.id,
      {
        [direction]: {
          correctCount: scores[index] ?? 0,
          incorrectCount: 0,
          score: scores[index] ?? 0,
        },
      },
    ]),
  );
}

describe('buildQuizSession', () => {
  const entries = [
    entry(1),
    entry(2),
    entry(3, 'lesson-02'),
    entry(4, 'lesson-01', 'useful-words'),
  ];

  it('filters by lesson, category and mastery for the selected direction', () => {
    const progress: ProgressByEntry = {
      [entries[0]!.id]: {
        comprehension: { correctCount: 0, incorrectCount: 0, score: 0 },
        production: { correctCount: 3, incorrectCount: 0, score: 3 },
      },
      [entries[1]!.id]: {
        comprehension: { correctCount: 1, incorrectCount: 0, score: 1 },
      },
    };

    const session = buildQuizSession(entries, progress, {
      categoryIds: ['vocabulary'],
      direction: 'comprehension',
      includedMasteryLevels: ['red'],
      lessonIds: ['lesson-01'],
      locale: 'fr',
      order: 'corpus',
    });

    expect(session.questions.map((question) => question.entryId)).toEqual([entries[0]!.id]);
    expect(session.total).toBe(1);
  });

  it('preserves corpus order or uses the supplied random source', () => {
    const config = {
      direction: 'comprehension',
      includedMasteryLevels: ['red'],
      lessonIds: ['lesson-01', 'lesson-02'],
      locale: 'fr',
      order: 'corpus',
    } as const;
    const corpusSession = buildQuizSession(entries, {}, config);
    const randomSession = buildQuizSession(entries, {}, { ...config, order: 'random' }, () => 0);

    expect(corpusSession.questions.map((question) => question.entryId)).toEqual(
      entries.map((item) => item.id),
    );
    expect(randomSession.questions.map((question) => question.entryId)).not.toEqual(
      entries.map((item) => item.id),
    );
    expect(new Set(randomSession.questions.map((question) => question.entryId)).size).toBe(4);
  });

  it('omits entries that cannot produce a valid question in the active locale', () => {
    const missingSpanish = {
      ...entry(5),
      meanings: { en: ['hello'], es: [], fr: ['bonjour'] },
    } satisfies VocabularyEntry;

    const session = buildQuizSession(
      [missingSpanish],
      {},
      {
        direction: 'production',
        includedMasteryLevels: ['red'],
        lessonIds: ['lesson-01'],
        locale: 'es',
        order: 'corpus',
      },
    );

    expect(session).toEqual({ direction: 'production', questions: [], total: 0 });
  });

  it('never repeats an entry when its source is accidentally duplicated', () => {
    const duplicated = entry(6);
    const session = buildQuizSession(
      [duplicated, duplicated],
      {},
      {
        direction: 'comprehension',
        includedMasteryLevels: ['red'],
        lessonIds: ['lesson-01'],
        locale: 'fr',
        order: 'corpus',
      },
    );

    expect(session.questions.map((question) => question.entryId)).toEqual([duplicated.id]);
  });
});

describe('buildQuickReviewSession', () => {
  it('takes at most ten red entries before yellow entries and never green entries', () => {
    const entries = Array.from({ length: 15 }, (_, index) => entry(index + 1));
    const progress = directionProgress(
      entries,
      'comprehension',
      [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 3, 3, 3],
    );

    const session = buildQuickReviewSession(
      entries,
      progress,
      { direction: 'comprehension', locale: 'fr' },
      () => 0,
    );

    expect(session.total).toBe(10);
    expect(
      session.questions.slice(0, 8).every((question) => {
        return progress[question.entryId]?.comprehension?.score === 0;
      }),
    ).toBe(true);
    expect(
      session.questions.slice(8).every((question) => {
        const score = progress[question.entryId]?.comprehension?.score;
        return score === 1 || score === 2;
      }),
    ).toBe(true);
    expect(
      session.questions.every((question) => {
        return progress[question.entryId]?.comprehension?.score !== 3;
      }),
    ).toBe(true);
  });

  it('returns a shorter session when fewer than ten red and yellow entries are eligible', () => {
    const entries = [
      entry(1),
      entry(2),
      entry(3),
      entry(4, 'lesson-02'),
      entry(5, 'lesson-01', 'expressions'),
    ];
    const progress = directionProgress(entries, 'production', [0, 2, 3, 0, 0]);

    const session = buildQuickReviewSession(entries, progress, {
      categoryIds: ['vocabulary'],
      direction: 'production',
      lessonIds: ['lesson-01'],
      locale: 'en',
    });

    expect(session.questions.map((question) => question.entryId)).toHaveLength(2);
    expect(session.questions.every((question) => question.lessonId === 'lesson-01')).toBe(true);
    expect(session.questions.every((question) => question.categoryId === 'vocabulary')).toBe(true);
  });

  it('fills the preset with question-ready entries when some production prompts are missing', () => {
    const missingSpanish = {
      ...entry(1),
      meanings: { en: ['one'], es: [], fr: ['un'] },
    } satisfies VocabularyEntry;
    const translatedEntries = Array.from({ length: 10 }, (_, index) => entry(index + 2));

    const session = buildQuickReviewSession(
      [missingSpanish, ...translatedEntries],
      {},
      { direction: 'production', locale: 'es' },
      () => 0,
    );

    expect(session.total).toBe(10);
    expect(session.questions.some((question) => question.entryId === missingSpanish.id)).toBe(
      false,
    );
  });

  it('does not repeat a duplicated entry in quick review', () => {
    const duplicated = entry(20);
    const session = buildQuickReviewSession(
      [duplicated, duplicated],
      {},
      { direction: 'comprehension', locale: 'fr' },
    );

    expect(session.questions.map((question) => question.entryId)).toEqual([duplicated.id]);
  });
});
