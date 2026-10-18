export { buildVocabularyCorpus, countEntriesByCategory, formatLessonId } from './buildCorpus';
export { VOCABULARY_CATEGORIES } from './corpusMetadata';
export { parseMarkdownVocabularySource } from './parseMarkdownVocabulary';
export { areSerializedCorporaEquivalent, serializeVocabularyCorpus } from './serializeCorpus';
export type {
  CorpusLocale,
  CorpusValidationIssue,
  CorpusValidationMode,
  LessonDefinition,
  LocalizedMeanings,
  MarkdownCorpusSource,
  ParsedVocabularyEntry,
  VocabularyCategoryDefinition,
  VocabularyCategoryId,
  VocabularyCorpus,
  VocabularyEntry,
  VocabularyEntrySource,
} from './corpusTypes';
export { validateVocabularyCorpus } from './validateCorpus';
