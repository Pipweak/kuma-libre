import { describe, expect, it } from 'vitest';

import { buildVocabularyCorpus, countEntriesByCategory, formatLessonId } from './buildCorpus';

const SOURCE_HEADER = `| Kana | Kanji | English | Français | Maîtrise |
|---|---|---|---|---|`;

describe('buildVocabularyCorpus', () => {
  it('builds deterministic lesson, category and entry identifiers', () => {
    const corpus = buildVocabularyCorpus([
      {
        content: `${SOURCE_HEADER}
| に | 二 | two | deux | rouge |
`,
        file: 'lessons/lesson-02/vocabulary.md',
      },
      {
        content: `${SOURCE_HEADER}
| いち | 一 | one | un | rouge |

## Noms propres

| Japanese | English | Français | Maîtrise |
|---|---|---|---|
| トキオ | Tokio | Tokio | rouge |
`,
        file: 'lessons/lesson-01/vocabulary.md',
      },
    ]);

    expect(corpus.schemaVersion).toBe(1);
    expect(corpus.lessons).toEqual([
      { entryCount: 2, id: 'lesson-01', number: 1, order: 1 },
      { entryCount: 1, id: 'lesson-02', number: 2, order: 2 },
    ]);
    expect(corpus.entries.map((entry) => entry.id)).toEqual([
      'lesson-01-vocabulary-001',
      'lesson-01-proper-nouns-001',
      'lesson-02-vocabulary-001',
    ]);
    expect(countEntriesByCategory(corpus)).toEqual({
      expressions: 0,
      'proper-nouns': 1,
      'useful-words': 0,
      vocabulary: 2,
    });
  });

  it('formats lesson identifiers with a minimum of two digits', () => {
    expect(formatLessonId(3)).toBe('lesson-03');
    expect(formatLessonId(125)).toBe('lesson-125');
  });

  it('orders the main vocabulary before additional lesson sources deterministically', () => {
    const corpus = buildVocabularyCorpus([
      {
        content: `${SOURCE_HEADER}
| えき | 駅 | station | gare | rouge |
`,
        file: 'lessons/lesson-06/useful-words.md',
      },
      {
        content: `${SOURCE_HEADER}
| たべます | 食べます | eat | manger | rouge |
`,
        file: 'lessons/lesson-06/vocabulary.md',
      },
    ]);

    expect(corpus.entries.map((entry) => entry.categoryId)).toEqual(['vocabulary', 'useful-words']);
  });
});
