import { describe, expect, it } from 'vitest';

import type { VocabularyEntry } from '../vocabulary';
import { createQuizQuestion } from './createQuizQuestion';

const entry: VocabularyEntry = {
  categoryId: 'vocabulary',
  id: 'lesson-01-vocabulary-001',
  kana: ['いしゃ'],
  kanji: ['医者'],
  lessonId: 'lesson-01',
  meanings: {
    en: ['doctor', 'physician'],
    es: ['médico'],
    fr: ['médecin'],
  },
  romaji: ['isha'],
  source: { file: 'lessons/lesson-01/vocabulary.md' },
};

describe('createQuizQuestion', () => {
  it('builds a comprehension question accepting meanings from all three languages', () => {
    const question = createQuizQuestion(entry, 'comprehension', 'fr');

    expect(question?.prompt).toEqual({
      kana: ['いしゃ'],
      kanji: ['医者'],
      kind: 'japanese',
    });
    expect(question?.acceptedAnswers).toEqual(['médecin', 'doctor', 'physician', 'médico']);
  });

  it('builds a production question in the active locale with every declared Japanese form', () => {
    const question = createQuizQuestion(entry, 'production', 'es');

    expect(question?.prompt).toEqual({ kind: 'meaning', locale: 'es', text: 'médico' });
    expect(question?.acceptedAnswers).toEqual(['isha', 'いしゃ', '医者']);
    expect(question?.correction).toEqual({
      kana: ['いしゃ'],
      kanji: ['医者'],
      meanings: entry.meanings,
      romaji: ['isha'],
    });
  });

  it('does not build a question when the selected direction lacks required data', () => {
    const noMeanings = {
      ...entry,
      meanings: { en: [], es: [], fr: [] },
    } satisfies VocabularyEntry;
    const noJapaneseAnswer = {
      ...entry,
      kana: [],
      kanji: [],
      romaji: [],
    } satisfies VocabularyEntry;

    expect(createQuizQuestion(noMeanings, 'comprehension', 'fr')).toBeNull();
    expect(createQuizQuestion(noMeanings, 'production', 'fr')).toBeNull();
    expect(createQuizQuestion(noJapaneseAnswer, 'production', 'fr')).toBeNull();
  });

  it('deduplicates and trims accepted forms', () => {
    const duplicateEntry = {
      ...entry,
      meanings: { en: ['doctor', ' doctor '], es: ['médico'], fr: ['médecin'] },
    } satisfies VocabularyEntry;

    expect(createQuizQuestion(duplicateEntry, 'comprehension', 'fr')?.acceptedAnswers).toEqual([
      'médecin',
      'doctor',
      'médico',
    ]);
  });
});
