import { describe, expect, it } from 'vitest';

import type { QuizQuestion } from '@/domain/quiz';
import {
  getAnswerSpeechLanguage,
  getQuestionSpeechRequest,
  sanitizeSpeechText,
} from '@/features/speech/speechPresentation';

const JAPANESE_QUESTION: QuizQuestion = {
  acceptedAnswers: ['manger'],
  categoryId: 'vocabulary',
  correction: {
    kana: ['たべます'],
    kanji: ['食べます'],
    meanings: { en: ['eat'], es: ['comer'], fr: ['manger'] },
    romaji: ['tabemasu'],
  },
  direction: 'comprehension',
  entryId: 'entry-1',
  lessonId: 'lesson-06',
  prompt: { kana: ['たべます'], kanji: ['食べます'], kind: 'japanese' },
};

describe('speech presentation', () => {
  it('reads Japanese prompts from kana and removes study-only annotations', () => {
    expect(sanitizeSpeechText('～ たべます [polite]')).toBe('たべます');
    expect(getQuestionSpeechRequest(JAPANESE_QUESTION)).toEqual({
      language: 'ja-JP',
      text: 'たべます',
    });
  });

  it('uses the prompt locale for a meaning question', () => {
    expect(
      getQuestionSpeechRequest({
        ...JAPANESE_QUESTION,
        direction: 'production',
        prompt: { kind: 'meaning', locale: 'es', text: 'comer' },
      }),
    ).toEqual({ language: 'es-ES', text: 'comer' });
  });

  it('returns no request for an empty prompt', () => {
    expect(
      getQuestionSpeechRequest({
        ...JAPANESE_QUESTION,
        prompt: { kana: [], kanji: [], kind: 'japanese' },
      }),
    ).toBeNull();
  });

  it('selects recognition language from the expected answer', () => {
    expect(getAnswerSpeechLanguage(JAPANESE_QUESTION, 'fr')).toBe('fr-FR');
    expect(getAnswerSpeechLanguage({ ...JAPANESE_QUESTION, direction: 'production' }, 'en')).toBe(
      'ja-JP',
    );
  });
});
