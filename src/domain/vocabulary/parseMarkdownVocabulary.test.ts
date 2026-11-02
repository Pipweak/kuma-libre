import { describe, expect, it } from 'vitest';

import { parseMarkdownVocabularySource } from './parseMarkdownVocabulary';

describe('parseMarkdownVocabularySource', () => {
  it('parses the historical Japanese and reading columns with section categories', () => {
    const entries = parseMarkdownVocabularySource({
      content: `# Leçon 1

| Japonais | Lecture | Français | English | Maîtrise |
|---|---|---|---|---|
| 医者 | いしゃ | médecin, docteur | doctor | 🔴 À revoir |

## Expressions et conversation

| Japonais | Lecture | Français | English | Maîtrise |
|---|---|---|---|---|
| 初めまして。 | はじめまして | Enchanté | How do you do? | 🔴 À revoir |
`,
      file: 'lessons/lesson-01/vocabulary.md',
    });

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      categoryId: 'vocabulary',
      kana: ['いしゃ'],
      kanji: ['医者'],
      lessonNumber: 1,
      meanings: {
        en: ['doctor'],
        es: [],
        fr: ['médecin, docteur', 'médecin', 'docteur'],
      },
      romaji: ['isha'],
      sourceLine: 5,
    });
    expect(entries[1]).toMatchObject({
      categoryId: 'expressions',
      source: {
        file: 'lessons/lesson-01/vocabulary.md',
        section: 'Expressions et conversation',
      },
    });
  });

  it('expands optional Japanese notation and preserves verb group notes', () => {
    const entries = parseMarkdownVocabularySource({
      content: `# Lesson 17

| Kana (livre) | Kanji / écriture (livre) | English (livre) | Français (ajout) | Maîtrise |
|---|---|---|---|---|
| ［お］さけ | ［お］酒 | alcohol, Japanese rice wine | alcool, saké | 🔴 À revoir |
| おぼえます II | 覚えます | memorise | mémoriser | 🔴 À revoir |
| すいます［たばこを～］ | 吸います | smoke [a cigarette] | fumer [une cigarette] | 🔴 À revoir |
`,
      file: 'lessons/lesson-17/vocabulary.md',
    });

    expect(entries[0]).toMatchObject({
      kana: ['さけ', 'おさけ'],
      kanji: ['酒', 'お酒'],
      notes: ['お'],
      romaji: ['sake', 'osake'],
    });
    expect(entries[1]).toMatchObject({
      kana: ['おぼえます'],
      notes: ['verb-group:II'],
      romaji: ['oboemasu'],
    });
    expect(entries[2]?.kana).toEqual(['すいます']);
  });

  it('extracts inline readings and useful-words sections', () => {
    const entries = parseMarkdownVocabularySource({
      content: `# Lesson 6 — III. Useful Words and Information

### Transport

| Japanese (livre) | English (livre) | Français (ajout) | Maîtrise |
|---|---|---|---|
| 一番線（いちばんせん） | first platform | premier quai | 🔴 À revoir |
| ATM | cash machine | distributeur | 🔴 À revoir |
`,
      file: 'lessons/lesson-06/useful-words.md',
    });

    expect(entries[0]).toMatchObject({
      categoryId: 'useful-words',
      kana: ['いちばんせん'],
      kanji: ['一番線'],
      romaji: ['ichibansen'],
      source: {
        file: 'lessons/lesson-06/useful-words.md',
        section: 'Transport',
      },
    });
    expect(entries[1]).toMatchObject({ kana: [], kanji: [], romaji: ['ATM'] });
  });

  it('expands alternatives and optional parts inside an inline reading', () => {
    const entries = parseMarkdownVocabularySource({
      content: `| Japanese | English | Français | Español | Maîtrise |
|---|---|---|---|---|
| いい［お］天気ですね。（いい［お］てんきですね。） | nice weather | beau temps | buen tiempo | rouge |
| 故郷（ふるさと／こきょう） | home town | pays natal | tierra natal | rouge |
`,
      file: 'lessons/lesson-11/vocabulary.md',
    });

    expect(entries[0]).toMatchObject({
      kana: ['いいてんきですね。', 'いいおてんきですね。'],
      romaji: ['iitenkidesune', 'iiotenkidesune'],
    });
    expect(entries[1]).toMatchObject({
      kana: ['ふるさと', 'こきょう'],
      romaji: ['furusato', 'kokyou'],
    });
  });

  it('rejects unsupported columns and malformed table rows', () => {
    expect(() =>
      parseMarkdownVocabularySource({
        content: `| Inconnue | Français |
|---|---|
| 値 | valeur |
`,
        file: 'lessons/lesson-01/vocabulary.md',
      }),
    ).toThrow('colonne inconnue');

    expect(() =>
      parseMarkdownVocabularySource({
        content: `| Japonais | Français |
|---|---|
| 値 |
`,
        file: 'lessons/lesson-01/vocabulary.md',
      }),
    ).toThrow('cellule(s)');
  });

  it('rejects a source whose lesson number cannot be derived from its path', () => {
    expect(() =>
      parseMarkdownVocabularySource({
        content: '',
        file: 'lessons/vocabulary.md',
      }),
    ).toThrow('numéro de leçon');
  });
});
