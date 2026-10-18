export type CorpusLocale = 'en' | 'es' | 'fr';

export type VocabularyCategoryId = 'expressions' | 'proper-nouns' | 'useful-words' | 'vocabulary';

export type LocalizedMeanings = Record<CorpusLocale, string[]>;

export type LessonDefinition = {
  entryCount: number;
  id: string;
  number: number;
  order: number;
  titles?: Partial<Record<CorpusLocale, string>>;
};

export type VocabularyCategoryDefinition = {
  id: VocabularyCategoryId;
  labels: Record<CorpusLocale, string>;
  order: number;
};

export type VocabularyEntrySource = {
  file: string;
  section?: string;
};

export type VocabularyEntry = {
  categoryId: VocabularyCategoryId;
  id: string;
  kana: string[];
  kanji: string[];
  lessonId: string;
  meanings: LocalizedMeanings;
  notes?: string[];
  romaji: string[];
  source: VocabularyEntrySource;
};

export type VocabularyCorpus = {
  categories: VocabularyCategoryDefinition[];
  entries: VocabularyEntry[];
  lessons: LessonDefinition[];
  schemaVersion: 1;
};

export type MarkdownCorpusSource = {
  content: string;
  file: string;
};

export type ParsedVocabularyEntry = Omit<VocabularyEntry, 'id' | 'lessonId'> & {
  lessonNumber: number;
  sourceLine: number;
};

export type CorpusValidationIssueCode =
  | 'duplicate-category-id'
  | 'duplicate-entry-id'
  | 'duplicate-lesson-id'
  | 'duplicate-lesson-number'
  | 'empty-meaning'
  | 'missing-japanese-form'
  | 'missing-kana'
  | 'missing-romaji'
  | 'unknown-category'
  | 'unknown-lesson';

export type CorpusValidationIssue = {
  code: CorpusValidationIssueCode;
  entryId?: string;
  message: string;
};

export type CorpusValidationMode = 'quiz-ready' | 'structural';
