import type { VocabularyCategoryDefinition } from './corpusTypes';

export const VOCABULARY_CATEGORIES = [
  {
    id: 'vocabulary',
    labels: { en: 'Vocabulary', es: 'Vocabulario', fr: 'Vocabulaire' },
    order: 1,
  },
  {
    id: 'expressions',
    labels: { en: 'Expressions', es: 'Expresiones', fr: 'Expressions' },
    order: 2,
  },
  {
    id: 'proper-nouns',
    labels: { en: 'Proper nouns', es: 'Nombres propios', fr: 'Noms propres' },
    order: 3,
  },
  {
    id: 'useful-words',
    labels: { en: 'Useful words', es: 'Palabras útiles', fr: 'Mots utiles' },
    order: 4,
  },
] as const satisfies ReadonlyArray<VocabularyCategoryDefinition>;
