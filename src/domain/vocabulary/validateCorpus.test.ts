import { describe, expect, it } from 'vitest';

import { buildVocabularyCorpus } from './buildCorpus';
import type { VocabularyCorpus } from './corpusTypes';
import { validateVocabularyCorpus } from './validateCorpus';

function createValidCorpus(): VocabularyCorpus {
  const corpus = buildVocabularyCorpus([
    {
      content: `| Kana | Kanji | English | Français | Español | Maîtrise |
|---|---|---|---|---|---|
| いしゃ | 医者 | doctor | médecin | médico | rouge |
`,
      file: 'lessons/lesson-01/vocabulary.md',
    },
  ]);
  return corpus;
}

describe('validateVocabularyCorpus', () => {
  it('accepts a structurally valid and quiz-ready corpus', () => {
    const corpus = createValidCorpus();

    expect(validateVocabularyCorpus(corpus)).toEqual([]);
    expect(validateVocabularyCorpus(corpus, 'quiz-ready')).toEqual([]);
  });

  it('reports referential, duplicate and missing-data problems', () => {
    const corpus = createValidCorpus();
    const entry = corpus.entries[0];
    if (!entry) throw new Error('Fixture entry missing.');

    corpus.lessons.push({ ...corpus.lessons[0]!, id: 'lesson-duplicate' });
    corpus.categories.push({ ...corpus.categories[0]! });
    corpus.entries.push({
      ...entry,
      categoryId: 'unknown' as 'vocabulary',
      id: entry.id,
      kana: [],
      kanji: [],
      lessonId: 'lesson-unknown',
      meanings: { en: [], es: [], fr: [] },
      romaji: [],
    });

    const codes = validateVocabularyCorpus(corpus, 'quiz-ready').map((issue) => issue.code);

    expect(codes).toContain('duplicate-lesson-number');
    expect(codes).toContain('duplicate-category-id');
    expect(codes).toContain('duplicate-entry-id');
    expect(codes).toContain('unknown-lesson');
    expect(codes).toContain('unknown-category');
    expect(codes).toContain('missing-japanese-form');
    expect(codes).toContain('empty-meaning');
    expect(codes).toContain('missing-romaji');
  });

  it('requires kana and romaji for a Japanese-script entry only in quiz-ready mode', () => {
    const corpus = createValidCorpus();
    const entry = corpus.entries[0];
    if (!entry) throw new Error('Fixture entry missing.');

    entry.kana = [];
    entry.romaji = [];

    expect(validateVocabularyCorpus(corpus, 'structural')).toEqual([]);
    expect(validateVocabularyCorpus(corpus, 'quiz-ready').map((issue) => issue.code)).toEqual([
      'missing-kana',
      'missing-romaji',
    ]);
  });
});
