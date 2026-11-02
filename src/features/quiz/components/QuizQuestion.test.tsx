import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { QuizQuestion as QuizQuestionContract } from '@/domain/quiz';
import { QuizQuestion } from '@/features/quiz/components/QuizQuestion';
import { i18n } from '@/shared/i18n/i18n';

const CORRECTION = {
  kana: ['たべます'],
  kanji: ['食べます'],
  meanings: { en: ['eat'], es: ['comer'], fr: ['manger'] },
  romaji: ['tabemasu'],
};

describe('QuizQuestion', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('renders the selected locale meaning for a production question', () => {
    const question: QuizQuestionContract = {
      acceptedAnswers: ['tabemasu', 'たべます', '食べます'],
      categoryId: 'vocabulary',
      correction: CORRECTION,
      direction: 'production',
      entryId: 'entry-1',
      lessonId: 'lesson-06',
      prompt: { kind: 'meaning', locale: 'fr', text: 'manger' },
    };

    render(<QuizQuestion question={question} />);

    expect(screen.getByText('français')).toBeDefined();
    expect(screen.getByText('manger')).toBeDefined();
    expect(screen.getByText('Trouve le mot japonais')).toBeDefined();
  });

  it('does not duplicate a reading when the prompt already uses kana', () => {
    const question: QuizQuestionContract = {
      acceptedAnswers: ['tabemasu'],
      categoryId: 'vocabulary',
      correction: { ...CORRECTION, kanji: [] },
      direction: 'comprehension',
      entryId: 'entry-1',
      lessonId: 'lesson-06',
      prompt: { kana: ['たべます'], kanji: [], kind: 'japanese' },
    };

    render(<QuizQuestion question={question} />);

    expect(screen.getAllByText('たべます')).toHaveLength(1);
  });
});
