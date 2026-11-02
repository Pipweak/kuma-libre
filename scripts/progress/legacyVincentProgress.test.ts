import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import {
  buildVincentProgressImport,
  findProgressImportConflicts,
  type StoredProgressRow,
} from './legacyVincentProgress';

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

describe('buildVincentProgressImport', () => {
  it('resolves every committed historical entry to one stable corpus id', () => {
    const rows = buildVincentProgressImport(
      readJson(join(REPOSITORY_ROOT, 'progress-vincent.json')),
      readJson(join(REPOSITORY_ROOT, 'src/generated/corpus.json')),
    );

    expect(rows).toHaveLength(153);
    expect(new Set(rows.map((row) => row.word_id)).size).toBe(153);
    expect(rows.filter((row) => row.mastery_score === 0)).toHaveLength(29);
    expect(rows.filter((row) => row.mastery_score === 1)).toHaveLength(124);
    expect(rows.filter((row) => row.mastery_score === 3)).toHaveLength(0);
    expect(rows.every((row) => row.direction === 'japanese_to_meaning')).toBe(true);
  });

  it('matches punctuation and parenthesized Japanese alternatives without relying on a category label', () => {
    const rows = buildVincentProgressImport(
      {
        direction: 'japanese_to_meaning',
        entries: {
          expression: legacyEntry('失礼ですが、', 'red'),
          restroom: legacyEntry('トイレ（お手洗い）', 'yellow'),
        },
        version: 2,
      },
      {
        entries: [
          corpusEntry('expression-id', ['しつれいですが'], ['失礼ですが']),
          corpusEntry('restroom-id', ['トイレ（おてあらい）', 'トイレ'], ['お手洗い']),
        ],
        schemaVersion: 1,
      },
    );

    expect(rows.map((row) => row.word_id)).toEqual(['expression-id', 'restroom-id']);
    expect(rows.map((row) => row.mastery_score)).toEqual([0, 1]);
  });

  it('fails instead of guessing when a historical entry cannot be resolved uniquely', () => {
    const legacy = {
      direction: 'japanese_to_meaning',
      entries: { missing: legacyEntry('不明', 'red') },
      version: 2,
    };

    expect(() => buildVincentProgressImport(legacy, { entries: [], schemaVersion: 1 })).toThrow(
      /aucune correspondance/u,
    );
  });

  it('fails instead of guessing between duplicate corpus candidates', () => {
    const legacy = {
      direction: 'japanese_to_meaning',
      entries: { duplicate: legacyEntry('同じ', 'yellow') },
      version: 2,
    };
    const corpus = {
      entries: [
        corpusEntry('duplicate-1', ['おなじ'], ['同じ']),
        corpusEntry('duplicate-2', ['おなじ'], ['同じ']),
      ],
      schemaVersion: 1,
    };

    expect(() => buildVincentProgressImport(legacy, corpus)).toThrow(/correspondance ambiguë/u);
  });
});

describe('findProgressImportConflicts', () => {
  const expected = {
    correct_total: 1,
    direction: 'japanese_to_meaning' as const,
    incorrect_total: 0,
    last_result: 'correct' as const,
    last_reviewed_at: '2026-10-15T00:00:00.000Z',
    mastery_score: 1 as const,
    word_id: 'word-1',
  };

  it('accepts an identical previous import even when PostgreSQL formats the timestamp differently', () => {
    const stored: StoredProgressRow = {
      ...expected,
      last_reviewed_at: '2026-10-15T00:00:00+00:00',
      user_id: 'user-1',
    };

    expect(findProgressImportConflicts([expected], [stored])).toEqual([]);
  });

  it('protects progress that differs from the historical snapshot', () => {
    const stored: StoredProgressRow = {
      ...expected,
      correct_total: 2,
      mastery_score: 2,
      user_id: 'user-1',
    };

    expect(findProgressImportConflicts([expected], [stored])).toEqual([stored]);
  });
});

function legacyEntry(
  japanese: string,
  status: 'red' | 'yellow',
): {
  correct_total: number;
  incorrect_total: number;
  japanese: string;
  last_result: 'correct' | 'incorrect';
  last_reviewed: string;
  source: string;
  status: 'red' | 'yellow';
} {
  return {
    correct_total: status === 'yellow' ? 1 : 0,
    incorrect_total: status === 'red' ? 1 : 0,
    japanese,
    last_result: status === 'yellow' ? 'correct' : 'incorrect',
    last_reviewed: '2026-10-15',
    source: 'lessons/lesson-01/vocabulary.md',
    status,
  };
}

function corpusEntry(
  id: string,
  kana: string[],
  kanji: string[],
): {
  categoryId: 'vocabulary';
  id: string;
  kana: string[];
  kanji: string[];
  lessonId: string;
  meanings: { en: string[]; es: string[]; fr: string[] };
  romaji: string[];
  source: { file: string };
} {
  return {
    categoryId: 'vocabulary',
    id,
    kana,
    kanji,
    lessonId: 'lesson-01',
    meanings: { en: ['meaning'], es: ['significado'], fr: ['sens'] },
    romaji: ['reading'],
    source: { file: 'lessons/lesson-01/vocabulary.md' },
  };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, 'utf8')) as unknown;
}
