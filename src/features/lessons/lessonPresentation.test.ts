import { describe, expect, it } from 'vitest';

import type { VocabularyEntry } from '@/domain/vocabulary';

import {
  formatLessonNumber,
  getJapaneseReading,
  getLocalizedMeaning,
  getPrimaryJapaneseForm,
} from './lessonPresentation';

const entry: VocabularyEntry = {
  categoryId: 'vocabulary',
  id: 'lesson-01-vocabulary-001',
  kana: ['いしゃ'],
  kanji: ['医者'],
  lessonId: 'lesson-01',
  meanings: { en: ['doctor'], es: [], fr: ['médecin'] },
  romaji: ['isha'],
  source: { file: 'lesson.md' },
};

describe('lessonPresentation', () => {
  it('formats lesson numbers and Japanese forms without inventing content', () => {
    expect(formatLessonNumber(6)).toBe('06');
    expect(getPrimaryJapaneseForm(entry)).toBe('医者');
    expect(getJapaneseReading(entry)).toBe('いしゃ · isha');
    expect(getPrimaryJapaneseForm({ ...entry, kanji: [] })).toBe('いしゃ');
    expect(getJapaneseReading({ ...entry, kanji: [] })).toBe('isha');
    expect(getPrimaryJapaneseForm({ ...entry, kana: [], kanji: [] })).toBe('isha');
    expect(getPrimaryJapaneseForm({ ...entry, kana: [], kanji: [], romaji: [] })).toBe('');
  });

  it('returns only meanings declared for the requested locale', () => {
    expect(getLocalizedMeaning(entry, 'fr')).toBe('médecin');
    expect(getLocalizedMeaning(entry, 'es')).toBeNull();
  });
});
